import type { TeamGarmentTypePreference, TeamImageType, TeamPromptParams, TeamSeason } from "../types";

type RotatingOutfitOption = {
  garment: TeamGarmentTypePreference;
  seasons: TeamSeason[];
  line: string;
};

const rotatingOutfitKeywordOptions: RotatingOutfitOption[] = [
  { garment: "裤装", seasons: ["春", "夏", "秋"], line: "white cotton shirt, cream straight trousers, light beige shirt jacket, taupe shoulder bag, simple watch, clean polished commuter styling" },
  { garment: "裤装", seasons: ["春", "夏"], line: "cream linen shirt, pale khaki linen trousers, thin woven belt, light tan handbag, breathable summer city-walk styling" },
  { garment: "裤装", seasons: ["春", "夏", "秋"], line: "white tee base, pale blue open shirt, dark straight denim, slim leather belt, cream canvas tote, real city outfit-record styling" },
  { garment: "裤装", seasons: ["春", "夏", "秋"], line: "dark coffee clean-cut tee, taupe relaxed trousers, cotton jacket, minimal earrings, grounded dark-anchor daily styling" },
  { garment: "裙装", seasons: ["春", "夏"], line: "soft grey short-sleeve knit, cream midi skirt, taupe handbag, minimal earrings, mature refined feminine styling" },
  { garment: "裙装", seasons: ["春", "夏"], line: "oatmeal knit top, misty blue A-line skirt, pale grey shoulder bag, soft low-saturation blogger outfit styling" },
  { garment: "裙装", seasons: ["春", "夏", "秋"], line: "white ribbed tee, washed denim midi skirt, thin beige cardigan, canvas tote, relaxed weekend denim-skirt styling" },
  { garment: "短裤", seasons: ["夏"], line: "white shirt worn open, clean inner top, light denim Bermuda shorts, canvas tote, refined summer movement styling; shorts must stay visible and must not become long trousers" },
  { garment: "短裤", seasons: ["夏"], line: "charcoal knit tee, cream tailored shorts, black small shoulder bag, subtle optical glasses, grounded outfit-record styling; shorts must stay visible" },
  { garment: "短裤", seasons: ["夏"], line: "cream polo shirt, stone grey Bermuda shorts, woven tote, simple watch, clean weekend city styling; do not lengthen shorts into trousers" },
  { garment: "连衣裙", seasons: ["春", "夏"], line: "ivory shirt dress, soft beige shoulder bag, minimal jewelry, clean one-piece feminine styling with sneakers fully visible" },
  { garment: "连衣裙", seasons: ["夏"], line: "soft grey summer dress, light taupe handbag, restrained earrings, calm one-piece daily styling, sneakers clear and not hidden by hem" },
  { garment: "连衣裙", seasons: ["春", "夏"], line: "pale khaki sleeveless dress, cream tote, subtle gold earrings, fresh warm-weather one-piece styling, mature not sweet" },
  { garment: "轻运动", seasons: ["春", "夏"], line: "black clean-cut T-shirt, charcoal active shorts, no-logo gym tote, water bottle, calm premium light-active styling" },
  { garment: "轻运动", seasons: ["夏"], line: "pale grey short-sleeve tee, black active shorts, cream overshirt, clean gym tote, believable city-to-gym styling" },
  { garment: "轻运动", seasons: ["春", "夏", "秋"], line: "cream clean active top, taupe straight active trousers, soft zip layer, water bottle, refined light movement styling" },
  { garment: "裤装", seasons: ["秋", "冬"], line: "oatmeal lightweight knit, stone relaxed trousers, soft grey cardigan, thin belt, warm-neutral daily texture" },
  { garment: "裤装", seasons: ["秋", "冬"], line: "cream turtleneck knit, charcoal straight trousers, camel wool coat, structured tote, clean winter commuter styling" }
];

function shouldUseRotatingOutfitLine(imageType: TeamImageType) {
  return imageType === "产品上脚图" || imageType === "对镜穿搭图" || imageType === "生活场景图";
}

export function getRotatingOutfitLine(params: TeamPromptParams) {
  if (!shouldUseRotatingOutfitLine(params.imageType)) return "";

  const garmentPool =
    params.garmentTypePreference === "自动匹配"
      ? rotatingOutfitKeywordOptions
      : rotatingOutfitKeywordOptions.filter((option) => option.garment === params.garmentTypePreference);
  const seasonPool = garmentPool.filter((option) => option.seasons.includes(params.season));
  const pool = seasonPool.length ? seasonPool : garmentPool.length ? garmentPool : rotatingOutfitKeywordOptions;
  const index = Math.abs(params.generationNonce) % pool.length;
  const selected = pool[index] ?? pool[0];

  return `Primary outfit line, use this clothing direction for the image. Outfit variation ${index + 1}/${pool.length}: Outfit keywords: ${selected.line}. Keep this outfit category fixed and keep the sneakers fully visible, with hems physically separate from the shoes.`;
}

export function applyRotatingOutfitLine(prompt: string, params: TeamPromptParams) {
  const outfitLine = getRotatingOutfitLine(params);
  return outfitLine ? `${outfitLine}\n\n${prompt}` : prompt;
}
