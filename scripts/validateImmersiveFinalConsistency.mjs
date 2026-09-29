import { build } from "esbuild";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Immersive Narrative Final Output Consolidation.
// One gate over the finished Director Script and the finished Seedance execution
// prompt for every supported Topic / Age Profile / Appearance Group / reference
// state combination. It reads the shipped pipeline; it never re-plans a stage.
const projectRoot = resolve(import.meta.dirname, "..");
const outputPath = process.env.IMMERSIVE_FINAL_CONSISTENCY_OUTPUT
  ?? join(tmpdir(), "immersive-final-consistency-matrix.json");
const tempDirectory = await mkdtemp(join(tmpdir(), "immersive-final-consistency-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

try {
  await writeFile(
    entryPath,
    `export * from ${JSON.stringify(resolve(projectRoot, "src/immersive-narrative/index.ts"))};\n`
  );
  await build({ entryPoints: [entryPath], bundle: true, format: "esm", platform: "node", outfile: bundlePath, logLevel: "silent" });
  const api = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);
  const {
    NARRATIVE_TOPIC_CATALOG,
    AGE_PROFILES,
    APPEARANCE_GROUPS,
    IMMERSIVE_FINAL_CONSISTENCY_CATEGORIES,
    runImmersiveNarrativePipeline,
    getTopicVariantCount,
  } = api;

  const categoryTotals = Object.fromEntries(IMMERSIVE_FINAL_CONSISTENCY_CATEGORIES.map((category) => [category, 0]));
  const categoryCases = Object.fromEntries(IMMERSIVE_FINAL_CONSISTENCY_CATEGORIES.map((category) => [category, []]));
  const referenceStates = [
    { id: "zero-reference", mapping: { mode: "reference_bound_manual", confirmedReferenceCount: 0, instruction: "No reference is attached to this task." } },
    { id: "confirmed-reference", mapping: { mode: "reference_bound_manual", confirmedReferenceCount: 2, instruction: "Upload the two confirmed footwear references in Reference Plan order." } },
  ];
  const coverage = {
    singleTake: 0,
    multiTake: 0,
    thresholdCrossing: 0,
    interiorAnchor: 0,
    exteriorAnchor: 0,
    cafe: 0,
    bookstore: 0,
    walk: 0,
    arrival: 0,
    sitOrSettle: 0,
    objectInteraction: 0,
  };
  const perTopic = [];
  const failures = [];
  let cases = 0;
  let passed = 0;
  let blocked = 0;

  for (const topic of NARRATIVE_TOPIC_CATALOG) {
    const variantCount = getTopicVariantCount(topic.label);
    const topicRow = {
      topic: topic.id,
      topicLabel: topic.label,
      variantCount,
      cases: 0,
      failures: 0,
      takes: new Set(),
      referenceBranches: new Set(),
      ageProfiles: new Set(),
      appearanceGroups: new Set(),
    };
    for (const [ageIndex, age] of AGE_PROFILES.entries()) {
      for (const [appearanceIndex, appearance] of APPEARANCE_GROUPS.entries()) {
        for (const referenceState of referenceStates) {
          cases += 1;
          topicRow.cases += 1;
          topicRow.ageProfiles.add(age.id);
          topicRow.appearanceGroups.add(appearance.id);
          topicRow.referenceBranches.add(referenceState.id);
          const outcome = runImmersiveNarrativePipeline({
            topic: topic.label,
            characterSelection: { ageProfileId: age.id, appearanceGroupId: appearance.id },
            season: "秋",
            lifestyleFeeling: "安静 / 克制",
            availableSceneLibrary: topic.defaultSceneLabels.map((label, index) => ({ id: `final-consistency-${topic.id}-${index}`, label })),
            variantSeed: (ageIndex * APPEARANCE_GROUPS.length + appearanceIndex) % variantCount,
            referenceMapping: referenceState.mapping,
          });
          if (outcome.status !== "GENERATED") {
            blocked += 1;
            failures.push({ topic: topic.id, age: age.id, appearance: appearance.id, reference: referenceState.id, status: "BLOCKED", reason: outcome.reason });
            topicRow.failures += 1;
            continue;
          }
          const validation = outcome.finalConsistencyValidation;
          const takeCount = outcome.presentation.directorScript.takes.length;
          topicRow.takes.add(takeCount);
          if (takeCount === 1) coverage.singleTake += 1; else coverage.multiTake += 1;
          if (outcome.modelFacingScript.contracts.some((contract) => contract.takeBoundary?.kind === "REAL_SPATIAL_BOUNDARY")) coverage.thresholdCrossing += 1;
          if (outcome.modelFacingScript.contracts.some((contract) => ["ENTRYWAY", "HOME_INTERIOR", "SHOP_INTERIOR", "CAFE_INTERIOR", "CAFE_COUNTER", "TABLE"].includes(contract.spatialAnchor))) coverage.interiorAnchor += 1;
          if (outcome.modelFacingScript.contracts.some((contract) => ["STREET", "COMMUNITY_PATH", "APARTMENT_HALLWAY", "RESIDENTIAL_EXIT"].includes(contract.spatialAnchor))) coverage.exteriorAnchor += 1;
          if (outcome.sceneResolution.locationWorld?.id === "CAFE_VISIT") coverage.cafe += 1;
          if (outcome.sceneResolution.locationWorld?.id === "BOOKSTORE_VISIT") coverage.bookstore += 1;
          if (/WALKING/.test(outcome.modelFacingScript.contracts.map((contract) => contract.worldStateAfter?.facts["character.motion"]).join(","))) coverage.walk += 1;
          if (outcome.modelFacingScript.contracts.some((contract) => (contract.worldStateAfter?.completedEvents ?? []).includes("ARRIVE"))) coverage.arrival += 1;
          if (outcome.modelFacingScript.contracts.some((contract) => ["SETTLED", "SEATED"].includes(contract.worldStateAfter?.facts["character.motion"] ?? ""))) coverage.sitOrSettle += 1;
          if (outcome.modelFacingScript.contracts.some((contract) => (contract.worldStateAfter?.completedEvents ?? []).length > 0)) coverage.objectInteraction += 1;

          const failedCategories = Object.entries(validation.categoryFailures).filter(([, count]) => count > 0).map(([category]) => category);
          for (const category of failedCategories) {
            categoryTotals[category] += 1;
            categoryCases[category].push(`${topic.id}/${age.id}/${appearance.id}/${referenceState.id}`);
          }
          const passes = validation.status === "IMMERSIVE_FINAL_CONSISTENCY_VALIDATED"
            && outcome.presentationValidation.status === "DIRECTOR_SCRIPT_VALIDATED"
            && outcome.executionValidation.status === "EXECUTION_SCRIPT_VALIDATED"
            && outcome.scriptValidation.status === "IMMERSIVE_SEEDANCE_SCRIPT_VALIDATED";
          if (passes) passed += 1;
          else {
            topicRow.failures += 1;
            failures.push({
              topic: topic.id,
              age: age.id,
              appearance: appearance.id,
              reference: referenceState.id,
              status: "FAIL",
              categories: failedCategories,
              reasons: validation.failureReasons.slice(0, 4),
            });
          }
        }
      }
    }
    perTopic.push({
      topic: topicRow.topic,
      cases: topicRow.cases,
      failures: topicRow.failures,
      takes: [...topicRow.takes].sort(),
      referenceBranches: [...topicRow.referenceBranches].sort(),
      ageProfiles: topicRow.ageProfiles.size,
      appearanceGroups: topicRow.appearanceGroups.size,
    });
  }

  const coverageComplete = Object.entries(coverage).every(([, count]) => count > 0);
  const totalCategoryFailures = Object.values(categoryTotals).reduce((total, count) => total + count, 0);
  const report = {
    stage: "IMMERSIVE_FINAL_OUTPUT_CONSOLIDATION",
    generatedAt: new Date().toISOString(),
    cases,
    passed,
    blocked,
    failed: cases - passed - blocked,
    perTopic,
    coverage,
    coverageComplete,
    categories: categoryTotals,
    categoryExamples: categoryCases,
    failures: failures.slice(0, 40),
  };
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({
    output: outputPath,
    cases,
    passed,
    blocked,
    failed: report.failed,
    coverageComplete,
    categories: categoryTotals,
  }, null, 2));

  assert(blocked === 0, `${blocked} case(s) were blocked`);
  assert(report.failed === 0, `${report.failed} case(s) failed the final consistency gate`);
  assert(coverageComplete, `structural coverage incomplete: ${JSON.stringify(coverage)}`);
  assert(totalCategoryFailures === 0, `${totalCategoryFailures} final-script consistency categor(ies) failed`);

  console.log("IMMERSIVE FINAL CONSISTENCY MATRIX PASS:", JSON.stringify({
    cases,
    topics: NARRATIVE_TOPIC_CATALOG.length,
    ageProfiles: AGE_PROFILES.length,
    appearanceGroups: APPEARANCE_GROUPS.length,
    referenceStates: referenceStates.length,
    takePlans: { single: coverage.singleTake, multi: coverage.multiTake },
    categories: categoryTotals,
  }));
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
