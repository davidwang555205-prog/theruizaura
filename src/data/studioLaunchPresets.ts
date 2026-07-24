import type { TeamStudioLaunchPreset } from "../types";

export type StudioLaunchPresetDefinition = {
  id: TeamStudioLaunchPreset;
  label: string;
  description: string;
  backgroundLine: string;
  lightingLine: string;
  propPolicyLine: string;
  realismLine: string;
  productSeparationLine: string;
  negativeLine: string;
};

const STUDIO_SHARED_REALISM =
  "Use a physically believable professional studio. The backdrop must meet the floor naturally. Keep one coherent main light direction. Maintain realistic contact shadows. Keep material colors accurate. Keep the person, outfit, and sneakers grounded and clearly separated. Avoid fake CGI depth, floating products, glossy showroom staging, and decorative clutter.";

const STUDIO_SHARED_NEGATIVE =
  "hard flash, flat catalog flash, blown white background, colored nightclub light, random neon, multiple conflicting light directions, glossy showroom glare, fake CGI cyclorama, synthetic 3D render, floating feet, floating sneakers, plastic skin, decorative prop cluster, equipment clutter, wedding studio styling, influencer cream set, fake luxury campaign, visible brand logo, readable fake brand text";

const warmGreySeamless: StudioLaunchPresetDefinition = {
  id: "warmGreySeamless",
  label: "暖灰无影棚",
  description: "暖灰/浅石灰/灰米色无缝背景，克制干净的摄影棚搭建",
  backgroundLine:
    "Use a warm grey, light stone, or greige seamless backdrop that naturally curves into the floor as a real built studio cove. Keep the set restrained and clean; do not turn it into a pure e-commerce white-background shot.",
  lightingLine:
    "Use one large soft key light with a single dominant direction, gentle ambient fill, controlled highlights, and soft contact shadows that keep clothing and sneaker materials readable.",
  propPolicyLine: "No props by default.",
  realismLine: STUDIO_SHARED_REALISM,
  productSeparationLine:
    "Maintain clear tonal and edge separation between the warm grey backdrop and the sneakers. Do not let grey products disappear into the grey background.",
  negativeLine:
    `cold industrial grey, concrete ruin, hard flash, backdrop-floor seam errors, CGI seamless cove, floating soles, grey backdrop swallowing grey products, ${STUDIO_SHARED_NEGATIVE}`
};

const creamMinimal: StudioLaunchPresetDefinition = {
  id: "creamMinimal",
  label: "奶油白极简棚",
  description: "奶油白/象牙白/暖米白极简棚，大面积留白，轻微背景层次",
  backgroundLine:
    "Use a cream white, ivory, or warm off-white studio backdrop with generous negative space and a slightly visible background plane. Keep the person, clothing, and sneaker silhouettes clearly readable.",
  lightingLine:
    "Use soft controlled lighting that avoids overexposure. Keep white tones distinct and prevent the backdrop from blowing out or merging with light-colored garments or sneakers.",
  propPolicyLine: "No props by default.",
  realismLine: STUDIO_SHARED_REALISM,
  productSeparationLine:
    "Maintain clear tonal separation between the backdrop, outfit, skin, and sneakers. Prevent white sneakers from losing their edges against the cream-white background.",
  negativeLine:
    `wedding studio styling, influencer cream trend, over-soft focus, glowing edges, white sneaker edge loss, pure-white overexposure, low-contrast person-background merge, ${STUDIO_SHARED_NEGATIVE}`
};

const linenTexture: StudioLaunchPresetDefinition = {
  id: "linenTexture",
  label: "亚麻质感背景棚",
  description: "浅米色/软灰/浅灰褐低调亚麻或纸张纹理背景",
  backgroundLine:
    "Use a light beige, soft grey, or pale taupe backdrop with subtle linen, fabric, or paper texture. The background must still read as a photography studio, not a living space, and the product silhouette must stay sharp.",
  lightingLine:
    "Use soft directional light that clearly reveals sneaker upper material, stitching, tongue, and garment fabric. The texture must not create noisy shadows; keep real contact shadows intact.",
  propPolicyLine: "No props by default.",
  realismLine: STUDIO_SHARED_REALISM,
  productSeparationLine:
    "Keep the product silhouette and clothing texture clearly separated from the background texture so the fabric backdrop does not compete with the subject.",
  negativeLine:
    `stage curtain, heavy wrinkled fabric, rustic decor, guesthouse styling, burlap texture, rough craft backdrop, background texture overpowering person and product, ${STUDIO_SHARED_NEGATIVE}`
};

