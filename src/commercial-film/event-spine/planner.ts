import {
  COMMERCIAL_ENDING_GRAMMARS,
  COMMERCIAL_EVENT_SPINE_TEMPLATES,
} from "./catalog";
import { resolveCommercialIntentExecutionContract } from "./execution-contracts";
import {
  COMMERCIAL_EVENT_SPINE_SCHEMA_VERSION,
  COMMERCIAL_EVENT_SPINE_VERSION,
  type CommercialEventSpinePlan,
  type CommercialEventSpinePlannerInput,
  type CommercialEventShot,
} from "./types";
import type { CommercialShotRole } from "../types";
import type { CommercialCreativeMode } from "../creative-direction";
import { applyCommercialEventFunction, applyCommercialStructureState, COMMERCIAL_WORLD_AFTERIMAGE_CARRIERS, commercialEventResolution, eventFunctionSequence, selectCommercialPhysicalEvent } from "./advertising-functions";
import { centralEventNarrative, commercialEventNarrativeOverride } from "./narrative-overrides";
import { structuredObservableEvidence } from "./evidence-authority";
import type { CommercialEventStateContract } from "./world-state";

const PRODUCT_CRAFT_DETAIL_RELATIONSHIPS = [
  "surface",
  "material transition",
  "edge",
  "panel relationship",
  "lace-tongue relationship",
  "upper-outsole relationship",
  "ground-contact behavior",
];

const WORLD_LIFE_BY_INTENT = {
  URBAN_MOTION: {
    density: "ACTIVE_BACKGROUND" as const,
    signals: ["distant pedestrians", "passing traffic", "storefront reflections", "pavement variation", "street furniture"],
    line: "The city should feel actively inhabited rather than cleared for filming: keep subtle background pedestrians, distant traffic, irregular pavement, reflections, ordinary street objects, and non-readable storefront graphics while all background activity stays secondary.",
  },
  DAILY_STYLING: {
    density: "NORMAL_LIVED_IN" as const,
    signals: ["wardrobe edge", "ordinary door hardware", "floor wear", "soft exterior ambience", "one lived-in object"],
    line: "The private space should feel genuinely used rather than staged as a luxury showroom, with ordinary interior residue and only physically plausible distant exterior life.",
  },
  QUIET_LUXURY: {
    density: "LOW_LIVED_IN" as const,
    signals: ["natural light falloff", "fabric and curtain movement", "ordinary chair or floor contact", "subtle object placement"],
    line: "The private room should feel quietly inhabited rather than pristine: keep light falloff, soft material movement, ordinary object placement, and no showroom perfection.",
  },
  PRODUCT_CRAFT: {
    density: "LOW_LIVED_IN" as const,
    signals: ["working surface use", "garment folds", "ordinary hardware", "subtle floor wear"],
    line: "The preparation world should feel materially real and mildly used, never a perfect studio set or a generic luxury showroom.",
  },
  NEW_ARRIVAL: {
    density: "NORMAL_LIVED_IN" as const,
    signals: ["distant pedestrian", "passing vehicle", "storefront reflection", "threshold hardware", "surface variation"],
    line: "The destination should feel independently inhabited: keep restrained background movement, distant traffic or reflection, ordinary surfaces, and non-readable wayfinding or storefront information.",
  },
};

const SHOT_ROLES: CommercialShotRole[] = ["WORLD", "WEAR", "DETAIL", "HERO", "RELEASE"];

function normalizeDurations(base: number[], revealStrategy: string) {
  const durations = [...base];
  const shift = revealStrategy === "DELAYED" ? 0.4 : revealStrategy === "IMMEDIATE" ? -0.2 : 0.1;
  durations[0] = Math.max(1, Number((durations[0] + shift).toFixed(1)));
  const total = durations.reduce((sum, value) => sum + value, 0);
  durations[4] = Number((durations[4] + (15 - total)).toFixed(1));
  return durations;
}

