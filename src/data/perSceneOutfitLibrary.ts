import type { TeamSeason, TeamShoe } from "../types";

export type PerSceneOutfitSceneKey =
  | "commute"
  | "weekendCityWalk"
  | "cafeExterior"
  | "boutiqueStreet"
  | "flowerShop"
  | "bakeryDessert"
  | "bookstoreMagazine"
  | "premiumErrands"
  | "hotelTravel"
  | "lightSocial"
  | "galleryExhibition"
  | "cityCorner"
  | "mirrorCloset"
  | "entrywayDeparture"
  | "gymCommute"
  | "gymInterior";

export type PerSceneOutfitLine = {
  id: string;
  season: TeamSeason[];
  suitableShoes: TeamShoe[];
  colorMood: string[];
  styleTags: string[];
  compactLine: string;
  forbidden: string[];
};

export type PerSceneOutfitScene = {
  sceneKey: PerSceneOutfitSceneKey;
  sceneName: string;
  outfitCountTarget: 50;
  outfitLines: PerSceneOutfitLine[];
};

type OutfitSeed = {
  season: TeamSeason;
  top: string;
  bottom: string;
  outer: string;
  colorMood: string[];
  styleTags: string[];
  suitableShoes: TeamShoe[];
};

type SceneConfig = {
  sceneName: string;
  context: string;
  bags: string[];
  accessories: string[];
  focusTags: string[];
  shoeFocus: string;
  forbidden: string[];
};

const allShoes: TeamShoe[] = [
  "Cloud Dancer 云舞者",
  "Sand Dollar 沙钱白",
  "Cappuccino 卡布奇诺",
  "Silver Romance 银色浪漫",
  "Aire 微风",
  "Delphinium Blue 飞燕草蓝",
  "Lemon 柠檬",
  "Maple Grove 枫林",
  "Oreo 奥利奥",
  "Panda 熊猫",
  "自定义"
];

const cleanLightShoes: TeamShoe[] = [
  "Cloud Dancer 云舞者",
  "Sand Dollar 沙钱白",
  "Aire 微风",
  "Delphinium Blue 飞燕草蓝",
  "Lemon 柠檬",
  "自定义"
];

const warmTactileShoes: TeamShoe[] = [
  "Cappuccino 卡布奇诺",
  "Maple Grove 枫林",
  "Sand Dollar 沙钱白",
  "Cloud Dancer 云舞者",
  "自定义"
];

const graphicNeutralShoes: TeamShoe[] = [
  "Oreo 奥利奥",
  "Panda 熊猫",
  "Silver Romance 银色浪漫",
  "Cloud Dancer 云舞者",
  "自定义"
];

const activeShoes: TeamShoe[] = [
  "Aire 微风",
  "Cloud Dancer 云舞者",
  "Sand Dollar 沙钱白",
  "Oreo 奥利奥",
  "Panda 熊猫",
  "自定义"
];

