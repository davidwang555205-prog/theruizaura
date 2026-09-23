import type { CommercialIntentId } from "../types";
import type {
  CommercialDirectorConceptId,
  CommercialGraphicComposition,
} from "./types";

export type CommercialDirectorConceptDefinition = {
  id: CommercialDirectorConceptId;
  label: string;
  globalRule: string;
  cameraRule: string;
  graphicRule: string;
  productRule: string;
  heroRule: string;
  releaseRule: string;
  soundRule: string;
  compatibleIntents: CommercialIntentId[];
  pseudoLuxuryRisk: string;
};

export const COMMERCIAL_DIRECTOR_CONCEPT_CATALOG: Record<
  CommercialDirectorConceptId,
  CommercialDirectorConceptDefinition
> = {
  STATIC_CAMERA_FILM: {
    id: "STATIC_CAMERA_FILM",
    label: "Static Camera Film",
    globalRule: "The camera never follows the subject; every composition is already waiting before the action begins.",
    cameraRule: "Keep each camera position fixed and let human movement, world movement, and editing provide the energy.",
    graphicRule: "Build clear internal geometry inside a fixed frame; use negative space and unequal subject placement rather than centered presentation.",
    productRule: "Product becomes clear when the person moves into the exact waiting composition; never chase or push in for the product.",
    heroRule: "The HERO is the moment the person and worn product settle into a composition that has been waiting through the film.",
    releaseRule: "Let the camera remain after the subject leaves or settles, so the final image is the world holding its position.",
    soundRule: "Let room tone or street ambience continue before and after the subject's movement.",
    compatibleIntents: ["URBAN_MOTION", "DAILY_STYLING", "QUIET_LUXURY", "PRODUCT_CRAFT", "NEW_ARRIVAL"],
    pseudoLuxuryRisk: "Do not replace movement with five empty poses.",
  },
  PARTIAL_OBSCURATION: {
    id: "PARTIAL_OBSCURATION",
    label: "Partial Obscuration",
    globalRule: "The viewer rarely receives a perfectly clean view; motivated foreground obstruction keeps the image found rather than staged.",
    cameraRule: "Use door edges, glass, architecture, furniture, or passing life as foreground layers without hiding the product at HERO.",
    graphicRule: "Use foreground layers, residual negative space, and frame-within-frame relationships to create depth and partial information.",
    productRule: "Product is first understood through a partial signal and becomes fully readable when the obstruction clears or moves aside.",
    heroRule: "Let the foreground obstruction clear just enough for a complete worn-product read at HERO.",
    releaseRule: "Let a real foreground element reclaim part of the frame as the subject leaves, preserving the device to the end.",
    soundRule: "Keep environmental sound present behind the foreground layer and let it continue into the release.",
    compatibleIntents: ["URBAN_MOTION", "DAILY_STYLING", "QUIET_LUXURY", "PRODUCT_CRAFT", "NEW_ARRIVAL"],
    pseudoLuxuryRisk: "Do not use unmotivated black bars, artificial blur, or surreal occlusion.",
  },
  EDGE_OF_FRAME: {
    id: "EDGE_OF_FRAME",
    label: "Edge Of Frame",
    globalRule: "Important human and product information often sits near the visual edge rather than at the center.",
    cameraRule: "Use off-center placement, late entry, early exit, and deliberate crop while keeping the worn product understandable.",
    graphicRule: "Use asymmetric visual weight, edge placement, partial crop, and negative space as deliberate graphic decisions.",
    productRule: "Product discovery happens when the body or camera arrangement brings the edge information into readable relationship with the human form.",
    heroRule: "At HERO, the edge placement resolves into a stable but intentionally off-center worn composition.",
    releaseRule: "Let the subject leave toward the established edge or let the frame hold the edge after departure.",
    soundRule: "Let environmental sound remain spatial and off-screen, not centered around the subject.",
    compatibleIntents: ["URBAN_MOTION", "QUIET_LUXURY", "PRODUCT_CRAFT", "NEW_ARRIVAL"],
    pseudoLuxuryRisk: "Do not confuse deliberate asymmetry with accidental bad framing.",
  },
  THRESHOLD_CHAIN: {
    id: "THRESHOLD_CHAIN",
    label: "Threshold Chain",
    globalRule: "The film is organized around crossing real boundaries, with each crossing advancing the same spatial idea.",
    cameraRule: "Place the camera on one side of a boundary and let the subject cross into or out of the frame.",
    graphicRule: "Use door edges, curbs, shadows, glass, and architectural openings as geometric divisions inside the frame.",
    productRule: "Product becomes clear while the subject crosses a real threshold, then remains part of the next spatial state.",
    heroRule: "The HERO occurs as the final threshold crossing makes the worn product readable in the new space.",
    releaseRule: "Let the final threshold close or settle the spatial sequence rather than opening another route.",
    soundRule: "Use a restrained acoustic change at one or two real thresholds; do not add a sound effect to every cut.",
    compatibleIntents: ["DAILY_STYLING", "NEW_ARRIVAL", "URBAN_MOTION"],
    pseudoLuxuryRisk: "Do not use five unrelated symbolic doorways.",
  },
  REFLECTION_WORLD: {
    id: "REFLECTION_WORLD",
    label: "Reflection World",
    globalRule: "Some important information is perceived indirectly through real reflections before it resolves into direct physical view.",
    cameraRule: "Use glass, windows, polished surfaces, and neighboring architecture as motivated layered views.",
    graphicRule: "Use foreground reflection, frame-within-frame, deep plane, and soft double-image relationships without surreal duplication.",
    productRule: "Product is first implied through a reflection or layered surface, then becomes physically clear without losing reference fidelity.",
    heroRule: "Resolve the indirect visual language into a direct, worn-product read at HERO.",
    releaseRule: "Let the reflection continue after the subject moves, so the world retains the image.",
    soundRule: "Keep distant traffic, room tone, and reflected city movement subtle and physically motivated.",
    compatibleIntents: ["URBAN_MOTION", "QUIET_LUXURY", "NEW_ARRIVAL"],
    pseudoLuxuryRisk: "Do not invent mirror duplicates, impossible reflections, or random glass beauty shots.",
  },
  LIGHT_REVEAL: {
    id: "LIGHT_REVEAL",
    label: "Light Reveal",
    globalRule: "Light, body movement, or spatial change reveals the product instead of camera magnification.",
    cameraRule: "Keep camera movement restrained and let changing light or subject movement expose the worn relationship.",
    graphicRule: "Use light falloff, shadow edge, deep plane, and asymmetric placement to define where information becomes visible.",
    productRule: "Product becomes readable when the person moves into a real light condition; never use a sudden product close-up.",
    heroRule: "Let the final stable light condition resolve the complete worn-product read at HERO.",
    releaseRule: "Let the light remain after the subject movement resolves, giving the world the final image.",
    soundRule: "Keep room tone and surface contact subtle enough that the light change remains the perceptual event.",
    compatibleIntents: ["QUIET_LUXURY", "PRODUCT_CRAFT", "DAILY_STYLING"],
    pseudoLuxuryRisk: "Do not use golden-hour decoration, random lens flare, or unmotivated glow.",
  },
  WORLD_MOVES_SUBJECT_SETTLES: {
    id: "WORLD_MOVES_SUBJECT_SETTLES",
    label: "World Moves Subject Settles",
    globalRule: "The subject gradually becomes still while the world continues moving behind or around her.",
    cameraRule: "Keep the subject in a stable frame while background life, reflections, or environmental movement continues.",
    graphicRule: "Use deep plane, foreground stillness, background movement, and unequal visual weight to separate subject and world.",
    productRule: "Product becomes clear as the body settles against a world that keeps moving.",
    heroRule: "The HERO holds the subject still enough to read the worn product while the environment remains alive.",
    releaseRule: "Let the environment continue after the subject stops; the final state belongs to the world.",
    soundRule: "Let street, room, or distant-human sound continue after body contact settles.",
    compatibleIntents: ["URBAN_MOTION", "QUIET_LUXURY", "NEW_ARRIVAL", "PRODUCT_CRAFT"],
    pseudoLuxuryRisk: "Do not use slow motion or empty background movement as decoration.",
  },
  REPEATED_GESTURE: {
    id: "REPEATED_GESTURE",
    label: "Repeated Gesture",
    globalRule: "One small human gesture or physical relationship returns with variation across the film.",
    cameraRule: "Observe each recurrence from a different physical relationship while keeping the gesture recognizable.",
    graphicRule: "Use repeated frame geometry, edge placement, and asymmetric weight to make the variation visible.",
    productRule: "Product understanding grows through the recurring gesture rather than repeated product presentation.",
    heroRule: "The final recurrence clarifies the worn product's role through the gesture's completed variation.",
    releaseRule: "Let the gesture resolve into stillness, departure, or environmental continuation without a new idea.",
    soundRule: "Use one repeated natural sound relationship, such as floor contact or fabric movement, with variation.",
    compatibleIntents: ["URBAN_MOTION", "DAILY_STYLING", "QUIET_LUXURY", "NEW_ARRIVAL"],
    pseudoLuxuryRisk: "Do not mechanically repeat the same gesture five times or turn it into choreography.",
  },
};

