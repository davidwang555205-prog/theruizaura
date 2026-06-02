import type { TeamActionComplexityLevel, TeamGazeMode, TeamImageType, TeamPoseType, TeamScenePreference } from "../types";

export type ActionPoseInput = {
  imageType: TeamImageType;
  scenePreference: Exclude<TeamScenePreference, "自动匹配">;
  selectedGazeMode: TeamGazeMode;
  selectedOutfitLine: string;
  timeOfDay: string;
  userExtraRequirement: string;
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
  "Use a natural, believable daily-life pose with subtle movement. The model should look like she is doing something real, such as walking slowly, adjusting a tote, holding coffee, checking her outfit, carrying flowers, browsing, preparing to leave, or pausing between activities.";

export const poseSafetyBoundaryCompact =
  "Keep the action simple and anatomically safe. Avoid crossed legs, extreme twisting, jumping, running, squatting, high kicks, dramatic stretching, deep bending, or poses that hide the sneakers, deform the feet, merge trousers into shoes, or break hands and limbs.";

export const handActionCompact =
  "Hands should have a simple, purposeful action such as holding a tote, coffee, book, flowers, phone, water bottle, or adjusting a sleeve or bag strap. Keep fingers natural and relaxed.";

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
  "Stand with a soft weight shift, one foot slightly forward, one hand holding a tote bag, and the other hand relaxed near the body.",
  "Stand naturally while adjusting a shirt cuff or jacket edge, with both sneakers clearly visible and grounded.",
  "Pause beside a doorway or storefront, holding a coffee or tote, with relaxed shoulders and a calm daily expression.",
  "Stand in a quiet city corner with one knee slightly relaxed, the bag resting naturally against the body, and the shoes fully readable.",
  "Stand near a mirror, wall, or entrance while lightly checking the outfit, not posing stiffly."
];

const walkingPosePool = [
  "Use a small natural walking step with one foot slightly ahead, keeping both sneakers visible and anatomically aligned.",
  "Walk slowly while carrying a tote bag, with relaxed arms, natural stride length, and grounded shoe-floor contact.",
  "Walk out of a cafe, hotel, boutique, or gym entrance with a calm daily rhythm, not a performance pose.",
  "Take a subtle step forward while looking slightly to the side or toward the scene, keeping the trouser hem separate from the shoe collar.",
  "Move through the scene naturally with a short stride, relaxed shoulders, and clear sneaker visibility."
];

const seatedPosePool = [
  "Sit naturally on a bench or chair with relaxed knees, one foot slightly forward, and at least one sneaker fully visible.",
  "Sit while holding a coffee, book, or phone, keeping the legs and shoes anatomically natural and readable.",
  "Sit near a cafe table or gym bench with a tote placed beside her, posture relaxed but composed.",
  "Sit with one leg slightly extended and the other naturally bent, avoiding crossed-leg distortion and keeping the shoes clear.",
  "Rest briefly after walking or light training, holding a water bottle or tote, with natural body weight and grounded feet."
];

const mirrorPosePool = [
  "Hold the phone naturally in one hand to hide or partially crop the face, with the other hand relaxed near the body or holding a bag.",
  "Stand with a soft weight shift in front of the mirror, one foot slightly forward, keeping at least one sneaker fully visible.",
  "Hold the phone at chest or face level naturally, avoiding long-leg selfie distortion and stiff influencer pose.",
  "Lightly adjust the bag strap or shirt hem with the free hand while keeping the outfit and sneakers readable.",
  "Keep the mirror pose casual and believable, like a real outfit check before leaving home."
];

const gymActionPool = [
  "Use a calm gym-transition action such as holding a water bottle, adjusting a gym tote, pausing near equipment, or holding a light dumbbell naturally.",
  "Pause near a machine with a water bottle or gym tote, keeping the movement calm and the sneakers grounded.",
  "Stand beside equipment in a light training-break moment, with relaxed shoulders and no heavy workout strain.",
  "Walk toward the gym entrance with a clean gym tote or water bottle, using a short realistic stride."
];

function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

function chooseComplexity(input: ActionPoseInput): TeamActionComplexityLevel {
  if (input.imageType === "产品静物图") return "noAction";
  if (input.imageType === "产品上脚图" || input.imageType === "对镜穿搭图") return "safeSimple";
  if (input.scenePreference === "健身房内") return "activeLight";
  if (input.scenePreference === "去运动的路上") return Math.random() < 0.5 ? "moderateDaily" : "activeLight";
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
  if (input.scenePreference === "健身房内") return Math.random() < 0.72 ? "active" : "seated";
  if (input.scenePreference === "去运动的路上" || input.scenePreference === "周末城市散步") return "walking";
  if (input.scenePreference === "旅行酒店" || input.scenePreference === "通勤上班") {
    return Math.random() < 0.55 ? "walking" : "standing";
  }
  if (input.scenePreference === "窗边阅读") return "seated";
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
    return pick(gymActionPool);
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

  if (poseType === "walking") return pick(walkingPosePool);
  if (poseType === "seated") return pick(seatedPosePool);
  if (poseType === "mirror") return pick(mirrorPosePool);
  if (poseType === "active") return pick(gymActionPool);
  return pick(standingPosePool);
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

  return {
    line: poseType === "none" ? "" : chooseSceneAction(input, poseType),
    poseType,
    complexityLevel,
    supportLine,
    safetyLine,
    negative: poseType === "none" ? "" : actionPoseNegative
  };
}
