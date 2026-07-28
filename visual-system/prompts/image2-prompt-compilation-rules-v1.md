# THERUIZ AURA｜Image2 Prompt Compilation Rules v1

## Compilation chain

`Brand Visual Mother` + `Canonical Theme Specification` + `Current Product Truth` + `Task Context` + `Image2 Adapter` = `Provider-ready Prompt`

The compiler is provider-specific only at the final assembly boundary. Canonical themes remain model-neutral.

## Stable section order

1. Task identity
2. Theme purpose
3. Person and action
4. Scene and environmental evidence
5. Styling boundary
6. Camera and composition
7. Light, color and material language
8. Product Truth lock
9. Product visibility
10. Physical realism
11. Brand-specific prohibitions
12. Technical negative constraints

## Hard gates

- Empty prompts fail.
- Chinese ideographs fail.
- Product Truth must be supplied by the current task.
- Core Product Truth fields must be present in the final prompt.
- RETIRED themes fail compilation.
- MERGED source themes must resolve to a canonical target before compilation.
- Theme names, anchor descriptions and SKU attributes cannot supply Product Truth.
- The provider scope is Image2 only; no other model adapter is added.

## Diagnostics

Compilation returns `diagnostics` with stable codes such as `THEME_MISSING`, `PRODUCT_TRUTH_MISSING`, `PRODUCT_TRUTH_FIELD_MISSING`, `THEME_RETIRED`, `THEME_MERGE_REDIRECT_REQUIRED`, and `PROMPT_CHINESE_CHARACTERS`.
