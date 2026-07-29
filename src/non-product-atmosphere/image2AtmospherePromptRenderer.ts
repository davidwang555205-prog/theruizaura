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

function naturalCueList(cues: string[]): string {
  const cleaned = cues.map((cue) => cue.trim().replace(/\.$/, "")).filter(Boolean);
  if (cleaned.length === 0) return "the scene's quiet spatial character";
  if (cleaned.length === 1) return cleaned[0];
  if (cleaned.length === 2) return `${cleaned[0]} and ${cleaned[1]}`;
  return `${cleaned.slice(0, -1).join(", ")}, and ${cleaned[cleaned.length - 1]}`;
}

function naturalSceneDirection(ir: AtmospherePromptIR): string {
  const evidence = naturalCueList(ir.scene.requiredSpatialEvidence);
  return `${ir.scene.description.replace(/\.$/, "")}. Let the frame make ${evidence} feel naturally present rather than itemized. ${ir.scene.lifeTrace}`;
}

export function renderImage2AtmospherePrompt(ir: AtmospherePromptIR): string {
  if (!ir.curationPlanPresent) throw new Image2AtmospherePromptRenderError("ATMOSPHERE_CURATION_PLAN_MISSING", "Atmosphere curation plan is required before Provider compilation.");
  if (ir.profileMode === "RESOLVED" && /analy[sz]e .*reference|currently attached/i.test(ir.visualDirection.productResponsiveDirection)) throw new Image2AtmospherePromptRenderError("PRODUCT_PROFILE_RESOLUTION_CONFLICT", "Resolved profile cannot also request deferred reference analysis.");
  if (/mixed|moderate|balanced|0\.5\s*\/\s*0\.5|softMaterialWeight|provenance|analysisVersion|curationSeed|candidateScores|history/i.test(ir.visualDirection.productResponsiveDirection + ir.visualDirection.materialDirection)) throw new Image2AtmospherePromptRenderError("PRODUCT_PROFILE_PLACEHOLDER_LEAK", "Raw or placeholder Product Profile data reached the Provider IR.");
  const objects = [...new Set(ir.selectedObjects.map((object) => object.trim()).filter(Boolean))];
  if (ir.selectedCarrier && ir.selectedCarrier !== "no dedicated physical carrier" && !objects.some((object) => ir.selectedCarrier?.toLowerCase().includes(object.toLowerCase()))) throw new Image2AtmospherePromptRenderError("ECHO_CARRIER_NOT_AVAILABLE_IN_SCENE", "Selected carrier is not present in the selected scene objects.");
  const competingScenes = ir.scene.forbiddenCompetingScenes.map((item) => item.trim()).filter(Boolean).slice(0, 3);
  const negatives = [...new Set([...canonicalNegatives, competingScenes.length > 0 ? `Keep the setting away from ${naturalCueList(competingScenes)}.` : ""])] .filter(Boolean);
  const productDirection = "Let the currently attached product reference shape the room's overall light-to-dark balance, edge softness or clarity, material weight, and restrained tonal atmosphere.";
  const carrierDirection = ir.selectedCarrier && ir.selectedCarrier !== "no dedicated physical carrier"
    ? `Let ${ir.selectedCarrier} remain a subtle quality already present in the scene; do not introduce another object to carry the Product Echo.`
    : "Do not introduce a dedicated physical carrier. Let the Product Echo appear only through subtle qualities already present in the scene.";
  const prompt = [
    `Generate exactly one standalone ${ir.outputContract.aspectRatio} portrait photograph. Single scene only.`,
    naturalSceneDirection(ir),
    `${productDirection} ${ir.visualDirection.brandExpression}`,
    `${ir.visualDirection.lightDirection} ${ir.visualDirection.materialDirection} ${ir.visualDirection.compositionDirection}`,
    objects.length > 0 ? `Keep the object presence minimal and believable, allowing the required spatial evidence to remain visible without turning the frame into a prop arrangement.` : "Keep the scene materially quiet and free of decorative additions.",
    carrierDirection,
    negatives.join(" ")
  ].join("\n\n");
  if ((prompt.match(/scene/gi) ?? []).length > 12) throw new Image2AtmospherePromptRenderError("MULTIPLE_SCENE_IN_PROVIDER_PROMPT", "Provider Prompt contains competing scene language.");
  if (wordCount(prompt) > 320) throw new Image2AtmospherePromptRenderError("IMAGE2_ATMOSPHERE_PROMPT_TOO_LONG", `Provider Prompt is ${wordCount(prompt)} words; maximum is 320.`);
  return prompt;
}
