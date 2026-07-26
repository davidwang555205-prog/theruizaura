import type { PromptRule } from "../contracts";
import { PromptPriority } from "../contracts";

export const IMAGE_TYPE_PROFILES: Record<string, { label: string; rules: PromptRule[] }> = {
  "产品上脚图": {
    label: "Product On-Foot",
    rules: [
      { id: "img-onfoot-product-primary", section: "product", text: "THERUIZ AURA German trainer as the main product reference. The sneaker must be the visual anchor of the image while keeping the person and scene natural.", priority: PromptPriority.P1_PRODUCT_HARD_LOCK, source: "image-type-profile", appliesWhen: {}, required: true, tags: ["image-type"] },
      { id: "img-onfoot-laces", section: "product", text: "Keep laces naturally tied, with readable loops, lace ends, eyelets, and tongue.", priority: PromptPriority.P1_PRODUCT_HARD_LOCK, source: "image-type-profile", appliesWhen: {}, tags: ["image-type"] },
    ],
  },
  "对镜穿搭图": {
    label: "Mirror Outfit",
    rules: [
      { id: "img-mirror-phone-only", section: "action", text: "Use the phone as the only primary handheld object. Keep the phone grip natural and the reflection proportions stable.", priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY, source: "image-type-profile", appliesWhen: {}, tags: ["image-type"] },
      { id: "img-mirror-shoe-visible", section: "product", text: "At least one sneaker must be clearly readable in the mirror reflection with correct left-right orientation.", priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY, source: "image-type-profile", appliesWhen: {}, tags: ["image-type"] },
    ],
  },
  "生活场景图": {
    label: "Lifestyle Scene",
    rules: [
      { id: "img-lifestyle-daily", section: "scene", text: "Set the moment in a real contemporary urban scene with natural depth, believable pavement or interior texture, and a friend-taken daily photo feeling.", priority: PromptPriority.P4_SCENE_AND_ACTION, source: "image-type-profile", appliesWhen: {}, tags: ["image-type"] },
      { id: "img-lifestyle-shoe-readable", section: "product", text: "Keep the sneakers clearly visible and structurally accurate within the scene, as if carried through a real day.", priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY, source: "image-type-profile", appliesWhen: {}, tags: ["image-type"] },
    ],
  },
  "非产品氛围图": {
    label: "Non-Product Atmosphere",
    rules: [
      { id: "img-atmosphere-secondary", section: "product", text: "The sneaker may appear only as a subtle partial object or background detail, not as the main product subject; do not force full on-foot display.", priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY, source: "image-type-profile", appliesWhen: {}, required: true, tags: ["image-type"], conflictsWith: ["product-accuracy-uploaded-reference"] },
      { id: "img-atmosphere-no-person", section: "model", text: "Do not show a full person, model, face, or portrait. Express the scene through still-life details, spatial cues, and quiet daily traces.", priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY, source: "image-type-profile", appliesWhen: {}, required: true, tags: ["image-type"], conflictsWith: ["model-identity-real-person"] },
    ],
  },
  "拍摄花絮 / 材质图": {
    label: "Behind-The-Scenes / Material",
    rules: [
      { id: "img-bts-material-focus", section: "product", text: "Show only the relevant sneaker sample, shoelace, panel, material transition, or partial product detail. Hands, swatches, and working traces are allowed but must remain secondary to the material story.", priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY, source: "image-type-profile", appliesWhen: {}, tags: ["image-type"] },
    ],
  },
  "产品静物图": {
    label: "Product Still Life",
    rules: [
      { id: "img-still-product-only", section: "product", text: "Generate premium still-life product photography with the selected THERUIZ AURA sneaker as the main subject. Keep material, laces, tongue, outsole, and product scale clearly readable.", priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY, source: "image-type-profile", appliesWhen: {}, required: true, tags: ["image-type"] },
    ],
  },
};
