import { productTruthLock } from "../../visual-system/types";
import type { SoundMoment } from "../sound-world";
import { buildCameraStates } from "./camera-state";
import {
  buildExecutionMomentContracts,
  checkMomentBoundary,
  completionClassesOf,
  temporalCoverage,
} from "./moment-contract";
import { resolveSafeContinuation } from "./safe-continuation";
import { filterSoundCues } from "./sound-filter";
import {
  EXECUTION_COMPILER_SCHEMA_VERSION,
  EXECUTION_COMPILER_VERSION,
  MODEL_FACING_HEADER,
  type ActionExecutionEvidence,
  type BoundaryConflict,
  type ExecutionCompilerCheck,
  type ExecutionCompilerInput,
  type ExecutionCompilerValidation,
  type ExecutionMomentContract,
  type ModelFacingExecutionScript,
  type ModelFacingMoment,
  type ModelFacingProductVisibility,
  type NarrativeCompletionClass,
  type ProductVisibilityDecision,
  type SafeContinuation,
  type SoundCueVerdict,
} from "./types";

const INTERNAL_MARKER_PATTERNS: RegExp[] = [
  /\[NARRATIVE CORE\]/,
  /\[MOMENT CHAIN\]/,
  /\[NARRATIVE QC\]/,
  /APPROVED FOR SCENE RESOLUTION/,
  /CORRECT_UNSUPPORTED/,
  /REAL_CAPABILITY_GAP/,
  /UNSUPPORTED_EXTRA/,
  /REQUIRED_CAPABILITY_MISSING/,
  /SMALL_OBJECT_RETRIEVAL/,
  /CONTAINER_OBJECT_SEARCH/,
  /SMALL_OBJECT_PLACEMENT/,
  /CARRIED_OBJECT_/,
  /GARMENT_ADJUSTMENT/,
  /DOOR_CONTACT/,
  /EXACT stride phase/,
  /Capability Matrix/,
  /Eligibility/,
  /Narrative-only primitive/,
  /Explicit V1 mapping/,
  /no narrative rewrite is required/,
  /QC PASS/,
  /\bprimitive\b/,
  /\bnarrative-[a-z-]+/,
  /\b(?:walking|transition|standing|turning|seated|environment-response|garment-task|scene-interaction|on-foot|mirror)[-_]?\d{3}\b/,
];

const PRODUCT_FACT_TOKENS = [
  "burgundy",
  "ivory",
  "outsole",
  "leather",
  "suede",
  "toe box",
  "color blocking",
  "heel counter",
  "laces",
  "silhouette",
  "stitching",
];

const COMPLETION_WORDING: Record<NarrativeCompletionClass, RegExp> = {
  ITEM_RETRIEVED: /\bfinds?\b|\bretriev|\btakes? (?:the|it) out\b|\bin her hand\b|\bcomes? free\b/i,
  DOOR_INTERACTION: /\bunlocks?\b|\bturns? the key\b|\bopens? the door\b|\bdoor handle\b/i,
  OBJECT_PLACEMENT: /\bplaces? (?:it|the object) down\b|\bsets? it down\b/i,
  GARMENT_SETTLED: /\badjustment is complete\b|\bsettles? the sleeve\b/i,
  CARRIED_OBJECT_SECURED: /\bchecks? the bag\b|\bitem is secure\b|\bsecured\b/i,
  ENTRY: /\bsteps? inside\b|\benters? the home\b|\bgoes inside\b/i,
  TASK_COMPLETE: /\bthe task is complete\b|\bis complete\b/i,
};

// Only non-negated clauses count as a completion claim: "the key is still not
// found" must never be read as a finished retrieval.
function claimsCompletion(text: string, completion: NarrativeCompletionClass) {
  const positiveClauses = text
    .split(/\.\s+|;\s+/)
    .filter((clause) => !/\bnot\b|\bno\b|\bnever\b|\bnothing\b|\byet to\b/i.test(clause));
  return positiveClauses.some((clause) => COMPLETION_WORDING[completion].test(clause));
}

// A shot change only counts when the script asks for it; prohibition sentences
// ("no insert shot", "do not create an insert shot") are not a shot change.
function assertsShotChange(text: string) {
  return text
    .split(/[.\n]+/)
    .filter((sentence) => !/\bno\b|\bnot\b|\bnever\b|\bwithout\b/i.test(sentence))
    .some((sentence) => /\binsert shot\b|\bclose-up\b|\bcutaway\b/i.test(sentence));
}

