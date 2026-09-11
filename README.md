# THERUIZ AURA Visual Prompt System

THERUIZ AURA 的品牌视觉 Prompt 与内容生成工作台。

项目目标不是做一个通用生图工具，而是把 **THERUIZ AURA 的产品真实性、品牌视觉、人物状态、穿搭、场景、镜头语言与多图内容结构** 固化成可执行、可验证、可持续迭代的系统。

> 当前项目只服务 THERUIZ AURA。与 Black Mirror / BM 无关。

## 在线入口

- Project site: https://theruizaura.vercel.app
- Repository: https://github.com/davidwang555205-prog/theruizaura

## 当前状态

更新日期：2026-09-11

当前主线已经完成：

- Founder Workbench / Prompt Builder / 小红书内容工作区
- Structured Prompt Engine，生产默认 `new` 模式
- Product Truth / Reference Plan 结构化绑定
- THERUIZ AURA 品牌视觉与真实性规则
- 8 个正式内容主题
- 生活场景软种草二级内容分类
- 长焦随拍 / Telephoto Candid
- 318 条人物动作库与多图动作多样性控制
- 5 图微表情 / gaze / head-angle Face Variation Lock
- 棚内上新人物组图
- 多套自动 validator 与 Prompt audit

最新一轮本地验证结果：

- `npm run typecheck` — PASS
- `npm run build` — PASS（仅 Vite bundle-size warning）
- `npm run validate:actions` — PASS
- `npm run validate:lifestyle-taxonomy` — PASS
- `npm run validate:lifestyle-action-face` — PASS
- `npm run validate:production-runtime` — PASS

其中 `validate:actions` 覆盖 318 个动作、72 组生成集合、384 条 Prompt 与 10,000 组 8 图压力测试；`validate:lifestyle-taxonomy` 完成 1,693 项检查；`validate:lifestyle-action-face` 完成 901 项检查。

**注意：以上代表代码、Prompt Runtime 与静态规则验证通过，不等于真实 Provider E2E 已验证。** 当没有绑定真实 Product Truth 与真实 Provider 执行时，`providerExecutionReady` / `productionReady` 保持 `false` 是预期行为。

