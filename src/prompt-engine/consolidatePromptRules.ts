import type { PromptConsolidationReport, PromptRule } from "./contracts";

const words = (text: string) => text.trim() ? text.trim().split(/\s+/).length : 0;

// Only known compiler-owned wording is consolidated. Free-form user text,
// reference facts, role selection, action/face geometry and rule applicability
// remain authoritative. Each replacement records its original rule and text.
export function consolidatePromptRules(rules: PromptRule[]): {
  kept: PromptRule[];
  report: PromptConsolidationReport;
} {
  const kept = rules.map(rule => ({ ...rule }));
  const report: PromptConsolidationReport = {
    beforeWords: rules.reduce((sum, rule) => sum + words(rule.text), 0),
    afterWords: 0,
    changes: [],
  };
  const requiredOwner = (id: string, evidence: string) =>
    kept.find(rule => rule.id === id && rule.required && rule.text.includes(evidence));

  function replace(rule: PromptRule, semanticKey: string, from: string, to: string, owners: string[] = []) {
    if (!rule.text.includes(from)) return;
    const beforeText = rule.text;
    const afterText = beforeText.replace(from, to).trim();
    if (words(afterText) >= words(beforeText)) return;
    rule.text = afterText;
    rule.estimatedWords = words(afterText);
    report.changes.push({ ruleId: rule.id, semanticKey, beforeText, afterText, coveredByRuleIds: owners });
  }

  for (const rule of kept) {
    if (["user-extra-requirement", "user-upload"].includes(rule.source)) continue;

    if (rule.source === "realism-profile") {
      if (rule.id === "theruiz-human-state-real-mature-urban") {
        replace(rule, "human-realism-scaffold",
          "Make the woman feel like a real mature urban person caught in a lived moment, not a mannequin, fashion dummy, plastic model, over-posed influencer, showroom character, or standard commercial model waiting for the camera. Prefer a natural side glance, downward gaze, slight turn, walking transition, arrival pause, or quiet moment between actions. Keep believable body asymmetry, relaxed shoulders, natural facial tension, realistic hair texture, a few subtle flyaway hairs, slight fabric movement, believable bag weight, natural hand position, and normal daily imperfection. Her expression should respond to the place or action rather than perform for the lens. Direct eye contact may appear occasionally when the theme genuinely needs it, but it must not be the default.",
          "Keep a real mature urban woman in a lived moment: natural body asymmetry, relaxed shoulders, natural facial tension, realistic hair texture with subtle flyaways, slight fabric movement, believable bag weight, natural hands, and daily imperfection. Prefer a side or downward glance, slight turn, walking transition, arrival pause, or quiet moment between actions. Expression responds to the place or action; direct eye contact is occasional and theme-dependent, never default. No mannequin, fashion dummy, plastic model, over-posed influencer, showroom character, or commercial model waiting for the camera.");
        replace(rule, "human-face-authority",
          "Make the selected woman feel real and unperformed, with natural facial tension, realistic skin and hair texture, relaxed shoulders, believable body asymmetry, and ordinary daily imperfection. The assigned Face Variation Lock is the only authority for head direction and gaze; do not introduce any additional camera acknowledgement, eye direction, head turn, or generic facial pose.",
          "Keep the selected woman real and unperformed: natural facial tension, realistic skin and hair texture, relaxed shoulders, believable body asymmetry, and daily imperfection. Face Variation Lock alone controls head direction and gaze; no additional camera acknowledgement, eye direction, head turn, or generic facial pose.");
        replace(rule, "human-studio-realism",
          "Make the selected person feel real and unperformed in a controlled professional studio. Keep natural facial tension, subtle hair and fabric texture, relaxed shoulders, believable body asymmetry, and a calm expression responding to the pose rather than performing for the lens. Direct eye contact may appear when the selected studio role requires it, but avoid mannequin-like stillness or campaign-face perfection.",
          "Keep the selected person real and unperformed in a controlled professional studio: natural facial tension, subtle hair and fabric texture, relaxed shoulders, believable body asymmetry, and calm expression responding to the pose. Direct eye contact only when the studio role requires it; no mannequin-like stillness or campaign-face perfection.");
      }
      if (rule.id === "theruiz-physical-integrity-grounding") {
        replace(rule, "physical-contact-scaffold",
          "Match body weight to the selected action phase, with believable knee direction, hip balance, garment tension and folds corresponding to the movement, outsole pressure, and grounded contact shadow. Hands must make real contact with sleeves, bags, coats, doors, or furniture when the action requires it; do not use hovering or decorative hand gestures.",
          "Match believable body weight, knee direction, hip balance, garment tension and folds, outsole pressure, and grounded contact shadow to the action phase. Hands make real contact with sleeves, bags, coats, doors, or furniture when required; do not use hovering or decorative hand gestures.");
      }
      if (rule.id === "theruiz-on-foot-shoe-scale-lock") {
        replace(rule, "shoe-scale-scaffold",
          "Shoe scale lock: keep the sneaker length and volume proportional to the visible anatomy in frame. Keep the ankle alignment natural, the garment hem clear of the tongue and laces, and both feet grounded.",
          "Shoe scale lock: keep sneaker length and volume proportional to visible anatomy, ankles naturally aligned, garment hems clear of tongues and laces, and both feet grounded.");
      }
    }

    if (rule.id === "img-onfoot-product-primary" && rule.source === "image-type-profile") {
      const owner = requiredOwner("product-accuracy-current-task-reference", "only product source");
      if (owner && /do not infer|do not invent/i.test(owner.text)) {
        replace(rule, "product-reference-source",
          "Use uploaded footwear references as the only product source; keep visibly confirmed sneaker details as the visual anchor and do not infer missing facts.",
          "Keep visibly confirmed sneaker details as the visual anchor.", [owner.id]);
      }
    }

    if (rule.id.startsWith("card-face-variation-") && rule.source === "theme-card") {
      // The wrapper already supplies the complete eye-state lock. Remove only
      // repeated eye clauses from the known variation templates, retaining
      // focused/relaxed/bright eyes, brows, mouth, gaze and orientation verbatim.
      const eyeLock = "Keep both eyes visibly open with clearly separated upper and lower eyelids, visible iris and pupil, and natural catchlights; never render closed eyes, sleepy half-closed eyes, or a squint.";
      if (rule.text.includes(eyeLock)) {
        const eyeClauses: Array<[string, string]> = [
          ["Keep both eyes visibly open, with relaxed upper eyelids, visible iris and pupil, natural catchlights, and a faint asymmetric smile.", "Keep relaxed upper eyelids and a faint asymmetric smile."],
          ["keeping both eyes open and focused, with a relaxed brow and resting lips", "with focused eyes, a relaxed brow and resting lips"],
          ["Keep both eyes open with clearly separated eyelids, a relaxed brow, and a quiet neutral mouth.", "Keep a relaxed brow and a quiet neutral mouth."],
          ["with an off-camera gaze, open eyes, a small natural brow response", "with an off-camera gaze and a small natural brow response"],
          ["with a soft exhale, open relaxed eyes, subtly parted or resting lips", "with a soft exhale, relaxed eyes, subtly parted or resting lips"],
          ["with one eye slightly nearer the camera, both eyes open, a calm jaw", "with one eye slightly nearer the camera, a calm jaw"],
          ["while keeping both eyes open and clearly separated, with relaxed lips", "with relaxed lips"],
          ["with a small head turn, open eyes, neutral brow", "with a small head turn, neutral brow"],
          ["with both eyes open, clearly separated eyelids, one brow slightly higher than the other", "with one brow slightly higher than the other"],
          ["Keep both eyes open and focused, brows relaxed, jaw open slightly", "Keep focused eyes, brows relaxed, jaw open slightly"],
          ["Keep both eyes open with clearly separated eyelids, a slightly raised brow", "Keep a slightly raised brow"],
          ["both eyes open and bright with natural catchlights, lift one brow clearly", "keep bright eyes, lift one brow clearly"],
          ["both eyes open and relaxed, and gaze placed", "relaxed eyes, and gaze placed"],
          ["keep both eyes open, raise one brow", "raise one brow"],
          [" while keeping both eyes open and clearly separated.", "."],
          ["Keep both eyes open, the brow asymmetrical", "Keep the brow asymmetrical"],
        ];
        for (const [from, to] of eyeClauses) replace(rule, "face-eye-state", from, to, [rule.id]);
      }
    }

    if (rule.id === "styling-selected-outfit" && rule.source === "styling-profile") {
      // The deterministic studio outfit already names its colors. Keep the
      // palette boundary and all accessory prohibitions, omit illustrative
      // alternative colors; garment names/materials and seasonal cues stay.
      if (rule.text.startsWith("Studio wardrobe rule:")) {
        replace(rule, "selected-outfit-palette",
          "keeping every garment in a restrained low-chroma palette such as ivory, cream, oatmeal, warm grey, soft stone, taupe, muted blue, charcoal, winter white, or restrained navy, with no visible logo, showy accessory, or handheld styling prop",
          "keeping every garment low-chroma, with no visible logo, showy accessory, or handheld styling prop");
      }
    }

    if (rule.id === "card-action-lock" && rule.source === "theme-card") {
      replace(rule, "action-phase-scaffold",
        "Keep this as the primary action beat, but capture it as a believable in-between moment with anticipation, weight transfer, follow-through, and a small unfinished movement.",
        "Capture this primary action as a believable in-between moment with anticipation, weight transfer, follow-through, and small unfinished movement.");
      replace(rule, "action-single-beat",
        "Do not add a second unrelated action, and do not freeze the body into a completed mannequin pose.",
        "Do not add a second unrelated action or freeze the body into a completed mannequin pose.");
      // The concrete directive remains untouched, including hand/leg locks.
    }

    if (rule.id === "card-series-context" && rule.source === "theme-card") {
      replace(rule, "series-identity-continuity",
        "Preserve the same selected person, outfit, sneaker, hair or makeup treatment, and color grade.",
        "Preserve the same person, outfit, sneaker, hair or makeup treatment, and color grade.");
      replace(rule, "series-scene-independence",
        "Use this card's selected scene independently; do not reuse, blend, or inherit another card's location, architecture, props, or background.",
        "Use only this card's selected location, architecture, props, and background; do not reuse, blend, or inherit another card's scene.");
    }

    if (rule.id === "negative-product-protection" && rule.source === "negative-default") {
      const owner = requiredOwner("theruiz-negative-anti-ai-realism-risk", "floating feet");
      if (owner?.text.includes("plastic skin")) {
        replace(rule, "negative-physical-and-skin", "floating feet, floating sneakers, plastic skin,", "floating sneakers,", [owner.id]);
      }
    }

    if (rule.id === "theruiz-negative-anti-ai-realism-risk" && rule.source === "realism-profile") {
      const composition = requiredOwner("theruiz-composition-observed-asymmetric", "Avoid centered rigid catalog symmetry.");
      if (composition) replace(rule, "negative-catalog-symmetry", "Avoid centered catalog symmetry, mannequin stillness,", "Avoid mannequin stillness,", [composition.id]);
      const grounding = requiredOwner("theruiz-physical-integrity-grounding", "do not use hovering or decorative hand gestures");
      if (grounding) replace(rule, "negative-hand-contact", "weightless posture, hovering hands,", "weightless posture,", [grounding.id]);
    }
  }

  // Exact complete sentences may repeat along profile paths. Cross-rule
  // removal is safe only when the owning rule is mandatory (cannot be trimmed).
  const sentenceOwners = new Map<string, string>();
  const eligible = (rule: PromptRule) => !["user-extra-requirement", "user-upload"].includes(rule.source)
    && rule.id !== "theruiz-atmosphere-shared-compiler";
  const sentences = (text: string) => text.match(/\S[\s\S]*?(?:[.!?](?=\s|$)|$)/g) ?? [text];
  for (const rule of kept) {
    if (!eligible(rule) || !rule.required) continue;
    for (const sentence of sentences(rule.text)) {
      const key = sentence.trim();
      if (key && !sentenceOwners.has(key)) sentenceOwners.set(key, rule.id);
    }
  }
  for (const rule of kept) {
    if (!eligible(rule)) continue;
    const seen = new Set<string>();
    for (const sentence of sentences(rule.text)) {
      const key = sentence.trim();
      const owner = sentenceOwners.get(key);
      if (owner && owner !== rule.id) {
        replace(rule, "exact-shared-sentence", sentence, "", [owner]);
      } else if (key && seen.has(key)) {
        replace(rule, "exact-repeated-sentence", sentence, "");
      }
      seen.add(key);
    }
  }

  report.afterWords = kept.reduce((sum, rule) => sum + words(rule.text), 0);
  return { kept, report };
}
