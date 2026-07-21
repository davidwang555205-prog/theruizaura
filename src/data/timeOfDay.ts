import type { TeamImageType, TeamScenePreference, TeamShoe } from "../types";

export type TimeOfDay = "morning" | "noon" | "evening";

export type SceneLocationType = "indoor" | "outdoor" | "semiIndoor";

type TimeOfDayInput = {
  imageType: TeamImageType;
  scenePreference: TeamScenePreference;
  shoe: TeamShoe;
  userExtraRequirement?: string;
};

const morningKeywords = ["清晨感", "morning light", "morning"];
const noonKeywords = ["中午阳光", "noon light", "midday", "noon"];
const eveningKeywords = ["傍晚感", "evening light", "late afternoon", "evening"];

const morningScenes: TeamScenePreference[] = [
  "通勤上班",
  "玄关出门",
  "居家衣帽间",
  "窗边阅读",
  "旅行酒店",
  "健身房内"
];

const noonScenes: TeamScenePreference[] = [
  "精品超市 / 日常采购",
  "周末城市散步",
  "材质工作台",
  "拍摄花絮",
  "周末轻采购",
  "咖啡馆内",
  "酒店咖啡厅内",
  "朋友午餐",
  "美术馆"
];

const indoorScenes: TeamScenePreference[] = [
  "居家衣帽间",
  "旅行酒店",
  "窗边阅读",
  "材质工作台",
  "拍摄花絮",
  "健身房内",
  "咖啡馆内",
  "酒店咖啡厅内",
  "朋友午餐",
  "美术馆"
];

const outdoorScenes: TeamScenePreference[] = ["通勤上班", "周末城市散步", "去运动的路上"];

const semiIndoorScenes: TeamScenePreference[] = ["精品超市 / 日常采购", "周末轻采购", "玄关出门"];

export const indoorEyewearNegative =
  "Avoid sunglasses indoors, celebrity-like indoor eyewear styling, nightclub mood, fashion-show attitude, and any eyewear choice that feels unnatural for a quiet daily indoor scene.";

export const eveningLightNegative =
  "Avoid dark sunglasses in evening light, nightlife styling, dramatic sunset glamour, orange-heavy color cast, and overly cinematic mood.";

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

export function chooseTimeOfDay(input: TimeOfDayInput): TimeOfDay {
  const extra = (input.userExtraRequirement ?? "").toLowerCase();

  if (includesAny(extra, morningKeywords)) return "morning";
  if (includesAny(extra, noonKeywords)) return "noon";
  if (includesAny(extra, eveningKeywords)) return "evening";

  if (input.imageType === "产品静物图") {
    return input.scenePreference === "窗边阅读" || input.scenePreference === "旅行酒店" ? "morning" : "noon";
  }

  if (input.imageType === "拍摄花絮 / 材质图") {
    return input.scenePreference === "窗边阅读" || input.scenePreference === "材质工作台" ? "morning" : "noon";
  }

  if (input.imageType === "对镜穿搭图") {
    return input.scenePreference === "旅行酒店" ? "morning" : "morning";
  }

  if (input.imageType === "非产品氛围图") {
    if (
      input.scenePreference === "咖啡馆内" ||
      input.scenePreference === "酒店咖啡厅内" ||
      input.scenePreference === "朋友午餐" ||
      input.scenePreference === "美术馆"
    ) {
      return "noon";
    }
    if (input.scenePreference === "旅行酒店" || input.scenePreference === "周末城市散步") return "evening";
    if (input.scenePreference === "周末轻采购" || input.scenePreference === "精品超市 / 日常采购") return "noon";
    return "morning";
  }

  if (input.scenePreference === "健身房内") return input.imageType === "生活场景图" ? "noon" : "morning";
  if (input.scenePreference === "去运动的路上") return input.imageType === "生活场景图" ? "evening" : "morning";
  if (input.imageType === "生活场景图" && input.scenePreference === "旅行酒店") return "morning";
  if (morningScenes.includes(input.scenePreference)) return "morning";
  if (noonScenes.includes(input.scenePreference)) return "noon";

  return "noon";
}

export function chooseSceneLocationType(input: Pick<TimeOfDayInput, "imageType" | "scenePreference">): SceneLocationType {
  if (input.imageType === "产品静物图") return "indoor";
  if (input.imageType === "对镜穿搭图") return "indoor";
  if (input.imageType === "拍摄花絮 / 材质图") return "indoor";

  if (indoorScenes.includes(input.scenePreference)) return "indoor";
  if (outdoorScenes.includes(input.scenePreference)) return "outdoor";
  if (semiIndoorScenes.includes(input.scenePreference)) return "semiIndoor";

  return "semiIndoor";
}

function getBaseTimeLine(timeOfDay: TimeOfDay) {
  if (timeOfDay === "morning") {
    return "Use soft morning natural light with a fresh, clean, calm feeling. The light should be gentle, slightly warm, breathable, and not harsh.";
  }

  if (timeOfDay === "evening") {
    return "Use soft late-afternoon or early-evening light with warm neutral tones, gentle shadows, and a calm daily closing mood. The image should feel relaxed and refined, not dark, orange, nightlife-like, or dramatic.";
  }

  return "Use clean midday daylight with clear material readability, soft neutral brightness, and low-contrast natural shadows. The image should feel practical, fresh, and real, not overexposed or harsh.";
}

function getImageTypeTimeLine(imageType: TeamImageType) {
  if (imageType === "产品上脚图") {
    return "The time of day should support the on-foot styling and keep the sneakers clearly readable.";
  }

  if (imageType === "对镜穿搭图") {
    return "The mirror lighting must keep the outfit and sneakers clear, with no harsh glare or dark mirror distortion.";
  }

  if (imageType === "生活场景图") {
    return "The time of day should make the daily scene feel believable and emotionally specific without becoming cinematic or staged.";
  }

  if (imageType === "非产品氛围图") {
    return "The time of day should enrich the atmosphere while keeping the image quiet, restrained, and brand-aligned.";
  }

  if (imageType === "拍摄花絮 / 材质图") {
    return "Keep material texture and color clear even if the time of day is warm or atmospheric.";
  }

  return "Still life lighting must preserve true color, texture, stitching, panel structure, and product shape.";
}

export function getTimeOfDayLine(imageType: TeamImageType, timeOfDay: TimeOfDay) {
  return `${getBaseTimeLine(timeOfDay)} ${getImageTypeTimeLine(imageType)}`;
}
