import { build } from "esbuild";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const output = join(projectRoot, "artifacts/immersive-v1-final-acceptance");
const bundled = await build({
  stdin: { contents: `export * from ${JSON.stringify(resolve(projectRoot, "src/immersive-narrative/index.ts"))};`, resolveDir: projectRoot },
  bundle: true, format: "esm", platform: "node", write: false, logLevel: "silent",
});
const temp = await mkdtemp(join(tmpdir(), "immersive-v1-final-"));
const bundlePath = join(temp, "bundle.mjs");
await writeFile(bundlePath, bundled.outputFiles[0].text);
const api = await import(pathToFileURL(bundlePath).href);
await rm(temp, { recursive: true, force: true });
const { NARRATIVE_TOPIC_CATALOG, runImmersiveNarrativePipeline } = api;

const cases = {
  afternoon_cafe: "A-cafe",
  after_work_home: "B-after-work-home",
  weekend_walk: "C-weekend-walk",
  bookstore_browse: "D-bookstore",
};

function requestFor(topic) {
  return {
    topic: topic.label,
    characterSelection: { ageProfileId: "age_28_32", appearanceGroupId: "asian" },
    season: "秋",
    lifestyleFeeling: "安静 / 克制",
    availableSceneLibrary: topic.defaultSceneLabels.map((label, index) => ({
      id: `final-${topic.id}-${index}`,
      label,
    })),
  };
}

function stateTimeline(outcome) {
  return outcome.modelFacingScript.contracts.map((contract) => ({
    moment: contract.momentIndex + 1,
    authority: contract.stateAuthority,
    before: contract.worldStateBefore,
    preconditionEvidence: contract.stateConflicts,
    after: contract.worldStateAfter,
  }));
}

function physicalActionPlan(outcome) {
  return outcome.physicalAction.report.moments.map((moment) => ({
    momentIndex: moment.momentIndex,
    whatHappens: moment.whatHappens,
    status: moment.status,
    selectedActionId: moment.selectedActionId,
    primitiveId: moment.primitiveId,
    source: moment.source,
    movementState: moment.selectedMovementState,
  }));
}

function takePlan(outcome) {
  return outcome.presentation.directorScript.takes.map((take) => ({
    take: take.takeIndex + 1,
    moments: take.moments.map((moment) => moment.momentIndex + 1),
    motivation: take.motivation,
    boundary: outcome.modelFacingScript.contracts[take.moments[0].momentIndex].takeBoundary,
    inheritedStart: outcome.modelFacingScript.contracts[take.moments[0].momentIndex].worldStateBefore,
  }));
}

function mandatoryEvents(outcome) {
  const events = outcome.modelFacingScript.contracts.flatMap((contract) => contract.requiredVisibleEvidence);
  return [...new Map(events.map((item) => [item.id, item])).values()];
}

function cameraPlan(outcome) {
  return {
    moments: outcome.cameraExecution.plan.moments.map((moment) => ({
      momentIndex: moment.momentIndex,
      cameraRole: moment.cameraRole,
      cameraMovement: moment.cameraMovement,
      shotScale: moment.shotScale,
      cameraHeight: moment.cameraHeight,
      viewAngle: moment.viewAngle,
      workingDistance: moment.workingDistance,
      movementRelationToSubject: moment.movementRelationToSubject,
      subjectVisibility: moment.subjectVisibility,
      startFraming: moment.startFraming,
      endFraming: moment.endFraming,
    })),
    continuityProfile: outcome.cameraExecution.plan.continuityProfile,
    restrictions: outcome.cameraExecution.plan.restrictions,
  };
}

function timingAllocation(outcome) {
  return outcome.modelFacingScript.moments.map((moment) => ({
    momentIndex: moment.momentIndex,
    title: moment.title,
    startSecond: moment.timeRange.startSecond,
    endSecond: moment.timeRange.endSecond,
    durationSeconds: Number((moment.timeRange.endSecond - moment.timeRange.startSecond).toFixed(1)),
  }));
}

function qcResult(outcome) {
  return {
    pipelineStatus: outcome.status,
    stages: outcome.stages,
    executionValidation: outcome.executionValidation,
    presentationValidation: outcome.presentationValidation,
    cameraQc: outcome.cameraExecution.plan.qc,
    cameraCoverage: outcome.cameraExecution.plan.coverage,
    physicalActionCoverage: outcome.physicalAction.report.coverage,
    soundQc: outcome.soundWorld.qc,
    productQc: outcome.productPresence.qc,
  };
}

const report = { topics: [], cases: [] };
for (const topic of NARRATIVE_TOPIC_CATALOG) {
  const first = runImmersiveNarrativePipeline(requestFor(topic));
  const second = runImmersiveNarrativePipeline(requestFor(topic));
  if (first.status !== "GENERATED" || second.status !== "GENERATED") {
    throw new Error(`${topic.id} did not generate: ${first.status}/${second.status}`);
  }
  if (JSON.stringify(stateTimeline(first)) !== JSON.stringify(stateTimeline(second))
    || JSON.stringify(physicalActionPlan(first)) !== JSON.stringify(physicalActionPlan(second))
    || JSON.stringify(takePlan(first)) !== JSON.stringify(takePlan(second))
    || JSON.stringify(mandatoryEvents(first)) !== JSON.stringify(mandatoryEvents(second))
    || JSON.stringify(first.modelFacingScript.contracts.at(-1)?.worldStateAfter) !== JSON.stringify(second.modelFacingScript.contracts.at(-1)?.worldStateAfter)) {
    throw new Error(`${topic.id} is not deterministic`);
  }
  report.topics.push({
    topic: topic.id,
    status: first.status,
    physicalActionMatched: first.physicalAction.report.coverage.matchedMoments,
    physicalActionUnmatched: first.physicalAction.report.coverage.unresolvedMoments,
    takeCount: first.presentation.directorScript.takes.length,
    executionValidation: first.executionValidation.status,
    qcPass: first.executionValidation.status === "EXECUTION_SCRIPT_VALIDATED"
      && first.scriptValidation.status === "IMMERSIVE_SEEDANCE_SCRIPT_VALIDATED"
      && first.cameraExecution.plan.status === "CAMERA_EXECUTION_APPROVED",
  });
  const caseName = cases[topic.id];
  if (!caseName) continue;
  const dir = join(output, caseName);
  await mkdir(dir, { recursive: true });
  const save = (name, value) => writeFile(join(dir, name), typeof value === "string" ? value : JSON.stringify(value, null, 2) + "\n");
  await save("compiled-final-script.txt", first.modelFacingScript.compiledText);
  await save("state-timeline.json", stateTimeline(first));
  await save("physical-action-plan.json", physicalActionPlan(first));
  await save("take-plan.json", takePlan(first));
  await save("mandatory-visual-events.json", mandatoryEvents(first));
  await save("final-state.json", first.modelFacingScript.contracts.at(-1)?.worldStateAfter ?? null);
  await save("camera-plan.json", cameraPlan(first));
  await save("timing-allocation.json", timingAllocation(first));
  await save("qc-result.json", qcResult(first));
  report.cases.push({ name: caseName, topic: topic.id, deterministic: true });
}

await mkdir(output, { recursive: true });
await writeFile(join(output, "13-topic-final-matrix.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
