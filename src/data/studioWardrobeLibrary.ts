import type { TeamGarmentType, TeamSeason, TeamStudioWardrobePreference } from "../types";

export type StudioWardrobeDefinition = {
  id: TeamStudioWardrobePreference;
  label: string;
  garmentType: TeamGarmentType;
  garmentCategory: "top" | "bottom" | "onePiece" | "outerLayer";
  supportedSeasons: TeamSeason[];
  silhouetteLine: string;
  materialLine: string;
  paletteOptions: string[];
  shoeVisibilityLine: string;
  forbiddenLine: string;
  hemConstraintLine: string;
  priority: "core" | "support";
  compatibleShoeNotes: Record<string, number>;
};

const ALL_SEASONS: TeamSeason[] = ["春", "夏", "秋", "冬"];
const SPRING_AUTUMN_WINTER: TeamSeason[] = ["春", "秋", "冬"];
const SPRING_SUMMER: TeamSeason[] = ["春", "夏"];
const SPRING_AUTUMN: TeamSeason[] = ["春", "秋"];
const AUTUMN_WINTER: TeamSeason[] = ["秋", "冬"];

const TROUSERS_HEM =
  "The trouser hem must stop at the ankle so both sneakers and their outer soles are fully visible; no trouser break covering the shoe tongue, no fabric pooling on the foot, no floor-length hem.";
const SHORTS_HEM =
  "The shorts must sit near the knee with a clean tailored hem that keeps both sneakers fully visible and uncovered.";
const SKIRT_HEM =
  "The skirt must fall between below the knee and mid-calf so both sneakers remain fully visible with no hem touching the shoe or floor.";
const JACKET_HEM =
  "The outer layer must end above the knee so the lower body proportions and both sneakers stay clearly readable.";

// --- TOPS ---
const fineGaugeShortSleeveKnit: StudioWardrobeDefinition = {
  id: "fineGaugeShortSleeveKnit",
  label: "精细针织短袖",
  garmentType: "trousers",
  garmentCategory: "top",
  supportedSeasons: ["春", "夏", "秋"],
  silhouetteLine:
    "A fine-gauge short-sleeve knit with a clean shoulder line, a controlled neckline, and a tailored but not tight body. The sleeves end at mid-bicep and the hem stops at the hip.",
  materialLine:
    "Use a compact fine-gauge mercerized cotton, silk-cotton, or lightweight merino knit with a dense matte surface and no sheer transparency.",
  paletteOptions: ["cream", "ivory", "oatmeal", "light grey", "charcoal", "black", "mist blue-grey"],
  shoeVisibilityLine: "The top sits above the hip so it does not cover the waistband or interfere with sneaker visibility.",
  forbiddenLine: "Avoid clinging bodycon fabric, sheer material, visible bra outline, ribbed tank styling, or casual t-shirt drape.",
  hemConstraintLine: "",
  priority: "core",
  compatibleShoeNotes: { "Cloud Dancer": 3, "Sand Dollar": 2, "Cappuccino": 2, "Silver Romance": 2, "Delphinium Blue": 3 }
};

const knitPolo: StudioWardrobeDefinition = {
  id: "knitPolo",
  label: "针织 Polo",
  garmentType: "trousers",
  garmentCategory: "top",
  supportedSeasons: ["春", "夏", "秋"],
  silhouetteLine:
    "A fine-knit polo with a small precise collar, a restrained three-button placket, and a clean tailored body that does not cling.",
  materialLine:
    "Use a lightweight compact-knit cotton-silk or fine merino with a smooth matte surface and structured drape.",
  paletteOptions: ["light grey", "charcoal", "black", "oatmeal", "mist blue-grey", "cream"],
  shoeVisibilityLine: "The top ends at the hip so both sneakers and the waistband remain fully readable.",
  forbiddenLine: "Avoid oversized sport polo, pique texture, chest logo, large buttons, or preppy stripe detailing.",
  hemConstraintLine: "",
  priority: "core",
  compatibleShoeNotes: { "Cloud Dancer": 2, "Sand Dollar": 2, "Silver Romance": 3 }
};

