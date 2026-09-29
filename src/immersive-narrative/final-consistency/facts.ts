import type { WorldSnapshot } from "../execution-compiler/moment-contract";

// Single shared translation of the structured world state into model-facing
// language. The execution compiler, the director script renderer, and the final
// consistency validator all read this one table, so a single state can never be
// explained two different ways in two final outputs.
export const MODEL_FACING_STATE_FACTS: Record<string, Record<string, string>> = {
  "character.place": {
    CAFE_ENTRY: "She is at the cafe entrance.",
    CAFE_INTERIOR: "She is already inside the same cafe.",
    CHAIR_APPROACH: "She is already at the chair she is moving toward.",
    COMMUNITY_PATH: "She is on the same community path.",
    COUNTER: "She is at the counter inside the same cafe.",
    DESTINATION: "She is at the destination.",
    ENTRANCE: "She is at the entrance.",
    HALLWAY: "She is in the apartment hallway.",
    HOME_INTERIOR: "She is inside the home interior.",
    INSIDE: "She is already on the interior side of the crossed threshold.",
    OUTSIDE: "She is outside.",
    PATH: "She remains on the same path.",
    ROUTE: "She is on the same route.",
    SEAT: "She is at the same chair.",
    STREET: "She is on the same street.",
    THRESHOLD: "She is at the same doorway.",
    WINDOW: "She is outside at the shop window.",
  },
  "character.anchor": {
    APARTMENT_HALLWAY: "She is still in the apartment hallway.",
    APARTMENT_THRESHOLD: "She is at the apartment doorway.",
    ENTRYWAY: "She has reached the entryway.",
    HOME_INTERIOR: "She is inside the home.",
  },
  "character.motion": {
    WALKING: "Her ordinary walking movement continues.",
    SLOWING: "She is naturally slowing without stopping.",
    STOPPED: "She has come to a real stop.",
    SETTLED: "She remains naturally settled in the position already reached.",
    SEATED: "She remains seated; no second sit-down begins.",
    WAITING: "She remains in the established wait.",
  },
  "door.lock": {
    LOCKED: "The same door is still locked.",
    UNLOCKED: "The same door is already unlocked; do not unlock it again.",
  },
  "door.state": {
    CLOSED: "The same door remains closed.",
    OPEN: "The same door is already open; do not open it again.",
  },
  "key.location": {
    BAG: "The same key remains in the bag.",
    POCKET: "The same key remains in the pocket.",
    HAND: "She still holds the same key.",
  },
  "key.containment": {
    BAG: "The key remains inside the bag.",
    POCKET: "The key remains inside the pocket.",
    NONE: "The key has already been taken out of the bag.",
  },
  "key.visibility": {
    HIDDEN: "The key is not yet visible.",
    VISIBLE: "The same key remains visible.",
  },
  "bag.location": {
    FIRST_HAND: "The bag stays in the same first hand.",
    OTHER_HAND: "The same bag stays in the other hand.",
    HAND: "The same bag stays in her hand.",
  },
  "bag.strap": {
    ADJUSTED: "The same bag strap has already been adjusted; do not adjust it again.",
  },
  "entry.state": {
    NOT_ENTERED: "She has not entered yet.",
  },
  "item.location": {
    HAND: "The same small item stays in her hand.",
  },
  "item.state": {
    LOOSE: "The item is still loosely held.",
    SECURE: "The same item has already been secured.",
  },
  "notice.state": {
    UNSEEN: "The reflection has not been noticed yet.",
    SEEN: "The reflection has already been noticed; do not stage a second noticing.",
  },
  "object.location": {
    TABLE: "The same small object is still on the same surface.",
    TABLE_PLACED: "The same small object has already been put down once; do not put it down again.",
  },
  "object.visibility": {
    VISIBLE: "The same small object stays visible.",
  },
  "outer_layer.state": {
    ADJUSTED: "The outer layer has already been adjusted; do not adjust it again.",
  },
  "passage.state": {
    BLOCKED: "The same passage is still blocked.",
    CLEAR: "The passage has already cleared; do not repeat the wait.",
  },
  "route.state": {
    STRAIGHT: "She has not yet turned into the aisle.",
    AISLE: "She has already turned into the clear aisle.",
    UNDECIDED: "The route choice is not made yet.",
    CHOSEN: "The clearer route has already been chosen; do not choose again.",
  },
  "seat.state": {
    OPEN: "The same chair remains unoccupied.",
    OCCUPIED: "She remains in the same chair.",
  },
  "seat.visibility": {
    HIDDEN: "The open chair is not yet in sight.",
    VISIBLE: "The same chair remains in sight.",
  },
  "sleeve.state": {
    ADJUSTED: "The sleeve adjustment is already complete; do not repeat it.",
  },
  "store.entry": {
    NOT_ENTERED: "She remains outside the store.",
    ENTERED: "She is already inside the store; do not stage a second entry.",
  },
  "surface.state": {
    AHEAD: "The uneven surface is still ahead on this path.",
    CLEARED: "The uneven surface is already behind her; keep the same route.",
  },
  "arrival.state": {
    NOT_ARRIVED: "She has not arrived yet.",
    ARRIVED: "The short move is already complete; do not repeat the arrival.",
  },
};

const COMPLETED_EVENT_LABEL: Record<string, string> = {
  ENTER_CAFE: "entering the cafe",
  FIND_KEY: "taking the key from the bag",
  UNLOCK_DOOR: "unlocking the door",
  OPEN_DOOR: "opening the door",
  CROSS_THRESHOLD: "crossing the threshold",
  SEE_OPEN_SEAT: "seeing the open chair",
  ROUTE_CHANGE: "turning into the aisle",
  APPROACH_CHAIR: "approaching the chair",
  TAKE_SEAT: "sitting in the chair",
  WINDOW_STOP: "stopping at the shop window",
  ENTER_STORE: "entering the store",
  CLEAR_SURFACE: "clearing the uneven surface",
  WAIT_FOR_PASSAGE: "waiting for the passage to clear",
  WAIT_OUTSIDE: "the short wait outside",
  CHANGE_GRIP: "moving the bag to the other hand",
  ADJUST_SLEEVE: "adjusting the sleeve",
  ADJUST_LAYER: "adjusting the outer layer",
  NOTICE_REFLECTION: "noticing the reflection",
  CHOOSE_ROUTE: "choosing the clearer route",
  PUT_OBJECT_DOWN: "putting the small object down",
  ARRIVE: "arriving",
  OPEN_AND_EXIT: "opening the door and stepping outside",
};

export function modelFacingFact(key: string, value: string): string | null {
  return MODEL_FACING_STATE_FACTS[key]?.[value] ?? null;
}

export function modelFacingCompletedEvent(id: string): string {
  const action = COMPLETED_EVENT_LABEL[id] ?? id.toLowerCase().replace(/_/g, " ");
  return `The earlier action of ${action} is complete; do not perform it again.`;
}

// The structured state, in the order a human reads it: who, where, what is held,
// what has already finished. Every finished sentence carries its own protection
// so no layer has to re-explain the same state with different wording.
export function modelFacingStateSentences(snapshot: WorldSnapshot | null | undefined): string[] {
  if (!snapshot) return [];
  const sentences: string[] = [];
  for (const [key, value] of Object.entries(snapshot.facts ?? {})) {
    const sentence = modelFacingFact(key, value);
    if (sentence) sentences.push(sentence);
  }
  for (const completed of snapshot.completedEvents ?? []) sentences.push(modelFacingCompletedEvent(completed));
  return sentences;
}
