import type { TeamImageType, TeamScenePreference } from "../types";

export type LifestyleSoftContentCategory = "natural_life" | "urban_commute";
export type LifestyleSoftCaptureStyle = "standard" | "telephoto_candid";

export const lifestyleSoftContentCategoryLabels: Record<LifestyleSoftContentCategory, string> = {
  natural_life: "自然生活",
  urban_commute: "都市通勤"
};

export const lifestyleSoftCaptureStyleLabels: Record<LifestyleSoftCaptureStyle, string> = {
  standard: "标准记录",
  telephoto_candid: "长焦随拍"
};

export const lifestyleSoftCaptureStyleProfiles: Record<LifestyleSoftCaptureStyle, {
  id: LifestyleSoftCaptureStyle;
  labelZh: string;
  cameraProfileId?: "telephoto-candid";
  positiveLine: string;
  negativeLine: string;
}> = {
  standard: {
    id: "standard",
    labelZh: lifestyleSoftCaptureStyleLabels.standard,
    positiveLine: "Keep the established image-type camera perspective and a natural, unperformed daily-photo feeling.",
    negativeLine: "Avoid wide-angle shoe enlargement and staged campaign posing."
  },
  telephoto_candid: {
    id: "telephoto_candid",
    labelZh: lifestyleSoftCaptureStyleLabels.telephoto_candid,
    cameraProfileId: "telephoto-candid",
    positiveLine: "Observe from a physically farther standing-height camera position with a restrained 105-180mm full-frame-equivalent perspective, natural compression, plausible shallow depth of field, enough of the real scene to read, a directional or off-camera gaze, and a mid-action moment with slightly imperfect but balanced framing. Keep the product readable with at least one complete sneaker visible, without turning it into a deliberate shoe showcase.",
    negativeLine: "Avoid runway posing, influencer stare, beauty-ad eye contact, extreme creamy blur, portrait-cutout halo, artificial motion blur, exaggerated compression, oversized foreground shoes, low-angle distortion, symmetrical shoe display, retouching, and sharpening."
  }
};

export function isTelephotoCandidEligibleScene(
  scene: TeamScenePreference,
  supportedCaptureStyles?: LifestyleSoftCaptureStyle[]
) {
  return supportedCaptureStyles?.includes("telephoto_candid") ?? false;
}

export function isTelephotoCandidCompatibleImageType(imageType: TeamImageType) {
  return imageType === "生活场景图";
}
