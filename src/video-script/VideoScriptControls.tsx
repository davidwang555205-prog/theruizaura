import { useMemo, useState } from "react";
import type { TeamPromptParams } from "../types";
import { compileSeedance25VideoScript } from "./compiler";
import type { VideoDuration } from "./contracts";

type VideoScriptControlsProps = {
  params: TeamPromptParams;
  selectedOutfitLine?: string;
  onCopyStatus?: (message: string) => void;
};

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
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
  if (!copied) throw new Error("复制失败，请手动选择脚本文本复制。");
}

export function VideoScriptControls({ params, selectedOutfitLine, onCopyStatus }: VideoScriptControlsProps) {
  const [duration, setDuration] = useState<VideoDuration>(10);
  const [expanded, setExpanded] = useState(false);
  const result = useMemo(
    () => compileSeedance25VideoScript({ params, duration, selectedOutfitLine }),
    [params, duration, selectedOutfitLine],
  );

  const handleCopy = async () => {
    try {
      await copyText(result.prompt);
      onCopyStatus?.(`Seedance 2.5 ${duration}s 视频脚本已复制。`);
    } catch (error) {
      onCopyStatus?.(error instanceof Error ? error.message : "复制失败，请手动复制。" );
    }
  };

  return (
    <section className="rounded-[22px] bg-white/70 p-5 ring-1 ring-aura-beige/70" data-testid="video-script-controls">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="ui-eyebrow">SEEDANCE 2.5 / MANUAL COPY</p>
          <h3 className="mt-1 text-lg font-semibold text-aura-charcoal">视频脚本</h3>
          <p className="mt-1 text-sm leading-6 text-aura-muted">复用当前产品、场景、季节、人物与参考图绑定，只生成脚本，不调用视频 API。</p>
        </div>
        <div className="flex rounded-[16px] bg-aura-cream p-1 ring-1 ring-aura-beige/70">
          {([10, 15] as VideoDuration[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setDuration(value)}
              className={`rounded-[12px] px-4 py-2 text-xs font-medium transition ${duration === value ? "bg-aura-charcoal text-aura-porcelain" : "text-aura-muted hover:text-aura-charcoal"}`}
            >
              {value}s
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={handleCopy} className="rounded-[16px] bg-aura-clay px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-aura-charcoal">
          一键复制视频脚本
        </button>
        <button type="button" onClick={() => setExpanded((value) => !value)} className="rounded-[16px] bg-white/80 px-4 py-2 text-sm font-medium text-aura-charcoal ring-1 ring-aura-beige/80 transition hover:bg-aura-cream">
          {expanded ? "收起脚本" : "查看脚本"}
        </button>
      </div>

      {result.diagnostics.length > 0 && (
        <p className="mt-3 text-xs leading-5 text-aura-muted">当前提示：{result.diagnostics.join(" · ")}</p>
      )}

      {expanded && (
        <pre className="mt-4 max-h-[560px] overflow-auto whitespace-pre-wrap rounded-[18px] bg-aura-cream/70 p-4 text-xs leading-6 text-aura-charcoal ring-1 ring-aura-beige/60">
          {result.prompt}
        </pre>
      )}
    </section>
  );
}
