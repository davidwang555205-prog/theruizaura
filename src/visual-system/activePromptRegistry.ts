import comparisonPlan from "../../visual-system/validation/comparisons/phase-3d-comparison-plan.json";
import { assertImage2ProviderPrompt, productTruthLock } from "./types";

export type ActivePromptSelection = "new" | "old" | "repaired_new";
export type ThemePromptRole = "A1" | "A2" | "A3" | "B3" | "B4" | "C1" | "C2" | "C3" | "C4" | "C5";
export type ThemePromptRegistryEntry = {
  role: ThemePromptRole;
  comparisonId: string;
  activeSelection: ActivePromptSelection;
  activeVersionId: string;
  fallbackVersionId: string | null;
  historicalVersionIds: string[];
  validationResult: "NEW_PASS" | "OLD_BETTER" | "REPAIR_PASS";
  provider: "image2";
  lifecycle: "active" | "legacy_active";
};

const selectionByRole: Record<ThemePromptRole, ActivePromptSelection> = {
  A1: "new", A2: "new", A3: "new", B3: "new", B4: "new", C1: "new", C2: "new", C3: "new", C4: "new", C5: "repaired_new"
};
const validationByRole: Record<ThemePromptRole, ThemePromptRegistryEntry["validationResult"]> = {
  A1: "NEW_PASS", A2: "NEW_PASS", A3: "NEW_PASS", B3: "NEW_PASS", B4: "NEW_PASS", C1: "NEW_PASS", C2: "NEW_PASS", C3: "NEW_PASS", C4: "NEW_PASS", C5: "REPAIR_PASS"
};
const roles = Object.keys(selectionByRole) as ThemePromptRole[];
const planByRole = new Map(comparisonPlan.comparisons.map((item) => [item.role as ThemePromptRole, item]));

export const activePromptRegistry: ThemePromptRegistryEntry[] = roles.map((role) => {
  const item = planByRole.get(role);
  if (!item) throw new Error(`Missing Phase 3-D comparison for ${role}.`);
  const selection = selectionByRole[role];
  const activeVersionId = `image2-${item.comparison_id}-${selection}-v1`;
  const oldVersionId = `image2-${item.comparison_id}-old-v1`;
  const newVersionId = `image2-${item.comparison_id}-new-v1`;
  return {
    role,
    comparisonId: item.comparison_id,
    activeSelection: selection,
    activeVersionId,
    fallbackVersionId: selection === "old" ? null : oldVersionId,
    historicalVersionIds: selection === "old" ? [newVersionId] : [oldVersionId],
    validationResult: validationByRole[role],
    provider: "image2",
    lifecycle: selection === "old" ? "legacy_active" : "active"
  };
});

export function getActivePromptRegistryEntry(role: string): ThemePromptRegistryEntry {
  const entry = activePromptRegistry.find((item) => item.role === role);
  if (!entry) throw new Error(`No approved active Prompt Registry entry for ${role}.`);
  return entry;
}

export function resolveActiveImage2Prompt(role: ThemePromptRole): { prompt: string; entry: ThemePromptRegistryEntry } {
  const entry = getActivePromptRegistryEntry(role);
  const item = planByRole.get(role)!;
  const base = entry.activeSelection === "old" ? item.old_prompt : item.new_prompt;
  const repair = entry.activeSelection === "repaired_new"
    ? " True overhead top-down view: toe points toward the top of frame, heel toward the bottom, full shoe centered, tongue and settled white laces fully visible, no rotation or mirrored orientation."
    : "";
  const prompt = assertImage2ProviderPrompt(`${base}${repair} ${productTruthLock}`);
  return { prompt, entry };
}

export function validateActivePromptRegistry(): void {
  if (activePromptRegistry.length !== 10) throw new Error("Active Prompt Registry must contain 10 roles.");
  if (activePromptRegistry.some((entry) => entry.provider !== "image2")) throw new Error("Only Image2 is allowed in the active registry.");
  if (activePromptRegistry.some((entry) => entry.activeSelection === ("repair_pending" as ActivePromptSelection))) throw new Error("repair_pending cannot remain active.");
  for (const role of roles) {
    const resolved = resolveActiveImage2Prompt(role);
    if (resolved.entry.activeSelection === "old" && !resolved.prompt.includes(planByRole.get(role)!.old_prompt)) throw new Error(`${role} did not resolve to old Prompt.`);
    if (resolved.entry.activeSelection === "new" && !resolved.prompt.includes(planByRole.get(role)!.new_prompt)) throw new Error(`${role} did not resolve to new Prompt.`);
    if (role === "C5" && (!resolved.prompt.includes("True overhead top-down view") || resolved.entry.activeSelection !== "repaired_new")) throw new Error("C5 did not resolve to repaired new Prompt.");
  }
}

validateActivePromptRegistry();
