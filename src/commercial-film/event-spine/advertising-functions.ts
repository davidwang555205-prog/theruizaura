import type { CommercialEventFunction } from "./types";
import type { CommercialIntentId } from "../types";
import type { CommercialAdvertisingStructureId, CommercialCreativeSpinePlan, CommercialEndingImageStrategy } from "../creative-spine/types";
import type { CommercialEventShot } from "./types";
import type { CommercialEventStateContract } from "./world-state";
import { structuredObservableEvidence } from "./evidence-authority";
import type { CommercialWorldModel } from "./world-state";

const FUNCTION_INTENT: Record<CommercialEventFunction, string> = {
  ESTABLISH_MOVEMENT: "The opening makes the route direction legible before the movement builds.",
  BUILD_MOVEMENT: "The same route carries forward the movement already in progress.",
  CONTINUE_PRESSURE: "The journey remains in progress until its existing physical change arrives.",
  RELEASE_CHANGE: "The established route change gives movement its release point.",
  AFTER_RELEASE: "The image leaves the route open beyond the completed release.",
  ESTABLISH_STATE: "The opening makes the starting condition clear in the existing place.",
  CONTINUE_STATE: "The current condition remains legible while the same situation continues.",
  PERCEPTUAL_SHIFT: "The condition identified by this event changes perceptibly here.",
  CONTRAST_PEAK: "The changed condition reaches its clearest reading here.",
  RESOLVE_CHANGED_STATE: "The final state resolves within the established place.",
  ESTABLISH_CONTEXT: "The opening gives the viewer the human and spatial context of the action.",
  PARTIAL_INFORMATION: "The established context keeps part of the worn relationship unresolved.",
  CONTINUE_WITHHOLD: "The same action continues while the complete relationship remains withheld.",
  REVEAL_CAUSE: "The physical cue already established by this event makes the withheld relationship legible.",
  INTEGRATED_RESOLUTION: "The revealed relationship settles back into the complete human situation.",
  TASK_BEGIN: "The existing practical task begins as the film's first event.",
  TASK_PROGRESS: "The same task advances without adding a second objective.",
  TASK_COMPLETE: "The task reaches its visible completion in this event.",
  RESULT_IN_USE: "The completed result is carried into the person's existing use of it.",
  LIVED_RESOLUTION: "The completed task resolves into the next lived moment.",
  SUBJECT_ESTABLISHED: "The person is established as self-directed within the existing world.",
  WORLD_CARRIER_PRESENT: "An already available world carrier is present around the person.",
  WORLD_CHANGE: "The existing world carrier changes state while the person remains self-directed.",
  SUBJECT_REMAINS_SELF_DIRECTED: "The person's settled action remains independent of the world change.",
  WORLD_AFTERIMAGE: "The changed world remains perceptible after the person's principal action resolves.",
  IMAGE_FOUNDATION: "The opening establishes the person, product, and place that form the final image.",
  IMAGE_BUILD: "The next event adds an existing physical relationship to that image.",
  RELATIONSHIP_BUILD: "The worn product relationship becomes part of the developing composition.",
  IMAGE_COMPLETE: "The established person, product, and world relationship reaches its complete form.",
  ICONIC_RESOLUTION: "The completed image holds from the physical state already built by the earlier events.",
};

export function eventFunctionIntent(functionId: CommercialEventFunction) {
  return FUNCTION_INTENT[functionId];
}

export const COMMERCIAL_WORLD_AFTERIMAGE_CARRIERS: Record<CommercialIntentId, { id: string; label: string; before: string; after: string; statement: string; residual?: string }> = {
  URBAN_MOTION: { id: "world_carrier_traffic", label: "passing traffic", before: "approaching in the established background", after: "has passed through the established background", statement: "A vehicle passes through the distant city background after the person's route action has settled." },
  DAILY_STYLING: { id: "world_carrier_exterior_ambience", label: "soft exterior ambience", before: "distant and steady", after: "continues beyond the doorway", statement: "Soft exterior life remains audible beyond the already crossed doorway." },
  QUIET_LUXURY: {
    id: "window_light",
    label: "window light",
    before: "steady from the established window side across the quiet interior floor",
    after: "the same soft light edge continues its slow passage across the quiet interior floor and remains in motion",
    statement: "The existing window light shifts its soft edge across the quiet interior floor while she remains settled and gives no response.",
    residual: "She remains settled and gives no response as the same window-light edge continues its slow passage across the quiet interior floor, advances farther, and stays in motion when the film ends.",
  },
  PRODUCT_CRAFT: { id: "world_carrier_working_surface", label: "working surface", before: "in use during preparation", after: "settled after the task", statement: "The already used preparation surface remains settled after the task completes." },
  NEW_ARRIVAL: { id: "world_carrier_traffic", label: "passing vehicle", before: "approaching beyond the destination", after: "passes the destination", statement: "A passing vehicle moves through the established destination background while she remains settled." },
};

