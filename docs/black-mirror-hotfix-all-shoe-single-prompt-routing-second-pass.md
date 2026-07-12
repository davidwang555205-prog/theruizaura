# Black Mirror second pass: all-shoe single-prompt routing

## First-hotfix gap

The first pass centralized adapter selection and stored category metadata, but it still assumed that a successful click would either build a prompt or return through the existing validation branches. Builder exceptions were not converted into visible UI feedback, and the upper action had no explicit error boundary. That made a failed non-German route appear to do nothing in the browser.

## Exact current path

The visible upper action in `src/App.tsx` is `onClick={handleGenerate}`. It reads the current `productMode`, `shoeCategory`, category draft/spec state, and reference images; it writes `params`, `singlePromptResult`, `generatedProductFingerprint`, `copyStatus`, `hasPendingChanges`, and the visible `imageGenerationStatus` panel. Its category-specific preflight returns now write a blocker message. The final build is routed through `buildCurrentSinglePrompt`, which resolves `productContext.category`, selects the registry adapter, rejects planned categories, and rejects empty output.

## Second-pass fix

- Added a visible catch around the same builder used by the upper button. Adapter/context failures now write `imageGenerationStatus` instead of becoming a silent event failure.
- Successful generation clears the blocker and writes the authoritative single result with category, product key, input revision, and prompt.
- Existing category-specific drafts (`pumpSpec`, `bootSpec`, `loaferSpec`, `balletFlatSpec`, `sandalSpec`, `muleSpec`) are passed by `paramsForProduct`; German trainer remains the legacy catalog path. No custom category requires a German trainer product ID.
- Adapters are statically imported and registry-resolved; dynamic loading is not applicable to this bundle-split implementation.
- Category/spec/reference changes continue to clear stale output and mark pending changes.

## Verification

`npm run typecheck`, `npm run build`, `npm run verify:release`, and `git diff --check` are required. The release verifier now checks the shared route, metadata, all active categories, and visible builder failure handling. Manual browser acceptance remains pending unless a user-controlled running browser session is provided; no persistent dev server is started.
