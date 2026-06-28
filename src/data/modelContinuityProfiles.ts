import type { TeamModelContinuity } from "../types";

export const TEAM_MODEL_CONTINUITY_OPTIONS: TeamModelContinuity[] = ["新人物", "延续上一组人物"];

const samePersonContinuityLine =
  "Use the previous approved woman as the identity reference: same face, age appearance, hairstyle, hair color, skin tone, makeup style, body proportions, hand scale, foot scale, and personal identity. Do not create a similar-but-different model; only scene, pose, camera distance, styling if requested, and composition may change.";

const samePersonReferenceReminderLine =
  "Upload the previous approved woman image as a person reference for best identity consistency.";

const samePersonNegativePhrases = [
  "different face",
  "different age appearance",
  "different hairstyle",
  "different hair color",
  "different skin tone",
  "different makeup style",
  "different body proportions",
  "different facial structure",
  "model identity drift",
  "similar but not the same model"
];

export function getModelContinuityLine(modelContinuity: TeamModelContinuity) {
  if (modelContinuity !== "延续上一组人物") return "";
  return `${samePersonContinuityLine} ${samePersonReferenceReminderLine}`;
}

export function getModelContinuityNegativePhrases(modelContinuity: TeamModelContinuity) {
  if (modelContinuity !== "延续上一组人物") return [];
  return samePersonNegativePhrases;
}
