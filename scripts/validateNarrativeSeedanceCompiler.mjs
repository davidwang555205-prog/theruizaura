import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Phase 8 validator. It compiles the final Seedance script for all 13 canonical
// topics from canonical upstream truth only, and asserts that nothing is
// regenerated, invented, dropped, or turned into a Provider call.
const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-seedance-compiler-validation-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

try {
  await writeFile(
    entryPath,
    `export * from ${JSON.stringify(resolve(projectRoot, "src/immersive-narrative/index.ts"))};\n`
  );
  await build({ entryPoints: [entryPath], bundle: true, format: "esm", platform: "node", outfile: bundlePath, logLevel: "silent" });
  const {
    NARRATIVE_TOPIC_CATALOG,
    runImmersiveNarrativePipeline,
  } = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);

  const perTopic = [];
  let compiledTopics = 0;
  let completeScripts = 0;
  let totalMoments = 0;
  let correctUnsupportedHandled = 0;
  let providerAssumptions = 0;
  let downstreamInventions = 0;
  let failedChecks = 0;
  let determinismFailures = 0;

  for (const topic of NARRATIVE_TOPIC_CATALOG) {
    const request = {
      topic: topic.label,
      characterSelection: { ageProfileId: "age_33_37", appearanceGroupId: "european" },
      season: "冬",
      lifestyleFeeling: "松弛 / 自然",
      availableSceneLibrary: topic.defaultSceneLabels.map((label, index) => ({ id: `script-${topic.id}-${index + 1}`, label })),
    };
    const outcome = runImmersiveNarrativePipeline(request);
    assert(outcome.status === "GENERATED", `${topic.label} pipeline blocked: ${outcome.status === "BLOCKED" ? outcome.diagnostics.join(" | ") : ""}`);
    const script = outcome.script;
    const validation = outcome.scriptValidation;
    compiledTopics += 1;
    if (validation.status === "IMMERSIVE_SEEDANCE_SCRIPT_VALIDATED") completeScripts += 1;
    failedChecks += validation.failureReasons.length;
    assert(
      validation.status === "IMMERSIVE_SEEDANCE_SCRIPT_VALIDATED",
      `${topic.label} compiler validation failed: ${validation.failureReasons.join(" | ")}`
    );
    assert(script.topicId === topic.id, `${topic.label} compiled script lost its canonical topic id`);
    assert(script.durationSeconds === 15, `${topic.label} compiled script changed the V1 duration`);
    assert(script.diagnostics.momentBlocks.length === 5, `${topic.label} compiled ${script.diagnostics.momentBlocks.length} Moment blocks`);
    assert(
      script.diagnostics.consumedSections.length === 14,
      `${topic.label} consumed ${script.diagnostics.consumedSections.length} of 14 canonical section families`
    );
    assert(
      JSON.stringify(script.diagnostics.momentBlocks.map((block) => block.momentIndex)) === JSON.stringify([0, 1, 2, 3, 4]),
      `${topic.label} compiled script re-ordered the canonical Moment index`
    );
    assert(script.compiledText.includes("[FINAL ENDING STATE]"), `${topic.label} compiled script has no final ending state`);
    assert(script.compiledText.includes("[PRODUCT / REFERENCE PROTECTION]"), `${topic.label} compiled script has no product/reference protection`);
    assert(script.compiledText.includes("[NEGATIVE / DO-NOT]"), `${topic.label} compiled script has no negative rules`);
    assert(!/\b(?:api key|endpoint|credential|model id)\b/i.test(script.compiledText), `${topic.label} compiled script assumes a Provider API`);
    assert(script.diagnostics.providerDependency === "NONE", `${topic.label} compiled script declares a Provider dependency`);

    for (const block of script.diagnostics.momentBlocks) {
      totalMoments += 1;
      const action = outcome.physicalAction.report.moments.find((moment) => moment.momentIndex === block.momentIndex);
      const camera = outcome.cameraExecution.plan.moments.find((moment) => moment.momentIndex === block.momentIndex);
      assert(action && camera, `${topic.label} Moment ${block.momentIndex} is missing upstream records`);
      if (action.status === "MATCHED") {
        assert(block.physicalActionStatus === "MATCHED" && block.physicalActionId === action.selectedActionId, `${topic.label} Moment ${block.momentIndex} compiler changed the Physical Action`);
        assert(block.cameraExecutionStatus === "EXECUTABLE", `${topic.label} Moment ${block.momentIndex} compiler dropped the camera execution`);
      } else {
        assert(block.physicalActionStatus === "CORRECT_UNSUPPORTED", `${topic.label} Moment ${block.momentIndex} compiler invented a Physical Action`);
        assert(block.cameraExecutionStatus === "CORRECT_UNSUPPORTED", `${topic.label} Moment ${block.momentIndex} compiler invented a camera execution`);
        assert(block.section.includes("CORRECT_UNSUPPORTED"), `${topic.label} Moment ${block.momentIndex} does not mark the unsupported state visibly`);
        correctUnsupportedHandled += 1;
      }
      assert(
        block.cameraRole === outcome.cameraNarrative.moments.find((moment) => moment.momentIndex === block.momentIndex)?.role,
        `${topic.label} Moment ${block.momentIndex} compiler changed the Camera Role`
      );
      assert(
        block.sceneId === outcome.sceneResolution.resolvedMoments.find((moment) => moment.momentIndex === block.momentIndex)?.sceneId,
        `${topic.label} Moment ${block.momentIndex} compiler changed the Scene`
      );
      assert(
        block.section.includes(outcome.soundWorld.moments.find((moment) => moment.momentIndex === block.momentIndex)?.dominantSound ?? ""),
        `${topic.label} Moment ${block.momentIndex} compiler lost the Sound World output`
      );
    }
    assert(
      script.diagnostics.correctUnsupportedCount === outcome.physicalAction.report.coverage.unresolvedMoments,
      `${topic.label} compiler unsupported count ${script.diagnostics.correctUnsupportedCount} differs from the Physical Action audit`
    );
    providerAssumptions += script.diagnostics.providerApiAssumptions;
    downstreamInventions += script.diagnostics.downstreamInventions;

    const rerun = runImmersiveNarrativePipeline(request);
    assert(rerun.status === "GENERATED", `${topic.label} deterministic rerun was blocked`);
    if (rerun.status === "GENERATED" && rerun.script.compiledText !== script.compiledText) {
      determinismFailures += 1;
    }
    assert(
      rerun.status === "GENERATED" && rerun.script.compiledText === script.compiledText,
      `${topic.label} compiler output is not deterministic`
    );

    perTopic.push({
      topic: topic.label,
      compiler: validation.status,
      moments: script.diagnostics.momentBlocks.length,
      correctUnsupported: script.diagnostics.correctUnsupportedCount,
      characters: script.diagnostics.characterCount,
      finalScript: outcome.stages.finalScript,
    });
  }

  assert(compiledTopics === NARRATIVE_TOPIC_CATALOG.length, `${compiledTopics} of ${NARRATIVE_TOPIC_CATALOG.length} topics compiled`);
  assert(completeScripts === NARRATIVE_TOPIC_CATALOG.length, `${completeScripts} complete scripts generated`);
  assert(failedChecks === 0, `${failedChecks} compiler check(s) failed`);
  assert(providerAssumptions === 0, `${providerAssumptions} Provider/API assumption(s) remain`);
  assert(downstreamInventions === 0, `${downstreamInventions} downstream invention(s) remain`);
  assert(determinismFailures === 0, `${determinismFailures} non-deterministic script(s)`);

  console.log("SEEDANCE IMMERSIVE COMPILER VALIDATION PASS:", JSON.stringify({
    stage: "SEEDANCE_SCRIPT_COMPILER_V1",
    topics: NARRATIVE_TOPIC_CATALOG.length,
    compiledTopics,
    completeScriptsGenerated: completeScripts,
    totalMoments,
    correctUnsupportedHandled,
    providerDependency: "NONE",
    providerApiAssumptions: providerAssumptions,
    downstreamInventions,
    deterministicReruns: NARRATIVE_TOPIC_CATALOG.length,
    determinismFailures,
    perTopic,
  }, null, 2));
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
