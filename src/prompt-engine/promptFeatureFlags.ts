import type { PromptEngineConfig, PromptEngineMode } from "./contracts";

// Production now uses the structured compiler. Compare remains available for
// explicit diagnostics and rollback without changing the runtime contract.
let _mode: PromptEngineMode = "new";
let _diagnostics: boolean = false;
let _budgetReport: boolean = false;
let _validationReport: boolean = false;

export function setPromptEngineConfig(config: Partial<PromptEngineConfig>) {
  if (config.mode) _mode = config.mode;
  if (config.enableDiagnostics !== undefined) _diagnostics = config.enableDiagnostics;
  if (config.enableBudgetReport !== undefined) _budgetReport = config.enableBudgetReport;
  if (config.enableValidationReport !== undefined) _validationReport = config.enableValidationReport;
}

export function getPromptEngineConfig(): PromptEngineConfig {
  return {
    mode: _mode,
    enableDiagnostics: _diagnostics,
    enableBudgetReport: _budgetReport,
    enableValidationReport: _validationReport,
  };
}

const COMPARE_RESULTS: Array<{ label: string; legacy: string; current: string }> = [];

export function recordCompareResult(label: string, legacy: string, current: string) {
  COMPARE_RESULTS.push({ label, legacy, current });
}

export function getCompareResults() {
  return [...COMPARE_RESULTS];
}

export function clearCompareResults() {
  COMPARE_RESULTS.length = 0;
}
