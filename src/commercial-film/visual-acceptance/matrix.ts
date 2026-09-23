import { runCommercialFilmPipeline } from "../pipeline";
import type { CommercialDirectorConceptId } from "../director-concept/types";
import type { CommercialIntentId } from "../types";
import type { ProductCoverage } from "../../visual-system/taskReferenceBinding";
import {
  COMMERCIAL_VISUAL_ACCEPTANCE_ASPECT_RATIO,
  COMMERCIAL_VISUAL_ACCEPTANCE_SCHEMA_VERSION,
  COMMERCIAL_VISUAL_FAILURE_CODES,
  type CommercialVisualAcceptanceCase,
  type CommercialVisualAcceptanceControlContract,
  type CommercialVisualAcceptanceMatrix,
  type CommercialVisualAcceptanceResult,
} from "./types";
import {
  createEmptyCommercialVisualReview,
  resolveCommercialVisualFinalStatus,
  validateCommercialVisualReviewResult,
} from "./review";

const CONCEPTS: CommercialDirectorConceptId[] = [
  "STATIC_CAMERA_FILM",
  "PARTIAL_OBSCURATION",
  "EDGE_OF_FRAME",
  "THRESHOLD_CHAIN",
  "REFLECTION_WORLD",
  "LIGHT_REVEAL",
  "WORLD_MOVES_SUBJECT_SETTLES",
  "REPEATED_GESTURE",
];

const CONTROL_CONCEPT: CommercialDirectorConceptId = "STATIC_CAMERA_FILM";
const CONTROL_INTENTS: CommercialIntentId[] = [
  "URBAN_MOTION",
  "DAILY_STYLING",
  "PRODUCT_CRAFT",
  "NEW_ARRIVAL",
];
const COVERAGE: ProductCoverage[] = [
  "silhouette",
  "toe_structure",
  "side_panel_structure",
  "heel_structure",
  "outsole_profile",
  "color_blocking",
  "material_evidence",
];

export const COMMERCIAL_VISUAL_ACCEPTANCE_CHARACTER_SELECTION = {
  ageProfileId: "age_33_37",
  appearanceGroupId: "asian",
} as const;
export const COMMERCIAL_VISUAL_ACCEPTANCE_SEASON = "秋" as const;
export const COMMERCIAL_VISUAL_ACCEPTANCE_LIFESTYLE_FEELING = "安静 / 自然 / 克制" as const;

const INTERNAL_LEAKAGE_PATTERNS = [
  /\b(?:STATIC_CAMERA_FILM|PARTIAL_OBSCURATION|EDGE_OF_FRAME|THRESHOLD_CHAIN|REFLECTION_WORLD|LIGHT_REVEAL|WORLD_MOVES_SUBJECT_SETTLES|REPEATED_GESTURE)\b/,
  /\b(?:PRIMARY|SUPPORTING|RESOLUTION)\b/,
  /\b(?:PRIVATE_MOMENT|CITY_JOURNEY|EVERYDAY_MOVEMENT|STATE_TRANSITION|SENSORY_LIFE|SINGLE_IDEA)\b/,
  /\b(?:ACTION_CUT|MATCH_MOVEMENT|SENSORY_INSERT|DELAYED_REVEAL)\b/,
  /\b(?:ACTION_COMPLETION|ACTION_CONTINUATION|VISUAL_MATCH|ATTENTION_SHIFT|SPATIAL_TRANSITION|PRODUCT_DISCOVERY|EMOTIONAL_RELEASE)\b/,
  /\[(?:COMMERCIAL PLAN|SHOT PLAN|CAMERA PLAN|SOUND PLAN|REFERENCE STATE)\]/,
  /\b(?:walking|transition|standing|turning|garment-task|scene-interaction|environment-response|on-foot|seated|studio-[a-z-]+|mirror-[a-z-]+)-\d{3}\b/i,
  /\b(?:QC|validator|validation status|source id|primitive id|enum)\b/i,
];

const UNRESOLVED_CHOICE_PATTERNS = [
  /\b(?:TBD|TODO|UNRESOLVED)\b/i,
  /\bOPTION_[A-Z0-9_]+\b/,
  /\b(?:A|B)\s*\/\s*(?:A|B)\b/,
  /\beither\b[\s\S]{0,80}\bor\b/i,
];

export const COMMERCIAL_VISUAL_ACCEPTANCE_CONTROL_CONTRACT: CommercialVisualAcceptanceControlContract = {
  sameProduct: true,
  sameReferenceSet: true,
  sameSeedanceModelVersion: true,
  sameDuration: true,
  sameAspectRatio: true,
  sameGenerationSettingsWherePossible: true,
  canonicalTextOnly: true,
  noPerCasePromptEditing: true,
  noBestOfSelection: true,
  attemptsMustBeRecorded: true,
  visualReviewerMustNotSeeDebugMetadata: true,
  providerExecutionByHarness: false,
};

