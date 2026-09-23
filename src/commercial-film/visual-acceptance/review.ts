import type {
  CommercialVisualAcceptanceResult,
  CommercialVisualFinalStatus,
  CommercialVisualFailureCode,
  CommercialVisualReviewStatus,
} from "./types";
import { COMMERCIAL_VISUAL_FAILURE_CODES } from "./types";

const REVIEWED_DIMENSION_KEYS = [
  "conceptVisibility",
  "conceptContinuity",
  "cinematicDeviceVisibility",
  "cinematicDeviceContinuity",
  "intentIntegrity",
  "productIntegration",
  "cameraExecution",
  "transitionExecution",
  "worldRealism",
  "endingExecution",
] as const;

const REVIEW_STATUSES: CommercialVisualReviewStatus[] = [
  "NOT_REVIEWED",
  "PASS",
  "FAIL",
  "INCONCLUSIVE",
];

export function createEmptyCommercialVisualReview(caseId: string): CommercialVisualAcceptanceResult {
  return {
    caseId,
    seedanceModel: null,
    seedanceVersion: null,
    attempt: null,
    sameReferenceSet: null,
    sameDuration: null,
    sameAspectRatio: null,
    sameGenerationSettings: null,
    videoReference: null,
    reviewStatus: "NOT_REVIEWED",
    conceptVisibility: null,
    conceptContinuity: null,
    cinematicDeviceVisibility: null,
    cinematicDeviceContinuity: null,
    intentIntegrity: null,
    productIntegration: null,
    cameraExecution: null,
    transitionExecution: null,
    worldRealism: null,
    endingExecution: null,
    notes: "",
    failureCodes: [],
  };
}

function isNonEmpty(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateCommercialVisualReviewResult(
  review: CommercialVisualAcceptanceResult
): string[] {
  const failures: string[] = [];
  if (!review.caseId.trim()) failures.push("Visual review is missing caseId.");
  if (!REVIEW_STATUSES.includes(review.reviewStatus)) {
    failures.push(`${review.caseId} has an unsupported review status.`);
    return failures;
  }

  const hasVideoEvidence = isNonEmpty(review.videoReference);
  const hasModelEvidence = isNonEmpty(review.seedanceModel) && isNonEmpty(review.seedanceVersion);
  const hasAttempt = typeof review.attempt === "number" && Number.isInteger(review.attempt) && review.attempt > 0;
  const controlledComparison = review.sameReferenceSet === true
    && review.sameDuration === true
    && review.sameAspectRatio === true
    && review.sameGenerationSettings === true;
  const hasReviewMetadata = review.seedanceModel !== null
    || review.seedanceVersion !== null
    || review.attempt !== null
    || review.sameReferenceSet !== null
    || review.sameDuration !== null
    || review.sameAspectRatio !== null
    || review.sameGenerationSettings !== null
    || review.videoReference !== null;
  const allowedFailureCodes = new Set<CommercialVisualFailureCode>(COMMERCIAL_VISUAL_FAILURE_CODES);
  if (review.failureCodes.some((code) => !allowedFailureCodes.has(code))) {
    failures.push(`${review.caseId} contains an unsupported failure code.`);
  }

  if (review.reviewStatus === "NOT_REVIEWED") {
    if (hasReviewMetadata) {
      failures.push(`${review.caseId} contains review evidence but is still marked NOT_REVIEWED.`);
    }
    if (review.failureCodes.length > 0) {
      failures.push(`${review.caseId} has failure codes without a completed review.`);
    }
    if (REVIEWED_DIMENSION_KEYS.some((key) => review[key] !== null)) {
      failures.push(`${review.caseId} has dimension results without a completed review.`);
    }
    return failures;
  }

  if (!hasVideoEvidence) failures.push(`${review.caseId} cannot be reviewed without a video reference.`);
  if (!hasModelEvidence) failures.push(`${review.caseId} is missing the Seedance model or version.`);
  if (!hasAttempt) failures.push(`${review.caseId} must record a positive attempt number.`);

  if (review.reviewStatus === "PASS") {
    if (!controlledComparison) {
      failures.push(`${review.caseId} cannot PASS without the controlled comparison flags.`);
    }
    if (review.failureCodes.length > 0) {
      failures.push(`${review.caseId} cannot PASS while failure codes are present.`);
    }
    const nonPassDimensions = REVIEWED_DIMENSION_KEYS.filter((key) => review[key] !== "PASS");
    if (nonPassDimensions.length > 0) {
      failures.push(`${review.caseId} cannot PASS with non-PASS review dimensions: ${nonPassDimensions.join(", ")}.`);
    }
  }

  if (review.reviewStatus === "FAIL" && review.failureCodes.length === 0) {
    failures.push(`${review.caseId} cannot FAIL without at least one failure code.`);
  }

  return failures;
}

export function resolveCommercialVisualFinalStatus(
  reviews: CommercialVisualAcceptanceResult[]
): CommercialVisualFinalStatus {
  if (reviews.some((review) => validateCommercialVisualReviewResult(review).length > 0)) {
    return "FAIL";
  }
  if (reviews.some((review) => review.reviewStatus === "FAIL")) return "FAIL";
  if (reviews.some((review) => review.reviewStatus === "INCONCLUSIVE")) return "INCONCLUSIVE";
  if (reviews.length > 0 && reviews.every((review) => review.reviewStatus === "PASS")) {
    return "PRODUCTION_VERIFIED";
  }
  return "NOT_VERIFIED";
}
