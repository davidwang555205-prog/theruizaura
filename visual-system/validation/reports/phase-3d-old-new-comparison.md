# THERUIZ AURA Phase 3-D｜Old vs New Prompt Visual Comparison

Status: `VERIFIED_WITH_REPAIR`

Provider scope: `Image2 verified` only. This report does not claim validation for Seedream, Nano Banana, FLUX, or any other model. The 20 files were manually paired by `comparison_id` and their `old` / `new` filename markers; upload order did not change the pairing.

## Evaluation order and hard gates

Each image was checked for Product Truth before comparing the pair: product color, silhouette, sole, panels, laces, material and proportion. No image triggered a Product Truth hard failure. No duplicate or fused shoe, severe crop, floating contact, product recolor, shoe reshaping, or unsupported product detail was observed.

The second pass compared person realism, age and affect, action and spatial evidence, light, material, composition, natural product participation, influencer/template/advertising/AI feel, theme purpose, THERUIZ AURA visual mother, and contribution to cross-theme continuity. Prompt length was not a scoring factor.

## Pair results

| comparison_id | theme_id / role | old_result | new_result | Product Truth | Brand consistency | Single-pair result | Cross-theme contribution | Final status |
|---|---|---|---|---|---|---|---|---|
| cmp-01 | A1 | café pause, clear product presence | quieter daily pause, clearer product presence | PASS; no hard failure | New is more restrained and less staged | New improves behavior, realism, composition and commercial use | Adds a natural lifestyle baseline without influencer posing | NEW_PASS |
| cmp-02 | A2 | walking transition, clearer motion and product visibility | static crossed-arm pose, darker styling | PASS; no hard failure | Old is more coherent with transition theme | Old better preserves movement, age feeling and spatial action | New contributes tonal continuity but loses the required transitional evidence | OLD_BETTER |
| cmp-03 | A3 | generic seated café lifestyle | writing action with tactile interior evidence | PASS; no hard failure | New is more grounded and less template-like | New improves action, realism, composition and theme purpose | Strengthens the daily-life behavior layer across lifestyle themes | NEW_PASS |
| cmp-04 | B3 | direct-camera studio pose | controlled official-studio front role | PASS; no hard failure | New has stronger restraint and negative space | New better supports official studio use and product readability | Extends the same quiet studio discipline into B themes | NEW_PASS |
| cmp-05 | C2 | on-foot close-up with weaker floor relationship | cleaner natural on-foot close-up | PASS; no hard failure | New is more coherent and less hard-sell | New improves product participation, contact and composition | Supports on-foot continuity; remains a validated generation result only | NEW_PASS |
| cmp-06 | C1 | complete lateral profile | strong three-quarter profile | PASS; no hard failure | Old better matches structural-read purpose | Old better preserves lateral completeness | Shows that structural themes still need explicit view requirements | OLD_BETTER |
| cmp-07 | C3 | paired still life with flatter hierarchy | stronger three-quarter spacing and scale hierarchy | PASS; no hard failure | New is more controlled and material-led | New improves spacing, separation and commercial usability | Creates a stable product-pair language without excess staging | NEW_PASS |
| cmp-08 | C4 | close material view | coherent heel/collar/stitching material close-up | PASS; no hard failure | New keeps detail legible with softer contact | New improves material evidence and AI-feel control | Reinforces repeatable detail framing across product studies | NEW_PASS |
| cmp-09 | C5 | readable top-down structure | reversed orientation and weaker tongue/upper relationship | PASS; no hard failure | Old is currently more reliable for structural evidence | New direction is valid but needs explicit orientation repair | Retains the close-detail system while identifying a camera/evidence gap | REPAIR_NEW |
| cmp-10 | B4 | formal studio outfit with heavier presentation | relaxed weight transfer and cleaner studio restraint | PASS; no hard failure | New is more continuous with AURA restraint | New improves realism, outfit/product balance and commercial use | Supports a consistent studio-to-lifestyle continuum | NEW_PASS |

## Pair-level QA notes

