# THERUIZ AURA Prompt Block 直接更新方案

> 文档性质：现有 Prompt 系统执行层更新
>
> 目标：把已确认的真实商业摄影感规则直接写入 THERUIZ AURA 当前生产 Prompt，不新建独立 Master Prompt
>
> 当前适用 Provider：Image2

---

## 1. 接入原则

本文件提供的是现有 Prompt Block 的替换与增量内容。

执行时必须：

- 保留当前 Brand Visual System Block；
- 保留当前 Product Truth Block；
- 保留当前主题级场景、穿搭、用途和产品重点；
- 保留 Reference Plan 与 Image2 Adapter；
- 将本文件中的 Block 合并至现有编译链路；
- 清理与新规则冲突的旧句子；
- 不把所有内容简单追加到 Prompt 尾部；
- 不重复表达相同约束；
- 不生成一条脱离系统的超长万能 Prompt。

建议编译顺序：

```text
1. Brand Visual System
2. Product Truth
3. Use Case / Theme Intent
4. Outfit / Styling
5. Scene
6. Human State
7. Action
8. Composition
9. Lighting and Camera Realism
10. Product Presentation
11. Physical Integrity
12. Negative and Risk Controls
```

---

## 2. Human State Block — 更新版

### 英文生产块

```text
Make the woman feel like a real mature urban person caught in a lived moment, not a mannequin, fashion dummy, plastic model, over-posed influencer, showroom character, or standard commercial model waiting for the camera. Prefer a natural side glance, downward gaze, slight turn, walking transition, arrival pause, or quiet moment between actions. Keep believable body asymmetry, relaxed shoulders, natural facial tension, realistic hair texture, a few subtle flyaway hairs, slight fabric movement, believable bag weight, natural hand position, and normal daily imperfection. Her expression should respond to the place or action rather than perform for the lens. Direct eye contact may appear occasionally when the theme genuinely needs it, but it must not be the default.
```

### 替换要求

删除或降级现有类似表达：

- always looking at camera；
- clear front-facing face；
- perfect calm smile；
- balanced symmetrical posture；
- polished model presence；
- flawless skin。

保留“真实人物、成熟、自然、非塑料模特”等现有有效要求，但避免重复。

---

## 3. Action Block — 更新版

### 英文生产块

```text
Give the action a clear everyday reason and capture one stable phase of that action. Prefer walking through an entrance, pausing briefly after arriving, preparing to continue forward, turning slightly near a doorway or architectural edge, adjusting a sleeve, coat hem, or bag strap with real contact, or shifting weight naturally before a step. The action must create believable weight distribution, garment tension, hand contact, and shoe-floor pressure. Avoid static poses disguised as natural movement and avoid foot placement arranged only to display the product.
```

### 动作装配要求

主题动作必须使用以下结构：

```text
[生活原因] + [动作阶段] + [身体重心] + [手部任务] + [鞋底接地]
```

示例：

```text
She has just stepped out of the gallery and pauses for a moment before continuing, with her weight settled on the front foot, one hand naturally adjusting the coat hem, and both shoes grounded according to the step phase.
```

不得只写：

```text
walking naturally
standing casually
adjusting sleeve
looking down
```

---

## 4. Composition Block — 更新版

### 英文生产块

```text
Use the visual language of real commercial lifestyle photography rather than a synthetic catalog composition. Prefer off-center framing, natural asymmetry, architectural framing, environmental layers, and a stable moment that feels observed rather than arranged. Allow a doorway, column, wall edge, glass panel, step, table edge, flowers, or a soft foreground element to interrupt the frame naturally without blocking essential Product Truth evidence. Keep a clear visual hierarchy; the face, outfit, shoes, and background must not all be equally dominant or equally sharp. Avoid centered full-body symmetry and rigid front-facing catalog layouts.
```

### 构图优先级

优先：

1. 三分构图；
2. 人物偏左或偏右；
3. 建筑结构形成前中后景；
4. 行动方向保留空间；
5. 一处自然遮挡或切割；
6. 鞋履仍保留必要可读性。

降级：

- 人物居中；
- 双脚平行对称；
- 双手等距垂落；
- 正面完整全身；
- 纯背景单主体。

