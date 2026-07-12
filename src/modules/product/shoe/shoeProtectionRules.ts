import { getShoeSpecificAccuracyLine } from "../../../data/shoeSpecificAccuracyProfiles";
import type { ProductAdapterInput, ProductImageType, ProductSeason } from "../types";
import type { ShoeProductContext, TeamShoe } from "./shoeProductTypes";

export type ShoeProtectionInput = {
  imageType: ProductImageType;
  shoe: TeamShoe;
  shoeDisplayName: string;
  customShoe: string;
  hasShoe: boolean;
};

export type ShoeProtectionLines = {
  productLine: string;
  accuracyLine: string;
  shoeSpecificAccuracyLine: string;
  visibilityLine: string;
  clippingLine: string;
  lacesLine: string;
  sceneControlLine: string;
};

const nonProductShoeAccuracyLine =
  "If the THERUIZ AURA sneaker appears in this non-product atmosphere image, keep it subtle and secondary. Preserve its real color, material texture, and recognizable shape, but do not turn the image into a direct product shot.";

const materialDetailShoeAccuracyLine =
  "If a THERUIZ AURA sneaker sample, shoe part, shoelace, material panel, or partial product detail appears, keep it secondary to the material story. Preserve the uploaded reference color, material texture, panel boundary, stitching, lace thickness, and recognizable trainer structure when visible, but do not turn the image into a full-shoe product shot.";

const uploadedSneakerAccuracyLine =
  "Use uploaded sneaker reference as strict source: low-cut German trainer silhouette, rounded toe box, slim outsole, panels, tongue, stitching, material, color, and proportions.";

const selectedSneakerAccuracyLine =
  "Preserve the selected THERUIZ AURA German trainer: low-cut silhouette, rounded toe box, slim outsole, panels, tongue, stitching, material, color, and proportions.";

const shoeVisibilityLine =
  "Keep at least one sneaker fully visible from toe to heel, with the second clearly readable and grounded.";

const shoeClippingLine =
  "Keep the foot seated inside the shoe; ankle, sock, garment hem, collar, tongue, tied laces, outsole, floor, and props stay separate and readable; no clipping or fabric fusion.";

const lacesLine = "Keep laces naturally tied, with readable loops, lace ends, eyelets, and tongue.";

const onFootMaterialResponseLine =
  "When worn, allow only subtle forefoot upper flex, gentle collar compression, settled laces, and grounded contact shadow; never let the foot, pose, or fabric reshape the toe box, panels, outsole, or silhouette.";

const shoeKeywords = [
  "鞋子",
  "鞋",
  "样鞋",
  "产品",
  "鞋带",
  "鞋舌",
  "鞋底",
  "鞋面",
  "鞋头",
  "鞋型",
  "德训鞋",
  "单鞋",
  "双鞋",
  "鞋跟",
  "上脚",
  "sneaker",
  "sneakers",
  "shoe",
  "shoes",
  "lace",
  "laces",
  "product",
  "outsole",
  "sole",
  "tongue",
  "upper",
  "toe box"
];

const shoeStyleLines: Record<TeamShoe, string> = {
  "Cloud Dancer 云舞者":
    "Classic clean light-tone foundation; coordinate it with cream, warm beige, soft denim blue, and refined daily neutrals.",
  "Sand Dollar 沙钱白":
    "Warm off-white foundation; coordinate it with oatmeal, soft stone, pale khaki, and refined everyday neutrals.",
  "Delphinium Blue 飞燕草蓝":
    "Low-saturation airy blue; coordinate it with warm white, pale denim blue, oatmeal, and fresh light neutrals.",
  "Silver Romance 银色浪漫":
    "Soft moonlit metallic accent for warm grey, cream white, and refined urban styling with a restrained satin-like glow.",
  "Aire 微风":
    "Light breathable spring-summer feeling for linen, airy woven texture, and a light neutral palette with refined daily ease.",
  "Cappuccino 卡布奇诺":
    "Warm coffee suede mood for knitwear, oatmeal, beige, and softly balanced seasonal layers.",
  "Lemon 柠檬":
    "Soft butter-yellow freshness for cream white, pale denim, and clean neutral styling with a mature low-saturation tone.",
  "Maple Grove 枫林":
    "Warm muted maple tone for soft knitwear, beige-brown layers, and gentle balanced seasonal styling.",
  "Oreo 奥利奥":
    "Clean black-white balance for black, white, grey, beige, and restrained daily styling with a soft refined edge.",
  "Panda 熊猫":
    "Clean black-white balance for black, white, grey, beige, and restrained daily styling with a soft refined edge.",
  自定义: "Use THERUIZ AURA's clean, low-saturation, refined daily styling system."
};

