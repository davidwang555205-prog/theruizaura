import type { ColorDirection, GarmentType, OutfitStyle } from "./sceneOutfitSeedLibrary";

export type WardrobeRole = "hero" | "basic" | "accent";
export type WardrobeCategory = "outerwear" | "knitwear" | "blazer" | "top" | "trousers" | "skirt";
export type WardrobeScene =
  | "commute"
  | "cafeExterior"
  | "weekendCityWalk"
  | "boutiqueStreet"
  | "flowerShop"
  | "bakeryDessert"
  | "bookstoreMagazine"
  | "premiumErrands"
  | "lightSocial"
  | "galleryExhibition"
  | "mirrorCloset"
  | "entrywayDeparture"
  | "cityCorner";
export type WardrobePersonState = "professional" | "relaxed" | "social" | "cultural" | "private";
export type WardrobeColorFamily = "neutral_light" | "neutral_dark" | "earth" | "muted_accent" | "denim";
export type FashionElement = "suede" | "shearling" | "tweed" | "victorian" | "shawl" | "plaid";
export type InspirationSource = "Loro Piana" | "Brunello Cucinelli" | "The Row" | "Chloé" | "Chanel";

export type WardrobeItem = {
  id: string;
  layer: "aw26_upgrade";
  category: WardrobeCategory;
  season: ("autumn" | "winter")[];
  silhouette: string;
  material: string;
  color: string;
  warmth: 1 | 2 | 3 | 4 | 5;
  formality: "casual" | "smart_casual" | "tailored";
  scene_compatibility: WardrobeScene[];
  person_state_compatibility: WardrobePersonState[];
  role: WardrobeRole;
  footwear_visibility: "high" | "medium";
  compatible_tops: string[];
  compatible_bottoms: string[];
  compatible_outerwear: string[];
  inspiration_source?: InspirationSource;
  prompt_label: string;
  color_family: WardrobeColorFamily;
  fashion_element?: FashionElement;
};

const allScenes: WardrobeScene[] = [
  "commute", "cafeExterior", "weekendCityWalk", "boutiqueStreet", "flowerShop",
  "bakeryDessert", "bookstoreMagazine", "premiumErrands", "lightSocial",
  "galleryExhibition", "mirrorCloset", "entrywayDeparture", "cityCorner"
];
const tailoredScenes: WardrobeScene[] = [
  "commute", "cafeExterior", "boutiqueStreet", "bookstoreMagazine", "premiumErrands",
  "lightSocial", "galleryExhibition", "mirrorCloset", "entrywayDeparture", "cityCorner"
];
const relaxedScenes: WardrobeScene[] = [
  "cafeExterior", "weekendCityWalk", "flowerShop", "bakeryDessert", "bookstoreMagazine",
  "premiumErrands", "lightSocial", "galleryExhibition", "mirrorCloset", "entrywayDeparture", "cityCorner"
];
const allPersonStates: WardrobePersonState[] = ["professional", "relaxed", "social", "cultural", "private"];

type ItemDraft = Omit<
  WardrobeItem,
  "layer" | "season" | "scene_compatibility" | "person_state_compatibility" |
  "footwear_visibility" | "compatible_tops" | "compatible_bottoms" | "compatible_outerwear"
> & Partial<Pick<
  WardrobeItem,
  "season" | "scene_compatibility" | "person_state_compatibility" | "footwear_visibility" |
  "compatible_tops" | "compatible_bottoms" | "compatible_outerwear"
>>;

function compatibilityFor(category: WardrobeCategory) {
  return {
    compatible_tops: category === "top" || category === "knitwear"
      ? ["self", "core-neutral-base"]
      : ["core-neutral-shirt", "core-fine-knit", "aw26-basic-top"],
    compatible_bottoms: category === "trousers" || category === "skirt"
      ? ["self"]
      : ["core-straight-trouser", "core-dark-denim", "aw26-basic-bottom"],
    compatible_outerwear: category === "outerwear" || category === "blazer"
      ? ["self"]
      : ["core-clean-coat", "aw26-basic-outerwear", "none"]
  };
}

