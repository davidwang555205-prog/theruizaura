import { useState } from "react";
import type {
  TeamGarmentTypePreference,
  TeamImageType,
  TeamModelContinuity,
  TeamModelChoice,
  TeamPromptParams,
  TeamScenePreference,
  TeamSeason,
  TeamShoe,
  TeamStudioLaunchAnglePreference
} from "./types";
import { generateTeamPrompt } from "./utils/generatePrompt";
import {
  formatSoftSeedingContent,
  generateSoftSeedingContent,
  getDailySoftSeedingSelection,
  getShoeDisplayName,
  getSoftSeedingInventory,
  softSeedingDailySlotOptions,
  softSeedingModeOptions,
  softSeedingTopicOptions,
  type SoftSeedingDailySlot,
  type SoftSeedingMode,
  type SoftSeedingTopic
} from "./utils/generateSoftSeedingContent";
import { promptQualityPatchNotice } from "./data/promptPatches";
import { getCompatibleSceneOptions, isSceneCompatibleWithImageType } from "./data/teamSceneOptions";
import { TEAM_MODEL_OPTIONS } from "./data/teamModelProfiles";
import { TEAM_MODEL_CONTINUITY_OPTIONS } from "./data/modelContinuityProfiles";

const imageTypeOptions: TeamImageType[] = [
  "产品上脚图",
  "对镜穿搭图",
  "生活场景图",
  "非产品氛围图",
  "拍摄花絮 / 材质图",
  "产品静物图"
];

