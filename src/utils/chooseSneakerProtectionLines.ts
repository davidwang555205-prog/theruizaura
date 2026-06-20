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

const materialDetailShoeAccuracyLine =
  "If a THERUIZ AURA sneaker sample, shoe part, shoelace, material panel, or partial product detail appears, keep it secondary to the material story. Preserve the uploaded reference color, material texture, panel boundary, stitching, lace thickness, and recognizable trainer structure when visible, but do not turn the image into a full-shoe product shot.";

const uploadedSneakerAccuracyLine =
  "Use uploaded sneaker reference as strict source: low-cut German trainer silhouette, rounded toe box, slim outsole, panels, tongue, stitching, material, color, and proportions.";

const selectedSneakerAccuracyLine =
  "Preserve the selected THERUIZ AURA German trainer: low-cut silhouette, rounded toe box, slim outsole, panels, tongue, stitching, material, color, and proportions.";

const shoeVisibilityLine =
  "Keep at least one sneaker fully visible from toe to heel, with the second clearly readable.";

const shoeClippingLine =
  "Keep clean separation between ankle, sock, trouser hem or skirt edge, shoe collar, tongue, laces, floor, and props; nothing should merge into the shoe.";

const lacesLine = "Keep laces naturally tied, with readable loops, lace ends, eyelets, and tongue.";

const onFootMaterialResponseLine =
  "When worn, allow only subtle physical forefoot upper flex, gentle collar compression, settled laces, and grounded contact shadow; preserve the fixed toe box, panels, outsole, and silhouette.";

function isWornPeopleImage(imageType: TeamImageType) {
  return imageType === "产品上脚图" || imageType === "对镜穿搭图" || imageType === "生活场景图";
}

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

  if (input.imageType === "拍摄花絮 / 材质图") {
    return {
      productLine: materialDetailShoeAccuracyLine,
      accuracyLine: materialDetailShoeAccuracyLine,
      shoeSpecificAccuracyLine: "",
      visibilityLine:
        "Show only the relevant sneaker sample, shoelace, panel, material transition, or partial product detail needed for the material story; do not force a complete pair or full on-foot display.",
      clippingLine: "",
      lacesLine: "",
      sceneControlLine:
        "Keep product details readable but secondary to swatches, notes, tools, texture, and behind-the-scenes development context."
    };
  }

  const accuracyLine =
    input.shoe === "自定义" && !input.customShoe.trim() ? selectedSneakerAccuracyLine : uploadedSneakerAccuracyLine;
  const shoeSpecificAccuracyLine = getShoeSpecificAccuracyLine(input.shoe, true);
  const productLine = [
    `THERUIZ AURA ${input.shoeDisplayName} German trainer as the main product reference.`,
    accuracyLine,
    isWornPeopleImage(input.imageType) ? onFootMaterialResponseLine : "",
    shoeVisibilityLine,
    lacesLine
  ]
    .filter(Boolean)
    .join(" ");
  const sceneControlLine = [
    shoeVisibilityLine,
    shoeClippingLine,
    lacesLine,
    isWornPeopleImage(input.imageType) ? onFootMaterialResponseLine : ""
  ]
    .filter(Boolean)
    .join(" ");

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
