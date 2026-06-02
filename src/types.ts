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

export type FailureDiagnosisItem = {
  id: string;
  label: string;
  cause: string;
  direction: string;
  recommendedActions: string[];
  recommendedScenes: string[];
  recommendedDetailLevel: PromptDetailLevel;
  modulesToAdd: string[];
  modulesToReduce: string[];
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

export type TeamStillLifeStyle = "与主视觉统一" | "自动按产品判断";

export type TeamGazeMode =
  | "lookAtCamera"
  | "softOffCamera"
  | "downwardGaze"
  | "taskFocusedGaze"
  | "phoneHiddenFace"
  | "noFaceNeeded";

export type TeamActionComplexityLevel = "safeSimple" | "moderateDaily" | "activeLight" | "noAction";

export type TeamPoseType = "standing" | "walking" | "seated" | "mirror" | "active" | "handsOnly" | "none";

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
  | "周末轻采购"
  | "健身房内"
  | "去运动的路上";

export type TeamPromptParams = {
  imageType: TeamImageType;
  shoe: TeamShoe;
  customShoe: string;
  season: TeamSeason;
  scenePreference: TeamScenePreference;
  stillLifeStyle: TeamStillLifeStyle;
  extraRequirement: string;
};

export type TeamPromptOutput = {
  prompt: string;
  hasShoe: boolean;
  sceneText: string;
};
