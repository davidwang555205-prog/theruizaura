import type {
  TeamImageType,
  TeamPromptParams,
  TeamPromptOutput,
  TeamScenePreference,
  TeamSeason,
  TeamShoe
} from "../types";
import {
  activeLifestyleBoundaryCompact,
  activeLifestyleNegative,
  chooseActiveOutfitLine,
  chooseLightStrengthActionLine,
  choosePremiumGymOutfitLine,
  choosePremiumGymSceneLine,
  choosePremiumGymSubScene,
  darkActiveOutfitBalanceCompact,
  isActiveScene,
  lightStrengthActionCompact,
  premiumGymActiveCompact,
  premiumGymLightingCompact,
  premiumGymNegative,
  strengthTrainingBoundaryCompact
} from "../data/activeLifestyleTemplates";
import { getActivePromptTemplate } from "../data/activePromptTemplates";
import {
  chooseOutfitLine,
  chooseSummerOutfitByScene,
  summerOutfitNegative,
  summerRealisticOutfitBoundaryCompact
} from "../data/seasonalOutfits";
import { chooseLuxuryAccessoryLine, luxuryAccessoryNegative } from "../data/luxuryAccessories";
import {
  chooseOutfitStyleProfile,
  chooseVersatilityLine,
  outfitVersatilityNegative
} from "../data/outfitStyleProfiles";
import { chooseSeasonalLuxuryStyle, seasonalLuxuryNegative } from "../data/seasonalLuxuryStyles";
import {
  activeModelConsistencyCompact,
  antiAIOutfitTextureCompact,
  chooseRealLifeDetailLine,
  colorDiversityBoundaryCompact,
  creatorIdentityBoundaryCompact,
  getAsianAppearanceBoundaryLine,
  getModelConsistencyLine,
  luxuryIdentityBoundaryCompact,
  mirrorModelConsistencyCompact,
  outfitDiversityNegative,
  peopleIdentityNegative,
  realLifeOutfitDiversityCompact,
  shouldUseModelIdentity,
  multiImageIdentityNegative
} from "../data/modelIdentityProfiles";
import {
  chooseSceneLocationType,
  chooseTimeOfDay,
  eveningLightNegative,
  getTimeOfDayLine,
  indoorEyewearNegative
} from "../data/timeOfDay";
import {
  getStillLifeProductProfile,
  getStillLifeStylePrompt,
  meshStillLifeNegative,
  metallicStillLifeNegative,
  productStillLifeBaseCompact,
  productStillLifeNegative
} from "../data/stillLifeRules";
import { chooseGazeLine } from "../data/modelGaze";
import {
  activeBodyProportionNegative,
  mirrorBodyProportionNegative,
  peopleBodyProportionNegative
} from "../data/bodyProportionProfiles";
import { actionShoeSafetyCompact, multiImageActionVariationCompact } from "../data/actionPoseProfiles";
import {
  sneakerErrorNegativeCompact,
  subtleSneakerErrorNegativeCompact,
  tiedLacesNegativeCompact
} from "../data/sneakerProtectionProfiles";
import { sceneRealismNegativeCompact } from "../data/sceneRealismProfiles";
import { detectImageCountOrSeriesIntent } from "./detectImageCountOrSeriesIntent";
import { chooseActionLine } from "./chooseActionLine";
import { chooseBodyProportionLines } from "./chooseBodyProportionLines";
import { chooseSceneRealismLines } from "./chooseSceneRealismLines";
import { chooseSneakerProtectionLines } from "./chooseSneakerProtectionLines";
import { choosePerSceneOutfitLine } from "./choosePerSceneOutfitLine";
import {
  hasSummerSpecificOutfitRequest,
  hasUserSpecifiedClothingRequirement
} from "./outfitLibraryFilters";
import { cleanFinalPrompt, dedupePromptLines } from "./promptOptimizer";

function compactJoin(parts: Array<string | undefined | false>, separator = "\n\n") {
  return parts.filter(Boolean).join(separator);
}

