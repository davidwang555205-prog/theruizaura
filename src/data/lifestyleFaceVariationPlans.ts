import type { LifestyleSoftCaptureStyle } from "./lifestyleSoftSeedingCaptureStyles";

export type LifestyleFaceVariation = {
  id: string;
  line: string;
  cameraAware?: boolean;
};

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
  usedIds
}: {
  captureStyle: LifestyleSoftCaptureStyle;
  index: number;
  bodyOrientation?: string;
  cameraCardIndex: number;
  rotationIndex: number;
  usedIds?: Set<string>;
}): LifestyleFaceVariation | undefined {
  const plan = getLifestyleFaceVariationPlan(captureStyle);
  if (index === cameraCardIndex) {
    return plan.find((item) => item.cameraAware);
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
  return pool[offset];
}
