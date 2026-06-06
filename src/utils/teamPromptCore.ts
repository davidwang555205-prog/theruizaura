import type {
  TeamImageType,
  TeamHumanPoseCategory,
  TeamPromptMode,
  TeamPromptParams,
  TeamPromptOutput,
  TeamPoseType,
  TeamScenePreference,
  TeamSeason,
  TeamShoe
} from "../types";
import { type StandardSceneKey } from "../data/outfitDiversityRules";
import { hasUserSpecifiedClothingRequirement } from "./outfitLibraryFilters";
import { buildStructuredPrompt } from "./buildStructuredPrompt";
import { chooseActionLine } from "./chooseActionLine";
import { chooseCameraLookLine } from "./chooseCameraLookLine";
import { chooseChinaUrbanStreetLine } from "./chooseChinaUrbanStreetLine";
import { chooseSeasonCityVisualContext } from "./chooseSeasonCityVisualContext";
import { accessoryShoeVisibilityRuleLine } from "../data/accessoryProfiles";
import { chooseHandheldObjectLines } from "./chooseHandheldObjectLines";
import { chooseHumanRealismLines } from "./chooseHumanRealismLines";
import { chooseOutfitByGarmentType } from "./chooseOutfitByGarmentType";
import { choosePerSceneOutfitLine } from "./choosePerSceneOutfitLine";
import { chooseSceneAccessoryLine } from "./chooseSceneAccessoryLine";
import { cleanFinalPrompt, dedupePromptLines } from "./promptOptimizer";
import { detectImageCountOrSeriesIntent } from "./detectImageCountOrSeriesIntent";
import { selectCityProfileForScene } from "./selectCityProfileForScene";
import { sensitiveWordReducer } from "./sensitiveWordReducer";
import { sanitizeUserExtraRequirementForSingleHandheldObject } from "./chooseSinglePrimaryHandheldObject";
import { promptVocabularyReplacer } from "./promptVocabularyReplacer";
import { normalizeAccessoryInOutfitLine } from "./normalizeAccessoryInOutfitLine";

export const TEAM_PROMPT_MODE: TeamPromptMode = "standard";

const TEAM_SHOE_KEYWORDS = [
  "鞋子",
  "鞋",
  "样鞋",
  "产品",
  "鞋带",
  "鞋舌",
  "鞋底",
  "鞋面",
  "鞋头",
  "鞋型",
  "德训鞋",
  "单鞋",
  "双鞋",
  "鞋跟",
  "上脚",
  "sneaker",
  "sneakers",
  "shoe",
  "shoes",
  "lace",
  "laces",
  "product",
  "outsole",
  "sole",
  "tongue",
  "upper",
  "toe box"
];

const brandMoodLine =
  "Create a premium THERUIZ AURA Quiet Warm Luxury image: cream-white, warm beige, soft stone, natural light, low saturation, refined daily elegance, believable comfort.";

const customerFeelingLine =
  "Express all-day ease, comfort without carelessness, clean composure, taste, and quiet put-together confidence.";

const modelLine25to40 =
  "Use one believable Asian or subtle Asian mixed woman, 25–40, with natural dark hair, clean makeup, real skin texture, realistic proportions, and calm presence.";

const modelLine30to45 =
  "Use one believable Asian or subtle Asian mixed woman, 30–45, natural dark hair, clean makeup, real skin texture, realistic proportions, and calm presence.";

const gazeLine =
  "Use a natural gaze for the task or outfit record, never a forced direct stare.";

const actionLine =
  "Use one simple daily action: slow walk, coffee, tote, flowers, book, or storefront pause.";

const mirrorGazeActionLine =
  "Use a natural mirror outfit pose with the phone hiding or cropping the face, realistic mirror proportions, one foot slightly forward, relaxed shoulders, and natural leg length.";

const gymActionLine =
  "Use a calm premium-gym action such as holding a water bottle, adjusting a gym tote, pausing near equipment, or lightly holding a dumbbell, with realistic proportions.";

const bodyProportionLine =
  "Keep body scale, leg length, hand size, foot scale, and shoe-to-leg relationship realistic.";

const nonProductShoeAccuracyLine =
  "If the THERUIZ AURA sneaker appears in this non-product atmosphere image, keep it subtle and secondary. Preserve its real color, material texture, and recognizable shape, but do not turn the image into a direct product shot.";

const uploadedSneakerAccuracyLine =
  "Use uploaded sneaker reference as strict source: low-cut German trainer silhouette, rounded toe box, slim outsole, panels, tongue, stitching, material, color, and proportions.";

const selectedSneakerAccuracyLine =
  "Preserve the selected THERUIZ AURA German trainer: low-cut silhouette, rounded toe box, slim outsole, panels, tongue, stitching, material, color, and proportions.";

const shoeVisibilityLine =
  "Keep at least one sneaker fully visible from toe to heel, with the second clearly readable.";

const shoeClippingLine =
  "Keep clean separation between ankle, sock, trouser hem or skirt edge, shoe collar, tongue, laces, floor, and props; nothing should merge into the shoe.";

const lacesLine =
  "Keep laces naturally tied, with readable loops, lace ends, eyelets, and tongue.";

