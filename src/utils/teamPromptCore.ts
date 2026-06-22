import type {
  TeamImageType,
  TeamGarmentTypePreference,
  TeamHumanPoseCategory,
  TeamPromptMode,
  TeamPromptParams,
  TeamPromptOutput,
  TeamPoseType,
  TeamScenePreference,
  TeamSeason,
  TeamShoe
} from "../types";
import { getManualGarmentType, type StandardSceneKey } from "../data/outfitDiversityRules";
import { hasUserSpecifiedClothingRequirement } from "./outfitLibraryFilters";
import { buildStructuredPrompt } from "./buildStructuredPrompt";
import { buildPromptTemplateByImageType } from "./buildPromptTemplateByImageType";
import { chooseActionLine } from "./chooseActionLine";
import { chooseCameraLookLine } from "./chooseCameraLookLine";
import { chooseChinaUrbanStreetLine } from "./chooseChinaUrbanStreetLine";
import { chooseSeasonCityVisualContext } from "./chooseSeasonCityVisualContext";
import { accessoryShoeVisibilityRuleLine } from "../data/accessoryProfiles";
import { getPromptQualityPatchLines } from "../data/promptPatches";
import { chooseHandheldObjectLines } from "./chooseHandheldObjectLines";
import { chooseHumanPresenceLines } from "./chooseHumanPresenceLines";
import { chooseOutfitByGarmentType } from "./chooseOutfitByGarmentType";
import { choosePerSceneOutfitLine } from "./choosePerSceneOutfitLine";
import { chooseSceneAccessoryLine } from "./chooseSceneAccessoryLine";
import { chooseSneakerProtectionLines } from "./chooseSneakerProtectionLines";
import { chooseGazeLine } from "../data/modelGaze";
import { applyPromptPriorityEngine } from "./promptPriorityEngine";
import { controlPromptBudget } from "./promptBudgetController";
import { cleanFinalPrompt, dedupePromptLines } from "./promptOptimizer";
import { detectImageCountOrSeriesIntent } from "./detectImageCountOrSeriesIntent";
import { selectCityProfileForScene } from "./selectCityProfileForScene";
import { selectEuropeanStreetProfileForScene } from "./selectEuropeanStreetProfileForScene";
import { getEuropeanSeasonContext } from "../data/europeanUrbanStreetProfiles";
import { sensitiveWordReducer } from "./sensitiveWordReducer";
import {
  chooseSinglePrimaryHandheldObject,
  sanitizeUserExtraRequirementForSingleHandheldObject
} from "./chooseSinglePrimaryHandheldObject";
import { promptVocabularyReplacer } from "./promptVocabularyReplacer";
import { normalizeAccessoryInOutfitLine } from "./normalizeAccessoryInOutfitLine";
import { isSceneCompatibleWithImageType } from "../data/teamSceneOptions";
import { getNonProductAtmosphereSceneLine } from "../data/nonProductAtmosphereSceneLines";
import { promptPreflightCheck } from "./promptPreflightCheck";
import { finalPromptSafetyCheck } from "./finalPromptSafetyCheck";
import { buildVisualScenario } from "./buildVisualScenario";
import { promptAIRiskPreflight } from "./promptAIRiskPreflight";
import {
  getTeamModelConsistencyLine,
  getTeamModelLine,
  getTeamModelNegativePhrases
} from "../data/teamModelProfiles";

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
  "Create a premium THERUIZ AURA Quiet Warm Luxury image: cream-white, warm beige, soft stone tones, low saturation, refined daily elegance, believable comfort.";

const customerFeelingLine =
  "Express all-day ease, comfort without carelessness, clean composure, taste, and quiet put-together confidence.";

const humanRealismLine =
  "Show slight facial asymmetry, real pores, relaxed lips, natural catchlights, soft shoulder tension, believable hand pressure, grounded weight, and one unposed expression.";

const actionLine =
  "Use one simple daily action: slow walk, coffee, tote, flowers, book, or storefront pause.";

const mirrorGazeActionLine =
  "Use a natural mirror outfit pose with the phone hiding or cropping the face, realistic mirror proportions, one foot slightly forward, relaxed shoulders, and natural leg length.";

const gymActionLine =
  "Use a calm premium-gym action such as holding a water bottle, adjusting a gym tote, pausing near equipment, or lightly holding a dumbbell, with realistic proportions.";

const bodyProportionLine =
  "Keep body scale, leg length, hand size, foot scale, and shoe-to-leg relationship realistic.";

const gymInteriorClothingLockLine =
  "Gym interior clothing lock: use refined fitness-related clothing only, such as clean active tops, active shorts, active trousers, leggings, zip layers, or gym-ready movement layers. Keep every styling choice clearly suitable for a premium gym interior.";

const GARMENT_TYPE_LOCK_LINES = {
  裤装: "Selected clothing type: refined trousers or denim; keep trousers explicit, well fitted to the season, and shoe-readable.",
  裙装: "Selected clothing type: refined skirt; keep the skirt explicit, mature, and shoe-readable.",
  短裤: "Selected clothing type: refined Bermuda shorts or tailored shorts; keep shorts explicit, mature, and shoe-readable.",
  连衣裙: "Selected clothing type: refined one-piece dress; keep the dress explicit, mature, and shoe-readable.",
  轻运动: "Selected clothing type: refined light activewear; keep active trousers, active shorts, or movement layers explicit and premium."
} satisfies Record<Exclude<TeamPromptParams["garmentTypePreference"], "自动匹配">, string>;

const nonProductShoeAccuracyLine =
  "If the THERUIZ AURA sneaker appears in this non-product atmosphere image, keep it subtle and secondary. Preserve its real color, material texture, and recognizable shape, but do not turn the image into a direct product shot.";

const nonProductAtmosphereDefinitionLine =
  "For a non-product atmospheric THERUIZ AURA image, express the currently selected scene through its own still-life details, spatial cues, objects, and quiet daily traces, without showing a full person, model, face, or portrait by default. The scene should feel like a natural part of her world, not a product forced into it. Build lifestyle recognition through believable objects, mature taste, and quiet personal order.";

const nonProductAtmosphereContentLine =
  "Use only the currently selected scene as the image's single location and narrative. Build one coherent still-life or space-based atmosphere from that setting, without mixing in cues from any other location category.";

const nonProductBrandProcessLine =
  "If this is a material or behind-the-scenes atmosphere image, show subtle brand-process details such as material swatches, product notes, packing traces, color cards, care tools, or hands arranging details. Keep them secondary, tactile, quiet, and not like a product development catalog.";

const nonProductAtmosphereMoodLine =
  "Keep the mood warm, quiet, mature, restrained, orderly, and believable: cream-white, warm beige, soft stone, oatmeal, warm grey, natural daylight, low saturation, clean negative space, real object contact, soft shadows, and tactile authenticity. Use only a few naturally placed objects that belong to the selected scene. Avoid perfect showroom alignment, sterile space, decorative filler, and objects borrowed from unrelated scene categories.";

const nonProductAtmosphereNegativeLine =
  "Avoid showing a full person, model, face, portrait, posed body, influencer figure, fashion model, or staged lifestyle character in non-product atmosphere images by default. Avoid making every non-product atmosphere image about shoes, leather swatches, product development, packing table, quality check, or brand process. Avoid random coffee-and-flower decoration, empty Pinterest lifestyle image, fake luxury display, visible luxury logos, socialite afternoon tea mood, influencer check-in scene, over-styled prop flatlay, fake showroom, sterile AI interior, cold sample-room render, unrelated home decor, noisy commercial set, excessive props, messy clutter, fake brand signage, large readable text, fake brand slogans, random English words, fake store signage, messy printed labels, AI-generated gibberish text, luxury handbag display, perfume-ad mood, jewelry showcase, hotel influencer flatlay, champagne lifestyle, fake elite lifestyle, rich-lady still life, decorative objects without brand meaning, and anything that feels disconnected from her lifestyle world and THERUIZ AURA's quiet warm luxury world.";

const summerLifestyleWorldLine =
  "For a summer non-product atmosphere image, keep the selected scene identity unmistakable while using breathable light, warm-neutral color, tactile daily objects, and restrained seasonal detail. Do not substitute a different summer lifestyle location.";

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
  棚内上新拍摄:
    "Use a near-empty indoor launch studio with a warm-white, cream, or soft-stone seamless background, soft directional studio light, believable floor contact, and generous clean negative space. Prefer no props; keep the image photographic, tactile, and suitable for a new-product launch rather than a glossy showroom campaign.",
  周末轻采购:
    "Use a refined weekend errands atmosphere with one restrained daily-life cue, a simple kitchen or table surface, and warm neutral order. The mood should feel like real life made beautiful through restraint and good taste.",
  健身房内:
    "Use a clean premium gym or boutique fitness space with muted equipment, warm grey flooring, controlled lighting, believable training space, and no crowded sports-brand atmosphere.",
  去运动的路上:
    "Use a calm city-to-gym transition setting such as a gym entrance, clean sidewalk, parking-to-gym walkway, hotel gym route, or quiet urban movement path. The mood should feel polished, practical, and ready for light activity.",
  商务区转角:
    "Use a refined business-district corner with clean pavement, restrained office buildings, soft urban shadows, and a believable city rhythm. Keep the scene real, modern, and suitable for a mature daily commute.",
  写字楼门口:
    "Use a believable office-building entrance with clean stone or glass surroundings, modern urban surfaces, and natural daily light. Keep the mood calm, practical, and professional rather than corporate-advertising styled.",
  停车后步行去办公室:
    "Use a refined daily city transition setting between a parking area and an office entrance, with believable pavement, building edges, and walking rhythm. The scene should feel like a real workday moment.",
  回家进门:
    "Use a quiet home-entry setting at the front door, apartment corridor, or indoor threshold, with a relaxed return-home feeling, warm light, and subtle lived-in order.",
  "地铁 / 商场通道":
    "Use a clean urban passage such as a metro corridor or shopping-mall walkway, with believable indoor or semi-indoor light, smooth surfaces, and calm pedestrian rhythm. Avoid crowded commercial chaos.",
  "楼下便利店 / 咖啡外带":
    "Use a realistic neighborhood storefront or takeaway-coffee setting with clean pavement, small urban details, and a casual daily rhythm. Keep it real and understated, not influencer styled.",
  咖啡店门口:
    "Use a refined cafe-front setting with restrained storefront details, outdoor pavement, soft daylight, and a calm weekend city mood. Avoid tourist-cafe cliches.",
  咖啡馆内:
    "Use a real contemporary cafe interior with soft window light, believable table and chair spacing, restrained counter depth, quiet background patrons, and subtle signs of daily use. Keep the mood calm and refined, not a brunch set, food advertisement, or exterior storefront scene.",
  朋友午餐:
    "Use a quiet friends-lunch setting inside a contemporary cafe or restrained neighborhood restaurant. Keep one or two companions naturally secondary, with simple place settings, believable table spacing, and relaxed daytime conversation. Avoid party, banquet, formal evening social mood, or staged group-photo mood, and keep the outfit and sneakers readable.",
  美术馆:
    "Use a believable contemporary art museum or gallery interior with correctly spaced artwork, warm-white or soft-stone walls, restrained wall lighting, a bench or passage if natural, and quiet visitors kept secondary. Avoid fake exhibition text, luxury-event staging, touching artwork, or an empty CGI gallery.",
  "书店 / 杂志店门口":
    "Use a quiet bookstore or magazine-shop entrance with soft urban texture, restrained signage, and a thoughtful daily atmosphere. Keep it mature, calm, and believable.",
  "花店 / 买花":
    "Use a refined flower-shop moment with paper-wrapped flowers, soft pavement, and clean storefront surroundings. Keep the mood warm, quiet, and natural.",
  "社区市集 / 精品买菜":
    "Use a clean neighborhood-market or premium-grocery setting with paper bags, natural city texture, and a calm daily-living rhythm. Avoid crowded tourist-market styling.",
  "城市街角 / 安静街区":
    "Use a quiet city corner or calm neighborhood street with believable urban depth, soft greenery, clean pavement, and real daily atmosphere.",
  雨天街角:
    "Use a refined rainy-day city corner with slightly wet pavement, soft reflected light, umbrellas or subtle rain cues if natural, and a calm urban mood. Avoid dramatic storm styling.",
  酒店走廊:
    "Use a refined hotel corridor with clean carpet or stone flooring, soft warm light, and a quiet travel mood. Keep it mature and understated.",
  酒店房间:
    "Use a believable hotel-room setting with calm interior textures, soft natural or ambient light, and a travel-related daily feeling. Avoid luxury-resort advertisement styling.",
  "酒店门口 / 门厅":
    "Use a refined hotel entrance or lobby threshold with a quiet, polished, travel-related mood. Keep the setting believable and mature rather than glamorous.",
  "衣帽间 / 更衣角":
    "Use a calm dressing area or wardrobe corner with soft natural light, restrained interior details, and a personal daily styling atmosphere.",
  窗边阅读角:
    "Use a quiet window-side reading corner with soft daylight, warm-neutral surfaces, and a relaxed, thoughtful daily rhythm.",
  "工作台 / 桌边整理":
    "Use a home-office or worktable-side setting with believable desk details, paper, notebook, and calm daily order. Keep the atmosphere lived-in and refined.",
  入户镜前:
    "Use an entryway mirror setting with believable home light, calm personal routine, and a refined before-going-out atmosphere.",
  停车场到电梯口:
    "Use a clean parking-area to elevator-lobby transition with believable indoor lighting, real ground contact, and a subtle city-daily rhythm.",
  "瑜伽 / 普拉提工作室门口":
    "Use a refined yoga or Pilates studio-front setting with calm storefront details, light pavement, and a clean wellness-lifestyle atmosphere. Keep it believable and understated.",
  公园慢走:
    "Use a clean urban-park walking setting with restrained greenery, soft paths, and a quiet daily-wellness rhythm. Avoid hiking or outdoor-sports advertisement styling.",
  社区步道:
    "Use a real neighborhood walking path with soft greenery, clean ground texture, and a calm daily-life atmosphere. Keep it practical and believable.",
  周末轻旅行出发:
    "Use a quiet departure moment for a weekend getaway, such as a building entrance, luggage-side pause, or travel-start setting. Keep it light, tidy, and natural.",
  暑假游乐园:
    "Use a refined summer amusement-park setting with shaded walkways, soft pavement, quiet rest-corner details, restrained family-holiday cues, and believable outdoor daylight. The scene should feel like a real summer outing, not a theme-park advertisement. Keep the sneakers clearly visible and suitable for walking.",
  海边度假:
    "Use a believable Mediterranean seaside setting in the South of France or southern Italy: a quiet Riviera promenade, pale limestone coastal path, restrained hotel terrace threshold, or warm off-white seaside lane. Keep the atmosphere breezy, low-saturation, warm, and lived-in rather than postcard-perfect. Avoid barefoot beach-shoot styling and keep the sneakers clearly visible, clean, and naturally integrated into the scene.",
  草原野餐:
    "Use a quiet grassland picnic or open-field summer setting with a breathable, low-saturation atmosphere, soft natural daylight, and calm holiday rhythm. Keep the mood refined and real rather than camping-influencer styled. The sneakers should remain complete, visible, and appropriate for standing or walking on grass.",
  酒店度假:
    "Use a refined hotel-holiday setting such as a hotel corridor, lobby corner, room entry, terrace threshold, or luggage-side walkway. Keep the atmosphere quiet, mature, orderly, and travel-related. The sneakers should feel like part of a real holiday wardrobe and remain clearly visible.",
  亲子自驾出行:
    "Use a believable summer road-trip setting such as a parking area, car-side pause, roadside rest stop, or destination-arrival moment. Add subtle family-travel cues like a tote bag, sunglasses, light jacket, or travel objects, but keep the scene mature and uncluttered. The sneakers must stay clear and readable for a real walking or standing moment.",
  暑假外出后回家:
    "Use a quiet home-return summer setting at the entryway, front door, apartment corridor, or indoor threshold after a day out. The mood should feel warm, relaxed, and lived-in, with subtle outing traces such as a tote bag, light cardigan, or summer objects. Keep the sneakers clearly visible as part of a natural return-home moment."
};

