import { fallbackSafeOutfitTemplates } from "../data/fallbackSafeOutfitTemplates";
import { sceneOutfitSeedLibrary, type GarmentType, type SceneOutfitSeed } from "../data/sceneOutfitSeedLibrary";

const darkAnchorPattern = /black|charcoal|navy|dark coffee|deep olive/i;
const lightTopPattern = /^(white|cream|beige|ivory|off-white|soft beige|warm beige)/i;
const denimPattern = /denim|jeans/i;

function countBy(items: SceneOutfitSeed[], getter: (item: SceneOutfitSeed) => string | undefined) {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const key = getter(item);
    if (!key) return;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return counts;
}

function countOuterLayerCategory(seeds: SceneOutfitSeed[]) {
  return countBy(seeds, (seed) => {
    if (!seed.outerLayerCategory || seed.outerLayerCategory === "no outer layer") return undefined;
    return seed.outerLayerCategory;
  });
}

function overLimit(counts: Map<string, number>, limit: number, label: string) {
  return Array.from(counts.entries())
    .filter(([, count]) => count > limit)
    .map(([key, count]) => `${label} "${key}" appears ${count} times`);
}

function outfitText(seed: SceneOutfitSeed) {
  return [
    seed.outfitLine,
    seed.stylingRealismLine,
    seed.topCategory,
    seed.bottomCategory,
    seed.outerLayerCategory,
    seed.bagCategory,
    seed.visualAnchor,
    ...(seed.accessoryCategory ?? [])
  ]
    .filter(Boolean)
    .join(" ");
}

function hasDenim(seed: SceneOutfitSeed) {
  return seed.colorDirection === "denimBased" || denimPattern.test(outfitText(seed));
}

function isDarkAnchor(seed: SceneOutfitSeed) {
  return seed.colorDirection === "darkAnchor" || darkAnchorPattern.test(outfitText(seed));
}

function getTemplateSignature(seed: SceneOutfitSeed) {
  const normalizedTop = seed.topCategory
    .replace(/\b(cotton|linen|fine-knit|lightweight|clean-cut|short-sleeve|open|worn)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const normalizedBottom = seed.bottomCategory
    .replace(/\b(straight|tailored|wide-leg|relaxed|ankle|midi|Bermuda|cotton|wool|lightweight)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return `${normalizedTop} + ${normalizedBottom}`.toLowerCase();
}

function countGarmentTypes(seeds: SceneOutfitSeed[]) {
  return new Set(seeds.map((seed) => seed.garmentType));
}

function validateScene(sceneKey: string, seeds: SceneOutfitSeed[]) {
  const issues: string[] = [];
  const bagCount = seeds.filter((seed) => seed.bagCategory).length;
  const garmentTypes = countGarmentTypes(seeds);
  const trouserSeeds = seeds.filter((seed) => seed.garmentType === "trousers");
  const shortsSeeds = seeds.filter((seed) => seed.garmentType === "shorts");
  const denimTrouserCount = trouserSeeds.filter(hasDenim).length;

  issues.push(...overLimit(countBy(seeds, (seed) => seed.topCategory), 3, `${sceneKey} topCategory`));
  issues.push(...overLimit(countBy(seeds, (seed) => seed.bottomCategory), 2, `${sceneKey} bottomCategory`));
  issues.push(...overLimit(countOuterLayerCategory(seeds), 3, `${sceneKey} outerLayerCategory`));
  issues.push(...overLimit(countBy(seeds, (seed) => seed.bagCategory), 3, `${sceneKey} bagCategory`));
  issues.push(...overLimit(countBy(seeds, (seed) => seed.colorDirection), 5, `${sceneKey} colorDirection`));
  issues.push(...overLimit(countBy(seeds, (seed) => seed.visualAnchor), 2, `${sceneKey} visualAnchor`));
  issues.push(
    ...overLimit(
      countBy(
        seeds.flatMap((seed) => (seed.accessoryCategory ?? []).map((accessory) => ({ ...seed, accessory }))),
        (seed) => (seed as SceneOutfitSeed & { accessory: string }).accessory
      ),
      4,
      `${sceneKey} accessoryCategory`
    )
  );
  issues.push(...overLimit(countBy(seeds, getTemplateSignature), 2, `${sceneKey} near-template pattern`));

  if (seeds.length !== 12) issues.push(`${sceneKey}: expected 12 outfits, got ${seeds.length}`);
  if (garmentTypes.size < 3) issues.push(`${sceneKey}: expected at least 3 garment types`);
  if (seeds.filter(isDarkAnchor).length < 4) issues.push(`${sceneKey}: expected at least 4 clear dark-anchor outfits`);
  if (seeds.filter(hasDenim).length < 3) issues.push(`${sceneKey}: expected at least 3 denim-based outfits`);
  if (seeds.filter((seed) => !lightTopPattern.test(seed.topCategory)).length < 2) {
    issues.push(`${sceneKey}: expected at least 2 tops not led by white / cream / beige`);
  }
  if (bagCount > Math.floor(seeds.length * 0.7)) {
    issues.push(`${sceneKey}: bagged outfits exceed 70% (${bagCount}/${seeds.length})`);
  }
  if (trouserSeeds.length >= 4 && trouserSeeds.length - denimTrouserCount < Math.ceil(trouserSeeds.length / 2)) {
    issues.push(`${sceneKey}: expected non-denim trouser seeds to remain the majority`);
  }
  if (trouserSeeds.length > 0 && denimTrouserCount > Math.ceil(trouserSeeds.length / 2)) {
    issues.push(`${sceneKey}: denim trousers exceed 50% of trouser seeds`);
  }
  if (shortsSeeds.length >= 3 && new Set(shortsSeeds.map((seed) => seed.bottomCategory)).size < 3) {
    issues.push(`${sceneKey}: expected at least 3 distinct shorts bottomCategory values`);
  }

  return issues;
}

function validateFallbackCoverage() {
  const issues: string[] = [];
  const fallbackByGarment = fallbackSafeOutfitTemplates.reduce<Partial<Record<GarmentType, SceneOutfitSeed[]>>>(
    (acc, seed) => {
      acc[seed.garmentType] = [...(acc[seed.garmentType] ?? []), seed];
      return acc;
    },
    {}
  );

  (["trousers", "shorts", "skirt", "dress", "lightActive"] as GarmentType[]).forEach((garmentType) => {
    const seeds = fallbackByGarment[garmentType] ?? [];
    if (!seeds.length) issues.push(`fallback: missing ${garmentType} templates`);
  });

  const trousers = fallbackByGarment.trousers ?? [];
  const shorts = fallbackByGarment.shorts ?? [];
  if (trousers.filter((seed) => !hasDenim(seed)).length < 4) {
    issues.push("fallback: expected at least 4 non-denim trouser templates");
  }
  if (new Set(shorts.map((seed) => seed.bottomCategory)).size < 3) {
    issues.push("fallback: expected at least 3 distinct shorts templates");
  }
  issues.push(...overLimit(countBy(fallbackSafeOutfitTemplates, (seed) => seed.bottomCategory), 2, "fallback bottomCategory"));

  return issues;
}

export function validateOutfitCategoryDiversity() {
  const issues = [
    ...Object.entries(sceneOutfitSeedLibrary).flatMap(([sceneKey, seeds]) => validateScene(sceneKey, seeds)),
    ...validateFallbackCoverage()
  ];

  return {
    ok: issues.length === 0,
    issues
  };
}
