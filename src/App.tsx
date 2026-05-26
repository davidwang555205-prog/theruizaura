import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type {
  AppTab,
  AtmosphereParams,
  BuilderMode,
  ProductParams,
  PromptDetailLevel,
  PromptOutput,
  Season,
  TemplateItem
} from "./types";
import FailureDiagnosis from "./components/FailureDiagnosis";
import TemplateLibrary from "./components/TemplateLibrary";
import VisualScorecard from "./components/VisualScorecard";
import {
  ACTION_OPTIONS,
  ACTION_REPLACEMENT_SUGGESTIONS,
  ACTION_SAFETY_LEVELS,
  BASIC_SCENE_BLOCKS,
  QUICK_THREE_SCENE_SETS
} from "./data/sceneBlocks";
import { MATURE_SCENE_BLOCKS } from "./data/matureLifestyleScenes";
import { ATMOSPHERE_SCENES } from "./data/lifestyleAtmosphereScenes";
import { SEASON_LABELS } from "./data/seasonalOutfits";
import {
  generateAtmospherePrompt,
  generateProductPrompt
} from "./utils/generatePrompt";

const shoeOptions = [
  "Cloud Dancer 云舞者",
  "Cappuccino 卡布奇诺",
  "Sand Dollar 沙钱白",
  "Silver Romance 银色浪漫",
  "Aire 微风",
  "Delphinium Blue 飞燕草蓝",
  "Lemon 柠檬",
  "Maple Grove 枫林",
  "Oreo 奥利奥",
  "Panda 熊猫",
  "自定义"
];

const materialOptions = [
  "牛皮",
  "羊皮",
  "麂皮",
  "网布",
  "缎面",
  "帆布",
  "混合材质",
  "自定义"
];

const ageOptions = [
  { value: "25-35", label: "25–35 轻熟年轻女性" },
  { value: "30-45", label: "30–45 核心都市女性" },
  { value: "40-55", label: "40–55 成熟质感女性" },
  { value: "auto", label: "自动匹配" }
] as const;

const usageOptions = [
  "主理人内容",
  "品牌氛围",
  "拍摄花絮",
  "材质故事",
  "小红书配图",
  "详情页辅助图",
  "上新预热"
];

const shoeAllowanceOptions = [
  "不出现鞋子",
  "可出现鞋子局部，但不能成为主角",
  "可出现样品 / 材料，但不做完整产品图"
];

const peopleAllowanceOptions = [
  "不出现人物",
  "只出现手部 / 背影 / 局部",
  "可出现人物但不能成为主角"
];

const promptDetailOptions: Array<{ value: PromptDetailLevel; label: string; description: string }> = [
  {
    value: "compact",
    label: "精简版 Compact",
    description: "推荐真实生图，短而集中。"
  },
  {
    value: "standard",
    label: "标准版 Standard",
    description: "适合重要产品图，保留必要修复。"
  },
  {
    value: "full",
    label: "完整调试版 Full Debug",
    description: "用于排查鞋型、穿模和镜拍问题。"
  }
];

const promptDetailLabels: Record<PromptDetailLevel, string> = {
  compact: "Compact / 精简版",
  standard: "Standard / 标准版",
  full: "Full Debug / 完整调试版"
};

const initialProductParams: ProductParams = {
  shoe: "Cloud Dancer 云舞者",
  customShoe: "",
  material: "牛皮",
  customMaterial: "",
  colorDescription: "",
  generationMode: "single",
  season: "Spring",
  outfitMode: "auto",
  manualOutfitNotes: "",
  ageRange: "30-45",
  scenes: ["01"],
  action: "自动匹配",
  logo: "small",
  people: "model",
  promptDetailLevel: "compact"
};

const initialAtmosphereParams: AtmosphereParams = {
  imageType: "光影与空间",
  usage: "品牌氛围",
  shoeAllowance: "不出现鞋子",
  peopleAllowance: "不出现人物",
  extraDescription: "",
  promptDetailLevel: "compact"
};

