export type TeamPromptMode = "compact" | "standard" | "full";

export type CompactPromptKind = "onFoot" | "mirror" | "lifestyle" | "gym" | "stillLife" | "atmosphere";

export type CompactPromptParts = {
  brandMoodLine: string;
  imageTypeLine: string;
  modelLine?: string;
  gazeActionLine?: string;
  outfitLine?: string;
  sceneLine?: string;
  sneakerAccuracyLine?: string;
  shoeVisibilityLine?: string;
  realismLine?: string;
  negativeLine?: string;
  userExtraRequirement?: string;
  promptMode?: TeamPromptMode;
  promptKind?: CompactPromptKind;
  fullPrompt?: string;
};

const compactPromptMaxLength: Record<CompactPromptKind, number> = {
  onFoot: 1400,
  mirror: 1500,
  lifestyle: 1400,
  gym: 1600,
  stillLife: 1100,
  atmosphere: 1100
};

function normalizeSentence(line: string) {
  return line
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .trim();
}

function dedupeSentences(lines: string[]) {
  const seen = new Set<string>();

  return lines.filter((line) => {
    const key = line
      .toLowerCase()
      .replace(/[`"'“”‘’.,;:!?()[\]{}]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function ensureSingleNegativeLine(line = "") {
  if (!line.trim()) return "";

  const cleaned = line
    .replace(/\n+/g, " ")
    .replace(/\bAvoid\s+/gi, "")
    .replace(/\.+$/g, "")
    .split(/,\s*|\s+and\s+/)
    .map((phrase) => phrase.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const kept = cleaned.filter((phrase) => {
    const key = phrase
      .toLowerCase()
      .replace(/[`"'“”‘’.,;:!?()[\]{}]/g, "")
      .replace(/\b(the|a|an|any)\b/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return kept.length ? `Avoid ${kept.join(", ")}.` : "";
}

function compressSceneLine(line = "") {
  const firstSentence = line.match(/[^.!?]+[.!?]/)?.[0];
  return normalizeSentence(firstSentence ?? line);
}

function compressActionLine(line = "") {
  return normalizeSentence(line.replace(/;.*$/, "."));
}

function compressNegativeLine(line = "") {
  const important = [
    "sneaker deformation",
    "shoe clipping",
    "cropped shoes",
    "unreadable footwear",
    "distorted body proportions",
    "fake scenery",
    "influencer posing",
    "running-shoe transformation"
  ];
  const lowerLine = line.toLowerCase();
  const kept = important.filter((phrase) => lowerLine.includes(phrase));

  return kept.length
    ? `Avoid ${kept.join(", ")}.`
    : "Avoid sneaker deformation, shoe clipping, cropped shoes, distorted body proportions, fake scenery, and unreadable footwear.";
}

function compressModelLine(line = "") {
  if (!line.trim()) return "";
  if (line.includes("30–45")) {
    return "Use one believable Asian or subtle Asian mixed woman, 30–45, with natural proportions and a calm refined presence.";
  }

  return "Use one believable Asian or subtle Asian mixed woman with natural proportions and a calm refined presence.";
}

function compressSneakerAccuracyLine(line = "") {
  if (!line.trim()) return "";
  if (line.includes("non-product atmosphere image")) {
    return "If the sneaker appears, keep it subtle and secondary while preserving its real color, texture, and recognizable shape.";
  }

  return "Preserve the uploaded sneaker silhouette, toe box, slim outsole, panels, tongue, laces, stitching, material, color, and proportions.";
}

function compressShoeVisibilityLine(kind: CompactPromptKind, line = "") {
  if (!line.trim()) return "";
  if (kind === "stillLife") {
    return "Keep the sneaker fully readable, with clear laces, tongue, outsole, material texture, and no prop covering the shape.";
  }
  if (kind === "atmosphere") {
    return "The shoe may appear only as a subtle partial object or background detail.";
  }

  return "Keep one sneaker fully visible and the second readable, with clear shoe-to-outfit separation and grounded floor contact.";
}

export function buildCompactPrompt(parts: CompactPromptParts) {
  if (parts.promptMode === "full" && parts.fullPrompt) return parts.fullPrompt;

  const userRequirement = parts.userExtraRequirement?.trim();
  const maxLength = compactPromptMaxLength[parts.promptKind ?? "lifestyle"];
  const promptLines = {
    brandMoodLine: normalizeSentence(parts.brandMoodLine),
    imageTypeLine: normalizeSentence(parts.imageTypeLine),
    modelLine: normalizeSentence(parts.modelLine ?? ""),
    gazeActionLine: normalizeSentence(parts.gazeActionLine ?? ""),
    outfitLine: normalizeSentence(parts.outfitLine ?? ""),
    sceneLine: normalizeSentence(parts.sceneLine ?? ""),
    sneakerAccuracyLine: normalizeSentence(parts.sneakerAccuracyLine ?? ""),
    shoeVisibilityLine: normalizeSentence(parts.shoeVisibilityLine ?? ""),
    realismLine: normalizeSentence(parts.realismLine ?? ""),
    negativeLine: ensureSingleNegativeLine(parts.negativeLine)
  };

  const assemble = (overrides: Partial<typeof promptLines> = {}) => {
    const merged = { ...promptLines, ...overrides };
    const lines = dedupeSentences(
      [
        merged.brandMoodLine,
        merged.imageTypeLine,
        merged.modelLine,
        merged.gazeActionLine,
        merged.outfitLine,
        merged.sceneLine,
        merged.sneakerAccuracyLine,
        merged.shoeVisibilityLine,
        merged.realismLine,
        merged.negativeLine
      ].filter(Boolean)
    );

    const body = lines.join(" ");
    return userRequirement ? `${body} Additional user requirement: ${userRequirement}` : body;
  };

  let prompt = assemble();
  if (parts.promptMode !== "compact") return prompt;

  if (prompt.length <= maxLength) return prompt;

  prompt = assemble({ realismLine: "" });
  if (prompt.length <= maxLength) return prompt;

  prompt = assemble({ realismLine: "", sceneLine: compressSceneLine(promptLines.sceneLine) });
  if (prompt.length <= maxLength) return prompt;

  prompt = assemble({
    realismLine: "",
    sceneLine: compressSceneLine(promptLines.sceneLine),
    gazeActionLine: compressActionLine(promptLines.gazeActionLine)
  });
  if (prompt.length <= maxLength) return prompt;

  prompt = assemble({
    realismLine: "",
    sceneLine: compressSceneLine(promptLines.sceneLine),
    gazeActionLine: compressActionLine(promptLines.gazeActionLine),
    negativeLine: compressNegativeLine(promptLines.negativeLine)
  });

  if (prompt.length <= maxLength) return prompt;

  return assemble({
    realismLine: "",
    modelLine: compressModelLine(promptLines.modelLine),
    sceneLine: compressSceneLine(promptLines.sceneLine),
    gazeActionLine: compressActionLine(promptLines.gazeActionLine),
    sneakerAccuracyLine: compressSneakerAccuracyLine(promptLines.sneakerAccuracyLine),
    shoeVisibilityLine: compressShoeVisibilityLine(parts.promptKind ?? "lifestyle", promptLines.shoeVisibilityLine),
    negativeLine: compressNegativeLine(promptLines.negativeLine)
  });
}
