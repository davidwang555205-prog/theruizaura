import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const dir = await mkdtemp(join(tmpdir(), "theruizaura-soft-runtime-"));
const entry = join(dir, "entry.ts");
const bundle = join(dir, "bundle.mjs");
await writeFile(entry, [
  `export { generateSoftSeedingContent, softSeedingTopicOptions } from ${JSON.stringify(resolve(root, "src/utils/generateSoftSeedingContent.ts"))};`,
  `export { generatePromptRuntime } from ${JSON.stringify(resolve(root, "src/prompt-engine/runtime.ts"))};`,
  `export { setPromptEngineConfig } from ${JSON.stringify(resolve(root, "src/prompt-engine/promptFeatureFlags.ts"))};`,
].join("\n"));
await build({ entryPoints: [entry], bundle: true, outfile: bundle, format: "esm", platform: "node", target: "node20", logLevel: "silent" });
const { generateSoftSeedingContent, softSeedingTopicOptions, generatePromptRuntime, setPromptEngineConfig } = await import(`${pathToFileURL(bundle).href}?v=${Date.now()}`);
setPromptEngineConfig({ mode: "new" });

const baseParams = {
  imageType: "生活场景图", modelChoice: "30–45岁客户画像模特", modelContinuity: "新人物",
  shoe: "自定义", customShoe: "THERUIZ AURA German trainer", season: "秋",
  scenePreference: "自动匹配", garmentTypePreference: "自动匹配", studioLaunchAnglePreference: "自动匹配",
  studioLaunchPreset: "auto", studioWardrobePreference: "auto", stillLifeStyle: "与主视觉统一",
  extraRequirement: "Use a user-specified cream knit top.", generationNonce: 7,
};
const counts = [1, 3, 5, 8];
let checks = 0;
const failures = [];
for (const topic of softSeedingTopicOptions) {
  for (const imageCount of counts) {
    const content = generateSoftSeedingContent({ baseParams, topic, imageCount, variantOffset: 0, date: new Date("2026-07-20T12:00:00+08:00") });
    checks += 1;
    if (content.images.length !== imageCount) failures.push(`${topic}/${imageCount}: output count ${content.images.length}`);
    for (const image of content.images) {
      checks += 5;
      if (!image.prompt.trim()) failures.push(`${topic}/${imageCount}/${image.name}: empty prompt`);
      if (!image.params.seriesActionDirective || !image.params.seriesActionKey) failures.push(`${topic}/${imageCount}/${image.name}: missing action metadata`);
      if (!/Action lock for this card:|Person action lock:|Series (?:action|mirror|material-action|still-life|atmosphere) variation:|Studio action variation:/i.test(image.prompt)) failures.push(`${topic}/${imageCount}/${image.name}: missing action lock`);
      if (/\b(undefined|null)\b/i.test(image.prompt)) failures.push(`${topic}/${imageCount}/${image.name}: unresolved token`);
      const runtime = generatePromptRuntime(image.params);
      if (!image.prompt.startsWith(runtime.prompt)) failures.push(`${topic}/${imageCount}/${image.name}: routed prompt does not preserve the runtime prompt as its base`);
      if (["产品上脚图", "对镜穿搭图", "生活场景图"].includes(image.params.imageType)) {
        if (!runtime.selectedOutfitLine) failures.push(`${topic}/${imageCount}/${image.name}: person prompt has no structured outfit`);
        if (runtime.selectedOutfitLine && !image.prompt.includes(runtime.selectedOutfitLine)) failures.push(`${topic}/${imageCount}/${image.name}: final routed prompt lost its structured outfit`);
      }
      if (runtime.compiled?.validationReport.missingRequiredRules.length) failures.push(`${topic}/${imageCount}/${image.name}: required rules missing`);
      if (image.params.imageType !== "产品静物图" && !image.prompt.includes("selected")) checks += 0;
    }
  }
}
console.log(`Soft-seeding runtime migration: ${checks} checks, ${failures.length} failures, ${softSeedingTopicOptions.length} topics.`);
if (failures.length) { for (const failure of failures.slice(0, 30)) console.error(`FAIL: ${failure}`); process.exitCode = 1; }
await rm(dir, { recursive: true, force: true });
