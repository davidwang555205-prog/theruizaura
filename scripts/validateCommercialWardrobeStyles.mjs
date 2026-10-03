import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const temporary = await mkdtemp(join(tmpdir(), "theruizaura-commercial-wardrobe-"));
const bundle = join(temporary, "brand-adapter.mjs");
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const coverage = ["silhouette", "toe_structure", "side_panel_structure", "heel_structure", "outsole_profile", "color_blocking", "material_evidence"];
const pairs = [
  ["QUIET_LUXURY", "RELAXED_MINIMAL"],
  ["QUIET_LUXURY", "SOFT_FEMININE"],
  ["URBAN_MOTION", "URBAN_COMMUTER"],
  ["URBAN_MOTION", "WEEKEND_CITY"],
  ["DAILY_STYLING", "DENIM_EVERYDAY"],
  ["DAILY_STYLING", "RELAXED_TAILORING"],
];

try {
  await build({
    entryPoints: [resolve(root, "src/commercial-film/brand-adapter/index.ts")],
    bundle: true, format: "esm", platform: "node", outfile: bundle, logLevel: "silent",
  });
  const api = await import(pathToFileURL(bundle).href);
  const brandPack = api.loadCommercialBrandPack("THERUIZ_AURA");
  const styleIds = Object.keys(brandPack.wardrobeStyles);
  assert(styleIds.length === 6, `Expected six Commercial wardrobe styles, got ${styleIds.length}`);
  assert(brandPack.approvedIntents.length === 5 && styleIds.every((id) => !brandPack.approvedIntents.includes(id)), "Styles entered Commercial Intent configuration");

  const resolvedSamples = [];
  for (const styleId of styleIds) {
    const variants = Array.from({ length: 8 }, (_, generationNonce) => api.resolveCommercialWardrobe({
      styles: brandPack.wardrobeStyles, intent: "DAILY_STYLING", styleId, season: "秋", generationNonce,
    }));
    assert(new Set(variants.map((item) => item.visualLines[1])).size >= 4, `${styleId} has insufficient seeded outfit diversity`);
    assert(new Set(variants.map((item) => item.colors.top)).size >= 3, `${styleId} repeats one top color across seeded variants`);
    assert(JSON.stringify(variants[0]) === JSON.stringify(api.resolveCommercialWardrobe({
      styles: brandPack.wardrobeStyles, intent: "DAILY_STYLING", styleId, season: "秋", generationNonce: 0,
    })), `${styleId} is not deterministic`);
    resolvedSamples.push({ styleId, variants: variants.map((item) => item.visualLines[1]) });
  }

  const missingReferenceRequest = {
    commercialIntent: "PRODUCT_CRAFT",
    characterSelection: { ageProfileId: "age_33_37", appearanceGroupId: "asian" },
    season: "秋", lifestyleFeeling: "安静 / 自然 / 克制", duration: 15, generationNonce: 0,
    reference: {
      referenceSetId: "wardrobe-missing-evidence", taskId: "commercial-wardrobe-validation",
      sourceType: "current_task_reference_set", confirmationStatus: "incomplete",
      confirmedReferenceCount: 0, confirmedAssetIds: [], coverage: [], missingCoverage: coverage,
      referencePlanReady: false, productTruthMode: "reference_bound", productTruth: null,
    },
  };
  const craftBlocks = ["RELAXED_MINIMAL", "SOFT_FEMININE"].map((styleId) => api.runCommercialFilmWithBrandPack({
    brandPack, request: missingReferenceRequest, caseContext: missingReferenceRequest.lifestyleFeeling, styleId,
  }));
  assert(craftBlocks.every((run) => run.outcome.status === "BLOCKED"), "PRODUCT_CRAFT accepted missing Product Evidence after Style selection");
  assert(craftBlocks[0].outcome.code === craftBlocks[1].outcome.code, "Style changed the PRODUCT_CRAFT evidence block");

  const results = [];
  for (const intent of ["QUIET_LUXURY", "URBAN_MOTION", "DAILY_STYLING"]) {
    const selectedPairs = pairs.filter(([candidate]) => candidate === intent);
    let accepted = null;
    for (let nonce = 0; nonce < 12 && !accepted; nonce += 1) {
      const request = {
        commercialIntent: intent,
        characterSelection: { ageProfileId: "age_33_37", appearanceGroupId: "asian" },
        season: "秋", lifestyleFeeling: "安静 / 自然 / 克制", duration: 15, generationNonce: nonce,
        reference: {
          referenceSetId: `wardrobe-${intent}-${nonce}`, taskId: "commercial-wardrobe-validation",
          sourceType: "current_task_reference_set", confirmationStatus: "confirmed",
          confirmedReferenceCount: 2, confirmedAssetIds: ["front", "side"],
          coverage, missingCoverage: [], referencePlanReady: true,
          productTruthMode: "reference_bound",
          productTruth: { coverage, status: "draft", referenceEvidenceBound: true, productTruthMode: "reference_bound" },
        },
      };
      const runs = selectedPairs.map(([, styleId]) => api.runCommercialFilmWithBrandPack({
        brandPack, request, caseContext: request.lifestyleFeeling, styleId,
      }));
      if (runs.every((run) => run.outcome.status === "GENERATED")) accepted = { nonce, runs };
    }
    assert(accepted, `${intent}: no generated Commercial Film case in 12 existing seeded variants`);
    const [first, second] = accepted.runs;
    assert(JSON.stringify(first.baseOutcome.plan) === JSON.stringify(second.baseOutcome.plan), `${intent}: Style changed the Engine base plan`);
    for (const [pairIndex, run] of accepted.runs.entries()) {
      const styleId = selectedPairs[pairIndex][1];
      const plan = run.outcome.plan;
      const wardrobe = run.brandContext.wardrobe;
      const composition = wardrobe.visualLines[1];
      assert(run.audit.wardrobeStyleId === styleId, `${intent}/${styleId}: wrong style selected`);
      assert(plan.finalExecutionPlan.status === "VALID" && plan.renderValidation.status === "VALID", `${intent}/${styleId}: final render invalid`);
      assert(plan.finalExecutionPlan.renderPolicy.visualLookLines.includes(composition), `${intent}/${styleId}: Final Execution Plan lost wardrobe`);
      assert(plan.directorScript.text.includes(composition), `${intent}/${styleId}: Director Script lost wardrobe`);
      assert(plan.seedancePrompt.text.includes(composition), `${intent}/${styleId}: Seedance Prompt lost wardrobe`);
      assert(run.checks.every((check) => check.status === "PASS"), `${intent}/${styleId}: Brand Adapter check failed: ${run.checks.filter((check) => check.status !== "PASS").map((check) => check.id).join(", ")}`);
      results.push({ intent, styleId, nonce: accepted.nonce, composition });
    }
    const firstPlan = first.outcome.plan.finalExecutionPlan;
    const secondPlan = second.outcome.plan.finalExecutionPlan;
    for (const field of ["physicalState", "productVisibility", "camera", "beats", "device", "signature", "ending"]) {
      assert(JSON.stringify(firstPlan[field]) === JSON.stringify(secondPlan[field]), `${intent}: Style changed ${field}`);
    }
    assert(first.brandContext.wardrobe.visualLines[1] !== second.brandContext.wardrobe.visualLines[1], `${intent}: two styles resolved to one outfit`);
  }
  assert(new Set(results.map((item) => item.composition)).size === 6, "Six requested combinations did not produce six different outfits");
  assert(!results.every((item) => /beige|cream/i.test(item.composition) && /grey trousers/i.test(item.composition)), "All wardrobe outputs collapsed to beige knit and grey trousers");
  console.log(JSON.stringify({ status: "PASS", combinations: results, seededVariantsPerStyle: resolvedSamples.map((item) => ({ styleId: item.styleId, unique: new Set(item.variants).size })), preserved: ["Engine base plan", "physicalState", "productVisibility", "camera", "beats", "device", "signature", "ending"] }, null, 2));
} finally {
  await rm(temporary, { recursive: true, force: true });
}
