# COMMERCIAL FILM V1

V1.1 Creative Story Spine extension: `docs/commercial-film/COMMERCIAL_CREATIVE_STORY_SPINE_V1_1.md`

## 定位

Commercial Film 是 THERUIZ AURA 内容架构中的产品主导型生活方式广告模式，与 Immersive Narrative 平行，不扩展 Narrative Plan，也不借用 Narrative Moment 作为商业片镜头。

```text
CONTENT MODE
├── Immersive Narrative
│   Story-first
│
└── Commercial Film
    Product-first
```

Commercial Film 的最高真相是：

```text
PRODUCT MESSAGE + BRAND MESSAGE
```

## Architecture Audit

### REUSABLE

- `src/immersive-narrative/character-profile/**`
  - 直接复用年龄阶段、外观组、Character Profile QC 与 resolved context。
- `src/data/lifestyleSoftSeedingScenePool.ts`
  - 只读复用现有 39 条 Scene Library；Commercial Scene World 仅通过 scene id 引用。
- `src/visual-system/taskReferenceBinding.ts`
  - 复用 TaskReferenceSet、Image2ReferencePlan、TaskProductTruth、Coverage 与 reference evidence contract。
- `src/data/cameraLookProfiles.ts`
  - 通过现有 AURA camera look 与 negative look 保持品牌摄影语言。
- `src/utils/cameraPerspectiveProfiles.ts`
  - 复用镜头风险判断与自然焦距约束。
- `src/data/personActionLibrary.ts`
  - 只读复用现有 318 Actions；不修改、不重排、不生成第二份 Action 数据。
- `src/immersive-narrative/sound-world/types.ts`
  - 复用 ENVIRONMENT / HUMAN / OBJECT / FOOTWEAR / SILENCE 分类。
- `src/data/sneakerProtectionProfiles.ts`
  - 复用产品保护原则：结构、比例、上脚关系、脚踝、鞋口、鞋底和地面接触。

### PARTIALLY_REUSABLE

- `src/immersive-narrative/camera-execution/**`
  - 可复用 AURA camera look、禁止项、焦距解析；Narrative Camera State、Moment Role 与 `productMayMotivateCamera: false` 不进入 Commercial Film。
- `src/immersive-narrative/sound-world/**`
  - 可复用声音词汇与 naturalistic policy；Narrative topic rules 不进入 Commercial Film。
- `src/immersive-narrative/scene-resolver/**`
  - 可复用 Scene Library、scene id、location logical grouping；Narrative moment assignment 不复用。
- `src/immersive-narrative/physical-action/**`
  - 可只读审计现有动作能力；Narrative eligibility、Moment Requirement 与 Narrative Primitive Registry 不复用。
- `src/immersive-narrative/execution-compiler/**`
  - 可复用“内部计划与模型脚本分离”的原则；Narrative end state、candidate contract 与 plan 不复用。

### COMMERCIAL_ONLY_REQUIRED

- Commercial Intent Catalog
- Commercial Product Message
- Commercial 5 Shot Architecture
- Commercial Product Visibility Plan
- Commercial Action Primitive Registry
- Commercial Camera Rhythm
- Commercial Film QC
- Commercial Execution Compiler
- Commercial Film UI

## Shared Foundation Boundary

Commercial Film 不修改：

- Narrative Planner
- Narrative Topic Catalog
- Moment Chain
- Product Presence Curve
- Camera Narrative Role
- Physical Action Compiler
- Evidence Guard
- Narrative Execution Compiler
- Existing 318 Actions
- Lifestyle runtime

## V1 Input

- Product Reference：当前任务已确认的 reference set。
- Duration：固定 15 秒。
- Character Age。
- Appearance。
- Season。
- Commercial Intent。
- Lifestyle Feeling。

## Five Commercial Intents

1. `URBAN_MOTION`：都市穿行。
2. `DAILY_STYLING`：日常穿搭。
3. `QUIET_LUXURY`：轻奢生活。
4. `PRODUCT_CRAFT`：产品质感。
5. `NEW_ARRIVAL`：新品上新。

V1 不开放额外 Intent。

## Commercial Film Plan

`CommercialFilmPlan` 包含：

- `commercialIntent`
- `productMessage`
- `brandMood`
- `character`
- `season`
- `duration`
- `sceneWorld`
- `shotArchitecture`
- `productVisibilityPlan`
- `cameraRhythm`
- `cameraPlan`
- `actionPlan`
- `soundPlan`
- `endingStrategy`
- `referenceState`
- `qc`

`NarrativePlan` 不是 Commercial Planner 的输入，也不会被 Commercial Film 伪装成商业片计划。

## Product Message

Product Message 默认只使用：

- 当前任务的 TaskProductTruth；
- 当前任务 confirmed references 的 coverage；
- 单独确认的 brand selling points。

支持维度包括：

- silhouette
- toe structure
- side-panel relationship
- heel structure
- outsole profile
- color relationship
- material evidence

Reference = 0 时，Commercial Film 仍可生成完整脚本。此时 Pipeline 使用 external-reference mode：

```text
Use the footwear reference images uploaded in the external video generation tool as the only source of truth for the product. Do not invent or alter product details not supported by those references.
```