const mockNeckFineKnit: StudioWardrobeDefinition = {
  id: "mockNeckFineKnit",
  label: "半高领精细针织",
  garmentType: "trousers",
  garmentCategory: "top",
  supportedSeasons: ["秋", "冬"],
  silhouetteLine:
    "A fine-gauge mock-neck or controlled high-neck knit that follows the neck closely without choking it and keeps the shoulder line clean and precise.",
  materialLine:
    "Use a dense fine merino, cashmere-blend, or compact wool-silk knit with a matte surface and soft structured drape.",
  paletteOptions: ["cream", "oatmeal", "charcoal", "black", "warm grey", "cocoa grey"],
  shoeVisibilityLine: "The knit ends at the hip so the waistband and full sneaker silhouette stay visible.",
  forbiddenLine: "Avoid heavy roll-neck, chunky fisherman knit, baggy cowl-neck, or ski-sweater styling.",
  hemConstraintLine: "",
  priority: "core",
  compatibleShoeNotes: { "Cloud Dancer": 2, "Cappuccino": 3, "Sand Dollar": 2, "Maple Grove": 2 }
};

const relaxedIvoryShirt: StudioWardrobeDefinition = {
  id: "relaxedIvoryShirt",
  label: "象牙白松弛衬衫",
  garmentType: "trousers",
  garmentCategory: "top",
  supportedSeasons: ALL_SEASONS,
  silhouetteLine:
    "An ivory or warm-white shirt with a relaxed but clean shoulder line, a precise collar, and a slightly eased body that moves naturally without looking oversized or borrowed.",
  materialLine:
    "Use a silk-cotton, compact poplin, or lightweight twill with a soft matte finish and gentle drape.",
  paletteOptions: ["ivory", "cream", "warm white", "soft stone"],
  shoeVisibilityLine: "The shirttail hem ends near the hip so the waistband and sneakers remain visible.",
  forbiddenLine: "Avoid boyfriend oversize, pajama collar, wrinkled linen mess, or sheer organza styling.",
  hemConstraintLine: "",
  priority: "core",
  compatibleShoeNotes: { "Cloud Dancer": 2, "Cappuccino": 3, "Sand Dollar": 3, "Delphinium Blue": 2 }
};

const sleevelessMinimalTop: StudioWardrobeDefinition = {
  id: "sleevelessMinimalTop",
  label: "黑色或炭灰无袖上装",
  garmentType: "trousers",
  garmentCategory: "top",
  supportedSeasons: ["春", "夏"],
  silhouetteLine:
    "A sleeveless top with clean armholes, a structured shoulder, and a precise torso line that is fitted but not tight. The neckline is modest and restrained.",
  materialLine:
    "Use a compact double-knit jersey, fine-gauge wool, or dense matte cotton-silk with body and structure.",
  paletteOptions: ["black", "charcoal", "dark grey"],
  shoeVisibilityLine: "The top ends at the hip so both sneakers and the lower body remain unobstructed.",
  forbiddenLine: "Avoid spaghetti strap, camisole, exposed bra, bandage top, or lingerie-inspired styling.",
  hemConstraintLine: "",
  priority: "core",
  compatibleShoeNotes: { "Silver Romance": 3, "Cloud Dancer": 2, "Oreo": 2, "Panda": 2 }
};

// --- TROUSERS ---
const highWaistStraightTrousers: StudioWardrobeDefinition = {
  id: "highWaistStraightTrousers",
  label: "高腰直筒西裤",
  garmentType: "trousers",
  garmentCategory: "bottom",
  supportedSeasons: ALL_SEASONS,
  silhouetteLine:
    "A mid-to-high-rise straight-leg trouser with a flat front, a clean waistband, and a straight vertical leg that falls naturally from the hip to the ankle. The leg width is classic, not wide, not tapered.",
  materialLine:
    "Use high-twist wool, wool-silk, or compact tropical wool with a matte surface, clean crease retention, and structured drape.",
  paletteOptions: ["soft stone", "warm grey", "oatmeal", "greige", "taupe", "charcoal", "black"],
  shoeVisibilityLine: TROUSERS_HEM,
  forbiddenLine: "Avoid pooling fabric, cropped ankle-baring lengths, baggy hip, tight skinny silhouette, or stretch-jersey office trouser.",
  hemConstraintLine: "The hem must clear both sneakers fully so the toe box, laces, side panels, and outer sole are completely visible.",
  priority: "core",
  compatibleShoeNotes: { "Cloud Dancer": 3, "Sand Dollar": 2, "Cappuccino": 3, "Silver Romance": 3, "Delphinium Blue": 2 }
};

