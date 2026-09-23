import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import {
  DEFAULT_CHARACTER_SELECTION,
  getAgeProfileOptions,
  getAppearanceGroupOptions,
  type CharacterSelection,
} from "../immersive-narrative/character-profile";
import type { NarrativeSeason } from "../immersive-narrative/types";
import type {
  Image2ReferencePlan,
  TaskProductTruth,
  TaskReferenceSet,
} from "../visual-system/taskReferenceBinding";
import { COMMERCIAL_INTENT_CATALOG } from "./catalog";
import { buildCommercialVisualAcceptanceMatrix } from "./visual-acceptance";
import { buildCommercialFinalScriptPresentation } from "./presentation";
import { runCommercialV14Pipeline } from "./creative-directing";
import { CreativeDirectingPanel } from "./creative-directing/CreativeDirectingPanel";
import {
  runCommercialFilmPipeline,
  type CommercialFilmPipelineGenerated,
  type CommercialFilmPipelineOutcome,
} from "./pipeline";
import {
  buildCommercialReferenceInput,
  resolveCommercialReferenceState,
} from "./reference";
import type {
  CommercialFilmPlannerInput,
  CommercialIntentId,
} from "./types";

const inputClass =
  "w-full rounded-[14px] border border-aura-beige bg-white px-4 py-3 text-sm text-aura-charcoal outline-none transition focus:border-aura-clay";
const primaryButtonClass =
  "w-full rounded-[14px] bg-aura-charcoal px-5 py-3.5 text-sm font-medium text-aura-porcelain transition hover:bg-aura-muted";
const quietButtonClass =
  "rounded-[12px] border border-aura-beige bg-white px-3.5 py-2 text-xs font-medium text-aura-charcoal transition hover:border-aura-clay disabled:cursor-not-allowed disabled:opacity-45";
const DURATION_SECONDS = 15;
const SCRIPT_HEADER = "SEEDANCE — COMMERCIAL FILM";

type DraftInputs = {
  commercialIntent: CommercialIntentId;
  characterSelection: CharacterSelection;
  season: NarrativeSeason;
  lifestyleFeeling: string;
  generationNonce: number;
};

function initialDraft(): DraftInputs {
  return {
    commercialIntent: "URBAN_MOTION",
    characterSelection: DEFAULT_CHARACTER_SELECTION,
    season: "秋",
    lifestyleFeeling: "安静 / 克制 / 自然",
    generationNonce: 0,
  };
}

function toRequest(
  draft: DraftInputs,
  reference: CommercialFilmPlannerInput["reference"]
): CommercialFilmPlannerInput {
  return {
    ...draft,
    duration: 15,
    reference,
    generationNonce: draft.generationNonce,
  };
}

function requestSignature(request: CommercialFilmPlannerInput) {
  return JSON.stringify({
    commercialIntent: request.commercialIntent,
    characterSelection: request.characterSelection,
    season: request.season,
    lifestyleFeeling: request.lifestyleFeeling,
    referenceSetId: request.reference.referenceSetId,
    confirmedAssetIds: request.reference.confirmedAssetIds,
    confirmationStatus: request.reference.confirmationStatus,
    coverage: request.reference.coverage,
    generationNonce: request.generationNonce ?? 0,
  });
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
}

function isCommercialCompilerOutput(value: string) {
  return value.startsWith(SCRIPT_HEADER)
    && value.includes("[FILM IDEA]")
    && value.includes("[GLOBAL PRODUCT PROTECTION]")
    && value.includes("[NEGATIVES]")
    && !value.includes("[COMMERCIAL PLAN]")
    && !value.includes("[SHOT PLAN]")
    && !value.includes("[CAMERA PLAN]");
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-aura-charcoal">{label}</span>
      {children}
    </label>
  );
}

function statusClass(status: string) {
  if (status.includes("REQUIRED") || status === "BLOCKED" || status === "FAIL") return "text-aura-clay";
  if (status.includes("READY") || status.includes("PASS") || status.includes("VALIDATED")) return "text-emerald-800";
  return "text-aura-muted";
}

function QcGrid({ result }: { result: CommercialFilmPipelineGenerated }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Object.values(result.plan.qc).map((gate) => (
        <article key={gate.id} className="rounded-[12px] bg-aura-cream/55 p-4">
          <div className="flex items-center justify-between gap-3">
            <b className="text-sm text-aura-charcoal">{gate.label}</b>
            <span className={`text-xs font-medium ${statusClass(gate.status)}`}>{gate.status}</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-aura-muted">{gate.reason}</p>
        </article>
      ))}
    </div>
  );
}

