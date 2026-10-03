import type { TeamScenePreference } from "../../types";

export type ImageEventFamily =
  | "THRESHOLD_CROSSING"
  | "SURFACE_TRANSITION"
  | "ARRIVAL_SETTLE"
  | "ROUTE_ADJUSTMENT"
  | "SEAT_SETTLING"
  | "VIEWING_REPOSITION"
  | "GARMENT_RECOVERY"
  | "ENVIRONMENT_RESPONSE";

export type ImageEventDefinition = {
  id: string;
  eventFamily: ImageEventFamily;
  compatibleScenes: TeamScenePreference[];
  compatibleActionFamilies: string[];
  trigger: string;
  physicalResponse: string;
  visibleChange: string;
  visualEvidence: string;
};

export type ResolvedImageEventState = {
  id: string;
  eventFamily: ImageEventFamily;
  trigger: string;
  physicalResponse: string;
  visibleChange: string;
  visualEvidence: string;
  promptLine: string;
};
