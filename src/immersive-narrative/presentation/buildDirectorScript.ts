import type { ModelFacingCameraState } from "../execution-compiler";
import { resolvedWorldPresenceDescription } from "../scene-resolver/location-worlds";
import {
  BOUNDARY_NOTE,
  CONTINUITY_NOTE,
  IMMERSIVE_DIRECTOR_CONCEPTS,
  IMMERSIVE_DIRECTOR_TITLES,
  IMMERSIVE_TONE,
  PURPOSE_STRUCTURE_LABEL,
  TAKE_ROLE_LABEL,
  type ImmersiveDirectorConceptId,
} from "./catalogs";
import {
  IMMERSIVE_DIRECTOR_SCRIPT_SCHEMA_VERSION,
  type ImmersiveDirectorScript,
  type ImmersiveFinalScriptPresentation,
  type ImmersivePresentationInput,
  type ImmersivePresentationMoment,
  type ImmersivePresentationTake,
  type ImmersivePresentationValidation,
  type ImmersivePresentationCheck,
  type ImmersiveTakeRole,
} from "./types";

const INTERNAL_MARKERS = [
  "CORRECT_UNSUPPORTED",
  "REAL_CAPABILITY_GAP",
  "SMALL_OBJECT_RETRIEVAL",
  "CONTAINER_OBJECT_SEARCH",
  "Capability Matrix",
  "Eligibility",
  "[NARRATIVE CORE]",
  "APPROVED FOR SCENE RESOLUTION",
];

const COMMERCIAL_MARKERS = [
  "SHOT 1 — WORLD",
  "SHOT 2 — WEAR",
  "SHOT 3 — DETAIL",
  "SHOT 4 — HERO",
  "SHOT 5 — RELEASE",
  "Commercial film",
  "hero product shot",
];

// Section extraction keeps the director script and the execution prompt on one
// source of truth: the presentation layer never re-invents protection text.
function sectionLines(text: string, header: string) {
  const start = text.indexOf(`[${header}]`);
  if (start === -1) return [];
  const rest = text.slice(start + header.length + 2);
  const next = rest.search(/\n\[[A-Z][^\]]*\]/);
  const body = next === -1 ? rest : rest.slice(0, next);
  return body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function resolveConcept(roles: string[], takeCount: number): ImmersiveDirectorConceptId {
  if (roles.includes("PARTIAL_OBSERVATION")) return "NATURAL_PARTIAL_VIEW";
  if (takeCount === 1 && roles.includes("WAITING_CAMERA")) return "WAITING_FRAME_ENTRY";
  if (takeCount === 1) return "ONE_CONTINUOUS_OBSERVATION";
  if (roles.includes("FOLLOWER")) return "FOLLOW_THEN_SETTLE";
  return "OBSERVED_LIFE_SLICE";
}

function resolveTone(takes: ImmersivePresentationTake[], movement: ModelFacingCameraState["movementState"]) {
  if (takes.length === 1) return IMMERSIVE_TONE.still;
  if (movement === "hold_position") return IMMERSIVE_TONE.settling;
  return IMMERSIVE_TONE.moving;
}

function beginsNewTake(transition: ImmersivePresentationInput["modelFacingScript"]["diagnostics"]["cameraTransitions"][number] | undefined) {
  return Boolean(transition?.changed && /the subject (?:advances to a new position|travels through the space)/i.test(transition.motivation ?? ""));
}

