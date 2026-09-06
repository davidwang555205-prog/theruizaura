import {
  personActionLibrary,
  type PersonActionDefinition
} from "../data/personActionLibrary";
import type { TeamImageType, TeamScenePreference } from "../types";

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
};

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function personActionSemanticDistance(
  first: PersonActionDefinition,
  second: PersonActionDefinition
) {
  if (first.id === second.id) return 0;
  let distance = 0;
  if (first.legActionSignature !== second.legActionSignature) distance += 12;
  if (first.visualLegPoseFamily !== second.visualLegPoseFamily) distance += 18;
  if (first.supportLeg !== second.supportLeg) distance += 5;
  if (first.travelDirection !== second.travelDirection) distance += 5;
  if (first.heelState !== second.heelState) distance += 4;
  if (first.kneeState !== second.kneeState) distance += 3;
  if (first.footSpacing !== second.footSpacing) distance += 2;
  if (first.diversityFamily !== second.diversityFamily) distance += 6;
  if (first.bodyOrientation !== second.bodyOrientation) distance += 3;
  if (first.footwork !== second.footwork) distance += 3;
  if (first.movementPhase !== second.movementPhase) distance += 2;
  if (first.handTask !== second.handTask) distance += 3;
  if (first.handPlacementZone !== second.handPlacementZone) distance += 4;
  if (first.framing !== second.framing) distance += 2;
  if (first.poseType !== second.poseType) distance += 3;
  return distance;
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
  // same front-to-back fashion stride. Keep that silhouette to one card and
  // choose visibly different leg families before returning to one family.
  const forwardStepAlreadyUsed = selected.some((item) => item.visualLegPoseFamily === "forward-step");
  const noRepeatedForwardStep = forwardStepAlreadyUsed
    ? signatureSafePool.filter((candidate) => candidate.visualLegPoseFamily !== "forward-step")
    : signatureSafePool;
  const safePool = noRepeatedForwardStep.length ? noRepeatedForwardStep : signatureSafePool;
  const hasWalkingPose = selected.some((item) => item.poseType === "walking");
  const nonForwardWalkingPool = safePool.filter(
    (candidate) => candidate.poseType === "walking" && candidate.visualLegPoseFamily !== "forward-step"
  );
  const walkingPool = nonForwardWalkingPool.length
    ? nonForwardWalkingPool
    : safePool.filter((candidate) => candidate.poseType === "walking");
  const poseBalancedPool = selected.length >= 1 && !hasWalkingPose && walkingPool.length
    ? walkingPool
    : safePool;
  const usedFamilies = new Set(selected.map((item) => item.visualLegPoseFamily));
  const unusedFamilyPool = poseBalancedPool.filter((candidate) => !usedFamilies.has(candidate.visualLegPoseFamily));
  const visualPool = unusedFamilyPool.length ? unusedFamilyPool : poseBalancedPool;
  const families = [...new Set(visualPool.map((candidate) => candidate.visualLegPoseFamily))].sort();
  const preferredFamily = families[stableHash(seed) % families.length];
  const familyPool = visualPool.filter((candidate) => candidate.visualLegPoseFamily === preferredFamily);
  const candidatePool = familyPool.length ? familyPool : visualPool;

  return [...candidatePool].sort(
    (first, second) => stableHash(`${seed}:${first.id}`) - stableHash(`${seed}:${second.id}`)
  )[0] ?? null;
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
  generationNonce
}: SelectDiversePersonActionsInput) {
  const selected: PersonActionDefinition[] = [];
  return cards.map((card, cardIndex) => {
    const candidates = eligibleActions(card, topic);
    const selectedAction = topic === "棚内上新拍摄" && candidates.length
      ? (() => {
          const start = Math.abs(generationNonce + variantIndex + cardIndex) % candidates.length;
          const rotated = [...candidates.slice(start), ...candidates.slice(0, start)];
          return rotated.find((candidate) =>
            !selected.some((item) => item.legActionSignature === candidate.legActionSignature)
          ) ?? rotated[0];
        })()
      : topic === "生活场景软种草" && candidates.length
        ? chooseLifestyleSoftSeedingCandidate(
            candidates,
            selected,
            `${topic}:${variantIndex}:${generationNonce}:${cardIndex}`
          )
      : selected.length === 0 && candidates.length
        ? candidates[Math.abs(generationNonce + variantIndex) % candidates.length]
      : chooseCandidate(
          candidates,
          selected,
          `${topic}:${variantIndex}:${generationNonce}:${cardIndex}`
        );
    const action = topic === "生活场景软种草" && selectedAction
      ? {
          ...selectedAction,
          directive: `${selectedAction.directive} ${selectedAction.visualLegPoseLine}`
        }
      : selectedAction;
    if (action) selected.push(action);
    return action;
  });
}
