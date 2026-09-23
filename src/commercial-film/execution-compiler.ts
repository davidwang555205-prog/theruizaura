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
  modeDirectingPrinciple,
  renderCameraBehaviorDirection,
  renderCutMotivationDirection,
  renderEditLogicDirection,
  renderVisualMotifDirection,
} from "./creative-direction";

export const COMMERCIAL_MODEL_FACING_HEADER =
  "SEEDANCE — COMMERCIAL FILM" as const;

const INTERNAL_MARKERS = [
  "[COMMERCIAL PLAN]",
  "[SHOT PLAN]",
  "[CAMERA PLAN]",
  "[SOUND PLAN]",
  "[REFERENCE STATE]",
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
  const directorShot = plan.directorConcept.shots[shotIndex];
  if (!shot) return "No product requirement is issued for this shot.";
  const dimension = dimensionOf(plan, shot.productMessageDimension);
  const presenceDirection = renderProductPresenceDirection(shot.storySpine.productPresenceDesign);
  if (shot.storySpine.productPresenceDesign === "ABSENT") {
    return `${presenceDirection} Keep the human situation continuous with the rest of the film.`;
  }
  if (plan.productMessage.externalReferenceRequired) {
    return `${presenceDirection} Use the footwear reference images uploaded in the external video generation tool as the only source of truth for the product. Do not invent or alter product details not supported by those references.`;
  }
  if (shot.role === "WORLD" || shot.role === "RELEASE") {
    return `${presenceDirection} The product remains part of the person's real clothing and movement. Do not force a product-only frame.`;
  }
  if (!dimension) {
    return "Preserve the current confirmed product reference only where it naturally appears in the frame.";
  }
  if (shot.role === "DETAIL") {
    return `${presenceDirection} ${dimension.detailMessage} Keep the detail inside the real worn-product relationship.`;
  }
  if (shot.role === "HERO") {
    return `${presenceDirection} ${dimension.message} ${directorShot.heroConvergence ?? "Keep the hero moment worn, grounded, and at natural human scale."}`;
  }
  return `${presenceDirection} ${dimension.message} Keep at least one shoe readable toe-to-heel without changing the action.`;
}

