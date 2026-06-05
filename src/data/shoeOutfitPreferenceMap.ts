import type { ColorDirection, OutfitStyle } from "./sceneOutfitSeedLibrary";

export type ShoeOutfitPreference = {
  preferredColorDirections: ColorDirection[];
  preferredScenes: string[];
  avoidedDirections: string[];
  preferredStyles?: OutfitStyle[];
};

export const shoeOutfitPreferenceMap: Record<string, ShoeOutfitPreference> = {
  "Cloud Dancer": {
    preferredColorDirections: ["lightClean", "neutralDaily", "denimBased"],
    preferredScenes: ["commute", "cafeExterior", "weekendCityWalk", "bookstoreMagazine", "boutiqueStreet", "mirrorCloset"],
    avoidedDirections: ["heavy all-black", "strong sports styling"]
  },
  "Sand Dollar": {
    preferredColorDirections: ["lightClean", "neutralDaily", "softAccent"],
    preferredScenes: ["flowerShop", "cafeExterior", "bookstoreMagazine", "hotelTravel", "mirrorCloset"],
    avoidedDirections: ["overly dark", "hard streetwear"]
  },
  Cappuccino: {
    preferredColorDirections: ["neutralDaily", "darkAnchor", "denimBased"],
    preferredScenes: ["cafeExterior", "commute", "weekendCityWalk", "boutiqueStreet"],
    avoidedDirections: ["cold pale styling", "overly sweet"]
  },
  "Silver Romance": {
    preferredColorDirections: ["darkAnchor", "lightClean", "neutralDaily"],
    preferredScenes: ["boutiqueStreet", "galleryExhibition", "mirrorCloset", "cafeExterior"],
    avoidedDirections: ["fragmented color", "sweet-girl styling"]
  },
  Aire: {
    preferredColorDirections: ["lightClean", "neutralDaily", "denimBased"],
    preferredScenes: ["gymCommute", "weekendCityWalk", "commute", "gymInterior"],
    avoidedDirections: ["heavy autumn-winter styling", "formal business styling"],
    preferredStyles: ["softActive", "cleanMinimal", "realDaily"]
  },
  "Delphinium Blue": {
    preferredColorDirections: ["softAccent", "denimBased", "neutralDaily"],
    preferredScenes: ["bookstoreMagazine", "cafeExterior", "weekendCityWalk", "flowerShop"],
    avoidedDirections: ["strong red or green color conflict"]
  },
  Lemon: {
    preferredColorDirections: ["lightClean", "softAccent", "denimBased"],
    preferredScenes: ["cafeExterior", "bakeryDessert", "weekendCityWalk", "flowerShop"],
    avoidedDirections: ["dark mature winter heaviness"]
  },
  "Maple Grove": {
    preferredColorDirections: ["neutralDaily", "darkAnchor", "denimBased"],
    preferredScenes: ["cafeExterior", "commute", "weekendCityWalk"],
    avoidedDirections: ["overly bright", "overly sweet"]
  },
  Oreo: {
    preferredColorDirections: ["darkAnchor", "lightClean", "denimBased"],
    preferredScenes: ["commute", "cafeExterior", "weekendCityWalk", "gymCommute", "mirrorCloset"],
    avoidedDirections: ["overly sweet pink styling"]
  },
  Panda: {
    preferredColorDirections: ["darkAnchor", "lightClean", "denimBased"],
    preferredScenes: ["commute", "cafeExterior", "weekendCityWalk", "boutiqueStreet"],
    avoidedDirections: ["fragmented color", "overly sporty styling"]
  },
  ALL: {
    preferredColorDirections: ["lightClean", "neutralDaily", "denimBased"],
    preferredScenes: ["commute", "weekendCityWalk", "cafeExterior"],
    avoidedDirections: []
  }
};