- `cmp-01`: The new result keeps the shoe recognizable and naturally placed while replacing a posed portrait feeling with a believable pause.
- `cmp-02`: Both preserve the product. The old result wins because walking intent, spatial transition and product visibility are clearer; the new result is not rejected as a system direction.
- `cmp-03`: The writing action gives the scene explicit behavior and avoids a generic seated fashion pose.
- `cmp-04`: The new result is a validated B3 generation result. It does not change Product Truth and is not treated as a new brand anchor.
- `cmp-05`: C2 is recorded as a `validated generation result` only. It is not added to the original on-foot Product Truth evidence set.
- `cmp-06`: The old lateral read is more complete. This is a task-specific view requirement, not evidence that the old prompt is globally better.
- `cmp-07`: The new pair has clearer foreground/background hierarchy and avoids a flat catalogue-like arrangement.
- `cmp-08`: Heel counter, collar, stitching and sole remain readable; no unsupported detail was introduced.
- `cmp-09`: The new result requires a repair to orientation and top-down evidence framing. Keep the semantic direction; do not revert the whole upgraded adapter.
- `cmp-10`: The new result is quieter and more natural while preserving the shoe and outfit relationship.

## Aggregate result

| Metric | Result |
|---|---:|
| NEW_PASS | 7 |
| OLD_BETTER | 2 |
| REPAIR_NEW | 1 |
| BOTH_FAIL | 0 |
| INVALID_TEST | 0 |
| Product Truth hard failures | 0 |
| New Prompt single-pair wins | 7 / 10 = 70% |

The old set is stronger in two purpose-specific cases: transitional movement (`cmp-02`) and strict lateral structural evidence (`cmp-06`). The new set is stronger in seven cases, especially where the evaluation rewards explicit behavior, restrained composition, material readability, natural product participation and lower template/AI feel. One case (`cmp-09`) needs a local repair rather than a system rollback.

## Cross-theme set comparison

Taken as ten images per set, the new group reads more consistently as one THERUIZ AURA visual system: warm but controlled light, quiet commercial restraint, believable product participation, tactile materials, reduced influencer posing and less generic luxury language. The old group contains good individual images, but its behavior drifts more between café portrait, fashion pose, catalogue structure and product study.

This is a visual-system conclusion from the supplied Image2 batch, not a provider-wide performance claim. Product Truth remained stable across both sets, so the main gain is continuity and scene behavior rather than a change to the product specification.

## Rule audit

### Rules that worked

- Explicit theme purpose and scene behavior reduced generic posing.
- Product Truth lock language preserved the shoe’s color, construction, sole and material identity across contexts.
- Controlled composition and negative-space guidance improved studio restraint.
- Natural product participation and contact guidance improved on-foot realism.
- Anti-template and anti-hard-sell guidance reduced influencer and catalogue drift.
- Material and detail evidence rules improved C3/C4 readability.

### Rules that may be redundant or need narrowing

- Repeated luxury/restraint/quiet-tone phrases can be shortened where they describe the same visual effect.
- Broad anti-AI and anti-influencer wording should remain subordinate to task-specific action and camera requirements.
- Structural views need explicit orientation, view direction and evidence framing; general product-detail language is insufficient for C5.
- Transitional themes need explicit movement cues; generic “natural posture” guidance can over-stabilize the subject, as seen in C2/A2-style situations.

### Recommended disposition

- **Retain:** Product Truth lock, theme purpose, behavior-first scene evidence, restrained composition, material/detail evidence, natural contact and anti-template safeguards.
- **Shorten:** repeated tonal synonyms and overlapping anti-hard-sell clauses after confirming the compiled prompt still passes the adapter checks.
- **Repair:** C5 orientation/top-down framing; preserve the new semantic direction. Review the movement specificity for A2-like transition prompts.
- **Do not delete globally:** no rule has enough evidence for deletion across all themes.

## Phase 3-E readiness

Phase 3-D has sufficient evidence to enter the Phase 3-E human confirmation gate. Phase 3-E has **not** started. Brand Visual Language v1 is not frozen, no result is approved as a formal brand anchor, and no old theme is formally retired.

The human gate must decide:

1. whether to freeze Brand Visual Language v1;
2. whether any validated generation result should become a formal visual anchor;
3. whether any overlapping old theme should be retired;
4. whether to accept the C5 repaired-new direction after one additional Image2 run.

All ten pairs remain `validated generation results`; C2 is specifically not on-foot Product Truth evidence.
