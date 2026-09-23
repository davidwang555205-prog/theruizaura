# Immersive Narrative Product Presence Curve V1

## Status

Implemented as an isolated layer after approved Scene Resolution.

```text
SCENE_RESOLUTION_APPROVED
        ↓
Product Presence Planner
        ↓
PRODUCT_PRESENCE_APPROVED / PRODUCT_PRESENCE_FAILED
```

The layer does not modify Story Intent, Character State, Micro Event, Emotional Arc, Moment order, What Happens, Scene Resolution, or Location World.

## Presence Levels

```text
ABSENT
INCIDENTAL
READABLE
HERO
```

- `ABSENT`: product visibility is not required.
- `INCIDENTAL`: product may appear as part of the full human action, without presentation or emphasis.
- `READABLE`: at least one referenced shoe remains naturally readable at believable human scale.
- `HERO`: footwear carries the strongest commercial evidence in the moment without becoming a catalog pose.

## Evidence Rules

- At least one `HERO` plus one `READABLE`, or
- at least two `READABLE` moments when `HERO` is not natural.

V1 limits:

- `HERO <= 1`
- `READABLE + HERO <= 3`
- Moment 1 does not start as `HERO`
- Moment 5 is not required to be `HERO`
- A Micro Event does not automatically become `HERO`

## Topic Baselines

```text
下班回家   INCIDENTAL / READABLE / READABLE / HERO / ABSENT
出门       ABSENT / INCIDENTAL / READABLE / HERO / INCIDENTAL
周末书店   INCIDENTAL / READABLE / INCIDENTAL / READABLE / ABSENT
等人       READABLE / INCIDENTAL / READABLE / HERO / INCIDENTAL
咖啡馆     INCIDENTAL / READABLE / ABSENT / READABLE / INCIDENTAL
采购归来   READABLE / READABLE / INCIDENTAL / HERO / ABSENT
```

The baseline is not allowed to override Narrative reality. When a proposed HERO moment is an upper-body or object interaction such as key search, sleeve adjustment, bag handling, counters, or shelves, V1 lowers it to `READABLE` instead of changing the action.

Actual V1 curves after natural HERO guard:

```text
下班回家   INCIDENTAL / READABLE / READABLE / READABLE / ABSENT
出门       ABSENT / INCIDENTAL / READABLE / READABLE / INCIDENTAL
周末书店   INCIDENTAL / READABLE / INCIDENTAL / READABLE / ABSENT
等人       READABLE / INCIDENTAL / READABLE / READABLE / INCIDENTAL
咖啡馆     INCIDENTAL / READABLE / ABSENT / READABLE / INCIDENTAL
采购归来   READABLE / READABLE / INCIDENTAL / READABLE / ABSENT
```

## Topic Expansion Baselines

The catalog expansion adds these product-presence baselines:

```text
周末独处   ABSENT / INCIDENTAL / READABLE / READABLE / ABSENT
接孩子后   INCIDENTAL / READABLE / INCIDENTAL / READABLE / ABSENT
周末散步   INCIDENTAL / READABLE / READABLE / INCIDENTAL / ABSENT
午餐之后   ABSENT / INCIDENTAL / READABLE / READABLE / INCIDENTAL
城市闲逛   INCIDENTAL / READABLE / INCIDENTAL / READABLE / ABSENT
傍晚回家   READABLE / INCIDENTAL / READABLE / READABLE / ABSENT
短途出行   INCIDENTAL / READABLE / INCIDENTAL / READABLE / ABSENT
```

All 13 catalog topics pass Product Presence with narrative-preserving adjustments. HERO is still not forced.

## QC

- `Narrative Preserved`
- `Product Not Forced`
- `Sufficient Product Evidence`
- `No Overexposure`

Any invalid input status, invalid presence level, moment count mismatch, forced display action, insufficient evidence, or overexposure produces:

```text
PRODUCT_PRESENCE_FAILED
```

## UI

The existing `ImmersiveNarrativeWorkspace` shows:

- Narrative → Scene Resolver → Product Presence pipeline
- Presence badge for every Moment
- Four Product Presence QC gates
- Failure reasons when present

No curve editor, drag interaction, or manual presence override was added.

## Validation

```bash
npm run validate:narrative-product-presence
```

Coverage includes the original six Topic details plus all 13 catalog Topics through the topic-pipeline validator, a zero-HERO two-READABLE case, a natural HERO case, overexposure failure, forced-product failure, invalid narrative status, invalid Scene Resolution status, invalid presence level, moment-count failure, narrative preservation, and existing Prompt / JSON / Seedance hash regression.

## Current State

`PRODUCT PRESENCE CURVE V1 COMPLETE`

Sound World V1 consumes the approved Product Presence output; Camera Narrative Role V1 then consumes the approved Sound World output. Physical Action Compiler, Camera Execution, Seedance Compiler, Audio Generation, and Provider E2E remain unbuilt.
