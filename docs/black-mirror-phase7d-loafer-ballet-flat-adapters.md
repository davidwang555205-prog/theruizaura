# Black Mirror Phase 7D — Loafer + Ballet Flat Adapters

## Decisions

- L01/L02: `loafer` is active through its own adapter, schema, references, guards, shot plans, and content profile. Its model protects apron/vamp, saddle, Penny slot, Horsebit/tassel, topline, heel, welt and outsole.
- B01/B02: `balletFlat` is active through a separate adapter. Its model protects shallow vamp, topline depth, binding, side cut, bow/ornament, strap, heel lift and thin outsole.
- D01: Neither adapter falls back to the other, German trainer, pump, or boot. Sandal, mule, and other remain planned and blocked.
- D02: Existing German trainer, pump, boot, and garment routing is preserved; only category-aware flat routing is added.
- D03/D04: UI fields, primary/full-side reference enforcement, category copy validation, release checks, and this documentation were added without new dependencies or APIs.

## Architecture and references

Both adapters implement the Phase 7A `ShoeCategoryAdapter` contract and carry independent `ShoeProductContext` specs. The UI keeps separate loafer and ballet-flat drafts and marks generated output stale when either changes. Both require at least four references, exactly one primary, and a complete side reference. Missing ornament, rear, or outsole detail does not cause unseen hardware, heel-counter, tread, or edge construction to be invented.

## Plans and content

Both categories have category-native single prompts, lifestyle 3/5 shot variation, and studio 8 plans. Loafer studio purposes are complete hero, side, toe/apron, rear-aware, apron/vamp, ornament, welt/outsole, and worn/pair proof. Ballet-flat purposes are complete hero, side, toe/opening, rear-aware, vamp/topline, binding/ornament, heel-lift/thin-outsole, and worn/pair proof. Content topics use independent loafer and ballet-flat intents and reject cross-category primary wording.

## Known limitations

- Small Horsebit, tassel, bow, buckle, or logo geometry may render incorrectly.
- Ornament and binding detail references materially improve accuracy.
- Outsole tread cannot be guaranteed without an outsole reference.
- Very shallow openings may require manual refinement.
- Soft flats can deform more than structured shoes.
- Prompt guards cannot guarantee exact fit, comfort, or support claims.
