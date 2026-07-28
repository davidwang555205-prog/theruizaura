import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type {
  TeamGarmentTypePreference,
  TeamImageType,
  TeamModelContinuity,
  TeamModelChoice,
  TeamPromptParams,
  TeamScenePreference,
  TeamSeason,
  TeamStudioLaunchAnglePreference,
  TeamStudioLaunchPreset,
  TeamStudioWardrobePreference,
} from "./types";
import { generatePromptRuntime } from "./prompt-engine/runtime";
import {
  formatSoftSeedingImagePrompts,
  generateSoftSeedingContent,
  getSoftSeedingInventory,
  softSeedingTopicOptions,
  type SoftSeedingImageCount,
  type SoftSeedingTopic
} from "./utils/generateSoftSeedingContent";
import { promptQualityPatchNotice } from "./data/promptPatches";
import { getCompatibleSceneOptions, isSceneCompatibleWithImageType } from "./data/teamSceneOptions";
import { TEAM_MODEL_OPTIONS } from "./data/teamModelProfiles";
import { TEAM_MODEL_CONTINUITY_OPTIONS } from "./data/modelContinuityProfiles";
import { anchorManifest, brandVisualMother, canonicalThemeSpecifications, createVisualValidationWorkspace, productTruthLock, validationCases } from "./visual-system";
import { compileImage2ThemePrompt } from "./visual-system/image2ThemeAdapter";
import comparisonPlanJson from "../visual-system/validation/comparisons/phase-3d-comparison-plan.json";
import { STUDIO_LAUNCH_PRESET_OPTIONS } from "./data/studioLaunchPresets";
import { getCompatibleStudioWardrobeOptions, STUDIO_WARDROBE_OPTIONS } from "./data/studioWardrobeLibrary";
import {
  buildNonProductAtmospherePlan,
  NON_PRODUCT_ATMOSPHERE_COUNTS,
  NON_PRODUCT_ATMOSPHERE_CONTENT_TYPE,
  type NonProductAtmosphereCount,
  type NonProductAtmospherePlan
} from "./non-product-atmosphere";

const imageTypeOptions: TeamImageType[] = [
  "产品上脚图",
  "对镜穿搭图",
  "生活场景图",
  "非产品氛围图",
  "拍摄花絮 / 材质图",
  "产品静物图"
];

const seasonOptions: TeamSeason[] = ["春", "夏", "秋", "冬"];
const garmentTypeOptions: TeamGarmentTypePreference[] = ["自动匹配", "裤装", "裙装", "短裤", "连衣裙", "轻运动"];
const studioLaunchAngleOptions: TeamStudioLaunchAnglePreference[] = [
  "自动匹配",
  "全身棚拍角度",
  "下半身1/3角度",
  "鞋子上脚特写角度",
  "3/4侧前方上脚角度"
];
const peopleImageTypes: TeamImageType[] = ["产品上脚图", "对镜穿搭图", "生活场景图"];
const softInventory = getSoftSeedingInventory();

const initialParams: TeamPromptParams = {
  imageType: "产品上脚图",
  modelChoice: "30–45岁客户画像模特",
  modelContinuity: "新人物",
  shoe: "自定义",
  customShoe: "",
  season: "春",
  scenePreference: "自动匹配",
  garmentTypePreference: "自动匹配",
  studioLaunchAnglePreference: "自动匹配",
  studioLaunchPreset: "auto",
  studioWardrobePreference: "auto",
  stillLifeStyle: "与主视觉统一",
  extraRequirement: "",
  generationNonce: 0
};

const initialGeneratedPrompt = generatePromptRuntime(initialParams).prompt;

const inputClass =
  "w-full rounded-[18px] border border-aura-beige bg-white/75 px-4 py-3 text-sm text-aura-charcoal outline-none transition focus:border-aura-clay disabled:cursor-not-allowed disabled:bg-aura-cream disabled:text-aura-muted";
const primaryButtonClass =
  "rounded-[18px] bg-aura-charcoal px-5 py-3 text-sm font-medium text-aura-porcelain shadow-sm transition hover:bg-aura-muted";
const clayButtonClass =
  "rounded-[18px] bg-aura-clay px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-aura-charcoal";
const cardClass = "rounded-[22px] bg-white/70 p-5 ring-1 ring-aura-beige/70";
const softControlPanelClass = "rounded-[24px] bg-white/65 p-4 ring-1 ring-aura-beige/70";
const softStatusPillClass =
  "rounded-full bg-aura-cream px-3 py-1 text-xs font-medium text-aura-muted ring-1 ring-aura-beige/70";
const imageToolButtonClass =
  "rounded-[16px] bg-white/80 px-4 py-2 text-xs font-medium text-aura-charcoal ring-1 ring-aura-beige/80 transition hover:bg-aura-cream disabled:cursor-not-allowed disabled:opacity-45";

type ReferenceImage = {
  id: string;
  name: string;
  size: number;
  url: string;
};

function updateField<K extends keyof TeamPromptParams>(params: TeamPromptParams, key: K, value: TeamPromptParams[K]) {
  return { ...params, [key]: value };
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

async function copyWithFallback(value: string): Promise<"clipboard" | "fallback"> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return "clipboard";
    }
  } catch {
    // Fall through to the legacy textarea path for insecure contexts and denied permissions.
  }
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Clipboard API 不可用，且降级复制失败。请展开 Prompt 后手动选择复制。");
  return "fallback";
}

const visualEvidence = [
  { id: "PT-01", name: "overall lateral product", role: "overall_structure" as const, file: "/visual-system/product-truth/PT-01-overall.jpg" },
  { id: "PT-02", name: "top front product", role: "top_front" as const, file: "/visual-system/product-truth/PT-02-top-front.jpg" },
  { id: "PT-03", name: "heel side product", role: "heel_side" as const, file: "/visual-system/product-truth/PT-03-heel-side.jpg" },
  { id: "PT-04", name: "material craft product", role: "material_craft" as const, file: "/visual-system/product-truth/PT-04-material-craft.jpg" },
  { id: "PT-05", name: "paired overall product", role: "overall_structure" as const, file: "/visual-system/product-truth/PT-05-paired-overall.jpg" },
  { id: "PT-06", name: "toe and material detail", role: "material_craft" as const, file: "/visual-system/product-truth/PT-06-toe-material.jpg" }
];
const visualValidationTasks = createVisualValidationWorkspace(visualEvidence).tasks;
const phase2DReferenceOrder: Record<string, string[]> = {
  A4: ["PT-01", "PT-02", "PT-03"],
  B1: ["PT-01", "PT-02", "PT-04"],
  B2: ["PT-01", "PT-03", "PT-04"],
  C2: ["PT-01", "PT-02", "PT-03", "PT-04"],
  C5: ["PT-02", "PT-04", "PT-06"]
};
const phase2DIds = new Set(Object.keys(phase2DReferenceOrder));

