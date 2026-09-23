import type { CommercialFilmPlan } from "../types";
import type { CommercialDirectorConceptId } from "../director-concept/types";
import type { CommercialSignatureMoment } from "./types";

type SynthesisCore = {
  proposition: string;
  moment: string;
  before: string;
  visualInterruption: string;
  after: string;
  productRole: string;
  deviceRole: string;
  memoryReason: string;
};

const PROPOSITION_BY_CASE: Record<string, string> = {
  "QUIET_LUXURY:STATIC_CAMERA_FILM": "The room stays quiet; a passing umbrella outside the window makes the product visible.",
  "QUIET_LUXURY:PARTIAL_OBSCURATION": "The room hides part of her until the moment itself opens the worn line.",
  "QUIET_LUXURY:LIGHT_REVEAL": "Light touches the material before the camera decides it matters.",
  "URBAN_MOTION:WORLD_MOVES_SUBJECT_SETTLES": "The city keeps moving; her stillness makes the product visible.",
  "URBAN_MOTION:THRESHOLD_CHAIN": "A real boundary opens, and the crossing reveals the worn relationship.",
  "URBAN_MOTION:EDGE_OF_FRAME": "The frame finds her at the edge, not at the centre.",
  "DAILY_STYLING:REPEATED_GESTURE": "She repeats one small gesture, and the second time makes the look real.",
  "DAILY_STYLING:PARTIAL_OBSCURATION": "The doorway hides part of her before the finished look steps into view.",
  "PRODUCT_CRAFT:LIGHT_REVEAL": "A passing reflection makes the material readable before it disappears.",
  "PRODUCT_CRAFT:WORLD_MOVES_SUBJECT_SETTLES": "The task keeps moving; her settled weight reveals the worn relationship.",
  "NEW_ARRIVAL:EDGE_OF_FRAME": "Arrival changes the frame, and the product is found at its edge.",
  "NEW_ARRIVAL:THRESHOLD_CHAIN": "The door closes behind her, and the new place makes the worn line readable.",
};

const SYNTHESIS_BY_CONCEPT: Record<CommercialDirectorConceptId, SynthesisCore> = {
  STATIC_CAMERA_FILM: {
    proposition: "A fixed frame makes every entry feel observed rather than presented.",
    moment: "{carrier} crosses the empty frame at the {location}; when it clears, she is already inside the composition.",
    before: "The frame is empty and waiting.",
    visualInterruption: "The moving carrier crosses the fixed composition.",
    after: "The carrier clears and she is already inside the frame.",
    productRole: "The worn line becomes readable after the movement clears.",
    deviceRole: "The fixed frame resolves when movement stops.",
    memoryReason: "The frame never moves; the world does.",
  },
  PARTIAL_OBSCURATION: {
    proposition: "The complete image arrives only after the world has already hidden part of it.",
    moment: "{carrier} hides her lower body at the {location}; when it clears, the worn line reads in full.",
    before: "Part of her lower body is out of view.",
    visualInterruption: "A real foreground carrier interrupts the body.",
    after: "The carrier clears and the worn line is readable again.",
    productRole: "The clearing foreground restores the worn relationship.",
    deviceRole: "The partial view resolves into a complete worn read.",
    memoryReason: "The image withholds, then returns the product.",
  },
  EDGE_OF_FRAME: {
    proposition: "The product is discovered at the edge, not placed at the centre.",
    moment: "The frame lets {carrier} hold the centre at the {location}; when it clears, she resolves at the frame edge.",
    before: "The centre of the composition is open.",
    visualInterruption: "Another visual element takes the centre.",
    after: "The edge releases the worn line without re-centering it.",
    productRole: "The worn line reads through off-center placement.",
    deviceRole: "The centre is taken away, and the edge becomes readable.",
    memoryReason: "The frame finds her where it almost lost her.",
  },
  THRESHOLD_CHAIN: {
    proposition: "A real crossing changes what the film lets the viewer see.",
    moment: "{carrier} opens the boundary at the {location}; she crosses, and the worn line reads on the far side.",
    before: "She is held on one side of a real boundary.",
    visualInterruption: "The boundary opens as she reaches it.",
    after: "She crosses into the new space with the worn line readable.",
    productRole: "The new space makes the worn relationship readable.",
    deviceRole: "The boundary changes the visual state through the crossing.",
    memoryReason: "The crossing changes the space and the product read.",
  },
  REFLECTION_WORLD: {
    proposition: "The product is understood indirectly before the direct view confirms it.",
    moment: "A reflection in the {carrier} appears at the {location}; when it clears, the worn line is physically present.",
    before: "Only an indirect image is visible.",
    visualInterruption: "A real reflective surface carries the body first.",
    after: "The reflection resolves into a direct physical view.",
    productRole: "The indirect image becomes a readable worn relationship.",
    deviceRole: "Reflection gives way to direct physical presence.",
    memoryReason: "The image arrives before the body does.",
  },
  LIGHT_REVEAL: {
    proposition: "Light makes the material readable before the camera decides it matters.",
    moment: "A reflection from the {carrier} slides across the lower frame at the {location}; it catches the material, then disappears.",
    before: "The material is held in shadow.",
    visualInterruption: "A moving reflection crosses the material.",
    after: "The reflection disappears, leaving the worn line remembered.",
    productRole: "The reflection creates the first readable material moment.",
    deviceRole: "Light reveals, then releases the product back to the room.",
    memoryReason: "The material is visible for one beat and then gone.",
  },
  WORLD_MOVES_SUBJECT_SETTLES: {
    proposition: "The moving world makes her stillness readable.",
    moment: "A {carrier} clears behind her at the {location}; she is already standing still while the city keeps moving.",
    before: "The world is moving around her.",
    visualInterruption: "The moving world occupies the deeper frame.",
    after: "The movement continues while her body remains still.",
    productRole: "Her stillness removes motion blur around the worn line.",
    deviceRole: "The world keeps moving; the body becomes the stable point.",
    memoryReason: "Motion and stillness separate in one frame.",
  },
  REPEATED_GESTURE: {
    proposition: "A repeated gesture becomes real only when the world changes around it.",
    moment: "She smooths the same {carrier} at the {location}, then repeats the gesture after the environment changes around her.",
    before: "The first gesture establishes the cuff and body relationship.",
    visualInterruption: "The environment changes between the two gestures.",
    after: "The second gesture lands differently and becomes recognition.",
    productRole: "The second gesture makes the worn relationship readable.",
    deviceRole: "Repetition resolves into recognition through variation.",
    memoryReason: "The same gesture feels different the second time.",
  },
};

