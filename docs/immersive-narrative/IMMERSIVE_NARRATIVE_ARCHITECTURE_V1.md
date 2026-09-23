# THERUIZ AURA Immersive Narrative — Final Architecture V1

## Final Project Status

```text
THERUIZ AURA IMMERSIVE NARRATIVE VIDEO SCRIPT SYSTEM V1 COMPLETE

Phase 1      COMPLETE    Narrative Planner
Phase 2      COMPLETE    Scene Resolver
Phase 2.5    COMPLETE    Scene Coverage
Phase 3      COMPLETE    Product Presence
Phase 4      COMPLETE    Sound World
Phase 4.5    COMPLETE    Topic Catalog
Phase 5      COMPLETE    Camera Narrative Role
Phase 5.5    COMPLETE    Character Profile
Phase 6      COMPLETE    Physical Action Compiler
Phase 7      COMPLETE    Camera Execution
Phase 8      COMPLETE    Seedance Script Compiler
Phase 9      COMPLETE    Final User UI
```

## Acceptance Rule

The final V1 acceptance rule is:

```text
All in-scope Immersive Narrative validators must PASS.
Legacy behavior must remain unchanged.
```

A non-PASS legacy validation result may be accepted only when it is
**A. a demonstrably pre-existing baseline failure** or **B. an intentional
compatibility exception required to preserve an approved legacy contract**, and
the exception is explicitly documented here.

Historical facts are not rewritten: V1 does **not** claim that every validator
passed. The two accepted legacy validation results are recorded as exceptions in
"Accepted V1 Validation Exceptions".

## Pipeline

```text
User Controls (Topic · Character · Season · Lifestyle Feeling · Duration 15 s)
        ↓
Narrative Planner V1          what happens, causally, in one small life sequence
        ↓
Scene Resolver V1             which real scene carries each Moment
        ↓
Product Presence Curve V1     ABSENT · INCIDENTAL · READABLE · HERO (readability guard only)
        ↓
Sound World V1                ENVIRONMENT · HUMAN · OBJECT · FOOTWEAR · SILENCE
        ↓
Camera Narrative Role V1      how the camera relates to the person
        ↓
Physical Action Compiler V1   318 Existing Actions + 9 Narrative-only primitives
        ↓
Camera Execution V1           how the camera physically executes that relationship
        ↓
Seedance Compiler V1          one coherent copyable external-model script
        ↓
Final UI                      view · copy · regenerate
```

Single integration entry point: `runImmersiveNarrativePipeline`
(`src/immersive-narrative/pipeline.ts`). The UI, the validators, and the final
report all read the same path; no downstream stage re-plans an upstream stage.

Canonical final artifact for the user:

```text
ImmersiveSeedanceScript.compiledText   produced by compileImmersiveSeedanceScript (Phase 8)
                                       reached through result.script.compiledText
                                       consumed by the Generated Script preview,
                                       查看完整脚本, and 复制完整脚本 — one single value

NarrativePlan.compiledText             intermediate Narrative Planner output
                                       Debug / Internal only, never the final script
```

## Module map

```text
src/immersive-narrative/types.ts                       Narrative Plan contracts
src/immersive-narrative/planner.ts                     Narrative Planner V1
src/immersive-narrative/topic-catalog/                 13 canonical Topics
src/immersive-narrative/character-profile/             6 Age profiles · 3 Appearance groups
src/immersive-narrative/scene-resolver/                Scene Resolver V1
src/immersive-narrative/product-presence/              Product Presence Curve V1
src/immersive-narrative/sound-world/                   Sound World V1
src/immersive-narrative/camera-role/                   Camera Narrative Role V1
src/immersive-narrative/physical-action/               Physical Action Compiler V1
src/immersive-narrative/camera-execution/              Camera Execution V1
src/immersive-narrative/seedance-compiler/             Seedance Script Compiler V1
src/immersive-narrative/pipeline.ts                    shared integration path
src/immersive-narrative/ImmersiveNarrativeWorkspace.tsx Final user UI + Debug / Internal
```

## Canonical Moment identity

`NarrativeMoment.index` is the single key that joins every stage. Re-ordering an
upstream array cannot silently re-identify a Moment, and all four unresolved
Physical Action Moments keep their canonical index, their rejected primitive
trace, and their `CORRECT_UNSUPPORTED` camera state.

## Status vocabulary

```text
PASS                  the stage approved and its contract holds
CORRECT_UNSUPPORTED   the stage correctly refuses to produce output
                      (no fabricated action, camera, or script text)
FAIL                  the stage contract is violated
GENERATED             the final script was compiled and validated
BLOCKED               an upstream stage refused to approve
```

## Measured system result

```text
Existing Actions                    318
Modified                              0
Narrative Primitives                  9
Physical Action Moments              65
Matched                              61
Correct Unsupported                   4
Coverage                          93.8 %
Existing Action Selected             43
Narrative Primitive Selected         18
Known Misassignments                  0
Unsupported Extra Selected            0
Unchecked Primitive Capability        0
Invalid Same-Object Exception         0
Synthetic Composition                 0
Automatic Composition                 0

Camera Execution                     13 / 13 topics approved
Camera Execution                    61 executable moments · 4 correct unsupported
Invalid product-driven camera         0
Invalid action rewrite                0

Seedance Compiler                    13 / 13 topics compiled
Seedance Compiler                    13 / 13 final scripts generated
Provider dependency               NONE

Final UI   Generate PASS · View PASS · Copy PASS · Debug collapsed PASS
Final UI   1600 PASS · 1280 PASS · 390 PASS
```

## Accepted V1 Validation Exceptions

