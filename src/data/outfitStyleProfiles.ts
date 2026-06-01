import type { TeamImageType, TeamScenePreference, TeamSeason, TeamShoe } from "../types";

export type OutfitStyleProfileId =
  | "cleanCommute"
  | "refinedWeekend"
  | "modernMomDaily"
  | "quietLuxuryCasual"
  | "lightFeminine"
  | "softDenimDaily"
  | "galleryIntellectual"
  | "travelLight"
  | "relaxedUrban"
  | "matureMinimal"
  | "elegantLightSocial"
  | "premiumErrands";

export type OutfitStyleProfile = {
  id: OutfitStyleProfileId;
  styleName: string;
  suitableScenes: string[];
  suitableShoes: TeamShoe[];
  seasonalFit: TeamSeason[];
  outfitDirection: string;
  accessoryDirection: string;
  compactStyleLine: string;
  compactSupplementLine: string;
  forbidden: string;
};

type OutfitStyleSelectionInput = {
  imageType: TeamImageType;
  shoe: TeamShoe;
  season: TeamSeason;
  scenePreference: TeamScenePreference;
  selectedOutfitLine: string;
  userExtraRequirement?: string;
};

export const productVersatilityCompact =
  "The sneakers should feel highly versatile and easy to style across different daily situations. They should naturally complete the outfit without stealing attention, making the whole look clean, composed, comfortable, and tasteful.";

export const outfitVersatilityNegative =
  "Avoid styling that makes the sneakers look limited to only one scene, overly sporty, too casual, too dressy, too trendy, too girlish, too streetwear, or disconnected from the outfit. Avoid any outfit that makes the sneakers feel hard to wear in real daily life.";

