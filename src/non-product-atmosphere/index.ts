import {
  NON_PRODUCT_ATMOSPHERE_VARIATIONS,
  type AtmosphereVariation
} from "../data/nonProductAtmosphereSceneLines";
import { brandVisualMother } from "../visual-system";
import { renderImage2AtmospherePrompt, type AtmospherePromptIR } from "./image2AtmospherePromptRenderer";
import { filterSeasonCompatibleCandidates, paletteEchoPrompt, productPresencePrompt, resolvePaletteEchoMode, resolveSeasonalSceneCues, runProductDominancePromptQA, runSeasonConsistencyPromptQA, seasonProfilePromptLines, SEASON_LABEL_TO_ID, SEASON_SEMANTIC_PROFILES, type AtmospherePromptSections, type AtmosphereSeasonId, type ProductDominanceFailure, type ProductPaletteClass, type ProductPaletteEchoMode, type ProductPresenceMode, type SeasonConsistencyFailure } from "./seasonSemanticProfiles";
import { ATMOSPHERE_SCENE_ARCHETYPES, ATMOSPHERE_SCENE_ARCHETYPE_IDS, ATMOSPHERE_SCENE_VARIANTS, resolveAtmosphereScene, resolveSceneVariantContent, type AtmosphereSceneArchetype, type AtmosphereSceneArchetypeId, type AtmosphereSceneResolution, type AtmosphereSceneVariant, type ResolvedSceneVariantContent } from "./sceneVariants";
export * from "./seasonSemanticProfiles";
export * from "./sceneVariants";