| Check | Classification | Impact |
| --- | --- | --- |
| `validate:reference-binding` | `PRE_EXISTING_BASELINE_FAILURE` | non-blocking |
| `validate:prompts` | `ACCEPTED_COMPATIBILITY_EXCEPTION` — Narrative-only scenes intentionally excluded from the legacy Lifestyle sampler | non-blocking |
| `visual-system.spec.ts` ×3 | `KNOWN_PRE_EXISTING_UNRELATED_FAILURE` | non-blocking |

### validate:reference-binding — PRE_EXISTING_BASELINE_FAILURE

```text
failure family existed before the current final integration
already recorded in the 2026-09-19 read-only audit of this workspace
outside the Immersive Narrative module tree
no change attempted to hide / weaken / bypass it
not introduced by Phase 6–9 work
Final V1 impact   NON-BLOCKING
```

### validate:prompts — ACCEPTED_COMPATIBILITY_EXCEPTION

```text
Scene Resolver coverage introduced 3 lifestyle scene entries required by
Immersive Narrative coverage:
  lifestyle-residential-building-exit
  lifestyle-bookstore-interior
  lifestyle-home-errand-entry

Those scenes are intentionally NOT reachable through the old Lifestyle
sampler / rotation path. Making them reachable would modify approved legacy
Lifestyle behavior and invalidate the preserved legacy hash baseline.

Conflict   new Narrative Scene Resolver coverage
           vs
           old Lifestyle validator invariant that assumes every lifestyle
           scene must be sampler-reachable

Chosen V1 contract   Preserve legacy Lifestyle behavior.
Final V1 impact      NON-BLOCKING ACCEPTED COMPATIBILITY EXCEPTION
```

No runtime change is authorized for V1: scene weights, old Lifestyle rotation,
old sampler reachability, validator assertions, validator cases, legacy hashes,
and the legacy compiler stay untouched.

### visual-system.spec.ts ×3 — KNOWN_PRE_EXISTING_UNRELATED_FAILURE

```text
old A2 marker
atmosphere image rotation
atmosphere module copy

failure set matches the pre-change baseline
no Immersive Narrative regression detected
Final V1 impact   NON-BLOCKING
```

## Final Validation Summary

```text
Validators total                                 31
  PASS                                           29
  PRE_EXISTING_BASELINE_FAILURE                   1  validate:reference-binding
  ACCEPTED_COMPATIBILITY_EXCEPTION                1  validate:prompts

typecheck                                       PASS
build                                           PASS

Full Playwright    38 total · 35 passed · 3 failed · 0 skipped
  Narrative suite   6 / 6 PASS
  Final UI suite    7 / 7 PASS
  Responsive suite  18 / 18 PASS
  visual-system     4 / 7 PASS (the 3 accepted failures above)
```

This summary must not be restated as "all validators PASS".

## Future Work (recorded, not implemented)

```text
LEGACY VALIDATION CONTRACT RECONCILIATION

Scope: determine whether the old Lifestyle validator should distinguish
       GLOBAL SCENE CATALOG
       from
       LEGACY LIFESTYLE SAMPLER-REACHABLE SCENES

Status: future technical debt item only. Not implemented in V1.
```

## Evidence boundaries

This system produces **text scripts for an external video model**. Nothing in
V1 uploads references, calls a Provider, or proves a generated video. A passing
validator or Playwright suite proves the internal pipeline and UI behaviour, not
Provider output, not video quality, and not a deployed environment.

## 13-Topic internal pipeline report

Produced by `runImmersiveNarrativePipeline` with `年龄阶段 28–32`,
`人物外观 亚裔`, `Season 秋`, `Lifestyle Feeling 安静 / 克制`. This is an internal
pipeline report, **not** a Provider E2E test.

```text
Topic     Narrative Scene Product Sound CameraRole PhysicalAction        CameraExecution       Compiler  FinalScript  Unsupported
下班回家   PASS      PASS  PASS    PASS  PASS       CORRECT_UNSUPPORTED  CORRECT_UNSUPPORTED   GENERATED GENERATED    1
周末独处   PASS      PASS  PASS    PASS  PASS       PASS                 PASS                  GENERATED GENERATED    0
出门办事   PASS      PASS  PASS    PASS  PASS       PASS                 PASS                  GENERATED GENERATED    0
等朋友     PASS      PASS  PASS    PASS  PASS       PASS                 PASS                  GENERATED GENERATED    0
午后咖啡   PASS      PASS  PASS    PASS  PASS       PASS                 PASS                  GENERATED GENERATED    0
逛书店     PASS      PASS  PASS    PASS  PASS       PASS                 PASS                  GENERATED GENERATED    0
采购归来   PASS      PASS  PASS    PASS  PASS       CORRECT_UNSUPPORTED  CORRECT_UNSUPPORTED   GENERATED GENERATED    1
接孩子后   PASS      PASS  PASS    PASS  PASS       PASS                 PASS                  GENERATED GENERATED    0
周末散步   PASS      PASS  PASS    PASS  PASS       PASS                 PASS                  GENERATED GENERATED    0
午餐之后   PASS      PASS  PASS    PASS  PASS       PASS                 PASS                  GENERATED GENERATED    0
城市闲逛   PASS      PASS  PASS    PASS  PASS       PASS                 PASS                  GENERATED GENERATED    0
傍晚回家   PASS      PASS  PASS    PASS  PASS       CORRECT_UNSUPPORTED  CORRECT_UNSUPPORTED   GENERATED GENERATED    2
短途出行   PASS      PASS  PASS    PASS  PASS       PASS                 PASS                  GENERATED GENERATED    0
```

```text
Topics with a generated final script    13 / 13
Topics with a correct-unsupported Moment 3  (4 Moments in total)
Topics blocked                           0
```

## Git

```text
Git                        UNAVAILABLE
Observed error             fatal: not a git repository: (null)
Destructive repair         not attempted
```