export function applyCommercialEventFunction(input: {
  shot: Omit<CommercialEventShot, "eventFunction" | "physicalEvent" | "shotIndex" | "shotRole" | "cameraState" | "actionContinuity" | "actionSequenceId" | "actionRequiresFreshSetup" | "takeBoundary" | "timeGapSeconds" | "stateContract">;
  functionId: CommercialEventFunction;
  intent: CommercialIntentId;
  strategy: CommercialEndingImageStrategy;
  shotIndex: number;
  worldAfterimage: boolean;
  windowReflectionShift?: boolean;
}) {
  const { shot, functionId, intent, strategy, shotIndex, worldAfterimage, windowReflectionShift = false } = input;
  const carrier = COMMERCIAL_WORLD_AFTERIMAGE_CARRIERS[intent];
  const worldChangeBeat = worldAfterimage && shotIndex === (intent === "QUIET_LUXURY" ? 3 : 2);
  const worldAfterimageBeat = worldAfterimage && shotIndex === 4;
  const resolveInPlace = shotIndex === 4 && strategy === "RESOLVE_IN_PLACE";
  const iconicHold = shotIndex === 4 && strategy === "ICONIC_HOLD";
  const reflectionText = windowReflectionShift && shotIndex === 2
    ? "In the existing window glass, the room's layered reflection resolves into her worn silhouette as the earlier body adjustment settles."
    : null;
  const worldText = reflectionText ?? (worldChangeBeat
    ? carrier.statement
    : worldAfterimageBeat
      ? carrier.residual ?? `${carrier.label} remains perceptible in the held place after the person's principal action has resolved.`
      : null);
  const endingText = resolveInPlace
    ? intent === "URBAN_MOTION"
      ? "She remains at the established pause point as her weight settles on the changed street surface."
      : intent === "DAILY_STYLING"
        ? "She stays in ordinary street use at the outside edge with the completed look settled; the next movement has not begun."
        : intent === "QUIET_LUXURY"
          ? "She remains settled beside the window as the complete worn line rests in the existing light."
          : intent === "PRODUCT_CRAFT"
            ? "The completed preparation remains resolved in the same space as she settles into the finished look."
            : "She remains settled inside the destination with the arrival state complete."
    : iconicHold
      ? intent === "DAILY_STYLING"
        ? "She keeps the complete outfit in ordinary use at the lived doorway as the day continues around the worn look."
        : intent === "QUIET_LUXURY"
          ? "She remains beside the existing window light as the room reflection and quiet space continue around her settled silhouette."
      : intent === "PRODUCT_CRAFT"
            ? "She keeps the product in a natural use state while its reference-supported surface, edge, and worn-structure relationships remain readable."
            : "The person, complete worn look, and established place resolve together into one held final image."
      : shotIndex === 4 && strategy === "CONTINUE_INTO_LIFE" && intent === "PRODUCT_CRAFT"
        ? "With the preparation complete, she takes the first ordinary step into the day."
        : null;
  const intentLine = FUNCTION_INTENT[functionId];
  return {
    ...shot,
    eventFunction: functionId,
    whyItHappens: worldText ? "The person's principal action is already resolved; the established world supplies the remaining perceptual event." : endingText ? "The ending resolves from the established physical state and the selected advertising structure." : `${intentLine} ${shot.whyItHappens}`,
    whatChanges: worldText ? `${carrier.label} changes state while the person remains self-directed.` : endingText ? resolveInPlace ? "The current spatial state settles without departure." : iconicHold ? "The existing person, worn product, and place form one final image." : "The completed preparation enters an ordinary next step." : `${shot.whatChanges} ${intentLine}`,
    ...(worldText || endingText ? {
      whatHappens: worldText ?? endingText!,
      actionClass: worldText ? "environment-response" : resolveInPlace || iconicHold ? "standing" : "transition",
      causalFromPrevious: worldText ? "The person's settled state leaves the already established world carrier perceptible." : "The prior event leaves the established state ready to resolve without a new task.",
      framingHint: worldText ? "held environmental frame with the established world carrier visible or audible" : "held frame on the resolved person and place",
      perceptualTarget: worldText ? "world continues after the person's action resolves" : iconicHold ? "complete person-product-world relationship held in one image" : "the current state settles in place",
    } : {}),
  };
}

