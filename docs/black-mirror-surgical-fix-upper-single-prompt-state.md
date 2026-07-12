# Surgical fix: upper single-prompt state ownership

## Exact root cause

`handleGenerate` already wrote `singlePromptResult`. The lower Xiaohongshu action called `syncPromptParams()` first, and that helper also built and wrote `singlePromptResult`. Therefore content generation had an unintended side effect: it could reveal or replace the single prompt even when the upper action had not completed its own path. The two actions did not have independent state ownership.

## Fix

- `syncPromptParams` now accepts `updateSinglePrompt` (default `true` for the upper/content-context use that explicitly needs synchronization).
- `handleGenerateSoftContent` calls `syncPromptParams(false)`, so it only synchronizes base parameters and then writes `softContent`; it does not write or reveal `singlePromptResult`.
- The upper `handleGenerate` remains the sole visible single-prompt action and still performs adapter routing, validation, error handling, metadata writes, and stale-state clearing.
- No prompt business rules, reference rules, series plans, content builders, or Vite chunking were changed.

## Verification

Run `npm run typecheck`, `npm run build`, `npm run verify:release`, and `git diff --check`. Browser acceptance must separately exercise the upper button and lower content button; no persistent dev server is started by this workflow.