const wideStraightTailoredTrousers: StudioWardrobeDefinition = {
  id: "wideStraightTailoredTrousers",
  label: "宽直筒西裤",
  garmentType: "trousers",
  garmentCategory: "bottom",
  supportedSeasons: ALL_SEASONS,
  silhouetteLine:
    "A wide-leg tailored trouser with a vertical crease, a clean flat front, and generous but controlled width through the leg. The hem ends 2-4 cm above the floor.",
  materialLine:
    "Use high-twist wool, silk-wool, or worsted suiting with a matte surface, precise drape, and clean crease line.",
  paletteOptions: ["charcoal", "black", "warm grey", "soft stone", "greige", "taupe"],
  shoeVisibilityLine: "The wider hem must stop clearly above the sneaker so the entire shoe remains visible; the fabric must not pool, cast heavy shadow over, or touch the foot.",
  forbiddenLine: "Avoid dragging hem, floor-length puddle, pooling fabric on shoes, or exaggerated oversized palazzo width.",
  hemConstraintLine: "The hem must end at least 2 cm above the sneaker collar so the shoe, laces, and outer sole stay fully exposed.",
  priority: "core",
  compatibleShoeNotes: { "Cloud Dancer": 3, "Silver Romance": 2, "Delphinium Blue": 3, "Sand Dollar": 2 }
};

const croppedCigaretteTrousers: StudioWardrobeDefinition = {
  id: "croppedCigaretteTrousers",
  label: "九分烟管裤",
  garmentType: "trousers",
  garmentCategory: "bottom",
  supportedSeasons: ALL_SEASONS,
  silhouetteLine:
    "An ankle-length straight narrow trouser with a clean flat front, a straight narrow leg, and a precise hem that stops just above the ankle bone, exposing the full sneaker collar and tongue.",
  materialLine:
    "Use compact wool, wool-silk, or dense cotton-twill with a matte surface and crisp hem edge.",
  paletteOptions: ["black", "charcoal", "dark navy", "warm grey", "taupe"],
  shoeVisibilityLine: "The cropped hem must clearly expose the sneaker collar, tongue, lace eyelets, side panels, and outer sole.",
  forbiddenLine: "Avoid leggings, skinny jeans, jeggings, pencil-tight silhouette, or stretch-jersey office pant.",
  hemConstraintLine: "The hem must end above the sneaker collar so the shoe opening, tongue, and top eyelets are completely visible.",
  priority: "core",
  compatibleShoeNotes: { "Sand Dollar": 3, "Cappuccino": 2, "Cloud Dancer": 2, "Silver Romance": 2 }
};

const pleatedOatmealTrousers: StudioWardrobeDefinition = {
  id: "pleatedOatmealTrousers",
  label: "燕麦色褶裥西裤",
  garmentType: "trousers",
  garmentCategory: "bottom",
  supportedSeasons: ALL_SEASONS,
  silhouetteLine:
    "A single-or-double-pleat trouser with a clean structured waist, a straight vertical leg, and a relaxed but controlled drape. The pleats stay flat rather than pulling open.",
  materialLine:
    "Use brushed wool, wool-silk, or compact wool flannel with a soft matte surface and gentle drape.",
  paletteOptions: ["oatmeal", "warm grey", "greige", "soft stone", "taupe"],
  shoeVisibilityLine: TROUSERS_HEM,
  forbiddenLine: "Avoid exaggerated 90s dad-pleat, balloon hip, cropped ankle, or heavy flannel winter-only look.",
  hemConstraintLine: "The hem must stop at ankle height so both sneakers are completely unobstructed.",
  priority: "core",
  compatibleShoeNotes: { "Cloud Dancer": 2, "Cappuccino": 3, "Sand Dollar": 3, "Maple Grove": 2 }
};

const subtleKickFlareTrousers: StudioWardrobeDefinition = {
  id: "subtleKickFlareTrousers",
  label: "轻微微喇九分裤",
  garmentType: "trousers",
  garmentCategory: "bottom",
  supportedSeasons: ALL_SEASONS,
  silhouetteLine:
    "A straight-leg trouser with a subtle outward flare only at the hem, cropped to ankle length. The flare is restrained and does not read as a bell-bottom or retro silhouette.",
  materialLine:
    "Use compact wool, wool-silk, or dense cotton-twill with enough body to hold the subtle shape.",
  paletteOptions: ["black", "charcoal", "dark navy", "warm grey"],
  shoeVisibilityLine: "The cropped hem must expose the complete sneaker from toe to heel; the subtle flare must not create shadow or visual obstruction over the shoe.",
  forbiddenLine: "Avoid 1970s bell-bottom, exaggerated flare, floor-length hem, or fabric draping over the shoe.",
  hemConstraintLine: "The hem must end above the sneaker so the side panels and outer sole remain fully visible.",
  priority: "support",
  compatibleShoeNotes: { "Cloud Dancer": 2, "Silver Romance": 2 }
};

