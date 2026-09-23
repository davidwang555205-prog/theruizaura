import type {
  CommercialCreativeSpinePlan,
  CommercialDramaticFunction,
  CommercialProductPresenceDesign,
  CommercialShotStorySpine,
} from "../creative-spine/types";
import type { CommercialIntentId } from "../types";
import {
  COMMERCIAL_CREATIVE_MODE_CATALOG,
  COMMERCIAL_EDIT_LOGICS,
  COMMERCIAL_VISUAL_MOTIFS,
} from "./creative-mode-catalog";
import type {
  CommercialCreativeMode,
  CommercialCutMotivation,
  CommercialEditLogic,
  CommercialVisualMotif,
} from "./types";

export type CommercialEditLogicDefinition = {
  id: CommercialEditLogic;
  label: string;
  description: string;
  productionLine: string;
};

export const COMMERCIAL_EDIT_LOGIC_CATALOG: Record<CommercialEditLogic, CommercialEditLogicDefinition> = {
  ACTION_CUT: {
    id: "ACTION_CUT",
    label: "Action Cut",
    description: "Cut while a motivated physical action is still carrying momentum.",
    productionLine: "Cut during the action, then let the next shot inherit the movement rather than starting from rest.",
  },
  MATCH_MOVEMENT: {
    id: "MATCH_MOVEMENT",
    label: "Match Movement",
    description: "Connect shots through compatible direction, body mechanics, or vertical motion.",
    productionLine: "Match direction and body mechanics across the cut while preserving believable geography.",
  },
  SENSORY_INSERT: {
    id: "SENSORY_INSERT",
    label: "Sensory Insert",
    description: "Briefly interrupt the character continuity with an atmosphere or product observation that belongs to the same situation.",
    productionLine: "Use the sensory beat only to deepen time, place, movement, or product perception, then return to the human action.",
  },
  DELAYED_REVEAL: {
    id: "DELAYED_REVEAL",
    label: "Delayed Reveal",
    description: "Delay complete product comprehension while the existing reveal strategy remains commercially readable.",
    productionLine: "Hold back the complete product read temporarily, then reveal it through a motivated visual change.",
  },
};

function editScore(edit: CommercialEditLogic, mode: CommercialCreativeMode, revealStrategy: CommercialCreativeSpinePlan["revealStrategy"]) {
  const modeDefinition = COMMERCIAL_CREATIVE_MODE_CATALOG[mode];
  let score = modeDefinition.editAffinity.includes(edit) ? 5 : 0;
  if (revealStrategy === "DELAYED" && edit === "DELAYED_REVEAL") score += 6;
  if (revealStrategy === "PROGRESSIVE" && (edit === "MATCH_MOVEMENT" || edit === "ACTION_CUT")) score += 3;
  if (revealStrategy === "IMMEDIATE" && edit === "ACTION_CUT") score += 4;
  if (mode === "SENSORY_LIFE" && edit === "SENSORY_INSERT") score += 4;
  if (mode === "CITY_JOURNEY" && edit === "MATCH_MOVEMENT") score += 4;
  if (mode === "EVERYDAY_MOVEMENT" && edit === "ACTION_CUT") score += 4;
  return score;
}

export function selectEditLogics(input: {
  creativeMode: CommercialCreativeMode;
  revealStrategy: CommercialCreativeSpinePlan["revealStrategy"];
  generationNonce: number;
  primaryOverride?: CommercialEditLogic;
  secondaryOverride?: CommercialEditLogic | null;
}) {
  const ranked = COMMERCIAL_EDIT_LOGICS
    .map((edit, order) => ({
      edit,
      order,
      score: editScore(edit, input.creativeMode, input.revealStrategy),
    }))
    .sort((first, second) => second.score - first.score || first.order - second.order)
    .map((entry) => entry.edit);
  const primary = input.primaryOverride ?? ranked[(input.generationNonce % 2)];
  const secondaryPool = ranked.filter((edit) => edit !== primary);
  const secondary = input.secondaryOverride === null
    ? null
    : input.secondaryOverride
      ?? secondaryPool[(Math.floor(input.generationNonce / 2) % Math.min(2, secondaryPool.length))];
  return {
    primaryEditLogic: primary,
    secondaryEditLogic: secondary === primary ? null : secondary,
  };
}

function motifScore(
  motif: CommercialVisualMotif,
  input: {
    intent: CommercialIntentId;
    mode: CommercialCreativeMode;
    situationId: CommercialCreativeSpinePlan["humanSituation"]["id"];
    desireId: CommercialCreativeSpinePlan["audienceDesire"]["id"];
    revealStrategy: CommercialCreativeSpinePlan["revealStrategy"];
  }
) {
  const mode = COMMERCIAL_CREATIVE_MODE_CATALOG[input.mode];
  let score = mode.motifAffinity.includes(motif) ? 5 : 0;
  if (input.situationId === "LEAVING_HOME" || input.situationId === "RETURNING_HOME") {
    if (motif === "THRESHOLD") score += 4;
  }
  if (input.situationId === "TAKING_A_SHORT_PAUSE" || input.desireId === "QUIET_REFINEMENT") {
    if (motif === "LIGHT" || motif === "SHADOW") score += 3;
  }
  if (input.intent === "URBAN_MOTION" && motif === "REFLECTION") score += 3;
  if (input.intent === "PRODUCT_CRAFT" && motif === "LIGHT") score += 2;
  if (input.intent === "DAILY_STYLING" && motif === "THRESHOLD") score += 2;
  if (input.revealStrategy === "DELAYED" && motif === "SHADOW") score += 2;
  return score;
}

