import type { TeamShoe, TeamStillLifeStyle } from "../types";

export type StillLifeProductProfile =
  | "classicLightLeather"
  | "warmSuede"
  | "coolBlueSuede"
  | "metallicSilver"
  | "breathableMesh"
  | "blackWhiteContrast"
  | "brightColor";

export const productStillLifeBaseCompact =
  "Generate a refined THERUIZ AURA product still life image. The sneaker must be the main subject. The image should feel premium, clean, tactile, and compositionally restrained. Show the product clearly, preserve the exact shape, toe box, outsole thickness, panel structure, laces, stitching, material texture, and real color. Avoid generic e-commerce packshot feeling, cheap props, cluttered composition, harsh commercial lighting, or artificial luxury clichés.";

export const unifiedStillLifeCompact =
  "Create the still life image in THERUIZ AURA’s core visual language: cream-white, warm beige, soft stone, low saturation, natural daylight, soft shadow, tactile material authenticity, quiet negative space, and refined warm minimalism. Use pale stone, warm grey plaster, cream paper, linen, travertine, or soft matte surfaces. Prefer a single shoe, a pair, a clean 45-degree front-side angle, a natural top view, or a balanced restrained arrangement with only minimal material props.";

export const adaptiveStillLifeStylingCompact =
  "Choose the still life tone automatically based on the sneaker’s real color, material, and surface character. The image must still feel premium, restrained, low-noise, and aligned with THERUIZ AURA, while the palette, background, lighting, and shooting angle may shift to better support the product.";

export const adaptiveStillLifeBoundaryCompact =
  "Even when the still life image does not fully follow the master visual, it must still belong to THERUIZ AURA. Keep it restrained, tactile, premium, and low-noise. Avoid loud color blocking, trendy commercial set design, hyper-glossy fashion styling, cheap props, noisy backgrounds, artificial storytelling, or anything off-brand.";

const adaptiveLines: Record<StillLifeProductProfile, string> = {
  classicLightLeather:
    "Use a soft light neutral still life direction with cream-white, pale stone, warm grey, travertine, or linen textures. Keep the lighting soft and natural, the composition restrained, and the product feeling clean, light, and quietly premium.",
  warmSuede:
    "Use a warm tactile still life direction with oatmeal, taupe, beige-brown, matte paper, linen, or soft stone surfaces. Let the suede texture read clearly through gentle side light and restrained close-up detail emphasis.",
  coolBlueSuede:
    "Use a cool soft still life direction with mist grey, pale stone, muted blue-grey, or powdery neutral surfaces. Keep the light airy and soft so the low-saturation color and suede texture feel fresh, calm, and refined.",
  metallicSilver:
    "Use a restrained cool-neutral still life direction with pale grey, mist silver-grey, soft cement, or matte acrylic surfaces. Control reflections carefully and keep the metallic effect elegant, soft, and urban rather than chrome, cyber, or flashy.",
  breathableMesh:
    "Use an airy breathable still life direction with warm off-white, pale stone, soft translucent surfaces, and gentle daylight. Let the mesh or breathable construction read clearly through light, shadow, and clean negative space.",
  blackWhiteContrast:
    "Use a clean structured still life direction with warm grey, soft cement, off-white grey, or pale stone backgrounds. Let the black-white contrast read clearly while keeping the overall mood soft, refined, and non-streetwear.",
  brightColor:
    "Use a soft color-supportive still life direction with pale tonal backgrounds that gently echo the shoe color without competing with it. Keep the props minimal and let the product color remain the visual focus in a refined way."
};

const shotLines: Record<StillLifeProductProfile, string> = {
  classicLightLeather:
    "Present the sneaker as a clean single-shoe still life in a refined 45-degree view.",
  warmSuede:
    "Focus on a close still life angle that lets the material texture read clearly.",
  coolBlueSuede:
    "Present the sneaker as a clean single-shoe still life in a refined 45-degree view.",
  metallicSilver:
    "Arrange the pair in a natural overlapping composition with calm negative space.",
  breathableMesh:
    "Combine a clean pair arrangement with one subtle detail emphasis on texture or panel transition.",
  blackWhiteContrast:
    "Use a balanced top-view composition with restrained styling and clear structure.",
  brightColor:
    "Present the sneaker as a clean single-shoe still life in a refined 45-degree view."
};

export const productStillLifeNegative =
  "Avoid generic packshot look, cheap e-commerce tabletop styling, artificial luxury clichés, crowded props, high-saturation background, glossy magazine excess, hard flash lighting, poor material readability, wrong color cast, colorful props, black-heavy contrast, sporty commercial styling, messy arrangement, and any composition that distorts the sneaker’s real structure.";

export const metallicStillLifeNegative =
  "Avoid chrome cyber styling, nightlife mood, mirror-like harsh reflection, and flashy futuristic commercial aesthetics.";

export const meshStillLifeNegative =
  "Avoid heavy background, dense props, dark moody lighting, and any setup that weakens the breathable lightness.";

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

export function getStillLifeProductProfile(
  shoe: TeamShoe,
  customShoe: string,
  extraRequirement: string
): StillLifeProductProfile {
  const text = `${shoe} ${customShoe} ${extraRequirement}`.toLowerCase();

  if (shoe === "Silver Romance 银色浪漫" || includesAny(text, ["silver", "metallic", "银", "金属", "反光"])) {
    return "metallicSilver";
  }

  if (shoe === "Aire 微风" || includesAny(text, ["mesh", "breathable", "网布", "透气", "轻透"])) {
    return "breathableMesh";
  }

  if (shoe === "Delphinium Blue 飞燕草蓝" || includesAny(text, ["blue", "灰蓝", "浅蓝", "蓝"])) {
    return "coolBlueSuede";
  }

  if (
    shoe === "Cappuccino 卡布奇诺" ||
    shoe === "Maple Grove 枫林" ||
    includesAny(text, ["suede", "麂皮", "coffee", "cappuccino", "brown", "maple", "咖", "棕", "驼"])
  ) {
    return "warmSuede";
  }

  if (shoe === "Lemon 柠檬" || includesAny(text, ["lemon", "yellow", "butter", "柠檬", "黄色", "奶黄"])) {
    return "brightColor";
  }

  if (
    shoe === "Oreo 奥利奥" ||
    shoe === "Panda 熊猫" ||
    includesAny(text, ["black white", "black-and-white", "黑白", "拼接"])
  ) {
    return "blackWhiteContrast";
  }

  return "classicLightLeather";
}

export function getStillLifeStylePrompt(
  style: TeamStillLifeStyle,
  profile: StillLifeProductProfile
) {
  if (style === "与主视觉统一") {
    return unifiedStillLifeCompact;
  }

  return [
    adaptiveStillLifeStylingCompact,
    adaptiveLines[profile],
    shotLines[profile],
    adaptiveStillLifeBoundaryCompact
  ].join("\n\n");
}
