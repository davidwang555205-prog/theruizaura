import type { TeamGarmentTypePreference, TeamPromptParams, TeamSeason } from "../types";

type RotatingOutfitKeywordOption = {
  garment: Exclude<TeamGarmentTypePreference, "自动匹配">;
  seasons: TeamSeason[];
  keywords: string;
};

const quietStatusBoundary =
  "No visible status branding, no showy accessories, no staged status mood, no status-display posing, keep daily, quiet, mature, and believable.";

const rotatingOutfitKeywordOptions: RotatingOutfitKeywordOption[] = [
  {
    garment: "裤装",
    seasons: ["春", "夏"],
    keywords:
      "white cotton shirt, light blue straight denim, soft beige trench or linen overshirt, cream tote, clean city outfit proportions, sneakers clearly visible."
  },
  {
    garment: "裤装",
    seasons: ["春", "秋"],
    keywords:
      "oatmeal fine-knit top, warm beige tailored trousers, structured taupe tote, simple watch, refined commute styling with clear trouser-and-sneaker relationship."
  },
  {
    garment: "裤装",
    seasons: ["秋", "冬"],
    keywords:
      "warm ivory knitwear, dark straight denim, soft camel coat, muted brown shoulder bag, mature daily layering with sneakers readable below the hem."
  },
  {
    garment: "裤装",
    seasons: ["夏"],
    keywords:
      "cream linen shirt, pale khaki wide-leg trousers, light canvas tote, breathable summer styling, relaxed but polished and not sporty."
  },
  {
    garment: "裙装",
    seasons: ["春", "夏"],
    keywords:
      "ivory short-sleeve knit, soft grey midi skirt, light taupe handbag, understated accessories, feminine daily styling with sneakers clearly visible."
  },
  {
    garment: "裙装",
    seasons: ["秋", "冬"],
    keywords:
      "oatmeal knit top, warm beige straight skirt, cream cardigan jacket, muted brown handbag, calm seasonal femininity with clear sneaker styling."
  },
  {
    garment: "短裤",
    seasons: ["春", "夏"],
    keywords:
      "soft beige Bermuda shorts, ivory cotton shirt, thin knit layer over the shoulders, small leather crossbody, mature city weekend styling with sneakers fully readable."
  },
  {
    garment: "短裤",
    seasons: ["夏"],
    keywords:
      "stone grey tailored shorts, off-white boxy shirt, restrained woven bag, clean warm-weather city styling, adult and polished rather than overly youthful."
  },
  {
    garment: "连衣裙",
    seasons: ["春", "夏"],
    keywords:
      "cream shirt dress, thin leather belt, soft beige shoulder bag, minimal jewelry, relaxed feminine one-piece styling with sneakers fully visible."
  },
  {
    garment: "连衣裙",
    seasons: ["秋", "冬"],
    keywords:
      "warm grey knit dress, cream wool-blend cardigan, taupe handbag, quiet seasonal layering, refined but practical with sneakers clearly present."
  },
  {
    garment: "轻运动",
    seasons: ["春", "夏", "秋"],
    keywords:
      "cream ribbed active top, warm grey wide-leg active trousers, soft beige zip layer, unbranded gym tote, clean gym-transition styling, refined rather than sporty."
  },
  {
    garment: "轻运动",
    seasons: ["冬"],
    keywords:
      "oatmeal knit layer, warm grey active trousers, cream lightweight padded jacket, muted tote, calm winter gym-transition styling with sneakers readable."
  },

  // Premium Wardrobe options
  {
    garment: "裤装",
    seasons: ["春", "秋", "冬"],
    keywords:
      `ivory silk blouse, warm grey wool-blend straight trousers, soft cashmere cardigan, structured taupe leather tote, minimal leather belt, quiet luxury commuter styling. ${quietStatusBoundary}`
  },
  {
    garment: "裤装",
    seasons: ["秋", "冬"],
    keywords:
      `cream fine-gauge knit top, charcoal tailored trousers, camel double-face wool coat, slim leather belt, matte gold earrings, refined office-to-city styling. ${quietStatusBoundary}`
  },
  {
    garment: "裤装",
    seasons: ["春", "秋"],
    keywords:
      `white cotton-poplin shirt, oatmeal pleated wool trousers, soft beige cashmere scarf, structured brown leather handbag, understated premium wardrobe styling. ${quietStatusBoundary}`
  },
  {
    garment: "裤装",
    seasons: ["秋", "冬"],
    keywords:
      `soft oatmeal cashmere sweater, cream relaxed trousers, suede shoulder bag, thin gold jewelry, quiet weekend luxury styling, relaxed but not sloppy. ${quietStatusBoundary}`
  },
  {
    garment: "裤装",
    seasons: ["春", "夏"],
    keywords:
      `washed silk shirt, pale stone wide-leg trousers with sneakers still visible, soft leather tote, clean low-saturation city-walk styling. ${quietStatusBoundary}`
  },
  {
    garment: "裤装",
    seasons: ["夏"],
    keywords:
      `ivory ribbed knit tank, light beige linen-blend trousers, relaxed cashmere cardigan carried or loosely worn, woven leather bag, refined warm-weather luxury styling. ${quietStatusBoundary}`
  },
  {
    garment: "裙装",
    seasons: ["春", "秋"],
    keywords:
      `cream silk blouse, soft grey pleated midi skirt, taupe leather handbag, minimal pearl earrings, refined feminine quiet luxury styling, sneakers clearly visible below the hem. ${quietStatusBoundary}`
  },
  {
    garment: "裙装",
    seasons: ["春", "夏"],
    keywords:
      `ivory cashmere short-sleeve knit, champagne satin midi skirt, structured mini leather bag, calm elegant daily styling, avoid overly formal evening mood. ${quietStatusBoundary}`
  },
  {
    garment: "裙装",
    seasons: ["春", "夏"],
    keywords:
      `white fine cotton shirt, pale blue silk-blend A-line skirt, thin beige cardigan, understated feminine wardrobe styling, natural city-day feeling. ${quietStatusBoundary}`
  },
  {
    garment: "连衣裙",
    seasons: ["春", "夏"],
    keywords:
      `ivory silk shirt dress, thin leather belt, soft beige shoulder bag, minimal jewelry, refined one-piece luxury styling with sneakers fully visible. ${quietStatusBoundary}`
  },
  {
    garment: "连衣裙",
    seasons: ["秋", "冬"],
    keywords:
      `stone grey sleeveless wool-blend dress, cream cashmere cardigan, structured taupe handbag, quiet polished daily styling, warm and mature. ${quietStatusBoundary}`
  },
  {
    garment: "轻运动",
    seasons: ["春", "夏", "秋"],
    keywords:
      `cream ribbed active tank, warm grey wide-leg lounge trousers, soft beige zip layer, unbranded leather gym tote, quiet premium gym-transition styling, clean and refined rather than sporty. ${quietStatusBoundary}`
  }
];

