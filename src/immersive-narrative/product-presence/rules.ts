import type { ProductPresenceLevel, ProductPresenceRule } from "./types";

export const PRODUCT_PRESENCE_RULES: ProductPresenceRule[] = [
  {
    topic: "after_work_home",
    label: "Return home",
    baseline: ["INCIDENTAL", "READABLE", "READABLE", "HERO", "ABSENT"],
    description: "Walking home and the threshold pause naturally carry footwear evidence.",
  },
  {
    topic: "errand_outing",
    label: "Leaving home",
    baseline: ["ABSENT", "INCIDENTAL", "READABLE", "HERO", "INCIDENTAL"],
    description: "The indoor departure gives way to a readable outdoor continuation.",
  },
  {
    topic: "bookstore_browse",
    label: "Bookstore visit",
    baseline: ["INCIDENTAL", "READABLE", "INCIDENTAL", "READABLE", "ABSENT"],
    description: "The bookstore remains a life observation; no HERO is required.",
  },
  {
    topic: "waiting_for_friend",
    label: "Waiting",
    baseline: ["READABLE", "INCIDENTAL", "READABLE", "HERO", "INCIDENTAL"],
    description: "Waiting at an entrance can support a readable, then evidence-led, pause.",
  },
  {
    topic: "afternoon_cafe",
    label: "Cafe arrival",
    baseline: ["INCIDENTAL", "READABLE", "ABSENT", "READABLE", "INCIDENTAL"],
    description: "The cafe action is primarily observational and does not require HERO.",
  },
  {
    topic: "returning_with_purchases",
    label: "Returning with purchases",
    baseline: ["READABLE", "READABLE", "INCIDENTAL", "HERO", "ABSENT"],
    description: "Carrying and handling the bag can support product evidence without changing the story.",
  },
  {
    topic: "weekend_alone",
    label: "Weekend alone",
    baseline: ["ABSENT", "INCIDENTAL", "READABLE", "READABLE", "ABSENT"],
    description: "Quiet private time carries light footwear evidence without turning the room into a product scene.",
  },
  {
    topic: "after_school_pickup",
    label: "After school pickup",
    baseline: ["INCIDENTAL", "READABLE", "INCIDENTAL", "READABLE", "ABSENT"],
    description: "The adult homeward transition keeps the route and lived experience primary.",
  },
  {
    topic: "weekend_walk",
    label: "Weekend walk",
    baseline: ["INCIDENTAL", "READABLE", "READABLE", "INCIDENTAL", "ABSENT"],
    description: "An easy neighborhood walk naturally carries readable footwear during movement.",
  },
  {
    topic: "after_lunch",
    label: "After lunch",
    baseline: ["ABSENT", "INCIDENTAL", "READABLE", "READABLE", "INCIDENTAL"],
    description: "The post-lunch interval stays primarily environmental, with product evidence appearing naturally on the move.",
  },
  {
    topic: "city_wandering",
    label: "City wandering",
    baseline: ["INCIDENTAL", "READABLE", "INCIDENTAL", "READABLE", "ABSENT"],
    description: "Urban movement supports readable footwear without turning the block into a fashion walk.",
  },
  {
    topic: "evening_return_home",
    label: "Evening return home",
    baseline: ["READABLE", "INCIDENTAL", "READABLE", "READABLE", "ABSENT"],
    description: "The evening route and entry threshold carry product evidence without workday framing.",
  },
  {
    topic: "short_local_trip",
    label: "Short local trip",
    baseline: ["INCIDENTAL", "READABLE", "INCIDENTAL", "READABLE", "ABSENT"],
    description: "The short local move keeps product evidence natural and avoids travel-film emphasis.",
  },
];

export const PRODUCT_PRESENCE_REQUIREMENTS: Record<ProductPresenceLevel, {
  visibilityRequired: boolean;
  fullShoeRequired: boolean;
  heroEvidenceRequired: boolean;
}> = {
  ABSENT: { visibilityRequired: false, fullShoeRequired: false, heroEvidenceRequired: false },
  INCIDENTAL: { visibilityRequired: false, fullShoeRequired: false, heroEvidenceRequired: false },
  READABLE: { visibilityRequired: true, fullShoeRequired: true, heroEvidenceRequired: false },
  HERO: { visibilityRequired: true, fullShoeRequired: true, heroEvidenceRequired: true },
};
