import type { TeamImageType, TeamScenePreference, TeamSeason, TeamShoe } from "../types";
import type { ImageType, OutfitEntry, PerSceneOutfitSceneKey, Season } from "../data/perSceneOutfitLibrary";

const hardOutfitOverrideKeywords = [
  "不要自动搭配",
  "不用自动搭配",
  "不要加穿搭",
  "不要生成穿搭",
  "我指定穿搭",
  "按我写的穿搭"
];

const explicitClothingKeywords = [
  "黑色背心",
  "白裙",
  "短裤",
  "短袖",
  "半裙",
  "连衣裙",
  "背心",
  "衬衫",
  "牛仔",
  "裤",
  "裙",
  "black tank",
  "black sleeveless",
  "white skirt",
  "shorts",
  "short sleeve",
  "short-sleeve",
  "t-shirt",
  "tee",
  "shirt",
  "denim",
  "skirt",
  "dress",
  "trousers",
  "trousers"
];

const positiveSummerSpecificKeywords = [
  "想要裙子",
  "需要裙子",
  "穿裙子",
  "半裙",
  "连衣裙",
  "skirt",
  "dress",
  "想要短裤",
  "需要短裤",
  "穿短裤",
  "bermuda shorts"
];

const supportedSceneMap: Record<string, PerSceneOutfitSceneKey> = {
  通勤上班: "commute",
  咖啡店外: "cafeExterior",
  咖啡店: "cafeExterior",
  周末咖啡: "cafeExterior",
  周末城市散步: "weekendCityWalk",
  买手店街区: "boutiqueStreet",
  精品店街区: "boutiqueStreet",
  花店: "flowerShop",
  面包甜点店: "bakeryDessert",
  书店杂志店: "bookstoreMagazine",
  咖啡馆内: "lightSocial",
  朋友午餐: "lightSocial",
  美术馆: "galleryExhibition",
  "精品超市 / 日常采购": "premiumErrands",
  居家衣帽间: "mirrorCloset",
  旅行酒店: "mirrorCloset",
  酒店咖啡厅内: "hotelTravel",
  健身房内: "gymInterior",
  去运动的路上: "gymCommute"
};

const seasonMap: Record<TeamSeason, Season> = {
  春: "spring",
  夏: "summer",
  秋: "autumn",
  冬: "winter"
};

const shoeMap: Record<TeamShoe, string> = {
  "Cloud Dancer 云舞者": "Cloud Dancer",
  "Sand Dollar 沙钱白": "Sand Dollar",
  "Cappuccino 卡布奇诺": "Cappuccino",
  "Silver Romance 银色浪漫": "Silver Romance",
  "Aire 微风": "Aire",
  "Delphinium Blue 飞燕草蓝": "Delphinium Blue",
  "Lemon 柠檬": "Lemon",
  "Maple Grove 枫林": "Maple Grove",
  "Oreo 奥利奥": "Oreo",
  "Panda 熊猫": "Panda",
  自定义: "ALL"
};

