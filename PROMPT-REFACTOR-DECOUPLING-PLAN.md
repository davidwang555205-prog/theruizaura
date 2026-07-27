# THERUIZ AURA 提示词系统重构与解耦方案

## 1. 文档目的

本方案用于解决当前提示词系统中的结构性问题：

- 场景、图像类型、构图角度和动作规则互相覆盖；
- 手动选择的关键词无法稳定影响最终构图；
- 多个模块重复追加同一类正向或负面规则；
- 预算控制、预检和末端安全检查多次改写提示词；
- 主题软种草额外要求绕过统一预算和冲突控制；
- 后续修改单个关键词容易影响不相关场景。

目标不是重写所有提示词内容，而是重建规则组合、优先级和输出边界。

## 2. 当前系统问题概览

当前主要生成链为：

```text
TeamPromptParams
  ↓
teamPromptCore.ts 大量条件拼装
  ↓
PromptPriorityEngine
  ↓
promptAIRiskPreflight
  ↓
promptPreflightCheck
  ↓
controlPromptBudget
  ↓
再次 preflight / budget
  ↓
buildStructuredPrompt
  ↓
dedupe / safety check / vocabulary replacement
  ↓
最终提示词
```

当前约束：

- `src/utils/teamPromptCore.ts` 约 2,400 行；
- `src/utils/generateSoftSeedingContent.ts` 约 3,600 行；
- 相关 data 模块约 44 个；
- 提示词相关代码接近 7,000 行。

主要结构性风险：

1. 同一概念分散在多个模块，例如鞋款保护、鞋款可见性、鞋脚关系和鞋底接触。
2. `Scene`、`Action`、`Model` 和 `Styling` 没有稳定的场景边界。
3. 构图角度只是文本行，而不是可参与决策的结构化模式。
4. 预算控制以文本截断为主，可能截断半句、括号或材质描述。
5. 软种草主题在基础提示词之后继续追加文本，可能重新撑大最终提示词。

## 3. 重构目标

### 3.1 硬约束集中管理

全局硬约束只保留一份来源：

- 上传鞋款的颜色、结构、材质和比例；
- 鞋脚关系、鞋底接触和鞋款不可变形；
- 多图人物、穿搭、配饰和鞋款连续性；
- 用户明确指定的服装、颜色和材质。

### 3.2 构图模式结构化

角度不再只是 `Studio angle` 文本，而是结构化的 `compositionMode`：

```ts
type CompositionMode =
  | "fullFigure"
  | "studioLowerThird"
  | "studioOnFootDetail"
  | "studioThreeQuarter"
  | "mirrorFull"
  | "mirrorThreeQuarter"
  | "mirrorSeated"
  | "onFootLifestyle"
  | "stillLife"
  | "materialDetail"
  | "atmosphere";
```

构图模式必须决定：

- 是否输出完整人物段；
- 是否加载脸部和表情规则；
- 使用哪类动作；
- 鞋款可见性要求；
- 服装段预算；
- 负面词集合；
- 相机与透视规则。

### 3.3 场景规则按需加载

每次生成只加载当前图像类型、构图模式和场景真正需要的规则。

```text
全局硬约束
  + 图像类型模块
  + 构图模式模块
  + 场景模块
  + 轻量品牌/真实性模块
```

禁止让非产品氛围图继承产品主视觉规则，也禁止让静物图继承人物脸部、眼神和身体动作规则。

### 3.4 预算控制只有一个最终入口

所有文本必须在最终组装前完成：

```text
规则收集
  ↓
冲突解决
  ↓
优先级排序
  ↓
按 section 分配预算
  ↓
完整句子压缩
  ↓
最终输出
```

末端安全检查只能做验证和报告，不能再无预算地追加长文本。

## 4. 目标架构

建议新增 `src/prompt-engine/`，逐步替代 `teamPromptCore.ts` 的集中条件拼装。

```text
src/prompt-engine/
├── contracts.ts
├── resolvePromptProfile.ts
├── collectPromptRules.ts
├── resolvePromptConflicts.ts
├── allocatePromptBudget.ts
├── compilePrompt.ts
├── validateCompiledPrompt.ts
├── profiles/
│   ├── imageTypeProfiles.ts
│   ├── compositionProfiles.ts
│   ├── sceneProfiles.ts
│   └── promptBudgetProfiles.ts
└── rules/
    ├── globalHardRules.ts
    ├── productRules.ts
    ├── identityRules.ts
    ├── stylingRules.ts
    ├── actionRules.ts
    ├── realismRules.ts
    └── negativeRules.ts
```

