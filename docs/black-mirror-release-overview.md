# Black Mirror release overview

Black Mirror 是 prompt-only 的本地工具，支持鞋履模式与服装模式。鞋履模式保留 THERUIZ AURA 品牌和原有鞋型保护；服装模式支持本地服装参考图、品类字段、场景兼容、服装组图、服装主题内容和准确性保护。

当前支持：单张 Prompt、3/5/8 张组图、服装 3/5/8 镜头计划、Phase 2 系列连续性、服装原生主题内容、按图片类型拆分的准确性与负面规则，以及单张/全部复制。参考图只在当前浏览器会话中预览，刷新后需要重新选择。

本项目不接入 Image 2.0 API、图片生成 API、后端、数据库、登录、额度、远程图片上传或自动产品识别。用户复制 Prompt 后手动将参考图和 Prompt 交给 Image 2.0。

已知限制：模型无法保证小字、Logo、复杂蕾丝、刺绣和珠片完全准确；缺少背面参考图不能保证背面结构；Prompt 只能降低变形风险，不能提供工业级复制保证。

详细记录：`black-mirror-phase1-stability-patches.md`、`black-mirror-garment-series-continuity.md`、`black-mirror-garment-shot-plans.md`、`black-mirror-garment-content-themes.md`、`black-mirror-garment-accuracy-guards.md`、`black-mirror-phase6-release-acceptance.md`。
