import type { TeamScenePreference, TeamSeason, TeamShoe } from "../types";

type ActiveSceneType = "gymInterior" | "gymCommute";
export type PremiumGymSubScene = "premiumGym" | "gymStrengthLight";

type ActiveOutfitLine = {
  id: string;
  sceneType: ActiveSceneType;
  season: TeamSeason[];
  suitableShoes: TeamShoe[] | "all";
  compactLine: string;
  forbidden: string;
};

type ActiveOutfitInput = {
  scenePreference: TeamScenePreference;
  season: TeamSeason;
  shoe: TeamShoe;
  userExtraRequirement?: string;
};

export const activeLifestyleBoundaryCompact =
  "Treat active scenes as refined movement-oriented daily life, not professional sports content. The outfit should feel sporty enough for light activity, stretching, gym-going, or movement-based routines, while still looking calm, clean, and wearable in daily life. Avoid turning the image into a performance-sports campaign or influencer fitness content.";

export const activeLifestyleAccessoryLine =
  "Use a clean practical tote or understated gym bag that supports the movement-oriented outfit without turning the scene into a luxury display or sports-brand campaign.";

export const activeLifestyleNegative =
  "Avoid technical running-shoe styling, professional sportswear, gym influencer energy, bodybuilding posing, intense training action, performance-athletic branding, neon activewear, sweaty workout content, sporty campaign aesthetics, and any look that turns the sneaker into a gym-only product. Avoid making the sneakers look like running shoes, training shoes, or chunky performance footwear.";

export const premiumGymActiveCompact =
  "Use a refined premium-gym or boutique-fitness environment with clean architecture, controlled equipment presence, low-saturation tones, and a polished movement-oriented mood. The scene should feel upscale, calm, and believable, suitable for light workouts, training transitions, or a refined gym-going routine rather than hardcore fitness content.";

export const strengthTrainingBoundaryCompact =
  "If a light strength-training mood appears, keep it elegant and restrained: light dumbbells, calm machine-side moments, training pauses, or preparation/post-workout transitions are allowed, but avoid hardcore lifting, sweaty exertion, bodybuilding energy, or aggressive gym culture.";

export const darkActiveOutfitBalanceCompact =
  "Allow darker activewear pieces such as black, charcoal, navy, or dark brown tops, shorts, or trousers to make the gym styling feel more real and less AI-clean, but balance them with light or neutral elements so the overall image stays refined, breathable, and aligned with THERUIZ AURA.";

export const lightStrengthActionCompact =
  "If the gym scene includes strength-related action, keep it subtle and refined: show calm movement-oriented moments such as holding a light dumbbell, pausing near a machine, walking through the strength area, or resting between light sets. Avoid intense exertion or hardcore lifting visuals.";

export const premiumGymLightingCompact =
  "Keep the gym lighting bright, clean, and premium. Even if the time is later in the day, avoid dark dramatic shadows, nightclub mood, or orange-heavy lighting.";

export const premiumGymAccessoryLine =
  "Use a practical, clean, understated gym tote or movement bag that supports the premium active-lifestyle look without making the scene feel like a sportswear campaign or luxury-logo display.";

export const premiumGymNegative =
  "Avoid cheap commercial gym background, fluorescent lighting, crowded equipment, hardcore bodybuilding energy, sweaty lifting content, powerlifting posture, hyper-muscular styling, neon activewear, influencer gym aesthetics, and any scene that feels like a professional sportswear ad rather than THERUIZ AURA's refined active lifestyle. Avoid tailored knee-length active shorts, insufficiently layered activewear, plastic-looking activewear, aggressive training expression, and overly dark heavy styling with no tonal balance.";