---

## 5. Scene Block — 更新版

### 英文公共生产块

```text
Build a spatially real and functionally believable environment with clear architecture, natural movement routes, and a reason for the woman to be there. Favor building entrances, lobby thresholds, flower shop fronts, hotel entrances, gallery or bookstore circulation spaces, residential entry areas, quiet business-district walkways, and indoor-outdoor transitions. Use a small number of specific functional details instead of many decorative objects. Keep doors, floors, steps, glass, walls, furniture, signage, distant people, or vehicles logically placed and physically consistent. Avoid empty template sets and decorative lifestyle backgrounds with weak or ambiguous object details.
```

### 场景数据更新建议

现有场景库应直接调整权重：

```yaml
high_priority:
  - business_building_entrance
  - office_transition_walkway
  - flower_shop_front
  - hotel_entrance
  - residential_lobby
  - entry_threshold
  - gallery_circulation
  - bookstore_facade
  - urban_architectural_corner
  - indoor_outdoor_transition

medium_priority:
  - cafe_front
  - timber_interior
  - neighborhood_corner
  - entrance_mirror_area

low_priority:
  - seamless_studio_full_body
  - empty_minimal_interior
  - decorative_cafe_template
  - prop_heavy_wooden_space
```

字段名以项目现有 schema 为准，不应照抄并新建重复 schema。

---

## 6. Lighting and Camera Realism Block — 更新版

### 英文生产块

```text
Use natural and physically believable light with a clear source, realistic falloff, soft local shadows, and normal exposure differences across the space. Allow the face to sit slightly below the brightest area when appropriate, and allow indoor-outdoor brightness differences or mild tonal imbalance. Keep realistic material response: skin, hair, knitwear, leather, suede, glass, wood, and pavement should not share the same smoothness, sharpness, or reflectivity. Preserve subtle depth-of-field and edge softness where the lens would naturally create it, but do not hide anatomy or product errors through blur, noise, or low resolution.
```

### 必须移除的冲突语义

- evenly lit from head to toe；
- every detail perfectly visible；
- flawless soft light everywhere；
- uniform sharpness across the image；
- perfectly clean background lighting。

---

## 7. Product Presentation Block — 更新版

### 英文生产块

```text
Present the preserved sneaker as part of a believable worn look rather than a rigid product-display task. Do not arrange both shoes in a perfect symmetrical showcase position.
```

### 继续保留的 Product Truth 语义

```text
low-cut German trainer silhouette
rounded toe box
slim outsole
original panels
original tongue
original stitching
original material boundaries
original color blocking
original proportions
```

### 禁止新增的错误方式

- 通过遮挡鞋子降低结构风险；
- 通过运动模糊掩盖鞋型；
- 只显示鞋头或只显示鞋底；
- 允许第二只鞋失真；
- 用“生活感”覆盖 Product Truth 硬约束。

---

## 8. Physical Integrity Block — 更新版

### 英文生产块

```text
Match body weight to the selected action phase, with believable knee direction, hip balance, garment tension and folds corresponding to the movement, outsole pressure, and grounded contact shadow. Hands must make real contact with sleeves, bags, coats, doors, or furniture when the action requires it; do not use hovering or decorative hand gestures.
```

---

## 9. Negative and Risk Controls — 更新版

### 英文生产块

```text
Avoid overly centered composition, symmetrical full-body catalog posing, rigid front-facing stance, mannequin-like stillness, direct product-display foot placement, overly smooth skin, synthetic hair edges, identical sharpness across all materials, perfectly even lighting across face, outfit, shoes, and background, decorative but semantically weak objects, template-like cafe or studio environments, full-frame perfection, floating feet, weightless posture, hovering hands, garment-shoe fusion, duplicated shoe details, inconsistent left-right shoe structure, unstable laces, distorted outsole, generic catalog cutout, and artificial AI-style lifestyle-advertising perfection.
```

### 不得加入

- fake camera metadata；
- remove AI metadata；
- bypass detection；
- detector evasion；
- artificial JPEG degradation；
- random noise for concealment；
- deliberate blur to avoid review。

---

## 10. 主题级使用规则

### 10.1 棚内主题