function buildTakes(input: ImmersivePresentationInput): ImmersivePresentationTake[] {
  const script = input.modelFacingScript;
  const transitions = new Map(script.diagnostics.cameraTransitions.map((transition) => [transition.momentIndex, transition]));
  const takes: ImmersivePresentationTake[] = [];

  script.moments.forEach((moment, index) => {
    const transition = transitions.get(moment.momentIndex);
    const purpose = input.plan.moments.find((entry) => entry.index === moment.momentIndex)?.purpose ?? "establish_state";
    const currentPlanMoment = input.plan.moments.find((entry) => entry.index === moment.momentIndex);
    const previousPlanMoment = input.plan.moments.find((entry) => entry.index === moment.momentIndex - 1);
    const advancesAtApproach = input.plan.topicId === "afternoon_cafe"
      && purpose === "approach_trigger"
      && Boolean(currentPlanMoment && previousPlanMoment && currentPlanMoment.spatialAnchor !== previousPlanMoment.spatialAnchor);
    const startsNewTake = index === 0 || beginsNewTake(transition) || advancesAtApproach;
    const boundary = input.plan.moments.find((entry) => entry.index === moment.momentIndex)?.completionBoundary ?? "STATE_HELD";
    const presentationMoment: ImmersivePresentationMoment = {
      takeIndex: startsNewTake ? takes.length : Math.max(0, takes.length - 1),
      momentIndex: moment.momentIndex,
      purpose,
      purposeLabel: PURPOSE_STRUCTURE_LABEL[purpose],
      timeRange: {
        startSecond: moment.timeRange.startSecond,
        endSecond: moment.timeRange.endSecond,
        durationSeconds: Number((moment.timeRange.endSecond - moment.timeRange.startSecond).toFixed(1)),
      },
      whatHappens: moment.whatHappens,
      body: moment.bodyBehavior,
      camera: moment.cameraObservation,
      sound: moment.naturalSound,
      productVisibility: moment.productVisibility,
      productLine: moment.productLine,
      continuity: input.cameraExecution.moments.find((entry) => entry.momentIndex === moment.momentIndex)?.transitionKind ?? "CONTINUOUS_HOLD",
      boundary,
      boundaryNote: BOUNDARY_NOTE[boundary],
    };

    if (startsNewTake || takes.length === 0) {
      takes.push({
        takeIndex: takes.length,
        takeRole: "OPENING_OBSERVATION",
        cameraMovement: transition?.state.movementState ?? "locked_off",
        framingState: transition?.state.framingState ?? "medium-full",
        motivation: transition?.motivation ?? (advancesAtApproach ? currentPlanMoment?.causalLink ?? null : null),
        moments: [presentationMoment],
      });
      return;
    }
    takes[takes.length - 1].moments.push(presentationMoment);
  });

  return takes.map((take, index) => {
    if (index === 0) return { ...take, takeRole: "OPENING_OBSERVATION" as const };
    const isFinalTake = index === takes.length - 1;
    const takeStartTransition = transitions.get(take.moments[0]?.momentIndex ?? -1);
    const holdsOnlyEnding = isFinalTake
      && take.moments.length === 1
      && take.moments[0].continuity === "SETTLE";
    const role: ImmersiveTakeRole = holdsOnlyEnding
      ? "HELD_ENDING"
      : beginsNewTake(takeStartTransition)
        ? "MOTIVATED_REFRAME"
        : "CONTINUOUS_MOMENT";
    return { ...take, takeRole: role };
  });
}

function buildDirectorScript(input: ImmersivePresentationInput): ImmersiveDirectorScript {
  const script = input.modelFacingScript;
  const takes = buildTakes(input);
  const roles = input.cameraExecution.moments.map((moment) => moment.cameraRole);
  const conceptId = resolveConcept(roles, takes.length);
  const concept = IMMERSIVE_DIRECTOR_CONCEPTS[conceptId];
  const finalMoment = input.plan.moments[input.plan.moments.length - 1];
  const spatialAnchors = input.plan.moments.map((moment) => moment.spatialAnchor);
  const sceneNames = input.sceneResolution.resolvedMoments.map((moment) => moment.sceneName);
  const worldPresence = resolvedWorldPresenceDescription(
    input.sceneResolution.locationWorld?.id ?? null,
    input.sceneResolution.resolvedMoments.map((moment) => moment.sceneId),
  );

  return {
    schemaVersion: IMMERSIVE_DIRECTOR_SCRIPT_SCHEMA_VERSION,
    title: IMMERSIVE_DIRECTOR_TITLES[input.plan.topicId as keyof typeof IMMERSIVE_DIRECTOR_TITLES] ?? input.topicLabel,
    format: `Immersive narrative · single continuous slice · ${takes.length} take${takes.length === 1 ? "" : "s"} / 5 moments`,
    durationSeconds: input.plan.durationSeconds,
    tone: resolveTone(takes, takes[takes.length - 1]?.cameraMovement ?? "locked_off"),
    creativeIdea: input.plan.storyIntent,
    directorConcept: `${concept.label}. ${concept.globalRule}`,
    cinematicDevice: concept.device,
    filmStructure: input.plan.moments.map((moment, index) => (
      `${index + 1}. ${PURPOSE_STRUCTURE_LABEL[moment.purpose]} — ${moment.whatHappens} (ends at ${BOUNDARY_NOTE[moment.completionBoundary]})`
    )),
    character: [
      `Age: ${input.character.ageProfile ? `${input.character.ageProfile.ageMin}-${input.character.ageProfile.ageMax}` : "as written"}`,
      `Appearance: ${input.character.appearanceGroup?.label ?? "as written"}`,
      input.character.resolvedCharacterContext,
    ].filter(Boolean),
    takes,
    ending: `${finalMoment.whatHappens} The local goal is ${input.plan.goalState === "COMPLETED" ? "complete" : input.plan.goalState.toLowerCase()}; the camera holds the final frame without a new beat.`,
    goalState: input.plan.goalState,
    global: {
      spatialRoute: `${input.plan.spatialEnvelope.macroLocation} · ${spatialAnchors.join(" → ")} · ${sceneNames.join(" → ")}`,
      visualLook: [
        `One lens family for the whole slice: ${input.cameraExecution.continuityProfile.focalRange}.`,
        `Camera side: ${input.cameraExecution.continuityProfile.cameraSide}. ${input.cameraExecution.continuityProfile.axisRule}`,
        ...(worldPresence ? [`World occupancy: ${worldPresence}`] : []),
        input.cameraExecution.cameraLook.lookLine,
      ],
      soundPolicy: [
        ...sectionLines(script.compiledText, "GLOBAL EXECUTION RULES").filter((line) => /sound/i.test(line)),
        `Dominant world: ${input.sceneResolution.locationWorld?.label ?? "the current location"}, natural room tone and body-level sound only.`,
      ].join(" "),
      productProtection: sectionLines(script.compiledText, "PRODUCT / REFERENCE RULES"),
      negatives: sectionLines(script.compiledText, "DO NOT"),
    },
    executionPointer: "The Seedance execution prompt is generated separately from the same approved truth and remains unchanged.",
  };
}

