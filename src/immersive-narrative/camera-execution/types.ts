import type { NarrativeDuration, NarrativeMomentPurpose, NarrativePlanStatus } from "../types";
import type { NarrativeTopicId } from "../topic-catalog";
import type { CameraNarrativeRole, CameraNarrativeStatus } from "../camera-role";
import type { ProductPresenceLevel, ProductPresenceStatus } from "../product-presence";
import type { SceneResolverContinuityRole, SceneResolverStatus } from "../scene-resolver";
import type { SoundWorldStatus } from "../sound-world";
import type { PhysicalActionMovementState, PhysicalActionMomentMatch } from "../physical-action";

export const CAMERA_EXECUTION_SCHEMA_VERSION = "immersive-narrative/camera-execution-v1" as const;
export const CAMERA_EXECUTION_VERSION = "1.0.0" as const;

// Camera Execution answers HOW the camera physically executes the relationship
// already chosen by Camera Narrative Role. It never re-decides the role and it
// never touches the Physical Action.
export type CameraExecutionStatus =
  | "CAMERA_EXECUTION_APPROVED"
  | "CAMERA_EXECUTION_FAILED";

export type CameraExecutionMomentStatus = "EXECUTABLE" | "CORRECT_UNSUPPORTED";

export type CameraShotScale =
  | "wide_environmental"
  | "full_figure"
  | "medium_full"
  | "medium"
  | "partial_body_observation";

export type CameraHeight =
  | "natural_eye_level"
  | "natural_chest_height"
  | "natural_shoulder_height";

export type CameraViewAngle =
  | "three_quarter_front"
  | "three_quarter_back"
  | "profile_parallel";

export type CameraLensFamily =
  | "standard_image_type"
  | "stabilized_50_70"
  | "shoe_safe_60_85"
  | "telephoto_candid_105_180";

export type CameraMovementKind =
  | "locked_off"
  | "restrained_follow"
  | "hold_position"
  | "short_lateral_reframe";

export type CameraPosition = "off_travel_axis_established_side";

export type CameraTransitionKind =
  | "OPEN"
  | "CONTINUOUS_HOLD"
  | "WAITING_FRAME"
  | "SETTLE"
  | "AXIS_HOLD"
  | "NONE_UNSUPPORTED";

export type CameraExecutionMoment = {
  momentIndex: number;
  purpose: NarrativeMomentPurpose;
  sceneId: string;
  sceneName: string;
  continuityRole: SceneResolverContinuityRole;
  cameraRole: CameraNarrativeRole;
  whatHappens: string;
  physicalActionId: string | null;
  physicalActionStatus: "MATCHED" | "UNRESOLVED";
  physicalActionMovementState: PhysicalActionMovementState | null;
  status: CameraExecutionMomentStatus;
  shotScale: CameraShotScale | null;
  workingDistance: string | null;
  cameraPosition: CameraPosition | null;
  cameraHeight: CameraHeight | null;
  viewAngle: CameraViewAngle | null;
  lensFamily: CameraLensFamily | null;
  lensLine: string | null;
  cameraMovement: CameraMovementKind | null;
  movementRelationToSubject: string | null;
  startFraming: string | null;
  endFraming: string | null;
  timing: {
    startSecond: number;
    endSecond: number;
    durationSeconds: number;
  } | null;
  transitionKind: CameraTransitionKind;
  transitionBehavior: string;
  subjectVisibility: string | null;
  productPresence: ProductPresenceLevel;
  productVisibilityGuard: string;
  productReframeAllowed: false;
  productMayMotivateCamera: false;
  reframeReason: string | null;
  actionPreservation: string;
  continuity: {
    lensConsistentWithTopic: boolean;
    sideConsistentWithTopic: boolean;
    carriedFromPreviousFrame: boolean;
    note: string;
  };
  reason: string;
  unsupportedReason: string | null;
};

