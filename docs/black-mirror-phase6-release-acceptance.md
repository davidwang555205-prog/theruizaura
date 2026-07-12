# Black Mirror Phase 6 release acceptance

## Baseline

- Branch: `release/black-mirror-v1-acceptance`
- Baseline commit: `454150b feat: add garment accuracy and occlusion guards`
- Initial worktree: clean
- Initial `npm run typecheck`: pass
- Initial `npm run build`: pass, existing bundle-size warning

## Decisions

| Item | Decision | Evidence |
|---|---|---|
| W01 | ALREADY_FIXED | Release branch and Phase 1–5 modules are present in source, not only docs. |
| W02 | PASS_WITH_MANUAL_LIMIT | Pure generation paths build; no automated browser test framework exists. Manual UI checklist is documented but not claimed complete. |
| W03 | PASS_WITH_LIMITATIONS | Source guard layers and static verification cover known contamination; semantic contradictions still require manual judgment. |
| W04 | PASS | 3/5/8 count paths and garment shot plans are present; exact browser interaction remains manual. |
| W05 | PASS_WITH_MANUAL_LIMIT | Mode, reference, scene, and button states exist; browser interaction was not executed in this non-dev validation run. |
| W06 | NEEDED | User-visible software heading and copy-all heading used the shoe brand name; corrected to Black Mirror while preserving THERUIZ AURA inside shoe content. |
| W07 | NEEDED | `App.tsx`, `index.html`, and README identified the software as THERUIZ AURA Prompt Builder. Added `APP_NAME` and updated user-visible naming. |
| W08 | PASS | Static release script checks THERUIZ AURA is not removed from shoe source path and Black Mirror is separate application identity. |
| W09 | NEEDED | Added release overview and checklist. |
| W10 | ALREADY_FIXED_WITH_LIMITATION | Vite warns about the existing ~876 kB JS chunk; no new dependency or obvious duplicate import was found. Deferred code-splitting. |
| W11 | NEEDED | Added `npm run verify:release` lightweight static verification script without new dependencies. |
| W12 | READY_WITH_KNOWN_LIMITATIONS | Typecheck, build, and release script pass; browser-only manual checks remain to be performed by the user. |

## Automated validation

- `npm run typecheck`: pass
- `npm run build`: pass; existing bundle-size warning only
- `npm run verify:release`: pass
- Tests: no test script exists in `package.json`

## Manual acceptance status

The browser checklist covers shoe single/5/8, garment single/3/5/8, reference validation, mode switching, scene reset, copy single/all, and refresh warning. These are not marked as executed because this run did not start a long-lived dev server.

## Release decision

`BLOCKED` until the second-pass browser click sequence is manually verified. Automated checks remain passing; non-blocking limitations include no automated browser suite, bundle-size warning, local references lost after refresh, no exact Logo/text guarantee, and no API/backend/image generation.

## Final state

This Phase 6 run did not commit or push. Final typecheck/build and worktree status should be recorded immediately before any separate user-controlled commit/push.
