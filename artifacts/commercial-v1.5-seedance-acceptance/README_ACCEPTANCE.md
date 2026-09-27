# Commercial Film V1.5 Seedance 人工视觉验收说明

本目录中的三个 `case-*.txt` 均直接来自当前 Commercial Film V1.5 pipeline 的
model-facing execution compiler，未手工改写脚本文字。

## 1. 每个 Case 测什么

### Case A — HOME THRESHOLD

隔离测试门的 single-use 状态与人物内外空间连续性：

- 门只解锁一次
- 门只打开一次
- 人物穿越门槛后留在门内
- 不发生无因空间重置
- 不发生重复开门

Case A 使用当前真实的 `NEW_ARRIVAL` intent：人物从外部接近门槛，完成一次进入，
之后留在到达空间。锁/解锁由 `UNLOCK_THRESHOLD` 结构化状态动作表达，不引入额外道具。

### Case B — BUS MICRO DECISION

隔离测试 Micro Decision commitment：

- 公交先到
- 她没有上车
- “不坐”必须是画面可理解的行为
- 公交在决定完成后离开
- 公交离开后不重新出现
- 她最后才继续步行
- 产品不产生额外的停下摆姿势动作

Case B 使用当前真实的 `URBAN_MOTION` intent，通过可选 Micro Decision contract
叠加公交场景。公交到达/离开状态记录在 `case-b-micro-decision.json` 与
`case-b-state.json` 的 microDecision 场景时间线中。

注意：基础影片的动作文字仍是 `URBAN_MOTION` 的城市步行节奏；公交站决策故事由
Decision setup / Visible consequence / Decision continues 三段正式编译输出承载。
固定模板不生成“其他乘客上车”这一画面细节，验收时以脚本中明确出现的公交到达、
她停留、公交离开、她继续步行为准。

### Case C — PURE CONTINUOUS WALK

证明 5 个 narrative beats 不等于 5 个 Takes：

- 普通城市步行
- 轻微路线调整
- 地面/路面变化
- 自然身体调整
- 继续步行

Case C 使用当前真实的 `URBAN_MOTION` intent，最终必须恰好 1 Take。

## 2. 上传 Seedance 时需要的产品参考图要求

- 三个 Case 的脚本均使用外部参考模式，不发明产品事实。
- 上传当前任务确认过的 THERUIZ AURA 鞋款参考图，覆盖正面、侧面、材质/颜色、
  鞋型轮廓、鞋底与鞋头结构等可用角度。
- Seedance 只能以这些上传图为产品真值，不得改写鞋型、颜色、材质、比例或构造。

## 3. 不要修改最终脚本文字

- 每个 `case-*.txt` 是当前 pipeline 的正式 model-facing compiled output。
- 验收时必须原样使用，不能删改 Continuity Lock、Decision、Camera 或 Timing 段落。
- 发现脚本问题应回到代码层修复，不应在 Seedance 输入框手工重写 Prompt。

## 4. 每 Case 生成至少 2 个版本

每个 Case 至少生成两个 Seedance 版本，用于排除单次模型偶然结果。
建议记录：Seedance 模型与版本、每次尝试编号、参考图集、生成参数，以及每个版本的
人工判定。只有真实视频证据可以产生 PASS，Prompt 静态检查不能冒充视觉通过。

## 5. 成片应该人工观察哪些错误

每个 Case 的逐条 PASS / MINOR / FAIL 条件和 `observedFailure` 字段见
`HUMAN_VISUAL_ACCEPTANCE_RUBRIC.md`。重点观察：

- 已完成动作是否被重复执行
- 人物空间位置是否无因果重置
- 门/公交/道具状态是否前后冲突
- 是否把 5 个 beat 生成了 5 个独立镜头
- Micro Decision 是否只有文案、没有可见结果
- 产品是否造成多余停顿、独立特写或 Hero pose

视觉状态在本阶段只能是 `NOT_VERIFIED`，未提交真实成片前不得写 `E2E VERIFIED`。
