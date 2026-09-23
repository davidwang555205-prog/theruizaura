import { useState } from "react";
import type { CommercialV14PipelineGenerated } from "./types";

export function CreativeDirectingPanel({
  result,
}: {
  result: CommercialV14PipelineGenerated;
}) {
  const [scriptOpen, setScriptOpen] = useState(false);
  const treatment = result.plan.creativeTreatment;

  return (
    <section className="rounded-[16px] bg-white/70 p-5 ring-1 ring-aura-beige/70">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-aura-charcoal">V1.4 Creative Directing</h3>
          <p className="mt-1 text-xs text-aura-muted">Read-only pre-execution treatment. V1.3 canonical output remains separate.</p>
        </div>
        <button
          type="button"
          className="rounded-[12px] border border-aura-beige bg-white px-3.5 py-2 text-xs font-medium text-aura-charcoal"
          onClick={() => setScriptOpen((value) => !value)}
        >
          {scriptOpen ? "收起 V1.4 Director Script" : "查看 V1.4 Director Script"}
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <article className="rounded-[12px] bg-aura-cream/55 p-4">
          <b className="text-xs text-aura-charcoal">Creative Proposition</b>
          <p className="mt-2 text-xs leading-5 text-aura-muted">{treatment.creativeProposition.presentationText}</p>
        </article>
        <article className="rounded-[12px] bg-aura-cream/55 p-4">
          <b className="text-xs text-aura-charcoal">Director Concept</b>
          <p className="mt-2 text-xs leading-5 text-aura-muted">{treatment.directorConcept}</p>
        </article>
        <article className="rounded-[12px] bg-aura-cream/55 p-4">
          <b className="text-xs text-aura-charcoal">Signature Event</b>
          <p className="mt-2 text-xs leading-5 text-aura-muted">{treatment.signatureEvent.event}</p>
          <p className="mt-2 text-[11px] leading-5 text-aura-muted">Before: {treatment.signatureEvent.beforeState}</p>
          <p className="mt-1 text-[11px] leading-5 text-aura-muted">After: {treatment.signatureEvent.afterState}</p>
        </article>
        <article className="rounded-[12px] bg-aura-cream/55 p-4">
          <b className="text-xs text-aura-charcoal">Film Tension</b>
          <p className="mt-2 text-xs leading-5 text-aura-muted">{treatment.filmTension.from} → {treatment.filmTension.to}. {treatment.filmTension.line}</p>
        </article>
        <article className="rounded-[12px] bg-aura-cream/55 p-4">
          <b className="text-xs text-aura-charcoal">Pre-Moment Events</b>
          <p className="mt-2 text-xs leading-5 text-aura-muted">{treatment.preMomentEvents.map((beat) => beat.event).join(" → ")}</p>
        </article>
        <article className="rounded-[12px] bg-aura-cream/55 p-4">
          <b className="text-xs text-aura-charcoal">Post-Moment Events</b>
          <p className="mt-2 text-xs leading-5 text-aura-muted">{treatment.postMomentEvents.map((beat) => beat.event).join(" → ")}</p>
        </article>
        <article className="rounded-[12px] bg-aura-cream/55 p-4">
          <b className="text-xs text-aura-charcoal">Structure</b>
          <p className="mt-2 text-xs leading-5 text-aura-muted">{treatment.structureType}</p>
        </article>
        <article className="rounded-[12px] bg-aura-cream/55 p-4">
          <b className="text-xs text-aura-charcoal">Product Reveal Cause</b>
          <p className="mt-2 text-xs leading-5 text-aura-muted">{treatment.productRevealLogic.cause}</p>
          <p className="mt-2 text-[11px] leading-5 text-aura-muted">{treatment.productRevealLogic.eventRevealLink.causalConnection}</p>
        </article>
        <article className="rounded-[12px] bg-aura-cream/55 p-4 sm:col-span-2">
          <b className="text-xs text-aura-charcoal">Ending Image</b>
          <p className="mt-2 text-xs leading-5 text-aura-muted">{treatment.endingImage}</p>
          <p className="mt-1 text-[11px] leading-5 text-aura-muted">Meaning: {treatment.endingMeaning}</p>
        </article>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[12px] bg-aura-cream/55 p-4">
          <b className="text-xs text-aura-charcoal">Device Arc</b>
          <div className="mt-2 space-y-1.5">
            {treatment.deviceArc.map((beat) => (
              <p key={beat.beatIndex} className="text-[11px] leading-5 text-aura-muted">
                Beat {beat.beatIndex + 1}: {beat.deviceState} · {beat.deviceCarrier} · {beat.deviceIntensity}
              </p>
            ))}
          </div>
        </div>
        <div className="rounded-[12px] bg-aura-cream/55 p-4">
          <b className="text-xs text-aura-charcoal">Shot Visual Priorities</b>
          <div className="mt-2 space-y-1.5">
            {treatment.shotVisualPriorities.map((priority, index) => (
              <p key={index} className="text-[11px] leading-5 text-aura-muted">
                Shot {index + 1}: {priority.primary} / suppress {priority.suppressed}
              </p>
            ))}
          </div>
        </div>
      </div>

      {scriptOpen && (
        <pre
          data-testid="v14-director-script-output"
          className="aura-scrollbar mt-4 max-h-[680px] overflow-auto whitespace-pre-wrap rounded-[12px] bg-aura-cream/55 p-4 text-xs leading-5 text-aura-charcoal [overflow-wrap:anywhere]"
        >
          {result.plan.presentation.presentationScript}
        </pre>
      )}

      <details className="mt-4 rounded-[12px] bg-white/65 p-4">
        <summary className="cursor-pointer text-xs font-medium text-aura-charcoal">V1.4 Seedance Translation Extension</summary>
        <pre className="aura-scrollbar mt-3 max-h-[360px] overflow-auto whitespace-pre-wrap text-[11px] leading-5 text-aura-muted [overflow-wrap:anywhere]">
          {result.translationExtension}
        </pre>
      </details>
    </section>
  );
}
