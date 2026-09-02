import { build } from "esbuild";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const temp = await mkdtemp(resolve(tmpdir(), "theruiz-fmcg-"));
const bundle = resolve(temp, "fmcg.mjs");
await build({ entryPoints: [resolve(root, "src/fmcg/index.ts")], bundle: true, format: "esm", platform: "node", outfile: bundle, logLevel: "silent" });
const fmcg = await import(`${pathToFileURL(bundle).href}?v=${Date.now()}`);
const assert = (condition, message) => { if (!condition) throw new Error(`validate:fmcg: ${message}`); };

const assets = [
  { id: "back", name: "back.jpg", originalUploadIndex: 0, role: "back_packaging_reference", confirmedByUser: true },
  { id: "primary", name: "primary.jpg", originalUploadIndex: 1, role: "primary_product_reference", confirmedByUser: true },
  { id: "scale", name: "scale.jpg", originalUploadIndex: 2, role: "scale_reference", confirmedByUser: true },
  { id: "unknown", name: "unknown.jpg", originalUploadIndex: 3, role: "unclassified", confirmedByUser: false },
];
const binding = fmcg.bindFmcgProductTruth("beverage", assets);
assert(binding.productTruth.productCategory === "fmcg", "product truth category is not isolated");
assert(binding.productTruth.productTruthMode === "reference_bound", "product truth mode changed");
assert(binding.productTruth.structuredFactsExtracted === false, "structured facts were fabricated");
assert(binding.productTruth.providerExecutionReady === false && binding.productTruth.productionReady === false, "provider or production readiness was enabled");
assert(binding.referencePlan.productCategory === "fmcg", "reference plan category is not isolated");
assert(binding.referencePlan.order[0] === "primary", "reference plan priority is incorrect");
assert(!binding.referencePlan.order.includes("unknown"), "unclassified asset entered the plan");
assert(assets.map((asset) => asset.id).join(",") === "back,primary,scale,unknown", "original upload order changed");
for (const fact of Object.values(binding.productTruth.facts)) assert(fact.value === "unknown" && fact.extractionSource === "not_extracted", "role evidence became a product fact");

const topics = Object.keys(fmcg.fmcgTopicLabels);
assert(topics.length === 8, "expected eight FMCG themes");
assert(fmcg.fmcgCategoryLabels.home_kitchen_drinkware === "家居餐厨 / 饮具", "drinkware category is missing");
assert(fmcg.getFmcgReferenceRoles("home_kitchen_drinkware").includes("base_reference"), "drinkware reference roles are unavailable");
assert(!fmcg.getFmcgReferenceRoles("beverage").includes("base_reference"), "drinkware role leaked into beverage roles");
const footwearTerms = ["toe structure", "outsole", "heel structure", "laces", "on-foot", "footwear visibility", "trouser hem above the sneakers", "grounded feet inside shoes"];
for (const topicId of topics) {
  for (const imageCount of [1, 3, 5, 8]) {
    const input = {
      fmcgCategory: "beverage", topicId, imageCount, season: "秋", productName: "Sample Beverage",
      confirmedProductDescription: "A user-confirmed compact package with a dark red and cream visible color relationship",
      confirmedClaims: "", brandVisual: "Quiet warm realism", extraRequirement: "", generationNonce: imageCount,
      productTruth: binding.productTruth, referencePlan: binding.referencePlan,
    };
    const set = fmcg.compileFmcgPromptSet(input);
    assert(set.productCategory === "fmcg" && set.cards.length === imageCount, `${topicId} did not compile ${imageCount} cards`);
    assert(new Set(set.cards.map((card) => card.id)).size === imageCount, `${topicId} repeated a card in ${imageCount}-image mode`);
    const prompt = fmcg.formatFmcgPromptSet(set);
    for (const term of footwearTerms) assert(!prompt.toLowerCase().includes(term), `${topicId} FMCG prompt leaked footwear term: ${term}`);
    for (const internal of ["structuredfactsextracted", "providerexecutionready", "productionready", "missing_reference", "diagnostics"] ) assert(!prompt.toLowerCase().includes(internal), `${topicId} prompt leaked internal field: ${internal}`);
    const video10 = fmcg.compileFmcgVideoScript(input, set, 10);
    const video15 = fmcg.compileFmcgVideoScript(input, set, 15);
    assert(video10.includes("independent three-beat") && video10.includes("0–1.5s") && video10.includes("9.3–10s"), "10s FilmSpec is not independent three-beat");
    assert(video15.includes("independent four-beat") && video15.includes("8–14.3s / PRODUCT EVIDENCE") && video15.includes("14.3–15s"), "15s FilmSpec lacks independent evidence beat");
    for (const term of footwearTerms) assert(!`${video10}\n${video15}`.toLowerCase().includes(term), `FMCG video leaked footwear term: ${term}`);
  }
}