function StoryQcGrid({ result }: { result: CommercialFilmPipelineGenerated }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Object.values(result.plan.creativeSpine.qc).map((gate) => (
        <article key={gate.id} className="rounded-[12px] bg-aura-cream/55 p-4">
          <div className="flex items-center justify-between gap-3">
            <b className="text-sm text-aura-charcoal">{gate.label}</b>
            <span className={`text-xs font-medium ${statusClass(gate.status)}`}>{gate.status}</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-aura-muted">{gate.reason}</p>
        </article>
      ))}
    </div>
  );
}

export function CommercialFilmWorkspace({
  referenceSet,
  productTruth,
  referencePlan,
  onUploadReferences,
  onManageReferences,
}: {
  referenceSet: TaskReferenceSet;
  productTruth: TaskProductTruth;
  referencePlan: Image2ReferencePlan;
  onUploadReferences: (event: ChangeEvent<HTMLInputElement>) => void;
  onManageReferences: () => void;
}) {
  const [draft, setDraft] = useState<DraftInputs>(initialDraft);
  const [generatedRequest, setGeneratedRequest] = useState<CommercialFilmPlannerInput | null>(null);
  const [status, setStatus] = useState("");
  const [directorExpanded, setDirectorExpanded] = useState(true);
  const [technicalExpanded, setTechnicalExpanded] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  const visualAcceptanceMatrix = useMemo(
    () => buildCommercialVisualAcceptanceMatrix(),
    []
  );
  const visualReviewByCaseId = useMemo(
    () => new Map(visualAcceptanceMatrix.reviewResults.map((review) => [review.caseId, review])),
    [visualAcceptanceMatrix]
  );

  const referenceInput = useMemo(
    () => buildCommercialReferenceInput(referenceSet, productTruth, referencePlan),
    [referenceSet, productTruth, referencePlan]
  );
  const referenceState = useMemo(
    () => resolveCommercialReferenceState(referenceInput),
    [referenceInput]
  );
  const currentRequest = useMemo(() => toRequest(draft, referenceInput), [draft, referenceInput]);
  const outcome: CommercialFilmPipelineOutcome | null = useMemo(
    () => (generatedRequest ? runCommercialFilmPipeline(generatedRequest) : null),
    [generatedRequest]
  );
  const generated = outcome?.status === "GENERATED" ? outcome : null;
  const staleOutput = Boolean(
    generatedRequest && requestSignature(generatedRequest) !== requestSignature(currentRequest)
  );
  const finalScript = generated?.modelFacingScript.compiledText ?? "";
  const finalScriptReady = isCommercialCompilerOutput(finalScript);
  const finalPresentation = useMemo(
    () => generated && finalScriptReady
      ? buildCommercialFinalScriptPresentation({
        plan: generated.plan,
        canonicalCompiledText: finalScript,
      })
      : null,
    [finalScript, finalScriptReady, generated]
  );
  const v14Outcome = useMemo(
    () => generatedRequest ? runCommercialV14Pipeline(generatedRequest) : null,
    [generatedRequest]
  );
  const v14Generated = v14Outcome?.status === "GENERATED" ? v14Outcome : null;
  // Production binding: the workbench default script and copy sources are the V1.4 output.
  const productionTreatment = v14Generated?.plan.creativeTreatment ?? null;
  const productionBrandSignOff = v14Generated?.plan.presentation.brandSignOff ?? null;
  const productionDirectorScript = v14Generated?.plan.presentation.presentationScript ?? "";
  const productionSeedancePrompt = v14Generated?.plan.v14CompiledText ?? "";
  const productionReady = Boolean(
    v14Generated && productionDirectorScript && productionSeedancePrompt
  );
  // Legacy frozen baseline stays available, but never as the default copy source.
  const legacyDirectorScript = finalPresentation?.presentationScript ?? "";
  const legacySeedancePrompt = finalPresentation?.canonicalCompiledText ?? "";
  const legacyReady = Boolean(generated && finalScriptReady && finalPresentation);

  const generate = () => {
    const nextDraft = {
      ...draft,
      generationNonce: draft.generationNonce + 1,
    };
    setDraft(nextDraft);
    setGeneratedRequest(toRequest(nextDraft, referenceInput));
    setDirectorExpanded(true);
    setTechnicalExpanded(false);
    setStatus("");
  };

  const copyDirectorScript = async () => {
    if (!productionReady) {
      setStatus("导演脚本尚未生成。");
      return;
    }
    await copyText(productionDirectorScript);
    setStatus("已复制 V1.4 导演脚本。");
  };

  const copySeedancePrompt = async () => {
    if (!productionReady) {
      setStatus("Seedance Prompt 绑定异常，已阻止复制。");
      return;
    }
    await copyText(productionSeedancePrompt);
    setStatus("已复制 V1.4 Seedance Prompt。");
  };

  const copyLegacyDirectorScript = async () => {
    if (!legacyReady) {
      setStatus("V1.3 frozen 导演脚本不可用。");
      return;
    }
    await copyText(legacyDirectorScript);
    setStatus("已复制 V1.3 frozen 导演脚本。");
  };

  const copyLegacySeedancePrompt = async () => {
    if (!legacyReady) {
      setStatus("V1.3 frozen Seedance Prompt 不可用。");
      return;
    }
    await copyText(legacySeedancePrompt);
    setStatus("已复制 V1.3 frozen Seedance Prompt。");
  };

  return (
    <section className="space-y-6">
      <header className="max-w-3xl space-y-2">
        <p className="text-xs uppercase tracking-[0.28em] text-aura-muted">
          THERUIZ AURA · COMMERCIAL FILM V1
        </p>
        <h1 className="text-3xl font-semibold text-aura-charcoal">品牌广告片</h1>
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-aura-muted">
          Product-First Lifestyle Commercial
        </p>
        <p className="text-sm leading-6 text-aura-muted">
          独立于 Immersive Narrative 的产品主导模式：先确定 Product Message，再编排五个语义镜头，最后进入 15 秒 Seedance 执行脚本。
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[350px_minmax(0,1fr)]">
        <aside className="space-y-5 self-start rounded-[20px] bg-aura-porcelain/95 p-6 shadow-aura ring-1 ring-aura-beige/70">
          <div>
            <h2 className="text-lg font-semibold text-aura-charcoal">Commercial Input</h2>
            <p className="mt-1 text-xs leading-5 text-aura-muted">V1 固定五种 Commercial Intent、固定 15 秒。</p>
          </div>
          <Field label="Commercial Intent">
            <select
              aria-label="Commercial Intent"
              data-testid="commercial-intent"
              className={inputClass}
              value={draft.commercialIntent}
              onChange={(event) => setDraft((current) => ({
                ...current,
                commercialIntent: event.target.value as CommercialIntentId,
              }))}
            >
              {COMMERCIAL_INTENT_CATALOG.map((intent) => (
                <option key={intent.id} value={intent.id}>
                  {intent.labelZh} · {intent.labelEn}
                </option>
              ))}
            </select>
          </Field>
          <Field label="年龄阶段">
            <select
              aria-label="Commercial Film 年龄阶段"
              className={inputClass}
              value={draft.characterSelection.ageProfileId}
              onChange={(event) => setDraft((current) => ({
                ...current,
                characterSelection: {
                  ...current.characterSelection,
                  ageProfileId: event.target.value as CharacterSelection["ageProfileId"],
                },
              }))}
            >
              {getAgeProfileOptions().map((profile) => (
                <option key={profile.id} value={profile.id}>{profile.label}</option>
              ))}
            </select>
          </Field>
          <Field label="人物外观">
            <select
              aria-label="Commercial Film 人物外观"
              className={inputClass}
              value={draft.characterSelection.appearanceGroupId}
              onChange={(event) => setDraft((current) => ({
                ...current,
                characterSelection: {
                  ...current.characterSelection,
                  appearanceGroupId: event.target.value as CharacterSelection["appearanceGroupId"],
                },
              }))}
            >
              {getAppearanceGroupOptions().map((group) => (
                <option key={group.id} value={group.id}>{group.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Season">
            <select
              aria-label="Commercial Film Season"
              className={inputClass}
              value={draft.season}
              onChange={(event) => setDraft((current) => ({
                ...current,
                season: event.target.value as NarrativeSeason,
              }))}
            >
              {(["春", "夏", "秋", "冬"] as NarrativeSeason[]).map((season) => (
                <option key={season}>{season}</option>
              ))}
            </select>
          </Field>
          <Field label="Lifestyle Feeling">
            <input
              aria-label="Commercial Film Lifestyle Feeling"
              className={inputClass}
              value={draft.lifestyleFeeling}
              onChange={(event) => setDraft((current) => ({
                ...current,
                lifestyleFeeling: event.target.value,
              }))}
            />
          </Field>
          <Field label="Duration">
            <div
              data-testid="commercial-duration-value"
              className="rounded-[14px] border border-aura-beige bg-white/70 px-4 py-3 text-sm text-aura-muted"
            >
              {DURATION_SECONDS} 秒 · V1 固定五镜头
            </div>
          </Field>

          <div className="rounded-[14px] bg-aura-cream/70 p-4 ring-1 ring-aura-beige/70">
            <div className="flex items-center justify-between gap-3">
              <b className="text-sm text-aura-charcoal">Product Reference</b>
              <span
                data-testid="commercial-reference-status"
                className={`text-xs font-medium ${statusClass(referenceState.status)}`}
              >
                {referenceState.status === "REFERENCE_READY" ? "OPTIONAL / READY" : referenceState.status}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-aura-muted">
              AURA 内部参考 {referenceState.confirmedReferenceCount} / {referenceSet.assets.length} 张 · Coverage {referenceState.coverage.length}/7
            </p>
            <p className="mt-2 text-xs leading-5 text-aura-muted">{referenceState.instruction}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <label className={quietButtonClass}>
                上传产品参考
                <input
                  aria-label="上传 Commercial Film 产品参考"
                  className="sr-only"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  onChange={onUploadReferences}
                />
              </label>
              <button type="button" className={quietButtonClass} onClick={onManageReferences}>
                管理参考角色
              </button>
            </div>
          </div>

          <button type="button" className={primaryButtonClass} data-testid="commercial-generate" onClick={generate}>
            生成品牌广告片脚本
          </button>
          {staleOutput && <p role="status" className="text-xs text-aura-clay">设定或参考图已更新，可重新生成。</p>}
        </aside>

        <div className="min-w-0 space-y-5">
          <section className="rounded-[20px] bg-white/70 p-5 ring-1 ring-aura-beige/70">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-aura-charcoal">Director Script</h2>
                <p data-testid="commercial-script-summary" className="mt-1 text-xs text-aura-muted">
                  {!outcome && "尚未生成 Commercial Film 脚本"}
                  {outcome?.status === "BLOCKED" && "已阻断，未生成假产品广告"}
                  {generated && `${generated.plan.commercialIntentLabel} · ${generated.plan.duration} 秒 · 5 Shots · ${generated.plan.cameraRhythm}`}
                </p>
              </div>
              {productionReady && (
                <button type="button" className={quietButtonClass} onClick={generate}>重新生成</button>
              )}
            </div>

            {!outcome && (
              <p className="mt-4 rounded-[14px] bg-aura-cream/55 px-4 py-6 text-sm text-aura-muted">
                尚未生成脚本。Commercial Film 可先独立生成完整脚本；产品身份可在外部 Seedance workflow 中通过参考图提供。
              </p>
            )}

            {outcome?.status === "BLOCKED" && (
              <div data-testid="commercial-blocked" className="mt-4 rounded-[14px] bg-aura-cream px-4 py-3 text-sm leading-6 text-aura-charcoal">
                <b>{outcome.code}</b>
                <p className="mt-2 text-aura-muted">{[outcome.reason, ...outcome.diagnostics].join(" ")}</p>
              </div>
            )}

            {productionReady && finalPresentation && (
              <div className="mt-4 space-y-4">
                <div className="rounded-[14px] bg-aura-cream/55 p-4">
                  <p data-testid="commercial-production-label" className="text-[11px] uppercase tracking-[0.2em] text-aura-muted">
                    Commercial Film · V1.4 · Production Script
                  </p>
                  <p data-testid="commercial-director-title" className="text-lg font-semibold tracking-[0.08em] text-aura-charcoal">
                    {productionTreatment?.title ?? finalPresentation.directorScript.title}
                  </p>
                  <p data-testid="commercial-creative-idea" className="mt-2 max-w-3xl text-sm leading-6 text-aura-muted">
                    {productionTreatment?.creativeProposition.presentationText ?? finalPresentation.directorScript.creativeIdea}
                  </p>
                  <div className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
                    <p className="text-aura-muted"><b className="text-aura-charcoal">Duration</b><span className="mt-1 block">{v14Generated?.plan.basePlan.duration ?? finalPresentation.directorScript.durationSeconds} seconds</span></p>
                    <p className="text-aura-muted"><b className="text-aura-charcoal">Format</b><span className="mt-1 block">Commercial film · V1.4 production script</span></p>
                    <p className="text-aura-muted"><b className="text-aura-charcoal">Tone</b><span className="mt-1 block">{finalPresentation.directorScript.tone}</span></p>
                  </div>
                  <div className="mt-4 grid gap-3 text-xs lg:grid-cols-2">
                    <p data-testid="commercial-director-concept" className="rounded-[12px] bg-white/65 p-3 text-aura-muted">
                      <b className="text-aura-charcoal">Director Concept</b>
                      <span className="mt-1 block leading-5">{productionTreatment?.directorConcept ?? finalPresentation.directorScript.directorConcept}</span>
                    </p>
                    <p data-testid="commercial-cinematic-device" className="rounded-[12px] bg-white/65 p-3 text-aura-muted">
                      <b className="text-aura-charcoal">Cinematic Device</b>
                      <span className="mt-1 block leading-5">{productionTreatment?.cinematicDevice ?? finalPresentation.directorScript.cinematicDevice}</span>
                    </p>
                  </div>
                </div>

                {directorExpanded && (
                  <pre
                    data-testid="commercial-director-script-output"
                    className="aura-scrollbar max-h-[760px] overflow-auto whitespace-pre-wrap rounded-[14px] bg-aura-cream/55 p-4 text-xs leading-5 text-aura-charcoal [overflow-wrap:anywhere]"
                  >
                    {productionDirectorScript}
                  </pre>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={quietButtonClass}
                    onClick={() => setDirectorExpanded((value) => !value)}
                  >
                    {directorExpanded ? "收起导演脚本" : "查看导演脚本"}
                  </button>
                  <button
                    type="button"
                    data-testid="commercial-copy-director"
                    className={quietButtonClass}
                    onClick={copyDirectorScript}
                  >
                    复制导演脚本
                  </button>
                  <button
                    type="button"
                    data-testid="commercial-copy-seedance"
                    className={quietButtonClass}
                    onClick={copySeedancePrompt}
                  >
                    复制 Seedance Prompt
                  </button>
                  <button
                    type="button"
                    data-testid="commercial-technical-toggle"
                    className={quietButtonClass}
                    onClick={() => setTechnicalExpanded((value) => !value)}
                  >
                    {technicalExpanded ? "收起 V1.4 技术执行稿" : "查看 V1.4 技术执行稿"}
                  </button>
                </div>

                {technicalExpanded && (
                  <div className="rounded-[14px] bg-white/75 p-4 ring-1 ring-aura-beige/70">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <b className="text-sm text-aura-charcoal">V1.4 Seedance Execution Prompt</b>
                      <span className="text-[11px] text-aura-muted">V1.4 production source · brand mark applied in post</span>
                    </div>
                    <pre
                      data-testid="commercial-script-output"
                      className="aura-scrollbar mt-3 max-h-[640px] overflow-auto whitespace-pre-wrap rounded-[12px] bg-aura-cream/55 p-4 text-xs leading-5 text-aura-charcoal [overflow-wrap:anywhere]"
                    >
                      {productionSeedancePrompt}
                    </pre>
                  </div>
                )}

                <details
                  data-testid="commercial-legacy-panel"
                  className="rounded-[14px] bg-aura-porcelain/60 p-4 ring-1 ring-aura-beige/60"
                >
                  <summary className="cursor-pointer text-xs font-medium text-aura-muted">
                    Legacy / Frozen Baseline · V1.3（非默认生产来源）
                  </summary>
                  <p className="mt-3 text-[11px] leading-5 text-aura-muted">
                    V1.3 保持 frozen baseline：canonical hash、presentationScript、canonicalCompiledText 与人工验收记录均未改动，仅供查看与回归。
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      data-testid="commercial-legacy-copy-director"
                      className={quietButtonClass}
                      onClick={copyLegacyDirectorScript}
                    >
                      复制 V1.3 frozen 导演脚本
                    </button>
                    <button
                      type="button"
                      data-testid="commercial-legacy-copy-seedance"
                      className={quietButtonClass}
                      onClick={copyLegacySeedancePrompt}
                    >
                      复制 V1.3 frozen Seedance Prompt
                    </button>
                  </div>
                  <pre
                    data-testid="commercial-legacy-director-script"
                    className="aura-scrollbar mt-3 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-[12px] bg-white/70 p-4 text-xs leading-5 text-aura-muted [overflow-wrap:anywhere]"
                  >
                    {legacyDirectorScript}
                  </pre>
                  <pre
                    data-testid="commercial-legacy-seedance"
                    className="aura-scrollbar mt-3 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-[12px] bg-white/70 p-4 text-xs leading-5 text-aura-muted [overflow-wrap:anywhere]"
                  >
                    {legacySeedancePrompt}
                  </pre>
                </details>
              </div>
            )}
            {generated && !finalScriptReady && (
              <p className="mt-4 rounded-[14px] bg-aura-cream px-4 py-3 text-sm text-aura-charcoal">
                最终脚本绑定异常：未检测到 Commercial Execution Compiler 输出。
              </p>
            )}
            {status && <p role="status" className="mt-3 text-xs text-aura-muted">{status}</p>}
          </section>

          {generated && (
            <section className="rounded-[20px] bg-white/70 p-5 ring-1 ring-aura-beige/70">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-aura-charcoal">5 Shot Architecture</h2>
                  <p className="mt-1 text-xs text-aura-muted">Semantic roles, not five unrelated compositions.</p>
                </div>
                <span className="rounded-full bg-aura-cream px-3 py-1 text-xs text-aura-muted ring-1 ring-aura-beige/70">
                  {generated.plan.productVisibilityPlan.readableShotIndexes.length} product-readable shots
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {generated.plan.shotArchitecture.shots.map((shot) => (
                  <article key={shot.role} className="rounded-[12px] bg-aura-cream/55 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <b className="text-sm text-aura-charcoal">Shot {shot.shotIndex + 1} · {shot.role}</b>
                      <span className="text-[11px] text-aura-muted">{shot.timeRange.startSecond}-{shot.timeRange.endSecond}s</span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-aura-muted">{shot.semanticPurpose}</p>
                    <p className="mt-2 text-[11px] font-medium text-aura-charcoal">{shot.productVisibility}</p>
                    <p className="mt-1 text-[11px] leading-5 text-aura-muted">{shot.spatialAnchor}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-[20px] bg-aura-porcelain/70 p-4 ring-1 ring-aura-beige/60">
            <button
              type="button"
              data-testid="commercial-debug-toggle"
              aria-expanded={debugOpen}
              className="flex w-full items-center justify-between gap-3 rounded-[12px] px-2 py-1 text-left text-sm font-medium text-aura-muted transition hover:text-aura-charcoal"
              onClick={() => setDebugOpen((value) => !value)}
            >
              <span>Debug / Internal</span>
              <span className="text-xs">{debugOpen ? "收起" : "展开"}</span>
            </button>

            {debugOpen && (
              <div data-testid="commercial-debug-panel" className="mt-4 space-y-4">
                {!generated && (
                  <p className="rounded-[12px] bg-white/70 px-4 py-3 text-xs text-aura-muted">
                    Debug 面板在成功生成后显示。
                  </p>
                )}
                {generated && (
                  <>
                    <section
                      data-testid="commercial-production-provenance"
                      className="rounded-[16px] bg-white/70 p-5 ring-1 ring-aura-beige/70"
                    >
                      <h3 className="text-base font-semibold text-aura-charcoal">Production Binding</h3>
                      <p className="mt-1 text-xs text-aura-muted">
                        主工作台脚本与复制来源的当前绑定状态。
                      </p>
                      <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
                        {[
                          ["mainDirectorScriptSource", "V1.4"],
                          ["mainSeedancePromptSource", "V1.4"],
                          ["treatmentVersion", "V1.4.4"],
                          ["creativeEngine", "FROZEN"],
                          ["brandSignoff", productionBrandSignOff ? `V1.4 · ${productionBrandSignOff.mode}` : "V1.4"],
                          ["brandSignoffAuthority", productionBrandSignOff?.authority ?? "GENERATED"],
                          ["v13Baseline", "LEGACY_FROZEN_BASELINE"],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-[12px] bg-aura-cream/55 p-3">
                            <dt className="font-medium text-aura-charcoal">{label}</dt>
                            <dd className="mt-1 text-aura-muted">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </section>
                    <section className="rounded-[16px] bg-white/70 p-5 ring-1 ring-aura-beige/70">
                      <h3 className="text-base font-semibold text-aura-charcoal">Creative Story Spine</h3>
                      <p className="mt-1 text-xs text-aura-muted">The commercial expression that precedes the five-shot architecture.</p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <article className="rounded-[12px] bg-aura-cream/55 p-4">
                          <b className="text-xs text-aura-charcoal">Creative Premise</b>
                          <p className="mt-2 text-xs leading-5 text-aura-muted">{generated.plan.creativeSpine.premise.text}</p>
                        </article>
                        <article className="rounded-[12px] bg-aura-cream/55 p-4">
                          <b className="text-xs text-aura-charcoal">Human Situation</b>
                          <p className="mt-2 text-xs leading-5 text-aura-muted">{generated.plan.creativeSpine.humanSituation.label}</p>
                          <p className="mt-1 text-[11px] leading-5 text-aura-muted">{generated.plan.creativeSpine.humanSituation.description}</p>
                        </article>
                        <article className="rounded-[12px] bg-aura-cream/55 p-4">
                          <b className="text-xs text-aura-charcoal">Audience Desire</b>
                          <p className="mt-2 text-xs leading-5 text-aura-muted">{generated.plan.creativeSpine.audienceDesire.label}</p>
                          <p className="mt-1 text-[11px] leading-5 text-aura-muted">{generated.plan.creativeSpine.audienceDesire.viewerOutcomeLine}</p>
                        </article>
                        <article className="rounded-[12px] bg-aura-cream/55 p-4">
                          <b className="text-xs text-aura-charcoal">Product Meaning</b>
                          <p className="mt-2 text-xs leading-5 text-aura-muted">{generated.plan.creativeSpine.productMeaning.meaning}</p>
                          <p className="mt-1 text-[11px] leading-5 text-aura-muted">{generated.plan.creativeSpine.productMeaning.unsupportedClaimGuard}</p>
                        </article>
                        <article className="rounded-[12px] bg-aura-cream/55 p-4 sm:col-span-2">
                          <b className="text-xs text-aura-charcoal">Reveal Strategy</b>
                          <p className="mt-2 text-xs leading-5 text-aura-muted">
                            {generated.plan.creativeSpine.revealStrategy} · {generated.plan.creativeSpine.arc.join(" → ")}
                          </p>
                        </article>
                      </div>
                    </section>
                    <section className="rounded-[16px] bg-white/70 p-5 ring-1 ring-aura-beige/70">
                      <h3 className="text-base font-semibold text-aura-charcoal">Creative Direction</h3>
                      <p className="mt-1 text-xs text-aura-muted">Camera behavior, edit logic, visual motif, and physical movement grammar.</p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <article className="rounded-[12px] bg-aura-cream/55 p-4">
                          <b className="text-xs text-aura-charcoal">Creative Mode</b>
                          <p className="mt-2 text-xs leading-5 text-aura-muted">{generated.plan.creativeDirection.creativeMode}</p>
                        </article>
                        <article className="rounded-[12px] bg-aura-cream/55 p-4">
                          <b className="text-xs text-aura-charcoal">Edit Logic</b>
                          <p className="mt-2 text-xs leading-5 text-aura-muted">
                            {generated.plan.creativeDirection.primaryEditLogic}
                            {generated.plan.creativeDirection.secondaryEditLogic ? ` + ${generated.plan.creativeDirection.secondaryEditLogic}` : " · primary only"}
                          </p>
                        </article>
                        <article className="rounded-[12px] bg-aura-cream/55 p-4 sm:col-span-2">
                          <b className="text-xs text-aura-charcoal">Visual Motif</b>
                          <p className="mt-2 text-xs leading-5 text-aura-muted">{generated.plan.creativeDirection.visualMotif ?? "NONE"}</p>
                        </article>
                        <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2 xl:grid-cols-5">
                          {generated.plan.creativeDirection.shotDirections.map((direction) => (
                            <article key={direction.shotRole} className="rounded-[12px] bg-aura-cream/55 p-4">
                              <b className="text-xs text-aura-charcoal">Shot {direction.shotIndex + 1} · {direction.shotRole}</b>
                              <p className="mt-2 text-[11px] font-medium text-aura-charcoal">{direction.cameraBehavior}</p>
                              <p className="mt-1 text-[11px] leading-5 text-aura-muted">{direction.cutMotivation}</p>
                              <p className="mt-2 text-[10px] leading-5 text-aura-muted">{direction.viewerAttentionTarget}</p>
                              <p className="mt-2 text-[10px] leading-5 text-aura-muted">{direction.movementContinuity}</p>
                              {direction.visualMotifContribution && <p className="mt-2 text-[10px] leading-5 text-aura-muted">{direction.visualMotifContribution}</p>}
                            </article>
                          ))}
                        </div>
                      </div>
                    </section>
                    <section className="rounded-[16px] bg-white/70 p-5 ring-1 ring-aura-beige/70">
                      <h3 className="text-base font-semibold text-aura-charcoal">Director Concept</h3>
                      <p className="mt-1 text-xs text-aura-muted">One cinematic rule governing the whole film, from composition through HERO and RELEASE.</p>
                      <div className="mt-4 rounded-[12px] bg-aura-cream/55 p-4">
                        <b className="text-xs text-aura-charcoal">{generated.plan.directorConcept.label}</b>
                        <p className="mt-2 text-xs leading-5 text-aura-muted">{generated.plan.directorConcept.globalRule}</p>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                        {generated.plan.directorConcept.shots.map((shot) => (
                          <article key={shot.shotRole} className="rounded-[12px] bg-aura-cream/55 p-4">
                            <b className="text-xs text-aura-charcoal">Shot {shot.shotIndex + 1} · {shot.shotRole}</b>
                            <p className="mt-2 text-[11px] font-medium text-aura-charcoal">{shot.contribution}</p>
                            <p className="mt-2 text-[10px] leading-5 text-aura-muted">{shot.conceptRule}</p>
                            <p className="mt-2 text-[10px] leading-5 text-aura-muted">{shot.productDiscovery}</p>
                          </article>
                        ))}
                      </div>
                    </section>
                    {v14Generated && <CreativeDirectingPanel result={v14Generated} />}
                    <section className="rounded-[16px] bg-white/70 p-5 ring-1 ring-aura-beige/70">
                      <h3 className="text-base font-semibold text-aura-charcoal">V1.3 Visual Acceptance</h3>
                      <p className="mt-1 text-xs text-aura-muted">
                        12 canonical cases exported for external Seedance review. No video result is inferred by this workspace.
                      </p>
                      <div data-testid="visual-acceptance-panel" className="mt-4 grid gap-2 sm:grid-cols-2">
                        {visualAcceptanceMatrix.cases.map((testCase) => {
                          const review = visualReviewByCaseId.get(testCase.caseId);
                          return (
                            <article key={testCase.caseId} className="rounded-[10px] bg-aura-cream/55 px-3 py-3 text-xs leading-5 text-aura-muted">
                              <b className="text-aura-charcoal">{testCase.caseId}</b>
                              <span className="mt-1 block">Intent: {testCase.intent}</span>
                              <span className="block">Director Concept: {testCase.directorConceptId}</span>
                              <span className="block">Cinematic Device: {testCase.cinematicDevice}</span>
                              <span className="block">Script Status: {testCase.scriptValidationStatus}</span>
                              <span className="block">Visual Status: {testCase.visualReviewStatus}</span>
                              <span className="block">Failure Codes: {review?.failureCodes.length ? review.failureCodes.join(", ") : "NONE"}</span>
                              <span className="block">Review Notes: {review?.notes || "NONE"}</span>
                            </article>
                          );
                        })}
                      </div>
                      <p className="mt-3 text-xs font-medium text-aura-clay">
                        VISUAL ACCEPTANCE STATUS: {visualAcceptanceMatrix.finalVisualStatus}
                      </p>
                    </section>
                    <section className="rounded-[16px] bg-white/70 p-5 ring-1 ring-aura-beige/70">
                      <h3 className="text-base font-semibold text-aura-charcoal">Event Spine / Timing</h3>
                      <p className="mt-1 text-xs text-aura-muted">What actually happens, how each event causes the next, and the dynamic 15-second rhythm.</p>
                      <div className="mt-3 space-y-2">
                        {generated.plan.eventSpine.shots.map((event) => (
                          <p key={event.shotRole} className="rounded-[10px] bg-aura-cream/55 px-3 py-2 text-xs leading-5 text-aura-muted">
                            <b className="text-aura-charcoal">Shot {event.shotIndex + 1} · {event.eventKind}</b> · {event.durationSeconds}s
                            <span className="block mt-1">{event.whatHappens}</span>
                            <span className="block mt-1">{event.causalFromPrevious}</span>
                          </p>
                        ))}
                      </div>
                      <p className="mt-3 text-xs leading-5 text-aura-muted">Ending grammar: {generated.plan.eventSpine.endingGrammar.label}</p>
                    </section>
                    <section className="rounded-[16px] bg-white/70 p-5 ring-1 ring-aura-beige/70">
                      <h3 className="text-base font-semibold text-aura-charcoal">Commercial QC</h3>
                      <p className="mt-1 text-xs text-aura-muted">Product Message, reference evidence, action reality, camera continuity, and ending.</p>
                      <div className="mt-4"><QcGrid result={generated} /></div>
                    </section>
                    <section className="rounded-[16px] bg-white/70 p-5 ring-1 ring-aura-beige/70">
                      <h3 className="text-base font-semibold text-aura-charcoal">Commercial Story QC</h3>
                      <p className="mt-1 text-xs text-aura-muted">Dramatic-function diversity, dependency, continuity, product meaning, and release resolution.</p>
                      <div className="mt-4"><StoryQcGrid result={generated} /></div>
                    </section>
                    <section className="rounded-[16px] bg-white/70 p-5 ring-1 ring-aura-beige/70">
                      <h3 className="text-base font-semibold text-aura-charcoal">Shot Story Functions</h3>
                      <p className="mt-1 text-xs text-aura-muted">How each existing shot participates in the same commercial expression.</p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                        {generated.plan.creativeSpine.shotFunctions.map((shot) => (
                          <article key={shot.shotRole} className="rounded-[12px] bg-aura-cream/55 p-4">
                            <b className="text-xs text-aura-charcoal">Shot {shot.shotIndex + 1} · {shot.shotRole}</b>
                            <p className="mt-2 text-[11px] font-medium text-aura-charcoal">{shot.dramaticFunction}</p>
                            <p className="mt-1 text-[11px] leading-5 text-aura-muted">{shot.productPresenceDesign}</p>
                            <p className="mt-2 text-[11px] leading-5 text-aura-muted">{shot.narrativePurpose}</p>
                            <p className="mt-2 text-[10px] leading-5 text-aura-muted">{shot.productNarrativeRole}</p>
                            <p className="mt-2 text-[10px] leading-5 text-aura-muted">{shot.continuityFromPrevious}</p>
                          </article>
                        ))}
                      </div>
                    </section>
                    <section className="rounded-[16px] bg-white/70 p-5 ring-1 ring-aura-beige/70">
                      <h3 className="text-base font-semibold text-aura-charcoal">Action Source Audit</h3>
                      <p className="mt-1 text-xs text-aura-muted">Existing 318 reuses remain read-only; Commercial-only primitives stay in a separate registry.</p>
                      <div className="mt-3 space-y-2">
                        {generated.plan.actionPlan.map((item) => (
                          <p key={`${item.shotRole}-${item.primitiveId}`} className="rounded-[10px] bg-aura-cream/55 px-3 py-2 text-xs leading-5 text-aura-muted">
                            <b className="text-aura-charcoal">Shot {item.shotIndex + 1} · {item.shotRole}</b> · {item.source}
                            {item.sourceActionId ? ` · ${item.sourceActionId}` : " · independent commercial primitive"}
                          </p>
                        ))}
                      </div>
                    </section>
                    <section className="rounded-[16px] bg-white/70 p-5 ring-1 ring-aura-beige/70">
                      <h3 className="text-base font-semibold text-aura-charcoal">Internal Commercial Plan</h3>
                      <pre className="aura-scrollbar mt-3 max-h-[480px] overflow-auto whitespace-pre-wrap rounded-[12px] bg-aura-cream/55 p-4 text-xs leading-5 text-aura-charcoal">
                        {generated.internalScript}
                      </pre>
                    </section>
                  </>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
