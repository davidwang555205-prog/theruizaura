import type { ProductAdapterInput } from "../types";
import type { GarmentProductContext, GarmentProductSpec } from "./garmentProductTypes";
import { buildGarmentDecorativeGuard, buildGarmentMaterialGuard, buildGarmentNegativeRules, getGarmentVisibilityGuard } from "./garmentAccuracyGuards";

const categoryNames: Record<GarmentProductSpec["category"], string> = {
  dress: "dress",
  top: "top",
  shirt: "shirt",
  knitwear: "knitwear garment",
  tshirt: "T-shirt",
  trousers: "trousers",
  skirt: "skirt",
  coat: "coat",
  jacket: "jacket",
  suit: "suit",
  set: "matching set",
  activewear: "light activewear",
  bridal: "bridal garment",
  eveningGown: "evening gown",
  other: "garment"
};

function detail(label: string, value?: string) {
  return value?.trim() ? `${label}: ${value.trim()}` : "";
}

function garmentDetails(spec: GarmentProductSpec) {
  return [
    detail("silhouette", spec.silhouette),
    detail("neckline", spec.neckline),
    detail("shoulder structure", spec.shoulderStructure),
    detail("sleeve type", spec.sleeveType),
    detail("sleeve length", spec.sleeveLength),
    detail("waistline", spec.waistline),
    detail("hem length", spec.hemLength),
    detail("closure", spec.closure),
    detail("fabric", spec.fabric),
    detail("color", spec.color),
    detail("pattern", spec.pattern),
    detail("drape", spec.drape),
    detail("transparency", spec.transparency),
    detail("buttons", spec.buttons),
    detail("pockets", spec.pockets),
    detail("pleats", spec.pleats),
    detail("darts", spec.darts),
    detail("panel boundaries", spec.panelBoundaries),
    detail("embroidery", spec.embroidery),
    detail("lace", spec.lace),
    detail("beadwork", spec.beadwork),
    spec.keyDetails?.length ? `key details: ${spec.keyDetails.join(", ")}` : ""
  ].filter(Boolean);
}

export function getGarmentDisplayName(context: GarmentProductContext) {
  return context.garment.name.trim() || categoryNames[context.garment.category];
}

export function buildGarmentProductLine(context: GarmentProductContext, input: ProductAdapterInput) {
  if (!input.productPresent) return "";
  const descriptor = garmentDetails(context.garment);
  const referenceLine = `Use the uploaded ${getGarmentDisplayName(context)} ${categoryNames[context.garment.category]} as the only primary product reference.`;
  const detailLine = descriptor.length ? `Reference garment specification — ${descriptor.join("; ")}.` : "";
  return [referenceLine, detailLine].filter(Boolean).join(" ");
}

export function buildGarmentAccuracyLines(context: GarmentProductContext, input: ProductAdapterInput) {
  if (!input.productPresent) return [];
  const spec = context.garment;
  return [
    "Preserve the exact uploaded garment category, silhouette, overall proportions, shoulder structure, neckline, sleeve construction, sleeve length, waistline, garment length, hemline, closure, panel boundaries, seams, darts, pleats, buttons, pockets, and all visible construction details; do not redesign, simplify, add, remove, shorten, lengthen, tighten, or loosen the primary garment.",
    "Preserve the uploaded garment's exact fabric identity, surface texture, color relationship, pattern scale and placement, transparency, drape, embroidery, lace, beadwork, and visible key details; do not substitute materials, recolor the garment, invent decoration, or generate fake labels and logos.",
    spec.keyDetails?.length ? `Mandatory garment details to retain: ${spec.keyDetails.join(", ")}.` : "",
    buildGarmentMaterialGuard(spec),
    buildGarmentDecorativeGuard(spec),
    `Preserve the exact garment ease, body-to-garment spacing, shoulder fit, waist or bodice fit, sleeve volume, leg volume where relevant, garment length, and overall product-to-body proportion shown in the uploaded references.`
  ].filter(Boolean);
}

export function buildGarmentVisibilityLines(context: GarmentProductContext, input: ProductAdapterInput) {
  if (!input.productPresent) return [];
  const guard = getGarmentVisibilityGuard(context.garment.category, input.shotKind, context.garment);
  if (input.imageType === "拍摄花絮 / 材质图") {
    return [
      `Show only the garment construction, fabric, trim, or key detail needed for the material story, keeping ${guard.priorityStructures.slice(0, 4).join(", ")} unobstructed and structurally accurate.`
    ];
  }
  if (input.imageType === "产品静物图") {
    return [
      `Keep the complete primary garment readable at a truthful scale, with ${guard.priorityStructures.slice(0, 5).join(", ")} unobstructed.`
    ];
  }
  return [`Keep the primary garment clearly readable on the model: preserve ${guard.priorityStructures.join(", ")} without pose, hair, hands, bags, or supporting layers hiding the design.`, ...guard.obstructionRules, ...guard.poseRestrictions];
}