export function applyCommercialStructureState(input: { contract: CommercialEventStateContract; intent: CommercialIntentId; structure: CommercialAdvertisingStructureId; strategy: CommercialEndingImageStrategy; shotIndex: number; eventKind: string }): CommercialEventStateContract {
  const strategy = input.strategy;
  const carrier = COMMERCIAL_WORLD_AFTERIMAGE_CARRIERS[input.intent];
  if (input.intent === "QUIET_LUXURY" && ["CONTRAST_SHIFT", "WITHHOLD_REVEAL"].includes(input.structure) && input.shotIndex === 2 && input.eventKind === "MATERIAL_PAUSE") {
    return {
      ...input.contract,
      effects: [...input.contract.effects, { entityId: "window_light", attribute: "reflection", fromValue: "room reflected in layers across the window glass", toValue: "the worn silhouette becomes legible in the same window glass", cause: "ACTION", actionId: "RESTRAINED_SHIFT", actionLabel: "the already established body adjustment", reason: "The completed body adjustment changes the existing reflection relationship without adding an action or resource." }],
      requiredVisibleEvidence: structuredObservableEvidence("window_reflection_transition", { ...input.contract, effects: [...input.contract.effects, { entityId: "window_light", attribute: "reflection", fromValue: "room reflected in layers across the window glass", toValue: "the worn silhouette becomes legible in the same window glass", cause: "ACTION", actionId: "RESTRAINED_SHIFT", actionLabel: "the already established body adjustment", reason: "The completed body adjustment changes the existing reflection relationship without adding an action or resource." }] }, "window_light"),
    };
  }
  const worldChangeShotIndex = input.intent === "QUIET_LUXURY" && input.structure === "WORLD_OBSERVES_SUBJECT" ? 3 : 2;
  if (strategy === "WORLD_AFTERIMAGE" && input.shotIndex === worldChangeShotIndex) {
    return {
      ...input.contract,
      effects: [...input.contract.effects, { entityId: carrier.id, attribute: "state", fromValue: carrier.before, toValue: carrier.after, cause: "ENVIRONMENT", actionId: null, actionLabel: null, reason: carrier.statement }],
      requiredVisibleEvidence: structuredObservableEvidence(`${carrier.id}_change`, { ...input.contract, effects: [...input.contract.effects, { entityId: carrier.id, attribute: "state", fromValue: carrier.before, toValue: carrier.after, cause: "ENVIRONMENT", actionId: null, actionLabel: null, reason: carrier.statement }] }, carrier.id),
    };
  }
  if (strategy === "WORLD_AFTERIMAGE" && input.structure === "WORLD_OBSERVES_SUBJECT" && input.shotIndex === 4) {
    return {
      ...input.contract,
      preconditions: [...input.contract.preconditions, { entityId: carrier.id, attribute: "state", value: carrier.after, reason: "The world carrier remains in its changed, visible state after the person settles." }],
      requiredVisibleEvidence: structuredObservableEvidence(`${carrier.id}_afterimage`, { ...input.contract, preconditions: [...input.contract.preconditions, { entityId: carrier.id, attribute: "state", value: carrier.after, reason: "The world carrier remains in its changed, visible state after the person settles." }] }, carrier.id),
    };
  }
  if (input.shotIndex === 4 && strategy !== "CONTINUE_INTO_LIFE") {
    return { ...input.contract, requiredVisibleEvidence: structuredObservableEvidence(`${input.eventKind.toLowerCase()}_ending`, input.contract) };
  }
  return input.contract;
}

export function commercialEventResolution(shot: CommercialEventShot) {
  return shot.whatHappens;
}

