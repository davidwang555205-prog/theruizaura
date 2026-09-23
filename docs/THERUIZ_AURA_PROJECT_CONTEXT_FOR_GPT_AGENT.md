# THERUIZ AURA 项目全量上下文与业务流程

> 用途：将本文件提供给新的 GPT / Codex Agent，使其在开始工作前理解 THERUIZ AURA 当前产品定义、真实实现状态、业务链路、关键约束、验证边界与已知风险。
>
> 快照日期：2026-08-24（Asia/Shanghai）  
> 仓库：`/Users/davidw/Documents/theruizonline-ui-redesign`  
> GitHub：`https://github.com/davidwang555205-prog/theruizaura`  
> 当前分支：`main`  
> 当前 HEAD：`a6eab6c46b28062358048b015940ae3543552211`  
> 当前状态：`main` 与 `origin/main` 同步；存在一份未跟踪用户文档 `docs/prompt-audit/REUSABLE_PROMPT_OPTIMIZATION_PLAYBOOK.md`，不得擅自覆盖、删除或加入提交。

---

## 1. 一句话定义

THERUIZ AURA 是一个面向鞋履品牌内容生产的本地 React Prompt 编排工作台。

它负责：

- 接收用户选择和当前任务上传的鞋履参考图；
- 生成结构化、可复制的 Image2 Prompt；
- 规划 3 / 5 / 8 张系列内容；
- 维护品牌视觉、人物、场景、四季、穿搭、动作、镜头和产品保护规则；
- 为外部 Image2 手动执行提供参考图用途、覆盖状态和建议上传顺序。

它当前不负责：

- 调用真实 Image2 API；
- 自动把图片发送给 Provider；
- 保存生产任务、生成结果或 Provider Request；
- 自动识别鞋履的具体材质、颜色、鞋头、鞋底或后跟结构；
- 自动完成真实图片 QC；
- 声称已经形成 production-ready API 闭环。

当前真实执行方式：

```text
用户在 THERUIZ AURA 选择参数并上传参考图
→ 用户为图片确认参考用途
→ 系统编译 Prompt 和建议 Reference Plan
→ 用户复制 Prompt
→ 用户在外部 Image2 手动上传参考图
→ 用户手动生成图片
→ 用户人工检查产品、人物、服装和视觉质量
```

因此，当前产品应被描述为：

```text
Manual / Draft execution
INTEGRATED BUT NOT PROVIDER E2E VERIFIED
```

---

## 2. 产品真相与最高优先级规则

### 2.1 Product Truth authoritative source

当前任务中由用户上传并确认用途的鞋履图片，是唯一产品真相来源。

以下内容不能定义当前产品事实：

- 品牌视觉母体图；
- A1–C5 视觉锚点；
- 历史商品图；
- 鞋款名称；
- Prompt 中的习惯性材质词；
- 图片角色标签本身；
- 模型推断；
- fallback；
- AW26 服装灵感来源。

参考图角色只能证明：

- reference role；
- evidence coverage；
- evidence binding；
- reference plan order。

参考图角色不能证明系统已经识别出：

- 具体材质；
- 具体颜色；
- 具体鞋头形状；
- 具体鞋底结构；
- 具体后跟结构。

### 2.2 当前 Product Truth 状态语义

完整参考证据并确认用途后：

```ts
productTruthMode: "reference_bound"
referenceEvidenceBound: true
referencePlanReady: true
structuredFactsExtracted: false
manualExecutionReady: true
providerExecutionReady: false
productionReady: false
```

字段含义：

| 字段 | 当前语义 |
|---|---|
| `productTruthMode` | 当前使用参考图绑定模式，不是结构化视觉识别模式 |
| `referenceEvidenceBound` | 图片角色、覆盖范围与证据关系已确认 |
| `referencePlanReady` | 已生成建议的外部 Image2 上传顺序 |
| `structuredFactsExtracted` | 始终为 `false`；当前没有真实视觉分析模型 |
| `manualExecutionReady` | 用户可以复制 Prompt 并在外部 Image2 手动上传图片 |
| `providerExecutionReady` | 始终为 `false`；没有 Provider API |
| `productionReady` | 始终为 `false`；Reference Plan 完整不等于生产闭环完成 |

未提取的结构化事实必须保持：

```ts
facts.*.value = "unknown"
```

不得使用 `facts.* = "confirmed"` 表示已识别具体事实。

核心实现：

- `src/visual-system/taskReferenceBinding.ts`
- `src/visual-system/types.ts`
- `scripts/validateReferenceBinding.mjs`

### 2.3 C4 材质语言

当 `productTruthMode === "reference_bound"` 且没有真实结构化事实时，产品材质细节只能使用中性表达，例如：