const premiumGymScenePool = [
  "Use a clean premium gym interior with soft stone tones, warm grey flooring, minimal high-end equipment, and calm architectural lighting.",
  "Use a boutique fitness studio with a polished mirror area, controlled low-saturation materials, clean open space, and a refined urban wellness atmosphere.",
  "Use a high-end gym setting with understated equipment, wood and stone textures, muted grey-beige tones, and a quiet sophisticated training mood.",
  "Use a premium movement space with elegant design, soft lighting, a restrained equipment layout, and a calm wellness-club feeling.",
  "Use a luxury fitness-club interior that feels spacious, low-noise, and modern, without becoming flashy or commercial."
];

const gymStrengthActionPool = [
  "Show her holding a light dumbbell naturally, with relaxed posture and no visible strain.",
  "Place her standing beside a cable machine in a calm preparation or training-pause moment.",
  "Show her resting between light sets with a water bottle or small towel, composed and unforced.",
  "Let her adjust gloves or a tote near a machine, keeping the movement subtle and believable.",
  "Show her seated calmly at a machine before or after a set, not during heavy exertion.",
  "Let her lean slightly near a dumbbell rack in a relaxed training-break moment.",
  "Show her checking posture in a mirror near equipment, with the sneakers and outfit still clear.",
  "Show her walking through a strength area with a clean gym tote, calm and composed."
];