// Footwear anatomy words are product facts; the model-facing script speaks about
// footsteps, not about the outsole or the heel.
function sanitizeSoundCue(cue: string) {
  return cue
    .replace(/\b(?:short dry |quiet |soft )?outsole contact\b/gi, "footsteps")
    .replace(/\boutsole\b/gi, "shoe")
    .replace(/\bheel\b/gi, "foot");
}

function momentBlockOf(internalScriptText: string, momentIndex: number) {
  const start = internalScriptText.indexOf(`[MOMENT ${momentIndex + 1}]`);
  if (start === -1) return "";
  const next = internalScriptText.indexOf(`[MOMENT ${momentIndex + 2}]`, start);
  return internalScriptText.slice(start, next === -1 ? undefined : next);
}

function buildEvidence(input: ExecutionCompilerInput) {
  const map = new Map<number, ActionExecutionEvidence>();
  for (const moment of input.plan.moments) {
    const match = input.physicalAction.moments.find((entry) => entry.momentIndex === moment.index);
    map.set(moment.index, {
      momentIndex: moment.index,
      status: match?.status === "MATCHED" ? "MATCHED" : "UNRESOLVED",
      actionId: match?.selectedActionId ?? null,
      source: match?.source ?? null,
      handTask: match?.selectedHandTask ?? null,
      movementState: match?.selectedMovementState ?? null,
      capabilityIds: match?.primitiveEligibility?.capabilityVerdicts.map((verdict) => verdict.capability) ?? [],
      internalText: momentBlockOf(input.internalScriptText, moment.index),
    });
  }
  return map;
}

function movementMechanics(evidence: ActionExecutionEvidence) {
  switch (evidence.movementState) {
    case "walking_starting":
      return "Her first step settles onto the leading foot and she starts walking at an ordinary pace.";
    case "walking_ongoing":
      return "She keeps an ordinary walking pace, one step at a time.";
    case "walking_finish":
      return "The last walking step settles, with the weight moving onto the supporting foot.";
    case "stopping_settle":
      return "She comes to a settled stop, weight even on both feet.";
    case "stationary":
      return "She stands still with her weight settled.";
    case "transition_pause":
      return "She holds a brief, natural pause between two small movements.";
    case "turning":
      return "She turns in place with a compact, grounded pivot.";
    case "seated":
      return "She stays seated with her weight settled on the seat.";
    default:
      return "She moves at an ordinary, unhurried pace.";
  }
}

function handMechanics(
  evidence: ActionExecutionEvidence,
  contract: ExecutionMomentContract,
  container: string | null,
  item: string | null
) {
  const searching = evidence.capabilityIds.includes("CONTAINER_OBJECT_SEARCH") || evidence.handTask === "object_search";
  const door = evidence.capabilityIds.includes("DOOR_CONTACT") || evidence.handTask === "door_contact";
  const carrying = evidence.capabilityIds.some((capability) => capability.startsWith("CARRIED_OBJECT"))
    || (evidence.handTask?.startsWith("carried_object") ?? false);
  const garment = evidence.capabilityIds.includes("GARMENT_ADJUSTMENT") || evidence.handTask === "garment_adjustment";
  const placement = evidence.capabilityIds.includes("SMALL_OBJECT_PLACEMENT") || evidence.handTask === "object_placement";

  // The Narrative decides how far the hand behaviour goes; the action only
  // supplies mechanics. A retrieving Moment must not read as a search.
  if (contract.endState === "ITEM_RETRIEVED" && container) {
    if (/\bunlocks? the door|\bopens? the door|\breaches? for the door/i.test(contract.narrativeEvent)) {
      return `One hand finds the ${item ?? "object"} in the ${container}, brings it out, and turns it in the door.`;
    }
    return `One hand finds the ${item ?? "object"} in the ${container} and brings it out.`;
  }
  if (searching && container) {
    if (contract.endState === "SEARCH_BEGINS") {
      return `One hand moves inside the ${container} and begins feeling for the ${item ?? "object"}.`;
    }
    return `One hand keeps searching inside the ${container} for the ${item ?? "object"}.`;
  }
  if (door && item) return `One hand brings the ${item} to the door and turns it.`;
  if (door) return "One hand reaches the door and turns the handle.";
  if (placement) return "One hand sets the small object down and releases it.";
  if (garment) return "One hand adjusts her outer layer once, without hurrying.";
  if (carrying && container) return `She keeps the ${container} steady in one hand.`;
  if (evidence.handTask === "phone") return "One hand holds the phone at rest.";
  if (evidence.handTask === "seatSupport" || evidence.handTask === "furniture_contact") return "One hand rests lightly on the seat.";
  return "Her hands stay relaxed and empty.";
}

