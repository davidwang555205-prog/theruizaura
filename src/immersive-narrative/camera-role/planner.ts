import type { NarrativePlan } from "../types";
import type { ResolvedMoment, SceneResolverOutput } from "../scene-resolver";
import type { ProductPresenceOutput } from "../product-presence";
import type { SoundWorldOutput } from "../sound-world";
import { buildCameraNarrativeQc } from "./qc";
import { CAMERA_NARRATIVE_RULES } from "./rules";
import type {
  CameraNarrativeInput,
  CameraNarrativeIntent,
  CameraNarrativeMoment,
  CameraNarrativeOptions,
  CameraNarrativeOutput,
  CameraNarrativeRole,
  CameraNarrativeRule,
} from "./types";

const ACTION_STATE_PATTERNS = {
  enter: /\b(?:enters?|steps? into|passes? through|opens? the|reaches? the (?:door|entrance|threshold|entryway))\b/i,
  move: /\b(?:walks?|walking|continues?|approaches?|moves?|steps?|crosses?|heads?|leaves?|exits?)\b/i,
  stationary: /\b(?:stops?|pauses?|waits?|remains?|settles?|looks?|searches?|adjusts?|reaches? for|checks?|stands?|sits?|browses?|turns?)\b/i,
  complete: /\b(?:returns? to stillness|remains? quietly|adjustment is complete|is complete|settles?)\b/i,
};

const PARTIAL_ACTION_PATTERN = /\b(?:hand|key|pocket|bag|handle|grip|book|magazine|page|sleeve|cuff|weight|stance|searching|looks inside|adjusts)\b/i;
const ACTIVE_ENDING_PATTERN = /\b(?:continues?|walks?|crosses?|steps? into|opens? the|heads? toward)\b/i;

function normalizeTopicId(value: string) {
  return value.trim().toLowerCase();
}

function getRule(topicId: string, rules?: CameraNarrativeRule[]) {
  const normalized = normalizeTopicId(topicId);
  return (rules ?? CAMERA_NARRATIVE_RULES).find((rule) => normalizeTopicId(rule.topicId) === normalized);
}

function actionState(text: string) {
  if (ACTION_STATE_PATTERNS.enter.test(text)) return "enter" as const;
  if (ACTION_STATE_PATTERNS.move.test(text)) return "move" as const;
  if (ACTION_STATE_PATTERNS.stationary.test(text)) return "stationary" as const;
  return "stationary" as const;
}

function supportsPartialObservation(text: string) {
  return PARTIAL_ACTION_PATTERN.test(text);
}

function isCompletionState(text: string) {
  return ACTION_STATE_PATTERNS.complete.test(text);
}

function hasActiveEndingAction(text: string) {
  return ACTIVE_ENDING_PATTERN.test(text) && !isCompletionState(text);
}

function roleIntent(role: CameraNarrativeRole): CameraNarrativeIntent {
  return {
    followsSubjectMovement: role === "FOLLOWER",
    cameraPreExistsInSpace: role === "WAITING_CAMERA" || role === "AFTER_ACTION",
    allowsSubjectToExitFrame: role === "AFTER_ACTION",
    allowsPartialBodyObservation: role === "PARTIAL_OBSERVATION",
  };
}

function isRoleMotivated(role: CameraNarrativeRole, state: "enter" | "move" | "stationary", text: string, index: number, total: number) {
  if (role === "OBSERVER") return true;
  if (role === "FOLLOWER") return state === "move" || state === "enter";
  if (role === "WAITING_CAMERA") return state === "enter" || state === "move";
  if (role === "PARTIAL_OBSERVATION") return supportsPartialObservation(text);
  if (role === "AFTER_ACTION") return index === total - 1 && (isCompletionState(text) || !hasActiveEndingAction(text));
  return false;
}