/** Selects reusable physical event primitives from the function, then proves each one in state. */
export function selectCommercialPhysicalEvent(input: {
  shot: CommercialEventShot;
  structure: CommercialAdvertisingStructureId;
  strategy: CommercialEndingImageStrategy;
  intent: CommercialIntentId;
  shotIndex: number;
  worldModel: CommercialWorldModel;
  productRole: CommercialCreativeSpinePlan["productRole"];
}): CommercialEventShot {
  const { shot, structure, strategy, intent, shotIndex, worldModel, productRole } = input;
  let eventKind = shot.eventKind;
  let whatHappens = shot.whatHappens;
  let whyItHappens = shot.whyItHappens;
  let whatChanges = shot.whatChanges;
  let actionClass = shot.actionClass;
  let causalFromPrevious = shot.causalFromPrevious;
  let framingHint = shot.framingHint;
  let perceptualTarget = shot.perceptualTarget;
  const contract = shot.stateContract;

  if (structure === "WORLD_OBSERVES_SUBJECT" && intent === "QUIET_LUXURY" && shot.eventFunction === "WORLD_CARRIER_PRESENT") {
    eventKind = "WORLD_CARRIER_PRESENT";
    whatHappens = `She continues the same small standing adjustment beside the registered ${COMMERCIAL_WORLD_AFTERIMAGE_CARRIERS[intent].label}, which remains ${COMMERCIAL_WORLD_AFTERIMAGE_CARRIERS[intent].before}.`;
    whyItHappens = "The one existing body adjustment develops while the registered world carrier stays in its before state.";
    whatChanges = `Her standing adjustment remains in progress; the registered ${COMMERCIAL_WORLD_AFTERIMAGE_CARRIERS[intent].label} has not begun its change.`;
    causalFromPrevious = "The established standing position permits one restrained adjustment without starting another action.";
    perceptualTarget = "the subject action develops while the declared window-light carrier remains in its before state";
    contract.requiredVisibleEvidence = structuredObservableEvidence("quiet_window_light_present", contract, "window_light");
  } else if (structure === "WORLD_OBSERVES_SUBJECT" && intent === "QUIET_LUXURY" && shot.eventFunction === "SUBJECT_REMAINS_SELF_DIRECTED") {
    eventKind = "SUBJECT_ACTION_RESOLVED";
    whatHappens = "She finishes the same standing adjustment with a small weight settle through her ankle and heel, then remains still as the window light stays in its steady before state.";
    whyItHappens = "The principal body action completes here; the already declared window-light carrier has not begun to move.";
    whatChanges = "Her principal standing adjustment changes from in progress to settled while the window light remains steady.";
    causalFromPrevious = "The restrained adjustment reaches its natural weight-settled end state before the world event takes focus.";
    perceptualTarget = "the subject reaches a settled end state before the window-light change";
    contract.requiredVisibleEvidence = structuredObservableEvidence("quiet_subject_action_resolved", contract, "character");
  } else if (structure === "WORLD_OBSERVES_SUBJECT" && shot.eventFunction === "WORLD_CHANGE" && strategy === "WORLD_AFTERIMAGE") {
    eventKind = "WORLD_CARRIER_CHANGE";
    whatHappens = COMMERCIAL_WORLD_AFTERIMAGE_CARRIERS[intent].statement;
    whyItHappens = "The person's action has settled enough for the already established world carrier to make the next visible event.";
    whatChanges = contract.effects.filter((effect) => effect.cause === "ENVIRONMENT").map((effect) => `${effect.entityId}.${effect.attribute} changes from ${effect.fromValue} to ${effect.toValue}.`).join(" ") || shot.whatChanges;
    actionClass = "environment-response";
    causalFromPrevious = "The person's prior movement leaves the registered world carrier free to change state.";
    framingHint = "held human-scale composition that clearly shows the registered world carrier changing";
    perceptualTarget = "world-owned physical change around a self-directed person";
  } else if (structure === "WORLD_OBSERVES_SUBJECT" && intent === "QUIET_LUXURY" && shot.eventFunction === "WORLD_AFTERIMAGE" && strategy === "WORLD_AFTERIMAGE") {
    eventKind = "WORLD_AFTERIMAGE";
    whatHappens = COMMERCIAL_WORLD_AFTERIMAGE_CARRIERS[intent].residual!;
    whyItHappens = "The same window-light change remains in motion after the subject action has resolved; it does not reset, and the subject gives no response.";
    whatChanges = COMMERCIAL_WORLD_AFTERIMAGE_CARRIERS[intent].after;
    actionClass = "environment-response";
    causalFromPrevious = "The window-light edge continues the single change established in the previous beat.";
    framingHint = "locked environmental frame retaining the settled person and the same window-light edge across the interior floor";
    perceptualTarget = "the same registered world event continues as residual motion after the subject is settled";
  } else if (structure === "WORLD_OBSERVES_SUBJECT" && shot.eventFunction === "WORLD_AFTERIMAGE" && strategy === "WORLD_AFTERIMAGE") {
    eventKind = "WORLD_AFTERIMAGE";
  } else if (structure === "WITHHOLD_REVEAL" && intent === "QUIET_LUXURY" && shot.eventFunction === "CONTINUE_WITHHOLD") {
    eventKind = "REFLECTION_RELATION_CHANGE";
    whatHappens = "In the existing window glass, the layered room reflection resolves into her worn silhouette as her already established body adjustment settles.";
    whyItHappens = "The same room reflection changes visibility as the already established body adjustment settles; no new action is introduced.";
    whatChanges = contract.effects.find((effect) => effect.attribute === "reflection")?.reason ?? "The existing reflected relationship changes as the body adjustment settles.";
    actionClass = "standing";
    causalFromPrevious = "The earlier partial view makes the same window-glass reflection the cause of recognition.";
    framingHint = "held human-scale frame retaining the person and the same window glass";
    perceptualTarget = "the reflected worn relationship becomes readable in the existing window glass";
    contract.requiredVisibleEvidence = structuredObservableEvidence("withheld_reflection_release", contract, "window_light");
  } else if (structure === "WITHHOLD_REVEAL" && ["PARTIAL_INFORMATION", "REVEAL_CAUSE"].includes(shot.eventFunction)) {
    const establishing = shot.eventFunction === "PARTIAL_INFORMATION";
    eventKind = intent === "QUIET_LUXURY"
      ? establishing ? "REFLECTION_OCCLUSION_ESTABLISHED" : "REFLECTION_OCCLUSION_RELEASED"
      : establishing ? "FOREGROUND_OCCLUSION_ESTABLISHED" : "FOREGROUND_OCCLUSION_RELEASED";
    whatHappens = establishing
      ? intent === "QUIET_LUXURY"
        ? "The existing window reflection leaves part of the worn relationship unresolved while she remains in the same quiet room."
        : intent === "DAILY_STYLING"
        ? "Her existing body angle leaves part of the worn relationship behind the open doorway edge."
        : intent === "PRODUCT_CRAFT"
          ? "Her existing body angle leaves part of the worn relationship behind the preparation surface edge."
          : "Her existing body angle leaves part of the worn relationship unresolved against the quiet room."
      : intent === "QUIET_LUXURY"
        ? "The same window reflection clears as she settles, leaving the complete worn relationship legible in the quiet room."
        : intent === "DAILY_STYLING"
        ? "She turns clear of the open doorway edge and the complete worn relationship becomes readable in the entryway."
        : intent === "PRODUCT_CRAFT"
          ? "She turns clear of the preparation surface edge and the complete worn relationship becomes readable in the same work area."
          : "She turns toward the room light and the complete worn relationship becomes readable in the same quiet space.";
    whyItHappens = establishing
      ? intent === "QUIET_LUXURY"
        ? "The existing window reflection carries a partial view before the same reflective relationship changes."
        : "The existing room edge creates a concrete partial view before the reveal."
      : intent === "QUIET_LUXURY"
        ? "The earlier reflection change leaves the same room and worn relationship directly readable."
        : "The previously withheld relationship becomes readable as she clears the same room edge.";
    whatChanges = establishing
      ? "The existing room edge withholds part of the worn relationship."
      : "The worn relationship changes from partly withheld to readable in the same room, with no product insert.";
    actionClass = "turning";
    causalFromPrevious = establishing
      ? "The established body position leaves the same room edge between the viewer and part of the worn relationship."
      : "The previous partial view gives the same body turn a visible release point.";
    framingHint = "single continuous human-scale frame with the same room edge visibly relating to the body";
    perceptualTarget = establishing ? "worn relation partly withheld by existing room geometry" : "same worn relation released from the established occlusion";
    if (!establishing && intent === "DAILY_STYLING") {
      whatHappens = "She remains outside and clears the exterior-side doorway edge, making the complete worn relationship readable in the same outside spatial state.";
      whyItHappens = "The completed crossing leaves the same doorway edge as an exterior foreground carrier; clearing it changes only what is visible, not her location.";
      whatChanges = "The worn relationship changes from partly withheld to readable at the exterior edge of the doorway while she remains outside.";
      causalFromPrevious = "The preceding beat has already completed the only crossing; this body turn clears the exterior-side edge without another crossing.";
      framingHint = "single continuous exterior-side frame with the doorway edge in the foreground and the character remaining on the street";
      perceptualTarget = "same outside spatial state with the worn relationship released from the exterior-side doorway edge";
    }
    contract.requiredVisibleEvidence = structuredObservableEvidence(eventKind.toLowerCase(), contract, "character");
  } else if (structure === "ICONIC_IMAGE" && ["RELATIONSHIP_BUILD", "IMAGE_COMPLETE"].includes(shot.eventFunction)) {
    const complete = shot.eventFunction === "IMAGE_COMPLETE";
    eventKind = complete ? "COMPOSITIONAL_SETTLE" : "PERSON_PRODUCT_WORLD_ALIGNMENT";
    if (intent === "DAILY_STYLING") {
      whatHappens = complete
        ? "She keeps the complete outfit in ordinary use as she reaches the lived doorway; the worn product remains part of the real day."
        : "Her existing step carries the complete look through the lived entry space, with the worn relationship readable during ordinary use.";
      whyItHappens = "The final image matters because a resolved complete look has entered the ordinary day.";
      whatChanges = complete ? "The complete look is understood in lived use within its everyday environment." : "The styling decision becomes a real-use relationship between the person, complete outfit, and lived place.";
      perceptualTarget = complete ? "complete outfit in ordinary lived use" : "resolved look carried through an everyday space";
    } else if (intent === "QUIET_LUXURY") {
      whatHappens = complete
        ? "She settles beside the existing window light as its reflection and room falloff hold the worn silhouette within the quiet space."
        : "Her existing body adjustment changes how the window reflection and side light meet the worn silhouette in the quiet room.";
      whyItHappens = "The final image matters because the person's restrained presence and the room's existing light form one quiet world relationship.";
      whatChanges = complete ? "The person and worn silhouette settle into the established light and reflection relationship." : "The same person, window reflection, and room light become spatially related without a product inspection.";
      perceptualTarget = complete ? "restrained person-light-reflection relationship" : "worn silhouette held by existing room light and reflection";
    } else if (intent === "PRODUCT_CRAFT") {
      const relationship = "visible surface, edge, and worn-structure relationship shown by the confirmed product references";
      whatHappens = complete
        ? `She settles from the already aligned body position into the complete worn-use state, keeping both feet grounded while one leg takes slightly more weight. As this settling action reaches the complete person, worn product, and place state, the confirmed ${relationship} remains readable at human scale.`
        : `She wears the product through the existing practical movement so the ${relationship} reads within the worn structure.`;
      whyItHappens = "The final image matters because an observable product relationship, supported by the confirmed reference, explains itself through real use.";
      whatChanges = complete ? `The reference-confirmed ${relationship} becomes part of the final visual meaning in use.` : `The product's reference-confirmed ${relationship} becomes legible within its worn structure.`;
      perceptualTarget = complete ? "reference-grounded product relationship as final image meaning" : "product structure and confirmed material relationship in use";
    } else {
      whatHappens = complete
        ? "The person settles within the established place, bringing the complete worn look and surrounding world into one stable composition."
        : "The person's existing movement brings the worn line into alignment with the established place while the full human context stays visible.";
      whyItHappens = complete ? "The established person, product, and place relationship reaches its composed final state." : "The developing image needs the real body and place to share one readable frame before it completes.";
      whatChanges = complete ? "The person, worn product, and place become one composed final image." : "The body and place move from separate readings into one shared composition.";
      perceptualTarget = complete ? "person-product-world composition held as one image" : "human and place alignment";
    }
    actionClass = "standing";
    causalFromPrevious = intent === "PRODUCT_CRAFT"
      ? "The current practical movement carries a reference-confirmed product relationship into the complete worn state."
      : intent === "QUIET_LUXURY"
        ? "The existing body adjustment leaves the established light and reflection relationship perceptible around the person."
        : "The existing body movement carries the resolved styling decision into ordinary use in the same lived place.";
    framingHint = "medium-full frame retaining the complete person and established place";
    contract.requiredVisibleEvidence = structuredObservableEvidence(eventKind.toLowerCase(), contract, "character");
  } else if (structure === "CONTRAST_SHIFT" && shot.eventFunction === "PERCEPTUAL_SHIFT") {
    if (intent === "URBAN_MOTION") {
      eventKind = "TRAFFIC_CROSSES_ROUTE";
      whatHappens = "Passing traffic crosses the foreground as she slows at the established crossing.";
      whyItHappens = "The city continues at its established pace while her route finds one natural pause in that flow.";
      whatChanges = "Traffic and her pace separate into two visible rhythms in the same crossing.";
      actionClass = "environment-response";
      causalFromPrevious = "The continuous route brings her to the established crossing while city traffic continues.";
      framingHint = "held full-person crossing frame with foreground traffic and the same route visible";
      perceptualTarget = "moving traffic contrasted with her slowing pace";
    } else if (intent === "NEW_ARRIVAL") {
      eventKind = "ARRIVAL_REFLECTION_ALIGNMENT";
      whatHappens = "She approaches as her silhouette aligns within the storefront reflection and the destination comes into view.";
      whyItHappens = "The destination reflection changes the visual relationship before the arrival settles.";
      whatChanges = "The destination reflection now carries the arriving person's silhouette.";
      actionClass = "environment-response";
      causalFromPrevious = "The threshold approach brings the person into alignment with the existing destination reflection.";
      framingHint = "human-scale destination frame with storefront reflection and approaching person together";
      perceptualTarget = "the destination reflection changes as arrival becomes legible";
    } else {
      eventKind = "PERCEPTUAL_RELATION_SHIFT";
      perceptualTarget = "the established visual condition changes so the same worn relation reads differently";
    }
  }

  if (structure === "WORLD_OBSERVES_SUBJECT" && shotIndex === (intent === "QUIET_LUXURY" ? 3 : 2) && eventKind === "WORLD_CARRIER_CHANGE") {
    const carrierEffects = contract.effects.filter((effect) => effect.entityId !== "character" && effect.cause === "ENVIRONMENT");
    contract.effects = carrierEffects;
    contract.preconditions = intent === "QUIET_LUXURY"
      ? contract.preconditions.filter((requirement) => requirement.entityId === "character" || requirement.entityId === "window_light")
      : contract.preconditions.filter((requirement) => requirement.entityId === "character");
    contract.requiredVisibleEvidence = contract.requiredVisibleEvidence.filter((evidence) => carrierEffects.some((effect) => effect.entityId === evidence.entityId));
  }

  if (structure === "WORLD_OBSERVES_SUBJECT" && intent === "URBAN_MOTION" && shotIndex === 1) {
    eventKind = "WORLD_CARRIER_PRESENT";
    whatHappens = "She continues along the same city route while passing traffic remains in the established distant lane.";
    whyItHappens = "The route stays self-directed while the already available city carrier is held ready for its later change.";
    whatChanges = "The same route and the distant traffic are both legible before the traffic crosses its established lane.";
    causalFromPrevious = "The opening route direction carries into the same street while its already present traffic remains in view.";
    perceptualTarget = "self-directed route with established traffic carrier in the same world";
    contract.requiredVisibleEvidence = structuredObservableEvidence("urban_world_carrier_present", contract, "world_carrier_traffic");
  }

  if (structure === "WITHHOLD_REVEAL" && intent === "DAILY_STYLING" && shotIndex === 2) {
    whatHappens = "She continues outside after the completed doorway crossing; the complete outfit and worn product enter ordinary street use while the exterior-side doorway edge still partly withholds the relationship.";
    whyItHappens = "The single crossing has completed, so the next beat carries the resolved look into the first lived movement outside.";
    whatChanges = "The complete outfit remains in ordinary street use outside while the exterior-side doorway edge continues to partly withhold the worn relationship.";
    causalFromPrevious = "The one doorway crossing in the preceding beat puts her outside before this ordinary street movement begins.";
    perceptualTarget = "complete outfit entering ordinary street use while the reveal remains withheld";
    framingHint = "medium-lower view from the street with the doorway edge as an exterior foreground after the completed crossing";
    contract.requiredVisibleEvidence = structuredObservableEvidence("daily_lived_use_withheld", contract, "character");
  }

  if (structure === "WITHHOLD_REVEAL" && intent === "DAILY_STYLING" && shotIndex === 1) {
    whatHappens = "She begins inside the private entryway, opens the doorway, crosses the threshold once, and ends outside as the doorway edge briefly withholds part of the completed look.";
    whyItHappens = "The completed styling decision enters ordinary life through this single, visible interior-to-exterior crossing.";
    whatChanges = "The same beat starts inside, completes one doorway crossing, and ends outside; the doorway edge partly withholds the worn relationship during that crossing.";
    causalFromPrevious = "The resolved outfit and closed doorway from the previous beat make this one crossing the next practical event.";
    perceptualTarget = "one explicit inside-to-outside crossing with a partial worn relationship";
    contract.requiredVisibleEvidence = [
      ...structuredObservableEvidence("daily_threshold_crossing", contract, "home_threshold"),
      ...structuredObservableEvidence("daily_withheld_relationship", contract, "character"),
    ];
  }

  if (intent === "PRODUCT_CRAFT") {
    const relationship = "visible surface, edge, and worn-structure relationship shown by the confirmed product references";
    if (structure === "RITUAL_COMPLETION" && shot.eventFunction === "TASK_COMPLETE") {
      const completionEvidence = contract.requiredVisibleEvidence.find((evidence) => evidence.id === "ritual_completion_action_result");
      if (completionEvidence) {
        whyItHappens = "The already-supported garment-check action visibly finishes before the settled worn result enters practical use.";
        whatChanges = contract.effects
          .filter((effect) => effect.entityId === "character" || effect.entityId === "preparation_surface")
          .map((effect) => `${effect.entityId}.${effect.attribute} changes from ${effect.fromValue} to ${effect.toValue}.`)
          .join(" ");
        perceptualTarget = "the hand leaves the completed garment check and the hem remains settled in the grounded worn state";
      } else {
        whatHappens = `She completes the preparation task as its result makes the ${relationship} readable in the ready-to-wear structure.`;
        whyItHappens = "The task's physical result makes a confirmed product relationship observable before it enters use.";
        whatChanges = `The task result becomes a readable ${relationship} within the product's worn structure.`;
        perceptualTarget = "preparation result expressed through a confirmed product relationship";
        contract.requiredVisibleEvidence = structuredObservableEvidence("product_relationship_result", contract, "character");
      }
    } else if (structure === "WITHHOLD_REVEAL" && shot.eventFunction === "REVEAL_CAUSE") {
      whatHappens = `She turns clear of the same established foreground edge, making the ${relationship} readable within the worn structure without a product insert.`;
      whyItHappens = "The reveal resolves the existing partial view by exposing one reference-supported product relationship in use.";
      whatChanges = `The reference-confirmed ${relationship} changes from partly withheld to readable in the same human-scale frame.`;
      perceptualTarget = "confirmed product relationship released from the existing occlusion";
      contract.requiredVisibleEvidence = structuredObservableEvidence("product_relationship_revealed", contract, "character");
    }
    if (shotIndex === 2 && structure === "WITHHOLD_REVEAL") {
      whatHappens = "She continues the existing practical movement while the foreground edge still partly withholds the visible surface, edge, and worn-structure relationship shown by the confirmed product references.";
      whyItHappens = "The withheld relationship remains part of active use, so the later reveal has one specific product fact to resolve.";
      whatChanges = "The confirmed product relationship remains partially withheld within the worn structure; camera distance does not create the meaning.";
      perceptualTarget = "reference-supported product structure still partly withheld during real use";
      contract.requiredVisibleEvidence = structuredObservableEvidence("product_relationship_remains_withheld", contract, "character");
    }
  }

  const environmentEffects = contract.effects.filter((effect) => effect.cause === "ENVIRONMENT");
  const actionEffects = contract.effects.filter((effect) => effect.cause === "ACTION");
  const actor: CommercialEventShot["physicalEvent"]["actor"] = structure === "WORLD_OBSERVES_SUBJECT" && shotIndex === 4
    ? "WORLD"
    : environmentEffects.length && actionEffects.length
    ? "JOINT" : environmentEffects.length ? "WORLD" : "HUMAN";
  const primary = [...contract.effects].reverse().find((effect) => effect.fromValue !== effect.toValue);
  const resource = environmentEffects.find((effect) => effect.entityId !== "character")?.entityId
    ?? (primary?.entityId && primary.entityId !== "character"
    ? primary.entityId
    : contract.preconditions.find((requirement) => requirement.entityId !== "character")?.entityId ?? (actor === "HUMAN" ? "character" : null));
  const requiredWorldResources = [...new Set([
    ...contract.preconditions.map((requirement) => requirement.entityId),
    ...contract.effects.map((effect) => effect.entityId),
  ])].filter((entityId) => entityId !== "character" && worldModel.entities.some((entity) => entity.id === entityId));
  const eventPurpose = intent === "DAILY_STYLING"
    ? "a completed styling decision enters ordinary human use in a lived environment"
    : intent === "QUIET_LUXURY"
      ? "a restrained relationship between the person and the existing quiet world, light, and reflection"
      : intent === "PRODUCT_CRAFT"
        ? structure === "RITUAL_COMPLETION"
          ? "a preparation task's physical result makes a reference-confirmed product relationship readable in use"
          : structure === "WITHHOLD_REVEAL"
            ? "a reference-confirmed product or material relationship becomes legible from the existing partial view"
            : structure === "ICONIC_IMAGE"
              ? "a reference-confirmed product relationship becomes the final image meaning within the worn structure"
              : "a reference-confirmed product relationship is observed within real use"
        : shot.eventFunction.replace(/_/g, " ").toLowerCase();
  const selectedContract = {
    ...contract,
    effects: contract.effects.map((effect) => ({ ...effect, sourceEventId: eventKind })),
    requiredVisibleEvidence: contract.requiredVisibleEvidence.map((evidence) => ({ ...evidence, sourceEventId: eventKind })),
    singleUseAction: contract.singleUseAction
      ? { ...contract.singleUseAction, sourceEventId: eventKind }
      : null,
  };
  return {
    ...shot,
    eventKind,
    whatHappens,
    whyItHappens,
    whatChanges,
    actionClass,
    causalFromPrevious,
    framingHint,
    perceptualTarget,
    stateContract: selectedContract,
    physicalEvent: {
      eventFamily: eventKind,
      actor,
      primaryStateChanged: primary ? `${primary.entityId}.${primary.attribute}:${primary.fromValue ?? "unknown"}->${primary.toValue}` : "none declared",
      requiredResource: resource,
      eventPurpose,
      supportedIntent: intent,
      supportedEventFunctions: [shot.eventFunction],
      requiredWorldResources,
      requiredStartState: selectedContract.preconditions.map((requirement) => ({ ...requirement })),
      producedEndState: selectedContract.effects.map((effect) => ({ ...effect })),
      humanActionRequirement: actionEffects.length || actor === "HUMAN" ? "REQUIRED" : "NONE",
      worldChangeRequirement: environmentEffects.length || actor === "WORLD" ? "REQUIRED" : "OPTIONAL",
      productCompatibility: productRole,
      takeCompatibility: {
        cameraState: shot.cameraState,
        actionContinuity: shot.actionContinuity,
        actionSequenceId: shot.actionSequenceId,
        actionRequiresFreshSetup: shot.actionRequiresFreshSetup,
        takeBoundary: shot.takeBoundary,
        timeGapSeconds: shot.timeGapSeconds,
      },
    },
  };
}

