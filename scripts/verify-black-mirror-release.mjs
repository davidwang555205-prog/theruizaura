import { readFileSync } from "node:fs";

const app = readFileSync("src/App.tsx", "utf8");
const html = readFileSync("index.html", "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const required = [
  ["Black Mirror UI name", app.includes("APP_NAME") && html.includes("Black Mirror")],
  ["Garment adapter", app.includes("productMode")],
  ["Garment shot plans", readFileSync("src/modules/product/garment/garmentShotPlans.ts", "utf8").includes("getGarmentShotPlan")],
  ["Garment accuracy guards", readFileSync("src/modules/product/garment/garmentAccuracyGuards.ts", "utf8").includes("getGarmentVisibilityGuard")],
  ["Release script", packageJson.scripts["verify:release"] === "node scripts/verify-black-mirror-release.mjs"],
  ["No API integration", !app.includes("fetch(")]
];
const failures = required.filter(([, ok]) => !ok).map(([name]) => name);
if (failures.length) {
  console.error(`Release verification failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log(`Black Mirror release verification passed (${required.length} checks).`);
