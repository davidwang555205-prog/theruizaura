import { useMemo, useState } from "react";
import type {
  AtmosphereParams,
  BuilderMode,
  ProductParams,
  TemplateItem
} from "../types";
import { BUILT_IN_TEMPLATES } from "../data/templateLibrary";
import {
  deleteCustomTemplate,
  getCustomTemplates,
  saveCustomTemplate
} from "../utils/templateStorage";

type TemplateLibraryProps = {
  currentBuilderMode: BuilderMode;
  productParams: ProductParams;
  atmosphereParams: AtmosphereParams;
  onApplyTemplate: (template: TemplateItem) => void;
};

type TemplateFilter = "all" | "product" | "atmosphere" | "custom";

const filterOptions: Array<{ value: TemplateFilter; label: string }> = [
  { value: "all", label: "全部" },
  { value: "product", label: "产品图" },
  { value: "atmosphere", label: "非产品氛围图" },
  { value: "custom", label: "我的模板" }
];

function createTemplateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `custom-${crypto.randomUUID()}`;
  }
  return `custom-${Date.now()}`;
}

export default function TemplateLibrary({
  currentBuilderMode,
  productParams,
  atmosphereParams,
  onApplyTemplate
}: TemplateLibraryProps) {
  const [customTemplates, setCustomTemplates] = useState<TemplateItem[]>(() => getCustomTemplates());
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TemplateFilter>("all");
  const [templateName, setTemplateName] = useState("");
  const [templatePurpose, setTemplatePurpose] = useState("");
  const [recommendedPlatform, setRecommendedPlatform] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const templates = useMemo(
    () => [...BUILT_IN_TEMPLATES, ...customTemplates],
    [customTemplates]
  );

  const visibleTemplates = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return templates.filter((template) => {
      const isCustom = Boolean(template.isCustom);
      const matchFilter =
        filter === "all" ||
        (filter === "custom" && isCustom) ||
        (filter !== "custom" && template.category === filter);
      const haystack = [
        template.name,
        template.purpose,
        template.recommendedPlatform,
        template.category
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchFilter && (!keyword || haystack.includes(keyword));
    });
  }, [filter, search, templates]);

  const handleSave = () => {
    const cleanName = templateName.trim();
    if (!cleanName) {
      setSaveMessage("请先输入模板名称。");
      return;
    }

    const template: TemplateItem = {
      id: createTemplateId(),
      name: cleanName,
      category: currentBuilderMode,
      purpose: templatePurpose.trim() || "我的自定义模板",
      recommendedPlatform: recommendedPlatform.trim() || "自定义",
      isCustom: true,
      createdAt: new Date().toISOString(),
      ...(currentBuilderMode === "product"
        ? { productParams: { ...productParams } }
        : { atmosphereParams: { ...atmosphereParams } })
    };

    const next = saveCustomTemplate(template);
    setCustomTemplates(next);
    setTemplateName("");
    setTemplatePurpose("");
    setRecommendedPlatform("");
    setFilter("custom");
    setSaveMessage("已保存到我的模板。");
  };

  const handleDelete = (id: string) => {
    const next = deleteCustomTemplate(id);
    setCustomTemplates(next);
    setSaveMessage("已删除自定义模板。");
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] bg-aura-porcelain/90 p-5 shadow-aura ring-1 ring-aura-beige/60">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-sm font-medium text-aura-muted">保存当前参数为模板</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <input
                value={templateName}
                onChange={(event) => setTemplateName(event.target.value)}
                placeholder="模板名称"
                className="rounded-2xl border border-aura-beige bg-white/70 px-4 py-3 text-sm outline-none focus:border-aura-clay"
              />
              <input
                value={templatePurpose}
                onChange={(event) => setTemplatePurpose(event.target.value)}
                placeholder="用途说明"
                className="rounded-2xl border border-aura-beige bg-white/70 px-4 py-3 text-sm outline-none focus:border-aura-clay"
              />
              <input
                value={recommendedPlatform}
                onChange={(event) => setRecommendedPlatform(event.target.value)}
                placeholder="推荐平台"
                className="rounded-2xl border border-aura-beige bg-white/70 px-4 py-3 text-sm outline-none focus:border-aura-clay"
              />
            </div>
          </div>
          <div className="flex flex-col justify-end gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-2xl bg-aura-charcoal px-5 py-3 text-sm font-medium text-aura-porcelain shadow-sm transition hover:bg-aura-muted"
            >
              保存当前参数
            </button>
            <p className="min-h-5 text-sm text-aura-muted">
              当前保存来源：{currentBuilderMode === "product" ? "产品图 / 模特图模式" : "非产品氛围配图模式"}
              {saveMessage ? `，${saveMessage}` : ""}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[24px] bg-aura-porcelain/90 p-5 shadow-aura ring-1 ring-aura-beige/60">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-aura-muted">模板库</p>
            <h2 className="mt-1 text-2xl font-semibold text-aura-charcoal">常用模板库</h2>
          </div>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜索模板名称"
            className="w-full rounded-2xl border border-aura-beige bg-white/70 px-4 py-3 text-sm outline-none focus:border-aura-clay lg:max-w-sm"
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                filter === option.value
                  ? "bg-aura-charcoal text-aura-porcelain"
                  : "bg-aura-cream text-aura-muted ring-1 ring-aura-beige/70 hover:bg-aura-beige/60"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {visibleTemplates.map((template) => (
            <article
              key={template.id}
              className="rounded-[20px] border border-aura-beige/70 bg-white/65 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-aura-muted">
                    {template.category === "product" ? "产品图 / 模特图" : "非产品氛围图"}
                    {template.isCustom ? " · 我的模板" : ""}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-aura-charcoal">
                    {template.name}
                  </h3>
                </div>
                {template.isCustom && (
                  <button
                    type="button"
                    onClick={() => handleDelete(template.id)}
                    className="rounded-full border border-aura-beige px-3 py-1 text-xs text-aura-muted hover:border-aura-clay hover:text-aura-charcoal"
                  >
                    删除
                  </button>
                )}
              </div>

              <p className="mt-3 text-sm leading-6 text-aura-muted">{template.purpose}</p>
              {template.recommendedPlatform && (
                <p className="mt-2 text-xs text-aura-muted">
                  推荐平台：{template.recommendedPlatform}
                </p>
              )}

              <button
                type="button"
                onClick={() => onApplyTemplate(template)}
                className="mt-5 w-full rounded-2xl bg-aura-sage px-4 py-3 text-sm font-medium text-white transition hover:bg-aura-clay"
              >
                使用此模板
              </button>
            </article>
          ))}
        </div>

        {visibleTemplates.length === 0 && (
          <div className="mt-6 rounded-2xl bg-aura-cream p-5 text-sm text-aura-muted">
            没有找到匹配模板。
          </div>
        )}
      </section>
    </div>
  );
}
