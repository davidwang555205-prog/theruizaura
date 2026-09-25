import type { SoundMoment } from "../sound-world";
import type { ActionExecutionEvidence, ExecutionMomentContract, SoundCueVerdict } from "./types";

type SoundCueContext = {
  contract: ExecutionMomentContract;
  topicNarrative: string;
  evidence: ActionExecutionEvidence;
  soundMoment: SoundMoment | undefined;
};

type SoundRule = {
  id: string;
  pattern: RegExp;
  evidence: (context: SoundCueContext) => string | null;
};

function doorInteractionInMoment(text: string) {
  if (/\b(?:opens?|unlocks?|closes?|pushes?|pulls?|touches?|grips?)\s+(?:(?:the|a|an)\s+)?(?:door|lock)\b/i.test(text)) return "the Moment states a door interaction";
  if (/\b(?:turns?|inserts?)\b(?:\s+\w+){0,2}\s+\bkey\b/i.test(text) && /\b(?:door|lock)\b/i.test(text)) return "the Moment states a key-and-door interaction";
  return null;
}

// A sound cue is kept only when the current Moment's Narrative or the allowed
// Body Behaviour can produce it. Scene habit is never enough.
const SOUND_RULES: SoundRule[] = [
  {
    id: "SMALL_ITEM",
    pattern: /\bkey\b|\bcard\b|\bsmall item\b/i,
    evidence: ({ contract, topicNarrative, evidence }) => {
      const item = contract.narrativeEvent.match(/\bkey\b|\bcard\b|\bsmall item\b/i)?.[0].toLowerCase()
        ?? topicNarrative.match(/\bkey\b|\bcard\b|\bsmall item\b/i)?.[0].toLowerCase();
      if (!item) return null;
      if (new RegExp(`\\b${item}\\b`, "i").test(contract.narrativeEvent)) return `the ${item} is named in this Moment`;
      if (/\b(?:search|pocket|bag|looks inside)\b/i.test(contract.narrativeEvent)) return `this Moment searches for the ${item}`;
      if (evidence.capabilityIds.includes("SMALL_OBJECT_RETRIEVAL") || evidence.capabilityIds.includes("CONTAINER_OBJECT_SEARCH")) {
        return `this Moment works with the ${item}`;
      }
      return null;
    },
  },
  {
    id: "CARRIED_OBJECT",
    pattern: /\bbag\b|\bhandbag\b|\bhandle\b/i,
    evidence: ({ contract, topicNarrative, evidence, soundMoment }) => {
      if (!/\bbag\b/i.test(topicNarrative)) return null;
      const mentionsBag = /\bbag\b/i.test(contract.narrativeEvent);
      const handlesBag = evidence.capabilityIds.some((capability) => capability.startsWith("CARRIED_OBJECT"))
        || (evidence.handTask?.startsWith("carried_object") ?? false);
      const cueCameFromBag = soundMoment?.human.some((cue) => /\bbag\b/i.test(cue)) ?? false;
      if (mentionsBag || handlesBag || cueCameFromBag) return "the carried object is present in this Moment";
      return null;
    },
  },
  {
    id: "DOOR_EVENT",
    pattern: /\bdoor\b|\block\b|\bdoorway\b/i,
    evidence: ({ contract, evidence }) => {
      const narrative = doorInteractionInMoment(contract.narrativeEvent);
      if (narrative) return narrative;
      if (evidence.capabilityIds.includes("DOOR_CONTACT") || evidence.handTask === "door_contact") {
        return "the matched body behaviour touches the door";
      }
      return null;
    },
  },
  {
    id: "SCENE_PROP",
    pattern: /\bcup\b|\bglass\b|\bplate\b|\bpage\b|\bpaper\b|\bmagazine\b|\bbook\b/i,
    evidence: ({ contract, topicNarrative }) => {
      const prop = contract.narrativeEvent.match(/\bcup\b|\bglass\b|\bplate\b|\bpage\b|\bpaper\b|\bmagazine\b|\bbook\b/i)?.[0].toLowerCase()
        ?? null;
      if (prop && new RegExp(`\\b${prop}`, "i").test(topicNarrative)) return `the ${prop} is part of this narrative`;
      return null;
    },
  },
  {
    id: "FOOTWEAR_EVENT",
    pattern: /\boutsole\b|\bfootstep\b|\bheel\b|\bstep on\b|\bfootfall\b/i,
    evidence: ({ contract, evidence }) => {
      if (/^walking_|^turning$|^stopping_settle$|^transition_pause$/.test(evidence.movementState ?? "")) {
        return "the body is travelling or settling in this Moment";
      }
      if (/\bwalks?\b|\bsteps?\b|\bcrosses?\b|\bmoves through\b/i.test(contract.narrativeEvent)) {
        return "this Moment contains a step";
      }
      return null;
    },
  },
  {
    id: "HUMAN",
    pattern: /\bbreath|\bfabric\b|\bsleeve\b|\bgarment\b|\bclothing\b/i,
    evidence: () => "the person is present and moving naturally",
  },
  {
    id: "ENVIRONMENT",
    pattern: /\broom tone\b|\bstreet\b|\bair\b|\bsilence\b|\bambient\b|\bneighborhood\b/i,
    evidence: () => "the scene is continuously present",
  },
];

export function filterSoundCues(context: SoundCueContext): SoundCueVerdict[] {
  const moment = context.soundMoment;
  if (!moment) return [];
  const cues = [...moment.environment, ...moment.human, ...moment.object, ...moment.footwear];
  return cues.map((cue) => {
    // Rule selection is by specificity, not by table order: a "door handle"
    // cue must be judged as a door event even though it also says "handle".
    const rule = /\bdoor\b|\block\b|\bdoorway\b/i.test(cue)
      ? SOUND_RULES.find((entry) => entry.id === "DOOR_EVENT")
      : SOUND_RULES.find((entry) => entry.pattern.test(cue));
    if (!rule) {
      return {
        momentIndex: context.contract.momentIndex,
        cue,
        kept: false,
        rejectionReason: "NO_EVENT_EVIDENCE",
        evidence: "the cue has no matching evidence rule",
      };
    }
    const evidence = rule.evidence(context);
    return {
      momentIndex: context.contract.momentIndex,
      cue,
      kept: Boolean(evidence),
      rejectionReason: evidence ? null : "NO_EVENT_EVIDENCE",
      evidence: evidence ?? `the ${rule.id.toLowerCase()} event is not present in this Moment`,
    };
  });
}
