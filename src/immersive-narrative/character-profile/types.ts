export type AgeProfileId =
  | "age_23_27"
  | "age_28_32"
  | "age_33_37"
  | "age_38_42"
  | "age_43_47"
  | "age_48_55";

export type AppearanceGroupId =
  | "asian"
  | "european"
  | "latin_american";

export type CharacterSelection = {
  ageProfileId: AgeProfileId;
  appearanceGroupId: AppearanceGroupId;
};

export type AgeProfile = {
  id: AgeProfileId;
  label: string;
  ageMin: number;
  ageMax: number;
  lifeStageTone: string;
  visualMaturity: string;
  stylingAttitude: string;
  socialEnergy: string;
  bodyLanguageGuidance: string[];
  performanceGuardrails: string[];
  status: "ACTIVE";
};

export type AppearanceGroup = {
  id: AppearanceGroupId;
  label: string;
  visualGuidance: string[];
  prohibitedInferences: string[];
  status: "ACTIVE";
};

export type CharacterProfileQcGateId =
  | "valid_age_profile"
  | "valid_appearance_group"
  | "no_demographic_stereotype"
  | "no_unsupported_inference";

export type CharacterProfileQcGate = {
  id: CharacterProfileQcGateId;
  label: string;
  status: "PASS" | "FAIL";
  reason: string;
};

export type CharacterProfileQc = Record<CharacterProfileQcGateId, CharacterProfileQcGate>;

export type CharacterProfileStatus =
  | "CHARACTER_PROFILE_APPROVED"
  | "CHARACTER_PROFILE_FAILED";

export type ResolvedCharacterProfile = {
  selection: CharacterSelection;
  ageProfile: AgeProfile | null;
  appearanceGroup: AppearanceGroup | null;
  resolvedCharacterContext: string;
  qc: CharacterProfileQc;
  status: CharacterProfileStatus;
  failureReasons?: string[];
};

export type CharacterProfileOptions = {
  ageProfiles?: AgeProfile[];
  appearanceGroups?: AppearanceGroup[];
};
