import type { LifestyleSoftCaptureStyle } from "./lifestyleSoftSeedingCaptureStyles";

export type LifestyleFaceVariation = {
  id: string;
  line: string;
  cameraAware?: boolean;
  /** Resolved per batch; never use a card number as the face-direction source. */
  headYaw?: "camera-left" | "camera-right";
  yawDegrees?: number;
  headPitch?: "level" | "downward" | "slightly-upward";
  pitchDegrees?: number;
  gazeTarget?: "camera" | "path" | "shoe-or-hem" | "scene" | "beyond-frame" | "companion";
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
  "camera-acknowledgement": { yawRange: [24, 38], pitch: "level", gazeTarget: "camera" },
  "camera-glance": { yawRange: [24, 38], pitch: "level", gazeTarget: "camera" },
  "path-focus": { yawRange: [18, 32], pitch: "level", gazeTarget: "path" },
  "downward-check": { yawRange: [12, 25], pitch: "downward", gazeTarget: "shoe-or-hem" },
  "scene-response": { yawRange: [28, 42], pitch: "level", gazeTarget: "scene" },
  "window-response": { yawRange: [28, 42], pitch: "slightly-upward", gazeTarget: "scene" },
  "post-action-release": { yawRange: [22, 36], pitch: "level", gazeTarget: "beyond-frame" },
  "listening-side": { yawRange: [25, 40], pitch: "level", gazeTarget: "companion" },
  "companion-attention": { yawRange: [25, 40], pitch: "level", gazeTarget: "companion" },
  "light-response": { yawRange: [10, 22], pitch: "slightly-upward", gazeTarget: "scene" },
  "transition-glance": { yawRange: [18, 30], pitch: "level", gazeTarget: "path" },
  "side-detail": { yawRange: [30, 42], pitch: "level", gazeTarget: "scene" }
};

function geometryFor(variation: LifestyleFaceVariation): FaceGeometry {
  const match = Object.keys(FACE_GEOMETRY_BY_ID).find((key) => variation.id.endsWith(key));
  return match ? FACE_GEOMETRY_BY_ID[match] : { yawRange: [18, 30], pitch: "level", gazeTarget: "scene" };
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
  index: number
): LifestyleFaceVariation {
  const geometry = geometryFor(variation);
  // Resolve both side and actual angle from the full batch seed. This produces
  // more than an odd/even mirror pair and avoids a forced left-right zig-zag.
  const sideHash = stableFaceHash(`${batchSeed}|${index}|${variation.id}|side`);
  const angleHash = stableFaceHash(`${batchSeed}|${index}|${variation.id}|angle`);
  const pitchHash = stableFaceHash(`${batchSeed}|${index}|${variation.id}|pitch`);
  const headYaw: NonNullable<LifestyleFaceVariation["headYaw"]> = sideHash % 2 === 0 ? "camera-left" : "camera-right";
  const [minimum, maximum] = geometry.yawRange;
  const yawDegrees = minimum + (angleHash % (maximum - minimum + 1));
  const direction = headYaw === "camera-left" ? "camera-left" : "camera-right";
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
    ? "Make this the only card allowed to briefly acknowledge the lens."
    : `Look only toward the assigned ${geometry.gazeTarget.replace(/-/g, " ")}, never toward the lens.`;
  const orientationLine = `Face orientation lock: turn about ${yawDegrees} degrees ${direction}, keep the nose line off the lens axis, ${pitch}. ${gaze} Do not use a frontal face or reuse another card's face-direction signature.`;
  return {
    ...variation,
    line: `${variation.line} ${orientationLine}`,
    headYaw,
    yawDegrees,
    headPitch: geometry.pitch,
    pitchDegrees,
    gazeTarget: geometry.gazeTarget,
    signature: `${headYaw}|yaw-${yawDegrees}|${geometry.pitch}-${pitchDegrees}|${geometry.gazeTarget}`
  };
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
    line: "Mandatory face variation: turn the head clearly about 20-30 degrees to the side and keep the nose line off the lens axis. Let the eyes focus on one specific practical scene detail outside the frame with both eyes open, clearly separated eyelids, one brow slightly higher than the other, and a faint asymmetric smile. Do not keep a straight head, level gaze, or neutral resting mouth."
  },
  {
    id: "lifestyle-telephoto-face-path-focus",
    line: "Mandatory face variation: turn the head about 15-25 degrees toward the movement direction, eyes tracking the actual path ahead and slightly downward rather than the lens. Keep both eyes open and focused, brows relaxed, jaw open slightly, and lips visibly parted. Do not reuse the previous card's head angle or neutral mouth."
  },
  {
    id: "lifestyle-telephoto-face-downward-check",
    line: "Mandatory face variation: tilt the head clearly downward about 20-30 degrees and let the eyes check the sneaker, garment hem, or immediate floor path. Keep both eyes open with clearly separated eyelids, a slightly raised brow, and a closed asymmetric mouth with no camera awareness. Do not keep the head level."
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
    line: "Mandatory face variation: use a brief listening-like attention toward a nearby companion or practical destination outside the frame. Turn the head about 15-25 degrees, keep both eyes open, raise one brow, relax the jaw, part the lips subtly, and keep the eyes fully away from the lens."
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
  batchSeed = 0
}: {
  captureStyle: LifestyleSoftCaptureStyle;
  index: number;
  bodyOrientation?: string;
  cameraCardIndex: number;
  rotationIndex: number;
  usedIds?: Set<string>;
  usedSignatures?: Set<string>;
  batchSeed?: number;
}): LifestyleFaceVariation | undefined {
  const plan = getLifestyleFaceVariationPlan(captureStyle);
  if (index === cameraCardIndex) {
    const cameraVariation = plan.find((item) => item.cameraAware);
    return cameraVariation ? resolveVariationForBatch(cameraVariation, batchSeed, index) : undefined;
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
  const unusedPreferred = preferred.filter((item) => !usedIds?.has(item.id));
  const unusedAll = offCamera.filter((item) => !usedIds?.has(item.id));
  const pool = unusedPreferred.length ? unusedPreferred : unusedAll.length ? unusedAll : offCamera;
  const offset = Math.abs(rotationIndex) % pool.length;
  const orderedPool = pool.map((_, candidateIndex) => pool[(offset + candidateIndex) % pool.length]);
  const unusedSignatureVariation = orderedPool
    .map((candidate) => resolveVariationForBatch(candidate, batchSeed, index))
    .find((candidate) => !usedSignatures?.has(candidate.signature ?? ""));
  return unusedSignatureVariation ?? (orderedPool[0]
    ? resolveVariationForBatch(orderedPool[0], batchSeed, index)
    : undefined);
}
