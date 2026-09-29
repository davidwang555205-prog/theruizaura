import type { ImmersiveReferenceMapping } from "../seedance-compiler";
import type { NarrativePlan } from "../types";
import type { SceneResolverOutput } from "../scene-resolver";
import type { CameraExecutionPlan } from "../camera-execution";
import type { ModelFacingExecutionScript } from "../execution-compiler/types";
import type { ImmersiveFinalScriptPresentation } from "../presentation/types";
import { BOUNDARY_NOTE } from "../presentation/catalogs";
import { MODEL_FACING_STATE_FACTS, modelFacingFact, modelFacingStateSentences } from "./facts";
import { FINAL_EXTERIOR_PLACES as EXTERIOR_PLACES, STATE_LOCK_NOT_BODY_FREEZE } from "./natural-continuation";
import {
  acousticsZoneOf,
  buildImmersiveTakeTruth,
  humanReadableRoute,
  spatialAnchorLabel,
  type AcousticsZone,
} from "./truth";

export const IMMERSIVE_FINAL_CONSISTENCY_CATEGORIES = [
  "take_director_conflict",
  "take_negative_conflict",
  "camera_state_conflict",
  "ending_state_conflict",
  "ending_viewability_conflict",
  "final_body_freeze_risk",
  "final_recenter_risk",
  "final_new_action_risk",
  "final_state_mutation",
  "emotional_semantic_leak",
  "sigh_execution_risk",
  "visible_exhale_risk",
  "emotional_gesture_risk",
  "product_reference_conflict",
  "body_action_conflict",
  "sound_space_conflict",
  "single_use_replay",
  "legacy_wording_leak",
  "route_rendering_conflict",
  "director_seedance_truth_conflict",
] as const;

export type ImmersiveFinalConsistencyCategory = typeof IMMERSIVE_FINAL_CONSISTENCY_CATEGORIES[number];

export type ImmersiveFinalConsistencyCheck = {
  id: string;
  label: string;
  category: ImmersiveFinalConsistencyCategory;
  status: "PASS" | "FAIL";
  detail: string;
};

export type ImmersiveFinalConsistencyInput = {
  topicLabel: string;
  plan: NarrativePlan;
  sceneResolution: SceneResolverOutput;
  cameraExecution: CameraExecutionPlan;
  modelFacingScript: ModelFacingExecutionScript;
  presentation: ImmersiveFinalScriptPresentation;
  referenceMapping: ImmersiveReferenceMapping;
  internalSeedanceText: string;
};

export type ImmersiveFinalConsistencyValidation = {
  status: "IMMERSIVE_FINAL_CONSISTENCY_VALIDATED" | "IMMERSIVE_FINAL_CONSISTENCY_FAILED";
  checks: ImmersiveFinalConsistencyCheck[];
  categoryFailures: Record<ImmersiveFinalConsistencyCategory, number>;
  failureReasons: string[];
};

const MULTI_TAKE_BANNED_CONCEPT = [
  /\bnever cuts?\b/i,
  /\bno cut\b/i,
  /\bnever (?:re-?framed|re-?frames|changes? position|moves? position)\b/i,
  /\bone setup for the (?:entire|whole)\b/i,
  /\bcamera (?:is placed once|never changes|never moves)\b/i,
  /\brest of the (?:film|slice) (?:in|uses) one setup\b/i,
];

const DEVICE_VARIANTS = /across|carried|principle|continues into|holds through/i;

const EXTERIOR_CUE_TOKENS = [
  "apartment hallway room tone",
  "open residential street air",
  "distant city ambience",
  "distant street ambience",
  "building entrance room tone",
  "street outside the bookshop",
  // Exterior surface vocabulary: an inside Moment never stands on the street.
  "on stone",
  "on pavement",
  "outdoor ground",
];

const INTERIOR_CUE_TOKENS = [
  "home interior room tone",
  "interior room tone",
  "interior floor",
  "bookstore room tone",
  "cafe room tone",
  "neighborhood-shop room tone",
];


const ENTRY_EVENTS = ["CROSS_THRESHOLD", "ENTER_CAFE", "ENTER_STORE", "ARRIVE", "TAKE_SEAT", "OPEN_AND_EXIT"];

// A cue may name another space only when it explicitly frames that space as
// residual, transition, or off-screen — never as the dominant foreground world.
const RESIDUAL_ALLOWANCE = /residual|behind|beyond|faint|through the door|distant|giving way|opening out|across the doorway|crossing the doorway|off-screen|outside the final framing|never shown/i;

function positiveClauses(text: string) {
  return text
    .split(/\.\s+|;\s+|\n+/)
    .map((clause) => clause.trim())
    .filter((clause) => clause.length > 0 && !/\bno\b|\bnot\b|\bnever\b|\bwithout\b|\bdo not\b|\bdoes not\b|\bdon't\b/i.test(clause));
}

function assertNegates(text: string, pattern: RegExp) {
  return positiveClauses(text).some((clause) => pattern.test(clause));
}

function blockLines(text: string, header: string) {
  const start = text.indexOf(`[${header}]`);
  if (start === -1) return [] as string[];
  const rest = text.slice(start + header.length + 2);
  const next = rest.search(/\n\[[A-Z][^\]]*\]/);
  const body = next === -1 ? rest : rest.slice(0, next);
  return body.split("\n").map((line) => line.trim()).filter(Boolean);
}

