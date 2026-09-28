import type { CameraNarrativeRule } from "./types";

export const CAMERA_NARRATIVE_RULES: CameraNarrativeRule[] = [
  {
    topicId: "after_work_home",
    label: "Return home",
    baseline: ["WAITING_CAMERA", "OBSERVER", "OBSERVER", "OBSERVER", "AFTER_ACTION"],
    description: "A prepositioned entry, near-static threshold observation, and an after-action ending.",
  },
  {
    topicId: "weekend_alone",
    label: "Weekend alone",
    baseline: ["OBSERVER", "OBSERVER", "OBSERVER", "OBSERVER", "AFTER_ACTION"],
    description: "Quiet near-static observation with one small movement and a private aftertaste.",
  },
  {
    topicId: "errand_outing",
    label: "Errand outing",
    baseline: ["OBSERVER", "WAITING_CAMERA", "OBSERVER", "OBSERVER", "OBSERVER"],
    description: "Preparation, threshold release, and stable near-static observation of the route.",
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
    baseline: ["OBSERVER", "OBSERVER", "OBSERVER", "PARTIAL_OBSERVATION", "AFTER_ACTION"],
    description: "The approach is observed without a follow, then the browsing slows into near-static observation and one partial notice.",
  },
  {
    topicId: "returning_with_purchases",
    label: "Returning with purchases",
    baseline: ["OBSERVER", "WAITING_CAMERA", "OBSERVER", "PARTIAL_OBSERVATION", "AFTER_ACTION"],
    description: "A carried movement observed near-statically, a prepositioned threshold, and one partial bag-handle adjustment.",
  },
  {
    topicId: "after_school_pickup",
    label: "After school pickup",
    baseline: ["OBSERVER", "OBSERVER", "OBSERVER", "OBSERVER", "AFTER_ACTION"],
    description: "The steady homeward route is observed from near-static positions without tracking.",
  },
  {
    topicId: "weekend_walk",
    label: "Weekend walk",
    baseline: ["WAITING_CAMERA", "OBSERVER", "OBSERVER", "OBSERVER", "AFTER_ACTION"],
    description: "A quiet route observed from near-static positions; the person walks through the frame instead of being tracked.",
  },
  {
    topicId: "after_lunch",
    label: "After lunch",
    baseline: ["WAITING_CAMERA", "OBSERVER", "OBSERVER", "OBSERVER", "AFTER_ACTION"],
    description: "A threshold exit and a short directional walk observed without travel tracking.",
  },
  {
    topicId: "city_wandering",
    label: "City wandering",
    baseline: ["OBSERVER", "OBSERVER", "OBSERVER", "PARTIAL_OBSERVATION", "AFTER_ACTION"],
    description: "Ordinary block movement observed from near-static positions, not a street-style editorial chase.",
  },
  {
    topicId: "evening_return_home",
    label: "Evening return home",
    baseline: ["OBSERVER", "WAITING_CAMERA", "OBSERVER", "OBSERVER", "AFTER_ACTION"],
    description: "The familiar evening route is observed near-statically before the camera waits at the private threshold.",
  },
  {
    topicId: "short_local_trip",
    label: "Short local trip",
    baseline: ["WAITING_CAMERA", "OBSERVER", "OBSERVER", "WAITING_CAMERA", "AFTER_ACTION"],
    description: "A local departure and arrival observed without travel-film grammar.",
  },
];
