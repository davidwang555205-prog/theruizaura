import {
  NON_PRODUCT_ATMOSPHERE_SCENE_LINES,
  NON_PRODUCT_ATMOSPHERE_SCENES,
  NON_PRODUCT_ATMOSPHERE_VARIATIONS,
  NON_PRODUCT_ATMOSPHERE_SCENE_REGISTRY,
  type AtmosphereSceneArchetype,
  type AtmosphereSceneId,
  type AtmosphereVariation
} from "../data/nonProductAtmosphereSceneLines";
import { brandVisualMother } from "../visual-system";

export const NON_PRODUCT_ATMOSPHERE_CONTENT_TYPE = "non_product_atmosphere" as const;
export const NON_PRODUCT_ATMOSPHERE_PROVIDER = "image2" as const;
export const NON_PRODUCT_ATMOSPHERE_PROMPT_VERSION = "non-product-atmosphere-image2-v1" as const;
export const NON_PRODUCT_ATMOSPHERE_COUNTS = [1, 3, 5, 8] as const;
export type NonProductAtmosphereCount = (typeof NON_PRODUCT_ATMOSPHERE_COUNTS)[number];
export const NON_PRODUCT_ATMOSPHERE_ASPECT_RATIOS = ["4:5", "9:16", "1:1"] as const;
export type NonProductAtmosphereAspectRatio = (typeof NON_PRODUCT_ATMOSPHERE_ASPECT_RATIOS)[number];

export type ProductEchoProfile = {
  sourceMode: "CURRENT_TASK_REFERENCE_ONLY";
  sourceReferenceIds: string[];
  primaryEchoColor: string;
  secondaryEchoColor?: string;
  materialEchoes: string[];
  emotionalEchoes: string[];
  seasonalEcho?: string;
  lifestyleEchoes: string[];
  prohibitedDirections: string[];
  provenance: { taskId: string; referenceAssetIds: string[]; analysisVersion: string; generatedForCurrentTask: true };
};

export type ContinuityMode = "IDENTITY_CONTINUITY" | "OUTFIT_CONTINUITY" | "STYLE_ONLY_CONTINUITY" | "NO_CONTINUITY";
export type ProductEchoChannel = "MATERIAL_TACTILITY" | "SURFACE_FINISH" | "LIGHT_TEMPERATURE" | "SEASONAL_FEELING" | "EMOTIONAL_TONE" | "RESTRAINED_HUE";
export type EchoCarrierCategory = "AMBIENT_LIGHT" | "SHADOW" | "TEXTILE" | "PAPER" | "CERAMIC" | "GLASS" | "WOOD" | "WALL_REFLECTION" | "SMALL_NATURAL_ELEMENT" | "NO_PHYSICAL_CARRIER";
export type ProductEchoRoute = { primaryChannel: ProductEchoChannel; secondaryChannel?: ProductEchoChannel; sourceAnalysisId: string; currentTaskReferenceIds: string[]; routingReason: string; hueUsage: "none" | "micro_accent" | "subtle_secondary"; maxHueCoverage: "none" | "very_small" | "small"; selectedCarrierId?: string; selectedCarrierCategory: EchoCarrierCategory; antiLiteralMappingPassed: true };
export type SceneObjectSelection = { selectedObjects: string[]; selectionSource: "SCENE_AND_LIFE_TRACE_ONLY"; colorIndependentSelection: true };
export type AntiLiteralEchoPolicy = { forbidColorToObjectTypeMapping: true; forbidObjectInjectionForHueEcho: true; forbidFullSceneHueTheming: true; forbidProductShapeAnalogy: true; forbidRepeatedCarrierInSet: true; allowHueOnlyAsSubtleProperty: true };
export type AtmosphereVariationSignature = { sceneId: AtmosphereSceneId; lifeTraceId: string; dominantPlane: string; cameraHeight: string; depthPattern: string; dominantObject: string; productEchoPrimaryChannel: ProductEchoChannel; productEchoSecondaryChannel?: ProductEchoChannel; echoCarrierCategory: EchoCarrierCategory; hueUsage: "none" | "micro_accent" | "subtle_secondary" };
export type ProductEchoExpressionQA = { productEchoSourceValid: boolean; primaryChannelValid: boolean; nonHueChannelPreferred: boolean; sceneObjectsSelectedIndependentlyFromColor: boolean; carrierAlreadyJustifiedByScene: boolean; literalColorMatchingPropDetected: boolean; objectInjectedOnlyForHueEcho: boolean; fullSceneHueThemeDetected: boolean; repeatedCarrierDetected: boolean; repeatedPrimaryChannelDetected: boolean; flowerSelectedBecauseOfProductHue: boolean; multipleHueCarriersDetected: boolean };
export type SceneFingerprint = Pick<AtmosphereSceneArchetype, "id" | "indoorOutdoor" | "dominantPlane" | "cameraHeight" | "depthPattern" | "dominantObject">;
export type AtmosphereSceneQA = { expectedSceneMatched: boolean; requiredSpatialCuesFound: string[]; missingRequiredSpatialCues: string[]; forbiddenSceneCuesFound: string[]; collageDetected: boolean; repeatedPreviousScene: boolean; dominantObjectRepeated: boolean; productEchoSourceValid: boolean; currentTaskReferenceProvenanceValid: boolean };
export type AtmospherePromptPackage = { provider: "image2"; generationCount: 1; standaloneImage: true; isolatedGenerationRequired: true; reusePreviousConversation: false; reusePreviousGeneratedImage: false; continuityMode: "STYLE_ONLY_CONTINUITY"; productEchoSourceMode: "CURRENT_TASK_REFERENCE_ONLY"; referenceAssetIds: string[]; externalReferenceAttachmentRequired: true };

