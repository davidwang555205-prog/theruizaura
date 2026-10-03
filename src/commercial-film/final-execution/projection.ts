import type {
  CommercialCameraPlan,
  CommercialFilmPlan,
} from "../types";
import type { CommercialBrandSignOff } from "../brand-signoff/types";
import type { CommercialCreativeTreatment } from "../creative-directing/types";
import type {
  CommercialFinalCameraAuthority,
  CommercialFinalDeviceContract,
  CommercialFinalEnding,
  CommercialFinalExecutionDiagnostic,
  CommercialFinalExecutionPlan,
  CommercialFinalPhysicalResource,
  CommercialFinalPhysicalResourceBinding,
  CommercialFinalProductVisibilityBeat,
  CommercialFinalProductVisibilityState,
  CommercialFinalRevealContract,
  CommercialFinalSignatureContract,
} from "./types";
import { validateCommercialFinalExecutionPlan } from "./validation";
import { planCommercialProductVisibilityAuthority } from "../product-visibility/planner";
import { isCommercialConceptResourceCameraCompatible } from "../authority-consolidation/capabilities";

export type CommercialFinalExecutionPlanInput = {
  plan: CommercialFilmPlan;
  treatment: CommercialCreativeTreatment;
  brandSignOff: CommercialBrandSignOff;
  canonicalCompiledText: string;
  productionCompiledText: string;
};

const GENERIC_RESOURCE_TOKENS = new Set([
  "the",
  "a",
  "an",
  "and",
  "of",
  "in",
  "on",
  "at",
  "real",
  "same",
  "existing",
  "foreground",
  "background",
  "passing",
  "closing",
  "moving",
  "surface",
  "edge",
  "line",
  "opening",
  "frame",
  "area",
  "space",
]);

const ENDING_ENTITY_TERMS = [
  "passerby",
  "passersby",
  "pedestrian",
  "pedestrians",
  "neighbor",
  "cyclist",
  "bicycle",
  "bus",
  "vehicle",
  "traffic",
  "cafe door",
  "wall light",
  "street sign",
  "wet pavement",
  "empty curb",
] as const;

const ENDING_ACTION_TERMS = [
  "opens",
  "closes",
  "swings",
  "crosses",
  "steps out",
  "exits",
  "leaves",
  "enters",
  "turns",
  "sits",
  "stands",
  "places",
  "picks up",
  "lifts",
  "reaches",
] as const;

const COMPLETED_ACTION_VERBS: Record<string, RegExp> = {
  COMPLETE_OUTFIT: /\b(?:complete|completed|completes|finished|finishes|resolved|resolves)\b/i,
  OPEN_THRESHOLD: /\b(?:open|opened|opens)\b/i,
  CROSS_THRESHOLD: /\b(?:cross|crossed|crosses|crossing)\b/i,
  COMPLETE_PREPARATION: /\b(?:complete|completed|completes|finished|finishes)\b/i,
};

function completedActionMatches(actionId: string, text: string) {
  if (actionId === "CROSS_THRESHOLD") {
    return /\b(?:she|her|the person|character)\b\s+(?:(?:already|has|had|just|then|later|continues?\s+to|begins?\s+to)\s+)*cross(?:es|ed|ing)?\b/i.test(text)
      || /\bcross(?:es|ed|ing)?\b\s+(?:(?:with|by)\s+)?\b(?:her|the person|character)\b/i.test(text);
  }
  if (actionId === "OPEN_THRESHOLD") {
    return /\b(?:door|doorway|threshold|gate)\b\s+(?:is\s+|has\s+|had\s+|then\s+|already\s+)*open(?:s|ed)?\b/i.test(text)
      || /\b(?:she|her|the person|character)\b\s+(?:has\s+|had\s+|then\s+|already\s+)*open(?:s|ed)?\b/i.test(text);
  }
  const pattern = COMPLETED_ACTION_VERBS[actionId];
  if (!pattern) return false;
  return /\b(?:she|her|the person|character|outfit|preparation|action)\b\s+(?:is\s+|has\s+|had\s+|then\s+|already\s+)*(?:complete|completed|completes|finish|finished|finishes|resolve|resolved)\b/i.test(text);
}

const STRICT_RESOURCE_CONCEPTS = new Set<CommercialCreativeTreatment["directorConceptId"]>([
  "REFLECTION_WORLD",
  "LIGHT_REVEAL",
  "THRESHOLD_CHAIN",
  "WORLD_MOVES_SUBJECT_SETTLES",
  "REPEATED_GESTURE",
]);

