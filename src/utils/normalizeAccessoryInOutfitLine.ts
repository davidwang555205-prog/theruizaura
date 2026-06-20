import type { AccessoryStrategy } from "../data/accessoryProfiles";

type NormalizeAccessoryInOutfitLineInput = {
  outfitLine: string;
  accessoryStrategy: AccessoryStrategy;
  selectedBagAccessory?: string | null;
  selectedPrimaryHandheldObject?: string | null;
};

const bagWords =
  "(?:taupe|cream|canvas|woven|black|small|structured|practical|no-logo|light tan|grey|pale grey|muted brown|soft beige|beige|travel|gym|secondary|daily|refined|leather|shoulder|crossbody|handheld|hand-held|tote|handbag|bag|travel bag|gym bag|shopping bag|paper bag|bakery paper bag|luggage)";

const bagClausePatterns = [
  /,?\s*(?:and\s+)?(?:a\s+)?(?:[\w-]+\s+){0,6}(?:tote|handbag|shoulder bag|crossbody bag|woven bag|canvas tote|structured tote|travel tote|gym tote|shopping bag|paper bag|bakery paper bag)\b(?:\s+as\s+a\s+secondary\s+accessory)?(?:\s+for\s+)?/gi,
  new RegExp(`,?\\s*(?:and\\s+)?a\\s+${bagWords}(?:\\s+${bagWords}){0,5}\\s+as\\s+a\\s+secondary\\s+accessory`, "gi"),
  new RegExp(`,?\\s*(?:and\\s+)?a\\s+${bagWords}(?:\\s+${bagWords}){0,5}\\s+for\\s+`, "gi"),
  /\s+with\s+a\s+(?:(?:taupe|cream|canvas|woven|black|small|structured|practical|light tan|grey|pale grey|muted brown|soft beige|beige|travel|gym|secondary|daily|refined|leather|shoulder|crossbody|handheld|hand-held)\s+){0,5}(?:tote|handbag|shoulder bag|crossbody bag|woven bag|canvas tote|structured tote|travel tote|gym tote|shopping bag|paper bag|bakery paper bag)\b/gi,
  /,?\s*(?:and\s+)?(?:a\s+)?(?:structured|canvas|cream|black|woven|taupe|light tan|grey|muted brown|small|travel|gym|secondary|leather|shoulder|crossbody)?\s*(?:tote|handbag|shoulder bag|crossbody bag|woven bag|canvas tote|structured tote|travel tote|gym tote|shopping bag|paper bag|bakery paper bag)\b(?:\s+as\s+a\s+secondary\s+accessory)?/gi
];

const primaryHandheldBagPatterns = [
  /\bhand[-\s]?held\s+(?:structured\s+)?(?:tote|handbag|bag)\b/gi,
  /\bcarrying\s+(?:a\s+)?(?:structured\s+)?(?:tote|handbag|bag)\b/gi,
  /\bholding\s+(?:a\s+)?(?:structured\s+)?(?:tote|handbag|bag)\b/gi
];

function cleanupLine(line: string) {
  return line
    .replace(/\s+,/g, ",")
    .replace(/,\s*,/g, ",")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+and\s+for\s+/gi, " for ")
    .replace(/,\s+and\s+for\s+/gi, " for ")
    .replace(/,\s+for\s+/gi, " for ")
    .replace(/\s+for\s+for\s+/gi, " for ")
    .replace(/\b(?:structured|no-logo|soft beige|muted brown|taupe|cream|black|small|practical|refined|leather)\s+for\s+/gi, "for ")
    .replace(/\s+\./g, ".")
    .replace(/\s+;/g, ";")
    .trim();
}

function removeBagWording(line: string) {
  return cleanupLine(
    bagClausePatterns.reduce((output, pattern) => output.replace(pattern, (match) => {
      if (/\s+for\s+$/i.test(match)) return " for ";
      return "";
    }), line)
  );
}

function downshiftHandHeldBag(line: string) {
  return cleanupLine(
    primaryHandheldBagPatterns.reduce(
      (output, pattern) => output.replace(pattern, "a secondary shoulder or side bag"),
      line
    )
  );
}

function removeConflictingPrimaryObjects(line: string) {
  return cleanupLine(
    line
      .replace(/,?\s*(?:and\s+)?(?:a\s+)?(?:coffee cup|flowers?|flower bouquet|book|magazine|water bottle|phone)\b/gi, "")
      .replace(/,?\s*(?:and\s+)?(?:a\s+)?(?:small\s+)?(?:bakery\s+)?paper bag\b/gi, "")
  );
}

export function normalizeAccessoryInOutfitLine(input: NormalizeAccessoryInOutfitLineInput) {
  let line = cleanupLine(input.outfitLine);

  if (!line) return line;

  if (input.accessoryStrategy === "noAccessory" || input.accessoryStrategy === "wearableOnly" || input.accessoryStrategy === "handheldOnly") {
    return removeBagWording(line);
  }

  if (input.accessoryStrategy === "bagAsSecondaryAccessory" || input.accessoryStrategy === "minimalMixed") {
    line = downshiftHandHeldBag(line);
    if (!/\b(bag|tote|handbag|crossbody)\b/i.test(line) && input.selectedBagAccessory) {
      line = `${line} Use a ${input.selectedBagAccessory} only as a secondary shoulder or side accessory, never hand-held.`;
    }
    return cleanupLine(line);
  }

  if (input.accessoryStrategy === "bagAsPrimaryHandheldObject") {
    line = removeConflictingPrimaryObjects(line);
    if (!/\b(bag|tote|handbag)\b/i.test(line) && input.selectedBagAccessory) {
      line = `${line} Use one ${input.selectedBagAccessory} as the only primary handheld object.`;
    }
    return cleanupLine(line);
  }

  return line;
}
