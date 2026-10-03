import type { CommercialFilmPlan } from "../types";
import type { CommercialDirectorConceptId } from "../director-concept/types";
import {
  V14_CARRIER_CATEGORY,
  V14_DEVICE_CARRIER_POOLS,
  V14_ENDING_IMAGES,
  V14_ENDING_MEANINGS,
  V14_INTENT_EVENT_TWEAKS,
  V14_INTENT_EXTRA_CARRIERS,
  V14_WORLD_MOVES_CARRIERS_BY_INTENT,
  V14_WORLD_MOVES_INTENT_CARRIERS,
  V14_MOMENT_INTERRUPTIONS,
  V14_MOMENT_MEMORY_REASONS,
  V14_MOMENT_CARRIER_POOLS,
  V14_MOMENT_VARIANTS,
  V14_PROPOSITION_CONCEPT_TURN,
  V14_PROPOSITION_INTENT_CORE,
  V14_SIGNATURE_EVENT_MECHANISMS,
  V14_STRUCTURE_BY_CONCEPT,
  V14_STRUCTURE_DEFINITIONS,
  V14_TENSION_BY_INTENT,
  V14_TITLE_BY_CONCEPT,
  V14_TITLE_BY_INTENT_AND_CONCEPT,
  V14_VISUAL_PRIORITY_BY_ROLE,
} from "./catalog";
import {
  COMMERCIAL_CREATIVE_DIRECTING_SCHEMA_VERSION,
  COMMERCIAL_CREATIVE_DIRECTING_VERSION,
  type CommercialCreativeTreatmentAuthorityInput,
  type CommercialCreativeTreatment,
  type CommercialCreativeTreatmentQcGate,
  type CommercialDeviceArcBeat,
  type CommercialSignatureMoment,
  type CommercialSignatureEvent,
  type CommercialStructureBeat,
  type CommercialV14EventBeat,
  type CommercialV14VisualPriority,
} from "./types";
import { productVisibilityGoalForState } from "../product-visibility";
import {
  buildCommercialTreatmentSemanticFingerprint,
  propositionCore,
  semanticSimilarity,
} from "./semantic";
import {
  synthesizeProposition,
  synthesizeSignatureMoment,
} from "./synthesis";

const CONCEPT_ORDER: CommercialDirectorConceptId[] = [
  "STATIC_CAMERA_FILM",
  "PARTIAL_OBSCURATION",
  "EDGE_OF_FRAME",
  "THRESHOLD_CHAIN",
  "REFLECTION_WORLD",
  "LIGHT_REVEAL",
  "WORLD_MOVES_SUBJECT_SETTLES",
  "REPEATED_GESTURE",
];
const INTENT_ORDER: CommercialFilmPlan["commercialIntent"][] = [
  "URBAN_MOTION",
  "DAILY_STYLING",
  "QUIET_LUXURY",
  "PRODUCT_CRAFT",
  "NEW_ARRIVAL",
];

const DEVICE_STATE_BY_CONCEPT: Record<CommercialDirectorConceptId, string[]> = {
  STATIC_CAMERA_FILM: ["waiting", "entering", "observing", "settling", "holding"],
  PARTIAL_OBSCURATION: ["withheld", "partly clear", "interrupted", "direct", "receding"],
  EDGE_OF_FRAME: ["near edge", "found at edge", "edge shifts", "stable off-center", "edge holds"],
  THRESHOLD_CHAIN: ["approach", "crossing", "new side", "threshold settles", "boundary holds"],
  REFLECTION_WORLD: ["indirect", "layered", "fragmenting", "direct", "reflection remains"],
  LIGHT_REVEAL: ["shadowed", "light enters", "material appears", "stable light", "light remains"],
  WORLD_MOVES_SUBJECT_SETTLES: ["moving world", "world continues", "body slows", "settled body", "world remains"],
  REPEATED_GESTURE: ["first gesture", "return", "variation", "recognition", "afterimage"],
};

function conceptIndex(concept: CommercialDirectorConceptId) {
  return CONCEPT_ORDER.indexOf(concept);
}

function intentIndex(intent: CommercialFilmPlan["commercialIntent"]) {
  return INTENT_ORDER.indexOf(intent);
}

function executedReflectionBeatIndex(plan: CommercialFilmPlan) {
  return plan.eventSpine.shots.findIndex((shot) => (
    /reflection|window glass/i.test(shot.whatHappens)
    && shot.stateContract.effects.some((effect) => (
      effect.fromValue !== effect.toValue
      && (/reflection|glass/i.test(effect.attribute)
        || /reflection|glass/i.test(plan.eventSpine.worldModel.entities.find((entity) => entity.id === effect.entityId)?.label ?? ""))
    ))
  ));
}

function executedCarrierStateChangeBeatIndex(plan: CommercialFilmPlan, resourceId?: string | null) {
  const entityId = resourceId?.startsWith("entity:") ? resourceId.slice("entity:".length) : null;
  if (!entityId) return -1;
  return plan.eventSpine.shots.findIndex((shot) => (
    shot.physicalEvent.requiredResource === entityId
    && shot.stateContract.effects.some((effect) => (
      effect.entityId === entityId && effect.fromValue !== effect.toValue
    ))
  ));
}

function executedOcclusionReleaseBeatIndex(
  plan: CommercialFilmPlan,
  resourceId?: string | null
) {
  const carrierId = resourceId?.replace(/^entity:/, "");
  if (!carrierId) return -1;
  return plan.eventSpine.shots.findIndex((shot) => {
    const eventUsesCarrier = shot.physicalEvent.requiredResource === carrierId
      || shot.physicalEvent.requiredWorldResources.includes(carrierId);
    const releasesOcclusion = shot.physicalEvent.eventFamily === "FOREGROUND_OCCLUSION_RELEASED";
    const hasReadableTransition = shot.stateContract.effects.some((effect) => (
      effect.fromValue !== effect.toValue
      && effect.attribute === "visualAccess"
      && effect.fromValue === "partly withheld"
      && effect.toValue === "readable"
    ));
    return eventUsesCarrier && releasesOcclusion && hasReadableTransition;
  });
}

function executedResourceChangeBeatIndex(
  plan: CommercialFilmPlan,
  resource?: { id: string; label: string } | null
) {
  if (!resource) return -1;
  const entityId = resource.id.replace(/^entity:/, "");
  const label = resource.label.toLowerCase().replace(/\s+/g, " ").trim();
  return plan.eventSpine.shots.findIndex((shot) => shot.stateContract.effects.some((effect) => {
    if (effect.fromValue === effect.toValue) return false;
    if (effect.entityId === entityId) return true;
    const evidence = `${effect.entityId} ${effect.attribute} ${effect.fromValue} ${effect.toValue} ${effect.reason}`
      .toLowerCase()
      .replace(/\s+/g, " ");
    return Boolean(label && evidence.includes(label));
  }));
}