const TEAM_BRAND_CORE =
  "Create a premium THERUIZ AURA image in the brand’s “Quiet Warm Luxury” style: cream-white, warm beige, soft stone, natural daylight, low saturation, relaxed elegance, tactile authenticity, and believable daily sophistication. The image should feel clean but warm, refined but not distant, feminine but not sweet, real but not ordinary.";

const TEAM_CUSTOMER_FEELING =
  "The image should express that she can leave home without overthinking, walk through the day without looking tired or messy, feel comfortable without looking careless, and appear clean, composed, tasteful, and quietly put together.";

const TEAM_PRODUCT_PROTECTION =
  "Use the uploaded THERUIZ AURA sneaker as the only product reference. Strictly preserve its real shape, toe box, outsole thickness, side panels, tongue, laces, stitching, material texture, color, and proportions. Do not redesign, simplify, stretch, compress, or reinterpret the shoe.\n\nThe sneaker shape has highest priority. The foot, pants, pose, camera angle, mirror reflection, and scene must adapt to the shoe, not deform it.";

const TEAM_NON_PRODUCT_SHOE_PROTECTION =
  "If the THERUIZ AURA sneaker appears in this non-product atmosphere image, keep it subtle and secondary. Preserve its real color, material texture, and recognizable shape, but do not turn the image into a direct product shot. The shoe may appear only as a subtle partial object or background detail, not as the main product subject. Do not make the shoe the only subject. Do not force full on-foot display.";

const TEAM_PRODUCT_NEGATIVE =
  "Avoid generic e-commerce style, redesigned sneaker, distorted shoe shape, shoe-foot clipping, pants merging into shoe, oversized feet, elongated legs, AI body, blank face, influencer posing, sporty energy, cheap Taobao styling, hard studio lighting, mirror distortion, cropped shoes, and unreadable footwear.";

const TEAM_ATMOSPHERE_NEGATIVE =
  "Avoid generic stock photography, cheap lifestyle props, hard studio lighting, cluttered composition, influencer styling, loud colors, fake luxury staging, cold minimalism, messy backgrounds, and overly commercial visual language.";

const TEAM_CREATOR_NEGATIVE =
  "Avoid loud influencer styling, beauty blogger energy, exaggerated posing, internet-trendy outfit, over-styled accessories, sexy selfie mood, fake casualness, obvious content-creator performance, and any look that feels more like a social media persona than a real refined urban woman.";

const TEAM_ENHANCED_LIFELIKE_BASE =
  "Keep the woman lifelike through relaxed posture, soft gaze, subtle micro-expression, natural hand placement, realistic body proportions, and clothing that drapes like real daily wear rather than an AI-styled template.";

const TEAM_IMAGE_TYPE_TEMPLATES: Record<TeamImageType, string> = {
  产品上脚图:
    "Generate a refined on-foot lifestyle image. Use a safe standing pose or small natural walking step. The sneakers must be complete, clear, and structurally accurate. Keep trouser hems separate from the shoe collar. Avoid complex actions, shoe-foot clipping, distorted feet, exaggerated legs, or cropped shoes.",
  对镜穿搭图:
    "Generate a refined mirror outfit image. The face should be hidden by the phone or naturally cropped. Use a 3/4 or full-body mirror composition with the sneakers clearly visible. At least one sneaker must be fully visible from toe to heel, and the second sneaker must remain clearly readable. Keep mirror proportions natural, phone-hand structure believable, and trouser-shoe relationship clear. Avoid influencer selfie energy, beauty selfie, stretched legs, cropped shoes, or mirror distortion.",
  生活场景图:
    "Generate a believable lifestyle image of a refined 30–45 year old urban woman wearing THERUIZ AURA sneakers in a real daily scene such as commute, weekend city walk, premium grocery, hotel travel, or family daily movement. She should look clean, composed, comfortable, tasteful, and quietly confident.",
  非产品氛围图:
    "Generate a non-product atmospheric image for THERUIZ AURA. The product does not need to be the main subject. Use scenes such as entryway departure, window-side reading, hotel arrival, flowers and bakery return, refined worktable, or weekend errands. The image should express quiet order, warm restraint, daily elegance, calm negative space, and refined lifestyle atmosphere.",
  "拍摄花絮 / 材质图":
    "Generate a refined behind-the-scenes or material storytelling image for THERUIZ AURA. Show leather swatches, suede samples, shoelaces, color cards, care brush, product notes, shooting table, or hands arranging materials. The mood should feel real, tactile, quiet, and premium. Avoid factory feeling, messy clutter, cheap studio look, or technical catalog style.",
  产品静物图: productStillLifeBaseCompact
};