const shoeEnglishNames: Record<TeamShoe, string> = {
  "Cloud Dancer 云舞者": "Cloud Dancer",
  "Sand Dollar 沙钱白": "Sand Dollar",
  "Cappuccino 卡布奇诺": "Cappuccino",
  "Silver Romance 银色浪漫": "Silver Romance",
  "Aire 微风": "Aire",
  "Delphinium Blue 飞燕草蓝": "Delphinium Blue",
  "Lemon 柠檬": "Lemon",
  "Maple Grove 枫林": "Maple Grove",
  "Oreo 奥利奥": "Oreo",
  "Panda 熊猫": "Panda",
  自定义: "selected THERUIZ AURA"
};

const studioLaunchOnFootAngleLines = [
  "Use a premium controlled launch-studio full-figure angle with a stable 35-50mm perspective, clean floor contact, full styling proportions, and both sneakers clearly readable.",
  "Use a premium controlled lower-third studio styling angle from the garment hem or leg line down to the sneakers, keeping garment edge, shoe collar, laces, outsole, and floor contact clear.",
  "Use a premium controlled medium-close sneaker-on-foot studio detail angle from the leg line and garment edge to the floor, keeping the shoes readable but not foreground-enlarged.",
  "Use a premium controlled 3/4 front-side on-foot studio angle that shows toe shape, side panels, slim outsole line, lace area, garment hem separation, and natural shoe-ground contact."
];

const studioLaunchMirrorAngleLines = [
  "Use a premium controlled launch-studio full-length mirror angle with stable reflection, natural phone grip, readable full styling proportions, and both sneakers clearly reflected.",
  "Use a premium controlled lower-third mirror composition inside the launch studio, cropping from garment hem or leg line down to the sneakers while keeping the phone out of the look and shoe area.",
  "Use a premium controlled medium-close mirror sneaker-on-foot detail angle with garment edge, shoe collar, laces, outsole, and floor contact clear, without enlarging the sneakers.",
  "Use a premium controlled 3/4 mirror look angle that keeps the reflection straight, the legs natural, and the sneakers readable without mirror enlargement or distortion."
];

const studioLaunchSeriesShotLines = [
  "Studio launch series shot 1 of 8 — full-body front reference: frame the same person head-to-toe from a straight-on eye-level viewpoint, with a relaxed balanced stance, complete outfit proportions, both sneakers fully readable, and enough clean space around the figure. This is the identity, outfit, shoe, and studio reference for shots 2–8.",
  "Studio launch series shot 2 of 8 — full-body 3/4 front: keep the full figure in frame and turn the body about 30 degrees toward camera, with a subtle weight shift, relaxed arms, both sneakers readable, and no overlap that hides the shoe shape.",
  "Studio launch series shot 3 of 8 — full-body side profile: show the same full figure in a clean side-oriented stance with the head returning slightly toward the light, arms relaxed, feet separated naturally, and the side panel and outsole line of the sneakers clearly readable.",
  "Studio launch series shot 4 of 8 — full-body slight turn-back: photograph a restrained over-shoulder body turn from a rear 3/4 direction while keeping the face naturally visible if included, the complete outfit readable, both feet grounded, and at least one sneaker fully unobstructed.",
  "Studio launch series shot 5 of 8 — waist-to-floor straight front: crop from the waist or upper thigh to the floor, keep both legs natural and parallel with a small weight shift, and make garment hem, shoe collar, toe box, laces, outsole, and ground contact easy to judge.",
  "Studio launch series shot 6 of 8 — waist-to-floor 3/4 front-side: crop from the waist or upper thigh to the floor, place one foot only slightly forward, preserve realistic scale, and show the relationship between garment hem, ankle, toe shape, side panels, laces, and outsole without foreground enlargement.",
  "Studio launch series shot 7 of 8 — on-foot front detail: use a controlled close framing from mid-calf or garment edge to the floor, with both sneakers facing mostly forward, accurate left-right structure, natural ankle alignment, clean laces, and no wide-angle enlargement.",
  "Studio launch series shot 8 of 8 — on-foot 3/4 detail: use a controlled close 3/4 front-side framing from mid-calf or garment edge to the floor, showing toe curve, side panels, lace area, slim outsole line, and natural shoe-ground contact without cropping or distorting the sneakers."
];

function isWornPeopleImage(imageType: ProductImageType) {
  return imageType === "产品上脚图" || imageType === "对镜穿搭图" || imageType === "生活场景图";
}

export function getShoeDisplayName(context: ShoeProductContext) {
  return context.shoe === "自定义"
    ? context.customShoe.trim() || "selected THERUIZ AURA"
    : shoeEnglishNames[context.shoe];
}

