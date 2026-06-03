import type { TeamImageType, TeamPromptParams, TeamScenePreference } from "../types";
import { isActiveScene } from "../data/activeLifestyleTemplates";
import { buildCompactPrompt, type CompactPromptKind, type TeamPromptMode } from "./buildCompactPrompt";
import { cleanFinalPrompt, dedupePromptLines } from "./promptOptimizer";
import { sensitiveWordReducer } from "./sensitiveWordReducer";

export const TEAM_PROMPT_MODE: TeamPromptMode = "compact";

type TeamCompactPromptInput = {
  params: TeamPromptParams;
  resolvedScene: TeamScenePreference;
  sceneLocationType: string;
  hasShoe: boolean;
  seasonText: string;
  userSpecifiedClothing: boolean;
  fullPrompt: string;
  outfitLineOverride?: string;
};

const brandMoodLine =
  "Create a premium THERUIZ AURA image in Quiet Warm Luxury style: cream-white, warm beige, soft stone, natural light, low saturation, refined daily elegance, and believable comfort.";

const modelLine25to40 =
  "Use one believable Asian or subtle Asian mixed woman, 25–40, natural dark hair, clean daily makeup, real skin texture, realistic body proportions, and a calm refined presence.";

const modelLine30to45 =
  "Use one believable Asian or subtle Asian mixed woman, 30–45, natural dark hair, clean daily makeup, real skin texture, realistic body proportions, and a calm refined presence.";

const sneakerAccuracyLine =
  "Use the uploaded sneaker reference as the strict source; preserve the low-cut German trainer silhouette, toe box, slim outsole, panels, tongue, stitching, material, color, proportions, and tied laces.";

const selectedSneakerAccuracyLine =
  "Preserve the selected THERUIZ AURA German trainer shape: low-cut silhouette, rounded toe box, slim outsole, clear panels, tongue, stitching, material, color, proportions, and naturally tied laces.";

const nonProductShoeAccuracyLine =
  "If the THERUIZ AURA sneaker appears in this non-product atmosphere image, keep it subtle and secondary while preserving its real color, material texture, and recognizable shape.";

function shouldUsePeopleStyling(imageType: TeamImageType) {
  return imageType === "产品上脚图" || imageType === "对镜穿搭图" || imageType === "生活场景图";
}

function isPremiumGymScene(params: TeamPromptParams, resolvedScene: TeamScenePreference) {
  return (
    resolvedScene === "健身房内" ||
    isActiveScene(resolvedScene) ||
    (params.imageType === "生活场景图" && resolvedScene === "去运动的路上")
  );
}

function getPromptKind(params: TeamPromptParams, resolvedScene: TeamScenePreference): CompactPromptKind {
  if (params.imageType === "产品静物图") return "stillLife";
  if (params.imageType === "对镜穿搭图") return "mirror";
  if (isPremiumGymScene(params, resolvedScene)) return "gym";
  if (params.imageType === "产品上脚图") return "onFoot";
  if (params.imageType === "生活场景图") return "lifestyle";
  return "atmosphere";
}

function getImageTypeLine(params: TeamPromptParams, resolvedScene: TeamScenePreference) {
  if (params.imageType === "产品上脚图") {
    return "Generate a refined on-foot lifestyle image with a safe standing pose or small natural walking step.";
  }
  if (params.imageType === "对镜穿搭图") {
    return "Generate a refined mirror outfit image, 3/4 or full-body composition.";
  }
  if (isPremiumGymScene(params, resolvedScene)) {
    return "Generate a refined premium-gym active-lifestyle image, not a professional sportswear campaign.";
  }
  if (params.imageType === "生活场景图") {
    return "Generate a realistic lifestyle outfit image where the sneakers naturally belong in the scene.";
  }
  if (params.imageType === "产品静物图") return "Generate premium still-life product photography.";
  if (params.imageType === "拍摄花絮 / 材质图") {
    return "Generate a refined behind-the-scenes or material storytelling image with tactile development details.";
  }
  return "Generate a non-product atmospheric THERUIZ AURA image focused on quiet order, warm restraint, and daily elegance.";
}

