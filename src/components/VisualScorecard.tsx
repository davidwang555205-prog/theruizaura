import { useMemo, useState } from "react";

const dimensions = [
  {
    id: "shoe",
    label: "鞋型准确度",
    max: 30,
    checks: "鞋头、鞋底厚度、鞋带、鞋舌、鞋身比例正确；没有重构、变形、穿模。"
  },
  {
    id: "brand",
    label: "品牌氛围",
    max: 20,
    checks: "符合 Quiet Warm Luxury；奶油白、米灰、浅石色、低饱和、自然光；避免廉价电商感、网红感、硬广感。"
  },
  {
    id: "customer",
    label: "客户感受",
    max: 15,
    checks: "传达早上出门不用纠结、走一天不狼狈、舒服但不随便、干净体面有审美。"
  },
  {
    id: "human",
    label: "人物真实感",
    max: 15,
    checks: "身材比例真实，表情有活人感，避免 AI 假人、九头身和过度网红。"
  },
  {
    id: "outfit",
    label: "穿搭匹配度",
    max: 10,
    checks: "季节、场景、鞋款匹配；服装符合 THERUIZ AURA 客户审美。"
  },
  {
    id: "composition",
    label: "构图与可用性",
    max: 10,
    checks: "适合小红书 / 详情页 / 品牌手册；鞋子清楚；没有裁切、穿帮或混乱背景。"
  }
];

const initialScores = Object.fromEntries(dimensions.map((dimension) => [dimension.id, 0]));

function getRating(total: number) {
  if (total >= 90) return "90分以上：可进入品牌素材库";
  if (total >= 80) return "80–89分：可小修后使用";
  if (total >= 70) return "70–79分：只能参考，不建议发布";
  return "70分以下：废图，建议重生";
}

const statusOptions = [
  { id: "pass", label: "标记为通过" },
  { id: "optimize", label: "可优化" },
  { id: "reject", label: "废图" }
];

export default function VisualScorecard() {
  const [scores, setScores] = useState<Record<string, number>>(initialScores);
  const [status, setStatus] = useState("");

  const total = useMemo(
    () => dimensions.reduce((sum, dimension) => sum + (scores[dimension.id] || 0), 0),
    [scores]
  );
  const hasScored = Object.values(scores).some((score) => score > 0);

  const updateScore = (id: string, value: string, max: number) => {
    const nextValue = Math.max(0, Math.min(max, Number(value) || 0));
    setScores((previous) => ({ ...previous, [id]: nextValue }));
  };

  return (
    <section className="rounded-[24px] border border-aura-beige/70 bg-white/70 p-4">
      <div className="flex flex-col gap-3 border-b border-aura-beige/70 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-aura-muted">Visual Output Scorecard</p>
          <h3 className="mt-1 text-lg font-semibold text-aura-charcoal">生成结果评分</h3>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-3xl font-semibold text-aura-charcoal">{total}/100</p>
          <p className="mt-1 text-sm text-aura-muted">
            {hasScored ? getRating(total) : "待评分：请按生成图逐项填写。"}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {dimensions.map((dimension) => (
          <div
            key={dimension.id}
            className="grid gap-3 rounded-[18px] border border-aura-beige/60 bg-aura-cream/45 p-3 sm:grid-cols-[minmax(0,1fr)_6.5rem]"
          >
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-aura-charcoal">
                  {dimension.label}
                  <span className="ml-2 text-xs font-normal text-aura-muted">
                    {dimension.max}分
                  </span>
                </p>
              </div>
              <p className="mt-1 text-xs leading-5 text-aura-muted">{dimension.checks}</p>
            </div>
            <input
              type="number"
              min={0}
              max={dimension.max}
              value={scores[dimension.id]}
              onChange={(event) => updateScore(dimension.id, event.target.value, dimension.max)}
              className="h-11 rounded-2xl border border-aura-beige bg-white/80 px-3 text-sm text-aura-charcoal outline-none focus:border-aura-clay"
              aria-label={`${dimension.label} 得分`}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {statusOptions.map((option) => (
          <button
            type="button"
            key={option.id}
            onClick={() => setStatus(option.id)}
            className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
              status === option.id
                ? "bg-aura-charcoal text-aura-porcelain"
                : "border border-aura-beige text-aura-muted hover:border-aura-clay hover:text-aura-charcoal"
            }`}
          >
            {option.label}
          </button>
        ))}
        {status && (
          <span className="rounded-2xl bg-aura-sage/15 px-4 py-2 text-sm text-aura-charcoal">
            当前标记：{statusOptions.find((option) => option.id === status)?.label}
          </span>
        )}
      </div>
    </section>
  );
}
