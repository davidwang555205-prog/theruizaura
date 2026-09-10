import { getActivePromptRegistryEntry, type ThemePromptRegistryEntry, type ThemePromptRole } from "./activePromptRegistry";
import type { TopicRoute } from "./topicRoutingRegistry";
import { assertEnglishPrompt } from "./englishPromptMappings";

export const ROUTED_IMAGE2_PROMPT_COMPILER_VERSION = "routed-image2-user-prompt-v2";

export type RoutedImage2PromptInput = {
  basePrompt: string;
  topicRoute: TopicRoute;
  visualRoleId: ThemePromptRole;
  activePromptEntry?: ThemePromptRegistryEntry;
  currentTaskContext?: { imageType: string; scenePreference: string; imageIndex: number; imageCount: number };
};

export function compileRoutedImage2UserPrompt(input: RoutedImage2PromptInput): string {
  const entry = input.activePromptEntry ?? getActivePromptRegistryEntry(input.visualRoleId);
  if (entry.role !== input.visualRoleId) throw new Error("Active Prompt Registry role mismatch.");
  if (entry.provider !== "image2") throw new Error("Routed user prompts support Image2 only.");
  if (["A4", "B1", "B2"].includes(input.visualRoleId)) throw new Error("Anchor-only role cannot enter runtime.");
  if (!input.topicRoute?.topicId) throw new Error("Registered Topic Route is required.");
  if (!input.basePrompt.trim()) throw new Error("Base runtime Prompt is required.");
  if (/theme validation|visual validation case|burgundy and ivory/i.test(input.basePrompt)) {
    throw new Error("Validation fixture language cannot enter the user-facing runtime Prompt.");
  }
  const imageIndex = input.currentTaskContext?.imageIndex ?? 0;
  const imageCount = input.currentTaskContext?.imageCount ?? 0;
  if (!Number.isInteger(imageIndex) || !Number.isInteger(imageCount) || imageIndex < 1 || imageCount < imageIndex) {
    throw new Error("ENGLISH_PROMPT_MAPPING_MISSING:invalid_image_sequence");
  }

  // The base prompt is the single provider-facing source of visual rules. Role,
  // Product Truth, scene, and camera directives are assembled upstream by the
  // prompt engine; route metadata stays in routingProvenance/UI only.
  return assertEnglishPrompt(input.basePrompt.trim());
}
