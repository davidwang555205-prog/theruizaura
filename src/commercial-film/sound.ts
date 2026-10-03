import type { SoundCategory } from "../immersive-narrative/sound-world";
import type {
  CommercialCameraRhythm,
  CommercialIntentId,
  CommercialShotRole,
  CommercialSoundPlan,
  CommercialSoundShot,
} from "./types";

const SHOT_CUES: Record<CommercialShotRole, Record<"interior" | "street", string[]>> = {
  WORLD: {
    interior: ["quiet room tone", "soft fabric movement", "one restrained footstep"],
    street: ["open street ambience", "ordinary footsteps", "distant city movement"],
  },
  WEAR: {
    interior: ["natural room tone", "fabric movement", "steady foot contact"],
    street: ["street room tone", "regular footsteps", "distant traffic"],
  },
  DETAIL: {
    interior: ["quiet material movement", "one clear footstep", "soft room tone"],
    street: ["muted street ambience", "one clear footfall", "fabric response"],
  },
  HERO: {
    interior: ["small weight settle", "quiet room tone", "light fabric movement"],
    street: ["brief street pause", "foot settling on pavement", "distant urban ambience"],
  },
  RELEASE: {
    interior: ["room tone continuing behind the person", "ordinary footsteps", "fabric movement"],
    street: ["street ambience continuing", "unhurried footsteps", "soft city distance"],
  },
};

const SOUND_CONTEXT_BY_INTENT: Record<CommercialIntentId, { context: string; cues: string[] }> = {
  URBAN_MOTION: {
    context: "urban exterior",
    cues: ["street ambience", "ordinary footsteps", "distant traffic"],
  },
  DAILY_STYLING: {
    context: "private threshold to street",
    cues: ["quiet room tone", "fabric movement", "door and floor contact"],
  },
  QUIET_LUXURY: {
    context: "quiet private interior",
    cues: ["soft room tone", "fabric movement", "subtle chair or floor contact"],
  },
  PRODUCT_CRAFT: {
    context: "working preparation interior",
    cues: ["room tone", "fabric movement", "ordinary object and floor contact"],
  },
  NEW_ARRIVAL: {
    context: "exterior threshold to arrival",
    cues: ["street ambience", "door threshold sound"],
  },
};

function shotSceneKind(shotIndex: number, sceneIds: string[], spatialState?: { start: string | null; end: string | null }) {
  const state = `${spatialState?.end ?? spatialState?.start ?? ""}`.toLowerCase();
  if (spatialState && /inside|interior|room|workroom|entryway|arrival space/.test(state)) return "interior";
  if (spatialState && /outside on|street|approach/.test(state)) return "street";
  const sceneId = sceneIds[shotIndex % sceneIds.length] ?? "";
  return /street|corner|walk|exit|building|cafe-exterior/.test(sceneId) ? "street" : "interior";
}

export function buildCommercialSoundPlan(
  rhythm: CommercialCameraRhythm,
  intent: CommercialIntentId,
  shotRoles: CommercialShotRole[],
  sceneIds: string[],
  spatialStates?: Array<{ start: string | null; end: string | null }>
): CommercialSoundPlan {
  const shots: CommercialSoundShot[] = shotRoles.map((shotRole, shotIndex) => {
    const spatialState = spatialStates?.[shotIndex];
    const kind = shotSceneKind(shotIndex, sceneIds, spatialState);
    const contextCues = SOUND_CONTEXT_BY_INTENT[intent].cues;
    const crossing = Boolean(spatialState?.start && spatialState.end && spatialState.start !== spatialState.end);
    const transitionCues = crossing
      ? /inside|interior|room|workroom|entryway/.test(spatialState!.start!.toLowerCase())
        ? ["door and floor contact", "street ambience begins after the crossing"]
        : ["street ambience before entry", "destination room tone begins after the crossing"]
      : [];
    const groundedIntentCues = intent === "QUIET_LUXURY" || intent === "PRODUCT_CRAFT"
      ? contextCues.filter((cue) => !/street|traffic|exterior/i.test(cue))
      : contextCues;
    const spatialIntentCues = kind === "interior"
      ? groundedIntentCues.filter((cue) => !/street|traffic|exterior|threshold/i.test(cue))
      : groundedIntentCues.filter((cue) => !/room tone|interior|threshold/i.test(cue));
    const crossingIndex = spatialStates?.findIndex((state) => Boolean(state.start && state.end && state.start !== state.end)) ?? -1;
    const postDailyCrossing = intent === "DAILY_STYLING" && crossingIndex >= 0 && shotIndex > crossingIndex;
    const settledArrivalBeat = intent === "NEW_ARRIVAL" && shotIndex === 4;
    const cues = [...new Set(crossing
      ? [...transitionCues, ...SHOT_CUES[shotRole][kind]]
      : [...spatialIntentCues.slice(0, 2), ...SHOT_CUES[shotRole][kind]])]
      .filter((cue) => !postDailyCrossing || !/door|threshold|floor contact/i.test(cue))
      .filter((cue) => !settledArrivalBeat || !/footsteps?|footfall|foot contact|foot settling/i.test(cue))
      .slice(0, 3);
    const dominantSound: SoundCategory = shotRole === "HERO"
      ? "SILENCE"
      : rhythm === "PRODUCT_FORWARD" && shotRole === "DETAIL"
        ? "OBJECT"
        : "FOOTWEAR";
    const categories: Array<Exclude<SoundCategory, "SILENCE">> = ["ENVIRONMENT", "HUMAN", "OBJECT", "FOOTWEAR"];
    return {
      shotIndex,
      shotRole,
      categories,
      cues,
      silenceLevel: shotRole === "HERO" ? "LIGHT" : "NONE",
      dominantSound,
    };
  });

  return {
    context: SOUND_CONTEXT_BY_INTENT[intent].context,
    policy: {
      style: "NATURALISTIC",
      music: "NONE",
      voiceover: "NONE",
      dialogue: "NONE",
    },
    shots,
  };
}