export const outfitStyleProfiles: OutfitStyleProfile[] = [
  {
    id: "cleanCommute",
    styleName: "Clean Commute",
    suitableScenes: ["通勤上班", "商场中庭", "连廊", "旅行酒店", "城市街角", "对镜穿搭图"],
    suitableShoes: [
      "Cloud Dancer 云舞者",
      "Sand Dollar 沙钱白",
      "Silver Romance 银色浪漫",
      "Oreo 奥利奥",
      "Panda 熊猫",
      "Delphinium Blue 飞燕草蓝"
    ],
    seasonalFit: ["春", "夏", "秋", "冬"],
    outfitDirection: "white shirts, light tailored trousers, soft blazers, trench coats, clean totes, and low-saturation leather bags",
    accessoryDirection: "refined tote or low-saturation leather bag, with no logo focus",
    compactStyleLine:
      "Use a clean commute styling direction with a white or cream shirt, tailored trousers, soft blazer or trench coat, and a refined tote, showing that the sneakers can look polished enough for work without feeling stiff.",
    compactSupplementLine:
      "Keep the styling in a clean commute mood, showing that the sneakers can look polished enough for work without feeling stiff.",
    forbidden:
      "Avoid stiff office uniform, corporate suit stiffness, black formal leather shoes feeling, harsh business look, or overly serious executive styling."
  },
  {
    id: "refinedWeekend",
    styleName: "Refined Weekend",
    suitableScenes: ["周末城市散步", "咖啡店外", "面包店", "甜品店", "买花", "花店", "书店", "杂志店"],
    suitableShoes: [
      "Cloud Dancer 云舞者",
      "Sand Dollar 沙钱白",
      "Aire 微风",
      "Delphinium Blue 飞燕草蓝",
      "Lemon 柠檬",
      "Cappuccino 卡布奇诺"
    ],
    seasonalFit: ["春", "夏", "秋"],
    outfitDirection: "soft knitwear, pale denim, linen trousers, relaxed shirts, totes, small bags, and calm low-saturation colors",
    accessoryDirection: "simple tote or quiet shoulder bag",
    compactStyleLine:
      "Use a refined weekend styling direction with soft knitwear, relaxed denim or light trousers, a simple tote or shoulder bag, and a calm low-saturation palette, showing the sneakers as an easy but tasteful weekend choice.",
    compactSupplementLine:
      "Keep the styling in a refined weekend mood, making the sneakers feel easy, tasteful, and relaxed without becoming casual homewear.",
    forbidden:
      "Avoid lazy homewear, sporty tracksuit, overly sweet picnic styling, influencer brunch look, or vacation costume feeling."
  },
  {
    id: "modernMomDaily",
    styleName: "Modern Mom Daily",
    suitableScenes: ["精品超市 / 日常采购", "周末轻采购", "玄关出门", "朋友小聚", "生活场景图"],
    suitableShoes: [
      "Cloud Dancer 云舞者",
      "Sand Dollar 沙钱白",
      "Cappuccino 卡布奇诺",
      "Aire 微风",
      "Maple Grove 枫林",
      "Panda 熊猫"
    ],
    seasonalFit: ["春", "夏", "秋", "冬"],
    outfitDirection: "comfortable trousers, light outerwear, knitwear, practical totes, larger daily bags, clean and useful styling",
    accessoryDirection: "practical tote or larger daily bag, never messy or logo-heavy",
    compactStyleLine:
      "Use a refined mom daily styling direction with comfortable trousers, soft knitwear or shirt layers, a practical tote, and clean neutral colors, showing that the sneakers keep her comfortable, composed, and tasteful through errands and family movement.",
    compactSupplementLine:
      "Keep the styling in a refined mom daily mood, practical and comfortable while still clean, composed, and tasteful.",
    forbidden:
      "Avoid messy mom look, over-casual homewear, sportswear, childish styling, or overly staged family advertising."
  },
  {
    id: "quietLuxuryCasual",
    styleName: "Quiet Luxury Casual",
    suitableScenes: ["逛街", "精品店", "旅行酒店", "城市街角", "咖啡店外", "对镜穿搭图"],
    suitableShoes: [
      "Cloud Dancer 云舞者",
      "Sand Dollar 沙钱白",
      "Cappuccino 卡布奇诺",
      "Maple Grove 枫林",
      "Oreo 奥利奥",
      "Panda 熊猫"
    ],
    seasonalFit: ["春", "秋", "冬"],
    outfitDirection: "no-logo leather accessories, wool or cashmere-feeling knitwear, cream, oatmeal, coffee, grey-beige, relaxed high-end styling",
    accessoryDirection: "no-logo leather bag or quiet shoulder bag",
    compactStyleLine:
      "Use a quiet luxury casual styling direction with no-logo leather accessories, fine knitwear, relaxed tailored trousers, and cream, oatmeal, taupe, or warm grey tones, showing the sneakers as a natural part of an understated high-end daily wardrobe.",
    compactSupplementLine:
      "Keep the styling in a quiet luxury casual mood, understated and high-end without logo display or artificial luxury staging.",
    forbidden:
      "Avoid obvious luxury showing-off, logo-heavy styling, socialite look, overly polished rich-wife styling, or artificial luxury staging."
  },
  {
    id: "lightFeminine",
    styleName: "Light Feminine",
    suitableScenes: ["买花", "花店", "面包店", "甜品店", "咖啡店外", "周末城市散步", "对镜穿搭图"],
    suitableShoes: [
      "Sand Dollar 沙钱白",
      "Cloud Dancer 云舞者",
      "Delphinium Blue 飞燕草蓝",
      "Lemon 柠檬",
      "Silver Romance 银色浪漫"
    ],
    seasonalFit: ["春", "夏"],
    outfitDirection: "cream skirts, shirt dresses, pale knitwear, light dresses, fine accessories, and small bags without sweetness",
    accessoryDirection: "small understated bag and fine jewelry",
    compactStyleLine:
      "Use a light feminine styling direction with a cream skirt, soft blouse, shirt dress, or fine knitwear, keeping the mood gentle, clean, and mature while showing the sneakers can soften and modernize feminine outfits.",
    compactSupplementLine:
      "Keep the styling lightly feminine, gentle, clean, and mature, showing that the sneakers can soften and modernize feminine outfits.",
    forbidden:
      "Avoid sweet girl styling, lace overload, floral overload, princess dress feeling, overly romantic mood, or childish femininity."
  },
  {
    id: "softDenimDaily",
    styleName: "Soft Denim Daily",
    suitableScenes: ["周末城市散步", "咖啡店外", "书店", "杂志店", "城市街角", "产品上脚图"],
    suitableShoes: [
      "Cloud Dancer 云舞者",
      "Sand Dollar 沙钱白",
      "Delphinium Blue 飞燕草蓝",
      "Aire 微风",
      "Lemon 柠檬",
      "Oreo 奥利奥",
      "Panda 熊猫"
    ],
    seasonalFit: ["春", "夏", "秋"],
    outfitDirection: "light blue straight-leg denim, white shirts, knit cardigans, T-shirts, and light jackets",
    accessoryDirection: "understated daily accessories, no streetwear styling",
    compactStyleLine:
      "Use a soft denim daily styling direction with straight-leg denim, a white or cream top, light knitwear or shirt layers, and understated accessories, showing the sneakers as an effortless match with everyday denim.",
    compactSupplementLine:
      "Keep the styling in a soft denim daily mood, showing the sneakers as an effortless match with everyday denim.",
    forbidden:
      "Avoid street denim styling, ripped jeans, oversized streetwear, teenage casual look, or sporty sneaker energy."
  },
  {
    id: "galleryIntellectual",
    styleName: "Gallery Intellectual",
    suitableScenes: ["展览", "画廊", "书店", "杂志店", "咖啡店外", "城市街角", "对镜穿搭图"],
    suitableShoes: [
      "Cloud Dancer 云舞者",
      "Sand Dollar 沙钱白",
      "Silver Romance 银色浪漫",
      "Delphinium Blue 飞燕草蓝",
      "Oreo 奥利奥",
      "Panda 熊猫"
    ],
    seasonalFit: ["春", "秋", "冬"],
    outfitDirection: "minimal shirts, grey trousers, knitwear, optical glasses, Celine-style bags, and small black-white-grey areas",
    accessoryDirection: "minimal optical glasses and restrained leather accessories",
    compactStyleLine:
      "Use a gallery-intellectual styling direction with a clean shirt, soft tailored trousers, minimal optical glasses, and restrained leather accessories, showing the sneakers can fit cultured, quiet, and thoughtful daily settings.",
    compactSupplementLine:
      "Keep the styling gallery-intellectual, cultured, quiet, and thoughtful without becoming cold or costume-like.",
    forbidden:
      "Avoid academic costume, dramatic art-student look, heavy black styling, overly conceptual fashion, or cold intellectual distance."
  },
  {
    id: "travelLight",
    styleName: "Travel Light",
    suitableScenes: ["旅行酒店", "商场中庭", "连廊", "城市街角", "周末城市散步", "对镜穿搭图"],
    suitableShoes: [
      "Aire 微风",
      "Cloud Dancer 云舞者",
      "Sand Dollar 沙钱白",
      "Cappuccino 卡布奇诺",
      "Oreo 奥利奥",
      "Panda 熊猫"
    ],
    seasonalFit: ["春", "夏", "秋"],
    outfitDirection: "light jackets, linen trousers, totes, travel bags, knit shawls, comfortable but presentable styling",
    accessoryDirection: "practical refined tote or travel bag",
    compactStyleLine:
      "Use a travel-light styling direction with breathable trousers, soft layers, a practical refined tote, and clean neutral colors, showing the sneakers as comfortable enough for movement while still looking polished in travel moments.",
    compactSupplementLine:
      "Keep the styling travel-light, comfortable enough for movement while still polished and organized.",
    forbidden:
      "Avoid tourist outfit, airport sweatpants, sporty travel gear, bulky backpack look, or vacation resort styling."
  },
  {
    id: "relaxedUrban",
    styleName: "Relaxed Urban",
    suitableScenes: ["城市街角", "咖啡店外", "逛街", "精品店", "周末城市散步", "朋友小聚"],
    suitableShoes: [
      "Cloud Dancer 云舞者",
      "Sand Dollar 沙钱白",
      "Silver Romance 银色浪漫",
      "Oreo 奥利奥",
      "Panda 熊猫",
      "Maple Grove 枫林"
    ],
    seasonalFit: ["春", "夏", "秋"],
    outfitDirection: "structured relaxed trousers, short outerwear, knitwear, soft leather bags, and natural walking posture",
    accessoryDirection: "refined shoulder bag or soft leather daily bag",
    compactStyleLine:
      "Use a relaxed urban styling direction with structured relaxed trousers, soft outerwear, clean knitwear, and a refined shoulder bag, showing the sneakers as easy to wear through the city without looking careless.",
    compactSupplementLine:
      "Keep the styling relaxed urban, easy to wear through the city without looking careless or streetwear-driven.",
    forbidden:
      "Avoid streetwear, oversized hoodie styling, skate sneaker energy, nightclub mood, or aggressive urban fashion."
  },
  {
    id: "matureMinimal",
    styleName: "Mature Minimal",
    suitableScenes: ["通勤上班", "对镜穿搭图", "旅行酒店", "展览", "画廊", "逛街", "精品店", "居家衣帽间"],
    suitableShoes: [
      "Cloud Dancer 云舞者",
      "Sand Dollar 沙钱白",
      "Cappuccino 卡布奇诺",
      "Maple Grove 枫林",
      "Oreo 奥利奥",
      "Panda 熊猫",
      "Silver Romance 银色浪漫"
    ],
    seasonalFit: ["春", "秋", "冬"],
    outfitDirection: "low-saturation layers, mostly trousers, no-logo bags, clean lines, and a 35-55 refined customer mood",
    accessoryDirection: "no-logo leather accessories and restrained jewelry",
    compactStyleLine:
      "Use a mature minimal styling direction with low-saturation layers, clean trousers, no-logo leather accessories, and a calm composed silhouette, showing the sneakers can support a refined 35–55 daily wardrobe.",
    compactSupplementLine:
      "Keep the styling mature minimal, low-saturation, composed, and suitable for a refined 35–55 daily wardrobe.",
    forbidden:
      "Avoid old-fashioned mature styling, shapeless basics, harsh minimalism, overly plain outfit, or cold corporate look."
  },
  {
    id: "elegantLightSocial",
    styleName: "Elegant Light Social",
    suitableScenes: ["朋友小聚", "咖啡店外", "轻打卡店铺", "逛街", "精品店", "面包店", "甜品店"],
    suitableShoes: [
      "Silver Romance 银色浪漫",
      "Cloud Dancer 云舞者",
      "Sand Dollar 沙钱白",
      "Lemon 柠檬",
      "Cappuccino 卡布奇诺",
      "Oreo 奥利奥"
    ],
    seasonalFit: ["春", "夏", "秋"],
    outfitDirection: "soft refined knitwear, skirts or clean trousers, small understated shoulder bags, subtle jewelry",
    accessoryDirection: "small understated shoulder bag and subtle jewelry",
    compactStyleLine:
      "Use an elegant light-social styling direction with refined knitwear, a soft skirt or clean trousers, a small understated shoulder bag, and subtle jewelry, showing the sneakers can make light social outfits feel modern and comfortable.",
    compactSupplementLine:
      "Keep the styling elegant for light social moments, modern and comfortable without party mood or socialite posing.",
    forbidden:
      "Avoid socialite styling, party look, strong makeup, high heels mood, over-accessorized outfit, or obvious luxury posing."
  },
  {
    id: "premiumErrands",
    styleName: "Premium Errands",
    suitableScenes: ["精品超市 / 日常采购", "周末轻采购", "买花", "花店", "面包店", "甜品店", "玄关出门"],
    suitableShoes: [
      "Cloud Dancer 云舞者",
      "Sand Dollar 沙钱白",
      "Aire 微风",
      "Cappuccino 卡布奇诺",
      "Lemon 柠檬",
      "Maple Grove 枫林"
    ],
    seasonalFit: ["春", "夏", "秋", "冬"],
    outfitDirection: "totes, clean trousers, shirts or knitwear, comfortable but not careless styling",
    accessoryDirection: "practical tote and warm neutral daily objects",
    compactStyleLine:
      "Use a premium errands styling direction with clean trousers, soft shirt or knit layers, a practical tote, and warm neutral colors, showing the sneakers can handle real daily movement while keeping her composed and tasteful.",
    compactSupplementLine:
      "Keep the styling premium errands focused, comfortable for real daily movement while still composed and tasteful.",
    forbidden:
      "Avoid grocery casual mess, sportswear, pajama feeling, over-styled shopping content, or fake lifestyle staging."
  }
];

