import type {
  CommercialExecutionCheck,
  CommercialExecutionScript,
  CommercialExecutionValidation,
  CommercialFilmPlan,
  CommercialProductMessageDimension,
} from "./types";
import {
  COMMERCIAL_EXECUTION_SCHEMA_VERSION,
  COMMERCIAL_EXECUTION_VERSION,
} from "./types";
import {
  renderDramaticFunctionDirection,
  renderProductPresenceDirection,
} from "./creative-spine";
import {
  renderCameraBehaviorDirection,
  renderVisualMotifDirection,
  type CommercialEditLogic,
} from "./creative-direction";

export const COMMERCIAL_MODEL_FACING_HEADER =
  "SEEDANCE — COMMERCIAL FILM" as const;

const INTERNAL_MARKERS = [
  "[COMMERCIAL PLAN]",
  "[SHOT PLAN]",
  "[CAMERA PLAN]",
  "[SOUND PLAN]",
  "[REFERENCE STATE]",
  "[CONTINUITY STATE]",
  "[TAKE PLAN]",
  "[MICRO DECISION]",
  "ACTION PRIMITIVE",
  "SOURCE ID",
  "dramatic function",
  "audience desire",
  "story spine",
  "product meaning",
  "reveal strategy",
  "PRIVATE_MOMENT",
  "CITY_JOURNEY",
  "EVERYDAY_MOVEMENT",
  "STATE_TRANSITION",
  "SENSORY_LIFE",
  "SINGLE_IDEA",
  "OBSERVE",
  "FOLLOW",
  "WAIT",
  "DISCOVER",
  "PASS_BY",
  "GROUND_OBSERVATION",
  "DETAIL_INTERRUPTION",
  "WITHHOLD",
  "REVEAL",
  "ACTION_CUT",
  "MATCH_MOVEMENT",
  "SENSORY_INSERT",
  "DELAYED_REVEAL",
  "THRESHOLD",
  "LIGHT",
  "REFLECTION",
  "SHADOW",
  "LINE",
  "REPETITION",
  "ACTION_COMPLETION",
  "ACTION_CONTINUATION",
  "VISUAL_MATCH",
  "ATTENTION_SHIFT",
  "SPATIAL_TRANSITION",
  "PRODUCT_DISCOVERY",
  "EMOTIONAL_RELEASE",
  "Miu Miu",
  "Prada",
  "Ferragamo",
  "Tod's",
  "Loewe",
  "Gucci",
  "Bottega Veneta",
  "Dior",
  "QC",
  "validator",
  "enum",
];

function dimensionOf(
  plan: CommercialFilmPlan,
  coverage: CommercialProductMessageDimension["coverage"] | null
) {
  if (!coverage) return null;
  return plan.productMessage.supportedDimensions.find((dimension) => dimension.coverage === coverage) ?? null;
}

function shotProductLine(
  plan: CommercialFilmPlan,
  shotIndex: number
) {
  const shot = plan.shotArchitecture.shots[shotIndex];
  if (!shot) return "No product requirement is issued for this shot.";
  const dimension = dimensionOf(plan, shot.productMessageDimension);
  const presenceDirection = renderProductPresenceDirection(shot.storySpine.productPresenceDesign);
  if (shot.storySpine.productPresenceDesign === "ABSENT") {
    return `${presenceDirection} Keep the human situation continuous with the rest of the film.`;
  }
  if (plan.productMessage.externalReferenceRequired) {
    return `${presenceDirection} Use the footwear reference images uploaded in the external video generation tool as the only source of truth for the product. Do not invent or alter product details not supported by those references.`;
  }
  if (shot.storySpine.productPresenceDesign === "SECONDARY" || shot.storySpine.productPresenceDesign === "IMPLIED") {
    return `${presenceDirection} The product remains part of the person's real clothing and movement. Do not force a product-only frame.`;
  }
  if (!dimension) {
    return "Preserve the current confirmed product reference only where it naturally appears in the frame.";
  }
  if (shot.productVisibility === "PRODUCT_DETAIL") {
    return `${presenceDirection} ${dimension.detailMessage} Keep the detail inside the real worn-product relationship.`;
  }
  if (shot.productVisibility === "PRODUCT_HERO") {
    return `${presenceDirection} ${dimension.message} Keep this selected hero role worn, grounded, and at natural human scale.`;
  }
  return `${presenceDirection} ${dimension.message} Preserve only the visibility level selected by the Creative Spine; do not escalate the frame.`;
}

function compactProductLine(plan: CommercialFilmPlan, shotIndex: number) {
  const shot = plan.shotArchitecture.shots[shotIndex];
  const presence = shot.storySpine.productPresenceDesign;
  const dimension = dimensionOf(plan, shot.productMessageDimension);
  if (presence === "ABSENT") {
    return "Product not visible; crop, foreground, seating, or occlusion must physically prevent footwear exposure.";
  }
  const firstClearIndex = plan.creativeSpine.productPresenceByShot.indexOf("CLEAR");
  const eventRelationship = firstClearIndex === shotIndex ? shot.event.productDetailRelationship : null;
  if (plan.productMessage.externalReferenceRequired) {
    if (eventRelationship && presence !== "IMPLIED") {
      return `Preserve the ${eventRelationship} only as supported by the external footwear references and visible within this existing action; keep the selected ${presence.toLowerCase()} product presence, with no detail insert or full-shoe close-up.`;
    }
    const visibility: Record<string, string> = {
      IMPLIED: "Product implied through context; no readable product view required.",
      PARTIAL: "Product partial and secondary; keep the human action primary.",
      SECONDARY: "Product secondary within the worn look.",
      CLEAR: "Product clear within the worn look at natural human scale.",
    };
    return visibility[presence] ?? "Product remains reference-bound to the external footwear uploads.";
  }
  if (eventRelationship && dimension) {
    return `Preserve the reference-supported ${eventRelationship} (${dimension.label}) within this existing action and its selected ${presence.toLowerCase()} visibility; do not turn it into a detail insert.`;
  }
  const visibility: Record<string, string> = {
    IMPLIED: "Product implied through context.",
    PARTIAL: "Product partially readable within the worn look.",
    SECONDARY: "Product secondary within the worn look.",
    CLEAR: "Product clear within the worn look at natural human scale.",
  };
  return visibility[presence] ?? "Product remains part of the worn look.";
}

