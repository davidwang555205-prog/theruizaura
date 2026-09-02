import { useMemo, useState, type ChangeEvent } from "react";
import { fmcgCategoryLabels, fmcgTopicLabels } from "./catalog";
import { compileFmcgPromptSet, formatFmcgPromptSet } from "./compileFmcgPrompt";
import { compileFmcgVideoScript, type FmcgVideoDuration } from "./compileFmcgVideoScript";
import { bindFmcgProductTruth, fmcgReferenceRoleLabels, getFmcgReferenceRoles } from "./referenceBinding";
import type { FmcgCategory, FmcgImageCount, FmcgReferenceAsset, FmcgReferenceRole, FmcgSeason, FmcgTopicId } from "./types";

const inputClass = "w-full rounded-[18px] border border-aura-beige bg-white/75 px-4 py-3 text-sm text-aura-charcoal outline-none transition focus:border-aura-clay";
const buttonClass = "rounded-[18px] bg-aura-charcoal px-5 py-3 text-sm font-medium text-aura-porcelain shadow-sm transition hover:bg-aura-muted";
const copyClass = "rounded-[16px] bg-aura-clay px-4 py-2 text-xs font-medium text-white transition hover:bg-aura-charcoal";

async function copyText(value: string) {
  await navigator.clipboard.writeText(value);
}

