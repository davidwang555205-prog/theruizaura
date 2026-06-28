import type { TeamModelChoice, TeamModelContinuity } from "../types";

export const TEAM_MODEL_CONTINUITY_OPTIONS: TeamModelContinuity[] = ["新人物", "延续上一组人物"];

const continuityIdentityLabels: Record<TeamModelChoice, string> = {
  "欧洲25–30岁女模特": "European woman aged 25-30",
  "亚裔20–25岁模特": "Asian woman aged 20-25",
  亚裔混血模特: "Asian mixed-heritage woman aged 25-30",
  "30–45岁客户画像模特": "Asian or Asian-mixed customer woman aged 30-45"
};

function buildSamePersonContinuityLine(modelChoice: TeamModelChoice) {
  if (modelChoice === "30–45岁客户画像模特") {
    return "Use the previous approved woman image as the only person reference; continue the exact same 30-45 Asian or subtle Asian-mixed individual, not another similar customer type, across front, side, three-quarter, mirror, seated, walking, close, medium, and full-body views: same face shape, cheekbone-jawline contour, eye spacing, brows, nose-mouth ratio, hairline, hair part, hair volume, hair color, skin tone, makeup, gaze temperament, quiet aura, body scale, and identity; only scene, pose, camera distance, styling, and composition may change.";
  }

  const identityLabel = continuityIdentityLabels[modelChoice];
  const castingBoundary =
    modelChoice === "欧洲25–30岁女模特"
      ? ""
      : "; avoid European or Western-dominant casting drift";
  return `Use the previous approved woman image as a real-camera person reference; keep the exact same ${identityLabel} across front, side, three-quarter, mirror, seated, walking, close, medium, and full-body views: facial geometry, eyes, brows, nose-mouth ratio, hairstyle, hair color, skin tone, makeup, gaze style, expression temperament, quiet aura, body scale, hand-foot scale, and identity${castingBoundary}; only scene, pose, camera distance, styling, and composition may change.`;
}

const samePersonNegativePhrases = [
  "different face",
  "different age appearance",
  "different hairstyle",
  "different hair color",
  "different skin tone",
  "different makeup style",
  "different body proportions",
  "different facial structure",
  "changed eye shape",
  "changed brow shape",
  "changed nose-mouth proportion",
  "changed expression temperament",
  "changed personal aura",
  "different side profile",
  "different three-quarter face",
  "different mirror-reflection face",
  "facial geometry shift across angles",
  "different hairstyle across angles",
  "changed gaze temperament across angles",
  "identity drift between camera angles",
  "model identity drift",
  "similar but not the same model"
];

const samePersonPriorityNegativePhrases = [
  "different woman from previous reference",
  "identity reset from previous reference"
];

const customerContinuityPriorityNegativePhrases = [
  "another similar 30-45 customer",
  "same customer type but different woman",
  "changed face from previous reference",
  "identity reset from previous reference"
];

export function getModelContinuityLine(modelContinuity: TeamModelContinuity, modelChoice: TeamModelChoice) {
  if (modelContinuity !== "延续上一组人物") return "";
  return buildSamePersonContinuityLine(modelChoice);
}

export function getModelContinuityPriorityNegativePhrases(
  modelContinuity: TeamModelContinuity,
  modelChoice: TeamModelChoice
) {
  if (modelContinuity !== "延续上一组人物") return [];
  return modelChoice === "30–45岁客户画像模特"
    ? customerContinuityPriorityNegativePhrases
    : samePersonPriorityNegativePhrases;
}

export function getModelContinuityNegativePhrases(modelContinuity: TeamModelContinuity) {
  if (modelContinuity !== "延续上一组人物") return [];
  return samePersonNegativePhrases;
}
