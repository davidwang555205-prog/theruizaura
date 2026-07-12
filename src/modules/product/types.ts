import type { GarmentProductContext } from "./garment/garmentProductTypes";
import type { ShoeProductContext } from "./shoe/shoeProductTypes";

export type ProductMode = "shoe" | "garment";

export type ProductImageType =
  | "产品上脚图"
  | "对镜穿搭图"
  | "生活场景图"
  | "非产品氛围图"
  | "拍摄花絮 / 材质图"
  | "产品静物图";

export type ProductSeason = "春" | "夏" | "秋" | "冬";

export type ProductContext = ShoeProductContext | GarmentProductContext;

export type ProductPresenceInput = {
  imageType: ProductImageType;
  extraRequirement: string;
};

export type ProductAdapterInput = ProductPresenceInput & {
  productPresent: boolean;
  scenePreference: string;
  sceneKey: string;
  season: ProductSeason;
  userSpecifiedStyling: boolean;
  studioLaunchAnglePreference?: string;
  studioLaunchShotIndex?: number;
  seriesImageCount?: number;
  generationNonce: number;
  shotKind?: string;
};

export type StylingRole =
  | "primaryProduct"
  | "supportingTop"
  | "supportingBottom"
  | "outerLayer"
  | "shoes"
  | "bag"
  | "accessory";
