import type { TeamActionComplexityLevel, TeamGazeMode, TeamImageType, TeamPoseType, TeamScenePreference } from "../types";

export type ActionPoseInput = {
  imageType: TeamImageType;
  scenePreference: Exclude<TeamScenePreference, "自动匹配">;
  selectedGazeMode: TeamGazeMode;
  selectedOutfitLine: string;
  timeOfDay: string;
  userExtraRequirement: string;
  generationNonce?: number;
};

export type ActionPoseOutput = {
  line: string;
  poseType: TeamPoseType;
  complexityLevel: TeamActionComplexityLevel;
  supportLine: string;
  safetyLine: string;
  negative: string;
};

export const naturalPoseAndActionCompact =
  "Use a natural, believable daily-life pose with subtle movement. The model should look like she is doing something real within the selected scene, such as walking slowly, checking her outfit, adjusting clothing or the selected accessory, preparing to leave, or pausing between activities.";

export const poseSafetyBoundaryCompact =
  "Keep the action simple and anatomically safe. Avoid crossed legs that hide the shoes or distort anatomy, extreme twisting, jumping, running, squatting, high kicks, dramatic stretching, deep bending, or poses that hide the sneakers, deform the feet, merge trousers into shoes, or break hands and limbs.";

export const handActionCompact =
  "Hands should have one simple, purposeful action appropriate to the selected scene, using only the selected scene-compatible object when needed, or adjusting a sleeve or bag strap. Keep fingers natural and relaxed.";

export const actionOutfitRealismCompact =
  "The outfit should respond naturally to the action: soft fabric folds, bag weight, sleeve movement, trouser break, and shirt drape should look believable, not frozen or plastic-smooth.";

export const gazeActionConsistencyCompact =
  "Make the gaze match the action. If she looks at the camera, keep the action simple and relaxed; if she is doing a task, let her eyes naturally focus on the object or movement.";

export const actionShoeSafetyCompact =
  "The chosen action must not compromise sneaker accuracy. Keep both shoes structurally readable whenever possible, with grounded feet, clean ankle-shoe transitions, and no fabric merging into the shoe.";

export const shoelaceActionSafetyCompact =
  "If tying shoelaces, use a safe seated or low-bend pose with the shoe fully visible, hands clearly separated from the laces, and no finger-lace merging. Avoid hands covering the shoe, laces melting into fingers, distorted ankles, extreme bending, or cropped footwear.";

export const multiImageActionVariationCompact =
  "Across a multi-image set, keep the same model and styling, but vary the pose naturally: one image may show standing, one walking, one seated or adjusting a bag. The actions should feel like moments from the same shoot, not different campaigns.";

export const actionPoseNegative =
  "Avoid stiff symmetrical posing, runway posing, influencer gestures, awkward frozen limbs, over-directed commercial model actions, claw hands, extra fingers, hands fused with bag or phone, hands touching shoes, hands covering the product, long stride, running posture, floating feet, twisted legs, over-stretched calves, crossed-leg distortion, broken knees, hidden feet, and meaningless hand placement.";

const standingPosePool = [
  "Stand with a soft weight shift, one foot slightly forward, one hand using the selected scene-compatible object if needed, and the other hand relaxed near the body.",
  "Stand naturally while adjusting a shirt cuff or jacket edge, with both sneakers clearly visible and grounded.",
  "Pause beside the selected doorway or setting with relaxed shoulders, a calm daily expression, and no unrelated handheld prop.",
  "Stand in a quiet city corner with one knee slightly relaxed, the bag resting naturally against the body, and the shoes fully readable.",
  "Stand near a mirror, wall, or entrance while lightly checking the outfit, not posing stiffly."
];

