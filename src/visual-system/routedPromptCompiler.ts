import { getActivePromptRegistryEntry, type ThemePromptRegistryEntry, type ThemePromptRole } from "./activePromptRegistry";
import type { TopicRoute } from "./topicRoutingRegistry";

export const ROUTED_IMAGE2_PROMPT_COMPILER_VERSION = "routed-image2-user-prompt-v1";

const roleLanguage: Record<ThemePromptRole, string> = {
  A1: "Visual role: relaxed daily-life framing, natural body weight, believable daylight, and a readable sneaker inside an ordinary lived-in scene.",
  A2: "Visual role: transitional urban movement near a threshold, with credible weight transfer, architectural depth, and an observational rather than performed composition.",
  A3: "Visual role: interior daily-life moment with tactile relationships between person, clothing, furniture, and product, plus one believable small action.",
  B3: "Visual role: official studio front full-body composition, calm presence, clean silhouette separation, natural scale, readable floor contact, and restrained warm-grey light.",
  B4: "Visual role: official studio three-quarter composition with relaxed weight transfer, complete outfit balance, and a structurally readable sneaker silhouette.",
  C1: "Visual role: complete lateral product profile with toe-to-heel structure, quiet pale surface, and a physically plausible contact shadow.",
  C2: "Visual role: natural on-foot detail with clear shoe-to-floor and garment relationships; do not invent unsupported product evidence.",
  C3: "Visual role: restrained paired-product still life with accurate scale, deliberate spacing, tactile material contrast, and grounded contact shadows.",
  C4: "Visual role: material-craft close-up focused on the relevant heel, collar, stitching, material boundary, and outsole termination without invented construction.",
  C5: "Visual role: true overhead top-down product evidence with toe box, tongue, settled laces, panel geometry, and consistent material detail fully readable."
};

export type RoutedImage2PromptInput = {
  basePrompt: string;
  topicRoute: TopicRoute;
  visualRoleId: ThemePromptRole;
  activePromptEntry?: ThemePromptRegistryEntry;
  currentTaskContext?: string;
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

  return [
    input.basePrompt.trim(),
    `Active Prompt Registry: ${entry.activeVersionId}.`,
    `Image2 provider boundary: use Image2 only; this is a user-facing production Prompt, not an internal validation task.`,
    `Topic responsibility: ${input.topicRoute.topicId} (${input.topicRoute.userFacingLabel}); preserve the original Topic provenance and do not silently substitute another Topic.`,
    roleLanguage[input.visualRoleId],
    "Product Truth protection: use only the current task's selected or uploaded product truth. Brand visual language and anchors provide composition, camera, light, human state, material treatment, and negative visual constraints only; never invent or replace SKU color, shape, material, logo, or construction.",
    input.currentTaskContext?.trim() ? `Current task context: ${input.currentTaskContext.trim()}.` : ""
  ].filter(Boolean).join(" ");
}
