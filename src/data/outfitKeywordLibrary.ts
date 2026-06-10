import type { TeamGarmentTypePreference, TeamImageType, TeamPromptParams, TeamSeason } from "../types";

type RotatingOutfitOption = {
  garment: TeamGarmentTypePreference;
  seasons: TeamSeason[];
  line: string;
};

const rotatingOutfitKeywordOptions: RotatingOutfitOption[] = [
  { garment: "裤装", seasons: ["春", "夏", "秋"], line: "white cotton shirt, cream straight trousers, light beige shirt jacket, taupe shoulder bag, simple watch, clean polished commuter styling" },
  { garment: "裤装", seasons: ["春