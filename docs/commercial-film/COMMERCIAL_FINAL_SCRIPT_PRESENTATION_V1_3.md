# COMMERCIAL FILM V1.3 FINAL SCRIPT PRESENTATION LAYER

## Purpose

The Final Script Presentation Layer is a Commercial-only, read-only presentation transformation.

It converts the existing canonical Commercial Film plan into a client-facing director script without changing the Seedance execution baseline.

```text
Commercial Film canonical plan
+ frozen canonicalCompiledText
→ Final Script Presentation Layer
→ presentationScript
```

The source layer owns generation. The presentation layer only rewrites, compresses, deduplicates, and reorganizes existing information for readability.

## Hard Boundary

The presentation layer does not modify:

- Director Concept Engine
- Cinematic Devices
- Event Spine
- Commercial Intent logic
- Dynamic Timing
- Action Causality
- World Realism
- Product logic
- Compact Seedance Compiler
- `canonicalCompiledText`
- `canonical-baseline.json`
- Visual Acceptance Matrix
- Actions
- Narrative

The frozen Seedance execution prompt remains byte-for-byte unchanged.

## Data Model

The presentation result contains:

```ts
{
  canonicalCompiledText,
  presentationScript,
  directorScript
}
```

`canonicalCompiledText`

- The frozen Seedance execution source.
- Used only by the Seedance copy path and technical execution viewer.

`presentationScript`

- The complete client-facing director script.
- Deterministic for the same canonical plan.

`directorScript`

- Structured presentation data used by the UI.
- Includes title, creative idea, concept language, film structure, five shots, ending, and global notes.

## Presentation Rules

### Internal Language

The visible script does not expose internal phrases such as:

- selected commercial expression
- Beat 1 contributes
- execution state
- canonical
- validator
- enum
- event spine
- action causality

### Semantic Deduplication

Adjacent repeated instructions are removed.

The presentation layer does not keep duplicated token wording just to mirror the internal plan.

### Filmable Action

Visual lines use concrete, physically imaginable actions.

The layer may rewrite abstract system language, but it may not add a new event.

### Director Concept

The Director Concept is presented in human language.

The internal concept ID is never shown.

### Cinematic Device

The existing cinematic device label is shown directly.

### Shot Format

Each shot contains:

```text
Time
Visual
Camera
Product
Sound
Transition
```

Global character, wardrobe, product protection, visual look, and negative rules are not repeated inside every shot.

## UI Contract

The Commercial Film page shows the Director Script by default.

Controls are separated:

- 查看导演脚本
- 收起导演脚本
- 复制导演脚本
- 复制 Seedance Prompt
- 查看技术执行稿
- 收起技术执行稿

`复制导演脚本` returns `presentationScript`.

`复制 Seedance Prompt` returns the frozen `canonicalCompiledText`.

The technical execution viewer is hidden by default.

## Validation

```bash
npm run validate:commercial-final-script-presentation
```

The validator checks:

1. canonicalCompiledText unchanged
2. canonical baseline hashes unchanged
3. Director Engine unchanged
4. Actions unchanged
5. Narrative unchanged
6. all 12 acceptance cases retain original canonicalCompiledText
7. presentationScript deterministic
8. no enum leakage
9. no validator leakage
10. no Action ID leakage
11. no known internal-language phrases
12. no adjacent semantic duplication
13. all original shots represented
14. original timing unchanged
15. no new factual product claims
16. no new events invented

The regression snapshot is written to:

```text
artifacts/commercial-film/v1.3-final/presentation-regression.json
```

It records a canonical text hash and presentation hash for every frozen case.

## Stop Boundary

This layer does not authorize:

- V1.4
- Brand Translation Layer
- new Director Concepts
- new Creative Modes
- changes to the frozen Seedance execution baseline
