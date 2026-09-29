import type { CommercialCreativeTreatment, CommercialV14Presentation } from "./types";
import type { CommercialFilmPlan } from "../types";
import type { CommercialFinalScriptPresentation } from "../presentation";
import type { CommercialBrandSignOff } from "../brand-signoff";

const V14_SECTION_START = "\n[V1.4 CREATIVE DIRECTING]";
const EXIT_ACTION = /\b(?:exit|exits|leave|leaves|left|cross out|move out of frame|steps out)\b/i;

function finalCharacterRemains(plan: CommercialFilmPlan) {
  const event = plan.shotArchitecture.shots[plan.shotArchitecture.shots.length - 1]?.event;
  return !event || !EXIT_ACTION.test(event.whatHappens);
}

function physicalBeatLine(plan: CommercialFilmPlan, treatment: CommercialCreativeTreatment, index: number) {
  const event = treatment.eventSequence[index];
  const device = treatment.deviceArc[index];
  const source = plan.shotArchitecture.shots[index];
  const reveal = treatment.productRevealLogic.revealBeatIndex;
  const time = `${source.timeRange.startSecond.toFixed(1)}-${source.timeRange.endSecond.toFixed(1)}s`;
  if (treatment.directorConceptId === "REFLECTION_WORLD") {
    const carrier = device.deviceCarrier;
    const conditions = [
      `At the ${treatment.signatureMoment.location}, the existing ${carrier} carries her indirect image; its opaque lower frame edge physically covers the direct footwear from this fixed camera position.`,
      `The same ${carrier} holds the layered image as her existing small standing adjustment changes her position relative to it; her actual footwear remains behind its lower frame edge.`,
      `Her existing ankle-and-heel settling misaligns the reflected lower silhouette in the same ${carrier}; only an incomplete direct portion emerges beside the lower frame edge.`,
      `Her existing weight shift brings the worn footwear fully beside the lower edge of the same ${carrier}; the direct physical view is readable for the first time in the established composition.`,
      `The person remains in the final source-event position while the indirect image in the same ${carrier} recedes.`,
    ];
    return `BEAT ${index + 1} (${time}, ${event.structureRole}): ${conditions[index]}`;
  }
  const framing = source.event.framingHint;
  const visibility = index < reveal
    ? /absent|implied/i.test(event.productVisibilityGoal)
      ? `The ${device.deviceCarrier} and ${framing} occupy the lower direct sightline; the full footwear silhouette is physically outside the readable frame.`
      : `The ${device.deviceCarrier} and ${framing} leave only an incomplete lower-body portion readable.`
    : `The source action makes the full worn relationship readable in the ${framing}.`;
  return `BEAT ${index + 1} (${time}, ${event.structureRole}): ${event.sourceEvent} ${visibility}`;
}

function directorDeviceVisual(treatment: CommercialCreativeTreatment, index: number) {
  const carrier = treatment.deviceArc[index].deviceCarrier;
  if (treatment.directorConceptId !== "REFLECTION_WORLD") {
    return `The ${carrier} changes the view: ${treatment.eventSequence[index].visualResult}`;
  }
  return [
    `The ${carrier} carries her indirect image; its opaque lower edge hides the direct footwear.`,
    `Her image layers in the same ${carrier}; its lower edge still hides the actual footwear.`,
    `The reflection shifts out of alignment; only part of the direct lower silhouette emerges beside the edge.`,
    `The weight shift clears the overlap; the complete worn footwear appears beside the ${carrier} edge for the first time.`,
    `The reflection recedes in the ${carrier} while she stays in the final room position.`,
  ][index];
}

