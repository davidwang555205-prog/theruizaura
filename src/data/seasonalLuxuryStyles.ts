import type { TeamImageType, TeamScenePreference, TeamSeason, TeamShoe } from "../types";

type SeasonalLuxuryStyleId =
  | "loroPianaQuietCashmere"
  | "chanelRefinedFeminine"
  | "chloeSoftEase"
  | "celineCityMinimal"
  | "theRowNoLogoRestraint";

type SeasonalLuxuryStyleProfile = {
  id: SeasonalLuxuryStyleId;
  styleName: string;
  referenceMood: string;
  suitableSeason: TeamSeason[];
  suitableScenes: string[];
  suitableShoes: TeamShoe[] | "all";
  outfitDirection: string;
  materialDirection: string;
  colorDirection: string;
  accessoryDirection: string;
  compactLuxuryStyleLine: string;
  forbidden: string;
};

type SeasonalLuxuryStyleInput = {
  imageType: TeamImageType;
  shoe: TeamShoe;
  season: TeamSeason;
  scenePreference: TeamScenePreference;
  selectedOutfitLine: string;
  selectedOutfitStyleLine: string;
  selectedAccessoryLine: string;
  userExtraRequirement?: string;
};

export const seasonalLuxuryInspirationCompact =
  "Add a subtle current-season luxury styling reference inspired by refined brands such as Loro Piana, CHANEL, Chloé, Celine, and The Row. Use the reference only for material quality, silhouette, color harmony, and styling maturity. Do not copy exact runway looks, show visible logos, or make the image look like a luxury advertisement.";

export const seasonalLuxuryNegative =
  "Avoid visible logos, exact runway copying, fake luxury styling, counterfeit-looking accessories, loud brand display, socialite posing, runway editorial exaggeration, over-polished luxury advertising, and any styling that makes the sneakers secondary to luxury items.";

