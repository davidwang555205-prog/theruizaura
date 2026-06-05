import type { ColorDirection, OutfitStyle } from "./sceneOutfitSeedLibrary";

export type CityOutfitPreference = {
  preferredStyles: OutfitStyle[];
  preferredColorDirections: ColorDirection[];
  itemDirection: string;
};

export const cityOutfitPreferenceMap: Record<string, CityOutfitPreference> = {
  Shanghai: {
    preferredStyles: ["polishedCommuter", "bloggerLite", "darkAnchor", "refinedFeminine"],
    preferredColorDirections: ["darkAnchor", "neutralDaily", "lightClean"],
    itemDirection: "shirts, knitwear, straight trousers, midi skirts, light outerwear, and small shoulder bags"
  },
  Chengdu: {
    preferredStyles: ["relaxedWeekend", "realDaily", "bloggerLite"],
    preferredColorDirections: ["neutralDaily", "denimBased", "softAccent"],
    itemDirection: "denim, Bermuda shorts, open shirts, knitwear, and relaxed bags"
  },
  Shenzhen: {
    preferredStyles: ["cleanMinimal", "softActive", "polishedCommuter"],
    preferredColorDirections: ["lightClean", "neutralDaily", "darkAnchor"],
    itemDirection: "light active pieces, clean trousers, crisp tees, and modern bags"
  },
  Hangzhou: {
    preferredStyles: ["refinedFeminine", "cleanMinimal", "bloggerLite"],
    preferredColorDirections: ["lightClean", "softAccent", "neutralDaily"],
    itemDirection: "skirts, shirt dresses, bookstore-cafe softness, and pale knitwear"
  },
  Beijing: {
    preferredStyles: ["polishedCommuter", "darkAnchor", "cleanMinimal"],
    preferredColorDirections: ["darkAnchor", "neutralDaily", "lightClean"],
    itemDirection: "long trousers, outerwear, gallery or bookstore maturity, and composed city styling"
  },
  GenericChineseCity: {
    preferredStyles: ["realDaily", "cleanMinimal", "bloggerLite"],
    preferredColorDirections: ["neutralDaily", "lightClean", "denimBased"],
    itemDirection: "real daily wardrobe pieces with low-saturation color and practical accessories"
  }
};
