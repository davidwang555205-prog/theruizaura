# CODEX 执行入口｜THERUIZ AURA Current Main

更新日期：2026-09-11

本文件是 Codex 进入 THERUIZ AURA 仓库后的当前执行基线。

## 0. 项目范围

只处理：

```text
THERUIZ AURA
https://github.com/davidwang555205-prog/theruizaura
```

禁止：

- 修改 Black Mirror / BM 项目；
- 把 BM 的 Topic、Prompt、路由或 Product Truth 逻辑迁入本仓库；
- 新建平行 Prompt Engine；
- 新建平行 Action Library；
- 新建平行 Product Truth 系统；
- 为了让测试通过而降低 validator 门槛。

---

## 1. 开始任务前先读

按以下顺序：

1. `README.md`
2. `docs/PROJECT_STATUS.md`
3. `package.json`
4. 与任务直接相关的源码和 validator
5. `git status`
6. 当前 `main` 最新提交

不要根据旧对话或旧 Phase 文档假设当前代码状态。

---

## 2. 当前架构事实

### Prompt Engine

生产默认：

```text
mode = "new"
```

Structured Prompt Engine 是正式 Prompt 组装入口。

`legacy` / `compare` 只用于诊断、回滚与兼容边界，不要把新功能只写进 legacy generator。

### 顶层 Topic

当前固定 8 个：

1. 生活场景软种草
2. 产品开发幕后
3. 秋冬配色实验室
4. 穿搭解决方案
5. 材质工艺认知
6. 品牌审美观点
7. 上新活动转化
8. 棚内上新拍摄

不要新增第 9 个 Topic，除非品牌方明确批准顶层信息架构变更。

### 生活场景软种草

内容分类：

```text
natural_life   = 自然生活
urban_commute  = 都市通勤
```

拍摄方式：

```text
standard           = 标准记录
telephoto_candid   = 长焦随拍
```

内容分类与拍摄方式是两个独立维度。

`telephoto_candid` 不是第三个内容分类。

### Action Library

唯一动作源：

```text
src/data/personActionLibrary.ts
```

当前期望数量：318。

生活场景多图必须兼顾：

- action semantic family
- visual leg-pose family
- leg-action signature
- hand task
- movement phase
- body orientation
- pose type

不要通过复制 action 文本制造假的多样性。

### Face Variation

生活场景 5 图 / 多图已接入 structured `seriesFaceVariation`。

必须保持同一人物身份，同时显式改变：

- gaze target
- head angle
- eyelid tension
- mouth state
- subtle facial response

不要重新退回普通 `extraRequirement` 文本作为唯一脸部差异控制。

### Product Truth

当前任务上传参考图是产品事实来源。

品牌视觉、场景、动作、服装、镜头都不能改写 Product Truth。

不得推断：

- 不可见鞋型结构
- 未确认材质
- 未确认颜色
- 未确认品牌细节
- 未确认工艺

Product Truth 与 Reference Plan 必须保留 provenance。

### Camera

`telephoto_candid` 使用独立 camera profile。

长焦任务不得同时输出：

- telephoto-candid
- stabilized 50–70mm
- shoe-safe 60–85mm

必须只有一个 authoritative camera perspective profile。

---

## 3. 修改原则

优先顺序：

```text
Product Truth
>
用户明确选择
>
结构化 Topic / Category / Capture Style / Action / Face fields
>
品牌视觉与真实性规则
>
普通 extraRequirement
>
低优先级 negative
```

遇到冲突时：

1. 找到 authoritative source；
2. 删除或中和重复控制；
3. 不要继续追加另一句 Prompt 盖住旧句；
4. 增加 validator 防止回归。

---

## 4. 生活场景相关开发要求

如果任务涉及 `生活场景软种草`：

- 保留现有 `family`，它仍用于场景 diversity；
- `natural_life / urban_commute` 是独立 content category；
- `standard / telephoto_candid` 是 capture style；
- 场景只负责“在哪里发生”；
- Action Planner 负责“人物主要在做什么”；
- Face Variation 负责“脸和视线怎么变化”；
- Camera Profile 负责“怎么拍”；
- 不要让 scene extraRequirement 重复定义主要动作。

