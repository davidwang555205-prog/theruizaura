import type { ChinaCityProfile } from "../data/chinaUrbanStreetProfiles";
import { getSeasonCityPhotoStyleLine } from "../data/seasonCityPhotoStyleMap";
import { seasonalPhotoStyleProfiles, type SeasonKey } from "../data/seasonalPhotoStyleProfiles";

export function chooseSeasonalPhotoStyleLine(input: {
  season: SeasonKey;
  cityProfile: ChinaCityProfile | null | undefined;
}) {
  const profile = seasonalPhotoStyleProfiles[input.season];
  return {
    mood: profile.mood,
    photoStyleLine: getSeasonCityPhotoStyleLine(input),
    seasonalNegativeLine: profile.negative
  };
}
