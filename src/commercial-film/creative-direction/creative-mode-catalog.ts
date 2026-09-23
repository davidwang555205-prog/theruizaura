import type {
  CommercialAudienceDesireId,
  CommercialHumanSituationId,
  CommercialRevealStrategy,
} from "../creative-spine/types";
import type {
  CommercialCameraBehavior,
  CommercialCreativeMode,
  CommercialEditLogic,
  CommercialVisualMotif,
} from "./types";

export type CommercialCreativeModeDefinition = {
  id: CommercialCreativeMode;
  label: string;
  description: string;
  directingPrinciple: string;
  compatibleSituations: CommercialHumanSituationId[];
  compatibleDesires: CommercialAudienceDesireId[];
  compatibleReveals: CommercialRevealStrategy[];
  cameraAffinity: CommercialCameraBehavior[];
  editAffinity: CommercialEditLogic[];
  motifAffinity: CommercialVisualMotif[];
};

export const COMMERCIAL_CREATIVE_MODE_CATALOG: Record<
  CommercialCreativeMode,
  CommercialCreativeModeDefinition
> = {
  PRIVATE_MOMENT: {
    id: "PRIVATE_MOMENT",
    label: "Private Moment",
    description: "Observe an unperformed private moment as if the camera already existed in the room.",
    directingPrinciple:
      "Use restrained observation, partial framing, and ordinary actions. The person does not perform for the lens.",
    compatibleSituations: [
      "LEAVING_HOME",
      "PREPARING_FOR_DAY",
      "TAKING_A_SHORT_PAUSE",
      "RETURNING_HOME",
      "TRANSITIONING_WORK_TO_PERSONAL",
    ],
    compatibleDesires: [
      "QUIET_REFINEMENT",
      "SELF_POSSESSION",
      "EFFORTLESSNESS",
      "UNFORCED_STYLE",
      "EVERYDAY_EASE",
    ],
    compatibleReveals: ["DELAYED", "PROGRESSIVE"],
    cameraAffinity: ["OBSERVE", "WAIT", "WITHHOLD", "DISCOVER", "GROUND_OBSERVATION"],
    editAffinity: ["DELAYED_REVEAL", "ACTION_CUT"],
    motifAffinity: ["SHADOW", "LIGHT", "THRESHOLD"],
  },
  CITY_JOURNEY: {
    id: "CITY_JOURNEY",
    label: "City Journey",
    description: "Use believable movement through adjacent urban spaces as the film's continuity.",
    directingPrinciple:
      "Treat the product as the stable visual element linking real places. Geography must remain credible.",
    compatibleSituations: [
      "MOVING_BETWEEN_PLACES",
      "ARRIVING_SOMEWHERE",
      "MEETING_SOMEONE",
      "WALKING_WITHOUT_URGENCY",
      "TRANSITIONING_WORK_TO_PERSONAL",
    ],
    compatibleDesires: [
      "CONFIDENCE",
      "BELONGING",
      "EVERYDAY_EASE",
      "LIGHTNESS",
      "VERSATILITY",
    ],
    compatibleReveals: ["PROGRESSIVE", "IMMEDIATE"],
    cameraAffinity: ["FOLLOW", "PASS_BY", "WAIT", "OBSERVE", "DISCOVER", "REVEAL"],
    editAffinity: ["MATCH_MOVEMENT", "ACTION_CUT"],
    motifAffinity: ["THRESHOLD", "LINE", "REFLECTION"],
  },
  EVERYDAY_MOVEMENT: {
    id: "EVERYDAY_MOVEMENT",
    label: "Everyday Movement",
    description: "Derive visual interest from ordinary body mechanics rather than athletic performance.",
    directingPrinciple:
      "Plan from sitting, standing, turning, stepping, and crossing thresholds. Camera follows the mechanics of the action.",
    compatibleSituations: [
      "LEAVING_HOME",
      "PREPARING_FOR_DAY",
      "MOVING_BETWEEN_PLACES",
      "RETURNING_HOME",
      "WAITING",
    ],
    compatibleDesires: [
      "EFFORTLESSNESS",
      "LIGHTNESS",
      "EVERYDAY_EASE",
      "COMFORT",
      "UNFORCED_STYLE",
    ],
    compatibleReveals: ["IMMEDIATE", "PROGRESSIVE"],
    cameraAffinity: ["OBSERVE", "FOLLOW", "PASS_BY", "GROUND_OBSERVATION", "DISCOVER"],
    editAffinity: ["ACTION_CUT", "MATCH_MOVEMENT"],
    motifAffinity: ["LINE", "REPETITION", "THRESHOLD"],
  },
  STATE_TRANSITION: {
    id: "STATE_TRANSITION",
    label: "State Transition",
    description: "Track a clear change from one human state to another during the fifteen seconds.",
    directingPrinciple:
      "Private to public, waiting to moving, or arrival to settling. The product participates naturally in the change.",
    compatibleSituations: [
      "LEAVING_HOME",
      "ARRIVING_SOMEWHERE",
      "RETURNING_HOME",
      "WAITING",
      "TRANSITIONING_WORK_TO_PERSONAL",
    ],
    compatibleDesires: [
      "SELF_POSSESSION",
      "CONFIDENCE",
      "BELONGING",
      "QUIET_REFINEMENT",
      "VERSATILITY",
    ],
    compatibleReveals: ["PROGRESSIVE", "DELAYED", "IMMEDIATE"],
    cameraAffinity: ["OBSERVE", "WAIT", "FOLLOW", "DISCOVER", "REVEAL"],
    editAffinity: ["ACTION_CUT", "MATCH_MOVEMENT", "DELAYED_REVEAL"],
    motifAffinity: ["THRESHOLD", "LIGHT", "SHADOW"],
  },
  SENSORY_LIFE: {
    id: "SENSORY_LIFE",
    label: "Sensory Life",
    description: "Build a lived atmosphere from sensory fragments that belong to the same situation.",
    directingPrinciple:
      "Use light, fabric, door movement, hand contact, reflection, and foot-ground contact only when they deepen the same world.",
    compatibleSituations: [
      "TAKING_A_SHORT_PAUSE",
      "RETURNING_HOME",
      "PREPARING_FOR_DAY",
      "WAITING",
      "TRANSITIONING_WORK_TO_PERSONAL",
    ],
    compatibleDesires: [
      "QUIET_REFINEMENT",
      "COMFORT",
      "BELONGING",
      "LIGHTNESS",
      "EVERYDAY_EASE",
    ],
    compatibleReveals: ["DELAYED", "PROGRESSIVE", "IMMEDIATE"],
    cameraAffinity: ["OBSERVE", "DETAIL_INTERRUPTION", "GROUND_OBSERVATION", "WAIT", "DISCOVER"],
    editAffinity: ["SENSORY_INSERT", "ACTION_CUT"],
    motifAffinity: ["LIGHT", "SHADOW", "REFLECTION", "LINE"],
  },
  SINGLE_IDEA: {
    id: "SINGLE_IDEA",
    label: "Single Idea",
    description: "Organize the whole film around one simple visual or behavioral idea.",
    directingPrinciple:
      "Use one recurring frame geometry, movement, threshold, light change, or stable product continuity without symbolic overreach.",
    compatibleSituations: [
      "MOVING_BETWEEN_PLACES",
      "PREPARING_FOR_DAY",
      "RETURNING_HOME",
      "WALKING_WITHOUT_URGENCY",
      "TRANSITIONING_WORK_TO_PERSONAL",
    ],
    compatibleDesires: [
      "VERSATILITY",
      "LIGHTNESS",
      "CONFIDENCE",
      "EFFORTLESSNESS",
      "BELONGING",
    ],
    compatibleReveals: ["PROGRESSIVE", "IMMEDIATE", "DELAYED"],
    cameraAffinity: ["WAIT", "OBSERVE", "PASS_BY", "FOLLOW", "DISCOVER", "REVEAL"],
    editAffinity: ["MATCH_MOVEMENT", "DELAYED_REVEAL", "ACTION_CUT"],
    motifAffinity: ["REPETITION", "LINE", "THRESHOLD", "LIGHT"],
  },
};

export const COMMERCIAL_CAMERA_BEHAVIORS: CommercialCameraBehavior[] = [
  "OBSERVE",
  "FOLLOW",
  "WAIT",
  "DISCOVER",
  "PASS_BY",
  "GROUND_OBSERVATION",
  "DETAIL_INTERRUPTION",
  "WITHHOLD",
  "REVEAL",
];

export const COMMERCIAL_EDIT_LOGICS: CommercialEditLogic[] = [
  "ACTION_CUT",
  "MATCH_MOVEMENT",
  "SENSORY_INSERT",
  "DELAYED_REVEAL",
];

export const COMMERCIAL_VISUAL_MOTIFS: CommercialVisualMotif[] = [
  "THRESHOLD",
  "LIGHT",
  "REFLECTION",
  "SHADOW",
  "LINE",
  "REPETITION",
];
