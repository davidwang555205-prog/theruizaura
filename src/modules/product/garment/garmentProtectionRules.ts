import type { ProductAdapterInput } from "../types";
import type { GarmentClothingRole, GarmentProductContext, GarmentProductSpec, GarmentReferenceScope } from "./garmentProductTypes";
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
  const roles = [...new Set(input.garmentClothingRoles ?? [])].sort();
  const completeCategories = new Set(["dress", "suit", "set", "bridal", "eveningGown"]);
  const completeRoleMarkers = new Set<GarmentClothingRole>(["onePiece", "coordinatedSet"]);
  const compatibleSingleRoles: Partial<Record<GarmentProductSpec["category"], GarmentClothingRole[]>> = {
    top: ["primaryTop", "innerLayer"],
    shirt: ["primaryTop", "innerLayer"],
    knitwear: ["primaryTop", "innerLayer"],
    tshirt: ["primaryTop", "innerLayer"],
    trousers: ["bottom"],
    skirt: ["bottom"],
    coat: ["outerLayer"],
    jacket: ["outerLayer"]
  };
  const inferredScope: GarmentReferenceScope =
    completeCategories.has(category) || roles.length >= 2 || roles.some((role) => completeRoleMarkers.has(role))
      ? "completeLook"
      : roles.length === 1 && compatibleSingleRoles[category]?.includes(roles[0])
        ? "singleItem"
        : "uncertain";
  const requestedScope = input.garmentReferenceScope;
  const scope: GarmentReferenceScope =
    requestedScope === "completeLook"
      ? "completeLook"
      : requestedScope === "singleItem" && inferredScope === "singleItem"
        ? "singleItem"
        : inferredScope === "completeLook"
          ? "completeLook"
          : "uncertain";
  const completeLookLine = "Treat every garment visible in the uploaded reference as one complete locked look. Preserve the exact outer layer, inner layer, top, bottom, colors, materials, silhouettes, lengths, wearing relationships, and layering order shown in the reference. Keep this complete clothing combination unchanged across the image set. Change only the scene, pose, gaze, action, and framing.";
  const uncertainLine = "Preserve all clothing visible in the uploaded reference exactly as shown and treat it as one locked look. Keep the complete visible clothing combination unchanged across the image set and add no new clothing identity.";
  if (scope === "completeLook") return [completeLookLine];
  if (scope !== "singleItem") return [uncertainLine];
  const pools: Partial<Record<GarmentProductSpec["category"], string[]>> = {
    top: ["Add only quiet straight trousers as necessary lower-body coverage, using a visually recessive palette relationship derived from the uploaded top.", "Add only a restrained plain midi skirt as necessary lower-body coverage, keeping it visually secondary to the uploaded top."],
    shirt: ["Add only relaxed clean-cut trousers as necessary lower-body coverage, with a non-competing palette relationship derived from the uploaded shirt.", "Add only a simple plain skirt as necessary lower-body coverage, keeping it visually secondary to the uploaded shirt."],
    knitwear: ["Add only clean straight trousers as necessary lower-body coverage, keeping their surface and palette subordinate to the uploaded knitwear.", "Add only a restrained column skirt as necessary lower-body coverage without competing texture or decoration."],
    tshirt: ["Add only clean unembellished trousers as necessary lower-body coverage, using a restrained palette relationship derived from the uploaded T-shirt.", "Add only simple tailored shorts when season and coverage make them appropriate, keeping them visually secondary."],
    trousers: ["Add only a clean plain top as necessary upper-body coverage, using a visually recessive palette relationship derived from the uploaded trousers.", "Add only a restrained fine-knit top as necessary upper-body coverage without competing pattern, texture, or decoration."],
    skirt: ["Add only a simple plain shirt as necessary upper-body coverage, keeping its structure and palette subordinate to the uploaded skirt.", "Add only a quiet undecorated top as necessary upper-body coverage, keeping it visually secondary to the uploaded skirt."],
    coat: ["Add only a plain inner base and a quiet straight bottom as necessary coverage beneath the uploaded coat; preserve every visible coat edge, layer, and closure detail.", "Add only a restrained fine-knit inner layer and a clean bottom as necessary coverage beneath the uploaded coat, deriving their palette relationship from the reference."],
    jacket: ["Add only a plain inner base and a quiet straight bottom as necessary coverage beneath the uploaded jacket; preserve every visible jacket edge, layer, and closure detail.", "Add only a simple inner top and a restrained bottom as necessary coverage beneath the uploaded jacket, keeping both visually secondary."]
  };
  const pool = pools[category] ?? [];
  if (!pool.length) return [uncertainLine];
  const supportingLine = pool[Math.abs(input.generationNonce) % pool.length];
  return [
    "Keep the uploaded item as the exact and only primary garment. Preserve its color, material, silhouette, construction, length, and wearing details.",
    supportingLine,
    `Series styling lock: keep this supporting selection unchanged across every image in the set.`
  ];
}

export function getGarmentQualityLines(input: ProductAdapterInput) {
  if (!input.productPresent) return [];
  return [
    "Garment quality priority: construction continuity, truthful fabric behavior, exact color and pattern, natural wearing tension, clean layer separation, and faithful reference identity must remain stable across the complete image set."
  ];
}
