import { build } from "esbuild";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const output = join(root, "artifacts", process.argv[2] ?? "immersive-structured-execution-v1-acceptance");
const naturalistic = process.argv.includes("--naturalistic")
  || process.argv[2] === "immersive-naturalistic-execution-v1-acceptance";
const bundled = await build({
  stdin: { contents: `export * from ${JSON.stringify(resolve(root, "src/immersive-narrative/index.ts"))};`, resolveDir: root },
  bundle: true, format: "esm", platform: "node", write: false, logLevel: "silent",
});
const temp = await mkdtemp(join(tmpdir(), "immersive-acceptance-"));
const path = join(temp, "bundle.mjs");
await writeFile(path, bundled.outputFiles[0].text);
const { NARRATIVE_TOPIC_CATALOG, runImmersiveNarrativePipeline } = await import(pathToFileURL(path).href);
await rm(temp, { recursive: true, force: true });

const cases = {
  weekend_walk: { name: "A-weekend-walk", checks: ["1 Take 连续步行；world-anchored observer 不与人物同向移动", "人物 apparent scale / frame relation 自然变化，禁止 constant-distance rear tracking"] },
  bookstore_browse: { name: "B-bookstore", checks: ["WINDOW_STOP / OBSERVATION / ENTER_STORE 保持，产品与品牌隔离保持 0", "STOP stationary span 明显压缩，OBSERVATION 发生在已建立 STOP 内，不追加第二次 full hold"] },
};
await mkdir(output, { recursive: true });
const matrix = [];
for (const topic of NARRATIVE_TOPIC_CATALOG) {
  const outcome = runImmersiveNarrativePipeline({
    topic: topic.label, characterSelection: { ageProfileId: "age_28_32", appearanceGroupId: "asian" },
    season: "秋", lifestyleFeeling: "安静 / 克制",
    availableSceneLibrary: topic.defaultSceneLabels.map((label, index) => ({ id: `acceptance-${topic.id}-${index}`, label })),
  });
  if (outcome.status !== "GENERATED") throw new Error(`${topic.id}: ${outcome.reason}`);
  const contracts = outcome.modelFacingScript.contracts;
  const takeCount = outcome.presentation.directorScript.takes.length;
  const events = contracts.flatMap((contract) => contract.requiredVisibleEvidence);
  const uniqueEvents = [...new Map(events.map((item) => [item.id, item])).values()];
  const final = contracts.at(-1).worldStateAfter;
  const row = {
    topic: topic.id, topicLabel: topic.label, momentCount: outcome.plan.moments.length, takeCount,
    structuredStateCoverage: `${contracts.filter((contract) => contract.stateAuthority === "STRUCTURED_AUTHORITY").length}/${contracts.length} Moments; ${Object.keys(final?.facts ?? {}).length} final facts`,
    legacyFallbackUsed: contracts.some((contract) => contract.stateAuthority === "LEGACY_FALLBACK"),
    mandatoryVisualEvents: uniqueEvents.map((item) => item.id),
    continuousActionFlowUsed: outcome.modelFacingScript.compiledText.includes("[ONE CONTINUOUS ACTION FLOW]"),
    finalState: final, singleUseEvents: final?.completedEvents ?? [],
    qcStatus: outcome.executionValidation.status === "EXECUTION_SCRIPT_VALIDATED" && outcome.presentationValidation.status === "DIRECTOR_SCRIPT_VALIDATED" ? "PASS" : "FAIL",
  };
  matrix.push(row);
  const selected = cases[topic.id];
  if (!selected) continue;
  const dir = join(output, selected.name);
  await mkdir(dir, { recursive: true });
  const save = (name, value) => writeFile(join(dir, name), typeof value === "string" ? value : JSON.stringify(value, null, 2) + "\n");
  await save("compiled-final-script.txt", outcome.modelFacingScript.compiledText);
  await save("state-timeline.json", contracts.map((contract) => ({ moment: contract.momentIndex + 1, authority: contract.stateAuthority, before: contract.worldStateBefore, preconditionEvidence: contract.stateConflicts, after: contract.worldStateAfter })));
  await save("take-plan.json", outcome.presentation.directorScript.takes.map((take) => ({ take: take.takeIndex + 1, moments: take.moments.map((moment) => moment.momentIndex + 1), motivation: take.motivation, boundary: contracts[take.moments[0].momentIndex].takeBoundary, inheritedStart: contracts[take.moments[0].momentIndex].worldStateBefore })));
  await save("mandatory-visual-events.json", uniqueEvents);
  await save("final-state.json", final);
  await save("人工验收说明.md", `# ${topic.label} · Seedance 人工验收\n\n源码脚本已通过本地验证；视频画面尚未验证。\n\n${selected.checks.map((item, index) => `${index + 1}. ${item}`).join("\n")}\n\n逐项检查可见事件是否真的发生、同一实体状态是否跨镜头继承、动作是否自然连续、最终状态后是否出现新任务或产品 pose。任一失败则视觉验收不通过。${naturalistic ? "\n\n自然执行重点：相邻动作是否有生活中的重叠而非独立表演；真实停步是否保留；摄影机是否允许边缘构图、遮挡和短暂产品不可见，而不为产品补拍或追人。" : ""}\n`);
}
await writeFile(join(output, "13-topic-matrix.json"), JSON.stringify(matrix, null, 2) + "\n");
console.log(JSON.stringify({ output, topics: matrix.length, cases: Object.values(cases).map((c) => c.name), takeCounts: matrix.filter((row) => cases[row.topic]).map((row) => ({ topic: row.topic, takes: row.takeCount })) }, null, 2));