export type NonProductAtmosphereSlot = {
  id: string;
  sceneId: string;
  sceneLabel: string;
  sceneLine: string;
  lifeMoment: string;
  objectCue: string;
  variation: AtmosphereVariation;
  differenceDimensions: string[];
};

export type NonProductAtmosphereImagePlan = {
  id: string;
  index: number;
  prompt: string;
  slot: NonProductAtmosphereSlot;
  sceneFingerprint: SceneFingerprint;
  promptPackage: AtmospherePromptPackage;
  sceneQA: AtmosphereSceneQA;
  sceneObjectSelection: SceneObjectSelection;
  productEchoRoute: ProductEchoRoute;
  variationSignature: AtmosphereVariationSignature;
  productEchoExpressionQA: ProductEchoExpressionQA;
  productReferenceUse: "visual_echo_extraction_only";
  productVisibility: "forbidden";
  footwearVisibility: "forbidden";
  personVisibility: "forbidden";
  modelGeneration: "disabled";
  outfitGeneration: "disabled";
  onFootGeneration: "disabled";
};

export type NonProductAtmospherePlan = {
  contentType: typeof NON_PRODUCT_ATMOSPHERE_CONTENT_TYPE;
  provider: typeof NON_PRODUCT_ATMOSPHERE_PROVIDER;
  promptVersion: typeof NON_PRODUCT_ATMOSPHERE_PROMPT_VERSION;
  quantity: NonProductAtmosphereCount;
  productEchoProfile: ProductEchoProfile;
  referenceImageCount: number;
  referenceAssetIds: string[];
  taskId: string;
  aspectRatio: NonProductAtmosphereAspectRatio;
  images: NonProductAtmosphereImagePlan[];
};

export type BuildNonProductAtmospherePlanInput = {
  quantity: NonProductAtmosphereCount;
  generationNonce?: number;
  referenceImageCount?: number;
  season?: "春" | "夏" | "秋" | "冬";
  aspectRatio?: NonProductAtmosphereAspectRatio;
  taskId?: string;
  referenceAssetIds?: string[];
};

type ObjectCue = { id: string; text: string };

const OBJECT_CUES: ObjectCue[] = [
  { id: "used-cup", text: "one used ceramic cup with a believable trace of recent use" },
  { id: "open-book", text: "one open book or magazine with a naturally shifted page" },
  { id: "receipt-and-bag", text: "one folded tote edge beside a small receipt or bread paper bag" },
  { id: "folded-coat", text: "one softly folded coat or knit textile with natural fabric creases" },
  { id: "flowers", text: "one restrained paper-wrapped flower bundle placed after returning home" },
  { id: "travel-card", text: "one travel card, room card, or folded itinerary with a small travel object" },
  { id: "material-touch", text: "one tactile linen, washed cotton, matte ceramic, or frosted-glass surface" },
  { id: "quiet-trace", text: "one subtle displaced everyday object that proves recent human use without showing anyone" }
];

