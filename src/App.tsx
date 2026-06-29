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

const garmentTypeOptions: TeamGarmentTypePreference[] = [
  "自动匹配",
  "裤装",
  "裙装",
  "短裤",
  "连衣裙",
  "轻运动"
];

const studioLaunchAngleOptions: TeamStudioLaunchAnglePreference[] = [
  "自动匹配",
  "全身棚拍角度",
  "下半身1/3角度",
  "鞋子上脚特写角度",
  "3/4侧前方上脚角度"
];

const peopleImageTypes: TeamImageType[] = ["产品上脚图", "对镜穿搭图", "生活场景图"];

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

const inputClass =
  "w-full rounded-[18px] border border-aura-beige bg-white/75 px-4 py-3 text-sm text-aura-charcoal outline-none transition focus:border-aura-clay";

function updateField<K extends keyof TeamPromptParams>(
  params: TeamPromptParams,
  key: K,
  value: TeamPromptParams[K]
) {
  return { ...params, [key]: value };
}

function App() {
  const [params, setParams] = useState<TeamPromptParams>(initialParams);
  const [generatedPrompt, setGeneratedPrompt] = useState(() => generateTeamPrompt(initialParams).prompt);
  const [copyStatus, setCopyStatus] = useState("");
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const sceneOptions = getCompatibleSceneOptions(params.imageType);
  const showsModelChoice = peopleImageTypes.includes(params.imageType);

  const updateParams = (updater: (current: TeamPromptParams) => TeamPromptParams) => {
    setParams((current) => updater(current));
    setHasPendingChanges(true);
    setCopyStatus("");
  };

  const handleGenerate = () => {
    const nextParams: TeamPromptParams = {
      ...params,
      generationNonce: params.generationNonce + 1
    };

    setParams(nextParams);
    setGeneratedPrompt(generateTeamPrompt(nextParams).prompt);
    setCopyStatus("");
    setHasPendingChanges(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedPrompt);
    setCopyStatus("已复制提示词。");
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
                        updateParams((current) =>
                          updateField(current, "modelChoice", event.target.value as TeamModelChoice)
                        )
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
                  onChange={(event) =>
                    updateParams((current) => updateField(current, "shoe", event.target.value as TeamShoe))
                  }
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
                    onChange={(event) =>
                      updateParams((current) => updateField(current, "customShoe", event.target.value))
                    }
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
                  onChange={(event) =>
                    updateParams((current) => updateField(current, "season", event.target.value as TeamSeason))
                  }
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
                      updateField(
                        current,
                        "garmentTypePreference",
                        event.target.value as TeamGarmentTypePreference
                      )
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
                <summary className="cursor-pointer text-sm font-medium text-aura-charcoal">
                  高级选项：手动指定场景
                </summary>
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
                          updateField(
                            current,
                            "studioLaunchAnglePreference",
                            event.target.value as TeamStudioLaunchAnglePreference
                          )
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
                  onChange={(event) =>
                    updateParams((current) => updateField(current, "extraRequirement", event.target.value))
                  }
                  placeholder="例如：Use a soft cream cardigan and cropped straight-leg denim."
                />
                <span className="block text-xs leading-5 text-aura-muted">
                  建议用英文填写补充要求，以便最终提示词保持英文。如果填写中文，系统会原样保留，不会自动删除。
                </span>
              </label>

              {hasPendingChanges && (
                <p className="rounded-[16px] bg-aura-cream px-4 py-3 text-sm leading-6 text-aura-muted ring-1 ring-aura-beige/70">
                  参数已更改，请点击“生成提示词”刷新右侧结果。
                </p>
              )}

              <button
                type="button"
                onClick={handleGenerate}
                className="w-full rounded-[18px] bg-aura-charcoal px-5 py-3 text-sm font-medium text-aura-porcelain shadow-sm transition hover:bg-aura-muted"
              >
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
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-[18px] bg-aura-clay px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-aura-charcoal"
              >
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
      </div>
    </main>
  );
}

export default App;
