import type { ProductCoverage } from "../../visual-system/taskReferenceBinding";
import type { CommercialIntentId } from "../types";
import type {
  CommercialAudienceDesire,
  CommercialAudienceDesireId,
  CommercialHumanSituation,
  CommercialHumanSituationId,
  CommercialRevealStrategy,
} from "./types";

export type CommercialIntentCreativeProfile = {
  intent: CommercialIntentId;
  situationId: CommercialHumanSituationId;
  desirePriority: CommercialAudienceDesireId[];
  defaultReveal: CommercialRevealStrategy;
  expressionLine: string;
  releaseLine: string;
};

export const COMMERCIAL_HUMAN_SITUATIONS: Record<CommercialHumanSituationId, CommercialHumanSituation> = {
  LEAVING_HOME: {
    id: "LEAVING_HOME",
    label: "Leaving Home",
    description: "A private preparation moment becomes the first step into the day.",
    situationLine: "moves from a private dressing moment into the first ordinary step outside",
    resourceHints: {
      sceneWorldId: "COMMERCIAL_DAILY_STYLING",
      actionFamilies: ["standing", "garment-task", "walking"],
    },
  },
  ARRIVING_SOMEWHERE: {
    id: "ARRIVING_SOMEWHERE",
    label: "Arriving Somewhere",
    description: "A familiar destination becomes the context in which the product reads.",
    situationLine: "arrives at a familiar city destination and settles into the moment",
    resourceHints: {
      sceneWorldId: "COMMERCIAL_NEW_ARRIVAL",
      actionFamilies: ["walking", "transition", "environment-response"],
    },
  },
  MOVING_BETWEEN_PLACES: {
    id: "MOVING_BETWEEN_PLACES",
    label: "Moving Between Places",
    description: "Ordinary movement links one real urban point to another.",
    situationLine: "moves through adjacent city spaces without interrupting the rhythm of the day",
    resourceHints: {
      sceneWorldId: "COMMERCIAL_URBAN_MOTION",
      actionFamilies: ["walking", "transition", "turning"],
    },
  },
  PREPARING_FOR_DAY: {
    id: "PREPARING_FOR_DAY",
    label: "Preparing For The Day",
    description: "The outfit, material details, and final choices belong to a real preparation process.",
    situationLine: "finishes preparing for the day and checks the last details of the look",
    resourceHints: {
      sceneWorldId: "COMMERCIAL_PRODUCT_CRAFT",
      actionFamilies: ["standing", "garment-task", "on-foot"],
    },
  },
  TAKING_A_SHORT_PAUSE: {
    id: "TAKING_A_SHORT_PAUSE",
    label: "Taking A Short Pause",
    description: "A quiet interval allows the product to be noticed without becoming a display task.",
    situationLine: "takes a brief pause inside a calm private space",
    resourceHints: {
      sceneWorldId: "COMMERCIAL_QUIET_LUXURY",
      actionFamilies: ["standing", "environment-response", "seated"],
    },
  },
  RETURNING_HOME: {
    id: "RETURNING_HOME",
    label: "Returning Home",
    description: "The transition from outside to private space resolves the day.",
    situationLine: "returns toward a private space after an ordinary day",
    resourceHints: {
      sceneWorldId: "COMMERCIAL_QUIET_LUXURY",
      actionFamilies: ["walking", "transition", "standing"],
    },
  },
  WAITING: {
    id: "WAITING",
    label: "Waiting",
    description: "A restrained pause gives the commercial room to observe rather than perform.",
    situationLine: "waits briefly in a real urban or interior space",
    resourceHints: {
      sceneWorldId: "COMMERCIAL_URBAN_MOTION",
      actionFamilies: ["standing", "transition", "environment-response"],
    },
  },
  MEETING_SOMEONE: {
    id: "MEETING_SOMEONE",
    label: "Meeting Someone",
    description: "A social arrival provides human context without introducing a second actor.",
    situationLine: "moves toward a quiet meeting point without making the meeting the story",
    resourceHints: {
      sceneWorldId: "COMMERCIAL_NEW_ARRIVAL",
      actionFamilies: ["walking", "transition", "standing"],
    },
  },
  WALKING_WITHOUT_URGENCY: {
    id: "WALKING_WITHOUT_URGENCY",
    label: "Walking Without Urgency",
    description: "The daily route carries the film without turning walking into a product demonstration.",
    situationLine: "walks through an everyday route without urgency",
    resourceHints: {
      sceneWorldId: "COMMERCIAL_URBAN_MOTION",
      actionFamilies: ["walking", "transition", "turning"],
    },
  },
  TRANSITIONING_WORK_TO_PERSONAL: {
    id: "TRANSITIONING_WORK_TO_PERSONAL",
    label: "Work To Personal",
    description: "The same outfit moves from public composure toward private ease.",
    situationLine: "moves from the structure of the workday toward a more private tempo",
    resourceHints: {
      sceneWorldId: "COMMERCIAL_QUIET_LUXURY",
      actionFamilies: ["walking", "standing", "garment-task"],
    },
  },
};

