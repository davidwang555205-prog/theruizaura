import type { AtmospherePromptSections } from "./seasonSemanticProfiles";

export type PromptSectionAudience = "INTERNAL" | "QA" | "PROVIDER";

export type AtmospherePromptIR = {
  outputContract: { aspectRatio: string; standaloneImage: true; singleScene: true };
  sections: AtmospherePromptSections;
  curationPlanPresent: boolean;
};

export class Image2AtmospherePromptRenderError extends Error {
  constructor(public readonly code: "ATMOSPHERE_CURATION_PLAN_MISSING" | "PRODUCT_PROFILE_RESOLUTION_CONFLICT" | "PRODUCT_PROFILE_PLACEHOLDER_LEAK" | "ECHO_CARRIER_NOT_AVAILABLE_IN_SCENE" | "DUPLICATE_NEGATIVE_CONSTRAINT" | "MULTIPLE_SCENE_IN_PROVIDER_PROMPT" | "IMAGE2_ATMOSPHERE_PROMPT_TOO_LONG", message: string) { super(message); }
}

const canonicalNegatives = [
  "No person, body part, reflection, silhouette, or human shadow.",
  "No collage, triptych, split panel, contact sheet, or multiple scene.",
  "Avoid showroom styling, advertising hierarchy, decorative symmetry, and generic moodboards."
];

function wordCount(value: string) { return value.trim().split(/\s+/).filter(Boolean).length; }

export function renderImage2AtmospherePrompt(ir: AtmospherePromptIR): string {
  if (!ir.curationPlanPresent) throw new Image2AtmospherePromptRenderError("ATMOSPHERE_CURATION_PLAN_MISSING", "Atmosphere curation plan is required before Provider compilation.");
  const providerText = Object.values(ir.sections).flat().join(" ");
  if (/mixed|0\.5\s*\/\s*0\.5|softMaterialWeight|provenance|analysisVersion|curationSeed|candidateScores|history/i.test(providerText)) throw new Image2AtmospherePromptRenderError("PRODUCT_PROFILE_PLACEHOLDER_LEAK", "Raw or placeholder Product Profile data reached the Provider IR.");
  const negatives = [...new Set([...ir.sections.negativeConstraints, ...canonicalNegatives])].filter(Boolean);
  const prompt = [
    `Generate exactly one standalone ${ir.outputContract.aspectRatio} portrait photograph. Single scene only.`,
    ...ir.sections.moduleDefinition,
    ...ir.sections.activeVisualSystem,
    ...ir.sections.seasonIdentity,
    ...ir.sections.positiveSeasonCues,
    ...ir.sections.scene,
    ...ir.sections.productPresence,
    ...ir.sections.paletteEcho,
    ...ir.sections.productTruth,
    ...ir.sections.composition,
    negatives.join(" ")
  ].join("\n\n");
  if ((prompt.match(/scene/gi) ?? []).length > 12) throw new Image2AtmospherePromptRenderError("MULTIPLE_SCENE_IN_PROVIDER_PROMPT", "Provider Prompt contains competing scene language.");
  if (wordCount(prompt) > 420) throw new Image2AtmospherePromptRenderError("IMAGE2_ATMOSPHERE_PROMPT_TOO_LONG", `Provider Prompt is ${wordCount(prompt)} words; maximum is 420.`);
  return prompt;
}
