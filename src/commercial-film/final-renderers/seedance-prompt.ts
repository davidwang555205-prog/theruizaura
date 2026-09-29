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
  const lines: string[] = [
    "SEEDANCE — COMMERCIAL FILM",
    `${plan.identity.duration} seconds · ${plan.takeStructure.takes.length} take${plan.takeStructure.takes.length === 1 ? "" : "s"} · ${plan.beats.length} beats · one person`,
    "",
    "[FILM EXECUTION IDENTITY]",
    plan.identity.commercialIntentLabel,
    treatment.creativeProposition.presentationText,
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
        `Camera: ${cameraLine(beat)}`,
        `Product visibility: ${visibilityHumanLine(beat.productVisibility)}`,
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
    ...(plan.physicalState.eventContracts.flatMap((entry) => (
      entry.contract.requiredVisibleEvidence.map((evidence) => evidence.statement)
    ))),
    ...(plan.physicalState.eventContracts.flatMap((entry) => (
      entry.contract.singleUseAction ? [entry.contract.singleUseAction.label] : []
    ))),
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
