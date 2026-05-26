import type {
  ActionSafetyLevel,
  AgeRange,
  AtmosphereParams,
  OutfitRecommendation,
  ProductParams,
  PromptDetailLevel,
  PromptOutput,
  PromptSection,
  SceneBlock,
  TeamImageType,
  TeamPromptParams,
  TeamPromptOutput,
  TeamScenePreference,
  TeamSeason,
  TeamShoe
} from "../types";
import {
  AGE_BODY_SUPPLEMENTS,
  AGE_PROMPTS,
  ATMOSPHERE_BRAND_COMPACT,
  ATMOSPHERE_NEGATIVE_COMPACT,
  ATMOSPHERE_NEGATIVE_CONTROL,
  BODY_PROPORTION_CONTROL,
  BRAND_COMPACT,
  BRAND_RULE,
  CAMERA_COMPACT,
  CAMERA_CONTROL,
  CORE_NEGATIVE_COMPACT,
  CUSTOMER_FEELING_COMPACT,
  CUSTOMER_FEELING_CORE,
  FACIAL_EXPRESSION_CONTROL,
  FACE_HIDDEN_MIRROR_SELFIE_CONTROL,
  FOOT_SHOE_FIT_COMPACT,
  FOOT_SHOE_FIT_CONTROL,
  FULL_BODY_MIRROR_SELFIE_CONTROL,
  FULL_SHOE_VISIBILITY_MIRROR_SELFIE,
  HIGH_RISK_ON_FOOT_COMPACT,
  HIGH_RISK_ON_FOOT_POSE_PROTECTION,
  HOTEL_BACKGROUND_ORDER_CONTROL,
  HOTEL_LIGHTING_REFINEMENT_CONTROL,
  HOTEL_MIRROR_COMPACT,
  HOTEL_MIRROR_SELFIE_ANTI_CHEAPNESS_CONTROL,
  HOTEL_MIRROR_SELFIE_MOOD_CONTROL,
  HOTEL_SPACE_SELECTION_CONTROL,
  HUMAN_PROPORTION_COMPACT,
  HUMAN_PROPORTION_CONTROL,
  LIFELIKE_EXPRESSION_COMPACT,
  MATURE_CUSTOMER_COMPACT,
  MATURE_CUSTOMER_LIFESTYLE_CONTROL,
  MIRROR_COMPOSITION_AND_PROPORTION_CONTROL,
  MIRROR_EXPRESSION_DE_EMPHASIS_COMPACT,
  MIRROR_SELFIE_BASE_CONTROL,
  MIRROR_SELFIE_COMPACT,
  MIRROR_SELFIE_EXPRESSION_DE_EMPHASIS,
  MIRROR_SHOE_PRESERVATION_CONTROL,
  MODEL_BODY_COMPACT,
  MULTI_IMAGE_CONSISTENCY_COMPACT,
  MULTI_IMAGE_CONSISTENCY_CONTROL,
  NEGATIVE_CONTROL,
  NO_SNEAKER_RECONSTRUCTION_CONTROL,
  NON_PRODUCT_ATMOSPHERE_CONTROL,
  ON_FOOT_PROPORTION_COMPACT,
  ON_FOOT_PROPORTION_CONTROL,
  OUTFIT_AND_SHOE_MIRROR_EMPHASIS,
  PHONE_HAND_REALISM_CONTROL,
  PRODUCT_ACCURACY_COMPACT,
  PRODUCT_ACCURACY_CONTROL,
  SEATED_BODY_PROPORTION_CONTROL,
  SEATED_MIRROR_COMPACT,
  SEATED_MIRROR_COMPOSITION_CONTROL,
  SEATED_MIRROR_SELFIE_CONTROL,
  SHOE_EMPHASIS_SEATED_MIRROR_SELFIE,
  SHOE_READABILITY_THREE_QUARTER_MIRROR_SELFIE,
  SHOE_SAFE_CAMERA_ANGLE_CONTROL,
  SHOELACE_ANTI_CLIPPING_CONTROL,
  SHOELACE_COMPACT,
  SNEAKER_SHAPE_LOCK_COMPACT,
  SNEAKER_SHAPE_LOCK_PRIORITY,
  SNEAKER_STRUCTURAL_CHECKLIST,
  THREE_QUARTER_MIRROR_COMPACT,
  THREE_QUARTER_MIRROR_PROPORTION_CONTROL,
  THREE_QUARTER_MIRROR_SELFIE_CONTROL,
  TROUSER_HEM_AND_SHOE_COLLAR_SEPARATION_CONTROL,
  TROUSER_SHOE_SEPARATION_COMPACT,
  UNIFIED_CONTROL_PROMPT
} from "../data/promptBlocks";
import {
  ACTION_COMPACT_PROMPTS,
  ACTION_OPTIONS,
  ACTION_REPLACEMENT_SUGGESTIONS,
  ACTION_SAFETY_LEVEL_LABELS,
  ACTION_SAFETY_LEVELS,
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
import { cleanFinalPrompt, dedupePromptLines, getPromptStats } from "./promptOptimizer";

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
  "从后座拿包",
  "打开行李箱",
  "站在电梯口等待",
  "轻微转身",
  "牵小朋友手",
  "站立",
  "静态站立",
  "玄关站立准备出门",
  MIRROR_SELFIE_ACTIONS.full,
  MIRROR_SELFIE_ACTIONS.threeQuarter,
  MIRROR_SELFIE_ACTIONS.seated
];