const TEAM_SEASON_LIGHT: Record<TeamSeason, string> = {
  春: "soft spring daylight with airy brightness and gentle shadows",
  夏: "summer natural light with warm-neutral brightness, soft street shadows, and no dark cinematic mood",
  秋: "warm muted autumn daylight with tactile shadows and calm seasonal depth",
  冬: "soft winter light with quiet shadows, warm-neutral clarity, and restrained brightness"
};

const TEAM_ATMOSPHERE_SEASON: Record<TeamSeason, string> = {
  春: "Use soft spring daylight, airy textures, pale neutrals, and a fresh but quiet atmosphere.",
  夏: "Use breathable summer light, linen texture, warm off-white tones, and a clean airy mood.",
  秋: "Use warm muted daylight, tactile textures, oatmeal, beige, soft brown tones, and calm seasonal warmth.",
  冬: "Use soft winter light, warm neutral layers, cream, warm grey, quiet shadows, and restrained cozy atmosphere."
};

const TEAM_SCENE_TEXT: Record<Exclude<TeamScenePreference, "自动匹配">, string> = {
  通勤上班:
    "Use a calm commute setting such as an office entrance, elevator lobby, parking-to-office walkway, or quiet business district. The image should feel polished but relaxed.",
  周末城市散步:
    "Use a quiet city walk setting such as a calm street, cafe exterior, gallery district, bookstore street, or light stone wall. The image should feel relaxed, tasteful, and mature.",
  "精品超市 / 日常采购":
    "Use a refined daily errands setting such as a premium grocery, bakery corner, flower shop, or calm neighborhood store. The mood should feel real, warm, and tasteful.",
  旅行酒店:
    "Use a calm hotel room, hotel doorway, wardrobe mirror, suitcase corner, or soft hotel window light. The scene should feel organized, quiet, and refined, not touristy or cheap.",
  居家衣帽间:
    "Use a quiet wardrobe, getting-ready space, mirror, or getting-ready corner. Focus on outfit relationship, daily ease, and refined personal style.",
  玄关出门:
    "Use a warm neutral entryway with keys, tote bag, coat, doorway light, or subtle daily objects. The mood should express leaving home easily and tastefully.",
  窗边阅读:
    "Use a soft window-side reading corner with a book, cup, linen curtain, chair, or sofa edge. The mood should feel calm, private, and warm.",
  材质工作台:
    "Use a refined material table with leather swatches, suede samples, shoelaces, color cards, product notes, or hands arranging materials.",
  拍摄花絮:
    "Use a quiet behind-the-scenes shooting moment with styling table, camera monitor, light stand edge, paper shot list, wardrobe pieces, or hands adjusting details.",
  周末轻采购:
    "Use a refined weekend errands atmosphere with flowers, bakery paper bags, produce, coffee beans, tote bags, or a simple kitchen/table surface. The mood should feel like real life made beautiful through order, restraint, and good taste.",
  健身房内:
    "Use a clean premium gym or boutique fitness space with muted equipment, warm grey flooring, controlled lighting, believable training space, and no crowded sports-brand atmosphere.",
  去运动的路上:
    "Use a calm city-to-gym transition setting such as a gym entrance, clean sidewalk, parking-to-gym walkway, hotel gym route, or quiet urban movement path. The mood should feel polished, practical, and ready for light activity."
};

const SHOE_STYLE_LINES: Record<TeamShoe, string> = {
  "Cloud Dancer 云舞者":
    "Classic clean light-tone foundation for white shirts, beige trousers, soft denim, and refined daily styling.",
  "Sand Dollar 沙钱白":
    "Classic clean light-tone foundation for white shirts, beige trousers, soft denim, and refined daily styling.",
  "Delphinium Blue 飞燕草蓝":
    "Low-saturation airy blue for white shirts, pale denim, oatmeal knitwear, and fresh spring-summer styling.",
  "Silver Romance 银色浪漫":
    "Soft moonlit metallic accent for warm grey, cream white, and refined urban styling; keep away from chrome or cheap shine.",
  "Aire 微风":
    "Light breathable spring-summer feeling for linen, airy shirts, and light trousers; keep away from sporty running-shoe styling.",
  "Cappuccino 卡布奇诺":
    "Warm coffee suede mood for knitwear, oatmeal, beige, and soft autumn-winter layers; keep away from masculine or heavy styling.",
  "Lemon 柠檬":
    "Soft butter-yellow freshness for cream white, pale denim, and clean neutral styling; keep away from childish yellow.",
  "Maple Grove 枫林":
    "Warm muted maple tone for soft knitwear, beige-brown layers, and gentle autumn styling; keep away from heavy masculine styling.",
  "Oreo 奥利奥":
    "Clean black-white balance for black, white, grey, beige, and restrained daily styling; keep away from streetwear or sporty energy.",
  "Panda 熊猫":
    "Clean black-white balance for black, white, grey, beige, and restrained daily styling; keep away from streetwear or sporty energy.",
  自定义: "Use THERUIZ AURA's clean, low-saturation, refined daily styling system."
};

function shouldUsePeopleStyling(imageType: TeamImageType) {
  return imageType === "产品上脚图" || imageType === "对镜穿搭图" || imageType === "生活场景图";
}