const monochromeArchitectural: StudioLaunchPresetDefinition = {
  id: "monochromeArchitectural",
  label: "黑白灰结构棚",
  description: "黑、白、灰克制建筑结构棚，简单墙面切角或单一低矮几何支撑",
  backgroundLine:
    "Use a restrained monochrome studio space built from black, white, and grey planes with clean architectural edges. One simple wall-angle cut, one single structural line, or one low platform cube is allowed. The space must feel physically buildable; structure supports composition but never becomes the main subject.",
  lightingLine:
    "Use clean structural soft light with precise tonal separation between person, outfit, sneakers, and background planes. Prevent black products from disappearing into black surfaces and white products from disappearing into white surfaces.",
  propPolicyLine:
    "At most one low geometric support element. No multiple cubes, no complex steps, no large installation. The geometric element must not block either sneaker.",
  realismLine: STUDIO_SHARED_REALISM,
  productSeparationLine:
    "Precise tonal separation; precise tailoring; restrained luxury; no-logo high-end ready-to-wear construction. Keep every structural shadow physically believable.",
  negativeLine:
    `brand logo, brand lettering, brand motif, runway set recreation, luxury brand advertising set, oversized art installation, stacked geometric props, high-contrast stage lighting, ${STUDIO_SHARED_NEGATIVE}`
};

const softWindowLight: StudioLaunchPresetDefinition = {
  id: "softWindowLight",
  label: "自然窗光模拟棚",
  description: "摄影棚内模拟自然窗光，暖白/浅灰背景，不出现真实窗外环境",
  backgroundLine:
    "Use a warm white, light grey, soft stone, or low-saturation beige studio backdrop. The background must retain its studio identity; no real outdoor window view may appear.",
  lightingLine:
    "Use one large single-direction window-light simulator as the main source, evoking morning or late-afternoon natural light. Add gentle ambient fill, realistic light falloff, and soft floor shadows. Material color and texture must stay accurate, and skin must keep a natural look.",
  propPolicyLine: "No props by default.",
  realismLine: STUDIO_SHARED_REALISM,
  productSeparationLine:
    "Maintain natural fabric layers and clear sneaker form under the simulated window light. Do not let the directional light wash out product detail.",
  negativeLine:
    `real outdoor window view, residential interior replacement, cafe replacement, hotel-room replacement, window as main subject, strong venetian-blind stripes, hard direct sunlight, cinematic rim light, multiple conflicting light directions, colored gel, sunset orange filter, fake volumetric rays, HDR effect, ${STUDIO_SHARED_NEGATIVE}`
};

export const STUDIO_LAUNCH_PRESETS: Record<TeamStudioLaunchPreset, StudioLaunchPresetDefinition | null> = {
  auto: null,
  warmGreySeamless,
  creamMinimal,
  linenTexture,
  monochromeArchitectural,
  softWindowLight
};

export const STUDIO_LAUNCH_PRESET_OPTIONS: { value: TeamStudioLaunchPreset; label: string }[] = [
  { value: "auto", label: "自动匹配" },
  { value: "warmGreySeamless", label: "暖灰无影棚" },
  { value: "creamMinimal", label: "奶油白极简棚" },
  { value: "linenTexture", label: "亚麻质感背景棚" },
  { value: "monochromeArchitectural", label: "黑白灰结构棚" },
  { value: "softWindowLight", label: "自然窗光模拟棚" }
];

export function getStudioLaunchPresetDefinition(preset: TeamStudioLaunchPreset): StudioLaunchPresetDefinition | null {
  return STUDIO_LAUNCH_PRESETS[preset] ?? null;
}

const AUTO_PRESETS: TeamStudioLaunchPreset[] = [
  "warmGreySeamless",
  "creamMinimal",
  "linenTexture",
  "monochromeArchitectural",
  "softWindowLight"
];

export function resolveStudioLaunchPreset(params: {
  preset: TeamStudioLaunchPreset;
  nonce: number;
}): StudioLaunchPresetDefinition {
  if (params.preset !== "auto") {
    return STUDIO_LAUNCH_PRESETS[params.preset]!;
  }
  const safeNonce = Math.max(0, Math.abs(params.nonce));
  return STUDIO_LAUNCH_PRESETS[AUTO_PRESETS[safeNonce % AUTO_PRESETS.length]]!;
}
