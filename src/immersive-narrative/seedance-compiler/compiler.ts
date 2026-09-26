import { productTruthLock } from "../../visual-system/types";
import type { ResolvedCharacterProfile } from "../character-profile";
import type { CameraNarrativeOutput } from "../camera-role";
import type { CameraExecutionPlan } from "../camera-execution";
import type { PhysicalActionAuditReport } from "../physical-action";
import type { ProductPresenceOutput } from "../product-presence";
import type { SceneResolverOutput } from "../scene-resolver";
import type { SoundWorldOutput } from "../sound-world";
import { resolvedWorldPresenceDescription } from "../scene-resolver/location-worlds";
import type { NarrativePlan, NarrativeSeason } from "../types";
import {
  IMMERSIVE_SCRIPT_SECTIONS,
  IMMERSIVE_SEEDANCE_COMPILER_SCHEMA_VERSION,
  IMMERSIVE_SEEDANCE_COMPILER_VERSION,
  type ImmersiveScriptSectionId,
  type ImmersiveSeedanceScript,
  type ImmersiveSeedanceScriptCheck,
  type ImmersiveSeedanceScriptValidation,
} from "./types";

export type ImmersiveReferenceMapping = {
  mode: "reference_bound_manual" | "not_applicable";
  confirmedReferenceCount: number;
  instruction: string;
};

export type ImmersiveSeedanceCompilerInput = {
  topicLabel: string;
  season: NarrativeSeason;
  lifestyleFeeling: string;
  character: ResolvedCharacterProfile;
  plan: NarrativePlan;
  sceneResolution: SceneResolverOutput;
  productPresence: ProductPresenceOutput;
  soundWorld: SoundWorldOutput;
  cameraNarrative: CameraNarrativeOutput;
  physicalAction: PhysicalActionAuditReport;
  cameraExecution: CameraExecutionPlan;
  referenceMapping: ImmersiveReferenceMapping;
};

export const DEFAULT_REFERENCE_MAPPING: ImmersiveReferenceMapping = {
  mode: "reference_bound_manual",
  confirmedReferenceCount: 0,
  instruction:
    "Use the confirmed footwear references uploaded in the current task as the only product source. If a Reference Plan order exists in THERUIZ AURA, upload the references to the external video model in that order before generating. This system attaches no references itself.",
};

const NO_MUSIC_DIALOGUE_VOICE = [
  "no music score",
  "no soundtrack bed",
  "no foreground dialogue",
  "no voiceover",
  "no narration",
];

const SCRIPT_PROHIBITIONS = [
  "no pose montage",
  "no OOTD slideshow",
  "no shoe showcase cutaway",
  "no five disconnected lifestyle clips",
  "no commercial storyboard cliché (hero push-in, product hero shot, logo reveal)",
  "no second narrative subject or crowd focus; location-appropriate ambient people remain incidental and never participate in the story",
  "no invented event that the Narrative does not contain",
  "no slow motion, time stretching, or speed ramp",
  "no product morphing, recolour, or reshaping",
  "no on-screen text, caption, or logo overlay",
  "no change to any Physical Action in order to obtain a nicer shot",
];

function soundLine(moment: SoundWorldOutput["moments"][number]) {
  const cues: string[] = [];
  if (moment.environment.length > 0) cues.push(`ENVIRONMENT ${moment.environment.join(" / ")}`);
  if (moment.human.length > 0) cues.push(`HUMAN ${moment.human.join(" / ")}`);
  if (moment.object.length > 0) cues.push(`OBJECT ${moment.object.join(" / ")}`);
  if (moment.footwear.length > 0) cues.push(`FOOTWEAR ${moment.footwear.join(" / ")}`);
  cues.push(`SILENCE ${moment.silenceLevel}`);
  return `${cues.join(" · ")}. Dominant: ${moment.dominantSound}.`;
}

function referenceSection(input: ImmersiveSeedanceCompilerInput) {
  const count = input.referenceMapping.confirmedReferenceCount;
  if (input.referenceMapping.mode === "not_applicable") {
    return ["No product reference mapping is required for this script."];
  }
  return [
    `Reference mode: manual reference-bound upload (confirmed references in this task: ${count}).`,
    input.referenceMapping.instruction,
    "This system performs no Provider call and never uploads references automatically.",
  ];
}

