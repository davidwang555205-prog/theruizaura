import type { CommercialFilmPlan, CommercialProductVisibility, CommercialShotRole } from "../types";
import type {
  CommercialProductRevealContract,
  CommercialProductVisibilityAuthority,
  CommercialProductVisibilityDiagnostic,
  CommercialProductVisibilityState,
  CommercialProductVisibilityTimelineBeat,
} from "./types";

const ROLE_EXPECTATIONS: Record<CommercialShotRole, CommercialProductVisibilityState[]> = {
  WORLD: ["ABSENT", "IMPLIED", "SECONDARY", "PARTIAL"],
  WEAR: ["IMPLIED", "SECONDARY", "PARTIAL", "READABLE"],
  DETAIL: ["PARTIAL", "READABLE", "DETAIL"],
  HERO: ["READABLE", "DETAIL", "HERO"],
  RELEASE: ["SECONDARY", "READABLE", "RELEASE"],
};

const LEGACY_EXPECTATIONS: Record<CommercialProductVisibility, CommercialProductVisibilityState[]> = {
  CONTEXT: ["ABSENT", "IMPLIED", "SECONDARY", "PARTIAL"],
  PRODUCT_READABLE: ["SECONDARY", "PARTIAL", "READABLE"],
  PRODUCT_DETAIL: ["PARTIAL", "READABLE", "DETAIL"],
  PRODUCT_HERO: ["READABLE", "DETAIL", "HERO"],
  BRAND_RELEASE: ["SECONDARY", "READABLE", "RELEASE"],
};

const STRONG_STATES: CommercialProductVisibilityState[] = ["READABLE", "DETAIL", "HERO"];

const STATE_GOALS: Record<CommercialProductVisibilityState, string> = {
  ABSENT: "Product remains absent.",
  IMPLIED: "Product remains implied through the human situation.",
  SECONDARY: "Product remains secondary within the worn look.",
  PARTIAL: "Product becomes partially readable inside the worn action.",
  READABLE: "Product becomes readable inside the worn look.",
  DETAIL: "One product detail becomes readable through natural use.",
  HERO: "Product becomes clear at natural human scale.",
  RELEASE: "Product remains part of the final lived image.",
};

function shotState(
  presence: CommercialFilmPlan["productVisibilityPlan"]["presenceByShot"][number],
  productRole: CommercialFilmPlan["creativeSpine"]["productRole"],
  shotRole: CommercialShotRole,
  legacyLevel: CommercialProductVisibility
): CommercialProductVisibilityState {
  const presenceState: Record<
    CommercialFilmPlan["productVisibilityPlan"]["presenceByShot"][number],
    CommercialProductVisibilityState
  > = {
    ABSENT: "ABSENT",
    IMPLIED: "IMPLIED",
    PARTIAL: "PARTIAL",
    SECONDARY: "SECONDARY",
    CLEAR: "READABLE",
  };
  const base = presenceState[presence];
  if (shotRole === "WORLD") {
    return base === "READABLE" ? "PARTIAL" : base;
  }
  if (shotRole === "WEAR") {
    return base === "READABLE" ? "READABLE" : base;
  }
  if (shotRole === "DETAIL") {
    return legacyLevel === "PRODUCT_DETAIL" && base === "READABLE" ? "DETAIL" : base;
  }
  if (shotRole === "HERO") {
    if (
      productRole === "HERO"
      && legacyLevel === "PRODUCT_HERO"
      && presence === "CLEAR"
    ) return "HERO";
    if (productRole === "REVEALED" && presence === "CLEAR") return "READABLE";
    if (base === "ABSENT") return "IMPLIED";
    return base === "PARTIAL" ? "READABLE" : base;
  }
  return base === "ABSENT" || base === "IMPLIED" ? "SECONDARY" : "RELEASE";
}

function takeIndexForBeat(plan: CommercialFilmPlan, beatIndex: number) {
  return plan.continuity.takePlan.takes.find((take) => take.shotIndexes.includes(beatIndex))?.takeIndex ?? -1;
}

function evidenceForBeat(plan: CommercialFilmPlan, beatIndex: number) {
  const shot = plan.eventSpine.shots.find((entry) => entry.shotIndex === beatIndex)
    ?? plan.eventSpine.shots[beatIndex];
  const stateEvidence = shot?.stateContract.requiredVisibleEvidence.map((entry) => entry.statement) ?? [];
  return [
    shot?.whatHappens ?? "",
    shot?.whatChanges ?? "",
    ...stateEvidence,
  ].map((value) => value.trim()).filter(Boolean);
}

