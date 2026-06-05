import type { TeamGarmentTypePreference } from "../types";
import type { ChinaCityProfile } from "../data/chinaUrbanStreetProfiles";
import { cityOutfitPreferenceMap } from "../data/cityOutfitPreferenceMap";
import { garmentTypePreferenceMap } from "../data/outfitDiversityRules";
import type { SceneOutfitSeed } from "../data/sceneOutfitSeedLibrary";
import { shoeOutfitPreferenceMap } from "../data/shoeOutfitPreferenceMap";
import type { OutfitGeneratedHistoryEntry } from "./outfitGeneratedHistory";
import type { ParsedUserOutfitRequirement } from "./parseUserOutfitRequirement";

export const minimumAcceptableOutfitScore = 65;

export type OutfitScoreBreakdown = {
  sceneMatchScore: number;
  seasonMatchScore: number;
  shoeMatchScore: number;
  garmentTypeScore: number;
  colorDirectionScore: number;
  styleFreshnessScore: number;
  visualAnchorScore: number;
  cityMoodScore: number;
  userRequirementScore: number;
  humanRealismScore: number;
  shoeVisibilityScore: number;
  sensitiveRiskPenalty: number;
  repetitionPenalty: number;
  propRiskPenalty: number;
  promptBudgetPenalty: number;
  totalScore: number;
  hardRejected: boolean;
  riskFlags: string[];
};

export type ScoreOutfitCandidateInput = {
  outfit: SceneOutfitSeed;
  sceneKey: string;
  season: "spring" | "summer" | "autumn" | "winter";
  shoe: string;
  imageType: string | null;
  garmentTypePreference: TeamGarmentTypePreference;
  cityProfile?: ChinaCityProfile | null;
  userExtraRequirement?: string;
  parsedUserRequirement: ParsedUserOutfitRequirement;
  generatedHistory: OutfitGeneratedHistoryEntry[];
  previousOutfitId?: string | null;
};

const sensitiveWords = [
  "sexy",
  "seductive",
  "bodycon",
  "hot pants",
  "sports bra",
  "beauty selfie",
  "revealing",
  "curvy",
  "young girl",
  "teen girl"
];

const shoeBlockingWords = [
  "maxi skirt",
  "floor-length",
  "covering shoes",
  "long coat covering shoes",
  "oversized shopping bag",
  "props near shoes"
];

const primaryHandheldWords = ["coffee", "cup", "book", "magazine", "flowers", "flower", "paper bag", "water bottle", "phone"];

const handheldPairs = [
  ["coffee", "flowers"],
  ["coffee", "book"],
  ["phone", "coffee"],
  ["tote", "water bottle"]
];

