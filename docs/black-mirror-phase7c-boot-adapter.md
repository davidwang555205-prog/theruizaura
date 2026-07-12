# Black Mirror Phase 7C — Boot Adapter

## Z01–Z10 decisions

| Task | Decision |
| --- | --- |
| Z01 | `boot` is active and routes only to `bootAdapter`; other shoe categories remain planned. |
| Z02 | Added subtype, toe, shaft, ankle/calf/knee, closure, heel, outsole/tread, material and construction fields. |
| Z03 | Boot generation requires four references, exactly one primary and one complete-side reference; long-boot side views must include the shaft opening. |
| Z04 | Added boot-native single, lifestyle 3/5, and studio 8 shot plans. |
| Z05–Z06 | Added autumn/winter scene guidance, subtype styling, safe walking/seated rules, and leg/shaft contact protection. |
| Z07–Z08 | Added shaft, opening, closure, heel, outsole, tread guards, negatives, topic guides, and boot copy profile. |
| Z09 | Added boot copy validation, targeted boot vocabulary isolation, and release assertions. |
| Z10 | German trainer, pump, and garment routing remain separate; planned categories do not fall back. |

## Architecture and fields

`bootAdapter` plugs into the Phase 7A registry alongside the German-trainer and pump adapters. `BootShoeSpec` captures ankle, mid-calf, knee-high, over-the-knee, Chelsea, sock, riding, western, and other subtypes. Unknown measurements can remain “按参考图保持”; no material composition, waterproofing, warmth, anti-slip, or fit claim is invented.

The UI keeps a separate boot draft and switches product context, field groups, references, shot plans, guards, copy, and stale-output state when the category changes. Boot reference roles include primary, full side, front, rear, shaft detail, closure detail, material, and outsole.

## Boot behavior

- Single prompts keep the complete boot visible from toe to shaft opening and protect shaft height, opening, ankle ease, calf fit, knee relation, closure, heel, outsole, tread, material, and leg contact.
- Lifestyle 3 uses full-look departure, controlled small-step movement, and pause/seated closure or shaft proof. Lifestyle 5 adds arrival and shaft/material proof. The boot, model identity, and visual direction remain fixed while action, gaze, expression, framing, and scene vary.
- Studio 8 uses complete hero, full side, front, rear-aware, shaft/opening, ankle/closure, heel/outsole/tread, and subtype-specific worn/pair proof. It does not reuse pump or trainer detail plans.
- Styling supports trousers outside or tucked when appropriate, skirts, dresses, and coats without shaft penetration or permanent product concealment.

## Validation and regressions

Boot copy rejects trainer/sneaker/pump-primary wording and unsupported performance claims. Prompt vocabulary is isolated for boot output while German trainer and pump outputs retain their own product language. Planned loafer, ballet flat, sandal, mule, and other categories remain blocked. Garment behavior is unchanged.

Known limitations:

- Exact shaft geometry cannot be guaranteed by a prompt alone.
- Small logos and hardware may vary in Image 2.0 output.
- A complete side reference is critical for shaft, opening, calf, and proportion accuracy.
- Missing rear references cannot support exact rear reconstruction.
- Calf fit cannot be guaranteed from incomplete references.
- Long or asymmetric boots may require manual prompt refinement.