function teamExtraMentionsShoe(extraRequirement: string) {
  const text = extraRequirement.toLowerCase();
  return TEAM_SHOE_KEYWORDS.some((keyword) => text.includes(keyword.toLowerCase()));
}

function resolveTeamHasShoe(params: TeamPromptParams) {
  if (
    params.imageType === "产品上脚图" ||
    params.imageType === "对镜穿搭图" ||
    params.imageType === "生活场景图" ||
    params.imageType === "产品静物图"
  ) {
    return true;
  }

  return teamExtraMentionsShoe(params.extraRequirement);
}

function getTeamAutoScene(imageType: TeamImageType): Exclude<TeamScenePreference, "自动匹配"> {
  if (imageType === "产品上脚图") return "通勤上班";
  if (imageType === "对镜穿搭图") return "居家衣帽间";
  if (imageType === "生活场景图") return "精品超市 / 日常采购";
  if (imageType === "非产品氛围图") return "玄关出门";
  if (imageType === "产品静物图") return "材质工作台";
  return "材质工作台";
}

function resolveTeamScenePreference(params: TeamPromptParams) {
  return params.scenePreference === "自动匹配"
    ? getTeamAutoScene(params.imageType)
    : params.scenePreference;
}

function resolveSceneKey(params: TeamPromptParams, resolvedScene: Exclude<TeamScenePreference, "自动匹配">): StandardSceneKey {
  const text = `${resolvedScene} ${params.extraRequirement}`.toLowerCase();

  if (params.imageType === "产品静物图") return "stillLife";
  if (params.imageType === "拍摄花絮 / 材质图" || resolvedScene === "材质工作台" || resolvedScene === "拍摄花絮") {
    return "materialTable";
  }
  if (params.imageType === "对镜穿搭图") return resolvedScene === "旅行酒店" ? "hotelTravel" : "mirrorCloset";
  if (resolvedScene === "健身房内" || /gyminterior|健身房内|premium gym/.test(text)) return "gymInterior";
  if (resolvedScene === "去运动的路上" || /gymcommute|去运动|健身房路上/.test(text)) return "gymCommute";
  if (/cafeexterior|咖啡|cafe|café/.test(text)) return "cafeExterior";
  if (/bookstoremagazine|书店|杂志|bookstore|magazine/.test(text)) return "bookstoreMagazine";
  if (/flowershop|花店|鲜花|flower/.test(text)) return "flowerShop";
  if (/bakerydessert|面包|烘焙|bakery|dessert/.test(text)) return "bakeryDessert";
  if (/boutique|买手店|精品店/.test(text)) return "boutiqueStreet";
  if (resolvedScene === "精品超市 / 日常采购" || /premiumerrands|超市|采购|grocery|errands/.test(text)) return "premiumErrands";
  if (resolvedScene === "周末城市散步") return "weekendCityWalk";
  if (resolvedScene === "通勤上班") return "commute";
  if (resolvedScene === "旅行酒店") return "hotelTravel";
  if (resolvedScene === "玄关出门") return "entrywayDeparture";
  if (resolvedScene === "周末轻采购") return "bakeryDessert";
  if (resolvedScene === "窗边阅读") return "bookstoreMagazine";
  return "cityCorner";
}

function getImageTypeLine(params: TeamPromptParams, sceneKey: StandardSceneKey) {
  if (params.imageType === "产品上脚图") {
    return "Generate a refined on-foot lifestyle image with a safe standing pose or small natural walking step. The sneakers must be complete, clear, structurally accurate, and separate from trouser hems.";
  }
  if (params.imageType === "对镜穿搭图") {
    return "Generate a refined mirror outfit image with the face hidden by the phone or naturally cropped. Use a 3/4 or full-body mirror composition with clear sneakers, natural proportions, believable phone-hand structure, and clear trouser-shoe relationship.";
  }
  if (sceneKey === "gymInterior" || sceneKey === "gymCommute") {
    return "Generate a refined premium-gym active-lifestyle image for THERUIZ AURA, focused on light movement, polished daily transition, and comfort rather than a sportswear campaign.";
  }
  if (params.imageType === "生活场景图") {
    return "Generate a believable lifestyle image of a refined urban woman wearing THERUIZ AURA sneakers in real daily movement.";
  }
  if (params.imageType === "产品静物图") {
    return "Generate premium still-life product photography with the selected THERUIZ AURA sneaker as the main subject; keep material, laces, tongue, outsole, and product scale clearly readable.";
  }
  if (params.imageType === "拍摄花絮 / 材质图") {
    return "Generate a refined behind-the-scenes or material storytelling image with leather swatches, suede samples, shoelaces, color cards, care brush, product notes, shooting table, or hands arranging materials.";
  }
  return "Generate a non-product atmospheric THERUIZ AURA image. The product does not need to be the main subject; express quiet order, warm restraint, daily elegance, calm negative space, and refined lifestyle atmosphere.";
}