/** Reusable function grammar: structure controls how existing Event Spine facts are read. */
export const COMMERCIAL_EVENT_FUNCTIONS_BY_STRUCTURE: Record<CommercialAdvertisingStructureId, CommercialEventFunction[]> = {
  PURSUIT_RELEASE: ["ESTABLISH_MOVEMENT", "BUILD_MOVEMENT", "CONTINUE_PRESSURE", "RELEASE_CHANGE", "AFTER_RELEASE"],
  CONTRAST_SHIFT: ["ESTABLISH_STATE", "CONTINUE_STATE", "PERCEPTUAL_SHIFT", "CONTRAST_PEAK", "RESOLVE_CHANGED_STATE"],
  WITHHOLD_REVEAL: ["ESTABLISH_CONTEXT", "PARTIAL_INFORMATION", "CONTINUE_WITHHOLD", "REVEAL_CAUSE", "INTEGRATED_RESOLUTION"],
  RITUAL_COMPLETION: ["TASK_BEGIN", "TASK_PROGRESS", "TASK_COMPLETE", "RESULT_IN_USE", "LIVED_RESOLUTION"],
  WORLD_OBSERVES_SUBJECT: ["SUBJECT_ESTABLISHED", "WORLD_CARRIER_PRESENT", "WORLD_CHANGE", "SUBJECT_REMAINS_SELF_DIRECTED", "WORLD_AFTERIMAGE"],
  ICONIC_IMAGE: ["IMAGE_FOUNDATION", "IMAGE_BUILD", "RELATIONSHIP_BUILD", "IMAGE_COMPLETE", "ICONIC_RESOLUTION"],
};

export function eventFunctionSequence(structure: CommercialAdvertisingStructureId) {
  return COMMERCIAL_EVENT_FUNCTIONS_BY_STRUCTURE[structure];
}