function textFor(outfit: SceneOutfitSeed) {
  return [
    outfit.outfitLine,
    outfit.stylingRealismLine,
    outfit.topCategory,
    outfit.bottomCategory,
    outfit.outerLayerCategory,
    outfit.bagCategory,
    outfit.visualAnchor,
    ...(outfit.accessoryCategory ?? []),
    ...(outfit.forbidden ?? [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

function hasMultipleMainHandheld(text: string) {
  return handheldPairs.some(([first, second]) => {
    const firstMatch = new RegExp(`\\b${first}\\b`, "i").test(text);
    const secondMatch = new RegExp(`\\b${second}\\b`, "i").test(text);
    return firstMatch && secondMatch;
  });
}

function hasPrimaryHandheldObject(text: string) {
  return primaryHandheldWords.some((word) => new RegExp(`\\b${word}\\b`, "i").test(text));
}

function getHardRejectReason(input: ScoreOutfitCandidateInput) {
  const { outfit, parsedUserRequirement } = input;
  const text = textFor(outfit);
  const manualGarment = garmentTypePreferenceMap[
    parsedUserRequirement.resolvedGarmentTypePreference as Exclude<TeamGarmentTypePreference, "自动匹配">
  ];

  if (input.previousOutfitId && outfit.id === input.previousOutfitId) return "same outfit as previous result";
  if (manualGarment && outfit.garmentType !== manualGarment) return "does not match selected garment type";
  if (parsedUserRequirement.hardExclusions.includes(outfit.garmentType)) return "blocked by user garment exclusion";
  if (parsedUserRequirement.hardExclusions.includes("skirt") && outfit.garmentType === "skirt") return "user excluded skirt";
  if (parsedUserRequirement.hardExclusions.includes("dress") && outfit.garmentType === "dress") return "user excluded dress";
  if (parsedUserRequirement.hardExclusions.includes("all-light outfit") && outfit.colorDirection === "lightClean") {
    return "user excluded all-light outfit";
  }
  if (parsedUserRequirement.hardExclusions.includes("black") && /\bblack\b/i.test(text)) return "user excluded black";
  if (parsedUserRequirement.hardExclusions.includes("handheldObject") && hasPrimaryHandheldObject(text)) {
    return "user excluded handheld objects";
  }
  if (includesAny(text, sensitiveWords)) return "contains sensitive or off-brand styling wording";
  if (includesAny(text, shoeBlockingWords)) return "contains shoe-blocking styling risk";
  if (hasMultipleMainHandheld(text)) return "contains multiple main handheld objects";

  return null;
}

function scoreUserPreference(input: ScoreOutfitCandidateInput, text: string) {
  const parsed = input.parsedUserRequirement;
  let score = 0;

  parsed.colorPreferences.forEach((preference) => {
    if (preference === input.outfit.colorDirection) score += 4;
    if (text.includes(preference.toLowerCase())) score += 2;
  });

  parsed.itemPreferences.forEach((preference) => {
    if (text.includes(preference.toLowerCase())) score += 4;
    if (preference === input.outfit.garmentType) score += 5;
  });

  parsed.softPreferences.forEach((preference) => {
    if (preference === input.outfit.outfitStyle) score += 4;
    if (preference === "lessAllLight") {
      score += input.outfit.colorDirection === "darkAnchor" || input.outfit.colorDirection === "denimBased" ? 4 : -2;
    }
    if (preference === "lessSweet") {
      score += input.outfit.outfitStyle === "cleanMinimal" || input.outfit.outfitStyle === "realDaily" ? 4 : 0;
      score -= input.outfit.outfitStyle === "refinedFeminine" || input.outfit.colorDirection === "softAccent" ? 4 : 0;
    }
  });

  return Math.max(-6, Math.min(score, 8));
}

function scoreRepetition(input: ScoreOutfitCandidateInput) {
  const recent = input.generatedHistory.slice(0, 5);
  let penalty = 0;

  recent.forEach((item, index) => {
    const weight = index < 2 ? 1 : 0.6;
    if (item.outfitId === input.outfit.id) penalty += 999;
    if (item.garmentType === input.outfit.garmentType) penalty += 4 * weight;
    if (item.outfitStyle === input.outfit.outfitStyle) penalty += 4 * weight;
    if (item.colorDirection === input.outfit.colorDirection) penalty += 5 * weight;
    if (item.topCategory === input.outfit.topCategory) penalty += 5 * weight;
    if (item.bottomCategory === input.outfit.bottomCategory) penalty += 5 * weight;
    if (item.visualAnchor === input.outfit.visualAnchor) penalty += 8 * weight;
    if (item.bagCategory && item.bagCategory === input.outfit.bagCategory) penalty += 3 * weight;
  });

  return Math.round(penalty);
}

export function scoreOutfitCandidate(input: ScoreOutfitCandidateInput): OutfitScoreBreakdown {
  const text = textFor(input.outfit);
  const hardRejectReason = getHardRejectReason(input);
  if (hardRejectReason) {
    return {
      sceneMatchScore: 0,
      seasonMatchScore: 0,
      shoeMatchScore: 0,
      garmentTypeScore: 0,
      colorDirectionScore: 0,
      styleFreshnessScore: 0,
      visualAnchorScore: 0,
      cityMoodScore: 0,
      userRequirementScore: 0,
      humanRealismScore: 0,
      shoeVisibilityScore: 0,
      sensitiveRiskPenalty: 999,
      repetitionPenalty: 999,
      propRiskPenalty: 999,
      promptBudgetPenalty: 0,
      totalScore: -999,
      hardRejected: true,
      riskFlags: [hardRejectReason]
    };
  }

  const shoePreference = shoeOutfitPreferenceMap[input.shoe] ?? shoeOutfitPreferenceMap.ALL;
  const cityPreference = input.cityProfile ? cityOutfitPreferenceMap[input.cityProfile] : null;
  const manualGarment = garmentTypePreferenceMap[
    input.parsedUserRequirement.resolvedGarmentTypePreference as Exclude<TeamGarmentTypePreference, "自动匹配">
  ];
  const riskFlags: string[] = [];

  const sceneMatchScore = input.outfit.sceneKey === input.sceneKey ? 20 : 8;
  const seasonMatchScore = input.outfit.season.includes(input.season) ? 15 : 5;
  const shoeMatchScore =
    input.outfit.suitableShoes.includes(input.shoe) || input.outfit.suitableShoes.includes("ALL") ? 15 : 7;
  const garmentTypeScore = manualGarment ? (input.outfit.garmentType === manualGarment ? 10 : 0) : 7;
  const colorDirectionScore = shoePreference.preferredColorDirections.includes(input.outfit.colorDirection) ? 10 : 5;
  const styleFreshnessScore = shoePreference.preferredStyles?.includes(input.outfit.outfitStyle) ? 10 : 7;
  const visualAnchorScore = input.outfit.visualAnchor ? 8 : 3;
  const cityMoodScore = cityPreference
    ? (cityPreference.preferredStyles.includes(input.outfit.outfitStyle) ? 3 : 0) +
      (cityPreference.preferredColorDirections.includes(input.outfit.colorDirection) ? 2 : 0)
    : 3;
  const userRequirementScore = scoreUserPreference(input, text);
  const humanRealismScore = /real|wearable|daily|believable|grounded|fabric folds/.test(text) ? 5 : 3;
  const shoeVisibilityScore = /clear|readable|sneaker/.test(text) ? 2 : 1;

  const sensitiveRiskPenalty = includesAny(text, sensitiveWords) ? 18 : 0;
  const repetitionPenalty = scoreRepetition(input);
  const propRiskPenalty = hasMultipleMainHandheld(text) || includesAny(text, shoeBlockingWords) ? 16 : 0;
  const promptBudgetPenalty =
    input.outfit.outfitLine.length > 360 || input.outfit.stylingRealismLine.length > 260 ? 5 : 0;

  if (repetitionPenalty > 0) riskFlags.push("recent outfit similarity");
  if (promptBudgetPenalty > 0) riskFlags.push("outfit prompt slightly long");
  if (shoePreference.avoidedDirections.some((direction) => text.includes(direction.toLowerCase()))) {
    riskFlags.push("shoe preference boundary risk");
  }

  const totalScore =
    sceneMatchScore +
    seasonMatchScore +
    shoeMatchScore +
    garmentTypeScore +
    colorDirectionScore +
    styleFreshnessScore +
    visualAnchorScore +
    cityMoodScore +
    userRequirementScore +
    humanRealismScore +
    shoeVisibilityScore -
    sensitiveRiskPenalty -
    repetitionPenalty -
    propRiskPenalty -
    promptBudgetPenalty;

  return {
    sceneMatchScore,
    seasonMatchScore,
    shoeMatchScore,
    garmentTypeScore,
    colorDirectionScore,
    styleFreshnessScore,
    visualAnchorScore,
    cityMoodScore,
    userRequirementScore,
    humanRealismScore,
    shoeVisibilityScore,
    sensitiveRiskPenalty,
    repetitionPenalty,
    propRiskPenalty,
    promptBudgetPenalty,
    totalScore,
    hardRejected: false,
    riskFlags
  };
}
