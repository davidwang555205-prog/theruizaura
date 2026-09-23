import type {
  CommercialDramaticFunction,
  CommercialProductPresenceDesign,
} from "../creative-spine/types";
import type { CommercialShotRole } from "../types";
import {
  COMMERCIAL_CAMERA_BEHAVIORS,
  COMMERCIAL_CREATIVE_MODE_CATALOG,
} from "./creative-mode-catalog";
import type {
  CommercialCameraBehavior,
  CommercialCreativeMode,
} from "./types";

export type CommercialCameraBehaviorDefinition = {
  id: CommercialCameraBehavior;
  label: string;
  description: string;
  productionLine: string;
  functionAffinity: CommercialDramaticFunction[];
  presenceAffinity: CommercialProductPresenceDesign[];
};

export const COMMERCIAL_CAMERA_BEHAVIOR_CATALOG: Record<
  CommercialCameraBehavior,
  CommercialCameraBehaviorDefinition
> = {
  OBSERVE: {
    id: "OBSERVE",
    label: "Observe",
    description: "The camera remains largely independent while the person enters, crosses, or acts without acknowledging it.",
    productionLine: "Keep a natural observational distance and let the person behave independently of the camera.",
    functionAffinity: ["ESTABLISH", "INVITE", "DISCOVER", "CONFIRM", "RESOLVE"],
    presenceAffinity: ["ABSENT", "SECONDARY", "PARTIAL", "CLEAR"],
  },
  FOLLOW: {
    id: "FOLLOW",
    label: "Follow",
    description: "The camera moves with the subject at human scale without becoming a centered fashion track.",
    productionLine: "Follow softly from the side or rear three-quarter, keeping the distance human and unpresentational.",
    functionAffinity: ["INVITE", "DISCOVER", "CONFIRM", "RESOLVE"],
    presenceAffinity: ["SECONDARY", "CLEAR"],
  },
  WAIT: {
    id: "WAIT",
    label: "Wait",
    description: "The frame exists before the action and remains as the person enters, acts, or leaves.",
    productionLine: "Establish the frame first, then let the person enter, complete the action, and leave naturally.",
    functionAffinity: ["ESTABLISH", "INVITE", "RESOLVE"],
    presenceAffinity: ["ABSENT", "IMPLIED", "SECONDARY"],
  },
  DISCOVER: {
    id: "DISCOVER",
    label: "Discover",
    description: "Camera or edit reveals the product gradually through motivated movement and framing.",
    productionLine: "Let the product become clearer through movement, light, a turn, or a threshold rather than a presentation gesture.",
    functionAffinity: ["INVITE", "DISCOVER", "CONFIRM"],
    presenceAffinity: ["IMPLIED", "PARTIAL", "SECONDARY", "CLEAR"],
  },
  PASS_BY: {
    id: "PASS_BY",
    label: "Pass By",
    description: "The person crosses or passes near the camera, creating depth without performing inside a centered frame.",
    productionLine: "Let the person pass through the visual space, using depth and a natural foreground relationship.",
    functionAffinity: ["INVITE", "DISCOVER", "RESOLVE"],
    presenceAffinity: ["ABSENT", "IMPLIED", "PARTIAL", "SECONDARY"],
  },
  GROUND_OBSERVATION: {
    id: "GROUND_OBSERVATION",
    label: "Ground Observation",
    description: "A low but natural view observes real foot-ground contact, weight shift, stride, or stopping mechanics.",
    productionLine: "Observe the real relationship between foot, ground, stride, and weight without turning it into a beauty shot.",
    functionAffinity: ["DISCOVER", "CONFIRM"],
    presenceAffinity: ["PARTIAL", "CLEAR"],
  },
  DETAIL_INTERRUPTION: {
    id: "DETAIL_INTERRUPTION",
    label: "Detail Interruption",
    description: "A short reference-supported detail interrupts the wider human continuity before returning to it.",
    productionLine: "Use one short detail to interrupt the wider action, then return to the human situation without becoming a product beauty shot.",
    functionAffinity: ["DISCOVER", "CONFIRM"],
    presenceAffinity: ["PARTIAL", "CLEAR"],
  },
  WITHHOLD: {
    id: "WITHHOLD",
    label: "Withhold",
    description: "The camera intentionally avoids a complete product read while the reveal strategy supports delayed comprehension.",
    productionLine: "Keep the complete product view temporarily out of frame while preserving physical and commercial clarity.",
    functionAffinity: ["INVITE", "DISCOVER"],
    presenceAffinity: ["ABSENT", "IMPLIED", "PARTIAL"],
  },
  REVEAL: {
    id: "REVEAL",
    label: "Reveal",
    description: "A previously partial product becomes clearly readable through a motivated action or visual event.",
    productionLine: "Let a motivated change of body, light, doorway, or framing make the worn product clearly readable.",
    functionAffinity: ["DISCOVER", "CONFIRM", "RESOLVE"],
    presenceAffinity: ["CLEAR"],
  },
};