> Preserve the exact material zones, surface finish, texture transitions, stitching relationships, and construction details shown in the confirmed material references.

不得由图片角色自动写出：

- leather
- suede
- mesh
- canvas
- knit
- nubuck

具体材质名称只有在以下来源成立时才允许进入产品事实：

- 真实视觉分析；
- 用户明确确认；
- 可信结构化 Product Truth。

服装材质不等于鞋履产品材质。AW26 衣橱中的 cashmere、wool、suede 等是服装数据，允许用于服装 Prompt，但不能反向写入鞋履 Product Truth。

---

## 3. 当前技术形态

### 3.1 技术栈

- React 19
- TypeScript 5.9
- Vite 7
- Tailwind CSS 3
- 本地浏览器状态
- Node `.mjs` 验证脚本
- Playwright 依赖已安装，但当前主要回归由项目脚本完成

常用命令：

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

本地地址：

```text
http://localhost:5173
```

### 3.2 当前不存在的基础设施

- 无真实 Provider SDK；
- 无 API key 存储；
- 无后端服务；
- 无数据库；
- 无任务队列；
- 无对象存储；
- 无真实生成结果持久化；
- 无自动重试和 Provider 超时链路；
- 无真实计费；
- 无生产账号体系。

`src/generation/localGenerationService.ts` 只是本地 placeholder。它返回 `idle` job、空 assets，并明确不联系 Provider。

---

## 4. 前端页面与用户入口

主入口：`src/App.tsx`

当前页面包括：

1. Founder Workbench / 工作台
2. Prompt Builder
3. 小红书内容
4. 视觉母体验证工作台
5. 非产品氛围图

### 4.1 Prompt Builder

主要用户字段：

- 图片类型；
- 模特选择；
- 人物连续性；
- 鞋款；
- 季节；
- 场景偏好；
- 服装类型；
- 棚拍背景、服装和角度；
- 静物风格；
- 补充要求；
- 参考图上传与角色确认。

主要图片类型：

- 产品上脚图；
- 对镜穿搭图；
- 生活场景图；
- 非产品氛围图；
- 拍摄花絮 / 材质图；
- 产品静物图。

页面行为：

- 参数变化后标记 Prompt 需要更新；
- 上传、删除或更改参考图角色后自动重新绑定 Prompt；
- Copy 前再次检查 fingerprint；
- 如果 Prompt 已 stale，复制时重新编译最新 Prompt；
- 页面明确提示尚未发送 Provider Request。

### 4.2 参考图工作流

用户最多上传 9 张本地图片。

每张图片初始状态为 `unclassified`，必须由用户轻量确认用途，例如：

- primary product reference；
- outer / inner side reference；
- top / toe / heel / outsole reference；
- material / color / construction detail reference；
- on-foot reference。

系统分别保存：

- `originalUploadOrder`：用户原始上传顺序；
- `referencePlan.order`：外部 Image2 建议上传顺序。

角色调整不会改写原始上传顺序。`unclassified` 图片不会进入 confirmed plan。

### 4.3 小红书内容模块

支持 8 个主题：

1. 生活场景软种草
2. 产品开发幕后
3. 秋冬配色实验室
4. 穿搭解决方案
5. 材质工艺认知
6. 品牌审美观点
7. 上新活动转化
8. 棚内上新拍摄

支持每组：

- 3 张；
- 5 张；
- 8 张。

输出内容：

- 标题候选；
- 正文；
- 标签；
- 每张图的用途和描述；
- 每张独立 Image2 Prompt；
- 全组 Prompt 复制；
- 单张 Prompt 复制；
- `outfitRotationId`。

系列规则：

- 同组保持同一人物；
- 同组保持同一主要穿搭；
- 同组保持同一鞋履产品和品牌方向；
- 通过场景、动作、表情、视线、机位和构图形成差异；
- 3 / 5 / 8 张不能只是重复相同句子；
- 人物动作通过候选池随机抽取并进行组内去重；
- Copy 使用当前生成结果，不应复制 stale Prompt。

内容变体：

- 大多数主题配置 200 个内容变体；
- 生活场景软种草配置 1000 个变体；
- 每日 slot 支持 1 / 2；
- 轮换由日期、主题、variant offset 和 generation nonce 共同决定。

核心实现：

- `src/utils/generateSoftSeedingContent.ts`
- `src/utils/selectDiverseSeriesActions.ts`
- `src/visual-system/topicRoutingRegistry.ts`
- `src/visual-system/routedPromptCompiler.ts`

### 4.4 非产品氛围图

产品定义：环境和生活痕迹主导，鞋履可以缺席、陪衬或以生活痕迹出现，但不得成为电商展示主体。

用户可设置：

