# Emergency restore: authoritative upper single-prompt state

## Failure after the previous patch

The lower content side effect was removed, but the upper action and result panel still had no explicit shared visibility predicate. The panel rendered whichever prompt object happened to exist, while the copy button independently checked only for a non-empty prompt. That made the state path difficult to prove and allowed a result to be treated inconsistently after a revision/category change.

## Surgical fix

- Kept `singlePromptResult` as the one authoritative state used by the upper handler, right panel, and copy-current action.
- Renamed the visible upper handler to `handleGenerateCurrentSinglePrompt` and connected the actual upper button directly to it.
- Added `isCurrentSinglePromptVisible`, requiring non-empty prompt, matching mode/category, no pending changes, and the same generation revision.
- Added `generatedAt` to the result metadata.
- Copy current is disabled unless the same visibility predicate is true.
- Lower Xiaohongshu generation continues to call `syncPromptParams(false)` and does not write or clear single-prompt state.

No adapter, reference-role, series, content-business, or Vite chunking logic was changed.
