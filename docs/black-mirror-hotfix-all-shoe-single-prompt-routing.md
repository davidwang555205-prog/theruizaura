# Black Mirror hotfix: all shoe single-prompt routing

## Root-cause audit

The upper `生成提示词` action wrote a generic `{ mode, sourceFingerprint, prompt }` value directly from `generateTeamPrompt`. The shared builder is category-aware, but the UI state did not retain the active shoe category or a product revision/key. As a result, a single result could not be proven to belong to the currently selected adapter, and the route had no explicit active-category guard. Garment mode also used the same untyped path.

The result panel itself is shared; there is no German-trainer-only rendering branch. The failure boundary is therefore the single-action routing/state contract, not the category adapters' prompt vocabulary.

## Fix

- Added `buildCurrentSinglePrompt`, which resolves the current `ProductContext`, selects the active shoe category adapter, rejects planned categories, and rejects empty output before state is written.
- Routed both the upper single action and content-generation synchronisation through that helper.
- Stored `mode`, `category`, `productKey`, `inputRevision`, and prompt text together so the result is attributable to the current product/category revision.
- Preserved existing validation, series/content generation, copy behavior, and stale-result clearing on category/spec/reference changes.
- Extended release verification with static checks for the shared route and metadata contract.

## Verification

Run `npm run typecheck`, `npm run build`, and `npm run verify:release`. Manual browser acceptance still requires a running user-controlled browser session; no persistent dev server is started by the release workflow.
