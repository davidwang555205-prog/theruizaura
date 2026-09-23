# Immersive Narrative Final User UI V1

## Status

```text
Final UI V1     IMPLEMENTED
Generate         PASS
View full script PASS
Copy full script PASS
Debug collapsed  PASS
1600 / 1280 / 390 PASS
```

The workspace is `src/immersive-narrative/ImmersiveNarrativeWorkspace.tsx`,
mounted as the 沉浸叙事 page in `src/App.tsx`.

## Primary controls

```text
Topic               13 canonical Topics, no aliases, no expansion
年龄阶段             6 Age profiles
人物外观             3 Appearance groups
Season               春 / 夏 / 秋 / 冬
Lifestyle Feeling    current free-text behaviour (unchanged)
Duration             15 s — the only validated V1 duration, shown read-only
```

## Primary action

```text
生成代入感视频脚本
```

The output is generated on demand, not silently in the background. When the
inputs change after a generation, the output area shows 设定已更新，可重新生成.

## Output area

```text
Generated Script       完整 Seedance script, scrollable preview
查看完整脚本 / 收起脚本  toggles the full text (no inner scroll limit)
复制完整脚本            copies the whole script and reports 已复制完整脚本。
重新生成                regenerates deterministically from the current inputs
Moment 概览             5 Moment cards with Physical Action and Camera status
```

No Provider selector, API status, model credential, or E2E provider control
exists in this surface. THERUIZ AURA stays an external-script workflow.

## Final script binding (canonical source)

The user-facing final artifact always comes from the Phase 8 Seedance Compiler:

```text
canonical field   ImmersiveSeedanceScript.compiledText
produced by       compileImmersiveSeedanceScript  (src/immersive-narrative/seedance-compiler/compiler.ts)
reached through   runImmersiveNarrativePipeline    (result.script.compiledText)
```

Preview, 查看完整脚本, and 复制完整脚本 all read one single canonical value
(`finalCompiledSeedanceScript`) taken from that field. The UI never re-assembles
a script: it does not rebuild Narrative, Scene, Camera, or Action text.

```text
Generated Script preview        generated.script.compiledText
查看完整脚本 / 收起脚本           same canonical value (display only)
复制完整脚本                     same canonical value (clipboard)
```

The Narrative Planner output is a **different** field and stays Debug-only:

```text
NarrativePlan.compiledText      [NARRATIVE CORE] · [MOMENT CHAIN] · [NARRATIVE QC]
                                … Narrative Status: APPROVED FOR SCENE RESOLUTION
                                Debug / Internal → Narrative Planner
                                复制 Narrative Plan（Debug 中间输出）
```

Fail-closed guard: before the script is shown or copied, the canonical value must
start with the Seedance script header, contain `[GLOBAL INTENT]` and
`[FINAL ENDING STATE]`, and contain none of the Narrative Planner markers
(`[NARRATIVE CORE]`, `[MOMENT CHAIN]`, `[NARRATIVE QC]`,
`APPROVED FOR SCENE RESOLUTION`). If that ever fails, the UI shows
最终脚本绑定异常 and blocks view/copy instead of exposing an intermediate result.

### Binding verification

```text
tests/e2e/immersive-narrative-final-ui.spec.ts → final script binding
  逛书店      preview = view = clipboard = compiler output (byte-identical)
  城市闲逛    preview = view = clipboard = compiler output (byte-identical)
  傍晚回家    preview = view = clipboard = compiler output (byte-identical,
              CORRECT_UNSUPPORTED preserved as written by the compiler)

each case asserts the clipboard equals the canonical output computed directly by
runImmersiveNarrativePipeline, and is NOT the Narrative Planner text
([NARRATIVE CORE] / [MOMENT CHAIN] / [NARRATIVE QC] / APPROVED FOR SCENE RESOLUTION)

binding probe   dev server (vite dev)   COMPILER OUTPUT
binding probe   production build (vite preview of dist/)   COMPILER OUTPUT
```

Compiler, Narrative, Scene, Action, and Camera semantics were not changed by this
binding work.

## Debug / Internal

Collapsed by default. Expanded, it exposes every current development surface:

```text
Character Profile        catalog QC
Narrative Planner        intermediate output + 8 QC gates + 复制 Narrative Plan（Debug 中间输出）
Scene Resolver           resolved Moments + 4 QC gates
Product Presence         curve + 4 QC gates
Sound World              cues + silence level + 4 QC gates
Camera Narrative Role    roles + 4 QC gates
Physical Action          coverage, selection reasons, stride phase,
                         Eligibility Trace (verdicts, same-object exceptions,
                         rejected unsupported capabilities)
Camera Execution         continuity counters, per-Moment execution,
                         unsupported reasons, 11 QC gates
Compiler Diagnostics     stage statuses, consumed sections, unsupported
                         indexes, every compiler check
Input · Scene Library    available scene set used by the Scene Resolver
```

Nothing was deleted; the whole internal surface is available but visually
secondary.

## Blocked input behaviour

An empty Scene Library blocks the Narrative Planner. The output area then shows
无法生成脚本 with the real reason, no script is produced, and no silent fallback
is applied.

## Verification

```text
tests/e2e/narrative-planner.spec.ts              6 / 6 PASS
tests/e2e/immersive-narrative-final-ui.spec.ts   7 / 7 PASS
viewports                                        1600 / 1280 / 390, no horizontal overflow
```

The Final UI suite asserts the six primary controls, the single primary action,
the empty state, the full script structure (all 14 section families, five Moment
blocks, no Provider vocabulary), the view-full-script toggle, the copy
confirmation, the regenerate action, the collapsed debug default, the honest
`CORRECT_UNSUPPORTED` rendering, and the responsive layout at all three widths.

## Git

```text
Git              UNAVAILABLE
Observed error   fatal: not a git repository: (null)
```
