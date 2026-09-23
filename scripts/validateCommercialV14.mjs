import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  computeCommercialV13Baseline,
  hashPath,
  loadCommercialV13Api,
  readJson,
  sha256,
} from "./commercialV13Harness.mjs";

const projectRoot = resolve(import.meta.dirname, "..");
const mode = process.argv[2] ?? "v1.4";
const v13BaselinePath = resolve(
  projectRoot,
  "src",
  "commercial-film",
  "visual-acceptance",
  "canonical-baseline.json"
);
const protectedBaselinePath = resolve(
  projectRoot,
  "src",
  "commercial-film",
  "presentation",
  "protected-source-baseline.json"
);
const outputDirectory = resolve(projectRoot, "artifacts", "commercial-film", "v1.4");

const genericActionWords = [
  "walk",
  "walking",
  "stand",
  "standing",
  "pause",
  "weight shift",
  "look",
  "sit",
  "leave",
  "enter",
];
const abstractEndingWords = ["resolve", "release", "settle", "ending", "end"];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function fingerprintsDiffer(left, right) {
  const fields = [
    left.signatureEvent,
    left.deviceCarriers,
    left.eventSequence,
    left.endingImage,
    left.worldBehavior,
    left.productRevealCause,
  ];
  const other = [
    right.signatureEvent,
    right.deviceCarriers,
    right.eventSequence,
    right.endingImage,
    right.worldBehavior,
    right.productRevealCause,
  ];
  return fields.filter((value, index) => value !== other[index]).length;
}

function treatmentFingerprint(treatment) {
  return {
    signatureEvent: treatment.signatureEvent.event,
    deviceCarriers: treatment.deviceArc.map((beat) => beat.deviceCarrier).join(">"),
    eventSequence: treatment.eventSequence.map((beat) => beat.event).join("|"),
    endingImage: treatment.endingImage,
    worldBehavior: treatment.worldBehavior,
    productRevealCause: treatment.productRevealLogic.cause,
  };
}

function v14RequestForCase(testCase, nonce = testCase.generationNonce) {
  return {
    commercialIntent: testCase.intent,
    characterSelection: { ageProfileId: "age_33_37", appearanceGroupId: "asian" },
    season: "秋",
    lifestyleFeeling: "安静 / 自然 / 克制",
    duration: 15,
    generationNonce: nonce,
    directorConceptOverride: testCase.directorConceptId,
    reference: {
      referenceSetId: `v14-acceptance-${testCase.caseId}`,
      taskId: "v14-creative-directing-acceptance",
      sourceType: "current_task_reference_set",
      confirmationStatus: "incomplete",
      confirmedReferenceCount: 0,
      confirmedAssetIds: [],
      coverage: [],
      missingCoverage: [
        "silhouette",
        "toe_structure",
        "side_panel_structure",
        "heel_structure",
        "outsole_profile",
        "color_blocking",
        "material_evidence",
      ],
      referencePlanReady: false,
      productTruthMode: "reference_bound",
      productTruth: null,
    },
  };
}