function getModelLine(params: TeamPromptParams, resolvedScene: Exclude<TeamScenePreference, "自动匹配">) {
  if (!shouldUsePeopleStyling(params.imageType)) return "";
  const mature =
    resolvedScene === "通勤上班" ||
    resolvedScene === "精品超市 / 日常采购" ||
    resolvedScene === "旅行酒店" ||
    params.imageType === "生活场景图";

  return mature ? modelLine30to45 : modelLine25to40;
}

function getSceneText(params: TeamPromptParams, resolvedScene: Exclude<TeamScenePreference, "自动匹配">, sceneKey: StandardSceneKey) {
  if (params.imageType === "产品静物图") {
    return "Use a real still-life setup with believable surface texture, natural object contact, soft shadows, restrained props, clear product scale, and open shoe visibility.";
  }
  if (params.imageType === "产品上脚图" && resolvedScene === "窗边阅读") {
    return "Use a window-side lifestyle on-foot scene with soft natural light and a calm interior mood. Keep the sneakers clear, complete, and structurally accurate.";
  }
  if (params.imageType === "产品上脚图" && resolvedScene === "材质工作台") {
    return "Use a material storytelling scene with the sneaker clearly present, keeping it wearable and readable rather than turning the image into a pure still life.";
  }
  if (params.imageType === "对镜穿搭图" && resolvedScene === "拍摄花絮") {
    return "Use a mirror outfit record in a quiet getting-ready setting, not a studio behind-the-scenes image. Keep the outfit and sneakers clear.";
  }
  if (params.imageType === "非产品氛围图" && resolvedScene === "通勤上班") {
    return "Use commute-related atmosphere such as a tote bag, keys, coat, entryway, calm worktable, or soft office-transition details. Do not make it a direct on-foot product image.";
  }
  if (params.imageType === "拍摄花絮 / 材质图" && resolvedScene === "窗边阅读") {
    return "Use a quiet material table near soft window light, with tactile samples and refined working details. Do not make a reading portrait the main image.";
  }
  if (params.imageType === "生活场景图" && resolvedScene === "材质工作台") {
    return "Use a refined lifestyle scene with subtle material storytelling details, keeping the woman's daily life and the brand atmosphere more important than a pure worktable still life.";
  }
  if (params.imageType === "生活场景图" && resolvedScene === "拍摄花絮") {
    return "Use a natural lifestyle image with a subtle behind-the-scenes feeling, not a technical studio setup.";
  }
  if (sceneKey === "bookstoreMagazine") {
    return "Use a calm bookstore or magazine-reading street corner with books, magazine texture, soft window light, and restrained cultural detail that feels real rather than staged.";
  }
  if (sceneKey === "cafeExterior") {
    return "Use a restrained cafe exterior or sidewalk storefront moment with soft reflections, low-noise signage, and realistic daily city depth.";
  }

  return TEAM_SCENE_TEXT[resolvedScene];
}

function getSceneRealismLine(input: {
  params: TeamPromptParams;
  sceneKey: StandardSceneKey;
  hasCityStreetLine: boolean;
}) {
  if (input.params.imageType === "产品静物图" || input.sceneKey === "stillLife") {
    return "Use a real still-life photography setup with believable surface texture, natural object contact, soft shadows, restrained props, clear product scale, and no prop covering the shoe.";
  }
  if (input.sceneKey === "gymInterior") {
    return "Use a clean premium gym or boutique fitness space with muted equipment, warm grey flooring, controlled light, believable training space, and calm brand atmosphere.";
  }
  if (input.params.imageType === "对镜穿搭图" || input.sceneKey === "mirrorCloset") {
    return "Use a believable real room or mirror space with natural depth, grounded floor contact, soft light, practical object placement, and straight mirror perspective.";
  }
  if (input.params.imageType === "拍摄花絮 / 材质图" || input.sceneKey === "materialTable") {
    return "Use a tactile material table with realistic surface texture, natural object contact, soft shadows, restrained tools, and a quiet development mood.";
  }
  if (input.hasCityStreetLine && ["cafeExterior", "flowerShop", "bakeryDessert", "bookstoreMagazine", "premiumErrands"].includes(input.sceneKey)) {
    return "Keep the storefront restrained: clean reflections, subtle interior depth, low-noise signage, and unreadable brand text.";
  }
  if (input.hasCityStreetLine) {
    return "Keep the street believable and low-noise: realistic sidewalk texture, restrained storefront depth, soft shadows, subtle background life, and open shoe visibility.";
  }

  return "Use a believable real daily space with natural depth, grounded floor contact, soft light, practical object placement, restrained props, and no staged AI-set feeling.";
}

function getSneakerAccuracyLine(params: TeamPromptParams, hasShoe: boolean) {
  if (!hasShoe) return "";
  if (params.imageType === "非产品氛围图") return nonProductShoeAccuracyLine;
  if (params.shoe === "自定义" && !params.customShoe.trim()) return selectedSneakerAccuracyLine;
  return uploadedSneakerAccuracyLine;
}

function getShoeVisibilityLine(params: TeamPromptParams, hasShoe: boolean) {
  if (!hasShoe) return "";
  if (params.imageType === "非产品氛围图") {
    return "The shoe may appear only as a subtle partial object or background detail, not as the main product subject; do not force full on-foot display.";
  }
  if (params.imageType === "拍摄花絮 / 材质图") {
    return "If the sneaker appears in the material or behind-the-scenes image, keep the relevant shoe part readable while allowing materials and working details to remain important.";
  }
  return shoeVisibilityLine;
}

