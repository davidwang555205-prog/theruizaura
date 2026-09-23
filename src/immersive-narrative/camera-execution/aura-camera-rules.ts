import { cameraLookProfiles } from "../../data/cameraLookProfiles";
import {
  detectShoePerspectiveRisk,
  resolveCameraPerspectiveProfile,
  type ShoePerspectiveRisk,
} from "../../utils/cameraPerspectiveProfiles";
import type { CameraNarrativeRole } from "../camera-role";
import type {
  CameraHeight,
  CameraLensFamily,
  CameraMovementKind,
  CameraShotScale,
  CameraViewAngle,
} from "./types";

// Phase 7 does not invent a second AURA camera system. Shot scale, working
// distance, lens family and camera-height safety are derived from the existing
// AURA camera modules:
//   src/utils/cameraPerspectiveProfiles.ts   risk detection + focal families
//   src/data/cameraLookProfiles.ts           AURA look + negative look lines
//   src/video-script/compileSeedanceVideoScript.ts  constraint families that the
//     legacy script already sends to the external video model (locked observation,
//     natural working distance, no low-angle or wide-angle shoe enlargement).
export type AuraCameraExecutionRoleRule = {
  role: CameraNarrativeRole;
  shotScale: CameraShotScale;
  cameraHeight: CameraHeight;
  viewAngle: CameraViewAngle;
  movement: CameraMovementKind;
  distanceBandMeters: [number, number];
  movementRelationToSubject: string;
  subjectVisibility: string;
  allowsReframe: boolean;
};

export const AURA_CAMERA_EXECUTION_ROLE_RULES: Record<CameraNarrativeRole, AuraCameraExecutionRoleRule> = {
  OBSERVER: {
    role: "OBSERVER",
    shotScale: "medium_full",
    cameraHeight: "natural_eye_level",
    viewAngle: "three_quarter_front",
    movement: "locked_off",
    distanceBandMeters: [3, 3.5],
    movementRelationToSubject: "Locked observation from the established side; the subject moves inside a frame the camera does not chase or re-aim.",
    subjectVisibility: "The full figure stays readable inside the frame, including the feet-to-ground relationship.",
    allowsReframe: false,
  },
  FOLLOWER: {
    role: "FOLLOWER",
    shotScale: "medium_full",
    cameraHeight: "natural_chest_height",
    viewAngle: "three_quarter_back",
    movement: "restrained_follow",
    distanceBandMeters: [3, 3.5],
    movementRelationToSubject: "Restrained motivated follow at ordinary walking pace: fixed working distance, parallel to the travel direction, no zoom and no speed ramp.",
    subjectVisibility: "The full figure stays inside the frame; the follow never overtakes, closes in, or cuts the person at the frame edge.",
    allowsReframe: false,
  },
  WAITING_CAMERA: {
    role: "WAITING_CAMERA",
    shotScale: "wide_environmental",
    cameraHeight: "natural_eye_level",
    viewAngle: "three_quarter_front",
    movement: "locked_off",
    distanceBandMeters: [3.5, 4],
    movementRelationToSubject: "The camera is already positioned before the action begins; the subject enters, passes, or approaches inside the waiting frame.",
    subjectVisibility: "The environment and the subject's entry path stay visible; the camera does not swing to greet the subject.",
    allowsReframe: false,
  },
  AFTER_ACTION: {
    role: "AFTER_ACTION",
    shotScale: "medium",
    cameraHeight: "natural_eye_level",
    viewAngle: "three_quarter_front",
    movement: "hold_position",
    distanceBandMeters: [2.5, 3],
    movementRelationToSubject: "The camera stays where the action left it and holds the settled aftermath instead of re-framing for a new composition.",
    subjectVisibility: "The settled body state stays visible through the final frame, including hands, object, and ground contact.",
    allowsReframe: false,
  },
  PARTIAL_OBSERVATION: {
    role: "PARTIAL_OBSERVATION",
    shotScale: "partial_body_observation",
    cameraHeight: "natural_shoulder_height",
    viewAngle: "three_quarter_back",
    movement: "locked_off",
    distanceBandMeters: [2.5, 3],
    movementRelationToSubject: "Intentional partial view from the established side; the observed body region stays complete enough that the action remains readable, and the camera never advances to reveal more.",
    subjectVisibility: "Only the body region the action needs stays inside the frame; the rest may leave the frame without hiding what the hands, feet, or object are doing.",
    allowsReframe: false,
  },
};

export const AURA_CAMERA_EXECUTION_RESTRICTIONS = [
  "no ultra-wide distortion",
  "no extreme low angle",
  "no shoe chase camera",
  "no aggressive dolly",
  "no zoom burst",
  "no orbit",
  "no 360 spin",
  "no whip pan",
  "no rapid reframing",
  "no product close-up inserted because Product Presence is HERO",
] as const;

export const AURA_CAMERA_EXECUTION_NEGATIVE_LINE = cameraLookProfiles.AuraOutdoorReference.cameraNegativeLine;
export const AURA_CAMERA_EXECUTION_LOOK_LINE = cameraLookProfiles.AuraOutdoorReference.cameraLookLine;

function lensFamilyOf(profileId: "standard" | "stabilized" | "shoe-safe" | "telephoto-candid"): CameraLensFamily {
  if (profileId === "shoe-safe") return "shoe_safe_60_85";
  if (profileId === "stabilized") return "stabilized_50_70";
  if (profileId === "telephoto-candid") return "telephoto_candid_105_180";
  return "standard_image_type";
}

export type AuraTopicLensProfile = {
  risk: ShoePerspectiveRisk;
  profileId: "standard" | "stabilized" | "shoe-safe" | "telephoto-candid";
  lensFamily: CameraLensFamily;
  focalRange: string;
  distanceLine: string;
};

// The whole 15-second sequence shares one lens family. The family comes from the
// AURA perspective-risk detector run over the real Moment texts, so a walking or
// crossing Moment cannot silently receive a wide, shoe-enlarging perspective.
export function resolveAuraTopicLensProfile(momentTexts: string[]): AuraTopicLensProfile {
  const prompt = momentTexts.join(" ");
  const profile = resolveCameraPerspectiveProfile("生活场景图", prompt);
  return {
    risk: detectShoePerspectiveRisk(prompt),
    profileId: profile.id,
    lensFamily: lensFamilyOf(profile.id),
    focalRange: profile.focalRange,
    distanceLine: profile.distanceLine,
  };
}