function compactProductLine(plan: CommercialFilmPlan, shotIndex: number) {
  const shot = plan.shotArchitecture.shots[shotIndex];
  const presence = shot.storySpine.productPresenceDesign;
  const dimension = dimensionOf(plan, shot.productMessageDimension);
  if (presence === "ABSENT") {
    return "Product not visible; crop, foreground, seating, or occlusion must physically prevent footwear exposure.";
  }
  if (plan.productMessage.externalReferenceRequired) {
    if (shot.role === "DETAIL") {
      return `Observe the ${shot.event.productDetailRelationship ?? "selected reference-supported product relationship"} from the external footwear references through natural use; do not default to a full-shoe close-up.`;
    }
    const visibility: Record<string, string> = {
      IMPLIED: "Product implied through context; no readable product view required.",
      PARTIAL: "Product partial and secondary; keep the human action primary.",
      SECONDARY: "Product secondary within the worn look.",
      CLEAR: "Product clear within the worn look at natural human scale.",
    };
    return visibility[presence] ?? "Product remains reference-bound to the external footwear uploads.";
  }
  if (shot.role === "DETAIL") {
    return `Observe the ${shot.event.productDetailRelationship ?? dimension?.label ?? "confirmed reference relationship"} in the worn-action frame.`;
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

function compileText(plan: CommercialFilmPlan, internalScriptText: string) {
  const lines: string[] = [];
  lines.push(COMMERCIAL_MODEL_FACING_HEADER);
  lines.push(`${plan.duration} seconds · one person · one continuous commercial idea`);
  lines.push("");
  lines.push("[FILM IDEA]");
  lines.push(plan.creativeSpine.premise.text);
  lines.push(plan.eventSpine.centralEvent);
  lines.push(`Cinematic rule: ${plan.directorConcept.globalRule}`);
  lines.push("");
  lines.push("[CHARACTER / WORLD]");
  lines.push(`Age: ${plan.character.resolved.ageProfile ? `${plan.character.resolved.ageProfile.ageMin}-${plan.character.resolved.ageProfile.ageMax}` : "as selected"}`);
  lines.push(`Visible appearance: ${plan.character.resolved.appearanceGroup?.label ?? "as selected"}`);
  lines.push(`World: ${plan.sceneWorld.sceneNames.join(" → ")} · ${plan.season}`);
  lines.push("One primary character. Background life may remain distant and secondary. Natural expression, task-driven movement, no performance toward camera, same person and wardrobe throughout.");
  lines.push("");
  lines.push("[TIMING]");
  plan.shotArchitecture.shots.forEach((shot) => {
    lines.push(`Shot ${shot.shotIndex + 1}: ${shot.timeRange.startSecond.toFixed(1)}-${shot.timeRange.endSecond.toFixed(1)}s`);
  });
  lines.push("");

  plan.shotArchitecture.shots.forEach((shot) => {
    lines.push(`SHOT ${shot.shotIndex + 1} — ${shot.role}`);
    lines.push(`Time: ${shot.timeRange.startSecond.toFixed(1)}-${shot.timeRange.endSecond.toFixed(1)}s`);
    lines.push(`Action: ${shot.action.physicalActionLine}`);
    const directorShot = plan.directorConcept.shots[shot.shotIndex];
    lines.push(`Camera: ${shot.camera.framing}; ${naturalCameraHeight(shot.camera.cameraHeight)}; ${naturalCameraMovement(shot.camera.movement)}. ${renderCameraBehaviorDirection(shot.direction.cameraBehavior)} ${shot.camera.movementLine} ${directorShot.conceptRule}`);
    lines.push(`Product: ${compactProductLine(plan, shot.shotIndex)}`);
    if (shot.shotIndex === plan.shotArchitecture.shots.length - 1) {
      lines.push(`Transition: ${renderCutMotivationDirection(shot.direction.cutMotivation)}`);
      lines.push(`Ending: ${plan.endingStrategy.grammar.line} ${directorShot.releaseConvergence ?? plan.directorConcept.releaseRule}`);
    } else {
      lines.push(`Transition: ${renderCutMotivationDirection(shot.direction.cutMotivation)} ${shot.direction.editExit}`);
    }
    lines.push("");
  });

  lines.push("[SOUND WORLD]");
  const soundCues = [...new Set(plan.soundPlan.shots.flatMap((shot) => shot.cues))].slice(0, 3);
  lines.push(`Context: ${plan.soundPlan.context}.`);
  lines.push(`Sound: ${soundCues.join("; ")}.`);
  lines.push("No dialogue, no voiceover, no music unless explicitly requested.");
  lines.push("");
  lines.push("[VISUAL LOOK]");
  lines.push("Natural light, restrained saturation, realistic skin, matte non-glossy finish, soft controlled contrast.");
  lines.push("The environment may use a restrained warm-neutral grade, but the footwear must remain faithful to the external reference in hue, saturation, contrast, and visible material appearance.");
  lines.push(plan.worldRealism.line);
  lines.push("Allow controlled observational imperfection: slight occlusion, subject entering slightly late, off-center framing, and the camera staying after the subject leaves.");
  if (plan.creativeDirection.visualMotif) {
    const motifLine = renderVisualMotifDirection(
      plan.creativeDirection.visualMotif,
      plan.creativeDirection.shotDirections[0]?.visualMotifContribution
    );
    if (motifLine) lines.push(motifLine);
  }
  lines.push("");
  lines.push("[GLOBAL PRODUCT PROTECTION]");
  if (plan.productMessage.externalReferenceRequired) {
    lines.push("Use the footwear reference images uploaded in the external video generation tool as the only source of truth for the product. Do not invent or alter product details not supported by those references.");
  } else {
    lines.push("Use the confirmed current-task product references as the only source of product truth.");
  }
  lines.push("Preserve silhouette, proportions, visible material and color relationships, outsole/upper/tongue/lace relationships, and grounded foot-to-shoe scale.");
  lines.push("Do not invent product facts, logos, materials, colors, panel geometry, or construction. Do not recolor, reshape, stretch, compress, or deform the product through pose, garment, or camera.");
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
  const shotBlocks = plan.shotArchitecture.shots.filter((shot) => text.includes(`SHOT ${shot.shotIndex + 1} — ${shot.role}`));
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
  const shotTexts = plan.shotArchitecture.shots.map((shot) => {
    const start = text.indexOf(`SHOT ${shot.shotIndex + 1} — ${shot.role}`);
    const next = text.indexOf(`SHOT ${shot.shotIndex + 2} — `, start);
    return text.slice(start, next === -1 ? text.indexOf("[SOUND WORLD]") : next);
  });
  const semanticContradictionCount = shotTexts.reduce((count, block, index) => {
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
    const block = shotTexts[index] ?? "";
    if (!block.includes("Transition:")) return false;
    if (index < plan.shotArchitecture.shots.length - 1 && /\b(?:no further shot|final frame)\b/i.test(block)) return false;
    return true;
  });

  add("header", "Commercial Film Header", text.startsWith(COMMERCIAL_MODEL_FACING_HEADER), "The final artifact is the Commercial Film execution script.", "The Commercial Film header is missing.");
  add("film_idea", "Film Idea", text.includes("[FILM IDEA]"), "Film idea is explicit.", "Film idea is missing.");
  add("product_message", "Product Message", referenceBound, "Product message is reference-bound.", "Product message is not reference-bound.");
  add("character_world", "Character / World", text.includes("[CHARACTER / WORLD]"), "Character and world continuity are explicit.", "Character and world are missing.");
  add("timing", "Timing Profile", text.includes("[TIMING]"), "Dynamic timing profile is explicit.", "Timing profile is missing.");
  add("five_shots", "Five Semantic Shots", shotBlocks.length === 5, "All five semantic shots are present in order.", `Only ${shotBlocks.length} semantic shots are present.`);
  add("shot_required_fields", "Shot Required Fields", plan.shotArchitecture.shots.every((shot) => {
    const start = text.indexOf(`SHOT ${shot.shotIndex + 1} — ${shot.role}`);
    const next = text.indexOf(`SHOT ${shot.shotIndex + 2} — `, start);
    const block = text.slice(start, next === -1 ? text.indexOf("[SOUND WORLD]") : next);
    return ["Time:", "Action:", "Camera:", "Product:", "Transition:"].every((label) => block.includes(label));
  }), "Every shot contains time, action, camera, product, and transition guidance.", "At least one shot is missing a required field.");
  add("sound_world", "Sound World", text.includes("[SOUND WORLD]"), "Natural sound world is present.", "Sound world is missing.");
  add("visual_look", "Visual Look", text.includes("[VISUAL LOOK]"), "Visual look is present.", "Visual look is missing.");
  add("product_protection", "Global Product Protection", text.includes("[GLOBAL PRODUCT PROTECTION]"), "Global product protection is present.", "Global product protection is missing.");
  add("negatives", "Global Negatives", text.includes("[NEGATIVES]"), "Consolidated negatives are present.", "Global negatives are missing.");
  add("ending", "Natural Ending", text.includes("Ending:"), "The ending is explicit in the release shot.", "The natural ending is missing.");
  add("no_internal_markers", "No Internal Markers", internalMarkers.length === 0, "No internal plan markers are present.", `Internal markers leaked: ${internalMarkers.join(", ")}.`);
  add("no_action_ids", "No Action IDs", !actionIdLeak, "No existing Action ID is present in the final script.", "An Action ID leaked into the final script.");
  add("no_qc_language", "No QC Language", !qcLanguageLeak, "No QC, validator, enum, or source-ID language is present.", "QC or internal validation language leaked into the final script.");
  add("no_brand_leakage", "No Brand-Name Leakage", brandNameLeak === 0, "The execution body uses neutral brand language.", "The execution body contains the brand name.");
  add("no_semantic_contradictions", "Final Semantic Contradiction Pass", semanticContradictionCount === 0 && revealStrategyCompatible && transitionChainValid, "The final execution text has no visibility, reveal, shot-position, or transition contradiction.", "The final execution text contains a semantic contradiction or contradictory transition chain.");
  add("no_hard_sell", "No Hard-Sell Direction", !hardSell, "The final script keeps a restrained commercial direction.", "A prohibited hard-sell direction is present.");
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
  const shotBlocks = plan.shotArchitecture.shots.map((shot) => {
    const start = compiled.compiledText.indexOf(`[SHOT ${shot.shotIndex + 1} — ${shot.role}]`);
    const next = compiled.compiledText.indexOf(`[SHOT ${shot.shotIndex + 2} — `, start);
    const end = next === -1 ? compiled.compiledText.indexOf("[GLOBAL PRODUCT PROTECTION]") : next;
    return {
      shotIndex: shot.shotIndex,
      shotRole: shot.role,
      section: compiled.compiledText.slice(start, end),
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