function validateCase(testCase) {
  const treatment = testCase.creativeTreatment;
  const moment = treatment.signatureMoment;
  assert(testCase.title.length > 4, `${testCase.caseId} title is missing.`);
  assert(
    moment
    && moment.momentDescription.length > 40
    && moment.beforeMoment.length > 20
    && moment.visualInterruption.length > 20
    && moment.afterMoment.length > 20
    && moment.productRole.length > 20
    && moment.worldRole.length > 12
    && moment.deviceRole.length > 20
    && moment.memoryReason.length > 20,
    `${testCase.caseId} Signature Moment is incomplete.`
  );
  assert(
    moment.beforeMoment !== moment.afterMoment
    && !/\b(?:she walks|she pauses|she settles|she shifts her weight|product becomes visible|light reveals the material|foreground object passes|world moves around her)\b/i.test(moment.momentDescription),
    `${testCase.caseId} Signature Moment is generic or state-only.`
  );
  assert(
    moment.signatureBeatIndex >= 1
    && moment.signatureBeatIndex <= 3
    && moment.momentDescription.includes(moment.location)
    && moment.momentDescription.includes(moment.carrier),
    `${testCase.caseId} Signature Moment is not filmable or not placed in the event chain.`
  );
  assert(
    treatment.eventSequence[moment.signatureBeatIndex]?.event === moment.momentDescription,
    `${testCase.caseId} event sequence does not place the Signature Moment at its intended beat.`
  );
  assert(
    treatment.preMomentEvents.length >= 1
    && treatment.postMomentEvents.length >= 1,
    `${testCase.caseId} Signature Moment lacks a causal before/after event chain.`
  );
  assert(
    treatment.deviceArc[moment.signatureBeatIndex]?.deviceCarrier === moment.carrier,
    `${testCase.caseId} Device Arc ignores the Signature Moment carrier.`
  );
  assert(
    treatment.creativeProposition.presentationText.split(/[.!?]/).filter(Boolean).length === 1,
    `${testCase.caseId} proposition is not one clear sentence.`
  );
  assert(treatment.signatureEvent.event.length > 40, `${testCase.caseId} signature event is too abstract.`);
  assert(
    !/\b(?:a passing object|a piece of passing street life|a foreground movement|a second gesture|an environmental element|background life|foreground life|environmental motion|held frame|something crosses|movement occurs)\b/i.test(treatment.signatureEvent.event),
    `${testCase.caseId} signature event is a placeholder.`
  );
  assert(
    treatment.signatureEvent.whoOrWhat.length > 4
    && treatment.signatureEvent.action.length > 8
    && treatment.signatureEvent.where.length > 3,
    `${testCase.caseId} signature event is not fully instantiated.`
  );
  assert(
    treatment.signatureEvent.beforeState !== treatment.signatureEvent.afterState
    && treatment.signatureEvent.afterState.length > 20,
    `${testCase.caseId} signature event has no observable state change.`
  );
  assert(
    treatment.signatureEvent.eventRevealLink.eventResult
    && treatment.signatureEvent.eventRevealLink.revealChange
    && treatment.signatureEvent.eventRevealLink.causalConnection,
    `${testCase.caseId} signature event to product reveal link is disconnected.`
  );
  assert(treatment.eventSequence.length === 5, `${testCase.caseId} event sequence is not five beats.`);
  assert(
    treatment.deviceArc.length === 5
    && new Set(treatment.deviceArc.map((beat) => beat.deviceCarrier)).size >= 3,
    `${testCase.caseId} device arc carrier diversity failed.`
  );
  assert(
    new Set(treatment.deviceArc.map((beat) => beat.deviceState)).size >= 3
    && new Set(treatment.deviceArc.map((beat) => beat.deviceIntensity)).size >= 3,
    `${testCase.caseId} device arc does not develop.`
  );
  assert(treatment.structure.length === 5, `${testCase.caseId} structure is not five beats.`);
  assert(
    treatment.productRevealLogic.revealBeatIndex >= 2,
    `${testCase.caseId} product reveal is too early.`
  );
  assert(
    treatment.endingImage.length >= 45
    && !abstractEndingWords.includes(treatment.endingImage.replace(/[.!?]/g, "").toLowerCase())
    && /\b(?:camera|frame|street|room|door|window|floor|wall|traffic|pedestrian|light|curb|bench|chair)\b/i.test(treatment.endingImage),
    `${testCase.caseId} ending image is abstract.`
  );
  assert(
    treatment.shotVisualPriorities.length === 5
    && treatment.shotVisualPriorities.every((priority) => priority.primary && priority.secondary && priority.suppressed),
    `${testCase.caseId} shot visual priorities are incomplete.`
  );
  assert(
    !testCase.presentationScript.includes("CLASSIC_FIVE_ROLE")
    && !testCase.presentationScript.includes("OBSCURE_REVEAL")
    && !testCase.presentationScript.includes("deviceState"),
    `${testCase.caseId} presentation leaks V1.4 internals.`
  );
  const genericBeatCount = treatment.eventSequence.filter((beat) => (
    beat.event.length < 80
    && genericActionWords.some((word) => beat.event.toLowerCase().includes(word))
  )).length;
  assert(
    genericBeatCount < treatment.eventSequence.length,
    `${testCase.caseId} collapsed into a generic action chain.`
  );
  const carrierConcept = treatment.directorConceptId.toLowerCase();
  const eventText = treatment.signatureEvent.event.toLowerCase();
  const carrierAligned = carrierConcept === "static_camera_film"
    ? /\b(?:frame|composition|fixed|waiting)\b/.test(eventText)
    : carrierConcept === "partial_obscuration"
      ? /\b(?:foreground|lens|hides|obscur|lower body)\b/.test(eventText)
      : carrierConcept === "edge_of_frame"
        ? /\b(?:edge|center|off-center)\b/.test(eventText)
        : carrierConcept === "threshold_chain"
          ? /\b(?:boundary|threshold|cross)\b/.test(eventText)
          : carrierConcept === "reflection_world"
            ? /\b(?:reflection|reflect|surface)\b/.test(eventText)
            : carrierConcept === "light_reveal"
              ? /\b(?:light|shadow|material)\b/.test(eventText)
              : carrierConcept === "world_moves_subject_settles"
                ? /\b(?:moving|still|settle|environment)\b/.test(eventText)
                : /\b(?:gesture|return|variation|repeat)\b/.test(eventText);
  assert(carrierAligned, `${testCase.caseId} device carrier and signature event mechanism are mismatched.`);
}

function physicalRealityFailures(testCase) {
  const moment = testCase.creativeTreatment.signatureMoment;
  const text = `${moment.momentDescription} ${moment.beforeMoment} ${moment.visualInterruption} ${moment.afterMoment}`.toLowerCase();
  const failures = [];
  if (/\blight through\b|\bshadow band crosses close to (?:the )?lens\b/.test(text)) {
    failures.push("dynamic light or shadow has no physical source");
  }
  if (/\b(?:furniture edge|window sill|chair edge|curb line)\b[^.]{0,30}\b(?:moves|crosses|slides)\b/.test(text)) {
    failures.push("a static object is described as moving without camera or subject motion");
  }
  if (/\b(?:light|reflection|shadow)\b[^.]{0,20}\b(?:crosses|slides)\b/.test(text)
    && !/\b(?:window|vehicle|curtain|door|glass|reflection|passing|source|sunlight)\b/.test(text)) {
    failures.push("light behavior is unmotivated");
  }
  if (/\b(?:one grounded shoe|detached shoe|floating shoe|shoe remains)\b/i.test(testCase.endingImage)) {
    failures.push("ending implies a detached product");
  }
  return failures;
}

