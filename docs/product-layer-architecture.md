# Product layer architecture

Prompt generation now resolves a `ProductContext` before composing the prompt. The core generator depends on `ProductPromptAdapter`, while product-specific rules live under `src/modules/product/<mode>`.

- `shoe` preserves the legacy `shoe` and `customShoe` inputs through `resolveProductContext` and the shoe adapter.
- `garment` provides an independent adapter and garment-specific rule functions without changing the shoe UI or image workflow in this phase.
- Shared scene, model, outfit, continuity, and safety pipelines remain in `teamPromptCore`; product adapters supply product line, accuracy, visibility, clipping, scene, image-type, action, negative, and styling-boundary fragments.
- Legacy callers remain valid because omitted `productContext` falls back to the existing shoe inputs.

The next garment UI phase can add a garment reference/spec editor and pass a garment context without reintroducing shoe-specific branches into the core generator.
