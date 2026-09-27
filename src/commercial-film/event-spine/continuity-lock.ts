import type {
  CommercialWorldEntity,
  CommercialWorldModel,
  CommercialWorldStateSnapshot,
  CommercialWorldStateTimeline,
  CommercialEventStateContract,
} from "./world-state";
import { findCommercialWorldEntity } from "./world-state";

export const COMMERCIAL_CONTINUITY_LOCK_SCHEMA_VERSION = "commercial-film/continuity-lock-v1" as const;

export type CommercialContinuityLockFactKind =
  | "SPATIAL_HOLD"
  | "SPATIAL_CHANGE"
  | "ENTITY_PERSISTENCE"
  | "ENTITY_HOLD"
  | "ENTITY_CHANGE"
  | "SINGLE_USE_ACTION"
  | "HIDDEN_CONTAINMENT";

export type CommercialContinuityLockFact = {
  factId: string;
  kind: CommercialContinuityLockFactKind;
  entityId: string;
  attribute: string | null;
  line: string;
};

export type CommercialContinuityLock = {
  schemaVersion: typeof COMMERCIAL_CONTINUITY_LOCK_SCHEMA_VERSION;
  facts: CommercialContinuityLockFact[];
  lines: string[];
  failureReasons: string[];
};

export type CommercialContinuityLockBeat = {
  shotIndex: number;
  stateContract: CommercialEventStateContract;
};

type AttributeChange = {
  initialValue: string;
  finalValue: string;
  firstChangeShotIndex: number | null;
  actionLabel: string | null;
};

function shotLabel(shotIndex: number) {
  return `shot ${shotIndex + 1}`;
}

function subjectPhrase(label: string) {
  const trimmed = label.trim();
  const withArticle = /^(?:the|a|an|this|that)\b/i.test(trimmed) ? trimmed : `the ${trimmed}`;
  return withArticle.charAt(0).toUpperCase() + withArticle.slice(1);
}

function attributeChange(input: {
  entity: CommercialWorldEntity;
  attribute: string;
  beats: CommercialContinuityLockBeat[];
  timeline: CommercialWorldStateTimeline;
  finalState: CommercialWorldStateSnapshot;
}): AttributeChange | null {
  const initialValue = input.entity.initialAttributes[input.attribute];
  if (initialValue === undefined) return null;
  const finalValue = input.finalState.attributes[input.entity.id]?.[input.attribute] ?? initialValue;
  let firstChangeShotIndex: number | null = null;
  input.timeline.forEach((step) => {
    if (firstChangeShotIndex !== null) return;
    const before = step.before.attributes[input.entity.id]?.[input.attribute] ?? initialValue;
    const after = step.after.attributes[input.entity.id]?.[input.attribute] ?? before;
    if (after !== before) {
      firstChangeShotIndex = step.shotIndex;
    }
  });
  let actionLabel: string | null = null;
  if (firstChangeShotIndex !== null) {
    const beat = input.beats.find((entry) => entry.shotIndex === firstChangeShotIndex);
    const effect = beat?.stateContract.effects.find((entry) => (
      entry.entityId === input.entity.id
      && entry.attribute === input.attribute
      && entry.cause === "ACTION"
    ));
    actionLabel = effect?.actionLabel ?? null;
  }
  return {
    initialValue,
    finalValue,
    firstChangeShotIndex,
    actionLabel,
  };
}

function characterSpaceFacts(input: {
  entity: CommercialWorldEntity;
  change: AttributeChange;
  hasDeclaredCrossingAction: boolean;
}): CommercialContinuityLockFact[] {
  const facts: CommercialContinuityLockFact[] = [];
  if (input.change.firstChangeShotIndex === null) {
    facts.push({
      factId: `${input.entity.id}.space.hold`,
      kind: "SPATIAL_HOLD",
      entityId: input.entity.id,
      attribute: "space",
      line: `The character remains ${input.change.finalValue} for the whole film and does not relocate to another spatial situation.`,
    });
    return facts;
  }
  facts.push({
    factId: `${input.entity.id}.space.change`,
    kind: "SPATIAL_CHANGE",
    entityId: input.entity.id,
    attribute: "space",
    line: `The character begins ${input.change.initialValue} and is ${input.change.finalValue} from ${shotLabel(input.change.firstChangeShotIndex)} onward.`,
  });
  facts.push({
    factId: `${input.entity.id}.space.rule`,
    kind: "SPATIAL_HOLD",
    entityId: input.entity.id,
    attribute: "space",
    line: input.hasDeclaredCrossingAction
      ? `The only spatial change in the film is the crossing declared at ${shotLabel(input.change.firstChangeShotIndex)}; the character does not return to the previous spatial situation afterwards.`
      : "The character's spatial situation changes only through the actions described in this film and never resets on its own.",
  });
  return facts;
}

