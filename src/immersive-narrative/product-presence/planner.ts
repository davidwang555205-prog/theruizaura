import type { NarrativePlan } from "../types";
import type { ResolvedMoment, SceneResolverOutput } from "../scene-resolver";
import { buildProductPresenceQc } from "./qc";
import {
  PRODUCT_PRESENCE_REQUIREMENTS,
  PRODUCT_PRESENCE_RULES,
} from "./rules";
import { topicMatches } from "../topic-catalog";
import type {
  ProductPresenceInput,
  ProductPresenceLevel,
  ProductPresenceMoment,
  ProductPresenceOptions,
  ProductPresenceOutput,
  ProductPresenceRule,
} from "./types";

const FORCED_BEHAVIOR_PATTERN = /\b(?:steps?|stepping) (?:one )?foot forward to (?:show|display)|\bturn(?:s|ing)? to (?:show|display)|\badjust(?:s|ing)? (?:the )?(?:hem|cuff) to (?:show|display)|\bstop(?:s|ping)? just to (?:show|display)|\bpose(?:s|ing)? for (?:the )?(?:camera|lens)|\bshow(?:s|ing)? the (?:shoe|sneaker|footwear)|\bdisplay(?:s|ing)? the (?:shoe|sneaker|footwear)\b/i;

const UPPER_BODY_OR_OBJECT_TOKENS = [
  "bag",
  "key",
  "sleeve",
  "door",
  "counter",
  "card",
  "pocket",
  "book",
  "magazine",
  "shelf",
  "grip",
  "handle",
  "posture",
  "unlock",
  "checks",
  "searches",
  "looks inside",
  "adjusts",
  "reaches for",
  "钥匙",
  "包",
  "袖",
  "门",
  "柜台",
  "口袋",
  "书架",
  "杂志",
];

const PRESENCE_REASONS: Record<ProductPresenceLevel, string> = {
  ABSENT: "This Moment does not require the product to be visible; the life action remains primary.",
  INCIDENTAL: "The product may remain part of the full human action but is not intentionally presented or emphasized.",
  READABLE: "At least one referenced shoe can remain naturally readable at believable scale inside the existing action.",
  HERO: "The existing action has natural full-foot visibility and can carry commercial product evidence without a catalog pose.",
};

function normalizeTopic(value: string) {
  return value.trim().toLowerCase();
}

function getRule(topic: string, rules?: ProductPresenceRule[]) {
  return (rules ?? PRODUCT_PRESENCE_RULES).find((rule) => topicMatches(topic, rule.topic));
}

function isProductPresenceLevel(value: unknown): value is ProductPresenceLevel {
  return value === "ABSENT" || value === "INCIDENTAL" || value === "READABLE" || value === "HERO";
}

function isObjectOrUpperBodyMoment(moment: ResolvedMoment) {
  const text = moment.originalWhatHappens.toLowerCase();
  return UPPER_BODY_OR_OBJECT_TOKENS.some((token) => text.includes(token));
}

function resolvePresence(
  baseline: ProductPresenceLevel,
  moment: ResolvedMoment,
  momentIndex: number
): { presence: ProductPresenceLevel; reason: string; forced: boolean } {
  if (baseline === "HERO" && momentIndex === 0) {
    return {
      presence: "READABLE",
      reason: "Moment 1 cannot start with HERO because the opening must establish the person and life world first.",
      forced: false,
    };
  }

  if (baseline === "HERO" && isObjectOrUpperBodyMoment(moment)) {
    return {
      presence: "READABLE",
      reason: "HERO baseline lowered to READABLE because this Moment is an upper-body or object interaction; natural shoe readability remains available without changing the action.",
      forced: false,
    };
  }

  return {
    presence: baseline,
    reason: PRESENCE_REASONS[baseline],
    forced: false,
  };
}

function productRequirements(level: ProductPresenceLevel) {
  return { ...PRODUCT_PRESENCE_REQUIREMENTS[level] };
}

function preserveMoment(moment: ResolvedMoment, presence: ProductPresenceLevel, reason: string): ProductPresenceMoment {
  return {
    momentIndex: moment.momentIndex,
    sceneId: moment.sceneId,
    originalWhatHappens: moment.originalWhatHappens,
    presence,
    reason,
    productRequirement: productRequirements(presence),
  };
}