const walkingPosePool = [
  "Use a small natural walking step with one foot slightly ahead, keeping both sneakers visible and anatomically aligned.",
  "Walk slowly with relaxed arms or the single selected scene-compatible object, natural stride length, and grounded shoe-floor contact.",
  "Walk out of a cafe, hotel, boutique, or gym entrance with a calm daily rhythm, not a performance pose.",
  "Take a subtle step forward while looking slightly to the side or toward the scene, keeping the trouser hem separate from the shoe collar.",
  "Move through the scene naturally with a short stride, relaxed shoulders, and clear sneaker visibility."
];

const seatedPosePool = [
  "Sit naturally on a bench or chair with relaxed knees, one foot slightly forward, and at least one sneaker fully visible.",
  "Sit with hands relaxed or using the single selected scene-compatible object, keeping the legs and shoes anatomically natural and readable.",
  "Sit on seating that belongs to the selected location, with any scene-compatible accessory placed safely beside her and posture relaxed but composed.",
  "Sit with one leg slightly extended and the other naturally bent, avoiding crossed-leg distortion and keeping the shoes clear.",
  "Rest briefly after the selected daily activity, with hands relaxed or holding one scene-compatible object, natural body weight, and grounded feet."
];

const mirrorPosePool = [
  "Hold the phone naturally in one hand to hide or partially crop the face, with the other hand relaxed near the body or holding a bag.",
  "Stand with a soft weight shift in front of the mirror, one foot slightly forward, keeping at least one sneaker fully visible.",
  "Hold the phone at chest or face level naturally, avoiding long-leg selfie distortion and stiff influencer pose.",
  "Lightly adjust the bag strap or shirt hem with the free hand while keeping the outfit and sneakers readable.",
  "Keep the mirror pose casual and believable, like a real outfit check before leaving home."
];

const footPoseActionLines = [
  "Use a stable straight standing pose with both feet naturally forward, relaxed knees, realistic weight distribution, and both sneakers clearly visible from toe to heel.",
  "Use a natural split stance with feet about shoulder-width apart, toes gently forward or slightly outward, balanced body weight, and both sneakers clearly readable.",
  "Use a small step-standing pose with one foot slightly ahead, natural daily posture, no exaggerated stride, and at least one sneaker fully visible from toe to heel.",
  "Use a relaxed asymmetric stance with weight gently shifted to one side, one foot slightly turned outward, clear shoe separation, and no trouser hem covering the sneaker structure.",
  "Use a subtle cross stance with one foot lightly crossing in front only when both sneakers remain readable and the legs do not overlap unnaturally.",
  "Use a calm storefront or entryway pause with both feet planted naturally, readable laces and tongue, realistic ankle-to-shoe alignment, and no fabric merging into the shoes.",
  "Use a refined daily outfit-record stance with feet placed naturally on the ground, clear pavement contact, realistic proportions, and both shoes visible."
];

const walkingFootPoseLines = [
  "Keep the walking step short and stable, with one foot only slightly ahead, realistic toe direction, clear shoe separation, and both sneakers readable.",
  "Use a pause-between-steps stance with grounded feet, natural weight transfer, no exaggerated stride, and at least one sneaker fully visible from toe to heel."
];

const mirrorFootPoseLines = [
  "Use a straight mirror stance with both feet naturally forward, realistic weight distribution, and both sneakers fully readable.",
  "Use a relaxed split mirror stance with feet naturally apart, toes gently forward, clear shoe separation, and no mirror leg stretching.",
  "Use a subtle staggered mirror stance with one foot slightly ahead, stable floor contact, natural proportions, and both sneakers visible."
];

