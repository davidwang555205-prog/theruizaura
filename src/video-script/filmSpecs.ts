import type { FilmSpec, VideoDuration, VideoSceneSpec } from "./contracts";

function build10sFilmSpec(scene: VideoSceneSpec): FilmSpec {
  const person = scene.personPresent;
  return {
    version: "theruiz-film-v1",
    duration: 10,
    rhythm: "Three-beat short film: immediate orientation, one readable lived action, then a quiet product-resolved ending. Do not compress a longer four-shot structure.",
    shots: [
      {
        id: "10A",
        start: 0,
        end: 2.6,
        role: "establish",
        motionId: person ? "still_breath" : "environment_only",
        cameraId: "locked_observation",
        direction: `Open inside ${scene.scene} with the ${scene.season} atmosphere already established. Read the lived situation immediately; avoid an empty beauty intro.`,
        productRule: "If product is present, it may be visible naturally but does not need a hero close-up yet.",
      },
      {
        id: "10B",
        start: 2.6,
        end: 7.2,
        role: person ? "action" : "product_evidence",
        motionId: person ? "slow_walk" : "product_read",
        cameraId: person ? "gentle_track" : "slow_push",
        direction: person
          ? "Use one simple continuous lived action only. Keep body mechanics, garment response, hand contact, foot placement, and environment interaction believable."
          : "Reveal the product through restrained real-world material and environmental motion, not a turntable or artificial object animation.",
        productRule: "This is the main product-readable phase. Keep at least one complete shoe readable from toe to heel whenever footwear is present.",
      },
      {
        id: "10C",
        start: 7.2,
        end: 10,
        role: "resolve",
        motionId: person ? "settle_and_check" : "environment_only",
        cameraId: "detail_hold",
        direction: "Resolve on a calm believable final moment rather than a hard commercial pose. The last frame should feel usable as a natural brand still.",
        productRule: "Finish with stable product geometry, grounded contact, and no late morphing or perspective change.",
      },
    ],
  };
}

function build15sFilmSpec(scene: VideoSceneSpec): FilmSpec {
  const person = scene.personPresent;
  return {
    version: "theruiz-film-v1",
    duration: 15,
    rhythm: "Four-beat observational film: spatial orientation, lived movement, dedicated product evidence, then emotional resolution. The extra time creates a distinct evidence beat rather than stretched timing.",
    shots: [
      {
        id: "15A",
        start: 0,
        end: 3.4,
        role: "establish",
        motionId: person ? "still_breath" : "environment_only",
        cameraId: "locked_observation",
        direction: `Establish ${scene.scene} as a real ${scene.season} lived environment with sourced light, material depth, and a clear human-scale spatial relationship.`,
        productRule: "Product may enter naturally; do not front-load a product hero composition.",
      },
      {
        id: "15B",
        start: 3.4,
        end: 7.6,
        role: "action",
        motionId: person ? "slow_walk" : "environment_only",
        cameraId: person ? "gentle_track" : "slow_push",
        direction: person
          ? "Let one everyday action unfold with a beginning and completion. Keep the gesture modest, unperformed, and physically connected to the scene."
          : "Let real environmental movement establish the usage context before the product evidence beat.",
        productRule: "Do not sacrifice product geometry for dramatic movement or camera energy.",
      },
      {
        id: "15C",
        start: 7.6,
        end: 11.8,
        role: "product_evidence",
        motionId: "product_read",
        cameraId: person ? "low_product_follow" : "detail_hold",
        direction: "Create a dedicated, restrained product-read beat. It must still feel like part of the same lived moment, not a cutaway e-commerce insert.",
        productRule: "Preserve toe box, panel relationships, outsole profile, color blocking, material zones, laces, collar, and heel exactly as confirmed by references.",
      },
      {
        id: "15D",
        start: 11.8,
        end: 15,
        role: "resolve",
        motionId: person ? "settle_and_check" : "environment_only",
        cameraId: "locked_observation",
        direction: "Return to the full lived moment and let it settle. End with quiet confidence and real physical continuity, not a logo sting or exaggerated product pose.",
        productRule: "Keep product identity and scale unchanged through the final frame.",
      },
    ],
  };
}

export function buildFilmSpec(duration: VideoDuration, scene: VideoSceneSpec): FilmSpec {
  return duration === 10 ? build10sFilmSpec(scene) : build15sFilmSpec(scene);
}

export function validateFilmSpec(spec: FilmSpec): string[] {
  const diagnostics: string[] = [];
  const first = spec.shots[0];
  const last = spec.shots[spec.shots.length - 1];
  if (!first || first.start !== 0) diagnostics.push("FILMSPEC_MUST_START_AT_ZERO");
  if (!last || last.end !== spec.duration) diagnostics.push("FILMSPEC_DURATION_MISMATCH");
  for (let index = 1; index < spec.shots.length; index += 1) {
    if (spec.shots[index - 1].end !== spec.shots[index].start) diagnostics.push("FILMSPEC_HAS_TIMELINE_GAP_OR_OVERLAP");
  }
  if (spec.duration === 10 && spec.shots.length !== 3) diagnostics.push("FILMSPEC_10S_REQUIRES_THREE_BEATS");
  if (spec.duration === 15 && spec.shots.length !== 4) diagnostics.push("FILMSPEC_15S_REQUIRES_FOUR_BEATS");
  return diagnostics;
}
