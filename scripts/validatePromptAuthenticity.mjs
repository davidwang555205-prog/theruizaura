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
  studioLaunchPreset: "auto",
  studioWardrobePreference: "auto",
  stillLifeStyle: "与主视觉统一",
  extraRequirement: "",
  generationNonce: 0
};

const cases = [
  ["生活街景", {}, true],
  ["咖啡馆室内", { scenePreference: "咖啡馆内", generationNonce: 1 }, true],
  ["已下线酒店咖啡厅", { scenePreference: "酒店咖啡厅内", generationNonce: 8 }, true],
  ["已下线酒店房间", { scenePreference: "酒店房间", generationNonce: 9 }, true],
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
    `export { generateTeamPrompt } from ${JSON.stringify(resolve(projectRoot, "src/utils/generatePrompt.ts"))};\n` +
    `export { generateSoftSeedingContent, softSeedingTopicOptions } from ${JSON.stringify(resolve(projectRoot, "src/utils/generateSoftSeedingContent.ts"))};\n` +
    `export { TEAM_SCENE_OPTIONS_BY_IMAGE_TYPE } from ${JSON.stringify(resolve(projectRoot, "src/data/teamSceneOptions.ts"))};\n` +
    `export { lifestyleSoftSeedingScenePool } from ${JSON.stringify(resolve(projectRoot, "src/data/lifestyleSoftSeedingScenePool.ts"))};\n`
  );
  await build({
    entryPoints: [entryPath],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile: bundlePath,
    logLevel: "silent"
  });

  const {
    generateTeamPrompt,
    generateSoftSeedingContent,
    softSeedingTopicOptions,
    TEAM_SCENE_OPTIONS_BY_IMAGE_TYPE,
    lifestyleSoftSeedingScenePool
  } = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);
  const failures = [];
  const retiredHotelPattern = /hotel|酒店|客房|room card|房卡/i;
  const activeBedActionPattern = /sitting on (?:the )?(?:edge of )?a bed|beside a bed|坐在床边|床边穿鞋/i;

  if (
    retiredHotelPattern.test(JSON.stringify(TEAM_SCENE_OPTIONS_BY_IMAGE_TYPE)) ||
    retiredHotelPattern.test(JSON.stringify(lifestyleSoftSeedingScenePool))
  ) {
    failures.push({ name: "active-scene-catalog", hasNoRetiredHotelScene: false });
  }

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
      const isRetiredHotelCase = name.startsWith("已下线酒店");
      const hasNoRetiredHotelScene =
        !isRetiredHotelCase || !/hotel|酒店|客房|room card|房卡/i.test(prompt);

      if (
        !hasAuthenticity ||
        (requiresProductProtection && !hasProductProtection) ||
        !hasAiPerfectionBoundary ||
        !hasNoRetiredHotelScene
      ) {
        failures.push({
          name,
          variant,
          hasAuthenticity,
          hasProductProtection,
          hasAiPerfectionBoundary,
          hasNoRetiredHotelScene
        });
      }
    }
  }

  for (const topic of softSeedingTopicOptions) {
    for (const imageCount of [3, 5, 8]) {
      const content = generateSoftSeedingContent({
        baseParams: { ...baseParams, generationNonce: imageCount * 31 },
        topic,
        imageCount,
        variantOffset: imageCount,
        date: new Date("2026-07-20T12:00:00+08:00")
      });
      const invalidImages = content.images
        .filter((image) =>
          retiredHotelPattern.test(`${image.name} ${image.description} ${image.params.scenePreference} ${image.params.extraRequirement} ${image.prompt}`) ||
          activeBedActionPattern.test(image.prompt)
        )
        .map((image) => image.name);
      if (invalidImages.length) failures.push({ name: `${topic}/${imageCount}`, invalidImages });
    }
  }

  if (failures.length) {
    console.error("Prompt authenticity validation failed:", JSON.stringify(failures, null, 2));
    process.exitCode = 1;
  } else {
    console.log(`Prompt authenticity validation passed for ${cases.length * 3} direct samples plus ${softSeedingTopicOptions.length * 3} generated 3/5/8 sets.`);
  }
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