function createCase(
  caseId: string,
  group: "A" | "B",
  intent: CommercialIntentId,
  directorConceptOverride: CommercialDirectorConceptId,
  generationNonce: number
): CommercialVisualAcceptanceCase {
  const outcome = runCommercialFilmPipeline({
    commercialIntent: intent,
    characterSelection: { ...COMMERCIAL_VISUAL_ACCEPTANCE_CHARACTER_SELECTION },
    season: COMMERCIAL_VISUAL_ACCEPTANCE_SEASON,
    lifestyleFeeling: COMMERCIAL_VISUAL_ACCEPTANCE_LIFESTYLE_FEELING,
    duration: 15,
    generationNonce,
    directorConceptOverride,
    reference: {
      referenceSetId: `visual-acceptance-${caseId}`,
      taskId: "visual-acceptance-control-task",
      sourceType: "current_task_reference_set",
      confirmationStatus: "incomplete",
      confirmedReferenceCount: 0,
      confirmedAssetIds: [],
      coverage: [],
      missingCoverage: COVERAGE,
      referencePlanReady: false,
      productTruthMode: "reference_bound",
      productTruth: null,
    },
  });
  if (outcome.status !== "GENERATED") {
    throw new Error(`${caseId} canonical generation blocked: ${outcome.diagnostics.join(" | ")}`);
  }
  if (outcome.executionValidation.status !== "COMMERCIAL_EXECUTION_VALIDATED") {
    throw new Error(`${caseId} canonical execution validation failed.`);
  }
  const plan = outcome.plan;
  const review = createEmptyCommercialVisualReview(caseId);
  return {
    caseId,
    group,
    intent,
    directorConceptId: plan.directorConcept.concept,
    cinematicDevice: plan.directorConcept.label,
    generationNonce,
    duration: 15,
    aspectRatio: COMMERCIAL_VISUAL_ACCEPTANCE_ASPECT_RATIO,
    canonicalCompiledText: outcome.modelFacingScript.compiledText,
    directorPlanSummary: {
      concept: plan.directorConcept.concept,
      label: plan.directorConcept.label,
      globalRule: plan.directorConcept.globalRule,
      heroRule: plan.directorConcept.heroRule,
      releaseRule: plan.directorConcept.releaseRule,
      shotContributions: plan.directorConcept.shots.map((shot) => shot.contribution),
    },
    eventSpineSummary: {
      centralEvent: plan.eventSpine.centralEvent,
      eventChain: [...plan.eventSpine.eventChain],
      durationPlan: [...plan.eventSpine.durationPlan],
      endingGrammar: plan.eventSpine.endingGrammar.label,
    },
    shotCount: plan.shotArchitecture.shots.length,
    productRevealStrategy: plan.productVisibilityPlan.revealStrategy,
    transitionStrategy: plan.creativeDirection.shotDirections.map((shot) => shot.editExit),
    endingStrategy: plan.endingStrategy.line,
    scriptValidationStatus: "COMMERCIAL_EXECUTION_VALIDATED",
    visualReviewStatus: review.reviewStatus,
  };
}

export function buildCommercialVisualAcceptanceMatrix(): CommercialVisualAcceptanceMatrix {
  const cases: CommercialVisualAcceptanceCase[] = [
    ...CONCEPTS.map((concept, index) => createCase(
      `case-${String(index + 1).padStart(2, "0")}`,
      "A",
      "QUIET_LUXURY",
      concept,
      0
    )),
    ...CONTROL_INTENTS.map((intent, index) => createCase(
      `case-${String(index + 9).padStart(2, "0")}`,
      "B",
      intent,
      CONTROL_CONCEPT,
      0
    )),
  ];
  const reviewResults = cases.map((testCase) => createEmptyCommercialVisualReview(testCase.caseId));
  return {
    schemaVersion: COMMERCIAL_VISUAL_ACCEPTANCE_SCHEMA_VERSION,
    controlContract: { ...COMMERCIAL_VISUAL_ACCEPTANCE_CONTROL_CONTRACT },
    cases,
    reviewResults,
    finalVisualStatus: resolveCommercialVisualFinalStatus(reviewResults),
  };
}

function hasInternalLeakage(text: string) {
  return INTERNAL_LEAKAGE_PATTERNS.some((pattern) => pattern.test(text));
}

function hasUnresolvedChoice(text: string) {
  return UNRESOLVED_CHOICE_PATTERNS.some((pattern) => pattern.test(text));
}

