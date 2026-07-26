import type { TeamPromptParams } from "../types";
import type { CompiledPromptResult, PromptEngineMode } from "./contracts";
import { compilePrompt } from "./compilePrompt";
import { getPromptEngineConfig, recordCompareResult } from "./promptFeatureFlags";
import { generateTeamPrompt as legacyGenerateTeamPrompt } from "../utils/generatePrompt";
import { buildPromptProfileInput } from "./adapters/legacyTeamPromptAdapter";

export type PromptRuntimeDiagnostics = {
  mode: PromptEngineMode;
  legacyWordCount?: number;
  newWordCount?: number;
  includedRuleIds?: string[];
  omittedRuleIds?: string[];
  replacedRuleIds?: string[];
  conflicts?: CompiledPromptResult["conflicts"];
  budgetReport?: CompiledPromptResult["budgetReport"];
  validationReport?: CompiledPromptResult["validationReport"];
  diffSummary?: string;
};

export type PromptRuntimeResult = {
  prompt: string;
  selectedOutfitLine?: string;
  compiled?: CompiledPromptResult;
  diagnostics: PromptRuntimeDiagnostics;
};

function countWords(value: string) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

function buildDiffSummary(legacy: string, current: string) {
  if (legacy === current) return "identical";
  const legacyWords = countWords(legacy);
  const currentWords = countWords(current);
  return `text differs; legacy=${legacyWords}w, new=${currentWords}w`;
}

export function generatePromptRuntime(params: TeamPromptParams): PromptRuntimeResult {
  const config = getPromptEngineConfig();
  if (config.mode === "legacy") {
    const legacy = legacyGenerateTeamPrompt(params);
    return { prompt: legacy.prompt, selectedOutfitLine: legacy.selectedOutfitLine, diagnostics: { mode: "legacy", legacyWordCount: countWords(legacy.prompt) } };
  }

  const compiled = compilePrompt(buildPromptProfileInput(params));
  const diagnosticsBase = {
    mode: config.mode,
    newWordCount: countWords(compiled.prompt),
    includedRuleIds: compiled.includedRuleIds,
    omittedRuleIds: compiled.omittedRuleIds,
    replacedRuleIds: compiled.replacedRuleIds,
    conflicts: compiled.conflicts,
    budgetReport: compiled.budgetReport,
    validationReport: compiled.validationReport,
  } satisfies PromptRuntimeDiagnostics;

  if (config.mode === "compare") {
    const legacy = legacyGenerateTeamPrompt(params);
    const diagnostics = {
      ...diagnosticsBase,
      legacyWordCount: countWords(legacy.prompt),
      diffSummary: buildDiffSummary(legacy.prompt, compiled.prompt),
    } satisfies PromptRuntimeDiagnostics;
    recordCompareResult(`${params.imageType}-${params.generationNonce}`, legacy.prompt, compiled.prompt);
    return { prompt: legacy.prompt, selectedOutfitLine: legacy.selectedOutfitLine, compiled, diagnostics };
  }

  return { prompt: compiled.prompt, compiled, diagnostics: diagnosticsBase };
}
