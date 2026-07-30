# Phase 2 A/B Test Plan

Status: **PHASE_2_AB_PREPARATION_READY**

A = PRE-AUDIT compile output from commit `adb7cba5e75bbd08a2093f631e0caee7d779c5c1`. B = POST-AUDIT compile output from commit `162c027`. The current Phase 1 rule-ID guard is expected to be output-neutral for these cases; this must be confirmed by the actual prompt text and then by Image2 visual review.

- Cases: 8
- Recommended images: 2 per A/B version
- Total recommended images: 32
- Use identical product references, order, model source, season, and scene settings.
- Do not infer results from text length. Review stability across both generations.

The complete prompts and per-case metadata are in `phase-2-ab-cases.json` and `PHASE_2_AB_PROMPTS.md`.
