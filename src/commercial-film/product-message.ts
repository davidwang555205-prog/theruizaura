import type { ProductCoverage } from "../visual-system/taskReferenceBinding";
import type {
  CommercialProductMessage,
  CommercialProductMessageDimension,
  CommercialReferenceInput,
} from "./types";

const PRODUCT_DIMENSION_LIBRARY: Record<ProductCoverage, {
  label: string;
  message: string;
  detailMessage: string;
}> = {
  silhouette: {
    label: "Overall Silhouette",
    message: "Preserve the overall silhouette established by the current confirmed references.",
    detailMessage: "Hold the worn silhouette at a stable three-quarter angle without stretching or enlarging the shoe.",
  },
  toe_structure: {
    label: "Toe Structure",
    message: "Preserve the confirmed toe structure and its visible front profile.",
    detailMessage: "Observe the toe structure only as shown in the confirmed references; do not reshape or exaggerate it.",
  },
  side_panel_structure: {
    label: "Panel Relationship",
    message: "Preserve the confirmed side-panel relationships and structural transitions.",
    detailMessage: "Observe the confirmed panel transitions without inventing, simplifying, or moving any structural line.",
  },
  heel_structure: {
    label: "Heel Structure",
    message: "Preserve the confirmed heel structure and collar relationship.",
    detailMessage: "Observe the confirmed heel-to-collar relationship without changing its shape or scale.",
  },
  outsole_profile: {
    label: "Outsole Profile",
    message: "Preserve the confirmed outsole profile and ground relationship.",
    detailMessage: "Observe the confirmed outsole profile through a natural walking flex, never as a detached sole display.",
  },
  color_blocking: {
    label: "Color Relationship",
    message: "Preserve the confirmed color-blocking relationships without recoloring the product.",
    detailMessage: "Keep the confirmed color relationships stable across the shot; do not shift, intensify, or simplify them.",
  },
  material_evidence: {
    label: "Material Evidence",
    message: "Preserve confirmed material zones, surface behavior, and visible texture transitions.",
    detailMessage: "Observe one confirmed material transition or surface relationship while the person remains naturally grounded.",
  },
};

const PROHIBITED_PRODUCT_CLAIMS = [
  "no invented color",
  "no invented material",
  "no invented toe shape",
  "no invented outsole",
  "no invented panel or construction detail",
  "no invented logo",
  "no claim about comfort, durability, weight, or performance unless separately confirmed",
];

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function buildCommercialProductMessage(
  reference: CommercialReferenceInput,
  priority: ProductCoverage[],
  confirmedBrandSellingPoints: string[] = []
): CommercialProductMessage {
  const supportedCoverage = priority.filter((coverage) => reference.coverage.includes(coverage));
  const fallbackCoverage = reference.coverage.filter((coverage) => !supportedCoverage.includes(coverage));
  const supportedDimensions: CommercialProductMessageDimension[] = [...supportedCoverage, ...fallbackCoverage]
    .map((coverage) => ({
      coverage,
      ...PRODUCT_DIMENSION_LIBRARY[coverage],
    }));

  const confirmedPoints = uniqueStrings(confirmedBrandSellingPoints);
  const externalReferenceRequired = reference.confirmedReferenceCount === 0
    || supportedDimensions.length === 0;
  const source: CommercialProductMessage["source"] = externalReferenceRequired
    ? ["external_seedance_reference"]
    : [
        "current_task_product_truth",
        "confirmed_reference_set",
      ];
  if (confirmedPoints.length > 0) source.push("confirmed_brand_selling_points");

  const headline = externalReferenceRequired
    ? "External Reference-Bound Product Protection"
    : supportedDimensions.map((dimension) => dimension.label).join(" / ");
  const externalReferenceLine =
    "Use the footwear reference images uploaded in the external video generation tool as the only source of truth for the product. Do not invent or alter product details not supported by those references.";

  return {
    source,
    status: "READY",
    externalReferenceRequired,
    headline,
    supportedDimensions,
    confirmedBrandSellingPoints: confirmedPoints,
    evidenceLines: [
      externalReferenceRequired
        ? externalReferenceLine
        : `Use ${reference.confirmedReferenceCount} confirmed current-task product reference${reference.confirmedReferenceCount === 1 ? "" : "s"} as the only product source.`,
      ...supportedDimensions.map((dimension) => dimension.message),
      ...confirmedPoints.map((point) => `Confirmed brand selling point: ${point}`),
    ],
    prohibitedClaims: PROHIBITED_PRODUCT_CLAIMS,
    noFabricationLine: externalReferenceRequired
      ? externalReferenceLine
      : "Do not infer or name any product fact that is not visibly established by the current confirmed references or separately confirmed brand selling points.",
  };
}

export function productMessageSupportsCoverage(
  message: CommercialProductMessage,
  coverage: ProductCoverage
) {
  return message.supportedDimensions.some((dimension) => dimension.coverage === coverage);
}