function resolveRole(
  baseline: CameraNarrativeRole,
  moment: ResolvedMoment,
  index: number,
  total: number,
  partialAlreadyUsed: boolean
) {
  const text = moment.originalWhatHappens;
  const state = actionState(text);
  let role = baseline;
  let reason = `Baseline ${baseline} is supported by the existing ${state} action.`;

  if (role === "PARTIAL_OBSERVATION" && (!supportsPartialObservation(text) || partialAlreadyUsed)) {
    role = "OBSERVER";
    reason = "PARTIAL_OBSERVATION is not used because the existing action has no grounded partial-observation reason.";
  }
  if (role === "FOLLOWER" && state === "stationary") {
    role = "OBSERVER";
    reason = "FOLLOWER is not used for a stationary action; OBSERVER keeps the camera non-interfering.";
  }
  if (role === "WAITING_CAMERA" && state === "stationary") {
    role = supportsPartialObservation(text) ? "OBSERVER" : "OBSERVER";
    reason = "WAITING_CAMERA is not used because the subject is not entering or crossing the existing space.";
  }
  if (role === "AFTER_ACTION" && index !== total - 1) {
    role = state === "move" ? "FOLLOWER" : "OBSERVER";
    reason = "AFTER_ACTION is reserved for the narrative ending.";
  }
  if (role === "AFTER_ACTION" && index === total - 1 && hasActiveEndingAction(text)) {
    role = state === "move" || state === "enter" ? "FOLLOWER" : "OBSERVER";
    reason = "AFTER_ACTION is not forced while the final Moment still contains active movement or entry.";
  }

  return { role, reason };
}

export function buildCameraNarrativeInput(
  plan: NarrativePlan,
  sceneResolution: SceneResolverOutput,
  productPresence: ProductPresenceOutput,
  soundWorld: SoundWorldOutput
): CameraNarrativeInput {
  return {
    topicId: plan.topicId as CameraNarrativeInput["topicId"],
    narrativeStatus: plan.status,
    sceneResolutionStatus: sceneResolution.status,
    productPresenceStatus: productPresence.status,
    soundWorldStatus: soundWorld.status,
    storyIntent: plan.storyIntent,
    resolvedMoments: sceneResolution.resolvedMoments.map((moment) => ({ ...moment })),
    productPresenceCurve: productPresence.curve.map((moment) => ({ ...moment })),
    soundMoments: soundWorld.moments.map((moment) => ({ ...moment })),
  };
}