const springSeeds: OutfitSeed[] = [
  {
    season: "春",
    top: "white cotton shirt",
    bottom: "ivory straight-leg trousers",
    outer: "light beige trench coat",
    colorMood: ["cream white", "warm beige", "light khaki"],
    styleTags: ["spring", "light layering", "commute"],
    suitableShoes: cleanLightShoes
  },
  {
    season: "春",
    top: "pale blue shirt",
    bottom: "light blue straight-leg denim",
    outer: "cream cropped jacket",
    colorMood: ["pale blue", "cream", "soft denim"],
    styleTags: ["fresh", "denim", "weekend"],
    suitableShoes: ["Delphinium Blue 飞燕草蓝", "Cloud Dancer 云舞者", "Sand Dollar 沙钱白", "Lemon 柠檬", "自定义"]
  },
  {
    season: "春",
    top: "oatmeal lightweight knit top",
    bottom: "beige tapered trousers",
    outer: "pale grey fine-knit cardigan",
    colorMood: ["oatmeal", "beige", "soft grey"],
    styleTags: ["soft neutral", "real wardrobe", "polished"],
    suitableShoes: allShoes
  },
  {
    season: "春",
    top: "cream silk-blend blouse",
    bottom: "warm beige straight skirt",
    outer: "light cotton blazer",
    colorMood: ["cream", "warm beige", "taupe"],
    styleTags: ["skirt", "light social", "feminine"],
    suitableShoes: cleanLightShoes
  },
  {
    season: "春",
    top: "cream polo knit",
    bottom: "dark indigo straight denim",
    outer: "soft olive shirt jacket",
    colorMood: ["cream", "olive", "dark denim"],
    styleTags: ["dark anchor", "city", "grounded"],
    suitableShoes: graphicNeutralShoes
  },
  {
    season: "春",
    top: "white oversized shirt",
    bottom: "stone grey Bermuda shorts",
    outer: "cream linen overshirt",
    colorMood: ["white", "stone grey", "cream"],
    styleTags: ["shorts", "shoe-readable", "spring-summer"],
    suitableShoes: ["Cloud Dancer 云舞者", "Sand Dollar 沙钱白", "Aire 微风", "Oreo 奥利奥", "Panda 熊猫", "自定义"]
  },
  {
    season: "春",
    top: "navy fine-knit top",
    bottom: "soft grey tailored pants",
    outer: "light beige trench coat",
    colorMood: ["navy", "soft grey", "beige"],
    styleTags: ["dark anchor", "mature minimal", "commute"],
    suitableShoes: graphicNeutralShoes
  },
  {
    season: "春",
    top: "ivory sleeveless top",
    bottom: "cream column skirt",
    outer: "soft camel short jacket",
    colorMood: ["ivory", "cream", "camel"],
    styleTags: ["skirt", "quiet feminine", "refined weekend"],
    suitableShoes: warmTactileShoes
  },
  {
    season: "春",
    top: "soft grey short-sleeve knit",
    bottom: "charcoal tailored trousers",
    outer: "white oversized shirt as a light layer",
    colorMood: ["soft grey", "charcoal", "white"],
    styleTags: ["advanced neutral", "structured", "shoe-readable"],
    suitableShoes: graphicNeutralShoes
  },
  {
    season: "春",
    top: "soft linen-blend shirt",
    bottom: "pale khaki wrap skirt",
    outer: "no outer layer",
    colorMood: ["linen beige", "pale khaki", "warm off-white"],
    styleTags: ["skirt", "soft seasonal", "easy"],
    suitableShoes: cleanLightShoes
  },
  {
    season: "春",
    top: "beige short-sleeve cardigan",
    bottom: "light denim ankle-length jeans",
    outer: "cream short jacket",
    colorMood: ["beige", "light denim", "cream"],
    styleTags: ["denim", "casual feminine", "daily"],
    suitableShoes: ["Cloud Dancer 云舞者", "Sand Dollar 沙钱白", "Delphinium Blue 飞燕草蓝", "Lemon 柠檬", "自定义"]
  },
  {
    season: "春",
    top: "dark coffee sleeveless knit",
    bottom: "cream linen-blend trousers",
    outer: "light beige trench coat",
    colorMood: ["dark coffee", "cream", "beige"],
    styleTags: ["dark anchor", "mature", "refined weekend"],
    suitableShoes: warmTactileShoes
  }
];

