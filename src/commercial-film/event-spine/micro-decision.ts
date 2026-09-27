import type {
  CommercialEventStateContract,
  CommercialStateEffect,
  CommercialStateRequirement,
  CommercialWorldEntity,
  CommercialWorldModel,
  CommercialWorldStateTimeline,
} from "./world-state";
import { COMMERCIAL_WORLD_STATE_SCHEMA_VERSION, reduceCommercialWorldState } from "./world-state";

export const COMMERCIAL_MICRO_DECISION_SCHEMA_VERSION = "commercial-film/micro-decision-v1" as const;

/**
 * Optional contract for a Commercial Film whose idea is carried by one small
 * human decision. It binds "choice" to a state change that the picture shows.
 */

export type CommercialMicroDecisionInput = {
  routine: string;
  expectation: string;
  trigger: string;
  expectedAction: string;
  chosenAction: string;
  visibleConsequence: string;
  continuation: string;
  decisionBeatIndex: number;
  consequenceBeatIndex: number;
  /**
   * Structured state proof. The text fields above describe the decision; these
   * fields are the authoritative trigger, commitment, and observable result.
   */
  triggerState: CommercialStateRequirement;
  decisionPrecondition: CommercialStateRequirement;
  decisionEffect: CommercialStateEffect | null;
  consequencePrecondition: CommercialStateRequirement;
  consequenceEffect: CommercialStateEffect;
  chosenActionId: string;
  consequenceDecisionStatusRequirement: "COMMITTED";
  /**
   * Optional scenario state carried by the decision itself. This keeps a
   * decision scenario (for example a passing bus) executable without changing
   * the fixed five Commercial Film intents.
   */
  scenarioState?: {
    entities: CommercialWorldEntity[];
    beatEffects: Array<{
      beatIndex: number;
      effects: CommercialStateEffect[];
    }>;
  };
};

export type CommercialMicroDecisionContract = CommercialMicroDecisionInput & {
  schemaVersion: typeof COMMERCIAL_MICRO_DECISION_SCHEMA_VERSION;
  decisionStatus: "UNCOMMITTED" | "COMMITTED";
  committedAtBeatIndex: number;
};

export type CommercialMicroDecisionStatus =
  | "MICRO_DECISION_VALIDATED"
  | "MICRO_DECISION_FAILED"
  | "MICRO_DECISION_NOT_DECLARED";

export type CommercialMicroDecisionPlan = {
  schemaVersion: typeof COMMERCIAL_MICRO_DECISION_SCHEMA_VERSION;
  status: CommercialMicroDecisionStatus;
  contract: CommercialMicroDecisionContract | null;
  failureReasons: string[];
  scenarioWorldModel: CommercialWorldModel | null;
  scenarioTimeline: CommercialWorldStateTimeline | null;
};

export type CommercialMicroDecisionBeat = {
  shotIndex: number;
  stateContract: CommercialEventStateContract;
};

const REQUIRED_TEXT_FIELDS: Array<keyof Omit<CommercialMicroDecisionInput, "decisionBeatIndex" | "consequenceBeatIndex">> = [
  "routine",
  "expectation",
  "trigger",
  "expectedAction",
  "chosenAction",
  "visibleConsequence",
  "continuation",
];

const ALTERNATIVE_MARKERS = /\b(?:or|maybe|perhaps|either)\b/i;

function stateValueBefore(
  timeline: CommercialWorldStateTimeline,
  shotIndex: number,
  entityId: string,
  attribute: string
) {
  const step = timeline.find((entry) => entry.shotIndex === shotIndex);
  return step?.before.attributes[entityId]?.[attribute] ?? null;
}

function sameStateEffect(left: CommercialStateEffect, right: CommercialStateEffect) {
  return left.entityId === right.entityId
    && left.attribute === right.attribute
    && left.fromValue === right.fromValue
    && left.toValue === right.toValue;
}

