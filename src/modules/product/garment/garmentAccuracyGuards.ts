import type { ProductAdapterInput } from "../types";
import type { GarmentProductCategory, GarmentProductSpec } from "./garmentProductTypes";

export type GarmentVisibilityGuard = { priorityStructures: string[]; obstructionRules: string[]; poseRestrictions: string[] };

const priorities: Record<GarmentProductCategory, string[]> = {
  dress: ["neckline", "shoulders or straps", "waistline", "bodice", "skirt volume", "hemline", "drape"],
  top: ["neckline", "shoulders", "armholes", "sleeves", "body width", "hemline", "fabric surface"],
  shirt: ["collar", "placket", "button line", "shoulder seams", "cuffs", "sleeve length", "shirt hem"],
  knitwear: ["neckline", "knit texture", "shoulder", "sleeve volume", "ribbing", "cuffs", "hemline", "body ease"],
  tshirt: ["neckline", "shoulders", "sleeve opening", "body proportion", "fabric weight", "hemline"],
  trousers: ["waistband", "rise", "front closure", "pockets", "hip ease", "leg shape", "trouser length", "hem"],
  skirt: ["waistband", "waist fit", "pleats or darts", "pockets", "slit", "volume", "length", "hem"],
  coat: ["collar or lapel", "shoulders", "sleeves", "front closure", "buttons", "pockets", "length", "hem"],
  jacket: ["collar", "shoulders", "sleeves", "cuffs", "front closure", "pockets", "hem"],
  suit: ["jacket shoulders", "lapels", "button stance", "waist shape", "sleeves", "pockets", "trouser waistband", "trouser leg"],
  set: ["all uploaded pieces", "top/bottom relationship", "waist transition", "material and color continuity", "hem relationship"],
  activewear: ["neckline", "seam placement", "waistband", "fit zones", "sleeve or leg shape", "fabric response"],
  bridal: ["neckline", "bodice", "waistline", "sleeves", "lace", "embroidery", "beadwork", "skirt volume", "hem", "train"],
  eveningGown: ["neckline", "bodice", "waistline", "drape", "slit", "hem", "embellishment"],
  other: ["user-specified key details", "silhouette", "closure", "material", "hem"]
};

export function getGarmentVisibilityGuard(category: GarmentProductCategory, shotKind = "", spec?: GarmentProductSpec): GarmentVisibilityGuard {
  const custom = spec?.keyDetails ?? [];
  const detailShot = /detail|construction|upperStructure|lowerStructure|fabric/i.test(shotKind);
  const priorityStructures = Array.from(new Set([...custom, ...priorities[category]])).slice(0, detailShot ? 8 : 6);
  return {
    priorityStructures,
    obstructionRules: detailShot
      ? [`Keep hands, bags, hair, phones, flowers, books, scarves, and furniture away from ${priorityStructures.slice(0, 4).join(", ")}.`, "Do not pinch, pull, stretch, or reshape the target garment structure."]
      : ["Keep hands, bags, hair, props, furniture, and supporting layers from hiding the primary garment silhouette, priority structures, or hemline."],
    poseRestrictions: /sitting/i.test(shotKind) ? ["Avoid seated compression when documenting exact length, waistline, skirt volume, trouser rise, or train."] : ["Use restrained standing, walking, or turning; natural folds may vary but garment construction, length, and proportions must not change."]
  };
}

export function buildGarmentMaterialGuard(spec: GarmentProductSpec) {
  const known = [spec.fabric, spec.color, spec.pattern, spec.drape, spec.transparency].filter(Boolean).join("; ");
  return known
    ? `Preserve the referenced garment material response${known ? ` (${known})` : ""}: fabric family, surface texture, weight, thickness, opacity, sheen, drape, stretch appearance, wrinkle behavior, and light response; scene light may change brightness but never material identity or base color.`
    : "Preserve the exact material appearance, surface texture, thickness, opacity, sheen, drape, and light response shown in the uploaded references; do not invent fiber composition or performance claims.";
}

export function buildGarmentDecorativeGuard(spec: GarmentProductSpec) {
  if (![spec.pattern, spec.embroidery, spec.lace, spec.beadwork, spec.keyDetails?.join(" ")].some(Boolean)) return "";
  return "Treat visible pattern placement, print scale, embroidery, lace motifs, beadwork, logos, lettering, trim, and decorative boundaries as fixed product geometry. Do not mirror, redraw, simplify, relocate, resize, recolor, duplicate, remove, or invent them.";
}

export function buildGarmentNegativeRules(input: ProductAdapterInput, category: GarmentProductCategory, spec: GarmentProductSpec) {
  if (!input.productPresent) return [];
  const common = ["garment redesign", "changed proportions or length", "invented construction", "floating garment", "body-fabric intersection", "fused layers"];
  const imageType = input.imageType;
  if (imageType === "产品静物图") return [...common, "model anatomy", "walking action", "impossible folding", "duplicate collars or cuffs", "props burying the garment"];
  if (imageType === "非产品氛围图") return ["forced full garment hero", "unrelated branded props", "fake logo"];
  const worn = imageType === "产品上脚图" || imageType === "对镜穿搭图" || imageType === "生活场景图";
  return [...common, ...(worn ? ["hands, hair, bags, or props covering priority structures", "pose-driven silhouette change", "incorrect garment scale"] : ["wrong target detail", "hands covering the target detail", "changed material texture", "fake process claims"]), ...(category === "bridal" ? ["invented train", "bouquet covering bodice", "hair covering neckline or back"] : []), ...(category === "activewear" ? ["impossible compression", "unsupported performance claim"] : [])];
}

export function validateGarmentGuardLines(lines: string[]) {
  const normalized = lines.map((line) => line.trim()).filter(Boolean);
  const duplicates = normalized.filter((line, index) => normalized.indexOf(line) !== index);
  return { valid: duplicates.length === 0, errors: Array.from(new Set(duplicates.map((line) => `Duplicate guard line: ${line}`))), warnings: [] as string[] };
}
