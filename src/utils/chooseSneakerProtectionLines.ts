import type { TeamImageType, TeamScenePreference } from "../types";
import {
  actionSafeShoeDisplayCompact,
  footInShoeAnatomyCompact,
  groundContactCompact,
  gymSneakerIdentityCompact,
  laceTongueClarityCompact,
  laceTensionRealismCompact,
  laceTongueKnotClarityCompact,
  mirrorSneakerAccuracyCompact,
  multiImageSneakerConsistencyCompact,
  naturalTiedLacesCompact,
  onFootTiedLacesCompact,
  outsoleThicknessLockCompact,
  panelStructureLockCompact,
  pairedLacesConsistencyCompact,
  shoeLegRelationshipCompact,
  shoelaceTyingActionCompact,
  skirtShortsShoeVisibilityCompact,
  sneakerClippingControlCompact,
  sneakerShapeLockCompact,
  sockShoeBoundaryCompact,
  stillLifeTiedLacesCompact,
  stillLifeSneakerAccuracyCompact,
  subtleAtmosphereSneakerProtectionCompact,
  toeBoxShapeLockCompact,
  trouserHemSeparationCompact
} from "../data/sneakerProtectionProfiles";
import type { ImageCountIntent } from "./detectImageCountOrSeriesIntent";
import { detectFullShoeVisibility } from "./detectFullShoeVisibility";

export type SneakerProtectionInput = {
  imageType: TeamImageType;
  scenePreference: Exclude<TeamScenePreference, "自动匹配">;
  hasShoe: boolean;
  selectedOutfitLine: string;
  selectedActionLine?: string;
  userExtraRequirement: string;
  imageCountIntent: ImageCountIntent;
};

const trouserKeywords = [
  "trousers",
  "pants",
  "jeans",
  "wide-leg",
  "straight-leg",
  "denim",
  "jogger",
  "active pants",
  "leggings",
  "西裤",
  "裤",
  "牛仔",
  "阔腿裤",
  "直筒裤",
  "运动裤"
];

const skirtShortsKeywords = [
  "skirt",
  "dress",
  "shorts",
  "bermuda shorts",
  "midi skirt",
  "shirt dress",
  "半裙",
  "裙",
  "连衣裙",
  "短裤",
  "百慕大"
];

const sockKeywords = ["socks", "sock", "no-show socks", "low socks", "袜子", "短袜", "船袜"];

const shoelaceKeywords = ["系鞋带", "tying shoelaces", "shoelace", "shoelaces", "鞋带"];

const tiedLacesKeywords = [
  "鞋带自然",
  "鞋带打结",
  "鞋带系好",
  "不要鞋带乱飞",
  "不要鞋带融化",
  "tied laces",
  "natural tied laces",
  "laces tied naturally",
  "no untied laces",
  "no melted laces",
  "鞋带要系好",
  "natural laces"
];

const strongerProtectionKeywords = [
  "鞋子不要变形",
  "鞋型准确",
  "不要厚底",
  "不要跑鞋",
  "不要老爹鞋",
  "不要滑板鞋",
  "鞋底不要变厚",
  "鞋头不要变宽",
  "鞋带清楚",
  "鞋舌清楚",
  "裤脚不要盖住鞋",
  "鞋子完整",
  "不要穿模",
  "不要吃鞋",
  "鞋子露出来",
  "至少一只鞋完整",
  "preserve shoe shape",
  "no deformation",
  "no chunky sole",
  "no running shoe",
  "no dad shoe",
  "no skate shoe",
  "no platform sole",
  "clear laces",
  "clear tongue",
  "trousers not covering shoes",
  "full shoe visible",
  "no clipping",
  "no shoe-foot clipping",
  "at least one shoe fully visible"
];

