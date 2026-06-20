export type CameraLookName = "Leica" | "Hasselblad" | "Fujifilm" | "Sony";

export type CameraLookProfile = {
  cameraLookLine: string;
  cameraNegativeLine: string;
};

export const cameraLookProfiles: Record<CameraLookName, CameraLookProfile> = {
  Leica: {
    cameraLookLine:
      "Use an observational street-photography capture: natural contrast, realistic city depth, restrained micro-shadows, believable skin tone, and quiet documentary timing without heavy grading.",
    cameraNegativeLine:
      "overly cinematic, fake film grain, harsh contrast, fashion-week street style, aggressive wide angle"
  },
  Hasselblad: {
    cameraLookLine:
      "Use a tactile editorial still-life capture: calm tonal structure, refined material depth, soft highlight control, accurate product scale, and physical texture without glossy advertising shine.",
    cameraNegativeLine:
      "CGI render, luxury ad glare, excessive sharpness, floating product, fake studio perfection"
  },
  Fujifilm: {
    cameraLookLine:
      "Use a soft daily color capture: gentle natural color, believable skin tone, warm-neutral highlights, relaxed texture, and restrained optical softness without a sugary preset.",
    cameraNegativeLine:
      "sweet filter, overexposed pastel, fake film preset, posed selfie lighting, low-end lifestyle filter"
  },
  Sony: {
    cameraLookLine:
      "Use clean modern documentary clarity: crisp but natural detail, controlled highlights, realistic skin and fabric texture, stable focus, and believable daily movement without over-sharpening.",
    cameraNegativeLine:
      "over-sharpened digital look, cold electronic color, glossy commercial lighting, sports campaign sharpness, harsh HDR, plastic skin, sterile product-demo mood"
  }
};