function getShoeClippingLine(params: TeamPromptParams, hasShoe: boolean) {
  if (!hasShoe || params.imageType === "非产品氛围图") return "";
  return shoeClippingLine;
}

function getLacesLine(params: TeamPromptParams, hasShoe: boolean) {
  if (!hasShoe || params.imageType === "非产品氛围图") return "";
  return lacesLine;
}

function getShoeStyleLine(params: TeamPromptParams, hasShoe: boolean) {
  if (!hasShoe) return "";
  if (params.imageType === "非产品氛围图") return "";
  return params.customShoe.trim() ? "Use THERUIZ AURA's clean, low-saturation, refined daily styling system." : SHOE_STYLE_LINES[params.shoe];
}

function getNegativeLine(input: {
  params: TeamPromptParams;
  hasShoe: boolean;
  cityBoundaryPhrases: string[];
  sceneKey: StandardSceneKey;
  extraPhrases?: string[];
}) {
  const phrases = input.hasShoe
    ? [
        "non-Asian models",
        "influencer posing",
        "AI beige-template styling",
        "body-focused posing",
        "distorted body",
        "stiff hands",
        "fake scenery or signage",
        "loud logos",
        "messy background",
        "plastic skin",
        "sneaker deformation",
        "chunky or running-shoe sole",
        "shoe clipping",
        "cropped shoes",
        "melted laces",
        "unreadable footwear"
      ]
    : [
        "generic stock photography",
        "cheap lifestyle props",
        "hard studio lighting",
        "cluttered composition",
        "influencer styling",
        "loud colors",
        "fake luxury staging",
        "cold minimalism",
        "messy backgrounds",
        "overly commercial visual language"
      ];

  if (input.cityBoundaryPhrases.length) {
    phrases.push("European-looking streets", "tourist landmarks", "crowded traffic", "vehicles blocking shoes", "staged city-promo scenery");
  }
  if (input.params.imageType === "对镜穿搭图" || input.sceneKey === "mirrorCloset") {
    phrases.push("mirror distortion", "long-leg selfie effect", "posed selfie mood");
  }
  if (input.sceneKey === "gymInterior" || input.sceneKey === "gymCommute") {
    phrases.push(
      "bodybuilding",
      "sweaty gym influencer",
      "technical sportswear campaign",
      "overly bare activewear focus",
      "technical gym shoe",
      "chunky athletic sole"
    );
  }
  if (input.params.imageType === "产品静物图" || input.sceneKey === "stillLife") {
    phrases.push("props covering shoes", "floating objects", "fake product scale", "3D render feeling");
  }

  phrases.push("fake HDR", "heavy filters", "warped lens perspective");
  phrases.push(...(input.extraPhrases ?? []));

  return `Avoid ${Array.from(new Set(phrases)).join(", ")}.`;
}

function extractAvoidPhrases(line?: string) {
  if (!line) return [];

  return line
    .replace(/^avoid\s+/i, "")
    .replace(/\.$/, "")
    .split(/,\s*|\s+and\s+/)
    .map((phrase) => phrase.trim())
    .filter(Boolean);
}

function getTeamGazeMode(params: TeamPromptParams, sceneKey: StandardSceneKey) {
  if (params.imageType === "对镜穿搭图") return "phoneHiddenFace";
  if (params.imageType === "产品静物图" || params.imageType === "非产品氛围图") return "noFaceNeeded";
  if (sceneKey === "bookstoreMagazine" || sceneKey === "flowerShop" || sceneKey === "premiumErrands") return "taskFocusedGaze";
  if (sceneKey === "cafeExterior" || sceneKey === "weekendCityWalk") return "softOffCamera";
  return "softOffCamera";
}

function mapActionPoseToHumanCategory(input: {
  params: TeamPromptParams;
  resolvedScene: Exclude<TeamScenePreference, "自动匹配">;
  poseType: TeamPoseType;
}): TeamHumanPoseCategory {
  const text = `${input.resolvedScene} ${input.params.extraRequirement}`.toLowerCase();

  if (input.params.imageType === "对镜穿搭图") return "mirror";
  if (/系鞋带|shoelace|shoelaces|tying laces|tying shoelaces/.test(text)) return "laceTying";
  if (input.resolvedScene === "健身房内" || input.resolvedScene === "去运动的路上") return "gymLightAction";
  if (input.poseType === "walking") return "walking";
  if (input.poseType === "seated") return "seated";
  if (input.poseType === "active") return "gymLightAction";

  return "standing";
}

