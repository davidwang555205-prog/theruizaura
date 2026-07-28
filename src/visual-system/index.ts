import motherJson from "../../visual-system/config/brand-visual-mother-v1.2.json";
import anchorsJson from "../../visual-system/config/anchor-manifest.json";
import casesJson from "../../visual-system/validation/cases/pre-phase-3a-validation-cases.json";
import { buildProductTruth, buildValidationTasks, validateAnchors, validateFrozenMother, type ProductEvidence, type ProductTruth } from "./types";
import { activePromptRegistry, resolveActiveImage2Prompt, validateActivePromptRegistry } from "./activePromptRegistry";
export { productTruthLock } from "./types";
export { canonicalThemeSpecifications, validateCanonicalThemeSpecifications, type CanonicalThemeSpecification } from "./canonicalThemes";

export const brandVisualMother = validateFrozenMother(motherJson as unknown as Parameters<typeof validateFrozenMother>[0]);
export const anchorManifest = validateAnchors(anchorsJson as unknown as Parameters<typeof validateAnchors>[0]);
export const validationCases = casesJson.cases;
export { activePromptRegistry, getActivePromptRegistryEntry, resolveActiveImage2Prompt, validateActivePromptRegistry } from "./activePromptRegistry";
export { topicRoutingRegistry, topicRoutingRegistryVersion, resolveTopicRoute, resolveTopicRoleBundle, validateTopicRoutingRegistry, type UserContentTopicId, type TopicRoute } from "./topicRoutingRegistry";
export { compileRoutedImage2UserPrompt, ROUTED_IMAGE2_PROMPT_COMPILER_VERSION } from "./routedPromptCompiler";
export { assertEnglishPrompt, mapEnglishPromptField, type EnglishPromptField } from "./englishPromptMappings";
export function createVisualValidationWorkspace(evidence: ProductEvidence[]): { productTruth: ProductTruth; tasks: ReturnType<typeof buildValidationTasks> } {
  const productTruth = buildProductTruth(evidence);
  validateActivePromptRegistry();
  const tasks = buildValidationTasks(validationCases, productTruth).map((task) => {
    const entry = activePromptRegistry.find((item) => item.role === task.id);
    if (!entry) return task;
    return { ...task, providerReadyPrompt: resolveActiveImage2Prompt(task.id as Parameters<typeof resolveActiveImage2Prompt>[0]).prompt };
  });
  return { productTruth, tasks };
}
