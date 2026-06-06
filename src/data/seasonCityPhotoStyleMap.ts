import type { ChinaCityProfile } from "./chinaUrbanStreetProfiles";
import { getSeasonCityContext } from "./seasonCityContextMatrix";
import { seasonalPhotoStyleProfiles, type SeasonKey } from "./seasonalPhotoStyleProfiles";

export function getSeasonCityPhotoStyleLine(input: {
  season: SeasonKey;
  cityProfile: ChinaCityProfile | null | undefined;
}) {
  const style = seasonalPhotoStyleProfiles[input.season];
  const context = getSeasonCityContext(input.season, input.cityProfile);
  return `${style.photoStyleLine} ${context.photoMoodLine}`;
}
