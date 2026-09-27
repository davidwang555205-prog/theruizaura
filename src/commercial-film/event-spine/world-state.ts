export const COMMERCIAL_WORLD_STATE_SCHEMA_VERSION = "commercial-film/world-state-v1" as const;

/**
 * Lightweight world state for one fixed 15-second Commercial Film.
 * It exists only for state continuity: what a beat requires, what it changes,
 * and what the next beat may assume. No database, memory, or external service.
 */

export type CommercialWorldEntityKind =
  | "CHARACTER"
  | "THRESHOLD"
  | "OBJECT"
  | "CARRIER"
  | "GROUND";

export type CommercialEntityContainment = {
  carrierId: string;
  perceptibleCue: string;
  prohibitedVisibleForms: string[];
};

export type CommercialWorldEntity = {
  id: string;
  kind: CommercialWorldEntityKind;
  label: string;
  initialAttributes: Record<string, string>;
  continuityLockAttributes: string[];
  containment: CommercialEntityContainment | null;
};

export type CommercialWorldModel = {
  schemaVersion: typeof COMMERCIAL_WORLD_STATE_SCHEMA_VERSION;
  entities: CommercialWorldEntity[];
};

export type CommercialStateRequirement = {
  entityId: string;
  attribute: string;
  value: string;
  reason: string;
};

export type CommercialStateEffectCause = "ACTION" | "ENVIRONMENT" | "PASSIVE";

export type CommercialStateEffect = {
  entityId: string;
  attribute: string;
  fromValue: string | null;
  toValue: string;
  cause: CommercialStateEffectCause;
  actionId: string | null;
  actionLabel: string | null;
  reason: string;
};

export type CommercialRequiredVisibleEvidence = {
  id: string;
  statement: string;
  entityId: string | null;
};

export type CommercialSingleUseAction = {
  actionId: string;
  label: string;
  entityId: string;
  attribute: string;
  fromValue: string;
  toValue: string;
};

export type CommercialProhibitedTransition = {
  entityId: string;
  attribute: string;
  fromValue: string;
  toValue: string;
  reason: string;
};

export type CommercialEventStateContract = {
  preconditions: CommercialStateRequirement[];
  effects: CommercialStateEffect[];
  requiredVisibleEvidence: CommercialRequiredVisibleEvidence[];
  prohibitedTransitions: CommercialProhibitedTransition[];
  singleUseAction: CommercialSingleUseAction | null;
};

export type CommercialStateAttributeValues = Record<string, string>;
export type CommercialWorldStateAttributes = Record<string, CommercialStateAttributeValues>;

export type CommercialWorldStateSnapshot = {
  shotIndex: number;
  attributes: CommercialWorldStateAttributes;
  completedActions: string[];
};

export type CommercialContinuityConflictCode =
  | "DUPLICATE_SINGLE_USE_ACTION"
  | "IMPOSSIBLE_SPATIAL_RESET"
  | "IMPOSSIBLE_OBJECT_RESET"
  | "PRECONDITION_MISMATCH"
  | "EFFECT_STATE_MISMATCH"
  | "PROHIBITED_TRANSITION"
  | "UNKNOWN_STATE_ENTITY";

export type CommercialContinuityConflict = {
  code: CommercialContinuityConflictCode;
  shotIndex: number;
  entityId: string | null;
  attribute: string | null;
  detail: string;
};

export type CommercialWorldStateStep = {
  shotIndex: number;
  before: CommercialWorldStateSnapshot;
  after: CommercialWorldStateSnapshot;
  conflicts: CommercialContinuityConflict[];
};

export type CommercialWorldStateTimeline = CommercialWorldStateStep[];

export type CommercialWorldStateBeat = {
  shotIndex: number;
  stateContract: CommercialEventStateContract;
};

function cloneAttributes(attributes: CommercialWorldStateAttributes): CommercialWorldStateAttributes {
  const clone: CommercialWorldStateAttributes = {};
  Object.entries(attributes).forEach(([entityId, values]) => {
    clone[entityId] = { ...values };
  });
  return clone;
}

