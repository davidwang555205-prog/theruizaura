import {
  personActionLibrary,
  type PersonActionDefinition
} from "../data/personActionLibrary";
import type { TeamImageType, TeamScenePreference } from "../types";
import type { LifestyleSoftCaptureStyle } from "../data/lifestyleSoftSeedingCaptureStyles";
import { detectShoePerspectiveRisk } from "./cameraPerspectiveProfiles";

export type SeriesActionCardInput = {
  imageType: TeamImageType;
  scenePreference: TeamScenePreference;
  studioLaunchShotIndex?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
};

type SelectDiversePersonActionsInput = {
  cards: SeriesActionCardInput[];
  topic: string;
  variantIndex: number;
  generationNonce: number;
  captureStyle?: LifestyleSoftCaptureStyle;
};

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function personActionVisualSignature(action: PersonActionDefinition) {
  return [
    action.diversityFamily,
    action.poseType,
    action.bodyOrientation,
    action.movementPhase,
    action.handTask,
    action.handPlacementZone,
    action.visualLegPoseFamily,
    action.legActionSignature
  ].join("|");
}

export function personActionSemanticDistance(
  first: PersonActionDefinition,
  second: PersonActionDefinition
) {
  if (first.id === second.id) return 0;
  let distance = 0;

  // Full-body action semantics matter more than small leg-parameter changes.
  // Image models often collapse synonymous short-step instructions into the
  // same visible pose, so family / hand task / phase / orientation must carry
  // meaningful weight in the diversity score.
  if (first.diversityFamily !== second.diversityFamily) distance += 18;
  if (first.visualLegPoseFamily !== second.visualLegPoseFamily) distance += 16;
  if (first.handTask !== second.handTask) distance += 10;
  if (first.handPlacementZone !== second.handPlacementZone) distance += 8;
  if (first.movementPhase !== second.movementPhase) distance += 8;
  if (first.bodyOrientation !== second.bodyOrientation) distance += 7;
  if (first.poseType !== second.poseType) distance += 7;
  if (first.legActionSignature !== second.legActionSignature) distance += 10;
  if (first.footwork !== second.footwork) distance += 5;
  if (first.travelDirection !== second.travelDirection) distance += 5;
  if (first.supportLeg !== second.supportLeg) distance += 3;
  if (first.heelState !== second.heelState) distance += 3;
  if (first.kneeState !== second.kneeState) distance += 2;
  if (first.footSpacing !== second.footSpacing) distance += 2;
  if (first.framing !== second.framing) distance += 2;
  return distance;
}

function lifestyleNoveltyScore(
  candidate: PersonActionDefinition,
  selected: PersonActionDefinition[]
) {
  if (!selected.length) return 0;

  const usedVisualLegFamilies = new Set(selected.map((item) => item.visualLegPoseFamily));
  const usedActionFamilies = new Set(selected.map((item) => item.diversityFamily));
  const usedHandTasks = new Set(selected.map((item) => item.handTask));
  const usedHandZones = new Set(selected.map((item) => item.handPlacementZone));
  const usedMovementPhases = new Set(selected.map((item) => item.movementPhase));
  const usedOrientations = new Set(selected.map((item) => item.bodyOrientation));
  const usedPoseTypes = new Set(selected.map((item) => item.poseType));
  const usedFootwork = new Set(selected.map((item) => item.footwork));

  const minimumDistance = Math.min(
    ...selected.map((item) => personActionSemanticDistance(candidate, item))
  );

  let score = Math.min(minimumDistance, 80);
  if (!usedActionFamilies.has(candidate.diversityFamily)) score += 90;
  if (!usedVisualLegFamilies.has(candidate.visualLegPoseFamily)) score += 80;
  if (!usedHandTasks.has(candidate.handTask)) score += 34;
  if (!usedMovementPhases.has(candidate.movementPhase)) score += 30;
  if (!usedOrientations.has(candidate.bodyOrientation)) score += 24;
  if (!usedHandZones.has(candidate.handPlacementZone)) score += 20;
  if (!usedPoseTypes.has(candidate.poseType)) score += 18;
  if (!usedFootwork.has(candidate.footwork)) score += 16;

  // Keep at least one genuine movement card in a lifestyle set, but do not let
  // walking dominate the series after it has been represented once.
  const walkingAlreadyUsed = selected.some((item) => item.poseType === "walking");
  if (!walkingAlreadyUsed && candidate.poseType === "walking") score += 28;
  if (walkingAlreadyUsed && candidate.poseType === "walking") score -= 10;

  return score;
}