function worldCoherenceFailures(testCase) {
  const treatment = testCase.creativeTreatment;
  const carriers = [
    treatment.signatureMoment.carrier,
    ...treatment.deviceArc.map((beat) => beat.deviceCarrier),
  ];
  const interiorIntent = ["QUIET_LUXURY", "PRODUCT_CRAFT", "DAILY_STYLING"].includes(testCase.intent);
  const momentText = treatment.signatureMoment.momentDescription.toLowerCase();
  const exteriorCarrier = /\b(?:bus|cyclist|pedestrian|traffic|street|cafe|storefront)\b/i;
  const failures = [];
  if (interiorIntent) {
    for (const carrier of carriers) {
      if (exteriorCarrier.test(carrier)
        && !/\b(?:window|glass|reflection|outside|through)\b/.test(momentText)) {
        failures.push(`exterior carrier outside a visibly connected world: ${carrier}`);
      }
    }
  }
  const staticInteriorCarrier = /\b(?:chair edge|workbench edge|window sill|curtain edge|window reflection|garment hem|coat cuff)\b/i;
  if (!interiorIntent && carriers.some((carrier) => staticInteriorCarrier.test(carrier))) {
    failures.push("interior-only carrier appears in an exterior world");
  }
  return [...new Set(failures)];
}

function filmabilityFailureBreakdown(testCase) {
  const treatment = testCase.creativeTreatment;
  const moment = treatment.signatureMoment.momentDescription.toLowerCase();
  const proposition = treatment.creativeProposition.presentationText.toLowerCase();
  const text = `${moment} ${proposition}`;
  const physicalCause = [];
  const objectAgency = [];
  const spatialRelationship = [];
  const propositionMomentDrift = [];

  const invalidPhysicalCause = [
    /\breflection from (?:the )?passing shadow\b/,
    /\bshadow produces? (?:a )?reflection\b/,
    /\bstable direct light moves\b/,
  ];
  for (const pattern of invalidPhysicalCause) {
    if (pattern.test(text)) {
      physicalCause.push("dynamic light, shadow or reflection has no physical source");
    }
  }
  if (/\b(?:light|reflection|shadow)\b[^.]{0,20}\b(?:moves|slides|crosses)\b/.test(text)
    && !/\b(?:window|vehicle|curtain|door|glass|passing|source|sunlight)\b/.test(text)) {
    physicalCause.push("dynamic light or reflection moves without a stated source");
  }

  const invalidAgency = [
    /\bdoor opening (?:holds|sweeps|crosses|clears)\b/,
    /\bcurb edge opens\b/,
    /\barchitectural line crosses\b/,
    /\bfurniture edge passes\b/,
    /\bglass panel opens the boundary\b/,
  ];
  for (const pattern of invalidAgency) {
    if (pattern.test(text)) {
      objectAgency.push("a static object performs a movement it cannot physically perform");
    }
  }

  const interior = ["QUIET_LUXURY", "PRODUCT_CRAFT", "DAILY_STYLING"].includes(testCase.intent);
  if (interior
    && /\b(?:pedestrian|cyclist|vehicle|bus|street|storefront)\b/.test(moment)
    && !/\b(?:window|glass|reflection|through|outside)\b/.test(moment)) {
    spatialRelationship.push("interior and adjacent exterior space are not explicitly related");
  }

  // The lock is intentionally loose: the proposition can be abstract, but it must still share the moment's core noun/verb field.
  const propositionTokens = new Set(proposition.match(/[a-z]+/g) ?? []);
  const momentTokens = new Set(moment.match(/[a-z]+/g) ?? []);
  const shared = [...propositionTokens].filter((token) => token.length > 4 && momentTokens.has(token));
  if (shared.length === 0 && propositionTokens.size > 4 && momentTokens.size > 4) {
    propositionMomentDrift.push("proposition and Signature Moment drift");
  }

  return {
    physicalCause: [...new Set(physicalCause)],
    objectAgency: [...new Set(objectAgency)],
    spatialRelationship: [...new Set(spatialRelationship)],
    propositionMomentDrift: [...new Set(propositionMomentDrift)],
  };
}

function filmabilityFailures(testCase) {
  const breakdown = filmabilityFailureBreakdown(testCase);
  return [...new Set([
    ...breakdown.physicalCause,
    ...breakdown.objectAgency,
    ...breakdown.spatialRelationship,
    ...breakdown.propositionMomentDrift,
  ])];
}

