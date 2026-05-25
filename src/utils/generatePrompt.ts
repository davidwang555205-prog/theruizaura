import type {
  AgeRange,
  AtmosphereParams,
  OutfitRecommendation,
  ProductParams,
  PromptOutput,
  PromptSection,
  SceneBlock
} from "../types";
import {
  AGE_BODY_SUPPLEMENTS,
  AGE_PROMPTS,
  ATMOSPHERE_NEGATIVE_CONTROL,
  BODY_PROPORTION_CONTROL,
  BRAND_RULE,
  CAMERA_CONTROL,
  CUSTOMER_FEELING_CORE,
  FACIAL_EXPRESSION_CONTROL,
  FACE_HIDDEN_MIRROR_SELFIE_CONTROL,
  FOOT_SHOE_FIT_CONTROL,
  FULL_BODY_MIRROR_SELFIE_CONTROL,
  FULL_SHOE_VISIBILITY_MIRROR_SELFIE,
  HOTEL_BACKGROUND_ORDER_CONTROL,
  HOTEL_LIGHTING_REFINEMENT_CONTROL,
  HOTEL_MIRROR_SELFIE_ANTI_CHEAPNESS_CONTROL,
  HOTEL_MIRROR_SELFIE_MOOD_CONTROL,
  HOTEL_SPACE_SELECTION_CONTROL,
  HUMAN_PROPORTION_CONTROL,
  MATURE_CUSTOMER_LIFESTYLE_CONTROL,
  MIRROR_COMPOSITION_AND_PROPORTION_CONTROL,
  MIRROR_SELFIE_BASE_CONTROL,
  MIRROR_SELFIE_EXPRESSION_DE_EMPHASIS,
  MULTI_IMAGE_CONSISTENCY_CONTROL,
  NEGATIVE_CONTROL,
  NON_PRODUCT_ATMOSPHERE_CONTROL,
  ON_FOOT_PROPORTION_CONTROL,
  OUTFIT_AND_SHOE_MIRROR_EMPHASIS,
  PHONE_HAND_REALISM_CONTROL,
  PRODUCT_ACCURACY_CONTROL,
  SEATED_BODY_PROPORTION_CONTROL,
  SEATED_MIRROR_COMPOSITION_CONTROL,
  SEATED_MIRROR_SELFIE_CONTROL,
  SHOE_EMPHASIS_SEATED_MIRROR_SELFIE,
  SHOE_READABILITY_THREE_QUARTER_MIRROR_SELFIE,
  SHOELACE_ANTI_CLIPPING_CONTROL,
  THREE_QUARTER_MIRROR_PROPORTION_CONTROL,
  THREE_QUARTER_MIRROR_SELFIE_CONTROL,
  UNIFIED_CONTROL_PROMPT
} from "../data/promptBlocks";
import {
  ACTION_OPTIONS,
  AUTO_ACTION_BY_SCENE,
  BASIC_SCENE_BLOCKS,
  DEFAULT_THREE_SCENES,
  MIRROR_SELFIE_ACTION_ENGLISH,
  MIRROR_SELFIE_ACTIONS,
  THREE_SCENE_PRIORITY_BY_AGE
} from "../data/sceneBlocks";
import {
  MATURE_AUTO_ACTION_BY_SCENE,
  MATURE_SCENE_BLOCKS
} from "../data/matureLifestyleScenes";
import { ATMOSPHERE_SCENES } from "../data/lifestyleAtmosphereScenes";
import {
  BRAND_MATCHED_OUTFIT_DIRECTION,
  SEASON_LABELS,
  SEASONAL_OUTFIT_LIBRARY
} from "../data/seasonalOutfits";
import {
  getSingleImageOutfit,
  getUnifiedOutfitForThreeImageSet
} from "../data/outfitMatrix";

export const ALL_SCENE_BLOCKS = [...BASIC_SCENE_BLOCKS, ...MATURE_SCENE_BLOCKS];

const wornActionKeywords = [
  "穿",
  "走",
  "坐",
  "系鞋带",
  "半穿鞋",
  "整理裤脚",
  "下车动作",
  "推门出门",
  "拿包准备出门",
  "牵小朋友手",
  MIRROR_SELFIE_ACTIONS.full,
  MIRROR_SELFIE_ACTIONS.threeQuarter,
  MIRROR_SELFIE_ACTIONS.seated
];