### 4.1 PromptProfile

```ts
type PromptProfile = {
  imageType: TeamImageType;
  compositionMode: CompositionMode;
  sceneKey: StandardSceneKey;
  sections: {
    time: PromptRule[];
    location: PromptRule[];
    product: PromptRule[];
    model: PromptRule[];
    styling: PromptRule[];
    scene: PromptRule[];
    action: PromptRule[];
    negative: PromptRule[];
  };
  budget: PromptBudgetProfile;
};
```

### 4.2 PromptRule

```ts
type PromptRule = {
  id: string;
  text: string;
  priority: "critical" | "high" | "normal" | "soft";
  appliesWhen: RulePredicate;
  conflictsWith?: string[];
  replaces?: string[];
  estimatedWords?: number;
};
```

每条规则必须有稳定 `id`，避免只能依赖文本正则识别冲突。

## 5. 优先级模型

统一优先级：

```text
P0 用户明确上传/指定内容
P1 产品结构、颜色、材质和安全硬锁
P2 人物和穿搭连续性
P3 构图模式和鞋款可见性
P4 当前场景与动作
P5 真实性与相机语言
P6 品牌氛围和软性审美
P7 通用低优先级负面词
```

冲突示例：

| 冲突 | 保留 | 删除/降级 |
|---|---|---|
| 上传鞋款颜色 vs 品牌米白色 | 上传鞋款颜色 | 品牌色只作用于环境/次要搭配 |
| 手动棚拍角度 vs 系列镜头角度 | 手动角度 | 系列默认角度 |
| 非产品图鞋款次要 vs 产品主角 | 非产品图鞋款次要 | 产品主角规则 |
| 镜自拍弱化表情 vs 多图表情 beat | 镜自拍弱化表情 | catchlight/脸部表情 beat |
| 单一手持物 vs 默认动作多物件 | 单一手持物 | 其他手持物 |
| 下半身构图 vs 完整脸部规则 | 下半身构图 | 脸部和眼神规则 |

## 6. 构图模式规则

### 6.1 `studioLowerThird`

- 输出从衣摆/腿线到地面的构图描述；
- 不输出完整脸部、发型和表情规则；
- 禁止交叉腿，使用轻微前后错位或稳定平行站姿；
- 两只鞋尽量分离、接地并可读；
- 优先保留鞋领、鞋带、鞋底、裤脚和地面接触；
- 负面词优先保留鞋款结构和下肢比例。

### 6.2 `studioOnFootDetail`

- 只保留小腿以下和鞋款细节；
- 禁止脸部、人物身份和表情规则；
- 相机规则使用中近景，但禁止广角放大鞋子；
- 优先保留鞋头、鞋带、侧片、鞋底线和接地。

### 6.3 `fullFigure`

- 保留完整人物身份、穿搭比例和人物连续性；
- 可加载完整动作和表情规则；
- 必须保留至少一只鞋从鞋头到鞋跟可见。

### 6.4 `stillLife` / `materialDetail` / `atmosphere`

- 不加载人物身份、脸部、眼神和人体比例规则；
- 使用专属产品主次规则；
- 静物图鞋款为主，材质图材质细节为主，氛围图鞋款为次要或可选。

## 7. 预算设计

预算不再只按固定 section 截断，而是按 `PromptBudgetProfile` 分配：

```ts
type PromptBudgetProfile = {
  totalWords: number;
  sectionCaps: Record<PromptSection, number>;
  requiredRuleIds: string[];
  optionalRuleIds: string[];
};
```

示例：

```ts
const studioLowerThirdBudget = {
  totalWords: 300,
  sectionCaps: {
    product: 82,
    studioAngle: 36,
    model: 24,
    styling: 72,
    scene: 40,
    action: 48,
    negative: 48
  },
  requiredRuleIds: [
    "product.reference.color",
    "product.reference.shape",
    "composition.studioLowerThird",
    "shoe.footSeparation",
    "shoe.groundContact"
  ]
};
```

压缩规则：

