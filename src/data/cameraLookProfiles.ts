export type CameraLookName = "Leica" | "Hasselblad" | "Fujifilm";

export const cameraLookProfiles: Record<CameraLookName, string> = {
  Leica:
    "Use a Leica-inspired real street feel: natural 35mm perspective, gentle micro-contrast, realistic skin texture, quiet shadows, and low-saturation color.",
  Hasselblad:
    "Use a Hasselblad-inspired premium feel: calm medium-format depth, precise material texture, soft tonal transitions, clean color, and natural shadows.",
  Fujifilm:
    "Use a Fujifilm-inspired soft daily color feel: gentle film-like tones, natural skin color, soft contrast, muted warm highlights, and subtle grain."
};