const summerSeeds: OutfitSeed[] = [
  {
    season: "夏",
    top: "white short-sleeve shirt",
    bottom: "cream linen trousers",
    outer: "no outer layer",
    colorMood: ["cream", "linen beige", "white"],
    styleTags: ["breathable", "summer", "shoe-readable"],
    suitableShoes: cleanLightShoes
  },
  {
    season: "夏",
    top: "black fitted tank under an open white shirt",
    bottom: "white straight midi skirt",
    outer: "no outer layer",
    colorMood: ["black accent", "white", "cream"],
    styleTags: ["skirt", "creator reference", "mature summer"],
    suitableShoes: graphicNeutralShoes
  },
  {
    season: "夏",
    top: "cream fitted T-shirt",
    bottom: "light blue straight denim",
    outer: "white oversized shirt as a light layer",
    colorMood: ["cream", "light denim", "white"],
    styleTags: ["denim", "weekend", "real-life"],
    suitableShoes: cleanLightShoes
  },
  {
    season: "夏",
    top: "ivory sleeveless top",
    bottom: "beige tailored shorts",
    outer: "cream linen overshirt",
    colorMood: ["ivory", "beige", "cream"],
    styleTags: ["shorts", "city summer", "shoe-readable"],
    suitableShoes: ["Cloud Dancer 云舞者", "Sand Dollar 沙钱白", "Aire 微风", "Lemon 柠檬", "自定义"]
  },
  {
    season: "夏",
    top: "dark coffee sleeveless top",
    bottom: "ivory straight-leg pants",
    outer: "no outer layer",
    colorMood: ["dark coffee", "ivory", "warm off-white"],
    styleTags: ["dark anchor", "mature", "simple"],
    suitableShoes: warmTactileShoes
  },
  {
    season: "夏",
    top: "pale blue cotton shirt",
    bottom: "cream linen midi skirt",
    outer: "no outer layer",
    colorMood: ["pale blue", "cream", "white"],
    styleTags: ["skirt", "fresh", "soft color"],
    suitableShoes: ["Delphinium Blue 飞燕草蓝", "Cloud Dancer 云舞者", "Sand Dollar 沙钱白", "Lemon 柠檬", "自定义"]
  },
  {
    season: "夏",
    top: "navy sleeveless knit top",
    bottom: "cream column skirt",
    outer: "no outer layer",
    colorMood: ["navy", "cream", "soft stone"],
    styleTags: ["dark anchor", "quiet social", "skirt"],
    suitableShoes: graphicNeutralShoes
  },
  {
    season: "夏",
    top: "linen shirt",
    bottom: "stone grey Bermuda shorts",
    outer: "no outer layer",
    colorMood: ["linen beige", "stone grey", "taupe"],
    styleTags: ["shorts", "errands", "quiet"],
    suitableShoes: allShoes
  },
  {
    season: "夏",
    top: "soft grey short-sleeve knit",
    bottom: "dark indigo denim",
    outer: "no outer layer",
    colorMood: ["soft grey", "dark denim", "cream"],
    styleTags: ["denim", "dark anchor", "real wardrobe"],
    suitableShoes: graphicNeutralShoes
  },
  {
    season: "夏",
    top: "cream blouse",
    bottom: "soft grey straight skirt",
    outer: "no outer layer",
    colorMood: ["cream", "soft grey", "warm beige"],
    styleTags: ["skirt", "polished", "light social"],
    suitableShoes: ["Silver Romance 银色浪漫", "Cloud Dancer 云舞者", "Sand Dollar 沙钱白", "Panda 熊猫", "自定义"]
  },
  {
    season: "夏",
    top: "graphite clean athletic tee",
    bottom: "black tailored active shorts",
    outer: "cream linen overshirt",
    colorMood: ["graphite", "black", "cream"],
    styleTags: ["active", "shorts", "gym commute"],
    suitableShoes: activeShoes
  },
  {
    season: "夏",
    top: "cream fitted T-shirt",
    bottom: "taupe jogger-style trousers",
    outer: "no outer layer",
    colorMood: ["cream", "taupe", "soft stone"],
    styleTags: ["active casual", "errands", "comfortable"],
    suitableShoes: activeShoes
  },
  {
    season: "夏",
    top: "white oversized shirt",
    bottom: "ivory knee-length shorts",
    outer: "no outer layer",
    colorMood: ["white", "ivory", "cream"],
    styleTags: ["shorts", "clean summer", "shoe-readable"],
    suitableShoes: cleanLightShoes
  },
  {
    season: "夏",
    top: "deep navy lightweight tee",
    bottom: "soft grey summer trousers",
    outer: "no outer layer",
    colorMood: ["navy", "soft grey", "cream"],
    styleTags: ["active minimal", "dark anchor", "city"],
    suitableShoes: graphicNeutralShoes
  }
];