- 数量：3 / 5 / 8；
- 季节：春 / 夏 / 秋 / 冬；
- 画幅比例；
- API 预留参考图。

系统自动控制：

- scene archetype；
- scene variant；
- 四季语义；
- 时间与光线；
- 空间关系；
- 生活痕迹；
- Product Presence；
- Product Palette Echo；
- 构图指纹；
- Prompt-level season / product dominance QA。

重要边界：

- 当前复制 Prompt 不读取 API 预留参考图内容；
- 无人物、无穿搭、无上脚；
- Product Echo 不能控制全局季节、光线、场景或衣物厚度；
- 酒店房间、床边和床景路径已经从生产场景中删除；
- 未知或季节冲突场景回退到 `MATERIAL_LIGHT_SPACE`。

当前结构：

- 13 个 scene archetypes；
- 37 个 structured variants；
- 31 个 legacy scene labels 已映射；
- 四季矩阵 52 项；
- Product Presence 矩阵 39 项。

核心实现：

- `src/non-product-atmosphere/index.ts`
- `src/non-product-atmosphere/seasonSemanticProfiles.ts`
- `src/non-product-atmosphere/sceneVariants.ts`
- `src/non-product-atmosphere/image2AtmospherePromptRenderer.ts`
- `scripts/validateNonProductAtmosphereModule.mjs`

### 4.5 视觉母体验证工作台

该页面是内部验证层，不是生产 Provider 控制台。

它展示：

- 冻结品牌母体与视觉 anchors；
- Canonical Content Themes；
- Phase 3-D 新旧 Prompt 对照；
- A1–C5 视觉角色验证任务；
- Prompt 与 Reference Plan 复制；
- 手动上传旧结果 / 新结果的 QA 占位流程。

品牌视觉锚点只定义抽象画面语言，不定义当前产品结构。

---

## 5. Prompt 运行时架构

### 5.1 总体链路

```text
UI TeamPromptParams
→ bindTaskProductTruth / Reference Plan
→ generatePromptRuntime
→ normalizePromptProfileInput
→ collectPromptRules
→ resolvePromptConflicts
→ allocatePromptBudget
→ compilePrompt
→ validateCompiledPrompt
→ final Prompt + diagnostics + readiness metadata
→ UI 展示 / Copy
→ 用户在外部 Image2 手动执行
```

### 5.2 Prompt Engine 模块

主要目录：`src/prompt-engine/`

| 模块 | 职责 |
|---|---|
| `runtime.ts` | 统一运行入口；支持 legacy / compare / new 模式 |
| `normalizePromptProfileInput.ts` | 输入归一化 |
| `collectPromptRules.ts` | 收集 Product Truth、人物、场景、动作、衣橱、镜头、真实性、信任规则 |
| `resolvePromptConflicts.ts` | 按优先级处理规则冲突 |
| `allocatePromptBudget.ts` | 按 Prompt section 分配字数预算，保留 required 规则 |
| `compilePrompt.ts` | 输出最终 Provider Prompt |
| `validateCompiledPrompt.ts` | 检查缺失 required、冲突、重复 negative、品牌泄露、句子完整性 |
| `diagnostics.ts` | runtime 诊断信息 |
| `promptFeatureFlags.ts` | Prompt Engine mode 控制 |

### 5.3 规则优先级

高层原则：

1. 用户明确输入；
2. 当前任务 Product Truth；
3. 产品结构与鞋履保护；
4. 人物身份与系列连续性；
5. 场景和构图；
6. 穿搭；
7. 镜头、光线和真实性；
8. negative 与低优先修饰。

required 规则即使造成 section overflow，也不能静默删除。

### 5.4 Active Prompt Registry

当前生产可路由角色：

- A1
- A2
- A3
- B3
- B4
- C1
- C2
- C3
- C4
- C5

当前全部指向 Image2；C5 使用 `repaired_new`，其他主要使用 `new`。

用户主题先进入 `topicRoutingRegistry`，再解析为视觉角色和 active prompt version。原始用户主题 ID 必须保留，不能被视觉角色替换。

被移除或不进入 runtime 的角色包括 A4、B1、B2。

核心实现：

- `src/visual-system/activePromptRegistry.ts`
- `src/visual-system/topicRoutingRegistry.ts`
- `src/visual-system/routedPromptCompiler.ts`

---

## 6. 场景、人物、动作与镜头

### 6.1 场景

场景由图片类型、主题、季节、用户选择和内容卡片共同决定。

已支持的主要生活场景包括：

- 通勤、写字楼、商务区；
- 城市散步、街角、安静街区；
- 咖啡店、朋友午餐；
- 花店、书店、美术馆；
- 精品超市、社区市集；
- 玄关出门、回家进门；
- 地铁 / 商场通道；
- 健身房、去运动的路上；
- 棚内上新；
- 产品静物、材质工作台、拍摄花絮。

