import { getTeamModelLine } from "../data/teamModelProfiles";
import type { TeamPromptParams } from "../types";
import { brandVisualMother } from "../visual-system";
import { productTruthPromptLines, type ProductCoverage } from "../visual-system/taskReferenceBinding";
import type {
  ProductProtectionSpec,
  VideoReferenceMapping,
  VideoSceneSpec,
  VideoScriptInput,
  VideoScriptResult,
} from "./contracts";
import { buildFilmSpec, validateFilmSpec } from "./filmSpecs";
import { VIDEO_CAMERA_LIBRARY, VIDEO_MOTION_LIBRARY } from "./libraries";

const PEOPLE_INTENTS = new Set<TeamPromptParams["imageType"]>([
  "产品上脚图",
  "对镜穿搭图",
  "生活场景图",
]);

function buildSceneSpec(input: VideoScriptInput): VideoSceneSpec {
  const { params } = input;
  const personPresent = PEOPLE_INTENTS.has(params.imageType);
  return {
    brandId: "theruiz_aura",
    contentIntent: params.imageType,
    scene: params.scenePreference,
    season: params.season,
    personPresent,
    personProfile: personPresent ? getTeamModelLine(params.modelChoice) : undefined,
    wardrobe: personPresent ? input.selectedOutfitLine?.trim() || params.lockedOutfitLine?.trim() || undefined : undefined,
    extraRequirement: params.extraRequirement.trim() || undefined,
  };
}

function buildProductProtection(params: TeamPromptParams): ProductProtectionSpec {
  const taskTruth = params.selectedProductTruth as { coverage?: ProductCoverage[] } | undefined;
  return {
    source: "current_task_uploaded_images",
    coverage: taskTruth?.coverage ?? [],
    lines: [
      ...productTruthPromptLines(params.selectedProductTruth),
      "Across every frame, preserve one stable product identity. Do not redesign, beautify, simplify, add, remove, or hallucinate product structure, materials, color blocking, construction, branding, or proportions.",
      "When worn, body motion may create only subtle physically plausible upper flex, gentle collar compression, lace settling, outsole pressure, and contact shadow. Never let the foot, garment, pose, or camera reshape the toe box, panels, outsole, heel, or overall silhouette.",
      "Prevent frame-to-frame morphing: no changing lace count, panel seams, outsole thickness, toe shape, heel shape, material boundary, logo, or color between shots.",
    ],
  };
}

function buildReferenceMapping(params: TeamPromptParams, protection: ProductProtectionSpec): VideoReferenceMapping {
  const plan = params.referencePlan;
  const diagnostics: string[] = [];
  if (!plan) diagnostics.push("VIDEO_REFERENCE_PLAN_MISSING");
  if (plan && !plan.referencePlanReady) diagnostics.push(...(plan.diagnostics ?? ["VIDEO_REFERENCE_PLAN_NOT_READY"]));
  return {
    source: "current_task_uploaded_images",
    referenceSetId: plan?.referenceSetId,
    orderedAssetIds: plan?.order ?? params.productTruthAssetIds ?? [],
    coverage: protection.coverage,
    ready: plan?.referencePlanReady === true,
    diagnostics,
  };
}

function formatBrandVisualLines() {
  return [
    `ACTIVE VISUAL SYSTEM — THERUIZ AURA Brand Visual Mother v${brandVisualMother.version} (${brandVisualMother.status}) is the highest visual authority for aesthetic direction.`,
    `Core positioning: ${brandVisualMother.core_positioning}.`,
    `Default brand audience range is ${brandVisualMother.audience_visual_age_range.min}–${brandVisualMother.audience_visual_age_range.max}; when the user has explicitly selected a person profile, preserve that explicit person selection instead of silently rerouting identity by product.`,
    "The product is not the visual director. Keep color low-volume, light warm but visibly sourced, materials tactile and physically real, space mature and urban, composition observed rather than staged, and the lived moment more important than commercial posing.",
    "Product truth remains controlled only by the current task uploaded product references; brand visual language must never invent product facts.",
  ];
}