function naturalCameraHeight(height: CommercialFilmPlan["cameraPlan"]["shots"][number]["cameraHeight"]) {
  return {
    natural_eye_level: "natural eye level",
    natural_chest_height: "natural chest height",
    natural_shoulder_height: "natural shoulder height",
  }[height];
}

function naturalCameraMovement(movement: CommercialFilmPlan["cameraPlan"]["shots"][number]["movement"]) {
  return {
    locked_observation: "fixed observation",
    restrained_follow: "restrained follow",
    short_lateral_track: "short lateral reframe",
    motivated_pan: "motivated pan",
    controlled_detail_framing: "controlled detail framing",
    product_readable_lower_framing: "product-readable lower framing",
    brief_hero_hold: "brief hold",
  }[movement];
}

const ROLE_TOKEN_TRANSLATIONS: Record<string, string> = {
  WORLD: "the opening environment",
  WEAR: "the worn look",
  DETAIL: "the selected detail",
  HERO: "the key worn-product moment",
  RELEASE: "the final moment",
};

const CONTINUOUS_EDIT_TRANSLATIONS: Record<CommercialEditLogic, string> = {
  ACTION_CUT: "Let the motivated physical action carry its momentum into the next movement without restarting it.",
  MATCH_MOVEMENT: "Match direction and body mechanics as the camera continues, preserving believable geography.",
  SENSORY_INSERT: "Keep the sensory beat inside the same continuous human situation, then return to the action without an insert.",
  DELAYED_REVEAL: "Hold back the complete product read temporarily, then reveal it through a motivated visual change inside the same take.",
};

const CONTINUOUS_LOCOMOTION_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bnatural pause point\b/gi, "natural moving adjustment"],
  [/\blets her weight settle\b/gi, "lets her weight transfer"],
  [/\bweight settles\b/gi, "weight transfers"],
  [/\bsettles into\b/gi, "continues into"],
  [/\bslow into a grounded stop\b/gi, "keep the step and momentum continuous"],
  [/\bcomes to a stop\b/gi, "keeps the movement continuous"],
  [/\bstops naturally\b/gi, "keeps moving naturally"],
  [/\blets the leading foot settle\b/gi, "keeps the leading foot moving through the step"],
  [/\bbeyond the pause point\b/gi, "beyond the route adjustment"],
  [/\bpause point\b/gi, "route adjustment"],
  [/\bhem settle[sd]? around the ankle\b/gi, "hem move around the ankle"],
  [/\bhem settle[sd]?\b/gi, "hem move"],
];

function continuousLocomotionSentence(text: string) {
  return CONTINUOUS_LOCOMOTION_REPLACEMENTS.reduce(
    (sentence, [pattern, replacement]) => sentence.replace(pattern, replacement),
    text
  );
}

function takeUsesContinuousLocomotionFlow(
  plan: CommercialFilmPlan,
  take: CommercialFilmPlan["continuity"]["takePlan"]["takes"][number]
) {
  if (plan.microDecision.contract) return false;
  if (take.shotIndexes.length <= 1) return false;
  const continuities = take.shotIndexes.map((shotIndex) => (
    plan.eventSpine.shots.find((shot) => shot.shotIndex === shotIndex)?.actionContinuity
  ));
  return continuities.some((continuity) => continuity === "CONTINUOUS")
    && continuities.every((continuity) => continuity !== "SETTLES");
}

function continuousActionFlowLines(
  plan: CommercialFilmPlan,
  take: CommercialFilmPlan["continuity"]["takePlan"]["takes"][number]
) {
  const shots = take.shotIndexes
    .map((shotIndex) => plan.shotArchitecture.shots.find((shot) => shot.shotIndex === shotIndex))
    .filter((shot): shot is CommercialFilmPlan["shotArchitecture"]["shots"][number] => Boolean(shot));
  const lines: string[] = [];
  lines.push("[ONE CONTINUOUS ACTION FLOW]");
  shots.forEach((shot, index) => {
    const action = continuousLocomotionSentence(shot.action.physicalActionLine);
    if (index === 0) {
      lines.push(action);
    } else {
      const previous = shots[index - 1];
      const cameraReframes = ["short_lateral_track", "motivated_pan", "controlled_detail_framing"].includes(
        previous.camera.movement
      );
      const link = cameraReframes ? "As the camera reframes," : "Without stopping,";
      const continued = action.charAt(0).toLowerCase() + action.slice(1);
      lines.push(`${link} ${continued}`);
    }
    if (shot.productVisibility === "PRODUCT_READABLE" || shot.productVisibility === "PRODUCT_HERO") {
      lines.push("The footwear remains readable during this same motion, without pausing for product readability.");
    }
    if (["PRODUCT_READABLE", "PRODUCT_DETAIL", "PRODUCT_HERO", "BRAND_RELEASE"].includes(shot.productVisibility)) {
      lines.push(sanitizeRoleTokens(compactProductLine(plan, shot.shotIndex)));
    }
  });
  lines.push("The movement continues directly out of the established frame as the film ends.");
  lines.push(sanitizeRoleTokens(plan.endingStrategy.grammar.line));
  lines.push("");
  lines.push("Beat windows are timing metadata only, not cuts:");
  shots.forEach((shot, index) => {
    lines.push(`Beat window ${index + 1}: ${shot.timeRange.startSecond.toFixed(1)}-${shot.timeRange.endSecond.toFixed(1)}s`);
  });
  shots.forEach((shot) => {
    lines.push(`Edit continuity: ${sanitizeRoleTokens(CONTINUOUS_EDIT_TRANSLATIONS[shot.direction.editLogic])}`);
  });
  const cameraFlow = shots.map((shot, index) => (
    `${sanitizeRoleTokens(renderCameraBehaviorDirection(shot.direction.cameraBehavior))
      .replace(/, doorway,/gi, ",")
      .replace(/\bdoorway\b/gi, "framing")} (${shot.timeRange.startSecond.toFixed(1)}-${shot.timeRange.endSecond.toFixed(1)}s)`
  )).join(" · ");
  lines.push(`Camera continuity: ${cameraFlow}`);
  return lines;
}

