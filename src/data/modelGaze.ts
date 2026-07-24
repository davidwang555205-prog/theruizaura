import type { TeamGazeMode, TeamImageType, TeamScenePreference } from "../types";

type GazeInput = {
  imageType: TeamImageType;
  scenePreference: Exclude<TeamScenePreference, "自动匹配">;
  isMirror: boolean;
  isProductStillLife: boolean;
  isBehindTheScenes: boolean;
  userExtraRequirement: string;
  usesCreatorStyling: boolean;
  isMultiImageSet: boolean;
  bodyOrientation?: string;
  generationNonce?: number;
};

export type GazeOutput = {
  mode: TeamGazeMode;
  line: string;
  negative: string;
};

const gazeAngleDirectives: Record<string, string> = {
  front:
    "Eyes meet the camera directly with balanced focus, both pupils centered, a slight eyebrow response, and soft catchlights visible in both eyes.",
  threeQuarter:
    "Head turns gently toward the lens while the body stays in three-quarter view, so one eye appears slightly nearer than the other and the gaze feels like a brief warm acknowledgment rather than a stare.",
  side:
    "The face stays in near-profile while the eyes shift toward the camera across the shoulder, with focused but relaxed eye contact and natural asymmetry in the visible eye shape.",
  rearThreeQuarter:
    "A glancing look back over the shoulder toward the camera, with brief eye contact that reads like a natural caught moment rather than a held pose."
};

const naturalCameraGazeCompact =
  "Let her briefly notice the camera like a friend taking the photo, with specific eye focus, natural catchlights, relaxed eyelids and lips, and no posed commercial intensity.";

const taskFocusedGazeCompact =
  "Use purposeful task focus on the selected object, outfit, movement, or surroundings; a brief camera glance remains possible when it feels incidental rather than staged.";

const cameraExpressionBoundaryCompact =
  "When looking at the camera, use relaxed lips, a faint natural smile, calm confidence, or soft friendly focus. Avoid beauty-ad eye contact, forced smile, influencer stare, empty doll eyes, lifeless gaze, deadpan face, or commercial model intensity.";

const cameraPoseBoundaryCompact =
  "If she looks at the camera, keep the body relaxed and believable, with slight weight shift and a natural hand position using at most one object that clearly belongs to the selected scene.";

const gymCameraGazeBoundaryCompact =
  "In gym scenes, camera gaze should feel calm, composed, and lightly engaged during a training pause or movement transition. Avoid gym-influencer eye contact, aggressive workout stare, or sportswear campaign intensity.";

const creatorCameraGazeCompact =
  "The image may have a naturally shareable outfit-record feeling, and direct camera gaze is allowed when appropriate, but it must feel like a calm real-life photo taken by a friend, not an influencer performance.";

const gazeIdentityConsistencyCompact =
  "Even if gaze direction changes between images, keep the same selected woman, face, hairstyle, makeup, age appearance, body proportions, and personal identity.";

const humanPurposefulGazeCompact =
  "Her gaze should feel human and purposeful, either naturally toward the camera or focused on a real task, with relaxed facial muscles, clear eye focus, soft but alive eyes, and believable daily presence. Do not force everyone to look away.";

const lookAtCameraNegative =
  "Avoid hard staring, beauty-ad eye contact, influencer staring pose, commercial model intensity, empty doll eyes, lifeless gaze, deadpan face, stiff portrait mood, and any facial expression that feels performed rather than naturally captured.";

const noLookAtCameraNegative =
  "Avoid hard camera staring, stiff eye contact, posed portrait mood, lifeless gaze, and gaze that breaks the realism of the task or scene.";

const noFaceKeywords = [
  "不露脸",
  "背影",
  "手机遮脸",
  "phone covers face",
  "no face",
  "back view"
];

const noCameraKeywords = [
  "不要看镜头",
  "不看镜头"
];

const lookAtCameraKeywords = [
  "看镜头",
  "看向镜头",
  "正看镜头",
  "直视镜头",
  "look at camera",
  "looking at camera",
  "direct gaze",
  "eye contact"
];

const downwardKeywords = ["低头", "looking down"];

const sideGazeKeywords = ["看旁边", "看向旁边", "side gaze", "look away"];

const phoneTaskKeywords = ["看手机"];

const cameraFriendlyExtraKeywords = [
  "咖啡",
  "coffee",
  "cafe",
  "café",
  "逛街",
  "精品店",
  "城市街角",
  "朋友",
  "小聚",
  "打卡",
  "city corner",
  "boutique",
  "friend",
  "storefront"
];

const taskFocusedExtraKeywords = [
  "花店",
  "买花",
  "面包店",
  "甜品店",
  "书店",
  "杂志店",
  "画廊",
  "展览",
  "超市",
  "阅读",
  "bookstore",
  "magazine",
  "gallery",
  "flower",
  "bakery",
  "grocery",
  "reading"
];

const cameraFriendlyScenes = new Set<Exclude<TeamScenePreference, "自动匹配">>([
  "通勤上班",
  "周末城市散步",
  "旅行酒店",
  "健身房内",
  "去运动的路上",
  "咖啡馆内",
  "朋友午餐",
  "美术馆"
]);

const taskFocusedScenes = new Set<Exclude<TeamScenePreference, "自动匹配">>([
  "精品超市 / 日常采购",
  "窗边阅读",
  "材质工作台",
  "拍摄花絮",
  "周末轻采购"
]);

function containsAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

function pickWeighted<T>(items: Array<{ value: T; weight: number }>, nonce?: number) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  const safeNonce = typeof nonce === "number" ? Math.max(0, nonce) : null;
  let cursor = safeNonce === null ? Math.random() * total : (safeNonce * 37 + 17) % total;

  for (const item of items) {
    cursor -= item.weight;
    if (cursor <= 0) return item.value;
  }

  return items[items.length - 1].value;
}

