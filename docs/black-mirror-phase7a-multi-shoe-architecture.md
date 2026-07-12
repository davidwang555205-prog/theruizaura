# Black Mirror Phase 7A — Multi-Shoe Category Architecture

## Decisions X01–X10

| Item | Decision | Result |
| --- | --- | --- |
| X01 | NEEDED | `ShoeCategory` is authoritative in `shoeProductTypes.ts`. |
| X02 | NEEDED | Added `ShoeCategoryAdapter` and `shoeCategoryRegistry`. |
| X03 | NEEDED | Existing rules now run through `germanTrainerAdapter`. |
| X04 | NEEDED | Added `BaseShoeSpec` and `GermanTrainerSpec`. |
| X05 | NEEDED | Added adapter-owned field schema; current UI remains unchanged. |
| X06 | NEEDED | Added typed reference roles and requirements. |
| X07 | NEEDED | Added shot-plan profile and accuracy-guard interfaces. |
| X08 | NEEDED | Soft-seeding checks the active adapter's shot-plan capability before selecting cards. |
| X09 | NEEDED | Legacy German trainers preserve existing prompt routing; garment remains separate. |
| X10 | NEEDED | Added release checks and this architecture record. |

## Before and after

Before Phase 7A, the sole `ShoeProductContext` passed directly to one shoe adapter. That adapter contained German-trainer product wording, accuracy protection, negative rules, studio composition, and styling boundaries.

Now `resolveShoeCategory` resolves a context to a category, `getShoeCategoryAdapter` performs the explicit registry lookup, and the selected adapter creates the prompt adapter. The German-trainer adapter is the only active adapter and wraps the prior rule functions without rewriting their prompt wording.

## Category registry

Supported architecture categories are `germanTrainer`, `pump`, `boot`, `loafer`, `balletFlat`, `sandal`, `mule`, and `other`.

Only `germanTrainer` is active. All other categories are planned and return a clear unsupported state; they cannot fall back to German-trainer protection, shot plans, or content. The production UI therefore keeps the current German-trainer-only selector (Phase 7A uses the “hide planned categories” option).

## Legacy migration and custom shoes

Existing named THERUIZ AURA shoe options resolve to `germanTrainer` when the legacy context has no category. This preserves Cloud Dancer, Cappuccino, single prompts, soft-seeding 3/5, and studio 8 behavior.

An explicit future category always routes to its matching adapter. A non-empty custom shoe with no category resolves to `other`, which is planned and blocked rather than silently treated as a German trainer. Future category-aware UI must pass an explicit category.

## Adapter contract

Every category adapter exposes:

- status and category identity
- prompt-adapter creation
- field schema capability
- reference requirements
- shot-plan profile
- accuracy guard set and negative rules
- optional content profile

The German-trainer implementation retains current toe box, slim outsole, panels, tongue, laces, eyelets, heel patch, forefoot flex, ground-contact, and anti-running-shoe guards. Planned categories expose empty capabilities and cannot generate formal prompts.

## Reference and UI decisions

German trainer references remain non-blocking and compatible with the current 1–9 local reference-image UI; `primary`, `side`, `top`, `rear`, `material`, and `detail` are recommendations for later category-aware upload UI. No new upload blocking was introduced.

The current UI is intentionally unchanged. It does not expose pumps or boots as selectable production categories. This avoids presenting incomplete prompt logic as usable.

## Regression results

- Cloud Dancer single prompt still contains the current THERUIZ AURA German trainer protection.
- Shoe lifestyle 3 and 5 retain the Phase 6/Hotfix diversity path because the active adapter supports those shot counts.
- Shoe studio 8 remains enabled for the active adapter.
- An explicit `pump` context emits an unsupported state, contains no German-trainer wording, and yields zero soft-seeding image cards.
- Garment contexts bypass shoe category resolution and retain garment adapter behavior.

## Deferred work

Phase 7B may add active category UI, category-specific reference schemas, and pump/boot product specs. Phase 7C may add validated pump, boot, loafer, flat, sandal, and mule prompt/shot-plan implementations. No new category prompt logic is included in Phase 7A.
