import type { TeamModelChoice } from "../types";
import type { ImageCountIntent } from "../utils/detectImageCountOrSeriesIntent";

type TeamModelProfile = {
  promptLine: string;
  identityLabel: string;
  agePhrase: string;
  priorityNegativePhrases: string[];
  negativePhrases: string[];
};

export const TEAM_MODEL_OPTIONS: TeamModelChoice[] = [
  "欧洲25–30岁女模特",
  "欧洲30岁左右男模特",
  "亚裔20–25岁模特",
  "亚裔混血模特",
  "30–45岁客户画像模特"
];

const TEAM_MODEL_PROFILES: Record<TeamModelChoice, TeamModelProfile> = {
  "欧洲25–30岁女模特": {
    promptLine:
      "Use one real-looking European woman aged 25–30, with believable European facial features, slight facial asymmetry, normal skin and under-eye texture, understated daily makeup, realistic proportions, and a candid real-camera presence. Keep her approachable and unperformed, not runway-cast, doll-like, influencer-like, or campaign-faced.",
    identityLabel: "selected European woman aged 25–30",
    agePhrase: "aged 25–30",
    priorityNegativePhrases: [
      "generic AI European face",
      "over-smoothed European beauty face",
      "runway-cast face",
      "doll-like facial symmetry"
    ],
    negativePhrases: [
      "model identity inconsistent with the selected European profile",
      "age drift outside 25–30",
      "runway-supermodel severity"
    ]
  },
  "欧洲30岁左右男模特": {
    promptLine:
      "Use one real-looking European man around age 30, with believable European male facial features, slight facial asymmetry, normal skin and under-eye texture, natural hair texture, understated grooming, realistic proportions, and a candid real-camera presence. Keep him refined, calm, mature, and unperformed, not runway-cast, gym-influencer-like, doll-like, overly muscular, or campaign-faced.",
    identityLabel: "selected European man around age 30",
    agePhrase: "around age 30",
    priorityNegativePhrases: [
      "generic AI European male face",
      "over-smoothed male beauty face",
      "runway-cast male face",
      "overly muscular model body",
      "doll-like facial symmetry"
    ],
    negativePhrases: [
      "model identity inconsistent with the selected European male profile",
      "age drift away from around 30",
      "female model",
      "feminine styling",
      "runway-supermodel severity",
      "gym-influencer body",
      "overly muscular body"
    ]
  },
  "亚裔20–25岁模特": {
    promptLine:
      "Use one real-looking Asian woman aged 20–25, with natural dark hair, clearly Asian adult features, slight facial asymmetry, normal skin and under-eye texture, understated daily makeup, realistic proportions, and a fresh real-camera daily presence. Keep her tasteful and quiet, not European-looking, student-like, doll-like, influencer-like, or campaign-faced.",
    identityLabel: "selected Asian woman aged 20–25",
    agePhrase: "aged 20–25",
    priorityNegativePhrases: [
      "generic AI Asian face",
      "over-smoothed youthful beauty face",
      "student-like casting",
      "doll-like facial symmetry"
    ],
    negativePhrases: [
      "model identity inconsistent with the selected Asian 20–25 profile",
      "European-looking model",
      "Western-dominant face",
      "blonde model",
      "non-Asian casting",
      "age drift outside 20–25",
      "overly youthful casting",
      "student-like styling"
    ]
  },
  亚裔混血模特: {
    promptLine:
      "Use one real-looking Asian mixed-heritage woman aged 25–30, with subtle Asian mixed features, natural dark or deep brown hair, slight facial asymmetry, normal skin and under-eye texture, understated daily makeup, realistic proportions, and a calm real-camera presence. Keep her Asian mixed-heritage and unperformed, not European-looking, Western-dominant, blonde, stereotyped, doll-like, or campaign-faced.",
    identityLabel: "selected Asian mixed-heritage woman aged 25–30",
    agePhrase: "aged 25–30",
    priorityNegativePhrases: [
      "generic AI mixed-heritage face",
      "European-looking mixed model drift",
      "over-smoothed mixed-heritage beauty face",
      "doll-like facial symmetry"
    ],
    negativePhrases: [
      "model identity inconsistent with the selected Asian mixed-heritage profile",
      "European-looking model",
      "Western-dominant face",
      "blonde model",
      "non-Asian casting",
      "age drift outside 25–30",
      "exaggerated mixed-heritage stereotype"
    ]
  },
  "30–45岁客户画像模特": {
    promptLine:
      "Use one real-looking Asian or subtle Asian mixed-heritage woman aged 30–45, with natural dark hair, slight facial asymmetry, normal skin and under-eye texture, light daily makeup, realistic proportions, and calm real-camera urban presence. Keep her like a real tasteful customer, not European-looking, Western-dominant, blonde, doll-like, or professional-campaign-faced.",
    identityLabel: "selected Asian or subtle Asian mixed-heritage THERUIZ AURA customer woman aged 30–45",
    agePhrase: "aged 30–45",
    priorityNegativePhrases: [
      "generic AI mature customer face",
      "over-smoothed mature beauty face",
      "professional campaign face",
      "doll-like facial symmetry"
    ],
    negativePhrases: [
      "model identity inconsistent with the selected 30–45 customer profile",
      "European-looking model",
      "Western-dominant face",
      "blonde model",
      "non-Asian casting",
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

export function getTeamModelPriorityNegativePhrases(modelChoice: TeamModelChoice) {
  return getTeamModelProfile(modelChoice).priorityNegativePhrases;
}

export function getTeamModelConsistencyLine(modelChoice: TeamModelChoice, intent: ImageCountIntent) {
  if (intent === "singleImage") return "";

  const profile = getTeamModelProfile(modelChoice);
  const setLabel = intent === "twoImageSet" ? "two-image set" : "multi-image set";
  const groomingDetail = modelChoice === "欧洲30岁左右男模特" ? "grooming" : "makeup";
  return `Across the ${setLabel}, keep the exact same ${profile.identityLabel}, face, age appearance, hairstyle, hair color, ${groomingDetail}, skin tone, body proportions, outfit, accessories, and personal identity.`;
  return `Across the ${setLabel}, keep the exact same ${profile.identityLabel}, face, age appearance, hairstyle, hair color, ${groomingDetail}, skin tone, body proportions, outfit, accessories, and personal identity. Gaze direction, eye focus, and subtle expression may vary naturally with each image's body angle and action.`;
}
