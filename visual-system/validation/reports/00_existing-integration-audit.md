# Existing Integration Audit

## Reusable

- Existing React/Vite Prompt Builder and Founder Workbench shell.
- Existing local reference-image upload and preview state.
- Existing Runtime, Product Truth boundaries, scene/image-type profiles, and local generation adapter.
- Existing Playwright acceptance configuration and build/typecheck scripts.
- Existing 13 approved anchor images, frozen brand JSON, QA rubric, and pre-Phase 3-A case JSON.

## Minimal additions

- Type-safe visual-system runtime guards for frozen mother and anchor manifest.
- Upload-evidence Product Truth confidence model with missing-evidence reporting.
- A1–C5 validation task builder and internal visual-system workspace.
- Manual-provider validation report templates.

## Do not duplicate

- Prompt Runtime, image generation API, existing upload mechanics, or production usage adapters.
- Existing action, scene, outfit, and model libraries.

## Modified scope

- `src/visual-system/*`
- `src/App.tsx` internal visual-system workspace entry.
- `visual-system/README.md`, runtime reports and validation report templates.

## Explicitly not modified

- No real Provider integration.
- No Phase 3-A usage adapters.
- No Black Mirror or other brand project.
- No replacement of the existing Prompt Engine or production page flows.