export function shoeRequirementMentionsProduct(extraRequirement: string) {
  const text = extraRequirement.toLowerCase();
  return shoeKeywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

export function chooseShoeProtectionLines(input: ShoeProtectionInput): ShoeProtectionLines {
  if (!input.hasShoe) {
    return {
      productLine: "",
      accuracyLine: "",
      shoeSpecificAccuracyLine: "",
      visibilityLine: "",
      clippingLine: "",
      lacesLine: "",
      sceneControlLine: ""
    };
  }

  if (input.imageType === "非产品氛围图") {
    return {
      productLine: nonProductShoeAccuracyLine,
      accuracyLine: nonProductShoeAccuracyLine,
      shoeSpecificAccuracyLine: "",
      visibilityLine:
        "The shoe may appear only as a subtle partial object or background detail, not as the main product subject; do not force full on-foot display.",
      clippingLine: "",
      lacesLine: "",
      sceneControlLine:
        "The shoe may appear only as a subtle partial object or background detail, not as the main product subject; do not force full on-foot display."
    };
  }

  if (input.imageType === "拍摄花絮 / 材质图") {
    return {
      productLine: materialDetailShoeAccuracyLine,
      accuracyLine: materialDetailShoeAccuracyLine,
      shoeSpecificAccuracyLine: "",
      visibilityLine:
        "Show only the relevant sneaker sample, shoelace, panel, material transition, or partial product detail needed for the material story; do not force a complete pair or full on-foot display.",
      clippingLine: "",
      lacesLine: "",
      sceneControlLine:
        "Keep product details readable but secondary to swatches, notes, tools, texture, and behind-the-scenes development context."
    };
  }

  const accuracyLine =
    input.shoe === "自定义" && !input.customShoe.trim()
      ? selectedSneakerAccuracyLine
      : uploadedSneakerAccuracyLine;
  const shoeSpecificAccuracyLine = getShoeSpecificAccuracyLine(input.shoe, true);
  const productLine = [
    `THERUIZ AURA ${input.shoeDisplayName} German trainer as the main product reference.`,
    accuracyLine,
    isWornPeopleImage(input.imageType) ? onFootMaterialResponseLine : "",
    shoeVisibilityLine,
    lacesLine
  ]
    .filter(Boolean)
    .join(" ");
  const sceneControlLine = [
    shoeVisibilityLine,
    shoeClippingLine,
    lacesLine,
    isWornPeopleImage(input.imageType) ? onFootMaterialResponseLine : ""
  ]
    .filter(Boolean)
    .join(" ");

  return {
    productLine,
    accuracyLine,
    shoeSpecificAccuracyLine,
    visibilityLine: shoeVisibilityLine,
    clippingLine: shoeClippingLine,
    lacesLine,
    sceneControlLine
  };
}

function getSeasonAwareShoeStyleLine(context: ShoeProductContext, season: ProductSeason) {
  if (context.customShoe.trim()) {
    return "Use THERUIZ AURA's clean, low-saturation, refined daily styling system.";
  }

  if (context.shoe === "Cappuccino 卡布奇诺") {
    return season === "春" || season === "夏"
      ? "Warm coffee suede accent for cream, oatmeal, pale denim, and breathable refined styling; keep the look light, clean, and softly balanced."
      : "Warm coffee suede mood for knitwear, oatmeal, beige, and soft balanced seasonal layering.";
  }

  if (context.shoe === "Maple Grove 枫林") {
    return season === "春" || season === "夏"
      ? "Warm muted maple accent for cream, pale khaki, light denim, and soft neutral styling; keep it fresh, light, and balanced."
      : "Warm muted maple tone for soft knitwear, beige-brown layers, and gentle balanced seasonal styling.";
  }

  if (context.shoe === "Aire 微风" && (season === "秋" || season === "冬")) {
    return "Light refined mesh texture for mild-city, indoor, coastal, or gym-transition styling with clean breathable layers and a refined daily feel.";
  }

  if (context.shoe === "Delphinium Blue 飞燕草蓝" && (season === "秋" || season === "冬")) {
    return "Low-saturation airy blue as a quiet cool accent with cream, oatmeal, warm grey, and light layered styling.";
  }

  if (context.shoe === "Lemon 柠檬" && (season === "秋" || season === "冬")) {
    return "Soft butter-yellow accent with cream, warm grey, oatmeal, and quiet light layering in a mature low-saturation palette.";
  }

  return shoeStyleLines[context.shoe];
}

export function getShoeStylingBoundaryLine(context: ShoeProductContext, input: ProductAdapterInput) {
  if (!input.productPresent || input.imageType === "非产品氛围图" || input.userSpecifiedStyling) return "";
  if (input.sceneKey === "gymInterior") {
    return "Style the selected THERUIZ AURA sneaker only with refined fitness-related clothing, keeping the look active, clean, and gym-appropriate.";
  }
  if (input.scenePreference === "海边度假") {
    if (context.shoe === "Cappuccino 卡布奇诺") {
      return "Use the warm coffee suede as a quiet accent with cream, soft stone, pale khaki, and breathable woven layers for a light refined coastal look.";
    }
    if (context.shoe === "Maple Grove 枫林") {
      return "Use the muted maple tone as a warm accent with cream, pale khaki, soft beige, and breathable woven layers for a light refined coastal look.";
    }
  }
  return getSeasonAwareShoeStyleLine(context, input.season);
}

export function getShoeStudioCompositionLine(input: ProductAdapterInput) {
  if (input.scenePreference !== "棚内上新拍摄" || !input.productPresent || !isWornPeopleImage(input.imageType)) {
    return "";
  }

  if (typeof input.studioLaunchShotIndex === "number") {
    const line = studioLaunchSeriesShotLines[input.studioLaunchShotIndex];
    return input.seriesImageCount ? line.replace("of 8", `of ${input.seriesImageCount}`) : line;
  }

  const lines = input.imageType === "对镜穿搭图" ? studioLaunchMirrorAngleLines : studioLaunchOnFootAngleLines;
  const selectedIndex =
    input.studioLaunchAnglePreference === "全身棚拍角度"
      ? 0
      : input.studioLaunchAnglePreference === "下半身1/3角度"
        ? 1
        : input.studioLaunchAnglePreference === "鞋子上脚特写角度"
          ? 2
          : input.studioLaunchAnglePreference === "3/4侧前方上脚角度"
            ? 3
            : null;

  if (selectedIndex !== null) return lines[selectedIndex];
  return lines[Math.max(0, input.generationNonce) % lines.length];
}

export function getShoeNegativePhrases(input: ProductAdapterInput) {
  if (!input.productPresent || input.imageType === "非产品氛围图") return [];
  if (input.imageType === "产品静物图" || input.imageType === "拍摄花絮 / 材质图") {
    return [
      "sneaker deformation",
      "chunky or running-shoe sole",
      "cropped shoes",
      "hidden shoe structure",
      "melted laces",
      "unreadable footwear",
      "props covering shoes",
      "floating objects",
      "unreal product scale",
      "CGI product render feeling",
      "glossy artificial material"
    ];
  }
  return [
    "sneaker deformation",
    "chunky or running-shoe sole",
    "shoe clipping",
    "cropped shoes",
    "melted laces",
    "unreadable footwear"
  ];
}

export function getShoeImageTypeLine(input: ProductAdapterInput) {
  if (input.imageType === "产品上脚图") {
    return "Generate a refined on-foot lifestyle image with a safe standing pose or small natural walking step. The sneakers must be complete, clear, structurally accurate, and separate from trouser hems.";
  }
  if (input.imageType === "对镜穿搭图") {
    return "Generate a refined mirror outfit image with the face hidden by the phone or naturally cropped. Use a 3/4 or full-body mirror composition with clear sneakers, natural proportions, believable phone-hand structure, and clear trouser-shoe relationship.";
  }
  if (input.sceneKey === "gymInterior" || input.sceneKey === "gymCommute") {
    return "Generate a refined premium-gym active-lifestyle image for THERUIZ AURA, focused on light movement, polished daily transition, and comfort rather than a sportswear campaign.";
  }
  if (input.imageType === "生活场景图") {
    return "Generate a believable lifestyle image of a refined urban woman wearing THERUIZ AURA sneakers in real daily movement.";
  }
  if (input.imageType === "产品静物图") {
    return "Generate premium still-life product photography with the selected THERUIZ AURA sneaker as the main subject; keep material, laces, tongue, outsole, and product scale clearly readable.";
  }
  if (input.imageType === "拍摄花絮 / 材质图") {
    return "Generate a refined material-detail or behind-the-scenes image with tactile product truth, accurate construction, quiet working context, and no factory-report feeling.";
  }
  return "Generate a non-product atmospheric THERUIZ AURA image. The product does not need to be the main subject; express quiet order, warm restraint, daily elegance, calm negative space, and refined lifestyle atmosphere.";
}

export function getShoeActionSafetyLines(input: ProductAdapterInput) {
  if (!input.productPresent) return [];
  return [
    "Foot placement must stay stable and readable: keep clear ground contact, realistic toe direction, correct left-right shoe relationship, natural ankle-to-shoe alignment, and no overlapping legs hiding the sneaker shape. Props must not cover the shoes, foot placement, laces, tongue, toe box, heel, or outsole.",
    "Keep body scale, leg length, hand size, foot scale, and shoe-to-leg relationship realistic."
  ];
}
