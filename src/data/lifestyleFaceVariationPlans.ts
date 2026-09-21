import type { LifestyleSoftCaptureStyle } from "./lifestyleSoftSeedingCaptureStyles";

export type LifestyleHeadYaw = "camera-left" | "camera-right";
export type LifestyleFaceViewBand =
  | "clear-three-quarter"
  | "pronounced-three-quarter"
  | "near-profile-three-quarter";
export type LifestyleFaceGeometry = {
  headYaw: LifestyleHeadYaw;
  viewBand: LifestyleFaceViewBand;
};

export const lifestyleFaceViewBands: LifestyleFaceViewBand[] = [
  "clear-three-quarter",
  "pronounced-three-quarter",
  "near-profile-three-quarter",
];

export type LifestyleFaceVariation = {
  id: string;
  line: string;
  cameraAware?: boolean;
  /** Resolved per batch; never use a card number as the face-direction source. */
  headYaw?: LifestyleHeadYaw;
  yawDegrees?: number;
  headPitch?: "level" | "downward" | "slightly-upward";
  pitchDegrees?: number;
  gazeTarget?: "camera" | "path" | "shoe-or-hem" | "scene" | "beyond-frame" | "companion";
  viewBand?: LifestyleFaceViewBand;
  signature?: string;
};

type FaceGeometry = {
  yawRange: readonly [number, number];
  pitch: NonNullable<LifestyleFaceVariation["headPitch"]>;
  gazeTarget: NonNullable<LifestyleFaceVariation["gazeTarget"]>;
};

// The semantic face card remains stable, but its left/right presentation is
// resolved from the batch seed. This protects within-series variety without
// making a card position permanently face the same direction across requests.
const FACE_GEOMETRY_BY_ID: Record<string, FaceGeometry> = {
  "camera-acknowledgement": { yawRange: [24, 36], pitch: "level", gazeTarget: "camera" },
  "camera-glance": { yawRange: [24, 36], pitch: "level", gazeTarget: "camera" },
  "path-focus": { yawRange: [20, 30], pitch: "level", gazeTarget: "path" },
  "downward-check": { yawRange: [18, 26], pitch: "downward", gazeTarget: "shoe-or-hem" },
  "scene-response": { yawRange: [30, 40], pitch: "level", gazeTarget: "scene" },
  "window-response": { yawRange: [30, 40], pitch: "slightly-upward", gazeTarget: "scene" },
  "post-action-release": { yawRange: [26, 36], pitch: "level", gazeTarget: "beyond-frame" },
  "listening-side": { yawRange: [28, 38], pitch: "level", gazeTarget: "companion" },
  "companion-attention": { yawRange: [28, 38], pitch: "level", gazeTarget: "companion" },
  "light-response": { yawRange: [18, 26], pitch: "slightly-upward", gazeTarget: "scene" },
  "transition-glance": { yawRange: [20, 30], pitch: "level", gazeTarget: "path" },
  "side-detail": { yawRange: [32, 42], pitch: "level", gazeTarget: "scene" }
};

function geometryFor(variation: LifestyleFaceVariation): FaceGeometry {
  const match = Object.keys(FACE_GEOMETRY_BY_ID).find((key) => variation.id.endsWith(key));
  return match ? FACE_GEOMETRY_BY_ID[match] : { yawRange: [20, 30], pitch: "level", gazeTarget: "scene" };
}

function viewBandForYaw(yawDegrees: number): LifestyleFaceViewBand {
  if (yawDegrees <= 26) return "clear-three-quarter";
  if (yawDegrees <= 35) return "pronounced-three-quarter";
  return "near-profile-three-quarter";
}

function promptViewLabel(viewBand: LifestyleFaceViewBand) {
  if (viewBand === "near-profile-three-quarter") return "near-profile three-quarter view";
  if (viewBand === "pronounced-three-quarter") return "pronounced three-quarter view";
  return "clear three-quarter view";
}