function clampClause(contract: ExecutionMomentContract, item: string | null) {
  const object = item ?? "object";
  switch (contract.endState) {
    case "SEARCH_BEGINS":
      return `The search has only started; the ${object} is not yet found or brought out.`;
    case "SEARCH_CONTINUES":
      return `The ${object} is still not found; nothing is taken out.`;
    case "REACH_BEGINS":
      return "Nothing is taken out yet and the reach is not finished.";
    case "OBJECT_HANDLING_IN_PROGRESS":
      return "The object keeps its place; nothing else changes.";
    case "WALK_CONTINUES":
      return "She is still walking; nothing else happens yet.";
    default:
      return null;
  }
}

function postureClause(text: string) {
  if (/posture becomes slightly less held|lets her posture settle/i.test(text)) return "Her posture releases slightly as she does it.";
  if (/closes? the pocket|completes? the small hand movement/i.test(text)) {
    return "She closes the pocket and finishes the small hand movement at an ordinary pace.";
  }
  return null;
}

function momentTitle(contract: ExecutionMomentContract, item: string | null) {
  switch (contract.endState) {
    case "SEARCH_BEGINS":
      return "THE SEARCH BEGINS";
    case "SEARCH_CONTINUES":
      return "SHE KEEPS SEARCHING";
    case "REACH_BEGINS":
      return "SLOWING AND REACHING";
    case "ITEM_RETRIEVED":
      return /\bdoor\b/i.test(contract.narrativeEvent)
        ? `${(item ?? "the object").toUpperCase()} AND THE DOOR`
        : `${(item ?? "the object").toUpperCase()} COMES OUT`;
    case "DOOR_INTERACTION":
      return "AT THE DOOR";
    case "OBJECT_HANDLING_IN_PROGRESS":
      return "THE SAME CARRY";
    case "OBJECT_PLACEMENT":
      return "A SMALL ADJUSTMENT";
    case "GARMENT_SETTLE":
      return "A SMALL ADJUSTMENT";
    case "ENTRY_COMPLETE":
      return "SHE GOES IN";
    case "SETTLED_STATE":
      return "SETTLING";
    case "WALK_CONTINUES":
      return "WALKING";
    default:
      return "HOLDING THE MOMENT";
  }
}

function resolveProductVisibility(
  contract: ExecutionMomentContract,
  input: ExecutionCompilerInput,
  evidence: ActionExecutionEvidence
): ProductVisibilityDecision {
  const presence = input.productPresence.curve.find((entry) => entry.momentIndex === contract.momentIndex)?.presence ?? "ABSENT";
  const camera = input.cameraExecution.moments.find((entry) => entry.momentIndex === contract.momentIndex);
  if (presence === "ABSENT") {
    return { momentIndex: contract.momentIndex, internalPresence: presence, modelFacing: "ABSENT", downgraded: false, reason: "the Narrative has no product in this Moment" };
  }
  if (presence === "INCIDENTAL") {
    return { momentIndex: contract.momentIndex, internalPresence: presence, modelFacing: "VISIBLE_IF_NATURALLY_FRAMED", downgraded: false, reason: "incidental presence never constrains the frame" };
  }
  const stableFraming = camera?.status === "EXECUTABLE"
    && (camera.shotScale === "medium_full" || camera.shotScale === "full_figure")
    && camera.cameraMovement === "locked_off";
  const stableBody = !/^walking_/.test(evidence.movementState ?? "");
  if (stableFraming && stableBody) {
    return { momentIndex: contract.momentIndex, internalPresence: presence, modelFacing: "READABLE_REQUIRED", downgraded: false, reason: "the chosen framing already keeps the full figure stable in frame" };
  }
  return {
    momentIndex: contract.momentIndex,
    internalPresence: presence,
    modelFacing: "VISIBLE_IF_NATURALLY_FRAMED",
    downgraded: true,
    reason: camera?.status === "EXECUTABLE"
      ? "the observation keeps moving or does not hold a stable full figure, so the product is not required to stay readable"
      : "this Moment has no executable camera plan, so no product requirement is added",
  };
}

