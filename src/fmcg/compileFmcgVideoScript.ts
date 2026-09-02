import { fmcgCategoryLabels, fmcgCategoryProtection, fmcgTopicLabels } from "./catalog";
import type { FmcgCompiledSet, FmcgPromptInput } from "./types";

export type FmcgVideoDuration = 10 | 15;

function selectedCards(set: FmcgCompiledSet, duration: FmcgVideoDuration) {
  const limit = duration === 10 ? 3 : 4;
  if (set.cards.length <= limit) return set.cards;
  const indices = duration === 10
    ? [0, Math.floor((set.cards.length - 1) / 2), set.cards.length - 1]
    : [0, Math.floor((set.cards.length - 1) / 3), Math.floor(((set.cards.length - 1) * 2) / 3), set.cards.length - 1];
  return [...new Set(indices)].map((index) => set.cards[index]).filter(Boolean);
}

export function compileFmcgVideoScript(input: FmcgPromptInput, set: FmcgCompiledSet, duration: FmcgVideoDuration): string {
  if (set.productCategory !== "fmcg" || input.productTruth.productCategory !== "fmcg") throw new Error("FMCG_VIDEO_CATEGORY_MISMATCH");
  const cards = selectedCards(set, duration);
  const productForm = input.fmcgCategory === "home_kitchen_drinkware" ? "vessel" : "package";
  const beats = duration === 10
    ? [
        `0–1.5s / ESTABLISH: ${cards[0]?.scene ?? "Establish the selected setting"}. Show the complete confirmed ${productForm} at a readable natural scale.`,
        `1.5–9.3s / REAL-TIME USE AND EVIDENCE: ${cards.map((card) => `${card.action}; preserve ${card.evidenceRole}`).join(" Then ")}. Complete the behavior at ordinary 1x timing.`,
        `9.3–10s / RESOLVE: Hold one clear final view of the unchanged product for 0.7 seconds.`,
      ]
    : [
        `0–2s / ESTABLISH: ${cards[0]?.scene ?? "Establish the selected setting"}. Introduce the complete confirmed ${productForm} and its real scale.`,
        `2–8s / BEHAVIOR: ${cards.slice(0, 2).map((card) => card.action).join(" Then ")}. Use ordinary 1x timing and one coherent action chain.`,
        `8–14.3s / PRODUCT EVIDENCE: ${cards.slice(2).map((card) => `${card.action}; make ${card.evidenceRole} readable`).join(" Then ") || "Show the confirmed package relationships through normal handling."}. This is an independent evidence beat, not a slowed repeat.`,
        `14.3–15s / RESOLVE: Hold one stable final product view for 0.7 seconds.`,
      ];
  return [
    `SEEDANCE 2.5 — FMCG MANUAL VIDEO SCRIPT`,
    `Duration: ${duration} seconds`,
    `Rhythm: ${duration === 10 ? "independent three-beat" : "independent four-beat"}`,
    "SCENE SPEC",
    `${fmcgTopicLabels[input.topicId]} for ${fmcgCategoryLabels[input.fmcgCategory]}, ${input.season}. ${cards.map((card) => card.scene).join(" → ")}. Keep one coherent visual world.`,
    "FILM SPEC",
    beats.join("\n"),
    "MOTION",
    "Real-time movement at approximately 1x playback. Use complete, practical handling actions with believable momentum. No slow motion, time stretching, dreamy suspension, prolonged micro-gestures, or artificial deceleration.",
    "CAMERA",
    "Use a stable natural-perspective lens and consistent working distance. Let the camera respond to the action with one restrained documentary movement. No ultra-wide distortion, forced macro enlargement, orbiting showcase move, or abrupt speed ramp.",
    "PRODUCT PROTECTION",
    `${fmcgCategoryProtection[input.fmcgCategory].join(" ")}. Keep package geometry, visible color relationships, component count, label placement, and physical contact consistent with the confirmed references. Do not create readable copy or claims that were not supplied by the user.`,
    "REFERENCE MAPPING",
    input.referencePlan.order.length
      ? "Use the confirmed uploaded product references in the displayed Reference Plan order as the only product source for every frame."
      : "No confirmed references are bound. Treat this as a non-executable draft and do not invent product appearance.",
    "EXECUTION",
    "Manual / Draft only. The user must upload the references and paste this script into the external Seedance 2.5 workflow. No provider request has been sent.",
  ].join("\n\n");
}
