---
title: THERUIZ AURA 项目近况与更新记忆
project: THERUIZ AURA
status: current-truth
date: 2026-08-30
updated: 2026-08-30
tags:
  - THERUIZ-AURA
  - Prompt-System
  - Product-Truth
  - Image2
  - Seedance2.5
  - Manual-Workflow
  - Wardrobe
  - Obsidian-Memory
source_repo: /Users/davidw/Documents/theruizonline-ui-redesign
source_branch: main
source_head: 75c604e
---

# THERUIZ AURA 项目近况与最近更新

> 用途：作为 Obsidian 中的 THERUIZ AURA 当前状态记忆，供后续 GPT / Codex Agent、产品审计和开发任务引用。
>
> 本文记录的是 2026-08-30 本地仓库与 Git 历史能够证明的状态。未接入的 Provider、未执行的真实生成和未完成的视觉验收不会被写成已完成。

## 1. 当前结论

THERUIZ AURA 当前是一个面向鞋履品牌内容生产的 React + TypeScript Prompt 编排工作台，已经同时支持：

- Image2 图片 Prompt；
- 小红书内容及其 1 / 3 / 5 / 8 张配图 Prompt；
- 非产品氛围图 1 / 3 / 5 / 8 张 Prompt；
- Seedance 2.5 10 秒和 15 秒视频脚本；
- 上传鞋履参考图、确认用途、检查覆盖并生成建议上传顺序；
- 四季场景、模特、动作、镜头、服装与 AW26 衣橱组合；
- Product Truth、品牌视觉、鞋履可见性和防变形保护。

当前真实产品状态：

```text
图片 Prompt：INTEGRATED，外部 Image2 手动执行
视频脚本：INTEGRATED，外部 Seedance 2.5 手动执行
真实 Provider API：NOT INTEGRATED
真实自动生成与结果回传：NOT INTEGRATED
真实图片/视频 E2E：NOT VERIFIED BY CODE TESTS
生产闭环：NOT READY
```

当前 Git 状态：

```text
Repository: /Users/davidw/Documents/theruizonline-ui-redesign
Branch: main
HEAD: 75c604e
Remote: origin/main = 75c604e
Latest merge: PR #36
Tracked worktree: clean
```

仓库中存在三份未跟踪用户文档，后续任务不得擅自覆盖、删除或加入提交：

- `docs/THERUIZ_AURA_OBSIDIAN_PROJECT_UPDATE_2026-08-30.md`（本文）
- `docs/THERUIZ_AURA_PROJECT_CONTEXT_FOR_GPT_AGENT.md`
- `docs/prompt-audit/REUSABLE_PROMPT_OPTIMIZATION_PLAYBOOK.md`

本文仍为本地知识文档，尚未 commit、未 push。

## 2. 当前业务流程

### 2.1 图片内容流程

```text
用户选择内容主题、季节、人物、服装、场景和图片数量
→ 上传鞋履参考图
→ 为图片确认 reference role
→ 系统检查 coverage 与 evidence binding
→ 系统编译每张图片的 Image2 Prompt
→ 系统生成建议 Reference Plan 顺序
→ 用户复制 Prompt
→ 用户在外部 Image2 手动上传参考图
→ 用户手动生成图片
→ 用户人工检查产品真实性、人体、服装、场景和系列一致性
```

### 2.2 视频脚本流程

```text
用户在 Prompt Builder、小红书内容或非产品氛围图中完成图片参数
→ 选择 10s 或 15s
→ 系统继承图片链路已经解析的场景、季节、人物、服装、品牌视觉与 Product Truth
→ 每张图片卡片编译一份独立 Seedance 2.5 视频脚本
→ 用户单独复制或批量复制脚本
→ 用户在外部 Seedance 2.5 手动上传参考图并生成视频
→ 用户人工进行动作、产品、连续性和商业可用性验收
```

视频脚本不是把最终 Image Prompt 原文后面加一段运镜，而是复用图片 Prompt 之前的确定性解析结果，再组织成独立视频导演结构。

### 2.3 当前明确不存在的链路

- 没有 Image2 API；
- 没有 Seedance API；
- 没有 Provider Adapter；
- 没有 Polling；
- 没有自动 Retry；
- 没有 OSS / 对象存储；
- 没有真实生成任务持久化；
- 没有自动 Video QC；
- 没有自动把 Reference Plan 发送给外部模型。

UI 中的正确表述是 `Manual / Draft execution`。

## 3. Product Truth 当前规则

上传图片角色只能证明：

- reference role；
- coverage；
- evidence binding；
- reference plan order。

