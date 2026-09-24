# Model-Facing Execution Compiler V1.1

## Status

```text
INTERNAL SCRIPT        PRESERVED
MODEL-FACING SCRIPT    IMPLEMENTED
13 Topics Executable   13 / 13
Internal IDs            0
CORRECT_UNSUPPORTED     0
Timeline Holes          0
Reference=0 Product Facts 0
```

`src/immersive-narrative/execution-compiler/` 是 canonical pipeline 之后的**下游翻译与防冲突层**，
不替换内部表示，也不重新解释 Narrative / Scene / Spatial。

## Two outputs

```text
A. INTERNAL COMPILED SCRIPT   seedance-compiler/compiler.ts → ImmersiveSeedanceScript
                              Debug / Audit / QC；UI → Debug / Internal → Internal Compiler Script
B. MODEL-FACING EXECUTION SCRIPT  execution-compiler/compiler.ts → ModelFacingExecutionScript
                              UI 预览 / 查看完整脚本 / 复制完整脚本
```

## Canonical consumption (no duplicate schema)

```text
completionBoundary  直接读 NarrativeMoment.completionBoundary（planner 派生一次）
goalProgress        直接读 NarrativeMoment.goalProgress
localGoal / goalState / spatialEnvelope  直接读 NarrativePlan
spatialAnchor / transitionFromPrevious / spatialContinuityStatus
                    直接读 SceneResolverOutput.resolvedMoments
```

Execution vocabulary 与 canonical boundary 之间只有一张显式映射表
（`CANONICAL_TO_EXECUTION`），执行层不再从文本重新判定边界。

## ExecutionMomentContract

```text
momentIndex · timeRange · narrativeEvent · startState · allowedProgress ·
endState · objectStateBefore · objectStateAfter · forbiddenCompletions ·
requiredProgressEvidence · narrativeEvidence · spatialAnchor · executionStatus
```

## Safe continuation

内部 `CORRECT_UNSUPPORTED` 不上屏。执行层只允许在 Narrative 自身已描述当前行为、
且行为是既有状态的延续或 Narrative 完整描述的简单状态变化时，生成
`SAFE_CONTINUATION`（保留对象、手部任务、因果状态，复用上一 Moment 的相机与声音）。
否则 fail-closed。

## Sound evidence gate

每条 model-facing 声音必须能追溯到当前 Moment 的 Narrative 事件或允许的身体行为。
拒绝项只记录在 diagnostics（sourceSound / kept / rejected / reason），**不进入最终 Prompt**。

```text
下班回家 M3 “door handle movement” → REJECTED（该 Moment 无 door interaction）
周末独处 M2 “cup settling on the counter” → REJECTED（cup 未在 Narrative 中出现）
逛书店 M1 “single page movement” → REJECTED（该 Moment 无翻页行为）
咖啡馆 M1 进门 = entry event → door sound 允许
```

## Camera state persistence

`Moment ≠ Shot`：M1 建立 `ModelFacingCameraState`（position / side / height / lens /
workingDistance / framingState / movementState），后续默认继承。
只有 Narrative 或 Physical Action 提供动机时才更新（subject travels → follow；
subject settles → stop/hold；waiting frame 后主体入场并停下 → 观察落定）。
`PARTIAL_OBSERVATION` 一律继承并解释为“自然部分可见”，不生成 insert / close-up /
cutaway；`forcedInsertShots = 0`。

## Product / reference safety

```text
内部 ABSENT / INCIDENTAL / READABLE / HERO 不变
model-facing  ABSENT / VISIBLE_IF_NATURALLY_FRAMED / READABLE_REQUIRED
READABLE_REQUIRED 只在该帧本来就稳定容纳全身时保留，否则降级并记录 audit
confirmedReferences = 0  → 不输出任何具体颜色/材质/鞋头/外底/logo/结构事实
confirmedReferences > 0  → 才允许 confirmed Product Truth
```

## Fail-closed statuses

```text
EXECUTABLE
NOT_EXECUTABLE_SPATIAL_DISCONTINUITY
NOT_EXECUTABLE_INCOMPLETE_NARRATIVE
NOT_EXECUTABLE_UNSAFE_CONTINUATION
```

UI 在非 EXECUTABLE 时禁用正式 Copy 并显示具体原因，不 fallback 到内部脚本。

## Output format

```text
SEEDANCE — IMMERSIVE NARRATIVE EXECUTION SCRIPT
[INTENT] [CHARACTER] [WORLD & CONTINUITY] [CAMERA STATE] [TIMELINE]
  0.0-x.xs — MOMENT n · TITLE
  WHAT HAPPENS / BODY / CAMERA / SOUND /（需要时）PRODUCT
[GLOBAL EXECUTION RULES] [PRODUCT / REFERENCE RULES] [DO NOT] [ENDING STATE]
```

不输出 QC、ID、enum、eligibility 或 unsupported 语言；15 秒时间轴连续覆盖 0.0–15.0。

## Production regressions

```text
下班回家  M2 不提前取钥 · M3 safe continuation 且无门把手声 · M4 取钥+开门
午后咖啡  M2/M3 不提前取卡 · M4 取卡 · 无强制 insert shot
采购归来  无超市→家 · 目标完成
短途出行  单一连续到达切片 · 无 nearly complete · 无视觉重置
广场书店  window → threshold → interior 连续
```

## Validator

```text
npm run validate:narrative-execution-compiler
scripts/validateNarrativeExecutionCompiler.mjs
fixtures：home-no-early-key-retrieval, home-safe-continuation, home-no-door-sound-m3,
cafe-no-early-card-retrieval, cafe-no-forced-insert, spatial-fail-closed,
closure-fail-closed, unsafe-continuation-fail-closed, reference-zero-safe,
reference-confirmed-keeps-truth, no-internal-marker, full-timeline, deterministic-output
result 13 / 13 executable · markers 0 · timeline holes 0 · product facts 0
```

## UI binding

```text
Preview / 查看完整脚本 / 复制完整脚本  → executionScript.compiledText（单一数据源）
Debug / Internal → Internal Compiler Script（只读查看 + 复制 Internal Script）
```