const gymInteriorExpandedLines: ActiveOutfitLine[] = [
  {
    id: "gymInteriorExpanded01",
    sceneType: "gymInterior",
    season: ["春", "夏", "秋", "冬"],
    suitableShoes: ["Cloud Dancer 云舞者", "Sand Dollar 沙钱白", "Oreo 奥利奥", "Panda 熊猫", "Aire 微风"],
    compactLine:
      "Use a black fitted T-shirt, charcoal clean athletic shorts, and a practical no-logo gym tote for a clean premium-gym look.",
    forbidden:
      "Avoid neon activewear, fluorescent gymwear, compression-brand styling, bodybuilder outfit, insufficiently layered activewear, tailored knee-length active shorts, and cheap matching sports sets."
  },
  {
    id: "gymInteriorExpanded02",
    sceneType: "gymInterior",
    season: ["春", "夏"],
    suitableShoes: ["Aire 微风", "Delphinium Blue 飞燕草蓝", "Cloud Dancer 云舞者"],
    compactLine:
      "Style her in a deep navy short-sleeve active top, soft grey active shorts, and a minimal gym bag for a calm high-end training mood.",
    forbidden:
      "Avoid neon activewear, fluorescent gymwear, compression-brand styling, bodybuilder outfit, insufficiently layered activewear, tailored knee-length active shorts, and cheap matching sports sets."
  },
  {
    id: "gymInteriorExpanded03",
    sceneType: "gymInterior",
    season: ["夏", "春"],
    suitableShoes: ["Cappuccino 卡布奇诺", "Maple Grove 枫林", "Sand Dollar 沙钱白"],
    compactLine:
      "Use a dark brown fitted short-sleeve top, ivory clean athletic shorts, and a taupe tote for a refined summer indoor workout look.",
    forbidden:
      "Avoid neon activewear, fluorescent gymwear, compression-brand styling, bodybuilder outfit, insufficiently layered activewear, tailored knee-length active shorts, and cheap matching sports sets."
  },
  {
    id: "gymInteriorExpanded04",
    sceneType: "gymInterior",
    season: ["夏", "春"],
    suitableShoes: ["Aire 微风", "Lemon 柠檬", "Cloud Dancer 云舞者"],
    compactLine:
      "Style her in a black fitted tank, cream sporty shorts, and a lightweight pale grey outer layer for a polished movement-space outfit.",
    forbidden:
      "Avoid neon activewear, fluorescent gymwear, compression-brand styling, bodybuilder outfit, insufficiently layered activewear, tailored knee-length active shorts, and cheap matching sports sets."
  },
  {
    id: "gymInteriorExpanded05",
    sceneType: "gymInterior",
    season: ["春", "夏", "秋", "冬"],
    suitableShoes: ["Oreo 奥利奥", "Panda 熊猫", "Silver Romance 银色浪漫", "Cloud Dancer 云舞者"],
    compactLine:
      "Use a charcoal fitted tee, black straight active trousers, and a restrained gym tote for a premium strength-area scene.",
    forbidden:
      "Avoid neon activewear, fluorescent gymwear, compression-brand styling, bodybuilder outfit, insufficiently layered activewear, tailored knee-length active shorts, and cheap matching sports sets."
  },
  {
    id: "gymInteriorExpanded06",
    sceneType: "gymInterior",
    season: ["春", "夏", "秋"],
    suitableShoes: "all",
    compactLine:
      "Style her in a graphite clean athletic tee, taupe active shorts, and a no-logo tote for a realistic upscale gym moment.",
    forbidden:
      "Avoid neon activewear, fluorescent gymwear, compression-brand styling, bodybuilder outfit, insufficiently layered activewear, tailored knee-length active shorts, and cheap matching sports sets."
  },
  {
    id: "gymInteriorExpanded07",
    sceneType: "gymInterior",
    season: ["春", "夏", "秋", "冬"],
    suitableShoes: ["Cloud Dancer 云舞者", "Sand Dollar 沙钱白", "Oreo 奥利奥", "Panda 熊猫"],
    compactLine:
      "Use a white fitted short-sleeve top, black relaxed gym trousers, and a clean structured gym bag for a refined contrast look.",
    forbidden:
      "Avoid neon activewear, fluorescent gymwear, compression-brand styling, bodybuilder outfit, insufficiently layered activewear, tailored knee-length active shorts, and cheap matching sports sets."
  },
  {
    id: "gymInteriorExpanded08",
    sceneType: "gymInterior",
    season: ["春", "夏", "秋", "冬"],
    suitableShoes: ["Aire 微风", "Sand Dollar 沙钱白", "Lemon 柠檬", "Delphinium Blue 飞燕草蓝"],
    compactLine:
      "Style her in a cream active tank, charcoal clean leggings or straight active trousers, and a taupe zip outer layer for a soft but grounded gym image.",
    forbidden:
      "Avoid neon activewear, fluorescent gymwear, compression-brand styling, bodybuilder outfit, insufficiently layered activewear, tailored knee-length active shorts, and cheap matching sports sets."
  },
  {
    id: "gymInteriorExpanded09",
    sceneType: "gymInterior",
    season: ["夏", "春"],
    suitableShoes: ["Aire 微风", "Lemon 柠檬", "Cloud Dancer 云舞者"],
    compactLine:
      "Use a pale grey short-sleeve tee, black active shorts, and a cream overshirt tied or lightly layered for a believable gym-going scene.",
    forbidden:
      "Avoid neon activewear, fluorescent gymwear, compression-brand styling, bodybuilder outfit, insufficiently layered activewear, tailored knee-length active shorts, and cheap matching sports sets."
  },
  {
    id: "gymInteriorExpanded10",
    sceneType: "gymInterior",
    season: ["春", "夏", "秋", "冬"],
    suitableShoes: ["Cappuccino 卡布奇诺", "Maple Grove 枫林", "Oreo 奥利奥", "Panda 熊猫"],
    compactLine:
      "Style her in a dark brown sleeveless active top, soft grey active trousers, and a black clean tote for a quiet luxury gym outfit.",
    forbidden:
      "Avoid neon activewear, fluorescent gymwear, compression-brand styling, bodybuilder outfit, insufficiently layered activewear, tailored knee-length active shorts, and cheap matching sports sets."
  },
  {
    id: "gymInteriorExpanded11",
    sceneType: "gymInterior",
    season: ["夏", "春"],
    suitableShoes: ["Cloud Dancer 云舞者", "Sand Dollar 沙钱白", "Panda 熊猫", "Oreo 奥利奥"],
    compactLine:
      "Use a black fitted short-sleeve top, ivory clean shorts, and a lightweight zip jacket for a crisp summer premium-gym look.",
    forbidden:
      "Avoid neon activewear, fluorescent gymwear, compression-brand styling, bodybuilder outfit, insufficiently layered activewear, tailored knee-length active shorts, and cheap matching sports sets."
  },
  {
    id: "gymInteriorExpanded12",
    sceneType: "gymInterior",
    season: ["春", "夏", "秋", "冬"],
    suitableShoes: ["Oreo 奥利奥", "Panda 熊猫", "Cappuccino 卡布奇诺", "Maple Grove 枫林"],
    compactLine:
      "Style her in a deep charcoal athletic tee, taupe jogger-style trousers, and an understated gym bag for a clean machine-area or training-break image.",
    forbidden:
      "Avoid neon activewear, fluorescent gymwear, compression-brand styling, bodybuilder outfit, insufficiently layered activewear, tailored knee-length active shorts, and cheap matching sports sets."
  }
];