它不能证明系统已经识别出具体材质、颜色、鞋头、鞋底或后跟结构。

完整图片证据下的状态应保持：

```ts
productTruthMode: "reference_bound"
referenceEvidenceBound: true
referencePlanReady: true
structuredFactsExtracted: false
manualExecutionReady: true
providerExecutionReady: false
productionReady: false
```

未通过真实视觉分析或用户明确确认的事实必须保持：

```ts
facts.*.value = "unknown"
```

产品材质只能使用 reference-bound 中性语言，不得因为图片被标记为 `material_reference` 就自动写出 leather、suede、mesh、canvas、knit 或 nubuck。

Reference Plan 是建议的外部上传顺序，不是已经执行的 Provider Request。`originalUploadOrder` 与 `referencePlan.order` 必须保持独立。

关键文件：

- `src/visual-system/taskReferenceBinding.ts`
- `src/visual-system/types.ts`
- `scripts/validateReferenceBinding.mjs`

## 4. 最近已合并更新

### 4.1 AW26 衣橱升级

相关提交：

- `3a7bcd3 feat(wardrobe): add THERUIZ AW26 outfit system`
- `d25050c fix(prompt): resolve AW26 combination conflicts`
- `a6eab6c Merge pull request #31`

当前结果：

- 在原 Core Basics 之外新增 AW26 Upgrade，没有替换原服装库；
- 新增 30 套稳定 outfit presets；
- 支持 preset mode 与 Core + AW26 mix mode；
- 混搭检查季节、场景、色彩、材质负载、鞋色、鞋履可见性和时装元素冲突；
- 每套最多一个明显 hero fashion element；
- 彩色鞋履出现时，服装回到中性色；
- 灵感品牌只作为内部元数据，生产 Prompt 默认不输出品牌名；
- 后续冲突修复加强了按场景选装、服装组合分散和 Prompt 规则优先级。

关键文件：

- `src/data/theruizAuraWardrobeLibrary.ts`
- `src/utils/choosePerSceneOutfitLine.ts`
- `src/utils/outfitLibraryFilters.ts`
- `scripts/validateAw26Wardrobe.mjs`

### 4.2 酒店与床边场景退役

相关合并：

- `c092e38 Merge pull request #30`
- `041a349 fix(scene): retire hotel prompt contexts`

当前结果：

- 酒店房间、床边及相关视角不再作为可选生活场景；
- 删除相关场景后检查上下文残留和关键词冲突；
- 后续场景选择不得通过 fallback 重新引入酒店、卧室或床边语义。

### 4.3 Seedance 2.5 单条视频脚本 V1

相关提交：

- `51d5e03 feat(video-script): add Seedance 2.5 manual workflow`
- `e2625ef Merge pull request #33`

当前结果：

- Prompt Builder 增加 Image / Video 输出模式；
- 支持 10 秒和 15 秒独立脚本；
- 10 秒采用独立三节奏 FilmSpec；
- 15 秒采用独立四节奏 FilmSpec，并拥有独立 Product Evidence beat；
- 脚本包含 SceneSpec、FilmSpec、Motion、Camera、Product Protection、Reference Mapping；
- 视频继承图片链路的 resolved scene、season、person、wardrobe、Brand Visual 和 reference-bound Product Truth；
- 不解析最终 Image Prompt，不把图片 Prompt 简单加运镜；
- UI 支持生成、自动同步 stale 参数和一键复制；
- 没有接入任何视频 Provider 或 API。

关键文件：

- `src/video-script/resolveVideoCreativeContext.ts`
- `src/video-script/compileSeedanceVideoScript.ts`
- `scripts/validateVideoScript.mjs`
- `src/App.tsx`

### 4.4 小红书与非产品氛围图批量视频脚本

相关提交：

- `b502479 feat(video-script): add content batch workflow`
- `db396cd Merge pull request #34`

当前结果：

- 视频脚本不再只存在于 Prompt Builder；
- 小红书内容的 1 / 3 / 5 / 8 张图片卡片可以逐卡生成对应视频脚本；
- 非产品氛围图的 1 / 3 / 5 / 8 张计划可以逐卡生成对应视频脚本；
- 支持逐条复制和批量复制；
- 每张图片与对应视频脚本共享同一组内容参数与解析语境；
- 页面明确提示尚未发送 API 请求，需要去外部 Seedance 2.5 手动执行。

新增批量编译模块：

- `src/video-script/compileSeedanceVideoScriptBatch.ts`

### 4.5 内容场景绑定与棚内动作修复

相关提交：

