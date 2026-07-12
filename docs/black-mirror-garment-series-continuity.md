# Black Mirror garment series continuity

## Decisions

- S01 `NEEDED`: garment series now creates one immutable `GarmentSeriesContext` before mapping image cards. It is reused by every card for product identity and accuracy.
- S02 `NEEDED`: the shared context carries one model/face/hair/makeup/body-proportion lock; per-image gaze, expression, pose, action, and crop remain variable.
- S03 `NEEDED`: ordinary garment themes receive a shared supporting-styling lock. `穿搭解决方案` receives an explicit policy allowing supporting-styling variation while keeping the uploaded garment fixed.
- S04 `NEEDED`: every garment series card receives one shared visual-direction lock covering real-camera character, warm-neutral low-saturation color, material response, realism, and model treatment.

## Architecture

`buildSoftSeedingImagePlans` creates the context once, then passes it into `buildImagePlan`. Each generated `TeamPromptParams` carries the context; `teamPromptCore` injects its product, model, styling, and visual lines into the corresponding prompt sections. No React state, blob URL, or image data is stored in the context.

Shared fields are product identity, construction/material/color, model identity, hair/makeup/body proportions, ordinary supporting styling, and visual direction. Per-image variation remains scene, camera framing, gaze, expression intensity, pose, action, crop, and detail emphasis.

## Scope and regression

No garment shot-plan rewrite, scene-library rewrite, soft-seeding copy rewrite, API, backend, dependency, commit, or push was added. Shoe generation still uses the existing path because the context is created only when the active `ProductContext` is garment mode.

`npm run typecheck` and `npm run build` pass. Build output retains the existing bundle-size warning. There is no test script in `package.json`; regression was verified statically through the shared context path and shoe-mode guard.

Rear-view safeguard remains deferred to Phase 3 because this phase does not redesign the garment shot plan.
