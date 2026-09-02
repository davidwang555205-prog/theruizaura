import type { FmcgCategory, FmcgThemeCard, FmcgTopicId } from "./types";

export const fmcgCategoryLabels: Record<FmcgCategory, string> = {
  beauty_skincare: "护肤与美妆",
  beverage: "饮料",
  food_snack: "食品与零食",
  personal_care: "洗护用品",
  household_cleaning: "家庭清洁",
  fragrance: "香氛",
  home_kitchen_drinkware: "家居餐厨 / 饮具",
};

export const fmcgTopicLabels: Record<FmcgTopicId, string> = {
  lifestyle_soft_seeding: "生活场景软种草",
  product_development_behind_scenes: "产品开发幕后",
  autumn_winter_color_lab: "秋冬配色实验室",
  styling_solution: "使用解决方案",
  material_craft_education: "材质工艺认知",
  brand_aesthetic_viewpoint: "品牌审美观点",
  launch_conversion: "上新活动转化",
  studio_launch_shoot: "棚内上新拍摄",
};

const cards = (topic: FmcgTopicId, rows: Array<Omit<FmcgThemeCard, "id">>): FmcgThemeCard[] =>
  rows.map((row, index) => ({ ...row, id: `fmcg-${topic}-${index + 1}` }));

export const fmcgThemeCards: Record<FmcgTopicId, FmcgThemeCard[]> = {
  lifestyle_soft_seeding: cards("lifestyle_soft_seeding", [
    { title: "日常开始", purpose: "建立真实日常使用语境", scene: "a quiet lived-in morning counter or shelf", composition: "environment-led medium-wide composition with the product clearly readable", action: "one natural reach-and-use action appropriate to the confirmed package", evidenceRole: "product scale and normal placement" },
    { title: "随身携带", purpose: "展示产品进入真实出行", scene: "a clean everyday bag-packing surface near an entrance", composition: "three-quarter overhead view with natural surrounding objects", action: "place the product into or beside an everyday carry item without hiding its main panel", evidenceRole: "portable scale and package silhouette" },
    { title: "工作间隙", purpose: "展示日常高频使用", scene: "a calm work desk during a natural pause", composition: "documentary medium shot with restrained desk context", action: "complete one ordinary handling action appropriate to the product", evidenceRole: "normal handling and front-panel visibility" },
    { title: "午后使用", purpose: "形成轻松生活证据", scene: "a softly lit home or neighborhood table in the afternoon", composition: "side-angle lifestyle composition with believable negative space", action: "pick up, use, and return the product once at normal speed", evidenceRole: "use relationship and grounded placement" },
    { title: "外出补充", purpose: "展示外出状态下的使用", scene: "a quiet public counter or clean outdoor seating edge", composition: "close medium composition without commercial posing", action: "perform one brief practical use action with natural hands", evidenceRole: "human scale and package orientation" },
    { title: "家庭收纳", purpose: "展示产品在生活空间中的归属", scene: "an orderly bathroom, pantry, vanity, or utility shelf appropriate to the category", composition: "straight-on environmental still life", action: "leave the product naturally stored with one subtle sign of recent use", evidenceRole: "front panel and surrounding scale" },
    { title: "使用后状态", purpose: "展示可信生活痕迹", scene: "a clean lived-in surface immediately after normal use", composition: "observational detail with product and one relevant object", action: "show a physically plausible after-use state without altering the package", evidenceRole: "closure and package integrity" },
    { title: "一天收尾", purpose: "完成生活内容收尾", scene: "a quiet evening shelf or counter with warm practical light", composition: "calm medium still life with the product as the clear anchor", action: "return the product to its normal place", evidenceRole: "recognizable silhouette and color blocking" },
  ]),
  product_development_behind_scenes: cards("product_development_behind_scenes", [
    { title: "包装打样", purpose: "展示包装比较过程", scene: "a clean product development worktable", composition: "overhead working layout with one primary sample", action: "compare the confirmed package against one neutral mock-up", evidenceRole: "overall package silhouette" },
    { title: "正面校对", purpose: "展示正面版面检查", scene: "a restrained packaging review desk", composition: "front-facing product with flat review materials beside it", action: "point to the confirmed front-panel relationships without inventing text", evidenceRole: "front-panel layout" },
    { title: "侧面检查", purpose: "展示侧面结构", scene: "a neutral sample inspection surface", composition: "clean side view with measured spacing", action: "rotate only enough to reveal the confirmed side relationship", evidenceRole: "side-panel layout" },
    { title: "盖体检查", purpose: "展示开合部件关系", scene: "a precise tabletop inspection setting", composition: "controlled detail framing around the upper package", action: "inspect the confirmed closure without changing its construction", evidenceRole: "closure structure" },
    { title: "标签位置", purpose: "展示标签与包体关系", scene: "a minimal label proofing table", composition: "orthographic-feeling front detail with no invented copy", action: "align a neutral paper guide beside the confirmed label area", evidenceRole: "label relationship" },
    { title: "色彩比较", purpose: "展示包装颜色关系", scene: "a daylight color-review table", composition: "product beside restrained unprinted color swatches", action: "compare only the visible color-blocking relationships", evidenceRole: "color blocking" },
    { title: "外盒关系", purpose: "展示主包装与外盒", scene: "a clean packaging assembly table", composition: "three-quarter arrangement with clear object hierarchy", action: "place the confirmed primary and secondary packages in their visible relationship", evidenceRole: "secondary packaging relationship" },
    { title: "开发记录", purpose: "形成幕后收尾", scene: "an orderly product review desk at the end of a session", composition: "wide overhead record of the confirmed samples", action: "leave one handwritten generic review mark without product claims", evidenceRole: "complete reference coverage" },
  ]),
  autumn_winter_color_lab: cards("autumn_winter_color_lab", [
    { title: "秋冬主色", purpose: "建立季节色彩语境", scene: "a quiet autumn-winter color table", composition: "product-led still life with restrained seasonal surfaces", action: "place neutral swatches around the product without covering it", evidenceRole: "confirmed color blocking" },
    { title: "冷暖关系", purpose: "展示环境色温关系", scene: "a controlled daylight and warm practical-light comparison", composition: "split environmental lighting without changing package color", action: "keep the same product orientation across both light zones", evidenceRole: "color constancy" },
    { title: "衣橱邻近", purpose: "连接秋冬生活物件", scene: "an orderly autumn-winter wardrobe or entry shelf", composition: "product beside quiet textile forms without fashion dominance", action: "show natural placement among daily objects", evidenceRole: "product scale and seasonal context" },
    { title: "材质对照", purpose: "展示表面视觉关系", scene: "a tactile seasonal material table", composition: "close still life with one surface transition at a time", action: "compare visible package finish to neutral surrounding surfaces", evidenceRole: "confirmed package surface" },
    { title: "室内暖光", purpose: "展示秋冬室内使用", scene: "a calm warm-lit interior counter", composition: "medium environmental composition with natural shadow depth", action: "complete one normal placement or handling action", evidenceRole: "silhouette under warm light" },
    { title: "城市冷光", purpose: "展示秋冬城市使用", scene: "a clean sheltered city threshold in cool daylight", composition: "documentary product-in-use framing", action: "carry or place the product naturally without staged advertising", evidenceRole: "scale and front-panel readability" },
    { title: "系列配色", purpose: "展示同系列色彩秩序", scene: "a neutral seasonal studio table", composition: "one hero unit with supporting confirmed units only", action: "arrange units by visible color relationship", evidenceRole: "unit count and color blocking" },
    { title: "季节收尾", purpose: "形成秋冬氛围结尾", scene: "a quiet late-afternoon seasonal shelf", composition: "restrained still life with generous negative space", action: "keep the product physically still and fully recognizable", evidenceRole: "overall package identity" },
  ]),
  styling_solution: cards("styling_solution", [
    { title: "使用时机", purpose: "说明产品何时进入生活", scene: "a category-appropriate everyday preparation area", composition: "clear sequence-start composition", action: "begin one confirmed and physically possible use action", evidenceRole: "package and use compatibility" },
    { title: "取用方式", purpose: "说明正确取用关系", scene: "a clean daily-use surface", composition: "hands and product in balanced medium detail", action: "pick up the product using a natural grip", evidenceRole: "product scale" },
    { title: "开启关系", purpose: "说明包装开启逻辑", scene: "a neutral close working surface", composition: "upper-package detail without extreme macro", action: "interact with the closure only when confirmed by references", evidenceRole: "closure structure" },
    { title: "使用步骤", purpose: "展示一个完整使用节点", scene: "a realistic category-specific use setting", composition: "documentary medium framing", action: "complete one ordinary product-use step at real-world speed", evidenceRole: "normal use relationship" },
    { title: "组合使用", purpose: "展示产品与必要物件关系", scene: "an uncluttered daily-use station", composition: "one hero product with no more than two supporting objects", action: "place supporting objects according to actual use order", evidenceRole: "product hierarchy" },
    { title: "随身尺度", purpose: "展示携带与收纳", scene: "a clean bag, shelf, or drawer context appropriate to the category", composition: "three-quarter view with clear scale cues", action: "store or retrieve the product once", evidenceRole: "portable scale" },
    { title: "使用后归位", purpose: "展示使用闭环", scene: "the same category-appropriate setting after use", composition: "calm resolved composition", action: "close or return the product only as supported by references", evidenceRole: "package integrity" },
    { title: "解决方案总结", purpose: "形成清晰产品理解", scene: "a neutral brand-consistent surface", composition: "front-readable product hero with practical context", action: "keep the product still after the completed use sequence", evidenceRole: "overall reference identity" },
  ]),
  material_craft_education: cards("material_craft_education", [
    { title: "整体包型", purpose: "展示完整包装结构", scene: "a neutral evidence studio", composition: "straight-on complete product view", action: "keep the product still", evidenceRole: "overall package silhouette" },
    { title: "正面关系", purpose: "展示正面区域", scene: "a neutral evidence studio", composition: "front-panel detail with straight geometry", action: "keep all visible elements aligned to the reference", evidenceRole: "front-panel layout" },
    { title: "侧面关系", purpose: "展示侧面区域", scene: "a neutral evidence studio", composition: "controlled side view", action: "rotate only to the confirmed side", evidenceRole: "side-panel layout" },
    { title: "背面关系", purpose: "展示背面区域", scene: "a neutral evidence studio", composition: "controlled back view", action: "show the confirmed back without generating readable new copy", evidenceRole: "back-panel layout" },
    { title: "开合结构", purpose: "展示盖体或封口", scene: "a clean evidence table", composition: "close upper-package view", action: "preserve the confirmed closure relationship", evidenceRole: "closure structure" },
    { title: "标签边界", purpose: "展示标签与包体边界", scene: "a clean evidence table", composition: "flat readable label-zone framing", action: "preserve placement and proportions without inventing wording", evidenceRole: "label relationship" },
    { title: "表面过渡", purpose: "展示可见表面变化", scene: "a controlled raking-light table", composition: "close surface view with realistic light falloff", action: "keep the package physically still", evidenceRole: "confirmed surface finish" },
    { title: "包装组合", purpose: "展示主包装和外盒", scene: "a neutral evidence studio", composition: "ordered primary-secondary package relationship", action: "preserve the confirmed object count and hierarchy", evidenceRole: "secondary packaging relationship" },
  ]),
  brand_aesthetic_viewpoint: cards("brand_aesthetic_viewpoint", [
    { title: "品牌空间", purpose: "表达产品所属的视觉世界", scene: "a restrained brand-consistent interior", composition: "environment-led composition with one clear product anchor", action: "keep the product naturally placed", evidenceRole: "recognizable product presence" },
    { title: "日常物件", purpose: "表达品牌生活选择", scene: "a curated but lived-in everyday surface", composition: "product with a small number of coherent objects", action: "show subtle signs of real use", evidenceRole: "product scale" },
    { title: "光线观点", purpose: "表达品牌光线语言", scene: "a quiet natural-light interior", composition: "controlled shadow and negative space", action: "keep package color and shape stable", evidenceRole: "color and silhouette" },
    { title: "触感观点", purpose: "表达表面与环境关系", scene: "a tactile neutral material setting", composition: "close environmental still life", action: "show visible surface response without naming unconfirmed material", evidenceRole: "surface finish" },
    { title: "城市语境", purpose: "表达品牌与城市生活关系", scene: "a calm contemporary city threshold", composition: "documentary product context", action: "carry or place the product naturally", evidenceRole: "portable scale" },
    { title: "人物状态", purpose: "表达真实用户气质", scene: "a quiet daily-use setting", composition: "natural person-and-product relationship without posing", action: "complete one ordinary use action", evidenceRole: "normal use" },
    { title: "色彩秩序", purpose: "表达品牌配色控制", scene: "a clean tonal still-life surface", composition: "product as the only strong color authority", action: "keep supporting colors subordinate", evidenceRole: "confirmed color blocking" },
    { title: "审美收尾", purpose: "形成品牌观点结尾", scene: "a sparse brand-consistent shelf or counter", composition: "quiet product anchor with generous space", action: "keep the final product fully recognizable", evidenceRole: "overall identity" },
  ]),
  launch_conversion: cards("launch_conversion", [
    { title: "新品主图", purpose: "建立新品识别", scene: "a clean commercial studio", composition: "front-readable product hero with realistic shadow", action: "keep the product physically stable", evidenceRole: "overall silhouette and front panel" },
    { title: "三分之四", purpose: "补充包装体积", scene: "the same commercial studio", composition: "three-quarter product view", action: "preserve all visible package relationships", evidenceRole: "front-side relationship" },
    { title: "开合证据", purpose: "展示关键部件", scene: "a controlled product table", composition: "closure-area detail", action: "show only the confirmed closure state", evidenceRole: "closure structure" },
    { title: "使用证明", purpose: "展示正常使用", scene: "a realistic category-appropriate setting", composition: "documentary use frame", action: "complete one physically supported use action", evidenceRole: "use relationship and scale" },
    { title: "生活证明", purpose: "展示产品进入日常", scene: "a calm lived-in environment", composition: "environmental medium shot", action: "place the product naturally after use", evidenceRole: "recognizable product presence" },
    { title: "细节证据", purpose: "展示包装局部", scene: "a neutral evidence table", composition: "close detail without macro distortion", action: "keep the product still", evidenceRole: "label or surface relationship" },
    { title: "组合关系", purpose: "展示系列或外盒", scene: "the same commercial studio", composition: "one hero unit with confirmed supporting packages", action: "preserve confirmed quantity and hierarchy", evidenceRole: "secondary packaging relationship" },
    { title: "上新收尾", purpose: "完成新品内容组", scene: "a restrained brand-lit studio", composition: "clear final product hero with negative space", action: "hold a stable final frame", evidenceRole: "complete product identity" },
  ]),
  studio_launch_shoot: cards("studio_launch_shoot", [
    { title: "正面全貌", purpose: "展示正面和完整包型", scene: "one consistent neutral product studio", composition: "straight-on complete product view", action: "keep the product still", evidenceRole: "front panel and silhouette" },
    { title: "前侧角度", purpose: "展示产品体积", scene: "the same consistent neutral product studio", composition: "front three-quarter view", action: "rotate the product only", evidenceRole: "front-side relationship" },
    { title: "侧面角度", purpose: "展示侧面结构", scene: "the same consistent neutral product studio", composition: "orthogonal side view", action: "keep the product still", evidenceRole: "side-panel layout" },
    { title: "背面角度", purpose: "展示背面结构", scene: "the same consistent neutral product studio", composition: "orthogonal back view", action: "keep the product still", evidenceRole: "back-panel layout" },
    { title: "顶部结构", purpose: "展示盖体和顶部", scene: "the same consistent neutral product studio", composition: "slightly elevated upper-package view", action: "preserve the closure state", evidenceRole: "closure structure" },
    { title: "标签局部", purpose: "展示正面信息区域", scene: "the same consistent neutral product studio", composition: "close label-zone view without extreme macro", action: "do not invent or rewrite packaging text", evidenceRole: "label relationship" },
    { title: "外盒组合", purpose: "展示包装层级", scene: "the same consistent neutral product studio", composition: "primary product beside confirmed secondary packaging", action: "preserve confirmed quantity and spacing", evidenceRole: "secondary packaging relationship" },
    { title: "尺度收尾", purpose: "展示真实产品尺度", scene: "the same consistent neutral product studio", composition: "product with one neutral scale cue", action: "hold a stable final product frame", evidenceRole: "product scale" },
  ]),
};

