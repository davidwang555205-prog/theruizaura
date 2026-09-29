import { build } from "esbuild";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Immersive Narrative Final Output Consolidation acceptance pack.
// Static output only: no Provider call, no Seedance execution.
const root = resolve(import.meta.dirname, "..");
const output = join(root, "artifacts", process.argv[2] ?? "immersive-final-output-consolidation-v1");
const bundled = await build({
  stdin: { contents: `export * from ${JSON.stringify(resolve(root, "src/immersive-narrative/index.ts"))};`, resolveDir: root },
  bundle: true, format: "esm", platform: "node", write: false, logLevel: "silent",
});
const temp = await mkdtemp(join(tmpdir(), "immersive-final-acceptance-"));
const bundlePath = join(temp, "bundle.mjs");
await writeFile(bundlePath, bundled.outputFiles[0].text);
const {
  NARRATIVE_TOPIC_CATALOG,
  runImmersiveNarrativePipeline,
} = await import(pathToFileURL(bundlePath).href);
await rm(temp, { recursive: true, force: true });

const cases = [
  { id: "after_work_home", name: "A-working-day-return", note: "下班回家 / doorway crossing：两个 Take、钥匙→开锁→开门→跨门槛→室内 settled、产品 0 reference。" },
  { id: "afternoon_cafe", name: "B-cafe", note: "咖啡馆：室内 Take 1 到 counter-side Take 2，座位落座，背景世界保持运营。" },
  { id: "bookstore_browse", name: "C-bookstore", note: "书店：橱窗外停留 → 进店，室外/室内 sound world 随空间切换。" },
  { id: "weekend_walk", name: "D-weekend-walk", note: "周末步行：1 Take、连续步行、无真实停步、无产品补拍。" },
  { id: "weekend_alone", name: "E-object-interaction", note: "居家物件互动：放置一次、之后不再重复，私人空间无陌生人。" },
  { id: "city_wandering", name: "F-continuous-movement", note: "城市闲逛：连续移动、边缘构图、camera 不追人。" },
  { id: "waiting_for_friend", name: "G-waiting-for-friend", note: "等朋友：既有等待状态保持，身体余韵只允许重心与手部物理微动，不得出现叹气/释然/肩部放松等表演。" },
];

const referenceStates = [
  { id: "zero-reference", mapping: { mode: "reference_bound_manual", confirmedReferenceCount: 0, instruction: "No reference is attached to this task." } },
  { id: "confirmed-reference", mapping: { mode: "reference_bound_manual", confirmedReferenceCount: 2, instruction: "Upload the two confirmed footwear references in Reference Plan order." } },
];

