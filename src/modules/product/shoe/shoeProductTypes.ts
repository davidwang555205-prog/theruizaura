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

export type ShoeCategory =
  | "germanTrainer"
  | "pump"
  | "boot"
  | "loafer"
  | "balletFlat"
  | "sandal"
  | "mule"
  | "other";

export const SHOE_CATEGORY_LABELS: Record<ShoeCategory, string> = {
  germanTrainer: "德训鞋 / 低帮运动休闲鞋",
  pump: "高跟单鞋",
  boot: "靴子",
  loafer: "乐福鞋",
  balletFlat: "芭蕾鞋 / 平底鞋",
  sandal: "凉鞋",
  mule: "穆勒鞋",
  other: "其他鞋型"
};

export type ShoeReferenceRole =
  | "primary"
  | "front"
  | "side"
  | "rear"
  | "top"
  | "outsole"
  | "material"
  | "detail";

export type PumpToeShape = "pointed" | "almond" | "round" | "square" | "other";
export type PumpHeelType = "stiletto" | "kitten" | "block" | "cone" | "sculptural" | "other";
export type PumpBackType = "closedBack" | "slingback";
export type PumpStrapType = "none" | "ankleStrap" | "instepStrap" | "maryJane" | "other";

export type ShoeReferenceRequirements = {
  minCount: number;
  maxCount: number;
  requiredRoles: ShoeReferenceRole[];
  recommendedRoles: ShoeReferenceRole[];
};

export type BaseShoeSpec = {
  category: ShoeCategory;
  brandName?: string;
  productName: string;
  color?: string;
  upperMaterial?: string;
  liningMaterial?: string;
  outsoleMaterial?: string;
  toeShape?: string;
  closureType?: string;
  heelType?: string;
  heelHeight?: string;
  keyDetails?: string[];
};

export type PumpShoeSpec = BaseShoeSpec & {
  category: "pump";
  productName: string;
  brandName?: string;
  toeShape: PumpToeShape;
  heelType: PumpHeelType;
  heelHeight: string;
  vampShape?: string;
  vampCoverage?: string;
  toplineShape?: string;
  sideCut?: string;
  backType: PumpBackType;
  heelCounterHeight?: string;
  strapType: PumpStrapType;
  strapPlacement?: string;
  archCurve?: string;
  heelThickness?: string;
  heelPlacement?: string;
  heelAngle?: string;
  outsoleThickness?: string;
  platformHeight?: string;
  finish?: string;
  decorativeDetails?: string;
};

export type GermanTrainerSpec = BaseShoeSpec & {
  category: "germanTrainer";
  silhouette?: string;
  outsoleThickness?: string;
  panelStructure?: string;
  laceStructure?: string;
  tongueStructure?: string;
  heelPatch?: string;
};

export type ShoeFieldDefinition = {
  key: string;
  label: string;
  type: "text" | "select" | "textarea";
  required?: boolean;
  helpText?: string;
};

export type ShoeShotPlanProfile = {
  supportedImageCounts: Array<1 | 3 | 5 | 8>;
  supportsLifestyleSeries: boolean;
  supportsStudioSeries: boolean;
};

export type ShoeAccuracyGuardSet = {
  structurePriorities: string[];
  requiresGroundedContact: boolean;
  requiresReferenceAccuracy: boolean;
};

export type ShoeContentProfile = {
  productNouns: string[];
  structurePriorities: string[];
  lifestyleBenefits: string[];
  forbiddenPrimaryTerms: string[];
};

export type ShoeProductContext = {
  mode: "shoe";
  shoe: TeamShoe;
  customShoe: string;
  /** Omitted only by legacy German-trainer callers. New category-aware callers must set it. */
  category?: ShoeCategory;
  pumpSpec?: PumpShoeSpec;
};

export function resolveShoeCategory(context: ShoeProductContext): ShoeCategory {
  if (context.category) return context.category;
  if (context.shoe !== "自定义" || !context.customShoe.trim()) return "germanTrainer";
  return "other";
}

export function toBaseShoeSpec(context: ShoeProductContext): BaseShoeSpec {
  const category = resolveShoeCategory(context);
  return {
    category,
    brandName: category === "germanTrainer" ? "THERUIZ AURA" : undefined,
    productName: context.shoe === "自定义" ? context.customShoe.trim() || "selected shoe" : context.shoe,
    keyDetails: category === "germanTrainer"
      ? ["low-cut silhouette", "rounded toe box", "slim outsole", "panels", "tongue", "laces"]
      : []
  };
}