不要重新引入：

- 酒店房间；
- 床边；
- 床景；
- 以床作为构图主体的任何 legacy prompt。

### 6.2 人物

支持的模特画像：

- 欧洲 25–30 岁女模特；
- 欧洲 30 岁左右男模特；
- 亚裔 20–25 岁模特；
- 25 岁左右亚裔混血模特；
- 30 岁左右亚裔混血模特；
- 30–45 岁客户画像模特。

人物连续性支持：

- 新人物；
- 延续上一组人物。

同组系列固定身份，但允许每张图变化：

- gaze target；
- eyelid tension；
- mouth state；
- head angle；
- body orientation；
- action phase。

### 6.3 动作系统

动作规则：

- 每张人物图只有一个主要动作；
- Action Lock 存在时，不再叠加通用动作候选；
- 同组动作进行去重；
- 手必须与衣袖、包、门、家具或具体物体形成真实接触；
- 避免悬空手、装饰性手势、重复整理衣襟；
- 非人物卡片的 still-life / material operation 指令也会进入最终 Prompt；
- 非人物材质指令会中性化，避免泄露未经确认的鞋履材质。

当前永久回归覆盖：

- 318 个唯一标记动作；
- 72 个生成组 / 384 个 Prompt；
- 10000 组 8 张压力抽样。

### 6.4 镜头与鞋履比例

当前镜头策略按动作风险选择：

| 风险 | 镜头策略 |
|---|---|
| low | 保持图片类型原有镜头和构图 |
| medium | `50–70mm` equivalent，moderate camera distance |
| high | `60–85mm` equivalent，camera farther back |

原则：

- 保留图片类型原构图目标；
- 高风险鞋履动作才切换安全焦段；
- 同时调整相机距离；
- 同组保持相近焦段档位；
- 避免前景鞋履被广角放大。

当前已知未完全解决风险：

- 最新真实成图仍出现鞋履相对小腿偏大、鞋头和前掌膨胀；
- 当前高风险关键词对 `heel lifted / heel settling / pivoting foot` 覆盖不足；
- camera rule 重点防止 enlargement，但新 Prompt Compiler 尚未完整接入所有 legacy 鞋履比例规则；
- 该问题已定位，但截至本快照尚未执行新的修复。

因此鞋履比例保护当前状态：

```text
INTEGRATED
STRUCTURAL REGRESSION PASSED
REAL IMAGE CONSISTENCY NOT COMPLETE
```

---

## 7. 衣橱与穿搭系统

### 7.1 总体原则

服装服务于鞋履商业表达，不能抢鞋。

主要约束：

- 季节一致；
- 场景一致；
- 人物状态一致；
- 城市气候一致；
- 色彩兼容；
- 材质不过载；
- 鞋色匹配；
- 鞋履可见；
- 每套最多一个 hero fashion element；
- 高冲突时装元素不能叠加；
- 彩色鞋时服装必须回到严格中性色。

### 7.2 Core Basics / 组合衣橱

Core 衣橱通过 tops、bottoms、layers、场景种子和安全模板形成组合。

永久验证保证四季各自可抽样：

```text
5000 unique outfit IDs
5000 unique outfit lines
```

5000 是组合容量抽样结果，不等于 UI 中存在 5000 条手写 preset。

### 7.3 AW26 Upgrade

AW26 是统一 THERUIZ AURA Wardrobe Library 的升级层，不是按品牌划分的平行衣橱。

当前包含：

- 34 件 AW26 wardrobe items；
- 30 套稳定 outfit presets；
- preset mode；
- Core + AW26 mix mode；
- Core fallback。

每件单品数据包括：

- category；
- season；
- silhouette；
- material；
- color；
- warmth；
- formality；
- scene compatibility；
- person-state compatibility；
- role；
- footwear visibility；
- compatible tops / bottoms / outerwear；
- internal inspiration source。

`inspiration_source` 只用于内部元数据。生产 Prompt 默认不能输出：

- Loro Piana；
- Brunello Cucinelli；
- The Row；
- Chloé；
- Chanel。

### 7.4 AW26 运行逻辑

适用季节：

- 秋；
- 冬。

适用服装偏好：

- 自动匹配；
- 裤装；
- 裙装。

其他类别继续使用 Core 逻辑。

模式轮换：

```text
preset → mix → Core
```

模式槽位和具体 preset 轮换使用分离 nonce，避免只能触达少量 preset。

共享穿搭会先解析该组所有人物卡片的真实场景和城市，再检查同一套衣服是否适用于整组，而不是用一个虚假的“自动匹配 / 周末散步”场景决定全部图片。

已修复：

