import type { PromptRule, ResolvedPromptConflict } from "./contracts";

export function resolvePromptConflicts(rules: PromptRule[]): { kept: PromptRule[]; conflicts: ResolvedPromptConflict[] } {
  const conflicts: ResolvedPromptConflict[] = [];
  const kept: PromptRule[] = [];

  for (const rule of rules) {
    // Check against already-kept rules
    const conflicting = kept.filter(k => k.conflictsWith?.includes(rule.id) || rule.conflictsWith?.includes(k.id));
    if (conflicting.length > 0) {
      // Keep higher priority rule
      const higherPriorityConflicts = conflicting.filter((c) => rule.priority < c.priority);
      const blockingConflict = conflicting.find((c) => rule.priority >= c.priority);

      if (blockingConflict) {
        // Old rule is higher or equal priority — skip new
        conflicts.push({ id: `${rule.id}-replaced-by-${blockingConflict.id}`, keptRuleId: blockingConflict.id, removedRuleId: rule.id, reason: "priority" });
      } else {
        // New rule is higher priority — replace all conflicting old rules, then add it once.
        for (const c of higherPriorityConflicts) {
          kept.splice(kept.indexOf(c), 1);
          conflicts.push({ id: `${c.id}-replaced-by-${rule.id}`, keptRuleId: rule.id, removedRuleId: c.id, reason: "priority" });
        }
        kept.push(rule);
      }
    } else {
      // Check explicit replaces
      const replaced = kept.filter(k => rule.replaces?.includes(k.id));
      if (replaced.length > 0) {
        for (const r of replaced) {
          kept.splice(kept.indexOf(r), 1);
          conflicts.push({ id: `${r.id}-replaced-by-${rule.id}`, keptRuleId: rule.id, removedRuleId: r.id, reason: "explicit-replace" });
        }
      }
      kept.push(rule);
    }
  }

  return { kept, conflicts };
}