export function planCommercialEventSpine(
  input: CommercialEventSpinePlannerInput
): CommercialEventSpinePlan {
  const template = COMMERCIAL_EVENT_SPINE_TEMPLATES[input.commercialIntent];
  const execution = resolveCommercialIntentExecutionContract(input.commercialIntent);
  const quietLuxuryWorldObserved = input.commercialIntent === "QUIET_LUXURY"
    && input.creativeSpine.advertisingStructure === "WORLD_OBSERVES_SUBJECT"
    && input.creativeSpine.endingImageStrategy === "WORLD_AFTERIMAGE";
  const urbanPursuitRelease = input.commercialIntent === "URBAN_MOTION"
    && input.creativeSpine.advertisingStructure === "PURSUIT_RELEASE";
  const productRitualCompletion = input.commercialIntent === "PRODUCT_CRAFT"
    && input.creativeSpine.advertisingStructure === "RITUAL_COMPLETION";
  const functions = quietLuxuryWorldObserved
    ? ["SUBJECT_ESTABLISHED", "WORLD_CARRIER_PRESENT", "SUBJECT_REMAINS_SELF_DIRECTED", "WORLD_CHANGE", "WORLD_AFTERIMAGE"] as const
    : eventFunctionSequence(input.creativeSpine.advertisingStructure);
  const durations = normalizeDurations(
    template.shots.map((shot) => shot.durationSeconds),
    input.creativeSpine.revealStrategy
  );
  const templateEventKinds = template.shots.map((shot) => shot.eventKind);
  const declaredEventKinds = Object.keys(execution.events);
  const missingContracts = templateEventKinds.filter((eventKind) => !declaredEventKinds.includes(eventKind));
  const unusedContracts = declaredEventKinds.filter((eventKind) => !templateEventKinds.includes(eventKind));
  if (missingContracts.length > 0 || unusedContracts.length > 0) {
    throw new Error(
      "Commercial Event Spine execution contracts do not match the current event catalog."
      + `${missingContracts.length > 0 ? ` Missing: ${missingContracts.join(", ")}.` : ""}`
      + `${unusedContracts.length > 0 ? ` Unused: ${unusedContracts.join(", ")}.` : ""}`
    );
  }
  const worldAfterimage = input.creativeSpine.endingImageStrategy === "WORLD_AFTERIMAGE";
  const windowReflectionShift = input.commercialIntent === "QUIET_LUXURY" && ["CONTRAST_SHIFT", "WITHHOLD_REVEAL"].includes(input.creativeSpine.advertisingStructure);
  const carrierByIntent = COMMERCIAL_WORLD_AFTERIMAGE_CARRIERS[input.commercialIntent];
  const urbanContrastCarrier = input.commercialIntent === "URBAN_MOTION" && input.creativeSpine.advertisingStructure === "CONTRAST_SHIFT"
    ? { id: "world_carrier_traffic", kind: "CARRIER" as const, label: "passing traffic", initialAttributes: { state: "moving in the established distant lane" }, continuityLockAttributes: ["state"], containment: null }
    : null;
  const urbanPursuitCarrier = urbanPursuitRelease
    ? { id: "world_carrier_traffic", kind: "CARRIER" as const, label: "passing traffic", initialAttributes: { state: "moving in the established distant city lane" }, continuityLockAttributes: [], containment: null }
    : null;
  const arrivalContrastCarrier = input.commercialIntent === "NEW_ARRIVAL" && input.creativeSpine.advertisingStructure === "CONTRAST_SHIFT"
    ? { id: "world_carrier_storefront_reflection", kind: "CARRIER" as const, label: "storefront reflection", initialAttributes: { state: "destination reflected without the arriving silhouette" }, continuityLockAttributes: ["state"], containment: null }
    : null;
  const worldModel = { ...execution.worldModel, entities: execution.worldModel.entities.map((entity) => entity.id === "character"
      ? { ...entity, initialAttributes: { ...entity.initialAttributes, visualAccess: "open", composition: "separate from place", pace: "walking with the route", ...(quietLuxuryWorldObserved ? { principalAction: "standing adjustment not started" } : {}), ...(urbanPursuitRelease ? { routePosition: "approaching the established crossing" } : {}), ...(productRitualCompletion ? { preparationTask: "garment check in progress" } : {}) } }
      : quietLuxuryWorldObserved && entity.id === carrierByIntent.id
      ? { ...entity, initialAttributes: { ...entity.initialAttributes, state: carrierByIntent.before } }
      : windowReflectionShift && entity.id === "window_light"
      ? { ...entity, initialAttributes: { ...entity.initialAttributes, reflection: "room reflected in layers across the window glass" }, continuityLockAttributes: [...entity.continuityLockAttributes, "reflection"] }
      : entity).concat(worldAfterimage && !execution.worldModel.entities.some((entity) => entity.id === carrierByIntent.id) ? [{ id: carrierByIntent.id, kind: "CARRIER" as const, label: carrierByIntent.label, initialAttributes: { state: carrierByIntent.before }, continuityLockAttributes: [], containment: null }] : []).concat(urbanContrastCarrier ? [urbanContrastCarrier] : []).concat(urbanPursuitCarrier ? [urbanPursuitCarrier] : []).concat(arrivalContrastCarrier ? [arrivalContrastCarrier] : []) };
  if (quietLuxuryWorldObserved) {
    worldModel.entities = worldModel.entities.map((entity) => entity.id === carrierByIntent.id
      ? { ...entity, continuityLockAttributes: entity.continuityLockAttributes.filter((attribute) => attribute !== "direction") }
      : entity);
  }
  const shots: CommercialEventShot[] = template.shots.map((shot, shotIndex) => {
    const contract = execution.events[shot.eventKind];
    const structuredShot = {
      ...applyCommercialEventFunction({ shot, functionId: functions[shotIndex], intent: input.commercialIntent, strategy: input.creativeSpine.endingImageStrategy, shotIndex, worldAfterimage, windowReflectionShift }),
      ...commercialEventNarrativeOverride({ intent: input.commercialIntent, structure: input.creativeSpine.advertisingStructure, shotIndex }),
    };
    const quietSubjectContract = quietLuxuryWorldObserved && (shotIndex === 1 || shotIndex === 2 || shotIndex === 3 || shotIndex === 4)
      ? (() => {
        const carrierRequirement = { entityId: carrierByIntent.id, attribute: "state", value: carrierByIntent.before, reason: "The registered window-light carrier remains in its before state until the subject's principal action resolves." };
        const principalAction = { entityId: "character", attribute: "principalAction" };
        if (shotIndex === 1) return {
          ...contract.stateContract,
          preconditions: [...contract.stateContract.preconditions.filter((item) => !(item.entityId === "window_light" && item.attribute === "direction")), { ...principalAction, value: "standing adjustment not started", reason: "The single restrained standing adjustment has not begun before this beat." }, carrierRequirement],
          effects: [...contract.stateContract.effects, { entityId: "character", attribute: "principalAction", fromValue: "standing adjustment not started", toValue: "standing adjustment in progress", cause: "ACTION" as const, actionId: "BEGIN_RESTRAINED_SHIFT", actionLabel: "begins one small standing adjustment", reason: "The existing restrained shift begins the one principal body action." }],
          requiredVisibleEvidence: structuredObservableEvidence("quiet_subject_adjustment_begins", { ...contract.stateContract, effects: contract.stateContract.effects.filter((effect) => effect.entityId === "character") }, "character"),
        };
        if (shotIndex === 2) return {
          ...contract.stateContract,
          preconditions: [...contract.stateContract.preconditions.filter((item) => !(item.entityId === "window_light" && item.attribute === "direction")), { ...principalAction, value: "standing adjustment in progress", reason: "The same standing adjustment continues from the previous beat." }, carrierRequirement],
          effects: [...contract.stateContract.effects, { entityId: "character", attribute: "principalAction", fromValue: "standing adjustment in progress", toValue: "settled", cause: "ACTION" as const, actionId: "SETTLE_RESTRAINED_SHIFT", actionLabel: "settles her weight through the ankle and heel", reason: "The existing material-pause event visibly completes the single standing adjustment." }],
          requiredVisibleEvidence: structuredObservableEvidence("quiet_subject_action_resolved", { ...contract.stateContract, effects: contract.stateContract.effects.filter((effect) => effect.entityId === "character") }, "character"),
        };
        const principalSettled = { ...principalAction, value: "settled", reason: "The subject's principal action completed in the preceding beat and cannot restart." };
        const noRestart = [{ entityId: "character", attribute: "principalAction", fromValue: "settled", toValue: "standing adjustment in progress", reason: "The subject does not restart or add an action after settling." }];
        return {
          ...contract.stateContract,
          preconditions: [...contract.stateContract.preconditions.filter((item) => !(item.entityId === "window_light" && item.attribute === "direction")), principalSettled, ...(shotIndex === 3 ? [carrierRequirement] : [])],
          prohibitedTransitions: [...contract.stateContract.prohibitedTransitions, ...noRestart],
        };
      })()
      : null;
    const contractForSelection = quietSubjectContract
      ?? (input.creativeSpine.advertisingStructure === "WORLD_OBSERVES_SUBJECT" && shotIndex === 2 && input.commercialIntent !== "QUIET_LUXURY"
      ? { ...contract.stateContract, effects: contract.stateContract.effects.filter((effect) => effect.entityId === "character"), requiredVisibleEvidence: [] }
      : input.creativeSpine.advertisingStructure === "WORLD_OBSERVES_SUBJECT" && input.commercialIntent === "URBAN_MOTION" && shotIndex > 2
        ? { ...contract.stateContract, preconditions: contract.stateContract.preconditions.filter((requirement) => !(requirement.entityId === "ground" && requirement.attribute === "surface")) }
        : contract.stateContract);
    let patternSpecificContract = contractForSelection;
    if (urbanPursuitRelease) {
      const traffic = { entityId: "world_carrier_traffic", attribute: "state" };
      const position = { entityId: "character", attribute: "routePosition" };
      const pace = { entityId: "character", attribute: "pace" };
      if (shotIndex === 1) {
        structuredShot.whatChanges = "The route continues toward the established crossing while the passing traffic remains in its distant lane.";
        structuredShot.causalFromPrevious = "The same route carries her toward the crossing while the already-present city traffic continues.";
        structuredShot.perceptualTarget = "the established route and approaching traffic before the crossing is occupied";
        const approachContract = { ...contractForSelection, preconditions: [...contractForSelection.preconditions.filter((item) => !(item.entityId === "ground" && item.attribute === "surface")), { ...traffic, value: "moving in the established distant city lane", reason: "Passing traffic is already declared in this Urban Motion scene and remains in its distant lane before reaching the crossing." }], effects: contractForSelection.effects.filter((effect) => !(effect.entityId === "ground" && effect.attribute === "surface")), prohibitedTransitions: contractForSelection.prohibitedTransitions.filter((item) => !(item.entityId === "ground" && item.attribute === "surface")) };
        patternSpecificContract = { ...approachContract, requiredVisibleEvidence: structuredObservableEvidence("pursuit_traffic_approach", approachContract, "world_carrier_traffic") };
      } else if (shotIndex === 2) {
        structuredShot.actionClass = "environment-response";
        structuredShot.whatChanges = "The crossing changes from open route to a traffic-occupied passage, and her route position is held at the near edge.";
        structuredShot.causalFromPrevious = "The continuing route brings her to the same crossing as the already-declared traffic reaches it.";
        structuredShot.framingHint = "continuous human-scale crossing view showing the near edge, passing traffic, and her held route position";
        structuredShot.perceptualTarget = "visible route pressure from the same passing traffic occupying the established crossing";
        const pressureContract: CommercialEventStateContract = {
          ...contractForSelection,
          preconditions: [...contractForSelection.preconditions.filter((item) => !(item.entityId === "ground" && item.attribute === "surface")), { ...traffic, value: "moving in the established distant city lane", reason: "The declared traffic approaches from its established lane before occupying the crossing." }, { ...position, value: "approaching the established crossing", reason: "She has continued along the same route toward the crossing." }, { ...pace, value: "walking with the route", reason: "Her route is in motion before traffic occupies the crossing." }],
          prohibitedTransitions: contractForSelection.prohibitedTransitions.filter((item) => !(item.entityId === "ground" && item.attribute === "surface")),
          effects: [
            { entityId: "world_carrier_traffic", attribute: "state", fromValue: "moving in the established distant city lane", toValue: "crossing the established route", cause: "ENVIRONMENT", actionId: null, actionLabel: null, reason: "The already-declared passing traffic physically crosses and temporarily occupies the established crossing." },
            { entityId: "character", attribute: "routePosition", fromValue: "approaching the established crossing", toValue: "held at the near edge of the traffic-occupied crossing", cause: "ACTION", actionId: "HOLD_AT_OCCUPIED_CROSSING", actionLabel: "holds at the near edge while traffic passes", reason: "The crossing is visibly occupied, so the person remains on the near side until it clears." },
            { entityId: "character", attribute: "pace", fromValue: "walking with the route", toValue: "held at the crossing until traffic clears", cause: "ACTION", actionId: "HOLD_AT_OCCUPIED_CROSSING", actionLabel: "holds at the near edge while traffic passes", reason: "The occupied crossing interrupts forward travel until the carrier clears." },
          ],
        };
        patternSpecificContract = { ...pressureContract, requiredVisibleEvidence: structuredObservableEvidence("pursuit_pressure", pressureContract, "world_carrier_traffic") };
      } else if (shotIndex === 3) {
        structuredShot.actionClass = "walking";
        structuredShot.whatChanges = "Traffic changes from occupying the crossing to clear beyond it, and she changes from held at the near edge to beyond the crossing.";
        structuredShot.causalFromPrevious = "She begins the crossing only after the same traffic that held her route has passed.";
        structuredShot.framingHint = "continuous wide enough view to show traffic clearing and her single near-side-to-far-side crossing";
        structuredShot.perceptualTarget = "physical release through a completed crossing after the carrier clears";
        const releaseContract: CommercialEventStateContract = {
          ...contractForSelection,
          preconditions: [...contractForSelection.preconditions.filter((item) => !(item.entityId === "ground" && item.attribute === "surface")), { ...traffic, value: "crossing the established route", reason: "The same passing traffic still occupies the crossing at the start of this beat." }, { ...position, value: "held at the near edge of the traffic-occupied crossing", reason: "Her route remains held on the near side until the passing carrier clears." }, { ...pace, value: "held at the crossing until traffic clears", reason: "The prior beat established the interruption that this release resolves." }],
          prohibitedTransitions: contractForSelection.prohibitedTransitions.filter((item) => !(item.entityId === "ground" && item.attribute === "surface")),
          effects: [
            { entityId: "world_carrier_traffic", attribute: "state", fromValue: "crossing the established route", toValue: "passed beyond the crossing and clear of the route", cause: "ENVIRONMENT", actionId: null, actionLabel: null, reason: "The same traffic completes its pass and no longer occupies the crossing." },
            { entityId: "character", attribute: "routePosition", fromValue: "held at the near edge of the traffic-occupied crossing", toValue: "beyond the established crossing on the far side", cause: "ACTION", actionId: "CROSS_AFTER_TRAFFIC_CLEARS", actionLabel: "crosses once after traffic clears", reason: "She completes the route passage after the carrier has physically cleared it." },
            { entityId: "character", attribute: "pace", fromValue: "held at the crossing until traffic clears", toValue: "walking beyond the crossing", cause: "ACTION", actionId: "CROSS_AFTER_TRAFFIC_CLEARS", actionLabel: "resumes walking on the far side", reason: "Forward movement resumes only after the route is open." },
          ],
        };
        patternSpecificContract = { ...releaseContract, requiredVisibleEvidence: structuredObservableEvidence("pursuit_release_event", releaseContract, "world_carrier_traffic") };
      } else if (shotIndex === 4) {
        structuredShot.actionClass = "walking";
        structuredShot.whatChanges = "The completed crossing and clear route persist as she continues beyond the former pressure point.";
        structuredShot.causalFromPrevious = "The traffic has cleared and she has completed the crossing, so ordinary movement continues on the far side.";
        structuredShot.perceptualTarget = "held post-release state: person beyond crossing, traffic passed, route clear";
        const afterReleaseContract: CommercialEventStateContract = {
          ...contractForSelection,
          preconditions: [...contractForSelection.preconditions.filter((item) => !(item.entityId === "ground" && item.attribute === "surface")), { ...traffic, value: "passed beyond the crossing and clear of the route", reason: "The passing traffic remains beyond the crossing after the release event." }, { ...position, value: "beyond the established crossing on the far side", reason: "The person completed the crossing in the preceding beat." }, { ...pace, value: "walking beyond the crossing", reason: "Ordinary forward movement resumed on the far side." }],
          prohibitedTransitions: [...contractForSelection.prohibitedTransitions.filter((item) => !(item.entityId === "ground" && item.attribute === "surface")), { entityId: "world_carrier_traffic", attribute: "state", fromValue: "passed beyond the crossing and clear of the route", toValue: "crossing the established route", reason: "The ending must preserve the release and must not reintroduce pressure at the crossing." }, { entityId: "character", attribute: "routePosition", fromValue: "beyond the established crossing on the far side", toValue: "held at the near edge of the traffic-occupied crossing", reason: "The ending must not return the person to the pressure relationship." }],
        };
        patternSpecificContract = { ...afterReleaseContract, requiredVisibleEvidence: structuredObservableEvidence("pursuit_after_release", afterReleaseContract, "world_carrier_traffic") };
      }
    }
    if (productRitualCompletion) {
      const task = { entityId: "character", attribute: "preparationTask" };
      if (shotIndex === 0) {
        const taskStartContract = { ...contractForSelection, preconditions: [...contractForSelection.preconditions, { ...task, value: "garment check in progress", reason: "The already-supported before-leaving garment check is underway at the preparation surface." }] };
        patternSpecificContract = { ...taskStartContract, requiredVisibleEvidence: structuredObservableEvidence("ritual_task_in_progress", taskStartContract, "character") };
      } else if (shotIndex === 1) {
        structuredShot.whatChanges = "The garment check remains in progress; the hem has not yet been released and the preparation surface remains in use.";
        structuredShot.causalFromPrevious = "The opening establishes the garment check, and this beat continues that same task without starting practical use early.";
        structuredShot.actionClass = "garment-task";
        structuredShot.perceptualTarget = "same task visibly progressing before its completion action";
        const taskProgressContract = { ...contractForSelection, preconditions: [...contractForSelection.preconditions, { ...task, value: "garment check in progress", reason: "The same preparation task continues from the opening and has not reached its completion action." }] };
        patternSpecificContract = { ...taskProgressContract, requiredVisibleEvidence: structuredObservableEvidence("ritual_task_progress", taskProgressContract, "character") };
      } else if (shotIndex === 2) {
        structuredShot.actionClass = "garment-task";
        structuredShot.whatChanges = "The garment check changes from in progress to finished; her hand is clear of the hem and the hem remains settled around the ankle in the grounded worn state.";
        structuredShot.causalFromPrevious = "The active garment check continues from the preparation context and is completed by releasing the hem into its settled worn state.";
        structuredShot.framingHint = "medium human-scale frame showing the hand release, settled hem, grounded leading foot, and preparation context together";
        structuredShot.perceptualTarget = "visible action completion and its settled worn result, without a product insert";
        patternSpecificContract = {
          ...contractForSelection,
          preconditions: [...contractForSelection.preconditions, { ...task, value: "garment check in progress", reason: "The same garment check established in the opening has not yet been completed." }],
          effects: [
            ...contractForSelection.effects,
            { entityId: "character", attribute: "preparationTask", fromValue: "garment check in progress", toValue: "garment check completed; hand lowered and hem settled", cause: "ACTION", actionId: "COMPLETE_PREPARATION", actionLabel: "releases the checked hem and lowers the hand", reason: "The supported garment-check action visibly ends with the hem settled and the hand leaving the task." },
            { entityId: "preparation_surface", attribute: "state", fromValue: "in use", toValue: "cleared and settled", cause: "ACTION", actionId: "COMPLETE_PREPARATION", actionLabel: "finishes the preparation task", reason: "The preparation station is no longer in use once the garment check is finished." },
          ],
          requiredVisibleEvidence: [...structuredObservableEvidence("ritual_completion_action_result", { ...contractForSelection, effects: [...contractForSelection.effects, { entityId: "character", attribute: "preparationTask", fromValue: "garment check in progress", toValue: "garment check completed; hand lowered and hem settled", cause: "ACTION", actionId: "COMPLETE_PREPARATION", actionLabel: "releases the checked hem and lowers the hand", reason: "The supported garment-check action visibly ends with the hem settled and the hand leaving the task." }, { entityId: "preparation_surface", attribute: "state", fromValue: "in use", toValue: "cleared and settled", cause: "ACTION", actionId: "COMPLETE_PREPARATION", actionLabel: "finishes the preparation task", reason: "The preparation station is no longer in use once the garment check is finished." }] }, "character"), ...structuredObservableEvidence("ritual_surface_cleared", { ...contractForSelection, effects: [...contractForSelection.effects, { entityId: "character", attribute: "preparationTask", fromValue: "garment check in progress", toValue: "garment check completed; hand lowered and hem settled", cause: "ACTION", actionId: "COMPLETE_PREPARATION", actionLabel: "releases the checked hem and lowers the hand", reason: "The supported garment-check action visibly ends with the hem settled and the hand leaving the task." }, { entityId: "preparation_surface", attribute: "state", fromValue: "in use", toValue: "cleared and settled", cause: "ACTION", actionId: "COMPLETE_PREPARATION", actionLabel: "finishes the preparation task", reason: "The preparation station is no longer in use once the garment check is finished." }] }, "preparation_surface")],
          singleUseAction: { actionId: "COMPLETE_PREPARATION", label: "The existing before-leaving garment check completes as the hand releases the hem and lowers, leaving the hem settled for practical use.", entityId: "character", attribute: "preparationTask", fromValue: "garment check in progress", toValue: "garment check completed; hand lowered and hem settled" },
        };
      } else if (shotIndex === 3) {
        structuredShot.actionClass = "walking";
        structuredShot.whatChanges = "The finished hem and cleared preparation surface persist as she moves from task posture toward ordinary departure.";
        structuredShot.causalFromPrevious = "The visible hem-check completion leaves the garment settled and her hand clear, enabling the first practical step toward the existing exit line.";
        structuredShot.perceptualTarget = "completed preparation result carried into the first practical movement";
        const resultContract = { ...contractForSelection, preconditions: [...contractForSelection.preconditions.filter((item) => !(item.entityId === "preparation_surface" && item.attribute === "state" && item.value === "in use")), { ...task, value: "garment check completed; hand lowered and hem settled", reason: "The visible completion action and result were established in the preceding beat." }, { entityId: "preparation_surface", attribute: "state", value: "cleared and settled", reason: "The preparation surface was cleared by the completed garment check." }], effects: [...contractForSelection.effects, { entityId: "character", attribute: "anchor", fromValue: "the dressing surface", toValue: "the exit line", cause: "ACTION" as const, actionId: "WALK_TO_EXIT_LINE", actionLabel: "takes one practical step toward the exit line", reason: "Her practical movement carries the completed preparation result from the dressing surface toward the already-declared departure anchor." }] };
        patternSpecificContract = { ...resultContract, requiredVisibleEvidence: structuredObservableEvidence("ritual_result_enters_use", resultContract, "character") };
      } else if (shotIndex === 4) {
        structuredShot.actionClass = "walking";
        structuredShot.whatChanges = "Ordinary movement continues while the completed garment state and cleared preparation surface remain true.";
        structuredShot.causalFromPrevious = "The first practical step carries the completed garment result out of preparation and into the day.";
        structuredShot.perceptualTarget = "ending preserves the completed garment state in ordinary use";
        const ritualEndingContract = {
          ...contractForSelection,
          effects: [],
          singleUseAction: null,
          preconditions: [...contractForSelection.preconditions.filter((item) => !(item.entityId === "preparation_surface" && item.attribute === "state" && item.value === "in use") && !(item.entityId === "character" && item.attribute === "anchor")), { ...task, value: "garment check completed; hand lowered and hem settled", reason: "The task is complete and its visible result remains in use." }, { entityId: "character", attribute: "anchor", value: "the exit line", reason: "The person has moved from the preparation surface toward the same existing departure anchor." }, { entityId: "preparation_surface", attribute: "state", value: "cleared and settled", reason: "The task station remains cleared after departure into practical use." }],
          prohibitedTransitions: [...contractForSelection.prohibitedTransitions, { entityId: "character", attribute: "preparationTask", fromValue: "garment check completed; hand lowered and hem settled", toValue: "garment check in progress", reason: "The ending must preserve the finished task rather than restart it." }, { entityId: "preparation_surface", attribute: "state", fromValue: "cleared and settled", toValue: "in use", reason: "The preparation result remains complete through the ending." }],
        };
        patternSpecificContract = { ...ritualEndingContract, requiredVisibleEvidence: structuredObservableEvidence("ritual_completion_preserved", ritualEndingContract, "character") };
      }
    }
    const selectedStateContract = applyCommercialStructureState({ contract: patternSpecificContract, intent: input.commercialIntent, structure: input.creativeSpine.advertisingStructure, strategy: input.creativeSpine.endingImageStrategy, shotIndex, eventKind: shot.eventKind });
    const stateContract = {
      ...selectedStateContract,
      preconditions: selectedStateContract.preconditions.map((item) => ({ ...item })),
      effects: selectedStateContract.effects.map((item) => ({ ...item })),
      requiredVisibleEvidence: selectedStateContract.requiredVisibleEvidence.map((item) => ({ ...item })),
      prohibitedTransitions: selectedStateContract.prohibitedTransitions.map((item) => ({ ...item })),
      singleUseAction: selectedStateContract.singleUseAction ? { ...selectedStateContract.singleUseAction } : null,
    };
    const preparedShot: CommercialEventShot = {
      ...structuredShot,
      physicalEvent: { eventFamily: shot.eventKind, actor: "HUMAN", primaryStateChanged: "none declared", requiredResource: null, eventPurpose: functions[shotIndex].toLowerCase().replace(/_/g, " "), supportedIntent: input.commercialIntent, supportedEventFunctions: [functions[shotIndex]], requiredWorldResources: [], requiredStartState: [], producedEndState: [], humanActionRequirement: "REQUIRED", worldChangeRequirement: "OPTIONAL", productCompatibility: input.creativeSpine.productRole, takeCompatibility: { cameraState: contract.cameraState, actionContinuity: shotIndex === 4 && input.creativeSpine.endingImageStrategy !== "CONTINUE_INTO_LIFE" ? "SETTLES" : contract.actionContinuity, actionSequenceId: contract.actionSequenceId, actionRequiresFreshSetup: contract.actionRequiresFreshSetup, takeBoundary: contract.takeBoundary, timeGapSeconds: contract.timeGapSeconds } },
      shotIndex,
      shotRole: SHOT_ROLES[shotIndex],
      durationSeconds: durations[shotIndex],
      productDetailRelationship: input.commercialIntent === "PRODUCT_CRAFT"
        ? PRODUCT_CRAFT_DETAIL_RELATIONSHIPS[input.generationNonce % PRODUCT_CRAFT_DETAIL_RELATIONSHIPS.length]
        : shot.productDetailRelationship ?? null,
      cameraState: contract.cameraState,
      actionContinuity: shotIndex === 4 && input.creativeSpine.endingImageStrategy !== "CONTINUE_INTO_LIFE"
        ? "SETTLES"
        : contract.actionContinuity,
      actionSequenceId: contract.actionSequenceId,
      actionRequiresFreshSetup: contract.actionRequiresFreshSetup,
      takeBoundary: contract.takeBoundary,
      timeGapSeconds: contract.timeGapSeconds,
      stateContract,
    };
    if (input.creativeSpine.advertisingStructure === "WITHHOLD_REVEAL" && (shotIndex === 1 || shotIndex === 3)) {
      preparedShot.stateContract.effects.push({ entityId: "character", attribute: "visualAccess", fromValue: shotIndex === 1 ? "open" : "partly withheld", toValue: shotIndex === 1 ? "partly withheld" : "readable", cause: "ACTION", actionId: shotIndex === 1 ? "TURN_INTO_OCCLUSION" : "TURN_CLEAR_OF_OCCLUSION", actionLabel: shotIndex === 1 ? "turns into the established partial view" : "turns clear of the established partial view", reason: shotIndex === 1 ? "The existing body angle changes what is visible against the registered wardrobe plane." : "The same body turn releases the previously withheld worn relationship." });
      preparedShot.stateContract.requiredVisibleEvidence = structuredObservableEvidence(
        shotIndex === 1 ? "withheld_relationship_established" : "withheld_relationship_revealed",
        preparedShot.stateContract,
        "character"
      );
      if (input.commercialIntent === "QUIET_LUXURY") {
        preparedShot.stateContract.preconditions.push({ entityId: "window_light", attribute: "reflection", value: shotIndex === 1 ? "room reflected in layers across the window glass" : "the worn silhouette becomes legible in the same window glass", reason: shotIndex === 1 ? "The existing window reflection is the registered visual carrier for the partial view." : "The same registered window reflection persists after its relationship changes." });
      } else if (input.commercialIntent === "DAILY_STYLING" && shotIndex === 3) {
        preparedShot.stateContract.preconditions.push({ entityId: "home_threshold", attribute: "state", value: "open", reason: "The doorway edge remains the registered spatial carrier for the released view." });
      } else if (input.commercialIntent === "PRODUCT_CRAFT" && shotIndex === 1) {
        preparedShot.stateContract.preconditions.push({ entityId: "preparation_surface", attribute: "state", value: "in use", reason: "The preparation surface edge remains the registered carrier for the partial view." });
      }
    }
    if (input.creativeSpine.advertisingStructure === "ICONIC_IMAGE" && (shotIndex === 2 || shotIndex === 3)) {
      preparedShot.stateContract.effects.push({ entityId: "character", attribute: "composition", fromValue: shotIndex === 2 ? "separate from place" : "aligned with established place", toValue: shotIndex === 2 ? "aligned with established place" : "complete person-product-world image", cause: "ACTION", actionId: shotIndex === 2 ? "ALIGN_WITH_PLACE" : "COMPLETE_COMPOSITION", actionLabel: shotIndex === 2 ? "aligns with the place" : "settles into the complete composition", reason: shotIndex === 2 ? "The same body movement brings the person and established place into one composition." : "The completed body and place relationship forms the held image." });
    }
    if (input.creativeSpine.advertisingStructure === "CONTRAST_SHIFT" && shotIndex === 2 && input.commercialIntent === "URBAN_MOTION") {
      stateContract.effects.push({ entityId: "world_carrier_traffic", attribute: "state", fromValue: "moving in the established distant lane", toValue: "crossing the foreground as her pace settles", cause: "ENVIRONMENT", actionId: null, actionLabel: null, reason: "Traffic already named in the active city world crosses the established route as the person's pace changes." });
      stateContract.effects.push({ entityId: "character", attribute: "pace", fromValue: "walking with the route", toValue: "slows at the crossing", cause: "ACTION", actionId: "SLOW_AT_TRAFFIC_CROSSING", actionLabel: "slows at the crossing", reason: "The established moving route gives the person a natural contrast point as traffic crosses." });
      stateContract.requiredVisibleEvidence = structuredObservableEvidence("traffic_crossing_contrast", stateContract, "world_carrier_traffic");
    }
    if (input.creativeSpine.advertisingStructure === "CONTRAST_SHIFT" && shotIndex === 2 && input.commercialIntent === "NEW_ARRIVAL") {
      stateContract.effects.push({ entityId: "world_carrier_storefront_reflection", attribute: "state", fromValue: "destination reflected without the arriving silhouette", toValue: "the arriving silhouette aligns within the established destination reflection", cause: "ENVIRONMENT", actionId: null, actionLabel: null, reason: "The existing destination reflection changes its visible relationship as the person arrives." });
      stateContract.requiredVisibleEvidence = structuredObservableEvidence("arrival_reflection_alignment", stateContract, "world_carrier_storefront_reflection");
    }
    return selectCommercialPhysicalEvent({ shot: preparedShot, structure: input.creativeSpine.advertisingStructure, strategy: input.creativeSpine.endingImageStrategy, intent: input.commercialIntent, shotIndex, worldModel, productRole: input.creativeSpine.productRole });
  });
  if (shots.length !== 5 || durations.some((duration) => duration < 1 || duration > 5)) {
    throw new Error("Commercial Event Spine must produce five shots with durations between 1 and 5 seconds.");
  }
  return {
    schemaVersion: COMMERCIAL_EVENT_SPINE_SCHEMA_VERSION,
    plannerVersion: COMMERCIAL_EVENT_SPINE_VERSION,
    worldModel,
    intent: input.commercialIntent,
    centralEvent: centralEventNarrative(shots),
    advertisingStructure: input.creativeSpine.advertisingStructure,
    endingImageStrategy: input.creativeSpine.endingImageStrategy,
    endingResolution: commercialEventResolution(shots[4]),
    eventChain: shots.map((shot) => shot.eventKind),
    shots,
    durationPlan: durations,
    endingGrammar: input.creativeSpine.endingImageStrategy === "WORLD_AFTERIMAGE"
      ? { ...COMMERCIAL_ENDING_GRAMMARS.STILLNESS_AND_ROOM_CONTINUES, line: commercialEventResolution(shots[4]), resolves: "The person's principal action is complete while the evidenced world carrier changes state." }
      : input.creativeSpine.endingImageStrategy === "RESOLVE_IN_PLACE"
        ? { ...COMMERCIAL_ENDING_GRAMMARS.STILLNESS_AND_ROOM_CONTINUES, line: commercialEventResolution(shots[4]), resolves: "The subject resolves within the already established physical state." }
        : input.creativeSpine.endingImageStrategy === "ICONIC_HOLD"
          ? { ...COMMERCIAL_ENDING_GRAMMARS.ARRIVAL_SETTLES, line: commercialEventResolution(shots[4]), resolves: "The final image is held from the established person, product, and world relationship." }
          : COMMERCIAL_ENDING_GRAMMARS[template.endingGrammarId],
    worldLifeDensity: WORLD_LIFE_BY_INTENT[input.commercialIntent].density,
    worldLifeSignals: [...WORLD_LIFE_BY_INTENT[input.commercialIntent].signals],
    worldRealismLine: WORLD_LIFE_BY_INTENT[input.commercialIntent].line,
  };
}

