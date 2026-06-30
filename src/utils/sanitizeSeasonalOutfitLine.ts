import type { Season } from "../data/perSceneOutfitLibrary";
import type { TeamSeason } from "../types";

function isSummerSeason(season: TeamSeason | Season) {
  return season === "夏" || season === "summer";
}

export function sanitizeSeasonalOutfitLine(line: string, season: TeamSeason | Season) {
  if (!line || !isSummerSeason(season)) return line;

  return line
    .replace(/\bivory cashmere short-sleeve knit\b/gi, "ivory silk-cotton short-sleeve top")
    .replace(/\bcashmere short-sleeve knit\b/gi, "silk-cotton short-sleeve top")
    .replace(/\bsoft grey short-sleeve knit\b/gi, "soft grey silk-cotton short-sleeve blouse")
    .replace(/\blight grey short-sleeve knit\b/gi, "light grey silk-cotton short-sleeve blouse")
    .replace(/\bsoft grey knit top\b/gi, "soft grey silk-cotton top")
    .replace(/\blight grey knit top\b/gi, "light grey silk-cotton top")
    .replace(/\bblack fine-knit top\b/gi, "black silk-cotton top")
    .replace(/\bnavy fine-knit top\b/gi, "navy mercerized-cotton top")
    .replace(/\bfine-knit or clean cotton top\b/gi, "silk-cotton or clean cotton top")
    .replace(/\boatmeal lightweight knit tee\b/gi, "oatmeal mercerized-cotton tee")
    .replace(/\boatmeal knit top\b/gi, "oatmeal cotton-poplin top")
    .replace(/\bcream knit top\b/gi, "cream cotton-poplin top")
    .replace(/\bclean knit top\b/gi, "clean cotton-poplin top")
    .replace(/\bsoft knit top\b/gi, "soft silk-cotton top")
    .replace(/\bsoft knit\b/gi, "soft silk-cotton top")
    .replace(/\brefined knit top\b/gi, "refined silk-cotton top")
    .replace(/\bquiet knit top\b/gi, "quiet silk-cotton top")
    .replace(/\bfine-knit top\b/gi, "fine silk-cotton top")
    .replace(/\bfine-knit\b/gi, "silk-cotton top")
    .replace(/\bknit top\b/gi, "silk-cotton top")
    .replace(/\bfine knit\b/gi, "silk-cotton top")
    .replace(/\bknit tee\b/gi, "mercerized-cotton tee")
    .replace(/\bknit polo\b/gi, "cotton polo")
    .replace(/\bpolo knit\b/gi, "cotton polo")
    .replace(/\bsleeveless knit top\b/gi, "sleeveless mercerized-cotton top")
    .replace(/\bsoft cardigan\b/gi, "light cotton overshirt")
    .replace(/\blight cardigan\b/gi, "light cotton overshirt")
    .replace(/\bthin cardigan\b/gi, "thin cotton overshirt")
    .replace(/\bsummer cardigan\b/gi, "light cotton overshirt")
    .replace(/\bcardigan\b/gi, "light cotton overshirt")
    .replace(/\bquiet knit set\b/gi, "quiet silk-cotton set")
    .replace(/\btravel-ready knit set\b/gi, "travel-ready cotton-poplin set")
    .replace(/\bfine-knit dress\b/gi, "silk-cotton dress")
    .replace(/\bknit dress\b/gi, "silk-cotton dress")
    .replace(/\bknitwear\b/gi, "breathable woven summer layers")
    .replace(/\bcashmere\b/gi, "silk-cotton")
    .replace(/\bwool coat\b/gi, "light woven jacket")
    .replace(/\bheavy coat\b/gi, "light woven layer")
    .replace(/\bturtleneck\b/gi, "clean cotton high-neck top");
}
