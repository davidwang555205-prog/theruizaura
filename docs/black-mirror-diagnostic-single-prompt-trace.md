# Diagnostic single-prompt trace

The actual upper button is in `src/App.tsx` and now points directly to `handleGenerateCurrentSinglePrompt`. The right panel and copy-current action both consume `singlePromptResult`, filtered by `isCurrentSinglePromptVisible` (non-empty prompt, matching mode/category, no pending edits, matching revision).

For localhost development, the right panel includes a temporary in-page `SinglePromptTrace` disclosure. It records click receipt, category/mode, reference roles, preflight result, adapter resolution, builder result type/length, state-write length, written/current revision, and the rendered visibility/stale predicates. It contains no console logging and is not shown on non-localhost deployments.

No adapter, reference requirement, series plan, content, category rule, or Vite chunking logic was changed in this diagnostic pass. Browser reproduction is still required to identify the first failing trace stage; automated validation alone does not establish browser success.