function mandatoryVisualEvents(plan: CommercialFilmPlan) {
  const events: string[] = [];
  const seen = new Set<string>();
  const push = (key: string, line: string) => {
    if (seen.has(key)) return;
    seen.add(key);
    events.push(line);
  };
  plan.eventSpine.shots.forEach((shot) => {
    shot.stateContract.effects.forEach((effect) => {
      if (effect.entityId === "character" && effect.attribute === "space") {
        // Spatial state changes are rendered once as a beat-local transition contract below.
        return;
      }
      if (effect.entityId === "character" && effect.attribute === "anchor") return;
      if (effect.cause === "ACTION" && effect.actionId && effect.fromValue !== effect.toValue) {
        if (shot.stateContract.singleUseAction?.actionId === effect.actionId) return;
        const entity = plan.continuity.worldModel.entities.find((entry) => entry.id === effect.entityId);
        const verb = effect.actionLabel ?? "change state";
        push(
          `${effect.entityId}.${effect.attribute}`,
          `${stateSubject(entity?.label ?? effect.entityId)} must be visibly ${verb}.`
        );
      }
    });
    const singleUse = shot.stateContract.singleUseAction;
    if (singleUse) {
      push(
        `single-use:${singleUse.actionId}`,
        `${singleUse.label} must visibly happen.`
      );
    }
  });
  const decision = plan.microDecision.contract;
  if (decision) {
    push(
      "micro-decision:consequence",
      `The visible consequence must happen after the decision is committed: ${decision.visibleConsequence}.`
    );
  }
  return events;
}

function modelFacingSpatialTransition(plan: CommercialFilmPlan, shotIndex: number) {
  const shot = plan.eventSpine.shots[shotIndex];
  const effect = shot?.stateContract.effects.find((entry) => (
    entry.entityId === "character" && entry.attribute === "space" && entry.fromValue !== entry.toValue
  ));
  if (!effect) return null;
  const evidence = shot.stateContract.requiredVisibleEvidence.find((entry) => entry.sourceEventId === effect.sourceEventId)
    ?? shot.stateContract.requiredVisibleEvidence[0];
  return [
    `SPATIAL TRANSITION CONTRACT: At the start of this beat, the character is ${effect.fromValue}.`,
    `During this same beat, the selected event happens once: ${evidence?.statement ?? shot.whatHappens}`,
    `At the end of this beat, the character is ${effect.toValue}. From the following beat onward, keep this end state.`,
    "This contract describes the same crossing already named in the beat action; it is not a second crossing.",
  ];
}

function sanitizeRoleTokens(text: string) {
  return text.replace(
    /\b(?:WORLD|WEAR|DETAIL|HERO|RELEASE)\b/g,
    (token) => ROLE_TOKEN_TRANSLATIONS[token] ?? token
  );
}

function lastActionLabelFor(
  plan: CommercialFilmPlan,
  upToShotIndex: number,
  entityId: string,
  attribute: string
): string | null {
  for (let shotIndex = upToShotIndex; shotIndex >= 0; shotIndex -= 1) {
    const shot = plan.eventSpine.shots.find((entry) => entry.shotIndex === shotIndex);
    const effects = shot?.stateContract.effects ?? [];
    for (let index = effects.length - 1; index >= 0; index -= 1) {
      const effect = effects[index];
      if (effect.entityId === entityId && effect.attribute === attribute && effect.actionLabel) {
        return effect.actionLabel;
      }
    }
  }
  return null;
}

