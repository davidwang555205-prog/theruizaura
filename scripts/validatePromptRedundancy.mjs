import assert from "node:assert/strict";
import { build } from "esbuild";

// Compare the former pipeline with the integrated pipeline using the same
// current inputs. No snapshots, project files or Provider calls are produced.
const bundle = await build({
  stdin: {
    contents: [
      'export { generatePromptRuntime } from "./src/prompt-engine/runtime.ts";',
      'export { generateSoftSeedingContent } from "./src/utils/generateSoftSeedingContent.ts";',
      'export { buildPromptProfileInput } from "./src/prompt-engine/adapters/legacyTeamPromptAdapter.ts";',
      'export { collectPromptRules } from "./src/prompt-engine/collectPromptRules.ts";',
      'export { resolvePromptConflicts } from "./src/prompt-engine/resolvePromptConflicts.ts";',
      'export { allocatePromptBudget } from "./src/prompt-engine/allocatePromptBudget.ts";',
      'export { consolidatePromptRules } from "./src/prompt-engine/consolidatePromptRules.ts";',
      'export { lifestyleStandardFaceVariations, lifestyleTelephotoFaceVariations } from "./src/data/lifestyleFaceVariationPlans.ts";',
      'export { assignReferenceRole, createTaskReferenceSet, bindTaskProductTruth } from "./src/visual-system/taskReferenceBinding.ts";',
    ].join("\n"),
    resolveDir: process.cwd(),
  },
  bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent",
});
const api = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const wordCount = text => text.trim() ? text.trim().split(/\s+/).length : 0;
const order = ["product", "model", "styling", "action", "scene", "camera", "lighting", "continuity", "brand", "negative"];
const assemble = rules => order.flatMap(section => rules.filter(rule => rule.section === section).map(rule => rule.text)).join(" ").trim();
const base = {
  imageType: "产品上脚图", modelChoice: "30–45岁客户画像模特", modelContinuity: "新人物",
  shoe: "自定义", customShoe: "", season: "秋", scenePreference: "自动匹配", garmentTypePreference: "自动匹配",
  studioLaunchAnglePreference: "自动匹配", studioLaunchPreset: "auto", studioWardrobePreference: "auto",
  stillLifeStyle: "与主视觉统一", extraRequirement: "", generationNonce: 0,
};
const results = [];
const sampleTexts = [];

