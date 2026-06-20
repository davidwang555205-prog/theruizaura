import { sensitiveWordReducer } from "./sensitiveWordReducer";

export type FinalPromptSafetyCheckResult = {
  prompt: string;
  warnings: string[];
};

const forbiddenReplacements: Array<[RegExp, string]> = [
  [/\bhot pants\b/gi, "tailored knee-length shorts"],
  [/\bsports bra\b/gi, "layered active top"],
  [/\bbeauty selfie\b/gi, "outfit record"],
  [/\bbodycon\b/gi, "overly close-fitting"],
  [/\bsexy\b/gi, "body-focused"],
  [/\bseductive\b/gi, "forced intense"],
  [/\byoung girl\b/gi, "adult woman"],
  [/\bteen girl\b/gi, "adult woman"],
  [/\blower-body\b/gi, "full figure balance"],
  [/\blower body\b/gi, "full figure balance"],
  [/\bpants\b/gi, "trousers"],
  [/\bopening\b/gi, "ankle entry area"]
];

const cameraNames = ["Leica", "Hasselblad", "Fujifilm", "Sony"] as const;

function splitAdditionalRequirement(prompt: string) {
  const marker = "Additional user requirement:";
  const markerIndex = prompt.lastIndexOf(marker);

  if (markerIndex < 0) {
    return { body: prompt, userRequirement: "" };
  }

  return {
    body: prompt.slice(0, markerIndex).trim(),
    userRequirement: prompt.slice(markerIndex).trim()
  };
}

function normalizeSpaces(prompt: string) {
  return prompt
    .replace(/[ \t]+/g, " ")
    .replace(/,\s*,+/g, ",")
    .replace(/([:;])\s*,/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s+([,.!?;:])/g, "$1")
    .trim();
}

function replaceForbiddenWords(prompt: string, warnings: string[]) {
  let next = prompt;

  forbiddenReplacements.forEach(([pattern, replacement]) => {
    pattern.lastIndex = 0;
    if (pattern.test(next)) {
      warnings.push(`Replaced forbidden vocabulary with ${replacement}.`);
      pattern.lastIndex = 0;
      next = next.replace(pattern, replacement);
    }
  });

  return next;
}

function keepSingleCameraLook(prompt: string, warnings: string[]) {
  const present = cameraNames.filter((name) => new RegExp(`\\b${name}\\b`, "i").test(prompt));
  if (present.length <= 1) return prompt;

  const keep = present[0];
  warnings.push(`Kept one camera look: ${keep}.`);

  return prompt
    .split(/(?<=[.。])\s+/)
    .filter((sentence) => {
      const sentenceCameras = cameraNames.filter((name) => new RegExp(`\\b${name}\\b`, "i").test(sentence));
      return sentenceCameras.length === 0 || sentenceCameras.includes(keep);
    })
    .join(" ");
}

function removeIndoorSunglasses(prompt: string, warnings: string[]) {
  const indoorLike = /\b(indoor|room|mirror|closet|hotel|gym|studio|interior|wardrobe|window-side)\b/i.test(prompt);
  if (!indoorLike || !/sunglasses/i.test(prompt)) return prompt;

  warnings.push("Removed sunglasses from indoor context.");
  return prompt
    .replace(/\bunderstated sunglasses only outdoor\b/gi, "minimal accessory")
    .replace(/\bsunglasses indoors\b/gi, "indoor sunglasses")
    .replace(/\bsunglasses\b/gi, "minimal accessory");
}

function removeDefaultBagWhenNotNeeded(prompt: string, warnings: string[]) {
  if (!/\b(noAccessory|wearableOnly|no visible bag|no visible accessory)\b/i.test(prompt)) return prompt;
  if (!/\b(tote|handbag|shoulder bag|crossbody bag|canvas tote|bag)\b/i.test(prompt)) return prompt;

  warnings.push("Removed unnecessary bag language from no-accessory outfit.");
  return prompt
    .replace(/,\s*(?:a\s+)?[^,.]*\b(?:tote|handbag|shoulder bag|crossbody bag|canvas tote|bag)\b[^,.]*/gi, "")
    .replace(/\b(?:a\s+)?[^,.]*\b(?:tote|handbag|shoulder bag|crossbody bag|canvas tote|bag)\b as secondary accessory\b/gi, "no visible bag");
}

