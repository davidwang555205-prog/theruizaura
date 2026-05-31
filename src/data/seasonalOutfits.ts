import type { Season, TeamImageType, TeamScenePreference, TeamSeason, TeamShoe } from "../types";

export const SEASON_LABELS: Record<Season, string> = {
  Spring: "春 Spring",
  Summer: "夏 Summer",
  Autumn: "秋 Autumn",
  Winter: "冬 Winter"
};

export const SEASONAL_OUTFIT_LIBRARY: Record<Season, string> = {
  Spring: `Spring styling direction:
Use a refined spring outfit with soft low-saturation layers such as a white shirt, cream knitwear, light blue denim, oatmeal trousers, a light trench coat, or a soft beige tote. The styling should feel airy, clean, gentle, and relaxed, with understated femininity and quiet daily elegance.`,
  Summer: `Summer styling direction:
Use a breathable summer outfit with airy low-saturation pieces such as a white short-sleeve shirt, linen trousers, cream cotton tops, soft beige pants, pale denim, or a light neutral tote bag. The styling should feel light, breathable, refined, and quietly feminine, without sporty energy or vacation-girl styling.`,
  Autumn: `Autumn styling direction:
Use a soft autumn outfit with warm, tactile, low-saturation layers such as oatmeal knitwear, cappuccino tones, light wool outerwear, soft denim, warm beige trousers, or a refined brown tote. The styling should feel calm, seasonal, feminine, and quietly vintage without looking heavy or costume-like.`,
  Winter: `Winter styling direction:
Use a refined winter outfit with warm clean layers such as oatmeal knitwear, a cream or warm grey coat, soft wool trousers, structured denim, or a muted brown tote bag. The styling should feel warm, composed, elegant, and practical, with quiet winter sophistication rather than bulky or harsh winter fashion.`
};

export const BRAND_MATCHED_OUTFIT_DIRECTION = `Brand-matched outfit direction:
The outfit should align with THERUIZ AURA's "Quiet Warm Luxury" styling system. Use low-saturation, refined, practical, softly feminine clothing with quiet layering, clean proportions, and believable daily elegance. Avoid trendy influencer dressing, sporty styling, girlish sweetness, loud color contrast, or over-styled fashion energy.`;

export const SHOE_STYLE_NOTES: Record<string, string> = {
  "Cloud Dancer 云舞者":
    "clean white foundation, effortless daily classic, the most versatile pair in a refined wardrobe. Prefer white shirts, cream knitwear, beige trousers, pale denim, and light trench coats.",
  "Sand Dollar 沙钱白":
    "warm off-white, softer and more mature than pure white, timeless everyday foundation. Prefer off-white, oatmeal, light grey-beige, and pale khaki.",
  "Delphinium Blue 飞燕草蓝":
    "pale low-saturation blue, airy, fresh, quiet summer accent, clean and softly distinctive. Prefer white shirts, pale blue denim, oatmeal knitwear, cream-white trousers, and spring-summer airiness.",
  "Silver Romance 银色浪漫":
    "soft moonlit metallic accent, quietly luminous, refined urban difference without flashiness. Prefer light grey, cream-white, gentle beige, and refined urban softness; avoid futuristic styling.",
  "Aire 微风":
    "light, breathable, airy spring-summer ease, refined mesh texture, not sporty. Prefer linen, thin shirts, lightweight fabrics, and spring-summer daily ease; never make it sporty.",
  "Cappuccino 卡布奇诺":
    "warm suede coffee tone, soft autumn-winter mood, vintage but clean, calm and tactile. Prefer knitwear, coffee tones, oatmeal, gentle autumn-winter colors, and warm layering.",
  "Lemon 柠檬":
    "light butter-yellow accent, fresh but not childish, warm and optimistic within a neutral scene. Prefer white, cream, pale denim, and light beige; fresh but not juvenile.",
  "Maple Grove 枫林":
    "warm muted maple tone, refined seasonal warmth, not heavy, not masculine. Prefer warm knitwear, pale brown trousers, beige-coffee layering, and soft autumn tactility.",
  "Oreo 奥利奥":
    "clean black-and-white contrast, graphic but restrained, daily classic with stronger recognition. Prefer black, white, grey, and beige basics, but keep the look soft rather than cold or hard.",
  "Panda 熊猫":
    "soft black-and-white balance, friendly contrast, clean daily character without looking childish. Prefer black, white, grey, beige, soft denim, and light urban basics."
};

