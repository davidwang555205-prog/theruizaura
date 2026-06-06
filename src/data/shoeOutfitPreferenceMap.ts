import type { ColorDirection, OutfitStyle } from "./sceneOutfitSeedLibrary";

export type ShoeOutfitPreference = {
  preferredColorDirections: ColorDirection[];
  preferredScenes: string[];
  avoidedDirections: string[];
  preferredStyles?: OutfitStyle[];
  autumnWinter?: {
    preferredItems: string[];
    avoidedDirections: string[];
    lightWinterOnly?: boolean;
  };
};

export const shoeOutfitPreferenceMap: Record<string, ShoeOutfitPreference> = {
  "Cloud Dancer": {
    preferredColorDirections: ["lightClean", "neutralDaily", "denimBased"],
    preferredScenes: ["commute", "cafeExterior", "weekendCityWalk", "bookstoreMagazine", "boutiqueStreet", "mirrorCloset"],
    avoidedDirections: ["heavy all-black", "strong sports styling"],
    autumnWinter: {
      preferredItems: ["cream coat", "grey trousers", "dark denim", "camel jacket", "soft knit"],
      avoidedDirections: ["overly heavy all-black", "thick athletic sole mood"]
    }
  },
  "Sand Dollar": {
    preferredColorDirections: ["lightClean", "neutralDaily", "softAccent"],
    preferredScenes: ["flowerShop", "cafeExterior", "bookstoreMagazine", "hotelTravel", "mirrorCloset"],
    avoidedDirections: ["overly dark", "hard streetwear"],
    autumnWinter: {
      preferredItems: ["light wool coat", "oatmeal knit", "soft grey midi skirt", "warm beige trousers"],
      avoidedDirections: ["overly dark", "too hard", "streetwear-heavy"]
    }
  },
  Cappuccino: {
    preferredColorDirections: ["neutralDaily", "darkAnchor", "denimBased"],
    preferredScenes: ["cafeExterior", "commute", "weekendCityWalk", "boutiqueStreet"],
    avoidedDirections: ["cold pale styling", "overly sweet"],
    autumnWinter: {
      preferredItems: ["camel coat", "dark coffee knit", "denim", "taupe trousers", "warm beige coat"],
      avoidedDirections: ["cold pale styling", "sweet-girl mood"]
    }
  },
  "Silver Romance": {
    preferredColorDirections: ["darkAnchor", "lightClean", "neutralDaily"],
    preferredScenes: ["boutiqueStreet", "galleryExhibition", "mirrorCloset", "cafeExterior"],
    avoidedDirections: ["fragmented color", "sweet-girl styling"],
    autumnWinter: {
      preferredItems: ["black knit", "charcoal trousers", "cream coat", "grey wool jacket", "city evening light but not night mood"],
      avoidedDirections: ["sweet floral color", "cheap shiny metallic mood"]
    }
  },
  Aire: {
    preferredColorDirections: ["lightClean", "neutralDaily", "denimBased"],
    preferredScenes: ["gymCommute", "weekendCityWalk", "commute", "gymInterior"],
    avoidedDirections: ["heavy autumn-winter styling", "formal business styling"],
    preferredStyles: ["softActive", "cleanMinimal", "realDaily"],
    autumnWinter: {
      preferredItems: ["light jacket", "clean long-sleeve top", "jogger-style trousers", "denim"],
      avoidedDirections: ["heavy winter clothing", "northern severe-winter mood"],
      lightWinterOnly: true
    }
  },
  "Delphinium Blue": {
    preferredColorDirections: ["softAccent", "denimBased", "neutralDaily"],
    preferredScenes: ["bookstoreMagazine", "cafeExterior", "weekendCityWalk", "flowerShop"],
    avoidedDirections: ["strong red or green color conflict"],
    autumnWinter: {
      preferredItems: ["grey-blue knit", "navy cardigan", "soft grey trousers", "denim", "cream jacket"],
      avoidedDirections: ["strong red or green color conflict"]
    }
  },
  Lemon: {
    preferredColorDirections: ["lightClean", "softAccent", "denimBased"],
    preferredScenes: ["cafeExterior", "bakeryDessert", "weekendCityWalk", "flowerShop"],
    avoidedDirections: ["dark mature winter heaviness"],
    autumnWinter: {
      preferredItems: ["cream knit", "soft grey trousers", "denim", "light jacket"],
      avoidedDirections: ["heavy deep-winter styling", "too bright yellow contrast"],
      lightWinterOnly: true
    }
  },
  "Maple Grove": {
    preferredColorDirections: ["neutralDaily", "darkAnchor", "denimBased"],
    preferredScenes: ["cafeExterior", "commute", "weekendCityWalk"],
    avoidedDirections: ["overly bright", "overly sweet"],
    autumnWinter: {
      preferredItems: ["camel coat", "dark denim", "brown knit", "taupe trousers", "warm neutral layering"],
      avoidedDirections: ["overly sweet", "overly bright"]
    }
  },
  Oreo: {
    preferredColorDirections: ["darkAnchor", "lightClean", "denimBased"],
    preferredScenes: ["commute", "cafeExterior", "weekendCityWalk", "gymCommute", "mirrorCloset"],
    avoidedDirections: ["overly sweet pink styling"],
    autumnWinter: {
      preferredItems: ["black knit", "cream coat", "charcoal trousers", "denim", "light active layer"],
      avoidedDirections: ["overly pink", "overly sweet"]
    }
  },
  Panda: {
    preferredColorDirections: ["darkAnchor", "lightClean", "denimBased"],
    preferredScenes: ["commute", "cafeExterior", "weekendCityWalk", "boutiqueStreet"],
    avoidedDirections: ["fragmented color", "overly sporty styling"],
    autumnWinter: {
      preferredItems: ["black-white contrast", "grey trousers", "dark denim", "clean coat", "structured jacket"],
      avoidedDirections: ["fragmented color", "sports advertising mood"]
    }
  },
  ALL: {
    preferredColorDirections: ["lightClean", "neutralDaily", "denimBased"],
    preferredScenes: ["commute", "weekendCityWalk", "cafeExterior"],
    avoidedDirections: []
  }
};
