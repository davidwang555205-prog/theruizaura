import type { NarrativePlanStatus } from "../types";
import type { NarrativeTopicId } from "../topic-catalog";
import type { ResolvedMoment, SceneResolverStatus } from "../scene-resolver";
import type { ProductPresenceMoment, ProductPresenceStatus } from "../product-presence";
import type { SoundMoment, SoundWorldStatus } from "../sound-world";

export type CameraNarrativeRole =
  | "OBSERVER"
  | "FOLLOWER"
  | "WAITING_CAMERA"
  | "AFTER_ACTION"
  | "PARTIAL_OBSERVATION";

export type CameraNarrativeIntent = {
  followsSubjectMovement: boolean;
  cameraPreExistsInSpace: boolean;
  allowsSubjectToExitFrame: boolean;
  allowsPartialBodyObservation: boolean;
};

export type CameraNarrativeMoment = {
  momentIndex: number;
  originalWhatHappens: string;
  sceneId: string;
  role: CameraNarrativeRole;
  reason: string;
  cameraIntent: CameraNarrativeIntent;
};

export type CameraNarrativeQcGateId =
  | "narrative_preserved"
  | "role_motivated_by_action"
  | "no_product_driven_camera"
  | "no_overdirection";

export type CameraNarrativeQcGate = {
  id: CameraNarrativeQcGateId;
  label: string;
  status: "PASS" | "FAIL";
  reason: string;
};

export type CameraNarrativeQc = Record<CameraNarrativeQcGateId, CameraNarrativeQcGate>;

export type CameraNarrativeStatus =
  | "CAMERA_NARRATIVE_APPROVED"
  | "CAMERA_NARRATIVE_FAILED";

export type CameraNarrativeInput = {
  topicId: NarrativeTopicId;
  narrativeStatus: NarrativePlanStatus;
  sceneResolutionStatus: SceneResolverStatus;
  productPresenceStatus: ProductPresenceStatus;
  soundWorldStatus: SoundWorldStatus;
  storyIntent: string;
  resolvedMoments: ResolvedMoment[];
  productPresenceCurve: ProductPresenceMoment[];
  soundMoments: SoundMoment[];
};

export type CameraNarrativeRule = {
  topicId: NarrativeTopicId;
  label: string;
  baseline: CameraNarrativeRole[];
  description: string;
  productDriven?: boolean;
  partialObservationPurpose?: "narrative" | "product";
  forceAfterAction?: boolean;
  overdirected?: boolean;
};

export type CameraNarrativeOptions = {
  rules?: CameraNarrativeRule[];
};

export type CameraNarrativeOutput = {
  soundWorldStatus: SoundWorldStatus;
  topicId: NarrativeTopicId;
  moments: CameraNarrativeMoment[];
  qc: CameraNarrativeQc;
  status: CameraNarrativeStatus;
  failureReasons?: string[];
};
