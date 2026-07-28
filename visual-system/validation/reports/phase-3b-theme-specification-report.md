# THERUIZ AURA Phase 3-B｜Canonical Theme Specification Report

Status: `VERIFIED`

## Input

- Phase 3-A inventory and migration matrix.
- Frozen Brand Visual Mother v1.2.
- Product Truth boundary from current task uploads.
- Existing runtime scene, action, outfit and studio libraries.

## Delivered

- `visual-system/themes/canonical-theme-specifications-v1.json`
- `visual-system/themes/canonical-theme-specifications-v1.md`
- `visual-system/themes/theme-taxonomy-v1.json`
- TypeScript runtime validator and loader in `src/visual-system/canonicalThemes.ts`.

## Decisions

- Eight stable theme IDs are retained.
- No MERGE or RETIRE is performed before controlled visual comparison.
- The 29-entry lifestyle scene pool remains a supporting library.
- No Image2-specific syntax is stored in the canonical specification.
- No current burgundy/ivory SKU attribute is written as a permanent brand rule.

## Validation

- All eight specifications have required fields and unique IDs.
- Active themes cannot be missing a purpose, action logic, scene evidence, Product Truth boundary, or QA requirements.
- RETIRE themes are rejected by the validator.
- Product Truth source is fixed to `current_task_uploaded_images` at the runtime boundary.
- MERGE source themes must redirect to a canonical target and cannot be used as formal active themes.

## Next

Phase 3-C compiles these model-neutral specifications into the Image2-only Provider-ready adapter. No real Provider call is made by this phase.