function bodyOrientationTurnLine(bodyOrientation?: string) {
  if (bodyOrientation === "front") {
    return "Distribute the turn through the planted feet, knees, pelvis, ribcage, chest, and shoulder line, so the torso rotates enough to support the head instead of remaining square to the camera";
  }
  if (bodyOrientation === "threeQuarter") {
    return "Carry the three-quarter body direction through the feet, hips, ribcage, and shoulders, with the neck and head completing the turn";
  }
  if (bodyOrientation === "side") {
    return "Keep the feet and hips anchored in the side body line while the ribcage, shoulders, neck, and head turn together toward the gaze target";
  }
  if (bodyOrientation === "rearThreeQuarter") {
    return "Use a natural over-the-shoulder turn with the hips and feet anchored and the chest, shoulders, neck, and head rotating as one chain";
  }
  return "Distribute the turn across the feet, knees, pelvis, ribcage, shoulders, neck, and head rather than isolating the head";
}

function hasAdjacentDuplicateGeometry(geometries: LifestyleFaceGeometry[]) {
  return geometries.some((geometry, index) => index > 0 &&
    geometry.headYaw === geometries[index - 1].headYaw &&
    geometry.viewBand === geometries[index - 1].viewBand
  );
}

export function planLifestyleFaceGeometrySeries(
  faceCount: number,
  batchSeed = 0,
  cameraSlotIndex = -1
): LifestyleFaceGeometry[] {
  if (faceCount <= 0) return [];

  const base: LifestyleFaceGeometry[] = [
    { headYaw: "camera-left", viewBand: "clear-three-quarter" },
    { headYaw: "camera-right", viewBand: "pronounced-three-quarter" },
    { headYaw: "camera-left", viewBand: "near-profile-three-quarter" },
    { headYaw: "camera-right", viewBand: "clear-three-quarter" },
    { headYaw: "camera-left", viewBand: "pronounced-three-quarter" },
    { headYaw: "camera-right", viewBand: "near-profile-three-quarter" }
  ];
  const rotation = Math.abs(batchSeed) % base.length;
  const rotated = base.map((_, index) => base[(rotation + index) % base.length]);
  const plan = Array.from({ length: faceCount }, (_, index) => rotated[index % rotated.length]);

  const cameraVariationCanUse = (geometry: LifestyleFaceGeometry) =>
    geometry.viewBand !== "near-profile-three-quarter";

  if (cameraSlotIndex >= 0 && cameraSlotIndex < plan.length && !cameraVariationCanUse(plan[cameraSlotIndex])) {
    for (let candidateIndex = 0; candidateIndex < plan.length; candidateIndex += 1) {
      if (candidateIndex === cameraSlotIndex || !cameraVariationCanUse(plan[candidateIndex])) continue;
      const candidatePlan = [...plan];
      [candidatePlan[cameraSlotIndex], candidatePlan[candidateIndex]] = [
        candidatePlan[candidateIndex],
        candidatePlan[cameraSlotIndex]
      ];
      if (!hasAdjacentDuplicateGeometry(candidatePlan)) return candidatePlan;
    }
  }

  if (plan.length === 1 && cameraSlotIndex === 0 && !cameraVariationCanUse(plan[0])) {
    return [{ ...plan[0], viewBand: "clear-three-quarter" }];
  }

  return plan;
}

function stableFaceHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function resolveVariationForBatch(
  variation: LifestyleFaceVariation,
  batchSeed: number,
  index: number,
  options: {
    preferredHeadYaw?: LifestyleHeadYaw;
    preferredViewBand?: LifestyleFaceViewBand;
    bodyOrientation?: string;
  } = {}
): LifestyleFaceVariation {
  const geometry = geometryFor(variation);
  // Resolve both side and actual angle from the full batch seed. This produces
  // more than an odd/even mirror pair and avoids a forced left-right zig-zag.
  const sideHash = stableFaceHash(`${batchSeed}|${index}|${variation.id}|side`);
  const angleHash = stableFaceHash(`${batchSeed}|${index}|${variation.id}|angle`);
  const pitchHash = stableFaceHash(`${batchSeed}|${index}|${variation.id}|pitch`);
  const sampledHeadYaw: LifestyleHeadYaw = sideHash % 2 === 0 ? "camera-left" : "camera-right";
  const headYaw = options.preferredHeadYaw ?? sampledHeadYaw;
  const [minimum, maximum] = geometry.yawRange;
  const allYawOptions = Array.from(
    { length: maximum - minimum + 1 },
    (_, candidateIndex) => minimum + candidateIndex
  );
  const preferredYawOptions = options.preferredViewBand
    ? allYawOptions.filter((candidate) => viewBandForYaw(candidate) === options.preferredViewBand)
    : [];
  const yawOptions = preferredYawOptions.length ? preferredYawOptions : allYawOptions;
  const yawDegrees = yawOptions[angleHash % yawOptions.length];
  const viewBand = viewBandForYaw(yawDegrees);
  const frameDirection = headYaw === "camera-left" ? "frame-left" : "frame-right";
  const frameSide = headYaw === "camera-left" ? "left" : "right";
  const pitchDegrees = geometry.pitch === "downward"
    ? 12 + (pitchHash % 11)
    : geometry.pitch === "slightly-upward"
      ? 6 + (pitchHash % 7)
      : 0;
  const pitch = geometry.pitch === "downward"
    ? `with a natural ${pitchDegrees}-degree downward pitch`
    : geometry.pitch === "slightly-upward"
      ? `with a restrained ${pitchDegrees}-degree upward response`
      : "with a level, relaxed head";
  const gaze = geometry.gazeTarget === "camera"
    ? "This is the only card allowed to acknowledge the lens; only the pupils and irises turn toward the lens while the head remains in the assigned three-quarter pose."
    : `Look only toward the assigned ${geometry.gazeTarget.replace(/-/g, " ")}, never toward the lens.`;
  const orientationLine = `Face orientation lock (hard): compose a whole-body turn into a ${promptViewLabel(viewBand)}, with the face plane about ${yawDegrees} degrees off the lens axis. Her nose and face plane point decisively toward ${frameDirection}, meaning the ${frameSide} side of the final image. ${bodyOrientationTurnLine(options.bodyOrientation)}. The far cheek and jawline are clearly visible, the near eye is slightly closer to the camera, and the far eye remains visible and open but slightly foreshortened. Keep a natural weight shift and grounded feet, ${pitch}. ${gaze} The final camera-facing torso angle must support the head direction; do not keep a square frontal torso under a turned head. This must not read as a frontal portrait or reuse another card's face-direction signature.`;
  return {
    ...variation,
    line: `${variation.line} ${orientationLine}`,
    headYaw,
    yawDegrees,
    headPitch: geometry.pitch,
    pitchDegrees,
    gazeTarget: geometry.gazeTarget,
    viewBand,
    signature: `${headYaw}|${viewBand}|yaw-${yawDegrees}|${geometry.pitch}-${pitchDegrees}|${geometry.gazeTarget}`
  };
}

type ResolvedFaceCandidate = {
  variation: LifestyleFaceVariation;
  order: number;
  idReuse: number;
  maxSideCount: number;
  maxDirectionViewBandCount: number;
  adjacentDirectionViewBandDuplicate: number;
  supportedViewBandCount: number;
  duplicateSignature: number;
  maxViewBandCount: number;
};

function isBetterFaceCandidate(
  candidate: ResolvedFaceCandidate,
  current: ResolvedFaceCandidate | undefined
) {
  if (!current) return true;
  if (candidate.idReuse !== current.idReuse) return candidate.idReuse < current.idReuse;
  if (candidate.maxSideCount !== current.maxSideCount) return candidate.maxSideCount < current.maxSideCount;
  if (candidate.adjacentDirectionViewBandDuplicate !== current.adjacentDirectionViewBandDuplicate) {
    return candidate.adjacentDirectionViewBandDuplicate < current.adjacentDirectionViewBandDuplicate;
  }
  if (candidate.duplicateSignature !== current.duplicateSignature) {
    return candidate.duplicateSignature < current.duplicateSignature;
  }
  if (candidate.supportedViewBandCount !== current.supportedViewBandCount) {
    return candidate.supportedViewBandCount < current.supportedViewBandCount;
  }
  if (candidate.maxViewBandCount !== current.maxViewBandCount) {
    return candidate.maxViewBandCount < current.maxViewBandCount;
  }
  if (candidate.maxDirectionViewBandCount !== current.maxDirectionViewBandCount) {
    return candidate.maxDirectionViewBandCount < current.maxDirectionViewBandCount;
  }
  return candidate.order < current.order;
}