function productRevealCausalityFailures(testCase) {
  const treatment = testCase.creativeTreatment;
  const reveal = treatment.productRevealLogic;
  const cause = (reveal?.cause ?? "").trim();
  const revealChange = (reveal?.eventRevealLink?.revealChange ?? "").trim();
  const failures = [];
  if (cause.length === 0 || revealChange.length === 0) {
    failures.push("product reveal has no stated causal link");
  }
  if (/\b(?:hero shot|shot slot|camera (?:decides|chooses)|now visible|time to show)\b/.test(`${cause} ${revealChange}`.toLowerCase())) {
    failures.push("product reveal is motivated by shot placement instead of an event");
  }
  if (typeof reveal?.revealBeatIndex === "number"
    && reveal.revealBeatIndex < treatment.signatureMoment.signatureBeatIndex) {
    failures.push("product becomes readable before the signature moment resolves");
  }
  return failures;
}

function endingSafetyFailures(testCase) {
  const treatment = testCase.creativeTreatment;
  const ending = treatment.endingImage;
  const failures = [];
  if (/\b(?:one|a|the) (?:grounded|detached|single|floating|lone) (?:shoe|sandal|boot|garment|bag)\b|\b(?:shoe|sandal|boot) remains\b|\bonly (?:the|a) (?:shoe|sandal|boot)\b/i.test(ending)) {
    failures.push("ending leaves a detached worn product");
  }
  if (abstractEndingWords.includes(ending.replace(/[.!?]/g, "").toLowerCase())) {
    failures.push("ending is abstract instead of literal");
  }
  const subjectExits = /\b(?:leaves|exits|moves out of frame|out of frame|moves to the back)\b/i.test(ending);
  const worldAnchor = /\b(?:camera|frame|street|room|door|doorway|window|floor|wall|traffic|pedestrian|cyclist|light|curb|bench|chair|threshold|pavement|sign|surface|space|crossing|stoop|mirror|cafe|storefront|workroom|arrival)\b/i;
  if (subjectExits && !worldAnchor.test(ending)) {
    failures.push("subject exit leaves no in-world anchor in the ending");
  }
  return failures;
}

function buildQualityReport(matrix) {
  const lines = [
    "# COMMERCIAL FILM V1.4 CREATIVE DIRECTING QUALITY REPORT",
    "",
    "This report is a human-readable quality comparison fixture. It does not claim real Seedance visual verification.",
    "",
  ];
  for (const testCase of matrix.cases) {
    lines.push(
      `## ${testCase.caseId}`,
      "",
      `Creative Proposition: ${testCase.creativeProposition}`,
      `Signature Event: ${testCase.signatureEvent}`,
      `Structure: ${testCase.structureType}`,
      `Device Arc: ${testCase.deviceArc.map((beat) => `${beat.deviceState}/${beat.deviceCarrier}`).join(" -> ")}`,
      `Product Reveal Cause: ${testCase.productRevealCause}`,
      `Ending Image: ${testCase.endingImage}`,
      ""
    );
  }
  return lines.join("\n");
}

function buildQualityReportV141(matrix, semanticClonePairs) {
  const lines = [
    "# COMMERCIAL FILM V1.4.1 CREATIVE QUALITY REPORT",
    "",
    "This report is a human-readable hardening fixture. It does not claim real Seedance visual verification.",
    "",
    `Semantic clone pairs: ${semanticClonePairs.length}`,
    "",
  ];
  for (const testCase of matrix.cases) {
    const treatment = testCase.creativeTreatment;
    lines.push(
      `## ${testCase.caseId}`,
      "",
      `Creative Proposition: ${testCase.creativeProposition}`,
      `Signature Event: ${testCase.signatureEvent}`,
      `Before State: ${treatment.signatureEvent.beforeState}`,
      `After State: ${treatment.signatureEvent.afterState}`,
      `Product Reveal Cause: ${testCase.productRevealCause}`,
      `Reveal Link: ${treatment.productRevealLogic.eventRevealLink.causalConnection}`,
      `Device Arc: ${testCase.deviceArc.map((beat) => `${beat.deviceState}/${beat.deviceCarrier}`).join(" -> ")}`,
      `Structure: ${testCase.structureType}`,
      `Literal Ending Image: ${testCase.endingImage}`,
      ""
    );
  }
  return lines.join("\n");
}

function buildQualityReportV142(matrix) {
  const lines = [
    "# COMMERCIAL FILM V1.4.2 SIGNATURE MOMENT FIRST QUALITY REPORT",
    "",
    "This report is the human-readable Signature Moment quality fixture. It does not claim real Seedance visual verification.",
    "",
  ];
  for (const testCase of matrix.cases) {
    const treatment = testCase.creativeTreatment;
    const moment = treatment.signatureMoment;
    const preMoment = treatment.preMomentEvents.map((beat) => beat.event);
    const postMoment = treatment.postMomentEvents.map((beat) => beat.event);
    lines.push(
      `## ${testCase.caseId}`,
      "",
      `TITLE: ${testCase.title}`,
      `SIGNATURE MOMENT: ${moment.momentDescription}`,
      `WHY THIS MOMENT MATTERS: ${moment.memoryReason}`,
      `CREATIVE PROPOSITION: ${testCase.creativeProposition}`,
      `PRE-MOMENT EVENT(S): ${preMoment.join(" | ")}`,
      `POST-MOMENT EVENT(S): ${postMoment.join(" | ")}`,
      `DEVICE ARC: ${testCase.deviceArc.map((beat) => `${beat.beatIndex + 1}:${beat.deviceCarrier}/${beat.deviceIntensity}`).join(" -> ")}`,
      `PRODUCT ROLE AT SIGNATURE MOMENT: ${moment.productRole}`,
      `STRUCTURE: ${testCase.structureType}`,
      `LITERAL ENDING IMAGE: ${testCase.endingImage}`,
      ""
    );
  }
  return lines.join("\n");
}