function getHandheldSafeActionContextLine(input: {
  params: TeamPromptParams;
  resolvedScene: Exclude<TeamScenePreference, "自动匹配">;
  poseCategory: TeamHumanPoseCategory;
}) {
  if (input.params.imageType === "对镜穿搭图") {
    return "Use a natural mirror outfit pose with the phone as the only hand-held object, face hidden or cropped, relaxed shoulders, and clear sneaker visibility.";
  }
  if (input.poseCategory === "gymLightAction") {
    return "Use one calm premium-gym or gym-transition action with a single selected hand-held object, relaxed posture, and grounded sneakers.";
  }
  if (input.poseCategory === "walking") {
    return "Use a small natural walking step with relaxed arms and only the selected primary handheld object.";
  }
  if (input.poseCategory === "seated" || input.poseCategory === "laceTying" || input.poseCategory === "crouchOrLean") {
    return "Use a simple seated or low-movement daily pose with only the selected primary handheld object, keeping hands, knees, feet, and sneakers readable.";
  }

  return "Use a simple scene-matched standing or pause moment with only the selected primary handheld object, relaxed shoulders, and clear sneaker visibility.";
}

function getSinglePurposeHandLine(primaryHandheldObject: string) {
  if (!primaryHandheldObject) {
    return "Hands should stay relaxed and purposeful without extra props; one hand may rest naturally, adjust a sleeve, touch a trouser pocket, or move with a natural walking gesture.";
  }

  return `Hands should have one clear purpose: naturally holding the ${primaryHandheldObject}. Keep fingers relaxed, palm size believable, wrist angle natural, and no hand-object fusion.`;
}

function getAccessoryNaturalHandsLine(input: {
  accessoryStrategy?: string;
  primaryHandheldObject: string;
}) {
  if (input.primaryHandheldObject) return "";
  if (input.accessoryStrategy === "noAccessory" || input.accessoryStrategy === "wearableOnly") {
    return "Because no primary handheld object is needed, keep the hands naturally empty: relaxed by the side, one hand in a pocket, one hand adjusting a sleeve, or a small walking gesture.";
  }

  return "";
}

function getPromptKind(params: TeamPromptParams, sceneKey: StandardSceneKey) {
  if (params.imageType === "产品静物图") return "stillLife";
  if (params.imageType === "对镜穿搭图") return "mirror";
  if (sceneKey === "gymInterior" || sceneKey === "gymCommute") return "gym";
  if (params.imageType === "产品上脚图") return "onFoot";
  if (params.imageType === "生活场景图") return "lifestyle";
  return "atmosphere";
}

function getTimeLine(params: TeamPromptParams, sceneKey: StandardSceneKey) {
  if (params.imageType === "产品静物图" || sceneKey === "stillLife") {
    return `Soft natural side light with gentle shadows, believable product photography brightness, and ${TEAM_SEASON_LIGHT[params.season]}.`;
  }
  if (params.imageType === "对镜穿搭图" || sceneKey === "mirrorCloset") {
    return `Morning or soft indoor daylight with believable room shadows, natural mirror brightness, and ${TEAM_SEASON_LIGHT[params.season]}.`;
  }
  if (sceneKey === "gymInterior") {
    return `Morning or controlled indoor light with clean brightness, soft equipment shadows, and ${TEAM_SEASON_LIGHT[params.season]}.`;
  }
  if (sceneKey === "commute" || sceneKey === "gymCommute" || sceneKey === "bakeryDessert") {
    return `Morning natural light with soft shadows, clean daily brightness, and ${TEAM_SEASON_LIGHT[params.season]}.`;
  }
  if (sceneKey === "premiumErrands" || sceneKey === "boutiqueStreet" || sceneKey === "flowerShop") {
    return `Noon to early-afternoon natural light with believable storefront brightness, soft shadows, and ${TEAM_SEASON_LIGHT[params.season]}.`;
  }
  if (sceneKey === "cafeExterior" || sceneKey === "weekendCityWalk" || sceneKey === "bookstoreMagazine" || sceneKey === "cityCorner") {
    return `Late-afternoon natural light with soft street shadows, warm-neutral brightness, and ${TEAM_SEASON_LIGHT[params.season]}.`;
  }
  if (sceneKey === "hotelTravel") {
    return `Soft hotel daylight with believable interior shadows, calm travel brightness, and ${TEAM_SEASON_LIGHT[params.season]}.`;
  }

  return `Natural daily light with believable brightness, soft shadows, and ${TEAM_SEASON_LIGHT[params.season]}.`;
}

function getShoeDisplayName(params: TeamPromptParams) {
  return params.shoe === "自定义" ? params.customShoe.trim() || "selected THERUIZ AURA" : params.shoe;
}

function getProductLine(params: TeamPromptParams, hasShoe: boolean) {
  if (!hasShoe) return "";
  if (params.imageType === "非产品氛围图") return nonProductShoeAccuracyLine;

  return [
    `THERUIZ AURA ${getShoeDisplayName(params)} German trainer as the main product reference.`,
    getSneakerAccuracyLine(params, hasShoe),
    getShoeVisibilityLine(params, hasShoe),
    getLacesLine(params, hasShoe)
  ]
    .filter(Boolean)
    .join(" ");
}

