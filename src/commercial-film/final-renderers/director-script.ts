import type { CommercialFinalExecutionPlan } from "../final-execution/types";
import type { CommercialFinalDirectorScript } from "./types";
import {
  cameraLine,
  resourceLabel,
  takeHeading,
  timeRange,
  visibilityStateLabel,
  visibilityHumanLine,
} from "./shared";

export function renderCommercialFinalDirectorScript(
  plan: CommercialFinalExecutionPlan
): CommercialFinalDirectorScript {
  if (plan.status !== "VALID") {
    throw new Error("A BLOCKED Final Execution Plan cannot be rendered as a production Director Script.");
  }
  const treatment = plan.source.treatment;
  const lines: string[] = [
    treatment.title,
    "",
    `Duration: ${plan.identity.duration} seconds`,
    "Format: Commercial Film",
    `Tone: ${plan.identity.cameraRhythm === "CALM" ? "Calm, observational, material-led" : plan.identity.cameraRhythm === "PRODUCT_FORWARD" ? "Precise, restrained, detail-led" : "Natural, moving, quietly composed"}`,
    "",
    "CREATIVE IDEA",
    plan.source.basePlan.creativeSpine.premise.text,
    "",
    "CREATIVE PROPOSITION",
    treatment.creativeProposition.presentationText,
    "",
    "FILM TENSION",
    `${treatment.filmTension.from} -> ${treatment.filmTension.to}. ${treatment.filmTension.line}`,
    "",
    "DIRECTOR CONCEPT",
    treatment.directorConcept,
    "",
    "CINEMATIC DEVICE",
    treatment.cinematicDevice,
    "",
    "SIGNATURE MOMENT",
    `Before: ${treatment.signatureMoment.beforeMoment}`,
    `Visible change: ${treatment.signatureMoment.visualInterruption}`,
    `After: ${treatment.signatureMoment.afterMoment}`,
    `Product connection: ${treatment.signatureMoment.productRole}`,
    `Resource: ${resourceLabel(plan, plan.signature.resourceId)}`,
    `Beat: ${plan.signature.beatIndex + 1} · Take: ${plan.signature.takeIndex + 1}`,
    "",
    "CHARACTER / WORLD",
    `Age: ${plan.identity.character.resolved.ageProfile ? `${plan.identity.character.resolved.ageProfile.ageMin}-${plan.identity.character.resolved.ageProfile.ageMax}` : "as selected"}`,
    `Appearance: ${plan.identity.character.resolved.appearanceGroup?.label ?? "as selected"}`,
    `World: ${plan.identity.sceneWorld.sceneNames.join(" -> ")} · ${plan.identity.season}`,
    "Same person, wardrobe, product, season, and spatial world throughout.",
    "",
    "DEVICE PROGRESSION",
    `Resource: ${resourceLabel(plan, plan.device.resourceId)}`,
    `Initial: ${plan.device.initialVisualState}`,
    `Required change: ${plan.device.requiredVisibleChange}`,
    `Resolved: ${plan.device.resolvedVisualState}`,
    "",
    "VISIBILITY / REVEAL",
    `Reveal beat: ${plan.productVisibility.revealContract.revealBeatIndex + 1}`,
    `Visibility transition: ${visibilityStateLabel(plan.productVisibility.revealContract.fromVisibility)} -> ${visibilityStateLabel(plan.productVisibility.revealContract.toVisibility)}`,
    `Cause: ${plan.productVisibility.revealContract.cause}`,
    `Evidence: ${plan.productVisibility.revealContract.requiredVisibleEvidence.slice(0, 4).join(" / ")}`,
    "",
    "TAKE / BEAT EXECUTION",
  ];

  plan.takeStructure.takes.forEach((take) => {
    lines.push(
      "",
      takeHeading(take, plan.takeStructure.takes.length),
      `Time: ${timeRange(take.startSecond, take.endSecond)}`,
      `${take.shotIndexes.length} temporal beat${take.shotIndexes.length === 1 ? "" : "s"} inside this take.`
    );
    take.shotIndexes.forEach((shotIndex) => {
      const beat = plan.beats.find((entry) => entry.beatIndex === shotIndex);
      if (!beat) return;
      const revealBeat = plan.productVisibility.revealContract.revealBeatIndex === shotIndex;
      lines.push(
        "",
        `BEAT ${shotIndex + 1}`,
        `Time: ${timeRange(beat.timeRange.startSecond, beat.timeRange.endSecond)}`,
        `Action: ${beat.action}`,
        `Visual change: ${beat.eventWhatChanges}`,
        `Camera: ${cameraLine(beat)}`,
        `Product visibility: ${visibilityHumanLine(beat.productVisibility)}`,
        ...(revealBeat
          ? [
            `Reveal: ${plan.productVisibility.revealContract.cause}`,
            `Required evidence: ${plan.productVisibility.revealContract.requiredVisibleEvidence.slice(0, 4).join(" / ")}`,
          ]
          : [])
      );
    });
  });

  lines.push(
    "",
    "ENDING",
    plan.ending.finalImage,
    `Release constraint: ${plan.ending.releaseConstraint}`,
    "",
    "ENDING IMAGE",
    plan.ending.finalImage,
    "",
    "GLOBAL VISUAL LOOK",
    ...plan.renderPolicy.visualLookLines,
    "",
    "GLOBAL SOUND",
    ...plan.renderPolicy.soundLines,
    "",
    "GLOBAL PRODUCT PROTECTION",
    ...plan.renderPolicy.productProtectionLines,
    "",
    "GLOBAL NEGATIVES",
    ...plan.renderPolicy.negativeLines
  );

  if (plan.ending.filmLine.value) {
    lines.push(
      "",
      "FILM LINE",
      plan.ending.filmLine.value,
      "Added in post as a text overlay over the ending image. The ending image is not replaced or re-staged."
    );
  }

  const text = lines.join("\n");
  return {
    schemaVersion: "commercial-film/final-renderers-v1",
    rendererVersion: "1.0.0",
    status: "GENERATED",
    text,
    lineCount: text.split("\n").length,
    takeCount: plan.takeStructure.takes.length,
    beatCount: plan.beats.length,
    revealBeatIndex: plan.productVisibility.revealContract.revealBeatIndex,
    visibilityTimeline: plan.productVisibility.timeline.map((beat) => beat.normalizedState),
    resourceIds: [...new Set(plan.device.resourceBindings.map((binding) => binding.resourceId).filter((id): id is string => Boolean(id)))],
    signatureEventId: plan.signature.eventId,
    cameraSignature: plan.camera.plan.shots.map((shot) => `${shot.framing}|${shot.movement}`).join("::"),
    finalCharacterState: plan.ending.finalCharacterState,
    endingImage: plan.ending.finalImage,
    filmLine: plan.ending.filmLine.value,
  };
}
