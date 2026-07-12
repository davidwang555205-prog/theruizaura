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
  | "fullSide"
  | "rear"
  | "top"
  | "outsole"
  | "shaftDetail"
  | "closureDetail"
  | "material"
  | "detail";

export type PumpToeShape = "pointed" | "almond" | "round" | "square" | "other";
export type PumpHeelType = "stiletto" | "kitten" | "block" | "cone" | "sculptural" | "other";
export type PumpBackType = "closedBack" | "slingback";
export type PumpStrapType = "none" | "ankleStrap" | "instepStrap" | "maryJane" | "other";
export type BootSubtype = "ankleBoot" | "midCalfBoot" | "kneeHighBoot" | "overTheKneeBoot" | "chelseaBoot" | "sockBoot" | "ridingBoot" | "westernBoot" | "other";
export type BootToeShape = "pointed" | "almond" | "round" | "square" | "other";
export type BootHeelType = "flat" | "lowBlock" | "block" | "stiletto" | "wedge" | "western" | "platform" | "other";
export type BootClosureType = "zipper" | "pullOn" | "elasticGore" | "laceUp" | "buckle" | "mixed" | "other";
export type BootShaftStructure = "structured" | "semiStructured" | "soft" | "sockLike" | "other";
export type LoaferSubtype = "penny" | "horsebit" | "tassel" | "driving" | "lugSole" | "heeled" | "other";
export type LoaferToeShape = "round" | "almond" | "square" | "pointed" | "other";
export type LoaferUpperConstruction = "apron" | "plainVamp" | "moccasin" | "other";
export type LoaferOrnament = "none" | "pennySaddle" | "horsebit" | "tassel" | "fringe" | "chain" | "buckle" | "other";
export type BalletFlatSubtype = "classic" | "maryJane" | "squareToe" | "pointed" | "softGlove" | "elasticated" | "other";
export type BalletFlatToeShape = "round" | "almond" | "square" | "pointed" | "other";
export type BalletFlatOrnament = "none" | "bow" | "knot" | "buckle" | "flower" | "metalDetail" | "other";
export type BalletFlatStrap = "none" | "maryJane" | "doubleStrap" | "ankleStrap" | "elasticStrap" | "other";
export type SandalSubtype = "slide" | "ankleStrap" | "slingback" | "tBar" | "toePost" | "strappy" | "platform" | "heeled" | "other";
export type SandalToeType = "openToe" | "peepToe" | "closedToe" | "other";
export type SandalHeelType = "flat" | "kitten" | "block" | "stiletto" | "wedge" | "platform" | "other";
export type MuleSubtype = "closedToeFlat" | "closedToeHeeled" | "openToeFlat" | "openToeHeeled" | "platform" | "loaferMule" | "other";
export type MuleToeType = "closedToe" | "openToe" | "peepToe" | "other";
export type MuleHeelType = "flat" | "kitten" | "block" | "stiletto" | "wedge" | "platform" | "other";

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

export type BootShoeSpec = BaseShoeSpec & {
  category: "boot";
  productName: string;
  subtype: BootSubtype;
  toeShape: BootToeShape;
  shaftHeight: string;
  shaftCircumference?: string;
  shaftOpeningShape?: string;
  shaftFrontBackHeightRelation?: string;
  ankleEase?: string;
  calfFit?: string;
  kneeRelation?: string;
  shaftStructure: BootShaftStructure;
  closureType: BootClosureType;
  zipperPosition?: string;
  zipperLength?: string;
  elasticGore?: string;
  pullTab?: string;
  heelType: BootHeelType;
  heelHeight: string;
  heelPlacement?: string;
  outsoleThickness?: string;
  platformHeight?: string;
  treadProfile?: string;
  finish?: string;
  seamStructure?: string;
  panelStructure?: string;
  decorativeDetails?: string;
  logoLettering?: string;
};

export type LoaferShoeSpec = BaseShoeSpec & { category: "loafer"; productName: string; subtype: LoaferSubtype; toeShape: LoaferToeShape; upperConstruction: LoaferUpperConstruction; apronShape?: string; apronSeam?: string; vampHeight?: string; instepPanelShape?: string; saddleShape?: string; pennySlotShape?: string; ornament: LoaferOrnament; hardwareShape?: string; hardwareFinish?: string; tasselCount?: string; fringeShape?: string; toplineShape?: string; toplineDepth?: string; sideCut?: string; heelCounterHeight?: string; heelType?: string; heelHeight: string; outsoleThickness?: string; outsoleProfile?: string; weltEdge?: string; treadProfile?: string; finish?: string; seamStructure?: string; decorativeDetails?: string; logoLettering?: string };
export type BalletFlatShoeSpec = BaseShoeSpec & { category: "balletFlat"; productName: string; subtype: BalletFlatSubtype; toeShape: BalletFlatToeShape; vampCoverage: string; vampShape?: string; toplineShape: string; toplineDepth?: string; sideCut?: string; bindingType?: string; bindingWidth?: string; elasticEdge?: string; ornament: BalletFlatOrnament; bowShape?: string; bowSize?: string; ornamentPlacement?: string; strapType: BalletFlatStrap; strapPlacement?: string; buckleShape?: string; heelCounterHeight?: string; heelLift: string; outsoleThickness: string; outsoleFlex?: string; finish?: string; seamStructure?: string; decorativeDetails?: string; logoLettering?: string };
export type SandalShoeSpec = BaseShoeSpec & { category:"sandal"; productName:string; subtype:SandalSubtype; toeType:SandalToeType; toeOpeningShape?:string; forefootStrapCount?:string; forefootStrapWidth?:string; forefootStrapPlacement?:string; vampStrapShape?:string; instepStrap?:string; ankleStrap?:string; ankleStrapHeight?:string; heelStrap?:string; slingbackShape?:string; tBarShape?:string; toePostShape?:string; buckleCount?:string; bucklePosition?:string; hardwareShape?:string; hardwareFinish?:string; footbedShape?:string; heelCup?:string; heelType:SandalHeelType; heelHeight:string; heelPlacement?:string; outsoleThickness?:string; platformHeight?:string; outsoleProfile?:string; treadProfile?:string; finish?:string; decorativeDetails?:string; logoLettering?:string };
export type MuleShoeSpec = BaseShoeSpec & { category:"mule"; productName:string; subtype:MuleSubtype; toeType:MuleToeType; toeShape?:string; toeOpeningShape?:string; vampCoverage:string; vampShape?:string; throatShape?:string; toplineShape?:string; sideCut?:string; backlessEdgeShape?:string; footInsertionDepth?:string; heelExposure?:string; heelOverhangRelation?:string; strapType?:string; strapPlacement?:string; ornamentType?:string; ornamentPlacement?:string; hardwareShape?:string; heelType:MuleHeelType; heelHeight:string; heelPlacement?:string; outsoleThickness?:string; platformHeight?:string; outsoleProfile?:string; treadProfile?:string; finish?:string; decorativeDetails?:string; logoLettering?:string };

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
  bootSpec?: BootShoeSpec;
  loaferSpec?: LoaferShoeSpec;
  balletFlatSpec?: BalletFlatShoeSpec;
  sandalSpec?: SandalShoeSpec;
  muleSpec?: MuleShoeSpec;
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
