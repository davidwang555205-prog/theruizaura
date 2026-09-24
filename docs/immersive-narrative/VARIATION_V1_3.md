# Immersive Narrative Variation V1.3 (in progress)

## Status

```text
变体机制（variantSeed）        IMPLEMENTED（UI 无选择器，点「重新生成」自动推进）
变体池                         4 / 13 Topics（下班回家 · 午后咖啡 · 采购归来 · 短途出行，各 2 变体）
双路线选择（routeId）          NOT STARTED
季节/生活感深化（受限版）       NOT STARTED
矩阵 validator                 已并入 npm run validate:narrative-director-script
```

## 变体机制（已实现）

```text
src/immersive-narrative/catalog.ts    NarrativeArchetype.alternateMoments?: ((context) => NarrativeMomentDraft[])[]
src/immersive-narrative/planner.ts    variants = [moments, ...alternateMoments];
                                      variantIndex = |variantSeed| % variants.length
                                      NarrativePlan.variantSeed 记录实际选中的变体
src/immersive-narrative/pipeline.ts   ImmersiveNarrativeRequest.variantSeed 透传
UI                                    无选择器：点「重新生成」时 variantSeed + 1 并立即重新生成
                                      Topic 切换时 variantSeed 归零（-1 → 首次生成 = 变体 1）
                                      摘要行显示当前「变体 N」
```

同 seed → 逐字节相同；不同变体必须互不相同（validator 断言）。

## 变体纪律（本轮实证）

变体是文本驱动的：改一句就会改变 `completionBoundary / spatialAnchor / goalProgress`，
并立即影响 Physical Action、Camera、Sound、Execution Compiler 与导演脚本。

本轮两条实证（均已修好并保留在矩阵里）：

```text
① 下班回家 首个候选变体（M3 “keeps looking inside the bag” / M4 “unlocks it”）
   → Execution Compiler 判 NOT_EXECUTABLE_UNSAFE_CONTINUATION
   （object_search 需要 “searching inside the bag / looks inside the bag”；
     door_contact 需要出现 “door”）
   → 改写为 “looks inside the bag for another second” + “unlocks the door” 后通过

② 午后咖啡 首个候选变体 M5 “steps aside … the search is over”
   → natural_ending 门禁要求结尾动词在既有白名单内（continues/steps into/…/settles/…）
   → 改为 “steps aside … and settles; the search is over.” 后通过
```

结论：**每个变体都必须按既有能力词表撰写**，并通过 13×N 矩阵全量门禁后才能启用。

## 当前可用变体

```text
下班回家  变体 2 = 电梯→走廊→门口（begins searching / looks inside … another second /
                  finds the key + unlocks the door）→ 玄关
午后咖啡  变体 2 = 进店→柜台（begins reaching for the usual pocket / checks the pocket once more /
                  finds the card + closes the pocket）→ settles; the search is over
采购归来  变体 2 = 电梯→走廊→门口（bag handle shifts / moves the bag to the other hand /
                  reaches for the door + turns the key）→ 玄关
短途出行  变体 2 = 社区步道（checks the small item / settles it securely / last few steps）→ 写字楼门口
四个 Topic 的两个变体均：Narrative APPROVED · Scene APPROVED · Director Script VALIDATED · EXECUTABLE
```

## 后续顺序

1. 按既有能力词表补写其余 9 个 Topic 的变体（周末独处 / 出门办事 / 等朋友 / 逛书店 / 接孩子后 / 周末散步 / 午餐之后 / 城市闲逛 / 傍晚回家），并让矩阵 validator 全绿。
2. 双路线：`topic-catalog` 声明 route（标签集 + anchor 序列），`location-worlds.ts` 增加 route override
   （例如 HOME_ARRIVAL 增加 `lifestyle-residential-building-exit` 以支持“楼外 → 门口 → 玄关”路线 B）。
3. 季节：先做“措辞 + 光线”的受限版（现有 `seasonClause` 即可复用）；
   涉及新道具/新动作/新声场的部分（伞、暖手、雨声）需要先解冻 Physical Action capability 与
   Sound taxonomy，否则会产生 UNRESOLVED 或 UNSUPPORTED sound。

## Not changed

```text
Existing 318 Actions · Evidence Guard · Narrative Primitive Registry ·
Scene Library · Commercial Film · legacy Lifestyle · V1/V1.1/V1.2 语义
```
