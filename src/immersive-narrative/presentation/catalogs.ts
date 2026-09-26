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
