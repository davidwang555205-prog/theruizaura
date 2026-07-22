import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const files = {
  shoeImagePrompt: "theruiz-aura-shoe-imagePrompt.v1.json",
  shoeSeeding: "theruiz-aura-shoe-seeding.v1.json",
  garmentImagePrompt: "theruiz-aura-garment-imagePrompt.v1.json",
  garmentSeeding: "theruiz-aura-garment-seeding.v1.json"
};

const completeLookCategories = new Set(["dress", "suit", "set", "bridal", "eveningGown"]);
const singleItemCategories = new Set(["top", "shirt", "knitwear", "tshirt", "trousers", "skirt", "coat", "jacket"]);
const completeRoleMarkers = new Set(["onePiece", "coordinatedSet"]);
const singleItemReferenceRoles = {
  top: new Set(["primaryTop", "innerLayer"]),
  shirt: new Set(["primaryTop", "innerLayer"]),
  knitwear: new Set(["primaryTop", "innerLayer"]),
  tshirt: new Set(["primaryTop", "innerLayer"]),
  trousers: new Set(["bottom"]),
  skirt: new Set(["bottom"]),
  coat: new Set(["outerLayer"]),
  jacket: new Set(["outerLayer"])
};

function normalizeReferenceRoles(referenceGarmentRoles = []) {
  return [...new Set(referenceGarmentRoles.filter((role) => typeof role === "string" && role.trim()).map((role) => role.trim()))].sort();
}

function stableIndex(value, length) {
  if (!Number.isInteger(length) || length < 1) throw new Error("Supporting styling pool must not be empty");
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % length;
}

export function resolveGarmentReferenceScope({ category, referenceGarmentRoles = [] }) {
  const roles = normalizeReferenceRoles(referenceGarmentRoles);
  if (completeLookCategories.has(category) || roles.some((role) => completeRoleMarkers.has(role)) || roles.length >= 2) return "completeLook";
  if (singleItemCategories.has(category) && roles.length === 1 && singleItemReferenceRoles[category]?.has(roles[0])) return "singleItem";
  return "uncertain";
}

export function selectGarmentSupportingStyle(garmentSeeding, { category, referenceGarmentRoles = [], seed }) {
  const referenceScope = resolveGarmentReferenceScope({ category, referenceGarmentRoles });
  if (referenceScope !== "singleItem") return { referenceScope, supportingStyle: null, seriesLockKey: null };
  if (seed === undefined || seed === null || seed === "") throw new Error("A deterministic seed is required for single-item supporting styling");
  const poolName = garmentSeeding.supportingStyling?.categoryPools?.[category];
  const pool = poolName ? garmentSeeding.supportingStyling?.pools?.[poolName] : undefined;
  if (!Array.isArray(pool) || !pool.length) throw new Error(`Supporting styling pool missing for garment category: ${category}`);
  const roles = normalizeReferenceRoles(referenceGarmentRoles);
  const seriesLockKey = `${category}|${roles.join(",")}|${String(seed)}`;
  const supportingStyle = pool[stableIndex(seriesLockKey, pool.length)];
  return { referenceScope, supportingStyle, seriesLockKey };
}

export function buildGarmentStylingLines(configs, input) {
  if (input.legacyOutfitLine || input.externalStylingLine) throw new Error("Legacy or external garment Styling concatenation is forbidden");
  const result = selectGarmentSupportingStyle(configs.garmentSeeding, input);
  const template = configs.garmentImagePrompt.referenceStylingPolicy?.stylingOutputTemplates?.[result.referenceScope];
  if (!template) throw new Error(`Garment Styling template missing for reference scope: ${result.referenceScope}`);
  if (result.referenceScope !== "singleItem") return { ...result, stylingLines: [template] };
  return {
    ...result,
    stylingLines: [
      template,
      result.supportingStyle.line,
      `Series styling lock: keep supporting style ${result.supportingStyle.id} unchanged for every image in this set.`
    ]
  };
}

async function load(name) {
  const value = JSON.parse(await readFile(resolve(root, files[name]), "utf8"));
  if (!value.schemaVersion || !value.mode || !value.role) throw new Error(`Invalid category config: ${name}`);
  return value;
}

export async function loadCategoryConfigs() {
  return Object.fromEntries(await Promise.all(Object.keys(files).map(async (name) => [name, await load(name)])));
}

export function selectCategoryConfig(configs, { category, role }) {
  const key = `${category}${role === "imagePrompt" ? "ImagePrompt" : "Seeding"}`;
  const config = configs[key];
  if (!config) throw new Error(`Unsupported category/role: ${category}/${role}`);
  return config;
}