function VisualSystemWorkspace() {
  const [copyStatus, setCopyStatus] = useState("");
  const [comparisonUploads, setComparisonUploads] = useState<Record<string, { old?: string; new?: string }>>({});
  const reportCopy = async (value: string, label: string) => {
    try {
      const mode = await copyWithFallback(value);
      setCopyStatus(`${label} 已复制${mode === "fallback" ? "（兼容模式）" : ""}`);
    } catch (error) {
      setCopyStatus(error instanceof Error ? error.message : "复制失败，请展开 Prompt 后手动复制。");
    }
  };
  const groups = [
    ["A", "生活方式母体锚点", anchorManifest.anchors.filter((anchor) => anchor.group === "lifestyle")],
    ["B", "官方棚内人物锚点", anchorManifest.anchors.filter((anchor) => anchor.group === "official_studio")],
    ["C", "产品呈现与材质锚点", anchorManifest.anchors.filter((anchor) => anchor.group === "product_presentation")],
  ] as const;
  return <section className="space-y-6">
    <header className="max-w-3xl space-y-2"><p className="ui-eyebrow">INTERNAL ONLY / PRE-PHASE 3-A</p><h1 className="text-3xl font-semibold text-aura-charcoal">视觉母体验证工作台</h1><p className="text-sm leading-6 text-aura-muted">品牌母体定义画面语言，不定义当前上传产品的真实鞋型。Product Truth 只来自本次任务上传证据。</p></header>
    <section className="rounded-[24px] bg-aura-porcelain/95 p-5 ring-1 ring-aura-beige/70"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.2em] text-aura-muted">FROZEN BRAND SYSTEM v{brandVisualMother.version}</p><h2 className="text-xl font-semibold text-aura-charcoal">{brandVisualMother.core_positioning}</h2></div><span className="rounded-full bg-aura-cream px-3 py-1 text-xs">{brandVisualMother.status}</span></div><div className="mt-4 grid gap-3 sm:grid-cols-3"><div><b>年龄范围</b><p className="text-sm text-aura-muted">{brandVisualMother.audience_visual_age_range.min}—{brandVisualMother.audience_visual_age_range.max} 岁</p></div><div><b>产品导演画面</b><p className="text-sm text-aura-muted">禁止</p></div><div><b>产品事实来源</b><p className="text-sm text-aura-muted">本次上传图片</p></div></div></section>
    {groups.map(([label, title, anchors]) => <section key={label} className="rounded-[24px] bg-aura-porcelain/95 p-5 ring-1 ring-aura-beige/70"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold text-aura-charcoal">{label}｜{title}</h2><span className="text-xs text-aura-muted">{anchors.length} anchors</span></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{anchors.map((anchor) => <figure key={anchor.id} className="overflow-hidden rounded-[18px] bg-white/70 ring-1 ring-aura-beige/70"><img src={anchor.file.replace("../", "/visual-system/")} alt={`${anchor.id} visual anchor`} className="aspect-[4/5] w-full object-cover" /><figcaption className="space-y-1 p-3 text-xs"><b>{anchor.id}</b><p className="text-aura-muted">定义抽象画面语言；不定义当前产品 Product Truth。</p></figcaption></figure>)}</div></section>)}
    <section className="rounded-[24px] bg-aura-porcelain/95 p-5 ring-1 ring-aura-beige/70"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-aura-charcoal">Canonical Content Themes</h2><span className="text-xs text-aura-muted">{canonicalThemeSpecifications.length} active specifications / Image2 only</span></div><p className="mt-2 text-sm text-aura-muted">Canonical Theme Specification 先定义内容语义，再由 Image2 Adapter 编译；Product Truth 仍只来自当前任务。</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{canonicalThemeSpecifications.map((theme) => { const compiled = compileImage2ThemePrompt({ theme, currentTaskProductTruth: productTruthLock, taskContext: "Prepare one internal Phase 3 theme validation image; do not call a provider." }); return <article key={theme.theme_id} className="rounded-[16px] bg-white/70 p-4 ring-1 ring-aura-beige/70"><div className="flex items-center justify-between gap-3"><b>{theme.title_zh}</b><span className="text-[10px] text-aura-muted">{theme.theme_id} · v{theme.version}</span></div><p className="mt-2 text-xs text-aura-muted">{theme.content_purpose}</p><details className="mt-3 rounded-xl bg-aura-cream/60 p-3"><summary className="cursor-pointer text-xs font-medium">查看 Canonical Specification 与 Image2 Prompt</summary><p className="mt-3 text-xs leading-5 text-aura-charcoal">{theme.title_en} · {theme.scene_type} · {theme.validation_priority} priority</p><pre data-testid={`theme-prompt-${theme.theme_id}`} className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap text-xs leading-5 text-aura-charcoal">{compiled.prompt}</pre><p className="mt-2 text-[10px] text-aura-muted">Adapter: {compiled.adapterVersion} · Diagnostics: {compiled.diagnostics.length === 0 ? "none" : compiled.diagnostics.join(", ")}</p></details><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => reportCopy(compiled.prompt, "Theme Prompt")} aria-label={`${theme.theme_id} 复制 Theme Prompt`} className={imageToolButtonClass}>复制 Theme Prompt</button><button type="button" onClick={() => reportCopy(`Reference Plan: current task Product Truth only. Required evidence: ${theme.required_product_evidence.join(", ")}. Brand anchors provide visual language only.`, "Theme Reference Plan")} aria-label={`${theme.theme_id} 复制 Theme Reference Plan`} className={imageToolButtonClass}>复制 Theme Reference Plan</button></div></article>; })}</div></section>
    <section className="rounded-[24px] bg-aura-porcelain/95 p-5 ring-1 ring-aura-beige/70"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-aura-charcoal">Phase 3-D 新旧 Prompt 对照测试</h2><span className="text-xs text-aura-muted">{comparisonPlanJson.comparisons.length} comparisons · Image2 manual gate</span></div><p className="mt-2 text-sm text-aura-muted">同一 Product Truth、参考图顺序、比例和 Image2；只比较 Prompt。当前没有任何真实结果或自动 QA 结论。</p><div className="mt-4 space-y-3">{comparisonPlanJson.comparisons.map((comparison) => <article key={comparison.comparison_id} className="rounded-[16px] bg-white/70 p-4 ring-1 ring-aura-beige/70"><div className="flex flex-wrap items-center justify-between gap-2"><b>{comparison.comparison_id} · {comparison.role}</b><span className="text-xs text-aura-muted">{comparison.status}</span></div><p className="mt-1 text-xs text-aura-muted">上传顺序：{comparison.product_reference_order.join(" → ")} · {comparison.aspect_ratio}</p><div className="mt-3 grid gap-3 md:grid-cols-2"><div><p className="mb-1 text-xs font-medium">Old Prompt</p><pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded-lg bg-aura-cream/60 p-3 text-[11px] leading-4">{comparison.old_prompt}</pre><button type="button" onClick={() => reportCopy(comparison.old_prompt, "Old Prompt")} className={`${imageToolButtonClass} mt-2`}>复制 Old Prompt</button><label className="mt-2 block text-[11px] text-aura-muted">上传旧结果<input type="file" accept="image/*" className="mt-1 block w-full text-xs" onChange={(event) => setComparisonUploads((current) => ({ ...current, [comparison.comparison_id]: { ...current[comparison.comparison_id], old: event.target.files?.[0]?.name } }))} /></label></div><div><p className="mb-1 text-xs font-medium">New Prompt</p><pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded-lg bg-aura-cream/60 p-3 text-[11px] leading-4">{comparison.new_prompt}</pre><button type="button" onClick={() => reportCopy(comparison.new_prompt, "New Prompt")} className={`${imageToolButtonClass} mt-2`}>复制 New Prompt</button><label className="mt-2 block text-[11px] text-aura-muted">上传新结果<input type="file" accept="image/*" className="mt-1 block w-full text-xs" onChange={(event) => setComparisonUploads((current) => ({ ...current, [comparison.comparison_id]: { ...current[comparison.comparison_id], new: event.target.files?.[0]?.name } }))} /></label></div></div><p className="mt-2 text-[10px] text-aura-muted">回传：旧结果 {comparisonUploads[comparison.comparison_id]?.old ?? "未上传"} · 新结果 {comparisonUploads[comparison.comparison_id]?.new ?? "未上传"} · QA 尚未开始</p></article>)}</div></section>
    <section className="rounded-[24px] bg-aura-porcelain/95 p-5 ring-1 ring-aura-beige/70"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-aura-charcoal">A1—C5 视觉验证任务</h2><span className="text-xs text-aura-muted">{validationCases.length} cases / validation only</span></div><p className="mt-2 text-sm text-aura-muted">Product Truth confidence: High · 当前任务证据仅用于验证，不自动接入 Provider。</p><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{visualValidationTasks.map((item) => { const uploadOrder = phase2DReferenceOrder[item.id] ?? item.referencePlan; const referencePlan = `Reference Plan: ${uploadOrder.join(", ")}. Upload in this order. Use current uploaded Product Truth as the sole product source; brand anchors provide visual language only.`; const prompt = item.providerReadyPrompt; const evidenceById = new Map(visualEvidence.map((evidence) => [evidence.id, evidence])); return <article key={item.id} className="rounded-[16px] bg-white/70 p-4 ring-1 ring-aura-beige/70"><div className="flex justify-between"><b>{item.id}</b><span className="text-xs text-aura-muted">{item.recommended_ratio}</span></div><h3 className="mt-2 font-medium text-aura-charcoal">{item.role}</h3><p className="mt-2 text-xs leading-5 text-aura-muted">{item.validation_goal}</p>{phase2DIds.has(item.id) && <div className="mt-3 rounded-xl bg-aura-cream/70 p-3"><p className="text-xs font-medium text-aura-charcoal">Phase 2-D Product Truth 上传顺序</p><div className="mt-2 flex flex-wrap gap-2">{uploadOrder.map((id, index) => { const evidence = evidenceById.get(id); return <figure key={id} className="w-16"><img src={evidence?.file} alt={`${id} product reference thumbnail`} className="h-16 w-16 rounded-lg object-cover ring-1 ring-aura-beige" /><figcaption className="mt-1 text-center text-[10px] text-aura-muted">{index + 1}. {id}</figcaption></figure>; })}</div><p className="mt-2 text-[10px] leading-4 text-aura-muted">仅使用这些 Product Truth 图；不要上传品牌锚点图。</p></div>}<details className="mt-3 rounded-xl bg-aura-cream/60 p-3"><summary className="cursor-pointer text-xs font-medium">展开查看完整 Prompt</summary><pre data-testid={`prompt-${item.id}`} className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap text-xs leading-5 text-aura-charcoal">{prompt}</pre><p className="mt-3 text-xs leading-5 text-aura-muted">{referencePlan}</p></details><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => reportCopy(prompt, "Prompt")} aria-label={`${item.id} 复制完整 Prompt`} className="rounded-lg bg-aura-charcoal px-3 py-2 text-xs font-medium text-white">复制完整 Prompt</button><button type="button" onClick={() => reportCopy(referencePlan, "Reference Plan")} aria-label={`${item.id} 复制 Reference Plan`} className="rounded-lg border border-aura-beige px-3 py-2 text-xs font-medium">复制 Reference Plan</button><button type="button" onClick={() => reportCopy(`${prompt}\n\n${referencePlan}`, "Prompt + Reference Plan")} aria-label={`${item.id} 复制 Prompt 和 Reference Plan`} className="rounded-lg border border-aura-beige px-3 py-2 text-xs font-medium">复制全部</button></div></article>; })}</div>{copyStatus && <p role="status" className="mt-4 text-sm text-aura-muted">{copyStatus}</p>}</section>
  </section>;
}

function NonProductAtmosphereWorkspace({
  plan,
  quantity,
  referenceImages,
  copyStatus,
  onQuantityChange,
  onGenerate,
  onCopyPrompt,
  onUploadReferences
}: {
  plan: NonProductAtmospherePlan;
  quantity: NonProductAtmosphereCount;
  referenceImages: ReferenceImage[];
  copyStatus: string;
  onQuantityChange: (value: NonProductAtmosphereCount) => void;
  onGenerate: () => void;
  onCopyPrompt: (prompt: string, label: string) => void;
  onUploadReferences: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return <section className="space-y-6">
    <header className="max-w-3xl space-y-2">
      <p className="ui-eyebrow">CONTENT MODULE / IMAGE2 ONLY / v1</p>
      <h1 className="text-3xl font-semibold text-aura-charcoal">非产品氛围图</h1>
      <p className="text-sm leading-6 text-aura-muted">根据当前产品的颜色、材质与情绪，生成不出现产品和人物、但与产品保持视觉联系的品牌氛围图片。</p>
    </header>
    <section className="rounded-[24px] bg-aura-porcelain/95 p-5 ring-1 ring-aura-beige/70">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-lg font-semibold text-aura-charcoal">生成设置</h2><p className="mt-1 text-xs text-aura-muted">系统自动编排场景、生活痕迹、构图与 Product Echo；本模块不开放场景或风格参数。</p></div>
        <span className={softStatusPillClass}>Image2 only · {NON_PRODUCT_ATMOSPHERE_CONTENT_TYPE}</span>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className="block space-y-2"><span className="text-sm font-medium text-aura-charcoal">生成数量</span><select aria-label="非产品氛围图生成数量" className={inputClass} value={quantity} onChange={(event) => onQuantityChange(Number(event.target.value) as NonProductAtmosphereCount)}>{NON_PRODUCT_ATMOSPHERE_COUNTS.map((count) => <option key={count} value={count}>{count}张</option>)}</select></label>
        <label className="block space-y-2"><span className="text-sm font-medium text-aura-charcoal">当前产品参考图</span><span className="flex min-h-[48px] items-center rounded-[18px] bg-white/70 px-4 text-sm text-aura-muted ring-1 ring-aura-beige/70">已上传 {referenceImages.length} 张 · 仅用于视觉分析</span></label>
        <button type="button" onClick={onGenerate} className={clayButtonClass}>生成非产品氛围图</button>
      </div>
      <label className="mt-4 block rounded-[18px] border border-dashed border-aura-beige bg-white/50 px-4 py-3 text-xs text-aura-muted">复用当前产品参考图上传能力（最多9张）<input aria-label="上传非产品氛围图产品参考图" type="file" accept="image/*" multiple className="mt-2 block w-full text-xs" onChange={onUploadReferences} /></label>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">{["产品可见性：禁止", "鞋履可见性：禁止", "人物 / 穿搭 / 上脚：禁用"].map((text) => <span key={text} className="rounded-[14px] bg-aura-cream px-3 py-2 text-xs text-aura-muted">{text}</span>)}</div>
    </section>
    <section className="rounded-[24px] bg-aura-porcelain/95 p-5 ring-1 ring-aura-beige/70">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-aura-charcoal">Provider-ready Prompt 计划</h2><p className="mt-1 text-xs text-aura-muted">{plan.promptVersion} · {plan.images.length} 份 Prompt · Product Echo 只读取上传产品的视觉气质</p></div><button type="button" onClick={() => onCopyPrompt(plan.images.map((image) => `Image ${image.index}:\n${image.prompt}`).join("\n\n"), "全部非产品氛围图 Prompt")} className={imageToolButtonClass}>复制全部 Prompt</button></div>
      <div className="mt-4 space-y-3">{plan.images.map((image) => <article key={image.id} className="rounded-[18px] bg-white/70 p-4 ring-1 ring-aura-beige/70"><div className="flex flex-wrap items-center justify-between gap-2"><div><b>Image {image.index} · {image.slot.sceneLabel}</b><p className="mt-1 text-xs text-aura-muted">系统槽位：{image.slot.id} · 差异：{image.slot.differenceDimensions.join(" / ")}</p></div><button type="button" onClick={() => onCopyPrompt(image.prompt, `Image ${image.index} Prompt`)} className={imageToolButtonClass}>复制这张 Prompt</button></div><details className="mt-3 rounded-[14px] bg-aura-cream/60 p-3"><summary className="cursor-pointer text-xs font-medium">查看完整 Image2 Prompt</summary><pre data-testid={`atmosphere-prompt-${image.index}`} className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap text-xs leading-5 text-aura-charcoal">{image.prompt}</pre></details></article>)}</div>
      {copyStatus && <p role="status" className="mt-4 text-sm text-aura-muted">{copyStatus}</p>}
    </section>
  </section>;
}

function App() {
  const [activePage, setActivePage] = useState<"workbench" | "prompt" | "xiaohongshu" | "visual" | "atmosphere">("workbench");
  const [params, setParams] = useState<TeamPromptParams>(initialParams);
  const [generatedPrompt, setGeneratedPrompt] = useState(() => initialGeneratedPrompt);
  const [copyStatus, setCopyStatus] = useState("");
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [softTopic, setSoftTopic] = useState<SoftSeedingTopic>(softSeedingTopicOptions[0]);
  const [softImageCount, setSoftImageCount] = useState<SoftSeedingImageCount>(5);
  const [softGenerationNonce, setSoftGenerationNonce] = useState(0);
  const [softContent, setSoftContent] = useState(() =>
    generateSoftSeedingContent({ baseParams: initialParams, imageCount: 5, topic: softSeedingTopicOptions[0] })
  );
  const [softCopyStatus, setSoftCopyStatus] = useState("");
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const referenceImagesRef = useRef<ReferenceImage[]>([]);
  const [imageGenerationStatus, setImageGenerationStatus] = useState("");
  const [generatedImageUrl] = useState("");
  const [atmosphereQuantity, setAtmosphereQuantity] = useState<NonProductAtmosphereCount>(5);
  const [atmosphereGenerationNonce, setAtmosphereGenerationNonce] = useState(0);
  const [atmosphereCopyStatus, setAtmosphereCopyStatus] = useState("");
  const [atmospherePlan, setAtmospherePlan] = useState<NonProductAtmospherePlan>(() => buildNonProductAtmospherePlan({ quantity: 5, referenceImageCount: 0, season: initialParams.season }));

  useEffect(() => {
    referenceImagesRef.current = referenceImages;
  }, [referenceImages]);

  useEffect(() => {
    return () => {
      referenceImagesRef.current.forEach((image) => URL.revokeObjectURL(image.url));
    };
  }, []);

  const sceneOptions = getCompatibleSceneOptions(params.imageType);
  const showsModelChoice = peopleImageTypes.includes(params.imageType);

  const updateParams = (updater: (current: TeamPromptParams) => TeamPromptParams) => {
    setParams((current) => updater(current));
    setHasPendingChanges(true);
    setCopyStatus("");
    setSoftCopyStatus("");
  };

  const handleGenerate = () => {
    const nextParams = { ...params, generationNonce: params.generationNonce + 1 };
    setParams(nextParams);
    setGeneratedPrompt(generatePromptRuntime(nextParams).prompt);
    setCopyStatus("");
    setHasPendingChanges(false);
  };

  const syncPromptParams = () => {
    if (!hasPendingChanges) return params;
    const syncedParams = { ...params, generationNonce: params.generationNonce + 1 };
    setParams(syncedParams);
    setGeneratedPrompt(generatePromptRuntime(syncedParams).prompt);
    setHasPendingChanges(false);
    return syncedParams;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedPrompt);
    setCopyStatus("已复制提示词。");
  };

  const handleGenerateSoftContent = () => {
    const syncedParams = syncPromptParams();
    const nextSoftGenerationNonce = softGenerationNonce + 1;
    setSoftGenerationNonce(nextSoftGenerationNonce);
    const nextContent = generateSoftSeedingContent({
      baseParams: syncedParams,
      imageCount: softImageCount,
      topic: softTopic,
      variantOffset: nextSoftGenerationNonce
    });
    setSoftContent(nextContent);
    setSoftCopyStatus("");
  };

  const handleCopySoftContent = async () => {
    await navigator.clipboard.writeText(formatSoftSeedingImagePrompts(softContent));
    setSoftCopyStatus("已复制全部生图 Prompt。");
  };

  const handleCopyImagePrompt = async (prompt: string, name: string) => {
    await navigator.clipboard.writeText(prompt);
    setSoftCopyStatus(`已复制 ${name} 的 Image 2.0 提示词。`);
  };

  const handleGenerateAtmosphere = () => {
    const nextNonce = atmosphereGenerationNonce + 1;
    setAtmosphereGenerationNonce(nextNonce);
    setAtmospherePlan(buildNonProductAtmospherePlan({ quantity: atmosphereQuantity, generationNonce: nextNonce, referenceImageCount: referenceImages.length, season: params.season }));
    setAtmosphereCopyStatus("");
  };

  const handleCopyAtmospherePrompt = async (prompt: string, label: string) => {
    try {
      const mode = await copyWithFallback(prompt);
      setAtmosphereCopyStatus(`${label} 已复制${mode === "fallback" ? "（兼容模式）" : ""}`);
    } catch (error) {
      setAtmosphereCopyStatus(error instanceof Error ? error.message : "复制失败，请展开 Prompt 后手动复制。");
    }
  };

  const handleReferenceImagesUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const availableSlots = Math.max(0, 9 - referenceImages.length);
    const selectedFiles = files.slice(0, availableSlots);
    const skippedCount = files.length - selectedFiles.length;

    const nextImages = selectedFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file)
    }));

    setReferenceImages((current) => [...current, ...nextImages]);
    setImageGenerationStatus(
      skippedCount > 0
        ? `已添加 ${nextImages.length} 张参考图，最多保留 9 张。`
        : `已添加 ${nextImages.length} 张参考图。`
    );
    event.target.value = "";
  };

  const handleRemoveReferenceImage = (id: string) => {
    setReferenceImages((current) => {
      const imageToRemove = current.find((image) => image.id === id);
      if (imageToRemove) URL.revokeObjectURL(imageToRemove.url);
      return current.filter((image) => image.id !== id);
    });
    setImageGenerationStatus("");
  };

  const handleGenerateImagePlaceholder = () => {
    if (referenceImages.length === 0) {
      setImageGenerationStatus("请先上传 1–9 张鞋子参考图，再点击生成图片。");
      return;
    }

    setImageGenerationStatus(
      `已准备好 ${referenceImages.length} 张参考图和当前英文提示词。图片生成接口尚未接入，后续会在这里显示生成结果。`
    );
  };

  const handleDownloadGeneratedImage = () => {
    if (!generatedImageUrl) {
      setImageGenerationStatus("暂无可下载图片。接入图片生成模型后，生成结果会在这里下载。");
    }
  };

  const imageGenerationPanel = (
    <section className="mb-5 rounded-[22px] bg-white/65 p-5 ring-1 ring-aura-beige/70">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-aura-charcoal">图片生成预留区</h3>
          <p className="mt-2 text-sm leading-6 text-aura-muted">
            可先上传 1–9 张鞋子参考图。当前只做本地预览，后期接入图片生成模型后会用这些图片和当前提示词生成结果。
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-aura-cream px-3 py-1 text-xs font-medium text-aura-muted ring-1 ring-aura-beige/70">
          {referenceImages.length}/9
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <label className={imageToolButtonClass}>
          上传参考图
          <input
            className="sr-only"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={handleReferenceImagesUpload}
          />
        </label>
        <button type="button" onClick={handleGenerateImagePlaceholder} className={primaryButtonClass}>
          生成图片
        </button>
        {generatedImageUrl ? (
          <a href={generatedImageUrl} download="theruiz-aura-generated-image.png" className={imageToolButtonClass}>
            下载图片
          </a>
        ) : (
          <button type="button" onClick={handleDownloadGeneratedImage} className={imageToolButtonClass}>
            下载图片
          </button>
        )}
      </div>

      {referenceImages.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {referenceImages.map((image) => (
            <div key={image.id} className="overflow-hidden rounded-[18px] bg-aura-cream ring-1 ring-aura-beige/70">
              <img src={image.url} alt={image.name} className="aspect-square w-full object-cover" />
              <div className="space-y-2 p-3">
                <p className="truncate text-xs font-medium text-aura-charcoal">{image.name}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-aura-muted">{formatFileSize(image.size)}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveReferenceImage(image.id)}
                    className="text-xs font-medium text-aura-muted underline decoration-aura-beige underline-offset-4 transition hover:text-aura-charcoal"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 rounded-[18px] bg-aura-cream px-4 py-3 text-sm leading-6 text-aura-muted ring-1 ring-aura-beige/70">
        {imageGenerationStatus || "接口未接入前不会向外发送图片。接入后建议通过本地后端保存 API Key，再返回生成图片用于下载。"}
      </div>
    </section>
  );

  const dashboard = (
    <div className="ui-dashboard-grid">
      <section className="ui-hero-card">
        <div><p className="ui-eyebrow">THERUIZ AURA / BRAND CONTENT PLATFORM</p><h1>Founder<br /><em>Workbench</em></h1><p>集中管理品牌内容生产的全流程，让每一次表达都精准有力。</p></div>
        <div className="ui-hero-art" aria-hidden="true"><span>CLARITY<br />CREATES<br />CONFIDENCE.</span></div>
      </section>
      <section><div className="ui-section-heading"><h2>今日重点任务</h2><span>2026—07—26</span></div><div className="ui-task-grid">
        {[['完善 Prompt 提示词','优化产品与场景的提示词，提升输出一致性。','继续编辑','prompt'],['生成小红书内容','生成一组生活场景软种草内容。','去生成','xiaohongshu'],['图像生成与筛选','为新品训练生成场景图并筛选最佳画面。','即将开放','prompt'],['结果质检','检查近期生成内容质量与合规性。','查看结果','prompt']].map(([title,desc,cta,page]) => <button key={title} className="ui-task-card" onClick={() => setActivePage(page as "prompt" | "xiaohongshu")}><span className="ui-status">{cta === '即将开放' ? '待开始' : '进行中'}</span><h3>{title}</h3><p>{desc}</p><strong>{cta} →</strong></button>)}
      </div></section>
      <section className="ui-dashboard-columns"><div className="ui-preview-card"><div className="ui-section-heading"><h2>Prompt 构建器</h2><button onClick={() => setActivePage('prompt')}>继续编辑 →</button></div><dl><dt>当前配置</dt><dd>{params.modelChoice} · {params.season} · {params.garmentTypePreference}</dd><dt>场景</dt><dd>{params.scenePreference}</dd><dt>Prompt 片段</dt><dd>{generatedPrompt.slice(0, 180)}…</dd></dl></div><div className="ui-preview-card"><div className="ui-section-heading"><h2>小红书内容</h2><button onClick={() => setActivePage('xiaohongshu')}>继续生成 →</button></div><div className="ui-story-strip">{softContent.images.slice(0, 5).map((image) => <div key={image.name} className="ui-story-tile"><span>{image.params.scenePreference}</span></div>)}</div><p>{softContent.topic} · {softContent.images.length} 张</p></div></section>
      <section className="ui-activity-card"><div className="ui-section-heading"><h2>快速操作</h2><span>本地工作区</span></div><div className="ui-quick-actions"><button onClick={() => setActivePage('prompt')}>＋ 新建 Prompt</button><button onClick={() => setActivePage('xiaohongshu')}>▣ 生成小红书内容</button><button onClick={() => setActivePage('prompt')}>▧ 上传参考图</button><button>✓ 结果质检</button></div></section>
    </div>
  );

  return (
    <main className="ui-app-shell">
      <aside className="ui-sidebar"><div className="ui-brand">THERUIZ AURA<small>BRAND CONTENT PLATFORM</small></div><nav aria-label="平台导航">
        <button className={activePage === 'workbench' ? 'active' : ''} onClick={() => setActivePage('workbench')}>⌂ <span>工作台<small>Workbench</small></span></button>
        <p>内容生产</p><button className={activePage === 'prompt' ? 'active' : ''} onClick={() => setActivePage('prompt')}>◌ <span>Prompt 构建器<small>Prompt Builder</small></span></button><button className={activePage === 'xiaohongshu' ? 'active' : ''} onClick={() => setActivePage('xiaohongshu')}>▧ <span>小红书内容<small>Xiaohongshu Content</small></span></button><button className={activePage === 'atmosphere' ? 'active' : ''} onClick={() => setActivePage('atmosphere')}>◌ <span>非产品氛围图<small>Non-Product Atmosphere</small></span></button><button onClick={() => setImageGenerationStatus('图片生成 API 尚未接入。')}>▣ <span>图片生成<small>Image Generation</small></span></button>
        <p>品牌基础</p><button onClick={() => setActivePage('visual')}>◈ <span>视觉母体验证<small>Visual System QA</small></span></button><button onClick={() => setImageGenerationStatus('资产库将在后续阶段接入。')}>◇ <span>资产库<small>Asset Library</small></span></button>
      </nav><div className="ui-sidebar-foot">团队空间<br /><strong>THERUIZ AURA 团队</strong></div></aside>
      <div className="ui-main"><header className="ui-topbar"><div className="ui-project">项目 / <strong>THERUIZ AURA 主项目</strong>⌄</div><div className="ui-top-actions"><span>◉ 9,842 积分</span><input aria-label="搜索" placeholder="搜索内容、Prompt、素材…" /><span>♧</span><b>TA</b><span>Theruiz Team⌄</span></div></header><div className="ui-content">
        {activePage === 'workbench' ? dashboard : activePage === 'visual' ? <VisualSystemWorkspace /> : activePage === 'atmosphere' ? <NonProductAtmosphereWorkspace plan={atmospherePlan} quantity={atmosphereQuantity} referenceImages={referenceImages} copyStatus={atmosphereCopyStatus} onQuantityChange={setAtmosphereQuantity} onGenerate={handleGenerateAtmosphere} onCopyPrompt={handleCopyAtmospherePrompt} onUploadReferences={handleReferenceImagesUpload} /> : <>
        <header className="max-w-3xl space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-aura-muted">Standard accurate team mode</p>
          <h1 className="text-3xl font-semibold tracking-tight text-aura-charcoal sm:text-4xl">
            THERUIZ AURA Prompt Builder
          </h1>
          <p className="text-base leading-7 text-aura-muted">
            团队日常使用的极简 Standard 英文提示词工具。后台自动匹配真实城市街景、相机质感、多样穿搭和鞋型保护。
          </p>
        </header>

        {activePage === 'prompt' && <section className="ui-generation-grid grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)_280px]">
          <div className="rounded-[28px] bg-aura-porcelain/95 p-6 shadow-aura ring-1 ring-aura-beige/70">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-aura-charcoal">输入</h2>
              <p className="mt-2 text-sm leading-6 text-aura-muted">
                3 秒选择，10 秒复制。默认入口只保留高频参数，场景放进高级选项。
              </p>
            </div>

            <div className="space-y-5">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-aura-charcoal">图片类型</span>
                <select
                  className={inputClass}
                  value={params.imageType}
                  onChange={(event) => {
                    const imageType = event.target.value as TeamImageType;
                    updateParams((current) => ({
                      ...current,
                      imageType,
                      scenePreference: isSceneCompatibleWithImageType(imageType, current.scenePreference)
                        ? current.scenePreference
                        : "自动匹配",
                      studioLaunchAnglePreference:
                        peopleImageTypes.includes(imageType) && current.scenePreference === "棚内上新拍摄"
                          ? current.studioLaunchAnglePreference
                          : "自动匹配"
                          ,
                      studioLaunchPreset:
                        current.scenePreference === "棚内上新拍摄" && peopleImageTypes.includes(imageType)
                          ? current.studioLaunchPreset
                          : "auto",
                      studioWardrobePreference:
                        current.scenePreference === "棚内上新拍摄" && peopleImageTypes.includes(imageType)
                          ? current.studioWardrobePreference
                          : "auto",
                    }));
                  }}
                >
                  {imageTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              {showsModelChoice && (
                <>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-aura-charcoal">人物选择</span>
                    <select
                      className={inputClass}
                      value={params.modelChoice}
                      onChange={(event) =>
                        updateParams((current) => updateField(current, "modelChoice", event.target.value as TeamModelChoice))
                      }
                    >
                      {TEAM_MODEL_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <span className="block text-xs leading-5 text-aura-muted">
                      仅人物类图片启用；静物、材质与非产品氛围图不会加入模特描述。
                    </span>
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-aura-charcoal">人物连续性</span>
                    <select
                      className={inputClass}
                      value={params.modelContinuity}
                      onChange={(event) =>
                        updateParams((current) =>
                          updateField(current, "modelContinuity", event.target.value as TeamModelContinuity)
                        )
                      }
                    >
                      {TEAM_MODEL_CONTINUITY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <span className="block text-xs leading-5 text-aura-muted">
                      如需延续上一组人物，请在生图工具中同时上传上一组满意的人物图作为人物参考图。
                    </span>
                  </label>
                </>
              )}

              {params.imageType === "非产品氛围图" && (
                <p className="rounded-[18px] bg-aura-cream px-4 py-3 text-sm leading-6 text-aura-muted ring-1 ring-aura-beige/70">
                  非产品氛围图不强制生成鞋子。材质工作台、拍摄花絮、品牌生活方式氛围，都可直接写进补充要求。
                </p>
              )}

              <label className="block space-y-2">
                <span className="text-sm font-medium text-aura-charcoal">季节</span>
                <select
                  className={inputClass}
                  value={params.season}
                  onChange={(event) => updateParams((current) => updateField(current, "season", event.target.value as TeamSeason))}
                >
                  {seasonOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-aura-charcoal">服装类型</span>
                <select
                  className={inputClass}
                  value={params.garmentTypePreference}
                  onChange={(event) =>
                    updateParams((current) =>
                      updateField(current, "garmentTypePreference", event.target.value as TeamGarmentTypePreference)
                    )
                  }
                >
                  {garmentTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <details className="rounded-[20px] bg-white/55 px-4 py-3 ring-1 ring-aura-beige/70">
                <summary className="cursor-pointer text-sm font-medium text-aura-charcoal">高级选项：手动指定场景</summary>
                <label className="mt-4 block space-y-2">
                  <span className="text-sm font-medium text-aura-charcoal">场景偏好</span>
                  <select
                    className={inputClass}
                    value={params.scenePreference}
                    onChange={(event) =>
                      updateParams((current) =>
                        updateField(
                        {
                          ...current,
                          studioLaunchAnglePreference:
                            event.target.value === "棚内上新拍摄" ? current.studioLaunchAnglePreference : "自动匹配",
                          studioLaunchPreset:
                            event.target.value === "棚内上新拍摄" ? current.studioLaunchPreset : "auto",
                          studioWardrobePreference:
                            event.target.value === "棚内上新拍摄" ? current.studioWardrobePreference : "auto",
                        },
                          "scenePreference",
                          event.target.value as TeamScenePreference
                        )
                      )
                    }
                  >
                    {sceneOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <span className="block text-xs leading-5 text-aura-muted">
                    当前仅显示适合“{params.imageType}”的场景；切换图片类型时，不兼容的旧场景会自动恢复为“自动匹配”。
                  </span>
                </label>

                {params.scenePreference === "棚内上新拍摄" && showsModelChoice && (
                  <label className="mt-4 block space-y-2">
                    <span className="text-sm font-medium text-aura-charcoal">棚拍背景预设</span>
                    <select
                      className={inputClass}
                      value={params.studioLaunchPreset}
                      onChange={(event) =>
                        updateParams((current) =>
                          updateField(current, "studioLaunchPreset", event.target.value as TeamStudioLaunchPreset)
                        )
                      }
                    >
                      {STUDIO_LAUNCH_PRESET_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <span className="block text-xs leading-5 text-aura-muted">
                      控制棚内背景、空间结构和灯光方式。人物角度在下方单独选择。
                    </span>
                  </label>
                )}

                {params.scenePreference === "棚内上新拍摄" && showsModelChoice && (
                  <label className="mt-4 block space-y-2">
                    <span className="text-sm font-medium text-aura-charcoal">棚拍服装单品</span>
                    <select
                      className={inputClass}
                      value={params.studioWardrobePreference}
                      onChange={(event) =>
                        updateParams((current) =>
                          updateField(current, "studioWardrobePreference", event.target.value as TeamStudioWardrobePreference)
                        )
                      }
                    >
                      {STUDIO_WARDROBE_OPTIONS.filter(
                        (o) =>
                          o.value === "auto" ||
                          getCompatibleStudioWardrobeOptions({
                            garmentTypePreference: params.garmentTypePreference,
                            season: params.season
                          }).includes(o.value)
                      ).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <span className="block text-xs leading-5 text-aura-muted">
                      按当前服装类型和季节筛选。选择"自动匹配"由系统根据季节、鞋款和背景自动搭配。
                    </span>
                  </label>
                )}

                {params.scenePreference === "棚内上新拍摄" && showsModelChoice && (
                  <label className="mt-4 block space-y-2">
                    <span className="text-sm font-medium text-aura-charcoal">棚内拍摄角度</span>
                    <select
                      className={inputClass}
                      value={params.studioLaunchAnglePreference}
                      onChange={(event) =>
                        updateParams((current) =>
                          updateField(current, "studioLaunchAnglePreference", event.target.value as TeamStudioLaunchAnglePreference)
                        )
                      }
                    >
                      {studioLaunchAngleOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <span className="block text-xs leading-5 text-aura-muted">
                      只影响棚内人物类图片。光线、背景、低饱和服装和道具克制规则保持不变。
                    </span>
                  </label>
                )}
              </details>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-aura-charcoal">补充要求</span>
                <textarea
                  className={`${inputClass} min-h-28`}
                  value={params.extraRequirement}
                  onChange={(event) => updateParams((current) => updateField(current, "extraRequirement", event.target.value))}
                  placeholder="例如：Use a soft cream cardigan and cropped straight-leg denim."
                />
                <span className="block text-xs leading-5 text-aura-muted">
                  建议用英文填写补充要求，以便最终提示词保持英文。如果填写中文，系统会原样保留，不会自动删除。
                </span>
              </label>

              {hasPendingChanges && (
                <p className="rounded-[16px] bg-aura-cream px-4 py-3 text-sm leading-6 text-aura-muted ring-1 ring-aura-beige/70">
                  参数已更改，请点击“生成提示词”刷新右侧结果，或直接生成小红书内容自动同步。
                </p>
              )}

              <button type="button" onClick={handleGenerate} className={`w-full ${primaryButtonClass}`}>
                {hasPendingChanges ? "重新生成提示词" : "生成提示词"}
              </button>
            </div>
          </div>

          <aside className="rounded-[28px] bg-aura-porcelain/95 p-6 shadow-aura ring-1 ring-aura-beige/70">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-aura-charcoal">最终英文提示词</h2>
                <p className="mt-2 text-sm leading-6 text-aura-muted">Standard 版本，可直接复制使用。</p>
              </div>
              <button type="button" onClick={handleCopy} className={clayButtonClass}>
                一键复制
              </button>
            </div>

            {imageGenerationPanel}

            <div data-testid="generated-prompt" className="aura-scrollbar min-h-[430px] whitespace-pre-wrap rounded-[22px] border border-aura-beige bg-white/75 p-5 text-sm leading-7 text-aura-charcoal shadow-inner lg:max-h-[610px] lg:overflow-y-auto">
              {generatedPrompt}
            </div>

            {copyStatus && <p className="mt-3 text-sm text-aura-muted">{copyStatus}</p>}

            <p className="mt-5 rounded-[18px] bg-white/65 px-4 py-3 text-sm leading-6 text-aura-muted ring-1 ring-aura-beige/70">
              {promptQualityPatchNotice}
            </p>

            <p className="mt-5 rounded-[18px] bg-aura-cream px-4 py-3 text-sm leading-6 text-aura-muted ring-1 ring-aura-beige/70">
              生成产品上脚图、对镜穿搭图、生活场景图、产品静物图时，请务必上传对应鞋款参考图，否则 AI 容易改变鞋型与颜色。
            </p>
          </aside>
          <aside className="ui-queue-card"><p className="ui-eyebrow">GENERATION QUEUE</p><h2>任务队列</h2><div className="ui-queue-empty"><span>○</span><strong>API 尚未接入</strong><p>当前保留本地参考图预览、Prompt 复制和下载入口。</p></div><div className="ui-queue-summary"><span>状态</span><b>idle</b></div></aside>
        </section>}

        {activePage === 'xiaohongshu' && <section className="rounded-[28px] bg-aura-porcelain/95 p-6 shadow-aura ring-1 ring-aura-beige/70">
          <div className="mb-6 space-y-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.28em] text-aura-muted">
                  yearly soft seeding copy + prompt plans
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-aura-charcoal">每日小红书内容</h2>
                <p className="mt-2 text-sm leading-6 text-aura-muted">
                  选择一个内容主题，自动生成标题、正文、标签和配图提示词。当前组合池共 {softInventory.total.toLocaleString()} 条，点击生成会切换内容主线和配图顺序。
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={softStatusPillClass}>{softContent.dateKey}</span>
                <span className={softStatusPillClass}>{softContent.topic}</span>
                <span className={softStatusPillClass}>{softContent.variantLabel}</span>
              </div>
            </div>

            <div className={softControlPanelClass}>
              <div className="grid gap-4 md:grid-cols-[1.2fr_0.7fr] xl:grid-cols-[1.2fr_0.7fr_auto] xl:items-end">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-aura-charcoal">内容主题</span>
                  <select
                    className={inputClass}
                    value={softTopic}
                    onChange={(event) => {
                      const nextTopic = event.target.value as SoftSeedingTopic;
                      setSoftTopic(nextTopic);
                      if (nextTopic !== "棚内上新拍摄" && softImageCount === 8) {
                        setSoftImageCount(5);
                      }
                      setSoftCopyStatus("");
                    }}
                  >
                    {softSeedingTopicOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-aura-charcoal">配图数量</span>
                  <select
                    className={inputClass}
                    value={softImageCount}
                    onChange={(event) => {
                      setSoftImageCount(Number(event.target.value) as SoftSeedingImageCount);
                      setSoftCopyStatus("");
                    }}
                  >
                    <option value={3}>3 张</option>
                    <option value={5}>5 张</option>
                    <option value={8}>8 张</option>
                  </select>
                </label>

                <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[220px] xl:grid-cols-1">
                  <button type="button" onClick={handleGenerateSoftContent} className={primaryButtonClass}>
                    生成小红书内容
                  </button>
                  <button type="button" onClick={handleCopySoftContent} className={clayButtonClass}>
                    复制全部生图 Prompt
                  </button>
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-aura-muted">
                每次生成会围绕当前主题重新选择内容主线，并让标题、正文和配图 Prompt 保持一致。
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-5">
              <div className={cardClass}>
                <h3 className="text-base font-semibold text-aura-charcoal">标题 3 个</h3>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-aura-charcoal">
                  {softContent.titles.map((title) => (
                    <li key={title}>{title}</li>
                  ))}
                </ol>
              </div>

              <div className={cardClass}>
                <h3 className="text-base font-semibold text-aura-charcoal">正文</h3>
                <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-aura-charcoal">{softContent.body}</div>
              </div>

              <div className={cardClass}>
                <h3 className="text-base font-semibold text-aura-charcoal">标签</h3>
                <p className="mt-3 text-sm leading-7 text-aura-charcoal">{softContent.tags.join(" ")}</p>
              </div>

              <p className="rounded-[18px] bg-aura-cream px-4 py-3 text-sm leading-6 text-aura-muted ring-1 ring-aura-beige/70">
                {softContent.note}
              </p>
            </div>

            <div className="space-y-5">
              <div className={cardClass}>
                <h3 className="text-base font-semibold text-aura-charcoal">配图卡片</h3>
                <p className="mt-2 text-sm leading-6 text-aura-muted">
                  每张卡片都单独调用 generateTeamPrompt，并继承当前鞋款与季节。人物连续性从第二张开始默认延续上一组人物。
                </p>
              </div>

              {softContent.images.map((image) => (
                <article key={image.name} className="rounded-[22px] bg-white/70 p-5 ring-1 ring-aura-beige/70">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-aura-charcoal">{image.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-aura-muted">{image.purpose}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyImagePrompt(image.prompt, image.name)}
                      className="shrink-0 rounded-[16px] bg-aura-clay px-4 py-2 text-xs font-medium text-white transition hover:bg-aura-charcoal"
                    >
                      复制这张 Prompt
                    </button>
                  </div>

                  <p className="mt-4 rounded-[18px] bg-aura-cream px-4 py-3 text-sm leading-6 text-aura-charcoal ring-1 ring-aura-beige/70">
                    {image.description}
                  </p>

                  <div data-testid={`provenance-${softContent.images.indexOf(image)}`} className="mt-3 rounded-[18px] bg-aura-cream/70 px-4 py-3 text-xs leading-5 text-aura-muted">
                    <div>Topic：{image.provenanceDisplay.topicLabelZh}</div>
                    <div>场景：{image.provenanceDisplay.sceneLabelZh}</div>
                    <div>图片类型：{image.provenanceDisplay.imageTypeLabelZh}</div>
                    <div>图片序列：{image.provenanceDisplay.sequenceLabelZh}</div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs leading-5 text-aura-muted">
                    <span className={softStatusPillClass}>{image.params.imageType}</span>
                    <span className={softStatusPillClass}>{image.params.scenePreference}</span>
                    <span className={softStatusPillClass}>{image.params.season}</span>
                    <span className={softStatusPillClass}>{image.params.garmentTypePreference}</span>
                    <span className={softStatusPillClass}>
                      上传参考鞋款
                    </span>
                    <span className={softStatusPillClass}>{image.params.modelContinuity}</span>
                  </div>

                  <details className="mt-4 rounded-[18px] bg-white/75 p-4 ring-1 ring-aura-beige/70">
                    <summary className="cursor-pointer text-sm font-medium text-aura-charcoal">
                      查看完整 Image 2.0 提示词
                    </summary>
                    <div className="aura-scrollbar mt-4 max-h-[360px] whitespace-pre-wrap text-sm leading-7 text-aura-charcoal lg:overflow-y-auto">
                      <span data-testid={`soft-prompt-${softContent.images.indexOf(image)}`}>{image.prompt}</span>
                    </div>
                  </details>
                </article>
              ))}

              {softCopyStatus && <p className="text-sm text-aura-muted">{softCopyStatus}</p>}
            </div>
          </div>
        </section>}
        </>}
      </div></div>
    </main>
  );
}

export default App;