export function applyCreativeModeTiming(
  baseDurations: number[],
  creativeMode: CommercialCreativeMode
) {
  const durations = [...baseDurations];
  const adjustments: Record<CommercialCreativeMode, number[]> = {
    PRIVATE_MOMENT: [0.1, 0.1, -0.2, -0.1, 0.1],
    CITY_JOURNEY: [-0.1, 0.1, -0.2, 0, 0.2],
    EVERYDAY_MOVEMENT: [0, 0, -0.1, 0.1, 0],
    STATE_TRANSITION: [0, -0.1, -0.1, 0.2, 0],
    SENSORY_LIFE: [0.1, 0.2, 0.1, -0.1, -0.3],
    SINGLE_IDEA: [-0.1, 0.1, -0.1, 0.1, 0],
  };
  const deltas = adjustments[creativeMode] ?? [0, 0, 0, 0, 0];
  durations.forEach((duration, index) => {
    durations[index] = Math.max(1, Math.min(5, Number((duration + deltas[index]).toFixed(1))));
  });
  const total = durations.reduce((sum, value) => sum + value, 0);
  durations[4] = Number((durations[4] + (15 - total)).toFixed(1));
  if (durations[4] > 5) {
    const overflow = durations[4] - 5;
    durations[4] = 5;
    durations[3] = Number((durations[3] - overflow).toFixed(1));
  }
  const rounded = durations.map((duration) => Number(duration.toFixed(1)));
  const finalTotal = rounded.reduce((sum, duration) => sum + duration, 0);
  rounded[4] = Number((rounded[4] + (15 - finalTotal)).toFixed(1));
  return rounded;
}