function getModelLine(params: TeamPromptParams, resolvedScene: TeamScenePreference) {
  if (!shouldUsePeopleStyling(params.imageType)) return "";
  const mature =
    params.imageType === "生活场景图" ||
    resolvedScene === "精品超市 / 日常采购" ||
    resolvedScene === "旅行酒店" ||
    resolvedScene === "通勤上班" ||
    resolvedScene === "周末轻采购";
  return mature ? modelLine30to45 : modelLine25to40;
}

function getGazeActionLine(params: TeamPromptParams, resolvedScene: TeamScenePreference) {
  if (!shouldUsePeopleStyling(params.imageType)) return "";
  if (params.imageType === "对镜穿搭图") {
    return "Use a natural mirror outfit pose with the phone hiding or cropping the face, realistic mirror proportions, one foot slightly forward, and no long-leg distortion.";
  }
  if (isPremiumGymScene(params, resolvedScene)) {
    return "Use a calm premium-gym action such as holding a water bottle, adjusting a gym tote, pausing near equipment, or lightly holding a dumbbell, with realistic body proportions.";
  }
  return "Use a natural daily pose with relaxed posture, realistic body proportions, and scene-appropriate gaze; she may look softly at the camera or focus on the task, depending on the scene.";
}

function getSafeUserOutfitLine(extraRequirement: string, params: TeamPromptParams, resolvedScene: TeamScenePreference) {
  const text = extraRequirement.toLowerCase();
  const mentionsBlackTop = /黑色背心|black tank|black sleeveless|黑色无袖/.test(text);
  const mentionsWhiteSkirt = /白裙|white skirt/.test(text);
  const mentionsShorts = /短裤|shorts/.test(text);
  const mentionsShortSleeve = /短袖|short sleeve|short-sleeve|t-?shirt|tee/.test(text);
  const gymScene = isPremiumGymScene(params, resolvedScene);

  if (mentionsBlackTop && mentionsWhiteSkirt) {
    return "Use a black clean sleeveless top with a white midi skirt in a mature daily way, keeping the outfit refined and not pose-centered.";
  }
  if (gymScene && mentionsShorts && mentionsShortSleeve) {
    return "Use a clean short-sleeve active top with tailored active shorts and a practical gym bag for a premium movement-ready outfit.";
  }
  if (gymScene && mentionsShorts) {
    return "Use tailored active shorts with a clean active top and practical gym bag for a premium movement-ready outfit.";
  }
  if (mentionsShorts) {
    return "Use refined Bermuda shorts or tailored shorts with a clean daily top, keeping the outfit mature, wearable, and not overly bare.";
  }
  if (mentionsBlackTop) {
    return "Use a black clean sleeveless top as a grounded wardrobe anchor, styled in a mature, refined daily way.";
  }
  return "Use the user's outfit direction in a refined, mature, wearable way without making the styling pose-centered.";
}

function removeAvoidSentences(line: string) {
  return line.replace(/Avoid[^.]*\./gi, "").replace(/\s{2,}/g, " ").trim();
}

function getOutfitLine(input: TeamCompactPromptInput, extraRequirement: string) {
  if (input.outfitLineOverride) return sensitiveWordReducer(removeAvoidSentences(input.outfitLineOverride));
  const rawLine = input.userSpecifiedClothing
    ? getSafeUserOutfitLine(extraRequirement, input.params, input.resolvedScene)
    : input.seasonText;
  return sensitiveWordReducer(rawLine);
}

function getSceneLine(input: TeamCompactPromptInput, extraRequirement: string) {
  const { params, resolvedScene, sceneLocationType } = input;
  const lowerExtra = extraRequirement.toLowerCase();

  if (params.imageType === "产品静物图") {
    return "Use a real still-life photography setup with believable surface texture, soft shadows, restrained props, and clear product scale.";
  }
  if (isPremiumGymScene(params, resolvedScene)) {
    return "Use a clean premium gym or boutique fitness space with muted equipment, warm grey flooring, controlled lighting, and no crowded sports-brand atmosphere.";
  }
  if (/咖啡|cafe|café|storefront|店外/.test(lowerExtra)) {
    return "Use a realistic café storefront street scene with restrained signage, muted sidewalk texture, soft natural light, and subtle background life.";
  }
  if (params.imageType === "对镜穿搭图" || sceneLocationType === "indoor") {
    return "Use a believable real room or mirror space with natural depth, grounded floor contact, soft light, and practical object placement.";
  }
  if (resolvedScene === "周末城市散步" || resolvedScene === "通勤上班" || resolvedScene === "精品超市 / 日常采购") {
    return "Use a believable low-noise urban street setting with sidewalk texture, muted storefront depth, soft natural light, and subtle background life.";
  }
  return "Use a believable low-noise daily setting with natural light, grounded spatial logic, restrained props, and calm THERUIZ AURA atmosphere.";
}

