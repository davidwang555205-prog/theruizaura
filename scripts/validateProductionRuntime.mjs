import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const temp = await mkdtemp(resolve(tmpdir(), "theruiz-production-runtime-"));
const bundle = resolve(temp, "runtime.mjs");
await build({
  entryPoints: [resolve(root, "src/prompt-engine/runtime.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: bundle,
  logLevel: "silent",
});

const { generatePromptRuntime } = await import(`${pathToFileURL(bundle).href}?v=${Date.now()}`);
const results = [];
const fail = (message) => { throw new Error(`validate:production-runtime: ${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };
const words = (prompt) => prompt.trim().split(/\s+/).filter(Boolean).length;
const report = (label, params, runtime) => {
  const compiled = runtime.compiled;
  assert(compiled, `${label} missing compiled result`);
  assert(compiled.metadata, `${label} missing metadata`);
  assert(compiled.validationReport.totalErrors === 0, `${label} validation errors`);
  assert(compiled.validationReport.conflictingRules.length === 0, `${label} unresolved conflicts`);
  assert(!/^Active Prompt Registry:|Topic responsibility:|Current task context:/m.test(compiled.prompt), `${label} leaked internal metadata`);
  results.push({ label, params, runtime });
};

const base = {
  brandId: "theruiz_aura",
  imageType: "生活场景图",
  compositionMode: "fullFigure",
  scenePreference: "棚内上新拍摄",
  season: "夏",
  modelChoice: "欧洲25–30岁女模特",
  modelContinuity: "新人物",
  hasShoe: true,
  garmentTypePreference: "裤装",
  extraRequirement: "",
  shoe: "自定义",
  customShoe: "",
  studioLaunchAnglePreference: "自动匹配",
  studioLaunchPreset: "auto",
  studioWardrobePreference: "auto",
  stillLifeStyle: "与主视觉统一",
  selectedOutfitLine: "fine gauge knit top and tailored trousers",
  userExtraRequirement: "",
  isMultiImage: true,
  seriesImageCount: 3,
  generationNonce: 1,
  provider: "image2",
  topicId: "studio_launch_shoot",
  activeVisualRoleId: "B3",
  referencePlan: { assetIds: ["shoe-front"], order: ["shoe-front"] },
  productTruthProvenance: { source: "current_task_uploaded_images", assetIds: ["shoe-front"] },
  actionLock: "pause after arrival with one hand adjusting the garment",
  sceneLock: "professional studio launch set",
};

for (let index = 0; index < 3; index += 1) {
  report(`A-European-female-studio-${index + 1}`, { ...base, seriesImageIndex: index, activeVisualRoleId: ["B3", "B4", "C1"][index] }, generatePromptRuntime({ ...base, seriesImageIndex: index, activeVisualRoleId: ["B3", "B4", "C1"][index] }));
}

const asian = { ...base, modelChoice: "亚裔20–25岁模特", modelContinuity: "新人物", isMultiImage: false, seriesImageCount: undefined, seriesImageIndex: undefined, activeVisualRoleId: "B3" };
report("B-Asian-female-studio", asian, generatePromptRuntime(asian));

const stillLife = { ...base, imageType: "产品静物图", compositionMode: "stillLife", scenePreference: "产品静物图", isMultiImage: false, seriesImageCount: undefined, seriesImageIndex: undefined, activeVisualRoleId: "C3" };
const stillRuntime = generatePromptRuntime(stillLife);
report("C-Still-life", stillLife, stillRuntime);
for (const term of ["face", "gaze", "hands", "body weight", "knees", "hips", "walking", "seated mechanics", "THERUIZ Human State"]) assert(!stillRuntime.prompt.toLowerCase().includes(term.toLowerCase()), `still-life contains ${term}`);

const atmosphere = { ...base, imageType: "非产品氛围图", compositionMode: "atmosphere", scenePreference: "城市街角 / 安静街区", hasShoe: false, isMultiImage: false, seriesImageCount: undefined, seriesImageIndex: undefined, topicId: undefined, activeVisualRoleId: undefined };
const atmosphereRuntime = generatePromptRuntime(atmosphere);
report("D-Atmosphere-no-person", atmosphere, atmosphereRuntime);
for (const term of ["model identity", "foot seated inside shoe", "hands", "body mechanics", "worn look", "on-foot grounding"]) assert(!atmosphereRuntime.prompt.toLowerCase().includes(term), `atmosphere contains ${term}`);

const strictMissing = { ...base, selectedProductTruth: undefined, referencePlan: undefined, strictProduction: true };
let strictError = "";
try { generatePromptRuntime(strictMissing); } catch (error) { strictError = String(error?.message ?? error); }
assert(strictError.includes("MISSING_CURRENT_TASK_PRODUCT_TRUTH"), "strict mode did not block missing Product Truth");
assert(strictError.includes("MISSING_REFERENCE_PLAN"), "strict mode did not block missing Reference Plan");

for (const { label, runtime } of results) {
  const metadata = runtime.compiled.metadata;
  console.log(`\n=== ${label} ===`);
  console.log(JSON.stringify({ normalizedInput: results.find((item) => item.label === label).params, ruleIds: runtime.compiled.includedRuleIds, conflicts: runtime.compiled.conflicts, metadata, diagnostics: runtime.diagnostics, productionReady: metadata.productionReady, chars: runtime.prompt.length, words: words(runtime.prompt) }, null, 2));
  console.log(`PROVIDER_PROMPT_BEGIN\n${runtime.prompt}\nPROVIDER_PROMPT_END`);
}
console.log(`\nPASS validate:production-runtime (${results.length} outputs + strict failure)`);
await rm(temp, { recursive: true, force: true });
