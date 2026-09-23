# COMMERCIAL CREATIVE STORY SPINE V1.1

V1.2 directing extension: `docs/commercial-film/COMMERCIAL_CREATIVE_DIRECTION_V1_2.md`

## 定位

Commercial Film V1.1 在现有五镜头 Planner 之前增加一个 Commercial-only 表达层；它不替代 WORLD / WEAR / DETAIL / HERO / RELEASE，也不修改 Narrative、Existing 318 Actions 或共享合同。

```text
Commercial Intent
→ Creative Premise
→ Human Situation
→ Audience Desire
→ Product Meaning
→ Story Spine
→ Shot Dramatic Functions
→ Existing 5 Shot Architecture
→ Existing Camera / Action / Product Plan
→ Existing Execution Compiler
```

目标不是把广告片做成微电影，而是回答：

> What is this 15-second film actually expressing?

## Creative Premise

每个 Intent 必须生成且只生成一个 Creative Premise。

Premise 由以下现有资源确定性组合：

- Commercial Intent
- Human Situation
- Product Message coverage
- Audience Desire
- Brand expression

它不是 slogan、marketing claim、aesthetic label 或 scene list。

## Human Situation

当前受控类别：

- LEAVING_HOME
- ARRIVING_SOMEWHERE
- MOVING_BETWEEN_PLACES
- PREPARING_FOR_DAY
- TAKING_A_SHORT_PAUSE
- RETURNING_HOME
- WAITING
- MEETING_SOMEONE
- WALKING_WITHOUT_URGENCY
- TRANSITIONING_WORK_TO_PERSONAL

Human Situation 只组织现有 Scene Library 与 Existing Actions，不新增持续动作库。

## Audience Desire

受控内部 desire catalog：

- EFFORTLESSNESS
- CONFIDENCE
- COMFORT
- VERSATILITY
- QUIET_REFINEMENT
- EVERYDAY_EASE
- SELF_POSSESSION
- LIGHTNESS
- BELONGING
- UNFORCED_STYLE

它们是内部规划概念，不会以 enum label 进入最终 Seedance 文本。

## Product Fact / Product Meaning

Product Fact：

- 当 AURA 内部存在 confirmed reference coverage 时，只来源于当前 TaskProductTruth 与 confirmed reference coverage。
- 当 AURA 内部参考为 0 时，不生成产品 fact；产品身份由外部 Seedance workflow 的参考图在生成时提供。

Product Meaning：

- 描述产品在本片中的 commercial role。
- 不新增 comfort、performance、material、durability、fit 等 physical claim。
- 如果 Internal Product Truth 没有对应 coverage，则不生成具体产品 Meaning；只保留 generic external-reference meaning 和禁止发明产品事实的 protection。

## Story Spine

五镜头继续保留：

```text
WORLD
WEAR
DETAIL
HERO
RELEASE
```

每个镜头增加：

- dramaticFunction
- narrativePurpose
- audienceKnowledgeBefore
- audienceKnowledgeAfter
- productNarrativeRole
- continuityFromPrevious
- continuityToNext

受控 dramatic functions：

- ESTABLISH
- INVITE
- DISCOVER
- CONFIRM
- RESOLVE

不强制一一对应：

```text
WORLD ≠ always ESTABLISH
DETAIL ≠ always DISCOVER
HERO ≠ always CONFIRM
```

## Product Presence Design

Commercial-only presence vocabulary：

- CLEAR
- SECONDARY
- PARTIAL
- IMPLIED
- ABSENT

同时保留现有产品保护：

- WEAR 仍然要求 PRODUCT_READABLE
- DETAIL 仍然要求 reference-supported product detail
- HERO 仍然要求 PRODUCT_HERO
- HERO 的 presence design 必须为 CLEAR
- DETAIL 不允许 ABSENT

只有 DELAYED / HUMAN_FIRST 可以允许 WORLD 完全无产品，并且后续必须提供强 product read。

## Reveal Strategy

受控模式：

- IMMEDIATE
- PROGRESSIVE
- DELAYED

默认 Intent 映射：

| Intent | Default Reveal |
| --- | --- |
| URBAN_MOTION | PROGRESSIVE |
| DAILY_STYLING | IMMEDIATE |
| QUIET_LUXURY | DELAYED |
| PRODUCT_CRAFT | PROGRESSIVE |
| NEW_ARRIVAL | IMMEDIATE |

Reveal Strategy 会写入 `CommercialProductVisibilityPlan.presenceByShot`，不削弱现有 `PRODUCT_READABLE` / `PRODUCT_DETAIL` / `PRODUCT_HERO` 保护。

## Continuity

Story Spine 显式维护：

- location relationship
- time relationship
- character state
- wardrobe
- action progression
- spatial logic
- emotional temperature
- product presence progression

目标是 same place evolving、adjacent believable places 或简单可信过渡，而不是随机视觉多样性。

## Story QC

Story QC 失败代码：

- COMMERCIAL_PREMISE_MISSING
- SHOT_FUNCTION_DUPLICATION
- STORY_CONTINUITY_BROKEN
- ARBITRARY_PRODUCT_INSERT
- HERO_CONTEXT_DISCONNECTED
- RELEASE_NOT_RESOLVED
- PRODUCT_MEANING_UNSUPPORTED
- HUMAN_SITUATION_INCONSISTENT
- PREMISE_NOT_REFLECTED
- PRODUCT_READABILITY_UNPROTECTED

## Execution Compiler

Story Spine 元数据只进入 Debug。

模型最终文本不会出现：

- dramatic function
- audience desire
- story spine
- product meaning
- reveal strategy
- internal enum labels

Compiler 将这些信息翻译成自然导演语言：

- 为什么这个 moment 存在
- 画面里发生了什么变化
- 它与上一镜头如何连接
- 观众应注意到什么
- 产品需要多清楚地被看见

## Validation

新增：

```bash
npm run validate:commercial-creative-spine
```

覆盖：

- 5 个 Commercial Intent
- 一个 Premise
- 一个 Human Situation
- 一个 Audience Desire
- 一个 Product Meaning
- Reveal Strategy
- 五个 dramatic assignments
- continuity chain
- Story QC
- product meaning support
- product readability
- internal enum leakage
- deterministic recompilation

同时保留：

```bash
npm run validate:commercial-film
npm run validate:commercial-execution-compiler
```
