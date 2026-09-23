import type { NarrativePlan } from "../types";
import type { ResolvedMoment, SceneResolverOutput } from "../scene-resolver";
import type { ProductPresenceMoment, ProductPresenceOutput } from "../product-presence";
import { buildSoundWorldQc } from "./qc";
import { SOUND_WORLD_RULES } from "./rules";
import { topicMatches } from "../topic-catalog";
import type {
  SilenceLevel,
  SoundCategory,
  SoundMoment,
  SoundWorldInput,
  SoundWorldOptions,
  SoundWorldOutput,
  SoundWorldRule,
} from "./types";

const INVENTED_EVENT_PATTERN = /\b(?:phone ring(?:s|ing)?|incoming call|someone calls? her|dog bark(?:s|ing)?|thunder|rain begins?|car horn|doorbell|notification|conversation directed at)\b/i;
const OVERDESIGN_PATTERN = /\b(?:asmr|whoosh|cinematic impact|impact hit|sound hit|emotional score|music swell|transition sting|lens flare sound|product sound)\b/i;
const FOOT_CONTACT_PATTERN = /\b(?:walk|walks|walking|step|steps|continues|approach|approaches|near|nears|reaches|moves through|outside|pace|stance|weight|floor|pavement|ground|threshold)\b/i;
const FABRIC_PATTERN = /\b(?:fabric|sleeve|coat|garment|cuff|clothing|shoulder|posture|breath)/i;
const BAG_PATTERN = /\b(?:bag|tote|strap|grip|handle)/i;
const DOOR_PATTERN = /\b(?:door|doorway|entrance|threshold|unlocks|opens)/i;
const OBJECT_PATTERN = /\b(?:key|lock|handle|card|pocket|book|magazine|shelf|counter|console|paper|receipt|cup)/i;

const SCENE_MATERIALS: Record<string, string[]> = {
  "lifestyle-returning-home": ["stone", "tile"],
  "lifestyle-entryway-departure": ["wood", "tile"],
  "lifestyle-residential-building-exit": ["pavement"],
  "lifestyle-bookstore": ["wood", "tile"],
  "lifestyle-bookstore-interior": ["wood", "tile"],
  "lifestyle-cafe-interior": ["wood", "tile"],
  "lifestyle-office-entrance": ["stone", "tile"],
  "lifestyle-premium-grocery": ["tile"],
  "lifestyle-home-errand-entry": ["stone", "tile"],
};

const MATERIAL_PATTERN = /\b(stone|wood|pavement|tile|gravel|grass|marble|metal|wet|sand)\b/i;

function normalizeTopic(value: string) {
  return value.trim().toLowerCase();
}

