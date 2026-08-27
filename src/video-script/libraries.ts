export const VIDEO_MOTION_LIBRARY = {
  still_breath: "Keep the subject nearly still with only believable micro-movement: breathing, small fabric settling, subtle hand or foot adjustment, and natural environmental motion.",
  slow_walk: "Use a calm natural walking phase with believable weight transfer, knee direction, outsole pressure, garment response, and grounded contact; never reshape the footwear.",
  settle_and_check: "Let the subject finish a small real-world action and settle: check the hem, sleeve, bag, doorway, mirror, or product naturally without posing for a product display.",
  product_read: "Keep movement minimal while the product remains clearly readable; allow only physically plausible upper flex, lace settling, collar compression, contact shadow, and material response.",
  environment_only: "No forced subject action. Let sourced light, fabric, foliage, steam, curtain, reflections, or passersby provide restrained environmental motion without stealing focus.",
} as const;

export const VIDEO_CAMERA_LIBRARY = {
  locked_observation: "Mostly locked observational camera with tiny human-operated drift; no artificial orbit, whip pan, crash zoom, or gimbal-showreel movement.",
  slow_push: "Very slow restrained push-in, keeping perspective natural and the product geometry stable.",
  gentle_track: "Short gentle lateral or forward tracking move matched to the subject's real motion; avoid parallax exaggeration.",
  low_product_follow: "Low restrained follow for a short product-readable walking phase; keep the full shoe geometry stable and grounded.",
  detail_hold: "Short stable detail hold with only minimal reframing; do not turn the product into an e-commerce spin or macro spectacle.",
} as const;

export type VideoMotionId = keyof typeof VIDEO_MOTION_LIBRARY;
export type VideoCameraId = keyof typeof VIDEO_CAMERA_LIBRARY;
