import type { CommercialEventStateContract } from "./world-state";

/** Build visible-evidence statements only from declared state facts. */
export function structuredObservableEvidence(
  id: string,
  contract: CommercialEventStateContract,
  entityId?: string
) {
  const selectedEffects = contract.effects.filter((effect) => !entityId || effect.entityId === entityId);
  if (selectedEffects.length > 0) {
    return selectedEffects.map((effect) => ({
      id,
      entityId: effect.entityId,
      statement: effect.actionLabel
        ? `${effect.actionLabel}; ${effect.entityId}.${effect.attribute} changes from ${effect.fromValue ?? "unset"} to ${effect.toValue}.`
        : `Observable state transition: ${effect.entityId}.${effect.attribute} changes from ${effect.fromValue ?? "unset"} to ${effect.toValue}.`,
    }));
  }

  const selectedRequirements = contract.preconditions.filter((requirement) => !entityId || requirement.entityId === entityId);
  if (selectedRequirements.length > 0) {
    const requirement = selectedRequirements[0];
    return [{
      id,
      entityId: requirement.entityId,
      statement: `The declared event is observed with ${requirement.entityId}.${requirement.attribute} = ${requirement.value}.`,
    }];
  }

  if (contract.singleUseAction && (!entityId || contract.singleUseAction.entityId === entityId)) {
    const action = contract.singleUseAction;
    return [{
      id,
      entityId: action.entityId,
      statement: `${action.label}; ${action.entityId}.${action.attribute} changes from ${action.fromValue} to ${action.toValue}.`,
    }];
  }

  return [];
}