const TEAM_CREATOR_STYLING: Record<
  Extract<TeamImageType, "产品上脚图" | "对镜穿搭图" | "生活场景图">,
  string
> = {
  产品上脚图:
    "The outfit should feel easy to reference and naturally shareable, but the sneaker must remain the key styling point, not an influencer performance.",
  对镜穿搭图:
    "The mirror image should feel like a tasteful OOTD record with clear shoe-and-trouser relationship, not a beauty selfie or influencer pose.",
  生活场景图:
    "The scene should feel naturally shareable, like a quiet daily moment with outfit value, not a staged campaign or influencer check-in."
};

const TEAM_LIFELIKE_BY_TYPE: Record<
  Extract<TeamImageType, "产品上脚图" | "对镜穿搭图" | "生活场景图">,
  string
> = {
  产品上脚图:
    "The stance, feet, trouser break, and hand placement should feel like a real woman moving through daily life.",
  对镜穿搭图:
    "Even with the face hidden, the mirror selfie should feel human through relaxed shoulders, natural phone grip, believable weight shift, soft clothing drape, and clear outfit intention.",
  生活场景图:
    "The scene should feel like a real daily moment in progress, with understated movement, purposeful attention, and quiet emotional presence."
};

const TEAM_SHOE_STYLE: Record<TeamShoe, string> = {
  "Cloud Dancer 云舞者":
    "Classic clean light-tone foundation, best with white shirts, beige trousers, soft denim, and refined everyday styling.",
  "Sand Dollar 沙钱白":
    "Classic clean light-tone foundation, best with white shirts, beige trousers, soft denim, and refined everyday styling.",
  "Delphinium Blue 飞燕草蓝":
    "Low-saturation airy blue, best with white shirts, pale denim, oatmeal knitwear, and fresh spring-summer styling.",
  "Silver Romance 银色浪漫":
    "Soft moonlit metallic accent, best with warm grey, cream white, and refined urban styling. Avoid chrome, cyber, or cheap shine.",
  "Aire 微风":
    "Light breathable spring-summer feeling, best with linen, airy shirts, and light trousers. Avoid sporty running-shoe styling.",
  "Cappuccino 卡布奇诺":
    "Warm coffee suede mood, best with knitwear, oatmeal, beige, and soft autumn-winter layers. Avoid masculine or heavy styling.",
  "Lemon 柠檬":
    "Soft butter-yellow freshness, best with cream white, pale denim, and clean neutral styling. Avoid childish or high-saturation yellow.",
  "Maple Grove 枫林":
    "Warm muted maple tone, best with soft knitwear, beige-brown layers, and gentle autumn styling. Avoid heavy masculine styling.",
  "Oreo 奥利奥":
    "Clean black-white balance, best with black, white, grey, beige, and restrained daily styling. Avoid streetwear or sporty energy.",
  "Panda 熊猫":
    "Clean black-white balance, best with black, white, grey, beige, and restrained daily styling. Avoid streetwear or sporty energy.",
  自定义: "Use THERUIZ AURA’s clean, low-saturation, refined daily styling system."
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
    "Use a quiet city walk setting such as a calm street, café exterior, gallery district, bookstore street, or light stone wall. The image should feel relaxed, tasteful, and mature.",
  "精品超市 / 日常采购":
    "Use a refined daily errands setting such as a premium grocery, bakery corner, flower shop, or calm neighborhood store. The mood should feel real, warm, and tasteful.",
  旅行酒店:
    "Use a calm hotel room, hotel doorway, wardrobe mirror, suitcase corner, or soft hotel window light. The scene should feel organized, quiet, and refined, not touristy or cheap.",
  居家衣帽间:
    "Use a quiet wardrobe, bedroom, mirror, or getting-ready corner. Focus on outfit relationship, daily ease, and refined personal style.",
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
    "Use a clean modern gym, movement studio, or calm stretching area with soft neutral light and minimal equipment. The scene should feel like light movement-oriented daily life, not professional training content.",
  去运动的路上:
    "Use a calm city-to-gym transition setting such as a gym entrance, clean sidewalk, parking-to-gym walkway, hotel gym route, or quiet urban movement path. The mood should feel polished, practical, and ready for light activity."
};

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
  if (imageType === "产品静物图") return "材质工作台";
  if (imageType === "非产品氛围图") return "玄关出门";
  return "材质工作台";
}

