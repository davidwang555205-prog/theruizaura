import { useMemo, useState, type ReactNode } from "react";
import { getSupportedNarrativeTopics, parseSceneLibraryText } from "./planner";
import { defaultSceneLabelsForTopic } from "./topic-catalog";
import {
  DEFAULT_CHARACTER_SELECTION,
  getAgeProfileOptions,
  getAppearanceGroupOptions,
  type CharacterSelection,
} from "./character-profile";
import {
  runImmersiveNarrativePipeline,
  type ImmersiveNarrativePipelineGenerated,
  type ImmersiveNarrativePipelineOutcome,
  type ImmersiveNarrativeRequest,
} from "./pipeline";
import { DEFAULT_REFERENCE_MAPPING } from "./seedance-compiler";
import type { NarrativeSeason } from "./types";

const inputClass = "w-full rounded-[14px] border border-aura-beige bg-white px-4 py-3 text-sm text-aura-charcoal outline-none transition focus:border-aura-clay";
const primaryButtonClass = "w-full rounded-[14px] bg-aura-charcoal px-5 py-3.5 text-sm font-medium text-aura-porcelain transition hover:bg-aura-muted";
const quietButtonClass = "rounded-[12px] border border-aura-beige bg-white px-3.5 py-2 text-xs font-medium text-aura-charcoal transition hover:border-aura-clay";
const DURATION_SECONDS = 15;

// The user-facing final artifact is the V1.1 Model-Facing Execution Script
// (`ModelFacingExecutionScript.compiledText`). The internal Seedance script and
// the Narrative Planner text stay inside Debug / Internal.
const MODEL_FACING_HEADER = "SEEDANCE — IMMERSIVE NARRATIVE EXECUTION SCRIPT";
const INTERNAL_SCRIPT_MARKERS = [
  "[NARRATIVE CORE]",
  "[MOMENT CHAIN]",
  "[NARRATIVE QC]",
  "APPROVED FOR SCENE RESOLUTION",
  "CORRECT_UNSUPPORTED",
  "REAL_CAPABILITY_GAP",
];

const DIRECTOR_SCRIPT_MARKERS = ["CREATIVE IDEA", "CHARACTER", "FILM STRUCTURE", "TAKE 1 —", "GLOBAL SOUND", "ENDING"];

// Fail-closed guard for the View / Copy chain: only a model-facing execution
// script may be copied as the execution prompt.
function isModelFacingExecutionScript(value: string) {
  return value.startsWith(MODEL_FACING_HEADER)
    && value.includes("[TIMELINE]")
    && value.includes("[ENDING STATE]")
    && !INTERNAL_SCRIPT_MARKERS.some((marker) => value.includes(marker));
}

// The director script is the primary user-facing artifact and carries its own
// vocabulary (TAKE / MOMENT), never commercial-film shot roles.
function isDirectorScriptOutput(value: string) {
  return DIRECTOR_SCRIPT_MARKERS.every((marker) => value.includes(marker))
    && !INTERNAL_SCRIPT_MARKERS.some((marker) => value.includes(marker))
    && !/\bSHOT [1-5] — (?:WORLD|WEAR|DETAIL|HERO|RELEASE)\b/.test(value);
}

type DraftInputs = {
  topic: string;
  characterSelection: CharacterSelection;
  season: NarrativeSeason;
  lifestyleFeeling: string;
  sceneLibraryText: string;
  variantSeed: number;
};

function initialDraft(): DraftInputs {
  const topic = getSupportedNarrativeTopics()[0];
  return {
    topic,
    characterSelection: DEFAULT_CHARACTER_SELECTION,
    season: "秋",
    lifestyleFeeling: "安静 / 克制",
    sceneLibraryText: defaultSceneLabelsForTopic(topic).join("\n"),
    variantSeed: -1,
  };
}

function toRequest(draft: DraftInputs): ImmersiveNarrativeRequest {
  return {
    topic: draft.topic,
    characterSelection: draft.characterSelection,
    season: draft.season,
    lifestyleFeeling: draft.lifestyleFeeling,
    availableSceneLibrary: parseSceneLibraryText(draft.sceneLibraryText),
    variantSeed: Math.max(0, draft.variantSeed),
    referenceMapping: DEFAULT_REFERENCE_MAPPING,
  };
}

