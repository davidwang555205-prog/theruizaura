import { buildCompactPrompt, type CompactPromptKind, type TeamPromptMode } from "./buildCompactPrompt";

export type PromptByModeParts = {
  brandMoodLine: string;
  imageTypeLine: string;
  modelLine?: string;
  gazeLine?: string;
  actionLine?: string;
  bodyProportionLine?: string;
  outfitLine?: string;
  stylingRealismLine?: string;
  cityStreetLine?: string;
  sceneLine?: string;
  sceneRealismLine?: string;
  cameraLookLine?: string;
  sneakerAccuracyLine?: string;
  shoeVisibilityLine?: string;
  shoeClippingLine?: string;
  lacesLine?: string;
  negativeLine?: string;
  userExtraRequirement?: string;
  promptKind?: CompactPromptKind;
  fullDebugLines?: string[];
};

function normalizeLine(line = "") {
  return line
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .trim();
}

function assembleOrderedLines(lines: Array<string | undefined>, userExtraRequirement?: string) {
  const body = lines.map(normalizeLine).filter(Boolean).join(" ");
  const extra = userExtraRequirement?.trim();
  return extra ? `${body} Additional user requirement: ${extra}` : body;
}

export function buildPromptByMode(parts: PromptByModeParts, mode: TeamPromptMode = "standard") {
  if (mode === "compact") {
    return buildCompactPrompt({
      brandMoodLine: parts.brandMoodLine,
      imageTypeLine: parts.imageTypeLine,
      modelLine: parts.modelLine,
      gazeActionLine: [parts.gazeLine, parts.actionLine, parts.bodyProportionLine].filter(Boolean).join(" "),
      outfitLine: parts.outfitLine,
      sceneLine: parts.cityStreetLine || parts.sceneLine,
      sneakerAccuracyLine: parts.sneakerAccuracyLine,
      shoeVisibilityLine: [parts.shoeVisibilityLine, parts.shoeClippingLine, parts.lacesLine].filter(Boolean).join(" "),
      realismLine: [parts.stylingRealismLine, parts.sceneRealismLine, parts.cameraLookLine].filter(Boolean).join(" "),
      negativeLine: parts.negativeLine,
      userExtraRequirement: parts.userExtraRequirement,
      promptMode: "compact",
      promptKind: parts.promptKind
    });
  }

  if (mode === "full" && parts.fullDebugLines?.length) {
    return assembleOrderedLines(parts.fullDebugLines, parts.userExtraRequirement);
  }

  return assembleOrderedLines(
    [
      parts.brandMoodLine,
      parts.imageTypeLine,
      parts.modelLine,
      parts.gazeLine,
      parts.actionLine,
      parts.bodyProportionLine,
      parts.outfitLine,
      parts.stylingRealismLine,
      parts.cityStreetLine || parts.sceneLine,
      parts.sceneRealismLine,
      parts.cameraLookLine,
      parts.sneakerAccuracyLine,
      parts.shoeVisibilityLine,
      parts.shoeClippingLine,
      parts.lacesLine,
      parts.negativeLine
    ],
    parts.userExtraRequirement
  );
}
