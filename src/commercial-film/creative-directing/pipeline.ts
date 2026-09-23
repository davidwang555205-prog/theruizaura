import { runCommercialFilmPipeline } from "../pipeline";
import { buildCommercialFinalScriptPresentation } from "../presentation";
import { buildCommercialBrandSignOff } from "../brand-signoff";
import { buildCommercialCreativeTreatment } from "./planner";
import {
  appendCommercialV14TranslationExtension,
  buildCommercialV14Presentation,
  buildCommercialV14TranslationExtension,
} from "./execution";
import {
  COMMERCIAL_CREATIVE_DIRECTING_SCHEMA_VERSION,
  COMMERCIAL_CREATIVE_DIRECTING_VERSION,
  type CommercialV14Plan,
  type CommercialV14PipelineOutcome,
} from "./types";

export function runCommercialV14Pipeline(
  input: Parameters<typeof runCommercialFilmPipeline>[0]
): CommercialV14PipelineOutcome {
  const baseOutcome = runCommercialFilmPipeline(input);
  if (baseOutcome.status !== "GENERATED") {
    return {
      status: "BLOCKED",
      code: "V13_BASELINE_BLOCKED",
      reason: baseOutcome.reason,
      diagnostics: baseOutcome.diagnostics,
    };
  }

  const generationNonce = input.generationNonce ?? 0;
  const creativeTreatment = buildCommercialCreativeTreatment(baseOutcome.plan, generationNonce);
  if (creativeTreatment.failureReasons?.length) {
    return {
      status: "BLOCKED",
      code: "CREATIVE_DIRECTING_FAILED",
      reason: "The V1.4 Creative Directing Layer rejected the treatment.",
      diagnostics: creativeTreatment.failureReasons,
    };
  }

  const canonicalCompiledText = baseOutcome.modelFacingScript.compiledText;
  const brandSignOff = buildCommercialBrandSignOff({
    treatment: creativeTreatment,
    durationSeconds: baseOutcome.plan.duration,
    shots: baseOutcome.plan.shotArchitecture.shots.map((shot) => ({
      startSecond: shot.timeRange.startSecond,
      endSecond: shot.timeRange.endSecond,
    })),
  });
  const translationExtension = buildCommercialV14TranslationExtension(
    creativeTreatment,
    brandSignOff
  );
  const v14CompiledText = appendCommercialV14TranslationExtension(
    canonicalCompiledText,
    creativeTreatment,
    brandSignOff
  );
  const basePresentation = buildCommercialFinalScriptPresentation({
    plan: baseOutcome.plan,
    canonicalCompiledText,
  });
  const presentation = buildCommercialV14Presentation(
    basePresentation,
    canonicalCompiledText,
    v14CompiledText,
    creativeTreatment,
    brandSignOff
  );
  const plan: CommercialV14Plan = {
    schemaVersion: COMMERCIAL_CREATIVE_DIRECTING_SCHEMA_VERSION,
    plannerVersion: COMMERCIAL_CREATIVE_DIRECTING_VERSION,
    basePlan: baseOutcome.plan,
    creativeTreatment,
    canonicalCompiledText,
    v14CompiledText,
    presentation,
  };

  return {
    status: "GENERATED",
    baseOutcome,
    plan,
    translationExtension,
    stages: {
      v13Baseline: "GENERATED",
      creativeDirecting: "GENERATED",
      seedanceExtension: "GENERATED",
      presentation: "GENERATED",
    },
  };
}
