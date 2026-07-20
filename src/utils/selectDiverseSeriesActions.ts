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
  if (first.diversityFamily !== second.diversityFamily) distance += 8;
  if (first.bodyOrientation !== second.bodyOrientation) distance += 3;
  if (first.footwork !== second.footwork) distance += 3;
  if (first.movementPhase !== second.movementPhase) distance += 2;
  if (first.handTask !== second.handTask) distance += 3;
  if (first.framing !== second.framing) distance += 2;
  if (first.poseType !== second.poseType) distance += 3;
  return distance;
}

function eligibleActions(card: SeriesActionCardInput, topic: string) {
  if (!["产品上脚图", "生活场景图", "对镜穿搭图"].includes(card.imageType)) return [];

  if (topic === "棚内上新拍摄" && typeof card.studioLaunchShotIndex === "number") {
    return personActionLibrary.filter(
      (action) => action.category === "studio" && action.studioShotIndex === card.studioLaunchShotIndex
    );
  }

  if (card.imageType === "对镜穿搭图") {
    return personActionLibrary.filter((action) => action.category === "mirror");
  }

  return personActionLibrary.filter((action) => {
    if (!action.compatibleImageTypes.includes(card.imageType)) return false;
    if (action.category === "general") return true;
    if (action.category !== "seated") return false;
    return action.compatibleScenes?.includes(card.scenePreference) ?? false;
  });
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
    const action = chooseCandidate(
      eligibleActions(card, topic),
      selected,
      `${topic}:${variantIndex}:${generationNonce}:${cardIndex}`
    );
    if (action) selected.push(action);
    return action;
  });
}
