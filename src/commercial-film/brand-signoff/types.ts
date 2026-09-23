import type { CommercialCreativeTreatment } from "../creative-directing/types";

export const COMMERCIAL_BRAND_SIGNOFF_SCHEMA_VERSION =
  "commercial-film/brand-signoff-v1" as const;

export const COMMERCIAL_BRAND_MARK = "THERUIZ AURA" as const;

export type CommercialBrandSignOffMode =
  | "LOGO_ONLY"
  | "LOGO_OVER_ENDING_IMAGE"
  | "LOGO_AND_FILM_LINE_OVER_ENDING_IMAGE"
  | "END_CARD_LOGO_ONLY"
  | "END_CARD_LOGO_AND_FILM_LINE";

export type CommercialBrandSignOffPresentation =
  | "OVERLAY_OVER_ENDING_IMAGE"
  | "END_CARD";

export type CommercialBrandSignOffTiming = {
  startSecond: number;
  endSecond: number;
  holdSeconds: number;
};

export type CommercialBrandSignOffAuthority = "GENERATED" | "HUMAN_APPROVED";

// Optional human-reviewed values for one acceptance case. Nothing case-specific is stored in the
// generator itself; a human acceptance record supplies these at the acceptance-pack entry point.
export type CommercialBrandSignOffHumanAcceptance = {
  filmLine: string | null;
  mode?: CommercialBrandSignOffMode;
};

export type CommercialBrandSignOff = {
  authority: CommercialBrandSignOffAuthority;
  brandMark: typeof COMMERCIAL_BRAND_MARK;
  filmLine: string | null;
  mode: CommercialBrandSignOffMode;
  presentation: CommercialBrandSignOffPresentation;
  filmDurationSeconds: number;
  timing: CommercialBrandSignOffTiming;
  postProductionOnly: true;
  endingImagePreserved: true;
  filmLineSources: {
    creativeProposition: string;
    signatureMoment: string;
    endingImage: string;
  } | null;
  seedanceDirection: string;
};

export type CommercialBrandSignOffInput = {
  treatment: CommercialCreativeTreatment;
  durationSeconds: number;
  shots: { startSecond: number; endSecond: number }[];
  humanAcceptance?: CommercialBrandSignOffHumanAcceptance;
};

export function commercialBrandSignOffModeLabel(mode: CommercialBrandSignOffMode) {
  if (mode === "LOGO_ONLY") return "Brand mark only";
  if (mode === "LOGO_OVER_ENDING_IMAGE") return "Brand mark over the ending image";
  if (mode === "LOGO_AND_FILM_LINE_OVER_ENDING_IMAGE") {
    return "Brand mark and film line over the ending image";
  }
  if (mode === "END_CARD_LOGO_ONLY") return "End card, brand mark only";
  return "End card, brand mark and film line";
}