export const COMMERCIAL_AUDIENCE_DESIRES: Record<CommercialAudienceDesireId, CommercialAudienceDesire> = {
  EFFORTLESSNESS: {
    id: "EFFORTLESSNESS",
    label: "Effortlessness",
    description: "The styling should feel resolved without visible effort.",
    viewerOutcomeLine: "the look feels complete without demanding attention",
  },
  CONFIDENCE: {
    id: "CONFIDENCE",
    label: "Confidence",
    description: "The person's composure comes from the situation, not from performance.",
    viewerOutcomeLine: "the person moves with quiet confidence inside the real moment",
  },
  COMFORT: {
    id: "COMFORT",
    label: "Comfort",
    description: "Only natural ease and physical credibility are shown; no unsupported performance claim is made.",
    viewerOutcomeLine: "the movement looks physically at ease without inventing a product performance claim",
  },
  VERSATILITY: {
    id: "VERSATILITY",
    label: "Versatility",
    description: "The product belongs to more than one ordinary moment inside the same day.",
    viewerOutcomeLine: "the same styling continues naturally from one daily moment into the next",
  },
  QUIET_REFINEMENT: {
    id: "QUIET_REFINEMENT",
    label: "Quiet Refinement",
    description: "The product is understood through restraint, material clarity, and proportion.",
    viewerOutcomeLine: "the details read as refined because nothing is over-explained",
  },
  EVERYDAY_EASE: {
    id: "EVERYDAY_EASE",
    label: "Everyday Ease",
    description: "The commercial belongs to an ordinary day rather than a special event.",
    viewerOutcomeLine: "the product fits the ordinary rhythm of the day",
  },
  SELF_POSSESSION: {
    id: "SELF_POSSESSION",
    label: "Self Possession",
    description: "The person remains self-directed while the camera observes.",
    viewerOutcomeLine: "the person stays self-directed and unperformed",
  },
  LIGHTNESS: {
    id: "LIGHTNESS",
    label: "Lightness",
    description: "The visual rhythm feels open and mobile without making a performance claim.",
    viewerOutcomeLine: "the movement stays open and unhurried",
  },
  BELONGING: {
    id: "BELONGING",
    label: "Belonging",
    description: "The product and styling feel native to the selected world.",
    viewerOutcomeLine: "the product belongs naturally to the place and outfit",
  },
  UNFORCED_STYLE: {
    id: "UNFORCED_STYLE",
    label: "Unforced Style",
    description: "The styling is considered but never posed or announced.",
    viewerOutcomeLine: "the styling feels considered without becoming a fashion performance",
  },
};

