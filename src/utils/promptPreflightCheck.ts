import type { ChinaCityProfile } from "../data/chinaUrbanStreetProfiles";
import type { StandardSceneKey } from "../data/outfitDiversityRules";
import { promptRepairDictionary, type PromptRepairKey } from "../data/promptRepairDictionary";
import type { LightingSpaceType } from "../data/sceneLightingSpaceProfiles";
import type { TeamImageType, TeamSeason, TeamShoe } from "../types";
import type { StructuredPromptParts } from "./buildStructuredPrompt";

export type PromptPreflightInput = {
  promptParts: StructuredPromptParts;
  imageType: TeamImageType;
  sceneKey: StandardSceneKey;
  season: TeamSeason;
  cityProfile: ChinaCityProfile;
  selectedShoe: TeamShoe | string;
  lightingSpaceType: LightingSpaceType;
  selectedOutfit?: unknown;
  selectedAccessory?: string | null;
  selectedHandheldObject?: string | null;
  userExtraRequirement?: string;
  lightCheckOnly?: boolean;
};

export type PromptPreflightOutput = {
  fixedPromptParts: StructuredPromptParts;
  warnings: string[];
  appliedRepairs: PromptRepairKey[];
};

function allText(parts: StructuredPromptParts) {
  return [
    parts.timeLine,
    parts.placeLine,
    parts.productLine,
    parts.modelLine,
    parts.outfitLine,
    parts.sceneLine,
    parts.moodLine,
    parts.actionLine,
    parts.negativeLine
  ]
    .filter(Boolean)
    .join(" ");
}

function appendLine(base = "", line = "") {
  return [base, line].map((item) => item.trim()).filter(Boolean).join(" ");
}

function addNegative(base = "", phrases: string[] = []) {
  const existing = base.replace(/^Avoid\s+/i, "").replace(/\.$/, "");
  const merged = [...existing.split(/,\s*/), ...phrases].map((phrase) => phrase.trim()).filter(Boolean);
  return merged.length ? `Avoid ${Array.from(new Set(merged)).join(", ")}.` : "";
}

function countMatches(text: string, patterns: RegExp[]) {
  return patterns.reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0);
}

function applyRepair(parts: StructuredPromptParts, repairKey: PromptRepairKey) {
  const repair = promptRepairDictionary[repairKey];
  const next = { ...parts };

  if (repair.line) {
    if (repairKey.includes("Light")) next.timeLine = appendLine(next.timeLine, repair.line);
    else if (repairKey === "singleHandheldRepair") next.actionLine = appendLine(next.actionLine, repair.line);
    else next.sceneLine = appendLine(next.sceneLine, repair.line);
  }

  next.negativeLine = addNegative(next.negativeLine, repair.negativePhrases);
  return next;
}

function hasShoeContext(input: PromptPreflightInput) {
  return /sneaker|trainer|THERUIZ AURA/i.test(`${input.promptParts.productLine ?? ""} ${input.promptParts.sceneLine ?? ""}`);
}

export function promptPreflightCheck(input: PromptPreflightInput): PromptPreflightOutput {
  let fixedPromptParts = { ...input.promptParts };
  const warnings: string[] = [];
  const appliedRepairs: PromptRepairKey[] = [];
  const text = allText(fixedPromptParts);
  const lower = text.toLowerCase();

  function repair(key: PromptRepairKey, warning: string) {
    if (appliedRepairs.includes(key)) return;
    warnings.push(warning);
    appliedRepairs.push(key);
    fixedPromptParts = applyRepair(fixedPromptParts, key);
  }

  const handheldConflictCount = countMatches(lower, [
    /phone.*coffee|coffee.*phone/,
    /coffee.*flowers?|flowers?.*coffee/,
    /hand-held tote.*water bottle|water bottle.*hand-held tote/,
    /coffee.*book|book.*coffee/
  ]);
  if (handheldConflictCount > 0) repair("singleHandheldRepair", "Detected potential multiple primary handheld objects.");

  if (/bag in every image|default bag|unnecessary bag/i.test(text) || /structured tote|canvas tote|handbag/i.test(text) && /coffee|flowers?|book|water bottle|phone/i.test(text)) {
    repair("noDefaultBagRepair", "Detected possible default bag or bag plus handheld object conflict.");
  }

  if ((input.lightingSpaceType === "indoorNaturalLight" || input.lightingSpaceType === "indoorCommercialLight") && /sunglasses/i.test(text)) {
    repair("indoorLightRepair", "Detected indoor sunglasses or outdoor accessory risk.");
    fixedPromptParts.negativeLine = addNegative(fixedPromptParts.negativeLine, ["sunglasses indoors"]);
  }

  if (input.lightingSpaceType === "indoorNaturalLight" && /street shadows|pavement shadows|outdoor natural street light/i.test(text)) {
    repair("indoorLightRepair", "Detected outdoor light language in indoor scene.");
  }
  if (input.lightingSpaceType === "outdoorStreet" && /indoor window-only light|studio backdrop|soft indoor natural window light/i.test(text)) {
    repair("outdoorLightRepair", "Detected indoor light language in outdoor scene.");
  }
  if (input.imageType === "对镜穿搭图" || input.sceneKey === "mirrorCloset") {
    if (!/mirror proportions|mirror proportion|no long-leg|long-leg mirror distortion/i.test(text)) {
      repair("mirrorLightRepair", "Mirror prompt needed proportion and light stabilization.");
    }
  }
  if (input.sceneKey === "gymInterior" && /sports ad lighting|dramatic light|neon/i.test(text)) {
    repair("indoorLightRepair", "Gym prompt contained sports-ad lighting risk.");
  }

  if ((input.cityProfile === "Beijing" && input.season === "冬" && /sleeveless|shorts|bare ankle/i.test(text)) ||
      (input.cityProfile === "Shenzhen" && input.season === "冬" && /heavy northern coat|puffer-heavy|snow/i.test(text)) ||
      (input.season === "夏" && /wool coat|heavy coat|winter coat/i.test(text))) {
    repair("seasonMismatchRepair", "Detected possible season and city outfit thickness mismatch.");
  }

  if (hasShoeContext(input)) {
    if (!/fully visible from toe to heel/i.test(text)) repair("shoesBlockedRepair", "Shoe visibility line was missing.");
    if (!/low-cut German trainer|slim outsole|rounded toe box/i.test(text)) {
      repair("shoeDeformationRepair", "Shoe shape protection needed reinforcement.");
    }
  }

  if ((input.imageType === "对镜穿搭图" || input.imageType === "产品上脚图" || input.imageType === "生活场景图") &&
      !/natural body proportions|realistic proportions|body scale/i.test(text)) {
    repair("longLegRepair", "Body proportion protection line was missing.");
  }

  if (/\b(opening|pants|lower body|lower-body|sexy|seductive|bodycon|sports bra|beauty selfie|young girl|teen girl)\b/i.test(text)) {
    repair("vocabularyRepair", "Detected vocabulary that should be reduced or replaced.");
  }

  const cameraCount = countMatches(text, [/Leica-inspired/i, /Hasselblad-inspired/i, /Fujifilm-inspired/i]);
  if (cameraCount > 1) repair("cameraConflictRepair", "Detected multiple camera look styles.");

  if (input.lightingSpaceType === "outdoorStreet" && !/Chinese city|Shanghai-like|Chengdu-like|Shenzhen-like|Hangzhou-like|Beijing-like/i.test(text)) {
    repair("cityChinaRepair", "Outdoor street prompt needed Chinese city boundary reinforcement.");
  }

  return {
    fixedPromptParts,
    warnings,
    appliedRepairs
  };
}