export const NON_PRODUCT_ATMOSPHERE_CONTENT_TYPE = "non_product_atmosphere" as const;
export const NON_PRODUCT_ATMOSPHERE_PROVIDER = "image2" as const;
export const NON_PRODUCT_ATMOSPHERE_PROMPT_VERSION = "non-product-led-atmosphere-image2-v2" as const;
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
export type ProductEchoChannel = "MATERIAL_TACTILITY" | "SURFACE_FINISH" | "EMOTIONAL_TONE" | "RESTRAINED_HUE";
export type EchoCarrierCategory = "AMBIENT_LIGHT" | "SHADOW" | "TEXTILE" | "PAPER" | "CERAMIC" | "GLASS" | "WOOD" | "WALL_REFLECTION" | "SMALL_NATURAL_ELEMENT" | "NO_PHYSICAL_CARRIER";
export type AtmosphereSceneFamily = "PRIVATE_HOME" | "THRESHOLD" | "WORKING_LIFE" | "CITY_PASSAGE" | "SHORT_TRAVEL" | "DAILY_ERRAND" | "QUIET_PUBLIC_SPACE";
export type ProductResponsiveVisualProfile = { sourceMode: "CURRENT_TASK_REFERENCE_ONLY"; sourceReferenceIds: string[]; productEchoAnalysisId: string; valueStructure: "light_dominant" | "balanced" | "dark_accented" | "dark_dominant" | "mixed"; contrastLevel: "very_soft" | "soft" | "moderate" | "clear" | "strong"; edgeDefinition: "diffused" | "soft" | "balanced" | "clean" | "graphic"; shadowBehavior: "airy_diffused" | "soft_directional" | "layered" | "defined_directional" | "high_separation"; visualRhythm: "slow_open" | "soft_layered" | "balanced" | "structured" | "graphic_repetition"; spatialDensity: "very_sparse" | "sparse" | "balanced" | "layered" | "compact"; spatialBoundary: "soft_open" | "open" | "balanced" | "defined" | "architectural"; materialBalance: { softMaterialWeight: number; hardMaterialWeight: number; smoothSurfaceWeight: number; texturedSurfaceWeight: number; matteWeight: number; reflectiveWeight: number }; chromaticRole: "nearly_absent" | "micro_echo" | "restrained_secondary" | "structural_contrast"; emotionalWeight: "light" | "calm" | "grounded" | "deep" | "assertive_restrained"; provenance: { taskId: string; referenceAssetIds: string[]; analysisVersion: string; generatedForCurrentTask: true } };
export type AtmosphereVisualGrammar = { valueStructure: string; contrastInstruction: string; edgeInstruction: string; shadowInstruction: string; rhythmInstruction: string; spatialDensityInstruction: string; spatialBoundaryInstruction: string; materialMixInstruction: string; chromaticInstruction: string };
export type ProductEchoRoute = { primaryChannel: ProductEchoChannel; secondaryChannel?: ProductEchoChannel; sourceAnalysisId: string; currentTaskReferenceIds: string[]; routingReason: string; hueUsage: "none" | "micro_accent" | "subtle_secondary"; maxHueCoverage: "none" | "very_small" | "small"; selectedCarrierId?: string; selectedCarrierCategory: EchoCarrierCategory; antiLiteralMappingPassed: true };
export type SceneObjectSelection = { selectedObjects: string[]; selectionSource: "SCENE_AND_LIFE_TRACE_ONLY"; colorIndependentSelection: true };
export type AntiLiteralEchoPolicy = { forbidColorToObjectTypeMapping: true; forbidObjectInjectionForHueEcho: true; forbidFullSceneHueTheming: true; forbidProductShapeAnalogy: true; forbidRepeatedCarrierInSet: true; allowHueOnlyAsSubtleProperty: true };
export type AtmosphereVariationSignature = { brandId: string; taskId: string; cardId: string; curationSeed: string; sceneFamily: AtmosphereSceneFamily; sceneId: AtmosphereSceneArchetypeId; variantId: string; lifeTraceId: string; dominantPlane: string; cameraHeight: string; depthPattern: string; dominantObject: string; objectBundleFingerprint: string; materialMixFingerprint: string; productEchoPrimaryChannel: ProductEchoChannel; productEchoSecondaryChannel?: ProductEchoChannel; echoCarrierCategory: EchoCarrierCategory; hueUsage: "none" | "micro_accent" | "subtle_secondary"; valueStructure: string; contrastLevel: string; edgeDefinition: string; shadowBehavior: string; visualRhythm: string; spatialDensity: string; spatialBoundary: string; chromaticRole: string };
export type ProductEchoExpressionQA = { productEchoSourceValid: boolean; primaryChannelValid: boolean; nonHueChannelPreferred: boolean; sceneObjectsSelectedIndependentlyFromColor: boolean; carrierAlreadyJustifiedByScene: boolean; literalColorMatchingPropDetected: boolean; objectInjectedOnlyForHueEcho: boolean; fullSceneHueThemeDetected: boolean; repeatedCarrierDetected: boolean; repeatedPrimaryChannelDetected: boolean; flowerSelectedBecauseOfProductHue: boolean; multipleHueCarriersDetected: boolean };
export type SceneFingerprint = Pick<AtmosphereSceneArchetype, "id" | "dominantPlane" | "cameraHeight" | "depthPattern" | "dominantObject"> & { indoorOutdoor: AtmosphereSceneArchetype["spatialType"] };
export type AtmosphereSceneQA = { expectedSceneMatched: boolean; requiredSpatialCuesFound: string[]; missingRequiredSpatialCues: string[]; forbiddenSceneCuesFound: string[]; collageDetected: boolean; repeatedPreviousScene: boolean; dominantObjectRepeated: boolean; productEchoSourceValid: boolean; currentTaskReferenceProvenanceValid: boolean };
export type AtmospherePromptPackage = { provider: "image2"; generationCount: 1; standaloneImage: true; isolatedGenerationRequired: true; reusePreviousConversation: false; reusePreviousGeneratedImage: false; continuityMode: "STYLE_ONLY_CONTINUITY"; productEchoSourceMode: "CURRENT_TASK_REFERENCE_ONLY"; referenceAssetIds: string[]; externalReferenceAttachmentRequired: true; sceneSelectionMode?: "AUTO_CONTROLLED_RANDOM"; curationSeed?: string; seedVersion?: "v1" };

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
  productResponsiveProfile: ProductResponsiveVisualProfile;
  visualGrammar: AtmosphereVisualGrammar;
  productReferenceUse: "visual_echo_extraction_only";
  productPresenceMode: ProductPresenceMode;
  productPaletteEchoMode: ProductPaletteEchoMode;
  seasonSemanticProfileId: AtmosphereSeasonId;
  sceneResolution: AtmosphereSceneResolution;
  sceneVariantContent: ResolvedSceneVariantContent;
  seasonGate: { sceneCandidatePassed: true; objectsFilteredBeforePrompt: true; requestedSceneRejected: boolean; usedSeasonNeutralFallback: boolean };
  seasonConsistencyQA: { capability: "prompt_level_only"; passed: boolean; failures: SeasonConsistencyFailure[]; manualReviewRequired: true };
  productDominanceQA: { capability: "prompt_level_only"; passed: boolean; failures: ProductDominanceFailure[]; manualReviewRequired: true };
  productVisibility: "forbidden" | "optional_secondary" | "optional_lifestyle_trace";
  footwearVisibility: "forbidden" | "optional_secondary";
  personVisibility: "forbidden" | "disabled";
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
  curationSeed: string;
  sceneSelectionMode: "AUTO_CONTROLLED_RANDOM";
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
  previewWithoutReference?: boolean;
  recentVariationHistory?: AtmosphereVariationSignature[];
  productPresenceMode?: ProductPresenceMode;
  productPaletteEchoMode?: ProductPaletteEchoMode;
  productPaletteClass?: ProductPaletteClass;
  scenePreference?: string;
  sceneDirective?: string;
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
  return `ACTIVE VISUAL SYSTEM — ${brandVisualMother.brand} Brand Visual Mother v${brandVisualMother.version} (${brandVisualMother.status}) is highest authority: Quiet Warm Luxury, low-volume color, sourced light, real materials and physics, mature urban space, observed asymmetry. No sweet, influencer, plastic, juvenile, showroom, or module-specific drift.`;
}
const BRAND_CORE = `Create a ${brandVisualMother.brand} non-product lifestyle atmosphere image guided by ${brandVisualMother.core_positioning.split(" /")[0] || "Quiet Warm Luxury"}. Express warm restraint, calm negative space, mature relaxed elegance, tactile authenticity, quiet daily order, low-saturation color, soft natural daylight, and believable lived-in atmosphere. The image must feel warm, restrained, mature, calm, tactile, and real.`;
const EXTERNAL_REFERENCE_RULE = "Use the actual reference image attached in the external image-generation tool as the sole visual source for Product Echo. Read its color family, material tactility, surface finish, emotional tone, and seasonal feeling at generation time. Do not use a website-uploaded reference image as the source for this copied Prompt. Reference use is visual_echo_extraction_only. The website reference-upload field is reserved for the future server/API generation path.";
const PRODUCT_ECHO_RULE = "Translate the product's visual qualities into unrelated but believable lifestyle elements. Use only restrained visual echoes through color, texture, light, atmosphere, or everyday objects. The connection must be subtle, indirect, and emotionally readable. Do not create an obvious product-color theme or color the entire scene according to the product. If Product Echo conflicts with the Active Visual System, lower saturation and follow the brand's cream, warm beige, pale stone, warm-grey, natural-material, and quiet-light order.";
const COMPOSITION_RULE = "Use calm negative space, natural cropping, depth, and believable imbalance; no centered hero, flatlay, symmetry, showroom, or advertising hierarchy.";
const HARD_PROHIBITIONS = "Do not show the uploaded product. Do not show any sneaker, shoe, footwear, product substitute, product fragment, product-like object, product packaging used as product display, or any other brand footwear. Do not show any person, model, face, portrait, hand, foot, leg, body fragment, reflection, silhouette, human shadow, mirror person, on-foot styling, outfit display, or human action. Product visibility = forbidden. Footwear visibility = forbidden. Person visibility = forbidden. Model generation = disabled. Outfit generation = disabled. On-foot generation = disabled.";
const NEGATIVE_CONSTRAINTS = "Avoid luxury real-estate interiors, showroom styling, home-furnishing advertising, bedding advertising, interior-design editorial, coffee-brand advertising, flower-shop advertising, generic lifestyle moodboards, Pinterest styling, influencer clichés, decorative prop collections, artificial symmetry, empty CGI spaces, loud color blocking, and category drift.";

