import type { TeamSeason } from "../types";
import type { SoftSeedingImagePlan, SoftSeedingTopic } from "../utils/generateSoftSeedingContent";
import type { NonProductAtmospherePlan } from "../non-product-atmosphere";
import {
  compileSeedanceAtmosphereVideoScript,
  compileSeedanceVideoScript,
  type CompiledVideoScript,
  type VideoScriptDuration,
} from "./compileSeedanceVideoScript";

export type CompiledThemeVideoScript = {
  script: string;
  duration: VideoScriptDuration;
  sourceCount: number;
  selectedSourceIndices: number[];
  sceneCount: number;
  executionMode: "manual_draft";
};

type ThemeSource = {
  index: number;
  label: string;
  purpose: string;
  compiled: CompiledVideoScript;
};

function targetSceneCount(sourceCount: number, duration: VideoScriptDuration) {
  if (sourceCount <= 3) return sourceCount;
  return Math.min(sourceCount, duration === 10 ? 4 : 5);
}

function selectDistributedSources(sources: ThemeSource[], duration: VideoScriptDuration) {
  const count = targetSceneCount(sources.length, duration);
  if (count >= sources.length) return sources;
  const selected = Array.from({ length: count }, (_, index) =>
    Math.round(index * (sources.length - 1) / Math.max(1, count - 1))
  );
  return [...new Set(selected)].map((index) => sources[index]).filter(Boolean);
}

function buildTimeRanges(sceneCount: number, duration: VideoScriptDuration) {
  return Array.from({ length: sceneCount }, (_, index) => {
    const start = Number((index * duration / sceneCount).toFixed(1));
    const end = index === sceneCount - 1 ? duration : Number(((index + 1) * duration / sceneCount).toFixed(1));
    return { start, end };
  });
}

function topicDirection(topic: SoftSeedingTopic) {
  const directions: Record<SoftSeedingTopic, string> = {
    "生活场景软种草": "Build one believable Xiaohongshu buyer diary with a clear daily-life progression. Each scene must feel like the next moment in the same outing, never like separate advertisements.",
    "穿搭解决方案": "Build one outfit-solution film: establish the complete look, demonstrate how it works through natural movement, and resolve with readable person-to-footwear proportions.",
    "棚内上新拍摄": "Build one continuous studio performance using the selected studio cards as choreography phases. Keep one studio, one lighting setup, one model, one wardrobe and one lens family throughout.",
    "上新活动转化": "Build one restrained launch-conversion film: establish desire, show credible use, deliver clear product evidence, then finish on a calm purchase-consideration frame.",
    "产品开发幕后": "Build one coherent behind-the-scenes process film in a single working-world logic, moving from context to making evidence to a resolved product-aware finish.",
    "秋冬配色实验室": "Build one autumn-winter color-study film whose palette relationships develop across the selected scenes without changing season or product truth.",
    "材质工艺认知": "Build one material-and-craft observation film. Reveal only visible reference-bound surface and construction relationships; never name an unconfirmed material.",
    "品牌审美观点": "Build one quiet editorial point-of-view film with coherent visual grammar, restrained movement and a stable brand-led conclusion.",
  };
  return directions[topic];
}

function sharedContinuity(sources: ThemeSource[]) {
  const person = sources.find((source) => source.compiled.filmSpec.scene.subjectMode === "person_with_product");
  if (!person) return ["Keep the sequence person-free and preserve one coherent world, season, palette and light logic."];
  const scene = person.compiled.filmSpec.scene;
  return [
    `Use the same person throughout: ${scene.model ?? "the resolved model identity from the selected image plan"}.`,
    `Use one unchanged outfit throughout: ${scene.selectedOutfitLine ?? scene.wardrobePreference ?? "the resolved wardrobe from the selected image plan"}.`,
    "Preserve face identity, age, hair, body proportions, bag and accessories across every cut.",
    "Preserve the same season and a compatible light, color and lens family across the complete film.",
  ];
}

function referenceInstruction(sources: ThemeSource[], atmosphere: boolean) {
  const mapping = sources.find((source) => source.compiled.filmSpec.referenceMapping.confirmedReferenceCount > 0)?.compiled.filmSpec.referenceMapping;
  if (atmosphere) {
    return mapping?.confirmedReferenceCount
      ? `Manually attach the ${mapping.confirmedReferenceCount} current-task reference${mapping.confirmedReferenceCount === 1 ? "" : "s"} only when Product Echo is required. They may guide restrained palette or material echo, never a hero product.`
      : "No product reference is required. Do not invent or introduce a footwear product.";
  }
  return mapping?.instruction ?? "Confirm the Reference Plan in THERUIZ AURA, then manually upload the confirmed footwear references to Seedance2.5 before generating.";
}

function productProtection(sources: ThemeSource[], atmosphere: boolean) {
  if (atmosphere) return ["This is a non-product atmosphere film. Product priority remains none in every scene; reference images may provide Product Echo only."];
  return sources.find((source) => source.compiled.filmSpec.productProtection.enabled)?.compiled.filmSpec.productProtection.rules
    ?? ["Use the uploaded footwear references as the only product source; do not invent product facts."];
}

function sceneAction(source: ThemeSource, isFinal: boolean, atmosphere: boolean) {
  const spec = source.compiled.filmSpec;
  const scene = spec.scene;
  const evidence = spec.beats.find((beat) => /product-evidence|product-read|action-evidence/.test(beat.id));
  const action = scene.resolvedActionDirection || spec.motion.direction;
  if (atmosphere) return `${action} Preserve the resolved life trace and environmental movement; keep the frame person-free and product priority none.`;
  if (isFinal) return `${action} Then settle into a stable final state with at least one complete referenced shoe naturally readable at believable human scale.`;
  return `${action} ${evidence?.action ?? "Keep the referenced footwear coherent, grounded and naturally integrated."}`;
}

