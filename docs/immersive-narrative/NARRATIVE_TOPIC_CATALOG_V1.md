# Immersive Narrative Topic Catalog V1

## Status

The official Narrative topic catalog now contains 13 canonical topics.

```text
Topic Catalog
        ↓
Character Profile Catalog
        ↓
Narrative Planner
        ↓
Scene Resolver
        ↓
Product Presence
        ↓
Sound World
        ↓
Camera Narrative Role
```

The catalog is the single topic-resolution source for all four layers. Modules resolve canonical ids instead of depending on display strings.

## Canonical Topics

```text
ID                         Label       Aliases
after_work_home             下班回家
weekend_alone               周末独处
errand_outing               出门办事    出门
waiting_for_friend          等朋友      等人
afternoon_cafe              午后咖啡    咖啡馆、买咖啡
bookstore_browse            逛书店      周末书店
returning_with_purchases    采购归来
after_school_pickup         接孩子后
weekend_walk                周末散步
after_lunch                 午餐之后
city_wandering              城市闲逛
evening_return_home         傍晚回家
short_local_trip            短途出行
```

The old labels remain backward-compatible aliases. Unknown topics still fail closed with `UNSUPPORTED_TOPIC`.

## Topic Definitions

Each catalog record stores:

- canonical id and display label
- aliases
- narrative definition
- default character states
- allowed Micro Event families
- preferred Location Worlds
- forbidden patterns
- lifestyle tone
- default Scene Library labels
- `ACTIVE` status

## Pipeline Result

```text
下班回家   Character PASS / Narrative PASS / Scene PASS / Product PASS / Sound PASS / Camera PASS
周末独处   Character PASS / Narrative PASS / Scene PASS / Product PASS / Sound PASS / Camera PASS
出门办事   Character PASS / Narrative PASS / Scene PASS / Product PASS / Sound PASS / Camera PASS
等朋友     Character PASS / Narrative PASS / Scene PASS / Product PASS / Sound PASS / Camera PASS
午后咖啡   Character PASS / Narrative PASS / Scene PASS / Product PASS / Sound PASS / Camera PASS
逛书店     Character PASS / Narrative PASS / Scene PASS / Product PASS / Sound PASS / Camera PASS
采购归来   Character PASS / Narrative PASS / Scene PASS / Product PASS / Sound PASS / Camera PASS
接孩子后   Character PASS / Narrative PASS / Scene PASS / Product PASS / Sound PASS / Camera PASS
周末散步   Character PASS / Narrative PASS / Scene PASS / Product PASS / Sound PASS / Camera PASS
午餐之后   Character PASS / Narrative PASS / Scene PASS / Product PASS / Sound PASS / Camera PASS
城市闲逛   Character PASS / Narrative PASS / Scene PASS / Product PASS / Sound PASS / Camera PASS
傍晚回家   Character PASS / Narrative PASS / Scene PASS / Product PASS / Sound PASS / Camera PASS
短途出行   Character PASS / Narrative PASS / Scene PASS / Product PASS / Sound PASS / Camera PASS
```

## Topic Distinctions

```text
下班回家
work/public day → private home state

傍晚回家
ordinary evening outside life → private home state
no automatic work or office semantics
```

```text
周末散步
neighborhood / residential / quiet route

城市闲逛
urban blocks / storefronts / architecture / street corners
```

`接孩子后` keeps the THERUIZ AURA adult woman as the narrative subject. Child distress, family conflict, school problems, and child-model framing are forbidden. `周末独处` forbids loneliness and melancholy framing. `短途出行` forbids airport, train, flight, hotel, suitcase, vacation, tourist, and long-distance travel semantics.

## UI

The Immersive Narrative Workspace Topic control is now a dropdown containing exactly the 13 canonical labels. Aliases remain available through the programmatic topic resolver for old workflows and saved inputs.

## Validation

```bash
npm run validate:narrative-topic-catalog
npm run validate:narrative-topic-pipeline
```

The catalog validator checks count, unique ids and labels, aliases, canonical order, alias equivalence, and unsupported-topic failure. The pipeline validator runs all 13 topics through Narrative, Scene Resolver, Product Presence, and Sound World, then checks required topic distinctions.

## Current State

`NARRATIVE TOPIC CATALOG V1 COMPLETE`

Scene Library remains at 39. Camera Narrative Role V1 is complete.