function resolveTeamScenePreference(params: TeamPromptParams) {
  return params.scenePreference === "自动匹配"
    ? getTeamAutoScene(params.imageType)
    : params.scenePreference;
}

function getTeamSceneText(params: TeamPromptParams) {
  const scene = resolveTeamScenePreference(params);

  if (params.imageType === "产品静物图") {
    return params.scenePreference === "自动匹配"
      ? ""
      : "Use the selected scene only as subtle background mood inspiration: a product still life inspired by the selected lifestyle scene, without people, keeping the sneaker as the main subject.";
  }

  if (params.imageType === "产品上脚图" && scene === "窗边阅读") {
    return "Use a window-side lifestyle on-foot scene with soft natural light and a calm interior mood. Keep the sneakers clear, complete, and structurally accurate.";
  }

  if (params.imageType === "产品上脚图" && scene === "材质工作台") {
    return "Use a material storytelling scene with the sneaker clearly present, keeping it wearable and readable rather than turning the image into a pure still life.";
  }

  if (params.imageType === "对镜穿搭图" && scene === "拍摄花絮") {
    return "Use a mirror outfit record in a quiet getting-ready setting, not a studio behind-the-scenes image. Keep the outfit and sneakers clear.";
  }

  if (params.imageType === "非产品氛围图" && scene === "通勤上班") {
    return "Use commute-related atmosphere such as a tote bag, keys, coat, entryway, calm worktable, or soft office-transition details. Do not make it a direct on-foot product image.";
  }

  if (params.imageType === "拍摄花絮 / 材质图" && scene === "窗边阅读") {
    return "Use a quiet material table near soft window light, with tactile samples and refined working details. Do not make a reading portrait the main image.";
  }

  if (params.imageType === "生活场景图" && scene === "材质工作台") {
    return "Use a refined lifestyle scene with subtle material storytelling details, keeping the woman’s daily life and the brand atmosphere more important than a pure worktable still life.";
  }

  if (params.imageType === "生活场景图" && scene === "拍摄花絮") {
    return "Use a natural lifestyle image with a subtle behind-the-scenes feeling, not a technical studio setup.";
  }

  return TEAM_SCENE_TEXT[scene];
}

function shouldUsePeopleStyling(imageType: TeamImageType) {
  return imageType === "产品上脚图" || imageType === "对镜穿搭图" || imageType === "生活场景图";
}

