import { AGE_PROFILES } from "./age-profiles";
import { APPEARANCE_GROUPS } from "./appearance-groups";
import { buildCharacterProfileQc } from "./qc";
import type {
  AgeProfile,
  AgeProfileId,
  AppearanceGroup,
  AppearanceGroupId,
  CharacterProfileOptions,
  CharacterSelection,
  ResolvedCharacterProfile,
} from "./types";

export const DEFAULT_CHARACTER_SELECTION: CharacterSelection = {
  ageProfileId: "age_28_32",
  appearanceGroupId: "asian",
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function migrateLegacyCharacterProfile(value: string | undefined): CharacterSelection | null {
  if (!value) return null;
  if (normalize(value) === normalize("32岁左右成熟女性")) {
    return { ...DEFAULT_CHARACTER_SELECTION };
  }
  return null;
}

export function isAgeProfileId(value: unknown): value is AgeProfileId {
  return AGE_PROFILES.some((profile) => profile.id === value);
}

export function isAppearanceGroupId(value: unknown): value is AppearanceGroupId {
  return APPEARANCE_GROUPS.some((group) => group.id === value);
}

export function resolveCharacterProfile(
  selection: CharacterSelection,
  options: CharacterProfileOptions = {}
): ResolvedCharacterProfile {
  const ageProfiles = options.ageProfiles ?? AGE_PROFILES;
  const appearanceGroups = options.appearanceGroups ?? APPEARANCE_GROUPS;
  const ageProfile = ageProfiles.find((profile) => profile.id === selection.ageProfileId) ?? null;
  const appearanceGroup = appearanceGroups.find((group) => group.id === selection.appearanceGroupId) ?? null;
  const failureReasons: string[] = [];

  if (!ageProfile) failureReasons.push(`INVALID_AGE_PROFILE: ${selection.ageProfileId}`);
  if (!appearanceGroup) failureReasons.push(`INVALID_APPEARANCE_GROUP: ${selection.appearanceGroupId}`);

  const qcResult = buildCharacterProfileQc({
    selectionValid: Boolean(ageProfile && appearanceGroup),
    ageProfile,
    appearanceGroup,
    failureReasons,
  });
  if (!qcResult.allPassed && failureReasons.length === 0) {
    failureReasons.push("CHARACTER_PROFILE_QC_FAILED: Character profile violates catalog guardrails.");
  }

  const resolvedCharacterContext = ageProfile && appearanceGroup
    ? [
        `Age profile: ${ageProfile.label}.`,
        `Life stage tone: ${ageProfile.lifeStageTone}.`,
        `Presentation: ${ageProfile.visualMaturity}.`,
        `Styling attitude: ${ageProfile.stylingAttitude}.`,
        `Social energy: ${ageProfile.socialEnergy}.`,
        `Appearance group: ${appearanceGroup.label}; visible appearance only.`,
        "Appearance does not infer personality, lifestyle, profession, income, family structure, behavior, movement, intelligence, taste, or cultural habits.",
      ].join(" ")
    : "";

  return {
    selection,
    ageProfile,
    appearanceGroup,
    resolvedCharacterContext,
    qc: qcResult.qc,
    status: qcResult.allPassed ? "CHARACTER_PROFILE_APPROVED" : "CHARACTER_PROFILE_FAILED",
    failureReasons: failureReasons.length ? failureReasons : undefined,
  };
}

export function resolveCharacterSelection(input: {
  characterSelection?: CharacterSelection;
  characterProfile?: string;
}): ResolvedCharacterProfile {
  const migrated = input.characterSelection
    ?? migrateLegacyCharacterProfile(input.characterProfile)
    ?? (input.characterProfile?.trim() ? null : DEFAULT_CHARACTER_SELECTION);

  if (!migrated) {
    return {
      selection: DEFAULT_CHARACTER_SELECTION,
      ageProfile: null,
      appearanceGroup: null,
      resolvedCharacterContext: "",
      qc: buildCharacterProfileQc({
        selectionValid: false,
        ageProfile: null,
        appearanceGroup: null,
        failureReasons: ["UNSUPPORTED_CHARACTER_PROFILE"],
      }).qc,
      status: "CHARACTER_PROFILE_FAILED",
      failureReasons: ["UNSUPPORTED_CHARACTER_PROFILE: Free-text character profiles must be migrated to a catalog selection."],
    };
  }

  return resolveCharacterProfile(migrated);
}

export function getAgeProfileOptions(): AgeProfile[] {
  return [...AGE_PROFILES];
}

export function getAppearanceGroupOptions(): AppearanceGroup[] {
  return [...APPEARANCE_GROUPS];
}