function creativeExecutionLines(plan: CommercialFilmPlan, treatment: CommercialCreativeTreatment) {
  const takePlan = plan.continuity.takePlan;
  const signature = treatment.signatureMoment;
  const reveal = treatment.productRevealLogic.revealBeatIndex;
  const lines = [
    "[CREATIVE DEVICE — PHYSICAL EXECUTION]",
    `Carrier: the existing ${signature.carrier} at ${signature.location}. Keep this physical carrier in the same scene while its visible state changes.`,
    `Take Plan: ${takePlan.takes.map((take) => `Take ${take.takeIndex + 1} ${take.startSecond.toFixed(1)}-${take.endSecond.toFixed(1)}s contains beats ${take.beatIndexes.map((beat) => beat + 1).join(", ")}`).join("; ")}. These beats are temporal phases inside the existing Take, not new camera setups.`,
    ...treatment.eventSequence.map((_event, index) => physicalBeatLine(plan, treatment, index)),
    `Single signature change at beat ${signature.signatureBeatIndex + 1}: ${signature.beforeMoment} Then ${signature.visualInterruption} ${signature.afterMoment} It happens once as the existing source action completes.`,
    `First complete direct product view: beat ${reveal + 1}, after the physical carrier change. Earlier beats have only the physical views described above.`,
    `Final source event: ${treatment.eventSequence[treatment.eventSequence.length - 1].sourceEvent} Ending image: ${treatment.endingImage}`,
  ];
  return lines;
}

export function buildCommercialV14TranslationExtension(
  treatment: CommercialCreativeTreatment,
  brandSignOff: CommercialBrandSignOff,
  plan: CommercialFilmPlan
): string {
  return [
    V14_SECTION_START,
    `Creative proposition: ${treatment.creativeProposition.presentationText}`,
    ...creativeExecutionLines(plan, treatment),
    ...(brandSignOff.filmLine ? ["Film line is added in post as text, not generated lettering."] : []),
  ].join("\n");
}

function resolveFinalStateWording(text: string, plan: CommercialFilmPlan, treatment: CommercialCreativeTreatment) {
  const carrier = treatment.deviceArc[0]?.deviceCarrier;
  const grounded = treatment.directorConceptId === "REFLECTION_WORLD"
    ? text
      .split("Use glass, windows, polished surfaces, and neighboring architecture as motivated layered views.").join(`Use the existing ${carrier} as the one reflective plane in this scene.`)
      .split("Use foreground reflection, frame-within-frame, deep plane, and soft double-image relationships without surreal duplication.").join(`Keep the indirect image in the same ${carrier}; the foreground architecture stays fixed.`)
    : text;
  if (!finalCharacterRemains(plan)) return grounded;
  return grounded
    .split("Establish the frame first, then let the person enter, complete the action, and leave naturally.").join("Hold the established frame with the person in the final source-event position.")
    .split("Place the frame before the action begins, then let the person enter, complete the action, and leave naturally.").join("Hold the established frame with the person in the final source-event position.")
    .split("Let the reflection continue after the subject moves, so the world retains the image.").join(`The indirect image in the ${treatment.deviceArc[treatment.deviceArc.length - 1].deviceCarrier} recedes while the person remains in the frame.`)
    .split("the camera staying after the subject leaves").join("the camera holding the person in the final source-event state");
}

export function appendCommercialV14TranslationExtension(
  canonicalCompiledText: string,
  treatment: CommercialCreativeTreatment,
  brandSignOff: CommercialBrandSignOff,
  plan: CommercialFilmPlan
) {
  const extension = buildCommercialV14TranslationExtension(treatment, brandSignOff, plan);
  const productionText = resolveFinalStateWording(canonicalCompiledText, plan, treatment);
  const marker = "\n[SOUND ENVIRONMENT]";
  return productionText.includes(marker)
    ? productionText.replace(marker, `\n${extension}\n${marker}`)
    : `${productionText}\n${extension}\n`;
}

// The closing text block carries the film line only. There is no brand mark, no logo overlay and no
// end card, and the ending image itself is never rewritten.
function filmLineLines(brandSignOff: CommercialBrandSignOff) {
  const timing = brandSignOff.timing;
  return [
    "ENDING TEXT",
    `Film Line: ${brandSignOff.filmLine}`,
    ...(timing
      ? [`Timing: ${timing.startSecond.toFixed(1)}-${timing.endSecond.toFixed(1)}s inside the ${brandSignOff.filmDurationSeconds} second film`]
      : []),
    "Added in post over the ending image. The ending image is not replaced, cut short or re-staged.",
    "",
  ];
}

function buildV14HeadSections(treatment: CommercialCreativeTreatment) {
  return [
    "",
    "CREATIVE PROPOSITION",
    treatment.creativeProposition.presentationText,
    "",
    "FILM TENSION",
    `${treatment.filmTension.from} -> ${treatment.filmTension.to}. ${treatment.filmTension.line}`,
    "",
  ].join("\n");
}

