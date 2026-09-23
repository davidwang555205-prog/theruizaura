import type {
  SoundMoment,
  SoundWorldQc,
  SoundWorldQcGate,
  SoundWorldQcGateId,
} from "./types";

const GATE_LABELS: Record<SoundWorldQcGateId, string> = {
  narrative_preserved: "Narrative Preserved",
  scene_physically_consistent: "Scene Physically Consistent",
  no_invented_event: "No Invented Event",
  no_overdesign: "No Overdesign",
};

function gate(id: SoundWorldQcGateId, passed: boolean, reason: string): SoundWorldQcGate {
  return {
    id,
    label: GATE_LABELS[id],
    status: passed ? "PASS" : "FAIL",
    reason,
  };
}

export function buildSoundWorldQc(input: {
  moments: SoundMoment[];
  expectedMomentCount: number;
  narrativePreserved: boolean;
  physicalMismatches: string[];
  inventedEvents: string[];
  overdesignReasons: string[];
}): { qc: SoundWorldQc; allPassed: boolean } {
  const cueCounts = input.moments.map((moment) =>
    moment.environment.length + moment.human.length + moment.object.length + moment.footwear.length
  );
  const allFootwear = input.moments.length > 0 && input.moments.every((moment) => moment.dominantSound === "FOOTWEAR");
  const overdesignReasons = [...input.overdesignReasons];
  if (cueCounts.some((count) => count > 4)) overdesignReasons.push("One or more moments contain more than four sound cues.");
  if (allFootwear) overdesignReasons.push("Every moment makes footwear the dominant sound.");

  const qc: SoundWorldQc = {
    narrative_preserved: gate(
      "narrative_preserved",
      input.narrativePreserved,
      input.narrativePreserved
        ? "Moment order, Scene, What Happens, and Product Presence remain unchanged."
        : "Sound World output changed the upstream Narrative, Scene, or Product Presence."
    ),
    scene_physically_consistent: gate(
      "scene_physically_consistent",
      input.physicalMismatches.length === 0,
      input.physicalMismatches.length === 0
        ? "All sound cues are compatible with the resolved Scene and physical surface."
        : input.physicalMismatches.join(" ")
    ),
    no_invented_event: gate(
      "no_invented_event",
      input.inventedEvents.length === 0,
      input.inventedEvents.length === 0
        ? "No sound cue introduces a new Narrative event."
        : input.inventedEvents.join(" ")
    ),
    no_overdesign: gate(
      "no_overdesign",
      overdesignReasons.length === 0,
      overdesignReasons.length === 0
        ? "Sound density and dominant-sound distribution remain restrained."
        : overdesignReasons.join(" ")
    ),
  };

  return {
    qc,
    allPassed: Object.values(qc).every((entry) => entry.status === "PASS"),
  };
}
