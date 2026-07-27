# Pre-Phase 3-A Visual Validation Report

Status: `PARTIAL`

The internal workspace can create and inspect 13 A1–C5 validation tasks and can bind current-task Product Truth evidence. No external provider is connected and no real result images have been returned, so this report intentionally does not claim PASS.

## Required manual bridge

Select/upload product evidence → review Product Truth confidence → copy each Provider-ready Prompt and Reference Plan to an approved external provider → upload returned result → score the QA rubric → record hard rejects and brand drift.

## Current evidence state

- Brand mother: `approved_frozen`, v1.2.
- Anchors: 13 approved brand references; none are Product Truth.
- Current task Product Truth source: six uploaded product images from `/Users/davidw/Desktop/小号素材图/`.
- Evidence confidence: `High` for structure, color, panel layout, outsole, heel, tongue, laces, and material appearance. No on-foot evidence was supplied; this is not a blocker for the product-only validation set, but it remains a missing optional role for B/C scenes involving wear.
- Corrected returned provider images: A2, B3 and C1 were manually reviewed and passed; the first purple/lavender-reference run is `INVALID_TEST` and excluded from the pass rate.
- Browser workbench smoke test: 1 passed; frozen mother, 13 anchors, and 13 validation cases rendered with console/page errors at 0.
- Final conclusion: `PARTIAL` pending manual provider bridge and human QA.

## Product Truth evidence ledger

| Evidence ID | Uploaded file | Evidence role | What it establishes |
|---|---|---|---|
| PT-01 | `微信图片_20260725171547_1090_106.jpg` | `overall_structure` | Full lateral silhouette, rounded toe, low-cut profile, slim outsole and panel proportions |
| PT-02 | `微信图片_20260725171552_1092_106.jpg` | `top_front` | Top-line, toe-box geometry, tongue, lace path and burgundy/ivory color blocking |
| PT-03 | `微信图片_20260725161300_1071_106.jpg` | `heel_side` | Heel counter, collar padding, rear seam, heel panel and outsole termination |
| PT-04 | `微信图片_20260725161257_1070_106.jpg` | `material_craft` | Leather/suede contrast, stitching, lace texture and side-panel construction |
| PT-05 | `微信图片_20260725171549_1091_106.jpg` | `overall_structure` | Paired-shoe scale relationship and three-quarter product read |
| PT-06 | `微信图片_20260725171546_1089_106.jpg` | `material_craft` | Toe cap, eyelet facing and close material grain |

Missing evidence roles: `on_foot` only. The six images provide all four required product-only roles, therefore Product Truth confidence is `High` under the frozen v1.2 rule. The on-foot role must not be inferred from brand anchors.

## Provider-ready task set (A1—C5)

All 13 tasks inherit the same Product Truth reference plan: PT-01/PT-02/PT-03/PT-04, with PT-05/PT-06 as supporting detail references. Each prompt must preserve the uploaded sneaker's exact burgundy/ivory color blocking, panel geometry, low-cut silhouette, rounded toe, slim brown outsole, tongue, laces, stitching and material contrast. Brand anchors define only abstract visual language; they are not product evidence.

| ID | Provider-ready Prompt focus | Reference Plan |
|---|---|---|
| A1 | Relaxed seated lifestyle frame with full product visibility and grounded natural posture; keep both shoes structurally faithful. | PT-01, PT-02, PT-04 + lifestyle anchors A1/A4 |
| A2 | Natural standing transition in a quiet city setting; medium-distance framing, no landmark view, product remains readable. | PT-01, PT-03, PT-04 + lifestyle anchors A2/A4 |
| A3 | Relaxed seated tactile moment with ordinary fabric/material interaction; no product reshaping. | PT-01, PT-04, PT-06 + lifestyle anchors A3/A1 |
| A4 | Natural crossed-leg seated/standing transition with at least one complete shoe and no clipping. | PT-01, PT-02, PT-03 + lifestyle anchors A4/A2 |
| B1 | Controlled studio lower-third with garment hem and shoe collar/laces/outsole separately readable. | PT-01, PT-02, PT-04 + studio anchor B1 |
| B2 | Quiet studio back full-body composition; product remains correctly scaled and grounded. | PT-01, PT-03, PT-04 + studio anchor B2 |
| B3 | Quiet studio front full-body composition with balanced negative space and accurate product color. | PT-01, PT-02, PT-04 + studio anchor B3 |
| B4 | Studio three-quarter side standing view with natural weight transfer and full product silhouette. | PT-01, PT-03, PT-04 + studio anchor B4 |
| C1 | Clean side-profile product presentation; preserve silhouette, panel boundaries, outsole and color exactly. | PT-01, PT-04, PT-06 + product anchor C1 |
| C2 | On-foot close-up is allowed only if the foot is seated naturally; do not invent missing on-foot evidence or alter shoe geometry. | PT-01, PT-02, PT-03, PT-04 + product anchor C2; on-foot evidence missing |
| C3 | Paired-shoe three-quarter still life with accurate scale, spacing, contact shadows and material contrast. | PT-01, PT-04, PT-05 + product anchor C3 |
| C4 | Heel/material craft close-up focused on counter, stitching, collar and outsole termination. | PT-03, PT-04, PT-06 + product anchor C4 |
| C5 | Top-down structure and settled lace state; preserve toe-box, tongue and panel geometry. | PT-02, PT-04, PT-06 + product anchor C5 |