const sceneActionLines: Partial<Record<Exclude<TeamScenePreference, "自动匹配">, string>> = {
  商务区转角: "Use a slow natural walk or a calm corner pause with relaxed shoulders and clear sneakers.",
  写字楼门口: "Use a small standing pause or one short step forward near the office entrance.",
  停车后步行去办公室: "Use a small natural walking step toward the office, with one tote kept away from the feet.",
  回家进门: "Use a relaxed entryway pause or one small step indoors while holding one simple daily item.",
  "地铁 / 商场通道": "Use a calm natural walk or brief standing pause in the passage, with stable foot placement.",
  "楼下便利店 / 咖啡外带": "Use a small takeaway pause with one coffee or tote kept above and away from the shoes.",
  咖啡店门口: "Use a calm storefront pause with one coffee or tote kept secondary and the sneakers unobstructed.",
  咖啡馆内: "Use a natural cafe-interior pause beside a chair or counter, or a relaxed seated moment with both feet grounded and the sneakers unobstructed.",
  朋友午餐: "Use a relaxed daytime lunch moment with a slight turn toward a friend, natural hands, both feet grounded, and companions, table edges, and chairs kept clear of the sneakers.",
  美术馆: "Use a slow gallery walk or quiet standing pause with relaxed hands, natural attention toward the artwork or camera, and clear grounded sneakers; never touch the artwork.",
  "书店 / 杂志店门口": "Use a small standing pause with one book, magazine, or tote kept away from the sneakers.",
  "花店 / 买花": "Use a slow walk or quiet flower-shop pause, holding one restrained flower bundle above the shoe line.",
  "社区市集 / 精品买菜": "Use a small walking step with one grocery paper bag kept beside the body and away from the shoes.",
  "城市街角 / 安静街区": "Use a natural standing pause or short walk with relaxed daily posture.",
  雨天街角: "Use a calm rainy-day pause or one small step, with an umbrella kept clear of the legs and sneakers.",
  酒店走廊: "Use a short corridor walk or quiet hotel pause with luggage kept away from the feet.",
  酒店房间: "Use a small standing pause near luggage or a window, keeping the floor area around both shoes clear.",
  "酒店门口 / 门厅": "Use an entry pause beside one travel item, with a stable stance and unobstructed sneakers.",
  "衣帽间 / 更衣角": "Use a natural outfit-record stance with relaxed shoulders and both shoes clearly shown.",
  窗边阅读角: "Use a relaxed standing pause near the window with one book kept above the shoe line.",
  "工作台 / 桌边整理": "Use a small pause beside the desk with one hand lightly arranging a simple object.",
  棚内上新拍摄: "Use a restrained launch-studio pose with a soft weight shift, stable feet, relaxed hands, and the sneakers clearly readable; avoid a rigid showroom-model stance.",
  入户镜前: "Use a believable mirror outfit-record stance with stable feet and both sneakers clearly reflected.",
  停车场到电梯口: "Use a short car-to-elevator walking step or calm waiting pause with stable shoe-floor contact.",
  暑假游乐园: "Use a slow walk or shaded-walkway pause, keeping park props secondary and both sneakers clear.",
  海边度假: "Use a slow Mediterranean promenade walk or a natural pause near a restrained seaside railing, with stable ground contact and no barefoot pose.",
  草原野餐: "Use a small walk or stand beside the picnic setup, never on it, with grass kept below the shoe structure.",
  酒店度假: "Use a short walk near luggage or a hotel-threshold pause with clear floor space around the shoes.",
  亲子自驾出行: "Use a car-side standing pose or small parking-area step with the car door and bags away from the sneakers.",
  暑假外出后回家: "Use a relaxed entryway pause or return-home step with both sneakers fully readable.",
  "瑜伽 / 普拉提工作室门口": "Use a calm studio-front pause with a refined movement-ready stance, not a performance pose.",
  公园慢走: "Use a small natural park-path step or calm pause, never a hiking or running pose.",
  社区步道: "Use a natural short walk or soft standing pose with grounded daily movement.",
  周末轻旅行出发: "Use a tidy travel-start pause beside one bag, keeping luggage away from the sneakers."
};

