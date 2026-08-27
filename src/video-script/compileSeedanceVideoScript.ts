import type { TeamPromptParams } from "../types";
import { resolveVideoCreativeContext, type ResolvedVideoCreativeContext } from "./resolveVideoCreativeContext";

export type VideoScriptDuration = 10 | 15;

export type SceneSpec = {
  imageType: TeamPromptParams["imageType"];
  scene: TeamPromptParams["scenePreference"];
  season: TeamPromptParams["season"];
  subjectMode: "person_with_product" | "product_only" | "non_product_atmosphere";
  model: TeamPromptParams["modelChoice"] | null;
  wardrobePreference: TeamPromptParams["garmentTypePreference"] | null;
  selectedOutfitLine: string | null;
  resolvedLocationDirection: string;
  resolvedActionDirection: string;
  seasonalLightDirection: string;
  seasonalMoodDirection: string;
  brandVisualPositioning: string;
  brandVisualDirectingRules: string[];
  studioContext: ResolvedVideoCreativeContext["studio"] | null;
  extraRequirement: string | null;
};

export type Motion = {
  level: "locked" | "minimal" | "restrained";
  direction: string;
  prohibited: string[];
};

export type Camera = {
  framing: string;
  movement: string;
  distanceRule: string;
  lensSafety: string;
};

export type ProductProtection = {
  enabled: boolean;
  sourceMode: "uploaded_references_only" | "not_applicable";
  rules: string[];
};

export type ReferenceMapping = {
  mode: "reference_bound" | "not_applicable";
  confirmedReferenceCount: number;
  planReady: boolean;
  instruction: string;
};

export type FilmBeat = {
  id: string;
  startSecond: number;
  endSecond: number;
  purpose: string;
  action: string;
  camera: string;
  productPriority: "none" | "supporting" | "hero";
};

export type FilmSpec = {
  format: "Seedance2.5 manual video script";
  durationSeconds: VideoScriptDuration;
  rhythm: "independent_three_beat" | "independent_four_beat";
  scene: SceneSpec;
  motion: Motion;
  camera: Camera;
  productProtection: ProductProtection;
  referenceMapping: ReferenceMapping;
  beats: FilmBeat[];
};

export type CompiledVideoScript = {
  filmSpec: FilmSpec;
  script: string;
};

const PERSON_IMAGE_TYPES = new Set<TeamPromptParams["imageType"]>(["产品上脚图", "对镜穿搭图", "生活场景图"]);
const PRODUCT_ONLY_IMAGE_TYPES = new Set<TeamPromptParams["imageType"]>(["拍摄花絮 / 材质图", "产品静物图"]);

function resolveSubjectMode(imageType: TeamPromptParams["imageType"]): SceneSpec["subjectMode"] {
  if (imageType === "非产品氛围图") return "non_product_atmosphere";
  if (PRODUCT_ONLY_IMAGE_TYPES.has(imageType)) return "product_only";
  return "person_with_product";
}

function buildSceneSpec(context: ResolvedVideoCreativeContext): SceneSpec {
  const params = context.params;
  const subjectMode = resolveSubjectMode(params.imageType);
  return {
    imageType: params.imageType,
    scene: context.scene.scenePreference,
    season: params.season,
    subjectMode,
    model: PERSON_IMAGE_TYPES.has(params.imageType) ? params.modelChoice : null,
    wardrobePreference: PERSON_IMAGE_TYPES.has(params.imageType) ? params.garmentTypePreference : null,
    selectedOutfitLine: PERSON_IMAGE_TYPES.has(params.imageType) ? context.selectedOutfitLine || null : null,
    resolvedLocationDirection: context.scene.locationDirection,
    resolvedActionDirection: context.scene.actionDirection,
    seasonalLightDirection: context.scene.seasonalLightDirection,
    seasonalMoodDirection: context.scene.seasonalMoodDirection,
    brandVisualPositioning: context.brandVisual.positioning,
    brandVisualDirectingRules: [...context.brandVisual.authoritativeRules, ...context.brandVisual.directingRules],
    studioContext: context.studio.enabled ? context.studio : null,
    extraRequirement: params.extraRequirement.trim() || null,
  };
}