export function validateCommercialVisualAcceptanceMatrix(
  matrix: CommercialVisualAcceptanceMatrix
) {
  const failures: string[] = [];
  const expectedCaseIds = Array.from(
    { length: 12 },
    (_, index) => `case-${String(index + 1).padStart(2, "0")}`
  );
  const caseIds = matrix.cases.map((testCase) => testCase.caseId);
  if (matrix.schemaVersion !== COMMERCIAL_VISUAL_ACCEPTANCE_SCHEMA_VERSION) {
    failures.push(`Unexpected schema version: ${matrix.schemaVersion}.`);
  }
  if (matrix.cases.length !== 12) failures.push(`Expected 12 cases, received ${matrix.cases.length}.`);
  if (new Set(caseIds).size !== caseIds.length) failures.push("Case IDs are not unique.");
  if (caseIds.join("|") !== expectedCaseIds.join("|")) {
    failures.push(`Canonical case order must be ${expectedCaseIds.join(", ")}.`);
  }

  const groupA = matrix.cases.filter((testCase) => testCase.group === "A");
  const groupB = matrix.cases.filter((testCase) => testCase.group === "B");
  const concepts = new Set(groupA.map((testCase) => testCase.directorConceptId));
  const controlIntents = new Set(groupB.map((testCase) => testCase.intent));
  if (groupA.length !== 8 || concepts.size !== 8) {
    failures.push(`Expected 8/8 Group A Director Concepts, received ${concepts.size}/8.`);
  }
  if (groupB.length !== 4 || controlIntents.size !== 4) {
    failures.push(`Expected 4/4 Group B control Intents, received ${controlIntents.size}/4.`);
  }
  if (!groupA.every((testCase) => testCase.intent === "QUIET_LUXURY")) {
    failures.push("Group A does not hold QUIET_LUXURY constant.");
  }
  if (!groupB.every((testCase) => testCase.directorConceptId === CONTROL_CONCEPT)) {
    failures.push("Group B does not hold the control Director Concept constant.");
  }
  if (new Set(COMMERCIAL_VISUAL_FAILURE_CODES).size !== 22) {
    failures.push(`Expected 22 unique failure codes, received ${new Set(COMMERCIAL_VISUAL_FAILURE_CODES).size}.`);
  }

  const reviewByCaseId = new Map(matrix.reviewResults.map((review) => [review.caseId, review]));
  if (reviewByCaseId.size !== matrix.reviewResults.length) {
    failures.push("Visual review result case IDs are not unique.");
  }
  for (const review of matrix.reviewResults) {
    failures.push(...validateCommercialVisualReviewResult(review));
  }
  if (matrix.reviewResults.length !== matrix.cases.length) {
    failures.push("Visual review results do not cover every canonical case.");
  }
  const resolvedFinalStatus = resolveCommercialVisualFinalStatus(matrix.reviewResults);
  if (matrix.finalVisualStatus !== resolvedFinalStatus) {
    failures.push(`Final visual status is ${matrix.finalVisualStatus}, expected ${resolvedFinalStatus}.`);
  }

  for (const testCase of matrix.cases) {
    const replay = createCase(
      testCase.caseId,
      testCase.group,
      testCase.intent,
      testCase.directorConceptId,
      testCase.generationNonce
    );
    const review = reviewByCaseId.get(testCase.caseId);
    if (!review) {
      failures.push(`${testCase.caseId} has no visual review result.`);
    } else if (testCase.visualReviewStatus !== review.reviewStatus) {
      failures.push(`${testCase.caseId} visualReviewStatus diverges from review-results.json.`);
    }
    if (replay.canonicalCompiledText !== testCase.canonicalCompiledText) {
      failures.push(`${testCase.caseId} canonical script is not deterministic.`);
    }
    if (replay.directorPlanSummary.globalRule !== testCase.directorPlanSummary.globalRule) {
      failures.push(`${testCase.caseId} canonical Director Plan is not deterministic.`);
    }
    if (testCase.shotCount !== 5) failures.push(`${testCase.caseId} does not contain five shots.`);
    if (testCase.duration !== 15) failures.push(`${testCase.caseId} duration must be 15 seconds.`);
    if (testCase.aspectRatio !== COMMERCIAL_VISUAL_ACCEPTANCE_ASPECT_RATIO) {
      failures.push(`${testCase.caseId} does not hold the controlled aspect ratio.`);
    }
    if (testCase.scriptValidationStatus !== "COMMERCIAL_EXECUTION_VALIDATED") {
      failures.push(`${testCase.caseId} script validation did not pass.`);
    }
    if (!testCase.directorPlanSummary.globalRule) failures.push(`${testCase.caseId} has no Director Concept rule.`);
    if (!testCase.eventSpineSummary.centralEvent) failures.push(`${testCase.caseId} has no Event Spine.`);
    if (!testCase.productRevealStrategy) failures.push(`${testCase.caseId} has no product reveal strategy.`);
    if (testCase.transitionStrategy.length !== 5) failures.push(`${testCase.caseId} does not define five transitions.`);
    if (!testCase.endingStrategy) failures.push(`${testCase.caseId} has no ending strategy.`);
    if (hasInternalLeakage(testCase.canonicalCompiledText)) {
      failures.push(`${testCase.caseId} leaked internal implementation language.`);
    }
    if (hasUnresolvedChoice(testCase.canonicalCompiledText)) {
      failures.push(`${testCase.caseId} contains an unresolved choice.`);
    }
  }

  return {
    passed: failures.length === 0,
    failures,
    finalVisualStatus: matrix.finalVisualStatus,
  };
}
