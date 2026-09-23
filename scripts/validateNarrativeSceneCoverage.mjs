import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-scene-coverage-validation-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const scenarios = [
  {
    topic: "下班回家",
    scenes: [{ id: "scene-door", label: "公寓门口" }, { id: "scene-entry", label: "玄关" }],
    world: "HOME_ARRIVAL",
  },
  {
    topic: "出门",
    scenes: [{ id: "scene-entry", label: "玄关" }, { id: "scene-exit", label: "住宅楼外" }],
    world: "LEAVING_HOME",
  },
  {
    topic: "周末书店",
    scenes: [{ id: "scene-storefront", label: "书店 / 杂志店门口" }, { id: "scene-inside", label: "书店 / 杂志店内" }],
    world: "BOOKSTORE_VISIT",
  },
  {
    topic: "等人",
    scenes: [{ id: "scene-waiting", label: "写字楼门口" }],
    world: "OFFICE_ENTRANCE_WAIT",
  },
  {
    topic: "咖啡馆",
    scenes: [{ id: "scene-cafe", label: "咖啡馆内" }],
    world: "CAFE_VISIT",
  },
  {
    topic: "采购归来",
    scenes: [{ id: "scene-grocery", label: "精品超市 / 日常采购" }, { id: "scene-entry", label: "归家玄关" }],
    world: "RETURNING_WITH_PURCHASES",
  },
];

try {
  await writeFile(
    entryPath,
    `export * from ${JSON.stringify(resolve(projectRoot, "src/immersive-narrative/index.ts"))};\n` +
    `export { lifestyleSoftSeedingScenePool } from ${JSON.stringify(resolve(projectRoot, "src/data/lifestyleSoftSeedingScenePool.ts"))};\n`
  );
  await build({ entryPoints: [entryPath], bundle: true, format: "esm", platform: "node", outfile: bundlePath, logLevel: "silent" });
  const {
    CURRENT_LOCATION_WORLDS,
    CURRENT_SCENE_RESOLUTION_RULES,
    buildSceneResolverInput,
    lifestyleSoftSeedingScenePool,
    planImmersiveNarrative,
    resolveNarrativeScenes,
  } = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);

  const sceneIds = new Set(lifestyleSoftSeedingScenePool.map((scene) => scene.id));
  assert(lifestyleSoftSeedingScenePool.length === 39, `Expected 39 Scene Library records, received ${lifestyleSoftSeedingScenePool.length}`);
  assert(sceneIds.size === lifestyleSoftSeedingScenePool.length, "Scene Library contains duplicate scene ids");
  assert(new Set(lifestyleSoftSeedingScenePool.map((scene) => scene.scenePreference)).size === lifestyleSoftSeedingScenePool.length, "Scene Library contains duplicate scene labels");
  const newSceneIds = [
    "lifestyle-residential-building-exit",
    "lifestyle-bookstore-interior",
    "lifestyle-home-errand-entry",
  ];
  newSceneIds.forEach((sceneId) => assert(sceneIds.has(sceneId), `Missing coverage scene id: ${sceneId}`));

  const worldIdsBySceneId = new Map();
  for (const world of CURRENT_LOCATION_WORLDS) {
    for (const sceneId of world.sceneIds) {
      assert(sceneIds.has(sceneId), `${world.id} references missing scene ${sceneId}`);
      const worldIds = worldIdsBySceneId.get(sceneId) ?? [];
      worldIds.push(world.id);
      worldIdsBySceneId.set(sceneId, worldIds);
    }
  }
  for (const rule of CURRENT_SCENE_RESOLUTION_RULES) {
    assert(CURRENT_LOCATION_WORLDS.some((world) => world.id === rule.locationWorldId), `${rule.id} references a missing Location World`);
    for (const sceneId of Object.values(rule.sceneAssignments)) {
      assert(sceneIds.has(sceneId), `${rule.id} assigns a missing scene ${sceneId}`);
    }
  }

  const results = [];
  for (const scenario of scenarios) {
    const plan = planImmersiveNarrative({
      topic: scenario.topic,
      characterProfile: "32岁左右成熟女性",
      season: "秋",
      lifestyleFeeling: "安静 / 克制",
      duration: 15,
      availableSceneLibrary: scenario.scenes,
    });
    const resolution = resolveNarrativeScenes(buildSceneResolverInput(plan, scenario.topic));
    assert(plan.status === "APPROVED_FOR_SCENE_RESOLUTION", `${scenario.topic} Narrative Planner failed`);
    assert(resolution.status === "SCENE_RESOLUTION_APPROVED", `${scenario.topic} did not resolve`);
    assert(resolution.locationWorld?.id === scenario.world, `${scenario.topic} resolved to ${resolution.locationWorld?.id}, expected ${scenario.world}`);
    assert(resolution.resolvedMoments.length === plan.momentCount, `${scenario.topic} did not resolve every moment`);
    assert(resolution.unresolvedMoments.length === 0, `${scenario.topic} has unresolved moments`);
    assert(resolution.qc.all_moments_resolved.status === "PASS", `${scenario.topic} failed All Moments Resolved`);
    assert(resolution.qc.location_continuity.status === "PASS", `${scenario.topic} failed Location Continuity`);
    assert(resolution.qc.narrative_preserved.status === "PASS", `${scenario.topic} failed Narrative Preserved`);
    assert(resolution.qc.no_scene_invention.status === "PASS", `${scenario.topic} failed No Scene Invention`);
    resolution.resolvedMoments.forEach((moment, index) => {
      assert(moment.originalPurpose === plan.moments[index].purposeLabel, `${scenario.topic} changed Purpose`);
      assert(moment.originalWhatHappens === plan.moments[index].whatHappens, `${scenario.topic} changed What Happens`);
    });
    results.push({
      topic: scenario.topic,
      status: resolution.status,
      world: resolution.locationWorld.id,
      sceneIds: resolution.resolvedMoments.map((moment) => moment.sceneId),
    });
  }

  console.log("Narrative Scene Coverage Patch validation passed:", JSON.stringify({
    sceneLibraryCount: lifestyleSoftSeedingScenePool.length,
    newSceneIds,
    results,
  }, null, 2));
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