const EXPANDED_LIFESTYLE_SCENES = [
  "商务区转角",
  "写字楼门口",
  "停车后步行去办公室",
  "回家进门",
  "地铁 / 商场通道",
  "楼下便利店 / 咖啡外带",
  "咖啡店门口",
  "书店 / 杂志店门口",
  "花店 / 买花",
  "社区市集 / 精品买菜",
  "城市街角 / 安静街区",
  "雨天街角",
  "酒店走廊",
  "酒店房间",
  "酒店门口 / 门厅",
  "衣帽间 / 更衣角",
  "窗边阅读角",
  "工作台 / 桌边整理",
  "入户镜前",
  "停车场到电梯口",
  "瑜伽 / 普拉提工作室门口",
  "公园慢走",
  "社区步道",
  "周末轻旅行出发"
] as const satisfies readonly Exclude<TeamScenePreference, "自动匹配">[];

type ExpandedLifestyleScene = (typeof EXPANDED_LIFESTYLE_SCENES)[number];

function isExpandedLifestyleScene(
  scene: Exclude<TeamScenePreference, "自动匹配">
): scene is ExpandedLifestyleScene {
  return (EXPANDED_LIFESTYLE_SCENES as readonly string[]).includes(scene);
}

const EXPANDED_STREET_SCENES: ExpandedLifestyleScene[] = [
  "商务区转角",
  "写字楼门口",
  "停车后步行去办公室",
  "楼下便利店 / 咖啡外带",
  "咖啡店门口",
  "书店 / 杂志店门口",
  "花店 / 买花",
  "社区市集 / 精品买菜",
  "城市街角 / 安静街区",
  "雨天街角",
  "酒店门口 / 门厅",
  "瑜伽 / 普拉提工作室门口",
  "公园慢走",
  "社区步道"
];

const SUMMER_LIFESTYLE_SCENES = [
  "暑假游乐园",
  "海边度假",
  "草原野餐",
  "酒店度假",
  "亲子自驾出行",
  "暑假外出后回家"
] as const satisfies readonly Exclude<TeamScenePreference, "自动匹配">[];

type SummerLifestyleScene = (typeof SUMMER_LIFESTYLE_SCENES)[number];

function isSummerLifestyleScene(
  scene: Exclude<TeamScenePreference, "自动匹配">
): scene is SummerLifestyleScene {
  return (SUMMER_LIFESTYLE_SCENES as readonly string[]).includes(scene);
}

function shouldUseSummerLifestylePeopleSupport(
  params: TeamPromptParams,
  scene: Exclude<TeamScenePreference, "自动匹配">
) {
  return (
    (params.imageType === "产品上脚图" || params.imageType === "生活场景图") &&
    isSummerLifestyleScene(scene)
  );
}

const streetRealismLine =
  "Street and background should feel photographed in a real daily city environment: believable pavement texture, natural street depth, real storefront proportions, subtle signs of daily use, mild surface unevenness, small shadows, realistic curb lines, quiet background pedestrians when appropriate, parked scooters or bicycles only when natural, restrained cafe or boutique details, and imperfect but tasteful city rhythm.";

const SCENE_VARIATION_LINES: Partial<Record<StandardSceneKey, string[]>> = {
  commute: [
    "Set the moment near a quiet office entrance with muted glass, stone steps, and a small morning flow of people in the distance.",
    "Use a parking-to-office walkway with realistic pavement, soft tree shade, and a calm elevator-lobby transition in the background.",
    "Place her at a restrained business-district corner, pausing near a crosswalk or building entrance without a corporate advertisement feeling.",
    "Use a neighborhood office route with a coffee pickup point, soft storefront reflections, and believable weekday movement."
  ],
  weekendCityWalk: [
    "Set the walk along a quiet cafe street with real sidewalk texture, low-noise storefronts, and natural street depth.",
    "Use a weekend city-walk route outside a bookstore or magazine shop, with muted signage, a pale wall, and a calm mature rhythm.",
    "Place her near a gallery district or light stone facade, with subtle pedestrians and restrained city details.",
    "Use a rain-after street feeling with slightly damp pavement, soft reflections, tree shadows, and no cinematic drama.",
    "Use a tree-lined sidewalk with curb lines, bicycles or scooters only as distant natural details, and a relaxed daily pace."
  ],
  premiumErrands: [
    "Set the scene outside a premium grocery or neighborhood market with paper bags, muted storefront depth, and realistic daily errands.",
    "Use a neighborhood grocery entrance or produce-shop edge with one restrained daily object and no decorative clutter.",
    "Place her near a calm community-commercial entrance with clean pavement, subtle greenery, and real local-life rhythm.",
    "Use a store-to-sidewalk transition where the outfit and sneakers remain readable while the background stays secondary."
  ],
  hotelTravel: [
    "Use a hotel doorway, calm corridor, wardrobe area, or suitcase corner with warm neutral walls and quiet travel order.",
    "Set the moment near a room doorway or wardrobe mirror with folded clothing, a travel tote, and soft hotel daylight.",
    "Use a calm hotel entrance threshold with restrained stone texture, no luxury bragging, and believable business-travel movement.",
    "Place her beside a bed edge or luggage corner before leaving, keeping the room tidy, warm, and refined."
  ],
  mirrorCloset: [
    "Use a full-length mirror near a wardrobe corner with natural daylight, clean floor contact, and practical getting-ready details.",
    "Set the mirror moment in a getting-ready corner with soft fabric folds, a chair or bed edge, and the sneakers clearly visible.",
    "Use an entryway mirror before leaving home, with keys, a coat, or a tote as subtle daily cues.",
    "Use a hotel wardrobe mirror only when the scene feels tidy, warm-neutral, and free of bathroom-selfie energy."
  ],
  entrywayDeparture: [
    "Use a warm apartment entryway with doorway light, keys, coat texture, and a calm leaving-home rhythm.",
    "Set an entryway departure moment between an indoor hallway and building entrance, with soft threshold light and realistic floor contact.",
    "Use a residential lobby or doorway transition with muted stone, quiet wall texture, and no luxury property-showroom feeling.",
    "Place her near a simple shoe cabinet or coat hook, keeping the outfit and sneakers clear rather than prop-heavy."
  ],
  bookstoreMagazine: [
    "Use a bookstore or magazine-shop exterior with muted shelves behind glass, readable spatial depth, and no unreadable storefront text.",
    "Set the image near a window-side reading corner with a book or magazine as the only quiet cultural cue.",
    "Use a gallery-bookshop street corner with pale walls, soft shadows, and a calm mature city rhythm.",
    "Place her by a small magazine rack or storefront step, keeping the scene real and understated."
  ],
  bakeryDessert: [
    "Use a bakery storefront with a simple paper bag, low-noise signage, and realistic sidewalk texture.",
    "Set the scene near a flower-and-bakery corner with one restrained daily-life cue, not a romantic decorative setup.",
    "Use a weekend errand route beside a cafe or bakery entrance, with soft reflections and believable street depth.",
    "Place her at a neighborhood shop threshold, keeping props minimal and the sneakers easy to read."
  ],
  cafeExterior: [
    "Use a restrained cafe exterior with real glass reflections, small shadows, and a quiet street rhythm.",
    "Set the moment at a cafe doorway or outdoor chair edge, with one coffee cup and no influencer check-in feeling.",
    "Use a pale wall beside a cafe storefront, keeping the background imperfect, lived-in, and low saturation.",
    "Place her walking past a calm cafe window, with the outfit and sneakers more important than the storefront."
  ],
  boutiqueStreet: [
    "Use a quiet boutique or small gallery facade with restrained materials, no luxury logo display, and natural sidewalk depth.",
    "Set the moment near a clean stone storefront with soft reflections and subtle daily wear.",
    "Use a mature city-shopping street without flashy retail energy, keeping the sneakers and outfit grounded.",
    "Place her pausing near a simple window display, avoiding synthetic luxury mall or showroom mood."
  ],
  flowerShop: [
    "Use a small flower-shop entrance as a soft daily cue, with flowers restrained and not decorative overload.",
    "Set the scene at a neighborhood florist corner with muted colors, real pavement, and one simple bouquet if needed.",
    "Use a flower-shop-adjacent sidewalk rather than a staged floral set, keeping the outfit mature and believable.",
    "Place her walking past a low-key florist window with soft greenery and no romantic cliche."
  ],
  gymCommute: [
    "Use a gym entrance or city-to-gym sidewalk with modern surfaces, subtle greenery, and a practical movement rhythm.",
    "Set the transition near a parking-to-gym walkway or hotel gym route, keeping the outfit active but refined.",
    "Use a clean community fitness entrance with muted equipment glimpsed only subtly, not a sports campaign.",
    "Place her outside the gym after or before light movement, with sneakers readable and styling gym-appropriate."
  ],
  gymInterior: [
    "Use a muted premium gym corner with warm grey flooring, restrained equipment, and clean daily training space.",
    "Set the image near a gym bench, mat area, or light equipment zone, keeping movement simple and realistic.",
    "Use a calm boutique fitness interior with no neon, no sports-ad lighting, and no crowded brand atmosphere.",
    "Place her in a realistic gym transition moment, such as pausing near lockers or a water station, with activewear only."
  ],
  materialTable: [
    "Use a tactile development table with leather or suede swatches, color cards, shoelaces, and clean object contact.",
    "Set the material story near soft window light with a care brush, product notes, and restrained sample arrangement.",
    "Use a quiet shooting-prep table with hands adjusting laces, fabric, or color cards without technical studio clutter.",
    "Place the material details on linen, warm stone, or matte paper so texture feels real and premium."
  ],
  stillLife: [
    "Use a clean product surface with warm stone, linen, matte paper, or soft plaster texture and clear shoe scale.",
    "Set the product at a restrained 45-degree angle with subtle shadow, natural contact, and no floating render feeling.",
    "Use a paired-shoe or single-shoe still life with minimal material props and no ecommerce catalog coldness.",
    "Place the sneaker near a small material card or lace detail, keeping the product as the absolute subject."
  ],
  cityCorner: [
    "Use a real mixed-use street corner with muted storefronts, curb lines, subtle greenery, and quiet daily movement.",
    "Set the background at a residential-commercial corner with believable pavement, mild wear, and no staged city-promo feeling.",
    "Use a side street with cafe or bookstore hints, natural depth, and low saturation rather than a polished sample street.",
    "Place her at a calm crossing or corner pause, keeping the scene grounded and the sneakers readable."
  ]
};