function buildMotion(scene: SceneSpec): Motion {
  if (scene.subjectMode === "non_product_atmosphere") {
    return {
      level: "minimal",
      direction: "Use only subtle environmental movement that belongs naturally to the selected scene.",
      prohibited: ["performative character action", "dramatic speed ramp", "abrupt direction change"],
    };
  }
  if (scene.subjectMode === "product_only") {
    return {
      level: "locked",
      direction: "Keep the product physically still; create motion only through a controlled camera move or a very small natural material response.",
      prohibited: ["product morphing", "floating product", "fast rotation", "shape-changing transition"],
    };
  }
  return {
    level: "restrained",
    direction: scene.resolvedActionDirection || "Use one natural, low-amplitude action with stable foot placement and believable weight transfer.",
    prohibited: ["running", "jumping", "spinning", "kicking toward camera", "crossing feet close to a wide-angle lens"],
  };
}

function buildCamera(scene: SceneSpec): Camera {
  const studioAngle = scene.studioContext?.angleDirection;
  const productFraming = scene.subjectMode === "product_only"
    ? "Begin with scene context, then move to a clean product-readable framing without extreme macro distortion."
    : scene.subjectMode === "person_with_product"
      ? "Keep the person and footwear in anatomically coherent full-body or three-quarter context; preserve visible ground contact."
      : "Preserve the selected atmosphere composition without turning any product into the visual center.";
  return {
    framing: [productFraming, studioAngle].filter(Boolean).join(" "),
    movement: "Static hold, slow push-in, or gentle lateral drift only; use one coherent camera direction across the clip.",
    distanceRule: "Maintain a natural working distance and do not move the camera unusually close to the feet or product.",
    lensSafety: "Use a natural-perspective lens treatment; avoid ultra-wide, fisheye, low-angle enlargement, and perspective stretching.",
  };
}

function hasBoundProductReferences(params: TeamPromptParams): boolean {
  const truth = params.selectedProductTruth as (TeamPromptParams["selectedProductTruth"] & { referenceEvidenceBound?: boolean }) | undefined;
  return Boolean(truth?.referenceEvidenceBound && params.referencePlan?.referencePlanReady);
}

function buildProductProtection(scene: SceneSpec): ProductProtection {
  if (scene.subjectMode === "non_product_atmosphere") {
    return { enabled: false, sourceMode: "not_applicable", rules: ["Do not introduce a hero footwear product into this non-product atmosphere clip."] };
  }
  return {
    enabled: true,
    sourceMode: "uploaded_references_only",
    rules: [
      "Use the uploaded footwear references as the only product source.",
      "Preserve the visible silhouette, panel relationships, toe and heel proportions, outsole profile, color relationships, surface finish, and construction details exactly as shown in the confirmed references.",
      "Do not infer or rename any material, color, toe shape, outsole type, heel structure, logo, or construction fact that is not explicitly established by the references or user input.",
      "Keep left and right shoes mutually consistent, at believable human scale, with stable foot contact and no frame-to-frame deformation.",
      "The footwear is the commercial visual priority, but it must remain naturally integrated into the scene.",
    ],
  };
}

function buildReferenceMapping(params: TeamPromptParams, scene: SceneSpec): ReferenceMapping {
  if (scene.subjectMode === "non_product_atmosphere") {
    return {
      mode: "not_applicable",
      confirmedReferenceCount: 0,
      planReady: true,
      instruction: "No product reference mapping is required for this non-product atmosphere script.",
    };
  }
  const count = params.referencePlan?.order.length ?? 0;
  const planReady = hasBoundProductReferences(params);
  return {
    mode: "reference_bound",
    confirmedReferenceCount: count,
    planReady,
    instruction: planReady
      ? `Manually upload the ${count} confirmed footwear reference${count === 1 ? "" : "s"} to Seedance2.5 in the Reference Plan order shown in THERUIZ AURA before generating.`
      : "Before generating, confirm the footwear reference roles in THERUIZ AURA and manually upload the resulting Reference Plan to Seedance2.5.",
  };
}

function productPriority(scene: SceneSpec, requested: FilmBeat["productPriority"]): FilmBeat["productPriority"] {
  return scene.subjectMode === "non_product_atmosphere" ? "none" : requested;
}

