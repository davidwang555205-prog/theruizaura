# Commercial Film V1.5 Seedance 人工视觉验收说明 V2

V2 与 V1 的唯一变化是最终 model-facing 摄影结构：最终脚本现在由
`CommercialTakePlan` 驱动，以 `TAKE` 为最高层，内部只写 chronological `BEAT`。
State Engine、structured input、State Contract、Micro Decision 与 TakePlan 均未改变，
可与 V1 包做 A/B 对比。

## 1. 每个 Case 测什么

### Case A — HOME THRESHOLD

门/门槛 single-use 状态与内外连续性：

- 解锁一次
- 打开一次
- 人物进入后留在门内
- 不发生无因空间重置
- 不重复解锁/开门

Case A 使用真实 `NEW_ARRIVAL` intent。Take 2 开头的
`START STATE INHERITED FROM PREVIOUS TAKE` 来自上一个 Take 的 structured final state，
用于防止模型在新 Take 中重新初始化门和人物。

### Case B — BUS MICRO DECISION

Micro Decision commitment 与视觉顺序：

- 公交先到
- 她留在原地，不上车
- 决定可被画面理解并 committed
- 公交在决定 committed 后离开
- 公交离开期间她不开始 continuation
- 公交明确离开后她才转身继续步行

V2 脚本包含 `[DECISION SEQUENCE]`，用
`ONLY AFTER → WHILE → UNTIL → ONLY THEN` 锁定时间顺序。

### Case C — PURE CONTINUOUS WALK

5 个 narrative beats 必须编译成 exactly 1 Take：

- 普通城市步行、路线调整、地面变化、自然身体调整、继续步行
- 不出现门/车/公交/手机/包交互/座位/门店/门槛
- 不出现独立鞋特写、Hero stop、DETAIL cut

V2 最终脚本只有一个 `TAKE 1 — ONE CONTINUOUS SHOT` heading，
没有 `SHOT 1–5` 顶层结构，也没有 WORLD/WEAR/DETAIL/HERO/RELEASE 角色词。

## 2. 上传 Seedance 时需要的产品参考图要求

- 三个 Case 均使用外部参考模式，不发明产品事实。
- 上传当前任务确认过的 THERUIZ AURA 鞋款参考图，覆盖正面、侧面、材质/颜色、
  鞋型轮廓、鞋底与鞋头结构等可用角度。
- Seedance 只能以上传图为产品真值，不得改写鞋型、颜色、材质、比例或构造。

## 3. 不要修改最终脚本文字

- 每个 `case-*.txt` 是当前 pipeline 的正式 model-facing compiled output。
- 必须原样使用，不得删改 `TAKE / BEAT / DECISION SEQUENCE / CONTINUITY LOCK /
  FINAL STATE CLOSURE` 等段落。
- 发现脚本问题应回到代码层修复，不应在 Seedance 输入框手工重写 Prompt。

## 4. 每 Case 生成至少 2 个版本

每个 Case 至少生成两个 Seedance 版本。建议记录：Seedance 模型与版本、尝试编号、
参考图集、生成参数，以及每个版本的 PASS / MINOR / FAIL。只有真实视频证据可以产生
PASS，Prompt 静态检查不能冒充视觉通过。

## 5. 成片应该人工观察哪些错误

重点观察：是否把 1 Take 拍成多摄影段、是否在 BEAT 间 cut 或重置机位、是否重新初始化
门/公交/道具状态、Micro Decision 的 consequence 与 continuation 是否重叠、
是否在 final state 后新增坐下/看窗外/拿东西等无脚本动作。逐条标准见
`HUMAN_VISUAL_ACCEPTANCE_RUBRIC_V2.md`。