function buildFormattedText(script: ImmersiveDirectorScript) {
  const lines: string[] = [
    script.title,
    "",
    `Duration: ${script.durationSeconds} seconds`,
    `Format: ${script.format}`,
    `Tone: ${script.tone}`,
    "",
    "CREATIVE IDEA",
    script.creativeIdea,
    "",
    "DIRECTOR CONCEPT",
    script.directorConcept,
    "",
    "CINEMATIC DEVICE",
    script.cinematicDevice,
    "",
    "CHARACTER",
    ...script.character,
    "",
    "FILM STRUCTURE",
    ...script.filmStructure,
    "",
  ];

  for (const take of script.takes) {
    lines.push(`TAKE ${take.takeIndex + 1} — ${TAKE_ROLE_LABEL[take.takeRole]}`);
    lines.push(take.takeIndex === 0
      ? `Opening camera state: ${take.cameraMovement.replace(/_/g, " ")}, ${take.framingState} framing.`
      : take.motivation
        ? `Camera change: ${take.motivation}.`
        : "Camera change: not motivated; the previous state is kept.");
    lines.push("");
    for (const moment of take.moments) {
      lines.push(
        `MOMENT ${moment.momentIndex + 1} — ${moment.purposeLabel}`,
        `Time: ${moment.timeRange.startSecond.toFixed(1)}-${moment.timeRange.endSecond.toFixed(1)}s`,
        `What happens: ${moment.whatHappens}`,
        `Body: ${moment.body}`,
        `Camera: ${moment.camera}`,
        `Sound: ${moment.sound.length > 0 ? moment.sound.join("; ") : "natural room tone only"}.`,
        `Continuity: ${CONTINUITY_NOTE[moment.continuity]}.`,
        `Ends at: ${moment.boundaryNote}.`,
        ""
      );
      if (moment.productLine) {
        lines.splice(lines.length - 1, 0, `Product: ${moment.productLine}`);
      }
    }
  }

  lines.push(
    "ENDING",
    script.ending,
    "",
    "GLOBAL SPATIAL ROUTE",
    script.global.spatialRoute,
    "",
    "GLOBAL VISUAL LOOK",
    ...script.global.visualLook,
    "",
    "GLOBAL SOUND",
    script.global.soundPolicy,
    "",
    "GLOBAL PRODUCT PROTECTION",
    ...(script.global.productProtection.length > 0 ? script.global.productProtection : ["Use the uploaded product references as the only product source; never redesign or stylize the product."]),
    "",
    "GLOBAL NEGATIVES",
    ...(script.global.negatives.length > 0 ? script.global.negatives : ["No insert shot, close-up, or cutaway. No music, dialogue, or voiceover."]),
    "",
    "SEEDANCE EXECUTION",
    script.executionPointer,
    ""
  );

  return lines.join("\n");
}

export function buildImmersiveFinalScriptPresentation(
  input: ImmersivePresentationInput
): ImmersiveFinalScriptPresentation {
  const directorScript = buildDirectorScript(input);
  return {
    directorScript,
    presentationScript: buildFormattedText(directorScript),
    executionScriptText: input.modelFacingScript.compiledText,
  };
}

