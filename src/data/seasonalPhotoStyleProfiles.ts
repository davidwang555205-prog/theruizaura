export type SeasonKey = "spring" | "summer" | "autumn" | "winter";

export type SeasonalPhotoStyleProfile = {
  mood: string;
  photoStyleLine: string;
  negative: string;
};

export const seasonalPhotoStyleProfiles: Record<SeasonKey, SeasonalPhotoStyleProfile> = {
  spring: {
    mood: "clean, fresh, soft, airy, light but not pale",
    photoStyleLine:
      "Use a clean spring photo style with soft daylight, fresh low-saturation color, gentle shadows, light greenery, natural skin tone, and a quiet airy feeling without overexposure or sweet filter.",
    negative:
      "overly sweet pastel, staged cherry blossom mood, sugary filter, high-saturation flowers, tourist spring scenery"
  },
  summer: {
    mood: "bright, breathable, clear, warm-neutral, not hot and sweaty",
    photoStyleLine:
      "Use a breathable summer photo style with clean natural brightness, soft street shadows, warm-neutral whites, clear material texture, and a fresh daily feeling without harsh sun, sweaty mood, or over-saturated color.",
    negative:
      "harsh noon sun, sweaty mood, oily skin shine, tropical color, neon summer, beach vacation mood, overexposed pavement"
  },
  autumn: {
    mood: "warm, textured, layered, calm, slightly deeper",
    photoStyleLine:
      "Use a textured autumn photo style with warm-neutral natural light, gentle contrast, deeper material texture, muted brown-grey color depth, calm street shadows, and refined city warmth without orange filter or heavy vintage mood.",
    negative:
      "orange filter, heavy vintage mood, staged fallen-leaf cliché, overly yellow tone, pumpkin color mood, dramatic cinematic autumn"
  },
  winter: {
    mood: "quiet, crisp, layered, calm, clean, not cold-dead",
    photoStyleLine:
      "Use a quiet winter photo style with soft cool-neutral daylight, calm shadow structure, clean urban air, thicker fabric texture, muted grey-cream depth, and a composed daily mood without dark cinematic gloom or cold lifeless color.",
    negative:
      "dark gloomy winter, blue cold filter, snow-scene cliché, lifeless grey, night street mood, luxury winter ad, harsh flash"
  }
};
