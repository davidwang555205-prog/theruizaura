import { compileCommercialExecutionScript } from "./execution-compiler";
import { planCommercialFilm, renderCommercialFilmPlanText } from "./planner";
import {
  CommercialFilmPlannerError,
  type CommercialExecutionScript,
  type CommercialExecutionValidation,
  type CommercialFilmPlan,
  type CommercialFilmPlannerInput,
} from "./types";

export type CommercialFilmPipelineStageStatus =
  | "APPROVED_FOR_COMMERCIAL_EXECUTION"
  | "GENERATED"
  | "VALIDATED"
  | "BLOCKED";

export type CommercialFilmPipelineStages = {
  planner: CommercialFilmPipelineStageStatus;
  internalPlan: CommercialFilmPipelineStageStatus;
  executionCompiler: CommercialFilmPipelineStageStatus;
  executionValidation: CommercialFilmPipelineStageStatus;
  finalScript: "GENERATED" | "BLOCKED";
};

export type CommercialFilmPipelineGenerated = {
  status: "GENERATED";
  request: CommercialFilmPlannerInput;
  plan: CommercialFilmPlan;
  internalScript: string;
  modelFacingScript: CommercialExecutionScript;
  executionValidation: CommercialExecutionValidation;
  stages: CommercialFilmPipelineStages;
};

export type CommercialFilmPipelineBlocked = {
  status: "BLOCKED";
  code: CommercialFilmPlannerError["code"] | "EXECUTION_COMPILER_FAILED";
  reason: string;
  diagnostics: string[];
};

export type CommercialFilmPipelineOutcome =
  | CommercialFilmPipelineGenerated
  | CommercialFilmPipelineBlocked;

export function runCommercialFilmPipeline(
  request: CommercialFilmPlannerInput
): CommercialFilmPipelineOutcome {
  let plan: CommercialFilmPlan;
  try {
    plan = planCommercialFilm(request);
  } catch (error) {
    if (error instanceof CommercialFilmPlannerError) {
      return {
        status: "BLOCKED",
        code: error.code,
        reason: error.message,
        diagnostics: error.diagnostics,
      };
    }
    return {
      status: "BLOCKED",
      code: "EXECUTION_COMPILER_FAILED",
      reason: error instanceof Error ? error.message : "Commercial Film Planner blocked the current input.",
      diagnostics: [],
    };
  }

  if (plan.status !== "APPROVED_FOR_COMMERCIAL_EXECUTION") {
    return {
      status: "BLOCKED",
      code: "COMMERCIAL_QC_FAILED",
      reason: "Commercial Film QC did not approve the plan.",
      diagnostics: plan.failureReasons ?? [],
    };
  }

  const internalScript = renderCommercialFilmPlanText(plan);
  const compiled = compileCommercialExecutionScript(plan, internalScript);
  if (compiled.validation.status !== "COMMERCIAL_EXECUTION_VALIDATED") {
    return {
      status: "BLOCKED",
      code: "EXECUTION_COMPILER_FAILED",
      reason: "Commercial Execution Compiler validation failed.",
      diagnostics: compiled.validation.failureReasons,
    };
  }

  return {
    status: "GENERATED",
    request,
    plan,
    internalScript,
    modelFacingScript: compiled.script,
    executionValidation: compiled.validation,
    stages: {
      planner: "APPROVED_FOR_COMMERCIAL_EXECUTION",
      internalPlan: "GENERATED",
      executionCompiler: "GENERATED",
      executionValidation: "VALIDATED",
      finalScript: "GENERATED",
    },
  };
}
