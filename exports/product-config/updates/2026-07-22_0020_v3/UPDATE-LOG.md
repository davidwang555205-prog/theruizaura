# THERUIZ AURA Garment Runtime Styling Isolation Fix

- Updated at: 2026-07-22 00:20:48 CST (Asia/Shanghai)
- Delivery version: 2026-07-22_0020_v3
- Scope: root runtime fix for shoe outfit leakage into garment Styling

## Root cause

- Garment mode disabled the standard outfit selector but still allowed `perSceneOutfitSelection` to read the shoe-oriented `sceneOutfitSeedLibrary`.
- A pre-existing `lockedOutfitLine` could override garment mode and enter the final Styling section.
- `generateSoftSeedingContent` could capture the first garment prompt's selected outfit line and lock that contaminated line across the remaining image set.
- The runtime garment styling boundary still used the old automatic-outfit wording.
- The export script still wrote the shoe outfit seed library into garment seeding, so regenerated deliverables could restore the problem.

## Runtime changes

- Blocked `perSceneOutfitSelection`, standard outfit selection, premium wardrobe selection, and inherited shoe `lockedOutfitLine` from garment mode.
- Garment `baseOutfitLine` now starts empty and is populated only by the garment reference-aware styling resolver.
- Added `garmentReferenceScope` with `completeLook`, `singleItem`, and `uncertain`.
- Added independent clothing roles: `outerLayer`, `primaryTop`, `innerLayer`, `bottom`, `onePiece`, and `coordinatedSet`.
- Complete and uncertain references add no clothing identity.
- Only a valid one-role single item receives one deterministic category-compatible supporting garment.
- Garment Styling no longer appends shoe wardrobe, accessory-selection, seasonal outfit, gym outfit, or manual garment-type lines.
- Garment series no longer captures or inherits the shoe outfit lock.
- Added a final defensive sanitizer for the reported white-shirt, cream-trousers, beige-jacket, bag, commute, and sneaker-readability legacy text.
- Preserved the original shoe outfit path for shoe mode.

## Export changes

- The export script no longer imports or writes `sceneOutfitSeedLibrary` into garment seeding.
- Garment `outfitSeeds` remains empty.
- Reference-scope policy, Styling assembly policy, supporting pools, safe active templates, and category isolation remain present after regeneration.
- Garment lifestyle scenes no longer export a forced garment type.

## Modified runtime and source files

- `src/modules/product/garment/garmentProductTypes.ts`
- `src/modules/product/types.ts`
- `src/types.ts`
- `src/modules/product/garment/garmentProtectionRules.ts`
- `src/modules/product/garment/garmentPromptSanitizer.ts`
- `src/utils/teamPromptCore.ts`
- `src/utils/generateSoftSeedingContent.ts`
- `scripts/export-category-configs.ts`

## Delivery package

The folder contains the complete five-file product-config delivery package. Shoe files remain available and shoe runtime styling was verified as a control group.

## Validation

- Four JSON parse checks: PASS
- MJS syntax check: PASS
- MJS category contract check: PASS
- TypeScript typecheck: PASS
- Production build: PASS
- `git diff --check`: PASS
- Direct SSR runtime prompt probe, complete multi-role reference with malicious legacy locked outfit: PASS, no legacy clothing or sneaker text
- Direct SSR runtime prompt probe, valid single top: PASS, one supporting bottom only
- Direct SSR runtime prompt probe, uncertain reference: PASS, no new clothing identity
- Direct SSR runtime prompt probe, shoe control: PASS, shoe styling path preserved
- Export regeneration: PASS, garment `outfitSeeds` remains empty and category contract still passes

## Platform input requirement

The upload/reference-analysis layer should supply `garmentReferenceScope` and `garmentClothingRoles`. If it supplies neither, runtime intentionally resolves to `uncertain` and adds no clothing identity. This fail-closed default prevents reference conflicts without requiring a real image-generation API, API key, provider adapter, or online model ID.
