import type { StandardSceneKey } from "../data/outfitDiversityRules";
import {
  getEuropeanUrbanStreetProfile,
  type EuropeanStreetProfileKey
} from "../data/europeanUrbanStreetProfiles";
import type { TeamImageType, TeamScenePreference } from "../types";

const eligibleScenes = new Set<TeamScenePreference>([
  "通勤上班",
  "商务区转角",
  "写字楼门口",
  "停车后步行去办公室",
  "周末城市散步",
  "楼下便利店 / 咖啡外带",
  "咖啡店门口",
  "书店 / 杂志店门口",
  "花店 / 买花",
  "精品超市 / 日常采购",
  "社区市集 / 精品买菜",
  "城市街角 / 安静街区",
  "雨天街角",
  "周末轻采购",
  "酒店门口 / 门厅",
  "去运动的路上",
  "周末轻旅行出发"
]);

const explicitCityPatterns: Array<[EuropeanStreetProfileKey, RegExp]> = [
  ["Florence", /佛罗伦萨|Florence|Firenze/i],
  ["Monaco", /摩纳哥|Monaco/i],
  ["Austria", /奥地利|维也纳|萨尔茨堡|Austria|Austrian|Vienna|Salzburg/i],
  ["Spain", /西班牙|巴塞罗那|马德里|Spain|Spanish|Barcelona|Madrid/i],
  ["Paris", /巴黎|法国街景|Paris|Parisian/i],
  ["Italy", /意大利|米兰|博洛尼亚|Italy|Italian|Milan|Bologna/i]
];

const chineseLocationRequest = /中国街景|中国城市|上海|成都|深圳|杭州|北京|不要欧洲|避免欧洲|Chinese city|Shanghai|Chengdu|Shenzhen|Hangzhou|Beijing|no Europe|avoid Europe/i;
const broadEuropeanRequest = /欧洲街景|欧洲城市|欧洲街道|European street|European city/i;
const rotation: Array<EuropeanStreetProfileKey | null> = [
  null,
  "Paris",
  null,
  "Italy",
  null,
  "Florence",
  null,
  "Austria",
  null,
  "Monaco",
  null,
  "Spain"
];

function canUseEuropeanStreet(input: {
  imageType: TeamImageType;
  sceneKey: StandardSceneKey;
  scenePreference: Exclude<TeamScenePreference, "自动匹配">;
}) {
  if (input.imageType === "对镜穿搭图" || input.imageType === "产品静物图" || input.imageType === "拍摄花絮 / 材质图") {
    return false;
  }
  if (["mirrorCloset", "gymInterior", "stillLife", "materialTable", "studioLaunch"].includes(input.sceneKey)) {
    return false;
  }
  return eligibleScenes.has(input.scenePreference);
}

export function selectEuropeanStreetProfileForScene(input: {
  imageType: TeamImageType;
  sceneKey: StandardSceneKey;
  scenePreference: Exclude<TeamScenePreference, "自动匹配">;
  userExtraRequirement: string;
  generationNonce?: number;
}) {
  if (!canUseEuropeanStreet(input) || chineseLocationRequest.test(input.userExtraRequirement)) return null;

  const explicit = explicitCityPatterns.find(([, pattern]) => pattern.test(input.userExtraRequirement))?.[0];
  const nonce = Math.max(0, input.generationNonce ?? 0);
  const selected = explicit ?? (broadEuropeanRequest.test(input.userExtraRequirement)
    ? (["Paris", "Italy", "Florence", "Austria", "Monaco", "Spain"] as EuropeanStreetProfileKey[])[nonce % 6]
    : rotation[nonce % rotation.length]);

  return selected ? getEuropeanUrbanStreetProfile(selected) : null;
}
