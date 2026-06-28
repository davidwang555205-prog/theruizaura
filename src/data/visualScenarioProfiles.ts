import type { StandardSceneKey } from "./outfitDiversityRules";

export type BackgroundDensity =
  | "minimalStudio"
  | "workingTable"
  | "privateInterior"
  | "quietDaily"
  | "normalDaily"
  | "lightActivity";

export const backgroundDensityLines: Record<BackgroundDensity, string> = {
  minimalStudio:
    "Keep a sparse physical background with one surface transition, accurate contact shadows, and no props unless one neutral support is essential.",
  workingTable:
    "Keep one organized work surface with three to five purposeful materials or tools, natural overlap, and no decorative filler.",
  privateInterior:
    "Keep a lightly used private interior with two quiet spatial cues and clear outfit space.",
  quietDaily:
    "Keep a quiet inhabited setting with one distant human trace and two location-specific details.",
  normalDaily:
    "Use normal daily activity with two or three distant people when appropriate and varied spatial depth.",
  lightActivity:
    "Use light everyday activity in the middle and far distance without competing with the subject."
};

const streetDetails = [
  "Include mild pavement wear, varied storefront depth, and one naturally parked bicycle or scooter without readable branding.",
  "Include a repaired curb edge, uneven tree shadows, and two softly separated background pedestrians moving in different directions.",
  "Include one half-open shop door, realistic window reflections, and subtle surface aging rather than a perfectly polished retail street.",
  "Include a utility cover, a lightly worn threshold, and one distant delivery bicycle placed with believable scale.",
  "Include small variations in paving tone, a recessed doorway, and restrained daily foot traffic with no staged crowd."
];

const interiorDetails = [
  "Include one shifted chair, natural curtain folds, and a lightly used phone case or small ceramic tray, all clean but not perfectly arranged.",
  "Include a soft garment fold, a slightly open wardrobe edge, and believable floor wear where daily movement occurs.",
  "Include a used book edge, a cup ring shadow, and naturally settled fabric rather than symmetrical styling.",
  "Include a practical doorway transition, one everyday object set down with weight, and imperfect reflected light."
];

const windowDetails = [
  "Include a used book edge, a cup ring shadow, and naturally settled curtain fabric rather than symmetrical styling.",
  "Include one page left slightly open, varied window shadows, and a softly compressed chair cushion.",
  "Include a practical reading light, a shifted magazine edge, and subtle daylight variation across the surface."
];

const deskDetails = [
  "Include a slightly shifted notebook, one pen, and a natural cup shadow with no decorative stationery display.",
  "Include one folded document edge, understated glasses, and a lightly used desk surface kept orderly.",
  "Include a practical laptop edge, a loose page, and realistic cable placement without office clutter."
];

const transitDetails = [
  "Include mild floor wear, realistic corridor joints, and two distant commuters at different depths without readable signage.",
  "Include a practical wall transition, varied overhead-light falloff, and restrained pedestrian movement through the passage.",
  "Include one directional floor change, a recessed entrance edge, and softly separated daily foot traffic."
];

const hotelDetails = [
  "Include a neat suitcase edge, a folded itinerary card, and a natural curtain fold; keep travel traces orderly and sparse.",
  "Include one folded garment, a softly indented chair cushion, and realistic window reflection without tourist display styling.",
  "Include a luggage handle near the wardrobe, a used but tidy bedside surface, and warm-neutral ambient falloff."
];

const gymDetails = [
  "Include realistic equipment spacing, mild floor wear, and one or two distant gym users softly out of focus; do not add extra hand-held sports props.",
  "Include a used bench surface, believable rubber-floor variation, and one distant movement trace without sports-campaign energy.",
  "Include natural mirror depth, equipment with practical clearance, and a quiet background user rather than an empty showroom gym."
];

const indoorSocialDetails = [
  "Include one naturally shifted chair, subtle tabletop wear, and softly separated background guests without readable menu text.",
  "Include realistic table spacing, one used ceramic cup or glass, and gentle window-to-interior light variation without food styling.",
  "Include a practical aisle, restrained counter depth, and one quiet sign of recent use rather than a perfectly arranged cafe set."
];

const galleryDetails = [
  "Include realistic artwork spacing, subtle wall-light falloff, and one or two quiet visitors at different depths without readable labels.",
  "Include a lightly worn gallery floor, a restrained bench edge, and varied frame spacing rather than repeated AI-generated artwork.",
  "Include practical walking clearance, soft wall texture, and one folded leaflet edge with unreadable text kept secondary."
];

