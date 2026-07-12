import type { ProductPromptAdapter } from "../productAdapter";
import type { ProductAdapterInput, ProductPresenceInput } from "../types";
import type { ShoeCategoryAdapter, ShoeAccuracyGuardSet, ShoeContentProfile, ShoeFieldDefinition, ShoeReferenceRequirements, ShoeShotPlanProfile } from "./shoeCategoryRegistry";
import type { BootShoeSpec, ShoeProductContext } from "./shoeProductTypes";

const defaultBootSpec: BootShoeSpec = {
  category: "boot", productName: "boot", subtype: "other", toeShape: "other", shaftHeight: "按参考图保持",
  shaftStructure: "other", closureType: "other", heelType: "other", heelHeight: "按参考图保持", keyDetails: []
};

function getBootSpec(context: ShoeProductContext) { return { ...defaultBootSpec, ...(context.bootSpec ?? {}) }; }
function isPeopleOrProductImage(imageType: ProductPresenceInput["imageType"]) { return ["产品上脚图", "对镜穿搭图", "生活场景图", "产品静物图"].includes(imageType); }

function bootProductLine(spec: BootShoeSpec) {
  const values = [
    spec.brandName ? `brand ${spec.brandName}` : "", `boot named ${spec.productName}`, `subtype ${spec.subtype}`,
    `toe shape ${spec.toeShape}`, `shaft height ${spec.shaftHeight}`, `shaft structure ${spec.shaftStructure}`,
    `closure ${spec.closureType}`, `heel type ${spec.heelType}`, `heel height ${spec.heelHeight}`,
    spec.color ? `color ${spec.color}` : "", spec.upperMaterial ? `upper material ${spec.upperMaterial}` : "",
    spec.shaftCircumference ? `shaft circumference ${spec.shaftCircumference}` : "",
    spec.shaftOpeningShape ? `shaft opening ${spec.shaftOpeningShape}` : "",
    spec.ankleEase ? `ankle ease ${spec.ankleEase}` : "", spec.calfFit ? `calf fit ${spec.calfFit}` : "",
    spec.kneeRelation ? `knee relation ${spec.kneeRelation}` : "", spec.heelPlacement ? `heel placement ${spec.heelPlacement}` : "",
    spec.outsoleThickness ? `outsole thickness ${spec.outsoleThickness}` : "", spec.platformHeight ? `platform ${spec.platformHeight}` : "",
    spec.treadProfile ? `tread ${spec.treadProfile}` : "", spec.finish ? `finish ${spec.finish}` : "",
    spec.seamStructure ? `seams ${spec.seamStructure}` : "", spec.panelStructure ? `panels ${spec.panelStructure}` : "",
    spec.closureType === "zipper" && spec.zipperPosition ? `zipper position ${spec.zipperPosition}` : "",
    spec.closureType === "zipper" && spec.zipperLength ? `zipper length ${spec.zipperLength}` : "",
    spec.elasticGore ? `elastic gore ${spec.elasticGore}` : "", spec.pullTab ? `pull tab ${spec.pullTab}` : ""
  ].filter(Boolean);
  return `Use uploaded boot references as the strict source. Preserve ${values.join(", ")}.`;
}

const bootSafety = "Keep the foot inside the boot with aligned ankle, centered calf, plausible knee relationship, natural shaft opening, realistic gravity, and clean ground contact; no leg or boot intersection.";
const bootAccuracy = "Preserve the exact boot subtype, toe geometry, shaft height, shaft circumference, shaft opening, ankle ease, calf fit, knee relation, shaft stiffness, closure construction, heel geometry, outsole thickness, tread profile, material, color, finish, and overall proportions shown in the uploaded references.";

export const bootFieldSchema: ShoeFieldDefinition[] = [
  { key: "productName", label: "靴款名称", type: "text", required: true }, { key: "brandName", label: "品牌（可选）", type: "text" },
  { key: "subtype", label: "靴子类型", type: "select", required: true }, { key: "color", label: "主颜色", type: "text", required: true },
  { key: "upperMaterial", label: "材质外观", type: "text", required: true }, { key: "finish", label: "表面工艺", type: "text" },
  { key: "toeShape", label: "鞋头形状", type: "select", required: true }, { key: "shaftHeight", label: "靴筒高度", type: "text", required: true },
  { key: "shaftCircumference", label: "筒围", type: "text" }, { key: "shaftOpeningShape", label: "筒口形状", type: "text" },
  { key: "shaftFrontBackHeightRelation", label: "前后筒高关系", type: "text" }, { key: "ankleEase", label: "踝部松量", type: "text" },
  { key: "calfFit", label: "小腿贴合", type: "text" }, { key: "kneeRelation", label: "膝盖位置关系", type: "text" },
  { key: "shaftStructure", label: "筒身结构", type: "select", required: true }, { key: "closureType", label: "闭合方式", type: "select", required: true },
  { key: "zipperPosition", label: "拉链位置", type: "text" }, { key: "zipperLength", label: "拉链长度", type: "text" },
  { key: "elasticGore", label: "松紧侧片", type: "text" }, { key: "pullTab", label: "提拉袢", type: "text" },
  { key: "heelType", label: "鞋跟类型", type: "select", required: true }, { key: "heelHeight", label: "鞋跟高度", type: "text", required: true },
  { key: "heelPlacement", label: "鞋跟位置", type: "text" }, { key: "outsoleThickness", label: "外底厚度", type: "text" },
  { key: "platformHeight", label: "前掌台", type: "text" }, { key: "treadProfile", label: "鞋底纹路", type: "text" },
  { key: "seamStructure", label: "缝线结构", type: "text" }, { key: "panelStructure", label: "拼片结构", type: "text" },
  { key: "decorativeDetails", label: "装饰细节", type: "text" }, { key: "logoLettering", label: "Logo / 字样", type: "text" },
  { key: "keyDetails", label: "关键细节", type: "textarea", required: true }
];