const shoelaceActionKeywords = [
  "系鞋带",
  "半穿鞋",
  "坐在床边穿鞋",
  "坐在沙发边",
  "touching laces",
  "tying shoelaces",
  "adjusting shoelaces"
];

const matureAgeRanges: AgeRange[] = ["30-45", "40-55"];

function compactJoin(parts: Array<string | undefined | false>, separator = "\n\n") {
  return parts.filter(Boolean).join(separator);
}

function findScene(sceneId: string): SceneBlock {
  return ALL_SCENE_BLOCKS.find((scene) => scene.id === sceneId) ?? ALL_SCENE_BLOCKS[0];
}

function uniqueSceneIds(sceneIds: string[]) {
  return Array.from(new Set(sceneIds.filter(Boolean)));
}

function resolveShoe(params: ProductParams) {
  return params.shoe === "自定义"
    ? params.customShoe.trim() || "custom THERUIZ AURA sneaker"
    : params.shoe;
}

function resolveMaterial(params: ProductParams) {
  return params.material === "自定义"
    ? params.customMaterial.trim() || "custom material"
    : params.material;
}

function completeThreeScenes(selectedScenes: string[], ageRange: AgeRange) {
  const selected = uniqueSceneIds(selectedScenes).slice(0, 3);
  const priority = THREE_SCENE_PRIORITY_BY_AGE[ageRange] ?? DEFAULT_THREE_SCENES;
  const merged = [...selected];

  [...priority, ...DEFAULT_THREE_SCENES].forEach((sceneId) => {
    if (merged.length < 3 && !merged.includes(sceneId)) {
      merged.push(sceneId);
    }
  });

  return merged.slice(0, 3);
}

function resolveSelectedScenes(params: ProductParams) {
  if (params.generationMode === "three") {
    return completeThreeScenes(params.scenes, params.ageRange);
  }

  return [params.scenes[0] || "01"];
}

function resolveActionsForScene(sceneId: string, selectedAction: string) {
  if (selectedAction !== "自动匹配") return [selectedAction];

  return (
    MATURE_AUTO_ACTION_BY_SCENE[sceneId] ??
    AUTO_ACTION_BY_SCENE[sceneId] ??
    ["慢走一步"]
  );
}

function isKnownManualAction(action: string) {
  return ACTION_OPTIONS.includes(action);
}

function shouldUseModelControls(params: ProductParams, sceneIds: string[]) {
  if (params.people === "shoe-only") return false;
  if (params.people === "model") return true;
  return !sceneIds.every((sceneId) => sceneId === "07");
}

function hasMatureTrigger(params: ProductParams, sceneIds: string[]) {
  return (
    matureAgeRanges.includes(params.ageRange) ||
    sceneIds.some((sceneId) => findScene(sceneId).category === "mature")
  );
}

function shouldUseFootFitControl(sceneIds: string[], actionLines: string[]) {
  const sceneTriggers = ["01", "04", "06", "08", "12", "15", "16"];
  const actionText = actionLines.join(" ");
  return (
    sceneIds.some((sceneId) => sceneTriggers.includes(sceneId)) ||
    wornActionKeywords.some((keyword) => actionText.includes(keyword)) ||
    isMirrorSelfieAction(actionText)
  );
}

function shouldUseShoelaceControl(actionLines: string[]) {
  const actionText = actionLines.join(" ");
  return (
    shoelaceActionKeywords.some((keyword) => actionText.includes(keyword)) ||
    isMirrorSelfieAction(actionText)
  );
}

function isMirrorSelfieAction(action: string) {
  return Object.values(MIRROR_SELFIE_ACTIONS).some((mirrorAction) =>
    action.includes(mirrorAction)
  );
}

function shouldUseHotelMirrorControls(sceneIds: string[], actionLines: string[]) {
  return sceneIds.includes("08") && isMirrorSelfieAction(actionLines.join(" "));
}

