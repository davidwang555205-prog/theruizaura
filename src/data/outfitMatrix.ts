import type { OutfitMode, OutfitRecommendation, Season } from "../types";
import { SHOE_STYLE_NOTES } from "./seasonalOutfits";

const sceneWardrobeBias: Record<string, Partial<OutfitRecommendation>> = {
  "01": {
    tops: "crisp white shirt or cream fine-knit top",
    bottoms: "tailored oatmeal trousers or soft straight denim",
    outerwear: "light trench coat or warm grey blazer"
  },
  "02": {
    tops: "soft cotton shirt or relaxed cream knit",
    bottoms: "comfortable straight trousers or pale denim",
    bag: "soft beige tote with practical daily capacity"
  },
  "03": {
    tops: "white shirt, cream knit, or breathable cotton top",
    bottoms: "light denim or soft beige trousers",
    bag: "small neutral tote or paper bakery bag"
  },
  "04": {
    tops: "white shirt, cream knit, or quiet home-to-outdoor layer",
    bottoms: "soft denim or oatmeal trousers",
    outerwear: "light trench coat placed nearby"
  },
  "05": {
    tops: "white shirt, cream knitwear, or soft neutral layered pieces",
    bottoms: "light blue denim or linen trousers",
    accessories: "hanger, folded shirt, color card, or subtle styling objects"
  },
  "06": {
    tops: "cream knitwear or white cotton top",
    bottoms: "ankle-length straight trousers or pale denim with clean cuffs",
    accessories: "minimal socks and natural trouser hems around the sneaker"
  },
  "07": {
    tops: "hands-only styling with neutral sleeves if a person appears",
    bottoms: "not required unless a partial body appears",
    accessories: "material swatches, care brush, laces, neutral dust bag, color cards"
  },
  "08": {
    tops: "travel-ready white shirt or soft knit layer",
    bottoms: "structured denim or warm beige trousers",
    bag: "neutral travel tote"
  },
  "09": {
    tops: "white shirt or fine soft knit",
    bottoms: "tailored trousers",
    outerwear: "light trench coat or soft wool jacket",
    bag: "structured neutral tote"
  },
  "10": {
    tops: "soft shirt or knitwear with easy movement",
    bottoms: "clean straight trousers or soft denim",
    bag: "practical neutral tote"
  },
  "11": {
    tops: "cream cotton top or white shirt",
    bottoms: "relaxed tailored trousers",
    bag: "neutral tote, grocery paper bag, flowers, or bakery bag"
  },
  "12": {
    tops: "white shirt, soft knit, or light jacket",
    bottoms: "straight trousers with clean hems",
    outerwear: "light trench coat or relaxed coat",
    bag: "structured tote from the back seat"
  },
  "13": {
    tops: "white shirt or refined knitwear",
    bottoms: "tailored trousers",
    outerwear: "light coat or warm grey blazer",
    bag: "small elegant neutral bag"
  },
  "14": {
    tops: "soft knitwear or clean cotton shirt",
    bottoms: "comfortable refined trousers",
    outerwear: "soft coat",
    bag: "neutral handbag or appointment card"
  },
  "15": {
    tops: "travel-ready white shirt or refined knit",
    bottoms: "tailored travel trousers or structured denim",
    outerwear: "cream or warm grey coat",
    bag: "travel tote with suitcase"
  },
  "16": {
    tops: "white shirt, cream knit, or breathable cotton top",
    bottoms: "soft denim or warm beige trousers",
    outerwear: "light trench coat or soft seasonal coat",
    bag: "neutral tote or coffee cup"
  }
};

