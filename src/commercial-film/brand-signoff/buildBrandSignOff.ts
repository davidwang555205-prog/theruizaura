import type { CommercialCreativeTreatment } from "../creative-directing/types";
import {
  COMMERCIAL_BRAND_MARK,
  type CommercialBrandSignOff,
  type CommercialBrandSignOffInput,
} from "./types";

// The film line is this film's closing line, compressed from the proposition, the Signature Moment
// and the ending image of the same case. It is never a permanent brand slogan, and a case without a
// genuinely restrained line stays logo only.
const FILM_LINE_BY_MECHANISM: Record<string, string | null> = {
  "QUIET_LUXURY:STATIC_CAMERA_FILM": "The world passes the window.",
  "QUIET_LUXURY:PARTIAL_OBSCURATION": "Seen through the glass.",
  "QUIET_LUXURY:LIGHT_REVEAL": "One pass of light.",
  "URBAN_MOTION:WORLD_MOVES_SUBJECT_SETTLES": "Still, in a moving city.",
  "URBAN_MOTION:THRESHOLD_CHAIN": "The door turns, she crosses.",
  "URBAN_MOTION:EDGE_OF_FRAME": "Almost out of frame.",
  "DAILY_STYLING:REPEATED_GESTURE": "Real the second time.",
  "DAILY_STYLING:PARTIAL_OBSCURATION": null,
  "PRODUCT_CRAFT:LIGHT_REVEAL": "Caught in passing.",
  "PRODUCT_CRAFT:WORLD_MOVES_SUBJECT_SETTLES": "The bus passes. She holds.",
  "NEW_ARRIVAL:EDGE_OF_FRAME": "Found at the edge.",
  "NEW_ARRIVAL:THRESHOLD_CHAIN": "Behind the door, a place.",
};

const HOLD_SECONDS_WITH_FILM_LINE = 2.2;
const HOLD_SECONDS_LOGO_ONLY = 1.6;

const SEEDANCE_DIRECTION =
  "Hold the ending image through the sign-off window and keep clean, calm space in the lower frame for the brand mark. "
  + "Apply the confirmed THERUIZ AURA brand mark as a post overlay. Do not render brand lettering in generation.";

function roundToHundredth(value: number) {
  return Math.round(value * 100) / 100;
}

function mechanismKey(treatment: CommercialCreativeTreatment) {
  return `${treatment.commercialIntent}:${treatment.directorConceptId}`;
}

export function resolveCommercialFilmLine(treatment: CommercialCreativeTreatment) {
  return FILM_LINE_BY_MECHANISM[mechanismKey(treatment)] ?? null;
}

export function buildCommercialBrandSignOff(
  input: CommercialBrandSignOffInput
): CommercialBrandSignOff {
  const { treatment, durationSeconds, shots, humanAcceptance } = input;
  const filmLine = humanAcceptance ? humanAcceptance.filmLine : resolveCommercialFilmLine(treatment);
  const holdSeconds = filmLine ? HOLD_SECONDS_WITH_FILM_LINE : HOLD_SECONDS_LOGO_ONLY;
  const signatureBeatEndSecond =
    shots[treatment.signatureMoment.signatureBeatIndex]?.endSecond ?? 0;
  const endingImageStartSecond = shots[shots.length - 1]?.startSecond ?? 0;

  // The sign-off lives inside the film: it starts late enough to leave the Signature Moment and the
  // ending image intact, and it never adds seconds after the film ends.
  const startSecond = roundToHundredth(Math.max(
    durationSeconds - holdSeconds,
    signatureBeatEndSecond,
    endingImageStartSecond
  ));

  return {
    authority: humanAcceptance ? "HUMAN_APPROVED" : "GENERATED",
    brandMark: COMMERCIAL_BRAND_MARK,
    filmLine,
    mode: humanAcceptance?.mode
      ?? (filmLine
        ? "LOGO_AND_FILM_LINE_OVER_ENDING_IMAGE"
        : "LOGO_OVER_ENDING_IMAGE"),
    presentation: "OVERLAY_OVER_ENDING_IMAGE",
    filmDurationSeconds: roundToHundredth(durationSeconds),
    timing: {
      startSecond,
      endSecond: roundToHundredth(durationSeconds),
      holdSeconds: roundToHundredth(roundToHundredth(durationSeconds) - startSecond),
    },
    postProductionOnly: true,
    endingImagePreserved: true,
    filmLineSources: filmLine
      ? {
        creativeProposition: treatment.creativeProposition.presentationText,
        signatureMoment: treatment.signatureMoment.momentDescription,
        endingImage: treatment.endingImage,
      }
      : null,
    seedanceDirection: SEEDANCE_DIRECTION,
  };
}