// Use architecture already named by the selected Scene World. A device cannot introduce a
// storefront, pedestrian, mirror, or new location merely to make a carrier list diverse.
function groundedDeviceCarrier(plan: CommercialFilmPlan): string | null {
  const facts = [
    ...plan.sceneWorld.sceneIds,
    ...plan.sceneWorld.sceneNames,
    ...plan.sceneWorld.spatialAnchors,
  ].join(" ").toLowerCase();
  if (plan.directorConcept.concept === "REFLECTION_WORLD") {
    if (/entryway.mirror|entryway mirror/.test(facts)) return "entryway mirror";
    if (/window/.test(facts)) return "window glass";
    if (/storefront|cafe.frontage|cafe.exterior/.test(facts)) return "storefront glass";
    if (/dressing surface/.test(facts)) return "polished surface";
    return null;
  }
  if (plan.directorConcept.concept === "LIGHT_REVEAL") {
    return /window/.test(facts) ? "window" : "light falloff";
  }
  return null;
}

function ensureSentence(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  const capitalized = /^[a-z]/.test(normalized)
    ? `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`
    : normalized;
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

function choose<T>(values: T[], seed: number) {
  return values[((seed % values.length) + values.length) % values.length];
}

function selectMomentCarrier(
  concept: CommercialDirectorConceptId,
  intent: CommercialFilmPlan["commercialIntent"],
  nonce: number
) {
  const carriers = V14_MOMENT_CARRIER_POOLS[concept];
  const index = (nonce + conceptIndex(concept) + intentIndex(intent)) % carriers.length;
  return concept === "WORLD_MOVES_SUBJECT_SETTLES"
    ? carriers[index]
    : carriers[index];
}

function buildSignatureMoment(
  plan: CommercialFilmPlan,
  nonce: number,
  authority?: CommercialCreativeTreatmentAuthorityInput
): CommercialSignatureMoment {
  const concept = plan.directorConcept.concept;
  const quietWorldObserved = plan.commercialIntent === "QUIET_LUXURY"
    && plan.eventSpine.advertisingStructure === "WORLD_OBSERVES_SUBJECT";
  const craftIconicMeaning = plan.commercialIntent === "PRODUCT_CRAFT"
    && plan.eventSpine.advertisingStructure === "ICONIC_IMAGE";
  const executedReflectionIndex = concept === "REFLECTION_WORLD" ? executedReflectionBeatIndex(plan) : -1;
  const executedLightCarrierChangeIndex = concept === "LIGHT_REVEAL"
    ? executedCarrierStateChangeBeatIndex(plan, authority?.primaryResource?.id)
    : -1;
  const executedOcclusionReleaseIndex = concept === "PARTIAL_OBSCURATION"
    ? executedOcclusionReleaseBeatIndex(plan, authority?.primaryResource?.id)
    : -1;
  const executedBoundResourceChangeIndex = executedResourceChangeBeatIndex(
    plan,
    authority?.primaryResource
  );
  const signatureBeatIndex = craftIconicMeaning
    ? 3
    : concept === "LIGHT_REVEAL" && executedLightCarrierChangeIndex >= 0
    ? executedLightCarrierChangeIndex
    : concept === "PARTIAL_OBSCURATION" && executedOcclusionReleaseIndex >= 0
    ? executedOcclusionReleaseIndex
    : executedBoundResourceChangeIndex >= 0
    ? executedBoundResourceChangeIndex
    : quietWorldObserved
    ? 3
    : concept === "REFLECTION_WORLD" && executedReflectionIndex >= 0
    ? executedReflectionIndex
    : authority?.revealContract.revealBeatIndex
    ?? (concept === "REFLECTION_WORLD"
    ? 3
    : 1 + ((nonce + conceptIndex(concept) + intentIndex(plan.commercialIntent)) % 3));
  const location = concept === "LIGHT_REVEAL"
    ? plan.sceneWorld.spatialAnchors.find((anchor) => /window.*light|light.*window|light falloff/i.test(anchor))
      ?? plan.sceneWorld.spatialAnchors[signatureBeatIndex]
      ?? plan.sceneWorld.label
    : concept === "REFLECTION_WORLD"
    ? plan.sceneWorld.spatialAnchors.find((anchor) => /window|mirror|storefront|frontage|dressing surface/i.test(anchor))
      ?? plan.sceneWorld.spatialAnchors[signatureBeatIndex]
      ?? plan.sceneWorld.label
    : plan.sceneWorld.spatialAnchors[signatureBeatIndex] ?? plan.sceneWorld.label;
  const carrier = quietWorldObserved
    ? plan.eventSpine.worldModel.entities.find((entity) => entity.id === "window_light")?.label ?? "window light"
    : authority?.primaryResource?.label
    ?? groundedDeviceCarrier(plan)
    ?? selectMomentCarrier(concept, plan.commercialIntent, nonce);
  const synthesized = synthesizeSignatureMoment(
    plan,
    carrier,
    location,
    signatureBeatIndex,
    nonce,
    Boolean(authority?.primaryResource)
  );
  const centralEvent = plan.eventSpine.shots[signatureBeatIndex];
  const resource = centralEvent.physicalEvent.requiredResource;
  const stateChange = [...centralEvent.stateContract.effects].reverse().find((effect) => effect.fromValue !== effect.toValue);
  const stateChangeText = stateChange
    ? `${stateChange.entityId} ${stateChange.attribute} ${stateChange.fromValue} ${stateChange.toValue} ${stateChange.reason}`
      .toLowerCase()
      .replace(/\s+/g, " ")
    : "";
  const selectedResourceLabel = authority?.primaryResource?.label;
  const resourceLabel = concept === "PARTIAL_OBSCURATION"
    && signatureBeatIndex === executedOcclusionReleaseIndex
    && selectedResourceLabel
    ? selectedResourceLabel
    : selectedResourceLabel
    && stateChangeText.includes(selectedResourceLabel.toLowerCase().replace(/\s+/g, " ").trim())
    ? selectedResourceLabel
    : resource === "window_light" && ["REFLECTION_WORLD", "LIGHT_REVEAL"].includes(concept)
    ? synthesized.carrier
    : resource === "character"
    ? "her body"
    : plan.eventSpine.worldModel.entities.find((entity) => entity.id === resource)?.label ?? synthesized.carrier;
  const lightCarrierChange = concept === "LIGHT_REVEAL"
    ? centralEvent.stateContract.effects.find((effect) => (
      effect.entityId === authority?.primaryResource?.id.replace(/^entity:/, "")
      && effect.fromValue !== effect.toValue
    ))
    : undefined;
  const craftRitualMeaning = plan.commercialIntent === "PRODUCT_CRAFT"
    && plan.eventSpine.advertisingStructure === "RITUAL_COMPLETION";
  const arrivalMeaning = plan.commercialIntent === "NEW_ARRIVAL";
  const confirmedProductRelationship = centralEvent.productDetailRelationship
    ?? centralEvent.physicalEvent.eventPurpose;
  return {
    ...synthesized,
    id: `moment-${plan.commercialIntent.toLowerCase()}-${concept.toLowerCase()}-${signatureBeatIndex}`,
    momentDescription: centralEvent.whatHappens,
    beforeMoment: concept === "LIGHT_REVEAL" && lightCarrierChange
      ? `The registered ${resourceLabel} reflection is ${lightCarrierChange.fromValue}.`
      : quietWorldObserved
      ? `The subject's principal action is settled; ${resourceLabel} remains in its registered before state.`
      : craftIconicMeaning
      ? `The ${confirmedProductRelationship} is present during practical use before this event makes it the image's focal meaning.`
      : craftRitualMeaning
        ? `The preparation task is underway before completion makes the ${confirmedProductRelationship} readable.`
      : stateChange ? `${stateChange.entityId}.${stateChange.attribute} is ${stateChange.fromValue}.` : centralEvent.whyItHappens,
    visualInterruption: centralEvent.whatHappens,
    afterMoment: concept === "LIGHT_REVEAL" && lightCarrierChange
      ? `The registered ${resourceLabel} reflection becomes ${lightCarrierChange.toValue}.`
      : quietWorldObserved
      ? centralEvent.stateContract.effects.find((effect) => effect.cause === "ENVIRONMENT")?.toValue ?? centralEvent.whatChanges
      : craftIconicMeaning || craftRitualMeaning
      ? centralEvent.whatChanges
      : stateChange ? `${stateChange.entityId}.${stateChange.attribute} becomes ${stateChange.toValue}.` : centralEvent.whatChanges,
    mechanism: concept === "LIGHT_REVEAL" && lightCarrierChange
      ? `The existing ${resourceLabel} carries the reflected worn silhouette as the established body adjustment settles.`
      : quietWorldObserved
      ? centralEvent.whatHappens
      : craftIconicMeaning
      ? `The confirmed worn product relationship remains readable as she completes the existing settling event.`
      : synthesized.mechanism,
    memoryReason: concept === "LIGHT_REVEAL" && lightCarrierChange
      ? `The worn silhouette becomes legible in the same ${resourceLabel} before the direct view resolves.`
      : quietWorldObserved ? centralEvent.whatChanges : craftIconicMeaning ? centralEvent.whatChanges : synthesized.memoryReason,
    deviceRole: concept === "LIGHT_REVEAL" && lightCarrierChange
      ? `The registered ${resourceLabel} changes the reflected worn silhouette as the established body adjustment settles; the next beat gives a direct worn-product read.`
      : quietWorldObserved ? centralEvent.whatHappens : craftIconicMeaning ? centralEvent.whatHappens : synthesized.deviceRole,
    productRole: concept === "LIGHT_REVEAL" && lightCarrierChange
      ? `The ${resourceLabel} reflection changes from ${lightCarrierChange.fromValue} to ${lightCarrierChange.toValue}, making the worn silhouette legible before the direct view.`
      : quietWorldObserved
      ? `${centralEvent.whatHappens} ${centralEvent.whatChanges}`
      : craftIconicMeaning || craftRitualMeaning || arrivalMeaning
      ? `${centralEvent.whatHappens} ${centralEvent.whatChanges}`
      : synthesized.productRole,
    signatureBeatIndex,
    location: quietWorldObserved
      ? plan.sceneWorld.spatialAnchors[signatureBeatIndex] ?? plan.sceneWorld.label
      : concept === "PARTIAL_OBSCURATION" && signatureBeatIndex === executedOcclusionReleaseIndex
      ? plan.sceneWorld.spatialAnchors[signatureBeatIndex] ?? plan.sceneWorld.label
      : plan.sceneWorld.spatialAnchors[2] ?? plan.sceneWorld.label,
    carrier: resourceLabel,
  };
}

function buildDeviceArc(
  plan: CommercialFilmPlan,
  nonce: number,
  signatureMoment: CommercialSignatureMoment,
  authority?: CommercialCreativeTreatmentAuthorityInput
): CommercialDeviceArcBeat[] {
  const concept = plan.directorConcept.concept;
  const intent = plan.commercialIntent;
  const carriers = concept === "WORLD_MOVES_SUBJECT_SETTLES"
    ? V14_WORLD_MOVES_CARRIERS_BY_INTENT[intent]
    : V14_DEVICE_CARRIER_POOLS[concept];
  const states = DEVICE_STATE_BY_CONCEPT[concept];
  const stableCarrier = groundedDeviceCarrier(plan);
  const authoritativeCarrier = authority?.primaryResource?.label ?? null;
  if (intent === "QUIET_LUXURY" && plan.eventSpine.advertisingStructure === "WORLD_OBSERVES_SUBJECT") {
    const carrier = signatureMoment.carrier;
    const intensityPattern = ["LOW", "MEDIUM", "HIGH", "CLEAR", "MEDIUM"] as const;
    return plan.eventSpine.shots.map((shot, index) => ({
      beatIndex: index,
      deviceState: shot.whatChanges,
      deviceCarrier: carrier,
      deviceIntensity: intensityPattern[index],
      deviceFunction: `${shot.whatHappens} ${shot.whatChanges}`,
    }));
  }
  if (intent === "PRODUCT_CRAFT" && plan.eventSpine.advertisingStructure === "RITUAL_COMPLETION") {
    const carrier = authoritativeCarrier ?? stableCarrier ?? signatureMoment.carrier;
    const intensityPattern = ["LOW", "MEDIUM", "HIGH", "CLEAR", "MEDIUM"] as const;
    return plan.eventSpine.shots.map((shot, index) => ({
      beatIndex: index,
      deviceState: shot.whatChanges,
      deviceCarrier: carrier,
      deviceIntensity: intensityPattern[index],
      deviceFunction: `${shot.whatHappens} ${shot.whatChanges}`,
    }));
  }
  if (concept === "LIGHT_REVEAL" && authoritativeCarrier) {
    const carrierEntityId = authority?.primaryResource?.id.replace(/^entity:/, "");
    return plan.eventSpine.shots.map((shot, index) => {
      const carrierChange = shot.stateContract.effects.find((effect) => (
        effect.entityId === carrierEntityId && effect.fromValue !== effect.toValue
      ));
      const visibility = authority?.productVisibilityTimeline[index]?.normalizedState
        ?? plan.productVisibilityPlan.presenceByShot[index]
        ?? "IMPLIED";
      return {
        beatIndex: index,
        deviceState: carrierChange
          ? carrierChange.toValue
          : `${visibility.toLowerCase()} under steady window light`,
        deviceCarrier: authoritativeCarrier,
        deviceIntensity: (["LOW", "MEDIUM", "HIGH", "CLEAR", "MEDIUM"] as const)[index],
        deviceFunction: carrierChange
          ? `The registered ${authoritativeCarrier} reflection changes from ${carrierChange.fromValue} to ${carrierChange.toValue} through the source event: ${shot.whatHappens}`
          : `The registered ${authoritativeCarrier} remains in its existing state as the source event leaves the worn relationship ${visibility.toLowerCase()}: ${shot.whatHappens}`,
      };
    });
  }
  if (authoritativeCarrier) {
    const intentPurpose = V14_INTENT_EVENT_TWEAKS[intent].reveal;
    return states.map((state, index) => ({
      beatIndex: index,
      deviceState: concept === "REFLECTION_WORLD" && index === 4
        && !EXIT_ACTION.test(plan.shotArchitecture.shots[4]?.event.whatHappens ?? "")
        ? "reflection recedes"
        : state,
      deviceCarrier: authoritativeCarrier,
      deviceIntensity: (["LOW", "MEDIUM", "HIGH", "CLEAR", "MEDIUM"] as const)[index],
      deviceFunction: index === signatureMoment.signatureBeatIndex
        ? `The existing ${authoritativeCarrier} changes its visible state once as the source action completes. ${intentPurpose}`
        : `The existing ${authoritativeCarrier} remains the single physical resource while its ${state} state changes what is readable. ${intentPurpose}`,
    }));
  }
  if ((concept === "REFLECTION_WORLD" || concept === "LIGHT_REVEAL") && stableCarrier) {
    const intentPurpose = V14_INTENT_EVENT_TWEAKS[intent].reveal;
    return states.map((state, index) => ({
      beatIndex: index,
      deviceState: concept === "REFLECTION_WORLD" && index === 4
        && !EXIT_ACTION.test(plan.shotArchitecture.shots[4]?.event.whatHappens ?? "")
        ? "reflection recedes"
        : state,
      deviceCarrier: stableCarrier,
      deviceIntensity: (["LOW", "MEDIUM", "HIGH", "CLEAR", "MEDIUM"] as const)[index],
      deviceFunction: index === signatureMoment.signatureBeatIndex
        ? `The existing ${stableCarrier} changes the visible relationship once as the source action completes. ${intentPurpose}`
        : concept === "REFLECTION_WORLD" && index === 4
          && !EXIT_ACTION.test(plan.shotArchitecture.shots[4]?.event.whatHappens ?? "")
          ? `The indirect image in the existing ${stableCarrier} recedes while the person remains in the final source-event position.`
        : `Hold the existing ${stableCarrier} in the same scene; its ${state} state changes what is readable.`,
    }));
  }
  const offset = (nonce + intentIndex(intent) * 2) % carriers.length;
  const rotatedCarriers = states.map((_, index) => carriers[(offset + index) % carriers.length]);
  const selectedCarriers = rotatedCarriers;
  const uniqueCarriers = [...selectedCarriers];
  const fallbackCarriers = carriers;
  const usedCarriers = new Set<string>([signatureMoment.carrier]);
  uniqueCarriers[signatureMoment.signatureBeatIndex] = signatureMoment.carrier;
  for (let index = 0; index < uniqueCarriers.length; index += 1) {
    if (index === signatureMoment.signatureBeatIndex) continue;
    if (usedCarriers.has(uniqueCarriers[index])) {
      uniqueCarriers[index] = fallbackCarriers.find((carrier) => !usedCarriers.has(carrier)) ?? uniqueCarriers[index];
    }
    usedCarriers.add(uniqueCarriers[index]);
  }
  const intensityPattern = ["LOW", "MEDIUM", "HIGH", "CLEAR", "MEDIUM"] as const;
  const intentPurpose = V14_INTENT_EVENT_TWEAKS[intent].reveal;
  const rotatedIntensity = intensityPattern.map((_, index) => (
    index === signatureMoment.signatureBeatIndex
      ? "HIGH"
      : intensityPattern[(index + nonce) % intensityPattern.length]
  ));
  return states.map((state, index) => ({
    beatIndex: index,
    deviceState: index === signatureMoment.signatureBeatIndex ? "signature moment" : state,
    deviceCarrier: uniqueCarriers[index],
    deviceIntensity: rotatedIntensity[index],
    deviceFunction: index === signatureMoment.signatureBeatIndex
      ? `Hold the strongest visual change of the film inside this carrier. ${intentPurpose}`
      : index === 0
      ? `Establish the principle through the ${uniqueCarriers[index]}. ${intentPurpose}`
      : index === 1
        ? `Change the carrier to the ${uniqueCarriers[index]} while keeping the same principle. ${intentPurpose}`
        : index === 2
          ? `Interrupt the pattern with the ${uniqueCarriers[index]} before the reveal. ${intentPurpose}`
          : index === 3
            ? `Resolve the principle into a clear direct view through the ${uniqueCarriers[index]}. ${intentPurpose}`
            : `Leave the ${uniqueCarriers[index]} in the world after the subject moves or settles. ${intentPurpose}`,
  }));
}

function buildStructure(concept: CommercialDirectorConceptId): {
  structureType: CommercialCreativeTreatment["structureType"];
  structure: CommercialStructureBeat[];
} {
  const structureType = V14_STRUCTURE_BY_CONCEPT[concept];
  const definition = V14_STRUCTURE_DEFINITIONS[structureType];
  return {
    structureType,
    structure: definition.beats.map((beat, beatIndex) => ({
      beatIndex,
      ...beat,
    })),
  };
}

function structureTypeForAdvertisingIdea(plan: CommercialFilmPlan): CommercialCreativeTreatment["structureType"] {
  const map: Record<CommercialFilmPlan["creativeSpine"]["advertisingStructure"], CommercialCreativeTreatment["structureType"]> = {
    CONTRAST_SHIFT: "OBSERVE_APPROACH_CONTACT_RESOLVE_AFTERIMAGE",
    PURSUIT_RELEASE: "MOVE_MOVE_HOLD_SINGLE_ACTION_RELEASE",
    WITHHOLD_REVEAL: "OBSCURE_REVEAL_INTERRUPT_RESOLVE_DISAPPEAR",
    RITUAL_COMPLETION: "REPEAT_REPEAT_CHANGE_BREAK_HERO_RELEASE",
    WORLD_OBSERVES_SUBJECT: "OBSERVE_APPROACH_CONTACT_RESOLVE_AFTERIMAGE",
    ICONIC_IMAGE: "ARRIVE_DISCOVER_INTERACT_SETTLE_REMAIN",
  };
  return map[plan.creativeSpine.advertisingStructure];
}

function endingImageFromFinalState(plan: CommercialFilmPlan) {
  const finalEvent = plan.shotArchitecture.shots[4]?.event;
  const physicalState = [finalEvent?.whatHappens, finalEvent?.whatChanges].filter(Boolean).join(" ");
  return ensureSentence(`In the existing final frame, ${physicalState} ${plan.creativeSpine.endingImageIntent}`);
}

function buildSignatureEvent(
  plan: CommercialFilmPlan,
  signatureMoment: CommercialSignatureMoment
): CommercialSignatureEvent {
  return {
    id: signatureMoment.id,
    family: `${plan.directorConcept.concept.toLowerCase()}-signature`,
    whoOrWhat: signatureMoment.carrier,
    action: signatureMoment.visualInterruption,
    where: signatureMoment.location,
    event: signatureMoment.momentDescription,
    cause: signatureMoment.beforeMoment,
    beforeState: signatureMoment.beforeMoment,
    afterState: signatureMoment.afterMoment,
    visualResult: signatureMoment.deviceRole,
    nextBeatTrigger: `The interruption resolves at the ${signatureMoment.location}.`,
    nextBeatConsequence: signatureMoment.afterMoment,
    sourceShotIndex: signatureMoment.signatureBeatIndex,
    productConnection: signatureMoment.productRole,
    eventRevealLink: {
      eventResult: signatureMoment.afterMoment,
      revealChange: signatureMoment.productRole,
      causalConnection: signatureMoment.memoryReason,
    },
  };
}

function buildEventSequence(
  plan: CommercialFilmPlan,
  structure: CommercialStructureBeat[],
  deviceArc: CommercialDeviceArcBeat[],
  signatureMoment: CommercialSignatureMoment,
  signature: CommercialSignatureEvent,
  authority?: CommercialCreativeTreatmentAuthorityInput
): CommercialV14EventBeat[] {
  return structure.map((structureBeat, beatIndex) => {
    const sourceShot = plan.shotArchitecture.shots[beatIndex];
    const isSignatureBeat = beatIndex === signatureMoment.signatureBeatIndex;
    const visualPriority = V14_VISUAL_PRIORITY_BY_ROLE[structureBeat.sourceShotRole];
    const currentVisibility = authority?.productVisibilityTimeline[beatIndex]?.normalizedState;
    const previousVisibility = authority?.productVisibilityTimeline[beatIndex - 1]?.normalizedState;
    const hasVisibilityTransition = Boolean(currentVisibility && currentVisibility !== previousVisibility
      && ["READABLE", "DETAIL", "HERO"].includes(currentVisibility));
    const productRevealCause = (isSignatureBeat && hasVisibilityTransition)
      ? signature.productConnection
      : null;
    return {
      beatIndex,
      structureRole: structureBeat.structureRole,
      sourceShotRole: structureBeat.sourceShotRole,
      sourceEvent: sourceShot.event.whatHappens,
      cause: isSignatureBeat ? signature.cause : sourceShot.event.whatHappens,
      event: isSignatureBeat ? signature.event : sourceShot.event.whatHappens,
      visualResult: isSignatureBeat
        ? signature.visualResult
        : sourceShot.event.whatChanges,
      beforeState: isSignatureBeat
        ? signature.beforeState
        : sourceShot.event.whatHappens,
      afterState: isSignatureBeat
        ? signature.afterState
        : sourceShot.event.whatChanges,
      nextBeatTrigger: isSignatureBeat
        ? signature.nextBeatTrigger
        : sourceShot.event.causalFromPrevious,
      nextBeatConsequence: isSignatureBeat
        ? signature.nextBeatConsequence
        : sourceShot.event.causalFromPrevious,
      productVisibilityGoal: structureBeat.productVisibilityGoal,
      productRevealCause,
      visualPriority,
    };
  });
}

function buildProductRevealLogic(
  treatment: Pick<CommercialCreativeTreatment, "signatureEvent" | "structure" | "eventSequence">
): CommercialCreativeTreatment["productRevealLogic"] {
  const revealBeat = treatment.eventSequence.find((beat) => beat.productRevealCause);
  const revealBeatIndex = revealBeat?.beatIndex ?? 3;
  return {
    cause: revealBeat?.productRevealCause ?? treatment.signatureEvent.productConnection,
    consequence: "The product becomes readable because the visual state changes at this exact moment, not because a shot slot requires it.",
    productVisibilityGoal: treatment.structure[revealBeatIndex]?.productVisibilityGoal ?? "Product readable at human scale.",
    revealBeatIndex,
    eventRevealLink: treatment.signatureEvent.eventRevealLink,
  };
}

const SUBJECT_EXIT = /\b(?:she (?:leaves|left|exits|is gone|steps out|moves out)|her (?:body|shadow) (?:exits|leaves)|after she (?:leaves|is gone)|empty (?:window )?(?:seat|floor|room|hallway|crossing))\b/i;
const EXIT_ACTION = /\b(?:exit|exits|leave|leaves|left|cross out|move out of frame|steps out)\b/i;

function finalEventAllowsExit(plan: CommercialFilmPlan) {
  const event = plan.shotArchitecture.shots[plan.shotArchitecture.shots.length - 1]?.event;
  return Boolean(event && EXIT_ACTION.test(event.whatHappens));
}

function concreteEndingImage(plan: CommercialFilmPlan, nonce: number, structure: CommercialStructureBeat[], deviceArc: CommercialDeviceArcBeat[]) {
  const images = V14_ENDING_IMAGES[plan.commercialIntent];
  const compatible = finalEventAllowsExit(plan) ? images : images.filter((image) => !SUBJECT_EXIT.test(image));
  if (compatible.length) return ensureSentence(choose(compatible, nonce + conceptIndex(plan.directorConcept.concept)));
  const finalEvent = plan.shotArchitecture.shots[plan.shotArchitecture.shots.length - 1]?.event;
  const finalRole = structure[structure.length - 1]?.structureRole;
  const carrier = deviceArc[deviceArc.length - 1]?.deviceCarrier;
  const indirectLayer = /REFLECTION_WORLD/.test(plan.directorConcept.concept)
    ? `The indirect reflection in the ${carrier} recedes while the person remains in the frame. `
    : "";
  return ensureSentence(`${indirectLayer}${finalEvent?.whatHappens ?? "The person remains in the final frame."} ${finalRole === "DISAPPEAR" && !indirectLayer ? `The image through the ${carrier} recedes; the person remains in the final state. ` : ""}${finalEvent?.whatChanges ?? "The light continues around the held composition."}`);
}

function endingMeaning(plan: CommercialFilmPlan) {
  return V14_ENDING_MEANINGS[plan.commercialIntent];
}

function evaluateTreatment(
  treatment: CommercialCreativeTreatment,
  plan: CommercialFilmPlan,
  authority?: CommercialCreativeTreatmentAuthorityInput
): CommercialCreativeTreatmentQcGate[] {
  const eventText = treatment.eventSequence.map((beat) => `${beat.cause} ${beat.event} ${beat.visualResult}`).join(" ");
  const genericWords = ["walking", "standing", "pause", "weight shift", "shoe visible", "leaves"];
  const specificEventCount = treatment.eventSequence.filter((beat) => beat.event.length > 42).length;
  const causalLinks = treatment.eventSequence.filter((beat) => beat.visualResult && beat.nextBeatTrigger).length;
  const consecutiveCarrierFailures = treatment.deviceArc.filter((beat, index, all) => (
    index >= 2
    && beat.deviceCarrier === all[index - 1].deviceCarrier
    && beat.deviceCarrier === all[index - 2].deviceCarrier
  )).length;
  const intensityCollapse = new Set(treatment.deviceArc.map((beat) => beat.deviceIntensity)).size < 3;
  const stateCollapse = new Set(treatment.deviceArc.map((beat) => beat.deviceState)).size < 3;
  const structureCollapse = new Set(treatment.structure.map((beat) => beat.structureRole)).size < 3;
  const abstractEnding = /^(?:resolve|release|settle|end|ending)$/i.test(treatment.endingImage.replace(/[.!?]/g, "").trim());
  const immediateRevealAllowed = Boolean(
    authority
    && plan.creativeSpine.revealStrategy === "IMMEDIATE"
    && authority.revealContract.revealBeatIndex === 1
  );
  const revealTooEarly = authority
    ? !immediateRevealAllowed && authority.revealContract.revealBeatIndex < 2
    : treatment.productRevealLogic.revealBeatIndex < 2;
  const finalEvent = treatment.eventSequence[treatment.eventSequence.length - 1]?.sourceEvent ?? "";
  const endingConflict = SUBJECT_EXIT.test(treatment.endingImage) && !EXIT_ACTION.test(finalEvent);
  const ambiguousDisappear = treatment.structure[treatment.structure.length - 1]?.structureRole === "DISAPPEAR"
    && !/\b(?:character|person|she|reflection|reflected|light|foreground|image|layer|body)\b/i.test(treatment.endingImage);
  const placeholderEvent = /\b(?:a passing object|a piece of passing street life|a foreground movement|a second gesture|an environmental element|background life|foreground life|environmental motion|held frame|something crosses|movement occurs)\b/i.test(treatment.signatureEvent.event);
  const unresolvedObject = /\b(?:something|object|element|figure|movement)\b/i.test(treatment.signatureEvent.whoOrWhat);
  const stateChanged = treatment.signatureEvent.beforeState !== treatment.signatureEvent.afterState
    && treatment.signatureEvent.beforeState.length > 12
    && treatment.signatureEvent.afterState.length > 12;
  const revealLinkConnected = Boolean(
    treatment.signatureEvent.eventRevealLink.eventResult
    && treatment.signatureEvent.eventRevealLink.revealChange
    && treatment.signatureEvent.eventRevealLink.causalConnection
  );
  const signatureBeat = plan.eventSpine.shots[treatment.signatureMoment.signatureBeatIndex];
  const signatureTimeline = plan.continuity.worldStateTimeline.find(
    (step) => step.shotIndex === treatment.signatureMoment.signatureBeatIndex
  );
  const signatureExecutionText = [
    signatureBeat?.eventKind,
    signatureBeat?.whatHappens,
    signatureBeat?.whyItHappens,
    signatureBeat?.whatChanges,
    ...((signatureBeat?.stateContract.effects ?? []).map((effect) => `${effect.actionId ?? ""} ${effect.actionLabel ?? ""} ${effect.attribute} ${effect.fromValue} ${effect.toValue}`)),
    ...((signatureBeat?.stateContract.effects ?? []).map((effect) => plan.eventSpine.worldModel.entities.find((entity) => entity.id === effect.entityId)?.label ?? "")),
    plan.actionPlan[treatment.signatureMoment.signatureBeatIndex]?.physicalActionLine,
  ].filter(Boolean).join(" ").toLowerCase();
  const signatureClaimText = [
    treatment.signatureMoment.momentDescription,
    treatment.signatureMoment.beforeMoment,
    treatment.signatureMoment.visualInterruption,
    treatment.signatureMoment.afterMoment,
    treatment.signatureEvent.action,
    treatment.signatureEvent.event,
  ].join(" ").toLowerCase();
  const claimsRepeatedGesture = /\b(?:repeat(?:s|ed|ing)?\s+(?:the\s+)?gesture|second gesture|same gesture|gesture.{0,24}again|twice)\b/.test(signatureClaimText);
  const repeatIsExecuted = /\b(?:repeat(?:s|ed|ing)?\s+(?:the\s+)?gesture|second gesture|same gesture|gesture.{0,24}again|twice)\b/.test(signatureExecutionText);
  const signatureHasStructuredStateEffect = Boolean(signatureBeat?.stateContract.effects.some(
    (effect) => effect.fromValue !== effect.toValue
  )) || Boolean(signatureTimeline && JSON.stringify(signatureTimeline.before) !== JSON.stringify(signatureTimeline.after));
  const claimsWorldChange = /\b(?:environment changes|world changes|light changes|reflection changes|reflection shifts|traffic changes|background changes)\b/.test(signatureClaimText);
  const worldChangeExecuted = Boolean(signatureBeat?.stateContract.effects.some(
    (effect) => effect.fromValue !== effect.toValue && effect.cause === "ENVIRONMENT"
  )) || Boolean(signatureBeat?.stateContract.effects.some(
    (effect) => effect.fromValue !== effect.toValue && effect.entityId !== "character"
  ));
  const claimsPhysicalCarrier = /\b(?:reflection|reflective|glass|light|pedestrian|vehicle|traffic|umbrella|foreground|mirror|carrier)\b/.test(signatureClaimText);
  const selectedCarrier = authority?.primaryResource?.label.toLowerCase() ?? "";
  const claimsCarrierChange = /\b(?:wardrobe plane|reflection|reflective image|glass|light|pedestrian|vehicle|traffic|umbrella|foreground carrier|mirror)\b.{0,45}\b(?:moves?|clears?|changes?|shifts?|crosses?|slides?|recedes?|opens?)\b/.test(signatureClaimText);
  const carrierChangeExecuted = Boolean(selectedCarrier)
    && signatureExecutionText.includes(selectedCarrier)
    && (signatureBeat?.stateContract.effects.some((effect) => effect.fromValue !== effect.toValue && effect.entityId !== "character")
      || /\b(?:moves?|clears?|changes?|shifts?|crosses?|slides?|recedes?|opens?)\b/.test(signatureExecutionText));
  const carrierIsGrounded = !claimsPhysicalCarrier || Boolean(authority?.primaryResource);
  const sourceActionChangesVisualState = /\b(?:shift|shifts|move|moves|cross|crosses|open|opens|close|closes|settle|settles|turn|turns|reach|reaches|complete|completes)\b/.test(signatureExecutionText);
  const signatureHasStateEffect = signatureHasStructuredStateEffect || sourceActionChangesVisualState;
  const signatureEventGrounded = Boolean(signatureBeat)
    && treatment.signatureEvent.sourceShotIndex === treatment.signatureMoment.signatureBeatIndex
    && (!claimsRepeatedGesture || repeatIsExecuted)
    && (plan.directorConcept.concept !== "REPEATED_GESTURE" || repeatIsExecuted)
    && (!claimsCarrierChange || carrierChangeExecuted
      || Boolean(["WORLD", "JOINT"].includes(signatureBeat?.physicalEvent.actor ?? "HUMAN") && signatureBeat?.stateContract.effects.some((effect) => effect.cause === "ENVIRONMENT" && effect.fromValue !== effect.toValue)));
  const signatureStateGrounded = signatureHasStateEffect
    && (!claimsWorldChange || worldChangeExecuted);
  const signatureResourceGrounded = carrierIsGrounded
    && (!claimsCarrierChange || carrierChangeExecuted
      || Boolean(["WORLD", "JOINT"].includes(signatureBeat?.physicalEvent.actor ?? "HUMAN") && signatureBeat?.stateContract.effects.some((effect) => effect.cause === "ENVIRONMENT" && effect.fromValue !== effect.toValue)));
  const deviceMatchesExecution = signatureEventGrounded && signatureStateGrounded && signatureResourceGrounded;
  const literalEnding = treatment.endingImage.length >= 45
    && /\b(?:camera|frame|street|room|door|window|floor|wall|traffic|pedestrian|light|curb|bench|chair)\b/i.test(treatment.endingImage);
  const propositionHasTension = treatment.creativeProposition.tension.from !== treatment.creativeProposition.tension.to
    && treatment.creativeProposition.tension.line.trim().length >= 35
    && treatment.propositionCore.split(/\s+/).filter(Boolean).length >= 6
    && !/moment matters because/i.test(treatment.creativeProposition.presentationText);
  const propositionIsOnlyConcept = semanticSimilarity(
    treatment.propositionCore,
    treatment.directorConcept
  ) > 0.84;
  const spineTreatmentConflict = treatment.productRole !== plan.creativeSpine.productRole
    || treatment.filmTension.line !== plan.creativeSpine.filmTension.line
    || treatment.endingStrategy !== plan.creativeSpine.endingImageStrategy
    || treatment.creativeProposition.presentationText !== ensureSentence(plan.creativeSpine.premise.text);
  const genericOnly = specificEventCount === 0
    && genericWords.some((word) => eventText.toLowerCase().includes(word));
  const add = (
    code: CommercialCreativeTreatmentQcGate["code"],
    passed: boolean,
    reason: string
  ): CommercialCreativeTreatmentQcGate => ({
    code,
    status: passed ? "PASS" : "FAIL",
    reason,
  });
  return [
    add("SIGNATURE_EVENT_MISSING", Boolean(treatment.signatureEvent.event), "One concrete signature event is present."),
    add("GENERIC_EVENT_CHAIN", specificEventCount >= 3 && !genericOnly, "The event sequence contains at least three concrete film events."),
    add("EVENT_CAUSALITY_TOO_WEAK", causalLinks >= 2, "At least two adjacent beats carry visual causality."),
    add("DEVICE_MECHANICAL_REPETITION", authority?.primaryResource
      ? true
      : ["REFLECTION_WORLD", "LIGHT_REVEAL"].includes(treatment.directorConceptId)
      ? treatment.deviceArc.every((beat, index, all) => index === 0 || beat.deviceState !== all[index - 1].deviceState)
      : consecutiveCarrierFailures === 0,
    "The device changes visibly rather than repeating an unchanged state."),
    add(
      "DEVICE_CARRIER_COLLAPSE",
      true,
      "Carrier diversity is a soft creative quality metric and is not an executable physical gate."
    ),
    add("DEVICE_CARRIER_SCENE_MISMATCH", authority?.primaryResource
      ? true
      : !["REFLECTION_WORLD", "LIGHT_REVEAL"].includes(treatment.directorConceptId)
      || Boolean(groundedDeviceCarrier(plan)
        && treatment.deviceArc.every((beat) => beat.deviceCarrier === groundedDeviceCarrier(plan))
        && treatment.signatureMoment.carrier === groundedDeviceCarrier(plan)),
    "The selected physical carrier belongs to the existing Scene World."),
    add("DEVICE_ARC_FLAT", !intensityCollapse && !stateCollapse, "The device changes state and intensity across the film."),
    add("STRUCTURE_FORCED_OVER_CONCEPT", !structureCollapse, "Shot roles follow the selected creative structure."),
    add("SHOT_ROLE_TEMPLATE_COLLAPSE", treatment.structure.length === 5, "All five creative beats have distinct functions."),
    add("UNNECESSARY_DETAIL_BEAT", treatment.structure.some((beat) => beat.sourceShotRole === "DETAIL"), "The detail beat is structurally justified."),
    add("UNNECESSARY_HERO_BEAT", treatment.structure.some((beat) => beat.sourceShotRole === "HERO"), "The hero beat is structurally justified."),
    add("FILM_STATE_DOES_NOT_CHANGE", treatment.filmTension.from !== treatment.filmTension.to, "The film changes visual state across the treatment."),
    add("PRODUCT_REVEAL_UNMOTIVATED", Boolean(treatment.productRevealLogic.cause), "The product reveal has a visible cause."),
    add("PRODUCT_REVEAL_TOO_EARLY", !revealTooEarly, "The product reveal is not assigned before a visual event can motivate it."),
    add("PRODUCT_REVEAL_TEMPLATE_DRIVEN", Boolean(authority) || treatment.productRevealLogic.consequence.includes("visual state changes"), "The product reveal is tied to the event sequence rather than shot role alone."),
    add("ENDING_IMAGE_ABSTRACT", !abstractEnding && literalEnding, "The ending is an observable final image."),
    add("ENDING_DUPLICATES_HERO", treatment.endingImage !== treatment.eventSequence[3].visualResult, "The ending is distinct from the hero result."),
    add("ENDING_NEW_UNRELATED_BEAT", treatment.endingImage.length >= 20 && !abstractEnding, "The ending completes the existing visual idea."),
    add("ENDING_SUBJECT_STATE_CONFLICT", !endingConflict, "The ending preserves the final source event's character state."),
    add("ENDING_DISAPPEAR_OBJECT_UNRESOLVED", !ambiguousDisappear, "The disappearing object is explicit."),
    add("GENERIC_COMMERCIAL_ACTION_CHAIN", specificEventCount >= 3, "The treatment is not a generic action chain."),
    add("SIGNATURE_EVENT_PLACEHOLDER", !placeholderEvent, "The signature event has no placeholder wording."),
    add("SIGNATURE_EVENT_NOT_FILMABLE", treatment.signatureEvent.where.length > 3 && treatment.signatureEvent.action.length > 10, "The signature event names a concrete action and location."),
    add("SIGNATURE_EVENT_OBJECT_UNRESOLVED", !unresolvedObject, "The signature event names a concrete object or person."),
    add("SIGNATURE_EVENT_NO_STATE_CHANGE", stateChanged, "The signature event changes an observable visual state."),
    add("PRODUCT_REVEAL_CAUSAL_DISCONNECT", revealLinkConnected, "The product reveal is connected to the signature event."),
    add("PROPOSITION_TEMPLATE_SCAFFOLD", propositionHasTension, "The proposition contains a specific tension or turn."),
    add("PROPOSITION_ONLY_PARAPHRASES_CONCEPT", !propositionIsOnlyConcept, "The proposition is more than a Director Concept paraphrase."),
    add("CREATIVE_SPINE_TREATMENT_SEMANTIC_CONFLICT", !spineTreatmentConflict, "V1.4 treatment projects the upstream Creative Spine idea, product role, tension, and ending purpose without replacing them."),
    add("SIGNATURE_EVENT_NOT_IN_EXECUTION", signatureEventGrounded, "Signature actions are present in the selected Event Spine beat."),
    add("SIGNATURE_STATE_CHANGE_NOT_IN_EXECUTION", signatureStateGrounded, "Signature state changes are supported by the selected beat's structured state transition."),
    add("SIGNATURE_RESOURCE_CHANGE_NOT_IN_EXECUTION", signatureResourceGrounded, "Signature carriers resolve to the selected physical resource or source event."),
    add("CREATIVE_DEVICE_EXECUTION_MISMATCH", deviceMatchesExecution, "The creative device makes no action, state, or carrier claim beyond execution authority."),
  ];
}

export function buildCommercialCreativeTreatment(
  plan: CommercialFilmPlan,
  generationNonce = 0,
  authority?: CommercialCreativeTreatmentAuthorityInput
): CommercialCreativeTreatment {
  const concept = plan.directorConcept.concept;
  const nonce = generationNonce;
  const tension = plan.creativeSpine.filmTension;
  const signatureMoment = buildSignatureMoment(plan, nonce, authority);
  const proposition = ensureSentence(synthesizeProposition(plan));
  const structureType = structureTypeForAdvertisingIdea(plan);
  const structureTemplate = V14_STRUCTURE_DEFINITIONS[structureType];
  const structure = authority
    ? structureTemplate.beats.map((beat, beatIndex) => ({
      ...beat,
      beatIndex,
      function: plan.creativeSpine.filmTension.line,
      productVisibilityGoal: productVisibilityGoalForState(
        authority.productVisibilityTimeline[beatIndex]?.normalizedState ?? "IMPLIED"
      ),
    }))
    : structureTemplate.beats.map((beat, beatIndex) => ({
      ...beat,
      beatIndex,
      function: plan.creativeSpine.filmTension.line,
      productVisibilityGoal: plan.creativeSpine.productPresenceByShot[beatIndex],
    }));
  const deviceArc = buildDeviceArc(plan, nonce, signatureMoment, authority);
  const signatureEvent = buildSignatureEvent(plan, signatureMoment);
  const eventSequence = buildEventSequence(plan, structure, deviceArc, signatureMoment, signatureEvent, authority);
  const preMomentEvents = eventSequence.slice(0, signatureMoment.signatureBeatIndex);
  const postMomentEvents = eventSequence.slice(signatureMoment.signatureBeatIndex + 1);
  const productRevealLogic = authority
    ? {
      cause: authority.revealContract.cause,
      consequence: authority.revealContract.requiredVisibleEvidence.join(" "),
      productVisibilityGoal: productVisibilityGoalForState(authority.revealContract.toVisibility),
      revealBeatIndex: authority.revealContract.revealBeatIndex,
      eventRevealLink: signatureEvent.eventRevealLink,
    }
    : buildProductRevealLogic({
      signatureEvent,
      structure,
      eventSequence,
    });
  const shotVisualPriorities = eventSequence.map((beat) => beat.visualPriority);
  const treatment: CommercialCreativeTreatment = {
    schemaVersion: COMMERCIAL_CREATIVE_DIRECTING_SCHEMA_VERSION,
    plannerVersion: COMMERCIAL_CREATIVE_DIRECTING_VERSION,
    commercialIntent: plan.commercialIntent,
    productRole: plan.creativeSpine.productRole,
    directorConceptId: concept,
    title: V14_TITLE_BY_INTENT_AND_CONCEPT[`${plan.commercialIntent}:${concept}`]
      ?? V14_TITLE_BY_CONCEPT[concept],
    signatureMoment,
    creativeProposition: {
      internalMeaning: `${proposition} ${tension.line}`,
      presentationText: proposition,
      tension,
    },
    propositionCore: propositionCore(proposition),
    directorConcept: plan.directorConcept.globalRule,
    cinematicDevice: plan.directorConcept.label,
    filmTension: tension,
    signatureEvent,
    preMomentEvents,
    postMomentEvents,
    eventSequence,
    deviceArc,
    structureType,
    structure,
    productRevealLogic,
    endingImage: endingImageFromFinalState(plan),
    endingStrategy: plan.creativeSpine.endingImageStrategy,
    endingMeaning: endingMeaning(plan),
    worldBehavior: plan.worldRealism.line,
    shotVisualPriorities,
    semanticFingerprint: {
      propositionCore: "",
      signatureEventMechanism: "",
      signatureEventObject: "",
      eventCausality: "",
      deviceArcProgression: "",
      productRevealCause: "",
      endingImageMechanism: "",
    },
    qc: [],
  };
  treatment.semanticFingerprint = buildCommercialTreatmentSemanticFingerprint(treatment);
  const qc = evaluateTreatment(treatment, plan, authority);
  treatment.qc = qc;
  treatment.failureReasons = qc
    .filter((gate) => gate.status === "FAIL")
    .map((gate) => `${gate.code}: ${gate.reason}`);
  return treatment;
}

export function buildCommercialV14VisualPriorities(
  treatment: CommercialCreativeTreatment
): CommercialV14VisualPriority[] {
  return treatment.shotVisualPriorities.map((priority) => ({ ...priority }));
}
