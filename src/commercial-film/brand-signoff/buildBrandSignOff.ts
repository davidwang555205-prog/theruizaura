import type { CommercialCreativeTreatment } from "../creative-directing/types";
import type {
  CommercialBrandSignOff,
  CommercialBrandSignOffInput,
} from "./types";

// The film line is this film's closing line, compressed from the proposition, the Signature Moment
// and the ending image of the same case. It is never a permanent brand slogan, and a case without a
// genuinely restrained line ends on the ending image alone.
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

// Film line only. No brand mark is requested, no lower-frame space is reserved, and no lettering is
// generated: the ending image itself is never replaced, cut short or re-staged.
const SEEDANCE_DIRECTION =
  "The ending image is unchanged. The film line is added in post as a text overlay. "
  + "Do not render lettering in generation.";

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
  const authority = humanAcceptance ? "HUMAN_APPROVED" : "GENERATED";

  // Without a film line there is no sign-off asset at all: no window, no overlay, no end card.
  if (!filmLine) {
    return {
      authority,
      filmLine: null,
      mode: "NO_FILM_LINE",
      filmDurationSeconds: roundToHundredth(durationSeconds),
      timing: null,
      postProductionOnly: true,
      endingImagePreserved: true,
      filmLineSources: null,
      seedanceDirection: null,
    };
  }

  const signatureBeatEndSecond =
    shots[treatment.signatureMoment.signatureBeatIndex]?.endSecond ?? 0;
  const endingImageStartSecond = shots[shots.length - 1]?.startSecond ?? 0;

  // The film line window lives inside the film: it starts late enough to leave the Signature Moment and
  // the ending image intact, and it never adds seconds after the film ends.
  const startSecond = roundToHundredth(Math.max(
    durationSeconds - HOLD_SECONDS_WITH_FILM_LINE,
    signatureBeatEndSecond,
    endingImageStartSecond
  ));

  return {
    authority,
    filmLine,
    mode: "FILM_LINE_OVER_ENDING_IMAGE",
    filmDurationSeconds: roundToHundredth(durationSeconds),
    timing: {
      startSecond,
      endSecond: roundToHundredth(durationSeconds),
      holdSeconds: roundToHundredth(roundToHundredth(durationSeconds) - startSecond),
    },
    postProductionOnly: true,
    endingImagePreserved: true,
    filmLineSources: {
      creativeProposition: treatment.creativeProposition.presentationText,
      signatureMoment: treatment.signatureMoment.momentDescription,
      endingImage: treatment.endingImage,
    },
    seedanceDirection: SEEDANCE_DIRECTION,
  };
}
