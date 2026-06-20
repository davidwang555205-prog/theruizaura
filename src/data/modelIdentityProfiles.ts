import type { TeamImageType, TeamScenePreference } from "../types";
import type { ImageCountIntent } from "../utils/detectImageCountOrSeriesIntent";

export const modelIdentityProfile = {
  ethnicityRule: "Asian woman or Asian mixed-heritage woman only",
  ageRange:
    "30-45 for all standard people visuals; around age 30 for studio launch visuals with an Asian mixed-heritage model",
  faceType:
    "natural East Asian or subtle Asian mixed features, refined but believable, not generic Western fashion model",
  hair:
    "dark hair, black hair, dark brown hair, natural deep tea-brown hair, clean but slightly natural movement",
  makeup:
    "natural clean makeup, soft daily makeup, light mature makeup, no heavy contouring, no glamour makeup",
  skinTexture: "real skin texture, natural pores, soft realistic complexion, not plastic-smooth",
  bodyProportion:
    "natural Asian female body proportion, refined daily figure, not runway model, not exaggerated long legs, not AI-stretched body",
  expressionStyle:
    "relaxed, calm, softly focused, subtle micro-expression, not blank, not exaggerated smile",
  stylingConsistency:
    "same face, same age appearance, same hairstyle, same hair color, same makeup, same body proportion, same personal styling when generating more than 2 images",
  forbidden:
    "non-Asian model, Western-dominant face, blonde model, heavy Western makeup, exaggerated mixed-race look, influencer face stereotype, fashion-week supermodel, overly youthful look, plastic beauty face, AI mannequin face"
};

export const realLifeOutfitDiversityCompact =
  "The outfit should feel like something a real tasteful urban woman would actually wear, not an AI-generated beige template. Keep THERUIZ AURA's clean refined mood, but allow realistic wardrobe variety such as dark denim, navy, charcoal, olive, warm brown, black accents, grey coats, deeper bags, relaxed layers, and practical daily pieces balanced by cream, beige, grey, denim, or warm neutrals.";

export const colorDiversityBoundaryCompact =
  "Do not make every outfit pale beige or cream. Use at most one controlled dark or richer wardrobe anchor such as dark denim, charcoal trousers, navy knitwear, soft olive outerwear, chocolate brown, warm camel, grey coat, or a black bag, balanced by clean low-saturation neutrals.";

export const antiAIOutfitTextureCompact =
  "Add subtle real-life outfit details: natural fabric folds, slight trouser break, softly imperfect shirt tuck, sleeve movement, believable bag weight, layered fabric edges, knit texture, denim fading, and natural clothing drape.";

export const singleImageModelConsistencyCompact =
  "Use one believable Asian or subtle Asian mixed-heritage woman as the model, with natural dark hair, clean daily makeup, real skin texture, refined but approachable facial features, and realistic body proportions.";

export const twoImageConsistencyCompact =
  "For a two-image set, keep the same Asian woman, same face, same hairstyle, same makeup, same body proportion, same outfit, same bag, and same shoes unless the user explicitly asks for different looks.";

export const multiImageModelIdentityLockCompact =
  "Use the exact same Asian or subtle Asian mixed-heritage woman across all images. Keep the same face, age appearance, hairstyle, hair color, makeup, skin tone, body shape, height impression, outfit, bag, accessories, shoe styling, and overall identity; only pose, framing, movement, camera distance, and scene may change.";

export const faceStyleBoundaryCompact =
  "Her face should be naturally refined and recognizable as an Asian or subtle Asian mixed woman, with soft real features, natural skin texture, and quiet confidence; avoid Western casting, exaggerated mixed-race features, heavy contouring, plastic beauty, over-smoothed skin, doll-like face, influencer surgery look, or fashion-model severity.";

export const hairConsistencyCompact =
  "Use natural dark or deep brown hair with a simple believable style such as a slightly messy low bun, soft low ponytail, natural shoulder-length hair, clean hair tucked behind the ears, or relaxed tied-up hair, and keep it consistent across image sets.";

export const makeupConsistencyCompact =
  "Use natural clean makeup with soft brows, real skin texture, light eye definition, muted lip color, and a calm daily complexion, and keep the makeup consistent across image sets.";

