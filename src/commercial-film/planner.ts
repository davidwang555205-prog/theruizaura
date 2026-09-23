import { resolveCharacterProfile } from "../immersive-narrative/character-profile";
import { lifestyleSoftSeedingScenePool } from "../data/lifestyleSoftSeedingScenePool";
import type { ProductCoverage } from "../visual-system/taskReferenceBinding";
import { buildCommercialActionPlan } from "./commercial-actions";
import { buildCommercialCameraPlan } from "./camera";
import {
  COMMERCIAL_BRAND_MOOD,
  COMMERCIAL_PRODUCT_VISIBILITY_BY_SHOT,
  COMMERCIAL_SCENE_WORLDS,
  COMMERCIAL_SHOT_PURPOSES,
  COMMERCIAL_SHOT_ROLES,
  resolveCommercialIntent,
} from "./catalog";
import { buildCommercialProductMessage } from "./product-message";
import { runCommercialFilmQc, type CommercialQcInput } from "./qc";
import { resolveCommercialReferenceState } from "./reference";
import { buildCommercialSoundPlan } from "./sound";
import { planCommercialCreativeSpine } from "./creative-spine";
import { planCommercialCreativeDirection } from "./creative-direction";
import {
  applyCreativeModeTiming,
  planCommercialEventSpine,
} from "./event-spine";
import { planCommercialDirectorConcept } from "./director-concept";
import {
  COMMERCIAL_FILM_SCHEMA_VERSION,
  COMMERCIAL_FILM_VERSION,
  CommercialFilmPlannerError,
  type CommercialFilmPlan,
  type CommercialFilmPlannerInput,
  type CommercialProductVisibilityPlan,
  type CommercialSceneWorld,
  type CommercialShotPlan,
} from "./types";

const SHOT_DURATION_SECONDS = 3;

function resolveSceneWorld(
  sceneWorldId: string,
  spatialAnchors: string[]
): CommercialSceneWorld {
  const definition = COMMERCIAL_SCENE_WORLDS[sceneWorldId];
  if (!definition) {
    throw new CommercialFilmPlannerError(
      "INVALID_SCENE_WORLD",
      `No shared Scene Library world is mapped for "${sceneWorldId}".`,
      [`Known Commercial Scene Worlds: ${Object.keys(COMMERCIAL_SCENE_WORLDS).join(", ")}`]
    );
  }
  const sceneMap = new Map(lifestyleSoftSeedingScenePool.map((scene) => [scene.id, scene]));
  const missingSceneIds = definition.sceneIds.filter((id) => !sceneMap.has(id));
  if (missingSceneIds.length > 0) {
    throw new CommercialFilmPlannerError(
      "INVALID_SCENE_WORLD",
      `Commercial Scene World "${sceneWorldId}" references scenes outside the current shared Scene Library.`,
      missingSceneIds.map((id) => `SCENE_ID_NOT_FOUND: ${id}`)
    );
  }
  return {
    id: definition.id,
    label: definition.label,
    sceneIds: [...definition.sceneIds],
    sceneNames: definition.sceneIds.map((id) => sceneMap.get(id)!.scenePreference),
    spatialAnchors: [...spatialAnchors],
    source: "shared_lifestyle_scene_library",
  };
}

function resolveMessageDimension(
  supported: ProductCoverage[],
  preferred: ProductCoverage[]
): ProductCoverage | null {
  const match = preferred.find((coverage) => supported.includes(coverage));
  if (!match) {
    return null;
  }
  return match;
}

function buildContinuityLine() {
  return "Keep the same person, same wardrobe, same product, same season, same color world, same spatial world, and one physical screen logic across every shot.";
}