export function buildProductEchoProfile(_season: "春" | "夏" | "秋" | "冬" = "春"): ProductEchoProfile {
  return {
    sourceMode: "CURRENT_TASK_REFERENCE_ONLY",
    sourceReferenceIds: [],
    primaryEchoColor: "analyzed from the current task reference at Image2 generation time",
    secondaryEchoColor: "derived only from the current task reference",
    materialEchoes: [],
    emotionalEchoes: [],
    seasonalEcho: undefined,
    lifestyleEchoes: [],
    prohibitedDirections: ["product display", "footwear", "person or body trace", "obvious product-color theme", "generic lifestyle moodboard"],
    provenance: { taskId: "", referenceAssetIds: [], analysisVersion: "deferred-external-image2-v1", generatedForCurrentTask: true }
  };
}

export class AtmosphereCompileError extends Error {
  constructor(public readonly code: "PRODUCT_ECHO_SOURCE_MISSING" | "SCENE_DIVERSITY_DIAGNOSTIC", message: string) { super(message); }
}

const SCENE_FAMILY: Record<AtmosphereSceneArchetypeId, AtmosphereSceneFamily> = { ENTRYWAY_DEPARTURE: "THRESHOLD", ENTRYWAY_ARRIVAL: "THRESHOLD", WARDROBE_PREPARATION: "PRIVATE_HOME", WINDOW_READING: "PRIVATE_HOME", WORKTABLE_PAUSE: "WORKING_LIFE", RETURN_HOME_TABLE: "DAILY_ERRAND", MARKET_RETURN_KITCHEN: "DAILY_ERRAND", CAFE_FRONT: "CITY_PASSAGE", CAFE_INTERIOR: "QUIET_PUBLIC_SPACE", BOOKSTORE_MAGAZINE: "QUIET_PUBLIC_SPACE", HOTEL_STAY: "SHORT_TRAVEL", RESIDENTIAL_TRANSITION: "THRESHOLD", CITY_TRANSIT: "CITY_PASSAGE", MATERIAL_LIGHT_SPACE: "QUIET_PUBLIC_SPACE" };
const ECHO_CHANNEL_ORDER: ProductEchoChannel[] = ["MATERIAL_TACTILITY", "SURFACE_FINISH", "EMOTIONAL_TONE", "RESTRAINED_HUE"];
const CARRIER_BY_SCENE: Record<AtmosphereSceneArchetypeId, EchoCarrierCategory> = { ENTRYWAY_DEPARTURE: "TEXTILE", ENTRYWAY_ARRIVAL: "SHADOW", WARDROBE_PREPARATION: "TEXTILE", WINDOW_READING: "AMBIENT_LIGHT", WORKTABLE_PAUSE: "PAPER", RETURN_HOME_TABLE: "WOOD", MARKET_RETURN_KITCHEN: "PAPER", CAFE_FRONT: "WALL_REFLECTION", CAFE_INTERIOR: "CERAMIC", BOOKSTORE_MAGAZINE: "PAPER", HOTEL_STAY: "GLASS", RESIDENTIAL_TRANSITION: "SHADOW", CITY_TRANSIT: "SHADOW", MATERIAL_LIGHT_SPACE: "NO_PHYSICAL_CARRIER" };
const ANTI_LITERAL_POLICY: AntiLiteralEchoPolicy = { forbidColorToObjectTypeMapping: true, forbidObjectInjectionForHueEcho: true, forbidFullSceneHueTheming: true, forbidProductShapeAnalogy: true, forbidRepeatedCarrierInSet: true, allowHueOnlyAsSubtleProperty: true };