const item = (draft: ItemDraft): WardrobeItem => ({
  layer: "aw26_upgrade",
  season: ["autumn", "winter"],
  scene_compatibility: draft.formality === "tailored" ? tailoredScenes : draft.formality === "casual" ? relaxedScenes : allScenes,
  person_state_compatibility: draft.formality === "tailored"
    ? ["professional", "social", "cultural", "private"]
    : draft.formality === "casual"
      ? ["relaxed", "social", "cultural", "private"]
      : allPersonStates,
  footwear_visibility: "high",
  ...compatibilityFor(draft.category),
  ...draft
});

export const theruizAuraWardrobeLibrary: WardrobeItem[] = [
  item({ id:"aw26-coat-camel", category:"outerwear", silhouette:"long relaxed", material:"double-face cashmere", color:"camel", warmth:5, formality:"tailored", role:"hero", prompt_label:"a camel double-face cashmere long coat worn open so the trouser hem and sneakers remain visible", color_family:"earth", inspiration_source:"Loro Piana" }),
  item({ id:"aw26-coat-charcoal", category:"outerwear", silhouette:"clean long", material:"brushed wool", color:"charcoal", warmth:5, formality:"tailored", role:"basic", prompt_label:"a clean charcoal brushed-wool long coat worn open", color_family:"neutral_dark", inspiration_source:"The Row" }),
  item({ id:"aw26-coat-brown", category:"outerwear", silhouette:"soft-shoulder long", material:"wool cashmere", color:"dark brown", warmth:5, formality:"tailored", role:"basic", prompt_label:"a dark-brown soft-shoulder wool-cashmere coat worn open", color_family:"earth", inspiration_source:"Loro Piana" }),
  item({ id:"aw26-coat-olive", category:"outerwear", silhouette:"belted relaxed", material:"wool twill", color:"muted olive", warmth:4, formality:"smart_casual", role:"hero", prompt_label:"a muted-olive belted wool-twill coat loosely open", color_family:"earth", inspiration_source:"Chloé" }),
  item({ id:"aw26-trench-stone", category:"outerwear", silhouette:"long fluid", material:"cotton gabardine", color:"stone beige", warmth:3, formality:"smart_casual", role:"basic", prompt_label:"a stone-beige fluid cotton-gabardine trench worn open", color_family:"neutral_light", inspiration_source:"The Row" }),
  item({ id:"aw26-jacket-suede", category:"outerwear", silhouette:"waist length", material:"suede", color:"tobacco", warmth:3, formality:"smart_casual", role:"hero", prompt_label:"a tobacco waist-length suede jacket", color_family:"earth", fashion_element:"suede", inspiration_source:"Chloé" }),
  item({ id:"aw26-jacket-shearling", category:"outerwear", silhouette:"cropped clean", material:"shearling", color:"cream", warmth:5, formality:"casual", role:"hero", prompt_label:"a clean cropped cream shearling jacket", color_family:"neutral_light", fashion_element:"shearling", inspiration_source:"Brunello Cucinelli" }),
  item({ id:"aw26-jacket-tweed", category:"outerwear", silhouette:"short boxy", material:"matte tweed", color:"black", warmth:3, formality:"tailored", role:"hero", prompt_label:"a short matte-black textured jacket with no decorative chains", color_family:"neutral_dark", fashion_element:"tweed", inspiration_source:"Chanel" }),
  item({ id:"aw26-knit-ivory", category:"knitwear", silhouette:"fine high neck", material:"cashmere", color:"ivory", warmth:4, formality:"smart_casual", role:"basic", prompt_label:"an ivory fine-gauge cashmere high-neck knit", color_family:"neutral_light", inspiration_source:"Loro Piana" }),
  item({ id:"aw26-knit-oatmeal", category:"knitwear", silhouette:"relaxed crew", material:"wool cashmere", color:"oatmeal", warmth:4, formality:"casual", role:"basic", prompt_label:"an oatmeal relaxed wool-cashmere crew-neck knit", color_family:"neutral_light", inspiration_source:"Brunello Cucinelli" }),
  item({ id:"aw26-knit-camel", category:"knitwear", silhouette:"clean crew", material:"cashmere", color:"camel", warmth:4, formality:"smart_casual", role:"basic", prompt_label:"a camel fine-cashmere crew-neck knit", color_family:"earth", inspiration_source:"Loro Piana" }),
  item({ id:"aw26-cardigan-chocolate", category:"knitwear", silhouette:"soft straight", material:"cashmere", color:"chocolate", warmth:4, formality:"smart_casual", role:"basic", prompt_label:"a chocolate cashmere cardigan", color_family:"earth", inspiration_source:"The Row" }),
  item({ id:"aw26-knit-charcoal", category:"knitwear", silhouette:"slim relaxed", material:"merino", color:"charcoal", warmth:3, formality:"smart_casual", role:"basic", prompt_label:"a charcoal fine-merino knit", color_family:"neutral_dark", inspiration_source:"Chanel" }),
  item({ id:"aw26-cardigan-burgundy", category:"knitwear", silhouette:"clean fitted", material:"cashmere", color:"muted burgundy", warmth:3, formality:"smart_casual", role:"accent", prompt_label:"a muted-burgundy cashmere cardigan as the only color accent", color_family:"muted_accent", inspiration_source:"Chloé" }),
  item({ id:"aw26-shawl-greige", category:"knitwear", silhouette:"soft draped", material:"cashmere", color:"greige", warmth:4, formality:"smart_casual", role:"hero", prompt_label:"one restrained greige cashmere shawl layer", color_family:"neutral_light", fashion_element:"shawl", inspiration_source:"Loro Piana" }),
  item({ id:"aw26-blazer-grey", category:"blazer", silhouette:"relaxed soft shoulder", material:"wool", color:"warm grey", warmth:3, formality:"tailored", role:"basic", prompt_label:"a warm-grey relaxed soft-shoulder wool blazer", color_family:"neutral_light", inspiration_source:"Brunello Cucinelli" }),
  item({ id:"aw26-blazer-charcoal", category:"blazer", silhouette:"oversized clean", material:"wool", color:"charcoal", warmth:3, formality:"tailored", role:"hero", prompt_label:"a charcoal clean oversized wool blazer", color_family:"neutral_dark", inspiration_source:"The Row" }),
  item({ id:"aw26-blazer-taupe", category:"blazer", silhouette:"long relaxed", material:"wool silk", color:"taupe", warmth:3, formality:"tailored", role:"basic", prompt_label:"a taupe relaxed wool-silk blazer", color_family:"neutral_light", inspiration_source:"Loro Piana" }),
  item({ id:"aw26-blazer-brown", category:"blazer", silhouette:"soft shoulder", material:"wool", color:"deep brown", warmth:3, formality:"tailored", role:"basic", prompt_label:"a deep-brown soft-shoulder wool blazer", color_family:"earth", inspiration_source:"Brunello Cucinelli" }),
  item({ id:"aw26-shirt-white", category:"top", silhouette:"oversized clean", material:"cotton poplin", color:"white", warmth:2, formality:"smart_casual", role:"basic", prompt_label:"a crisp white oversized cotton-poplin shirt", color_family:"neutral_light", inspiration_source:"The Row" }),
  item({ id:"aw26-shirt-ivory", category:"top", silhouette:"fluid straight", material:"silk", color:"ivory", warmth:2, formality:"tailored", role:"basic", prompt_label:"an ivory fluid silk shirt", color_family:"neutral_light", inspiration_source:"Loro Piana" }),
  item({ id:"aw26-shirt-blue", category:"top", silhouette:"relaxed", material:"Oxford cotton", color:"muted blue", warmth:2, formality:"smart_casual", role:"accent", prompt_label:"a muted Oxford-blue relaxed shirt as the only color accent", color_family:"muted_accent", inspiration_source:"Chanel" }),
  item({ id:"aw26-blouse-victorian", category:"top", silhouette:"soft high neck", material:"cotton silk", color:"ivory", warmth:2, formality:"smart_casual", role:"hero", prompt_label:"a restrained ivory high-neck romantic blouse without decorative overload", color_family:"neutral_light", fashion_element:"victorian", inspiration_source:"Chloé" }),
  item({ id:"aw26-trouser-charcoal", category:"trousers", silhouette:"wide leg", material:"wool", color:"charcoal", warmth:4, formality:"tailored", role:"basic", prompt_label:"charcoal wide-leg wool trousers with a controlled break above the sneakers", color_family:"neutral_dark", inspiration_source:"Chanel" }),
  item({ id:"aw26-trouser-grey", category:"trousers", silhouette:"wide leg", material:"wool flannel", color:"warm grey", warmth:4, formality:"tailored", role:"basic", prompt_label:"warm-grey wide-leg flannel trousers with clear sneaker visibility", color_family:"neutral_light", inspiration_source:"Brunello Cucinelli" }),
  item({ id:"aw26-trouser-brown", category:"trousers", silhouette:"straight", material:"wool twill", color:"dark brown", warmth:4, formality:"smart_casual", role:"basic", prompt_label:"dark-brown straight wool-twill trousers with a clean ankle break", color_family:"earth", inspiration_source:"The Row" }),
  item({ id:"aw26-trouser-black", category:"trousers", silhouette:"straight", material:"wool", color:"black", warmth:3, formality:"tailored", role:"basic", prompt_label:"black straight wool trousers with a clean ankle break", color_family:"neutral_dark", inspiration_source:"The Row" }),
  item({ id:"aw26-trouser-oatmeal", category:"trousers", silhouette:"relaxed pleated", material:"wool", color:"oatmeal", warmth:4, formality:"smart_casual", role:"basic", prompt_label:"oatmeal relaxed pleated wool trousers", color_family:"neutral_light", inspiration_source:"Brunello Cucinelli" }),
  item({ id:"aw26-denim-dark", category:"trousers", silhouette:"relaxed straight", material:"denim", color:"dark indigo", warmth:3, formality:"casual", role:"basic", prompt_label:"dark-indigo relaxed straight denim with a clean ankle break", color_family:"denim", inspiration_source:"Chanel" }),
  item({ id:"aw26-corduroy-smoke", category:"trousers", silhouette:"wide straight", material:"fine corduroy", color:"smoky grey", warmth:4, formality:"smart_casual", role:"accent", prompt_label:"smoky-grey fine-corduroy wide trousers", color_family:"neutral_dark", inspiration_source:"Brunello Cucinelli" }),
  item({ id:"aw26-skirt-cream", category:"skirt", silhouette:"flowing midi", material:"silk wool", color:"cream", warmth:3, formality:"smart_casual", role:"basic", prompt_label:"a cream fluid midi skirt ending well above the sneakers", color_family:"neutral_light", inspiration_source:"Chloé" }),
  item({ id:"aw26-skirt-charcoal", category:"skirt", silhouette:"straight midi", material:"wool", color:"charcoal", warmth:4, formality:"tailored", role:"basic", prompt_label:"a charcoal straight wool midi skirt with the full sneakers visible", color_family:"neutral_dark", inspiration_source:"Chanel" }),
  item({ id:"aw26-skirt-plaid", category:"skirt", silhouette:"A-line midi", material:"wool", color:"brown muted plaid", warmth:4, formality:"smart_casual", role:"hero", prompt_label:"a restrained brown muted-plaid A-line midi skirt", color_family:"earth", fashion_element:"plaid", inspiration_source:"Chloé" }),
  item({ id:"aw26-skirt-grey-pleat", category:"skirt", silhouette:"soft pleated midi", material:"wool blend", color:"grey", warmth:3, formality:"smart_casual", role:"basic", prompt_label:"a soft-grey pleated midi skirt ending above the sneakers", color_family:"neutral_light", inspiration_source:"Chanel" })
];

