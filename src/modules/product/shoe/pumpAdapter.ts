import type { ProductPromptAdapter } from "../productAdapter";
import type { ProductAdapterInput, ProductPresenceInput } from "../types";
import type {
  ShoeAccuracyGuardSet,
  ShoeCategoryAdapter,
  ShoeContentProfile,
  ShoeFieldDefinition,
  ShoeReferenceRequirements,
  ShoeShotPlanProfile
} from "./shoeCategoryRegistry";
import type { PumpShoeSpec, ShoeProductContext } from "./shoeProductTypes";

function isPeopleOrProductImage(imageType: ProductPresenceInput["imageType"]) {
  return imageType === "产品上脚图" || imageType === "对镜穿搭图" || imageType === "生活场景图" || imageType === "产品静物图";
}

const defaultPumpSpec: PumpShoeSpec = {
  category: "pump",
  productName: "closed-toe pump",
  toeShape: "other",
  heelType: "other",
  heelHeight: "按参考图保持",
  backType: "closedBack",
  strapType: "none",
  keyDetails: []
};

function getPumpSpec(context: ShoeProductContext) {
  return { ...defaultPumpSpec, ...(context.pumpSpec ?? {}) };
}

function valueLine(spec: PumpShoeSpec) {
  const values = [
    spec.brandName ? `brand ${spec.brandName}` : "",
    `closed-toe pump named ${spec.productName}`,
    `toe shape ${spec.toeShape}`,
    `heel type ${spec.heelType}`,
    `heel height ${spec.heelHeight}`,
    spec.heelThickness ? `heel thickness ${spec.heelThickness}` : "",
    spec.heelPlacement ? `heel placement ${spec.heelPlacement}` : "",
    spec.heelAngle ? `heel angle ${spec.heelAngle}` : "",
    spec.vampShape ? `vamp shape ${spec.vampShape}` : "",
    spec.vampCoverage ? `vamp coverage ${spec.vampCoverage}` : "",
    spec.toplineShape ? `topline opening ${spec.toplineShape}` : "",
    spec.sideCut ? `side cut ${spec.sideCut}` : "",
    `back construction ${spec.backType}`,
    spec.strapType !== "none" ? `strap ${spec.strapType}${spec.strapPlacement ? ` at ${spec.strapPlacement}` : ""}` : "no strap",
    spec.heelCounterHeight ? `heel counter ${spec.heelCounterHeight}` : "",
    spec.archCurve ? `arch curve ${spec.archCurve}` : "",
    spec.outsoleThickness ? `outsole thickness ${spec.outsoleThickness}` : "",
    spec.platformHeight ? `platform height ${spec.platformHeight}` : "",
    spec.upperMaterial ? `upper material ${spec.upperMaterial}` : "",
    spec.finish ? `finish ${spec.finish}` : "",
    spec.decorativeDetails ? `decorative details ${spec.decorativeDetails}` : "",
    spec.color ? `color ${spec.color}` : ""
  ].filter(Boolean);
  return `Use the uploaded pump references as the strict source. Preserve ${values.join(", ")}.`;
}

function pumpSafetyLine(spec: PumpShoeSpec) {
  return [
    "Keep the foot naturally seated inside the closed-toe pump, with heel aligned to the heel counter, realistic ankle alignment, grounded contact, and no foot or shoe intersection.",
    "Preserve the exact pump silhouette, toe geometry, vamp line, topline opening, side cut, heel counter, heel height, heel shape, heel thickness, heel placement, heel angle, arch curve, shoe pitch, outsole thickness, platform height, back or strap construction, material, color, and proportions shown in the uploaded references.",
    "At least one pump must remain fully visible from toe to heel; keep the second pump readable when the composition allows.",
    spec.backType === "slingback" ? "Preserve the slingback strap and rear opening exactly as referenced." : "Preserve the closed rear counter exactly as referenced."
  ].join(" ");
}

export const pumpFieldSchema: ShoeFieldDefinition[] = [
  { key: "productName", label: "鞋款名称", type: "text", required: true },
  { key: "brandName", label: "品牌（可选）", type: "text", helpText: "不填写时不自动添加品牌。" },
  { key: "color", label: "主颜色", type: "text", required: true },
  { key: "upperMaterial", label: "鞋面材质 / 材质外观", type: "text", required: true },
  { key: "finish", label: "表面光泽 / 工艺", type: "text" },
  { key: "toeShape", label: "鞋头形状", type: "select", required: true },
  { key: "vampShape", label: "鞋面覆盖 / 鞋口线", type: "text" },
  { key: "toplineShape", label: "鞋口 Topline", type: "text" },
  { key: "sideCut", label: "侧帮开口", type: "text" },
  { key: "heelType", label: "鞋跟类型", type: "select", required: true },
  { key: "heelHeight", label: "鞋跟高度", type: "text", required: true, helpText: "未知时填写“按参考图保持”。" },
  { key: "heelThickness", label: "鞋跟厚度", type: "text" },
  { key: "heelPlacement", label: "鞋跟位置 / 后移量", type: "text" },
  { key: "heelAngle", label: "鞋跟角度", type: "text" },
  { key: "platformHeight", label: "前掌台高度", type: "text" },
  { key: "backType", label: "后跟结构", type: "select", required: true },
  { key: "heelCounterHeight", label: "后跟包覆高度", type: "text" },
  { key: "strapType", label: "绑带类型", type: "select" },
  { key: "strapPlacement", label: "绑带位置", type: "text" },
  { key: "archCurve", label: "足弓曲线", type: "text" },
  { key: "outsoleThickness", label: "外底厚度", type: "text" },
  { key: "decorativeDetails", label: "装饰 / Logo 细节", type: "text" },
  { key: "keyDetails", label: "关键细节", type: "textarea", required: true }
];

