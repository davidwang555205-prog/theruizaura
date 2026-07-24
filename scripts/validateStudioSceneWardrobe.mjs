import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const tempDir = await mkdtemp(join(tmpdir(), "theruiz-studio-wardrobe-"));

// Rewriting the entry to use a single import path for generateTeamPrompt and inline the data modules
const entryPath = join(tempDir, "entry.ts");
const bundlePath = join(tempDir, "bundle.mjs");
await writeFile(
  entryPath,
  `export { generateTeamPrompt } from ${JSON.stringify(resolve(projectRoot, "src/utils/generatePrompt.ts"))};\n`
);

// Also bundle the data modules separately
const dataEntryPath = join(tempDir, "data-entry.ts");
const dataBundlePath = join(tempDir, "data-bundle.mjs");
await writeFile(
  dataEntryPath,
  [
    `export { STUDIO_LAUNCH_PRESETS, STUDIO_LAUNCH_PRESET_OPTIONS, resolveStudioLaunchPreset } from ${JSON.stringify(resolve(projectRoot, "src/data/studioLaunchPresets.ts"))};`,
    `export { STUDIO_WARDROBE_LIBRARY, STUDIO_WARDROBE_OPTIONS, resolveStudioWardrobeSelection, getCompatibleStudioWardrobeOptions, getStudioWardrobeContrastLine } from ${JSON.stringify(resolve(projectRoot, "src/data/studioWardrobeLibrary.ts"))};`
  ].join("\n")
);

await build({
  entryPoints: [entryPath],
  bundle: true,
  outfile: bundlePath,
  format: "esm",
  platform: "node",
  target: "node20",
  logLevel: "silent"
});

await build({
  entryPoints: [dataEntryPath],
  bundle: true,
  outfile: dataBundlePath,
  format: "esm",
  platform: "node",
  target: "node20",
  logLevel: "silent"
});

const { generateTeamPrompt } = await import(pathToFileURL(bundlePath));
const {
  STUDIO_LAUNCH_PRESETS,
  STUDIO_LAUNCH_PRESET_OPTIONS,
  resolveStudioLaunchPreset,
  STUDIO_WARDROBE_LIBRARY,
  STUDIO_WARDROBE_OPTIONS,
  resolveStudioWardrobeSelection,
  getCompatibleStudioWardrobeOptions,
  getStudioWardrobeContrastLine
} = await import(pathToFileURL(dataBundlePath));

let failures = 0;
let checks = 0;

function assert(condition, label) {
  checks++;
  if (!condition) { failures++; console.error(`FAIL: ${label}`); }
}

function assertContains(haystack, needle, label) {
  checks++;
  if (!haystack || !haystack.includes(needle)) {
    failures++; console.error(`FAIL: ${label}  expected: "${needle}"`);
  }
}

function assertNotContains(haystack, needle, label) {
  checks++;
  if (haystack && haystack.includes(needle)) {
    failures++; console.error(`FAIL: ${label}  unexpected: "${needle}"`);
  }
}

const PRESET_IDS = ["warmGreySeamless", "creamMinimal", "linenTexture", "monochromeArchitectural", "softWindowLight"];
const WARDROBE_IDS = Object.keys(STUDIO_WARDROBE_LIBRARY).filter(k => k !== "auto");
const PHASE1 = [
  "fineGaugeShortSleeveKnit", "knitPolo", "sleevelessMinimalTop", "relaxedIvoryShirt",
  "highWaistStraightTrousers", "wideStraightTailoredTrousers", "croppedCigaretteTrousers",
  "tailoredBermudaShorts", "aLineMidiSkirt",
  "structuredSingleBreastedBlazer", "minimalBoyfriendBlazer", "collarlessCroppedTexturedJacket"
];
const BRANDS = ["Chloe", "Hermes", "CHANEL", "CELINE"];

const baseParams = {
  imageType: "产品上脚图",
  modelChoice: "30–45岁客户画像模特",
  modelContinuity: "新人物",
  shoe: "Cloud Dancer 云舞者",
  customShoe: "",
  season: "秋",
  scenePreference: "棚内上新拍摄",
  garmentTypePreference: "自动匹配",
  studioLaunchAnglePreference: "自动匹配",
  studioLaunchPreset: "auto",
  studioWardrobePreference: "auto",
  stillLifeStyle: "与主视觉统一",
  extraRequirement: "",
  generationNonce: 0
};

// --- SCENE CHECKS ---
console.log("=== STUDIO SCENE CHECKS ===");

assert(PRESET_IDS.every(id => STUDIO_LAUNCH_PRESETS[id] !== null), "All 5 presets registered");
assert(STUDIO_LAUNCH_PRESET_OPTIONS.length === 6, "6 preset options");
assert(STUDIO_LAUNCH_PRESET_OPTIONS[0].value === "auto", "Auto first");

