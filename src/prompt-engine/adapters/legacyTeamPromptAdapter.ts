import type { TeamPromptParams } from "../../types";
import type { CompositionMode, PromptProfileInput } from "../contracts";
import { compilePrompt } from "../compilePrompt";
import { getPromptEngineConfig, recordCompareResult } from "../promptFeatureFlags";
import { logDiagnostics } from "../diagnostics";
import { generateTeamPrompt as legacyGenerateTeamPrompt } from "../../utils/generatePrompt";
import { resolveProductPresence } from "../normalizePromptProfileInput";

function resolveCompositionMode(params: TeamPromptParams): CompositionMode {
  if (params.imageType === "产品静物图") return "stillLife";
  if (params.imageType === "拍摄花絮 / 材质图") return "materialDetail";
  if (params.imageType === "非产品氛围图") return "atmosphere";
  if (params.imageType === "对镜穿搭图") return "mirrorFull";
  if (params.scenePreference === "棚内上新拍摄") {
    if (typeof params.studioLaunchShotIndex === "number") {
      if (params.studioLaunchShotIndex <= 3) return "fullFigure";
      if (params.studioLaunchShotIndex <= 5) return "studioLowerThird";
      return "studioOnFootDetail";
    }
    const angle = params.studioLaunchAnglePreference;
    if (angle === "下半身1/3角度") return "studioLowerThird";
    if (angle === "鞋子上脚特写角度") return "studioOnFootDetail";
    if (angle === "3/4侧前方上脚角度") return "studioThreeQuarter";
    return "fullFigure";
  }
  return "onFootLifestyle";
}

function mapSceneToKey(scene: string): string {
  const sceneKeyMap: Record<string, string> = {
    "通勤上班": "commute", "商务区转角": "commute", "写字楼门口": "commute",
    "咖啡馆内": "cafeInterior", "咖啡店门口": "cafeExterior",
    "旅行酒店": "weekendCityWalk", "酒店咖啡厅内": "cafeInterior", "酒店房间": "weekendCityWalk", "酒店门口 / 门厅": "weekendCityWalk",
    "周末城市散步": "weekendCityWalk", "精品超市 / 日常采购": "premiumErrands",
    "玄关出门": "entrywayDeparture", "回家进门": "entrywayDeparture",
    "美术馆": "galleryExhibition", "书店 / 杂志店门口": "bookstoreMagazine",
    "花店 / 买花": "flowerShop", "朋友午餐": "lightSocial",
    "居家衣帽间": "mirrorCloset", "衣帽间 / 更衣角": "mirrorCloset",
    "材质工作台": "materialTable", "工作台 / 桌边整理": "materialTable", "拍摄花絮": "materialTable",
    "窗边阅读": "bookstoreMagazine", "窗边阅读角": "bookstoreMagazine",
    "健身房内": "gymInterior", "棚内上新拍摄": "studioLaunch",
    "社区市集 / 精品买菜": "premiumErrands", "城市街角 / 安静街区": "weekendCityWalk",
  };
  return sceneKeyMap[scene] ?? "weekendCityWalk";
}

function resolveDefaultVisualRole(params: TeamPromptParams): "A1" | "A3" | "B3" | "B4" | "C1" | "C2" | "C3" | "C4" | "C5" | undefined {
  if (params.scenePreference === "棚内上新拍摄") {
    if (params.studioLaunchShotIndex === 1) return "B4";
    if (params.studioLaunchShotIndex === 2) return "C1";
    return "B3";
  }
  if (params.imageType === "产品静物图") return "C3";
  if (params.imageType === "拍摄花絮 / 材质图") return "C4";
  if (params.imageType === "非产品氛围图") return undefined;
  return "A1";
}

function resolveTopicId(params: TeamPromptParams) {
  return params.topicId ?? (params.scenePreference === "棚内上新拍摄"
    ? "studio_launch_shoot"
    : params.imageType === "生活场景图"
      ? "lifestyle_soft_seeding"
      : undefined);
}

type FaceVariation = NonNullable<TeamPromptParams["seriesFaceVariation"]>;