function check(label, params, emitSample = false) {
  const runtime = api.generatePromptRuntime(params);
  const input = api.buildPromptProfileInput(params, runtime.selectedOutfitLine);
  const resolved = api.resolvePromptConflicts(api.collectPromptRules(input)).kept;
  const original = structuredClone(resolved);
  const { kept, report } = api.consolidatePromptRules(resolved);
  assert.deepEqual(resolved, original, `${label}: mutated original rules`);
  assert.deepEqual(kept.map(({ text, estimatedWords, ...rule }) => rule), resolved.map(({ text, estimatedWords, ...rule }) => rule), `${label}: changed rule identity, applicability or priority`);
  assert.deepEqual(api.consolidatePromptRules(kept).kept, kept, `${label}: not idempotent`);
  assert(report.afterWords <= report.beforeWords, `${label}: consolidation expanded text`);
  const included = new Set(runtime.compiled.includedRuleIds);
  for (const rule of resolved.filter(rule => rule.required)) assert(included.has(rule.id), `${label}: lost required ${rule.id}`);
  for (const change of report.changes.filter(change => included.has(change.ruleId))) {
    for (const ownerId of change.coveredByRuleIds) {
      assert(included.has(ownerId), `${label}: trimmed semantic owner ${ownerId}`);
      assert(kept.find(rule => rule.id === ownerId)?.required, `${label}: optional semantic owner`);
    }
  }
  const userRule = resolved.find(rule => rule.id === "user-extra-requirement");
  if (userRule) assert.equal(kept.find(rule => rule.id === userRule.id).text, userRule.text, `${label}: changed user input`);
  const truthRule = resolved.find(rule => rule.id === "product-accuracy-current-task-reference");
  if (truthRule) assert.equal(kept.find(rule => rule.id === truthRule.id).text, truthRule.text, `${label}: changed Product Truth`);
  for (const rule of resolved.filter(rule => rule.tags?.includes("consumer-trust"))) {
    assert.equal(kept.find(candidate => candidate.id === rule.id).text, rule.text, `${label}: changed Consumer Trust`);
  }
  const face = resolved.find(rule => rule.id.startsWith("card-face-variation-"));
  if (face) {
    const after = kept.find(rule => rule.id === face.id).text;
    const geometry = face.text.slice(face.text.indexOf("Face orientation lock (hard):"));
    if (face.text.includes("Face orientation lock (hard):")) assert(after.includes(geometry), `${label}: changed head/body geometry or per-card differences`);
    assert.equal((after.match(/Keep both eyes visibly open with clearly separated upper and lower eyelids/g) ?? []).length, 1, `${label}: missing/duplicate canonical eye lock`);
    assert(!/\s[.,;]|\bwith with\b|\band and\b/.test(after), `${label}: malformed face prose`);
  }
  const action = resolved.find(rule => rule.id === "card-action-lock");
  if (action) assert(kept.find(rule => rule.id === action.id).text.startsWith(`Action Lock: ${input.actionLock}`), `${label}: changed selected action`);
  const outfit = resolved.find(rule => rule.id === "styling-selected-outfit");
  if (outfit) {
    const beforeGarments = outfit.text.split(", keeping every garment")[0];
    assert(kept.find(rule => rule.id === outfit.id).text.startsWith(beforeGarments), `${label}: changed selected garments/colors/materials`);
  }
  const beforeBudget = api.allocatePromptBudget(resolved, input.compositionMode);
  const beforePrompt = assemble(beforeBudget.kept);
  const previouslyKeptRequired = beforeBudget.kept.filter(rule => rule.required).map(rule => rule.id);
  assert(previouslyKeptRequired.every(id => included.has(id)), `${label}: lost mandatory prior output`);
  const result = { label, before: wordCount(beforePrompt), after: wordCount(runtime.prompt), saved: wordCount(beforePrompt) - wordCount(runtime.prompt), changes: report.changes.length };
  results.push(result);
  if (emitSample) sampleTexts.push({ ...result, prompt: runtime.prompt, consolidated: report.changes.map(change => ({ ruleId: change.ruleId, semanticKey: change.semanticKey })) });
  return runtime;
}

for (const season of ["春", "夏", "秋", "冬"]) {
  for (const [imageType, scenePreference] of [["产品上脚图", "通勤上班"], ["对镜穿搭图", "居家衣帽间"], ["生活场景图", "咖啡馆内"], ["产品静物图", "产品静物图"], ["拍摄花絮 / 材质图", "材质工作台"], ["非产品氛围图", "城市街角 / 安静街区"]]) {
    check(`${season}/${imageType}`, { ...base, season, imageType, scenePreference }, season === "秋" && ["产品上脚图", "产品静物图"].includes(imageType));
  }
  for (const studioLaunchAnglePreference of ["下半身1/3角度", "鞋子上脚特写角度"]) check(`${season}/${studioLaunchAnglePreference}`, { ...base, season, scenePreference: "棚内上新拍摄", studioLaunchAnglePreference }, season === "秋");
  for (const [topic, captureStyle] of [["棚内上新拍摄", "standard"], ["生活场景软种草", "standard"], ["生活场景软种草", "telephoto_candid"]]) {
    for (const imageCount of [3, 5, 8]) {
      const content = api.generateSoftSeedingContent({ baseParams: { ...base, season }, topic, captureStyle, imageCount, date: new Date("2026-10-04T12:00:00+08:00") });
      for (const [index, image] of content.images.entries()) {
        const label = `${season}/${topic}/${captureStyle}/${imageCount}/${index + 1}`;
        const runtime = check(label, image.params, season === "秋" && imageCount === 5 && index === 1);
        assert.equal(image.prompt, runtime.prompt, `${label}: series did not consume consolidated prompt`);
      }
    }
  }
}

