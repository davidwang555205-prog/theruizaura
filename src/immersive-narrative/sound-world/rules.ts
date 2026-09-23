import type { SoundWorldRule } from "./types";

export const SOUND_WORLD_RULES: SoundWorldRule[] = [
  {
    topic: "after_work_home",
    label: "Return home",
    dominantBaseline: ["FOOTWEAR", "ENVIRONMENT", "OBJECT", "OBJECT", "SILENCE"],
    description: "Hallway movement, key handling, door release, and returning room tone.",
  },
  {
    topic: "errand_outing",
    label: "Leaving home",
    dominantBaseline: ["HUMAN", "OBJECT", "FOOTWEAR", "ENVIRONMENT", "ENVIRONMENT"],
    description: "Entryway preparation, door opening, outdoor contact, and open street ambience.",
  },
  {
    topic: "bookstore_browse",
    label: "Bookstore visit",
    dominantBaseline: ["ENVIRONMENT", "FOOTWEAR", "ENVIRONMENT", "OBJECT", "ENVIRONMENT"],
    description: "Quiet street approach, threshold movement, browsing room tone, and paper contact.",
  },
  {
    topic: "waiting_for_friend",
    label: "Waiting",
    dominantBaseline: ["ENVIRONMENT", "HUMAN", "FOOTWEAR", "ENVIRONMENT", "SILENCE"],
    description: "Entrance ambience, body settling, small foot movement, and a quiet finish.",
  },
  {
    topic: "afternoon_cafe",
    label: "Cafe arrival",
    dominantBaseline: ["ENVIRONMENT", "OBJECT", "ENVIRONMENT", "HUMAN", "ENVIRONMENT"],
    description: "Interior room tone, counter contact, pocket movement, and the continuing cafe atmosphere.",
  },
  {
    topic: "returning_with_purchases",
    label: "Returning with purchases",
    dominantBaseline: ["FOOTWEAR", "OBJECT", "OBJECT", "HUMAN", "SILENCE"],
    description: "Bag carry, entry threshold handling, grip adjustment, and final interior quiet.",
  },
  {
    topic: "weekend_alone",
    label: "Weekend alone",
    dominantBaseline: ["ENVIRONMENT", "HUMAN", "OBJECT", "ENVIRONMENT", "SILENCE"],
    description: "Room tone, small body movement, one handled object, and a quiet continuation.",
  },
  {
    topic: "after_school_pickup",
    label: "After school pickup",
    dominantBaseline: ["ENVIRONMENT", "FOOTWEAR", "ENVIRONMENT", "HUMAN", "ENVIRONMENT"],
    description: "Neighborhood ambience, ordinary foot contact, and a calm homeward route.",
  },
  {
    topic: "weekend_walk",
    label: "Weekend walk",
    dominantBaseline: ["ENVIRONMENT", "FOOTWEAR", "ENVIRONMENT", "FOOTWEAR", "SILENCE"],
    description: "Quiet route ambience, ordinary steps, and a settled outdoor ending.",
  },
  {
    topic: "after_lunch",
    label: "After lunch",
    dominantBaseline: ["ENVIRONMENT", "OBJECT", "FOOTWEAR", "ENVIRONMENT", "ENVIRONMENT"],
    description: "A street-level exit, small object or clothing cue, and the continuation of city ambience.",
  },
  {
    topic: "city_wandering",
    label: "City wandering",
    dominantBaseline: ["ENVIRONMENT", "FOOTWEAR", "ENVIRONMENT", "HUMAN", "ENVIRONMENT"],
    description: "Urban room tone, measured foot contact, and the continuing block atmosphere.",
  },
  {
    topic: "evening_return_home",
    label: "Evening return home",
    dominantBaseline: ["ENVIRONMENT", "FOOTWEAR", "OBJECT", "HUMAN", "SILENCE"],
    description: "Evening street ambience, ordinary steps, key contact, and a quiet entry resolution.",
  },
  {
    topic: "short_local_trip",
    label: "Short local trip",
    dominantBaseline: ["OBJECT", "FOOTWEAR", "ENVIRONMENT", "OBJECT", "ENVIRONMENT"],
    description: "Small-item handling, short foot contact, and the continuing nearby city atmosphere.",
  },
];
