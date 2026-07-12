import type { PromptModule } from "../schemas/promptModule";

/**
 * Initial catalog of capabilities that already exist in the legacy prompt
 * engine. Source-only entries deliberately avoid copying proven prompt text.
 * The migration layer can resolve these IDs through their current functions.
 */
export const LEGACY_MODULE_CATALOG: PromptModule[] = [
  {
    id: "BRAND.QUIET_LUXURY",
    type: "brand",
    internalName: "THERUIZ AURA Quiet Warm Luxury",
    customerLabel: "高级克制、温暖松弛",
    tags: ["quietLuxury", "warm", "lowSaturation", "restrained"],
    priority: "brand",
    version: 1,
    status: "stable",
    source: { sourceFile: "src/utils/teamPromptCore.ts", sourceKey: "brandMoodLine" }
  },
  {
    id: "BRAND.WARM_AUTHENTIC",
    type: "brand",
    internalName: "Warm authentic daily brand direction",
    customerLabel: "温暖真实",
    tags: ["warm", "authentic", "daily"],
    priority: "brand",
    version: 1,
    status: "testing"
  },
  {
    id: "BRAND.YOUNG_ENERGY",
    type: "brand",
    internalName: "Young energetic brand direction",
    customerLabel: "年轻活力",
    tags: ["young", "energetic"],
    priority: "brand",
    version: 1,
    status: "draft"
  },
  {
    id: "BRAND.MATURE_STEADY",
    type: "brand",
    internalName: "Mature steady brand direction",
    customerLabel: "成熟稳重",
    tags: ["mature", "steady", "calm"],
    priority: "brand",
    version: 1,
    status: "draft"
  },
  {
    id: "REALISM.REAL_DAILY",
    type: "realism",
    internalName: "Real daily photo feeling",
    customerLabel: "真实生活感",
    tags: ["realDaily", "commercialLow", "livedIn"],
    priority: "customerPreference",
    version: 1,
    status: "stable",
    source: { sourceFile: "src/data/promptPatches.ts", sourceKey: "photoRealityModeLines.realDaily" }
  },
  {
    id: "REALISM.BALANCED_BRAND_DAILY",
    type: "realism",
    internalName: "Balanced brand and daily realism",
    customerLabel: "真实感与品牌感平衡",
    tags: ["commercialBalanced", "brandDailyBalance"],
    requires: ["REALISM.REAL_DAILY"],
    priority: "customerPreference",
    version: 1,
    status: "testing"
  },
  {
    id: "REALISM.PREMIUM_STUDIO",
    type: "realism",
    internalName: "Premium launch studio",
    customerLabel: "商业新品棚拍",
    tags: ["premiumStudio", "commercialHigh", "launch"],
    priority: "customerPreference",
    version: 1,
    status: "stable",
    source: { sourceFile: "src/data/promptPatches.ts", sourceKey: "photoRealityModeLines.premiumStudio" }
  },
  {
    id: "MODEL.ASIAN_REAL_CUSTOMER_30_45",
    type: "model",
    internalName: "Asian real customer woman aged 30–45",
    customerLabel: "30–45岁真实顾客感",
    tags: ["asian", "age30_45", "realCustomer", "matureUrban"],
    applicable: { ageRanges: ["30_45"], brandTraits: ["mature", "authentic"] },
    priority: "customerPreference",
    version: 1,
    status: "stable",
    source: { sourceFile: "src/data/teamModelProfiles.ts", sourceKey: "30–45岁客户画像模特" }
  },
  {
    id: "MODEL.ASIAN_20_25",
    type: "model",
    internalName: "Asian woman aged 20–25",
    customerLabel: "20–25岁年轻清新感",
    tags: ["asian", "age20_25", "youngFresh"],
    applicable: { ageRanges: ["20_25"] },
    priority: "customerPreference",
    version: 1,
    status: "stable",
    source: { sourceFile: "src/data/teamModelProfiles.ts", sourceKey: "亚裔20–25岁模特" }
  },
  {
    id: "MODEL.CAMPAIGN_FASHION",
    type: "model",
    internalName: "Campaign fashion model placeholder",
    customerLabel: "职业广告模特感",
    tags: ["campaignModel", "fashionModel"],
    priority: "variation",
    version: 1,
    status: "draft"
  },
  {
    id: "SCENE.FAMILY_COMMUTE",
    type: "scene",
    internalName: "Commute scene family",
    customerLabel: "日常通勤",
    tags: ["commute", "weekday", "officeEntrance", "businessDistrict"],
    applicable: { imageTypes: ["footwearOnFoot", "lifestyle", "apparelOnBody"] },
    priority: "customerPreference",
    version: 1,
    status: "stable",
    source: { sourceFile: "src/data/lifestyleSoftSeedingScenePool.ts", sourceKey: "commute family" }
  },
  {
    id: "SCENE.HOME_ENTRYWAY",
    type: "scene",
    internalName: "Home entryway departure and return",
    customerLabel: "住宅门厅或出门前",
    tags: ["home", "entryway", "departure", "returnHome"],
    priority: "customerPreference",
    version: 1,
    status: "stable",
    source: { sourceFile: "src/utils/teamPromptCore.ts", sourceKey: "玄关出门 / 回家进门 / 入户镜前" }
  },
  {
    id: "SCENE.FAMILY_WEEKEND_CITY",
    type: "scene",
    internalName: "Weekend city lifestyle family",
    customerLabel: "周末城市生活",
    tags: ["weekend", "cityWalk", "cafe", "bookstore", "gallery"],
    priority: "customerPreference",
    version: 1,
    status: "stable",
    source: { sourceFile: "src/data/lifestyleSoftSeedingScenePool.ts", sourceKey: "social / culture families" }
  },
  {
    id: "COMPOSITION.PRODUCT_DOMINANT",
    type: "composition",
    internalName: "Product dominant composition",
    customerLabel: "产品为主，环境简洁",
    tags: ["productDominant", "highReadability"],
    priority: "customerPreference",
    version: 1,
    status: "stable",
    source: { sourceFile: "src/utils/buildPromptTemplateByImageType.ts", sourceKey: "stillLife / detailMacro" }
  },
  {
    id: "COMPOSITION.ATMOSPHERE_DOMINANT",
    type: "composition",
    internalName: "Atmosphere dominant composition",
    customerLabel: "品牌氛围和完整环境优先",
    tags: ["atmosphereDominant", "environmental"],
    priority: "customerPreference",
    version: 1,
    status: "stable",
    source: { sourceFile: "src/utils/buildPromptTemplateByImageType.ts", sourceKey: "atmosphere" }
  },
  {
    id: "PRODUCT.FIDELITY_STRICT",
    type: "productFidelity",
    internalName: "Strict uploaded product fidelity",
    customerLabel: "产品高度还原",
    tags: ["fidelityStrict", "immutableProduct"],
    priority: "product",
    version: 1,
    status: "stable",
    source: { sourceFile: "src/utils/chooseSneakerProtectionLines.ts", sourceKey: "accuracy / visibility / clipping" }
  },
  {
    id: "NEGATIVE.NO_INFLUENCER",
    type: "negative",
    internalName: "Remove influencer styling and posing",
    customerLabel: "不要网红感",
    tags: ["noInfluencer"],
    negativePhrases: ["influencer posing", "influencer gaze", "influencer styling"],
    priority: "customerProhibition",
    version: 1,
    status: "stable",
    source: { sourceFile: "src/utils/teamPromptCore.ts", sourceKey: "getNegativeLine" }
  },
  {
    id: "NEGATIVE.NO_MANSION_SHOWROOM",
    type: "negative",
    internalName: "Remove mansion and showroom staging",
    customerLabel: "不要豪宅或样板间感",
    tags: ["noMansion", "noShowroom"],
    negativePhrases: ["mansion staging", "showroom-like staging", "fake luxury display"],
    priority: "customerProhibition",
    version: 1,
    status: "testing"
  },
  {
    id: "NEGATIVE.NO_WESTERN_MODEL_DRIFT",
    type: "negative",
    internalName: "Prevent Western-dominant model drift",
    customerLabel: "不要人物明显欧美化",
    tags: ["noWesternDrift"],
    negativePhrases: ["European-looking model", "Western-dominant face", "non-Asian casting"],
    priority: "customerProhibition",
    version: 1,
    status: "stable",
    source: { sourceFile: "src/data/teamModelProfiles.ts", sourceKey: "Asian model negative phrases" }
  },
  {
    id: "SYSTEM.PRODUCT_PROTECTION",
    type: "systemProtection",
    internalName: "Mandatory product identity and clipping protection",
    tags: ["alwaysOn", "productProtection"],
    priority: "system",
    version: 1,
    status: "stable",
    source: { sourceFile: "src/utils/chooseSneakerProtectionLines.ts" }
  },
  {
    id: "SYSTEM.PREFLIGHT",
    type: "systemProtection",
    internalName: "Prompt conflict detection and repair",
    tags: ["alwaysOn", "preflight", "conflictRepair"],
    priority: "system",
    version: 1,
    status: "stable",
    source: { sourceFile: "src/utils/promptPreflightCheck.ts" }
  },
  {
    id: "SYSTEM.AI_RISK_PREFLIGHT",
    type: "systemProtection",
    internalName: "AI-looking image risk preflight",
    tags: ["alwaysOn", "aiRisk", "semanticOverload"],
    priority: "system",
    version: 1,
    status: "stable",
    source: { sourceFile: "src/utils/promptAIRiskPreflight.ts" }
  },
  {
    id: "SYSTEM.PROMPT_BUDGET",
    type: "systemProtection",
    internalName: "Prompt length and repetition controller",
    tags: ["alwaysOn", "promptBudget", "dedupe"],
    priority: "system",
    version: 1,
    status: "stable",
    source: { sourceFile: "src/utils/promptBudgetController.ts" }
  }
];

export function getLegacyModule(moduleId: string) {
  return LEGACY_MODULE_CATALOG.find((module) => module.id === moduleId);
}