export const NON_PRODUCT_ATMOSPHERE_PROMPT_REGISTRY = {
  contentType: NON_PRODUCT_ATMOSPHERE_CONTENT_TYPE,
  provider: NON_PRODUCT_ATMOSPHERE_PROVIDER,
  promptVersion: NON_PRODUCT_ATMOSPHERE_PROMPT_VERSION,
  status: "active" as const,
  roles: [
    "brand_core", "product_reference_read_only", "product_echo_translation", "life_moment",
    "scene_and_object", "composition", "product_footwear_prohibition", "person_prohibition",
    "multi_output_variation", "negative_constraints"
  ] as const
};

function activeVisualSystemRule() {
  const positioning = brandVisualMother.core_positioning.split(" /")[0] || "Quiet Warm Luxury";
  return `Active Visual System inheritance: ${brandVisualMother.brand} brand visual mother v${brandVisualMother.version}, status ${brandVisualMother.status}, is the highest visual authority. Inherit its palette, light, material, space, composition, realism, and brand-boundary rules. Do not create a module-specific aesthetic system. ${brandVisualMother.brand} is ${positioning}.`;
}
const BRAND_CORE = `Create a ${brandVisualMother.brand} non-product lifestyle atmosphere image guided by ${brandVisualMother.core_positioning.split(" /")[0] || "Quiet Warm Luxury"}. Express warm restraint, calm negative space, mature relaxed elegance, tactile authenticity, quiet daily order, low-saturation color, soft natural daylight, and believable lived-in atmosphere. The image must feel warm, restrained, mature, calm, tactile, and real.`;
const EXTERNAL_REFERENCE_RULE = "Use the actual reference image attached in the external image-generation tool as the sole visual source for Product Echo. Read its color family, material tactility, surface finish, emotional tone, and seasonal feeling at generation time. Do not use a website-uploaded reference image as the source for this copied Prompt. Reference use is visual_echo_extraction_only. The website reference-upload field is reserved for the future server/API generation path.";
const PRODUCT_ECHO_RULE = "Translate the product's visual qualities into unrelated but believable lifestyle elements. Use only restrained visual echoes through color, texture, light, atmosphere, or everyday objects. The connection must be subtle, indirect, and emotionally readable. Do not create an obvious product-color theme or color the entire scene according to the product. If Product Echo conflicts with the Active Visual System, lower saturation and follow the brand's cream, warm beige, pale stone, warm-grey, natural-material, and quiet-light order.";
const COMPOSITION_RULE = "Use calm negative space and natural visual flow. Do not create a centered hero object, flatlay composition, symmetrical styling, evenly spaced props, showroom arrangement, or advertising hierarchy. Allow natural cropping, partial occlusion, depth, and believable visual imbalance.";
const HARD_PROHIBITIONS = "Do not show the uploaded product. Do not show any sneaker, shoe, footwear, product substitute, product fragment, product-like object, product packaging used as product display, or any other brand footwear. Do not show any person, model, face, portrait, hand, foot, leg, body fragment, reflection, silhouette, human shadow, mirror person, on-foot styling, outfit display, or human action. Product visibility = forbidden. Footwear visibility = forbidden. Person visibility = forbidden. Model generation = disabled. Outfit generation = disabled. On-foot generation = disabled.";
const NEGATIVE_CONSTRAINTS = "Avoid luxury real-estate interiors, showroom styling, home-furnishing advertising, bedding advertising, interior-design editorial, coffee-brand advertising, flower-shop advertising, generic lifestyle moodboards, Pinterest styling, influencer clichés, decorative prop collections, artificial symmetry, empty CGI spaces, loud color blocking, and category drift.";

