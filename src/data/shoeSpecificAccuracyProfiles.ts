import type { TeamShoe } from "../types";

export type ShoeSpecificAccuracyProfile = {
  risk: string[];
  accuracyLine: string;
};

export const shoeSpecificAccuracyProfiles: Record<TeamShoe, ShoeSpecificAccuracyProfile> = {
  "Cloud Dancer 云舞者": {
    risk: ["white upper overexposure", "panel detail loss", "generic white sneaker transformation"],
    accuracyLine:
      "Preserve Cloud Dancer only as visibly confirmed by the selected footwear reference, including its visible tone and panel structure; avoid overexposure."
  },
  "Sand Dollar 沙钱白": {
    risk: ["beige tone becoming dull", "upper losing softness"],
    accuracyLine:
      "Preserve Sand Dollar only as visibly confirmed by the selected footwear reference, including its visible neutral tone and panel boundaries; avoid muddy color."
  },
  "Cappuccino 卡布奇诺": {
    risk: ["brown becoming muddy", "old-fashioned styling"],
    accuracyLine:
      "Preserve Cappuccino only as visibly confirmed by the selected footwear reference, including visible brown tone and contrast; avoid muddy or aged color."
  },
  "Silver Romance 银色浪漫": {
    risk: ["silver becoming glitter", "mirror-metal shine", "cheap reflective material"],
    accuracyLine:
      "Preserve Silver Romance with muted silver material, soft satin-like or leather-panel sheen, refined panel structure, slim outsole, and no glitter, mirror-metal shine, or cheap reflective effect."
  },
  "Aire 微风": {
    risk: ["becoming running shoe", "mesh texture chaos", "technical sports sneaker transformation"],
    accuracyLine:
      "Preserve Aire only as visibly confirmed by the selected footwear reference; do not transform it into a running shoe or technical sneaker, and do not infer unconfirmed material or structure."
  },
  "Delphinium Blue 飞燕草蓝": {
    risk: ["blue becoming too saturated", "purple conflict"],
    accuracyLine:
      "Preserve Delphinium Blue only as visibly confirmed by the selected footwear reference, including its visible color relationship and panel separation; avoid saturation distortion."
  },
  "Lemon 柠檬": {
    risk: ["yellow becoming too bright", "childish color"],
    accuracyLine:
      "Preserve Lemon only as visibly confirmed by the selected footwear reference, including its visible accent color; avoid neon or childish color distortion."
  },
  "Maple Grove 枫林": {
    risk: ["autumn color becoming muddy", "too heavy"],
    accuracyLine:
      "Preserve Maple Grove only as visibly confirmed by the selected footwear reference, including visible brown depth and material boundaries; avoid muddy color or heavy reinterpretation."
  },
  "Oreo 奥利奥": {
    risk: ["becoming generic black-white sneaker", "harsh contrast"],
    accuracyLine:
      "Preserve Oreo only as visibly confirmed by the selected footwear reference, including its visible black-white contrast and panel structure; do not transform it into a chunky or skate shoe."
  },
  "Panda 熊猫": {
    risk: ["becoming sporty panda sneaker", "black-white too loud"],
    accuracyLine:
      "Preserve Panda only as visibly confirmed by the selected footwear reference, including its visible black-white balance; do not transform it into a loud sporty or chunky shoe."
  },
  自定义: {
    risk: ["generic sneaker transformation", "shoe detail loss"],
    accuracyLine:
      "Preserve the selected THERUIZ AURA footwear reference only as visibly confirmed, with readable panels, tongue, laces, and proportions; do not transform it into another shoe category."
  }
};

export function getShoeSpecificAccuracyLine(shoe: TeamShoe, hasShoe: boolean) {
  return hasShoe ? shoeSpecificAccuracyProfiles[shoe].accuracyLine : "";
}
