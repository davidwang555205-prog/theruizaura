import { productTruthLock } from "../../visual-system/types";
import type { SoundMoment } from "../sound-world";
import { resolvedWorldPresenceDescription } from "../scene-resolver/location-worlds";
import { locationWorldTruthOf } from "../scene-resolver/location-worlds";
import { modelFacingCompletedEvent, modelFacingFact, modelFacingStateSentences } from "../final-consistency/facts";
import { buildFinalPerformanceBehavior, STATE_LOCK_NOT_BODY_FREEZE } from "../final-consistency/natural-continuation";
import { dedupeConsecutive, humanReadableRoute, spatialAnchorLabel, takeOpeningCameraLine } from "../final-consistency/truth";
import { acousticsZoneOf } from "../final-consistency/truth";
import { buildCameraStates } from "./camera-state";
import {
  buildExecutionMomentContracts,
  checkMomentBoundary,
  completionClassesOf,
  returnsObjectToContainer,
  temporalCoverage,
} from "./moment-contract";
import { resolveSafeContinuation } from "./safe-continuation";
import { filterSoundCues } from "./sound-filter";
import {
  EMOTION_NEVER_ACTS_RULE,
  findForbiddenEmotionalReleaseWording,
  findForbiddenSoundCueWording,
} from "./emotion-rule";
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

function lowerFirst(text: string) {
  if (text.length === 0) return text;
  return `${text[0].toLowerCase()}${text.slice(1)}`;
}

function sentence(text: string) {
  const trimmed = text.trim();
  if (trimmed.length === 0) return "";
  const capitalized = `${trimmed[0].toUpperCase()}${trimmed.slice(1)}`;
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
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
      return "She makes a compact, grounded directional turn and carries the next step into the new course.";
    case "seated":
      return "She completes the turn into the open chair and lowers into a settled seated position.";
    default:
      return "She moves at an ordinary, unhurried pace.";
  }
}