export const bootReferenceRequirements: ShoeReferenceRequirements = { minCount: 4, maxCount: 6, requiredRoles: ["primary", "fullSide"], recommendedRoles: ["front", "rear", "shaftDetail", "closureDetail", "material"] };
export const bootShotPlanProfile: ShoeShotPlanProfile = { supportedImageCounts: [1, 3, 5, 8], supportsLifestyleSeries: true, supportsStudioSeries: true };
export const bootAccuracyGuards: ShoeAccuracyGuardSet = { structurePriorities: ["subtype", "toe shape", "shaft height", "shaft circumference", "shaft opening", "ankle ease", "calf fit", "knee relation", "closure", "heel", "outsole", "tread", "material", "color"], requiresGroundedContact: true, requiresReferenceAccuracy: true };
const bootNegativeRules = ["changed shaft height or circumference", "left/right shaft mismatch", "shaft cutting through knee", "structured shaft becoming sock-like", "sock boot becoming riding boot", "ankle boot becoming knee-high", "knee-high becoming ankle boot", "shortened over-the-knee boot", "invented or moved zipper", "added or removed buckle", "invented gore or pull tab", "changed toe or heel", "bent or detached heel", "invented lug or tread", "athletic-footwear closure logic", "leg or boot intersection", "trouser fabric passing through boot", "product hidden by skirt or coat", "floating boot", "duplicated boot or leg", "impossible ankle rotation"];
export const bootContentProfile: ShoeContentProfile = { productNouns: ["boot", "ankle boot", "mid-calf boot", "knee-high boot", "over-the-knee boot", "靴子", "短靴", "长靴"], structurePriorities: bootAccuracyGuards.structurePriorities, lifestyleBenefits: ["autumn and winter layering", "trouser and skirt coordination", "lower-body proportion", "shaft-height styling", "work and social versatility"], forbiddenPrimaryTerms: ["German trainer", "sneaker", "pump", "low-cut silhouette"] };

function createBootPromptAdapter(context: ShoeProductContext): ProductPromptAdapter {
  const spec = getBootSpec(context);
  return {
    mode: "shoe", getDisplayName: () => spec.productName, isProductPresent: (input) => input.imageType !== "非产品氛围图" && (isPeopleOrProductImage(input.imageType) || Boolean(input.extraRequirement.trim())),
    buildProductLine: () => bootProductLine(spec), buildAccuracyLines: () => [bootAccuracy],
    buildVisibilityLines: () => ["Keep at least one complete boot visible from toe to shaft opening; for long boots do not crop away the shaft."],
    buildClippingLines: () => ["Keep foot, ankle, calf, knee, shaft opening, garment hem, boot, floor, and props physically separate; no leg or fabric clipping."],
    buildSceneControlLines: (input) => [input.imageType === "生活场景图" || input.imageType === "对镜穿搭图" ? "Use boot-safe movement: neutral standing, slight weight shift, small step, side stance, or restrained seated pause; no running, jumping, kneeling, deep squat, large stride, or shaft crushing." : "Keep the exact same boot subtype and shaft height in every frame."],
    buildCompositionLines: (input) => input.scenePreference === "棚内上新拍摄" ? [`Boot studio shot ${typeof input.studioLaunchShotIndex === "number" ? `${input.studioLaunchShotIndex + 1} of 8` : "plan"}: prove toe, ankle, shaft, opening, closure, heel, outsole, and tread only when referenced.`] : [],
    buildImageTypeLines: () => ["Boot identity: preserve subtype, toe, shaft, opening, ankle, calf, closure, heel, outsole, tread, material, and finish."],
    buildActionSafetyLines: () => [bootSafety], buildNegativePhrases: () => bootNegativeRules,
    buildStylingBoundaryLines: () => ["Boot styling: keep one complete boot visible; use subtype-appropriate cropped or straight trousers, tucked narrow trousers, midi or knee-length skirts, dresses, and coats without shaft clipping or permanent concealment."],
    getProductSpecificQualityLines: () => ["Boot quality check: subtype, toe, shaft height/opening, closure, heel, outsole, tread, and leg relationship remain reference-accurate."]
  };
}

export const bootAdapter: ShoeCategoryAdapter = { category: "boot", status: "active", createPromptAdapter: createBootPromptAdapter, getFieldSchema: () => bootFieldSchema, getReferenceRequirements: () => bootReferenceRequirements, getShotPlanProfile: () => bootShotPlanProfile, getAccuracyGuards: () => bootAccuracyGuards, getNegativeRules: () => bootNegativeRules, getContentProfile: () => bootContentProfile };