- `872b7af fix(video-script): bind content scenes and studio motion`
- `ceaf7f8 Merge pull request #35`

这是当前最新一次合并。

生活场景软种草与穿搭解决方案：

- 每张卡片已经选定的 curated scene 成为视频脚本的 authoritative scene；
- 视频编译阶段不再进行第二次场景 reroll；
- 去除会把脚本重新拉向其他地点的通用多地点视觉提示；
- 1 / 3 / 5 / 8 张数量均加入永久回归；
- 当前抽检表明标题、地点与动作已经正确绑定；
- 仍需通过真实 Seedance 输出观察动作节奏是否足够差异化。

棚内上新拍摄：

- 全系列只使用同一套 resolved studio wardrobe；
- 不再混入第二套服装；
- 系列数量动态使用真实 3 / 5 / 8 张，不再残留 `shots 2–8` 或 `all eight cards`；
- 棚内 Brand Visual 排除街道、咖啡店、家居、家具和生活方式道具；
- 不同棚拍角度拥有对应动作，而不是所有视频使用同一整理衣服动作；
- 每条视频限制一个主要相机运动；
- 产品证据依靠自然的重心、脚掌、脚跟、侧面和鞋底接地状态，不依靠不断推近鞋子；
- 最后至少保留 1.5 秒稳定商业定帧；
- 全身卡片保持全身或近全身，鞋履证据卡片保持腰部/大腿至地面构图；
- 已加入 3 / 5 / 8 张 × 10 / 15 秒永久回归。

### 4.6 棚内可控走动与动态上脚升级

相关提交：

- `1583616 fix(video-script): add controlled studio movement`
- `75c604e Merge pull request #36`

这是当前最新一次合并。

升级原因：

- PR #35 后的真实外部 Seedance 15 秒棚内样片已经保持了人物、服装、棚景和鞋履稳定；
- 但模特约 15 秒内基本停留在同一位置，只出现整理外套、轻微重心移动和很小的脚尖转向；
- 根因是多条 `restrained`、`small weight transfer`、`both feet grounded`、`Do not walk` 和微小旋转规则叠加，形成过度保护。

当前修复：

- 新增 `controlled` Motion level，用于需要真实走动的棚内卡片；
- 正面第一张继续保留稳定人物、服装和鞋履基准；
- 全身前侧使用斜侧两步入场后停稳；
- 全身侧面使用连续 2–3 步横向步态；
- 回身卡使用两步走动后连接一次后侧三分之四回身；
- 下半身正面卡使用一次完整落脚，明确 heel contact、weight transfer 与 forefoot roll；
- 上脚前侧卡使用一次可控侧向落步并稳定鞋底接地；
- 横向走动使用锁机，确保人物在画面中产生真实位移，而不是摄影机同步跟随后看起来仍像原地动作；
- 所有动态路径保持平行或浅斜穿过 camera plane，不允许朝近距离镜头推进；
- 继续禁止跑、跳、踢向镜头、快速旋转和超广角近脚变形；
- 动态动作结束后仍保留至少 1.5 秒稳定商业定帧。

永久回归要求：

```text
3张：至少2条不同的 controlled locomotion + 至少1条稳定基准/证据
5张：至少4条不同的 controlled locomotion + 至少1条稳定基准/证据
8张：至少5条不同的 controlled locomotion + 至少1条稳定基准/证据
10秒：保持独立三节奏
15秒：保持独立四节奏与 Product Evidence beat
```

当前状态：`IMPLEMENTED AND LOCALLY VALIDATED`。修复后的新脚本尚未再次完成外部 Seedance 视觉抽样，因此不能写成 `E2E VERIFIED`。

## 5. 当前视频脚本验收结果

### 5.1 生活场景软种草 5 张 × 10 秒

修复后的实际脚本抽检结果：

```text
场景与标题绑定：PASS
同组服装连续性：PASS
人物与 Product Truth：PASS
Reference Mapping：PASS
外部真实 Seedance 视觉效果：仍需人工测试
```

仍需观察：

- 通用生活方式 10 秒脚本的三节奏在画面中是否足够明显；
- Product Evidence 是否仍被外部模型弱化为普通走路镜头；
- 镜前场景的人脸、视线和设备关系；
- 美术馆等裁切要求与人物面部表达要求是否在真实视频中竞争。

### 5.2 棚内上新视频

修复后的实际脚本抽检结果：

```text
5 张数量继承：PASS
唯一服装继承：PASS
棚内场景纯度：PASS
独立三节奏：PASS
单镜头运动预算：PASS
鞋履证据动作：PASS
Product Truth 安全：PASS
Reference Mapping：PASS
```