export const bodyProportionConsistencyCompact =
  "Keep her body proportions realistic and stable: natural height impression, normal shoulder width, believable leg length, grounded feet, daily-life posture, and no AI-stretched body.";

export const mirrorModelConsistencyCompact =
  "Even if her face is hidden by the phone or naturally cropped, keep her identity stable through the same hair, body proportion, skin tone, outfit, phone grip, shoulder line, posture, and overall styling.";

export const activeModelConsistencyCompact =
  "Use a healthy refined Asian woman with natural daily fitness energy, not a gym influencer, Western fitness model, bodybuilding model, or performance sportswear campaign face.";

export const creatorIdentityBoundaryCompact =
  "The image may feel naturally shareable like a refined outfit record, but the model's face and identity must stay realistic, Asian, consistent, and non-influencer-like, with clothing that feels genuinely worn rather than overly styled.";

export const luxuryIdentityBoundaryCompact =
  "Even when using luxury outfit inspiration, keep the model as an Asian or subtle Asian mixed urban woman rather than a Western runway model or luxury advertising face, and keep the outfit realistic enough for daily life.";

export const realLifeDetailPool = [
  "Add natural fabric folds, a believable trouser break, and relaxed layering so the outfit feels worn by a real person rather than styled by AI.",
  "Keep the outfit slightly imperfect in a tasteful way: soft sleeve movement, natural shirt drape, a weighted bag, and realistic denim or knit texture.",
  "The styling should look considered but not over-arranged, with one practical daily piece such as a tote, cardigan, belt, or shirt layer adding real-life believability.",
  "Avoid perfectly matched beige-on-beige styling; use one grounded wardrobe anchor such as dark denim, charcoal knitwear, navy, olive, black, or warm brown.",
  "Let the clothing feel lived-in but clean, with realistic fabric texture, natural layering, and a believable relationship between trousers, socks, and sneakers."
];

export const outfitDiversityNegative =
  "Avoid AI beige-template outfit, overly matched pale palette, plastic-smooth clothing, perfectly symmetrical styling, lifeless mannequin outfit, unrealistic all-cream wardrobe, excessive color coordination, cheap colorful styling, loud prints, streetwear styling, overly youthful styling, and any outfit that feels generated rather than worn.";

export const peopleIdentityNegative =
  "Avoid non-Asian model, Western runway face, blonde model, racially inconsistent face, changing face between images, changing hairstyle, changing makeup, changing body shape, overly youthful influencer look, plastic beauty face, over-smoothed skin, exaggerated mixed-race features, fashion-week supermodel energy, and generic stock-photo casting.";

export const multiImageIdentityNegative =
  "Avoid different model identity across images, inconsistent face, inconsistent age, inconsistent hairstyle, inconsistent makeup, inconsistent outfit, inconsistent body proportions, and any change that makes the series feel like different people.";

export function shouldUseModelIdentity(imageType: TeamImageType) {
  return imageType === "产品上脚图" || imageType === "对镜穿搭图" || imageType === "生活场景图";
}

export function getModelConsistencyLine(intent: ImageCountIntent) {
  if (intent === "twoImageSet") return twoImageConsistencyCompact;
  if (intent === "multiImageSet") return multiImageModelIdentityLockCompact;
  return singleImageModelConsistencyCompact;
}

export function getAsianAppearanceBoundaryLine() {
  return [
    faceStyleBoundaryCompact,
    hairConsistencyCompact,
    makeupConsistencyCompact,
    bodyProportionConsistencyCompact
  ].join(" ");
}

export function chooseRealLifeDetailLine(input: {
  imageType: TeamImageType;
  scenePreference: TeamScenePreference;
  selectedOutfitLine: string;
  userExtraRequirement?: string;
}) {
  const text = `${input.imageType} ${input.scenePreference} ${input.selectedOutfitLine} ${
    input.userExtraRequirement ?? ""
  }`.toLowerCase();
  let index = 0;

  if (/dark|black|navy|charcoal|深色|黑色|牛仔|denim|jeans/.test(text)) index = 1;
  if (/mirror|对镜|ootd|穿搭/.test(text)) index = 2;
  if (/beige|cream|奶油|米白|全浅色/.test(text)) index = 3;
  if (/sneaker|shoe|鞋|上脚/.test(text)) index = 4;

  return realLifeDetailPool[index];
}
