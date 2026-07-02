import type { TeamImageType, TeamScenePreference, TeamSeason } from "../types";
import type { ChinaCityProfile } from "../data/chinaUrbanStreetProfiles";
import type { LayerWeight } from "../data/citySeasonClimateProfiles";
import { getSeasonCityContext } from "../data/seasonCityContextMatrix";
import { seasonalPhotoStyleProfiles, type SeasonKey } from "../data/seasonalPhotoStyleProfiles";
import type { StandardSceneKey } from "../data/outfitDiversityRules";
import type { LightingSpaceType } from "../data/sceneLightingSpaceProfiles";
import { auraOutdoorReferenceSeasonalToneLine } from "../data/photoToneProfiles";
import { chooseLightingSpaceType } from "./chooseLightingSpaceType";
import { chooseSeasonalPhotoStyleLine } from "./chooseSeasonalPhotoStyleLine";
import { chooseSeasonClimateOutfitLayer } from "./chooseSeasonClimateOutfitLayer";

export type SeasonCityVisualContext = {
  timeOfDay: string;
  seasonalLightLine: string;
  seasonalPhotoStyleLine: string;
  citySeasonMoodLine: string;
  climateProfile: string;
  layerWeight: LayerWeight;
  outfitLayerLine: string;
  preferredMaterials: string[];
  forbiddenSeasonItems: string[];
  seasonalNegativeLine: string;
  lightingSpaceType: LightingSpaceType;
  lightingSourceType: string;
  indoorOutdoorLightLine: string;
  lightingNegativeLine: string;
  lightingSpaceSupportLine: string;
};

const seasonMap: Record<TeamSeason, SeasonKey> = {
  春: "spring",
  夏: "summer",
  秋: "autumn",
  冬: "winter"
};

const climateNegativeLine =
  "wrong-season outfit, summer outfit in cold winter, heavy northern coat in warm southern city, bare ankle in Beijing winter, puffer-heavy styling, snow boots, hiking outfit, ski wear, fur-heavy luxury styling, oversized coat covering shoes, trouser hem swallowing sneakers, collapsed sneaker collar, vague sneaker collar wording, generic trouser wording";

const stillLifeSeasonLines: Record<SeasonKey, string> = {
  spring:
    "Use soft daylight, a fresh low-saturation surface, and restrained light greenery only if it supports the product.",
  summer:
    "Use clean bright product light, a warm-neutral surface, crisp material texture, and no harsh overexposure.",
  autumn:
    "Use a warmer stone or fabric surface, deeper material texture, muted brown-grey background, and quiet seasonal depth.",
  winter:
    "Use cool-neutral soft light, grey stone or wool texture, calm shadow structure, and restrained product depth."
};

const indoorSeasonLines: Record<SeasonKey, { lightLine: string; photoStyleLine: string; moodLine: string }> = {
  spring: {
    lightLine: "Soft spring indoor daylight with airy brightness, pale neutral surfaces, gentle room shadows, and no misplaced exterior shadow pattern.",
    photoStyleLine:
      "Use a clean spring indoor photo style with soft daylight, fresh low-saturation color, light fabric texture, natural skin tone, and quiet airy warmth.",
    moodLine:
      "A calm spring indoor mood with warm neutral depth, soft wardrobe or room details, and fresh daily ease."
  },
  summer: {
    lightLine: "Breathable summer indoor daylight with warm-neutral brightness, soft window or ambient shadows, clear fabric texture, and no harsh reflective glare.",
    photoStyleLine:
      "Use a breathable summer indoor photo style with clean natural brightness, warm-neutral whites, linen or cotton texture, and a fresh daily feeling without harsh sun.",
    moodLine:
      "A light summer indoor mood with breathable texture, clean room depth, and relaxed daily clarity."
  },
  autumn: {
    lightLine: "Warm-muted autumn indoor light with tactile fabric shadows, calm room depth, soft brown-grey neutrals, and no staged seasonal decoration.",
    photoStyleLine:
      "Use a textured autumn indoor photo style with warm-neutral natural light, gentle contrast, deeper fabric texture, muted brown-grey color depth, and calm softness.",
    moodLine:
      "A refined autumn indoor mood with tactile layers, quiet room details, and low-saturation warmth."
  },
  winter: {
    lightLine: "Soft winter indoor daylight with quiet shadows, warm-neutral clarity, thicker fabric texture, cream-grey depth, and no gloomy cold filter.",
    photoStyleLine:
      "Use a quiet winter indoor photo style with soft daylight, calm shadow structure, clean neutral depth, thicker fabric texture, and composed daily warmth.",
    moodLine:
      "A composed winter indoor mood with restrained warmth, orderly room details, and soft cream-grey depth."
  }
};

function usesIndoorSeasonContext(lightingSpaceType: LightingSpaceType) {
  return (
    lightingSpaceType === "indoorNaturalLight" ||
    lightingSpaceType === "indoorCommercialLight" ||
    lightingSpaceType === "indoorGymLight" ||
    lightingSpaceType === "studioLaunchLight"
  );
}

function shouldUseUnifiedOutdoorReferenceTone(input: {
  imageType: TeamImageType;
  sceneKey: StandardSceneKey;
  lightingSpaceType: LightingSpaceType;
  productOrMaterialDetail: boolean;
}) {
  if (input.productOrMaterialDetail) return false;
  if (
    input.imageType !== "产品上脚图" &&
    input.imageType !== "对镜穿搭图" &&
    input.imageType !== "生活场景图"
  ) {
    return false;
  }
  if (input.sceneKey === "studioLaunch" || input.lightingSpaceType === "studioLaunchLight") return false;
  if (input.sceneKey === "gymInterior" || input.sceneKey === "gymCommute" || input.lightingSpaceType === "indoorGymLight") {
    return false;
  }

  return true;
}