export const seasonalLuxuryStyleProfiles: SeasonalLuxuryStyleProfile[] = [
  {
    id: "loroPianaQuietCashmere",
    styleName: "Loro Piana-inspired quiet cashmere",
    referenceMood: "quiet cashmere, warm restraint, tactile expensive calm",
    suitableSeason: ["秋", "冬", "春"],
    suitableScenes: ["通勤上班", "旅行酒店", "逛街 / 精品店", "城市街角", "对镜穿搭", "精品超市 / 日常采购"],
    suitableShoes: [
      "Cloud Dancer 云舞者",
      "Sand Dollar 沙钱白",
      "Cappuccino 卡布奇诺",
      "Maple Grove 枫林",
      "Oreo 奥利奥",
      "Panda 熊猫"
    ],
    outfitDirection: "cashmere-feeling knitwear, soft wool coats, relaxed tailored trousers",
    materialDirection: "cashmere, soft wool, suede, brushed cotton, soft leather",
    colorDirection: "oatmeal, cream white, camel, beige-grey, warm taupe",
    accessoryDirection: "no-logo leather bag, quiet warm neutral accessories",
    compactLuxuryStyleLine:
      "Use a Loro Piana-inspired quiet cashmere styling direction with oatmeal knitwear, soft wool layers, relaxed tailored trousers, no-logo leather accessories, and warm neutral tones, keeping the look expensive, calm, and effortless without visible branding.",
    forbidden:
      "Avoid old-money costume, heavy rich-wife styling, logo display, over-polished luxury advertising, oversized fur, or obvious wealth showing-off."
  },
  {
    id: "chanelRefinedFeminine",
    styleName: "refined feminine tailoring",
    referenceMood: "polished feminine, compact structure, light social elegance",
    suitableSeason: ["春", "秋", "冬"],
    suitableScenes: ["对镜穿搭", "咖啡店外", "逛街 / 精品店", "朋友小聚", "展览 / 画廊", "轻打卡店铺"],
    suitableShoes: [
      "Silver Romance 银色浪漫",
      "Cloud Dancer 云舞者",
      "Sand Dollar 沙钱白",
      "Oreo 奥利奥",
      "Panda 熊猫",
      "Lemon 柠檬"
    ],
    outfitDirection: "short structured jackets, fine knitwear, clean trousers or soft skirts",
    materialDirection: "fine knit, light wool, smooth cotton, soft structured fabric",
    colorDirection: "cream, black-white balance, soft grey, pale gold, warm neutral",
    accessoryDirection: "small understated shoulder bag, subtle pearl or metal jewelry without logos",
    compactLuxuryStyleLine:
      "Use a refined feminine tailoring styling direction with a short structured jacket, fine knitwear, clean trousers or a soft skirt, subtle jewelry, and a small understated shoulder bag, keeping the mood polished, feminine, and modern without visible logos or socialite energy.",
    forbidden:
      "Avoid obvious logo, fake Chanel look, heavy tweed costume, socialite styling, party mood, over-accessorized outfit, or high-heel-only elegance."
  },
  {
    id: "chloeSoftEase",
    styleName: "soft feminine ease",
    referenceMood: "soft feminine ease, relaxed flow, warm lightness",
    suitableSeason: ["春", "夏", "秋"],
    suitableScenes: ["买花 / 花店", "面包店 / 甜品店", "咖啡店外", "周末城市散步", "旅行酒店", "朋友小聚"],
    suitableShoes: [
      "Sand Dollar 沙钱白",
      "Cloud Dancer 云舞者",
      "Delphinium Blue 飞燕草蓝",
      "Lemon 柠檬",
      "Aire 微风",
      "Cappuccino 卡布奇诺"
    ],
    outfitDirection: "soft shirts, light knitwear, flowing skirts, linen trousers",
    materialDirection: "linen, cotton, light knit, washed denim, soft leather",
    colorDirection: "cream, pale yellow, light blue, warm beige, soft coffee",
    accessoryDirection: "small quiet bag or restrained woven texture, without resort styling",
    compactLuxuryStyleLine:
      "Use a soft feminine ease direction with flowing neutral layers, light knitwear, relaxed skirts or linen trousers, warm cream tones, and subtle feminine accessories, keeping the look gentle, free, and mature rather than sweet or bohemian.",
    forbidden:
      "Avoid festival boho, excessive ruffles, lace overload, overly youthful romance, vacation styling, oversized floral styling, or overly free-spirited costume feeling."
  },
  {
    id: "celineCityMinimal",
    styleName: "Celine-inspired city minimal",
    referenceMood: "French city minimal, intellectual, clean urban restraint",
    suitableSeason: ["春", "秋", "冬", "夏"],
    suitableScenes: ["通勤上班", "书店 / 杂志店", "展览 / 画廊", "城市街角", "对镜穿搭", "咖啡店外"],
    suitableShoes: [
      "Cloud Dancer 云舞者",
      "Sand Dollar 沙钱白",
      "Delphinium Blue 飞燕草蓝",
      "Silver Romance 银色浪漫",
      "Oreo 奥利奥",
      "Panda 熊猫"
    ],
    outfitDirection: "clean shirts, straight-leg trousers, light blazers, restrained city layers",
    materialDirection: "cotton shirting, fine knit, smooth wool, soft leather, denim",
    colorDirection: "black, cream, grey, taupe, beige, small low-contrast monochrome areas",
    accessoryDirection: "slim leather shoulder bag and minimal eyewear without logo focus",
    compactLuxuryStyleLine:
      "Use a Celine-inspired city minimal styling direction with a clean shirt, straight-leg trousers, a slim leather shoulder bag, minimal eyewear, and restrained black, cream, grey, or taupe tones, making the sneakers feel intellectual, urban, and easy to wear.",
    forbidden:
      "Avoid rock-chic styling, overly skinny silhouettes, harsh black-heavy looks, logo belts, nightclub mood, or cold fashion distance."
  },
  {
    id: "theRowNoLogoRestraint",
    styleName: "The Row-inspired no-logo restraint",
    referenceMood: "no-logo restraint, calm proportions, quiet expensive ease",
    suitableSeason: ["春", "夏", "秋", "冬"],
    suitableScenes: ["旅行酒店", "对镜穿搭", "通勤上班", "逛街 / 精品店", "城市街角", "精品超市 / 日常采购"],
    suitableShoes: "all",
    outfitDirection: "relaxed tailoring, structured loose trousers, long coats, easy shirts, low-saturation neutral layers",
    materialDirection: "soft leather, wool, cotton, linen, cashmere-feeling knit, brushed texture",
    colorDirection: "cream, oatmeal, warm grey, taupe, stone, muted brown",
    accessoryDirection: "no-logo soft leather bag, understated accessories, clean negative space",
    compactLuxuryStyleLine:
      "Use a The Row-inspired no-logo restrained styling direction with relaxed tailoring, soft leather accessories, quiet neutral layers, and clean proportions, keeping the outfit effortless, mature, and expensive without looking styled for attention.",
    forbidden:
      "Avoid shapeless basics, cold minimalism, extreme oversized silhouettes, fashion-editorial distance, or sterile luxury."
  }
];