function includesAny(text: string, keywords: string[]) {
  const normalized = text.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

function addUnique(lines: string[], line: string) {
  if (!line || lines.includes(line)) return;
  lines.push(line);
}

function chooseLowerBodyProtection(text: string) {
  if (includesAny(text, skirtShortsKeywords)) return skirtShortsShoeVisibilityCompact;
  if (includesAny(text, trouserKeywords)) return trouserHemSeparationCompact;
  return trouserHemSeparationCompact;
}

function isActiveSneakerScene(scenePreference: Exclude<TeamScenePreference, "自动匹配">) {
  return scenePreference === "健身房内" || scenePreference === "去运动的路上";
}

export function chooseSneakerProtectionLines(input: SneakerProtectionInput) {
  if (!input.hasShoe) return [];

  const combinedText = [
    input.selectedOutfitLine,
    input.selectedActionLine,
    input.userExtraRequirement
  ]
    .filter(Boolean)
    .join(" ");
  const lines: string[] = [];
  const activeScene = isActiveSneakerScene(input.scenePreference);
  const lowerBodyProtection = chooseLowerBodyProtection(combinedText);
  const wantsStrongerProtection = includesAny(combinedText, strongerProtectionKeywords);
  const mentionsShoelace = includesAny(combinedText, shoelaceKeywords);
  const tiedLacesRequested = includesAny(combinedText, tiedLacesKeywords);

  if (input.imageType === "非产品氛围图") {
    addUnique(lines, subtleAtmosphereSneakerProtectionCompact);
    addUnique(lines, sneakerClippingControlCompact);
    if (wantsStrongerProtection) addUnique(lines, sneakerShapeLockCompact);
    if (input.imageCountIntent !== "singleImage") addUnique(lines, multiImageSneakerConsistencyCompact);
    return lines;
  }

  if (input.imageType === "产品静物图") {
    addUnique(lines, sneakerShapeLockCompact);
    addUnique(lines, stillLifeSneakerAccuracyCompact);
    addUnique(lines, panelStructureLockCompact);
    addUnique(lines, laceTongueClarityCompact);
    addUnique(lines, outsoleThicknessLockCompact);
  } else if (activeScene) {
    addUnique(lines, sneakerShapeLockCompact);
    addUnique(lines, gymSneakerIdentityCompact);
    addUnique(lines, footInShoeAnatomyCompact);
    addUnique(lines, groundContactCompact);
    addUnique(lines, actionSafeShoeDisplayCompact);
    addUnique(lines, outsoleThicknessLockCompact);
  } else if (input.imageType === "产品上脚图") {
    addUnique(lines, sneakerShapeLockCompact);
    addUnique(lines, sneakerClippingControlCompact);
    addUnique(lines, footInShoeAnatomyCompact);
    addUnique(lines, lowerBodyProtection);
    addUnique(lines, shoeLegRelationshipCompact);
    addUnique(lines, outsoleThicknessLockCompact);
  } else if (input.imageType === "对镜穿搭图") {
    addUnique(lines, sneakerShapeLockCompact);
    addUnique(lines, mirrorSneakerAccuracyCompact);
    addUnique(lines, lowerBodyProtection);
    addUnique(lines, shoeLegRelationshipCompact);
    addUnique(lines, outsoleThicknessLockCompact);
  } else if (input.imageType === "生活场景图") {
    addUnique(lines, sneakerShapeLockCompact);
    addUnique(lines, sneakerClippingControlCompact);
    addUnique(lines, groundContactCompact);
    addUnique(lines, actionSafeShoeDisplayCompact);
  } else if (input.imageType === "拍摄花絮 / 材质图") {
    addUnique(lines, sneakerShapeLockCompact);
    addUnique(lines, sneakerClippingControlCompact);
    addUnique(lines, panelStructureLockCompact);
    addUnique(lines, laceTongueClarityCompact);
  } else {
    addUnique(lines, sneakerShapeLockCompact);
    addUnique(lines, sneakerClippingControlCompact);
    addUnique(lines, outsoleThicknessLockCompact);
  }

  if (includesAny(combinedText, sockKeywords)) addUnique(lines, sockShoeBoundaryCompact);

  if (mentionsShoelace) {
    addUnique(lines, laceTongueClarityCompact);
  }

  if (wantsStrongerProtection) {
    addUnique(lines, toeBoxShapeLockCompact);
    addUnique(lines, laceTongueClarityCompact);
  }

  if (input.imageCountIntent !== "singleImage") {
    addUnique(lines, multiImageSneakerConsistencyCompact);
  }

  const visibility = detectFullShoeVisibility({
    imageType: input.imageType,
    scenePreference: input.scenePreference,
    selectedSneakerProtectionLines: lines,
    userExtraRequirement: input.userExtraRequirement,
    finalPromptIntent: combinedText
  });

  if (mentionsShoelace && includesAny(combinedText, ["系鞋带", "tying shoelaces"])) {
    addUnique(lines, shoelaceTyingActionCompact);
    addUnique(lines, laceTongueKnotClarityCompact);
  } else if (tiedLacesRequested || visibility.fullShoeVisibility) {
    addUnique(
      lines,
      tiedLacesRequested
        ? naturalTiedLacesCompact
        : input.imageType === "产品静物图"
          ? stillLifeTiedLacesCompact
          : onFootTiedLacesCompact
    );
    addUnique(lines, laceTongueKnotClarityCompact);
    addUnique(lines, visibility.bothShoesVisible ? pairedLacesConsistencyCompact : laceTensionRealismCompact);
  }

  return lines;
}
