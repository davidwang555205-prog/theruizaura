import { sceneOutfitSeedLibrary, type SceneOutfitSeed } from "../data/sceneOutfitSeedLibrary";

const sensitiveWords = ["sexy", "seductive", "bodycon", "hot pants", "sports bra", "beauty selfie", "revealing"];
const handheldPairs = [
  ["coffee", "flowers"],
  ["coffee", "book"],
  ["phone", "coffee"],
  ["tote", "water bottle"]
];
const shoeBlockingWords = ["floor-length skirt", "floor-length dress", "maxi skirt", "long coat covering shoes", "covering shoes"];

function countBy<T extends string>(items: SceneOutfitSeed[], getter: (item: SceneOutfitSeed) => T | undefined) {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const key = getter(item);
    if (!key) return;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return counts;
}

function overLimit(counts: Map<string, number>, limit: number, label: string) {
  return Array.from(counts.entries())
    .filter(([, count]) => count > limit)
    .map(([key, count]) => `${label} "${key}" appears ${count} times`);
}

function hasMultipleHandheld(text: string) {
  const lower = text.toLowerCase();
  return handheldPairs.some(([a, b]) => lower.includes(a) && lower.includes(b));
}

export function validateSceneOutfitSeedLibrary() {
  const issues: string[] = [];

  Object.entries(sceneOutfitSeedLibrary).forEach(([sceneKey, seeds]) => {
    if (seeds.length !== 12) issues.push(`${sceneKey}: expected 12 outfits, got ${seeds.length}`);

    issues.push(...overLimit(countBy(seeds, (item) => item.topCategory), 3, `${sceneKey} topCategory`));
    issues.push(...overLimit(countBy(seeds, (item) => item.bottomCategory), 3, `${sceneKey} bottomCategory`));
    issues.push(...overLimit(countBy(seeds, (item) => item.colorDirection), 4, `${sceneKey} colorDirection`));
    issues.push(...overLimit(countBy(seeds, (item) => item.outfitStyle), 4, `${sceneKey} outfitStyle`));
    issues.push(...overLimit(countBy(seeds, (item) => item.visualAnchor), 2, `${sceneKey} visualAnchor`));

    const darkCount = seeds.filter((item) => item.colorDirection === "darkAnchor").length;
    const denimNeutralCount = seeds.filter((item) => item.colorDirection === "denimBased" || item.colorDirection === "neutralDaily").length;
    const softAccentCount = seeds.filter((item) => item.colorDirection === "softAccent").length;
    const nonLightCount = seeds.filter((item) => item.colorDirection !== "lightClean").length;
    const garmentTypes = new Set(seeds.map((item) => item.garmentType));

    if (darkCount < 3) issues.push(`${sceneKey}: expected at least 3 darkAnchor outfits`);
    if (denimNeutralCount < 3) issues.push(`${sceneKey}: expected at least 3 denimBased or neutralDaily outfits`);
    if (softAccentCount < 2) issues.push(`${sceneKey}: expected at least 2 softAccent outfits`);
    if (nonLightCount < 4) issues.push(`${sceneKey}: expected at least 4 outfits not led by white / beige / cream`);
    if (garmentTypes.size < 3) issues.push(`${sceneKey}: expected at least 3 garment types`);

    seeds.forEach((item) => {
      const text = `${item.outfitLine} ${item.stylingRealismLine}`.toLowerCase();
      const foundSensitive = sensitiveWords.filter((word) => text.includes(word));
      if (foundSensitive.length) issues.push(`${item.id}: contains sensitive wording ${foundSensitive.join(", ")}`);
      if (hasMultipleHandheld(text)) issues.push(`${item.id}: contains multiple main handheld objects`);
      if (shoeBlockingWords.some((word) => text.includes(word))) issues.push(`${item.id}: contains shoe-blocking garment wording`);
      if (item.outfitLine.length > 360) issues.push(`${item.id}: outfitLine exceeds suggested budget`);
      if (item.stylingRealismLine.length > 260) issues.push(`${item.id}: stylingRealismLine exceeds suggested budget`);
    });
  });

  if (issues.length) console.warn("Scene outfit seed library quality warnings:", issues);

  return {
    ok: issues.length === 0,
    issues
  };
}