export function buildGarmentClippingLines(input: ProductAdapterInput) {
  if (!input.productPresent || input.imageType === "非产品氛围图") return [];
  if (input.imageType === "产品静物图" || input.imageType === "拍摄花絮 / 材质图") {
    return [
      "Keep garment edges, layers, folds, closures, trim, surface, support, and background physically separate, with natural contact and no fused fabric or floating construction."
    ];
  }
  return [
    "Dress the model naturally in the exact garment while keeping neck, shoulders, arms, torso, waist, hips, legs, skin, hair, supporting clothes, and accessories physically separate from every garment edge; no body penetration, fused layers, broken sleeves, duplicated closures, or impossible folds."
  ];
}

export function buildGarmentSceneControlLines(input: ProductAdapterInput) {
  if (!input.productPresent) return [];
  if (input.imageType === "产品静物图") {
    return [
      "Treat the uploaded garment as the absolute product subject; use a restrained garment still-life arrangement that preserves its full construction and does not convert it into a different styling item."
    ];
  }
  if (input.imageType === "拍摄花絮 / 材质图") {
    return [
      "Keep fabric, construction, trim, and garment-development details accurate to the uploaded primary garment and secondary to one coherent material story."
    ];
  }
  return [
    "The model must wear the uploaded primary garment rather than a similar substitute. Change only the supporting styling, scene, pose, gaze, and framing permitted by this image card."
  ];
}

export function buildGarmentCompositionLines(input: ProductAdapterInput) {
  if (!input.productPresent || input.scenePreference !== "棚内上新拍摄") return [];
  if (typeof input.studioLaunchShotIndex === "number") {
    const count = input.seriesImageCount ?? 1;
    return [
      `Garment launch series shot ${input.studioLaunchShotIndex + 1} of ${count}: keep the uploaded primary garment fully identifiable while varying only the assigned studio framing and controlled pose.`
    ];
  }
  return [
    "Use a controlled launch-studio garment composition that clearly presents the uploaded primary garment's silhouette, construction, fabric, color, and wearing proportions."
  ];
}

export function buildGarmentNegativePhrases(context: GarmentProductContext, input: ProductAdapterInput) {
  if (!input.productPresent) return [];
  const base = [
    "different garment",
    "garment redesign",
    "changed silhouette",
    "changed neckline",
    "changed shoulder structure",
    "changed sleeve type or length",
    "changed waistline",
    "changed hem length",
    "missing or extra closure",
    "missing or extra buttons",
    "missing or extra pockets",
    "changed pleats or darts",
    "broken panel boundaries",
    "changed fabric texture",
    "recolored garment",
    "changed pattern scale or placement",
    "incorrect transparency",
    "stiff or plastic drape",
    "invented embroidery, lace, or beadwork",
    "fake label or logo",
    "body clipping through garment",
    "fused garment layers",
    "garment hidden by hair, hands, bag, or supporting layers"
  ];
  return [...base, ...buildGarmentNegativeRules(input, context.garment.category, context.garment)];
}

export function buildGarmentStylingBoundaryLines(context: GarmentProductContext, input: ProductAdapterInput) {
  if (!input.productPresent) return [];
  const category = context.garment.category;
  const supportingBoundary =
    category === "top" || category === "shirt" || category === "knitwear"
      ? "Select only a supporting bottom, shoes, bag, and restrained accessories; never replace, cover, or layer over the primary top unless explicitly requested."
      : category === "trousers" || category === "skirt"
        ? "Select only a supporting top, shoes, bag, and restrained accessories; never replace or obscure the primary bottom garment."
        : category === "coat" || category === "jacket"
          ? "Select only quiet supporting inner layers, bottoms, shoes, and restrained accessories; keep the primary outerwear open or closed only as supported by its uploaded construction."
          : category === "dress" || category === "bridal"
            ? "Do not add a competing top, bottom, or outer layer over the primary garment; use only compatible shoes and restrained accessories."
            : category === "suit"
              ? "Treat the uploaded suit components as one locked primary product set; add only a quiet inner layer, shoes, and restrained accessories."
              : "Keep the uploaded garment as the immutable primary product and use only secondary styling that does not alter or hide it.";
  return [
    "Primary garment styling boundary: the uploaded garment occupies the primaryProduct role and cannot be replaced by the automatic outfit system.",
    supportingBoundary
  ];
}

export function getGarmentQualityLines(input: ProductAdapterInput) {
  if (!input.productPresent) return [];
  return [
    "Garment quality priority: construction continuity, truthful fabric behavior, exact color and pattern, natural wearing tension, clean layer separation, and faithful reference identity must remain stable across the complete image set."
  ];
}
