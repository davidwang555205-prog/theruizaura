import type { StandardSceneKey } from "./outfitDiversityRules";

export type LightingSpaceType =
  | "outdoorStreet"
  | "indoorNaturalLight"
  | "indoorCommercialLight"
  | "indoorGymLight"
  | "studioLaunchLight"
  | "stillLifeStudioNatural"
  | "semiIndoorThreshold";

export type LightingSpaceProfile = {
  lightingSpaceType: LightingSpaceType;
  lightingSourceType: string;
  indoorOutdoorLightLine: string;
  lightingNegativeLine: string;
  spaceSupportLine: string;
};

export const sceneLightingSpaceProfiles: Record<LightingSpaceType, LightingSpaceProfile> = {
  outdoorStreet: {
    lightingSpaceType: "outdoorStreet",
    lightingSourceType: "outdoor natural street light",
    indoorOutdoorLightLine:
      "Use outdoor natural street light that matches the season and city: soft real daylight, believable street shadows, natural pavement reflection, clean air depth, and no studio lighting. Keep the light directional but gentle, with the sneakers and stance and foot placement clearly readable.",
    lightingNegativeLine:
      "studio softbox look, indoor window-only light, harsh noon sun, night street light unless user requests night, fake cinematic backlight",
    spaceSupportLine:
      "The scene should read as a real outdoor daily street or storefront threshold, with believable pavement, depth, and no indoor-only window light."
  },
  indoorNaturalLight: {
    lightingSpaceType: "indoorNaturalLight",
    lightingSourceType: "soft indoor natural window light",
    indoorOutdoorLightLine:
      "Use soft indoor natural window light with believable room depth, gentle shadows on the floor, natural mirror or wall reflection, and warm-neutral brightness. The light should feel like a real daily indoor outfit record, not studio or exterior lighting.",
    lightingNegativeLine:
      "exterior shadows inside room, hard flash, posed selfie lighting, studio backdrop, overexposed mirror glare, long-leg mirror distortion",
    spaceSupportLine:
      "The room should feel naturally lit from a real window or soft ambient source, with no exterior shadows projected into the interior."
  },
  indoorCommercialLight: {
    lightingSpaceType: "indoorCommercialLight",
    lightingSourceType: "believable indoor commercial ambient light",
    indoorOutdoorLightLine:
      "Use believable indoor commercial light mixed with soft natural spill: clean ambient lighting, subtle storefront or shelf depth, realistic reflections, controlled highlights, and no harsh showroom glare. Keep the scene real, low-noise, and secondary to the outfit and sneakers.",
    lightingNegativeLine:
      "mall lighting overload, unreal fluorescent glare, unreadable label clutter, luxury ad lighting, nightclub lighting, random neon",
    spaceSupportLine:
      "Keep interior shelves, counters, signage, and labels quiet and unreadable, with low-noise depth that supports the outfit and sneakers."
  },
  indoorGymLight: {
    lightingSpaceType: "indoorGymLight",
    lightingSourceType: "clean premium gym lighting",
    indoorOutdoorLightLine:
      "Use clean premium gym lighting with controlled overhead softness, warm grey flooring, muted equipment reflections, believable training-space depth, and no sports-brand campaign lighting. Keep skin and fabric texture natural, with the sneakers clearly readable.",
    lightingNegativeLine:
      "hard commercial sports ad lighting, sweaty dramatic light, neon gym light, bodybuilding stage light, glossy equipment glare, dark fitness influencer mood",
    spaceSupportLine:
      "The gym should feel like a muted premium daily space, not a sports advertisement, bodybuilding set, or glossy influencer gym."
  },
  studioLaunchLight: {
    lightingSpaceType: "studioLaunchLight",
    lightingSourceType: "soft directional launch-studio light",
    indoorOutdoorLightLine:
      "Use a real indoor professional studio lighting setup with controlled directional illumination, believable fill, accurate material color, and grounded contact shadows.",
    lightingNegativeLine:
      "flat catalog flash, hard beauty light, blown white background, glossy showroom glare, colored nightclub light, synthetic CGI studio light, floating contact shadows",
    spaceSupportLine:
      "Use a restrained warm-white, cream, or soft-stone seamless studio with believable floor contact, modest equipment traces only when appropriate, and enough negative space for a polished new-launch image."
  },
  stillLifeStudioNatural: {
    lightingSpaceType: "stillLifeStudioNatural",
    lightingSourceType: "soft natural product photography light",
    indoorOutdoorLightLine:
      "Use real product photography light: soft natural side light or large diffused window light, gentle contact shadows, realistic material texture, clean product scale, and no CGI render feeling. The sneakers must remain the clear subject.",
    lightingNegativeLine:
      "synthetic 3D render light, glossy ad shine, floating product, harsh flash, heavy shadow, excessive reflection",
    spaceSupportLine:
      "Use a still-life product setup with real surface contact, material scale, and no person accessories competing with the shoe."
  },
  semiIndoorThreshold: {
    lightingSpaceType: "semiIndoorThreshold",
    lightingSourceType: "storefront threshold daylight",
    indoorOutdoorLightLine:
      "Use threshold lighting at a real storefront or doorway: soft outdoor daylight from the street, subtle interior depth behind glass or the entrance, gentle shadow transition near the door, and believable reflections. The light should connect indoor and outdoor space naturally without looking like a studio composite.",
    lightingNegativeLine:
      "flat pasted background, unreal doorway light, indoor light fighting outdoor light, harsh backlight, unreadable signage, reflections covering shoes",
    spaceSupportLine:
      "The doorway or storefront should connect indoor and outdoor space naturally, with reflections and shadows that do not cover the sneakers."
  }
};

export const outdoorStreetSceneKeys: StandardSceneKey[] = [
  "commute",
  "cafeExterior",
  "weekendCityWalk",
  "boutiqueStreet",
  "flowerShop",
  "bakeryDessert",
  "bookstoreMagazine",
  "premiumErrands",
  "gymCommute",
  "cityCorner"
];

export const indoorCommercialSceneKeys: StandardSceneKey[] = [
  "lightSocial",
  "bookstoreMagazine",
  "premiumErrands",
  "boutiqueStreet",
  "cafeExterior",
  "bakeryDessert",
  "galleryExhibition"
];

export const semiIndoorSceneKeys: StandardSceneKey[] = [
  "cafeExterior",
  "boutiqueStreet",
  "flowerShop",
  "bakeryDessert",
  "hotelTravel",
  "entrywayDeparture"
];
