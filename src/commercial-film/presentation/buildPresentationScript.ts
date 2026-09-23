import type { CommercialCutMotivation } from "../creative-direction/types";
import type {
  CommercialCameraRhythm,
  CommercialIntentId,
  CommercialShotRole,
} from "../types";
import type { CommercialDirectorConceptId } from "../director-concept/types";
import {
  COMMERCIAL_FINAL_SCRIPT_PRESENTATION_SCHEMA_VERSION,
  type CommercialCanonicalPresentationInput,
  type CommercialDirectorScript,
  type CommercialFinalScriptPresentation,
  type CommercialPresentationShot,
} from "./types";

const TITLE_BY_CONCEPT: Record<CommercialDirectorConceptId, string> = {
  STATIC_CAMERA_FILM: "THE FRAME WAITS",
  PARTIAL_OBSCURATION: "SEEN IN PARTS",
  EDGE_OF_FRAME: "AT THE EDGE OF THE FRAME",
  THRESHOLD_CHAIN: "ONE THRESHOLD AT A TIME",
  REFLECTION_WORLD: "BEFORE THE DIRECT VIEW",
  LIGHT_REVEAL: "LIGHT FINDS HER FIRST",
  WORLD_MOVES_SUBJECT_SETTLES: "THE WORLD MOVES. SHE SETTLES.",
  REPEATED_GESTURE: "A GESTURE, TWICE",
};

const TITLE_OVERRIDES: Partial<Record<`${CommercialIntentId}:${CommercialDirectorConceptId}`, string>> = {
  "URBAN_MOTION:STATIC_CAMERA_FILM": "THE CITY MOVES AROUND HER",
  "DAILY_STYLING:STATIC_CAMERA_FILM": "THE DAY BEGINS ON HER TERMS",
  "PRODUCT_CRAFT:STATIC_CAMERA_FILM": "DETAIL IN STILLNESS",
  "NEW_ARRIVAL:STATIC_CAMERA_FILM": "A FAMILIAR PLACE, SEEN ANEW",
};

const ROLE_LABEL: Record<CommercialShotRole, string> = {
  WORLD: "World",
  WEAR: "Wear",
  DETAIL: "Detail",
  HERO: "Hero",
  RELEASE: "Release",
};

const ROLE_STRUCTURE: Record<CommercialShotRole, string> = {
  WORLD: "Enter the world before the product.",
  WEAR: "Let the natural movement make the product readable.",
  DETAIL: "Show one real product relationship in use.",
  HERO: "Resolve the film's visual idea through the worn product.",
  RELEASE: "Return the film to the world without a new beat.",
};

const TONE_BY_RHYTHM: Record<CommercialCameraRhythm, string> = {
  CALM: "Calm, observational, material-led",
  BALANCED: "Natural, moving, quietly composed",
  PRODUCT_FORWARD: "Precise, restrained, detail-led",
};

const VISUAL_BY_EVENT_KIND: Record<string, string> = {
  CITY_ENTRY: "She crosses from one part of the city into the next without breaking pace.",
  ROUTE_CONTINUATION: "She reaches the curb and continues across without changing pace.",
  GROUND_RELATION_CHANGE: "Her leading foot lands on the new surface and her weight settles naturally into the step.",
  URBAN_PAUSE: "She reaches a natural pause point and lets her weight settle without posing.",
  ROUTE_RELEASE: "She continues beyond the pause while the camera stays with the place she crossed.",
  WARDROBE_DECISION: "She finishes one practical styling decision that completes the look.",
  THRESHOLD_TEST: "She crosses the doorway and carries the completed look into real movement.",
  GARMENT_FOOT_RELATION: "The first step lets the finished hem, ankle, and footwear relationship read naturally.",
  READY_TO_MOVE: "She stops at the outside edge and lets the completed look settle.",
  LIVED_USE: "She steps into the ordinary rhythm of the street with the look already resolved.",
  PRIVATE_STATE: "She stands by the window with her weight settled on the rear leg.",
  RESTRAINED_SHIFT: "She makes one small adjustment that changes the body line.",
  MATERIAL_PAUSE: "She holds the pause and lets her weight settle through the ankle and heel while side light defines the lower silhouette.",
  PRODUCT_RECOGNITION: "She shifts her weight once and holds the complete worn line in the private light.",
  ROOM_CONTINUES: "She stays still while the room and light continue around her.",
  PREPARATION_CONTEXT: "She works through one ordinary preparation task in the dressing area.",
  WEAR_TRANSITION: "She stands and takes one small step with the product already worn.",
  EXTERNAL_DETAIL_SELECTION: "She shifts onto the leading foot and lets the trouser hem settle around the ankle.",
  USE_CONFIRMATION: "Her weight settles through one small practical move so the product relationship reads in use.",
  QUIET_COMPLETION: "The action completes and she becomes ready to leave the preparation space.",
  APPROACH: "She approaches the destination through a believable adjacent space.",
  THRESHOLD: "She reaches the threshold and makes the final physical adjustment to enter.",
  ARRIVAL_GROUNDING: "She takes one real step onto the arrival surface and lets her weight settle.",
  SETTLING: "She settles into the destination and the complete worn look becomes clear.",
  ARRIVAL_ENVIRONMENT: "The destination continues around her as she remains settled in the arrival space.",
};