function requestSignature(request: ImmersiveNarrativeRequest) {
  return JSON.stringify({
    topic: request.topic,
    characterSelection: request.characterSelection,
    season: request.season,
    lifestyleFeeling: request.lifestyleFeeling,
    variantSeed: request.variantSeed ?? 0,
    scenes: request.availableSceneLibrary.map((scene) => scene.label),
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

function statusTone(status: string) {
  if (status === "CORRECT_UNSUPPORTED" || status === "BLOCKED") return "text-aura-clay";
  if (status === "FAIL" || status === "FAILED" || status.endsWith("_FAILED")) return "text-red-700";
  return "text-aura-charcoal";
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-aura-charcoal">{label}</span>
      {children}
    </label>
  );
}

function StatusPill({ label, testId }: { label: string; testId?: string }) {
  return (
    <span data-testid={testId} className="rounded-full bg-aura-cream px-3 py-1 text-xs font-medium text-aura-muted ring-1 ring-aura-beige/70">
      {label}
    </span>
  );
}

type QcGateLike = { id: string; label: string; status: string; reason: string };

const STAGE_LABELS: Record<string, string> = {
  narrative: "Narrative",
  scene: "Scene",
  product: "Product",
  sound: "Sound",
  cameraRole: "Camera Role",
  physicalAction: "Physical Action",
  cameraExecution: "Camera Execution",
  compiler: "Compiler",
  finalScript: "Final Script",
};

function QcGrid({ qc }: { qc: Record<string, QcGateLike> }) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {Object.values(qc).map((gate) => (
        <article key={gate.id} className="rounded-[12px] bg-aura-cream/55 p-4">
          <div className="flex items-center justify-between gap-3">
            <b className="text-sm text-aura-charcoal">{gate.label}</b>
            <span className={`text-xs font-medium ${statusTone(gate.status)}`}>{gate.status}</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-aura-muted">{gate.reason}</p>
        </article>
      ))}
    </div>
  );
}

