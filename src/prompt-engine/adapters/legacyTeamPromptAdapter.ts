import type { TeamPromptParams } from "../../types";
import type { CompositionMode, PromptProfileInput } from "../contracts";
import { compilePrompt } from "../compilePrompt";
import { getPromptEngineConfig, recordCompareResult } from "../promptFeatureFlags";
import { logDiagnostics } from "../diagnostics";
import { generateTeamPrompt as legacyGenerateTeamPrompt } from "../../utils/generatePrompt";
import { resolveProductPresence } from "../normalizePromptProfileInput";
import { resolveLifestyleFaceVariationForCard } from "../../data/lifestyleFaceVariationPlans";

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

function resolveLifestyleSeriesFaceVariation(
  params: TeamPromptParams,
  topicId: string | undefined
): NonNullable<TeamPromptParams["seriesFaceVariation"]> | undefined {
  if (params.seriesFaceVariation) return params.seriesFaceVariation;
  if (topicId !== "lifestyle_soft_seeding") return undefined;
  if (!params.seriesImageCount || params.seriesImageCount < 2 || typeof params.seriesImageIndex !== "number") {
    return undefined;
  }

  const cameraCardIndex = params.imageType === "对镜穿搭图"
    ? -1
    : Math.abs(params.generationNonce + params.seriesImageCount) % params.seriesImageCount;
  return resolveLifestyleFaceVariationForCard({
    captureStyle: params.captureStyle ?? "standard",
    index: params.seriesImageIndex,
    bodyOrientation: params.seriesActionBodyOrientation,
    cameraCardIndex,
    rotationIndex: params.seriesImageIndex
  });
}

const generatedLifestyleActionPhrasePatterns: Array<[RegExp, string]> = [
  [
    /\bwith\s+(?:a|one)?\s*(?:(?:short|small|compact|safe|natural|quiet|soft|calm|restrained|believable|ordinary)\s+)*(?:(?:walking|standing|waiting)\s+)?(?:step|stride|pause|transition|posture|moment)\b(?:\s+or\s+(?:a|one)?\s*(?:(?:short|small|compact|safe|natural|quiet|soft|calm|restrained)\s+)*(?:(?:walking|standing|waiting)\s+)?(?:step|stride|pause|moment))?/gi,
    "with believable scene context"
  ],
  [/\b(?:seated|standing|walking)\s+or\s+(?:seated|standing|walking)\s+(?:pause|moment)\b/gi, "daily-life context"],
  [/\b(?:natural\s+)?standing pause or short walk\b/gi, "believable daily-life context"],
  [/\b(?:one\s+)?(?:safe\s+)?standing or walking moment\b/gi, "believable daily-life context"],
  [/\b(?:short\s+)?natural walking pause\b/gi, "believable daily-life context"],
  [/\b(?:one\s+)?natural sit-to-stand or settling pause\b/gi, "believable furniture relationship"],
  [/\bstanding or seated rest(?: only)?\b/gi, "quiet transition context"],
  [/\bquiet standing transition\b/gi, "quiet arrival context"],
  [/\b(?:gallery\s+)?walking or standing moment\b/gi, "gallery visit context"],
  [/\b(?:one\s+)?(?:small|natural)\s+(?:clothing|garment)\s+adjustment\b/gi, "wearable garment state"],
  [/\bsubtle turn toward a friend\b/gi, "believable nearby-friend context"],
  [/\bnatural seated posture\b/gi, "believable furniture relationship"],
  [/\bnatural walking posture(?:\s+or\s+(?:a\s+)?(?:short|quiet|soft)\s+(?:waiting\s+)?pause)?\b/gi, "believable daily-life context"],
  [/\b(?:parking-to-office\s+)?walking transition\b/gi, "believable scene context"],
  [/\bstable posture\b/gi, "believable scene context"]
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

  // Once an authoritative Action Lock exists, generated scene prose may own
  // only location, atmosphere, object placement, and product readability. Use
  // semantic action classes rather than a synonym-by-synonym blacklist so new
  // variants such as "short natural walking step" cannot leak a second body
  // instruction back into the Provider prompt. User-authored requirements are
  // otherwise preserved.
  for (const [pattern, replacement] of generatedLifestyleActionPhrasePatterns) {
    next = next.replace(pattern, replacement);
  }

  return next
    .replace(/\bwith believable scene context,?\s*with\b/gi, "with")
    .replace(/\s{2,}/g, " ")
    .trim();
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