function getProductStillLifePrompt(params: TeamPromptParams) {
  const profile = getStillLifeProductProfile(params.shoe, params.customShoe, params.extraRequirement);
  const stylePrompt = getStillLifeStylePrompt(params.stillLifeStyle, profile);
  const shoeStyle = getTeamShoeStyle(params, true);
  const sceneText = getTeamSceneText(params);
  const extraRequirement = params.extraRequirement.trim();
  const resolvedScene = resolveTeamScenePreference(params);
  const imageCountIntent = detectImageCountOrSeriesIntent(extraRequirement, params.imageType);
  const selectedTimeOfDay = chooseTimeOfDay({
    imageType: params.imageType,
    scenePreference: resolvedScene,
    shoe: params.shoe,
    userExtraRequirement: extraRequirement
  });
  const timeOfDayLine = getTimeOfDayLine(params.imageType, selectedTimeOfDay);
  const sceneRealismLines = chooseSceneRealismLines({
    imageType: params.imageType,
    scenePreference: resolvedScene,
    season: params.season,
    timeOfDay: selectedTimeOfDay,
    hasShoe: true,
    selectedActionLine: "",
    userExtraRequirement: extraRequirement
  });
  const sneakerProtectionLines = chooseSneakerProtectionLines({
    imageType: params.imageType,
    scenePreference: resolvedScene,
    hasShoe: true,
    selectedOutfitLine: compactJoin([stylePrompt, shoeStyle, sceneText], " "),
    selectedActionLine: "",
    userExtraRequirement: extraRequirement,
    imageCountIntent
  });
  const specialtyNegative = compactJoin(
    [
      productStillLifeNegative,
      profile === "metallicSilver" ? metallicStillLifeNegative : "",
      profile === "breathableMesh" ? meshStillLifeNegative : "",
      TEAM_PRODUCT_NEGATIVE,
      sneakerErrorNegativeCompact,
      tiedLacesNegativeCompact,
      sceneRealismNegativeCompact,
      selectedTimeOfDay === "evening" ? eveningLightNegative : ""
    ],
    "\n\n"
  );

  const body = dedupePromptLines(
    [
      TEAM_BRAND_CORE,
      productStillLifeBaseCompact,
      timeOfDayLine,
      stylePrompt,
      sceneText,
      shoeStyle,
      ...sceneRealismLines,
      ...sneakerProtectionLines,
      TEAM_PRODUCT_PROTECTION,
      specialtyNegative
    ]
      .filter(Boolean)
      .join("\n\n")
  );

  return cleanFinalPrompt(
    extraRequirement ? `${body}\n\nAdditional user requirement: ${extraRequirement}` : body
  );
}

function getTeamEnhancedLifelike(imageType: TeamImageType) {
  if (!shouldUsePeopleStyling(imageType)) return "";

  return `${TEAM_ENHANCED_LIFELIKE_BASE} ${
    TEAM_LIFELIKE_BY_TYPE[
      imageType as Extract<TeamImageType, "产品上脚图" | "对镜穿搭图" | "生活场景图">
    ]
  }`;
}

function getTeamCreatorStyling(imageType: TeamImageType) {
  if (!shouldUsePeopleStyling(imageType)) return "";

  return TEAM_CREATOR_STYLING[
    imageType as Extract<TeamImageType, "产品上脚图" | "对镜穿搭图" | "生活场景图">
  ];
}

function getTeamShoeStyle(params: TeamPromptParams, hasShoe: boolean) {
  if (!hasShoe) return "";

  const base = TEAM_SHOE_STYLE[params.shoe];
  if (params.shoe !== "自定义") return base;

  const customName = params.customShoe.trim();
  return customName ? `${base} The selected custom shoe is ${customName}.` : base;
}

