# 可复用的 Prompt 生成系统优化与修复手册

## 文档目的

这份文档把已经验证过的 Prompt、场景、服装、人物连续性和产品参考修复逻辑，抽象成可跨产品复用的工程方法。

它适用于：

- 商品图与生活方式图生成；
- 3/5/8 张系列 Prompt；
- 四季服装搭配；
- 多场景内容主题；
- Image2 或其他外部图片 Provider 的手动 Prompt 工作流；
- 需要产品事实约束的上传参考系统。

它不规定某个品牌的具体颜色、鞋型或文案。产品、品牌和季节内容应由各项目自己的配置提供。

## 一、先区分四类事实

在任何修复前，先把系统中的内容分成四类：

### 1. 真实产品事实

只能来自：

- 真实视觉分析；
- 用户明确确认；
- 可信结构化 Product Truth。

例如鞋型、颜色、材质、鞋底、后跟、Logo 和结构细节。

### 2. 参考证据事实

上传图片只能证明：

- reference role；
- coverage；
- evidence binding；
- reference plan order。

图片角色本身不能证明具体材质、颜色、鞋头、鞋底或后跟结构。

### 3. Prompt 设计规则

例如：

- 构图；
- 镜头；
- 光线；
- 人物动作；
- 服装轮廓；
- 鞋履比例保护；
- 负面约束。

这些是生成控制规则，不应被误写成产品事实。

### 4. 执行状态

必须明确区分：

- Prompt 已生成；
- 用户已复制 Prompt；
- 用户在外部 Image2 手动上传；
- Provider API 已执行；
- 生产闭环已完成。

不能因为 Prompt 完整或 Reference Plan 完整，就声称 Provider 已被调用。

## 二、通用 Prompt 组装顺序

推荐使用以下顺序：

```text
用户输入
→ 主题与图片数量
→ 季节和场景解析
→ 产品 Truth 绑定
→ 服装候选池筛选
→ 系列级 outfit 锁定
→ 图片级动作与构图选择
→ 最终场景语义覆盖
→ Prompt 规则编译
→ Provider Prompt 清理与校验
```

### 关键原则

最终场景必须在 Prompt 拼接前确定。所有依赖地点、道具、动作或氛围的文本，都应基于最终场景生成，而不是继续使用原始 draft 场景。

## 三、产品 Truth 与上传参考保护

### 推荐写法

```text
Use the uploaded product references as the only product source.
Preserve only features visibly confirmed by the current reference set.
Do not infer missing shape, material, color, construction, branding, outsole, or heel details.
```

### 禁止写法

- 写死具体鞋型；
- 写死材质名称；
- 用品牌视觉风格推断产品颜色；
- 把参考图角色当成已完成视觉识别；
- 把内部 ID、confidence、diagnostics 或 readiness 写入 Provider Prompt。

### 验证标准

- 未确认产品事实不得出现；
- 上传参考仍保持无序能力；
- `originalUploadOrder` 与 `referencePlan.order` 分离；
- Prompt 只包含 Provider 可执行的用户语言。

## 四、主题与场景系统

### 1. 主题要有明确责任

每个主题都应有唯一 Topic responsibility，例如：

- 日常生活记录；
- 穿搭解决方案；
- 棚内上新；
- 上新活动转化；
- 非产品氛围图。

主题路由必须同时存在于：

- Prompt 生成；
- UI 标签；
- Provider Prompt；
- 验证脚本。

### 2. 场景候选池必须按图片类型过滤

同一场景不能无条件适用于所有图片类型。应至少区分：

- 生活场景图；
- 产品上脚图；
- 对镜穿搭图；
- 产品静物图；
- 拍摄花絮 / 材质图；
- 非产品氛围图。

### 3. 场景去重需要多维判断

不要只比较 `scenePreference`。同组 3/5/8 至少检查：

- scene；
- imageType；
- visualRole；
- actionFamily；
- objectFamily；
- camera framing。

字段不同但都生成咖啡店、镜前或酒店画面，仍然属于视觉重复。

### 4. 最终场景语义覆盖

最终场景确定后，应清理不属于该场景的旧语义：

- 酒店场景不应出现在普通街角；
- 行李不应出现在社区步道；
- 镜前动作不应出现在买菜场景；
- 棚内设备不应污染生活场景；
- 咖啡、餐桌、书店等道具不应跨场景自动带入。

负面约束中可以提到错误语义，但不能把它们作为当前场景的正向动作或道具。

## 五、四季服装搭配与轮换

### 1. 季节筛选必须先于轮换

正确顺序：

```text
season filter
→ scene filter
→ image type filter
→ shoe compatibility filter
→ garment type filter
→ history / previous outfit dedupe
→ rotation
```

不能先随机服装，再用文字把它解释成某个季节。

### 2. 服装轮换不是简单随机

推荐同时使用：

- generation nonce；
- variant index；
- scene key；
- image type；
- previous outfit ID；
- generated history；
- 组合步长。

### 3. 解决“候选很多但看起来一样”

服装多样性应同时考虑：

- 上装类别；
- 下装类别；
- 外层类别；
- 服装轮廓；
- 包袋形态；
- 鞋面与衣摆关系；
- 视觉锚点。

不要只增加颜色数量。应在保持品牌色彩边界的情况下，轮换：

- 直筒裤 / 宽腿裤 / 九分裤；
- 裙装 / 连衣裙 / 牛仔；
- 短夹克 / 开衫 / 轻风衣 / 短大衣；
- 衬衫 / 针织 Polo / 细针织 / 轻薄上衣。

### 4. 跨组避开最近视觉簇