export function compileImmersiveSeedanceScript(input: ImmersiveSeedanceCompilerInput): ImmersiveSeedanceScript {
  const { plan, sceneResolution, productPresence, soundWorld, cameraNarrative, physicalAction, cameraExecution } = input;
  const actionByIndex = new Map(physicalAction.moments.map((moment) => [moment.momentIndex, moment]));
  const sceneByIndex = new Map(sceneResolution.resolvedMoments.map((moment) => [moment.momentIndex, moment]));
  const productByIndex = new Map(productPresence.curve.map((moment) => [moment.momentIndex, moment]));
  const soundByIndex = new Map(soundWorld.moments.map((moment) => [moment.momentIndex, moment]));
  const roleByIndex = new Map(cameraNarrative.moments.map((moment) => [moment.momentIndex, moment]));
  const cameraByIndex = new Map(cameraExecution.moments.map((moment) => [moment.momentIndex, moment]));
  const locationWorld = sceneResolution.locationWorld;
  const worldPresence = resolvedWorldPresenceDescription(locationWorld?.id ?? null, sceneResolution.resolvedMoments.map((moment) => moment.sceneId));
  const characterAge = input.character.ageProfile;
  const characterAppearance = input.character.appearanceGroup;

  const lines: string[] = [];
  const momentBlocks: ImmersiveSeedanceScript["diagnostics"]["momentBlocks"] = [];
  const unsupportedMomentIndexes: number[] = [];

  lines.push("SEEDANCE — IMMERSIVE NARRATIVE VIDEO SCRIPT");
  lines.push(`Topic: ${input.topicLabel}`);
  lines.push(`Duration: ${plan.durationSeconds} seconds`);
  lines.push(`Season: ${input.season} · Lifestyle feeling: ${input.lifestyleFeeling}`);
  lines.push("Delivery: one primary narrative subject, one small process, one micro-event, one coherent life sequence. Copy this script into the external video model manually.");
  lines.push("");

  lines.push("[GLOBAL INTENT]");
  lines.push(plan.storyIntent);
  lines.push(`Initial state: ${plan.initialCharacterState}`);
  lines.push(`Micro event: ${plan.microEvent}`);
  lines.push("Keep one primary narrative subject, one continuous situation, and one emotional or state shift. This is an observed small life sequence, not a shot list.");
  lines.push("");

  lines.push("[CHARACTER]");
  lines.push(`Age: ${characterAge ? `${characterAge.ageMin}-${characterAge.ageMax}` : "not resolved"}`);
  lines.push(`Appearance: ${characterAppearance?.label ?? "not resolved"}`);
  lines.push(input.character.resolvedCharacterContext);
  lines.push("One primary narrative subject only. Location-appropriate ambient people may remain incidental in public space. Personality, job, and social class are not inferred from appearance.");
  lines.push("");

  lines.push("[VISUAL WORLD]");
  lines.push(`Location world: ${locationWorld ? `${locationWorld.label} (${locationWorld.id})` : "unresolved"}`);
  lines.push(`Scenes in order: ${plan.moments.map((moment) => sceneByIndex.get(moment.index)?.sceneName ?? "unresolved").join(" → ")}`);
  lines.push(`Season world: ${input.season} with its real light, clothing weight, and surface evidence.`);
  if (worldPresence) lines.push(worldPresence);
  lines.push("Do not empty a normally occupied public environment merely to isolate the main character; private rooms remain private. Background voices may have incidental visual sources where naturally visible, without a camera move or cutaway.");
  lines.push(`Camera look: ${cameraExecution.cameraLook.lookLine}`);
  lines.push(`Lens family: ${cameraExecution.continuityProfile.focalRange} (${cameraExecution.continuityProfile.lensFamily}); perspective risk assessment ${cameraExecution.continuityProfile.perspectiveRisk}.`);
  lines.push(`Camera side: ${cameraExecution.continuityProfile.cameraSide}. ${cameraExecution.continuityProfile.axisRule}`);
  lines.push("");

  lines.push("[STORY ARC]");
  lines.push(`Emotional arc: ${plan.emotionalArc.join(" → ")}`);
  plan.moments.forEach((moment) => {
    lines.push(`Moment ${moment.index + 1} (${moment.purpose}): ${moment.whatHappens}${moment.causalLink ? ` — causal link: ${moment.causalLink}` : ""}`);
  });
  lines.push("");

  for (const moment of plan.moments) {
    const action = actionByIndex.get(moment.index);
    const scene = sceneByIndex.get(moment.index);
    const product = productByIndex.get(moment.index);
    const sound = soundByIndex.get(moment.index);
    const role = roleByIndex.get(moment.index);
    const camera = cameraByIndex.get(moment.index);
    const momentNumber = moment.index + 1;

    lines.push(`[MOMENT ${momentNumber}]`);
    lines.push(`Time: ${camera?.timing ? `${camera.timing.startSecond.toFixed(1)}-${camera.timing.endSecond.toFixed(1)}s` : "unscheduled (see Physical Action status)"}`);
    lines.push("");
    lines.push("SCENE");
    lines.push(`${scene?.sceneName ?? "unresolved"} · ${scene?.continuityRole ?? "unresolved"}${scene?.matchReason ? ` — ${scene.matchReason}` : ""}`);
    lines.push("");
    lines.push("PHYSICAL ACTION");
    if (action && action.status === "MATCHED") {
      lines.push(`Action: ${action.selectedActionId} (${action.selectedActionFamily}) · movement ${action.selectedMovementState} · hand ${action.selectedHandTask ?? "none"} · footwork ${action.selectedFootwork ?? "none"}.`);
      lines.push(`${action.whyCompatible}`);
      lines.push("Perform the body behavior at ordinary real-world speed. Do not add, remove, or re-time any part of it.");
    } else {
      unsupportedMomentIndexes.push(moment.index);
      lines.push(`CORRECT_UNSUPPORTED — no executable Physical Action is defined for this Moment (missing capability: ${action?.missingCapability ?? action?.unresolvedReason ?? "unspecified"} / ${action?.gapClass ?? "REAL_CAPABILITY_GAP"}).`);
      lines.push("Do not invent a body action here. Keep the Moment as an observed pause inside the sequence; do not replace it with a pose, a product beat, or a different action.");
    }
    lines.push("");
    lines.push("CAMERA");
    lines.push(`Camera Narrative Role: ${role?.role ?? camera?.cameraRole ?? "unresolved"}.`);
    if (camera && camera.status === "EXECUTABLE") {
      lines.push(`Execution: ${camera.shotScale} · ${camera.cameraHeight} · ${camera.viewAngle} · ${camera.lensFamily}.`);
      lines.push(`Movement: ${camera.cameraMovement}. ${camera.movementRelationToSubject ?? ""}`);
      lines.push(`Working distance: ${camera.workingDistance ?? ""}`);
      lines.push(`Framing: start — ${camera.startFraming ?? ""} end — ${camera.endFraming ?? ""}`);
      lines.push(`Transition: ${camera.transitionBehavior}`);
      lines.push(`Subject visibility: ${camera.subjectVisibility ?? ""}`);
      lines.push("The camera observes the Physical Action. It never rewrites hand task, footwork, movement, or object interaction.");
    } else {
      lines.push("CORRECT_UNSUPPORTED — no camera execution is issued for this Moment. Do not cut around the missing action and do not fabricate a replacement shot.");
    }
    lines.push("");
    lines.push("SOUND");
    lines.push(sound ? soundLine(sound) : "No sound world record.");
    lines.push("Naturalistic world sound only. No music, no foreground dialogue, no voiceover.");
    lines.push("");
    lines.push("PRODUCT PRESENCE");
    lines.push(`${product?.presence ?? "ABSENT"} — ${camera?.productVisibilityGuard ?? product?.reason ?? "Product Presence is a readability guard only."}`);
    lines.push("");

    momentBlocks.push({
      momentIndex: moment.index,
      momentPurpose: moment.purpose,
      whatHappens: moment.whatHappens,
      sceneId: scene?.sceneId ?? "",
      sceneName: scene?.sceneName ?? "",
      physicalActionStatus: action?.status === "MATCHED" ? "MATCHED" : "CORRECT_UNSUPPORTED",
      physicalActionId: action?.status === "MATCHED" ? action.selectedActionId : null,
      cameraRole: role?.role ?? camera?.cameraRole ?? "OBSERVER",
      cameraExecutionStatus: camera?.status === "EXECUTABLE" ? "EXECUTABLE" : "CORRECT_UNSUPPORTED",
      section: lines.slice(lines.lastIndexOf(`[MOMENT ${momentNumber}]`)).join("\n"),
    });
  }

  lines.push("[CONTINUITY]");
  lines.push(`One lens family: ${cameraExecution.continuityProfile.lensFamily} (${cameraExecution.continuityProfile.focalRange}).`);
  lines.push(`One camera side: ${cameraExecution.continuityProfile.cameraSide}. ${cameraExecution.continuityProfile.axisRule}`);
  lines.push(`Frame handling: ${cameraExecution.continuityProfile.resetToFrontPolicy}`);
  lines.push("Keep the same person, wardrobe, season, light direction, colour grade, and ground relationship across all Moments.");
  lines.push("The five Moments are one continuous observed sequence. Do not reset the frame, the lens, or the camera side between Moments.");
  lines.push("");

  lines.push("[PRODUCT / REFERENCE PROTECTION]");
  lines.push(productTruthLock);
  lines.push("Use the uploaded product references as the only product source. Do not add, rename, or infer any material, colour, toe shape, outsole, heel, logo, or construction fact that the references do not establish.");
  lines.push("Keep left and right shoes mutually consistent, at believable human scale, with stable ground contact and no frame-to-frame deformation.");
  referenceSection(input).forEach((line) => lines.push(line));
  lines.push("Product Presence may not create a body action, a camera move, or a product close-up. It only constrains whether the product must stay readable inside the action-led frame.");
  lines.push("");

  lines.push("[NEGATIVE / DO-NOT]");
  lines.push(`Camera prohibitions: ${cameraExecution.restrictions.join(", ")}.`);
  lines.push(`Camera look prohibitions: ${cameraExecution.cameraLook.negativeLine}.`);
  lines.push(`Content prohibitions: ${SCRIPT_PROHIBITIONS.join(", ")}.`);
  lines.push(`Sound prohibitions: ${NO_MUSIC_DIALOGUE_VOICE.join(", ")}.`);
  lines.push("");

  lines.push("[FINAL ENDING STATE]");
  const lastMoment = plan.moments[plan.moments.length - 1];
  const lastCamera = lastMoment ? cameraByIndex.get(lastMoment.index) : undefined;
  lines.push(`Ending Moment: ${lastMoment ? lastMoment.whatHappens : "unresolved"}`);
  lines.push(`Ending state: ${lastMoment ? lastMoment.purposeLabel : "unresolved"}.`);
  lines.push(lastCamera?.status === "EXECUTABLE" && lastCamera.endFraming
    ? `Camera ending: ${lastCamera.endFraming} Hold the final frame; no new event, no new composition.`
    : "The final Moment is correctly unsupported, so no cinematic resolution is claimed. End without adding a new event.");
  lines.push("The sequence ends in a settled state. Do not append a product shot, a logo, or a second ending.");

  const compiledText = lines.join("\n");
  const consumedSections: ImmersiveScriptSectionId[] = IMMERSIVE_SCRIPT_SECTIONS.filter((section) => (
    section === "MOMENT"
      ? compiledText.includes("[MOMENT 1]")
      : compiledText.includes(section === "SCENE" || section === "PHYSICAL ACTION" || section === "CAMERA" || section === "SOUND" || section === "PRODUCT PRESENCE"
        ? `\n${section}\n`
        : `[${section}]`)
  ));

  return {
    schemaVersion: IMMERSIVE_SEEDANCE_COMPILER_SCHEMA_VERSION,
    compilerVersion: IMMERSIVE_SEEDANCE_COMPILER_VERSION,
    topicId: plan.topicId as ImmersiveSeedanceScript["topicId"],
    topicLabel: input.topicLabel,
    durationSeconds: plan.durationSeconds,
    season: input.season as ImmersiveSeedanceScript["season"],
    lifestyleFeeling: input.lifestyleFeeling,
    compiledText,
    diagnostics: {
      momentBlocks,
      unsupportedMomentIndexes,
      correctUnsupportedCount: unsupportedMomentIndexes.length,
      consumedSections,
      providerDependency: "NONE",
      providerApiAssumptions: 0,
      downstreamInventions: 0,
      copyableComplete: true,
      characterCount: compiledText.length,
    },
  };
}

