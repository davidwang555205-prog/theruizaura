import type { TeamImageType, TeamScenePreference } from "../types";

type ActivePromptTemplateName =
  | "gymInterior_onFoot"
  | "gymInterior_mirror"
  | "gymCommute_onFoot"
  | "gymCommute_lifestyle"
  | "gymInterior_lifestyle"
  | "gymCommute_mirror";

export const activePromptTemplates: Record<ActivePromptTemplateName, string> = {
  gymInterior_onFoot:
    "Create a premium THERUIZ AURA image in the brand’s “Quiet Warm Luxury” style: cream-white, warm beige, soft stone, natural daylight, low saturation, relaxed elegance, tactile authenticity, and believable daily sophistication. Generate a refined on-foot active-lifestyle image set inside a clean modern gym or movement studio. The scene should feel suitable for light workouts, stretching, or pre/post-training moments rather than intense exercise. Keep the sneakers clearly visible and structurally accurate. The environment should be clean, calm, low-noise, and not crowded with equipment. The outfit should feel sporty enough for movement but polished enough for daily wear. Avoid professional sportswear, loud gym branding, intense training mood, sweaty fitness content, and influencer gym posing.",
  gymInterior_mirror:
    "Create a premium THERUIZ AURA image in the brand’s “Quiet Warm Luxury” style. Generate a refined mirror outfit image inside a clean gym or movement-studio setting. The face should be hidden by the phone or naturally cropped. Keep the mirror lighting bright, soft, and believable. Show a polished active-lifestyle outfit that feels suitable for light training, stretching, or a calm gym-going routine. The sneakers must remain clearly visible and structurally accurate. The scene should feel clean, modern, and lightly sporty without turning into influencer gym content. Avoid dark mirrors, harsh flash, loud sportswear, exposed activewear focus, or body-showing fitness posing.",
  gymCommute_onFoot:
    "Create a premium THERUIZ AURA image in the brand’s “Quiet Warm Luxury” style. Generate a refined on-foot active-lifestyle image showing a woman on the way to a workout or gym session. The scene may be a city sidewalk, gym entrance, parking-to-gym walkway, hotel gym route, or a calm urban movement setting. The outfit should feel like a bridge between daily wear and light exercise: clean, sporty enough for movement, but still polished and tasteful. The sneakers must be clearly visible and structurally accurate. Avoid performance-sports energy, running posture, gym influencer styling, or turning the image into a sportswear campaign.",
  gymCommute_lifestyle:
    "Create a premium THERUIZ AURA lifestyle image showing a refined movement-oriented daily moment on the way to a workout. The woman should look clean, composed, comfortable, and quietly stylish, carrying a practical tote or gym bag, with a believable active-lifestyle outfit that still feels wearable in daily urban life. The scene should express that the sneakers can move easily between errands, commute, and light exercise moments. Avoid marathon mood, technical activewear, loud sports styling, or exaggerated gym content.",
  gymInterior_lifestyle:
    "Create a premium THERUIZ AURA lifestyle image inside a clean, modern gym or movement space. Show a real daily movement moment such as light stretching, post-workout pause, adjusting a tote, preparing to leave, or standing near a calm studio area. The outfit should be understated, sporty enough for movement, and refined enough for everyday wear. The sneakers must stay visible, proportionally correct, and naturally integrated into the active-lifestyle scene. Avoid intense action, sweaty realism, or gym-advertising aesthetics.",
  gymCommute_mirror:
    "Create a premium THERUIZ AURA mirror outfit image before or on the way to a light workout. The face should be hidden by the phone or naturally cropped, while the outfit and sneakers remain clear. The styling should bridge daily city wear and light activity, with a clean practical tote or understated gym bag. Avoid influencer fitness posing, dark gym mirrors, technical sportswear, or body-showing selfie energy."
};

export function getActivePromptTemplate(imageType: TeamImageType, scenePreference: TeamScenePreference) {
  if (scenePreference === "健身房内") {
    if (imageType === "产品上脚图") return activePromptTemplates.gymInterior_onFoot;
    if (imageType === "对镜穿搭图") return activePromptTemplates.gymInterior_mirror;
    if (imageType === "生活场景图") return activePromptTemplates.gymInterior_lifestyle;
  }

  if (scenePreference === "去运动的路上") {
    if (imageType === "产品上脚图") return activePromptTemplates.gymCommute_onFoot;
    if (imageType === "对镜穿搭图") return activePromptTemplates.gymCommute_mirror;
    if (imageType === "生活场景图") return activePromptTemplates.gymCommute_lifestyle;
  }

  return "";
}
