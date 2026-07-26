# THERUIZ AURA 提示词系统基线审计

> 审计日期: 2026-07-26
> 基线 commit: e93f83b

## 1. 调用链

```
generateTeamPrompt(params)
  └─ teamPromptCore.ts: ~2400 行巨型函数
       ├─ resolveTeamScenePreference()
       ├─ resolveSceneKey()
       ├─ getPhotoRealityMode()
       ├─ getEffectiveLightingSpaceType()
       ├─ chooseSeasonCityVisualContext()
       ├─ chooseCameraLookLine()
       ├─ buildPlaceLine()
       ├─ chooseSneakerProtectionLines()
       ├─ chooseGazeLine()
       ├─ chooseActionLine()
       ├─ chooseOutfitByGarmentType()
       ├─ chooseHumanRealismLines()
       ├─ chooseHumanPresenceLines()
       ├─ chooseHandheldObjectLines()
       ├─ chooseSceneAccessoryLine()
       ├─ chooseSinglePrimaryHandheldObject()
       ├─ buildStructuredPrompt()
       ├─ applyPromptPriorityEngine()
       ├─ controlPromptBudget()
       ├─ cleanFinalPrompt()
       └─ finalPromptSafetyCheck()

generateSoftSeedingContent(input)
  └─ generateSoftSeedingContent.ts: ~3600 行
       ├─ 8个主题各含独立文案生成逻辑
       ├─ 调用 generateTeamPrompt() 为每张卡片生成 Prompt
       ├─ 在 generateTeamPrompt 返回后再追加：
       │   ├─ lifestyleContinuityLine
       │   ├─ lifestyleExpressionBeats
       │   ├─ stylingSolutionExpressionBeats
       │   └─ Action lock directive
       └─ 不经过统一 budget
```

## 2. 修改 Prompt 的阶段

| 阶段 | 函数 | 在何处追加 | 有无预算控制 |
|---|---|---|---|
| 1 | chooseSneakerProtectionLines | teamPromptCore 内部 | 无（硬约束） |
| 2 | chooseGazeLine | teamPromptCore 内部 | 无 |
| 3 | chooseActionLine | teamPromptCore 内部 | 无 |
| 4 | chooseOutfitByGarmentType | teamPromptCore 内部 | 无 |
| 5 | chooseHumanRealismLines | teamPromptCore 内部 | 无 |
| 6 | buildStructuredPrompt | teamPromptCore 内部 | 无 |
| 7 | applyPromptPriorityEngine | teamPromptCore 内部 | 有限（仅排序） |
| 8 | controlPromptBudget | teamPromptCore 最后 | 是（总词数） |
| 9 | promptPreflightCheck | generatePrompt.ts | 否 |
| 10 | finalPromptSafetyCheck | generatePrompt.ts | 否 |
| 11 | 软种草 continuity lines | generateSoftSeedingContent | **无 — 绕过 budget** |
| 12 | 软种草 expression beats | generateSoftSeedingContent | **无 — 绕过 budget** |

## 3. 重复规则写入

以下规则被多个模块同时写入：

| 规则 | 写入模块 | 次数 |
|---|---|---|
| "gaze must vary" | modelGaze.ts + promptBlocksCore.ts + promptBlocksCompact.ts + multiImageExpressionSequenceLines + lifestyleExpressionBeats | 5+ |
| "keep both sneakers visible" | chooseSneakerProtectionLines + actionPoseProfiles + sceneBlocks | 3 |
| "avoid CGI/fake" | promptPatches + studioPresets + sceneLighting | 3 |
| 面部光影 | humanRealismProfiles + multiImageExpressionSequenceLines | 2 |

## 4. 依赖文本正则的关键逻辑

| 位置 | 正则用途 |
|---|---|
| modelGaze.ts | 检测 "look at camera" 关键词 |
| outfitLibraryFilters.ts | 检测 "不要自动搭配" 等中文 |
| detectImageCountOrSeriesIntent.ts | 检测 "same model/same woman" |
| promptAIRiskPreflight.ts | 检测品牌名 |
| chooseOutfitByGarmentType.ts | 检测 "黑色背心/白裙" 等 |
| chooseSinglePrimaryHandheldObject.ts | 检测手持物关键词 |

## 5. 构图角度覆盖问题

| 冲突源 | 当前行为 |
|---|---|
| 用户手动角度 vs 系列镜头索引 | 手动角度保留在 actionLine，系列镜头索引写入 placeLine → 同时存在 |
| 棚拍背景预设 vs 旧 studioLaunchLines | 已删除旧数组，但 preset 和 sceneLighting 仍可能重叠 |
| 下半身构图 vs 完整脸部规则 | faceLighting 和 expressionBeats 不区分构图，全量注入 |

## 6. 软种草绕开统一管道

软种草 8 个主题在 `buildImagePlan` 中拼接 `extraRequirement`：
- draft.extraRequirement + studioShotControlLine + themeGuide + variantVisualCue + copyVisualAlignmentCue + stylingSolutionContinuityLine + studioContinuityLine
- 另加 lifestyleContinuityLine + expressionBeats + actionLock

这些通过 `generateTeamPrompt` 的 `extraRequirement` 字段注入，但不经过 `controlPromptBudget` 的分段预算分配。

## 7. 测试覆盖

| 测试 | 覆盖范围 | 缺失 |
|---|---|---|
| validate:prompts | 27 samples / 9 scenarios | 不覆盖软种草 |
| validate:actions | 300 actions / 10000 stress | 仅动作多样性 |
| validate:outfits | 5000 四季去重 | 仅穿搭 |
| validate:studio | 178 checks | 仅棚拍预设和服装 |
| typecheck | 全量类型 | — |
| build | 生产构建 | — |

## 8. 预计迁移文件

### 新增
- `src/prompt-engine/contracts.ts`
- `src/prompt-engine/resolvePromptProfile.ts`
- `src/prompt-engine/collectPromptRules.ts`
- `src/prompt-engine/resolvePromptConflicts.ts`
- `src/prompt-engine/rankPromptRules.ts`
- `src/prompt-engine/allocatePromptBudget.ts`
- `src/prompt-engine/compressPromptSections.ts`
- `src/prompt-engine/compilePrompt.ts`
- `src/prompt-engine/validateCompiledPrompt.ts`
- `src/prompt-engine/promptFeatureFlags.ts`
- `src/prompt-engine/diagnostics.ts`
- `src/prompt-engine/profiles/*.ts`
- `src/prompt-engine/rules/*.ts`
- `src/prompt-engine/adapters/legacyTeamPromptAdapter.ts`

### 修改
- `src/utils/teamPromptCore.ts` — 主要拆分目标
- `src/utils/generateSoftSeedingContent.ts` — 软种草迁移
- `src/utils/generatePrompt.ts` — 入口适配

### 后续清理
- `src/data/promptBlocksCore.ts` — 重复规则源
- `src/data/promptBlocksCompact.ts` — 重复规则源