export const fmcgCategoryProtection: Record<FmcgCategory, string[]> = {
  beauty_skincare: ["preserve the confirmed container silhouette, cap or dispenser, label placement, visible shade, and primary-to-secondary package relationship"],
  beverage: ["preserve the confirmed bottle, can, or carton silhouette, closure, label placement, visible contents state, and unit count"],
  food_snack: ["preserve the confirmed pouch, box, jar, or can structure, seal, package graphics placement, visible food form, and unit count"],
  personal_care: ["preserve the confirmed container proportions, cap or dispenser, label placement, and visible product state"],
  household_cleaning: ["preserve the confirmed container, handle, cap or sprayer, label placement, grip direction, and product scale"],
  fragrance: ["preserve the confirmed bottle silhouette, cap, sprayer, label placement, visible contents state, and bottle-to-box relationship"],
  home_kitchen_drinkware: ["preserve the exact confirmed vessel silhouette and proportions, rim diameter, wall taper and thickness, base geometry, handle shape and attachment points when present, lid and straw relationships when present, transparency or opacity, surface response, decoration placement, and real hand-to-vessel scale"],
};

const drinkwareReplacements: Array<[RegExp, string]> = [
  [/package graphics placement/gi, "decoration or print placement"],
  [/packaging text/gi, "printed decoration or text"],
  [/packaging color/gi, "vessel color"],
  [/packaging surface/gi, "vessel surface"],
  [/packaging relationship/gi, "vessel relationship"],
  [/package appearance/gi, "drinkware appearance"],
  [/package identity/gi, "drinkware identity"],
  [/package integrity/gi, "vessel structural integrity"],
  [/package silhouette/gi, "vessel silhouette"],
  [/package structure/gi, "vessel structure"],
  [/package geometry/gi, "vessel geometry"],
  [/package color/gi, "vessel color"],
  [/package orientation/gi, "vessel orientation"],
  [/package proportions/gi, "vessel proportions"],
  [/package and use/gi, "vessel and use"],
  [/package and/gi, "vessel and"],
  [/package at/gi, "vessel at"],
  [/package against/gi, "vessel against"],
  [/package\b/gi, "vessel"],
  [/front-panel/gi, "primary visible face"],
  [/front panel/gi, "primary visible face"],
  [/side-panel/gi, "side-profile"],
  [/side panel/gi, "side profile"],
  [/back-panel/gi, "reverse-face"],
  [/back view/gi, "reverse-face view"],
  [/label-zone/gi, "decoration-zone"],
  [/label area/gi, "decoration area"],
  [/label relationship/gi, "decoration placement"],
  [/label placement/gi, "decoration placement"],
  [/closure-area/gi, "rim-and-lid area"],
  [/closure structure/gi, "rim, lid, and straw relationship when present"],
  [/closure state/gi, "lid state when present"],
  [/closure/gi, "lid or opening"],
  [/dispenser/gi, "lid or straw"],
  [/upper-package/gi, "rim-and-lid"],
  [/visible contents state/gi, "interior or contained-liquid state only when confirmed"],
  [/primary-secondary package relationship/gi, "vessel-to-retail-box relationship when a confirmed box exists"],
  [/primary and secondary packages/gi, "vessel and confirmed retail box"],
  [/supporting packages/gi, "supporting confirmed drinkware pieces"],
  [/secondary packaging/gi, "confirmed retail box"],
];

function adaptDrinkwareText(value: string): string {
  return drinkwareReplacements.reduce((result, [pattern, replacement]) => result.replace(pattern, replacement), value);
}

export function getFmcgThemeCards(category: FmcgCategory, topic: FmcgTopicId): FmcgThemeCard[] {
  const source = fmcgThemeCards[topic];
  if (category !== "home_kitchen_drinkware") return source;
  return source.map((card) => ({
    ...card,
    purpose: adaptDrinkwareText(card.purpose),
    scene: adaptDrinkwareText(card.scene),
    composition: adaptDrinkwareText(card.composition),
    action: adaptDrinkwareText(card.action),
    evidenceRole: adaptDrinkwareText(card.evidenceRole),
  }));
}
