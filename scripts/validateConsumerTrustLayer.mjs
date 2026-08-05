import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruiz-consumer-trust-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");

let checks = 0;
const failures = [];
const expect = (condition, message, evidence) => {
  checks += 1;
  if (!condition) failures.push({ message, evidence });
};
const wordCount = (text) => text.trim() ? text.trim().split(/\s+/).length : 0;

try {
  await writeFile(
    entryPath,
    `export { compilePrompt } from ${JSON.stringify(resolve(projectRoot, "src/prompt-engine/compilePrompt.ts"))};\n` +
    `export { getTheruizAuraConsumerTrustRules, resolveTheruizConsumerTrustRole, THERUIZ_CONSUMER_TRUST_VERSION } from ${JSON.stringify(resolve(projectRoot, "src/prompt-engine/profiles/theruizAuraConsumerTrustProfiles.ts"))};\n`
  );
  await build({
    entryPoints: [entryPath],
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node20",
    outfile: bundlePath,
    logLevel: "silent"
  });

  const {
    compilePrompt,
    getTheruizAuraConsumerTrustRules,
    resolveTheruizConsumerTrustRole,
    THERUIZ_CONSUMER_TRUST_VERSION
  } = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);

  const base = {
    brandId: "theruiz_aura",
    season: "秋",
    modelChoice: "30–45岁客户画像模特",
    modelContinuity: "新人物",
    garmentTypePreference: "自动匹配",
    userExtraRequirement: "",
    isMultiImage: false,
    generationNonce: 17,
    provider: "image2"
  };
  const cases = [
    { id: "on_foot", imageType: "产品上脚图", compositionMode: "onFootLifestyle", scenePreference: "通勤上班", hasShoe: true, expectedRole: "product_evidence" },
    { id: "still_life", imageType: "产品静物图", compositionMode: "stillLife", scenePreference: "棚内上新拍摄", hasShoe: true, expectedRole: "product_evidence" },
    { id: "material", imageType: "拍摄花絮 / 材质图", compositionMode: "materialDetail", scenePreference: "材质工作台", hasShoe: true, expectedRole: "product_evidence" },
    { id: "lifestyle", imageType: "生活场景图", compositionMode: "onFootLifestyle", scenePreference: "城市街角 / 安静街区", hasShoe: true, expectedRole: "brand_lifestyle_visualization" },
    { id: "mirror", imageType: "对镜穿搭图", compositionMode: "mirrorFull", scenePreference: "居家衣帽间", hasShoe: true, expectedRole: "brand_lifestyle_visualization" },
    { id: "synthetic_ugc", imageType: "生活场景图", compositionMode: "onFootLifestyle", scenePreference: "城市街角 / 安静街区", hasShoe: true, contentTrustRole: "synthetic_ugc_visualization", expectedRole: "synthetic_ugc_visualization" },
    { id: "atmosphere", imageType: "非产品氛围图", compositionMode: "atmosphere", scenePreference: "城市街角 / 安静街区", hasShoe: false, modelChoice: "不需要模特", expectedRole: "editorial_atmosphere", atmosphereProductPresenceMode: "subtle_supporting_presence", atmosphereProductPaletteEchoMode: "material_translation" }
  ];

  const samples = [];
  for (const testCase of cases) {
    const input = { ...base, ...testCase };
    delete input.id;
    delete input.expectedRole;
    const result = compilePrompt(input);
    const trustIds = result.metadata?.consumerTrustRuleIds ?? [];
    const trustRules = getTheruizAuraConsumerTrustRules(input);
    const trustText = trustRules.map((rule) => rule.text).join(" ");
    const prompt = result.prompt;

    expect(resolveTheruizConsumerTrustRole(input) === testCase.expectedRole, `${testCase.id}: role resolver mismatch`);
    expect(result.metadata?.consumerTrustRole === testCase.expectedRole, `${testCase.id}: metadata role mismatch`, result.metadata);
    expect(result.metadata?.consumerTrustVersion === THERUIZ_CONSUMER_TRUST_VERSION, `${testCase.id}: metadata version missing`);
    expect(result.metadata?.manualTrustQaRequired === true, `${testCase.id}: manual QA flag must be true`);
    expect(result.metadata?.providerExecutionReady === false, `${testCase.id}: Provider execution must remain false`);
    expect(result.metadata?.productionReady === false, `${testCase.id}: Production readiness must remain false`);
    expect(new Set(trustIds).size === trustIds.length, `${testCase.id}: duplicate Trust Rule ID`, trustIds);
    expect(trustIds.every((id) => result.includedRuleIds.includes(id)), `${testCase.id}: metadata contains non-budgeted Trust Rule`, trustIds);
    expect(!result.conflicts.some((conflict) => /theruiz-trust-/.test(`${conflict.keptRuleId} ${conflict.removedRuleId}`)), `${testCase.id}: Trust Rule entered an unexpected conflict`, result.conflicts);
    for (const rule of trustRules) {
      expect(prompt.includes(rule.text), `${testCase.id}: final Prompt lost ${rule.id}`);
      expect(prompt.split(rule.text).length - 1 === 1, `${testCase.id}: duplicated Trust sentence ${rule.id}`);
    }

    const has = (id) => trustIds.includes(id);
    if (testCase.expectedRole === "product_evidence") {
      expect(has("theruiz-trust-product-evidence-scope"), `${testCase.id}: product evidence scope missing`);
      expect(trustIds.length === 2, `${testCase.id}: product evidence must load exactly two Trust Rules`, trustIds);
      expect(wordCount(trustText) <= 40, `${testCase.id}: Trust increment exceeds product budget`, wordCount(trustText));
    }
    if (testCase.hasShoe && (testCase.expectedRole === "product_evidence" || testCase.expectedRole === "synthetic_ugc_visualization")) {
      expect(has("theruiz-trust-unsupported-performance-claims"), `${testCase.id}: unsupported performance boundary missing`);
    }
    if (testCase.expectedRole === "brand_lifestyle_visualization") {
      expect(trustIds.length === 2, `${testCase.id}: lifestyle must load exactly two Trust Rules`, trustIds);
      expect(has("theruiz-trust-brand-lifestyle-not-testimony"), `${testCase.id}: lifestyle boundary missing`);
      expect(has("theruiz-trust-no-fabricated-customer-evidence"), `${testCase.id}: fabricated evidence boundary missing`);
      expect(wordCount(trustText) <= 35, `${testCase.id}: Trust increment exceeds lifestyle budget`, wordCount(trustText));
    }
    if (testCase.expectedRole === "synthetic_ugc_visualization") {
      expect(trustIds.length === 3, `${testCase.id}: Synthetic UGC must load exactly three Trust Rules`, trustIds);
      expect(has("theruiz-trust-synthetic-ugc-boundary"), `${testCase.id}: synthetic UGC boundary missing`);
      expect(has("theruiz-trust-no-fabricated-customer-evidence"), `${testCase.id}: fabricated evidence boundary missing`);
      expect(wordCount(trustText) <= 55, `${testCase.id}: Trust increment exceeds UGC budget`, wordCount(trustText));
    }
    if (testCase.expectedRole === "editorial_atmosphere") {
      expect(trustIds.length === 0, `${testCase.id}: atmosphere must not load Trust Prompt body`, trustIds);
      expect(!prompt.includes("performance proof"), `${testCase.id}: atmosphere loaded performance claim language`);
    }
    samples.push({ id: testCase.id, role: testCase.expectedRole, trustRuleIds: trustIds, trustWords: wordCount(trustText), trustText });
  }

  const invalidSyntheticOverride = { ...base, imageType: "产品静物图", compositionMode: "stillLife", scenePreference: "棚内上新拍摄", hasShoe: true, contentTrustRole: "synthetic_ugc_visualization" };
  expect(resolveTheruizConsumerTrustRole(invalidSyntheticOverride) === "product_evidence", "Synthetic UGC override must be rejected for non-lifestyle image types");

  if (failures.length) {
    console.error("Consumer Trust validation failed:", JSON.stringify({ checks, failures, samples }, null, 2));
    process.exitCode = 1;
  } else {
    console.log("Consumer Trust validation passed:", JSON.stringify({ checks, version: THERUIZ_CONSUMER_TRUST_VERSION, samples }, null, 2));
  }
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
