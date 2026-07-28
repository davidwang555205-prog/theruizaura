export type PromptSectionAudience = "INTERNAL" | "QA" | "PROVIDER";

export type AtmospherePromptIR = {
  outputContract: { aspectRatio: string; standaloneImage: true; singleScene: true };
  scene: { description: string; requiredSpatialEvidence: string[]; lifeTrace: string; forbiddenCompetingScenes: string[] };
  visualDirection: { productResponsiveDirection: string; brandExpression: string; lightDirection: string; materialDirection: string; compositionDirection: string };
  selectedObjects: string[];
  negativeConstraints: string[];
  selectedCarrier?: string;
  profileMode: "RESOLVED" | "EXTERNAL_REFERENCE_ANALYSIS";
  curationPlanPresent: boolean;
};

export class Image2AtmospherePromptRenderError extends Error {
  constructor(public readonly code: "ATMOSPHERE_CURATION_PLAN_MISSING" | "PRODUCT_PROFILE_RESOLUTION_CONFLICT" | "PRODUCT_PROFILE_PLACEHOLDER_LEAK" | "ECHO_CARRIER_NOT_AVAILABLE_IN_SCENE" | "DUPLICATE_NEGATIVE_CONSTRAINT" | "MULTIPLE_SCENE_IN_PROVIDER_PROMPT" | "IMAGE2_ATMOSPHERE_PROMPT_TOO_LONG", message: string) { super(message); }
}

const canonicalNegatives = [
  "No product or footwear.",
  "No person, body part, reflection, silhouette, or human shadow.",
  "No collage, triptych, split panel, contact sheet, or multiple scene.",
  "Avoid showroom styling, advertising hierarchy, decorative symmetry, and generic lifestyle moodboard styling."
];

function wordCount(value: string) { return value.trim().split(/\s+/).filter(Boolean).length; }

export function renderImage2AtmospherePrompt(ir: AtmospherePromptIR): string {
  if (!ir.curationPlanPresent) throw new Image2AtmospherePromptRenderError("ATMOSPHERE_CURATION_PLAN_MISSING", "Atmosphere curation plan is required before Provider compilation.");
  if (ir.profileMode === "RESOLVED" && /analy[sz]e .*reference|currently attached/i.test(ir.visualDirection.productResponsiveDirection)) throw new Image2AtmospherePromptRenderError("PRODUCT_PROFILE_RESOLUTION_CONFLICT", "Resolved profile cannot also request deferred reference analysis.");
  if (/mixed|moderate|balanced|0\.5\s*\/\s*0\.5|softMaterialWeight|provenance|analysisVersion|curationSeed|candidateScores|history/i.test(ir.visualDirection.productResponsiveDirection + ir.visualDirection.materialDirection)) throw new Image2AtmospherePromptRenderError("PRODUCT_PROFILE_PLACEHOLDER_LEAK", "Raw or placeholder Product Profile data reached the Provider IR.");
  const objects = [...new Set(ir.selectedObjects.map((object) => object.trim()).filter(Boolean))];
  if (ir.selectedCarrier && ir.selectedCarrier !== "no dedicated physical carrier" && !objects.some((object) => ir.selectedCarrier?.toLowerCase().includes(object.toLowerCase()))) throw new Image2AtmospherePromptRenderError("ECHO_CARRIER_NOT_AVAILABLE_IN_SCENE", "Selected carrier is not present in the selected scene objects.");
  const competingScenes = ir.scene.forbiddenCompetingScenes.map((item) => item.trim()).filter(Boolean).slice(0, 2);
  const negatives = [...new Set([...canonicalNegatives, ...competingScenes.map((item) => `No competing scene cue: ${item}.`)])].filter(Boolean);
  const prompt = [
    `Generate exactly one standalone ${ir.outputContract.aspectRatio} portrait photograph. Single scene only.`,
    `${ir.scene.description} Show ${ir.scene.requiredSpatialEvidence.join(", ")}. ${ir.scene.lifeTrace}`,
    `${ir.visualDirection.productResponsiveDirection} ${ir.visualDirection.brandExpression}`,
    `${ir.visualDirection.lightDirection} ${ir.visualDirection.materialDirection} ${ir.visualDirection.compositionDirection}`,
    objects.length > 0 ? `Use only these already-justified scene elements: ${objects.join(", ")}.` : "Use only scene-justified elements; add no decorative carrier.",
    ir.selectedCarrier ? `Use ${ir.selectedCarrier} only as an existing, subtle scene property; do not add another object for Product Echo.` : "Use no dedicated physical color-matching object.",
    negatives.join(" ")
  ].join("\n\n");
  if ((prompt.match(/scene/gi) ?? []).length > 12) throw new Image2AtmospherePromptRenderError("MULTIPLE_SCENE_IN_PROVIDER_PROMPT", "Provider Prompt contains competing scene language.");
  if (wordCount(prompt) > 320) throw new Image2AtmospherePromptRenderError("IMAGE2_ATMOSPHERE_PROMPT_TOO_LONG", `Provider Prompt is ${wordCount(prompt)} words; maximum is 320.`);
  return prompt;
}