await mkdir(output, { recursive: true });
const matrix = [];
for (const entry of cases) {
  const topic = NARRATIVE_TOPIC_CATALOG.find((candidate) => candidate.id === entry.id);
  if (!topic) throw new Error(`Unknown topic ${entry.id}`);
  const directory = join(output, entry.name);
  await mkdir(directory, { recursive: true });
  const save = (file, value) => writeFile(
    join(directory, file),
    typeof value === "string" ? value : `${JSON.stringify(value, null, 2)}\n`
  );
  const referenceRows = [];
  for (const referenceState of referenceStates) {
    const outcome = runImmersiveNarrativePipeline({
      topic: topic.label,
      characterSelection: { ageProfileId: "age_28_32", appearanceGroupId: "asian" },
      season: "秋",
      lifestyleFeeling: "安静 / 克制",
      availableSceneLibrary: topic.defaultSceneLabels.map((label, index) => ({ id: `acceptance-${topic.id}-${index}`, label })),
      referenceMapping: referenceState.mapping,
    });
    if (outcome.status !== "GENERATED") throw new Error(`${entry.id} blocked: ${outcome.reason}`);
    const takes = outcome.presentation.directorScript.takes;
    const takeTruth = outcome.presentation.directorScript.takes.map((take) => ({
      take: take.takeIndex + 1,
      role: take.takeRole,
      moments: take.moments.map((moment) => moment.momentIndex + 1),
      timeRange: `${take.moments[0].timeRange.startSecond.toFixed(1)}-${take.moments[take.moments.length - 1].timeRange.endSecond.toFixed(1)}s`,
      openingCameraState: take.openingCameraState,
      cameraBoundary: take.cameraBoundary,
      motivation: take.motivation,
      boundary: outcome.modelFacingScript.contracts[take.moments[0].momentIndex].takeBoundary,
      inheritedStart: outcome.modelFacingScript.contracts[take.moments[0].momentIndex].worldStateBefore,
    }));
    const finalContract = outcome.modelFacingScript.contracts[outcome.modelFacingScript.contracts.length - 1];
    referenceRows.push({
      referenceState: referenceState.id,
      status: outcome.finalConsistencyValidation.status,
      categoryFailures: outcome.finalConsistencyValidation.categoryFailures,
      takes: takes.length,
      directorScript: outcome.presentation.presentationScript,
      seedancePrompt: outcome.modelFacingScript.compiledText,
      structuredPlan: {
        topic: topic.id,
        topicLabel: topic.label,
        title: outcome.presentation.directorScript.title,
        variantSeed: outcome.plan.variantSeed,
        durationSeconds: outcome.plan.durationSeconds,
        storyIntent: outcome.plan.storyIntent,
        localGoal: outcome.plan.localGoal,
        goalState: outcome.plan.goalState,
        macroLocation: outcome.plan.spatialEnvelope.macroLocation,
        locationWorld: outcome.sceneResolution.locationWorld,
        moments: outcome.plan.moments.map((moment, index) => ({
          moment: index + 1,
          purpose: moment.purpose,
          spatialAnchor: moment.spatialAnchor,
          sceneId: outcome.sceneResolution.resolvedMoments[index]?.sceneId,
          sceneName: outcome.sceneResolution.resolvedMoments[index]?.sceneName,
          whatHappens: moment.whatHappens,
          completionBoundary: moment.completionBoundary,
          cameraObservation: outcome.modelFacingScript.moments[index]?.cameraObservation,
          bodyBehavior: outcome.modelFacingScript.moments[index]?.bodyBehavior,
          naturalSound: outcome.modelFacingScript.moments[index]?.naturalSound,
          productVisibility: outcome.modelFacingScript.moments[index]?.productVisibility,
        })),
        global: outcome.presentation.directorScript.global,
        finalPerformance: {
          bodyFreezeDetail: outcome.finalConsistencyValidation.checks.find((check) => check.id === "FINAL_STATE_BODY_FREEZE_RISK")?.detail ?? null,
          recenterDetail: outcome.finalConsistencyValidation.checks.find((check) => check.id === "FINAL_RECENTER_RISK")?.detail ?? null,
          emotionalSemanticDetail: outcome.finalConsistencyValidation.checks.find((check) => check.id === "EMOTIONAL_SEMANTIC_LEAK")?.detail ?? null,
          sighRiskDetail: outcome.finalConsistencyValidation.checks.find((check) => check.id === "SIGH_EXECUTION_RISK")?.detail ?? null,
          finalMomentBody: outcome.modelFacingScript.moments.at(-1)?.bodyBehavior ?? null,
          ending: outcome.presentation.directorScript.ending,
        },
      },
      takePlan: takeTruth,
      finalState: finalContract.worldStateAfter,
      ending: outcome.presentation.directorScript.ending,
      validation: {
        presentation: outcome.presentationValidation,
        execution: outcome.executionValidation,
        seedanceCompiler: outcome.scriptValidation,
        finalConsistency: outcome.finalConsistencyValidation,
        referenceMapping: referenceState.mapping,
        status: outcome.presentationValidation.status === "DIRECTOR_SCRIPT_VALIDATED"
          && outcome.executionValidation.status === "EXECUTION_SCRIPT_VALIDATED"
          && outcome.finalConsistencyValidation.status === "IMMERSIVE_FINAL_CONSISTENCY_VALIDATED"
          ? "PASS"
          : "FAIL",
      },
    });
  }

  const primary = referenceRows[0];
  const confirmed = referenceRows[1];
  await save("director-script.txt", [
    `${primary.directorScript}`,
    "",
    "===== CONFIRMED REFERENCE VARIANT =====",
    confirmed.directorScript,
    "",
  ].join("\n"));
  await save("seedance-prompt.txt", [
    primary.seedancePrompt,
    "",
    "===== CONFIRMED REFERENCE VARIANT =====",
    confirmed.seedancePrompt,
    "",
  ].join("\n"));
  await save("structured-plan.json", { zeroReference: primary.structuredPlan, confirmedReference: confirmed.structuredPlan });
  await save("take-plan.json", { zeroReference: primary.takePlan, confirmedReference: confirmed.takePlan });
  await save("final-state.json", { zeroReference: primary.finalState, confirmedReference: confirmed.finalState });
  await save("validation.json", {
    case: entry.name,
    topic: entry.id,
    zeroReference: primary.validation,
    confirmedReference: confirmed.validation,
  });
  await save("人工验收说明.md", `# ${topic.label} · ${primary.structuredPlan.title}\n\n静态脚本已通过本地验证；视频画面尚未验证。\n\n${entry.note}\n\n逐项检查：\n\n1. Take 数与脚本一致，Director Concept / Global Negatives 只允许 Take Plan 已批准的那一次 camera boundary。\n2. 新 Take 的机位由本 Take 自己建立，不继承上一 Take 的机位，但继承人物位置、门/钥匙状态与已完成动作。\n3. Ending 只描述 final Take 机位真的看得到的东西；更早的空间只作为 off-screen continuation。\n4. 产品分支唯一：0 reference 时不得出现 uploaded reference 语义；有 reference 时不得出现 no-reference 语义。\n5. Sound 随空间切换：跨门槛后室内 room tone 主导，室外空间只作为 residual。\n\nFinal-state natural continuation 专项检查：\n\n6. 人物在最后 2-4 秒是否仍有 natural residual micro-motion（余步 / 重心转移 / 手臂摆动衰减 / 手部回到中性位置 / 衣物沉降），而不是站定等结束。\n7. 是否出现 recentring、portrait composition、full-body recovery、为了结束画面重新构图或追焦。\n8. 是否出现新的 narrative action（新房间、新任务、第二次门/钥匙动作、坐下、回头、看镜头、产品 pose、情绪表演）。\n9. final structured state 是否与上一轮一致（人物位置、门状态、手中钥匙、已完成动作没有被改写）。\n10. 执行语义中是否出现 relaxation / relief / softening / comfort 类词，或 sigh / breath / exhale / shoulder drop / smile / eyes close 等会诱发表演的词。\n\n任一失败则视觉验收不通过。Provider 未调用，Seedance 未执行。\n`);
  matrix.push({
    case: entry.name,
    topic: entry.id,
    title: primary.structuredPlan.title,
    takes: primary.takes,
    status: primary.validation.status === "PASS" && confirmed.validation.status === "PASS" ? "PASS" : "FAIL",
    categoryFailures: {
      zeroReference: primary.categoryFailures,
      confirmedReference: confirmed.categoryFailures,
    },
  });
}

