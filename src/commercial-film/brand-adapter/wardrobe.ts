import type { CommercialIntentId } from "../types";

export type CommercialWardrobeStyleId =
  | "RELAXED_MINIMAL"
  | "URBAN_COMMUTER"
  | "RELAXED_TAILORING"
  | "DENIM_EVERYDAY"
  | "SOFT_FEMININE"
  | "WEEKEND_CITY";

export type CommercialWardrobeStyle = {
  id: CommercialWardrobeStyleId;
  displayName: string;
  positioning: string;
  silhouette: string;
  tops: readonly string[];
  bottoms: readonly string[];
  outerwear: readonly string[];
  palette: readonly string[];
  fabricFeeling: string;
  footwearRelationship: string;
  avoid: readonly string[];
};

export type CommercialWardrobeResolution = {
  styleId: CommercialWardrobeStyleId;
  displayName: string;
  top: string;
  bottom: string;
  outerwear: string | null;
  colors: { top: string; bottom: string; outerwear: string | null };
  visualLines: string[];
  negativeLines: string[];
};

// THERUIZ AURA Brand Pack's Commercial Film wardrobe profile. These are outfit
// choices only; Commercial Intent and Product Visibility remain separate authorities.
export const THERUIZ_AURA_COMMERCIAL_WARDROBE_STYLES: Readonly<Record<CommercialWardrobeStyleId, CommercialWardrobeStyle>> = {
  RELAXED_MINIMAL: {
    id: "RELAXED_MINIMAL", displayName: "松弛极简 / Relaxed Minimal",
    positioning: "Clean, restrained, relaxed and tactile daily dressing for a mature city woman; never homewear or a severe minimalist uniform.",
    silhouette: "relaxed straight lines, clean proportions, soft structure and natural ease without oversized volume",
    tops: ["fine knit", "simple shirt", "clean tee", "lightweight cardigan"],
    bottoms: ["straight trousers", "relaxed straight pants", "clean ankle-length trousers"],
    outerwear: ["soft jacket", "light trench", "restrained cardigan", "minimal short coat"],
    palette: ["cream", "stone", "warm grey", "camel", "soft white", "charcoal", "restrained navy"],
    fabricFeeling: "matte, soft tactile texture; fine knit or softly structured woven fabric",
    footwearRelationship: "Keep the shoe naturally part of the complete look. Use a clean ankle break so the toe, side silhouette or sole-to-ground relationship remains readable in ordinary standing or walking.",
    avoid: ["severe minimalism", "oversized streetwear", "glossy luxury styling", "teenage styling", "sportswear look", "beige-only repetition"],
  },
  URBAN_COMMUTER: {
    id: "URBAN_COMMUTER", displayName: "都市通勤 / Urban Commuter",
    positioning: "A real workday wardrobe for a 30–45-year-old city woman: professional and mobile without an office uniform.",
    silhouette: "clean, mobile, lightly structured, with a straight vertical proportion",
    tops: ["pale blue shirt", "white shirt", "fine knit", "lightweight knit top", "restrained blouse"],
    bottoms: ["straight trousers", "relaxed tailored trousers", "dark straight denim"],
    outerwear: ["short structured jacket", "soft blazer", "trench coat", "lightweight city coat"],
    palette: ["white", "pale blue", "navy", "charcoal", "stone", "camel", "warm grey"],
    fabricFeeling: "fine wool, cotton poplin, matte tailoring fabric or fine knit",
    footwearRelationship: "Let the worn shoe belong to walking, entering, leaving, crossing or standing. Keep the trouser hem clear of most of the upper; the shoe relaxes the workwear rather than reading as sports footwear with a suit.",
    avoid: ["corporate uniform", "high-heels styling logic", "stiff business suit", "banker aesthetic", "formal handbag posing", "sports commuter styling"],
  },
  RELAXED_TAILORING: {
    id: "RELAXED_TAILORING", displayName: "松弛西装感 / Relaxed Tailoring",
    positioning: "Tailoring without stiffness for a mature, independent city woman.",
    silhouette: "soft tailoring, relaxed straight line, light shoulder structure and effortless proportion",
    tops: ["fine knit", "clean shirt", "simple tee", "lightweight blouse"],
    bottoms: ["straight tailored trousers", "softly wide straight trousers", "ankle-length tailored pants"],
    outerwear: ["unstructured blazer", "soft blazer", "lightweight tailored jacket", "restrained long coat"],
    palette: ["charcoal", "warm grey", "cream", "navy", "camel", "soft white", "muted brown"],
    fabricFeeling: "matte suiting, fine wool, soft woven fabric or tactile knit",
    footwearRelationship: "The German Trainer is the relaxed point within the tailoring. Preserve the visual relationship between shoe and trouser hem; never let fabric pool over the upper.",
    avoid: ["power suit", "sharp corporate tailoring", "masculine business stereotype", "runway tailoring", "exaggerated shoulder pads", "head-to-toe formalwear"],
  },
  DENIM_EVERYDAY: {
    id: "DENIM_EVERYDAY", displayName: "牛仔日常 / Denim Everyday",
    positioning: "Mature, clean, believable everyday denim that a city woman could really wear repeatedly.",
    silhouette: "relaxed straight, clean casual proportion and natural movement",
    tops: ["white tee", "pale blue shirt", "soft knit", "cardigan", "restrained striped knit"],
    bottoms: ["straight denim", "slightly relaxed denim", "clean cropped denim", "dark straight denim"],
    outerwear: ["cardigan", "short jacket", "soft trench", "light casual jacket"],
    palette: ["washed blue", "dark denim blue", "cream", "soft white", "grey", "navy", "camel"],
    fabricFeeling: "clean denim, cotton, knit and matte casual fabric",
    footwearRelationship: "Use a straight, natural ankle break or slight crop; do not cover most of the shoe. In movement, keep the toe, side or gum-sole-to-ground relationship naturally visible.",
    avoid: ["ripped denim", "distressed street denim", "baggy youth streetwear", "Y2K", "sneakerhead styling", "baseball-cap street look", "exaggerated oversized denim"],
  },
  SOFT_FEMININE: {
    id: "SOFT_FEMININE", displayName: "轻柔女性感 / Soft Feminine",
    positioning: "Mature, natural femininity without sweetness, girlishness or deliberate sex appeal.",
    silhouette: "fluid, soft and clean, feminine without decorative overload",
    tops: ["fine knit", "soft blouse", "lightweight cardigan", "clean fitted knit", "restrained shirt"],
    bottoms: ["fluid straight trousers", "soft midi skirt", "clean long skirt", "gently draped trousers"],
    outerwear: ["soft cardigan", "lightweight coat", "restrained short jacket", "soft trench"],
    palette: ["cream", "soft white", "dusty beige", "restrained muted blush", "warm grey", "muted brown", "soft blue"],
    fabricFeeling: "fine knit, soft woven fabric, light drape and matte tactile surfaces",
    footwearRelationship: "Let the shoe make a restrained contrast with the feminine clothing. Skirt or trouser hems must not fully hide it; keep it naturally worn, without deliberate presentation.",
    avoid: ["coquette", "balletcore", "bows", "excessive lace", "girlish styling", "doll-like styling", "sexy styling", "high-saturation pink"],
  },
  WEEKEND_CITY: {
    id: "WEEKEND_CITY", displayName: "城市周末 / Weekend City",
    positioning: "Natural city weekends: coffee, flowers, walking, friends and bookshops for a mature woman.",
    silhouette: "relaxed, mobile, layered and effortless city casual",
    tops: ["clean tee", "shirt", "soft knit", "cardigan", "refined non-sporty lightweight sweatshirt"],
    bottoms: ["straight denim", "relaxed trousers", "clean casual pants", "restrained utility-inspired trousers"],
    outerwear: ["short jacket", "cardigan", "trench", "lightweight city coat", "soft casual blazer"],
    palette: ["cream", "washed blue", "navy", "warm grey", "camel", "muted brown", "soft white", "charcoal"],
    fabricFeeling: "denim, cotton, knit, matte casual textures and light outerwear fabric",
    footwearRelationship: "Keep the worn shoe present through walking, waiting, entering, sitting, browsing or leaving at ordinary scale. Never turn the action into a shoe close-up or deliberate presentation.",
    avoid: ["outdoor gorpcore", "hiking styling", "sporty tracksuit", "streetwear", "teenage weekend look", "influencer café posing", "deliberate shoe presentation"],
  },
};

