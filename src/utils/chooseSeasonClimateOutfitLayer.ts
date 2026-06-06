import type { ChinaCityProfile } from "../data/chinaUrbanStreetProfiles";
import {
  getCitySeasonClimateProfile,
  type LayerWeight
} from "../data/citySeasonClimateProfiles";
import { getSeasonCityContext } from "../data/seasonCityContextMatrix";
import type { SeasonKey } from "../data/seasonalPhotoStyleProfiles";

function normalizeFlexibleLayer(value: string): LayerWeight {
  if (value.includes("coldLayer")) return "coldLayer";
  if (value.includes("warmLayer")) return "warmLayer";
  if (value.includes("mediumLayer")) return "mediumLayer";
  return "lightLayer";
}

export function chooseSeasonClimateOutfitLayer(input: {
  season: SeasonKey;
  cityProfile: ChinaCityProfile | null | undefined;
}) {
  const city = input.cityProfile ?? "GenericChineseCity";
  const context = getSeasonCityContext(input.season, city);
  const climate = getCitySeasonClimateProfile(city);
  const climateLayer =
    input.season === "winter"
      ? normalizeFlexibleLayer(climate.winterLayerWeight)
      : input.season === "autumn"
        ? normalizeFlexibleLayer(climate.autumnLayerWeight)
        : context.layerWeight;
  const layerWeight = input.season === "autumn" || input.season === "winter" ? climateLayer : context.layerWeight;

  return {
    climateProfile: climate.climateMood,
    layerWeight,
    preferredMaterials: climate.preferredMaterials,
    forbiddenSeasonItems: [...climate.forbidden],
    outfitLayerLine:
      input.season === "autumn" || input.season === "winter"
        ? `Use ${layerWeight} appropriate for ${climate.climateMood}: ${context.outfitLayerSuggestion} Prefer ${climate.preferredMaterials.slice(0, 6).join(", ")}.`
        : `Use ${context.layerWeight} with ${context.outfitLayerSuggestion}`,
    climateNegativeLine: climate.forbidden.join(", ")
  };
}
