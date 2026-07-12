const shoePrimaryPhrases = [/THERUIZ AURA German trainer/gi, /sneaker as the main product/gi, /uploaded sneaker reference/gi, /toe box/gi, /outsole/gi, /shoe panels/gi, /both sneakers clearly readable/gi, /sneaker deformation/gi];
export function sanitizeGarmentPrompt(prompt: string) { return shoePrimaryPhrases.reduce((value, pattern) => value.replace(pattern, "the uploaded garment"), prompt); }