function buildTenSecondBeats(scene: SceneSpec): FilmBeat[] {
  return [
    {
      id: "10s-context-entry",
      startSecond: 0,
      endSecond: 3,
      purpose: `Establish this resolved scene context immediately: ${scene.resolvedLocationDirection}`,
      action: scene.subjectMode === "person_with_product" ? scene.resolvedActionDirection : "Hold a calm, readable scene with only minimal natural movement.",
      camera: "Stable establishing frame with a very slow, natural-perspective entry.",
      productPriority: productPriority(scene, "supporting"),
    },
    {
      id: "10s-product-read",
      startSecond: 3,
      endSecond: 7,
      purpose: scene.subjectMode === "non_product_atmosphere" ? "Reveal one meaningful atmospheric detail." : "Create one clear product-readable moment without interrupting natural behavior.",
      action: scene.subjectMode === "person_with_product" ? "Complete the single low-risk action while both shoes remain coherent and visible." : "Let the scene or product remain physically stable while the camera reveals detail.",
      camera: "One restrained push or lateral drift; no lens or direction change.",
      productPriority: productPriority(scene, "hero"),
    },
    {
      id: "10s-stable-resolve",
      startSecond: 7,
      endSecond: 10,
      purpose: "Resolve into a clean final frame that can hold without visual instability.",
      action: "Settle all movement naturally and preserve continuity through the last frame.",
      camera: "Decelerate into a stable hold; no final zoom burst, morph, or reframing jump.",
      productPriority: productPriority(scene, "hero"),
    },
  ];
}

function buildFifteenSecondBeats(scene: SceneSpec, evidenceDirection: string): FilmBeat[] {
  return [
    {
      id: "15s-world-establish",
      startSecond: 0,
      endSecond: 4,
      purpose: `Establish the resolved world, season, and subject state with breathing room: ${scene.resolvedLocationDirection}`,
      action: "Begin from a composed, believable moment before the main action develops.",
      camera: "Stable wide or medium-wide establishment at a natural working distance.",
      productPriority: productPriority(scene, "supporting"),
    },
    {
      id: "15s-natural-development",
      startSecond: 4,
      endSecond: 8,
      purpose: "Develop one restrained action while preserving spatial and body continuity.",
      action: scene.subjectMode === "person_with_product" ? scene.resolvedActionDirection : "Introduce one subtle environmental or camera-led change without moving the product unnaturally.",
      camera: "Continue in the same direction with a slow push or gentle lateral drift.",
      productPriority: productPriority(scene, "supporting"),
    },
    {
      id: "15s-product-evidence",
      startSecond: 8,
      endSecond: 12,
      purpose: scene.subjectMode === "non_product_atmosphere" ? "Reveal the defining atmospheric detail without introducing product dominance." : `Deliver one Product Evidence beat inside the same scene context. ${evidenceDirection}`,
      action: scene.subjectMode === "person_with_product" ? "Let the resolved scene action settle so the confirmed reference-bound footwear form becomes stably readable without posing toward the lens or switching to an isolated product advertisement." : "Keep the product stable inside the same scene as the camera reads only its confirmed reference-bound form.",
      camera: "Refine the framing gradually; never move unusually close or switch to an extreme angle.",
      productPriority: productPriority(scene, "hero"),
    },
    {
      id: "15s-brand-resolve",
      startSecond: 12,
      endSecond: 15,
      purpose: "Close on a calm, commercially usable final composition.",
      action: "Finish the motion and hold a stable final state with no new action introduced.",
      camera: "Ease into a locked final frame with continuous perspective and exposure.",
      productPriority: productPriority(scene, "hero"),
    },
  ];
}