export const pumpReferenceRequirements: ShoeReferenceRequirements = {
  minCount: 4,
  maxCount: 6,
  requiredRoles: ["primary", "side"],
  recommendedRoles: ["front", "rear", "detail", "material"]
};

export const pumpShotPlanProfile: ShoeShotPlanProfile = {
  supportedImageCounts: [1, 3, 5, 8],
  supportsLifestyleSeries: true,
  supportsStudioSeries: true
};

export const pumpAccuracyGuards: ShoeAccuracyGuardSet = {
  structurePriorities: [
    "toe shape", "toe width", "vamp", "topline opening", "side cut", "heel counter", "heel height", "heel type",
    "heel thickness", "heel curve", "heel placement", "heel angle", "arch curve", "shoe pitch", "outsole thickness",
    "platform height", "back or strap construction", "material", "color", "decorative detail placement"
  ],
  requiresGroundedContact: true,
  requiresReferenceAccuracy: true
};

const pumpNegativeRules = [
  "bent heel", "broken heel", "detached heel", "floating heel", "heel shifted forward or backward", "changed heel height",
  "changed heel thickness", "asymmetrical left and right heel", "changed toe shape", "changed topline", "changed vamp coverage",
  "changed side cut", "added or removed strap", "altered rear counter", "thick sneaker outsole", "unreferenced platform",
  "athletic-footwear construction", "added closure components", "performance-footwear transformation", "foot or shoe intersection",
  "exposed toes in a closed-toe pump", "impossible ankle rotation", "duplicated feet or shoes", "shoe floating above the floor",
  "sole and heel geometry mismatch"
];

export const pumpContentProfile: ShoeContentProfile = {
  productNouns: ["closed-toe pump", "pump", "高跟单鞋", "高跟鞋"],
  structurePriorities: pumpAccuracyGuards.structurePriorities,
  lifestyleBenefits: ["outfit proportion", "refined posture", "work and social versatility", "skirt and trouser coordination", "heel-height balance"],
  forbiddenPrimaryTerms: ["German trainer", "sneaker", "trainer", "running-shoe sole"]
};

export function createPumpPromptAdapter(context: ShoeProductContext): ProductPromptAdapter {
  const spec = getPumpSpec(context);
  const productLine = valueLine(spec);
  return {
    mode: "shoe",
    getDisplayName: () => spec.productName,
    isProductPresent(input) {
      if (input.imageType === "非产品氛围图") return false;
      if (isPeopleOrProductImage(input.imageType)) return true;
      return Boolean(input.extraRequirement.trim());
    },
    buildProductLine: () => productLine,
    buildAccuracyLines: () => [pumpSafetyLine(spec)],
    buildVisibilityLines: () => ["Keep the closed-toe pump fully visible from toe to heel, with topline, vamp, side cut, heel, and grounded contact readable."],
    buildClippingLines: () => ["Keep ankle, hosiery, garment hem, pump topline, vamp, heel counter, floor, and props physically separate; no foot clipping or fabric fusion."],
    buildSceneControlLines: (input) => [
      input.imageType === "生活场景图" || input.imageType === "对镜穿搭图" ? "Use restrained pump-safe movement: neutral standing, small step, side stance, or seated pause; avoid running, jumping, deep squat, or extreme toe pointing." : "",
      "Keep the pump as the same product in every frame; do not redesign the heel or toe between shots."
    ].filter(Boolean),
    buildCompositionLines: (input) => input.scenePreference === "棚内上新拍摄" ? [
      "Pump studio launch composition: use a clean professional studio and vary only the specified shot purpose; never substitute athletic-footwear closure or panel detail.",
      typeof input.studioLaunchShotIndex === "number" ? `Pump studio shot ${input.studioLaunchShotIndex + 1} of 8: keep the specified toe, vamp, topline, side, heel, arch, and outsole proof readable.` : ""
    ].filter(Boolean) : [],
    buildImageTypeLines: () => ["Closed-toe pump product identity: preserve toe geometry, vamp line, topline opening, side cut, heel geometry, arch curve, and outsole relationship."],
    buildActionSafetyLines: () => [
      "Foot-to-pump contact: foot seated naturally inside the shoe, heel aligned with the counter, no exposed toes, no floating heel, no impossible ankle rotation, and believable left-right scale."
    ],
    buildNegativePhrases: () => pumpNegativeRules,
    buildStylingBoundaryLines: () => ["Pump-supporting styling: keep at least one shoe fully visible from toe to heel; use ankle-length trousers, cropped trousers, midi or knee-length skirts, refined dresses, or tailored suits without hems covering the heel."],
    getProductSpecificQualityLines: () => ["Pump quality check: toe, vamp, topline, side cut, arch, heel height, heel shape, heel placement, outsole, and material must remain reference-accurate."]
  };
}

export const pumpAdapter: ShoeCategoryAdapter = {
  category: "pump",
  status: "active",
  createPromptAdapter: createPumpPromptAdapter,
  getFieldSchema: () => pumpFieldSchema,
  getReferenceRequirements: () => pumpReferenceRequirements,
  getShotPlanProfile: () => pumpShotPlanProfile,
  getAccuracyGuards: () => pumpAccuracyGuards,
  getNegativeRules: () => pumpNegativeRules,
  getContentProfile: () => pumpContentProfile
};
