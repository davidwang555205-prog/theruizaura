# Immersive Narrative Director Script V1.2

## Status

```text
DIRECTOR SCRIPT V1.2 COMPLETE
13 / 13 Topics 生成导演脚本
内部标记泄漏            0
与 Commercial 词汇碰撞   0
执行提示词被改写          0
非确定性输出              0
TAKE 结构错配            0
时间轴断点                0
Commercial Film 代码改动  0（目录哈希已记录）
```

## 为什么加这一层

Commercial Film 的对外最终产物是**导演脚本**（`CommercialDirectorScript` +
`presentationScript`），执行提示词是另一份独立文本。沉浸叙事此前只有执行提示词。
V1.2 在既有链路上新增 presentation 层，让对外默认产物同样是导演脚本，同时把执行提示词与
内部脚本分别保留。

## 架构

```text
src/immersive-narrative/presentation/
  types.ts               ImmersiveDirectorScript / Take / Moment / Global / Presentation
  catalogs.ts            13 条标题、5 条导演概念、结构标签、boundary/continuity 措辞
  buildDirectorScript.ts buildImmersiveFinalScriptPresentation + validate...
  index.ts
```

输入：`plan`（V1.1 结构化叙事）+ `sceneResolution` + `cameraExecution` + `modelFacingScript`
输出：`{ directorScript, presentationScript, executionScriptText }`

**只读复用，不重新判定**：标题与概念来自本层 catalog；其余全部来自已批准的上游字段。
`executionScriptText` 原样透传，presentation 层不重写执行提示词。

## Moment ≠ Shot（TAKE 规则）

```text
TAKE 1                     = 开场观察状态（M1 建立）
新的 TAKE                  = 仅当 modelFacing 的 cameraTransitions.changed === true（有动机）
HELD_ENDING                = 最后一个 TAKE 在停止/锁定状态下收尾
```

导演脚本里没有 `SHOT n — WORLD/WEAR/DETAIL/HERO/RELEASE`，只有 `TAKE n — 角色` 与
`MOMENT n — ESTABLISH/TRIGGER/EVENT/RESPONSE/RESOLUTION`，并且每个 Moment 都写明
`Continuity` 与 `Ends at`（canonical completion boundary 的人话版本）。

## 导演概念（沉浸叙事专属）

```text
ONE_CONTINUOUS_OBSERVATION   全程一次固定观察
WAITING_FRAME_ENTRY          画面先等在那里，人物进入
FOLLOW_THEN_SETTLE           只在行进时跟随，人物停下镜头即停
NATURAL_PARTIAL_VIEW         自然部分可见，绝不切 insert
OBSERVED_LIFE_SLICE          等待的画面落定成一次安静的观察
```

这些名称与 Commercial Film 的 8 个商业导演概念（反射世界、光先到达等）**无重叠**，
validator 会逐条断言。

## 全局块来源

```text
GLOBAL SPATIAL ROUTE        plan.spatialEnvelope.macroLocation + anchor 链 + 场景链
GLOBAL VISUAL LOOK          lens family + camera side + AURA look line
GLOBAL SOUND                执行提示词的 GLOBAL EXECUTION RULES 中与声音相关的行
GLOBAL PRODUCT PROTECTION   执行提示词的 PRODUCT / REFERENCE RULES 段（原文摘取）
GLOBAL NEGATIVES            执行提示词的 DO NOT 段（原文摘取）
SEEDANCE EXECUTION          指向独立的执行提示词
```

即：导演脚本与执行提示词共享同一份产品/禁止条款，不存在两套漂移的规则文案。

## 与 Commercial Film 的区隔（可验证）

```text
不 import src/commercial-film/**                      validator 静态断言
不复制其常量表（标题/结构/镜头/转场）                    code review + validator
词汇黑名单：SHOT n — WORLD… / Cut … / Commercial film /
           其 8 个概念名                              命中数 0
词汇白名单：TAKE / MOMENT / Moment≠Shot / 自然声 / spatial route  必须命中
格式头：Immersive narrative · single continuous slice · N takes / 5 moments
```

字段级差异：Commercial 用 `shotIndex/shotRole/visual/product(hero)/transition(Cut…)`，
沉浸叙事用 `takeIndex/momentIndex/purpose/body/cameraState+motivation/continuity/endState`；
两者只有 `timeRange` 这一个通用字段相同。

## Validator

```text
npm run validate:narrative-director-script
scripts/validateNarrativeDirectorScript.mjs
覆盖：13/13 生成 · 必需区块 · 内部标记 0 · 商业词汇 0 · 无 SHOT 列表 ·
      时间轴连续 · TAKE 数 = 1 + 有动机镜头变化 · 执行提示词字节一致 ·
      确定性 · 无 commercial-film import · Commercial 目录哈希记录
```

## UI

```text
主区   Director Script           查看完整脚本 / 复制导演脚本 / 重新生成
次级   Seedance Execution Prompt 查看执行提示词 / 复制执行提示词
Debug  Internal Compiler Script  只读 + 复制 Internal Script
```

三者互不 fallback：执行编译非 `EXECUTABLE` 时，导演脚本与执行提示词一并 fail-closed 并显示原因。

## Not changed

```text
Commercial Film 全部代码与内容 · Narrative/Scene/Physical Action/Camera 语义 ·
V1.1 execution script 文本（字节一致）· Existing 318 Actions · Evidence Guard ·
Scene Library · legacy Lifestyle
```