export type SeasonalOutfitGroup = {
  keywords: string[];
  tops: string[];
  bottoms: string[];
  outerwear: string[];
  dressesSkirts: string[];
  bags: string[];
  accessories: string[];
  fabrics: string[];
  colorPalette: string[];
  forbidden: string;
  compactOutfitLines: string[];
};

export const seasonalOutfitGroups: Record<TeamSeason, SeasonalOutfitGroup> = {
  春: {
    keywords: ["airy", "gentle", "clean", "light layering", "soft neutral", "relaxed but polished"],
    tops: [
      "white cotton shirt",
      "cream silk-blend shirt",
      "oatmeal lightweight knit top",
      "ivory long-sleeve T-shirt",
      "soft beige blouse",
      "pale grey fine-knit cardigan",
      "off-white ribbed knit top",
      "light blue shirt",
      "cream polo knit",
      "soft linen-blend shirt"
    ],
    bottoms: [
      "light blue straight-leg denim",
      "cream straight-leg trousers",
      "beige tapered trousers",
      "pale khaki casual pants",
      "ivory cropped trousers",
      "oatmeal wide-leg trousers",
      "soft grey tailored pants",
      "light denim ankle-length jeans",
      "linen-blend trousers",
      "relaxed chino pants"
    ],
    outerwear: [
      "light beige trench coat",
      "cream cropped jacket",
      "oatmeal knit cardigan",
      "pale khaki lightweight coat",
      "soft grey blazer",
      "ivory short jacket",
      "beige shirt jacket",
      "light wool-blend blazer"
    ],
    dressesSkirts: [
      "cream midi skirt",
      "beige A-line skirt",
      "soft grey knit skirt",
      "ivory shirt dress",
      "pale khaki wrap skirt",
      "light denim skirt",
      "oatmeal straight skirt"
    ],
    bags: [
      "cream tote bag",
      "soft beige leather tote",
      "pale grey shoulder bag",
      "light taupe handbag",
      "natural canvas tote",
      "small warm beige crossbody bag"
    ],
    accessories: [
      "minimal gold earrings",
      "simple watch",
      "thin leather belt",
      "light silk scarf",
      "understated sunglasses",
      "small hair clip"
    ],
    fabrics: ["cotton", "fine knit", "linen blend", "soft denim", "light wool blend", "silk blend", "washed cotton"],
    colorPalette: [
      "cream white",
      "ivory",
      "oatmeal",
      "warm beige",
      "pale khaki",
      "soft grey",
      "light denim blue",
      "light taupe"
    ],
    forbidden:
      "Avoid girlish sweetness, floral overload, bright colors, heavy streetwear, sporty hoodie sets, exaggerated Korean influencer styling, overly romantic styling.",
    compactOutfitLines: [
      "Style her in a white cotton shirt, light blue straight-leg denim, a soft beige trench coat, and a cream tote for clean spring ease.",
      "Use cream lightweight knitwear, pale khaki tapered trousers, and a light taupe handbag for a gentle polished spring look.",
      "Pair an ivory shirt dress with understated gold earrings and a soft beige shoulder bag for relaxed feminine spring elegance.",
      "Style her with a light blue shirt, ivory cropped trousers, a pale grey fine-knit cardigan, and a natural canvas tote.",
      "Use an off-white ribbed knit top, oatmeal wide-leg trousers, a cream cropped jacket, and a small warm beige crossbody bag.",
      "Pair a soft beige blouse with light denim ankle-length jeans, a beige shirt jacket, and a pale grey shoulder bag.",
      "Use a cream polo knit, soft grey tailored pants, a light wool-blend blazer, and a slim leather belt for a quiet commute-ready outfit.",
      "Style her in a soft linen-blend shirt, relaxed chino pants, a pale khaki lightweight coat, and understated sunglasses.",
      "Pair a cream midi skirt with an oatmeal lightweight knit top, simple watch, and light taupe handbag for refined spring softness.",
      "Use a white shirt, beige tapered trousers, an ivory short jacket, and a cream tote for a clean daily city outfit."
    ]
  },
  夏: {
    keywords: ["breathable", "light", "airy", "clean", "refined summer ease", "not sporty"],
    tops: [
      "white short-sleeve shirt",
      "cream linen shirt",
      "ivory sleeveless top",
      "oatmeal lightweight knit tee",
      "soft beige cotton T-shirt",
      "off-white boxy shirt",
      "pale blue cotton shirt",
      "cream fine-rib tank under a shirt",
      "linen-blend blouse",
      "light grey short-sleeve knit"
    ],
    bottoms: [
      "cream linen trousers",
      "beige wide-leg trousers",
      "ivory straight-leg pants",
      "pale khaki lightweight pants",
      "light blue denim jeans",
      "soft grey summer trousers",
      "white cropped trousers",
      "oatmeal relaxed pants",
      "linen-blend ankle trousers",
      "airy cotton pants"
    ],
    outerwear: [
      "lightweight linen overshirt",
      "thin sun-protection shirt in cream",
      "soft beige summer cardigan",
      "ivory shirt jacket",
      "very light cotton blazer",
      "no outerwear if the scene needs summer simplicity"
    ],
    dressesSkirts: [
      "cream linen midi skirt",
      "ivory cotton skirt",
      "beige straight skirt",
      "soft grey summer dress",
      "off-white shirt dress",
      "pale khaki sleeveless dress",
      "light denim skirt"
    ],
    bags: [
      "cream canvas tote",
      "soft beige shoulder bag",
      "restrained woven bag",
      "ivory leather tote",
      "light tan handbag",
      "pale grey mini tote"
    ],
    accessories: [
      "small gold earrings",
      "slim necklace",
      "understated sunglasses",
      "simple watch",
      "soft hair tie",
      "minimal bracelet"
    ],
    fabrics: ["linen", "cotton", "lightweight knit", "breathable mesh", "washed denim", "silk-cotton blend", "thin canvas"],
    colorPalette: [
      "cream white",
      "linen beige",
      "warm off-white",
      "pale khaki",
      "light denim blue",
      "soft stone",
      "oatmeal",
      "light tan"
    ],
    forbidden:
      "Avoid sporty tank styling, gym look, vacation-girl styling, beach mood, overexposed skin, loud resort prints, high-saturation color, girlish shorts styling.",
    compactOutfitLines: [
      "Style her in a white short-sleeve shirt, cream linen trousers, and a light neutral tote for breathable summer ease.",
      "Use a cream linen shirt, pale denim, and understated gold accessories for clean summer daily sophistication.",
      "Pair an ivory sleeveless top with beige wide-leg trousers and a soft shoulder bag for refined warm-weather comfort.",
      "Style her with an off-white boxy shirt, oatmeal relaxed pants, and a restrained woven bag for quiet summer practicality.",
      "Use a pale blue cotton shirt, white cropped trousers, and a pale grey mini tote for a fresh low-saturation summer look.",
      "Pair a cream fine-rib tank under a lightweight linen overshirt with ivory straight-leg pants and a light tan handbag.",
      "Use a linen-blend blouse, pale khaki lightweight pants, simple watch, and small gold earrings for refined daily movement.",
      "Style her in a light grey short-sleeve knit, cream linen midi skirt, and soft beige shoulder bag for soft summer femininity.",
      "Pair an off-white shirt dress with understated sunglasses and a cream canvas tote for clean weekend ease.",
      "Use an oatmeal lightweight knit tee, airy cotton pants, and an ivory leather tote for breathable city-walk styling."
    ]
  },
  秋: {
    keywords: ["warm", "tactile", "calm", "soft vintage", "coffee tone", "layered but not heavy"],
    tops: [
      "oatmeal knit sweater",
      "cappuccino fine-knit top",
      "cream shirt under knitwear",
      "beige long-sleeve blouse",
      "soft grey wool-blend top",
      "warm ivory turtleneck",
      "light brown cardigan",
      "camel knit polo",
      "off-white cotton shirt",
      "taupe knit pullover"
    ],
    bottoms: [
      "dark blue straight-leg denim",
      "cappuccino trousers",
      "warm beige tailored pants",
      "soft brown relaxed trousers",
      "oatmeal wide-leg pants",
      "stone grey straight pants",
      "cream autumn trousers",
      "taupe cropped trousers",
      "washed denim jeans",
      "beige corduroy trousers"
    ],
    outerwear: [
      "beige trench coat",
      "oatmeal wool-blend jacket",
      "camel short coat",
      "soft brown blazer",
      "warm grey coat",
      "cream cardigan jacket",
      "light suede jacket",
      "taupe shirt jacket"
    ],
    dressesSkirts: [
      "oatmeal knit skirt",
      "cappuccino midi skirt",
      "warm beige straight skirt",
      "soft brown A-line skirt",
      "cream wool-blend skirt",
      "taupe knit dress",
      "ivory shirt dress layered with knitwear"
    ],
    bags: [
      "warm brown tote",
      "cappuccino leather handbag",
      "beige shoulder bag",
      "taupe crossbody bag",
      "soft camel tote",
      "muted brown structured bag"
    ],
    accessories: [
      "gold earrings",
      "slim leather belt",
      "soft scarf",
      "simple watch",
      "low-saturation silk scarf",
      "brown sunglasses"
    ],
    fabrics: ["suede", "knitwear", "wool blend", "soft leather", "denim", "cotton", "corduroy", "brushed cotton"],
    colorPalette: [
      "oatmeal",
      "cappuccino",
      "warm beige",
      "camel",
      "soft brown",
      "taupe",
      "stone grey",
      "cream white",
      "muted denim blue"
    ],
    forbidden:
      "Avoid heavy old-fashioned styling, masculine brown outfit, dramatic retro costume, overly dark autumn colors, strong British academia, heavy boots feeling.",
    compactOutfitLines: [
      "Style her in oatmeal knitwear, dark straight-leg denim, and a warm brown tote for soft autumn daily elegance.",
      "Use a cream shirt layered under cappuccino knitwear with warm beige trousers for a calm tactile autumn look.",
      "Pair a beige trench coat, taupe trousers, and understated leather accessories for refined autumn commuting.",
      "Style her in a warm ivory turtleneck, stone grey straight pants, a soft brown blazer, and a taupe crossbody bag.",
      "Use a light brown cardigan, cream autumn trousers, and a muted brown structured bag for gentle daily warmth.",
      "Pair a camel knit polo with washed denim jeans, a taupe shirt jacket, and brown sunglasses for a relaxed city outfit.",
      "Use an off-white cotton shirt, beige corduroy trousers, a cream cardigan jacket, and a warm brown tote for tactile softness.",
      "Style her in a taupe knit pullover, oatmeal wide-leg pants, and a cappuccino leather handbag for quiet autumn depth.",
      "Pair a warm beige straight skirt with a cream knit top, low-saturation silk scarf, and muted brown bag.",
      "Use a beige long-sleeve blouse, soft brown relaxed trousers, a light suede jacket, and simple watch for refined autumn ease."
    ]
  },
  冬: {
    keywords: ["warm", "composed", "clean", "quiet winter sophistication", "not bulky"],
    tops: [
      "warm ivory turtleneck",
      "oatmeal wool sweater",
      "cream long-sleeve base layer",
      "soft grey knitwear",
      "cappuccino cashmere-blend sweater",
      "beige wool-blend top",
      "winter white shirt under knitwear",
      "taupe ribbed knit",
      "muted brown cardigan",
      "cream high-neck knit"
    ],
    bottoms: [
      "warm grey wool trousers",
      "winter white straight-leg pants",
      "dark blue structured denim",
      "beige wool-blend trousers",
      "muted brown trousers",
      "oatmeal wide-leg pants",
      "soft taupe pants",
      "cream winter trousers",
      "charcoal-soft grey trousers",
      "cappuccino straight pants"
    ],
    outerwear: [
      "cream wool coat",
      "oatmeal long coat",
      "warm grey coat",
      "beige short wool jacket",
      "muted brown coat",
      "taupe structured coat",
      "minimalist down jacket in cream or warm grey",
      "soft camel coat"
    ],
    dressesSkirts: [
      "warm knit dress",
      "oatmeal wool skirt",
      "winter white midi skirt",
      "soft grey knit skirt",
      "muted brown straight skirt",
      "cream wool-blend dress",
      "taupe skirt with knitwear"
    ],
    bags: [
      "warm brown leather tote",
      "grey-beige shoulder bag",
      "cream winter tote",
      "muted brown handbag",
      "taupe structured bag",
      "soft camel bag"
    ],
    accessories: [
      "low-saturation wool scarf",
      "small gold earrings",
      "simple gloves",
      "understated watch",
      "soft beanie if appropriate",
      "minimal leather belt"
    ],
    fabrics: ["wool", "cashmere blend", "knitwear", "suede", "soft leather", "brushed cotton", "structured denim", "light down"],
    colorPalette: [
      "winter white",
      "cream",
      "oatmeal",
      "warm grey",
      "taupe",
      "cappuccino",
      "muted brown",
      "soft camel",
      "charcoal grey"
    ],
    forbidden:
      "Avoid bulky winter styling, black-heavy outfit, harsh cold minimalism, sporty down-jacket look, loud scarf or hat colors, and old-fashioned mature styling.",
    compactOutfitLines: [
      "Style her in a warm ivory turtleneck, wool trousers, and a cream coat for clean winter sophistication.",
      "Use oatmeal knitwear, dark structured denim, and a muted brown bag for composed daily winter warmth.",
      "Pair a warm grey coat with winter white trousers and understated accessories for refined cold-weather elegance.",
      "Style her in a cappuccino cashmere-blend sweater, soft taupe pants, a soft camel coat, and a warm brown leather tote.",
      "Use a cream high-neck knit, charcoal-soft grey trousers, and a grey-beige shoulder bag for clean winter balance.",
      "Pair a winter white shirt under oatmeal wool sweater with beige wool-blend trousers and a taupe structured coat.",
      "Use a muted brown cardigan, cream winter trousers, simple gloves, and a cream winter tote for soft seasonal warmth.",
      "Style her in a taupe ribbed knit, dark blue structured denim, a beige short wool jacket, and a muted brown handbag.",
      "Pair a soft grey knitwear top with oatmeal wide-leg pants, a low-saturation wool scarf, and a warm grey coat.",
      "Use a beige wool-blend top, cappuccino straight pants, a minimalist cream down jacket, and a soft camel bag for restrained cozy styling."
    ]
  }
};

