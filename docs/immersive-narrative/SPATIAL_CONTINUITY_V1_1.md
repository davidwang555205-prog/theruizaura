# Immersive Narrative Spatial Continuity V1.1

## Status

```text
SPATIAL CONTINUITY V1.1 COMPLETE
13 Topics Spatially Continuous  13 / 13
Teleport                          0
Origin / Execution Confusion      0
Scene Library Modified            NO
```

The 15-second slice must live inside **one continuous spatial envelope**: the
same space, or positions a person can reach by walking at ordinary speed.

## Minimal spatial module

`src/immersive-narrative/spatial/`

```text
types.ts      SpatialAnchorId · SpatialTransitionClass · SpatialEnvelope
catalog.ts    anchor table: label + text patterns + adjacent anchors
validator.ts  detectSpatialAnchor · classifyTransition · validateSpatialSequence
```

Transition classes (only the first three are allowed):

```text
SAME_ANCHOR · IMMEDIATE_ADJACENT · SHORT_CONTIGUOUS_WALK · NON_CONTIGUOUS
```

Anchors are *within-scene execution positions* (elevator exit, hallway, apartment
threshold, entryway, counter, shop window, community path, office entrance …).
They are not Scene Library entries.

The anchor of a Moment is where its action ends up: the detection reads the last
spatial mention and ignores aftermath clauses such as “the hallway returns to
stillness”.

## Envelope and ownership

`src/immersive-narrative/topic-catalog/catalog.ts`

```text
TOPIC_LOCAL_GOALS        每 Topic 的 15 秒目标
SPATIAL_ANCHOR_FAMILIES  HOME_RETURN_FINAL_STRETCH · PRIVATE_TIME · LEAVING_HOME ·
                         OFFICE_WAIT · CAFE_VISIT · BOOKSTORE_VISIT ·
                         COMMUNITY_WALK · STREET_INTERVAL · ARRIVAL_SLICE
TOPIC_SPATIAL_FAMILY     13 Topic → 一个 family
buildSpatialEnvelope()   macroLocation + allowedAnchors + CONTIGUOUS_ROUTE
```

Narrative owns the envelope and the anchors. The Scene Resolver only *carries*
them and checks its own scene sequence against them.

## Origin context ≠ execution location

```text
采购归来   origin context: shopping
          execution location: home-return final stretch
          defaultSceneLabels 由 ["精品超市 / 日常采购","归家玄关"] 改为
          ["公寓走廊","归家玄关"]，规则改走 HOME_ARRIVAL / lifestyle-returning-home

短途出行   execution location: 社区步道 → 最后一段步行 → 写字楼门口
          Scene 指派由 4 段（住宅楼外/周末轻旅行×2/停车后步行去办公室/社区步道）
          收窄为 community-path ×3 → parking-to-office → office-entrance

傍晚回家   M1 从 “城市街角 / 安静街区” 收窄到 “住宅楼外”，
          使 street → home threshold 的跳跃变成 RESIDENTIAL_EXIT → APARTMENT_THRESHOLD
```

## Scene Resolver

```text
SceneResolverInput.spatialEnvelope         新增
ResolvedMoment.spatialAnchor               planner 的 canonical anchor
ResolvedMoment.transitionFromPrevious      SAME_ANCHOR / IMMEDIATE_ADJACENT / …
ResolvedMoment.spatialContinuityStatus     PASS / FAIL
```

`scene-resolver/qc.ts` 由 4 门增至 7 门：

```text
scene_sequence_spatially_continuous  anchor 序列连续
no_origin_execution_confusion        规则所在 world 不含无法从执行路线到达的 origin anchor
no_unannounced_location_jump         不存在 NON_CONTIGUOUS 转移
```

原有 `location_continuity`（同一 world 成员资格）保留，但不再作为充分条件。

## Validator

```text
npm run validate:narrative-spatial-continuity
scripts/validateNarrativeSpatialContinuity.mjs
fixtures 8：single-space-pass, adjacent-route-pass,
elevator-hallway-door-entry-pass, bookstore-window-threshold-interior-pass,
supermarket-home-fail, school-home-fail, cafe-home-fail,
short-trip-multi-location-fail
production audit：13 / 13 spatially continuous；采购归来 不含超市场景；
短途出行 ≤3 anchors 且以 destination anchor 收尾
```

## Not changed

```text
Scene Library 内容（src/data/lifestyleSoftSeedingScenePool.ts）未修改；
只改哪条 Topic 规则选择哪些既有场景。
Existing 318 Actions · Evidence Guard · Camera semantics · Product Presence ·
Sound taxonomy · legacy Lifestyle 全部未动。
```