function getMirrorSelfieSystemContent(action: string, isThreeImageMode: boolean) {
  if (!isMirrorSelfieAction(action)) return undefined;

  const shared = [
    MIRROR_SELFIE_BASE_CONTROL,
    FACE_HIDDEN_MIRROR_SELFIE_CONTROL,
    PHONE_HAND_REALISM_CONTROL,
    MIRROR_COMPOSITION_AND_PROPORTION_CONTROL,
    OUTFIT_AND_SHOE_MIRROR_EMPHASIS
  ];

  const threeImageLinkage = isThreeImageMode
    ? `3-image mirror selfie linkage:
If one image in the 3-image set uses a mirror selfie action, the set must still preserve the same model, same face identity, same hairstyle, same outfit, same bag, same accessories, and same body proportions. Scene can change, but person and styling cannot change.

If using a full-body mirror selfie action, that image must show complete shoes. If using a three-quarter mirror selfie action, at least one shoe must be fully visible and the second shoe must remain clearly readable. If using a seated mirror selfie action, that image must emphasize trouser hem, ankle area, shoe opening, shoe shape, and the shoe-on-foot relationship.`
    : undefined;

  if (action === MIRROR_SELFIE_ACTIONS.full) {
    return compactJoin([
      ...shared,
      FULL_BODY_MIRROR_SELFIE_CONTROL,
      FULL_SHOE_VISIBILITY_MIRROR_SELFIE,
      threeImageLinkage
    ]);
  }

  if (action === MIRROR_SELFIE_ACTIONS.threeQuarter) {
    return compactJoin([
      ...shared,
      THREE_QUARTER_MIRROR_SELFIE_CONTROL,
      SHOE_READABILITY_THREE_QUARTER_MIRROR_SELFIE,
      THREE_QUARTER_MIRROR_PROPORTION_CONTROL,
      threeImageLinkage
    ]);
  }

  if (action === MIRROR_SELFIE_ACTIONS.seated) {
    return compactJoin([
      MIRROR_SELFIE_BASE_CONTROL,
      FACE_HIDDEN_MIRROR_SELFIE_CONTROL,
      PHONE_HAND_REALISM_CONTROL,
      MIRROR_COMPOSITION_AND_PROPORTION_CONTROL,
      SEATED_MIRROR_SELFIE_CONTROL,
      SEATED_MIRROR_COMPOSITION_CONTROL,
      SEATED_BODY_PROPORTION_CONTROL,
      SHOE_EMPHASIS_SEATED_MIRROR_SELFIE,
      OUTFIT_AND_SHOE_MIRROR_EMPHASIS,
      threeImageLinkage
    ]);
  }

  return compactJoin(shared);
}

function getHotelMirrorSelfieContent() {
  return compactJoin([
    HOTEL_MIRROR_SELFIE_ANTI_CHEAPNESS_CONTROL,
    HOTEL_SPACE_SELECTION_CONTROL,
    HOTEL_LIGHTING_REFINEMENT_CONTROL,
    HOTEL_BACKGROUND_ORDER_CONTROL,
    HOTEL_MIRROR_SELFIE_MOOD_CONTROL
  ]);
}

function formatOutfit(outfit: OutfitRecommendation, sceneLabels: string[]) {
  return compactJoin(
    [
      `Seasonal outfit styling:
- 当前季节: ${SEASON_LABELS[outfit.season]}
- 当前场景: ${sceneLabels.join(" / ")}
- 当前鞋款: ${outfit.shoe}
- 当前材质: ${outfit.material}
- 穿搭方案模式: ${outfit.outfitMode === "auto" ? "自动匹配" : "手动选择"}
- 推荐上装: ${outfit.tops}
- 推荐下装: ${outfit.bottoms}
- 推荐外套: ${outfit.outerwear}
- 推荐包袋: ${outfit.bag}
- 推荐配饰: ${outfit.accessories}
- 推荐面料: ${outfit.fabrics}
- 推荐色彩系统: ${outfit.colorPalette}
- 穿搭总结描述: ${outfit.stylingSummary}`,
      outfit.unifiedNote
        ? `Unified outfit across 3 scenes:
${outfit.unifiedNote}`
        : undefined,
      SEASONAL_OUTFIT_LIBRARY[outfit.season],
      BRAND_MATCHED_OUTFIT_DIRECTION
    ],
    "\n\n"
  );
}