function resolveBestVariation(
  candidates: LifestyleFaceVariation[],
  batchSeed: number,
  index: number,
  usedIds?: Set<string>,
  usedSignatures?: Set<string>,
  usedHeadYawCounts?: Map<LifestyleHeadYaw, number>,
  usedViewBandCounts?: Map<LifestyleFaceViewBand, number>,
  usedDirectionViewBandCounts?: Map<string, number>,
  previousDirectionViewBandKey?: string,
  plannedGeometry?: LifestyleFaceGeometry,
  bodyOrientation?: string
) {
  const sideCounts = usedHeadYawCounts ?? new Map<LifestyleHeadYaw, number>();
  const viewBandCounts = usedViewBandCounts ?? new Map<LifestyleFaceViewBand, number>();
  const directionViewBandCounts = usedDirectionViewBandCounts ?? new Map<string, number>();
  let best: ResolvedFaceCandidate | undefined;
  let order = 0;

  for (const candidate of candidates) {
    const sampled = resolveVariationForBatch(candidate, batchSeed, index, { bodyOrientation });
    const sampledHeadYaw = sampled.headYaw ?? "camera-right";
    const otherHeadYaw: LifestyleHeadYaw = sampledHeadYaw === "camera-left" ? "camera-right" : "camera-left";
    const sampledViewBand = sampled.viewBand ?? "clear-three-quarter";
    const supportedViewBands = lifestyleFaceViewBands.filter((viewBand) => {
      const probe = resolveVariationForBatch(candidate, batchSeed, index, {
        preferredHeadYaw: sampledHeadYaw,
        preferredViewBand: viewBand,
        bodyOrientation
      });
      return probe.viewBand === viewBand;
    });
    const viewBandOrder = [
      sampledViewBand,
      ...supportedViewBands.filter((viewBand) => viewBand !== sampledViewBand)
    ];

    for (const headYaw of [sampledHeadYaw, otherHeadYaw]) {
      for (const viewBand of viewBandOrder) {
        const variation = resolveVariationForBatch(candidate, batchSeed, index, {
          preferredHeadYaw: headYaw,
          preferredViewBand: viewBand,
          bodyOrientation
        });
        if (variation.viewBand !== viewBand) continue;
        if (plannedGeometry && (
          variation.headYaw !== plannedGeometry.headYaw ||
          variation.viewBand !== plannedGeometry.viewBand
        )) continue;

        const directionViewBandKey = `${headYaw}|${viewBand}`;
        const directionViewBandCount = (directionViewBandCounts.get(directionViewBandKey) ?? 0) + 1;
        const maxSideCount = Math.max(
          ...(["camera-left", "camera-right"] as LifestyleHeadYaw[]).map(
            (side) => (sideCounts.get(side) ?? 0) + (side === headYaw ? 1 : 0)
          )
        );
        const maxViewBandCount = Math.max(
          ...lifestyleFaceViewBands.map(
            (band) => (viewBandCounts.get(band) ?? 0) + (band === viewBand ? 1 : 0)
          )
        );
        const maxDirectionViewBandCount = Math.max(
          ...Array.from(directionViewBandCounts.values()),
          directionViewBandCount
        );
        const resolved: ResolvedFaceCandidate = {
          variation,
          order,
          idReuse: usedIds?.has(candidate.id) ? 1 : 0,
          maxSideCount,
          maxDirectionViewBandCount,
          adjacentDirectionViewBandDuplicate: previousDirectionViewBandKey === directionViewBandKey ? 1 : 0,
          supportedViewBandCount: supportedViewBands.length,
          duplicateSignature: usedSignatures?.has(variation.signature ?? "") ? 1 : 0,
          maxViewBandCount
        };
        order += 1;

        if (isBetterFaceCandidate(resolved, best)) best = resolved;
      }
    }
  }

  return best?.variation;
}