// --- SHORTS ---
const tailoredBermudaShorts: StudioWardrobeDefinition = {
  id: "tailoredBermudaShorts",
  label: "精裁百慕大短裤",
  garmentType: "shorts",
  garmentCategory: "bottom",
  supportedSeasons: ["春", "夏"],
  silhouetteLine:
    "A knee-length tailored short with a clean flat front, a structured waistband, and a straight or slightly A-line leg. The hem sits near the top of the knee.",
  materialLine:
    "Use high-twist wool, cotton-silk, or compact tropical wool with a matte surface and structured drape.",
  paletteOptions: ["soft stone", "warm grey", "oatmeal", "black", "charcoal"],
  shoeVisibilityLine: SHORTS_HEM,
  forbiddenLine: "Avoid denim cutoff, sport drawstring, cargo pocket, beach short, or hot-pant length.",
  hemConstraintLine: "The hem must sit at or just above the knee so both sneakers and calves are fully visible.",
  priority: "core",
  compatibleShoeNotes: { "Cloud Dancer": 2, "Sand Dollar": 2, "Aire": 2 }
};

// --- SKIRTS ---
const aLineMidiSkirt: StudioWardrobeDefinition = {
  id: "aLineMidiSkirt",
  label: "A字中长裙",
  garmentType: "skirt",
  garmentCategory: "bottom",
  supportedSeasons: ALL_SEASONS,
  silhouetteLine:
    "A below-knee to mid-calf A-line skirt with controlled flare, a clean waistband, and a hem that stays well clear of the sneakers.",
  materialLine:
    "Use compact wool, wool-silk, or dense cotton-twill with a matte surface and gentle body.",
  paletteOptions: ["black", "charcoal", "warm grey", "soft stone", "cream", "oatmeal"],
  shoeVisibilityLine: SKIRT_HEM,
  forbiddenLine: "Avoid full-circle skirt, ballerina length, puffy volume, or hem dragging on the shoe.",
  hemConstraintLine: "The hem must end at mid-calf or above so both sneakers remain completely visible.",
  priority: "core",
  compatibleShoeNotes: { "Cloud Dancer": 3, "Silver Romance": 2, "Delphinium Blue": 2, "Sand Dollar": 2 }
};

const straightMidiSkirt: StudioWardrobeDefinition = {
  id: "straightMidiSkirt",
  label: "直筒中长裙",
  garmentType: "skirt",
  garmentCategory: "bottom",
  supportedSeasons: ALL_SEASONS,
  silhouetteLine:
    "A straight column midi skirt with a clean waistband, a subtle back or side slit, and a controlled straight line from hip to hem. The hem ends below the knee.",
  materialLine:
    "Use compact wool, wool-silk, or dense crepe with a matte surface and structured but comfortable drape.",
  paletteOptions: ["cream", "soft stone", "charcoal", "black", "warm grey"],
  shoeVisibilityLine: SKIRT_HEM,
  forbiddenLine: "Avoid pencil-tight silhouette, restrictive stride, floor-length column, or bodycon knit.",
  hemConstraintLine: "The hem must end at or below the knee but above mid-calf so both sneakers are fully visible.",
  priority: "core",
  compatibleShoeNotes: { "Cloud Dancer": 2, "Silver Romance": 3, "Sand Dollar": 2 }
};

const biasSatinMidiSkirt: StudioWardrobeDefinition = {
  id: "biasSatinMidiSkirt",
  label: "低饱和斜裁缎面裙",
  garmentType: "skirt",
  garmentCategory: "bottom",
  supportedSeasons: ALL_SEASONS,
  silhouetteLine:
    "A bias-cut midi skirt with a natural soft drape, a clean waistband, and a controlled fluid movement. The skirt follows the body without clinging and ends below the knee.",
  materialLine:
    "Use matte silk satin, acetate crepe, or cupro with a subtle sheen, not gloss, and a fluid drape.",
  paletteOptions: ["pale champagne grey", "smoky rose", "greige", "soft stone", "deep grey-blue"],
  shoeVisibilityLine: SKIRT_HEM,
  forbiddenLine: "Avoid high-gloss satin, lingerie slip, pajama drape, or floor-length hem.",
  hemConstraintLine: "The hem must end above mid-calf so both sneakers stay fully visible and the fabric does not pool near the foot.",
  priority: "support",
  compatibleShoeNotes: { "Silver Romance": 3, "Cloud Dancer": 2 }
};

