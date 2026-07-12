# Black Mirror Phase 7B — Pump Adapter

## Scope and decisions

Phase 7B activates only the `pump` category (closed-toe high-heel pump) on top of the Phase 7A registry. Boots, loafers, ballet flats, sandals, mules, and `other` remain planned and blocked. No image API, backend, dependency, upload service, commit, or push is part of this phase.

| Item | Decision |
| --- | --- |
| Y01 | `pump` is active and resolves only to `pumpAdapter`; UI label is 高跟单鞋. |
| Y02 | Added `PumpShoeSpec`, required product name/color/material/toe/heel/height/back/key details, and optional vamp/topline/side/strap/arch/platform fields. Custom pumps do not inherit THERUIZ AURA branding. |
| Y03 | Pump UI exposes pump fields and planned categories remain disabled. Pump references are capped at six and generation requires four, exactly one primary, and a full side reference. |
| Y04 | Added pump-native single, lifestyle 3/5, and studio 8 shot behavior. |
| Y05–Y08 | Added pump scenes, styling boundaries, content profile, topic guides, copy, and studio proof cards. |
| Y09–Y10 | Added pump validation, targeted vocabulary isolation, and preserved German-trainer/garment routing. |
| Y11–Y18 | Added heel/foot-contact negatives, category switch stale-state handling, planned-category isolation, and release assertions. |

## Architecture

`shoeCategoryRegistry.ts` remains the single routing boundary. `pumpAdapter.ts` implements the existing adapter contract for product lines, accuracy, visibility, clipping, scene control, shot composition, action safety, negative rules, styling boundaries, field schema, reference requirements, shot-plan capability, and content profile. `shoeProductAdapter.ts` remains a compatibility wrapper and does not select a fallback category.

The UI stores `shoeCategory` and a separate `pumpSpec`. Switching between German trainer and pump changes product context, field visibility, reference requirements, shot plans, and stale output state. Pump reference cards carry roles so the primary and side requirements can be checked before generation.

## Pump behavior

- Single prompts protect toe shape, vamp, topline, side cut, heel counter, heel height/type/thickness/placement/angle, arch, pitch, outsole/platform, back/strap construction, material, color, and grounded contact.
- Lifestyle 3 uses departure hero, controlled side step, and pause/seated social proof. Lifestyle 5 adds arrival/browsing and a natural heel/material proof card. The same pump and model continue across the set while action, gaze, expression, framing, and supporting styling vary.
- Studio 8 uses front-side hero, full side, front toe, rear/rear-three-quarter reference-aware view, heel geometry, vamp/topline/side cut, material/edge craft, and controlled worn/pair proof. It does not reuse tongue/lace/eyelet shot purposes.
- Copy is pump-specific and avoids unsupported comfort, anti-slip, pain, or ergonomic claims. A pump copy validator records contamination warnings.

## Regression and limitations

German trainer remains active through `germanTrainerAdapter`; garment context remains untouched. Planned categories remain blocked and cannot fall back to pump or German trainer. A targeted pump vocabulary boundary prevents legacy sneaker wording from entering pump prompts while leaving German-trainer wording unchanged.

Known limitations:

- Prompt guards cannot guarantee exact heel geometry in Image 2.0 output.
- Small logos and text may render incorrectly.
- A complete side reference materially improves heel and arch accuracy.
- Without a rear reference, exact rear construction is intentionally not promised.
- Extreme heel designs may still need manual prompt refinement.
- The current local uploader stores reference images in browser memory; it is not a remote upload or image-generation API.