不输出颜色、材质、鞋头、外底、拼接、Logo、结构或舒适度等具体产品事实，产品身份由外部 Seedance workflow 的参考图在生成时提供。

## Brand Message

默认品牌方向保持：

- quiet
- warm
- restrained
- premium
- natural
- material-aware

不进入：

- high-energy sports commercial
- luxury cliché
- runway spectacle
- fashion-film abstraction
- loud logo advertising

## 5 Shot Architecture

Shot 不等于 Narrative Moment。

| Shot | Role | Product Visibility |
| --- | --- | --- |
| 1 | WORLD | CONTEXT |
| 2 | WEAR | PRODUCT_READABLE |
| 3 | DETAIL | PRODUCT_DETAIL |
| 4 | HERO | PRODUCT_HERO |
| 5 | RELEASE | BRAND_RELEASE |

至少存在：

- 1 个 PRODUCT_READABLE
- 1 个 PRODUCT_HERO

## Product Visibility

Commercial-only visibility vocabulary：

- CONTEXT
- PRODUCT_READABLE
- PRODUCT_DETAIL
- PRODUCT_HERO
- BRAND_RELEASE

Narrative 的 ABSENT / INCIDENTAL / READABLE / HERO 不成为 Commercial Planner 的规划核心。

## Action

Commercial Action Registry 是独立注册表：

- 优先引用现有 318 Actions。
- 不修改 Existing Actions。
- 不与 Narrative Primitive Registry 混用。
- 商业片专属行为只存在于 `COMMERCIAL_ONLY` primitives。

允许：

- ordinary walking
- restrained transition
- brief natural stop
- natural weight settle
- continue into life

禁止：

- foot modeling pose
- toe pointing
- shoe presentation stance
- runway pose
- repeated shoe-display gesture

## Camera

Camera Rhythm 由 Commercial Intent 固定映射：

| Intent | Rhythm |
| --- | --- |
| URBAN_MOTION | BALANCED |
| DAILY_STYLING | CALM |
| QUIET_LUXURY | CALM |
| PRODUCT_CRAFT | PRODUCT_FORWARD |
| NEW_ARRIVAL | BALANCED |

Commercial Camera 可主动使用：

- locked observation
- restrained follow
- short lateral track
- motivated pan
- controlled detail framing
- product-readable lower framing
- brief hero hold

仍禁止：

- extreme low angle
- ultra-wide distortion
- shoe chase camera
- orbit
- 360 spin
- zoom burst
- aggressive dolly
- whip pan
- music-video style reframing

## Scene / Spatial Anchor

Commercial Film 只选择一个 coherent Scene World，并要求同一场景内的 spatial anchor 顺序。

例如都市穿行：

```text
approach line
→ crossing point
→ storefront edge
→ brief pause
→ exit direction
```

五 Shot 不得变成五个随机背景。

## Sound

V1 只使用 naturalistic sound：

- ENVIRONMENT
- HUMAN
- OBJECT
- FOOTWEAR
- SILENCE

固定：

- no music generation
- no voiceover
- no dialogue

## QC

Commercial Film QC 覆盖：

- Product Message Preserved
- Brand Mood Preserved
- Product Readability
- Hero Moment Exists
- Detail Supported By Reference
- No Product Deformation
- No Product Identity Drift
- No Random Scene Jump
- No Random Character Reset
- Physical Reality
- Camera Continuity
- No Runway Pose
- No Shoe Modeling Pose
- No Commercial Cliché Overload
- Natural Ending
- Full 15s Timing

## Compiler

内部输出：

- `[COMMERCIAL PLAN]`
- `[PRODUCT MESSAGE]`
- `[SHOT PLAN]`
- `[CAMERA PLAN]`
- `[SOUND PLAN]`
- `[REFERENCE STATE]`

模型最终输出：

```text
SEEDANCE — THERUIZ AURA COMMERCIAL FILM

[COMMERCIAL INTENT]
[PRODUCT MESSAGE]
[CHARACTER & WORLD]
[VISUAL CONTINUITY]
[SHOT 1 — WORLD]
[SHOT 2 — WEAR]
[SHOT 3 — DETAIL]
[SHOT 4 — HERO]
[SHOT 5 — RELEASE]
[GLOBAL PRODUCT PROTECTION]
[CAMERA RULES]
[DO NOT]
[ENDING]
```

最终脚本不得出现：

- Action ID
- QC
- enum
- internal reason
- validator
- source ID
- primitive ID

## UI

左侧入口已经加入：

```text
内容生产
→ 品牌广告片
```

Commercial UI 提供：

- Commercial Intent
- 年龄阶段
- 人物外观
- Season
- Lifestyle Feeling
- Duration 15s
- Product Reference 状态
- Generate
- View
- Copy
- Regenerate
- collapsed Debug / Internal

Reference = 0 或参考角色未确认时，Generate 仍可用，并通过 generic external-reference protection 生成脚本。

## Validation

新增：

```bash
npm run validate:commercial-film
npm run validate:commercial-execution-compiler
```

本轮结果见 `COMMERCIAL_EXECUTION_COMPILER_V1.md` 与最终报告。