详细状态见：[`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md)

---

## 项目定位

THERUIZ AURA 当前聚焦鞋履，尤其是德训鞋相关的品牌电商内容。系统围绕以下目标工作：

1. **商品准确**：上传参考图是当前任务 Product Truth 的事实来源，不凭空补全鞋型、材质、颜色、结构或品牌细节。
2. **品牌一致**：视觉语言保持 THERUIZ AURA 的 Quiet Warm Luxury——克制、温暖、真实、轻盈、成熟都市感。
3. **人物真实**：避免 mannequin、硬摆拍、网红凝视和 AI 式统一表情。
4. **场景可用**：内容服务真实电商、穿搭参考、小红书种草与品牌日常传播，而不是单纯做概念大片。
5. **多图不重复**：同一 3 / 5 / 8 图系列需要在动作、腿部姿态、手部任务、动作阶段、身体方向、视线与微表情上保持可见差异。

---

## 8 个正式内容主题

当前顶层 Topic 固定为 8 个：

1. `生活场景软种草`
2. `产品开发幕后`
3. `秋冬配色实验室`
4. `穿搭解决方案`
5. `材质工艺认知`
6. `品牌审美观点`
7. `上新活动转化`
8. `棚内上新拍摄`

不要把二级内容分类或拍摄方式新增成第 9 个 Topic。

---

## 生活场景软种草

### 内容分类

`生活场景软种草` 当前拆成两个正式内容分类：

- `natural_life` — **自然生活**
- `urban_commute` — **都市通勤**

场景池当前约 36 个已分类场景，覆盖玄关、咖啡馆、书店、花店、美术馆、社区、周末街区、写字楼、商务区、通勤通道等真实生活环境。

### 拍摄方式

拍摄方式是独立维度，不等同于内容分类：

- `standard` — **标准记录**
- `telephoto_candid` — **长焦随拍**

长焦随拍当前使用结构化 `telephoto-candid` camera profile：

- 约 105–180mm full-frame-equivalent
- 摄影师与人物保持真实距离
- 自然透视压缩
- 合理浅景深，而不是人工奶油虚化
- 人物以 off-camera / directional gaze 为主
- 捕捉动作中间态，而不是完成式 fashion pose
- 至少一只鞋完整可读

长焦不是第三个内容分类，而是可以作用于自然生活或都市通勤的拍摄方式。

---

## 多图动作与微表情系统

人物动作由统一 Action Library 管理，当前动作库为 **318 条**。

系统不会只通过“换一个 action id”制造伪多样性，而会综合控制：

- action semantic family
- visual leg-pose family
- leg-action signature
- hand task / hand placement
- movement phase
- body orientation
- pose type
- footwear perspective risk

生活场景还增加了结构化 `Face Variation Lock`，多图中会显式改变：

- gaze target
- head angle
- eyelid tension
- mouth state
- subtle facial response

同一人物身份、发型、妆容与整体气质保持一致，但脸部表现不应像复制粘贴。

---

## Product Truth 与 Reference Plan

产品真实性高于视觉风格。

当前任务的上传鞋履参考图是 Product Truth 的唯一产品事实来源。系统可以继承品牌视觉语言，但不能由品牌风格、场景、动作或镜头反向修改产品事实。

核心规则：

- 不推断参考图里不可见的鞋型结构
- 不凭空新增材质、颜色、Logo 或工艺
- 不让动作改变 toe box、panel、outsole、tongue、collar、laces 等已确认结构
- 至少一只鞋保持 toe-to-heel 完整可读
- ankle、裤脚、鞋口、鞋舌、鞋带、鞋底与地面保持物理分离
- Product Truth 与 Reference Plan 在 Prompt Runtime 中保持明确 provenance

---

## Structured Prompt Engine

当前生产 Prompt 使用 Structured Prompt Engine，默认模式为：

```text
new
```

`legacy` 与 `compare` 仍保留用于诊断和回滚边界，但不应该成为新功能的主要实现位置。

主要流程可以概括为：

```text
User input
→ Topic / Scene / Category / Capture Style
→ Product Truth + Reference Plan
→ Outfit / Action / Face / Camera planning
→ Prompt rules collection
→ Structured compiler
→ Provider-ready Prompt
→ Runtime diagnostics / validation
```

不要通过往 `extraRequirement` 里反复追加自由文本来绕开已有结构化字段。

---

## 棚内上新拍摄

棚内上新用于正式人物上新图组，强调：

- 同一人物
- 同一套穿搭
- 同一鞋款
- 同一棚景与灯光方向
- 不同 framing / body orientation / pose / gaze
- 鞋型、鞋底、鞋头、鞋带和上脚比例稳定

棚拍与生活场景使用同一个 Product Truth / Prompt Engine，不建立平行的第二套商品真实性系统。

---

## 本地开发

环境：Node.js + TypeScript + React + Vite + Tailwind CSS。

```bash
npm install
npm run dev
```

默认开发地址通常为：

```text
http://localhost:5173
```

构建：

```bash
npm run typecheck
npm run build
```

---

## 关键验证命令

基础：

```bash
npm run typecheck
npm run build
```

Prompt / Runtime：

```bash
npm run validate:engine
npm run validate:prompts
npm run validate:production-runtime
npm run validate:prompt-compiler
npm run validate:reference-binding
npm run validate:prompt-audit
npm run validate:consumer-trust
```

视觉内容系统：

```bash
npm run validate:actions
npm run validate:lifestyle-taxonomy
npm run validate:lifestyle-action-face
npm run validate:outfits
npm run validate:aw26-wardrobe
npm run validate:studio
npm run validate:atmosphere
```

不要通过降低 validator 门槛来让失败变绿。Validator 失败时优先修复真实规则冲突。

---

## 目录导航

```text
src/
├── data/                 场景、动作、模特、穿搭、视觉 profile
├── prompt-engine/        Structured Prompt Engine
├── utils/                selector / planner / compatibility helpers
├── visual-system/        Topic routing、Active Prompt、Product Truth binding
└── App.tsx               Founder Workbench / UI integration

scripts/                  自动验证与审计脚本
docs/
├── prompt-engine/        Prompt Engine 设计与验收
├── visual-system/        品牌视觉系统文档
├── integration/          UI / Prompt 集成记录
├── prompt-audit/         Prompt 审计
├── consumer-trust/       消费者可信度规则
├── ui-redesign/          UI 验收资料
└── PROJECT_STATUS.md     当前项目状态
```

---

## 开发边界

- 本仓库只处理 THERUIZ AURA。
- 不从 BM / Black Mirror 搬运业务逻辑。
- 不建立第二套 Action Library、Product Truth 或 Prompt Engine。
- 不把 `自然生活`、`都市通勤`、`长焦随拍`增加为新的顶层 Topic。
- Product Truth 优先级高于镜头风格和动作表现。
- 静态 validator PASS 不等于真实 Provider E2E PASS。
- 新功能应优先复用现有 structured fields 与 validators。

Codex 开发入口见：[`00_CODEX_EXECUTION.md`](00_CODEX_EXECUTION.md)

---

## 最近的重要更新

### 2026-09-10 / 09-11

- 生活场景软种草新增 `自然生活 / 都市通勤` 分类
- 新增 `长焦随拍 / telephoto_candid`
- 修复长焦 camera profile 与原有 50–70mm / shoe-safe profile 冲突
- 生活场景动作从腿部去重升级为完整视觉动作去重
- 强化 5 图与 8 图 visual leg-pose family 多样性
- 新增生活场景结构化 Face Variation Lock
- 新增 `validate:lifestyle-action-face`
- PR #49 已合并到 `main`

---

## 当前下一步

代码验证已经完成，下一阶段重点不是继续扩大动作库，而是使用**真实鞋履参考图 + 真实 Provider**做 5 图 / 8 图视觉验收：

- 动作是否在最终图片里肉眼可见地不同
- 微表情是否真实变化而非同脸复制
- 长焦随拍是否保持商品可读性
- Image Provider 是否会把不同 Prompt 再次收敛成相似姿态
- Product Truth 是否在真实生成链路中保持准确

真实视觉结果通过前，不应把静态 Runtime PASS 写成 Provider E2E VERIFIED。
