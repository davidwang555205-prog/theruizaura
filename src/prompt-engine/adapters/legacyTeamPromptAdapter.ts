import type { TeamPromptParams, TeamPromptOutput } from "../../types";
import type { CompositionMode, PromptProfileInput } from "../contracts";
import { compilePrompt } from "../compilePrompt";
import { getPromptEngineConfig, recordCompareResult } from "../promptFeatureFlags";
import { logDiagnostics } from "../diagnostics";
import { generateTeamPrompt as legacyGenerateTeamPrompt } from "../../utils/generatePrompt";

function resolveCompositionMode(params: TeamPromptParams): CompositionMode {
  if (params.imageType === "产品静物图") return "stillLife";
  if (params.imageType === "拍摄花絮 / 材质图") return "materialDetail";
  if (params.imageType === "非产品氛围图") return "atmosphere";
  if (params.imageType === "对镜穿搭图") return "mirrorFull";
  if (params.scenePreference === "棚内上新拍摄") {
    if (typeof params.studioLaunchShotIndex === "number") {
      if (params.studioLaunchShotIndex <= 3) return "fullFigure";
      if (params.studioLaunchShotIndex <= 5) return "studioLowerThird";
      return "studioOnFootDetail";
    }
    const angle = params.studioLaunchAnglePreference;
    if (angle === "下半身1/3角度") return "studioLowerThird";
    if (angle === "鞋子上脚特写角度") return "studioOnFootDetail";
    if (angle === "3/4侧前方上脚角度") return "studioThreeQuarter";
    return "fullFigure";
  }
  return "onFootLifestyle";
}

function buildProfileInput(params: TeamPromptParams, output: TeamPromptOutput): PromptProfileInput {
  return {
    imageType: params.imageType,
    compositionMode: resolveCompositionMode(params),
    scenePreference: params.scenePreference as Exclude<typeof params.scenePreference, "自动匹配">,
    season: params.season,
    modelChoice: params.modelChoice,
    modelContinuity: params.modelContinuity,
    hasShoe: output.hasShoe,
    garmentTypePreference: params.garmentTypePreference,
    userExtraRequirement: params.extraRequirement,
    isMultiImage: !!params.seriesImageCount && params.seriesImageCount >= 2,
    seriesImageIndex: params.seriesImageIndex,
    seriesImageCount: params.seriesImageCount,
    studioShotIndex: params.studioLaunchShotIndex,
    generationNonce: params.generationNonce,
  };
}

export function generateTeamPrompt(params: TeamPromptParams): { prompt: string } {
  const config = getPromptEngineConfig();

  if (config.mode === "legacy") {
    return legacyGenerateTeamPrompt(params);
  }

  // Get legacy output for hasShoe field
  const legacyOutput = legacyGenerateTeamPrompt(params);
  const input = buildProfileInput(params, legacyOutput);
  const result = compilePrompt(input);

  if (config.enableDiagnostics) logDiagnostics(result);

  if (config.mode === "compare") {
    recordCompareResult(
      `${params.imageType}-${input.compositionMode}`,
      legacyOutput.prompt,
      result.prompt
    );
    return legacyOutput;
  }

  return { prompt: result.prompt };
}
