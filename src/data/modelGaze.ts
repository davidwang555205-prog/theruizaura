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
};

export type GazeOutput = {
  mode: TeamGazeMode;
  line: string;
  negative: string;
};

const naturalCameraGazeCompact =
  "Let the model look naturally toward the camera with a calm, relaxed, lightly engaged expression, as if being photographed by a friend during a real daily moment. The gaze should feel warm and believable, not forced, seductive, commercial, or influencer-like.";

const taskFocusedGazeCompact =
  "Use a natural task-focused gaze: she should look at what she is doing, such as holding a bag, browsing a book, choosing flowers, checking a tote, adjusting clothing, or walking through the scene. Avoid forced direct camera eye contact.";

const cameraExpressionBoundaryCompact =
  "When looking at the camera, use relaxed lips, a faint natural smile, calm confidence, or soft friendly focus. Avoid beauty-ad eye contact, seductive gaze, forced smile, influencer stare, blank AI eyes, or commercial model intensity.";

const cameraPoseBoundaryCompact =
  "If she looks at the camera, keep the body relaxed and believable, with slight weight shift and a natural hand position holding a tote, coffee, water bottle, book, flowers, gym bag, or jacket edge.";

const gymCameraGazeBoundaryCompact =
  "In gym scenes, direct camera gaze should feel calm, composed, and lightly engaged during a training pause or movement transition. Avoid gym-influencer eye contact, seductive fitness posing, aggressive workout stare, or sportswear campaign intensity.";

const creatorCameraGazeCompact =
  "The image may have a naturally shareable outfit-record feeling, and direct camera gaze is allowed when appropriate, but it must feel like a calm real-life photo taken by a friend, not an influencer performance.";

const gazeIdentityConsistencyCompact =
  "Even if gaze direction changes between images, keep the same Asian woman, same face, same hairstyle, same makeup, same age appearance, same body proportion, and same personal identity.";

const humanPurposefulGazeCompact =
  "Her gaze should feel human and purposeful, either naturally toward the camera or focused on a real task, with relaxed facial muscles, soft eyes, and believable daily presence.";

const lookAtCameraNegative =
  "Avoid forced direct stare, beauty-ad eye contact, seductive gaze, influencer staring pose, commercial model intensity, blank AI eyes, stiff portrait mood, and any facial expression that feels performed rather than naturally captured.";

const noLookAtCameraNegative =
  "Avoid unnatural camera staring, forced eye contact, posed portrait mood, and gaze that breaks the realism of the task or scene.";

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
  "不看镜头",
  "no eye contact",
  "do not look at camera"
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
  "去运动的路上"
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

function pickWeighted<T>(items: Array<{ value: T; weight: number }>) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let cursor = Math.random() * total;

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
    ]);
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
    return Math.random() < 0.5 ? "noFaceNeeded" : "taskFocusedGaze";
  }

  if (input.imageType === "拍摄花絮 / 材质图") {
    return "taskFocusedGaze";
  }

  if (taskFocusedScenes.has(input.scenePreference) && !sceneAllowsCamera(input)) {
    return "taskFocusedGaze";
  }

  if (input.imageType === "产品上脚图") {
    return pickWeighted([
      { value: sceneAllowsCamera(input) ? "lookAtCamera" : "softOffCamera", weight: 40 },
      { value: "softOffCamera", weight: 40 },
      { value: "downwardGaze", weight: 20 }
    ]);
  }

  if (input.imageType === "生活场景图") {
    if (sceneAllowsCamera(input)) {
      return pickWeighted([
        { value: "lookAtCamera", weight: input.scenePreference === "健身房内" ? 48 : 42 },
        { value: "softOffCamera", weight: 36 },
        { value: "taskFocusedGaze", weight: 22 }
      ]);
    }

    return "taskFocusedGaze";
  }

  return "softOffCamera";
}

function buildGazeLine(mode: TeamGazeMode, input: GazeInput) {
  const identityLine = input.isMultiImageSet ? ` ${gazeIdentityConsistencyCompact}` : "";

  if (mode === "lookAtCamera") {
    const cameraLine =
      input.scenePreference === "健身房内"
        ? `${gymCameraGazeBoundaryCompact} ${cameraExpressionBoundaryCompact} ${cameraPoseBoundaryCompact}`
        : `${naturalCameraGazeCompact} ${cameraExpressionBoundaryCompact} ${cameraPoseBoundaryCompact}`;
    const creatorLine = input.usesCreatorStyling ? ` ${creatorCameraGazeCompact}` : "";
    return `${cameraLine} ${humanPurposefulGazeCompact}${creatorLine}${identityLine}`;
  }

  if (mode === "softOffCamera") {
    return `Use a soft off-camera gaze, looking slightly beside the camera or into the surrounding scene with calm, relaxed presence rather than direct performance. ${humanPurposefulGazeCompact}${identityLine}`;
  }

  if (mode === "downwardGaze") {
    return `Use a natural downward gaze toward the shoes, trouser hem, bag, hand movement, or floor path, keeping the mood quiet and unforced. ${humanPurposefulGazeCompact}${identityLine}`;
  }

  if (mode === "taskFocusedGaze") {
    return `${taskFocusedGazeCompact} ${humanPurposefulGazeCompact}${identityLine}`;
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
