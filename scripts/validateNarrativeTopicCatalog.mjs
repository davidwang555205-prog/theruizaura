import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-topic-catalog-validation-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

try {
  await writeFile(
    entryPath,
    `export * from ${JSON.stringify(resolve(projectRoot, "src/immersive-narrative/index.ts"))};\n`
  );
  await build({ entryPoints: [entryPath], bundle: true, format: "esm", platform: "node", outfile: bundlePath, logLevel: "silent" });
  const {
    NARRATIVE_TOPIC_CATALOG,
    getSupportedNarrativeTopics,
    planImmersiveNarrative,
    resolveNarrativeTopic,
  } = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);

  assert(NARRATIVE_TOPIC_CATALOG.length === 13, `Expected 13 canonical topics, received ${NARRATIVE_TOPIC_CATALOG.length}`);
  assert(getSupportedNarrativeTopics().length === 13, "Planner must expose exactly 13 canonical labels");
  assert(new Set(NARRATIVE_TOPIC_CATALOG.map((topic) => topic.id)).size === 13, "Topic ids must be unique");
  assert(new Set(NARRATIVE_TOPIC_CATALOG.map((topic) => topic.label)).size === 13, "Topic labels must be unique");
  assert(NARRATIVE_TOPIC_CATALOG.every((topic) => topic.status === "ACTIVE"), "Every canonical topic must be ACTIVE");

  const aliasPairs = [
    ["出门", "出门办事"],
    ["周末书店", "逛书店"],
    ["等人", "等朋友"],
    ["咖啡馆", "午后咖啡"],
  ];
  for (const [alias, canonicalLabel] of aliasPairs) {
    const aliasTopic = resolveNarrativeTopic(alias);
    const canonicalTopic = resolveNarrativeTopic(canonicalLabel);
    assert(Boolean(aliasTopic) && Boolean(canonicalTopic), `${alias} or ${canonicalLabel} did not resolve`);
    assert(aliasTopic.id === canonicalTopic.id, `${alias} did not resolve to ${canonicalLabel}`);
  }

  const aliasPlan = planImmersiveNarrative({
    topic: "出门",
    characterProfile: "32岁左右成熟女性",
    season: "秋",
    lifestyleFeeling: "安静 / 克制",
    duration: 15,
    availableSceneLibrary: [
      { id: "scene-entry", label: "玄关" },
      { id: "scene-door", label: "公寓门口" },
      { id: "scene-outside", label: "住宅楼外" },
    ],
  });
  const canonicalPlan = planImmersiveNarrative({
    topic: "出门办事",
    characterProfile: "32岁左右成熟女性",
    season: "秋",
    lifestyleFeeling: "安静 / 克制",
    duration: 15,
    availableSceneLibrary: [
      { id: "scene-entry", label: "玄关" },
      { id: "scene-door", label: "公寓门口" },
      { id: "scene-outside", label: "住宅楼外" },
    ],
  });
  assert(aliasPlan.topicId === canonicalPlan.topicId, "Alias plan did not resolve to the canonical topic id");
  assert(aliasPlan.archetypeId === canonicalPlan.archetypeId, "Alias plan did not use the canonical archetype");
  assert(aliasPlan.compiledText === canonicalPlan.compiledText, "Alias and canonical label must produce the same plan text");

  let unsupported = null;
  try {
    planImmersiveNarrative({
      topic: "机场转机",
      characterProfile: "32岁左右成熟女性",
      season: "秋",
      lifestyleFeeling: "安静 / 克制",
      duration: 15,
      availableSceneLibrary: [{ id: "scene-airport", label: "机场" }],
    });
  } catch (error) {
    unsupported = error;
  }
  assert(unsupported?.code === "UNSUPPORTED_TOPIC", "Unknown topic must fail closed with UNSUPPORTED_TOPIC");

  const order = NARRATIVE_TOPIC_CATALOG.map((topic) => topic.label);
  const expectedOrder = [
    "下班回家", "周末独处", "出门办事", "等朋友", "午后咖啡", "逛书店", "采购归来",
    "接孩子后", "周末散步", "午餐之后", "城市闲逛", "傍晚回家", "短途出行",
  ];
  assert(JSON.stringify(order) === JSON.stringify(expectedOrder), `Topic order changed: ${order.join(", ")}`);

  console.log("Narrative Topic Catalog V1 validation passed:", JSON.stringify({
    topics: NARRATIVE_TOPIC_CATALOG.map((topic) => ({ id: topic.id, label: topic.label, aliases: topic.aliases })),
    aliasPairs,
    unsupportedTopic: unsupported?.code,
  }, null, 2));
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