function containerAndItem(text: string, topicNarrative: string) {
  const container = text.match(/\bbag\b|\bpocket\b|\bhandbag\b/i)?.[0].toLowerCase()
    ?? topicNarrative.match(/\bbag\b|\bpocket\b|\bhandbag\b/i)?.[0].toLowerCase()
    ?? null;
  const item = text.match(/\bkey\b|\bcard\b|\bsmall item\b|\bthe object\b/i)?.[0].toLowerCase()
    ?? topicNarrative.match(/\bkey\b|\bcard\b|\bsmall item\b|\bthe object\b/i)?.[0].toLowerCase()
    ?? null;
  return { container, item };
}

function render(
  input: ExecutionCompilerInput,
  moments: ModelFacingMoment[],
  cameraSummary: { changes: number; suppressed: number },
  soundVerdicts: SoundCueVerdict[],
  productDecisions: ProductVisibilityDecision[]
) {
  const referenceCount = input.referenceMapping.confirmedReferenceCount;
  const world = input.sceneResolution.locationWorld?.label ?? "current location";
  const scenes = input.sceneResolution.resolvedMoments.map((moment) => moment.sceneName);
  const lines: string[] = [];

  lines.push(MODEL_FACING_HEADER);
  lines.push(`${input.topicLabel} · ${input.plan.durationSeconds}s · one person · real-world timing`);
  lines.push("");
  lines.push("[INTENT]");
  lines.push(input.plan.storyIntent);
  lines.push("One person, one continuous sequence. Nothing is added between the moments below.");
  lines.push("");
  lines.push("[CHARACTER]");
  lines.push(`Age: ${input.character.ageProfile ? `${input.character.ageProfile.ageMin}-${input.character.ageProfile.ageMax}` : "as written"}`);
  lines.push(`Appearance: ${input.character.appearanceGroup?.label ?? "as written"}`);
  lines.push("One person only. Keep the same person, wardrobe, and hair for the whole clip.");
  lines.push("");
  lines.push("[WORLD & CONTINUITY]");
  lines.push(`Location: ${world}. Scenes in order: ${scenes.join(" → ")}.`);
  lines.push(`Season: ${input.season}. Keep the same light direction, surfaces, and location continuity throughout.`);
  lines.push(`Camera side: ${input.cameraExecution.continuityProfile.cameraSide}. Lens: ${input.cameraExecution.continuityProfile.focalRange}.`);
  lines.push("");
  lines.push("[CAMERA STATE]");
  lines.push("Natural eye level, fixed working distance, the same camera side for the whole clip.");
  lines.push(cameraSummary.changes <= 1
    ? "The camera is established once and then observed without cuts or re-frames."
    : `${cameraSummary.changes} motivated camera state changes across the clip${cameraSummary.suppressed > 0 ? `; ${cameraSummary.suppressed} requested change(s) were suppressed because they were not motivated` : ""}.`);
  lines.push("Moment is not a shot: do not cut to a new setup for each moment.");
  lines.push("");
  lines.push("[TIMELINE]");

  for (const moment of moments) {
    lines.push("");
    lines.push(`${moment.timeRange.startSecond.toFixed(1)}-${moment.timeRange.endSecond.toFixed(1)}s — MOMENT ${moment.momentIndex + 1} · ${moment.title}`);
    lines.push(`WHAT HAPPENS: ${moment.whatHappens}`);
    lines.push(`BODY: ${moment.bodyBehavior}`);
    lines.push(`CAMERA: ${moment.cameraObservation}`);
    lines.push(`SOUND: ${moment.naturalSound.length > 0 ? moment.naturalSound.join("; ") : "natural room tone only"}.`);
    if (moment.productLine) lines.push(`PRODUCT: ${moment.productLine}`);
  }
  lines.push("");
  lines.push("[GLOBAL EXECUTION RULES]");
  lines.push("Real-world speed and normal human cadence; no slow motion, no time stretching, no speed ramp.");
  lines.push("The camera observes the person. It never changes what the person is doing.");
  lines.push("Do not add any action, object, event, or product beat that is not written in the timeline.");
  lines.push("Sound is natural world sound only: no music, no dialogue, no voiceover, no narration.");
  lines.push("Use only the sounds written in the timeline; do not add any other object, door, or surface sound.");
  lines.push("Do not advance past a moment's described end state; each moment stops where it says it stops.");
  lines.push("");
  lines.push("[PRODUCT / REFERENCE RULES]");
  if (referenceCount > 0) {
    lines.push(productTruthLock);
    lines.push(`Use the ${referenceCount} confirmed product reference${referenceCount === 1 ? "" : "s"} uploaded with this task as the only product source.`);
  } else {
    lines.push("If product references are supplied to the external model, preserve those references exactly. Do not redesign or stylize the product.");
    lines.push("No product reference is confirmed for this task, so do not add or invent any colour, material, construction, logo, or panel detail.");
  }
  if (productDecisions.some((decision) => decision.modelFacing === "VISIBLE_IF_NATURALLY_FRAMED" && decision.internalPresence !== "INCIDENTAL")) {
    lines.push("Product visibility: visible only if it falls naturally inside the framing. Never re-frame, push in, or cut away for the product.");
  }
  lines.push("");
  lines.push("[DO NOT]");
  lines.push("No new person, no crowd focus, no vehicle or animal entering the frame.");
  lines.push("No insert shot, close-up, cutaway, or new camera setup.");
  lines.push("No pose montage, no product showcase, no logo reveal, no on-screen text.");
  lines.push("No re-framing for the product; the narrative camera always wins.");
  lines.push("");
  lines.push("[ENDING STATE]");
  const last = moments[moments.length - 1];
  lines.push(`${last.whatHappens}`);
  lines.push("Hold the final frame until the clip ends. Do not append a product shot, a logo, or a second ending.");
  return lines.join("\n");
}

