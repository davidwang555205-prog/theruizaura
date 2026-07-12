# Black Mirror garment accuracy guards

## Decisions

- V01 `NEEDED`: category and shot-aware visibility guards now resolve priority structures and obstruction rules.
- V02 `NEEDED`: garment action safety adds hand, hair, bag, prop, and supporting-layer occlusion constraints.
- V03 `NEEDED`: visibility guards include restrained movement and sitting restrictions; natural folds remain allowed.
- V04 `NEEDED`: product accuracy now protects ease, body-to-garment spacing, fit, volume, length, and product-to-body proportion.
- V05 `NEEDED`: material guard protects known fields and reference appearance without inventing fiber composition or performance claims.
- V06 `NEEDED`: pattern, embroidery, lace, beadwork, logo, lettering, and trim are treated as fixed visible geometry when present.
- V07 `NEEDED`: bridal, activewear, and other high-risk categories receive concise category-specific negatives.
- V08 `NEEDED`: garment negatives are composed by image type: worn, still life, atmosphere, and detail/BTS differ.
- V09 `NEEDED`: `validateGarmentGuardLines` detects exact duplicate generated guard lines without rewriting user text.
- V10 `ALREADY_FIXED`: all guards are called only by the garment adapter; shoe adapter and shoe shot plans remain unchanged.

## Architecture

`garmentAccuracyGuards.ts` is the pure guard layer. The garment adapter supplies category/spec/input context, while `garmentProtectionRules.ts` keeps product identity and styling boundaries. `ProductAdapterInput.shotKind` is populated from Phase 3 garment shot plans. Phase 2 `GarmentSeriesContext` remains immutable and is still injected by the prompt core.

The guard priority is product identity, shot purpose, image-type capability, visibility/occlusion, scene/action, then supporting props. No global string cleanup or arbitrary prompt truncation was added.

## Model limitations

Prompt guards reduce but cannot eliminate model errors. Small lettering, logos, intricate lace, embroidery, beadwork, and asymmetric motifs may still render inaccurately. Multiple high-resolution reference angles improve fidelity; missing back references cannot guarantee unseen back construction.

## Validation

`npm run typecheck` and `npm run build` pass with the existing bundle-size warning. No test script exists in `package.json`. Shoe behavior was not routed through the new guard layer. Phase 6 work may add UI warnings and deeper conflict resolution, but is intentionally deferred here.
