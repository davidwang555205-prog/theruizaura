export type CameraLookName = "Leica" | "Hasselblad" | "Fujifilm" | "Sony";

export type CameraLookProfile = {
  cameraLookLine: string;
  cameraNegativeLine: string;
};

export const cameraLookProfiles: Record<CameraLookName, CameraLookProfile> = {
  Leica: {
    cameraLookLine:
      "Use a Leica-inspired real street photography look: natural contrast, realistic city depth, clean micro-shadows, believable skin tone, and quiet daily documentary elegance without heavy cinematic grading.",
    cameraNegativeLine:
      "overly cinematic, fake film grain, harsh contrast, fashion-week street style, aggressive wide angle"
  },
  Hasselblad: {
    cameraLookLine:
      "Use a Hasselblad-inspired premium stillness look: calm tonal structure, refined material depth, soft highlight control, clean product scale, and tactile texture without CGI render feeling or glossy advertising shine.",
    cameraNegativeLine:
      "CGI render, luxury ad glare, excessive sharpness, floating product, fake studio perfection"
  },
  Fujifilm: {
    cameraLookLine:
      "Use a Fujifilm-inspired soft daily color look: gentle natural color, soft skin tone, warm-neutral highlights, relaxed daily texture, and subtle film-like softness without sugary filter or overexposed whites.",
    cameraNegativeLine:
      "sweet filter, overexposed pastel, fake film preset, beauty selfie lighting, low-end lifestyle filter"
  },
  Sony: {
    cameraLookLine:
      "Use a Sony-inspired clean modern clarity look: crisp but natural detail, clean autofocus feeling, controlled highlights, realistic skin and fabric texture, modern urban clarity, and stable daily action capture without over-sharpening or commercial sports-ad lighting.",
    cameraNegativeLine:
      "over-sharpened digital look, cold electronic color, glossy commercial lighting, sports campaign sharpness, harsh HDR, plastic skin, sterile product-demo mood"
  }
};
