import type { TeamGarmentTypePreference, TeamModelChoice, TeamSeason } from "../types";

export function isMaleModelChoice(modelChoice?: TeamModelChoice) {
  return modelChoice === "欧洲30岁左右男模特";
}

function getSeasonalMenswearLine(season: TeamSeason) {
  const lines: Record<TeamSeason, string> = {
    春: "Style him in a crisp cotton shirt or fine knit polo, light tailored trousers or straight denim, a soft beige trench or overshirt, and no-logo leather or canvas accessories for clean spring ease.",
    夏: "Style him in a linen shirt or refined knit polo, breathable tailored trousers or knee-length cotton shorts, and understated leather or canvas accessories for quiet summer ease.",
    秋: "Style him in fine-gauge knitwear, straight denim or warm tailored trousers, a taupe overshirt or soft blazer, and no-logo leather accessories for tactile autumn polish.",
    冬: "Style him in an ivory or oatmeal knit, wool trousers or dark structured denim, a warm grey or camel coat, and restrained leather accessories for clean winter sophistication."
  };

  return lines[season];
}

function getMenswearEquivalentLine(preference: TeamGarmentTypePreference, season: TeamSeason) {
  if (preference === "裤装") {
    return "Use refined men's trousers: tailored wool trousers, straight denim, relaxed linen trousers, or clean city chinos with a shirt, knit polo, overshirt, blazer, or coat.";
  }
  if (preference === "短裤") {
    return "Use refined men's knee-length tailored shorts or cotton-linen Bermuda shorts with a clean shirt, knit polo, or light overshirt; avoid denim shorts, beachwear, or sporty shorts outside active scenes.";
  }
  if (preference === "裙装") {
    return "Use menswear with similar soft drape and visual ease: soft tailored trousers or relaxed wide-leg trousers with elegant movement, refined proportions, and clear sneaker visibility.";
  }
  if (preference === "连衣裙") {
    return "Use a masculine equivalent to one-piece styling: a clean coordinated shirt-and-trouser set or refined overshirt-and-trouser set with quiet tailoring.";
  }
  if (preference === "轻运动") {
    return "Use refined men's light activewear: a clean active top, tailored active shorts or active trousers, a zip layer, and minimal gym-ready accessories.";
  }

  return getSeasonalMenswearLine(season);
}

export function getMenswearGarmentTypeLockLine(
  preference: TeamGarmentTypePreference,
  season: TeamSeason,
  modelChoice?: TeamModelChoice
) {
  if (!isMaleModelChoice(modelChoice) || preference === "自动匹配") return "";

  return `Selected menswear direction: ${getMenswearEquivalentLine(preference, season)} Avoid dresses, skirts, blouses, jewelry-heavy styling, feminine styling, runway menswear, or gym-influencer styling.`;
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

export function adaptOutfitLineForModelChoice(input: {
  outfitLine: string;
  modelChoice: TeamModelChoice;
  garmentTypePreference: TeamGarmentTypePreference;
  season: TeamSeason;
}) {
  if (!isMaleModelChoice(input.modelChoice)) return input.outfitLine;

  if (shouldReplaceWithMenswearLine(input.outfitLine, input.garmentTypePreference)) {
    return getSeasonalMenswearLine(input.season);
  }

  return replaceFemaleGarments(replaceFemalePronouns(input.outfitLine)).replace(/\s{2,}/g, " ").trim();
}

export function adaptFinalPromptForModelChoice(prompt: string, modelChoice: TeamModelChoice) {
  if (!isMaleModelChoice(modelChoice)) return prompt;
  return replaceFemaleGarments(replaceFemalePronouns(prompt))
    .replace(/\bcomputer-perfect man\b/gi, "computer-perfect person")
    .replace(/\bprofessional fashion model face\b/gi, "professional campaign face")
    .replace(/\s{2,}/g, " ")
    .trim();
}
