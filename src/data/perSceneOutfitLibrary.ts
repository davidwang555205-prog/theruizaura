export type Season = "spring" | "summer" | "autumn" | "winter";

export type ImageType = "onFoot" | "mirror" | "lifestyle" | "gym" | "gymCommute";

export type PerSceneOutfitSceneKey =
  | "commute"
  | "weekendCityWalk"
  | "cafeExterior"
  | "boutiqueStreet"
  | "flowerShop"
  | "bakeryDessert"
  | "bookstoreMagazine"
  | "premiumErrands"
  | "hotelTravel"
  | "lightSocial"
  | "galleryExhibition"
  | "cityCorner"
  | "mirrorCloset"
  | "entrywayDeparture"
  | "gymCommute"
  | "gymInterior";

export type OutfitEntry = {
  id: string;
  sceneKey: string;
  styleCluster: string;
  season: Season[];
  suitableShoes: string[];
  imageTypes: ImageType[];
  colorMood: string[];
  styleTags: string[];
  topCategory: string;
  bottomCategory: string;
  outerLayerCategory?: string;
  bagCategory?: string;
  accessoryCategory?: string[];
  compactLine: string;
  forbidden?: string[];
};

export const perSceneOutfitLibrary: Record<string, OutfitEntry[]> = {
  commute: [
    {
      id: "commute-001",
      sceneKey: "commute",
      styleCluster: "cleanMinimal",
      season: ["spring", "autumn"],
      suitableShoes: ["Cloud Dancer", "Sand Dollar", "Oreo", "Panda", "Delphinium Blue"],
      imageTypes: ["onFoot", "lifestyle"],
      colorMood: ["white", "soft grey", "taupe"],
      styleTags: ["clean commute", "polished daily", "light business"],
      topCategory: "white cotton shirt",
      bottomCategory: "soft grey straight trousers",
      outerLayerCategory: "light beige trench coat",
      bagCategory: "structured taupe tote",
      accessoryCategory: ["simple watch"],
      compactLine:
        "Style her in a crisp white cotton shirt, soft grey straight trousers, a light beige trench coat, and a structured taupe tote for a clean commute look.",
      forbidden: ["stiff corporate suit", "high heel office mood", "harsh executive styling"]
    },
    {
      id: "commute-002",
      sceneKey: "commute",
      styleCluster: "lightBusiness",
      season: ["summer"],
      suitableShoes: ["Cloud Dancer", "Sand Dollar", "Aire", "Delphinium Blue", "Lemon"],
      imageTypes: ["onFoot", "lifestyle", "mirror"],
      colorMood: ["cream", "ivory", "taupe"],
      styleTags: ["summer commute", "clean workwear", "breathable"],
      topCategory: "cream fitted T-shirt",
      bottomCategory: "ivory straight-leg trousers",
      outerLayerCategory: "light cotton blazer",
      bagCategory: "no-logo leather tote",
      accessoryCategory: ["subtle gold earrings"],
      compactLine:
        "Use a cream fitted T-shirt under a light cotton blazer, ivory straight-leg trousers, and a no-logo leather tote for polished summer workwear.",
      forbidden: ["wrinkled casual T-shirt", "exposed tank-only office look", "overly formal suit"]
    },
    {
      id: "commute-003",
      sceneKey: "commute",
      styleCluster: "realDailyWorkwear",
      season: ["spring", "summer", "autumn"],
      suitableShoes: ["Cloud Dancer", "Sand Dollar", "Delphinium Blue", "Oreo", "Panda"],
      imageTypes: ["onFoot", "lifestyle"],
      colorMood: ["pale blue", "dark denim", "cream"],
      styleTags: ["real daily", "office to city", "denim commute"],
      topCategory: "pale blue cotton shirt",
      bottomCategory: "dark indigo straight denim",
      outerLayerCategory: "no outer layer",
      bagCategory: "cream canvas tote",
      accessoryCategory: ["slim leather belt"],
      compactLine:
        "Pair a pale blue cotton shirt with dark indigo straight denim, a slim leather belt, and a cream tote for a realistic office-to-city outfit.",
      forbidden: ["overly youthful denim styling", "ripped jeans", "streetwear denim"]
    },
    {
      id: "commute-004",
      sceneKey: "commute",
      styleCluster: "darkAnchorCommute",
      season: ["autumn", "winter"],
      suitableShoes: ["Cloud Dancer", "Sand Dollar", "Cappuccino", "Maple Grove", "Oreo", "Panda"],
      imageTypes: ["onFoot", "lifestyle", "mirror"],
      colorMood: ["navy", "warm beige", "muted brown"],
      styleTags: ["mature commute", "dark anchor", "quiet polish"],
      topCategory: "navy fine-knit top",
      bottomCategory: "warm beige trousers",
      outerLayerCategory: "soft camel jacket",
      bagCategory: "muted brown leather bag",
      accessoryCategory: ["simple watch"],
      compactLine:
        "Style her in a navy fine-knit top, warm beige trousers, a soft camel jacket, and a muted brown leather bag for mature daily commuting.",
      forbidden: ["heavy corporate mood", "old-fashioned mature styling", "too dark outfit"]
    },
    {
      id: "commute-005",
      sceneKey: "commute",
      styleCluster: "darkAnchorCommute",
      season: ["spring", "autumn"],
      suitableShoes: ["Cloud Dancer", "Sand Dollar", "Oreo", "Panda", "Silver Romance"],
      imageTypes: ["onFoot", "lifestyle", "mirror"],
      colorMood: ["charcoal", "white", "stone grey"],
      styleTags: ["grounded workday", "real-life commute", "neutral contrast"],
      topCategory: "charcoal cardigan",
      bottomCategory: "stone grey tailored trousers",
      outerLayerCategory: "no outer layer",
      bagCategory: "taupe shoulder bag",
      accessoryCategory: ["minimal optical glasses"],
      compactLine:
        "Use a charcoal cardigan over a white tee, stone grey tailored trousers, and a taupe shoulder bag for a grounded refined workday look.",
      forbidden: ["all-beige AI styling", "cold office look", "stock-photo business outfit"]
    },
    {
      id: "commute-006",
      sceneKey: "commute",
      styleCluster: "refinedOfficeToCity",
      season: ["winter"],
      suitableShoes: ["Cloud Dancer", "Sand Dollar", "Cappuccino", "Maple Grove", "Oreo", "Panda"],
      imageTypes: ["onFoot", "lifestyle"],
      colorMood: ["cream", "charcoal", "warm grey"],
      styleTags: ["winter commute", "composed", "daily elegance"],
      topCategory: "cream high-neck knit",
      bottomCategory: "charcoal-soft grey trousers",
      outerLayerCategory: "warm grey coat",
      bagCategory: "grey-beige shoulder bag",
      accessoryCategory: ["soft scarf"],
      compactLine:
        "Style her in a cream high-neck knit, charcoal-soft grey trousers, a warm grey coat, and a grey-beige shoulder bag for clean winter commuting.",
      forbidden: ["bulky winter outfit", "all-black heaviness", "old-fashioned coat styling"]
    },
    {
      id: "commute-007",
      sceneKey: "commute",
      styleCluster: "cleanMinimal",
      season: ["spring", "summer"],
      suitableShoes: ["Cloud Dancer", "Sand Dollar", "Aire", "Lemon", "Delphinium Blue"],
      imageTypes: ["onFoot", "lifestyle", "mirror"],
      colorMood: ["white", "beige", "light tan"],
      styleTags: ["clean commute", "breathable", "minimal"],
      topCategory: "white short-sleeve shirt",
      bottomCategory: "beige wide-leg trousers",
      outerLayerCategory: "no outer layer",
      bagCategory: "light tan handbag",
      accessoryCategory: ["subtle gold earrings"],
      compactLine:
        "Style her in a white short-sleeve shirt, beige wide-leg trousers, and a light tan handbag for a breathable refined commute.",
      forbidden: ["too casual summer office", "cheap shirt styling", "insufficient garment coverage"]
    },
    {
      id: "commute-008",
      sceneKey: "commute",
      styleCluster: "realDailyWorkwear",
      season: ["autumn", "winter"],
      suitableShoes: ["Cloud Dancer", "Sand Dollar", "Cappuccino", "Maple Grove", "Oreo", "Panda"],
      imageTypes: ["onFoot", "lifestyle"],
      colorMood: ["black accent", "camel", "cream"],
      styleTags: ["mature minimal", "office to errands", "real wardrobe"],
      topCategory: "black fine-knit top",
      bottomCategory: "warm beige straight skirt",
      outerLayerCategory: "muted camel coat",
      bagCategory: "black small shoulder bag",
      accessoryCategory: ["simple watch"],
      compactLine:
        "Use a black fine-knit top, warm beige straight skirt, muted camel coat, and a small black shoulder bag for refined feminine autumn commuting.",
      forbidden: ["party skirt styling", "high heel mood", "socialite office look"]
    },
    {
      id: "commute-009",
      sceneKey: "commute",
      styleCluster: "lightBusiness",
      season: ["spring", "autumn"],
      suitableShoes: ["Cloud Dancer", "Sand Dollar", "Delphinium Blue", "Silver Romance", "Oreo", "Panda"],
      imageTypes: ["onFoot", "lifestyle"],
      colorMood: ["grey-blue", "cream", "taupe"],
      styleTags: ["soft business", "city office", "low saturation"],
      topCategory: "grey-blue shirt",
      bottomCategory: "cream trousers",
      outerLayerCategory: "light wool-blend blazer",
      bagCategory: "taupe structured tote",
      accessoryCategory: ["minimal optical glasses"],
      compactLine:
        "Pair a grey-blue shirt with cream trousers, a light wool-blend blazer, and a taupe structured tote for a soft low-saturation commute.",
      forbidden: ["stiff blazer uniform", "cold corporate styling", "too masculine office look"]
    },
    {
      id: "commute-010",
      sceneKey: "commute",
      styleCluster: "refinedOfficeToCity",
      season: ["summer"],
      suitableShoes: ["Cloud Dancer", "Sand Dollar", "Aire", "Lemon", "Delphinium Blue"],
      imageTypes: ["onFoot", "lifestyle", "mirror"],
      colorMood: ["cream", "soft grey", "black accent"],
      styleTags: ["summer office", "real daily", "clean contrast"],
      topCategory: "ivory sleeveless top",
      bottomCategory: "soft grey summer trousers",
      outerLayerCategory: "white oversized shirt as light layer",
      bagCategory: "black small shoulder bag",
      accessoryCategory: ["simple watch"],
      compactLine:
        "Use an ivory sleeveless top under a white oversized shirt, soft grey summer trousers, and a small black shoulder bag for a real warm-weather commute.",
      forbidden: ["insufficiently layered sleeveless outfit", "posed-selfie mood", "cheap summer office styling"]
    }
  ],
  cafeExterior: [
    {
      id: "cafe-001",
      sceneKey: "cafeExterior",
      styleCluster: "matureContrast",
      season: ["summer"],
      suitableShoes: ["Cloud Dancer", "Sand Dollar", "Silver Romance", "Oreo", "Panda"],
      imageTypes: ["onFoot", "lifestyle"],
      colorMood: ["black", "white", "taupe"],
      styleTags: ["cafe street", "mature contrast", "light social"],
      topCategory: "black fitted tank",
      bottomCategory: "white straight midi skirt",
      outerLayerCategory: "no outer layer",
      bagCategory: "black small shoulder bag",
      accessoryCategory: ["subtle gold earrings"],
      compactLine:
        "Style her in a black fitted tank, white straight midi skirt, and a small black shoulder bag for a mature cafe-side summer outfit.",
      forbidden: ["body-focused cafe pose", "impractical short hemline", "brunch influencer styling"]
    },
    {
      id: "cafe-002",
      sceneKey: "cafeExterior",
      styleCluster: "quietCafeFeminine",
      season: ["spring", "summer"],
      suitableShoes: ["Cloud Dancer", "Sand Dollar", "Lemon", "Delphinium Blue", "Aire"],
      imageTypes: ["onFoot", "lifestyle"],
      colorMood: ["ivory", "beige", "soft beige"],
      styleTags: ["soft feminine", "refined weekend", "cafe"],
      topCategory: "ivory sleeveless top",
      bottomCategory: "beige A-line skirt",
      outerLayerCategory: "soft beige cardigan",
      bagCategory: "soft beige mini bag",
      accessoryCategory: ["subtle gold earrings"],
      compactLine:
        "Pair an ivory sleeveless top with a beige A-line skirt, a soft beige cardigan, and a small shoulder bag for gentle but mature cafe styling.",
      forbidden: ["overly youthful outfit", "lace overload", "princess skirt mood"]
    },
    {
      id: "cafe-003",
      sceneKey: "cafeExterior",
      styleCluster: "bloggerLite",
      season: ["spring", "summer"],
      suitableShoes: ["Cloud Dancer", "Sand Dollar", "Aire", "Delphinium Blue", "Lemon"],
      imageTypes: ["onFoot", "lifestyle"],
      colorMood: ["pale blue", "denim", "canvas"],
      styleTags: ["light blogger", "real daily", "coffee walk"],
      topCategory: "pale blue open shirt",
      bottomCategory: "light denim jeans",
      outerLayerCategory: "white tee base",
      bagCategory: "natural canvas tote",
      accessoryCategory: ["coffee cup"],
      compactLine:
        "Style her in a white tee under a pale blue open shirt, light denim jeans, and a natural canvas tote for a relaxed cafe-walk outfit.",
      forbidden: ["internet celebrity cafe look", "over-posed blogger energy", "fake candid"]
    },
    {
      id: "cafe-004",
      sceneKey: "cafeExterior",
      styleCluster: "darkAnchorCafe",
      season: ["summer", "autumn"],
      suitableShoes: ["Cloud Dancer", "Sand Dollar", "Cappuccino", "Maple Grove", "Silver Romance"],
      imageTypes: ["onFoot", "lifestyle"],
      colorMood: ["dark coffee", "cream", "taupe"],
      styleTags: ["warm contrast", "mature cafe", "quiet depth"],
      topCategory: "dark coffee sleeveless top",
      bottomCategory: "cream wide-leg trousers",
      outerLayerCategory: "no outer layer",
      bagCategory: "taupe shoulder bag",
      accessoryCategory: ["coffee cup"],
      compactLine:
        "Use a dark coffee sleeveless top, cream wide-leg trousers, and a taupe shoulder bag for quiet warm cafe-side depth.",
      forbidden: ["body-focused sleeveless styling", "overly dark summer look", "nightlife mood"]
    },
    {
      id: "cafe-005",
      sceneKey: "cafeExterior",
      styleCluster: "cleanSummerCafe",
      season: ["summer"],
      suitableShoes: ["Aire", "Cloud Dancer", "Sand Dollar", "Lemon", "Delphinium Blue"],
      imageTypes: ["onFoot", "lifestyle"],
      colorMood: ["cream", "linen beige", "light tan"],
      styleTags: ["summer cafe", "breathable", "clean daily"],
      topCategory: "cream linen shirt",
      bottomCategory: "ivory straight-leg trousers",
      outerLayerCategory: "no outer layer",
      bagCategory: "light tan handbag",
      accessoryCategory: ["understated sunglasses only outdoor"],
      compactLine:
        "Use a cream linen shirt, ivory straight-leg trousers, and a light tan handbag for breathable summer cafe ease.",
      forbidden: ["beach vacation styling", "resort look", "overexposed summer pose"]
    },
    {
      id: "cafe-006",
      sceneKey: "cafeExterior",
      styleCluster: "refinedWeekendCafe",
      season: ["spring", "autumn"],
      suitableShoes: ["Cloud Dancer", "Sand Dollar", "Cappuccino", "Oreo", "Panda"],
      imageTypes: ["onFoot", "lifestyle"],
      colorMood: ["oatmeal", "dark denim", "brown"],
      styleTags: ["weekend cafe", "real wardrobe", "soft texture"],
      topCategory: "oatmeal lightweight knit",
      bottomCategory: "dark indigo straight denim",
      outerLayerCategory: "no outer layer",
      bagCategory: "soft brown leather bag",
      accessoryCategory: ["simple watch"],
      compactLine:
        "Style her in an oatmeal lightweight knit, dark indigo straight denim, and a soft brown leather bag for a real weekend cafe outfit.",
      forbidden: ["all-beige template", "teen denim styling", "messy casual"]
    },
    {
      id: "cafe-007",
      sceneKey: "cafeExterior",
      styleCluster: "matureContrast",
      season: ["autumn", "winter"],
      suitableShoes: ["Silver Romance", "Oreo", "Panda", "Cloud Dancer", "Sand Dollar"],
      imageTypes: ["onFoot", "lifestyle"],
      colorMood: ["black", "warm grey", "cream"],
      styleTags: ["urban cafe", "clean contrast", "light social"],
      topCategory: "black fine-knit top",
      bottomCategory: "warm grey wool trousers",
      outerLayerCategory: "cream long coat",
      bagCategory: "black small shoulder bag",
      accessoryCategory: ["simple watch"],
      compactLine:
        "Style her in a black fine-knit top, warm grey wool trousers, a cream long coat, and a small black shoulder bag for refined cafe-side winter contrast.",
      forbidden: ["all-black heaviness", "luxury ad pose", "cold fashion distance"]
    },
    {
      id: "cafe-008",
      sceneKey: "cafeExterior",
      styleCluster: "quietCafeFeminine",
      season: ["spring", "summer"],
      suitableShoes: ["Sand Dollar", "Cloud Dancer", "Lemon", "Delphinium Blue", "Silver Romance"],
      imageTypes: ["onFoot", "lifestyle", "mirror"],
      colorMood: ["cream", "soft grey", "taupe"],
      styleTags: ["soft feminine", "midi skirt", "quiet cafe"],
      topCategory: "soft grey short-sleeve knit",
      bottomCategory: "cream column skirt",
      outerLayerCategory: "no outer layer",
      bagCategory: "taupe handbag",
      accessoryCategory: ["subtle gold earrings"],
      compactLine:
        "Pair a soft grey short-sleeve knit with a cream column skirt and a taupe handbag for a mature soft cafe outfit.",
      forbidden: ["too sweet skirt styling", "posed brunch look", "cheap knit texture"]
    },
    {
      id: "cafe-009",
      sceneKey: "cafeExterior",
      styleCluster: "bloggerLite",
      season: ["spring", "summer", "autumn"],
      suitableShoes: ["Cloud Dancer", "Sand Dollar", "Aire", "Oreo", "Panda"],
      imageTypes: ["onFoot", "lifestyle"],
      colorMood: ["white", "charcoal", "linen"],
      styleTags: ["outfit record", "real street", "friend-shot"],
      topCategory: "charcoal ribbed tank",
      bottomCategory: "linen trousers",
      outerLayerCategory: "white oversized shirt as light layer",
      bagCategory: "black flat shoulder bag",
      accessoryCategory: ["coffee cup"],
      compactLine:
        "Use a charcoal ribbed tank under a white oversized shirt, linen trousers, and a black flat shoulder bag for a believable cafe outfit record.",
      forbidden: ["posed selfie mood", "over-styled influencer pose", "cropped shoes"]
    },
    {
      id: "cafe-010",
      sceneKey: "cafeExterior",
      styleCluster: "refinedWeekendCafe",
      season: ["autumn"],
      suitableShoes: ["Cappuccino", "Maple Grove", "Cloud Dancer", "Sand Dollar", "Oreo"],
      imageTypes: ["onFoot", "lifestyle"],
      colorMood: ["camel", "cream", "dark denim"],
      styleTags: ["autumn cafe", "warm neutral", "quiet luxury casual"],
      topCategory: "cream shirt",
      bottomCategory: "dark straight-leg denim",
      outerLayerCategory: "soft camel jacket",
      bagCategory: "muted brown leather bag",
      accessoryCategory: ["simple watch"],
      compactLine:
        "Pair a cream shirt with dark straight-leg denim, a soft camel jacket, and a muted brown leather bag for a grounded autumn cafe look.",
      forbidden: ["muddy brown overload", "old-fashioned autumn styling", "heavy retro mood"]
    }
  ],
  weekendCityWalk: [
    {
      id: "weekend-001",
      sceneKey: "weekendCityWalk",
      styleCluster: "denimDaily",
      season: ["spring", "summer"],
      suitableShoes: ["Cloud Dancer", "Sand Dollar", "Aire", "Delphinium Blue", "Lemon"],
      imageTypes: ["onFoot", "lifestyle"],
      colorMood: ["white", "light denim", "canvas"],
      styleTags: ["weekend walk", "denim daily", "easy styling"],
      topCategory: "oversized white shirt",
      bottomCategory: "light blue straight denim",
      outerLayerCategory: "no outer layer",
      bagCategory: "natural canvas tote",
      accessoryCategory: ["simple watch"],
      compactLine:
        "Style her in an oversized white shirt, light blue straight denim, and a natural canvas tote for an easy refined weekend walk.",
      forbidden: ["overly youthful denim styling", "tourist outfit", "streetwear"]
    },
    {
      id: "weekend-002",
      sceneKey: "weekendCityWalk",
      styleCluster: "darkAnchorWeekend",
      season: ["summer"],
      suitableShoes: ["Cloud Dancer", "Sand Dollar", "Aire", "Oreo", "Panda"],
      imageTypes: ["onFoot", "lifestyle"],
      colorMood: ["black", "white", "pale denim"],
      styleTags: ["mature weekend", "black anchor", "relaxed city"],
      topCategory: "black fitted tank",
      bottomCategory: "pale denim jeans",
      outerLayerCategory: "oversized white shirt as light layer",
      bagCategory: "black small shoulder bag",
      accessoryCategory: ["understated sunglasses only outdoor"],
      compactLine:
        "Use a black fitted tank under an oversized white shirt, pale denim, and a restrained black shoulder bag for a mature relaxed city look.",
      forbidden: ["body-focused sleeveless styling", "influencer street pose", "insufficient garment coverage"]
    },
    {
      id: "weekend-003",
      sceneKey: "weekendCityWalk",
      styleCluster: "relaxedWeekend",
      season: ["spring", "autumn"],
      suitableShoes: ["Cloud Dancer", "Sand Dollar", "Cappuccino", "Maple Grove", "Oreo"],
      imageTypes: ["onFoot", "lifestyle"],
      colorMood: ["cream", "oatmeal", "taupe"],
      styleTags: ["soft weekend", "quiet daily", "relaxed trousers"],
      topCategory: "cream lightweight knit tee",
      bottomCategory: "oatmeal wide-leg trousers",
      outerLayerCategory: "no outer layer",
      bagCategory: "soft taupe handbag",
      accessoryCategory: ["simple watch"],
      compactLine:
        "Pair a cream lightweight knit tee with oatmeal wide-leg trousers and a soft taupe handbag for calm weekend ease.",
      forbidden: ["all-beige AI template", "pajama-like outfit", "shapeless basics"]
    },
    {
      id: "weekend-004",
      sceneKey: "weekendCityWalk",
      styleCluster: "realDaily",
      season: ["spring", "summer"],
      suitableShoes: ["Cloud Dancer", "Sand Dollar", "Lemon", "Aire", "Delphinium Blue"],
      imageTypes: ["onFoot", "lifestyle"],
      colorMood: ["olive", "ivory", "warm beige"],
      styleTags: ["non-template", "grounded daily", "city walk"],
      topCategory: "ivory tee",
      bottomCategory: "warm beige trousers",
      outerLayerCategory: "soft olive shirt jacket",
      bagCategory: "canvas tote",
      accessoryCategory: ["simple watch"],
      compactLine:
        "Use a soft olive shirt jacket, ivory tee, warm beige trousers, and a canvas tote for a grounded non-template weekend outfit.",
      forbidden: ["military styling", "too masculine olive look", "random color mixing"]
    },
    {
      id: "weekend-005",
      sceneKey: "weekendCityWalk",
      styleCluster: "darkAnchorWeekend",
      season: ["summer"],
      suitableShoes: ["Cloud Dancer", "Sand Dollar", "Aire", "Oreo", "Panda"],
      imageTypes: ["onFoot", "lifestyle"],
      colorMood: ["navy", "light denim", "cream"],
      styleTags: ["real summer", "clean contrast", "city walk"],
      topCategory: "navy sleeveless knit top",
      bottomCategory: "light denim jeans",
      outerLayerCategory: "no outer layer",
      bagCategory: "cream tote",
      accessoryCategory: ["subtle gold earrings"],
      compactLine:
        "Style her in a navy sleeveless knit top, light denim jeans, and a cream tote for a realistic city-walk outfit with clean contrast.",
      forbidden: ["too dark summer styling", "teen casual look", "cheap knit"]
    },
    {
      id: "weekend-006",
      sceneKey: "weekendCityWalk",
      styleCluster: "cleanMinimal",
      season: ["summer"],
      suitableShoes: ["Cloud Dancer", "Sand Dollar", "Aire", "Lemon", "Delphinium Blue"],
      imageTypes: ["onFoot", "lifestyle"],
      colorMood: ["white", "stone grey", "woven"],
      styleTags: ["summer walk", "shorts", "easy refined"],
      topCategory: "white cotton T-shirt",
      bottomCategory: "stone grey Bermuda shorts",
      outerLayerCategory: "no outer layer",
      bagCategory: "restrained woven bag",
      accessoryCategory: ["simple watch"],
      compactLine:
        "Style her in a white cotton T-shirt, stone grey Bermuda shorts, and a restrained woven bag for a clean refined summer walk.",
      forbidden: ["overly youthful shorts look", "beach outfit", "cheap T-shirt styling"]
    },
    {
      id: "weekend-007",
      sceneKey: "weekendCityWalk",
      styleCluster: "refinedCasual",
      season: ["autumn"],
      suitableShoes: ["Cappuccino", "Maple Grove", "Cloud Dancer", "Sand Dollar", "Oreo"],
      imageTypes: ["onFoot", "lifestyle"],
      colorMood: ["chocolate brown", "dark denim", "cream"],
      styleTags: ["autumn weekend", "real wardrobe", "warm contrast"],
      topCategory: "chocolate brown knit cardigan",
      bottomCategory: "dark denim",
      outerLayerCategory: "cream tee base",
      bagCategory: "no-logo leather shoulder bag",
      accessoryCategory: ["simple watch"],
      compactLine:
        "Pair a chocolate brown knit cardigan with dark denim, a cream tee, and a no-logo leather shoulder bag for realistic autumn daily wear.",
      forbidden: ["muddy brown overload", "old-fashioned cardigan styling", "heavy retro look"]
    },
    {
      id: "weekend-008",
      sceneKey: "weekendCityWalk",
      styleCluster: "easyLayering",
      season: ["winter"],
      suitableShoes: ["Cloud Dancer", "Sand Dollar", "Cappuccino", "Maple Grove", "Oreo", "Panda"],
      imageTypes: ["onFoot", "lifestyle"],
      colorMood: ["charcoal", "oatmeal", "dark brown"],
      styleTags: ["winter walk", "real depth", "warm daily"],
      topCategory: "cream knit",
      bottomCategory: "oatmeal wide-leg trousers",
      outerLayerCategory: "charcoal coat",
      bagCategory: "dark brown tote",
      accessoryCategory: ["soft scarf"],
      compactLine:
        "Pair a charcoal coat with oatmeal wide-leg trousers, a cream knit, and a dark brown tote for realistic winter city-walk depth.",
      forbidden: ["all-black winter", "bulky coat styling", "bleak winter mood"]
    },
    {
      id: "weekend-009",
      sceneKey: "weekendCityWalk",
      styleCluster: "relaxedWeekend",
      season: ["spring", "summer"],
      suitableShoes: ["Aire", "Cloud Dancer", "Sand Dollar", "Lemon"],
      imageTypes: ["onFoot", "lifestyle"],
      colorMood: ["cream", "pale khaki", "light tan"],
      styleTags: ["light weekend", "breathable", "errand walk"],
      topCategory: "cream linen shirt",
      bottomCategory: "pale khaki lightweight trousers",
      outerLayerCategory: "no outer layer",
      bagCategory: "light tan handbag",
      accessoryCategory: ["understated sunglasses only outdoor"],
      compactLine:
        "Use a cream linen shirt, pale khaki lightweight trousers, and a light tan handbag for a breathable weekend city walk.",
      forbidden: ["resort vacation look", "tourist outfit", "overly loose linen outfit"]
    },
    {
      id: "weekend-010",
      sceneKey: "weekendCityWalk",
      styleCluster: "refinedCasual",
      season: ["spring", "autumn"],
      suitableShoes: ["Silver Romance", "Cloud Dancer", "Sand Dollar", "Oreo", "Panda"],
      imageTypes: ["onFoot", "lifestyle"],
      colorMood: ["soft grey", "cream", "black accent"],
      styleTags: ["urban refined", "soft contrast", "weekend polish"],
      topCategory: "soft grey knit top",
      bottomCategory: "cream straight trousers",
      outerLayerCategory: "no outer layer",
      bagCategory: "black small shoulder bag",
      accessoryCategory: ["simple watch"],
      compactLine:
        "Style her in a soft grey knit top, cream straight trousers, and a small black shoulder bag for a refined but relaxed weekend city look.",
      forbidden: ["overly formal styling", "cold minimalism", "luxury-ad pose"]
    }
  ],
  gymInterior: [
    {
      id: "gym-001",
      sceneKey: "gymInterior",
      styleCluster: "premiumGymDark",
      season: ["summer", "spring"],
      suitableShoes: ["Aire", "Cloud Dancer", "Sand Dollar", "Oreo", "Panda"],
      imageTypes: ["gym", "lifestyle"],
      colorMood: ["black", "charcoal", "neutral"],
      styleTags: ["premium gym", "dark active", "shorts"],
      topCategory: "black fitted T-shirt",
      bottomCategory: "charcoal clean athletic shorts",
      outerLayerCategory: "no outer layer",
      bagCategory: "practical no-logo gym tote",
      accessoryCategory: ["water bottle"],
      compactLine:
        "Use a black fitted T-shirt, charcoal clean athletic shorts, and a practical no-logo gym tote for a clean premium-gym look.",
      forbidden: ["bodybuilder outfit", "neon activewear", "insufficiently layered activewear"]
    },
    {
      id: "gym-002",
      sceneKey: "gymInterior",
      styleCluster: "cleanActiveShorts",
      season: ["summer"],
      suitableShoes: ["Aire", "Cloud Dancer", "Sand Dollar", "Delphinium Blue", "Lemon"],
      imageTypes: ["gym", "lifestyle"],
      colorMood: ["deep navy", "soft grey", "taupe"],
      styleTags: ["premium gym", "active shorts", "calm training"],
      topCategory: "deep navy short-sleeve active top",
      bottomCategory: "soft grey active shorts",
      outerLayerCategory: "no outer layer",
      bagCategory: "minimal taupe gym bag",
      accessoryCategory: ["water bottle"],
      compactLine:
        "Style her in a deep navy short-sleeve active top, soft grey active shorts, and a minimal taupe gym bag for a calm high-end training mood.",
      forbidden: ["running gear", "neon gymwear", "fitness influencer pose"]
    },
    {
      id: "gym-003",
      sceneKey: "gymInterior",
      styleCluster: "cleanActiveShorts",
      season: ["summer"],
      suitableShoes: ["Aire", "Cloud Dancer", "Sand Dollar", "Lemon"],
      imageTypes: ["gym", "lifestyle"],
      colorMood: ["dark coffee", "ivory", "taupe"],
      styleTags: ["warm active", "premium gym", "summer movement"],
      topCategory: "dark brown fitted short-sleeve top",
      bottomCategory: "ivory clean athletic shorts",
      outerLayerCategory: "no outer layer",
      bagCategory: "taupe movement tote",
      accessoryCategory: ["water bottle"],
      compactLine:
        "Use a dark brown fitted short-sleeve top, ivory clean athletic shorts, and a taupe tote for a refined summer indoor workout look.",
      forbidden: ["body-focused activewear", "impractical short active shorts", "cheap sports set"]
    },
    {
      id: "gym-004",
      sceneKey: "gymInterior",
      styleCluster: "gymMirrorCalm",
      season: ["spring", "summer"],
      suitableShoes: ["Aire", "Cloud Dancer", "Sand Dollar", "Oreo", "Panda"],
      imageTypes: ["gym", "mirror"],
      colorMood: ["black", "cream", "pale grey"],
      styleTags: ["gym mirror", "light layer", "premium movement"],
      topCategory: "black fitted tank",
      bottomCategory: "cream sporty shorts",
      outerLayerCategory: "lightweight pale grey outer layer",
      bagCategory: "practical no-logo gym tote",
      accessoryCategory: ["water bottle"],
      compactLine:
        "Style her in a black fitted tank, cream sporty shorts, and a lightweight pale grey outer layer for a polished movement-space outfit.",
      forbidden: ["mirror influencer pose", "insufficiently layered activewear", "long-leg gym selfie"]
    },
    {
      id: "gym-005",
      sceneKey: "gymInterior",
      styleCluster: "lightStrengthMoment",
      season: ["autumn", "winter", "spring"],
      suitableShoes: ["Cloud Dancer", "Sand Dollar", "Oreo", "Panda", "Cappuccino", "Maple Grove"],
      imageTypes: ["gym", "lifestyle"],
      colorMood: ["charcoal", "black", "neutral"],
      styleTags: ["light strength", "machine area", "premium gym"],
      topCategory: "charcoal fitted tee",
      bottomCategory: "black straight active trousers",
      outerLayerCategory: "no outer layer",
      bagCategory: "restrained gym tote",
      accessoryCategory: ["light dumbbell"],
      compactLine:
        "Use a charcoal fitted tee, black straight active trousers, and a restrained gym tote for a premium strength-area scene.",
      forbidden: ["hardcore lifting", "bodybuilding", "powerlifting strain"]
    },
    {
      id: "gym-006",
      sceneKey: "gymInterior",
      styleCluster: "premiumGymDark",
      season: ["spring", "summer"],
      suitableShoes: ["Aire", "Cloud Dancer", "Sand Dollar", "Oreo", "Panda"],
      imageTypes: ["gym", "lifestyle"],
      colorMood: ["graphite", "taupe", "neutral"],
      styleTags: ["upscale gym", "dark active", "real movement"],
      topCategory: "graphite clean athletic tee",
      bottomCategory: "taupe active shorts",
      outerLayerCategory: "no outer layer",
      bagCategory: "no-logo tote",
      accessoryCategory: ["water bottle"],
      compactLine:
        "Style her in a graphite clean athletic tee, taupe active shorts, and a no-logo tote for a realistic upscale gym moment.",
      forbidden: ["compression-brand styling", "cheap gym shorts", "aggressive workout pose"]
    },
    {
      id: "gym-007",
      sceneKey: "gymInterior",
      styleCluster: "refinedMovementSpace",
      season: ["spring", "summer", "autumn"],
      suitableShoes: ["Aire", "Cloud Dancer", "Sand Dollar", "Lemon"],
      imageTypes: ["gym", "lifestyle"],
      colorMood: ["white", "black", "structured"],
      styleTags: ["clean contrast", "gym transition", "refined active"],
      topCategory: "white fitted short-sleeve top",
      bottomCategory: "black relaxed gym trousers",
      outerLayerCategory: "no outer layer",
      bagCategory: "clean structured gym bag",
      accessoryCategory: ["water bottle"],
      compactLine:
        "Use a white fitted short-sleeve top, black relaxed gym trousers, and a clean structured gym bag for a refined contrast gym look.",
      forbidden: ["sports campaign look", "technical running outfit", "gym-bro styling"]
    },
    {
      id: "gym-008",
      sceneKey: "gymInterior",
      styleCluster: "gymMirrorCalm",
      season: ["autumn", "winter"],
      suitableShoes: ["Cloud Dancer", "Sand Dollar", "Cappuccino", "Maple Grove", "Oreo", "Panda"],
      imageTypes: ["gym", "mirror"],
      colorMood: ["cream", "charcoal", "taupe"],
      styleTags: ["soft active", "gym mirror", "restrained"],
      topCategory: "cream active tank",
      bottomCategory: "charcoal clean leggings or straight active trousers",
      outerLayerCategory: "taupe zip outer layer",
      bagCategory: "practical gym tote",
      accessoryCategory: ["water bottle"],
      compactLine:
        "Style her in a cream active tank, charcoal clean leggings or straight active trousers, and a taupe zip outer layer for a soft but grounded gym image.",
      forbidden: ["overly close-fitting influencer leggings", "figure-emphasizing fitness pose", "plastic activewear"]
    },
    {
      id: "gym-009",
      sceneKey: "gymInterior",
      styleCluster: "cleanActiveShorts",
      season: ["summer"],
      suitableShoes: ["Aire", "Cloud Dancer", "Sand Dollar", "Delphinium Blue", "Lemon"],
      imageTypes: ["gym", "lifestyle"],
      colorMood: ["pale grey", "black", "cream"],
      styleTags: ["summer gym", "shorts", "real active"],
      topCategory: "pale grey short-sleeve tee",
      bottomCategory: "black active shorts",
      outerLayerCategory: "cream overshirt tied or lightly layered",
      bagCategory: "clean gym tote",
      accessoryCategory: ["water bottle"],
      compactLine:
        "Use a pale grey short-sleeve tee, black active shorts, and a cream overshirt tied or lightly layered for a believable gym-going scene.",
      forbidden: ["impractical short active shorts", "cheap matching active set", "gym influencer energy"]
    },
    {
      id: "gym-010",
      sceneKey: "gymInterior",
      styleCluster: "lightStrengthMoment",
      season: ["autumn", "winter"],
      suitableShoes: ["Cappuccino", "Maple Grove", "Cloud Dancer", "Sand Dollar", "Oreo", "Panda"],
      imageTypes: ["gym", "lifestyle"],
      colorMood: ["deep charcoal", "taupe", "dark active"],
      styleTags: ["light strength", "premium gym", "calm training"],
      topCategory: "deep charcoal athletic tee",
      bottomCategory: "taupe jogger-style trousers",
      outerLayerCategory: "no outer layer",
      bagCategory: "understated gym bag",
      accessoryCategory: ["light dumbbell", "water bottle"],
      compactLine:
        "Style her in a deep charcoal athletic tee, taupe jogger-style trousers, and an understated gym bag for a clean machine-area or training-break image.",
      forbidden: ["heavy lifting strain", "bodybuilding energy", "sweaty gym realism"]
    }
  ]
};

export const PER_SCENE_OUTFIT_PHASE1_SCENES = [
  "commute",
  "cafeExterior",
  "weekendCityWalk",
  "gymInterior"
] as const;

export const PER_SCENE_OUTFIT_PHASE1_COUNT = PER_SCENE_OUTFIT_PHASE1_SCENES.reduce(
  (total, sceneKey) => total + perSceneOutfitLibrary[sceneKey].length,
  0
);
