# Black Mirror garment content themes

## Decisions

- U01 `NEEDED`: garment mode now routes title, body, tags, topic intent, and image-plan copy through `buildGarmentCopy`; shoe mode continues using the existing copy kit.
- U02 `NEEDED`: all eight topics have garment-specific intent statements.
- U03 `NEEDED`: garment image cards use Phase 3 garment shot-plan names and purposes instead of shoe-era card labels.
- U04 `NEEDED`: garment body and image planning use garment-native wording and category focus.
- U05 `NEEDED`: garment titles, body, tags, and copy-all parameters no longer use shoe templates or shoe parameter text.
- U06 `NEEDED`: category names and key details influence garment selling-point language.
- U07 `NEEDED`: system-generated garment draft requirements are sanitized at the garment source branch; user custom input is not globally rewritten.
- U08 `ALREADY_FIXED`: each garment image still receives Phase 2 `GarmentSeriesContext` and Phase 3 shot-plan requirements.
- U09 `NEEDED`: `validateGarmentCopy` provides lightweight warnings for shoe-primary terms, duplicate tags, and duplicate image plan names.
- U10 `ALREADY_FIXED`: shoe mode branches to the original `buildCopyFromKit` and keeps the existing shoe formatter path.

## Architecture

`generateSoftSeedingContent` dispatches by `baseParams.productContext.mode`. Garment mode uses `buildGarmentCopy`, `getGarmentShotPlan`, category-aware focus, and a garment-only copy-all parameter format. Shared rendering, scene names, prompt generation, and copy-all separators remain unchanged. Phase 2 continuity is passed through each image plan, while Phase 3 shot-plan names, purposes, framing, and detail emphasis drive each card.

The eight garment topics are represented by independent intent definitions: daily wear, development process, autumn/winter color, styling solutions, material/craft education, brand viewpoint, launch conversion, and studio launch. `穿搭解决方案` explicitly permits only supporting-styling variation; the uploaded garment remains fixed by the shared series context.

## Validation and limits

`npm run typecheck` and `npm run build` pass with the existing bundle-size warning. No test script exists in `package.json`. The validator is a warning layer, not a factual truth checker. Full Phase 5 copy quality work—richer per-topic prose kits, UI validation display, and broader unsupported-claim detection—remains deferred.
