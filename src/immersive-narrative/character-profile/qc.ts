import type {
  AgeProfile,
  AppearanceGroup,
  CharacterProfileQc,
  CharacterProfileQcGate,
  CharacterProfileQcGateId,
} from "./types";

const GATE_LABELS: Record<CharacterProfileQcGateId, string> = {
  valid_age_profile: "Valid Age Profile",
  valid_appearance_group: "Valid Appearance Group",
  no_demographic_stereotype: "No Demographic Stereotype",
  no_unsupported_inference: "No Unsupported Inference",
};

const STEREOTYPE_PATTERN = /(?:girlish|passionate|sensual|exaggerated curves|sweetness|campus|power-woman|executive|housewife|motherhood|matriarch|wealthy|anti-aging|youthful appearance|specific nationality|cultural styling|cultural costume|nationality preference)/i;
const UNSUPPORTED_INFERENCE_PATTERN = /(?:profession|income|married|marriage|health limitation|physical limitation|slower movement|personality|social class|cultural habit|intelligence|taste level)/i;

function gate(id: CharacterProfileQcGateId, passed: boolean, reason: string): CharacterProfileQcGate {
  return {
    id,
    label: GATE_LABELS[id],
    status: passed ? "PASS" : "FAIL",
    reason,
  };
}

export function buildCharacterProfileQc(input: {
  selectionValid: boolean;
  ageProfile: AgeProfile | null;
  appearanceGroup: AppearanceGroup | null;
  failureReasons: string[];
}): { qc: CharacterProfileQc; allPassed: boolean } {
  const age = input.ageProfile;
  const appearance = input.appearanceGroup;
  const ageText = age ? [
    age.lifeStageTone,
    age.visualMaturity,
    age.stylingAttitude,
    age.socialEnergy,
  ].join(" ") : "";
  const appearanceText = appearance ? appearance.visualGuidance.join(" ") : "";

  const qc: CharacterProfileQc = {
    valid_age_profile: gate(
      "valid_age_profile",
      Boolean(age) && age?.status === "ACTIVE" && age.ageMin <= age.ageMax,
      age ? `${age.label} is an active age profile.` : "Age profile id is invalid."
    ),
    valid_appearance_group: gate(
      "valid_appearance_group",
      Boolean(appearance) && appearance?.status === "ACTIVE",
      appearance ? `${appearance.label} is an active appearance group.` : "Appearance group id is invalid."
    ),
    no_demographic_stereotype: gate(
      "no_demographic_stereotype",
      !STEREOTYPE_PATTERN.test(`${ageText} ${appearanceText}`),
      "No visual or behavioral stereotype is allowed to arise from age or appearance group."
    ),
    no_unsupported_inference: gate(
      "no_unsupported_inference",
      !UNSUPPORTED_INFERENCE_PATTERN.test(ageText) && !UNSUPPORTED_INFERENCE_PATTERN.test(appearanceText),
      "Age and appearance may not infer profession, income, family structure, health, personality, or social class."
    ),
  };

  return {
    qc,
    allPassed: input.selectionValid
      && input.failureReasons.length === 0
      && Object.values(qc).every((entry) => entry.status === "PASS"),
  };
}
