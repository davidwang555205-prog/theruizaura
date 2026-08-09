import type { ConsumerTrustRole, PromptProfileInput, PromptRule } from "../contracts";
import { PromptPriority } from "../contracts";

export const THERUIZ_CONSUMER_TRUST_VERSION = "theruiz-manual-v1.1" as const;

export type { ConsumerTrustRole } from "../contracts";

const LIFESTYLE_IMAGE_TYPES = new Set<PromptProfileInput["imageType"]>(["生活场景图", "对镜穿搭图"]);

export function resolveTheruizConsumerTrustRole(input: PromptProfileInput): ConsumerTrustRole {
  if (input.imageType === "非产品氛围图" || input.compositionMode === "atmosphere") {
    return "editorial_atmosphere";
  }
  if (input.contentTrustRole === "synthetic_ugc_visualization" && LIFESTYLE_IMAGE_TYPES.has(input.imageType)) {
    return "synthetic_ugc_visualization";
  }
  if (LIFESTYLE_IMAGE_TYPES.has(input.imageType)) {
    return "brand_lifestyle_visualization";
  }
  return "product_evidence";
}

const PRODUCT_EVIDENCE_SCOPE: PromptRule = {
  id: "theruiz-trust-product-evidence-scope",
  section: "product",
  text: "Use the image only as evidence of visible product appearance confirmed by the current references.",
  priority: PromptPriority.P1_PRODUCT_HARD_LOCK,
  source: "consumer-trust-profile",
  appliesWhen: {},
  required: true,
  tags: ["theruiz-aura", "consumer-trust", "product-evidence", "manual-execution"]
};

const UNSUPPORTED_PERFORMANCE_CLAIMS: PromptRule = {
  id: "theruiz-trust-unsupported-performance-claims",
  section: "negative",
  text: "Do not imply unverified comfort, fit, durability, waterproofing, traction, medical support, safety, or performance outcomes.",
  priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY,
  source: "consumer-trust-profile",
  appliesWhen: {},
  required: true,
  tags: ["theruiz-aura", "consumer-trust", "commercial-claim-risk", "manual-execution"]
};

const BRAND_LIFESTYLE_NOT_TESTIMONY: PromptRule = {
  id: "theruiz-trust-brand-lifestyle-not-testimony",
  section: "brand",
  text: "This is brand-produced lifestyle visualization, not verified customer testimony or documented wear history.",
  priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY,
  source: "consumer-trust-profile",
  appliesWhen: {},
  required: true,
  tags: ["theruiz-aura", "consumer-trust", "brand-lifestyle", "manual-execution"]
};

const NO_FABRICATED_CUSTOMER_EVIDENCE: PromptRule = {
  id: "theruiz-trust-no-fabricated-customer-evidence",
  section: "negative",
  text: "Do not include fabricated reviews, usernames, orders, ratings, chats, platform interfaces, timestamps, or wear claims.",
  priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY,
  source: "consumer-trust-profile",
  appliesWhen: {},
  required: true,
  tags: ["theruiz-aura", "consumer-trust", "customer-evidence", "manual-execution"]
};

const SYNTHETIC_UGC_BOUNDARY: PromptRule = {
  id: "theruiz-trust-synthetic-ugc-boundary",
  section: "brand",
  text: "Use a natural consumer perspective without presenting the image as an actual buyer photo or independent review.",
  priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY,
  source: "consumer-trust-profile",
  appliesWhen: {},
  required: true,
  tags: ["theruiz-aura", "consumer-trust", "synthetic-ugc", "manual-execution"]
};

export function getTheruizAuraConsumerTrustRules(input: PromptProfileInput): PromptRule[] {
  if (input.brandId !== "theruiz_aura") return [];
  const role = resolveTheruizConsumerTrustRole(input);
  if (role === "editorial_atmosphere") return [];

  const rules: PromptRule[] = [];
  if (role === "product_evidence") rules.push(PRODUCT_EVIDENCE_SCOPE);
  if (input.hasShoe && (role === "product_evidence" || role === "synthetic_ugc_visualization")) {
    rules.push(UNSUPPORTED_PERFORMANCE_CLAIMS);
  }
  if (role === "brand_lifestyle_visualization") rules.push(BRAND_LIFESTYLE_NOT_TESTIMONY);
  if (role === "brand_lifestyle_visualization" || role === "synthetic_ugc_visualization") {
    rules.push(NO_FABRICATED_CUSTOMER_EVIDENCE);
  }
  if (role === "synthetic_ugc_visualization") rules.push(SYNTHETIC_UGC_BOUNDARY);
  return rules;
}