export const activeOutfitLines: ActiveOutfitLine[] = [
  {
    id: "gymInterior01",
    sceneType: "gymInterior",
    season: ["春", "夏"],
    suitableShoes: ["Aire 微风", "Cloud Dancer 云舞者", "Sand Dollar 沙钱白"],
    compactLine:
      "Use a soft studio-ready outfit with a fitted cream active top, light grey straight active trousers, a clean zip jacket, and a practical neutral gym tote.",
    forbidden:
      "Avoid insufficiently layered activewear, intense training mood, bodybuilder look, loud logos, neon activewear, cycling shorts focus, sweaty workout content, and influencer gym posing."
  },
  {
    id: "gymInterior02",
    sceneType: "gymInterior",
    season: ["春", "夏"],
    suitableShoes: ["Sand Dollar 沙钱白", "Cloud Dancer 云舞者", "Delphinium Blue 飞燕草蓝"],
    compactLine:
      "Style her in a white fitted short-sleeve top, pale oatmeal active leggings, a light beige overshirt, and a minimal gym bag for a calm indoor movement look.",
    forbidden:
      "Avoid insufficiently layered activewear, intense training mood, bodybuilder look, loud logos, neon activewear, cycling shorts focus, sweaty workout content, and influencer gym posing."
  },
  {
    id: "gymInterior03",
    sceneType: "gymInterior",
    season: ["春", "夏", "秋"],
    suitableShoes: ["Aire 微风", "Cloud Dancer 云舞者", "Panda 熊猫"],
    compactLine:
      "Use a soft grey active set with a cream lightweight jacket and a clean tote, keeping the outfit feminine, breathable, and understated.",
    forbidden:
      "Avoid insufficiently layered activewear, intense training mood, bodybuilder look, loud logos, neon activewear, cycling shorts focus, sweaty workout content, and influencer gym posing."
  },
  {
    id: "gymInterior04",
    sceneType: "gymInterior",
    season: ["秋", "冬", "春"],
    suitableShoes: ["Oreo 奥利奥", "Panda 熊猫", "Cappuccino 卡布奇诺"],
    compactLine:
      "Style her in a fitted off-white long-sleeve top, taupe clean jogger-style trousers, and a structured neutral tote for a refined gym-going look.",
    forbidden:
      "Avoid insufficiently layered activewear, intense training mood, bodybuilder look, loud logos, neon activewear, cycling shorts focus, sweaty workout content, and influencer gym posing."
  },
  {
    id: "gymInterior05",
    sceneType: "gymInterior",
    season: ["夏", "春"],
    suitableShoes: ["Aire 微风", "Lemon 柠檬", "Delphinium Blue 飞燕草蓝"],
    compactLine:
      "Use a light beige sleeveless active top with cream straight active trousers and a soft grey zip outer layer for a clean studio-movement outfit.",
    forbidden:
      "Avoid insufficiently layered activewear, intense training mood, bodybuilder look, loud logos, neon activewear, cycling shorts focus, sweaty workout content, and influencer gym posing."
  },
  {
    id: "gymInterior06",
    sceneType: "gymInterior",
    season: ["冬", "秋"],
    suitableShoes: ["Cloud Dancer 云舞者", "Sand Dollar 沙钱白", "Oreo 奥利奥"],
    compactLine:
      "Style her in a pale stone fitted tee, winter-white leggings or clean athletic trousers, and an oatmeal lightweight sweatshirt tied or layered softly.",
    forbidden:
      "Avoid insufficiently layered activewear, intense training mood, bodybuilder look, loud logos, neon activewear, cycling shorts focus, sweaty workout content, and influencer gym posing."
  },
  {
    id: "gymInterior07",
    sceneType: "gymInterior",
    season: ["春", "夏", "秋"],
    suitableShoes: ["Panda 熊猫", "Oreo 奥利奥", "Aire 微风"],
    compactLine:
      "Use a fitted warm-grey top, light neutral active trousers, and a minimal gym bag for a low-noise, movement-friendly indoor look.",
    forbidden:
      "Avoid insufficiently layered activewear, intense training mood, bodybuilder look, loud logos, neon activewear, cycling shorts focus, sweaty workout content, and influencer gym posing."
  },
  {
    id: "gymInterior08",
    sceneType: "gymInterior",
    season: ["春", "夏"],
    suitableShoes: ["Aire 微风", "Lemon 柠檬", "Cloud Dancer 云舞者"],
    compactLine:
      "Style her in a soft cream active tank layered under a pale khaki zip jacket with straight sporty trousers for a polished active-lifestyle image.",
    forbidden:
      "Avoid insufficiently layered activewear, intense training mood, bodybuilder look, loud logos, neon activewear, cycling shorts focus, sweaty workout content, and influencer gym posing."
  },
  {
    id: "gymInterior09",
    sceneType: "gymInterior",
    season: ["秋", "冬", "春"],
    suitableShoes: ["Cappuccino 卡布奇诺", "Maple Grove 枫林", "Sand Dollar 沙钱白"],
    compactLine:
      "Use a clean off-white active top, muted taupe studio trousers, and a soft neutral tote for a restrained indoor fitness scene.",
    forbidden:
      "Avoid insufficiently layered activewear, intense training mood, bodybuilder look, loud logos, neon activewear, cycling shorts focus, sweaty workout content, and influencer gym posing."
  },
  {
    id: "gymInterior10",
    sceneType: "gymInterior",
    season: ["冬", "秋"],
    suitableShoes: ["Oreo 奥利奥", "Panda 熊猫", "Silver Romance 银色浪漫"],
    compactLine:
      "Style her in an ivory fitted top, refined black-grey active trousers, and a light outer layer for a gym look that stays clean and wearable rather than sporty.",
    forbidden:
      "Avoid insufficiently layered activewear, intense training mood, bodybuilder look, loud logos, neon activewear, cycling shorts focus, sweaty workout content, and influencer gym posing."
  },
  {
    id: "gymCommute01",
    sceneType: "gymCommute",
    season: ["春", "夏"],
    suitableShoes: ["Cloud Dancer 云舞者", "Sand Dollar 沙钱白", "Aire 微风"],
    compactLine:
      "Use a refined gym-commute look with a fitted white top, soft grey straight active trousers, a light zip jacket, and a clean practical tote.",
    forbidden:
      "Avoid marathon outfit, running-club energy, technical sportswear, performance backpack styling, cycling look, tenniswear, neon accents, and heavy branded athleisure."
  },
  {
    id: "gymCommute02",
    sceneType: "gymCommute",
    season: ["春", "夏"],
    suitableShoes: ["Aire 微风", "Lemon 柠檬", "Sand Dollar 沙钱白"],
    compactLine:
      "Style her in a cream fitted active top, pale khaki jogger-style trousers, and a lightweight overshirt with a minimal gym bag for a polished movement-ready look.",
    forbidden:
      "Avoid marathon outfit, running-club energy, technical sportswear, performance backpack styling, cycling look, tenniswear, neon accents, and heavy branded athleisure."
  },
  {
    id: "gymCommute03",
    sceneType: "gymCommute",
    season: ["夏", "春"],
    suitableShoes: ["Aire 微风", "Delphinium Blue 飞燕草蓝", "Lemon 柠檬"],
    compactLine:
      "Use a soft neutral athleisure outfit with a sleeveless active top, ivory breathable trousers, and a clean tote for a calm city-to-gym transition.",
    forbidden:
      "Avoid marathon outfit, running-club energy, technical sportswear, performance backpack styling, cycling look, tenniswear, neon accents, and heavy branded athleisure."
  },
  {
    id: "gymCommute04",
    sceneType: "gymCommute",
    season: ["春", "夏", "秋"],
    suitableShoes: ["Panda 熊猫", "Oreo 奥利奥", "Cloud Dancer 云舞者"],
    compactLine:
      "Style her in a light grey fitted tee, clean leggings or straight athletic trousers, and a beige short outer layer for an easy gym-on-the-way outfit.",
    forbidden:
      "Avoid marathon outfit, running-club energy, technical sportswear, performance backpack styling, cycling look, tenniswear, neon accents, and heavy branded athleisure."
  },
  {
    id: "gymCommute05",
    sceneType: "gymCommute",
    season: ["秋", "冬", "春"],
    suitableShoes: ["Cloud Dancer 云舞者", "Sand Dollar 沙钱白", "Oreo 奥利奥"],
    compactLine:
      "Use a soft cream sweatshirt, understated athletic trousers, and a practical structured tote for an elevated sport-casual movement day.",
    forbidden:
      "Avoid marathon outfit, running-club energy, technical sportswear, performance backpack styling, cycling look, tenniswear, neon accents, and heavy branded athleisure."
  },
  {
    id: "gymCommute06",
    sceneType: "gymCommute",
    season: ["秋", "冬"],
    suitableShoes: ["Cappuccino 卡布奇诺", "Maple Grove 枫林", "Sand Dollar 沙钱白"],
    compactLine:
      "Style her in an oatmeal fitted knit-active top, taupe sporty trousers, and a cappuccino-toned jacket for a refined autumn gym commute.",
    forbidden:
      "Avoid marathon outfit, running-club energy, technical sportswear, performance backpack styling, cycling look, tenniswear, neon accents, and heavy branded athleisure."
  },
  {
    id: "gymCommute07",
    sceneType: "gymCommute",
    season: ["冬"],
    suitableShoes: ["Cloud Dancer 云舞者", "Oreo 奥利奥", "Panda 熊猫"],
    compactLine:
      "Use a winter-white high-neck active top, clean grey athletic trousers, and a light padded jacket for a cold-weather movement-oriented outfit.",
    forbidden:
      "Avoid marathon outfit, running-club energy, technical sportswear, performance backpack styling, cycling look, tenniswear, neon accents, and heavy branded athleisure."
  },
  {
    id: "gymCommute08",
    sceneType: "gymCommute",
    season: ["春", "夏", "秋"],
    suitableShoes: ["Aire 微风", "Delphinium Blue 飞燕草蓝", "Cloud Dancer 云舞者"],
    compactLine:
      "Style her in a pale neutral active set layered with a longline shirt or overshirt, carrying a practical gym bag that feels daily and polished.",
    forbidden:
      "Avoid marathon outfit, running-club energy, technical sportswear, performance backpack styling, cycling look, tenniswear, neon accents, and heavy branded athleisure."
  },
  {
    id: "gymCommute09",
    sceneType: "gymCommute",
    season: ["秋", "冬", "春"],
    suitableShoes: ["Cappuccino 卡布奇诺", "Maple Grove 枫林", "Sand Dollar 沙钱白"],
    compactLine:
      "Use a fitted stone-beige top, relaxed clean jogger trousers, and a The Row-style no-logo tote for an understated city-active outfit.",
    forbidden:
      "Avoid marathon outfit, running-club energy, technical sportswear, performance backpack styling, cycling look, tenniswear, neon accents, and heavy branded athleisure."
  },
  {
    id: "gymCommute10",
    sceneType: "gymCommute",
    season: ["春", "夏", "秋", "冬"],
    suitableShoes: ["Oreo 奥利奥", "Panda 熊猫", "Silver Romance 银色浪漫"],
    compactLine:
      "Style her in a clean monochrome active-casual outfit with a fitted tee, restrained black-white trousers, and a refined tote, making the look movement-friendly but not sporty.",
    forbidden:
      "Avoid marathon outfit, running-club energy, technical sportswear, performance backpack styling, cycling look, tenniswear, neon accents, and heavy branded athleisure."
  }
];