function buildDecisionScenarioTimeline(input: {
  declaration: CommercialMicroDecisionInput;
  beats: CommercialMicroDecisionBeat[];
  timeline: CommercialWorldStateTimeline;
  worldModel?: CommercialWorldModel | null;
}): {
  timeline: CommercialWorldStateTimeline;
  worldModel: CommercialWorldModel | null;
  beats: CommercialMicroDecisionBeat[];
  conflicts: string[];
} {
  const scenario = input.declaration.scenarioState;
  if (!scenario) {
    return {
      timeline: input.timeline,
      worldModel: input.worldModel ?? null,
      beats: input.beats,
      conflicts: [],
    };
  }
  const baseModel = input.worldModel ?? {
    schemaVersion: COMMERCIAL_WORLD_STATE_SCHEMA_VERSION,
    entities: [],
  };
  const combinedModel: CommercialWorldModel = {
    schemaVersion: COMMERCIAL_WORLD_STATE_SCHEMA_VERSION,
    entities: [...baseModel.entities, ...scenario.entities],
  };
  const combinedBeats = input.beats.map((beat) => {
    const overlayEffects = scenario.beatEffects
      .filter((entry) => entry.beatIndex === beat.shotIndex)
      .flatMap((entry) => entry.effects);
    return {
      shotIndex: beat.shotIndex,
      stateContract: {
        ...beat.stateContract,
        effects: [...beat.stateContract.effects, ...overlayEffects],
      },
    };
  });
  const reduced = reduceCommercialWorldState({
    model: combinedModel,
    beats: combinedBeats,
  });
  return {
    timeline: reduced.timeline,
    worldModel: combinedModel,
    beats: combinedBeats,
    conflicts: reduced.conflicts.map((conflict) => (
      `MICRO_DECISION_SCENARIO_STATE_CONFLICT: ${conflict.code} at shot ${conflict.shotIndex + 1} on ${conflict.entityId ?? "state"}.${conflict.attribute ?? ""}`
    )),
  };
}