function formatReferenceLines(mapping: VideoReferenceMapping) {
  if (mapping.orderedAssetIds.length === 0) {
    return [
      "REFERENCE MAPPING — Use the currently uploaded product reference set as the only product evidence. Do not invent details that are not visible in the references.",
    ];
  }
  return [
    `REFERENCE MAPPING — Preserve the current confirmed reference order: ${mapping.orderedAssetIds.join(" → ")}.`,
    "Use complete/structural references to control silhouette and construction; use detail references only for the corresponding visible material, color, heel, toe, outsole, or construction evidence. References do not authorize any redesign or new product fact.",
  ];
}

function formatFilmLines(result: ReturnType<typeof buildFilmSpec>) {
  const lines = [`FILMSPEC — ${result.duration}s. ${result.rhythm}`];
  for (const shot of result.shots) {
    const motion = VIDEO_MOTION_LIBRARY[shot.motionId as keyof typeof VIDEO_MOTION_LIBRARY];
    const camera = VIDEO_CAMERA_LIBRARY[shot.cameraId as keyof typeof VIDEO_CAMERA_LIBRARY];
    lines.push(
      `[${shot.start.toFixed(1)}–${shot.end.toFixed(1)}s | ${shot.id} | ${shot.role}] ${shot.direction} Motion: ${motion} Camera: ${camera} Product: ${shot.productRule}`,
    );
  }
  return lines;
}

export function compileSeedance25VideoScript(input: VideoScriptInput): VideoScriptResult {
  const sceneSpec = buildSceneSpec(input);
  const productProtection = buildProductProtection(input.params);
  const referenceMapping = buildReferenceMapping(input.params, productProtection);
  const filmSpec = buildFilmSpec(input.duration, sceneSpec);
  const diagnostics = [
    ...validateFilmSpec(filmSpec),
    ...referenceMapping.diagnostics,
    ...(input.params.selectedProductTruth ? [] : ["VIDEO_PRODUCT_TRUTH_MISSING"]),
  ];

  const sceneLines = [
    `SCENESPEC — Content intent: ${sceneSpec.contentIntent}. Scene: ${sceneSpec.scene}. Season: ${sceneSpec.season}.`,
    sceneSpec.personPresent
      ? `PERSON — ${sceneSpec.personProfile}`
      : "PERSON — Do not introduce a person unless the selected content intent or explicit user requirement calls for one.",
    sceneSpec.wardrobe ? `WARDROBE — Keep this selected wardrobe direction consistent through the film: ${sceneSpec.wardrobe}` : "",
    sceneSpec.extraRequirement ? `USER REQUIREMENT — ${sceneSpec.extraRequirement}` : "",
  ].filter(Boolean);

  const prompt = [
    `Generate exactly one standalone ${input.duration}-second THERUIZ AURA fashion/lifestyle film for Seedance 2.5. Single continuous creative concept only. This is a manual-copy video script, not an API request.`,
    ...formatBrandVisualLines(),
    ...productProtection.lines.map((line, index) => index === 0 ? `PRODUCT TRUTH / PRODUCT PROTECTION — ${line}` : line),
    ...sceneLines,
    ...formatFilmLines(filmSpec),
    ...formatReferenceLines(referenceMapping),
    "SHOT RULES — Keep one coherent location, season, person identity, wardrobe, product identity, and light logic across the whole film. Cuts may change framing but must not reset reality. Avoid unnecessary shot count, random inserts, disconnected B-roll, time jumps, teleporting props, impossible hand contact, floating feet, sliding shoes, or changes in floor contact.",
    "CAMERA RULES — Camera motion must serve the lived action. No orbit-for-orbit's-sake, whip pan, crash zoom, drone-like motion indoors, extreme lens distortion, synthetic rack-focus spectacle, or commercial turntable behavior.",
    "MOTION RULES — Prefer one readable action per beat. Human motion must preserve balance, weight transfer, joint direction, garment tension, hand-object contact, outsole pressure, and grounded contact shadow. Environmental motion stays restrained and physically motivated.",
    "FINAL QUALITY — Quiet Warm Luxury, believable real-camera physics, mature urban restraint, product accuracy first, no plastic AI gloss, no influencer performance, no juvenile sweetness, no showroom staging, no e-commerce hero-spin, no product morphing, and no text or logo animation unless explicitly requested.",
  ].join("\n\n");

  return {
    prompt,
    sceneSpec,
    filmSpec,
    productProtection,
    referenceMapping,
    diagnostics,
    metadata: {
      target: "seedance-2.5-manual-copy",
      apiExecution: false,
      providerRuntime: false,
    },
  };
}
