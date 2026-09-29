import type { NarrativeTopicId } from "../topic-catalog";
import type { CameraTransitionKind } from "../camera-execution";
import type { NarrativeCompletionBoundary, NarrativeMomentPurpose } from "../types";
import type { ImmersiveTakeRole } from "./types";

// Director-facing titles are immersive-only vocabulary: one quiet working title
// per canonical Topic. They never reuse commercial-film concept names.
export const IMMERSIVE_DIRECTOR_TITLES: Record<NarrativeTopicId, string> = {
  after_work_home: "THE LAST FEW STEPS HOME",
  weekend_alone: "A LITTLE LONGER IN THE ROOM",
  errand_outing: "OUT THE DOOR, ON WITH THE DAY",
  waiting_for_friend: "WAITING, WITHOUT HURRY",
  afternoon_cafe: "THE OPEN SEAT, THE PAUSE",
  bookstore_browse: "STOPPING AT THE WINDOW",
  returning_with_purchases: "HOME, WITH THE BAG IN HAND",
  after_school_pickup: "AFTER THE WAIT, THE WALK",
  weekend_walk: "AN EVEN PACE, NOTHING TO FIX",
  after_lunch: "THE SMALL ADJUSTMENT AFTER LUNCH",
  city_wandering: "NOTICING, THEN MOVING ON",
  evening_return_home: "THE EVENING WAY IN",
  short_local_trip: "THE LAST FEW STEPS TO ARRIVE",
};

export type ImmersiveDirectorConceptId =
  | "ONE_CONTINUOUS_OBSERVATION"
  | "WAITING_FRAME_ENTRY"
  | "FOLLOW_THEN_SETTLE"
  | "NATURAL_PARTIAL_VIEW"
  | "OBSERVED_LIFE_SLICE";

export const IMMERSIVE_DIRECTOR_CONCEPTS: Record<ImmersiveDirectorConceptId, {
  label: string;
  globalRule: string;
  device: string;
}> = {
  ONE_CONTINUOUS_OBSERVATION: {
    label: "One continuous observation",
    globalRule: "The camera is placed once and never re-framed; the person's movement creates the whole sequence.",
    device: "A single fixed observation held across the entire slice, with no cut and no camera reset.",
  },
  WAITING_FRAME_ENTRY: {
    label: "The frame is already waiting",
    globalRule: "The camera is in position before the first Moment; the person enters an unchanged frame.",
    device: "An already-waiting frame that the person enters and settles inside.",
  },
  FOLLOW_THEN_SETTLE: {
    label: "Follow, then settle",
    globalRule: "The camera follows only while the person is travelling and stops when the person stops.",
    device: "A restrained follow that ends with the person, never a chase and never a new setup.",
  },
  NATURAL_PARTIAL_VIEW: {
    label: "Seen naturally in parts",
    globalRule: "Part of the action may leave the frame through the person's own movement; the camera never moves to recover it.",
    device: "Natural partial visibility caused by the body, the space, or the frame edge — never an insert shot.",
  },
  OBSERVED_LIFE_SLICE: {
    label: "Observation settles on the subject",
    globalRule: "The camera waits, settles onto the person, and holds; it never cuts to a new setup.",
    device: "One waiting frame that becomes an unhurried observation of a small process.",
  },
};