export function validateCommercialMicroDecision(input: {
  declaration: CommercialMicroDecisionInput;
  beats: CommercialMicroDecisionBeat[];
  timeline: CommercialWorldStateTimeline;
  worldModel?: CommercialWorldModel | null;
}): string[] {
  const failures: string[] = [];
  const { declaration, beats, timeline } = input;
  const decisionContext = buildDecisionScenarioTimeline(input);
  const decisionTimeline = decisionContext.timeline;
  const decisionBeats = decisionContext.beats;
  failures.push(...decisionContext.conflicts);

  REQUIRED_TEXT_FIELDS.forEach((field) => {
    const value = declaration[field];
    if (typeof value !== "string" || value.trim().length < 4) {
      failures.push(`MICRO_DECISION_FIELD_MISSING: "${field}" must be a readable description of the decision.`);
    }
  });
  if (typeof declaration.chosenActionId !== "string" || declaration.chosenActionId.trim().length < 2) {
    failures.push("MICRO_DECISION_CHOSEN_ACTION_ID_MISSING: the decision must record a generic chosen action token such as STAY or WAIT.");
  }
  if (ALTERNATIVE_MARKERS.test(declaration.chosenActionId ?? "")) {
    failures.push("MICRO_DECISION_CHOSEN_ACTION_ID_AMBIGUOUS: the chosen action token must be one committed action.");
  }
  if (declaration.consequenceDecisionStatusRequirement !== "COMMITTED") {
    failures.push("MICRO_DECISION_COMMITMENT_REQUIRED: the consequence precondition must require decisionStatus == COMMITTED.");
  }

  const beatIndexes = beats.map((beat) => beat.shotIndex);
  const decisionIndex = declaration.decisionBeatIndex;
  const consequenceIndex = declaration.consequenceBeatIndex;
  if (!beatIndexes.includes(decisionIndex)) {
    failures.push("MICRO_DECISION_BEAT_UNKNOWN: the decision beat index does not exist in the current beat chain.");
  }
  if (!beatIndexes.includes(consequenceIndex)) {
    failures.push("MICRO_DECISION_BEAT_UNKNOWN: the consequence beat index does not exist in the current beat chain.");
  }
  if (beatIndexes.includes(decisionIndex) && beatIndexes.includes(consequenceIndex) && consequenceIndex <= decisionIndex) {
    failures.push("MICRO_DECISION_ORDER: the visible consequence cannot happen at or before the decision beat.");
  }

  if (declaration.expectedAction && declaration.chosenAction
    && declaration.expectedAction.trim().toLowerCase() === declaration.chosenAction.trim().toLowerCase()) {
    failures.push("MICRO_DECISION_NO_CHOICE: the chosen action repeats the expectation instead of deciding against it.");
  }
  ["chosenAction", "visibleConsequence", "continuation"].forEach((field) => {
    const value = declaration[field as "chosenAction" | "visibleConsequence" | "continuation"];
    if (typeof value === "string" && ALTERNATIVE_MARKERS.test(value)) {
      failures.push(`MICRO_DECISION_UNRESOLVED_ALTERNATIVE: "${field}" still offers more than one outcome.`);
    }
  });

  const decisionBeat = decisionBeats.find((beat) => beat.shotIndex === decisionIndex);
  const consequenceBeat = decisionBeats.find((beat) => beat.shotIndex === consequenceIndex);
  if (decisionBeat && decisionBeat.stateContract.requiredVisibleEvidence.length === 0) {
    failures.push("MICRO_DECISION_TRIGGER_NOT_VISIBLE: the decision beat declares no visible evidence for the trigger.");
  }
  if (consequenceBeat) {
    if (consequenceBeat.stateContract.requiredVisibleEvidence.length === 0) {
      failures.push("MICRO_DECISION_CONSEQUENCE_NOT_VISIBLE: the consequence beat declares no visible evidence, so the consequence would exist only in the copy.");
    }
    if (consequenceBeat.stateContract.effects.length === 0) {
      failures.push("MICRO_DECISION_CONSEQUENCE_STATELESS: the consequence beat changes no world state, so the choice has no visible result.");
    }
  }

  if (decisionBeat && consequenceBeat) {
    const triggerValue = stateValueBefore(
      decisionTimeline,
      decisionIndex,
      declaration.triggerState.entityId,
      declaration.triggerState.attribute
    );
    if (triggerValue !== declaration.triggerState.value) {
      failures.push(
        `MICRO_DECISION_TRIGGER_STATE_MISMATCH: the structured trigger requires ${declaration.triggerState.value}, but the state before the decision is ${triggerValue ?? "undefined"}.`
      );
    }
    const decisionPreconditionValue = stateValueBefore(
      decisionTimeline,
      decisionIndex,
      declaration.decisionPrecondition.entityId,
      declaration.decisionPrecondition.attribute
    );
    if (decisionPreconditionValue !== declaration.decisionPrecondition.value) {
      failures.push(
        `MICRO_DECISION_PRECONDITION_MISMATCH: the decision requires ${declaration.decisionPrecondition.value}, but the state before the decision is ${decisionPreconditionValue ?? "undefined"}.`
      );
    }
    if (declaration.decisionEffect) {
      const found = decisionBeat.stateContract.effects.some((effect) => (
        sameStateEffect(effect, declaration.decisionEffect!)
      ));
      if (!found) {
        failures.push("MICRO_DECISION_EFFECT_MISSING: the chosen action's structured state effect is not declared in the decision beat.");
      }
      const valueBeforeDecision = stateValueBefore(
        decisionTimeline,
        decisionIndex,
        declaration.decisionEffect.entityId,
        declaration.decisionEffect.attribute
      );
      if (declaration.decisionEffect.fromValue !== null && valueBeforeDecision !== declaration.decisionEffect.fromValue) {
        failures.push("MICRO_DECISION_EFFECT_PRECONDITION_MISMATCH: the chosen action cannot happen from the state carried into the decision beat.");
      }
    }

    const consequencePreconditionValue = stateValueBefore(
      decisionTimeline,
      consequenceIndex,
      declaration.consequencePrecondition.entityId,
      declaration.consequencePrecondition.attribute
    );
    if (consequencePreconditionValue !== declaration.consequencePrecondition.value) {
      failures.push(
        `MICRO_DECISION_CONSEQUENCE_PRECONDITION_MISMATCH: the consequence requires ${declaration.consequencePrecondition.value}, but the state before the consequence is ${consequencePreconditionValue ?? "undefined"}.`
      );
    }
    const consequenceEffectFound = consequenceBeat.stateContract.effects.some((effect) => (
      sameStateEffect(effect, declaration.consequenceEffect)
    ));
    if (!consequenceEffectFound) {
      failures.push("MICRO_DECISION_CONSEQUENCE_EFFECT_MISSING: the visible consequence's structured state effect is not declared in the consequence beat.");
    }
    if (declaration.consequenceEffect.fromValue === declaration.consequenceEffect.toValue) {
      failures.push("MICRO_DECISION_CONSEQUENCE_EFFECT_STATELESS: the visible consequence must mutate an observable state value.");
    }
    const valueBeforeConsequence = stateValueBefore(
      decisionTimeline,
      consequenceIndex,
      declaration.consequenceEffect.entityId,
      declaration.consequenceEffect.attribute
    );
    if (declaration.consequenceEffect.fromValue !== null && valueBeforeConsequence !== declaration.consequenceEffect.fromValue) {
      failures.push("MICRO_DECISION_CONSEQUENCE_ALREADY_APPLIED: the consequence state already exists before the consequence beat, so the result cannot be a new visible change.");
    }
  }

  if (consequenceBeat) {
    const consequenceStep = decisionTimeline.find((step) => step.shotIndex === consequenceIndex);
    const laterBeats = decisionBeats.filter((beat) => beat.shotIndex > consequenceIndex);
    const afterDecisionBeats = decisionBeats.filter((beat) => beat.shotIndex > decisionIndex);
    const afterConsequenceBeats = decisionBeats.filter((beat) => beat.shotIndex > consequenceIndex);
    afterDecisionBeats.forEach((laterBeat) => {
      laterBeat.stateContract.effects.forEach((laterEffect) => {
        if (
          laterEffect.entityId === declaration.triggerState.entityId
          && laterEffect.attribute === declaration.triggerState.attribute
          && laterEffect.toValue === declaration.triggerState.value
        ) {
          failures.push("MICRO_DECISION_EXPECTED_ACTION_RESTARTS: a later beat restores the trigger state, which would let the expected action execute again without cause.");
        }
      });
    });
    afterConsequenceBeats.forEach((laterBeat) => {
      laterBeat.stateContract.effects.forEach((laterEffect) => {
        if (declaration.decisionEffect?.actionId && laterEffect.actionId === declaration.decisionEffect.actionId) {
          failures.push("MICRO_DECISION_DECISION_ACTION_RESTARTS: a later beat re-executes the chosen action after the decision is committed.");
        }
        if (declaration.consequenceEffect.actionId && laterEffect.actionId === declaration.consequenceEffect.actionId) {
          failures.push("MICRO_DECISION_CONSEQUENCE_ACTION_RESTARTS: a later beat re-executes the action that produced the visible consequence.");
        }
      });
    });
    decisionBeats
      .filter((beat) => beat.shotIndex > decisionIndex && beat.shotIndex <= consequenceIndex)
      .forEach((betweenBeat) => {
        betweenBeat.stateContract.effects.forEach((effect) => {
          if (
            effect.entityId === declaration.consequencePrecondition.entityId
            && effect.attribute === declaration.consequencePrecondition.attribute
          ) {
            failures.push("MICRO_DECISION_CONSEQUENCE_PRECONDITION_VIOLATED: a beat between the decision and the consequence changes the state that the consequence must preserve.");
          }
        });
      });
    consequenceBeat.stateContract.effects.forEach((effect) => {
      const valueBeforeConsequence = consequenceStep?.before.attributes[effect.entityId]?.[effect.attribute] ?? null;
      laterBeats.forEach((laterBeat) => {
        laterBeat.stateContract.effects.forEach((laterEffect) => {
          if (
            laterEffect.entityId === effect.entityId
            && laterEffect.attribute === effect.attribute
            && laterEffect.toValue === valueBeforeConsequence
          ) {
            failures.push("MICRO_DECISION_CONTINUATION_CANCELS_CONSEQUENCE: a later beat returns the world to the state that existed before the decision.");
          }
        });
        if (effect.actionId && laterBeat.stateContract.effects.some((laterEffect) => laterEffect.actionId === effect.actionId)) {
          failures.push("MICRO_DECISION_CONTINUATION_CANCELS_CONSEQUENCE: a later beat re-executes the action that produced the visible consequence.");
        }
      });
    });
  }

  return failures;
}