type TeamOutfitSelectionInput = {
  season: TeamSeason;
  shoe: TeamShoe;
  imageType: TeamImageType;
  scenePreference: TeamScenePreference;
  userExtraRequirement?: string;
};

const OUTFIT_LETTER_INDEX: Record<string, number> = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
  G: 6,
  H: 7,
  I: 8,
  J: 9
};

const CLOTHING_REQUIREMENT_KEYWORDS = [
  "白衬衫",
  "牛仔裤",
  "裙子",
  "半裙",
  "连衣裙",
  "大衣",
  "针织",
  "西裤",
  "衬衫",
  "风衣",
  "短袖",
  "亚麻",
  "阔腿裤",
  "直筒裤",
  "托特包",
  "white shirt",
  "denim",
  "jeans",
  "skirt",
  "dress",
  "coat",
  "knitwear",
  "trousers",
  "shirt",
  "trench coat",
  "short-sleeve shirt",
  "linen",
  "wide-leg pants",
  "straight-leg pants",
  "tote bag"
];

const SCENE_OUTFIT_LETTERS: Partial<Record<TeamScenePreference | "对镜穿搭", Record<TeamSeason, string[]>>> = {
  通勤上班: {
    春: ["A", "G", "J"],
    夏: ["A", "C", "G"],
    秋: ["B", "C", "D"],
    冬: ["A", "C", "E"]
  },
  周末城市散步: {
    春: ["D", "E", "H"],
    夏: ["B", "D", "J"],
    秋: ["A", "F", "H"],
    冬: ["B", "D", "H"]
  },
  "精品超市 / 日常采购": {
    春: ["A", "B", "H"],
    夏: ["A", "D", "J"],
    秋: ["A", "E", "J"],
    冬: ["B", "G", "J"]
  },
  旅行酒店: {
    春: ["B", "D", "J"],
    夏: ["B", "F", "I"],
    秋: ["C", "H", "J"],
    冬: ["C", "E", "I"]
  },
  居家衣帽间: {
    春: ["B", "E", "I"],
    夏: ["C", "F", "H"],
    秋: ["B", "D", "I"],
    冬: ["A", "D", "E"]
  },
  对镜穿搭: {
    春: ["B", "E", "I"],
    夏: ["C", "F", "H"],
    秋: ["B", "D", "I"],
    冬: ["A", "D", "E"]
  },
  周末轻采购: {
    春: ["A", "B", "H"],
    夏: ["A", "D", "J"],
    秋: ["A", "E", "J"],
    冬: ["B", "G", "J"]
  },
  窗边阅读: {
    春: ["G", "I", "J"],
    夏: ["E", "G", "H"],
    秋: ["D", "H", "I"],
    冬: ["C", "E", "I"]
  },
  玄关出门: {
    春: ["A", "G", "J"],
    夏: ["A", "C", "G"],
    秋: ["B", "C", "D"],
    冬: ["A", "C", "E"]
  }
};

