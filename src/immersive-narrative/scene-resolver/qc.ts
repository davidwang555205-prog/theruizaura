import type {
  ResolvedMoment,
  SceneResolverQc,
  SceneResolverQcGate,
  SceneResolverQcGateId,
  UnresolvedMoment,
} from "./types";
import { classifyTransition } from "../spatial/validator";
import type { SpatialAnchorId, SpatialEnvelope, SpatialSequenceValidation } from "../spatial/types";

const GATE_LABELS: Record<SceneResolverQcGateId, string> = {
  all_moments_resolved: "All Moments Resolved",
  location_continuity: "Location Continuity",
  narrative_preserved: "Narrative Preserved",
  no_scene_invention: "No Scene Invention",
  scene_sequence_spatially_continuous: "Scene Sequence Spatially Continuous",
  no_origin_execution_confusion: "No Origin / Execution Confusion",
  no_unannounced_location_jump: "No Unannounced Location Jump",
};

function gate(id: SceneResolverQcGateId, passed: boolean, reason: string): SceneResolverQcGate {
  return {
    id,
    label: GATE_LABELS[id],
    status: passed ? "PASS" : "FAIL",
    reason,
  };
}

export function buildSceneResolverQc(input: {
  expectedMomentCount: number;
  resolvedMoments: ResolvedMoment[];
  unresolvedMoments: UnresolvedMoment[];
  expectedWorldId: string | null;
  expectedWorldSceneIds: string[];
  narrativeMutationRequired: boolean;
  unknownSceneIds: string[];
  spatial: SpatialSequenceValidation;
  spatialEnvelope: SpatialEnvelope;
  resolvedSceneAnchors: SpatialAnchorId[];
  worldSceneAnchors: SpatialAnchorId[];
}): { qc: SceneResolverQc; allPassed: boolean } {
  const allMomentsResolved = input.resolvedMoments.length === input.expectedMomentCount
    && input.unresolvedMoments.length === 0;
  const locationContinuity = allMomentsResolved
    && Boolean(input.expectedWorldId)
    && input.resolvedMoments.length > 0
    && input.resolvedMoments.every((moment) => moment.locationWorldId === input.expectedWorldId)
    && input.resolvedMoments.every((moment) => input.expectedWorldSceneIds.includes(moment.sceneId))
    && !input.unresolvedMoments.some((moment) => /world|location|continuity/i.test(moment.reason));
  const narrativePreserved = !input.narrativeMutationRequired;
  const noSceneInvention = input.unknownSceneIds.length === 0;
  const spatialContinuous = input.spatial.pass && allMomentsResolved;
  const worldAnchors = input.worldSceneAnchors.filter((anchor) => anchor !== "UNKNOWN");
  const foreignAnchors = worldAnchors.filter((anchor) => (
    !input.spatialEnvelope.allowedAnchors.includes(anchor)
    && !input.spatialEnvelope.allowedAnchors.some((allowed) => classifyTransition(anchor, allowed) !== "NON_CONTIGUOUS")
  ));
  const originExecutionConfusion = foreignAnchors.length === 0
    && input.resolvedSceneAnchors.every((anchor) => anchor === "UNKNOWN" || input.spatialEnvelope.allowedAnchors.includes(anchor));
  const noLocationJump = input.spatial.transitions.every((transition) => transition.ok);

  const qc: SceneResolverQc = {
    all_moments_resolved: gate(
      "all_moments_resolved",
      allMomentsResolved,
      allMomentsResolved
        ? "Every Narrative Moment has a matching Scene Library entry."
        : `${input.resolvedMoments.length} of ${input.expectedMomentCount} moments resolved.`
    ),
    location_continuity: gate(
      "location_continuity",
      locationContinuity,
      locationContinuity
        ? `All resolved moments stay inside ${input.expectedWorldId}.`
        : "The resolved moments do not all stay inside one continuous Location World."
    ),
    narrative_preserved: gate(
      "narrative_preserved",
      narrativePreserved,
      narrativePreserved
        ? "Purpose, What Happens, and moment order are preserved from the approved Narrative."
        : "A matching result would require changing the upstream Narrative."
    ),
    no_scene_invention: gate(
      "no_scene_invention",
      noSceneInvention,
      noSceneInvention
        ? "Every resolved scene id exists in the current Scene Library."
        : `Unknown scene ids: ${input.unknownSceneIds.join(", ")}.`
    ),
    scene_sequence_spatially_continuous: gate(
      "scene_sequence_spatially_continuous",
      spatialContinuous,
      spatialContinuous
        ? `Scene sequence stays inside one continuous ${input.spatialEnvelope.macroLocation} route: ${input.spatial.transitions.map((transition) => transition.transitionClass).join(" → ") || "single anchor"}.`
        : input.spatial.failures.join(" ") || "The resolved scene sequence is not spatially continuous."
    ),
    no_origin_execution_confusion: gate(
      "no_origin_execution_confusion",
      originExecutionConfusion,
      originExecutionConfusion
        ? "Every resolved anchor belongs to the execution location of this Topic; no origin-context location is used as an execution scene."
        : foreignAnchors.length > 0
          ? `The Location World contains an origin-context anchor that is not reachable from the execution route: ${foreignAnchors.join(", ")}.`
          : `A resolved anchor sits outside the spatial envelope ${input.spatialEnvelope.macroLocation}: ${input.resolvedSceneAnchors.join(", ")}.`
    ),
    no_unannounced_location_jump: gate(
      "no_unannounced_location_jump",
      noLocationJump,
      noLocationJump
        ? "No Moment transition is classified NON_CONTIGUOUS."
        : `Non-contiguous transition(s): ${input.spatial.transitions.filter((transition) => !transition.ok).map((transition) => `${transition.fromAnchor}→${transition.toAnchor}`).join(", ")}.`
    ),
  };

  return {
    qc,
    allPassed: Object.values(qc).every((entry) => entry.status === "PASS"),
  };
}
