import type { TeamImageType, TeamPromptMode, TeamPromptOutput, TeamPromptParams, TeamScenePreference, TeamSeason, TeamShoe } from "../types";

export const TEAM_PROMPT_MODE: TeamPromptMode = "standard";

const brandMoodLine =
  "Create a premium THERUIZ AURA Quiet Warm Luxury image: cream-white, warm beige, soft stone, natural light, low saturation, refined daily elegance, believable comfort.";

const customerFeelingLine =
  "Express all-day ease, comfort without carelessness, clean composure, taste, and quiet put-together confidence.";

const modelLine =
  "Use one believable Asian or subtle Asian mixed woman, 30–45, natural dark hair, clean makeup, real skin texture, realistic proportions, and calm presence.";

const humanRealismLine =
  "Make the woman feel like a real person in a natural daily moment, not an artificial fashion mannequin, showroom model, influencer pose, or over-polished commercial face. Keep real skin texture, slight natural asymmetry, believable hands, normal body proportion, realistic weight balance, relaxed shoulders, natural gaze, and calm unforced expression. The gaze and action must have a real daily reason, such as looking down at the shoes, checking the phone, adjusting clothes, holding coffee, walking, entering a store, or pausing naturally. Keep clothing naturally worn with real fabric folds, normal wrinkles, believable layering, and no fabric merging into skin or shoes.";

const shoeAccuracyLine =
  "Use uploaded sneaker reference as strict source: low-cut German trainer silhouette, rounded toe box, slim outsole, panels, tongue, stitching, material, color, and proportions.";

const shoeVisibilityLine =
  "Keep at least one sneaker fully visible from toe to heel, with the second clearly readable. Keep clean separation between ankle, sock, trouser hem or skirt edge, shoe collar, tongue, laces, floor, and props; nothing should merge into the shoe. Keep laces naturally tied, with readable loops, lace ends, eyelets, and tongue.";

const fitnessIndoorOutfitLockLine =
  "Fitness Indoor Outfit Lock v1.1: For any gym, pilates, yoga, fitness studio, stretching room, or workout-related indoor scene, the woman must wear believable refined activewear: fitted training top, sports bra with light zip jacket, breathable tank top, fitted T-shirt, leggings, biker shorts, training shorts, soft sweatpants, lightweight hoodie, cropped sweatshirt, or clean athletic layering. The outfit should feel suitable for light training, stretching, pilates, yoga, warm-up, or post-workout daily wear. Keep the sneakers as THERUIZ AURA lifestyle German trainers, not running shoes, not professional training shoes, not chunky gym sneakers, and not technical sports footwear. Avoid blazers, formal coats, office trousers, dresses, skirts, denim-heavy outfits, heavy knitwear, party styling, luxury evening styling, or non-fitness fashion. This lock overrides ordinary city outfit, commuter outfit, skirt, dress, denim-heavy, and user-selected garment category when the scene is 健身房内.";