const SEASON_PRIORITIES: Record<TeamSeason, SeasonalLuxuryStyleId[]> = {
  春: ["chloeSoftEase", "celineCityMinimal", "theRowNoLogoRestraint", "chanelRefinedFeminine"],
  夏: ["chloeSoftEase", "celineCityMinimal", "theRowNoLogoRestraint"],
  秋: ["loroPianaQuietCashmere", "theRowNoLogoRestraint", "celineCityMinimal", "chanelRefinedFeminine"],
  冬: ["loroPianaQuietCashmere", "theRowNoLogoRestraint", "chanelRefinedFeminine", "celineCityMinimal"]
};

const SCENE_PRIORITIES: Partial<Record<TeamScenePreference | "对镜穿搭", SeasonalLuxuryStyleId[]>> = {
  通勤上班: ["celineCityMinimal", "loroPianaQuietCashmere", "theRowNoLogoRestraint"],
  周末城市散步: ["chloeSoftEase", "theRowNoLogoRestraint", "celineCityMinimal"],
  "精品超市 / 日常采购": ["loroPianaQuietCashmere", "theRowNoLogoRestraint"],
  旅行酒店: ["loroPianaQuietCashmere", "theRowNoLogoRestraint", "celineCityMinimal"],
  对镜穿搭: ["chanelRefinedFeminine", "celineCityMinimal", "theRowNoLogoRestraint"],
  居家衣帽间: ["chanelRefinedFeminine", "celineCityMinimal", "theRowNoLogoRestraint"],
  窗边阅读: ["celineCityMinimal", "theRowNoLogoRestraint"],
  咖啡馆内: ["chloeSoftEase", "celineCityMinimal", "theRowNoLogoRestraint"],
  朋友午餐: ["chloeSoftEase", "chanelRefinedFeminine", "theRowNoLogoRestraint"],
  美术馆: ["celineCityMinimal", "theRowNoLogoRestraint", "chanelRefinedFeminine"],
  周末轻采购: ["loroPianaQuietCashmere", "theRowNoLogoRestraint", "chloeSoftEase"],
  玄关出门: ["theRowNoLogoRestraint", "loroPianaQuietCashmere", "celineCityMinimal"],
  去运动的路上: ["theRowNoLogoRestraint", "celineCityMinimal"]
};

const SHOE_PRIORITIES: Record<TeamShoe, SeasonalLuxuryStyleId[]> = {
  "Cloud Dancer 云舞者": ["theRowNoLogoRestraint", "celineCityMinimal", "chloeSoftEase", "loroPianaQuietCashmere"],
  "Sand Dollar 沙钱白": ["theRowNoLogoRestraint", "celineCityMinimal", "chloeSoftEase", "loroPianaQuietCashmere"],
  "Cappuccino 卡布奇诺": ["loroPianaQuietCashmere", "theRowNoLogoRestraint", "chloeSoftEase"],
  "Silver Romance 银色浪漫": ["chanelRefinedFeminine", "celineCityMinimal", "theRowNoLogoRestraint"],
  "Aire 微风": ["chloeSoftEase", "celineCityMinimal", "theRowNoLogoRestraint"],
  "Delphinium Blue 飞燕草蓝": ["chloeSoftEase", "celineCityMinimal"],
  "Lemon 柠檬": ["chloeSoftEase", "chanelRefinedFeminine"],
  "Maple Grove 枫林": ["loroPianaQuietCashmere", "theRowNoLogoRestraint"],
  "Oreo 奥利奥": ["celineCityMinimal", "chanelRefinedFeminine", "theRowNoLogoRestraint"],
  "Panda 熊猫": ["celineCityMinimal", "chanelRefinedFeminine", "theRowNoLogoRestraint"],
  自定义: ["theRowNoLogoRestraint", "celineCityMinimal", "loroPianaQuietCashmere"]
};

const USER_KEYWORDS: Array<{ id: SeasonalLuxuryStyleId; keywords: string[] }> = [
  { id: "loroPianaQuietCashmere", keywords: ["loro piana", "lp", "羊绒", "cashmere", "老钱风", "old money"] },
  { id: "chanelRefinedFeminine", keywords: ["chanel", "chanel-inspired", "小香", "香奈儿"] },
  { id: "chloeSoftEase", keywords: ["chloé", "chloe", "蔻依"] },
  { id: "celineCityMinimal", keywords: ["celine", "赛琳"] },
  { id: "theRowNoLogoRestraint", keywords: ["the row", "无标", "no-logo", "no logo", "不要logo", "不要 logo"] },
  { id: "theRowNoLogoRestraint", keywords: ["静奢", "quiet luxury", "高级感"] }
];

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