## Manual bridge and QA gate

1. Copy one task's Provider-ready Prompt and Reference Plan to an approved external provider manually.
2. Return the generated image file(s) here; no provider is connected by this workspace.
3. For each returned image, run Product Truth, brand-mother, evidence-role and hard-reject checks from `visual-system/config/qa-rubric.json`.
4. Record `pass`, `repair`, or `reject` per task. Any changed shoe color, panel geometry, outsole profile, impossible contact, clipping, duplicated/merged shoe, or invented on-foot fact is a hard reject.
5. Until returned images are reviewed, this report must remain `PARTIAL` and Phase 3-A must not start.

## Returned-result QA: A2 / B3 / C1

| Task | Returned result | Product Truth result | Brand / role result | Hard-reject reason | Status |
|---|---|---|---|---|---|
| A2 | `codex-clipboard-7d8875f5-ccfb-43ad-9878-cefc245b5992.png` | **Invalid test** — purple/lavender reference image did not match the uploaded burgundy/ivory Product Truth. | Scene role was broadly correct, but the reference input was wrong. | Incorrect reference image; result excluded from pass rate. | `INVALID_TEST` |
| B3 | `codex-clipboard-ca5e1df4-97b2-4eb2-8eb1-8da56bcca460.png` | **Invalid test** — purple/lavender reference image did not match the uploaded burgundy/ivory Product Truth. | Studio role was broadly correct, but the reference input was wrong. | Incorrect reference image; result excluded from pass rate. | `INVALID_TEST` |
| C1 | `codex-clipboard-464fc49d-bb6e-4b89-ad91-d6922c59842a.png` | **Invalid test** — purple/lavender reference image did not match the uploaded burgundy/ivory Product Truth. | Side-profile role was broadly correct, but the reference input was wrong. | Incorrect reference image; result excluded from pass rate. | `INVALID_TEST` |

## Returned-result QA: corrected A2 / B3 / C1 rerun

| Task | Returned result | Product Truth | Scene / role QA | Hard reject check | Status |
|---|---|---|---|---|---|
| A2 | `codex-clipboard-49fad3bd-0b4b-4398-b6b2-63b9d3b2ba62.png` | **Pass** — burgundy/ivory panels, white laces, low-cut profile, rounded toe and brown slim outsole agree with PT-01/PT-02/PT-03/PT-04. | **Pass** — doorway/street transition, clear pause behavior, both shoes visible, realistic pavement and contact. | No hard reject observed. | `pass` |
| B3 | `codex-clipboard-66642be2-2899-4c70-96ec-ece775c3d1a8.png` | **Pass** — product colorway, panel layout, laces, toe shape and outsole remain consistent with uploaded evidence. | **Pass** — front full-body studio, mature calm presence, controlled warm background, readable product scale. | No hard reject observed. | `pass` |
| C1 | `codex-clipboard-64b36fa5-f170-46f6-9f78-89ee525434f9.png` | **Pass** — complete lateral silhouette, burgundy/ivory construction, heel counter, stitching, laces and brown outsole are preserved. | **Pass** — full side profile, warm pale background and physically plausible contact shadow. | No hard reject observed. | `pass` |

### Corrected-rerun conclusion

The three corrected results pass the current Product Truth and hard-reject gate. They are eligible as validation passes for A2, B3 and C1, but they are not automatically promoted to frozen brand anchors. The overall report remains `PARTIAL` because the complete A1—C5 set has not been returned and reviewed, and Phase 3-A remains closed until the full manual bridge is complete.

### QA conclusion

The first A2/B3/C1 run used an incorrect purple/lavender reference result and is marked `INVALID_TEST`; it is excluded from the pass rate and cannot be used as Product Truth evidence. The corrected reruns for A2, B3 and C1 are `PASS` and are eligible only as validation evidence, not as frozen brand anchors. The overall status remains `PARTIAL` because the complete A1—C5 set has not been returned and reviewed. Phase 3-A remains closed.