function compactHandheldNegativeLists(prompt: string, warnings: string[]) {
  let next = prompt;
  const before = next;

  next = next.replace(
    /Do not add any second hand-held [^.]*\./gi,
    "Do not add any second primary hand-held object."
  );
  next = next.replace(
    /do not add coffee, flowers, book, water bottle, or a hand-held bag\./gi,
    "do not add a second primary hand-held object."
  );
  next = next.replace(/\bno default gym tote\b/gi, "no default accessory");
  next = next.replace(
    /\b(?:phone plus coffee|coffee plus phone|coffee plus flowers|flowers plus coffee|coffee plus book|book plus coffee|tote plus water bottle|water bottle plus tote)\b/gi,
    "mixed primary hand-held objects"
  );
  next = next.replace(
    /\bcoffee, flowers, book, phone, bottle, paper bag, shopping bag, or hand-held tote\b/gi,
    "extra primary hand-held props"
  );

  if (next !== before) warnings.push("Compacted repeated handheld-object negative phrases.");
  return next;
}

function hasMultiplePrimaryHandheld(prompt: string) {
  const text = prompt.toLowerCase();
  const pairs = [
    ["phone", "coffee"],
    ["coffee", "flowers"],
    ["coffee", "book"],
    ["flowers", "book"],
    ["tote", "water bottle"],
    ["paper bag", "coffee"]
  ];

  return pairs.some(([first, second]) => text.includes(first) && text.includes(second));
}

function appendBeforeUserRequirement(prompt: string, line: string) {
  const marker = "\n\nAdditional user requirement:";
  if (!prompt.includes(marker)) return `${prompt} ${line}`;

  const [body, extra] = prompt.split(marker);
  return `${body.trim()} ${line}${marker}${extra}`;
}

function addSingleHandheldBoundary(prompt: string, warnings: string[]) {
  if (!hasMultiplePrimaryHandheld(prompt)) return prompt;
  warnings.push("Added single-handheld boundary.");

  return prompt.includes("Use only one primary hand-held object")
    ? prompt
    : appendBeforeUserRequirement(
        prompt,
        "Use only one primary hand-held object, and keep all other accessories secondary or not visible."
      );
}

function ensureShoeVisibility(prompt: string, warnings: string[]) {
  const hasShoeContext = /sneaker|trainer|THERUIZ AURA/i.test(prompt);
  if (!hasShoeContext || /fully visible from toe to heel/i.test(prompt)) return prompt;

  warnings.push("Added shoe visibility line.");
  return appendBeforeUserRequirement(prompt, "Keep at least one sneaker fully visible from toe to heel.");
}

function keepSingleNegativeSection(prompt: string, warnings: string[]) {
  const matches = [...prompt.matchAll(/(?:负面词|Negative):/g)];
  if (matches.length <= 1) return prompt;

  warnings.push("Merged repeated negative sections.");
  const parts = prompt.split(/(?:负面词|Negative):/);
  const body = parts.shift() ?? "";
  const negative = parts.join(" ").replace(/\s+/g, " ").trim();
  return `${body.trim()}\n\nNegative:\n${negative}`;
}

export function finalPromptSafetyCheck(
  finalPrompt: string,
  options: { hasShoe?: boolean; hasPeople?: boolean; requireFullShoeVisibility?: boolean } = {}
): FinalPromptSafetyCheckResult {
  const warnings: string[] = [];
  const { body, userRequirement } = splitAdditionalRequirement(finalPrompt);
  let prompt = sensitiveWordReducer(body);

  prompt = keepSingleNegativeSection(prompt, warnings);
  prompt = replaceForbiddenWords(prompt, warnings);
  prompt = keepSingleCameraLook(prompt, warnings);
  prompt = removeIndoorSunglasses(prompt, warnings);
  prompt = removeDefaultBagWhenNotNeeded(prompt, warnings);
  prompt = compactHandheldNegativeLists(prompt, warnings);
  if (options.hasPeople) {
    prompt = addSingleHandheldBoundary(prompt, warnings);
  }
  if (options.hasShoe && options.requireFullShoeVisibility !== false) {
    prompt = ensureShoeVisibility(prompt, warnings);
  }
  prompt = sensitiveWordReducer(prompt);
  prompt = normalizeSpaces(prompt);

  if (userRequirement) {
    prompt = `${prompt}\n\n${userRequirement}`;
  }

  return {
    prompt,
    warnings: Array.from(new Set(warnings))
  };
}
