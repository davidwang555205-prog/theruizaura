export type AppTab = "product" | "atmosphere" | "templates";

export type BuilderMode = "product" | "atmosphere";

export type GenerationMode = "single" | "three";

export type Season = "Spring" | "Summer" | "Autumn" | "Winter";

export type OutfitMode = "auto" | "manual";

export type AgeRange = "25-35" | "30-45" | "40-55" | "auto";

export type LogoOption = "small" | "none";

export type PeopleOption = "model" | "shoe-only" | "auto";

export type ActionSafetyLevel = "A" | "B" | "C";

export type PromptDetailLevel = "compact" | "standard" | "full";

export type TeamPromptMode = "compact" | "standard" | "full";

export type TeamGarmentTypePreference =
  | "自动匹配"
  | "裤装"
  | "裙装"
  | "短裤"
  | "连衣裙"
  | "轻运动";

export type TeamGarmentType = "trousers" | "skirt" | "shorts" | "dress" | "lightActive";

export type TeamOutfitStyle =
  | "cleanMinimal"
  | "realDaily"
  | "bloggerLite"
  | "refinedFeminine"
  | "darkAnchor"
  | "relaxedWeekend"
  | "polishedCommuter"
  | "softActive";

export type TeamColorDirection =
  | "lightClean"
  | "neutralDaily"
  | "darkAnchor"
  | "softAccent"
  | "denimBased";

export type PromptStats = {
  charCount: number;
  wordCount: number;
};

export type ProductParams = {
  shoe: string;
  customShoe: string;
  material: string;
  customMaterial: string;
  colorDescription: string;
  generationMode: GenerationMode;
  season: Season;
  outfitMode: OutfitMode;
  manualOutfitNotes: string;
  ageRange: AgeRange;
  scenes: string[];
  action: string;
  logo: LogoOption;
  people: PeopleOption;
  promptDetailLevel: PromptDetailLevel;
};

export type AtmosphereParams = {
  imageType: string;
  usage: string;
  shoeAllowance: string;
  peopleAllowance: string;
  extraDescription: string;
  promptDetailLevel: PromptDetailLevel;
};

export type PromptSection = {
  title: string;
  content: string;
};

export type PromptOutput = {
  sections: PromptSection[];
  finalPrompt: string;
  currentPrompt: string;
  compactPrompt: string;
  standardPrompt: string;
  fullDebugPrompt: string;
  allModules: string;
  currentDetailLevel: PromptDetailLevel;
  stats: Record<PromptDetailLevel, PromptStats>;
  triggeredModules: string[];
};

export type SceneBlock = {
  id: string;
  label: string;
  shortLabel: string;
  englishLabel: string;
  category: "basic" | "mature";
  prompt: string;
  compactPrompt?: string;
};

export type AtmosphereScene = {
  id: string;
  label: string;
  category: "brand" | "customer";
  prompt: string;
  compactPrompt?: string;
  customerExpectation?: string;
};

export type OutfitRecommendation = {
  season: Season;
  scenes: string[];
  shoe: string;
  material: string;
  outfitMode: OutfitMode;
  tops: string;
  bottoms: string;
  outerwear: string;
  bag: string;
  accessories: string;
  fabrics: string;
  colorPalette: string;
  stylingSummary: string;
  unifiedNote?: string;
};

export type ProductTemplateParams = Partial<ProductParams>;

export type AtmosphereTemplateParams = Partial<AtmosphereParams>;

export type TemplateCategory = "product" | "atmosphere";

export type TemplateItem = {
  id: string;
  name: string;
  category: TemplateCategory;
  purpose: string;
  recommendedPlatform?: string;
  productParams?: ProductTemplateParams;
  atmosphereParams?: AtmosphereTemplateParams;
  isCustom?: boolean;
  createdAt?: string;
};

export type TeamImageType =
  | "产品上脚图"
  | "对镜穿搭图"
  | "生活场景图"
  | "非产品氛围图"
  | "拍摄花絮 / 材质图"
  | "产品静物图";