function buildV14BodySections(treatment: CommercialCreativeTreatment) {
  const stableCarrier = treatment.deviceArc.every((beat) => beat.deviceCarrier === treatment.deviceArc[0]?.deviceCarrier);
  return [
    "",
    "SIGNATURE MOMENT",
    treatment.signatureMoment.momentDescription,
    "",
    "DEVICE ARC",
    ...(stableCarrier
      ? [`${treatment.deviceArc[0].deviceCarrier}: ${treatment.deviceArc.map((beat) => beat.deviceState).join(" → ")}.`]
      : treatment.deviceArc.map((beat) => `${beat.beatIndex + 1}. ${beat.deviceState} through ${beat.deviceCarrier}. ${beat.deviceFunction}`)),
    "",
    "FILM ARC",
    ...treatment.structure.map((beat) => `${beat.beatIndex + 1}. ${beat.structureRole} — ${beat.function}`),
    "",
  ].join("\n");
}

export function buildCommercialV14Presentation(
  basePresentation: CommercialFinalScriptPresentation,
  canonicalCompiledText: string,
  v14CompiledText: string,
  treatment: CommercialCreativeTreatment,
  brandSignOff: CommercialBrandSignOff
): CommercialV14Presentation {
  const headSections = buildV14HeadSections(treatment);
  const bodySections = buildV14BodySections(treatment);
  const marker = "\nDIRECTOR CONCEPT\n";
  let presentationScript = basePresentation.presentationScript
    .replace(/\nFILM STRUCTURE\n[\s\S]*?(?=\nSHOT 1 — )/, "\n")
    .replace(/\bafter the she leaves\b/gi, "after she leaves");
  treatment.structure.forEach((beat, index) => {
    presentationScript = presentationScript.replace(
      new RegExp(`SHOT ${index + 1} — [A-Z ]+`),
      `SHOT ${index + 1} — ${beat.structureRole}`
    );
    const nextShot = index < treatment.structure.length - 1 ? `(?=\\nSHOT ${index + 2} — )` : "(?=\\nENDING\\n)";
    const shotPattern = new RegExp(`(\\nSHOT ${index + 1} — [\\s\\S]*?\\nVisual: )([^\\n]*)([\\s\\S]*?)${nextShot}`);
    presentationScript = presentationScript.replace(shotPattern, (_match, prefix: string, visual: string, rest: string) => (
      `${prefix}${visual} ${directorDeviceVisual(treatment, index)}${rest}`
    ));
  });
  presentationScript = presentationScript.includes(marker)
    ? presentationScript.replace(marker, `${headSections}\nDIRECTOR CONCEPT\n`)
    : `${presentationScript}${headSections}`;
  presentationScript = presentationScript.replace(
    /\nSHOT 1 — /,
    `${bodySections}\nSHOT 1 — `
  );
  presentationScript = presentationScript.replace(
    /\nGLOBAL VISUAL LOOK\n/,
    `\nENDING IMAGE\n${treatment.endingImage}\n\nGLOBAL VISUAL LOOK\n`
  );
  // A film line replaces the legacy execution placeholder with its own overlay note. Without a film
  // line there is nothing to overlay, so the script keeps the frozen execution section untouched.
  if (brandSignOff.filmLine && brandSignOff.seedanceDirection) {
    presentationScript = presentationScript.replace(
      /\nSEEDANCE EXECUTION\n[\s\S]*$/,
      `\n${filmLineLines(brandSignOff).join("\n")}\nSEEDANCE EXECUTION DIRECTION\n${brandSignOff.seedanceDirection}\n`
    );
  }
  // Title authority belongs to the V1.4 treatment; the V1.3 presentation title stays in the legacy script.
  presentationScript = [
    treatment.title,
    ...presentationScript.split("\n").slice(1),
  ].join("\n");
  // The V1.4 structure replaces the frozen V1.3 five-role format line.
  presentationScript = presentationScript.replace(
    /^Format: .*$/m,
    `Format: Commercial film · V1.4 structure · ${basePresentation.directorScript.shots.length} shots`
  );
  return {
    canonicalCompiledText,
    v14CompiledText,
    presentationScript,
    sourceEvents: basePresentation.directorScript.shots.map((shot) => shot.sourceEvent),
    treatment,
    brandSignOff,
  };
}