const inputClass =
  "w-full rounded-2xl border border-aura-beige bg-white/75 px-4 py-3 text-sm text-aura-charcoal outline-none transition focus:border-aura-clay";

const labelClass = "text-sm font-medium text-aura-charcoal";

function Field({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function OutputPanel({
  title,
  output,
  onCopyText,
  copyStatus
}: {
  title: string;
  output: PromptOutput;
  onCopyText: (text: string, message: string) => void;
  copyStatus: string;
}) {
  const currentStats = output.stats[output.currentDetailLevel];
  const compactTooLong = output.stats.compact.wordCount > 2000;

  return (
    <aside className="rounded-[28px] bg-aura-porcelain/95 p-5 shadow-aura ring-1 ring-aura-beige/70 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-aura-beige/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-aura-muted">右侧输出区</p>
          <h2 className="mt-1 text-2xl font-semibold text-aura-charcoal">{title}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onCopyText(output.currentPrompt, "已复制当前版本提示词。")}
            className="rounded-2xl bg-aura-charcoal px-4 py-2 text-sm font-medium text-aura-porcelain hover:bg-aura-muted"
          >
            一键复制当前版本
          </button>
          <button
            type="button"
            onClick={() => onCopyText(output.compactPrompt, "已复制 Compact 精简提示词。")}
            className="rounded-2xl bg-aura-sage px-4 py-2 text-sm font-medium text-white hover:bg-aura-clay"
          >
            复制 Compact
          </button>
          <button
            type="button"
            onClick={() => onCopyText(output.standardPrompt, "已复制 Standard 标准提示词。")}
            className="rounded-2xl bg-aura-beige px-4 py-2 text-sm font-medium text-aura-charcoal hover:bg-aura-sand"
          >
            复制 Standard
          </button>
          <button
            type="button"
            onClick={() => onCopyText(output.fullDebugPrompt, "已复制 Full Debug 完整调试提示词。")}
            className="rounded-2xl bg-aura-cream px-4 py-2 text-sm font-medium text-aura-charcoal ring-1 ring-aura-beige hover:bg-aura-sand"
          >
            复制 Full Debug
          </button>
          <button
            type="button"
            onClick={() => onCopyText(output.allModules, "已复制全部模块。")}
            className="rounded-2xl bg-aura-beige px-4 py-2 text-sm font-medium text-aura-charcoal hover:bg-aura-sand"
          >
            复制全部模块
          </button>
        </div>
      </div>

      {copyStatus && <p className="mt-3 text-sm text-aura-muted">{copyStatus}</p>}

      <div className="aura-scrollbar mt-5 space-y-5 overflow-y-auto pr-1 lg:max-h-[calc(100vh-13rem)]">
        <section className="rounded-[24px] border border-aura-beige/70 bg-white/70 p-4">
          <div className="border-b border-aura-beige/70 pb-4">
            <p className="text-sm text-aura-muted">Prompt Output</p>
            <h3 className="mt-1 text-lg font-semibold text-aura-charcoal">提示词输出</h3>
          </div>

          <div className="mt-4 grid gap-3 rounded-[20px] border border-aura-beige/70 bg-white/65 p-4 text-sm text-aura-muted">
            <div className="grid gap-2 sm:grid-cols-3">
              <div>
                <span className="block text-xs text-aura-muted">当前详细程度</span>
                <strong className="mt-1 block text-aura-charcoal">
                  {promptDetailLabels[output.currentDetailLevel]}
                </strong>
              </div>
              <div>
                <span className="block text-xs text-aura-muted">当前提示词字符数</span>
                <strong className="mt-1 block text-aura-charcoal">
                  {currentStats.charCount}
                </strong>
              </div>
              <div>
                <span className="block text-xs text-aura-muted">当前提示词词数</span>
                <strong className="mt-1 block text-aura-charcoal">
                  {currentStats.wordCount}
                </strong>
              </div>
            </div>
            <div>
              <span className="block text-xs text-aura-muted">当前触发模块</span>
              <p className="mt-1 leading-6">{output.triggeredModules.join(" / ")}</p>
            </div>
            {compactTooLong && (
              <p className="rounded-2xl bg-aura-sand/50 px-3 py-2 text-aura-charcoal">
                当前提示词偏长，建议减少高风险动作或切换到单图模式。
              </p>
            )}
          </div>

          <div className="mt-4 space-y-4">
            {output.sections.map((section) => (
              <section
                key={section.title}
                className="rounded-[20px] border border-aura-beige/70 bg-white/70 p-4"
              >
                <h4 className="text-sm font-semibold text-aura-charcoal">{section.title}</h4>
                <pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-aura-muted">
                  {section.content}
                </pre>
              </section>
            ))}
          </div>
        </section>

        <VisualScorecard />
        <FailureDiagnosis onCopyText={onCopyText} />
      </div>
    </aside>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("product");
  const [currentBuilderMode, setCurrentBuilderMode] = useState<BuilderMode>("product");
  const [productParams, setProductParams] = useState<ProductParams>(initialProductParams);
  const [atmosphereParams, setAtmosphereParams] = useState<AtmosphereParams>(initialAtmosphereParams);
  const [templateNotice, setTemplateNotice] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const productOutput = useMemo(() => generateProductPrompt(productParams), [productParams]);
  const atmosphereOutput = useMemo(
    () => generateAtmospherePrompt(atmosphereParams),
    [atmosphereParams]
  );

  const allProductScenes = [...BASIC_SCENE_BLOCKS, ...MATURE_SCENE_BLOCKS];
  const brandAtmosphereScenes = ATMOSPHERE_SCENES.filter((scene) => scene.category === "brand");
  const customerAtmosphereScenes = ATMOSPHERE_SCENES.filter((scene) => scene.category === "customer");
  const selectedActionSafetyLevel = ACTION_SAFETY_LEVELS[productParams.action];
  const selectedActionReplacement = ACTION_REPLACEMENT_SUGGESTIONS[productParams.action];

  const selectTab = (tab: AppTab) => {
    setActiveTab(tab);
    if (tab === "product" || tab === "atmosphere") {
      setCurrentBuilderMode(tab);
    }
  };

  const copyText = async (text: string, message: string) => {
    await navigator.clipboard.writeText(text);
    setCopyStatus(message);
    window.setTimeout(() => setCopyStatus(""), 1800);
  };

  const toggleScene = (sceneId: string) => {
    setProductParams((prev) => {
      if (prev.generationMode === "single") {
        return { ...prev, scenes: [sceneId] };
      }

      const exists = prev.scenes.includes(sceneId);
      if (exists) {
        return { ...prev, scenes: prev.scenes.filter((id) => id !== sceneId) };
      }
      if (prev.scenes.length >= 3) {
        return prev;
      }
      return { ...prev, scenes: [...prev.scenes, sceneId] };
    });
  };

  const updateGenerationMode = (mode: ProductParams["generationMode"]) => {
    setProductParams((prev) => ({
      ...prev,
      generationMode: mode,
      scenes: mode === "single" ? [prev.scenes[0] || "01"] : prev.scenes.slice(0, 3)
    }));
  };

  const applyTemplate = (template: TemplateItem) => {
    if (template.category === "product" && template.productParams) {
      setProductParams((prev) => ({
        ...prev,
        ...template.productParams,
        scenes: template.productParams?.scenes ?? prev.scenes,
        promptDetailLevel: template.productParams?.promptDetailLevel ?? "compact"
      }));
      setActiveTab("product");
      setCurrentBuilderMode("product");
    }

    if (template.category === "atmosphere" && template.atmosphereParams) {
      setAtmosphereParams((prev) => ({
        ...prev,
        ...template.atmosphereParams,
        promptDetailLevel: template.atmosphereParams?.promptDetailLevel ?? "compact"
      }));
      setActiveTab("atmosphere");
      setCurrentBuilderMode("atmosphere");
    }

    setTemplateNotice("已套用模板，可继续微调参数。");
  };

  const resetCurrent = () => {
    if (activeTab === "product") {
      setProductParams(initialProductParams);
    }
    if (activeTab === "atmosphere") {
      setAtmosphereParams(initialAtmosphereParams);
    }
    setTemplateNotice("");
  };

  const renderTabs = () => (
    <div className="flex flex-wrap gap-2 rounded-[24px] bg-aura-porcelain/85 p-2 shadow-sm ring-1 ring-aura-beige/70">
      {[
        { id: "product", label: "产品图 / 模特图模式" },
        { id: "atmosphere", label: "非产品氛围配图模式" },
        { id: "templates", label: "常用模板库" }
      ].map((tab) => (
        <button
          type="button"
          key={tab.id}
          onClick={() => selectTab(tab.id as AppTab)}
          className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
            activeTab === tab.id
              ? "bg-aura-charcoal text-aura-porcelain shadow-sm"
              : "text-aura-muted hover:bg-aura-cream"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  const renderProductForm = () => (
    <section className="rounded-[28px] bg-aura-porcelain/95 p-5 shadow-aura ring-1 ring-aura-beige/70">
      <div className="flex flex-col gap-4 border-b border-aura-beige/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-aura-muted">输入参数区</p>
          <h2 className="mt-1 text-2xl font-semibold text-aura-charcoal">产品图 / 模特图模式</h2>
          <div className="mt-3 max-w-3xl space-y-2 text-sm leading-6 text-aura-muted">
            <p>
              当动作选择对镜自拍相关选项时，系统会自动加入完整镜拍系统，统一控制不露脸、鞋子露出、手机手部结构、镜面比例、坐姿比例、酒店质感和鞋与穿搭关系，避免网红自拍感、镜像穿模、鞋子裁切和廉价酒店自拍感。
            </p>
            <p>
              全身对镜自拍更适合完整展示 OOTD；3/4 身对镜自拍更适合自然社交媒体穿搭记录；坐姿对镜自拍更适合生活化上脚细节和酒店/居家穿搭记录。
            </p>
            <p>
              系统已加入鞋型锁定与上脚安全分级。自动匹配动作时会优先选择更不容易导致鞋子穿模和鞋型变形的安全动作。复杂动作如系鞋带、半穿鞋、蹲下、交叉腿等会被标记为高风险动作。
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCopyStatus("提示词已根据当前参数刷新。")}
            className="rounded-2xl bg-aura-sage px-4 py-2 text-sm font-medium text-white hover:bg-aura-clay"
          >
            生成提示词
          </button>
          <button
            type="button"
            onClick={resetCurrent}
            className="rounded-2xl border border-aura-beige px-4 py-2 text-sm font-medium text-aura-muted hover:border-aura-clay hover:text-aura-charcoal"
          >
            重置按钮
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="鞋款名称">
            <select
              value={productParams.shoe}
              onChange={(event) =>
                setProductParams((prev) => ({ ...prev, shoe: event.target.value }))
              }
              className={inputClass}
            >
              {shoeOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </Field>
          <Field label="材质">
            <select
              value={productParams.material}
              onChange={(event) =>
                setProductParams((prev) => ({ ...prev, material: event.target.value }))
              }
              className={inputClass}
            >
              {materialOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </Field>
        </div>

        {(productParams.shoe === "自定义" || productParams.material === "自定义") && (
          <div className="grid gap-4 md:grid-cols-2">
            {productParams.shoe === "自定义" && (
              <Field label="自定义鞋款">
                <input
                  value={productParams.customShoe}
                  onChange={(event) =>
                    setProductParams((prev) => ({ ...prev, customShoe: event.target.value }))
                  }
                  className={inputClass}
                  placeholder="输入鞋款名称"
                />
              </Field>
            )}
            {productParams.material === "自定义" && (
              <Field label="自定义材质">
                <input
                  value={productParams.customMaterial}
                  onChange={(event) =>
                    setProductParams((prev) => ({
                      ...prev,
                      customMaterial: event.target.value
                    }))
                  }
                  className={inputClass}
                  placeholder="输入材质描述"
                />
              </Field>
            )}
          </div>
        )}

        <Field label="色彩描述">
          <textarea
            value={productParams.colorDescription}
            onChange={(event) =>
              setProductParams((prev) => ({ ...prev, colorDescription: event.target.value }))
            }
            className={`${inputClass} min-h-24`}
            placeholder="例如：低饱和飞燕草蓝，清新、安静、夏日空气感，不少女，不网红。"
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="生成模式">
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-aura-cream p-1">
              {[
                { value: "single", label: "单图模式" },
                { value: "three", label: "3图模式" }
              ].map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => updateGenerationMode(option.value as ProductParams["generationMode"])}
                  className={`rounded-xl px-3 py-2 text-sm font-medium ${
                    productParams.generationMode === option.value
                      ? "bg-white text-aura-charcoal shadow-sm"
                      : "text-aura-muted"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="季节选择">
            <select
              value={productParams.season}
              onChange={(event) =>
                setProductParams((prev) => ({
                  ...prev,
                  season: event.target.value as Season
                }))
              }
              className={inputClass}
            >
              {Object.entries(SEASON_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="提示词详细程度 / Prompt Detail Level">
          <div className="grid gap-2 rounded-2xl bg-aura-cream p-1 md:grid-cols-3">
            {promptDetailOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() =>
                  setProductParams((prev) => ({
                    ...prev,
                    promptDetailLevel: option.value
                  }))
                }
                className={`rounded-xl px-3 py-2 text-left text-sm ${
                  productParams.promptDetailLevel === option.value
                    ? "bg-white text-aura-charcoal shadow-sm"
                    : "text-aura-muted"
                }`}
              >
                <span className="block font-medium">{option.label}</span>
                <span className="mt-1 block text-xs leading-5 opacity-75">
                  {option.description}
                </span>
              </button>
            ))}
          </div>
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="穿搭方案模式">
            <select
              value={productParams.outfitMode}
              onChange={(event) =>
                setProductParams((prev) => ({
                  ...prev,
                  outfitMode: event.target.value as ProductParams["outfitMode"]
                }))
              }
              className={inputClass}
            >
              <option value="auto">自动匹配</option>
              <option value="manual">手动选择</option>
            </select>
          </Field>
          <Field label="客户年龄段">
            <select
              value={productParams.ageRange}
              onChange={(event) =>
                setProductParams((prev) => ({
                  ...prev,
                  ageRange: event.target.value as ProductParams["ageRange"]
                }))
              }
              className={inputClass}
            >
              {ageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {productParams.outfitMode === "manual" && (
          <Field label="手动穿搭备注">
            <textarea
              value={productParams.manualOutfitNotes}
              onChange={(event) =>
                setProductParams((prev) => ({
                  ...prev,
                  manualOutfitNotes: event.target.value
                }))
              }
              className={`${inputClass} min-h-20`}
              placeholder="输入想固定的上装、下装、外套、包袋或色彩系统。"
            />
          </Field>
        )}

        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className={labelClass}>场景选择</p>
              <p className="mt-1 text-sm text-aura-muted">
                {productParams.generationMode === "single"
                  ? "单图模式选择 1 个场景。"
                  : "3图模式最多选择 3 个场景；未选满会自动补足。"}
              </p>
            </div>
            {productParams.generationMode === "three" && (
              <div className="flex flex-wrap gap-2">
                {QUICK_THREE_SCENE_SETS.map((set) => (
                  <button
                    type="button"
                    key={set.name}
                    onClick={() =>
                      setProductParams((prev) => ({ ...prev, scenes: set.scenes }))
                    }
                    className="rounded-full border border-aura-beige bg-white/60 px-3 py-2 text-xs text-aura-muted hover:border-aura-clay hover:text-aura-charcoal"
                  >
                    {set.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {allProductScenes.map((scene) => {
              const selected = productParams.scenes.includes(scene.id);
              const disabled =
                productParams.generationMode === "three" &&
                productParams.scenes.length >= 3 &&
                !selected;
              return (
                <button
                  type="button"
                  key={scene.id}
                  disabled={disabled}
                  onClick={() => toggleScene(scene.id)}
                  className={`min-h-16 rounded-2xl border p-3 text-left text-sm transition ${
                    selected
                      ? "border-aura-charcoal bg-aura-charcoal text-aura-porcelain"
                      : "border-aura-beige bg-white/65 text-aura-muted hover:border-aura-clay hover:text-aura-charcoal disabled:cursor-not-allowed disabled:opacity-45"
                  }`}
                >
                  <span className="block font-medium">{scene.shortLabel}</span>
                  <span className="mt-1 block text-xs opacity-80">{scene.englishLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="动作选择">
            <select
              value={productParams.action}
              onChange={(event) =>
                setProductParams((prev) => ({ ...prev, action: event.target.value }))
              }
              className={inputClass}
            >
              {ACTION_OPTIONS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            {selectedActionSafetyLevel === "C" && (
              <div className="rounded-2xl border border-aura-clay/40 bg-aura-sand/45 p-3 text-sm leading-6 text-aura-charcoal">
                <p>该动作容易导致鞋子穿模或鞋型变形，建议改用安全动作。</p>
                {selectedActionReplacement && (
                  <p className="mt-1 text-aura-muted">建议替代：{selectedActionReplacement}</p>
                )}
              </div>
            )}
          </Field>
          <Field label="是否需要 Logo">
            <select
              value={productParams.logo}
              onChange={(event) =>
                setProductParams((prev) => ({
                  ...prev,
                  logo: event.target.value as ProductParams["logo"]
                }))
              }
              className={inputClass}
            >
              <option value="small">是，小而克制</option>
              <option value="none">否，不加 Logo</option>
            </select>
          </Field>
          <Field label="是否有人物">
            <select
              value={productParams.people}
              onChange={(event) =>
                setProductParams((prev) => ({
                  ...prev,
                  people: event.target.value as ProductParams["people"]
                }))
              }
              className={inputClass}
            >
              <option value="model">有人物</option>
              <option value="shoe-only">只拍鞋和环境</option>
              <option value="auto">自动判断</option>
            </select>
          </Field>
        </div>
      </div>
    </section>
  );

  const renderAtmosphereForm = () => (
    <section className="rounded-[28px] bg-aura-porcelain/95 p-5 shadow-aura ring-1 ring-aura-beige/70">
      <div className="flex flex-col gap-4 border-b border-aura-beige/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-aura-muted">输入参数区</p>
          <h2 className="mt-1 text-2xl font-semibold text-aura-charcoal">
            非产品氛围配图模式
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCopyStatus("提示词已根据当前参数刷新。")}
            className="rounded-2xl bg-aura-sage px-4 py-2 text-sm font-medium text-white hover:bg-aura-clay"
          >
            生成提示词
          </button>
          <button
            type="button"
            onClick={resetCurrent}
            className="rounded-2xl border border-aura-beige px-4 py-2 text-sm font-medium text-aura-muted hover:border-aura-clay hover:text-aura-charcoal"
          >
            重置按钮
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        <Field label="提示词详细程度 / Prompt Detail Level">
          <div className="grid gap-2 rounded-2xl bg-aura-cream p-1 md:grid-cols-3">
            {promptDetailOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() =>
                  setAtmosphereParams((prev) => ({
                    ...prev,
                    promptDetailLevel: option.value
                  }))
                }
                className={`rounded-xl px-3 py-2 text-left text-sm ${
                  atmosphereParams.promptDetailLevel === option.value
                    ? "bg-white text-aura-charcoal shadow-sm"
                    : "text-aura-muted"
                }`}
              >
                <span className="block font-medium">{option.label}</span>
                <span className="mt-1 block text-xs leading-5 opacity-75">
                  {option.description}
                </span>
              </button>
            ))}
          </div>
        </Field>

        <Field label="配图类型">
          <select
            value={atmosphereParams.imageType}
            onChange={(event) =>
              setAtmosphereParams((prev) => ({ ...prev, imageType: event.target.value }))
            }
            className={inputClass}
          >
            <optgroup label="品牌基础氛围">
              {brandAtmosphereScenes.map((scene) => (
                <option key={scene.id}>{scene.label}</option>
              ))}
            </optgroup>
            <optgroup label="客户生活氛围">
              {customerAtmosphereScenes.map((scene) => (
                <option key={scene.id}>{scene.label}</option>
              ))}
            </optgroup>
          </select>
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="用途">
            <select
              value={atmosphereParams.usage}
              onChange={(event) =>
                setAtmosphereParams((prev) => ({ ...prev, usage: event.target.value }))
              }
              className={inputClass}
            >
              {usageOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </Field>
          <Field label="是否允许出现鞋子">
            <select
              value={atmosphereParams.shoeAllowance}
              onChange={(event) =>
                setAtmosphereParams((prev) => ({
                  ...prev,
                  shoeAllowance: event.target.value
                }))
              }
              className={inputClass}
            >
              {shoeAllowanceOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="是否允许出现人物">
          <select
            value={atmosphereParams.peopleAllowance}
            onChange={(event) =>
              setAtmosphereParams((prev) => ({
                ...prev,
                peopleAllowance: event.target.value
              }))
            }
            className={inputClass}
          >
            {peopleAllowanceOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </Field>

        <Field label="补充描述">
          <textarea
            value={atmosphereParams.extraDescription}
            onChange={(event) =>
              setAtmosphereParams((prev) => ({
                ...prev,
                extraDescription: event.target.value
              }))
            }
            className={`${inputClass} min-h-28`}
            placeholder="补充希望保留的生活气质、道具、空间、光线或画面细节。"
          />
        </Field>
      </div>
    </section>
  );

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <p className="text-sm uppercase tracking-[0.22em] text-aura-muted">Quiet Warm Luxury</p>
          <h1 className="mt-3 text-4xl font-semibold text-aura-charcoal sm:text-5xl">
            THERUIZ AURA Prompt Builder
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-aura-muted">
            本地视觉提示词生成器，只负责生成可复制提示词，不直接生成图片。
          </p>
        </header>

        {renderTabs()}

        {templateNotice && (
          <div className="mt-4 rounded-2xl bg-aura-sage/20 px-4 py-3 text-sm text-aura-charcoal ring-1 ring-aura-sage/40">
            {templateNotice}
          </div>
        )}

        {activeTab === "templates" ? (
          <div className="mt-6">
            <TemplateLibrary
              currentBuilderMode={currentBuilderMode}
              productParams={productParams}
              atmosphereParams={atmosphereParams}
              onApplyTemplate={applyTemplate}
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            {activeTab === "product" ? renderProductForm() : renderAtmosphereForm()}
            {activeTab === "product" ? (
              <OutputPanel
                title="产品图 / 模特图提示词"
                output={productOutput}
                copyStatus={copyStatus}
                onCopyText={copyText}
              />
            ) : (
              <OutputPanel
                title="非产品氛围提示词"
                output={atmosphereOutput}
                copyStatus={copyStatus}
                onCopyText={copyText}
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