const seasonDefaults: Record<Season, Omit<OutfitRecommendation, "season" | "scenes" | "shoe" | "material" | "outfitMode">> = {
  Spring: {
    tops: "white shirt with cream knitwear or a soft low-saturation layer",
    bottoms: "light blue denim, oatmeal trousers, or soft beige trousers",
    outerwear: "light trench coat",
    bag: "soft beige tote",
    accessories: "minimal gold or pearl detail, understated watch, clean socks",
    fabrics: "cotton poplin, light knit, soft denim, linen blend",
    colorPalette: "cream white, warm beige, oatmeal, pale denim blue, soft stone",
    stylingSummary:
      "airy, clean, gentle, relaxed spring styling with understated femininity and quiet daily elegance"
  },
  Summer: {
    tops: "white short-sleeve shirt, cream cotton top, or airy linen shirt",
    bottoms: "linen trousers, soft beige trousers, or pale denim",
    outerwear: "no heavy outerwear; use a light shirt layer if needed",
    bag: "light neutral tote",
    accessories: "minimal jewelry, breathable socks, simple sunglasses only if natural",
    fabrics: "linen, cotton, light denim, breathable mesh-friendly textures",
    colorPalette: "cream white, warm beige, pale blue, light oatmeal, soft stone",
    stylingSummary:
      "light, breathable, refined summer styling with quiet femininity, without sporty or vacation-content energy"
  },
  Autumn: {
    tops: "oatmeal knitwear, white shirt, or cappuccino-toned soft layer",
    bottoms: "warm beige trousers, soft denim, or light brown tailored trousers",
    outerwear: "light wool outerwear or soft trench coat",
    bag: "refined brown tote",
    accessories: "subtle scarf, understated jewelry, warm socks if visible",
    fabrics: "soft wool, suede-adjacent textures, cotton, denim, tactile knitwear",
    colorPalette: "oatmeal, cappuccino, warm beige, soft denim, muted maple",
    stylingSummary:
      "calm, seasonal, feminine autumn styling with quiet vintage tactility, without heaviness"
  },
  Winter: {
    tops: "oatmeal knitwear or clean cream layer",
    bottoms: "soft wool trousers, structured denim, or warm beige trousers",
    outerwear: "cream, warm grey, or soft camel coat",
    bag: "muted brown tote",
    accessories: "minimal scarf, understated earrings, warm but refined socks",
    fabrics: "soft wool, brushed cotton, structured denim, tactile knitwear",
    colorPalette: "cream, oatmeal, warm grey, muted brown, soft stone",
    stylingSummary:
      "warm, composed, practical winter sophistication, refined without bulky or harsh winter fashion"
  }
};

const mergeText = (base: string, override?: string) => override || base;

export function getUnifiedOutfitForThreeImageSet(
  selectedScenes: string[],
  selectedSeason: Season,
  selectedShoe: string,
  selectedMaterial: string,
  outfitMode: OutfitMode = "auto",
  manualOutfitNotes = ""
): OutfitRecommendation {
  const base = seasonDefaults[selectedSeason];
  const primaryScene = selectedScenes[0] || "01";
  const secondScene = selectedScenes[1] || selectedScenes[0] || "06";
  const sceneBias = {
    ...sceneWardrobeBias[primaryScene],
    ...sceneWardrobeBias[secondScene]
  };
  const shoeNote = SHOE_STYLE_NOTES[selectedShoe] ?? "custom THERUIZ AURA sneaker styling: keep the outfit low-saturation, refined, warm, practical, and believable.";
  const materialNote = selectedMaterial.includes("麂皮")
    ? "Use tactile, soft, suede-compatible styling."
    : selectedMaterial.includes("网布")
      ? "Use breathable spring-summer styling without sporty energy."
      : selectedMaterial.includes("缎面")
        ? "Use refined soft sheen carefully without eveningwear or party styling."
        : "Keep materials tactile, real, and quietly refined.";

  const manualNote = outfitMode === "manual" && manualOutfitNotes.trim()
    ? ` Manual styling note from user: ${manualOutfitNotes.trim()}`
    : "";

  return {
    season: selectedSeason,
    scenes: selectedScenes,
    shoe: selectedShoe,
    material: selectedMaterial,
    outfitMode,
    tops: mergeText(base.tops, sceneBias.tops),
    bottoms: mergeText(base.bottoms, sceneBias.bottoms),
    outerwear: mergeText(base.outerwear, sceneBias.outerwear),
    bag: mergeText(base.bag, sceneBias.bag),
    accessories: mergeText(base.accessories, sceneBias.accessories),
    fabrics: `${base.fabrics}. ${materialNote}`,
    colorPalette: base.colorPalette,
    stylingSummary: `${base.stylingSummary}. Shoe tone adjustment: ${shoeNote}${manualNote}`,
    unifiedNote:
      "In 3-image mode, use only one unified outfit across all three scenes. The scenes may change, but the tops, bottoms, outerwear, bag, accessories, fabrics, color palette, trouser length, sleeve length, and styling details must remain consistent."
  };
}

export function getSingleImageOutfit(
  selectedScene: string,
  selectedSeason: Season,
  selectedShoe: string,
  selectedMaterial: string,
  outfitMode: OutfitMode = "auto",
  manualOutfitNotes = ""
): OutfitRecommendation {
  const result = getUnifiedOutfitForThreeImageSet(
    [selectedScene],
    selectedSeason,
    selectedShoe,
    selectedMaterial,
    outfitMode,
    manualOutfitNotes
  );
  return {
    ...result,
    unifiedNote: undefined
  };
}
