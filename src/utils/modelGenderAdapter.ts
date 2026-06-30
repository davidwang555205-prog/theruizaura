import type { TeamGarmentTypePreference, TeamModelChoice, TeamSeason } from "../types";

export function isMaleModelChoice(modelChoice?: TeamModelChoice) {
  return modelChoice === "欧洲30岁左右男模特";
}

function pickLine(lines: string[], seed = "") {
  const value = Array.from(seed || "menswear").reduce((total, char) => total + char.charCodeAt(0), 0);
  return lines[value % lines.length];
}

function getSeasonalMenswearLines(season: TeamSeason) {
  const lines: Record<TeamSeason, string[]> = {
    春: [
      "Style him in a crisp cotton shirt, light wool blazer, softly pleated tailored trousers, and a no-logo leather tote for polished spring business casual.",
      "Style him in a fine knit polo, pale tailored chinos, a soft beige trench, and a slim leather belt for clean spring city ease.",
      "Style him in a silk-cotton shirt, straight light denim, a stone overshirt, and understated leather accessories for refined relaxed spring styling.",
      "Style him in an ivory crewneck knit, warm beige tailored trousers, a light taupe jacket, and a simple watch for mild spring sophistication.",
      "Style him in a pale blue cotton shirt, cream tailored trousers, and a soft grey blazer for a quiet commute-ready spring look."
    ],
    夏: [
      "Style him in a linen-cotton shirt, breathable tailored trousers, and a restrained canvas-leather tote for refined summer business casual.",
      "Style him in a mercerized-cotton polo, cream linen trousers, and a slim leather belt for light summer polish without sporty energy.",
      "Style him in a silk-cotton short-sleeve shirt, soft stone tailored shorts, and understated accessories for warm-weather sophistication.",
      "Style him in a pale blue shirt, ivory lightweight trousers, and a soft taupe overshirt carried or layered only if natural for breathable summer depth.",
      "Style him in a cream cotton tee under a lightweight linen overshirt, beige trousers, and a simple watch for easy but elevated summer styling."
    ],
    秋: [
      "Style him in a cashmere-blend knit polo, warm wool trousers, a taupe overshirt, and no-logo leather accessories for tactile autumn business casual.",
      "Style him in a cream shirt under fine-gauge knitwear, dark straight denim, and a soft camel jacket for relaxed autumn polish.",
      "Style him in an oatmeal turtleneck, stone tailored trousers, and a muted brown suede blouson for quiet seasonal depth.",
      "Style him in a pale cotton shirt, cappuccino knit cardigan, charcoal tailored trousers, and a simple watch for mature autumn ease.",
      "Style him in a soft grey blazer, ivory knit, warm beige trousers, and restrained leather accessories for a composed city autumn look."
    ],
    冬: [
      "Style him in a warm ivory turtleneck, tailored wool trousers, a double-face cream coat, and restrained leather accessories for clean winter sophistication.",
      "Style him in an oatmeal cashmere-blend knit, dark structured denim, a warm grey coat, and a simple watch for composed winter depth.",
      "Style him in a winter-white shirt under a fine wool cardigan, taupe trousers, and a soft camel coat for quiet cold-weather polish.",
      "Style him in a cappuccino knit polo, charcoal wool trousers, and a muted brown coat for refined winter business casual.",
      "Style him in a cream high-neck knit, warm grey tailored trousers, and a soft beige wool jacket for understated winter elegance."
    ]
  };

  return lines[season];
}

function getSeasonalMenswearLine(season: TeamSeason, seed = "") {
  return pickLine(getSeasonalMenswearLines(season), seed);
}