function hasExplicitClothingRequirement(extraRequirement = "") {
  const text = extraRequirement.toLowerCase();
  return CLOTHING_REQUIREMENT_KEYWORDS.some((keyword) => text.includes(keyword.toLowerCase()));
}

function getTeamShoePreferenceWords(shoe: TeamShoe, season: TeamSeason) {
  if (shoe === "Cloud Dancer 云舞者" || shoe === "Sand Dollar 沙钱白") {
    return ["white", "cream", "beige", "trench", "coat", "light", "denim", "tote", "trousers"];
  }

  if (shoe === "Delphinium Blue 飞燕草蓝") {
    return season === "春" || season === "夏"
      ? ["white", "pale", "denim", "oatmeal", "cream", "fresh", "airy"]
      : ["cream", "light", "soft", "not heavy", "refined"];
  }

  if (shoe === "Silver Romance 银色浪漫") {
    return ["grey", "cream", "white", "urban", "refined", "blazer", "understated"];
  }

  if (shoe === "Aire 微风") {
    return ["linen", "airy", "light", "breathable", "shirt", "tote", "fresh", "not sporty"];
  }

  if (shoe === "Cappuccino 卡布奇诺") {
    return ["knit", "cappuccino", "oatmeal", "coffee", "brown", "warm", "tactile"];
  }

  if (shoe === "Lemon 柠檬") {
    return ["cream", "white", "pale", "denim", "khaki", "fresh", "neutral"];
  }

  if (shoe === "Maple Grove 枫林") {
    return ["warm", "knit", "brown", "beige", "coffee", "autumn", "soft"];
  }

  if (shoe === "Oreo 奥利奥" || shoe === "Panda 熊猫") {
    return ["black", "white", "grey", "beige", "clean", "restrained", "soft"];
  }

  return ["clean", "low-saturation", "refined", "daily", "neutral"];
}

