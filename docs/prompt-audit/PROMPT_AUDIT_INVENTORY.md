# Prompt Audit Inventory

- Runtime compiler: `compilePrompt`
- Provider boundary: Image2 only
- Runtime cases: 28
- Test-only assets: 0 in the generated runtime inventory
- Documentation-only assets: 0 in the generated runtime inventory
- Legacy candidates retained for compatibility review: 2

## Covered types

- product_studio
- model_on_foot
- lifestyle_city
- mirror_selfie
- craft_closeup
- still_life
- non_product_atmosphere

## Per-case metrics

| Prompt ID | Type | Season | Characters | Words | Rules | Hard rules | Negative | Status |
|---|---|---:|---:|---:|---:|---:|---:|---|
| craft_closeup-冬 | craft_closeup | 冬 | 789 | 119 | 6 | 4 | 0 | pass |
| craft_closeup-夏 | craft_closeup | 夏 | 789 | 119 | 6 | 4 | 0 | pass |
| craft_closeup-春 | craft_closeup | 春 | 789 | 119 | 6 | 4 | 0 | pass |
| craft_closeup-秋 | craft_closeup | 秋 | 789 | 119 | 6 | 4 | 0 | pass |
| lifestyle_city-冬 | lifestyle_city | 冬 | 6389 | 888 | 17 | 6 | 7 | pass |
| lifestyle_city-夏 | lifestyle_city | 夏 | 6389 | 888 | 17 | 6 | 7 | pass |
| lifestyle_city-春 | lifestyle_city | 春 | 6389 | 888 | 17 | 6 | 7 | pass |
| lifestyle_city-秋 | lifestyle_city | 秋 | 6389 | 888 | 17 | 6 | 7 | pass |
| mirror_selfie-冬 | mirror_selfie | 冬 | 5857 | 817 | 17 | 6 | 6 | pass |
| mirror_selfie-夏 | mirror_selfie | 夏 | 5857 | 817 | 17 | 6 | 6 | pass |
| mirror_selfie-春 | mirror_selfie | 春 | 5857 | 817 | 17 | 6 | 6 | pass |
| mirror_selfie-秋 | mirror_selfie | 秋 | 5857 | 817 | 17 | 6 | 6 | pass |
| model_on_foot-冬 | model_on_foot | 冬 | 2456 | 341 | 11 | 7 | 2 | pass |
| model_on_foot-夏 | model_on_foot | 夏 | 2456 | 341 | 11 | 7 | 2 | pass |
| model_on_foot-春 | model_on_foot | 春 | 2456 | 341 | 11 | 7 | 2 | pass |
| model_on_foot-秋 | model_on_foot | 秋 | 2456 | 341 | 11 | 7 | 2 | pass |
| non_product_atmosphere-冬 | non_product_atmosphere | 冬 | 2738 | 365 | 1 | 0 | 1 | pass |
| non_product_atmosphere-夏 | non_product_atmosphere | 夏 | 2657 | 353 | 1 | 0 | 1 | pass |
| non_product_atmosphere-春 | non_product_atmosphere | 春 | 2643 | 352 | 1 | 0 | 1 | pass |
| non_product_atmosphere-秋 | non_product_atmosphere | 秋 | 2694 | 357 | 1 | 0 | 1 | pass |
| product_studio-冬 | product_studio | 冬 | 4390 | 609 | 16 | 8 | 4 | pass |
| product_studio-夏 | product_studio | 夏 | 4390 | 609 | 16 | 8 | 4 | pass |
| product_studio-春 | product_studio | 春 | 4390 | 609 | 16 | 8 | 4 | pass |
| product_studio-秋 | product_studio | 秋 | 4390 | 609 | 16 | 8 | 4 | pass |
| still_life-冬 | still_life | 冬 | 1020 | 150 | 7 | 5 | 0 | pass |
| still_life-夏 | still_life | 夏 | 1020 | 150 | 7 | 5 | 0 | pass |
| still_life-春 | still_life | 春 | 1020 | 150 | 7 | 5 | 0 | pass |
| still_life-秋 | still_life | 秋 | 1020 | 150 | 7 | 5 | 0 | pass |

## Interpretation

The inventory is generated from real compiler output. Static source assets not reached by these cases are not treated as runtime truth.
