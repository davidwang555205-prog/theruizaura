import type { CommercialCreativeSpinePlan } from "../creative-spine/types";
import type { CommercialActionPlanItem, CommercialIntentId } from "../types";
import {
  COMMERCIAL_CREATIVE_MODE_CATALOG,
} from "./creative-mode-catalog";
import { COMMERCIAL_CAMERA_BEHAVIOR_CATALOG } from "./camera-behavior";
import { COMMERCIAL_EDIT_LOGIC_CATALOG } from "./edit-logic";
import type {
  CommercialCameraBehavior,
  CommercialCutMotivation,
  CommercialCreativeMode,
  CommercialEditLogic,
  CommercialVisualMotif,
} from "./types";

function modeScore(
  mode: CommercialCreativeMode,
  input: {
    intent: CommercialIntentId;
    creativeSpine: CommercialCreativeSpinePlan;
  }
) {
  const definition = COMMERCIAL_CREATIVE_MODE_CATALOG[mode];
  let score = 0;
  if (definition.compatibleSituations.includes(input.creativeSpine.humanSituation.id)) score += 5;
  if (definition.compatibleDesires.includes(input.creativeSpine.audienceDesire.id)) score += 4;
  if (definition.compatibleReveals.includes(input.creativeSpine.revealStrategy)) score += 3;
  if (input.intent === "URBAN_MOTION" && (mode === "CITY_JOURNEY" || mode === "EVERYDAY_MOVEMENT" || mode === "SINGLE_IDEA")) score += 4;
  if (input.intent === "DAILY_STYLING" && (mode === "PRIVATE_MOMENT" || mode === "STATE_TRANSITION" || mode === "EVERYDAY_MOVEMENT")) score += 4;
  if (input.intent === "QUIET_LUXURY" && (mode === "PRIVATE_MOMENT" || mode === "SENSORY_LIFE" || mode === "STATE_TRANSITION")) score += 4;
  if (input.intent === "PRODUCT_CRAFT" && (mode === "SENSORY_LIFE" || mode === "PRIVATE_MOMENT" || mode === "SINGLE_IDEA")) score += 4;
  if (input.intent === "NEW_ARRIVAL" && (mode === "CITY_JOURNEY" || mode === "STATE_TRANSITION" || mode === "SINGLE_IDEA")) score += 4;
  return score;
}

export function rankCreativeModes(input: {
  intent: CommercialIntentId;
  creativeSpine: CommercialCreativeSpinePlan;
  generationNonce: number;
  override?: CommercialCreativeMode;
}) {
  if (input.override) return [input.override];
  const ranked = (Object.keys(COMMERCIAL_CREATIVE_MODE_CATALOG) as CommercialCreativeMode[])
    .map((mode, order) => ({
      mode,
      order,
      score: modeScore(mode, {
        intent: input.intent,
        creativeSpine: input.creativeSpine,
      }),
    }))
    .sort((first, second) => second.score - first.score || first.order - second.order);
  const top = ranked.slice(0, 3);
  const rotated = [
    ...top.slice(input.generationNonce % top.length),
    ...top.slice(0, input.generationNonce % top.length),
  ].map((entry) => entry.mode);
  const remaining = ranked.slice(3).map((entry) => entry.mode);
  return [...rotated, ...remaining];
}

export function selectCreativeMode(input: {
  intent: CommercialIntentId;
  creativeSpine: CommercialCreativeSpinePlan;
  generationNonce: number;
  override?: CommercialCreativeMode;
}) {
  return rankCreativeModes(input)[0];
}

export function cameraNarrativeReason(input: {
  behavior: CommercialCameraBehavior;
  creativeMode: CommercialCreativeMode;
  dramaticFunction: string;
  presence: string;
}) {
  const reasonByBehavior: Record<CommercialCameraBehavior, string> = {
    OBSERVE: "The person behaves independently while the camera stays at a natural observational distance.",
    FOLLOW: "The camera participates in the movement at human scale without centering a fashion walk.",
    WAIT: "The frame already exists before the action, allowing the person to enter and leave naturally.",
    DISCOVER: "The camera reveals information through movement and framing rather than a display gesture.",
    PASS_BY: "The person crosses the camera's visual space to create depth and natural movement energy.",
    GROUND_OBSERVATION: "The frame observes real weight, stride, stop, or ground contact without becoming a shoe showcase.",
    DETAIL_INTERRUPTION: "One short detail interrupts the wider human continuity and belongs to the same real action.",
    WITHHOLD: "The camera intentionally delays complete product comprehension while the commercial stays readable.",
    REVEAL: "A motivated visual change makes the previously partial product clearly readable.",
  };
  return `${reasonByBehavior[input.behavior]} In ${input.creativeMode}, this supports the ${input.dramaticFunction.toLowerCase()} beat and the product's ${input.presence.toLowerCase()} presence.`;
}

export function movementContinuityLine(input: {
  shotIndex: number;
  action: CommercialActionPlanItem;
  previousAction?: CommercialActionPlanItem;
}) {
  const source = input.action.sourceActionId
    ? `the reused ${input.action.sourceActionFamily} mechanics`
    : "the commercial-only body mechanics";
  if (input.shotIndex === 0) {
    return `Start with ${source}. Keep weight placement and travel direction readable so the next shot can inherit the physical state.`;
  }
  return `Continue from ${input.previousAction?.movementPhase ?? "the previous physical phase"} into ${input.action.movementPhase}; preserve body direction, weight, and threshold logic across the cut.`;
}

export function modeDirectingPrinciple(mode: CommercialCreativeMode) {
  return COMMERCIAL_CREATIVE_MODE_CATALOG[mode].directingPrinciple;
}

export function renderCameraBehaviorDirection(behavior: CommercialCameraBehavior) {
  return COMMERCIAL_CAMERA_BEHAVIOR_CATALOG[behavior].productionLine;
}

export function renderEditLogicDirection(edit: CommercialEditLogic) {
  return COMMERCIAL_EDIT_LOGIC_CATALOG[edit].productionLine;
}

export function renderCutMotivationDirection(motivation: CommercialCutMotivation) {
  const directions: Record<CommercialCutMotivation, string> = {
    ACTION_COMPLETION: "The cut arrives as the current physical action completes.",
    ACTION_CONTINUATION: "The cut carries the current physical action into the next shot.",
    VISUAL_MATCH: "The cut follows a compatible direction or body movement from the previous shot.",
    ATTENTION_SHIFT: "The cut follows a deliberate shift in what the viewer should notice.",
    SPATIAL_TRANSITION: "The cut moves into the next part of the same believable place.",
    PRODUCT_DISCOVERY: "The cut follows new, reference-supported product information.",
    EMOTIONAL_RELEASE: "The cut releases the film into its final state rather than starting a new beat.",
  };
  return directions[motivation];
}

export function renderVisualMotifDirection(
  motif: CommercialVisualMotif | null,
  contribution: string | null
) {
  if (!motif || !contribution) return null;
  return contribution;
}