export function FmcgWorkspace() {
  const [category, setCategory] = useState<FmcgCategory>("beauty_skincare");
  const [topicId, setTopicId] = useState<FmcgTopicId>("lifestyle_soft_seeding");
  const [imageCount, setImageCount] = useState<FmcgImageCount>(3);
  const [season, setSeason] = useState<FmcgSeason>("秋");
  const [productName, setProductName] = useState("");
  const [confirmedProductDescription, setConfirmedProductDescription] = useState("");
  const [confirmedClaims, setConfirmedClaims] = useState("");
  const [brandVisual, setBrandVisual] = useState("Quiet, warm, restrained, tactile, realistic, and commercially usable.");
  const [extraRequirement, setExtraRequirement] = useState("");
  const [assets, setAssets] = useState<FmcgReferenceAsset[]>([]);
  const [nonce, setNonce] = useState(0);
  const [duration, setDuration] = useState<FmcgVideoDuration>(10);
  const [status, setStatus] = useState("");
  const availableReferenceRoles = useMemo(() => getFmcgReferenceRoles(category), [category]);

  const binding = useMemo(() => bindFmcgProductTruth(category, assets), [category, assets]);
  const input = useMemo(() => ({
    fmcgCategory: category, topicId, imageCount, season, productName, confirmedProductDescription,
    confirmedClaims, brandVisual, extraRequirement, generationNonce: nonce,
    productTruth: binding.productTruth, referencePlan: binding.referencePlan,
  }), [category, topicId, imageCount, season, productName, confirmedProductDescription, confirmedClaims, brandVisual, extraRequirement, nonce, binding]);
  const compiled = useMemo(() => compileFmcgPromptSet(input), [input]);
  const allPrompts = useMemo(() => formatFmcgPromptSet(compiled), [compiled]);
  const videoScript = useMemo(() => compileFmcgVideoScript(input, compiled, duration), [input, compiled, duration]);

  const upload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).slice(0, 12);
    setAssets(files.map((file, index) => ({ id: crypto.randomUUID(), name: file.name, originalUploadIndex: index, role: "unclassified", confirmedByUser: false })));
    setStatus(files.length ? "图片已加入当前 FMCG 任务，请逐张确认参考用途。" : "");
    event.target.value = "";
  };

  const setRole = (id: string, role: FmcgReferenceRole) => {
    setAssets((current) => current.map((asset) => asset.id === id ? { ...asset, role, confirmedByUser: role !== "unclassified" } : asset));
    setStatus("参考用途已更新；Reference Plan 尚未发送给任何 Provider。");
  };

  const copy = async (value: string, label: string) => {
    await copyText(value);
    setStatus(`已复制${label}。仍需在外部工具手动上传参考图并执行。`);
  };

  return <section className="space-y-6">
    <header className="max-w-3xl space-y-3">
      <p className="text-xs uppercase tracking-[0.28em] text-aura-muted">CONSUMER PRODUCT / ISOLATED CATEGORY RUNTIME</p>
      <h1 className="text-3xl font-semibold text-aura-charcoal">消费品 Prompt Builder</h1>
      <p className="text-sm leading-6 text-aura-muted">独立快消品与家居饮具 Product Truth、Reference Plan、图片 Prompt 与 Seedance 2.5 脚本。不会调用鞋履 Prompt、鞋履参考角色或上脚保护规则。</p>
    </header>

    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <div className="space-y-5 rounded-[28px] bg-aura-porcelain/95 p-6 shadow-aura ring-1 ring-aura-beige/70">
        <label className="block space-y-2"><span className="text-sm font-medium">产品子品类</span><select className={inputClass} value={category} onChange={(event) => { setCategory(event.target.value as FmcgCategory); setAssets([]); }}>
          {Object.entries(fmcgCategoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select></label>
        <label className="block space-y-2"><span className="text-sm font-medium">内容主题</span><select className={inputClass} value={topicId} onChange={(event) => setTopicId(event.target.value as FmcgTopicId)}>
          {Object.entries(fmcgTopicLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-2"><span className="text-sm font-medium">图片数量</span><select className={inputClass} value={imageCount} onChange={(event) => setImageCount(Number(event.target.value) as FmcgImageCount)}>{[1,3,5,8].map((count) => <option key={count} value={count}>{count} 张</option>)}</select></label>
          <label className="block space-y-2"><span className="text-sm font-medium">季节</span><select className={inputClass} value={season} onChange={(event) => setSeason(event.target.value as FmcgSeason)}>{["春","夏","秋","冬"].map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        <label className="block space-y-2"><span className="text-sm font-medium">产品名称（用户确认）</span><input className={inputClass} value={productName} onChange={(event) => setProductName(event.target.value)} /></label>
        <label className="block space-y-2"><span className="text-sm font-medium">产品外观说明（用户确认）</span><textarea className={`${inputClass} min-h-24`} value={confirmedProductDescription} onChange={(event) => setConfirmedProductDescription(event.target.value)} /></label>
        <label className="block space-y-2"><span className="text-sm font-medium">允许使用的产品声明（用户确认）</span><textarea className={`${inputClass} min-h-20`} value={confirmedClaims} onChange={(event) => setConfirmedClaims(event.target.value)} /></label>
        <label className="block space-y-2"><span className="text-sm font-medium">Brand Visual</span><textarea className={`${inputClass} min-h-20`} value={brandVisual} onChange={(event) => setBrandVisual(event.target.value)} /></label>
        <label className="block space-y-2"><span className="text-sm font-medium">补充要求</span><textarea className={`${inputClass} min-h-20`} value={extraRequirement} onChange={(event) => setExtraRequirement(event.target.value)} /></label>
        <button type="button" className={buttonClass} onClick={() => { setNonce((value) => value + 1); setStatus("已重新编排快消品主题卡片。当前仍为 Manual / Draft。"); }}>重新组合</button>
      </div>

      <div className="space-y-5">
        <section className="rounded-[24px] bg-white/70 p-5 ring-1 ring-aura-beige/70">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">产品参考图</h2><p className="mt-1 text-xs text-aura-muted">上传顺序与建议 Reference Plan 顺序分别保存。</p></div><label className={copyClass}>上传参考图<input type="file" accept="image/*" multiple className="hidden" onChange={upload} /></label></div>
          <div className="mt-4 space-y-3">{assets.map((asset) => <div key={asset.id} className="grid gap-2 rounded-[16px] bg-aura-cream/70 p-3 sm:grid-cols-[1fr_220px]"><div><b className="text-sm">#{asset.originalUploadIndex + 1} {asset.name}</b><p className="text-xs text-aura-muted">{asset.confirmedByUser ? "用途已确认" : "等待确认"}</p></div><select aria-label={`${asset.name} 产品参考角色`} className={inputClass} value={asset.role} onChange={(event) => setRole(asset.id, event.target.value as FmcgReferenceRole)}>{availableReferenceRoles.map((value) => <option key={value} value={value}>{fmcgReferenceRoleLabels[value]}</option>)}</select></div>)}</div>
          <div className="mt-4 rounded-[16px] bg-aura-cream p-4 text-xs leading-5 text-aura-muted"><b className="text-aura-charcoal">外部 Image2 建议顺序：</b> {binding.referencePlan.order.length ? binding.referencePlan.orderedAssets.map((item, index) => `${index + 1}. ${assets.find((asset) => asset.id === item.assetId)?.name ?? "reference"}`).join(" → ") : "尚未形成"}<br />覆盖 {binding.productTruth.coverage.length} 项；structuredFactsExtracted=false；providerExecutionReady=false；productionReady=false。</div>
        </section>

        <section className="rounded-[24px] bg-white/70 p-5 ring-1 ring-aura-beige/70">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">{compiled.cards.length} 张图片 Prompt</h2><p className="mt-1 text-xs text-aura-muted">{fmcgCategoryLabels[category]} · {fmcgTopicLabels[topicId]} · Manual / Draft</p></div><button type="button" className={copyClass} onClick={() => copy(allPrompts, "全部图片 Prompt")}>复制全部</button></div>
          <div className="mt-4 space-y-4">{compiled.cards.map((card) => <article key={card.id} className="rounded-[18px] bg-aura-cream/55 p-4"><div className="flex items-center justify-between gap-3"><b>{card.index + 1}. {card.title}</b><button type="button" className={copyClass} onClick={() => copy(card.prompt, card.title)}>复制</button></div><p className="mt-2 text-xs text-aura-muted">{card.purpose} · {card.scene}</p><details className="mt-3"><summary className="cursor-pointer text-sm">查看完整 Prompt</summary><pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap text-xs leading-5">{card.prompt}</pre></details></article>)}</div>
        </section>

        <section className="rounded-[24px] bg-white/70 p-5 ring-1 ring-aura-beige/70">
          <div className="flex flex-wrap items-end justify-between gap-3"><label className="space-y-2"><span className="block text-sm font-medium">Seedance 2.5 时长</span><select className={inputClass} value={duration} onChange={(event) => setDuration(Number(event.target.value) as FmcgVideoDuration)}><option value={10}>10 秒</option><option value={15}>15 秒</option></select></label><button type="button" className={copyClass} onClick={() => copy(videoScript, `${duration} 秒视频脚本`)}>复制视频脚本</button></div>
          <details className="mt-4"><summary className="cursor-pointer text-sm">查看完整视频脚本</summary><pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap text-xs leading-5">{videoScript}</pre></details>
        </section>
        {status && <p role="status" className="rounded-[16px] bg-aura-cream px-4 py-3 text-sm text-aura-muted">{status}</p>}
      </div>
    </div>
  </section>;
}
