import { useMemo, useState } from "react";
import { FAILURE_DIAGNOSES, formatFailureDiagnosis } from "../data/failureDiagnosis";

export default function FailureDiagnosis({
  onCopyText
}: {
  onCopyText: (text: string, message: string) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedItems = useMemo(
    () => FAILURE_DIAGNOSES.filter((item) => selectedIds.includes(item.id)),
    [selectedIds]
  );
  const diagnosisText = useMemo(() => formatFailureDiagnosis(selectedItems), [selectedItems]);

  const toggleIssue = (id: string) => {
    setSelectedIds((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]
    );
  };

  return (
    <section className="rounded-[24px] border border-aura-beige/70 bg-white/70 p-4">
      <div className="flex flex-col gap-3 border-b border-aura-beige/70 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-aura-muted">Failure Diagnosis</p>
          <h3 className="mt-1 text-lg font-semibold text-aura-charcoal">失败原因诊断</h3>
        </div>
        <button
          type="button"
          disabled={!selectedItems.length}
          onClick={() => onCopyText(diagnosisText, "已复制失败诊断建议。")}
          className="rounded-2xl bg-aura-charcoal px-4 py-2 text-sm font-medium text-aura-porcelain transition hover:bg-aura-muted disabled:cursor-not-allowed disabled:opacity-45"
        >
          一键复制诊断建议
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {FAILURE_DIAGNOSES.map((item) => {
          const selected = selectedIds.includes(item.id);
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => toggleIssue(item.id)}
              className={`rounded-2xl border px-3 py-2 text-sm transition ${
                selected
                  ? "border-aura-charcoal bg-aura-charcoal text-aura-porcelain"
                  : "border-aura-beige bg-white/70 text-aura-muted hover:border-aura-clay hover:text-aura-charcoal"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-3">
        {!selectedItems.length ? (
          <p className="rounded-[18px] bg-aura-cream/55 p-4 text-sm leading-6 text-aura-muted">
            选择生成图中出现的问题后，这里会自动给出原因判断、修正方向、推荐动作、推荐场景、提示词详细程度和模块调整建议。
          </p>
        ) : (
          selectedItems.map((item) => (
            <article
              key={item.id}
              className="rounded-[18px] border border-aura-beige/60 bg-aura-cream/45 p-4"
            >
              <h4 className="text-sm font-semibold text-aura-charcoal">{item.label}</h4>
              <div className="mt-3 space-y-2 text-sm leading-6 text-aura-muted">
                <p>
                  <span className="font-medium text-aura-charcoal">原因判断：</span>
                  {item.cause}
                </p>
                <p>
                  <span className="font-medium text-aura-charcoal">推荐修正方向：</span>
                  {item.direction}
                </p>
                <p>
                  <span className="font-medium text-aura-charcoal">推荐切换动作：</span>
                  {item.recommendedActions.join(" / ")}
                </p>
                <p>
                  <span className="font-medium text-aura-charcoal">推荐切换场景：</span>
                  {item.recommendedScenes.join(" / ")}
                </p>
                <p>
                  <span className="font-medium text-aura-charcoal">推荐提示词详细程度：</span>
                  {item.recommendedDetailLevel}
                </p>
                <p>
                  <span className="font-medium text-aura-charcoal">推荐增加模块：</span>
                  {item.modulesToAdd.join(" / ")}
                </p>
                <p>
                  <span className="font-medium text-aura-charcoal">推荐减少模块：</span>
                  {item.modulesToReduce.join(" / ")}
                </p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
