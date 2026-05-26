# THERUIZ AURA Prompt Builder

这是一个 THERUIZ AURA 本地提示词生成工具，用于在本机生成产品图、模特图、非产品氛围图和拍摄花絮图的生图提示词。

## 本地启动

1. 安装依赖：

```bash
npm install
```

2. 启动本地网页：

```bash
npm run dev
```

3. 在浏览器打开：

```text
http://localhost:5173
```

## 使用流程

1. 选择模式：产品图 / 模特图，或非产品氛围配图
2. 选择提示词详细程度、鞋款、材质、色彩、季节、年龄段、场景、动作等参数
3. 点击生成提示词
4. 复制最终提示词
5. 打开 image2.0 / GPT Image / Midjourney 等生图工具
6. 上传鞋子参考图
7. 粘贴提示词生成图片

## 提示词详细程度

本工具支持三种提示词详细程度：

- Compact：推荐真实生图使用，短而集中
- Standard：适合重点产品图
- Full Debug：适合排查鞋型、穿模、镜拍、人物比例等问题

默认使用 Compact，避免提示词过长导致生图模型抓不到重点。

## 生成结果验收

本工具支持：

- Visual Output Scorecard：对生成结果做标准化评分
- Failure Diagnosis：生成失败后快速判断原因并给出下一次修正建议

推荐流程：

1. 先用 Compact 生成
2. 如果出问题，切换 Standard
3. 如果仍有结构问题，切换 Full Debug 排查

## 注意

- 本工具只生成提示词，不调用任何生图 API。
- 本工具默认本地使用，不需要部署。
- 我的模板会保存在当前浏览器 localStorage 中。
- 如果更换浏览器或清理缓存，自定义模板可能会丢失。
