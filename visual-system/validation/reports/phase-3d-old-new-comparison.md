# THERUIZ AURA Phase 3-D｜Old vs New Prompt Comparison Plan

Status: `BLOCKED_HUMAN`

The preparation is complete. Real Image2 generation and result upload are the next required step. No visual result, winner, pass rate, or QA conclusion is claimed in this report.

## Controlled comparison

Each comparison keeps the current-task Product Truth, Image2 provider, reference images, upload order, aspect ratio, task context and evaluation dimensions constant. The prompt is the only intended variable.

Ten comparisons cover lifestyle, transitional urban space, interior daily life, official studio, on-foot, product profile, paired still life, material craft, top-down structure and an old-system high-risk outfit/studio case.

## Manual Image2 gate

For each `comparison_id`, upload the listed Product Truth images in the stated order, generate the old and new Prompt separately in Image2, and return both results. Do not use Seedream, Nano Banana, FLUX or another provider. Do not treat anchors as Product Truth.

After return, evaluate Product Truth first. Any product hard failure is an immediate invalid or failed comparison. Then score brand consistency, person realism, scene behavior, composition, AI feel, theme distinction, repetition, commercial usability and Prompt stability.

Allowed result labels: `NEW_PASS`, `OLD_BETTER`, `REPAIR_NEW`, `BOTH_FAIL`, `INVALID_TEST`.

No automatic anchor promotion or Brand Visual Language freeze is allowed from this plan.
