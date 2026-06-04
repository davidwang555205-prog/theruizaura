const sensitiveReplacements: Array<[RegExp, string]> = [
  [/\bexposed sports-bra focus\b/gi, "overly bare activewear focus"],
  [/\bsports bra focus\b/gi, "overly bare activewear focus"],
  [/\bsports bra\b/gi, "active top"],
  [/\bsexy pose\b/gi, "over-posed styling"],
  [/\bseductive gaze\b/gi, "forced intense gaze"],
  [/\bsensual pose\b/gi, "over-posed gesture"],
  [/\bbeauty selfie\b/gi, "posed selfie"],
  [/\bblack fitted tank\b/gi, "black clean sleeveless top"],
  [/\bfitted T-shirt\b/gi, "clean-cut T-shirt"],
  [/\bfitted tee\b/gi, "clean-cut tee"],
  [/\bfitted tank top\b/gi, "clean sleeveless top"],
  [/\bfitted tank\b/gi, "clean sleeveless top"],
  [/\btight tank\b/gi, "clean sleeveless top"],
  [/\btank top\b/gi, "clean sleeveless top"],
  [/\bsleeveless top\b/gi, "clean sleeveless top"],
  [/\bfitted active top\b/gi, "clean active top"],
  [/\bskin-tight\b/gi, "too tight"],
  [/\bbodycon\b/gi, "overly tight"],
  [/\bexposed skin\b/gi, "overly revealing styling"],
  [/\bbare skin\b/gi, "overly bare styling"],
  [/\brevealing\b/gi, "too bare"],
  [/\bmini skirt\b/gi, "short skirt"],
  [/\bultra-short shorts\b/gi, "overly short shorts"],
  [/\bhot pants\b/gi, "tailored shorts"],
  [/\bcleavage\b/gi, "overly revealing neckline"],
  [/\bbust focus\b/gi, "body-focused styling"],
  [/\bchest focus\b/gi, "body-focused styling"],
  [/\bcurves\b/gi, "natural figure"],
  [/\bcurvy\b/gi, "natural figure"],
  [/\bslim body\b/gi, "realistic body proportions"],
  [/\bthin body\b/gi, "realistic body proportions"],
  [/\bteen girl\b/gi, "woman"],
  [/\byoung girl\b/gi, "woman"],
  [/\bbedroom\b/gi, "getting-ready space"],
  [/\bintimate\b/gi, "quiet personal"],
  [/\bseductive\b/gi, "calm"],
  [/\bsensual\b/gi, "soft"],
  [/\bsexy\b/gi, "refined"]
];

const deletionPatterns = [/\blingerie\b/gi, /\bbooty\b/gi];

export const sensitiveWordingPatterns = [
  "sexy",
  "seductive",
  "sensual",
  "revealing",
  "exposed skin",
  "bare skin",
  "cleavage",
  "lingerie",
  "bedroom",
  "bodycon",
  "skin-tight",
  "sports bra",
  "hot pants",
  "beauty selfie",
  "sexy pose",
  "curvy",
  "booty",
  "teen girl",
  "young girl"
];

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

export function detectSensitiveWording(prompt: string) {
  const lowerPrompt = prompt.toLowerCase();
  return sensitiveWordingPatterns.filter((word) => lowerPrompt.includes(word));
}

export function sensitiveWordReducer(prompt: string) {
  const { body, userRequirement } = splitAdditionalRequirement(prompt);
  const detected = detectSensitiveWording(body);

  if (detected.length > 0) {
    console.warn("Sensitive wording reduced:", detected.join(", "));
  }

  let output = body;

  sensitiveReplacements.forEach(([pattern, replacement]) => {
    output = output.replace(pattern, replacement);
  });

  deletionPatterns.forEach((pattern) => {
    output = output.replace(pattern, "");
  });

  output = output
    .replace(/\b(clean\s+){2,}sleeveless top\b/gi, "clean sleeveless top")
    .replace(/\bblack clean clean sleeveless top\b/gi, "black clean sleeveless top")
    .replace(/\s+,/g, ",")
    .replace(/,\s*,/g, ",")
    .split("\n")
    .map((line) =>
      line
        .replace(/[ \t]{2,}/g, " ")
        .replace(/\s+([,.!?;:])/g, "$1")
        .trim()
    )
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s+([,.!?;:])/g, "$1")
    .trim();

  return [output, userRequirement].filter(Boolean).join(userRequirement ? "\n\n" : "").trim();
}