export function planCommercialFilm(input: CommercialFilmPlannerInput): CommercialFilmPlan {
  if (input.duration !== 15) {
    throw new CommercialFilmPlannerError(
      "INVALID_DURATION",
      "Commercial Film V1 supports a fixed 15-second duration only.",
      [`Received duration: ${input.duration}`]
    );
  }
  if (!input.lifestyleFeeling.trim()) {
    throw new CommercialFilmPlannerError(
      "MISSING_LIFESTYLE_FEELING",
      "A Lifestyle Feeling is required for Commercial Film V1."
    );
  }

  const intent = resolveCommercialIntent(input.commercialIntent);
  if (!intent) {
    throw new CommercialFilmPlannerError(
      "UNSUPPORTED_COMMERCIAL_INTENT",
      `Commercial Film V1 does not support intent "${input.commercialIntent}".`,
      [`Allowed intents: ${["URBAN_MOTION", "DAILY_STYLING", "QUIET_LUXURY", "PRODUCT_CRAFT", "NEW_ARRIVAL"].join(", ")}`]
    );
  }

  const referenceState = resolveCommercialReferenceState(input.reference);

  const character = resolveCharacterProfile(input.characterSelection);
  if (character.status !== "CHARACTER_PROFILE_APPROVED") {
    throw new CommercialFilmPlannerError(
      "CHARACTER_PROFILE_FAILED",
      "The selected Character Profile failed catalog guardrails.",
      character.failureReasons ?? []
    );
  }

  const productMessage = buildCommercialProductMessage(
    input.reference,
    intent.productMessagePriority,
    input.confirmedBrandSellingPoints
  );
  const supportedCoverage = productMessage.supportedDimensions.map((dimension) => dimension.coverage);
  const wearDimension = productMessage.externalReferenceRequired
    ? null
    : resolveMessageDimension(supportedCoverage, intent.productMessagePriority);
  const detailDimension = productMessage.externalReferenceRequired
    ? null
    : resolveMessageDimension(supportedCoverage, [
    "material_evidence",
    "toe_structure",
    "side_panel_structure",
    "heel_structure",
    "outsole_profile",
    "silhouette",
    "color_blocking",
    ]);
  const heroDimension = productMessage.externalReferenceRequired
    ? null
    : resolveMessageDimension(supportedCoverage, [
    "silhouette",
    "side_panel_structure",
    "material_evidence",
    "color_blocking",
    "toe_structure",
    "heel_structure",
    "outsole_profile",
    ]);
  const sceneWorld = resolveSceneWorld(intent.sceneWorldId, COMMERCIAL_SCENE_WORLDS[intent.sceneWorldId].spatialAnchors);
  const creativeSpine = planCommercialCreativeSpine({
    commercialIntent: intent.id,
    commercialIntentLabel: `${intent.labelZh} / ${intent.labelEn}`,
    productMessage,
    reference: input.reference,
    character: {
      selection: character.selection,
      resolved: character,
    },
    season: input.season,
    lifestyleFeeling: input.lifestyleFeeling.trim(),
    sceneWorld: {
      id: sceneWorld.id,
      label: sceneWorld.label,
    },
    cameraRhythm: intent.cameraRhythm,
    shotRoles: [...COMMERCIAL_SHOT_ROLES],
    creativeCase: input.creativeCase,
  });
  const eventSpine = planCommercialEventSpine({
    commercialIntent: intent.id,
    creativeSpine,
    generationNonce: input.generationNonce ?? 0,
  });
  const actionPlan = buildCommercialActionPlan(intent.id, eventSpine);
  if (actionPlan.length !== 5) {
    throw new CommercialFilmPlannerError(
      "INVALID_SHOT_ARCHITECTURE",
      "Commercial Action Registry must produce exactly five shot actions."
    );
  }
  const creativeDirection = planCommercialCreativeDirection({
    commercialIntent: intent.id,
    creativeSpine,
    cameraRhythm: intent.cameraRhythm,
    generationNonce: input.generationNonce ?? 0,
    shotRoles: [...COMMERCIAL_SHOT_ROLES],
    productPresenceByShot: creativeSpine.productPresenceByShot,
    actionPlan,
    eventSpine,
    creativeModeOverride: input.creativeModeOverride,
    primaryEditLogicOverride: input.primaryEditLogicOverride,
    secondaryEditLogicOverride: input.secondaryEditLogicOverride,
    visualMotifOverride: input.visualMotifOverride,
  });
  const directorConcept = planCommercialDirectorConcept({
    commercialIntent: intent.id,
    creativeSpine,
    creativeDirection,
    eventSpine,
    generationNonce: input.generationNonce ?? 0,
    override: input.directorConceptOverride,
  });

  const cameraPlan = buildCommercialCameraPlan(
    intent.cameraRhythm,
    COMMERCIAL_SHOT_ROLES,
    actionPlan.map((item) => item.physicalActionLine),
    creativeDirection,
    eventSpine
  );
  const soundPlan = buildCommercialSoundPlan(
    intent.cameraRhythm,
    intent.id,
    COMMERCIAL_SHOT_ROLES,
    sceneWorld.sceneIds
  );
  const durationPlan = applyCreativeModeTiming(
    eventSpine.durationPlan,
    creativeDirection.creativeMode
  );
  let elapsed = 0;
  const shotTimings = durationPlan.map((duration, index) => {
    const startSecond = Number(elapsed.toFixed(1));
    elapsed = Number((elapsed + duration).toFixed(1));
    return {
      startSecond,
      endSecond: Number(elapsed.toFixed(1)),
      durationSeconds: duration,
      index,
    };
  });
  const dimensionByRole = {
    WORLD: null,
    WEAR: wearDimension,
    DETAIL: detailDimension,
    HERO: heroDimension,
    RELEASE: null,
  } satisfies Record<(typeof COMMERCIAL_SHOT_ROLES)[number], ProductCoverage | null>;

  const shots: CommercialShotPlan[] = COMMERCIAL_SHOT_ROLES.map((role, shotIndex) => {
    const action = actionPlan[shotIndex];
    const camera = cameraPlan.shots[shotIndex];
    const sound = soundPlan.shots[shotIndex];
    const storySpine = creativeSpine.shotFunctions[shotIndex];
    const direction = creativeDirection.shotDirections[shotIndex];
    const event = eventSpine.shots[shotIndex];
    const timing = shotTimings[shotIndex];
    return {
      shotIndex,
      role,
      timeRange: {
        startSecond: timing.startSecond,
        endSecond: timing.endSecond,
        durationSeconds: timing.durationSeconds,
      },
      semanticPurpose: COMMERCIAL_SHOT_PURPOSES[role],
      productVisibility: COMMERCIAL_PRODUCT_VISIBILITY_BY_SHOT[role],
      storySpine,
      direction,
      event,
      productMessageDimension: dimensionByRole[role],
      action,
      camera,
      sound,
      spatialAnchor: sceneWorld.spatialAnchors[shotIndex],
      continuityLine: buildContinuityLine(),
    };
  });

  const productVisibilityPlan: CommercialProductVisibilityPlan = {
    levels: shots.map((shot) => shot.productVisibility),
    presenceByShot: creativeSpine.productPresenceByShot,
    revealStrategy: creativeSpine.revealStrategy,
    readableShotIndexes: shots
      .filter((shot) => shot.productVisibility === "PRODUCT_READABLE" || shot.productVisibility === "PRODUCT_HERO")
      .map((shot) => shot.shotIndex),
    detailShotIndex: 2,
    heroShotIndex: 3,
    releaseShotIndex: 4,
  };

  const planWithoutQc: CommercialQcInput = {
    commercialIntent: intent.id,
    commercialIntentLabel: `${intent.labelZh} / ${intent.labelEn}`,
    productMessage,
    creativeSpine,
    creativeDirection,
    eventSpine,
    directorConcept,
    brandMood: COMMERCIAL_BRAND_MOOD,
    character: {
      selection: character.selection,
      resolved: character,
    },
    season: input.season,
    lifestyleFeeling: input.lifestyleFeeling.trim(),
    duration: 15,
    sceneWorld,
    shotArchitecture: {
      totalShots: 5,
      shotRoles: [...COMMERCIAL_SHOT_ROLES],
      shots,
    },
    productVisibilityPlan,
    cameraRhythm: intent.cameraRhythm,
    cameraPlan,
    actionPlan,
    soundPlan,
    worldRealism: {
      density: eventSpine.worldLifeDensity,
      line: eventSpine.worldRealismLine,
      backgroundSignals: [...eventSpine.worldLifeSignals],
      signagePolicy:
        "Do not generate clearly readable invented brand names or corrupted AI text. Distant non-readable storefront graphics, abstract signage shapes, wayfinding forms, and reflections of passing life are allowed.",
    },
    endingStrategy: {
      strategy: "CONTINUE_INTO_LIFE",
      grammar: eventSpine.endingGrammar,
      line: eventSpine.endingGrammar.line,
      prohibitedEndings: [
        "logo animation",
        "packshot",
        "brand subtitle or end card",
        "product-only final frame",
      ],
    },
    referenceState,
  };

  const qcResult = runCommercialFilmQc(planWithoutQc);
  const creativeFailureReasons = creativeSpine.failureReasons ?? [];
  const directionFailureReasons = creativeDirection.failureReasons ?? [];
  const directorFailureReasons = directorConcept.failureReasons ?? [];
  const failureReasons = [...creativeFailureReasons, ...directionFailureReasons, ...directorFailureReasons, ...qcResult.failureReasons];
  return {
    schemaVersion: COMMERCIAL_FILM_SCHEMA_VERSION,
    plannerVersion: COMMERCIAL_FILM_VERSION,
    status: qcResult.passed
      && creativeFailureReasons.length === 0
      && directionFailureReasons.length === 0
      && directorFailureReasons.length === 0
      ? "APPROVED_FOR_COMMERCIAL_EXECUTION"
      : "BLOCKED",
    ...planWithoutQc,
    qc: qcResult.qc,
    failureReasons: failureReasons.length > 0 ? failureReasons : undefined,
  };
}