function formatSceneModule(scenes: SceneBlock[], params: ProductParams, shoe: string, material: string) {
  const logoText =
    params.logo === "small"
      ? `Logo control: add the "THERUIZ AURA" logo only if it can appear small, quiet, and restrained in a suitable blank corner or lower area.`
      : "Logo control: do not add any logo.";
  const peopleText =
    params.people === "model"
      ? "People control: include a refined Asian or part-Asian woman as the natural wearer."
      : params.people === "shoe-only"
        ? "People control: no full model; focus on the shoes and their refined environment."
        : "People control: judge naturally by scene; if a woman appears, keep her understated and refined.";

  const sharedProductText = `Product styling facts:
- Shoe: ${shoe}
- Material: ${material}
- Color description: ${params.colorDescription || "Use the uploaded reference image as the exact shoe color source."}
- The shoe must remain the main product subject while feeling naturally integrated into daily life.
- ${logoText}
- ${peopleText}`;

  const sceneLines = scenes.map((scene, index) => {
    const prefix =
      params.generationMode === "three"
        ? `Image ${index + 1} / 3 - ${scene.shortLabel} (${scene.englishLabel})`
        : `${scene.shortLabel} (${scene.englishLabel})`;
    return `${prefix}:
${scene.prompt}`;
  });

  return compactJoin([sharedProductText, ...sceneLines]);
}

function formatActionModule(params: ProductParams, scenes: SceneBlock[]) {
  const blocks = scenes.map((scene, index) => {
    const actions = resolveActionsForScene(scene.id, params.action);
    const actionText = actions
      .map((action) =>
        MIRROR_SELFIE_ACTION_ENGLISH[action]
          ? `${action} / ${MIRROR_SELFIE_ACTION_ENGLISH[action]}`
          : action
      )
      .join(" / ");
    const prefix =
      params.generationMode === "three"
        ? `Image ${index + 1} action for ${scene.shortLabel}`
        : `Action for ${scene.shortLabel}`;
    const manualNote = isKnownManualAction(params.action) || params.action === "自动匹配"
      ? ""
      : " Keep the custom action believable and aligned with THERUIZ AURA's calm daily rhythm.";

    return `${prefix}: ${actionText}.${manualNote}`;
  });

  return `Action module:
${blocks.join("\n")}`;
}

function assembleOutput(sections: PromptSection[]): PromptOutput {
  const allModules = sections
    .map((section) => `## ${section.title}\n${section.content}`)
    .join("\n\n");
  const finalPrompt =
    sections.find((section) => section.title === "最终完整提示词")?.content ??
    sections.map((section) => section.content).join("\n\n");
  return { sections, finalPrompt, allModules };
}

