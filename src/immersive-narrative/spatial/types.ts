export const SPATIAL_SCHEMA_VERSION = "immersive-narrative/spatial-v1.1" as const;

// A within-scene execution position. Anchors are the only spatial vocabulary the
// narrative layers use; they are not Scene Library entries.
export type SpatialAnchorId =
  | "ELEVATOR_EXIT"
  | "APARTMENT_HALLWAY"
  | "APARTMENT_THRESHOLD"
  | "ENTRYWAY"
  | "HOME_INTERIOR"
  | "STREET"
  | "COMMUNITY_PATH"
  | "SHOP_FRONT"
  | "SHOP_WINDOW"
  | "SHOP_INTERIOR"
  | "CAFE_INTERIOR"
  | "CAFE_COUNTER"
  | "OFFICE_ENTRANCE"
  | "RESIDENTIAL_EXIT"
  | "DESTINATION_APPROACH"
  | "DESTINATION_ANCHOR"
  | "CLOAKROOM"
  | "TABLE"
  | "WINDOW_SIDE"
  | "UNKNOWN";

export type SpatialTransitionClass =
  | "SAME_ANCHOR"
  | "IMMEDIATE_ADJACENT"
  | "SHORT_CONTIGUOUS_WALK"
  | "NON_CONTIGUOUS";

export type SpatialContinuityMode = "SINGLE_SPACE" | "CONTIGUOUS_ROUTE";

export type SpatialEnvelope = {
  macroLocation: string;
  allowedAnchors: SpatialAnchorId[];
  continuityMode: SpatialContinuityMode;
};

export type SpatialTransition = {
  fromMomentIndex: number;
  toMomentIndex: number;
  fromAnchor: SpatialAnchorId;
  toAnchor: SpatialAnchorId;
  transitionClass: SpatialTransitionClass;
  ok: boolean;
  reason: string;
};

export type SpatialSequenceValidation = {
  anchors: SpatialAnchorId[];
  transitions: SpatialTransition[];
  pass: boolean;
  failures: string[];
};

export const ALLOWED_TRANSITION_CLASSES: SpatialTransitionClass[] = [
  "SAME_ANCHOR",
  "IMMEDIATE_ADJACENT",
  "SHORT_CONTIGUOUS_WALK",
];
