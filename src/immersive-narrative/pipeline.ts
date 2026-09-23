import {
  buildCameraNarrativeInput,
  planCameraNarrative,
  type CameraNarrativeOutput,
} from "./camera-role";
import {
  buildCameraExecutionInput,
  planCameraExecution,
  type CameraExecutionPlan,
} from "./camera-execution";
import {
  DEFAULT_CHARACTER_SELECTION,
  resolveCharacterProfile,
  type CharacterSelection,
  type ResolvedCharacterProfile,
} from "./character-profile";
import {
  buildPhysicalActionAuditInput,
  runPhysicalActionAudit,
  type PhysicalActionAuditReport,
} from "./physical-action";
import {
  compileModelFacingExecutionScript,
  validateModelFacingExecutionScript,
  type ExecutionCompilerInput,
  type ExecutionCompilerValidation,
  type ModelFacingExecutionScript,
} from "./execution-compiler";
import { buildProductPresenceInput, planProductPresence, type ProductPresenceOutput } from "./product-presence";
import { buildSceneResolverInput, resolveNarrativeScenes, type SceneResolverOutput } from "./scene-resolver";
import {
  compileImmersiveSeedanceScript,
  DEFAULT_REFERENCE_MAPPING,
  validateImmersiveSeedanceScript,
  type ImmersiveReferenceMapping,
  type ImmersiveSeedanceScript,
  type ImmersiveSeedanceScriptValidation,
} from "./seedance-compiler";
import { buildSoundWorldInput, planSoundWorld, type SoundWorldOutput } from "./sound-world";
import { NARRATIVE_TOPIC_CATALOG, resolveNarrativeTopic } from "./topic-catalog";
import { planImmersiveNarrative, renderNarrativePlanText } from "./planner";
import {
  NarrativePlannerError,
  type NarrativePlan,
  type NarrativePlannerInput,
  type NarrativeSceneLibraryItem,
  type NarrativeSeason,
} from "./types";

export type ImmersivePipelineStageStatus = "PASS" | "FAIL" | "CORRECT_UNSUPPORTED" | "GENERATED" | "BLOCKED";

export type ImmersiveMomentReport = {
  momentIndex: number;
  narrative: ImmersivePipelineStageStatus;
  scene: ImmersivePipelineStageStatus;
  product: ImmersivePipelineStageStatus;
  sound: ImmersivePipelineStageStatus;
  cameraRole: ImmersivePipelineStageStatus;
  physicalAction: ImmersivePipelineStageStatus;
  cameraExecution: ImmersivePipelineStageStatus;
  compiler: ImmersivePipelineStageStatus;
  execution: ImmersivePipelineStageStatus;
  finalScript: "GENERATED" | "BLOCKED";
};

export type ImmersivePipelineStages = {
  narrative: ImmersivePipelineStageStatus;
  scene: ImmersivePipelineStageStatus;
  product: ImmersivePipelineStageStatus;
  sound: ImmersivePipelineStageStatus;
  cameraRole: ImmersivePipelineStageStatus;
  physicalAction: ImmersivePipelineStageStatus;
  cameraExecution: ImmersivePipelineStageStatus;
  compiler: ImmersivePipelineStageStatus;
  executionCompiler: ImmersivePipelineStageStatus;
  finalScript: "GENERATED" | "BLOCKED";
};

export type ImmersiveNarrativeRequest = {
  topic: string;
  characterSelection: CharacterSelection;
  season: NarrativeSeason;
  lifestyleFeeling: string;
  availableSceneLibrary: NarrativeSceneLibraryItem[];
  referenceMapping?: ImmersiveReferenceMapping;
};

export type ImmersiveNarrativePipelineGenerated = {
  status: "GENERATED";
  topicLabel: string;
  request: ImmersiveNarrativeRequest;
  character: ResolvedCharacterProfile;
  plan: NarrativePlan;
  sceneResolution: SceneResolverOutput;
  productPresence: ProductPresenceOutput;
  soundWorld: SoundWorldOutput;
  cameraNarrative: CameraNarrativeOutput;
  physicalAction: { report: PhysicalActionAuditReport; alignmentIssues: string[] };
  cameraExecution: { plan: CameraExecutionPlan; alignmentIssues: string[] };
  script: ImmersiveSeedanceScript;
  scriptValidation: ImmersiveSeedanceScriptValidation;
  modelFacingScript: ModelFacingExecutionScript;
  executionValidation: ExecutionCompilerValidation;
  executionInput: ExecutionCompilerInput;
  stages: ImmersivePipelineStages;
  momentReport: ImmersiveMomentReport[];
};

export type ImmersiveNarrativePipelineBlocked = {
  status: "BLOCKED";
  reason: string;
  diagnostics: string[];
};

export type ImmersiveNarrativePipelineOutcome =
  | ImmersiveNarrativePipelineGenerated
  | ImmersiveNarrativePipelineBlocked;

