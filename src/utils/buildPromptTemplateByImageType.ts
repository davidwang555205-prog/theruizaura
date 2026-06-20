import type { LightingSpaceType } from "../data/sceneLightingSpaceProfiles";
import type { StandardSceneKey } from "../data/outfitDiversityRules";
import type { TeamImageType } from "../types";

export type PromptTemplateKind =
  | "onFootOutdoor"
  | "launchStudio"
  | "mirrorCloset"
  | "indoorLifestyle"
  | "indoorCommercial"
  | "thresholdLifestyle"
  | "gymInterior"
  | "stillLife"
  | "detailMacro"
  | "atmosphere";

export type PromptTemplateByImageType = {
  templateKind: PromptTemplateKind;
  templateSceneLine: string;
  templateActionLine: string;
  templateNegativeLine: string;
};

export function buildPromptTemplateByImageType(input: {
  imageType: TeamImageType;
  sceneKey: StandardSceneKey;
  lightingSpaceType: LightingSpaceType;
}) {
  if (input.imageType === "产品静物图" || input.sceneKey === "stillLife") {
    return {
      templateKind: "stillLife",
      templateSceneLine:
        "Use a product-only still-life template: no model, no street scene, clear shoe scale, readable laces, tongue, outsole, panels, material texture, and restrained props that never cover the sneakers.",
      templateActionLine: "",
      templateNegativeLine: "model in still life, action pose in still life, city street in product still life, person accessories competing with product"
    } satisfies PromptTemplateByImageType;
  }

  if (input.imageType === "拍摄花絮 / 材质图" || input.sceneKey === "materialTable") {
    return {
      templateKind: "detailMacro",
      templateSceneLine:
        "Use a material-detail or behind-the-scenes template: real product photography light, tactile material samples, clear panel boundaries, shoelace and stitching detail if visible, no artificial shine, and no exaggerated texture.",
      templateActionLine: "If hands appear, keep them secondary, natural, and not covering the product or material details.",
      templateNegativeLine: "artificial shine, exaggerated texture, changed panel boundary, factory clutter, technical catalog style"
    } satisfies PromptTemplateByImageType;
  }

  if (input.sceneKey === "studioLaunch" || input.lightingSpaceType === "studioLaunchLight") {
    if (input.imageType === "非产品氛围图") {
      return {
        templateKind: "launchStudio",
        templateSceneLine:
          "Use a non-product launch-studio atmosphere template with a real seamless backdrop, restrained production traces, soft directional light, accurate tonal depth, and no direct product-hero pressure.",
        templateActionLine: "",
        templateNegativeLine:
          "product-only hero shot, fake CGI cyclorama, glossy showroom set, equipment clutter, multiple studio props, decorative prop cluster, floating studio objects, hard beauty lighting, high-saturation clothing"
      } satisfies PromptTemplateByImageType;
    }
    if (input.imageType === "对镜穿搭图") {
      return {
        templateKind: "launchStudio",
        templateSceneLine:
          "Use a launch-studio mirror outfit template with a freestanding full-length mirror, diffused directional light, stable reflection, natural phone grip, clear outfit proportions, and fully readable sneakers.",
        templateActionLine: "Use the phone as the only primary handheld object and keep all studio equipment outside the main reflection.",
        templateNegativeLine:
          "bathroom selfie, beauty-selfie light, long-leg mirror distortion, equipment blocking reflection, glossy showroom mirror set, high-saturation clothing, decorative prop cluster"
      } satisfies PromptTemplateByImageType;
    }
    return {
      templateKind: "launchStudio",
      templateSceneLine:
        "Use a launch-studio lifestyle template with a restrained seamless backdrop, soft directional product-readable light, stable floor contact, natural full-figure proportions, clear sneakers, and editorial-commercial balance.",
      templateActionLine:
        "Use one simple launch-ready stance or small controlled step with relaxed hands, natural weight shift, and unobstructed sneakers.",
      templateNegativeLine:
        "rigid showroom pose, glossy luxury set, flat catalog flash, CGI cyclorama, floating floor contact, equipment clutter, multiple studio props, decorative prop cluster, high-saturation clothing, cropped sneakers"
    } satisfies PromptTemplateByImageType;
  }

  if (input.imageType === "非产品氛围图") {
    return {
      templateKind: "atmosphere",
      templateSceneLine:
        "Use an atmosphere template: quiet real space, warm restraint, low-noise objects, believable light, and no direct product-shot pressure unless the user asks for the shoe.",
      templateActionLine: "",
      templateNegativeLine: "generic stock mood, synthetic luxury staging, random props, hard studio light"
    } satisfies PromptTemplateByImageType;
  }

  if (input.imageType === "对镜穿搭图" || input.sceneKey === "mirrorCloset") {
    return {
      templateKind: "mirrorCloset",
      templateSceneLine:
        "Use a mirror outfit template: indoor natural light, phone as the primary handheld object, face hidden or cropped, stable mirror proportions, no long-leg mirror distortion, no sunglasses indoors, and full readable sneaker visibility.",
      templateActionLine:
        "Use the phone as the only primary handheld object; do not add any second hand-held prop.",
      templateNegativeLine:
        "exterior light in mirror room, exterior shadow patterns inside mirror scene, sunglasses indoors, coffee in mirror selfie, flowers in mirror selfie, long-leg mirror distortion"
    } satisfies PromptTemplateByImageType;
  }

  if (input.sceneKey === "gymInterior" || input.lightingSpaceType === "indoorGymLight") {
    return {
      templateKind: "gymInterior",
      templateSceneLine:
        "Use a premium gym template: clean indoor gym light, muted equipment, realistic body scale, light daily movement, no sports advertisement mood, no default gym tote, and no running-shoe transformation.",
      templateActionLine:
        "Keep the gym movement simple, calm, and believable, with only one selected handheld object or no handheld prop.",
      templateNegativeLine: "sports ad lighting, sweaty influencer gym mood, bodybuilding pose, gym tote in every image, technical running shoe"
    } satisfies PromptTemplateByImageType;
  }

  if (input.lightingSpaceType === "indoorCommercialLight") {
    return {
      templateKind: "indoorCommercial",
      templateSceneLine:
        "Use an indoor commercial-space template: believable ambient light, low-noise shelf or storefront depth, unreadable labels, controlled reflections, and props that stay secondary to the outfit and sneakers.",
      templateActionLine: "Use a small realistic daily action that does not create prop clutter or block the shoes.",
      templateNegativeLine: "unreadable label clutter, showroom glare, mall lighting overload, props competing with shoes"
    } satisfies PromptTemplateByImageType;
  }

  if (input.lightingSpaceType === "indoorNaturalLight") {
    return {
      templateKind: "indoorLifestyle",
      templateSceneLine:
        "Use an indoor lifestyle template: real room depth, natural window or ambient light, grounded floor contact, practical object placement, and readable full figure and sneakers.",
      templateActionLine: "Use a small realistic daily action that fits the indoor setting and keeps the sneakers clear.",
      templateNegativeLine:
        "exterior location template in indoor room, exterior shadow patterns inside, unreal room depth, showroom-like interior, props blocking shoes"
    } satisfies PromptTemplateByImageType;
  }

  if (input.lightingSpaceType === "semiIndoorThreshold") {
    return {
      templateKind: "thresholdLifestyle",
      templateSceneLine:
        "Use a doorway or storefront-threshold lifestyle template: connected indoor-outdoor light, believable entrance depth, restrained reflections, readable full figure and sneakers, and natural daily movement.",
      templateActionLine: "Use a small realistic threshold movement such as pausing near the doorway, stepping out, or adjusting a bag.",
      templateNegativeLine:
        "flat pasted doorway, unreal threshold light, studio backdrop, unreadable signage, reflections covering shoes"
    } satisfies PromptTemplateByImageType;
  }

  if (input.imageType === "产品上脚图" || input.imageType === "生活场景图") {
    return {
      templateKind: "onFootOutdoor",
      templateSceneLine:
        "Use an outdoor lifestyle template when the scene is outside: real city street depth, natural daily action, correct street light, readable full figure and sneakers, and complete sneaker visibility.",
      templateActionLine: "Use a simple daily movement that keeps the feet grounded and the sneakers clear.",
      templateNegativeLine: "indoor studio look outdoors, foreign-looking street, tourist landmark, cropped shoes, props covering shoes"
    } satisfies PromptTemplateByImageType;
  }

  return {
    templateKind: "atmosphere",
    templateSceneLine:
      "Use an atmosphere template: quiet real space, warm restraint, low-noise objects, believable light, and no direct product-shot pressure unless the user asks for the shoe.",
    templateActionLine: "",
    templateNegativeLine: "generic stock mood, synthetic luxury staging, random props, hard studio light"
  } satisfies PromptTemplateByImageType;
}