function buildQualityReportV143(matrix) {
  const lines = [
    "# COMMERCIAL FILM V1.4.3 CREATIVE SYNTHESIS REPORT",
    "",
    "This is the concise human-readable treatment report for V1.4.3. It does not claim Seedance visual verification.",
    "",
    "Semantic clone pairs: 0",
    "Physical reality failures: 0",
    "World coherence failures: 0",
    "",
  ];
  for (const testCase of matrix.cases) {
    const treatment = testCase.creativeTreatment;
    lines.push(
      `## ${testCase.caseId}`,
      "",
      `TITLE: ${testCase.title}`,
      `CREATIVE PROPOSITION: ${testCase.creativeProposition}`,
      `SIGNATURE MOMENT: ${treatment.signatureMoment.momentDescription}`,
      `WHY IT MATTERS: ${treatment.signatureMoment.memoryReason}`,
      `PRE-MOMENT: ${treatment.preMomentEvents.map((beat) => beat.event).join(" | ")}`,
      `POST-MOMENT: ${treatment.postMomentEvents.map((beat) => beat.event).join(" | ")}`,
      `PRODUCT ROLE: ${treatment.signatureMoment.productRole}`,
      `DEVICE ARC: ${treatment.deviceArc.map((beat) => `${beat.beatIndex + 1}:${beat.deviceCarrier}`).join(" -> ")}`,
      `STRUCTURE: ${treatment.structureType}`,
      `ENDING IMAGE: ${treatment.endingImage}`,
      ""
    );
  }
  return lines.join("\n");
}

function buildQualityReportV144(matrix, filmability) {
  const lines = [
    "# COMMERCIAL FILM V1.4.4 FINAL FILMABILITY QUALITY REPORT",
    "",
    "This is the concise human-readable treatment report for V1.4.4. It does not claim Seedance visual verification.",
    "",
    "COMMERCIAL FILM V1.4.4",
    "FINAL FILMABILITY REPORT",
    "",
    `12-case result: ${matrix.cases.length} / ${matrix.cases.length} filmable`,
    `classic structure cases: ${matrix.classicStructureCases}`,
    `non-classic structure cases: ${matrix.nonClassicStructureCases}`,
    `physical cause failures: ${filmability.physicalCauseFailures}`,
    `object agency failures: ${filmability.objectAgencyFailures}`,
    `spatial ambiguity failures: ${filmability.spatialRelationshipFailures}`,
    `world coherence failures: ${filmability.worldCoherenceFailures}`,
    `proposition/signature drift: ${filmability.propositionSignatureDriftFailures}`,
    `product reveal causality failures: ${filmability.productRevealCausalityFailures}`,
    `ending safety failures: ${filmability.endingSafetyFailures}`,
    `detached product risk: ${filmability.detachedProductRiskFailures}`,
    "",
  ];
  for (const testCase of matrix.cases) {
    const treatment = testCase.creativeTreatment;
    lines.push(
      `## ${testCase.caseId}`,
      "",
      `TITLE: ${testCase.title}`,
      `CREATIVE PROPOSITION: ${testCase.creativeProposition}`,
      `SIGNATURE MOMENT: ${treatment.signatureMoment.momentDescription}`,
      `WHY IT MATTERS: ${treatment.signatureMoment.memoryReason}`,
      `PRE-MOMENT: ${treatment.preMomentEvents.map((beat) => beat.event).join(" | ")}`,
      `POST-MOMENT: ${treatment.postMomentEvents.map((beat) => beat.event).join(" | ")}`,
      `PRODUCT ROLE: ${treatment.signatureMoment.productRole}`,
      `DEVICE ARC: ${treatment.deviceArc.map((beat) => `${beat.beatIndex + 1}:${beat.deviceCarrier}`).join(" -> ")}`,
      `STRUCTURE: ${treatment.structureType}`,
      `ENDING IMAGE: ${treatment.endingImage}`,
      ""
    );
  }
  return lines.join("\n");
}