// Boundary cases: near-duplicate user input and changed canonical wording must
// remain unchanged, and an optional owner cannot justify removal of a hard lock.
const userText = "Use uploaded footwear references as the only product source; keep visibly confirmed sneaker details as the visual anchor and do not infer missing facts. No shoes. Custom 0.5-degree view.";
const userOutput = check("literal-user-input", { ...base, extraRequirement: userText });
assert(userOutput.prompt.includes(userText));
const synthetic = (id, text, required = true) => ({ id, text, required, section: "product", priority: 1, source: "product-profile", appliesWhen: {} });
const shared = [synthetic("owner", "Keep the same 0.5-degree angle. Keep texture."), synthetic("dependent", "Keep the same 0.5-degree angle. Keep color.")];
const merged = api.consolidatePromptRules(shared);
assert.equal(merged.kept[0].text, shared[0].text);
assert.equal(merged.kept[1].text, "Keep color.");
const optional = [synthetic("optional-owner", "Keep texture.", false), synthetic("hard-rule", "Keep texture.")];
assert.equal(api.consolidatePromptRules(optional).kept[1].text, "Keep texture.");
const sole = [synthetic("unique", "Keep color. Keep material. Keep branding.")];
assert.deepEqual(api.consolidatePromptRules(sole).kept, sole);
const repeated = [synthetic("within-one-rule", "Keep texture. Keep texture. Keep color.", false)];
assert.equal(api.consolidatePromptRules(repeated).kept[0].text, "Keep texture. Keep color.");

const referenceSet = api.createTaskReferenceSet({
  referenceSetId: "redundancy-reference-set", taskId: "redundancy-review", createdAt: "2026-10-04T00:00:00Z",
  assets: ["full_product_reference", "top_view_reference", "heel_reference", "material_reference"].map((role, index) => api.assignReferenceRole({ id: `reference-${index}`, name: `reference-${index}.jpg`, mime: "image/jpeg", originalUploadIndex: index, roles: ["unclassified"], coverage: [], confidence: "unknown", assignmentSource: "unclassified", needsConfirmation: true, confirmedByUser: false }, role)),
});
const binding = api.bindTaskProductTruth(referenceSet);
for (const imageType of ["产品上脚图", "拍摄花絮 / 材质图"]) {
  const params = { ...base, imageType, scenePreference: "材质工作台", extraRequirement: "Show the confirmed sneaker material.", selectedProductTruth: binding.productTruth, referencePlan: binding.referencePlan, productTruthAssetIds: binding.referencePlan.assetIds };
  const frozenInput = structuredClone(params);
  const runtime = check(`reference-bound/${imageType}`, params);
  assert.deepEqual(params, frozenInput, "mutated uploaded reference input");
  assert.deepEqual(runtime.compiled.metadata.referencePlan, binding.referencePlan, "changed reference plan/order");
  assert(runtime.prompt.includes("Preserve the exact material zones, surface finish, texture transitions, stitching relationships, and construction details shown in the confirmed material references."), "lost reference material protection");
}

// All catalog face templates, including ones not selected by the runtime samples.
for (const variation of [...api.lifestyleStandardFaceVariations, ...api.lifestyleTelephotoFaceVariations]) {
  check(`face-template/${variation.id}`, { ...base, imageType: "生活场景图", scenePreference: "通勤上班", seriesImageCount: 3, seriesImageIndex: 0, seriesFaceVariation: variation });
}
const before = results.reduce((sum, result) => sum + result.before, 0);
const after = results.reduce((sum, result) => sum + result.after, 0);
assert(after < before, "runtime prompts were not reduced overall");
assert(results.some(result => result.changes > 0), "consolidation not reached");
console.log(JSON.stringify({ status: "PASS", cases: results.length, beforeWords: before, afterWords: after, savedWords: before - after, reductionPercent: ((before - after) / before * 100).toFixed(1), samples: results.filter(result => /^秋\//.test(result.label)) }, null, 2));
if (process.argv.includes("--samples")) for (const sample of sampleTexts) console.log(JSON.stringify(sample));