const MOVEMENT_BY_TYPE: Record<string, string> = {
  locked_observation: "Hold the frame still and let her movement create the energy.",
  restrained_follow: "Follow at a human distance from the side or rear three-quarter.",
  short_lateral_track: "Reframe laterally only enough to stay with the action.",
  motivated_pan: "Pan only when her movement or the space motivates it.",
  controlled_detail_framing: "Hold one brief detail, then return to the wider human action.",
  product_readable_lower_framing: "Keep the lower frame on the natural ankle-to-ground relationship.",
  brief_hero_hold: "Hold briefly as the worn line settles.",
};

const TRANSITION_BY_MOTIVATION: Record<CommercialCutMotivation, string> = {
  ACTION_COMPLETION: "Cut as the current action reaches completion.",
  ACTION_CONTINUATION: "Cut on the continuation of the same movement.",
  VISUAL_MATCH: "Cut on a visual match from the previous image.",
  ATTENTION_SHIFT: "Cut to shift attention to the next visual fact.",
  SPATIAL_TRANSITION: "Cut through the next spatial change.",
  PRODUCT_DISCOVERY: "Cut when the product relationship becomes clear.",
  EMOTIONAL_RELEASE: "Hold the final image and release without a new beat.",
};

const INTERNAL_PHRASES = [
  "selected commercial expression",
  "commercial expression defines",
  "beat 1 contributes",
  "hero inherits the movement",
  "release inherits the movement",
  "externally supported product observation",
  "execution state",
  "canonical",
  "validator",
  "enum",
  "event spine",
  "action causality",
  "product presence",
  "reveal strategy",
  "dramatic function",
  "story spine",
];

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function ensureSentence(value: string) {
  const normalized = normalizeWhitespace(value);
  if (!normalized) return "";
  const capitalized = /^[a-z]/.test(normalized)
    ? `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`
    : normalized;
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

function humanizeText(value: string) {
  return normalizeWhitespace(value)
    .replace(/\bwith the person\b/gi, "with her")
    .replace(/\bfor the person\b/gi, "for her")
    .replace(/\bto the person\b/gi, "to her")
    .replace(/\bthe person's\b/gi, "her")
    .replace(/\bThe person\b/g, "She")
    .replace(/\bthe person\b/g, "she")
    .replace(/\bThe subject\b/g, "She")
    .replace(/\bfollows the subject\b/gi, "follows her")
    .replace(/\bwith the subject\b/gi, "with her")
    .replace(/\bsubject entering\b/gi, "her entering")
    .replace(/\bsubject remains\b/gi, "she remains")
    .replace(/\bsubject leaves\b/gi, "she leaves")
    .replace(/\bsubject stops\b/gi, "she stops")
    .replace(/\bthe subject\b/g, "her")
    .replace(/\bresolves a new ground relationship\b/gi, "settles naturally onto the new surface")
    .replace(/\bworn-product\b/gi, "worn product")
    .replace(/\bvisual space\b/gi, "frame")
    .replace(/\bselected reference-supported product relationship\b/gi, "chosen product relationship")
    .replace(/\bexternally supported product observation\b/gi, "product detail")
    .replace(/\bexecution state\b/gi, "screen action")
    .replace(/\bcommercial expression\b/gi, "film idea");
}

function containsInternalPhrase(value: string) {
  const lower = value.toLowerCase();
  return INTERNAL_PHRASES.some((phrase) => lower.includes(phrase));
}

function safeSentences(value: string, maximum = 2) {
  return normalizeWhitespace(value)
    .split(/(?<=[.!?])\s+|;\s*/)
    .map(humanizeText)
    .filter((sentence) => sentence && !containsInternalPhrase(sentence))
    .slice(0, maximum);
}

function canonicalSectionLines(canonicalCompiledText: string, section: string) {
  const marker = `[${section}]`;
  const start = canonicalCompiledText.indexOf(marker);
  if (start === -1) return [];
  const contentStart = start + marker.length;
  const next = canonicalCompiledText.indexOf("\n[", contentStart);
  const body = canonicalCompiledText.slice(contentStart, next === -1 ? undefined : next);
  return body
    .split("\n")
    .map((line) => normalizeWhitespace(line))
    .filter(Boolean);
}

function visualForShot(input: CommercialCanonicalPresentationInput, shotIndex: number) {
  const shot = input.plan.shotArchitecture.shots[shotIndex];
  const mapped = VISUAL_BY_EVENT_KIND[shot.event.eventKind];
  if (mapped) return mapped;
  return ensureSentence(safeSentences(shot.event.whatHappens, 1)[0] ?? shot.event.whatHappens);
}

function cameraForShot(input: CommercialCanonicalPresentationInput, shotIndex: number) {
  const shot = input.plan.shotArchitecture.shots[shotIndex];
  const height: Record<string, string> = {
    natural_eye_level: "natural eye level",
    natural_chest_height: "natural chest height",
    natural_shoulder_height: "natural shoulder height",
  };
  const movement = MOVEMENT_BY_TYPE[shot.camera.movement] ?? "Keep the camera restrained and observational.";
  return `${ensureSentence(humanizeText(shot.camera.framing))} ${ensureSentence(height[shot.camera.cameraHeight] ?? "natural height")} ${ensureSentence(movement)}`;
}

function humanizeProductRelationship(value: string) {
  return humanizeText(value)
    .replace(/^surface$/i, "visible surface relationship")
    .replace(/\bthreshold-arrival surface-stop relationship\b/gi, "arrival surface and natural weight stop");
}

function productForShot(input: CommercialCanonicalPresentationInput, shotIndex: number) {
  const shot = input.plan.shotArchitecture.shots[shotIndex];
  const presence = shot.storySpine.productPresenceDesign;
  const relationship = shot.event.productDetailRelationship;

  if (presence === "ABSENT") return "The product stays outside this shot.";
  if (presence === "IMPLIED") return "The product remains implied through the worn look.";
  if (presence === "PARTIAL") return "The product is only partly visible while the human action stays primary.";
  if (shot.role === "DETAIL" && relationship) {
    return `The shot makes the ${humanizeProductRelationship(relationship)} readable through natural use.`;
  }
  if (shot.role === "HERO") return "The complete worn product reads clearly at natural human scale.";
  if (shot.role === "RELEASE") return "The product remains part of the lived afterimage rather than becoming a separate display.";
  if (presence === "CLEAR") return "The product reads clearly within the worn look.";
  return "The product stays secondary within the worn look.";
}

function soundForShot(input: CommercialCanonicalPresentationInput, shotIndex: number) {
  const sound = input.plan.soundPlan.shots[shotIndex];
  const cues = [...new Set(sound.cues.map(humanizeText).filter(Boolean))].slice(0, 2);
  if (sound.silenceLevel === "PRONOUNCED") cues.push("let the sound fall away");
  return ensureSentence(cues.join(", ") || "natural room tone");
}

function transitionForShot(input: CommercialCanonicalPresentationInput, shotIndex: number) {
  const shot = input.plan.shotArchitecture.shots[shotIndex];
  return ensureSentence(TRANSITION_BY_MOTIVATION[shot.direction.cutMotivation]);
}

function buildCreativeIdea(input: CommercialCanonicalPresentationInput) {
  const situationLine = humanizeText(input.plan.creativeSpine.humanSituation.situationLine);
  const situation = ensureSentence(/^(?:she|the)\b/i.test(situationLine) ? situationLine : `She ${situationLine}`);
  const outcome = ensureSentence(humanizeText(input.plan.creativeSpine.audienceDesire.viewerOutcomeLine));
  return `${situation} ${outcome}`;
}

function buildFormattedText(script: CommercialDirectorScript) {
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
    "FILM STRUCTURE",
    ...script.filmStructure.map((line, index) => `${index + 1}. ${line}`),
    "",
  ];

  for (const shot of script.shots) {
    lines.push(
      `SHOT ${shot.shotIndex + 1} — ${shot.roleLabel.toUpperCase()}`,
      `Time: ${shot.timeRange.startSecond.toFixed(1)}-${shot.timeRange.endSecond.toFixed(1)}s`,
      `Visual: ${shot.visual}`,
      `Camera: ${shot.camera}`,
      `Product: ${shot.product}`,
      `Sound: ${shot.sound}`,
      `Transition: ${shot.transition}`,
      ""
    );
  }

  lines.push(
    "ENDING",
    script.ending,
    "",
    "GLOBAL VISUAL LOOK",
    ...script.global.visualLook,
    "",
    "GLOBAL SOUND",
    script.global.soundPolicy,
    "",
    "GLOBAL PRODUCT PROTECTION",
    ...script.global.productProtection,
    "",
    "GLOBAL NEGATIVES",
    ...script.global.negatives,
    "",
    "SEEDANCE EXECUTION",
    "The frozen Seedance execution prompt is available separately and remains unchanged.",
    ""
  );

  return lines.join("\n");
}

export function buildCommercialFinalScriptPresentation(
  input: CommercialCanonicalPresentationInput
): CommercialFinalScriptPresentation {
  const shots: CommercialPresentationShot[] = input.plan.shotArchitecture.shots.map((shot) => ({
    shotIndex: shot.shotIndex,
    shotRole: shot.role,
    roleLabel: ROLE_LABEL[shot.role],
    timeRange: {
      startSecond: shot.timeRange.startSecond,
      endSecond: shot.timeRange.endSecond,
      durationSeconds: shot.timeRange.durationSeconds,
    },
    visual: visualForShot(input, shot.shotIndex),
    camera: cameraForShot(input, shot.shotIndex),
    product: productForShot(input, shot.shotIndex),
    sound: soundForShot(input, shot.shotIndex),
    transition: transitionForShot(input, shot.shotIndex),
    sourceEvent: shot.event.whatHappens,
  }));

  const visualLook = canonicalSectionLines(input.canonicalCompiledText, "VISUAL LOOK")
    .map((line) => safeSentences(line, 2))
    .flat()
    .filter((line, index, all) => all.indexOf(line) === index)
    .filter((line) => !containsInternalPhrase(line));
  const productProtection = canonicalSectionLines(input.canonicalCompiledText, "GLOBAL PRODUCT PROTECTION");
  const negatives = canonicalSectionLines(input.canonicalCompiledText, "NEGATIVES");
  const soundPolicy = [
    `Context: ${ensureSentence(humanizeText(input.plan.soundPlan.context))}`,
    "No dialogue, no voiceover, no music unless explicitly requested.",
  ].join(" ");

  const directorScript: CommercialDirectorScript = {
    title: TITLE_OVERRIDES[`${input.plan.commercialIntent}:${input.plan.directorConcept.concept}`]
      ?? TITLE_BY_CONCEPT[input.plan.directorConcept.concept],
    creativeIdea: buildCreativeIdea(input),
    durationSeconds: input.plan.duration,
    format: "Commercial film · five-shot structure",
    tone: TONE_BY_RHYTHM[input.plan.cameraRhythm],
    directorConcept: ensureSentence(humanizeText(input.plan.directorConcept.globalRule)),
    cinematicDevice: input.plan.directorConcept.label,
    filmStructure: input.plan.shotArchitecture.shots.map((shot) => `${ROLE_LABEL[shot.role]} — ${ROLE_STRUCTURE[shot.role]}`),
    shots,
    ending: ensureSentence(humanizeText(input.plan.endingStrategy.line)),
    global: {
      visualLook,
      soundPolicy,
      productProtection,
      negatives,
    },
  };

  return {
    canonicalCompiledText: input.canonicalCompiledText,
    presentationScript: buildFormattedText(directorScript),
    directorScript,
  };
}