await writeFile(join(output, "case-matrix.json"), `${JSON.stringify(matrix, null, 2)}\n`);

// Second real Seedance E2E set: the fixed regression case plus the cafe and the
// week-end walk ending shapes.
const secondRoundCases = ["A-working-day-return", "B-cafe", "D-weekend-walk"];
await writeFile(join(output, "SECOND_REAL_E2E_INDEX.json"), `${JSON.stringify({
  stage: "IMMERSIVE_FINAL_STATE_NATURAL_CONTINUATION",
  status: "READY_FOR_SECOND_REAL_SEEDANCE_E2E",
  providerExecuted: false,
  cases: matrix
    .filter((row) => secondRoundCases.includes(row.case))
    .map((row) => ({
      case: row.case,
      topic: row.topic,
      title: row.title,
      takes: row.takes,
      directorScript: `${row.case}/director-script.txt`,
      seedancePrompt: `${row.case}/seedance-prompt.txt`,
      structuredPlan: `${row.case}/structured-plan.json`,
      takePlan: `${row.case}/take-plan.json`,
      finalState: `${row.case}/final-state.json`,
      validation: `${row.case}/validation.json`,
    })),
  checklist: [
    "final narrative state unchanged",
    "no new narrative action",
    "natural residual body motion present in the last 2-4 seconds",
    "no recentring / portrait ending / full-body recovery",
    "no repeated doorway or key action",
  ],
}, null, 2)}\n`);
console.log(JSON.stringify({
  output,
  cases: matrix.length,
  statuses: matrix.map((row) => `${row.case}:${row.status}`),
  secondRealE2E: secondRoundCases,
}, null, 2));