function evidenceSegments(values: string[]) {
  return [...new Set(values
    .flatMap((value) => value.split(/[.!?]+\s+/))
    .map((value) => value.replace(/\s+/g, " ").trim())
    .filter((value) => value.length >= 12))];
}

export function productVisibilityGoalForState(
  state: CommercialProductVisibilityState
) {
  return STATE_GOALS[state];
}

export function planCommercialProductVisibilityAuthority(input: {
  plan: CommercialFilmPlan;
  structureGoals?: string[];
  revealCause?: string;
  requiredVisibleEvidence?: string[];
}): CommercialProductVisibilityAuthority {
  const diagnostics: CommercialProductVisibilityDiagnostic[] = [];
  const timeline: CommercialProductVisibilityTimelineBeat[] = input.plan.shotArchitecture.shots.map((shot, beatIndex) => {
    const sourcePresence = input.plan.productVisibilityPlan.presenceByShot[beatIndex] ?? "ABSENT";
    const sourceLegacyLevel = input.plan.productVisibilityPlan.levels[beatIndex] ?? "CONTEXT";
    const normalizedState = shotState(
      sourcePresence,
      input.plan.creativeSpine.productRole,
      shot.role,
      sourceLegacyLevel
    );
    const roleCompatible = ROLE_EXPECTATIONS[shot.role].includes(normalizedState);
    const legacyCompatible = LEGACY_EXPECTATIONS[sourceLegacyLevel].includes(normalizedState);
    if (!roleCompatible) {
      diagnostics.push({
        code: "VISIBILITY_CONFLICT",
        beatIndex,
        message: `Normalized state ${normalizedState} does not satisfy the ${shot.role} role expectation.`,
      });
    }
    if (!legacyCompatible) {
      diagnostics.push({
        code: "VISIBILITY_CONFLICT",
        beatIndex,
        message: `Normalized state ${normalizedState} is incompatible with legacy visibility ${sourceLegacyLevel}.`,
      });
    }
    return {
      beatIndex,
      takeIndex: takeIndexForBeat(input.plan, beatIndex),
      normalizedState,
      sourcePresence,
      sourceLegacyLevel,
      sourceRole: shot.role,
      sourceStructureGoal: input.structureGoals?.[beatIndex] ?? "",
      sourceRevealCause: input.revealCause ?? null,
      roleCompatible,
      legacyCompatible,
    };
  });

  const revealBeatIndex = timeline.findIndex((beat) => STRONG_STATES.includes(beat.normalizedState));
  const revealBeat = revealBeatIndex >= 0 ? timeline[revealBeatIndex] : null;
  const previousBeat = revealBeatIndex > 0 ? timeline[revealBeatIndex - 1] : null;
  const revealRequirements = revealBeat
    ? evidenceSegments([
      ...(input.requiredVisibleEvidence ?? []),
      ...evidenceForBeat(input.plan, revealBeatIndex),
    ])
    : [];
  const camera = revealBeatIndex >= 0
    ? input.plan.cameraPlan.shots[revealBeatIndex]
    : undefined;

  if (!revealBeat) {
    diagnostics.push({
      code: "REVEAL_CONFLICT",
      message: "The authoritative visibility timeline contains no READABLE, DETAIL, or HERO beat.",
    });
  }
  if (revealBeatIndex === 0) {
    diagnostics.push({
      code: "REVEAL_CONFLICT",
      beatIndex: 0,
      message: "The first beat is already a direct product state, so no reveal transition can be represented.",
    });
  }

  const revealContract: CommercialProductRevealContract = {
    revealBeatIndex,
    takeIndex: revealBeat?.takeIndex ?? -1,
    fromVisibility: previousBeat?.normalizedState ?? revealBeat?.normalizedState ?? "ABSENT",
    toVisibility: revealBeat?.normalizedState ?? "READABLE",
    cause: input.revealCause
      ?? revealBeat?.sourceRevealCause
      ?? input.plan.eventSpine.shots[revealBeatIndex]?.whatChanges
      ?? "The visible device state changes at the reveal beat.",
    requiredVisibleEvidence: revealRequirements,
    physicalResourceDependency: [],
    productReferenceRequirement: input.plan.productMessage.externalReferenceRequired
      ? "EXTERNAL_REFERENCE_REQUIRED"
      : "CONFIRMED_REFERENCE_REQUIRED",
    cameraRequirement: camera
      ? `${camera.framing}; ${camera.movement}`
      : "No camera shot exists for the reveal beat.",
    firstDirectView: true,
    compatible: diagnostics.length === 0,
  };

  return {
    timeline,
    revealContract,
    diagnostics,
  };
}