const SUMMER_LIFESTYLE_SCENE_VARIATION_LINES: Record<SummerLifestyleScene, string[]> = {
  暑假游乐园: [
    "Use a shaded amusement-park walkway with realistic pavement, a quiet rest corner, and restrained family-outing details rather than rides dominating the frame.",
    "Set the moment near a calm park map area or tree-shaded path, with soft summer daylight and natural walking space around the sneakers.",
    "Use an understated amusement-park transition area with benches, muted railings, and distant family activity kept soft and secondary."
  ],
  海边度假: [
    "Use a quiet South of France Mediterranean promenade with pale limestone paving, weathered cream facades, restrained awnings, and a low-saturation sea horizon kept secondary.",
    "Set the scene on a southern Italian coastal lane with warm off-white plaster, subtle terracotta detail, realistic stone paving, and the sea visible naturally at the end of the street.",
    "Use a calm French Riviera hotel-terrace threshold with pale stone, muted sage shutters, soft railing lines, and natural wind without luxury-resort advertising polish.",
    "Use a restrained southern Italy seafront walkway with limestone walls, small shadows, subtle daily wear, and stable ground that keeps both sneakers readable.",
    "Place the moment on a lived-in South of France coastal path with modest cafe frontage, natural pavement variation, sparse Mediterranean greenery, and quiet local rhythm.",
    "Use a southern Italian hotel-by-the-sea passage with warm plaster, aged stone edges, linen curtains glimpsed inside, and an understated blue-grey sea beyond."
  ],
  草原野餐: [
    "Use an open grassland edge with a small picnic setup kept to one side, leaving stable standing space and clear sneaker visibility.",
    "Set the moment on a quiet field path beside a restrained picnic blanket, with soft grass texture and no camping equipment display.",
    "Use a low-saturation open meadow with gentle summer wind, one woven basket or tote, and natural walking room around the shoes."
  ],
  酒店度假: [
    "Use a quiet hotel corridor or room-entry threshold with one suitcase detail, warm-neutral surfaces, and believable holiday movement.",
    "Set the moment near a hotel terrace doorway or lobby-side passage, keeping luggage secondary and the outfit and sneakers clear.",
    "Use a calm luggage-side walkway or wardrobe-to-door transition with tidy travel order and no luxury-resort advertising mood."
  ],
  亲子自驾出行: [
    "Use a car-side arrival moment in a believable parking area, with the vehicle kept secondary and one family-travel cue placed naturally.",
    "Set the road-trip scene at a quiet roadside rest stop or destination parking edge, with realistic pavement and a small walking step away from the car.",
    "Use a destination-arrival pause near an open car door or rear-seat area without turning the image into a car advertisement."
  ],
  暑假外出后回家: [
    "Use a warm return-home apartment entryway after a day out, with keys and one tote placed naturally while the sneakers remain fully visible.",
    "Set the moment at a front-door or corridor threshold with soft evening light, a light cardigan, and calm return-home order.",
    "Use a lived-in home-return transition near a shoe cabinet or coat hook, keeping outing traces restrained and the footwear unobstructed."
  ]
};

const SUMMER_LIFESTYLE_LIGHT_LINES: Record<SummerLifestyleScene, string> = {
  暑假游乐园:
    "Warm-season morning or late-afternoon daylight with soft shade, believable outdoor brightness, and clear pavement contact around the sneakers.",
  海边度假:
    "Soft late-afternoon Mediterranean daylight with warm-neutral brightness, gentle sea-air haze, natural limestone shadows, and clear ground contact around the sneakers.",
  草原野餐:
    "Soft open-field summer daylight with low-saturation green depth, gentle natural shadows, and stable ground contact around the sneakers.",
  酒店度假:
    "Soft hotel daylight with warm-neutral interior depth, believable corridor or doorway shadows, and clear floor contact around the sneakers.",
  亲子自驾出行:
    "Warm-neutral summer daylight with believable parking or rest-stop shadows, restrained vehicle reflections, and clear ground contact around the sneakers.",
  暑假外出后回家:
    "Soft late-afternoon entryway daylight with warm indoor-outdoor transition, gentle floor shadows, and clear contact around the sneakers."
};

const SUMMER_LIFESTYLE_SCENE_PROPS: Record<SummerLifestyleScene, string> = {
  暑假游乐园:
    "Add subtle amusement-park outing props only if natural: one folded park map, simple paper wristband, understated sunglasses, small snack box, canvas tote, or sun hat. Keep props restrained and mature, never sporty, cartoonish, or like colorful children's advertising, and never block the sneakers.",
  海边度假:
    "Add at most one subtle Mediterranean holiday cue only if natural: understated sunglasses, a paperback book, a linen overshirt, or one woven or soft leather bag. Keep it secondary, breezy, and refined; never sporty, never child-focused, never tropical or swimwear-influencer styled, and never block the sneakers.",
  草原野餐:
    "Add subtle grassland-picnic props only if natural: one restrained picnic blanket, woven basket, fruit box, paperback book, sun hat, canvas tote, light cardigan, or small paper bag. Keep the mood quiet and breathable, not sporty, not camping-influencer styled, not gear-heavy, and never block the sneakers.",
  酒店度假:
    "Add subtle hotel-holiday props only if natural: one suitcase, travel tote, folded white shirt, light cardigan, toiletry pouch, travel notebook, room key card, sunglasses, or sunscreen. Keep it like a real travel wardrobe moment, not a luxury hotel flatlay, not influencer luggage styling, and never blocking the sneakers.",
  亲子自驾出行:
    "Add subtle family road-trip props only if natural: one tote, understated sunglasses, light jacket, compact child travel pouch, small travel toy, snack box, folded paper map, or travel pouch near the car-side moment. Keep it mature and uncluttered, not sporty, not a luxury car showcase, not messy family clutter, and never block the sneakers.",
  暑假外出后回家:
    "Add subtle after-outing home props only if natural: one tote near the entryway, keys on a tray, light cardigan, sun hat, flower paper, grocery paper bag, or folded shirt. Keep it warm, lived-in, and orderly, not sporty, not messy homewear styling, not staged interior decor, and never block the sneakers."
};

const EXPANDED_SCENE_PROPS_LINES: Record<ExpandedLifestyleScene, string> = {
  商务区转角:
    "Add one subtle commute prop only if natural: a structured tote, phone, sunglasses, or slim daily bag. Keep it secondary and never block the sneakers.",
  写字楼门口:
    "Add one subtle office-entry prop only if natural: a tote, takeaway coffee, slim brief-style bag, or light outer layer. Never block the sneakers.",
  停车后步行去办公室:
    "Add one subtle workday-transition prop only if natural: a tote, car key, sunglasses, or light outer layer. Avoid luxury-car showcase mood and never block the sneakers.",
  回家进门:
    "Add one subtle return-home prop only if natural: a tote, keys on a tray, folded cardigan, or light shopping bag. Keep it lived-in and orderly, never messy, and never block the sneakers.",
  "地铁 / 商场通道":
    "Add one subtle urban-passage prop only if natural: a small handbag, tote, takeaway coffee, or phone. Keep the scene calm and uncluttered, never blocking the sneakers.",
  "楼下便利店 / 咖啡外带":
    "Add one subtle neighborhood prop only if natural: takeaway coffee, a small paper bag, phone, or light tote. Keep it real and understated, never blocking the sneakers.",
  咖啡店门口:
    "Add one subtle cafe prop only if natural: takeaway coffee, a tote, sunglasses, or small paper bag. Avoid influencer-cafe styling and never block the sneakers.",
  "书店 / 杂志店门口":
    "Add one subtle bookstore prop only if natural: a book, magazine, canvas tote, or receipt. Avoid readable fake text and never block the sneakers.",
  "花店 / 买花":
    "Add one subtle flower-buying prop only if natural: restrained paper-wrapped flowers, a tote, or small shopping bag. Never block the sneakers.",
  "社区市集 / 精品买菜":
    "Add one subtle grocery prop only if natural: a grocery paper bag, fruit box, canvas tote, or receipt. Avoid tourist-market styling and never block the sneakers.",
  "城市街角 / 安静街区":
    "Add one subtle city prop only if natural: a light tote, sunglasses, phone, or coffee. Keep props minimal and never block the sneakers.",
  雨天街角:
    "Add one subtle rainy-day prop only if natural: an umbrella, raincoat edge, or tote, with slightly wet pavement. Avoid dramatic storm mood and never block the sneakers.",
  酒店走廊:
    "Add one subtle hotel-corridor prop only if natural: small luggage, a travel tote, key card, or light cardigan. Keep it quiet and mature, never blocking the sneakers.",
  酒店房间:
    "Add one subtle hotel-room prop only if natural: a suitcase, folded shirt, travel notebook, tote, or soft cardigan. Avoid luxury-hotel flatlay mood and never block the sneakers.",
  "酒店门口 / 门厅":
    "Add one subtle hotel-entry prop only if natural: luggage, a travel tote, sunglasses, or light outerwear. Avoid glamorous resort-advertising mood and never block the sneakers.",
  "衣帽间 / 更衣角":
    "Add one subtle wardrobe prop only if natural: a hanger, folded garment, light cardigan, or tote. Keep the scene personal and tidy, never blocking the sneakers.",
  窗边阅读角:
    "Add one subtle reading-corner prop only if natural: a book, coffee, folded shirt, or soft blanket edge. Avoid decorative flatlay mood and never block the sneakers.",
  "工作台 / 桌边整理":
    "Add one subtle desk prop only if natural: a notebook, paper, pen, laptop edge, or coffee. Keep it lived-in and refined, never blocking the sneakers.",
  入户镜前:
    "Add one subtle entryway-mirror prop only if natural: a tote, keys, light outerwear, or folded cardigan. Keep both sneakers clearly visible in the mirror.",
  停车场到电梯口:
    "Add one subtle transition prop only if natural: a tote, sunglasses, phone, or light jacket. Avoid car-showroom mood and never block the sneakers.",
  "瑜伽 / 普拉提工作室门口":
    "Add one subtle studio prop only if natural: a yoga-mat bag, studio tote, water bottle, or light jacket. Keep it refined, never performance-gym heavy, and never block the sneakers.",
  公园慢走:
    "Add one subtle park-walk prop only if natural: a light tote, paperback book, understated cap, or light cardigan. Keep it like an easy daily walk, avoid hiking or workout gear, and never block the sneakers.",
  社区步道:
    "Add one subtle neighborhood-walk prop only if natural: a small tote, phone, folded newspaper, or light outer layer. Keep it like ordinary neighborhood movement, avoid workout props, and never block the sneakers.",
  周末轻旅行出发:
    "Add one subtle weekend-travel prop only if natural: a travel tote, small luggage, sunglasses, light jacket, or paper bag. Keep it tidy and never block the sneakers."
};

const INDOOR_SOCIAL_SCENES = ["咖啡馆内", "朋友午餐", "美术馆"] as const satisfies readonly Exclude<
  TeamScenePreference,
  "自动匹配"
>[];

type IndoorSocialScene = (typeof INDOOR_SOCIAL_SCENES)[number];

function isIndoorSocialScene(
  scene: Exclude<TeamScenePreference, "自动匹配">
): scene is IndoorSocialScene {
  return (INDOOR_SOCIAL_SCENES as readonly string[]).includes(scene);
}

const INDOOR_SOCIAL_SCENE_PROPS: Record<IndoorSocialScene, string> = {
  咖啡馆内:
    "Use at most one quiet cafe cue such as a ceramic cup, small shoulder bag, folded napkin, or receipt edge. Keep table surfaces sparse, text unreadable, and chairs clear of the sneakers.",
  朋友午餐:
    "Use simple daytime lunch cues only: restrained tableware, one glass or cup per place, and one compact bag placed beside a chair. Keep companions secondary and prevent the table, chairs, or bags from blocking the outfit and sneakers.",
  美术馆:
    "Use at most one subtle museum cue such as a folded exhibition leaflet with unreadable text, compact shoulder bag, or bench edge. Keep artwork untouched, wall labels unreadable, and the walking area around the sneakers clear."
};