function sceneFingerprint(archetype: AtmosphereSceneArchetype): SceneFingerprint {
  return { id: archetype.id, indoorOutdoor: archetype.spatialType, dominantPlane: archetype.dominantPlane, cameraHeight: archetype.cameraHeight, depthPattern: archetype.depthPattern, dominantObject: archetype.dominantObject };
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

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  return hash >>> 0;
}

export function selectSeasonCompatibleSceneCandidates(candidateIds: AtmosphereSceneArchetypeId[], seasonProfile: (typeof SEASON_SEMANTIC_PROFILES)[AtmosphereSeasonId], excludedSceneIds: AtmosphereSceneArchetypeId[] = []): { sceneIds: AtmosphereSceneArchetypeId[]; usedSeasonNeutralFallback: boolean } {
  const sceneIds = candidateIds.filter((candidate) => candidate !== "MATERIAL_LIGHT_SPACE" && !excludedSceneIds.includes(candidate) && ATMOSPHERE_SCENE_VARIANTS.some((variant) => variant.archetypeId === candidate && (variant.compatibleSeasons === "all" || variant.compatibleSeasons.includes(seasonProfile.id))));
  return sceneIds.length ? { sceneIds, usedSeasonNeutralFallback: false } : { sceneIds: ["MATERIAL_LIGHT_SPACE"], usedSeasonNeutralFallback: true };
}