export type Aw26OutfitPreset = {
  id: string;
  name: string;
  item_ids: string[];
  scene_compatibility: WardrobeScene[];
  person_state_compatibility: WardrobePersonState[];
  footwear_visibility: "high";
  prompt_line: string;
  mode: "preset";
};

const byId = new Map(theruizAuraWardrobeLibrary.map((entry) => [entry.id, entry]));
const preset = (number: number, name: string, ids: string[]): Aw26OutfitPreset => ({
  id: `aw26-preset-${String(number).padStart(2, "0")}`,
  name,
  item_ids: ids,
  scene_compatibility: ids.map((id) => byId.get(id)?.scene_compatibility ?? []).reduce((common, scenes) => common.filter((scene) => scenes.includes(scene)), allScenes),
  person_state_compatibility: ids.map((id) => byId.get(id)?.person_state_compatibility ?? []).reduce((common, states) => common.filter((state) => states.includes(state)), allPersonStates),
  footwear_visibility: "high",
  mode: "preset",
  prompt_line: `Style her in ${ids.map((id) => byId.get(id)?.prompt_label).filter(Boolean).join(", ")}. Keep accessories restrained, use no visible fashion logos, and keep the sneakers as the commercial visual focus.`
});

export const aw26OutfitPresets: Aw26OutfitPreset[] = [
  preset(1,"Camel commuter",["aw26-coat-camel","aw26-knit-ivory","aw26-trouser-charcoal"]),
  preset(2,"Charcoal city",["aw26-coat-charcoal","aw26-shirt-white","aw26-trouser-black"]),
  preset(3,"Brown travel",["aw26-coat-brown","aw26-knit-oatmeal","aw26-trouser-grey"]),
  preset(4,"Olive soft tailoring",["aw26-coat-olive","aw26-knit-ivory","aw26-trouser-brown"]),
  preset(5,"Stone trench denim",["aw26-trench-stone","aw26-knit-charcoal","aw26-denim-dark"]),
  preset(6,"Tobacco suede core",["aw26-jacket-suede","aw26-shirt-white","aw26-trouser-charcoal"]),
  preset(7,"Cream shearling",["aw26-jacket-shearling","aw26-knit-charcoal","aw26-trouser-black"]),
  preset(8,"Black textured denim",["aw26-jacket-tweed","aw26-shirt-white","aw26-denim-dark"]),
  preset(9,"Warm grey tailoring",["aw26-blazer-grey","aw26-knit-ivory","aw26-trouser-charcoal"]),
  preset(10,"Charcoal oversized",["aw26-blazer-charcoal","aw26-shirt-ivory","aw26-trouser-oatmeal"]),
  preset(11,"Taupe quiet office",["aw26-blazer-taupe","aw26-shirt-white","aw26-trouser-brown"]),
  preset(12,"Deep brown tailoring",["aw26-blazer-brown","aw26-knit-oatmeal","aw26-trouser-grey"]),
  preset(13,"Burgundy accent",["aw26-cardigan-burgundy","aw26-shirt-ivory","aw26-trouser-charcoal"]),
  preset(14,"Greige shawl",["aw26-shawl-greige","aw26-shirt-white","aw26-trouser-brown"]),
  preset(15,"Oxford blue charcoal",["aw26-shirt-blue","aw26-trouser-charcoal","aw26-coat-brown"]),
  preset(16,"Ivory silk black",["aw26-shirt-ivory","aw26-trouser-black","aw26-coat-charcoal"]),
  preset(17,"Camel knit grey",["aw26-knit-camel","aw26-trouser-grey","aw26-trench-stone"]),
  preset(18,"Chocolate cardigan",["aw26-cardigan-chocolate","aw26-shirt-white","aw26-trouser-oatmeal"]),
  preset(19,"Charcoal knit denim",["aw26-knit-charcoal","aw26-denim-dark","aw26-coat-camel"]),
  preset(20,"Ivory knit corduroy",["aw26-knit-ivory","aw26-corduroy-smoke","aw26-trench-stone"]),
  preset(21,"Cream flowing skirt",["aw26-jacket-suede","aw26-knit-oatmeal","aw26-skirt-cream"]),
  preset(22,"Charcoal wool skirt",["aw26-knit-ivory","aw26-skirt-charcoal","aw26-trench-stone"]),
  preset(23,"Muted plaid skirt",["aw26-skirt-plaid","aw26-knit-charcoal","aw26-coat-brown"]),
  preset(24,"Grey pleated skirt",["aw26-skirt-grey-pleat","aw26-shirt-white","aw26-blazer-taupe"]),
  preset(25,"Romantic blouse restraint",["aw26-blouse-victorian","aw26-trouser-brown","aw26-coat-charcoal"]),
  preset(26,"Textured jacket grey trouser",["aw26-jacket-tweed","aw26-knit-ivory","aw26-trouser-grey"]),
  preset(27,"Suede dark denim",["aw26-jacket-suede","aw26-knit-ivory","aw26-denim-dark"]),
  preset(28,"Olive cream skirt",["aw26-coat-olive","aw26-knit-charcoal","aw26-skirt-cream"]),
  preset(29,"Oatmeal monochrome",["aw26-knit-oatmeal","aw26-trouser-oatmeal","aw26-coat-charcoal"]),
  preset(30,"Dark brown minimal",["aw26-coat-brown","aw26-shirt-white","aw26-trouser-black"])
];

