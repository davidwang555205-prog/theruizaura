import type { TeamModelChoice, TeamModelContinuity } from "../types";

export const TEAM_MODEL_CONTINUITY_OPTIONS: TeamModelContinuity[] = ["新人物", "延续上一组人物"];

const modelContinuityLines: Record<TeamModelChoice, string> = {
  "欧洲25–30岁女模特":
    "Use the previous approved woman image as the only person reference; continue the exact same 25-30 European individual, not another similar European model, across front, side, three-quarter, mirror, seated, walking, close, medium, and full-body views: same face shape, eye spacing, brows, nose-mouth ratio, hairline, hair part, hair volume, hair color, skin tone, makeup, gaze temperament, body scale, and identity; only scene, pose, camera distance, styling, and composition may change.",
  "亚裔20–25岁模特":
    "Use the previous approved woman image as the only person reference; continue the exact same 20-25 Asian individual, not another similar Asian model, across front, side, three-quarter, mirror, seated, walking, close, medium, and full-body views: same face shape, eye spacing, brows, nose-mouth ratio, hairline, hair part, hair volume, hair color, skin tone, makeup, gaze temperament, quiet aura, body scale, and identity; only scene, pose, camera distance, styling, and composition may change.",
  亚裔混血模特:
    "Use the previous approved woman image as the only person reference; continue the exact same 25-30 Asian mixed-heritage individual, not another similar mixed-heritage model, across front, side, three-quarter, mirror, seated, walking, close, medium, and full-body views: same face shape, eye spacing, brows, nose-mouth ratio, hairline, hair part, hair volume, hair color, skin tone, makeup, gaze temperament, quiet aura, body scale, and identity; only scene, pose, camera distance, styling, and composition may change.",
  "30–45岁客户画像模特":
    "Use the previous approved woman image as the only person reference; continue the exact same 30-45 Asian or subtle Asian-mixed individual, not another similar customer type, across front, side, three-quarter, mirror, seated, walking, close, medium, and full-body views: same face shape, cheekbone-jawline contour, eye spacing, brows, nose-mouth ratio, hairline, hair part, hair volume, hair color, skin tone, makeup, gaze temperament, quiet aura, body scale, and identity; only scene, pose, camera distance, styling, and composition may change."
};

function buildSamePersonContinuityLine(modelChoice: TeamModelChoice) {
  return modelContinuityLines[modelChoice];
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

const priorityContinuityNegativePhrases: Record<TeamModelChoice, string[]> = {
  "欧洲25–30岁女模特": [
    "generic AI European face",
    "similar European model but different woman",
    "changed face from previous reference",
    "identity reset from previous reference"
  ],
  "亚裔20–25岁模特": [
    "generic AI Asian face",
    "similar Asian model but different woman",
    "changed face from previous reference",
    "identity reset from previous reference"
  ],
  亚裔混血模特: [
    "generic AI mixed-heritage face",
    "similar mixed-heritage model but different woman",
    "changed face from previous reference",
    "European-looking drift from previous reference"
  ],
  "30–45岁客户画像模特": [
    "generic AI mature customer face",
    "similar customer type but different woman",
    "changed face from previous reference",
    "identity reset from previous reference"
  ]
};

export function getModelContinuityLine(modelContinuity: TeamModelContinuity, modelChoice: TeamModelChoice) {
  if (modelContinuity !== "延续上一组人物") return "";
  return buildSamePersonContinuityLine(modelChoice);
}

export function getModelContinuityPriorityNegativePhrases(
  modelContinuity: TeamModelContinuity,
  modelChoice: TeamModelChoice
) {
  if (modelContinuity !== "延续上一组人物") return [];
  return priorityContinuityNegativePhrases[modelChoice];
}

export function getModelContinuityNegativePhrases(modelContinuity: TeamModelContinuity) {
  if (modelContinuity !== "延续上一组人物") return [];
  return samePersonNegativePhrases;
}
