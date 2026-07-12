# Black Mirror Phase 7E — Sandal + Mule Adapters

## Decisions

- S01–S12: `sandal` is active through an independent adapter protecting toe opening, strap hierarchy, ankle/heel strap, buckle, footbed, heel, platform, outsole, and foot contact.
- M01–M12: `mule` is active through an independent adapter protecting toe/opening, vamp, throat/topline, backless edge, insertion depth, heel exposure, heel, platform, outsole, and foot contact.
- E01: Sandal and mule never fall back to each other or to German trainer, pump, boot, loafer, or ballet flat.
- E02: Existing categories and garment mode retain their business behavior; only category-specific context, UI drafts, shot plans, guards, copy, and validation were added.
- E03–E04: `other` remains planned/blocked. New reference-role enforcement, release assertions, and this documentation were added without APIs or dependencies.

## Architecture

Both adapters implement the existing `ShoeCategoryAdapter` registry contract and carry separate `SandalShoeSpec` / `MuleShoeSpec` contexts. The UI preserves separate drafts and marks current output stale when either changes. Both require at least four references, exactly one primary, and a complete side reference.

## Plans and content

Each category has independent single, lifestyle 3/5, and studio 8 behavior. Sandal studio shots prove toe opening, strap hierarchy, rear-aware heel/ankle construction, footbed, buckle, heel/platform, outsole, and worn contact. Mule studio shots prove vamp, throat/topline, backless edge, insertion depth, heel exposure, heel/platform, outsole, and worn contact. Shared scene selection is category-adapted; no generic open-shoe prompt is used.

Content themes use separate sandal and mule intents. Copy validators reject cross-category primary wording and unsupported comfort, stability, waterproofing, or anti-slip claims.

## Known limitations

- Exact strap geometry benefits from strap-detail references.
- Toe rendering may remain unstable in open-toe shoes.
- Small buckles and hardware may vary.
- Heel exposure and insertion depth may need manual refinement.
- Outsole tread cannot be guaranteed without an outsole reference.
- Prompt guards cannot guarantee exact fit, stability, or comfort.
