// FINAL-STATE NATURAL CONTINUATION.
// The final narrative state is authority and never changes. What changes is how
// the body is allowed to remain alive inside that state: the state is locked:
// the body is not. This helper is a renderer input only; it reads structured motion
// and never writes, extends, or re-times a single-use action.
export type FinalPerformanceClass =
  | "RESIDUAL_TRAVEL_DECAY"
  | "RESIDUAL_TRAVEL_CONTINUES"
  | "STANDING_POSTURE"
  | "SEATED_POSTURE"
  | "ESTABLISHED_WAIT"
  | "UNKNOWN";

export type FinalPerformanceBehavior = {
  motionClass: FinalPerformanceClass;
  finalMotion: string | null;
  previousMotion: string | null;
  allowsDeeperTravel: boolean;
  allowsOffCenterDrift: boolean;
  /** Final Performance Behavior sentences. They describe residual body life only. */
  lines: string[];
  /** One compact clause a Moment body line can carry. */
  marker: string;
  /** The final Take keeps its own camera state; nothing recentres for the ending. */
  cameraLine: string;
  /** Residual motion may never become a second narrative beat. */
  prohibitionLine: string;
};

export const STATE_LOCK_NOT_BODY_FREEZE =
  "State lock is not body freeze: the narrative state stays exactly where the last action left it, while ordinary residual body motion continues naturally inside it.";

const TRAVELLING = ["WALKING", "SLOWING"];
const AT_REST = ["STOPPED", "SETTLED"];

// Places that sit outside the destination a topic ends in. Shared with the final
// consistency validator so both read one vocabulary.
export const FINAL_EXTERIOR_PLACES = [
  "HALLWAY",
  "THRESHOLD",
  "OUTSIDE",
  "PATH",
  "STREET",
  "COMMUNITY_PATH",
  "ROUTE",
  "WINDOW",
  "ENTRANCE",
  "CAFE_ENTRY",
];

const PROHIBITION_LINE =
  "Residual motion may not become a second narrative beat: no new destination or room, no new task, no new object interaction, no doorway or key action again, no sit-down that is not already part of the approved final event, no turn back, no look to camera, no posed product, and no performed emotion.";

const CAMERA_LINE =
  "The final Take keeps its approved camera state: it does not recenter, recover the full body or the face, recover the product, or recompose a portrait for the ending, and it does not follow the residual motion.";

export function finalPerformanceClassOf(input: {
  previousMotion: string | null;
  finalMotion: string | null;
  previousPlace?: string | null;
  finalPlace?: string | null;
}): FinalPerformanceClass {
  const travelBefore = TRAVELLING.includes(input.previousMotion ?? "");
  const travelAfter = TRAVELLING.includes(input.finalMotion ?? "");
  // Entering the reached destination is travel even when the previous structured
  // motion fact was a pause at the threshold.
  const entersFinalSpace = Boolean(input.finalPlace)
    && FINAL_EXTERIOR_PLACES.includes(input.previousPlace ?? "")
    && !FINAL_EXTERIOR_PLACES.includes(input.finalPlace ?? "");
  if (input.finalMotion === "SEATED") return "SEATED_POSTURE";
  if (input.finalMotion === "WAITING") return "ESTABLISHED_WAIT";
  if (travelAfter) return "RESIDUAL_TRAVEL_CONTINUES";
  if (travelBefore && AT_REST.includes(input.finalMotion ?? "")) return "RESIDUAL_TRAVEL_DECAY";
  if (travelBefore) return "RESIDUAL_TRAVEL_DECAY";
  if (entersFinalSpace) return "RESIDUAL_TRAVEL_DECAY";
  if (AT_REST.includes(input.finalMotion ?? "")) return "STANDING_POSTURE";
  return "UNKNOWN";
}

const BEHAVIOR: Record<FinalPerformanceClass, { lines: string[]; marker: string }> = {
  // She was still walking when the final state arrived: the movement has to decay
  // honestly instead of snapping into a pose.
  RESIDUAL_TRAVEL_DECAY: {
    lines: [
      "Her walking momentum decays honestly: one or two residual ordinary steps, then the weight settles through the feet.",
      "She may continue slightly deeper into the space she has already reached, and she does not have to hold the optical center or a full frontal stance; her apparent size and position may change naturally.",
      "The arm swing decays, the garment movement settles, and the last footfall lands without any held pose.",
    ],
    marker: "Her walking momentum is already decaying naturally into residual ordinary steps and a settling weight shift; the body stays alive inside the reached position and is never held as a pose.",
  },
  // The approved action itself is travelling (a walk, a route, a continuous move).
  RESIDUAL_TRAVEL_CONTINUES: {
    lines: [
      "The ordinary walking cadence continues at its real pace; the ending does not make her stop, and it does not make her walk further than the approved action.",
      "She may drift off the optical center, change apparent size, or leave part of the frame through her own movement; none of that is corrected.",
      "The natural step rhythm and the ordinary arm swing continue without a held pose.",
    ],
    marker: "The ordinary walking cadence continues naturally; the ending does not require a stop, a hold, or the optical center.",
  },
  // She was already standing: only ordinary postural life remains.
  STANDING_POSTURE: {
    lines: [
      "Small weight redistribution, residual arm and hand settling, and ordinary head and gaze drift continue inside the position she has already reached.",
      "She may drift slightly off the optical center or partially out of the frame; the body stays alive without starting anything.",
      "No held stance and no presentation posture: the standing body keeps its ordinary micro-motion.",
    ],
    marker: "Small weight redistribution and residual hand settling continue; the standing body stays alive without starting anything new.",
  },
  SEATED_POSTURE: {
    lines: [
      "The seated posture settles naturally: minor weight adjustment, the hand placement coming to a neutral rest, and ordinary head and gaze drift.",
      "No second sit-down, no pose, and no new object use; the chair and the body keep ordinary micro-motion.",
    ],
    marker: "The seated posture continues settling with minor weight adjustment and ordinary gaze drift; no second sit-down begins.",
  },
  ESTABLISHED_WAIT: {
    lines: [
      "The established wait stays alive: ordinary weight shifts, residual hand movement, and gaze continuing in the same direction.",
      "Nothing new is picked up, checked, answered, or started; the wait simply continues at its own pace.",
    ],
    marker: "The established wait stays alive with ordinary weight shifts and residual hand movement; nothing new is started.",
  },
  // Motion state unavailable: allow only the safest postural continuation.
  UNKNOWN: {
    lines: [
      "Ordinary residual body movement and posture settling continue inside the reached position.",
      "The body stays alive without starting anything new.",
    ],
    marker: "Ordinary residual body movement continues; the body stays alive without starting anything new.",
  },
};

export function buildFinalPerformanceBehavior(input: {
  previousMotion: string | null;
  finalMotion: string | null;
  previousPlace?: string | null;
  finalPlace?: string | null;
  interiorFinal?: boolean;
}): FinalPerformanceBehavior {
  const motionClass = finalPerformanceClassOf(input);
  const behaviour = BEHAVIOR[motionClass];
  const travelling = motionClass === "RESIDUAL_TRAVEL_DECAY" || motionClass === "RESIDUAL_TRAVEL_CONTINUES";
  return {
    motionClass,
    finalMotion: input.finalMotion,
    previousMotion: input.previousMotion,
    allowsDeeperTravel: travelling && Boolean(input.interiorFinal),
    allowsOffCenterDrift: travelling || motionClass === "STANDING_POSTURE",
    lines: [...behaviour.lines],
    marker: behaviour.marker,
    cameraLine: CAMERA_LINE,
    prohibitionLine: PROHIBITION_LINE,
  };
}