const SCENE_PROFILE_PRIORITIES: Partial<Record<TeamScenePreference, OutfitStyleProfileId[]>> = {
  通勤上班: ["cleanCommute", "matureMinimal", "quietLuxuryCasual"],
  周末城市散步: ["refinedWeekend", "softDenimDaily", "relaxedUrban"],
  "精品超市 / 日常采购": ["modernMomDaily", "premiumErrands", "refinedWeekend"],
  旅行酒店: ["travelLight", "quietLuxuryCasual", "matureMinimal"],
  居家衣帽间: ["matureMinimal", "cleanCommute", "lightFeminine", "quietLuxuryCasual"],
  玄关出门: ["premiumErrands", "modernMomDaily", "cleanCommute"],
  窗边阅读: ["galleryIntellectual", "matureMinimal", "quietLuxuryCasual"],
  周末轻采购: ["premiumErrands", "modernMomDaily", "refinedWeekend"],
  材质工作台: ["galleryIntellectual", "matureMinimal"],
  拍摄花絮: ["matureMinimal", "galleryIntellectual"]
};

const SHOE_PROFILE_PRIORITIES: Record<TeamShoe, OutfitStyleProfileId[]> = {
  "Cloud Dancer 云舞者": ["cleanCommute", "refinedWeekend", "softDenimDaily", "matureMinimal", "premiumErrands"],
  "Sand Dollar 沙钱白": ["cleanCommute", "refinedWeekend", "softDenimDaily", "matureMinimal", "premiumErrands"],
  "Delphinium Blue 飞燕草蓝": ["refinedWeekend", "softDenimDaily", "galleryIntellectual", "lightFeminine"],
  "Silver Romance 银色浪漫": ["elegantLightSocial", "galleryIntellectual", "cleanCommute", "relaxedUrban"],
  "Aire 微风": ["travelLight", "refinedWeekend", "premiumErrands", "softDenimDaily"],
  "Cappuccino 卡布奇诺": ["quietLuxuryCasual", "modernMomDaily", "matureMinimal", "premiumErrands"],
  "Lemon 柠檬": ["refinedWeekend", "lightFeminine", "softDenimDaily", "premiumErrands"],
  "Maple Grove 枫林": ["quietLuxuryCasual", "matureMinimal", "premiumErrands", "relaxedUrban"],
  "Oreo 奥利奥": ["matureMinimal", "cleanCommute", "relaxedUrban", "galleryIntellectual"],
  "Panda 熊猫": ["matureMinimal", "cleanCommute", "relaxedUrban", "galleryIntellectual"],
  自定义: ["matureMinimal", "cleanCommute", "refinedWeekend", "premiumErrands"]
};