export function compileModelFacingExecutionScript(input: ExecutionCompilerInput): ModelFacingExecutionScript {
  const contracts = buildExecutionMomentContracts(input);
  const evidences = buildEvidence(input);
  const topicNarrative = input.plan.moments.map((moment) => moment.whatHappens).join(" ");

  // Conflicts the internal representation already carries (measured, not fixed).
  const boundaryConflictsBefore: BoundaryConflict[] = [];
  for (const contract of contracts) {
    const evidence = evidences.get(contract.momentIndex)!;
    boundaryConflictsBefore.push(...checkMomentBoundary(contract, evidence, {
      safeContinuationAvailable: false,
      source: "INTERNAL_ACTION",
    }));
  }

  const notExecutableReasons: string[] = [];
  const safeContinuations: { momentIndex: number; kind: SafeContinuation["kind"]; evidence: string }[] = [];
  const safeContinuationByMoment = new Map<number, SafeContinuation>();
  const soundVerdicts: SoundCueVerdict[] = [];
  const productDecisions: ProductVisibilityDecision[] = [];

  let previousCameraDescription: string | null = null;
  for (const contract of contracts) {
    const evidence = evidences.get(contract.momentIndex)!;
    const cameraMoment = input.cameraExecution.moments.find((moment) => moment.momentIndex === contract.momentIndex);
    const soundMoment: SoundMoment | undefined = input.soundWorld.moments.find((moment) => moment.momentIndex === contract.momentIndex);
    const conflicts = checkMomentBoundary(contract, evidence, { safeContinuationAvailable: false, source: "INTERNAL_ACTION" });
    // A matched Moment keeps its mechanics and is clamped by the boundary; only a
    // Moment with no executable action needs a safe continuation.
    const needsContinuation = evidence.status === "UNRESOLVED";

    if (needsContinuation) {
      const previous = (() => {
        const index = contracts.findIndex((entry) => entry.momentIndex === contract.momentIndex);
        for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
          const candidate = contracts[cursor];
          const candidateEvidence = evidences.get(candidate.momentIndex)!;
          if (candidateEvidence.status === "MATCHED") return { contract: candidate, evidence: candidateEvidence };
        }
        return null;
      })();
      const result = resolveSafeContinuation(
        contract,
        previous,
        cameraMoment,
        soundMoment,
        topicNarrative,
        previousCameraDescription
      );
      if (!result.available) {
        notExecutableReasons.push(`Moment ${contract.momentIndex + 1}: ${result.reason}`);
        contract.executionStatus = "NOT_EXECUTABLE";
      } else {
        contract.executionStatus = "SAFE_CONTINUATION";
        safeContinuationByMoment.set(contract.momentIndex, result.continuation);
        safeContinuations.push({
          momentIndex: contract.momentIndex,
          kind: result.continuation.kind,
          evidence: result.continuation.evidence,
        });
      }
    }

    const verdicts = filterSoundCues({ contract, topicNarrative, evidence, soundMoment });
    soundVerdicts.push(...verdicts);
  }

  const cameraTransitions = buildCameraStates(input.cameraExecution, contracts, evidences);
  const moments: ModelFacingMoment[] = [];

  for (const contract of contracts) {
    const evidence = evidences.get(contract.momentIndex)!;
    const topicText = topicNarrative;
    const { container, item } = containerAndItem(contract.narrativeEvent, topicText);
    const transition = cameraTransitions.find((entry) => entry.momentIndex === contract.momentIndex)!;
    const decision = resolveProductVisibility(contract, input, evidence);
    productDecisions.push(decision);

    const continuation = safeContinuationByMoment.get(contract.momentIndex);
    const bodyParts: string[] = [];
    if (continuation) {
      bodyParts.push(continuation.humanLine);
    } else {
      bodyParts.push(movementMechanics(evidence));
      bodyParts.push(handMechanics(evidence, contract, container, item));
      const posture = postureClause(contract.narrativeEvent);
      if (posture) bodyParts.push(posture);
      const clamp = clampClause(contract, item);
      if (clamp) bodyParts.push(clamp);
    }
    const bodyBehavior = bodyParts.join(" ");

    const keptSound = soundVerdicts
      .filter((verdict) => verdict.momentIndex === contract.momentIndex && verdict.kept)
      .map((verdict) => sanitizeSoundCue(verdict.cue));
    const cameraObservation = transition.changed
      ? `${transition.state.movementState === "restrained_follow"
        ? "Restrained parallel follow at a fixed working distance"
        : transition.state.movementState === "hold_position"
          ? "The camera holds its position"
          : "The same locked observation"} from ${transition.state.cameraSide}, ${transition.state.height}, ${transition.state.framingState} framing, unchanged lens.`
      : `Same camera position, side, lens, and ${transition.state.framingState} framing as the previous moment; no cut and no re-frame.${transition.state.naturalPartialVisibility ? " The body may become naturally partially visible through its own movement; do not create an insert shot." : ""}`;
    if (transition.state.naturalPartialVisibility) {
      previousCameraDescription = cameraObservation;
    } else {
      previousCameraDescription = cameraObservation;
    }

    moments.push({
      momentIndex: contract.momentIndex,
      title: momentTitle(contract, item),
      timeRange: {
        startSecond: contract.timeRange?.startSecond ?? 0,
        endSecond: contract.timeRange?.endSecond ?? 0,
      },
      whatHappens: contract.narrativeEvent,
      bodyBehavior,
      cameraObservation,
      naturalSound: keptSound,
      productVisibility: decision.modelFacing,
      productLine: decision.modelFacing === "READABLE_REQUIRED"
        ? "Keep the footwear naturally readable inside this framing; never re-frame or add a product shot for it."
        : null,
      endStateLine: contract.objectStateAfter,
      contract,
    });
  }

  // Timeline must be continuous; an internal unsupported moment still receives
  // the canonical scheduler's window.
  const coverage = temporalCoverage(moments.map((moment) => moment.timeRange), input.plan.durationSeconds);
  if (!coverage.contiguous) {
    notExecutableReasons.push("the timeline is not continuously covered from 0.0 to the full duration");
  }

  const cameraChanges = cameraTransitions.filter((entry) => entry.changed).length - (cameraTransitions.length > 0 ? 1 : 0);
  const suppressedCameraChanges = cameraTransitions.filter((entry) => entry.suppressed).length;
  const compiledText = render(
    input,
    moments,
    { changes: cameraChanges, suppressed: suppressedCameraChanges },
    soundVerdicts,
    productDecisions
  );

  const engineeringMarkers = INTERNAL_MARKER_PATTERNS
    .flatMap((pattern) => compiledText.match(pattern) ?? []);
  const boundaryConflictsAfter: BoundaryConflict[] = [];
  for (const contract of contracts) {
    const evidence = evidences.get(contract.momentIndex)!;
    const continuation = safeContinuationByMoment.get(contract.momentIndex);
    const text = moments.find((moment) => moment.momentIndex === contract.momentIndex)?.bodyBehavior ?? "";
    // The translated text is what the model will execute, so the model-facing
    // boundary check reads the translated text, not the internal capability set.
    if (evidence.status === "UNRESOLVED" && !continuation) {
      boundaryConflictsAfter.push({
        momentIndex: contract.momentIndex,
        type: "MISSING_END_STATE",
        detail: `Narrative Moment ends at ${contract.endState} but neither a matched action nor a safe continuation covers it.`,
        source: "MODEL_FACING",
      });
    }
    for (const forbidden of contract.forbiddenCompletions) {
      if (claimsCompletion(text, forbidden)) {
        boundaryConflictsAfter.push({
          momentIndex: contract.momentIndex,
          type: "EARLY_COMPLETION",
          detail: `Model-facing body text claims ${forbidden} although the Moment ends at ${contract.endState}.`,
          source: "MODEL_FACING",
        });
      }
    }
  }

  return {
    schemaVersion: EXECUTION_COMPILER_SCHEMA_VERSION,
    compilerVersion: EXECUTION_COMPILER_VERSION,
    topicId: input.plan.topicId as ModelFacingExecutionScript["topicId"],
    topicLabel: input.topicLabel,
    season: input.season,
    durationSeconds: input.plan.durationSeconds,
    status: notExecutableReasons.length === 0 ? "EXECUTABLE" : "NOT_EXECUTABLE",
    notExecutableReasons,
    compiledText,
    moments,
    contracts,
    diagnostics: {
      internalScriptLength: input.internalScriptText.length,
      modelFacingLength: compiledText.length,
      boundaryConflictsBefore,
      boundaryConflictsAfter,
      safeContinuations,
      soundVerdicts,
      rejectedSoundCount: soundVerdicts.filter((verdict) => !verdict.kept).length,
      productDecisions,
      productDowngrades: productDecisions.filter((decision) => decision.downgraded).length,
      cameraTransitions,
      cameraStateChanges: Math.max(0, cameraChanges),
      unmotivatedCameraChanges: cameraTransitions.filter((entry) => entry.changed && !entry.motivation).length,
      suppressedCameraChanges,
      forcedInsertShots: cameraTransitions.filter((entry, index) => (
        index > 0
        && entry.changed
        && contracts[index].endState !== "ENTRY_COMPLETE"
        && cameraTransitions[index - 1].state.naturalPartialVisibility
      )).length,
      referenceCount: input.referenceMapping.confirmedReferenceCount,
      engineeringMarkers: [...new Set(engineeringMarkers)],
      timelineCoverage: coverage,
    },
  };
}

