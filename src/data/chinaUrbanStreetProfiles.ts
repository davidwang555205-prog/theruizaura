export type ChinaCityProfile =
  | "Shanghai"
  | "Chengdu"
  | "Shenzhen"
  | "Hangzhou"
  | "Beijing"
  | "GenericChineseCity";

export type ChinaUrbanStreetProfile = {
  city: ChinaCityProfile;
  cityStreetLine: string;
  boundaryPhrases: string[];
};

export const chinaUrbanStreetProfiles: Record<ChinaCityProfile, ChinaUrbanStreetProfile> = {
  Shanghai: {
    city: "Shanghai",
    cityStreetLine:
      "Use a refined Shanghai-like daily street with plane-tree shadows, narrow sidewalks, muted cafe or boutique storefronts, warm grey pavement, and quiet depth.",
    boundaryPhrases: [
      "skyline landmarks",
      "tourist streets",
      "overly European styling",
      "unreadable storefront signage"
    ]
  },
  Chengdu: {
    city: "Chengdu",
    cityStreetLine:
      "Use a believable Chengdu-like daily street with relaxed tree-lined sidewalks, low-key cafe or bakery entrances, soft greenery, community storefronts, and calm pace.",
    boundaryPhrases: [
      "tourist landmarks",
      "internet-famous shop clutter",
      "crowded scooters",
      "roadside chaos"
    ]
  },
  Shenzhen: {
    city: "Shenzhen",
    cityStreetLine:
      "Use a refined Shenzhen-like daily street with clean sidewalks, light stone pavement, restrained cafe or fitness storefronts, soft greenery, glass-stone textures, and calm rhythm.",
    boundaryPhrases: [
      "skyline icons",
      "tech-park promotional scenery",
      "neon night streets",
      "mall-promo styling"
    ]
  },
  Hangzhou: {
    city: "Hangzhou",
    cityStreetLine:
      "Use a refined Hangzhou-like daily street with tree-lined sidewalks, soft grey stone pavement, calm cafe or bookstore storefronts, subtle greenery, and gentle rhythm.",
    boundaryPhrases: [
      "West Lake tourist scenery",
      "historical costume mood",
      "internet-famous shop clutter",
      "tourist streets"
    ]
  },
  Beijing: {
    city: "Beijing",
    cityStreetLine:
      "Use a believable Beijing-like daily street with broad sidewalks, muted grey-beige textures, restrained cafe or gallery storefronts, soft tree shade, and composed city rhythm.",
    boundaryPhrases: [
      "political landmarks",
      "tourist hutong cliches",
      "CBD skyline icons",
      "heavy crowding"
    ]
  },
  GenericChineseCity: {
    city: "GenericChineseCity",
    cityStreetLine:
      "Use a real Chinese city daily street with clean sidewalks, muted storefronts, subtle greenery, curb lines, distant parked scooters or cars, soft light, and quiet mixed-use textures.",
    boundaryPhrases: [
      "European-looking streets",
      "unreadable Chinese-style signage",
      "crowded traffic",
      "staged city-promo scenery"
    ]
  }
};

export function chooseChinaUrbanStreetLine(city: ChinaCityProfile): ChinaUrbanStreetProfile {
  return chinaUrbanStreetProfiles[city];
}
