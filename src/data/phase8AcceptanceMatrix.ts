import type { ShoeCategory } from "../modules/product/shoe/shoeProductTypes";

export type Phase8AcceptanceCase = {
  mode: "shoe" | "garment";
  category?: ShoeCategory;
  caseId: string;
  label: string;
  imageCount: 1 | 3 | 5 | 8;
  topic: "single" | "生活场景软种草" | "棚内上新拍摄";
  requiredReferenceRoles: string[];
  expectedPromptTerms: string[];
  forbiddenPromptTerms: string[];
};

const activeCategories: Array<{ category: ShoeCategory; label: string; expected: string[]; forbidden: string[] }> = [
  { category: "germanTrainer", label: "German trainer", expected: ["German trainer", "slim outsole"], forbidden: ["shaft height", "backless edge"] },
  { category: "pump", label: "Pump", expected: ["closed-toe pump", "heel height"], forbidden: ["sneaker", "shaft height"] },
  { category: "boot", label: "Boot", expected: ["boot", "shaft height"], forbidden: ["closed-toe pump", "backless edge"] },
  { category: "loafer", label: "Loafer", expected: ["loafer", "apron"], forbidden: ["shaft height", "backless edge"] },
  { category: "balletFlat", label: "Ballet flat", expected: ["ballet flat", "shallow vamp"], forbidden: ["apron", "shaft height"] },
  { category: "sandal", label: "Sandal", expected: ["sandal", "strap"], forbidden: ["backless edge", "shaft height"] },
  { category: "mule", label: "Mule", expected: ["mule", "backless edge"], forbidden: ["ankle strap", "shaft height"] }
];

export const phase8AcceptanceMatrix: Phase8AcceptanceCase[] = [
  { mode: "garment", caseId: "garment-single", label: "Garment single", imageCount: 1, topic: "single", requiredReferenceRoles: ["front"], expectedPromptTerms: ["Garment"], forbiddenPromptTerms: ["sneaker", "pump", "boot"] },
  ...activeCategories.flatMap(({ category, label, expected, forbidden }) => ([1, 3, 5, 8] as const).map((imageCount) => ({ mode: "shoe" as const, category, caseId: `${category}-${imageCount}`, label: `${label} ${imageCount}`, imageCount, topic: imageCount === 8 ? "棚内上新拍摄" as const : imageCount === 1 ? "single" as const : "生活场景软种草" as const, requiredReferenceRoles: ["primary", "fullSide"], expectedPromptTerms: expected, forbiddenPromptTerms: forbidden })))
];

export const phase8ActiveShoeCategories = activeCategories.map(({ category }) => category);
