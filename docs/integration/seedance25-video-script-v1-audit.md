# THERUIZ AURA Seedance 2.5 Video Script V1 — Minimal Integration Audit

Audit baseline: `davidwang555205-prog/theruizaura` `main` at `a6eab6c46b28062358048b015940ae3543552211`.

Scope is intentionally narrow: identify the safest insertion point for a manual-copy Seedance 2.5 video-script mode. This does **not** introduce video generation runtime, provider calls, polling, QC runtime, retries, storage, or model channels.

## 1. Current Prompt Engine architecture

Current general Prompt Builder path:

```text
TeamPromptParams
→ App.compileCurrentReferenceBinding
→ current task Product Truth / reference binding
→ generatePromptRuntime
→ buildPromptProfileInput
→ compilePrompt
→ collect / conflict resolve / budget / assemble / validate
→ Image2 prompt
→ copy
```

`compilePrompt` and its contracts are Image2-oriented. V1 video script must not broaden those contracts into a multi-provider production runtime.

## 2. Brand Visual entry

Authoritative brand source already exists at:

- `visual-system/config/brand-visual-mother-v1.2.json`
- exported as `brandVisualMother` by `src/visual-system/index.ts`

Video script should consume this frozen brand source directly. It must not create a second THERUIZ AURA style system.

## 3. Product Context / Product Truth entry

Current task uploads are bound through:

- `src/visual-system/taskReferenceBinding.ts`
- `bindTaskProductTruth`
- `productTruthPromptLines`
- `referencePlan`

This is reusable as upstream evidence. The Image2-specific `referencePlan.provider` field is not carried into video runtime; video V1 translates only the confirmed asset order / coverage into its own `VideoReferenceMapping`.

## 4. Scene / Season / Person data

Reusable inputs already live in:

- `TeamPromptParams`
- `src/data/teamSceneOptions.ts`
- `src/data/teamModelProfiles.ts`
- existing season field and wardrobe selection state

V1 does not create a second user-input schema.

## 5. Prompt compiler entry

Do not insert video logic inside `src/prompt-engine/compilePrompt.ts`.

Correct V1 split:

```text
same current TeamPromptParams + Product Truth binding
├─ IMAGE → existing generatePromptRuntime / compilePrompt
└─ VIDEO SCRIPT → compileSeedance25VideoScript
```

This makes video a sibling compiler, not a new provider inside the existing Image2 compiler.

## 6. REUSE

- `TeamPromptParams`
- `brandVisualMother`
- current uploaded-reference Product Truth binding
- confirmed reference order / coverage
- model profile text
- current scene / season / wardrobe selections
- current copy-only UX pattern

## 7. EXTEND

- Prompt Builder output mode: Image Prompt / Video Script
- current UI passes the same bound `TeamPromptParams` into the video compiler
- selected deterministic wardrobe line may be passed into video compiler when available

No existing Image2 contract needs to change for V1.

## 8. VIDEO-ONLY

Added under `src/video-script/`:

- `contracts.ts`
- `libraries.ts`
- `filmSpecs.ts`
- `compiler.ts`
- `VideoScriptControls.tsx`
- `index.ts`

These own:

- `VideoSceneSpec`
- independent 10s / 15s `FilmSpec`
- Motion Library
- Camera Library
- Product Protection translation
- Video Reference Mapping
- Seedance 2.5 manual-copy compiler

## 9. FilmSpec placement

FilmSpec belongs after resolved SceneSpec and before final prompt compilation:

```text
THERUIZ AURA inputs
→ VideoSceneSpec
→ FilmSpec(10s | 15s)
→ Motion + Camera
→ Product Protection
→ Reference Mapping
→ Seedance 2.5 compiler
→ Copy Prompt
```

10s is a three-beat structure; 15s is a four-beat structure with a dedicated product-evidence beat. 10s is not a scaled-down 15s timeline.

## 10. Image Prompt regression protection

V1 guardrails:

- do not change `PromptProfileInput`
- do not change `CompiledPromptResult`
- do not change `compilePrompt`
- do not change `generatePromptRuntime`
- do not change `GenerationService`
- do not add video provider / adapter / polling / storage
- keep duration state outside `TeamPromptParams`
- only branch at the final user-selected output mode

This keeps the existing image path byte-for-byte untouched by the new video compiler until the UI explicitly selects Video Script mode.

## Current implementation status

Core video-script layer and a thin reusable UI control are implemented on branch:

`feature/theruiz-seedance25-video-script-v1`

Remaining integration is deliberately small: mount `VideoScriptControls` inside the existing Prompt Builder and pass the current bound `params`, current `selectedOutfitLine` when available, and copy-status callback. No production runtime work is required.
