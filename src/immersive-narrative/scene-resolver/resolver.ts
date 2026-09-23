import type { NarrativeMoment, NarrativePlan } from "../types";
import {
  CURRENT_LOCATION_WORLDS,
  CURRENT_NARRATIVE_SCENE_LIBRARY,
  CURRENT_SCENE_RESOLUTION_RULES,
} from "./location-worlds";
import { buildSceneResolverQc } from "./qc";
import { detectSpatialAnchor, validateSpatialSequence } from "../spatial/validator";
import { topicMatches } from "../topic-catalog";
import type {
  ResolvedMoment,
  SceneResolverContinuityRole,
  SceneResolverInput,
  SceneResolverOptions,
  SceneResolverOutput,
  UnresolvedMoment,
} from "./types";

const CONTINUITY_ROLE_BY_PURPOSE: Record<NarrativeMoment["purpose"], SceneResolverContinuityRole> = {
  establish_state: "ENTRY",
  approach_trigger: "TRANSITION",
  micro_event: "EVENT",
  response: "RESPONSE",
  after_state: "EXIT",
};

function unique(values: string[]) {
  return [...new Set(values)];
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function containsForbiddenToken(value: string, tokens: string[]) {
  const normalized = normalizeText(value);
  return tokens.find((token) => normalized.includes(token.toLowerCase()));
}

function getRule(topic: string, rules: SceneResolverOptions["rules"]) {
  return (rules ?? CURRENT_SCENE_RESOLUTION_RULES).find((rule) =>
    rule.topics.some((candidate) => topicMatches(topic, candidate))
  );
}

export function buildSceneResolverInput(plan: NarrativePlan, topic: string): SceneResolverInput {
  return {
    narrativeStatus: plan.status,
    topic,
    duration: plan.durationSeconds,
    storyIntent: plan.storyIntent,
    initialCharacterState: plan.initialCharacterState,
    microEvent: plan.microEvent,
    emotionalArc: [...plan.emotionalArc],
    moments: plan.moments.map((moment) => ({ ...moment })),
    spatialEnvelope: { ...plan.spatialEnvelope, allowedAnchors: [...plan.spatialEnvelope.allowedAnchors] },
  };
}

export function resolveNarrativeScenes(
  input: SceneResolverInput,
  options: SceneResolverOptions = {}
): SceneResolverOutput {
  const sceneLibrary = options.sceneLibrary ?? CURRENT_NARRATIVE_SCENE_LIBRARY;
  const locationWorlds = options.locationWorlds ?? CURRENT_LOCATION_WORLDS;
  const rule = getRule(input.topic, options.rules);
  const sceneMap = new Map(sceneLibrary.map((scene) => [scene.id, scene]));
  const world = rule ? locationWorlds.find((candidate) => candidate.id === rule.locationWorldId) ?? null : null;
  const resolvedMoments: ResolvedMoment[] = [];
  const unresolvedMoments: UnresolvedMoment[] = [];
  const failureReasons: string[] = [];
  const unknownSceneIds: string[] = [];
  let narrativeMutationRequired = false;

  if (input.narrativeStatus !== "APPROVED_FOR_SCENE_RESOLUTION") {
    failureReasons.push("NARRATIVE_NOT_APPROVED: Scene Resolver V1 only accepts APPROVED_FOR_SCENE_RESOLUTION narratives.");
  }
  if (input.duration !== 15) {
    failureReasons.push(`INVALID_DURATION: Scene Resolver V1 expects a 15-second Narrative, received ${input.duration}.`);
  }
  if (input.moments.length < 4 || input.moments.length > 5) {
    failureReasons.push(`INVALID_MOMENT_COUNT: Scene Resolver V1 supports 4 to 5 moments, received ${input.moments.length}.`);
  }
  if (!rule) {
    failureReasons.push(`UNSUPPORTED_TOPIC: No explicit Scene Resolver V1 rule exists for "${input.topic.trim()}".`);
  }

  if (rule) {
    input.moments.forEach((moment, momentIndex) => {
      const assignment = rule.sceneAssignments[moment.purpose];
      if (!assignment) {
        const reason = rule.failureReason ?? `No Scene Library entry is assigned to ${moment.purpose}.`;
        unresolvedMoments.push({
          momentIndex,
          momentId: moment.id,
          purpose: moment.purpose,
          reason: `NO_COMPATIBLE_SCENE: ${reason}`,
        });
        failureReasons.push(`NO_COMPATIBLE_SCENE: Moment ${momentIndex + 1} (${moment.purpose}) could not be resolved. ${reason}`);
        return;
      }

      const forbiddenToken = containsForbiddenToken(moment.whatHappens, rule.forbiddenMomentTokens);
      if (forbiddenToken) {
        narrativeMutationRequired = true;
        const reason = `Moment ${momentIndex + 1} requires a location outside ${rule.locationWorldId} ("${forbiddenToken}").`;
        unresolvedMoments.push({
          momentIndex,
          momentId: moment.id,
          purpose: moment.purpose,
          reason: `NARRATIVE_MUTATION_REQUIRED: ${reason}`,
        });
        failureReasons.push(`NARRATIVE_MUTATION_REQUIRED: ${reason}`);
        return;
      }

      const scene = sceneMap.get(assignment);
      if (!scene) {
        unknownSceneIds.push(assignment);
        const reason = `Scene id "${assignment}" does not exist in the current Scene Library.`;
        unresolvedMoments.push({
          momentIndex,
          momentId: moment.id,
          purpose: moment.purpose,
          reason: `SCENE_ID_NOT_FOUND: ${reason}`,
        });
        failureReasons.push(`SCENE_ID_NOT_FOUND: Moment ${momentIndex + 1} mapped to ${reason}`);
        return;
      }

      if (!world || !world.sceneIds.includes(assignment)) {
        const reason = `Scene id "${assignment}" is outside the declared ${rule.locationWorldId} world.`;
        unresolvedMoments.push({
          momentIndex,
          momentId: moment.id,
          purpose: moment.purpose,
          reason: `LOCATION_WORLD_MISMATCH: ${reason}`,
        });
        failureReasons.push(`LOCATION_WORLD_MISMATCH: Moment ${momentIndex + 1} mapped to ${reason}`);
        return;
      }

      resolvedMoments.push({
        momentIndex,
        originalMomentId: moment.id,
        originalPurpose: moment.purposeLabel,
        originalPurposeId: moment.purpose,
        originalWhatHappens: moment.whatHappens,
        sceneId: scene.id,
        sceneName: scene.sceneName,
        locationWorldId: world.id,
        continuityRole: CONTINUITY_ROLE_BY_PURPOSE[moment.purpose],
        spatialAnchor: moment.spatialAnchor ?? "UNKNOWN",
        transitionFromPrevious: null,
        spatialContinuityStatus: "PASS",
        matchReason: `Explicit V1 mapping: ${world.label} supports ${moment.purposeLabel} through ${scene.sceneName}; no narrative rewrite is required.`,
      });
    });
  }

  // Spatial truth comes from the Narrative plan and is carried forward, never
  // re-derived from scene display names alone.
  const spatialValidation = validateSpatialSequence(
    resolvedMoments.map((moment) => moment.momentIndex),
    resolvedMoments.map((moment) => moment.spatialAnchor),
    input.spatialEnvelope
  );
  resolvedMoments.forEach((moment, index) => {
    moment.transitionFromPrevious = index === 0
      ? null
      : spatialValidation.transitions[index - 1]?.transitionClass ?? null;
    moment.spatialContinuityStatus = spatialValidation.pass ? "PASS" : "FAIL";
  });

  const narrativeFieldsPreserved = resolvedMoments.every((moment) => {
    const source = input.moments[moment.momentIndex];
    return Boolean(source)
      && moment.originalMomentId === source.id
      && moment.originalPurposeId === source.purpose
      && moment.originalPurpose === source.purposeLabel
      && moment.originalWhatHappens === source.whatHappens;
  });
  if (!narrativeFieldsPreserved) {
    failureReasons.push("NARRATIVE_NOT_PRESERVED: Scene Resolver output changed Purpose, What Happens, moment order, or source identity.");
  }

  const qcResult = buildSceneResolverQc({
    expectedMomentCount: input.moments.length,
    resolvedMoments,
    unresolvedMoments,
    expectedWorldId: world?.id ?? null,
    expectedWorldSceneIds: world?.sceneIds ?? [],
    narrativeMutationRequired: narrativeMutationRequired || !narrativeFieldsPreserved,
    unknownSceneIds: unique(unknownSceneIds),
    spatial: spatialValidation,
    spatialEnvelope: input.spatialEnvelope,
    resolvedSceneAnchors: resolvedMoments.map((moment) => moment.spatialAnchor),
    worldSceneAnchors: unique((world?.sceneIds ?? []).map((sceneId) => (
      detectSpatialAnchor(sceneMap.get(sceneId)?.sceneName ?? sceneId, "UNKNOWN")
    ))) as ResolvedMoment["spatialAnchor"][],
  });
  const status = qcResult.allPassed && failureReasons.length === 0
    ? "SCENE_RESOLUTION_APPROVED"
    : "SCENE_RESOLUTION_FAILED";

  return {
    narrativeStatus: input.narrativeStatus,
    locationWorld: world ? { id: world.id, label: world.label } : null,
    resolvedMoments,
    unresolvedMoments,
    qc: qcResult.qc,
    status,
    failureReasons: failureReasons.length ? failureReasons : undefined,
  };
}
