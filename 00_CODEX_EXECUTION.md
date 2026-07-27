# CODEX 执行任务｜THERUIZ AURA Phase 3-A 前视觉系统验证

## 0. 强制范围

你当前只处理 **THERUIZ AURA** 项目。

除非当前工作区本身就是 THERUIZ AURA 根目录，否则先定位名称明确包含 `THERUIZ_AURA` 或 `theruizaura` 的项目目录，并仅在该目录内修改。

禁止修改：

- Black Mirror / BM 项目；
- 其他品牌项目；
- 共用基础设施；
- 真实 Provider 接入；
- Phase 3-A 及之后的用途适配器。

本任务的最终停止点是：

> 完成 Phase 3-A 之前的品牌视觉系统落盘、机器可读化、视觉验证工作台和验证报告模板。

完成后停止并等待品牌方人工确认。

---

# 1. 先读取的文件

按以下顺序完整读取：

1. `visual-system/docs/01_视觉系统升级项目说明_v1.0.md`
2. `visual-system/docs/02_视觉规则盘点与品牌视觉母体_v1.0.md`
3. `visual-system/docs/03_品牌视觉母体执行化_v1.0.md`
4. `visual-system/docs/04_正式视觉参考锚点定义_v1.0.md`
5. `visual-system/docs/05_品牌视觉母体_v1.2_修订冻结版.md`
6. `visual-system/docs/06_上传驱动_Product_Truth_规则_v1.0.md`
7. `visual-system/validation/07_视觉验证执行方案_v1.0.md`
8. `visual-system/config/*.json`
9. `visual-system/anchors/*`

优先级：

```text
品牌视觉母体 v1.2
>
上传驱动 Product Truth 规则
>
正式视觉锚点
>
旧规则盘点与执行化说明
```

发现旧文档与 v1.2 冲突时，以 v1.2 为准，不得自行折中。

---

# 2. 需要落地的目录结构

确保 THERUIZ AURA 项目中存在：

```text
visual-system/
├── README.md
├── docs/
├── anchors/
├── config/
├── validation/
│   ├── cases/
│   ├── results/
│   └── reports/
└── runtime/
    ├── brandVisualMother.*
    ├── anchorManifest.*
    ├── uploadProductTruth.*
    ├── qaRubric.*
    └── validationCases.*
```

文件扩展名根据当前项目技术栈决定：

- TypeScript 项目优先 `.ts`;
- Python 项目优先 `.py`;
- 纯内容项目可以使用 JSON / YAML;
- 不要为了本任务引入第二套框架。

---

# 3. 第一步｜项目扫描与基线确认

先检查：

- 当前项目技术栈；
- 是否已有 Prompt Builder；
- 是否已有视觉规则、动作库、场景库、模特库；
- 是否已有本地生成任务页；
- 是否已有图片上传与结果回传；
- 是否已有 QA 页面或数据模型。

输出一份：

`visual-system/validation/reports/00_existing-integration-audit.md`

内容必须明确：

- 可直接复用的能力；
- 需要新增的最小能力；
- 不应重复建设的能力；
- 本任务计划修改的文件；
- 不会修改的范围。

不要先写大量代码再补审计。

---

# 4. 第二步｜将冻结规则转成机器可读运行时

将以下 JSON 转为当前项目可直接调用的类型安全结构：

- `brand-visual-mother-v1.2.json`
- `anchor-manifest.json`
- `qa-rubric.json`
- `pre-phase-3a-validation-cases.json`

要求：

1. 有明确类型；
2. 有运行时校验；
3. 版本号可读取；
4. `approved_frozen` 状态不可被普通任务覆盖；
5. 明确区分：
   - 品牌规则；
   - 产品上传证据；
   - 未来用途适配；
   - 系统编排；
6. 明确编码：
   - 产品不是视觉导演；
   - 禁止按 SKU 匹配年龄、场景和调性；
   - 当前上传图片是任务唯一产品事实来源；
   - 人物范围为 25—46 岁。

至少编写以下断言或测试：

- 产品名称不能返回年龄；
- 产品颜色不能返回场景；
- 产品材质不能返回人物；
- 锚点文件不可作为当前产品 Product Truth；
- 缺少上传证据时必须返回 missing evidence，而不是自动补全。

---

# 5. 第三步｜建立视觉参考锚点浏览与规则映射

在现有内部工具中增加一个 **仅内部使用** 的“视觉母体验证”入口。

不要做最终客户页面。

页面或工作区至少包含三个分组：

- A｜生活方式母体锚点；
- B｜官方棚内人物锚点；
- C｜产品呈现与材质锚点。

每张锚点必须显示：

- 编号；
- 图片；
- 角色；
- 定义的视觉规则；
- 它不负责定义什么；
- 可继承项；
- 禁止机械复制项。

必须明确显示：

