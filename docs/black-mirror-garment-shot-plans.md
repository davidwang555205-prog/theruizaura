# Black Mirror garment shot plans

## Decisions

- T01 `NEEDED`: garment 3-image plans now cover hero, secondary wear/angle, and category-aware detail.
- T02 `NEEDED`: garment 5-image plans use distinct entries selected by image count and card index; existing topic scenes remain the source of location.
- T03 `NEEDED`: garment 8-image studio plans are separate from the shoe 8-image plan: front, three-quarter, side, back/rear fallback, upper structure, construction, lower structure, and fabric/drape.
- T04 `NEEDED`: `getGarmentShotDetailPriorities` maps category to detail emphasis and prepends user key details.
- T05 `NEEDED`: shot 4 uses full back only when `garmentReferenceRoles` contains `back`; otherwise it emits restrained rear three-quarter and no invented back construction.
- T06 `ALREADY_FIXED`: existing core capability gates already prevent model/action in product still life and allow atmosphere product absence; garment shot plans add only garment-specific framing.
- T07 `NEEDED`: garment shot plans never select shoe-era foot-level or sneaker close-up entries; shoe paths remain unchanged.
- T08 `ALREADY_FIXED`: Phase 2 `GarmentSeriesContext` continues to be passed through `TeamPromptParams` and injected by the prompt core.

## Architecture

`src/modules/product/garment/garmentShotPlans.ts` contains typed, pure plan selection. `generateSoftSeedingContent` selects a plan per garment card and adds its framing, angle, purpose, and product-visibility line to that card's requirements. Product identity, model, styling policy, and visual direction remain in the shared Phase 2 context.

The plan varies only shot purpose, framing, angle, action emphasis, and detail priority. It does not create product identity, model identity, or scene libraries. Existing compatible scene selection remains authoritative.

Image-type behavior continues to come from the shared core: still life has no model/action, detail can use close construction framing, atmosphere can omit the product, and worn/mirror/lifestyle retain model and scene action.

## Validation

`npm run typecheck` and `npm run build` pass. Build retains the existing bundle-size warning. No test script exists in `package.json`. Shoe shot-plan code was not modified. Phase 4 work—full garment theme copy, deeper capability matrices, and broader rear-view UX—is deferred.