const shoelaceActionKeywords = [
  "系鞋带",
  "半穿鞋",
  "坐在床边穿鞋",
  "touching laces",
  "tying shoelaces",
  "adjusting shoelaces",
  "laces"
];

const matureAgeRanges: AgeRange[] = ["30-45", "40-55"];

function compactJoin(parts: Array<string | undefined | false>, separator = "\n\n") {
  return parts.filter(Boolean).join(separator);
}

function getDetailLevel(level?: PromptDetailLevel) {
  return level ?? "compact";
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

function getActionSafetyLevel(action: string): ActionSafetyLevel {
  return ACTION_SAFETY_LEVELS[action] ?? "B";
}

function isHighRiskAction(action: string) {
  return getActionSafetyLevel(action) === "C";
}

function prioritizeSafeAutoActions(actions: string[]) {
  const fallback = actions.length ? actions : ["慢走一步"];
  const safeActions = fallback.filter((action) => getActionSafetyLevel(action) === "A");
  if (safeActions.length) return safeActions;

  const cautiousActions = fallback.filter((action) => getActionSafetyLevel(action) === "B");
  if (cautiousActions.length) return cautiousActions;

  return fallback;
}

function resolveActionsForScene(sceneId: string, selectedAction: string) {
  if (selectedAction !== "自动匹配") return [selectedAction];

  const actions =
    MATURE_AUTO_ACTION_BY_SCENE[sceneId] ??
    AUTO_ACTION_BY_SCENE[sceneId] ??
    ["慢走一步"];

  return prioritizeSafeAutoActions(actions);
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

function isMirrorSelfieAction(action: string) {
  return Object.values(MIRROR_SELFIE_ACTIONS).some((mirrorAction) =>
    action.includes(mirrorAction)
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
  return shoelaceActionKeywords.some((keyword) => actionText.includes(keyword));
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

function getMirrorSelfieCompact(action: string, isThreeImageMode: boolean) {
  if (!isMirrorSelfieAction(action)) return undefined;

  const modeSpecific =
    action === MIRROR_SELFIE_ACTIONS.threeQuarter
      ? THREE_QUARTER_MIRROR_COMPACT
      : action === MIRROR_SELFIE_ACTIONS.seated
        ? SEATED_MIRROR_COMPACT
        : undefined;

  return compactJoin([
    MIRROR_SELFIE_COMPACT,
    modeSpecific,
    "Mirror shoe preservation compact: mirror reflection must not elongate, narrow, blur, crop, or simplify the sneaker outline.",
    isThreeImageMode ? MULTI_IMAGE_CONSISTENCY_COMPACT : undefined
  ]);
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

function formatSafetyLevelLine(action: string) {
  const level = getActionSafetyLevel(action);
  return `- ${action}: ${ACTION_SAFETY_LEVEL_LABELS[level]}`;
}

function formatSneakerSafetyModule(
  params: ProductParams,
  scenes: SceneBlock[],
  actionLines: string[]
) {
  const sceneActionSummary = scenes
    .map((scene, index) => {
      const actions = resolveActionsForScene(scene.id, params.action);
      const prefix =
        params.generationMode === "three"
          ? `Image ${index + 1} - ${scene.shortLabel}`
          : scene.shortLabel;
      return `${prefix}:\n${actions.map(formatSafetyLevelLine).join("\n")}`;
    })
    .join("\n\n");
  const uniqueActions = Array.from(new Set(actionLines));
  const highRiskActions = uniqueActions.filter(isHighRiskAction);
  const replacementSuggestions = highRiskActions
    .map((action) => ACTION_REPLACEMENT_SUGGESTIONS[action] && `- ${action} -> 建议替代：${ACTION_REPLACEMENT_SUGGESTIONS[action]}`)
    .filter(Boolean)
    .join("\n");
  const autoMatchNote =
    params.action === "自动匹配"
      ? "Automatic action safety rule: 自动匹配已优先筛选 A级安全动作；如果当前场景没有 A级动作，才使用 B级谨慎动作，默认避开 C级高风险动作。"
      : undefined;
  const highRiskProtection = highRiskActions.length
    ? compactJoin([
        `高风险动作修复提示:
该动作容易导致鞋子穿模或鞋型变形，建议改用安全动作。

Triggered high-risk actions:
${highRiskActions.map((action) => `- ${action}`).join("\n")}`,
        HIGH_RISK_ON_FOOT_POSE_PROTECTION,
        replacementSuggestions ? `建议替代动作:
${replacementSuggestions}` : undefined
      ])
    : `高风险动作修复提示:
当前动作未触发 C级高风险动作。继续保持稳定站姿、慢动作、清晰鞋口和真实鞋底接触。`;

  return compactJoin([
    SNEAKER_SHAPE_LOCK_PRIORITY,
    NO_SNEAKER_RECONSTRUCTION_CONTROL,
    `当前动作安全等级:
${sceneActionSummary}`,
    autoMatchNote,
    highRiskProtection,
    TROUSER_HEM_AND_SHOE_COLLAR_SEPARATION_CONTROL,
    SHOE_SAFE_CAMERA_ANGLE_CONTROL,
    uniqueActions.some(isMirrorSelfieAction) ? MIRROR_SHOE_PRESERVATION_CONTROL : undefined,
    SNEAKER_STRUCTURAL_CHECKLIST
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

function formatOutfitCompact(outfit: OutfitRecommendation, sceneLabels: string[]) {
  return `Seasonal outfit compact:
Season: ${SEASON_LABELS[outfit.season]}. Scenes: ${sceneLabels.join(" / ")}. Shoe: ${outfit.shoe}. Material: ${outfit.material}.
Outfit: ${outfit.tops}; ${outfit.bottoms}; ${outfit.outerwear}; ${outfit.bag}; ${outfit.accessories}.
Fabrics and colors: ${outfit.fabrics}. ${outfit.colorPalette}.
Styling summary: ${outfit.stylingSummary}${outfit.unifiedNote ? `\nUnified 3-image outfit: ${outfit.unifiedNote}` : ""}`;
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

function formatSceneCompact(scenes: SceneBlock[], params: ProductParams, shoe: string, material: string) {
  const logoText =
    params.logo === "small"
      ? `Logo: if used, keep "THERUIZ AURA" small and discreet in blank space.`
      : "Logo: do not add any logo.";
  const peopleText =
    params.people === "shoe-only"
      ? "People: no full model; focus on shoes and environment."
      : params.people === "model"
        ? "People: include a refined Asian or part-Asian woman as the natural wearer."
        : "People: judge naturally by scene; keep any person understated and refined.";
  const sceneLines = scenes.map((scene, index) => {
    const prefix =
      params.generationMode === "three"
        ? `Image ${index + 1} / 3 - ${scene.shortLabel}:`
        : `${scene.shortLabel}:`;
    return `${prefix} ${scene.compactPrompt ?? scene.prompt}`;
  });

  return compactJoin([
    `Product and scene facts compact:
Shoe: ${shoe}. Material: ${material}. Color: ${params.colorDescription || "match the uploaded reference exactly"}. ${logoText} ${peopleText}`,
    ...sceneLines
  ]);
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

function formatActionCompact(params: ProductParams, scenes: SceneBlock[]) {
  const blocks = scenes.map((scene, index) => {
    const actions = resolveActionsForScene(scene.id, params.action);
    const prefix =
      params.generationMode === "three"
        ? `Image ${index + 1} action for ${scene.shortLabel}`
        : `Action for ${scene.shortLabel}`;
    const actionText = actions
      .map((action) => {
        const english = MIRROR_SELFIE_ACTION_ENGLISH[action]
          ? ` / ${MIRROR_SELFIE_ACTION_ENGLISH[action]}`
          : "";
        const compact = ACTION_COMPACT_PROMPTS[action] ?? "Keep the action calm, believable, and aligned with THERUIZ AURA's quiet daily rhythm.";
        return `${action}${english}: ${compact}`;
      })
      .join("\n");

    return `${prefix}:\n${actionText}`;
  });

  return `Action compact:
${blocks.join("\n")}`;
}

function getReplacementSuggestions(actions: string[]) {
  return actions
    .map((action) => ACTION_REPLACEMENT_SUGGESTIONS[action] && `- ${action} -> 建议替代：${ACTION_REPLACEMENT_SUGGESTIONS[action]}`)
    .filter(Boolean)
    .join("\n");
}

function formatHighRiskCompact(actions: string[]) {
  if (!actions.length) return undefined;
  const replacements = getReplacementSuggestions(actions);

  return compactJoin([
    HIGH_RISK_ON_FOOT_COMPACT,
    replacements
      ? `Suggested safer action:
${replacements}`
      : undefined
  ]);
}

function buildTriggeredModules({
  params,
  hasModel,
  needsFootFit,
  needsShoelaces,
  mirrorSelfieSystem,
  needsHotelMirrorControls,
  matureTriggered,
  highRiskActions
}: {
  params: ProductParams;
  hasModel: boolean;
  needsFootFit: boolean;
  needsShoelaces: boolean;
  mirrorSelfieSystem?: string;
  needsHotelMirrorControls: boolean;
  matureTriggered: boolean;
  highRiskActions: string[];
}) {
  const modules = [
    "品牌总控",
    "客户感受核心",
    "产品真实性",
    "鞋型锁定与上脚安全",
    "季节穿搭方案",
    "场景模块",
    "动作模块",
    "核心负面词"
  ];

  if (params.generationMode === "three") modules.push("多图一致性");
  if (hasModel) modules.push("年龄段提示词", "模特身材比例", "人物比例");
  if (hasModel && !mirrorSelfieSystem) modules.push("人物表情活人感");
  if (hasModel && mirrorSelfieSystem) modules.push("镜拍脸部弱化");
  if (needsFootFit) modules.push("上脚比例", "上脚穿模修复", "裤脚与鞋口关系");
  if (needsShoelaces) modules.push("鞋带穿模修复");
  if (mirrorSelfieSystem) modules.push("对镜自拍系统");
  if (needsHotelMirrorControls) modules.push("酒店镜拍去廉价感");
  if (matureTriggered) modules.push("成熟客户生活方式控制");
  if (highRiskActions.length) modules.push("高风险上脚动作修复", "建议替代动作");

  return modules;
}

function buildPromptOutput(
  sections: PromptSection[],
  variants: {
    compactPrompt: string;
    standardPrompt: string;
    fullDebugPrompt: string;
  },
  currentDetailLevel: PromptDetailLevel,
  triggeredModules: string[]
): PromptOutput {
  const optimizedVariants = {
    compactPrompt: dedupePromptLines(variants.compactPrompt),
    standardPrompt: dedupePromptLines(variants.standardPrompt),
    fullDebugPrompt: dedupePromptLines(variants.fullDebugPrompt)
  };
  const currentPrompt =
    currentDetailLevel === "full"
      ? optimizedVariants.fullDebugPrompt
      : currentDetailLevel === "standard"
        ? optimizedVariants.standardPrompt
        : optimizedVariants.compactPrompt;
  const sectionsWithFinal = [
    ...sections,
    {
      title: "最终完整提示词",
      content: currentPrompt
    }
  ];
  const allModules = sectionsWithFinal
    .map((section) => `## ${section.title}\n${section.content}`)
    .join("\n\n");

  return {
    sections: sectionsWithFinal,
    finalPrompt: currentPrompt,
    currentPrompt,
    allModules,
    currentDetailLevel,
    triggeredModules,
    compactPrompt: optimizedVariants.compactPrompt,
    standardPrompt: optimizedVariants.standardPrompt,
    fullDebugPrompt: optimizedVariants.fullDebugPrompt,
    stats: {
      compact: getPromptStats(optimizedVariants.compactPrompt),
      standard: getPromptStats(optimizedVariants.standardPrompt),
      full: getPromptStats(optimizedVariants.fullDebugPrompt)
    }
  };
}

export function generateProductPrompt(params: ProductParams): PromptOutput {
  const currentDetailLevel = getDetailLevel(params.promptDetailLevel);
  const shoe = resolveShoe(params);
  const material = resolveMaterial(params);
  const sceneIds = resolveSelectedScenes(params);
  const scenes = sceneIds.map(findScene);
  const sceneLabels = scenes.map((scene) => scene.shortLabel);
  const actionModule = formatActionModule(params, scenes);
  const actionCompact = formatActionCompact(params, scenes);
  const actionLines = scenes.flatMap((scene) => resolveActionsForScene(scene.id, params.action));
  const uniqueActions = Array.from(new Set(actionLines));
  const highRiskActions = uniqueActions.filter(isHighRiskAction);
  const hasCautiousOrHighRiskAction = actionLines.some(
    (action) => getActionSafetyLevel(action) !== "A"
  );
  const hasModel = shouldUseModelControls(params, sceneIds);
  const needsFootFit =
    shouldUseFootFitControl(sceneIds, actionLines) ||
    hasCautiousOrHighRiskAction ||
    highRiskActions.length > 0;
  const needsShoelaces = shouldUseShoelaceControl(actionLines);
  const mirrorSelfieSystem = getMirrorSelfieSystemContent(
    params.action,
    params.generationMode === "three"
  );
  const mirrorSelfieCompact = getMirrorSelfieCompact(
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
  const outfitFull = formatOutfit(outfit, sceneLabels);
  const outfitCompact = formatOutfitCompact(outfit, sceneLabels);
  const sceneFull = formatSceneModule(scenes, params, shoe, material);
  const sceneCompact = formatSceneCompact(scenes, params, shoe, material);

  const fullSections: PromptSection[] = [
    { title: "总控提示词", content: compactJoin([BRAND_RULE, UNIFIED_CONTROL_PROMPT, generationModeControl]) },
    { title: "客户感受核心", content: CUSTOMER_FEELING_CORE },
    { title: "产品真实性控制", content: PRODUCT_ACCURACY_CONTROL },
    {
      title: "鞋型锁定与上脚安全 / Sneaker Shape Lock + Safe On-foot Pose",
      content: formatSneakerSafetyModule(params, scenes, actionLines)
    },
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
    { title: "季节穿搭方案", content: outfitFull },
    ...(matureTriggered
      ? [{ title: "成熟客户生活方式控制", content: MATURE_CUSTOMER_LIFESTYLE_CONTROL }]
      : []),
    { title: "场景模块", content: sceneFull },
    { title: "动作模块", content: actionModule },
    { title: "统一限制词", content: NEGATIVE_CONTROL }
  ];

  const compactPrompt = compactJoin([
    BRAND_COMPACT,
    CUSTOMER_FEELING_COMPACT,
    PRODUCT_ACCURACY_COMPACT,
    SNEAKER_SHAPE_LOCK_COMPACT,
    params.generationMode === "three" ? MULTI_IMAGE_CONSISTENCY_COMPACT : undefined,
    hasModel ? AGE_PROMPTS[params.ageRange] : undefined,
    hasModel ? MODEL_BODY_COMPACT : undefined,
    hasModel ? HUMAN_PROPORTION_COMPACT : undefined,
    hasModel && mirrorSelfieSystem ? MIRROR_EXPRESSION_DE_EMPHASIS_COMPACT : undefined,
    hasModel && !mirrorSelfieSystem ? LIFELIKE_EXPRESSION_COMPACT : undefined,
    outfitCompact,
    sceneCompact,
    actionCompact,
    needsFootFit ? ON_FOOT_PROPORTION_COMPACT : undefined,
    needsFootFit ? FOOT_SHOE_FIT_COMPACT : undefined,
    needsFootFit ? TROUSER_SHOE_SEPARATION_COMPACT : undefined,
    needsShoelaces ? SHOELACE_COMPACT : undefined,
    mirrorSelfieCompact,
    needsHotelMirrorControls ? HOTEL_MIRROR_COMPACT : undefined,
    highRiskActions.length ? formatHighRiskCompact(highRiskActions) : undefined,
    matureTriggered ? MATURE_CUSTOMER_COMPACT : undefined,
    !mirrorSelfieSystem ? CAMERA_COMPACT : undefined,
    CORE_NEGATIVE_COMPACT
  ]);

  const selectedDetailedNegatives = compactJoin([
    CORE_NEGATIVE_COMPACT,
    needsShoelaces
      ? "Avoid broken laces, duplicated lace strands, fingers fused with laces, and incorrect eyelet routes."
      : undefined,
    mirrorSelfieSystem
      ? "Avoid mirror distortion, stretched mirror legs, phone blocking outfit or shoes, cropped-out shoes, and influencer mirror selfie posing."
      : undefined,
    needsHotelMirrorControls
      ? "Avoid cheap hotel selfie feeling, bathroom clutter, harsh yellow light, tourist luggage mess, and loud hotel decor."
      : undefined
  ]);

  const standardPrompt = compactJoin([
    BRAND_RULE,
    CUSTOMER_FEELING_CORE,
    PRODUCT_ACCURACY_CONTROL,
    compactJoin([SNEAKER_SHAPE_LOCK_PRIORITY, TROUSER_HEM_AND_SHOE_COLLAR_SEPARATION_CONTROL, SHOE_SAFE_CAMERA_ANGLE_CONTROL]),
    params.generationMode === "three" ? MULTI_IMAGE_CONSISTENCY_CONTROL : undefined,
    hasModel ? AGE_PROMPTS[params.ageRange] : undefined,
    hasModel ? compactJoin([MODEL_BODY_COMPACT, HUMAN_PROPORTION_COMPACT]) : undefined,
    hasModel && mirrorSelfieSystem ? MIRROR_EXPRESSION_DE_EMPHASIS_COMPACT : undefined,
    hasModel && !mirrorSelfieSystem ? LIFELIKE_EXPRESSION_COMPACT : undefined,
    outfitFull,
    sceneCompact,
    actionCompact,
    needsFootFit ? compactJoin([ON_FOOT_PROPORTION_COMPACT, FOOT_SHOE_FIT_COMPACT]) : undefined,
    needsShoelaces ? SHOELACE_COMPACT : undefined,
    mirrorSelfieCompact,
    needsHotelMirrorControls ? HOTEL_MIRROR_COMPACT : undefined,
    highRiskActions.length ? compactJoin([HIGH_RISK_ON_FOOT_POSE_PROTECTION, getReplacementSuggestions(highRiskActions)]) : undefined,
    matureTriggered ? MATURE_CUSTOMER_COMPACT : undefined,
    CAMERA_COMPACT,
    selectedDetailedNegatives
  ]);

  const fullDebugPrompt = fullSections.map((section) => section.content).join("\n\n");
  const triggeredModules = buildTriggeredModules({
    params,
    hasModel,
    needsFootFit,
    needsShoelaces,
    mirrorSelfieSystem,
    needsHotelMirrorControls,
    matureTriggered,
    highRiskActions
  });

  return buildPromptOutput(
    fullSections,
    {
      compactPrompt,
      standardPrompt,
      fullDebugPrompt
    },
    currentDetailLevel,
    triggeredModules
  );
}

export function generateAtmospherePrompt(params: AtmosphereParams): PromptOutput {
  const currentDetailLevel = getDetailLevel(params.promptDetailLevel);
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
  const usageCompact = `Usage compact:
Purpose: ${params.usage}. Shoe allowance: ${params.shoeAllowance}. People allowance: ${params.peopleAllowance}. Extra note: ${params.extraDescription || "No extra description."}`;

  const fullSections: PromptSection[] = [
    { title: "非产品氛围配图总控提示词", content: NON_PRODUCT_ATMOSPHERE_CONTROL },
    { title: "客户氛围预期", content: expectation },
    { title: "具体配图类型模块", content: scene.prompt },
    { title: "用途说明", content: usage },
    { title: "限制词", content: ATMOSPHERE_NEGATIVE_CONTROL }
  ];

  const compactPrompt = compactJoin([
    ATMOSPHERE_BRAND_COMPACT,
    `Customer lifestyle expectation: ${expectation}`,
    scene.compactPrompt ?? scene.prompt,
    usageCompact,
    ATMOSPHERE_NEGATIVE_COMPACT
  ]);
  const standardPrompt = compactJoin([
    NON_PRODUCT_ATMOSPHERE_CONTROL,
    `Customer lifestyle expectation: ${expectation}`,
    scene.compactPrompt ?? scene.prompt,
    usage,
    ATMOSPHERE_NEGATIVE_COMPACT
  ]);
  const fullDebugPrompt = fullSections.map((section) => section.content).join("\n\n");

  return buildPromptOutput(
    fullSections,
    {
      compactPrompt,
      standardPrompt,
      fullDebugPrompt
    },
    currentDetailLevel,
    ["非产品氛围总控", "客户氛围预期", "具体配图类型", "用途说明", "非产品限制词"]
  );
}

const TEAM_BRAND_CORE =
  "Create a premium THERUIZ AURA image in the brand’s “Quiet Warm Luxury” style: cream-white, warm beige, soft stone, natural daylight, low saturation, relaxed elegance, tactile authenticity, and believable daily sophistication. The image should feel clean but warm, refined but not distant, feminine but not sweet, real but not ordinary.";

const TEAM_CUSTOMER_FEELING =
  "The image should express that she can leave home without overthinking, walk through the day without looking tired or messy, feel comfortable without looking careless, and appear clean, composed, tasteful, and quietly put together.";

const TEAM_PRODUCT_PROTECTION =
  "Use the uploaded THERUIZ AURA sneaker as the only product reference. Strictly preserve its real shape, toe box, outsole thickness, side panels, tongue, laces, stitching, material texture, color, and proportions. Do not redesign, simplify, stretch, compress, or reinterpret the shoe.\n\nThe sneaker shape has highest priority. The foot, pants, pose, camera angle, mirror reflection, and scene must adapt to the shoe, not deform it.";

const TEAM_NON_PRODUCT_SHOE_PROTECTION =
  "If the THERUIZ AURA sneaker appears in this non-product atmosphere image, keep it subtle and secondary. Preserve its real color, material texture, and recognizable shape, but do not turn the image into a direct product shot. The shoe may appear only as a subtle partial object or background detail, not as the main product subject. Do not make the shoe the only subject. Do not force full on-foot display.";

const TEAM_PRODUCT_NEGATIVE =
  "Avoid generic e-commerce style, redesigned sneaker, distorted shoe shape, shoe-foot clipping, pants merging into shoe, oversized feet, elongated legs, AI body, blank face, influencer posing, sporty energy, cheap Taobao styling, hard studio lighting, mirror distortion, cropped shoes, and unreadable footwear.";

const TEAM_ATMOSPHERE_NEGATIVE =
  "Avoid generic stock photography, cheap lifestyle props, hard studio lighting, cluttered composition, influencer styling, loud colors, fake luxury staging, cold minimalism, messy backgrounds, and overly commercial visual language.";

const TEAM_IMAGE_TYPE_TEMPLATES: Record<TeamImageType, string> = {
  产品上脚图:
    "Generate a refined on-foot lifestyle image. Use a safe standing pose or small natural walking step. The sneakers must be complete, clear, and structurally accurate. Keep trouser hems separate from the shoe collar. Avoid complex actions, shoe-foot clipping, distorted feet, exaggerated legs, or cropped shoes.",
  对镜穿搭图:
    "Generate a refined mirror outfit image. The face should be hidden by the phone or naturally cropped. Use a 3/4 or full-body mirror composition with the sneakers clearly visible. At least one sneaker must be fully visible from toe to heel, and the second sneaker must remain clearly readable. Keep mirror proportions natural, phone-hand structure believable, and trouser-shoe relationship clear. Avoid influencer selfie energy, beauty selfie, stretched legs, cropped shoes, or mirror distortion.",
  生活场景图:
    "Generate a believable lifestyle image of a refined 30–45 year old urban woman wearing THERUIZ AURA sneakers in a real daily scene such as commute, weekend city walk, premium grocery, hotel travel, or family daily movement. She should look clean, composed, comfortable, tasteful, and quietly confident.",
  非产品氛围图:
    "Generate a non-product atmospheric image for THERUIZ AURA. The product does not need to be the main subject. Use scenes such as entryway departure, window-side reading, hotel arrival, flowers and bakery return, refined worktable, or weekend errands. The image should express quiet order, warm restraint, daily elegance, calm negative space, and refined lifestyle atmosphere.",
  "拍摄花絮 / 材质图":
    "Generate a refined behind-the-scenes or material storytelling image for THERUIZ AURA. Show leather swatches, suede samples, shoelaces, color cards, care brush, product notes, shooting table, or hands arranging materials. The mood should feel real, tactile, quiet, and premium. Avoid factory feeling, messy clutter, cheap studio look, or technical catalog style."
};

const TEAM_SHOE_STYLE: Record<TeamShoe, string> = {
  "Cloud Dancer 云舞者":
    "Classic clean light-tone foundation, best with white shirts, beige trousers, soft denim, and refined everyday styling.",
  "Sand Dollar 沙钱白":
    "Classic clean light-tone foundation, best with white shirts, beige trousers, soft denim, and refined everyday styling.",
  "Delphinium Blue 飞燕草蓝":
    "Low-saturation airy blue, best with white shirts, pale denim, oatmeal knitwear, and fresh spring-summer styling.",
  "Silver Romance 银色浪漫":
    "Soft moonlit metallic accent, best with warm grey, cream white, and refined urban styling. Avoid chrome, cyber, or cheap shine.",
  "Aire 微风":
    "Light breathable spring-summer feeling, best with linen, airy shirts, and light trousers. Avoid sporty running-shoe styling.",
  "Cappuccino 卡布奇诺":
    "Warm coffee suede mood, best with knitwear, oatmeal, beige, and soft autumn-winter layers. Avoid masculine or heavy styling.",
  "Lemon 柠檬":
    "Soft butter-yellow freshness, best with cream white, pale denim, and clean neutral styling. Avoid childish or high-saturation yellow.",
  "Maple Grove 枫林":
    "Warm muted maple tone, best with soft knitwear, beige-brown layers, and gentle autumn styling. Avoid heavy masculine styling.",
  "Oreo 奥利奥":
    "Clean black-white balance, best with black, white, grey, beige, and restrained daily styling. Avoid streetwear or sporty energy.",
  "Panda 熊猫":
    "Clean black-white balance, best with black, white, grey, beige, and restrained daily styling. Avoid streetwear or sporty energy.",
  自定义: "Use THERUIZ AURA’s clean, low-saturation, refined daily styling system."
};

const TEAM_OUTFIT_SEASON: Record<TeamSeason, string> = {
  春: "Use light trench coats, soft knitwear, white shirts, pale trousers, and gentle spring layering.",
  夏: "Use linen, short-sleeve shirts, airy tops, light trousers, breathable textures, and clean summer ease.",
  秋: "Use knitwear, light outerwear, oatmeal, cappuccino, soft denim, and warm low-saturation layers.",
  冬: "Use coats, warm knitwear, winter white, warm grey, muted brown, and restrained cozy layering."
};

const TEAM_ATMOSPHERE_SEASON: Record<TeamSeason, string> = {
  春: "Use soft spring daylight, airy textures, pale neutrals, and a fresh but quiet atmosphere.",
  夏: "Use breathable summer light, linen texture, warm off-white tones, and a clean airy mood.",
  秋: "Use warm muted daylight, tactile textures, oatmeal, beige, soft brown tones, and calm seasonal warmth.",
  冬: "Use soft winter light, warm neutral layers, cream, warm grey, quiet shadows, and restrained cozy atmosphere."
};

const TEAM_SCENE_TEXT: Record<Exclude<TeamScenePreference, "自动匹配">, string> = {
  通勤上班:
    "Use a calm commute setting such as an office entrance, elevator lobby, parking-to-office walkway, or quiet business district. The image should feel polished but relaxed.",
  周末城市散步:
    "Use a quiet city walk setting such as a calm street, café exterior, gallery district, bookstore street, or light stone wall. The image should feel relaxed, tasteful, and mature.",
  "精品超市 / 日常采购":
    "Use a refined daily errands setting such as a premium grocery, bakery corner, flower shop, or calm neighborhood store. The mood should feel real, warm, and tasteful.",
  旅行酒店:
    "Use a calm hotel room, hotel doorway, wardrobe mirror, suitcase corner, or soft hotel window light. The scene should feel organized, quiet, and refined, not touristy or cheap.",
  居家衣帽间:
    "Use a quiet wardrobe, bedroom, mirror, or getting-ready corner. Focus on outfit relationship, daily ease, and refined personal style.",
  玄关出门:
    "Use a warm neutral entryway with keys, tote bag, coat, doorway light, or subtle daily objects. The mood should express leaving home easily and tastefully.",
  窗边阅读:
    "Use a soft window-side reading corner with a book, cup, linen curtain, chair, or sofa edge. The mood should feel calm, private, and warm.",
  材质工作台:
    "Use a refined material table with leather swatches, suede samples, shoelaces, color cards, product notes, or hands arranging materials.",
  拍摄花絮:
    "Use a quiet behind-the-scenes shooting moment with styling table, camera monitor, light stand edge, paper shot list, wardrobe pieces, or hands adjusting details.",
  周末轻采购:
    "Use a refined weekend errands atmosphere with flowers, bakery paper bags, produce, coffee beans, tote bags, or a simple kitchen/table surface. The mood should feel like real life made beautiful through order, restraint, and good taste."
};

const TEAM_SHOE_KEYWORDS = [
  "鞋子",
  "鞋",
  "样鞋",
  "产品",
  "鞋带",
  "鞋舌",
  "鞋底",
  "鞋面",
  "鞋头",
  "鞋型",
  "德训鞋",
  "单鞋",
  "双鞋",
  "鞋跟",
  "上脚",
  "sneaker",
  "sneakers",
  "shoe",
  "shoes",
  "lace",
  "laces",
  "product",
  "outsole",
  "sole",
  "tongue",
  "upper",
  "toe box"
];

function teamExtraMentionsShoe(extraRequirement: string) {
  const text = extraRequirement.toLowerCase();
  return TEAM_SHOE_KEYWORDS.some((keyword) => text.includes(keyword.toLowerCase()));
}

function resolveTeamHasShoe(params: TeamPromptParams) {
  if (
    params.imageType === "产品上脚图" ||
    params.imageType === "对镜穿搭图" ||
    params.imageType === "生活场景图"
  ) {
    return true;
  }

  return teamExtraMentionsShoe(params.extraRequirement);
}

function getTeamAutoScene(imageType: TeamImageType): Exclude<TeamScenePreference, "自动匹配"> {
  if (imageType === "产品上脚图") return "通勤上班";
  if (imageType === "对镜穿搭图") return "居家衣帽间";
  if (imageType === "生活场景图") return "精品超市 / 日常采购";
  if (imageType === "非产品氛围图") return "玄关出门";
  return "材质工作台";
}

function resolveTeamScenePreference(params: TeamPromptParams) {
  return params.scenePreference === "自动匹配"
    ? getTeamAutoScene(params.imageType)
    : params.scenePreference;
}

function getTeamSceneText(params: TeamPromptParams) {
  const scene = resolveTeamScenePreference(params);

  if (params.imageType === "产品上脚图" && scene === "窗边阅读") {
    return "Use a window-side lifestyle on-foot scene with soft natural light and a calm interior mood. Keep the sneakers clear, complete, and structurally accurate.";
  }

  if (params.imageType === "产品上脚图" && scene === "材质工作台") {
    return "Use a material storytelling scene with the sneaker clearly present, keeping it wearable and readable rather than turning the image into a pure still life.";
  }

  if (params.imageType === "对镜穿搭图" && scene === "拍摄花絮") {
    return "Use a mirror outfit record in a quiet getting-ready setting, not a studio behind-the-scenes image. Keep the outfit and sneakers clear.";
  }

  if (params.imageType === "非产品氛围图" && scene === "通勤上班") {
    return "Use commute-related atmosphere such as a tote bag, keys, coat, entryway, calm worktable, or soft office-transition details. Do not make it a direct on-foot product image.";
  }

  if (params.imageType === "拍摄花絮 / 材质图" && scene === "窗边阅读") {
    return "Use a quiet material table near soft window light, with tactile samples and refined working details. Do not make a reading portrait the main image.";
  }

  if (params.imageType === "生活场景图" && scene === "材质工作台") {
    return "Use a refined lifestyle scene with subtle material storytelling details, keeping the woman’s daily life and the brand atmosphere more important than a pure worktable still life.";
  }

  if (params.imageType === "生活场景图" && scene === "拍摄花絮") {
    return "Use a natural lifestyle image with a subtle behind-the-scenes feeling, not a technical studio setup.";
  }

  return TEAM_SCENE_TEXT[scene];
}

function shouldUseOutfitSeason(imageType: TeamImageType) {
  return imageType === "产品上脚图" || imageType === "对镜穿搭图" || imageType === "生活场景图";
}

function shouldIncludeCustomerFeeling(imageType: TeamImageType) {
  return shouldUseOutfitSeason(imageType);
}

function getTeamShoeStyle(params: TeamPromptParams, hasShoe: boolean) {
  if (!hasShoe) return "";

  const base = TEAM_SHOE_STYLE[params.shoe];
  if (params.shoe !== "自定义") return base;

  const customName = params.customShoe.trim();
  return customName ? `${base} The selected custom shoe is ${customName}.` : base;
}

export function generateTeamPrompt(params: TeamPromptParams): TeamPromptOutput {
  const hasShoe = resolveTeamHasShoe(params);
  const sceneText = getTeamSceneText(params);
  const extraRequirement = params.extraRequirement.trim();
  const seasonText = shouldUseOutfitSeason(params.imageType)
    ? TEAM_OUTFIT_SEASON[params.season]
    : TEAM_ATMOSPHERE_SEASON[params.season];
  const shoeStyle = getTeamShoeStyle(params, hasShoe);
  const productProtection =
    hasShoe && params.imageType === "非产品氛围图"
      ? TEAM_NON_PRODUCT_SHOE_PROTECTION
      : hasShoe
        ? TEAM_PRODUCT_PROTECTION
        : "";
  const negative =
    hasShoe && params.imageType !== "非产品氛围图"
      ? TEAM_PRODUCT_NEGATIVE
      : TEAM_ATMOSPHERE_NEGATIVE;

  const body = dedupePromptLines(
    [
      TEAM_BRAND_CORE,
      shouldIncludeCustomerFeeling(params.imageType) ? TEAM_CUSTOMER_FEELING : "",
      TEAM_IMAGE_TYPE_TEMPLATES[params.imageType],
      shoeStyle,
      seasonText,
      sceneText,
      productProtection,
      negative
    ]
      .filter(Boolean)
      .join("\n\n")
  );

  const finalPrompt = cleanFinalPrompt(
    extraRequirement ? `${body}\n\nAdditional user requirement: ${extraRequirement}` : body
  );

  return {
    prompt: finalPrompt,
    hasShoe,
    sceneText
  };
}