function sceneAllowsCamera(input: GazeInput) {
  const text = input.userExtraRequirement.toLowerCase();
  if (input.scenePreference === "精品超市 / 日常采购") return false;
  if (containsAny(text, taskFocusedExtraKeywords)) return false;
  return cameraFriendlyScenes.has(input.scenePreference) || containsAny(text, cameraFriendlyExtraKeywords);
}

function chooseNonCameraMode(input: GazeInput): TeamGazeMode {
  if (input.isMirror) return "phoneHiddenFace";
  if (input.isProductStillLife) return "noFaceNeeded";
  if (input.isBehindTheScenes || taskFocusedScenes.has(input.scenePreference)) return "taskFocusedGaze";
  if (input.imageType === "产品上脚图") {
    return pickWeighted([
      { value: "softOffCamera", weight: 55 },
      { value: "downwardGaze", weight: 45 }
    ], input.generationNonce);
  }
  return "softOffCamera";
}

function chooseExplicitMode(input: GazeInput): TeamGazeMode | null {
  const text = input.userExtraRequirement.toLowerCase();

  if (containsAny(text, noFaceKeywords)) {
    return input.isMirror ? "phoneHiddenFace" : "noFaceNeeded";
  }

  if (containsAny(text, noCameraKeywords)) {
    return chooseNonCameraMode(input);
  }

  if (containsAny(text, phoneTaskKeywords)) {
    return input.isMirror ? "phoneHiddenFace" : "taskFocusedGaze";
  }

  if (containsAny(text, downwardKeywords)) return "downwardGaze";
  if (containsAny(text, sideGazeKeywords)) return "softOffCamera";

  if (containsAny(text, lookAtCameraKeywords)) {
    return "lookAtCamera";
  }

  return null;
}

function chooseDefaultMode(input: GazeInput): TeamGazeMode {
  if (input.isProductStillLife) return "noFaceNeeded";
  if (input.isMirror) return "phoneHiddenFace";
  if (input.isBehindTheScenes) return "taskFocusedGaze";

  if (input.imageType === "非产品氛围图") {
    return (input.generationNonce ?? Math.random() * 2) % 2 < 1 ? "noFaceNeeded" : "taskFocusedGaze";
  }

  if (input.imageType === "拍摄花絮 / 材质图") {
    return "taskFocusedGaze";
  }

  if (taskFocusedScenes.has(input.scenePreference) && !sceneAllowsCamera(input)) {
    if (input.imageType === "产品上脚图" || input.imageType === "生活场景图") {
      return pickWeighted([
        { value: "taskFocusedGaze", weight: 62 },
        { value: "softOffCamera", weight: 23 },
        { value: "lookAtCamera", weight: 15 }
      ], input.generationNonce);
    }

    return "taskFocusedGaze";
  }

  if (input.imageType === "产品上脚图") {
    return pickWeighted([
      { value: "lookAtCamera", weight: sceneAllowsCamera(input) ? 36 : 22 },
      { value: "softOffCamera", weight: sceneAllowsCamera(input) ? 42 : 48 },
      { value: "downwardGaze", weight: sceneAllowsCamera(input) ? 22 : 30 }
    ], input.generationNonce);
  }

  if (input.imageType === "生活场景图") {
    return pickWeighted([
      { value: "lookAtCamera", weight: sceneAllowsCamera(input) ? (input.scenePreference === "健身房内" ? 34 : 32) : 20 },
      { value: "softOffCamera", weight: sceneAllowsCamera(input) ? 38 : 25 },
      { value: "taskFocusedGaze", weight: sceneAllowsCamera(input) ? 30 : 55 }
    ], input.generationNonce);
  }

  return "softOffCamera";
}

function buildGazeLine(mode: TeamGazeMode, input: GazeInput) {
  const identityLine = input.isMultiImageSet ? ` ${gazeIdentityConsistencyCompact}` : "";

  if (mode === "lookAtCamera") {
    const cameraLine = input.scenePreference === "健身房内" ? gymCameraGazeBoundaryCompact : naturalCameraGazeCompact;
    const angleDirective = input.bodyOrientation && gazeAngleDirectives[input.bodyOrientation]
      ? ` ${gazeAngleDirectives[input.bodyOrientation]}`
      : "";
    return `${cameraLine}${angleDirective}${identityLine}`;
  }

  if (mode === "softOffCamera") {
    return `Let her eyes settle on a specific nearby point, with relaxed focus; do not force avoidance of the camera.${identityLine}`;
  }

  if (mode === "downwardGaze") {
    return `Use a purposeful downward glance toward the shoes, garment edge, hand movement, or floor path, without a frozen bowed-head pose.${identityLine}`;
  }

  if (mode === "taskFocusedGaze") {
    return `${taskFocusedGazeCompact}${identityLine}`;
  }

  if (mode === "phoneHiddenFace") {
    return `The face should be hidden by the phone or naturally cropped; do not require direct eye contact. Keep the outfit, body posture, and shoe relationship more important than the face.${identityLine}`;
  }

  return `No clear face is needed. If a person appears, use hands, back view, partial figure, or a subtle secondary presence rather than a face-centered portrait.${identityLine}`;
}

export function chooseGazeLine(input: GazeInput): GazeOutput {
  const mode = chooseExplicitMode(input) ?? chooseDefaultMode(input);

  if (input.isProductStillLife) {
    return {
      mode: "noFaceNeeded",
      line: "",
      negative: ""
    };
  }

  return {
    mode,
    line: buildGazeLine(mode, input),
    negative: mode === "lookAtCamera" ? lookAtCameraNegative : noLookAtCameraNegative
  };
}
