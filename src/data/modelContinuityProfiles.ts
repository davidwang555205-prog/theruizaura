import type { TeamModelChoice, TeamModelContinuity } from "../types";

export const TEAM_MODEL_CONTINUITY_OPTIONS: TeamModelContinuity[] = ["新人物", "延续上一组人物"];

const modelContinuityLines: Record<TeamModelChoice, string> = {
  "欧洲25–30岁女模特":
    "Same-person identity lock: use the previous approved woman image as the only identity source and recreate the exact same 25-30 European individual, not a similar new model or a fresh AI face. Keep identical face geometry across front, side, three-quarter, mirror, seated, walking, close, medium, and full-body views: eye shape and spacing, brow shape, nose bridge, nose-mouth ratio, cheekbone-jawline contour, lips, hairline, hair part, hair volume, hair color, skin tone, makeup, expression temperament, body scale, shoulder-neck line, hand scale, foot scale, and personal aura. Only scene, pose, camera distance, gaze direction, and clothing may change within the same person identity.",
  "欧洲30岁左右男模特":
    "Same-person identity lock: use the previous approved man image as the only identity source and recreate the exact same European male individual around age 30, not a similar new man or a fresh AI face. Keep identical face geometry across front, side, three-quarter, mirror, seated, walking, close, medium, and full-body views: eye shape and spacing, brow shape, nose bridge, nose-mouth ratio, cheekbone-jawline contour, lips, hairline, hair part, hair volume, hair color, skin tone, grooming, expression temperament, body scale, shoulder-neck line, hand scale, foot scale, and personal aura. Only scene, pose, camera distance, gaze direction, and clothing may change within the same person identity.",
  "亚裔20–25岁模特":
    "Same-person identity lock: use the previous approved woman image as the only identity source and recreate the exact same 20-25 Asian individual, not a similar new Asian model or a fresh AI face. Keep identical face geometry across front, side, three-quarter, mirror, seated, walking, close, medium, and full-body views: eye shape and spacing, brow shape, nose bridge, nose-mouth ratio, cheekbone-jawline contour, lips, hairline, hair part, hair volume, hair color, skin tone, makeup, expression temperament, body scale, shoulder-neck line, hand scale, foot scale, and quiet personal aura. Only scene, pose, camera distance, gaze direction, and clothing may change within the same person identity.",
  亚裔混血模特:
    "Same-person identity lock: use the previous approved woman image as the only identity source and recreate the exact same 25-30 Asian mixed-heritage individual, not a similar new mixed-heritage model, not a European-looking drift, and not a fresh AI face. Keep identical face geometry across front, side, three-quarter, mirror, seated, walking, close, medium, and full-body views: eye shape and spacing, brow shape, nose bridge, nose-mouth ratio, cheekbone-jawline contour, lips, hairline, hair part, hair volume, hair color, skin tone, makeup, expression temperament, body scale, shoulder-neck line, hand scale, foot scale, and quiet personal aura. Only scene, pose, camera distance, gaze direction, and clothing may change within the same person identity.",
  "30–45岁客户画像模特":
    "Same-person identity lock: use the previous approved woman image as the only identity source and recreate the exact same 30-45 Asian or subtle Asian-mixed customer individual, not a similar customer type or a fresh AI face. Keep identical face geometry across front, side, three-quarter, mirror, seated, walking, close, medium, and full-body views: eye shape and spacing, brow shape, nose bridge, nose-mouth ratio, cheekbone-jawline contour, lips, hairline, hair part, hair volume, hair color, skin tone, makeup, expression temperament, body scale, shoulder-neck line, hand scale, foot scale, and quiet personal aura. Only scene, pose, camera distance, gaze direction, and clothing may change within the same person identity."
};

function buildSamePersonContinuityLine(modelChoice: TeamModelChoice) {
  return modelContinuityLines[modelChoice];
}

const samePersonPriorityNegativePhrases = [
  "new generated face",
  "fresh AI face instead of previous reference",
  "similar but not the same person",
  "different facial geometry",
  "different side-profile identity",
  "different three-quarter identity",
  "different hairline or hair part",
  "different expression temperament",
  "identity drift between camera angles",
  "identity reset from previous reference"
];

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
  "欧洲30岁左右男模特": [
    "generic AI European male face",
    "similar European male model but different man",
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
  return [...samePersonPriorityNegativePhrases, ...priorityContinuityNegativePhrases[modelChoice]];
}

export function getModelContinuityNegativePhrases(modelContinuity: TeamModelContinuity, modelChoice?: TeamModelChoice) {
  if (modelContinuity !== "延续上一组人物") return [];
  if (modelChoice === "欧洲30岁左右男模特") {
    return samePersonNegativePhrases.map((phrase) =>
      phrase === "different makeup style" ? "different grooming style" : phrase
    );
  }
  return samePersonNegativePhrases;
}