export function generateTeamPrompt(params: TeamPromptParams): TeamPromptOutput {
  const hasShoe = resolveTeamHasShoe(params);
  const resolvedScene = resolveTeamScenePreference(params);
  const sceneKey = resolveSceneKey(params, resolvedScene);
  const imageCountIntent = detectImageCountOrSeriesIntent(params.extraRequirement, params.imageType);
  const userSpecifiedClothing = hasUserSpecifiedClothingRequirement(params.extraRequirement);
  const selectedCity = selectCityProfileForScene({
    imageType: params.imageType,
    sceneKey,
    userExtraRequirement: params.extraRequirement
  });
  const cityProfile = chooseChinaUrbanStreetLine(selectedCity);
  const seasonCityVisualContext = chooseSeasonCityVisualContext({
    season: params.season,
    cityProfile: selectedCity,
    sceneKey,
    imageType: params.imageType,
    userExtraRequirement: params.extraRequirement,
    selectedShoe: getShoeDisplayName(params)
  });
  const cameraSelection = chooseCameraLookLine({
    imageType: params.imageType,
    sceneKey,
    city: selectedCity,
    userExtraRequirement: params.extraRequirement
  });
  const outfitSelection = chooseOutfitByGarmentType({
    imageType: params.imageType,
    sceneKey,
    season: params.season,
    shoe: params.shoe,
    garmentTypePreference: params.garmentTypePreference,
    userExtraRequirement: params.extraRequirement,
    userSpecifiedClothing
  });
  const perSceneOutfitSelection = shouldUsePeopleStyling(params.imageType)
    ? choosePerSceneOutfitLine({
        scenePreference: resolvedScene,
        season: params.season,
        shoe: params.shoe,
        imageType: params.imageType,
        userExtraRequirement: params.extraRequirement,
        garmentTypePreference: params.garmentTypePreference,
        cityProfile: selectedCity
      })
    : null;
  const sceneText = getSceneText(params, resolvedScene, sceneKey);
  const shoeStyleLine = getShoeStyleLine(params, hasShoe);
  const baseOutfitLine = perSceneOutfitSelection?.selectedPerSceneOutfitLine ?? outfitSelection.outfitLine;
  const baseStylingRealismLine = perSceneOutfitSelection?.selectedStylingRealismLine ?? outfitSelection.stylingRealismLine;
  const preAccessoryOutfitLine = [baseOutfitLine, shoeStyleLine].filter(Boolean).join(" ");
  const actionSelection = chooseActionLine({
    imageType: params.imageType,
    scenePreference: resolvedScene,
    selectedGazeMode: getTeamGazeMode(params, sceneKey),
    selectedOutfitLine: preAccessoryOutfitLine,
    timeOfDay: seasonCityVisualContext.timeOfDay,
    userExtraRequirement: params.extraRequirement
  });
  const poseCategory = mapActionPoseToHumanCategory({
    params,
    resolvedScene,
    poseType: actionSelection.poseType
  });
  const handheldSelection = chooseHandheldObjectLines({
    imageType: params.imageType,
    scenePreference: resolvedScene,
    actionType: [actionSelection.line, actionSelection.supportLine, actionSelection.safetyLine].filter(Boolean).join(" "),
    userExtraRequirement: params.extraRequirement,
    selectedOutfitLine: preAccessoryOutfitLine,
    selectedAccessoryLine: preAccessoryOutfitLine,
    garmentTypePreference: params.garmentTypePreference,
    poseCategory,
    promptMode: TEAM_PROMPT_MODE,
    hasShoe
  });
  const accessorySelection = chooseSceneAccessoryLine({
    sceneKey,
    imageType: params.imageType,
    season: params.season,
    cityProfile: selectedCity,
    selectedOutfit: {
      bagCategory: perSceneOutfitSelection?.selectedBagCategory ?? outfitSelection.selectedOutfit?.bagCategory ?? null,
      accessoryCategory:
        perSceneOutfitSelection?.selectedAccessoryCategory ?? outfitSelection.selectedOutfit?.accessoryCategory ?? null
    },
    selectedGarmentType: perSceneOutfitSelection?.selectedGarmentType ?? outfitSelection.selectedOutfit?.garmentType ?? null,
    selectedOutfitStyle: perSceneOutfitSelection?.selectedOutfitStyle ?? outfitSelection.selectedOutfit?.outfitStyle ?? null,
    selectedPrimaryHandheldObject: handheldSelection.primaryHandheldObject,
    poseCategory,
    userExtraRequirement: params.extraRequirement,
    promptMode: TEAM_PROMPT_MODE
  });
  const normalizedBaseOutfitLine = normalizeAccessoryInOutfitLine({
    outfitLine: baseOutfitLine,
    accessoryStrategy: accessorySelection.accessoryStrategy,
    selectedBagAccessory: accessorySelection.selectedBagAccessory,
    selectedPrimaryHandheldObject: handheldSelection.primaryHandheldObject
  });
  const outfitLine = [normalizedBaseOutfitLine, shoeStyleLine].filter(Boolean).join(" ");
  const humanRealism = chooseHumanRealismLines({
    imageType: params.imageType,
    scenePreference: resolvedScene,
    actionType: [actionSelection.line, actionSelection.supportLine, actionSelection.safetyLine].filter(Boolean).join(" "),
    poseCategory,
    garmentTypePreference: params.garmentTypePreference,
    selectedOutfitLine: outfitLine,
    hasShoe,
    multiImageMode: imageCountIntent !== "singleImage",
    promptMode: TEAM_PROMPT_MODE
  });
  const sceneRealismLine = getSceneRealismLine({
    params,
    sceneKey,
    hasCityStreetLine: Boolean(cityProfile)
  });
  const sneakerSceneControlLine = [
    getShoeVisibilityLine(params, hasShoe),
    getShoeClippingLine(params, hasShoe),
    getLacesLine(params, hasShoe)
  ]
    .filter(Boolean)
    .join(" ");
  const modelStructuredLine = shouldUsePeopleStyling(params.imageType)
    ? [
        getModelLine(params, resolvedScene),
        humanRealism.livedInCoreLine,
        humanRealism.humanProportionCoreLine,
        humanRealism.bodySpecialLine,
        humanRealism.multiImageConsistencyLine
      ]
        .filter(Boolean)
        .join(" ")
    : "";
  const outfitStructuredLine = shouldUsePeopleStyling(params.imageType)
    ? [
        params.season === "秋" || params.season === "冬" ? seasonCityVisualContext.outfitLayerLine : "",
        outfitLine,
        accessorySelection.accessoryLine,
        humanRealism.clothingWornLine,
        humanRealism.bloggerLiteLine,
        baseStylingRealismLine
      ]
        .filter(Boolean)
        .join(" ")
    : "";
  const actionStructuredLine = shouldUsePeopleStyling(params.imageType)
    ? [
        getHandheldSafeActionContextLine({
          params,
          resolvedScene,
          poseCategory
        }),
        handheldSelection.handheldObjectLine,
        handheldSelection.handheldCoreLine,
        handheldSelection.gripLine,
        handheldSelection.objectSpecificLine,
        actionSelection.safetyLine,
        getSinglePurposeHandLine(handheldSelection.primaryHandheldObject),
        getAccessoryNaturalHandsLine({
          accessoryStrategy: accessorySelection.accessoryStrategy,
          primaryHandheldObject: handheldSelection.primaryHandheldObject
        }),
        humanRealism.bodyWeightLine,
        humanRealism.expressionGazeLine || (params.imageType === "对镜穿搭图" ? "" : gazeLine)
      ]
        .filter(Boolean)
        .join(" ")
    : "";
  const sceneStructuredLine =
    params.imageType === "产品静物图"
      ? sceneRealismLine
      : [
          getImageTypeLine(params, sceneKey),
          cityProfile ? sceneText : "",
          sceneRealismLine,
          handheldSelection.spacingLine,
          handheldSelection.weightLine,
          handheldSelection.shoeVisibilityLine,
          shouldUsePeopleStyling(params.imageType) ? accessoryShoeVisibilityRuleLine : "",
          handheldSelection.simplicityLine,
          humanRealism.onFootSneakerLines,
          sneakerSceneControlLine
        ]
          .filter(Boolean)
          .join(" ");
  const moodStructuredLine = [
    brandMoodLine,
    shouldUsePeopleStyling(params.imageType) ? customerFeelingLine : "",
    shouldUsePeopleStyling(params.imageType)
      ? ""
      : params.imageType === "非产品氛围图" || params.imageType === "拍摄花絮 / 材质图"
        ? seasonCityVisualContext.seasonalPhotoStyleLine
        : "",
    shouldUsePeopleStyling(params.imageType) || params.imageType === "产品静物图"
      ? seasonCityVisualContext.seasonalPhotoStyleLine
      : "",
    cameraSelection.cameraLookLine,
    humanRealism.realHumanDetailLine
  ]
    .filter(Boolean)
    .join(" ");

  const rawPrompt = buildStructuredPrompt({
    timeLine: seasonCityVisualContext.seasonalLightLine,
    placeLine: cityProfile?.cityStreetLine ?? sceneText,
    productLine: getProductLine(params, hasShoe),
    modelLine: modelStructuredLine,
    outfitLine: outfitStructuredLine,
    sceneLine: sceneStructuredLine,
    moodLine: moodStructuredLine,
    actionLine: actionStructuredLine,
    negativeLine: getNegativeLine({
      params,
      hasShoe,
      cityBoundaryPhrases: cityProfile?.boundaryPhrases ?? [],
      sceneKey,
      extraPhrases: [
        ...extractAvoidPhrases(`Avoid ${seasonCityVisualContext.seasonalNegativeLine}.`),
        ...humanRealism.negativePhrases,
        ...handheldSelection.negativePhrases,
        ...extractAvoidPhrases(accessorySelection.accessoryNegativeLine),
        ...extractAvoidPhrases(actionSelection.negative)
      ]
    }),
    imageType: params.imageType,
    promptMode: TEAM_PROMPT_MODE,
    userExtraRequirement: sanitizeUserExtraRequirementForSingleHandheldObject(
      params.extraRequirement.trim(),
      handheldSelection.removedHandheldObjects
    )
  });
  const reducedPrompt = sensitiveWordReducer(rawPrompt);
  const vocabularyAdjustedPrompt = promptVocabularyReplacer(reducedPrompt);
  const prompt = cleanFinalPrompt(dedupePromptLines(vocabularyAdjustedPrompt));

  return {
    prompt,
    hasShoe,
    sceneText: cityProfile?.cityStreetLine ?? sceneText
  };
}
