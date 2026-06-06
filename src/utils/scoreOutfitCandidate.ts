import type { TeamGarmentTypePreference } from "../types";
import type { ChinaCityProfile } from "../data/chinaUrbanStreetProfiles";
import { cityOutfitPreferenceMap } from "../data/cityOutfitPreferenceMap";
import { garmentTypePreferenceMap } from "../data/outfitDiversityRules";
import type { SceneOutfitSeed } from "../data/sceneOutfitSeedLibrary";
import { shoeOutfitPreferenceMap } from "../data/shoeOutfitPreferenceMap";
import type { OutfitGeneratedHistoryEntry } from "./outfitGeneratedHistory";
import type { ParsedUserOutfitRequirement } from "./parseUserOutfitRequirement";
import { chooseSeasonClimateOutfitLayer } from "./chooseSeasonClimateOutfitLayer";

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

function historyText(entry: OutfitGeneratedHistoryEntry) {
  return [
    entry.topCategory,
    entry.bottomCategory,
    entry.visualAnchor,
    entry.colorDirection,
    entry.bagCategory,
    entry.garmentType,
    entry.outfitStyle
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
  const candidateText = textFor(input.outfit);
  const candidateHasDenim = /denim|jeans/i.test(candidateText) || input.outfit.colorDirection === "denimBased";
  const candidateHasWhiteShirt = /\bwhite\b[^.]*\bshirt\b/i.test(candidateText);
  const candidateHasCreamOrOatmealKnit = /\b(cream|oatmeal)\b[^.]*\bknit/i.test(candidateText);
  const candidateHasWhiteOversizedShirt = /\bwhite oversized shirt\b/i.test(candidateText);
  const candidateHasStoneGreyBermuda = /\bstone grey Bermuda shorts\b/i.test(candidateText);
  const candidateHasCreamMidiSkirt = /\bcream midi skirt\b/i.test(candidateText);
  const candidateHasCreamShirtDress = /\bcream shirt dress\b/i.test(candidateText);
  let penalty = 0;

  recent.forEach((item, index) => {
    const itemText = historyText(item);
    const weight = index < 2 ? 1 : 0.6;
    if (item.outfitId === input.outfit.id) penalty += 999;
    if (item.garmentType === input.outfit.garmentType) penalty += 4 * weight;
    if (item.outfitStyle === input.outfit.outfitStyle) penalty += 4 * weight;
    if (item.colorDirection === input.outfit.colorDirection) penalty += 5 * weight;
    if (item.topCategory === input.outfit.topCategory) penalty += 5 * weight;
    if (item.bottomCategory === input.outfit.bottomCategory) penalty += 5 * weight;
    if (item.visualAnchor === input.outfit.visualAnchor) penalty += 8 * weight;
    if (item.bagCategory && item.bagCategory === input.outfit.bagCategory) penalty += 3 * weight;
    if (candidateHasWhiteShirt && /\bwhite\b[^.]*\bshirt\b/i.test(itemText)) penalty += 6 * weight;
    if (candidateHasCreamOrOatmealKnit && /\b(cream|oatmeal)\b[^.]*\bknit/i.test(itemText)) penalty += 6 * weight;
    if (candidateHasWhiteOversizedShirt && /\bwhite oversized shirt\b/i.test(itemText)) penalty += 8 * weight;
    if (candidateHasStoneGreyBermuda && /\bstone grey Bermuda shorts\b/i.test(itemText)) penalty += 12 * weight;
    if (candidateHasCreamMidiSkirt && /\bcream midi skirt\b/i.test(itemText)) penalty += 8 * weight;
    if (candidateHasCreamShirtDress && /\bcream shirt dress\b/i.test(itemText)) penalty += 8 * weight;
  });

  if (recent.some((item) => item.bottomCategory === input.outfit.bottomCategory)) penalty += 8;
  if (candidateHasDenim && recent.some((item) => /denim|jeans/i.test(historyText(item)) || item.colorDirection === "denimBased")) {
    penalty += 8;
  }
  if (
    candidateHasDenim &&
    recent[0]?.sceneKey === input.sceneKey &&
    (/denim|jeans/i.test(historyText(recent[0])) || recent[0].colorDirection === "denimBased")
  ) {
    penalty += 10;
  }
  if (input.outfit.bagCategory && recent.some((item) => item.bagCategory === input.outfit.bagCategory)) penalty += 8;

  return Math.round(penalty);
}

const heavyWinterPattern = /wool coat|wool-blend|cashmere|high-neck knit|scarf|coldLayer|structured outerwear|warm knit|long wool coat/i;
const autumnWinterMaterialPattern = /knit|cardigan|jacket|trench|denim|suede|wool|coat|scarf|corduroy|cashmere/i;
const thinSummerPattern = /sleeveless top alone|linen shirt|Bermuda shorts|shorts|summer|thin cotton|tank/i;
const thickOuterwearPattern = /heavy wool coat|puffer|snow|ski|fur-heavy|oversized coat|thick scarf/i;

function scoreSeasonMaterial(input: ScoreOutfitCandidateInput, text: string) {
  let score = 0;

  if (input.season === "spring") {
    if (["softAccent", "lightClean", "denimBased"].includes(input.outfit.colorDirection)) score += 5;
    if (heavyWinterPattern.test(text)) score -= 8;
  }

  if (input.season === "summer") {
    if (["lightClean", "denimBased"].includes(input.outfit.colorDirection) || input.outfit.garmentType === "lightActive") {
      score += 5;
    }
    if (heavyWinterPattern.test(text)) score -= 10;
  }

  if (input.season === "autumn") {
    if (["neutralDaily", "darkAnchor", "denimBased"].includes(input.outfit.colorDirection)) score += 5;
    if (autumnWinterMaterialPattern.test(text)) score += 5;
    if (/thin summer|beach|vacation|bare ankle/i.test(text)) score -= 8;
  }

  if (input.season === "winter") {
    if (["darkAnchor", "neutralDaily", "lightClean"].includes(input.outfit.colorDirection)) score += 5;
    if (heavyWinterPattern.test(text) || /dark denim|coat|scarf|wool|high-neck knit/i.test(text)) score += 5;
    if (thinSummerPattern.test(text)) score -= 12;
  }

  return score;
}

function scoreCityClimate(input: ScoreOutfitCandidateInput, text: string) {
  if (input.season !== "autumn" && input.season !== "winter") return 0;

  const climate = chooseSeasonClimateOutfitLayer({
    season: input.season,
    cityProfile: input.cityProfile
  });
  let score = 0;
  const matchedPreferred = climate.preferredMaterials.some((material) => text.includes(material.toLowerCase()));

  if (matchedPreferred) score += 8;
  if (autumnWinterMaterialPattern.test(text)) score += 5;
  if (thinSummerPattern.test(text) && !(input.cityProfile === "Shenzhen" && climate.layerWeight === "lightLayer")) {
    score -= input.season === "winter" ? 12 : 10;
  }
  if (thickOuterwearPattern.test(text) && (input.cityProfile === "Shenzhen" || climate.layerWeight === "lightLayer")) score -= 8;
  if (/Aire|Lemon/i.test(input.shoe)) {
    const lightContext =
      climate.layerWeight === "lightLayer" ||
      input.cityProfile === "Shenzhen" ||
      input.sceneKey === "gymCommute" ||
      input.sceneKey === "gymInterior" ||
      input.sceneKey === "mirrorCloset";
    if (!lightContext) score -= 8;
  }

  return score;
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
  const seasonMaterialScore = scoreSeasonMaterial(input, text);
  const cityClimateScore = scoreCityClimate(input, text);

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
    seasonMaterialScore +
    cityClimateScore +
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