function chooseLifestyleSoftSeedingCandidate(
  candidates: PersonActionDefinition[],
  selected: PersonActionDefinition[],
  seed: string
) {
  const unused = candidates.filter((candidate) => !selected.some((item) => item.id === candidate.id));
  const basePool = unused.length ? unused : candidates;
  if (!basePool.length) return null;

  const usedLegSignatures = new Set(selected.map((item) => item.legActionSignature));
  const uniqueLegPool = basePool.filter((candidate) => !usedLegSignatures.has(candidate.legActionSignature));
  const signatureSafePool = uniqueLegPool.length ? uniqueLegPool : basePool;

  // The external image model tends to render every short-step synonym as the
  // same front-to-back fashion stride. Keep that silhouette to one card.
  const forwardStepAlreadyUsed = selected.some((item) => item.visualLegPoseFamily === "forward-step");
  const noRepeatedForwardStep = forwardStepAlreadyUsed
    ? signatureSafePool.filter((candidate) => candidate.visualLegPoseFamily !== "forward-step")
    : signatureSafePool;
  const safePool = noRepeatedForwardStep.length ? noRepeatedForwardStep : signatureSafePool;

  // Visual leg-pose diversity is a hard gate while an unused family is still
  // available for this card. The novelty score remains useful only inside that
  // safe subset; it must never trade away a fresh silhouette for a new action
  // family or hand task.
  const usedVisualLegFamilies = new Set(selected.map((item) => item.visualLegPoseFamily));
  const unusedVisualLegFamilyPool = safePool.filter(
    (candidate) => !usedVisualLegFamilies.has(candidate.visualLegPoseFamily)
  );
  const visualPool = unusedVisualLegFamilyPool.length ? unusedVisualLegFamilyPool : safePool;

  // Prefer a genuinely new action family after the visual leg-pose constraint
  // has been satisfied. This prevents five variants of the same walk / pause
  // without weakening the established silhouette-diversity contract.
  const usedActionFamilies = new Set(selected.map((item) => item.diversityFamily));
  const unusedActionFamilyPool = visualPool.filter(
    (candidate) => !usedActionFamilies.has(candidate.diversityFamily)
  );
  const semanticPool = unusedActionFamilyPool.length ? unusedActionFamilyPool : visualPool;

  return [...semanticPool].sort((first, second) => {
    const scoreDifference = lifestyleNoveltyScore(second, selected) - lifestyleNoveltyScore(first, selected);
    if (scoreDifference !== 0) return scoreDifference;
    return stableHash(`${seed}:${first.id}`) - stableHash(`${seed}:${second.id}`);
  })[0] ?? null;
}

function eligibleActions(card: SeriesActionCardInput, topic: string) {
  if (!["产品上脚图", "生活场景图", "对镜穿搭图"].includes(card.imageType)) return [];

  if (topic === "棚内上新拍摄" && typeof card.studioLaunchShotIndex === "number") {
    const exact = personActionLibrary.filter(
      (action) => action.category === "studio" && action.studioShotIndex === card.studioLaunchShotIndex
    );
    if (exact.length >= 4) return exact;
    return personActionLibrary.filter(
      (action) => action.category === "studio" &&
        (action.studioShotIndex === card.studioLaunchShotIndex ||
         action.studioShotIndex === (card.studioLaunchShotIndex! + 1))
    );
  }

  if (card.imageType === "对镜穿搭图") {
    return personActionLibrary.filter((action) => action.category === "mirror");
  }

  const candidates = personActionLibrary.filter((action) => {
    if (!action.compatibleImageTypes.includes(card.imageType)) return false;
    if (action.compatibleScenes?.length && !action.compatibleScenes.includes(card.scenePreference)) return false;
    if (action.category === "general") return true;
    if (action.category !== "seated") return false;
    return action.compatibleScenes?.includes(card.scenePreference) ?? false;
  });

  const sceneIsNotMirror = card.scenePreference !== "居家衣帽间" && card.scenePreference !== "衣帽间 / 更衣角";
  const sceneSafeCandidates = sceneIsNotMirror
    ? candidates.filter((action) => !/mirror|selfie|phone|mirror check|outfit check/i.test(action.directive))
    : candidates;
  return sceneSafeCandidates.length >= 3 ? sceneSafeCandidates : candidates;
}

function filterCaptureStyleCandidates(
  candidates: PersonActionDefinition[],
  captureStyle: LifestyleSoftCaptureStyle
) {
  return captureStyle === "telephoto_candid"
    ? candidates.filter((action) =>
        detectShoePerspectiveRisk(`${action.directive} ${action.visualLegPoseLine}`) !== "high"
      )
    : candidates;
}

