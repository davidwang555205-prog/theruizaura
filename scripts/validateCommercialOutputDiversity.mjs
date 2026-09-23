import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-commercial-output-diversity-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const intents = [
  "URBAN_MOTION",
  "DAILY_STYLING",
  "QUIET_LUXURY",
  "PRODUCT_CRAFT",
  "NEW_ARRIVAL",
];

const coverage = [
  "silhouette",
  "toe_structure",
  "side_panel_structure",
  "heel_structure",
  "outsole_profile",
  "color_blocking",
  "material_evidence",
];

const zeroReference = {
  referenceSetId: "output-diversity-zero-reference",
  taskId: "output-diversity-task",
  sourceType: "current_task_reference_set",
  confirmationStatus: "incomplete",
  confirmedReferenceCount: 0,
  confirmedAssetIds: [],
  coverage: [],
  missingCoverage: coverage,
  referencePlanReady: false,
  productTruthMode: "reference_bound",
  productTruth: null,
};

// Observed V1.2 pre-compact execution lengths from the same local checkout.
// They are used only as historical comparison evidence, not as pass/fail gates.
const observedPreCompactCharacters = {
  URBAN_MOTION: 14791,
  DAILY_STYLING: 14727,
  QUIET_LUXURY: 14751,
  PRODUCT_CRAFT: 14865,
  NEW_ARRIVAL: 14732,
};

function requestFor(intent) {
  return {
    commercialIntent: intent,
    characterSelection: { ageProfileId: "age_33_37", appearanceGroupId: "asian" },
    season: "秋",
    lifestyleFeeling: "安静 / 自然 / 克制",
    duration: 15,
    generationNonce: 0,
    reference: zeroReference,
  };
}

