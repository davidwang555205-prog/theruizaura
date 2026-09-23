import type { NarrativePlan } from "../types";
import type { SceneResolverOutput } from "../scene-resolver";
import type { ProductPresenceOutput } from "../product-presence";
import type { SoundWorldOutput } from "../sound-world";
import type { CameraNarrativeOutput } from "../camera-role";
import type { PhysicalActionAuditInput } from "./types";

export type PhysicalActionPipelineInputs = {
  topicLabel: string;
  plan: NarrativePlan;
  sceneResolution: SceneResolverOutput;
  productPresence: ProductPresenceOutput;
  soundWorld: SoundWorldOutput;
  cameraNarrative: CameraNarrativeOutput;
};

export type PhysicalActionAuditInputResult = {
  input: PhysicalActionAuditInput;
  alignmentIssues: string[];
};

// Moment identity comes from the upstream NarrativeMoment.index field. Every
// downstream record is joined on that canonical index instead of array position,
// so a re-ordered upstream array cannot silently re-identify a Moment.
export function buildPhysicalActionAuditInput(
  pipeline: PhysicalActionPipelineInputs
): PhysicalActionAuditInputResult {
  const alignmentIssues: string[] = [];

  const moments = pipeline.plan.moments.map((moment) => {
    const canonicalIndex = moment.index;
    const sceneMoment = pipeline.sceneResolution.resolvedMoments.find(
      (entry) => entry.momentIndex === canonicalIndex
    );
    const productMoment = pipeline.productPresence.curve.find(
      (entry) => entry.momentIndex === canonicalIndex
    );
    const soundMoment = pipeline.soundWorld.moments.find(
      (entry) => entry.momentIndex === canonicalIndex
    );
    const cameraMoment = pipeline.cameraNarrative.moments.find(
      (entry) => entry.momentIndex === canonicalIndex
    );

    if (!sceneMoment) alignmentIssues.push(`Moment ${canonicalIndex} has no Scene Resolver record for its canonical index.`);
    if (!productMoment) alignmentIssues.push(`Moment ${canonicalIndex} has no Product Presence record for its canonical index.`);
    if (!soundMoment) alignmentIssues.push(`Moment ${canonicalIndex} has no Sound World record for its canonical index.`);
    if (!cameraMoment) alignmentIssues.push(`Moment ${canonicalIndex} has no Camera Narrative record for its canonical index.`);

    return {
      // NarrativePlan.topicId is declared as string; it carries the canonical
      // NarrativeTopicId produced by the Topic Catalog, matching camera-role.
      topicId: pipeline.plan.topicId as PhysicalActionAuditInput["moments"][number]["topicId"],
      topicLabel: pipeline.topicLabel,
      momentIndex: canonicalIndex,
      purpose: moment.purpose,
      whatHappens: moment.whatHappens,
      sceneId: sceneMoment?.sceneId ?? "",
      sceneName: sceneMoment?.sceneName ?? "",
      productPresence: productMoment?.presence ?? "ABSENT",
      cameraRole: cameraMoment?.role ?? "OBSERVER",
    };
  });

  return { input: { moments }, alignmentIssues };
}