PR #35 后、PR #36 前的真实15秒样片暴露出动作幅度不足：人物和鞋履稳定，但模特长期站在原位。该问题已经通过 PR #36 的 controlled locomotion 规则修复。

修复后的本地语义验证：

```text
3张动态覆盖：2条
5张动态覆盖：4条
8张动态覆盖：5条
动态路径组内去重：PASS
镜头固定距离与禁止接近：PASS
稳定基准/证据卡保留：PASS
10s / 15s FilmSpec：PASS
```

仍需通过修复后的真实 Seedance 样片验证：

- 两步入场和2–3步横移是否产生足够明显的空间位移；
- 落脚过程中鞋型、鞋带、鞋底和左右脚结构是否稳定；
- 走后回身是否保持自然，而不是被模型拆成第二套动作；
- 锁机横向走动是否保持人物完整、不触碰画面边缘；
- 动态结束后的最后1.5秒是否真正稳定。

另外仍有两个低优先级语义观察项：

1. 部分 Beat 2 会用两句话重复描述同一个脚部动作，可能让外部模型放大或重复微动作；
2. 春季 mood 中仍有 `room details` 生活化措辞，虽然被后续纯棚内硬规则覆盖，但可继续精简。

这两个观察项尚未构成代码回归或场景漂移；是否继续修改应以修复后的真实 Seedance 抽样结果为依据。

## 6. 当前图片与内容系统

### 6.1 小红书内容主题

当前重点主题包括：

- 生活场景软种草；
- 穿搭解决方案；
- 棚内上新拍摄；
- 上新活动转化。

每次生成会围绕当前主题重新选择内容主线，并保持：

- 标题；
- 正文；
- 1 / 3 / 5 / 8 张配图结构；
- 每张图片 Prompt；
- 每张图片对应视频脚本；
- 同组人物、服装、场景和产品保护规则。

生活场景软种草与穿搭解决方案仍是两个独立业务主题：前者强调真实生活触点和自然使用，后者强调穿搭问题、比例和鞋服关系。两者共享部分场景与衣橱基础，但不应合并为同一 Prompt 结构。

### 6.2 非产品氛围图

- 支持四季语义；
- 支持结构化场景 archetype 与 variant；
- 支持 1 / 3 / 5 / 8 张计划；
- 支持每张独立图片 Prompt 与对应视频脚本；
- 保持 Product Echo 与非产品图中产品占比边界；
- 代码结构和冲突审计已完成，但真实批量视觉验收仍属于外部人工工作。

### 6.3 鞋履比例保护

系统采用“构图目标不变 + 风险场景安全化”的方式，而不是把所有图片强制写死为同一个焦段：

- 普通低风险场景保留原镜头策略；
- 鞋履透视风险较高时使用更安全的焦段档位；
- 同时调整相机距离；
- 减少鞋子靠近画面边缘、过近前伸或直冲镜头；
- 同组图片保持相近焦段档位，避免系列感断裂。

这只能降低透视和动作造成的鞋履比例异常，不能代替外部模型能力或真实生成后的视觉 QC。

## 7. 当前 UI 入口

主入口：`src/App.tsx`

主要页面：

1. Founder Workbench；
2. Prompt Builder；
3. 小红书内容；
4. 视觉母体验证；
5. 非产品氛围图。

当前视频 UI：

- Prompt Builder：Image / Video 模式切换；
- 小红书内容：选择 10s / 15s，逐卡查看和复制视频脚本；
- 非产品氛围图：选择 10s / 15s，逐卡查看和复制视频脚本；
- 所有入口均应显示 Manual / Draft；
- 参数变化后重新生成，或在复制前同步最新参数，避免 stale Prompt / Script。

## 8. 验证体系

关键命令：

```bash
npm run typecheck
npm run validate:prompts
npm run validate:studio
npm run validate:engine
npm run validate:atmosphere
npm run validate:actions
npm run validate:outfits
npm run validate:production-runtime
npm run validate:reference-binding
npm run validate:video-script
npm run build
git diff --check
```

最新视频动态修复在合并前通过了：

- `npm run typecheck`；
- `npm run validate:video-script`；
- `npm run validate:prompts`；
- `npm run validate:studio`；
- `npm run validate:engine`；
- `npm run validate:actions`；
- `npm run validate:outfits`；
- `npm run validate:reference-binding`；
- `npm run validate:production-runtime`；
- `npm run validate:atmosphere`；
- `npm run build`；
- `git diff --check`。