export function assertCategoryIsolation(configs) {
  if (!configs.shoeImagePrompt.boundary.targetOnly || !configs.garmentImagePrompt.boundary.targetOnly) throw new Error("ImagePrompt boundary missing");
  if (!configs.shoeSeeding.boundary.forbiddenGarmentOwnership?.length) throw new Error("Shoe seeding boundary missing");
  if (!configs.garmentSeeding.boundary.forbiddenShoeOwnership?.length) throw new Error("Garment seeding boundary missing");
  if (Object.keys(configs.garmentSeeding.outfitSeeds ?? {}).length) throw new Error("Garment seeding must not contain automatic outfit seeds");
  if (configs.garmentSeeding.lifestyleScenes?.some((scene) => scene.garmentTypePreference)) throw new Error("Garment scenes must not force a garment type preference");
  const garmentSeedingText = JSON.stringify({
    outfitSeeds: configs.garmentSeeding.outfitSeeds,
    activePromptTemplates: configs.garmentSeeding.activePromptTemplates
  });
  if (/sneaker|shoe readability|toe box|outsole|laces|heel geometry/i.test(garmentSeedingText)) throw new Error("Garment seeding contains shoe-owned styling language");
  const stylingBoundary = configs.garmentImagePrompt.promptRules?.stylingBoundary?.join(" ") ?? "";
  if (!/reference garment priority/i.test(stylingBoundary) || !/reference-scope policy/i.test(stylingBoundary)) throw new Error("Garment reference-priority styling boundary missing");
  const referencePolicy = configs.garmentImagePrompt.referenceStylingPolicy;
  if (!referencePolicy || !referencePolicy.referenceRoles?.length || !referencePolicy.singleItemCategories?.length || !referencePolicy.singleItemReferenceRoles || !referencePolicy.stylingOutputTemplates) throw new Error("Garment reference-scope policy missing");
  const stylingAssembly = configs.garmentSeeding.stylingAssembly;
  if (stylingAssembly?.sourcePolicy !== "referenceScopeOnly" || !stylingAssembly.ignoreLegacyOutfitLine || !stylingAssembly.rejectExternalStylingConcatenation) throw new Error("Garment Styling must use the exclusive reference-scope assembly path");
  const supportingStyling = configs.garmentSeeding.supportingStyling;
  if (!supportingStyling?.seriesLock || !supportingStyling?.deterministicSeedRequired) throw new Error("Garment supporting styling must be deterministic and series-locked");
  for (const category of referencePolicy.singleItemCategories) {
    const poolName = supportingStyling.categoryPools?.[category];
    if (!poolName || !supportingStyling.pools?.[poolName]?.length) throw new Error(`Garment supporting styling pool missing: ${category}`);
  }
  for (const category of referencePolicy.completeLookCategories) {
    if (supportingStyling.categoryPools?.[category]) throw new Error(`Complete-look category must not have a supporting styling pool: ${category}`);
  }
  const completeLookProbe = selectGarmentSupportingStyle(configs.garmentSeeding, {
    category: "top",
    referenceGarmentRoles: ["primaryTop", "innerLayer", "bottom"],
    seed: "contract-probe"
  });
  if (completeLookProbe.referenceScope !== "completeLook" || completeLookProbe.supportingStyle !== null) throw new Error("Complete reference look must suppress supporting styling");
  const firstSingleItemProbe = selectGarmentSupportingStyle(configs.garmentSeeding, {
    category: "top",
    referenceGarmentRoles: ["primaryTop"],
    seed: "contract-probe"
  });
  const secondSingleItemProbe = selectGarmentSupportingStyle(configs.garmentSeeding, {
    category: "top",
    referenceGarmentRoles: ["primaryTop"],
    seed: "contract-probe"
  });
  if (!firstSingleItemProbe.supportingStyle || firstSingleItemProbe.supportingStyle.id !== secondSingleItemProbe.supportingStyle?.id) throw new Error("Single-item supporting styling must reproduce for the same seed");
  const compiledCompleteLook = buildGarmentStylingLines(configs, {
    category: "top",
    referenceGarmentRoles: ["primaryTop", "innerLayer", "bottom"],
    seed: "contract-probe"
  });
  if (compiledCompleteLook.stylingLines.length !== 1 || /white cotton shirt|cream straight trousers|sneaker readability/i.test(compiledCompleteLook.stylingLines.join(" "))) throw new Error("Complete-look Styling contains a conflicting garment instruction");
  let rejectedLegacyStyling = false;
  try {
    buildGarmentStylingLines(configs, {
      category: "top",
      referenceGarmentRoles: ["primaryTop"],
      seed: "contract-probe",
      legacyOutfitLine: "Style her in a white cotton shirt and cream straight trousers with clear sneaker readability."
    });
  } catch {
    rejectedLegacyStyling = true;
  }
  if (!rejectedLegacyStyling) throw new Error("Legacy garment outfit line was not rejected");
  return true;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const configs = await loadCategoryConfigs();
  assertCategoryIsolation(configs);
  console.log("Category config contract PASS", Object.keys(configs).join(", "));
}