export function createEmptyCommercialWorldModel(): CommercialWorldModel {
  return {
    schemaVersion: COMMERCIAL_WORLD_STATE_SCHEMA_VERSION,
    entities: [],
  };
}

export function findCommercialWorldEntity(
  model: CommercialWorldModel,
  entityId: string
): CommercialWorldEntity | null {
  return model.entities.find((entity) => entity.id === entityId) ?? null;
}

export function createInitialCommercialWorldState(
  model: CommercialWorldModel
): CommercialWorldStateSnapshot {
  const attributes: CommercialWorldStateAttributes = {};
  model.entities.forEach((entity) => {
    attributes[entity.id] = { ...entity.initialAttributes };
  });
  return {
    shotIndex: 0,
    attributes,
    completedActions: [],
  };
}

function readStateValue(
  state: CommercialWorldStateSnapshot,
  entityId: string,
  attribute: string
): string | null {
  const values = state.attributes[entityId];
  if (!values) return null;
  return Object.prototype.hasOwnProperty.call(values, attribute) ? values[attribute] : null;
}

export function readCommercialStateValue(
  state: CommercialWorldStateSnapshot,
  entityId: string,
  attribute: string
): string | null {
  return readStateValue(state, entityId, attribute);
}

function requirementMismatchConflict(input: {
  model: CommercialWorldModel;
  shotIndex: number;
  entityId: string;
  attribute: string;
  requiredValue: string;
  currentValue: string | null;
}): CommercialContinuityConflict {
  const entity = findCommercialWorldEntity(input.model, input.entityId);
  const shared = {
    shotIndex: input.shotIndex,
    entityId: input.entityId,
    attribute: input.attribute,
  };
  const mismatch = `${input.requiredValue} was required by this beat, but the state carried into this beat is ${input.currentValue ?? "undefined"}.`;
  if (entity && entity.kind === "CHARACTER" && (input.attribute === "space" || input.attribute === "anchor")) {
    return {
      ...shared,
      code: "IMPOSSIBLE_SPATIAL_RESET",
      detail: `The character's spatial state was reset without a declared crossing action. ${mismatch}`,
    };
  }
  const initialValue = entity?.initialAttributes[input.attribute] ?? null;
  if (entity && initialValue !== null && initialValue === input.requiredValue) {
    return {
      ...shared,
      code: "IMPOSSIBLE_OBJECT_RESET",
      detail: `${entity.label} returned to its original state without a declared reverse action. ${mismatch}`,
    };
  }
  return {
    ...shared,
    code: "PRECONDITION_MISMATCH",
    detail: `This beat assumed a state that the previous beat did not produce. ${mismatch}`,
  };
}

