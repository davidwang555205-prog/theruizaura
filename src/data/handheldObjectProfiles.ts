export type PrimaryHandheldObject =
  | "coffee cup"
  | "small or medium flower bouquet"
  | "book or magazine"
  | "phone"
  | "water bottle"
  | "light dumbbell"
  | "small bakery paper bag"
  | "small shopping bag"
  | "structured tote held by hand"
  | "gym tote held by hand"
  | "travel tote held by hand"
  | "small handbag held by hand"
  | "small luggage handle"
  | "umbrella"
  | "sunglasses held in hand"
  | "hat held in hand"
  | "towel held in hand";

export const singlePrimaryHandheldObjectHardRule =
  "Use only one primary handheld object in each image. Do not combine coffee, flowers, books, paper bags, water bottles, phones, shopping bags, or hand-held totes in the same scene. If a bag is hand-held, it counts as the primary handheld object. Keep all other accessories secondary and not hand-held.";

export const handheldObjectAntiClippingCoreLine =
  "When the model holds an object, keep the object physically separated, clearly gripped, and naturally supported by the hand. The fingers, palm, wrist, object edge, clothing, bag strap, torso, legs, and sneakers must not merge, clip, float, or pass through each other.";

export const naturalGripContactLine =
  "Make the hand-object contact believable: fingers should wrap around or support the object with correct pressure, visible separation, natural finger spacing, and realistic wrist angle. Avoid fused fingers, melted edges, extra fingers, floating objects, or objects passing through the palm.";

export const wristArmObjectSpacingLine =
  "Keep the wrist, forearm, elbow, held object, sleeve, and torso spatially separated. The object should not cut through the wrist, forearm, sleeve, chest, waist, or bag strap, and the arm should not disappear behind the object unnaturally.";

export const objectWeightRealismLine =
  "Give handheld objects believable weight and gravity. Bags should hang downward from the hand or shoulder, flowers should rest naturally in the grip, paper bags should fold with weight, books should sit flat against the palm or body, bottles should align vertically, and cups should be held upright.";

export const handheldObjectShoeVisibilityLine =
  "No handheld object, bag, paper bag, flower bouquet, book, bottle, or strap should block, crop, or visually merge with the sneakers. Keep the lower legs and at least one full sneaker clearly visible from toe to heel.";

export const handheldObjectSimplicityLine =
  "Use only one primary handheld object unless the scene truly needs none. Keep the object simple, low-noise, and easy for the model to hold naturally. Avoid multiple overlapping props, complex straps, oversized bouquets, large shopping bags, or objects crossing the body and legs.";

export const coffeeCupAntiClippingLine =
  "If holding coffee or a drink, keep the cup upright, clearly separated from the fingers and palm, with a realistic grip around the cup or lid. The cup should not merge with fingers, cover the entire hand, float, tilt unnaturally, or pass through clothing.";

export const flowerBouquetAntiClippingLine =
  "If holding flowers, keep the bouquet small or medium, naturally supported by the hand, with stems clearly separated from fingers, sleeve, torso, and bag. Flowers should not cover the face, block the sneakers, pierce through the arm, or become an oversized decorative prop.";

export const bookMagazineAntiClippingLine =
  "If holding a book or magazine, keep it flat, readable as an object, and naturally supported by the hand or arm. The book should not slice through fingers, cover the whole torso, merge with clothing, show readable fake text, or distort the wrist.";

export const phoneAntiClippingLine =
  "If holding a phone, keep the phone rectangular, naturally held between fingers and palm, with clear edges and realistic hand placement. In mirror images, the phone may hide or crop the face, but it must not merge with fingers, cover the whole head, distort the hand, or create oversized phone-hand proportions.";

export const waterBottleGymObjectAntiClippingLine =
  "If holding a water bottle, towel, or light dumbbell, keep the object simple, correctly scaled, and clearly gripped. It should not pass through the hand, sleeve, torso, leg, gym equipment, or sneakers. Avoid complex gym props that cause clipping.";

export const paperShoppingBagAntiClippingLine =
  "If holding a paper bag or shopping bag, keep it small to medium, hanging naturally from the hand with visible handles, slight folds, and clear separation from the legs, skirt, trousers, and sneakers. Avoid oversized bags blocking the full figure and sneakers or clipping into the shoes.";

export const bagAntiClippingLine =
  "If carrying a bag, keep the bag strap, handle, shoulder, arm, clothing, and hand clearly separated. The strap should sit naturally on the shoulder or hand without cutting into the neck, chest, sleeve, arm, torso, skirt, trousers, or sneakers. The bag should hang with believable weight.";

export const handheldObjectNegativePhrases = [
  "multiple handheld props",
  "two or more main objects in hand",
  "coffee plus flowers",
  "coffee plus book",
  "phone plus coffee",
  "tote plus water bottle",
  "overlapping props",
  "crowded hands",
  "hands merging with objects",
  "fingers fused with cup",
  "palm clipping into phone",
  "bag strap cutting into shoulder",
  "bag merging with torso",
  "bouquet piercing through arm",
  "book slicing through fingers",
  "water bottle passing through sleeve",
  "shopping bag blocking shoes",
  "floating props",
  "oversized props",
  "objects crossing the body",
  "objects crossing the legs",
  "object hiding sneakers",
  "extra fingers",
  "distorted wrists",
  "unreadable hand-object contact",
  "bag and handheld object competing",
  "cluttered styling props"
];

export const mirrorHandheldObjectNegativePhrases = ["oversized phone hand", "phone merging with fingers"];