const straightKnitSkirt: StudioWardrobeDefinition = {
  id: "straightKnitSkirt",
  label: "直筒针织裙",
  garmentType: "skirt",
  garmentCategory: "bottom",
  supportedSeasons: ["秋", "冬"],
  silhouetteLine:
    "A fine-gauge knit column skirt with a clean waistband and a straight relaxed fit through the hip and leg. It ends below the knee.",
  materialLine:
    "Use a compact fine-gauge merino, cashmere-blend, or dense wool knit with a matte surface and quiet structure.",
  paletteOptions: ["black", "charcoal", "oatmeal", "warm grey"],
  shoeVisibilityLine: SKIRT_HEM,
  forbiddenLine: "Avoid chunky rib, bodycon bandage, heavy cable knit, or floor-length sweater dress.",
  hemConstraintLine: "The hem must end below the knee so both sneakers are clearly visible.",
  priority: "support",
  compatibleShoeNotes: { "Cappuccino": 2, "Maple Grove": 2, "Cloud Dancer": 2 }
};

// --- OUTER LAYERS ---
const structuredSingleBreastedBlazer: StudioWardrobeDefinition = {
  id: "structuredSingleBreastedBlazer",
  label: "结构单排扣西装",
  garmentType: "trousers",
  garmentCategory: "outerLayer",
  supportedSeasons: ALL_SEASONS,
  silhouetteLine:
    "A single-breasted blazer with a precise shoulder line, light internal structure, and a clean fit through the body. The length hits at the hip or slightly below.",
  materialLine:
    "Use high-twist wool, wool-silk, or compact tropical wool with a matte surface and clean tailored construction.",
  paletteOptions: ["sand", "greige", "warm grey", "soft stone", "taupe"],
  shoeVisibilityLine: JACKET_HEM,
  forbiddenLine: "Avoid heavy shoulder pads, corporate uniform styling, gold buttons, or power-suit silhouette.",
  hemConstraintLine: "The blazer must end at the hip so both sneakers and the full trouser silhouette remain visible.",
  priority: "core",
  compatibleShoeNotes: { "Cloud Dancer": 3, "Cappuccino": 3, "Sand Dollar": 3, "Delphinium Blue": 2 }
};

const minimalBoyfriendBlazer: StudioWardrobeDefinition = {
  id: "minimalBoyfriendBlazer",
  label: "极简宽松西装",
  garmentType: "trousers",
  garmentCategory: "outerLayer",
  supportedSeasons: ALL_SEASONS,
  silhouetteLine:
    "A slightly relaxed single-breasted blazer with an accurate shoulder line, a clean lapel, and a boxy but not oversized cut. The length ends at the hip.",
  materialLine:
    "Use compact wool, wool-silk, or dense crepe with a matte surface and soft tailored structure.",
  paletteOptions: ["black", "charcoal", "warm grey"],
  shoeVisibilityLine: JACKET_HEM,
  forbiddenLine: "Avoid extreme streetwear oversize, dropped shoulder, gold hardware, or slouchy shapeless fit.",
  hemConstraintLine: "The blazer must end at the hip so the lower body, waistband, and both sneakers stay clearly visible.",
  priority: "core",
  compatibleShoeNotes: { "Cloud Dancer": 3, "Silver Romance": 3, "Delphinium Blue": 2 }
};

const collarlessCroppedTexturedJacket: StudioWardrobeDefinition = {
  id: "collarlessCroppedTexturedJacket",
  label: "无领短款纹理外套",
  garmentType: "trousers",
  garmentCategory: "outerLayer",
  supportedSeasons: ALL_SEASONS,
  silhouetteLine:
    "A collarless cropped jacket with a clean round or stand neckline, a sharp shoulder line, and a cropped body that ends at the waist. The texture is subtle and tonal.",
  materialLine:
    "Use a restrained textured wool, boucle-look compact weave, or matte jacquard with no metallic thread or brand-motif pattern.",
  paletteOptions: ["black-white", "charcoal-cream", "warm grey"],
  shoeVisibilityLine: "The cropped length keeps the waistband, hip line, and both sneakers fully visible.",
  forbiddenLine: "Avoid Chanel-style boucle, gold chain trim, contrasting braid, logo buttons, brand-motif weave, or metallic fleck.",
  hemConstraintLine: "The jacket must end at the waist so the entire lower body and both sneakers are unobstructed.",
  priority: "core",
  compatibleShoeNotes: { "Cloud Dancer": 2, "Silver Romance": 2, "Oreo": 2 }
};