export const lifestyleStandardFaceVariations: LifestyleFaceVariation[] = [
  {
    id: "lifestyle-face-camera-acknowledgement",
    cameraAware: true,
    line: "Use a soft three-quarter head angle with one brief friendly camera acknowledgement. Keep both eyes visibly open, with relaxed upper eyelids, visible iris and pupil, natural catchlights, and a faint asymmetric smile. This is the only standard-series face beat that may acknowledge the lens."
  },
  {
    id: "lifestyle-face-path-focus",
    line: "Let the head follow the walking or movement direction while the eyes track the real path ahead, keeping both eyes open and focused, with a relaxed brow and resting lips. Keep the gaze away from the lens and do not acknowledge the camera."
  },
  {
    id: "lifestyle-face-downward-check",
    line: "Angle the head slightly downward and let the eyes check the sneaker, garment hem, or immediate floor path. Keep both eyes open with clearly separated eyelids, a relaxed brow, and a quiet neutral mouth. Keep the gaze fully off-camera."
  },
  {
    id: "lifestyle-face-scene-response",
    line: "Turn the head toward one real scene detail with an off-camera gaze, open eyes, a small natural brow response, and an unforced mouth shape. Do not redirect the eyes toward the lens."
  },
  {
    id: "lifestyle-face-post-action-release",
    line: "Capture the face just after the body action settles, with a soft exhale, open relaxed eyes, subtly parted or resting lips, and gaze continuing beyond the action path. Keep the gaze outside the frame and do not turn back to re-acknowledge the camera."
  },
  {
    id: "lifestyle-face-listening-side",
    line: "Use a quiet listening-like side attention toward a nearby person or environmental cue, with one eye slightly nearer the camera, both eyes open, a calm jaw, and no held portrait smile. The attention stays on the scene, never on the lens."
  },
  {
    id: "lifestyle-face-light-response",
    line: "Let the face respond subtly to changing daylight or reflection while keeping both eyes open and clearly separated, with relaxed lips and the head secondary to the body action. Keep the eyes off-camera."
  },
  {
    id: "lifestyle-face-transition-glance",
    line: "Use a fleeting glance toward the next practical destination during the transition, with a small head turn, open eyes, neutral brow, and an expression that feels unfinished rather than posed. Do not acknowledge the camera."
  }
];

export const lifestyleTelephotoFaceVariations: LifestyleFaceVariation[] = [
  {
    id: "lifestyle-telephoto-face-camera-glance",
    cameraAware: true,
    line: "Mandatory face variation: turn the head gently toward the camera and allow one brief, friendly, friend-taking-a-photo glance. Keep both eyes visibly open, with relaxed upper eyelids, visible iris and pupil, natural catchlights, and a faint asymmetric smile. This is the only telephoto-series card that may look into the lens."
  },
  {
    id: "lifestyle-telephoto-face-side-detail",
    line: "Mandatory face variation: turn the head clearly into a side-facing three-quarter pose and keep the nose line off the lens axis. Let the eyes focus on one specific practical scene detail outside the frame with both eyes open, clearly separated eyelids, one brow slightly higher than the other, and a faint asymmetric smile. Do not keep a straight head, level gaze, or neutral resting mouth."
  },
  {
    id: "lifestyle-telephoto-face-path-focus",
    line: "Mandatory face variation: turn the head toward the movement direction, eyes tracking the actual path ahead and slightly downward rather than the lens. Keep both eyes open and focused, brows relaxed, jaw open slightly, and lips visibly parted. Do not reuse the previous card's head angle or neutral mouth."
  },
  {
    id: "lifestyle-telephoto-face-downward-check",
    line: "Mandatory face variation: tilt the head clearly downward and let the eyes check the sneaker, garment hem, or immediate floor path. Keep both eyes open with clearly separated eyelids, a slightly raised brow, and a closed asymmetric mouth with no camera awareness. Do not keep the head level."
  },
  {
    id: "lifestyle-telephoto-face-window-response",
    line: "Mandatory face variation: turn the head toward architecture, a storefront, artwork, or another real scene cue on the opposite side of the frame. Keep the gaze off-camera and slightly upward, both eyes open and bright with natural catchlights, lift one brow clearly, and use an unforced small smile that is different from the resting mouth."
  },
  {
    id: "lifestyle-telephoto-face-post-action-release",
    line: "Mandatory face variation: capture the face just after the action settles, with the head turned away or slightly lowered, both eyes open and relaxed, and gaze placed just beyond the walking path, never toward the lens. Show a soft exhale with visibly parted or relaxed lips and a distinct post-action expression rather than a repeat of the previous card."
  },
  {
    id: "lifestyle-telephoto-face-companion-attention",
    line: "Mandatory face variation: use a brief listening-like attention toward a nearby companion or practical destination outside the frame. Turn the head into a clear three-quarter pose, keep both eyes open, raise one brow, relax the jaw, part the lips subtly, and keep the eyes fully away from the lens."
  },
  {
    id: "lifestyle-telephoto-face-light-response",
    line: "Mandatory face variation: let the eyes respond subtly to real daylight or reflection while keeping both eyes open and clearly separated. Keep the gaze entirely off-camera, shift the brow tension, and change the mouth state from the other face-visible cards."
  },
  {
    id: "lifestyle-telephoto-face-transition-glance",
    line: "Mandatory face variation: use a fleeting off-camera glance toward the next destination during movement, with a small unfinished head turn in the opposite direction from the prior card. Keep both eyes open, the brow asymmetrical, the mouth slightly open, and no portrait-like facial hold."
  }
];