export function planCameraNarrative(
  input: CameraNarrativeInput,
  options: CameraNarrativeOptions = {}
): CameraNarrativeOutput {
  const rule = getRule(input.topicId, options.rules);
  const failureReasons: string[] = [];
  const moments: CameraNarrativeMoment[] = [];
  const unmotivatedRoles: string[] = [];
  const productDrivenReasons: string[] = [];
  const overdirectionReasons: string[] = [];
  let partialAlreadyUsed = false;

  if (input.narrativeStatus !== "APPROVED_FOR_SCENE_RESOLUTION") {
    failureReasons.push("NARRATIVE_NOT_APPROVED: Camera Narrative requires an approved Narrative.");
  }
  if (input.sceneResolutionStatus !== "SCENE_RESOLUTION_APPROVED") {
    failureReasons.push("SCENE_RESOLUTION_NOT_APPROVED: Camera Narrative requires approved Scene Resolution.");
  }
  if (input.productPresenceStatus !== "PRODUCT_PRESENCE_APPROVED") {
    failureReasons.push("PRODUCT_PRESENCE_NOT_APPROVED: Camera Narrative requires approved Product Presence.");
  }
  if (input.soundWorldStatus !== "SOUND_WORLD_APPROVED") {
    failureReasons.push("SOUND_WORLD_NOT_APPROVED: Camera Narrative requires an approved Sound World.");
  }
  if (input.resolvedMoments.length < 4 || input.resolvedMoments.length > 5) {
    failureReasons.push(`INVALID_MOMENT_COUNT: Camera Narrative V1 supports 4 to 5 moments, received ${input.resolvedMoments.length}.`);
  }
  if (input.resolvedMoments.length !== input.productPresenceCurve.length || input.resolvedMoments.length !== input.soundMoments.length) {
    failureReasons.push("MOMENT_COUNT_MISMATCH: Narrative, Product Presence, and Sound World counts differ.");
  }
  if (!rule) {
    failureReasons.push(`UNSUPPORTED_TOPIC: No Camera Narrative V1 baseline exists for "${input.topicId}".`);
  }

  if (rule) {
    if (rule.productDriven) {
      productDrivenReasons.push(`Topic ${rule.topicId} requests a product-driven camera role.`);
      failureReasons.push("PRODUCT_DRIVEN_CAMERA: Camera Role may not be driven by Product Presence.");
    }
    if (rule.partialObservationPurpose === "product") {
      productDrivenReasons.push(`PARTIAL_OBSERVATION on ${rule.topicId} is configured as a product close-up.`);
      failureReasons.push("PARTIAL_OBSERVATION_PRODUCT_CLOSEUP: Partial observation must be narrative-led.");
    }
    if (rule.overdirected) {
      overdirectionReasons.push(`Topic ${rule.topicId} requests an overdirected role sequence.`);
      failureReasons.push("CAMERA_OVERDIRECTION: Camera Role changes exceed the V1 direction budget.");
    }

    input.resolvedMoments.forEach((moment, index) => {
      const productMoment = input.productPresenceCurve[index];
      const soundMoment = input.soundMoments[index];
      const baseline = rule.baseline[index];
      if (!baseline || !["OBSERVER", "FOLLOWER", "WAITING_CAMERA", "AFTER_ACTION", "PARTIAL_OBSERVATION"].includes(baseline)) {
        failureReasons.push(`INVALID_CAMERA_ROLE: Moment ${index + 1} has no valid baseline role.`);
        return;
      }

      const state = actionState(moment.originalWhatHappens);
      let resolved = resolveRole(baseline, moment, index, input.resolvedMoments.length, partialAlreadyUsed);
      let role = resolved.role;
      let reason = resolved.reason;

      if (rule.forceAfterAction && index === input.resolvedMoments.length - 1 && hasActiveEndingAction(moment.originalWhatHappens)) {
        role = "AFTER_ACTION";
        reason = "AFTER_ACTION was forced while the final Moment still contains active movement or entry.";
        unmotivatedRoles.push(`Moment ${index + 1}: AFTER_ACTION conflicts with an active ending action.`);
        failureReasons.push("AFTER_ACTION_CONFLICT: The final Moment still contains necessary active movement.");
      }

      if (!isRoleMotivated(role, state, moment.originalWhatHappens, index, input.resolvedMoments.length)) {
        unmotivatedRoles.push(`Moment ${index + 1}: ${role} is not motivated by the existing action.`);
        failureReasons.push(`ROLE_ACTION_CONFLICT: Moment ${index + 1} camera role does not match the existing action.`);
      }

      if (!productMoment || !soundMoment) {
        reason = "Upstream Moment data is missing.";
      }
      if (role === "PARTIAL_OBSERVATION") partialAlreadyUsed = true;
      moments.push({
        momentIndex: moment.momentIndex,
        originalWhatHappens: moment.originalWhatHappens,
        sceneId: moment.sceneId,
        role,
        reason,
        cameraIntent: roleIntent(role),
      });
    });
  }

  const narrativePreserved = moments.length === input.resolvedMoments.length
    && moments.every((moment, index) => {
      const resolved = input.resolvedMoments[index];
      const product = input.productPresenceCurve[index];
      const sound = input.soundMoments[index];
      return Boolean(product && sound)
        && moment.momentIndex === resolved.momentIndex
        && moment.sceneId === resolved.sceneId
        && moment.originalWhatHappens === resolved.originalWhatHappens
        && product.sceneId === resolved.sceneId
        && product.originalWhatHappens === resolved.originalWhatHappens
        && sound.sceneId === resolved.sceneId
        && sound.originalWhatHappens === resolved.originalWhatHappens;
    });
  if (!narrativePreserved) {
    failureReasons.push("NARRATIVE_NOT_PRESERVED: Camera Role output changed a Moment, Scene, Product Presence, or Sound World field.");
  }

  const partialCount = moments.filter((moment) => moment.role === "PARTIAL_OBSERVATION").length;
  if (partialCount > 1) overdirectionReasons.push(`PARTIAL_OBSERVATION appears ${partialCount} times.`);

  const qcResult = buildCameraNarrativeQc({
    moments,
    expectedMomentCount: input.resolvedMoments.length,
    narrativePreserved,
    unmotivatedRoles,
    productDrivenReasons,
    overdirectionReasons,
  });
  const status = qcResult.allPassed && failureReasons.length === 0
    ? "CAMERA_NARRATIVE_APPROVED"
    : "CAMERA_NARRATIVE_FAILED";

  return {
    soundWorldStatus: input.soundWorldStatus,
    topicId: input.topicId,
    moments,
    qc: qcResult.qc,
    status,
    failureReasons: failureReasons.length ? failureReasons : undefined,
  };
}
