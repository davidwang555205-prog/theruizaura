export type AppTab = "product" | "atmosphere" | "templates";

export type BuilderMode = "product" | "atmosphere";

export type GenerationMode = "single" | "three";

export type Season = "Spring" | "Summer" | "Autumn" | "Winter";

export type OutfitMode = "auto" | "manual";

export type AgeRange = "25-35" | "30-45" | "40-55" | "auto";

export type LogoOption = "small" | "none";

export type PeopleOption = "model" | "shoe-only" | "auto";

export type ActionSafetyLevel = "A" | "B" | "C";

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
};

export type AtmosphereParams = {
  imageType: string;
  usage: string;
  shoeAllowance: string;
  peopleAllowance: string;
  extraDescription: string;
};

export type PromptSection = {
  title: string;
  content: string;
};

export type PromptOutput = {
  sections: PromptSection[];
  finalPrompt: string;
  allModules: string;
};

export type SceneBlock = {
  id: string;
  label: string;
  shortLabel: string;
  englishLabel: string;
  category: "basic" | "mature";
  prompt: string;
};

export type AtmosphereScene = {
  id: string;
  label: string;
  category: "brand" | "customer";
  prompt: string;
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