const croppedCardigan: StudioWardrobeDefinition = {
  id: "croppedCardigan",
  label: "短款开衫",
  garmentType: "trousers",
  garmentCategory: "outerLayer",
  supportedSeasons: ["春", "秋"],
  silhouetteLine:
    "A fine-gauge cropped cardigan with a clean V-neckline, small restrained buttons, and a hem that ends near the natural waist.",
  materialLine:
    "Use a compact fine-gauge merino, cashmere-blend, or silk-cotton knit with a matte surface.",
  paletteOptions: ["cream", "oatmeal", "light grey", "black"],
  shoeVisibilityLine: "The cropped length keeps the waistband and both sneakers fully visible.",
  forbiddenLine: "Avoid chunky grandpa cardigan, oversized slouch, wooden buttons, or sweet-girly styling.",
  hemConstraintLine: "The cardigan must end at the waist so the lower body and both sneakers stay clear.",
  priority: "support",
  compatibleShoeNotes: { "Cloud Dancer": 2, "Cappuccino": 2, "Sand Dollar": 2 }
};

const sleevelessLongTailoringVest: StudioWardrobeDefinition = {
  id: "sleevelessLongTailoringVest",
  label: "长款无袖精裁马甲",
  garmentType: "trousers",
  garmentCategory: "outerLayer",
  supportedSeasons: ["春", "秋"],
  silhouetteLine:
    "A sleeveless tailored vest with a clean shoulder line, a single-breasted or concealed placket, and a longer body that ends between mid-thigh and above the knee.",
  materialLine:
    "Use high-twist wool, wool-silk, or compact suiting with a matte surface and precise tailored construction.",
  paletteOptions: ["cream", "greige", "black", "charcoal"],
  shoeVisibilityLine: "The vest length must end above the knee so both sneakers and the full trouser silhouette are clearly visible.",
  forbiddenLine: "Avoid heavy vest, corset lacing, waistcoat styling, or costume tailoring.",
  hemConstraintLine: "The vest must end above the knee so the trouser hem and both sneakers stay fully visible.",
  priority: "support",
  compatibleShoeNotes: { "Cloud Dancer": 2, "Silver Romance": 2 }
};

export const STUDIO_WARDROBE_LIBRARY: Record<TeamStudioWardrobePreference, StudioWardrobeDefinition | null> = {
  auto: null,
  fineGaugeShortSleeveKnit,
  knitPolo,
  mockNeckFineKnit,
  relaxedIvoryShirt,
  sleevelessMinimalTop,
  highWaistStraightTrousers,
  wideStraightTailoredTrousers,
  croppedCigaretteTrousers,
  pleatedOatmealTrousers,
  subtleKickFlareTrousers,
  tailoredBermudaShorts,
  aLineMidiSkirt,
  straightMidiSkirt,
  biasSatinMidiSkirt,
  straightKnitSkirt,
  structuredSingleBreastedBlazer,
  minimalBoyfriendBlazer,
  collarlessCroppedTexturedJacket,
  croppedCardigan,
  sleevelessLongTailoringVest
};

export const STUDIO_WARDROBE_OPTIONS: { value: TeamStudioWardrobePreference; label: string }[] = [
  { value: "auto", label: "自动匹配" },
  { value: "fineGaugeShortSleeveKnit", label: "精细针织短袖" },
  { value: "knitPolo", label: "针织 Polo" },
  { value: "mockNeckFineKnit", label: "半高领精细针织" },
  { value: "relaxedIvoryShirt", label: "象牙白松弛衬衫" },
  { value: "sleevelessMinimalTop", label: "黑色或炭灰无袖上装" },
  { value: "highWaistStraightTrousers", label: "高腰直筒西裤" },
  { value: "wideStraightTailoredTrousers", label: "宽直筒西裤" },
  { value: "croppedCigaretteTrousers", label: "九分烟管裤" },
  { value: "pleatedOatmealTrousers", label: "燕麦色褶裥西裤" },
  { value: "subtleKickFlareTrousers", label: "轻微微喇九分裤" },
  { value: "tailoredBermudaShorts", label: "精裁百慕大短裤" },
  { value: "aLineMidiSkirt", label: "A字中长裙" },
  { value: "straightMidiSkirt", label: "直筒中长裙" },
  { value: "biasSatinMidiSkirt", label: "低饱和斜裁缎面裙" },
  { value: "straightKnitSkirt", label: "直筒针织裙" },
  { value: "structuredSingleBreastedBlazer", label: "结构单排扣西装" },
  { value: "minimalBoyfriendBlazer", label: "极简宽松西装" },
  { value: "collarlessCroppedTexturedJacket", label: "无领短款纹理外套" },
  { value: "croppedCardigan", label: "短款开衫" },
  { value: "sleevelessLongTailoringVest", label: "长款无袖精裁马甲" }
];

