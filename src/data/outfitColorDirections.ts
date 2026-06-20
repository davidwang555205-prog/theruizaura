import type { TeamColorDirection } from "../types";

export const outfitColorDirections: Record<TeamColorDirection, string> = {
  lightClean: "cream white, warm ivory, pale beige, soft grey, and light khaki",
  neutralDaily: "oatmeal, grey-blue, soft stone, linen brown, sand, and muted taupe",
  darkAnchor: "black, charcoal, navy, dark coffee, deep olive, and restrained dark accents",
  softAccent: "misty blue, sage green, grey-pink, butter yellow, or one controlled high-saturation garment in cobalt blue, tomato red, forest green, or deep burgundy",
  denimBased: "light blue denim, dark blue denim, grey-blue denim, and clean white denim"
};

export const colorDirectionBoundary =
  "Keep the overall palette wearable and refined. One controlled high-saturation garment may act as the only visual anchor, while every other garment, bag, accessory, background, and styling detail stays neutral; never combine multiple saturated colors.";
