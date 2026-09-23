# Immersive Narrative Scene Coverage Patch V1

## Scope

Phase 2.5 adds only the Scene Library coverage required by the three Narrative topics that previously failed Scene Resolution:

- `出门`
- `周末书店`
- `采购归来`

No Narrative Planner behavior, Resolver QC condition, downstream Prompt, Lifestyle Video, Seedance, or Provider flow was changed.

## Scene Library Change

```text
Before: 36
After:  39
New:     3
```

All three records are added to the existing `src/data/lifestyleSoftSeedingScenePool.ts` source. They use `weight: 0` so they are available for explicit Narrative coverage mapping but do not alter legacy Lifestyle automatic rotation.

## New Scene List

### 1. `lifestyle-residential-building-exit`

```text
Scene Name:     住宅楼外
Location World: LEAVING_HOME
Required By:    出门
Required By:    Moment 3, Moment 4, Moment 5
Reason:         Existing 玄关出门 covers the indoor threshold but not the first outdoor
                sidewalk continuation in the same continuous world.
```

### 2. `lifestyle-bookstore-interior`

```text
Scene Name:     书店 / 杂志店内
Location World: BOOKSTORE_VISIT
Required By:    周末书店
Required By:    Moment 5
Reason:         Existing 书店 / 杂志店门口 covers exterior approach and window notice
                but has no connected interior browsing space for the final continuation.
```

### 3. `lifestyle-home-errand-entry`

```text
Scene Name:     归家玄关
Location World: RETURNING_WITH_PURCHASES
Required By:    采购归来
Required By:    Moment 2, Moment 3, Moment 4, Moment 5
Reason:         Existing grocery approach and 回家进门 scenes are separate records;
                the Narrative needs one connected errand-return entry threshold that
                supports bag handling at the door and interior transition without
                inventing a kitchen or rewriting the story.
```

## Location World Updates

- `LEAVING_HOME`: `lifestyle-entryway-departure` + `lifestyle-residential-building-exit`
- `BOOKSTORE_VISIT`: `lifestyle-bookstore` + `lifestyle-bookstore-interior`
- `RETURNING_WITH_PURCHASES`: `lifestyle-premium-grocery` + `lifestyle-home-errand-entry`

Resolver logic was not relaxed. The existing four gates still apply:

- All Moments Resolved
- Location Continuity
- Narrative Preserved
- No Scene Invention

## Final Coverage

```text
下班回家   SCENE_RESOLUTION_APPROVED   HOME_ARRIVAL
出门       SCENE_RESOLUTION_APPROVED   LEAVING_HOME
周末书店   SCENE_RESOLUTION_APPROVED   BOOKSTORE_VISIT
等人       SCENE_RESOLUTION_APPROVED   OFFICE_ENTRANCE_WAIT
咖啡馆     SCENE_RESOLUTION_APPROVED   CAFE_VISIT
采购归来   SCENE_RESOLUTION_APPROVED   RETURNING_WITH_PURCHASES
```

## Validation

```bash
npm run validate:narrative-planner
npm run validate:narrative-scene-resolver
npm run validate:narrative-scene-coverage
npm run validate:lifestyle-taxonomy
npm run validate:actions
npm run validate:video-script
npm run typecheck
npm run build
```

The coverage validator checks that all Location World mappings reference real scene IDs, no mapping points to a missing Scene, new IDs are unique, the original six Topics resolve, and all four Resolver QC gates remain PASS. The topic-pipeline validator extends this to all 13 catalog Topics.

## Current State

`SCENE COVERAGE PATCH COMPLETE`

Only the minimum required Scene coverage was added. Product Presence Curve, Sound World, Camera Narrative Role, Physical Action Compiler, Seedance integration, and Provider E2E remain unbuilt.
