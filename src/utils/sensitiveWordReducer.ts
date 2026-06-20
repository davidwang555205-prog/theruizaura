const sensitiveReplacements: Array<[RegExp, string]> = [
  [/\bvamp\b/gi, "forefoot upper"],
  [/\bexposed performance-bra focus\b/gi, "insufficiently layered activewear"],
  [/\bexposed sports-bra focus\b/gi, "insufficiently layered activewear"],
  [/\btiny sports bra focus\b/gi, "insufficiently layered activewear"],
  [/\bsports bra focus\b/gi, "insufficiently layered activewear"],
  [/\bperformance-bra focus\b/gi, "insufficiently layered activewear"],
  [/\bperformance bra focus\b/gi, "insufficiently layered activewear"],
  [/\bsports bra\b/gi, "layered active top"],
  [/\bbralette\b/gi, "layered active top"],
  [/\bunderwear\b/gi, "visible underlayer"],
  [/\blingerie\b/gi, "underlayer-focused styling"],
  [/\bover[- ]?sexy\b/gi, "overly body-focused"],
  [/\bsexy selfie mood\b/gi, "performative selfie mood"],
  [/\bsexy seated pose\b/gi, "body-focused seated pose"],
  [/\bsexy cafe pose\b/gi, "body-focused cafe pose"],
  [/\bsexy pose\b/gi, "body-focused pose"],
  [/\bsexy styling\b/gi, "body-focused styling"],
  [/\bseductive gaze\b/gi, "forced intense gaze"],
  [/\bseductive expression\b/gi, "forced intense expression"],
  [/\bseductive pose\b/gi, "forced dramatic pose"],
  [/\bsensual pose\b/gi, "over-stylized gesture"],
  [/\bprovocative\b/gi, "attention-seeking"],
  [/\bsultry\b/gi, "dramatically posed"],
  [/\bflirtatious\b/gi, "performative"],
  [/\balluring\b/gi, "overly staged"],
  [/\berotic\b/gi, "inappropriate body-focused"],
  [/\bsexualized\b/gi, "inappropriately body-focused"],
  [/\bsexual\b/gi, "body-focused"],
  [/\bbeauty[- ]selfie\b/gi, "posed selfie"],
  [/\bblack fitted tank\b/gi, "black clean sleeveless top"],
  [/\bfitted T-shirt\b/gi, "clean-cut T-shirt"],
  [/\bfitted tee\b/gi, "clean-cut tee"],
  [/\bfitted tank top\b/gi, "clean sleeveless top"],
  [/\bfitted tank\b/gi, "clean sleeveless top"],
  [/\btight tank\b/gi, "clean sleeveless top"],
  [/\btank top\b/gi, "clean sleeveless top"],
  [/\bsleeveless top\b/gi, "clean sleeveless top"],
  [/\bfitted active top\b/gi, "clean active top"],
  [/\bskin-tight\b/gi, "overly close-fitting"],
  [/\bbodycon(?:-glamorous)?\b/gi, "overly close-fitting"],
  [/\bbody-showing\b/gi, "figure-emphasizing"],
  [/\boverexposed skin\b/gi, "excessive skin emphasis"],
  [/\bexposed skin\b/gi, "insufficient garment coverage"],
  [/\bbare skin\b/gi, "insufficient garment coverage"],
  [/\brevealing\b/gi, "insufficient-coverage"],
  [/\bsee-through\b/gi, "insufficiently opaque"],
  [/\bsheer garment\b/gi, "lightweight opaque garment"],
  [/\btransparent garment\b/gi, "insufficiently opaque garment"],
  [/\bshort tight skirt\b/gi, "impractical short hemline"],
  [/\bmini skirt\b/gi, "knee-length skirt"],
  [/\bmicro skirt\b/gi, "knee-length skirt"],
  [/\bultra-short shorts\b/gi, "tailored knee-length shorts"],
  [/\bhot pants\b/gi, "tailored knee-length shorts"],
  [/\bcleavage\b/gi, "inappropriate neckline emphasis"],
  [/\blow-cut neckline\b/gi, "inappropriate neckline emphasis"],
  [/\bbust focus\b/gi, "garment-front emphasis"],
  [/\bchest focus\b/gi, "garment-front emphasis"],
  [/\bcurves\b/gi, "natural silhouette"],
  [/\bcurvy\b/gi, "natural silhouette"],
  [/\bvoluptuous\b/gi, "exaggerated silhouette"],
  [/\bslim body\b/gi, "realistic body proportions"],
  [/\bthin body\b/gi, "realistic body proportions"],
  [/\bteenage girl\b/gi, "adult woman"],
  [/\bteen girl\b/gi, "adult woman"],
  [/\byoung girl\b/gi, "adult woman"],
  [/\bteenage styling\b/gi, "overly youthful styling"],
  [/\bsweet[- ]girl styling\b/gi, "overly youthful styling"],
  [/\bsweet[- ]girl outfit\b/gi, "overly youthful outfit"],
  [/\bsweet[- ]girl mood\b/gi, "overly youthful mood"],
  [/\bvacation[- ]girl\b/gi, "vacation-content"],
  [/\bgirlish\b/gi, "overly youthful"],
  [/\bgirl\b/gi, "woman"],
  [/\binnocent-looking\b/gi, "unaffected"],
  [/\byouthful-looking\b/gi, "fresh adult"],
  [/\bbedroom\b/gi, "getting-ready space"],
  [/\bintimate\b/gi, "quiet personal"],
  [/\bnude (?:tone|color|beige)\b/gi, "soft beige"],
  [/\bnude\b/gi, "uncovered styling"],
  [/\bnaked\b/gi, "uncovered styling"],
  [/\bseductive\b/gi, "forced intense"],
  [/\bsensual\b/gi, "overly stylized"],
  [/\bsexy\b/gi, "body-focused"]
];

const deletionPatterns = [/\bbooty\b/gi];

export const sensitiveWordingPatterns = [
  "vamp",
  "sexy",
  "seductive",
  "sensual",
  "provocative",
  "sultry",
  "flirtatious",
  "alluring",
  "erotic",
  "sexual",
  "revealing",
  "exposed skin",
  "bare skin",
  "cleavage",
  "lingerie",
  "bedroom",
  "bodycon",
  "skin-tight",
  "sports bra",
  "performance-bra",
  "bralette",
  "underwear",
  "beauty selfie",
  "beauty-selfie",
  "sexy pose",
  "curvy",
  "booty",
  "teen girl",
  "young girl",
  "teenage girl",
  "nude",
  "naked",
  "mini skirt",
  "ultra-short shorts",
  "hot pants"
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
