import type { TeamImageType, TeamScenePreference } from "../types";
import type { PerSceneOutfitSceneKey } from "../data/perSceneOutfitLibrary";

const clothingKeywords = [
  "不要自动搭配",
  "不用自动搭配",
  "不要加穿搭",
  "不要生成穿搭",
  "我指定穿搭",
  "按我写的穿搭",
  "衬衫",
  "t恤",
  "t-shirt",
  "tee",
  "背心",
  "tank",
  "针织",
  "knit",
  "毛衣",
  "sweater",
  "开衫",
  "cardigan",
  "外套",
  "jacket",
  "大衣",
  "coat",
  "风衣",
  "trench",
  "西装",
  "blazer",
  "裤",
  "pants",
  "trousers",
  "牛仔",
  "denim",
  "jeans",
  "短裤",
  "shorts",
  "裙",
  "skirt",
  "连衣裙",
  "dress",
  "包",
  "bag",
  "tote",
  "shoulder bag",
  "scarf",
  "围巾"
];

const summerSpecificKeywords = [
  "短裤",
  "bermuda",
  "shorts",
  "裙",
  "skirt",
  "连衣裙",
  "dress",
  "背心",
  "tank",
  "sleeveless",
  "t恤",
  "t-shirt",
  "tee",
  "polo",
  "linen",
  "亚麻",
  "薄开衫",
  "开衫外搭"
];

function normalizeText(value?: string) {
  return (value ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

function hasAnyKeyword(text: string | undefined, keywords: string[]) {
  const normalized = normalizeText(text);
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

export function hasUserSpecifiedClothingRequirement(userExtraRequirement?: string) {
  return hasAnyKeyword(userExtraRequirement, clothingKeywords);
}

export function hasSummerSpecificOutfitRequest(userExtraRequirement?: string) {
  return hasAnyKeyword(userExtraRequirement, summerSpecificKeywords);
}

function inferWeekendSubScene(extra: string): PerSceneOutfitSceneKey {
  if (/咖啡|coffee|cafe|café/.test(extra)) return "cafeExterior";
  if (/精品店|逛街|boutique|shopping|shop/.test(extra)) return "boutiqueStreet";
  if (/花店|花束|flower|bouquet/.test(extra)) return "flowerShop";
  if (/面包|甜品|bakery|dessert|bread/.test(extra)) return "bakeryDessert";
  if (/书店|杂志|bookstore|book|magazine|reading/.test(extra)) return "bookstoreMagazine";
  if (/画廊|展览|gallery|exhibition|museum/.test(extra)) return "galleryExhibition";
  if (/朋友|小聚|午餐|social|friend|lunch/.test(extra)) return "lightSocial";
  if (/街角|转角|corner/.test(extra)) return "cityCorner";
  return "weekendCityWalk";
}

function inferErrandSubScene(extra: string): PerSceneOutfitSceneKey {
  if (/花店|花束|flower|bouquet/.test(extra)) return "flowerShop";
  if (/面包|甜品|bakery|dessert|bread/.test(extra)) return "bakeryDessert";
  if (/书店|杂志|bookstore|book|magazine|reading/.test(extra)) return "bookstoreMagazine";
  return "premiumErrands";
}

export function resolvePerSceneKey(input: {
  scenePreference: TeamScenePreference;
  imageType: TeamImageType;
  userExtraRequirement?: string;
}): PerSceneOutfitSceneKey {
  const extra = normalizeText(input.userExtraRequirement);

  if (input.scenePreference === "自动匹配") {
    if (input.imageType === "产品上脚图") return extra ? inferWeekendSubScene(extra) : "commute";
    if (input.imageType === "对镜穿搭图") return /hotel|酒店|旅行/.test(extra) ? "hotelTravel" : "mirrorCloset";
    if (input.imageType === "生活场景图") return inferWeekendSubScene(extra);
    return "cityCorner";
  }

  if (input.scenePreference === "通勤上班") return "commute";
  if (input.scenePreference === "周末城市散步") return inferWeekendSubScene(extra);
  if (input.scenePreference === "精品超市 / 日常采购" || input.scenePreference === "周末轻采购") {
    return inferErrandSubScene(extra);
  }
  if (input.scenePreference === "旅行酒店") return "hotelTravel";
  if (input.scenePreference === "居家衣帽间") return "mirrorCloset";
  if (input.scenePreference === "玄关出门") return "entrywayDeparture";
  if (input.scenePreference === "窗边阅读") return "bookstoreMagazine";
  if (input.scenePreference === "健身房内") return "gymInterior";
  if (input.scenePreference === "去运动的路上") return "gymCommute";
  if (input.scenePreference === "材质工作台") return input.imageType === "生活场景图" ? "cityCorner" : "bookstoreMagazine";
  if (input.scenePreference === "拍摄花絮") return input.imageType === "对镜穿搭图" ? "mirrorCloset" : "cityCorner";

  return "cityCorner";
}

export function getImageTypeOutfitTags(imageType: TeamImageType) {
  if (imageType === "对镜穿搭图") return ["mirror", "outfit relationship", "trouser-readability"];
  if (imageType === "产品上脚图") return ["shoe-readable", "city walk", "daily walk"];
  if (imageType === "生活场景图") return ["real life", "warm daily", "weekend", "commute"];
  return [];
}
