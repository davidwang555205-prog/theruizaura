# THERUIZ AURA Phase 3-D｜Old vs New Prompt Comparison Results

Status: `VERIFIED_WITH_REPAIR`

Provider scope: `Image2 verified` only. These results do not claim that Seedream, Nano Banana, FLUX, or any other model has passed.

## Summary

| Result label | Count |
|---|---:|
| NEW_PASS | 7 |
| OLD_BETTER | 2 |
| REPAIR_NEW | 1 |
| BOTH_FAIL | 0 |
| INVALID_TEST | 0 |
| Product Truth hard failures | 0 |

Effective new Prompt pass rate: `7 / 10 = 70%`.

The 10 pairs were manually matched even though several filenames were inconsistent: `cmp-04` uses `C2old.png` + `B3New.png`, and `cmp-09` uses `c9old.png` + `cmp-09 · C5new.png`. Old and new sides were not swapped.

## Decisions

- `NEW_PASS`: cmp-01, cmp-03, cmp-04, cmp-05, cmp-07, cmp-08, cmp-10.
- `OLD_BETTER`: cmp-02, cmp-06.
- `REPAIR_NEW`: cmp-09. The new semantics are retained, but top-down orientation and tongue/upper evidence need repair.
- No pair triggered a Product Truth hard failure, duplicate/merged shoe, severe clipping, floating contact, or unsupported product fact.
- C2 remains a validated generation result only and is not added to on-foot Product Truth.
- No result is promoted to a frozen brand anchor.

## Main visual learning

The upgraded prompts improve natural behavior, controlled studio restraint, product detail framing, and reduction of generic luxury/influencer cues in 7 of 10 comparisons. The old Prompt remains stronger where the task requires strict lateral completeness or more explicit transitional movement. The C5 repair shows that semantic improvement alone is insufficient when camera orientation and evidence framing are not explicit enough.

## Phase 3-E gate

The comparison evidence is sufficient to prepare a draft consolidation, but the following require the single human confirmation gate before freezing:

1. Whether to freeze Brand Visual Language v1.
2. Whether any validated generation result should become a formal visual anchor.
3. Whether any overlapping old theme should be formally retired.
4. Whether C5 repaired-new should be accepted after one additional Image2 run.