export function applyCommercialEventStateContract(input: {
  model: CommercialWorldModel;
  state: CommercialWorldStateSnapshot;
  shotIndex: number;
  contract: CommercialEventStateContract;
}): {
  state: CommercialWorldStateSnapshot;
  conflicts: CommercialContinuityConflict[];
} {
  const conflicts: CommercialContinuityConflict[] = [];
  const attributes = cloneAttributes(input.state.attributes);
  const completedActions = [...input.state.completedActions];
  const reportedDuplicateActions = new Set<string>();
  const readRunningValue = (entityId: string, attribute: string): string | null => {
    const values = attributes[entityId];
    if (!values) return null;
    return Object.prototype.hasOwnProperty.call(values, attribute) ? values[attribute] : null;
  };

  const verifyEntityAttribute = (entityId: string, attribute: string, context: string) => {
    const entity = findCommercialWorldEntity(input.model, entityId);
    if (!entity) {
      conflicts.push({
        code: "UNKNOWN_STATE_ENTITY",
        shotIndex: input.shotIndex,
        entityId,
        attribute,
        detail: `This beat ${context} an entity that the current World State does not define.`,
      });
      return null;
    }
    const declaredAttributes = attributes[entity.id] ?? {};
    if (!Object.prototype.hasOwnProperty.call(declaredAttributes, attribute)) {
      conflicts.push({
        code: "UNKNOWN_STATE_ENTITY",
        shotIndex: input.shotIndex,
        entityId,
        attribute,
        detail: `This beat ${context} the attribute "${attribute}" on ${entity.label}, which the World State does not track.`,
      });
      return null;
    }
    return entity;
  };

  input.contract.preconditions.forEach((requirement) => {
    const entity = verifyEntityAttribute(requirement.entityId, requirement.attribute, "requires a state on");
    if (!entity) return;
    const currentValue = readStateValue(input.state, requirement.entityId, requirement.attribute);
    if (currentValue === requirement.value) return;
    conflicts.push(requirementMismatchConflict({
      model: input.model,
      shotIndex: input.shotIndex,
      entityId: requirement.entityId,
      attribute: requirement.attribute,
      requiredValue: requirement.value,
      currentValue,
    }));
  });

  input.contract.effects.forEach((effect) => {
    const entity = verifyEntityAttribute(effect.entityId, effect.attribute, "declares a change on");
    if (!entity) return;
    const currentValue = readRunningValue(effect.entityId, effect.attribute);
    if (effect.fromValue !== null && currentValue !== effect.fromValue) {
      conflicts.push({
        code: "EFFECT_STATE_MISMATCH",
        shotIndex: input.shotIndex,
        entityId: effect.entityId,
        attribute: effect.attribute,
        detail: `${entity.label} was declared to change from ${effect.fromValue} to ${effect.toValue}, but the state carried into this beat is ${currentValue ?? "undefined"}.`,
      });
    }
    if (currentValue === effect.toValue) {
      conflicts.push({
        code: "EFFECT_STATE_MISMATCH",
        shotIndex: input.shotIndex,
        entityId: effect.entityId,
        attribute: effect.attribute,
        detail: `${entity.label} is already ${effect.toValue} before this beat, so the declared change would repeat a completed state change.`,
      });
    }
    input.contract.prohibitedTransitions.forEach((prohibited) => {
      if (
        prohibited.entityId === effect.entityId
        && prohibited.attribute === effect.attribute
        && prohibited.fromValue === currentValue
        && prohibited.toValue === effect.toValue
      ) {
        conflicts.push({
          code: "PROHIBITED_TRANSITION",
          shotIndex: input.shotIndex,
          entityId: effect.entityId,
          attribute: effect.attribute,
          detail: `${entity.label} cannot change from ${prohibited.fromValue} to ${prohibited.toValue} at this beat: ${prohibited.reason}`,
        });
      }
    });
    const isSpatialAttribute = entity.kind === "CHARACTER" && (effect.attribute === "space" || effect.attribute === "anchor");
    if (isSpatialAttribute && currentValue !== effect.toValue && (effect.cause !== "ACTION" || !effect.actionId)) {
      conflicts.push({
        code: "IMPOSSIBLE_SPATIAL_RESET",
        shotIndex: input.shotIndex,
        entityId: effect.entityId,
        attribute: effect.attribute,
        detail: `The character's spatial state changes at this beat without a causal crossing action.`,
      });
    }
    if (effect.cause === "ACTION" && !effect.actionId) {
      conflicts.push({
        code: "EFFECT_STATE_MISMATCH",
        shotIndex: input.shotIndex,
        entityId: effect.entityId,
        attribute: effect.attribute,
        detail: `A state change caused by ACTION must declare the action id that performs it.`,
      });
    }
    if (effect.cause === "ACTION" && effect.actionId) {
      if (input.state.completedActions.includes(effect.actionId)) {
        if (!reportedDuplicateActions.has(effect.actionId)) {
          reportedDuplicateActions.add(effect.actionId);
          conflicts.push({
            code: "DUPLICATE_SINGLE_USE_ACTION",
            shotIndex: input.shotIndex,
            entityId: effect.entityId,
            attribute: effect.attribute,
            detail: `${effect.actionLabel ?? effect.actionId} is executed again after it was already completed earlier in the film.`,
          });
        }
      }
      if (!completedActions.includes(effect.actionId)) {
        completedActions.push(effect.actionId);
      }
    }
    attributes[effect.entityId][effect.attribute] = effect.toValue;
  });

  const singleUse = input.contract.singleUseAction;
  if (singleUse) {
    const entity = verifyEntityAttribute(singleUse.entityId, singleUse.attribute, "declares a single-use action on");
    if (entity) {
      if (input.state.completedActions.includes(singleUse.actionId)) {
        conflicts.push({
          code: "DUPLICATE_SINGLE_USE_ACTION",
          shotIndex: input.shotIndex,
          entityId: singleUse.entityId,
          attribute: singleUse.attribute,
          detail: `${singleUse.label} is declared as a single-use action after it was already completed earlier in the film.`,
        });
      }
      const matchedEffect = input.contract.effects.some((effect) => (
        effect.entityId === singleUse.entityId
        && effect.attribute === singleUse.attribute
        && effect.fromValue === singleUse.fromValue
        && effect.toValue === singleUse.toValue
        && effect.cause === "ACTION"
      ));
      if (!matchedEffect) {
        conflicts.push({
          code: "EFFECT_STATE_MISMATCH",
          shotIndex: input.shotIndex,
          entityId: singleUse.entityId,
          attribute: singleUse.attribute,
          detail: `${singleUse.label} is declared as a single-use action without the matching state change inside the same beat.`,
        });
      }
      const valueBeforeBeat = readStateValue(input.state, singleUse.entityId, singleUse.attribute);
      if (valueBeforeBeat !== singleUse.fromValue) {
        conflicts.push({
          code: "EFFECT_STATE_MISMATCH",
          shotIndex: input.shotIndex,
          entityId: singleUse.entityId,
          attribute: singleUse.attribute,
          detail: `${singleUse.label} requires ${singleUse.fromValue} before it happens, but the state carried into this beat is ${valueBeforeBeat ?? "undefined"}.`,
        });
      }
      if (!completedActions.includes(singleUse.actionId)) {
        completedActions.push(singleUse.actionId);
      }
    }
  }

  input.contract.requiredVisibleEvidence.forEach((evidence) => {
    if (!evidence.entityId) return;
    if (findCommercialWorldEntity(input.model, evidence.entityId)) return;
    conflicts.push({
      code: "UNKNOWN_STATE_ENTITY",
      shotIndex: input.shotIndex,
      entityId: evidence.entityId,
      attribute: null,
      detail: `This beat requires visible evidence from an entity that the current World State does not define.`,
    });
  });

  return {
    state: {
      shotIndex: input.shotIndex,
      attributes,
      completedActions,
    },
    conflicts,
  };
}