function shouldUseRotatingOutfitLine(params: TeamPromptParams) {
  if (
    params.imageType !== "产品上脚图" &&
    params.imageType !== "对镜穿搭图" &&
    params.imageType !== "生活场景图"
  ) {
    return false;
  }

  if (params.scenePreference === "健身房内") {
    return false;
  }

  return true;
}

function selectByGenerationNonce<T>(pool: T[], generationNonce: number) {
  if (!pool.length) return null;
  const safeNonce = Number.isFinite(generationNonce) ? generationNonce : 0;
  return pool[Math.abs(safeNonce) % pool.length] ?? pool[0];
}

export function getRotatingOutfitLine(params: TeamPromptParams) {
  if (!shouldUseRotatingOutfitLine(params)) return "";

  const garmentPool =
    params.garmentTypePreference === "自动匹配"
      ? rotatingOutfitKeywordOptions
      : rotatingOutfitKeywordOptions.filter((option) => option.garment === params.garmentTypePreference);

  const seasonPool = garmentPool.filter((option) => option.seasons.includes(params.season));
  const pool = seasonPool.length ? seasonPool : garmentPool.length ? garmentPool : rotatingOutfitKeywordOptions;
  const selected = selectByGenerationNonce(pool, params.generationNonce);

  if (!selected) return "";

  const index = pool.indexOf(selected);
  return `Primary outfit line, use this clothing direction for the image. Outfit variation ${index + 1}/${pool.length}: Outfit keywords: ${selected.keywords}`;
}

export function applyRotatingOutfitLine(prompt: string, params: TeamPromptParams) {
  const outfitLine = getRotatingOutfitLine(params);
  return outfitLine ? `${outfitLine}\n\n${prompt}` : prompt;
}
