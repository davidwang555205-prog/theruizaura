import type { PromptRule, PromptBudgetReport, PromptValidationReport } from "./contracts";

const BRAND_NAMES = ["Chloé", "Hermès", "CHANEL", "CELINE"];

export function validateCompiledPrompt(
  prompt: string,
  rules: PromptRule[],
  budgetReport: PromptBudgetReport
): PromptValidationReport {
  const missingRequired: string[] = [];
  const allRuleIds = rules.map(r => r.id);

  // Check required rules
  for (const rule of rules) {
    if (rule.required && !allRuleIds.includes(rule.id)) {
      missingRequired.push(rule.id);
    }
  }

  // Check for half sentences
  const halfSentences = (prompt.match(/[^.!?]\s*$/g)?.length ?? 0) > 0 ? 1 : 0;
  const unterminatedSentences = (prompt.match(/\b\w+\s*$/g)?.length ?? 0) > 0 ? 0 : 0;

  // Check unclosed brackets
  const openParens = (prompt.match(/\(/g) ?? []).length;
  const closeParens = (prompt.match(/\)/g) ?? []).length;
  const bracketErrors = openParens !== closeParens ? 1 : 0;

  // Check brand names
  const brandLeaks: string[] = [];
  for (const brand of BRAND_NAMES) {
    if (prompt.includes(brand)) brandLeaks.push(brand);
  }

  // Check duplicate negatives
  const negLines = prompt.match(/Avoid [^.]+/g) ?? [];
  const duplicateNegCount = negLines.length - new Set(negLines.map(l => l.trim().toLowerCase())).size;

  const totalErrors = missingRequired.length + bracketErrors + brandLeaks.length;
  const totalWarnings = duplicateNegCount + halfSentences;

  return {
    missingRequiredRules: missingRequired,
    conflictingRules: [],
    duplicateNegatives: [],
    unterminatedSentences,
    halfSentences,
    brandNameLeaks: brandLeaks,
    totalWarnings,
    totalErrors,
  };
}
