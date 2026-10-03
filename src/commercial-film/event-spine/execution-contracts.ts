import type { CommercialIntentId } from "../types";
import type {
  CommercialEventStateContract,
  CommercialProhibitedTransition,
  CommercialRequiredVisibleEvidence,
  CommercialSingleUseAction,
  CommercialStateEffect,
  CommercialStateRequirement,
  CommercialWorldEntity,
  CommercialWorldModel,
} from "./world-state";
import { COMMERCIAL_WORLD_STATE_SCHEMA_VERSION } from "./world-state";
import type {
  CommercialActionContinuity,
  CommercialEventCameraState,
  CommercialTakeBoundary,
  CommercialTakeBoundaryEvidence,
  CommercialTakeBoundaryMotivation,
} from "./takes";

/**
 * Structured execution state for every Commercial Event Spine event.
 * The narrative catalog stays the authoritative creative text; this table only
 * declares what each beat requires, changes, proves on screen, and forbids.
 * Rules are generic state / transition rules and contain no per-topic casework.
 */

export type CommercialEventExecutionContract = {
  cameraState: CommercialEventCameraState;
  actionContinuity: CommercialActionContinuity;
  actionSequenceId: string;
  actionRequiresFreshSetup: boolean;
  takeBoundary: CommercialTakeBoundary | null;
  timeGapSeconds: number;
  stateContract: CommercialEventStateContract;
};

export type CommercialIntentExecutionContract = {
  worldModel: CommercialWorldModel;
  events: Record<string, CommercialEventExecutionContract>;
};

const CHARACTER = "character";
const HOME_THRESHOLD = "home_threshold";
const DESTINATION_THRESHOLD = "destination_threshold";
const OUTFIT = "outfit";
const GROUND = "ground";
const PREPARATION_SURFACE = "preparation_surface";
const WINDOW_LIGHT = "window_light";

function characterEntity(input: { space: string; anchor: string }): CommercialWorldEntity {
  return {
    id: CHARACTER,
    kind: "CHARACTER",
    label: "the character",
    initialAttributes: { space: input.space, anchor: input.anchor },
    continuityLockAttributes: ["space"],
    containment: null,
  };
}

function worldModel(entities: CommercialWorldEntity[]): CommercialWorldModel {
  return {
    schemaVersion: COMMERCIAL_WORLD_STATE_SCHEMA_VERSION,
    entities,
  };
}

function required(entityId: string, attribute: string, value: string, reason: string): CommercialStateRequirement {
  return { entityId, attribute, value, reason };
}

function holdsCharacterSpace(space: string, anchor: string): CommercialStateRequirement[] {
  return [
    required(CHARACTER, "space", space, "The character keeps the same spatial situation inside this beat."),
    required(CHARACTER, "anchor", anchor, "The character keeps the same spatial zone inside this beat."),
  ];
}

function actionChange(input: {
  entityId: string;
  attribute: string;
  from: string;
  to: string;
  actionId: string;
  actionLabel: string;
  reason: string;
}): CommercialStateEffect {
  return {
    entityId: input.entityId,
    attribute: input.attribute,
    fromValue: input.from,
    toValue: input.to,
    cause: "ACTION",
    actionId: input.actionId,
    actionLabel: input.actionLabel,
    reason: input.reason,
  };
}

function environmentChange(input: {
  entityId: string;
  attribute: string;
  from: string;
  to: string;
  reason: string;
}): CommercialStateEffect {
  return {
    entityId: input.entityId,
    attribute: input.attribute,
    fromValue: input.from,
    toValue: input.to,
    cause: "ENVIRONMENT",
    actionId: null,
    actionLabel: null,
    reason: input.reason,
  };
}

function visible(id: string, statement: string, entityId: string | null = null): CommercialRequiredVisibleEvidence {
  return { id, statement, entityId };
}

