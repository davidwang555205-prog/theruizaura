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
const { assignReferenceRole, bindTaskProductTruth, buildReferenceBindingFingerprint, buildReferencePlanDisplayItems, createTaskReferenceSet, isGeneratedPromptStale, productTruthPromptLines, resolvePromptForCopy } = await import(`${pathToFileURL(bindingBundle).href}?v=${Date.now()}`);
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

const reassignedSet = createTaskReferenceSet({
  ...referenceSet,
  assets: referenceSet.assets.map((item) => item.id === "material" ? assignReferenceRole(item, "primary_product_reference") : item),
});
const reassigned = bindTaskProductTruth(reassignedSet);
assert(reassignedSet.originalUploadOrder.join(",") === referenceSet.originalUploadOrder.join(","), "role reassignment changed original upload order");
assert(reassigned.referencePlan.order.join(",") !== referencePlan.order.join(","), "role reassignment did not change reference plan order");
assert(reassigned.referencePlan.order[0] === "material", "reassigned primary reference did not move to the first plan position");

const fingerprint = buildReferenceBindingFingerprint(referenceSet, productTruth, referencePlan);
const reassignedFingerprint = buildReferenceBindingFingerprint(reassignedSet, reassigned.productTruth, reassigned.referencePlan);
assert(fingerprint !== reassignedFingerprint, "role change did not change binding fingerprint");
assert(isGeneratedPromptStale(reassignedFingerprint, fingerprint), "changed binding did not mark generated prompt stale");
let copyCompileCount = 0;
const copyResolution = resolvePromptForCopy({ currentFingerprint: reassignedFingerprint, generatedFingerprint: fingerprint, generatedPrompt: "OLD PROMPT", compileLatest: () => { copyCompileCount += 1; return "LATEST PROMPT"; } });
assert(copyResolution.recompiled && copyResolution.prompt === "LATEST PROMPT" && copyCompileCount === 1, "copy safety reused a stale prompt");
const currentCopyResolution = resolvePromptForCopy({ currentFingerprint: reassignedFingerprint, generatedFingerprint: reassignedFingerprint, generatedPrompt: "CURRENT PROMPT", compileLatest: () => { copyCompileCount += 1; return "UNEXPECTED"; } });
assert(!currentCopyResolution.recompiled && currentCopyResolution.prompt === "CURRENT PROMPT" && copyCompileCount === 1, "copy safety recompiled a current prompt");

const displaySet = createTaskReferenceSet({
  ...referenceSet,
  assets: [...referenceSet.assets, { id: "unclassified", name: "unclassified.jpg", mime: "image/jpeg", originalUploadIndex: 4, roles: ["unclassified"], coverage: [], confidence: "unknown", assignmentSource: "unclassified", needsConfirmation: true, confirmedByUser: false }],
});
const displayBinding = bindTaskProductTruth(displaySet);
const displayItems = buildReferencePlanDisplayItems(displaySet, displayBinding.referencePlan);
assert(displayItems.map((item) => item.index).join(",") === "1,2,3,4", "reference plan display numbering is incorrect");
assert(displayItems.map((item) => item.fileName).join(",") === "full-side.jpg,top.jpg,heel.jpg,material.jpg", "reference plan display did not use plan order and filenames");
assert(displayItems.every((item) => item.role && item.roleLabel), "reference plan display omitted role information");
assert(!displayItems.some((item) => item.assetId === "unclassified"), "unclassified asset entered confirmed reference plan display");

const missingHeelSet = createTaskReferenceSet({ ...referenceSet, referenceSetId: "missing-heel", assets: referenceSet.assets.filter((item) => item.id !== "heel") });
const missingHeel = bindTaskProductTruth(missingHeelSet);
assert(missingHeel.productTruth.status === "draft", "missing heel must remain draft");
assert(missingHeel.referencePlan.diagnostics.includes("MISSING_HEEL_STRUCTURE"), "missing heel diagnostic absent");
let strictError = "";
try {
  compilePrompt({ brandId: "theruiz_aura", imageType: "产品上脚图", compositionMode: "fullFigure", scenePreference: "棚内上新拍摄", season: "夏", modelChoice: "欧洲25–30岁女模特", modelContinuity: "新人物", hasShoe: true, garmentTypePreference: "裤装", userExtraRequirement: "", isMultiImage: false, generationNonce: 1, provider: "image2", selectedProductTruth: missingHeel.productTruth, referencePlan: missingHeel.referencePlan, strictProduction: true });
} catch (error) { strictError = String(error?.message ?? error); }
assert(strictError.includes("REFERENCE_PLAN_NOT_READY") && strictError.includes("PROVIDER_EXECUTION_NOT_READY"), "strict production did not block incomplete evidence and unavailable provider execution");