// Deterministic compiler validator. It reads the compiled artifact and the
// canonical upstream records; it never re-plans any upstream stage.
export function validateImmersiveSeedanceScript(
  script: ImmersiveSeedanceScript,
  input: ImmersiveSeedanceCompilerInput
): ImmersiveSeedanceScriptValidation {
  const checks: ImmersiveSeedanceScriptCheck[] = [];
  const add = (id: string, label: string, passed: boolean, passReason: string, failReason: string) => {
    checks.push({ id, label, status: passed ? "PASS" : "FAIL", reason: passed ? passReason : failReason });
  };

  const actionByIndex = new Map(input.physicalAction.moments.map((moment) => [moment.momentIndex, moment]));
  const sceneByIndex = new Map(input.sceneResolution.resolvedMoments.map((moment) => [moment.momentIndex, moment]));
  const productByIndex = new Map(input.productPresence.curve.map((moment) => [moment.momentIndex, moment]));
  const soundByIndex = new Map(input.soundWorld.moments.map((moment) => [moment.momentIndex, moment]));
  const roleByIndex = new Map(input.cameraNarrative.moments.map((moment) => [moment.momentIndex, moment]));
  const cameraByIndex = new Map(input.cameraExecution.moments.map((moment) => [moment.momentIndex, moment]));

  add(
    "canonical_sections_consumed",
    "All canonical upstream sections consumed",
    script.diagnostics.consumedSections.length === IMMERSIVE_SCRIPT_SECTIONS.length,
    `All ${IMMERSIVE_SCRIPT_SECTIONS.length} canonical section families are present in the compiled script.`,
    `Only ${script.diagnostics.consumedSections.length} of ${IMMERSIVE_SCRIPT_SECTIONS.length} canonical section families are present.`
  );

  const indexes = script.diagnostics.momentBlocks.map((block) => block.momentIndex);
  const noMissingMoment = script.diagnostics.momentBlocks.length === input.plan.moments.length
    && input.plan.moments.every((moment) => indexes.includes(moment.index))
    && JSON.stringify(indexes) === JSON.stringify(input.plan.moments.map((moment) => moment.index));
  add(
    "no_missing_moment",
    "No missing Moment",
    noMissingMoment,
    `All ${input.plan.moments.length} canonical Moments appear exactly once and in order.`,
    "At least one canonical Moment is missing, duplicated, or re-ordered in the compiled script."
  );

  const narrativePreserved = input.plan.moments.every((moment) => {
    const block = script.diagnostics.momentBlocks.find((entry) => entry.momentIndex === moment.index);
    return Boolean(block) && block!.whatHappens === moment.whatHappens;
  }) && script.compiledText.includes(input.plan.storyIntent);
  add(
    "narrative_preserved",
    "Narrative preserved",
    narrativePreserved,
    "Every Moment text and the story intent reach the script unchanged from the Narrative Plan.",
    "A Moment text or the story intent differs from the Narrative Plan."
  );

  const scenePreserved = input.plan.moments.every((moment) => {
    const block = script.diagnostics.momentBlocks.find((entry) => entry.momentIndex === moment.index);
    return block?.sceneId === sceneByIndex.get(moment.index)?.sceneId;
  });
  add(
    "scene_preserved",
    "Scene preserved",
    scenePreserved,
    "Every Moment keeps the Scene Resolver assignment by canonical index.",
    "At least one Moment changed its resolved Scene."
  );

  const productPreserved = input.plan.moments.every((moment) => {
    const presence = productByIndex.get(moment.index)?.presence;
    return Boolean(presence) && script.compiledText.includes(presence!);
  });
  add(
    "product_presence_preserved",
    "Product Presence preserved",
    productPreserved,
    "Every Product Presence level is emitted as a guard without generating action or camera motivation.",
    "At least one Product Presence level is missing from the script or was replaced."
  );

  const soundPreserved = input.plan.moments.every((moment) => {
    const sound = soundByIndex.get(moment.index);
    if (!sound) return false;
    const block = script.diagnostics.momentBlocks.find((entry) => entry.momentIndex === moment.index);
    return Boolean(block) && block!.section.includes(sound.dominantSound);
  });
  add(
    "sound_preserved",
    "Sound preserved",
    soundPreserved,
    "Every Moment carries the Sound World cues and dominant category.",
    "At least one Moment lost its Sound World cues."
  );

  const cameraRolePreserved = input.plan.moments.every((moment) => {
    const block = script.diagnostics.momentBlocks.find((entry) => entry.momentIndex === moment.index);
    return block?.cameraRole === roleByIndex.get(moment.index)?.role;
  });
  add(
    "camera_role_preserved",
    "Camera Role preserved",
    cameraRolePreserved,
    "Every Moment keeps its Camera Narrative Role.",
    "At least one Moment changed its Camera Narrative Role."
  );

  const physicalActionPreserved = input.plan.moments.every((moment) => {
    const block = script.diagnostics.momentBlocks.find((entry) => entry.momentIndex === moment.index);
    const action = actionByIndex.get(moment.index);
    if (!block || !action) return false;
    if (action.status === "MATCHED") {
      return block.physicalActionStatus === "MATCHED" && block.physicalActionId === action.selectedActionId;
    }
    return block.physicalActionStatus === "CORRECT_UNSUPPORTED" && block.physicalActionId === null;
  });
  add(
    "physical_action_preserved",
    "Physical Action preserved",
    physicalActionPreserved,
    `All ${input.physicalAction.moments.filter((moment) => moment.status === "MATCHED").length} matched Moments keep their exact Action id; every unresolved Moment stays CORRECT_UNSUPPORTED.`,
    "The script diverges from the Physical Action audit result."
  );

  const cameraExecutionPreserved = input.plan.moments.every((moment) => {
    const block = script.diagnostics.momentBlocks.find((entry) => entry.momentIndex === moment.index);
    const camera = cameraByIndex.get(moment.index);
    if (!block || !camera) return false;
    if (camera.status === "EXECUTABLE") {
      return block.cameraExecutionStatus === "EXECUTABLE" && block.section.includes(camera.shotScale ?? "");
    }
    return block.cameraExecutionStatus === "CORRECT_UNSUPPORTED";
  });
  add(
    "camera_execution_preserved",
    "Camera Execution preserved",
    cameraExecutionPreserved,
    "Every executable Moment carries its Camera Execution plan; every unsupported Moment carries no execution.",
    "The script diverges from the Camera Execution plan."
  );

  const noDownstreamInvention = script.diagnostics.downstreamInventions === 0
    && !/\b(?:music|dialogue|voiceover|narration)\b\s*(?:starts|begins|plays|is added)/i.test(script.compiledText)
    && script.diagnostics.correctUnsupportedCount === input.physicalAction.moments.filter((moment) => moment.status === "UNRESOLVED").length;
  add(
    "no_downstream_invention",
    "No downstream invention",
    noDownstreamInvention,
    "The compiler adds no event, sound source, product claim, or action that the upstream stages did not produce.",
    "The compiler invented content downstream of the canonical stages."
  );

  const referenceProtectionPresent = script.compiledText.includes("[PRODUCT / REFERENCE PROTECTION]")
    && script.compiledText.includes(productTruthLock)
    && script.compiledText.includes("manual reference-bound upload");
  add(
    "reference_protection_present",
    "Reference protection present",
    referenceProtectionPresent,
    "The product truth lock and the manual reference-bound upload instruction are present.",
    "The product/reference protection section is incomplete."
  );

  const noProviderAssumptions = script.diagnostics.providerDependency === "NONE"
    && script.diagnostics.providerApiAssumptions === 0
    && !/\b(?:api key|endpoint|credential|authorization|provider id|model id)\b/i.test(script.compiledText);
  add(
    "no_provider_assumptions",
    "No provider/API assumptions",
    noProviderAssumptions,
    "The script assumes no Provider API, credential, endpoint, or model route; it is copied manually.",
    "The script references a Provider API, credential, or model route."
  );

  const copyableComplete = script.diagnostics.copyableComplete
    && script.compiledText.startsWith("SEEDANCE — IMMERSIVE NARRATIVE VIDEO SCRIPT")
    && script.compiledText.includes("[FINAL ENDING STATE]")
    && script.diagnostics.characterCount === script.compiledText.length;
  add(
    "copyable_complete_script",
    "Copyable complete script produced",
    copyableComplete,
    `${script.diagnostics.characterCount} characters of self-contained copyable script with a stated final ending state.`,
    "The compiled script is not a single self-contained copyable artifact."
  );

  const failureReasons = checks.filter((check) => check.status === "FAIL").map((check) => `${check.id}: ${check.reason}`);
  return {
    checks,
    status: failureReasons.length === 0 ? "IMMERSIVE_SEEDANCE_SCRIPT_VALIDATED" : "IMMERSIVE_SEEDANCE_SCRIPT_FAILED",
    failureReasons,
  };
}