function forbid(input: {
  entityId: string;
  attribute: string;
  from: string;
  to: string;
  reason: string;
}): CommercialProhibitedTransition {
  return {
    entityId: input.entityId,
    attribute: input.attribute,
    fromValue: input.from,
    toValue: input.to,
    reason: input.reason,
  };
}

function singleUse(input: {
  actionId: string;
  label: string;
  entityId: string;
  attribute: string;
  from: string;
  to: string;
}): CommercialSingleUseAction {
  return {
    actionId: input.actionId,
    label: input.label,
    entityId: input.entityId,
    attribute: input.attribute,
    fromValue: input.from,
    toValue: input.to,
  };
}

function stateContract(input: {
  preconditions?: CommercialStateRequirement[];
  effects?: CommercialStateEffect[];
  evidence?: CommercialRequiredVisibleEvidence[];
  prohibited?: CommercialProhibitedTransition[];
  singleUseAction?: CommercialSingleUseAction | null;
}): CommercialEventStateContract {
  return {
    preconditions: input.preconditions ?? [],
    effects: input.effects ?? [],
    requiredVisibleEvidence: input.evidence ?? [],
    prohibitedTransitions: input.prohibited ?? [],
    singleUseAction: input.singleUseAction ?? null,
  };
}

function cameraState(
  scale: CommercialEventCameraState["scale"],
  subjectRelation: CommercialEventCameraState["subjectRelation"],
  handoff: CommercialEventCameraState["handoff"]
): CommercialEventCameraState {
  return { scale, subjectRelation, handoff };
}

function takeBoundary(
  motivation: CommercialTakeBoundaryMotivation,
  boundaryReason: string,
  boundaryEvidence: CommercialTakeBoundaryEvidence[],
  whyContinuousTakeFails: string
): CommercialTakeBoundary {
  return { motivation, boundaryReason, boundaryEvidence, whyContinuousTakeFails };
}

function event(input: {
  camera: CommercialEventCameraState;
  actionContinuity: CommercialActionContinuity;
  actionSequenceId: string;
  stateContract: CommercialEventStateContract;
  takeBoundary?: CommercialTakeBoundary | null;
  actionRequiresFreshSetup?: boolean;
  timeGapSeconds?: number;
}): CommercialEventExecutionContract {
  return {
    cameraState: input.camera,
    actionContinuity: input.actionContinuity,
    actionSequenceId: input.actionSequenceId,
    actionRequiresFreshSetup: input.actionRequiresFreshSetup ?? false,
    takeBoundary: input.takeBoundary ?? null,
    timeGapSeconds: input.timeGapSeconds ?? 0,
    stateContract: input.stateContract,
  };
}

