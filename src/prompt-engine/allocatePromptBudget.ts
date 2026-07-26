import type { PromptRule, PromptSection, PromptBudgetReport, PromptBudgetProfile } from "./contracts";
import { PromptPriority } from "./contracts";

const DEFAULT_BUDGET: PromptBudgetProfile = {
  totalWords: 350,
  sectionCaps: { product: 100, model: 80, styling: 60, action: 50, scene: 70, negative: 60 },
  requiredRuleIds: [],
  optionalRuleIds: [],
};

const COMPOSITION_BUDGETS: Record<string, PromptBudgetProfile> = {
  fullFigure: { totalWords: 380, sectionCaps: { product: 100, model: 80, styling: 60, action: 50, scene: 70, negative: 60 }, requiredRuleIds: [], optionalRuleIds: [] },
  studioLowerThird: { totalWords: 200, sectionCaps: { product: 80, model: 0, styling: 30, action: 40, scene: 40, negative: 50 }, requiredRuleIds: [], optionalRuleIds: [] },
  studioOnFootDetail: { totalWords: 150, sectionCaps: { product: 80, model: 0, styling: 0, action: 20, scene: 30, negative: 40 }, requiredRuleIds: [], optionalRuleIds: [] },
  stillLife: { totalWords: 150, sectionCaps: { product: 80, model: 0, styling: 0, action: 0, scene: 40, negative: 40 }, requiredRuleIds: [], optionalRuleIds: [] },
  materialDetail: { totalWords: 120, sectionCaps: { product: 60, model: 0, styling: 0, action: 0, scene: 30, negative: 30 }, requiredRuleIds: [], optionalRuleIds: [] },
  atmosphere: { totalWords: 150, sectionCaps: { product: 0, model: 0, styling: 0, action: 0, scene: 70, negative: 50 }, requiredRuleIds: [], optionalRuleIds: [] },
  mirrorFull: { totalWords: 300, sectionCaps: { product: 80, model: 60, styling: 50, action: 40, scene: 50, negative: 50 }, requiredRuleIds: [], optionalRuleIds: [] },
};

export function allocatePromptBudget(rules: PromptRule[], compositionMode: string): { kept: PromptRule[]; report: PromptBudgetReport } {
  const budget = COMPOSITION_BUDGETS[compositionMode] ?? DEFAULT_BUDGET;
  const sectionCounts: Record<string, number> = {};
  const kept: PromptRule[] = [];
  const trimmed: string[] = [];
  let totalWords = 0;

  // Sort by priority (lower number = higher priority)
  const sorted = [...rules].sort((a, b) => a.priority - b.priority);

  for (const rule of sorted) {
    const section = rule.section;
    const cap = budget.sectionCaps[section] ?? Infinity;
    const currentSection = sectionCounts[section] ?? 0;
    const words = rule.estimatedWords ?? Math.ceil(rule.text.split(/\s+/).length);
    const isRequired = rule.required || budget.requiredRuleIds.includes(rule.id);

    if (isRequired || (totalWords + words <= budget.totalWords && currentSection + words <= cap)) {
      kept.push(rule);
      totalWords += words;
      sectionCounts[section] = currentSection + words;
    } else {
      trimmed.push(rule.id);
    }
  }

  const overflowSections = Object.entries(sectionCounts)
    .filter(([section, count]) => count > (budget.sectionCaps[section as PromptSection] ?? Infinity))
    .map(([section]) => section as PromptSection);

  return {
    kept,
    report: {
      totalWords,
      sectionWordCounts: sectionCounts as Partial<Record<PromptSection, number>>,
      overflowSections,
      trimmedRuleIds: trimmed,
    },
  };
}