const lifestyleStandardFaceVariations: FaceVariation[] = [
  {
    id: "lifestyle-face-camera-acknowledgement",
    line: "Use a soft three-quarter head angle with one brief friendly camera acknowledgement, relaxed eyelids, a faint asymmetric smile, and natural catchlights."
  },
  {
    id: "lifestyle-face-path-focus",
    line: "Let the head follow the walking or movement direction while the eyes track the real path ahead, with a relaxed brow and resting lips."
  },
  {
    id: "lifestyle-face-downward-check",
    line: "Angle the head slightly downward and let the eyes check the sneaker, garment hem, or immediate floor path, with relaxed brows and a quiet neutral mouth."
  },
  {
    id: "lifestyle-face-scene-response",
    line: "Turn the head toward one real scene detail with an off-camera gaze, a small natural brow response, and an unforced mouth shape."
  },
  {
    id: "lifestyle-face-post-action-release",
    line: "Capture the face just after the body action settles, with a soft exhale, relaxed eyelids, subtly parted or resting lips, and gaze continuing beyond the action path."
  },
  {
    id: "lifestyle-face-listening-side",
    line: "Use a quiet listening-like side attention toward a nearby person or environmental cue, with one eye slightly nearer the camera, a calm jaw, and no held portrait smile."
  },
  {
    id: "lifestyle-face-light-response",
    line: "Let the face respond subtly to changing daylight or reflection, with a slight squint or eyelid adjustment, relaxed lips, and the head remaining secondary to the body action."
  },
  {
    id: "lifestyle-face-transition-glance",
    line: "Use a fleeting glance toward the next practical destination during the transition, with a small head turn, neutral brow, and an expression that feels unfinished rather than posed."
  }
];

const lifestyleTelephotoFaceVariations: FaceVariation[] = [
  {
    id: "lifestyle-telephoto-face-side-detail",
    line: "Use a soft three-quarter head angle with the eyes resting on a practical scene detail to the side, a faint asymmetric smile, and no eye contact with the lens."
  },
  {
    id: "lifestyle-telephoto-face-path-focus",
    line: "Let the head follow the movement direction while the eyes track the path ahead rather than the lens, with relaxed eyelids, a soft jaw, and resting lips."
  },
  {
    id: "lifestyle-telephoto-face-downward-check",
    line: "Angle the head slightly downward and let the eyes check the sneaker, garment hem, or immediate floor path, with relaxed brows and no camera awareness."
  },
  {
    id: "lifestyle-telephoto-face-window-response",
    line: "Turn the head subtly toward architecture, a storefront, artwork, or another real scene cue, with an off-camera gaze, a small brow response, and natural catchlights."
  },
  {
    id: "lifestyle-telephoto-face-post-action-release",
    line: "Capture a quiet face just after the action settles, with a soft exhale, relaxed eyelids, resting lips, and the gaze placed just beyond the walking path, never toward the lens."
  },
  {
    id: "lifestyle-telephoto-face-companion-attention",
    line: "Use a brief listening-like attention toward a nearby companion or practical destination outside the frame, with a calm jaw, slight head turn, and no direct camera acknowledgement."
  },
  {
    id: "lifestyle-telephoto-face-light-response",
    line: "Let the eyes and eyelids respond subtly to real daylight or reflection while the head remains aligned with the action, with relaxed lips and an entirely off-camera gaze."
  },
  {
    id: "lifestyle-telephoto-face-transition-glance",
    line: "Use a fleeting off-camera glance toward the next destination during movement, with a small unfinished head turn, neutral brow, and no portrait-like facial hold."
  }
];

function resolveLifestyleSeriesFaceVariation(
  params: TeamPromptParams,
  topicId: string | undefined
): FaceVariation | undefined {
  if (params.seriesFaceVariation) return params.seriesFaceVariation;
  if (topicId !== "lifestyle_soft_seeding") return undefined;
  if (!params.seriesImageCount || params.seriesImageCount < 2 || typeof params.seriesImageIndex !== "number") {
    return undefined;
  }

  const plan = params.captureStyle === "telephoto_candid"
    ? lifestyleTelephotoFaceVariations
    : lifestyleStandardFaceVariations;
  return plan[params.seriesImageIndex % plan.length];
}

const generatedLifestyleActionHintReplacements: Array<[RegExp, string]> = [
  [/\bshort natural step or quiet pause\b/gi, "natural everyday presence"],
  [/\bsmall natural step\b/gi, "natural everyday presence"],
  [/\bnatural walking posture or a short waiting pause\b/gi, "natural everyday presence"],
  [/\bshort safe step\b/gi, "natural everyday movement"],
  [/\bcompact walking step\b/gi, "natural everyday movement"],
  [/\bshort natural stride\b/gi, "natural everyday movement"],
  [/\bseated or standing pause\b/gi, "natural everyday presence"],
  [/\bwalking or standing moment\b/gi, "natural everyday presence"],
  [/\bgallery walking or standing moment\b/gi, "gallery visit moment"],
  [/\bsmall clothing adjustment\b/gi, "natural garment behavior"],
  [/\bsubtle turn toward a friend\b/gi, "natural engagement with a nearby friend"]
];