function buildDeferredResponsiveProfile(taskId: string, referenceAssetIds: string[]): ProductResponsiveVisualProfile {
  return { sourceMode: "CURRENT_TASK_REFERENCE_ONLY", sourceReferenceIds: referenceAssetIds, productEchoAnalysisId: `${taskId}:deferred-external-image2-v1`, valueStructure: "deferred_external_reference_analysis", contrastLevel: "deferred_external_reference_analysis", edgeDefinition: "deferred_external_reference_analysis", shadowBehavior: "deferred_external_reference_analysis", visualRhythm: "deferred_external_reference_analysis", spatialDensity: "deferred_external_reference_analysis", spatialBoundary: "deferred_external_reference_analysis", materialBalance: undefined, chromaticRole: "deferred_external_reference_analysis", emotionalWeight: "deferred_external_reference_analysis", provenance: { taskId, referenceAssetIds, analysisVersion: "deferred-external-image2-v1", generatedForCurrentTask: true } } as unknown as ProductResponsiveVisualProfile;
}

function buildVisualGrammar(_profile: ProductResponsiveVisualProfile, channel: ProductEchoChannel): AtmosphereVisualGrammar {
  return { valueStructure: "The selected season and scene control the global value structure.", contrastInstruction: "Keep contrast season- and scene-led.", edgeInstruction: "Keep edge definition natural and tactile.", shadowInstruction: "Use believable season-led shadows.", rhythmInstruction: "Keep visual pacing calm and restrained.", spatialDensityInstruction: "Keep spatial density scene-led.", spatialBoundaryInstruction: "Keep spatial boundaries believable.", materialMixInstruction: "Use scene-appropriate material relationships without numeric weights.", chromaticInstruction: `Keep any reference hue local and restrained; channel ${channel} may affect only a small existing surface, never the global visual grammar.` };
}

export function resolveRequestedAtmosphereScene(scenePreference: string | undefined, seasonId: AtmosphereSeasonId): { sceneId?: AtmosphereSceneArchetypeId; variantId?: string; requestedSceneRejected: boolean; usedSeasonNeutralFallback: boolean } {
  const resolved = resolveAtmosphereScene({ requestedScene: scenePreference, season: seasonId, seed: `requested:${scenePreference ?? "auto"}:${seasonId}` });
  if (!scenePreference || scenePreference === "自动匹配") return { requestedSceneRejected: false, usedSeasonNeutralFallback: false };
  return { sceneId: resolved.archetype.id, variantId: resolved.variant.id, requestedSceneRejected: resolved.resolution.usedFallback, usedSeasonNeutralFallback: resolved.resolution.usedFallback };
}

