# Immersive Narrative Camera Execution V1

## Status

```text
Camera Execution V1   IMPLEMENTED + INTEGRATED INTERNAL PATH
Result                CAMERA_EXECUTION_APPROVED on 13 / 13 Topics
Moments               65 total · 61 executable · 4 CORRECT_UNSUPPORTED
QC                    11 / 11 gates PASS on every Topic
```

Camera Execution answers **how the camera physically executes** the observation
relationship that Camera Narrative Role already decided. It never re-decides the
role, never changes the Physical Action, and never lets Product Presence create a
body action or a camera move.

```text
Camera Narrative Role +
Physical Action +
Scene +
Narrative Moment +
Product Presence (guard only)
        ↓
Camera Execution Plan
```

## Existing AURA camera rules that were reused

No second camera system was created. The planner reads the existing AURA camera
modules:

```text
src/utils/cameraPerspectiveProfiles.ts   detectShoePerspectiveRisk + resolveCameraPerspectiveProfile
                                         risk classification, focal families, working-distance safety line
src/data/cameraLookProfiles.ts           AuraOutdoorReference camera look + negative look line
src/video-script/compileSeedanceVideoScript.ts
                                         constraint families already sent to the external model:
                                         locked observation, natural working distance,
                                         no low-angle or wide-angle shoe enlargement, fixed lens family
```

The topic lens family is not hand-picked. `resolveAuraTopicLensProfile` runs the
AURA perspective-risk detector over the real Moment texts and maps its profile to
one of the four approved families. Measured outcome for the 13 Topics:

```text
stabilized_50_70     11 Topics  (perspective risk medium)
standard_image_type   2 Topics  (perspective risk low: 周末独处, 接孩子后)
shoe_safe_60_85       0 Topics
telephoto_candid_105_180  0 Topics
```

## Role → execution mapping

```text
Camera Role          shot scale                camera height            movement            distance band
OBSERVER             medium_full               natural eye level        locked_off          3.0-3.5 m
FOLLOWER             medium_full               natural chest height     restrained_follow   3.0-3.5 m
WAITING_CAMERA       wide_environmental        natural eye level        locked_off          3.5-4.0 m
AFTER_ACTION         medium                    natural eye level        hold_position       2.5-3.0 m
PARTIAL_OBSERVATION  partial_body_observation  natural shoulder height  locked_off          2.5-3.0 m
```

Every executable Moment records `cameraPosition = off_travel_axis_established_side`.
FOLLOWER only ever attaches to a matched walking, turning, or transition
behaviour at a fixed working distance; it can never be attached to a stationary
action.

`PARTIAL_OBSERVATION` never becomes a product close-up: the partial view must keep
the hands, feet, or object readable, and the camera never advances to reveal more.

## Canonical output

```text
CameraExecutionPlan
  schemaVersion / plannerVersion / topicId / topicLabel / durationSeconds / status
  moments[]                 one record per canonical NarrativeMoment.index
  qc                        11 deterministic gates
  coverage                  totals, lens-family count, side switches, reset-to-front,
                            product-driven camera Moments, action rewrites
  continuityProfile         single lens family, focal range, perspective risk,
                            camera side, axis rule, reset-to-front policy
  cameraLook                AURA look line + negative look line
  restrictions              10 prohibited camera behaviours

CameraExecutionMoment
  momentIndex / purpose / sceneId / sceneName / continuityRole / cameraRole
  whatHappens
  physicalActionId / physicalActionStatus / physicalActionMovementState
  status                    EXECUTABLE | CORRECT_UNSUPPORTED
  shotScale / workingDistance / cameraPosition / cameraHeight / viewAngle
  lensFamily / lensLine / cameraMovement / movementRelationToSubject
  startFraming / endFraming / timing / transitionKind / transitionBehavior
  subjectVisibility
  productPresence / productVisibilityGuard / productReframeAllowed(false)
  productMayMotivateCamera(false) / reframeReason
  actionPreservation
  continuity { lensConsistentWithTopic, sideConsistentWithTopic,
               carriedFromPreviousFrame, note }
  reason / unsupportedReason
```