function getMenswearTailoringQualityLine(preference: TeamGarmentTypePreference, season: TeamSeason) {
  if (preference === "轻运动") {
    return "Keep the men's active styling premium and precise: clean seams, refined technical fabric, balanced fit, calm layering, and no gym-influencer or sports-campaign feeling.";
  }

  const seasonalFabrics: Record<TeamSeason, string> = {
    春: "crisp cotton, silk-cotton, light wool, soft suede, or fine knit texture",
    夏: "linen-cotton, silk-cotton, breathable cotton, mercerized cotton, or thin canvas texture",
    秋: "fine wool, brushed cotton, soft suede, cashmere-blend knit, or warm cotton twill texture",
    冬: "wool, cashmere-blend knit, double-face wool, brushed cotton, structured denim, or soft suede texture"
  };

  return `Keep the menswear luxury-level but quiet: precise shoulder line, clean collar, refined fabric drape, natural trouser break, premium seams and buttons, and tactile ${seasonalFabrics[season]}.`;
}

function getMenswearEquivalentLine(preference: TeamGarmentTypePreference, season: TeamSeason, seed = "") {
  if (preference === "裤装") {
    return `Use refined men's business-casual trousers: tailored wool trousers, straight denim, relaxed linen trousers, or clean city chinos with a shirt, cotton polo, overshirt, blazer, trench, or coat. ${getMenswearTailoringQualityLine(preference, season)}`;
  }
  if (preference === "短裤") {
    return `Use refined men's knee-length tailored shorts or cotton-linen Bermuda shorts with a clean shirt, cotton polo, or light overshirt; avoid denim shorts, beachwear, or sporty shorts outside active scenes. ${getMenswearTailoringQualityLine(preference, season)}`;
  }
  if (preference === "裙装") {
    return `Use menswear with similar soft drape and visual ease: soft tailored trousers or relaxed wide-leg trousers with elegant movement, refined proportions, and clear sneaker visibility. ${getMenswearTailoringQualityLine(preference, season)}`;
  }
  if (preference === "连衣裙") {
    return `Use a masculine equivalent to one-piece styling: a clean coordinated shirt-and-trouser set or refined overshirt-and-trouser set with quiet tailoring. ${getMenswearTailoringQualityLine(preference, season)}`;
  }
  if (preference === "轻运动") {
    return `Use refined men's light activewear: a clean active top, tailored active shorts or active trousers, a zip layer, and minimal gym-ready accessories. ${getMenswearTailoringQualityLine(preference, season)}`;
  }

  return `${getSeasonalMenswearLine(season, seed)} ${getMenswearTailoringQualityLine(preference, season)}`;
}

export function getMenswearGarmentTypeLockLine(
  preference: TeamGarmentTypePreference,
  season: TeamSeason,
  modelChoice?: TeamModelChoice
) {
  if (!isMaleModelChoice(modelChoice) || preference === "自动匹配") return "";

  const direction: Record<Exclude<TeamGarmentTypePreference, "自动匹配">, string> = {
    裤装: "refined men's trousers, straight denim, city chinos, shirt, cotton polo, blazer, trench, or coat",
    短裤: "refined men's knee-length tailored shorts or cotton-linen Bermuda shorts with a clean shirt, cotton polo, or light overshirt",
    裙装: "menswear with soft drape: relaxed tailored trousers or wide-leg trousers with clear sneaker visibility",
    连衣裙: "coordinated menswear set: clean shirt-and-trouser or overshirt-and-trouser styling",
    轻运动: "refined men's activewear: clean active top with active shorts, active trousers, or a zip layer"
  };

  return `Selected menswear direction: ${direction[preference]}; keep it quietly tailored, logo-free, masculine, and grounded in real daily menswear.`;
}

