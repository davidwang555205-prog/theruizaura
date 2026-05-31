import type { TeamImageType, TeamScenePreference, TeamSeason, TeamShoe } from "../types";
import type { SceneLocationType, TimeOfDay } from "./timeOfDay";

type AccessoryId =
  | "hermesBag"
  | "goyardBag"
  | "lvBag"
  | "chanelBag"
  | "celineBag"
  | "theRowBag"
  | "celineSunglasses"
  | "chanelSunglasses"
  | "gentleMonsterSunglasses"
  | "minimalOpticalGlasses"
  | "simpleNoLogoBag";

type LuxuryAccessoryInput = {
  imageType: TeamImageType;
  shoe: TeamShoe;
  season: TeamSeason;
  scenePreference: TeamScenePreference;
  selectedOutfitLine: string;
  userExtraRequirement?: string;
  sceneLocationType: SceneLocationType;
  selectedTimeOfDay: TimeOfDay;
};

export const luxuryAccessoryBoundaryCompact =
  "Luxury accessories should elevate the outfit quietly, not dominate the image. Use luxury-inspired bags or eyewear as subtle styling references, without clear logos, counterfeit-looking details, flashy branding, or show-off energy. The sneakers and overall THERUIZ AURA mood must remain the focus.";

export const luxuryAccessoryNegative =
  "Avoid visible luxury logo focus, counterfeit-looking bag details, fake monogram, loud logo display, luxury showing-off, socialite styling, over-accessorized look, bag becoming the main subject, eyewear dominating the face, and any accessory styling that distracts from the sneakers or THERUIZ AURA’s quiet refined mood.";

export const luxuryAccessoryPool = {
  bags: {
    hermesBag:
      "Add an understated Hermès-style structured leather bag in taupe, warm brown, cream, or muted camel, without visible logo, to lift the outfit quietly without overpowering the sneakers.",
    goyardBag:
      "Add a refined Goyard-style canvas tote in a muted neutral tone, used as a practical daily luxury accent, without making the logo or pattern too dominant.",
    lvBag:
      "Add a muted LV-style warm brown daily bag or travel tote as a subtle city-luxury accessory, avoiding loud monogram focus or flashy logo display.",
    chanelBag:
      "Add a small Chanel-style quilted shoulder bag in black, cream, or soft grey, keeping it elegant and understated without clear logo emphasis.",
    celineBag:
      "Add a Celine-style minimalist leather shoulder bag or slim crossbody in black, tan, cream, or taupe, keeping the outfit clean, intellectual, and understated.",
    theRowBag:
      "Add a The Row-style no-logo soft leather tote or shoulder bag in cream, taupe, warm brown, or black, keeping the look quiet, expensive, and effortless.",
    simpleNoLogoBag:
      "Add a simple no-logo leather tote or shoulder bag in cream, taupe, or warm brown, keeping the accessory practical, quiet, and clearly secondary."
  },
  sunglasses: {
    celineSunglasses:
      "Add Celine-style black or tortoise rectangular sunglasses for a refined urban touch, avoiding celebrity-like posing or oversized influencer styling.",
    chanelSunglasses:
      "Add Chanel-style elegant black sunglasses as a polished feminine accent, without making the look too glamorous or logo-focused.",
    gentleMonsterSunglasses:
      "Add Gentle Monster-style modern sunglasses with a clean sculptural frame, keeping the mood urban and restrained rather than futuristic or trendy."
  },
  opticalGlasses: {
    minimalOpticalGlasses:
      "Add minimal optical glasses with a thin metal, soft brown acetate, or light tortoise frame for an intellectual and daily refined feeling."
  },
  accessoryMood:
    "quiet wealth, practical daily luxury, refined mature taste, no-logo restraint, and believable outfit-reference value",
  forbidden:
    "Avoid clear logos, counterfeit-looking details, logo stacking, socialite styling, loud monogram focus, heavy glamor, and accessories becoming the subject.",
  compactAccessoryLines: [
    "Add an understated Hermès-style structured leather bag in taupe, warm brown, cream, or muted camel, without visible logo, to lift the outfit quietly without overpowering the sneakers.",
    "Add a refined Goyard-style canvas tote in a muted neutral tone, used as a practical daily luxury accent, without making the logo or pattern too dominant.",
    "Add a muted LV-style warm brown daily bag or travel tote as a subtle city-luxury accessory, avoiding loud monogram focus or flashy logo display.",
    "Add a small Chanel-style quilted shoulder bag in black, cream, or soft grey, keeping it elegant and understated without clear logo emphasis.",
    "Add a Celine-style minimalist leather shoulder bag or slim crossbody in black, tan, cream, or taupe, keeping the outfit clean, intellectual, and understated.",
    "Add a The Row-style no-logo soft leather tote or shoulder bag in cream, taupe, warm brown, or black, keeping the look quiet, expensive, and effortless.",
    "Add Celine-style black or tortoise rectangular sunglasses for a refined urban touch, avoiding celebrity-like posing or oversized influencer styling.",
    "Add Chanel-style elegant black sunglasses as a polished feminine accent, without making the look too glamorous or logo-focused.",
    "Add Gentle Monster-style modern sunglasses with a clean sculptural frame, keeping the mood urban and restrained rather than futuristic or trendy.",
    "Add minimal optical glasses with a thin metal, soft brown acetate, or light tortoise frame for an intellectual and daily refined feeling."
  ]
};

