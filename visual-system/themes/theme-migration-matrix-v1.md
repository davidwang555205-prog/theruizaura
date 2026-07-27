# THERUIZ AURA Phase 3-A｜Theme Migration Matrix

## Scope

The formal runtime theme surface is eight soft-seeding topics. Scene entries, action libraries, outfit libraries, studio presets, and the 29-entry lifestyle scene pool remain supporting libraries; they are not promoted into independent long-term themes.

## Migration summary

| Status | Count | Themes |
|---|---:|---|
| KEEP | 2 | `soft-material-awareness`, `soft-multi-scene-life` |
| UPGRADE | 6 | `soft-lifestyle-daily-life`, `soft-product-development`, `soft-autumn-winter-color-lab`, `soft-outfit-solution`, `soft-brand-aesthetic`, `soft-launch-conversion` |
| MERGE | 0 | No automatic merge; overlapping themes remain separately specified until real comparison evidence exists. |
| RETIRE | 0 | No runtime theme was removed without a confirmed replacement. |
| NEW | 0 | Current gap is specification and compilation, not an unvalidated new theme. |

## Main migration decisions

1. Scene names such as café, hotel, gallery, street corner, and metro passage remain scene evidence, not brand style definitions.
2. `soft-lifestyle-daily-life` is upgraded to own the behavior and customer-use purpose; `soft-multi-scene-life` remains a supporting scene pool.
3. `soft-product-development` and `soft-material-awareness` remain separate because development narration and material evidence have different QA needs.
4. `soft-outfit-solution` and `soft-autumn-winter-color-lab` remain separate until comparison evidence proves they should share one canonical family.
5. No current SKU color, material, or product name is used to route age, scene, or brand mood.

## High-risk findings

- Legacy prompts frequently use broad terms such as `premium`, `high-end`, and `quiet luxury` without enough physical scene evidence.
- Several scene blocks place coffee, cafés, hotels, and boutiques beside similar walking or seated actions, creating repetition risk.
- The runtime has many action and outfit libraries; without canonical theme ownership, the same scene can acquire different purposes.
- Product Truth protection exists in the visual-system validation layer, but the general content runtime still needs a canonical compilation boundary.
- Image2 output safety is stronger in the visual validation adapter than in older topic-specific copy paths.

## Phase 3-B priority

1. Define canonical purpose, person state, action logic, scene evidence, and repetition controls for all eight formal themes.
2. Keep Product Truth as a task input and never derive it from a theme, scene, anchor, or SKU.
3. Build a single model-neutral theme layer before adding Image2-specific compilation.
4. Preserve the current runtime and legacy compatibility until comparison evidence supports retirement.

## Phase 3-A gate

Phase 3-A is complete for planning purposes. The inventory is sufficient to enter Phase 3-B. No artificial MERGE or RETIRE decision was made, and no historical content was deleted.
