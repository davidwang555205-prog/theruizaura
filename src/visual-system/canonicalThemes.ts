import canonicalJson from "../../visual-system/themes/canonical-theme-specifications-v1.json";

export type CanonicalThemeStatus = "active" | "supporting_library" | "retired" | "merged";

export type CanonicalThemeSpecification = {
  theme_id: string;
  version: string;
  status: CanonicalThemeStatus;
  title_zh: string;
  title_en: string;
  content_purpose: string;
  audience_impression: string;
  narrative_moment: string;
  person_presence: string;
  person_state: string;
  gaze_behavior: string;
  action_logic: string;
  styling_boundary: string;
  scene_type: string;
  scene_evidence: string[];
  space_density: string;
  light_language: string;
  color_language: string;
  material_language: string;
  camera_distance: string;
  camera_angle: string;
  composition_logic: string;
  product_presence: string;
  product_visibility_requirement: string;
  required_product_evidence: string[];
  allowed_natural_deformation: string[];
  prohibited_product_changes: string[];
  positive_visual_evidence: string[];
  hard_negative_rules: string[];
  related_A_B_C_roles: string[];
  variation_axes: string[];
  repetition_controls: string[];
  QA_requirements: string[];
  validation_priority: "high" | "medium" | "low";
  merged_from?: string[];
  canonical_target?: string;
  retirement_reason?: string;
  replacement_theme?: string;
}

const requiredStringFields: Array<keyof CanonicalThemeSpecification> = [
  "theme_id", "version", "title_zh", "title_en", "content_purpose", "audience_impression", "narrative_moment", "person_presence", "person_state", "gaze_behavior", "action_logic", "styling_boundary", "scene_type", "space_density", "light_language", "color_language", "material_language", "camera_distance", "camera_angle", "composition_logic", "product_presence", "product_visibility_requirement"
];

const requiredArrayFields: Array<keyof CanonicalThemeSpecification> = [
  "scene_evidence", "required_product_evidence", "allowed_natural_deformation", "prohibited_product_changes", "positive_visual_evidence", "hard_negative_rules", "related_A_B_C_roles", "variation_axes", "repetition_controls", "QA_requirements"
];

export function validateCanonicalThemeSpecifications(value: unknown): CanonicalThemeSpecification[] {
  if (!value || typeof value !== "object" || !Array.isArray((value as { themes?: unknown }).themes)) throw new Error("Canonical theme specification must contain a themes array.");
  const themes = (value as { themes: unknown[] }).themes as CanonicalThemeSpecification[];
  const ids = new Set<string>();
  for (const theme of themes) {
    if (!theme || typeof theme !== "object") throw new Error("Canonical theme entry must be an object.");
    if (ids.has(theme.theme_id)) throw new Error(`Duplicate canonical theme_id: ${theme.theme_id}.`);
    ids.add(theme.theme_id);
    for (const field of requiredStringFields) if (typeof theme[field] !== "string" || !String(theme[field]).trim()) throw new Error(`Canonical theme ${theme.theme_id} is missing ${field}.`);
    for (const field of requiredArrayFields) if (!Array.isArray(theme[field]) || theme[field].length === 0) throw new Error(`Canonical theme ${theme.theme_id} is missing ${field}.`);
    if (theme.status === "retired") throw new Error(`Retired canonical theme cannot be loaded: ${theme.theme_id}.`);
    if (theme.status === "merged" && (!theme.canonical_target || theme.merged_from?.includes(theme.canonical_target))) throw new Error(`Merged theme ${theme.theme_id} must point to a separate canonical target.`);
    if (theme.product_presence.includes("product") && theme.required_product_evidence.some((item) => /burgundy|ivory|sku|colorway/i.test(item))) throw new Error(`Canonical theme ${theme.theme_id} must not hard-code the current SKU.`);
  }
  return themes;
}

export const canonicalThemeSpecifications = validateCanonicalThemeSpecifications(canonicalJson);
