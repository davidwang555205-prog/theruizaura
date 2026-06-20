import type { ColorDirection, OutfitStyle } from "./sceneOutfitSeedLibrary";

export type CityOutfitPreference = {
  preferredStyles: OutfitStyle[];
  preferredColorDirections: ColorDirection[];
  itemDirection: string;
  autumnWinter?: {
    preferredItems: string[];
    preferredColorDirections: ColorDirection[];
    avoidedDirections: string[];
  };
};

export const cityOutfitPreferenceMap: Record<string, CityOutfitPreference> = {
  Shanghai: {
    preferredStyles: ["polishedCommuter", "bloggerLite", "darkAnchor", "refinedFeminine"],
    preferredColorDirections: ["darkAnchor", "neutralDaily", "lightClean"],
    itemDirection: "shirts, knitwear, straight trousers, midi skirts, light outerwear, and small shoulder bags",
    autumnWinter: {
      preferredItems: ["trench coat", "light wool coat", "fine-knit top", "straight trousers", "dark denim", "midi skirt with thin socks"],
      preferredColorDirections: ["darkAnchor", "neutralDaily", "lightClean"],
      avoidedDirections: ["heavy northern winter coat", "puffer-heavy styling", "tourist street winter look"]
    }
  },
  Chengdu: {
    preferredStyles: ["relaxedWeekend", "realDaily", "bloggerLite"],
    preferredColorDirections: ["neutralDaily", "denimBased", "softAccent"],
    itemDirection: "denim trousers or skirts, cotton or twill Bermuda shorts, open shirts, knitwear, and relaxed bags",
    autumnWinter: {
      preferredItems: ["soft cardigan", "relaxed coat", "dark denim", "warm beige trousers", "layered shirt", "light scarf"],
      preferredColorDirections: ["neutralDaily", "denimBased", "darkAnchor", "softAccent"],
      avoidedDirections: ["overly formal winter coat", "thick northern outfit", "hotpot street clutter"]
    }
  },
  Shenzhen: {
    preferredStyles: ["cleanMinimal", "softActive", "polishedCommuter"],
    preferredColorDirections: ["lightClean", "neutralDaily", "darkAnchor"],
    itemDirection: "light active pieces, clean trousers, crisp tees, and modern bags",
    autumnWinter: {
      preferredItems: ["light jacket", "clean long-sleeve top", "knit tee", "cotton jacket", "straight trousers", "light active layer"],
      preferredColorDirections: ["lightClean", "neutralDaily", "darkAnchor"],
      avoidedDirections: ["heavy wool coat", "thick scarf", "cold northern winter mood", "puffer jacket"]
    }
  },
  Hangzhou: {
    preferredStyles: ["refinedFeminine", "cleanMinimal", "bloggerLite"],
    preferredColorDirections: ["lightClean", "softAccent", "neutralDaily"],
    itemDirection: "skirts, shirt dresses, bookstore-cafe softness, and pale knitwear",
    autumnWinter: {
      preferredItems: ["soft cardigan", "light wool jacket", "fine-knit top", "midi skirt", "straight trousers", "calm bookstore-cafe layering"],
      preferredColorDirections: ["lightClean", "softAccent", "neutralDaily", "darkAnchor"],
      avoidedDirections: ["tourist scenic styling", "overly poetic costume", "heavy northern outfit"]
    }
  },
  Beijing: {
    preferredStyles: ["polishedCommuter", "darkAnchor", "cleanMinimal"],
    preferredColorDirections: ["darkAnchor", "neutralDaily", "lightClean"],
    itemDirection: "long trousers, outerwear, gallery or bookstore maturity, and composed city styling",
    autumnWinter: {
      preferredItems: ["wool coat", "cashmere-like knit", "high-neck knit", "charcoal trousers", "dark denim", "structured coat", "soft scarf"],
      preferredColorDirections: ["darkAnchor", "neutralDaily", "lightClean"],
      avoidedDirections: ["thin summer styling", "bare ankle", "overly soft southern outfit", "scenic tourist styling"]
    }
  },
  GenericChineseCity: {
    preferredStyles: ["realDaily", "cleanMinimal", "bloggerLite"],
    preferredColorDirections: ["neutralDaily", "lightClean", "denimBased"],
    itemDirection: "real daily wardrobe pieces with low-saturation color and practical accessories",
    autumnWinter: {
      preferredItems: ["light wool jacket", "trench coat", "fine-knit top", "straight trousers", "dark denim", "soft cardigan"],
      preferredColorDirections: ["neutralDaily", "darkAnchor", "lightClean", "denimBased"],
      avoidedDirections: ["extreme winter outfit", "summer bare styling", "too region-specific outfit"]
    }
  }
};
