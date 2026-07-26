import type { PromptRule, CompiledPromptResult, CompiledPromptSection, PromptSection } from "./contracts";
import { collectPromptRules } from "./collectPromptRules";
import { resolvePromptConflicts } from "./resolvePromptConflicts";
import { allocatePromptBudget } from "./allocatePromptBudget";
import { validateCompiledPrompt } from "./validateCompiledPrompt";
import type { PromptProfileInput } from "./contracts";

export function compilePrompt(input: PromptProfileInput): CompiledPromptResult {
  // Phase 1: Collect
  const allRules = collectPromptRules(input);

  // Phase 2: Resolve conflicts
  const { kept: resolved, conflicts } = resolvePromptConflicts(allRules);

  // Phase 3: Allocate budget
  const { kept: budgeted, report: budgetReport } = allocatePromptBudget(resolved, input.compositionMode);

  // Phase 4: Assemble sections
  const sectionMap = new Map<PromptSection, PromptRule[]>();
  for (const rule of budgeted) {
    const existing = sectionMap.get(rule.section) ?? [];
    existing.push(rule);
    sectionMap.set(rule.section, existing);
  }

  const sectionOrder: PromptSection[] = ["product", "model", "styling", "action", "scene", "camera", "lighting", "continuity", "brand", "negative"];
  const sections: CompiledPromptSection[] = [];
  let prompt = "";

  for (const section of sectionOrder) {
    const rules = sectionMap.get(section);
    if (!rules || rules.length === 0) continue;
    const text = rules.map(r => r.text).join(" ");
    const wordCount = text.split(/\s+/).length;
    sections.push({ section, text, ruleIds: rules.map(r => r.id), wordCount });
    prompt += (prompt ? " " : "") + text;
  }

  // Phase 5: Validate
  const validationReport = validateCompiledPrompt(prompt, budgeted, budgetReport);

  const includedIds = budgeted.map(r => r.id);
  const omittedIds = allRules.filter(r => !includedIds.includes(r.id)).map(r => r.id);
  const replacedIds = conflicts.map(c => c.removedRuleId);

  return {
    prompt: prompt.trim(),
    sections,
    includedRuleIds: includedIds,
    omittedRuleIds: omittedIds,
    replacedRuleIds: replacedIds,
    conflicts,
    budgetReport,
    validationReport,
  };
}