const USER_STYLE_KEYWORDS: Array<{ id: OutfitStyleProfileId; keywords: string[] }> = [
  { id: "cleanCommute", keywords: ["通勤", "上班", "commute", "work", "office"] },
  { id: "refinedWeekend", keywords: ["周末", "休闲", "weekend", "casual"] },
  { id: "modernMomDaily", keywords: ["妈妈日常", "妈妈", "亲子", "mom daily", "mom", "family"] },
  { id: "quietLuxuryCasual", keywords: ["静奢", "quiet luxury", "luxury casual"] },
  { id: "lightFeminine", keywords: ["温柔", "女性", "裙", "优雅", "feminine", "soft", "elegant"] },
  { id: "softDenimDaily", keywords: ["牛仔", "denim", "jeans"] },
  { id: "galleryIntellectual", keywords: ["知性", "书店", "画廊", "gallery", "intellectual", "bookstore"] },
  { id: "travelLight", keywords: ["旅行", "出差", "travel", "hotel"] },
  { id: "relaxedUrban", keywords: ["城市", "松弛", "逛街", "shopping", "urban", "relaxed"] },
  { id: "matureMinimal", keywords: ["轻熟", "极简", "成熟", "minimal", "mature"] },
  { id: "elegantLightSocial", keywords: ["轻社交", "朋友小聚", "social", "light social"] },
  { id: "premiumErrands", keywords: ["采购", "买菜", "买花", "errands", "grocery", "flower"] }
];