const shoeOptions: TeamShoe[] = [
  "Cloud Dancer 云舞者",
  "Sand Dollar 沙钱白",
  "Cappuccino 卡布奇诺",
  "Silver Romance 银色浪漫",
  "Aire 微风",
  "Delphinium Blue 飞燕草蓝",
  "Lemon 柠檬",
  "Maple Grove 枫林",
  "Oreo 奥利奥",
  "Panda 熊猫",
  "自定义"
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
const initialDailySelection = getDailySoftSeedingSelection(new Date(), 1);
const softInventory = getSoftSeedingInventory();

const initialParams: TeamPromptParams = {
  imageType: "产品上脚图",
  modelChoice: "30–45岁客户画像模特",
  modelContinuity: "新人物",
  shoe: "Cloud Dancer 云舞者",
  customShoe: "",
  season: "春",
  scenePreference: "自动匹配",
  garmentTypePreference: "自动匹配",
  studioLaunchAnglePreference: "自动匹配",
  stillLifeStyle: "与主视觉统一",
  extraRequirement: "",
  generationNonce: 0
};

const initialGeneratedPrompt = generateTeamPrompt(initialParams).prompt;

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

function updateField<K extends keyof TeamPromptParams>(params: TeamPromptParams, key: K, value: TeamPromptParams[K]) {
  return { ...params, [key]: value };
}

function App() {
  const [params, setParams] = useState<TeamPromptParams>(initialParams);
  const [generatedPrompt, setGeneratedPrompt] = useState(() => initialGeneratedPrompt);
  const [copyStatus, setCopyStatus] = useState("");
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [softMode, setSoftMode] = useState<SoftSeedingMode>("今日自动");
  const [softDailySlot, setSoftDailySlot] = useState<SoftSeedingDailySlot>(1);
  const [softTopic, setSoftTopic] = useState<SoftSeedingTopic>(initialDailySelection.topic);
  const [softImageCount, setSoftImageCount] = useState<3 | 5>(5);
  const [softContent, setSoftContent] = useState(() =>
    generateSoftSeedingContent({ baseParams: initialParams, imageCount: 5, mode: "今日自动", dailySlot: 1 })
  );
  const [softCopyStatus, setSoftCopyStatus] = useState("");

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
    setGeneratedPrompt(generateTeamPrompt(nextParams).prompt);
    setCopyStatus("");
    setHasPendingChanges(false);
  };

  const syncPromptParams = () => {
    if (!hasPendingChanges) return params;
    const syncedParams = { ...params, generationNonce: params.generationNonce + 1 };
    setParams(syncedParams);
    setGeneratedPrompt(generateTeamPrompt(syncedParams).prompt);
    setHasPendingChanges(false);
    return syncedParams;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedPrompt);
    setCopyStatus("已复制提示词。");
  };

  const handleGenerateSoftContent = () => {
    const syncedParams = syncPromptParams();
    const nextContent = generateSoftSeedingContent({
      baseParams: syncedParams,
      imageCount: softImageCount,
      mode: softMode,
      topic: softTopic,
      dailySlot: softDailySlot
    });
    setSoftContent(nextContent);
    setSoftCopyStatus("");
    if (softMode === "今日自动") setSoftTopic(nextContent.topic);
  };

  const handleCopySoftContent = async () => {
    await navigator.clipboard.writeText(formatSoftSeedingContent(softContent));
    setSoftCopyStatus("已复制软种草全文。");
  };

  const handleCopyImagePrompt = async (prompt: string, name: string) => {
    await navigator.clipboard.writeText(prompt);
    setSoftCopyStatus(`已复制 ${name} 的 Image 2.0 提示词。`);
  };

  return (
    <main className="min-h-screen bg-aura-cream px-5 py-8 text-aura-charcoal sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="max-w-3xl space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-aura-muted">Standard accurate team mode</p>
          <h1 className="text-3xl font-semibold tracking-tight text-aura-charcoal sm:text-4xl">
            THERUIZ AURA Prompt Builder
          </h1>
          <p className="text-base leading-7 text-aura-muted">
            团队日常使用的极简 Standard 英文提示词工具。后台自动匹配真实城市街景、相机质感、多样穿搭和鞋型保护。
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
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

              <label className="block space-y-2">
                <span className="text-sm font-medium text-aura-charcoal">鞋款</span>
                <select
                  className={inputClass}
                  value={params.shoe}
                  onChange={(event) => updateParams((current) => updateField(current, "shoe", event.target.value as TeamShoe))}
                >
                  {shoeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              {params.shoe === "自定义" && (
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-aura-charcoal">自定义鞋款名称</span>
                  <input
                    className={inputClass}
                    value={params.customShoe}
                    onChange={(event) => updateParams((current) => updateField(current, "customShoe", event.target.value))}
                    placeholder="例如：Warm Grey 低饱和暖灰"
                  />
                </label>
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
                              event.target.value === "棚内上新拍摄" ? current.studioLaunchAnglePreference : "自动匹配"
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
                  参数已更改，请点击“生成提示词”刷新右侧结果，或直接生成软种草内容自动同步。
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

            <div className="aura-scrollbar min-h-[430px] whitespace-pre-wrap rounded-[22px] border border-aura-beige bg-white/75 p-5 text-sm leading-7 text-aura-charcoal shadow-inner lg:max-h-[610px] lg:overflow-y-auto">
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
        </section>

        <section className="rounded-[28px] bg-aura-porcelain/95 p-6 shadow-aura ring-1 ring-aura-beige/70">
          <div className="mb-6 space-y-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.28em] text-aura-muted">
                  yearly soft seeding copy + prompt plans
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-aura-charcoal">每日软种草内容</h2>
                <p className="mt-2 text-sm leading-6 text-aura-muted">
                  自动生成标题、正文、标签和配图提示词。当前组合池共 {softInventory.total.toLocaleString()} 条，按每天 2 篇计算，约 {softInventory.daysWithoutRepeatAtTwoPosts.toLocaleString()} 天不重复。
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={softStatusPillClass}>{softContent.dateKey}</span>
                <span className={softStatusPillClass}>第 {softContent.dailySlot} 篇</span>
                <span className={softStatusPillClass}>{softContent.topic}</span>
                <span className={softStatusPillClass}>{softContent.variantLabel}</span>
              </div>
            </div>

            <div className={softControlPanelClass}>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[0.9fr_0.7fr_1fr_0.7fr_auto] xl:items-end">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-aura-charcoal">生成模式</span>
                  <select
                    className={inputClass}
                    value={softMode}
                    onChange={(event) => {
                      const nextMode = event.target.value as SoftSeedingMode;
                      const dailySelection = getDailySoftSeedingSelection(new Date(), softDailySlot);
                      setSoftMode(nextMode);
                      if (nextMode === "今日自动") setSoftTopic(dailySelection.topic);
                      setSoftCopyStatus("");
                    }}
                  >
                    {softSeedingModeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-aura-charcoal">今日篇序</span>
                  <select
                    className={inputClass}
                    value={softDailySlot}
                    onChange={(event) => {
                      const nextSlot = Number(event.target.value) as SoftSeedingDailySlot;
                      const dailySelection = getDailySoftSeedingSelection(new Date(), nextSlot);
                      setSoftDailySlot(nextSlot);
                      if (softMode === "今日自动") setSoftTopic(dailySelection.topic);
                      setSoftCopyStatus("");
                    }}
                  >
                    {softSeedingDailySlotOptions.map((option) => (
                      <option key={option} value={option}>
                        第 {option} 篇
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-aura-charcoal">内容主题</span>
                  <select
                    className={`${inputClass} disabled:cursor-not-allowed disabled:bg-aura-cream/70 disabled:text-aura-muted`}
                    value={softTopic}
                    disabled={softMode === "今日自动"}
                    onChange={(event) => {
                      setSoftTopic(event.target.value as SoftSeedingTopic);
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
                      setSoftImageCount(Number(event.target.value) as 3 | 5);
                      setSoftCopyStatus("");
                    }}
                  >
                    <option value={3}>3 张</option>
                    <option value={5}>5 张</option>
                  </select>
                </label>

                <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[220px] xl:grid-cols-1">
                  <button type="button" onClick={handleGenerateSoftContent} className={primaryButtonClass}>
                    生成软种草
                  </button>
                  <button type="button" onClick={handleCopySoftContent} className={clayButtonClass}>
                    复制全文
                  </button>
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-aura-muted">
                {softMode === "今日自动"
                  ? "今日自动会按日期和篇序轮换主题与文案版本。"
                  : "手动主题会固定主题，文案版本仍按日期和篇序轮换。"}
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

                  <div className="mt-4 flex flex-wrap gap-2 text-xs leading-5 text-aura-muted">
                    <span className={softStatusPillClass}>{image.params.imageType}</span>
                    <span className={softStatusPillClass}>{image.params.scenePreference}</span>
                    <span className={softStatusPillClass}>{image.params.season}</span>
                    <span className={softStatusPillClass}>{image.params.garmentTypePreference}</span>
                    <span className={softStatusPillClass}>
                      {getShoeDisplayName(image.params.shoe, image.params.customShoe)}
                    </span>
                    <span className={softStatusPillClass}>{image.params.modelContinuity}</span>
                  </div>

                  <details className="mt-4 rounded-[18px] bg-white/75 p-4 ring-1 ring-aura-beige/70">
                    <summary className="cursor-pointer text-sm font-medium text-aura-charcoal">
                      查看完整 Image 2.0 提示词
                    </summary>
                    <div className="aura-scrollbar mt-4 max-h-[360px] whitespace-pre-wrap text-sm leading-7 text-aura-charcoal lg:overflow-y-auto">
                      {image.prompt}
                    </div>
                  </details>
                </article>
              ))}

              {softCopyStatus && <p className="text-sm text-aura-muted">{softCopyStatus}</p>}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
