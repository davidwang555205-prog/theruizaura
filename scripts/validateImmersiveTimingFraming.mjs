import { build } from "esbuild";
import { mkdtemp, rm, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const previous = join(projectRoot, "artifacts/immersive-world-integrity-naturalism-v1-acceptance");
const tempDirectory = await mkdtemp(join(tmpdir(), "immersive-timing-framing-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

try {
  await writeFile(
    entryPath,
    `export * from ${JSON.stringify(resolve(projectRoot, "src/immersive-narrative/index.ts"))};\n`
  );
  await build({
    entryPoints: [entryPath],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile: bundlePath,
    logLevel: "silent",
  });
  const api = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);
  const {
    NARRATIVE_TOPIC_CATALOG,
    AURA_CAMERA_EXECUTION_ROLE_RULES,
    IMMERSIVE_CAMERA_NATURALISM_RULES,
    locationWorldTruthOf,
    EMOTION_NEVER_ACTS_RULE,
    findForbiddenEmotionalReleaseWording,
    findForbiddenSoundCueWording,
    runImmersiveNarrativePipeline,
  } = api;

  const outcomes = new Map();
  for (const topic of NARRATIVE_TOPIC_CATALOG) {
    const outcome = runImmersiveNarrativePipeline({
      topic: topic.label,
      characterSelection: { ageProfileId: "age_28_32", appearanceGroupId: "asian" },
      season: "秋",
      lifestyleFeeling: "安静 / 克制",
      availableSceneLibrary: topic.defaultSceneLabels.map((label, index) => ({
        id: `timing-framing-${topic.id}-${index}`,
        label,
      })),
    });
    assert(outcome.status === "GENERATED", `${topic.id} did not generate`);
    outcomes.set(topic.id, outcome);
  }

  const checks = [];
  const check = (id, name, passed) => checks.push({ id, name, status: passed ? "PASS" : "FAIL" });
  const allOutcomes = [...outcomes.values()];
  const cafe = outcomes.get("afternoon_cafe");
  const bookstore = outcomes.get("bookstore_browse");
  const walk = outcomes.get("weekend_walk");
  const cameraText = (topicId) => outcomes.get(topicId).modelFacingScript.compiledText;

  check(
    "01",
    "READABLE cannot lower camera for footwear",
    allOutcomes.every((outcome) => outcome.cameraExecution.plan.moments
      .filter((moment) => moment.productPresence === "READABLE")
      .every((moment) => /never lowers the camera toward footwear/i.test(moment.productVisibilityGuard)))
  );
  check(
    "02",
    "READABLE cannot create lower-body-only framing",
    cameraText("weekend_walk").includes("prolonged lower-body-only crop")
      && walk.cameraExecution.plan.moments.filter((moment) => moment.productPresence === "READABLE")
        .every((moment) => moment.shotScale !== "partial_body_observation")
  );
  check(
    "03",
    "product presence cannot trigger upward reveal tilt",
    IMMERSIVE_CAMERA_NATURALISM_RULES.includes("no upward shoe-to-person reveal tilt")
      && cameraText("weekend_walk").includes("upward shoe reveal tilt")
  );
  const partial = AURA_CAMERA_EXECUTION_ROLE_RULES.PARTIAL_OBSERVATION;
  check(
    "04",
    "partial observation cannot authorize product-isolated crop",
    /never a product crop/i.test(partial.movementRelationToSubject)
      && /footwear-dominant crop is forbidden/i.test(partial.subjectVisibility)
      && /never lowers the camera toward footwear/i.test(partial.movementRelationToSubject)
  );
  check(
    "05",
    "footwear cannot own a dedicated frame in Immersive",
    IMMERSIVE_CAMERA_NATURALISM_RULES.includes("no ankle-level or shoe-level product framing")
      && cameraText("weekend_walk").includes("The camera may discover the product, but never gives it its own frame")
  );
  check(
    "06",
    "mandatory event requires legibility, not complete action coverage",
    allOutcomes.every((outcome) => outcome.modelFacingScript.compiledText.includes("A mandatory event must be legible, but complete action coverage is not required"))
  );
  check(
    "07",
    "Cafe TAKE_SEAT may be partially occluded",
    cameraText("afternoon_cafe").includes("the final seat action may be partly occluded")
      && cameraText("afternoon_cafe").includes("TAKE_SEAT completion must remain legible")
  );
  check(
    "08",
    "Camera cannot track entire Cafe route solely for coverage",
    cameraText("afternoon_cafe").includes("The camera does not owe continuous coverage of the entire route")
      && /Never pan, drift, or reframe solely to keep covering the protagonist/i.test(cameraText("afternoon_cafe"))
  );
  const durationsOf = (topicId) => outcomes.get(topicId).modelFacingScript.moments.map(
    (moment) => moment.timeRange.endSecond - moment.timeRange.startSecond
  );
  check(
    "09",
    "Moment durations need not be equal",
    ["afternoon_cafe", "bookstore_browse", "weekend_walk"].every((topicId) => new Set(durationsOf(topicId).map((duration) => Math.round(duration * 10) / 10)).size > 1)
  );
  const stopMoment = bookstore.modelFacingScript.moments.find((moment) => /WINDOW STOP/i.test(moment.title));
  const observationMoment = bookstore.modelFacingScript.moments.find((moment) => /SHE KEEPS SEARCHING/i.test(moment.title));
  const stopDuration = stopMoment ? stopMoment.timeRange.endSecond - stopMoment.timeRange.startSecond : 0;
  const observationDuration = observationMoment ? observationMoment.timeRange.endSecond - observationMoment.timeRange.startSecond : 0;
  check(
    "10",
    "TRUE_STOP does not imply long hold",
    stopDuration > 0 && stopDuration <= 2
      && observationDuration > 0 && observationDuration <= 2.2
      && cameraText("bookstore_browse").includes("The window look lasts only as long as the real stop requires")
  );
  check(
    "11",
    "Bookstore observation cannot consume disproportionate video duration",
    (stopDuration + observationDuration) / 15 < 0.3
  );
  check(
    "12",
    "non-mandatory lean-in cannot be created only to fill observation time",
    cameraText("bookstore_browse").includes("Do not add a prolonged neutral stance, a lean-in, or an extra viewing performance")
      && !/leans?\s+(?:toward|into) the window/i.test(bookstore.plan.moments.map((moment) => moment.whatHappens).join(" "))
  );
  const bookstoreEvents = bookstore.modelFacingScript.contracts.flatMap((contract) => contract.requiredVisibleEvidence).map((event) => event.id);
  check(
    "13",
    "event completion cannot break structured event order",
    bookstoreEvents.indexOf("WINDOW_STOP") === 0
      && bookstoreEvents.indexOf("ENTER_STORE") === 1
      && bookstore.modelFacingScript.contracts[2].worldStateAfter.facts["character.motion"] === "STOPPED"
  );
  const cafeTruth = locationWorldTruthOf("CAFE_VISIT");
  check(
    "14",
    "Cafe category cannot become dominant bookstore environment",
    cafeTruth.forbiddenDominantEnvironmentSignals.some((signal) => /bookstore/i.test(signal))
      && cafeTruth.allowedEnvironmentContent.every((item) => !/book|shelving|reading/i.test(item))
      && cameraText("afternoon_cafe").includes("dominant bookstore shelving")
  );
  check(
    "15",
    "Bookstore product-world isolation remains unchanged",
    cameraText("bookstore_browse").includes("The uploaded footwear reference applies only to the protagonist's worn shoes")
      && cameraText("bookstore_browse").includes("The window and shelf displays contain books and reading material, never footwear")
      && cameraText("bookstore_browse").includes("shoe displays")
  );
  const frozenAmbientActivity = {
    CAFE_VISIT: ["barista is naturally working behind the counter", "a few unrelated customers occupy the seating area or pass through the depth of the room", "one existing customer shifting a chair", "a person crossing deeper background", "cups being placed and ordinary cafe circulation"],
    BOOKSTORE_VISIT: ["staff shelving books", "one customer browsing deeper inside", "a page turning or a person crossing behind shelving"],
  };
  check(
    "16",
    "Ambient World Activity unchanged",
    JSON.stringify(locationWorldTruthOf("CAFE_VISIT").ambientActivity) === JSON.stringify(frozenAmbientActivity.CAFE_VISIT)
      && JSON.stringify(locationWorldTruthOf("BOOKSTORE_VISIT").ambientActivity) === JSON.stringify(frozenAmbientActivity.BOOKSTORE_VISIT)
  );

  const cases = [
    ["afternoon_cafe", "A-cafe", "C-cafe"],
    ["bookstore_browse", "B-bookstore", "B-bookstore"],
    ["weekend_walk", "C-weekend-walk", "A-weekend-walk"],
  ];
  const expectedPhysicalActions = {
    afternoon_cafe: ["walking-006", "walking-006", "turning-006", "walking-026", "seated-004"],
    bookstore_browse: ["walking-006", "environment-response-004", "transition-010", "transition-010", "walking-006"],
    weekend_walk: ["walking-006", "walking-006", "walking-026", "transition-010", "transition-010"],
  };
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const readBaseline = (name, file) => readFile(join(previous, name, file), "utf8");
  const structuredIdentical = async (file, project) => {
    for (const [topicId, , baselineName] of cases) {
      const outcome = outcomes.get(topicId);
      assert(same(project(outcome), JSON.parse(await readBaseline(baselineName, file))), `${file} changed for ${topicId}`);
    }
    return true;
  };
  const stateProjection = (outcome) => outcome.modelFacingScript.contracts.map((contract) => ({
    moment: contract.momentIndex + 1,
    authority: contract.stateAuthority,
    before: contract.worldStateBefore,
    preconditionEvidence: contract.stateConflicts,
    after: contract.worldStateAfter,
  }));
  const takeProjection = (outcome) => outcome.presentation.directorScript.takes.map((take) => ({
    take: take.takeIndex + 1,
    moments: take.moments.map((moment) => moment.momentIndex + 1),
    motivation: take.motivation,
    boundary: outcome.modelFacingScript.contracts[take.moments[0].momentIndex].takeBoundary,
    inheritedStart: outcome.modelFacingScript.contracts[take.moments[0].momentIndex].worldStateBefore,
  }));
  const eventProjection = (outcome) => {
    const events = outcome.modelFacingScript.contracts.flatMap((contract) => contract.requiredVisibleEvidence);
    return [...new Map(events.map((item) => [item.id, item])).values()];
  };
  const finalProjection = (outcome) => outcome.modelFacingScript.contracts.at(-1).worldStateAfter;

  check("17", "Physical Action unchanged", cases.every(([topicId]) => same(
    outcomes.get(topicId).physicalAction.report.moments.map((moment) => moment.selectedActionId),
    expectedPhysicalActions[topicId]
  )));
  check("18", "State timeline unchanged", await structuredIdentical("state-timeline.json", stateProjection));
  check("19", "Take Plan unchanged", await structuredIdentical("take-plan.json", takeProjection));
  check("20", "Mandatory Events unchanged", await structuredIdentical("mandatory-visual-events.json", eventProjection));
  check("20b", "final state unchanged", await structuredIdentical("final-state.json", finalProjection));
  check(
    "21",
    "No-Sigh unchanged",
    allOutcomes.every((outcome) => (
      findForbiddenEmotionalReleaseWording(outcome.modelFacingScript.compiledText).length === 0
      && findForbiddenEmotionalReleaseWording(outcome.script.compiledText).length === 0
      && outcome.modelFacingScript.compiledText.includes(EMOTION_NEVER_ACTS_RULE)
      && outcome.soundWorld.moments
        .flatMap((moment) => [...moment.environment, ...moment.human, ...moment.object, ...moment.footwear])
        .every((cue) => findForbiddenSoundCueWording(cue).length === 0)
    ))
  );
  check(
    "22",
    "13 Topics compile",
    outcomes.size === 13 && allOutcomes.every((outcome) => (
      outcome.cameraExecution.plan.status === "CAMERA_EXECUTION_APPROVED"
      && outcome.executionValidation.status === "EXECUTION_SCRIPT_VALIDATED"
      && outcome.scriptValidation.status === "IMMERSIVE_SEEDANCE_SCRIPT_VALIDATED"
    ))
  );

  const failures = checks.filter((entry) => entry.status === "FAIL");
  console.log(JSON.stringify({ status: failures.length ? "FAIL" : "PASS", checks, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
