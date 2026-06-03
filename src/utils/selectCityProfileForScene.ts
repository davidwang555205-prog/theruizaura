import type { TeamImageType } from "../types";
import { sceneToCityPriorityMap } from "../data/citySceneMatchingProfiles";
import type { ChinaCityProfile } from "../data/chinaUrbanStreetProfiles";
import type { StandardSceneKey } from "../data/outfitDiversityRules";

const userCityKeywords: Array<[ChinaCityProfile, RegExp]> = [
  ["Shanghai", /上海|Shanghai|安福路|武康路|法租界|梧桐|梧桐树|上海街区/i],
  ["Chengdu", /成都|Chengdu|太古里|桐梓林|玉林|麓湖|成都街区|社区商业/i],
  ["Shenzhen", /深圳|Shenzhen|南山|福田|深圳街景|深圳日常街区|会所附近|现代一点/i],
  ["Hangzhou", /杭州|Hangzhou|杭州街景|杭州日常街区|滨江|天目里|松弛一点|咖啡书店感/i],
  ["Beijing", /北京|Beijing|三里屯|国贸|798|北京街景|北京日常街区|成熟都市感/i],
  ["GenericChineseCity", /中国街景|中国城市|真实中国街道|不要欧美|不要欧洲|不要国外街道|不要外国街拍/i]
];

function shouldSkipCityLine(imageType: TeamImageType, sceneKey: StandardSceneKey) {
  return (
    imageType === "对镜穿搭图" ||
    imageType === "产品静物图" ||
    imageType === "拍摄花絮 / 材质图" ||
    imageType === "非产品氛围图" ||
    sceneKey === "mirrorCloset" ||
    sceneKey === "gymInterior" ||
    sceneKey === "stillLife" ||
    sceneKey === "materialTable" ||
    sceneKey === "atmosphere"
  );
}

export function selectCityProfileForScene(input: {
  imageType: TeamImageType;
  sceneKey: StandardSceneKey;
  userExtraRequirement: string;
}): ChinaCityProfile | null {
  if (shouldSkipCityLine(input.imageType, input.sceneKey)) return null;

  const userCity = userCityKeywords.find(([, pattern]) => pattern.test(input.userExtraRequirement))?.[0];
  if (userCity) return userCity;

  return sceneToCityPriorityMap[input.sceneKey]?.[0] ?? "GenericChineseCity";
}
