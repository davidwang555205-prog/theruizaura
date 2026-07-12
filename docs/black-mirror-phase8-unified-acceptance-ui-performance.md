# Black Mirror Phase 8 — Unified Acceptance, UI, and Performance

## Audit decisions

| Area | Status | Decision |
| --- | --- | --- |
| P01 architecture audit | NEEDED | The app keeps one product-mode shell, registry-routed category adapters, shared reference state, prompt/content generation, and release verification. Category prompt logic remains separate. |
| P02 acceptance matrix | NEEDED | Added `src/data/phase8AcceptanceMatrix.ts` covering garment plus every active shoe category at 1/3/5/8 images. |
| P03 release verification | NEEDED | `verify:release` now reports grouped acceptance, matrix, state, and performance guard checks. |
| P04 manual evidence | DEFERRED | Runtime prompt acceptance is recorded below; browser evidence requires an actual user-started dev-server session. |
| P05–P08 UI consolidation | ALREADY_FIXED / PARTIAL | Existing mode/category selector, role selector, stale-output handling, copy actions, and blocked messages are retained; a larger field-component extraction is deferred because category forms are already production-tested and a broad rewrite risks regressions. |
| P09–P10 performance | NEEDED | Added stable Vite manual chunks for vendor, product modules, and prompt data. No async generation behavior changed. |
| P11 duplicated UI | DEFERRED | Category business rules remain isolated; field-form extraction is deferred to avoid mixing category semantics. |
| P12–P14 release/docs | NEEDED | Added grouped verifier assertions and this release documentation. |

## Unified matrix

The typed matrix covers garment single and every active shoe category (German trainer, pump, boot, loafer, ballet flat, sandal, mule) at 1, 3, 5, and 8 image paths. Planned `other` remains blocked and is not silently mapped.

## Performance baseline and change

Before Phase 8, the single JS output was approximately 995 kB. Vite now groups dependencies into `vendor`, product adapters into `product-modules`, and large prompt/data modules into `prompt-data`. The initial entry remains stable and prompt business wording is unchanged. Build still reports a large-chunk warning because the prompt-data group remains substantial; deeper lazy loading is deferred until a browser performance trace demonstrates a safe split boundary.

## Acceptance evidence

- Typecheck, build, and release verification pass.
- One-shot runtime checks pass for sandal and mule single, lifestyle 3, and studio 8; both copy validators pass and cross-category leakage is zero.
- Existing categories were not rewritten; registry routing remains explicit.
- The previous Vite SSR WebSocket `EPERM` message is environment-only: the one-shot process exits with successful test output, and release verification never starts a persistent dev server.

## Release status

`READY_WITH_KNOWN_LIMITATIONS` — core category routing, prompt generation, content plans, stale-state behavior, copy, and release checks pass. Remaining limitations are the Vite chunk-size warning, exact image geometry, and deferred browser trace / field-renderer extraction.
