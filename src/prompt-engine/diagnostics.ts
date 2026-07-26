import type { CompiledPromptResult, PromptBudgetReport, PromptValidationReport, ResolvedPromptConflict } from "./contracts";

export function formatDiagnostics(result: CompiledPromptResult): string {
  const lines: string[] = [];
  lines.push("=== PROMPT ENGINE DIAGNOSTICS ===");
  lines.push(`Included: ${result.includedRuleIds.length} rules`);
  lines.push(`Omitted: ${result.omittedRuleIds.length} rules`);
  lines.push(`Replaced: ${result.replacedRuleIds.length} rules`);
  lines.push(`Conflicts: ${result.conflicts.length}`);

  if (result.conflicts.length > 0) {
    lines.push("\n--- Conflicts ---");
    for (const c of result.conflicts) {
      lines.push(`  ${c.keptRuleId} → replaced ${c.removedRuleId} (${c.reason})`);
    }
  }

  lines.push(`\n--- Budget ---`);
  lines.push(`Total words: ${result.budgetReport.totalWords}`);
  for (const [section, count] of Object.entries(result.budgetReport.sectionWordCounts)) {
    lines.push(`  ${section}: ${count}`);
  }
  if (result.budgetReport.overflowSections.length > 0) {
    lines.push(`  Overflow: ${result.budgetReport.overflowSections.join(", ")}`);
  }

  lines.push(`\n--- Validation ---`);
  lines.push(`Errors: ${result.validationReport.totalErrors}, Warnings: ${result.validationReport.totalWarnings}`);
  if (result.validationReport.missingRequiredRules.length > 0) {
    lines.push(`  Missing: ${result.validationReport.missingRequiredRules.join(", ")}`);
  }

  return lines.join("\n");
}

export function logDiagnostics(result: CompiledPromptResult) {
  console.log(formatDiagnostics(result));
}