function chooseCandidate(
  candidates: PersonActionDefinition[],
  selected: PersonActionDefinition[],
  seed: string
) {
  const unused = candidates.filter((candidate) => !selected.some((item) => item.id === candidate.id));
  const pool = unused.length ? unused : candidates;
  if (!pool.length) return null;

  return [...pool].sort((first, second) => {
    const firstLegSignatureUsed = selected.some((item) => item.legActionSignature === first.legActionSignature);
    const secondLegSignatureUsed = selected.some((item) => item.legActionSignature === second.legActionSignature);
    if (firstLegSignatureUsed !== secondLegSignatureUsed) return Number(firstLegSignatureUsed) - Number(secondLegSignatureUsed);

    const firstFootworkUsed = selected.some((item) => item.footwork === first.footwork);
    const secondFootworkUsed = selected.some((item) => item.footwork === second.footwork);
    if (firstFootworkUsed !== secondFootworkUsed) return Number(firstFootworkUsed) - Number(secondFootworkUsed);

    const firstMinimumDistance = selected.length
      ? Math.min(...selected.map((item) => personActionSemanticDistance(first, item)))
      : 0;
    const secondMinimumDistance = selected.length
      ? Math.min(...selected.map((item) => personActionSemanticDistance(second, item)))
      : 0;
    if (firstMinimumDistance !== secondMinimumDistance) return secondMinimumDistance - firstMinimumDistance;

    const firstFamilyUsed = selected.some((item) => item.diversityFamily === first.diversityFamily);
    const secondFamilyUsed = selected.some((item) => item.diversityFamily === second.diversityFamily);
    if (firstFamilyUsed !== secondFamilyUsed) return Number(firstFamilyUsed) - Number(secondFamilyUsed);

    const firstHandZoneUsed = selected.some((item) => item.handPlacementZone === first.handPlacementZone);
    const secondHandZoneUsed = selected.some((item) => item.handPlacementZone === second.handPlacementZone);
    if (firstHandZoneUsed !== secondHandZoneUsed) return Number(firstHandZoneUsed) - Number(secondHandZoneUsed);

    return stableHash(`${seed}:${first.id}`) - stableHash(`${seed}:${second.id}`);
  })[0] ?? null;
}

export function selectDiversePersonActions({
  cards,
  topic,
  variantIndex,
  generationNonce,
  captureStyle = "standard"
}: SelectDiversePersonActionsInput) {
  const selected: PersonActionDefinition[] = [];

  if (topic === "生活场景软种草") {
    const candidatePools = cards.map((card) =>
      filterCaptureStyleCandidates(eligibleActions(card, topic), captureStyle)
    );
    const results: Array<PersonActionDefinition | null> = Array.from({ length: cards.length }, () => null);

    // Choose the most constrained cards first. Mirror cards expose only a few
    // leg-pose families; assigning them after broad general cards can consume
    // all of their unique silhouette options and force a duplicate on card 5.
    const selectionOrder = cards
      .map((_, cardIndex) => ({
        cardIndex,
        familyCount: new Set(candidatePools[cardIndex].map((action) => action.visualLegPoseFamily)).size,
        candidateCount: candidatePools[cardIndex].length
      }))
      .sort((first, second) =>
        first.familyCount - second.familyCount ||
        first.candidateCount - second.candidateCount ||
        first.cardIndex - second.cardIndex
      );

    for (const { cardIndex } of selectionOrder) {
      const selectedAction = chooseLifestyleSoftSeedingCandidate(
        candidatePools[cardIndex],
        selected,
        `${topic}:${variantIndex}:${generationNonce}:${cardIndex}`
      );
      if (!selectedAction) continue;
      selected.push(selectedAction);
      results[cardIndex] = {
        ...selectedAction,
        directive: `${selectedAction.directive} ${selectedAction.visualLegPoseLine}`
      };
    }

    return results;
  }

  return cards.map((card, cardIndex) => {
    const candidates = filterCaptureStyleCandidates(eligibleActions(card, topic), captureStyle);
    const selectedAction = topic === "棚内上新拍摄" && candidates.length
      ? (() => {
          const start = Math.abs(generationNonce + variantIndex + cardIndex) % candidates.length;
          const rotated = [...candidates.slice(start), ...candidates.slice(0, start)];
          return rotated.find((candidate) =>
            !selected.some((item) => item.legActionSignature === candidate.legActionSignature)
          ) ?? rotated[0];
        })()
      : selected.length === 0 && candidates.length
        ? candidates[Math.abs(generationNonce + variantIndex) % candidates.length]
        : chooseCandidate(
            candidates,
            selected,
            `${topic}:${variantIndex}:${generationNonce}:${cardIndex}`
          );
    if (selectedAction) selected.push(selectedAction);
    return selectedAction;
  });
}
