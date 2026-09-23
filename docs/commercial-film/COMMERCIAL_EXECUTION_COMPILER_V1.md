# COMMERCIAL EXECUTION COMPILER V1

## 责任

Commercial Execution Compiler 只消费已经通过 QC 的 `CommercialFilmPlan`。它不会重新规划产品事实、镜头、动作或场景。

## Internal Commercial Script

```text
[COMMERCIAL PLAN]
[PRODUCT MESSAGE]
[SHOT PLAN]
[CAMERA PLAN]
[SOUND PLAN]
[REFERENCE STATE]
```

Internal Script 用于 Debug，不能作为最终复制给 Seedance 的产物。

## Model-Facing Commercial Script

```text
SEEDANCE — THERUIZ AURA COMMERCIAL FILM

[COMMERCIAL INTENT]
[PRODUCT MESSAGE]
[CHARACTER & WORLD]
[VISUAL CONTINUITY]

[SHOT 1 — WORLD]
Time
Action
Camera
Product
Continuity

[SHOT 2 — WEAR]
...

[SHOT 3 — DETAIL]
...

[SHOT 4 — HERO]
...

[SHOT 5 — RELEASE]
...

[GLOBAL PRODUCT PROTECTION]
[CAMERA RULES]
[DO NOT]
[ENDING]
```

## Final Script Contract

模型脚本：

- 不包含 Action ID；
- 不包含 QC；
- 不包含 enum；
- 不包含 validator；
- 不包含 source ID；
- 不包含 internal plan marker；
- 不包含 Narrative Core / Moment / Product Presence / Camera Narrative Role；
- 只描述自然、直接、可执行的动作、镜头、光线、声音与产品保护；
- 在 0.0-15.0 秒内连续覆盖五个 Shot；
- 不假设 Provider API、Credential、Endpoint 或 Model ID。

## Validation

`validate:commercial-execution-compiler` 对五个 Intent 逐项执行：

- final header；
- 5 个 shot block；
- required shot fields；
- Product Message binding；
- timeline coverage；
- no internal marker leakage；
- no Action ID leakage；
- no QC / enum / validator leakage；
- no Narrative language leakage；
- deterministic compilation。

## Status Boundary

`COMMERCIAL_EXECUTION_VALIDATED` 表示本地静态编译和契约验证通过。

它不代表：

- Seedance Provider 已调用；
- 参考图已自动上传；
- 真实视频已生成；
- 最终成片已做人工视觉 E2E。

当前系统保持 Manual / Draft execution，Provider dependency 为 `NONE`。
