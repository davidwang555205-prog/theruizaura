export type AtmosphereSeasonId = "spring" | "summer" | "autumn" | "winter";
export type AtmosphereSeasonLabel = "春" | "夏" | "秋" | "冬";
export type ProductPresenceMode = "no_product" | "subtle_supporting_presence" | "lifestyle_trace_presence";
export type ProductPaletteEchoMode = "direct_accent" | "material_translation" | "brand_neutral";
export type ProductPaletteClass = "dark" | "brown" | "burgundy" | "black" | "light" | "unknown";
export type AtmosphereSpatialType = "indoor" | "outdoor" | "threshold";
export type PersonPresence = "no_person" | "human_trace_only";

export type SeasonConsistencyFailure =
  | "season_semantic_conflict"
  | "product_palette_overrode_season"
  | "seasonally_incompatible_wardrobe"
  | "seasonally_incompatible_material"
  | "seasonally_incompatible_object"
  | "seasonally_incompatible_lighting"
  | "seasonally_incompatible_life_moment"
  | "mixed_season_semantics";

export type ProductDominanceFailure =
  | "product_became_hero"
  | "product_centered"
  | "product_visual_weight_too_high"
  | "product_isolated_by_lighting"
  | "product_led_composition"
  | "ecommerce_like_presentation"
  | "catalog_like_presentation"
  | "product_truth_overexpanded";

export type SeasonSemanticProfile = {
  id: AtmosphereSeasonId;
  label: AtmosphereSeasonLabel;
  brandExpression: string[];
  atmosphere: string[];
  allowedWardrobe: string[];
  allowedMaterials: string[];
  allowedObjects: string[];
  allowedLifeMoments: string[];
  lighting: string[];
  spatialState: string[];
  paletteGuidance: string[];
  conflictsWith: string[];
};

export type ResolvedSeasonalSceneCues = {
  atmosphere: string[];
  wardrobeTraces: string[];
  materials: string[];
  objects: string[];
  lighting: string[];
  spatialState: string[];
  lifeMoments: string[];
  personPresence: PersonPresence;
};

export type AtmospherePromptSections = {
  moduleDefinition: string[];
  activeVisualSystem: string[];
  seasonIdentity: string[];
  positiveSeasonCues: string[];
  scene: string[];
  productPresence: string[];
  paletteEcho: string[];
  productTruth: string[];
  composition: string[];
  negativeConstraints: string[];
};

const sharedBrand = ["THERUIZ AURA Quiet Warm Luxury", "mature restrained urban life", "tactile realism without seasonal decoration"];