const SEASON_LINES = {
  春: "Use soft spring daylight and airy restrained tactile surfaces.",
  夏: "Use breathable summer light, soft shade, and light natural materials without resort styling.",
  秋: "Use mellow autumn daylight, warm-grey shadows, and muted tactile layers.",
  冬: "Use soft winter light, warm-neutral tactile surfaces, and believable quiet shadows."
} as const;

export function buildProductEchoProfile(season: keyof typeof SEASON_LINES = "春"): ProductEchoProfile {
  return {
    sourceMode: "CURRENT_TASK_REFERENCE_ONLY",
    sourceReferenceIds: [],
    primaryEchoColor: "analyzed from the current task reference at Image2 generation time",
    secondaryEchoColor: "derived only from the current task reference",
    materialEchoes: ["matte ceramic", "washed cotton", "linen", "frosted glass", "quiet paper texture"],
    emotionalEchoes: ["warm restraint", "mature calm", "quiet daily order", "soft tactile authenticity"],
    seasonalEcho: SEASON_LINES[season],
    lifestyleEchoes: ["recent daily use", "returning home", "reading pause", "work pause", "short travel trace"],
    prohibitedDirections: ["product display", "footwear", "person or body trace", "obvious product-color theme", "generic lifestyle moodboard"],
    provenance: { taskId: "", referenceAssetIds: [], analysisVersion: "deferred-external-image2-v1", generatedForCurrentTask: true }
  };
}

export class AtmosphereCompileError extends Error {
  constructor(public readonly code: "PRODUCT_ECHO_SOURCE_MISSING" | "SCENE_DIVERSITY_DIAGNOSTIC", message: string) { super(message); }
}

const SCENE_ORDER: AtmosphereSceneId[] = ["ENTRYWAY_DEPARTURE", "READING_CORNER", "RETURN_HOME_TABLE", "WORKTABLE_PAUSE", "HOTEL_TRAVEL", "CAFE_FRONT", "WARDROBE_MORNING", "MATERIAL_LIGHT_SPACE"];
const ECHO_CHANNEL_ORDER: ProductEchoChannel[] = ["MATERIAL_TACTILITY", "LIGHT_TEMPERATURE", "SURFACE_FINISH", "SEASONAL_FEELING", "EMOTIONAL_TONE", "RESTRAINED_HUE"];
const CARRIER_BY_SCENE: Record<AtmosphereSceneId, EchoCarrierCategory> = { ENTRYWAY_DEPARTURE: "TEXTILE", READING_CORNER: "AMBIENT_LIGHT", RETURN_HOME_TABLE: "CERAMIC", WORKTABLE_PAUSE: "PAPER", HOTEL_TRAVEL: "GLASS", CAFE_FRONT: "SHADOW", WARDROBE_MORNING: "TEXTILE", MATERIAL_LIGHT_SPACE: "NO_PHYSICAL_CARRIER" };
const ANTI_LITERAL_POLICY: AntiLiteralEchoPolicy = { forbidColorToObjectTypeMapping: true, forbidObjectInjectionForHueEcho: true, forbidFullSceneHueTheming: true, forbidProductShapeAnalogy: true, forbidRepeatedCarrierInSet: true, allowHueOnlyAsSubtleProperty: true };

function sceneFingerprint(archetype: AtmosphereSceneArchetype): SceneFingerprint {
  return { id: archetype.id, indoorOutdoor: archetype.indoorOutdoor, dominantPlane: archetype.dominantPlane, cameraHeight: archetype.cameraHeight, depthPattern: archetype.depthPattern, dominantObject: archetype.dominantObject };
}

function buildSceneLock(archetype: AtmosphereSceneArchetype, previous: SceneFingerprint[]): string {
  if (previous.length === 0) return "SCENE DIVERSITY LOCK: No prior card structure. Establish this scene only.";
  return `SCENE DIVERSITY LOCK: Other cards already used ${previous.map((item) => `${item.id} (${item.dominantPlane}, ${item.cameraHeight}, ${item.depthPattern}, ${item.dominantObject})`).join("; ")}. Do not reuse their location, room type, furniture, window arrangement, camera position, dominant object, or composition. This card uses ${archetype.id}: ${archetype.dominantPlane}-dominant, ${archetype.cameraHeight} viewpoint, ${archetype.depthPattern} depth, ${archetype.dominantObject} life trace.`;
}