type EndsAtContext = {
  facts: Record<string, string>;
  completed: string[];
  newEvents: string[];
};

const ENDS_AT_PREDICATES: Record<string, (context: EndsAtContext) => boolean> = {
  // "Still on the way" forbids a settled or completed arrival, not every pause.
  // Entering a space while the walk honestly continues is not a contradiction.
  WALK_CONTINUES: ({ facts, newEvents }) => !["SETTLED", "SEATED"].includes(facts["character.motion"] ?? "")
    && !newEvents.includes("ARRIVE"),
  SEARCH_STARTED: ({ facts }) => facts["key.visibility"] !== "VISIBLE",
  SEARCH_CONTINUES: ({ facts }) => facts["key.visibility"] !== "VISIBLE",
  REACH_STARTED: ({ facts }) => facts["key.visibility"] !== "VISIBLE",
  OBJECT_HANDLING: ({ facts }) => facts["character.motion"] !== undefined,
  ITEM_RETRIEVED: ({ facts, completed }) => completed.includes("FIND_KEY") || facts["key.containment"] === "NONE" || facts["item.state"] === "SECURE",
  DOOR_HANDLED: ({ facts, completed }) => completed.includes("UNLOCK_DOOR") || facts["door.lock"] === "UNLOCKED" || facts["door.state"] === "OPEN",
  ENTERED: ({ facts, newEvents, completed }) => newEvents.some((event) => ENTRY_EVENTS.includes(event))
    || completed.some((event) => ["CROSS_THRESHOLD", "ENTER_CAFE", "ENTER_STORE"].includes(event))
    || !EXTERIOR_PLACES.includes(facts["character.place"] ?? ""),
  // The narrative's "settled" is the small process being resolved; the body may
  // honestly keep walking. What it forbids is an unresolved Moment.
  SETTLED: ({ completed }) => completed.length > 0,
  STATE_HELD: () => true,
};