export function generateProductPrompt(params: ProductParams): PromptOutput {
  const shoe = resolveShoe(params);
  const material = resolveMaterial(params);
  const sceneIds = resolveSelectedScenes(params);
  const scenes = sceneIds.map(findScene);
  const sceneLabels = scenes.map((scene) => scene.shortLabel);
  const actionModule = formatActionModule(params, scenes);
  const actionLines = scenes.flatMap((scene) => resolveActionsForScene(scene.id, params.action));
  const hasModel = shouldUseModelControls(params, sceneIds);
  const needsFootFit = shouldUseFootFitControl(sceneIds, actionLines);
  const needsShoelaces = shouldUseShoelaceControl(actionLines);
  const mirrorSelfieSystem = getMirrorSelfieSystemContent(
    params.action,
    params.generationMode === "three"
  );
  const needsHotelMirrorControls = shouldUseHotelMirrorControls(sceneIds, actionLines);
  const matureTriggered = hasMatureTrigger(params, sceneIds);
  const outfit =
    params.generationMode === "three"
      ? getUnifiedOutfitForThreeImageSet(
          sceneIds,
          params.season,
          shoe,
          material,
          params.outfitMode,
          params.manualOutfitNotes
        )
      : getSingleImageOutfit(
          sceneIds[0],
          params.season,
          shoe,
          material,
          params.outfitMode,
          params.manualOutfitNotes
        );

  const generationModeControl =
    params.generationMode === "three"
      ? `Generation mode:
Create one coherent 3-image visual set. Multi-image consistency is mandatory and cannot be turned off. Use the same model, same face, same age impression, same hairstyle, same hair color, same makeup, same body shape, same outfit, same bag, same accessories, same pants length, same sleeve length, and same styling details. Only change scene, action, framing, camera distance, pose, and composition.`
      : `Generation mode:
Create one complete single-image prompt. Do not force multi-image consistency. Use only one selected scene.`;

  const modelBody = compactJoin([BODY_PROPORTION_CONTROL, AGE_BODY_SUPPLEMENTS[params.ageRange]]);

  const sections: PromptSection[] = [
    { title: "总控提示词", content: compactJoin([BRAND_RULE, UNIFIED_CONTROL_PROMPT, generationModeControl]) },
    { title: "客户感受核心", content: CUSTOMER_FEELING_CORE },
    { title: "产品真实性控制", content: PRODUCT_ACCURACY_CONTROL },
    ...(params.generationMode === "three"
      ? [{ title: "多图一致性控制", content: MULTI_IMAGE_CONSISTENCY_CONTROL }]
      : []),
    { title: "年龄段提示词", content: AGE_PROMPTS[params.ageRange] },
    ...(hasModel ? [{ title: "模特身材比例", content: modelBody }] : []),
    ...(hasModel ? [{ title: "人物比例修复", content: HUMAN_PROPORTION_CONTROL }] : []),
    ...(hasModel || needsFootFit ? [{ title: "上脚比例修复", content: ON_FOOT_PROPORTION_CONTROL }] : []),
    ...(needsFootFit ? [{ title: "上脚穿模修复", content: FOOT_SHOE_FIT_CONTROL }] : []),
    ...(needsShoelaces ? [{ title: "鞋带穿模修复", content: SHOELACE_ANTI_CLIPPING_CONTROL }] : []),
    ...(mirrorSelfieSystem
      ? [{ title: "对镜自拍系统 / Mirror selfie system", content: mirrorSelfieSystem }]
      : []),
    ...(needsHotelMirrorControls
      ? [
          {
            title:
              "酒店镜拍去廉价感控制 / Hotel mirror selfie anti-cheapness control",
            content: getHotelMirrorSelfieContent()
          }
        ]
      : []),
    { title: "镜头控制", content: CAMERA_CONTROL },
    ...(hasModel
      ? [
          {
            title: "人物表情补丁",
            content: compactJoin([
              FACIAL_EXPRESSION_CONTROL,
              mirrorSelfieSystem ? MIRROR_SELFIE_EXPRESSION_DE_EMPHASIS : undefined
            ])
          }
        ]
      : []),
    { title: "季节穿搭方案", content: formatOutfit(outfit, sceneLabels) },
    ...(matureTriggered
      ? [{ title: "成熟客户生活方式控制", content: MATURE_CUSTOMER_LIFESTYLE_CONTROL }]
      : []),
    { title: "场景模块", content: formatSceneModule(scenes, params, shoe, material) },
    { title: "动作模块", content: actionModule },
    { title: "统一限制词", content: NEGATIVE_CONTROL }
  ];

  return assembleOutput([
    ...sections,
    {
      title: "最终完整提示词",
      content: sections.map((section) => section.content).join("\n\n")
    }
  ]);
}

export function generateAtmospherePrompt(params: AtmosphereParams): PromptOutput {
  const scene =
    ATMOSPHERE_SCENES.find((item) => item.label === params.imageType) ?? ATMOSPHERE_SCENES[0];
  const expectation =
    scene.customerExpectation ??
    "品牌氛围应传递温感静奢、真实材质、克制留白和可信的日常审美。";
  const usage = `Usage direction:
- 用途: ${params.usage}
- 是否允许出现鞋子: ${params.shoeAllowance}
- 是否允许出现人物: ${params.peopleAllowance}
- 补充描述: ${params.extraDescription || "No extra description."}

Keep the image useful for the selected content purpose while staying quiet, warm, refined, and believable.`;

  const sections: PromptSection[] = [
    { title: "非产品氛围配图总控提示词", content: NON_PRODUCT_ATMOSPHERE_CONTROL },
    { title: "客户氛围预期", content: expectation },
    { title: "具体配图类型模块", content: scene.prompt },
    { title: "用途说明", content: usage },
    { title: "限制词", content: ATMOSPHERE_NEGATIVE_CONTROL }
  ];

  return assembleOutput([
    ...sections,
    {
      title: "最终完整提示词",
      content: sections.map((section) => section.content).join("\n\n")
    }
  ]);
}