export function buildCommercialContinuityLock(input: {
  model: CommercialWorldModel;
  timeline: CommercialWorldStateTimeline;
  finalState: CommercialWorldStateSnapshot;
  beats: CommercialContinuityLockBeat[];
}): CommercialContinuityLock {
  const facts: CommercialContinuityLockFact[] = [];
  const failureReasons: string[] = [];

  input.model.entities.forEach((entity) => {
    const trackedAttributes = entity.continuityLockAttributes.filter((attribute) => (
      entity.initialAttributes[attribute] !== undefined
    ));
    if (trackedAttributes.length === 0 && !entity.containment) return;

    if (entity.kind === "CHARACTER") {
      trackedAttributes.forEach((attribute) => {
        const change = attributeChange({
          entity,
          attribute,
          beats: input.beats,
          timeline: input.timeline,
          finalState: input.finalState,
        });
        if (!change) {
          failureReasons.push(`CONTINUITY_LOCK_UNKNOWN_ATTRIBUTE: ${entity.id}.${attribute} is not tracked by the World State.`);
          return;
        }
        if (attribute === "space") {
          const hasDeclaredCrossingAction = input.beats.some((beat) => beat.stateContract.effects.some((effect) => (
            effect.cause === "ACTION"
            && Boolean(effect.actionId)
            && effect.entityId === entity.id
            && (effect.attribute === "space" || effect.attribute === "anchor")
            && effect.fromValue !== effect.toValue
          )));
          facts.push(...characterSpaceFacts({ entity, change, hasDeclaredCrossingAction }));
          return;
        }
        if (change.firstChangeShotIndex === null) {
          facts.push({
            factId: `${entity.id}.${attribute}.hold`,
            kind: "ENTITY_HOLD",
            entityId: entity.id,
            attribute,
            line: `The character stays within ${change.finalValue} for the whole film.`,
          });
          return;
        }
        facts.push({
          factId: `${entity.id}.${attribute}.change`,
          kind: "ENTITY_CHANGE",
          entityId: entity.id,
          attribute,
          line: `The character moves from ${change.initialValue} to ${change.finalValue} at ${shotLabel(change.firstChangeShotIndex!)} and keeps that spatial position afterwards.`,
        });
      });
    }

    if (entity.kind === "THRESHOLD") {
      facts.push({
        factId: `${entity.id}.persistence`,
        kind: "ENTITY_PERSISTENCE",
        entityId: entity.id,
        attribute: null,
        line: `${subjectPhrase(entity.label)} persists throughout the film.`,
      });
      trackedAttributes.forEach((attribute) => {
        const change = attributeChange({
          entity,
          attribute,
          beats: input.beats,
          timeline: input.timeline,
          finalState: input.finalState,
        });
        if (!change) {
          failureReasons.push(`CONTINUITY_LOCK_UNKNOWN_ATTRIBUTE: ${entity.id}.${attribute} is not tracked by the World State.`);
          return;
        }
        if (change.firstChangeShotIndex === null) {
          facts.push({
            factId: `${entity.id}.${attribute}.hold`,
            kind: "ENTITY_HOLD",
            entityId: entity.id,
            attribute,
            line: `${subjectPhrase(entity.label)} stays ${change.finalValue} for the whole film.`,
          });
          return;
        }
        const changeVerb = change.actionLabel ?? "changed";
        facts.push({
          factId: `${entity.id}.${attribute}.change`,
          kind: "ENTITY_CHANGE",
          entityId: entity.id,
          attribute,
          line: `${subjectPhrase(entity.label)} begins ${change.initialValue}, is ${changeVerb} once at ${shotLabel(change.firstChangeShotIndex!)}, and stays ${change.finalValue} for the rest of the film.`,
        });
      });
    }

    if (entity.kind === "OBJECT" || entity.kind === "GROUND" || entity.kind === "CARRIER") {
      trackedAttributes.forEach((attribute) => {
        const change = attributeChange({
          entity,
          attribute,
          beats: input.beats,
          timeline: input.timeline,
          finalState: input.finalState,
        });
        if (!change) {
          failureReasons.push(`CONTINUITY_LOCK_UNKNOWN_ATTRIBUTE: ${entity.id}.${attribute} is not tracked by the World State.`);
          return;
        }
        if (change.firstChangeShotIndex === null) {
          facts.push({
            factId: `${entity.id}.${attribute}.hold`,
            kind: "ENTITY_HOLD",
            entityId: entity.id,
            attribute,
            line: `${subjectPhrase(entity.label)} stays ${change.finalValue} for the whole film.`,
          });
          return;
        }
        facts.push({
          factId: `${entity.id}.${attribute}.change`,
          kind: "ENTITY_CHANGE",
          entityId: entity.id,
          attribute,
          line: `${subjectPhrase(entity.label)} begins ${change.initialValue} and becomes ${change.finalValue} at ${shotLabel(change.firstChangeShotIndex!)}, and that state holds afterwards.`,
        });
      });
    }

    if (entity.containment) {
      const carrier = findCommercialWorldEntity(input.model, entity.containment.carrierId);
      const visibleForms = entity.containment.prohibitedVisibleForms.join(", ");
      facts.push({
        factId: `${entity.id}.containment`,
        kind: "HIDDEN_CONTAINMENT",
        entityId: entity.id,
        attribute: null,
        line: `${subjectPhrase(entity.label)} stays inside the closed ${carrier?.label ?? entity.containment.carrierId}. Only ${entity.containment.perceptibleCue} is perceptible, and no ${visibleForms} appears.`,
      });
    }
  });

  input.beats.forEach((beat) => {
    const action = beat.stateContract.singleUseAction;
    if (!action) return;
    const alreadyStated = facts.some((fact) => fact.entityId === action.entityId && fact.attribute === action.attribute);
    if (alreadyStated) return;
    facts.push({
      factId: `${action.actionId}.single_use`,
      kind: "SINGLE_USE_ACTION",
      entityId: action.entityId,
      attribute: action.attribute,
      line: `${action.label} happens once in the film and is not repeated afterwards.`,
    });
  });

  return {
    schemaVersion: COMMERCIAL_CONTINUITY_LOCK_SCHEMA_VERSION,
    facts,
    lines: facts.map((fact) => fact.line),
    failureReasons,
  };
}