function normalizeText(value?: string) {
  return (value ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

function hasAnyKeyword(text: string | undefined, keywords: string[]) {
  const normalized = normalizeText(text);
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

function isNegatedOutfitRequest(text: string) {
  return /不要|不想|避免|no |not |without/.test(text);
}

export function hasUserSpecifiedClothingRequirement(userExtraRequirement?: string) {
  return (
    hasAnyKeyword(userExtraRequirement, hardOutfitOverrideKeywords) ||
    hasAnyKeyword(userExtraRequirement, explicitClothingKeywords)
  );
}

export function hasSummerSpecificOutfitRequest(userExtraRequirement?: string) {
  const text = normalizeText(userExtraRequirement);
  if (!text || isNegatedOutfitRequest(text)) return false;
  return positiveSummerSpecificKeywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

export function normalizePerSceneSeason(season: TeamSeason | Season): Season {
  return seasonMap[season as TeamSeason] ?? (season as Season);
}

export function normalizePerSceneShoe(shoe: TeamShoe | string) {
  return shoeMap[shoe as TeamShoe] ?? shoe;
}

export function normalizePerSceneImageType(imageType: TeamImageType | ImageType): ImageType | null {
  if (imageType === "产品上脚图") return "onFoot";
  if (imageType === "对镜穿搭图") return "mirror";
  if (imageType === "生活场景图") return "lifestyle";
  if (imageType === "onFoot" || imageType === "mirror" || imageType === "lifestyle") return imageType;
  if (imageType === "gym" || imageType === "gymCommute") return imageType;
  return null;
}

export function resolvePerSceneKey(input: {
  scenePreference: TeamScenePreference | string;
  imageType: TeamImageType | ImageType;
  userExtraRequirement?: string;
}): PerSceneOutfitSceneKey | null {
  const scenePreference = String(input.scenePreference);
  const extra = normalizeText(input.userExtraRequirement);

  if (scenePreference === "自动匹配") {
    if (input.imageType === "产品上脚图") return "commute";
    if (input.imageType === "对镜穿搭图") return "mirrorCloset";
    if (input.imageType === "生活场景图") {
      if (/咖啡|coffee|cafe|café/.test(extra)) return "cafeExterior";
      if (/买手店|精品店|boutique/.test(extra)) return "boutiqueStreet";
      if (/花店|鲜花|flower/.test(extra)) return "flowerShop";
      if (/面包|甜点|烘焙|bakery|dessert/.test(extra)) return "bakeryDessert";
      if (/书店|杂志|bookstore|magazine/.test(extra)) return "bookstoreMagazine";
      if (/超市|采购|grocery|errands/.test(extra)) return "premiumErrands";
      if (/健身|gym|active|training/.test(extra)) return "gymCommute";
      return "weekendCityWalk";
    }
    if (input.imageType === "gymCommute") return "gymCommute";
    if (input.imageType === "gym") return "gymInterior";
    return null;
  }

  const directScene = supportedSceneMap[scenePreference];
  if (directScene) return directScene;

  if (scenePreference === "周末轻采购" && /咖啡|coffee|cafe|café/.test(extra)) return "cafeExterior";
  if (scenePreference === "周末城市散步" && /咖啡|coffee|cafe|café/.test(extra)) return "cafeExterior";
  if (/咖啡|coffee|cafe|café/.test(`${scenePreference} ${extra}`)) return "cafeExterior";
  if (/买手店|精品店|boutique/.test(`${scenePreference} ${extra}`)) return "boutiqueStreet";
  if (/花店|鲜花|flower/.test(`${scenePreference} ${extra}`)) return "flowerShop";
  if (/面包|甜点|烘焙|bakery|dessert/.test(`${scenePreference} ${extra}`)) return "bakeryDessert";
  if (/书店|杂志|bookstore|magazine/.test(`${scenePreference} ${extra}`)) return "bookstoreMagazine";
  if (/超市|采购|grocery|errands/.test(`${scenePreference} ${extra}`)) return "premiumErrands";
  if (/衣帽间|镜前|mirror|closet/.test(`${scenePreference} ${extra}`)) return "mirrorCloset";
  if (/去运动|健身房路上|gym commute|gym transition/.test(`${scenePreference} ${extra}`)) return "gymCommute";

  return null;
}

export function getImageTypeOutfitTags(imageType: TeamImageType | ImageType) {
  const normalized = normalizePerSceneImageType(imageType);
  if (normalized === "mirror") return ["mirror", "outfit relationship", "trouser-readability"];
  if (normalized === "onFoot") return ["shoe-readable", "city walk", "daily walk"];
  if (normalized === "lifestyle") return ["real life", "warm daily", "weekend", "commute"];
  if (normalized === "gym") return ["premium gym", "active", "movement"];
  if (normalized === "gymCommute") return ["gym transition", "active", "daily movement"];
  return [];
}

function entryText(entry: OutfitEntry) {
  return [
    entry.compactLine,
    entry.topCategory,
    entry.bottomCategory,
    entry.outerLayerCategory,
    entry.bagCategory,
    ...(entry.accessoryCategory ?? []),
    ...entry.colorMood,
    ...entry.styleTags
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function isOutfitConflictingWithUserRequirement(entry: OutfitEntry, userExtraRequirement?: string) {
  const userText = normalizeText(userExtraRequirement);
  const text = entryText(entry);

  if (/不要裙子|no skirt|no dress|不要半裙|不要连衣裙/.test(userText) && /skirt|dress|半裙|连衣裙/.test(text)) {
    return true;
  }

  if (/不要短裤|no shorts/.test(userText) && /shorts|bermuda shorts|短裤/.test(text)) {
    return true;
  }

  if (/不要背心|no tank|no sleeveless/.test(userText) && /tank|sleeveless|背心/.test(text)) {
    return true;
  }

  return false;
}

export function scoreOutfitUserPreference(entry: OutfitEntry, userExtraRequirement?: string) {
  const userText = normalizeText(userExtraRequirement);
  const text = entryText(entry);
  let score = 0;

  if (/不要全浅色|not all beige|not all cream/.test(userText)) {
    if (/black|charcoal|navy|dark denim|olive|dark coffee|black accent|deep charcoal/.test(entry.colorMood.join(" ").toLowerCase())) {
      score += 35;
    }
  }

  if (/牛仔|denim/.test(userText) && /denim|jeans/.test(text)) score += 22;
  if (/t恤|t-shirt|tee/.test(userText) && /t-shirt|tee/.test(text)) score += 18;
  if (!isNegatedOutfitRequest(userText) && /裙子|skirt|dress/.test(userText) && /skirt|dress/.test(text)) score += 22;
  if (!isNegatedOutfitRequest(userText) && /短裤|shorts|bermuda/.test(userText) && /shorts|bermuda/.test(text)) score += 22;
  if (/运动|gym|active|健身/.test(userText) && /active|gym|movement|training/.test(text)) score += 26;
  if (/黑色背心|black tank/.test(userText) && /black clean sleeveless top/.test(text)) score += 45;
  if (/背心|tank|sleeveless/.test(userText) && /tank|sleeveless/.test(text)) score += 16;

  return score;
}
