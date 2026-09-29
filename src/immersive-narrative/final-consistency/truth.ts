import type { SpatialAnchorId } from "../spatial/types";
import type { TakeBoundary } from "../execution-compiler/moment-contract";
import type {
  ModelFacingCameraState,
  ModelFacingExecutionScript,
  ModelFacingMoment,
} from "../execution-compiler/types";
import { modelFacingStateSentences } from "./facts";

// Human-readable names for the internal spatial anchors. The Director Script is
// read by a director, so it speaks in places; the internal anchor ids stay in the
// technical execution prompt and in the structured plan.
export const SPATIAL_ANCHOR_LABEL: Record<SpatialAnchorId, string> = {
  ELEVATOR_EXIT: "the elevator lobby",
  APARTMENT_HALLWAY: "the apartment hallway",
  APARTMENT_THRESHOLD: "the apartment doorway",
  ENTRYWAY: "the entryway",
  HOME_INTERIOR: "the home interior",
  STREET: "the street",
  COMMUNITY_PATH: "the community path",
  SHOP_FRONT: "the shop front",
  SHOP_WINDOW: "the shop window",
  SHOP_INTERIOR: "the shop interior",
  CAFE_INTERIOR: "the cafe interior",
  CAFE_COUNTER: "the cafe counter",
  OFFICE_ENTRANCE: "the office entrance",
  RESIDENTIAL_EXIT: "the residential entrance",
  DESTINATION_APPROACH: "the approach to the destination",
  DESTINATION_ANCHOR: "the destination",
  CLOAKROOM: "the cloakroom",
  TABLE: "the table",
  WINDOW_SIDE: "the window side",
  UNKNOWN: "the current position",
};

// Anchors that are physically on the private/interior side of their boundary.
// Only these may carry interior room tone in the final sound world.
export const INTERIOR_ANCHORS: SpatialAnchorId[] = [
  "ENTRYWAY",
  "HOME_INTERIOR",
  "SHOP_INTERIOR",
  "CAFE_INTERIOR",
  "CAFE_COUNTER",
  "TABLE",
  "WINDOW_SIDE",
  "CLOAKROOM",
];

export type AcousticsZone = "INTERIOR" | "EXTERIOR" | "UNKNOWN";

export function spatialAnchorLabel(anchor: SpatialAnchorId | string | null | undefined): string {
  if (!anchor) return SPATIAL_ANCHOR_LABEL.UNKNOWN;
  return SPATIAL_ANCHOR_LABEL[anchor as SpatialAnchorId] ?? SPATIAL_ANCHOR_LABEL.UNKNOWN;
}

export function acousticsZoneOf(anchor: SpatialAnchorId | string | null | undefined): AcousticsZone {
  if (!anchor || anchor === "UNKNOWN") return "UNKNOWN";
  return INTERIOR_ANCHORS.includes(anchor as SpatialAnchorId) ? "INTERIOR" : "EXTERIOR";
}

export function dedupeConsecutive<T>(items: T[]): T[] {
  const result: T[] = [];
  for (const item of items) {
    if (result.length === 0 || result[result.length - 1] !== item) result.push(item);
  }
  return result;
}

export function humanReadableRoute(anchors: Array<SpatialAnchorId | string>): string {
  return dedupeConsecutive(anchors).map((anchor) => spatialAnchorLabel(anchor)).join(" → ");
}

export function humanReadableScenes(sceneNames: string[]): string {
  const distinct = dedupeConsecutive(sceneNames.filter(Boolean));
  return distinct.join(" → ");
}

export function cameraMovementLabel(movement: ModelFacingCameraState["movementState"]): string {
  if (movement === "restrained_follow") return "a restrained follow that may lag";
  if (movement === "hold_position") return "a held position with no further movement";
  return "a locked-off position";
}

export type ImmersiveTakeTruth = {
  takeIndex: number;
  momentIndexes: number[];
  moments: ModelFacingMoment[];
  motivation: string | null;
  whyContinuousCoverageFails: string | null;
  boundary: TakeBoundary | null;
  openingMomentIndex: number;
  openingCameraState: ModelFacingCameraState;
  location: SpatialAnchorId | string;
  previousLocation: SpatialAnchorId | string | null;
  acousticsZone: AcousticsZone;
  previousAcousticsZone: AcousticsZone | null;
  changesAcousticsZone: boolean;
  inheritedStateSentences: string[];
};

function resolveTakeBoundary(script: ModelFacingExecutionScript, momentIndex: number): TakeBoundary | null {
  const boundary = script.moments.find((moment) => moment.momentIndex === momentIndex)?.contract.takeBoundary ?? null;
  if (!boundary?.evidence || !boundary?.whyContinuousCoverageFails) return null;
  return boundary;
}

