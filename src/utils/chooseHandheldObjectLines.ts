import type {
  TeamGarmentTypePreference,
  TeamHumanPoseCategory,
  TeamImageType,
  TeamPromptMode,
  TeamScenePreference
} from "../types";
import {
  bagAntiClippingLine,
  bookMagazineAntiClippingLine,
  coffeeCupAntiClippingLine,
  flowerBouquetAntiClippingLine,
  handheldObjectAntiClippingCoreLine,
  handheldObjectNegativePhrases,
  handheldObjectShoeVisibilityLine,
  handheldObjectSimplicityLine,
  mirrorHandheldObjectNegativePhrases,
  naturalGripContactLine,
  objectWeightRealismLine,
  paperShoppingBagAntiClippingLine,
  phoneAntiClippingLine,
  singlePrimaryHandheldObjectHardRule,
  waterBottleGymObjectAntiClippingLine,
  wristArmObjectSpacingLine,
  type PrimaryHandheldObject
} from "../data/handheldObjectProfiles";
import {
  chooseSinglePrimaryHandheldObject,
  type SinglePrimaryHandheldObjectOutput
} from "./chooseSinglePrimaryHandheldObject";

export type HandheldObjectLinesInput = {
  scenePreference: TeamScenePreference;
  imageType: TeamImageType;
  actionType?: string;
  userExtraRequirement: string;
  selectedOutfitLine: string;
  selectedAccessoryLine?: string;
  garmentTypePreference: TeamGarmentTypePreference;
  poseCategory: TeamHumanPoseCategory;
  promptMode: TeamPromptMode;
  hasShoe: boolean;
  singlePrimaryHandheldObject?: SinglePrimaryHandheldObjectOutput;
};

export type HandheldObjectLinesOutput = SinglePrimaryHandheldObjectOutput & {
  handheldCoreLine: string;
  gripLine: string;
  spacingLine: string;
  weightLine: string;
  objectSpecificLine: string;
  shoeVisibilityLine: string;
  simplicityLine: string;
  accessoryOnlyLine: string;
  negativePhrases: string[];
};

const PEOPLE_IMAGE_TYPES: TeamImageType[] = ["产品上脚图", "对镜穿搭图", "生活场景图"];

function emptyHandheldObjectLines(): HandheldObjectLinesOutput {
  return {
    primaryHandheldObject: "",
    removedHandheldObjects: [],
    accessoryOnlyObjects: [],
    handheldObjectLine: "",
    fallbackReason: "",
    handheldCoreLine: "",
    gripLine: "",
    spacingLine: "",
    weightLine: "",
    objectSpecificLine: "",
    shoeVisibilityLine: "",
    simplicityLine: "",
    accessoryOnlyLine: "",
    negativePhrases: []
  };
}

function getObjectSpecificLine(primary: PrimaryHandheldObject | "") {
  if (primary === "coffee cup") return coffeeCupAntiClippingLine;
  if (primary === "small or medium flower bouquet") return flowerBouquetAntiClippingLine;
  if (primary === "book or magazine") return bookMagazineAntiClippingLine;
  if (primary === "phone") return phoneAntiClippingLine;
  if (primary === "water bottle" || primary === "light dumbbell" || primary === "towel held in hand") {
    return waterBottleGymObjectAntiClippingLine;
  }
  if (primary === "small bakery paper bag" || primary === "small shopping bag") return paperShoppingBagAntiClippingLine;
  if (
    primary === "structured tote held by hand" ||
    primary === "gym tote held by hand" ||
    primary === "travel tote held by hand" ||
    primary === "small handbag held by hand" ||
    primary === "small luggage handle"
  ) {
    return bagAntiClippingLine;
  }
  if (primary === "umbrella" || primary === "sunglasses held in hand" || primary === "hat held in hand") {
    return "If holding a small accessory, keep it simple, clearly gripped, correctly scaled, and separated from fingers, sleeves, torso, legs, and sneakers.";
  }

  return "";
}

export function chooseHandheldObjectLines(input: HandheldObjectLinesInput): HandheldObjectLinesOutput {
  if (!PEOPLE_IMAGE_TYPES.includes(input.imageType)) return emptyHandheldObjectLines();

  const selected = input.singlePrimaryHandheldObject ?? chooseSinglePrimaryHandheldObject(input);
  const hasPrimary = Boolean(selected.primaryHandheldObject);

  return {
    ...selected,
    handheldCoreLine: hasPrimary ? handheldObjectAntiClippingCoreLine : "",
    gripLine: hasPrimary ? naturalGripContactLine : "",
    spacingLine: hasPrimary ? wristArmObjectSpacingLine : "",
    weightLine: hasPrimary ? objectWeightRealismLine : "",
    objectSpecificLine: getObjectSpecificLine(selected.primaryHandheldObject),
    shoeVisibilityLine: hasPrimary && input.hasShoe ? handheldObjectShoeVisibilityLine : "",
    simplicityLine: hasPrimary ? `${singlePrimaryHandheldObjectHardRule} ${handheldObjectSimplicityLine}` : "",
    accessoryOnlyLine: selected.accessoryOnlyObjects.join(" "),
    negativePhrases: [
      ...handheldObjectNegativePhrases,
      ...(input.poseCategory === "mirror" ? mirrorHandheldObjectNegativePhrases : [])
    ]
  };
}
