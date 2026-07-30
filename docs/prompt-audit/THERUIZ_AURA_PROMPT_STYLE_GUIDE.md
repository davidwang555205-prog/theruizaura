# THERUIZ AURA Prompt Style Guide

## Canonical structure

The compiler should make these responsibilities traceable, in this order: Task Intent, Product Truth, Product Role, Brand Visual Language, Composition / Camera, Human / Styling / Action, Season / Atmosphere, and Hard Constraints. The final Image2 text may remain natural language and does not need headings.

## Priority

- P0: user intent and task legality.
- P1: Product Truth, physical integrity, and active role locks.
- P2: identity continuity.
- P3: composition and visibility.
- P4: scene and action.
- P5: realism and camera.
- P6: brand and aesthetic detail.
- P7: negative constraints.

Lower priority text may be trimmed only after required Product Truth and physical rules remain covered.

## Product roles

`hero_product` is the visual anchor; `visible_supporting_product` is readable within a people-led frame; `subtle_supporting_presence` is peripheral and never centered; `lifestyle_trace_presence` is incidental; `no_product` excludes product display rules. These roles must not inherit each other's contradictory visibility rules.

## Human roles

`full_person`, `partial_person`, `face_optional`, `no_face`, `no_full_person`, and `no_person` are mutually meaningful. When `no_person` is active, do not inject gaze, head turn, smile, anatomy, walking, garment-on-body, or portrait-lighting rules.

## Writing rules

- Start with the task and the dominant subject.
- State confirmed product facts once as a compact hard lock.
- Use one sentence per visual responsibility.
- Prefer executable nouns and verbs over adjective piles.
- Keep negative constraints short, high-loss, and scenario-specific.
- Preserve specific season, action, and composition differences; do not replace them with a generic luxury template.

## Scenario guidance

- Studio/product: product role and physical integrity precede styling and camera.
- On-foot/lifestyle: preserve the daily action while keeping shoe-to-foot scale and contact readable.
- Mirror: prioritize reflection geometry and phone/face boundaries.
- Craft close-up: focus on the confirmed material zone; do not force full person or full-shoe rules.
- Still life: product is the subject and human rules are excluded.
- Non-product atmosphere: environment leads; product is optional and peripheral, and person rules follow the atmosphere route.

## Image2 adapter boundary

The adapter may order and render canonical semantic blocks for Image2. It must not invent Product Truth, change Active Prompt Registry versions, or claim provider execution. Provider-specific phrasing belongs in the adapter, while brand tone, roles, priorities, and audit structures remain canonical.

## Audit gate for new prompts

Every new runtime path must have a deterministic sample, a Prompt ID, rule-source traceability, product/person-role assertions, conflict coverage, a baseline fixture, and `npm run validate:prompt-audit` coverage. Visual quality still requires human Image2 A/B review.