export const SEASON_SEMANTIC_PROFILES: Record<AtmosphereSeasonId, SeasonSemanticProfile> = {
  spring: {
    id: "spring", label: "春", brandExpression: sharedBrand,
    atmosphere: ["gentle renewal", "lightness", "mild freshness without sweetness", "a mature urban spring with a lightly cool layer"],
    allowedWardrobe: ["fine lightweight knit", "thin cardigan", "cotton or linen-blend shirt", "light jacket", "thin trench"],
    allowedMaterials: ["light cotton", "linen blend", "clear glass", "light wood"],
    allowedObjects: ["restrained flowers", "soft green foliage", "clear glass", "paper", "lightweight tote"],
    allowedLifeMoments: ["airing a room", "reading beside a window", "leaving through an entryway", "a quiet spring errand"],
    lighting: ["mild spring daylight", "soft natural side light"], spatialState: ["fresh breathable room", "lightly open threshold"],
    paletteGuidance: ["soft restrained neutrals", "small fresh accents without floral fantasy"],
    conflictsWith: ["heavy wool coat", "thick winter outerwear", "chunky knitwear", "heavy scarf", "fur", "winter boots", "fireplace-led winter mood", "dense cold-season layering", "dominant autumn leaves", "harvest-heavy styling", "tropical resort cues", "high-saturation floral fantasy"]
  },
  summer: {
    id: "summer", label: "夏", brandExpression: sharedBrand,
    atmosphere: ["clear breathable freshness", "air movement", "cooling restraint", "mature urban summer life"],
    allowedWardrobe: ["short sleeves", "lightweight shirt", "linen", "thin cotton"],
    allowedMaterials: ["linen", "thin cotton", "canvas", "clear glass", "cool stone"],
    allowedObjects: ["canvas tote", "drinking glass", "iced drink", "restrained summer flowers", "fresh produce", "moving curtain"],
    allowedLifeMoments: ["early morning ventilation", "quiet evening return", "a shaded city pause", "putting down a light tote"],
    lighting: ["cool early-morning natural light", "soft shaded evening light"], spatialState: ["ventilated room", "cool stone threshold", "open but restrained air flow"],
    paletteGuidance: ["cool restrained neutrals", "product hue limited to a tiny season-compatible echo"],
    conflictsWith: ["coat", "wool coat", "heavy trench layering", "thick outerwear", "heavy knitwear", "chunky sweater", "scarf", "wool blanket", "fur", "winter boots", "fireplace", "cold-season wardrobe", "dense autumn layering", "heavy leather outerwear", "winter domestic mood"]
  },
  autumn: {
    id: "autumn", label: "秋", brandExpression: sharedBrand,
    atmosphere: ["settled warmth", "mature restraint", "moderate tactile depth", "quiet urban autumn life"],
    allowedWardrobe: ["fine knit", "light trench", "light jacket", "long-sleeve shirt"],
    allowedMaterials: ["light knit", "wood", "small leather accessory", "warm-grey stone"],
    allowedObjects: ["hot coffee", "book", "small leather accessory", "a few fallen-leaf traces"],
    allowedLifeMoments: ["returning home at dusk", "a quiet reading pause", "organizing a light layer"],
    lighting: ["soft autumn dusk", "mellow natural daylight"], spatialState: ["settled lived-in room", "warm-grey threshold"],
    paletteGuidance: ["muted warm neutrals", "restrained mature accent"],
    conflictsWith: ["tropical summer styling", "strong resort cues", "dominant iced-drink summer mood", "extreme bare-skin summer wardrobe", "spring blossom fantasy", "ultra-light spring freshness", "heavy winter coat", "fur", "snow", "holiday winter decoration", "overly dark winter interior"]
  },
  winter: {
    id: "winter", label: "冬", brandExpression: sharedBrand,
    atmosphere: ["quiet concentration", "contained warmth within cool air", "mature restraint", "layered tactility"],
    allowedWardrobe: ["wool coat", "thick knit", "scarf", "believable winter layering"],
    allowedMaterials: ["wool", "thick knit", "blanket textile", "dark wood"],
    allowedObjects: ["hot drink", "blanket", "book", "entryway winter layer"],
    allowedLifeMoments: ["indoor reading", "returning through a winter entryway", "a quiet hot-drink pause"],
    lighting: ["cool winter daylight with localized warm light", "quiet low winter sun"], spatialState: ["contained residential warmth", "winter entryway"],
    paletteGuidance: ["deep restrained neutrals", "localized warmth without holiday styling"],
    conflictsWith: ["tropical summer scene", "summer resort", "dominant iced drink", "open airy summer wardrobe", "shorts-led styling", "summer flowers as dominant evidence", "strong spring blossom mood", "high-saturation beach color", "excessively bright vacation sunlight", "thin summer bedding"]
  }
};

export const SEASON_LABEL_TO_ID: Record<AtmosphereSeasonLabel, AtmosphereSeasonId> = { 春: "spring", 夏: "summer", 秋: "autumn", 冬: "winter" };

export function resolvePaletteEchoMode(season: AtmosphereSeasonId, palette: ProductPaletteClass, requested: ProductPaletteEchoMode): ProductPaletteEchoMode {
  if (requested !== "direct_accent") return requested;
  if ((season === "spring" || season === "summer") && ["dark", "brown", "burgundy", "black"].includes(palette)) return "material_translation";
  return requested;
}

export function filterSeasonCompatibleCandidates(candidates: string[], profile: SeasonSemanticProfile): string[] {
  return candidates.filter((candidate) => !profile.conflictsWith.some((conflict) => candidate.toLowerCase().includes(conflict.toLowerCase())));
}

const spatialMaterial: Record<AtmosphereSeasonId, Record<AtmosphereSpatialType, string>> = {
  spring: { indoor: "light cotton or linen-blend tactility", outdoor: "light stone and clear glass surfaces", threshold: "light wood and breathable fabric traces" },
  summer: { indoor: "linen or thin cotton tactility", outdoor: "cool stone and clear glass surfaces", threshold: "cool stone and one light textile trace" },
  autumn: { indoor: "light knit or natural wood tactility", outdoor: "warm-grey stone and weathered wood surfaces", threshold: "natural wood and one moderate textile trace" },
  winter: { indoor: "wool or dark wood tactility", outdoor: "cold stone and dark wood surfaces", threshold: "dark wood and one contained winter textile trace" },
};

const spatialState: Record<AtmosphereSeasonId, Record<AtmosphereSpatialType, string>> = {
  spring: { indoor: "a fresh breathable interior", outdoor: "mild open urban air", threshold: "a lightly open spring threshold" },
  summer: { indoor: "a ventilated interior", outdoor: "cool shaded urban air", threshold: "a ventilated cool threshold" },
  autumn: { indoor: "a settled lived-in interior", outdoor: "stable mellow urban air", threshold: "a calm warm-grey threshold" },
  winter: { indoor: "contained indoor warmth", outdoor: "clear cold urban air without holiday styling", threshold: "a restrained transition between cold air and localized warmth" },
};

