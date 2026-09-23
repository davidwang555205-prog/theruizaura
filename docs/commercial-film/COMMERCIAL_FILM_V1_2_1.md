# COMMERCIAL FILM V1.2.1

## Scope

V1.2.1 corrects final execution convergence without adding Creative Modes, Camera Behaviors, Edit Logics, Narrative dependencies, or action-library changes.

## Event Spine

Before physical execution, each Intent builds an Event Spine describing what actually happens:

- `URBAN_MOTION`: city entry, route continuation, ground relation change, urban pause, route release
- `DAILY_STYLING`: wardrobe decision, threshold test, garment-foot relation, ready state, lived use
- `NEW_ARRIVAL`: approach, threshold, arrival grounding, settling, arrival environment
- `PRODUCT_CRAFT`: preparation context, wear transition, external reference detail selection, use confirmation, quiet completion
- `QUIET_LUXURY`: private state, restrained shift, material pause, product recognition, room continues

Each event carries:

- what happens
- why it happens now
- what changes
- action class
- causal link from the previous event
- framing hint
- perceptual target
- dynamic duration

Existing Actions remain the implementation resource. The Commercial Action Registry references them read-only.

## Dynamic Timing

Timing is no longer fixed at `3 / 3 / 3 / 3 / 3`.

- durations come from Event Spine importance and action completion
- Creative Mode and Reveal Strategy apply deterministic timing adjustments
- minimum shot length: 1.0s
- maximum normal shot length: 5.0s
- total remains exactly 15.0s

## Decoupled Shot Semantics

`WORLD`, `WEAR`, `DETAIL`, `HERO`, and `RELEASE` remain semantic roles only.

Framing is selected from:

- Event Spine
- Camera Behavior
- Product Visibility
- human action
- Creative Mode
- physical space

Examples:

- WORLD can be partial or environmental detail
- DETAIL can live inside a medium human frame
- HERO can be moving or held
- RELEASE can settle without walking away

## Visibility Compatibility

`ABSENT` product beats require a physically credible visibility prevention:

- crop
- foreground
- seating
- upper-body framing
- occlusion

Negative language alone is not accepted.

## Perceptual Camera Signature

The planner creates an internal signature from:

- framing
- camera height
- movement
- subject movement
- camera-subject relationship
- foreground relationship
- reveal mechanism

Each film must have at least three substantially distinct signatures.

## Ending Grammar

Each Intent selects a dedicated ending grammar:

- continued spatial movement
- transition into lived use
- stillness and room continues
- completion and quiet departure
- arrival settles

Release no longer defaults to walking away.

## Compact Seedance Execution Compiler

The full Director Plan stays internal. The compact execution prompt contains only:

```text
SEEDANCE — COMMERCIAL FILM

[FILM IDEA]
[CHARACTER / WORLD]
[TIMING]

SHOT N
Time
Action
Camera
Product
Transition

[SOUND WORLD]
[VISUAL LOOK]
[GLOBAL PRODUCT PROTECTION]
[NEGATIVES]
```

The execution body:

- does not expose planner field names
- does not expose enum values
- does not repeat the full reference contract per shot
- does not repeat the brand name
- preserves product color fidelity separately from environment grading

Observed pre-compact output in this checkout was approximately 14.7K–14.9K characters per Intent; compact output is approximately 6.1K–6.4K characters, an average reduction of about 58%.

## Zero-Reference Generation

Commercial Film remains independent of the AURA-internal reference gate.

With 0 uploaded and 0 confirmed product references:

- script generation still succeeds
- no `PRODUCT_REFERENCE_REQUIRED` block
- no `REFERENCE_CONFIRMATION_REQUIRED` block
- product identity is deferred to external Seedance reference images
- no exact color, material, panel, branding, outsole, or construction fact is invented

## Final Validation

```bash
npm run validate:commercial-output-diversity
npm run validate:commercial-creative-direction
npm run validate:commercial-creative-spine
npm run validate:commercial-film
npm run validate:commercial-execution-compiler
npm run validate:actions
npm run typecheck
npm run build
npx playwright test tests/e2e/commercial-film.spec.ts
```