- 裤装 / 裙装选择导致 AW26 不可达；
- 单场景 suitability 尾句泄露到其他场景；
- 模式和 preset 使用相同 nonce 导致 30 套中只有少量可达；
- 深圳和北京冬季抽到相同厚重外套；
- 彩色鞋仍允许 earth / denim / muted accent；
- Action Lock 与通用动作候选同时进入 Prompt。

当前网页入口抽样曾验证：

- 生活场景软种草：AW26 11 / 30；
- 穿搭解决方案：AW26 11 / 30；
- 上新活动转化：AW26 12 / 30；
- 30 套 AW26 presets 全部可调用；
- 棚内上新继续使用独立 Studio Wardrobe authority，不强制进入 AW26。

因此，仅凭棚拍成图无法证明 AW26 命中。需要检查：

- `outfitRotationId`；
- `selectedOutfitId`；
- `lockedOutfitLine`。

AW26 命中 ID 通常为：

```text
aw26-preset-*
aw26-mix-*
```

核心实现：

- `src/data/theruizAuraWardrobeLibrary.ts`
- `src/data/combinatorialOutfitLibrary.ts`
- `src/utils/choosePerSceneOutfitLine.ts`
- `src/utils/outfitLibraryFilters.ts`
- `scripts/validateAw26Wardrobe.mjs`
- `scripts/validateOutfitCombinationDiversity.mjs`

### 7.5 Studio Wardrobe

棚内上新拍摄拥有独立权威：

- 5 种棚拍背景；
- 20 件 studio wardrobe items；
- 自动或用户明确选择；
- 用户明确选择不能被随机替换；
- 同一 8 张系列保持同一服装、棚景和灯光方向。

不要因为用户选择秋冬就自动把所有棚拍服装判断为 AW26。

---

## 8. Consumer Trust

当前为 Manual Consumer Trust Layer v1.1。

目标：避免把品牌生成图伪装成真实消费者证据。

主要规则：

- 生活方式图片可以是 brand-produced lifestyle visualization；
- 不得声称是真实买家晒单、独立测评或真实穿着记录；
- 不得生成虚构用户名、订单、评分、聊天、平台 UI、时间戳；
- 不得暗示未经验证的舒适、耐用、防水、防滑、医疗或性能结果；
- 内容仍需 manual trust QA。

核心实现：

- `src/prompt-engine/profiles/theruizAuraConsumerTrustProfiles.ts`
- `docs/consumer-trust/THERUIZ_AURA_CONSUMER_TRUST_V1.md`
- `docs/consumer-trust/MANUAL_TRUST_QA_CHECKLIST.md`
- `scripts/validateConsumerTrustLayer.mjs`

---

## 9. 数据与状态管理

当前主要状态保存在 React 组件内：

- Prompt 参数；
- 当前生成 Prompt；
- Prompt binding fingerprint；
- 小红书主题、数量、nonce；
- previous outfit ID；
- recent outfit IDs（最近 6 个）；
- 本地参考图片 object URLs；
- Reference Set ID；
- 非产品氛围计划；
- Copy 状态。

重要限制：

- 刷新页面后绝大多数状态不会持久保存；
- 参考图片只存在于当前浏览器会话；
- 不上传服务器；
- 不存在跨设备、跨账号或跨任务历史；
- 最近穿搭去重只是当前页面会话级，不是全局长期记忆。

---

## 10. 关键业务流程

### 10.1 单张 Prompt 流程

```text
用户选择图片类型、季节、场景、人物、服装等
→ UI 更新 TeamPromptParams
→ 用户上传 1–9 张参考图
→ 图片初始为 unclassified
→ 用户确认每张图的 reference role
→ createTaskReferenceSet
→ bindTaskProductTruth
→ 生成 reference-bound Product Truth 与 Reference Plan
→ generatePromptRuntime
→ Prompt rules 收集、冲突处理、预算分配和校验
→ UI 显示 Prompt、覆盖状态、Manual / Draft 状态
→ Copy 前 fingerprint 检查
→ stale 时重新编译
→ 用户复制最新 Prompt
→ 用户在外部 Image2 按建议顺序手动上传图片并生成
```

### 10.2 小红书 3 / 5 / 8 张流程

```text
用户选择主题和图片数量
→ 同步最新 Prompt 参数和参考图 binding
→ generation nonce + 1
→ 根据日期、主题和 variant offset 选择内容变体
→ 选择 storyboard cards
→ 解析每张卡的图片类型、场景和 visual role
→ 预解析整组人物场景 / 城市
→ 选择共享 outfit（Core / AW26 preset / AW26 mix）
→ 过滤 previous / recent outfit IDs
→ 选择组内不重复动作
→ 固定人物、鞋履、主要穿搭和主题方向
→ 每张卡编译独立 Image2 Prompt
→ 输出标题、正文、标签和 Prompts
→ 用户复制全部或单张 Prompt
→ 外部 Image2 手动生成
```