const STYLE_ORDER: Readonly<Record<CommercialIntentId, readonly CommercialWardrobeStyleId[]>> = {
  QUIET_LUXURY: ["RELAXED_MINIMAL", "RELAXED_TAILORING", "SOFT_FEMININE", "URBAN_COMMUTER", "DENIM_EVERYDAY", "WEEKEND_CITY"],
  URBAN_MOTION: ["URBAN_COMMUTER", "DENIM_EVERYDAY", "WEEKEND_CITY", "RELAXED_MINIMAL", "RELAXED_TAILORING", "SOFT_FEMININE"],
  DAILY_STYLING: ["DENIM_EVERYDAY", "URBAN_COMMUTER", "RELAXED_MINIMAL", "SOFT_FEMININE", "RELAXED_TAILORING", "WEEKEND_CITY"],
  NEW_ARRIVAL: ["RELAXED_MINIMAL", "RELAXED_TAILORING", "URBAN_COMMUTER", "SOFT_FEMININE", "DENIM_EVERYDAY", "WEEKEND_CITY"],
  PRODUCT_CRAFT: ["RELAXED_MINIMAL", "URBAN_COMMUTER", "RELAXED_TAILORING", "DENIM_EVERYDAY", "SOFT_FEMININE", "WEEKEND_CITY"],
};

