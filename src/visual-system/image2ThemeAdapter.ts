import type { CanonicalThemeSpecification } from "./canonicalThemes";
import { assertImage2ProviderPrompt, productTruthLock } from "./types";

export const IMAGE2_THEME_ADAPTER_VERSION = "image2-theme-adapter-v1";
export const IMAGE2_BRAND_LANGUAGE = "Warm, restrained, relaxed and real: low-saturation warm neutrals, tactile natural materials, believable daylight or controlled warm-grey light, quiet human presence, real spatial evidence, and composed everyday usefulness. The person is not a product prop. Brand anchors define abstract visual language only, never current product facts.";
const CORE_PRODUCT_TRUTH_FIELDS = ["burgundy and ivory", "low-cut silhouette", "rounded toe box", "slim brown outsole", "side panels", "heel counter", "tongue", "white laces", "stitching", "material contrast", "original proportions"];

export type Image2ThemeCompilationInput = {
  theme: CanonicalThemeSpecification;
  currentTaskProductTruth: string;
  taskContext?: string;
};

export type Image2CompilationResult = {
  prompt: string;
  diagnostics: string[];
  adapterVersion: string;
  sourceChain: string[];
};

function hasChinese(value: string) {
  return /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/.test(value);
}

export function compileImage2ThemePrompt(input: Image2ThemeCompilationInput): Image2CompilationResult {
  const diagnostics: string[] = [];
  const { theme, currentTaskProductTruth, taskContext = "Create one commercially usable validation image." } = input;
  if (!theme?.theme_id) diagnostics.push("THEME_MISSING");
  if (theme?.status === "retired") diagnostics.push(`THEME_RETIRED:${theme.theme_id}`);
  if (theme?.status === "merged") diagnostics.push(`THEME_MERGE_REDIRECT_REQUIRED:${theme.theme_id}`);
  if (!currentTaskProductTruth?.trim()) diagnostics.push("PRODUCT_TRUTH_MISSING");
  const truth = currentTaskProductTruth?.trim() || productTruthLock;
  for (const field of CORE_PRODUCT_TRUTH_FIELDS) if (!truth.includes(field)) diagnostics.push(`PRODUCT_TRUTH_FIELD_MISSING:${field}`);
  if (hasChinese(truth) || hasChinese(taskContext)) diagnostics.push("PROMPT_CHINESE_CHARACTERS");
  if (diagnostics.length > 0) throw new Error(`Image2 theme compilation blocked: ${diagnostics.join(", ")}`);

  const prompt = [
    `Task identity: THERUIZ AURA Image2 theme validation for ${theme.theme_id}, specification ${theme.version}.`,
    `Theme purpose: ${theme.content_purpose} Audience impression: ${theme.audience_impression}. Narrative moment: ${theme.narrative_moment}.`,
    `Person and action: ${theme.person_presence} ${theme.person_state} ${theme.gaze_behavior} Action logic: ${theme.action_logic}.`,
    `Scene evidence: ${theme.scene_type}; ${theme.scene_evidence.join(", ")}. Space density: ${theme.space_density}.`,
    `Styling boundary: ${theme.styling_boundary}.`,
    `Camera and composition: ${theme.camera_distance}, ${theme.camera_angle}. ${theme.composition_logic}. Task context: ${taskContext}.`,
    `Light, color and material language: ${theme.light_language} ${theme.color_language} ${theme.material_language}.`,
    `Product Truth lock: ${truth}`,
    `Product visibility: ${theme.product_presence} Product visibility requirement: ${theme.product_visibility_requirement}. Required evidence: ${theme.required_product_evidence.join(", ")}.`,
    `Physical realism: Allow ${theme.allowed_natural_deformation.join(", ")}. Preserve natural anatomy, hands, garment edges, shoe collar, tongue, laces, outsole and floor contact.`,
    `Brand prohibitions: ${IMAGE2_BRAND_LANGUAGE} Avoid ${theme.hard_negative_rules.join(", ")}.`,
    `Technical negative constraints: Never ${theme.prohibited_product_changes.join(", ")}. ${theme.repetition_controls.join(" ")} Do not invent logos, signage, unsupported on-foot evidence, or product details.`
  ].join(" ");
  const validated = assertImage2ProviderPrompt(prompt);
  return { prompt: validated, diagnostics, adapterVersion: IMAGE2_THEME_ADAPTER_VERSION, sourceChain: ["brand_visual_mother_v1.2", "canonical-theme-specifications-v1", "current_task_product_truth", "task_context", IMAGE2_THEME_ADAPTER_VERSION] };
}