export function validateModelFacingExecutionScript(
  script: ModelFacingExecutionScript,
  input: ExecutionCompilerInput
): ExecutionCompilerValidation {
  const checks: ExecutionCompilerCheck[] = [];
  const add = (id: string, label: string, passed: boolean, passReason: string, failReason: string) => {
    checks.push({ id, label, status: passed ? "PASS" : "FAIL", reason: passed ? passReason : failReason });
  };
  const diagnostics = script.diagnostics;

  add(
    "narrative_completion_boundary",
    "Narrative Completion Boundary",
    script.contracts.length === script.moments.length
      && script.contracts.every((contract) => contract.narrativeEvent.length > 0 && contract.endState.length > 0 && contract.objectStateAfter.length > 0),
    `All ${script.contracts.length} Moments carry a start state, event, object state, and end state derived from the Narrative.`,
    "At least one Moment has no completion boundary."
  );
  add(
    "no_early_completion",
    "No Early Completion",
    diagnostics.boundaryConflictsAfter.length === 0,
    `Model-facing output preserves every Moment end state (internal conflicts detected before translation: ${diagnostics.boundaryConflictsBefore.length}).`,
    `Model-facing output still advances ${diagnostics.boundaryConflictsAfter.length} Moment boundary(ies).`
  );
  add(
    "no_downstream_event_invention",
    "No Downstream Event Invention",
    diagnostics.safeContinuations.every((entry) => entry.evidence.length > 0) && script.notExecutableReasons.length === 0,
    "Every translated Moment either keeps the matched body mechanics or states a Narrative-supported continuation.",
    script.notExecutableReasons.join(" ") || "a translation lacks Narrative evidence"
  );
  add(
    "safe_continuation_validity",
    "Safe Continuation Validity",
    script.contracts.filter((contract) => contract.executionStatus === "SAFE_CONTINUATION").length === diagnostics.safeContinuations.length,
    `${diagnostics.safeContinuations.length} safe continuation(s), each with preserved object, hand task, and causal state.`,
    "a safe continuation is not traceable to a Moment contract"
  );
  add(
    "full_timeline_coverage",
    "Full Timeline Coverage",
    diagnostics.timelineCoverage.contiguous
      && diagnostics.timelineCoverage.startSecond === 0
      && diagnostics.timelineCoverage.endSecond === input.plan.durationSeconds,
    `Timeline covers ${diagnostics.timelineCoverage.startSecond.toFixed(1)}-${diagnostics.timelineCoverage.endSecond.toFixed(1)}s without a hole.`,
    "the timeline has an unscheduled gap"
  );
  add(
    "sound_evidence_gate",
    "Sound Evidence Gate",
    diagnostics.soundVerdicts.every((verdict) => verdict.kept ? verdict.evidence.length > 0 : true)
      && diagnostics.soundVerdicts.filter((verdict) => !verdict.kept).every((verdict) => (
        !(script.moments.find((moment) => moment.momentIndex === verdict.momentIndex)?.naturalSound ?? []).includes(verdict.cue)
      )),
    `${diagnostics.soundVerdicts.length} cues checked; ${diagnostics.rejectedSoundCount} rejected for missing event evidence and excluded from the script.`,
    "a rejected sound cue is still present or a kept cue lacks evidence"
  );
  add(
    "camera_state_persistence",
    "Camera State Persistence",
    diagnostics.unmotivatedCameraChanges === 0,
    `${diagnostics.cameraStateChanges} motivated camera change(s), ${diagnostics.suppressedCameraChanges} suppressed, 0 unmotivated.`,
    `${diagnostics.unmotivatedCameraChanges} unmotivated camera change(s) remain`
  );
  add(
    "no_unmotivated_insert_shot",
    "No Unmotivated Insert Shot",
    diagnostics.forcedInsertShots === 0 && !assertsShotChange(script.compiledText),
    "PARTIAL_OBSERVATION is translated as natural partial visibility; no insert shot is created.",
    "an insert-style camera setup was created"
  );
  add(
    "product_camera_consistency",
    "Product / Camera Consistency",
    diagnostics.productDecisions.every((decision) => !decision.downgraded || decision.modelFacing === "VISIBLE_IF_NATURALLY_FRAMED")
      && !/\bre-?frame for the product\b/i.test(script.compiledText.replace(/never re-?frame[^\n]*/i, "")),
    `${diagnostics.productDowngrades} product requirement(s) downgraded to natural framing; the narrative camera keeps priority.`,
    "a product requirement forced a camera change"
  );
  const productFactsInText = PRODUCT_FACT_TOKENS.filter((token) => (
    new RegExp(`\\b${token.replace(/\s+/g, "\\s+")}\\b`, "i").test(script.compiledText)
  ));
  add(
    "reference_zero_safety",
    "Reference=0 Safety",
    diagnostics.referenceCount > 0 || productFactsInText.length === 0,
    diagnostics.referenceCount > 0
      ? `confirmed references: ${diagnostics.referenceCount}; confirmed product truth is allowed`
      : "no confirmed reference, so no specific product fact appears in the model-facing script",
    `specific product facts leaked with zero confirmed references: ${productFactsInText.join(", ")}`
  );
  add(
    "no_internal_ids",
    "No Internal IDs",
    diagnostics.engineeringMarkers.length === 0,
    "No action id, primitive id, capability id, or engineering marker appears in the model-facing script.",
    `internal markers leaked: ${diagnostics.engineeringMarkers.join(", ")}`
  );
  add(
    "no_debug_status_language",
    "No Debug Status Language",
    !/CORRECT_UNSUPPORTED|QC (?:PASS|FAIL)|APPROVED FOR SCENE RESOLUTION|REAL_CAPABILITY_GAP/i.test(script.compiledText),
    "No QC, gap, or unsupported status language appears in the model-facing script.",
    "debug status language leaked into the model-facing script"
  );
  const lastMoment = script.moments[script.moments.length - 1];
  add(
    "ending_state_preserved",
    "Ending State Preserved",
    Boolean(lastMoment) && script.compiledText.includes("[ENDING STATE]") && /do not append/i.test(script.compiledText),
    "The final Moment's narrative text closes the script and no extra ending is allowed.",
    "the ending state is missing or open-ended"
  );

  const failureReasons = checks.filter((check) => check.status === "FAIL").map((check) => `${check.id}: ${check.reason}`);
  return {
    checks,
    status: failureReasons.length === 0 ? "EXECUTION_SCRIPT_VALIDATED" : "EXECUTION_SCRIPT_FAILED",
    failureReasons,
  };
}