const USER_ITEM_KEYWORDS = [
  "leggings",
  "jogger trousers",
  "jogger",
  "fitted top",
  "sweatshirt",
  "gym tote",
  "activewear",
  "运动裤",
  "紧身裤",
  "卫衣",
  "健身包"
];

export function getActiveSceneType(scenePreference: TeamScenePreference): ActiveSceneType | null {
  if (scenePreference === "健身房内") return "gymInterior";
  if (scenePreference === "去运动的路上") return "gymCommute";
  return null;
}

export function isActiveScene(scenePreference: TeamScenePreference) {
  return getActiveSceneType(scenePreference) !== null;
}

export function choosePremiumGymSubScene(input: ActiveOutfitInput): PremiumGymSubScene {
  const text = (input.userExtraRequirement ?? "").toLowerCase();

  if (/撸铁|力量|器械|哑铃|dumbbell|strength|machine|cable|training|weights/.test(text)) {
    return "gymStrengthLight";
  }

  if (/高级|精品|premium|boutique|luxury|club|高端/.test(text)) {
    return "premiumGym";
  }

  return Math.random() < 0.38 ? "gymStrengthLight" : "premiumGym";
}

export function choosePremiumGymSceneLine() {
  return premiumGymScenePool[Math.floor(Math.random() * premiumGymScenePool.length)];
}