export function validateImmersiveFinalScriptPresentation(
  presentation: ImmersiveFinalScriptPresentation,
  input: ImmersivePresentationInput
): ImmersivePresentationValidation {
  const checks: ImmersivePresentationCheck[] = [];
  const add = (id: string, label: string, passed: boolean, passReason: string, failReason: string) => {
    checks.push({ id, label, status: passed ? "PASS" : "FAIL", reason: passed ? passReason : failReason });
  };
  const script = presentation.directorScript;
  const text = presentation.presentationScript;

  add(
    "structure_complete",
    "Director script structure complete",
    Boolean(script.title && script.creativeIdea && script.directorConcept && script.cinematicDevice)
      && script.filmStructure.length === input.plan.moments.length
      && script.takes.length > 0
      && Boolean(script.ending),
    `Title, idea, concept, device, ${script.filmStructure.length} structure lines, ${script.takes.length} take(s), and an ending are present.`,
    "A required director-script block is missing."
  );

  const momentsInTakes = script.takes.flatMap((take) => take.moments);
  const takesCoverTimeline = momentsInTakes.length === input.plan.moments.length
    && momentsInTakes[0]?.timeRange.startSecond === 0
    && momentsInTakes[momentsInTakes.length - 1]?.timeRange.endSecond === input.plan.durationSeconds
    && momentsInTakes.every((moment, index) => index === 0 || moment.timeRange.startSecond === momentsInTakes[index - 1].timeRange.endSecond);
  add(
    "timeline_coverage",
    "Full timeline coverage",
    takesCoverTimeline,
    `Takes cover 0.0-${input.plan.durationSeconds}.0 continuously across ${momentsInTakes.length} Moments.`,
    "The take structure does not cover the full duration continuously."
  );

  const takeBoundaryMoments = new Set(input.modelFacingScript.diagnostics.cameraTransitions
    .filter((transition, index) => index > 0 && beginsNewTake(transition))
    .map((transition) => transition.momentIndex));
  for (const moment of input.plan.moments) {
    const previous = input.plan.moments.find((candidate) => candidate.index === moment.index - 1);
    if (input.plan.topicId === "afternoon_cafe" && moment.purpose === "approach_trigger" && previous && moment.spatialAnchor !== previous.spatialAnchor) {
      takeBoundaryMoments.add(moment.index);
    }
  }
  const takeBoundaries = takeBoundaryMoments.size;
  add(
    "moment_is_not_shot",
    "Moment ≠ Shot",
    script.takes.length === takeBoundaries + 1 && !/\bSHOT\b/.test(text),
    `${script.takes.length} take(s) for ${takeBoundaries} motivated spatial take boundary/boundaries; camera state changes remain within a Take unless they mark a new spatial passage.`,
    `Take count ${script.takes.length} does not match 1 + ${takeBoundaries} motivated spatial take boundaries.`
  );

  const internalHits = INTERNAL_MARKERS.filter((marker) => text.includes(marker));
  add(
    "no_internal_markers",
    "No internal markers",
    internalHits.length === 0,
    "No capability id, QC status, or unsupported marker appears in the director script.",
    `Internal markers leaked: ${internalHits.join(", ")}.`
  );

  const commercialHits = COMMERCIAL_MARKERS.filter((marker) => text.includes(marker));
  add(
    "commercial_distinctness",
    "Distinct from commercial-film vocabulary",
    commercialHits.length === 0 && text.includes("TAKE 1 —") && text.includes("Moment"),
    "The director script keeps its own TAKE/MOMENT vocabulary and never uses commercial shot roles.",
    `Commercial vocabulary leaked: ${commercialHits.join(", ")}.`
  );

  add(
    "execution_prompt_preserved",
    "Execution prompt preserved",
    presentation.executionScriptText === input.modelFacingScript.compiledText,
    `${presentation.executionScriptText.length} characters of execution prompt pass through unchanged.`,
    "The execution prompt was rewritten by the presentation layer."
  );

  const appearanceLabel = input.character.appearanceGroup?.label ?? "";
  const ageProfile = input.character.ageProfile;
  add(
    "character_binding",
    "Character selection reflected",
    Boolean(appearanceLabel && ageProfile)
      && script.character.some((line) => line.includes(appearanceLabel))
      && script.character.some((line) => line.includes(`${ageProfile!.ageMin}-${ageProfile!.ageMax}`)),
    `Director script states the selected age band and appearance (${appearanceLabel}).`,
    "The director script does not reflect the selected character appearance."
  );

  const failureReasons = checks.filter((check) => check.status === "FAIL").map((check) => `${check.id}: ${check.reason}`);
  return {
    checks,
    status: failureReasons.length === 0 ? "DIRECTOR_SCRIPT_VALIDATED" : "DIRECTOR_SCRIPT_FAILED",
    failureReasons,
  };
}