export function selectVisualMotif(input: {
  intent: CommercialIntentId;
  mode: CommercialCreativeMode;
  creativeSpine: CommercialCreativeSpinePlan;
  generationNonce: number;
  override?: CommercialVisualMotif | null;
}) {
  if (input.override !== undefined) return input.override;
  if (input.generationNonce % 4 === 3 && input.mode !== "SINGLE_IDEA" && input.mode !== "SENSORY_LIFE") {
    return null;
  }
  const ranked = COMMERCIAL_VISUAL_MOTIFS
    .map((motif, order) => ({
      motif,
      order,
      score: motifScore(motif, {
        intent: input.intent,
        mode: input.mode,
        situationId: input.creativeSpine.humanSituation.id,
        desireId: input.creativeSpine.audienceDesire.id,
        revealStrategy: input.creativeSpine.revealStrategy,
      }),
    }))
    .sort((first, second) => second.score - first.score || first.order - second.order);
  return ranked[input.generationNonce % Math.min(2, ranked.length)]?.motif ?? ranked[0]?.motif ?? null;
}

export function cutMotivationFor(input: {
  shotIndex: number;
  dramaticFunction: CommercialDramaticFunction;
  presence: CommercialProductPresenceDesign;
  primaryEditLogic: CommercialEditLogic;
}): CommercialCutMotivation {
  if (input.shotIndex === 0) return "SPATIAL_TRANSITION";
  if (input.dramaticFunction === "RESOLVE") return "EMOTIONAL_RELEASE";
  if (input.primaryEditLogic === "DELAYED_REVEAL" && input.presence === "CLEAR") return "PRODUCT_DISCOVERY";
  if (input.primaryEditLogic === "MATCH_MOVEMENT") return "VISUAL_MATCH";
  if (input.primaryEditLogic === "SENSORY_INSERT") return "ATTENTION_SHIFT";
  if (input.dramaticFunction === "DISCOVER") return "PRODUCT_DISCOVERY";
  if (input.dramaticFunction === "CONFIRM") return "ACTION_CONTINUATION";
  return "ACTION_COMPLETION";
}

export function editEntryLine(edit: CommercialEditLogic, shot: CommercialShotStorySpine) {
  switch (edit) {
    case "ACTION_CUT":
      return `Enter while the ${shot.shotRole.toLowerCase()} action is still carrying momentum.`;
    case "MATCH_MOVEMENT":
      return `Pick up the same direction or body mechanics carried from the previous shot.`;
    case "SENSORY_INSERT":
      return `Enter through one sensory observation that belongs to the same ${shot.shotRole.toLowerCase()} moment.`;
    case "DELAYED_REVEAL":
      return `Enter without revealing more product information than the current beat needs.`;
  }
}

export function editExitLine(input: {
  edit: CommercialEditLogic;
  shot: CommercialShotStorySpine;
  nextShot?: CommercialShotStorySpine;
}) {
  const next = input.nextShot?.shotRole.toLowerCase() ?? "the release";
  switch (input.edit) {
    case "ACTION_CUT":
      return `Leave as the action reaches its natural completion so ${next} inherits the movement.`;
    case "MATCH_MOVEMENT":
      return `Leave on a directional or body-mechanical match that continues into ${next}.`;
    case "SENSORY_INSERT":
      return `Return from the sensory observation into the same human action before ${next}.`;
    case "DELAYED_REVEAL":
      return `Exit with product understanding still incomplete until the reveal beat.`;
  }
}

export function visualMotifContribution(motif: CommercialVisualMotif | null, shotRole: string, shotIndex: number) {
  if (!motif) return null;
  const contributions: Record<CommercialVisualMotif, string> = {
    THRESHOLD: `Use one real doorway, edge, or crossing point to quietly connect this ${shotRole.toLowerCase()} beat to the next.`,
    LIGHT: `Let the existing light direction reveal the same human and product continuity across this ${shotRole.toLowerCase()} beat.`,
    REFLECTION: `Use one physical reflection already present in the world without turning it into an effect.`,
    SHADOW: `Use a real shadow or light falloff to preserve privacy and continuity in this ${shotRole.toLowerCase()} beat.`,
    LINE: `Reuse one spatial line from the same world to keep the ${shotRole.toLowerCase()} composition connected.`,
    REPETITION: `Repeat one restrained frame or movement relationship while changing only the ordinary situation.`,
  };
  return `${contributions[motif]} Beat ${shotIndex + 1} contributes one part of the same visual idea, not a symbol.`;
}

export function viewerAttentionTarget(
  dramaticFunction: CommercialDramaticFunction,
  presence: CommercialProductPresenceDesign
) {
  if (presence === "ABSENT") return "The viewer should notice the human situation and spatial change, not search for the product.";
  if (presence === "IMPLIED") return "The viewer should sense the product through context while the action remains primary.";
  if (presence === "PARTIAL") return "The viewer should notice a partial product signal without being asked to inspect it.";
  if (dramaticFunction === "DISCOVER") return "The viewer should notice the product through the performed reality of the moment.";
  if (dramaticFunction === "CONFIRM" || dramaticFunction === "RESOLVE") {
    return "The viewer should understand the worn product's role through composition, movement, and context.";
  }
  return "The viewer should stay with the person and environment while the product remains naturally present.";
}