const TEXT_CONFLICTS: Array<{ keywords: string[]; profileIds: OutfitStyleProfileId[] }> = [
  { keywords: ["不要裙子", "no skirt"], profileIds: ["lightFeminine", "elegantLightSocial"] },
  { keywords: ["不要太正式", "not too formal"], profileIds: ["cleanCommute", "matureMinimal"] },
  { keywords: ["不要太休闲", "not too casual"], profileIds: ["refinedWeekend", "relaxedUrban", "softDenimDaily"] },
  { keywords: ["不要包", "no bag"], profileIds: ["modernMomDaily", "premiumErrands"] },
  { keywords: ["不要眼镜", "不要墨镜", "no glasses", "no sunglasses"], profileIds: ["galleryIntellectual"] }
];

const versatilityLines = {
  anchor:
    "The sneakers should feel like the quiet anchor of the outfit, easy to pair with different wardrobes while keeping the whole look clean and composed.",
  multiScene:
    "The look should show that the sneakers can move naturally between work, weekend, errands, and light social moments without feeling too casual or overdressed.",
  easier:
    "The sneakers should make the outfit feel easier, more comfortable, and more modern, while still looking refined and tasteful.",
  onePair:
    "The styling should show the product’s one-pair-many-scenes versatility: polished enough for daily life, relaxed enough for movement, and clean enough for refined dressing.",
  complete:
    "The sneakers should not steal attention, but should make the outfit feel more complete, wearable, and quietly stylish."
};

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

