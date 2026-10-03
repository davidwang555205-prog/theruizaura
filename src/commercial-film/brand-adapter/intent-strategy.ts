import type { CommercialIntentId } from "../types";

export type CommercialBrandIntentStrategyV1 = {
  positioning: string;
  productRole: string;
  productPresence: string;
  priority: string;
  emphasis: readonly string[];
  guardrails: readonly string[];
  evidenceRequirement?: {
    requirement: string;
    missingBehavior: string;
  };
};

/** Brand-owned content strategy, keyed by the Commercial Intent contract. */
export const THERUIZ_AURA_INTENT_STRATEGIES_V1: Readonly<
  Record<CommercialIntentId, CommercialBrandIntentStrategyV1>
> = {
  QUIET_LUXURY: {
    positioning: "Quiet but seen / 安静但被看见",
    productRole: "Lifestyle Identity",
    productPresence: "understated but recognizable",
    priority: "Character + Product relationship > Environment",
    emphasis: [
      "The footwear is part of the woman's visual identity, not a display object.",
      "Connect the worn shoe naturally to the trouser shape, gait, and surrounding material.",
      "Keep the product present and recognizable through ordinary wear without forcing a product pose.",
    ],
    guardrails: [
      "Do not let the film become a pure spatial-atmosphere piece.",
      "Do not hide the footwear completely or reduce it to unrelated background detail.",
      "Do not isolate or hard-sell the shoe.",
    ],
  },
  URBAN_MOTION: {
    positioning: "Shoes accompanying city life / 鞋陪伴城市生活",
    productRole: "Movement Companion",
    productPresence: "action visible",
    priority: "Movement + Product relationship > City atmosphere",
    emphasis: [
      "Show walking and believable movement through the city.",
      "Keep the relationship between the worn shoe and the road surface legible.",
      "Let the footwear participate in the action and route rather than appear after the movement.",
    ],
    guardrails: [
      "Avoid the visual language and energy of a generic sports-shoe advertisement.",
      "Keep the movement grounded in ordinary city life.",
    ],
  },
  DAILY_STYLING: {
    positioning: "A lasting choice in the wardrobe / 衣橱里的长期选择",
    productRole: "Styling Anchor",
    productPresence: "high readable",
    priority: "Outfit relationship > Character > Environment",
    emphasis: [
      "Make the shoe-to-outfit relationship easy to read.",
      "Show believable combinations with different clothing and trouser shapes.",
      "Place the footwear in repeatable, high-frequency everyday situations.",
      "Make the shoe feel like a choice that can enter the viewer's own life.",
    ],
    guardrails: [
      "Keep styling lived-in and wearable rather than turning the film into a catalogue pose.",
    ],
  },
  NEW_ARRIVAL: {
    positioning: "A new choice enters everyday life / 新的生活选择进入日常",
    productRole: "New Choice Recognition",
    productPresence: "recognizable",
    priority: "Product introduction + lifestyle balance",
    emphasis: [
      "Let the new choice enter through a believable change in everyday life.",
      "Balance clear product recognition with the person's continuing routine.",
      "Make the arrival feel like a lived change, not a separate launch event.",
    ],
    guardrails: [
      "Avoid a traditional hard-sell new-product advertisement.",
      "Do not stage a launch, unboxing, or product-only announcement unless supported by the selected scene.",
    ],
  },
  PRODUCT_CRAFT: {
    positioning: "Product proof / 产品证明内容",
    productRole: "Product Evidence",
    productPresence: "evidence-led and directly readable",
    priority: "Product evidence > lifestyle expression",
    emphasis: [
      "Show only product facts and details supported by the current confirmed SKU evidence.",
      "Keep every product detail tied to its confirmed reference and supported Product Coverage.",
    ],
    guardrails: [
      "Do not infer or invent material, construction, origin, process, or performance details.",
    ],
    evidenceRequirement: {
      requirement: "A confirmed SKU reference, product information, and supported Product Coverage are required.",
      missingBehavior: "Continue to block with PRODUCT_EVIDENCE_REQUIRED when any required product evidence is missing.",
    },
  },
};