// The Director Concept owns observation attitude, photography principles, and
// framing tendency only. It never owns cut authority. When the approved Take Plan
// already contains a motivated camera boundary, the concept reads that boundary
// instead of denying it.
export const IMMERSIVE_DIRECTOR_CONCEPT_MULTI_TAKE: Record<ImmersiveDirectorConceptId, {
  globalRule: string;
  device: string;
}> = {
  ONE_CONTINUOUS_OBSERVATION: {
    globalRule: "The camera is placed once and held for as long as one observation position can honestly cover; inside a Take it is never re-framed, and the only admitted camera boundary is the one the Take Plan already approved.",
    device: "One observation principle carried across the declared Takes: the frame waits inside each Take and continues through the single approved boundary.",
  },
  WAITING_FRAME_ENTRY: {
    globalRule: "The camera is in position before the first Moment and the person enters an unchanged frame; the only admitted camera boundary is the one the Take Plan already approved.",
    device: "An already-waiting frame carried across the declared Takes, entered rather than built around the person.",
  },
  FOLLOW_THEN_SETTLE: {
    globalRule: "The camera follows only while the person is travelling and stops when the person stops; a new observation position is admitted only at the approved camera boundary the Take Plan declares.",
    device: "A restrained follow carried across the declared Takes that ends with the person, never a chase and never an unapproved setup.",
  },
  NATURAL_PARTIAL_VIEW: {
    globalRule: "Part of the action may leave the frame through the person's own movement; the camera never moves to recover it, and a new observation position is admitted only at the approved camera boundary in the Take Plan.",
    device: "Natural partial visibility caused by the body, the space, or the frame edge, carried across the declared Takes — never an insert shot.",
  },
  OBSERVED_LIFE_SLICE: {
    globalRule: "The camera waits, settles onto the person, and holds. It never cuts to a new setup inside a Take; the only admitted camera boundary is the one the Take Plan already approved.",
    device: "One waiting observation carried across the declared Takes: the frame holds, then continues into the single approved camera boundary without any other cut.",
  },
};

export function resolveImmersiveDirectorConcept(
  roles: string[],
  takeCount: number
): { id: ImmersiveDirectorConceptId; label: string; globalRule: string; device: string } {
  let id: ImmersiveDirectorConceptId;
  if (roles.includes("PARTIAL_OBSERVATION")) id = "NATURAL_PARTIAL_VIEW";
  else if (takeCount === 1 && roles.includes("WAITING_CAMERA")) id = "WAITING_FRAME_ENTRY";
  else if (takeCount === 1) id = "ONE_CONTINUOUS_OBSERVATION";
  else if (roles.includes("FOLLOWER")) id = "FOLLOW_THEN_SETTLE";
  else id = "OBSERVED_LIFE_SLICE";
  const base = IMMERSIVE_DIRECTOR_CONCEPTS[id];
  if (takeCount === 1) return { id, ...base };
  const multi = IMMERSIVE_DIRECTOR_CONCEPT_MULTI_TAKE[id];
  return { id, label: base.label, globalRule: multi.globalRule, device: multi.device };
}

export const IMMERSIVE_TONE = {
  still: "Quiet, observational, continuous",
  moving: "Unhurried, moving, documentary",
  settling: "Calm, natural, resolved",
} as const;

export const PURPOSE_STRUCTURE_LABEL: Record<NarrativeMomentPurpose, string> = {
  establish_state: "ESTABLISH",
  approach_trigger: "TRIGGER",
  micro_event: "EVENT",
  response: "RESPONSE",
  after_state: "RESOLUTION",
};

export const BOUNDARY_NOTE: Record<NarrativeCompletionBoundary, string> = {
  WALK_CONTINUES: "still on the way; the current route continues",
  SEARCH_STARTED: "the search has only started",
  SEARCH_CONTINUES: "the search is still not resolved",
  REACH_STARTED: "the reach has only begun",
  OBJECT_HANDLING: "the object is still being handled",
  ITEM_RETRIEVED: "the item is in hand",
  DOOR_HANDLED: "the door has been handled",
  ENTERED: "inside the destination",
  SETTLED: "settled and complete",
  STATE_HELD: "the state is held",
};

export const CONTINUITY_NOTE: Record<CameraTransitionKind, string> = {
  OPEN: "the sequence opens inside the established frame",
  CONTINUOUS_HOLD: "the frame continues from the previous Moment without a cut",
  WAITING_FRAME: "the camera was already waiting before this Moment",
  SETTLE: "the camera settles with the person and holds",
  AXIS_HOLD: "the same camera side and lens family are held across the threshold",
  NONE_UNSUPPORTED: "the camera continues unchanged from the previous Moment",
};

export const TAKE_ROLE_LABEL: Record<ImmersiveTakeRole, string> = {
  OPENING_OBSERVATION: "OPENING OBSERVATION",
  CONTINUOUS_MOMENT: "CONTINUOUS MOMENT",
  MOTIVATED_REFRAME: "MOTIVATED REFRAME",
  HELD_ENDING: "HELD ENDING",
};