const ACCESSORY_LINES: Record<AccessoryId, string> = {
  ...luxuryAccessoryPool.bags,
  ...luxuryAccessoryPool.sunglasses,
  ...luxuryAccessoryPool.opticalGlasses
};

const BAG_IDS: AccessoryId[] = [
  "hermesBag",
  "goyardBag",
  "lvBag",
  "chanelBag",
  "celineBag",
  "theRowBag",
  "simpleNoLogoBag"
];

const EYEWEAR_IDS: AccessoryId[] = [
  "celineSunglasses",
  "chanelSunglasses",
  "gentleMonsterSunglasses",
  "minimalOpticalGlasses"
];

const SUNGLASSES_IDS: AccessoryId[] = ["celineSunglasses", "chanelSunglasses", "gentleMonsterSunglasses"];

const SCENE_ACCESSORIES: Partial<Record<TeamScenePreference | "对镜穿搭", AccessoryId[]>> = {
  通勤上班: ["hermesBag", "celineBag", "theRowBag", "minimalOpticalGlasses"],
  "精品超市 / 日常采购": ["goyardBag", "hermesBag", "theRowBag"],
  旅行酒店: ["goyardBag", "lvBag", "theRowBag"],
  对镜穿搭: ["chanelBag", "celineBag", "theRowBag", "celineSunglasses", "minimalOpticalGlasses"],
  居家衣帽间: ["chanelBag", "celineBag", "theRowBag", "minimalOpticalGlasses"],
  周末城市散步: ["celineBag", "theRowBag", "chanelBag", "celineSunglasses"],
  周末轻采购: ["goyardBag", "theRowBag", "hermesBag"],
  玄关出门: ["theRowBag", "hermesBag", "celineBag"],
  窗边阅读: ["celineBag", "theRowBag", "minimalOpticalGlasses"]
};

const SHOE_ACCESSORIES: Record<TeamShoe, AccessoryId[]> = {
  "Cloud Dancer 云舞者": ["hermesBag", "celineBag", "theRowBag"],
  "Sand Dollar 沙钱白": ["hermesBag", "celineBag", "theRowBag"],
  "Delphinium Blue 飞燕草蓝": ["celineBag", "theRowBag", "minimalOpticalGlasses"],
  "Silver Romance 银色浪漫": ["chanelBag", "celineBag", "gentleMonsterSunglasses"],
  "Aire 微风": ["goyardBag", "theRowBag", "celineBag", "celineSunglasses"],
  "Cappuccino 卡布奇诺": ["hermesBag", "lvBag", "theRowBag"],
  "Lemon 柠檬": ["celineBag", "theRowBag", "hermesBag"],
  "Maple Grove 枫林": ["lvBag", "hermesBag", "theRowBag"],
  "Oreo 奥利奥": ["chanelBag", "celineBag", "theRowBag"],
  "Panda 熊猫": ["chanelBag", "celineBag", "theRowBag"],
  自定义: ["theRowBag", "celineBag", "hermesBag"]
};

const NO_BAG_KEYWORDS = ["不要包", "no bag"];
const NO_EYEWEAR_KEYWORDS = ["不要眼镜", "不要墨镜", "no sunglasses", "no eyewear", "no glasses"];
const NO_LUXURY_BAG_KEYWORDS = ["不要奢侈品包", "不要品牌包", "no luxury bag"];
const SUNGLASSES_KEYWORDS = ["加墨镜", "add sunglasses", "sunglasses", "墨镜"];
const NO_SUNGLASSES_KEYWORDS = ["不加墨镜", "不要墨镜", "no sunglasses"];
const OPTICAL_KEYWORDS = ["加光学眼镜", "add optical glasses", "optical glasses", "光学眼镜"];
const TOTE_KEYWORDS = ["加托特包", "add tote bag", "simple tote", "tote bag", "托特包"];

function textIncludesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

function isPeopleImageType(imageType: TeamImageType) {
  return imageType === "产品上脚图" || imageType === "对镜穿搭图" || imageType === "生活场景图";
}

function getSceneAccessoryCandidates(imageType: TeamImageType, scenePreference: TeamScenePreference) {
  const key = imageType === "对镜穿搭图" ? "对镜穿搭" : scenePreference;
  return SCENE_ACCESSORIES[key] ?? ["theRowBag", "celineBag", "hermesBag"];
}