function getSneakerAccuracyLine(params: TeamPromptParams, hasShoe: boolean) {
  if (!hasShoe) return "";
  if (params.imageType === "非产品氛围图") return nonProductShoeAccuracyLine;
  return params.shoe === "自定义" && !params.customShoe.trim() ? selectedSneakerAccuracyLine : sneakerAccuracyLine;
}

function getShoeVisibilityLine(params: TeamPromptParams, hasShoe: boolean) {
  if (!hasShoe) return "";
  if (params.imageType === "非产品氛围图") {
    return "The shoe may appear only as a subtle partial object or background detail, not as the main product subject or full on-foot display.";
  }
  if (params.imageType === "产品静物图" || params.imageType === "拍摄花絮 / 材质图") {
    return "Keep the sneaker as the main subject, fully readable, with clear laces, tongue, outsole profile, material texture, and no prop covering the shoe shape.";
  }
  return "Keep at least one sneaker fully visible from toe to heel and the second clearly readable, with clean trouser or skirt-to-shoe separation and grounded floor contact.";
}

function getNegativeLine(input: TeamCompactPromptInput, extraRequirement: string) {
  const { params, resolvedScene, hasShoe, sceneLocationType } = input;
  const phrases = hasShoe
    ? [
        "non-Asian models",
        "Western runway face",
        "influencer posing",
        "AI beige-template styling",
        "distorted body proportions",
        "stiff hands",
        "fake scenery",
        "loud logos",
        "messy background",
        "sneaker deformation",
        "chunky sole",
        "running-shoe transformation",
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
        "loud colors",
        "fake luxury staging",
        "cold minimalism",
        "messy backgrounds",
        "overly commercial visual language"
      ];

  if (params.imageType === "对镜穿搭图") phrases.push("mirror distortion", "long-leg selfie effect", "posed selfie mood");
  if (isPremiumGymScene(params, resolvedScene)) phrases.push("bodybuilding", "sweaty gym influencer", "technical sportswear");
  if (sceneLocationType === "outdoor" || resolvedScene === "周末城市散步" || /咖啡|cafe|café|店外/.test(extraRequirement.toLowerCase())) {
    phrases.push("gibberish signage", "crowded traffic", "people blocking shoes");
  }
  if (params.imageType === "产品静物图") phrases.push("props covering shoes", "floating objects", "fake product scale");

  return `Avoid ${Array.from(new Set(phrases)).join(", ")}.`;
}

export function buildTeamCompactPrompt(input: TeamCompactPromptInput) {
  const extraRequirement = input.params.extraRequirement.trim();
  return dedupePromptLines(
    sensitiveWordReducer(
      cleanFinalPrompt(
        buildCompactPrompt({
          brandMoodLine,
          imageTypeLine: getImageTypeLine(input.params, input.resolvedScene),
          modelLine: getModelLine(input.params, input.resolvedScene),
          gazeActionLine: getGazeActionLine(input.params, input.resolvedScene),
          outfitLine: getOutfitLine(input, extraRequirement),
          sceneLine: getSceneLine(input, extraRequirement),
          sneakerAccuracyLine: getSneakerAccuracyLine(input.params, input.hasShoe),
          shoeVisibilityLine: getShoeVisibilityLine(input.params, input.hasShoe),
          realismLine:
            "Keep the image realistic and lived-in, with natural fabric drape, believable light, correct spatial logic, relaxed posture, and no AI mannequin feeling.",
          negativeLine: getNegativeLine(input, extraRequirement),
          userExtraRequirement: extraRequirement,
          promptMode: TEAM_PROMPT_MODE,
          promptKind: getPromptKind(input.params, input.resolvedScene),
          fullPrompt: input.fullPrompt
        })
      )
    )
  );
}
