# Single Prompt render hotfix audit

## Decision

`ALREADY_FIXED` on the current release code. No source change was required.

## Evidence

In `src/App.tsx`, the upper single-prompt button calls `handleGenerate`. That handler:

1. validates garment references only when garment mode is active;
2. creates current product parameters through `paramsForProduct`;
3. calls `generateTeamPrompt(nextParams)`;
4. writes the result directly with `setGeneratedPrompt(...)`;
5. clears pending/copy state.

The right-side output panel renders `{generatedPrompt}` directly. It does not depend on `softContent`, titles, body, tags, or the lower `生成小红书内容` action. `syncPromptParams` used by the lower action also writes the same single result, but is not required for the upper action.

The previous garment-refresh hotfix adds a product fingerprint and clears stale output when garment fields or reference roles change. Mode switching also clears the visible result. No `useMemo`, `useCallback`, module cache, or output-tab state was found on this path.

## Validation

- `npm run typecheck`: pass
- `npm run build`: pass; existing bundle-size warning only
- `npm run verify:release`: pass
- Manual browser click reproduction was not run because no long-lived dev server was started in this audit. The code path is direct and independently renders the single result.

## Remaining limitation

If a user still sees the old behavior in a running browser tab, reload the tab after starting the current branch's dev server to avoid stale HMR/browser state. No timeout, forced remount, or duplicate result state was added.
