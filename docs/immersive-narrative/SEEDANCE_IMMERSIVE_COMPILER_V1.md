# Immersive Narrative Seedance Script Compiler V1

## Status

```text
Compiler V1            IMPLEMENTED + INTEGRATED INTERNAL PATH
13 Topics compiled     13 / 13
Complete scripts       13 / 13
Moments                65 (13 × 5), canonical index preserved
Correct unsupported     4 (rendered honestly, never faked)
Provider dependency    NONE
Provider assumptions   0
Downstream inventions  0
Determinism            13 / 13 identical on re-run
```

THERUIZ AURA is a **prompt / script creation system**. This compiler produces the
final copyable text for an external video model. It performs no Provider call,
needs no credential, endpoint, or model route, and attaches no reference images.

## Input — canonical upstream truth only

```text
Topic
Character Age / Appearance (Character Profile Catalog)
Season
Lifestyle Feeling
Duration (V1: 15 s)
Narrative Arc + Narrative Moments              Narrative Planner V1
Scene Resolution                               Scene Resolver V1
Product Presence                               Product Presence Curve V1
Sound World                                    Sound World V1
Camera Narrative Role                          Camera Narrative Role V1
Physical Action                                Physical Action Compiler V1
Camera Execution                               Camera Execution V1
Brand Visual Rules                             cameraLookProfiles.AuraOutdoorReference
Product Protection                             productTruthLock (src/visual-system/types.ts)
Reference Mapping                              manual reference-bound upload instruction
```

Every stage is consumed by canonical `NarrativeMoment.index`. The compiler never
re-plans an upstream stage: it renders what the pipeline already decided.

## Reused protection layers

```text
continuity rules            one person, one wardrobe, one season, one lens family, one camera side
body / leg rules            full-figure readability, ground contact, no frame-to-frame deformation
camera protection           the AURA camera restrictions and negative look line from Camera Execution
brand tone                  AURA outdoor reference look, naturalistic and restrained
product fidelity            productTruthLock + uploaded-references-only source rule
reference-image mapping     manual Reference Plan upload instruction, no automatic upload
physical realism            ordinary real-world speed, no slow motion or time stretching
shoe/garment separation     product stays a readability guard, never a body-action trigger
ground contact              stable contact preserved through every Moment
action realism              the matched Action is performed unchanged
```

## Final script architecture

One coherent script, not five disconnected prompts:

```text
SEEDANCE — IMMERSIVE NARRATIVE VIDEO SCRIPT
[GLOBAL INTENT]
[CHARACTER]
[VISUAL WORLD]
[STORY ARC]
[MOMENT 1] … [MOMENT 5]
    SCENE
    PHYSICAL ACTION
    CAMERA
    SOUND
    PRODUCT PRESENCE
[CONTINUITY]
[PRODUCT / REFERENCE PROTECTION]
[NEGATIVE / DO-NOT]
[FINAL ENDING STATE]
```

Section headers follow the existing AURA Seedance convention (bracketed uppercase
blocks), so the output reads like the scripts the team already copies into the
external model.

## Moment ≠ Shot

```text
Narrative Moment   what happens          rendered as the Moment heading and causal link
Physical Action    how the body does it  rendered with the exact matched Action id
Camera Execution   how it is observed    rendered with shot scale, height, angle,
                                          movement, working distance, framing, timing
Compiler           how it is communicated rendered as one continuous script
```

The compiler never collapses these layers into generic prose and never rewrites
the body behaviour to obtain a nicer shot.

## Story depth

```text
one person · one small process · one micro-event · one state shift
natural beginning · causal middle · natural ending
```

Explicit prohibitions are emitted in `[NEGATIVE / DO-NOT]`: no pose montage, no
OOTD slideshow, no shoe showcase cutaway, no five disconnected lifestyle clips,
no commercial storyboard clichés, no second person, no invented event, no slow
motion or time stretching, no product morphing, no on-screen text or logo, and no
change to any Physical Action for a nicer shot.

## Sound

The compiler renders the existing Sound World output only:

```text
ENVIRONMENT · HUMAN · OBJECT · FOOTWEAR · SILENCE
```

It never invents music, dialogue, or voiceover, and every Moment block repeats
the naturalistic-only rule.

## Unsupported Moments

The four Physical Action gaps are rendered deterministically:

```text
PHYSICAL ACTION
CORRECT_UNSUPPORTED — no executable Physical Action is defined for this Moment
(missing capability: …). Do not invent a body action here.

CAMERA
CORRECT_UNSUPPORTED — no camera execution is issued for this Moment.
```

The Moment index, scene, sound, and product guard are still emitted, so the script
stays complete and the uncertainty stays visible. Nothing is silently omitted and
no Topic is excluded.

## Compiler validator

```text
npm run validate:narrative-seedance-compiler
scripts/validateNarrativeSeedanceCompiler.mjs
```

Checks, one per requirement:

```text
canonical_sections_consumed     all 14 canonical section families present
no_missing_moment               every canonical Moment appears once, in order
narrative_preserved             Moment text + story intent unchanged
scene_preserved                 Scene Resolver assignment unchanged
product_presence_preserved      every presence level emitted as a guard
sound_preserved                 Sound World cues + dominant category present
camera_role_preserved           Camera Narrative Role unchanged
physical_action_preserved       matched Action ids unchanged, gaps stay unsupported
camera_execution_preserved      executable plans carried, unsupported Moments empty
no_downstream_invention         no invented event, sound source, or action
reference_protection_present    product truth lock + manual reference upload instruction
no_provider_assumptions         no API key, endpoint, credential, or model route
copyable_complete_script        one self-contained copyable artifact with an ending state
```

Measured result:

```text
topics                     13
compiled                   13
complete scripts           13
moments                    65
correct unsupported         4
failed checks               0
determinism failures        0
provider dependency        NONE
```

## Debug surface

`ImmersiveNarrativeWorkspace` → `Debug / Internal` → **Compiler Diagnostics**
shows the schema version, the consumed section list, the correct-unsupported
count and indexes, the character count, the stage statuses, and every compiler
check with its reason. The final script itself is shown in the main output area
with 查看完整脚本 and 复制完整脚本.

## Git

```text
Git              UNAVAILABLE
Observed error   fatal: not a git repository: (null)
```
