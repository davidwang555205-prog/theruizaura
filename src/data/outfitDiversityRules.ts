import type { TeamColorDirection, TeamGarmentType, TeamGarmentTypePreference, TeamOutfitStyle } from "../types";

export type StandardSceneKey =
  | "commute"
  | "cafeExterior"
  | "weekendCityWalk"
  | "boutiqueStreet"
  | "flowerShop"
  | "bakeryDessert"
  | "bookstoreMagazine"
  | "premiumErrands"
  | "hotelTravel"
  | "lightSocial"
  | "galleryExhibition"
  | "cityCorner"
  | "mirrorCloset"
  | "entrywayDeparture"
  | "gymCommute"
  | "gymInterior"
  | "stillLife"
  | "materialTable"
  | "atmosphere";

export const garmentTypePreferenceMap: Record<Exclude<TeamGarmentTypePreference, "自动匹配">, TeamGarmentType> = {
  裤装: "trousers",
  裙装: "skirt",
  短裤: "shorts",
  连衣裙: "dress",
  轻运动: "lightActive"
};

export const sceneOutfitTendencyMap: Partial<
  Record<
    StandardSceneKey,
    {
      preferredStyles: TeamOutfitStyle[];
      preferredGarments: TeamGarmentType[];
      preferredColors: TeamColorDirection[];
    }
  >
> = {
  commute: {
    preferredStyles: ["polishedCommuter", "cleanMinimal", "darkAnchor"],
    preferredGarments: ["trousers", "skirt"],
    preferredColors: ["lightClean", "neutralDaily", "darkAnchor"]
  },
  cafeExterior: {
    preferredStyles: ["bloggerLite", "refinedFeminine", "darkAnchor", "realDaily"],
    preferredGarments: ["trousers", "skirt", "shorts", "dress"],
    preferredColors: ["lightClean", "darkAnchor", "denimBased", "softAccent"]
  },
  weekendCityWalk: {
    preferredStyles: ["relaxedWeekend", "bloggerLite", "realDaily"],
    preferredGarments: ["trousers", "shorts", "dress", "skirt"],
    preferredColors: ["neutralDaily", "denimBased", "darkAnchor", "softAccent"]
  },
  flowerShop: {
    preferredStyles: ["refinedFeminine", "bloggerLite", "relaxedWeekend"],
    preferredGarments: ["skirt", "dress", "trousers"],
    preferredColors: ["lightClean", "softAccent", "neutralDaily"]
  },
  bakeryDessert: {
    preferredStyles: ["realDaily", "bloggerLite", "relaxedWeekend"],
    preferredGarments: ["shorts", "trousers", "dress"],
    preferredColors: ["neutralDaily", "denimBased", "lightClean"]
  },
  bookstoreMagazine: {
    preferredStyles: ["cleanMinimal", "bloggerLite", "refinedFeminine"],
    preferredGarments: ["trousers", "skirt", "dress"],
    preferredColors: ["neutralDaily", "darkAnchor", "softAccent"]
  },
  premiumErrands: {
    preferredStyles: ["realDaily", "polishedCommuter", "bloggerLite"],
    preferredGarments: ["trousers", "shorts", "lightActive"],
    preferredColors: ["neutralDaily", "darkAnchor", "lightClean"]
  },
  mirrorCloset: {
    preferredStyles: ["bloggerLite", "refinedFeminine", "cleanMinimal"],
    preferredGarments: ["trousers", "skirt", "shorts", "dress", "lightActive"],
    preferredColors: ["lightClean", "neutralDaily", "darkAnchor", "softAccent", "denimBased"]
  },
  gymCommute: {
    preferredStyles: ["softActive", "realDaily"],
    preferredGarments: ["lightActive", "shorts", "trousers"],
    preferredColors: ["darkAnchor", "neutralDaily", "lightClean"]
  },
  gymInterior: {
    preferredStyles: ["softActive"],
    preferredGarments: ["lightActive", "shorts", "trousers"],
    preferredColors: ["darkAnchor", "neutralDaily"]
  }
};

export const bloggerLiteDetailsPool = [
  "white shirt as light outer layer",
  "knit draped over shoulders",
  "structured tote",
  "black small shoulder bag",
  "woven bag",
  "canvas tote",
  "subtle optical glasses",
  "understated sunglasses only outdoor",
  "coffee cup",
  "flowers",
  "bakery paper bag",
  "book or magazine",
  "water bottle",
  "slim leather belt",
  "subtle gold earrings",
  "soft cardigan",
  "shirt worn open as a light layer",
  "natural messy bun",
  "relaxed ponytail"
];

export const stylingRealismLines = [
  "Keep styling real and not over-arranged: natural fabric folds, believable layering, one clear visual anchor, and a tasteful outfit-reference feel.",
  "Make the outfit feel grounded, wearable, slightly styled, and naturally photogenic, with restrained accessories and believable daily coordination."
];

export const creatorStylingBoundaryLine =
  "The outfit should feel easy to reference and naturally shareable, while the woman still feels like a real refined urban woman in a quiet daily moment.";

export function getManualGarmentType(preference: TeamGarmentTypePreference): TeamGarmentType | null {
  return preference === "自动匹配" ? null : garmentTypePreferenceMap[preference];
}