// One centralized gate over the finished Director Script and the finished
// Seedance execution prompt. It reads the same structured truth the renderers
// read; it never re-plans and never repairs.
export function validateImmersiveFinalScriptConsistency(
  input: ImmersiveFinalConsistencyInput
): ImmersiveFinalConsistencyValidation {
  const checks: ImmersiveFinalConsistencyCheck[] = [];
  const add = (
    id: string,
    category: ImmersiveFinalConsistencyCategory,
    label: string,
    passed: boolean,
    detail: string
  ) => {
    checks.push({ id, category, label, status: passed ? "PASS" : "FAIL", detail });
  };

  const director = input.presentation.directorScript;
  const directorText = input.presentation.presentationScript;
  const executionText = input.modelFacingScript.compiledText;
  const internalText = input.internalSeedanceText;
  const contractsByMoment = new Map(input.modelFacingScript.contracts.map((contract) => [contract.momentIndex, contract]));
  const takes = buildImmersiveTakeTruth(input.modelFacingScript);
  const boundaryIndexes = input.modelFacingScript.contracts
    .filter((contract) => contract.momentIndex > 0 && contract.takeBoundary?.evidence && contract.takeBoundary?.whyContinuousCoverageFails)
    .map((contract) => contract.momentIndex);
  const takeCount = director.takes.length;
  const finalContract = input.modelFacingScript.contracts[input.modelFacingScript.contracts.length - 1];
  const finalFacts = finalContract?.worldStateAfter?.facts ?? {};
  const finalCompleted = finalContract?.worldStateAfter?.completedEvents ?? [];
  const finalTake = takes[takes.length - 1];
  const finalZone: AcousticsZone = finalTake?.acousticsZone ?? "UNKNOWN";
  const executionTakeHeaders = [...executionText.matchAll(/^TAKE (\d+) — (.+)$/gm)];

  // 1. Take count matches every renderer.
  add(
    "IMMERSIVE_TAKE_COUNT_AUTHORITY",
    "take_director_conflict",
    "Take count matches the Take Plan and the execution prompt",
    takeCount === boundaryIndexes.length + 1
      && takeCount === takes.length
      && executionTakeHeaders.length === takeCount
      && director.format.includes(`${takeCount} take`),
    `${takeCount} take(s) in the director script, ${executionTakeHeaders.length} TAKE header(s) in the execution prompt, ${boundaryIndexes.length} motivated boundary/boundaries in the Take Plan.`
  );

  // 2. Director Concept is compatible with the Take Plan.
  const conceptText = `${director.directorConcept} ${director.cinematicDevice}`;
  // Clauses that already scope themselves to the approved Take Plan may say
  // "inside a Take"; only unscoped no-cut claims conflict with a multi-Take plan.
  const unscopedConcept = conceptText
    .split(/[.;]/)
    .filter((clause) => !/inside a Take|Take Plan|approved (?:camera|spatial|photographic)|already approved/i.test(clause))
    .join(" ");
  const bannedConceptHits = takeCount > 1 ? MULTI_TAKE_BANNED_CONCEPT.filter((pattern) => pattern.test(unscopedConcept)) : [];
  const conceptDeclaresBoundary = takeCount === 1
    ? !/\bapproved camera boundary\b|\bdeclared Take Plan\b|\bapproved (?:spatial|photographic) boundary\b/i.test(conceptText)
    : /\bapproved camera boundary\b|\bdeclared Take Plan\b|\bapproved (?:spatial|photographic) boundary\b|\bmotivated (?:spatial|photographic) boundary\b/i.test(conceptText);
  add(
    "IMMERSIVE_DIRECTOR_CONCEPT_TAKE_COMPATIBLE",
    "take_director_conflict",
    "Director Concept reads the actual Take Plan",
    bannedConceptHits.length === 0 && conceptDeclaresBoundary,
    bannedConceptHits.length > 0
      ? `Director Concept contradicts a ${takeCount}-take plan via ${bannedConceptHits.map((pattern) => pattern.source).join(", ")}.`
      : takeCount > 1
        ? "The concept admits the single approved camera boundary and adds no other cut."
        : "The concept describes one uninterrupted observation and claims no additional boundary."
  );

  // 3. Cinematic device stays compatible with the Take Plan.
  const deviceIsSingleFrameClaim = /\bone (?:waiting|fixed|single) frame\b/i.test(director.cinematicDevice);
  add(
    "IMMERSIVE_CINEMATIC_DEVICE_TAKE_COMPATIBLE",
    "take_director_conflict",
    "Cinematic device survives a multi-Take plan",
    takeCount === 1 || !deviceIsSingleFrameClaim || DEVICE_VARIANTS.test(director.cinematicDevice),
    takeCount === 1
      ? "Single-Take device wording is allowed to stay literal."
      : "Multi-Take device wording is carried as an observation principle, not as one absolute frame."
  );

  // 4. Global negatives cannot negate an approved Take boundary.
  const negativeLines = [...director.global.negatives, ...blockLines(executionText, "DO NOT")];
  const cameraSetupNegatives = negativeLines.filter((line) => /\bnew camera setup\b|\badditional camera setup\b|\bnew setup\b/i.test(line));
  const bareCameraSetupNegatives = cameraSetupNegatives.filter((line) => !/\badditional\b|\bunmotivated\b|\bbeyond\b|Take Plan/i.test(line));
  const takeAwareNegativePresent = negativeLines.some((line) => /beyond the declared Take Plan|additional or unmotivated|not approved by the Take Plan|unless the Take Plan/i.test(line));
  add(
    "IMMERSIVE_GLOBAL_NEGATIVES_TAKE_AWARE",
    "take_negative_conflict",
    "Global negatives are Take-aware",
    takeCount === 1 ? cameraSetupNegatives.length > 0 : bareCameraSetupNegatives.length === 0 && takeAwareNegativePresent,
    takeCount === 1
      ? `${cameraSetupNegatives.length} plain camera-setup prohibition(s) for a single-Take plan.`
      : `${bareCameraSetupNegatives.length} blanket camera-setup prohibition(s); Take-aware allowance present: ${takeAwareNegativePresent}.`
  );

  // 5. NEW_TAKE_CAMERA_STATE_INHERITANCE_CONFLICT
  const newTakeCameraConflicts: string[] = [];
  for (const take of director.takes) {
    if (take.takeIndex === 0) continue;
    const openingMoment = take.moments[0];
    if (!openingMoment) {
      newTakeCameraConflicts.push(`TAKE ${take.takeIndex + 1} has no opening Moment`);
      continue;
    }
    if (!/\bopens on its own approved camera state\b/i.test(openingMoment.camera)) {
      newTakeCameraConflicts.push(`TAKE ${take.takeIndex + 1} opening Moment does not establish its own camera state`);
    }
    if (/\bstays where the action left it\b|\bfrom the previous Moment\b/i.test(openingMoment.camera)) {
      newTakeCameraConflicts.push(`TAKE ${take.takeIndex + 1} opening Moment inherits the previous Take's camera`);
    }
    if (!take.openingCameraState) newTakeCameraConflicts.push(`TAKE ${take.takeIndex + 1} exposes no opening camera state`);
  }
  for (const take of director.takes) {
    take.moments.slice(1).forEach((moment) => {
      if (/\bnew (?:camera )?(?:setup|position|origin)\b/i.test(moment.camera)) {
        newTakeCameraConflicts.push(`TAKE ${take.takeIndex + 1} MOMENT ${moment.momentIndex + 1} invents a new camera origin inside the Take`);
      }
    });
  }
  add(
    "NEW_TAKE_CAMERA_STATE_INHERITANCE_CONFLICT",
    "camera_state_conflict",
    "New Take inherits the correct camera state",
    newTakeCameraConflicts.length === 0,
    newTakeCameraConflicts.length === 0
      ? "Every Take after the first opens on its own approved camera state and every later Moment inherits it."
      : newTakeCameraConflicts.join(" | ")
  );

  // 6. Ending is derived from the final structured state.
  const finalPlaceSentence = modelFacingFact("character.place", finalFacts["character.place"] ?? "");
  const finalMotionSentence = modelFacingFact("character.motion", finalFacts["character.motion"] ?? "");
  const finalDoorSentence = modelFacingFact("door.state", finalFacts["door.state"] ?? "");
  const missingStateSentences = [finalPlaceSentence, finalMotionSentence, finalDoorSentence]
    .filter((sentence): sentence is string => Boolean(sentence))
    .filter((sentence) => !director.ending.includes(sentence));
  const endingAddsAction = assertNegates(
    director.ending,
    /\b(?:unlocks? the (?:door|lock)|opens? the door|takes? the key|steps? inside|steps? through|walks? back|re-?enters?)\b/i
  );
  add(
    "IMMERSIVE_ENDING_STATE_DERIVED",
    "ending_state_conflict",
    "Ending comes from the final state",
    missingStateSentences.length === 0 && !endingAddsAction,
    missingStateSentences.length > 0
      ? `Ending omits the final structured state: ${missingStateSentences.join(" | ")}`
      : endingAddsAction
        ? "Ending introduces a new action instead of holding the reached state."
        : "Ending restates the reached structured state and adds no new action."
  );

  // 7. ENDING_NOT_VISIBLE_FROM_FINAL_CAMERA
  const finalCameraMoment = input.modelFacingScript.moments[input.modelFacingScript.moments.length - 1];
  const finalCameraState = input.modelFacingScript.diagnostics.cameraTransitions.find((transition) => transition.momentIndex === finalCameraMoment?.momentIndex)?.state;
  const endingSentences = director.ending.split(/(?<=\.)\s+/);
  const offScreenViolations: string[] = [];
  for (const take of takes) {
    if (take.takeIndex === finalTake?.takeIndex) continue;
    const labels = new Set<string>([
      spatialAnchorLabel(take.location),
      ...take.moments.map((moment) => spatialAnchorLabel(moment.contract.spatialAnchor)),
    ]);
    for (const label of labels) {
      const sentence = endingSentences.find((entry) => entry.includes(label));
      if (sentence && !RESIDUAL_ALLOWANCE.test(sentence)) {
        offScreenViolations.push(`${label} is claimed as the final visible image`);
      }
    }
  }
  const endingNamesFinalCamera = Boolean(finalCameraState)
    && (director.ending.includes(finalCameraState!.framingState) || /final frame|camera holds|camera finishes/i.test(director.ending));
  add(
    "ENDING_NOT_VISIBLE_FROM_FINAL_CAMERA",
    "ending_viewability_conflict",
    "Ending describes only what the final camera can see",
    offScreenViolations.length === 0 && endingNamesFinalCamera,
    offScreenViolations.length > 0
      ? offScreenViolations.join(" | ")
      : endingNamesFinalCamera
        ? "Every earlier location in the ending is marked as off-screen continuation."
        : "The ending never names the final camera state."
  );

  // 8. Moment Ends-at matches the structured after-state.
  const endsAtConflicts: string[] = [];
  for (const take of director.takes) {
    for (const moment of take.moments) {
      const contract = contractsByMoment.get(moment.momentIndex);
      const planMoment = input.plan.moments.find((entry) => entry.index === moment.momentIndex);
      if (!contract || !planMoment) {
        endsAtConflicts.push(`MOMENT ${moment.momentIndex + 1} has no contract or plan record`);
        continue;
      }
      const boundary = planMoment.completionBoundary;
      const expectedNote = BOUNDARY_NOTE[boundary];
      if (moment.boundary !== boundary || moment.boundaryNote !== expectedNote) {
        endsAtConflicts.push(`MOMENT ${moment.momentIndex + 1} Ends at does not match its narrative boundary ${boundary}`);
      }
      const predicate = ENDS_AT_PREDICATES[boundary];
      const snapshot = contract.worldStateAfter ?? { facts: {}, completedEvents: [] };
      const beforeEvents = contract.worldStateBefore?.completedEvents ?? [];
      const context: EndsAtContext = {
        facts: snapshot.facts ?? {},
        completed: snapshot.completedEvents ?? [],
        newEvents: (snapshot.completedEvents ?? []).filter((event) => !beforeEvents.includes(event)),
      };
      if (predicate && !predicate(context)) {
        endsAtConflicts.push(`MOMENT ${moment.momentIndex + 1} Ends at ${boundary} contradicts its after-state`);
      }
    }
  }
  add(
    "IMMERSIVE_MOMENT_END_STATE_MATCHES_AFTER_STATE",
    "ending_state_conflict",
    "Every Ends-at equals the structured after-state",
    endsAtConflicts.length === 0,
    endsAtConflicts.length === 0
      ? `All ${director.takes.flatMap((take) => take.moments).length} Moments end on their own structured after-state.`
      : endsAtConflicts.join(" | ")
  );

  // 9. Final-state natural continuation: state lock is not body freeze.
  const finalPresentationMoment = director.takes[director.takes.length - 1]?.moments.slice(-1)[0];
  const endingBlock = blockLines(executionText, "ENDING STATE").join(" ");
  const finalScope = `${finalPresentationMoment?.body ?? ""} ${finalPresentationMoment?.camera ?? ""} ${director.ending} ${endingBlock}`;
  const FREEZE_TOKENS = [
    /\bremains?\b/i,
    /\bsettled\b/i,
    /\bholds?\b/i,
    /\bstill\b/i,
    /\bstays?\b/i,
    /\bfreeze\b|\bfrozen\b/i,
    /\bdo not move\b/i,
    /\bnothing new begins\b/i,
  ];
  const freezeHits = FREEZE_TOKENS.filter((pattern) => pattern.test(finalScope)).length;
  const continuationMarkers = /residual|weight redistribution|weight shift|momentum decays|posture settling|settles through the feet|no held pose|ordinary micro-motion|garment movement settles|neutral rest|continues naturally|decaying naturally|does not require a stop|state lock is not body freeze/i;
  const hasContinuationAllowance = continuationMarkers.test(finalScope) && finalScope.includes(STATE_LOCK_NOT_BODY_FREEZE);
  add(
    "FINAL_STATE_BODY_FREEZE_RISK",
    "final_body_freeze_risk",
    "Final state does not freeze the body",
    freezeHits < 3 || hasContinuationAllowance,
    hasContinuationAllowance
      ? `The final state stays locked while ${freezeHits} static token(s) are balanced by an explicit natural continuation allowance.`
      : `${freezeHits} static tokens stack in the final Moment and ending with no natural continuation allowance.`
  );

  // 10. Final camera must not recentre or build a portrait for the ending.
  const positiveRecenter = positiveClauses(`${finalPresentationMoment?.camera ?? ""} ${director.ending} ${endingBlock}`)
    .some((clause) => /\bre-?center|centre the subject|center the subject|portrait composition|recover the full body|recover the face\b/i.test(clause));
  const declaresNoRecenter = /does not recenter|does not re-center|do not re-center|do not recenter|no portrait-like final frame|does not recompose a portrait|recompose a portrait for the ending/i.test(finalScope);
  add(
    "FINAL_RECENTER_RISK",
    "final_recenter_risk",
    "Final camera never recentres for the ending",
    !positiveRecenter && declaresNoRecenter,
    positiveRecenter
      ? "The ending asks the camera to recentre, recover the full body, or build a portrait composition."
      : declaresNoRecenter
        ? "The final Take keeps its own observation and the ending explicitly refuses recentring and portrait recomposition."
        : "The ending never states that the camera refuses to recentre."
  );

  // 11. Natural continuation may never become a second narrative beat.
  const bannedFinalAction = /\b(?:new destination|new room|second task|new task|picks? up|puts? (?:it|the object|the key) down|closes? the door|locks? the door|unlocks? the door|opens? the door again|sits? down|sits? again|turns? back|looks? (?:at|to) (?:the )?camera|product pose|sighs?|exhales?|smiles?|checks? (?:the )?(?:phone|pocket)|touch(?:es)? (?:her )?hair)\b/i;
  const newActionViolations = positiveClauses(finalScope)
    .filter((clause) => bannedFinalAction.test(clause));
  add(
    "FINAL_NEW_ACTION_RISK",
    "final_new_action_risk",
    "Residual motion adds no new narrative action",
    newActionViolations.length === 0,
    newActionViolations.length === 0
      ? "The ending adds no new destination, task, object interaction, doorway/key replay, sit-down, or performed emotion."
      : newActionViolations.join(" | ")
  );

  // 12. The final structured state must survive the renderer unchanged.
  const finalStateSentences = modelFacingStateSentences(finalContract?.worldStateAfter ?? null);
  const stateMissingFromExecution = finalStateSentences.filter((sentence) => !endingBlock.includes(sentence));
  const MUTATION_CONTRADICTIONS: Array<{ applies: boolean; pattern: RegExp; detail: string }> = [
    { applies: finalFacts["door.state"] === "OPEN", pattern: /\b(?:door|it) (?:is|remains|stays) closed\b/i, detail: "claims the already open door is closed" },
    { applies: finalFacts["door.lock"] === "UNLOCKED", pattern: /\bdoor (?:is|remains|stays) locked\b/i, detail: "claims the already unlocked door is locked" },
    { applies: ["INSIDE", "HOME_INTERIOR", "ENTRYWAY"].includes(finalFacts["character.place"] ?? ""), pattern: /\b(?:steps?|walks?|moves?|goes?) (?:back )?(?:outside|out of the (?:home|room|store))\b/i, detail: "moves the character back out of the reached destination" },
    { applies: finalFacts["key.location"] === "HAND", pattern: /\b(?:puts?|places?|slips?|returns?) the key\b/i, detail: "re-writes the held key state" },
    { applies: ["SETTLED", "SEATED"].includes(finalFacts["character.motion"] ?? ""), pattern: /\b(?:starts?|begins?) (?:walking|to walk) again\b/i, detail: "re-starts the movement the final state already settled" },
  ];
  const mutationViolations = MUTATION_CONTRADICTIONS
    .filter((entry) => entry.applies && assertNegates(finalScope, entry.pattern))
    .map((entry) => entry.detail);
  add(
    "FINAL_STATE_MUTATION",
    "final_state_mutation",
    "Final structured state is unchanged by the renderer",
    mutationViolations.length === 0 && stateMissingFromExecution.length === 0,
    mutationViolations.length > 0
      ? mutationViolations.join(" | ")
      : stateMissingFromExecution.length > 0
        ? `The execution ending omits ${stateMissingFromExecution.length} final state sentence(s).`
        : `All ${finalStateSentences.length} final state sentence(s) survive unchanged and nothing contradicts them.`
  );

  // 13. EMOTIONAL SEMANTIC LEAK. Editorial tone may stay; the execution semantic
  // that drives the body may not carry emotional-performance vocabulary.
  const executionSemanticScope = [
    ...director.takes.flatMap((take) => take.moments.map((moment) => (
      `${moment.whatHappens} ${moment.body} ${moment.camera} ${moment.sound.join("; ")} ${moment.productLine ?? ""}`
    ))),
    director.ending,
    director.global.negatives.join(" "),
    director.global.visualLook.join(" "),
    executionText,
  ].join("\n");
  const SEMANTIC_LEAK_PATTERNS: Array<{ id: string; pattern: RegExp }> = [
    { id: "relaxation", pattern: /\brelax(?:ed|es|ing|ation)?\b/i },
    { id: "relief", pattern: /\brelie(?:f|ved|ve)\b/i },
    { id: "unwind", pattern: /\bunwind(?:ing|s)?\b/i },
    { id: "decompress", pattern: /\bdecompress(?:ing|es|ion)?\b/i },
    { id: "soften", pattern: /\bsoften(?:s|ed|ing)?\b|\bsoftening\b/i },
    { id: "less_held", pattern: /\bless held\b/i },
    { id: "comfort_state", pattern: /\bsettle into comfort\b|\bcomfortable state\b/i },
    { id: "emotional_release", pattern: /\bemotional release\b/i },
  ];
  const semanticLeakHits = SEMANTIC_LEAK_PATTERNS
    .filter((entry) => entry.pattern.test(executionSemanticScope))
    .map((entry) => entry.id);
  add(
    "EMOTIONAL_SEMANTIC_LEAK",
    "emotional_semantic_leak",
    "Execution semantics carry no emotional-performance vocabulary",
    semanticLeakHits.length === 0,
    semanticLeakHits.length === 0
      ? "The execution semantic keeps spatial, timing, and kinematic vocabulary only; no relaxation, relief, softening, or comfort-as-state wording remains."
      : `execution-level emotional vocabulary survived: ${semanticLeakHits.join(", ")}`
  );

  // 14. Sigh execution risk: any breath-family wording in execution scope.
  const sighHits = executionSemanticScope.match(/\bsigh(?:s|ed|ing)?\b|\bbreath(?:e|es|ing|s)?\b|\bbreath(?:ed|ing)\b/gi) ?? [];
  add(
    "SIGH_EXECUTION_RISK",
    "sigh_execution_risk",
    "No sigh or breath execution wording exists to prime one",
    sighHits.length === 0,
    sighHits.length === 0
      ? "No sigh or breath-family wording appears anywhere in the execution semantics."
      : `breath-family wording reached execution semantics: ${[...new Set(sighHits)].join(", ")}`
  );

  // 15. Visible exhale risk.
  const exhaleHits = executionSemanticScope.match(/\bexhal(?:e|es|ed|ing|ation)\b|\bdeep\s+breath\b|\blets?\s+out\s+a\s+breath\b|\bbreathes?\s+out\b/gi) ?? [];
  add(
    "VISIBLE_EXHALE_RISK",
    "visible_exhale_risk",
    "No visible exhale execution wording exists",
    exhaleHits.length === 0,
    exhaleHits.length === 0
      ? "No exhale, deep-breath, or breathing-out wording appears in the execution semantics."
      : `visible exhale wording reached execution semantics: ${[...new Set(exhaleHits)].join(", ")}`
  );

  // 16. Emotional gesture risk: performed gesture vocabulary only.
  const gestureHits = positiveClauses(executionSemanticScope)
    .flatMap((clause) => clause.match(/\bshoulders?\s+(?:drop|relax|release|sink)\w*|\bsmiles?\b|\beyes?\s+clos\w+|\bself-?soothing\b|\brelief\s+gesture\b|\bperformed\s+(?:gesture|emotion|relief)\b/gi) ?? []);
  add(
    "EMOTIONAL_GESTURE_RISK",
    "emotional_gesture_risk",
    "No performed emotional gesture is requested",
    gestureHits.length === 0,
    gestureHits.length === 0
      ? "No shoulder drop, smile, closed eyes, self-soothing, or relief gesture is requested anywhere in the execution semantics."
      : `emotional gesture wording reached execution semantics: ${[...new Set(gestureHits)].join(", ")}`
  );

  // 17. PRODUCT_REFERENCE_TRUTH_CONTRADICTION
  const referenceCount = input.referenceMapping.confirmedReferenceCount;
  const zeroReferenceClaim = /No product reference is confirmed/i;
  const confirmedReferenceClaim = /The uploaded footwear reference applies only to the protagonist's worn shoes/i;
  const texts = [directorText, executionText, internalText];
  const zeroReferenceMarkerMissing = texts.filter((text) => !zeroReferenceClaim.test(text)).length;
  const confirmedClaimInZeroReference = texts.filter((text) => confirmedReferenceClaim.test(text)).length;
  const uploadeClaimInZeroReferenceInternal = /Use the confirmed footwear references uploaded in the current task/i.test(internalText);
  const productReferenceContradiction = referenceCount > 0
    ? texts.some((text) => zeroReferenceClaim.test(text)) || !texts.some((text) => confirmedReferenceClaim.test(text))
    : zeroReferenceMarkerMissing > 0 || confirmedClaimInZeroReference > 0 || uploadeClaimInZeroReferenceInternal;
  add(
    "PRODUCT_REFERENCE_TRUTH_CONTRADICTION",
    "product_reference_conflict",
    "Product reference truth is a single branch",
    !productReferenceContradiction,
    referenceCount > 0
      ? `${referenceCount} confirmed reference(s): the reference-bound branch is the only one present.`
      : `0 confirmed reference(s): ${confirmedClaimInZeroReference} uploaded-reference claim(s), ${zeroReferenceMarkerMissing} missing no-reference marker(s) across director script / execution prompt / internal script.`
  );

  // 18. BODY_ACTION_STATE_CONTRADICTION
  const bodyConflicts: string[] = [];
  for (const take of director.takes) {
    for (const moment of take.moments) {
      const contract = contractsByMoment.get(moment.momentIndex);
      if (!contract) continue;
      const before = contract.worldStateBefore?.facts["character.motion"] ?? null;
      const after = contract.worldStateAfter?.facts["character.motion"] ?? null;
      const genericWalkingTemplate = /\bsame grounded walking cadence\b|\bwithout stopping or restarting\b/i.test(moment.body);
      const resumesFromStop = ["STOPPED", "SETTLED", "WAITING", "SEATED"].includes(before ?? "") && after === "WALKING";
      // Walking and naturally slowing are the same phase; only a real stop ends it.
      if (genericWalkingTemplate && !["WALKING", "SLOWING"].includes(before ?? "")) {
        bodyConflicts.push(`MOMENT ${moment.momentIndex + 1} uses a continuous-walking template from a ${before} state`);
      }
      if (resumesFromStop && genericWalkingTemplate && !/weight shifts|shifts out of|staged restart/i.test(moment.body)) {
        bodyConflicts.push(`MOMENT ${moment.momentIndex + 1} restarts walking instead of continuing out of the completed task`);
      }
      if (resumesFromStop && !/weight shifts|shifts out of|moves at an ordinary pace/i.test(moment.body)) {
        bodyConflicts.push(`MOMENT ${moment.momentIndex + 1} does not describe the transition out of the completed task`);
      }
    }
  }
  add(
    "BODY_ACTION_STATE_CONTRADICTION",
    "body_action_conflict",
    "Body wording follows the current action state",
    bodyConflicts.length === 0,
    bodyConflicts.length === 0
      ? "Every Moment body line reads the previous action state rather than a walk category template."
      : bodyConflicts.join(" | ")
  );

  // 19. Single-use action cannot be replayed.
  const replayConflicts: string[] = [];
  const SINGLE_USE_WORDING: Array<{ event: string; pattern: RegExp; label: string }> = [
    { event: "UNLOCK_DOOR", pattern: /\bunlocks?\b|\bturns? the key in\b/i, label: "unlocking the door" },
    { event: "OPEN_DOOR", pattern: /\bopens? the (?:already unlocked )?door\b/i, label: "opening the door" },
    { event: "FIND_KEY", pattern: /\bfinds? the key\b|\bbrings? the key out\b/i, label: "finding the key" },
    { event: "CROSS_THRESHOLD", pattern: /\bcross(?:es|ing)? the (?:open )?threshold\b|\bsteps? (?:inside|through the doorway)\b/i, label: "crossing the threshold" },
    { event: "TAKE_SEAT", pattern: /\btakes? a seat\b|\bsits down\b/i, label: "taking the seat" },
    { event: "WINDOW_STOP", pattern: /\bstops? (?:at|outside) the (?:shop )?window\b/i, label: "the window stop" },
    { event: "ENTER_STORE", pattern: /\benters? the (?:book)?store\b|\bgoes? inside the (?:book)?store\b/i, label: "entering the store" },
    { event: "PUT_OBJECT_DOWN", pattern: /\bputs? (?:it|the object) down\b/i, label: "putting the object down" },
  ];
  for (const take of director.takes) {
    for (const moment of take.moments) {
      const contract = contractsByMoment.get(moment.momentIndex);
      if (!contract) continue;
      const completed = contract.worldStateBefore?.completedEvents ?? [];
      const text = `${moment.whatHappens} ${moment.body}`;
      for (const entry of SINGLE_USE_WORDING) {
        if (completed.includes(entry.event) && assertNegates(text, entry.pattern)) {
          replayConflicts.push(`MOMENT ${moment.momentIndex + 1} replays "${entry.label}" after it completed`);
        }
      }
    }
  }
  add(
    "IMMERSIVE_SINGLE_USE_ACTION_REPLAY",
    "single_use_replay",
    "No completed single-use action is replayed",
    replayConflicts.length === 0,
    replayConflicts.length === 0
      ? "No Moment re-performs a single-use action that its structured state already completed."
      : replayConflicts.join(" | ")
  );

  // 20. SOUND_SPATIAL_STATE_CONFLICT
  const soundConflicts: string[] = [];
  for (const take of director.takes) {
    for (const moment of take.moments) {
      const contract = contractsByMoment.get(moment.momentIndex);
      if (!contract) continue;
      const zone = acousticsZoneOf(contract.spatialAnchor);
      const cues = moment.sound.join(" ; ");
      const forbidden = zone === "INTERIOR"
        ? EXTERIOR_CUE_TOKENS.filter((token) => cues.includes(token))
        : zone === "EXTERIOR"
          ? INTERIOR_CUE_TOKENS.filter((token) => cues.includes(token))
          : [];
      const dominantConflicts = forbidden.filter((token) => {
        const cue = moment.sound.find((entry) => entry.includes(token));
        if (!cue) return false;
        return !RESIDUAL_ALLOWANCE.test(cue);
      });
      if (dominantConflicts.length > 0) {
        soundConflicts.push(`MOMENT ${moment.momentIndex + 1} (${zone}) keeps ${dominantConflicts.join(", ")} as foreground sound`);
      }
    }
  }
  add(
    "SOUND_SPATIAL_STATE_CONFLICT",
    "sound_space_conflict",
    "Sound follows the current spatial state",
    soundConflicts.length === 0,
    soundConflicts.length === 0
      ? `Moment sound stays inside its ${finalZone === "INTERIOR" ? "interior" : "current"} acoustic world and no earlier space remains dominant.`
      : soundConflicts.join(" | ")
  );

  // 21. LEGACY_SHOT_TOKEN_LEAK
  const legacyPatterns = [/\bshots?\s*[1-5]\b/i, /\b[1-5]\s+shots?\b/i, /\bshot list\b/i, /\bat shot\b/i, /\bshot \d+\b/i];
  const legacyHits = [directorText, executionText].flatMap((text) => legacyPatterns
    .filter((pattern) => pattern.test(text))
    .map((pattern) => `${pattern.source} in ${text === directorText ? "director script" : "execution prompt"}`));
  add(
    "LEGACY_SHOT_TOKEN_LEAK",
    "legacy_wording_leak",
    "No legacy shot vocabulary leaks",
    legacyHits.length === 0,
    legacyHits.length === 0
      ? "Both final outputs speak only in TAKE / MOMENT / event vocabulary."
      : legacyHits.join(" | ")
  );

  // 22. Route is human-readable and state-consistent.
  const route = director.global.spatialRoute;
  const plannedRoute = humanReadableRoute(input.plan.moments.map((moment) => moment.spatialAnchor));
  const routeSegments = route.split("→").map((segment) => segment.trim());
  const consecutiveDuplicates = routeSegments.filter((segment, index) => index > 0 && segment === routeSegments[index - 1]).length;
  const internalIdLeak = /\b[A-Z][A-Z_]{4,}\b/.test(route);
  const locationLabel = input.sceneResolution.locationWorld?.label ?? input.plan.spatialEnvelope.macroLocation;
  add(
    "IMMERSIVE_SPATIAL_ROUTE_READABLE",
    "route_rendering_conflict",
    "Spatial route is readable and state-consistent",
    consecutiveDuplicates === 0 && !internalIdLeak && route.includes(locationLabel) && route.includes(plannedRoute),
    consecutiveDuplicates > 0 || internalIdLeak
      ? `${consecutiveDuplicates} consecutive duplicate(s); internal ids present: ${internalIdLeak}.`
      : route.includes(plannedRoute)
        ? "The director-facing route is concise and matches the structured anchor sequence."
        : "The director-facing route does not match the structured anchor sequence."
  );

  // 23. Director and Seedance share one truth.
  const executionTakeRanges = executionTakeHeaders.map((header) => header[2].replace(/\s+—\s+.*$/, "").trim());
  const directorTakeRanges = director.takes.map((take) => {
    const first = take.moments[0];
    const last = take.moments[take.moments.length - 1];
    return `${first?.timeRange.startSecond.toFixed(1)}-${last?.timeRange.endSecond.toFixed(1)}s`;
  });
  const sharedStateSentences = Object.entries(MODEL_FACING_STATE_FACTS)
    .filter(([key]) => ["character.place", "character.motion", "door.state", "key.location"].includes(key))
    .map(([key, values]) => values[finalFacts[key] ?? ""])
    .filter((sentence): sentence is string => Boolean(sentence));
  const missingSharedState = sharedStateSentences.filter((sentence) => !director.ending.includes(sentence) && !executionText.includes(sentence));
  const sharedRoute = executionText.includes(plannedRoute);
  // Sound is shared structurally: the director script re-renders exactly the
  // Moment sound set the execution compiler emitted, and the execution prompt
  // carries one SOUND line per Moment.
  const executionSound = input.modelFacingScript.moments.map((moment) => moment.naturalSound);
  const directorSound = director.takes.flatMap((take) => take.moments.slice().sort((a, b) => a.momentIndex - b.momentIndex))
    .sort((a, b) => a.momentIndex - b.momentIndex)
    .map((moment) => moment.sound);
  const sharedSound = JSON.stringify(executionSound) === JSON.stringify(directorSound);
  // The execution prompt covers every Moment either as its own block or inside a
  // continuous-action observation window; nothing may be dropped or re-ordered.
  const standaloneMoments = (executionText.match(/MOMENT \d+ ·/g) ?? []).length;
  const windowMomentReferences = (executionText.match(/\b\d+=\d+(?:\.\d+)?-\d+(?:\.\d+)?s\b/g) ?? []).length;
  const momentCoverageShared = standaloneMoments + windowMomentReferences === input.modelFacingScript.moments.length;
  add(
    "DIRECTOR_SEEDANCE_TRUTH_CONFLICT",
    "director_seedance_truth_conflict",
    "Director script and Seedance prompt share one truth",
    JSON.stringify(executionTakeRanges) === JSON.stringify(directorTakeRanges)
      && sharedRoute
      && sharedSound
      && momentCoverageShared
      && missingSharedState.length === 0,
    JSON.stringify(executionTakeRanges) === JSON.stringify(directorTakeRanges)
      ? `Take ranges, route (${sharedRoute}), sound (${sharedSound}), Moment coverage (${standaloneMoments}+${windowMomentReferences}) and final state (${missingSharedState.length} missing) agree.`
      : `Take ranges differ: director ${directorTakeRanges.join(", ")} vs execution ${executionTakeRanges.join(", ")}.`
  );

  const categoryFailures = IMMERSIVE_FINAL_CONSISTENCY_CATEGORIES.reduce((accumulator, category) => {
    accumulator[category] = checks.filter((check) => check.category === category && check.status === "FAIL").length;
    return accumulator;
  }, {} as Record<ImmersiveFinalConsistencyCategory, number>);
  const failureReasons = checks
    .filter((check) => check.status === "FAIL")
    .map((check) => `${check.id}: ${check.detail}`);

  return {
    status: failureReasons.length === 0 ? "IMMERSIVE_FINAL_CONSISTENCY_VALIDATED" : "IMMERSIVE_FINAL_CONSISTENCY_FAILED",
    checks,
    categoryFailures,
    failureReasons,
  };
}