export const DEFAULT_IMMERSIVE_REQUEST: ImmersiveNarrativeRequest = {
  topic: "下班回家",
  characterSelection: DEFAULT_CHARACTER_SELECTION,
  season: "秋",
  lifestyleFeeling: "安静 / 克制",
  availableSceneLibrary: [],
  referenceMapping: DEFAULT_REFERENCE_MAPPING,
};

// Shared pipeline: UI, validators, and the final report all read this single
// integration path. Nothing downstream re-plans an upstream stage.
export function runImmersiveNarrativePipeline(
  request: ImmersiveNarrativeRequest
): ImmersiveNarrativePipelineOutcome {
  let plan: NarrativePlan;
  try {
    const plannerInput: NarrativePlannerInput = {
      topic: request.topic,
      characterSelection: request.characterSelection,
      season: request.season,
      lifestyleFeeling: request.lifestyleFeeling,
      duration: 15,
      availableSceneLibrary: request.availableSceneLibrary,
    };
    plan = planImmersiveNarrative(plannerInput);
  } catch (error) {
    if (error instanceof NarrativePlannerError) {
      return { status: "BLOCKED", reason: error.message, diagnostics: error.diagnostics };
    }
    return {
      status: "BLOCKED",
      reason: error instanceof Error ? error.message : "Narrative Planner blocked the current input.",
      diagnostics: [],
    };
  }

  const topicLabel = resolveNarrativeTopic(request.topic)?.label ?? request.topic;
  const character = resolveCharacterProfile(request.characterSelection);
  const sceneResolution = resolveNarrativeScenes(buildSceneResolverInput(plan, topicLabel));
  const productPresence = planProductPresence(buildProductPresenceInput(plan, sceneResolution, topicLabel));
  const soundWorld = planSoundWorld(buildSoundWorldInput(plan, sceneResolution, productPresence, topicLabel));
  const cameraNarrative = planCameraNarrative(
    buildCameraNarrativeInput(plan, sceneResolution, productPresence, soundWorld)
  );
  const physicalActionBuilt = buildPhysicalActionAuditInput({
    topicLabel,
    plan,
    sceneResolution,
    productPresence,
    soundWorld,
    cameraNarrative,
  });
  const physicalActionReport = runPhysicalActionAudit(physicalActionBuilt.input);
  const cameraExecutionBuilt = buildCameraExecutionInput({
    topicLabel,
    plan,
    sceneResolution,
    productPresence,
    soundWorld,
    cameraNarrative,
    physicalAction: physicalActionReport,
  });
  const cameraExecutionPlan = planCameraExecution(cameraExecutionBuilt.input);
  const script = compileImmersiveSeedanceScript({
    topicLabel,
    season: request.season,
    lifestyleFeeling: request.lifestyleFeeling,
    character,
    plan,
    sceneResolution,
    productPresence,
    soundWorld,
    cameraNarrative,
    physicalAction: physicalActionReport,
    cameraExecution: cameraExecutionPlan,
    referenceMapping: request.referenceMapping ?? DEFAULT_REFERENCE_MAPPING,
  });
  const scriptValidation = validateImmersiveSeedanceScript(script, {
    topicLabel,
    season: request.season,
    lifestyleFeeling: request.lifestyleFeeling,
    character,
    plan,
    sceneResolution,
    productPresence,
    soundWorld,
    cameraNarrative,
    physicalAction: physicalActionReport,
    cameraExecution: cameraExecutionPlan,
    referenceMapping: request.referenceMapping ?? DEFAULT_REFERENCE_MAPPING,
  });
  const executionInput: ExecutionCompilerInput = {
    topicLabel,
    season: request.season,
    character,
    plan,
    sceneResolution,
    productPresence,
    soundWorld,
    cameraExecution: cameraExecutionPlan,
    physicalAction: physicalActionReport,
    referenceMapping: request.referenceMapping ?? DEFAULT_REFERENCE_MAPPING,
    internalScriptText: script.compiledText,
  };
  const modelFacingScript = compileModelFacingExecutionScript(executionInput);
  const executionValidation = validateModelFacingExecutionScript(modelFacingScript, executionInput);

  const stageFailures: string[] = [];
  if (plan.status !== "APPROVED_FOR_SCENE_RESOLUTION") stageFailures.push("Narrative Plan is not approved.");
  if (sceneResolution.status !== "SCENE_RESOLUTION_APPROVED") stageFailures.push("Scene Resolution is not approved.");
  if (productPresence.status !== "PRODUCT_PRESENCE_APPROVED") stageFailures.push("Product Presence is not approved.");
  if (soundWorld.status !== "SOUND_WORLD_APPROVED") stageFailures.push("Sound World is not approved.");
  if (cameraNarrative.status !== "CAMERA_NARRATIVE_APPROVED") stageFailures.push("Camera Narrative Role is not approved.");
  if (cameraExecutionPlan.status !== "CAMERA_EXECUTION_APPROVED") {
    stageFailures.push(`Camera Execution is not approved: ${(cameraExecutionPlan.failureReasons ?? []).join(" ")}`);
  }
  if (scriptValidation.status !== "IMMERSIVE_SEEDANCE_SCRIPT_VALIDATED") {
    stageFailures.push(`Seedance Compiler validation failed: ${scriptValidation.failureReasons.join(" ")}`);
  }

  const unresolvedMoments = physicalActionReport.moments.filter((moment) => moment.status === "UNRESOLVED").length;
  const physicalStage: ImmersivePipelineStageStatus = physicalActionReport.moments.every((moment) => moment.status === "MATCHED")
    ? "PASS"
    : unresolvedMoments === physicalActionReport.moments.length
      ? "FAIL"
      : "CORRECT_UNSUPPORTED";
  const cameraStage: ImmersivePipelineStageStatus = cameraExecutionPlan.moments.every((moment) => moment.status === "EXECUTABLE")
    ? "PASS"
    : cameraExecutionPlan.moments.every((moment) => moment.status === "EXECUTABLE" || moment.status === "CORRECT_UNSUPPORTED")
      ? "CORRECT_UNSUPPORTED"
      : "FAIL";

  const stages: ImmersivePipelineStages = {
    narrative: plan.status === "APPROVED_FOR_SCENE_RESOLUTION" ? "PASS" : "FAIL",
    scene: sceneResolution.status === "SCENE_RESOLUTION_APPROVED" ? "PASS" : "FAIL",
    product: productPresence.status === "PRODUCT_PRESENCE_APPROVED" ? "PASS" : "FAIL",
    sound: soundWorld.status === "SOUND_WORLD_APPROVED" ? "PASS" : "FAIL",
    cameraRole: cameraNarrative.status === "CAMERA_NARRATIVE_APPROVED" ? "PASS" : "FAIL",
    physicalAction: physicalStage,
    cameraExecution: cameraStage,
    compiler: scriptValidation.status === "IMMERSIVE_SEEDANCE_SCRIPT_VALIDATED" ? "GENERATED" : "BLOCKED",
    executionCompiler: modelFacingScript.status === "EXECUTABLE" ? "GENERATED" : "BLOCKED",
    finalScript: modelFacingScript.status === "EXECUTABLE"
      && executionValidation.status === "EXECUTION_SCRIPT_VALIDATED"
      ? "GENERATED"
      : "BLOCKED",
  };
  const momentReport: ImmersiveMomentReport[] = plan.moments.map((moment) => {
    const action = physicalActionReport.moments.find((entry) => entry.momentIndex === moment.index);
    const camera = cameraExecutionPlan.moments.find((entry) => entry.momentIndex === moment.index);
    return {
      momentIndex: moment.index,
      narrative: "PASS",
      scene: sceneResolution.resolvedMoments.some((entry) => entry.momentIndex === moment.index) ? "PASS" : "FAIL",
      product: productPresence.curve.some((entry) => entry.momentIndex === moment.index) ? "PASS" : "FAIL",
      sound: soundWorld.moments.some((entry) => entry.momentIndex === moment.index) ? "PASS" : "FAIL",
      cameraRole: cameraNarrative.moments.some((entry) => entry.momentIndex === moment.index) ? "PASS" : "FAIL",
      physicalAction: action?.status === "MATCHED" ? "PASS" : "CORRECT_UNSUPPORTED",
      cameraExecution: camera?.status === "EXECUTABLE" ? "PASS" : "CORRECT_UNSUPPORTED",
      compiler: stages.compiler === "GENERATED" ? "PASS" : "FAIL",
      execution: (() => {
        const contract = modelFacingScript.contracts.find((entry) => entry.momentIndex === moment.index);
        if (!contract) return "FAIL" as const;
        if (contract.executionStatus === "NOT_EXECUTABLE") return "FAIL" as const;
        if (contract.executionStatus === "SAFE_CONTINUATION") return "CORRECT_UNSUPPORTED" as const;
        return "PASS" as const;
      })(),
      finalScript: stages.finalScript,
    };
  });

  if (stageFailures.length > 0) {
    return {
      status: "BLOCKED",
      reason: "The immersive pipeline stopped at an upstream stage instead of compiling an unverified script.",
      diagnostics: stageFailures,
    };
  }

  return {
    status: "GENERATED",
    topicLabel,
    request,
    character,
    plan,
    sceneResolution,
    productPresence,
    soundWorld,
    cameraNarrative,
    physicalAction: { report: physicalActionReport, alignmentIssues: physicalActionBuilt.alignmentIssues },
    cameraExecution: { plan: cameraExecutionPlan, alignmentIssues: cameraExecutionBuilt.alignmentIssues },
    script,
    scriptValidation,
    modelFacingScript,
    executionValidation,
    executionInput,
    stages,
    momentReport,
  };
}

export const IMMERSIVE_TOPIC_LABELS = NARRATIVE_TOPIC_CATALOG.map((topic) => topic.label);