const autumnSeeds: OutfitSeed[] = [
  {
    season: "秋",
    top: "oatmeal knit sweater",
    bottom: "dark blue straight-leg denim",
    outer: "soft camel jacket",
    colorMood: ["oatmeal", "dark denim", "camel"],
    styleTags: ["denim", "autumn", "soft vintage"],
    suitableShoes: warmTactileShoes
  },
  {
    season: "秋",
    top: "cream shirt under cappuccino knitwear",
    bottom: "charcoal tailored trousers",
    outer: "light beige trench coat",
    colorMood: ["cream", "charcoal", "beige"],
    styleTags: ["commute", "dark anchor", "polished"],
    suitableShoes: graphicNeutralShoes
  },
  {
    season: "秋",
    top: "dark coffee fine-knit top",
    bottom: "oatmeal relaxed pants",
    outer: "soft olive shirt jacket",
    colorMood: ["dark coffee", "oatmeal", "olive"],
    styleTags: ["grounded", "weekend", "tactile"],
    suitableShoes: warmTactileShoes
  },
  {
    season: "秋",
    top: "pale blue cotton shirt",
    bottom: "warm beige straight skirt",
    outer: "soft grey wool-blend coat",
    colorMood: ["pale blue", "warm beige", "soft grey"],
    styleTags: ["skirt", "low-saturation color", "refined"],
    suitableShoes: ["Delphinium Blue 飞燕草蓝", "Silver Romance 银色浪漫", "Sand Dollar 沙钱白", "自定义"]
  },
  {
    season: "秋",
    top: "warm ivory fine-knit turtleneck",
    bottom: "soft grey straight pants",
    outer: "camel coat",
    colorMood: ["ivory", "soft grey", "camel"],
    styleTags: ["mature minimal", "warm", "commute"],
    suitableShoes: allShoes
  },
  {
    season: "秋",
    top: "charcoal knit cardigan",
    bottom: "cream wool-blend skirt",
    outer: "light beige trench coat",
    colorMood: ["charcoal", "cream", "beige"],
    styleTags: ["dark anchor", "skirt", "city"],
    suitableShoes: graphicNeutralShoes
  },
  {
    season: "秋",
    top: "white cotton shirt",
    bottom: "beige wide-leg trousers",
    outer: "soft camel jacket",
    colorMood: ["white", "beige", "camel"],
    styleTags: ["classic", "clean commute", "all-day"],
    suitableShoes: cleanLightShoes
  },
  {
    season: "秋",
    top: "navy fine-knit top",
    bottom: "washed dark denim jeans",
    outer: "warm grey coat",
    colorMood: ["navy", "dark denim", "grey"],
    styleTags: ["dark anchor", "weekend", "quiet"],
    suitableShoes: graphicNeutralShoes
  },
  {
    season: "秋",
    top: "cream polo knit",
    bottom: "taupe jogger-style trousers",
    outer: "taupe shirt jacket",
    colorMood: ["cream", "taupe", "soft stone"],
    styleTags: ["active casual", "travel", "comfortable"],
    suitableShoes: activeShoes
  },
  {
    season: "秋",
    top: "soft grey wool-blend top",
    bottom: "pale khaki wrap skirt",
    outer: "light beige trench coat",
    colorMood: ["soft grey", "pale khaki", "beige"],
    styleTags: ["skirt", "soft seasonal", "feminine"],
    suitableShoes: cleanLightShoes
  },
  {
    season: "秋",
    top: "black fine-knit top",
    bottom: "ivory straight-leg pants",
    outer: "muted camel coat",
    colorMood: ["black", "ivory", "camel"],
    styleTags: ["black-white-brown", "light social", "mature"],
    suitableShoes: graphicNeutralShoes
  },
  {
    season: "秋",
    top: "soft linen shirt",
    bottom: "light blue straight denim",
    outer: "muted olive jacket",
    colorMood: ["linen beige", "light denim", "olive"],
    styleTags: ["denim", "casual", "real-life"],
    suitableShoes: allShoes
  }
];

