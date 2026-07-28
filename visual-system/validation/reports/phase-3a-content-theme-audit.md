# THERUIZ AURA Phase 3-A｜Content Theme Audit

Status: `VERIFIED`

## Baseline and scope

- Baseline commit: `7549f4b`
- Current provider: `Image2` only.
- Product Truth and Brand Visual Mother remain unchanged.
- Formal theme inventory: 8 active runtime topics.
- Supporting scene pool: 29 lifestyle entries, plus 8 basic scene blocks.
- No BM customer flow, client page, commercial delivery flow, or additional provider was touched.

## Counts

| Metric | Result |
|---|---:|
| Total formal themes | 8 |
| Runtime-valid formal themes | 8 |
| KEEP | 2 |
| UPGRADE | 6 |
| MERGE | 0 |
| RETIRE | 0 |
| NEW | 0 |

## Findings

### Main duplication

- Daily lifestyle, outfit solution, and brand aesthetic can all resolve to a seated café, city walk, or wardrobe image.
- Product development and material awareness both use hands, samples, and close product framing.
- Seasonal color lab and outfit solution share neutral garments and styling language.
- The 29-entry scene pool contains useful variation but should not become 29 separate themes.

### Main visual conflicts

- Scene names are sometimes used as a substitute for visual direction.
- Generic luxury vocabulary can replace observable evidence such as light, material, space density, and behavior.
- Existing libraries contain many youthful, active, mirror, café, hotel, and product-display options that need theme-level boundaries.
- Product color and SKU-specific styling must not route character age or scene mood.
- Older topic-specific prompt composition can bypass a single Product Truth-aware compilation boundary.

### Old Prompt runtime risk

The current production path is `App.tsx → generatePromptRuntime → prompt-engine runtime`, while soft-seeding content also selects topic copy and scene drafts before delegating image prompts. Legacy scene blocks and topic templates remain callable compatibility assets. They are documented here and will be wrapped by Phase 3-B canonical specifications rather than deleted.

## Phase 3-B priority

Highest priority: daily lifestyle, outfit solution, launch conversion, product development, and the supporting scene pool. These have the largest surface area and the greatest risk of semantic duplication or Product Truth drift.

## Unresolved questions

1. Which overlapping themes should eventually merge after old/new visual comparison evidence?
2. Which product-free atmosphere scenes are sufficiently tied to THERUIZ AURA rather than generic lifestyle imagery?
3. Which older scene/template paths are still used by external consumers outside this repository?

These are recorded as unresolved rather than converted into unsupported RETIRE decisions.

## Gate result

Phase 3-A satisfies the entry condition for Phase 3-B. The next phase defines canonical, model-neutral specifications and runtime validation. No real Image2 comparison has been claimed in this phase.

## Phase record

- Input: existing theme topics, scene pool, scene blocks, outfit/action libraries, runtime and visual-system rules.
- Modification: inventory, migration matrix, audit report only.
- Tests: JSON validation and repository diff checks to run before commit.
- Incomplete: real old/new Image2 comparison remains a later Phase 3-D human gate.
- Risk: theme overlap requires empirical comparison before MERGE/RETIRE.
