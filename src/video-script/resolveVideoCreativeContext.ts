import type { TeamPromptParams, TeamScenePreference } from "../types";
import type { PromptProfileInput } from "../prompt-engine/contracts";
import { buildPromptProfileInput } from "../prompt-engine/adapters/legacyTeamPromptAdapter";
import { generatePromptRuntime } from "../prompt-engine/runtime";
import { getTheruizAuraRealismRules } from "../prompt-engine/profiles/theruizAuraRealismProfiles";
import { brandVisualMother } from "../visual-system";
import { BASIC_SCENE_BLOCKS } from "../data/sceneBlocks";
import { chooseActionLine } from "../data/actionPoseProfiles";
import { chooseSeasonCityVisualContext } from "../utils/chooseSeasonCityVisualContext";
import { getStudioLaunchAngleLine } from "../utils/teamPromptCore";
import { resolveStudioLaunchPreset, type StudioLaunchPresetDefinition } from "../data/studioLaunchPresets";
import { resolveStudioWardrobeSelection } from "../data/studioWardrobeLibrary";

export type ResolvedBrandVisualContext = {
  positioning: string;
  authoritativeRules: string[];
  directingRules: string[];
  productIsVisualDirector: false;
  productTruthSource: "current_task_uploaded_images";
};

export type ResolvedSceneDirectingContext = {
  scenePreference: Exclude<TeamScenePreference, "自动匹配">;
  sceneKey: string;
  compositionMode: PromptProfileInput["compositionMode"];
  activeVisualRoleId?: PromptProfileInput["activeVisualRoleId"];
  locationDirection: string;
  actionDirection: string;
  actionSupport: string;
  seasonalLightDirection: string;
  seasonalMoodDirection: string;
};

export type ResolvedStudioVideoContext = {
  enabled: boolean;
  anglePreference: TeamPromptParams["studioLaunchAnglePreference"];
  angleDirection: string;
  presetPreference: TeamPromptParams["studioLaunchPreset"];
  resolvedPreset: StudioLaunchPresetDefinition | null;
  wardrobePreference: TeamPromptParams["studioWardrobePreference"];
  resolvedWardrobeLine: string | null;
  seriesImageCount: number | null;
  seriesImageIndex: number | null;
  shotIndex: TeamPromptParams["studioLaunchShotIndex"] | null;
};

export type ResolvedVideoCreativeContext = {
  params: TeamPromptParams;
  selectedOutfitLine: string;
  profileInput: PromptProfileInput;
  brandVisual: ResolvedBrandVisualContext;
  scene: ResolvedSceneDirectingContext;
  studio: ResolvedStudioVideoContext;
};

const fixedRuleTranslations: Record<string, string> = {
  "产品真实性优先": "Product Truth has priority over styling, motion, framing, and atmosphere.",
  "品牌人物范围为25—46岁城市女性": "Keep the selected mature urban woman within the authoritative THERUIZ AURA audience range and the user's selected model profile.",
  "不甜妹、不网红、不塑料、不幼态": "Keep the person non-sweet, non-influencer, non-plastic, mature, and naturally unperformed.",
  "低声量色彩秩序": "Use a quiet, low-saturation color hierarchy with restrained contrast.",
  "温暖且有明确来源的光线": "Use warm, physically believable light with a clear source and natural falloff.",
  "真实材质和真实物理关系": "Preserve distinct material response and believable physical relationships among person, clothing, product, ground, and space.",
  "产品准确自然地参与画面": "Let the accurately preserved product participate naturally in the scene without directing the whole composition.",
  "生活方式表达与产品证据共存": "Keep lifestyle meaning and readable product evidence present in the same scene context.",
};

const sceneKeyFallbacks: Partial<Record<string, Exclude<TeamScenePreference, "自动匹配">>> = {
  commute: "通勤上班",
  cafeExterior: "咖啡店门口",
  cafeInterior: "咖啡馆内",
  studioLaunch: "棚内上新拍摄",
  weekendCityWalk: "周末城市散步",
  premiumErrands: "精品超市 / 日常采购",
  mirrorCloset: "居家衣帽间",
  materialTable: "材质工作台",
};