function DebugSection({
  title,
  subtitle,
  status,
  testId,
  children,
}: {
  title: string;
  subtitle: string;
  status?: string;
  testId?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[16px] bg-white/70 p-5 ring-1 ring-aura-beige/70">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-aura-charcoal">{title}</h3>
          <p className="mt-1 text-xs text-aura-muted">{subtitle}</p>
        </div>
        {status && <StatusPill label={status} testId={testId} />}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function FailureReasons({ reasons }: { reasons?: string[] }) {
  if (!reasons || reasons.length === 0) return null;
  return (
    <div className="mt-4 rounded-[12px] bg-aura-cream px-4 py-3 text-xs leading-5 text-aura-charcoal">
      <b>Failure Reasons</b>
      <ul className="mt-2 space-y-1 text-aura-muted">
        {reasons.map((reason) => <li key={reason}>{reason}</li>)}
      </ul>
    </div>
  );
}

function QcSummary({ qc }: { qc: Record<string, QcGateLike> }) {
  const gates = Object.values(qc);
  const failed = gates.filter((gate) => gate.status === "FAIL");
  return (
    <p className="text-xs leading-5 text-aura-muted">
      QC {gates.length - failed.length}/{gates.length} PASS{failed.length > 0 ? ` · FAIL: ${failed.map((gate) => gate.id).join(", ")}` : ""}
    </p>
  );
}

function ScriptDiagnostics({ result }: { result: ImmersiveNarrativePipelineGenerated }) {
  const { script, scriptValidation, stages } = result;
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Object.entries(stages).map(([stage, stageStatus]) => (
          <div key={stage} className="rounded-[12px] bg-aura-cream/55 p-3">
            <b className="text-xs text-aura-charcoal">{STAGE_LABELS[stage] ?? stage}</b>
            <p className={`mt-1 break-all text-xs font-medium ${statusTone(stageStatus)}`}>{stageStatus}</p>
          </div>
        ))}
      </div>
      <div className="rounded-[12px] bg-aura-cream/55 p-4 text-xs leading-5 text-aura-muted">
        <p><b className="text-aura-charcoal">Schema</b> {script.schemaVersion} · {script.compilerVersion}</p>
        <p className="mt-1"><b className="text-aura-charcoal">Provider dependency</b> {script.diagnostics.providerDependency} · provider assumptions {script.diagnostics.providerApiAssumptions} · downstream inventions {script.diagnostics.downstreamInventions}</p>
        <p className="mt-1"><b className="text-aura-charcoal">Sections consumed</b> {script.diagnostics.consumedSections.join(" / ")}</p>
        <p className="mt-1">
          <b className="text-aura-charcoal">Correct unsupported Moments</b> {script.diagnostics.correctUnsupportedCount} ·
          indexes {script.diagnostics.unsupportedMomentIndexes.length > 0
            ? script.diagnostics.unsupportedMomentIndexes.map((index) => index + 1).join(", ")
            : "none"}
        </p>
        <p className="mt-1"><b className="text-aura-charcoal">Characters</b> {script.diagnostics.characterCount}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {scriptValidation.checks.map((check) => (
          <article key={check.id} className="rounded-[12px] bg-aura-cream/55 p-4">
            <div className="flex items-center justify-between gap-3">
              <b className="text-sm text-aura-charcoal">{check.label}</b>
              <span className={`text-xs font-medium ${statusTone(check.status)}`}>{check.status}</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-aura-muted">{check.reason}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export function ImmersiveNarrativeWorkspace() {
  const [draft, setDraft] = useState<DraftInputs>(initialDraft);
  const [generatedRequest, setGeneratedRequest] = useState<ImmersiveNarrativeRequest | null>(null);
  const [status, setStatus] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);

  const outcome: ImmersiveNarrativePipelineOutcome | null = useMemo(
    () => (generatedRequest ? runImmersiveNarrativePipeline(generatedRequest) : null),
    [generatedRequest]
  );
  const currentRequest = useMemo(() => toRequest(draft), [draft]);
  const staleOutput = Boolean(
    generatedRequest && requestSignature(generatedRequest) !== requestSignature(currentRequest)
  );
  const generated = outcome && outcome.status === "GENERATED" ? outcome : null;
  // Primary artifact: the V1.2 director script. Secondary artifact: the Seedance
  // execution prompt. Both come from the pipeline; the UI never re-assembles them.
  const directorScriptText = generated?.presentation.presentationScript ?? "";
  const executionPromptText = generated?.modelFacingScript.compiledText ?? "";
  const executionStatus = generated?.modelFacingScript.status ?? null;
  const executionReasons = generated?.modelFacingScript.notExecutableReasons ?? [];
  const finalScriptIsExecutable = executionStatus === "EXECUTABLE";
  const executionPromptIsValid = isModelFacingExecutionScript(executionPromptText);
  const directorScriptIsValid = isDirectorScriptOutput(directorScriptText)
    && (generated ? generated.presentationValidation.status === "DIRECTOR_SCRIPT_VALIDATED" : false);
  const directorScriptReady = Boolean(generated) && finalScriptIsExecutable && directorScriptIsValid;

  const generate = () => {
    // 「重新生成」= 自动推进到下一个脚本变体（无需用户选择）。
    const nextDraft = { ...draft, variantSeed: draft.variantSeed + 1 };
    setDraft(nextDraft);
    setGeneratedRequest(toRequest(nextDraft));
    setExpanded(false);
    setPromptExpanded(false);
    setStatus("");
  };

  const copyDirectorScript = async () => {
    if (!generated) return;
    if (staleOutput) {
      setStatus("输入已变更：当前脚本来自上一组设定，请重新生成后再复制。");
      return;
    }
    if (!finalScriptIsExecutable) {
      setStatus(`当前脚本无法安全编译为外部执行脚本：${executionStatus ?? "UNKNOWN"}。`);
      return;
    }
    if (!directorScriptIsValid) {
      setStatus("导演脚本绑定异常：未检测到有效的导演脚本输出，已阻止复制。");
      return;
    }
    await copyText(directorScriptText);
    setStatus("已复制导演脚本。");
  };

  const copyExecutionPrompt = async () => {
    if (!generated) return;
    if (staleOutput) {
      setStatus("输入已变更：当前执行提示词来自上一组设定，请重新生成后再复制。");
      return;
    }
    if (!finalScriptIsExecutable || !executionPromptIsValid) {
      setStatus("执行提示词不可用：当前结果未通过执行编译校验。");
      return;
    }
    await copyText(executionPromptText);
    setStatus("已复制执行提示词。");
  };

  const copyInternalScript = async () => {
    if (!generated) return;
    await copyText(generated.script.compiledText);
    setStatus("已复制 Internal Compiler Script（内部表示，不是正式输出）。");
  };

  const copyNarrativePlan = async () => {
    if (!generated) return;
    await copyText(generated.plan.compiledText);
    setStatus("已复制 Narrative Plan（Debug 中间输出，不是最终脚本）。");
  };

  const handleTopicChange = (nextTopic: string) => {
    const suggestedScenes = defaultSceneLabelsForTopic(nextTopic);
    setDraft((current) => ({
      ...current,
      topic: nextTopic,
      variantSeed: -1,
      sceneLibraryText: suggestedScenes.length > 0 ? suggestedScenes.join("\n") : current.sceneLibraryText,
    }));
  };

  return (
    <section className="space-y-6">
      <header className="max-w-3xl space-y-2">
        <p className="text-xs uppercase tracking-[0.28em] text-aura-muted">THERUIZ AURA · IMMERSIVE NARRATIVE</p>
        <h1 className="text-3xl font-semibold text-aura-charcoal">代入感视频脚本</h1>
      </header>

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-5 self-start rounded-[20px] bg-aura-porcelain/95 p-6 shadow-aura ring-1 ring-aura-beige/70">
          <Field label="Topic">
            <select aria-label="Topic" className={inputClass} value={draft.topic} onChange={(event) => handleTopicChange(event.target.value)}>
              {getSupportedNarrativeTopics().map((topic) => <option key={topic}>{topic}</option>)}
            </select>
          </Field>
          <Field label="年龄阶段">
            <select
              aria-label="年龄阶段"
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
              {getAgeProfileOptions().map((profile) => <option key={profile.id} value={profile.id}>{profile.label}</option>)}
            </select>
          </Field>
          <Field label="人物外观">
            <select
              aria-label="人物外观"
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
              {getAppearanceGroupOptions().map((group) => <option key={group.id} value={group.id}>{group.label}</option>)}
            </select>
          </Field>
          <Field label="Season">
            <select
              aria-label="Season"
              className={inputClass}
              value={draft.season}
              onChange={(event) => setDraft((current) => ({ ...current, season: event.target.value as NarrativeSeason }))}
            >
              {(["春", "夏", "秋", "冬"] as NarrativeSeason[]).map((season) => <option key={season}>{season}</option>)}
            </select>
          </Field>
          <Field label="Lifestyle Feeling">
            <input
              aria-label="Lifestyle Feeling"
              className={inputClass}
              value={draft.lifestyleFeeling}
              onChange={(event) => setDraft((current) => ({ ...current, lifestyleFeeling: event.target.value }))}
            />
          </Field>
          <Field label="Duration">
            <div data-testid="duration-value" className="rounded-[14px] border border-aura-beige bg-white/70 px-4 py-3 text-sm text-aura-muted">
              {DURATION_SECONDS} 秒 · V1 固定基准
            </div>
          </Field>
          <button type="button" className={primaryButtonClass} onClick={generate}>
            生成代入感视频脚本
          </button>
          {staleOutput && <p role="status" className="text-xs text-aura-clay">设定已更新，可重新生成。</p>}
        </aside>

        <div className="min-w-0 space-y-5">
          <section className="rounded-[20px] bg-white/70 p-5 ring-1 ring-aura-beige/70">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-aura-charcoal">Director Script</h2>
                <p data-testid="script-summary" className="mt-1 text-xs text-aura-muted">
                  {!outcome && "尚未生成脚本"}
                  {outcome?.status === "BLOCKED" && "无法生成脚本"}
                  {generated && `${generated.presentation.directorScript.title} · 变体 ${generated.plan.variantSeed + 1} · ${generated.plan.durationSeconds} 秒 · ${generated.presentation.directorScript.takes.length} take(s) / ${generated.plan.momentCount} moments`}
                </p>
              </div>
              {directorScriptReady && (
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={quietButtonClass} onClick={() => setExpanded((value) => !value)}>
                    {expanded ? "收起脚本" : "查看完整脚本"}
                  </button>
                  <button
                    type="button"
                    className={`${quietButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}
                    disabled={staleOutput}
                    onClick={copyDirectorScript}
                  >
                    复制导演脚本
                  </button>
                  <button type="button" className={quietButtonClass} onClick={generate}>重新生成</button>
                </div>
              )}
            </div>

            {!outcome && (
              <p className="mt-4 rounded-[14px] bg-aura-cream/55 px-4 py-6 text-sm text-aura-muted">尚未生成脚本。</p>
            )}

            {outcome?.status === "BLOCKED" && (
              <div className="mt-4 rounded-[14px] bg-aura-cream px-4 py-3 text-sm leading-6 text-aura-charcoal">
                <b>无法生成脚本</b>
                <p className="mt-2 text-aura-muted">{[outcome.reason, ...outcome.diagnostics].join(" ")}</p>
              </div>
            )}

            {generated && staleOutput && (
              <div data-testid="stale-output-warning" className="mt-4 rounded-[14px] border border-aura-clay/40 bg-aura-cream px-4 py-3 text-xs leading-5 text-aura-charcoal">
                <b>输入已变更。</b> 人物外观/年龄、Season、Lifestyle Feeling 或 Scene Library 改动后，当前显示的是上一组设定生成的脚本；复制已禁用，请点击「重新生成」。
              </div>
            )}

            {directorScriptReady && (
              <pre
                data-testid="director-script-output"
                className={`aura-scrollbar mt-4 whitespace-pre-wrap rounded-[14px] bg-aura-cream/55 p-4 text-xs leading-5 text-aura-charcoal [overflow-wrap:anywhere] ${expanded ? "" : "max-h-[520px] overflow-auto"}`}
              >
                {directorScriptText}
              </pre>
            )}

            {generated && !finalScriptIsExecutable && (
              <div data-testid="execution-fail-closed" className="mt-4 rounded-[14px] bg-aura-cream px-4 py-3 text-sm leading-6 text-aura-charcoal">
                <b>当前脚本无法安全编译为外部执行脚本。</b>
                <p className="mt-2 text-xs text-aura-muted">{executionStatus}</p>
                {executionReasons.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-aura-muted">
                    {executionReasons.map((reason) => <li key={reason}>{reason}</li>)}
                  </ul>
                )}
              </div>
            )}

            {generated && finalScriptIsExecutable && !directorScriptIsValid && (
              <p data-testid="final-script-binding-error" className="mt-4 rounded-[14px] bg-aura-cream px-4 py-3 text-sm text-aura-charcoal">
                导演脚本绑定异常：当前结果不是有效的导演脚本输出，已阻止查看与复制。
              </p>
            )}

            {status && <p role="status" className="mt-3 text-xs text-aura-muted">{status}</p>}
          </section>

          {generated && (
            <section className="rounded-[20px] bg-white/70 p-5 ring-1 ring-aura-beige/70">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-aura-charcoal">Seedance Execution Prompt</h2>
                  <p data-testid="execution-prompt-summary" className="mt-1 text-xs text-aura-muted">
                    {finalScriptIsExecutable && executionPromptIsValid
                      ? `${executionPromptText.length} 字符 · ${executionStatus}`
                      : `不可用 · ${executionStatus ?? "UNKNOWN"}`}
                  </p>
                </div>
                {finalScriptIsExecutable && executionPromptIsValid && (
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className={quietButtonClass} onClick={() => setPromptExpanded((value) => !value)}>
                      {promptExpanded ? "收起执行提示词" : "查看执行提示词"}
                    </button>
                    <button
                      type="button"
                      className={`${quietButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}
                      disabled={staleOutput}
                      onClick={copyExecutionPrompt}
                    >
                      复制执行提示词
                    </button>
                  </div>
                )}
              </div>
              {finalScriptIsExecutable && executionPromptIsValid && promptExpanded && (
                <pre
                  data-testid="execution-prompt-output"
                  className="aura-scrollbar mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-[14px] bg-aura-cream/55 p-4 text-xs leading-5 text-aura-charcoal [overflow-wrap:anywhere]"
                >
                  {executionPromptText}
                </pre>
              )}
            </section>
          )}

          {generated && (
            <section className="rounded-[20px] bg-white/70 p-5 ring-1 ring-aura-beige/70">
              <h2 className="text-lg font-semibold text-aura-charcoal">Moment 概览</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {generated.momentReport.map((moment) => {
                  const cameraMoment = generated.cameraExecution.plan.moments.find((entry) => entry.momentIndex === moment.momentIndex);
                  return (
                    <article key={moment.momentIndex} className="rounded-[12px] bg-aura-cream/55 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <b className="text-sm text-aura-charcoal">Moment {moment.momentIndex + 1}</b>
                        <span className={`break-all text-xs font-medium ${statusTone(moment.physicalAction)}`}>{moment.physicalAction}</span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-aura-muted">{cameraMoment?.whatHappens ?? ""}</p>
                      <p className="mt-2 text-[11px] leading-5 text-aura-muted">
                        Camera: {cameraMoment?.cameraRole ?? "unresolved"}
                        {cameraMoment?.cameraMovement ? ` · ${cameraMoment.cameraMovement}` : ""}
                        {cameraMoment?.shotScale ? ` · ${cameraMoment.shotScale}` : ""}
                      </p>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          <section className="rounded-[20px] bg-aura-porcelain/70 p-4 ring-1 ring-aura-beige/60">
            <button
              type="button"
              data-testid="debug-toggle"
              aria-expanded={debugOpen}
              className="flex w-full items-center justify-between gap-3 rounded-[12px] px-2 py-1 text-left text-sm font-medium text-aura-muted transition hover:text-aura-charcoal"
              onClick={() => setDebugOpen((value) => !value)}
            >
              <span>Debug / Internal</span>
              <span className="text-xs">{debugOpen ? "收起" : "展开"}</span>
            </button>

            {debugOpen && (
              <div className="mt-4 space-y-4" data-testid="debug-panel">
                {!generated && (
                  <p className="rounded-[12px] bg-white/70 px-4 py-3 text-xs text-aura-muted">Debug 面板在生成后显示。</p>
                )}

                {generated && (
                  <>
                    <DebugSection
                      title="Character Profile"
                      subtitle="Age / Appearance catalog guardrails"
                      status={generated.character.status}
                      testId="character-profile-status"
                    >
                      <QcSummary qc={generated.character.qc} />
                      <div className="mt-2 grid gap-2 text-xs leading-5 text-aura-muted sm:grid-cols-2">
                        {Object.values(generated.character.qc).map((gate) => (
                          <p key={gate.id}><b className="text-aura-charcoal">{gate.label}:</b> {gate.status} · {gate.reason}</p>
                        ))}
                      </div>
                    </DebugSection>

                    <DebugSection
                      title="Narrative Planner"
                      subtitle={`${generated.plan.schemaVersion} · Debug 中间输出，不是最终脚本`}
                      status={generated.plan.status}
                      testId="narrative-plan-status"
                    >
                      <div className="flex flex-wrap justify-end gap-2">
                        <button type="button" className={quietButtonClass} onClick={copyNarrativePlan}>复制 Narrative Plan（Debug 中间输出）</button>
                      </div>
                      <pre data-testid="narrative-plan-output" className="aura-scrollbar mt-3 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-[12px] bg-aura-cream/55 p-4 text-xs leading-5 text-aura-charcoal">{generated.plan.compiledText}</pre>
                      <QcGrid qc={generated.plan.qc} />
                    </DebugSection>

                    <DebugSection
                      title="Internal Compiler Script"
                      subtitle="Internal representation (engineering script) · not the user-facing output"
                      status={`${generated.script.diagnostics.characterCount} chars`}
                      testId="internal-script-status"
                    >
                      <div className="flex flex-wrap justify-end gap-2">
                        <button type="button" className={quietButtonClass} onClick={copyInternalScript}>复制 Internal Script</button>
                      </div>
                      <pre data-testid="internal-script-output" className="aura-scrollbar mt-3 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-[12px] bg-aura-cream/55 p-4 text-xs leading-5 text-aura-charcoal">{generated.script.compiledText}</pre>
                    </DebugSection>

                    <DebugSection
                      title="Scene Resolver"
                      subtitle="Narrative → Scene Library mapping · deterministic / fail-closed"
                      status={generated.sceneResolution.status}
                      testId="scene-resolution-status"
                    >
                      <div className="space-y-3">
                        {generated.sceneResolution.resolvedMoments.map((moment) => (
                          <article key={`${moment.originalMomentId}-${moment.sceneId}`} className="rounded-[12px] bg-aura-cream/55 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <b className="text-sm text-aura-charcoal">Moment {moment.momentIndex + 1} · {moment.continuityRole}</b>
                              <span className="text-xs font-medium text-aura-muted">{moment.sceneName}</span>
                            </div>
                            <p className="mt-2 text-xs leading-5 text-aura-muted">{moment.matchReason}</p>
                          </article>
                        ))}
                      </div>
                      <QcGrid qc={generated.sceneResolution.qc} />
                      <FailureReasons reasons={generated.sceneResolution.failureReasons} />
                    </DebugSection>

                    <DebugSection
                      title="Product Presence"
                      subtitle="ABSENT · INCIDENTAL · READABLE · HERO · readability guard only"
                      status={generated.productPresence.status}
                      testId="product-presence-status"
                    >
                      <div className="space-y-3">
                        {generated.productPresence.curve.map((moment) => (
                          <article key={`${moment.momentIndex}-${moment.sceneId}`} className="rounded-[12px] bg-aura-cream/55 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <b className="text-sm text-aura-charcoal">Moment {moment.momentIndex + 1}</b>
                              <span className="text-xs font-medium text-aura-muted">{moment.presence}</span>
                            </div>
                            <p className="mt-2 text-xs leading-5 text-aura-muted">{moment.reason}</p>
                          </article>
                        ))}
                      </div>
                      <QcGrid qc={generated.productPresence.qc} />
                      <FailureReasons reasons={generated.productPresence.failureReasons} />
                    </DebugSection>

                    <DebugSection
                      title="Sound World"
                      subtitle="Naturalistic cues · no music · no dialogue · no voiceover"
                      status={generated.soundWorld.status}
                      testId="sound-world-status"
                    >
                      <div className="space-y-3">
                        {generated.soundWorld.moments.map((moment) => (
                          <article key={`${moment.momentIndex}-${moment.sceneId}`} className="rounded-[12px] bg-aura-cream/55 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <b className="text-sm text-aura-charcoal">Moment {moment.momentIndex + 1} · {moment.sceneName}</b>
                              <span className="text-xs font-medium text-aura-muted">{moment.dominantSound}</span>
                            </div>
                            <div className="mt-2 grid gap-1 text-xs leading-5 text-aura-muted sm:grid-cols-2">
                              {([
                                ["ENVIRONMENT", moment.environment],
                                ["HUMAN", moment.human],
                                ["OBJECT", moment.object],
                                ["FOOTWEAR", moment.footwear],
                              ] as const).filter(([, cues]) => cues.length > 0).map(([label, cues]) => (
                                <p key={label}><b className="text-aura-charcoal">{label}:</b> {cues.join(" · ")}</p>
                              ))}
                            </div>
                            <p className="mt-2 text-[11px] leading-5 text-aura-muted">Silence: {moment.silenceLevel}</p>
                          </article>
                        ))}
                      </div>
                      <QcGrid qc={generated.soundWorld.qc} />
                      <FailureReasons reasons={generated.soundWorld.failureReasons} />
                    </DebugSection>

                    <DebugSection
                      title="Camera Narrative Role"
                      subtitle="Observation relationship only · no lens, shot size, or camera execution"
                      status={generated.cameraNarrative.status}
                      testId="camera-narrative-status"
                    >
                      <div className="space-y-3">
                        {generated.cameraNarrative.moments.map((moment) => (
                          <article key={`${moment.momentIndex}-${moment.sceneId}`} className="rounded-[12px] bg-aura-cream/55 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <b className="text-sm text-aura-charcoal">Moment {moment.momentIndex + 1}</b>
                              <span className="text-xs font-medium text-aura-muted">{moment.role}</span>
                            </div>
                            <p className="mt-2 text-xs leading-5 text-aura-muted">{moment.reason}</p>
                          </article>
                        ))}
                      </div>
                      <QcGrid qc={generated.cameraNarrative.qc} />
                      <FailureReasons reasons={generated.cameraNarrative.failureReasons} />
                    </DebugSection>

                    <DebugSection
                      title="Physical Action"
                      subtitle="Existing Action reuse only · read-only capability mapping"
                      status={`${generated.physicalAction.report.coverage.matchedMoments}/${generated.physicalAction.report.coverage.totalMoments} MATCHED`}
                      testId="physical-action-status"
                    >
                      <p className="text-xs leading-5 text-aura-muted">
                        Coverage {generated.physicalAction.report.coverage.coveragePercent}% · unresolved {generated.physicalAction.report.coverage.unresolvedMoments} ·
                        unique existing Actions {generated.physicalAction.report.coverage.uniqueExistingActionsReused} ·
                        narrative primitives {generated.physicalAction.report.coverage.narrativePrimitivesUsed} · stage {generated.physicalAction.report.resultStage}
                      </p>
                      <div className="mt-3 space-y-3">
                        {generated.physicalAction.report.moments.map((moment) => {
                          const trace = moment.primitiveEligibility ?? moment.rejectedPrimitiveTraces[0]?.eligibility ?? null;
                          return (
                            <article key={`${moment.topicId}-${moment.momentIndex}`} className="rounded-[12px] bg-aura-cream/55 p-4">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <b className="text-sm text-aura-charcoal">Moment {moment.momentIndex + 1}</b>
                                <span className={`text-xs font-medium ${statusTone(moment.status === "MATCHED" ? "PASS" : "CORRECT_UNSUPPORTED")}`}>{moment.status}</span>
                              </div>
                              <p className="mt-2 text-xs leading-5 text-aura-muted">{moment.actionIntent}</p>
                              <p className="mt-1 text-[11px] leading-5 text-aura-muted">
                                Canonical index {moment.momentIndex} ·{" "}
                                {moment.selectedActionId
                                  ? `${moment.selectedActionId} (${moment.selectedActionFamily} · ${moment.source})`
                                  : `Missing: ${moment.missingCapability ?? "unknown capability"}`}
                              </p>
                              <p className="mt-1 text-[11px] leading-5 text-aura-muted">
                                Candidates {moment.candidateFunnel.finalCompatible}/{moment.candidateFunnel.totalActions} · {moment.selectionReason}
                                {moment.tieBreak ? ` · tie-break over ${moment.tieBreakCandidateCount} equivalent candidates` : ""}
                              </p>
                              <p className="mt-1 text-[11px] leading-5 text-aura-muted">
                                Stride phase — required: {moment.stridePhase.required.length ? moment.stridePhase.required[0] : "UNDECLARED"} ·
                                selected: {moment.stridePhase.selected ?? "none"} · match: {moment.stridePhase.match}
                              </p>
                              {moment.status === "UNRESOLVED" && (
                                <p className="mt-1 text-[11px] leading-5 text-aura-muted">
                                  Reason: {moment.unresolvedReason} · Gap: {moment.gapId} ({moment.gapClass})
                                </p>
                              )}
                              <div className="mt-2 rounded-[10px] bg-white/70 p-3 ring-1 ring-aura-beige/60">
                                <p className="text-[11px] font-medium text-aura-charcoal">
                                  Eligibility Trace · {moment.primitiveEligibility
                                    ? `PASS (${moment.primitiveEligibility.primitiveId})`
                                    : trace
                                      ? `FAIL (${trace.primitiveId})`
                                      : `N/A (${moment.source})`}
                                </p>
                                {trace?.capabilityVerdicts.map((verdict) => (
                                  <p key={`${verdict.capability}-${verdict.verdict}`} className="mt-1 text-[11px] leading-5 text-aura-muted">
                                    {verdict.capability} · {verdict.verdict} · {verdict.evidence}
                                    {verdict.objectClass ? ` · object ${verdict.objectClass}` : ""}
                                  </p>
                                ))}
                                {trace?.sameObjectExceptions.map((exception) => (
                                  <p key={`${exception.capability}-exception`} className="mt-1 text-[11px] leading-5 text-aura-muted">
                                    Same-Object Exception · {exception.capability} · object {exception.objectClass}
                                  </p>
                                ))}
                                {trace?.unsupportedExtraCapabilities.map((capability) => (
                                  <p key={`${capability}-unsupported`} className="mt-1 text-[11px] leading-5 text-aura-clay">
                                    REJECTED_UNSUPPORTED_EXTRA · {capability}
                                  </p>
                                ))}
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </DebugSection>

                    <DebugSection
                      title="Camera Execution"
                      subtitle="Role → execution mapping · single lens family · camera observes the Physical Action"
                      status={generated.cameraExecution.plan.status}
                      testId="camera-execution-status"
                    >
                      <p className="text-xs leading-5 text-aura-muted">
                        {generated.cameraExecution.plan.continuityProfile.focalRange} · {generated.cameraExecution.plan.continuityProfile.cameraSide} ·
                        lens families {generated.cameraExecution.plan.coverage.lensFamilyCount} · side switches {generated.cameraExecution.plan.coverage.sideSwitches} ·
                        reset-to-front {generated.cameraExecution.plan.coverage.resetToFrontCount} ·
                        product-driven camera {generated.cameraExecution.plan.coverage.productDrivenCameraMoments} ·
                        action rewrites {generated.cameraExecution.plan.coverage.actionRewrites}
                      </p>
                      <div className="mt-3 space-y-3">
                        {generated.cameraExecution.plan.moments.map((moment) => (
                          <article key={moment.momentIndex} className="rounded-[12px] bg-aura-cream/55 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <b className="text-sm text-aura-charcoal">Moment {moment.momentIndex + 1}</b>
                              <span className="flex flex-wrap items-baseline gap-x-2">
                                <span className={`break-all text-xs font-medium ${statusTone(moment.status)}`}>{moment.status}</span>
                                <span className="text-xs text-aura-muted">{moment.cameraRole}</span>
                              </span>
                            </div>
                            <p className="mt-2 text-xs leading-5 text-aura-muted">{moment.actionPreservation}</p>
                            {moment.status === "EXECUTABLE" ? (
                              <p className="mt-1 text-[11px] leading-5 text-aura-muted">
                                {moment.shotScale} · {moment.cameraHeight} · {moment.viewAngle} · {moment.cameraMovement} · {moment.workingDistance}
                              </p>
                            ) : (
                              <p className="mt-1 text-[11px] leading-5 text-aura-clay">{moment.unsupportedReason}</p>
                            )}
                            <p className="mt-1 text-[11px] leading-5 text-aura-muted">Product guard: {moment.productVisibilityGuard}</p>
                            <p className="mt-1 text-[11px] leading-5 text-aura-muted">{moment.transitionBehavior}</p>
                          </article>
                        ))}
                      </div>
                      <QcGrid qc={generated.cameraExecution.plan.qc} />
                      <FailureReasons reasons={generated.cameraExecution.plan.failureReasons} />
                    </DebugSection>

                    <DebugSection title="Compiler Diagnostics" subtitle="Canonical upstream consumption · no regeneration · no Provider assumption">
                      <ScriptDiagnostics result={generated} />
                    </DebugSection>

                    <DebugSection title="Input · Scene Library" subtitle="Available scene set used by the Scene Resolver">
                      <textarea
                        aria-label="Available Scene Library"
                        className={`${inputClass} min-h-28`}
                        value={draft.sceneLibraryText}
                        onChange={(event) => setDraft((current) => ({ ...current, sceneLibraryText: event.target.value }))}
                      />
                    </DebugSection>
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
