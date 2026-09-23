# Immersive Narrative Camera Narrative Role V1

## Status

Implemented as an observation-relationship layer after Sound World approval.

```text
Narrative
        ↓
Scene Resolver
        ↓
Product Presence
        ↓
Sound World
        ↓
Camera Narrative Role
```

This layer does not define lens, focal length, shot size, camera height, movement parameters, product close-ups, Physical Action, Seedance, or Provider execution.

## Roles

```text
OBSERVER
FOLLOWER
WAITING_CAMERA
AFTER_ACTION
PARTIAL_OBSERVATION
```

- `OBSERVER`: the camera observes without interfering.
- `FOLLOWER`: the camera follows continuous subject movement.
- `WAITING_CAMERA`: the camera already exists in space and the subject enters or crosses it.
- `AFTER_ACTION`: the camera remains briefly after the main action ends.
- `PARTIAL_OBSERVATION`: one grounded part of the life action is observed, never as a product close-up.

## Assignment Rules

Role assignment reads in this order:

1. What Happens
2. movement state
3. scene transition
4. narrative position
5. ending logic

`HERO` product presence cannot turn a Moment into a product close-up. `READABLE` does not imply foot framing. `FOLLOWER` is rejected for stationary actions. `PARTIAL_OBSERVATION` requires a real hand, object, body, or transition reason and is limited to one Moment per plan.

If the final Moment still contains necessary movement or entry, `AFTER_ACTION` is not forced. A completed action with a settled aftertaste can use `AFTER_ACTION`.

## 13 Topic Baselines

```text
下班回家   WAITING_CAMERA / FOLLOWER / OBSERVER / OBSERVER / AFTER_ACTION
周末独处   OBSERVER / OBSERVER / FOLLOWER / OBSERVER / AFTER_ACTION
出门办事   OBSERVER / WAITING_CAMERA / FOLLOWER / FOLLOWER / OBSERVER
等朋友     OBSERVER / OBSERVER / PARTIAL_OBSERVATION / OBSERVER / AFTER_ACTION
午后咖啡   WAITING_CAMERA / OBSERVER / PARTIAL_OBSERVATION / OBSERVER / AFTER_ACTION
逛书店     FOLLOWER / OBSERVER / OBSERVER / PARTIAL_OBSERVATION / AFTER_ACTION
采购归来   FOLLOWER / WAITING_CAMERA / OBSERVER / PARTIAL_OBSERVATION / AFTER_ACTION
接孩子后   FOLLOWER / OBSERVER / FOLLOWER / OBSERVER / AFTER_ACTION
周末散步   WAITING_CAMERA / FOLLOWER / FOLLOWER / OBSERVER / AFTER_ACTION
午餐之后   WAITING_CAMERA / FOLLOWER / OBSERVER / FOLLOWER / AFTER_ACTION
城市闲逛   FOLLOWER / OBSERVER / FOLLOWER / PARTIAL_OBSERVATION / AFTER_ACTION
傍晚回家   FOLLOWER / WAITING_CAMERA / OBSERVER / OBSERVER / AFTER_ACTION
短途出行   WAITING_CAMERA / FOLLOWER / OBSERVER / WAITING_CAMERA / AFTER_ACTION
```

The actual V1 resolver may replace an ending `AFTER_ACTION` with `FOLLOWER` when the final Moment still contains active movement. This happens for Topics such as `周末散步`, `城市闲逛`, and `短途出行`.

## Special Guards

- `接孩子后`: the adult woman remains the narrative subject; the child is not a camera target.
- `周末独处`: no lonely-face push-in, isolation framing, or melancholy camera logic.
- `周末散步`: no fashion runway follow or cinematic hero walk.
- `城市闲逛`: no street-style editorial chase, tourist landmark framing, or fashion-photographer behavior.
- `短途出行`: no journey montage, airport departure framing, or travel-film language.

## QC

- `Narrative Preserved`
- `Role Motivated By Action`
- `No Product Driven Camera`
- `No Overdirection`

Only four PASS states produce:

```text
CAMERA_NARRATIVE_APPROVED
```

Invalid roles, a changed upstream Moment, product-driven camera, forced active ending, or overdirection produce `CAMERA_NARRATIVE_FAILED`.

## UI

The existing debug workspace now shows:

- Narrative → Scene Resolver → Product Presence → Sound World → Camera Narrative
- Role for each Moment
- Camera relationship intent
- Four Camera Narrative QC gates
- Failure reasons

No role dropdown, manual camera editor, lens control, shot-size control, camera movement control, or preview was added.

## Validation

```bash
npm run validate:narrative-camera-role
npm run validate:narrative-topic-pipeline
```

All 13 catalog Topics pass Camera Narrative Role V1. Validation includes motivated repetition, active-ending conflict, product-driven camera failure, product-close-up partial observation failure, overdirection failure, Sound World failure, Product Presence failure, and Narrative mutation failure.

## Current State

`CAMERA NARRATIVE ROLE V1 COMPLETE`

Physical Action Compiler, Camera Execution, Seedance Compiler, and Provider E2E remain unbuilt. Character Profile Catalog V1 now controls the upstream character selection.
