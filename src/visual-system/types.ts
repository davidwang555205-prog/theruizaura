export type FrozenStatus = "approved_frozen" | "validation_only" | "approved";
export type ProductTruthConfidence = "High" | "Medium" | "Low" | "Blocked";

export type BrandVisualMother = {
  version: string;
  status: FrozenStatus;
  brand: string;
  core_positioning: string;
  audience_visual_age_range: { min: number; max: number };
  age_routing_by_product_forbidden: boolean;
  product_is_visual_director: boolean;
  product_truth_source: "current_task_uploaded_images";
  fixed_rules: string[];
  variable_rules: string[];
};

export type Anchor = {
  id: string;
  group: "lifestyle" | "official_studio" | "product_presentation";
  file: string;
  status: "approved";
  authority: "brand_visual_reference";
  not_product_truth: true;
};

export type AnchorManifest = { version: string; anchors: Anchor[] };
export type ProductEvidenceRole = "overall_structure" | "top_front" | "heel_side" | "material_craft" | "on_foot";
export type ProductEvidence = { id: string; name: string; role: ProductEvidenceRole; file?: string };
export type ProductTruth = { confidence: ProductTruthConfidence; evidence: ProductEvidence[]; missingEvidence: ProductEvidenceRole[]; source: "current_task_uploaded_images" };
export type ValidationCase = { id: string; group: string; role: string; validation_goal: string; product_weight: string; recommended_ratio: string; required: string[]; avoid: string[] };
export type ValidationTask = ValidationCase & { providerReadyPrompt: string; referencePlan: string[]; status: "pending" | "repair" | "pass" | "reject"; resultFile?: string };

export function validateFrozenMother(value: BrandVisualMother): BrandVisualMother {
  if (value.status !== "approved_frozen") throw new Error("Brand visual mother must remain approved_frozen.");
  if (value.product_is_visual_director) throw new Error("Product cannot be the visual director.");
  if (!value.age_routing_by_product_forbidden) throw new Error("Product-based age routing must be forbidden.");
  if (value.product_truth_source !== "current_task_uploaded_images") throw new Error("Product truth must come from current task uploads.");
  return value;
}

export function validateAnchors(value: AnchorManifest): AnchorManifest {
  if (value.anchors.length !== 13 || value.anchors.some((anchor) => !anchor.not_product_truth || anchor.status !== "approved")) throw new Error("Anchor manifest must contain 13 approved brand-only anchors.");
  return value;
}

export function buildProductTruth(evidence: ProductEvidence[]): ProductTruth {
  const required: ProductEvidenceRole[] = ["overall_structure", "top_front", "heel_side", "material_craft"];
  const present = new Set(evidence.map((item) => item.role));
  const missingEvidence = required.filter((role) => !present.has(role));
  const confidence: ProductTruthConfidence = evidence.length === 0 ? "Blocked" : missingEvidence.length === 0 ? "High" : missingEvidence.length <= 2 ? "Medium" : "Low";
  return { confidence, evidence, missingEvidence, source: "current_task_uploaded_images" };
}

export function buildValidationTasks(cases: ValidationCase[], truth: ProductTruth): ValidationTask[] {
  return cases.map((item) => ({
    ...item,
    providerReadyPrompt: `THERUIZ AURA visual validation case ${item.id}. Inherit the abstract brand visual mother only; use current uploaded Product Truth as the sole product fact source. ${item.validation_goal} Do not infer age, scene, material, or product structure from an anchor.`,
    referencePlan: truth.confidence === "Blocked" ? [] : truth.evidence.map((evidence) => evidence.id),
    status: truth.confidence === "Blocked" || truth.confidence === "Low" ? "pending" : "pending",
  }));
}