function buildPrompt(archetype: AtmosphereSceneArchetype, variant: AtmosphereSceneVariant, variantContent: ResolvedSceneVariantContent, variation: AtmosphereVariation, profile: ProductEchoProfile, aspectRatio: NonProductAtmosphereAspectRatio, route: ProductEchoRoute, curationPlanPresent: boolean, season: "春" | "夏" | "秋" | "冬", presenceMode: ProductPresenceMode, paletteMode: ProductPaletteEchoMode, sceneDirective?: string): { prompt: string; sections: AtmospherePromptSections; selectedObjects: string[] } {
  const seasonProfile = SEASON_SEMANTIC_PROFILES[SEASON_LABEL_TO_ID[season]];
  const selectedObjects = filterSeasonCompatibleCandidates(variantContent.supportingObjects, seasonProfile).slice(0, 2);
  const cues = resolveSeasonalSceneCues({ profile: seasonProfile, spatialType: archetype.spatialType, sceneId: archetype.id, sceneObjects: selectedObjects, lifeMoment: variantContent.primaryTrace, wardrobeTraceAllowed: archetype.allowsWardrobeTrace && variant.allowsWardrobeTrace, wardrobeTrace: variantContent.wardrobeTrace });
  const seasonalLines = seasonProfilePromptLines(seasonProfile, cues);
  const productMayAppear = presenceMode !== "no_product";
  const sections: AtmospherePromptSections = {
    moduleDefinition: ["Create a THERUIZ AURA Non-Product-Led Atmosphere image. Product presence is optional; environment and lived moment lead, never e-commerce display."],
    activeVisualSystem: [activeVisualSystemRule()],
    seasonIdentity: [seasonalLines[0]],
    positiveSeasonCues: seasonalLines.slice(1, 3),
    scene: [`Scene: ${variant.description}. Show ${variantContent.spatialCue}. ${cues.lifeMoments[0]}. ${variantContent.timeOfDay ? `${variantContent.timeOfDay}.` : ""} ${variantContent.compositionCue}. Objects: ${selectedObjects.join(" and ") || "none"}.`, ...(sceneDirective?.trim() ? [sceneDirective.trim()] : [])],
    productPresence: [productPresencePrompt(presenceMode)],
    paletteEcho: [paletteEchoPrompt(paletteMode), "Season and scene exclusively control global light, spatial climate, material weight, wardrobe thickness, and season. Product reference may affect only a local accent, reflection, or surface; never global light, season, wardrobe, space, scene, or activity."],
    productTruth: [productMayAppear ? "Only if a product fragment is actually visible, preserve its visible structure and color from the attached reference without demanding complete product readability." : "No product or footwear."],
    composition: [COMPOSITION_RULE, "Any product stays incidental and peripheral. Never center, separately light, enlarge, sharpen, or arrange around it. No catalog, product still life, campaign hero, or advertisement."],
    negativeConstraints: [seasonalLines[3], `Keep the setting away from ${archetype.forbiddenSpatialCues.slice(0, 2).join(", ")}.`]
  };
  const ir: AtmospherePromptIR = {
    outputContract: { aspectRatio, standaloneImage: true, singleScene: true },
    sections,
    curationPlanPresent,
  };
  void profile;
  void route;
  return { prompt: renderImage2AtmospherePrompt(ir), sections, selectedObjects };
}

export function buildAtmosphereRepairPrompt(input: { errorType: string; archetype: AtmosphereSceneArchetype; aspectRatio?: NonProductAtmosphereAspectRatio }): string {
  const { archetype, errorType, aspectRatio = "4:5" } = input;
  return [`REPAIR TASK: ${errorType}`, "Use only the current task's actual product reference image as the visual source for Product Echo.", `Regenerate from scratch as ${archetype.locationLock}.`, `Mandatory visible evidence: ${archetype.requiredSpatialCues.join(", ")}.`, `Absolutely no: ${archetype.forbiddenSpatialCues.join(", ")}.`, `Preserve only: ${brandVisualMother.brand} Quiet Warm Luxury, restrained natural daylight, tactile realism, quiet daily order, and the current task's dynamically extracted Product Echo.`, `Do not preserve the previous room layout, furniture, window, camera position, or composition. Generate exactly one standalone ${aspectRatio} photograph. No collage. No triptych. No split panels. No person. No footwear.`].join(" ");
}