function renderUnifiedScript(input: {
  title: string;
  narrative: string;
  sources: ThemeSource[];
  duration: VideoScriptDuration;
  atmosphere: boolean;
}) {
  const selected = selectDistributedSources(input.sources, input.duration);
  const ranges = buildTimeRanges(selected.length, input.duration);
  const first = selected[0]?.compiled.filmSpec;
  const last = selected[selected.length - 1]?.compiled.filmSpec;
  const brandRules = first?.scene.brandVisualDirectingRules ?? [];
  const timeline = selected.flatMap((source, index) => {
    const spec = source.compiled.filmSpec;
    const range = ranges[index];
    const productPriority = input.atmosphere ? "none" : index === selected.length - 1 ? "hero" : "supporting";
    return [
      `Scene ${index + 1} | ${range.start}–${range.end}s | Source image ${source.index}: ${source.label}`,
      `Narrative purpose: ${source.purpose}`,
      `Location: ${spec.scene.resolvedLocationDirection}`,
      `Action: ${sceneAction(source, index === selected.length - 1, input.atmosphere)}`,
      `Camera: ${spec.camera.framing} ${spec.camera.movement} ${spec.camera.distanceRule}`,
      `Product priority: ${productPriority}`,
    ];
  });
  const script = [
    "SEEDANCE 2.5 — UNIFIED THEME VIDEO SCRIPT",
    `Theme: ${input.title}`,
    `Duration: ${input.duration} seconds`,
    `Source plan: ${input.sources.length} image prompt${input.sources.length === 1 ? "" : "s"}; ${selected.length} selected scene${selected.length === 1 ? "" : "s"} compiled into one video task.`,
    "Execution: Manual / Draft. This is one unified Seedance2.5 video task. Copy the complete script once and manually attach the required references on the external Seedance2.5 website. No API request has been sent.",
    "Do not generate separate videos for the scene sections below; render them as consecutive moments in one continuous film.",
    "",
    "[SCENE SPEC]",
    `- Season: ${first?.scene.season ?? "preserve the selected season"}`,
    `- Narrative architecture: ${input.narrative}`,
    `- Opening world: ${first?.scene.scene ?? "the first selected scene"}`,
    `- Closing world: ${last?.scene.scene ?? "the final selected scene"}`,
    "",
    "[CONTINUITY LOCK]",
    ...sharedContinuity(selected).map((line) => `- ${line}`),
    "",
    "[FILM SPEC / CONTINUOUS TIMELINE]",
    ...timeline,
    "",
    "[MOTION]",
    "Use only the actions assigned to each timeline scene. Connect cuts through believable body, object or environmental motion; do not invent an unrelated performance.",
    "Avoid running, jumping, abrupt speed ramps, morphing transitions, floating feet and repeated identical gestures.",
    "",
    "[CAMERA]",
    "Preserve each source image's composition objective while keeping one compatible natural-perspective lens family across the group.",
    "Use stable working distance. Do not approach the footwear with an ultra-wide lens, low angle, zoom burst or perspective-stretching move.",
    "",
    "[BRAND VISUAL / DIRECTING RULES]",
    `Positioning: ${first?.scene.brandVisualPositioning ?? "THERUIZ AURA"}`,
    ...brandRules.map((rule) => `- ${rule}`),
    "",
    "[PRODUCT PROTECTION]",
    ...productProtection(selected, input.atmosphere).map((rule) => `- ${rule}`),
    "",
    "[REFERENCE MAPPING]",
    referenceInstruction(selected, input.atmosphere),
  ].join("\n");
  return {
    script,
    duration: input.duration,
    sourceCount: input.sources.length,
    selectedSourceIndices: selected.map((source) => source.index),
    sceneCount: selected.length,
    executionMode: "manual_draft" as const,
  };
}

export function compileSoftSeedingThemeVideoScript(input: {
  images: SoftSeedingImagePlan[];
  topic: SoftSeedingTopic;
  duration: VideoScriptDuration;
}): CompiledThemeVideoScript {
  const sources = input.images.map((image, index) => ({
    index: index + 1,
    label: image.name,
    purpose: image.purpose,
    compiled: compileSeedanceVideoScript({ params: image.params, duration: input.duration }),
  }));
  return renderUnifiedScript({ title: input.topic, narrative: topicDirection(input.topic), sources, duration: input.duration, atmosphere: false });
}

export function compileAtmosphereThemeVideoScript(input: {
  plan: NonProductAtmospherePlan;
  season: TeamSeason;
  duration: VideoScriptDuration;
}): CompiledThemeVideoScript {
  const sources = input.plan.images.map((image) => ({
    index: image.index,
    label: image.slot.sceneLabel,
    purpose: `Develop the resolved ${image.sceneResolution.resolvedArchetypeId} / ${image.sceneResolution.resolvedVariantId} atmosphere without introducing a person or hero product.`,
    compiled: compileSeedanceAtmosphereVideoScript({ image, season: input.season, duration: input.duration, referenceCount: input.plan.referenceImageCount }),
  }));
  return renderUnifiedScript({
    title: "非产品氛围图",
    narrative: "Build one person-free atmosphere film from the selected visual plan. Progress through compatible traces of life, light and space while Product Echo remains incidental and never becomes a product showcase.",
    sources,
    duration: input.duration,
    atmosphere: true,
  });
}
