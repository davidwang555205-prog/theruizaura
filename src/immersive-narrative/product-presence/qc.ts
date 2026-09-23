import type {
  ProductPresenceMoment,
  ProductPresenceQc,
  ProductPresenceQcGate,
  ProductPresenceQcGateId,
} from "./types";

const GATE_LABELS: Record<ProductPresenceQcGateId, string> = {
  narrative_preserved: "Narrative Preserved",
  product_not_forced: "Product Not Forced",
  sufficient_product_evidence: "Sufficient Product Evidence",
  no_overexposure: "No Overexposure",
};

function gate(id: ProductPresenceQcGateId, passed: boolean, reason: string): ProductPresenceQcGate {
  return {
    id,
    label: GATE_LABELS[id],
    status: passed ? "PASS" : "FAIL",
    reason,
  };
}

export function buildProductPresenceQc(input: {
  curve: ProductPresenceMoment[];
  expectedMomentCount: number;
  narrativePreserved: boolean;
  productForced: boolean;
  rawHeroCount: number;
  rawStrongCount: number;
}): { qc: ProductPresenceQc; allPassed: boolean } {
  const heroCount = input.curve.filter((moment) => moment.presence === "HERO").length;
  const readableCount = input.curve.filter((moment) => moment.presence === "READABLE").length;
  const strongCount = heroCount + readableCount;
  const allStrong = input.curve.length === input.expectedMomentCount
    && input.curve.length > 0
    && input.curve.every((moment) => moment.presence === "READABLE" || moment.presence === "HERO");
  const sufficientEvidence = (heroCount >= 1 && readableCount >= 1) || readableCount >= 2;
  const noOverexposure = !allStrong
    && heroCount <= 1
    && strongCount <= 3
    && input.rawHeroCount <= 1
    && input.rawStrongCount <= 3;

  const qc: ProductPresenceQc = {
    narrative_preserved: gate(
      "narrative_preserved",
      input.narrativePreserved,
      input.narrativePreserved
        ? "Original Moment order, What Happens, and resolved Scene remain unchanged."
        : "Product Presence output changed the upstream Narrative or Scene Resolution."
    ),
    product_not_forced: gate(
      "product_not_forced",
      !input.productForced,
      input.productForced
        ? "The requested presence would require an artificial display action."
        : "Presence levels only annotate existing action and do not request a pose or movement change."
    ),
    sufficient_product_evidence: gate(
      "sufficient_product_evidence",
      sufficientEvidence,
      sufficientEvidence
        ? `${heroCount} HERO and ${readableCount} READABLE moments provide the required product evidence.`
        : "The curve needs either one HERO plus one READABLE or at least two READABLE moments."
    ),
    no_overexposure: gate(
      "no_overexposure",
      noOverexposure,
      noOverexposure
        ? `The curve keeps HERO at ${heroCount} and READABLE + HERO at ${strongCount}.`
        : "The curve has too many strong product moments or makes every moment a product focus."
    ),
  };

  return {
    qc,
    allPassed: Object.values(qc).every((entry) => entry.status === "PASS"),
  };
}
