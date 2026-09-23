import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-topic-pipeline-validation-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

try {
  await writeFile(
    entryPath,
    `export * from ${JSON.stringify(resolve(projectRoot, "src/immersive-narrative/index.ts"))};\n` +
    `export { lifestyleSoftSeedingScenePool } from ${JSON.stringify(resolve(projectRoot, "src/data/lifestyleSoftSeedingScenePool.ts"))};\n`
  );
  await build({ entryPoints: [entryPath], bundle: true, format: "esm", platform: "node", outfile: bundlePath, logLevel: "silent" });
  const {
    NARRATIVE_TOPIC_CATALOG,
    buildProductPresenceInput,
    buildCameraNarrativeInput,
    buildSceneResolverInput,
    buildSoundWorldInput,
    lifestyleSoftSeedingScenePool,
    planImmersiveNarrative,
    planProductPresence,
    planCameraNarrative,
    planSoundWorld,
    resolveNarrativeScenes,
  } = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);

  const report = [];
  const plans = new Map();
  for (const topic of NARRATIVE_TOPIC_CATALOG) {
    const plan = planImmersiveNarrative({
      topic: topic.label,
      characterSelection: { ageProfileId: "age_28_32", appearanceGroupId: "asian" },
      season: "秋",
      lifestyleFeeling: "安静 / 克制",
      duration: 15,
      availableSceneLibrary: topic.defaultSceneLabels.map((label, index) => ({
        id: `topic-scene-${topic.id}-${index + 1}`,
        label,
      })),
    });
    const scene = resolveNarrativeScenes(buildSceneResolverInput(plan, topic.label));
    const product = planProductPresence(buildProductPresenceInput(plan, scene, topic.label));
    const sound = planSoundWorld(buildSoundWorldInput(plan, scene, product, topic.label));
    const camera = planCameraNarrative(buildCameraNarrativeInput(plan, scene, product, sound));
    plans.set(topic.id, plan);
    assert(plan.topicId === topic.id, `${topic.label} did not resolve to ${topic.id}`);
    assert(plan.status === "APPROVED_FOR_SCENE_RESOLUTION", `${topic.label} Narrative failed: ${Object.values(plan.qc).filter((gate) => gate.status === "FAIL").map((gate) => gate.label).join(", ")}`);
    assert(scene.status === "SCENE_RESOLUTION_APPROVED", `${topic.label} Scene failed: ${scene.failureReasons?.join(" | ") ?? "unknown"}`);
    assert(product.status === "PRODUCT_PRESENCE_APPROVED", `${topic.label} Product Presence failed: ${product.failureReasons?.join(" | ") ?? "unknown"}`);
    assert(sound.status === "SOUND_WORLD_APPROVED", `${topic.label} Sound World failed: ${sound.failureReasons?.join(" | ") ?? "unknown"}`);
    assert(camera.status === "CAMERA_NARRATIVE_APPROVED", `${topic.label} Camera Role failed: ${camera.failureReasons?.join(" | ") ?? "unknown"}`);
    assert(sound.moments.length === plan.momentCount, `${topic.label} Sound World lost a Moment`);
    report.push({
      topic: topic.label,
      topicId: topic.id,
      character: "CHARACTER_PROFILE_APPROVED",
      narrative: plan.status,
      scene: scene.status,
      world: scene.locationWorld?.id ?? null,
      product: product.status,
      sound: sound.status,
      camera: camera.status,
      final: "APPROVED",
    });
  }

  assert(plans.get("after_work_home").storyIntent !== plans.get("evening_return_home").storyIntent, "下班回家 and 傍晚回家 must have distinct Story Intent");
  assert(plans.get("weekend_walk").storyIntent !== plans.get("city_wandering").storyIntent, "周末散步 and 城市闲逛 must have distinct Story Intent");
  assert(!/work|office|overtime/i.test(`${plans.get("evening_return_home").storyIntent} ${plans.get("evening_return_home").initialCharacterState}`), "傍晚回家 must not contain work/office semantics");
  assert(!/lonely|melancholic|sad|existential/i.test(`${plans.get("weekend_alone").storyIntent} ${plans.get("weekend_alone").microEvent}`), "周末独处 must not contain loneliness framing");
  assert(!/airport|train station|flight|hotel|suitcase|vacation|tourist|long-distance/i.test(plans.get("short_local_trip").compiledText), "短途出行 must not drift into travel-film semantics");

  console.log("Narrative Topic Pipeline V1 validation passed:", JSON.stringify({
    sceneLibraryCount: lifestyleSoftSeedingScenePool.length,
    topics: report,
    distinctions: {
      afterWorkHome: plans.get("after_work_home").storyIntent,
      eveningReturnHome: plans.get("evening_return_home").storyIntent,
      weekendWalk: plans.get("weekend_walk").storyIntent,
      cityWandering: plans.get("city_wandering").storyIntent,
    },
  }, null, 2));
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
