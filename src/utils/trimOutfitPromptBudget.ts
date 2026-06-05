export const outfitPromptBudget = {
  outfitLine: 320,
  stylingRealismLine: 240,
  total: 620
};

function trimAtSentenceBoundary(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  const trimmed = text.slice(0, maxLength).replace(/\s+\S*$/, "").trim();
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function shortenStylingRealism(text: string) {
  if (text.length <= outfitPromptBudget.stylingRealismLine) return text;

  return "Keep the styling grounded, wearable, naturally photogenic, and not over-arranged, with believable fabric folds and one clear visual anchor.";
}

export function trimOutfitPromptBudget(input: {
  outfitLine: string;
  stylingRealismLine: string;
  userRequiredText?: string[];
}) {
  const outfitLine = trimAtSentenceBoundary(input.outfitLine, outfitPromptBudget.outfitLine);
  let stylingRealismLine = shortenStylingRealism(input.stylingRealismLine);

  if (outfitLine.length + stylingRealismLine.length > outfitPromptBudget.total) {
    stylingRealismLine = trimAtSentenceBoundary(stylingRealismLine, Math.max(80, outfitPromptBudget.total - outfitLine.length));
  }

  return {
    outfitLine,
    stylingRealismLine
  };
}