No field exists that has no execution purpose, and the record carries no
commercial-campaign vocabulary.

## Timing

```text
5 Moments   0.0-2.4 · 2.4-6.0 · 6.0-9.4 · 9.4-12.8 · 12.8-15.0
4 Moments   0.0-2.6 · 2.6-7.0 · 7.0-12.0 · 12.0-15.0
```

The allocation is deterministic, monotonic, and shared with the final Seedance
script. A `CORRECT_UNSUPPORTED` Moment receives no timing window, because no
executable action exists for it.

## Continuity

```text
single lens family per 15-second sequence          1 (enforced)
camera-side switches inside a sequence             0
reset-to-front re-established frames               0
carried frame from the previous executable Moment  continuity.carriedFromPreviousFrame
scene threshold crossing                           axis hold, no cut, no reverse angle
```

After a `CORRECT_UNSUPPORTED` Moment the next executable Moment re-opens from the
same camera side instead of pretending that continuity was preserved.

## Product Presence is a guard only

```text
ABSENT       no product framing may be introduced
INCIDENTAL   may stay visible only if the action-led frame already includes it
READABLE     stays readable inside the action-led framing, no dedicated shot
HERO         stays clearly readable inside the same framing,
             never motivates the camera or the action
```

```text
productReframeAllowed                         false on every Moment
productMayMotivateCamera                      false on every Moment
product-driven camera Moments                 0
product visibility guard emitted per Moment   65 / 65
```

## Correctly unsupported Moments

The four Physical Action gaps are never filled at the camera layer:

```text
下班回家 Moment index 2    CORRECT_UNSUPPORTED — missing capability SMALL_OBJECT_RETRIEVAL
采购归来 Moment index 1    CORRECT_UNSUPPORTED — transition state not compatible
傍晚回家 Moment index 1    CORRECT_UNSUPPORTED — missing capability CONTAINER_OBJECT_SEARCH
傍晚回家 Moment index 3    CORRECT_UNSUPPORTED — missing capability SMALL_OBJECT_RETRIEVAL
```

For these Moments `shotScale`, `workingDistance`, `cameraHeight`, `viewAngle`,
`lensFamily`, `cameraMovement`, framing, and timing are all `null`, and the plan
states that no camera execution is issued. Camera QC treats "no fabricate" as a
pass, not as a failure.

## Camera QC

Eleven deterministic gates, all measured by structure instead of aesthetics:

```text
physical_action_preserved
camera_role_preserved
no_product_driven_action
no_product_only_camera_motivation
no_impossible_follow
no_body_camera_collision
no_perspective_abuse
no_random_lens_jump
no_unmotivated_reframe
moment_continuity
natural_ending
```

Measured across the 13 Topics:

```text
gates                  11
topics approved        13 / 13
gate failures          0
unsupported with execution   0
action rewrites              0
impossible follows           0
```

`natural_ending` accepts a final `AFTER_ACTION`/`OBSERVER` hold, a motivated
follow that stops when the matched action ends, or a correctly unsupported final
Moment. It rejects a final Moment that re-establishes or re-frames itself.

## Validator

```text
npm run validate:narrative-camera-execution
scripts/validateNarrativeCameraExecution.mjs
```

It runs the shared pipeline over all 13 canonical Topics and asserts the role
mapping, canonical Moment index, single lens family, off-axis camera position,
valid monotonic timing, product-guard presence, and the honest
`CORRECT_UNSUPPORTED` state of the four gaps.

## Debug surface

`ImmersiveNarrativeWorkspace` → `Debug / Internal` → **Camera Execution** shows
the plan status, the continuity profile counters, every Moment record (including
the unsupported reason), the 11 QC gates, and the failure reasons. The section is
collapsed by default and contains no camera editor.

## Legacy integrity

```text
Existing 318 Actions modified   0
Legacy video-script output      unchanged (no file in src/video-script was modified)
Provider call                   none
```

## Git

```text
Git              UNAVAILABLE
Observed error   fatal: not a git repository: (null)
```