function getRule(topic: string, rules?: SoundWorldRule[]) {
  return (rules ?? SOUND_WORLD_RULES).find((rule) => topicMatches(topic, rule.topic));
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function includesAny(text: string, pattern: RegExp) {
  return pattern.test(text);
}

function environmentCues(sceneId: string) {
  if (sceneId.includes("bookstore")) return ["quiet bookstore room tone", "faint street sound through the glazing"];
  if (sceneId.includes("cafe")) return ["quiet cafe room tone", "restrained background voices", "soft counter appliance hum"];
  if (sceneId.includes("office")) return ["building entrance room tone", "distant street ambience"];
  if (sceneId.includes("grocery")) return ["neighborhood-shop room tone", "distant street ambience"];
  if (sceneId.includes("building-exit")) return ["open residential street air", "distant city ambience"];
  if (sceneId.includes("home") || sceneId.includes("entryway") || sceneId.includes("returning")) {
    return ["apartment hallway room tone", "faint exterior sound through the door"];
  }
  return ["quiet room tone"];
}

function humanCues(text: string) {
  const cues: string[] = [];
  if (FABRIC_PATTERN.test(text)) cues.push("fabric movement");
  if (BAG_PATTERN.test(text)) cues.push("bag strap against clothing");
  if (/quiet|still|pause|remains/i.test(text)) cues.push("soft breathing at rest");
  if (!cues.length && /reaches|stands|shifts|adjusts|turns|walks|moves|closes|settles|continues/i.test(text)) {
    cues.push("subtle body and fabric movement");
  }
  return cues;
}

function objectCues(text: string) {
  const cues: string[] = [];
  if (/key/i.test(text)) cues.push("key contact inside the bag", "key turning in the lock");
  if (/door|doorway|entrance|threshold|unlocks|opens/i.test(text)) cues.push("door handle movement", "lock release");
  if (/book|magazine|shelf/i.test(text)) cues.push("single page movement", "soft shelf contact");
  if (/card|pocket|counter/i.test(text)) cues.push("small card movement", "pocket fabric closure");
  if (/bag|tote|handle|grip/i.test(text)) cues.push("bag handle shifting", "paper or fabric bag contact");
  if (/cup|table|counter/i.test(text)) cues.push("cup settling on the counter");
  return cues;
}

function footwearCues(sceneId: string, text: string) {
  if (!FOOT_CONTACT_PATTERN.test(text)) return [];
  const materials = SCENE_MATERIALS[sceneId] ?? [];
  if (materials.includes("wood")) return ["soft outsole contact on wood", "muted heel settlement"];
  if (materials.includes("pavement")) return ["short outsole step on pavement", "natural heel contact"];
  if (materials.includes("stone")) return ["short dry outsole contact on stone", "quiet heel settlement"];
  return ["quiet outsole contact on the interior floor", "brief weight shift"];
}

function paletteFor(
  rule: SoundWorldRule,
  category: Exclude<SoundCategory, "SILENCE">,
  fallback: string[]
) {
  const override = rule.cuePalette?.[category];
  return override?.length ? [...override] : fallback;
}

function selectCues(
  rule: SoundWorldRule,
  moment: ResolvedMoment,
  dominant: SoundCategory
) {
  const generated = {
    ENVIRONMENT: environmentCues(moment.sceneId),
    HUMAN: humanCues(moment.originalWhatHappens),
    OBJECT: objectCues(moment.originalWhatHappens),
    FOOTWEAR: footwearCues(moment.sceneId, moment.originalWhatHappens),
  };
  const categories: Array<Exclude<SoundCategory, "SILENCE">> = ["ENVIRONMENT", "HUMAN", "OBJECT", "FOOTWEAR"];
  const preferredOrder = dominant === "SILENCE"
    ? ["ENVIRONMENT", ...categories.filter((category) => category !== "ENVIRONMENT")]
    : [dominant, ...categories.filter((category) => category !== dominant)] as Array<Exclude<SoundCategory, "SILENCE">>;
  const selected: Array<{ category: Exclude<SoundCategory, "SILENCE">; cue: string }> = [];

  categories.forEach((category) => {
    const cues = paletteFor(rule, category, generated[category]);
    const alreadySelected = selected.some((item) => item.category === category);
    if (alreadySelected) return;
    const cue = cues[0];
    if (cue) selected.push({ category, cue });
  });

  selected.sort((a, b) => preferredOrder.indexOf(a.category) - preferredOrder.indexOf(b.category));
  const limited = selected.slice(0, 3);
  const arrays: Record<Exclude<SoundCategory, "SILENCE">, string[]> = {
    ENVIRONMENT: [],
    HUMAN: [],
    OBJECT: [],
    FOOTWEAR: [],
  };
  limited.forEach(({ category, cue }) => arrays[category].push(cue));

  const dominantHasCue = dominant !== "SILENCE" && arrays[dominant].length > 0;
  const resolvedDominant: SoundCategory = dominant === "SILENCE"
    ? "SILENCE"
    : dominantHasCue
      ? dominant
      : (["ENVIRONMENT", "HUMAN", "OBJECT", "FOOTWEAR"] as const).find((category) => arrays[category].length > 0) ?? "SILENCE";

  const silenceLevel: SilenceLevel = resolvedDominant === "SILENCE"
    ? "PRONOUNCED"
    : limited.length <= 1
      ? "LIGHT"
      : "NONE";

  return { arrays, dominantSound: resolvedDominant, silenceLevel };
}

function preserveMoment(
  rule: SoundWorldRule,
  moment: ResolvedMoment,
  index: number
): SoundMoment {
  const baseline = rule.dominantBaseline[index] ?? "ENVIRONMENT";
  const selected = selectCues(rule, moment, baseline);
  const adjusted = selected.dominantSound !== baseline;
  return {
    momentIndex: moment.momentIndex,
    sceneId: moment.sceneId,
    sceneName: moment.sceneName,
    originalWhatHappens: moment.originalWhatHappens,
    environment: selected.arrays.ENVIRONMENT,
    human: selected.arrays.HUMAN,
    object: selected.arrays.OBJECT,
    footwear: selected.arrays.FOOTWEAR,
    silenceLevel: selected.silenceLevel,
    dominantSound: selected.dominantSound,
    reason: adjusted
      ? `Baseline ${baseline} adjusted to ${selected.dominantSound} because the existing physical action does not provide a reliable ${baseline} cue.`
      : `The existing action and ${moment.sceneName} physically support ${selected.dominantSound} as the primary sound.`,
  };
}

function collectCueReasons(
  moments: SoundMoment[],
  sceneMaterials: Record<string, string[]>
) {
  const inventedEvents: string[] = [];
  const physicalMismatches: string[] = [];
  const overdesignReasons: string[] = [];

  moments.forEach((moment) => {
    const cues = [...moment.environment, ...moment.human, ...moment.object, ...moment.footwear];
    cues.forEach((cue) => {
      if (INVENTED_EVENT_PATTERN.test(cue)) inventedEvents.push(`Moment ${moment.momentIndex + 1}: invented event "${cue}".`);
      if (OVERDESIGN_PATTERN.test(cue)) overdesignReasons.push(`Moment ${moment.momentIndex + 1}: overdesigned cue "${cue}".`);
      const material = cue.match(MATERIAL_PATTERN)?.[1]?.toLowerCase();
      if (material) {
        const allowed = sceneMaterials[moment.sceneId] ?? [];
        if (!allowed.includes(material)) {
          physicalMismatches.push(`Moment ${moment.momentIndex + 1}: "${cue}" does not match ${moment.sceneId} material (${allowed.join(", ") || "unknown"}).`);
        }
      }
    });
  });

  return { inventedEvents, physicalMismatches, overdesignReasons };
}

export function buildSoundWorldInput(
  plan: NarrativePlan,
  sceneResolution: SceneResolverOutput,
  productPresence: ProductPresenceOutput,
  topic: string
): SoundWorldInput {
  return {
    narrativeStatus: plan.status,
    sceneResolutionStatus: sceneResolution.status,
    productPresenceStatus: productPresence.status,
    topic,
    duration: plan.durationSeconds,
    storyIntent: plan.storyIntent,
    initialCharacterState: plan.initialCharacterState,
    microEvent: plan.microEvent,
    locationWorld: sceneResolution.locationWorld ? { ...sceneResolution.locationWorld } : null,
    resolvedMoments: sceneResolution.resolvedMoments.map((moment) => ({ ...moment })),
    productPresenceCurve: productPresence.curve.map((moment) => ({ ...moment })),
  };
}

export function planSoundWorld(
  input: SoundWorldInput,
  options: SoundWorldOptions = {}
): SoundWorldOutput {
  const rule = getRule(input.topic, options.rules);
  const failureReasons: string[] = [];
  const moments: SoundMoment[] = [];
  const sceneMaterials = options.sceneMaterialOverrides ?? SCENE_MATERIALS;

  if (input.narrativeStatus !== "APPROVED_FOR_SCENE_RESOLUTION") {
    failureReasons.push("NARRATIVE_NOT_APPROVED: Sound World requires an approved Narrative.");
  }
  if (input.sceneResolutionStatus !== "SCENE_RESOLUTION_APPROVED") {
    failureReasons.push("SCENE_RESOLUTION_NOT_APPROVED: Sound World requires approved Scene Resolution.");
  }
  if (input.productPresenceStatus !== "PRODUCT_PRESENCE_APPROVED") {
    failureReasons.push("PRODUCT_PRESENCE_NOT_APPROVED: Sound World requires an approved Product Presence Curve.");
  }
  if (input.duration !== 15) {
    failureReasons.push(`INVALID_DURATION: Sound World V1 expects a 15-second Narrative, received ${input.duration}.`);
  }
  if (input.resolvedMoments.length < 4 || input.resolvedMoments.length > 5) {
    failureReasons.push(`INVALID_MOMENT_COUNT: Sound World V1 supports 4 to 5 moments, received ${input.resolvedMoments.length}.`);
  }
  if (input.resolvedMoments.length !== input.productPresenceCurve.length) {
    failureReasons.push("MOMENT_COUNT_MISMATCH: Resolved Moments and Product Presence Curve have different lengths.");
  }
  if (!rule) {
    failureReasons.push(`UNSUPPORTED_TOPIC: No Sound World V1 baseline exists for "${input.topic.trim()}".`);
  }

  if (rule) {
    input.resolvedMoments.forEach((moment, index) => {
      const presence = input.productPresenceCurve[index];
      if (!presence) return;
      if (rule.dominantBaseline[index] && !["ENVIRONMENT", "HUMAN", "OBJECT", "FOOTWEAR", "SILENCE"].includes(rule.dominantBaseline[index])) {
        failureReasons.push(`INVALID_DOMINANT_SOUND: Moment ${index + 1} has an invalid baseline dominant sound.`);
        return;
      }
      moments.push(preserveMoment(rule, moment, index));
      if (presence.originalWhatHappens !== moment.originalWhatHappens || presence.sceneId !== moment.sceneId) {
        failureReasons.push(`NARRATIVE_NOT_PRESERVED: Moment ${index + 1} differs between resolved Scene and Product Presence.`);
      }
    });
  }

  const narrativePreserved = moments.length === input.resolvedMoments.length
    && moments.every((moment, index) => {
      const resolved = input.resolvedMoments[index];
      const presence = input.productPresenceCurve[index];
      return Boolean(presence)
        && moment.momentIndex === resolved.momentIndex
        && moment.sceneId === resolved.sceneId
        && moment.originalWhatHappens === resolved.originalWhatHappens
        && presence.momentIndex === resolved.momentIndex
        && presence.sceneId === resolved.sceneId
        && presence.originalWhatHappens === resolved.originalWhatHappens;
    });
  const cueReasons = collectCueReasons(moments, sceneMaterials);
  const qcResult = buildSoundWorldQc({
    moments,
    expectedMomentCount: input.resolvedMoments.length,
    narrativePreserved,
    physicalMismatches: cueReasons.physicalMismatches,
    inventedEvents: cueReasons.inventedEvents,
    overdesignReasons: cueReasons.overdesignReasons,
  });
  if (cueReasons.inventedEvents.length) failureReasons.push("INVENTED_EVENT: Sound cues introduce events absent from the Narrative.");
  if (cueReasons.physicalMismatches.length) failureReasons.push("PHYSICAL_SOUND_MISMATCH: Sound cues do not match the resolved Scene.");
  if (cueReasons.overdesignReasons.length) failureReasons.push("SOUND_OVERDESIGN: Sound design is denser or more emphatic than real life.");

  const status = qcResult.allPassed && failureReasons.length === 0
    ? "SOUND_WORLD_APPROVED"
    : "SOUND_WORLD_FAILED";

  return {
    productPresenceStatus: input.productPresenceStatus,
    topic: input.topic,
    duration: input.duration,
    moments,
    global: {
      musicPolicy: "NONE",
      dialoguePolicy: "NONE",
      soundStyle: "NATURALISTIC",
    },
    qc: qcResult.qc,
    status,
    failureReasons: failureReasons.length ? failureReasons : undefined,
  };
}