function resolveScenePreference(params: TeamPromptParams, profileInput: PromptProfileInput): Exclude<TeamScenePreference, "自动匹配"> {
  if (params.scenePreference !== "自动匹配") return params.scenePreference;
  return sceneKeyFallbacks[profileInput.sceneKey ?? ""] ?? "周末城市散步";
}

function resolveSceneBlock(scene: Exclude<TeamScenePreference, "自动匹配">) {
  if (scene === "通勤上班") return BASIC_SCENE_BLOCKS.find((item) => item.id === "01");
  if (scene === "咖啡店门口" || scene === "咖啡馆内") return BASIC_SCENE_BLOCKS.find((item) => item.id === "03");
  return BASIC_SCENE_BLOCKS.find((item) => item.shortLabel === scene);
}

export function resolveVideoBrandVisual(profileInput: PromptProfileInput, studioMode = false): ResolvedBrandVisualContext {
  const directingRules = getTheruizAuraRealismRules(profileInput)
    .filter((rule) => [
      "theruiz-human-state-real-mature-urban",
      "theruiz-action-reason-phase-weight",
      "theruiz-composition-observed-asymmetric",
      "theruiz-scene-functionally-believable",
      "theruiz-lighting-source-falloff-material-response",
      "theruiz-product-presentation-worn-readable",
      "theruiz-physical-integrity-grounding",
    ].includes(rule.id))
    .map((rule) => rule.text)
    .filter((rule) => !studioMode || !/doorway|column|wall edge|glass panel|step|table edge|flowers|architectural framing|environmental layers/i.test(rule));
  if (studioMode) {
    directingRules.push(
      "Use a clean professional seamless studio only; exclude all non-studio architecture, furniture, decorative props, visual obstructions, and environmental storytelling layers.",
      "Preserve restrained asymmetry through the person's weight, arm spacing, gaze, and garment fall while keeping the assigned studio framing and seamless floor fully readable."
    );
  }
  return {
    positioning: brandVisualMother.core_positioning,
    authoritativeRules: brandVisualMother.fixed_rules.map((rule) => fixedRuleTranslations[rule] ?? rule),
    directingRules,
    productIsVisualDirector: false,
    productTruthSource: brandVisualMother.product_truth_source,
  };
}

function resolveStudioContext(params: TeamPromptParams, scenePreference: Exclude<TeamScenePreference, "自动匹配">): ResolvedStudioVideoContext {
  if (scenePreference !== "棚内上新拍摄") {
    return {
      enabled: false,
      anglePreference: params.studioLaunchAnglePreference,
      angleDirection: "",
      presetPreference: params.studioLaunchPreset,
      resolvedPreset: null,
      wardrobePreference: params.studioWardrobePreference,
      resolvedWardrobeLine: null,
      seriesImageCount: null,
      seriesImageIndex: null,
      shotIndex: null,
    };
  }
  const nonce = params.studioSetNonce ?? params.generationNonce;
  const preset = resolveStudioLaunchPreset({ preset: params.studioLaunchPreset, nonce });
  const wardrobe = resolveStudioWardrobeSelection({
    preference: params.studioWardrobePreference,
    garmentTypePreference: params.garmentTypePreference,
    season: params.season,
    nonce,
  });
  const resolvedShotIndex = params.studioLaunchShotIndex
    ?? (params.studioLaunchAnglePreference === "全身棚拍角度"
      ? 0
      : params.studioLaunchAnglePreference === "下半身1/3角度"
        ? 4
        : params.studioLaunchAnglePreference === "鞋子上脚特写角度"
          ? 6
          : params.studioLaunchAnglePreference === "3/4侧前方上脚角度"
            ? 7
            : 0);
  return {
    enabled: true,
    anglePreference: params.studioLaunchAnglePreference,
    angleDirection: getStudioLaunchAngleLine(params, scenePreference, true),
    presetPreference: params.studioLaunchPreset,
    resolvedPreset: preset,
    wardrobePreference: params.studioWardrobePreference,
    resolvedWardrobeLine: wardrobe?.wardrobeLine ?? null,
    seriesImageCount: params.seriesImageCount ?? null,
    seriesImageIndex: params.seriesImageIndex ?? null,
    shotIndex: resolvedShotIndex,
  };
}

