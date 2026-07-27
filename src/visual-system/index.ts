import motherJson from "../../visual-system/config/brand-visual-mother-v1.2.json";
import anchorsJson from "../../visual-system/config/anchor-manifest.json";
import casesJson from "../../visual-system/validation/cases/pre-phase-3a-validation-cases.json";
import { buildProductTruth, buildValidationTasks, validateAnchors, validateFrozenMother, type ProductEvidence, type ProductTruth } from "./types";

export const brandVisualMother = validateFrozenMother(motherJson as unknown as Parameters<typeof validateFrozenMother>[0]);
export const anchorManifest = validateAnchors(anchorsJson as unknown as Parameters<typeof validateAnchors>[0]);
export const validationCases = casesJson.cases;
export function createVisualValidationWorkspace(evidence: ProductEvidence[]): { productTruth: ProductTruth; tasks: ReturnType<typeof buildValidationTasks> } {
  const productTruth = buildProductTruth(evidence);
  return { productTruth, tasks: buildValidationTasks(validationCases, productTruth) };
}
