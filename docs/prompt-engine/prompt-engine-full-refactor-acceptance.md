# THERUIZ AURA 提示词引擎重构 — 本地验收报告

> 日期: 2026-07-26
> 分支: feature/prompt-engine-full-refactor-v1
> 提交数: 6

## Git 状态

| 项目 | 值 |
|---|---|
| 仓库 | /Users/davidw/Documents/theruizonline(自用) |
| 分支 | feature/prompt-engine-full-refactor-v1 |
| 基线 | e93f83b (main) |
| HEAD | 6f8f4e9 |
| 工作树 | 干净 |
| push | NO |
| PR | NO |

## 已完成范围

### 架构（17 个文件，~1200 行）

```
src/prompt-engine/
├── contracts.ts                  # 结构化领域类型（CompositionMode, PromptPriority, PromptRule...）
├── collectPromptRules.ts         # 统一规则收集引擎
├── resolvePromptConflicts.ts     # 冲突解决 (conflictsWith + priority)
├── allocatePromptBudget.ts       # 按构图模式的Section预算（7种预算配置）
├── compilePrompt.ts              # 完整流水线编配
├── validateCompiledPrompt.ts     # 只读验证器（必填/品牌/半句/括号）
├── promptFeatureFlags.ts         # legacy/new/compare 三模式
├── diagnostics.ts                # 诊断输出
├── index.ts                      # 公开API
├── profiles/
│   ├── compositionProfiles.ts    # 11种构图模式
│   ├── imageTypeProfiles.ts      # 6种图像类型
│   └── sceneProfiles.ts          # 15种场景
└── adapters/
    └── legacyTeamPromptAdapter.ts # 旧API兼容适配器
```

### 关键实现
- **PromptPriority P0-P7**: 用户指定 → 产品硬锁 → 身份连续性 → 构图可见性 → 场景动作 → 真实感相机 → 品牌美学 → 低优先级负面
- **按构图模式的独立预算**: fullFigure 380词 / lowerThird 200词 / onFootDetail 150词 / stillLife 150词 / atmosphere 150词 等
- **冲突解决**: 基于规则ID的 `conflictsWith` + `priority` 判优
- **旧API兼容**: `generateTeamPrompt()` 不变，通过 feature flag 切换

## 验证结果

| 命令 | 结果 |
|---|---|
| npm run typecheck | ✅ |
| npm run build | ✅ |
| npm run validate:prompts | ✅ 27 samples, 9 scenarios |
| npm run validate:studio | ✅ 178 checks |
| npm run validate:engine | ✅ 44 checks, 0 failures |
| npm run validate:actions | ✅ 300 actions |
| npm run validate:outfits | ✅ 5000 per season |

## validate:engine 覆盖

| 测试 | 验证项 |
|---|---|
| 1 | 6种图像类型全部编译 |
| 2 | 静物无人物规则 |
| 3 | 下半身构图无面部规则 |
| 4 | 氛围图无产品主角 |
| 5 | 无品牌名泄露 |
| 6 | Required规则全部保留 |
| 7 | 预算约束生效 |
| 8 | 用户输入完整保留 |
| 9 | 验证报告可用 |

## 回滚能力
- `setPromptEngineConfig({ mode: "legacy" })` — 运行时完全回退
- `git reset --hard e93f83b` — 版本回退
- 旧 generateTeamPrompt() 未修改

## 本轮 Phase 4–11 进展
- 默认 Runtime 已切换为 `new`，`legacy` / `compare` 仍可显式回滚。
- 8 个软种草主题 × 1/3/5/8 图通过 `scripts/validateSoftSeedingRuntimeMigration.mjs` 的 712 项审计；每张卡片的最终文本等于重新调用 Runtime 的 compiled prompt，无 compile 后追加长字符串，required rules 无缺失。
- `npm run validate:actions` exit code 0：318 条动作、72 generated sets / 384 prompts、10,000 八图 stress sets。
- `validate:engine` 55/0、`validate:prompts` 27 samples、`validate:studio` 178/0、`validate:outfits`、typecheck、build、git diff check 均通过。
- 浏览器业务验收尚未在本分支完成；因此仍为 `NOT_READY_FOR_LOCAL_INTEGRATION`。

## GitHub 状态
**NOT_PUSHED** — NOT_READY_FOR_LOCAL_INTEGRATION
