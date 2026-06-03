import type { TeamImageType, TeamScenePreference, TeamSeason } from "../types";
import {
  antiAISceneBoundaryCompact,
  behindScenesMaterialRealismCompact,
  culturalSpaceRealismCompact,
  gettingReadyMirrorRealismCompact,
  hotelRealismCompact,
  premiumErrandsRealismCompact,
  premiumGymRealismCompact,
  realLightDirectionCompact,
  sceneHierarchyCompact,
  sceneRealismCompact,
  spatialLogicCompact,
  stillLifeSceneRealismCompact,
  storefrontEntranceRealismCompact,
  subtleLivedInDetailCompact,
  urbanStreetRealismCompact
} from "../data/sceneRealismProfiles";

export type SceneRealismInput = {
  imageType: TeamImageType;
  scenePreference: Exclude<TeamScenePreference, "自动匹配">;
  season: TeamSeason;
  timeOfDay: string;
  hasShoe: boolean;
  selectedActionLine?: string;
  selectedOutdoorStreetLine?: string;
  selectedStorefrontLine?: string;
  userExtraRequirement: string;
};

const strongerRealismKeywords = [
  "真实场景",
  "真实一点",
  "不要假背景",
  "不要ai场景",
  "不要AI场景",
  "不要棚拍",
  "生活化",
  "真实空间",
  "真实街景",
  "真实店铺",
  "真实健身房",
  "真实酒店",
  "不要太空",
  "不要太干净",
  "不要太假高级",
  "real scene",
  "realistic background",
  "no fake background",
  "no ai scene",
  "not studio set",
  "lived-in",
  "real space",
  "realistic street",
  "realistic storefront",
  "real gym",
  "real hotel",
  "not empty",
  "not too perfect"
];

function includesAny(text: string, keywords: string[]) {
  const normalized = text.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

function addUnique(lines: string[], line: string) {
  if (!line || lines.includes(line)) return;
  lines.push(line);
}

function getSceneProfile(input: SceneRealismInput) {
  const text = [input.scenePreference, input.selectedActionLine, input.userExtraRequirement]
    .filter(Boolean)
    .join(" ");

  if (input.imageType === "产品静物图") return stillLifeSceneRealismCompact;
  if (
    input.imageType === "拍摄花絮 / 材质图" ||
    input.scenePreference === "材质工作台" ||
    input.scenePreference === "拍摄花絮"
  ) {
    return behindScenesMaterialRealismCompact;
  }
  if (input.scenePreference === "健身房内" || input.scenePreference === "去运动的路上") {
    return input.scenePreference === "健身房内"
      ? premiumGymRealismCompact
      : urbanStreetRealismCompact;
  }
  if (input.scenePreference === "旅行酒店") return hotelRealismCompact;
  if (
    input.imageType === "对镜穿搭图" ||
    input.scenePreference === "居家衣帽间" ||
    input.scenePreference === "玄关出门"
  ) {
    return gettingReadyMirrorRealismCompact;
  }
  if (input.scenePreference === "精品超市 / 日常采购" || input.scenePreference === "周末轻采购") {
    return premiumErrandsRealismCompact;
  }
  if (input.scenePreference === "窗边阅读" || includesAny(text, ["书店", "gallery", "bookstore", "画廊", "展览"])) {
    return culturalSpaceRealismCompact;
  }
  if (
    input.scenePreference === "周末城市散步" ||
    input.scenePreference === "通勤上班" ||
    includesAny(text, ["咖啡", "coffee", "bakery", "flower", "花店", "面包", "书店"])
  ) {
    return includesAny(text, ["coffee", "咖啡", "bakery", "flower", "花店", "面包", "bookstore", "书店"])
      ? storefrontEntranceRealismCompact
      : urbanStreetRealismCompact;
  }

  return spatialLogicCompact;
}

function shouldUseIndoorSpatialLogic(input: SceneRealismInput) {
  return (
    input.imageType === "对镜穿搭图" ||
    input.imageType === "产品静物图" ||
    input.imageType === "拍摄花絮 / 材质图" ||
    input.scenePreference === "旅行酒店" ||
    input.scenePreference === "居家衣帽间" ||
    input.scenePreference === "玄关出门" ||
    input.scenePreference === "窗边阅读" ||
    input.scenePreference === "材质工作台" ||
    input.scenePreference === "拍摄花絮" ||
    input.scenePreference === "健身房内"
  );
}

export function chooseSceneRealismLines(input: SceneRealismInput) {
  const lines: string[] = [];
  const text = [input.selectedActionLine, input.userExtraRequirement].filter(Boolean).join(" ");
  const strongerRealismRequested = includesAny(text, strongerRealismKeywords);

  addUnique(lines, strongerRealismRequested ? sceneRealismCompact : getSceneProfile(input));

  if (strongerRealismRequested) {
    addUnique(lines, antiAISceneBoundaryCompact);
    addUnique(lines, getSceneProfile(input));
  } else if (shouldUseIndoorSpatialLogic(input)) {
    addUnique(lines, spatialLogicCompact);
  } else {
    addUnique(lines, subtleLivedInDetailCompact);
  }

  addUnique(lines, realLightDirectionCompact);

  if (input.hasShoe || input.imageType !== "非产品氛围图") {
    addUnique(lines, sceneHierarchyCompact);
  }

  return lines.slice(0, 4);
}