type FilmabilityOverride = {
  carrier: string;
  moment: string;
  memoryReason?: string;
  variants?: string[];
};

const FILMABILITY_OVERRIDES: Record<string, FilmabilityOverride> = {
  "QUIET_LUXURY:STATIC_CAMERA_FILM": {
    carrier: "closing umbrella",
    moment: "A closing umbrella passes outside the window at the {location}; when it clears, the worn line is already visible inside the frame.",
  },
  "QUIET_LUXURY:PARTIAL_OBSCURATION": {
    carrier: "passing pedestrian",
    moment: "A passing pedestrian crosses outside the window at the {location} and briefly hides her lower body; when the figure clears, the worn line reads in full.",
    variants: [
      "The pedestrian is seen through the window.",
      "The pedestrian passes in the reflection on the glass.",
      "The pedestrian crosses beyond the open doorway.",
      "The reflection carries the pedestrian across the glass.",
      "The pedestrian moves in the outside layer of the frame.",
    ],
  },
  "QUIET_LUXURY:LIGHT_REVEAL": {
    carrier: "passing vehicle",
    moment: "A reflection from a passing vehicle slides across the lower frame at the {location}; it catches the material, then disappears.",
  },
  "URBAN_MOTION:THRESHOLD_CHAIN": {
    carrier: "revolving glass door",
    moment: "The revolving glass door sweeps through the centre at the {location}; when its panel clears, she crosses the boundary and the worn line reads in the new space.",
  },
  "URBAN_MOTION:EDGE_OF_FRAME": {
    carrier: "passing cyclist",
    moment: "A passing cyclist takes the centre at the {location}; when the cyclist clears, she is already settled at the frame edge.",
  },
  "PRODUCT_CRAFT:LIGHT_REVEAL": {
    carrier: "passing vehicle",
    moment: "Through the workroom window, a reflection from a passing vehicle slides across the lower frame at the {location}; it catches the material, then disappears.",
  },
  "NEW_ARRIVAL:THRESHOLD_CHAIN": {
    carrier: "cafe door",
    moment: "The cafe door closes behind her at the {location}; the camera stays on the closed threshold while the street continues.",
  },
};

function replaceContext(value: string, carrier: string, location: string) {
  return value.replace(/\{carrier\}/g, carrier).replace(/\{location\}/g, location);
}

function worldPrefix(plan: CommercialFilmPlan, carrier: string) {
  const interior = ["QUIET_LUXURY", "PRODUCT_CRAFT", "DAILY_STYLING"].includes(plan.commercialIntent);
  const exteriorCarrier = /\b(?:cyclist|pedestrian|bus|traffic|umbrella|street)\b/i.test(carrier);
  return interior && exteriorCarrier ? "Seen through the window, " : "";
}

export function synthesizeProposition(plan: CommercialFilmPlan) {
  const key = `${plan.commercialIntent}:${plan.directorConcept.concept}`;
  return PROPOSITION_BY_CASE[key] ?? SYNTHESIS_BY_CONCEPT[plan.directorConcept.concept].proposition;
}

export function synthesizeSignatureMoment(
  plan: CommercialFilmPlan,
  carrier: string,
  location: string,
  signatureBeatIndex: number,
  nonce: number
): CommercialSignatureMoment {
  const core = SYNTHESIS_BY_CONCEPT[plan.directorConcept.concept];
  const override = FILMABILITY_OVERRIDES[`${plan.commercialIntent}:${plan.directorConcept.concept}`];
  const resolvedCarrier = override?.carrier ?? carrier;
  const momentTemplate = override?.moment ?? core.moment;
  const prefix = override ? "" : worldPrefix(plan, resolvedCarrier);
  const resolvedMoment = replaceContext(momentTemplate, resolvedCarrier, location);
  const variant = override?.variants?.[nonce % override.variants.length] ?? "";
  const momentDescription = `${resolvedMoment}${variant ? ` ${variant}` : ""}`;
  return {
    id: `moment-${plan.commercialIntent.toLowerCase()}-${plan.directorConcept.concept.toLowerCase()}-${signatureBeatIndex}`,
    mechanism: core.deviceRole,
    momentDescription: prefix
      ? `${prefix}${momentDescription.charAt(0).toLowerCase()}${momentDescription.slice(1)}`
      : momentDescription,
    beforeMoment: core.before,
    visualInterruption: replaceContext(core.visualInterruption, carrier, location),
    afterMoment: core.after,
    productRole: core.productRole,
    worldRole: plan.worldRealism.line,
    deviceRole: core.deviceRole,
    memoryReason: override?.memoryReason ?? core.memoryReason,
    signatureBeatIndex,
    location,
    carrier: resolvedCarrier,
  };
}