export function getStudioWardrobeDefinition(pref: TeamStudioWardrobePreference): StudioWardrobeDefinition | null {
  return STUDIO_WARDROBE_LIBRARY[pref] ?? null;
}

export function getCompatibleStudioWardrobeOptions(params: {
  garmentTypePreference: string;
  season: TeamSeason;
}): TeamStudioWardrobePreference[] {
  const garmentMap: Record<string, TeamGarmentType[]> = {
    "自动匹配": ["trousers", "skirt", "shorts", "dress"],
    "裤装": ["trousers"],
    "裙装": ["skirt"],
    "短裤": ["shorts"],
    "连衣裙": [],
    "轻运动": [],
  };
  const allowedGarments = garmentMap[params.garmentTypePreference] ?? ["trousers"];
  const ids: TeamStudioWardrobePreference[] = [];
  for (const [id, def] of Object.entries(STUDIO_WARDROBE_LIBRARY)) {
    if (id === "auto" || !def) continue;
    const wardrobeId = id as TeamStudioWardrobePreference;
    if (allowedGarments.includes(def.garmentType) && def.supportedSeasons.includes(params.season)) {
      ids.push(wardrobeId);
    }
  }
  return ids;
}

const CORE_PHASE1: TeamStudioWardrobePreference[] = [
  "fineGaugeShortSleeveKnit",
  "knitPolo",
  "sleevelessMinimalTop",
  "relaxedIvoryShirt",
  "highWaistStraightTrousers",
  "wideStraightTailoredTrousers",
  "croppedCigaretteTrousers",
  "tailoredBermudaShorts",
  "aLineMidiSkirt",
  "structuredSingleBreastedBlazer",
  "minimalBoyfriendBlazer",
  "collarlessCroppedTexturedJacket"
];

const SUPPORT_PIECES: TeamStudioWardrobePreference[] = [
  "mockNeckFineKnit",
  "pleatedOatmealTrousers",
  "subtleKickFlareTrousers",
  "straightMidiSkirt",
  "biasSatinMidiSkirt",
  "straightKnitSkirt",
  "croppedCardigan",
  "sleevelessLongTailoringVest"
];

function buildOutfitSet(params: {
  top?: StudioWardrobeDefinition;
  bottom: StudioWardrobeDefinition;
  outerLayer?: StudioWardrobeDefinition;
  colorIndex: number;
}): { wardrobeLine: string } {
  const { top, bottom, outerLayer, colorIndex } = params;
  const parts: string[] = [];
  if (top) {
    const color = top.paletteOptions[colorIndex % top.paletteOptions.length];
    parts.push(`${color} ${top.label} (${top.silhouetteLine.replace(/\.$/, "")}, ${top.materialLine.replace(/Use a? /, "").replace(/\.$/, "")})`);
  }
  const bottomColor = bottom.paletteOptions[colorIndex % bottom.paletteOptions.length];
  parts.push(`${bottomColor} ${bottom.label} (${bottom.silhouetteLine.replace(/\.$/, "")}, ${bottom.materialLine.replace(/Use a? /, "").replace(/\.$/, "")})`);
  if (outerLayer) {
    const layerColor = outerLayer.paletteOptions[colorIndex % outerLayer.paletteOptions.length];
    parts.push(`${layerColor} ${outerLayer.label} (${outerLayer.silhouetteLine.replace(/\.$/, "")}, ${outerLayer.materialLine.replace(/Use a? /, "").replace(/\.$/, "")})`);
  }
  const constraints = [
    bottom.shoeVisibilityLine,
    bottom.hemConstraintLine,
    outerLayer?.shoeVisibilityLine,
    outerLayer?.hemConstraintLine
  ].filter(Boolean).join(" ");
  return { wardrobeLine: [parts.join("; "), constraints].filter(Boolean).join(". ") };
}