export function conceptGraphicBase(
  concept: CommercialDirectorConceptId,
  shotIndex: number
): CommercialGraphicComposition {
  const edge = shotIndex % 2 === 0 ? "subject placed toward frame edge" : "subject offset from center";
  const base: CommercialGraphicComposition = {
    negativeSpace: "keep a deliberate unequal area of breathing space",
    asymmetricWeight: edge,
    frameWithinFrame: concept === "PARTIAL_OBSCURATION" || concept === "REFLECTION_WORLD"
      ? "use a real foreground or reflected frame-within-frame"
      : "keep one architectural or spatial line organizing the frame",
    foregroundLayer: concept === "PARTIAL_OBSCURATION"
      ? "retain a motivated foreground layer that partially obscures and clears"
      : "keep foreground depth physically credible",
    deepPlane: "preserve a readable deeper plane of lived-in world",
    edgePlacement: shotIndex === 4 ? "let the final subject position relate to the established edge" : edge,
    geometricDivision: concept === "THRESHOLD_CHAIN"
      ? "use a real threshold, curb, glass, or shadow line as the division"
      : "use a real architectural or spatial division",
  };
  if (concept === "STATIC_CAMERA_FILM") {
    base.deepPlane = "let human movement cross a fixed deep-plane composition";
  }
  if (concept === "LIGHT_REVEAL") {
    base.geometricDivision = "use a real light or shadow edge as the visual division";
  }
  if (concept === "WORLD_MOVES_SUBJECT_SETTLES") {
    base.deepPlane = "keep background life moving behind the settling subject";
  }
  if (concept === "REPEATED_GESTURE") {
    base.frameWithinFrame = "repeat one restrained frame relationship with visible variation";
  }
  return base;
}
