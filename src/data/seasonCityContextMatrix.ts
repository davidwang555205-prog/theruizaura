import type { ChinaCityProfile } from "./chinaUrbanStreetProfiles";
import type { LayerWeight } from "./citySeasonClimateProfiles";
import type { SeasonKey } from "./seasonalPhotoStyleProfiles";

export type SeasonCityContext = {
  season: SeasonKey;
  cityProfile: ChinaCityProfile;
  defaultTimeOfDay: string;
  lightLine: string;
  photoMoodLine: string;
  layerWeight: LayerWeight;
  outfitLayerSuggestion: string;
  avoidLine: string;
};

const cityContexts: SeasonCityContext[] = [
  {
    season: "spring",
    cityProfile: "Shanghai",
    defaultTimeOfDay: "late morning or late afternoon",
    lightLine: "Soft spring daylight with plane-tree shadows, clean street reflections, and fresh low-saturation city color.",
    photoMoodLine: "A clean Shanghai spring mood with airy street depth, muted cafe storefronts, gentle greenery, and natural skin tone.",
    layerWeight: "lightLayer",
    outfitLayerSuggestion: "light shirt, fine knit, soft cardigan, straight trousers, denim, or midi skirt with light layering.",
    avoidLine: "Avoid staged cherry blossom mood, tourist spring scenery, overly sweet pastel, and European editorial street styling."
  },
  {
    season: "summer",
    cityProfile: "Shanghai",
    defaultTimeOfDay: "morning or late afternoon",
    lightLine: "Warm-neutral summer street brightness with soft tree shadows, clean cafe storefront light, and no harsh noon sun.",
    photoMoodLine: "A breathable Shanghai summer street mood with refined daily clarity and visible material texture.",
    layerWeight: "lightLayer",
    outfitLayerSuggestion: "clean sleeveless top with light layer, cotton shirt, summer trousers, denim, Bermuda shorts, or midi skirt.",
    avoidLine: "Avoid harsh noon sun, sweaty mood, overexposed pavement, and crowded tourist street feeling."
  },
  {
    season: "autumn",
    cityProfile: "Shanghai",
    defaultTimeOfDay: "late afternoon",
    lightLine: "Warm-neutral autumn light with muted brown-grey city depth, textured pavement, and calm storefront reflections.",
    photoMoodLine: "A refined Shanghai autumn mood with coat-and-knit material texture, old-meets-modern facades, and quiet city warmth.",
    layerWeight: "mediumLayer",
    outfitLayerSuggestion: "trench coat, light wool coat, fine-knit top, straight trousers, dark denim, or midi skirt with thin socks.",
    avoidLine: "Avoid orange filter, heavy vintage mood, staged fallen-leaf cliché, and overly European editorial styling."
  },
  {
    season: "winter",
    cityProfile: "Shanghai",
    defaultTimeOfDay: "early afternoon",
    lightLine: "Cool-neutral humid winter light with soft grey pavement, calm storefront reflections, and gentle shadow structure.",
    photoMoodLine: "A quiet Shanghai winter city mood with restrained layering, soft wool texture, and low-saturation grey-cream depth.",
    layerWeight: "warmLayer",
    outfitLayerSuggestion: "light wool coat, wool-blend jacket, fine knit, straight trousers, dark denim, thin scarf, or midi skirt with socks.",
    avoidLine: "Avoid heavy northern winter outfit, dark gloomy winter, puffer-heavy styling, and exposed summer styling."
  },
  {
    season: "spring",
    cityProfile: "Chengdu",
    defaultTimeOfDay: "late morning or late afternoon",
    lightLine: "Soft spring neighborhood light with muted greenery, relaxed street shadows, and warm low-saturation air.",
    photoMoodLine: "A relaxed Chengdu spring mood with community-commercial storefronts, soft greenery, and calm daily pace.",
    layerWeight: "lightLayer",
    outfitLayerSuggestion: "light shirt, soft cardigan, denim, relaxed trousers, midi skirt, or shirt dress.",
    avoidLine: "Avoid tourist alley mood, overly sweet pastel, staged scenic spring feeling, and colorful internet-famous shops."
  },
  {
    season: "summer",
    cityProfile: "Chengdu",
    defaultTimeOfDay: "morning or late afternoon",
    lightLine: "Humid but clean summer brightness with tree shade, calm street pace, and no sweaty or oily mood.",
    photoMoodLine: "A breathable Chengdu summer lifestyle mood with relaxed cafe or bakery atmosphere and soft natural brightness.",
    layerWeight: "lightLayer",
    outfitLayerSuggestion: "cotton shirt, clean tee, denim, Bermuda shorts, relaxed trousers, light skirt, or dress.",
    avoidLine: "Avoid hotpot-street clutter, sweaty skin, neon summer, beach vacation mood, and roadside chaos."
  },
  {
    season: "autumn",
    cityProfile: "Chengdu",
    defaultTimeOfDay: "late afternoon",
    lightLine: "Soft warm autumn street light with relaxed cafe or bakery atmosphere, textured knit, and muted denim depth.",
    photoMoodLine: "A mild Chengdu autumn mood with soft layering, community street feeling, and calm everyday pace.",
    layerWeight: "mediumLayer",
    outfitLayerSuggestion: "soft cardigan, textured knit, relaxed coat, dark denim, warm beige trousers, layered shirt, or light scarf.",
    avoidLine: "Avoid heavy northern outfit, orange filter, tourist hotpot-street clutter, and overly formal winter coat."
  },
  {
    season: "winter",
    cityProfile: "Chengdu",
    defaultTimeOfDay: "noon or early afternoon",
    lightLine: "Mild muted winter light with soft layered clothing texture, relaxed community street feeling, and no heavy northern coldness.",
    photoMoodLine: "A quiet Chengdu winter mood with warm-neutral fabric depth, relaxed outerwear, and real daily street comfort.",
    layerWeight: "warmLayer",
    outfitLayerSuggestion: "light wool jacket, soft knit cardigan, relaxed coat, dark denim, warm beige trousers, or layered shirt.",
    avoidLine: "Avoid snow-scene cliché, heavy northern winter styling, lifeless grey, and tourist street clutter."
  },
  {
    season: "spring",
    cityProfile: "Shenzhen",
    defaultTimeOfDay: "morning or late afternoon",
    lightLine: "Clean modern spring brightness with soft greenery, light stone pavement, and clear low-saturation color.",
    photoMoodLine: "A fresh Shenzhen spring mood with modern sidewalks, restrained storefronts, and polished daily clarity.",
    layerWeight: "lightLayer",
    outfitLayerSuggestion: "light shirt, clean knit tee, straight trousers, denim, light active layer, or soft cardigan.",
    avoidLine: "Avoid overly poetic spring styling, staged scenic mood, heavy layering, and tourist-coastal imagery."
  },
  {
    season: "summer",
    cityProfile: "Shenzhen",
    defaultTimeOfDay: "morning or early evening",
    lightLine: "Clear bright summer street light with clean shadows, breathable air, modern surfaces, and no harsh heat.",
    photoMoodLine: "A polished Shenzhen summer mood with clean modern sidewalks, restrained cafe or fitness storefronts, and fresh brightness.",
    layerWeight: "lightLayer",
    outfitLayerSuggestion: "clean tee, cotton shirt, clean sleeveless top with light layer, straight trousers, denim, Bermuda shorts, or light active outfit.",
    avoidLine: "Avoid tropical color, neon summer, sweaty mood, harsh noon sun, and beach vacation styling."
  },
  {
    season: "autumn",
    cityProfile: "Shenzhen",
    defaultTimeOfDay: "late afternoon",
    lightLine: "Light warm-neutral autumn city tone with modern sidewalk texture, clean glass-and-stone surfaces, and controlled shadows.",
    photoMoodLine: "A clean Shenzhen autumn mood with light layering, modern community-commercial rhythm, and understated city polish.",
    layerWeight: "lightLayer",
    outfitLayerSuggestion: "light jacket, clean long-sleeve top, knit tee, cotton jacket, straight trousers, denim, or light active layer.",
    avoidLine: "Avoid heavy coat styling, orange filter, northern autumn heaviness, and tech-park promo scenery."
  },
  {
    season: "winter",
    cityProfile: "Shenzhen",
    defaultTimeOfDay: "morning or early afternoon",
    lightLine: "Mild light winter brightness with clean modern surfaces, soft warm-neutral daylight, and no northern cold mood.",
    photoMoodLine: "A light Shenzhen winter mood with thin layering, breathable urban clarity, and restrained modern styling.",
    layerWeight: "lightLayer",
    outfitLayerSuggestion: "light jacket, clean knit tee, thin cardigan, cotton jacket, straight trousers, denim, or light active layer.",
    avoidLine: "Avoid heavy wool coat, thick scarf, puffer jacket, snow-scene cliché, and cold northern winter styling."
  },
  {
    season: "spring",
    cityProfile: "Hangzhou",
    defaultTimeOfDay: "late morning",
    lightLine: "Gentle spring daylight with soft grey stone, calm cafe or bookstore light, and restrained greenery.",
    photoMoodLine: "A soft Hangzhou spring mood with quiet cultural street atmosphere, fresh low-saturation color, and calm air.",
    layerWeight: "lightLayer",
    outfitLayerSuggestion: "soft cardigan, light shirt, fine knit, midi skirt, straight trousers, denim, or shirt dress.",
    avoidLine: "Avoid scenic tourist mood, staged cherry blossom feeling, overly poetic costume styling, and sugary filter."
  },
  {
    season: "summer",
    cityProfile: "Hangzhou",
    defaultTimeOfDay: "late afternoon",
    lightLine: "Soft summer tree shade with clean humid brightness, grey stone texture, and relaxed cultural street atmosphere.",
    photoMoodLine: "A breathable Hangzhou summer mood with calm cafe/bookstore storefronts, subtle greenery, and gentle daily clarity.",
    layerWeight: "lightLayer",
    outfitLayerSuggestion: "clean tee, light shirt, denim, Bermuda shorts, midi skirt, dress, or thin cardigan.",
    avoidLine: "Avoid high-saturation summer color, tourist scenic streets, harsh noon sun, and overexposed pavement."
  },
  {
    season: "autumn",
    cityProfile: "Hangzhou",
    defaultTimeOfDay: "afternoon",
    lightLine: "Gentle warm-grey autumn light with bookstore or cafe texture, muted knit and skirt material, and soft street shadows.",
    photoMoodLine: "A refined Hangzhou autumn mood with calm cultural street depth, soft cardigan texture, and low-saturation warmth.",
    layerWeight: "mediumLayer",
    outfitLayerSuggestion: "soft cardigan, light wool jacket, fine-knit top, midi skirt, straight trousers, dark denim, or thin scarf.",
    avoidLine: "Avoid heavy vintage filter, staged fallen-leaf cliché, scenic-tourist feeling, and overly poetic staging."
  },
  {
    season: "winter",
    cityProfile: "Hangzhou",
    defaultTimeOfDay: "early afternoon",
    lightLine: "Cool soft grey winter light with calm cardigan and coat texture, quiet city mood, and no scenic-tourist feeling.",
    photoMoodLine: "A quiet Hangzhou winter mood with cool-neutral softness, light wool layering, and gentle grey-cream depth.",
    layerWeight: "warmLayer",
    outfitLayerSuggestion: "light wool coat, soft cardigan, fine knit, straight trousers, dark denim, midi skirt with thin socks, or wool-blend jacket.",
    avoidLine: "Avoid dark gloomy winter, heavy northern outfit, snow-scene cliché, and tourist scenic styling."
  },
  {
    season: "spring",
    cityProfile: "Beijing",
    defaultTimeOfDay: "morning or afternoon",
    lightLine: "Dry clean spring daylight with broader sidewalk shadows, restrained fresh city color, and clear urban structure.",
    photoMoodLine: "A composed Beijing spring mood with mature city rhythm, clean air, and soft but structured natural light.",
    layerWeight: "mediumLayer",
    outfitLayerSuggestion: "light jacket, crisp shirt, fine knit, tailored trousers, dark denim, or structured cardigan.",
    avoidLine: "Avoid tourist landmark mood, overly sweet spring styling, staged scenic street, and political or monumental imagery."
  },
  {
    season: "summer",
    cityProfile: "Beijing",
    defaultTimeOfDay: "morning or late afternoon",
    lightLine: "Clear bright summer urban light with controlled shadows, dry clean air, and no harsh tourist street mood.",
    photoMoodLine: "A restrained Beijing summer mood with clean city depth, mature daily rhythm, and real street brightness.",
    layerWeight: "lightLayer",
    outfitLayerSuggestion: "clean shirt, lightweight trousers, denim, structured tee, light jacket for morning, or refined shorts when appropriate.",
    avoidLine: "Avoid harsh noon sun, sweaty mood, tourist landmark background, neon summer, and crowded commercial streets."
  },
  {
    season: "autumn",
    cityProfile: "Beijing",
    defaultTimeOfDay: "late afternoon",
    lightLine: "Dry warm-neutral autumn light with structured city depth, coat and knit texture, and mature urban rhythm.",
    photoMoodLine: "A refined Beijing autumn mood with calm architectural shadows, wool texture, charcoal-beige depth, and composed city warmth.",
    layerWeight: "warmLayer",
    outfitLayerSuggestion: "wool-blend jacket, fine knit, high-neck knit, tailored trousers, charcoal trousers, dark denim, structured coat, or soft scarf.",
    avoidLine: "Avoid orange filter, heavy retro mood, tourist hutong cliché, and staged fallen-leaf seasonal decoration."
  },
  {
    season: "winter",
    cityProfile: "Beijing",
    defaultTimeOfDay: "noon or early afternoon",
    lightLine: "Cool-neutral dry winter light with calm architectural shadows, wool texture, charcoal and cream depth, and no dark gloom.",
    photoMoodLine: "A composed Beijing winter mood with structured outerwear, warm fabric texture, dry clean air, and quiet urban depth.",
    layerWeight: "coldLayer",
    outfitLayerSuggestion: "wool coat, cashmere-like knit, high-neck knit, charcoal wool trousers, dark denim, structured outerwear, soft scarf, or tailored trousers.",
    avoidLine: "Avoid thin summer styling, bare ankle, lifeless grey, snow-scene cliché, heavy tourist landmark mood, and overly soft southern outfit."
  },
  {
    season: "spring",
    cityProfile: "GenericChineseCity",
    defaultTimeOfDay: "late morning or afternoon",
    lightLine: "Clean soft spring daylight with low-saturation greenery, realistic street freshness, and gentle shadows.",
    photoMoodLine: "A balanced Chinese city spring mood with clean daily air, muted storefronts, and soft low-saturation freshness.",
    layerWeight: "lightLayer",
    outfitLayerSuggestion: "light shirt, fine knit, cardigan, straight trousers, denim, midi skirt, or dress.",
    avoidLine: "Avoid staged spring scenery, sugary filter, overly sweet pastel, and tourist mood."
  },
  {
    season: "summer",
    cityProfile: "GenericChineseCity",
    defaultTimeOfDay: "morning or late afternoon",
    lightLine: "Bright breathable daylight with soft street shadows, warm-neutral color, and realistic daily clarity.",
    photoMoodLine: "A balanced Chinese city summer mood with clean sidewalks, muted storefronts, and breathable daily brightness.",
    layerWeight: "lightLayer",
    outfitLayerSuggestion: "cotton shirt, clean tee, clean sleeveless top with light layer, trousers, denim, Bermuda shorts, or light dress.",
    avoidLine: "Avoid harsh noon sun, tropical color, sweaty mood, neon summer, and overexposed pavement."
  },
  {
    season: "autumn",
    cityProfile: "GenericChineseCity",
    defaultTimeOfDay: "late afternoon",
    lightLine: "Warm-neutral textured light with muted brown-grey depth, calm daily city mood, and soft material shadows.",
    photoMoodLine: "A balanced Chinese city autumn mood with knit texture, restrained layering, and quiet street warmth.",
    layerWeight: "mediumLayer",
    outfitLayerSuggestion: "light wool jacket, trench coat, fine-knit top, straight trousers, dark denim, soft cardigan, or midi skirt.",
    avoidLine: "Avoid orange filter, heavy vintage, staged fallen-leaf cliché, and overly dramatic autumn mood."
  },
  {
    season: "winter",
    cityProfile: "GenericChineseCity",
    defaultTimeOfDay: "noon or early afternoon",
    lightLine: "Cool-neutral soft daylight with layered fabric texture, calm grey-cream city tone, and clean shadow structure.",
    photoMoodLine: "A balanced Chinese city winter mood with restrained warmth, practical layering, and quiet daily atmosphere.",
    layerWeight: "warmLayer",
    outfitLayerSuggestion: "light wool jacket, wool-blend coat, fine-knit top, straight trousers, dark denim, soft cardigan, or thin scarf.",
    avoidLine: "Avoid extreme winter outfit, thin summer styling, lifeless grey, snow-scene cliché, and overly region-specific styling."
  }
];

export const seasonCityContextMatrix: Record<SeasonKey, Record<ChinaCityProfile, SeasonCityContext>> =
  cityContexts.reduce((matrix, context) => {
    matrix[context.season] ??= {} as Record<ChinaCityProfile, SeasonCityContext>;
    matrix[context.season][context.cityProfile] = context;
    return matrix;
  }, {} as Record<SeasonKey, Record<ChinaCityProfile, SeasonCityContext>>);

export function getSeasonCityContext(season: SeasonKey, cityProfile: ChinaCityProfile | null | undefined) {
  return seasonCityContextMatrix[season][cityProfile ?? "GenericChineseCity"];
}