function routeProductEcho(archetype: AtmosphereSceneArchetype, index: number, referenceAssetIds: string[], taskId: string): ProductEchoRoute {
  const primaryChannel = ECHO_CHANNEL_ORDER[index % ECHO_CHANNEL_ORDER.length];
  const carrier = CARRIER_BY_SCENE[archetype.id];
  return { primaryChannel, secondaryChannel: primaryChannel === "RESTRAINED_HUE" ? "MATERIAL_TACTILITY" : "EMOTIONAL_TONE", sourceAnalysisId: `${taskId}:deferred-external-image2-v1`, currentTaskReferenceIds: referenceAssetIds, routingReason: "Route by stable card and scene identity; scene objects are selected before Product Echo and no product color is read by this selector.", hueUsage: primaryChannel === "RESTRAINED_HUE" ? "micro_accent" : "none", maxHueCoverage: primaryChannel === "RESTRAINED_HUE" ? "very_small" : "none", selectedCarrierId: `${archetype.id}:${carrier}`, selectedCarrierCategory: carrier, antiLiteralMappingPassed: true };
}

function buildPrompt(archetype: AtmosphereSceneArchetype, variation: AtmosphereVariation, profile: ProductEchoProfile, aspectRatio: NonProductAtmosphereAspectRatio, previous: SceneFingerprint[], route: ProductEchoRoute): string {
  return [
    `OUTPUT CONTRACT: Generate exactly one standalone ${aspectRatio} portrait photograph. This is a vertical portrait composition. Single scene only. No collage. No triptych. No contact sheet. No split panels. No multiple frames. Do not combine multiple locations in one image.`,
    `CURRENT TASK REFERENCE SOURCE: Use only the actual product reference images attached, uploaded, or selected for the current generation task as the visual source for Product Echo. Do not use a previous task's reference image. Do not use a previous generated image. Do not infer color from the SKU name, file name, historical prompt, brand palette, or default configuration. For the external manual Image2 workflow, use the actual reference image attached in the external Image2 tool as the sole visual source for Product Echo. Reference use is visual_echo_extraction_only. Do not use a website-uploaded reference image as a substitute for the actual external attachment.`,
    `PRIMARY SCENE HARD LOCK: This image MUST take place at ${archetype.locationLock}. Required visible spatial evidence: ${archetype.requiredSpatialCues.join(", ")}. This is NOT: ${archetype.forbiddenSpatialCues.join(", ")}. Absolutely no competing scene cues.`,
    buildSceneLock(archetype, previous),
    activeVisualSystemRule(),
    `LIFE TRACE: ${archetype.lifeTraceDirection}. ${variation.directive}`,
    `DYNAMIC PRODUCT ECHO: Analyze the current task's actual reference images at generation time. Read their actual color families, value range, saturation level, warm/cool/neutral/mixed tendency, material tactility, surface finish, seasonal feeling, and emotional tone. Translate those qualities indirectly into unrelated believable lifestyle elements. Preserve the current reference image's actual hue identity. When necessary, reduce only its intensity, coverage, contrast, or frequency of appearance. Do not substitute any fixed brand color or preset product color. Do not turn the entire room into a literal product-color theme. ${profile.seasonalEcho}`,
    `PRODUCT ECHO CHANNEL: Primary echo channel: ${route.primaryChannel}. ${route.secondaryChannel ? `Secondary channel: ${route.secondaryChannel}.` : ""} Express the current task's Product Echo mainly through the selected material, surface, light, seasonal, or emotional channel. Do not automatically express Product Echo through visible color.`,
    "ANTI-LITERAL PRODUCT ECHO: Do not choose flowers, books, cups, textiles, paper, or any other object because their color can match the product reference. Scene objects must be selected only because they naturally belong to the selected place and recent life moment. Do not add a new object solely to carry the product's hue. When hue echo is used, apply it only as a very small, low-saturation, low-contrast property of an already justified scene element. Do not create a literal color-matching prop. Do not create a product-color-themed room.",
    `OBJECT LIMIT: Use only ${archetype.allowedObjects.join(", ")}. Keep one dominant life trace and two to four supporting objects maximum.`,
    `ECHO CARRIER: Use the already justified ${route.selectedCarrierCategory} only as a subtle carrier for the selected echo channel. Do not introduce another object for Product Echo.`,
    `CARRIER DIVERSITY LOCK: Do not repeat another card's primary Product Echo channel, carrier category, dominant life-trace object, or color-matching object pattern.`,
    `COMPOSITION: ${archetype.cameraDirection}. ${COMPOSITION_RULE}`,
    HARD_PROHIBITIONS,
    NEGATIVE_CONSTRAINTS,
    "Continuity applies only to brand atmosphere, material treatment, light quality, restraint, realism, and the current task's Product Echo. Do not reuse another card's location, room type, furniture, window arrangement, dominant object, camera position, or composition.",
    "Provider boundary: Image2 only. This is a user-facing production Prompt, not an internal validation task."
  ].join(" ");
}