function resolveStudioVideoAction(params: TeamPromptParams, resolvedShotIndex: ResolvedStudioVideoContext["shotIndex"]) {
  const actions = [
    "Begin in the assigned full-front reference stance. Make one small sleeve-or-cardigan-edge adjustment, then let both arms separate and settle naturally. Keep both feet grounded at believable human scale.",
    "Begin in the assigned full-body three-quarter stance. Complete one restrained weight shift with a small responsive head turn, then settle both feet without crossing or advancing toward the lens.",
    "Begin in the assigned side-oriented full-body stance. Turn the head gently toward the light while one shoe rotates only a few degrees to reveal its side profile, then settle the heel on the studio floor.",
    "Complete one compact rear three-quarter turn, let the visible heel settle on the studio floor, and finish with one brief natural glance back. Do not walk or introduce a second action.",
    "Hold the assigned waist-to-floor front framing. Make one small, natural weight transfer so one shoe becomes clearly readable, then return to a stable grounded lower-body stance.",
    "Hold the assigned waist-to-floor three-quarter framing. Offset one foot only slightly, rotate it a few degrees for side-panel evidence, and settle without enlarging it toward the lens.",
    "Keep the assigned on-foot front detail physically stable. Use only a minimal ankle-weight settling action; preserve left-right structure, toe direction, laces, outsole, and studio-floor contact.",
    "Keep the assigned on-foot three-quarter detail physically stable. Rotate the nearer shoe only a few degrees, settle the outsole fully, and hold the confirmed reference-bound form without moving toward the lens."
  ];
  return actions[resolvedShotIndex ?? params.studioLaunchShotIndex ?? 0]
    ?? actions[0]
    ?? "Hold the assigned studio stance with grounded footwear and one restrained natural action.";
}

export function resolveVideoCreativeContext(params: TeamPromptParams): ResolvedVideoCreativeContext {
  const imageRuntime = generatePromptRuntime(params);
  const imageSelectedOutfitLine = imageRuntime.selectedOutfitLine?.trim() ?? "";
  const initialProfileInput = buildPromptProfileInput(params, imageSelectedOutfitLine);
  const scenePreference = resolveScenePreference(params, initialProfileInput);
  const studio = resolveStudioContext(params, scenePreference);
  const selectedOutfitLine = studio.enabled && studio.resolvedWardrobeLine
    ? studio.resolvedWardrobeLine
    : imageSelectedOutfitLine;
  const profileInput = buildPromptProfileInput(params, selectedOutfitLine);
  const sceneKey = profileInput.sceneKey ?? "weekendCityWalk";
  const seasonContext = chooseSeasonCityVisualContext({
    season: params.season,
    cityProfile: null,
    sceneKey,
    imageType: params.imageType,
    scenePreference,
    userExtraRequirement: params.extraRequirement,
    selectedShoe: params.customShoe.trim() || params.shoe,
  });
  const action = chooseActionLine({
    imageType: params.imageType,
    scenePreference,
    selectedGazeMode: "softOffCamera",
    selectedOutfitLine,
    timeOfDay: seasonContext.timeOfDay,
    userExtraRequirement: params.extraRequirement,
    generationNonce: params.generationNonce,
    forceNoHandheldObject: params.forceNoHandheldObject,
    seriesActionDirective: params.seriesActionDirective,
    seriesPoseType: params.seriesPoseType,
  });
  const sceneBlock = resolveSceneBlock(scenePreference);
  return {
    params,
    selectedOutfitLine,
    profileInput,
    brandVisual: resolveVideoBrandVisual(profileInput, studio.enabled),
    scene: {
      scenePreference,
      sceneKey,
      compositionMode: profileInput.compositionMode,
      activeVisualRoleId: profileInput.activeVisualRoleId,
      locationDirection: sceneBlock?.compactPrompt ?? `Use the existing THERUIZ AURA ${scenePreference} scene context without substituting another location category.`,
      actionDirection: studio.enabled ? resolveStudioVideoAction(params, studio.shotIndex) : action.line,
      actionSupport: action.supportLine,
      seasonalLightDirection: seasonContext.seasonalLightLine,
      seasonalMoodDirection: seasonContext.citySeasonMoodLine,
    },
    studio,
  };
}
