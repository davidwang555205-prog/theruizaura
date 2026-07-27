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

const englishCaseDirections: Record<string, string> = {
  A1: "Relaxed seated lifestyle frame with natural body weight, at least one complete sneaker, and believable city daylight.",
  A2: "Standing transition near a doorway or street corner with a clear behavioral pause, complete product visibility, and real urban surface materials.",
  A3: "Relaxed seated moment showing tactile relationships between person, clothing, chair, table, and sneaker under warm natural light.",
  A4: "Restrained crossed-leg posture with physically correct relationships between legs, feet, shoes, and garments; keep one sneaker fully visible.",
  B1: "Warm-gray studio lower-third showing mature styling, a complete sneaker, and a garment hem clear of all product details.",
  B2: "Quiet official studio back view with natural weight distribution, credible garment rear construction, and a readable heel relationship.",
  B3: "Official studio front full-body portrait with a mature calm presence, clean silhouette, and clearly identifiable product at natural scale.",
  B4: "Official studio three-quarter side standing view with relaxed weight transfer and a complete, structurally readable sneaker silhouette.",
  C1: "Complete lateral product profile with full toe-to-heel structure, warm pale background, and a physically plausible contact shadow.",
  C2: "On-foot close-up only when the foot is naturally seated; preserve the shoe geometry and do not invent unsupported on-foot details.",
  C3: "Paired-sneaker three-quarter still life with accurate spacing, scale, material contrast, and grounded contact shadows.",
  C4: "Heel and material craft close-up focused on collar, heel counter, stitching, leather or suede contrast, and outsole termination.",
  C5: "Top-down product view showing toe-box structure, tongue, settled white laces, panel geometry, and consistent material detail."
};

export const productTruthLock = "Preserve the uploaded sneaker exactly: burgundy and ivory color blocking, low-cut silhouette, rounded toe box, slim brown outsole, side panels, heel counter, tongue, white laces, visible stitching, leather and suede material contrast, and original proportions. Use the uploaded Product Truth as the sole product source. Allow only subtle natural flex and grounded contact shadow; never redesign, recolor, replace, enlarge, or reshape the shoe.";

export function assertImage2ProviderPrompt(prompt: string): string {
  if (!prompt.trim()) throw new Error("Image2 Provider-ready Prompt must not be empty.");
  // Reject Chinese ideographs only; legal provider punctuation, brand names, and other scripts remain valid.
  if (/[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/.test(prompt)) throw new Error("Image2 Provider-ready Prompt must not contain Chinese characters.");
  for (const phrase of ["burgundy and ivory", "low-cut silhouette", "rounded toe box", "slim brown outsole", "side panels", "heel counter", "tongue", "white laces", "stitching", "material contrast", "original proportions"]) {
    if (!prompt.includes(phrase)) throw new Error(`Image2 Provider-ready Prompt is missing Product Truth field: ${phrase}.`);
  }
  return prompt;
}

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
  return cases.map((item) => {
    const prompt = assertImage2ProviderPrompt([
      `THERUIZ AURA Image2 visual validation case ${item.id}.`,
      englishCaseDirections[item.id] ?? "Create a realistic, commercially usable validation image.",
      productTruthLock,
      "Inherit only the abstract brand visual language from the selected anchor; anchors are not Product Truth.",
      "Keep anatomy, hands, garment edges, shoe collar, tongue, laces, outsole, and floor contact separately readable with no clipping, floating product, duplicate shoe, distorted anatomy, plastic CGI, or generic catalog cutout.",
      "Do not invent logos, signage, unsupported on-foot evidence, or product details."
    ].join(" "));
    return {
    ...item,
    providerReadyPrompt: prompt,
    referencePlan: truth.confidence === "Blocked" ? [] : truth.evidence.map((evidence) => evidence.id),
    status: truth.confidence === "Blocked" || truth.confidence === "Low" ? "pending" : "pending",
    };
  });
}