export function planCommercialMicroDecision(input: {
  declaration?: CommercialMicroDecisionInput | null;
  beats: CommercialMicroDecisionBeat[];
  timeline: CommercialWorldStateTimeline;
  worldModel?: CommercialWorldModel | null;
}): CommercialMicroDecisionPlan {
  if (!input.declaration) {
    return {
      schemaVersion: COMMERCIAL_MICRO_DECISION_SCHEMA_VERSION,
      status: "MICRO_DECISION_NOT_DECLARED",
      contract: null,
      failureReasons: [],
      scenarioWorldModel: null,
      scenarioTimeline: null,
    };
  }
  const failureReasons = validateCommercialMicroDecision({
    declaration: input.declaration,
    beats: input.beats,
    timeline: input.timeline,
    worldModel: input.worldModel,
  });
  const scenarioContext = buildDecisionScenarioTimeline({
    declaration: input.declaration,
    beats: input.beats,
    timeline: input.timeline,
    worldModel: input.worldModel,
  });
  const decisionBeatExists = input.beats.some((beat) => beat.shotIndex === input.declaration!.decisionBeatIndex);
  return {
    schemaVersion: COMMERCIAL_MICRO_DECISION_SCHEMA_VERSION,
    status: failureReasons.length > 0 ? "MICRO_DECISION_FAILED" : "MICRO_DECISION_VALIDATED",
    contract: {
      schemaVersion: COMMERCIAL_MICRO_DECISION_SCHEMA_VERSION,
      routine: input.declaration.routine,
      expectation: input.declaration.expectation,
      trigger: input.declaration.trigger,
      expectedAction: input.declaration.expectedAction,
      chosenAction: input.declaration.chosenAction,
      visibleConsequence: input.declaration.visibleConsequence,
      continuation: input.declaration.continuation,
      decisionBeatIndex: input.declaration.decisionBeatIndex,
      consequenceBeatIndex: input.declaration.consequenceBeatIndex,
      triggerState: input.declaration.triggerState,
      decisionPrecondition: input.declaration.decisionPrecondition,
      decisionEffect: input.declaration.decisionEffect,
      consequencePrecondition: input.declaration.consequencePrecondition,
      consequenceEffect: input.declaration.consequenceEffect,
      chosenActionId: input.declaration.chosenActionId,
      consequenceDecisionStatusRequirement: input.declaration.consequenceDecisionStatusRequirement,
      scenarioState: input.declaration.scenarioState,
      decisionStatus: decisionBeatExists ? "COMMITTED" : "UNCOMMITTED",
      committedAtBeatIndex: decisionBeatExists ? input.declaration.decisionBeatIndex : -1,
    },
    failureReasons,
    scenarioWorldModel: scenarioContext.worldModel,
    scenarioTimeline: scenarioContext.timeline,
  };
}
