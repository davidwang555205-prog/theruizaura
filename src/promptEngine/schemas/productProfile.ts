export type ProductCategory =
  | "footwear"
  | "apparel"
  | "bag"
  | "accessory"
  | "beauty"
  | "home"
  | "food"
  | "other";

export type ProductFidelityLevel = "strict" | "standard" | "atmosphere";

export type ProductProfileStatus = "draft" | "review" | "approved" | "archived";

export type FootwearType =
  | "germanTrainer"
  | "sneaker"
  | "pump"
  | "loafer"
  | "flat"
  | "ankleBoot"
  | "tallBoot"
  | "sandal"
  | "other";

export type ApparelType =
  | "shirt"
  | "top"
  | "knitwear"
  | "jacket"
  | "coat"
  | "suit"
  | "dress"
  | "bridal"
  | "skirt"
  | "trousers"
  | "shorts"
  | "other";

export type ProductReferenceSet = {
  front?: string[];
  side?: string[];
  back?: string[];
  top?: string[];
  bottom?: string[];
  detail?: string[];
  material?: string[];
  logo?: string[];
};

export type ProductProtectionRules = {
  immutableAttributes: string[];
  allowedVariations: string[];
  commonRisks: string[];
  negativePhrases: string[];
  visibilityRequirements?: string[];
  wearingBehavior?: string[];
};

export type BaseProductProfile = {
  id: string;
  brandId: string;
  category: ProductCategory;
  type: string;
  name: string;
  sku?: string;
  colorName?: string;
  materialSummary?: string;
  sellingPoints?: string[];
  references?: ProductReferenceSet;
  fidelityLevel: ProductFidelityLevel;
  protection: ProductProtectionRules;
  status: ProductProfileStatus;
  version: number;
};

export type FootwearDetails = {
  footwearType: FootwearType;
  toeShape?: string;
  heelType?: string;
  heelHeight?: string;
  closure?: string;
  backConstruction?: string;
  strapStructure?: string;
  outsoleShape?: string;
  collarStructure?: string;
  tongueStructure?: string;
  laceStructure?: string;
};

export type ApparelDetails = {
  apparelType: ApparelType;
  silhouette?: string;
  neckline?: string;
  shoulderLine?: string;
  waistline?: string;
  sleeveLength?: string;
  garmentLength?: string;
  fabric?: string;
  pattern?: string;
  drape?: string;
  embellishment?: string;
  closure?: string;
};

export type FootwearProductProfile = BaseProductProfile & {
  category: "footwear";
  details: FootwearDetails;
};

export type ApparelProductProfile = BaseProductProfile & {
  category: "apparel";
  details: ApparelDetails;
};

export type GenericProductProfile = BaseProductProfile & {
  category: Exclude<ProductCategory, "footwear" | "apparel">;
  details: Record<string, string | string[] | number | boolean | undefined>;
};

export type ProductProfile = FootwearProductProfile | ApparelProductProfile | GenericProductProfile;

export function isFootwearProduct(profile: ProductProfile): profile is FootwearProductProfile {
  return profile.category === "footwear";
}

export function isApparelProduct(profile: ProductProfile): profile is ApparelProductProfile {
  return profile.category === "apparel";
}
