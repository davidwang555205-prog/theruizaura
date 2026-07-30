import type { TeamImageType } from "../types";

export type ShoePerspectiveRisk = "low" | "medium" | "high";

export type CameraPerspectiveProfile = {
  id: "standard" | "stabilized" | "shoe-safe";
  focalRange: string;
  distanceLine: string;
  risk: ShoePerspectiveRisk;
};

const highRiskPattern = /抬脚|前伸脚|鞋底朝向|鞋底对镜|低机位|低角度|贴近镜头|脚靠近镜头|踮脚|raised foot|extended foot|sole toward|low angle|low-angle|foreground foot|close to camera/i;
const mediumRiskPattern = /迈步|走路|交叉腿|侧身|坐姿|屈膝|step|walking|crossed legs|side profile|seated|bent knee/i;

function detectRisk(prompt: string): ShoePerspectiveRisk {
  if (highRiskPattern.test(prompt)) return "high";
  if (mediumRiskPattern.test(prompt)) return "medium";
  return "low";
}

export function resolveCameraPerspectiveProfile(
  imageType: TeamImageType | undefined,
  prompt: string
): CameraPerspectiveProfile {
  const risk = detectRisk(prompt);

  if (risk === "high") {
    return {
      id: "shoe-safe",
      focalRange: "a restrained 60-85mm equivalent perspective",
      distanceLine:
        "Place the camera farther back and keep the camera at a natural standing height so the foreground shoe does not enlarge relative to the legs.",
      risk
    };
  }

  if (risk === "medium") {
    return {
      id: "stabilized",
      focalRange: "a natural 50-70mm equivalent perspective",
      distanceLine:
        "Use a moderate camera distance with the lens axis kept parallel to the subject, preserving natural shoe-to-leg scale.",
      risk
    };
  }

  if (imageType === "产品上脚图" || imageType === "生活场景图" || imageType === "对镜穿搭图") {
    return {
      id: "standard",
      focalRange: "the image type's established standard lens perspective",
      distanceLine:
        "Keep the established camera distance and composition for this image type; do not force a close foreground shoe.",
      risk
    };
  }

  return {
    id: "standard",
    focalRange: "the image type's established lens perspective",
    distanceLine: "Preserve the established camera distance and composition for this image type.",
    risk
  };
}

export function cameraPerspectiveLine(profile: CameraPerspectiveProfile): string {
  if (profile.id === "shoe-safe") {
    return "Camera profile (shoe-safe): use a restrained 60-85mm perspective, move the camera farther back, preserve the image-type composition and series lens continuity, and avoid foreground shoe enlargement.";
  }
  if (profile.id === "stabilized") {
    return "Camera profile (stabilized): use a natural 50-70mm perspective with moderate camera distance, preserve the image-type composition and series lens continuity, and avoid foreground shoe enlargement.";
  }
  return "Camera profile (standard): keep the established lens and camera distance, preserve the image-type composition and series lens continuity, and avoid wide-angle shoe enlargement.";
}
