import type { TeamModelChoice } from "../types";
import type { ImageCountIntent } from "../utils/detectImageCountOrSeriesIntent";

type TeamModelProfile = {
  promptLine: string;
  identityLabel: string;
  agePhrase: string;
  negativePhrases: string[];
};

export const TEAM_MODEL_OPTIONS: TeamModelChoice[] = [
  "欧洲25–30岁女模特",
  "亚裔20–25岁模特",
  "亚裔混血模特",
  "30–45岁客户画像模特"
];

const TEAM_MODEL_PROFILES: Record<TeamModelChoice, TeamModelProfile> = {
  "欧洲25–30岁女模特": {
    promptLine:
      "Use one real-looking European woman aged 25–30, with believable European facial features, natural skin texture, understated daily makeup, realistic proportions, and a calm contemporary presence. Keep her refined and approachable rather than runway-cast or influencer-like.",
    identityLabel: "selected European woman aged 25–30",
    agePhrase: "aged 25–30",
    negativePhrases: [
      "model identity inconsistent with the selected European profile",
      "age drift outside 25–30",
      "runway-supermodel severity"
    ]
  },
  "亚裔20–25岁模特": {
    promptLine:
      "Use one real-looking Asian woman aged 20–25, with natural dark hair, real skin texture, understated daily makeup, realistic proportions, and a fresh but refined daily presence. Keep her adult, tasteful, quiet, and approachable rather than student-like, girlish, influencer-like, or campaign-model-like.",
    identityLabel: "selected Asian woman aged 20–25",
    agePhrase: "aged 20–25",
    negativePhrases: [
      "model identity inconsistent with the selected Asian 20–25 profile",
      "age drift outside 20–25",
      "overly youthful casting",
      "student-like styling"
    ]
  },
  亚裔混血模特: {
    promptLine:
      "Use one real-looking Asian mixed-heritage woman aged 25–30, with natural dark or deep brown hair, subtle mixed features, real skin texture, understated daily makeup, realistic proportions, and calm refined presence. Avoid exaggerated mixed-heritage stereotypes or campaign-model severity.",
    identityLabel: "selected Asian mixed-heritage woman aged 25–30",
    agePhrase: "aged 25–30",
    negativePhrases: [
      "model identity inconsistent with the selected Asian mixed-heritage profile",
      "age drift outside 25–30",
      "exaggerated mixed-heritage stereotype"
    ]
  },
  "30–45岁客户画像模特": {
    promptLine:
      "Use one real-looking Asian or subtle Asian mixed-heritage woman aged 30–45, with natural dark hair, light daily makeup, real skin texure, realistic proportions, and calm urban presence. She should feel like a tasteful THERUIZ AURA customer rather than a professional campaign model.",
    identityLabel: "selected THERUIZ AURA customer woman aged 30–45",
    agePhrase: "aged 30–45",
    negativePhrases: [
      "model identity inconsistent with the selected 30–45 customer profile",
      "age drift outside 30–45",
      "overly youthful campaign casting"
    ]
  }
};

export function getTeamModelProfile(modelChoice: TeamModelChoice) {
  return TEAM_MODEL_PROFILES[modelChoice];
}

export function getTeamModelLine(modelChoice: TeamModelChoice) {
  return getTeamModelProfile(modelChoice).promptLine;
}

export function getTeamModelNegativePhrases(modelChoice: TeamModelChoice) {
  return getTeamModelProfile(modelChoice).negativePhrases;
}

export function getTeamModelConsistencyLine(modelChoice: TeamModelChoice, intent: ImageCountIntent) {
  if (intent === "singleImage") return "";

  const profile = getTeamModelProfile(modelChoice);
  const setLabel = intent === "twoImageSet" ? "two-image set" : "multi-image set";
  return `Across the ${setLabel}, keep the exact same ${profile.identityLabel}, face, age appearance, hairstyle, hair color, makeup, skin tone, body proportions, outfit, accessories, and personal identity.`;
}