export function getLifestyleFaceVariationPlan(captureStyle: LifestyleSoftCaptureStyle) {
  return captureStyle === "telephoto_candid"
    ? lifestyleTelephotoFaceVariations
    : lifestyleStandardFaceVariations;
}

export function resolveLifestyleFaceVariationForCard({
  captureStyle,
  index,
  bodyOrientation,
  cameraCardIndex,
  rotationIndex,
  usedIds,
  usedSignatures,
  usedHeadYawCounts,
  usedViewBandCounts,
  usedDirectionViewBandCounts,
  previousDirectionViewBandKey,
  plannedGeometry,
  batchSeed = 0
}: {
  captureStyle: LifestyleSoftCaptureStyle;
  index: number;
  bodyOrientation?: string;
  cameraCardIndex: number;
  rotationIndex: number;
  usedIds?: Set<string>;
  usedSignatures?: Set<string>;
  usedHeadYawCounts?: Map<LifestyleHeadYaw, number>;
  usedViewBandCounts?: Map<LifestyleFaceViewBand, number>;
  usedDirectionViewBandCounts?: Map<string, number>;
  previousDirectionViewBandKey?: string;
  plannedGeometry?: LifestyleFaceGeometry;
  batchSeed?: number;
}): LifestyleFaceVariation | undefined {
  const plan = getLifestyleFaceVariationPlan(captureStyle);
  if (index === cameraCardIndex) {
    const cameraVariation = plan.find((item) => item.cameraAware);
    return cameraVariation
      ? resolveBestVariation(
          [cameraVariation],
          batchSeed,
          index,
          usedIds,
          usedSignatures,
          usedHeadYawCounts,
          usedViewBandCounts,
          usedDirectionViewBandCounts,
          previousDirectionViewBandKey,
          plannedGeometry,
          bodyOrientation
        )
      : undefined;
  }

  const offCamera = plan.filter((item) => !item.cameraAware);
  const preferredIds =
    bodyOrientation === "side"
      ? ["lifestyle-telephoto-face-side-detail", "lifestyle-telephoto-face-window-response", "lifestyle-face-listening-side", "lifestyle-face-scene-response"]
      : bodyOrientation === "rearThreeQuarter"
        ? ["lifestyle-telephoto-face-transition-glance", "lifestyle-telephoto-face-post-action-release", "lifestyle-face-post-action-release", "lifestyle-face-transition-glance"]
        : bodyOrientation === "threeQuarter"
          ? ["lifestyle-telephoto-face-side-detail", "lifestyle-telephoto-face-window-response", "lifestyle-face-scene-response"]
          : ["lifestyle-telephoto-face-path-focus", "lifestyle-telephoto-face-downward-check", "lifestyle-face-path-focus", "lifestyle-face-downward-check"];

  const preferred = offCamera.filter((item) => preferredIds.includes(item.id));
  const other = offCamera.filter((item) => !preferredIds.includes(item.id));
  const candidates = [...preferred, ...other];
  const offset = candidates.length ? Math.abs(rotationIndex) % candidates.length : 0;
  const orderedCandidates = candidates.map(
    (_, candidateIndex) => candidates[(offset + candidateIndex) % candidates.length]
  );
  return resolveBestVariation(
    orderedCandidates,
    batchSeed,
    index,
    usedIds,
    usedSignatures,
    usedHeadYawCounts,
    usedViewBandCounts,
    usedDirectionViewBandCounts,
    previousDirectionViewBandKey,
    plannedGeometry,
    bodyOrientation
  );
}