function getShoeSeasonNegative(input: {
  season: SeasonKey;
  cityProfile: ChinaCityProfile | null | undefined;
  sceneKey: StandardSceneKey;
  selectedShoe: string;
}) {
  if (input.season !== "autumn" && input.season !== "winter") return "";
  if (!/Aire|Lemon/i.test(input.selectedShoe)) return "";
  const isAllowedLightContext =
    input.cityProfile === "Shenzhen" ||
    input.sceneKey === "gymCommute" ||
    input.sceneKey === "gymInterior" ||
    input.sceneKey === "studioLaunch" ||
    input.sceneKey === "mirrorCloset" ||
    input.sceneKey === "hotelTravel";

  return isAllowedLightContext
    ? "Keep Aire or Lemon in a light autumn-winter, indoor, Shenzhen, or gym-transition context without heavy cold-season styling."
    : "Avoid forcing Aire or Lemon into heavy cold-winter styling; keep the outfit lighter, indoor, or mild-city appropriate.";
}

export function normalizeTeamSeason(season: TeamSeason | SeasonKey): SeasonKey {
  return seasonMap[season as TeamSeason] ?? (season as SeasonKey);
}

export function chooseSeasonCityVisualContext(input: {
  season: TeamSeason | SeasonKey;
  cityProfile: ChinaCityProfile | null | undefined;
  sceneKey: StandardSceneKey;
  imageType: TeamImageType;
  scenePreference?: Exclude<TeamScenePreference, "自动匹配">;
  userExtraRequirement?: string;
  selectedShoe: string;
}): SeasonCityVisualContext {
  const season = normalizeTeamSeason(input.season);
  const city = input.cityProfile ?? "GenericChineseCity";
  const context = getSeasonCityContext(season, city);
  const style = chooseSeasonalPhotoStyleLine({ season, cityProfile: city });
  const climate = chooseSeasonClimateOutfitLayer({ season, cityProfile: city });
  const productOrMaterialDetail =
    input.imageType === "产品静物图" ||
    input.imageType === "拍摄花絮 / 材质图" ||
    input.sceneKey === "stillLife" ||
    input.sceneKey === "materialTable";
  const lighting = chooseLightingSpaceType({
    imageType: input.imageType,
    sceneKey: input.sceneKey,
    scenePreference: input.scenePreference,
    cityProfile: city,
    season: input.season as TeamSeason,
    userExtraRequirement: input.userExtraRequirement
  });
  const timeOfDay = context.defaultTimeOfDay;
  const useIndoorSeason = usesIndoorSeasonContext(lighting.lightingSpaceType);
  const useUnifiedOutdoorReferenceTone = shouldUseUnifiedOutdoorReferenceTone({
    imageType: input.imageType,
    sceneKey: input.sceneKey,
    lightingSpaceType: lighting.lightingSpaceType,
    productOrMaterialDetail
  });
  const seasonalLightLine = productOrMaterialDetail
    ? `${timeOfDay} product light. ${stillLifeSeasonLines[season]}`
    : useIndoorSeason
      ? `${timeOfDay} natural or ambient indoor light. ${indoorSeasonLines[season].lightLine}`
    : `${timeOfDay} natural light. ${context.lightLine}`;
  const seasonalPhotoStyleLine = productOrMaterialDetail
    ? `${seasonalPhotoStyleProfiles[season].photoStyleLine} For product or material detail images, express the season through light, material, and background color only; do not add seasonal human action or excessive props.`
    : useUnifiedOutdoorReferenceTone
      ? auraOutdoorReferenceSeasonalToneLine
    : useIndoorSeason
      ? indoorSeasonLines[season].photoStyleLine
    : style.photoStyleLine;
  const shoeSeasonNegative = getShoeSeasonNegative({
    season,
    cityProfile: city,
    sceneKey: input.sceneKey,
    selectedShoe: input.selectedShoe
  });

  return {
    timeOfDay,
    seasonalLightLine,
    seasonalPhotoStyleLine,
    citySeasonMoodLine: useIndoorSeason ? indoorSeasonLines[season].moodLine : context.photoMoodLine,
    climateProfile: climate.climateProfile,
    layerWeight: climate.layerWeight,
    outfitLayerLine: climate.outfitLayerLine,
    preferredMaterials: climate.preferredMaterials,
    forbiddenSeasonItems: climate.forbiddenSeasonItems,
    seasonalNegativeLine: [
      seasonalPhotoStyleProfiles[season].negative,
      context.avoidLine.replace(/^Avoid\s+/i, ""),
      climate.climateNegativeLine,
      climateNegativeLine,
      lighting.lightingNegativeLine,
      shoeSeasonNegative
    ]
      .filter(Boolean)
      .join(", "),
    lightingSpaceType: lighting.lightingSpaceType,
    lightingSourceType: lighting.lightingSourceType,
    indoorOutdoorLightLine: lighting.indoorOutdoorLightLine,
    lightingNegativeLine: lighting.lightingNegativeLine,
    lightingSpaceSupportLine: lighting.spaceSupportLine
  };
}