export function generateTeamPrompt(params: TeamPromptParams): TeamPromptOutput {
  const hasShoe = resolveTeamHasShoe(params);
  const resolvedScene = resolveTeamScenePreference(params);
  const sceneText = getTeamSceneText(params);
  const extraRequirement = params.extraRequirement.trim();
  const selectedTimeOfDay = chooseTimeOfDay({
    imageType: params.imageType,
    scenePreference: resolvedScene,
    shoe: params.shoe,
    userExtraRequirement: extraRequirement
  });
  const sceneLocationType = chooseSceneLocationType({
    imageType: params.imageType,
    scenePreference: resolvedScene
  });
  const timeOfDayLine = getTimeOfDayLine(params.imageType, selectedTimeOfDay);
  const activeScene = isActiveScene(resolvedScene);
  const premiumGymScene = resolvedScene === "健身房内";
  const premiumGymSubScene = premiumGymScene
    ? choosePremiumGymSubScene({
        scenePreference: resolvedScene,
        season: params.season,
        shoe: params.shoe,
        userExtraRequirement: extraRequirement
      })
    : null;
  const activePromptTemplate = getActivePromptTemplate(params.imageType, resolvedScene);
  const peopleImage = shouldUseModelIdentity(params.imageType);
  const summerPeopleOutfit = peopleImage && params.season === "夏";
  const userSpecifiedClothing = hasUserSpecifiedClothingRequirement(extraRequirement);
  const summerSpecificOutfit =
    summerPeopleOutfit && hasSummerSpecificOutfitRequest(extraRequirement);
  const imageCountIntent = detectImageCountOrSeriesIntent(extraRequirement, params.imageType);

  if (params.imageType === "产品静物图") {
    return {
      prompt: getProductStillLifePrompt(params),
      hasShoe,
      sceneText
    };
  }

  const perSceneOutfitLine =
    shouldUsePeopleStyling(params.imageType) && !userSpecifiedClothing && !premiumGymScene && !activeScene && !summerSpecificOutfit
      ? choosePerSceneOutfitLine({
          scenePreference: resolvedScene,
          season: params.season,
          shoe: params.shoe,
          imageType: params.imageType,
          userExtraRequirement: extraRequirement
        })
      : null;
  const seasonText = shouldUsePeopleStyling(params.imageType)
    ? userSpecifiedClothing
      ? ""
      : premiumGymScene
        ? choosePremiumGymOutfitLine(
            {
              scenePreference: resolvedScene,
              season: params.season,
              shoe: params.shoe,
              userExtraRequirement: extraRequirement
            },
            premiumGymSubScene ?? "premiumGym"
          )
        : activeScene
          ? chooseActiveOutfitLine({
              scenePreference: resolvedScene,
              season: params.season,
              shoe: params.shoe,
              userExtraRequirement: extraRequirement
            })
          : summerSpecificOutfit
            ? chooseSummerOutfitByScene({
                season: params.season,
                shoe: params.shoe,
                imageType: params.imageType,
                scenePreference: resolvedScene,
                userExtraRequirement: extraRequirement
              })
            : perSceneOutfitLine?.compactLine ??
              chooseOutfitLine({
                season: params.season,
                shoe: params.shoe,
                imageType: params.imageType,
                scenePreference: resolvedScene,
                userExtraRequirement: extraRequirement
              })
    : TEAM_ATMOSPHERE_SEASON[params.season];
  const accessoryLine = chooseLuxuryAccessoryLine({
    imageType: params.imageType,
    shoe: params.shoe,
    season: params.season,
    scenePreference: resolvedScene,
    selectedOutfitLine: seasonText,
    userExtraRequirement: extraRequirement,
    sceneLocationType,
    selectedTimeOfDay
  });
  const outfitStyleLine = chooseOutfitStyleProfile({
    imageType: params.imageType,
    shoe: params.shoe,
    season: params.season,
    scenePreference: resolvedScene,
    selectedOutfitLine: seasonText,
    userExtraRequirement: extraRequirement
  });
  const versatilityLine = chooseVersatilityLine({
    imageType: params.imageType,
    scenePreference: resolvedScene,
    userExtraRequirement: extraRequirement
  });
  const seasonalLuxuryStyleLine = chooseSeasonalLuxuryStyle({
    imageType: params.imageType,
    shoe: params.shoe,
    season: params.season,
    scenePreference: resolvedScene,
    selectedOutfitLine: seasonText,
    selectedOutfitStyleLine: outfitStyleLine,
    selectedAccessoryLine: accessoryLine,
    userExtraRequirement: extraRequirement
  });
  const shoeStyle = getTeamShoeStyle(params, hasShoe);
  const selectedPremiumGymSceneLine = premiumGymScene ? choosePremiumGymSceneLine() : "";
  const selectedLightStrengthActionLine =
    premiumGymScene && premiumGymSubScene === "gymStrengthLight" ? chooseLightStrengthActionLine() : "";
  const modelConsistencyLine = peopleImage ? getModelConsistencyLine(imageCountIntent) : "";
  const asianAppearanceBoundaryLine = peopleImage ? getAsianAppearanceBoundaryLine() : "";
  const creatorStyling = getTeamCreatorStyling(params.imageType);
  const selectedGaze = chooseGazeLine({
    imageType: params.imageType,
    scenePreference: resolvedScene,
    isMirror: params.imageType === "对镜穿搭图",
    isProductStillLife: false,
    isBehindTheScenes:
      params.imageType === "拍摄花絮 / 材质图" ||
      resolvedScene === "拍摄花絮" ||
      resolvedScene === "材质工作台",
    userExtraRequirement: extraRequirement,
    usesCreatorStyling: Boolean(creatorStyling),
    isMultiImageSet: imageCountIntent === "multiImageSet"
  });
  const shouldUseActionPose = peopleImage || params.imageType === "拍摄花絮 / 材质图";
  const selectedAction = shouldUseActionPose
    ? chooseActionLine({
        imageType: params.imageType,
        scenePreference: resolvedScene,
        selectedGazeMode: selectedGaze.mode,
        selectedOutfitLine: seasonText,
        timeOfDay: selectedTimeOfDay,
        userExtraRequirement: extraRequirement
      })
    : null;
  const bodyProportionLines = shouldUseActionPose
    ? chooseBodyProportionLines({
        imageType: params.imageType,
        scenePreference: resolvedScene,
        isMirror: params.imageType === "对镜穿搭图",
        poseType: selectedAction?.poseType ?? "none",
        hasShoe,
        season: params.season,
        selectedOutfitLine: seasonText,
        userExtraRequirement: extraRequirement,
        imageCountIntent
      })
    : [];
  const enhancedLifelike = getTeamEnhancedLifelike(params.imageType);
  const realLifeDetailLine = peopleImage
    ? chooseRealLifeDetailLine({
        imageType: params.imageType,
        scenePreference: resolvedScene,
        selectedOutfitLine: seasonText,
        userExtraRequirement: extraRequirement
      })
    : "";
  const productProtection =
    hasShoe && params.imageType === "非产品氛围图"
      ? TEAM_NON_PRODUCT_SHOE_PROTECTION
      : hasShoe
        ? TEAM_PRODUCT_PROTECTION
        : "";
  const sneakerProtectionLines = chooseSneakerProtectionLines({
    imageType: params.imageType,
    scenePreference: resolvedScene,
    hasShoe,
    selectedOutfitLine: seasonText,
    selectedActionLine: compactJoin(
      [selectedAction?.supportLine, selectedAction?.line, selectedAction?.safetyLine],
      " "
    ),
    userExtraRequirement: extraRequirement,
    imageCountIntent
  });
  const sceneRealismLines = chooseSceneRealismLines({
    imageType: params.imageType,
    scenePreference: resolvedScene,
    season: params.season,
    timeOfDay: selectedTimeOfDay,
    hasShoe,
    selectedActionLine: compactJoin(
      [selectedAction?.supportLine, selectedAction?.line, selectedAction?.safetyLine],
      " "
    ),
    userExtraRequirement: extraRequirement
  });
  const negative = compactJoin(
    [
      hasShoe && params.imageType !== "非产品氛围图"
        ? TEAM_PRODUCT_NEGATIVE
        : TEAM_ATMOSPHERE_NEGATIVE,
      hasShoe
        ? params.imageType === "非产品氛围图"
          ? subtleSneakerErrorNegativeCompact
          : sneakerErrorNegativeCompact
        : "",
      hasShoe ? tiedLacesNegativeCompact : "",
      sceneRealismNegativeCompact,
      creatorStyling ? TEAM_CREATOR_NEGATIVE : "",
      accessoryLine ? luxuryAccessoryNegative : "",
      outfitStyleLine || versatilityLine ? outfitVersatilityNegative : "",
      seasonalLuxuryStyleLine ? seasonalLuxuryNegative : "",
      activeScene ? activeLifestyleNegative : "",
      premiumGymScene ? premiumGymNegative : "",
      summerPeopleOutfit ? summerOutfitNegative : "",
      peopleImage ? outfitDiversityNegative : "",
      peopleImage ? peopleIdentityNegative : "",
      peopleImage && imageCountIntent === "multiImageSet" ? multiImageIdentityNegative : "",
      selectedGaze.negative,
      peopleImage ? peopleBodyProportionNegative : "",
      params.imageType === "对镜穿搭图" ? mirrorBodyProportionNegative : "",
      activeScene ? activeBodyProportionNegative : "",
      selectedAction?.negative,
      sceneLocationType === "indoor" ? indoorEyewearNegative : "",
      selectedTimeOfDay === "evening" ? eveningLightNegative : ""
    ],
    "\n\n"
  );

  const body = dedupePromptLines(
    [
      TEAM_BRAND_CORE,
      shouldUsePeopleStyling(params.imageType) ? TEAM_CUSTOMER_FEELING : "",
      activePromptTemplate || TEAM_IMAGE_TYPE_TEMPLATES[params.imageType],
      modelConsistencyLine,
      selectedGaze.line,
      ...bodyProportionLines,
      selectedAction?.supportLine,
      selectedAction?.line,
      selectedAction?.safetyLine,
      timeOfDayLine,
      premiumGymScene ? premiumGymLightingCompact : "",
      enhancedLifelike,
      summerPeopleOutfit ? summerRealisticOutfitBoundaryCompact : "",
      peopleImage ? realLifeOutfitDiversityCompact : "",
      peopleImage ? colorDiversityBoundaryCompact : "",
      peopleImage ? antiAIOutfitTextureCompact : "",
      asianAppearanceBoundaryLine,
      params.imageType === "对镜穿搭图" ? mirrorModelConsistencyCompact : "",
      peopleImage && activeScene ? activeModelConsistencyCompact : "",
      shoeStyle,
      seasonText,
      premiumGymScene ? darkActiveOutfitBalanceCompact : "",
      realLifeDetailLine,
      outfitStyleLine,
      seasonalLuxuryStyleLine,
      accessoryLine,
      selectedPremiumGymSceneLine,
      creatorStyling,
      creatorStyling ? creatorIdentityBoundaryCompact : "",
      seasonalLuxuryStyleLine ? luxuryIdentityBoundaryCompact : "",
      activeScene ? activeLifestyleBoundaryCompact : "",
      premiumGymScene ? premiumGymActiveCompact : "",
      premiumGymScene ? strengthTrainingBoundaryCompact : "",
      premiumGymScene && selectedLightStrengthActionLine
        ? `${lightStrengthActionCompact} ${selectedLightStrengthActionLine}`
        : "",
      peopleImage && imageCountIntent === "multiImageSet" ? multiImageActionVariationCompact : "",
      versatilityLine,
      sceneText,
      ...sceneRealismLines,
      ...sneakerProtectionLines,
      hasShoe && shouldUseActionPose ? actionShoeSafetyCompact : "",
      productProtection,
      negative
    ]
      .filter(Boolean)
      .join("\n\n")
  );

  const finalPrompt = cleanFinalPrompt(
    extraRequirement ? `${body}\n\nAdditional user requirement: ${extraRequirement}` : body
  );

  return {
    prompt: finalPrompt,
    hasShoe,
    sceneText
  };
}
