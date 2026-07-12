import type { TeamImageType, TeamScenePreference } from "../../../types";
import type { GarmentProductCategory, GarmentProductSpec } from "./garmentProductTypes";

export type GarmentShotKind = "fullFront" | "fullThreeQuarter" | "fullSide" | "fullBack" | "rearThreeQuarter" | "upperStructure" | "constructionDetail" | "lowerStructure" | "fabricDetail" | "mirrorTryOn" | "lifestyleWorn" | "stillLife" | "atmosphere" | "behindTheScenes";
export type GarmentShotPlanEntry = { id: string; name: string; purpose: string; shotKind: GarmentShotKind; framingLine: string; angleLine: string; productVisibilityLine: string; requiresBackReference?: boolean; allowsModel?: boolean; allowsProductAbsent?: boolean };

const priorities: Record<GarmentProductCategory, string[]> = {
  dress: ["neckline", "waistline", "sleeve", "skirt volume", "hem", "drape"], top: ["neckline", "shoulder", "sleeve", "hem", "fabric"], shirt: ["collar", "placket", "cuff", "buttons", "shoulder seam", "hem"], knitwear: ["knit texture", "neckline", "ribbing", "cuff", "hem", "drape"], tshirt: ["neckline", "shoulder", "sleeve", "body proportion", "hem", "fabric weight"], trousers: ["waistband", "front closure", "pocket", "rise", "leg shape", "hem"], skirt: ["waistband", "pleats or darts", "pocket", "slit", "skirt volume", "hem"], coat: ["collar or lapel", "shoulder", "sleeve", "front closure", "pocket", "hem", "back structure"], jacket: ["collar", "shoulder", "closure", "cuff", "pocket", "hem"], suit: ["lapel", "shoulder", "front closure", "sleeve", "pocket", "trouser waistband and leg", "full-set proportion"], set: ["all product pieces", "top/bottom proportion", "closure", "waistband", "hem", "material continuity"], activewear: ["neckline", "seam placement", "waistband", "stretch zones", "leg or sleeve shape", "fit", "fabric response"], bridal: ["neckline", "bodice", "waistline", "sleeve", "lace or embroidery", "skirt volume", "hem", "train", "referenced back construction"], eveningGown: ["neckline", "bodice", "waistline", "drape", "slit", "hem", "embellishment", "referenced back construction"], other: ["silhouette", "closure", "material", "hem", "visible construction"]
};

export function getGarmentShotDetailPriorities(category: GarmentProductCategory, spec?: GarmentProductSpec) {
  return [...(spec?.keyDetails ?? []), ...priorities[category]].filter((value, index, values) => values.indexOf(value) === index);
}

function entry(id: string, name: string, purpose: string, shotKind: GarmentShotKind, framingLine: string, angleLine: string, productVisibilityLine: string, extra: Partial<GarmentShotPlanEntry> = {}): GarmentShotPlanEntry { return { id, name, purpose, shotKind, framingLine, angleLine, productVisibilityLine, ...extra }; }

export function getGarmentShotPlan(input: { category: GarmentProductCategory; imageType: TeamImageType; scenePreference: TeamScenePreference; imageCount: 3 | 5 | 8; imageIndex: number; topic?: string; hasBackReference: boolean; spec?: GarmentProductSpec }): GarmentShotPlanEntry {
  const prioritiesLine = getGarmentShotDetailPriorities(input.category, input.spec).slice(0, 4).join(", ");
  const back = input.hasBackReference;
  const eight: GarmentShotPlanEntry[] = [
    entry("full-front", "全身正面", "建立完整服装轮廓、比例、颜色和长度", "fullFront", "Frame the model head-to-toe with the complete garment fully readable.", "Use a controlled straight front studio angle.", "Keep silhouette, hemline, shoulders, waistline, and all visible front construction unobstructed."),
    entry("full-three-quarter", "全身前侧", "展示体积、肩腰关系和垂坠", "fullThreeQuarter", "Frame the complete figure with generous space around the garment.", "Use a controlled 45-degree front three-quarter angle.", "Keep the garment's front and side structure readable without foreground distortion."),
    entry("full-side", "全身侧面", "展示侧面轮廓、厚度和衣摆深度", "fullSide", "Show the complete side silhouette from shoulder to hem.", "Use a clean side profile with natural stance.", "Preserve armhole, sleeve, side seam, garment depth, and hem separation."),
    back ? entry("full-back", "全身背面", "展示参考图支持的背面结构", "fullBack", "Frame the full back of the garment from shoulder to hem.", "Use a restrained straight-back studio angle.", "Preserve only the exact referenced back construction; do not redesign it.", { requiresBackReference: true }) : entry("rear-three-quarter", "后侧三分之四", "在缺少背面参考时安全展示后侧轮廓", "rearThreeQuarter", "Use a restrained rear three-quarter frame rather than a direct full-back view.", "Keep the body slightly turned so unseen back construction is not exposed.", "Do not invent unseen back construction; preserve only visible reference information."),
    entry("upper-structure", "上半身结构", "展示领口、肩部、袖型和门襟", "upperStructure", "Crop from upper torso to the top of the garment.", "Use a controlled medium framing.", `Prioritize ${prioritiesLine}; keep hands and hair away from these structures.`),
    entry("construction-detail", "工艺细节", "展示最重要的服装工艺细节", "constructionDetail", "Use a close but truthful product-detail crop.", "Use a stable detail angle without macro distortion.", `Prioritize ${prioritiesLine}; hands must not cover the target detail.`),
    entry("lower-structure", "下半身结构", "展示腰线、口袋、下摆或裤腿", "lowerStructure", "Crop around the lower garment structure while preserving truthful scale.", "Use a controlled lower-body detail angle.", `Prioritize ${prioritiesLine}; do not turn shoes into the subject.`),
    entry("fabric-drape", "面料与自然动态", "展示面料表面、光线响应和克制垂坠", "fabricDetail", "Show a controlled fabric or restrained movement detail.", "Use soft directional light and natural fabric motion.", "Preserve fabric weight, texture, drape, color, and construction without inventing details.")
  ];
  const five: GarmentShotPlanEntry[] = [eight[0], eight[1], back ? eight[3] : eight[4], eight[5], eight[7]];
  const three: GarmentShotPlanEntry[] = [eight[0], input.imageType === "对镜穿搭图" ? entry("mirror-try-on", "对镜试穿", "记录真实试穿比例", "mirrorTryOn", "Frame a believable full or three-quarter mirror try-on record.", "Use stable mirror perspective without distortion.", "Keep neckline, shoulders, waistline, hem, and garment proportions readable.") : eight[1], eight[5]];
  const plan = input.imageCount === 8 ? eight : input.imageCount === 5 ? five : three;
  return plan[Math.min(input.imageIndex, plan.length - 1)];
}