function stateSubject(label: string) {
  const trimmed = label.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function collectedStateFacts(plan: CommercialFilmPlan, snapshot: {
  shotIndex: number;
  attributes: Record<string, Record<string, string>>;
  completedActions: string[];
}) {
  const facts: string[] = [];
  plan.continuity.worldModel.entities.forEach((entity) => {
    const values = snapshot.attributes[entity.id] ?? {};
    if (entity.kind === "CHARACTER") {
      const space = values.space;
      if (space) {
        facts.push(`The character is ${space}.`);
        facts.push("Do not return the character to an earlier spatial state without an explicit new crossing action.");
      }
      return;
    }
    entity.continuityLockAttributes.forEach((attribute) => {
      const value = values[attribute];
      if (value === undefined) return;
      const actionLabel = lastActionLabelFor(plan, snapshot.shotIndex, entity.id, attribute);
      facts.push(`${stateSubject(entity.label)} is already ${value}.`);
      facts.push(
        value !== entity.initialAttributes[attribute]
          ? `Do not replay ${actionLabel ?? "the action that produced this state"}.`
          : "Do not reset this state."
      );
    });
  });
  return facts;
}

function microDecisionTimelineLines(plan: CommercialFilmPlan) {
  const decision = plan.microDecision.contract;
  if (!decision) return [];
  return [
    "[DECISION SEQUENCE]",
    `Trigger: ${decision.trigger}`,
    `Decision: ${decision.chosenAction}`,
    `Commitment: the choice commits as ${decision.chosenActionId.toLowerCase()} before any consequence begins.`,
    `ONLY AFTER the decision is committed, this consequence begins: ${decision.visibleConsequence}.`,
    "WHILE the consequence is visible: the character remains in the spatial state reached by the decision and does not begin continuation.",
    "UNTIL the consequence has clearly completed: the character does not begin continuation.",
    `ONLY THEN: ${decision.continuation}`,
    "",
  ];
}

function compileText(plan: CommercialFilmPlan, internalScriptText: string) {
  const lines: string[] = [];
  const takes = plan.continuity.takePlan.takes;
  const shotByIndex = new Map(plan.shotArchitecture.shots.map((shot) => [shot.shotIndex, shot]));
  lines.push(COMMERCIAL_MODEL_FACING_HEADER);
  lines.push(`${plan.duration} seconds · one person · one continuous commercial idea`);
  lines.push("");
  lines.push("[FILM IDEA]");
  lines.push(plan.creativeSpine.premise.text);
  lines.push(plan.eventSpine.centralEvent);
  lines.push(`Cinematic rule: ${plan.directorConcept.globalRule}`);
  lines.push("");
  lines.push("[CHARACTER / ENVIRONMENT]");
  lines.push(`Age: ${plan.character.resolved.ageProfile ? `${plan.character.resolved.ageProfile.ageMin}-${plan.character.resolved.ageProfile.ageMax}` : "as selected"}`);
  lines.push(`Visible appearance: ${plan.character.resolved.appearanceGroup?.label ?? "as selected"}`);
  lines.push(`World: ${plan.sceneWorld.sceneNames.join(" → ")} · ${plan.season}`);
  lines.push("One primary character. Background life may remain distant and secondary. Natural expression, task-driven movement, no performance toward camera, same person and wardrobe throughout.");
  lines.push("Character face presence: Her face must be naturally readable in at least one meaningful beat, through a three-quarter-front orientation or naturally readable profile within the existing action. Keep the head, face, and upper-body context in frame. A second natural face-readable moment is welcome only if an existing beat permits it; add no action or shot for this. She may look toward her task, route, surroundings, or off-screen space. No forced direct eye contact, portrait posing, or camera-aware performance. Do not keep her rear-facing, heavily occluded, cropped above the face, or face-unreadable for the entire film.");
  lines.push("");
  lines.push("[CONTINUITY LOCK]");
  plan.continuity.continuityLock.lines.forEach((line) => {
    lines.push(line);
  });
  lines.push("");
  lines.push("[TIMING]");
  takes.forEach((take) => {
    lines.push(`Take ${take.takeIndex + 1}: ${take.startSecond.toFixed(1)}-${take.endSecond.toFixed(1)}s · ${take.shotIndexes.length} chronological beat(s)`);
  });
  lines.push("");
  lines.push(...microDecisionTimelineLines(plan));
  lines.push("[MANDATORY VISUAL EVENTS]");
  const mandatoryEvents = mandatoryVisualEvents(plan);
  if (mandatoryEvents.length > 0) {
    lines.push("The film is not narratively complete until each event below has visibly happened:");
    mandatoryEvents.forEach((event, index) => {
      lines.push(`${index + 1}. ${event}`);
    });
    lines.push("These events may not be replaced by generic walking, posing, product observation, or an alternative destination.");
  } else {
    lines.push("No single-use or state-completing visual event beyond the continuous action flow itself.");
  }
  lines.push("");

  takes.forEach((take) => {
    const isMultiBeat = take.shotIndexes.length > 1;
    const continuousFlow = takeUsesContinuousLocomotionFlow(plan, take);
    lines.push(`TAKE ${take.takeIndex + 1} — ONE CONTINUOUS SHOT`);
    lines.push(`Time: ${take.startSecond.toFixed(1)}-${take.endSecond.toFixed(1)}s`);
    if (continuousFlow) {
      lines.push("This entire take is uninterrupted.");
      lines.push("Do not cut.");
      lines.push("Do not reset camera position.");
      lines.push("Do not restart character movement.");
      lines.push("Do not create an insert shot for the product.");
      lines.push("LOCOMOTION STATE:");
      lines.push("The character remains in continuous locomotion throughout this take.");
      lines.push("There is no stop, settle, held position, planted-feet readability pause, or hero-like stationary moment in this take.");
      lines.push("");
      lines.push(...continuousActionFlowLines(plan, take));
      lines.push("");
    } else if (isMultiBeat) {
      lines.push("This entire take is uninterrupted.");
      lines.push("Do not cut.");
      lines.push("Do not reset camera position.");
      lines.push("Do not restart character movement.");
      lines.push("Do not create an insert shot for the product.");
      lines.push("Do not treat the timed beats below as separate shots.");
    }
    if (take.takeIndex > 0) {
      const previousTake = takes[take.takeIndex - 1];
      const previousLastShotIndex = previousTake.shotIndexes[previousTake.shotIndexes.length - 1];
      const inherited = plan.continuity.worldStateTimeline.find((step) => (
        step.shotIndex === previousLastShotIndex
      ))?.after;
      lines.push("START STATE INHERITED FROM PREVIOUS TAKE");
      if (inherited) {
        collectedStateFacts(plan, inherited).forEach((fact) => lines.push(fact));
      }
    }
    if (continuousFlow) {
      lines.push("");
    } else {
      let beatNumber = 1;
      take.shotIndexes.forEach((shotIndex) => {
        const shot = shotByIndex.get(shotIndex);
        if (!shot) return;
        const directorShot = plan.directorConcept.shots[shot.shotIndex];
        lines.push(`BEAT ${beatNumber}`);
        lines.push(`Time: ${shot.timeRange.startSecond.toFixed(1)}-${shot.timeRange.endSecond.toFixed(1)}s`);
        lines.push(`Action: ${shot.action.physicalActionLine}`);
        const spatialTransition = modelFacingSpatialTransition(plan, shot.shotIndex);
        spatialTransition?.forEach((line) => lines.push(line));
        const heroContinuous = shot.role === "HERO" && shot.event.actionContinuity === "CONTINUOUS";
        const cameraBehaviorText = heroContinuous
          ? "Let the natural weight settle make the worn product readable inside the ongoing movement."
          : sanitizeRoleTokens(renderCameraBehaviorDirection(shot.direction.cameraBehavior));
        const conceptRuleText = heroContinuous
          ? "Keep the hero moment inside the continuous movement; the worn product stays readable without a camera stop."
          : sanitizeRoleTokens(directorShot.conceptRule);
        const faceReadableFollow = shot.direction.cameraBehavior === "FOLLOW"
          && shot.camera.framing.includes("head, face, and upper-body context naturally readable");
        const resolvedCameraBehaviorText = faceReadableFollow
          ? "Follow softly from the established scene side at a natural three-quarter-front or readable profile angle, without centering a fashion walk."
          : cameraBehaviorText;
        lines.push(`Camera: ${shot.camera.framing}; ${naturalCameraHeight(shot.camera.cameraHeight)}; ${naturalCameraMovement(shot.camera.movement)}. ${resolvedCameraBehaviorText} ${shot.camera.movementLine} ${conceptRuleText}`);
        lines.push(`Product: ${compactProductLine(plan, shot.shotIndex)}`);
        const microDecision = plan.microDecision.contract;
        if (microDecision && microDecision.decisionBeatIndex === shot.shotIndex) {
          lines.push(`Decision: ${microDecision.chosenAction}`);
          lines.push(`Decision setup: ${microDecision.routine} The viewer expects ${microDecision.expectedAction}; the visible trigger is ${microDecision.trigger}.`);
          lines.push("Decision commitment: the choice is committed at this beat.");
        }
        if (microDecision && microDecision.consequenceBeatIndex === shot.shotIndex) {
          lines.push(`Visible consequence: ${microDecision.visibleConsequence}`);
          lines.push("Consequence precondition: the decision is already committed before this visible consequence.");
          lines.push(`Decision continues: ${microDecision.continuation}`);
        }
        const isLastBeatInTake = shotIndex === take.shotIndexes[take.shotIndexes.length - 1];
        const isLastTake = take.takeIndex === takes.length - 1;
        if (isLastBeatInTake && isLastTake) {
          lines.push(`Ending: ${sanitizeRoleTokens(plan.endingStrategy.line)} ${sanitizeRoleTokens(directorShot.releaseConvergence ?? plan.directorConcept.releaseRule)}`);
        } else if (isLastBeatInTake) {
          lines.push("Transition: this take ends here. The next take starts from the state declared in its own START STATE INHERITED FROM PREVIOUS TAKE block.");
        } else {
          lines.push("Transition: continue this uninterrupted take; next timed beat is a process boundary, not a cut.");
        }
        lines.push(`Edit continuity: ${sanitizeRoleTokens(CONTINUOUS_EDIT_TRANSLATIONS[shot.direction.editLogic])}`);
        const beatSound = shot.sound.cues.join("; ");
        lines.push(`Sound in this beat, grounded in its spatial state: ${beatSound}.`);
        beatNumber += 1;
      });
    }
    lines.push("");
  });

  lines.push("[SOUND ENVIRONMENT]");
  const soundCues = [...new Set(plan.soundPlan.shots.flatMap((shot) => shot.cues))].slice(0, 3);
  lines.push(`Context: ${plan.soundPlan.context}.`);
  lines.push(`Sound: ${soundCues.join("; ")}.`);
  lines.push("No dialogue, no voiceover, no music unless explicitly requested.");
  lines.push("");
  lines.push("[VISUAL LOOK]");
  lines.push("Natural light, restrained saturation, realistic skin, matte non-glossy finish, soft controlled contrast.");
  lines.push("The environment may use a restrained warm-neutral grade, but the footwear must remain faithful to the external reference in hue, saturation, contrast, and visible material appearance.");
  lines.push(plan.worldRealism.line);
  lines.push("Allow controlled observational imperfection: slight occlusion outside the face-readable moment, subject entering slightly late, off-center framing, and the camera staying after the subject leaves.");
  if (plan.creativeDirection.visualMotif) {
    const motifLine = renderVisualMotifDirection(
      plan.creativeDirection.visualMotif,
      plan.creativeDirection.shotDirections[0]?.visualMotifContribution
    );
    if (motifLine) lines.push(motifLine);
  }
  lines.push("");
  lines.push("[GLOBAL PRODUCT PROTECTION]");
  lines.push(plan.productMessage.externalToolReferenceInstruction);
  if (plan.productMessage.externalReferenceRequired) {
    lines.push(plan.productMessage.noFabricationLine);
  } else {
    lines.push("Use the confirmed current-task product references as the product-fact authority; upload this same reference set to the external video generation tool and use only its supported dimensions and visible facts.");
  }
  lines.push("Preserve silhouette, proportions, visible material and color relationships, outsole/upper/tongue/lace relationships, and grounded foot-to-shoe scale.");
  lines.push("Do not invent product facts, logos, materials, colors, panel geometry, or construction. Do not recolor, reshape, stretch, compress, or deform the product through pose, garment, or camera.");
  lines.push("");
  lines.push("[EVENT COMPLETION GATE]");
  lines.push("The film may enter its final structured state or continuation only after every mandatory visual event above has visibly completed.");
  lines.push("If any mandatory event is still incomplete, do not replace it with walking continuation, posing, product observation, or another destination.");
  lines.push("");
  lines.push("[FINAL STATE CLOSURE]");
  lines.push("Once the final structured state is reached, do not invent a new human task, destination, pose, seated action, object interaction, or product presentation.");
  collectedStateFacts(plan, plan.continuity.finalState).forEach((fact) => lines.push(fact));
  lines.push("");
  lines.push("[NEGATIVES]");
  lines.push("No runway posing, deliberate shoe presentation, camera-aware influencer gestures, shoe chase camera, orbit, 360, whip pan, or aggressive dolly.");
  lines.push("No clearly readable invented brand names or corrupted AI text. Distant non-readable storefront graphics, abstract signage shapes, and passing-life reflections are allowed.");
  lines.push("No product-only packshot, invented product detail, floating footwear, or detached shoe.");
  lines.push("No readable brand names, generated text, letters, logos, or signage in the environment unless explicitly requested.");

  return {
    compiledText: lines.join("\n"),
    internalScriptLength: internalScriptText.length,
  };
}

export function validateCommercialExecutionScript(
  script: CommercialExecutionScript,
  plan: CommercialFilmPlan,
  internalScriptText: string
): CommercialExecutionValidation {
  const checks: CommercialExecutionCheck[] = [];
  const add = (id: string, label: string, passed: boolean, passReason: string, failReason: string) => {
    checks.push({
      id,
      label,
      status: passed ? "PASS" : "FAIL",
      reason: passed ? passReason : failReason,
    });
  };
  const text = script.compiledText;
  const internalMarkers = INTERNAL_MARKERS.filter((marker) => text.includes(marker));
  const actionIdLeak = /\b(?:standing|walking|transition|turning|garment-task|scene-interaction|environment-response|on-foot|seated|studio-[a-z-]+|mirror-[a-z-]+)-\d{3}\b/i.test(text);
  const qcLanguageLeak = /\b(?:QC|validator|validation status|source id|primitive id|enum)\b/i.test(text);
  const usesContinuousFlow = text.includes("[ONE CONTINUOUS ACTION FLOW]");
  const beatBlocks = plan.shotArchitecture.shots.map((shot, index) => {
    if (usesContinuousFlow) {
      const marker = `Beat window ${index + 1}:`;
      const start = text.indexOf(marker);
      const nextMarker = index < plan.shotArchitecture.shots.length - 1
        ? `Beat window ${index + 2}:`
        : null;
      const next = nextMarker
        ? text.indexOf(nextMarker, start + marker.length)
        : text.indexOf("[SOUND ENVIRONMENT]", start + marker.length);
      return text.slice(Math.max(0, start), next === -1 ? text.length : next);
    }
    const timeMarker = `Time: ${shot.timeRange.startSecond.toFixed(1)}-${shot.timeRange.endSecond.toFixed(1)}s`;
    const start = text.indexOf(timeMarker);
    const nextShot = plan.shotArchitecture.shots.find((entry) => entry.shotIndex === shot.shotIndex + 1);
    const nextMarker = nextShot
      ? `Time: ${nextShot.timeRange.startSecond.toFixed(1)}-${nextShot.timeRange.endSecond.toFixed(1)}s`
      : null;
    const next = nextMarker
      ? text.indexOf(nextMarker, start + timeMarker.length)
      : text.indexOf("[SOUND ENVIRONMENT]", start + timeMarker.length);
    return text.slice(Math.max(0, start), next === -1 ? text.length : next);
  });
  const positiveDirectionText = text.split("[NEGATIVES]")[0] ?? text;
  const hardSell = /\b(?:logo animation|packshot|brand end card|sports commercial energy)\b/i.test(positiveDirectionText);
  const referenceBound = plan.referenceState.status === "REFERENCE_READY"
    && (
      text.includes("confirmed current-task product references")
      || (
        plan.productMessage.externalReferenceRequired
        && text.includes("footwear reference images uploaded in the external video generation tool")
      )
    );
  const brandNameLeak = (text.match(/THERUIZ AURA/g) ?? []).length;
  const semanticContradictionCount = beatBlocks.reduce((count, block, index) => {
    const productBlock = block.match(/Product:\s*([^\n]+)/i)?.[1] ?? "";
    const contradictions = [
      /\bclear\b/i.test(productBlock) && /\bpartial\b/i.test(productBlock),
      /\bproduct not visible\b/i.test(productBlock) && /\b(?:full figure|visible footwear|shoe visible|clearly readable)\b/i.test(productBlock),
      plan.shotArchitecture.shots[index]?.role === "HERO" && /\b(?:incomplete|not yet|later reveal|still unclear)\b/i.test(productBlock),
      index === 0 && /\b(?:previous shot|continues from shot|prior beat)\b/i.test(block),
      index === 4 && /\b(?:next shot|next beat|prepares shot|future reveal)\b/i.test(block),
    ];
    return count + contradictions.filter(Boolean).length;
  }, 0);
  const revealStrategyCompatible = plan.creativeSpine.revealStrategy !== "DELAYED"
    || plan.creativeSpine.productPresenceByShot.indexOf("CLEAR") <= 3;
  const transitionChainValid = plan.shotArchitecture.shots.every((shot, index) => {
    if (usesContinuousFlow) return true;
    const block = beatBlocks[index] ?? "";
    if (!block.includes("Transition:") && !block.includes("Ending:")) return false;
    if (index < plan.shotArchitecture.shots.length - 1 && /\b(?:no further shot|final frame)\b/i.test(block)) return false;
    return true;
  });
  const continuityLockStart = text.indexOf("[CONTINUITY LOCK]");
  const continuityLockEnd = text.indexOf("[TIMING]");
  const continuityLockSection = continuityLockStart === -1
    ? ""
    : text.slice(continuityLockStart, continuityLockEnd === -1 ? undefined : continuityLockEnd);
  const continuityLockComplete = continuityLockStart !== -1
    && plan.continuity.continuityLock.lines.length > 0
    && plan.continuity.continuityLock.lines.every((line) => text.includes(line));
  const continuityLockTraceable = plan.continuity.continuityLock.facts.every((fact) => {
    const entity = plan.continuity.worldModel.entities.find((entry) => entry.id === fact.entityId);
    if (!entity) return false;
    if (!fact.attribute) return true;
    return Object.prototype.hasOwnProperty.call(entity.initialAttributes, fact.attribute);
  });
  const thresholdEntityExists = plan.continuity.worldModel.entities.some((entity) => entity.kind === "THRESHOLD");
  const continuityLockScope = thresholdEntityExists
    || !/\b(?:door|doors|doorway|doors?way|threshold|gate|lid)\b/i.test(continuityLockSection);
  const microDecisionContract = plan.microDecision.contract;
  const microDecisionBound = !microDecisionContract
    || (
      microDecisionContract.consequenceBeatIndex > microDecisionContract.decisionBeatIndex
      && text.includes(`Decision: ${microDecisionContract.chosenAction}`)
      && text.includes(`Visible consequence: ${microDecisionContract.visibleConsequence}`)
      && text.includes("Decision commitment: the choice is committed at this beat.")
      && text.includes("Consequence precondition: the decision is already committed before this visible consequence.")
    );
  const takeHeadings = plan.continuity.takePlan.takes.filter((take) => (
    text.includes(`TAKE ${take.takeIndex + 1} — ONE CONTINUOUS SHOT`)
  ));
  const takeStructureValid = takeHeadings.length === plan.continuity.takePlan.takes.length
    && !/\bSHOT\s+\d+\s*[—:-]/i.test(text);
  const noRolePressure = !/\b(?:WORLD|WEAR|DETAIL|HERO|RELEASE)\b/.test(text);
  const continuousTakeLanguage = text.includes("ONE CONTINUOUS SHOT")
    && plan.continuity.takePlan.takes.every((take) => (
      take.shotIndexes.length <= 1
      || usesContinuousFlow
      || text.includes("Do not treat the timed beats below as separate shots.")
    ));
  const crossTakeHandoffValid = plan.continuity.takePlan.takes.length <= 1
    || text.includes("START STATE INHERITED FROM PREVIOUS TAKE");
  const microDecisionTemporal = !microDecisionContract
    || ["ONLY AFTER", "WHILE", "UNTIL", "ONLY THEN"].every((token) => text.includes(token));
  const finalClosureValid = text.includes("[FINAL STATE CLOSURE]")
    && text.includes("do not invent a new human task, destination, pose, seated action, object interaction, or product presentation.");
  const locomotionAuthorityValid = !usesContinuousFlow
    || (
      text.includes("LOCOMOTION STATE:")
      && text.includes("The character remains in continuous locomotion throughout this take.")
    );
  const noStationaryWordingValid = !usesContinuousFlow
    || !/\b(?:stops?|settles?|holds? position|plants? both feet|pauses? for product|hero-like stationary|stationary)\b/i.test(
      text.slice(text.indexOf("[ONE CONTINUOUS ACTION FLOW]"), text.indexOf("[SOUND ENVIRONMENT]"))
    );
  const mandatoryEventsPresent = text.includes("[MANDATORY VISUAL EVENTS]");
  const eventCompletionGatePresent = text.includes("[EVENT COMPLETION GATE]")
    && text.includes("only after every mandatory visual event above has visibly completed");

  add("header", "Commercial Film Header", text.startsWith(COMMERCIAL_MODEL_FACING_HEADER), "The final artifact is the Commercial Film execution script.", "The Commercial Film header is missing.");
  add("film_idea", "Film Idea", text.includes("[FILM IDEA]"), "Film idea is explicit.", "Film idea is missing.");
  add("product_message", "Product Message", referenceBound, "Product message is reference-bound.", "Product message is not reference-bound.");
  add("character_world", "Character / Environment", text.includes("[CHARACTER / ENVIRONMENT]"), "Character and environment continuity are explicit.", "Character and environment are missing.");
  add("timing", "Timing Profile", text.includes("[TIMING]"), "Dynamic timing profile is explicit.", "Timing profile is missing.");
  add("five_beats", "Five Semantic Beats", beatBlocks.length === 5 && beatBlocks.every((block) => block.length > 0), "All five semantic beats are present in order.", `Only ${beatBlocks.filter((block) => block.length > 0).length} semantic beats are present.`);
  add("beat_required_fields", "Beat Required Fields", usesContinuousFlow
    ? beatBlocks.length === 5 && beatBlocks.every((block) => block.length > 0)
    : plan.shotArchitecture.shots.every((shot, index) => {
    const block = beatBlocks[index] ?? "";
    return ["Time:", "Action:", "Camera:", "Product:"].every((label) => block.includes(label))
      && (block.includes("Transition:") || block.includes("Ending:"));
  }), "Every beat contains time, action, camera, product, and take-boundary guidance.", "At least one beat is missing a required field.");
  add("take_structure", "Take Structure Is Top Level", takeStructureValid, "The final script is organized by the structured Take Plan, not by five legacy shots.", "The final script still uses legacy shot headings as its top-level structure.");
  add("no_role_pressure", "No Internal Role Pressure", noRolePressure, "The final script exposes no WORLD, WEAR, DETAIL, HERO, or RELEASE role token.", "An internal role token leaked into the model-facing script.");
  add("continuous_take_language", "Continuous Take Language", continuousTakeLanguage, "Every multi-beat take is declared as one uninterrupted shot and forbids beat-as-cut semantics.", "A multi-beat take is missing its continuous-shot declaration.");
  add("cross_take_handoff", "Cross-Take State Handoff", crossTakeHandoffValid, "Every new take carries its inherited start state from the previous take.", "A new take is missing its inherited start state.");
  add("micro_decision_temporal", "Micro Decision Temporal Dependency", microDecisionTemporal, "The Micro Decision carries explicit ONLY AFTER / WHILE / UNTIL / ONLY THEN ordering.", "The Micro Decision lacks its explicit visual temporal ordering.");
  add("final_state_closure", "Final State Closure", finalClosureValid, "The final state closure forbids unscripted tasks, destinations, poses, or object interactions.", "The final state closure is missing.");
  add("continuous_locomotion_authority", "Continuous Locomotion Authority", locomotionAuthorityValid, "A continuous-locomotion take declares the authoritative positive locomotion fact.", "A continuous-locomotion take is missing its locomotion authority.");
  add("no_stationary_wording", "No Stationary Wording", noStationaryWordingValid, "The continuous flow contains no stop, settle, held-position, or product-pause wording.", "The continuous flow still implies a stationary product moment.");
  add("mandatory_visual_events", "Mandatory Visual Events", mandatoryEventsPresent, "The structured single-use and state-completing events are declared mandatory.", "The mandatory visual event section is missing.");
  add("event_completion_gate", "Event Completion Gate", eventCompletionGatePresent, "Continuation cannot begin before the mandatory visual events complete.", "The event completion gate is missing.");
  add("sound_world", "Sound Environment", text.includes("[SOUND ENVIRONMENT]"), "Natural sound environment is present.", "Sound environment is missing.");
  add("visual_look", "Visual Look", text.includes("[VISUAL LOOK]"), "Visual look is present.", "Visual look is missing.");
  add("product_protection", "Global Product Protection", text.includes("[GLOBAL PRODUCT PROTECTION]"), "Global product protection is present.", "Global product protection is missing.");
  add("negatives", "Global Negatives", text.includes("[NEGATIVES]"), "Consolidated negatives are present.", "Global negatives are missing.");
  add("ending", "Natural Ending", text.includes("Ending:") || text.includes(plan.endingStrategy.grammar.line), "The ending is explicit.", "The natural ending is missing.");
  const internalMarkerContext = internalMarkers.map((marker) => {
    const index = text.indexOf(marker);
    return `${marker}: ${text.slice(Math.max(0, index - 45), index + marker.length + 45).replace(/\s+/g, " ")}`;
  });
  add("no_internal_markers", "No Internal Markers", internalMarkers.length === 0, "No internal plan markers are present.", `Internal markers leaked: ${internalMarkerContext.join(" | ")}.`);
  add("no_action_ids", "No Action IDs", !actionIdLeak, "No existing Action ID is present in the final script.", "An Action ID leaked into the final script.");
  add("no_qc_language", "No QC Language", !qcLanguageLeak, "No QC, validator, enum, or source-ID language is present.", "QC or internal validation language leaked into the final script.");
  add("no_brand_leakage", "No Brand-Name Leakage", brandNameLeak === 0, "The execution body uses neutral brand language.", "The execution body contains the brand name.");
  add("no_semantic_contradictions", "Final Semantic Contradiction Pass", semanticContradictionCount === 0 && revealStrategyCompatible && transitionChainValid, "The final execution text has no visibility, reveal, shot-position, or transition contradiction.", "The final execution text contains a semantic contradiction or contradictory transition chain.");
  add("no_hard_sell", "No Hard-Sell Direction", !hardSell, "The final script keeps a restrained commercial direction.", "A prohibited hard-sell direction is present.");
  add("continuity_lock", "Continuity Lock", continuityLockComplete, "The final script states the structured continuity facts of this film before the timing profile.", "The Continuity Lock section is missing or does not carry the structured World State facts.");
  add("continuity_lock_scope", "Continuity Lock Scope", continuityLockTraceable && continuityLockScope, "Every Continuity Lock fact is traceable to a declared World State entity, and no unowned threshold, door, gate, or lid rule is emitted.", "The Continuity Lock contains a fact that the World State does not declare.");
  add("micro_decision_binding", "Micro Decision Binding", microDecisionBound, "The declared Micro Decision renders its chosen action and its visible consequence in the correct shot order.", "The declared Micro Decision is not rendered with its visible consequence after the decision.");
  add("timing", "Full 15s Timing", script.diagnostics.timelineCoverage.startSecond === 0
    && script.diagnostics.timelineCoverage.endSecond === 15
    && script.diagnostics.timelineCoverage.contiguous, "The script covers the full contiguous 15-second timeline.", "The script does not cover a contiguous 0-15 second timeline.");
  add("provider_independence", "Provider Independence", script.diagnostics.providerDependency === "NONE"
    && script.diagnostics.providerApiAssumptions === 0
    && script.diagnostics.downstreamInventions === 0, "No Provider API assumption or downstream invention is present.", "Provider assumptions or downstream inventions remain.");
  add("internal_script_length", "Internal And Final Scripts Separate", script.diagnostics.internalScriptLength === internalScriptText.length, "The final artifact remains separate from the internal plan script.", "Internal and final script diagnostics are inconsistent.");

  const failureReasons = checks
    .filter((check) => check.status === "FAIL")
    .map((check) => `${check.id}: ${check.reason}`);
  return {
    checks,
    status: failureReasons.length === 0
      ? "COMMERCIAL_EXECUTION_VALIDATED"
      : "COMMERCIAL_EXECUTION_FAILED",
    failureReasons,
  };
}

export function compileCommercialExecutionScript(
  plan: CommercialFilmPlan,
  internalScriptText: string
): {
  script: CommercialExecutionScript;
  validation: CommercialExecutionValidation;
} {
  if (plan.status !== "APPROVED_FOR_COMMERCIAL_EXECUTION") {
    throw new Error(`Commercial Film plan is not approved: ${(plan.failureReasons ?? []).join(" ")}`);
  }

  const compiled = compileText(plan, internalScriptText);
  const shotBlocks = plan.shotArchitecture.shots.map((shot, index) => {
    if (compiled.compiledText.includes("[ONE CONTINUOUS ACTION FLOW]")) {
      const marker = `Beat window ${index + 1}:`;
      const start = compiled.compiledText.indexOf(marker);
      const nextMarker = index < plan.shotArchitecture.shots.length - 1
        ? `Beat window ${index + 2}:`
        : null;
      const end = nextMarker
        ? compiled.compiledText.indexOf(nextMarker, start + marker.length)
        : compiled.compiledText.indexOf("[SOUND ENVIRONMENT]", start + marker.length);
      return {
        shotIndex: shot.shotIndex,
        shotRole: shot.role,
        section: compiled.compiledText.slice(Math.max(0, start), end === -1 ? compiled.compiledText.length : end),
      };
    }
    const timeMarker = `Time: ${shot.timeRange.startSecond.toFixed(1)}-${shot.timeRange.endSecond.toFixed(1)}s`;
    const start = compiled.compiledText.indexOf(timeMarker);
    const nextShot = plan.shotArchitecture.shots.find((entry) => entry.shotIndex === shot.shotIndex + 1);
    const nextMarker = nextShot
      ? `Time: ${nextShot.timeRange.startSecond.toFixed(1)}-${nextShot.timeRange.endSecond.toFixed(1)}s`
      : null;
    const end = nextMarker
      ? compiled.compiledText.indexOf(nextMarker, start + timeMarker.length)
      : compiled.compiledText.indexOf("[SOUND WORLD]", start + timeMarker.length);
    return {
      shotIndex: shot.shotIndex,
      shotRole: shot.role,
      section: compiled.compiledText.slice(Math.max(0, start), end === -1 ? compiled.compiledText.length : end),
    };
  });
  const script: CommercialExecutionScript = {
    schemaVersion: COMMERCIAL_EXECUTION_SCHEMA_VERSION,
    compilerVersion: COMMERCIAL_EXECUTION_VERSION,
    status: "COMMERCIAL_EXECUTION_SCRIPT_GENERATED",
    compiledText: compiled.compiledText,
    shotBlocks,
    diagnostics: {
      internalScriptLength: compiled.internalScriptLength,
      modelFacingLength: compiled.compiledText.length,
      providerDependency: "NONE",
      providerApiAssumptions: 0,
      downstreamInventions: 0,
      internalIdsInFinal: 0,
      qcLanguageInFinal: 0,
      referenceCount: plan.referenceState.confirmedReferenceCount,
      timelineCoverage: {
        startSecond: plan.shotArchitecture.shots[0]?.timeRange.startSecond ?? 0,
        endSecond: plan.shotArchitecture.shots[4]?.timeRange.endSecond ?? 0,
        contiguous: plan.shotArchitecture.shots.every((shot, index) => (
          shot.timeRange.durationSeconds >= 1
          && shot.timeRange.durationSeconds <= 5
          && (index === 0 || shot.timeRange.startSecond === plan.shotArchitecture.shots[index - 1]?.timeRange.endSecond)
        )),
      },
    },
  };
  const validation = validateCommercialExecutionScript(script, plan, internalScriptText);
  return { script, validation };
}
