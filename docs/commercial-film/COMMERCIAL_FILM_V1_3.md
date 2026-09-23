# COMMERCIAL FILM V1.3

## Director Concept

V1.3 adds one Commercial-only layer between Creative Premise and final execution:

```text
Commercial Intent
→ Creative Premise
→ Director Concept
→ Event Spine
→ Shot Design
→ Camera / Edit / Product
→ Compact Seedance Execution
```

The Director Concept is one cinematic rule that governs how the whole film is experienced. It is not a mood, Intent, location, product claim, Camera Behavior, or standalone Visual Motif.

## Initial Catalog

Eight controlled concepts:

- `STATIC_CAMERA_FILM`
- `PARTIAL_OBSCURATION`
- `EDGE_OF_FRAME`
- `THRESHOLD_CHAIN`
- `REFLECTION_WORLD`
- `LIGHT_REVEAL`
- `WORLD_MOVES_SUBJECT_SETTLES`
- `REPEATED_GESTURE`

Selection is deterministic from Intent, Creative Premise, Creative Mode, Human Situation, Event Spine, world, and generation nonce. Intent is not permanently mapped to one concept.

## Whole-Film Governance

Every shot receives an internal `directorConceptContribution`:

- PRIMARY
- SUPPORTING
- REST
- RESOLUTION

The concept must influence multiple shots, HERO convergence, and RELEASE resolution. It may not be a one-shot effect.

## Graphic Composition

The internal plan records:

- negative space
- asymmetric weight
- frame-within-frame
- foreground layer
- deep plane
- edge placement
- geometric division

These are not user controls and do not appear as enum labels in the Seedance prompt.

## Product Discovery

The concept controls how the worn product becomes understandable:

- static composition: subject enters a waiting frame
- partial obstruction: product resolves as a foreground layer clears
- light reveal: light movement makes the worn product readable
- reflection world: indirect view resolves into direct physical view
- threshold chain: product becomes clear during a real crossing
- edge of frame: body and frame placement resolve the read

Product magnification is rejected when it replaces observation.

## HERO / RELEASE

HERO is the convergence of the Director Concept and worn-product comprehension.

RELEASE resolves the same cinematic rule:

- static camera remains after subject movement
- final threshold closes the spatial sequence
- world continues as the subject settles
- light persists after the body resolves
- reflection remains after the subject moves

## Compact Execution

The final prompt adds one concise cinematic-rule sentence under `[FILM IDEA]` and translates concept contributions naturally into:

- Action
- Camera
- Product
- Transition

No Director Concept enum, system label, or film-school explanation appears in the execution body.

## Validation

```bash
npm run validate:commercial-director-concept
```

The validator checks:

- 8 / 8 concept reachability
- deterministic selection
- whole-film contribution
- HERO / RELEASE convergence
- graphic composition realization
- product discovery connection
- Event Spine compatibility
- Perceptual Camera diversity
- no enum leakage
- bounded prompt-size increase

## Finalization

V1.3 finalization does not add Director Concepts, Creative Modes, Narrative dependencies, or Action changes.

```text
Commercial Film V1.3
→ Canonical Baseline
→ 12-case Seedance Acceptance Matrix
→ Final Export Pack
→ Real Video Review
→ Freeze Decision
```

Finalization commands and the visual review contract are documented in
`docs/commercial-film/COMMERCIAL_FILM_V1_3_FINALIZATION.md`.
