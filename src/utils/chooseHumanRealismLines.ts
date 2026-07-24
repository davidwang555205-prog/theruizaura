import type {
  TeamGarmentTypePreference,
  TeamHumanPoseCategory,
  TeamImageType,
  TeamPromptMode,
  TeamScenePreference
} from "../types";
import {
  framingStabilityLine,
  gymBodyProportionStabilityLine,
  headAndShoulderBalanceLine,
  humanProportionStabilityCoreLine,
  mirrorProportionStabilityLine,
  perspectiveStabilityLine,
  seatedAndLaceTyingProportionLine,
  standardBodyProportionLine
} from "../data/bodyProportionProfiles";
import {
  bodyWeightRealismLine,
  clothingWornRealismLine,
  facialLightingAngleLines,
  livedInHumanRealismCoreLine,
  naturalExpressionAndGazeLine,
  naturalHandBehaviorLine,
  realHumanDetailLine,
  tastefulBloggerLiteRealismLine
} from "../data/humanRealismProfiles";
import {
  ankleCollarAlignmentLine,
  groundedStanceLine,
  gymOnFootSneakerStabilityLine,
  lowerLegToSneakerScaleLine,
  mirrorOnFootStabilityLine,
  multiImageHumanAndSneakerConsistencyLine,
  onFootSneakerProportionCoreLine,
  outsoleGroundContactLine,
  shoeToBodyProportionLine,
  skirtShortsToSneakerProportionLine,
  sockToSneakerBoundaryLine,
  toeDirectionStabilityLine,
  trouserToSneakerProportionLine,
  walkingStepShoeAlignmentLine
} from "../data/onFootSneakerProportionProfiles";

export type HumanRealismInput = {
  imageType: TeamImageType;
  scenePreference: TeamScenePreference;
  actionType?: string;
  poseCategory?: TeamHumanPoseCategory;
  bodyOrientation?: string;
  gazeMode?: string;
  garmentTypePreference: TeamGarmentTypePreference;
  selectedOutfitLine: string;
  hasShoe: boolean;
  multiImageMode: boolean;
  promptMode: TeamPromptMode;
};

export type HumanRealismSelection = {
  livedInCoreLine: string;
  realHumanDetailLine: string;
  clothingWornLine: string;
  bloggerLiteLine: string;
  expressionGazeLine: string;
  naturalHandLine: string;
  bodyWeightLine: string;
  humanProportionCoreLine: string;
  bodySpecialLine: string;
  onFootSneakerLines: string;
  multiImageConsistencyLine: string;
  facialLightingLine: string;
  negativePhrases: string[];
};

const PEOPLE_IMAGE_TYPES: TeamImageType[] = ["产品上脚图", "对镜穿搭图", "生活场景图"];

const TROUSER_KEYWORDS = [
  "trousers",
  "trousers",
  "jeans",
  "denim",
  "wide-leg",
  "straight-leg",
  "jogger",
  "active trousers",
  "裤",
  "裤装",
  "牛仔",
  "阔腿",
  "直筒",
  "运动裤"
];

const SKIRT_SHORT_DRESS_KEYWORDS = [
  "skirt",
  "dress",
  "shorts",
  "bermuda",
  "midi skirt",
  "shirt dress",
  "裙",
  "裙装",
  "连衣裙",
  "短裤",
  "百慕大"
];

const SOCK_KEYWORDS = ["sock", "socks", "no-show socks", "low socks", "袜", "短袜", "船袜"];

const HAND_KEYWORDS = [
  "hand",
  "hands",
  "phone",
  "tote",
  "bag",
  "coffee",
  "flowers",
  "book",
  "water bottle",
  "adjust",
  "holding",
  "carrying",
  "手",
  "手机",
  "包",
  "咖啡",
  "花",
  "书",
  "水瓶",
  "调整",
  "拿",
  "拎"
];

function isPeopleImage(imageType: TeamImageType) {
  return PEOPLE_IMAGE_TYPES.includes(imageType);
}