const INDOOR_SOCIAL_SCENE_NEGATIVES: Record<IndoorSocialScene, string> = {
  咖啡馆内:
    "Avoid exterior cafe substitution, brunch-influencer staging, food close-up advertising, crowded table props, readable cafe branding, chairs hiding shoes, and empty showroom interiors.",
  朋友午餐:
    "Avoid party atmosphere, banquet table, formal evening social styling, posed group portrait, excessive food display, multiple hand-held objects, companions blocking the subject, and tables hiding the sneakers.",
  美术馆:
    "Avoid luxury-event staging, retail showroom mood, fake exhibition text, repeated artwork, touching artwork, dramatic conceptual posing, empty CGI gallery space, and benches or visitors blocking the sneakers."
};

const STUDIO_LAUNCH_PROPS_LINE =
  "Prefer a clean studio with no props. Only when composition truly needs support, add at most one quiet neutral studio cue such as a low matte plinth or a barely visible seamless-paper edge. Do not combine props, keep equipment outside the main frame, preserve generous negative space, and never block the sneakers.";

const STUDIO_LAUNCH_OUTFIT_BOUNDARY_LINE =
  "Studio wardrobe rule: use low-saturation, no-logo luxury-grade tailoring and tactile high-end fabric construction; use no vivid garments.";

const footPlacementSafetyLine =
  "Foot placement must stay stable and readable: keep clear ground contact, realistic toe direction, correct left-right shoe relationship, natural ankle-to-shoe alignment, and no overlapping legs hiding the sneaker shape. Props must not cover the shoes, foot placement, laces, tongue, toe box, heel, or outsole.";

const footPlacementNegativeLine =
  "crossed legs hiding shoes, exaggerated long stride, floating feet, twisted ankles, fused legs, fabric merging into shoes, trouser hems covering the toe box, grass hiding sneakers, sand covering shoes, suitcase blocking shoes, car door blocking shoes, shopping bags blocking shoes, seated pose hiding sneakers, crouching pose, jumping pose";

const SUMMER_LIFESTYLE_SCENE_NEGATIVES: Record<SummerLifestyleScene, string> = {
  暑假游乐园:
    "Avoid theme-park advertising, cartoon-tourist styling, colorful children's commercial mood, crowded ride imagery, and props covering footwear.",
  海边度假:
    "Avoid swimwear-coverup styling, barefoot beach shoots, tropical resorts, American boardwalk imagery, Chinese urban waterfronts, Greek-island blue-dome cliches, crowded beach clubs, tourist-postcard polish, vacation-influencer posing, and sand hiding the shoes.",
  草原野餐:
    "Avoid camping-influencer styling, gear-heavy outdoor scenes, oversized picnic setups, tall grass hiding shoes, and staged pastoral advertising.",
  酒店度假:
    "Avoid luxury-resort advertising, socialite luggage styling, hotel influencer check-in mood, suitcase clutter, and luggage covering shoes.",
  亲子自驾出行:
    "Avoid car-model posing, luxury-car showcase, messy family clutter, oversized travel props, open car doors blocking footwear, and staged road-trip advertising.",
  暑假外出后回家:
    "Avoid sloppy homewear, messy entryway clutter, staged interior decor, excessive shopping bags, and objects covering the sneakers."
};

const summerLifestyleShoeVisibilityLine =
  "Props must support the lifestyle atmosphere without covering foot placement, laces, tongue, toe box, heel, or outsole. Keep at least one sneaker fully visible from toe to heel and the second clearly readable. If using longer hems or wider trousers, preserve full sneaker readability and keep fabric physically separate from the shoe collar.";

const MIRROR_SCENE_VARIATION_LINES: Partial<Record<Exclude<TeamScenePreference, "自动匹配">, string[]>> = {
  通勤上班: [
    "Use a commute-before-leaving mirror moment in a quiet entryway or wardrobe mirror, with office-ready styling cues kept secondary.",
    "Set the mirror outfit record before work, near a simple doorway mirror with a tote or coat placed in the background.",
    "Use a calm pre-commute mirror check with clean floor contact, office-ready proportions, and no outdoor street background."
  ],
  周末城市散步: [
    "Use a weekend-before-going-out mirror moment in a warm home or entryway mirror, hinting at a quiet city walk through styling rather than exterior scenery.",
    "Set the mirror outfit record before a city walk, with relaxed weekend styling and a clean doorway or wardrobe mirror.",
    "Use a calm personal mirror check before leaving for a cafe, bookstore, or gallery walk, keeping the sneakers clearly visible."
  ],
  "精品超市 / 日常采购": [
    "Use a refined errands-before-leaving mirror moment with a quiet entryway mirror and subtle grocery or bakery cues in the background.",
    "Set the mirror outfit record before premium daily errands, with a tote or paper bag placed aside rather than held in the selfie.",
    "Use a practical but polished mirror check before going out for groceries or neighborhood errands."
  ],
  旅行酒店: [
    "Use a hotel wardrobe mirror or calm room mirror before leaving, with tidy suitcase or folded clothing cues in the background.",
    "Set the mirror outfit record in a warm neutral hotel room, entryway mirror, or wardrobe corner with clean travel order.",
    "Use a refined hotel mirror check with soft daylight, quiet luggage detail, and no bathroom-selfie feeling."
  ],
  居家衣帽间: [
    "Use a full-length mirror near a wardrobe corner with natural daylight, clean floor contact, and practical getting-ready details.",
    "Set the mirror moment in a getting-ready or wardrobe corner with soft fabric folds, a chair or bed edge, and the sneakers clearly visible.",
    "Use a quiet getting-ready mirror scene with wardrobe detail, clean styling, and no influencer dressing-room energy."
  ],
  玄关出门: [
    "Use an entryway mirror before leaving home, with keys, a coat, or a tote as subtle background cues.",
    "Set the mirror outfit record at a warm apartment threshold with doorway light and a calm leaving-home rhythm.",
    "Use a simple residential hallway or doorway mirror, keeping the outfit and sneakers clear rather than prop-heavy."
  ],
  窗边阅读: [
    "Use a mirror placed near a soft window-side corner with linen curtains, a chair or sofa edge, and one book or cup as a quiet background cue.",
    "Set the mirror outfit record beside real window light, keeping the reading corner secondary and the outfit and sneakers primary.",
    "Use a calm window-side mirror composition with soft daylight, pale wall texture, and no separate wardrobe-corner cue."
  ],
  材质工作台: [
    "Use a mirror outfit record in a quiet getting-ready space with a small material table, color card, or fabric sample only as a subtle background cue.",
    "Set the mirror scene near a restrained styling table with tactile materials placed aside, without turning it into a product development still life.",
    "Use a clean mirror outfit check where material-story details stay secondary and the outfit-sneaker relationship stays primary."
  ],
  拍摄花絮: [
    "Use a mirror outfit record in a quiet getting-ready setting with only subtle shooting-prep cues, not a studio behind-the-scenes setup.",
    "Set the mirror moment near a styling table or wardrobe rail, keeping camera equipment minimal and secondary.",
    "Use a real pre-shoot outfit check in a calm room mirror, with the outfit and sneakers clearer than any production detail."
  ],
  棚内上新拍摄: [
    "Use a full-length freestanding mirror inside a restrained warm-white launch studio, with clean floor contact and minimal production equipment kept outside the main composition.",
    "Set the mirror outfit record against a soft-stone seamless studio background, using one reflector edge or styling rail only as a quiet working cue.",
    "Use a calm pre-launch mirror check in a real studio with diffused directional light, natural phone grip, and both sneakers clearly reflected."
  ],
  周末轻采购: [
    "Use a weekend-errands-before-leaving mirror moment with a warm entryway or kitchen-adjacent mirror and one restrained daily-life cue.",
    "Set the mirror outfit record before a light weekend purchase, with flowers, bakery bag, or produce only as background detail.",
    "Use a relaxed but tasteful mirror check before weekend errands, keeping props quiet and sneakers readable."
  ],
  健身房内: [
    "Use a premium gym mirror or locker-area mirror with muted equipment, clean floor contact, and active clothing only.",
    "Set the mirror record inside a calm boutique fitness space, keeping the movement simple and the sneakers readable.",
    "Use a realistic gym mirror moment with warm grey flooring, restrained equipment, and no sports-ad energy."
  ],
  去运动的路上: [
    "Use a mirror check before heading to the gym, near an entryway, gym entrance mirror, or hotel gym route with active transition styling.",
    "Set the mirror outfit record in a city-to-gym transition space, keeping the outfit active but refined.",
    "Use a calm pre-gym mirror moment with practical movement cues and clear sneaker visibility."
  ]
};

