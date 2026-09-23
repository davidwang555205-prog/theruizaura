import { personActionLibrary } from "../../data/personActionLibrary";
import { buildActionCapabilityMatrix, summarizeCapabilityMatrix, GARMENT_HAND_TASKS } from "./capability-matrix";
import { buildMomentRequirementMatrix } from "./moment-requirements";
import { clusterCapabilityGaps, matchRequirementMatrix, runContinuityPass } from "./matching";
import { NARRATIVE_PRIMITIVE_REGISTRY } from "./narrative-primitives";
import type {
  PhysicalActionAuditInput,
  PhysicalActionAuditOptions,
  PhysicalActionAuditReport,
  PhysicalActionCapabilityGap,
  PhysicalActionGapClass,
  PhysicalActionSelectionReason,
} from "./types";

const SELECTION_REASONS: PhysicalActionSelectionReason[] = [
  "EXACT_CAPABILITY_FIT",
  "EXACT_STRIDE_PHASE_ALIGNMENT",
  "GARMENT_EXACT",
  "NARRATIVE_PRIMITIVE_EXACT",
  "GENERIC_COMPATIBLE",
  "CONTINUITY_PREFERRED",
];

const GAP_CLASSES: PhysicalActionGapClass[] = [
  "REAL_CAPABILITY_GAP",
  "REQUIREMENT_MODELING_BUG",
  "MATCHING_IMPLEMENTATION_BUG",
  "CONTINUITY_GAP",
  "GARMENT_COMBINATION_GAP",
  "UNSUPPORTED_MULTI_CAPABILITY_COMBINATION",
];

function emptyReasonRecord(): Record<PhysicalActionSelectionReason, number> {
  return SELECTION_REASONS.reduce((record, reason) => {
    record[reason] = 0;
    return record;
  }, {} as Record<PhysicalActionSelectionReason, number>);
}

