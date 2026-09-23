import type {
  CameraNarrativeMoment,
  CameraNarrativeQc,
  CameraNarrativeQcGate,
  CameraNarrativeQcGateId,
} from "./types";

const GATE_LABELS: Record<CameraNarrativeQcGateId, string> = {
  narrative_preserved: "Narrative Preserved",
  role_motivated_by_action: "Role Motivated By Action",
  no_product_driven_camera: "No Product Driven Camera",
  no_overdirection: "No Overdirection",
};

function gate(id: CameraNarrativeQcGateId, passed: boolean, reason: string): CameraNarrativeQcGate {
  return {
    id,
    label: GATE_LABELS[id],
    status: passed ? "PASS" : "FAIL",
    reason,
  };
}

export function buildCameraNarrativeQc(input: {
  moments: CameraNarrativeMoment[];
  expectedMomentCount: number;
  narrativePreserved: boolean;
  unmotivatedRoles: string[];
  productDrivenReasons: string[];
  overdirectionReasons: string[];
}): { qc: CameraNarrativeQc; allPassed: boolean } {
  const partialCount = input.moments.filter((moment) => moment.role === "PARTIAL_OBSERVATION").length;
  const overdirectionReasons = [...input.overdirectionReasons];
  if (partialCount > 1) overdirectionReasons.push(`PARTIAL_OBSERVATION appears ${partialCount} times.`);
  if (input.moments.length !== input.expectedMomentCount) overdirectionReasons.push("Camera moments do not match the source Moment count.");

  const qc: CameraNarrativeQc = {
    narrative_preserved: gate(
      "narrative_preserved",
      input.narrativePreserved,
      input.narrativePreserved
        ? "Moment order, Scene, Product Presence, and Sound World remain unchanged."
        : "Camera Role output changed an upstream Narrative, Scene, Product Presence, or Sound World field."
    ),
    role_motivated_by_action: gate(
      "role_motivated_by_action",
      input.unmotivatedRoles.length === 0,
      input.unmotivatedRoles.length === 0
        ? "Every Camera Role is supported by the existing action state and narrative position."
        : input.unmotivatedRoles.join(" ")
    ),
    no_product_driven_camera: gate(
      "no_product_driven_camera",
      input.productDrivenReasons.length === 0,
      input.productDrivenReasons.length === 0
        ? "Camera Role is independent from Product Presence."
        : input.productDrivenReasons.join(" ")
    ),
    no_overdirection: gate(
      "no_overdirection",
      overdirectionReasons.length === 0,
      overdirectionReasons.length === 0
        ? "Camera roles remain motivated, restrained, and within the V1 observation limit."
        : overdirectionReasons.join(" ")
    ),
  };

  return {
    qc,
    allPassed: Object.values(qc).every((entry) => entry.status === "PASS"),
  };
}