const studioDetails = [
  "Include a real seamless-paper floor transition, faint floor scuffs, and consistent soft shadow falloff; keep props absent or singular.",
  "Include subtle backdrop texture, one practical floor mark, and a restrained off-frame production trace without visible equipment clutter.",
  "Include a matte floor-to-backdrop transition and a naturally weighted garment hem, avoiding perfect CGI smoothness."
];

const stillLifeDetails = [
  "Use natural contact shadow, slight material grain variation, and gently settled laces so the product feels physically present.",
  "Use a believable surface seam, restrained edge wear, and accurate material response rather than floating product perfection.",
  "Use one tactile support material at most, with real weight, small fiber variation, and clean product contact."
];

const worktableDetails = [
  "Include one curled swatch edge, a slightly shifted color card, and concise handwritten working notes with no readable brand copy.",
  "Include natural paper overlap, a used care brush, and thread or lace tension placed with physical weight.",
  "Include a real shot-list edge, one material sample stack, and a subtle hand-work trace without catalog-like arrangement."
];

const atmosphereDetails = [
  "Include one personal daily trace, one tactile surface detail, and one light transition that belongs only to the selected setting.",
  "Use a slightly shifted everyday object, naturally settled fabric, and a quiet sign of recent use without adding unrelated props.",
  "Use believable object spacing, small surface variation, and restrained human absence so the scene feels recently lived in."
];

const summerOutdoorDetails = [
  "Include one weathered path edge, natural shade variation, and distant daily visitors appropriate to the selected leisure setting.",
  "Include realistic ground texture, one restrained holiday trace, and softly separated background activity without sports props.",
  "Include mild surface wear, natural vegetation variation, and a believable route through the selected summer setting."
];

export function getVisualScenarioDetailPool(sceneKey: StandardSceneKey, scenePreference = "") {
  if (/咖啡馆内|朋友午餐/.test(scenePreference) || sceneKey === "lightSocial") return indoorSocialDetails;
  if (/美术馆/.test(scenePreference) || sceneKey === "galleryExhibition") return galleryDetails;
  if (/窗边阅读/.test(scenePreference)) return windowDetails;
  if (/工作台 \/ 桌边整理/.test(scenePreference)) return deskDetails;
  if (/地铁|商场通道|停车场到电梯口/.test(scenePreference)) return transitDetails;
  if (/衣帽间|更衣角|入户镜前|回家进门/.test(scenePreference)) return interiorDetails;
  if (/酒店|旅行/.test(scenePreference)) return hotelDetails;
  if (/材质工作台|拍摄花絮/.test(scenePreference)) return worktableDetails;
  if (/游乐园|海边|草原|公园|社区步道|自驾/.test(scenePreference)) return summerOutdoorDetails;
  if (sceneKey === "studioLaunch") return studioDetails;
  if (sceneKey === "stillLife") return stillLifeDetails;
  if (sceneKey === "materialTable") return worktableDetails;
  if (sceneKey === "gymInterior") return gymDetails;
  if (sceneKey === "hotelTravel") return hotelDetails;
  if (sceneKey === "mirrorCloset" || sceneKey === "entrywayDeparture") return interiorDetails;
  if (sceneKey === "atmosphere") return atmosphereDetails;
  return streetDetails;
}

export function getDefaultBackgroundDensity(sceneKey: StandardSceneKey, scenePreference = ""): BackgroundDensity {
  if (/咖啡馆内|朋友午餐|美术馆/.test(scenePreference) || sceneKey === "lightSocial" || sceneKey === "galleryExhibition") {
    return "normalDaily";
  }
  if (/窗边阅读|衣帽间|更衣角|入户镜前|回家进门|桌边整理|地铁|商场通道|酒店|旅行/.test(scenePreference)) {
    return "privateInterior";
  }
  if (/材质工作台|拍摄花絮/.test(scenePreference) || sceneKey === "materialTable") return "workingTable";
  if (sceneKey === "studioLaunch" || sceneKey === "stillLife") {
    return "minimalStudio";
  }
  if (sceneKey === "mirrorCloset" || sceneKey === "entrywayDeparture" || sceneKey === "hotelTravel") {
    return "privateInterior";
  }
  if (sceneKey === "gymInterior") return "normalDaily";
  if (sceneKey === "atmosphere") return "quietDaily";
  return "normalDaily";
}