export function resolveSeasonalSceneCues(input: {
  profile: SeasonSemanticProfile;
  spatialType: AtmosphereSpatialType;
  sceneId: string;
  sceneObjects: string[];
  lifeMoment: string;
  wardrobeTraceAllowed: boolean;
}): ResolvedSeasonalSceneCues {
  const { profile, spatialType, sceneId, sceneObjects, lifeMoment, wardrobeTraceAllowed } = input;
  const personPresence: PersonPresence = wardrobeTraceAllowed ? "human_trace_only" : "no_person";
  const wardrobeTraces = wardrobeTraceAllowed
    ? [`one partial, non-dominant trace of ${profile.allowedWardrobe[0]} appropriate to ${sceneId}`]
    : [];
  return {
    atmosphere: profile.atmosphere.slice(0, 2),
    wardrobeTraces,
    materials: [spatialMaterial[profile.id][spatialType]],
    objects: sceneObjects.slice(0, 2),
    lighting: [profile.lighting[0]],
    spatialState: [spatialState[profile.id][spatialType]],
    lifeMoments: [lifeMoment],
    personPresence,
  };
}

export function seasonProfilePromptLines(profile: SeasonSemanticProfile, cues: ResolvedSeasonalSceneCues): string[] {
  const trace = cues.wardrobeTraces.length ? ` Human trace: ${cues.wardrobeTraces[0]}.` : " No wardrobe or outfit instruction.";
  return [
    `SEASON AUTHORITY — ${profile.id}: ${cues.atmosphere.join(", ")}. Season outranks product palette.`,
    `Scene-aware seasonal cues: ${cues.materials[0]}; ${cues.objects.join(", ")}; ${cues.lifeMoments[0]}.${trace}`,
    `Season-exclusive light and space: ${cues.lighting[0]}; ${cues.spatialState[0]}. ${profile.paletteGuidance[0]}.`,
    `Exclude conflicting seasonal semantics: ${profile.conflictsWith.slice(0, 4).join(", ")}.`
  ];
}

export function productPresencePrompt(mode: ProductPresenceMode): string {
  if (mode === "no_product") return "Product presence mode: no product. The product is completely absent; do not add product display or full Product Truth readability requirements.";
  if (mode === "subtle_supporting_presence") return "Product presence mode: subtle supporting presence. Allow only a small peripheral glimpse, never centered, separately lit, fully displayed, or visually anchoring.";
  return "Product presence mode: lifestyle trace presence. Allow a believable partial daily trace at the scene edge, never an advertising still life.";
}

export function paletteEchoPrompt(mode: ProductPaletteEchoMode): string {
  if (mode === "direct_accent") return "Product palette echo from the currently attached product reference: direct accent. Use its confirmed hue only as one 5–15% season-compatible accent; it cannot set wardrobe weight, temperature, scene, or lifestyle.";
  if (mode === "material_translation") return "Product palette echo from the currently attached product reference: material translation. Use one season-compatible material already in the scene; never translate hue into clothing thickness, temperature, scene, or lifestyle.";
  return "Product palette echo from the currently attached product reference: brand neutral. Suppress its hue when it competes with the season and return to THERUIZ AURA restrained neutrals; do not force a color match.";
}

export function runSeasonConsistencyPromptQA(sections: AtmospherePromptSections, profile: SeasonSemanticProfile): SeasonConsistencyFailure[] {
  const positivePrompt = [
    ...sections.moduleDefinition,
    ...sections.activeVisualSystem,
    ...sections.seasonIdentity,
    ...sections.positiveSeasonCues,
    ...sections.scene,
    ...sections.productPresence,
    ...sections.paletteEcho,
    ...sections.productTruth,
    ...sections.composition,
  ].join(" ").toLowerCase();
  const failures: SeasonConsistencyFailure[] = [];
  if (profile.conflictsWith.some((term) => positivePrompt.includes(term.toLowerCase()))) failures.push("season_semantic_conflict");
  if (/product reference (?:and|or) (?:this )?scene determine (?:the )?(?:overall |global )?(?:light|temperature|season|material weight)/i.test(positivePrompt)) failures.push("product_palette_overrode_season");
  if (/overall light temperature|global lighting|spatial climate|wardrobe thickness/.test(sections.paletteEcho.join(" ").toLowerCase()) && !/must not|cannot|exclusively/.test(sections.paletteEcho.join(" ").toLowerCase())) failures.push("product_palette_overrode_season");
  return [...new Set(failures)];
}

export function runProductDominancePromptQA(sections: AtmospherePromptSections): ProductDominanceFailure[] {
  const lower = [...sections.productPresence, ...sections.productTruth, ...sections.composition].join(" ").toLowerCase();
  const failures: ProductDominanceFailure[] = [];
  if (/product (is|as) (the )?(hero|visual center|primary subject)/.test(lower)) failures.push("product_became_hero");
  if (/center(ed)? (the )?product/.test(lower) && !/never centered|do not center/.test(lower)) failures.push("product_centered");
  if (/catalog composition|e-commerce display/.test(lower) && !/not |never |do not /.test(lower)) failures.push("catalog_like_presentation");
  return failures;
}