function includesAny(text: string, keywords: string[]) {
  const normalized = text.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

function joinLines(lines: string[]) {
  return lines.filter(Boolean).join(" ");
}

function resolveGarmentLine(input: HumanRealismInput) {
  const outfitText = `${input.garmentTypePreference} ${input.selectedOutfitLine}`.toLowerCase();

  if (includesAny(outfitText, SKIRT_SHORT_DRESS_KEYWORDS)) return skirtShortsToSneakerProportionLine;
  if (includesAny(outfitText, TROUSER_KEYWORDS)) return trouserToSneakerProportionLine;

  return trouserToSneakerProportionLine;
}

function shouldIncludeHandLine(input: HumanRealismInput) {
  const text = `${input.actionType ?? ""} ${input.selectedOutfitLine}`.toLowerCase();
  return input.imageType === "对镜穿搭图" || includesAny(text, HAND_KEYWORDS);
}

export function resolveHumanPoseCategory(input: {
  imageType: TeamImageType;
  scenePreference: TeamScenePreference;
  actionType?: string;
  selectedOutfitLine?: string;
  userExtraRequirement?: string;
}): TeamHumanPoseCategory {
  const text = [
    input.scenePreference,
    input.actionType,
    input.selectedOutfitLine,
    input.userExtraRequirement
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (input.imageType === "对镜穿搭图" || includesAny(text, ["mirror", "对镜", "镜拍"])) return "mirror";
  if (includesAny(text, ["系鞋带", "shoelace", "shoelaces", "tying laces", "tying shoelaces"])) return "laceTying";
  if (input.scenePreference === "健身房内" || input.scenePreference === "去运动的路上") return "gymLightAction";
  if (includesAny(text, ["坐", "seated", "sitting", "bench", "chair", "bed edge"])) return "seated";
  if (includesAny(text, ["蹲", "弯腰", "lean", "crouch", "bend"])) return "crouchOrLean";
  if (includesAny(text, ["walk", "walking", "走", "步", "stride"])) return "walking";

  return "standing";
}

function getBodySpecialLine(poseCategory: TeamHumanPoseCategory) {
  if (poseCategory === "mirror") return joinLines([standardBodyProportionLine, mirrorProportionStabilityLine]);
  if (poseCategory === "seated" || poseCategory === "laceTying" || poseCategory === "crouchOrLean") {
    return joinLines([standardBodyProportionLine, seatedAndLaceTyingProportionLine]);
  }
  if (poseCategory === "gymLightAction") return gymBodyProportionStabilityLine;

  return standardBodyProportionLine;
}

function getPoseShoeLine(poseCategory: TeamHumanPoseCategory) {
  if (poseCategory === "mirror") return mirrorOnFootStabilityLine;
  if (poseCategory === "walking") return walkingStepShoeAlignmentLine;
  if (poseCategory === "gymLightAction") return gymOnFootSneakerStabilityLine;
  if (poseCategory === "standing") return groundedStanceLine;
  return groundedStanceLine;
}

function getNegativePhrases(poseCategory: TeamHumanPoseCategory, hasShoe: boolean) {
  const phrases = [
    "tiny head",
    "over-elongated legs",
    "compressed torso",
    "oversized hands",
    "extra-long fingers",
    "distorted wrists",
    "warped shoulder width",
    "unrealistic waist placement",
    "mannequin anatomy",
    "wide-angle body stretch",
    "stiff mannequin posture",
    "plastic model feeling",
    "dead-eyed expression",
    "frozen smile",
    "doll-like presence"
  ];

  if (hasShoe) {
    phrases.push(
      "oversized feet",
      "tiny feet",
      "warped mirror proportions",
      "oversized shoes",
      "tiny shoes",
      "empty shoes",
      "collapsed shoe collar",
      "fused ankles",
      "socks merging into collar",
      "trouser hem swallowing shoes",
      "trousers entering sneaker collar",
      "garment hem clipping into shoes",
      "floating heels",
      "sinking soles",
      "warped outsole contact",
      "mismatched toe direction",
      "twisted feet",
      "unrealistic shoe-to-leg scale"
    );
  }

  if (poseCategory === "mirror") {
    phrases.push("mirror-body distortion", "stretched leg proportion", "oversized phone hand", "mirror-warped shoes", "cropped toe box");
  }

  if (poseCategory === "seated" || poseCategory === "laceTying" || poseCategory === "crouchOrLean") {
    phrases.push("collapsed knees", "compressed limbs", "distorted seated pose", "hands merging with laces");
  }

  if (poseCategory === "gymLightAction") {
    phrases.push(
      "bodybuilder proportions",
      "exaggerated muscle tone",
      "hyper-athletic silhouette",
      "technical running shoe transformation",
      "thick athletic sole",
      "gym trainer silhouette"
    );
  }

  return phrases;
}

function resolveFacialLightingLine(bodyOrientation?: string, gazeMode?: string) {
  const line = 
    bodyOrientation === "front" ? facialLightingAngleLines[0] :
    bodyOrientation === "threeQuarter" ? facialLightingAngleLines[1] :
    bodyOrientation === "side" ? facialLightingAngleLines[2] :
    bodyOrientation === "rearThreeQuarter" ? facialLightingAngleLines[3] :
    gazeMode === "lookAtCamera" ? facialLightingAngleLines[0] :
    facialLightingAngleLines[4];
  return `${line} The facial light direction and shadow pattern must follow the scene's main light source rather than creating a second independent light on the face.`;
}

export function chooseHumanRealismLines(input: HumanRealismInput): HumanRealismSelection {
  const peopleImage = isPeopleImage(input.imageType);
  const poseCategory = input.poseCategory ?? resolveHumanPoseCategory(input);

  if (!peopleImage) {
    return {
      livedInCoreLine: "",
      realHumanDetailLine: "",
      clothingWornLine: "",
      bloggerLiteLine: "",
      expressionGazeLine: "",
      naturalHandLine: "",
      bodyWeightLine: "",
      humanProportionCoreLine: "",
      bodySpecialLine: "",
      onFootSneakerLines: "",
      multiImageConsistencyLine: "",
      facialLightingLine: "",
      negativePhrases: []
    };
  }

  const compactMode = input.promptMode === "compact";
  const humanProportionCoreLine = compactMode
    ? joinLines([humanProportionStabilityCoreLine, headAndShoulderBalanceLine])
    : joinLines([humanProportionStabilityCoreLine, headAndShoulderBalanceLine, perspectiveStabilityLine, framingStabilityLine]);
  const bodySpecialLine = getBodySpecialLine(poseCategory);
  const onFootSneakerLines =
    input.hasShoe
      ? joinLines([
          shoeToBodyProportionLine,
          onFootSneakerProportionCoreLine,
          ankleCollarAlignmentLine,
          lowerLegToSneakerScaleLine,
          resolveGarmentLine(input),
          includesAny(`${input.selectedOutfitLine} ${input.actionType ?? ""}`, SOCK_KEYWORDS) ? sockToSneakerBoundaryLine : "",
          outsoleGroundContactLine,
          toeDirectionStabilityLine,
          getPoseShoeLine(poseCategory)
        ])
      : "";

  return {
    livedInCoreLine: livedInHumanRealismCoreLine,
    realHumanDetailLine,
    clothingWornLine: clothingWornRealismLine,
    bloggerLiteLine: tastefulBloggerLiteRealismLine,
    expressionGazeLine: poseCategory === "mirror" ? "" : naturalExpressionAndGazeLine,
    facialLightingLine: resolveFacialLightingLine(input.bodyOrientation, input.gazeMode),
    naturalHandLine: shouldIncludeHandLine(input) ? naturalHandBehaviorLine : "",
    bodyWeightLine:
      poseCategory === "standing" || poseCategory === "walking" || poseCategory === "mirror" || poseCategory === "gymLightAction"
        ? bodyWeightRealismLine
        : "",
    humanProportionCoreLine,
    bodySpecialLine,
    onFootSneakerLines,
    multiImageConsistencyLine: input.multiImageMode ? multiImageHumanAndSneakerConsistencyLine : "",
    negativePhrases: getNegativePhrases(poseCategory, input.hasShoe)
  };
}