function shouldUseSeasonalLuxuryStyle(imageType: TeamImageType) {
  return imageType === "产品上脚图" || imageType === "对镜穿搭图" || imageType === "生活场景图";
}

function getProfile(id: SeasonalLuxuryStyleId) {
  return seasonalLuxuryStyleProfiles.find((profile) => profile.id === id) ?? seasonalLuxuryStyleProfiles[0];
}

function profileSupportsShoe(profile: SeasonalLuxuryStyleProfile, shoe: TeamShoe) {
  return profile.suitableShoes === "all" || profile.suitableShoes.includes(shoe);
}

function scorePriority(profileId: SeasonalLuxuryStyleId, priorities: SeasonalLuxuryStyleId[], base: number) {
  const index = priorities.indexOf(profileId);
  return index >= 0 ? base - index * 2 : 0;
}

function getUserPreferredProfile(extraRequirement = "") {
  const text = extraRequirement.toLowerCase();
  const matched = USER_KEYWORDS.find((item) => includesAny(text, item.keywords));
  return matched?.id;
}

function scoreProfile(profile: SeasonalLuxuryStyleProfile, input: SeasonalLuxuryStyleInput, userPreferredId?: SeasonalLuxuryStyleId) {
  const sceneKey = input.imageType === "对镜穿搭图" ? "对镜穿搭" : input.scenePreference;
  const seasonPriorities = SEASON_PRIORITIES[input.season];
  const scenePriorities = SCENE_PRIORITIES[sceneKey] ?? [];
  const shoePriorities = SHOE_PRIORITIES[input.shoe] ?? SHOE_PRIORITIES["自定义"];
  const combinedText = `${input.selectedOutfitLine} ${input.selectedOutfitStyleLine} ${input.selectedAccessoryLine}`.toLowerCase();
  let score = 0;

  if (profile.id === userPreferredId) score += 100;
  score += scorePriority(profile.id, seasonPriorities, 24);
  score += scorePriority(profile.id, scenePriorities, 22);
  score += scorePriority(profile.id, shoePriorities, 18);
  if (profile.suitableSeason.includes(input.season)) score += 5;
  if (profile.suitableScenes.includes(sceneKey)) score += 5;
  if (profileSupportsShoe(profile, input.shoe)) score += 4;

  if (combinedText.includes("cashmere") || combinedText.includes("wool") || combinedText.includes("oatmeal")) {
    if (profile.id === "loroPianaQuietCashmere" || profile.id === "theRowNoLogoRestraint") score += 4;
  }
  if (combinedText.includes("feminine") || combinedText.includes("skirt") || combinedText.includes("jewelry")) {
    if (profile.id === "chanelRefinedFeminine" || profile.id === "chloeSoftEase") score += 4;
  }
  if (combinedText.includes("shirt") || combinedText.includes("trousers") || combinedText.includes("optical")) {
    if (profile.id === "celineCityMinimal") score += 3;
  }
  if (combinedText.includes("no-logo") || combinedText.includes("relaxed tailoring")) {
    if (profile.id === "theRowNoLogoRestraint") score += 4;
  }

  return score;
}

function hasSocialiteRejection(extraRequirement = "") {
  return includesAny(extraRequirement.toLowerCase(), ["不要名媛", "no socialite"]);
}

export function chooseSeasonalLuxuryStyle(input: SeasonalLuxuryStyleInput) {
  if (!shouldUseSeasonalLuxuryStyle(input.imageType)) return "";
  if (input.scenePreference === "健身房内") return "";

  const userPreferredId = getUserPreferredProfile(input.userExtraRequirement);
  const candidates = seasonalLuxuryStyleProfiles.filter((profile) => {
    if (hasSocialiteRejection(input.userExtraRequirement) && profile.id === "chanelRefinedFeminine" && userPreferredId !== profile.id) {
      return false;
    }

    return true;
  });

  let bestScore = -Infinity;
  const scored = candidates.map((profile) => {
    const score = scoreProfile(profile, input, userPreferredId);
    if (score > bestScore) bestScore = score;
    return { profile, score };
  });
  const best = scored.filter((item) => item.score === bestScore).map((item) => item.profile);
  const selected = best[Math.floor(Math.random() * best.length)] ?? getProfile("theRowNoLogoRestraint");

  return selected.compactLuxuryStyleLine;
}
