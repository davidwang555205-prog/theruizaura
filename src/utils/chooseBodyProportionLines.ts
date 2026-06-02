import type { ImageCountIntent } from "./detectImageCountOrSeriesIntent";
import type { TeamImageType, TeamPoseType, TeamScenePreference, TeamSeason } from "../types";
import {
  activeBodyProportionCompact,
  armHandProportionCompact,
  asianFemaleProportionCompact,
  bodyConsistencyAcrossImagesCompact,
  bodyProportionBoundaryCompact,
  clothingProportionInteractionCompact,
  figureStyleBoundaryCompact,
  mirrorBodyRealismCompact,
  mirrorProportionCompact,
  naturalBodyProportionCompact,
  seatedPoseProportionCompact,
  shoeLegRelationshipCompact,
  standingPoseProportionCompact,
  summerLegProportionCompact,
  upperBodyProportionCompact,
  walkingProportionCompact
} from "../data/bodyProportionProfiles";

type BodyProportionInput = {
  imageType: TeamImageType;
  scenePreference: Exclude<TeamScenePreference, "自动匹配">;
  isMirror: boolean;
  poseType: TeamPoseType;
  hasShoe: boolean;
  season: TeamSeason;
  selectedOutfitLine: string;
  userExtraRequirement: string;
  imageCountIntent: ImageCountIntent;
};

function hasSummerLegExposure(input: BodyProportionInput) {
  const text = `${input.selectedOutfitLine} ${input.userExtraRequirement}`.toLowerCase();
  return input.season === "夏" && /shorts|skirt|dress|短裤|半裙|裙|连衣裙/.test(text);
}

export function chooseBodyProportionLines(input: BodyProportionInput) {
  if (input.imageType === "产品静物图" || input.poseType === "none" || input.poseType === "handsOnly") {
    return input.poseType === "handsOnly" ? [armHandProportionCompact] : [];
  }

  const lines: string[] = [
    `${naturalBodyProportionCompact} ${bodyProportionBoundaryCompact} ${asianFemaleProportionCompact}`,
    `${upperBodyProportionCompact} ${figureStyleBoundaryCompact} ${armHandProportionCompact}`
  ];

  if (input.isMirror) {
    lines.push(`${mirrorProportionCompact} ${mirrorBodyRealismCompact}`);
  } else if (input.poseType === "walking") {
    lines.push(walkingProportionCompact);
  } else if (input.poseType === "seated") {
    lines.push(seatedPoseProportionCompact);
  } else if (input.poseType === "active" || input.scenePreference === "健身房内") {
    lines.push(`${activeBodyProportionCompact} ${standingPoseProportionCompact}`);
  } else {
    lines.push(standingPoseProportionCompact);
  }

  if (input.hasShoe) {
    lines.push(`${shoeLegRelationshipCompact} ${clothingProportionInteractionCompact}`);
  }

  if (hasSummerLegExposure(input)) {
    lines.push(summerLegProportionCompact);
  }

  if (input.imageCountIntent === "multiImageSet") {
    lines.push(bodyConsistencyAcrossImagesCompact);
  }

  return lines.slice(0, 4);
}