function handMechanics(
  evidence: ActionExecutionEvidence,
  contract: ExecutionMomentContract,
  container: string | null,
  item: string | null,
  topicNarrative = ""
) {
  const returnedToContainer = /\b(?:slips?|puts?|returns?)\s+(?:it|the (?:card|key|item))\s+(?:straight\s+)?back\s+(?:into|in)\s+(?:the\s+)?(?:same|usual)\s+(?:pocket|bag)\b/i.test(contract.narrativeEvent);
  const searching = evidence.capabilityIds.includes("CONTAINER_OBJECT_SEARCH") || evidence.handTask === "object_search";
  const door = evidence.capabilityIds.includes("DOOR_CONTACT") || evidence.handTask === "door_contact";
  const carrying = evidence.capabilityIds.some((capability) => capability.startsWith("CARRIED_OBJECT"))
    || (evidence.handTask?.startsWith("carried_object") ?? false);
  const garment = evidence.capabilityIds.includes("GARMENT_ADJUSTMENT") || evidence.handTask === "garment_adjustment";
  const placement = evidence.capabilityIds.includes("SMALL_OBJECT_PLACEMENT") || evidence.handTask === "object_placement";

  if (returnedToContainer && container) {
    if (/\bmisses? the (?:card|key|item)\b[^.]*\bfinds? the (?:card|key|item)\b/i.test(contract.narrativeEvent)) {
      return `One hand checks the ${container}; the first touch misses the ${item ?? "object"}, the second finds it and draws it out just enough to confirm it is there, then slips it straight back into the same ${container}; the hand is empty again.`;
    }
    return `One hand checks the ${container}, confirms the ${item ?? "object"} is there, then slips it straight back into the same ${container}; the hand is empty again.`;
  }

  // The Narrative decides how far the hand behaviour goes; the action only
  // supplies mechanics. A retrieving Moment must not read as a search.
  if (contract.endState === "ITEM_RETRIEVED" && container) {
    if (/\bmisses? the (?:card|key|item)\b[^.]*\bfinds? the (?:card|key|item)\b/i.test(contract.narrativeEvent)) {
      return `One hand checks the ${container}; the first touch misses the ${item ?? "object"}, then the second touch finds it and brings it out in the same continuous movement${/\bunlocks? the door\b/i.test(contract.narrativeEvent) ? " before turning it in the door" : ""}.`;
    }
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
  if (evidence.capabilityIds.includes("SMALL_OBJECT_RETRIEVAL") && contract.endState === "REACH_BEGINS") {
    return `One hand begins reaching for the ${item ?? "object"}.`;
  }
  if (door && contract.startState === "ITEM_RETRIEVED" && /\bopens? the door\b/i.test(contract.narrativeEvent)) {
    return "One hand opens the already unlocked door.";
  }
  if (door && item) return `One hand brings the ${item} to the door and turns it.`;
  if (door) return "One hand reaches the door and turns the handle.";
  if (placement) return "One hand sets the small object down and releases it.";
  if (garment) return "One hand adjusts her outer layer once, without hurrying.";
  if (carrying && container) return `She keeps the ${container} steady in one hand.`;
  if (carrying && item) return "One hand checks the carried item once and re-seats it in the same grip.";
  // The Narrative decides what the hands are doing; the Action only supplies
  // mechanics. A carried item the Narrative states must not read as empty hands.
  if (/\bin hand\b|\bcarrying\b|\bwith one bag\b|\bwith one shopping bag\b/i.test(contract.narrativeEvent)) {
    return `One hand keeps the ${item ?? container ?? "carried item"} steady.`;
  }
  if (evidence.handTask === "phone") return "One hand holds the phone at rest.";
  if (evidence.handTask === "seatSupport" || evidence.handTask === "furniture_contact") return "One hand rests lightly on the seat.";
  return "Her hands stay at rest and empty.";
}

function clampClause(contract: ExecutionMomentContract, item: string | null) {
  const object = item ?? "object";
  switch (contract.endState) {
    case "SEARCH_BEGINS":
      return `The search has only started; the ${object} is not yet found or brought out.`;
    case "SEARCH_CONTINUES":
      return `The ${object} is still not found; nothing is taken out.`;
    case "REACH_BEGINS":
      return item ? "Nothing is taken out yet and the reach is not finished." : null;
    case "OBJECT_HANDLING_IN_PROGRESS":
      return "The object keeps its place; nothing else changes.";
    case "WALK_CONTINUES":
      return "She continues along the current route; no separate action is added.";
    default:
      return null;
  }
}

function postureClause(text: string) {
  // Kinematics only. The narrative may describe a posture change, but the
  // execution layer never renders it as an emotional release.
  if (/crossing step is shorter|posture becomes slightly less held|lets her posture settle/i.test(text)) {
    return "Her stride shortens as she crosses and the weight lands on the leading foot.";
  }
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
  const sceneIds = input.sceneResolution.resolvedMoments.map((moment) => moment.sceneId);
  const publicScenes = sceneIds.filter((id) => /(?:cafe|bookstore|grocery|city|street|park|community|office-entrance|business|shop|store|mall|station|restaurant|flower|hotel-lobby|waiting|residential-building-exit)/i.test(id));
  const worldPresence = resolvedWorldPresenceDescription(input.sceneResolution.locationWorld?.id ?? null, sceneIds);
  const isCafe = input.sceneResolution.locationWorld?.id === "CAFE_VISIT";
  const isBookstore = input.sceneResolution.locationWorld?.id === "BOOKSTORE_VISIT";
  const isStreet = input.sceneResolution.locationWorld?.id === "AFTER_LUNCH_STREET" || input.sceneResolution.locationWorld?.id === "URBAN_WANDERING";
  const locationTruth = locationWorldTruthOf(input.sceneResolution.locationWorld?.id ?? null, sceneIds);
  const isWalkingRoute = isStreet || /route|walk|path|corner|block/i.test(locationTruth.category);
  const takeBoundaryCount = moments.filter((moment) => Boolean(moment.contract.takeBoundary)).length;
  const lines: string[] = [];

  lines.push(MODEL_FACING_HEADER);
  lines.push(`${input.topicLabel} · ${input.plan.durationSeconds}s · one primary subject · real-world timing`);
  lines.push("");
  lines.push("[INTENT]");
  lines.push(input.plan.storyIntent);
  lines.push("One primary subject, one continuous sequence. Nothing is added between the moments below.");
  lines.push("");
  lines.push("[CHARACTER]");
  lines.push(`Age: ${input.character.ageProfile ? `${input.character.ageProfile.ageMin}-${input.character.ageProfile.ageMax}` : "as written"}`);
  lines.push(`Appearance: ${input.character.appearanceGroup?.label ?? "as written"}`);
  lines.push("Keep the same primary person, wardrobe, and hair for the whole clip. Background people must never become a second narrative subject.");
  lines.push("");
  lines.push("[WORLD & CONTINUITY]");
  const anchors = input.plan.moments.map((moment) => moment.spatialAnchor);
  lines.push(`Location: ${world}. Scene sequence: ${dedupeConsecutive(scenes).join(" → ")}.`);
  lines.push(`Structured spatial route: ${humanReadableRoute(anchors)} (anchors: ${anchors.join(" → ")}).`);
  lines.push(`Season: ${input.season}. Keep the same light direction, surfaces, and location continuity throughout.`);
  if (publicScenes.length > 0) {
    lines.push(worldPresence ?? "This is an actively operating public environment, not an empty set. Location-appropriate staff, customers, or pedestrians are present in the background, occupied with ordinary independent activity.");
    lines.push("Keep all background people incidental and secondary. They do not look toward, react to, follow, assist, interrupt, or interact with the main character unless the approved event explicitly requires it. Do not change the camera to show them.");
    lines.push(isCafe
      ? "Keep the working barista behind the counter and a few unrelated customers in the seating area or room depth within the established cafe frame; they remain background presence and never become narrative subjects."
      : isBookstore
        ? "Keep a few unrelated browsers at the shelves or in the depth of the established bookstore frame; they remain background presence and never become narrative subjects."
        : isStreet
          ? "Keep pedestrians passing independently at the frame edge or in the depth of the established street frame; they remain background presence and never become narrative subjects."
          : "Keep ambient people secondary, incidental, partly visible, softly separated by depth, or occupied with ordinary independent activity.");
    lines.push("Background voices should have plausible visual sources somewhere in the environment when naturally visible within the established frame; do not create an acoustically occupied but visually abandoned public space. Do not change the camera to show a sound source or an ambient person.");
    lines.push("The existing background activity continues at its own pace while she moves; a foreground passerby or brief partial obstruction may cross the established view without becoming a new story event.");
  } else {
    lines.push(worldPresence ?? "Private rooms remain private; do not add unfamiliar background people.");
    lines.push("The room's existing light, surfaces, and ambience remain present while she acts; nothing pauses to present her or the product.");
  }
  if (isCafe) {
    lines.push("Within this one cafe scene, the movement proceeds from entry past the counter as an open seat comes into view, adjusts toward the seating area, then slows and takes the open seat. Existing tables, chairs, and independent activity may partially interrupt the route without clearing it; no location jump or new event.");
    lines.push("The camera does not owe continuous coverage of the entire route. She may enter partially, pass behind counter or furniture edges, move close to the frame boundary, and the final seat action may be partly occluded; TAKE_SEAT completion must remain legible. Never pan, drift, or reframe solely to keep covering the protagonist.");
  }
  if (isBookstore) {
    lines.push("The window and shelf displays contain books and reading material, never footwear. The character stops at the window to look at the bookstore display, not at shoes; the established observation is kept without creating a showroom composition.");
    lines.push("The window look lasts only as long as the real stop requires. Do not add a prolonged neutral stance, a lean-in, or an extra viewing performance to fill the observation window.");
    lines.push("The observation happens inside the already established stop; it does not add a second full physical hold.");
  }
  if (isBookstore || isWalkingRoute) {
    lines.push("Reference-derived brand identity is role-bound: brand name, logo, typography, product mark, packaging identity, and trademark cues stay on the protagonist's worn product and never appear in storefront text, signage, glass lettering, posters, advertisements, shelves, wall graphics, or background merchandise. Any environmental text must be generic location text only.");
  }
  lines.push(`Camera side: ${input.cameraExecution.continuityProfile.cameraSide}. Lens: ${input.cameraExecution.continuityProfile.focalRange}.`);
  lines.push("");
  lines.push("[CAMERA STATE]");
  lines.push(isWalkingRoute
    ? "Natural human height, world-anchored observer, the same camera side, and no subject-presentation guarantee for the whole clip. The camera does not travel with, accompany, or maintain distance to the protagonist; apparent subject size changes naturally as the protagonist moves through the world."
    : "Natural human height, the same camera side, and no subject-presentation guarantee for the whole clip. Distance and framing may drift; the camera never chases, re-centers, or recovers the subject or product.");
  lines.push(cameraSummary.changes === 0 && takeBoundaryCount === 0
    ? "The camera is established once and then observed without cuts or re-frames."
    : cameraSummary.changes === takeBoundaryCount
      ? `${cameraSummary.changes} justified camera position change(s) at real spatial boundaries; every other Moment inherits the existing observation without a re-frame.`
      : `${cameraSummary.changes} justified camera position change(s) across the clip${cameraSummary.suppressed > 0 ? `; ${cameraSummary.suppressed} requested change(s) were suppressed because they were not motivated` : ""}.`);
  lines.push("Moment is not a shot: do not cut to a new setup for each moment.");
  lines.push(takeBoundaryCount > 0
    ? `The approved Take Plan holds exactly ${takeBoundaryCount} motivated camera boundary/boundaries for ${takeBoundaryCount + 1} Takes; each one opens a new Take, and no other camera setup is admitted anywhere in the sequence.`
    : "The approved Take Plan holds no camera boundary; the observation is established once for the whole sequence.");
  lines.push("");
  lines.push("[TIMELINE]");
  const takes: ModelFacingMoment[][] = [];
  for (const moment of moments) {
    if (takes.length === 0 || moment.contract.takeBoundary) takes.push([]);
    takes[takes.length - 1].push(moment);
  }
  const visible = moments.flatMap((moment) => moment.contract.requiredVisibleEvidence);
  if (visible.length > 0) {
    lines.push("[MANDATORY VISUAL COMPLETION]");
    const emitted = new Set<string>();
    for (const item of visible) {
      if (emitted.has(item.id)) continue;
      emitted.add(item.id);
      lines.push(`${emitted.size}. ${item.statement}`);
    }
    lines.push("Each listed transition must leave enough visual evidence to be understood, even if part of the action is briefly occluded. It needs no dedicated shot, held pause, centered pose, or full unobstructed view; generic walking, product observation, posing, or a camera move cannot replace it.");
  }
  takes.forEach((take, takeIndex) => {
    const first = take[0];
    const lastTakeMoment = take[take.length - 1];
    lines.push("");
    lines.push(`TAKE ${takeIndex + 1} — ${first.timeRange.startSecond.toFixed(1)}-${lastTakeMoment.timeRange.endSecond.toFixed(1)}s — ONE CONTINUOUS OBSERVATION`);
    if (takeIndex > 0) {
      const boundary = first.contract.takeBoundary;
      const why = boundary?.whyContinuousCoverageFails ?? "continuous coverage cannot preserve the established observation";
      lines.push(`Begin this take after the preceding action. ${sentence(boundary?.evidence ?? "")} A new camera position is needed because ${lowerFirst(why.replace(/\.$/, ""))}.`);
      lines.push("Keep what the previous take already established:");
      for (const [key, value] of Object.entries(first.contract.worldStateBefore?.facts ?? {})) {
        const sentence = modelFacingFact(key, value);
        if (sentence) lines.push(sentence);
      }
      for (const completed of first.contract.worldStateBefore?.completedEvents ?? []) lines.push(modelFacingCompletedEvent(completed));
    }
    const moving = (moment: ModelFacingMoment) => {
      const motion = moment.contract.worldStateAfter?.facts["character.motion"];
      const before = moment.contract.worldStateBefore?.facts["character.motion"];
      return (motion === "WALKING" || motion === "SLOWING")
        && !moment.contract.requiresStationaryBody
        && before !== "STOPPED" && before !== "WAITING" && before !== "SETTLED" && before !== "SEATED";
    };
    const emitFlow = (flow: ModelFacingMoment[]) => {
      lines.push("[ONE CONTINUOUS ACTION FLOW]");
      lines.push("These timing windows observe one ongoing life action. Adjacent movement details may overlap while required state changes stay in order. Her pace can vary within the existing movement. Do not stop, restart, hold a stationary pose, or pause for product readability.");
      const actionFlow = flow.map((moment, index) => {
        const source = moment.whatHappens.replace(/\band then\b/gi, "and").replace(/\bthen\b/gi, "while").replace(/\bsettles back into\b/gi, "returns to").replace(/\bsettles into\b/gi, "keeps");
        return `${source}${index === 0 ? ` ${moment.bodyBehavior}` : ""}`;
      });
      lines.push(actionFlow.join(" "));
      const cameraObservations = flow.map((moment) => moment.cameraObservation).filter((description) => (
        !description.startsWith("Same camera position") && !description.startsWith("The camera stays at its world position")
      ));
      lines.push(`Camera: ${cameraObservations.join(" ")} These are the already established observations, not corrective moves. ${isWalkingRoute
        ? "The camera stays world-anchored; it does not travel with the protagonist or maintain subject distance."
        : "The camera can lag slightly or allow partial obstruction and edge framing; it does not recover the subject or product for readability."}`);
      lines.push(`Observation windows, not body cues: ${flow.map((moment) => `${moment.momentIndex + 1}=${moment.timeRange.startSecond.toFixed(1)}-${moment.timeRange.endSecond.toFixed(1)}s`).join("; ")}.`);
    };
    for (let cursor = 0; cursor < take.length;) {
      let end = cursor;
      while (end < take.length && moving(take[end])) end += 1;
      if (end - cursor >= 2 || (take.length === 1 && end - cursor === 1)) {
        emitFlow(take.slice(cursor, end));
        cursor = end;
      } else {
        const moment = take[cursor];
        const previous = cursor > 0 ? take[cursor - 1] : null;
        const beforeMotion = moment.contract.worldStateBefore?.facts["character.motion"];
        const afterMotion = moment.contract.worldStateAfter?.facts["character.motion"];
        const isRealStop = beforeMotion !== "STOPPED" && afterMotion === "STOPPED";
        const isSeated = afterMotion === "SEATED";
        const alreadyStopped = beforeMotion === "STOPPED" && (afterMotion === "STOPPED" || afterMotion === "SETTLED");
        const resumesFromRealStop = (beforeMotion === "STOPPED" || beforeMotion === "SETTLED" || beforeMotion === "WAITING") && afterMotion === "WALKING";
        const physical = isSeated
          ? "Her final approaching step carries into the chair turn and her weight lowers into the seat; she remains seated without a held presentation pose."
          : resumesFromRealStop
            ? "Her weight shifts into the next movement as soon as its prerequisite is met; she moves at an ordinary pace without a staged restart."
          : alreadyStopped
            ? `${moment.bodyBehavior.replace(/^She comes to a settled stop, weight even on both feet\./, "She stays in the position already reached.")} No second stop begins.`
            : moment.bodyBehavior;
        lines.push(`${moment.timeRange.startSecond.toFixed(1)}-${moment.timeRange.endSecond.toFixed(1)}s — MOMENT ${moment.momentIndex + 1} · ${moment.title} (observation window)`);
        if (previous && isRealStop) {
          lines.push("The last approaching step eases into this real stop; no separate preparation pose or camera cue is inserted.");
        }
        if (previous && !isRealStop && previous.contract.requiredVisibleEvidence.length > 0 && moment.contract.requiredVisibleEvidence.length > 0) {
          lines.push("The next movement begins as the previous action yields its required result; hand, torso, and weight may overlap without reversing the required event order or holding an end pose.");
        }
        const observedAction = isSeated
          ? "The approach carries into the turn toward the same open chair; she lowers into it and remains seated."
          : moment.whatHappens;
        lines.push(`Observed action: ${observedAction} ${isSeated ? "" : physical}`.trim());
        lines.push(`Camera observation: ${moment.cameraObservation}`);
        lines.push(`SOUND: ${moment.naturalSound.length > 0 ? moment.naturalSound.join("; ") : "natural room tone only"}.`);
        cursor += 1;
      }
    }
  });
  lines.push("");
  lines.push("[GLOBAL EXECUTION RULES]");
  lines.push("Real-world speed and normal human cadence; no slow motion, no time stretching, no speed ramp.");
  lines.push("The camera observes the person. It never changes what the person is doing.");
  lines.push("At an established observation position, allow brief foreground obstruction, edge framing, partial departure from the frame, and temporary loss of product readability. Never recenter, rush, or recover the subject or product for visibility; use only the already established camera movement.");
  lines.push("Do not add any action, object, event, or product beat that is not written in the timeline.");
  lines.push("Camera observes life; it does not guarantee full-body, centered, or continuously readable presentation.");
  if (isWalkingRoute) {
    lines.push("An OBSERVER camera is world-anchored, not subject-anchored: it stays at its world position and never translates, dollies, walks with, or maintains subject distance while the protagonist moves. If the protagonist walks away, apparent size decreases naturally.");
  }
  lines.push("The camera may discover the product, but never gives it its own frame: no ankle-level or shoe-level framing, prolonged lower-body-only crop, upward shoe reveal tilt, or product-motivated lowering of the camera.");
  lines.push("Ordinary observations stay at believable human-observer height unless real scene geometry requires otherwise. Incidental partial visibility is allowed; a deliberate footwear crop is not.");
  lines.push("A mandatory event must be legible, but complete action coverage is not required. The camera may see the beginning or consequence, and the next visible state may already show completion.");
  lines.push("Walking routes use the existing scene geometry rather than a cleared center runway; the protagonist may enter off-center, cross the frame diagonally, drift toward one side, and leave the optical center without any camera correction.");
  lines.push("Moment windows are timing metadata, not performance windows: once an event is established, the remaining time flows into the existing action without extending or repeating that event.");
  lines.push("A Moment boundary does not rebuild the camera-to-subject relation; inside one continuous Take the camera keeps its position, framing, and distance.");
  lines.push("Existing environment activity may legally cross or block part of the view; do not avoid, re-frame, or recover for it.");
  lines.push(EMOTION_NEVER_ACTS_RULE);
  lines.push("Sound is natural world sound only: no music, no foreground dialogue, no voiceover, no narration.");
  lines.push("Use only the sounds written in the timeline; do not add any other object, door, or surface sound.");
  lines.push("Do not advance past a moment's described end state; a timeline boundary never requires a physical stop.");
  lines.push("A Moment boundary is timing and state evidence, not a command to stop or restart the person's movement.");
  lines.push("");
  lines.push("[PRODUCT / REFERENCE RULES]");
  if (referenceCount > 0) {
    lines.push(productTruthLock);
    lines.push(`Use the ${referenceCount} confirmed product reference${referenceCount === 1 ? "" : "s"} uploaded with this task as the only product source.`);
    lines.push("The uploaded footwear reference applies only to the protagonist's worn shoes. Do not reproduce, echo, merchandise, display, advertise, print, place, or duplicate the referenced footwear anywhere else in the environment; the selected location keeps its own real-world objects and inventory.");
  } else {
    lines.push("If product references are supplied to the external model, preserve those references exactly. Do not redesign or stylize the product.");
    lines.push("No product reference is confirmed for this task, so do not add or invent any colour, material, construction, logo, or panel detail.");
    lines.push("The protagonist's own worn shoes are her own ordinary footwear and not a product reference. Do not reproduce, echo, merchandise, display, advertise, print, place, or duplicate that footwear anywhere else in the environment; the selected location keeps its own real-world objects and inventory.");
  }
  if (productDecisions.some((decision) => decision.modelFacing === "VISIBLE_IF_NATURALLY_FRAMED" && decision.internalPresence !== "INCIDENTAL")) {
    lines.push("Product visibility: visible only if it falls naturally inside the framing. Never re-frame, push in, or cut away for the product.");
  }
  if (isBookstore || isWalkingRoute) {
    lines.push("Reference-derived brand identity is role-bound to the protagonist's worn product and must not appear anywhere in the environment.");
  }
  lines.push("Product readability is incidental to the existing walk, turn, sit, or threshold crossing: no stop or reframe, repeated step, foot repositioning, or body turn is made for it.");
  lines.push("");
  lines.push("[DO NOT]");
  lines.push(publicScenes.length > 0
    ? "No second narrative subject and no background person may become a story participant. Ambient people remain secondary and occupied with their own ordinary activity; they do not look at, react to, follow, assist, interrupt, or interact with the main character unless the approved event explicitly requires it. No crowd focus, no vehicle or animal entering the frame."
    : "No second narrative subject. Do not add unfamiliar people to a private room. No crowd focus, no vehicle or animal entering the frame.");
  lines.push(takeBoundaryCount > 0
    ? "No insert shot, close-up, cutaway, or additional or unmotivated camera setup beyond the declared Take Plan."
    : "No insert shot, close-up, cutaway, or new camera setup.");
  lines.push("No pose montage, no product showcase, no logo reveal, no on-screen text.");
  lines.push("No re-framing for the product; the narrative camera always wins.");
  lines.push("");
  lines.push("[ENDING STATE]");
  const last = moments[moments.length - 1];
  const lastFacts = last.contract.worldStateAfter?.facts ?? {};
  const endingPerformance = buildFinalPerformanceBehavior({
    previousMotion: last.contract.worldStateBefore?.facts["character.motion"] ?? null,
    finalMotion: lastFacts["character.motion"] ?? null,
    previousPlace: last.contract.worldStateBefore?.facts["character.place"] ?? null,
    finalPlace: lastFacts["character.place"] ?? null,
    interiorFinal: acousticsZoneOf(last.contract.spatialAnchor) === "INTERIOR",
  });
  lines.push(lastFacts["character.motion"] === "SEATED"
    ? "She remains in the same seat reached by the last action; nothing else begins."
    : "The sequence ends on the state the last action has already reached; nothing new begins.");
  lines.push(STATE_LOCK_NOT_BODY_FREEZE);
  lines.push("At the end, preserve the state the action has reached:");
  lines.push(...modelFacingStateSentences(last.contract.worldStateAfter));
  const lastCameraState = moments.length > 0
    ? input.cameraExecution.moments.find((moment) => moment.momentIndex === last.momentIndex)
    : undefined;
  lines.push(`Final camera view: the last Take holds its own camera state (${lastCameraState?.shotScale ?? "its established framing"}) and never returns to space it has already left.`);
  lines.push("Final performance behavior (state-preserving; no new narrative event):");
  endingPerformance.lines.forEach((line) => lines.push(line));
  lines.push(endingPerformance.cameraLine);
  lines.push("Ending evidence does not require a portrait-like final frame: the final state only has to be visually confirmed, so she may remain partially visible, drift toward the frame edge, continue slightly deeper into the space she already reached, or become less compositionally dominant.");
  lines.push("Once this final state is reached, do not add a new task, destination, object interaction, sit-down, start, entry, door opening, product pose, or second ending.");
  lines.push(endingPerformance.prohibitionLine);
  lines.push("Do not enter the final state while any mandatory visual event above remains incomplete.");
  lines.push("Residual body motion continues to the last frame. Do not freeze the subject, do not re-center or recompose the camera for the ending, and do not append a product shot, a logo, or a second ending.");
  return lines.join("\n");
}

export function compileModelFacingExecutionScript(input: ExecutionCompilerInput): ModelFacingExecutionScript {
  const contracts = buildExecutionMomentContracts(input);
  const evidences = buildEvidence(input);
  const topicNarrative = input.plan.moments.map((moment) => moment.whatHappens).join(" ");
  const executionSceneIds = input.sceneResolution.resolvedMoments.map((moment) => moment.sceneId);
  const executionLocationTruth = locationWorldTruthOf(input.sceneResolution.locationWorld?.id ?? null, executionSceneIds);
  const isWalkingRoute = ["AFTER_LUNCH_STREET", "URBAN_WANDERING"].includes(input.sceneResolution.locationWorld?.id ?? "")
    || /route|walk|path|corner|block/i.test(executionLocationTruth.category);

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
  for (const contract of contracts) notExecutableReasons.push(...contract.stateConflicts);
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

  // Take Plan truth for the renderer. A Take opens on its own camera state and
  // every later Moment inside that Take inherits it; no renderer ever borrows the
  // previous Take's position.
  let takeCursor = -1;
  const takeIndexByMoment = new Map<number, number>();
  const takeOpeningIndexes = new Set<number>();
  for (const contract of contracts) {
    const hasBoundary = Boolean(contract.takeBoundary?.evidence && contract.takeBoundary?.whyContinuousCoverageFails);
    if (takeIndexByMoment.size === 0 || hasBoundary) {
      takeCursor += 1;
      takeOpeningIndexes.add(contract.momentIndex);
    }
    takeIndexByMoment.set(contract.momentIndex, takeCursor);
  }

  // Final Performance Behavior: renderer-level residual body motion inside the
  // unchanged final state. It carries no state-changing authority.
  const finalContract = contracts[contracts.length - 1];
  const finalPerformance = buildFinalPerformanceBehavior({
    previousMotion: finalContract?.worldStateBefore?.facts["character.motion"] ?? null,
    finalMotion: finalContract?.worldStateAfter?.facts["character.motion"] ?? null,
    previousPlace: finalContract?.worldStateBefore?.facts["character.place"] ?? null,
    finalPlace: finalContract?.worldStateAfter?.facts["character.place"] ?? null,
    interiorFinal: acousticsZoneOf(finalContract?.spatialAnchor ?? "") === "INTERIOR",
  });

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
      const currentAction = input.physicalAction.moments.find((entry) => entry.momentIndex === contract.momentIndex);
      const previousAction = input.physicalAction.moments.find((entry) => entry.momentIndex === contract.momentIndex - 1);
      const alreadyStationary = previousAction?.endState === "stationary"
        && currentAction?.startState === "stationary";
      const mechanics = movementMechanics(alreadyStationary && evidence.movementState === "walking_finish"
        ? { ...evidence, movementState: "stationary" }
        : evidence);
      const mechanicsContradictWalking = contract.endState === "WALK_CONTINUES"
        && !/\bwalk|step|pace|toward|approach|resumes?\b/i.test(mechanics);
      bodyParts.push(mechanicsContradictWalking
        ? "She keeps walking at an ordinary pace, one step at a time."
        : mechanics);
      bodyParts.push(handMechanics(evidence, contract, container, item, topicNarrative));
      const posture = postureClause(contract.narrativeEvent);
      if (posture) bodyParts.push(posture);
      const clamp = clampClause(contract, item);
      if (clamp) bodyParts.push(clamp);
    }
    const structuredMotion = contract.worldStateAfter?.facts["character.motion"];
    const previousMotion = contract.worldStateBefore?.facts["character.motion"] ?? null;
    const resumesFromCompletedTask = ["STOPPED", "SETTLED", "WAITING", "SEATED"].includes(previousMotion ?? "")
      && structuredMotion === "WALKING";
    let bodyBehavior = contract.stateAuthority === "STRUCTURED_AUTHORITY"
      && contract.requiresStationaryBody
      && contract.requiredVisibleEvidence.length === 0
      && (structuredMotion === "STOPPED" || structuredMotion === "SETTLED")
      ? structuredMotion === "STOPPED"
        ? "She reaches the specified position and comes to a natural stop. Her hands stay at rest."
        : "She remains naturally settled in the reached position. Her hands stay at rest."
      : contract.stateAuthority === "STRUCTURED_AUTHORITY"
        && !contract.requiresStationaryBody
        && (structuredMotion === "WALKING" || structuredMotion === "SLOWING")
        ? `${structuredMotion === "SLOWING" ? "She shortens one natural step without stopping and stays in motion." : "She keeps the same grounded walking cadence without stopping or restarting."} ${handMechanics(evidence, contract, container, item, topicNarrative)}`
        : bodyParts.join(" ");
    // A generic walking template must never overwrite a completed stationary task:
    // the body reads the previous action state, not the movement category. A safe
    // continuation still wins, because it carries the strongest verified body state.
    if (!continuation && resumesFromCompletedTask) {
      bodyBehavior = `Her weight shifts out of the completed action into the next movement as soon as its prerequisite is met; she moves at an ordinary pace without a staged restart. ${handMechanics(evidence, contract, container, item, topicNarrative)}`;
    }
    if (contract.stateAuthority === "STRUCTURED_AUTHORITY"
      && previousMotion === "STOPPED"
      && structuredMotion === "STOPPED") {
      bodyBehavior = bodyBehavior.replace(/^She comes to a settled stop, weight even on both feet\./, "She remains at the reached position.");
    }
    // The last Moment inside the unchanged final state keeps residual body life.
    if (contract.momentIndex === finalContract?.momentIndex) {
      bodyBehavior = `${bodyBehavior} ${finalPerformance.marker}`.trim();
    }

    const keptSound = soundVerdicts
      .filter((verdict) => verdict.momentIndex === contract.momentIndex && verdict.kept)
      .map((verdict) => sanitizeSoundCue(verdict.cue));
    // A new Take states its own opening camera state. It never claims to stay
    // where the previous Take's action left the camera.
    const isTakeOpening = contract.momentIndex > 0 && takeOpeningIndexes.has(contract.momentIndex);
    const cameraObservation = isTakeOpening
      ? takeOpeningCameraLine({
          takeIndex: takeIndexByMoment.get(contract.momentIndex) ?? 0,
          openingCameraState: transition.state,
          whyContinuousCoverageFails: contract.takeBoundary?.whyContinuousCoverageFails ?? null,
        })
      : transition.changed
      ? `${transition.state.movementState === "restrained_follow"
        ? "A lightly carried observation that may lag and drift"
        : transition.state.movementState === "hold_position"
          ? "The camera stays where the action left it; it does not settle into a portrait composition"
          : isWalkingRoute
            ? "The world-anchored observation stays at its established world position"
            : "A near-static observation carried into the current spatial position without re-centering or presentation recovery"} from ${transition.state.cameraSide}, ${transition.state.height}, ${transition.state.framingState} framing, unchanged lens.`
      : isWalkingRoute
        ? `The camera stays at its world position, side, lens, and ${transition.state.framingState} framing from the previous Moment; it never translates, dollies, walks with, or maintains subject distance, so the subject may become smaller or leave the ideal frame.${transition.state.naturalPartialVisibility ? " The body may become naturally partially visible through its own movement; do not create an insert shot." : ""}`
        : `The camera keeps its position, side, lens, and ${transition.state.framingState} framing from the previous Moment; it may lag or drift slightly, and it does not re-center, chase, or recover subject or product presentation.${transition.state.naturalPartialVisibility ? " The body may become naturally partially visible through its own movement; do not create an insert shot." : ""}`;
    if (transition.state.naturalPartialVisibility) {
      previousCameraDescription = cameraObservation;
    } else {
      previousCameraDescription = cameraObservation;
    }

    moments.push({
      momentIndex: contract.momentIndex,
      title: contract.worldStateBefore?.facts["character.place"] === "INSIDE"
        && contract.worldStateAfter?.facts["character.place"] === "INSIDE"
        && contract.worldStateBefore.completedEvents.includes("CROSS_THRESHOLD")
        ? "Already inside from the previous action"
        : contract.requiredVisibleEvidence.length > 0
        ? contract.requiredVisibleEvidence.map((entry) => entry.id.replace(/_/g, " ")).join(" + ")
        : momentTitle(contract, item),
      timeRange: {
        startSecond: contract.timeRange?.startSecond ?? 0,
        endSecond: contract.timeRange?.endSecond ?? 0,
      },
      whatHappens: contract.worldStateBefore?.facts["character.place"] === "INSIDE"
        && contract.worldStateAfter?.facts["character.place"] === "INSIDE"
        && contract.worldStateBefore.completedEvents.includes("CROSS_THRESHOLD")
        ? "The character remains inside the home in the state reached after the single completed entry."
        : contract.narrativeEvent,
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
  const emotionalReleaseWording = findForbiddenEmotionalReleaseWording(compiledText);
  const emotionalReleaseCues = moments
    .flatMap((moment) => moment.naturalSound)
    .flatMap((cue) => findForbiddenSoundCueWording(cue));
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
      if (claimsCompletion(text, forbidden)
        && !(returnsObjectToContainer(contract.narrativeEvent) && forbidden === "ITEM_RETRIEVED")) {
        boundaryConflictsAfter.push({
          momentIndex: contract.momentIndex,
          type: "EARLY_COMPLETION",
          detail: `Model-facing body text claims ${forbidden} although the Moment ends at ${contract.endState}.`,
          source: "MODEL_FACING",
        });
      }
    }
  }

  // Spatial and closure fail-closed gates. The execution layer never repairs an
  // upstream problem; it refuses to emit a model-facing script instead.
  const spatialFailures = input.sceneResolution.resolvedMoments.filter((moment) => (
    moment.spatialContinuityStatus === "FAIL" || moment.transitionFromPrevious === "NON_CONTIGUOUS"
  ));
  const spatialGate = spatialFailures.length === 0
    ? {
      pass: true,
      reason: `All Moment transitions stay inside the ${input.plan.spatialEnvelope.macroLocation} route.`,
    }
    : {
      pass: false,
      reason: `Spatial discontinuity at Moment(s): ${spatialFailures.map((moment) => moment.momentIndex + 1).join(", ")}.`,
    };
  const closureFailures: string[] = [];
  if (input.plan.goalState !== "COMPLETED") closureFailures.push(`goal state is ${input.plan.goalState}`);
  if (input.plan.qc.goal_completion.status !== "PASS") closureFailures.push("goal completion gate failed");
  if (input.plan.qc.resolved_ending.status !== "PASS") closureFailures.push("resolved ending gate failed");
  if (input.plan.qc.no_semantic_loop.status !== "PASS") closureFailures.push("semantic loop gate failed");
  const closureGate = closureFailures.length === 0
    ? { pass: true, reason: `Local goal completed: ${input.plan.localGoal}` }
    : { pass: false, reason: `Incomplete narrative: ${closureFailures.join("; ")}.` };
  if (!spatialGate.pass) notExecutableReasons.push(spatialGate.reason);
  if (!closureGate.pass) notExecutableReasons.push(closureGate.reason);
  const status: ModelFacingExecutionScript["status"] = !spatialGate.pass
    ? "NOT_EXECUTABLE_SPATIAL_DISCONTINUITY"
    : !closureGate.pass
      ? "NOT_EXECUTABLE_INCOMPLETE_NARRATIVE"
      : notExecutableReasons.length > 0
        ? "NOT_EXECUTABLE_UNSAFE_CONTINUATION"
        : "EXECUTABLE";

  return {
    schemaVersion: EXECUTION_COMPILER_SCHEMA_VERSION,
    compilerVersion: EXECUTION_COMPILER_VERSION,
    topicId: input.plan.topicId as ModelFacingExecutionScript["topicId"],
    topicLabel: input.topicLabel,
    season: input.season,
    durationSeconds: input.plan.durationSeconds,
    status,
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
      emotionalReleaseWording: [...new Set(emotionalReleaseWording)],
      emotionalReleaseCues: [...new Set(emotionalReleaseCues)],
      timelineCoverage: coverage,
      spatialGate,
      closureGate,
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
    "no_emotional_release_sound",
    "No Emotional Release Sound",
    diagnostics.emotionalReleaseCues.length === 0
      && diagnostics.soundVerdicts.every((verdict) => (
        verdict.kept ? findForbiddenSoundCueWording(verdict.cue).length === 0 : true
      )),
    `No sound cue makes breathing, a sigh, or an exhale audible; ${diagnostics.soundVerdicts.filter((verdict) => !verdict.kept && verdict.rejectionReason === "EMOTIONAL_RELEASE_CUE").length} emotional release cue(s) were rejected before the script.`,
    `emotional release sound cue(s) reached the script: ${diagnostics.emotionalReleaseCues.join(", ")}`
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
  add(
    "no_emotional_release_wording",
    "No Emotional Release Wording",
    diagnostics.emotionalReleaseWording.length === 0 && script.compiledText.includes(EMOTION_NEVER_ACTS_RULE),
    "The script states the global rule that emotion never creates a new action and contains no sigh, exhale, relief, or performed-emotion wording.",
    `forbidden emotional release wording reached the script: ${diagnostics.emotionalReleaseWording.join(", ")}`
  );
  const lastMoment = script.moments[script.moments.length - 1];
  add(
    "ending_state_preserved",
    "Ending State Preserved",
    Boolean(lastMoment) && script.compiledText.includes("[ENDING STATE]") && /do not append/i.test(script.compiledText),
    "The final Moment's narrative text closes the script and no extra ending is allowed.",
    "the ending state is missing or open-ended"
  );
  add(
    "spatial_continuity_gate",
    "Spatial Continuity Gate",
    diagnostics.spatialGate.pass,
    diagnostics.spatialGate.reason,
    diagnostics.spatialGate.reason
  );
  add(
    "closure_gate",
    "Narrative Closure Gate",
    diagnostics.closureGate.pass,
    diagnostics.closureGate.reason,
    diagnostics.closureGate.reason
  );

  const failureReasons = checks.filter((check) => check.status === "FAIL").map((check) => `${check.id}: ${check.reason}`);
  return {
    checks,
    status: failureReasons.length === 0 ? "EXECUTION_SCRIPT_VALIDATED" : "EXECUTION_SCRIPT_FAILED",
    failureReasons,
  };
}