### 10.3 非产品氛围图流程

```text
用户选择数量、季节和画幅
→ generation nonce + 1
→ buildNonProductAtmospherePlan
→ 选择季节兼容 scene archetype / variant
→ 同组避免 archetype 重复
→ 生成 scene fingerprint、生活痕迹、空间线索和时间
→ 选择 no_product / subtle_support / lived_trace
→ 限制 Product Echo 权限
→ 编译每张独立 Prompt
→ Prompt-level QA
→ 用户复制 Prompt
→ 外部 Image2 手动生成
→ 人工视觉 QA
```

### 10.4 棚内上新流程

```text
用户选择棚拍主题 / 背景 / 服装 / 角度
→ Studio Preset 与 Studio Wardrobe 匹配
→ 用户明确服装选择拥有优先权
→ 3 / 5 / 8 storyboard 规划
→ 同组锁定棚景、服装、灯光和人物
→ 动作与机位轮换
→ B3 / B4 / C1–C5 role routing
→ 每张独立 Prompt
→ 外部 Image2 手动生成
```

---

## 11. 验证体系

当前 package scripts：

```bash
npm run typecheck
npm run validate:prompts
npm run validate:studio
npm run validate:engine
npm run validate:atmosphere
npm run validate:actions
npm run validate:outfits
npm run validate:aw26-wardrobe
npm run validate:production-runtime
npm run validate:reference-binding
npm run validate:prompt-audit
npm run validate:consumer-trust
npm run build
git diff --check
```

验证职责：

| 脚本 | 主要覆盖 |
|---|---|
| `validate:prompts` | 直接样本和 3 / 5 / 8 Prompt 真实性、禁止词和结构 |
| `validate:studio` | 棚景、棚拍衣橱、Prompt 组合 |
| `validate:engine` | Prompt 类型、规则、预算、镜头风险和 runtime mode |
| `validate:atmosphere` | 四季氛围、archetype、variant、Product Presence、fallback |
| `validate:actions` | 动作池、组内去重、非人物动作进入最终 Prompt |
| `validate:outfits` | 四季 5000 组合容量和手动工作流样本 |
| `validate:aw26-wardrobe` | 34 items、30 presets、网页可达性、气候、彩色鞋、中性化、品牌去除 |
| `validate:production-runtime` | runtime 输出、diagnostics、strict failure 边界 |
| `validate:reference-binding` | unknown facts、上传顺序、plan、stale copy、readiness、C4 |
| `validate:prompt-audit` | Prompt inventory、冲突和信任层审计 |
| `validate:consumer-trust` | Consumer Trust role 与禁止声明 |

本快照现场重新验证通过：

- `npm run typecheck`
- `npm run validate:aw26-wardrobe`
- `npm run validate:reference-binding`
- `npm run validate:production-runtime`

最近合并前全套还通过：

- `validate:actions`
- `validate:prompts`
- `validate:studio`
- `validate:engine`
- `validate:atmosphere`
- `validate:outfits`
- `build`
- `git diff --check`

注意：结构化测试通过不等于真实 Image2 视觉通过。

---

## 12. 当前完成状态

| 能力 | 当前状态 | 说明 |
|---|---|---|
| Prompt Builder UI | `INTEGRATED` | 本地网页入口可用 |
| Prompt Engine | `INTEGRATED` | new runtime 进入 UI，具备 diagnostics |
| Reference Binding | `INTEGRATED` | 上传、角色、覆盖、计划、stale copy 已接通 |
| 结构化 Product Truth 提取 | `NOT IMPLEMENTED` | facts 保持 unknown |
| Manual Image2 workflow | `COMPLETE` | 以“复制 Prompt + 外部手动上传”为验收范围 |
| Provider API | `NOT IMPLEMENTED` | 不允许声称已接入 |
| Provider execution readiness | `FALSE` | 设计如此，不是 bug |
| Production readiness | `FALSE` | 没有真实 Provider 闭环 |
| 小红书 3 / 5 / 8 | `INTEGRATED` | 内容、动作、场景、穿搭、Prompt 均可生成 |
| Core outfit rotation | `INTEGRATED` | 四季 5000 唯一组合抽样通过 |
| AW26 wardrobe | `INTEGRATED` | 34 items、30 presets、preset / mix / Core |
| Studio wardrobe | `INTEGRATED` | 独立于 AW26 authority |
| 非产品氛围图 | `INTEGRATED` | 13 archetypes、37 variants，结构验证通过 |
| Consumer Trust | `INTEGRATED` | Manual QA 仍要求人工执行 |
| 鞋履比例稳定 | `PARTIAL` | Prompt 规则存在，但真实图仍发现偏大问题 |
| 真实 Image2 E2E | `NOT VERIFIED` | 当前没有 API，外部生成结果不进入系统 |
| 自动视觉 QC | `NOT IMPLEMENTED` | 依赖人工看图 |

