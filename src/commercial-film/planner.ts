import { resolveCharacterProfile } from "../immersive-narrative/character-profile";
import { lifestyleSoftSeedingScenePool } from "../data/lifestyleSoftSeedingScenePool";
import type { ProductCoverage } from "../visual-system/taskReferenceBinding";
import { buildCommercialActionPlan } from "./commercial-actions";
import { buildCommercialCameraPlan } from "./camera";
import {
  COMMERCIAL_BRAND_MOOD,
  COMMERCIAL_PRODUCT_VISIBILITY_BY_SHOT,
  COMMERCIAL_SCENE_WORLDS,
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
  planCommercialContinuity,
  planCommercialMicroDecision,
  reduceCommercialWorldState,
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
  type CommercialShotRole,
  type CommercialShotPlan,
} from "./types";

const SHOT_DURATION_SECONDS = 3;

function endingLineForStrategy(
  strategy: CommercialFilmPlan["endingStrategy"]["strategy"],
  physicalEndingLine: string,
  imageIntent: string
) {
  switch (strategy) {
    case "CONTINUE_INTO_LIFE": return physicalEndingLine;
    case "RESOLVE_IN_PLACE": return `Hold the already established final human and spatial state; ${physicalEndingLine}`;
    case "WORLD_AFTERIMAGE": return `Let only the already established world, light, or reflection remain perceptible around the final human state; ${physicalEndingLine}`;
    case "ICONIC_HOLD": return `Briefly hold the complete image formed by the already established person, product, and world; ${physicalEndingLine} ${imageIntent}`;
  }
}

function advertisingStructureLine(structure: CommercialFilmPlan["creativeSpine"]["advertisingStructure"]) {
  const lines: Record<typeof structure, string> = {
    CONTRAST_SHIFT: "One familiar visual condition gives way to another.",
    PURSUIT_RELEASE: "A route carries movement into a natural release.",
    WITHHOLD_REVEAL: "The product is present before its meaning becomes clear.",
    RITUAL_COMPLETION: "One everyday action reaches a complete human state.",
    WORLD_OBSERVES_SUBJECT: "The established world changes around a self-directed person.",
    ICONIC_IMAGE: "The film gathers toward one complete image.",
  };
  return lines[structure];
}

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

function visibilityLevelForPresence(
  presence: CommercialFilmPlan["creativeSpine"]["productPresenceByShot"][number],
  productRole: CommercialFilmPlan["creativeSpine"]["productRole"],
  shotRole: CommercialShotRole
): CommercialProductVisibilityPlan["levels"][number] {
  if (shotRole === "HERO") {
    if (productRole === "HERO" && presence === "CLEAR") {
      return COMMERCIAL_PRODUCT_VISIBILITY_BY_SHOT.HERO;
    }
    if (presence === "ABSENT" || presence === "IMPLIED" || presence === "SECONDARY") return "CONTEXT";
    return "PRODUCT_READABLE";
  }
  return COMMERCIAL_PRODUCT_VISIBILITY_BY_SHOT[shotRole];
}

