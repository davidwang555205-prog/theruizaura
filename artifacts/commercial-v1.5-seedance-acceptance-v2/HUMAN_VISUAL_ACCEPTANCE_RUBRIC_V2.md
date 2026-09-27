# Commercial Film V1.5 人工视觉验收表 V2

每条只能填写 `PASS`、`MINOR` 或 `FAIL`。出现 `FAIL` 或 `MINOR` 时必须在
`observedFailure` 写明真实画面证据。禁止用 Prompt 静态检查推导视觉 PASS。

## CASE A — HOME THRESHOLD

| 编号 | 检查项 | 判定 |
| --- | --- | --- |
| A1 | 门只解锁一次 |  |
| A2 | 门只打开一次 |  |
| A3 | 人进入后不回到门外 |  |
| A4 | 门方向不变化 |  |
| A5 | 人物空间运动连续 |  |
| A6 | Take 2 未重新初始化门/锁/人物位置 |  |
| A7 | final state 后没有新增坐下、看窗外等动作 |  |

observedFailure:

## CASE B — BUS MICRO DECISION

| 编号 | 检查项 | 判定 |
| --- | --- | --- |
| B1 | 公交先到 |  |
| B2 | 她没有上车 |  |
| B3 | “不坐”是画面能理解的行为 |  |
| B4 | 公交只在决定 committed 后离开 |  |
| B5 | 公交离开时她保持不动，没有同时开始 continuation |  |
| B6 | 公交离开后不重新出现 |  |
| B7 | 公交明确离开后她才继续步行 |  |
| B8 | 产品没有造成额外动作 |  |

observedFailure:

## CASE C — PURE CONTINUOUS WALK

| 编号 | 检查项 | 判定 |
| --- | --- | --- |
| C1 | 整体只有一段连续摄影运动 |  |
| C2 | 没有五段式重新初始化 |  |
| C3 | 没有为了鞋突然停下来 |  |
| C4 | 没有独立鞋特写 |  |
| C5 | 没有 Hero pose |  |
| C6 | 城市方向与人物运动轴连续 |  |
| C7 | BEAT 边界没有表现为 cut / 新机位 |  |

observedFailure:

## 记录头

每个版本必须记录：

- caseId
- Seedance model / version
- attempt number
- reference set id
- generation parameters
- reviewer
- review date

未记录这些元数据的 `PASS` 不得进入最终验收记录。
