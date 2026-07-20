import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-prompt-validation-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");

const baseParams = {
  imageType: "生活场景图",
  modelChoice: "30–45岁客户画像模特",
  modelContinuity: "新人物",
  shoe: "Cloud Dancer 云舞者",
  customShoe: "",
  season: "秋",
  scenePreference: "周末城市散步",
  garmentTypePreference: "自动匹配",
  studioLaunchAnglePreference: "自动匹配",
  stillLifeStyle: "与主视觉统一",
  extraRequirement: "",
  generationNonce: 0
};

const cases = [
  ["生活街景", {}, true],
  ["咖啡馆室内", { scenePreference: "咖啡馆内", generationNonce: 1 }, true],
  ["对镜穿搭", { imageType: "对镜穿搭图", scenePreference: "居家衣帽间", generationNonce: 2 }, true],
  ["通勤上脚", { imageType: "产品上脚图", scenePreference: "通勤上班", generationNonce: 3 }, true],
  ["棚拍人物", { imageType: "产品上脚图", scenePreference: "棚内上新拍摄", generationNonce: 4 }, true],
  ["产品静物", { imageType: "产品静物图", scenePreference: "材质工作台", generationNonce: 5 }, true],
  ["拍摄花絮", { imageType: "拍摄花絮 / 材质图", scenePreference: "拍摄花絮", generationNonce: 6 }, true],
  ["氛围图", { imageType: "非产品氛围图", scenePreference: "工作台 / 桌边整理", generationNonce: 7 }, false]
];

const authenticityPattern =
  /slight imperfect framing|daily imperfection|normal human asymmetry|mild wear on surrounding surfaces|physically real through|visibly used daily setting/i;
const productProtectionPattern =
  /sneaker itself clean|do not add dirt, wear, or damage to the sneaker itself|do not add lifestyle clutter or any dirt or damage to the sneaker/i;

try {
  await writeFile(
    entryPath,
    `export { generateTeamPrompt } from ${JSON.stringify(resolve(projectRoot, "src/utils/generatePrompt.ts"))};\n`
  );
  await build({
    entryPoints: [entryPath],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile: bundlePath,
    logLevel: "silent"
  });

  const { generateTeamPrompt } = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);
  const failures = [];

  for (const [name, overrides, requiresProductProtection] of cases) {
    for (let variant = 0; variant < 3; variant += 1) {
      const generationNonce = Number(overrides.generationNonce ?? 0) + variant * 17;
      const prompt = generateTeamPrompt({ ...baseParams, ...overrides, generationNonce }).prompt;
      const hasAuthenticity = authenticityPattern.test(prompt);
      const hasProductProtection = productProtectionPattern.test(prompt);
      const hasAiPerfectionBoundary =
        /over-clean AI lifestyle template|not overly polished|showroom-perfect|sterile showroom perfection|fake CGI|CGI product render/i.test(
          prompt
        );

      if (!hasAuthenticity || (requiresProductProtection && !hasProductProtection) || !hasAiPerfectionBoundary) {
        failures.push({ name, variant, hasAuthenticity, hasProductProtection, hasAiPerfectionBoundary });
      }
    }
  }

  if (failures.length) {
    console.error("Prompt authenticity validation failed:", JSON.stringify(failures, null, 2));
    process.exitCode = 1;
  } else {
    console.log(`Prompt authenticity validation passed for ${cases.length * 3} samples across ${cases.length} representative scenarios.`);
  }
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
