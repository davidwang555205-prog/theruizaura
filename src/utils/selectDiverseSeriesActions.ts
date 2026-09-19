import {
  personActionLibrary,
  type PersonActionDefinition,
  type PersonActionMacroGroup
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

const LIFESTYLE_NO_WALKING_SCENES = new Set<TeamScenePreference>([
  "朋友午餐",
  "咖啡馆内",
  "窗边阅读",
  "衣帽间 / 更衣角",
  "健身房内",
  "停车场到电梯口",
  "楼下便利店 / 咖啡外带"
]);

const LIFESTYLE_SEATED_OR_STATIONARY_SCENES = new Set<TeamScenePreference>([
  "朋友午餐",
  "咖啡馆内",
  "窗边阅读"
]);

const LIFESTYLE_MACRO_PRIORITY: PersonActionMacroGroup[] = [
  "walkTransition",
  "turnOrArrival",
  "clothingTask",
  "environmentTask",
  "onFootPlacement",
  "seatedOrGrounded",
  "standStill"
];

function assignLifestyleMacroGroups(
  candidatePools: PersonActionDefinition[][],
  captureStyle: LifestyleSoftCaptureStyle,
  variantIndex: number,
  generationNonce: number
) {
  const prioritySource = LIFESTYLE_MACRO_PRIORITY;
  const rotation = Math.abs(variantIndex + generationNonce) % prioritySource.length;
  const priority = [...prioritySource.slice(rotation), ...prioritySource.slice(0, rotation)];
  const usedGroups = new Set<PersonActionMacroGroup>();
  const groupCounts = new Map<PersonActionMacroGroup, number>();
  const assignedGroups: Array<PersonActionMacroGroup | null> = [];
  const maxStandStill = candidatePools.length === 3 ? 1 : candidatePools.length === 5 ? 2 : Number.POSITIVE_INFINITY;

  return candidatePools.map((pool, cardIndex) => {
    const available = new Set(pool.map((action) => action.macroActionGroup));
    const previousGroup = cardIndex > 0 ? assignedGroups[cardIndex - 1] : null;
    const eligible = priority.filter((group) => available.has(group));
    const scored = eligible.map((group) => {
      let score = 0;
      if (group === previousGroup) score -= 10000;
      if (!usedGroups.has(group)) score += 1000;
      if (group === "standStill" && (groupCounts.get(group) ?? 0) >= maxStandStill) score -= 10000;

      if (captureStyle === "telephoto_candid") {
        if (!usedGroups.has("walkTransition") && group === "walkTransition") score += 600;
        if (
          !["clothingTask", "environmentTask"].some((item) => usedGroups.has(item as PersonActionMacroGroup)) &&
          ["clothingTask", "environmentTask"].includes(group)
        ) {
          score += 500;
        }
        if (
          !["turnOrArrival", "onFootPlacement", "seatedOrGrounded"].some((item) => usedGroups.has(item as PersonActionMacroGroup)) &&
          ["turnOrArrival", "onFootPlacement", "seatedOrGrounded"].includes(group)
        ) {
          score += 400;
        }
      }

      score += priority.length - priority.indexOf(group);
      return { group, score };
    });
    scored.sort((first, second) => second.score - first.score);
    let assigned = scored[0]?.group ?? [...available].find((group) => group !== previousGroup) ?? [...available][0];
    if (!assigned) assigned = "standStill";
    usedGroups.add(assigned);
    groupCounts.set(assigned, (groupCounts.get(assigned) ?? 0) + 1);
    assignedGroups[cardIndex] = assigned;
    return assigned;
  });
}

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
    action.macroActionGroup,
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
  if (first.macroActionGroup !== second.macroActionGroup) distance += 20;
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
  const usedMacroGroups = new Set(selected.map((item) => item.macroActionGroup));

  const usedVisualLegFamilies = new Set(selected.map((item) => item.visualLegPoseFamily));
  const usedActionFamilies = new Set(selected.map((item) => item.diversityFamily));
  const usedHandTasks = new Set(selected.map((item) => item.handTask));
  const usedHandZones = new Set(selected.map((item) => item.handPlacementZone));
  const usedMovementPhases = new Set(selected.map((item) => item.movementPhase));
  const usedOrientations = new Set(selected.map((item) => item.bodyOrientation));
  const usedPoseTypes = new Set(selected.map((item) => item.poseType));
  const usedFootwork = new Set(selected.map((item) => item.footwork));

  const minimumDistance = selected.length
    ? Math.min(...selected.map((item) => personActionSemanticDistance(candidate, item)))
    : 0;

  let score = Math.min(minimumDistance, 80);
  if (!selected.length) return score;
  if (!usedMacroGroups.has(candidate.macroActionGroup)) score += 110;
  if (usedMacroGroups.has(candidate.macroActionGroup)) score -= 28;
  if (!usedActionFamilies.has(candidate.diversityFamily)) score += 90;
  if (!usedVisualLegFamilies.has(candidate.visualLegPoseFamily)) score += 80;
  if (!usedHandTasks.has(candidate.handTask)) score += 50;
  if (usedHandTasks.has(candidate.handTask)) score -= 18;
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
  seed: string,
  preferredMacroGroup?: PersonActionMacroGroup | null,
  allowBroaderLegFallback = true
) {
  const preferredCandidates = preferredMacroGroup
    ? candidates.filter((candidate) => candidate.macroActionGroup === preferredMacroGroup)
    : candidates;
  const sourceCandidates = preferredCandidates.length ? preferredCandidates : candidates;
  const allUnusedCandidates = candidates.filter((candidate) => !selected.some((item) => item.id === candidate.id));
  const allBaseCandidates = allUnusedCandidates.length ? allUnusedCandidates : candidates;
  const unused = sourceCandidates.filter((candidate) => !selected.some((item) => item.id === candidate.id));
  const basePool = unused.length ? unused : sourceCandidates;
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

  // Keep pocket-edge behavior to one card when another valid hand task exists.
  // Image models often exaggerate repeated pocket cues into the same pose even
  // when the rest of the action definition differs.
  const pocketEdgeAlreadyUsed = selected.some((item) => item.handTask === "pocketEdge");
  const handSafePool = pocketEdgeAlreadyUsed
    ? safePool.filter((candidate) => candidate.handTask !== "pocketEdge")
    : safePool;
  const handPool = handSafePool.length ? handSafePool : safePool;

  const allLegSignatureSafePool = allBaseCandidates.filter(
    (candidate) => !usedLegSignatures.has(candidate.legActionSignature)
  );
  const allForwardSafePool = forwardStepAlreadyUsed
    ? allLegSignatureSafePool.filter((candidate) => candidate.visualLegPoseFamily !== "forward-step")
    : allLegSignatureSafePool;
  const allHandSafePool = pocketEdgeAlreadyUsed
    ? allForwardSafePool.filter((candidate) => candidate.handTask !== "pocketEdge")
    : allForwardSafePool;
  const allHandPool = allHandSafePool.length ? allHandSafePool : allForwardSafePool;

  // Allocate an unused macro-action group before micro variation. The external
  // model sees the whole-body silhouette first, then the smaller leg and hand
  // cues; prioritizing those cues over a new macro group creates apparent
  // diversity that is not visible in the final image.
  const usedMacroGroups = new Set(selected.map((item) => item.macroActionGroup));
  const unusedMacroGroupPool = preferredMacroGroup
    ? handPool
    : handPool.filter((candidate) => !usedMacroGroups.has(candidate.macroActionGroup));
  const macroPool = unusedMacroGroupPool.length ? unusedMacroGroupPool : handPool;

  // Keep one card per visual leg-pose family while one is still available.
  // This remains subordinate to the macro-action allocation above.
  const usedVisualLegFamilies = new Set(selected.map((item) => item.visualLegPoseFamily));
  const unusedVisualLegFamilyPool = macroPool.filter(
    (candidate) => !usedVisualLegFamilies.has(candidate.visualLegPoseFamily)
  );
  const broaderUnusedVisualLegFamilyPool = allowBroaderLegFallback
    ? allHandPool.filter((candidate) => !usedVisualLegFamilies.has(candidate.visualLegPoseFamily))
    : [];
  const visualPool = unusedVisualLegFamilyPool.length
    ? unusedVisualLegFamilyPool
    : broaderUnusedVisualLegFamilyPool.length
      ? broaderUnusedVisualLegFamilyPool
      : macroPool;

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

function isLifestyleActionSceneCompatible(
  card: SeriesActionCardInput,
  action: PersonActionDefinition
) {
  if (!LIFESTYLE_NO_WALKING_SCENES.has(card.scenePreference)) return true;

  if (action.poseType === "walking") return false;
  if (["forward", "diagonal", "lateral"].includes(action.travelDirection)) return false;
  if (["stepStart", "midStep"].includes(action.footwork)) return false;

  if (LIFESTYLE_SEATED_OR_STATIONARY_SCENES.has(card.scenePreference)) {
    return action.category === "seated" ||
      action.travelDirection === "stationary" ||
      action.movementPhase === "still" ||
      action.movementPhase === "settling" ||
      action.movementPhase === "task";
  }

  return true;
}

function filterSceneActionCompatibilityCandidates(
  candidates: PersonActionDefinition[],
  card: SeriesActionCardInput
) {
  const compatible = candidates.filter((action) => isLifestyleActionSceneCompatible(card, action));
  // Preserve enough choice for series-level leg-pose diversity. If a future
  // scene has too few compatible actions, fall back rather than silently
  // returning no action at all; the validator will expose the coverage gap.
  return compatible.length >= 3 ? compatible : candidates;
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
      filterCaptureStyleCandidates(
        filterSceneActionCompatibilityCandidates(eligibleActions(card, topic), card),
        captureStyle
      )
    );
    const preferredMacroGroups = captureStyle === "telephoto_candid"
      ? assignLifestyleMacroGroups(candidatePools, captureStyle, variantIndex, generationNonce)
      : Array.from({ length: cards.length }, () => null);
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
        `${topic}:${variantIndex}:${generationNonce}:${cardIndex}`,
        preferredMacroGroups[cardIndex],
        cards.length <= 5 &&
          (preferredMacroGroups[cardIndex] === null || preferredMacroGroups[cardIndex] === "standStill")
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