const winterSeeds: OutfitSeed[] = [
  {
    season: "冬",
    top: "warm ivory turtleneck",
    bottom: "warm grey wool trousers",
    outer: "cream wool coat",
    colorMood: ["warm ivory", "warm grey", "cream"],
    styleTags: ["winter", "clean", "commute"],
    suitableShoes: cleanLightShoes
  },
  {
    season: "冬",
    top: "oatmeal wool sweater",
    bottom: "dark blue structured denim",
    outer: "soft camel coat",
    colorMood: ["oatmeal", "dark denim", "camel"],
    styleTags: ["denim", "warm", "real wardrobe"],
    suitableShoes: warmTactileShoes
  },
  {
    season: "冬",
    top: "cream long-sleeve base layer",
    bottom: "charcoal-soft grey trousers",
    outer: "warm grey coat",
    colorMood: ["cream", "charcoal grey", "warm grey"],
    styleTags: ["dark anchor", "structured", "mature"],
    suitableShoes: graphicNeutralShoes
  },
  {
    season: "冬",
    top: "navy wool sweater",
    bottom: "winter white straight-leg pants",
    outer: "grey-beige coat",
    colorMood: ["navy", "winter white", "grey beige"],
    styleTags: ["dark anchor", "winter white", "refined"],
    suitableShoes: graphicNeutralShoes
  },
  {
    season: "冬",
    top: "cappuccino cashmere-blend sweater",
    bottom: "oatmeal wide-leg pants",
    outer: "minimalist cream down jacket",
    colorMood: ["cappuccino", "oatmeal", "cream"],
    styleTags: ["warm neutral", "practical", "comfortable"],
    suitableShoes: warmTactileShoes
  },
  {
    season: "冬",
    top: "charcoal cardigan",
    bottom: "muted brown straight skirt",
    outer: "camel coat",
    colorMood: ["charcoal", "muted brown", "camel"],
    styleTags: ["skirt", "winter feminine", "quiet"],
    suitableShoes: allShoes
  },
  {
    season: "冬",
    top: "winter white shirt under oatmeal knitwear",
    bottom: "soft grey trousers",
    outer: "oatmeal long coat",
    colorMood: ["winter white", "soft grey", "oatmeal"],
    styleTags: ["clean commute", "classic", "winter"],
    suitableShoes: cleanLightShoes
  },
  {
    season: "冬",
    top: "cream high-neck knit",
    bottom: "taupe jogger-style trousers",
    outer: "soft olive padded jacket",
    colorMood: ["cream", "taupe", "soft olive"],
    styleTags: ["active casual", "gym commute", "warm"],
    suitableShoes: activeShoes
  },
  {
    season: "冬",
    top: "black turtleneck",
    bottom: "warm grey wool trousers",
    outer: "cream long coat",
    colorMood: ["black", "warm grey", "cream"],
    styleTags: ["controlled contrast", "city", "structured"],
    suitableShoes: graphicNeutralShoes
  },
  {
    season: "冬",
    top: "muted chocolate knit",
    bottom: "cream winter trousers",
    outer: "beige short wool jacket",
    colorMood: ["chocolate", "cream", "beige"],
    styleTags: ["warm depth", "quiet luxury", "soft"],
    suitableShoes: warmTactileShoes
  },
  {
    season: "冬",
    top: "soft grey knitwear",
    bottom: "black straight trousers",
    outer: "taupe structured coat",
    colorMood: ["soft grey", "black", "taupe"],
    styleTags: ["dark anchor", "urban", "shoe-readable"],
    suitableShoes: graphicNeutralShoes
  },
  {
    season: "冬",
    top: "beige wool-blend top",
    bottom: "muted brown trousers",
    outer: "muted brown coat",
    colorMood: ["beige", "muted brown", "cream"],
    styleTags: ["warm tonal", "mature", "calm"],
    suitableShoes: warmTactileShoes
  }
];

const seedsBySeason: Record<TeamSeason, OutfitSeed[]> = {
  春: springSeeds,
  夏: summerSeeds,
  秋: autumnSeeds,
  冬: winterSeeds
};

