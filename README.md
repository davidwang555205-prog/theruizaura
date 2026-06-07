# THERUIZ AURA Prompt Builder

THERUIZ AURA Prompt Builder 是一个本地提示词生成工具，用于生成结构化生图提示词。

## 前台字段

- 图片类型
- 鞋款
- 季节
- 场景偏好
- 服装类型
- 补充要求

## 核心能力

- 结构化 prompt：时间 / 地点 / 人物 / 穿着 / 场景 / 氛围 / 动作 / 负面词
- 鞋型保护：保持 THERUIZ AURA 低帮德训鞋结构，避免变跑鞋、厚底鞋或滑板鞋
- 人物比例稳定：控制拉腿、小头、大手、镜拍变形和鞋脚比例
- 穿搭智能选择：根据场景、鞋款、季节、城市、图片类型和服装类型自动匹配穿搭
- 全服装类目多样性检查：自动检查 topCategory、bottomCategory、outerLayerCategory、bagCategory、accessoryCategory、dress、skirt、lightActive 等类别是否过度重复
- 城市 / 四季 / 室内外光线：自动区分中国城市街景、四季照片风格和不同空间光线
- 场景相机质感自动切换：根据图片类型、场景、季节、城市和室内外光线自动选择 Leica / Hasselblad / Fujifilm / Sony 中的一种相机质感
- 单一主手持物：每张人物图最多一个主手持物
- 配饰智能选择：不默认每张图都有包，noAccessory 和 wearableOnly 都是合法结果
- 敏感词与词汇替换：最终 prompt 会自动替换高风险或易歧义表达

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

- 不默认每张图有包，包袋只在场景需要时出现。
- 每张人物图最多一个主手持物。
- 静物图不输出人物和动作。
- 对镜图手机为主手持物。
- 最终 prompt 不输出 opening / pants / lower body。
- 系统会对 jeans / denim、stone grey Bermuda shorts、white shirt、cream knit、white oversized shirt、cream midi skirt、cream shirt dress、小黑包、tote 等常见重复项加入惩罚；裤装、短裤、裙装、连衣裙、外套、轻运动、包袋和轻配饰会根据场景自动轮换。
- Leica 用于真实城市街拍和上脚生活图；Hasselblad 用于产品静物、材质微距和高级质感画面；Fujifilm 用于柔和日常、对镜、书店、咖啡和轻生活场景；Sony 用于现代清晰、商业室内、健身房、深圳现代街区、动态生活和干净电商图。每次最终 prompt 只输出一种相机质感，避免多相机风格冲突。