const baseInput = { brandId: "theruiz_aura", imageType: "拍摄花絮 / 材质图", compositionMode: "productStillLife", scenePreference: "棚内上新拍摄", season: "夏", modelChoice: "欧洲25–30岁女模特", modelContinuity: "新人物", hasShoe: true, garmentTypePreference: "裤装", userExtraRequirement: "", isMultiImage: false, generationNonce: 1, provider: "image2", activeVisualRoleId: "C4" };
const emptySet = createTaskReferenceSet({ ...referenceSet, referenceSetId: "empty-evidence", assets: [] });
const emptyEvidence = bindTaskProductTruth(emptySet);
for (const [label, binding] of [["complete", { productTruth, referencePlan }], ["partial", missingHeel], ["empty", emptyEvidence]]) {
  const compiled = compilePrompt({ ...baseInput, selectedProductTruth: binding.productTruth, productTruthProvenance: { source: "current_task_uploaded_images", assetIds: binding.referencePlan.assetIds, referenceSetId: binding.productTruth.referenceSetId, taskProductTruthId: binding.productTruth.taskProductTruthId, version: binding.productTruth.version }, referencePlan: binding.referencePlan });
  for (const internal of [binding.productTruth.referenceSetId, binding.productTruth.taskProductTruthId, "full-side", "confidence", "readiness", "diagnostics", "MISSING_"]) assert(!compiled.prompt.toLowerCase().includes(internal.toLowerCase()), `${label} C4 provider prompt leaked ${internal}`);
  for (const invented of ["leather", "suede", "mesh", "canvas", "knit", "nubuck"]) assert(!compiled.prompt.toLowerCase().includes(invented), `${label} C4 provider prompt invented ${invented}`);
  if (label !== "empty") assert(compiled.prompt.includes("Preserve the exact material zones, surface finish, texture transitions, stitching relationships, and construction details shown in the confirmed material references."), `${label} C4 provider prompt lacks neutral material preservation language`);
  assert(compiled.metadata.structuredFactsExtracted === false && compiled.metadata.providerExecutionReady === false && compiled.metadata.productionReady === false, `${label} C4 metadata overstated execution readiness`);
}

const seriesResults = [0, 1, 2].map((seriesImageIndex) => compilePrompt({ ...baseInput, imageType: "生活场景图", compositionMode: "fullFigure", activeVisualRoleId: ["B3", "B4", "C1"][seriesImageIndex], isMultiImage: true, seriesImageCount: 3, seriesImageIndex, selectedProductTruth: productTruth, productTruthProvenance: { source: "current_task_uploaded_images", assetIds: referencePlan.assetIds, referenceSetId: referenceSet.referenceSetId, taskProductTruthId: productTruth.taskProductTruthId, version: productTruth.version }, referencePlan }));
for (const result of seriesResults) {
  assert(result.metadata.referenceSetId === referenceSet.referenceSetId, "series card replaced the base reference set");
  assert(result.metadata.referenceEvidenceBound === true, "series card lost reference evidence binding");
  assert(result.metadata.referencePlan.order.join(",") === referencePlan.order.join(","), "series card replaced the base reference plan");
}

const nonC4 = compilePrompt({ ...baseInput, imageType: "产品上脚图", compositionMode: "fullFigure", activeVisualRoleId: "A1", selectedOutfitLine: "Use a canvas tote as a secondary accessory and a knit garment layer.", selectedProductTruth: productTruth, referencePlan });
assert(!nonC4.prompt.includes("skin, hair, knitwear, leather, suede"), "generic material response still enumerates unconfirmed product materials");
assert(nonC4.prompt.includes("confirmed product surfaces"), "generic material response lost neutral confirmed-product language");
assert(nonC4.prompt.includes("canvas tote") && nonC4.prompt.includes("knit garment"), "explicit non-product material information was incorrectly removed");
assert(!productTruthPromptLines(productTruth).join(" ").match(/leather|suede|mesh|canvas|knit|nubuck/i), "reference-bound product protection contains an unconfirmed material name");

console.log("Reference binding validation passed: fingerprints and copy safety, live plan display semantics, stable upload order, series evidence continuity, complete/partial/empty C4 safety, neutral material response, and fail-closed readiness.");
await rm(temp, { recursive: true, force: true });