const EXPLICIT_SUBJECT_EXIT =
  /\b(?:she|her|the person|subject)\b[^.]{0,80}\b(?:leaves|left|exits|is gone|steps out|moves out)\b|after\s+(?:she|the person)\s+(?:leaves|left|is gone)|empty\s+(?:window\s+)?(?:seat|floor|room|hallway|crossing)\b/i;

const FINAL_EVENT_EXIT =
  /\b(?:exit|exits|leave|leaves|left|cross out|move out of frame|steps out)\b/i;

const DECLARED_SCENE_WORLD_CONDITIONS: Record<string, string[]> = {
  COMMERCIAL_QUIET_LUXURY: ["window glass"],
};

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value: string) {
  return normalizeText(value)
    .split(/\s+/)
    .filter((token) => token.length > 2 && !GENERIC_RESOURCE_TOKENS.has(token));
}

function ensureSentence(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  const capitalized = /^[a-z]/.test(normalized)
    ? `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`
    : normalized;
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

function takeIndexForBeat(plan: CommercialFilmPlan, beatIndex: number) {
  return plan.continuity.takePlan.takes.find((take) => take.shotIndexes.includes(beatIndex))?.takeIndex ?? -1;
}

function addResource(
  resources: CommercialFinalPhysicalResource[],
  resource: CommercialFinalPhysicalResource
) {
  if (resources.some((entry) => entry.id === resource.id)) return;
  resources.push(resource);
}

export function buildCommercialPhysicalResourceRegistry(plan: CommercialFilmPlan): CommercialFinalPhysicalResource[] {
  const resources: CommercialFinalPhysicalResource[] = [];
  plan.continuity.worldModel.entities.forEach((entity) => {
    addResource(resources, {
      id: `entity:${entity.id}`,
      label: entity.label,
      kind: "ENTITY",
      source: "WORLD_MODEL",
      entityId: entity.id,
      attributes: { ...entity.initialAttributes },
    });
  });
  plan.sceneWorld.spatialAnchors.forEach((anchor) => {
    addResource(resources, {
      id: `condition:scene:${slug(anchor)}`,
      label: anchor,
      kind: "ENVIRONMENT_CONDITION",
      source: "SCENE_WORLD",
      entityId: null,
      attributes: {},
    });
  });
  (DECLARED_SCENE_WORLD_CONDITIONS[plan.sceneWorld.id] ?? []).forEach((condition) => {
    addResource(resources, {
      id: `condition:scene:${slug(condition)}`,
      label: condition,
      kind: "ENVIRONMENT_CONDITION",
      source: "SCENE_WORLD",
      entityId: null,
      attributes: {},
    });
  });
  plan.eventSpine.worldLifeSignals.forEach((signal) => {
    addResource(resources, {
      id: `condition:signal:${slug(signal)}`,
      label: signal,
      kind: "ENVIRONMENT_CONDITION",
      source: "WORLD_LIFE_SIGNAL",
      entityId: null,
      attributes: {},
    });
  });
  return resources;
}

function resourceMatches(carrier: string, resource: CommercialFinalPhysicalResource) {
  const carrierNormalized = normalizeText(carrier);
  const labels = [
    normalizeText(resource.label),
    normalizeText(resource.id),
    normalizeText(resource.entityId ?? ""),
  ].filter(Boolean);
  if (labels.includes(carrierNormalized)) return true;
  const carrierWords = tokens(carrier);
  const resourceWords = new Set(tokens(`${resource.label} ${resource.id} ${resource.entityId ?? ""}`));
  return carrierWords.length > 0 && carrierWords.some((word) => resourceWords.has(word));
}

function resolveResourceForConcept(
  carrier: string,
  concept: CommercialCreativeTreatment["directorConceptId"],
  resources: CommercialFinalPhysicalResource[],
  plan?: CommercialFilmPlan
): CommercialFinalPhysicalResource | null {
  const carrierText = normalizeText(carrier);
  if (concept === "WORLD_MOVES_SUBJECT_SETTLES"
    && plan?.commercialIntent === "QUIET_LUXURY"
    && plan.eventSpine.advertisingStructure === "WORLD_OBSERVES_SUBJECT") {
    const selectedResourceId = plan.eventSpine.shots.find((shot) => (
      shot.physicalEvent.eventFamily === "WORLD_CARRIER_CHANGE"
      && shot.physicalEvent.actor === "WORLD"
    ))?.physicalEvent.requiredResource;
    const selectedResource = resources.find((resource) => resource.entityId === selectedResourceId);
    if (selectedResource && resourceMatches(carrier, selectedResource)) return selectedResource;
  }
  const candidates = resources.filter((resource) => {
    const text = normalizeText(`${resource.label} ${resource.id}`);
    if (concept === "LIGHT_REVEAL") {
      return /\b(?:window|light|shadow|falloff)\b/.test(carrierText)
        && /\b(?:window|light|shadow|falloff|reflection|reflective)\b/.test(text);
    }
    if (concept === "REFLECTION_WORLD") {
      return /\b(?:reflection|reflective|glass|mirror|polished|surface)\b/.test(carrierText)
        && /\b(?:reflection|reflective|glass|mirror|polished|surface)\b/.test(text);
    }
    if (concept === "THRESHOLD_CHAIN") {
      return /\b(?:threshold|door|doorway|curb|boundary|opening|entry)\b/.test(carrierText)
        && /\b(?:threshold|door|doorway|curb|boundary|opening|entry|frontage)\b/.test(text);
    }
    if (concept === "WORLD_MOVES_SUBJECT_SETTLES") {
      return (
        (/\bpedestrian/.test(carrierText) && /\bpedestrian/.test(text))
        || (/\b(?:traffic|vehicle)\b/.test(carrierText) && /\b(?:traffic|vehicle)\b/.test(text))
        || (/\breflection/.test(carrierText) && /\breflection/.test(text))
      );
    }
    if (concept === "REPEATED_GESTURE") {
      return /\b(?:cuff|hem|sleeve|garment|coat|outfit)\b/.test(carrierText)
        && /\b(?:outfit|garment|wardrobe)\b/.test(text);
    }
    return resourceMatches(carrier, resource);
  });
  return candidates[0] ?? null;
}

function resolveExactResource(
  value: string,
  resources: CommercialFinalPhysicalResource[]
) {
  const normalized = normalizeText(value);
  return resources.find((resource) => (
    normalizeText(resource.label) === normalized
    || normalizeText(resource.id) === normalized
    || normalizeText(resource.entityId ?? "") === normalized
  )) ?? null;
}

function resolveResource(
  carrier: string,
  concept: CommercialCreativeTreatment["directorConceptId"] | null,
  resources: CommercialFinalPhysicalResource[],
  plan?: CommercialFilmPlan
) {
  if (concept) {
    const conceptMatch = resolveResourceForConcept(carrier, concept, resources, plan);
    if (conceptMatch) return conceptMatch;
    if (STRICT_RESOURCE_CONCEPTS.has(concept)) return null;
  }
  return resources.find((resource) => resourceMatches(carrier, resource)) ?? null;
}

function takeWindowForBeat(plan: CommercialFilmPlan, beatIndex: number) {
  const take = plan.continuity.takePlan.takes.find((entry) => entry.shotIndexes.includes(beatIndex));
  const shot = plan.shotArchitecture.shots[beatIndex];
  if (!take || !shot) return null;
  return {
    beatIndex,
    takeIndex: take.takeIndex,
    startSecond: shot.timeRange.startSecond,
    endSecond: shot.timeRange.endSecond,
    durationSeconds: shot.timeRange.durationSeconds,
  };
}

function cameraText(plan: CommercialFilmPlan) {
  return plan.cameraPlan.shots
    .map((shot) => `${shot.framing} ${shot.movementLine} ${shot.transitionLine}`)
    .join(" ");
}

function cameraVisibilityCompatibility(
  plan: CommercialFilmPlan,
  beat: CommercialFinalProductVisibilityBeat
) {
  const camera = plan.cameraPlan.shots[beat.beatIndex];
  const event = plan.eventSpine.shots[beat.beatIndex];
  const text = `${camera?.framing ?? ""} ${camera?.movement ?? ""} ${camera?.movementLine ?? ""} ${event?.framingHint ?? ""}`;
  const compatible = (() => {
    if (beat.normalizedState === "ABSENT") {
      return /\b(?:crop|foreground|occlu|partial|upper-body|held|environment|entry|interior|room)\b/i.test(text);
    }
    if (beat.normalizedState === "IMPLIED") {
      return !/\b(?:lower-body|product-readable|controlled detail|brief hold)\b/i.test(text);
    }
    if (beat.normalizedState === "PARTIAL") {
      return /\b(?:partial|lower|foreground|occlu|medium|detail|body|frame)\b/i.test(text);
    }
    if (beat.normalizedState === "SECONDARY") {
      return /\b(?:full|medium|environment|three-quarter|frame|body)\b/i.test(text);
    }
    return /\b(?:medium|full|lower|detail|worn|product|three-quarter|frame|body)\b/i.test(text);
  })();
  return {
    beatIndex: beat.beatIndex,
    visibility: beat.normalizedState,
    compatible,
    reason: compatible
      ? `Camera framing is compatible with ${beat.normalizedState} at beat ${beat.beatIndex + 1}.`
      : `Camera framing does not support ${beat.normalizedState} at beat ${beat.beatIndex + 1}.`,
  };
}

function buildEnding(input: {
  plan: CommercialFilmPlan;
  treatment: CommercialCreativeTreatment;
  brandSignOff: CommercialBrandSignOff;
  resources: CommercialFinalPhysicalResource[];
}): {
  ending: CommercialFinalEnding;
  diagnostics: CommercialFinalExecutionDiagnostic[];
} {
  const { plan, treatment, brandSignOff } = input;
  const diagnostics: CommercialFinalExecutionDiagnostic[] = [];
  const rejectionReasons: string[] = [];
  const finalEvent = plan.shotArchitecture.shots[plan.shotArchitecture.shots.length - 1]?.event;
  const candidateImage = treatment.endingImage;
  const finalCharacterState = {
    ...(plan.continuity.finalState.attributes.character ?? {}),
  };
  let candidateAccepted = true;
  const reject = (
    _code: CommercialFinalExecutionDiagnostic["code"],
    message: string
  ) => {
    candidateAccepted = false;
    rejectionReasons.push(message);
  };

  const physicalActionTerm = (text: string, term: string) => {
    const escaped = term.replace(/\s+/g, "\\s+");
    const subjectBefore = new RegExp(
      `\\b(?:she|her|the person|subject|door|camera|light|reflection|pedestrian|pedestrians|cyclist|bicycle|bus)\\b[^.]{0,48}\\b${escaped}\\b`,
      "i"
    );
    const subjectAfter = new RegExp(
      `\\b${escaped}\\b[^.]{0,48}\\b(?:she|her|the person|subject|door|camera|light|reflection|pedestrian|pedestrians|cyclist|bicycle|bus)\\b`,
      "i"
    );
    return subjectBefore.test(text) || subjectAfter.test(text);
  };

  if (EXPLICIT_SUBJECT_EXIT.test(candidateImage) && !FINAL_EVENT_EXIT.test(finalEvent?.whatHappens ?? "")) {
    reject(
      "ENDING_SUBJECT_EXIT",
      "The candidate ending image implies a subject exit, but the final structured event does not declare one."
    );
  }

  for (const term of ENDING_ENTITY_TERMS) {
    if (!new RegExp(`\\b${term.replace(/\s+/g, "\\s+")}\\b`, "i").test(candidateImage)) continue;
    const resource = resolveExactResource(term, input.resources);
    if (!resource) {
      reject(
        "ENDING_NEW_ENTITY",
        `The candidate ending image introduces "${term}", which is not a declared physical resource.`
      );
    }
  }

  for (const term of ENDING_ACTION_TERMS) {
    const pattern = new RegExp(`\\b${term.replace(/\s+/g, "\\s+")}\\b`, "i");
    if (
      pattern.test(candidateImage)
      && physicalActionTerm(candidateImage, term)
      && !pattern.test(finalEvent?.whatHappens ?? "")
    ) {
      reject(
        "ENDING_NEW_ACTION",
        `The candidate ending image introduces the action "${term}", which is not the final structured event.`
      );
    }
  }

  plan.continuity.finalState.completedActions.forEach((actionId) => {
    if (
      completedActionMatches(actionId, candidateImage)
      && !completedActionMatches(actionId, finalEvent?.whatHappens ?? "")
    ) {
      reject(
        "COMPLETED_ACTION_REPLAY",
        `The candidate ending image replays completed action ${actionId}.`
      );
    }
  });

  const fallback = ensureSentence(
    `${finalEvent?.whatHappens ?? "The person remains in the final state."} ${plan.endingStrategy.line}`
  );
  const filmLine = {
    value: brandSignOff.filmLine,
    postProductionOnly: brandSignOff.postProductionOnly,
    endingImagePreserved: brandSignOff.endingImagePreserved,
  };
  if (filmLine.value && (!filmLine.postProductionOnly || !filmLine.endingImagePreserved)) {
    diagnostics.push({
      code: "FILM_LINE_AUTHORITY_LEAK",
      layer: "film-line",
      message: "The film line is present but is not marked as a post-production overlay over the preserved ending image.",
      source: "BRAND_SIGNOFF",
    });
  }

  return {
    ending: {
      candidateImage,
      candidateAccepted,
      finalImage: candidateAccepted ? candidateImage : fallback,
      rejectionReasons,
      finalCharacterState,
      finalWorldState: plan.continuity.finalState,
      endingGrammar: plan.endingStrategy.grammar,
      releaseConstraint: plan.endingStrategy.line,
      filmLine,
    },
    diagnostics,
  };
}

function renderPolicyFor(plan: CommercialFilmPlan): CommercialFinalExecutionPlan["renderPolicy"] {
  const soundProgression = plan.soundPlan.shots.map((shot) => {
    const step = plan.continuity.worldStateTimeline.find((entry) => entry.shotIndex === shot.shotIndex);
    const start = step?.before.attributes.character?.space ?? "the established space";
    const end = step?.after.attributes.character?.space ?? start;
    const state = start === end ? end : `${start} → ${end}`;
    return `${state}: ${shot.cues.join("; ")}`;
  });
  return {
    visualLookLines: [
      "Natural light, restrained saturation, realistic skin, matte non-glossy finish, soft controlled contrast.",
      "The environment may use a restrained warm-neutral grade, but product color and material must remain faithful to the confirmed reference.",
      plan.worldRealism.line,
      "Allow controlled observational imperfection: slight occlusion, late entry, off-center framing, and the camera holding after movement.",
    ].filter(Boolean),
    soundLines: [
      `Context: ${plan.soundPlan.context}.`,
      `Sound progression (derived from beat states): ${soundProgression.join(" → ")}.`,
      ...plan.soundPlan.shots.map((shot) => {
        const step = plan.continuity.worldStateTimeline.find((entry) => entry.shotIndex === shot.shotIndex);
        const start = step?.before.attributes.character?.space ?? "the established space";
        const end = step?.after.attributes.character?.space ?? start;
        return `Beat ${shot.shotIndex + 1} spatial state: ${start}${start === end ? "" : ` → ${end}`}; sound cues: ${shot.cues.join("; ")}.`;
      }),
      "No dialogue, no voiceover, no music unless explicitly requested.",
    ],
    productProtectionLines: [
      plan.productMessage.externalToolReferenceInstruction,
      plan.productMessage.externalReferenceRequired
        ? plan.productMessage.noFabricationLine
        : "Use the confirmed current-task product references as the product-fact authority; upload this same reference set to the external video generation tool and use only its supported dimensions and visible facts.",
      "Preserve silhouette, proportions, visible material and color relationships, and grounded foot-to-product scale.",
      "Do not invent product facts, logos, materials, colors, panel geometry, or construction.",
      ...plan.productMessage.prohibitedClaims.map((claim) => `No ${claim.replace(/^no\s+/i, "")}.`),
    ],
    negativeLines: [
      "No runway posing, deliberate shoe presentation, camera-aware influencer gestures, shoe chase camera, orbit, 360, whip pan, or aggressive dolly.",
      "No clearly readable invented brand names or corrupted AI text.",
      "No product-only packshot, invented product detail, floating footwear, or detached shoe.",
      "No readable brand names, generated text, letters, logos, or signage in the environment unless explicitly requested.",
    ],
  };
}

export function buildCommercialFinalExecutionPlan(
  input: CommercialFinalExecutionPlanInput
): CommercialFinalExecutionPlan {
  const { plan, treatment, brandSignOff } = input;
  const diagnostics: CommercialFinalExecutionDiagnostic[] = [];
  const resources = buildCommercialPhysicalResourceRegistry(plan);
  const takeWindows = plan.shotArchitecture.shots
    .map((_, beatIndex) => takeWindowForBeat(plan, beatIndex))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  const beats = plan.shotArchitecture.shots.map((shot, beatIndex) => ({
    beatIndex,
    takeIndex: takeIndexForBeat(plan, beatIndex),
    role: shot.role,
    timeRange: shot.timeRange,
    action: shot.action.physicalActionLine,
    eventWhatHappens: shot.event.whatHappens,
    eventWhatChanges: shot.event.whatChanges,
    spatialAnchor: shot.spatialAnchor,
    camera: plan.cameraPlan.shots[beatIndex],
    productVisibility: "IMPLIED" as CommercialFinalProductVisibilityState,
  }));

  const visibilityAuthority = planCommercialProductVisibilityAuthority({
    plan,
    structureGoals: treatment.structure.map((beat) => beat.productVisibilityGoal),
    revealCause: treatment.productRevealLogic.cause,
    requiredVisibleEvidence: [
      treatment.signatureEvent.event,
      treatment.signatureEvent.eventRevealLink.eventResult,
      treatment.productRevealLogic.consequence,
    ],
  });
  const visibilityTimeline: CommercialFinalProductVisibilityBeat[] = visibilityAuthority.timeline;
  beats.forEach((beat, beatIndex) => {
    beat.productVisibility = visibilityTimeline[beatIndex]?.normalizedState ?? "IMPLIED";
  });
  diagnostics.push(...visibilityAuthority.diagnostics.map((entry) => ({
    code: entry.code,
    layer: entry.code === "REVEAL_CONFLICT" ? "reveal" : "product-visibility",
    beatIndex: entry.beatIndex,
    source: "PLAN",
    message: entry.message,
  } satisfies CommercialFinalExecutionDiagnostic)));
  const revealContract: CommercialFinalRevealContract = visibilityAuthority.revealContract;

  const deviceBindings: CommercialFinalPhysicalResourceBinding[] = treatment.deviceArc.map((beat) => {
    const takeIndex = takeIndexForBeat(plan, beat.beatIndex);
    const resource = resolveResource(beat.deviceCarrier, treatment.directorConceptId, resources, plan);
    if (!resource) {
      diagnostics.push({
        code: "UNDECLARED_PHYSICAL_RESOURCE",
        layer: "device",
        beatIndex: beat.beatIndex,
        takeIndex: takeIndex >= 0 ? takeIndex : undefined,
        source: "TREATMENT",
        resource: beat.deviceCarrier,
        message: `Device carrier "${beat.deviceCarrier}" cannot be resolved to a World Model entity or declared environment condition.`,
      });
    }
    if (takeIndex < 0) {
      diagnostics.push({
        code: "DEVICE_TAKE_INCOMPATIBLE",
        layer: "device",
        beatIndex: beat.beatIndex,
        source: "TREATMENT",
        message: `Device beat ${beat.beatIndex + 1} does not belong to any TakePlan take.`,
      });
    }
    return {
      beatIndex: beat.beatIndex,
      takeIndex,
      carrier: beat.deviceCarrier,
      resourceId: resource?.id ?? null,
      resolved: Boolean(resource),
      reason: resource
        ? `Resolved to ${resource.source} ${resource.label}.`
        : "No declared physical resource matched this carrier.",
    };
  });

  if (deviceBindings.every((binding) => !binding.resolved)) {
    diagnostics.push({
      code: "DEVICE_RESOURCE_MISSING",
      layer: "device",
      source: "TREATMENT",
      message: "No device beat resolves to a declared physical resource.",
    });
  }

  const signatureBeatIndex = treatment.signatureMoment.signatureBeatIndex;
  const signatureTakeIndex = takeIndexForBeat(plan, signatureBeatIndex);
  const signatureResource = resolveResource(
    treatment.signatureMoment.carrier,
    treatment.directorConceptId,
    resources,
    plan
  );
  const signatureEvidence = [
    treatment.signatureMoment.momentDescription,
    treatment.signatureMoment.visualInterruption,
    treatment.signatureMoment.afterMoment,
    treatment.signatureEvent.eventRevealLink.revealChange,
  ].map((value) => value.trim()).filter(Boolean);
  if (!signatureResource) {
    diagnostics.push({
      code: "UNDECLARED_PHYSICAL_RESOURCE",
      layer: "signature",
      beatIndex: signatureBeatIndex,
      takeIndex: signatureTakeIndex >= 0 ? signatureTakeIndex : undefined,
      source: "TREATMENT",
      resource: treatment.signatureMoment.carrier,
      message: `Signature carrier "${treatment.signatureMoment.carrier}" cannot be resolved to a declared physical resource.`,
    });
  }
  if (signatureEvidence.length === 0 || !signatureResource) {
    diagnostics.push({
      code: "SIGNATURE_VISIBLE_EVIDENCE_MISSING",
      layer: "signature",
      beatIndex: signatureBeatIndex,
      source: "TREATMENT",
      message: "The signature moment lacks a declared visible resource or required visible evidence.",
    });
  }
  if (signatureTakeIndex < 0) {
    diagnostics.push({
      code: "DEVICE_TAKE_INCOMPATIBLE",
      layer: "signature",
      beatIndex: signatureBeatIndex,
      source: "TREATMENT",
      message: `Signature beat ${signatureBeatIndex + 1} does not belong to any TakePlan take.`,
    });
  }
  revealContract.physicalResourceDependency = [
    ...new Set([
      ...deviceBindings.map((binding) => binding.resourceId).filter((id): id is string => Boolean(id)),
      ...(signatureResource ? [signatureResource.id] : []),
    ]),
  ];

  const cameraConflicts: CommercialFinalCameraAuthority["conflicts"] = [];
  if (treatment.directorConceptId === "STATIC_CAMERA_FILM") {
    plan.cameraPlan.shots.forEach((shot) => {
      if (["restrained_follow", "short_lateral_track", "controlled_detail_framing", "motivated_pan"].includes(shot.movement)) {
        cameraConflicts.push({
          code: "DEVICE_CAMERA_INCOMPATIBLE",
          message: `Static Camera Film cannot execute ${shot.movement} at shot ${shot.shotIndex + 1}.`,
          shotIndex: shot.shotIndex,
          movement: shot.movement,
        });
      }
    });
  }
  deviceBindings.forEach((binding) => {
    if (!binding.resolved) return;
    const resource = resources.find((entry) => entry.id === binding.resourceId);
    if (!resource) return;
    if (!isCommercialConceptResourceCameraCompatible({
      concept: treatment.directorConceptId,
      plan,
      resource,
    })) {
      cameraConflicts.push({
        code: "DEVICE_CAMERA_INCOMPATIBLE",
        message: `${resource.label} is not visible in the current Camera Plan at beat ${binding.beatIndex + 1}.`,
        shotIndex: binding.beatIndex,
        movement: plan.cameraPlan.shots[binding.beatIndex]?.movement ?? null,
      });
    }
  });
  cameraConflicts.forEach((conflict) => {
    diagnostics.push({
      code: conflict.code,
      layer: "camera",
      beatIndex: conflict.shotIndex ?? undefined,
      source: "PLAN",
      message: conflict.message,
    });
  });
  const visibilityCompatibility = visibilityTimeline.map((beat) => cameraVisibilityCompatibility(plan, beat));
  visibilityCompatibility
    .filter((entry) => !entry.compatible)
    .forEach((entry) => {
      diagnostics.push({
        code: "CAMERA_VISIBILITY_INCOMPATIBLE",
        layer: "camera",
        beatIndex: entry.beatIndex,
        source: "PLAN",
        message: entry.reason,
      });
    });

  const coveredBeats = plan.continuity.takePlan.takes.flatMap((take) => take.shotIndexes).sort((left, right) => left - right);
  const expectedBeats = plan.shotArchitecture.shots.map((shot) => shot.shotIndex);
  if (
    coveredBeats.length !== expectedBeats.length
    || coveredBeats.some((beatIndex, index) => beatIndex !== expectedBeats[index])
  ) {
    diagnostics.push({
      code: "INVALID_TAKE_COVERAGE",
      layer: "take-structure",
      source: "PLAN",
      message: "TakePlan does not cover every physical beat exactly once.",
    });
  }
  if (takeWindows.length !== plan.shotArchitecture.shots.length) {
    diagnostics.push({
      code: "INVALID_TAKE_COVERAGE",
      layer: "take-structure",
      source: "PLAN",
      message: "Beat windows cannot be projected for every physical beat.",
    });
  }
  if (/^SHOT\s+\d+\s*[—:-]/im.test(input.productionCompiledText)) {
    diagnostics.push({
      code: "FIVE_SHOT_CHRONOLOGY_REINTRODUCTION",
      layer: "take-structure",
      source: "PRESENTATION",
      message: "The production text reintroduces SHOT headings as physical chronology.",
    });
  }

  const endingResult = buildEnding({
    plan,
    treatment,
    brandSignOff,
    resources,
  });
  diagnostics.push(...endingResult.diagnostics);

  const device: CommercialFinalDeviceContract = {
    concept: treatment.directorConceptId,
    device: treatment.deviceArc[signatureBeatIndex]?.deviceState ?? treatment.deviceArc[0]?.deviceState ?? "UNKNOWN",
    beatIndex: signatureBeatIndex,
    takeIndex: signatureTakeIndex,
    resourceId: signatureResource?.id ?? null,
    signatureBeatIndex,
    initialVisualState: treatment.deviceArc[0]?.deviceState ?? "UNKNOWN",
    requiredVisibleChange: treatment.signatureMoment.visualInterruption,
    resolvedVisualState: treatment.deviceArc[signatureBeatIndex]?.deviceState ?? "UNKNOWN",
    resourceBindings: deviceBindings,
    requiredVisibleEvidence: signatureEvidence,
    stateDependency: `${treatment.signatureMoment.beforeMoment} -> ${treatment.signatureMoment.afterMoment}`,
    cameraDependency: plan.cameraPlan.shots[signatureBeatIndex]
      ? `${plan.cameraPlan.shots[signatureBeatIndex].framing}; ${plan.cameraPlan.shots[signatureBeatIndex].movement}`
      : "No camera shot exists for the signature beat.",
    productDependency: revealContract.cause,
  };

  const signature: CommercialFinalSignatureContract = {
    eventId: treatment.signatureEvent.id,
    beatIndex: signatureBeatIndex,
    takeIndex: signatureTakeIndex,
    resourceId: signatureResource?.id ?? null,
    requiredVisibleEvidence: signatureEvidence,
    stateDependency: `${treatment.signatureMoment.beforeMoment} -> ${treatment.signatureMoment.afterMoment}`,
    cameraDependency: plan.cameraPlan.shots[signatureBeatIndex]
      ? `${plan.cameraPlan.shots[signatureBeatIndex].framing}; ${plan.cameraPlan.shots[signatureBeatIndex].movement}`
      : "No camera shot exists for the signature beat.",
    productDependency: revealContract.cause,
  };

  const camera: CommercialFinalCameraAuthority = {
    plan: plan.cameraPlan,
    compatibilityStatus: cameraConflicts.length > 0
      || visibilityCompatibility.some((entry) => !entry.compatible)
      ? "INCOMPATIBLE"
      : "COMPATIBLE",
    visibilityCompatibility,
    conflicts: cameraConflicts,
  };

  const planProjection: CommercialFinalExecutionPlan = {
    schemaVersion: "commercial-film/final-execution-plan-v1",
    plannerVersion: "1.0.0",
    status: "VALID",
    identity: {
      commercialIntent: plan.commercialIntent,
      commercialIntentLabel: plan.commercialIntentLabel,
      duration: plan.duration,
      cameraRhythm: plan.cameraRhythm,
      character: plan.character,
      season: plan.season,
      sceneWorld: plan.sceneWorld,
      referenceState: plan.referenceState,
      productMessage: plan.productMessage,
      brandMood: plan.brandMood,
    },
    beats,
    physicalState: {
      worldModel: plan.continuity.worldModel,
      timeline: plan.continuity.worldStateTimeline,
      finalState: plan.continuity.finalState,
      completedActions: plan.continuity.finalState.completedActions,
      continuityLock: plan.continuity.continuityLock,
      microDecision: plan.microDecision,
      eventContracts: plan.eventSpine.shots.map((shot) => ({
        beatIndex: shot.shotIndex,
        takeIndex: takeIndexForBeat(plan, shot.shotIndex),
        eventKind: shot.eventKind,
        contract: shot.stateContract,
      })),
    },
    takeStructure: {
      takePlan: plan.continuity.takePlan,
      takes: plan.continuity.takePlan.takes,
      beatWindows: takeWindows,
    },
    productVisibility: {
      timeline: visibilityTimeline,
      revealContract,
    },
    physicalResources: resources,
    device,
    signature,
    camera,
    ending: endingResult.ending,
    renderPolicy: renderPolicyFor(plan),
    source: {
      basePlan: plan,
      treatment,
      brandSignOff,
      canonicalCompiledText: input.canonicalCompiledText,
      productionCompiledText: input.productionCompiledText,
    },
    validation: {
      status: "VALID",
      checks: [],
      diagnostics,
    },
  };

  return validateCommercialFinalExecutionPlan(planProjection);
}

export function resolveCommercialFinalPhysicalResource(
  carrier: string,
  concept: CommercialCreativeTreatment["directorConceptId"],
  plan: CommercialFilmPlan
) {
  return resolveResource(carrier, concept, buildCommercialPhysicalResourceRegistry(plan), plan);
}

export function commercialFinalCameraText(plan: CommercialFilmPlan) {
  return cameraText(plan);
}
