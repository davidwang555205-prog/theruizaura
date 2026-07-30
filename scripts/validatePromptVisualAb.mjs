import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dir = join(root, "docs", "prompt-audit", "phase-2");
const cases = JSON.parse(await readFile(join(dir, "phase-2-ab-cases.json"), "utf8"));
const results = JSON.parse(await readFile(join(dir, "phase-2-visual-results.json"), "utf8"));
const allowed = new Set(["pending", "complete"]);
const conclusions = new Set(["B_CLEARLY_BETTER", "B_SLIGHTLY_BETTER", "EQUIVALENT", "A_SLIGHTLY_BETTER", "A_CLEARLY_BETTER", "BOTH_FAIL", "INVALID_TEST"]);
let failures = 0;
const fail = (message) => { failures += 1; console.error(`FAIL: ${message}`); };
if (cases.phase !== "PHASE_2_AB_PREPARATION_READY") fail("case phase is not preparation-ready");
if (!Array.isArray(cases.cases) || cases.cases.length < 8 || cases.cases.length > 12) fail("case count must be 8-12");
const ids = new Set();
for (const item of cases.cases) {
  if (ids.has(item.caseId)) fail(`duplicate case ID ${item.caseId}`); ids.add(item.caseId);
  if (!item.aPrompt?.trim() || !item.bPrompt?.trim()) fail(`${item.caseId} missing complete A/B Prompt`);
  if (item.aChars !== item.aPrompt.length || item.bChars !== item.bPrompt.length) fail(`${item.caseId} character count mismatch`);
  if (!Array.isArray(item.referencePlan?.order)) fail(`${item.caseId} missing reference plan order`);
}
if (!Array.isArray(results.results)) fail("results must be an array");
const resultIds = new Set(results.results.map((item) => item.caseId));
for (const item of cases.cases) if (!resultIds.has(item.caseId)) fail(`missing result row ${item.caseId}`);
for (const result of results.results) {
  if (!allowed.has(result.status)) fail(`${result.caseId} invalid status`);
  if (result.conclusion !== null && !conclusions.has(result.conclusion)) fail(`${result.caseId} invalid conclusion`);
  if (result.status === "complete" && !result.conclusion) fail(`${result.caseId} complete result needs conclusion`);
  if (result.conclusion === "INVALID_TEST" && !result.evidence?.trim()) fail(`${result.caseId} invalid test needs reason`);
  if (result.conclusion === "BOTH_FAIL" && (!Array.isArray(result.failureTypes) || result.failureTypes.length === 0)) fail(`${result.caseId} both-fail needs failure types`);
  if (result.recommendOptimization === true && !result.targetModule) fail(`${result.caseId} optimization recommendation needs target module`);
}
const pending = results.results.filter((item) => item.status !== "complete").map((item) => item.caseId);
if (failures) process.exitCode = 1;
else if (pending.length) console.log(`NOT_READY: ${pending.length} cases still need human Image2 review: ${pending.join(", ")}`);
else console.log(`Prompt visual A/B validation passed: ${results.results.length} complete cases.`);
