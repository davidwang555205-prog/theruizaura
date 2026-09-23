import {
  personActionLibrary,
  type PersonActionDefinition,
} from "../data/personActionLibrary";
import type {
  CommercialActionPlanItem,
  CommercialIntentId,
  CommercialShotRole,
} from "./types";
import type { CommercialEventSpinePlan } from "./event-spine";

const COMMERCIAL_ACTION_PROHIBITIONS = [
  "no foot modeling pose",
  "no toe pointing",
  "no shoe presentation stance",
  "no runway pose",
  "no repeated shoe-display gesture",
  "no impossible gait",
  "no shoe detached from the real wearing relationship",
];

function requireExistingAction(family: string, offset: number): PersonActionDefinition {
  const candidates = personActionLibrary.filter((action) => action.diversityFamily === family);
  const action = candidates[offset % candidates.length];
  if (!action) {
    throw new Error(`Commercial Action Registry cannot resolve existing ${family} action.`);
  }
  return action;
}

function existingActionPlanItem(input: {
  shotIndex: number;
  shotRole: CommercialShotRole;
  action: PersonActionDefinition;
  physicalActionLine: string;
  constraints: string[];
}): CommercialActionPlanItem {
  return {
    shotIndex: input.shotIndex,
    shotRole: input.shotRole,
    primitiveId: `commercial::${input.shotRole.toLowerCase()}::${input.action.id}`,
    source: "EXISTING_318",
    sourceActionId: input.action.id,
    sourceActionFamily: input.action.diversityFamily,
    movementPhase: input.action.movementPhase,
    physicalActionLine: input.physicalActionLine,
    physicalConstraints: input.constraints,
    prohibitedBehaviors: COMMERCIAL_ACTION_PROHIBITIONS,
  };
}

function commercialOnlyPlanItem(input: {
  shotIndex: number;
  shotRole: CommercialShotRole;
  primitiveId: string;
  physicalActionLine: string;
  constraints: string[];
}): CommercialActionPlanItem {
  return {
    shotIndex: input.shotIndex,
    shotRole: input.shotRole,
    primitiveId: input.primitiveId,
    source: "COMMERCIAL_ONLY",
    sourceActionId: null,
    sourceActionFamily: null,
    movementPhase: input.shotRole === "DETAIL" ? "moving" : "settling",
    physicalActionLine: input.physicalActionLine,
    physicalConstraints: input.constraints,
    prohibitedBehaviors: COMMERCIAL_ACTION_PROHIBITIONS,
  };
}

export function buildCommercialActionPlan(
  intent: CommercialIntentId,
  eventSpine?: CommercialEventSpinePlan
): CommercialActionPlanItem[] {
  const intentOffset = [
    "URBAN_MOTION",
    "DAILY_STYLING",
    "QUIET_LUXURY",
    "PRODUCT_CRAFT",
    "NEW_ARRIVAL",
  ].indexOf(intent);
  const eventShots = eventSpine?.shots;
  const worldFamily = eventShots?.[0]?.actionClass ?? "walking";
  const wearFamily = eventShots?.[1]?.actionClass ?? "walking";
  const releaseFamily = eventShots?.[4]?.actionClass ?? "walking";
  const worldAction = requireExistingAction(worldFamily, intentOffset);
  const wearAction = requireExistingAction(wearFamily, 10 + intentOffset);
  const releaseAction = requireExistingAction(releaseFamily, 20 + intentOffset);

  return [
    existingActionPlanItem({
      shotIndex: 0,
      shotRole: "WORLD",
      action: worldAction,
      physicalActionLine: eventShots?.[0]
        ? `${eventShots[0].whatHappens} ${eventShots[0].whyItHappens}`
        : "The person takes one short, ordinary step through the selected location, with an unhurried pace and a stable toe direction.",
      constraints: [
        "short natural stride",
        "both feet remain anatomically connected to the body",
        "ground contact stays believable",
        "the action is observed, not performed for the camera",
      ],
    }),
    existingActionPlanItem({
      shotIndex: 1,
      shotRole: "WEAR",
      action: wearAction,
      physicalActionLine: eventShots?.[1]
        ? `${eventShots[1].whatHappens} ${eventShots[1].whyItHappens}`
        : "The person continues the same ordinary walking action while the worn product becomes clearly readable at natural scale.",
      constraints: [
        "same person and same walking rhythm",
        "trouser hem does not cover the product",
        "at least one shoe remains readable toe-to-heel",
        "the camera does not rewrite the step",
      ],
    }),
    commercialOnlyPlanItem({
      shotIndex: 2,
      shotRole: "DETAIL",
      primitiveId: `commercial::detail::${eventShots?.[2]?.eventKind.toLowerCase() ?? "natural-transition"}`,
      physicalActionLine: eventShots?.[2]
        ? `${eventShots[2].whatHappens} ${eventShots[2].whyItHappens}`
        : "The walking transition continues naturally. No new body behavior is introduced for the detail shot.",
      constraints: [
        "the detail remains inside the real wearing relationship",
        "the ankle and ground remain visible",
        "no foot pose or shoe lifting for display",
        "no camera-caused deformation or exaggerated scale",
      ],
    }),
    commercialOnlyPlanItem({
      shotIndex: 3,
      shotRole: "HERO",
      primitiveId: `commercial::hero::${eventShots?.[3]?.eventKind.toLowerCase() ?? "natural-weight-settle"}`,
      physicalActionLine: eventShots?.[3]
        ? `${eventShots[3].whatHappens} ${eventShots[3].whyItHappens}`
        : "The person briefly stops because of the route or moment, lets the body weight settle naturally, and remains aware of the surrounding life.",
      constraints: [
        "both feet remain grounded",
        "one leg carries slightly more weight without posing",
        "the shoulders relax after the stop",
        "the product stays worn and is never isolated on a white background",
      ],
    }),
    existingActionPlanItem({
      shotIndex: 4,
      shotRole: "RELEASE",
      action: releaseAction,
      physicalActionLine: eventShots?.[4]
        ? `${eventShots[4].whatHappens} ${eventShots[4].whyItHappens}`
        : "The person resumes an ordinary step and continues away from the brief pause.",
      constraints: [
        "movement continues at real-world speed",
        "the camera releases rather than chasing the foot",
        "no product close-up is added at the end",
        "no new event is introduced",
      ],
    }),
  ];
}

export function auditCommercialActionSource() {
  const plan = buildCommercialActionPlan("URBAN_MOTION");
  const reused = plan.filter((item) => item.source === "EXISTING_318");
  const commercialOnly = plan.filter((item) => item.source === "COMMERCIAL_ONLY");
  return {
    existingActionLibraryCount: personActionLibrary.length,
    reusedExistingActions: reused.length,
    commercialOnlyPrimitives: commercialOnly.length,
    sourceActionIds: reused.map((item) => item.sourceActionId),
  };
}
