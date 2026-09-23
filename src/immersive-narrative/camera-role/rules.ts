import type { CameraNarrativeRule } from "./types";

export const CAMERA_NARRATIVE_RULES: CameraNarrativeRule[] = [
  {
    topicId: "after_work_home",
    label: "Return home",
    baseline: ["WAITING_CAMERA", "FOLLOWER", "OBSERVER", "OBSERVER", "AFTER_ACTION"],
    description: "A prepositioned entry, a natural follow, a stationary threshold, and an after-action ending.",
  },
  {
    topicId: "weekend_alone",
    label: "Weekend alone",
    baseline: ["OBSERVER", "OBSERVER", "FOLLOWER", "OBSERVER", "AFTER_ACTION"],
    description: "Quiet observation with one small movement and a private aftertaste.",
  },
  {
    topicId: "errand_outing",
    label: "Errand outing",
    baseline: ["OBSERVER", "WAITING_CAMERA", "FOLLOWER", "FOLLOWER", "OBSERVER"],
    description: "Preparation, threshold release, local movement, and a stable arrival.",
  },
  {
    topicId: "waiting_for_friend",
    label: "Waiting for a friend",
    baseline: ["OBSERVER", "OBSERVER", "PARTIAL_OBSERVATION", "OBSERVER", "AFTER_ACTION"],
    description: "Patient observation with one partial body detail while the wait settles.",
  },
  {
    topicId: "afternoon_cafe",
    label: "Afternoon cafe",
    baseline: ["WAITING_CAMERA", "OBSERVER", "PARTIAL_OBSERVATION", "OBSERVER", "AFTER_ACTION"],
    description: "The subject enters the cafe, completes one small interaction, and leaves a quiet aftertaste.",
  },
  {
    topicId: "bookstore_browse",
    label: "Bookstore browse",
    baseline: ["FOLLOWER", "OBSERVER", "OBSERVER", "PARTIAL_OBSERVATION", "AFTER_ACTION"],
    description: "The approach is followed, then the browsing slows into observation and one partial notice.",
  },
  {
    topicId: "returning_with_purchases",
    label: "Returning with purchases",
    baseline: ["FOLLOWER", "WAITING_CAMERA", "OBSERVER", "PARTIAL_OBSERVATION", "AFTER_ACTION"],
    description: "A carried movement, a prepositioned threshold, and one partial bag-handle adjustment.",
  },
  {
    topicId: "after_school_pickup",
    label: "After school pickup",
    baseline: ["FOLLOWER", "OBSERVER", "FOLLOWER", "OBSERVER", "AFTER_ACTION"],
    description: "The adult woman remains the subject while the camera observes a steady homeward route.",
  },
  {
    topicId: "weekend_walk",
    label: "Weekend walk",
    baseline: ["WAITING_CAMERA", "FOLLOWER", "FOLLOWER", "OBSERVER", "AFTER_ACTION"],
    description: "A quiet route observed through ordinary walking, without runway tracking.",
  },
  {
    topicId: "after_lunch",
    label: "After lunch",
    baseline: ["WAITING_CAMERA", "FOLLOWER", "OBSERVER", "FOLLOWER", "AFTER_ACTION"],
    description: "A threshold exit, a short directional walk, and a second movement before settling.",
  },
  {
    topicId: "city_wandering",
    label: "City wandering",
    baseline: ["FOLLOWER", "OBSERVER", "FOLLOWER", "PARTIAL_OBSERVATION", "AFTER_ACTION"],
    description: "Ordinary block movement with one partial urban observation, not a street-style editorial chase.",
  },
  {
    topicId: "evening_return_home",
    label: "Evening return home",
    baseline: ["FOLLOWER", "WAITING_CAMERA", "OBSERVER", "OBSERVER", "AFTER_ACTION"],
    description: "The familiar evening route is followed before the camera waits at the private threshold.",
  },
  {
    topicId: "short_local_trip",
    label: "Short local trip",
    baseline: ["WAITING_CAMERA", "FOLLOWER", "OBSERVER", "WAITING_CAMERA", "AFTER_ACTION"],
    description: "A local departure and arrival observed without travel-film grammar.",
  },
];