function getBottomByGarmentType(garmentType: TeamGarmentType, nonce: number): StudioWardrobeDefinition {
  const options = Object.values(STUDIO_WARDROBE_LIBRARY).filter(
    (d): d is StudioWardrobeDefinition =>
      d !== null && d.garmentType === garmentType && d.garmentCategory === "bottom"
  );
  if (options.length === 0) {
    return highWaistStraightTrousers;
  }
  return options[nonce % options.length];
}

function getTopBySeason(season: TeamSeason, nonce: number): StudioWardrobeDefinition | undefined {
  const tops = Object.values(STUDIO_WARDROBE_LIBRARY).filter(
    (d): d is StudioWardrobeDefinition =>
      d !== null && d.garmentCategory === "top" && d.supportedSeasons.includes(season)
  );
  if (tops.length === 0) return undefined;
  return tops[nonce % tops.length];
}

function getOuterLayerBySeason(season: TeamSeason, nonce: number): StudioWardrobeDefinition | undefined {
  const layers = Object.values(STUDIO_WARDROBE_LIBRARY).filter(
    (d): d is StudioWardrobeDefinition =>
      d !== null && d.garmentCategory === "outerLayer" && d.supportedSeasons.includes(season)
  );
  if (layers.length === 0) return undefined;
  return layers[nonce % layers.length];
}

const BRAND_FORBIDDEN =
  "Avoid any visible brand logo, brand lettering, brand motif, Chloé-style, Hermès-style, CHANEL-style, CELINE-style, gold chain trim, or recognizable luxury house design codes.";

export function resolveStudioWardrobeSelection(params: {
  preference: TeamStudioWardrobePreference;
  garmentTypePreference: string;
  season: TeamSeason;
  nonce: number;
}): { wardrobeLine: string; definition: StudioWardrobeDefinition } | null {
  const safeNonce = Math.max(0, Math.abs(params.nonce));

  if (params.preference !== "auto") {
    const def = STUDIO_WARDROBE_LIBRARY[params.preference];
    if (!def) return null;
    const colorIndex = safeNonce % def.paletteOptions.length;
    const color = def.paletteOptions[colorIndex];
    const parts = [
      `${color} ${def.label}`,
      def.silhouetteLine,
      def.materialLine,
      def.shoeVisibilityLine,
      def.hemConstraintLine,
      def.forbiddenLine,
      BRAND_FORBIDDEN
    ].filter(Boolean);
    return { wardrobeLine: parts.join(". "), definition: def };
  }

  const garmentMap: Record<string, TeamGarmentType> = {
    "裤装": "trousers",
    "裙装": "skirt",
    "短裤": "shorts",
    "连衣裙": "trousers",
    "轻运动": "trousers",
  };
  const garmentType = garmentMap[params.garmentTypePreference] ?? "trousers";
  const bottom = getBottomByGarmentType(garmentType, safeNonce);
  const top = getTopBySeason(params.season, safeNonce + 7);
  const outerLayer = getOuterLayerBySeason(params.season, safeNonce + 13);

  const result = buildOutfitSet({
    top: bottom.garmentCategory === "bottom" ? top : undefined,
    bottom,
    outerLayer,
    colorIndex: safeNonce + 3
  });
  return { wardrobeLine: result.wardrobeLine, definition: bottom };
}

export function getStudioWardrobeContrastLine(params: {
  presetId?: string;
  wardrobeLine: string;
}): string {
  const { presetId, wardrobeLine } = params;
  if (!presetId || presetId === "auto") return "";
  const hasLightGarment = /cream|ivory|white|oatmeal/i.test(wardrobeLine);
  const hasGreyGarment = /grey|charcoal|greige/i.test(wardrobeLine);
  const hasBlackGarment = /black/i.test(wardrobeLine);

  if (presetId === "creamMinimal" && hasLightGarment) {
    return "Ensure clear tonal separation between cream-white background and light-colored clothing or sneakers; use a slightly darker bottom piece to create visible contrast.";
  }
  if (presetId === "warmGreySeamless" && hasGreyGarment) {
    return "Prevent grey clothing from blending into the warm grey backdrop; maintain clear edge definition and tonal variation between garment and background.";
  }
  if (presetId === "monochromeArchitectural") {
    if (hasBlackGarment) return "Keep black clothing away from black background zones; use light grey structural planes behind dark garments.";
    if (hasLightGarment) return "Keep white or light clothing away from white background zones; use charcoal or grey planes behind light garments.";
  }
  if (presetId === "linenTexture") {
    return "Ensure at least one garment uses a smooth material like fine knit or silk-cotton so the outfit does not read as all-textured against the linen backdrop.";
  }
  return "";
}
