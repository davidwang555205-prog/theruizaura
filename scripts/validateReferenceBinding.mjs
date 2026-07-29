import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const temp = await mkdtemp(resolve(tmpdir(), "theruiz-reference-binding-"));
const bindingBundle = resolve(temp, "binding.mjs");
const compilerBundle = resolve(temp, "compiler.mjs");
await Promise.all([
  build({ entryPoints: [resolve(root, "src/visual-system/taskReferenceBinding.ts")], bundle: true, format: "esm", platform: "node", outfile: bindingBundle, logLevel: "silent" }),
  build({ entryPoints: [resolve(root, "src/prompt-engine/compilePrompt.ts")], bundle: true, format: "esm", platform: "node", outfile: compilerBundle, logLevel: "silent" }),
]);
const { assignReferenceRole, bindTaskProductTruth, createTaskReferenceSet, productTruthPromptLines } = await import(`${pathToFileURL(bindingBundle).href}?v=${Date.now()}`);
const { compilePrompt } = await import(`${pathToFileURL(compilerBundle).href}?v=${Date.now()}`);
const assert = (condition, message) => { if (!condition) throw new Error(`validate:reference-binding: ${message}`); };
const asset = (id, uploadIndex, role) => assignReferenceRole({ id, name: `${id}.jpg`, mime: "image/jpeg", originalUploadIndex: uploadIndex, roles: ["unclassified"], coverage: [], confidence: "unknown", assignmentSource: "unclassified", needsConfirmation: true, confirmedByUser: false }, role);
const referenceSet = createTaskReferenceSet({
  referenceSetId: "reference-set-validation",
  taskId: "current-task-validation",
  createdAt: "2026-07-29T00:00:00.000Z",
  assets: [asset("heel", 0, "heel_reference"), asset("material", 1, "material_reference"), asset("full-side", 2, "full_product_reference"), asset("top", 3, "top_view_reference")],
});
const { productTruth, referencePlan } = bindTaskProductTruth(referenceSet);
assert(referenceSet.originalUploadOrder.join(",") === "heel,material,full-side,top", "original upload order changed");
assert(referencePlan.order.join(",") === "full-side,top,heel,material", "reference plan did not reorder by role priority");
assert(referenceSet.originalUploadOrder.join(",") !== referencePlan.order.join(","), "original upload order and reference plan order were conflated");
assert(productTruth.coverage.includes("silhouette") && productTruth.coverage.includes("side_panel_structure") && productTruth.coverage.includes("outsole_profile") && productTruth.coverage.includes("color_blocking"), "full side did not provide multi-role coverage");
assert(productTruth.productTruthMode === "reference_bound", "product truth mode is not reference_bound");
assert(productTruth.referenceEvidenceBound === true && referencePlan.referencePlanReady === true, "complete confirmed reference evidence did not produce a ready manual plan");
assert(productTruth.structuredFactsExtracted === false, "role confirmation was misreported as structured fact extraction");
assert(productTruth.manualExecutionReady === true && referencePlan.manualExecutionReady === true, "complete reference plan is not manual-execution ready");
assert(productTruth.providerExecutionReady === false && referencePlan.providerExecutionReady === false, "provider execution was enabled without an API integration");
assert(productTruth.productionReady === false, "reference plan completeness was misreported as production readiness");
for (const [factName, fact] of Object.entries(productTruth.facts)) {
  assert(fact.value === "unknown" && fact.extractionSource === "not_extracted", `${factName} was misreported as a confirmed structured fact`);
}
const referenceBoundPrompt = productTruthPromptLines(productTruth).join(" ");
for (const invented of ["leather", "suede", "mesh", "canvas", "knit", "nubuck", "rounded toe", "slim outsole", "brown outsole"]) assert(!referenceBoundPrompt.toLowerCase().includes(invented), `role-only evidence invented ${invented}`);
assert(referenceBoundPrompt.includes("Preserve the exact material zones, surface finish, texture transitions, stitching relationships, and construction details shown in the confirmed material references."), "neutral material preservation language absent");

const missingHeelSet = createTaskReferenceSet({ ...referenceSet, referenceSetId: "missing-heel", assets: referenceSet.assets.filter((item) => item.id !== "heel") });
const missingHeel = bindTaskProductTruth(missingHeelSet);
assert(missingHeel.productTruth.status === "draft", "missing heel must remain draft");
assert(missingHeel.referencePlan.diagnostics.includes("MISSING_HEEL_STRUCTURE"), "missing heel diagnostic absent");
let strictError = "";
try {
  compilePrompt({ brandId: "theruiz_aura", imageType: "产品上脚图", compositionMode: "fullFigure", scenePreference: "棚内上新拍摄", season: "夏", modelChoice: "欧洲25–30岁女模特", modelContinuity: "新人物", hasShoe: true, garmentTypePreference: "裤装", userExtraRequirement: "", isMultiImage: false, generationNonce: 1, provider: "image2", selectedProductTruth: missingHeel.productTruth, referencePlan: missingHeel.referencePlan, strictProduction: true });
} catch (error) { strictError = String(error?.message ?? error); }
assert(strictError.includes("REFERENCE_PLAN_NOT_READY") && strictError.includes("PROVIDER_EXECUTION_NOT_READY"), "strict production did not block incomplete evidence and unavailable provider execution");

const compiled = compilePrompt({ brandId: "theruiz_aura", imageType: "拍摄花絮 / 材质图", compositionMode: "productStillLife", scenePreference: "棚内上新拍摄", season: "夏", modelChoice: "欧洲25–30岁女模特", modelContinuity: "新人物", hasShoe: true, garmentTypePreference: "裤装", userExtraRequirement: "", isMultiImage: false, generationNonce: 1, provider: "image2", activeVisualRoleId: "C4", selectedProductTruth: productTruth, productTruthProvenance: { source: "current_task_uploaded_images", assetIds: referencePlan.assetIds, referenceSetId: referenceSet.referenceSetId, taskProductTruthId: productTruth.taskProductTruthId, version: productTruth.version }, referencePlan });
for (const internal of [referenceSet.referenceSetId, productTruth.taskProductTruthId, "full-side", "confidence", "readiness", "diagnostics", "MISSING_"]) assert(!compiled.prompt.toLowerCase().includes(internal.toLowerCase()), `provider prompt leaked ${internal}`);
for (const invented of ["leather", "suede", "mesh", "canvas", "knit", "nubuck"]) assert(!compiled.prompt.toLowerCase().includes(invented), `C4 provider prompt invented ${invented}`);
assert(compiled.prompt.includes("Preserve the exact material zones, surface finish, texture transitions, stitching relationships, and construction details shown in the confirmed material references."), "C4 provider prompt lacks neutral material preservation language");
assert(compiled.metadata.productTruthMode === "reference_bound" && compiled.metadata.referenceEvidenceBound === true && compiled.metadata.referencePlanReady === true, "metadata lost reference-bound evidence readiness");
assert(compiled.metadata.structuredFactsExtracted === false && compiled.metadata.manualExecutionReady === true, "metadata misreported structured facts or manual readiness");
assert(compiled.metadata.providerExecutionReady === false && compiled.metadata.productionReady === false, "metadata misreported provider or production readiness");
console.log("Reference binding validation passed: role-only facts remain unknown, upload and plan order stay separate, C4 uses neutral preservation language, manual execution is ready, and provider/production readiness remain false.");
await rm(temp, { recursive: true, force: true });