export function reduceCommercialWorldState(input: {
  model: CommercialWorldModel;
  beats: CommercialWorldStateBeat[];
}): {
  timeline: CommercialWorldStateTimeline;
  initialState: CommercialWorldStateSnapshot;
  finalState: CommercialWorldStateSnapshot;
  conflicts: CommercialContinuityConflict[];
} {
  const initialState = createInitialCommercialWorldState(input.model);
  const timeline: CommercialWorldStateTimeline = [];
  let state = initialState;
  const conflicts: CommercialContinuityConflict[] = [];
  input.beats.forEach((beat) => {
    const result = applyCommercialEventStateContract({
      model: input.model,
      state,
      shotIndex: beat.shotIndex,
      contract: beat.stateContract,
    });
    timeline.push({
      shotIndex: beat.shotIndex,
      before: state,
      after: result.state,
      conflicts: result.conflicts,
    });
    conflicts.push(...result.conflicts);
    state = result.state;
  });
  return {
    timeline,
    initialState,
    finalState: state,
    conflicts,
  };
}

export function describeCommercialContinuityConflict(
  conflict: CommercialContinuityConflict
): string {
  const target = conflict.entityId
    ? `${conflict.entityId}${conflict.attribute ? `.${conflict.attribute}` : ""}`
    : "world state";
  return `[${conflict.code}] shot ${conflict.shotIndex + 1} · ${target} · ${conflict.detail}`;
}
