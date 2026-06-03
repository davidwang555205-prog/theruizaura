import type {
  TeamImageType,
  TeamPromptParams,
  TeamPromptOutput,
  TeamScenePreference,
  TeamSeason
} from "../types";
import {
  chooseActiveOutfitLine,
  choosePremiumGymOutfitLine,
  choosePremiumGymSubScene,
  isActiveScene
} from "../data/activeLifestyleTemplates";
import {
  chooseOutfitLine,
  chooseSummerOutfitByScene
} from "../data/seasonalOutfits";
import { choosePerSceneOutfitLine } from "./choosePerSceneOutfitLine";
import {
  hasSummerSpecificOutfitRequest,
  hasUserSpecifiedClothingRequirement
} from "./outfitLibraryFilters";
import { buildTeamCompactPrompt, TEAM_PROMPT_MODE } from "./teamCompactPrompt";

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
    "Use a clean modern gym, movement studio, or calm stretching area with soft neutral light and minimal equipment. The scene should feel like light movement-oriented daily life, not professional training content.",
  去运动的路上:
    "Use a calm city-to-gym transition setting such as a gym entrance, clean sidewalk, parking-to-gym walkway, hotel gym route, or quiet urban movement path. The mood should feel polished, practical, and ready for light activity."
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
  return "材质工作台";
}

function resolveTeamScenePreference(params: TeamPromptParams) {
  return params.scenePreference === "自动匹配"
    ? getTeamAutoScene(params.imageType)
    : params.scenePreference;
}

function getTeamSceneText(params: TeamPromptParams, resolvedScene: TeamScenePreference) {
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

  return resolvedScene === "自动匹配" ? "" : TEAM_SCENE_TEXT[resolvedScene];
}

function getSceneLocationType(params: TeamPromptParams, resolvedScene: TeamScenePreference) {
  if (params.imageType === "对镜穿搭图" || params.imageType === "产品静物图") return "indoor";
  if (
    resolvedScene === "居家衣帽间" ||
    resolvedScene === "窗边阅读" ||
    resolvedScene === "材质工作台" ||
    resolvedScene === "拍摄花絮" ||
    resolvedScene === "旅行酒店" ||
    resolvedScene === "健身房内"
  ) {
    return "indoor";
  }

  return "outdoor";
}

function getTeamSeasonText(params: TeamPromptParams, resolvedScene: TeamScenePreference) {
  const userSpecifiedClothing = hasUserSpecifiedClothingRequirement(params.extraRequirement);

  if (!shouldUsePeopleStyling(params.imageType)) {
    return TEAM_ATMOSPHERE_SEASON[params.season];
  }

  if (userSpecifiedClothing) return "";

  const perSceneOutfitSelection = choosePerSceneOutfitLine({
    scenePreference: resolvedScene,
    season: params.season,
    shoe: params.shoe,
    imageType: resolvedScene === "健身房内" ? "gym" : params.imageType,
    userExtraRequirement: params.extraRequirement
  });

  if (perSceneOutfitSelection.selectedPerSceneOutfitLine) {
    return perSceneOutfitSelection.selectedPerSceneOutfitLine;
  }

  if (params.season === "夏" && hasSummerSpecificOutfitRequest(params.extraRequirement)) {
    return chooseSummerOutfitByScene({
      season: params.season,
      shoe: params.shoe,
      imageType: params.imageType,
      scenePreference: resolvedScene,
      userExtraRequirement: params.extraRequirement
    });
  }

  if (resolvedScene === "健身房内") {
    return choosePremiumGymOutfitLine(
      {
        scenePreference: resolvedScene,
        season: params.season,
        shoe: params.shoe,
        userExtraRequirement: params.extraRequirement
      },
      choosePremiumGymSubScene({
        scenePreference: resolvedScene,
        season: params.season,
        shoe: params.shoe,
        userExtraRequirement: params.extraRequirement
      })
    );
  }

  if (isActiveScene(resolvedScene)) {
    return chooseActiveOutfitLine({
      scenePreference: resolvedScene,
      season: params.season,
      shoe: params.shoe,
      userExtraRequirement: params.extraRequirement
    });
  }

  return chooseOutfitLine({
    season: params.season,
    shoe: params.shoe,
    imageType: params.imageType,
    scenePreference: resolvedScene,
    userExtraRequirement: params.extraRequirement
  });
}

export function generateTeamPrompt(params: TeamPromptParams): TeamPromptOutput {
  const hasShoe = resolveTeamHasShoe(params);
  const resolvedScene = resolveTeamScenePreference(params);
  const sceneText = getTeamSceneText(params, resolvedScene);
  const userSpecifiedClothing = hasUserSpecifiedClothingRequirement(params.extraRequirement);
  const fullPrompt = "";

  const prompt = buildTeamCompactPrompt({
    params,
    resolvedScene,
    sceneLocationType: getSceneLocationType(params, resolvedScene),
    hasShoe,
    seasonText: getTeamSeasonText(params, resolvedScene),
    userSpecifiedClothing,
    fullPrompt
  });

  return {
    prompt: TEAM_PROMPT_MODE === "full" && fullPrompt ? fullPrompt : prompt,
    hasShoe,
    sceneText
  };
}