同一组 3/5/8 应保持 outfit continuity；跨组则应记录最近使用的：

- top category；
- bottom category；
- outer layer category；
- visual anchor；
- outfit cluster。

下一组避开最近 1–2 个视觉簇即可，不必完全排除相近颜色。

### 5. 四季应保持风格一致但轮廓不同

- 春：轻衬衫、薄针织、轻外层；
- 夏：亚麻、轻棉、短袖、短裤、半裙；
- 秋：短夹克、细针织、轻羊毛、灰棕层次；
- 冬：针织、羊毛、保暖外层、深色结构。

统一的是品牌气质，不是固定一套衣服。

## 六、3/5/8 系列设计

### 同组必须锁定

- 人物身份；
- 发型与妆容；
- 核心服装；
- 鞋履；
- 色彩基调；
- 系列镜头连续性。

### 同组必须变化

- 场景；
- 动作阶段；
- 头部角度；
- 视线；
- 表情；
- 构图距离；
- 鞋履观察角度。

### 3 张

适合验证一条简单叙事：开始、移动、停留。

### 5 张

应增加一个搭配判断或细节补充，不要只是复制 3 张再加两张。

### 8 张

需要扩展视觉责任，不能只循环 4 个 Visual Role。必要时增加：

- 通勤；
- 室内生活；
- 镜前记录；
- 轻购物；
- 周末外出；
- 旅行转换；
- 上脚细节；
- 环境停留。

## 七、动作与表情去重

### 动作规则

每张只允许一个主要动作或物件操作。动作应形成真实原因、稳定阶段和明确重心。

避免：

- 两个动作锁同时出现；
- 手悬空；
- 同组全部双手整理衣服；
- 静态站立伪装成走路；
- 只为展示鞋子而摆脚。

### 表情规则

人物身份连续不等于表情相同。脸部可变化：

- 头部方向；
- 视线；
- 眼睑张力；
- 嘴形；
- 轻微面部反应。

如果脸被手机遮挡或裁切，就不要同时要求眼神、catchlight 或具体表情。

## 八、焦段、距离与鞋履风险

不要把单一焦段写成所有场景的硬规则。应根据：

- 图片类型；
- 鞋履前景风险；
- 动作风险；
- 构图目标；
- 系列镜头连续性。

安全策略：

- 高鞋履变形风险场景使用更安全的焦段；
- 同时调整相机距离；
- 普通低风险场景保留原镜头策略；
- 同组保持相近焦段档位；
- 避免通过模糊掩盖鞋履或人体结构错误。

## 九、UI 与执行状态

UI 应明确表达：

- 已整理参考图片用途；
- 已生成建议上传顺序；
- 当前为 Manual / Draft execution；
- 用户需要复制 Prompt 并去外部 Image2 手动上传。

UI 不得暗示：

- 系统已经识别全部产品事实；
- Reference Plan 已经自动发送给 Provider；
- API 已经完成生产闭环；
- 当前 production-ready。

推荐状态语义：

```text
productTruthMode: reference_bound
referenceEvidenceBound: true
referencePlanReady: true
structuredFactsExtracted: false
manualExecutionReady: true
providerExecutionReady: false
productionReady: false
```

## 十、验证清单

### 产品事实

- [ ] 没有写死鞋型；
- [ ] 没有未经确认的材质、颜色、结构；
- [ ] 上传参考是唯一产品来源；
- [ ] Provider Prompt 没有内部 ID、confidence、diagnostics、readiness。

### 场景与主题

- [ ] Topic responsibility 正确；
- [ ] 场景与图片类型兼容；
- [ ] 同组场景不重复；
- [ ] 正向场景语义没有跨场景污染；
- [ ] 3/5/8 组合职责清楚。

### 服装

- [ ] 季节先过滤再轮换；
- [ ] 四季均有有效候选；
- [ ] 同组服装连续；
- [ ] 跨组最近视觉簇能避重；
- [ ] 品牌色彩和风格没有被多样性破坏。

### 人物与动作

- [ ] 动作不重复；
- [ ] 手部有真实接触；
- [ ] 表情与眼神有变化；
- [ ] 身份连续但不复制同一张脸部表现。

### 工程

- [ ] typecheck；
- [ ] Prompt validation；
- [ ] 场景验证；
- [ ] 服装组合验证；
- [ ] build；
- [ ] git diff --check。

## 十一、有效更新的判定方法

不要只按聊天记录判断功能是否有效。应使用 Git 历史：

1. 找到该功能最后一次核心代码提交；
2. 检查后续提交是否再次修改同一模块；
3. 如果后续有修改，以最后一次相关提交后的最终状态为准；
4. Merge commit 只代表发布，不单独视为逻辑更新；
5. 验证脚本和实际运行入口必须同时检查。

推荐记录格式：

```text
功能板块：
最终有效提交：
核心文件：
修复内容：
后续是否再次触碰：
验证结果：
```

## 十二、Git 交付边界

涉及提交时：

- 先确认仓库根目录和分支；
- 只暂存明确文件；
- 不使用 `git add .`；
- 提交前运行验证；
- 推送后核对远程 SHA；
- 合并必须以 GitHub 实际状态为准；
- API 超时或 EOF 时不得声称已合并；
- 保留工作区状态、PR URL 和 commit SHA。

## 最终原则

可复用的底层优化不是“让 Prompt 写得更长”，而是建立清晰边界：

```text
事实来源可追溯
主题责任可验证
最终场景可覆盖
服装轮换有结构
系列连续但不复制
Provider 状态不夸大
每次修改都有验证证据
```

