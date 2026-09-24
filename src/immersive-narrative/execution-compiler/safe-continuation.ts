import type { CameraExecutionMoment } from "../camera-execution";
import type { SoundMoment } from "../sound-world";
import type {
  ActionExecutionEvidence,
  ExecutionMomentContract,
  SafeContinuation,
  SafeContinuationResult,
} from "./types";

const CONTAINER_PATTERN = /\bbag\b|\bpocket\b|\bhandbag\b/i;
const ITEM_PATTERN = /\bkey\b|\bcard\b|\bsmall item\b|\bthe object\b/i;

function containerOf(text: string) {
  return text.match(CONTAINER_PATTERN)?.[0].toLowerCase() ?? null;
}

function itemOf(text: string) {
  return text.match(ITEM_PATTERN)?.[0].toLowerCase() ?? null;
}

function searchEvidence(evidence: ActionExecutionEvidence | null, text: string) {
  if (evidence && (evidence.capabilityIds.includes("CONTAINER_OBJECT_SEARCH") || evidence.handTask === "object_search")) {
    return "previous Moment already established the same search";
  }
  if (/\blooks? inside the (?:bag|pocket)\b|\bchecks? the pocket (?:once more|again)\b|\banother second\b/i.test(text)) {
    return "the Narrative Moment describes the continued search itself";
  }
  return null;
}

function carriedObjectEvidence(evidence: ActionExecutionEvidence | null, previousText = "") {
  if (/\bin hand\b|\bwith one bag\b|\bcarrying\b|\bcarried\b/i.test(previousText)) {
    return "the previous Moment already holds the same item in hand";
  }
  if (!evidence) return null;
  const holds = evidence.capabilityIds.some((capability) => (
    capability === "CARRIED_OBJECT_HOLD"
    || capability === "CARRIED_OBJECT_ADJUST"
    || capability === "CARRIED_OBJECT_CHECK"
  ));
  if (holds) return "previous Moment already established carrying the same object";
  if (evidence.handTask && evidence.handTask.startsWith("carried_object")) return "previous Moment already established carrying the same object";
  return null;
}

function travellingEvidence(evidence: ActionExecutionEvidence | null) {
  if (!evidence?.movementState) return null;
  return /^walking_|^turning$|^stopping_settle$|^transition_pause$/.test(evidence.movementState)
    ? "previous Moment already established the walk toward this position"
    : null;
}

function doorEvidence(text: string, topicNarrative: string) {
  const statesInteraction = /\b(?:opens?|unlocks?|closes?)\b[^.]*\bdoor\b|\breaches? for the door\b/i.test(text);
  if (!statesInteraction) return null;
  if (!/\bdoor\b/i.test(topicNarrative)) return null;
  return "the Narrative Moment states the door interaction itself";
}

function reuseCamera(cameraMoment: CameraExecutionMoment | undefined, previousCamera: string | null) {
  if (cameraMoment?.status === "EXECUTABLE" && cameraMoment.movementRelationToSubject) {
    return cameraMoment.movementRelationToSubject;
  }
  return previousCamera ?? "Keep the established camera position and framing; do not create a new shot.";
}