export function chooseLightStrengthActionLine() {
  return gymStrengthActionPool[Math.floor(Math.random() * gymStrengthActionPool.length)];
}

function supportsShoe(line: ActiveOutfitLine, shoe: TeamShoe) {
  return line.suitableShoes === "all" || line.suitableShoes.includes(shoe);
}

function scoreActiveOutfit(line: ActiveOutfitLine, input: ActiveOutfitInput) {
  const text = (input.userExtraRequirement ?? "").toLowerCase();
  const lineText = line.compactLine.toLowerCase();
  let score = 0;

  if (line.season.includes(input.season)) score += 8;
  if (supportsShoe(line, input.shoe)) score += 10;

  if (input.shoe === "Aire 微风" && /studio|breathable|sleeveless|overshirt|light/.test(lineText)) score += 8;
  if ((input.shoe === "Cloud Dancer 云舞者" || input.shoe === "Sand Dollar 沙钱白") && /clean|commute|daily|white|cream/.test(lineText)) score += 7;
  if ((input.shoe === "Oreo 奥利奥" || input.shoe === "Panda 熊猫") && /monochrome|black-grey|grey|city/.test(lineText)) score += 7;
  if (input.shoe === "Delphinium Blue 飞燕草蓝" && /studio|soft|spring|summer|pale|light/.test(lineText)) score += 7;
  if (input.shoe === "Silver Romance 银色浪漫" && line.sceneType === "gymCommute") score += 8;
  if ((input.shoe === "Cappuccino 卡布奇诺" || input.shoe === "Maple Grove 枫林") && line.sceneType === "gymCommute") score += 7;
  if (input.shoe === "Lemon 柠檬" && /spring|summer|light|cream|pale/.test(lineText)) score += 6;

  USER_ITEM_KEYWORDS.forEach((keyword) => {
    if (text.includes(keyword.toLowerCase()) && lineText.includes(keyword.toLowerCase().replace("gym tote", "tote"))) {
      score += 20;
    }
  });

  return score;
}