function normalizedText(text) {
  return text
    .replace(/Use the footwear reference images[\s\S]*?(?=\n\n|$)/i, "")
    .replace(/\[NEGATIVES\][\s\S]*$/i, "")
    .replace(/Age:.*\nVisible appearance:.*\nWorld:.*\n/im, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shotTexts(outcome) {
  const text = outcome.modelFacingScript.compiledText;
  return outcome.plan.shotArchitecture.shots.map((shot) => {
    const start = text.indexOf(`SHOT ${shot.shotIndex + 1} — ${shot.role}`);
    const next = text.indexOf(`SHOT ${shot.shotIndex + 2} — `, start);
    return text.slice(start, next === -1 ? text.indexOf("[SOUND WORLD]") : next);
  });
}

function semanticContradictions(outcome) {
  const blocks = shotTexts(outcome);
  const plan = outcome.plan;
  const contradictions = [];
  blocks.forEach((block, index) => {
    const productBlock = block.match(/Product:\s*([^\n]+)/i)?.[1] ?? "";
    if (/\bproduct clear\b/i.test(productBlock) && /\bpartial\b/i.test(productBlock)) contradictions.push(`CLEAR_PARTIAL:${index + 1}`);
    if (/\bproduct not visible\b/i.test(productBlock) && /\b(?:full figure|visible footwear|shoe visible|clearly readable)\b/i.test(productBlock)) {
      contradictions.push(`ABSENT_VISIBLE:${index + 1}`);
    }
    if (plan.shotArchitecture.shots[index]?.role === "HERO" && /\b(?:incomplete|not yet|later reveal|still unclear)\b/i.test(productBlock)) {
      contradictions.push(`HERO_INCOMPLETE:${index + 1}`);
    }
    if (index === 0 && /\b(?:previous shot|continues from shot|prior beat)\b/i.test(block)) contradictions.push("SHOT1_PREVIOUS");
    if (index === 4 && /\b(?:next shot|next beat|prepares shot|future reveal)\b/i.test(block)) contradictions.push("SHOT5_NEXT");
  });
  if (plan.creativeSpine.revealStrategy === "DELAYED" && plan.creativeSpine.productPresenceByShot.indexOf("CLEAR") > 3) {
    contradictions.push("DELAYED_REVEAL_COMPREHENSION");
  }
  return contradictions;
}

function internalLeakage(text) {
  const tokens = [
    "PRIVATE_MOMENT",
    "CITY_JOURNEY",
    "EVERYDAY_MOVEMENT",
    "STATE_TRANSITION",
    "SENSORY_LIFE",
    "SINGLE_IDEA",
    "OBSERVE",
    "FOLLOW",
    "WAIT",
    "DISCOVER",
    "PASS_BY",
    "GROUND_OBSERVATION",
    "DETAIL_INTERRUPTION",
    "WITHHOLD",
    "REVEAL",
    "ACTION_CUT",
    "MATCH_MOVEMENT",
    "SENSORY_INSERT",
    "DELAYED_REVEAL",
    "THRESHOLD",
    "LIGHT",
    "REFLECTION",
    "SHADOW",
    "LINE",
    "REPETITION",
    "ACTION_COMPLETION",
    "ACTION_CONTINUATION",
    "VISUAL_MATCH",
    "ATTENTION_SHIFT",
    "SPATIAL_TRANSITION",
    "PRODUCT_DISCOVERY",
    "EMOTIONAL_RELEASE",
    "URBAN_MOTION",
    "DAILY_STYLING",
    "QUIET_LUXURY",
    "PRODUCT_CRAFT",
    "NEW_ARRIVAL",
    "ESTABLISH",
    "INVITE",
    "CONFIRM",
    "RESOLVE",
    "ABSENT",
    "IMPLIED",
    "PARTIAL",
    "SECONDARY",
    "CLEAR",
  ];
  return tokens.filter((token) => new RegExp(`\\b${token}\\b`).test(text));
}

function fingerprint(outcome) {
  const plan = outcome.plan;
  return {
    event: plan.eventSpine.eventChain.join(">"),
    actions: plan.actionPlan.map((item) => item.sourceActionFamily ?? item.primitiveId).join(">"),
    timing: plan.shotArchitecture.shots.map((shot) => shot.timeRange.durationSeconds).join("/"),
    camera: plan.creativeDirection.shotDirections.map((shot) => shot.perceptualSignature).join(">"),
    framing: plan.cameraPlan.shots.map((shot) => shot.framing).join(">"),
    visibility: plan.creativeSpine.productPresenceByShot.join(">"),
    location: plan.sceneWorld.sceneIds.join(">"),
    ending: plan.eventSpine.endingGrammar.id,
    sound: plan.soundPlan.shots.map((shot) => shot.dominantSound).join(">"),
  };
}

try {
  await writeFile(
    entryPath,
    `export * from ${JSON.stringify(resolve(projectRoot, "src/commercial-film/index.ts"))};\n`
  );
  await build({
    entryPoints: [entryPath],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile: bundlePath,
    logLevel: "silent",
  });
  const { runCommercialFilmPipeline } = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);

  const results = [];
  let eventCollapseFailures = 0;
  let genericActionFailures = 0;
  let timingCollapseFailures = 0;
  let cameraCollapseFailures = 0;
  let roleTemplateFailures = 0;
  let endingCollapseFailures = 0;
  let compactCollapseFailures = 0;
  let genericProductCraftFailures = 0;
  let quietLuxuryLocomotionFailures = 0;
  let newArrivalFailures = 0;
  let urbanMotionFailures = 0;
  let dailyStylingFailures = 0;
  let semanticContradictionFailures = 0;
  let brandLeakage = 0;
  let internalLeakageFailures = 0;
  let compactCompletenessFailures = 0;
  let executionOptionLeakage = 0;
  let executionStateContradictionFailures = 0;
  let soundContextMismatchFailures = 0;
  let sterileLuxuryWorldFailures = 0;
  let emptyCityFailures = 0;
  let onePersonWorldIsolationFailures = 0;
  let readableFakeSignageFailures = 0;
  let backgroundActivityDominanceFailures = 0;

  for (const intent of intents) {
    const outcome = runCommercialFilmPipeline(requestFor(intent));
    assert(outcome.status === "GENERATED", `${intent} was blocked: ${outcome.status === "BLOCKED" ? outcome.diagnostics.join(" | ") : ""}`);
    const plan = outcome.plan;
    const text = outcome.modelFacingScript.compiledText;
    const fp = fingerprint(outcome);
    const actionFamilies = plan.actionPlan.map((item) => item.sourceActionFamily ?? "commercial-only");
    const blocks = shotTexts(outcome);
    const actionLines = blocks.map((block) => block.match(/Action:\s*(.+)/)?.[1] ?? "").filter(Boolean);
    const eventSummary = {
      whatHappens: plan.eventSpine.shots.map((shot) => shot.whatHappens).join(" "),
      whyItHappens: plan.eventSpine.shots.map((shot) => shot.whyItHappens).join(" "),
      whatChanges: plan.eventSpine.shots.map((shot) => shot.whatChanges).join(" "),
      howItEnds: plan.eventSpine.endingGrammar.line,
    };

    const genericLocomotion = actionFamilies.filter((family) => /walking|transition|turning/.test(family)).length >= 3;
    const weakCausality = plan.eventSpine.shots.some((shot) => (
      !shot.causalFromPrevious.trim()
      || /continues through space|resumes walking|pauses naturally/i.test(shot.causalFromPrevious)
    ));
    if (genericLocomotion || weakCausality) genericActionFailures += 1;

    const durations = plan.shotArchitecture.shots.map((shot) => shot.timeRange.durationSeconds);
    if (durations.length !== 5
      || Math.abs(durations.reduce((sum, value) => sum + value, 0) - 15) > 0.01
      || new Set(durations).size === 1
      || durations.some((value) => value < 1 || value > 5)) {
      timingCollapseFailures += 1;
    }

    const perceptualSignatures = plan.creativeDirection.shotDirections.map((shot) => shot.perceptualSignature);
    if (new Set(perceptualSignatures).size < 3) cameraCollapseFailures += 1;
    if (internalLeakage(text).length > 0) internalLeakageFailures += 1;
    if ((text.match(/THERUIZ AURA/g) ?? []).length > 0) brandLeakage += 1;
    const contradictions = semanticContradictions(outcome);
    if (contradictions.length > 0) semanticContradictionFailures += 1;
    if (contradictions.length > 0) {
      console.log(`FAILED NONCE ${intent}: ${contradictions.join(", ")}`);
    }
    if (actionLines.some((line) => (
      /\bor\b/i.test(line)
      || /\b(?:completes a task|makes an adjustment|settles naturally|performs a small move|continues through space|pauses naturally)\b/i.test(line)
    ))) {
      executionOptionLeakage += 1;
    }
    if (blocks.some((block) => (
      (/\bheld frame\b/i.test(block) && /\bfollow/i.test(block))
      || (/\bstillness\b/i.test(block) && /\bcontinue stride/i.test(block))
      || (/\bcamera stays\b/i.test(block) && /\bfollow softly/i.test(block))
      || (/\bno new action\b/i.test(block) && /\benters and completes/i.test(block))
      || (/\bpause\b/i.test(block) && /\bleave before the action fully stops/i.test(block))
    ))) {
      executionStateContradictionFailures += 1;
    }
    const soundContextValid = plan.soundPlan.shots.every((shot) => shot.cues.length >= 1 && shot.cues.length <= 3)
      && /(?:urban exterior|private threshold to street|quiet private interior|working preparation interior|exterior threshold to arrival)/.test(plan.soundPlan.context);
    if (!soundContextValid) soundContextMismatchFailures += 1;
    const worldRealismValid = plan.worldRealism.line.length > 0
      && plan.worldRealism.backgroundSignals.length >= 3
      && /(?:inhabited|lived|used|real|materially|non-readable)/i.test(plan.worldRealism.line)
      && text.includes(plan.worldRealism.line)
      && /background life may remain distant and secondary/i.test(text);
    if (!worldRealismValid) sterileLuxuryWorldFailures += 1;
    if (["URBAN_MOTION", "NEW_ARRIVAL", "DAILY_STYLING"].includes(intent)
      && plan.worldRealism.density === "LOW_LIVED_IN"
      && plan.worldRealism.backgroundSignals.length < 3) {
      emptyCityFailures += 1;
    }
    if (/one person/.test(text) && !/background life|secondary/i.test(text)) {
      onePersonWorldIsolationFailures += 1;
    }
    if (/readable brand name/i.test(text) && !/no clearly readable invented brand names/i.test(text)) {
      readableFakeSignageFailures += 1;
    }
    if (/background activity.*lead|background.*dominates/i.test(text)) {
      backgroundActivityDominanceFailures += 1;
    }

    for (const required of ["[FILM IDEA]", "[CHARACTER / WORLD]", "[TIMING]", "[SOUND WORLD]", "[VISUAL LOOK]", "[GLOBAL PRODUCT PROTECTION]", "[NEGATIVES]"]) {
      if (!text.includes(required)) compactCompletenessFailures += 1;
    }
    if (!text.includes("footwear reference images uploaded in the external video generation tool")) compactCompletenessFailures += 1;
    if (!text.includes("hue, saturation, contrast") || !text.includes("faithful")) compactCompletenessFailures += 1;

    if (intent === "PRODUCT_CRAFT") {
      const detailRelationship = plan.eventSpine.shots[2]?.productDetailRelationship ?? "";
      if (
        !detailRelationship
        || !text.includes(detailRelationship)
        || !text.includes("external footwear references")
        || !text.includes("do not default to a full-shoe close-up")
      ) {
        genericProductCraftFailures += 1;
      }
    }
    if (intent === "QUIET_LUXURY") {
      const nonLocomotion = actionFamilies.some((family) => /standing|seated|garment-task|environment-response/.test(family));
      if (!nonLocomotion || actionFamilies.filter((family) => /walking|transition|turning/.test(family)).length >= 3) {
        quietLuxuryLocomotionFailures += 1;
      }
    }
    if (intent === "NEW_ARRIVAL") {
      if (!/(approach|threshold|arrival|settling|entry)/i.test(plan.eventSpine.eventChain.join("|"))) newArrivalFailures += 1;
    }
    if (intent === "URBAN_MOTION") {
      if (new Set(plan.sceneWorld.sceneIds).size < 2 || !/(CITY_ENTRY|ROUTE_CONTINUATION|GROUND_RELATION_CHANGE)/.test(plan.eventSpine.eventChain.join("|"))) {
        urbanMotionFailures += 1;
      }
    }
    if (intent === "DAILY_STYLING") {
      if (!/(WARDROBE_DECISION|PREPARATION|THRESHOLD_TEST|GARMENT_FOOT_RELATION)/.test(plan.eventSpine.eventChain.join("|"))) {
        dailyStylingFailures += 1;
      }
    }

    results.push({
      intent,
      eventSpine: plan.eventSpine.eventChain,
      actionChain: actionFamilies,
      timing: durations,
      perceptualCamera: perceptualSignatures,
      framing: plan.cameraPlan.shots.map((shot) => shot.framing),
      visibility: plan.creativeSpine.productPresenceByShot,
      endingGrammar: plan.eventSpine.endingGrammar.id,
      soundPattern: plan.soundPlan.shots.map((shot) => shot.dominantSound),
      eventSummary,
      fingerprint: fp,
      finalExecutionText: text,
      preCompactCharacterCount: observedPreCompactCharacters[intent],
      compactCharacterCount: text.length,
      compressionPercent: Number((100 * (1 - text.length / observedPreCompactCharacters[intent])).toFixed(1)),
    });
  }

  const eventChains = new Set(results.map((result) => result.eventSpine.join(">")));
  if (eventChains.size < intents.length) eventCollapseFailures += intents.length - eventChains.size;
  const timingProfiles = new Set(results.map((result) => result.timing.join("/")));
  if (timingProfiles.size < intents.length) timingCollapseFailures += intents.length - timingProfiles.size;
  const cameraSequences = new Set(results.map((result) => result.perceptualCamera.join(">")));
  if (cameraSequences.size < intents.length) cameraCollapseFailures += intents.length - cameraSequences.size;
  const endingGrammars = new Set(results.map((result) => result.endingGrammar));
  if (endingGrammars.size < intents.length) endingCollapseFailures += intents.length - endingGrammars.size;

  const roleFramings = ["WORLD", "WEAR", "DETAIL", "HERO", "RELEASE"].map((role, index) => ({
    role,
    framing: results.map((result) => result.framing[index]),
  }));
  roleFramings.forEach((entry) => {
    if (new Set(entry.framing).size < 3) roleTemplateFailures += 1;
  });

  const normalizedPrompts = new Set(results.map((result) => normalizedText(result.finalExecutionText)));
  if (normalizedPrompts.size < intents.length) compactCollapseFailures += intents.length - normalizedPrompts.size;

  const fingerprintMatrix = [];
  for (let firstIndex = 0; firstIndex < results.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < results.length; secondIndex += 1) {
      const first = results[firstIndex];
      const second = results[secondIndex];
      const dimensions = Object.keys(first.fingerprint);
      const sameDimensions = dimensions.filter((dimension) => first.fingerprint[dimension] === second.fingerprint[dimension]);
      const similarity = Number((sameDimensions.length / dimensions.length).toFixed(2));
      fingerprintMatrix.push({
        pair: `${first.intent} × ${second.intent}`,
        similarity,
        sameDimensions,
      });
    }
  }

  const similarities = fingerprintMatrix.map((entry) => entry.similarity);
  const averageSimilarity = Number((similarities.reduce((sum, value) => sum + value, 0) / similarities.length).toFixed(3));
  if (similarities.some((similarity) => similarity >= 0.75)) compactCollapseFailures += similarities.filter((similarity) => similarity >= 0.75).length;

  assert(eventCollapseFailures === 0, `${eventCollapseFailures} cross-intent event collapse failures remain.`);
  assert(genericActionFailures === 0, `${genericActionFailures} generic action-chain failures remain.`);
  assert(timingCollapseFailures === 0, `${timingCollapseFailures} timing profile collapse failures remain.`);
  assert(cameraCollapseFailures === 0, `${cameraCollapseFailures} perceptual camera collapse failures remain.`);
  assert(roleTemplateFailures === 0, `${roleTemplateFailures} semantic role shot-template failures remain.`);
  assert(endingCollapseFailures === 0, `${endingCollapseFailures} ending grammar collapse failures remain.`);
  assert(compactCollapseFailures === 0, `${compactCollapseFailures} compact prompt collapse failures remain.`);
  assert(genericProductCraftFailures === 0, `${genericProductCraftFailures} PRODUCT_CRAFT deferred-detail failures remain.`);
  assert(quietLuxuryLocomotionFailures === 0, `${quietLuxuryLocomotionFailures} QUIET_LUXURY locomotion collapse failures remain.`);
  assert(newArrivalFailures === 0, `${newArrivalFailures} NEW_ARRIVAL missing-arrival failures remain.`);
  assert(urbanMotionFailures === 0, `${urbanMotionFailures} URBAN_MOTION spatial-progression failures remain.`);
  assert(dailyStylingFailures === 0, `${dailyStylingFailures} DAILY_STYLING transition failures remain.`);
  assert(semanticContradictionFailures === 0, `${semanticContradictionFailures} final semantic contradictions remain.`);
  assert(brandLeakage === 0, `${brandLeakage} brand-name leakage cases remain.`);
  assert(internalLeakageFailures === 0, `${internalLeakageFailures} internal leakage cases remain.`);
  assert(compactCompletenessFailures === 0, `${compactCompletenessFailures} compact prompt completeness failures remain.`);
  assert(executionOptionLeakage === 0, `${executionOptionLeakage} execution option leakages remain.`);
  assert(executionStateContradictionFailures === 0, `${executionStateContradictionFailures} execution state contradictions remain.`);
  assert(soundContextMismatchFailures === 0, `${soundContextMismatchFailures} sound context mismatches remain.`);
  assert(sterileLuxuryWorldFailures === 0, `${sterileLuxuryWorldFailures} sterile world failures remain.`);
  assert(emptyCityFailures === 0, `${emptyCityFailures} empty-city failures remain.`);
  assert(onePersonWorldIsolationFailures === 0, `${onePersonWorldIsolationFailures} one-person world isolation failures remain.`);
  assert(readableFakeSignageFailures === 0, `${readableFakeSignageFailures} readable fake-signage failures remain.`);
  assert(backgroundActivityDominanceFailures === 0, `${backgroundActivityDominanceFailures} background activity dominance failures remain.`);

  const blindSummaries = results.map((result, index) => ({
    case: `SUMMARY ${index + 1}`,
    ...result.eventSummary,
  }));
  const blindFingerprints = new Set(blindSummaries.map((summary) => JSON.stringify(summary)));
  assert(blindFingerprints.size === intents.length, "Blind event summaries collapsed into fewer than five distinct structures.");

  console.log("COMMERCIAL FILM V1.2.1 OUTPUT DIVERSITY VALIDATION PASS:", JSON.stringify({
    stage: "COMMERCIAL_OUTPUT_DIVERSITY_V1_2_1",
    fiveIntentsStructurallyDistinct: true,
    eventCollapseFailures,
    genericActionFailures,
    timingCollapseFailures,
    fixedEqualTimingRemaining: results.some((result) => new Set(result.timing).size === 1),
    cameraCollapseFailures,
    semanticRoleTemplateFailures: roleTemplateFailures,
    endingCollapseFailures,
    compactCollapseFailures,
    semanticContradictionFailures,
    brandLeakage,
    internalLeakageFailures,
    compactCompletenessFailures,
    executionOptionLeakage,
    executionStateContradictionFailures,
    soundContextMismatchFailures,
    sterileLuxuryWorldFailures,
    emptyCityFailures,
    onePersonWorldIsolationFailures,
    readableFakeSignageFailures,
    backgroundActivityDominanceFailures,
    averageCrossIntentSimilarity: averageSimilarity,
    observedPreCompactCharacterCount: results.map((result) => ({ intent: result.intent, characters: result.preCompactCharacterCount })),
    newCharacterCount: results.map((result) => ({ intent: result.intent, characters: result.compactCharacterCount })),
    compressionPercent: results.map((result) => ({ intent: result.intent, percent: result.compressionPercent })),
    results: results.map((result) => ({
      intent: result.intent,
      eventSpine: result.eventSpine,
      actionChain: result.actionChain,
      timing: result.timing,
      perceptualCamera: result.perceptualCamera,
      framing: result.framing,
      visibility: result.visibility,
      endingGrammar: result.endingGrammar,
      soundPattern: result.soundPattern,
      blindSummary: result.eventSummary,
      fingerprint: result.fingerprint,
      finalExecutionText: result.finalExecutionText,
    })),
    fingerprintMatrix,
    blindSummaries,
  }, null, 2));
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
