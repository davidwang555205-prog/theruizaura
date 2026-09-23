# Immersive Narrative Scene Resolver V1

## Status

Implemented as an isolated module after the approved Narrative Planner V1 output. It maps approved moments to the current Lifestyle Scene Library without rewriting the Narrative or entering downstream execution systems.

## Scene Library Audit

- Canonical Lifestyle pool: `src/data/lifestyleSoftSeedingScenePool.ts`
- Scene records: 39 after the Phase 2.5 coverage patch, including 3 Narrative coverage scenes excluded from legacy Lifestyle auto-rotation
- Stable IDs: present for every pool entry
- Scene labels: unique inside the pool
- Content categories: `natural_life`, `urban_commute`
- Capture styles: `standard`, `telephoto_candid`
- Season metadata: `supportedSeasons`
- `src/data/teamSceneOptions.ts` is an image-type compatibility list, not a second scene-record source.
- `src/utils/teamPromptCore.ts` contains prompt text for scene preferences, not canonical scene records.
- `src/data/sceneBlocks.ts` contains legacy scene blocks used by the existing video context resolver.

## Resolver Boundary

```text
Narrative Planner
        ↓
APPROVED_FOR_SCENE_RESOLUTION
        ↓
Scene Resolver V1
        ↓
SCENE_RESOLUTION_APPROVED / SCENE_RESOLUTION_FAILED
```

The resolver does not:

- create or modify scenes
- rewrite moments
- reorder moments
- change Micro Event or Emotional Arc
- use fuzzy scoring, vectors, or an LLM
- compile camera, motion, Product Presence, Sound, or Seedance output

## Location Worlds

V1 uses an explicit mapping inside the Immersive Narrative module. It reads the current pool IDs and does not modify the pool schema.

Implemented worlds:

- `HOME_ARRIVAL`
- `LEAVING_HOME`
- `BOOKSTORE_VISIT`
- `CAFE_VISIT`
- `OFFICE_ENTRANCE_WAIT`
- `RETURNING_WITH_PURCHASES`

## Current Topic Coverage

```text
下班回家       SCENE_RESOLUTION_APPROVED
出门           SCENE_RESOLUTION_APPROVED
周末书店       SCENE_RESOLUTION_APPROVED
等人           SCENE_RESOLUTION_APPROVED
咖啡馆         SCENE_RESOLUTION_APPROVED
采购归来       SCENE_RESOLUTION_APPROVED
```

The three former failures are resolved by adding only the required coverage scenes. Resolver rules and fail-closed QC remain unchanged.

## QC Gates

- All Moments Resolved
- Location Continuity
- Narrative Preserved
- No Scene Invention

Only four `PASS` results produce:

```text
SCENE_RESOLUTION_APPROVED
```

## UI

The existing `ImmersiveNarrativeWorkspace` now displays:

- Planner approval state
- Scene Resolver approval or failure
- Location World
- Moment-to-scene mapping
- Scene Resolver QC
- failure reasons

No manual scene editing or additional configuration surface is provided.

## Validation

```bash
npm run validate:narrative-planner
npm run validate:narrative-scene-resolver
npm run validate:narrative-scene-coverage
npm run typecheck
npm run build
npm run validate:video-script
```

The Scene Resolver validator covers valid resolution, invalid narrative status, missing scene IDs, cross-world requirements, mutation-required narratives, four-moment compatibility, the original six topics, and backward-compatibility hashes. The topic-pipeline validator runs all 13 catalog topics through Scene Resolver.

## Current State

`IMPLEMENTED / UI ACCESSIBLE`

Scene Resolver V1 is integrated with the Narrative Workspace. Product Presence Curve V1 and Sound World V1 consume its approved output, and Camera Narrative Role V1 completes the observation layer. Physical Action Compiler, Camera Execution, Seedance integration, Audio Generation, and Provider E2E remain unbuilt.