export type TeamShoe =
  | "Cloud Dancer 云舞者"
  | "Sand Dollar 沙钱白"
  | "Cappuccino 卡布奇诺"
  | "Silver Romance 银色浪漫"
  | "Aire 微风"
  | "Delphinium Blue 飞燕草蓝"
  | "Lemon 柠檬"
  | "Maple Grove 枫林"
  | "Oreo 奥利奥"
  | "Panda 熊猫"
  | "自定义";

export type TeamSeason = "春" | "夏" | "秋" | "冬";

export type TeamModelChoice =
  | "欧洲25–30岁女模特"
  | "欧洲30岁左右男模特"
  | "亚裔20–25岁模特"
  | "亚裔混血模特"
  | "30–45岁客户画像模特";

export type TeamModelContinuity = "新人物" | "延续上一组人物";

export type TeamStillLifeStyle = "与主视觉统一" | "自动按产品判断";

export type TeamStudioLaunchAnglePreference =
  | "自动匹配"
  | "全身棚拍角度"
  | "下半身1/3角度"
  | "鞋子上脚特写角度"
  | "3/4侧前方上脚角度";

export type TeamGazeMode =
  | "lookAtCamera"
  | "softOffCamera"
  | "downwardGaze"
  | "taskFocusedGaze"
  | "phoneHiddenFace"
  | "noFaceNeeded";

export type TeamActionComplexityLevel = "safeSimple" | "moderateDaily" | "activeLight" | "noAction";

export type TeamPoseType = "standing" | "walking" | "seated" | "mirror" | "active" | "handsOnly" | "none";

export type TeamHumanPoseCategory =
  | "standing"
  | "walking"
  | "mirror"
  | "seated"
  | "laceTying"
  | "gymLightAction"
  | "crouchOrLean";

export type TeamScenePreference =
  | "自动匹配"
  | "通勤上班"
  | "周末城市散步"
  | "精品超市 / 日常采购"
  | "旅行酒店"
  | "居家衣帽间"
  | "玄关出门"
  | "窗边阅读"
  | "材质工作台"
  | "拍摄花絮"
  | "棚内上新拍摄"
  | "周末轻采购"
  | "健身房内"
  | "去运动的路上"
  | "商务区转角"
  | "写字楼门口"
  | "停车后步行去办公室"
  | "回家进门"
  | "地铁 / 商场通道"
  | "楼下便利店 / 咖啡外带"
  | "咖啡店门口"
  | "咖啡馆内"
  | "朋友午餐"
  | "美术馆"
  | "书店 / 杂志店门口"
  | "花店 / 买花"
  | "社区市集 / 精品买菜"
  | "城市街角 / 安静街区"
  | "雨天街角"
  | "酒店走廊"
  | "酒店房间"
  | "酒店门口 / 门厅"
  | "衣帽间 / 更衣角"
  | "窗边阅读角"
  | "工作台 / 桌边整理"
  | "入户镜前"
  | "停车场到电梯口"
  | "瑜伽 / 普拉提工作室门口"
  | "公园慢走"
  | "社区步道"
  | "周末轻旅行出发"
  | "暑假游乐园"
  | "海边度假"
  | "草原野餐"
  | "酒店度假"
  | "亲子自驾出行"
  | "暑假外出后回家";

export type TeamPromptParams = {
  imageType: TeamImageType;
  modelChoice: TeamModelChoice;
  modelContinuity: TeamModelContinuity;
  shoe: TeamShoe;
  customShoe: string;
  season: TeamSeason;
  scenePreference: TeamScenePreference;
  garmentTypePreference: TeamGarmentTypePreference;
  studioLaunchAnglePreference: TeamStudioLaunchAnglePreference;
  stillLifeStyle: TeamStillLifeStyle;
  extraRequirement: string;
  generationNonce: number;
  seriesImageCount?: number;
  seriesImageIndex?: number;
  studioLaunchShotIndex?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  studioSetNonce?: number;
  lockedOutfitLine?: string;
  forceGeneratedOutfitSelection?: boolean;
  forceNoHandheldObject?: boolean;
};

export type TeamPromptOutput = {
  prompt: string;
  hasShoe: boolean;
  sceneText: string;
  selectedOutfitLine: string;
};
