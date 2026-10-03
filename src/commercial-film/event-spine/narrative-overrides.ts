import type { CommercialIntentId } from "../types";
import type { CommercialAdvertisingStructureId } from "../creative-spine/types";
import type { CommercialEventShot } from "./types";

type NarrativeOverride = Partial<Pick<CommercialEventShot,
  "whatHappens" | "whyItHappens"
>>;

/**
 * Event-story wording stays separate from the structured event/state planner.
 * This adapter only supplies the existing narrative copy for two established
 * structure/intent combinations; it does not create or alter event facts.
 */
export function commercialEventNarrativeOverride(input: {
  intent: CommercialIntentId;
  structure: CommercialAdvertisingStructureId;
  shotIndex: number;
}): NarrativeOverride {
  if (input.intent === "URBAN_MOTION" && input.structure === "PURSUIT_RELEASE") {
    const copy: Record<number, NarrativeOverride> = {
      1: {
        whatHappens: "She continues the same route as the already-declared passing traffic remains in its distant city lane before reaching the established crossing.",
      },
      2: {
        whatHappens: "Passing traffic sweeps across the established crossing while she holds at its near edge, keeping her route temporarily occupied.",
        whyItHappens: "The traffic already present in the city lane reaches the crossing on her continuous route.",
      },
      3: {
        whatHappens: "After the same traffic clears the crossing, she steps from its near edge across the now-clear route and reaches the far side.",
        whyItHappens: "The traffic that occupied her route has passed; the cleared crossing lets her complete the interrupted passage.",
      },
      4: {
        whatHappens: "She continues walking on the far side of the crossing; the same traffic remains beyond it and the route stays clear behind her.",
      },
    };
    return copy[input.shotIndex] ?? {};
  }

  if (input.intent === "PRODUCT_CRAFT" && input.structure === "RITUAL_COMPLETION") {
    const copy: Record<number, NarrativeOverride> = {
      1: {
        whatHappens: "She continues the same before-leaving garment check at the preparation surface, briefly checking the trouser hem with her free hand while the worn product remains uncovered.",
        whyItHappens: "The same task advances through an already-supported garment-check action before its final release.",
      },
      2: {
        whatHappens: "She finishes the existing before-leaving garment check: her hand releases the trouser hem and lowers to her side, leaving the hem settled around the ankle as her weight settles onto the leading foot.",
        whyItHappens: "The same preparation task reaches its visible end through the supported hem-check action and grounded step already present in this scene.",
      },
      3: {
        whatHappens: "With the hem check visibly finished and her hand lowered, she stands fully and takes the first small practical step toward the already-established exit line.",
        whyItHappens: "The completed, settled garment state now enters ordinary use through the first step toward the scene's existing exit line.",
      },
      4: {
        whatHappens: "She continues in ordinary use from the existing home exit line with the garment check complete, hand relaxed at her side, and the trouser hem still settled around the ankle; the preparation surface remains cleared behind her.",
      },
    };
    return copy[input.shotIndex] ?? {};
  }

  return {};
}

export function centralEventNarrative(shots: CommercialEventShot[]) {
  return shots[2]?.whatHappens ?? "";
}
