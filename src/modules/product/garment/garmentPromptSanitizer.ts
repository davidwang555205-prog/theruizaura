const shoePrimaryPhrases = [/THERUIZ AURA German trainer/gi, /sneaker as the main product/gi, /uploaded sneaker reference/gi, /toe box/gi, /outsole/gi, /shoe panels/gi, /both sneakers clearly readable/gi, /sneaker deformation/gi];
const legacyGarmentOutfitLines = [
  /Style her in a white cotton shirt, cream straight trousers, a light beige shirt jacket, and a taupe shoulder bag as a secondary accessory for clean THERUIZ AURA daily polish\.\s*/gi,
  /Keep it suitable for commute, with clear sneaker readability\.\s*/gi
];
export function sanitizeGarmentPrompt(prompt: string) {
  const withoutLegacyOutfit = legacyGarmentOutfitLines.reduce((value, pattern) => value.replace(pattern, ""), prompt);
  return shoePrimaryPhrases.reduce((value, pattern) => value.replace(pattern, "the uploaded garment"), withoutLegacyOutfit);
}