function scorePremiumGymOutfit(line: ActiveOutfitLine, input: ActiveOutfitInput, subScene: PremiumGymSubScene) {
  const text = (input.userExtraRequirement ?? "").toLowerCase();
  const lineText = line.compactLine.toLowerCase();
  let score = scoreActiveOutfit(line, input);

  if (subScene === "gymStrengthLight" && /strength|machine|dumbbell|black|charcoal|graphite|active trousers|trousers|training/.test(lineText)) {
    score += 10;
  }
  if (subScene === "premiumGym" && /premium|clean|refined|crisp|quiet luxury|taupe|ivory|cream|soft grey/.test(lineText)) {
    score += 8;
  }

  if (input.shoe === "Aire 微风" && /breathable|shorts|sleeveless|tank|summer|movement|active/.test(lineText)) score += 10;
  if ((input.shoe === "Cloud Dancer 云舞者" || input.shoe === "Sand Dollar 沙钱白") && /black|white|ivory|cream|contrast|premium/.test(lineText)) score += 9;
  if ((input.shoe === "Oreo 奥利奥" || input.shoe === "Panda 熊猫") && /black|charcoal|graphite|deep|contrast|strength/.test(lineText)) score += 10;
  if (input.shoe === "Delphinium Blue 飞燕草蓝" && /navy|pale grey|soft grey|cream|studio/.test(lineText)) score += 7;
  if (input.shoe === "Silver Romance 银色浪漫" && /mirror|grey|black|departure|structured/.test(lineText)) score += 5;
  if ((input.shoe === "Cappuccino 卡布奇诺" || input.shoe === "Maple Grove 枫林") && /dark brown|taupe|charcoal|training-break|soft grey/.test(lineText)) score += 8;
  if (input.shoe === "Lemon 柠檬" && /cream|olive|beige|ivory|pale|shorts/.test(lineText)) score += 8;

  USER_ITEM_KEYWORDS.concat(["shorts", "tee", "t-shirt", "tank", "短裤", "短袖", "深色", "黑色"]).forEach((keyword) => {
    const normalizedKeyword = keyword.toLowerCase();
    if (text.includes(normalizedKeyword) && lineText.includes(normalizedKeyword.replace("t-shirt", "t-shirt"))) {
      score += 18;
    }
  });

  return score;
}