// Safe continuation is allowed only when the Narrative Moment itself describes
// the behaviour and it continues an established state or states a simple change.
export function resolveSafeContinuation(
  contract: ExecutionMomentContract,
  previous: { contract: ExecutionMomentContract; evidence: ActionExecutionEvidence } | null,
  cameraMoment: CameraExecutionMoment | undefined,
  soundMoment: SoundMoment | undefined,
  topicNarrative: string,
  previousCameraDescription: string | null
): SafeContinuationResult {
  const text = contract.narrativeEvent;
  const container = containerOf(text) ?? containerOf(topicNarrative);
  const item = itemOf(text) ?? itemOf(topicNarrative);
  const anchor = contract.spatialAnchor;
  const cameraReuse = reuseCamera(cameraMoment, previousCameraDescription);
  const soundReuse = soundMoment
    ? [...soundMoment.environment, ...soundMoment.human]
    : [];

  const finish = (continuation: SafeContinuation): SafeContinuationResult => ({ available: true, continuation });

  if (contract.endState === "SEARCH_CONTINUES" || contract.endState === "SEARCH_BEGINS") {
    const evidence = searchEvidence(previous?.evidence ?? null, text);
    if (!evidence) return { available: false, reason: "the continued search is not established by the previous Moment or by this Moment's own text" };
    if (!container || !item) return { available: false, reason: "the searched container or object is not established by the Narrative" };
    const pause = /\bstops?\b|\bpauses?\b|\bdoes not immediately find\b/i.test(text);
    const movement = pause
      ? `She comes to a natural stop at the ${anchor}`
      : `She keeps the same quiet position at the ${anchor}`;
    if (contract.endState === "SEARCH_BEGINS") {
      return finish({
        kind: "SEARCH_CONTINUES",
        continuesActionId: previous?.evidence.actionId ?? null,
        humanLine: `As her stride settles at the ${anchor}, one hand moves inside the ${container} and begins feeling for the ${item}. The search has only started; the ${item} is not yet found or brought out.`,
        preservedObject: container,
        preservedHandTask: "search inside the carried container",
        preservedCausalState: "still looking for the same object",
        cameraReuse,
        soundReuse,
        evidence,
      });
    }
    return finish({
      kind: "SEARCH_CONTINUES",
      continuesActionId: previous?.evidence.actionId ?? null,
      humanLine: `${movement} and continues the same quiet search inside the ${container} for another second. The ${item} is still not found. No new action begins.`,
      preservedObject: container,
      preservedHandTask: "search inside the carried container",
      preservedCausalState: "the search continues because the object has not been found",
      cameraReuse,
      soundReuse,
      evidence,
    });
  }

  if (contract.endState === "OBJECT_HANDLING_IN_PROGRESS") {
    const evidence = carriedObjectEvidence(previous?.evidence ?? null, previous?.contract.narrativeEvent ?? "");
    if (!evidence) return { available: false, reason: "no established carried object supports this handling Moment" };
    const heldItem = container ?? itemOf(text) ?? itemOf(topicNarrative);
    if (!heldItem) return { available: false, reason: "the carried object is not established by the Narrative" };
    if (!container) {
      return finish({
        kind: "CARRIED_OBJECT_HANDLING_CONTINUES",
        continuesActionId: previous?.evidence.actionId ?? null,
        humanLine: `She keeps the ${heldItem} in the same hand and continues the same steady carry; it settles back into her grip before she moves on. Nothing else changes.`,
        preservedObject: heldItem,
        preservedHandTask: "carry the same item in the same hand",
        preservedCausalState: "the carried item keeps its place",
        cameraReuse,
        soundReuse,
        evidence,
      });
    }
    return finish({
      kind: "CARRIED_OBJECT_HANDLING_CONTINUES",
      continuesActionId: previous?.evidence.actionId ?? null,
      humanLine: `She keeps the ${container} in the same hand and continues the same steady carry; the handle shifts slightly against her grip as she reaches the ${anchor}. Nothing else changes.`,
      preservedObject: container,
      preservedHandTask: "carry the same object in the same hand",
      preservedCausalState: "the carried object keeps its place",
      cameraReuse,
      soundReuse,
      evidence,
    });
  }

  if (contract.endState === "REACH_BEGINS" || contract.endState === "DOOR_INTERACTION") {
    const reachEvidence = travellingEvidence(previous?.evidence ?? null) ?? searchEvidence(previous?.evidence ?? null, text);
    const door = doorEvidence(text, topicNarrative);
    if (!reachEvidence && !door) {
      return { available: false, reason: "neither an established approach nor a Narrative-stated state change supports this Moment" };
    }
    if (contract.endState === "REACH_BEGINS") {
      if (!item) return { available: false, reason: "the reached-for object is not established by the Narrative" };
      return finish({
        kind: "REACH_BEGINS",
        continuesActionId: previous?.evidence.actionId ?? null,
        humanLine: `She slows at the ${anchor} and her hand begins reaching for the ${item}; nothing is taken out yet and the reach is not finished.`,
        preservedObject: item,
        preservedHandTask: "begin reaching for the same object",
        preservedCausalState: "the reach has only started",
        cameraReuse,
        soundReuse,
        evidence: reachEvidence ?? "the Narrative Moment states the beginning of the reach itself",
      });
    }
    const lead = text.split(/\band\b|,|;/i)[0].trim();
    return finish({
      kind: "NARRATIVE_STATED_STATE_CHANGE",
      continuesActionId: null,
      humanLine: `${lead}; the movement settles naturally and stops there. Nothing else happens in this moment.`,
      preservedObject: "door",
      preservedHandTask: "handle the door with one hand",
      preservedCausalState: "the door state changes only as the Narrative states",
      cameraReuse,
      soundReuse,
      evidence: door ?? "the Narrative Moment states the state change itself",
    });
  }

  return { available: false, reason: `no safe continuation rule exists for end state ${contract.endState}` };
}