function scoreAccessory(id: AccessoryId, input: LuxuryAccessoryInput) {
  const sceneCandidates = getSceneAccessoryCandidates(input.imageType, input.scenePreference);
  const shoeCandidates = SHOE_ACCESSORIES[input.shoe] ?? SHOE_ACCESSORIES["自定义"];
  const outfit = input.selectedOutfitLine.toLowerCase();
  let score = 0;

  if (sceneCandidates.includes(id)) score += 4;
  if (shoeCandidates.includes(id)) score += 3;
  if (input.season === "夏" && EYEWEAR_IDS.includes(id)) score += 1;
  if (input.selectedTimeOfDay === "evening" && BAG_IDS.includes(id)) score += 1;
  if (input.sceneLocationType === "indoor" && id === "minimalOpticalGlasses") score += 1;
  if (input.sceneLocationType !== "outdoor" && SUNGLASSES_IDS.includes(id)) score -= 8;
  if (input.selectedTimeOfDay === "evening" && SUNGLASSES_IDS.includes(id)) score -= 6;
  if (outfit.includes("tote") && (id === "theRowBag" || id === "goyardBag" || id === "hermesBag")) score += 1;
  if (outfit.includes("brown") && (id === "hermesBag" || id === "lvBag" || id === "theRowBag")) score += 1;
  if (outfit.includes("grey") && (id === "celineBag" || id === "chanelBag")) score += 1;

  return score;
}

export function chooseLuxuryAccessoryLine(input: LuxuryAccessoryInput) {
  if (!isPeopleImageType(input.imageType)) return "";

  const text = (input.userExtraRequirement ?? "").toLowerCase();
  const noBag = textIncludesAny(text, NO_BAG_KEYWORDS);
  const noEyewear = textIncludesAny(text, NO_EYEWEAR_KEYWORDS);
  const noSunglasses = textIncludesAny(text, NO_SUNGLASSES_KEYWORDS);
  const noLuxuryBag = textIncludesAny(text, NO_LUXURY_BAG_KEYWORDS);
  const wantsSunglasses = textIncludesAny(text, SUNGLASSES_KEYWORDS);
  const wantsOptical = textIncludesAny(text, OPTICAL_KEYWORDS);
  const wantsTote = textIncludesAny(text, TOTE_KEYWORDS);

  if (noBag && noEyewear) return "";
  if (noLuxuryBag && !noBag) return `${ACCESSORY_LINES.simpleNoLogoBag} ${luxuryAccessoryBoundaryCompact}`;
  if (wantsOptical && !noEyewear) {
    return `${ACCESSORY_LINES.minimalOpticalGlasses} ${luxuryAccessoryBoundaryCompact}`;
  }
  if (wantsSunglasses && !noEyewear && !noSunglasses) {
    if (input.sceneLocationType !== "outdoor") {
      return `Use minimal optical glasses instead of sunglasses to keep the indoor scene believable. ${luxuryAccessoryBoundaryCompact}`;
    }
    const sunglasses = input.shoe === "Silver Romance 银色浪漫" ? "gentleMonsterSunglasses" : "celineSunglasses";
    return `${ACCESSORY_LINES[sunglasses]} ${luxuryAccessoryBoundaryCompact}`;
  }
  if (wantsTote && !noBag) return `${ACCESSORY_LINES.theRowBag} ${luxuryAccessoryBoundaryCompact}`;

  let candidates = getSceneAccessoryCandidates(input.imageType, input.scenePreference);
  if (noBag) candidates = candidates.filter((id) => !BAG_IDS.includes(id));
  if (noEyewear) candidates = candidates.filter((id) => !EYEWEAR_IDS.includes(id));
  if (noSunglasses || input.sceneLocationType === "indoor") {
    candidates = candidates.filter((id) => !SUNGLASSES_IDS.includes(id));
  }
  if (input.sceneLocationType === "semiIndoor") {
    candidates = candidates.filter((id) => !SUNGLASSES_IDS.includes(id));
  }
  if (input.selectedTimeOfDay === "evening" && !wantsSunglasses) {
    candidates = candidates.filter((id) => !SUNGLASSES_IDS.includes(id));
  }

  if (!candidates.length) return "";

  const scored = candidates.map((id) => ({ id, score: scoreAccessory(id, input) }));
  const bestScore = Math.max(...scored.map((item) => item.score));
  const best = scored.filter((item) => item.score === bestScore).map((item) => item.id);
  const selectedId = best[Math.floor(Math.random() * best.length)];

  if (SUNGLASSES_IDS.includes(selectedId) && input.sceneLocationType === "indoor") {
    return `${ACCESSORY_LINES.minimalOpticalGlasses} ${luxuryAccessoryBoundaryCompact}`;
  }

  return `${ACCESSORY_LINES[selectedId]} ${luxuryAccessoryBoundaryCompact}`;
}
