import type { TeamScenePreference, TeamSeason, TeamShoe } from "../types";

type ActiveSceneType = "gymInterior" | "gymCommute";

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

export const activeOutfitLines: ActiveOutfitLine[] = [
  {
    id: "gymInterior01",
    sceneType: "gymInterior",
    season: ["春", "夏"],
    suitableShoes: ["Aire 微风", "Cloud Dancer 云舞者", "Sand Dollar 沙钱白"],
    compactLine:
      "Use a soft studio-ready outfit with a fitted cream active top, light grey straight active pants, a clean zip jacket, and a practical neutral gym tote.",
    forbidden:
      "Avoid exposed performance-bra focus, intense training mood, bodybuilder look, loud logos, neon activewear, cycling shorts focus, sweaty workout content, and influencer gym posing."
  },
  {
    id: "gymInterior02",
    sceneType: "gymInterior",
    season: ["春", "夏"],
    suitableShoes: ["Sand Dollar 沙钱白", "Cloud Dancer 云舞者", "Delphinium Blue 飞燕草蓝"],
    compactLine:
      "Style her in a white fitted short-sleeve top, pale oatmeal active leggings, a light beige overshirt, and a minimal gym bag for a calm indoor movement look.",
    forbidden:
      "Avoid exposed performance-bra focus, intense training mood, bodybuilder look, loud logos, neon activewear, cycling shorts focus, sweaty workout content, and influencer gym posing."
  },
  {
    id: "gymInterior03",
    sceneType: "gymInterior",
    season: ["春", "夏", "秋"],
    suitableShoes: ["Aire 微风", "Cloud Dancer 云舞者", "Panda 熊猫"],
    compactLine:
      "Use a soft grey active set with a cream lightweight jacket and a clean tote, keeping the outfit feminine, breathable, and understated.",
    forbidden:
      "Avoid exposed performance-bra focus, intense training mood, bodybuilder look, loud logos, neon activewear, cycling shorts focus, sweaty workout content, and influencer gym posing."
  },
  {
    id: "gymInterior04",
    sceneType: "gymInterior",
    season: ["秋", "冬", "春"],
    suitableShoes: ["Oreo 奥利奥", "Panda 熊猫", "Cappuccino 卡布奇诺"],
    compactLine:
      "Style her in a fitted off-white long-sleeve top, taupe clean jogger-style trousers, and a structured neutral tote for a refined gym-going look.",
    forbidden:
      "Avoid exposed performance-bra focus, intense training mood, bodybuilder look, loud logos, neon activewear, cycling shorts focus, sweaty workout content, and influencer gym posing."
  },
  {
    id: "gymInterior05",
    sceneType: "gymInterior",
    season: ["夏", "春"],
    suitableShoes: ["Aire 微风", "Lemon 柠檬", "Delphinium Blue 飞燕草蓝"],
    compactLine:
      "Use a light beige sleeveless active top with cream straight active pants and a soft grey zip outer layer for a clean studio-movement outfit.",
    forbidden:
      "Avoid exposed performance-bra focus, intense training mood, bodybuilder look, loud logos, neon activewear, cycling shorts focus, sweaty workout content, and influencer gym posing."
  },
  {
    id: "gymInterior06",
    sceneType: "gymInterior",
    season: ["冬", "秋"],
    suitableShoes: ["Cloud Dancer 云舞者", "Sand Dollar 沙钱白", "Oreo 奥利奥"],
    compactLine:
      "Style her in a pale stone fitted tee, winter-white leggings or clean athletic pants, and an oatmeal lightweight sweatshirt tied or layered softly.",
    forbidden:
      "Avoid exposed performance-bra focus, intense training mood, bodybuilder look, loud logos, neon activewear, cycling shorts focus, sweaty workout content, and influencer gym posing."
  },
  {
    id: "gymInterior07",
    sceneType: "gymInterior",
    season: ["春", "夏", "秋"],
    suitableShoes: ["Panda 熊猫", "Oreo 奥利奥", "Aire 微风"],
    compactLine:
      "Use a fitted warm-grey top, light neutral active trousers, and a minimal gym bag for a low-noise, movement-friendly indoor look.",
    forbidden:
      "Avoid exposed performance-bra focus, intense training mood, bodybuilder look, loud logos, neon activewear, cycling shorts focus, sweaty workout content, and influencer gym posing."
  },
  {
    id: "gymInterior08",
    sceneType: "gymInterior",
    season: ["春", "夏"],
    suitableShoes: ["Aire 微风", "Lemon 柠檬", "Cloud Dancer 云舞者"],
    compactLine:
      "Style her in a soft cream active tank layered under a pale khaki zip jacket with straight sporty trousers for a polished active-lifestyle image.",
    forbidden:
      "Avoid exposed performance-bra focus, intense training mood, bodybuilder look, loud logos, neon activewear, cycling shorts focus, sweaty workout content, and influencer gym posing."
  },
  {
    id: "gymInterior09",
    sceneType: "gymInterior",
    season: ["秋", "冬", "春"],
    suitableShoes: ["Cappuccino 卡布奇诺", "Maple Grove 枫林", "Sand Dollar 沙钱白"],
    compactLine:
      "Use a clean off-white active top, muted taupe studio pants, and a soft neutral tote for a restrained indoor fitness scene.",
    forbidden:
      "Avoid exposed performance-bra focus, intense training mood, bodybuilder look, loud logos, neon activewear, cycling shorts focus, sweaty workout content, and influencer gym posing."
  },
  {
    id: "gymInterior10",
    sceneType: "gymInterior",
    season: ["冬", "秋"],
    suitableShoes: ["Oreo 奥利奥", "Panda 熊猫", "Silver Romance 银色浪漫"],
    compactLine:
      "Style her in an ivory fitted top, refined black-grey active pants, and a light outer layer for a gym look that stays clean and wearable rather than sporty.",
    forbidden:
      "Avoid exposed performance-bra focus, intense training mood, bodybuilder look, loud logos, neon activewear, cycling shorts focus, sweaty workout content, and influencer gym posing."
  },
  {
    id: "gymCommute01",
    sceneType: "gymCommute",
    season: ["春", "夏"],
    suitableShoes: ["Cloud Dancer 云舞者", "Sand Dollar 沙钱白", "Aire 微风"],
    compactLine:
      "Use a refined gym-commute look with a fitted white top, soft grey straight active pants, a light zip jacket, and a clean practical tote.",
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
      "Use a soft neutral athleisure outfit with a sleeveless active top, ivory breathable pants, and a clean tote for a calm city-to-gym transition.",
    forbidden:
      "Avoid marathon outfit, running-club energy, technical sportswear, performance backpack styling, cycling look, tenniswear, neon accents, and heavy branded athleisure."
  },
  {
    id: "gymCommute04",
    sceneType: "gymCommute",
    season: ["春", "夏", "秋"],
    suitableShoes: ["Panda 熊猫", "Oreo 奥利奥", "Cloud Dancer 云舞者"],
    compactLine:
      "Style her in a light grey fitted tee, clean leggings or straight athletic pants, and a beige short outer layer for an easy gym-on-the-way outfit.",
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
      "Use a winter-white high-neck active top, clean grey athletic pants, and a light padded jacket for a cold-weather movement-oriented outfit.",
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
  "jogger pants",
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
