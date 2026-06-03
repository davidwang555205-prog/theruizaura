import { chooseChinaUrbanStreetLine as getCityProfile, type ChinaCityProfile } from "../data/chinaUrbanStreetProfiles";

export function chooseChinaUrbanStreetLine(city: ChinaCityProfile | null) {
  return city ? getCityProfile(city) : null;
}
