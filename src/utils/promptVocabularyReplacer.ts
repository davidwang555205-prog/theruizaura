const replacements: Array<[RegExp, string]> = [
  [/\blightly opening the shoe tongue\b/gi, "lightly lifting the shoe tongue"],
  [/\bopening a suitcase\b/gi, "unpacking a suitcase"],
  [/\bopening the suitcase\b/gi, "unpacking the suitcase"],
  [/\bopening suitcase\b/gi, "unpacking suitcase"],
  [/\bhot pants\b/gi, "tailored shorts"],
  [/\bshoe opening area\b/gi, "collar area"],
  [/\bshoe opening collapsing\b/gi, "collapsed sneaker collar"],
  [/\bopening of the shoe\b/gi, "sneaker collar and ankle entry"],
  [/\bshoe opening\b/gi, "sneaker collar"],
  [/\bfoot opening\b/gi, "ankle entry area"],
  [/\bnatural opening\b/gi, "natural ankle entry"],
  [/\bwide-leg pants\b/gi, "wide-leg trousers"],
  [/\bstraight pants\b/gi, "straight trousers"],
  [/\bivory pants\b/gi, "ivory straight trousers"],
  [/\bbeige pants\b/gi, "beige trousers"],
  [/\blight active pants\b/gi, "straight active trousers"],
  [/\bactive pants\b/gi, "active trousers"],
  [/\blinen pants\b/gi, "linen trousers"],
  [/\bwool pants\b/gi, "wool trousers"],
  [/\bsuit pants\b/gi, "tailored trousers"],
  [/\brelaxed pants\b/gi, "relaxed trousers"],
  [/\bpants\b/gi, "trousers"],
  [/\bopening\b/gi, "ankle entry area"]
];

export function promptVocabularyReplacer(prompt: string) {
  return replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), prompt);
}