export function buildProductPresenceInput(
  plan: NarrativePlan,
  sceneResolution: SceneResolverOutput,
  topic: string
): ProductPresenceInput {
  return {
    narrativeStatus: plan.status,
    sceneResolutionStatus: sceneResolution.status,
    topic,
    duration: plan.durationSeconds,
    moments: sceneResolution.resolvedMoments.map((moment) => ({ ...moment })),
  };
}

export function planProductPresence(
  input: ProductPresenceInput,
  options: ProductPresenceOptions = {}
): ProductPresenceOutput {
  const rule = getRule(input.topic, options.rules);
  const failureReasons: string[] = [];
  const curve: ProductPresenceMoment[] = [];
  let narrativePreserved = true;
  let productForced = false;

  if (input.narrativeStatus !== "APPROVED_FOR_SCENE_RESOLUTION") {
    failureReasons.push("NARRATIVE_NOT_APPROVED: Product Presence requires an approved Narrative.");
  }
  if (input.sceneResolutionStatus !== "SCENE_RESOLUTION_APPROVED") {
    failureReasons.push("SCENE_RESOLUTION_NOT_APPROVED: Product Presence requires approved Scene Resolution.");
  }
  if (input.duration !== 15) {
    failureReasons.push(`INVALID_DURATION: Product Presence V1 expects a 15-second Narrative, received ${input.duration}.`);
  }
  if (input.moments.length < 4 || input.moments.length > 5) {
    failureReasons.push(`INVALID_MOMENT_COUNT: Product Presence V1 supports 4 to 5 moments, received ${input.moments.length}.`);
  }
  if (!rule) {
    failureReasons.push(`UNSUPPORTED_TOPIC: No Product Presence V1 baseline exists for "${input.topic.trim()}".`);
  }

  const rawLevels: ProductPresenceLevel[] = [];
  if (rule) {
    input.moments.forEach((moment, index) => {
      const baseline = rule.baseline[index];
      if (!isProductPresenceLevel(baseline)) {
        failureReasons.push(`INVALID_PRESENCE_LEVEL: Moment ${index + 1} has no valid baseline presence level.`);
        rawLevels.push("ABSENT");
        return;
      }

      rawLevels.push(baseline);
      const forced = FORCED_BEHAVIOR_PATTERN.test(moment.originalWhatHappens);
      if (forced) {
        productForced = true;
        failureReasons.push(`PRODUCT_FORCED: Moment ${index + 1} asks for an artificial display action.`);
      }

      const resolved = resolvePresence(baseline, moment, index);
      curve.push(preserveMoment(moment, resolved.presence, forced
        ? "Presence cannot be approved because this Moment asks for an artificial footwear display."
        : resolved.reason));
    });
  }

  narrativePreserved = curve.length === input.moments.length
    && curve.every((moment, index) => {
      const source = input.moments[index];
      return moment.momentIndex === source.momentIndex
        && moment.sceneId === source.sceneId
        && moment.originalWhatHappens === source.originalWhatHappens;
    });
  if (!narrativePreserved) {
    failureReasons.push("NARRATIVE_NOT_PRESERVED: Product Presence output changed Moment order, Scene, or What Happens.");
  }

  const rawHeroCount = rawLevels.filter((level) => level === "HERO").length;
  const rawStrongCount = rawLevels.filter((level) => level === "READABLE" || level === "HERO").length;
  if (rawHeroCount > 1 || rawStrongCount > 3) {
    failureReasons.push(`PRODUCT_OVEREXPOSED: The requested curve contains ${rawHeroCount} HERO and ${rawStrongCount} READABLE/HERO moments.`);
  }
  const qcResult = buildProductPresenceQc({
    curve,
    expectedMomentCount: input.moments.length,
    narrativePreserved,
    productForced,
    rawHeroCount,
    rawStrongCount,
  });

  const status = qcResult.allPassed && failureReasons.length === 0
    ? "PRODUCT_PRESENCE_APPROVED"
    : "PRODUCT_PRESENCE_FAILED";

  return {
    narrativeStatus: input.narrativeStatus,
    sceneResolutionStatus: input.sceneResolutionStatus,
    topic: input.topic,
    duration: input.duration,
    curve,
    qc: qcResult.qc,
    status,
    failureReasons: failureReasons.length ? failureReasons : undefined,
  };
}
