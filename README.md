# Black Mirror

Black Mirror 是一个 prompt-only 的本地工具，用于生成结构化英文 Image 2.0 提示词。鞋履模式中的 THERUIZ AURA 仍是品牌名；服装模式用于上传服装参考图、规划场景并复制 Prompt。

## 本地开发

```bash
npm install
npm run dev
```

验证命令：`npm run typecheck`、`npm run build`、`npm run verify:release`。

本项目不接入 Image 2.0 API、图片生成 API、后端或远程图片上传。参考图只在当前浏览器会话中本地预览。

更多架构与验收记录见 `docs/` 下的 Phase 1–6 文档。

## 前台字段

- 图片类型
- 鞋款
- 季节
- 场景偏好
- 服装类型
- 补充要求

## v1.0 核心能力

- 结构化 prompt
- 鞋型保护
- 人物比例稳定
- 鞋子上脚比例稳定
- 中国城市 / 四季 / 室内外光线
- 简化版穿搭选择
- 服装类目多样性
- 配饰智能选择
- 单一主手持物
- 相机质感自动切换
- 敏感词与词汇替换
- finalPromptSafetyCheck

## 本地使用

```bash
npm install
npm run dev
npm run build
```

本地打开：

```text
http://localhost:5173
```

## 注意事项

- 不默认每张图有包。
- 每张人物图最多一个主手持物。
- 静物图无人物。
- 对镜图手机为主手持物。
- 最终 prompt 不输出 opening / pants / lower body。
- 每次只输出一种相机质感。
- v1.0 不使用复杂评分系统。
