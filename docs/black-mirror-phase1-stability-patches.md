# Black Mirror Phase 1 stability patches

本阶段只处理 P01、P03、P05、P08，未接入 API、后端或图片上传服务。

## P01 — 双草稿

App 现在保留独立的 `shoeDraft` 与 garment 草稿。生成时通过当前 `productMode` 构造 active `productContext`；鞋履旧字段仍用于兼容，服装不会从鞋履回退读取主产品。

## P03 — 服装场景兼容

服装场景下拉框使用 `getCompatibleGarmentScenes`。品类、季节和图片类型改变时，当前不兼容场景会恢复为“自动匹配”；鞋履模式继续使用原有场景列表。

## P05 — 辅助搭配隔离

服装模式绕过 legacy full-outfit selector，主服装由 garment adapter 固定，辅助搭配边界由服装保护规则提供。鞋履模式继续使用原有 outfit selector。

## P08 — 唯一正面参考图

参考图仍使用稳定 ID。重新分配 `front` 时，旧 front 自动变为 detail；正式生成要求 4–5 张且恰好一个 front。文件输入仍会重置，允许重新选择同一文件。

## 验证

`npm run typecheck` 和 `npm run build` 均通过，build 只有既有 bundle size warning。未提交、未推送。组图连续性、服装主题文案和完整 5/8 张服装棚拍计划不在本阶段范围内。
