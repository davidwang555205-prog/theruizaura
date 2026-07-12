import type { TeamImageType, TeamScenePreference, TeamSeason } from "../../../types";
import type { GarmentProductCategory } from "./garmentProductTypes";
import { getCompatibleSceneOptions } from "../../../data/teamSceneOptions";

const excluded: Partial<Record<GarmentProductCategory, TeamScenePreference[]>> = {
  bridal: ["健身房内", "精品超市 / 日常采购", "社区市集 / 精品买菜", "楼下便利店 / 咖啡外带", "停车场到电梯口", "通勤上班"],
  eveningGown: ["健身房内", "精品超市 / 日常采购", "社区市集 / 精品买菜", "楼下便利店 / 咖啡外带"],
  activewear: ["朋友午餐", "美术馆"]
};
export function isGarmentSceneCompatible(input: { category: GarmentProductCategory; season: TeamSeason; imageType: TeamImageType; scene: TeamScenePreference }) {
  if (!getCompatibleSceneOptions(input.imageType).includes(input.scene)) return false;
  return !(excluded[input.category] ?? []).includes(input.scene);
}
export function getCompatibleGarmentScenes(input: { category: GarmentProductCategory; season: TeamSeason; imageType: TeamImageType }) {
  return getCompatibleSceneOptions(input.imageType).filter((scene) => isGarmentSceneCompatible({ ...input, scene }));
}