const sceneConfigs: Record<PerSceneOutfitSceneKey, SceneConfig> = {
  commute: {
    sceneName: "通勤上班",
    context: "a calm commute or office-transition moment",
    bags: ["a structured warm beige tote", "a soft grey shoulder bag", "a no-logo leather work tote"],
    accessories: ["a simple watch", "minimal gold earrings", "a thin leather belt"],
    focusTags: ["commute", "polished", "shoe-readable"],
    shoeFocus: "clean trouser breaks and visible sneakers for all-day movement",
    forbidden: ["stiff formal suit", "corporate stock photo", "high heels energy"]
  },
  weekendCityWalk: {
    sceneName: "周末城市散步",
    context: "a relaxed weekend city walk with tasteful daily ease",
    bags: ["a cream canvas tote", "a taupe crossbody bag", "a soft beige shoulder bag"],
    accessories: ["understated sunglasses", "small gold earrings", "a simple watch"],
    focusTags: ["weekend", "city walk", "relaxed"],
    shoeFocus: "natural steps and readable shoe-ground contact",
    forbidden: ["tourist styling", "streetwear heaviness", "influencer street pose"]
  },
  cafeExterior: {
    sceneName: "咖啡店外",
    context: "a quiet cafe exterior or outdoor seat before a city walk",
    bags: ["a small warm beige shoulder bag", "a light taupe handbag", "a natural canvas tote"],
    accessories: ["a paper coffee cup", "minimal gold earrings", "a soft hair clip"],
    focusTags: ["cafe", "weekend", "soft social"],
    shoeFocus: "easy lower-body styling while holding coffee or standing near a cafe wall",
    forbidden: ["brunch influencer mood", "sweet cafe pose", "loud latte art props"]
  },
  boutiqueStreet: {
    sceneName: "精品店街区",
    context: "a refined boutique street or quiet shopping walk",
    bags: ["a restrained leather shoulder bag", "a soft camel tote", "a cream no-logo handbag"],
    accessories: ["understated sunglasses", "a thin belt", "small gold earrings"],
    focusTags: ["boutique street", "polished", "shopping walk"],
    shoeFocus: "clean outfit proportions and tasteful sneaker styling",
    forbidden: ["luxury logo showing off", "fashion blogger pose", "over-styled shopping bags"]
  },
  flowerShop: {
    sceneName: "花店",
    context: "a warm flower shop or small bouquet pickup moment",
    bags: ["a cream tote beside a small bouquet", "a soft beige shoulder bag", "a natural canvas tote"],
    accessories: ["a small bouquet", "a simple watch", "minimal gold earrings"],
    focusTags: ["flower shop", "warm daily", "soft feminine"],
    shoeFocus: "gentle daily movement without making flowers overpower the shoes",
    forbidden: ["romantic cliche", "oversized flower prop", "bright floral overload"]
  },
  bakeryDessert: {
    sceneName: "面包甜品店",
    context: "a quiet bakery or dessert shop return-home moment",
    bags: ["a bakery paper bag", "a light taupe handbag", "a cream canvas tote"],
    accessories: ["a small paper bag", "simple watch", "understated sunglasses"],
    focusTags: ["bakery", "warm daily", "errands"],
    shoeFocus: "natural walking or standing with the shoes clearly usable for errands",
    forbidden: ["brunch cliche", "cute dessert overload", "overly sweet styling"]
  },
  bookstoreMagazine: {
    sceneName: "书店 / 杂志",
    context: "a calm bookstore, magazine rack, or window-side reading transition",
    bags: ["a soft beige tote with a book", "a pale grey shoulder bag", "a taupe handbag"],
    accessories: ["a book or magazine", "minimal earrings", "a small hair clip"],
    focusTags: ["bookstore", "quiet", "intellectual daily"],
    shoeFocus: "relaxed stance or seated posture with readable shoes",
    forbidden: ["academic costume", "library stock photo", "messy stacks of books"]
  },
  premiumErrands: {
    sceneName: "精品超市 / 日常采购",
    context: "a refined grocery, bakery corner, flower shop, or calm daily errand",
    bags: ["a premium paper grocery bag", "a cream tote", "a soft brown shoulder bag"],
    accessories: ["fresh produce in a paper bag", "a small bouquet", "a simple watch"],
    focusTags: ["premium errands", "real life", "warm daily"],
    shoeFocus: "comfortable city movement with visible sneakers and natural trouser hems",
    forbidden: ["supermarket clutter", "cheap stock shopping pose", "bright packaging"]
  },
  hotelTravel: {
    sceneName: "旅行酒店",
    context: "a calm hotel room, wardrobe mirror, doorway, or suitcase corner",
    bags: ["a travel-ready taupe tote", "a soft beige handbag", "a warm brown travel tote"],
    accessories: ["a neatly placed suitcase", "a silk scarf", "a simple watch"],
    focusTags: ["hotel travel", "organized", "quiet luxury"],
    shoeFocus: "travel-ready comfort and clear shoe visibility without tourist energy",
    forbidden: ["cheap hotel selfie", "messy luggage", "flashy hotel branding"]
  },
  lightSocial: {
    sceneName: "朋友小聚",
    context: "a light social lunch, gallery cafe, or quiet friend gathering",
    bags: ["a small taupe handbag", "a restrained black shoulder bag", "a soft beige clutch-like bag"],
    accessories: ["minimal gold earrings", "a silk scarf", "a slim necklace"],
    focusTags: ["light social", "mature", "polished but relaxed"],
    shoeFocus: "sneakers styled as a refined alternative for semi-social moments",
    forbidden: ["nightlife", "socialite styling", "overly formal dinner look"]
  },
  galleryExhibition: {
    sceneName: "画廊 / 展览",
    context: "a quiet gallery, exhibition hallway, or light stone cultural space",
    bags: ["a structured black shoulder bag", "a soft grey handbag", "a taupe crossbody bag"],
    accessories: ["understated sunglasses", "small gold earrings", "a slim watch"],
    focusTags: ["gallery", "culture", "minimal"],
    shoeFocus: "calm negative space and clean lower-body silhouette",
    forbidden: ["art-party styling", "cold museum stock photo", "exaggerated black outfit"]
  },
  cityCorner: {
    sceneName: "城市街角",
    context: "a quiet city corner, pale wall, crosswalk edge, or stone sidewalk",
    bags: ["a no-logo leather tote", "a cream canvas tote", "a taupe shoulder bag"],
    accessories: ["a simple watch", "small gold earrings", "a folded magazine"],
    focusTags: ["city corner", "daily walk", "shoe-readable"],
    shoeFocus: "stable natural stance and believable foot placement on city pavement",
    forbidden: ["busy street clutter", "wide-angle street style", "tourist snapshot"]
  },
  mirrorCloset: {
    sceneName: "对镜 / 衣帽间",
    context: "a quiet wardrobe, bedroom mirror, or getting-ready corner",
    bags: ["a cream tote placed naturally", "a small beige shoulder bag", "a warm brown handbag"],
    accessories: ["a natural phone grip", "a simple watch", "a thin belt"],
    focusTags: ["mirror", "outfit relationship", "trouser-readability"],
    shoeFocus: "face-hidden mirror composition with shoes and trouser hems clearly visible",
    forbidden: ["beauty selfie", "mirror leg stretching", "phone blocking shoes"]
  },
  entrywayDeparture: {
    sceneName: "玄关出门",
    context: "a warm neutral entryway or doorway before leaving home",
    bags: ["a daily cream tote", "a soft beige shoulder bag", "a natural canvas tote"],
    accessories: ["keys in hand", "a light scarf", "a simple watch"],
    focusTags: ["entryway", "leaving home", "daily order"],
    shoeFocus: "the moment before departure with the shoes fully ready for the day",
    forbidden: ["messy entryway", "shoe rack clutter", "staged real-estate interior"]
  },
  gymCommute: {
    sceneName: "去运动的路上",
    context: "a polished city-to-gym transition, gym entrance, or hotel gym route",
    bags: ["a minimal gym tote", "a graphite soft tote", "a cream canvas gym bag"],
    accessories: ["a water bottle", "a small towel", "a simple watch"],
    focusTags: ["active commute", "light movement", "shoe-readable"],
    shoeFocus: "premium active-ready styling without turning the sneaker into a running shoe",
    forbidden: ["sports brand campaign", "professional athlete styling", "gym-bro mood"]
  },
  gymInterior: {
    sceneName: "健身房内",
    context: "a clean modern gym, Pilates corner, or quiet stretching area",
    bags: ["a folded towel nearby", "a neutral water bottle", "a minimal gym tote on a bench"],
    accessories: ["a simple watch", "a water bottle", "a small towel"],
    focusTags: ["gym interior", "light strength", "active"],
    shoeFocus: "stable foot placement, safe light movement, and accurate sneaker shape",
    forbidden: ["hardcore training", "sweaty sports ad", "neon gym lighting"]
  }
};

