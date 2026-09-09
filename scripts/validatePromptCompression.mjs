import { build } from "esbuild";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const temp = await mkdtemp(join(tmpdir(), "theruiz-prompt-compression-"));
const entry = join(temp, "entry.ts");
const bundle = join(temp, "bundle.mjs");

await writeFile(
  entry,
  `export { compilePrompt } from ${JSON.stringify(resolve(root, "src/prompt-engine/compilePrompt.ts"))};\n` +
    `export { compileRoutedImage2UserPrompt } from ${JSON.stringify(resolve(root, "src/visual-system/routedPromptCompiler.ts"))};\n` +
    `export { resolveTopicRoute } from ${JSON.stringify(resolve(root, "src/visual-system/topicRoutingRegistry.ts"))};\n`
);
await build({ entryPoints: [entry], bundle: true, outfile: bundle, format: "esm", platform: "node", target: "node20", logLevel: "silent" });
const { compilePrompt, compileRoutedImage2UserPrompt, resolveTopicRoute } = await import(pathToFileURL(bundle));

const baseline = JSON.parse(await readFile(join(root, "docs", "prompt-audit", "prompt-audit-baseline.json"), "utf8"));
const baselineById = new Map(baseline.cases.map((item) => [item.promptId, item]));
const wordCount = (value) => value.trim() ? value.trim().split(/\s+/).length : 0;
const assert = (condition, message) => {
  if (!condition) throw new Error(`validate:prompt-compression: ${message}`);
};

const definitions = [
  { promptId: "product_studio-春", imageType: "产品上脚图", compositionMode: "fullFigure", scenePreference: "棚内上新拍摄", season: "春", maxWords: 450, minReduction: 0.25 },
  { promptId: "lifestyle_city-春", imageType: "生活场景图", compositionMode: "onFootLifestyle", scenePreference: "通勤上班", season: "春", maxWords: 560, minReduction: 0.30 },
  { promptId: "mirror_selfie-秋", imageType: "对镜穿搭图", compositionMode: "mirrorFull", scenePreference: "居家衣帽间", season: "秋", maxWords: 600, minReduction: 0.25 },
  { promptId: "craft_closeup-冬", imageType: "拍摄花絮 / 材质图", compositionMode: "materialDetail", scenePreference: "拍摄花絮", season: "冬", maxWords: 140, minReduction: 0 },
  { promptId: "still_life-春", imageType: "产品静物图", compositionMode: "stillLife", scenePreference: "产品静物图", season: "春", maxWords: 220, minReduction: 0 },
];

const results = [];
for (const definition of definitions) {
  const current = compilePrompt({
    brandId: "theruiz_aura",
    provider: "image2",
    imageType: definition.imageType,
    compositionMode: definition.compositionMode,
    scenePreference: definition.scenePreference,
    season: definition.season,
    modelChoice: definition.compositionMode === "materialDetail" ? "不需要模特" : "30–45岁客户画像模特",
    modelContinuity: "新人物",
    hasShoe: true,
    garmentTypePreference: "自动匹配",
    userExtraRequirement: "",
    isMultiImage: false,
    generationNonce: 17,
  });
  const old = baselineById.get(definition.promptId);
  assert(old?.prompt, `${definition.promptId} baseline missing`);
  const oldWords = wordCount(old.prompt);
  const currentWords = wordCount(current.prompt);
  const reduction = oldWords > 0 ? (oldWords - currentWords) / oldWords : 0;
  assert(currentWords <= definition.maxWords, `${definition.promptId} ${currentWords}w exceeds ${definition.maxWords}w hard limit`);
  assert(currentWords <= oldWords, `${definition.promptId} grew from ${oldWords}w to ${currentWords}w`);
  assert(reduction >= definition.minReduction, `${definition.promptId} reduction ${(reduction * 100).toFixed(1)}% below ${(definition.minReduction * 100).toFixed(0)}% target`);

  if (definition.compositionMode !== "materialDetail") {
    for (const ruleId of ["product-accuracy-current-task-reference", "shoe-visibility-at-least-one", "shoe-clipping-prevention"]) {
      assert(current.includedRuleIds.includes(ruleId), `${definition.promptId} lost ${ruleId}`);
    }
  }
  if (["fullFigure", "onFootLifestyle", "mirrorFull"].includes(definition.compositionMode)) {
    assert(current.includedRuleIds.includes("shoe-on-foot-material-response"), `${definition.promptId} lost worn-shoe deformation lock`);
    assert(current.includedRuleIds.includes("theruiz-physical-integrity-grounding"), `${definition.promptId} lost physical-integrity lock`);
  }
  if (definition.imageType === "产品上脚图") {
    assert(!current.includedRuleIds.includes("img-onfoot-product-primary"), `${definition.promptId} retained duplicate image-type Product Truth rule`);
  }
  results.push({ promptId: definition.promptId, oldWords, currentWords, reduction: `${(reduction * 100).toFixed(1)}%` });
}

const routedBase = compilePrompt({
  brandId: "theruiz_aura",
  provider: "image2",
  topicId: "lifestyle_soft_seeding",
  activeVisualRoleId: "A1",
  imageType: "生活场景图",
  compositionMode: "onFootLifestyle",
  scenePreference: "通勤上班",
  season: "秋",
  modelChoice: "30–45岁客户画像模特",
  modelContinuity: "新人物",
  hasShoe: true,
  garmentTypePreference: "自动匹配",
  userExtraRequirement: "",
  isMultiImage: true,
  seriesImageIndex: 1,
  seriesImageCount: 3,
  generationNonce: 31,
}).prompt;
const routed = compileRoutedImage2UserPrompt({
  basePrompt: routedBase,
  topicRoute: resolveTopicRoute("lifestyle_soft_seeding"),
  visualRoleId: "A2",
  currentTaskContext: { imageType: "生活场景图", scenePreference: "通勤上班", imageIndex: 2, imageCount: 3 },
});
assert(!routed.includes("Active Prompt Registry:"), "routed prompt leaked registry metadata");
assert(!routed.includes("Image2 provider boundary:"), "routed prompt leaked provider control text");
assert(!routed.includes("Topic responsibility:"), "routed prompt leaked topic provenance text");
assert(!routed.includes("Current task context:"), "routed prompt leaked duplicated task context");
assert(!routed.includes("Product Truth protection:"), "routed prompt duplicated Product Truth control text");
assert((routed.match(/Active visual role:/g) ?? []).length === 0, "routed prompt retained base visual-role sentence");
assert((routed.match(/Visual role:/g) ?? []).length === 1, "routed prompt must contain exactly one final visual role");
assert(routed.includes("Use the uploaded footwear references as the only product source."), "routed prompt lost Product Truth source lock");
assert(routed.includes("Keep the foot seated inside the shoe"), "routed prompt lost shoe/foot separation lock");

console.table(results);
console.log(`Routed prompt: ${wordCount(routedBase)}w base -> ${wordCount(routed)}w final with one resolved visual role and no control-plane duplication.`);
console.log("Prompt compression validation passed: representative prompts are shorter while Product Truth, worn-shoe deformation, and physical-integrity locks remain present.");
await rm(temp, { recursive: true, force: true });
