import { anchorDefinition, SPATIAL_ANCHORS } from "./catalog";
import {
  ALLOWED_TRANSITION_CLASSES,
  type SpatialAnchorId,
  type SpatialEnvelope,
  type SpatialSequenceValidation,
  type SpatialTransition,
  type SpatialTransitionClass,
} from "./types";

// The anchor of a Moment is where its action *ends up*, so the last spatial
// mention wins. Trailing aftermath clauses ("the hallway returns to stillness")
// describe the room, not the person, and are removed first.
function anchorText(text: string) {
  return text
    .split(/(?<=\.)\s+/)
    .filter((clause) => !/\b(?:returns? to stillness|continues? around|remains? behind)\b/i.test(clause))
    .join(" ");
}

export function detectSpatialAnchor(text: string, fallback: SpatialAnchorId = "UNKNOWN"): SpatialAnchorId {
  const cleaned = anchorText(text);
  let bestAnchor: SpatialAnchorId | null = null;
  let bestIndex = -1;
  for (const anchor of SPATIAL_ANCHORS) {
    for (const pattern of anchor.patterns) {
      const match = new RegExp(pattern.source, pattern.flags.replace("g", "")).exec(cleaned);
      if (match && match.index > bestIndex) {
        bestIndex = match.index;
        bestAnchor = anchor.id;
      }
    }
  }
  return bestAnchor ?? fallback;
}

export function classifyTransition(from: SpatialAnchorId, to: SpatialAnchorId): SpatialTransitionClass {
  if (from === to) return "SAME_ANCHOR";
  if (from === "UNKNOWN" || to === "UNKNOWN") return "NON_CONTIGUOUS";
  const definition = anchorDefinition(from);
  const reverse = anchorDefinition(to);
  if (!definition || !reverse) return "NON_CONTIGUOUS";
  if (definition.adjacent.includes(to) || reverse.adjacent.includes(from)) {
    // Same building / same street segment reads as an immediate neighbour; a
    // longer but still walkable hop is a short contiguous walk.
    const immediatePairs = new Set([
      "ELEVATOR_EXIT>APARTMENT_HALLWAY",
      "APARTMENT_HALLWAY>APARTMENT_THRESHOLD",
      "APARTMENT_THRESHOLD>ENTRYWAY",
      "ENTRYWAY>HOME_INTERIOR",
      "SHOP_WINDOW>SHOP_FRONT",
      "SHOP_FRONT>SHOP_INTERIOR",
      "CAFE_INTERIOR>CAFE_COUNTER",
      "COMMUNITY_PATH>OFFICE_ENTRANCE",
    ]);
    return immediatePairs.has(`${from}>${to}`) || immediatePairs.has(`${to}>${from}`)
      ? "IMMEDIATE_ADJACENT"
      : "SHORT_CONTIGUOUS_WALK";
  }
  return "NON_CONTIGUOUS";
}

export function validateSpatialSequence(
  momentIndexes: number[],
  anchors: SpatialAnchorId[],
  envelope: SpatialEnvelope
): SpatialSequenceValidation {
  const failures: string[] = [];
  const transitions: SpatialTransition[] = [];
  anchors.forEach((anchor, index) => {
    if (anchor !== "UNKNOWN" && !envelope.allowedAnchors.includes(anchor)) {
      failures.push(`Moment ${momentIndexes[index] + 1} anchor ${anchor} is outside the spatial envelope ${envelope.macroLocation}.`);
    }
  });
  for (let index = 1; index < anchors.length; index += 1) {
    const transitionClass = classifyTransition(anchors[index - 1], anchors[index]);
    const ok = ALLOWED_TRANSITION_CLASSES.includes(transitionClass);
    transitions.push({
      fromMomentIndex: momentIndexes[index - 1],
      toMomentIndex: momentIndexes[index],
      fromAnchor: anchors[index - 1],
      toAnchor: anchors[index],
      transitionClass,
      ok,
      reason: ok
        ? `${anchors[index - 1]} → ${anchors[index]} is ${transitionClass}.`
        : `${anchors[index - 1]} → ${anchors[index]} cannot be reached inside one continuous 15-second slice.`,
    });
    if (!ok) failures.push(transitions[transitions.length - 1].reason);
  }
  const distinct = new Set(anchors.filter((anchor) => anchor !== "UNKNOWN"));
  if (envelope.continuityMode === "SINGLE_SPACE" && distinct.size > 1) {
    failures.push(`A SINGLE_SPACE envelope received ${distinct.size} anchors.`);
  }
  return { anchors, transitions, pass: failures.length === 0, failures };
}
