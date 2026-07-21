import type { ChinaCityProfile } from "../data/chinaUrbanStreetProfiles";
import type { StandardSceneKey } from "../data/outfitDiversityRules";
import {
  indoorCommercialSceneKeys,
  outdoorStreetSceneKeys,
  sceneLightingSpaceProfiles,
  semiIndoorSceneKeys,
  type LightingSpaceProfile,
  type LightingSpaceType
} from "../data/sceneLightingSpaceProfiles";
import type { TeamImageType, TeamScenePreference, TeamSeason } from "../types";

type ChooseLightingSpaceTypeInput = {
  imageType: TeamImageType;
  sceneKey: StandardSceneKey;
  scenePreference?: TeamScenePreference | string;
  cityProfile?: ChinaCityProfile | null;
  season?: TeamSeason | string;
  userExtraRequirement?: string;
};

function userRequestedLightingSpace(extra = ""): LightingSpaceType | null {
  if (/健身房内|premium gym|gym interior|boutique fitness/i.test(extra)) return "indoorGymLight";
  if (/对镜|镜拍|mirror|衣帽间|卧室|房间|室内|窗边|玄关/i.test(extra)) return "indoorNaturalLight";
  if (/店内|室内商业|书店内|咖啡店内|面包店内|超市内|画廊|gallery/i.test(extra)) {
    return "indoorCommercialLight";
  }
  if (/门口|店外|entrance|doorway|storefront|under awning|骑楼|檐下/i.test(extra)) return "semiIndoorThreshold";
  if (/室外|户外|街边|街道|city street|outdoor/i.test(extra)) return "outdoorStreet";
  return null;
}

function inferLightingSpaceType(input: ChooseLightingSpaceTypeInput): LightingSpaceType {
  if (input.scenePreference === "棚内上新拍摄") return "studioLaunchLight";

  const requested = userRequestedLightingSpace(input.userExtraRequirement);
  if (requested) return requested;

  if (input.imageType === "产品静物图" || input.sceneKey === "stillLife" || input.sceneKey === "materialTable") {
    return "stillLifeStudioNatural";
  }
  if (input.imageType === "对镜穿搭图" || input.sceneKey === "mirrorCloset" || input.sceneKey === "entrywayDeparture") {
    return "indoorNaturalLight";
  }
  if (input.scenePreference === "窗边阅读" || input.scenePreference === "居家衣帽间" || input.scenePreference === "玄关出门") {
    return "indoorNaturalLight";
  }
  if (input.scenePreference === "拍摄花絮" || input.scenePreference === "材质工作台") {
    return "stillLifeStudioNatural";
  }
  if (
    input.scenePreference === "咖啡馆内" ||
    input.scenePreference === "酒店咖啡厅内" ||
    input.scenePreference === "朋友午餐" ||
    input.scenePreference === "美术馆" ||
    input.sceneKey === "lightSocial" ||
    input.sceneKey === "galleryExhibition"
  ) {
    return "indoorCommercialLight";
  }
  if (input.sceneKey === "gymInterior") return "indoorGymLight";
  if (input.sceneKey === "hotelTravel") return "indoorNaturalLight";

  if (input.userExtraRequirement && /门口|entrance|doorway|storefront|under awning|檐下/i.test(input.userExtraRequirement)) {
    return "semiIndoorThreshold";
  }
  if (semiIndoorSceneKeys.includes(input.sceneKey) && /门口|入口|doorway|entrance|storefront/i.test(`${input.scenePreference ?? ""} ${input.userExtraRequirement ?? ""}`)) {
    return "semiIndoorThreshold";
  }
  if (indoorCommercialSceneKeys.includes(input.sceneKey) && /店内|室内|interior|inside|shelf|counter|gallery/i.test(input.userExtraRequirement ?? "")) {
    return "indoorCommercialLight";
  }
  if (outdoorStreetSceneKeys.includes(input.sceneKey)) return "outdoorStreet";

  return "outdoorStreet";
}

export type LightingSpaceSelection = LightingSpaceProfile;

export function chooseLightingSpaceType(input: ChooseLightingSpaceTypeInput): LightingSpaceSelection {
  const lightingSpaceType = inferLightingSpaceType(input);
  return sceneLightingSpaceProfiles[lightingSpaceType];
}
