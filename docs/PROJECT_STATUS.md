# THERUIZ AURA Project Status

Snapshot: 2026-09-11

Repository: https://github.com/davidwang555205-prog/theruizaura

Project site: https://theruizaura.vercel.app

## 1. Current project definition

THERUIZ AURA is a brand-specific visual prompt and content-generation workbench for footwear e-commerce and lifestyle content.

It combines:

- brand visual rules
- uploaded-product Product Truth
- Reference Plan binding
- scene / outfit / action / face / camera planning
- structured Prompt compilation
- runtime diagnostics
- validation scripts
- Founder Workbench and Xiaohongshu-oriented content workflows

This repository is not a Black Mirror / BM codebase and should not import BM business architecture.

## 2. Current top-level content architecture

The project currently keeps eight top-level topics:

1. 生活场景软种草
2. 产品开发幕后
3. 秋冬配色实验室
4. 穿搭解决方案
5. 材质工艺认知
6. 品牌审美观点
7. 上新活动转化
8. 棚内上新拍摄

### Lifestyle soft seeding

Content categories:

- `natural_life` — 自然生活
- `urban_commute` — 都市通勤

Capture styles:

- `standard` — 标准记录
- `telephoto_candid` — 长焦随拍

Current lifestyle scene inventory: 36 classified scenes.

## 3. Prompt runtime

Production default:

```text
new
```

The structured compiler is the authoritative Prompt assembly path.

`legacy` and `compare` remain diagnostic / rollback compatibility modes.

Important rule:

> New product or visual features should enter typed structured fields before compilation rather than being implemented only as appended `extraRequirement` prose.

## 4. Product Truth

Current uploaded footwear references are the product-fact authority for each task.

The system must not infer or redesign unconfirmed:

- silhouette
- toe box
- panel geometry
- outsole
- tongue
- collar
- laces
- material
- color
- branding
- construction

Brand anchors and styling rules may direct composition, camera, light and lifestyle context, but they do not define the current SKU's Product Truth.

## 5. Action system

Single action source:

```text
src/data/personActionLibrary.ts
```

Expected action count: 318.

Lifestyle multi-image diversity currently considers:

- semantic action family
- visual leg-pose family
- leg-action signature
- footwork
- hand task
- hand placement
- movement phase
- body orientation
- pose type
- perspective risk

The selector preserves unused visual leg-pose families before reusing one where compatible candidates remain.

## 6. Face variation

Lifestyle multi-image sets use structured `seriesFaceVariation` rather than relying only on prose in scene requirements.

Five-card output can explicitly vary:

- gaze target
- head angle
- eyelid tension
- mouth state
- subtle facial response

Identity continuity remains locked while facial presentation changes.

For `telephoto_candid`, face variation remains off-camera / directional and avoids direct camera awareness.

## 7. Camera system

`telephoto_candid` has a dedicated camera profile.

Canonical direction:

- approximately 105–180mm full-frame equivalent
- camera physically farther from subject
- natural telephoto compression
- standing-height plausible viewpoint
- restrained shallow depth of field
- enough real environment to establish context
- at least one sneaker clearly readable

A telephoto card must not simultaneously emit stabilized 50–70mm or shoe-safe 60–85mm camera profiles.

## 8. Validation baseline

Latest local validation reported against the action / face diversity changes:

```text
npm run typecheck                      PASS
npm run build                          PASS
npm run validate:actions               PASS
npm run validate:lifestyle-taxonomy    PASS
npm run validate:lifestyle-action-face PASS
npm run validate:production-runtime    PASS
```

Coverage reported:

- 318 action definitions
- 72 generated action sets
- 384 generated prompts
- 10,000 eight-image action stress sets
- 1,693 lifestyle taxonomy checks
- 901 lifestyle action / face checks
- production-runtime output and strict-failure checks

The Vite build still emits the existing bundle-size warning; it does not currently fail the build.

## 9. Important merged milestones

### Lifestyle taxonomy / telephoto

PRs #47 / #48 established and cleaned the lifestyle taxonomy and telephoto-candid structured path.

Key results:

- natural life / urban commute categories
- standard / telephoto capture styles
- structured telephoto camera profile
- no competing 50–70mm / 60–85mm profile in telephoto output
- routed Provider Prompt cleanup

### Action / face diversity

PR #49 merged to `main` on 2026-09-11.

Key results:

- full visual-action diversity scoring
- hard preference for unused visual leg-pose families where possible
- constrained-card-first planning to protect mirror / limited-candidate cards
- structured lifestyle Face Variation Locks
- removal / neutralization of competing scene-level movement hints
- dedicated `validate:lifestyle-action-face` regression gate

Merge commit:

```text
caab2034e686e1589a2ddc8fc87f83802566e70e
```

## 10. Current readiness statement

Use the following wording:

```text
CODE VALIDATION: PASS
PROMPT / RUNTIME VALIDATION: PASS
ACTION + FACE DIVERSITY VALIDATION: PASS
REAL PROVIDER E2E: NOT PROVEN BY STATIC VALIDATORS
```

Do not describe the project as real-Provider verified based only on local Prompt validators.

When a fixture does not use real Product Truth and a real Provider execution path, these values may correctly remain:

```text
providerExecutionReady: false
productionReady: false
```

## 11. Next visual validation

The next useful milestone is real-image validation, not a larger action library.

Recommended matrix:

```text
natural_life × standard
natural_life × telephoto_candid
urban_commute × standard
urban_commute × telephoto_candid
```

For each combination, generate real 5-image sets first, then selected 8-image stress samples.

Review:

1. visible action diversity
2. visible expression diversity
3. product silhouette accuracy
4. shoe / foot / trouser separation
5. telephoto perspective credibility
6. scene realism
7. whether the Provider visually collapses semantically different Prompts into similar poses

If visual convergence remains, tune the Provider-facing direction before expanding the action count.

## 12. GitHub About recommendation

The repository currently has no About description and no topics.

Recommended description:

```text
THERUIZ AURA brand visual prompt system for footwear e-commerce — structured Product Truth, lifestyle scene planning, action/face diversity, telephoto candid photography and validated Prompt runtime.
```

Recommended topics:

```text
theruiz-aura
footwear
visual-prompt
prompt-engine
ecommerce
product-truth
image-generation
lifestyle-photography
telephoto-candid
react
typescript
vite
```

Recommended website:

```text
https://theruizaura.vercel.app
```

The website is already present in repository metadata; description and topics still need to be filled in through GitHub About when repository-metadata write access is available.

## 13. Documentation entry points

- [`README.md`](../README.md) — project overview and local usage
- [`00_CODEX_EXECUTION.md`](../00_CODEX_EXECUTION.md) — Codex execution baseline
- [`docs/prompt-engine/`](prompt-engine/) — Prompt Engine design / acceptance
- [`docs/visual-system/`](visual-system/) — visual-system source documents
- [`docs/integration/`](integration/) — UI / Prompt integration history
- [`docs/prompt-audit/`](prompt-audit/) — Prompt audit records
- [`docs/consumer-trust/`](consumer-trust/) — consumer-trust validation
- [`docs/ui-redesign/`](ui-redesign/) — UI validation material
