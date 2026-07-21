import type { TeamImageType, TeamScenePreference } from "../types";

const peopleLifestyleScenes: TeamScenePreference[] = [
  "自动匹配",
  "通勤上班",
  "商务区转角",
  "写字楼门口",
  "停车后步行去办公室",
  "玄关出门",
  "回家进门",
  "地铁 / 商场通道",
  "楼下便利店 / 咖啡外带",
  "周末城市散步",
  "咖啡店门口",
  "咖啡馆内",
  "朋友午餐",
  "美术馆",
  "书店 / 杂志店门口",
  "花店 / 买花",
  "精品超市 / 日常采购",
  "社区市集 / 精品买菜",
  "城市街角 / 安静街区",
  "雨天街角",
  "周末轻采购",
  "旅行酒店",
  "酒店咖啡厅内",
  "酒店房间",
  "酒店门口 / 门厅",
  "居家衣帽间",
  "衣帽间 / 更衣角",
  "窗边阅读",
  "窗边阅读角",
  "工作台 / 桌边整理",
  "棚内上新拍摄",
  "入户镜前",
  "停车场到电梯口",
  "暑假游乐园",
  "海边度假",
  "草原野餐",
  "酒店度假",
  "亲子自驾出行",
  "暑假外出后回家",
  "去运动的路上",
  "健身房内",
  "瑜伽 / 普拉提工作室门口",
  "公园慢走",
  "社区步道",
  "周末轻旅行出发"
];

const mirrorScenes: TeamScenePreference[] = [
  "自动匹配",
  "通勤上班",
  "玄关出门",
  "回家进门",
  "周末城市散步",
  "精品超市 / 日常采购",
  "旅行酒店",
  "酒店房间",
  "酒店门口 / 门厅",
  "居家衣帽间",
  "衣帽间 / 更衣角",
  "窗边阅读角",
  "棚内上新拍摄",
  "入户镜前",
  "停车场到电梯口",
  "酒店度假",
  "暑假外出后回家",
  "去运动的路上",
  "健身房内",
  "周末轻旅行出发"
];

const atmosphereScenes: TeamScenePreference[] = [
  "自动匹配",
  "通勤上班",
  "周末城市散步",
  "咖啡店门口",
  "咖啡馆内",
  "朋友午餐",
  "美术馆",
  "书店 / 杂志店门口",
  "花店 / 买花",
  "精品超市 / 日常采购",
  "社区市集 / 精品买菜",
  "城市街角 / 安静街区",
  "雨天街角",
  "周末轻采购",
  "旅行酒店",
  "酒店房间",
  "酒店门口 / 门厅",
  "居家衣帽间",
  "衣帽间 / 更衣角",
  "玄关出门",
  "回家进门",
  "窗边阅读",
  "窗边阅读角",
  "工作台 / 桌边整理",
  "材质工作台",
  "拍摄花絮",
  "棚内上新拍摄",
  "暑假游乐园",
  "海边度假",
  "草原野餐",
  "酒店度假",
  "亲子自驾出行",
  "暑假外出后回家",
  "公园慢走",
  "社区步道",
  "周末轻旅行出发"
];

const materialScenes: TeamScenePreference[] = [
  "自动匹配",
  "材质工作台",
  "拍摄花絮",
  "棚内上新拍摄",
  "工作台 / 桌边整理",
  "衣帽间 / 更衣角"
];

const stillLifeScenes: TeamScenePreference[] = [
  "自动匹配",
  "材质工作台",
  "棚内上新拍摄",
  "工作台 / 桌边整理"
];

export const TEAM_SCENE_OPTIONS_BY_IMAGE_TYPE: Record<TeamImageType, TeamScenePreference[]> = {
  产品上脚图: peopleLifestyleScenes,
  对镜穿搭图: mirrorScenes,
  生活场景图: peopleLifestyleScenes,
  非产品氛围图: atmosphereScenes,
  "拍摄花絮 / 材质图": materialScenes,
  产品静物图: stillLifeScenes
};

export function getCompatibleSceneOptions(imageType: TeamImageType) {
  return TEAM_SCENE_OPTIONS_BY_IMAGE_TYPE[imageType];
}

export function isSceneCompatibleWithImageType(imageType: TeamImageType, scene: TeamScenePreference) {
  return getCompatibleSceneOptions(imageType).includes(scene);
}
