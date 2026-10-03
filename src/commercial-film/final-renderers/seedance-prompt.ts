import type { CommercialFinalExecutionPlan } from "../final-execution/types";
import type { CommercialFinalSeedancePrompt } from "./types";
import {
  cameraLine,
  resourceLabel,
  takeHeading,
  timeRange,
  visibilityHumanLine,
  visibilityStateLabel,
} from "./shared";

export function renderCommercialFinalSeedancePrompt(
  plan: CommercialFinalExecutionPlan
): CommercialFinalSeedancePrompt {
  if (plan.status !== "VALID") {
    throw new Error("A BLOCKED Final Execution Plan cannot be rendered as a production Seedance Prompt.");
  }
  const reveal = plan.productVisibility.revealContract;
  const treatment = plan.source.treatment;
  const eventContractForBeat = (beatIndex: number) => plan.physicalState.eventContracts.find((entry) => entry.beatIndex === beatIndex);
  const physicalStateLinesForBeat = (beatIndex: number) => {
    const entry = eventContractForBeat(beatIndex);
    if (!entry) return [];
    const entityLabel = (entityId: string) => plan.physicalState.worldModel.entities.find((entity) => entity.id === entityId)?.label ?? entityId;
    const relevantEntityIds = new Set([
      ...entry.contract.preconditions.map((item) => item.entityId),
      ...entry.contract.effects.map((item) => item.entityId),
    ]);
    const lines = [...relevantEntityIds].flatMap((entityId) => {
      const entity = plan.physicalState.worldModel.entities.find((candidate) => candidate.id === entityId);
      if (!entity) return [];
      const requirements = entry.contract.preconditions.filter((item) => item.entityId === entityId);
      const effects = entry.contract.effects.filter((item) => item.entityId === entityId && item.fromValue !== item.toValue);
      const effectAttributes = new Set(effects.map((effect) => effect.attribute));
      const stateLines = requirements.filter((item) => !effectAttributes.has(item.attribute))
        .map((item) => `${entityLabel(entityId)} ${item.attribute} before: ${item.value}.`);
      for (const effect of effects) {
        stateLines.push(`${entityLabel(entityId)} ${effect.attribute}: ${effect.fromValue ?? "the established state"} -> ${effect.toValue}.`);
      }
      return stateLines;
    });
    const next = plan.physicalState.eventContracts.find((candidate) => candidate.beatIndex === beatIndex + 1);
    if (next) {
      const endLines = entry.contract.effects.filter((effect) => effect.fromValue !== effect.toValue).map((effect) => {
        const nextRequirement = next.contract.preconditions.find((requirement) => requirement.entityId === effect.entityId && requirement.attribute === effect.attribute);
        const value = nextRequirement?.value ?? effect.toValue;
        return `${entityLabel(effect.entityId)} ${effect.attribute} after this beat: ${value}.`;
      });
      lines.push(...endLines);
    }
    return [...new Set(lines)];
  };
  const spatialTransitionForBeat = (beatIndex: number) => {
    const entry = eventContractForBeat(beatIndex);
    const effect = entry?.contract.effects.find((candidate) => candidate.entityId === "character" && candidate.attribute === "space" && candidate.fromValue !== candidate.toValue);
    if (!effect) return [];
    const evidence = entry?.contract.requiredVisibleEvidence.find((candidate) => candidate.sourceEventId === effect.sourceEventId)
      ?? entry?.contract.requiredVisibleEvidence[0];
    return [
      `SPATIAL TRANSITION CONTRACT: At the start of this beat, the character is ${effect.fromValue}.`,
      `During this same beat, the selected physical event happens once: ${evidence?.statement ?? "the declared threshold crossing"}`,
      `At the end of this beat, the character is ${effect.toValue}. From the following beat onward, keep this end state.`,
      "This describes the same crossing already named in the beat action; it is not a second crossing.",
    ];
  };
  const spatialSourceEventIds = new Set(plan.physicalState.eventContracts.flatMap((entry) => (
    entry.contract.effects.filter((effect) => effect.entityId === "character" && effect.attribute === "space" && effect.fromValue !== effect.toValue)
      .map((effect) => effect.sourceEventId)
  )).filter((eventId): eventId is string => Boolean(eventId)));
  const mandatoryEvidence = plan.physicalState.eventContracts.flatMap((entry) => (
    entry.contract.requiredVisibleEvidence
      .filter((evidence) => !evidence.sourceEventId || !spatialSourceEventIds.has(evidence.sourceEventId))
      .map((evidence) => `Beat ${entry.beatIndex + 1}: ${evidence.statement}`)
  ));
  const mandatorySingleUseActions = plan.physicalState.eventContracts.flatMap((entry) => (
    entry.contract.singleUseAction && entry.contract.singleUseAction.actionId !== "CROSS_THRESHOLD"
      ? [entry.contract.singleUseAction.label]
      : []
  ));
  const productVisibilityLineForBeat = (
    beatIndex: number,
    beat: CommercialFinalExecutionPlan["beats"][number]
  ) => beatIndex === 2 && beat.productVisibility === "DETAIL"
    ? "Product visibility: express the authorized detail moment as an environmental detail moment within the existing human-scale composition; let the beat's established person-and-world interaction carry attention while the footwear stays naturally worn and recognizable at ordinary scale. No shoe insert, close-up, or isolated product display."
    : `Product visibility: ${visibilityHumanLine(beat.productVisibility)}`;
  const lines: string[] = [
    "SEEDANCE — COMMERCIAL FILM",
    `${plan.identity.duration} seconds · ${plan.takeStructure.takes.length} take${plan.takeStructure.takes.length === 1 ? "" : "s"} · ${plan.beats.length} beats · one person`,
    "",
    "[FILM EXECUTION IDENTITY]",
    plan.identity.commercialIntentLabel,
    treatment.creativeProposition.presentationText,
    "",
    "[PRODUCT IDENTITY PRIORITY]",
    "The footwear belongs to the person's visual identity and lived-in silhouette; preserve the same reference-bound product across all beats. Let ordinary wear, body movement, and the foot-to-ground relationship keep it recognizable at natural scale, within each beat's existing Product Visibility. It is part of the person, not a display object.",
    "",
    "[TAKE CHRONOLOGY]",
  ];

  plan.takeStructure.takes.forEach((take) => {
    lines.push(
      takeHeading(take, plan.takeStructure.takes.length),
      `Time: ${timeRange(take.startSecond, take.endSecond)}`,
      `${take.shotIndexes.length} temporal beat${take.shotIndexes.length === 1 ? "" : "s"} inside this take.`,
      "The Take is the physical photographic unit; beats are timing and action phases inside it."
    );
    if (take.takeIndex > 0 && take.continuityInheritance.length > 0) {
      lines.push(
        "START STATE INHERITED FROM PREVIOUS TAKE",
        ...take.continuityInheritance
      );
    }
    take.shotIndexes.forEach((shotIndex) => {
      const beat = plan.beats.find((entry) => entry.beatIndex === shotIndex);
      if (!beat) return;
      lines.push(
        "",
        `BEAT ${shotIndex + 1}`,
        `Time: ${timeRange(beat.timeRange.startSecond, beat.timeRange.endSecond)}`,
        `Action: ${beat.action}`,
        `Event: ${beat.eventWhatHappens}`,
        `Visible change: ${beat.eventWhatChanges}`,
        ...physicalStateLinesForBeat(shotIndex),
        ...(plan.source.basePlan.commercialIntent === "QUIET_LUXURY"
          && plan.source.basePlan.creativeSpine.advertisingStructure === "WORLD_OBSERVES_SUBJECT"
          && shotIndex >= 3
          ? ["Keep the established worn-product relationship natural at this beat; do not seek it with the camera, reframe for it, or turn it into a new product display."]
          : []),
        ...spatialTransitionForBeat(shotIndex),
        `Camera: ${cameraLine(beat)}`,
        productVisibilityLineForBeat(shotIndex, beat),
        ...(reveal.revealBeatIndex === shotIndex
          ? [
            `Reveal: ${reveal.cause}`,
            `Required evidence: ${reveal.requiredVisibleEvidence.slice(0, 4).join(" / ")}`,
          ]
          : [])
      );
    });
    lines.push("");
  });

  lines.push(
    "[CONTINUITY LOCK]",
    ...plan.physicalState.continuityLock.lines,
    "",
    "[MANDATORY VISUAL EVENTS]",
    ...mandatoryEvidence,
    ...mandatorySingleUseActions,
    ...(spatialSourceEventIds.size > 0 ? ["Each threshold crossing is performed once in its beat-local spatial transition contract above."] : []),
    "",
    "[EVENT COMPLETION GATE]",
    "The film may enter its final structured state or continuation only after every mandatory visual event above has visibly completed.",
    "If an event is still incomplete, do not replace it with generic walking, posing, product observation, or another destination.",
    "",
    "[CREATIVE DEVICE]",
    `Resource: ${resourceLabel(plan, plan.device.resourceId)}`,
    `Progression: ${plan.device.initialVisualState} -> ${plan.device.requiredVisibleChange} -> ${plan.device.resolvedVisualState}`,
    `Take: ${plan.device.takeIndex + 1} · Beat: ${plan.device.beatIndex + 1}`,
    "",
    "[SIGNATURE MOMENT]",
    `Resource: ${resourceLabel(plan, plan.signature.resourceId)}`,
    `Before: ${treatment.signatureMoment.beforeMoment}`,
    `Change: ${treatment.signatureMoment.visualInterruption}`,
    `After: ${treatment.signatureMoment.afterMoment}`,
    `Product connection: ${treatment.signatureMoment.productRole}`,
    `Required evidence: ${plan.signature.requiredVisibleEvidence.join(" / ")}`,
    "",
    "[PRODUCT VISIBILITY / REVEAL]",
    `Reveal beat: ${reveal.revealBeatIndex + 1}`,
    `Reveal take: ${reveal.takeIndex + 1}`,
    `Transition: ${visibilityStateLabel(reveal.fromVisibility)} -> ${visibilityStateLabel(reveal.toVisibility)}`,
    `Visible cause: ${reveal.cause}`,
    `Required evidence: ${reveal.requiredVisibleEvidence.slice(0, 4).join(" / ")}`,
    "Use only the visibility described in each beat. Earlier beats do not authorize a complete direct product read.",
    "",
    "[CAMERA AUTHORITY]",
    ...plan.camera.plan.shots.map((shot, index) => (
      `Camera segment ${index + 1}: ${shot.framing}; ${shot.cameraHeight.replace(/_/g, " ")}; ${shot.movement.replace(/_/g, " ")}. ${shot.movementLine}`
    )),
    ...(plan.camera.compatibilityStatus === "COMPATIBLE"
      ? ["The Camera Plan is compatible with the selected Director Concept."]
      : plan.camera.conflicts.map((conflict) => conflict.message)),
    "",
    "[ENDING]",
    plan.ending.finalImage,
    "FINAL PRODUCT MEMORY",
    "On the final beat, retain a quiet, natural memory of the footwear as part of the person's continuing lived image, at the final beat's existing visibility level and ordinary worn scale within the established scene. Do not add a shoe insert, close-up, or product-only hold.",
    `Release constraint: ${plan.ending.releaseConstraint}`,
    plan.ending.filmLine.value
      ? "Do not generate film-line lettering, a logo, a brand mark, or an end card. Any film line is added later in post."
      : "Do not generate lettering, a logo, a brand mark, or an end card.",
    "",
    "[SOUND]",
    ...plan.renderPolicy.soundLines,
    "",
    "[VISUAL LOOK]",
    ...plan.renderPolicy.visualLookLines,
    "",
    "[PRODUCT TRUTH / PROTECTION]",
    ...plan.renderPolicy.productProtectionLines,
    "",
    "[NEGATIVES]",
    ...plan.renderPolicy.negativeLines
  );

  const text = lines.join("\n");
  return {
    schemaVersion: "commercial-film/final-renderers-v1",
    rendererVersion: "1.0.0",
    status: "GENERATED",
    text,
    lineCount: text.split("\n").length,
    charCount: text.length,
    takeCount: plan.takeStructure.takes.length,
    beatCount: plan.beats.length,
    revealBeatIndex: reveal.revealBeatIndex,
    visibilityTimeline: plan.productVisibility.timeline.map((beat) => beat.normalizedState),
    resourceIds: [...new Set(plan.device.resourceBindings.map((binding) => binding.resourceId).filter((id): id is string => Boolean(id)))],
    signatureEventId: plan.signature.eventId,
    cameraSignature: plan.camera.plan.shots.map((shot) => `${shot.framing}|${shot.movement}`).join("::"),
    finalCharacterState: plan.ending.finalCharacterState,
    endingImage: plan.ending.finalImage,
    filmLine: plan.ending.filmLine.value,
  };
}