const drinkwareBinding = fmcg.bindFmcgProductTruth("home_kitchen_drinkware", [
  { id: "cup-primary", name: "cup-primary.jpg", originalUploadIndex: 0, role: "primary_product_reference", confirmedByUser: true },
  { id: "cup-profile", name: "cup-profile.jpg", originalUploadIndex: 1, role: "vessel_profile_reference", confirmedByUser: true },
  { id: "cup-base", name: "cup-base.jpg", originalUploadIndex: 2, role: "base_reference", confirmedByUser: true },
]);
assert(drinkwareBinding.productTruth.referenceEvidenceBound === true, "complete drinkware evidence did not bind");
assert(drinkwareBinding.productTruth.structuredFactsExtracted === false, "drinkware references fabricated structured facts");
assert(drinkwareBinding.productTruth.facts.vessel_profile.value === "unknown", "drinkware profile role became a product fact");
assert(drinkwareBinding.productTruth.providerExecutionReady === false && drinkwareBinding.productTruth.productionReady === false, "drinkware enabled provider execution");
const incompleteDrinkware = fmcg.bindFmcgProductTruth("home_kitchen_drinkware", [
  { id: "cup-primary-only", name: "cup-primary-only.jpg", originalUploadIndex: 0, role: "primary_product_reference", confirmedByUser: true },
]);
assert(incompleteDrinkware.productTruth.referenceEvidenceBound === false && incompleteDrinkware.productTruth.missingCoverage.includes("base_relationship"), "drinkware base evidence did not fail closed");
const drinkwareInput = {
  fmcgCategory: "home_kitchen_drinkware", topicId: "lifestyle_soft_seeding", imageCount: 8, season: "秋", productName: "User-confirmed cup",
  confirmedProductDescription: "", confirmedClaims: "", brandVisual: "Quiet warm realism", extraRequirement: "", generationNonce: 2,
  productTruth: drinkwareBinding.productTruth, referencePlan: drinkwareBinding.referencePlan,
};
const drinkwareSet = fmcg.compileFmcgPromptSet(drinkwareInput);
const drinkwarePrompt = fmcg.formatFmcgPromptSet(drinkwareSet).toLowerCase();
for (const required of ["vessel silhouette", "rim diameter", "wall taper", "base geometry", "handle shape", "transparency or opacity", "decoration placement", "real hand-to-vessel scale"]) {
  assert(drinkwarePrompt.includes(required), `drinkware protection is missing: ${required}`);
}
for (const contamination of ["shoe", "sneaker", "outsole", "heel structure", "on-foot", "front-panel", "side-panel", "back-panel", "closure-area", "upper-package"]) {
  assert(!drinkwarePrompt.includes(contamination), `drinkware prompt contains incompatible semantics: ${contamination}`);
}
const drinkwareVideo = fmcg.compileFmcgVideoScript(drinkwareInput, drinkwareSet, 15).toLowerCase();
assert(drinkwareVideo.includes("confirmed vessel") && drinkwareVideo.includes("independent four-beat"), "drinkware video did not use vessel-specific FilmSpec");
for (const topicId of topics) {
  for (const imageCount of [1, 3, 5, 8]) {
    const input = { ...drinkwareInput, topicId, imageCount, generationNonce: imageCount + 1 };
    const set = fmcg.compileFmcgPromptSet(input);
    const compiledText = fmcg.formatFmcgPromptSet(set).toLowerCase();
    assert(set.cards.length === imageCount, `${topicId} did not compile ${imageCount} drinkware cards`);
    for (const contamination of ["shoe", "sneaker", "outsole", "heel structure", "on-foot", "front-panel", "side-panel", "back-panel", "closure-area", "upper-package"]) {
      assert(!compiledText.includes(contamination), `${topicId} drinkware prompt contains incompatible semantics: ${contamination}`);
    }
    for (const duration of [10, 15]) {
      const video = fmcg.compileFmcgVideoScript(input, set, duration).toLowerCase();
      assert(video.includes("confirmed vessel"), `${topicId} ${duration}s video lost drinkware semantics`);
      for (const term of footwearTerms) assert(!video.includes(term), `${topicId} ${duration}s drinkware video leaked footwear term: ${term}`);
    }
  }
}

let mismatch = "";
try {
  fmcg.compileFmcgPromptSet({ fmcgCategory: "beverage", topicId: "launch_conversion", imageCount: 1, season: "夏", productName: "", confirmedProductDescription: "", confirmedClaims: "", brandVisual: "", extraRequirement: "", generationNonce: 0, productTruth: { ...binding.productTruth, productCategory: "footwear" }, referencePlan: binding.referencePlan });
} catch (error) { mismatch = String(error?.message ?? error); }
assert(mismatch.includes("FMCG_CATEGORY_MISMATCH"), "category mismatch did not fail closed");

const footwearFiles = [
  "src/visual-system/taskReferenceBinding.ts",
  "src/utils/teamPromptCore.ts",
  "src/prompt-engine/runtime.ts",
  "src/video-script/compileSeedanceVideoScript.ts",
];
for (const file of footwearFiles) {
  const source = await readFile(resolve(root, file), "utf8");
  assert(!source.includes("./fmcg") && !source.includes("../fmcg"), `${file} imports FMCG runtime`);
}

console.log("FMCG validation passed: isolated drinkware protection, category-scoped reference roles, eight themes, 1/3/5/8 cards, independent 10s/15s scripts, fail-closed routing, and zero footwear-runtime imports.");
await rm(temp, { recursive: true, force: true });