export const COMMERCIAL_EXECUTION_CONTRACTS: Record<CommercialIntentId, CommercialIntentExecutionContract> = {
  URBAN_MOTION: {
    worldModel: worldModel([
      characterEntity({ space: "on the city route", anchor: "the same open city route" }),
      {
        id: GROUND,
        kind: "GROUND",
        label: "the ground relationship",
        initialAttributes: { surface: "ordinary city pavement" },
        continuityLockAttributes: ["surface"],
        containment: null,
      },
    ]),
    events: {
      CITY_ENTRY: event({
        camera: cameraState("ENVIRONMENTAL", "FULL_PERSON", "CONTINUOUS"),
        actionContinuity: "CONTINUOUS",
        actionSequenceId: "urban_route",
        stateContract: stateContract({
          evidence: [
            visible("city_entry", "The person enters the route from the near plane while the route direction is already readable."),
          ],
        }),
      }),
      ROUTE_CONTINUATION: event({
        camera: cameraState("ENVIRONMENTAL", "FULL_PERSON", "CONTINUOUS"),
        actionContinuity: "CONTINUOUS",
        actionSequenceId: "urban_route",
        stateContract: stateContract({
          preconditions: holdsCharacterSpace("on the city route", "the same open city route"),
          evidence: [
            visible("route_continuation", "The same walking direction continues into the changed street condition at the curb."),
          ],
        }),
      }),
      GROUND_RELATION_CHANGE: event({
        camera: cameraState("MEDIUM", "LOWER_BODY", "CONTINUOUS"),
        actionContinuity: "CONTINUOUS",
        actionSequenceId: "urban_route",
        stateContract: stateContract({
          preconditions: [
            required(GROUND, "surface", "ordinary city pavement", "The route is still on the opening pavement before this beat."),
            ...holdsCharacterSpace("on the city route", "the same open city route"),
          ],
          effects: [
            environmentChange({
              entityId: GROUND,
              attribute: "surface",
              from: "ordinary city pavement",
              to: "a changed surface at the crossing",
              reason: "The route crosses onto a different ground surface.",
            }),
          ],
          evidence: [
            visible("ground_contact", "One short step settles on the changed surface and the leading foot takes real weight.", GROUND),
          ],
        }),
      }),
      URBAN_PAUSE: event({
        camera: cameraState("MEDIUM", "FULL_PERSON", "CONTINUOUS"),
        actionContinuity: "CONTINUOUS",
        actionSequenceId: "urban_pause",
        stateContract: stateContract({
          preconditions: [
            required(GROUND, "surface", "a changed surface at the crossing", "The changed ground relationship persists from the previous beat."),
            ...holdsCharacterSpace("on the city route", "the same open city route"),
          ],
          evidence: [
            visible("urban_pause", "The body settles into a grounded pause at the route's natural pause point without posing."),
          ],
        }),
      }),
      ROUTE_RELEASE: event({
        camera: cameraState("ENVIRONMENTAL", "FULL_PERSON", "CONTINUOUS"),
        actionContinuity: "NEW_ACTION_SEQUENCE",
        actionSequenceId: "route_release",
        stateContract: stateContract({
          preconditions: [
            required(GROUND, "surface", "a changed surface at the crossing", "The ground relationship established earlier still holds."),
            ...holdsCharacterSpace("on the city route", "the same open city route"),
          ],
          prohibited: [
            forbid({
              entityId: GROUND,
              attribute: "surface",
              from: "a changed surface at the crossing",
              to: "ordinary city pavement",
              reason: "The release continues the route and must not reset the opening pavement.",
            }),
          ],
          evidence: [
            visible("route_release", "The camera stays with the place while the person continues out of the deeper plane."),
          ],
        }),
      }),
    },
  },
  DAILY_STYLING: {
    worldModel: worldModel([
      characterEntity({ space: "inside the private entryway", anchor: "the entryway" }),
      {
        id: HOME_THRESHOLD,
        kind: "THRESHOLD",
        label: "the same home threshold",
        initialAttributes: { state: "closed", crossings: "0" },
        continuityLockAttributes: ["state"],
        containment: null,
      },
      {
        id: OUTFIT,
        kind: "OBJECT",
        label: "the completed outfit",
        initialAttributes: { state: "not yet resolved" },
        continuityLockAttributes: ["state"],
        containment: null,
      },
    ]),
    events: {
      WARDROBE_DECISION: event({
        camera: cameraState("MEDIUM", "FULL_PERSON", "CONTINUOUS"),
        actionContinuity: "CONTINUOUS",
        actionSequenceId: "wardrobe_decision",
        stateContract: stateContract({
          preconditions: holdsCharacterSpace("inside the private entryway", "the entryway"),
          effects: [
            actionChange({
              entityId: OUTFIT,
              attribute: "state",
              from: "not yet resolved",
              to: "resolved and worn",
              actionId: "COMPLETE_OUTFIT",
              actionLabel: "completed",
              reason: "One useful wardrobe task resolves the look.",
            }),
          ],
          evidence: [
            visible("wardrobe_decision", "One useful wardrobe task completes while the outfit is being worn.", OUTFIT),
          ],
          singleUseAction: singleUse({
            actionId: "COMPLETE_OUTFIT",
            label: "Completing the outfit",
            entityId: OUTFIT,
            attribute: "state",
            from: "not yet resolved",
            to: "resolved and worn",
          }),
        }),
      }),
      THRESHOLD_TEST: event({
        camera: cameraState("MEDIUM", "FULL_PERSON", "CONTINUOUS"),
        actionContinuity: "NEW_ACTION_SEQUENCE",
        actionSequenceId: "leaving_home",
        takeBoundary: takeBoundary(
          "SPATIAL_BOUNDARY",
          "The character crosses from the private interior into the public exterior.",
          [
            {
              kind: "SPATIAL_TRANSITION",
              statement: "The character's space changes from inside the private entryway to outside on the street.",
              proof: {
                entityId: "character",
                attribute: "space",
                fromValue: "inside the private entryway",
                toValue: "outside on the street",
              },
            },
          ],
          "The camera that can cover the private entryway cannot continuously cover the exterior street while the character crosses and moves away."
        ),
        stateContract: stateContract({
          preconditions: [
            required(HOME_THRESHOLD, "state", "closed", "The threshold is still closed before it is opened once."),
            required(OUTFIT, "state", "resolved and worn", "The styling decision from the previous beat still holds."),
            ...holdsCharacterSpace("inside the private entryway", "the entryway"),
          ],
          effects: [
            actionChange({
              entityId: HOME_THRESHOLD,
              attribute: "state",
              from: "closed",
              to: "open",
              actionId: "OPEN_THRESHOLD",
              actionLabel: "opened",
              reason: "The threshold opens once so the character can cross.",
            }),
            actionChange({
              entityId: CHARACTER,
              attribute: "space",
              from: "inside the private entryway",
              to: "outside on the street",
              actionId: "CROSS_THRESHOLD",
              actionLabel: "crossed",
              reason: "The crossing is the only spatial change in the film.",
            }),
            actionChange({
              entityId: CHARACTER,
              attribute: "anchor",
              from: "the entryway",
              to: "the street",
              actionId: "CROSS_THRESHOLD",
              actionLabel: "crossed",
              reason: "The character's spatial zone moves from the entryway to the street.",
            }),
            actionChange({
              entityId: HOME_THRESHOLD,
              attribute: "crossings",
              from: "0",
              to: "1",
              actionId: "CROSS_THRESHOLD",
              actionLabel: "crossed",
              reason: "The threshold is crossed exactly once.",
            }),
          ],
          evidence: [
            visible("threshold_crossing", "The threshold opens once and the character crosses it while the outfit is already worn.", HOME_THRESHOLD),
          ],
          prohibited: [
            forbid({
              entityId: CHARACTER,
              attribute: "space",
              from: "outside on the street",
              to: "inside the private entryway",
              reason: "The film does not return to the private entryway after the crossing.",
            }),
          ],
          singleUseAction: singleUse({
            actionId: "CROSS_THRESHOLD",
            label: "Crossing the home threshold",
            entityId: HOME_THRESHOLD,
            attribute: "crossings",
            from: "0",
            to: "1",
          }),
        }),
      }),
      GARMENT_FOOT_RELATION: event({
        camera: cameraState("PROXIMAL", "LOWER_BODY", "CONTINUOUS"),
        actionContinuity: "CONTINUOUS",
        actionSequenceId: "street_step",
        stateContract: stateContract({
          preconditions: [
            required(CHARACTER, "space", "outside on the street", "The character is already outside after the crossing."),
            required(OUTFIT, "state", "resolved and worn", "The resolved outfit persists through the step."),
            required(HOME_THRESHOLD, "state", "open", "The threshold is already open and is not opened again."),
          ],
          evidence: [
            visible("garment_foot_relation", "The finished hem, ankle, and footwear relationship becomes visible inside the step that is already happening."),
          ],
          prohibited: [
            forbid({
              entityId: CHARACTER,
              attribute: "space",
              from: "outside on the street",
              to: "inside the private entryway",
              reason: "The step outside continues and does not re-enter the private entryway.",
            }),
          ],
        }),
      }),
      READY_TO_MOVE: event({
        camera: cameraState("MEDIUM", "FULL_PERSON", "CONTINUOUS"),
        actionContinuity: "SETTLES",
        actionSequenceId: "ready_to_move",
        stateContract: stateContract({
          preconditions: [
            required(CHARACTER, "space", "outside on the street", "The character remains outside from the crossing onward."),
            required(OUTFIT, "state", "resolved and worn", "The completed look still holds."),
          ],
          evidence: [
            visible("ready_to_move", "The completed look settles at the outside edge of the doorway."),
          ],
        }),
      }),
      LIVED_USE: event({
        camera: cameraState("ENVIRONMENTAL", "FULL_PERSON", "CONTINUOUS"),
        actionContinuity: "NEW_ACTION_SEQUENCE",
        actionSequenceId: "lived_use",
        stateContract: stateContract({
          preconditions: [
            required(CHARACTER, "space", "outside on the street", "The release continues outside and never returns to the entryway."),
            required(HOME_THRESHOLD, "crossings", "1", "The threshold was crossed exactly once."),
          ],
          evidence: [
            visible("lived_use", "The first ordinary street step continues with the styling already resolved."),
          ],
          prohibited: [
            forbid({
              entityId: CHARACTER,
              attribute: "space",
              from: "outside on the street",
              to: "inside the private entryway",
              reason: "The release must not restart the leaving-home event.",
            }),
          ],
        }),
      }),
    },
  },
  QUIET_LUXURY: {
    worldModel: worldModel([
      characterEntity({ space: "inside the quiet private room", anchor: "the window side of the room" }),
      {
        id: WINDOW_LIGHT,
        kind: "OBJECT",
        label: "the window light",
        initialAttributes: { direction: "steady and coming from the same window side" },
        continuityLockAttributes: ["direction"],
        containment: null,
      },
    ]),
    events: {
      PRIVATE_STATE: event({
        camera: cameraState("ENVIRONMENTAL", "FULL_PERSON", "CONTINUOUS"),
        actionContinuity: "CONTINUOUS",
        actionSequenceId: "private_pause",
        stateContract: stateContract({
          evidence: [
            visible("private_state", "The person stands by the window with most of her weight settled on the rear leg."),
          ],
        }),
      }),
      RESTRAINED_SHIFT: event({
        camera: cameraState("MEDIUM", "FULL_PERSON", "CONTINUOUS"),
        actionContinuity: "CONTINUOUS",
        actionSequenceId: "restrained_shift",
        stateContract: stateContract({
          preconditions: holdsCharacterSpace("inside the quiet private room", "the window side of the room"),
          evidence: [
            visible("restrained_shift", "One small standing adjustment changes the body line inside the same room."),
          ],
        }),
      }),
      MATERIAL_PAUSE: event({
        camera: cameraState("PROXIMAL", "LOWER_BODY", "CONTINUOUS"),
        actionContinuity: "CONTINUOUS",
        actionSequenceId: "material_pause",
        stateContract: stateContract({
          preconditions: [
            required(WINDOW_LIGHT, "direction", "steady and coming from the same window side", "The same side light defines the lower silhouette."),
            ...holdsCharacterSpace("inside the quiet private room", "the window side of the room"),
          ],
          evidence: [
            visible("material_pause", "The weight settles through the ankle and heel while the side light defines the lower silhouette."),
          ],
        }),
      }),
      PRODUCT_RECOGNITION: event({
        camera: cameraState("MEDIUM", "FULL_PERSON", "CONTINUOUS"),
        actionContinuity: "SETTLES",
        actionSequenceId: "product_recognition",
        stateContract: stateContract({
          preconditions: [
            ...holdsCharacterSpace("inside the quiet private room", "the window side of the room"),
            required(WINDOW_LIGHT, "direction", "steady and coming from the same window side", "The light relationship holds into the recognition beat."),
          ],
          evidence: [
            visible("product_recognition", "One small weight shift holds the complete worn line inside the same private light."),
          ],
        }),
      }),
      ROOM_CONTINUES: event({
        camera: cameraState("ENVIRONMENTAL", "FULL_PERSON", "CONTINUOUS"),
        actionContinuity: "NEW_ACTION_SEQUENCE",
        actionSequenceId: "room_continues",
        stateContract: stateContract({
          preconditions: [
            ...holdsCharacterSpace("inside the quiet private room", "the window side of the room"),
            required(WINDOW_LIGHT, "direction", "steady and coming from the same window side", "The room continues unchanged and the light remains in its established before state."),
          ],
          evidence: [
            visible("room_continues", "The room and light continue around the still person without a new event."),
          ],
        }),
      }),
    },
  },
  PRODUCT_CRAFT: {
    worldModel: worldModel([
      characterEntity({ space: "inside the preparation area", anchor: "the dressing surface" }),
      {
        id: PREPARATION_SURFACE,
        kind: "OBJECT",
        label: "the preparation surface",
        initialAttributes: { state: "in use" },
        continuityLockAttributes: ["state"],
        containment: null,
      },
    ]),
    events: {
      PREPARATION_CONTEXT: event({
        camera: cameraState("MEDIUM", "WORK_SURFACE", "CONTINUOUS"),
        actionContinuity: "CONTINUOUS",
        actionSequenceId: "preparation_task",
        stateContract: stateContract({
          evidence: [
            visible("preparation_context", "One ordinary preparation task is completed at the work surface."),
          ],
        }),
      }),
      WEAR_TRANSITION: event({
        camera: cameraState("MEDIUM", "FULL_PERSON", "CONTINUOUS"),
        actionContinuity: "NEW_ACTION_SEQUENCE",
        actionSequenceId: "worn_use",
        stateContract: stateContract({
          preconditions: [
            required(PREPARATION_SURFACE, "state", "in use", "The preparation state established earlier still holds."),
            ...holdsCharacterSpace("inside the preparation area", "the dressing surface"),
          ],
          evidence: [
            visible("wear_transition", "She stands from the preparation position and takes one small step with the product already worn."),
          ],
        }),
      }),
      EXTERNAL_DETAIL_SELECTION: event({
        camera: cameraState("PROXIMAL", "LOWER_BODY", "CONTINUOUS"),
        actionContinuity: "CONTINUOUS",
        actionSequenceId: "worn_use",
        stateContract: stateContract({
          preconditions: [
            required(PREPARATION_SURFACE, "state", "in use", "The preparation surface state persists through the worn-use beat."),
            ...holdsCharacterSpace("inside the preparation area", "the dressing surface"),
          ],
          evidence: [
            visible("external_detail_selection", "The trouser hem settles around the ankle as the weight moves onto the leading foot."),
          ],
        }),
      }),
      USE_CONFIRMATION: event({
        camera: cameraState("MEDIUM", "FULL_PERSON", "CONTINUOUS"),
        actionContinuity: "CONTINUOUS",
        actionSequenceId: "worn_use",
        stateContract: stateContract({
          preconditions: [
            required(PREPARATION_SURFACE, "state", "in use", "The preparation surface state persists into the confirmation beat."),
            ...holdsCharacterSpace("inside the preparation area", "the dressing surface"),
          ],
          evidence: [
            visible("use_confirmation", "One small practical move keeps the whole worn context readable while she keeps moving."),
          ],
        }),
      }),
      QUIET_COMPLETION: event({
        camera: cameraState("MEDIUM", "FULL_PERSON", "CONTINUOUS"),
        actionContinuity: "NEW_ACTION_SEQUENCE",
        actionSequenceId: "completion",
        stateContract: stateContract({
          preconditions: [
            required(PREPARATION_SURFACE, "state", "in use", "The preparation task has not been completed yet."),
            ...holdsCharacterSpace("inside the preparation area", "the dressing surface"),
          ],
          effects: [
            actionChange({
              entityId: PREPARATION_SURFACE,
              attribute: "state",
              from: "in use",
              to: "cleared and settled",
              actionId: "COMPLETE_PREPARATION",
              actionLabel: "completed",
              reason: "The preparation task reaches a stable conclusion.",
            }),
          ],
          evidence: [
            visible("quiet_completion", "The completed preparation state holds while she becomes ready to leave the space.", PREPARATION_SURFACE),
          ],
          prohibited: [
            forbid({
              entityId: PREPARATION_SURFACE,
              attribute: "state",
              from: "cleared and settled",
              to: "in use",
              reason: "The completion must not restart the preparation task.",
            }),
          ],
          singleUseAction: singleUse({
            actionId: "COMPLETE_PREPARATION",
            label: "The preparation task completes and its confirmed visible result remains ready for practical use.",
            entityId: PREPARATION_SURFACE,
            attribute: "state",
            from: "in use",
            to: "cleared and settled",
          }),
        }),
      }),
    },
  },
  NEW_ARRIVAL: {
    worldModel: worldModel([
      characterEntity({ space: "outside on the approach", anchor: "the approach line" }),
      {
        id: DESTINATION_THRESHOLD,
        kind: "THRESHOLD",
        label: "the same destination threshold",
        initialAttributes: { state: "closed", lock: "locked", crossings: "0" },
        continuityLockAttributes: ["state", "lock"],
        containment: null,
      },
    ]),
    events: {
      APPROACH: event({
        camera: cameraState("ENVIRONMENTAL", "FULL_PERSON", "CONTINUOUS"),
        actionContinuity: "CONTINUOUS",
        actionSequenceId: "approach",
        stateContract: stateContract({
          evidence: [
            visible("approach", "The approach direction and the destination are readable before any product emphasis."),
          ],
        }),
      }),
      THRESHOLD: event({
        camera: cameraState("MEDIUM", "FULL_PERSON", "CONTINUOUS"),
        actionContinuity: "NEW_ACTION_SEQUENCE",
        actionSequenceId: "arrival",
        takeBoundary: takeBoundary(
          "SPATIAL_BOUNDARY",
          "The character crosses from the exterior approach into the arrival space.",
          [
            {
              kind: "SPATIAL_TRANSITION",
              statement: "The character's space changes from outside on the approach to inside the arrival space.",
              proof: {
                entityId: "character",
                attribute: "space",
                fromValue: "outside on the approach",
                toValue: "inside the arrival space",
              },
            },
          ],
          "The destination interior cannot be covered by the camera position that covers the exterior approach while the character completes the entry."
        ),
        stateContract: stateContract({
          preconditions: [
            required(DESTINATION_THRESHOLD, "lock", "locked", "The destination threshold is still locked before the entry."),
            required(DESTINATION_THRESHOLD, "state", "closed", "The destination threshold is still closed before the entry."),
            ...holdsCharacterSpace("outside on the approach", "the approach line"),
          ],
          effects: [
            actionChange({
              entityId: DESTINATION_THRESHOLD,
              attribute: "lock",
              from: "locked",
              to: "unlocked",
              actionId: "UNLOCK_THRESHOLD",
              actionLabel: "unlocked",
              reason: "The destination threshold is unlocked once.",
            }),
            actionChange({
              entityId: DESTINATION_THRESHOLD,
              attribute: "state",
              from: "closed",
              to: "open",
              actionId: "OPEN_THRESHOLD",
              actionLabel: "opened",
              reason: "The destination threshold opens once.",
            }),
            actionChange({
              entityId: CHARACTER,
              attribute: "space",
              from: "outside on the approach",
              to: "inside the arrival space",
              actionId: "CROSS_THRESHOLD",
              actionLabel: "crossed",
              reason: "The final physical adjustment completes the entry.",
            }),
            actionChange({
              entityId: CHARACTER,
              attribute: "anchor",
              from: "the approach line",
              to: "the arrival space",
              actionId: "CROSS_THRESHOLD",
              actionLabel: "crossed",
              reason: "The character leaves the approach line and enters the destination.",
            }),
            actionChange({
              entityId: DESTINATION_THRESHOLD,
              attribute: "crossings",
              from: "0",
              to: "1",
              actionId: "CROSS_THRESHOLD",
              actionLabel: "crossed",
              reason: "The destination threshold is crossed exactly once.",
            }),
          ],
          evidence: [
            visible("threshold_entry", "The threshold is unlocked once, opens once, and the entry completes in one physical adjustment.", DESTINATION_THRESHOLD),
          ],
          prohibited: [
            forbid({
              entityId: CHARACTER,
              attribute: "space",
              from: "inside the arrival space",
              to: "outside on the approach",
              reason: "The film does not return to the approach after the arrival.",
            }),
          ],
          singleUseAction: singleUse({
            actionId: "CROSS_THRESHOLD",
            label: "Crossing the destination threshold",
            entityId: DESTINATION_THRESHOLD,
            attribute: "crossings",
            from: "0",
            to: "1",
          }),
        }),
      }),
      ARRIVAL_GROUNDING: event({
        camera: cameraState("PROXIMAL", "LOWER_BODY", "CONTINUOUS"),
        actionContinuity: "CONTINUOUS",
        actionSequenceId: "arrival",
        stateContract: stateContract({
          preconditions: [
            required(CHARACTER, "space", "inside the arrival space", "The arrival space persists after the entry."),
            required(DESTINATION_THRESHOLD, "lock", "unlocked", "The threshold stays unlocked after the single unlock action."),
            required(DESTINATION_THRESHOLD, "state", "open", "The threshold is already open and is not opened again."),
          ],
          evidence: [
            visible("arrival_grounding", "One real step feels the arrival surface and the weight settles through it."),
          ],
          prohibited: [
            forbid({
              entityId: CHARACTER,
              attribute: "space",
              from: "inside the arrival space",
              to: "outside on the approach",
              reason: "The grounded arrival continues and does not return to the approach.",
            }),
          ],
        }),
      }),
      SETTLING: event({
        camera: cameraState("MEDIUM", "FULL_PERSON", "CONTINUOUS"),
        actionContinuity: "SETTLES",
        actionSequenceId: "settling",
        stateContract: stateContract({
          preconditions: [
            required(CHARACTER, "space", "inside the arrival space", "The character remains inside the arrival space."),
            required(DESTINATION_THRESHOLD, "state", "open", "The threshold stays open through the settled beat."),
          ],
          evidence: [
            visible("settling", "She settles into the destination and the complete worn state becomes clear."),
          ],
        }),
      }),
      ARRIVAL_ENVIRONMENT: event({
        camera: cameraState("ENVIRONMENTAL", "FULL_PERSON", "CONTINUOUS"),
        actionContinuity: "NEW_ACTION_SEQUENCE",
        actionSequenceId: "arrival_release",
        stateContract: stateContract({
          preconditions: [
            required(CHARACTER, "space", "inside the arrival space", "The release stays settled inside the arrival space."),
            required(DESTINATION_THRESHOLD, "lock", "unlocked", "The threshold stays unlocked through the release."),
            required(DESTINATION_THRESHOLD, "crossings", "1", "The threshold was crossed exactly once."),
          ],
          evidence: [
            visible("arrival_environment", "The destination continues around her while she remains settled in the arrival space."),
          ],
          prohibited: [
            forbid({
              entityId: CHARACTER,
              attribute: "space",
              from: "inside the arrival space",
              to: "outside on the approach",
              reason: "The release must not restart the approach.",
            }),
          ],
        }),
      }),
    },
  },
};

export function resolveCommercialIntentExecutionContract(
  intent: CommercialIntentId
): CommercialIntentExecutionContract {
  return COMMERCIAL_EXECUTION_CONTRACTS[intent];
}
