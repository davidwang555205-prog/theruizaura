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
    "旅行酒店": "hotelTravel", "酒店咖啡厅内": "hotelCafeInterior", "酒店房间": "hotelTravel", "酒店门口 / 门厅": "hotelTravel",
    "周末城市散步": "weekendCityWalk", "精品超市 / 日常采购": "premiumErrands",
    "玄关出门": "entrywayDeparture", "回家进门": "entrywayDeparture",
    "美术馆": "galleryExhibition", "书店 / 杂志店门口": "bookstoreMagazine",
    "花店 / 买花": "flowerShop", "朋友午餐": "lightSocial",
    "居家衣帽间": "mirrorCloset", "衣帽间 / 更衣角": "mirrorCloset",
    "健身房内": "gymInterior", "棚内上新拍摄": "studioLaunch",
    "社区市集 / 精品买菜": "premiumErrands", "城市街角 / 安静街区": "weekendCityWalk",
  };
  return sceneKeyMap[scene] ?? "weekendCityWalk";
}

export function buildPromptProfileInput(
  params: TeamPromptParams,
  selectedOutfitLine = ""
): PromptProfileInput {
  const hasShoe = resolveProductPresence(params);
  return {
    brandId: "theruiz_aura",
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
    userExtraRequirement: params.extraRequirement,
    isMultiImage: !!params.seriesImageCount && params.seriesImageCount >= 2,
    seriesImageIndex: params.seriesImageIndex,
    seriesImageCount: params.seriesImageCount,
    studioShotIndex: params.studioLaunchShotIndex,
    generationNonce: params.generationNonce,
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