function index(value: number, length: number): number {
  return ((value % length) + length) % length;
}

function garmentColor(styleId: CommercialWardrobeStyleId, garment: string, chosen: string, nonce: number): string {
  if (/\bpale blue\b/i.test(garment)) return "pale blue";
  if (/\bwhite\b/i.test(garment)) return "white";
  if (/\bdark(?: straight)? denim\b/i.test(garment)) return "dark denim blue";
  if (/\bdenim\b/i.test(garment)) return styleId === "DENIM_EVERYDAY"
    ? ["washed blue", "dark denim blue"][index(nonce, 2)]
    : "dark denim blue";
  return chosen;
}

function coloredGarment(garment: string, color: string): string {
  return garment.startsWith(`${color} `) || /^(?:white|pale blue|dark)\b/i.test(garment)
    ? garment
    : `${color} ${garment}`;
}

export function resolveCommercialWardrobe(input: {
  styles: Readonly<Record<CommercialWardrobeStyleId, CommercialWardrobeStyle>>;
  intent: CommercialIntentId;
  generationNonce?: number;
  styleId?: CommercialWardrobeStyleId;
  season: "春" | "夏" | "秋" | "冬";
}): CommercialWardrobeResolution {
  const nonce = Number.isFinite(input.generationNonce) ? Math.trunc(input.generationNonce ?? 0) : 0;
  const order = STYLE_ORDER[input.intent];
  const styleId = input.styleId ?? order[index(nonce, order.length)];
  const style = input.styles[styleId];
  if (!style) throw new Error(`Unknown THERUIZ AURA Commercial wardrobe style: ${styleId}`);
  const offset = Object.keys(input.styles).indexOf(styleId);
  const top = style.tops[index(nonce, style.tops.length)];
  const bottom = style.bottoms[index(nonce + offset, style.bottoms.length)];
  const outerwear = input.season === "夏" ? null : style.outerwear[index(Math.floor(nonce / 2) + offset, style.outerwear.length)];
  const topColor = garmentColor(styleId, top, style.palette[index(nonce * 2 + offset, style.palette.length)], nonce);
  let bottomColor = garmentColor(styleId, bottom, style.palette[index(nonce * 2 + offset + 3, style.palette.length)], nonce);
  if (bottomColor === topColor) bottomColor = style.palette[index(nonce * 2 + offset + 1, style.palette.length)];
  const outerPalette = style.palette.filter((color) => !/denim blue|washed blue/i.test(color));
  const outerColor = outerwear ? outerPalette[index(nonce * 2 + offset + 5, outerPalette.length)] : null;
  const visualLines = [
    `Wardrobe style: ${style.displayName}. ${style.positioning}`,
    `Wardrobe composition: ${coloredGarment(top, topColor)}; ${coloredGarment(bottom, bottomColor)}${outerwear && outerColor ? `; ${coloredGarment(outerwear, outerColor)}` : "; no outer layer in summer"}.`,
    `Wardrobe silhouette and fabric: ${style.silhouette}; ${style.fabricFeeling}.`,
    `Worn-footwear relationship: ${style.footwearRelationship} Keep the same outfit across every beat; this styling rule does not change the Product Visibility state or camera plan.`,
  ];
  return {
    styleId, displayName: style.displayName, top, bottom, outerwear,
    colors: { top: topColor, bottom: bottomColor, outerwear: outerColor },
    visualLines,
    negativeLines: [`Wardrobe styling only: avoid ${style.avoid.join("; ")}.`],
  };
}
