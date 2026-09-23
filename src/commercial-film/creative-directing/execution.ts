import type { CommercialCreativeTreatment, CommercialV14Presentation } from "./types";
import type { CommercialFinalScriptPresentation } from "../presentation";
import {
  commercialBrandSignOffModeLabel,
  type CommercialBrandSignOff,
} from "../brand-signoff";

const V14_SECTION_START = "\n[V1.4 CREATIVE DIRECTING]";

function deviceArcLines(treatment: CommercialCreativeTreatment) {
  return treatment.deviceArc.map((beat) => (
    `Beat ${beat.beatIndex + 1}: ${beat.deviceState}; carrier: ${beat.deviceCarrier}; intensity: ${beat.deviceIntensity}; ${beat.deviceFunction}`
  ));
}

function priorityLines(treatment: CommercialCreativeTreatment) {
  return treatment.shotVisualPriorities.map((priority, index) => (
    `Shot ${index + 1}: primary ${priority.primary}; secondary ${priority.secondary}; suppress ${priority.suppressed}`
  ));
}

export function buildCommercialV14TranslationExtension(
  treatment: CommercialCreativeTreatment,
  brandSignOff: CommercialBrandSignOff
): string {
  return [
    V14_SECTION_START,
    `Creative proposition: ${treatment.creativeProposition.presentationText}`,
    `Film tension: ${treatment.filmTension.from} -> ${treatment.filmTension.to}. ${treatment.filmTension.line}`,
    `Signature event: ${treatment.signatureEvent.event}`,
    `Product reveal: ${treatment.productRevealLogic.cause}`,
    `Ending image: ${treatment.endingImage}`,
    `Brand sign-off: hold ${brandSignOff.timing.startSecond.toFixed(1)}-${brandSignOff.timing.endSecond.toFixed(1)}s over the ending image and keep clean lower-frame space for the brand mark.`,
    `Brand mark: ${brandSignOff.brandMark} is applied in post as an overlay; do not render brand lettering in generation.`,
    ...(brandSignOff.filmLine
      ? ["Film line: added in post as a text overlay, never as generated lettering."]
      : []),
    "Device arc:",
    ...deviceArcLines(treatment).map((line) => `- ${line}`),
    "Shot visual priority:",
    ...priorityLines(treatment).map((line) => `- ${line}`),
  ].join("\n");
}

export function appendCommercialV14TranslationExtension(
  canonicalCompiledText: string,
  treatment: CommercialCreativeTreatment,
  brandSignOff: CommercialBrandSignOff
) {
  const extension = buildCommercialV14TranslationExtension(treatment, brandSignOff);
  const marker = "\n[SOUND WORLD]";
  if (!canonicalCompiledText.includes(marker)) {
    return `${canonicalCompiledText}\n${extension}\n`;
  }
  return canonicalCompiledText.replace(marker, `\n${extension}\n${marker}`);
}

function brandSignOffLines(brandSignOff: CommercialBrandSignOff) {
  return [
    "BRAND-SIGN-OFF",
    `Brand Mark: ${brandSignOff.brandMark}`,
    ...(brandSignOff.filmLine ? [`Film Line: ${brandSignOff.filmLine}`] : []),
    `Timing: ${brandSignOff.timing.startSecond.toFixed(1)}-${brandSignOff.timing.endSecond.toFixed(1)}s inside the ${brandSignOff.filmDurationSeconds} second film`,
    `Presentation mode: ${commercialBrandSignOffModeLabel(brandSignOff.mode)}`,
    "Applied in post over the ending image. The ending image is not replaced, cut short or re-staged.",
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
  return [
    "",
    "SIGNATURE MOMENT",
    treatment.signatureMoment.momentDescription,
    "",
    "DEVICE ARC",
    ...treatment.deviceArc.map((beat) => `${beat.beatIndex + 1}. ${beat.deviceState} through ${beat.deviceCarrier}. ${beat.deviceFunction}`),
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
  });
  presentationScript = presentationScript.includes(marker)
    ? presentationScript.replace(marker, `${headSections}\nDIRECTOR CONCEPT\n`)
    : `${presentationScript}${headSections}`;
  presentationScript = presentationScript.replace(
    /\nSHOT 1 — /,
    `${bodySections}\nSHOT 1 — `
  );
  presentationScript = presentationScript
    .replace(
      /\nSEEDANCE EXECUTION\n[\s\S]*$/,
      `\n${brandSignOffLines(brandSignOff).join("\n")}\nSEEDANCE EXECUTION DIRECTION\n${brandSignOff.seedanceDirection}\n`
    )
    .replace(
      /\nGLOBAL VISUAL LOOK\n/,
      `\nENDING IMAGE\n${treatment.endingImage}\n\nGLOBAL VISUAL LOOK\n`
    );
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
