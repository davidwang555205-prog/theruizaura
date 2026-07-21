import { sceneOutfitSeedLibrary, type GarmentType, type SceneOutfitSeed } from "./sceneOutfitSeedLibrary";

export type CombinatorialSeason = "spring" | "summer" | "autumn" | "winter";

type CapsuleSupplement = {
  tops: string[];
  bottoms: string[];
  layers: string[];
};

const capsuleSupplements: Record<CombinatorialSeason, CapsuleSupplement> = {
  spring: {
    tops: [
      "mist blue silk-cotton shirt",
      "muted sage fine-knit polo",
      "warm white pintuck cotton blouse",
      "dusty rose compact-knit cardigan top",
      "stone grey mercerized-cotton tee",
      "soft butter-cream poplin shirt"
    ],
    bottoms: [
      "mist grey pleated straight trousers",
      "muted sage cotton-twill trousers",
      "pale blue-grey ankle denim",
      "warm ivory softly structured midi skirt",
      "stone beige column skirt",
      "light camel cropped chino trousers"
    ],
    layers: [
      "mist blue lightweight cotton jacket",
      "muted sage short trench jacket"
    ]
  },
  summer: {
    tops: [],
    bottoms: [],
    layers: [
      "pale blue featherweight cotton overshirt",
      "soft olive linen-blend shirt jacket"
    ]
  },
  autumn: {
    tops: [
      "muted sage merino polo knit",
      "berry-wine fine-gauge cardigan top",
      "dusty blue brushed-cotton shirt",
      "warm stone mock-neck knit",
      "deep teal compact-knit top",
      "soft camel silk-cotton blouse"
    ],
    bottoms: [
      "muted olive straight corduroy trousers",
      "dusty blue wool-blend trousers",
      "berry-brown structured midi skirt",
      "warm stone brushed-cotton trousers"
    ],
    layers: ["deep taupe cropped wool-blend jacket"]
  },
  winter: {
    tops: [
      "warm white fine-cashmere crewneck",
      "charcoal merino mock-neck knit",
      "restrained navy cashmere polo",
      "muted olive dense-knit cardigan top",
      "soft camel wool-silk shirt",
      "berry-wine fine-merino cardigan",
      "deep taupe ribbed turtleneck",
      "winter blue brushed-cotton shirt",
      "chocolate brown cashmere crewneck",
      "stone grey double-knit top",
      "cream bouclé-knit cardigan top",
      "dark denim-blue fine wool knit",
      "muted plum compact-knit polo",
      "warm sand cashmere-blend vest over an ivory base",
      "black fine-merino cardigan over a winter-white base",
      "soft moss green wool-blend sweater"
    ],
    bottoms: [
      "charcoal winter-wool straight trousers",
      "restrained navy brushed-wool trousers",
      "muted olive corduroy straight trousers",
      "chocolate brown wool-blend trousers",
      "winter blue structured straight denim",
      "warm stone flannel trousers",
      "deep taupe pleated wool trousers",
      "soft camel winter-cotton trousers",
      "berry-brown compact-knit midi skirt",
      "charcoal A-line wool skirt",
      "winter-white structured denim",
      "grey-blue wool-blend column skirt",
      "muted plum-brown straight skirt"
    ],
    layers: [
      "restrained navy short wool coat",
      "muted olive clean padded jacket",
      "chocolate brown cropped wool jacket",
      "winter blue-grey double-face coat",
      "deep taupe belted short coat",
      "berry-brown structured cardigan jacket"
    ]
  }
};

const sourceSeeds = Object.values(sceneOutfitSeedLibrary).flat();
const combinableGarments = new Set<GarmentType>(["trousers", "skirt", "shorts"]);

function unique(items: Array<string | undefined>) {
  return [
    ...new Set(items.filter((item): item is string => typeof item === "string" && !/^no outer layer$/i.test(item)))
  ];
}

function buildSeasonPool(season: CombinatorialSeason) {
  const seeds = sourceSeeds.filter(
    (seed) => seed.season.includes(season) && combinableGarments.has(seed.garmentType)
  );
  const supplement = capsuleSupplements[season];
  return {
    tops: unique([...seeds.map((seed) => seed.topCategory), ...supplement.tops]),
    bottoms: unique([...seeds.map((seed) => seed.bottomCategory), ...supplement.bottoms]),
    layers: unique([...seeds.map((seed) => seed.outerLayerCategory), ...supplement.layers])
  };
}

