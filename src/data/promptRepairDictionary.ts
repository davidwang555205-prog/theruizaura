export type PromptRepairKey =
  | "shoesBlockedRepair"
  | "shoeDeformationRepair"
  | "longLegRepair"
  | "indoorLightRepair"
  | "outdoorLightRepair"
  | "mirrorLightRepair"
  | "noDefaultBagRepair"
  | "singleHandheldRepair"
  | "cityChinaRepair"
  | "seasonMismatchRepair"
  | "vocabularyRepair"
  | "cameraConflictRepair";

export type PromptRepair = {
  key: PromptRepairKey;
  line?: string;
  negativePhrases?: string[];
};

export const promptRepairDictionary: Record<PromptRepairKey, PromptRepair> = {
  shoesBlockedRepair: {
    key: "shoesBlockedRepair",
    line:
      "Keep at least one sneaker fully visible from toe to heel, with no bag, trouser hem, skirt edge, hand, object, shadow, or foreground element blocking the shoe.",
    negativePhrases: ["bag blocking sneakers", "foreground object covering shoes", "skirt edge hiding sneakers"]
  },
  shoeDeformationRepair: {
    key: "shoeDeformationRepair",
    line:
      "Preserve the selected THERUIZ AURA low-cut German trainer shape with a slim outsole, rounded toe box, clear panel structure, readable tongue, natural laces, and no running-shoe or chunky-sole transformation.",
    negativePhrases: ["running shoe transformation", "chunky sole", "generic sneaker shape"]
  },
  longLegRepair: {
    key: "longLegRepair",
    line:
      "Use natural body proportions with no long-leg effect, no tiny head, no stretched leg proportion, and no wide-angle body distortion.",
    negativePhrases: ["long-leg effect", "tiny head", "wide-angle body distortion"]
  },
  indoorLightRepair: {
    key: "indoorLightRepair",
    line:
      "Use soft indoor natural window light or believable indoor ambient light only; avoid outdoor street shadows inside the room.",
    negativePhrases: ["outdoor street shadows inside room", "studio backdrop indoors"]
  },
  outdoorLightRepair: {
    key: "outdoorLightRepair",
    line:
      "Use real outdoor natural street light with believable pavement shadows and no studio lighting or indoor window-only light.",
    negativePhrases: ["studio lighting outdoors", "indoor window-only light outdoors"]
  },
  mirrorLightRepair: {
    key: "mirrorLightRepair",
    line:
      "Use soft indoor natural window light with realistic mirror reflection, no harsh flash, no outdoor street shadows, and no long-leg mirror distortion.",
    negativePhrases: ["harsh flash mirror selfie", "outdoor street shadows in mirror", "long-leg mirror distortion"]
  },
  noDefaultBagRepair: {
    key: "noDefaultBagRepair",
    line:
      "Do not add a bag unless it supports the scene. No visible bag is acceptable when the outfit and action work better without accessories.",
    negativePhrases: ["bag in every image", "unnecessary bag"]
  },
  singleHandheldRepair: {
    key: "singleHandheldRepair",
    line:
      "Use only one primary handheld object. Remove all other handheld props or downgrade them to background or secondary non-handheld accessories.",
    negativePhrases: ["multiple primary handheld objects", "phone plus coffee", "coffee plus flowers"]
  },
  cityChinaRepair: {
    key: "cityChinaRepair",
    line:
      "Use a real Chinese city daily street, not European-looking streets, not foreign cafes, not tourist landmarks, and not staged city-promo scenery.",
    negativePhrases: ["European-looking streets", "foreign cafe", "tourist landmarks"]
  },
  seasonMismatchRepair: {
    key: "seasonMismatchRepair",
    line: "Keep the outfit, material weight, and light consistent with the selected season and city climate.",
    negativePhrases: ["wrong-season outfit", "seasonal mismatch"]
  },
  vocabularyRepair: {
    key: "vocabularyRepair",
    negativePhrases: ["opening wording", "generic pants wording"]
  },
  cameraConflictRepair: {
    key: "cameraConflictRepair",
    negativePhrases: ["multiple camera styles", "conflicting camera look"]
  }
};