const highConflictElements = new Set<FashionElement>(["victorian", "tweed", "shawl", "suede", "shearling", "plaid"]);
const colorfulShoes = /Delphinium Blue|Lemon|Maple Grove|Silver Romance/i;

export type WardrobeValidationInput = {
  season: "autumn" | "winter";
  scene: WardrobeScene;
  personState: WardrobePersonState;
  shoe: string;
};

export function validateWardrobeCombination(items: WardrobeItem[], input: WardrobeValidationInput) {
  const reasons: string[] = [];
  if (!items.length) reasons.push("empty combination");
  if (items.some((entry) => !entry.season.includes(input.season))) reasons.push("season mismatch");
  if (items.some((entry) => !entry.scene_compatibility.includes(input.scene))) reasons.push("scene mismatch");
  if (items.some((entry) => !entry.person_state_compatibility.includes(input.personState))) reasons.push("person-state mismatch");
  if (items.filter((entry) => entry.role === "hero").length > 1) reasons.push("more than one hero fashion element");
  if (items.filter((entry) => entry.fashion_element && highConflictElements.has(entry.fashion_element)).length > 1) reasons.push("high-conflict fashion elements");
  if (items.filter((entry) => /cashmere|shearling|tweed|suede|corduroy/i.test(entry.material)).length > 2) reasons.push("material overload");
  if (items.some((entry) => entry.footwear_visibility !== "high")) reasons.push("insufficient footwear visibility");
  if (items.filter((entry) => entry.color_family === "muted_accent").length > 1) reasons.push("color overload");
  if (colorfulShoes.test(input.shoe) && items.some((entry) => entry.color_family === "muted_accent")) reasons.push("colorful shoe requires neutral clothing");
  return { valid: reasons.length === 0, reasons };
}

