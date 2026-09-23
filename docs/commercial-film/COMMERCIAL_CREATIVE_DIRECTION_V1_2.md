# COMMERCIAL CREATIVE DIRECTION V1.2

## Category Boundary

Commercial Film Script 是独立内容类别，不是 Narrative mode、subtype、preset 或 Narrative generation extension。

本轮没有修改：

- Narrative upper-layer planning
- Narrative script types
- Narrative UI category logic
- Narrative compiler
- Narrative QC
- Existing 318 Actions

共享底层资源只作为 read-only dependency 使用。

## Architecture

```text
Commercial Intent
→ Creative Premise
→ Human Situation
→ Audience Desire
→ Product Meaning
→ Story Spine
→ Creative Mode
→ Camera Behavior
→ Edit Logic
→ Existing 5 Shot Architecture
→ Camera / Action / Product Planning
→ Execution Compiler
```

## Creative Modes

受控目录：

- PRIVATE_MOMENT
- CITY_JOURNEY
- EVERYDAY_MOVEMENT
- STATE_TRANSITION
- SENSORY_LIFE
- SINGLE_IDEA

Creative Mode 由以下因素确定性选择：

- Commercial Intent
- Creative Premise
- Human Situation
- Audience Desire
- Product Meaning
- Reveal Strategy
- generation nonce

同一 Intent 不永久绑定一个 Mode；不同 nonce 可以选择不同合法 Mode。

## Camera Behavior Registry

受控行为：

- OBSERVE
- FOLLOW
- WAIT
- DISCOVER
- PASS_BY
- GROUND_OBSERVATION
- DETAIL_INTERRUPTION
- WITHHOLD
- REVEAL

约束：

- 每部片至少 3 种 Camera Behavior
- 任一行为不超过 2 次
- HERO 不得使用 WITHHOLD
- RELEASE 不引入新的最强 camera grammar
- DETAIL 不能成为被迫的隔离 beauty insert

Camera Behavior 由 body mechanics 与 Story Spine dramatic function 推导，不由镜头先反过来要求人物表演。

## Edit Logic

受控模式：

- ACTION_CUT
- MATCH_MOVEMENT
- SENSORY_INSERT
- DELAYED_REVEAL

每部片固定一个 primary edit logic，可选一个 secondary edit logic。

Edit Logic 服从现有 Reveal Strategy：

- IMMEDIATE：产品早期清楚
- PROGRESSIVE：产品逐步清楚
- DELAYED：允许早期 withhold，但 HERO 必须 CLEAR

## Visual Motif

可选 motif：

- THRESHOLD
- LIGHT
- REFLECTION
- SHADOW
- LINE
- REPETITION

最多一个 primary motif 或零 motif。Motif 只影响构图、过渡与 continuity，不改变 Product Truth、动作物理或人物状态。

## Shot Direction Contract

每个镜头新增：

- creativeMode
- cameraBehavior
- editEntry
- editExit
- cutMotivation
- visualMotifContribution
- cameraNarrativeReason
- movementContinuity
- viewerAttentionTarget

这些字段只属于 Planner / Debug，不进最终 Seedance prompt 的字段标签或 enum 形式。

## Cut Motivation

受控动机：

- ACTION_COMPLETION
- ACTION_CONTINUATION
- VISUAL_MATCH
- ATTENTION_SHIFT
- SPATIAL_TRANSITION
- PRODUCT_DISCOVERY
- EMOTIONAL_RELEASE

每段 transition 必须能解释为什么在这里切。SHOT 5 必须通过 EMOTIONAL_RELEASE 收束前四镜头。

## Direction QC

新增失败代码：

- COMMERCIAL_CAMERA_MONOTONY
- CAMERA_FUNCTION_MISMATCH
- UNMOTIVATED_EDIT
- VISUAL_GRAMMAR_BREAK
- DECORATIVE_INSERT
- PRODUCT_PRESENTATION_GESTURE
- REVEAL_STRATEGY_CONFLICT
- RELEASE_DIRECTION_BREAK
- GENERIC_FASHION_WALK_SEQUENCE
- UNMOTIVATED_PRODUCT_CLOSEUP
- CAMERA_AWARE_PERFORMANCE
- SCENE_AS_DECORATION_ONLY
- LOCATION_CONTINUITY_WEAK
- PRODUCT_OVEREXPOSURE
- NO_VISUAL_IDEA
- HERO_AS_POSE
- RELEASE_AS_EXTRA_BEAUTY_SHOT

## Compiler Translation

最终文本增加自然导演语言：

- camera relationship
- subject movement
- edit entry / exit
- cut reason
- viewer attention
- movement continuity
- visual thread

不得出现：

- Creative Mode enum
- Camera Behavior enum
- Edit Logic enum
- Visual Motif enum
- Cut Motivation enum
- Story Spine enum
- Audience Desire enum
- Reveal Strategy enum
- QC / validator / enum / source ID / primitive ID
- Action IDs
- named luxury brand references

## Required Validation

```bash
npm run validate:commercial-creative-direction
```

同时回归：

```bash
npm run validate:commercial-creative-spine
npm run validate:commercial-film
npm run validate:commercial-execution-compiler
npm run validate:actions
npm run typecheck
npm run build
```
