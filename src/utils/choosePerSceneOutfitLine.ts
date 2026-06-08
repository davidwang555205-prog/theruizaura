import type { TeamScenePreference, TeamSeason, TeamShoe, TeamImageType } from "../types";
import type { ChinaCityProfile } from "../data/chinaUrbanStreetProfiles";
import type { ImageType, OutfitEntry, Season } from "../data/perSceneOutfitLibrary";
import type { GarmentType, ColorDirection, OutfitStyle } from "../data/sceneOutfitSeedLibrary";
import type { ChooseSmartOutfitResult } from "./chooseSmartOutfit";

export type ChoosePerSceneOutfitInput = {
  scenePreference: TeamScenePreference | string;
  season: TeamSeason | Season;
  shoe: TeamShoe | string;
  imageType: TeamImageType | ImageType;
  userExtraRequirement?: string;
  previousOutfitId?: string;
  generatedHistory?: string[];
  garmentTypePreference?: string;
  cityProfile?: ChinaCityProfile | null;
};

export type ChoosePerSceneOutfitResult = {
  selectedOutfitId: string | null;
  selectedPerSceneOutfitLine: string | null;
  selectedOutfit: OutfitEntry | null;
  selectedStylingRealismLine: string | null;
  selectedGarmentType: GarmentType | null;
  selectedOutfitStyle: OutfitStyle | null;
  selectedColorDirection: ColorDirection | null;
  selectedVisualAnchor: string | null;
  selectedBagCategory?: string | null;
  selectedAccessoryCategory?: string[] | null;
  scoreBreakdown?: ChooseSmartOutfitResult["scoreBreakdown"];
  usedFallback?: boolean;
  fallbackReason?: string;
  conflictWarnings?: string[];
};

const emptySelection: ChoosePerSceneOutfitResult = {
  selectedOutfitId: null,
  selectedPerSceneOutfitLine: null,
  selectedOutfit: null,
  selectedStylingRealismLine: null,
  selectedGarmentType: null,
  selectedOutfitStyle: null,
  selectedColorDirection: null,
  selectedVisualAnchor: null
};

export function choosePerSceneOutfitLine(_input: ChoosePerSceneOutfitInput): ChoosePerSceneOutfitResult {
  return emptySelection;
}
