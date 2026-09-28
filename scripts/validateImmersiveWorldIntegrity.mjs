import { build } from "esbuild";
import { mkdtemp, rm, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const previous = join(projectRoot, "artifacts/immersive-camera-naturalism-v1-acceptance");
const tempDirectory = await mkdtemp(join(tmpdir(), "immersive-world-integrity-"));
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
    PRODUCT_WORLD_EXCLUSIONS,
    locationWorldTruthOf,
    AURA_CAMERA_EXECUTION_ROLE_RULES,
    IMMERSIVE_CAMERA_NATURALISM_RULES,
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
        id: `world-integrity-${topic.id}-${index}`,
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

  const productRoleRule = /The uploaded footwear reference applies only to the protagonist's worn shoes/i;
  check(
    "01",
    "footwear reference binds only to protagonist worn product",
    allOutcomes.every((outcome) => (
      outcome.productPresence.scopeTarget === "PROTAGONIST_WORN_PRODUCT"
      && outcome.productPresence.curve.every((moment) => moment.scopeTarget === "PROTAGONIST_WORN_PRODUCT")
      && productRoleRule.test(outcome.modelFacingScript.compiledText)
    ))
  );
  check(
    "02",
    "product cannot propagate to world merchandise",
    allOutcomes.every((outcome) => (
      /Do not reproduce, echo, merchandise, display, advertise, print, place, or duplicate the referenced footwear anywhere else in the environment/i
        .test(outcome.modelFacingScript.compiledText)
      && outcome.modelFacingScript.compiledText.includes("The location keeps its own real-world merchandise and objects")
    ))
  );
  const bookstoreTruth = locationWorldTruthOf("BOOKSTORE_VISIT");
  check(
    "03",
    "Bookstore cannot contain footwear merchandise from reference",
    bookstoreTruth.allowedEnvironmentContent.every((item) => !/shoe|footwear|merchandise/i.test(item))
      && bookstoreTruth.excludedEnvironmentContent.some((item) => /shoe displays|footwear/i.test(item))
      && bookstore.modelFacingScript.compiledText.includes("The window and shelf displays contain books and reading material, never footwear")
      && bookstore.modelFacingScript.compiledText.includes("shoe displays")
  );
  const cafeTruth = locationWorldTruthOf("CAFE_VISIT");
  check(
    "04",
    "Cafe cannot contain duplicated product display",
    cafeTruth.allowedEnvironmentContent.every((item) => !/shoe|footwear|display|merchandise/i.test(item))
      && cafeTruth.excludedEnvironmentContent.some((item) => /footwear|shoe displays/i.test(item))
      && cafe.modelFacingScript.compiledText.includes("another person's identical footwear")
  );
  check(
    "05",
    "background person cannot inherit identical reference product",
    allOutcomes.every((outcome) => outcome.modelFacingScript.compiledText.includes("another person's identical footwear"))
  );
  check(
    "06",
    "READABLE affects protagonist footwear only",
    allOutcomes.every((outcome) => outcome.productPresence.curve
      .filter((moment) => moment.presence === "READABLE" || moment.presence === "HERO")
      .every((moment) => moment.scopeTarget === "PROTAGONIST_WORN_PRODUCT"))
      && allOutcomes.every((outcome) => outcome.cameraExecution.plan.moments
        .filter((moment) => moment.productPresence === "READABLE")
        .every((moment) => /intermittent|no guaranteed duration/i.test(moment.productVisibilityGuard)))
  );
  check(
    "07",
    "Scene category cannot change because of product reference",
    bookstoreTruth.category === "bookstore"
      && bookstoreTruth.allowedEnvironmentContent.some((item) => /book/i.test(item))
      && PRODUCT_WORLD_EXCLUSIONS.every((item) => !bookstoreTruth.allowedEnvironmentContent.includes(item))
      && bookstore.sceneResolution.resolvedMoments.every((moment) => /bookstore/.test(moment.sceneId))
  );
  const observer = AURA_CAMERA_EXECUTION_ROLE_RULES.OBSERVER;
  check(
    "08",
    "OBSERVER cannot require subject center lock",
    /optical center is not required|leave the visual center naturally/i.test(observer.subjectVisibility)
      && !/must stay centered|keep the subject centered|center lock/i.test(`${observer.subjectVisibility} ${observer.movementRelationToSubject}`)
  );
  check(
    "09",
    "static observer cannot require central vanishing-axis walking",
    IMMERSIVE_CAMERA_NATURALISM_RULES.some((rule) => /centered vanishing-axis|runway composition/i.test(rule))
      && !/centered vanishing|central axis|symmetr/i.test(observer.subjectVisibility)
  );
  check(
    "10",
    "walking protagonist may leave optical center",
    walk.modelFacingScript.compiledText.includes("leave the optical center without any camera correction")
      && walk.modelFacingScript.compiledText.includes("enter off-center")
  );
  check(
    "11",
    "world ambient activity cannot become narrative event",
    allOutcomes.every((outcome) => {
      const truth = locationWorldTruthOf(
        outcome.sceneResolution.locationWorld?.id ?? null,
        outcome.sceneResolution.resolvedMoments.map((moment) => moment.sceneId)
      );
      return truth.publicSpace
        ? /All background activity is incidental, low-intensity, independent, and never becomes a narrative event/i
            .test(outcome.modelFacingScript.compiledText)
          && (/never become narrative subjects/i.test(outcome.modelFacingScript.compiledText)
            || /Keep ambient people secondary, incidental/i.test(outcome.modelFacingScript.compiledText))
        : /private home environment/i.test(outcome.modelFacingScript.compiledText);
    })
  );
  check(
    "12",
    "ambient activity may temporarily occlude product",
    allOutcomes.every((outcome) => (
      outcome.modelFacingScript.compiledText.includes("Existing environment activity may legally cross or block part of the view")
      && outcome.modelFacingScript.compiledText.includes("temporary loss of product readability")
    ))
  );
  check(
    "13",
    "camera cannot recover from ambient occlusion solely for readability",
    IMMERSIVE_CAMERA_NATURALISM_RULES.some((rule) => /recovery camera move/i.test(rule))
      && allOutcomes.every((outcome) => (
        /does not re-center, chase, or recover subject or product presentation/i.test(outcome.modelFacingScript.compiledText)
        || /never translates, dollies, walks with, or maintains subject distance/i.test(outcome.modelFacingScript.compiledText)
      ))
  );
  check(
    "14",
    "Cafe causal chain unchanged",
    cafe.plan.moments.map((moment) => moment.purpose).join(",") === "establish_state,approach_trigger,micro_event,response,after_state"
      && /open seat/i.test(cafe.plan.moments[1].whatHappens)
      && /takes a seat|sit/i.test(cafe.plan.moments[4].whatHappens)
  );
  const bookstoreEvents = bookstore.modelFacingScript.contracts.flatMap((contract) => contract.requiredVisibleEvidence).map((event) => event.id);
  check(
    "15",
    "Bookstore WINDOW_STOP / ENTER_STORE unchanged",
    bookstoreEvents.includes("WINDOW_STOP")
      && bookstoreEvents.includes("ENTER_STORE")
      && bookstore.modelFacingScript.contracts[2].worldStateAfter.facts["character.motion"] === "STOPPED"
  );
  check(
    "16",
    "Weekend Walk Take/Physical Action unchanged",
    walk.presentation.directorScript.takes.length === 1
      && JSON.stringify(walk.physicalAction.report.moments.map((moment) => moment.selectedActionId))
        === JSON.stringify(["walking-006", "walking-006", "walking-026", "transition-010", "transition-010"])
  );

  const cases = [
    ["afternoon_cafe", "C-cafe"],
    ["bookstore_browse", "B-bookstore"],
    ["weekend_walk", "A-weekend-walk"],
  ];
  const expectedPhysicalActions = {
    afternoon_cafe: ["walking-006", "walking-006", "turning-006", "walking-026", "seated-004"],
    bookstore_browse: ["walking-006", "environment-response-004", "transition-010", "transition-010", "walking-006"],
    weekend_walk: ["walking-006", "walking-006", "walking-026", "transition-010", "transition-010"],
  };
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const readBaseline = (name, file) => readFile(join(previous, name, file), "utf8");

  const structuredIdentical = async (file, project) => {
    for (const [topicId, name] of cases) {
      const outcome = outcomes.get(topicId);
      assert(same(project(outcome), JSON.parse(await readBaseline(name, file))), `${file} changed for ${topicId}`);
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

  check("17", "state timeline unchanged", await structuredIdentical("state-timeline.json", stateProjection));
  check("18", "Physical Action unchanged", cases.every(([topicId]) => same(
    outcomes.get(topicId).physicalAction.report.moments.map((moment) => moment.selectedActionId),
    expectedPhysicalActions[topicId]
  )));
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
      outcome.sceneResolution.status === "SCENE_RESOLUTION_APPROVED"
      && outcome.productPresence.status === "PRODUCT_PRESENCE_APPROVED"
      && outcome.cameraNarrative.status === "CAMERA_NARRATIVE_APPROVED"
      && outcome.cameraExecution.plan.status === "CAMERA_EXECUTION_APPROVED"
      && outcome.executionValidation.status === "EXECUTION_SCRIPT_VALIDATED"
    ))
  );

  const failures = checks.filter((entry) => entry.status === "FAIL");
  console.log(JSON.stringify({ status: failures.length ? "FAIL" : "PASS", checks, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
