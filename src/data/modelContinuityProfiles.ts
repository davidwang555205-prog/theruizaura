import type { TeamModelChoice, TeamModelContinuity } from "../types";
import { getTeamModelProfile } from "./teamModelProfiles";

export const TEAM_MODEL_CONTINUITY_OPTIONS: TeamModelContinuity[] = ["新人物", "延续上一组人物"];

function buildSamePersonContinuityLine(modelChoice: TeamModelChoice) {
  const profile = getTeamModelProfile(modelChoice);
  const castingBoundary =
    modelChoice === "欧洲25–30岁女模特"
      ? ""
      : "; avoid European or Western-dominant casting drift";
  return `Continue the exact same ${profile.identityLabel} from the previous approved reference: same face, facial structure, age, hairstyle, hair color, hair length, skin tone, makeup, eye shape, gaze style, expression temperament, quiet aura, body scale, hand and foot scale, and identity${castingBoundary}; only scene, pose, camera distance, requested styling, and composition may change.`;
}

const samePersonReferenceReminderLine =
  "Upload the previous approved woman image as a person reference.";

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
  "model identity drift",
  "similar but not the same model"
];

export function getModelContinuityLine(modelContinuity: TeamModelContinuity, modelChoice: TeamModelChoice) {
  if (modelContinuity !== "延续上一组人物") return "";
  return `${buildSamePersonContinuityLine(modelChoice)} ${samePersonReferenceReminderLine}`;
}

export function getModelContinuityNegativePhrases(modelContinuity: TeamModelContinuity) {
  if (modelContinuity !== "延续上一组人物") return [];
  return samePersonNegativePhrases;
}