function retainProductRoleAtEnding(creativeSpine: CommercialFilmPlan["creativeSpine"]) {
  const finalIndex = creativeSpine.productPresenceByShot.length - 1;
  const current = creativeSpine.productPresenceByShot[finalIndex];
  const minimumByRole: Record<CommercialFilmPlan["creativeSpine"]["productRole"], typeof current> = {
    INHABITED: "SECONDARY",
    DISCOVERED: "PARTIAL",
    REVEALED: "CLEAR",
    HERO: "CLEAR",
  };
  const rank: Record<typeof current, number> = {
    ABSENT: 0,
    IMPLIED: 1,
    PARTIAL: 2,
    SECONDARY: 3,
    CLEAR: 4,
  };
  const required = minimumByRole[creativeSpine.productRole];
  if (rank[current] >= rank[required]) return;

  // The selected ending strategy and Event Spine own the final event. This
  // only projects the Product Role's minimum retained visibility into that
  // already-resolved beat; it does not add a shot, action, or product claim.
  creativeSpine.productPresenceByShot[finalIndex] = required;
  creativeSpine.shotFunctions[finalIndex] = {
    ...creativeSpine.shotFunctions[finalIndex],
    productPresenceDesign: required,
  };
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
    input.confirmedBrandSellingPoints,
    input.brandDefaultProductContext ?? null
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
    generationNonce: input.generationNonce ?? 0,
    shotRoles: [...COMMERCIAL_SHOT_ROLES],
    creativeCase: input.creativeCase,
  });
  retainProductRoleAtEnding(creativeSpine);
  const eventSpine = planCommercialEventSpine({
    commercialIntent: intent.id,
    creativeSpine,
    generationNonce: input.generationNonce ?? 0,
  });
  const premiseEventFacts = [eventSpine.shots[2].whatHappens, eventSpine.shots[4].whatHappens];
  creativeSpine.premise = {
    ...creativeSpine.premise,
    text: `${eventSpine.centralEvent} That changed relationship remains in the final image: ${premiseEventFacts[1].charAt(0).toLowerCase()}${premiseEventFacts[1].slice(1)}`,
    sourceFacts: [...new Set([...creativeSpine.premise.sourceFacts, ...premiseEventFacts])],
  };
  const worldState = reduceCommercialWorldState({
    model: eventSpine.worldModel,
    beats: eventSpine.shots.map((beat) => ({
      shotIndex: beat.shotIndex,
      stateContract: beat.stateContract,
    })),
  });
  const microDecision = planCommercialMicroDecision({
    declaration: input.microDecision,
    beats: eventSpine.shots,
    timeline: worldState.timeline,
    worldModel: eventSpine.worldModel,
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

  const productVisibilityLevels = creativeSpine.productPresenceByShot.map((presence, shotIndex) => (
    visibilityLevelForPresence(presence, creativeSpine.productRole, COMMERCIAL_SHOT_ROLES[shotIndex])
  ));

  const cameraPlan = buildCommercialCameraPlan(
    intent.cameraRhythm,
    COMMERCIAL_SHOT_ROLES,
    actionPlan.map((item) => item.physicalActionLine),
    creativeDirection,
    eventSpine,
    creativeSpine.productRole,
    productVisibilityLevels
  );
  // STATIC_CAMERA_FILM is an execution constraint on the selected camera,
  // not a reason to change the Event Spine or the physical action. Preserve
  // each shot's existing framing and event relationship while making the
  // camera itself observational and fixed.
  if (directorConcept.concept === "STATIC_CAMERA_FILM") {
    for (const cameraShot of cameraPlan.shots) {
      cameraShot.movement = "locked_observation";
      cameraShot.movementLine = "Keep the camera fixed in its established position; let the existing human and world events play within the frame.";
    }
  }
  if (["PARTIAL_OBSCURATION", "EDGE_OF_FRAME"].includes(directorConcept.concept)) {
    const deviceBeatIndex = eventSpine.shots.findIndex((shot) => (
      /reflection|window glass/i.test(shot.whatHappens)
      && shot.stateContract.effects.some((effect) => (
        effect.fromValue !== effect.toValue
        && /reflection|glass/i.test(`${effect.attribute} ${effect.fromValue} ${effect.toValue}`)
      ))
    ));
    const deviceShot = cameraPlan.shots[deviceBeatIndex];
    if (deviceShot) {
      deviceShot.movement = "locked_observation";
      deviceShot.framing = directorConcept.concept === "PARTIAL_OBSCURATION"
        ? "locked environmental view through the existing window glass; its layered reflection partially obscures the worn silhouette before the registered reflection change resolves"
        : "locked environmental view holding the subject off-centre at the frame edge as the registered window-glass reflection resolves";
      deviceShot.movementLine = "Keep the camera fixed; let only the already planned reflection and body event change within the composition.";
    }
  }
  if (intent.id === "QUIET_LUXURY" && creativeSpine.advertisingStructure === "WORLD_OBSERVES_SUBJECT") {
    for (const shotIndex of [2, 3, 4]) {
      const cameraShot = cameraPlan.shots[shotIndex];
      if (!cameraShot) continue;
      cameraPlan.shots[shotIndex] = {
        ...cameraShot,
        framing: shotIndex === 2
          ? "locked medium-full frame holding the subject's final weight settle with the registered window-light edge and quiet interior floor in view"
          : "locked environmental full-person frame retaining the settled subject and the registered window-light edge across the quiet interior floor",
        movement: "locked_observation",
        movementLine: shotIndex === 2
          ? "Keep the camera locked while she finishes the small weight settle; do not reframe or move the camera."
          : "Keep the camera locked; let the registered window-light edge provide the only continuing visual movement while she remains settled.",
        transitionLine: shotIndex === 2
          ? "Hold the established camera side and room axis into the window-light change."
          : "Hold the same camera side and room axis through the world change and its residual continuation.",
      };
    }
  }
  const soundPlan = buildCommercialSoundPlan(
    intent.cameraRhythm,
    intent.id,
    COMMERCIAL_SHOT_ROLES,
    sceneWorld.sceneIds,
    worldState.timeline.map((step) => ({
      start: step.before.attributes.character?.space ?? null,
      end: step.after.attributes.character?.space ?? null,
    }))
  );
  const durationPlan = applyCreativeModeTiming(
    eventSpine.durationPlan,
    creativeDirection.creativeMode
  );
  let elapsedBeatWindow = 0;
  const beatWindows = durationPlan.map((durationSeconds, index) => {
    const startSecond = Number(elapsedBeatWindow.toFixed(1));
    elapsedBeatWindow = Number((elapsedBeatWindow + durationSeconds).toFixed(1));
    return {
      startSecond,
      endSecond: elapsedBeatWindow,
      durationSeconds,
      index,
    };
  });
  const continuity = planCommercialContinuity({
    worldModel: eventSpine.worldModel,
    beats: eventSpine.shots.map((beat, index) => ({
      ...beat,
      timeRange: {
        startSecond: beatWindows[index].startSecond,
        endSecond: beatWindows[index].endSecond,
      },
    })),
  });
  const takeTimingFailureReasons: string[] = [];
  const timeTolerance = 0.051;
  continuity.takePlan.takes.forEach((take) => {
    const first = beatWindows.find((beat) => beat.index === take.beatIndexes[0]);
    const last = beatWindows.find((beat) => beat.index === take.beatIndexes[take.beatIndexes.length - 1]);
    if (!first || !last
      || Math.abs(take.startSecond - first.startSecond) > timeTolerance
      || Math.abs(take.endSecond - last.endSecond) > timeTolerance) {
      takeTimingFailureReasons.push(`take_window_not_derived_from_beats: take ${take.takeIndex + 1}`);
    }
    take.beatIndexes.forEach((beatIndex) => {
      const beat = beatWindows[beatIndex];
      if (!beat || beat.startSecond < take.startSecond - timeTolerance || beat.endSecond > take.endSecond + timeTolerance) {
        takeTimingFailureReasons.push(`beat_outside_take_range: take ${take.takeIndex + 1}, beat ${beatIndex + 1}`);
      }
    });
  });
  for (let index = 1; index < beatWindows.length; index += 1) {
    const delta = beatWindows[index].startSecond - beatWindows[index - 1].endSecond;
    if (delta > timeTolerance) takeTimingFailureReasons.push(`take_beat_time_gap: beat ${index} to ${index + 1}`);
    if (delta < -timeTolerance) takeTimingFailureReasons.push(`take_beat_time_overlap: beat ${index} to ${index + 1}`);
  }
  const shots: CommercialShotPlan[] = COMMERCIAL_SHOT_ROLES.map((role, shotIndex) => {
    const action = actionPlan[shotIndex];
    const camera = cameraPlan.shots[shotIndex];
    const sound = soundPlan.shots[shotIndex];
    const storySpine = creativeSpine.shotFunctions[shotIndex];
    const direction = creativeDirection.shotDirections[shotIndex];
    const event = eventSpine.shots[shotIndex];
    const eventRelationship = event.productDetailRelationship ?? "";
    const eventCoverage = /outsole|ground.contact/i.test(eventRelationship)
      ? resolveMessageDimension(supportedCoverage, ["outsole_profile"])
      : /panel|lace|tongue/i.test(eventRelationship)
        ? resolveMessageDimension(supportedCoverage, ["side_panel_structure", "toe_structure"])
        : /material|surface/i.test(eventRelationship)
          ? resolveMessageDimension(supportedCoverage, ["material_evidence"])
          : /heel/i.test(eventRelationship)
            ? resolveMessageDimension(supportedCoverage, ["heel_structure"])
            : null;
    const productMessageDimension = role === "DETAIL"
      ? detailDimension
      : eventCoverage ?? (creativeSpine.productPresenceByShot[shotIndex] === "CLEAR" ? wearDimension : null);
    const timing = beatWindows[shotIndex];
    return {
      shotIndex,
      role,
      timeRange: {
        startSecond: timing.startSecond,
        endSecond: timing.endSecond,
        durationSeconds: timing.durationSeconds,
      },
      semanticPurpose: storySpine.narrativePurpose,
      productVisibility: productVisibilityLevels[shotIndex],
      storySpine,
      direction,
      event,
      productMessageDimension,
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
    heroShotIndex: shots.findIndex((shot) => shot.productVisibility === "PRODUCT_HERO") >= 0
      ? shots.findIndex((shot) => shot.productVisibility === "PRODUCT_HERO") : null,
    releaseShotIndex: shots.findIndex((shot) => shot.productVisibility === "BRAND_RELEASE") >= 0
      ? shots.findIndex((shot) => shot.productVisibility === "BRAND_RELEASE") : null,
  };

  const planWithoutQc: CommercialQcInput = {
    commercialIntent: intent.id,
    commercialIntentLabel: `${intent.labelZh} / ${intent.labelEn}`,
    productMessage,
    creativeSpine,
    creativeDirection,
    eventSpine,
    continuity,
    microDecision,
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
      strategy: creativeSpine.endingImageStrategy,
      grammar: eventSpine.endingGrammar,
      line: endingLineForStrategy(creativeSpine.endingImageStrategy, eventSpine.endingGrammar.line, creativeSpine.endingImageIntent),
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
  const continuityFailureReasons = continuity.failureReasons;
  const microDecisionFailureReasons = microDecision.failureReasons;
  const failureReasons = [
    ...creativeFailureReasons,
    ...directionFailureReasons,
    ...directorFailureReasons,
    ...continuityFailureReasons,
    ...takeTimingFailureReasons,
    ...microDecisionFailureReasons,
    ...qcResult.failureReasons,
  ];
  return {
    schemaVersion: COMMERCIAL_FILM_SCHEMA_VERSION,
    plannerVersion: COMMERCIAL_FILM_VERSION,
    status: qcResult.passed
      && creativeFailureReasons.length === 0
      && directionFailureReasons.length === 0
      && directorFailureReasons.length === 0
      && takeTimingFailureReasons.length === 0
      && continuity.status === "CONTINUOUS"
      && microDecision.status !== "MICRO_DECISION_FAILED"
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
    "[ADVERTISING IDEA AUTHORITY]",
    `Advertising structure: ${advertisingStructureLine(plan.creativeSpine.advertisingStructure)}`,
    `Premise: ${plan.creativeSpine.premise.text}`,
    `Film tension: ${plan.creativeSpine.filmTension.from} → ${plan.creativeSpine.filmTension.to}. ${plan.creativeSpine.filmTension.line}`,
    `Product role: ${plan.creativeSpine.productRole}`,
    `Visual memory: ${plan.creativeSpine.visualMemoryIntent}`,
    `Ending image: ${plan.creativeSpine.endingImageIntent}`,
    ...plan.creativeSpine.brandFilmPrinciples.map((principle) => `Brand film principle: ${principle}`),
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
    "[CONTINUITY STATE]",
    `Status: ${plan.continuity.status}`,
    `World Entities: ${plan.continuity.worldModel.entities.map((entity) => `${entity.id}(${entity.kind})`).join(", ") || "none"}`,
    ...plan.continuity.worldStateTimeline.map((step) => (
      `Shot ${step.shotIndex + 1} state: ${Object.entries(step.after.attributes).flatMap(([entityId, values]) => (
        Object.entries(values).map(([attribute, value]) => `${entityId}.${attribute}=${value}`)
      )).join(" · ")}`
    )),
    ...plan.continuity.conflicts.map((conflict) => (
      `Conflict: ${conflict.code} · shot ${conflict.shotIndex + 1} · ${conflict.detail}`
    )),
    "",
    "[TAKE PLAN]",
    ...plan.continuity.takePlan.takes.map((take) => (
      `Take ${take.takeIndex + 1}: shots ${take.shotIndexes.map((shotIndex) => shotIndex + 1).join(", ")} · ${take.startSecond.toFixed(1)}-${take.endSecond.toFixed(1)}s`
      + `${take.boundary ? ` · boundary ${take.boundary.motivation}: ${take.boundary.boundaryReason} · why continuous fails: ${take.boundary.whyContinuousTakeFails}` : ""}`
    )),
    ...plan.continuity.takePlan.boundaryDecisions.map((decision) => (
      `Boundary ${decision.shotIndex + 1}: ${decision.admitted ? `ADMITTED ${decision.admittedMotivation}` : "CONTINUOUS"} · ${decision.reason}`
    )),
    "",
    "[MICRO DECISION]",
    `Status: ${plan.microDecision.status}`,
    ...(plan.microDecision.contract
      ? [
        `Beat: decision shot ${plan.microDecision.contract.decisionBeatIndex + 1} → consequence shot ${plan.microDecision.contract.consequenceBeatIndex + 1}`,
        `Decision Status: ${plan.microDecision.contract.decisionStatus} at shot ${plan.microDecision.contract.decisionBeatIndex + 1}`,
        `Chosen Action Id: ${plan.microDecision.contract.chosenActionId}`,
        `Routine: ${plan.microDecision.contract.routine}`,
        `Expectation: ${plan.microDecision.contract.expectation}`,
        `Trigger: ${plan.microDecision.contract.trigger}`,
        `Chosen Action: ${plan.microDecision.contract.chosenAction}`,
        `Visible Consequence: ${plan.microDecision.contract.visibleConsequence}`,
        `Continuation: ${plan.microDecision.contract.continuation}`,
      ]
      : ["No Micro Decision contract is declared for this film."]),
    ...plan.microDecision.failureReasons.map((reason) => `Micro Decision Failure: ${reason}`),
    "",
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
