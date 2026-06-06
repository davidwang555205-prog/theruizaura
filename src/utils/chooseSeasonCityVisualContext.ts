import type { TeamImageType, TeamSeason } from "../types";
import type { ChinaCityProfile } from "../data/chinaUrbanStreetProfiles";
import type { LayerWeight } from "../data/citySeasonClimateProfiles";
import { getSeasonCityContext } from "../data/seasonCityContextMatrix";
import { seasonalPhotoStyleProfiles, type SeasonKey } from "../data/seasonalPhotoStyleProfiles";
import type { StandardSceneKey } from "../data/outfitDiversityRules";
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
  userExtraRequirement?: string;
  selectedShoe: string;
}): SeasonCityVisualContext {
  const season = normalizeTeamSeason(input.season);
  const city = input.cityProfile ?? "GenericChineseCity";
  const context = getSeasonCityContext(season, city);
  const style = chooseSeasonalPhotoStyleLine({ season, cityProfile: city });
  const climate = chooseSeasonClimateOutfitLayer({ season, cityProfile: city });
  const stillLife = input.imageType === "产品静物图" || input.sceneKey === "stillLife";
  const timeOfDay = context.defaultTimeOfDay;
  const seasonalLightLine = stillLife
    ? `${timeOfDay} product light. ${stillLifeSeasonLines[season]}`
    : `${timeOfDay} natural light. ${context.lightLine}`;
  const seasonalPhotoStyleLine = stillLife
    ? `${seasonalPhotoStyleProfiles[season].photoStyleLine} For still life, express the season through light, material, and background color only; do not add seasonal human action or excessive props.`
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
    citySeasonMoodLine: context.photoMoodLine,
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
      shoeSeasonNegative
    ]
      .filter(Boolean)
      .join(", ")
  };
}