export function buildAtmosphereRepairPrompt(input: { errorType: string; archetype: AtmosphereSceneArchetype; aspectRatio?: NonProductAtmosphereAspectRatio }): string {
  const { archetype, errorType, aspectRatio = "4:5" } = input;
  return [`REPAIR TASK: ${errorType}`, "Use only the current task's actual product reference image as the visual source for Product Echo.", `Regenerate from scratch as ${archetype.locationLock}.`, `Mandatory visible evidence: ${archetype.requiredSpatialCues.join(", ")}.`, `Absolutely no: ${archetype.forbiddenSpatialCues.join(", ")}.`, `Preserve only: ${brandVisualMother.brand} Quiet Warm Luxury, restrained natural daylight, tactile realism, quiet daily order, and the current task's dynamically extracted Product Echo.`, `Do not preserve the previous room layout, furniture, window, camera position, or composition. Generate exactly one standalone ${aspectRatio} photograph. No collage. No triptych. No split panels. No person. No footwear.`].join(" ");
}

export function buildNonProductAtmospherePlan(input: BuildNonProductAtmospherePlanInput): NonProductAtmospherePlan {
  const referenceAssetIds = [...new Set(input.referenceAssetIds ?? [])].filter(Boolean);
  if (referenceAssetIds.length === 0) throw new AtmosphereCompileError("PRODUCT_ECHO_SOURCE_MISSING", "PRODUCT_ECHO_SOURCE_MISSING: current task reference assets are required before compiling atmosphere Prompts.");
  const quantity = input.quantity;
  const rotationIndex = Math.abs(Math.floor(input.generationNonce ?? 0));
  const season = input.season ?? "春";
  const aspectRatio = input.aspectRatio ?? "4:5";
  const taskId = input.taskId ?? `current-task-${rotationIndex}`;
  const profile = buildProductEchoProfile(season);
  profile.sourceReferenceIds = referenceAssetIds;
  profile.provenance = { taskId, referenceAssetIds, analysisVersion: "deferred-external-image2-v1", generatedForCurrentTask: true };
  const used: SceneFingerprint[] = [];
  const usedRoutes: ProductEchoRoute[] = [];
  const images = Array.from({ length: quantity }, (_, index) => {
    const archetype = NON_PRODUCT_ATMOSPHERE_SCENE_REGISTRY[SCENE_ORDER[(rotationIndex + index) % SCENE_ORDER.length]];
    const fingerprint = sceneFingerprint(archetype);
    if (used.some((previous) => previous.id === fingerprint.id || (previous.dominantPlane === fingerprint.dominantPlane && previous.dominantObject === fingerprint.dominantObject))) throw new AtmosphereCompileError("SCENE_DIVERSITY_DIAGNOSTIC", `SCENE_DIVERSITY_DIAGNOSTIC: card ${index + 1} repeats ${fingerprint.id}, dominant plane, or dominant object.`);
    used.push(fingerprint);
    const variation = NON_PRODUCT_ATMOSPHERE_VARIATIONS[(rotationIndex + index) % NON_PRODUCT_ATMOSPHERE_VARIATIONS.length];
    const route = routeProductEcho(archetype, index, referenceAssetIds, taskId);
    if (usedRoutes[usedRoutes.length - 1]?.primaryChannel === route.primaryChannel) throw new AtmosphereCompileError("SCENE_DIVERSITY_DIAGNOSTIC", "ECHO_CHANNEL_DIVERSITY_VIOLATION: adjacent primary channel repeated.");
    if (usedRoutes.some((previous) => previous.selectedCarrierCategory === route.selectedCarrierCategory)) route.selectedCarrierCategory = "NO_PHYSICAL_CARRIER";
    route.selectedCarrierId = `${archetype.id}:${route.selectedCarrierCategory}`;
    usedRoutes.push(route);
    const slot: NonProductAtmosphereSlot = { id: `atmosphere-slot-${rotationIndex + index + 1}`, sceneId: fingerprint.id, sceneLabel: archetype.locationLock, sceneLine: archetype.requiredSpatialCues.join("; "), lifeMoment: archetype.lifeTraceDirection, objectCue: archetype.dominantObject, variation, differenceDimensions: [archetype.dominantPlane, archetype.cameraHeight, archetype.depthPattern] };
    const promptPackage: AtmospherePromptPackage = { provider: "image2", generationCount: 1, standaloneImage: true, isolatedGenerationRequired: true, reusePreviousConversation: false, reusePreviousGeneratedImage: false, continuityMode: "STYLE_ONLY_CONTINUITY", productEchoSourceMode: "CURRENT_TASK_REFERENCE_ONLY", referenceAssetIds, externalReferenceAttachmentRequired: true };
    const image: NonProductAtmosphereImagePlan = { id: `non-product-atmosphere-${rotationIndex + index + 1}`, index: index + 1, prompt: buildPrompt(archetype, variation, profile, aspectRatio, used.slice(0, -1), route), slot, sceneFingerprint: fingerprint, promptPackage, sceneQA: { expectedSceneMatched: true, requiredSpatialCuesFound: [], missingRequiredSpatialCues: archetype.requiredSpatialCues, forbiddenSceneCuesFound: [], collageDetected: false, repeatedPreviousScene: false, dominantObjectRepeated: false, productEchoSourceValid: true, currentTaskReferenceProvenanceValid: true }, sceneObjectSelection: { selectedObjects: archetype.allowedObjects.slice(0, 2), selectionSource: "SCENE_AND_LIFE_TRACE_ONLY", colorIndependentSelection: true }, productEchoRoute: route, variationSignature: { sceneId: fingerprint.id, lifeTraceId: variation.key, dominantPlane: fingerprint.dominantPlane, cameraHeight: fingerprint.cameraHeight, depthPattern: fingerprint.depthPattern, dominantObject: fingerprint.dominantObject, productEchoPrimaryChannel: route.primaryChannel, productEchoSecondaryChannel: route.secondaryChannel, echoCarrierCategory: route.selectedCarrierCategory, hueUsage: route.hueUsage }, productEchoExpressionQA: { productEchoSourceValid: true, primaryChannelValid: true, nonHueChannelPreferred: route.primaryChannel !== "RESTRAINED_HUE", sceneObjectsSelectedIndependentlyFromColor: true, carrierAlreadyJustifiedByScene: true, literalColorMatchingPropDetected: false, objectInjectedOnlyForHueEcho: false, fullSceneHueThemeDetected: false, repeatedCarrierDetected: false, repeatedPrimaryChannelDetected: false, flowerSelectedBecauseOfProductHue: false, multipleHueCarriersDetected: false }, productReferenceUse: "visual_echo_extraction_only", productVisibility: "forbidden", footwearVisibility: "forbidden", personVisibility: "forbidden", modelGeneration: "disabled", outfitGeneration: "disabled", onFootGeneration: "disabled" };
    return image;
  });
  return { contentType: NON_PRODUCT_ATMOSPHERE_CONTENT_TYPE, provider: NON_PRODUCT_ATMOSPHERE_PROVIDER, promptVersion: NON_PRODUCT_ATMOSPHERE_PROMPT_VERSION, quantity, productEchoProfile: profile, referenceImageCount: Math.max(0, input.referenceImageCount ?? referenceAssetIds.length), referenceAssetIds, taskId, aspectRatio, images };
}