export function choosePremiumGymOutfitLine(input: ActiveOutfitInput, subScene: PremiumGymSubScene) {
  const candidates = [...gymInteriorExpandedLines, ...activeOutfitLines].filter(
    (line) => line.sceneType === "gymInterior"
  );
  let bestScore = -Infinity;
  const scored = candidates.map((line) => {
    const score = scorePremiumGymOutfit(line, input, subScene);
    if (score > bestScore) bestScore = score;
    return { line, score };
  });
  const best = scored.filter((item) => item.score === bestScore).map((item) => item.line);
  const selected = best[Math.floor(Math.random() * best.length)] ?? candidates[0];

  return selected?.compactLine ?? "";
}

export function chooseActiveOutfitLine(input: ActiveOutfitInput) {
  const sceneType = getActiveSceneType(input.scenePreference);
  if (!sceneType) return "";

  const candidates = activeOutfitLines.filter((line) => line.sceneType === sceneType);
  let bestScore = -Infinity;
  const scored = candidates.map((line) => {
    const score = scoreActiveOutfit(line, input);
    if (score > bestScore) bestScore = score;
    return { line, score };
  });
  const best = scored.filter((item) => item.score === bestScore).map((item) => item.line);
  const selected = best[Math.floor(Math.random() * best.length)] ?? candidates[0];

  return selected?.compactLine ?? "";
}