如果 5 图看起来仍重复，优先排查：

```text
selector output
→ action family
→ visual leg-pose family
→ hand task
→ movement phase
→ face variation
→ final compiled Prompt
→ Provider visual convergence
```

不要第一反应扩充动作库数量。

---

## 5. 开发后最低验证

任何影响 Prompt Runtime、生活场景、动作、微表情、Product Truth 或 Camera 的修改，至少运行：

```bash
npm run typecheck
npm run build
npm run validate:actions
npm run validate:lifestyle-taxonomy
npm run validate:lifestyle-action-face
npm run validate:production-runtime
```

涉及 Prompt Engine 时补：

```bash
npm run validate:engine
npm run validate:prompt-compiler
npm run validate:reference-binding
npm run validate:prompt-audit
npm run validate:consumer-trust
```

涉及穿搭 / 棚拍时补：

```bash
npm run validate:outfits
npm run validate:aw26-wardrobe
npm run validate:studio
```

涉及非产品氛围时补：

```bash
npm run validate:atmosphere
```

失败即停止，不要跳过失败继续宣布 PASS。

---

## 6. 当前已验证基线

基于 2026-09-11 最新一轮本地验证：

```text
npm run typecheck                      PASS
npm run build                          PASS
npm run validate:actions               PASS
npm run validate:lifestyle-taxonomy    PASS
npm run validate:lifestyle-action-face PASS
npm run validate:production-runtime    PASS
```

覆盖：

- 318 个动作
- 72 组 action generation sets
- 384 条 Prompt
- 10,000 组 8 图 action stress test
- 1,693 项 lifestyle taxonomy checks
- 901 项 lifestyle action / face checks

这是代码 / Prompt / Runtime 验证基线。

---

## 7. Provider E2E 边界

必须明确区分：

```text
CODE VALIDATION = PASS
PROMPT / RUNTIME VALIDATION = PASS
REAL PROVIDER E2E = NOT PROVEN BY STATIC VALIDATORS
```

当 validator fixture 没有绑定真实 Product Truth 与真实 Provider 时：

```text
providerExecutionReady: false
productionReady: false
```

是正确状态。

不得把静态 validator PASS 写成：

```text
PROVIDER E2E VERIFIED
REAL IMAGE QUALITY VERIFIED
PRODUCTION IMAGE OUTPUT VERIFIED
```

下一阶段需要真实鞋款参考图与真实 Provider 输出做视觉验收。

---

## 8. Git 工作流

推荐：

1. 从最新 `main` 创建任务分支；
2. 做最小范围修改；
3. 运行与任务匹配的 validator；
4. 输出 diff / validation result；
5. 建 PR；
6. 没有明确批准时不要自动 merge。

文档-only 修改可以简化验证，但必须确认引用的架构事实来自当前代码。

---

## 9. 最终汇报格式

开发任务完成后输出：

### A. Root Cause / Goal

说明为什么改。

### B. Files Changed

列出实际修改文件。

### C. Architecture Decision

说明 authoritative source 放在哪里，避免平行系统。

### D. Validation

逐条列出 PASS / FAIL / NOT RUN。

### E. Known Gaps

尤其说明真实 Provider E2E 是否执行。

### F. Git Status

- branch
- commit
- PR
- merged / not merged

---

## 10. 当前下一步

代码层动作与微表情多样性已经验证通过。

下一阶段优先事项：

> 使用真实 THERUIZ AURA 鞋履参考图，分别测试自然生活 / 都市通勤 × 标准记录 / 长焦随拍的 5 图与 8 图真实 Provider 输出，并做视觉验收。

重点看：

- 动作是否肉眼不同
- 微表情是否真实不同
- 鞋型是否稳定
- 长焦是否保持鞋履可读性
- Provider 是否把不同 Prompt 收敛成相似画面

真实视觉验收完成前，不继续通过堆 Prompt 限制词解决模型层问题。