const shoeStyleLines: Record<TeamShoe, string> = {
  "Cloud Dancer 云舞者":
    "Classic clean light-tone foundation for white shirts, beige trousers, soft denim, and refined daily styling.",
  "Sand Dollar 沙钱白":
    "Classic clean light-tone foundation for white shirts, beige trousers, soft denim, and refined daily styling.",
  "Cappuccino 卡布奇诺":
    "Warm coffee suede mood for knitwear, oatmeal, beige, and soft autumn-winter layers; keep away from masculine or heavy styling.",
  "Silver Romance 银色浪漫":
    "Soft moonlit metallic accent for warm grey, cream white, and refined urban styling; keep away from chrome or cheap shine.",
  "Aire 微风":
    "Light breathable spring-summer feeling for linen, airy shirts, and light trousers; keep away from sporty running-shoe styling.",
  "Delphinium Blue 飞燕草蓝":
    "Low-saturation airy blue for white shirts, pale denim, oatmeal knitwear, and fresh spring-summer styling.",
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

const sceneLines: Record<Exclude<TeamScenePreference, "自动匹配">, string> = {
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
    "Use a refined weekend errands atmosphere with flowers, bakery paper bags, produce, coffee beans, tote bags, or a simple kitchen/table surface.",
  健身房内:
    "Use a clean premium gym or boutique fitness space with muted equipment, warm grey flooring, controlled lighting, believable training space, and no crowded sports-brand atmosphere.",
  去运动的路上:
    "Use a calm city-to-gym transition setting such as a gym entrance, clean sidewalk, parking-to-gym walkway, hotel gym route, or quiet urban movement path."
};

const seasonLines: Record<TeamSeason, string> = {
  春: "Use soft spring daylight, airy textures, pale neutrals, and a fresh but quiet atmosphere.",
  夏: "Use breathable summer light, clean shadows, linen texture, warm off-white tones, and no harsh heat.",
  秋: "Use warm muted daylight, tactile textures, oatmeal, beige, soft brown tones, and calm seasonal warmth.",
  冬: "Use soft winter light, warm neutral layers, cream, warm grey, quiet shadows, and restrained cozy atmosphere."
};

function resolveScene(params: TeamPromptParams): Exclude<TeamScenePreference, "自动匹配"> {
  if (params.scenePreference !== "自动匹配") return params.scenePreference;
  if (params.imageType === "产品上脚图") return "通勤上班";
  if (params.imageType === "对镜穿搭图") return "居家衣帽间";
  if (params.imageType === "生活场景图") return "精品超市 / 日常采购";
  if (params.imageType === "产品静物图") return "材质工作台";
  return "玄关出门";
}

function hasShoe(imageType: TeamImageType) {
  return imageType === "产品上脚图" || imageType === "对镜穿搭图" || imageType === "生活场景图" || imageType === "产品静物图";
}

function isPeopleImageType(imageType: TeamImageType) {
  return imageType === "产品上脚图" || imageType === "对镜穿搭图" || imageType === "生活场景图";
}

function getFitnessIndoorOutfitLockLine(resolvedScene: Exclude<TeamScenePreference, "自动匹配">) {
  return resolvedScene === "健身房内" ? fitnessIndoorOutfitLockLine : "";
}

function getImageTypeLine(params: TeamPromptParams) {
  if (params.imageType === "产品上脚图") {
    return "Generate a refined on-foot lifestyle image with a safe standing pose or small natural walking step. The sneakers must be complete, clear, structurally accurate, and separate from trouser hems.";
  }
  if (params.imageType === "对镜穿搭图") {
    return "Generate a refined mirror outfit image with the face hidden by the phone or naturally cropped. Use a 3/4 or full-body mirror composition with clear sneakers, natural proportions, believable phone-hand structure, and clear trouser-shoe relationship.";
  }
  if (params.imageType === "生活场景图") {
    return "Generate a believable lifestyle image of a refined urban woman wearing THERUIZ AURA sneakers in real daily movement.";
  }
  if (params.imageType === "产品静物图") {
    return "Generate premium still-life product photography with the selected THERUIZ AURA sneaker as the main subject; keep material, laces, tongue, outsole, and product scale clearly readable.";
  }
  return "Generate a non-product atmospheric THERUIZ AURA image. The product does not need to be the main subject; express quiet order, warm restraint, daily elegance, calm negative space, and refined lifestyle atmosphere.";
}

function getActionLine(params: TeamPromptParams, resolvedScene: Exclude<TeamScenePreference, "自动匹配">) {
  if (params.imageType === "对镜穿搭图") {
    return "Use a natural mirror outfit pose with the phone hiding or cropping the face, realistic mirror proportions, one foot slightly forward, relaxed shoulders, and natural leg length.";
  }
  if (resolvedScene === "健身房内" || resolvedScene === "去运动的路上") {
    return "Use one calm premium-gym or gym-transition action such as holding a water bottle, adjusting a gym tote, or pausing naturally near the entrance.";
  }
  if (params.imageType === "产品静物图") {
    return "Use restrained still-life composition, real surface contact, soft shadows, believable product scale, and no CGI render feeling.";
  }
  if (params.imageType === "非产品氛围图") {
    return "Use quiet brand-life details, restrained props, natural light, and clean negative space without forcing a direct product shot.";
  }
  return "Use one simple daily action: slow walk, coffee, tote, flowers, book, or storefront pause.";
}

function getNegativeLine(input: { imageType: TeamImageType; hasShoe: boolean }) {
  const base = [
    "fake HDR",
    "heavy filters",
    "warped lens perspective",
    "plastic skin",
    "stiff hands",
    "messy background",
    "loud logos",
    "fake scenery or signage",
    "influencer posing"
  ];

  if (input.hasShoe) {
    base.push(
      "sneaker deformation",
      "chunky or running-shoe sole",
      "shoe clipping",
      "cropped shoes",
      "melted laces",
      "unreadable footwear",
      "fabric merging into shoes"
    );
  }
  if (isPeopleImageType(input.imageType)) {
    base.push(
      "artificial mannequin look",
      "doll-like face",
      "over-smoothed skin",
      "perfect symmetrical face",
      "frozen smile",
      "forced eye contact",
      "stiff body",
      "fake model pose",
      "showroom model",
      "fashion dummy",
      "unnatural hands",
      "unnatural body proportion",
      "over-lengthened legs",
      "floating body",
      "CGI face",
      "synthetic fashion-campaign perfection"
    );
  }
  if (input.imageType === "对镜穿搭图") {
    base.push("mirror distortion", "long-leg selfie effect", "posed selfie mood");
  }
  if (input.imageType === "产品静物图") {
    base.push("props covering shoes", "floating objects", "fake product scale", "3D render feeling");
  }

  return `Avoid ${Array.from(new Set(base)).join(", ")}.`;
}

function cleanPrompt(lines: string[]) {
  return lines
    .map((line) => line.trim().replace(/[ \t]+/g, " "))
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

export function generateTeamPrompt(params: TeamPromptParams): TeamPromptOutput {
  const resolvedScene = resolveScene(params);
  const shoeRequired = hasShoe(params.imageType);
  const sceneText = sceneLines[resolvedScene];
  const shoeDisplayName = params.shoe === "自定义" && params.customShoe.trim() ? params.customShoe.trim() : params.shoe;
  const shoeLine = shoeRequired
    ? [`Main product: THERUIZ AURA ${shoeDisplayName}.`, shoeAccuracyLine, shoeVisibilityLine, shoeStyleLines[params.shoe]].join(" ")
    : "";
  const stillLifeProductLine = params.imageType === "产品静物图" ? "Keep the sneakers as the clear subject. At least one sneaker must be fully visible from toe to heel, with the second clearly readable." : "";
  const peopleLine = isPeopleImageType(params.imageType) ? modelLine : "";
  const peopleRealismLine = isPeopleImageType(params.imageType) ? humanRealismLine : "";
  const fitnessIndoorLine = getFitnessIndoorOutfitLockLine(resolvedScene);
  const userRequirementLine = params.extraRequirement.trim() ? `User extra requirement: ${params.extraRequirement.trim()}.` : "";

  const prompt = cleanPrompt([
    brandMoodLine,
    customerFeelingLine,
    getImageTypeLine(params),
    seasonLines[params.season],
    sceneText,
    fitnessIndoorLine,
    peopleLine,
    peopleRealismLine,
    shoeLine,
    stillLifeProductLine,
    getActionLine(params, resolvedScene),
    "Keep styling real and not over-arranged: natural fabric folds, believable layering, realistic proportions, grounded feet, and calm daily presence.",
    userRequirementLine,
    getNegativeLine({ imageType: params.imageType, hasShoe: shoeRequired })
  ]);

  return {
    prompt,
    hasShoe: shoeRequired,
    sceneText
  };
}
