import { build } from "esbuild";
import { resolve } from "node:path";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const bundled = await build({
  stdin: { contents: `export * from ${JSON.stringify(resolve(root, "src/immersive-narrative/index.ts"))};` , resolveDir: root },
  bundle: true, format: "esm", platform: "node", write: false, logLevel: "silent",
});
const temp = await mkdtemp(join(tmpdir(), "immersive-structured-validation-"));
const bundledPath = join(temp, "bundle.mjs");
await writeFile(bundledPath, bundled.outputFiles[0].text);
const api = await import(pathToFileURL(bundledPath).href);
await rm(temp, { recursive: true, force: true });
const {
  NARRATIVE_TOPIC_CATALOG,
  runImmersiveNarrativePipeline,
  TOPIC_STATE_DATA,
  reduceMomentState,
  buildExecutionMomentContracts,
  EMOTION_NEVER_ACTS_RULE,
  findForbiddenEmotionalReleaseWording,
  findForbiddenSoundCueWording,
} = api;
const outcomes = new Map();
for (const topic of NARRATIVE_TOPIC_CATALOG) {
  const outcome = runImmersiveNarrativePipeline({
    topic: topic.label, characterSelection: { ageProfileId: "age_28_32", appearanceGroupId: "asian" },
    season: "秋", lifestyleFeeling: "安静 / 克制",
    availableSceneLibrary: topic.defaultSceneLabels.map((label, index) => ({ id: `structured-${topic.id}-${index}`, label })),
  });
  outcomes.set(topic.id, outcome);
}
const get = (id) => outcomes.get(id);
const checks = [];
const check = (id, name, passed) => checks.push({ id, name, status: passed ? "PASS" : "FAIL" });
const home = get("after_work_home");
const cafe = get("afternoon_cafe");
const walk = get("weekend_walk");
const city = get("city_wandering");
const bookstore = get("bookstore_browse");
const contracts = (id) => get(id).modelFacingScript.contracts;
const probe = (id, before, index) => reduceMomentState(id, index, before);
const snap = (facts, completedEvents = []) => ({ facts, completedEvents });
check("01", "repeat unlock blocked", probe("after_work_home", snap({ "door.lock": "UNLOCKED", "key.location": "HAND" }, ["UNLOCK_DOOR"]), 2).errors.length > 0);
check("02", "repeat open blocked", probe("evening_return_home", snap({ "door.lock": "UNLOCKED", "door.state": "OPEN" }, ["OPEN_DOOR"]), 3).errors.length > 0);
check("03", "inside cannot reset outside", probe("errand_outing", snap({ "door.state": "OPEN", "character.place": "INSIDE" }, ["OPEN_AND_EXIT"]), 1).errors.length > 0);
check("04", "put-down object cannot return to hand", probe("weekend_alone", snap({ "object.location": "HAND" }), 2).errors.length > 0);
check("05", "repeat sit blocked", probe("afternoon_cafe", snap({ "character.place": "SEAT", "seat.state": "OCCUPIED" }, ["TAKE_SEAT"]), 4).errors.length > 0);
check("06", "single-use repeat blocked", probe("short_local_trip", snap({ "arrival.state": "ARRIVED" }, ["ARRIVE"]), 4).errors.length > 0);
check("07", "state inherited exactly", [...outcomes.values()].every((outcome) => outcome.status === "GENERATED" && outcome.modelFacingScript.contracts.every((c, i, all) => i === 0 || JSON.stringify(c.worldStateBefore) === JSON.stringify(all[i - 1].worldStateAfter))));
check("08", "critical transition mandatory", contracts("after_work_home")[2].requiredVisibleEvidence.some((e) => e.id === "UNLOCK_DOOR") && home.modelFacingScript.compiledText.includes("[MANDATORY VISUAL COMPLETION]"));
check("09", "event and effect deduplicated", contracts("afternoon_cafe")[4].requiredVisibleEvidence.filter((e) => e.id === "TAKE_SEAT").length === 1 && (cafe.modelFacingScript.compiledText.match(/The character visibly takes the same open chair/g) ?? []).length === 1);
check("10", "final state waits for mandatory completion", home.modelFacingScript.compiledText.includes("Do not enter the final state while any mandatory visual event above remains incomplete."));
check("11", "cafe five moments two takes", cafe.plan.moments.length === 5 && cafe.presentation.directorScript.takes.length === 2 && cafe.modelFacingScript.compiledText.split("TAKE 2 —")[1]?.includes("[ONE CONTINUOUS ACTION FLOW]") && cafe.modelFacingScript.compiledText.includes("MOMENT 5 · TAKE SEAT"));
check("12", "weekend walk moments are not takes", walk.plan.moments.length === 5 && walk.presentation.directorScript.takes.length === 1);
check("13", "city product cannot stop walk", city.modelFacingScript.compiledText.includes("[ONE CONTINUOUS ACTION FLOW]") && city.modelFacingScript.compiledText.includes("no stop or reframe"));
check("14", "home door state inherited", contracts("after_work_home")[3].worldStateBefore.facts["door.lock"] === "UNLOCKED" && contracts("after_work_home")[4].worldStateBefore.facts["door.state"] === "OPEN");
check("15", "cross-take state inheritance emitted", cafe.modelFacingScript.compiledText.includes("Keep what the previous take already established:") && home.modelFacingScript.compiledText.includes("The same door is already unlocked; do not unlock it again."));
check("16", "continuous walk action flow", walk.modelFacingScript.compiledText.includes("[ONE CONTINUOUS ACTION FLOW]") && !walk.modelFacingScript.compiledText.includes("comes to a settled stop"));
check("17", "no product stop without structured stop", walk.modelFacingScript.compiledText.includes("Do not stop, restart, hold a stationary pose, or pause for product readability.") && !walk.modelFacingScript.compiledText.includes("comes to a settled stop"));
check("18", "real wait or settle preserved", contracts("waiting_for_friend")[2].worldStateAfter.facts["character.motion"] === "WAITING" && !get("waiting_for_friend").modelFacingScript.compiledText.includes("[ONE CONTINUOUS ACTION FLOW]"));
check("19", "cafe final seated closure", contracts("afternoon_cafe")[4].worldStateAfter.facts["character.motion"] === "SEATED" && cafe.modelFacingScript.compiledText.includes("do not add a new task"));
check("20", "home final does not restart door", contracts("after_work_home")[4].worldStateAfter.facts["character.place"] === "INSIDE" && home.modelFacingScript.moments[4].whatHappens.includes("remains inside"));
const homeInput = home.executionInput;
const changedWords = { ...homeInput, plan: { ...homeInput.plan, moments: homeInput.plan.moments.map((m, i) => i === 2 ? { ...m, whatHappens: "Different prose." } : m) } };
check("21", "wording cannot rewrite structured facts", JSON.stringify(buildExecutionMomentContracts(changedWords)[2].worldStateAfter) === JSON.stringify(contracts("after_work_home")[2].worldStateAfter));
check("22", "compiled text not authoritative", !JSON.stringify(TOPIC_STATE_DATA).includes("compiledText") && contracts("after_work_home")[2].worldStateAfter.facts["door.lock"] === "UNLOCKED");
check("23", "take boundary has structured evidence", [...outcomes.values()].every((o) => o.modelFacingScript.contracts.every((c) => !c.takeBoundary || Boolean(c.takeBoundary.evidence && c.takeBoundary.whyContinuousCoverageFails))));
check("24", "spatial movement alone no take", walk.presentation.directorScript.takes.length === 1 && city.presentation.directorScript.takes.length === 1);
check("25", "all thirteen compile", outcomes.size === 13 && [...outcomes.values()].every((o) => o.status === "GENERATED"));
check("26", "upstream validators preserved", [...outcomes.values()].every((o) => o.status === "GENERATED" && o.executionValidation.status === "EXECUTION_SCRIPT_VALIDATED" && o.presentationValidation.status === "DIRECTOR_SCRIPT_VALIDATED"));
check("27", "all thirteen topics have zero unmatched Physical Action moments", [...outcomes.values()].every((o) => o.physicalAction.report.moments.every((moment) => moment.status === "MATCHED")));
check("28", "default scripts contain no sigh or emotional exhale wording", [...outcomes.values()].every((o) => findForbiddenEmotionalReleaseWording(o.modelFacingScript.compiledText).length === 0 && findForbiddenEmotionalReleaseWording(o.script.compiledText).length === 0));
check("29", "Sound World cues never make an internal state audible", [...outcomes.values()].every((o) => o.soundWorld.moments.flatMap((moment) => [...moment.environment, ...moment.human, ...moment.object, ...moment.footwear]).every((cue) => findForbiddenSoundCueWording(cue).length === 0)));
check("30", "emotion cannot create a new action", [...outcomes.values()].every((o) => o.modelFacingScript.compiledText.includes(EMOTION_NEVER_ACTS_RULE) && !o.modelFacingScript.compiledText.includes("CORRECT_UNSUPPORTED")));
const failures = checks.filter((c) => c.status === "FAIL");
console.log(JSON.stringify({ status: failures.length ? "FAIL" : "PASS", checks, failures }, null, 2));
if (failures.length) process.exitCode = 1;
