import { readFileSync } from "node:fs";

const app = readFileSync("src/App.tsx", "utf8");
const html = readFileSync("index.html", "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const shoeTypes = readFileSync("src/modules/product/shoe/shoeProductTypes.ts", "utf8");
const shoeRegistry = readFileSync("src/modules/product/shoe/shoeCategoryRegistry.ts", "utf8");
const shoeAdapter = readFileSync("src/modules/product/shoe/shoeProductAdapter.ts", "utf8");
const pumpAdapter = readFileSync("src/modules/product/shoe/pumpAdapter.ts", "utf8");
const bootAdapter = readFileSync("src/modules/product/shoe/bootAdapter.ts", "utf8");
const loaferAdapter = readFileSync("src/modules/product/shoe/loaferAdapter.ts", "utf8");
const balletFlatAdapter = readFileSync("src/modules/product/shoe/balletFlatAdapter.ts", "utf8");
const sandalAdapter = readFileSync("src/modules/product/shoe/sandalAdapter.ts", "utf8");
const muleAdapter = readFileSync("src/modules/product/shoe/muleAdapter.ts", "utf8");
const softSeeding = readFileSync("src/utils/generateSoftSeedingContent.ts", "utf8");
const acceptanceMatrix = readFileSync("src/data/phase8AcceptanceMatrix.ts", "utf8");
const singlePromptRoute = readFileSync("src/utils/generateCurrentSinglePrompt.ts", "utf8");
const referenceValidation = readFileSync("src/modules/product/shoe/shoeReferenceValidation.ts", "utf8");
const required = [
  ["1. App identity", app.includes("APP_NAME") && html.includes("Black Mirror")],
  ["Garment adapter", app.includes("productMode")],
  ["Garment shot plans", readFileSync("src/modules/product/garment/garmentShotPlans.ts", "utf8").includes("getGarmentShotPlan")],
  ["Garment accuracy guards", readFileSync("src/modules/product/garment/garmentAccuracyGuards.ts", "utf8").includes("getGarmentVisibilityGuard")],
  ["Shoe category model", shoeTypes.includes('"germanTrainer"') && shoeTypes.includes('"pump"') && shoeTypes.includes('"boot"')],
  ["German trainer adapter", shoeRegistry.includes("germanTrainer: germanTrainerAdapter") && shoeAdapter.includes("getShoeCategoryAdapter")],
  ["Pump adapter active", shoeRegistry.includes("pump: pumpAdapter") && pumpAdapter.includes('status: "active"')],
  ["Pump-specific geometry guards", pumpAdapter.includes("heel height") && pumpAdapter.includes("topline") && pumpAdapter.includes("arch curve")],
  ["Pump shot plans and content", softSeeding.includes("pumpStudioShotDrafts") && softSeeding.includes("pumpLifestyleThreeImageShotPlans")],
  ["Pump planned-category isolation", pumpAdapter.includes("closed-toe pump") && !pumpAdapter.includes("germanTrainerAdapter")],
  ["Boot adapter active", shoeRegistry.includes("boot: bootAdapter") && bootAdapter.includes('status: "active"')],
  ["Boot shaft and leg guards", bootAdapter.includes("shaft height") && bootAdapter.includes("calf fit") && bootAdapter.includes("leg or boot intersection")],
  ["Boot shot plans and content", softSeeding.includes("bootStudioShotDrafts") && softSeeding.includes("bootLifestyleThreeImageShotPlans")],
  ["Boot planned-category isolation", bootAdapter.includes("subtype") && !bootAdapter.includes("pumpAdapter")],
  ["Loafer adapter active", shoeRegistry.includes("loafer: loaferAdapter") && loaferAdapter.includes('status: "active"')],
  ["Loafer native guards", loaferAdapter.includes("apron") && loaferAdapter.includes("ornament") && loaferAdapter.includes("welt")],
  ["Ballet-flat adapter active", shoeRegistry.includes("balletFlat: balletFlatAdapter") && balletFlatAdapter.includes('status: "active"')],
  ["Ballet-flat native guards", balletFlatAdapter.includes("shallow vamp") && balletFlatAdapter.includes("binding") && balletFlatAdapter.includes("heel lift")],
  ["Flat adapter plans and isolation", softSeeding.includes("getFlatStudioDrafts") && !loaferAdapter.includes("balletFlatAdapter") && !balletFlatAdapter.includes("loaferAdapter")],
  ["Sandal adapter active", shoeRegistry.includes("sandal: sandalAdapter") && sandalAdapter.includes('status: "active"')],
  ["Sandal strap and toe guards", sandalAdapter.includes("toe opening") && sandalAdapter.includes("strap") && sandalAdapter.includes("footbed")],
  ["Mule adapter active", shoeRegistry.includes("mule: muleAdapter") && muleAdapter.includes('status: "active"')],
  ["Mule backless guards", muleAdapter.includes("backless edge") && muleAdapter.includes("insertion depth") && muleAdapter.includes("heel exposure")],
  ["Open-shoe plans and isolation", softSeeding.includes("getOpenShoeStudioDrafts") && !sandalAdapter.includes("muleAdapter") && !muleAdapter.includes("sandalAdapter")],
  ["2. Product mode isolation", app.includes('option value="shoe"') && app.includes('option value="garment"')],
  ["3. Planned shoe categories are blocked", shoeRegistry.includes('status: "planned"') && shoeRegistry.includes("does not yet support")],
  ["4. Unified acceptance matrix", acceptanceMatrix.includes("phase8AcceptanceMatrix") && acceptanceMatrix.includes("garment-single") && acceptanceMatrix.includes("germanTrainer") && acceptanceMatrix.includes("mule")],
  ["5. Reference role routing", shoeTypes.includes('"fullSide"') && app.includes("完整侧面")],
  ["6. Stale output handling", app.includes("setSinglePromptResult(null)") && app.includes("setHasPendingChanges(true)" )],
  ["7. Result and copy flow", app.includes("formatSoftSeedingImagePrompts") && app.includes("handleCopy")],
  ["7a. Current single prompt adapter route", singlePromptRoute.includes("buildCurrentSinglePrompt") && singlePromptRoute.includes("getShoeCategoryAdapter") && app.includes("buildCurrentSinglePrompt(nextParams)")],
  ["7b. Single prompt metadata", singlePromptRoute.includes("category?: ShoeCategory") && singlePromptRoute.includes("productKey: string") && app.includes("inputRevision: number")],
  ["7c. All active shoe categories share single route", ["germanTrainer", "pump", "boot", "loafer", "balletFlat", "sandal", "mule"].every((category) => shoeRegistry.includes(`${category}:`) && singlePromptRoute.includes("getShoeCategoryAdapter"))],
  ["7d. Visible single-generation blocker", app.includes("setImageGenerationStatus") && app.includes("builtPrompt = buildCurrentSinglePrompt(nextParams)") && app.includes("catch (error)" )],
  ["7e. Current category result metadata", app.includes("category: \"germanTrainer\"") && app.includes("inputRevision: nextParams.generationNonce")],
  ["7f. Canonical reference-role validation", referenceValidation.includes("normalizeShoeReferenceRole") && referenceValidation.includes("completeSide") && app.includes("validateShoeReferenceRoles")],
  ["7g. Visible reference-role summary", app.includes("已上传：") && app.includes("主参考图：") && app.includes("缺少角色：无")],
  ["7h. Content does not own single visibility", app.includes("syncPromptParams(false)") && app.includes("const syncPromptParams = (updateSinglePrompt = true)")],
  ["7i. Upper button owns authoritative single state", app.includes("onClick={handleGenerateCurrentSinglePrompt}") && app.includes("const isCurrentSinglePromptVisible") && app.includes("generatedAt: Date.now()")],
  ["7j. In-page single trace", app.includes("SinglePromptTrace") && app.includes("Single Prompt diagnostic trace") && app.includes("stateWritePromptLength")],
  ["8. Explicit blocked states", app.includes("规划中") && softSeeding.includes("不会回退")],
  ["9. Performance chunk strategy", readFileSync("vite.config.ts", "utf8").includes("manualChunks")],
  ["10. No persistent verification server", !readFileSync("scripts/verify-black-mirror-release.mjs", "utf8").includes("execSync(\"npm run dev\")")],
  ["Release script", packageJson.scripts["verify:release"] === "node scripts/verify-black-mirror-release.mjs"],
  ["No API integration", !app.includes("fetch(")]
];
const failures = required.filter(([, ok]) => !ok).map(([name]) => name);
if (failures.length) {
  console.error(`Release verification failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log(`Black Mirror release verification passed (${required.length} checks).`);
