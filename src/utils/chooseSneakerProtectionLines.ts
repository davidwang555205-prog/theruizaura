import type { TeamImageType, TeamShoe } from "../types";
import { getShoeSpecificAccuracyLine } from "../data/shoeSpecificAccuracyProfiles";

export type SneakerProtectionInput = {
  imageType: TeamImageType;
  shoe: TeamShoe;
  shoeDisplayName: string;
  customShoe: string;
  hasShoe: boolean;
};

export type SneakerProtectionLines = {
  productLine: string;
  accuracyLine: string;
  shoeSpecificAccuracyLine: string;
  visibilityLine: string;
  clippingLine: string;
  lacesLine: string;
  sceneControlLine: string;
};

const nonProductShoeAccuracyLine =
  "If the THERUIZ AURA sneaker appears in this non-product atmosphere image, keep it subtle and secondary. Preserve its real color, material texture, and recognizable shape, but do not turn the image into a direct product shot.";

const uploadedSneakerAccuracyLine =
  "Use uploaded sneaker reference as strict source: low-cut German trainer silhouette, rounded toe box, slim outsole, panels, tongue, stitching, material, color, and proportions.";

const selectedSneakerAccuracyLine =
  "Preserve the selected THERUIZ AURA German trainer: low-cut silhouette, rounded toe box, slim outsole, panels, tongue, stitching, material, color, and proportions.";

const shoeVisibilityLine =
  "Keep at least one sneaker fully visible from toe to heel, with the second clearly readable.";

const shoeClippingLine =
  "Keep clean separation between ankle, sock, trouser hem or skirt edge, shoe collar, tongue, laces, floor, and props; nothing should merge into the shoe.";

const lacesLine = "Keep laces naturally tied, with readable loops, lace ends, eyelets, and tongue.";

export function chooseSneakerProtectionLines(input: SneakerProtectionInput): SneakerProtectionLines {
  if (!input.hasShoe) {
    return {
      productLine: "",
      accuracyLine: "",
      shoeSpecificAccuracyLine: "",
      visibilityLine: "",
      clippingLine: "",
      lacesLine: "",
      sceneControlLine: ""
    };
  }

  if (input.imageType === "非产品氛围图") {
    return {
      productLine: nonProductShoeAccuracyLine,
      accuracyLine: nonProductShoeAccuracyLine,
      shoeSpecificAccuracyLine: "",
      visibilityLine:
        "The shoe may appear only as a subtle partial object or background detail, not as the main product subject; do not force full on-foot display.",
      clippingLine: "",
      lacesLine: "",
      sceneControlLine:
        "The shoe may appear only as a subtle partial object or background detail, not as the main product subject; do not force full on-foot display."
    };
  }

  const accuracyLine =
    input.shoe === "自定义" && !input.customShoe.trim() ? selectedSneakerAccuracyLine : uploadedSneakerAccuracyLine;
  const shoeSpecificAccuracyLine = getShoeSpecificAccuracyLine(input.shoe, true);
  const productLine = [
    `THERUIZ AURA ${input.shoeDisplayName} German trainer as the main product reference.`,
    accuracyLine,
    shoeVisibilityLine,
    lacesLine
  ]
    .filter(Boolean)
    .join(" ");
  const sceneControlLine = [shoeVisibilityLine, shoeClippingLine, lacesLine].filter(Boolean).join(" ");

  return {
    productLine,
    accuracyLine,
    shoeSpecificAccuracyLine,
    visibilityLine: shoeVisibilityLine,
    clippingLine: shoeClippingLine,
    lacesLine,
    sceneControlLine
  };
}
