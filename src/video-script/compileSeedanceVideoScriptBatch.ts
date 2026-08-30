import type { TeamSeason } from "../types";
import type { SoftSeedingImagePlan } from "../utils/generateSoftSeedingContent";
import type { NonProductAtmospherePlan } from "../non-product-atmosphere";
import {
  compileSeedanceAtmosphereVideoScript,
  compileSeedanceVideoScript,
  type CompiledVideoScript,
  type VideoScriptDuration,
} from "./compileSeedanceVideoScript";

export type CompiledVideoScriptBatchItem = CompiledVideoScript & {
  sourceId: string;
  sourceIndex: number;
  sourceLabel: string;
};

export function compileSoftSeedingVideoScriptBatch(
  images: SoftSeedingImagePlan[],
  duration: VideoScriptDuration
): CompiledVideoScriptBatchItem[] {
  return images.map((image, index) => ({
    sourceId: `${image.routingProvenance.originalUserTopicId}:${image.activePromptVersionId}:${index + 1}`,
    sourceIndex: index + 1,
    sourceLabel: image.name,
    ...compileSeedanceVideoScript({ params: image.params, duration }),
  }));
}

export function compileAtmosphereVideoScriptBatch(
  plan: NonProductAtmospherePlan,
  season: TeamSeason,
  duration: VideoScriptDuration
): CompiledVideoScriptBatchItem[] {
  return plan.images.map((image) => ({
    sourceId: `${plan.curationSeed}:${image.id}`,
    sourceIndex: image.index,
    sourceLabel: image.slot.sceneLabel,
    ...compileSeedanceAtmosphereVideoScript({
      image,
      season,
      duration,
      referenceCount: plan.referenceImageCount,
    }),
  }));
}

export function formatVideoScriptBatch(items: CompiledVideoScriptBatchItem[]): string {
  return items.map((item) => `VIDEO ${item.sourceIndex} — ${item.sourceLabel}\n\n${item.script}`).join("\n\n========================================\n\n");
}
