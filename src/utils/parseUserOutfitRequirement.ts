import type { TeamGarmentTypePreference } from "../types";

export type ParsedUserOutfitRequirement = {
  hardExclusions: string[];
  softPreferences: string[];
  colorPreferences: string[];
  itemPreferences: string[];
  conflictWarnings: string[];
  resolvedGarmentTypePreference: TeamGarmentTypePreference;
};

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

export function parseUserOutfitRequirement(input: {
  userExtraRequirement?: string;
  garmentTypePreference: TeamGarmentTypePreference;
}): ParsedUserOutfitRequirement {
  const text = (input.userExtraRequirement ?? "").toLowerCase();
  const hardExclusions: string[] = [];
  const softPreferences: string[] = [];
  const colorPreferences: string[] = [];
  const itemPreferences: string[] = [];
  const conflictWarnings: string[] = [];
  let resolvedGarmentTypePreference = input.garmentTypePreference;

  if (includesAny(text, ["不要裙", "禁止裙", "不出现裙", "no skirt", "avoid skirt", "no dress", "不要连衣裙"])) {
    hardExclusions.push("skirt", "dress");
    if (input.garmentTypePreference === "裙装" || input.garmentTypePreference === "连衣裙") {
      resolvedGarmentTypePreference = "自动匹配";
      conflictWarnings.push("User requested skirt or dress in UI but excluded it in extra requirement. Extra requirement takes priority.");
    }
  }

  if (includesAny(text, ["不要短裤", "no shorts", "avoid shorts"])) {
    hardExclusions.push("shorts");
    if (input.garmentTypePreference === "短裤") {
      resolvedGarmentTypePreference = "自动匹配";
      conflictWarnings.push("User requested shorts in UI but excluded shorts in extra requirement. Extra requirement takes priority.");
    }
  }

  if (includesAny(text, ["不要全浅色", "no all light", "no all-light", "avoid all light", "not all beige"])) {
    hardExclusions.push("all-light outfit");
  }

  if (includesAny(text, ["不要黑色", "不要黑", "no black", "avoid black"])) {
    hardExclusions.push("black");
  }

  if (includesAny(text, ["不要手持物", "不要拿东西", "不拿东西", "no handheld", "no hand-held", "avoid handheld"])) {
    hardExclusions.push("handheldObject");
  }

  if (includesAny(text, ["不要运动", "no active", "avoid active", "不要轻运动"])) {
    hardExclusions.push("lightActive");
    if (input.garmentTypePreference === "轻运动") resolvedGarmentTypePreference = "自动匹配";
  }

  if (includesAny(text, ["不要太浅", "深一点", "深色锚点", "更深", "not too light", "darker", "dark anchor"])) {
    colorPreferences.push("darkAnchor");
    softPreferences.push("lessAllLight");
  }
  if (!includesAny(text, ["不要黑色", "不要黑", "no black", "avoid black"]) && includesAny(text, ["黑色", "black", "深色", "dark"])) {
    colorPreferences.push("darkAnchor", "black top");
  }
  if (includesAny(text, ["牛仔", "denim", "jeans"])) {
    colorPreferences.push("denimBased");
    itemPreferences.push("denim");
  }
  if (includesAny(text, ["雾蓝", "淡蓝", "蓝", "blue", "sage", "鼠尾草"])) colorPreferences.push("softAccent");
  if (includesAny(text, ["白衬衫", "white shirt"])) itemPreferences.push("white shirt");
  if (includesAny(text, ["针织", "knit"])) itemPreferences.push("knitwear");
  if (includesAny(text, ["短裤", "shorts", "bermuda"])) itemPreferences.push("shorts");
  if (includesAny(text, ["半裙", "skirt"])) itemPreferences.push("skirt");
  if (includesAny(text, ["连衣裙", "dress"])) itemPreferences.push("dress");
  if (includesAny(text, ["轻运动", "active", "gym", "健身"])) itemPreferences.push("lightActive");
  if (includesAny(text, ["轻博主", "小红书", "ootd", "blogger"])) softPreferences.push("bloggerLite");
  if (includesAny(text, ["通勤", "office", "commute"])) softPreferences.push("polishedCommuter");
  if (includesAny(text, ["更真实", "真实一点", "realistic", "more real", "less ai"])) softPreferences.push("realDaily");
  if (includesAny(text, ["不要太甜", "不甜", "less sweet", "not too sweet"])) softPreferences.push("lessSweet");

  return {
    hardExclusions: Array.from(new Set(hardExclusions)),
    softPreferences: Array.from(new Set(softPreferences)),
    colorPreferences: Array.from(new Set(colorPreferences)),
    itemPreferences: Array.from(new Set(itemPreferences)),
    conflictWarnings,
    resolvedGarmentTypePreference
  };
}