const SHOE_STYLE_LINES: Record<TeamShoe, string> = {
  "Cloud Dancer 云舞者":
    "Classic clean light-tone foundation; coordinate it with cream, warm beige, soft denim blue, and refined daily neutrals.",
  "Sand Dollar 沙钱白":
    "Warm off-white foundation; coordinate it with oatmeal, soft stone, pale khaki, and refined everyday neutrals.",
  "Delphinium Blue 飞燕草蓝":
    "Low-saturation airy blue; coordinate it with warm white, pale denim blue, oatmeal, and fresh light neutrals.",
  "Silver Romance 银色浪漫":
    "Soft moonlit metallic accent for warm grey, cream white, and refined urban styling; keep away from chrome or cheap shine.",
  "Aire 微风":
    "Light breathable spring-summer feeling for linen, airy woven texture, and a light neutral palette; keep away from sporty running-shoe styling.",
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

function getSeasonAwareShoeStyleLine(params: TeamPromptParams) {
  if (params.customShoe.trim()) return "Use THERUIZ AURA's clean, low-saturation, refined daily styling system.";

  if (params.shoe === "Cappuccino 卡布奇诺") {
    if (params.season === "春" || params.season === "夏") {
      return "Warm coffee suede accent for cream, oatmeal, pale denim, and breathable refined styling; keep the look light, clean, and away from masculine or heavy cold-season styling.";
    }
    return "Warm coffee suede mood for knitwear, oatmeal, beige, and soft seasonal layering; keep away from masculine or heavy styling.";
  }

  if (params.shoe === "Maple Grove 枫林") {
    if (params.season === "春" || params.season === "夏") {
      return "Warm muted maple accent for cream, pale khaki, light denim, and soft neutral styling; keep it fresh, light, and not heavy or masculine.";
    }
    return "Warm muted maple tone for soft knitwear, beige-brown layers, and gentle seasonal styling; keep away from heavy masculine styling.";
  }

  if (params.shoe === "Aire 微风" && (params.season === "秋" || params.season === "冬")) {
    return "Light refined mesh texture for mild-city, indoor, or gym-transition styling with clean layered outfits; avoid heavy cold-weather styling and avoid sporty running-shoe energy.";
  }

  if (params.shoe === "Delphinium Blue 飞燕草蓝" && (params.season === "秋" || params.season === "冬")) {
    return "Low-saturation airy blue as a quiet cool accent with cream, oatmeal, warm grey, and light layered styling; avoid heavy dark winter styling.";
  }

  if (params.shoe === "Lemon 柠檬" && (params.season === "秋" || params.season === "冬")) {
    return "Soft butter-yellow accent with cream, warm grey, oatmeal, and quiet light layering; avoid childish color and avoid forcing heavy winter styling.";
  }

  return SHOE_STYLE_LINES[params.shoe];
}

function isPeopleImageType(imageType: TeamImageType) {
  return imageType === "产品上脚图" || imageType === "对镜穿搭图" || imageType === "生活场景图";
}

function shouldUsePeopleStyling(imageType: TeamImageType) {
  return isPeopleImageType(imageType);
}

function isNonProductAtmosphereImage(imageType: TeamImageType) {
  return imageType === "非产品氛围图";
}

function shouldUseNonProductBrandProcessLine(
  params: TeamPromptParams,
  resolvedScene: Exclude<TeamScenePreference, "自动匹配">
) {
  if (!isNonProductAtmosphereImage(params.imageType)) return false;
  if (resolvedScene === "材质工作台" || resolvedScene === "拍摄花絮") return true;

  return /皮料|材质|开发|打包|包装|质检|产品笔记|工作台|样品|色卡|护理|拍摄花絮|material|swatch|swatches|development|packing|packaging|quality|quality check|product notes|sample|color card|care tool|behind[- ]the[- ]scenes|bts/i.test(
    params.extraRequirement
  );
}

function shouldUseStreetRealismLine(
  params: TeamPromptParams,
  resolvedScene: Exclude<TeamScenePreference, "自动匹配">
) {
  if (
    params.imageType !== "产品上脚图" &&
    params.imageType !== "生活场景图"
  ) {
    return false;
  }

  return (
    resolvedScene === "通勤上班" ||
    resolvedScene === "周末城市散步" ||
    resolvedScene === "精品超市 / 日常采购" ||
    resolvedScene === "周末轻采购" ||
    resolvedScene === "去运动的路上" ||
    (isExpandedLifestyleScene(resolvedScene) && EXPANDED_STREET_SCENES.includes(resolvedScene))
  );
}

function teamExtraMentionsShoe(extraRequirement: string) {
  const text = extraRequirement.toLowerCase();
  return TEAM_SHOE_KEYWORDS.some((keyword) => text.includes(keyword.toLowerCase()));
}

function resolveTeamHasShoe(params: TeamPromptParams) {
  if (isNonProductAtmosphereImage(params.imageType)) return false;

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

const NON_PRODUCT_AUTO_SCENES: Exclude<TeamScenePreference, "自动匹配">[] = [
  "窗边阅读",
  "周末轻采购",
  "咖啡馆内",
  "朋友午餐",
  "美术馆",
  "旅行酒店",
  "居家衣帽间",
  "周末城市散步",
  "通勤上班",
  "玄关出门"
];

function getTeamAutoScene(params: TeamPromptParams): Exclude<TeamScenePreference, "自动匹配"> {
  const imageType = params.imageType;

  if (imageType === "产品上脚图") return "通勤上班";
  if (imageType === "对镜穿搭图") return "居家衣帽间";
  if (imageType === "生活场景图") return "精品超市 / 日常采购";
  if (imageType === "非产品氛围图") {
    const nonce = Math.max(0, params.generationNonce ?? 0);
    return NON_PRODUCT_AUTO_SCENES[nonce % NON_PRODUCT_AUTO_SCENES.length];
  }
  if (imageType === "产品静物图") return "材质工作台";
  return "材质工作台";
}

function resolveTeamScenePreference(params: TeamPromptParams) {
  return params.scenePreference === "自动匹配" || !isSceneCompatibleWithImageType(params.imageType, params.scenePreference)
    ? getTeamAutoScene(params)
    : params.scenePreference;
}

function resolveSceneKey(params: TeamPromptParams, resolvedScene: Exclude<TeamScenePreference, "自动匹配">): StandardSceneKey {
  const text = `${resolvedScene} ${params.extraRequirement}`.toLowerCase();

  if (params.imageType === "产品静物图") return "stillLife";
  if (resolvedScene === "健身房内" || /gyminterior|健身房内|premium gym/.test(text)) return "gymInterior";
  if (resolvedScene === "去运动的路上" || /gymcommute|去运动|健身房路上/.test(text)) return "gymCommute";
  if (resolvedScene === "棚内上新拍摄") {
    return params.imageType === "拍摄花絮 / 材质图" ? "materialTable" : "studioLaunch";
  }
  if (params.imageType === "对镜穿搭图") {
    if (resolvedScene === "通勤上班") return "commute";
    if (resolvedScene === "周末城市散步") return "weekendCityWalk";
    if (resolvedScene === "精品超市 / 日常采购") return "premiumErrands";
    if (resolvedScene === "旅行酒店") return "hotelTravel";
    if (resolvedScene === "玄关出门") return "entrywayDeparture";
    if (resolvedScene === "窗边阅读") return "bookstoreMagazine";
    if (resolvedScene === "周末轻采购") return "bakeryDessert";
    return "mirrorCloset";
  }
  if (params.imageType === "拍摄花絮 / 材质图" || resolvedScene === "材质工作台" || resolvedScene === "拍摄花絮") {
    return "materialTable";
  }
  if (["商务区转角", "写字楼门口", "停车后步行去办公室"].includes(resolvedScene)) {
    return "commute";
  }
  if (["回家进门", "地铁 / 商场通道", "停车场到电梯口"].includes(resolvedScene)) {
    return "entrywayDeparture";
  }
  if (resolvedScene === "楼下便利店 / 咖啡外带") return "bakeryDessert";
  if (resolvedScene === "咖啡店门口") return "cafeExterior";
  if (resolvedScene === "咖啡馆内" || resolvedScene === "朋友午餐") return "lightSocial";
  if (resolvedScene === "美术馆") return "galleryExhibition";
  if (resolvedScene === "书店 / 杂志店门口") return "bookstoreMagazine";
  if (resolvedScene === "花店 / 买花") return "flowerShop";
  if (resolvedScene === "社区市集 / 精品买菜") return "premiumErrands";
  if (resolvedScene === "城市街角 / 安静街区" || resolvedScene === "雨天街角") return "cityCorner";
  if (["酒店走廊", "酒店房间", "酒店门口 / 门厅", "周末轻旅行出发"].includes(resolvedScene)) {
    return "hotelTravel";
  }
  if (["衣帽间 / 更衣角", "窗边阅读角", "工作台 / 桌边整理", "入户镜前"].includes(resolvedScene)) {
    return "mirrorCloset";
  }
  if (resolvedScene === "瑜伽 / 普拉提工作室门口") return "gymCommute";
  if (resolvedScene === "公园慢走" || resolvedScene === "社区步道") return "weekendCityWalk";
  if (resolvedScene === "暑假游乐园" || resolvedScene === "海边度假" || resolvedScene === "草原野餐") {
    return "weekendCityWalk";
  }
  if (resolvedScene === "酒店度假") return "hotelTravel";
  if (resolvedScene === "亲子自驾出行") return "premiumErrands";
  if (resolvedScene === "暑假外出后回家") return "entrywayDeparture";
  if (resolvedScene === "居家衣帽间") return "mirrorCloset";
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

function getSceneVariationLine(
  params: TeamPromptParams,
  resolvedScene: Exclude<TeamScenePreference, "自动匹配">,
  sceneKey: StandardSceneKey
) {
  const studioLaunchLines = [
    "Use a near-empty warm-white seamless studio with no props, a soft-stone floor, one large diffused key light, gentle contact shadows, and uncluttered launch-ready framing.",
    "Set the image against a clean cream studio cyclorama with no props, restrained side light, subtle tonal depth, and open floor space.",
    "Use a soft-grey-beige studio sweep with no props, generous negative space, accurate material color, and realistic floor contact.",
    "Use a plain tactile linen-toned studio backdrop with no props, diffused directional light, and a commercially readable new-launch composition."
  ];
  const windowReadingLines = [
    "Use a quiet window-side chair or sofa edge with linen curtains, one book, and calm private space.",
    "Set a window-side reading moment beside a real window with a small table, magazine or cup, and warm neutral interior depth.",
    "Use a reading corner near soft curtains and pale wall texture, keeping the mood quiet, personal, clean, and not staged.",
    "Place the scene near a window ledge or lounge chair with one book or magazine as the only quiet object."
  ];
  let lines: string[] | undefined;

  if (resolvedScene === "棚内上新拍摄") {
    lines = studioLaunchLines;
  } else if (isNonProductAtmosphereImage(params.imageType)) {
    lines = [];
  } else if (isExpandedLifestyleScene(resolvedScene) || resolvedScene === "拍摄花絮") {
    // Expanded selections already have exact place copy; a coarse scene-key
    // variation can silently replace the user's selected location after budget trimming.
    lines = [];
  } else if (params.imageType === "对镜穿搭图") {
    lines = MIRROR_SCENE_VARIATION_LINES[resolvedScene];
  } else if (
    isSummerLifestyleScene(resolvedScene) &&
    shouldUseSummerLifestylePeopleSupport(params, resolvedScene)
  ) {
    lines = SUMMER_LIFESTYLE_SCENE_VARIATION_LINES[resolvedScene];
  } else if (resolvedScene === "窗边阅读") {
    lines = windowReadingLines;
  } else {
    lines = SCENE_VARIATION_LINES[sceneKey];
  }

  if (!lines?.length) return "";

  const nonce = Math.max(0, params.generationNonce ?? 0);
  return lines[nonce % lines.length];
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

function getModelLine(params: TeamPromptParams) {
  if (!shouldUsePeopleStyling(params.imageType)) return "";
  return getTeamModelLine(params.modelChoice);
}

function getSceneText(params: TeamPromptParams, resolvedScene: Exclude<TeamScenePreference, "自动匹配">, sceneKey: StandardSceneKey) {
  if (resolvedScene === "棚内上新拍摄") {
    if (params.imageType === "产品静物图") {
      return "Create a launch-ready sneaker still life on a clean matte warm-stone, cream, or soft-grey studio surface with diffused directional light, accurate color, natural contact shadow, and the product as the absolute subject. Prefer no props; if needed, use only one small neutral support element.";
    }
    if (params.imageType === "拍摄花絮 / 材质图") {
      return "Use a real new-launch studio preparation moment with one focused working cue: a styling table detail, one material swatch group, one color card, a camera-monitor edge, or hands adjusting one detail. Keep equipment sparse, the frame clean, and materials tactile.";
    }
    if (isNonProductAtmosphereImage(params.imageType)) {
      return "Create a clean non-product launch-studio atmosphere with warm-white seamless paper, soft light falloff, and at most one quiet working trace such as a folded wardrobe piece or shot-list edge. Keep it like a restrained real studio between takes, not a product hero shot or equipment display.";
    }
    if (params.imageType === "对镜穿搭图") {
      return "Use a freestanding full-length mirror inside a restrained launch studio with a warm neutral seamless background, natural phone-hand structure, believable reflection, stable proportions, and clearly readable sneakers.";
    }
    return "Use a near-empty indoor new-launch studio with a warm-white, cream, or soft-stone seamless background, soft directional light, clean floor contact, generous negative space, and editorial-commercial balance. Prefer no props and keep the woman and sneakers natural, clear, and launch-ready without a rigid showroom pose.";
  }
  if (params.imageType === "产品静物图") {
    if (resolvedScene === "工作台 / 桌边整理") {
      return "Use a refined worktable still-life setup with believable paper, notebook, color-card, or care-tool details kept secondary. Keep the sneaker as the absolute subject with clear scale, natural contact, and unobstructed structure.";
    }
    return "Use a real still-life setup with believable surface texture, natural object contact, soft shadows, restrained props, clear product scale, and open shoe visibility.";
  }
  if (isNonProductAtmosphereImage(params.imageType)) {
    return getNonProductAtmosphereSceneLine(resolvedScene) || TEAM_SCENE_TEXT[resolvedScene];
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
  if (params.imageType === "拍摄花絮 / 材质图" && resolvedScene === "窗边阅读") {
    return "Use a quiet material table near soft window light, with tactile samples and refined working details. Do not make a reading portrait the main image.";
  }
  if (resolvedScene === "窗边阅读") {
    return TEAM_SCENE_TEXT["窗边阅读"];
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

function getBasePlaceLineForPrompt(input: {
  params: TeamPromptParams;
  resolvedScene: Exclude<TeamScenePreference, "自动匹配">;
  sceneText: string;
  cityStreetPlaceLine: string;
  isEuropeanStreet: boolean;
}) {
  if (input.params.imageType === "对镜穿搭图") {
    // Core mirror scenes already provide a mirror-specific location variation.
    // Expanded mirror scenes still need their selected place to remain explicit.
    return MIRROR_SCENE_VARIATION_LINES[input.resolvedScene]?.length ? "" : input.sceneText;
  }
  if (shouldUseSummerLifestylePeopleSupport(input.params, input.resolvedScene)) {
    return input.sceneText;
  }
  if (input.isEuropeanStreet && input.cityStreetPlaceLine) {
    return input.cityStreetPlaceLine;
  }
  if (isExpandedLifestyleScene(input.resolvedScene)) {
    return input.sceneText;
  }
  if (isNonProductAtmosphereImage(input.params.imageType)) {
    return input.sceneText;
  }

  return input.cityStreetPlaceLine || input.sceneText;
}

function getSceneRealismLine(input: {
  params: TeamPromptParams;
  resolvedScene: Exclude<TeamScenePreference, "自动匹配">;
  sceneKey: StandardSceneKey;
  hasCityStreetLine: boolean;
}) {
  if (input.resolvedScene === "棚内上新拍摄") {
    return "Use a physically believable, near-empty professional studio: seamless paper meets the floor naturally, light direction and contact shadows remain consistent, and material colors stay accurate. Prefer no visible equipment; if one support element is necessary, keep it neutral and secondary. Avoid fake CGI cyclorama depth, floating feet or products, glossy showroom staging, decorative prop clusters, and equipment clutter.";
  }
  if (input.params.imageType === "产品静物图" || input.sceneKey === "stillLife") {
    return "Use a real still-life photography setup with believable surface texture, natural object contact, soft shadows, restrained props, clear product scale, and no prop covering the shoe.";
  }
  if (input.sceneKey === "gymInterior") {
    return "Use a clean premium gym or boutique fitness space with muted equipment, warm grey flooring, controlled light, believable training space, and calm brand atmosphere.";
  }
  if (input.sceneKey === "lightSocial") {
    return "Use a believable cafe or restrained restaurant interior with correctly scaled tables and chairs, natural aisle space, soft window or ambient light, subtle signs of use, and quiet background guests. Keep tableware sparse and secondary, with a clear unobstructed view of the outfit and sneakers.";
  }
  if (input.sceneKey === "galleryExhibition") {
    return "Use a believable contemporary art museum interior with realistic artwork spacing, controlled wall light, natural floor depth, quiet visitor movement, and practical walking space. Keep exhibition text unreadable and secondary, with no showroom or event-staging mood.";
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

  return "Use a believable real daily space with natural depth, grounded floor contact, soft light, practical object placement, restrained props, and no staged showroom-set feeling.";
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
  return getSeasonAwareShoeStyleLine(params);
}

function getSeasideShoeStyleLine(params: TeamPromptParams) {
  if (params.shoe === "Cappuccino 卡布奇诺") {
    return "Use the warm coffee suede as a quiet accent with cream, soft stone, pale khaki, and breathable woven layers; keep the coastal outfit light, refined, and not masculine.";
  }
  if (params.shoe === "Maple Grove 枫林") {
    return "Use the muted maple tone as a warm accent with cream, pale khaki, soft beige, and breathable woven layers; keep the coastal outfit light and not heavy.";
  }
  return getSeasonAwareShoeStyleLine(params);
}

function getNegativeLine(input: {
  params: TeamPromptParams;
  hasShoe: boolean;
  cityBoundaryPhrases: string[];
  sceneKey: StandardSceneKey;
  hasStreetScene?: boolean;
  streetRegion?: "china" | "europe";
  extraPhrases?: string[];
}) {
  const isStillLifeImage = input.params.imageType === "产品静物图" || input.sceneKey === "stillLife";
  const isMaterialImage = input.params.imageType === "拍摄花絮 / 材质图" || input.sceneKey === "materialTable";
  const isNonProductAtmosphere = isNonProductAtmosphereImage(input.params.imageType);
  const phrases = isNonProductAtmosphere
    ? [
        "large readable text",
        "fake brand slogans",
        "random English words",
        "fake store signage",
        "messy printed labels",
        "AI-generated gibberish text",
        "generic stock photography",
        "empty Pinterest lifestyle image",
        "fake luxury display",
        "influencer check-in scene",
        "fake showroom",
        "sterile AI interior",
        "cold sample-room render",
        "unrelated home decor",
        "noisy commercial set",
        "excessive props",
        "messy clutter",
        "anything disconnected from THERUIZ AURA"
      ]
    : isStillLifeImage || isMaterialImage
    ? [
        "sneaker deformation",
        "chunky or running-shoe sole",
        "cropped shoes",
        "hidden shoe structure",
        "melted laces",
        "unreadable footwear",
        "props covering shoes",
        "floating objects",
        "unreal product scale",
        "CGI product render feeling",
        "glossy artificial material"
      ]
    : input.hasShoe
      ? [
          "influencer posing",
          "over-polished beige-template styling",
          "body-focused posing",
          "distorted body",
          "stiff hands",
          "unreal scenery or signage",
          "loud status branding",
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
          "synthetic luxury staging",
          "cold minimalism",
          "messy backgrounds",
          "overly commercial visual language"
        ];

  if (input.hasStreetScene) {
    phrases.push(
      "synthetic-looking street",
      "unreal storefront",
      "unreadable storefront signage",
      "impossible architecture",
      "repeating windows",
      "synthetic greenery",
      "empty render-like street",
      "plastic pavement",
      "unrealistic reflections",
      "floating street objects",
      "over-clean luxury district",
      "staged commercial backdrop",
      "3D city render feeling"
    );
  }
  if (input.cityBoundaryPhrases.length) {
    if (input.streetRegion !== "europe") phrases.push("European-looking streets");
    phrases.push("tourist landmarks", "crowded traffic", "vehicles blocking shoes", "staged city-promo scenery");
  }
  if (input.params.imageType === "对镜穿搭图" || input.sceneKey === "mirrorCloset") {
    phrases.push("mirror distortion", "long-leg selfie effect", "posed selfie mood");
  }
  if (input.sceneKey === "gymInterior" || input.sceneKey === "gymCommute") {
    phrases.push(
      "bodybuilding",
      "sweaty gym influencer",
      "technical sportswear campaign",
      "insufficiently layered activewear",
      "technical gym shoe",
      "chunky athletic sole"
    );
  }
  if (isStillLifeImage) {
    phrases.push("props covering shoes", "floating objects", "unreal product scale", "3D render feeling");
  }
  if (isPeopleImageType(input.params.imageType)) {
    phrases.push(
      ...getTeamModelNegativePhrases(input.params.modelChoice),
      "professional fashion model face",
      "beauty-pageant face",
      "computer-perfect woman",
      "perfect showroom posture",
      "empty fashion stare",
      "over-retouched portrait",
      "perfect influencer skin",
      "symmetrical doll face",
      "hard staring",
      "commercial model eye contact",
      "staged fashion portrait mood",
      "influencer gaze",
      "commercial campaign model",
      "posed luxury advertisement",
      "digitally idealized body"
    );
  }

  phrases.push("harsh HDR", "heavy filters", "warped lens perspective");
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

function isBehindTheScenesImage(params: TeamPromptParams, sceneKey: StandardSceneKey) {
  return params.imageType === "拍摄花絮 / 材质图" || sceneKey === "materialTable";
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
    return "Use one calm premium-gym or gym-transition action with relaxed posture, grounded sneakers, and at most one simple hand-held object if needed.";
  }
  if (input.poseCategory === "walking") {
    return "Use a small natural walking step with relaxed arms, natural hand placement, and no extra props competing with the sneakers.";
  }
  if (input.poseCategory === "seated" || input.poseCategory === "laceTying" || input.poseCategory === "crouchOrLean") {
    return "Use a simple seated or low-movement daily pose, keeping hands, knees, feet, and sneakers readable without adding unnecessary hand-held props.";
  }

  return "Use a simple scene-matched standing or pause moment with relaxed shoulders, natural hand placement, and clear sneaker visibility.";
}

function getSinglePurposeHandLine(primaryHandheldObject: string) {
  if (!primaryHandheldObject) {
    return "Hands should stay relaxed and purposeful without extra props; one hand may rest naturally by the side, adjust a sleeve or clothing edge, or move with a small natural walking gesture.";
  }

  return `Hands should have one clear purpose: naturally holding the ${primaryHandheldObject}. Keep fingers relaxed, palm size believable, wrist angle natural, and no hand-object fusion.`;
}

function getAccessoryNaturalHandsLine(input: {
  accessoryStrategy?: string;
  primaryHandheldObject: string;
}) {
  if (input.primaryHandheldObject) return "";
  if (input.accessoryStrategy === "noAccessory" || input.accessoryStrategy === "wearableOnly") {
    return "Because no primary handheld object is needed, keep the hands naturally empty: relaxed by the side, lightly adjusting a sleeve or outer-layer edge, or moving with a small walking gesture.";
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

function isGymSceneKey(sceneKey: StandardSceneKey) {
  return sceneKey === "gymInterior" || sceneKey === "gymCommute";
}

function getEffectiveGarmentTypePreference(
  params: TeamPromptParams,
  sceneKey: StandardSceneKey
): TeamGarmentTypePreference {
  return sceneKey === "gymInterior" ? "轻运动" : params.garmentTypePreference;
}

function getGarmentTypeLockLine(preference: TeamGarmentTypePreference, season: TeamSeason) {
  if (preference === "自动匹配") return "";

  if (preference === "轻运动" && season !== "夏") {
    return "Selected clothing type: refined light activewear with active trousers, leggings, or a zip layer; use shorts only for indoor fitness.";
  }
  if (preference === "短裤" && season !== "夏") {
    return "Selected clothing type: tailored Bermuda shorts in season-appropriate fabric and layering; do not substitute another garment category.";
  }
  if ((preference === "裙装" || preference === "连衣裙") && season === "冬") {
    return `${GARMENT_TYPE_LOCK_LINES[preference]} Use believable winter-weight fabric and layering.`;
  }

  return GARMENT_TYPE_LOCK_LINES[preference];
}

function getCompactPoseBodyLine(poseCategory: TeamHumanPoseCategory) {
  if (poseCategory === "mirror") {
    return "Keep mirror body proportions natural: no stretched legs, oversized phone, warped feet, or cropped shoes.";
  }
  if (poseCategory === "seated" || poseCategory === "laceTying" || poseCategory === "crouchOrLean") {
    return "Keep seated or low-movement anatomy believable, with natural knees, ankles, hands, foot scale, and shoe contact.";
  }
  if (poseCategory === "gymLightAction") {
    return "Keep light movement realistic and refined, not athletic, exaggerated, or sports-campaign-like.";
  }

  return "Keep posture grounded with natural weight shift, realistic leg proportion, hand scale, foot scale, and shoe-to-leg relationship.";
}

function getTimeLine(params: TeamPromptParams, sceneKey: StandardSceneKey) {
  if (params.imageType === "产品静物图" || sceneKey === "stillLife") {
    return `Soft natural side light with gentle shadows, believable product photography brightness, and ${TEAM_SEASON_LIGHT[params.season]}.`;
  }
  if (sceneKey === "gymInterior") {
    return `Morning or controlled indoor light with clean brightness, soft equipment shadows, and ${TEAM_SEASON_LIGHT[params.season]}.`;
  }
  if (params.imageType === "对镜穿搭图" || sceneKey === "mirrorCloset") {
    return `Morning or soft indoor daylight with believable room shadows, natural mirror brightness, and ${TEAM_SEASON_LIGHT[params.season]}.`;
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
  const usesNonProductAtmosphere = isNonProductAtmosphereImage(params.imageType);
  const resolvedScene = resolveTeamScenePreference(params);
  const usesSummerLifestylePeopleSupport = shouldUseSummerLifestylePeopleSupport(params, resolvedScene);
  const summerLifestyleScene = isSummerLifestyleScene(resolvedScene) ? resolvedScene : null;
  const scenePropsLine = shouldUsePeopleStyling(params.imageType)
    ? resolvedScene === "棚内上新拍摄"
      ? STUDIO_LAUNCH_PROPS_LINE
      : isIndoorSocialScene(resolvedScene)
      ? INDOOR_SOCIAL_SCENE_PROPS[resolvedScene]
      : summerLifestyleScene
      ? SUMMER_LIFESTYLE_SCENE_PROPS[summerLifestyleScene]
      : isExpandedLifestyleScene(resolvedScene)
        ? EXPANDED_SCENE_PROPS_LINES[resolvedScene]
        : ""
    : "";
  const summerLifestyleSceneNegativeLine =
    usesSummerLifestylePeopleSupport && summerLifestyleScene
      ? SUMMER_LIFESTYLE_SCENE_NEGATIVES[summerLifestyleScene]
      : "";
  const indoorSocialSceneNegativeLine = isIndoorSocialScene(resolvedScene)
    ? INDOOR_SOCIAL_SCENE_NEGATIVES[resolvedScene]
    : "";
  const summerLifestyleShoeSafetyLine = usesSummerLifestylePeopleSupport
    ? summerLifestyleShoeVisibilityLine
    : "";
  const footPlacementPatchLine = shouldUsePeopleStyling(params.imageType) && hasShoe
    ? footPlacementSafetyLine
    : "";
  const sceneKey = resolveSceneKey(params, resolvedScene);
  const streetRealismPatchLine = shouldUseStreetRealismLine(params, resolvedScene) ? streetRealismLine : "";
  const hasStreetRealism = Boolean(streetRealismPatchLine);
  const conditionalNonProductBrandProcessLine = shouldUseNonProductBrandProcessLine(params, resolvedScene)
    ? nonProductBrandProcessLine
    : "";
  const nonProductSummerLifestyleWorldLine =
    isNonProductAtmosphereImage(params.imageType) && params.season === "夏" ? summerLifestyleWorldLine : "";
  const nonProductAtmosphereLines = isNonProductAtmosphereImage(params.imageType)
    ? [
        conditionalNonProductBrandProcessLine,
        nonProductAtmosphereDefinitionLine,
        nonProductAtmosphereContentLine,
        nonProductSummerLifestyleWorldLine,
        nonProductAtmosphereMoodLine,
        nonProductAtmosphereNegativeLine
      ]
    : [];
  const effectiveGarmentTypePreference = getEffectiveGarmentTypePreference(params, sceneKey);
  const imageCountIntent = detectImageCountOrSeriesIntent(params.extraRequirement, params.imageType);
  const userSpecifiedClothing =
    sceneKey === "gymInterior" ? false : hasUserSpecifiedClothingRequirement(params.extraRequirement);
  const selectedEuropeanStreet = selectEuropeanStreetProfileForScene({
    imageType: params.imageType,
    sceneKey,
    scenePreference: resolvedScene,
    userExtraRequirement: params.extraRequirement,
    generationNonce: params.generationNonce
  });
  const selectedCity = selectedEuropeanStreet
    ? null
    : selectCityProfileForScene({
        imageType: params.imageType,
        sceneKey,
        userExtraRequirement: params.extraRequirement,
        generationNonce: params.generationNonce
      });
  const cityProfile = selectedEuropeanStreet ?? chooseChinaUrbanStreetLine(selectedCity);
  const isEuropeanStreet = Boolean(selectedEuropeanStreet);
  const europeanSeasonContext = isEuropeanStreet ? getEuropeanSeasonContext(params.season) : null;
  const promptQualityPatchLines = getPromptQualityPatchLines({
    imageType: params.imageType,
    hasShoe,
    shoe: params.shoe,
    includeCityRealism: hasStreetRealism || isEuropeanStreet,
    streetRegion: isEuropeanStreet ? "europe" : "china"
  });
  const seasonCityVisualContext = chooseSeasonCityVisualContext({
    season: params.season,
    cityProfile: selectedCity,
    sceneKey,
    imageType: params.imageType,
    scenePreference: resolvedScene,
    userExtraRequirement: params.extraRequirement,
    selectedShoe: getShoeDisplayName(params)
  });
  const visualScenario = buildVisualScenario({
    imageType: params.imageType,
    scenePreference: resolvedScene,
    sceneKey,
    lightingSpaceType: seasonCityVisualContext.lightingSpaceType,
    cityProfile: selectedCity,
    timeOfDay: seasonCityVisualContext.timeOfDay,
    generationNonce: params.generationNonce
  });
  const summerLifestyleLightLine =
    usesSummerLifestylePeopleSupport && summerLifestyleScene
      ? SUMMER_LIFESTYLE_LIGHT_LINES[summerLifestyleScene]
      : "";
  const effectiveSeasonalLightLine =
    europeanSeasonContext?.lightLine ??
    (usesNonProductAtmosphere
      ? TEAM_ATMOSPHERE_SEASON[params.season]
      : summerLifestyleLightLine || seasonCityVisualContext.seasonalLightLine);
  const effectiveIndoorOutdoorLightLine = usesSummerLifestylePeopleSupport || usesNonProductAtmosphere
    ? ""
    : seasonCityVisualContext.indoorOutdoorLightLine;
  const effectiveLightingSpaceSupportLine = usesNonProductAtmosphere
    ? "Keep the selected non-product setting physically believable, with accurate spatial depth, natural object contact, and lighting appropriate to that exact location. Do not substitute another location category."
    : usesSummerLifestylePeopleSupport
      ? "Keep the selected summer holiday or family-life setting physically believable, with natural depth, stable ground, and scene props secondary to the woman and sneakers."
      : seasonCityVisualContext.lightingSpaceSupportLine;
  const effectiveSeasonalPhotoStyleLine =
    europeanSeasonContext?.photoStyleLine ??
    (usesSummerLifestylePeopleSupport
      ? "Use a realistic warm-season lifestyle photo style with natural skin tone, breathable fabric texture, low-saturation color, and no tourism-campaign polish."
      : seasonCityVisualContext.seasonalPhotoStyleLine);
  const effectiveCitySeasonMoodLine =
    europeanSeasonContext?.moodLine ??
    (usesSummerLifestylePeopleSupport
      ? "A quiet summer family-life mood with breathable warmth, believable movement, and restrained holiday detail."
      : seasonCityVisualContext.citySeasonMoodLine);
  const effectiveLightingNegativeLine = usesSummerLifestylePeopleSupport
    ? "studio-set lighting, tourism-advertising glow, harsh noon overexposure, unreal holiday backdrop"
    : seasonCityVisualContext.lightingNegativeLine;
  const validationLightingSpaceType = usesSummerLifestylePeopleSupport
    ? ("semiIndoorThreshold" as const)
    : seasonCityVisualContext.lightingSpaceType;
  const cityStreetPlaceLine = isEuropeanStreet
    ? selectedEuropeanStreet?.cityStreetLine ?? ""
    : !usesSummerLifestylePeopleSupport &&
        (seasonCityVisualContext.lightingSpaceType === "outdoorStreet" ||
          seasonCityVisualContext.lightingSpaceType === "semiIndoorThreshold")
      ? cityProfile?.cityStreetLine ?? ""
      : "";
  const cameraSelection = chooseCameraLookLine({
    imageType: params.imageType,
    sceneKey,
    season: params.season,
    cityProfile: selectedCity,
    lightingSpaceType: seasonCityVisualContext.lightingSpaceType,
    userExtraRequirement: params.extraRequirement
  });
  const imageTypeTemplate = buildPromptTemplateByImageType({
    imageType: params.imageType,
    sceneKey,
    lightingSpaceType: seasonCityVisualContext.lightingSpaceType
  });
  const effectiveImageTemplateSceneLine = usesSummerLifestylePeopleSupport
    ? "Use a real warm-season lifestyle template with natural outdoor or travel-space depth, one simple daily action, readable full figure and sneakers, and no tourism-advertising composition."
    : imageTypeTemplate.templateSceneLine;
  const effectiveImageTemplateNegativeLine = usesSummerLifestylePeopleSupport
    ? "tourism advertisement, staged family portrait, theme-park campaign, resort campaign, cropped shoes, props covering shoes, unstable ground hiding footwear"
    : imageTypeTemplate.templateNegativeLine;
  const perSceneOutfitSelection = shouldUsePeopleStyling(params.imageType)
    ? choosePerSceneOutfitLine({
        scenePreference: resolvedScene,
        season: params.season,
        shoe: params.shoe,
        imageType: params.imageType,
        userExtraRequirement: params.extraRequirement,
        garmentTypePreference: effectiveGarmentTypePreference,
        cityProfile: selectedCity,
        generationNonce: params.generationNonce
      })
    : null;
  const hasLockedPerSceneOutfit = Boolean(perSceneOutfitSelection?.selectedPerSceneOutfitLine);
  const outfitSelection = hasLockedPerSceneOutfit
    ? { outfitLine: "", stylingRealismLine: "", selectedOutfit: null }
    : chooseOutfitByGarmentType({
        imageType: params.imageType,
        sceneKey,
        season: params.season,
        shoe: params.shoe,
        garmentTypePreference: effectiveGarmentTypePreference,
        userExtraRequirement: params.extraRequirement,
        userSpecifiedClothing,
        generationNonce: params.generationNonce
  });
  const premiumWardrobeSelection =
    shouldUsePeopleStyling(params.imageType) &&
    sceneKey !== "gymInterior" &&
    !userSpecifiedClothing &&
    !hasLockedPerSceneOutfit &&
    !usesSummerLifestylePeopleSupport &&
    !isExpandedLifestyleScene(resolvedScene)
      ? chooseOutfitByGarmentType({
          imageType: params.imageType,
          sceneKey,
          season: params.season,
          shoe: params.shoe,
          garmentTypePreference: effectiveGarmentTypePreference,
          userExtraRequirement: params.extraRequirement,
          userSpecifiedClothing,
          generationNonce: params.generationNonce,
          preferPremiumWardrobe: true
        })
      : null;
  const selectedPremiumWardrobe =
    premiumWardrobeSelection?.selectedOutfit?.isPremiumWardrobe ? premiumWardrobeSelection : null;
  const requestedManualGarmentType = getManualGarmentType(effectiveGarmentTypePreference);
  const lockedManualOutfitSelection = requestedManualGarmentType
    ? [selectedPremiumWardrobe, outfitSelection].find(
        (selection) => selection?.selectedOutfit?.garmentType === requestedManualGarmentType
      ) ?? null
    : null;
  const selectedStandardOutfit = lockedManualOutfitSelection ?? selectedPremiumWardrobe;
  const sceneText = getSceneText(params, resolvedScene, sceneKey);
  const sceneVariationLine = getSceneVariationLine(params, resolvedScene, sceneKey);
  const basePlaceLine = getBasePlaceLineForPrompt({
    params,
    resolvedScene,
    sceneText,
    cityStreetPlaceLine,
    isEuropeanStreet
  });
  const placeLine = (isEuropeanStreet
    ? [basePlaceLine, sceneVariationLine]
    : [sceneVariationLine, basePlaceLine]
  )
    .filter(Boolean)
    .join(" ");
  const shoeStyleLine =
    sceneKey === "gymInterior" && hasShoe
      ? "Style the selected THERUIZ AURA sneaker only with refined fitness-related clothing, keeping the look active, clean, and gym-appropriate."
      : userSpecifiedClothing
        ? ""
        : resolvedScene === "海边度假" && hasShoe
          ? getSeasideShoeStyleLine(params)
          : getShoeStyleLine(params, hasShoe);
  const sneakerProtection = chooseSneakerProtectionLines({
    imageType: params.imageType,
    shoe: params.shoe,
    shoeDisplayName: getShoeDisplayName(params),
    customShoe: params.customShoe,
    hasShoe
  });
  const baseOutfitLine =
    selectedStandardOutfit?.outfitLine ?? perSceneOutfitSelection?.selectedPerSceneOutfitLine ?? outfitSelection.outfitLine;
  const baseStylingRealismLine =
    selectedStandardOutfit?.stylingRealismLine ??
    perSceneOutfitSelection?.selectedStylingRealismLine ??
    outfitSelection.stylingRealismLine;
  const preAccessoryOutfitLine = [baseOutfitLine, shoeStyleLine].filter(Boolean).join(" ");
  const gazeSelection = chooseGazeLine({
    imageType: params.imageType,
    scenePreference: resolvedScene,
    isMirror: params.imageType === "对镜穿搭图" || sceneKey === "mirrorCloset",
    isProductStillLife: params.imageType === "产品静物图" || sceneKey === "stillLife",
    isBehindTheScenes: isBehindTheScenesImage(params, sceneKey),
    userExtraRequirement: params.extraRequirement,
    usesCreatorStyling: shouldUsePeopleStyling(params.imageType),
    isMultiImageSet: imageCountIntent !== "singleImage",
    generationNonce: params.generationNonce
  });
  const actionSelection = chooseActionLine({
    imageType: params.imageType,
    scenePreference: resolvedScene,
    selectedGazeMode: gazeSelection.mode || getTeamGazeMode(params, sceneKey),
    selectedOutfitLine: preAccessoryOutfitLine,
    timeOfDay: seasonCityVisualContext.timeOfDay,
    userExtraRequirement: params.extraRequirement,
    generationNonce: params.generationNonce
  });
  const poseCategory = mapActionPoseToHumanCategory({
    params,
    resolvedScene,
    poseType: actionSelection.poseType
  });
  const primaryHandheldSelection = chooseSinglePrimaryHandheldObject({
    imageType: params.imageType,
    scenePreference: resolvedScene,
    actionType: [actionSelection.line, actionSelection.supportLine, actionSelection.safetyLine].filter(Boolean).join(" "),
    userExtraRequirement: params.extraRequirement,
    selectedOutfitLine: preAccessoryOutfitLine,
    selectedAccessoryLine: preAccessoryOutfitLine,
    garmentTypePreference: effectiveGarmentTypePreference
  });
  const accessorySelection = chooseSceneAccessoryLine({
    sceneKey,
    imageType: params.imageType,
    season: params.season,
    cityProfile: selectedCity,
    selectedOutfit: {
      bagCategory:
        selectedStandardOutfit?.selectedOutfit?.bagCategory ??
        perSceneOutfitSelection?.selectedBagCategory ??
        outfitSelection.selectedOutfit?.bagCategory ??
        null,
      accessoryCategory:
        selectedStandardOutfit?.selectedOutfit?.accessoryCategory ??
        perSceneOutfitSelection?.selectedAccessoryCategory ??
        outfitSelection.selectedOutfit?.accessoryCategory ??
        null
    },
    selectedGarmentType:
      selectedStandardOutfit?.selectedOutfit?.garmentType ??
      perSceneOutfitSelection?.selectedGarmentType ??
      outfitSelection.selectedOutfit?.garmentType ??
      null,
    selectedOutfitStyle:
      selectedStandardOutfit?.selectedOutfit?.outfitStyle ??
      perSceneOutfitSelection?.selectedOutfitStyle ??
      outfitSelection.selectedOutfit?.outfitStyle ??
      null,
    selectedPrimaryHandheldObject: primaryHandheldSelection.primaryHandheldObject,
    poseCategory,
    userExtraRequirement: params.extraRequirement,
    promptMode: TEAM_PROMPT_MODE
  });
  const normalizedBaseOutfitLine = normalizeAccessoryInOutfitLine({
    outfitLine: baseOutfitLine,
    accessoryStrategy: accessorySelection.accessoryStrategy,
    selectedBagAccessory: accessorySelection.selectedBagAccessory,
    selectedPrimaryHandheldObject: primaryHandheldSelection.primaryHandheldObject
  });
  const saturatedGarmentBoundaryLine = /only soft color accent|only muted color accent/i.test(normalizedBaseOutfitLine)
    ? "Use exactly one muted low-saturation garment as a soft color anchor; keep every other garment, bag, accessory, backdrop, and styling detail neutral, restrained, and easy to coordinate."
    : "";
  const outfitLine = [
    resolvedScene === "棚内上新拍摄" ? STUDIO_LAUNCH_OUTFIT_BOUNDARY_LINE : "",
    normalizedBaseOutfitLine,
    shoeStyleLine
  ]
    .filter(Boolean)
    .join(" ");
  const handheldSelection = chooseHandheldObjectLines({
    imageType: params.imageType,
    scenePreference: resolvedScene,
    actionType: [actionSelection.line, actionSelection.supportLine, actionSelection.safetyLine].filter(Boolean).join(" "),
    userExtraRequirement: params.extraRequirement,
    selectedOutfitLine: outfitLine,
    selectedAccessoryLine: accessorySelection.accessoryLine,
    garmentTypePreference: effectiveGarmentTypePreference,
    poseCategory,
    promptMode: TEAM_PROMPT_MODE,
    hasShoe,
    singlePrimaryHandheldObject: primaryHandheldSelection
  });
  const humanRealism = chooseHumanPresenceLines({
    imageType: params.imageType,
    scenePreference: resolvedScene,
    actionType: [actionSelection.line, actionSelection.supportLine, actionSelection.safetyLine].filter(Boolean).join(" "),
    poseCategory,
    garmentTypePreference: effectiveGarmentTypePreference,
    selectedOutfitLine: outfitLine,
    hasShoe,
    multiImageMode: imageCountIntent !== "singleImage",
    promptMode: TEAM_PROMPT_MODE
  });
  const sceneRealismLine = getSceneRealismLine({
    params,
    resolvedScene,
    sceneKey,
    hasCityStreetLine: Boolean(cityStreetPlaceLine) && !usesSummerLifestylePeopleSupport && !usesNonProductAtmosphere
  });
  const sneakerSceneControlLine = sneakerProtection.sceneControlLine;
  const modelStructuredLine = shouldUsePeopleStyling(params.imageType)
    ? [
        getModelLine(params),
        getTeamModelConsistencyLine(params.modelChoice, imageCountIntent),
        gazeSelection.line,
        humanRealismLine,
        getCompactPoseBodyLine(poseCategory),
        humanRealism.multiImageConsistencyLine
      ]
        .filter(Boolean)
        .join(" ")
    : "";
  const outfitStructuredLine = shouldUsePeopleStyling(params.imageType)
    ? [
        userSpecifiedClothing || resolvedScene === "海边度假"
          ? ""
          : getGarmentTypeLockLine(effectiveGarmentTypePreference, params.season),
        outfitLine,
        sceneKey === "gymInterior" ? gymInteriorClothingLockLine : "",
        saturatedGarmentBoundaryLine,
        baseStylingRealismLine,
        (params.season === "秋" || params.season === "冬") &&
        !isGymSceneKey(sceneKey) &&
        resolvedScene !== "海边度假"
          ? europeanSeasonContext?.outfitLayerLine ?? seasonCityVisualContext.outfitLayerLine
          : "",
        accessorySelection.accessoryLine,
        humanRealism.clothingWornLine
      ]
        .filter(Boolean)
        .join(" ")
    : "";
  const actionStructuredLine = shouldUsePeopleStyling(params.imageType)
    ? [
        actionSelection.line,
        getHandheldSafeActionContextLine({
          params,
          resolvedScene,
          poseCategory
        }),
        handheldSelection.handheldObjectLine,
        handheldSelection.gripLine,
        actionSelection.safetyLine,
        getSinglePurposeHandLine(handheldSelection.primaryHandheldObject),
        getAccessoryNaturalHandsLine({
          accessoryStrategy: accessorySelection.accessoryStrategy,
          primaryHandheldObject: handheldSelection.primaryHandheldObject
        }),
        humanRealism.bodyWeightLine
      ]
        .filter(Boolean)
        .join(" ")
    : "";
  const sceneStructuredLine =
    params.imageType === "产品静物图"
      ? [
          visualScenario.scenarioLine,
          imageTypeTemplate.templateSceneLine,
          sceneVariationLine,
          sceneRealismLine,
          seasonCityVisualContext.lightingSpaceSupportLine
        ]
          .filter(Boolean)
          .join(" ")
      : [
          visualScenario.scenarioLine,
          scenePropsLine,
          summerLifestyleShoeSafetyLine,
          footPlacementPatchLine,
          ...nonProductAtmosphereLines.slice(0, 3),
          nonProductSummerLifestyleWorldLine,
          getImageTypeLine(params, sceneKey),
          effectiveImageTemplateSceneLine,
          streetRealismPatchLine,
          sceneRealismLine,
          effectiveLightingSpaceSupportLine,
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
    isNonProductAtmosphereImage(params.imageType) ? nonProductAtmosphereMoodLine : "",
    ...promptQualityPatchLines.moodLines,
    shouldUsePeopleStyling(params.imageType) ? customerFeelingLine : "",
    shouldUsePeopleStyling(params.imageType)
      ? ""
      : params.imageType === "非产品氛围图" || params.imageType === "拍摄花絮 / 材质图"
        ? europeanSeasonContext?.photoStyleLine ?? seasonCityVisualContext.seasonalPhotoStyleLine
        : "",
    shouldUsePeopleStyling(params.imageType) || params.imageType === "产品静物图"
      ? effectiveSeasonalPhotoStyleLine
      : "",
    cameraSelection.cameraLookLine,
    shouldUsePeopleStyling(params.imageType) ? "" : humanRealism.realHumanDetailLine
  ]
    .filter(Boolean)
    .join(" ");

  const sanitizedUserExtraRequirement = sanitizeUserExtraRequirementForSingleHandheldObject(
    params.extraRequirement.trim(),
    handheldSelection.removedHandheldObjects
  );
  const baseNegativeLine = getNegativeLine({
    params,
    hasShoe,
    cityBoundaryPhrases: usesSummerLifestylePeopleSupport
      ? []
      : selectedEuropeanStreet?.boundaryPhrases ?? (usesNonProductAtmosphere ? [] : cityProfile?.boundaryPhrases ?? []),
    sceneKey,
    hasStreetScene: hasStreetRealism || isEuropeanStreet,
    streetRegion: isEuropeanStreet ? "europe" : "china",
    extraPhrases: [
      ...(usesNonProductAtmosphere
        ? []
        : extractAvoidPhrases(
            `Avoid ${europeanSeasonContext?.negativeLine ?? seasonCityVisualContext.seasonalNegativeLine}.`
          )),
      ...(usesNonProductAtmosphere ? [] : humanRealism.negativePhrases),
      ...(usesNonProductAtmosphere ? [] : handheldSelection.negativePhrases),
      ...(usesNonProductAtmosphere ? [] : extractAvoidPhrases(accessorySelection.accessoryNegativeLine)),
      ...(usesNonProductAtmosphere ? [] : extractAvoidPhrases(actionSelection.negative)),
      ...(shouldUsePeopleStyling(params.imageType) ? extractAvoidPhrases(`Avoid ${footPlacementNegativeLine}.`) : []),
      ...extractAvoidPhrases(`Avoid ${effectiveImageTemplateNegativeLine}.`),
      ...extractAvoidPhrases(cameraSelection.cameraNegativeLine),
      ...(usesNonProductAtmosphere ? [] : extractAvoidPhrases(`Avoid ${gazeSelection.negative}.`)),
      ...extractAvoidPhrases(isNonProductAtmosphereImage(params.imageType) ? nonProductAtmosphereNegativeLine : ""),
      ...promptQualityPatchLines.negativePhrases,
      ...(resolvedScene === "棚内上新拍摄"
        ? [
            "high-saturation clothing",
            "cobalt blue clothing",
            "tomato red clothing",
            "forest green clothing",
            "deep burgundy clothing",
            "neon clothing",
            "multiple studio props",
            "decorative prop cluster",
            "visible equipment clutter"
          ]
        : [])
    ]
  });
  const basePromptParts = {
    timeLine: effectiveSeasonalLightLine,
    placeLine,
    productLine: sneakerProtection.productLine,
    modelLine: modelStructuredLine,
    outfitLine: outfitStructuredLine,
    sceneLine: sceneStructuredLine,
    moodLine: moodStructuredLine,
    actionLine: actionStructuredLine,
    negativeLine: baseNegativeLine,
    imageType: params.imageType,
    promptMode: TEAM_PROMPT_MODE,
    userExtraRequirement: sanitizedUserExtraRequirement
  };
  const prioritizedPromptParts = applyPromptPriorityEngine({
    promptParts: basePromptParts,
    buckets: {
      hardConstraints: {
        timeLine: [effectiveIndoorOutdoorLightLine],
        placeLine: [effectiveLightingSpaceSupportLine],
        productLine: [
          ...promptQualityPatchLines.productLines,
          sneakerProtection.shoeSpecificAccuracyLine,
          sneakerProtection.clippingLine
        ].filter(Boolean),
        modelLine: shouldUsePeopleStyling(params.imageType)
          ? [bodyProportionLine]
          : [],
        outfitLine: [],
        sceneLine: [
          ...promptQualityPatchLines.sceneLines,
          conditionalNonProductBrandProcessLine,
          scenePropsLine,
          summerLifestyleShoeSafetyLine,
          footPlacementPatchLine,
          shouldUsePeopleStyling(params.imageType) && !sneakerSceneControlLine ? accessoryShoeVisibilityRuleLine : ""
        ].filter(Boolean),
        actionLine: shouldUsePeopleStyling(params.imageType)
          ? [
              imageTypeTemplate.templateActionLine,
              actionSelection.line,
              handheldSelection.handheldObjectLine,
              getSinglePurposeHandLine(handheldSelection.primaryHandheldObject)
            ].filter(Boolean)
          : [],
        negativeLine: [
          effectiveLightingNegativeLine,
          effectiveImageTemplateNegativeLine,
          ...extractAvoidPhrases(summerLifestyleSceneNegativeLine),
          ...extractAvoidPhrases(indoorSocialSceneNegativeLine),
          ...(shouldUsePeopleStyling(params.imageType) ? extractAvoidPhrases(`Avoid ${footPlacementNegativeLine}.`) : []),
          cameraSelection.cameraNegativeLine,
          ...promptQualityPatchLines.negativePhrases,
          "opening wording",
          "generic pants wording",
          "full figure balance wording risk",
          "hyphenated figure-balance wording risk",
          "body-focused styling",
          "forced dramatic pose",
          "overly close-fitting outfit",
          "insufficiently layered activewear",
          "posed selfie"
        ]
      },
      softAestheticLines: {
        moodLine: [effectiveCitySeasonMoodLine]
      }
    }
  });
  const aiRiskPreflight = promptAIRiskPreflight({
    promptParts: prioritizedPromptParts,
    imageType: params.imageType,
    sceneKey,
    visualScenarioLine: visualScenario.scenarioLine,
    studioLaunch: resolvedScene === "棚内上新拍摄",
    modelChoice: params.modelChoice,
    userExtraRequirement: sanitizedUserExtraRequirement
  });
  const preflight = promptPreflightCheck({
    promptParts: aiRiskPreflight.fixedPromptParts,
    imageType: params.imageType,
    sceneKey,
    season: params.season,
    cityProfile: usesSummerLifestylePeopleSupport || usesNonProductAtmosphere ? null : selectedCity,
    selectedShoe: params.shoe,
    lightingSpaceType: validationLightingSpaceType,
    selectedOutfit: selectedStandardOutfit?.selectedOutfit ?? perSceneOutfitSelection ?? outfitSelection.selectedOutfit,
    selectedAccessory: accessorySelection.selectedBagAccessory,
    selectedHandheldObject: handheldSelection.primaryHandheldObject,
    userExtraRequirement: sanitizedUserExtraRequirement,
    hasShoe,
    allowEuropeanStreet: isEuropeanStreet
  });
  const budgetedPromptParts = controlPromptBudget({
    promptParts: preflight.fixedPromptParts,
    imageType: params.imageType,
    sceneKey,
    lightingSpaceType: validationLightingSpaceType
  });
  const finalPreflight = promptPreflightCheck({
    promptParts: budgetedPromptParts,
    imageType: params.imageType,
    sceneKey,
    season: params.season,
    cityProfile: usesSummerLifestylePeopleSupport || usesNonProductAtmosphere ? null : selectedCity,
    selectedShoe: params.shoe,
    lightingSpaceType: validationLightingSpaceType,
    selectedOutfit: selectedStandardOutfit?.selectedOutfit ?? perSceneOutfitSelection ?? outfitSelection.selectedOutfit,
    selectedAccessory: accessorySelection.selectedBagAccessory,
    selectedHandheldObject: handheldSelection.primaryHandheldObject,
    userExtraRequirement: sanitizedUserExtraRequirement,
    hasShoe,
    allowEuropeanStreet: isEuropeanStreet,
    lightCheckOnly: true
  });
  const finalBudgetedPromptParts = controlPromptBudget({
    promptParts: finalPreflight.fixedPromptParts,
    imageType: params.imageType,
    sceneKey,
    lightingSpaceType: validationLightingSpaceType
  });
  const rawPrompt = buildStructuredPrompt(finalBudgetedPromptParts);
  const reducedPrompt = sensitiveWordReducer(rawPrompt);
  const vocabularyAdjustedPrompt = promptVocabularyReplacer(reducedPrompt);
  const dedupedPrompt = dedupePromptLines(vocabularyAdjustedPrompt);
  const safetyCheckedPrompt = finalPromptSafetyCheck(dedupedPrompt, {
    hasShoe,
    hasPeople: shouldUsePeopleStyling(params.imageType),
    requireFullShoeVisibility: hasShoe && params.imageType !== "拍摄花絮 / 材质图" && params.imageType !== "非产品氛围图"
  });
  const prompt = cleanFinalPrompt(safetyCheckedPrompt.prompt);

  return {
    prompt,
    hasShoe,
    sceneText: placeLine
  };
}
