# Immersive Narrative Planner V1

## Status

Implemented as an isolated planning module. It does not modify the existing Lifestyle Video compiler, Prompt Runtime, JSON planning data, Scene Resolver, Product Presence Curve, Sound World, Camera Narrative Role, or Seedance Compiler.

## Purpose

Narrative Planner operates before the existing execution system. It answers only:

- what observable state the character is in
- what one small everyday event occurs
- how the character physically responds
- how the five moments depend on one another
- how the character returns to ordinary life with one slight state change

It deliberately does not decide camera, lens, framing, leg pose, footwear protection, reference mapping, or provider motion.

## V1 Contract

Input:

```text
Topic
Character Selection
Season
Lifestyle Feeling
Duration = 15 seconds
Available Scene Library
```

Output:

```text
[NARRATIVE CORE]
[MOMENT CHAIN]
[NARRATIVE QC]
Narrative Status
```

The normal handoff status is:

```text
APPROVED FOR SCENE RESOLUTION
```

## Implemented Archetypes

- `ordinary_return_home` - 下班回家
- `ordinary_departure` - 出门
- `bookstore_passing_notice` - 周末书店
- `ordinary_waiting` - 等人
- `cafe_arrival` - 咖啡馆
- `ordinary_errand_return` - 采购归来

Unsupported topics fail closed with `UNSUPPORTED_TOPIC` instead of producing a generic lifestyle montage.

## Runtime Boundary

- New source module: `src/immersive-narrative/`
- Standalone UI entry: `Immersive Narrative`
- Existing Lifestyle Video compiler: unchanged
- Existing Prompt Runtime: unchanged
- Existing Soft Seeding JSON behavior: unchanged
- Provider execution: not part of this module
- Current implementation status: `IMPLEMENTED`; Character Profile Catalog V1 resolves the upstream character selection, and the approved output is consumed by Scene Resolver V1, Product Presence Curve V1, Sound World V1, and Camera Narrative Role V1. Physical Action, Camera Execution, Seedance, audio generation, and a real video Provider remain not integrated.

## Validation

```bash
npm run validate:narrative-planner
npm run typecheck
npm run build
```

The validator checks:

- all 13 catalog Topic archetypes through the topic-pipeline validator
- exactly five moments in the standard purpose order
- all eight Narrative QC gates
- one continuous 15-second location world
- scene-library containment
- deterministic output
- forbidden camera, product, and performance language
- hash-based backward compatibility for the existing Image Prompt, Lifestyle JSON, Seedance script, and unified Lifestyle video script
