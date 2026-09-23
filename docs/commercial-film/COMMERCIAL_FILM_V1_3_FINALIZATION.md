# COMMERCIAL FILM V1.3 FINALIZATION

## Stage

```text
COMMERCIAL FILM V1.3
FINALIZATION + REAL SEEDANCE VISUAL ACCEPTANCE
```

This stage freezes the already implemented V1.3 Director Concept engine. It does not add Director Concepts, Creative Modes, Narrative changes, Action changes, a Brand Translation Layer, or V1.4 behavior.

## Canonical Baseline

The source baseline is stored at:

```text
src/commercial-film/visual-acceptance/canonical-baseline.json
```

For every canonical case it records:

- canonical input SHA-256
- canonical Director Plan SHA-256
- canonical compiled text SHA-256
- protected Narrative source SHA-256
- protected 318-Action source SHA-256

The same input and generation nonce must reproduce the same Director Plan and compiled text. A baseline divergence blocks export and final validation.

## Acceptance Matrix

The fixed matrix contains 12 cases:

- Group A: `QUIET_LUXURY` across all eight Director Concepts.
- Group B: the control Director Concept across `URBAN_MOTION`, `DAILY_STYLING`, `PRODUCT_CRAFT`, and `NEW_ARRIVAL`.

All cases hold duration, character input, season, Lifestyle Feeling, product reference state, and aspect ratio constant. Group A holds Intent constant. Group B holds Director Concept constant.

The controlled review aspect ratio is `9:16`.

## Final Export

```bash
npm run export:commercial-v1.3-seedance-pack
```

Output:

```text
artifacts/commercial-film/v1.3-final/
├── manifest.json
├── baseline.json
├── README.md
├── review-results.json
└── cases/
    ├── case-01.md
    ├── case-02.md
    └── ... case-12.md
```

Each case Markdown file contains human-readable metadata and the exact canonical Seedance execution script. It does not expose Action IDs, internal enums, validator details, QC internals, or debug fields.

## Visual Review

`review-results.json` is the manual result record. No video means `NOT_REVIEWED`.

Allowed review statuses:

- `NOT_REVIEWED`
- `PASS`
- `FAIL`
- `INCONCLUSIVE`

A `PASS` is accepted only when a real video reference, Seedance model and version, positive attempt number, controlled comparison flags, ten PASS review dimensions, and zero failure codes are recorded.

## Failure Taxonomy

Visual failure codes are available in:

```text
src/commercial-film/visual-acceptance/types.ts
```

Failure codes may only come from real video review. They may not be inferred from the prompt.

## Seedance Translation Policy

Visual failure triage starts with the failure layer:

1. Script architecture failure
2. Compiler translation failure
3. Seedance interpretation failure

`SEEDANCE_OVER_INTERPRETATION` and `SEEDANCE_UNDER_INTERPRETATION` do not authorize a Director Concept change.

If multiple real cases show the same execution problem, a thin Seedance Execution Translation Adjustment may reduce ambiguity, competing actions, camera-priority conflicts, or transition wording. It must preserve the Director Concept.

No translation adjustment is applied before real video evidence exists.

## Final Validation

```bash
npm run validate:commercial-v1.3-final
```

The command validates the frozen baseline, 12-case matrix, export pack, review-result integrity, failure taxonomy, no internal leakage, no fake visual PASS, protected Narrative and Action sources, all Commercial regressions, typecheck, build, and the Commercial Playwright E2E path.

Before real video review:

```text
SCRIPT STATUS: PASS
VISUAL STATUS: NOT VERIFIED
V1.3 FREEZE STATUS: SCRIPT FROZEN / VISUAL ACCEPTANCE PENDING
```

Only complete real-video acceptance permits:

```text
COMMERCIAL FILM V1.3
FINAL STATUS:
PRODUCTION VERIFIED / FROZEN
```

## Recorded External Acceptance

On 2026-09-22, an external real-Seedance review submitted by David reported:

```text
Format Control: PASS
Same-Intent Director Diversity: PASS
Cross-Intent Integrity: PASS
Product Integration: PASS
World Realism: PASS
Director Concept Execution: PASS WITH MINOR NOTES
Weak Cases: case-07, case-08
Overall Visual Acceptance: PASS WITH MINOR NOTES
FINAL STATUS: APPROVED FOR FREEZE
PRODUCTION FROZEN: YES
```

The authoritative report is stored at:

```text
artifacts/commercial-film/v1.3-final/FINAL_VISUAL_ACCEPTANCE_REPORT.md
```

This decision freezes V1.3. It does not authorize V1.4, new Director Concepts, generation-logic changes, or changes to the canonical baseline.

The per-case `review-results.json` remains a separate evidence record. Aggregate approval is not copied into per-case fields without real per-case video metadata.

## Final Script Presentation Layer

After production freeze, a read-only presentation layer was added to improve the client-facing director script without changing any generation source or canonical output.

```text
canonical plan + frozen canonicalCompiledText
→ Final Script Presentation Layer
→ presentationScript
```

The frozen Seedance prompt remains available separately and is copied byte-for-byte.

See `docs/commercial-film/COMMERCIAL_FINAL_SCRIPT_PRESENTATION_V1_3.md`.

## V1.4 Boundary

V1.4 is a separate Creative Directing Layer built above the frozen V1.3 baseline. It does not alter the V1.3 canonical hashes or replace the V1.3 execution engine.

See `docs/commercial-film/COMMERCIAL_CREATIVE_DIRECTING_V1_4.md`.