export const COMMERCIAL_INTENT_CREATIVE_PROFILES: Record<CommercialIntentId, CommercialIntentCreativeProfile> = {
  URBAN_MOTION: {
    intent: "URBAN_MOTION",
    situationId: "MOVING_BETWEEN_PLACES",
    desirePriority: ["CONFIDENCE", "EVERYDAY_EASE", "LIGHTNESS", "SELF_POSSESSION"],
    defaultReveal: "PROGRESSIVE",
    expressionLine: "A continuous city movement should make the product feel capable of joining the day without slowing it down.",
    releaseLine: "The final beat should feel like the route continues after the camera lets go.",
  },
  DAILY_STYLING: {
    intent: "DAILY_STYLING",
    situationId: "LEAVING_HOME",
    desirePriority: ["EFFORTLESSNESS", "UNFORCED_STYLE", "EVERYDAY_EASE", "VERSATILITY"],
    defaultReveal: "IMMEDIATE",
    expressionLine: "The product should feel resolved within the whole outfit before the person steps into the day.",
    releaseLine: "The final beat should feel like the outfit and product are already part of the person's routine.",
  },
  QUIET_LUXURY: {
    intent: "QUIET_LUXURY",
    situationId: "TAKING_A_SHORT_PAUSE",
    desirePriority: ["QUIET_REFINEMENT", "SELF_POSSESSION", "BELONGING", "UNFORCED_STYLE"],
    defaultReveal: "DELAYED",
    expressionLine: "The film should let the material and proportion become meaningful through a private, restrained moment.",
    releaseLine: "The ending should leave a quiet material aftertaste rather than a final product statement.",
  },
  PRODUCT_CRAFT: {
    intent: "PRODUCT_CRAFT",
    situationId: "PREPARING_FOR_DAY",
    desirePriority: ["QUIET_REFINEMENT", "CONFIDENCE", "EFFORTLESSNESS", "BELONGING"],
    defaultReveal: "PROGRESSIVE",
    expressionLine: "The product's visible material and structural relationships should become clearer through natural use.",
    releaseLine: "The ending should return the observed detail to the person's complete look and day.",
  },
  NEW_ARRIVAL: {
    intent: "NEW_ARRIVAL",
    situationId: "ARRIVING_SOMEWHERE",
    desirePriority: ["BELONGING", "CONFIDENCE", "VERSATILITY", "EFFORTLESSNESS"],
    defaultReveal: "IMMEDIATE",
    expressionLine: "The new product should enter a familiar life immediately and feel already at home there.",
    releaseLine: "The ending should show the product becoming part of the place rather than being announced.",
  },
};

export const COMMERCIAL_PRODUCT_MEANING_LINES: Record<ProductCoverage, {
  meaning: string;
  roleLine: string;
}> = {
  silhouette: {
    meaning: "the silhouette carries the styling without interrupting the person's movement",
    roleLine: "the product provides a stable visual line inside the complete outfit",
  },
  toe_structure: {
    meaning: "the front profile becomes recognizable through ordinary use",
    roleLine: "the product's visible front structure anchors one quiet moment of recognition",
  },
  side_panel_structure: {
    meaning: "the structural relationships become part of the product's visual identity",
    roleLine: "the product is understood through the confirmed structure rather than through exaggeration",
  },
  heel_structure: {
    meaning: "the rear profile completes the product's visual coherence",
    roleLine: "the product's confirmed heel relationship contributes to the overall balance",
  },
  outsole_profile: {
    meaning: "the ground relationship gives the product a believable physical presence",
    roleLine: "the product remains visibly connected to the floor or pavement in natural movement",
  },
  color_blocking: {
    meaning: "the confirmed color relationship helps the product belong to the styling",
    roleLine: "the product's visible color relationships support the unity of the look",
  },
  material_evidence: {
    meaning: "the visible material relationships become meaningful through proximity, movement, and light",
    roleLine: "the product earns attention through confirmed material detail rather than a display pose",
  },
};

export function resolveCommercialCreativeProfile(intent: CommercialIntentId) {
  return COMMERCIAL_INTENT_CREATIVE_PROFILES[intent];
}
