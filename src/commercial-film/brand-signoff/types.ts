import type { CommercialCreativeTreatment } from "../creative-directing/types";

export const COMMERCIAL_BRAND_SIGNOFF_SCHEMA_VERSION =
  "commercial-film/brand-signoff-v1" as const;

// No brand mark, logo overlay, logo animation or end card is generated or requested. The film line is
// the only optional closing asset, and it stays a post-production text overlay over the ending image.
export type CommercialBrandSignOffMode =
  | "FILM_LINE_OVER_ENDING_IMAGE"
  | "NO_FILM_LINE";

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
};

export type CommercialBrandSignOff = {
  authority: CommercialBrandSignOffAuthority;
  filmLine: string | null;
  mode: CommercialBrandSignOffMode;
  filmDurationSeconds: number;
  timing: CommercialBrandSignOffTiming | null;
  postProductionOnly: true;
  endingImagePreserved: true;
  filmLineSources: {
    creativeProposition: string;
    signatureMoment: string;
    endingImage: string;
  } | null;
  seedanceDirection: string | null;
};

export type CommercialBrandSignOffInput = {
  treatment: CommercialCreativeTreatment;
  durationSeconds: number;
  shots: { startSecond: number; endSecond: number }[];
  humanAcceptance?: CommercialBrandSignOffHumanAcceptance;
};
