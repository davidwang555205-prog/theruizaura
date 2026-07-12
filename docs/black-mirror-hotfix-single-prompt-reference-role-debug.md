# Single-prompt reference-role debug hotfix

## Exact cause

The upper button already reached `handleGenerate`, but custom shoe validation depended on role values without exposing the role state before the click. Six uploaded files therefore did not prove a valid input: the category adapters require exactly one `primary` plus their canonical side role (`side` for pump, `fullSide` for the other active custom categories). The UI had role selectors, but no pre-generation summary, and role validation was duplicated in the click path. This made missing or duplicated roles look like a no-op.

## Fix

- Added `shoeReferenceValidation.ts` as the authoritative role validator.
- Canonicalized only confirmed legacy aliases `completeSide` and `sideFull` to `fullSide`.
- The upper handler now validates the active adapter's own `minCount` and `requiredRoles` before building, with visible messages for insufficient count, missing primary, duplicate primary, and missing required side role.
- The reference panel now shows uploaded count, primary count, missing roles, and the active adapter's requirements before generation.
- Existing category business rules remain unchanged: pump continues to require `side`; boot, loafer, ballet flat, sandal, and mule require `fullSide`.
- Existing builder error handling, category metadata, stale clearing, series plans, content generation, and Vite chunks are preserved.

## Acceptance status

Typecheck, production build, release verification, and diff checks are run after this change. Real browser acceptance still requires explicitly assigning roles in a running user-controlled browser; no persistent dev server is started by this workflow.
