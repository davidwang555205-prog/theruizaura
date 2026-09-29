import { build } from "esbuild";
import { mkdtemp, rm, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const previous = join(projectRoot, "artifacts/immersive-final-naturalism-timing-framing-v1-acceptance");
const tempDirectory = await mkdtemp(join(tmpdir(), "immersive-closure-tracking-brand-stop-"));
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
        id: `closure-tracking-brand-stop-${topic.id}-${index}`,
        label,
      })),
    });
    assert(outcome.status === "GENERATED", `${topic.id} did not generate`);
    outcomes.set(topic.id, outcome);
  }

  const checks = [];
  const check = (id, name, passed) => checks.push({ id, name, status: passed ? "PASS" : "FAIL" });
  const allOutcomes = [...outcomes.values()];
  const walk = outcomes.get("weekend_walk");
  const bookstore = outcomes.get("bookstore_browse");
  const cafe = outcomes.get("afternoon_cafe");
  const walkText = walk.modelFacingScript.compiledText;
  const bookstoreText = bookstore.modelFacingScript.compiledText;

  check(
    "01",
    "OBSERVER without followerWarrant cannot translate with protagonist",
    allOutcomes.every((outcome) => outcome.cameraNarrative.moments.every((moment) => moment.role !== "FOLLOWER"))
      && walk.cameraExecution.plan.moments.every((moment) => moment.cameraMovement === "locked_off" || moment.cameraMovement === "hold_position")
      && /never translates, dollies, walks with, or maintains subject distance/i.test(walkText)
  );
  check(
    "02",
    "OBSERVER walking-away case cannot preserve subject distance",
    walk.cameraExecution.plan.moments.every((moment) => /distance is not maintained/i.test(moment.workingDistance ?? ""))
      && !/\d+(?:\.\d+)?-\d+(?:\.\d+)? m working distance/i.test(walkText)
      && /does not travel with, accompany, or maintain distance/i.test(walkText)
  );
  check(
    "03",
    "world-anchored camera permits subject apparent-scale change",
    /apparent subject size changes naturally/i.test(walkText)
      || /apparent size decreases naturally/i.test(walkText)
  );
  check(
    "04",
    "Moment boundary cannot authorize hidden tracking",
    walk.modelFacingScript.diagnostics.cameraTransitions.every((transition, index) => (
      index === 0 || transition.changed === false
    )) && walk.presentation.directorScript.takes.length === 1
  );
  check(
    "05",
    "READABLE cannot authorize distance preservation",
    walk.cameraExecution.plan.moments
      .filter((moment) => moment.productPresence === "READABLE")
      .every((moment) => /never changes camera height, distance, crop, tilt, movement, or subject framing/i.test(moment.productVisibilityGuard))
      && /distance is not maintained/i.test(walk.cameraExecution.plan.moments.find((moment) => moment.productPresence === "READABLE")?.workingDistance ?? "")
  );
  check(
    "06",
    "reference brand cannot propagate to world signage",
    /brand name, logo, typography, product mark, packaging identity, and trademark cues stay on the protagonist's worn product/i.test(bookstoreText)
      && /never appear in storefront text, signage, glass lettering, posters, advertisements, shelves, wall graphics, or background merchandise/i.test(bookstoreText)
  );
  check(
    "07",
    "reference logo cannot propagate to environmental text",
    bookstoreText.includes("logo, typography, product mark")
      && bookstoreText.includes("Any environmental text must be generic location text only")
  );
  check(
    "08",
    "bookstore cannot receive footwear-brand storefront identity",
    !/THERUIZ|AURA/i.test(bookstore.script.compiledText)
      && !/THERUIZ|AURA/i.test(bookstoreText)
      && bookstoreText.includes("generic location text only")
  );
  check(
    "09",
    "product-world shape isolation remains",
    bookstoreText.includes("The protagonist's own worn shoes are her own ordinary footwear and not a product reference")
      && !/The uploaded footwear reference applies only/i.test(bookstoreText)
      && bookstoreText.includes("The window and shelf displays contain books and reading material, never footwear")
  );
  const stopMoment = bookstore.modelFacingScript.moments.find((moment) => /WINDOW STOP/i.test(moment.title));
  const observationMoment = bookstore.modelFacingScript.moments.find((moment) => /SHE KEEPS SEARCHING/i.test(moment.title));
  const stopDuration = stopMoment ? stopMoment.timeRange.endSecond - stopMoment.timeRange.startSecond : 0;
  const observationDuration = observationMoment ? observationMoment.timeRange.endSecond - observationMoment.timeRange.startSecond : 0;
  check(
    "10",
    "consecutive stationary Moments form one stationary span",
    stopDuration > 0
      && observationDuration > 0
      && stopDuration <= 2
      && observationDuration <= stopDuration
      && (stopDuration + observationDuration) / 15 < 0.25
  );
  check(
    "11",
    "observation does not add a second full hold after TRUE_STOP",
    bookstoreText.includes("The observation happens inside the already established stop; it does not add a second full physical hold")
      && observationDuration < stopDuration
  );
  const bookstoreEvents = bookstore.modelFacingScript.contracts.flatMap((contract) => contract.requiredVisibleEvidence).map((event) => event.id);
  check("12", "WINDOW_STOP remains a real stop", bookstoreEvents.includes("WINDOW_STOP")
    && bookstore.modelFacingScript.contracts[2].worldStateAfter.facts["character.motion"] === "STOPPED");
  check("13", "ENTER_STORE remains", bookstoreEvents.includes("ENTER_STORE"));

  const previousCafe = await readFile(join(previous, "A-cafe", "compiled-final-script.txt"), "utf8");
  const previousCafeFinalState = await readFile(join(previous, "A-cafe", "final-state.json"), "utf8");
  const previousCafeStateTimeline = await readFile(join(previous, "A-cafe", "state-timeline.json"), "utf8");
  // The frozen Cafe artifact is a renderer-prose snapshot. This gate reads the same
  // frozen Cafe truth through the final script instead of freezing its wording, and
  // it adds the final-output consolidation obligations.
  const cafeTakeTwoOpening = cafe.modelFacingScript.moments[1];
  check(
    "14",
    "Cafe final script keeps its frozen behavior and the consolidated renderer contract",
    previousCafe.includes("This is an actively operating cafe, not an empty set")
      && cafe.modelFacingScript.compiledText.includes("This is an actively operating cafe, not an empty set")
      && JSON.stringify(cafe.modelFacingScript.contracts.at(-1).worldStateAfter) === JSON.stringify(JSON.parse(previousCafeFinalState))
      && JSON.stringify(cafe.modelFacingScript.contracts.map((contract) => ({
        moment: contract.momentIndex + 1,
        authority: contract.stateAuthority,
        before: contract.worldStateBefore,
        preconditionEvidence: contract.stateConflicts,
        after: contract.worldStateAfter,
      }))) === JSON.stringify(JSON.parse(previousCafeStateTimeline))
      && /opens on its own approved camera state/i.test(cafeTakeTwoOpening.cameraObservation)
      && cafe.modelFacingScript.compiledText.includes("beyond the declared Take Plan")
      && (cafe.modelFacingScript.compiledText.includes("The sequence ends on the state the last action has already reached")
        || cafe.modelFacingScript.compiledText.includes("She remains in the same seat reached by the last action; nothing else begins."))
      && !/The uploaded footwear reference applies only/i.test(cafe.modelFacingScript.compiledText)
      && (cafe.modelFacingScript.compiledText.match(/No product reference is confirmed/g) ?? []).length >= 1
  );

  const frozenAmbientActivity = {
    CAFE_VISIT: ["barista is naturally working behind the counter", "a few unrelated customers occupy the seating area or pass through the depth of the room", "one existing customer shifting a chair", "a person crossing deeper background", "cups being placed and ordinary cafe circulation"],
    BOOKSTORE_VISIT: ["staff shelving books", "one customer browsing deeper inside", "a page turning or a person crossing behind shelving"],
  };
  check(
    "15",
    "Ambient World Activity unchanged",
    JSON.stringify(locationWorldTruthOf("CAFE_VISIT").ambientActivity) === JSON.stringify(frozenAmbientActivity.CAFE_VISIT)
      && JSON.stringify(locationWorldTruthOf("BOOKSTORE_VISIT").ambientActivity) === JSON.stringify(frozenAmbientActivity.BOOKSTORE_VISIT)
  );

  const cases = [
    ["weekend_walk", "A-weekend-walk", "C-weekend-walk"],
    ["bookstore_browse", "B-bookstore", "B-bookstore"],
  ];
  const expectedPhysicalActions = {
    weekend_walk: ["walking-006", "walking-006", "walking-026", "transition-010", "transition-010"],
    bookstore_browse: ["walking-006", "environment-response-004", "transition-010", "transition-010", "walking-006"],
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

  check("16", "Physical Action unchanged", cases.every(([topicId]) => same(
    outcomes.get(topicId).physicalAction.report.moments.map((moment) => moment.selectedActionId),
    expectedPhysicalActions[topicId]
  )));
  check("17", "State timeline unchanged", await structuredIdentical("state-timeline.json", stateProjection));
  check("18", "Take Plan unchanged", await structuredIdentical("take-plan.json", takeProjection));
  check("19", "Mandatory Events unchanged", await structuredIdentical("mandatory-visual-events.json", eventProjection));
  check("19b", "final state unchanged", await structuredIdentical("final-state.json", finalProjection));
  check(
    "20",
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
    "21",
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
