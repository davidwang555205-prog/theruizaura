# THERUIZ AURA Consumer Trust Layer V1

## V1.1 Compression Patch

V1.1 保持 Consumer Trust 架构、Role、metadata、Rule ID 和现有编译流程不变，只把解释型正文压缩为最小可执行护栏。完整风险定义继续保留在本文件与人工 QA Checklist；Prompt 只承担生成前的高概率约束。

当前仍没有图片自动检测、自动重试或外部模型遵循证明。压缩后的规则不能替代人工检查，也不改变 `providerExecutionReady: false` 或 `productionReady: false`。

V1.1 目标正文预算：`product_evidence` ≤ 40 词，`brand_lifestyle_visualization` ≤ 35 词，`synthetic_ugc_visualization` ≤ 55 词，`editorial_atmosphere` 为 0 词。

## 当前边界

这是 Manual V1。系统负责编译可复制的 Image2 Prompt，用户仍需按 Reference Plan 在外部平台手动上传参考图、粘贴 Prompt、生成图片并人工验收。

当前没有图片生成 API、图片回传、自动视觉审核、自动重试、自动修复、商品功效识别或 Commercial Trust 自动评分。`providerExecutionReady` 与 `productionReady` 不会因为启用本层而变为 `true`。

## Trust Role

| Role | 默认内容 | 商业信任职责 |
|---|---|---|
| `product_evidence` | 产品上脚、静物、材质与结构证据图 | 只把当前参考图可见的商品外观作为图像证据，不扩展为功效证明 |
| `brand_lifestyle_visualization` | 生活场景、对镜穿搭 | 明确属于品牌制作的生活方式演绎，不冒充真实购买者或穿着记录 |
| `synthetic_ugc_visualization` | 仅限内部显式指定的生活场景或对镜穿搭 | 允许消费者视角构图，但不冒充买家照片、独立评价或真实售后记录 |
| `editorial_atmosphere` | 非产品氛围图 | 只承担编辑氛围表达，不承担商品事实或商品功效证明责任 |

当前前端不提供 Trust Role 选择器。默认角色由 `imageType` 与 `compositionMode` 解析，`synthetic_ugc_visualization` 只能由内部调用显式指定。

## 规则加载

- `product_evidence`：可见商品证据范围、未经支持的功效暗示边界。
- `brand_lifestyle_visualization`：品牌生活方式演绎边界、禁止虚假消费者证据。功效风险完整定义保留在文档和人工 QA 中。
- `synthetic_ugc_visualization`：未经支持的功效暗示边界、禁止虚假消费者证据、Synthetic UGC 专属边界。
- `editorial_atmosphere`：只写 metadata，不增加 Consumer Trust Prompt 正文，也不加载商品功效规则。

所有正文规则继续使用现有 `PromptRule`、优先级、冲突解析与预算机制；没有独立 Trust 字符串拼接器。

## 职责分离

Product Truth 管理当前参考图能够确认的鞋型、颜色关系、材质区域、结构与证据覆盖，不负责判断商业宣传是否成立。

Commercial Claim Risk 管理图像是否通过文字、图标、测试场景、湿滑地面或人物反应暗示防水、防滑、医疗矫形、增高、绝对舒适、耐久或安全结果。

Synthetic UGC Risk 管理品牌制作内容是否冒充真实消费者评价、买家图片、订单记录、聊天、评分、用户名、时间戳或独立体验。

## API 接入后的升级方向

未来接入 Provider API 后，可在保持当前 Prompt-time 规则的基础上增加：生成结果回传、视觉与 OCR 检测、Product Truth 对照、商业声明风险检查、人工复核队列和失败重试。只有真实执行链路和审核链路就绪后，才能重新评估 Provider 与 Production readiness。