const gymTopsBySeason: Record<TeamSeason, string[]> = {
  春: ["cream long-sleeve active top", "soft grey breathable knit tee", "white cotton training tee"],
  夏: ["white short-sleeve athletic tee", "graphite clean active tee", "cream fitted breathable T-shirt"],
  秋: ["oatmeal light active pullover", "taupe zip training top", "cream polo knit with active ease"],
  冬: ["cream high-neck active knit", "soft grey lightweight sweatshirt", "taupe zip jacket over a base layer"]
};

const gymBottomsBySeason: Record<TeamSeason, string[]> = {
  春: ["taupe jogger-style trousers", "soft grey straight active pants", "cream ankle-length active trousers"],
  夏: ["black tailored active shorts", "stone grey Bermuda active shorts", "taupe lightweight jogger trousers"],
  秋: ["warm grey active trousers", "taupe jogger-style trousers", "dark grey straight active pants"],
  冬: ["charcoal straight active pants", "taupe warm-up trousers", "soft grey jogger-style trousers"]
};

const gymLayersBySeason: Record<TeamSeason, string[]> = {
  春: ["cream zip cardigan", "light beige shirt jacket", "no outer layer"],
  夏: ["cream linen overshirt", "no outer layer", "lightweight white overshirt"],
  秋: ["taupe zip jacket", "soft olive light jacket", "oatmeal cardigan jacket"],
  冬: ["soft olive padded jacket", "warm grey zip jacket", "cream lightweight down vest"]
};

