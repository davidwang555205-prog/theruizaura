import { build } from "esbuild";
import { mkdtemp, rm, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const previous = join(projectRoot, "artifacts/immersive-naturalistic-execution-v1-acceptance");
const tempDirectory = await mkdtemp(join(tmpdir(), "immersive-no-sigh-validation-"));
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
    NARRATIVE_PRIMITIVE_REGISTRY,
    EMOTION_NEVER_ACTS_RULE,
    findForbiddenEmotionalReleaseWording,
    findForbiddenSoundCueWording,
    extractMomentRequirement,
    runImmersiveNarrativePipeline,
    compileModelFacingExecutionScript,
  } = api;

  const outcomes = new Map();
  for (const topic of NARRATIVE_TOPIC_CATALOG) {
    const outcome = runImmersiveNarrativePipeline({
      topic: topic.label,
      characterSelection: { ageProfileId: "age_28_32", appearanceGroupId: "asian" },
      season: "秋",
      lifestyleFeeling: "安静 / 克制",
      availableSceneLibrary: topic.defaultSceneLabels.map((label, index) => ({
        id: `no-sigh-${topic.id}-${index}`,
        label,
      })),
    });
    assert(outcome.status === "GENERATED", `${topic.id} did not generate`);
    outcomes.set(topic.id, outcome);
  }

  const checks = [];
  const check = (id, name, passed) => checks.push({ id, name, status: passed ? "PASS" : "FAIL" });
  const allOutcomes = [...outcomes.values()];
  const every = (fn) => allOutcomes.every(fn);

  const unmatched = allOutcomes
    .flatMap((outcome) => outcome.physicalAction.report.moments)
    .filter((moment) => moment.status === "UNRESOLVED");
  const shortTrip = outcomes.get("short_local_trip");
  check(
    "01",
    "13 topics zero unmatched Physical Action / SHORT_LOCAL_TRIP_ALL_MOMENTS_MATCHED",
    outcomes.size === 13
      && unmatched.length === 0
      && shortTrip.physicalAction.report.moments.every((moment) => moment.status === "MATCHED")
  );

  const emotionalWording = (text) => findForbiddenEmotionalReleaseWording(text).filter((id) => (
    id === "sigh" || id === "soft_sigh" || id === "deep_breath" || id === "emotional_exhale"
      || id === "visible_exhale" || id === "audible_exhale" || id === "relieved_breath"
      || id === "breathes_out" || id === "lets_out_a_breath"
  ));
  check(
    "02",
    "default Immersive scripts contain no sigh wording",
    every((outcome) => (
      !/\bsigh(?:s|ed|ing)?\b/i.test(outcome.modelFacingScript.compiledText)
      && !/\bsigh(?:s|ed|ing)?\b/i.test(outcome.script.compiledText)
      && !emotionalWording(outcome.modelFacingScript.compiledText).some((id) => id.includes("sigh"))
    ))
  );
  check(
    "03",
    "default Immersive scripts contain no emotional exhale wording",
    every((outcome) => (
      !/\bexhal(?:e|es|ed|ing|ation)\b/i.test(outcome.modelFacingScript.compiledText)
      && !/\bexhal(?:e|es|ed|ing|ation)\b/i.test(outcome.script.compiledText)
      && !emotionalWording(outcome.modelFacingScript.compiledText).some((id) => id.includes("exhale"))
    ))
  );

  // Sound World upstream source is fixed; the defensive gate also rejects a
  // sigh cue if a future patch reintroduces one.
  const soundCues = allOutcomes.flatMap((outcome) => outcome.soundWorld.moments.flatMap((moment) => [
    ...moment.environment,
    ...moment.human,
    ...moment.object,
    ...moment.footwear,
  ]));
  check(
    "05",
    "quiet / settled / relaxed cannot create sigh or breath cue",
    soundCues.every((cue) => findForbiddenSoundCueWording(cue).length === 0)
  );

  const home = outcomes.get("after_work_home");
  const guardedInput = JSON.parse(JSON.stringify(home.executionInput));
  guardedInput.soundWorld.moments[1].human = ["soft sigh", "audible exhale"];
  const guardedScript = compileModelFacingExecutionScript(guardedInput);
  const rejectedEmotionalCues = guardedScript.diagnostics.soundVerdicts.filter(
    (verdict) => !verdict.kept && verdict.rejectionReason === "EMOTIONAL_RELEASE_CUE"
  );
  check(
    "04",
    "Sound World cannot add sigh as emotional cue",
    rejectedEmotionalCues.length === 2
      && !/\bsigh\b|\bexhale\b/i.test(guardedScript.compiledText)
      && guardedScript.diagnostics.emotionalReleaseCues.length === 0
  );

  const emotionOnly = extractMomentRequirement({
    topicId: "after_work_home",
    topicLabel: "下班回家",
    momentIndex: 0,
    purpose: "establish_state",
    whatHappens: "She feels quietly settled and relaxed after work.",
    sceneId: "home",
    sceneName: "Home",
    productPresence: "ABSENT",
    cameraRole: "OBSERVER",
  });
  const primitiveWording = NARRATIVE_PRIMITIVE_REGISTRY.flatMap((primitive) => [
    primitive.narrativePrimitive?.bodyBehavior ?? "",
    primitive.narrativePrimitive?.handBehavior ?? "",
  ]);
  check(
    "06",
    "emotion cannot create new physical action",
    emotionOnly.requiredHandTask === "none"
      && emotionOnly.requiredHandCapabilities.every((entry) => entry.capability === "none")
      && primitiveWording.every((text) => findForbiddenEmotionalReleaseWording(text).length === 0)
      && every((outcome) => outcome.modelFacingScript.compiledText.includes(EMOTION_NEVER_ACTS_RULE))
  );

  // The three acceptance Cases keep the same logic inputs and all structured
  // artifacts; only the translated emotion/sound wording may change.
  const cases = [
    ["after_work_home", "B-after-work-home"],
    ["bookstore_browse", "D-bookstore"],
    ["afternoon_cafe", "A-cafe"],
  ];
  const structuralIdentical = async (file, project) => {
    for (const [topicId, name] of cases) {
      const outcome = outcomes.get(topicId);
      const contracts = outcome.modelFacingScript.contracts;
      const current = project(topicId, outcome, contracts);
      const baseline = JSON.parse(await readFile(join(previous, name, file), "utf8"));
      assert(
        JSON.stringify(current) === JSON.stringify(baseline),
        `${file} changed for ${topicId}`
      );
    }
    return true;
  };

  const stateProjection = (topicId, outcome, contracts) => contracts.map((contract) => ({
    moment: contract.momentIndex + 1,
    authority: contract.stateAuthority,
    before: contract.worldStateBefore,
    preconditionEvidence: contract.stateConflicts,
    after: contract.worldStateAfter,
  }));
  const takeProjection = (topicId, outcome, contracts) => outcome.presentation.directorScript.takes.map((take) => ({
    take: take.takeIndex + 1,
    moments: take.moments.map((moment) => moment.momentIndex + 1),
    motivation: take.motivation,
    boundary: contracts[take.moments[0].momentIndex].takeBoundary,
    inheritedStart: contracts[take.moments[0].momentIndex].worldStateBefore,
  }));
  const eventProjection = (topicId, outcome, contracts) => {
    const events = contracts.flatMap((contract) => contract.requiredVisibleEvidence);
    return [...new Map(events.map((item) => [item.id, item])).values()];
  };
  const finalProjection = (topicId, outcome, contracts) => contracts.at(-1).worldStateAfter;

  check("07", "No-Sigh changes do not alter structured state", await structuralIdentical("state-timeline.json", stateProjection));
  check("08", "No-Sigh changes do not alter Take Plan", await structuralIdentical("take-plan.json", takeProjection));
  check("09", "No-Sigh changes do not alter mandatory events", await structuralIdentical("mandatory-visual-events.json", eventProjection));
  check(
    "07b",
    "No-Sigh changes do not alter final state",
    await structuralIdentical("final-state.json", finalProjection)
  );

  const cafe = outcomes.get("afternoon_cafe");
  const walk = outcomes.get("weekend_walk");
  const store = outcomes.get("bookstore_browse");
  check(
    "10",
    "existing Physical Continuity regressions remain PASS",
    cafe.plan.moments.length === 5
      && cafe.presentation.directorScript.takes.length === 2
      && cafe.modelFacingScript.compiledText.includes("[ONE CONTINUOUS ACTION FLOW]")
      && cafe.modelFacingScript.compiledText.includes("MOMENT 5 · TAKE SEAT")
      && cafe.modelFacingScript.contracts[2].worldStateAfter.facts["character.motion"] === "WALKING"
      && walk.presentation.directorScript.takes.length === 1
      && walk.modelFacingScript.contracts.every((contract) => contract.worldStateAfter.facts["character.motion"] === "WALKING")
      && walk.modelFacingScript.compiledText.includes("[ONE CONTINUOUS ACTION FLOW]")
      && !walk.modelFacingScript.compiledText.includes("comes to a settled stop")
      && home.modelFacingScript.compiledText.includes("hand, torso, and weight may overlap without reversing the required event order")
      && home.modelFacingScript.contracts.flatMap((contract) => contract.requiredVisibleEvidence).map((event) => event.id).join(",") === "FIND_KEY,UNLOCK_DOOR,OPEN_DOOR,CROSS_THRESHOLD"
      && store.modelFacingScript.contracts[2].worldStateAfter.facts["character.motion"] === "STOPPED"
      && store.modelFacingScript.compiledText.includes("The last approaching step eases into this real stop")
  );

  // Emotional semantic leak: the negative guard alone is not enough protection.
  // Execution-level semantics must not carry the wording that makes a model
  // perform a relaxation beat in the first place.
  const executionSemanticScope = (outcome) => [
    ...outcome.modelFacingScript.moments.map((moment) => `${moment.whatHappens} ${moment.bodyBehavior} ${moment.cameraObservation} ${moment.naturalSound.join("; ")}`),
    outcome.presentation.directorScript.ending,
    outcome.modelFacingScript.compiledText,
  ].join("\n");
  const semanticLeak = (text) => [
    /\brelax(?:ed|es|ing|ation)?\b/i,
    /\brelie(?:f|ved|ve)\b/i,
    /\bunwind(?:ing|s)?\b/i,
    /\bdecompress(?:ing|es|ion)?\b/i,
    /\bsoften(?:s|ed|ing)?\b|\bsoftening\b/i,
    /\bless held\b/i,
    /\bsettle into comfort\b|\bcomfortable state\b/i,
    /\bemotional release\b/i,
  ].filter((pattern) => pattern.test(text)).length;
  const breathLeak = (text) => (text.match(/\bsigh(?:s|ed|ing)?\b|\bbreath(?:e|es|ing|s)?\b/gi) ?? []);
  const exhaleLeak = (text) => (text.match(/\bexhal(?:e|es|ed|ing|ation)\b|\bdeep\s+breath\b|\bbreathes?\s+out\b/gi) ?? []);
  const gestureLeak = (text) => (text.match(/\bshoulders?\s+(?:drop|relax|release|sink)\w*|\bsmiles?\b|\beyes?\s+clos\w+|\bself-?soothing\b|\brelief\s+gesture\b/gi) ?? []);

  check(
    "11",
    "execution semantics carry no relaxation / relief vocabulary",
    every((outcome) => semanticLeak(executionSemanticScope(outcome)) === 0)
  );
  check(
    "12",
    "execution semantics carry no sigh or breath priming",
    every((outcome) => breathLeak(executionSemanticScope(outcome)).length === 0
      && exhaleLeak(executionSemanticScope(outcome)).length === 0)
  );
  check(
    "13",
    "execution semantics carry no performed emotional gesture",
    every((outcome) => gestureLeak(executionSemanticScope(outcome)).length === 0)
  );

  const failures = checks.filter((entry) => entry.status === "FAIL");
  console.log(JSON.stringify({ status: failures.length ? "FAIL" : "PASS", checks, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
