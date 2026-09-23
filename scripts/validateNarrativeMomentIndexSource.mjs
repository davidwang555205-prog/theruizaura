import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Read-only audit: confirms the canonical Narrative Moment index field and its
// propagation through the Immersive Narrative pipeline. It never mutates output.
const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-moment-index-audit-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

try {
  await writeFile(entryPath, `export * from ${JSON.stringify(resolve(projectRoot, "src/immersive-narrative/index.ts"))};\n`);
  await build({ entryPoints: [entryPath], bundle: true, format: "esm", platform: "node", outfile: bundlePath, logLevel: "silent" });
  const {
    NARRATIVE_TOPIC_CATALOG,
    buildProductPresenceInput,
    buildCameraNarrativeInput,
    buildSceneResolverInput,
    buildSoundWorldInput,
    planImmersiveNarrative,
    planProductPresence,
    planCameraNarrative,
    planSoundWorld,
    resolveNarrativeScenes,
  } = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);

  const planTopic = (topic) => planImmersiveNarrative({
    topic: topic.label,
    characterSelection: { ageProfileId: "age_28_32", appearanceGroupId: "asian" },
    season: "秋",
    lifestyleFeeling: "安静 / 克制",
    duration: 15,
    availableSceneLibrary: topic.defaultSceneLabels.map((label, index) => ({ id: `moment-index-${topic.id}-${index + 1}`, label })),
  });

  const report = [];
  assert(NARRATIVE_TOPIC_CATALOG.length === 13, `Expected 13 topics, received ${NARRATIVE_TOPIC_CATALOG.length}`);

  for (const topic of NARRATIVE_TOPIC_CATALOG) {
    const plan = planTopic(topic);
    const rerun = planTopic(topic);
    assert(plan.moments.length === 5, `${topic.label} must expose exactly 5 Narrative Moments, received ${plan.moments.length}`);

    const canonicalIndexes = plan.moments.map((moment) => moment.index);
    const momentIds = plan.moments.map((moment) => moment.id);
    assert(canonicalIndexes.every((value) => typeof value === "number"), `${topic.label} is missing the canonical NarrativeMoment.index field`);
    assert(new Set(canonicalIndexes).size === canonicalIndexes.length, `${topic.label} has duplicate canonical moment indexes`);
    assert(canonicalIndexes.join(",") === "0,1,2,3,4", `${topic.label} canonical index sequence changed: ${canonicalIndexes.join(",")}`);
    assert(new Set(momentIds).size === momentIds.length, `${topic.label} has duplicate Moment ids`);
    assert(
      JSON.stringify(canonicalIndexes) === JSON.stringify(rerun.moments.map((moment) => moment.index)),
      `${topic.label} canonical index sequence is not deterministic`
    );
    assert(
      JSON.stringify(momentIds) === JSON.stringify(rerun.moments.map((moment) => moment.id)),
      `${topic.label} Moment ids are not deterministic`
    );

    const scene = resolveNarrativeScenes(buildSceneResolverInput(plan, topic.label));
    const product = planProductPresence(buildProductPresenceInput(plan, scene, topic.label));
    const sound = planSoundWorld(buildSoundWorldInput(plan, scene, product, topic.label));
    const camera = planCameraNarrative(buildCameraNarrativeInput(plan, scene, product, sound));

    const sceneIndexes = scene.resolvedMoments.map((moment) => moment.momentIndex);
    const productIndexes = product.curve.map((moment) => moment.momentIndex);
    const soundIndexes = sound.moments.map((moment) => moment.momentIndex);
    const cameraIndexes = camera.moments.map((moment) => moment.momentIndex);
    const sceneIds = scene.resolvedMoments.map((moment) => moment.originalMomentId);

    assert(JSON.stringify(sceneIndexes) === JSON.stringify(canonicalIndexes), `${topic.label} Scene Resolver momentIndex diverges from the canonical index`);
    assert(JSON.stringify(productIndexes) === JSON.stringify(canonicalIndexes), `${topic.label} Product Presence momentIndex diverges from the canonical index`);
    assert(JSON.stringify(soundIndexes) === JSON.stringify(canonicalIndexes), `${topic.label} Sound World momentIndex diverges from the canonical index`);
    assert(JSON.stringify(cameraIndexes) === JSON.stringify(canonicalIndexes), `${topic.label} Camera Role momentIndex diverges from the canonical index`);
    assert(JSON.stringify(sceneIds) === JSON.stringify(momentIds), `${topic.label} Scene Resolver originalMomentId diverges from the canonical Moment id`);

    report.push({
      topic: topic.label,
      topicId: topic.id,
      topicMomentCount: plan.moments.length,
      canonicalIndexes,
      momentIds,
      sceneResolverIndexes: sceneIndexes,
      productPresenceIndexes: productIndexes,
      soundWorldIndexes: soundIndexes,
      cameraRoleIndexes: cameraIndexes,
    });
  }

  console.log("Narrative Moment Index Source audit passed (read-only):", JSON.stringify({
    canonicalField: "NarrativeMoment.index",
    definedIn: "src/immersive-narrative/types.ts",
    createdIn: "src/immersive-narrative/planner.ts#toMoment",
    stableIdField: "NarrativeMoment.id",
    stableIdPreservedAs: "ResolvedMoment.originalMomentId",
    expectedRuntimeValues: [0, 1, 2, 3, 4],
    sceneResolverPropagation: "RECOMPUTED_FROM_ARRAY_POSITION_EQUAL_BY_CONSTRUCTION",
    topics: report,
  }, null, 2));
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