> 品牌锚点定义画面语言，不定义当前上传产品的真实鞋型。

---

# 6. 第四步｜建立上传驱动 Product Truth 验证入口

复用项目已有上传能力。没有上传能力时，只建立本地内部验证上传，不做正式客户流程。

用户/内部操作员上传一组产品图片后，系统自动将图片标记为可能的证据角色：

- 整体结构；
- 俯视 / 前部；
- 后跟 / 侧后；
- 材质 / 工艺；
- 上脚（可选）。

允许人工修正识别角色，但不得要求填写复杂产品表格。

系统输出：

- 当前任务 Product Truth；
- 证据完整度；
- 缺失证据；
- Product Truth 置信度：
  - High
  - Medium
  - Low
  - Blocked

规则：

- Low / Blocked 不得进入完整验证生成；
- 不可见结构不得猜测；
- 只提示最少补充图片。

---

# 7. 第五步｜生成 13 个视觉验证任务

读取：

`visual-system/validation/cases/pre-phase-3a-validation-cases.json`

为 A1—C5 共 13 个角色生成内部任务卡。

每张卡包含：

- 角色编号；
- 角色目标；
- 推荐比例；
- 产品视觉权重；
- 必须出现的品牌证据；
- 必须绑定的产品上传证据；
- 禁止事项；
- Provider-ready Prompt；
- Reference Plan；
- 复制按钮；
- 结果上传位；
- QA 评分位；
- 通过 / 修复 / 淘汰状态。

重要：

- 13 个任务是视觉母体验证，不是官方 8 图组；
- 不得自动排序成正式交付；
- 不得调用 Phase 3-A 逻辑；
- Prompt 不得机械复刻锚点人物、产品、咖啡馆或具体穿搭；
- Prompt 必须继承锚点的抽象视觉证据。

---

# 8. 第六步｜Manual Provider Bridge 验证流程

当前阶段不要接入真实生图 API。

实现或复用以下流程：

```text
选择 / 上传产品参考图
→ 建立 Product Truth
→ 生成 13 个 Provider-ready Prompt 和 Reference Plan
→ 人工复制至外部模型生成
→ 回传结果
→ 单图 QA
→ 整体品牌一致性检查
→ 输出验证报告
```

允许支持 Image2、Nano Banana、FLUX、Seedream 的已有 Prompt Adapter，但本任务不新增模型架构。

若已有 Adapter：

- 复用；
- 确保品牌母体只有一个语义来源；
- 不允许四个模型拥有四套不同品牌风格。

---

# 9. 第七步｜QA 与验证报告

每张结果按 100 分评分：

- 产品真实性：30
- 人物母体：15
- 色彩与光线：15
- 材质真实：10
- 产品参与方式：10
- 构图与留白：10
- 品牌锚点完成度：10

硬性淘汰项直接阻断通过。

自动生成：

`visual-system/validation/reports/pre-phase-3a-validation-report.md`

报告必须包含：

- 使用的产品上传证据；
- Product Truth 置信度；
- 13 个任务的缩略图 / 文件引用；
- 单图评分；
- 硬性错误；
- 品牌偏移原因；
- 是否机械复制锚点；
- A、B、C 三组是否属于同一品牌；
- 年龄范围是否保持品牌气质；
- 建议冻结、修订或淘汰的规则；
- 最终结论：
  - PASS
  - PARTIAL
  - FAIL

不得在没有真实回传图的情况下写 PASS。

---

# 10. 验收标准

必须全部满足：

1. 所有 Phase 3-A 前文档已进入 THERUIZ AURA 目录；
2. 13 张正式锚点可浏览；
3. 品牌母体 v1.2 已机器可读；
4. 产品 / SKU 不可驱动年龄、场景和调性；
5. 当次上传图是产品事实来源；
6. 可创建 13 个视觉验证任务；
7. 支持手动回传生成结果；
8. 支持 Product Truth、品牌与角色 QA；
9. 可输出真实验证报告；
10. 项目原有测试、类型检查和构建通过；
11. 未实现 Phase 3-A；
12. 未修改 BM 或其他品牌项目。

---

# 11. 最终汇报格式

完成后只汇报：

## A. 变更摘要

- 修改和新增了什么；
- 复用了什么；
- 没有做什么。

## B. 文件清单

列出实际文件路径。

## C. 验证结果

- 测试；
- typecheck；
- build；
- 浏览器流程；
- 仍需人工执行的外部生图步骤。

## D. 当前状态

只能使用：

- `READY_FOR_VISUAL_VALIDATION`
- `PARTIAL`
- `BLOCKED`

没有完成 13 张真实结果回传和人工确认前，不得写：

- VERIFIED
- COMPLETE
- READY_FOR_PHASE_3A

## E. 停止

完成后停止，不要继续做 Phase 3-A。

等待品牌方明确输入：

> Phase 3-A 可以开始