const gymActionPool = [
  "Use a calm gym-transition action such as holding a water bottle, adjusting a gym tote, pausing near equipment, or holding a light dumbbell naturally.",
  "Pause near a machine with a water bottle or gym tote, keeping the movement calm and the sneakers grounded.",
  "Stand beside equipment in a light training-break moment, with relaxed shoulders and no heavy workout strain.",
  "Walk toward the gym entrance with a clean gym tote or water bottle, using a short realistic stride."
];

function getNonce(input: ActionPoseInput, salt = 0) {
  return Math.abs((input.generationNonce ?? 0) + salt);
}

function pick<T>(items: T[], input: ActionPoseInput, salt = 0) {
  return items[getNonce(input, salt) % items.length] ?? items[0];
}

function chooseByNonce(input: ActionPoseInput, ratio: number, salt = 0) {
  return (getNonce(input, salt) % 100) < ratio * 100;
}

function hashText(text: string) {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function chooseFootPoseLine(input: ActionPoseInput, poseType: TeamPoseType) {
  const isPeopleImage =
    input.imageType === "产品上脚图" || input.imageType === "生活场景图" || input.imageType === "对镜穿搭图";
  if (!isPeopleImage || input.scenePreference === "健身房内") return "";
  if (poseType === "none" || poseType === "handsOnly" || poseType === "seated" || poseType === "active") return "";

  const pool = poseType === "mirror" ? mirrorFootPoseLines : poseType === "walking" ? walkingFootPoseLines : footPoseActionLines;
  const seed = [
    input.imageType,
    input.scenePreference,
    input.selectedOutfitLine,
    input.userExtraRequirement,
    input.generationNonce ?? 0
  ].join("|");
  return pool[hashText(seed) % pool.length] ?? pool[0];
}

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

function chooseComplexity(input: ActionPoseInput): TeamActionComplexityLevel {
  if (input.imageType === "产品静物图") return "noAction";
  if (input.imageType === "产品上脚图" || input.imageType === "对镜穿搭图") return "safeSimple";
  if (input.scenePreference === "健身房内") return "activeLight";
  if (input.scenePreference === "去运动的路上") return chooseByNonce(input, 0.5, 11) ? "moderateDaily" : "activeLight";
  if (input.imageType === "生活场景图") return "moderateDaily";
  return "noAction";
}

function inferRequestedPose(text: string): TeamPoseType | null {
  if (includesAny(text, ["系鞋带", "tying shoelaces"])) return "seated";
  if (includesAny(text, ["不要走路", "no walking"])) return "standing";
  if (includesAny(text, ["不要坐着", "no sitting"])) return "standing";
  if (includesAny(text, ["走路", "walking"])) return "walking";
  if (includesAny(text, ["坐着", "seated", "sitting"])) return "seated";
  if (includesAny(text, ["站着", "standing"])) return "standing";
  return null;
}

function chooseScenePose(input: ActionPoseInput): TeamPoseType {
  const requested = inferRequestedPose(input.userExtraRequirement.toLowerCase());
  if (requested) return requested;
  if (input.imageType === "对镜穿搭图") return "mirror";
  if (input.scenePreference === "健身房内") return chooseByNonce(input, 0.72, 23) ? "active" : "seated";
  if (input.scenePreference === "去运动的路上" || input.scenePreference === "周末城市散步") return "walking";
  if (
    [
      "停车后步行去办公室",
      "地铁 / 商场通道",
      "社区市集 / 精品买菜",
      "酒店走廊",
      "停车场到电梯口",
      "公园慢走",
      "社区步道"
    ].includes(input.scenePreference)
  ) {
    return "walking";
  }
  if (input.scenePreference === "旅行酒店" || input.scenePreference === "通勤上班") {
    return chooseByNonce(input, 0.55, 37) ? "walking" : "standing";
  }
  if (input.scenePreference === "窗边阅读") return "seated";
  if (input.scenePreference === "咖啡馆内" || input.scenePreference === "朋友午餐") {
    return chooseByNonce(input, 0.55, 43) ? "seated" : "standing";
  }
  if (input.scenePreference === "美术馆") return "walking";
  if (input.scenePreference === "精品超市 / 日常采购") return "walking";
  if (input.scenePreference === "材质工作台" || input.scenePreference === "拍摄花絮") return "handsOnly";
  return "standing";
}

function chooseSceneAction(input: ActionPoseInput, poseType: TeamPoseType) {
  const text = input.userExtraRequirement.toLowerCase();

  if (includesAny(text, ["系鞋带", "tying shoelaces"])) {
    return "Use a safe seated shoelace-adjusting moment with the sneaker fully visible, hands separated from the laces, and no extreme bending.";
  }
  if (input.imageType === "对镜穿搭图") {
    return "Hold the phone naturally to hide or crop the face, with a soft weight shift, one foot slightly forward, and the free hand relaxed or adjusting a bag strap.";
  }
  const sceneActionLine = sceneActionLines[input.scenePreference];
  if (sceneActionLine) return sceneActionLine;
  if (input.scenePreference === "通勤上班") {
    return "Use a small natural walking step or calm standing pose near an office entrance, holding a tote and keeping the sneakers clearly visible.";
  }
  if (input.scenePreference === "周末城市散步") {
    return "Use a slow natural city-walk step with relaxed arms, a tote or coffee in hand, and clear grounded sneakers.";
  }
  if (input.scenePreference === "旅行酒店") {
    return "Walk through a calm hotel corridor or stand near a hotel doorway with a tote or suitcase handle, keeping the sneakers clear.";
  }
  if (input.scenePreference === "精品超市 / 日常采购") {
    return "Carry a tote or small grocery bag naturally while moving through a refined daily errand scene.";
  }
  if (input.scenePreference === "健身房内") {
    return pick(gymActionPool, input, 5);
  }
  if (input.scenePreference === "去运动的路上") {
    return "Walk naturally toward a gym or movement space, carrying a clean gym tote or water bottle, with a short realistic stride.";
  }
  if (input.scenePreference === "窗边阅读") {
    return "Hold or browse a book or magazine with a quiet task-focused seated posture, keeping the outfit and shoes readable if shoes appear.";
  }
  if (input.scenePreference === "材质工作台" || input.scenePreference === "拍摄花絮") {
    return "Use a simple hand-focused action such as arranging swatches, holding a color card, checking product notes, or adjusting material samples.";
  }

  if (poseType === "walking") return pick(walkingPosePool, input, 7);
  if (poseType === "seated") return pick(seatedPosePool, input, 13);
  if (poseType === "mirror") return pick(mirrorPosePool, input, 17);
  if (poseType === "active") return pick(gymActionPool, input, 19);
  return pick(standingPosePool, input, 29);
}

export function chooseActionLine(input: ActionPoseInput): ActionPoseOutput {
  const complexityLevel = chooseComplexity(input);
  const poseType = complexityLevel === "noAction" ? "none" : chooseScenePose(input);
  const text = input.userExtraRequirement.toLowerCase();
  const shoelaceRequested = includesAny(text, ["系鞋带", "tying shoelaces"]);
  const supportLine =
    poseType === "none" || poseType === "handsOnly"
      ? handActionCompact
      : `${naturalPoseAndActionCompact} ${poseSafetyBoundaryCompact} ${handActionCompact} ${gazeActionConsistencyCompact} ${actionOutfitRealismCompact}`;
  const safetyLine = shoelaceRequested ? shoelaceActionSafetyCompact : "";
  const sceneActionLine = poseType === "none" ? "" : chooseSceneAction(input, poseType);
  const footPoseLine = chooseFootPoseLine(input, poseType);

  return {
    line: [sceneActionLine, footPoseLine].filter(Boolean).join(" "),
    poseType,
    complexityLevel,
    supportLine,
    safetyLine,
    negative: poseType === "none" ? "" : actionPoseNegative
  };
}
