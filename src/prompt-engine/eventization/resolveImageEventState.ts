import type { PromptProfileInput } from "../contracts";
import { IMAGE_EVENT_CATALOG } from "./eventCatalog";
import type { ResolvedImageEventState } from "./types";

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function buildPromptLine(event: {
  trigger: string;
  physicalResponse: string;
  visibleChange: string;
  visualEvidence: string;
}) {
  return [
    `Visible trigger: ${event.trigger}.`,
    `Physical response: ${event.physicalResponse}.`,
    `Visible state change: ${event.visibleChange}.`,
    `Keep ${event.visualEvidence} visible in the same frame.`,
    "Treat this only as the visible cause-and-effect context for the existing Action Lock; do not add a second action, an unseen cause, or a before-and-after story."
  ].join(" ");
}

export function resolveImageEventState(
  input: PromptProfileInput
): ResolvedImageEventState | null {
  if (input.topicId !== "lifestyle_soft_seeding") return null;
  if (input.imageType !== "生活场景图" && input.imageType !== "产品上脚图") return null;
  if (input.compositionMode !== "onFootLifestyle") return null;
  if (!input.actionLock?.trim() || !input.cardRole?.trim()) return null;

  const candidates = IMAGE_EVENT_CATALOG.filter((event) =>
    event.compatibleScenes.includes(input.scenePreference) &&
    event.compatibleActionFamilies.includes(input.cardRole!)
  );
  if (!candidates.length) return null;

  const seed = [
    input.topicId,
    input.scenePreference,
    input.cardRole,
    input.seriesImageIndex ?? 0,
    input.generationNonce
  ].join("|");
  const selected = candidates[stableHash(seed) % candidates.length];

  return {
    id: selected.id,
    eventFamily: selected.eventFamily,
    trigger: selected.trigger,
    physicalResponse: selected.physicalResponse,
    visibleChange: selected.visibleChange,
    visualEvidence: selected.visualEvidence,
    promptLine: buildPromptLine(selected)
  };
}