function sanitizeLifestyleGeneratedRequirement(
  params: TeamPromptParams,
  topicId: string | undefined
) {
  if (topicId !== "lifestyle_soft_seeding" || !params.seriesActionDirective) {
    return params.extraRequirement;
  }

  // The lifestyle generator historically injected a five-card face beat into
  // extraRequirement. The structured Face Variation Lock now owns this layer,
  // so remove the legacy beat to avoid two competing facial instructions.
  let next = params.extraRequirement.replace(/Head-and-face beat for this card:[^.]*\./gi, " ");

  // Scene entries should describe where the image happens, while actionLock is
  // the single authority for what the body is doing. Neutralize only the known
  // generated action phrases from the scene library; do not strip arbitrary
  // user-authored action requests.
  for (const [pattern, replacement] of generatedLifestyleActionHintReplacements) {
    next = next.replace(pattern, replacement);
  }

  return next.replace(/\s{2,}/g, " ").trim();
}

export function buildPromptProfileInput(
  params: TeamPromptParams,
  selectedOutfitLine = ""
): PromptProfileInput {
  const hasShoe = resolveProductPresence(params);
  const topicId = resolveTopicId(params);
  return {
    brandId: "theruiz_aura",
    provider: "image2",
    topicId,
    activeVisualRoleId: params.activeVisualRoleId ?? resolveDefaultVisualRole(params),
    imageType: params.imageType,
    compositionMode: resolveCompositionMode(params),
    scenePreference: params.scenePreference,
    sceneKey: params.imageType === "非产品氛围图" ? undefined : mapSceneToKey(params.scenePreference) as any,
    season: params.season,
    modelChoice: params.modelChoice,
    modelContinuity: params.modelContinuity,
    hasShoe,
    garmentTypePreference: params.garmentTypePreference,
    selectedOutfitLine: selectedOutfitLine.trim(),
    userExtraRequirement: sanitizeLifestyleGeneratedRequirement(params, topicId),
    isMultiImage: !!params.seriesImageCount && params.seriesImageCount >= 2,
    seriesImageIndex: params.seriesImageIndex,
    seriesImageCount: params.seriesImageCount,
    seriesFaceVariation: resolveLifestyleSeriesFaceVariation(params, topicId),
    studioShotIndex: params.studioLaunchShotIndex,
    contentCategory: params.contentCategory,
    captureStyle: params.captureStyle,
    generationNonce: params.generationNonce,
    selectedProductTruth: params.selectedProductTruth,
    productTruthProvenance: params.productTruthAssetIds
      ? { source: "current_task_uploaded_images", assetIds: params.productTruthAssetIds, referenceSetId: params.referencePlan?.referenceSetId, taskProductTruthId: (params.selectedProductTruth as { taskProductTruthId?: string } | undefined)?.taskProductTruthId, version: (params.selectedProductTruth as { version?: string } | undefined)?.version }
      : undefined,
    referencePlan: params.referencePlan,
    strictProduction: params.strictProduction,
    atmosphereProductPresenceMode: params.atmosphereProductPresenceMode,
    atmosphereProductPaletteEchoMode: params.atmosphereProductPaletteEchoMode,
    atmosphereProductPaletteClass: params.atmosphereProductPaletteClass,
    cardRole: params.seriesActionFamily,
    cardFraming: params.seriesPoseType,
    cardOrientation: params.seriesActionBodyOrientation,
    actionLock: params.seriesActionDirective,
    sceneLock: params.scenePreference === "棚内上新拍摄" ? "professional studio launch set" : undefined,
    identityContinuity: params.modelContinuity === "延续上一组人物" ? "same selected person identity" : undefined,
    outfitContinuity: params.lockedOutfitLine ? "same locked outfit across the series" : undefined,
    studioContinuity: params.scenePreference === "棚内上新拍摄" ? "same studio backdrop, light direction, and color grade" : undefined,
  };
}

export function generateTeamPrompt(params: TeamPromptParams): { prompt: string } {
  const config = getPromptEngineConfig();

  if (config.mode === "legacy") {
    return legacyGenerateTeamPrompt(params);
  }

  const legacyOutput = config.mode === "compare" ? legacyGenerateTeamPrompt(params) : null;
  const input = buildPromptProfileInput(params);
  const result = compilePrompt(input);

  if (config.enableDiagnostics) logDiagnostics(result);

  if (config.mode === "compare") {
    recordCompareResult(
      `${params.imageType}-${input.compositionMode}`,
      legacyOutput?.prompt ?? "",
      result.prompt
    );
    return { prompt: legacyOutput?.prompt ?? "" };
  }

  return { prompt: result.prompt };
}
