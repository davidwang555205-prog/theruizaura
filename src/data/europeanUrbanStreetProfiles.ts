import type { TeamSeason } from "../types";

export type EuropeanStreetProfileKey =
  | "Paris"
  | "Italy"
  | "Florence"
  | "Austria"
  | "Monaco"
  | "Spain";

export type EuropeanUrbanStreetProfile = {
  city: EuropeanStreetProfileKey;
  cityStreetLine: string;
  boundaryPhrases: string[];
};

export const europeanUrbanStreetProfiles: Record<EuropeanStreetProfileKey, EuropeanUrbanStreetProfile> = {
  Paris: {
    city: "Paris",
    cityStreetLine:
      "Use a real contemporary Paris side street with pale limestone facades, correctly scaled cafe frontage, lightly worn pavement, restrained balconies, subtle daily pedestrians, and no landmark view.",
    boundaryPhrases: ["Eiffel Tower", "postcard boulevard", "fake French signage", "luxury fashion-set street"]
  },
  Italy: {
    city: "Italy",
    cityStreetLine:
      "Use a believable contemporary Italian city street with warm plaster, aged stone pavement, modest neighborhood storefronts, natural scooters only when appropriate, and quiet local daily rhythm.",
    boundaryPhrases: ["Roman landmark", "Venice canal cliche", "tourist piazza", "staged Italian restaurant set"]
  },
  Florence: {
    city: "Florence",
    cityStreetLine:
      "Use a lived-in Florence neighborhood street with warm stone walls, muted shutters, narrow realistic pavement, restrained artisan or cafe frontage, soft depth, and no major monument view.",
    boundaryPhrases: ["Duomo landmark", "Renaissance costume", "tourist crowd", "postcard old-town perfection"]
  },
  Austria: {
    city: "Austria",
    cityStreetLine:
      "Use a believable Austrian city street with pale stucco facades, clean but gently worn stone sidewalks, restrained cafe windows, orderly street depth, and subtle everyday movement.",
    boundaryPhrases: ["palace landmark", "alpine village cliche", "Christmas-market staging", "imperial costume mood"]
  },
  Monaco: {
    city: "Monaco",
    cityStreetLine:
      "Use a quiet Monaco side street with pale stone, refined apartment facades, restrained Mediterranean greenery, realistic slope and pavement, subtle local movement, and no status-display spectacle.",
    boundaryPhrases: ["supercar display", "casino landmark", "yacht showcase", "luxury bragging backdrop"]
  },
  Spain: {
    city: "Spain",
    cityStreetLine:
      "Use a believable Spanish city street with warm stone or plaster facades, tree shadows, restrained balconies, realistic neighborhood storefronts, lightly worn pavement, and relaxed daily depth.",
    boundaryPhrases: ["tourist plaza", "flamenco cliche", "Gaudi landmark", "bright souvenir-street styling"]
  }
};

const europeanSeasonContext: Record<
  TeamSeason,
  { lightLine: string; photoStyleLine: string; moodLine: string; outfitLayerLine: string; negativeLine: string }
> = {
  春: {
    lightLine: "Mild European spring daylight with soft facade shadows, fresh but restrained color, and believable street brightness.",
    photoStyleLine: "Use a natural European spring street-photo feeling with soft daylight, real surface texture, and quiet local daily life.",
    moodLine: "A refined spring street mood with light layering, lived-in architecture, and calm neighborhood rhythm.",
    outfitLayerLine: "Use mild spring layering such as a light trench, cotton jacket, fine shirt layer, straight trousers, denim, or a controlled skirt.",
    negativeLine: "tourist postcard color, staged flower display, landmark-focused composition, fake European signage"
  },
  夏: {
    lightLine: "Warm European summer daylight with soft directional shadows, breathable brightness, natural facade color, and no harsh tourist glare.",
    photoStyleLine: "Use a realistic European summer street-photo feeling with breathable fabric, natural skin tone, subtle pavement warmth, and quiet daily movement.",
    moodLine: "A relaxed summer street mood with breathable styling, restrained storefront detail, and authentic neighborhood depth.",
    outfitLayerLine: "Use breathable summer clothing such as cotton poplin, linen blend, light trousers, refined Bermuda shorts, a controlled skirt, or a shirt dress.",
    negativeLine: "harsh vacation glare, resort styling, crowded tourism scene, oversaturated Mediterranean filter"
  },
  秋: {
    lightLine: "Textured European autumn daylight with warm-neutral facade shadows, muted pavement depth, and natural seasonal softness.",
    photoStyleLine: "Use a realistic European autumn street-photo feeling with tactile layers, restrained color, real stone texture, and no cinematic orange filter.",
    moodLine: "A calm autumn street mood with refined layering, softly weathered architecture, and believable local movement.",
    outfitLayerLine: "Use refined autumn layering such as a trench, light wool jacket, fine-gauge top, straight trousers, dark denim, or a controlled midi skirt.",
    negativeLine: "orange cinematic filter, staged fallen leaves, heritage-costume styling, tourist old-town fantasy"
  },
  冬: {
    lightLine: "Soft European winter daylight with clean cool-neutral shadows, realistic facade depth, and quiet seasonal clarity without snow-scene drama.",
    photoStyleLine: "Use a natural European winter street-photo feeling with believable warm layers, real skin tone, tactile materials, and restrained city color.",
    moodLine: "A composed winter street mood with practical warmth, calm architecture, and everyday local rhythm.",
    outfitLayerLine: "Use region-appropriate winter layering such as a clean wool coat, compact warm jacket, fine knit, straight trousers, dark denim, or a controlled skirt with socks.",
    negativeLine: "Christmas-market staging, dramatic snow scene, oversized coat hiding sneakers, tourist winter postcard"
  }
};

export function getEuropeanUrbanStreetProfile(city: EuropeanStreetProfileKey) {
  return europeanUrbanStreetProfiles[city];
}

export function getEuropeanSeasonContext(season: TeamSeason) {
  return europeanSeasonContext[season];
}
