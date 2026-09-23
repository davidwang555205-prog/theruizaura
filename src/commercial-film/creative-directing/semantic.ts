import type {
  CommercialCreativeTreatment,
  CommercialTreatmentSemanticFingerprint,
} from "./types";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "because",
  "before",
  "but",
  "by",
  "for",
  "from",
  "in",
  "into",
  "is",
  "it",
  "its",
  "of",
  "on",
  "or",
  "the",
  "their",
  "then",
  "to",
  "with",
  "without",
  "yet",
]);

export function normalizeSemanticText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function semanticTokens(value: string) {
  return new Set(
    normalizeSemanticText(value)
      .split(" ")
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
  );
}

export function semanticSimilarity(left: string, right: string) {
  const leftTokens = semanticTokens(left);
  const rightTokens = semanticTokens(right);
  const union = new Set([...leftTokens, ...rightTokens]);
  if (union.size === 0) return 1;
  const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  return intersection / union.size;
}

export function propositionCore(presentationText: string) {
  return [...semanticTokens(presentationText)].sort().join(" ");
}

export function buildCommercialTreatmentSemanticFingerprint(
  treatment: CommercialCreativeTreatment
): CommercialTreatmentSemanticFingerprint {
  return {
    propositionCore: propositionCore(treatment.creativeProposition.presentationText),
    signatureEventMechanism: normalizeSemanticText(
      `${treatment.signatureMoment.mechanism} ${treatment.signatureMoment.momentDescription} ${treatment.signatureMoment.visualInterruption} ${treatment.signatureEvent.family} ${treatment.signatureEvent.action} ${treatment.signatureEvent.visualResult}`
    ),
    signatureEventObject: normalizeSemanticText(
      `${treatment.signatureMoment.carrier} ${treatment.signatureMoment.location} ${treatment.signatureEvent.whoOrWhat}`
    ),
    eventCausality: normalizeSemanticText(
      `${treatment.signatureMoment.momentDescription} ${treatment.signatureMoment.beforeMoment} ${treatment.signatureMoment.visualInterruption} ${treatment.signatureMoment.afterMoment} ${treatment.signatureEvent.cause} ${treatment.signatureEvent.afterState} ${treatment.signatureEvent.nextBeatConsequence}`
    ),
    deviceArcProgression: normalizeSemanticText(
      treatment.deviceArc.map((beat, index) => `${index + 1} ${beat.deviceCarrier} ${beat.deviceState} ${beat.deviceIntensity} ${beat.deviceFunction}`).join(" ")
    ),
    productRevealCause: normalizeSemanticText(treatment.productRevealLogic.cause),
    endingImageMechanism: normalizeSemanticText(
      treatment.endingImage.split(" ").slice(0, 18).join(" ")
    ),
  };
}

export function semanticDifferenceCount(
  left: CommercialTreatmentSemanticFingerprint,
  right: CommercialTreatmentSemanticFingerprint
) {
  const keys = Object.keys(left) as Array<keyof CommercialTreatmentSemanticFingerprint>;
  return keys.filter((key) => semanticSimilarity(left[key], right[key]) < 0.72).length;
}

export function semanticClone(
  left: CommercialTreatmentSemanticFingerprint,
  right: CommercialTreatmentSemanticFingerprint
) {
  return semanticDifferenceCount(left, right) < 3
    || semanticSimilarity(left.propositionCore, right.propositionCore) >= 0.78
    || semanticSimilarity(left.signatureEventMechanism, right.signatureEventMechanism) >= 0.82
    || semanticSimilarity(left.deviceArcProgression, right.deviceArcProgression) >= 0.95;
}