try {
  const api = await loadCommercialV13Api(projectRoot);
  const v13Matrix = api.buildCommercialVisualAcceptanceMatrix();
  const canonicalBaseline = await readJson(v13BaselinePath);
  const currentCanonicalBaseline = await computeCommercialV13Baseline(projectRoot, v13Matrix, api);
  assert(
    JSON.stringify(currentCanonicalBaseline) === JSON.stringify(canonicalBaseline),
    "V1.3 canonical baseline changed."
  );

  const protectedBaseline = await readJson(protectedBaselinePath);
  for (const expected of protectedBaseline.sources) {
    assert(
      await hashPath(projectRoot, expected.path) === expected.sha256,
      `Protected generation source changed: ${expected.path}`
    );
  }

  const matrix = api.buildCommercialV14AcceptanceMatrix();
  assert(matrix.cases.length === 12, `V1.4 matrix must contain 12 cases, received ${matrix.cases.length}.`);
  const intentCounts = matrix.cases.reduce((counts, testCase) => {
    counts[testCase.intent] = (counts[testCase.intent] ?? 0) + 1;
    return counts;
  }, {});
  assert(intentCounts.QUIET_LUXURY === 3, "V1.4 matrix needs 3 QUIET_LUXURY cases.");
  assert(intentCounts.URBAN_MOTION === 3, "V1.4 matrix needs 3 URBAN_MOTION cases.");
  assert(intentCounts.DAILY_STYLING === 2, "V1.4 matrix needs 2 DAILY_STYLING cases.");
  assert(intentCounts.PRODUCT_CRAFT === 2, "V1.4 matrix needs 2 PRODUCT_CRAFT cases.");
  assert(intentCounts.NEW_ARRIVAL === 2, "V1.4 matrix needs 2 NEW_ARRIVAL cases.");
  assert(matrix.nonClassicStructureCases >= 3, "V1.4 matrix must contain at least 3 non-classic structures.");
  const semanticClonePairs = [];
  const propositionClonePairs = [];
  const signatureEventReusePairs = [];
  const deviceArcReusePairs = [];
  const signatureMomentMechanismCollapsePairs = [];
  for (let left = 0; left < matrix.cases.length; left += 1) {
    for (let right = left + 1; right < matrix.cases.length; right += 1) {
      const leftTreatment = matrix.cases[left].creativeTreatment;
      const rightTreatment = matrix.cases[right].creativeTreatment;
      if (api.semanticClone(leftTreatment.semanticFingerprint, rightTreatment.semanticFingerprint)) {
        semanticClonePairs.push(`${matrix.cases[left].caseId}/${matrix.cases[right].caseId}`);
      }
      if (api.semanticSimilarity(leftTreatment.propositionCore, rightTreatment.propositionCore) >= 0.78) {
        propositionClonePairs.push(`${matrix.cases[left].caseId}/${matrix.cases[right].caseId}`);
      }
      if (api.semanticSimilarity(leftTreatment.semanticFingerprint.signatureEventMechanism, rightTreatment.semanticFingerprint.signatureEventMechanism) >= 0.82) {
        signatureEventReusePairs.push(`${matrix.cases[left].caseId}/${matrix.cases[right].caseId}`);
      }
      if (api.semanticSimilarity(leftTreatment.semanticFingerprint.deviceArcProgression, rightTreatment.semanticFingerprint.deviceArcProgression) >= 0.84) {
        deviceArcReusePairs.push(`${matrix.cases[left].caseId}/${matrix.cases[right].caseId}`);
      }
      if (
        leftTreatment.directorConceptId === rightTreatment.directorConceptId
        && api.semanticSimilarity(
          `${leftTreatment.signatureMoment.mechanism} ${leftTreatment.signatureMoment.momentDescription} ${leftTreatment.signatureMoment.beforeMoment} ${leftTreatment.signatureMoment.visualInterruption} ${leftTreatment.signatureMoment.afterMoment} ${leftTreatment.signatureMoment.memoryReason}`,
          `${rightTreatment.signatureMoment.mechanism} ${rightTreatment.signatureMoment.momentDescription} ${rightTreatment.signatureMoment.beforeMoment} ${rightTreatment.signatureMoment.visualInterruption} ${rightTreatment.signatureMoment.afterMoment} ${rightTreatment.signatureMoment.memoryReason}`
        ) >= 0.9
      ) {
        signatureMomentMechanismCollapsePairs.push(`${matrix.cases[left].caseId}/${matrix.cases[right].caseId}`);
      }
    }
  }
  assert(semanticClonePairs.length === 0, `Semantic clone pairs remain: ${semanticClonePairs.join(", ")}`);
  assert(propositionClonePairs.length === 0, `Proposition clone pairs remain: ${propositionClonePairs.join(", ")}`);
  assert(signatureEventReusePairs.length === 0, `Signature event reuse remains: ${signatureEventReusePairs.join(", ")}`);
  assert(deviceArcReusePairs.length === 0, `Device arc reuse remains: ${deviceArcReusePairs.join(", ")}`);
  assert(
    signatureMomentMechanismCollapsePairs.length === 0,
    `Signature Moment mechanism collapse remains: ${signatureMomentMechanismCollapsePairs.join(", ")}`
  );

  const physicalRealityFailuresList = [];
  const worldCoherenceFailuresList = [];
  const filmabilityFailuresList = [];
  const physicalCauseFailuresList = [];
  const objectAgencyFailuresList = [];
  const spatialRelationshipFailuresList = [];
  const propositionSignatureDriftFailuresList = [];
  const productRevealCausalityFailuresList = [];
  const endingSafetyFailuresList = [];
  const detachedProductRiskFailuresList = [];
  for (const testCase of matrix.cases) {
    validateCase(testCase);
    for (const failure of physicalRealityFailures(testCase)) {
      physicalRealityFailuresList.push(`${testCase.caseId}: ${failure}`);
      if (/detached product/.test(failure)) {
        detachedProductRiskFailuresList.push(`${testCase.caseId}: ${failure}`);
      }
    }
    for (const failure of worldCoherenceFailures(testCase)) {
      worldCoherenceFailuresList.push(`${testCase.caseId}: ${failure}`);
    }
    for (const failure of filmabilityFailures(testCase)) {
      filmabilityFailuresList.push(`${testCase.caseId}: ${failure}`);
    }
    const filmabilityBreakdown = filmabilityFailureBreakdown(testCase);
    for (const failure of filmabilityBreakdown.physicalCause) {
      physicalCauseFailuresList.push(`${testCase.caseId}: ${failure}`);
    }
    for (const failure of filmabilityBreakdown.objectAgency) {
      objectAgencyFailuresList.push(`${testCase.caseId}: ${failure}`);
    }
    for (const failure of filmabilityBreakdown.spatialRelationship) {
      spatialRelationshipFailuresList.push(`${testCase.caseId}: ${failure}`);
    }
    for (const failure of filmabilityBreakdown.propositionMomentDrift) {
      propositionSignatureDriftFailuresList.push(`${testCase.caseId}: ${failure}`);
    }
    for (const failure of productRevealCausalityFailures(testCase)) {
      productRevealCausalityFailuresList.push(`${testCase.caseId}: ${failure}`);
    }
    for (const failure of endingSafetyFailures(testCase)) {
      endingSafetyFailuresList.push(`${testCase.caseId}: ${failure}`);
      if (/detached worn product/.test(failure)) {
        detachedProductRiskFailuresList.push(`${testCase.caseId}: ${failure}`);
      }
    }
    const request = v14RequestForCase(testCase);
    const first = api.runCommercialV14Pipeline(request);
    const second = api.runCommercialV14Pipeline(request);
    assert(first.status === "GENERATED" && second.status === "GENERATED", `${testCase.caseId} V1.4 pipeline blocked.`);
    assert(
      first.plan.creativeTreatment.title === second.plan.creativeTreatment.title
      && first.plan.v14CompiledText === second.plan.v14CompiledText
      && first.plan.presentation.presentationScript === second.plan.presentation.presentationScript,
      `${testCase.caseId} V1.4 treatment is not deterministic.`
    );
    assert(
      first.plan.presentation.sourceEvents.join("|")
        === first.plan.basePlan.shotArchitecture.shots.map((shot) => shot.event.whatHappens).join("|"),
      `${testCase.caseId} V1.4 presentation source-event integrity failed.`
    );
    assert(
      first.plan.canonicalCompiledText.length <= 10000
      && first.plan.v14CompiledText.length <= first.plan.canonicalCompiledText.length + 4000,
      `${testCase.caseId} V1.4 prompt length regression failed.`
    );
  }
  assert(
    physicalRealityFailuresList.length === 0,
    `Physical reality failures remain: ${physicalRealityFailuresList.join(" | ")}`
  );
  assert(
    worldCoherenceFailuresList.length === 0,
    `World coherence failures remain: ${worldCoherenceFailuresList.join(" | ")}`
  );
  assert(
    filmabilityFailuresList.length === 0,
    `Filmability failures remain: ${filmabilityFailuresList.join(" | ")}`
  );
  assert(
    physicalCauseFailuresList.length === 0,
    `Physical cause failures remain: ${physicalCauseFailuresList.join(" | ")}`
  );
  assert(
    objectAgencyFailuresList.length === 0,
    `Object agency failures remain: ${objectAgencyFailuresList.join(" | ")}`
  );
  assert(
    spatialRelationshipFailuresList.length === 0,
    `Spatial relationship failures remain: ${spatialRelationshipFailuresList.join(" | ")}`
  );
  assert(
    propositionSignatureDriftFailuresList.length === 0,
    `Proposition/Signature Moment drift remains: ${propositionSignatureDriftFailuresList.join(" | ")}`
  );
  assert(
    productRevealCausalityFailuresList.length === 0,
    `Product reveal causality failures remain: ${productRevealCausalityFailuresList.join(" | ")}`
  );
  assert(
    endingSafetyFailuresList.length === 0,
    `Ending safety failures remain: ${endingSafetyFailuresList.join(" | ")}`
  );
  assert(
    detachedProductRiskFailuresList.length === 0,
    `Detached product risk remains: ${detachedProductRiskFailuresList.join(" | ")}`
  );

  const diversityBase = matrix.cases.find((testCase) => testCase.intent === "QUIET_LUXURY" && testCase.directorConceptId === "PARTIAL_OBSCURATION");
  assert(Boolean(diversityBase), "Diversity base case is missing.");
  const diversityTreatments = [];
  for (let nonce = 0; nonce < 5; nonce += 1) {
    const outcome = api.runCommercialV14Pipeline(v14RequestForCase(diversityBase, nonce));
    assert(outcome.status === "GENERATED", `Diversity case nonce ${nonce} blocked.`);
    diversityTreatments.push(treatmentFingerprint(outcome.plan.creativeTreatment));
  }
  for (let left = 0; left < diversityTreatments.length; left += 1) {
    for (let right = left + 1; right < diversityTreatments.length; right += 1) {
      assert(
        fingerprintsDiffer(diversityTreatments[left], diversityTreatments[right]) >= 2,
        `Diversity failed for nonce pair ${left}/${right}.`
      );
    }
  }

  await mkdir(outputDirectory, { recursive: true });
  await writeFile(
    join(outputDirectory, "creative-directing-regression.json"),
    `${JSON.stringify({
      schemaVersion: api.COMMERCIAL_CREATIVE_DIRECTING_SCHEMA_VERSION,
      stage: "COMMERCIAL_FILM_V1.4_CREATIVE_DIRECTING",
      caseCount: matrix.cases.length,
      nonClassicStructureCases: matrix.nonClassicStructureCases,
      cases: matrix.cases.map((testCase) => ({
        caseId: testCase.caseId,
        title: testCase.title,
        structureType: testCase.structureType,
        signatureEvent: testCase.signatureEvent,
        productRevealCause: testCase.productRevealCause,
        endingImage: testCase.endingImage,
        canonicalCompiledTextFingerprint: testCase.canonicalCompiledTextFingerprint,
        v14CompiledTextSha256: sha256(testCase.v14CompiledText),
        presentationScriptSha256: sha256(testCase.presentationScript),
      })),
    }, null, 2)}\n`
  );
  await writeFile(join(outputDirectory, "QUALITY_REPORT.md"), buildQualityReport(matrix));
  await writeFile(
    join(outputDirectory, "QUALITY_REPORT_V1_4_1.md"),
    buildQualityReportV141(matrix, semanticClonePairs)
  );
  await writeFile(
    join(outputDirectory, "QUALITY_REPORT_V1_4_2.md"),
    buildQualityReportV142(matrix)
  );
  await writeFile(
    join(outputDirectory, "QUALITY_REPORT_V1_4_3.md"),
    buildQualityReportV143(matrix)
  );
  await writeFile(
    join(outputDirectory, "QUALITY_REPORT_V1_4_4.md"),
    buildQualityReportV144(matrix, {
      physicalCauseFailures: physicalCauseFailuresList.length,
      objectAgencyFailures: objectAgencyFailuresList.length,
      spatialRelationshipFailures: spatialRelationshipFailuresList.length,
      worldCoherenceFailures: worldCoherenceFailuresList.length,
      propositionSignatureDriftFailures: propositionSignatureDriftFailuresList.length,
      productRevealCausalityFailures: productRevealCausalityFailuresList.length,
      endingSafetyFailures: endingSafetyFailuresList.length,
      detachedProductRiskFailures: detachedProductRiskFailuresList.length,
    })
  );

  console.log(`COMMERCIAL FILM V1.4 ${mode.toUpperCase()} VALIDATION PASS:`, JSON.stringify({
    mode,
    cases: matrix.cases.length,
    classicStructureCases: matrix.classicStructureCases,
    nonClassicStructureCases: matrix.nonClassicStructureCases,
    creativeTreatmentDiversityPairs: (diversityTreatments.length * (diversityTreatments.length - 1)) / 2,
    semanticClonePairs: semanticClonePairs.length,
    propositionClonePairs: propositionClonePairs.length,
    signatureEventReusePairs: signatureEventReusePairs.length,
    deviceArcReusePairs: deviceArcReusePairs.length,
    signatureMomentMechanismCollapsePairs: signatureMomentMechanismCollapsePairs.length,
    physicalRealityFailures: physicalRealityFailuresList.length,
    worldCoherenceFailures: worldCoherenceFailuresList.length,
    filmabilityFailures: filmabilityFailuresList.length,
    physicalCauseFailures: physicalCauseFailuresList.length,
    objectAgencyFailures: objectAgencyFailuresList.length,
    spatialRelationshipFailures: spatialRelationshipFailuresList.length,
    propositionSignatureDriftFailures: propositionSignatureDriftFailuresList.length,
    productRevealCausalityFailures: productRevealCausalityFailuresList.length,
    endingSafetyFailures: endingSafetyFailuresList.length,
    detachedProductRiskFailures: detachedProductRiskFailuresList.length,
    creativeSynthesis: "PASS",
    signatureMomentMechanismCollapsePairs: signatureMomentMechanismCollapsePairs.length,
    v13CanonicalBaseline: "UNCHANGED",
    v13ProtectedSources: "UNCHANGED",
    narrativeModified: "NO",
    actionsModified: "NO",
    v14VisualStatus: "NOT_VERIFIED",
    output: outputDirectory,
  }, null, 2));
} catch (error) {
  console.error(`COMMERCIAL FILM V1.4 ${mode.toUpperCase()} VALIDATION FAILED:`, error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
