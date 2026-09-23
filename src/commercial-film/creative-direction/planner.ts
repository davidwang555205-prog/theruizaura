import { planCameraBehaviors } from "./camera-behavior";
import {
  cutMotivationFor,
  editEntryLine,
  editExitLine,
  selectEditLogics,
  selectVisualMotif,
  viewerAttentionTarget,
  visualMotifContribution,
} from "./edit-logic";
import { runCommercialDirectionQc } from "./qc";
import {
  cameraNarrativeReason,
  modeDirectingPrinciple,
  movementContinuityLine,
  rankCreativeModes,
} from "./rules";
import {
  COMMERCIAL_CREATIVE_DIRECTION_SCHEMA_VERSION,
  COMMERCIAL_CREATIVE_DIRECTION_VERSION,
  type CommercialCreativeDirectionPlan,
  type CommercialCreativeDirectionPlannerInput,
  type CommercialCreativeDirectionQcInput,
  type CommercialShotDirection,
} from "./types";

export function planCommercialCreativeDirection(
  input: CommercialCreativeDirectionPlannerInput
): CommercialCreativeDirectionPlan {
  const modeCandidates = rankCreativeModes({
    intent: input.commercialIntent,
    creativeSpine: input.creativeSpine,
    generationNonce: input.generationNonce,
    override: input.creativeModeOverride,
  });
  const dramaticFunctions = input.creativeSpine.shotFunctions.map((shot) => shot.dramaticFunction);
  const buildForMode = (creativeMode: CommercialCreativeDirectionPlan["creativeMode"]) => {
    const plannedCameraBehaviors = planCameraBehaviors({
      creativeMode,
      shotRoles: input.shotRoles,
      dramaticFunctions,
      productPresence: input.productPresenceByShot,
      revealStrategy: input.creativeSpine.revealStrategy,
      generationNonce: input.generationNonce,
    });
    const cameraBehaviorByShot = plannedCameraBehaviors.map((behavior, shotIndex) => {
      const framing = input.eventSpine.shots[shotIndex]?.framingHint ?? "";
      return behavior === "FOLLOW" && /\b(?:held|holds|stays|still|static|environment)\b/i.test(framing)
        ? "OBSERVE"
        : behavior;
    });
    const edit = selectEditLogics({
      creativeMode,
      revealStrategy: input.creativeSpine.revealStrategy,
      generationNonce: input.generationNonce,
      primaryOverride: input.primaryEditLogicOverride,
      secondaryOverride: input.secondaryEditLogicOverride,
    });
    const visualMotif = selectVisualMotif({
      intent: input.commercialIntent,
      mode: creativeMode,
      creativeSpine: input.creativeSpine,
      generationNonce: input.generationNonce,
      override: input.visualMotifOverride,
    });
    const shotDirections: CommercialShotDirection[] = input.shotRoles.map((shotRole, shotIndex) => {
      const story = input.creativeSpine.shotFunctions[shotIndex];
      const presence = input.productPresenceByShot[shotIndex];
      const action = input.actionPlan[shotIndex];
      const eventShot = input.eventSpine.shots[shotIndex];
      const perceptualSignatureParts = [
        eventShot?.framingHint ?? "default framing",
        cameraBehaviorByShot[shotIndex],
        action.movementPhase,
        presence,
        eventShot?.perceptualTarget ?? "default perception",
      ];
      const releaseEditSafe = edit.secondaryEditLogic
        && edit.secondaryEditLogic !== "DELAYED_REVEAL"
        && edit.secondaryEditLogic !== "SENSORY_INSERT"
        ? edit.secondaryEditLogic
        : "ACTION_CUT";
      const baseEditForShot = shotRole === "RELEASE"
        && (edit.primaryEditLogic === "DELAYED_REVEAL" || edit.primaryEditLogic === "SENSORY_INSERT")
        ? releaseEditSafe
        : edit.secondaryEditLogic && (shotIndex === 2 || shotIndex === 3)
          ? edit.secondaryEditLogic
          : edit.primaryEditLogic;
      const editForShot = presence === "CLEAR" && baseEditForShot === "DELAYED_REVEAL"
        ? "ACTION_CUT"
        : baseEditForShot;
      return {
        shotIndex,
        shotRole,
        creativeMode,
        editLogic: editForShot,
        cameraBehavior: cameraBehaviorByShot[shotIndex],
        editEntry: editEntryLine(editForShot, story),
        editExit: editExitLine({
          edit: editForShot,
          shot: story,
          nextShot: input.creativeSpine.shotFunctions[shotIndex + 1],
        }),
        cutMotivation: cutMotivationFor({
          shotIndex,
          dramaticFunction: story.dramaticFunction,
          presence,
          primaryEditLogic: edit.primaryEditLogic,
        }),
        visualMotifContribution: visualMotifContribution(visualMotif, shotRole, shotIndex),
        cameraNarrativeReason: cameraNarrativeReason({
          behavior: cameraBehaviorByShot[shotIndex],
          creativeMode,
          dramaticFunction: story.dramaticFunction,
          presence,
        }),
      movementContinuity: movementContinuityLine({
          shotIndex,
          action,
          previousAction: input.actionPlan[shotIndex - 1],
      }),
      viewerAttentionTarget: viewerAttentionTarget(story.dramaticFunction, presence),
      perceptualSignatureParts,
      perceptualSignature: perceptualSignatureParts.join("::"),
    };
  });
    const planWithoutQc: CommercialCreativeDirectionQcInput = {
      schemaVersion: COMMERCIAL_CREATIVE_DIRECTION_SCHEMA_VERSION,
      plannerVersion: COMMERCIAL_CREATIVE_DIRECTION_VERSION,
      creativeMode,
      cameraBehaviorByShot,
      primaryEditLogic: edit.primaryEditLogic,
      secondaryEditLogic: edit.secondaryEditLogic,
      visualMotif,
      eventSpine: input.eventSpine,
      shotDirections: shotDirections.map((shot) => ({ ...shot })),
      creativeSpine: input.creativeSpine,
    };
    const qcResult = runCommercialDirectionQc(planWithoutQc);
    return {
      ...planWithoutQc,
      qc: qcResult.qc,
      failureReasons: qcResult.failureReasons.length > 0 ? qcResult.failureReasons : undefined,
    } satisfies CommercialCreativeDirectionPlan;
  };

  const candidates = input.creativeModeOverride ? [input.creativeModeOverride] : modeCandidates;
  let fallback = buildForMode(candidates[0]);
  for (const candidate of candidates) {
    const plan = buildForMode(candidate);
    if (!plan.failureReasons?.length) return plan;
    fallback = plan;
  }
  return fallback;
}

export function modeDirectingLine(mode: CommercialCreativeDirectionPlan["creativeMode"]) {
  return modeDirectingPrinciple(mode);
}
