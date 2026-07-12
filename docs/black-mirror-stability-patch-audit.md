# Black Mirror stability patch audit

审计日期：2026-07-12  
分支：`refactor/product-layer-decoupling`  
基线提交：`d04c5c9 Add person-only studio launch series`

## 基线

修改前（当前未提交产品层与服装 MVP 改动已存在）执行结果：`npm run typecheck` 通过，`npm run build` 通过；build 仅有既有 bundle size warning。最终复验结果相同。

## P01–P32 决策

| Patch | Decision | 证据与说明 |
|---|---|---|
| P01 | DEFERRED | 当前 `productMode` 已控制 `productContext`，但鞋/服草稿仍共用页面状态；改为双 draft 需要较大 UI 状态重构。 |
| P02 | NEEDED | `resolveProductContext` 为旧调用提供鞋履回退；服装 UI 已显式构造 context，但纯调用缺失时仍可回退。后续应增加 garment 缺失阻止。 |
| P03 | NEEDED | `garmentSceneCompatibility` 已存在，但 App 场景列表仍主要按图片类型过滤，品类切换不会自动重检。 |
| P04 | DEFERRED | 公共场景与旧软种草条目仍含鞋履语义；彻底来源层拆分需改动软种草数据，不能用全局替换代替。 |
| P05 | NEEDED | `teamPromptCore` 仍运行公共 outfit 选择器；服装适配边界存在，但辅助搭配尚未完全隔离。 |
| P06 | CONFLICT | 当前已有 `sanitizeGarmentPrompt` 防线，但来源层未完全拆分；扩大清洗会误删用户合法鞋履搭配，暂不扩大。 |
| P07 | ALREADY_FIXED | 服装规则通过 `detail()` 过滤空字段，未提供字段使用参考图原样保护语义。 |
| P08 | NEEDED | 参考图支持角色修改，但未限制 front 唯一性；当前只在生成前检查“至少4张 + front”。 |
| P09 | ALREADY_FIXED | 删除、卸载和 input reset 均处理 object URL；重复 revoke 浏览器安全且无网络上传。 |
| P10 | DEFERRED | 鞋履组图已有连续性，服装组图尚未有独立 garment lock，需配合 P05/组图生成器改造。 |
| P11 | DEFERRED | 服装棚拍仍复用鞋履组图计划，先不扩大镜头计划重构。 |
| P12 | NEEDED | 前端图片类型已映射中文名称，但核心能力矩阵尚未统一抽象。 |
| P13 | ALREADY_FIXED | garment adapter 对非产品氛围图返回 secondary/atmosphere 语义，不强制完整服装。 |
| P14 | ALREADY_FIXED | App 已在普通主题切换时把 8 张恢复为 5 张。 |
| P15 | DEFERRED | 当前兼容层为布尔过滤；三级等级会影响 UI 与自动匹配策略，暂缓。 |
| P16 | NEEDED | 已有部分 bridal/eveningGown/activewear 排除规则，但未接入 App 的场景选择。 |
| P17 | DEFERRED | 生活组图家族多样性属于现有软种草抽样逻辑，改动会触及稳定文案池。 |
| P18 | NEEDED | garment adapter 有通用遮挡保护，但没有按品类细分腰线、门襟、裙摆等动作规则。 |
| P19 | DEFERRED | 穿搭解决方案与普通主题的主产品锁定策略尚未独立建模。 |
| P20 | DEFERRED | 当前字段没有独立 ease/比例锁定，需组图锁定模型后再做。 |
| P21 | ALREADY_FIXED | 服装规则保护 fabric、texture、weight、color、pattern、drape；空字段不猜具体材质。 |
| P22 | ALREADY_FIXED | embroidery/lace/beadwork/keyDetails 已纳入保护；模型对文字 Logo 的固有限制已记录。 |
| P23 | DEFERRED | 服装组图尚未独立锁定妆发与视觉方向。 |
| P24 | DEFERRED | 负面词仍按历史鞋履核心流程组合，服装图片类型矩阵未完成。 |
| P25 | DEFERRED | 现有 dedupe 已运行，但尚未做服装专属冲突报告。 |
| P26 | NEEDED | 当前只有 `productMode` 状态，没有独立 shoeDraft/garmentDraft；切换时虽不串入 context，但完整草稿保留不够明确。 |
| P27 | NEEDED | 本地预览提示存在，但未明确“刷新页面后需重新选择”。 |
| P28 | ALREADY_FIXED | 现有 `formatSoftSeedingImagePrompts` 已按图片卡片分隔复制，不含 blob URL。 |
| P29 | ALREADY_FIXED | 服装模式显示本地参考图提示，不显示生成/下载按钮。 |
| P30 | DEFERRED | 当前任务重点是稳定性，改名会触及页面与文档身份，且不能影响 THERUIZ AURA。 |
| P31 | ALREADY_FIXED | `ProductMode`、`TeamImageType`、`GarmentProductCategory` 已分离，未使用 any 绕过。 |
| P32 | NEEDED | 仓库没有现成 Prompt 回归测试命令；本轮仅完成静态检查，轻量纯函数回归脚本可后续加入。 |

## 本轮实际修改

本轮审计没有继续叠加高风险功能补丁。现有 MVP 改动已通过类型检查和构建；P02、P03、P05、P08、P12、P16、P18、P26、P27、P32 保留为后续最小修复项，避免与未完成的组图连续性和来源层解耦冲突。

## 回归结论

- 鞋履默认模式、Cloud Dancer 默认鞋款及既有鞋履适配器仍保留。
- 服装模式可构造显式 `GarmentProductContext`，参考图校验为至少 4 张且包含 front。
- 服装模式隐藏虚假生图入口，并执行服装 Prompt 鞋履主产品词净化。
- 服装场景兼容函数已建立，但尚未完全接入场景下拉框，因此不能宣称所有品类场景均已硬阻止。
- 未执行 Image 2.0 API、网络请求、依赖安装、commit 或 push。

## 最终验证

`npm run typecheck`：通过。  
`npm run build`：通过；仅有既有 bundle size warning。  
现有测试命令：`package.json` 未定义测试脚本。

## 已知限制

服装多场景组图仍复用部分鞋履时代的软种草和棚拍计划；服装专属场景家族多样性、5/8 张镜头锁定、独立辅助搭配和自动场景硬阻止应在后续阶段按依赖顺序处理。