function adaptSeedForGymScene(seed: OutfitSeed, index: number): OutfitSeed {
  return {
    ...seed,
    top: gymTopsBySeason[seed.season][index % gymTopsBySeason[seed.season].length],
    bottom: gymBottomsBySeason[seed.season][index % gymBottomsBySeason[seed.season].length],
    outer: gymLayersBySeason[seed.season][index % gymLayersBySeason[seed.season].length],
    suitableShoes: activeShoes,
    styleTags: [...seed.styleTags.filter((tag) => tag !== "skirt"), "active", "gym", "shoe-readable"]
  };
}

function formatCompactLine(config: SceneConfig, seed: OutfitSeed, index: number) {
  const bag = config.bags[index % config.bags.length];
  const accessory = config.accessories[(index + 1) % config.accessories.length];
  const outer = seed.outer === "no outer layer" ? "" : `, ${seed.outer}`;
  const accessoryPhrase = accessory ? ` with ${accessory}` : "";

  return `Style her in ${seed.top}, ${seed.bottom}${outer}, and ${bag}${accessoryPhrase} for ${config.context}. Keep ${config.shoeFocus}.`;
}

function createSceneOutfits(sceneKey: PerSceneOutfitSceneKey, config: SceneConfig): PerSceneOutfitScene {
  const seasonalSeeds = [
    ...seedsBySeason.春,
    ...seedsBySeason.夏,
    ...seedsBySeason.秋,
    ...seedsBySeason.冬
  ];

  const outfitLines = seasonalSeeds.map((baseSeed, index) => {
    const seed =
      sceneKey === "gymCommute" || sceneKey === "gymInterior"
        ? adaptSeedForGymScene(baseSeed, index)
        : baseSeed;

    return {
      id: `${sceneKey}-${String(index + 1).padStart(2, "0")}`,
      season: [seed.season],
      suitableShoes: seed.suitableShoes,
      colorMood: seed.colorMood,
      styleTags: [...new Set([...seed.styleTags, ...config.focusTags])],
      compactLine: formatCompactLine(config, seed, index),
      forbidden: config.forbidden
    };
  });

  return {
    sceneKey,
    sceneName: config.sceneName,
    outfitCountTarget: 50,
    outfitLines
  };
}

export const perSceneOutfitLibrary: Record<PerSceneOutfitSceneKey, PerSceneOutfitScene> = Object.fromEntries(
  (Object.entries(sceneConfigs) as Array<[PerSceneOutfitSceneKey, SceneConfig]>).map(([sceneKey, config]) => [
    sceneKey,
    createSceneOutfits(sceneKey, config)
  ])
) as Record<PerSceneOutfitSceneKey, PerSceneOutfitScene>;

export const PER_SCENE_OUTFIT_TOTAL_COUNT = Object.values(perSceneOutfitLibrary).reduce(
  (total, scene) => total + scene.outfitLines.length,
  0
);
