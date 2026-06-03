import type { StandardSceneKey } from "./outfitDiversityRules";
import type { ChinaCityProfile } from "./chinaUrbanStreetProfiles";

export const sceneToCityPriorityMap: Partial<Record<StandardSceneKey, ChinaCityProfile[]>> = {
  commute: ["Shanghai", "Beijing", "Shenzhen", "GenericChineseCity"],
  weekendCityWalk: ["Chengdu", "Hangzhou", "Shanghai", "GenericChineseCity"],
  cafeExterior: ["Shanghai", "Hangzhou", "Chengdu", "Shenzhen", "GenericChineseCity"],
  boutiqueStreet: ["Shanghai", "Beijing", "Shenzhen", "Hangzhou", "GenericChineseCity"],
  flowerShop: ["Hangzhou", "Chengdu", "Shanghai", "GenericChineseCity"],
  bakeryDessert: ["Chengdu", "Hangzhou", "Shanghai", "Shenzhen", "GenericChineseCity"],
  bookstoreMagazine: ["Hangzhou", "Beijing", "Shanghai", "GenericChineseCity"],
  premiumErrands: ["Shenzhen", "Chengdu", "Shanghai", "GenericChineseCity"],
  hotelTravel: ["Shanghai", "Beijing", "Shenzhen", "Hangzhou", "GenericChineseCity"],
  lightSocial: ["Shanghai", "Hangzhou", "Chengdu", "Beijing", "GenericChineseCity"],
  galleryExhibition: ["Beijing", "Shanghai", "Hangzhou", "GenericChineseCity"],
  cityCorner: ["Shanghai", "Beijing", "Chengdu", "Shenzhen", "GenericChineseCity"],
  entrywayDeparture: ["Shanghai", "Chengdu", "Shenzhen"],
  gymCommute: ["Shenzhen", "Chengdu", "Shanghai", "GenericChineseCity"]
};