function replaceFemalePronouns(text: string) {
  return text
    .replace(/\bStyle her\b/g, "Style him")
    .replace(/\bstyle her\b/g, "style him")
    .replace(/\bPair her\b/g, "Pair him")
    .replace(/\bpair her\b/g, "pair him")
    .replace(/\bPlace her\b/g, "Place him")
    .replace(/\bplace her\b/g, "place him")
    .replace(/\bKeep her\b/g, "Keep him")
    .replace(/\bkeep her\b/g, "keep him")
    .replace(/\bShow her\b/g, "Show him")
    .replace(/\bshow her\b/g, "show him")
    .replace(/\bLet her\b/g, "Let his")
    .replace(/\blet her\b/g, "let his")
    .replace(/\bUse her\b/g, "Use his")
    .replace(/\buse her\b/g, "use his")
    .replace(/\bher\b(?=\s+(?:in|with|near|by|beside|at|walking|pausing|standing|sitting|holding|checking|adjusting|opening|wearing|moving|looking|touching))/gi, "him")
    .replace(/\bher\b(?=\s+(?:and|while|as|rather|without|before|after))/gi, "him")
    .replace(/\bher\b(?=\s+(?:face|eyes|hair|body|gaze|skin|hands|shoulders|posture|identity|profile|style|styling|wardrobe|proportions|outfit|sneakers|shoes|presence|world))/gi, "his")
    .replace(/\bshe\b/gi, "he")
    .replace(/\bwoman's\b/gi, "man's")
    .replace(/\bwomen's\b/gi, "men's")
    .replace(/\bwoman\b/gi, "man")
    .replace(/\bwomen\b/gi, "men");
}

function replaceFemaleGarments(text: string) {
  const replacements: Array<[RegExp, string]> = [
    [/\bivory silk shirt dress\b/gi, "ivory silk-cotton shirt with tailored trousers"],
    [/\bcream shirt dress\b/gi, "cream shirt with tailored trousers"],
    [/\bshirt dress\b/gi, "shirt-and-trouser set"],
    [/\bsoft grey summer dress\b/gi, "soft grey summer shirt-and-trouser set"],
    [/\bpale khaki sleeveless dress\b/gi, "pale khaki short-sleeve shirt with tailored trousers"],
    [/\bstone grey long-sleeve wool-blend dress\b/gi, "stone grey wool-blend knit with tailored trousers"],
    [/\bstraight dress\b/gi, "straight trouser set"],
    [/\btank dress\b/gi, "short-sleeve knit with tailored trousers"],
    [/\bdress\b/gi, "coordinated shirt-and-trouser set"],
    [/\bsoft grey pleated midi skirt\b/gi, "soft grey pleated tailored trousers"],
    [/\bchampagne satin midi skirt\b/gi, "champagne-toned satin-finish tailored trousers"],
    [/\bcream column skirt\b/gi, "cream straight tailored trousers"],
    [/\bcream midi skirt\b/gi, "cream tailored trousers"],
    [/\bwhite straight midi skirt\b/gi, "white straight tailored trousers"],
    [/\bwarm beige straight skirt\b/gi, "warm beige straight trousers"],
    [/\bsoft grey straight skirt\b/gi, "soft grey straight trousers"],
    [/\blight denim midi skirt\b/gi, "light straight denim"],
    [/\bA-line skirt\b/gi, "relaxed tailored trousers"],
    [/\bmidi skirt\b/gi, "tailored trousers"],
    [/\bskirt\b/gi, "tailored trousers"],
    [/\bivory silk blouse\b/gi, "ivory silk-cotton shirt"],
    [/\bcream silk blouse\b/gi, "cream silk-cotton shirt"],
    [/\bsoft beige blouse\b/gi, "soft beige shirt"],
    [/\bblouse\b/gi, "shirt"],
    [/\bfitted tank top\b/gi, "clean knit tee"],
    [/\bblack fitted tank\b/gi, "black clean-cut knit tee"],
    [/\bblack camisole\b/gi, "black lightweight knit tee"],
    [/\bcamisole\b/gi, "lightweight knit tee"],
    [/\bsleeveless top\b/gi, "short-sleeve knit top"],
    [/\bsleeveless knit top\b/gi, "short-sleeve knit top"],
    [/\bactive tank\b/gi, "active tee"],
    [/\btank\b/gi, "knit tee"],
    [/\bwhite tee\b/gi, "white fine cotton tee"],
    [/\bcream tee\b/gi, "cream fine cotton tee"],
    [/\bblack tee\b/gi, "black fine cotton tee"],
    [/\bwhite cotton T-shirt\b/gi, "white fine cotton tee under a light overshirt"],
    [/\bcotton T-shirt\b/gi, "fine cotton tee under a light overshirt"],
    [/\bT-shirt\b/gi, "fine cotton tee"],
    [/\bunbuttoned overshirt\b/gi, "relaxed layered overshirt"],
    [/\bhandbag\b/gi, "no-logo leather tote"],
    [/\bmini bag\b/gi, "slim leather crossbody bag"],
    [/\bsmall shoulder bag\b/gi, "slim leather crossbody bag"],
    [/\bshoulder bag\b/gi, "slim leather crossbody bag"],
    [/\bminimal pearl earrings\b/gi, "simple watch"],
    [/\bmatte gold earrings\b/gi, "simple watch"],
    [/\bgold earrings\b/gi, "simple watch"],
    [/\bearrings\b/gi, "simple watch"],
    [/\bjewelry-heavy\b/gi, "accessory-heavy"],
    [/\bjewelry\b/gi, "understated accessories"],
    [/\bfeminine but not sweet\b/gi, "refined but not decorative"],
    [/\bsoftly feminine\b/gi, "softly refined"],
    [/\bfeminine ease\b/gi, "soft ease"],
    [/\brefined feminine\b/gi, "refined"],
    [/\bfeminine daily styling\b/gi, "understated daily styling"]
  ];

  return replacements.reduce((next, [pattern, replacement]) => next.replace(pattern, replacement), text);
}

function shouldReplaceWithMenswearLine(text: string, preference: TeamGarmentTypePreference) {
  return (
    preference === "裙装" ||
    preference === "连衣裙" ||
    /\b(skirt|dress|blouse)\b/i.test(text)
  );
}

function applySeasonalMenswearCorrections(text: string, season: TeamSeason) {
  if (season === "冬") {
    return text
      .replace(/\blightweight knit\b/gi, "warm fine-gauge knit")
      .replace(/\blinen shirt\b/gi, "winter cotton shirt")
      .replace(/\blinen trousers\b/gi, "wool trousers")
      .replace(/\blinen overshirt\b/gi, "wool-cotton overshirt")
      .replace(/\bshort-sleeve shirt\b/gi, "long-sleeve shirt")
      .replace(/\btailored shorts\b/gi, "tailored wool trousers")
      .replace(/\bBermuda shorts\b/gi, "relaxed wool trousers")
      .replace(/\bactive shorts\b/gi, "active trousers");
  }
  if (season === "夏") {
    return text
      .replace(/\bwool trousers\b/gi, "lightweight tailored trousers")
      .replace(/\bwool coat\b/gi, "lightweight overshirt")
      .replace(/\blong coat\b/gi, "lightweight overshirt")
      .replace(/\bcashmere-blend sweater\b/gi, "fine knit polo");
  }
  return text;
}

export function adaptOutfitLineForModelChoice(input: {
  outfitLine: string;
  modelChoice: TeamModelChoice;
  garmentTypePreference: TeamGarmentTypePreference;
  season: TeamSeason;
  generationNonce?: number;
}) {
  if (!isMaleModelChoice(input.modelChoice)) return input.outfitLine;

  const seed = `${input.generationNonce ?? 0}:${input.season}:${input.garmentTypePreference}:${input.outfitLine}`;
  if (shouldReplaceWithMenswearLine(input.outfitLine, input.garmentTypePreference)) {
    return `${getSeasonalMenswearLine(input.season, seed)} ${getMenswearTailoringQualityLine(input.garmentTypePreference, input.season)}`;
  }

  return `${applySeasonalMenswearCorrections(
    replaceFemaleGarments(replaceFemalePronouns(input.outfitLine)),
    input.season
  )} ${getMenswearTailoringQualityLine(input.garmentTypePreference, input.season)}`
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function adaptFinalPromptForModelChoice(prompt: string, modelChoice: TeamModelChoice) {
  if (!isMaleModelChoice(modelChoice)) return prompt;
  return replaceFemaleGarments(replaceFemalePronouns(prompt))
    .replace(/\bfitted fine cotton tee\b/gi, "clean-cut fine cotton tee")
    .replace(/\bfitted tee\b/gi, "clean-cut tee")
    .replace(/\bcomputer-perfect man\b/gi, "computer-perfect person")
    .replace(/\bprofessional fashion model face\b/gi, "professional campaign face")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