function resolvePresetItems(presetEntry: Aw26OutfitPreset) {
  return presetEntry.item_ids.map((id) => byId.get(id)).filter((entry): entry is WardrobeItem => Boolean(entry));
}

export function selectAw26Preset(input: WardrobeValidationInput & { nonce?: number; blockedIds?: string[] }) {
  const blocked = new Set(input.blockedIds ?? []);
  const candidates = aw26OutfitPresets.filter((entry) => {
    if (blocked.has(entry.id) || !entry.scene_compatibility.includes(input.scene) || !entry.person_state_compatibility.includes(input.personState)) return false;
    return validateWardrobeCombination(resolvePresetItems(entry), input).valid;
  });
  if (!candidates.length) return null;
  const selected = candidates[Math.abs(input.nonce ?? 0) % candidates.length];
  return { ...selected, items: resolvePresetItems(selected) };
}

export function buildAw26Mix(input: WardrobeValidationInput & {
  nonce?: number;
  coreBasics: { top: string; bottom: string; outerwear?: string };
}) {
  const requiresNeutralCore = colorfulShoes.test(input.shoe);
  const coreBasics = requiresNeutralCore
    ? { top: "ivory fine-gauge knit", bottom: "charcoal straight trousers" }
    : input.coreBasics;
  const coreText = `${coreBasics.top} ${coreBasics.bottom} ${coreBasics.outerwear ?? ""}`.toLowerCase();
  const coreHasAccent = /burgundy|berry|plum|bright blue|mist blue|muted blue|sage|moss green/i.test(coreText);
  const coreHasHeroTexture = /victorian|tweed|shawl|suede|shearling|plaid/i.test(coreText);
  const coreMaterialLoad = (coreText.match(/cashmere|shearling|tweed|suede|corduroy/g) ?? []).length;
  const eligible = theruizAuraWardrobeLibrary.filter((entry) =>
    entry.season.includes(input.season) &&
    entry.scene_compatibility.includes(input.scene) &&
    entry.person_state_compatibility.includes(input.personState) &&
    ["outerwear", "blazer", "knitwear"].includes(entry.category) &&
    (!requiresNeutralCore || entry.color_family !== "muted_accent") &&
    (!coreHasAccent || entry.color_family !== "muted_accent") &&
    (!coreHasHeroTexture || entry.role !== "hero") &&
    coreMaterialLoad + (/cashmere|shearling|tweed|suede|corduroy/i.test(entry.material) ? 1 : 0) <= 2
  );
  for (let step = 0; step < eligible.length; step += 1) {
    const upgrade = eligible[(Math.abs(input.nonce ?? 0) + step) % eligible.length];
    if (!validateWardrobeCombination([upgrade], input).valid) continue;
    return {
      id: `aw26-mix-${upgrade.id}`,
      mode: "mix" as const,
      source_layers: ["core", "aw26_upgrade"] as const,
      items: [upgrade],
      prompt_line: `Keep the Core Basics of ${coreBasics.top} and ${coreBasics.bottom}${coreBasics.outerwear ? ` with ${coreBasics.outerwear}` : ""}, upgraded only with ${upgrade.prompt_label}. Keep this as the only AW26 fashion element, keep the styling realistic and restrained, and keep the sneakers fully readable as the commercial visual focus.`
    };
  }
  return null;
}