1. 先删除重复软性形容词；
2. 再删除低优先级负面词；
3. 再删除非必要场景修饰；
4. 不允许截断 `Styling` 的括号或半句；
5. 必须保留 `requiredRuleIds`；
6. 最终输出后再次统计并报告预算结果。

## 8. 迁移顺序

### 阶段一：建立编译器外壳

- 新增 contracts 和 profile 类型；
- 保留旧 `generateTeamPrompt` 作为兼容入口；
- 让旧入口先调用新编译器，输出格式保持不变；
- 建立新旧输出对照测试。

### 阶段二：迁移棚拍构图

优先迁移：

- 全身棚拍；
- 下半身 1/3；
- 鞋款上脚特写；
- 3/4 侧前方上脚；
- 镜自拍棚拍角度。

验收重点：手动角度必须优先于系列镜头索引，且最终提示词必须出现对应构图规则。

### 阶段三：迁移图像类型

依次迁移：

1. 产品上脚图；
2. 对镜穿搭图；
3. 产品静物图；
4. 拍摄花絮 / 材质图；
5. 非产品氛围图；
6. 生活场景图。

### 阶段四：迁移场景模块

将通勤、咖啡馆、酒店、健身房、巴黎街景、家庭生活、秋冬配色等改为独立 scene profile。

### 阶段五：迁移软种草主题

迁移 8 个主题时，保留主题文案和图片顺序，但将每张卡片的：

- 图像类型；
- 构图模式；
- 动作白名单；
- 产品主次；
- 连续性规则；

转为结构化参数，不再用长字符串临时追加。

### 阶段六：删除旧重复逻辑

只有新编译器通过全部回归测试后，才删除或收缩 `teamPromptCore.ts` 中的旧分支和重复规则。

## 9. 测试与验收

### 必测矩阵

- 6 种图像类型；
- 4 种棚拍角度；
- 新人物与延续人物；
- 4 个季节；
- 自动场景与手动场景；
- 用户指定服装和自动服装；
- 单图、3 图、5 图、8 图主题内容；
- 有/无鞋款参考；
- 有/无手持物；
- 中英文补充要求。

### 自动断言

- 手动棚拍角度出现在最终提示词；
- 非产品图不出现产品主角硬锁；
- 静物/材质图不出现人物脸部规则；
- 镜自拍不出现多图脸部 catchlight beat；
- 下半身图不出现完整人物表情规则；
- 负面词不重复超过配置阈值；
- 最终词数不超过对应 profile；
- 不存在半句、未闭合括号和悬空连接词；
- 用户指定鞋款颜色未被品牌色覆盖；
- 单一手持物约束与动作一致。

### 视觉验收

每种构图至少生成 3 组样例，检查：

- 鞋款颜色和结构；
- 鞋脚比例；
- 鞋底接地；
- 衣摆与鞋领分离；
- 动作是否真实不同；
- 场景是否与主题一致；
- 多图人物和穿搭是否连续。

## 10. 风险与回滚

### 风险

- 新旧规则同时生效导致重复；
- 软种草主题输出变化；
- 预算缩短后关键材质或场景信息丢失；
- 旧测试只检查关键词，不检查最终组装结果；
- 视觉风格发生非预期变化。

### 控制方式

- 每个阶段只迁移一个边界；
- 保留旧编译器开关或兼容入口；
- 对照保存旧版最终 prompt 样例；
- 先通过结构测试，再做真实图像验证；
- 不在同一提交中同时迁移多个主题和多个图像类型。

### 回滚策略

- 通过 feature flag 切回旧编译路径；
- 保留迁移前的固定样例快照；
- 任何阶段失败时只回滚当前 profile，不回滚全局规则；
- 不删除旧模块，直到新架构完成全量验收。

## 11. 工程量估算

完整重构预计：

```text
8–12 个工作日
170k–330k tokens
```

第一版可运行解耦架构预计：

```text
3–5 个工作日
50k–90k tokens
```

预计会新增或重写约 20–35 个文件，但不会一次性重写全部 44 个 data 模块。

## 12. 当前建议

先从棚拍构图模式开始，建立可证明的最小闭环：

```text
手动角度
→ compositionMode
→ 专属 Model / Action / Styling / Negative
→ 专属预算
→ 最终结构断言
```

只有这一闭环稳定后，再迁移镜自拍、静物和软种草主题。这样可以用最小风险解决当前最明显的结构性问题，并为后续关键词修改提供稳定的规则边界。