function shouldUseOutfitStyle(imageType: TeamImageType) {
  return imageType === "产品上脚图" || imageType === "对镜穿搭图" || imageType === "生活场景图";
}

function getProfile(id: OutfitStyleProfileId) {
  return outfitStyleProfiles.find((profile) => profile.id === id) ?? outfitStyleProfiles[0];
}

function getUserPreferredProfileIds(extraRequirement = "") {
  const text = extraRequirement.toLowerCase();
  return USER_STYLE_KEYWORDS.filter((item) => includesAny(text, item.keywords)).map((item) => item.id);
}

function getConflictingProfileIds(extraRequirement = "") {
  const text = extraRequirement.toLowerCase();
  return new Set(
    TEXT_CONFLICTS.filter((item) => includesAny(text, item.keywords)).flatMap((item) => item.profileIds)
  );
}

function sanitizeStyleLine(line: string, extraRequirement = "") {
  const text = extraRequirement.toLowerCase();
  let output = line;

  if (includesAny(text, ["不要包", "no bag"])) {
    output = output
      .replace(/,? (a |an )?(simple |practical |refined |small |understated |no-logo |low-saturation |soft )?(tote|shoulder bag|leather bag|daily bag|travel bag)/gi, "")
      .replace(/,? (no-logo |restrained |understated )?leather accessories/gi, "")
      .replace(/,? and a refined tote/gi, "");
  }

  if (includesAny(text, ["不要眼镜", "不要墨镜", "no glasses", "no sunglasses"])) {
    output = output.replace(/,? minimal optical glasses,? and /gi, " ").replace(/minimal optical glasses,? /gi, "");
  }

  if (includesAny(text, ["不要裙子", "no skirt"])) {
    output = output
      .replace(/a cream skirt, /gi, "")
      .replace(/a soft skirt or clean trousers/gi, "clean trousers")
      .replace(/soft skirt or /gi, "");
  }

  return output.replace(/\s{2,}/g, " ").replace(/\s+,/g, ",").trim();
}