export const combinatorialOutfitPools = {
  spring: buildSeasonPool("spring"),
  summer: buildSeasonPool("summer"),
  autumn: buildSeasonPool("autumn"),
  winter: buildSeasonPool("winter")
};

function inferGarmentType(bottom: string): GarmentType {
  if (/\b(skirt)\b/i.test(bottom)) return "skirt";
  if (/\b(shorts|bermuda)\b/i.test(bottom)) return "shorts";
  return "trousers";
}

function inferColorDirection(text: string): SceneOutfitSeed["colorDirection"] {
  if (/\b(charcoal|black|navy|chocolate|deep)\b/i.test(text)) return "darkAnchor";
  if (/\b(denim|blue)\b/i.test(text)) return "denimBased";
  if (/\b(sage|olive|rose|berry|plum|moss|teal)\b/i.test(text)) return "softAccent";
  if (/\b(white|ivory|cream|pale|light)\b/i.test(text)) return "lightClean";
  return "neutralDaily";
}

export function getCombinatorialOutfitCapacity(season: CombinatorialSeason) {
  const pool = combinatorialOutfitPools[season];
  return pool.tops.length * pool.bottoms.length * (pool.layers.length + 1);
}

function greatestCommonDivisor(first: number, second: number): number {
  let a = Math.abs(first);
  let b = Math.abs(second);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

function getCombinationStride(capacity: number, layerRadix: number) {
  let stride = Math.max(1, Math.floor(capacity * 0.38196601125));
  while (greatestCommonDivisor(stride, capacity) !== 1 || stride % layerRadix === 0) {
    stride += 1;
  }
  return stride;
}

export function buildCombinatorialOutfit(input: {
  season: CombinatorialSeason;
  generationNonce: number;
  sceneKey: string;
}): SceneOutfitSeed {
  const pool = combinatorialOutfitPools[input.season];
  const capacity = getCombinatorialOutfitCapacity(input.season);
  const layerRadix = pool.layers.length + 1;
  const safeNonce = Number.isFinite(input.generationNonce) ? Math.trunc(input.generationNonce) : 0;
  const normalizedNonce = ((safeNonce % capacity) + capacity) % capacity;
  const combinationIndex = (normalizedNonce * getCombinationStride(capacity, layerRadix)) % capacity;
  const layerIndex = combinationIndex % layerRadix;
  const bottomIndex = Math.floor(combinationIndex / layerRadix) % pool.bottoms.length;
  const topIndex = Math.floor(combinationIndex / layerRadix / pool.bottoms.length) % pool.tops.length;
  const top = pool.tops[topIndex];
  const bottom = pool.bottoms[bottomIndex];
  const layer = layerIndex === 0 ? undefined : pool.layers[layerIndex - 1];
  const garmentType = inferGarmentType(bottom);
  const signature = `combo-${input.season}-t${topIndex}-b${bottomIndex}-l${layerIndex}`;
  const completeOutfit = [top, bottom, layer].filter(Boolean).join(", ");

  return {
    id: signature,
    sceneKey: input.sceneKey,
    garmentType,
    outfitStyle: garmentType === "skirt" ? "refinedFeminine" : "realDaily",
    colorDirection: inferColorDirection(completeOutfit),
    season: [input.season],
    suitableShoes: ["ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    topCategory: top,
    bottomCategory: bottom,
    outerLayerCategory: layer,
    visualAnchor: layer ?? bottom,
    outfitLine: `Style her in ${top} with ${bottom}${layer ? ` and ${layer}` : ", with no outer layer"}. Keep the colors low-chroma and coordinated, the fabric weights seasonally believable, and every garment hem clear of the sneakers.`,
    stylingRealismLine:
      "Treat this as a specific real wardrobe combination, with believable fabric interaction, natural wear, restrained accessories, and no substitution of its top, bottom, or outer layer.",
    forbidden: [
      "random garment substitution",
      "season mismatch",
      "competing saturated colors",
      "garment hem covering sneakers",
      "over-styled AI fashion template"
    ]
  };
}

for (const season of Object.keys(combinatorialOutfitPools) as CombinatorialSeason[]) {
  if (getCombinatorialOutfitCapacity(season) < 5000) {
    throw new Error(`${season} combinatorial outfit pool must provide at least 5000 unique signatures.`);
  }
}