function getTeamScenePreferenceWords(imageType: TeamImageType, scenePreference: TeamScenePreference) {
  const words: string[] = [];

  if (imageType === "对镜穿搭图") {
    words.push("outfit", "shirt", "trousers", "denim", "reference", "proportions");
  }

  if (imageType === "产品上脚图") {
    words.push("trousers", "denim", "shoe", "daily", "clear");
  }

  if (imageType === "生活场景图") {
    words.push("daily", "tote", "comfortable", "real", "polished");
  }

  if (scenePreference === "通勤上班") {
    words.push("commute", "blazer", "trench", "trousers", "polished");
  }

  if (scenePreference === "周末城市散步" || scenePreference === "周末轻采购") {
    words.push("denim", "tote", "relaxed", "weekend", "daily");
  }

  if (scenePreference === "精品超市 / 日常采购") {
    words.push("tote", "bag", "errands", "comfortable", "daily");
  }

  if (scenePreference === "旅行酒店") {
    words.push("coat", "trousers", "organized", "refined", "travel");
  }

  if (scenePreference === "居家衣帽间") {
    words.push("outfit", "shirt", "knitwear", "layering", "reference");
  }

  return words;
}

function getSceneOutfitCandidateIndexes(input: TeamOutfitSelectionInput) {
  const sceneKey = input.imageType === "对镜穿搭图" ? "对镜穿搭" : input.scenePreference;
  const letters = SCENE_OUTFIT_LETTERS[sceneKey]?.[input.season];

  if (!letters?.length) {
    return seasonalOutfitGroups[input.season].compactOutfitLines.map((_, index) => index);
  }

  return letters
    .map((letter) => OUTFIT_LETTER_INDEX[letter])
    .filter((index): index is number => typeof index === "number");
}

