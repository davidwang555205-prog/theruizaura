# Immersive Narrative Closure V1.1

## Status

```text
NARRATIVE CLOSURE V1.1 COMPLETE
13 Topics Goal Defined      13 / 13
Goal Completed              13 / 13
Resolved Ending             13 / 13
Semantic Loop                0
Event Without Consequence    0
```

V1.1 is a correctness upgrade on top of the frozen V1 pipeline. V1 history is
unchanged; the narrative layer now proves that a 15-second slice actually
finishes what it starts.

## Canonical data extension

`src/immersive-narrative/types.ts`

```text
NarrativePlan.localGoal            required, per Topic, from topic-catalog
NarrativePlan.goalState            NOT_STARTED | IN_PROGRESS | BLOCKED | COMPLETED
NarrativePlan.spatialEnvelope      macroLocation + allowedAnchors + continuityMode
NarrativeMoment.startState         previous Moment boundary (or INITIAL_STATE)
NarrativeMoment.endState           canonical completion boundary
NarrativeMoment.goalProgress       0.15 / 0.35 / 0.55 / 0.8 / 1 per purpose
NarrativeMoment.completionBoundary the maximum narrative progress of the Moment
NarrativeMoment.spatialAnchor      canonical anchor id
```

`src/immersive-narrative/closure.ts` owns the vocabulary and the evaluation:

```text
WALK_CONTINUES · SEARCH_STARTED · SEARCH_CONTINUES · REACH_STARTED ·
OBJECT_HANDLING · ITEM_RETRIEVED · DOOR_HANDLED · ENTERED · SETTLED · STATE_HELD
```

The boundary is derived once, in the planner, from the Narrative Moment text.
Every downstream layer consumes it; none of them re-derives it.

## Narrative QC

`runNarrativeQc` now emits 14 gates. The six new ones are structural, not
keyword counts:

```text
spatial_continuity       全部 Moment anchor 处于同一 envelope 且转移类合法
state_progression        每一步都改变 motion / interaction / anchor / goalProgress
micro_event_consequence  micro event 必须在后续 Moment 留下变化
no_semantic_loop         后续 Moment 不得在 goalProgress 未增加时回到早期状态
goal_completion          M5 必须 goalProgress = 1 且命中 resolved boundary
resolved_ending          M5 不得出现 nearly / about to / continues toward 等未完成语义
```

`natural_ending` 保留为兼容 gate，但它现在**必须**同时满足 `goal_completion`：
`goalState != COMPLETED` 时任何结尾都不再被放过（这正是 `短途出行`
“continues toward … nearly complete”曾经 PASS 的原因）。

## Archetype fixes (source of truth, not downstream patch)

`src/immersive-narrative/catalog.ts`

```text
短途出行   重写为 ARRIVAL SLICE：社区步道 → 检查/整理随身小物 → 最后几步 →
           reaches the 写字楼门口 and stops there; the short move is complete.
采购归来   重写为 home-return final stretch：出电梯 → 走廊（提袋受力）→
           门口停一次换手 → 开门 → 提着袋子进入玄关。
接孩子后 / 周末散步 / 午餐之后
           M5 从 “continues toward …” 改为 settled + “behind her / is complete”
           的 resolved after-state。
```

English sentences are not copied from the request; each archetype keeps the
project’s existing template style (`scene(context, role)` + pronoun context).

## Regression

```text
SHORT_LOCAL_TRIP_INCOMPLETE_LOOP
before   goal=arriving · ending="continues toward the nearby destination;
         the short move is nearly complete" · semantic loop yes
after    goal=completed · ending="reaches the 写字楼门口 and stops there;
         the short move is complete" · semantic loop no

HOME_ARRIVAL / BOOKSTORE / PURCHASES
goal completed and resolved ending in all three
```

## Validator

```text
npm run validate:narrative-closure
scripts/validateNarrativeClosure.mjs
fixtures 9：resolved-ending-pass, nearly-arrived-fail, walking-loop-fail,
walking-with-goal-progress-pass, event-without-consequence-fail,
initial-equals-after-fail, bookstore-notice-to-entry-pass,
home-arrival-to-inside-pass, short-trip-nearly-complete-fail
result   13 / 13 goal completed · 13 / 13 resolved ending · 0 semantic loop
```

## Not changed

```text
Existing 318 Actions · Narrative Primitive Registry · Evidence Guard ·
Product Presence source · Sound taxonomy · Commercial Film · legacy Lifestyle
```