function renderFilmSpec(spec: FilmSpec): string {
  const sceneLines = [
    `- Image intent: ${spec.scene.imageType}`,
    `- Scene: ${spec.scene.scene}`,
    `- Season: ${spec.scene.season}`,
    `- Subject mode: ${spec.scene.subjectMode}`,
    spec.scene.model ? `- Model direction: ${spec.scene.model}` : null,
    spec.scene.wardrobePreference ? `- Wardrobe preference: ${spec.scene.wardrobePreference}` : null,
    spec.scene.selectedOutfitLine ? `- Resolved wardrobe: ${spec.scene.selectedOutfitLine}` : null,
    `- Resolved location direction: ${spec.scene.resolvedLocationDirection}`,
    `- Resolved action direction: ${spec.scene.resolvedActionDirection}`,
    `- Seasonal light: ${spec.scene.seasonalLightDirection}`,
    `- Seasonal mood: ${spec.scene.seasonalMoodDirection}`,
    spec.scene.studioContext ? `- Studio angle: ${spec.scene.studioContext.anglePreference}. ${spec.scene.studioContext.angleDirection}` : null,
    spec.scene.studioContext?.resolvedPreset ? `- Studio preset: ${spec.scene.studioContext.resolvedPreset.label}. ${spec.scene.studioContext.resolvedPreset.backgroundLine} ${spec.scene.studioContext.resolvedPreset.lightingLine}` : null,
    spec.scene.studioContext?.resolvedWardrobeLine ? `- Studio wardrobe resolution: ${spec.scene.studioContext.resolvedWardrobeLine}` : null,
    spec.scene.extraRequirement ? `- Additional user requirement: ${spec.scene.extraRequirement}` : null,
  ].filter(Boolean);
  const beatLines = spec.beats.flatMap((beat, index) => [
    `Beat ${index + 1} | ${beat.startSecond}–${beat.endSecond}s | ${beat.id}`,
    `Purpose: ${beat.purpose}`,
    `Action: ${beat.action}`,
    `Camera: ${beat.camera}`,
    `Product priority: ${beat.productPriority}`,
  ]);
  return [
    "SEEDANCE 2.5 — MANUAL VIDEO SCRIPT",
    `Duration: ${spec.durationSeconds} seconds`,
    `Rhythm: ${spec.rhythm}`,
    "Execution: Manual / Draft. Copy this script to the external Seedance2.5 website and upload references there manually. No API request has been sent.",
    "",
    "[SCENE SPEC]",
    ...sceneLines,
    "",
    "[FILM SPEC]",
    ...beatLines,
    "",
    "[BRAND VISUAL / DIRECTING RULES]",
    `Positioning: ${spec.scene.brandVisualPositioning}`,
    ...spec.scene.brandVisualDirectingRules.map((rule) => `- ${rule}`),
    "",
    "[MOTION]",
    `Level: ${spec.motion.level}`,
    spec.motion.direction,
    `Avoid: ${spec.motion.prohibited.join(", ")}.`,
    "",
    "[CAMERA]",
    spec.camera.framing,
    spec.camera.movement,
    spec.camera.distanceRule,
    spec.camera.lensSafety,
    "",
    "[PRODUCT PROTECTION]",
    ...spec.productProtection.rules.map((rule) => `- ${rule}`),
    "",
    "[REFERENCE MAPPING]",
    spec.referenceMapping.instruction,
  ].join("\n");
}

export function compileSeedanceVideoScript(input: {
  params: TeamPromptParams;
  duration: VideoScriptDuration;
}): CompiledVideoScript {
  const context = resolveVideoCreativeContext(input.params);
  const scene = buildSceneSpec(context);
  const taskTruth = input.params.selectedProductTruth as (TeamPromptParams["selectedProductTruth"] & { structuredFactsExtracted?: boolean; productTruthMode?: string }) | undefined;
  const evidenceDirection = taskTruth?.structuredFactsExtracted === false
    ? "Read only the silhouette, proportions, and visible structural relationships confirmed by the current references; keep unextracted material, color, toe, outsole, heel, logo, and construction facts unknown. Follow the confirmed Reference Plan order without exposing internal asset ids."
    : "Read only product facts explicitly established by the current Product Truth and confirmed references; do not add unsupported details.";
  const filmSpec: FilmSpec = {
    format: "Seedance2.5 manual video script",
    durationSeconds: input.duration,
    rhythm: input.duration === 10 ? "independent_three_beat" : "independent_four_beat",
    scene,
    motion: buildMotion(scene),
    camera: buildCamera(scene),
    productProtection: buildProductProtection(scene),
    referenceMapping: buildReferenceMapping(input.params, scene),
    beats: input.duration === 10 ? buildTenSecondBeats(scene) : buildFifteenSecondBeats(scene, evidenceDirection),
  };
  return { filmSpec, script: renderFilmSpec(filmSpec) };
}
