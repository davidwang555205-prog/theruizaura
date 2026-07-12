export type GarmentProductCategory =
  | "dress"
  | "top"
  | "shirt"
  | "knitwear"
  | "tshirt"
  | "trousers"
  | "skirt"
  | "coat"
  | "jacket"
  | "suit"
  | "set"
  | "activewear"
  | "bridal"
  | "eveningGown"
  | "other";

export type GarmentProductSpec = {
  category: GarmentProductCategory;
  name: string;
  silhouette?: string;
  neckline?: string;
  shoulderStructure?: string;
  sleeveType?: string;
  sleeveLength?: string;
  waistline?: string;
  hemLength?: string;
  garmentLength?: string;
  closure?: string;
  fabric?: string;
  color?: string;
  pattern?: string;
  drape?: string;
  transparency?: string;
  buttons?: string;
  pockets?: string;
  pleats?: string;
  darts?: string;
  panelBoundaries?: string;
  embroidery?: string;
  lace?: string;
  beadwork?: string;
  keyDetails?: string[];
};

export type GarmentProductContext = {
  mode: "garment";
  garment: GarmentProductSpec;
};

export type GarmentSeriesContext = {
  productLockLine: string;
  modelLockLine: string;
  stylingLockLine: string;
  visualLockLine: string;
  lockSupportingStyling: boolean;
};
