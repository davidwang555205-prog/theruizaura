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
    positiveLine: "Observe from a physically farther standing-height camera position with a restrained 105-180mm full-frame-equivalent perspective, natural compression, plausible shallow depth of field, enough scene to read, and the card's assigned action phase with balanced framing; do not impose a generic mid-action hold. Keep both feet in nearly the same depth plane and at least one complete sneaker readable.",
    negativeLine: "Avoid runway posing, influencer stare, beauty-ad eye contact, extreme creamy blur, portrait-cutout halo, artificial motion blur, exaggerated compression, oversized foreground shoes, unequal shoe size, one shoe larger than the other, low-angle distortion, symmetrical shoe display, retouching, and sharpening."
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
