export type QuestionnaireDimension =
  | "brandTrait"
  | "commercialIntensity"
  | "targetCustomer"
  | "modelStyle"
  | "sceneFamily"
  | "productDisplayPriority"
  | "productFidelity"
  | "negativePreference"
  | "systemRecommendation";

export type QuestionnaireOptionMapping = {
  id: string;
  dimension: QuestionnaireDimension;
  customerLabel: string;
  normalizedValue: string;
  tags: string[];
  recommendedModuleIds?: string[];
  excludedModuleIds?: string[];
  humanReviewWhenCombinedWith?: string[];
};

/**
 * Customer-facing language is intentionally separated from internal module IDs.
 * This file can later be generated from Feishu form options or a CMS.
 */
export const QUESTIONNAIRE_OPTION_MAPPINGS: QuestionnaireOptionMapping[] = [
  {
    id: "brand-quiet-luxury",
    dimension: "brandTrait",
    customerLabel: "高级克制",
    normalizedValue: "quietLuxury",
    tags: ["quietLuxury", "restrained", "premium"],
    recommendedModuleIds: ["BRAND.QUIET_LUXURY"]
  },
  {
    id: "brand-warm-authentic",
    dimension: "brandTrait",
    customerLabel: "温暖真实",
    normalizedValue: "warmAuthentic",
    tags: ["warm", "authentic", "daily"],
    recommendedModuleIds: ["BRAND.WARM_AUTHENTIC"]
  },
  {
    id: "brand-young-energy",
    dimension: "brandTrait",
    customerLabel: "年轻活力",
    normalizedValue: "youngEnergy",
    tags: ["young", "energetic"],
    recommendedModuleIds: ["BRAND.YOUNG_ENERGY"],
    humanReviewWhenCombinedWith: ["matureSteady"]
  },
  {
    id: "brand-mature-steady",
    dimension: "brandTrait",
    customerLabel: "成熟稳重",
    normalizedValue: "matureSteady",
    tags: ["mature", "calm", "steady"],
    recommendedModuleIds: ["BRAND.MATURE_STEADY"],
    humanReviewWhenCombinedWith: ["youngEnergy"]
  },
  {
    id: "commercial-real-life",
    dimension: "commercialIntensity",
    customerLabel: "更偏真实生活感",
    normalizedValue: "low",
    tags: ["commercialLow", "realDaily"],
    recommendedModuleIds: ["REALISM.REAL_DAILY"],
    humanReviewWhenCombinedWith: ["high"]
  },
  {
    id: "commercial-balanced",
    dimension: "commercialIntensity",
    customerLabel: "真实感与品牌感平衡",
    normalizedValue: "balanced",
    tags: ["commercialBalanced"],
    recommendedModuleIds: ["REALISM.BALANCED_BRAND_DAILY"]
  },
  {
    id: "commercial-advertising",
    dimension: "commercialIntensity",
    customerLabel: "更偏商业广告感",
    normalizedValue: "high",
    tags: ["commercialHigh", "campaign"],
    recommendedModuleIds: ["REALISM.PREMIUM_STUDIO"],
    humanReviewWhenCombinedWith: ["low"]
  },
  {
    id: "customer-young-urban",
    dimension: "targetCustomer",
    customerLabel: "年轻城市白领",
    normalizedValue: "youngUrbanProfessional",
    tags: ["age25_30", "urbanProfessional"]
  },
  {
    id: "customer-mature-urban",
    dimension: "targetCustomer",
    customerLabel: "成熟职业女性",
    normalizedValue: "matureUrbanWoman",
    tags: ["age30_45", "matureUrban"],
    recommendedModuleIds: ["MODEL.ASIAN_REAL_CUSTOMER_30_45"]
  },
  {
    id: "model-real-customer",
    dimension: "modelStyle",
    customerLabel: "像真实顾客，而不是职业模特",
    normalizedValue: "realCustomer",
    tags: ["realCustomer", "nonCampaignModel"],
    recommendedModuleIds: ["MODEL.ASIAN_REAL_CUSTOMER_30_45"],
    excludedModuleIds: ["MODEL.CAMPAIGN_FASHION"]
  },
  {
    id: "model-young-fresh",
    dimension: "modelStyle",
    customerLabel: "年轻清新的日常感",
    normalizedValue: "youngFresh",
    tags: ["youngFresh", "daily"],
    recommendedModuleIds: ["MODEL.ASIAN_20_25"]
  },
  {
    id: "scene-commute",
    dimension: "sceneFamily",
    customerLabel: "日常通勤",
    normalizedValue: "commute",
    tags: ["commute", "weekday"],
    recommendedModuleIds: ["SCENE.FAMILY_COMMUTE"]
  },
  {
    id: "scene-home-entryway",
    dimension: "sceneFamily",
    customerLabel: "住宅门厅或出门前",
    normalizedValue: "homeEntryway",
    tags: ["entryway", "departure", "home"],
    recommendedModuleIds: ["SCENE.HOME_ENTRYWAY"]
  },
  {
    id: "scene-weekend-city",
    dimension: "sceneFamily",
    customerLabel: "周末城市生活",
    normalizedValue: "weekendCity",
    tags: ["weekend", "cityWalk", "cafe", "bookstore"],
    recommendedModuleIds: ["SCENE.FAMILY_WEEKEND_CITY"]
  },
  {
    id: "display-product-dominant",
    dimension: "productDisplayPriority",
    customerLabel: "产品为主，环境尽量简洁",
    normalizedValue: "productDominant",
    tags: ["productDominant", "highReadability"],
    recommendedModuleIds: ["COMPOSITION.PRODUCT_DOMINANT"],
    humanReviewWhenCombinedWith: ["atmosphereDominant"]
  },
  {
    id: "display-product-context",
    dimension: "productDisplayPriority",
    customerLabel: "产品清楚，同时保留生活场景",
    normalizedValue: "productWithContext",
    tags: ["productWithContext", "lifestyle"]
  },
  {
    id: "display-atmosphere",
    dimension: "productDisplayPriority",
    customerLabel: "更强调品牌氛围和完整环境",
    normalizedValue: "atmosphereDominant",
    tags: ["atmosphereDominant"],
    recommendedModuleIds: ["COMPOSITION.ATMOSPHERE_DOMINANT"],
    humanReviewWhenCombinedWith: ["productDominant"]
  },
  {
    id: "fidelity-strict",
    dimension: "productFidelity",
    customerLabel: "结构、颜色、材质和比例都必须准确",
    normalizedValue: "strict",
    tags: ["fidelityStrict"],
    recommendedModuleIds: ["PRODUCT.FIDELITY_STRICT"]
  },
  {
    id: "negative-no-influencer",
    dimension: "negativePreference",
    customerLabel: "不要网红感",
    normalizedValue: "noInfluencer",
    tags: ["noInfluencer"],
    recommendedModuleIds: ["NEGATIVE.NO_INFLUENCER"]
  },
  {
    id: "negative-no-mansion",
    dimension: "negativePreference",
    customerLabel: "不要豪宅或样板间感",
    normalizedValue: "noMansion",
    tags: ["noMansion", "noShowroom"],
    recommendedModuleIds: ["NEGATIVE.NO_MANSION_SHOWROOM"]
  },
  {
    id: "negative-no-western-drift",
    dimension: "negativePreference",
    customerLabel: "不要人物明显欧美化",
    normalizedValue: "noWesternDrift",
    tags: ["noWesternDrift"],
    recommendedModuleIds: ["NEGATIVE.NO_WESTERN_MODEL_DRIFT"]
  },
  {
    id: "recommend-styling",
    dimension: "systemRecommendation",
    customerLabel: "穿搭由我们推荐",
    normalizedValue: "styling",
    tags: ["systemRecommendStyling"]
  },
  {
    id: "recommend-scene",
    dimension: "systemRecommendation",
    customerLabel: "场景由我们推荐",
    normalizedValue: "scene",
    tags: ["systemRecommendScene"]
  }
];

export function getQuestionnaireMapping(id: string) {
  return QUESTIONNAIRE_OPTION_MAPPINGS.find((item) => item.id === id);
}

export function findQuestionnaireConflicts(selectedIds: string[]) {
  const selected = selectedIds
    .map(getQuestionnaireMapping)
    .filter((item): item is QuestionnaireOptionMapping => Boolean(item));
  const selectedValues = new Set(selected.map((item) => item.normalizedValue));

  return selected.flatMap((item) =>
    (item.humanReviewWhenCombinedWith ?? [])
      .filter((value) => selectedValues.has(value))
      .map((value) => ({ optionId: item.id, conflictsWithValue: value }))
  );
}