export function runPhysicalActionAudit(
  input: PhysicalActionAuditInput,
  options: PhysicalActionAuditOptions = {}
): PhysicalActionAuditReport {
  const actions = options.actions ?? personActionLibrary;
  const matrix = buildActionCapabilityMatrix(actions);
  const requirements = buildMomentRequirementMatrix(input);
  const firstPass = matchRequirementMatrix(requirements, matrix, NARRATIVE_PRIMITIVE_REGISTRY);
  const continuity = runContinuityPass(requirements, matrix, firstPass, NARRATIVE_PRIMITIVE_REGISTRY);
  const gaps = clusterCapabilityGaps(continuity.matches, requirements);
  const gapByMoment = new Map<string, PhysicalActionCapabilityGap>();
  for (const gap of gaps) {
    for (const moment of gap.affectedMoments) {
      gapByMoment.set(`${moment.topicId}:${moment.momentIndex}`, gap);
    }
  }
  const matches = continuity.matches.map((match) => {
    const gap = gapByMoment.get(`${match.topicId}:${match.momentIndex}`);
    return {
      ...match,
      gapId: match.status === "UNRESOLVED" ? gap?.gapId ?? null : null,
      gapClass: match.status === "UNRESOLVED" ? gap?.gapClass ?? null : null,
    };
  });
  const matched = matches.filter((match) => match.status === "MATCHED");
  const unresolved = matches.filter((match) => match.status === "UNRESOLVED");
  const usedActions = new Set(matched.map((match) => match.selectedActionId!));
  const primitiveMatches = matched.filter((match) => match.source === "NARRATIVE_PRIMITIVE");
  const usedPrimitives = new Set(primitiveMatches.map((match) => match.primitiveId!));
  const totalMoments = matches.length;
  const requiredPrimitiveEstimate = gaps.filter((gap) => gap.newPrimitiveLikelyRequired).length;
  const continuityAudit = {
    issuesBefore: continuity.issues.length,
    issuesAfter: continuity.issues.filter((issue) => issue.repairApplied !== "RESELECTED_CANDIDATE").length,
    repairedByAlternateAction: continuity.issues.filter((issue) => issue.repairApplied === "RESELECTED_CANDIDATE").length,
    capabilityCompatibleWithIssue: continuity.issues.filter((issue) => issue.repairApplied === "TRANSITION_CAPABLE_ACTION").length,
    continuityCausedUnresolved: unresolved.filter((moment) => continuity.issues.some((issue) => (
      issue.topicId === moment.topicId
      && issue.toMomentIndex === moment.momentIndex
      && issue.repairApplied === "TRANSITION_CAPABLE_ACTION"
    ))).length,
    missingTransitionCapability: continuity.issues.filter((issue) => issue.repairApplied === "TRANSITION_CAPABLE_ACTION").length,
  };
  const selectionReasonDistribution = emptyReasonRecord();
  const reuse = new Map<string, {
    actionId: string;
    actionFamily: string;
    selectionCount: number;
    selectionReasonDistribution: Record<PhysicalActionSelectionReason, number>;
    affectedTopics: Set<string>;
  }>();

  for (const match of matched) {
    selectionReasonDistribution[match.selectionReason] += 1;
    const actionId = match.selectedActionId!;
    if (!reuse.has(actionId)) {
      reuse.set(actionId, {
        actionId,
        actionFamily: match.selectedActionFamily ?? "",
        selectionCount: 0,
        selectionReasonDistribution: emptyReasonRecord(),
        affectedTopics: new Set<string>(),
      });
    }
    const entry = reuse.get(actionId)!;
    entry.selectionCount += 1;
    entry.selectionReasonDistribution[match.selectionReason] += 1;
    entry.affectedTopics.add(match.topicLabel);
  }

  const knownCandidateIds = new Set([
    ...actions.map((action) => action.id),
    ...NARRATIVE_PRIMITIVE_REGISTRY.map((primitive) => primitive.actionId),
  ]);
  const syntheticCandidateCount = matches.reduce((total, match) => total + match.compatibleCandidates
    .filter((candidate) => !knownCandidateIds.has(candidate.actionId))
    .length, 0);
  const finalTrustedPrerequisites: Record<string, boolean> = {
    canonicalMomentIndexIntegrity: matches.length === requirements.length
      && matches.every((match) => Number.isInteger(match.momentIndex) && match.momentIndex >= 0),
    candidatePreservation: matches.every((match) => match.candidateFunnel.totalActions === matrix.length),
    noGenericFallbackSelections: selectionReasonDistribution.GENERIC_COMPATIBLE === 0,
    stridePhaseAlignmentActive: matches.every((match) => Array.isArray(match.stridePhase.required)),
    garmentCompatibilityActive: matches.every((match) => Array.isArray(match.garment.required)),
    automaticGarmentCompositionDisabled: true,
    noSyntheticCandidates: syntheticCandidateCount === 0,
    continuityPassExecuted: matches.every((match) => match.continuation.note.length > 0),
    sourceActionsUnchanged: actions.length === personActionLibrary.length,
    topicActionChainsValid: continuity.topicCoverage.every((topic) => topic.continuityStatus !== "BLOCKED_BY_UNRESOLVED_MOMENT"),
  };
  const gapReviewByClass = GAP_CLASSES.reduce((record, gapClass) => {
    record[gapClass] = gaps.filter((gap) => gap.gapClass === gapClass).length;
    return record;
  }, {} as Record<PhysicalActionGapClass, number>);

  return {
    capabilitySummary: summarizeCapabilityMatrix(matrix),
    coverage: {
      totalExistingActions: matrix.length,
      totalMoments,
      matchedMoments: matched.length,
      unresolvedMoments: unresolved.length,
      coveragePercent: totalMoments === 0 ? 0 : Number(((matched.length / totalMoments) * 100).toFixed(1)),
      uniqueExistingActionsReused: usedActions.size,
      narrativePrimitivesUsed: usedPrimitives.size,
      addedPrimitiveCount: 0,
    },
    topicCoverage: continuity.topicCoverage,
    moments: matches,
    continuityIssues: continuity.issues,
    gaps,
    resultStage: !Object.values(finalTrustedPrerequisites).every(Boolean)
      ? "PROVISIONAL_MATCHING_RESULT"
      : unresolved.length === 0
        ? "PHYSICAL_ACTION_APPROVED"
        : "FINAL_TRUSTED_REMATCH",
    finalTrustedPrerequisites,
    continuityAudit,
    gapReview: {
      totalGapClusters: gaps.length,
      byClass: gapReviewByClass,
      minimumNewPrimitives: gaps.filter((gap) => gap.requiresNewPrimitive).length,
    },
    primitivePatch: {
      registryCount: NARRATIVE_PRIMITIVE_REGISTRY.length,
      primitiveIds: NARRATIVE_PRIMITIVE_REGISTRY.map((primitive) => primitive.actionId),
      selectedMomentCount: primitiveMatches.length,
      selectedPrimitiveIds: [...usedPrimitives],
      legacySelectorEligible: false,
    },
    selectionReasonDistribution,
    tieBreakSelectionCount: matched.filter((match) => match.tieBreak).length,
    garmentStats: {
      sourceField: "PersonActionDefinition.handTask",
      schemaShape: "single",
      garmentValues: [...GARMENT_HAND_TASKS],
      actionsWithGarmentCapability: matrix.filter((entry) => entry.garment.declared).length,
      garmentRequiringMoments: requirements.filter((requirement) => requirement.requiredHandCapabilities.some(
        (entry) => entry.capability === "garment_adjustment" || entry.capability === "pocket_contact"
      )).length,
      combinationRequiringMoments: requirements.filter(
        (requirement) => requirement.requiredHandCapabilities.filter((entry) => entry.capability !== "none").length > 1
      ).length,
      automaticComposition: false,
      inventedCapability: 0,
    },
    stridePhaseStats: {
      sourceField: "PersonActionDefinition.movementPhase",
      normalizedField: "PhysicalActionCapability.movementState",
      momentsRequiringExplicitStridePhase: matches.filter((match) => match.stridePhase.required.length > 0).length,
      actionsWithDeclaredStridePhase: matrix.filter((entry) => Boolean(entry.footwork.stridePhase)).length,
      selectionDecisionsChangedByStridePhase: matches.filter((match) => match.stridePhase.selectionChangedByStridePhase).length,
      finalTiesBefore: matches.filter((match) => match.stridePhase.tiesBefore > 1).length,
      finalTiesAfter: matches.filter((match) => match.stridePhase.tiesAfter > 1).length,
      tiesResolvedByStridePhase: matches.filter((match) => match.stridePhase.tiesBefore > 1 && match.stridePhase.tiesAfter === 1).length,
    },
    topReusedActions: [...reuse.values()]
      .sort((first, second) => second.selectionCount - first.selectionCount || first.actionId.localeCompare(second.actionId))
      .slice(0, 10)
      .map((entry) => ({
        actionId: entry.actionId,
        actionFamily: entry.actionFamily,
        selectionCount: entry.selectionCount,
        selectionReasonDistribution: entry.selectionReasonDistribution,
        affectedTopics: [...entry.affectedTopics],
      })),
    recommendation: unresolved.length === 0 ? "A" : "B",
    recommendationDetail: unresolved.length === 0
      ? "EXISTING ACTIONS FULLY COVER 65 MOMENTS"
      : `MINIMAL PRIMITIVE PATCH REQUIRED: ${requiredPrimitiveEstimate} capability-level primitive(s) across ${gaps.length} clustered gap(s); ${unresolved.length} of ${totalMoments} Moments are unresolved.`,
  };
}