export function chooseOutfitLine(input: TeamOutfitSelectionInput) {
  if (hasExplicitClothingRequirement(input.userExtraRequirement)) {
    return "";
  }

  const group = seasonalOutfitGroups[input.season];
  const shoeWords = getTeamShoePreferenceWords(input.shoe, input.season);
  const sceneWords = getTeamScenePreferenceWords(input.imageType, input.scenePreference);
  const words = [...shoeWords, ...sceneWords].map((word) => word.toLowerCase());
  const candidateIndexes = getSceneOutfitCandidateIndexes(input);

  let bestScore = -1;
  const scoredCandidates = candidateIndexes.map((index) => {
    const line = group.compactOutfitLines[index];
    const normalizedLine = line.toLowerCase();
    const score = words.reduce((total, word) => total + (normalizedLine.includes(word) ? 1 : 0), 0);

    if (score > bestScore) bestScore = score;

    return { index, score };
  });

  const bestCandidates = scoredCandidates
    .filter((candidate) => candidate.score === bestScore)
    .map((candidate) => candidate.index);
  const fallbackCandidates = candidateIndexes.length ? candidateIndexes : [0];
  const candidates = bestCandidates.length ? bestCandidates : fallbackCandidates;
  const selectedIndex = candidates[Math.floor(Math.random() * candidates.length)];

  return group.compactOutfitLines[selectedIndex];
}

export function getTeamCompactOutfitLine(input: TeamOutfitSelectionInput) {
  return chooseOutfitLine(input);
}