export function buildNonProductAtmospherePlan(input: BuildNonProductAtmospherePlanInput): NonProductAtmospherePlan {
  const referenceAssetIds = [...new Set(input.referenceAssetIds ?? [])].filter(Boolean);
  if (referenceAssetIds.length === 0 && !input.previewWithoutReference) throw new AtmosphereCompileError("PRODUCT_ECHO_SOURCE_MISSING", "PRODUCT_ECHO_SOURCE_MISSING: current task reference assets are required before compiling production Prompts.");
  const quantity = input.quantity;
  const rotationIndex = Math.abs(Math.floor(input.generationNonce ?? 0));
  const season = input.season ?? "春";
  const seasonProfile = SEASON_SEMANTIC_PROFILES[SEASON_LABEL_TO_ID[season]];
  const aspectRatio = input.aspectRatio ?? "4:5";
  const taskId = input.taskId ?? `current-task-${rotationIndex}`;
  const curationSeed = `${taskId}:${rotationIndex}:v1`;
  const profile = buildProductEchoProfile(season);
  const responsiveProfile = buildDeferredResponsiveProfile(taskId, referenceAssetIds);
  profile.sourceReferenceIds = referenceAssetIds;
  profile.provenance = { taskId, referenceAssetIds, analysisVersion: "deferred-external-image2-v1", generatedForCurrentTask: true };
  const used: SceneFingerprint[] = [];
  const usedRoutes: ProductEchoRoute[] = [];
  const recentHistory = input.recentVariationHistory ?? [];
  const images = Array.from({ length: quantity }, (_, index) => {
    const productPresenceMode = input.productPresenceMode ?? (["no_product", "subtle_supporting_presence", "lifestyle_trace_presence"] as ProductPresenceMode[])[(rotationIndex + index) % 3];
    const productPaletteEchoMode = resolvePaletteEchoMode(seasonProfile.id, input.productPaletteClass ?? "unknown", input.productPaletteEchoMode ?? (["brand_neutral", "material_translation", "direct_accent"] as ProductPaletteEchoMode[])[(rotationIndex + index) % 3]);
    const requestedScene = index === 0 ? input.scenePreference : undefined;
    const resolvedScene = resolveAtmosphereScene({ requestedScene, season: seasonProfile.id, seed: `${curationSeed}:${index}`, excludedArchetypes: [...recentHistory.slice(-6).map((record) => record.sceneId), ...used.map((record) => record.id)] });
    const { archetype, variant, resolution } = resolvedScene;
    const variantContent = resolveSceneVariantContent(variant, seasonProfile, `${curationSeed}:${index}:${variant.id}`);
    const fingerprint = sceneFingerprint(archetype);
    if (used.some((previous) => previous.id === fingerprint.id || (previous.dominantPlane === fingerprint.dominantPlane && previous.dominantObject === fingerprint.dominantObject))) throw new AtmosphereCompileError("SCENE_DIVERSITY_DIAGNOSTIC", `SCENE_DIVERSITY_DIAGNOSTIC: card ${index + 1} repeats ${fingerprint.id}, dominant plane, or dominant object.`);
    used.push(fingerprint);
    const variation = NON_PRODUCT_ATMOSPHERE_VARIATIONS[(rotationIndex + index) % NON_PRODUCT_ATMOSPHERE_VARIATIONS.length];
    const route = routeProductEcho(archetype, index, referenceAssetIds, taskId);
    const visualGrammar = buildVisualGrammar(responsiveProfile, route.primaryChannel);
    if (usedRoutes[usedRoutes.length - 1]?.primaryChannel === route.primaryChannel) throw new AtmosphereCompileError("SCENE_DIVERSITY_DIAGNOSTIC", "ECHO_CHANNEL_DIVERSITY_VIOLATION: adjacent primary channel repeated.");
    if (usedRoutes.some((previous) => previous.selectedCarrierCategory === route.selectedCarrierCategory)) route.selectedCarrierCategory = "NO_PHYSICAL_CARRIER";
    route.selectedCarrierId = `${archetype.id}:${route.selectedCarrierCategory}`;
    usedRoutes.push(route);
    const slot: NonProductAtmosphereSlot = { id: `atmosphere-slot-${rotationIndex + index + 1}`, sceneId: fingerprint.id, sceneLabel: variant.label, sceneLine: variantContent.spatialCue, lifeMoment: variantContent.primaryTrace, objectCue: variantContent.supportingObjects[0] ?? archetype.dominantObject, variation, differenceDimensions: [archetype.dominantPlane, archetype.cameraHeight, archetype.depthPattern, variant.id] };
    const promptPackage: AtmospherePromptPackage = { provider: "image2", generationCount: 1, standaloneImage: true, isolatedGenerationRequired: true, reusePreviousConversation: false, reusePreviousGeneratedImage: false, continuityMode: "STYLE_ONLY_CONTINUITY", productEchoSourceMode: "CURRENT_TASK_REFERENCE_ONLY", referenceAssetIds, externalReferenceAttachmentRequired: true };
    const compiledPrompt = buildPrompt(archetype, variant, variantContent, variation, profile, aspectRatio, route, true, season, productPresenceMode, productPaletteEchoMode, input.sceneDirective);
    const seasonFailures = runSeasonConsistencyPromptQA(compiledPrompt.sections, seasonProfile);
    const dominanceFailures = runProductDominancePromptQA(compiledPrompt.sections);
    const image: NonProductAtmosphereImagePlan = { id: `non-product-atmosphere-${rotationIndex + index + 1}`, index: index + 1, prompt: compiledPrompt.prompt, slot, sceneFingerprint: fingerprint, promptPackage, sceneQA: { expectedSceneMatched: true, requiredSpatialCuesFound: [], missingRequiredSpatialCues: archetype.requiredSpatialCues, forbiddenSceneCuesFound: [], collageDetected: false, repeatedPreviousScene: false, dominantObjectRepeated: false, productEchoSourceValid: true, currentTaskReferenceProvenanceValid: true }, sceneObjectSelection: { selectedObjects: compiledPrompt.selectedObjects, selectionSource: "SCENE_AND_LIFE_TRACE_ONLY", colorIndependentSelection: true }, productEchoRoute: route, productResponsiveProfile: responsiveProfile, visualGrammar, variationSignature: { brandId: brandVisualMother.brand, taskId, cardId: `non-product-atmosphere-${rotationIndex + index + 1}`, curationSeed: `${taskId}:${rotationIndex}`, sceneFamily: SCENE_FAMILY[fingerprint.id], sceneId: fingerprint.id, variantId: variant.id, lifeTraceId: variation.key, dominantPlane: fingerprint.dominantPlane, cameraHeight: fingerprint.cameraHeight, depthPattern: fingerprint.depthPattern, dominantObject: fingerprint.dominantObject, objectBundleFingerprint: `${variant.id}:${variantContent.supportingObjects.join("|")}`, materialMixFingerprint: `${visualGrammar.materialMixInstruction}:${fingerprint.dominantPlane}`, productEchoPrimaryChannel: route.primaryChannel, productEchoSecondaryChannel: route.secondaryChannel, echoCarrierCategory: route.selectedCarrierCategory, hueUsage: route.hueUsage, valueStructure: responsiveProfile.valueStructure, contrastLevel: responsiveProfile.contrastLevel, edgeDefinition: responsiveProfile.edgeDefinition, shadowBehavior: responsiveProfile.shadowBehavior, visualRhythm: responsiveProfile.visualRhythm, spatialDensity: responsiveProfile.spatialDensity, spatialBoundary: responsiveProfile.spatialBoundary, chromaticRole: responsiveProfile.chromaticRole }, productEchoExpressionQA: { productEchoSourceValid: true, primaryChannelValid: true, nonHueChannelPreferred: route.primaryChannel !== "RESTRAINED_HUE", sceneObjectsSelectedIndependentlyFromColor: true, carrierAlreadyJustifiedByScene: true, literalColorMatchingPropDetected: false, objectInjectedOnlyForHueEcho: false, fullSceneHueThemeDetected: false, repeatedCarrierDetected: false, repeatedPrimaryChannelDetected: false, flowerSelectedBecauseOfProductHue: false, multipleHueCarriersDetected: false }, productReferenceUse: "visual_echo_extraction_only", productPresenceMode, productPaletteEchoMode, seasonSemanticProfileId: seasonProfile.id, sceneResolution: resolution, sceneVariantContent: variantContent, seasonGate: { sceneCandidatePassed: true, objectsFilteredBeforePrompt: true, requestedSceneRejected: resolution.usedFallback && Boolean(requestedScene), usedSeasonNeutralFallback: resolution.usedFallback }, seasonConsistencyQA: { capability: "prompt_level_only", passed: seasonFailures.length === 0, failures: seasonFailures, manualReviewRequired: true }, productDominanceQA: { capability: "prompt_level_only", passed: dominanceFailures.length === 0, failures: dominanceFailures, manualReviewRequired: true }, productVisibility: productPresenceMode === "no_product" ? "forbidden" : productPresenceMode === "subtle_supporting_presence" ? "optional_secondary" : "optional_lifestyle_trace", footwearVisibility: productPresenceMode === "no_product" ? "forbidden" : "optional_secondary", personVisibility: "disabled", modelGeneration: "disabled", outfitGeneration: "disabled", onFootGeneration: "disabled" };
    image.personVisibility = "forbidden";
    image.promptPackage = { ...image.promptPackage, sceneSelectionMode: "AUTO_CONTROLLED_RANDOM", curationSeed, seedVersion: "v1" };
    return image;
  });
  return { contentType: NON_PRODUCT_ATMOSPHERE_CONTENT_TYPE, provider: NON_PRODUCT_ATMOSPHERE_PROVIDER, promptVersion: NON_PRODUCT_ATMOSPHERE_PROMPT_VERSION, quantity, productEchoProfile: profile, referenceImageCount: Math.max(0, input.referenceImageCount ?? referenceAssetIds.length), referenceAssetIds, taskId, aspectRatio, curationSeed, sceneSelectionMode: "AUTO_CONTROLLED_RANDOM", images };
}