以上证明代码、类型、构建和本地语义回归通过，不证明真实 Image2 或 Seedance 生成质量。

PR #36 的远程状态：

```text
PR: #36
Merge commit: 75c604e
Vercel: PASS
Vercel Preview Comments: PASS
main == origin/main: true
```

## 9. 当前风险与待办

### P0：生产边界

- Image2 和 Seedance 2.5 都仍为外部手动执行；
- 不得把 `manualExecutionReady` 描述为 Provider 或 production ready；
- 不得声称 Reference Plan 已自动发送；
- 不得把本地 validator PASS 写成真实视频 E2E PASS。

### P1：真实视频抽样

建议至少验证：

- 生活场景软种草：3 / 5 / 8 张各一组；
- 穿搭解决方案：3 / 5 / 8 张各一组；
- 棚内上新：10 秒和 15 秒各一组；
- 棚内上新优先抽样图2斜侧入场、图3横向步态、图4走后回身和图5完整落脚；
- 重点观察动作是否重复、空间位移是否明显、产品是否漂移、鞋履比例、脚底接地、服装连续性和最终稳定定帧。

### P2：可选语义精简

- 根据新样片决定是否还需要压缩棚内 Beat 2 中重复的脚部动作描述；
- 从纯棚内 seasonal mood 中移除 `room details`；
- 根据真实视频结果决定是否进一步强化生活场景 10 秒 Product Evidence，而不是预先增加更多规则。

### P2：知识库维护

- 本文是新的 current-truth 快照；
- 旧文档若仍保留，应标记其快照日期和 HEAD，避免旧状态覆盖本文；
- 后续每次合并视频、Product Truth 或衣橱规则后，更新本文的 HEAD、最近合并和验证范围。

## 10. 后续 Agent 必须遵守

1. 开始修改前检查 repo root、branch、HEAD 和 dirty state。
2. 不覆盖用户未跟踪文档，不使用 `git add .`、`git clean`、`git reset --hard`。
3. 图片参考角色不等于结构化产品事实。
4. Product Truth 未提取时保持 `unknown`，不得写成 `confirmed`。
5. AW26 必须扩展 Core Basics，不得建立平行衣橱或替换原选择器。
6. 视频必须继承 resolved creative context，不得通过解析最终 Image Prompt 拼装。
7. 10 秒和 15 秒是独立 FilmSpec，不得互相压缩或简单拉长。
8. 小红书和非产品氛围图的每张图片卡片必须对应自己的视频脚本。
9. 棚内主题必须保持纯棚内、同人物、同服装、同鞋履、同光线体系。
10. 未经明确授权，不 commit、不 push、不 merge、不接 API。

## 11. 关键提交索引

| Commit | 日期 | 内容 |
|---|---:|---|
| `75c604e` | 2026-08-30 | 合并棚内可控走动与动态上脚升级（PR #36） |
| `1583616` | 2026-08-30 | 新增3/5/8棚内 controlled locomotion 与永久回归 |
| `ceaf7f8` | 2026-08-30 | 合并内容场景绑定与棚内视频动作修复（PR #35） |
| `872b7af` | 2026-08-30 | 绑定内容场景并修复棚内视频语义 |
| `db396cd` | 2026-08-30 | 合并内容批量视频脚本工作流（PR #34） |
| `b502479` | 2026-08-30 | 小红书与非产品氛围图批量视频脚本 |
| `e2625ef` | 2026-08-27 | 合并 Seedance 2.5 Manual Workflow（PR #33） |
| `51d5e03` | 2026-08-27 | Seedance 2.5 单条视频脚本 V1 |
| `a6eab6c` | 2026-08-21 | 合并 AW26 Prompt 组合冲突修复（PR #31） |
| `d25050c` | 2026-08-21 | 修复 AW26 组合冲突 |
| `3a7bcd3` | 2026-08-20 | 新增 AW26 outfit system |
| `c092e38` | 2026-08-20 | 合并酒店场景退役（PR #30） |
| `d79520f` | 2026-07-30 | 合并 Uploaded Reference Product Truth Binding v1（PR #19） |

## 12. 相关文档

- `docs/THERUIZ_AURA_PROJECT_CONTEXT_FOR_GPT_AGENT.md`：2026-08-24 项目上下文快照，内容较完整但 HEAD 已过期；
- `docs/prompt-audit/REUSABLE_PROMPT_OPTIMIZATION_PLAYBOOK.md`：通用 Prompt 优化经验；
- 本文：2026-08-30 当前更新与视频脚本状态，作为较新的事实入口。