---

## 13. 已知问题与真实风险

### 13.1 高优先级

1. 鞋履比例仍可能偏大
   - 特别是前景脚、脚外转、抬后跟、低机位、画面下缘；
   - 下一步应扩展风险关键词并把完整鞋履比例规则接入 new compiler；
   - 必须通过真实 Image2 A/B 验证，不能只靠文本测试。

2. 无真实 Provider 闭环
   - 所有“Provider-ready Prompt”只是格式语义；
   - `providerExecutionReady` 和 `productionReady` 必须保持 false。

3. 无真实结构化产品识别
   - 任何具体材质、颜色、鞋头、鞋底和后跟事实都不能从 reference role 推断。

### 13.2 中优先级

1. 状态不持久
   - 页面刷新会丢失当前任务、参考图、穿搭历史和结果。

2. 穿搭去重仅为当前页面会话
   - recent outfit IDs 只保留 6 个；
   - 不代表长期跨会话不重复。

3. Prompt 仍可能较长
   - required rules 允许预算 overflow；
   - 不应为了压缩而删除 Product Truth、产品保护或信任规则。

4. Visual validation pending
   - 结构测试不能证明脸、手、鞋、衣物、材质和光线在真实生成中稳定。

### 13.3 仓库卫生

仓库中存在历史 `.DS_Store` 文件，但本轮文档任务不处理它们。

存在未跟踪文件：

```text
docs/prompt-audit/REUSABLE_PROMPT_OPTIMIZATION_PLAYBOOK.md
```

该文件属于用户资产。任何 Agent 都不得擅自删除、覆盖、移动或加入无关提交。

---

## 14. Agent 开始工作前的强制检查

每次开始修改前执行：

```bash
pwd
git rev-parse --show-toplevel
git branch --show-current
git rev-parse HEAD
git status --short --branch
```

必须确认：

- 真实 repo 是 `/Users/davidw/Documents/theruizonline-ui-redesign`；
- 当前任务应修改哪个分支；
- baseline 是否正确；
- 用户未提交文件是否需要保护；
- 本轮是 audit 还是 fix；
- 是否授权 commit / push / merge。

默认禁止：

- `git add .`；
- reset；
- stash 用户改动；
- clean；
- 强制 checkout；
- 删除未跟踪文档；
- 未授权 commit / push / merge；
- 接入真实 Image2 API；
- 把 Manual / Draft 描述成 production-ready。

---

## 15. 新 Agent 的判断准则

### 15.1 不要混淆这些概念

| 概念 A | 不等于概念 B |
|---|---|
| reference role confirmed | 识别出具体产品事实 |
| reference plan ready | 已发送 Provider Request |
| manual execution ready | provider execution ready |
| Prompt 测试通过 | 真实图片视觉通过 |
| 5000 outfit combinations | 5000 条手写 preset |
| 秋季穿搭看起来像 AW26 | runtime 一定命中 AW26 |
| Studio autumn wardrobe | AW26 wardrobe |
| 品牌 visual anchor | 当前产品 Product Truth |
| implementation exists | 已进入真实业务入口 |

### 15.2 判断 AW26 是否命中

不要仅凭成图判断。检查：

```text
outfitRotationId
selectedOutfitId
lockedOutfitLine
```

### 15.3 判断 Prompt 是否最新

检查：

- 当前 reference binding fingerprint；
- generated fingerprint；
- `isGeneratedPromptStale`；
- Copy 是否通过 `resolvePromptForCopy`。

### 15.4 判断功能是否完成

使用：

- `IMPLEMENTED`
- `INTEGRATED`
- `E2E VERIFIED`
- `COMPLETE`

没有真实 Image2 Provider 和结果回传时，不得把完整生成闭环标记为 `E2E VERIFIED` 或 `COMPLETE`。

---

## 16. 关键文件索引

### UI

- `src/App.tsx`
- `src/main.tsx`
- `src/index.css`

### 类型与入口

- `src/types.ts`
- `src/generation/contracts.ts`
- `src/generation/localGenerationService.ts`

### Prompt Engine

- `src/prompt-engine/runtime.ts`
- `src/prompt-engine/collectPromptRules.ts`
- `src/prompt-engine/resolvePromptConflicts.ts`
- `src/prompt-engine/allocatePromptBudget.ts`
- `src/prompt-engine/compilePrompt.ts`
- `src/prompt-engine/validateCompiledPrompt.ts`
- `src/prompt-engine/profiles/theruizAuraRealismProfiles.ts`
- `src/prompt-engine/profiles/theruizAuraConsumerTrustProfiles.ts`

