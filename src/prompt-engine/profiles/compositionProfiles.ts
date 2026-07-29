import type { PromptRule, CompositionMode } from "../contracts";
import { PromptPriority } from "../contracts";

export const COMPOSITION_PROFILES: Record<CompositionMode, { label: string; rules: PromptRule[] }> = {
  fullFigure: {
    label: "Full Figure",
    rules: [
      { id: "comp-full-body-proportion", section: "scene", text: "Frame the full body from head to toe with natural proportions, one foot slightly forward, both sneakers clearly grounded and readable.", priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY, source: "composition-profile", appliesWhen: {}, tags: ["composition"] },
      { id: "comp-full-natural-stance", section: "action", text: "Use a relaxed balanced stance with a soft weight shift, asymmetrical arm placement, and a calm daily expression.", priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY, source: "composition-profile", appliesWhen: {}, tags: ["composition"] },
    ],
  },
  studioLowerThird: {
    label: "Studio Lower Third",
    rules: [
      { id: "comp-lower-crop", section: "scene", text: "Crop from the waist or upper thigh to the floor. Keep garment hem, shoe collar, toe box, laces, outsole, and ground contact clearly readable.", priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY, source: "composition-profile", appliesWhen: {}, tags: ["composition"] },
      { id: "comp-lower-no-face", section: "model", text: "Face, expression, hairstyle, and upper body rules are excluded for this composition.", priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY, source: "composition-profile", appliesWhen: {}, required: true, tags: ["composition"], conflictsWith: ["model-identity-real-person", "model-real-human-detail"] },
    ],
  },
  studioOnFootDetail: {
    label: "Studio On-Foot Detail",
    rules: [
      { id: "comp-onfoot-crop", section: "scene", text: "Use a controlled close framing from mid-calf or garment edge to the floor, showing toe curve, side panels, lace area, slim outsole, and natural ground contact.", priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY, source: "composition-profile", appliesWhen: {}, tags: ["composition"] },
      { id: "comp-onfoot-no-person", section: "model", text: "Person identity, face, hairstyle, and expression rules are excluded. Keep both hands outside the frame.", priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY, source: "composition-profile", appliesWhen: {}, required: true, tags: ["composition"], conflictsWith: ["model-identity-real-person", "model-real-human-detail"] },
    ],
  },
  studioThreeQuarter: {
    label: "Studio Three-Quarter",
    rules: [
      { id: "comp-threequarter-angle", section: "scene", text: "Use a 3/4 front-side framing with the body turned approximately 30 degrees toward camera. At least one sneaker must be fully visible from toe to heel.", priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY, source: "composition-profile", appliesWhen: {}, tags: ["composition"] },
    ],
  },
  mirrorFull: {
    label: "Mirror Full",
    rules: [
      { id: "comp-mirror-phone", section: "action", text: "Use a natural mirror outfit pose with the phone hiding or cropping the face, realistic mirror proportions, one foot slightly forward, relaxed shoulders, and both sneakers clearly reflected.", priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY, source: "composition-profile", appliesWhen: {}, tags: ["composition"] },
      { id: "comp-mirror-no-face", section: "model", text: "The face is hidden by the phone or cropped. Do not load direct eye contact, catchlight, or facial expression rules.", priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY, source: "composition-profile", appliesWhen: {}, required: true, tags: ["composition"] },
    ],
  },
  mirrorThreeQuarter: {
    label: "Mirror Three-Quarter",
    rules: [
      { id: "comp-mirror-3q-phone", section: "action", text: "Use a 3/4 mirror check with phone partially covering the face while keeping the outfit, body line, and at least one sneaker clearly visible in the reflection.", priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY, source: "composition-profile", appliesWhen: {}, tags: ["composition"] },
    ],
  },
  mirrorSeated: {
    label: "Mirror Seated",
    rules: [
      { id: "comp-mirror-seated", section: "action", text: "Use a seated mirror pose with natural knee spacing, grounded feet, and clear sneaker visibility in the reflection. Keep body weight realistic and the seat structure believable.", priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY, source: "composition-profile", appliesWhen: {}, tags: ["composition"] },
    ],
  },
  onFootLifestyle: {
    label: "On-Foot Lifestyle",
    rules: [
      { id: "comp-lifestyle-real", section: "scene", text: "Place the person in a real daily setting with natural depth, soft fabric movement, believable ground contact, and an outfit that feels easy to wear.", priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY, source: "composition-profile", appliesWhen: {}, tags: ["composition"] },
    ],
  },
  stillLife: {
    label: "Still Life",
    rules: [
      { id: "comp-still-product", section: "product", text: "The sneaker is the absolute subject. Keep accurate color, material texture, panel boundaries, laces, outsole, and product scale. Use a clean matte surface with diffused light.", priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY, source: "composition-profile", appliesWhen: {}, tags: ["composition"] },
      { id: "comp-still-no-person", section: "model", text: "The product stands alone with clean negative space; human presence and action are excluded from this still-life frame.", priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY, source: "composition-profile", appliesWhen: {}, required: true, tags: ["composition"], conflictsWith: ["model-identity-real-person"] },
    ],
  },
  materialDetail: {
    label: "Material Detail",
    rules: [
      { id: "comp-material-focus", section: "product", text: "Focus on one specific material zone: suede grain, leather surface, mesh texture, stitching route, lace thickness, or panel transition. Keep the detail readable and the product context clear.", priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY, source: "composition-profile", appliesWhen: {}, tags: ["composition"] },
      { id: "comp-material-no-person", section: "model", text: "No person or full-shoe product rules. Focus on the material zone only.", priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY, source: "composition-profile", appliesWhen: {}, required: true, tags: ["composition"], conflictsWith: ["model-identity-real-person"] },
    ],
  },
  atmosphere: {
    label: "Atmosphere",
    rules: [
      { id: "comp-atmosphere-no-product", section: "product", text: "The sneaker is secondary or optional. Express quiet order, warm restraint, calm negative space, and refined lifestyle atmosphere.", priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY, source: "composition-profile", appliesWhen: {}, required: true, tags: ["composition"], conflictsWith: ["product-accuracy-uploaded-reference"] },
      { id: "comp-atmosphere-no-person", section: "model", text: "No person, model, face, or portrait rules. Express the scene through still-life details, spatial cues, objects, and quiet daily traces.", priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY, source: "composition-profile", appliesWhen: {}, required: true, tags: ["composition"], conflictsWith: ["model-identity-real-person"] },
    ],
  },
};