function scoreProfile(profile: OutfitStyleProfile, input: OutfitStyleSelectionInput, userPreferredIds: OutfitStyleProfileId[]) {
  let score = 0;
  const scenePriorities = SCENE_PROFILE_PRIORITIES[input.scenePreference] ?? [];
  const shoePriorities = SHOE_PROFILE_PRIORITIES[input.shoe] ?? SHOE_PROFILE_PRIORITIES["自定义"];

  if (userPreferredIds.includes(profile.id)) score += 100;
  const sceneIndex = scenePriorities.indexOf(profile.id);
  if (sceneIndex >= 0) score += 20 - sceneIndex * 3;
  const shoeIndex = shoePriorities.indexOf(profile.id);
  if (shoeIndex >= 0) score += 14 - shoeIndex * 2;
  if (profile.suitableScenes.includes(input.scenePreference)) score += 8;
  if (profile.suitableShoes.includes(input.shoe)) score += 6;
  if (profile.seasonalFit.includes(input.season)) score += 4;

  if (input.imageType === "对镜穿搭图" && profile.suitableScenes.includes("对镜穿搭图")) score += 8;
  if (input.imageType === "生活场景图" && profile.id === "modernMomDaily") score += 3;
  if (input.imageType === "产品上脚图" && profile.id === "softDenimDaily") score += 2;

  const outfit = input.selectedOutfitLine.toLowerCase();
  if (outfit.includes("denim") && profile.id === "softDenimDaily") score += 4;
  if ((outfit.includes("trousers") || outfit.includes("blazer") || outfit.includes("trench")) && profile.id === "cleanCommute") {
    score += 3;
  }
  if ((outfit.includes("knit") || outfit.includes("oatmeal") || outfit.includes("taupe")) && profile.id === "quietLuxuryCasual") {
    score += 3;
  }
  if ((outfit.includes("tote") || outfit.includes("errands")) && profile.id === "premiumErrands") score += 3;

  return score;
}

export function chooseOutfitStyleProfile(input: OutfitStyleSelectionInput) {
  if (!shouldUseOutfitStyle(input.imageType)) return "";

  const userPreferredIds = getUserPreferredProfileIds(input.userExtraRequirement);
  const conflicts = getConflictingProfileIds(input.userExtraRequirement);
  const candidates = outfitStyleProfiles.filter((profile) => !conflicts.has(profile.id));
  const pool = candidates.length ? candidates : outfitStyleProfiles;

  let bestScore = -Infinity;
  const scored = pool.map((profile) => {
    const score = scoreProfile(profile, input, userPreferredIds);
    if (score > bestScore) bestScore = score;
    return { profile, score };
  });

  const bestProfiles = scored.filter((item) => item.score === bestScore).map((item) => item.profile);
  const selected = bestProfiles[Math.floor(Math.random() * bestProfiles.length)];
  const baseLine = input.selectedOutfitLine ? selected.compactSupplementLine : selected.compactStyleLine;

  return sanitizeStyleLine(baseLine, input.userExtraRequirement);
}

export function chooseVersatilityLine(input: Pick<OutfitStyleSelectionInput, "imageType" | "scenePreference" | "userExtraRequirement">) {
  if (!shouldUseOutfitStyle(input.imageType)) return "";

  const text = (input.userExtraRequirement ?? "").toLowerCase();
  if (includesAny(text, ["百搭", "多场景", "versatile", "versatility", "one-pair-many-scenes"])) {
    return versatilityLines.onePair;
  }

  if (input.scenePreference === "通勤上班") return versatilityLines.multiScene;
  if (input.scenePreference === "精品超市 / 日常采购" || input.scenePreference === "周末轻采购") {
    return versatilityLines.easier;
  }
  if (input.scenePreference === "旅行酒店") return versatilityLines.onePair;
  if (input.imageType === "对镜穿搭图") return versatilityLines.anchor;
  if (input.scenePreference === "周末城市散步" || input.scenePreference === "居家衣帽间") {
    return versatilityLines.complete;
  }

  return versatilityLines.anchor;
}