// Moment != Take. The Take Plan is the existing structured boundary set; this
// reads it once so every renderer and the validator agree on the same units.
export function buildImmersiveTakeTruth(script: ModelFacingExecutionScript): ImmersiveTakeTruth[] {
  const cameraByIndex = new Map(script.diagnostics.cameraTransitions.map((transition) => [transition.momentIndex, transition]));
  const takes: ImmersiveTakeTruth[] = [];

  for (const moment of script.moments) {
    const isOpening = takes.length === 0 || moment.momentIndex === 0 || Boolean(resolveTakeBoundary(script, moment.momentIndex));
    if (isOpening) {
      takes.push({
        takeIndex: takes.length,
        momentIndexes: [],
        moments: [],
        motivation: null,
        whyContinuousCoverageFails: null,
        boundary: null,
        openingMomentIndex: moment.momentIndex,
        openingCameraState: cameraByIndex.get(moment.momentIndex)?.state ?? {
          cameraPosition: "off_travel_axis_established_side",
          cameraSide: "established A-side",
          height: "natural eye level",
          lensFamily: "unchanged lens",
          workingDistance: "unchanged working distance",
          framingState: "medium-full",
          movementState: "locked_off",
          naturalPartialVisibility: false,
        },
        location: moment.contract.spatialAnchor,
        previousLocation: null,
        acousticsZone: acousticsZoneOf(moment.contract.spatialAnchor),
        previousAcousticsZone: null,
        changesAcousticsZone: false,
        inheritedStateSentences: [],
      });
    }
    takes[takes.length - 1].moments.push(moment);
    takes[takes.length - 1].momentIndexes.push(moment.momentIndex);
  }

  return takes.map((take, index) => {
    const boundary = index === 0 ? null : resolveTakeBoundary(script, take.openingMomentIndex);
    const previous = index === 0 ? null : takes[index - 1];
    const location = take.moments[take.moments.length - 1]?.contract.spatialAnchor ?? take.location;
    const previousLocation = previous ? previous.moments[previous.moments.length - 1]?.contract.spatialAnchor ?? previous.location : null;
    // The acoustic world of a Take is the space it opens in: a Take that opens
    // inside is an interior Take even when the previous Take ended on the sill.
    const acousticsZone = acousticsZoneOf(take.moments[0]?.contract.spatialAnchor ?? location);
    const previousAcousticsZone = previous ? previous.acousticsZone : null;
    return {
      ...take,
      location,
      previousLocation,
      acousticsZone,
      previousAcousticsZone,
      changesAcousticsZone: Boolean(previousAcousticsZone && previousAcousticsZone !== "UNKNOWN" && acousticsZone !== "UNKNOWN" && previousAcousticsZone !== acousticsZone),
      motivation: boundary?.evidence ?? null,
      whyContinuousCoverageFails: boundary?.whyContinuousCoverageFails ?? null,
      boundary,
      inheritedStateSentences: index === 0
        ? []
        : modelFacingStateSentences(take.moments[0]?.contract.worldStateBefore ?? null),
    };
  });
}

// A Take opens on its own camera state. It never borrows the previous Take's
// position, and it never re-initialises the person, the props, or the direction
// of travel.
export type TakeOpeningCameraInput = {
  takeIndex: number;
  openingCameraState: ModelFacingCameraState;
  whyContinuousCoverageFails: string | null;
};

export function takeOpeningCameraLine(take: TakeOpeningCameraInput): string {
  const state = take.openingCameraState;
  const reason = take.whyContinuousCoverageFails
    ? ` The new position is used only because ${lowerFirst(take.whyContinuousCoverageFails.replace(/\.$/, ""))}.`
    : "";
  return `TAKE ${take.takeIndex + 1} opens on its own approved camera state: ${state.cameraSide}, ${state.height}, ${state.framingState} framing, ${cameraMovementLabel(state.movementState)}, holding the same lens family and the same established screen direction as the previous Take.${reason} It does not re-center, chase, or recover subject or product presentation.`;
}

function lowerFirst(text: string) {
  if (text.length === 0) return text;
  return `${text[0].toLowerCase()}${text.slice(1)}`;
}

export function takeInheritanceLine(take: ImmersiveTakeTruth): string {
  const previous = take.previousLocation ? spatialAnchorLabel(take.previousLocation) : null;
  const current = spatialAnchorLabel(take.location);
  const location = previous && previous !== current
    ? `The person stays where the previous Take left her and continues into ${current}; nothing about her, her belongings, or the completed actions restarts.`
    : "The person, her belongings, and every completed action continue exactly as the previous Take left them.";
  return `${location} Only the approved camera position changes here.`;
}

export function sentenceList(items: string[]): string {
  return items
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => (item.endsWith(".") ? item : `${item}.`))
    .join(" ");
}