for (const id of PRESET_IDS) {
  const def = STUDIO_LAUNCH_PRESETS[id];
  assert(def.backgroundLine.length > 0, `${id}: bg non-empty`);
  assert(def.lightingLine.length > 0, `${id}: light non-empty`);
  assert(def.negativeLine.length > 0, `${id}: neg non-empty`);
}

const autoSeen = new Set();
for (let n = 0; n < 100; n++) autoSeen.add(resolveStudioLaunchPreset({ preset: "auto", nonce: n }).id);
PRESET_IDS.forEach(id => assert(autoSeen.has(id), `Auto: ${id}`));

PRESET_IDS.forEach(id => {
  assert(resolveStudioLaunchPreset({ preset: id, nonce: 0 }).id === id, `${id}: locked`);
});

// --- WARDROBE CHECKS ---
console.log("=== STUDIO WARDROBE CHECKS ===");

assert(WARDROBE_IDS.length === 20, `20 pieces, got ${WARDROBE_IDS.length}`);
for (const id of PHASE1) assert(STUDIO_WARDROBE_LIBRARY[id] !== null, `Phase1: ${id}`);

for (const id of ["highWaistStraightTrousers","wideStraightTailoredTrousers","croppedCigaretteTrousers","pleatedOatmealTrousers","subtleKickFlareTrousers"])
  assert(STUDIO_WARDROBE_LIBRARY[id].garmentType === "trousers", `${id} => trousers`);
assert(STUDIO_WARDROBE_LIBRARY["tailoredBermudaShorts"].garmentType === "shorts", "Bermuda => shorts");
for (const id of ["aLineMidiSkirt","straightMidiSkirt","biasSatinMidiSkirt","straightKnitSkirt"])
  assert(STUDIO_WARDROBE_LIBRARY[id].garmentType === "skirt", `${id} => skirt`);

assert(resolveStudioWardrobeSelection({ preference: "highWaistStraightTrousers", garmentTypePreference: "裤装", season: "秋", nonce: 0 }) !== null, "Explicit lock");

const summerOpts = getCompatibleStudioWardrobeOptions({ garmentTypePreference: "裤装", season: "夏" });
assert(summerOpts.length > 0, "Summer trousers");
assert(!summerOpts.includes("mockNeckFineKnit"), "No mock neck summer");

const winterOpts = getCompatibleStudioWardrobeOptions({ garmentTypePreference: "短裤", season: "冬" });
assert(winterOpts.length === 0, "No shorts winter");

const trouser = STUDIO_WARDROBE_LIBRARY["highWaistStraightTrousers"];
assertContains(trouser.shoeVisibilityLine, "visible", "Trousers: visible");

const skirt = STUDIO_WARDROBE_LIBRARY["aLineMidiSkirt"];
assertNotContains(skirt.forbiddenLine, "floor-length", "Skirt: no floor-length");

const bermuda = STUDIO_WARDROBE_LIBRARY["tailoredBermudaShorts"];
assertNotContains(bermuda.forbiddenLine, "hot pant", "Bermuda: no hot");

for (const id of WARDROBE_IDS) {
  const def = STUDIO_WARDROBE_LIBRARY[id];
  const text = [def.silhouetteLine, def.materialLine, def.forbiddenLine, def.hemConstraintLine].join(" ");
  for (const b of BRANDS) assertNotContains(text, b, `Ward ${id}: no ${b}`);
}

// --- PROMPT CHECKS ---
console.log("=== PROMPT CHECKS ===");

for (const id of PRESET_IDS) {
  const p = generateTeamPrompt({ ...baseParams, studioLaunchPreset: id, generationNonce: id.length });
  assert(p.prompt.length > 0, `${id}: prompt`);
  assertContains(p.prompt.toLowerCase(), "sneaker", `${id}: shoe`);
}

for (const id of PRESET_IDS) {
  const p = generateTeamPrompt({ ...baseParams, studioLaunchPreset: id, studioWardrobePreference: "highWaistStraightTrousers", generationNonce: 99 });
  for (const b of BRANDS) assertNotContains(p.prompt, b, `${id}: no ${b}`);
}

const imgTypes = ["产品上脚图","对镜穿搭图","生活场景图","非产品氛围图","拍摄花絮 / 材质图","产品静物图"];
for (const it of imgTypes) {
  const p = generateTeamPrompt({ ...baseParams, imageType: it, studioLaunchPreset: "creamMinimal", generationNonce: 33 });
  assert(p.prompt.length > 0, `Type ${it.substring(0,4)}: prompt`);
}

const nonStudio = ["通勤上班","咖啡馆内","酒店咖啡厅内","居家衣帽间"];
for (const scene of nonStudio) {
  const p = generateTeamPrompt({ ...baseParams, scenePreference: scene, studioLaunchPreset: "auto", generationNonce: 7 });
  assertNotContains(p.prompt.toLowerCase(), "warm grey seamless", `${scene}: no studio`);
}

console.log(`\n${checks} checks, ${failures} failures`);
await rm(tempDir, { recursive: true, force: true });
process.exit(failures > 0 ? 1 : 0);