export type CameraExecutionQcGateId =
  | "physical_action_preserved"
  | "camera_role_preserved"
  | "no_product_driven_action"
  | "no_product_only_camera_motivation"
  | "no_impossible_follow"
  | "no_body_camera_collision"
  | "no_perspective_abuse"
  | "no_random_lens_jump"
  | "no_unmotivated_reframe"
  | "moment_continuity"
  | "natural_ending";

export type CameraExecutionQcGate = {
  id: CameraExecutionQcGateId;
  label: string;
  status: "PASS" | "FAIL";
  reason: string;
};

export type CameraExecutionQc = Record<CameraExecutionQcGateId, CameraExecutionQcGate>;

export type CameraExecutionMomentInput = {
  momentIndex: number;
  purpose: NarrativeMomentPurpose;
  whatHappens: string;
  sceneId: string;
  sceneName: string;
  continuityRole: SceneResolverContinuityRole;
  cameraRole: CameraNarrativeRole;
  productPresence: ProductPresenceLevel;
  physicalAction: {
    status: "MATCHED" | "UNRESOLVED";
    selectedActionId: string | null;
    selectedActionFamily: string | null;
    movementState: PhysicalActionMovementState | null;
    missingCapability: string | null;
    gapClass: string | null;
  };
};

export type CameraExecutionInput = {
  topicId: NarrativeTopicId;
  topicLabel: string;
  durationSeconds: NarrativeDuration;
  statuses: {
    narrative: NarrativePlanStatus;
    sceneResolution: SceneResolverStatus;
    productPresence: ProductPresenceStatus;
    soundWorld: SoundWorldStatus;
    cameraNarrative: CameraNarrativeStatus;
    physicalActionStage: string;
  };
  moments: CameraExecutionMomentInput[];
};

export type CameraExecutionPipelineInputs = {
  topicLabel: string;
  plan: {
    topicId: string;
    status: NarrativePlanStatus;
    durationSeconds: NarrativeDuration;
    moments: { index: number; purpose: NarrativeMomentPurpose; whatHappens: string }[];
  };
  sceneResolution: {
    status: SceneResolverStatus;
    resolvedMoments: {
      momentIndex: number;
      sceneId: string;
      sceneName: string;
      continuityRole: SceneResolverContinuityRole;
    }[];
  };
  productPresence: {
    status: ProductPresenceStatus;
    curve: { momentIndex: number; presence: ProductPresenceLevel }[];
  };
  soundWorld: { status: SoundWorldStatus };
  cameraNarrative: {
    status: CameraNarrativeStatus;
    moments: { momentIndex: number; role: CameraNarrativeRole }[];
  };
  physicalAction: {
    resultStage: string;
    moments: PhysicalActionMomentMatch[];
  };
};

export type CameraExecutionCoverage = {
  totalMoments: number;
  executableMoments: number;
  correctUnsupportedMoments: number;
  roleDistribution: Record<CameraNarrativeRole, number>;
  lensFamilyCount: number;
  lensFamilyChanges: 0;
  sideSwitches: 0;
  resetToFrontCount: number;
  productDrivenCameraMoments: 0;
  actionRewrites: 0;
};

export type CameraExecutionPlan = {
  schemaVersion: typeof CAMERA_EXECUTION_SCHEMA_VERSION;
  plannerVersion: typeof CAMERA_EXECUTION_VERSION;
  topicId: NarrativeTopicId;
  topicLabel: string;
  durationSeconds: NarrativeDuration;
  status: CameraExecutionStatus;
  moments: CameraExecutionMoment[];
  qc: CameraExecutionQc;
  coverage: CameraExecutionCoverage;
  continuityProfile: {
    lensFamily: CameraLensFamily;
    focalRange: string;
    perspectiveRisk: "low" | "medium" | "high";
    perspectiveProfileId: "standard" | "stabilized" | "shoe-safe" | "telephoto-candid";
    cameraSide: string;
    axisRule: string;
    resetToFrontPolicy: string;
  };
  cameraLook: {
    lookLine: string;
    negativeLine: string;
  };
  restrictions: string[];
  failureReasons?: string[];
};