棚内主题不得整体停用，但应调整：

- 减少纯正面居中完整站姿；
- 使用偏构图、轻微移动阶段、身体转向和真实重心；
- 背景允许合理渐变、空间边界或设备形成的轻微环境层次；
- 不要求人物从头到脚均匀受光；
- 保持产品图用途所需的清晰度，但不做无生命感 catalog 陈列。

建议附加句：

```text
Even in the studio, keep the moment observational and physically grounded rather than presenting a perfectly centered e-commerce mannequin pose.
```

### 10.2 街拍与生活方式主题

- 强制使用明确地点逻辑；
- 动作必须具备前后过程；
- 建筑与人物比例真实；
- 环境细节宁少而明确，不多而模糊；
- 可使用侧脸、低头或转头，但不得把所有主题都变成低头动作；
- 产品必须继续保持至少一只完整可读。

### 10.3 咖啡店与木质室内主题

必须附加：

```text
Use a small number of specific, functional, physically coherent objects. Do not fill shelves or tables with repeated, ambiguous, or decorative AI-generated clutter.
```

---

## 11. 旧规则冲突清理表

开发应搜索并处理以下旧语义：

| 旧语义 | 处理方式 |
|---|---|
| centered full-body composition | 删除默认要求，仅主题明确需要时保留 |
| direct eye contact | 从默认改为偶发可选 |
| both shoes fully and symmetrically visible | 改为至少一只完整、第二只清楚可读 |
| evenly lit face, outfit, and shoes | 替换为真实光源与自然明暗差 |
| clean minimal background | 加入真实空间结构和功能逻辑 |
| natural standing pose | 改写为有生活原因的动作阶段 |
| flawless skin / perfect hair | 删除 |
| all details sharp and clear | 改为明确视觉主次 |
| model posing elegantly | 改为人物处于真实生活状态 |

不能只追加新规则而保留相互冲突的旧要求。

---

## 12. Codex 直接执行指令

```text
在 THERUIZ AURA 当前项目内直接更新现有 Prompt 系统，不新建平行 Master Prompt。

1. 定位 THERUIZ AURA 当前 Active Prompt Registry、公共 Prompt Blocks、主题 Prompt 配置、场景库、动作库和 Image2 Prompt 编译入口。
2. 保留 Active Visual System、Product Truth、Reference Plan、Image2 Adapter 和现有主题差异。
3. 按《THERUIZ_AURA_Anti_AI_Rule_Update.md》更新人物、动作、构图、场景、光线、产品展示和风险控制规则。
4. 使用《THERUIZ_AURA_Prompt_Block_Update.md》中的生产块替换现有冲突块；不得简单在 Prompt 尾部重复追加。
5. 清理 centered full-body、direct eye contact、symmetrical shoe display、evenly lit、flawless skin、all details sharp 等冲突默认语义。
6. 更新动作优先级：从静态姿势改为有生活原因和动作阶段的过程动作。
7. 更新场景优先级：提高楼宇入口、过渡步道、花店、酒店入口、住宅大堂、门厅、展馆、书店和室内外连接空间；降低无缝棚拍、空白极简室内、模板咖啡店和小摆件密集场景。
8. 保持至少一只鞋完整可信、第二只鞋清楚可读；不得通过遮挡、模糊或降质解决问题。
9. 所有 THERUIZ AURA 专属规则保持品牌隔离，不写入其他品牌全局默认逻辑。
10. 不增加检测规避、元数据伪造、人工噪点或故意降质逻辑。
11. 修改完成后输出：修改文件列表、旧规则清理项、新 Block 接入位置、场景与动作权重变化、是否存在未解决冲突。
```

---

## 13. 完成状态要求

完成后应形成以下生产行为：

- 人物默认不再正面居中直视镜头；
- 动作默认具有生活原因和真实过程阶段；
- 构图默认更偏、非对称且有空间层次；
- 场景默认更具体、更有建筑和功能逻辑；
- 光线保留自然明暗差和材质差异；
- 产品从陈列式展示转为真实穿着中的高可读呈现；
- Product Truth、Active Visual System 与 Image2 路径保持完整；
- THERUIZ AURA 专属规则不污染其他品牌。
