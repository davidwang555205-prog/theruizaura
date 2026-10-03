import {
  runCommercialFilmPipeline,
  type CommercialFilmPipelineGenerated,
} from "../pipeline";
import { buildCommercialFinalScriptPresentation } from "../presentation";
import { buildCommercialBrandSignOff } from "../brand-signoff";
import { buildCommercialFinalExecutionPlan } from "../final-execution";
import { rankCommercialDirectorConcepts } from "../director-concept";
import { consolidateCommercialAuthority } from "../authority-consolidation";
import {
  renderCommercialFinalDirectorScript,
  renderCommercialFinalSeedancePrompt,
  validateCommercialFinalRender,
} from "../final-renderers";
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
  input: Parameters<typeof runCommercialFilmPipeline>[0],
  baseOutcomeOverride?: CommercialFilmPipelineGenerated
): CommercialV14PipelineOutcome {
  const baseOutcome = baseOutcomeOverride ?? runCommercialFilmPipeline(input);
  if (baseOutcome.status !== "GENERATED") {
    return {
      status: "BLOCKED",
      code: "V13_BASELINE_BLOCKED",
      reason: baseOutcome.reason,
      diagnostics: baseOutcome.diagnostics,
    };
  }

  const generationNonce = input.generationNonce ?? 0;
  const consolidation = consolidateCommercialAuthority({
    basePlan: baseOutcome.plan,
    input,
    generationNonce,
  });
  if (consolidation.status !== "GENERATED") {
    return {
      status: "BLOCKED",
      code: consolidation.code,
      reason: consolidation.reason,
      diagnostics: consolidation.diagnostics,
    };
  }
  const effectivePlan = consolidation.effectivePlan;
  const creativeTreatment = consolidation.treatment;
  if (creativeTreatment.failureReasons?.length) {
    if (!input.directorConceptOverride && !baseOutcomeOverride) {
      const rankedConcepts = rankCommercialDirectorConcepts({
        commercialIntent: effectivePlan.commercialIntent,
        creativeSpine: effectivePlan.creativeSpine,
        creativeDirection: effectivePlan.creativeDirection,
        eventSpine: effectivePlan.eventSpine,
        generationNonce,
      });
      const rotation = ((generationNonce % 3) + 3) % 3;
      const orderedConcepts = [...rankedConcepts.slice(rotation), ...rankedConcepts.slice(0, rotation)];
      for (const concept of orderedConcepts) {
        if (concept === effectivePlan.directorConcept.concept) continue;
        const compatible = runCommercialV14Pipeline({ ...input, directorConceptOverride: concept });
        if (compatible.status === "GENERATED") return compatible;
      }
    }
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
    brandSignOff,
    effectivePlan
  );
  const v14CompiledText = appendCommercialV14TranslationExtension(
    canonicalCompiledText,
    creativeTreatment,
    brandSignOff,
    effectivePlan
  );
  const basePresentation = buildCommercialFinalScriptPresentation({
    plan: effectivePlan,
    canonicalCompiledText,
  });
  const presentation = buildCommercialV14Presentation(
    basePresentation,
    canonicalCompiledText,
    v14CompiledText,
    creativeTreatment,
    brandSignOff
  );
  const finalExecutionPlan = buildCommercialFinalExecutionPlan({
    plan: effectivePlan,
    treatment: creativeTreatment,
    brandSignOff,
    canonicalCompiledText,
    productionCompiledText: v14CompiledText,
  });
  if (finalExecutionPlan.status !== "VALID") {
    if (!input.directorConceptOverride && !baseOutcomeOverride) {
      const rankedConcepts = rankCommercialDirectorConcepts({
        commercialIntent: effectivePlan.commercialIntent,
        creativeSpine: effectivePlan.creativeSpine,
        creativeDirection: effectivePlan.creativeDirection,
        eventSpine: effectivePlan.eventSpine,
        generationNonce,
      });
      const rotation = ((generationNonce % 3) + 3) % 3;
      const orderedConcepts = [...rankedConcepts.slice(rotation), ...rankedConcepts.slice(0, rotation)];
      for (const concept of orderedConcepts) {
        if (concept === effectivePlan.directorConcept.concept) continue;
        const compatible = runCommercialV14Pipeline({ ...input, directorConceptOverride: concept });
        if (compatible.status === "GENERATED") return compatible;
      }
    }
    const codes = new Set(finalExecutionPlan.validation.diagnostics.map((entry) => entry.code));
    const code = codes.has("DEVICE_CAMERA_INCOMPATIBLE")
      ? "DIRECTOR_CONCEPT_CAMERA_INCOMPATIBLE"
      : codes.has("UNDECLARED_PHYSICAL_RESOURCE") || codes.has("DEVICE_RESOURCE_MISSING")
        ? "DIRECTOR_CONCEPT_RESOURCE_INCOMPATIBLE"
        : codes.has("REVEAL_CONFLICT") || codes.has("DEVICE_TAKE_INCOMPATIBLE") || codes.has("INVALID_TAKE_COVERAGE")
          ? "DIRECTOR_CONCEPT_EVENT_INCOMPATIBLE"
          : "FINAL_EXECUTION_PLAN_BLOCKED";
    return {
      status: "BLOCKED",
      code,
      reason: "The Final Execution Plan rejected the selected Director Concept.",
      diagnostics: finalExecutionPlan.validation.diagnostics.map((entry) => `${entry.code}: ${entry.message}`),
    };
  }
  const directorScript = renderCommercialFinalDirectorScript(finalExecutionPlan);
  const seedancePrompt = renderCommercialFinalSeedancePrompt(finalExecutionPlan);
  const renderValidation = validateCommercialFinalRender({
    plan: finalExecutionPlan,
    directorScript,
    seedancePrompt,
  });
  if (renderValidation.status !== "VALID") {
    return {
      status: "BLOCKED",
      code: "FINAL_RENDER_VALIDATION_FAILED",
      reason: "The final Director Script or Seedance Prompt failed renderer validation.",
      diagnostics: renderValidation.diagnostics,
    };
  }
  const plan: CommercialV14Plan = {
    schemaVersion: COMMERCIAL_CREATIVE_DIRECTING_SCHEMA_VERSION,
    plannerVersion: COMMERCIAL_CREATIVE_DIRECTING_VERSION,
    basePlan: baseOutcome.plan,
    consolidatedPlan: effectivePlan,
    creativeTreatment,
    canonicalCompiledText,
    v14CompiledText,
    finalExecutionPlan,
    directorScript,
    seedancePrompt,
    renderValidation,
    presentation,
    authorityConsolidation: consolidation,
  };

  return {
    status: "GENERATED",
    baseOutcome,
    plan,
    translationExtension,
    authorityConsolidation: consolidation,
    stages: {
      v13Baseline: "GENERATED",
      creativeDirecting: "GENERATED",
      seedanceExtension: "GENERATED",
      presentation: "GENERATED",
    },
  };
}