export function renderCommercialFilmPlanText(
  plan: Omit<CommercialFilmPlan, "qc" | "failureReasons">
) {
  return [
    "[COMMERCIAL PLAN]",
    `Intent: ${plan.commercialIntentLabel}`,
    `Duration: ${plan.duration}s`,
    `Lifestyle Feeling: ${plan.lifestyleFeeling}`,
    "",
    "[PRODUCT MESSAGE]",
    `Headline: ${plan.productMessage.headline}`,
    ...plan.productMessage.evidenceLines,
    plan.productMessage.noFabricationLine,
    "",
    "[SHOT PLAN]",
    ...plan.shotArchitecture.shots.flatMap((shot) => [
      `Shot ${shot.shotIndex + 1} — ${shot.role}`,
      `Time: ${shot.timeRange.startSecond.toFixed(1)}-${shot.timeRange.endSecond.toFixed(1)}s`,
      `Visibility: ${shot.productVisibility}`,
      `Spatial Anchor: ${shot.spatialAnchor}`,
      `Purpose: ${shot.semanticPurpose}`,
      `Action Primitive: ${shot.action.primitiveId}`,
      `Action Source: ${shot.action.source}${shot.action.sourceActionId ? ` / ${shot.action.sourceActionId}` : ""}`,
      `Action: ${shot.action.physicalActionLine}`,
      `Camera: ${shot.camera.framing} · ${shot.camera.movement} · ${shot.camera.movementLine}`,
      `Product: ${shot.productMessageDimension ?? "context only"}`,
      "",
    ]),
    "[CAMERA PLAN]",
    `Rhythm: ${plan.cameraRhythm}`,
    `Lens: ${plan.cameraPlan.continuity.focalRange}`,
    plan.cameraPlan.continuity.spatialAxisRule,
    `Restrictions: ${plan.cameraPlan.restrictions.join(", ")}`,
    "",
    "[SOUND PLAN]",
    `Style: ${plan.soundPlan.policy.style} · music ${plan.soundPlan.policy.music} · voiceover ${plan.soundPlan.policy.voiceover} · dialogue ${plan.soundPlan.policy.dialogue}`,
    ...plan.soundPlan.shots.map((shot) => (
      `Shot ${shot.shotIndex + 1}: ${shot.cues.join(" / ")} · dominant ${shot.dominantSound}`
    )),
    "",
    "[REFERENCE STATE]",
    `Status: ${plan.referenceState.status}`,
    `Confirmed References: ${plan.referenceState.confirmedReferenceCount}`,
    `Coverage: ${plan.referenceState.coverage.join(", ")}`,
    plan.referenceState.instruction,
  ].join("\n");
}
