import type { StandardSceneKey } from "../data/outfitDiversityRules";
import type { TeamImageType } from "../types";
import type { StructuredPromptParts } from "./buildStructuredPrompt";

export type PromptAIRiskFlag =
  | "ageConflict"
  | "missingScenarioCoherence"
  | "emptyStreet"
  | "syntheticPerfection"
  | "gazeConflict"
  | "semanticOverload";

function isPeopleImage(imageType: TeamImageType) {
  return imageType === "产品上脚图" || imageType === "对镜穿搭图" || imageType === "生活场景图";
}

function appendLine(base = "", line = "") {
  return [base.trim(), line.trim()].filter(Boolean).join(" ");
}

function normalizeAge(line: string, studioLaunch: boolean) {
  const age = studioLaunch ? "around age 30" : "aged 30–45";
  return line
    .replace(/\b(?:aged?\s+)?(?:25|30|32)\s*[–-]\s*(?:35|40|45|46)\b/gi, age)
    .replace(/25-35 for standard[^.;]*/gi, "30-45 for standard people visuals");
}

function countConcepts(text: string, patterns: RegExp[]) {
  return patterns.reduce((total, pattern) => total + (text.match(pattern)?.length ?? 0), 0);
}

export function promptAIRiskPreflight(input: {
  promptParts: StructuredPromptParts;
  imageType: TeamImageType;
  sceneKey: StandardSceneKey;
  visualScenarioLine: string;
  studioLaunch: boolean;
  userExtraRequirement?: string;
}) {
  const fixedPromptParts = { ...input.promptParts };
  const warnings: string[] = [];
  const riskFlags: PromptAIRiskFlag[] = [];
  const peopleImage = isPeopleImage(input.imageType);

  if (peopleImage && fixedPromptParts.modelLine) {
    const normalized = normalizeAge(fixedPromptParts.modelLine, input.studioLaunch);
    if (normalized !== fixedPromptParts.modelLine) {
      fixedPromptParts.modelLine = normalized;
      riskFlags.push("ageConflict");
      warnings.push("Normalized conflicting model age language.");
    }
  }

  if (input.visualScenarioLine && !fixedPromptParts.sceneLine?.includes(input.visualScenarioLine)) {
    fixedPromptParts.sceneLine = appendLine(fixedPromptParts.sceneLine, input.visualScenarioLine);
    riskFlags.push("missingScenarioCoherence");
    warnings.push("Added one coherent visual-scenario state.");
  }

  const streetLike = ![
    "studioLaunch",
    "stillLife",
    "materialTable",
    "mirrorCloset",
    "entrywayDeparture",
    "hotelTravel",
    "gymInterior",
    "atmosphere"
  ].includes(input.sceneKey);
  if (streetLike) {
    const softenStreet = (line = "") =>
      line
        .replace(/\b(?:completely empty|near-empty|empty) (street|sidewalk|district)\b/gi, "lightly active daily $1")
        .replace(/\bperfectly clean (street|sidewalk|district)\b/gi, "believable daily $1");
    const nextPlaceLine = softenStreet(fixedPromptParts.placeLine);
    const nextSceneLine = softenStreet(fixedPromptParts.sceneLine);
    if (nextPlaceLine !== fixedPromptParts.placeLine || nextSceneLine !== fixedPromptParts.sceneLine) {
      fixedPromptParts.placeLine = nextPlaceLine;
      fixedPromptParts.sceneLine = nextSceneLine;
      riskFlags.push("emptyStreet");
      warnings.push("Reduced empty or over-clean street language.");
    }
  }

  const body = [
    fixedPromptParts.modelLine,
    fixedPromptParts.outfitLine,
    fixedPromptParts.sceneLine,
    fixedPromptParts.moodLine,
    fixedPromptParts.actionLine
  ]
    .filter(Boolean)
    .join(" ");

  if (/perfect(?:ly)? symmetrical|perfect skin|flawless skin|computer-perfect/gi.test(body)) {
    fixedPromptParts.modelLine = (fixedPromptParts.modelLine ?? "")
      .replace(/perfect(?:ly)? symmetrical/gi, "naturally asymmetrical")
      .replace(/(?:perfect|flawless) skin/gi, "real skin texture")
      .replace(/computer-perfect/gi, "over-polished");
    riskFlags.push("syntheticPerfection");
    warnings.push("Replaced synthetic-perfection cues.");
  }

  const userAskedDownward = /低头|looking down|downward gaze/i.test(input.userExtraRequirement ?? "");
  const userAskedCamera = /看镜头|look(?:ing)? at (?:the )?camera|eye contact/i.test(input.userExtraRequirement ?? "");
  if (!userAskedDownward && !userAskedCamera && /look naturally toward the camera/i.test(body) && /natural downward gaze/i.test(body)) {
    fixedPromptParts.actionLine = (fixedPromptParts.actionLine ?? "").replace(/Use a natural downward gaze[^.]*\./gi, "");
    riskFlags.push("gazeConflict");
    warnings.push("Removed conflicting gaze directions.");
  }

  const descriptorCount = countConcepts(body.toLowerCase(), [
    /\bnatural\b/g,
    /\brealistic\b/g,
    /\bbelievable\b/g,
    /\brefined\b/g,
    /\bclean\b/g
  ]);
  if (descriptorCount > 28) {
    riskFlags.push("semanticOverload");
    warnings.push("Prompt contains repeated realism descriptors; budget compression will reduce them.");
  }

  return {
    fixedPromptParts,
    warnings,
    riskFlags: Array.from(new Set(riskFlags))
  };
}
