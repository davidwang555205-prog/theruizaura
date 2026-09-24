import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Spatial Continuity V1.1: anchors, adjacency, transition classes, envelopes,
// origin-vs-execution separation.
const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-spatial-validation-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const envelope = (macroLocation, allowedAnchors, continuityMode = "CONTIGUOUS_ROUTE") => ({
  macroLocation,
  allowedAnchors,
  continuityMode,
});

try {
  await writeFile(
    entryPath,
    `export * from ${JSON.stringify(resolve(projectRoot, "src/immersive-narrative/index.ts"))};\n` +
    `export { validateSpatialSequence, classifyTransition, detectSpatialAnchor } from ${JSON.stringify(resolve(projectRoot, "src/immersive-narrative/spatial/validator.ts"))};\n`
  );
  await build({ entryPoints: [entryPath], bundle: true, format: "esm", platform: "node", outfile: bundlePath, logLevel: "silent" });
  const {
    validateSpatialSequence,
    detectSpatialAnchor,
    NARRATIVE_TOPIC_CATALOG,
    runImmersiveNarrativePipeline,
  } = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);

  const indexes = [0, 1, 2, 3, 4];
  const fixtures = {};
  const singleSpace = validateSpatialSequence(indexes, ["CAFE_INTERIOR", "CAFE_INTERIOR", "CAFE_INTERIOR", "CAFE_INTERIOR", "CAFE_INTERIOR"], envelope("CAFE_VISIT", ["CAFE_INTERIOR"], "SINGLE_SPACE"));
  fixtures["single-space-pass"] = singleSpace.pass;
  const adjacent = validateSpatialSequence(indexes, ["STREET", "SHOP_FRONT", "SHOP_FRONT", "SHOP_FRONT", "SHOP_FRONT"], envelope("BOOKSTORE_VISIT", ["STREET", "SHOP_FRONT", "SHOP_INTERIOR"]));
  fixtures["adjacent-route-pass"] = adjacent.pass;
  const homeRoute = validateSpatialSequence(indexes, ["ELEVATOR_EXIT", "APARTMENT_HALLWAY", "APARTMENT_THRESHOLD", "APARTMENT_THRESHOLD", "ENTRYWAY"], envelope("HOME_RETURN_FINAL_STRETCH", ["ELEVATOR_EXIT", "APARTMENT_HALLWAY", "APARTMENT_THRESHOLD", "ENTRYWAY"]));
  fixtures["elevator-hallway-door-entry-pass"] = homeRoute.pass;
  const bookstoreRoute = validateSpatialSequence(indexes, ["SHOP_WINDOW", "SHOP_WINDOW", "SHOP_FRONT", "SHOP_FRONT", "SHOP_INTERIOR"], envelope("BOOKSTORE_VISIT", ["SHOP_WINDOW", "SHOP_FRONT", "SHOP_INTERIOR"]));
  fixtures["bookstore-window-threshold-interior-pass"] = bookstoreRoute.pass;
  const supermarketHome = validateSpatialSequence(indexes, ["SHOP_INTERIOR", "SHOP_INTERIOR", "ENTRYWAY", "ENTRYWAY", "ENTRYWAY"], envelope("HOME_RETURN_FINAL_STRETCH", ["ELEVATOR_EXIT", "APARTMENT_HALLWAY", "APARTMENT_THRESHOLD", "ENTRYWAY"]));
  fixtures["supermarket-home-fail"] = !supermarketHome.pass;
  const schoolHome = validateSpatialSequence(indexes, ["STREET", "STREET", "STREET", "APARTMENT_THRESHOLD", "ENTRYWAY"], envelope("HOME_RETURN_FINAL_STRETCH", ["ELEVATOR_EXIT", "APARTMENT_HALLWAY", "APARTMENT_THRESHOLD", "ENTRYWAY"]));
  fixtures["school-home-fail"] = !schoolHome.pass;
  const cafeHome = validateSpatialSequence(indexes, ["CAFE_INTERIOR", "CAFE_INTERIOR", "APARTMENT_THRESHOLD", "ENTRYWAY", "ENTRYWAY"], envelope("HOME_RETURN_FINAL_STRETCH", ["ELEVATOR_EXIT", "APARTMENT_HALLWAY", "APARTMENT_THRESHOLD", "ENTRYWAY"]));
  fixtures["cafe-home-fail"] = !cafeHome.pass;
  const multiLocation = validateSpatialSequence(indexes, ["RESIDENTIAL_EXIT", "DESTINATION_APPROACH", "OFFICE_ENTRANCE", "DESTINATION_ANCHOR", "COMMUNITY_PATH"], envelope("ARRIVAL_SLICE", ["COMMUNITY_PATH", "OFFICE_ENTRANCE", "DESTINATION_APPROACH", "DESTINATION_ANCHOR"]));
  fixtures["short-trip-multi-location-fail"] = !multiLocation.pass;
  for (const [name, passed] of Object.entries(fixtures)) {
    assert(passed, `spatial fixture ${name} failed`);
  }

  const perTopic = [];
  let spatiallyContinuous = 0;
  for (const topic of NARRATIVE_TOPIC_CATALOG) {
    const outcome = runImmersiveNarrativePipeline({
      topic: topic.label,
      characterSelection: { ageProfileId: "age_28_32", appearanceGroupId: "asian" },
      season: "秋",
      lifestyleFeeling: "安静 / 克制",
      availableSceneLibrary: topic.defaultSceneLabels.map((label, index) => ({ id: `spatial-${topic.id}-${index}`, label })),
    });
    assert(outcome.status === "GENERATED", `${topic.label} pipeline blocked: ${outcome.status === "BLOCKED" ? outcome.diagnostics.join(" | ") : ""}`);
    const plan = outcome.plan;
    assert(plan.qc.spatial_continuity.status === "PASS", `${topic.label} narrative spatial_continuity FAIL: ${plan.qc.spatial_continuity.reason}`);
    assert(outcome.sceneResolution.qc.scene_sequence_spatially_continuous.status === "PASS", `${topic.label} scene spatial continuity FAIL`);
    assert(outcome.sceneResolution.qc.no_origin_execution_confusion.status === "PASS", `${topic.label} origin/execution confusion FAIL`);
    assert(outcome.sceneResolution.qc.no_unannounced_location_jump.status === "PASS", `${topic.label} location jump FAIL`);
    const anchors = plan.moments.map((moment) => moment.spatialAnchor);
    assert(anchors.every((anchor) => anchor === "UNKNOWN" || plan.spatialEnvelope.allowedAnchors.includes(anchor)), `${topic.label} anchor outside envelope: ${anchors.join(">")}`);
    spatiallyContinuous += 1;
    perTopic.push({
      topic: topic.label,
      envelope: plan.spatialEnvelope.macroLocation,
      anchors,
      transitions: outcome.sceneResolution.resolvedMoments.map((moment) => moment.transitionFromPrevious).filter(Boolean),
      scenes: outcome.sceneResolution.resolvedMoments.map((moment) => moment.sceneName),
    });
  }
  assert(spatiallyContinuous === 13, `${spatiallyContinuous} of 13 topics are spatially continuous`);

  // Production regressions.
  const purchases = perTopic.find((entry) => entry.topic === "采购归来");
  assert(purchases.envelope === "HOME_RETURN_FINAL_STRETCH", `采购归来 envelope is ${purchases.envelope}`);
  assert(!purchases.anchors.includes("SHOP_INTERIOR"), "采购归来 still routes through the supermarket anchor");
  assert(!purchases.scenes.some((scene) => /超市|日常采购/.test(scene)), `采购归来 still resolves a supermarket scene: ${purchases.scenes.join(" → ")}`);
  const shortTrip = perTopic.find((entry) => entry.topic === "短途出行");
  assert(shortTrip.anchors[4] === shortTrip.anchors[3] || shortTrip.anchors[4].startsWith("OFFICE") || shortTrip.anchors[4].startsWith("DESTINATION"), `短途出行 does not resolve a destination anchor: ${shortTrip.anchors.join(">")}`);
  assert(new Set(shortTrip.anchors).size <= 3, `短途出行 still spans ${new Set(shortTrip.anchors).size} anchors`);
  assert(detectSpatialAnchor("精品超市 / 日常采购") === "SHOP_INTERIOR", "supermarket scene does not map to a shop-interior anchor");

  console.log("NARRATIVE SPATIAL CONTINUITY VALIDATION PASS:", JSON.stringify({
    stage: "SPATIAL_CONTINUITY_V1_1",
    topics: NARRATIVE_TOPIC_CATALOG.length,
    spatiallyContinuous,
    fixtures: Object.keys(fixtures).length,
    sceneLibraryModified: "NO",
    perTopic,
  }, null, 2));
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
