import type { CommercialFinalExecutionPlan } from "../final-execution/types";
import type { CommercialProductVisibilityState } from "../product-visibility/types";

export function resourceLabel(plan: CommercialFinalExecutionPlan, resourceId: string | null) {
  if (!resourceId) return "declared physical resource";
  return plan.physicalResources.find((resource) => resource.id === resourceId)?.label
    ?? resourceId.replace(/^[^:]+:/, "").replace(/-/g, " ");
}

export function visibilityHumanLine(state: CommercialProductVisibilityState) {
  const lines: Record<CommercialProductVisibilityState, string> = {
    ABSENT: "the direct footwear read stays physically unavailable in this composition",
    IMPLIED: "the product remains implied by the worn context without a full direct read",
    PARTIAL: "only a partial worn-product signal enters the readable frame",
    SECONDARY: "the product remains secondary inside the worn look",
    READABLE: "the worn product becomes readable at human scale",
    DETAIL: "one confirmed worn-product detail becomes readable through natural use",
    HERO: "the complete worn product reads clearly at natural human scale",
    RELEASE: "the product remains part of the final lived image",
  };
  return lines[state];
}

export function visibilityStateLabel(state: CommercialProductVisibilityState) {
  return state.toLowerCase();
}

export function timeRange(startSecond: number, endSecond: number) {
  return `${startSecond.toFixed(1)}-${endSecond.toFixed(1)}s`;
}

export function takeHeading(
  take: CommercialFinalExecutionPlan["takeStructure"]["takes"][number],
  totalTakes: number
) {
  const number = take.takeIndex + 1;
  if (totalTakes === 1) return `TAKE ${number} — CONTINUOUS`;
  if (take.shotIndexes.length === 1) return `TAKE ${number} — SINGLE BEAT`;
  return `TAKE ${number}`;
}

export function cameraLine(
  beat: CommercialFinalExecutionPlan["beats"][number]
) {
  return `${beat.camera.framing}; ${beat.camera.cameraHeight.replace(/_/g, " ")}; ${beat.camera.movement.replace(/_/g, " ")}. ${beat.camera.movementLine}`;
}

export function hasLegacySecondRevealAuthority(text: string) {
  return /First complete direct product view|\[V1\.4 CREATIVE DIRECTING\]|appendCommercialV14TranslationExtension|resolveFinalStateWording/.test(text);
}

export function hasGeneratedBrandOrEndCard(text: string) {
  return text
    .split(/[.\n]+/)
    .filter((sentence) => !/\b(?:no|not|never|without|do not)\b/i.test(sentence))
    .some((sentence) => /\b(?:logo|brand mark|end card|lettering)\b/i.test(sentence));
}

export function internalWhitelistLeak(text: string) {
  return /\b(?:QC|validator|enum|stateContract|entityId|takeIndex|productVisibilityGoal|V1\.3|V1\.4|V1\.5)\b/.test(text);
}
