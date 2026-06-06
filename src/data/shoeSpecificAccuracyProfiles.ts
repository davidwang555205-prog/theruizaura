import type { TeamShoe } from "../types";

export type ShoeSpecificAccuracyProfile = {
  risk: string[];
  accuracyLine: string;
};

export const shoeSpecificAccuracyProfiles: Record<TeamShoe, ShoeSpecificAccuracyProfile> = {
  "Cloud Dancer 云舞者": {
    risk: ["white upper overexposure", "panel detail loss", "generic white sneaker transformation"],
    accuracyLine:
      "Preserve Cloud Dancer as a refined off-white low-cut German trainer with visible panel structure, natural off-white tone, slim outsole, rounded toe box, and no overexposed white upper."
  },
  "Sand Dollar 沙钱白": {
    risk: ["beige tone becoming dull", "upper losing softness"],
    accuracyLine:
      "Preserve Sand Dollar as a soft neutral low-cut German trainer with warm sand-toned depth, clean panel boundaries, slim outsole, and no muddy beige color."
  },
  "Cappuccino 卡布奇诺": {
    risk: ["brown becoming muddy", "old-fashioned styling"],
    accuracyLine:
      "Preserve Cappuccino with warm coffee-brown depth, clean material contrast, refined low-cut German trainer shape, slim outsole, and no muddy or aged brown tone."
  },
  "Silver Romance 银色浪漫": {
    risk: ["silver becoming glitter", "mirror-metal shine", "cheap reflective material"],
    accuracyLine:
      "Preserve Silver Romance with muted silver material, soft satin-like or leather-panel sheen, refined panel structure, slim outsole, and no glitter, mirror-metal shine, or cheap reflective effect."
  },
  "Aire 微风": {
    risk: ["becoming running shoe", "mesh texture chaos", "technical sports sneaker transformation"],
    accuracyLine:
      "Preserve Aire as a breathable mesh low-cut German trainer, not a running shoe or technical sneaker. Keep the mesh panels refined, the outsole slim, the toe rounded, and the trainer shape clean and daily."
  },
  "Delphinium Blue 飞燕草蓝": {
    risk: ["blue becoming too saturated", "purple conflict"],
    accuracyLine:
      "Preserve Delphinium Blue as a low-saturation blue-violet German trainer with clean panel separation, soft material texture, slim outsole, and no bright saturated blue or purple distortion."
  },
  "Lemon 柠檬": {
    risk: ["yellow becoming too bright", "childish color"],
    accuracyLine:
      "Preserve Lemon as a soft low-saturation yellow accent German trainer with clean off-white balance, refined daily color, slim outsole, and no neon yellow or childish candy color."
  },
  "Maple Grove 枫林": {
    risk: ["autumn color becoming muddy", "too heavy"],
    accuracyLine:
      "Preserve Maple Grove with warm maple-brown depth, clean material boundaries, low-cut German trainer shape, slim outsole, and no muddy dark color or heavy outdoor-shoe feeling."
  },
  "Oreo 奥利奥": {
    risk: ["becoming generic black-white sneaker", "harsh contrast"],
    accuracyLine:
      "Preserve Oreo as a refined black-white low-cut German trainer with clean contrast, clear panel structure, slim outsole, and no generic skate shoe or chunky sneaker transformation."
  },
  "Panda 熊猫": {
    risk: ["becoming sporty panda sneaker", "black-white too loud"],
    accuracyLine:
      "Preserve Panda as a clean black-white low-cut German trainer with refined panel balance, slim outsole, rounded toe box, and no loud sporty sneaker or chunky sole."
  },
  自定义: {
    risk: ["generic sneaker transformation", "shoe detail loss"],
    accuracyLine:
      "Preserve the selected THERUIZ AURA low-cut German trainer with clean panel structure, slim outsole, rounded toe box, readable tongue, natural laces, and no generic sneaker transformation."
  }
};

export function getShoeSpecificAccuracyLine(shoe: TeamShoe, hasShoe: boolean) {
  return hasShoe ? shoeSpecificAccuracyProfiles[shoe].accuracyLine : "";
}