function scoreCameraBehavior(input: {
  behavior: CommercialCameraBehavior;
  creativeMode: CommercialCreativeMode;
  shotRole: CommercialShotRole;
  dramaticFunction: CommercialDramaticFunction;
  presence: CommercialProductPresenceDesign;
  revealStrategy: string;
}) {
  const definition = COMMERCIAL_CAMERA_BEHAVIOR_CATALOG[input.behavior];
  const mode = COMMERCIAL_CREATIVE_MODE_CATALOG[input.creativeMode];
  let score = 0;
  if (mode.cameraAffinity.includes(input.behavior)) score += 5;
  if (definition.functionAffinity.includes(input.dramaticFunction)) score += 4;
  if (definition.presenceAffinity.includes(input.presence)) score += 3;
  if (input.shotRole === "DETAIL" && (input.behavior === "DETAIL_INTERRUPTION" || input.behavior === "GROUND_OBSERVATION")) score += 6;
  if (input.shotRole === "HERO" && input.behavior === "REVEAL") score += 5;
  if (input.shotRole === "HERO" && input.behavior === "WITHHOLD") score -= 100;
  if (input.shotRole === "RELEASE" && input.behavior === "REVEAL") score -= 3;
  if (input.shotRole === "RELEASE" && input.behavior === "DETAIL_INTERRUPTION") score -= 4;
  if (input.shotRole === "WORLD" && input.behavior === "WAIT") score += 3;
  if (input.revealStrategy === "DELAYED" && input.behavior === "WITHHOLD" && input.shotRole !== "HERO") score += 4;
  if (input.revealStrategy === "IMMEDIATE" && input.behavior === "WITHHOLD") score -= 5;
  if (input.revealStrategy === "PROGRESSIVE" && input.behavior === "DISCOVER") score += 3;
  return score;
}

export function planCameraBehaviors(input: {
  creativeMode: CommercialCreativeMode;
  shotRoles: CommercialShotRole[];
  dramaticFunctions: CommercialDramaticFunction[];
  productPresence: CommercialProductPresenceDesign[];
  revealStrategy: string;
  generationNonce: number;
}) {
  const selected: CommercialCameraBehavior[] = [];
  const counts = new Map<CommercialCameraBehavior, number>();
  for (let shotIndex = 0; shotIndex < input.shotRoles.length; shotIndex += 1) {
    const roleCompatibleBehaviors = input.shotRoles[shotIndex] === "RELEASE"
      ? COMMERCIAL_CAMERA_BEHAVIORS.filter((behavior) => (
        ["OBSERVE", "WAIT", "FOLLOW", "PASS_BY"].includes(behavior)
      ))
      : COMMERCIAL_CAMERA_BEHAVIORS;
    const ranked = roleCompatibleBehaviors
      .filter((behavior) => (
        COMMERCIAL_CAMERA_BEHAVIOR_CATALOG[behavior].functionAffinity.includes(
          input.dramaticFunctions[shotIndex]
        )
      ))
      .map((behavior, order) => ({
        behavior,
        order,
        score: scoreCameraBehavior({
          behavior,
          creativeMode: input.creativeMode,
          shotRole: input.shotRoles[shotIndex],
          dramaticFunction: input.dramaticFunctions[shotIndex],
          presence: input.productPresence[shotIndex],
          revealStrategy: input.revealStrategy,
        }),
      }))
      .sort((first, second) => second.score - first.score || first.order - second.order);

    const top = ranked.slice(0, 3);
    const rotated = [
      ...top.slice((input.generationNonce + shotIndex) % top.length),
      ...top.slice(0, (input.generationNonce + shotIndex) % top.length),
    ];
    const distinctBefore = new Set(selected).size;
    const mustAddDistinct = shotIndex === input.shotRoles.length - 1 && distinctBefore < 3;
    const candidate = rotated.find((entry) => {
      const currentCount = counts.get(entry.behavior) ?? 0;
      if (currentCount >= 2) return false;
      if (mustAddDistinct && selected.includes(entry.behavior)) return false;
      return true;
    }) ?? ranked.find((entry) => (counts.get(entry.behavior) ?? 0) < 2) ?? ranked[0];

    selected.push(candidate.behavior);
    counts.set(candidate.behavior, (counts.get(candidate.behavior) ?? 0) + 1);
  }
  return selected;
}