### Product Truth / Visual Routing

- `src/visual-system/taskReferenceBinding.ts`
- `src/visual-system/activePromptRegistry.ts`
- `src/visual-system/topicRoutingRegistry.ts`
- `src/visual-system/routedPromptCompiler.ts`
- `src/visual-system/image2ThemeAdapter.ts`

### 小红书系列

- `src/utils/generateSoftSeedingContent.ts`
- `src/utils/selectDiverseSeriesActions.ts`
- `src/data/personActionLibrary.ts`
- `src/data/actionPoseProfiles.ts`

### 衣橱

- `src/data/theruizAuraWardrobeLibrary.ts`
- `src/data/combinatorialOutfitLibrary.ts`
- `src/data/studioWardrobeLibrary.ts`
- `src/utils/choosePerSceneOutfitLine.ts`
- `src/utils/chooseSmartOutfit.ts`
- `src/utils/outfitLibraryFilters.ts`

### 场景 / 四季 / 氛围

- `src/data/lifestyleSoftSeedingScenePool.ts`
- `src/data/teamSceneOptions.ts`
- `src/data/citySeasonClimateProfiles.ts`
- `src/non-product-atmosphere/index.ts`
- `src/non-product-atmosphere/sceneVariants.ts`
- `src/non-product-atmosphere/seasonSemanticProfiles.ts`

### 产品与人体保护

- `src/data/onFootSneakerProportionProfiles.ts`
- `src/data/sneakerProtectionProfiles.ts`
- `src/data/shoeSpecificAccuracyProfiles.ts`
- `src/utils/cameraPerspectiveProfiles.ts`
- `src/utils/chooseHumanRealismLines.ts`
- `src/utils/finalPromptSafetyCheck.ts`

### 验证

- `scripts/validatePromptAuthenticity.mjs`
- `scripts/validateStudioSceneWardrobe.mjs`
- `scripts/validatePromptEngine.mjs`
- `scripts/validateNonProductAtmosphereModule.mjs`
- `scripts/validateSoftSeedingActionDiversity.mjs`
- `scripts/validateOutfitCombinationDiversity.mjs`
- `scripts/validateAw26Wardrobe.mjs`
- `scripts/validateProductionRuntime.mjs`
- `scripts/validateReferenceBinding.mjs`
- `scripts/validatePromptAudit.mjs`
- `scripts/validateConsumerTrustLayer.mjs`

---

## 17. 最近关键 Git 历史

```text
a6eab6c Merge pull request #31 — AW26 Prompt combination conflict fixes
d25050c fix(prompt): resolve AW26 combination conflicts
3a7bcd3 feat(wardrobe): add THERUIZ AW26 outfit system
c092e38 Merge pull request #30 — Consumer Trust manual layer
041a349 fix(scene): retire hotel prompt contexts
c454a41 fix(scene): close legacy hotel bed prompt paths
2d544cd fix(scene): remove hotel bed compositions
7cb94cd fix(outfit): cool down recent visual clusters
```

---

## 18. 建议下一步

如果下一轮目标是继续提高真实出图稳定性，优先级建议：

1. 修复鞋履偏大与前掌膨胀：扩展动作风险识别，接入完整鞋履比例 required rules；
2. 用真实外部 Image2 做同 Prompt、同参考图、同顺序的 A/B；
3. 记录每个 A/B 的 Prompt、Reference Plan、图片、鞋履比例、结构、人体和失败标签；
4. 通过后才更新 Active Prompt Registry 或宣布视觉问题解决；
5. Provider API、任务持久化和自动 QC 应作为独立产品阶段，不要混入当前 Manual workflow 小修。

---

## 19. 给新 Agent 的简短启动指令

```text
你正在维护 THERUIZ AURA 本地 Prompt 编排工作台。

先阅读本文件，再检查当前 repo root、branch、HEAD 和 dirty state。当前产品只生成并复制 Prompt，用户在外部 Image2 手动上传参考图并生成；没有真实 Provider API，不得声称 production-ready。

当前任务上传且由用户确认用途的鞋履图片是唯一 Product Truth。Reference role 只能证明证据角色与覆盖，不能证明系统识别出了具体材质、颜色、鞋头、鞋底或后跟。未提取事实保持 unknown。

任何修改必须复用现有 Prompt Engine、Visual System、wardrobe、scene 和 Product Truth 链路，不要建立平行系统。修改后运行与风险相称的验证。结构测试通过不等于真实 Image2 视觉通过。

保护工作区中未跟踪或未提交的用户文件。除非 David 明确授权，不 commit、不 push、不 merge。
```