export function getWardrobePersonState(scene: WardrobeScene): WardrobePersonState {
  if (scene === "commute") return "professional";
  if (["lightSocial", "flowerShop", "bakeryDessert"].includes(scene)) return "social";
  if (["galleryExhibition", "bookstoreMagazine"].includes(scene)) return "cultural";
  if (["mirrorCloset", "entrywayDeparture"].includes(scene)) return "private";
  return "relaxed";
}

export function isAw26WardrobeScene(scene: string): scene is WardrobeScene {
  return allScenes.includes(scene as WardrobeScene);
}

export function getAw26SelectionMetadata(items: WardrobeItem[], fallbackGarment: GarmentType) {
  const bottom = items.find((entry) => entry.category === "trousers" || entry.category === "skirt");
  const top = items.find((entry) => entry.category === "top" || entry.category === "knitwear");
  const hero = items.find((entry) => entry.role === "hero") ?? top ?? bottom ?? items[0];
  const colorDirection: ColorDirection = items.some((entry) => entry.color_family === "muted_accent")
    ? "softAccent"
    : items.some((entry) => entry.color_family === "neutral_dark")
      ? "darkAnchor"
      : items.some((entry) => entry.color_family === "denim")
        ? "denimBased"
        : "neutralDaily";
  const outfitStyle: OutfitStyle = items.some((entry) => entry.formality === "tailored") ? "polishedCommuter" : "cleanMinimal";
  return {
    garmentType: bottom?.category === "skirt" ? "skirt" as GarmentType : bottom?.category === "trousers" ? "trousers" as GarmentType : fallbackGarment,
    outfitStyle,
    colorDirection,
    topCategory: top?.prompt_label ?? "existing Core Basics top",
    bottomCategory: bottom?.prompt_label ?? "existing Core Basics bottom",
    visualAnchor: hero?.prompt_label ?? "one restrained AW26 upgrade"
  };
}

export const aw26ProductionBrandNames: InspirationSource[] = ["Loro Piana", "Brunello Cucinelli", "The Row", "Chloé", "Chanel"];
