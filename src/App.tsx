import { useState } from "react";
import type {
  TeamGarmentTypePreference,
  TeamImageType,
  TeamPromptParams,
  TeamScenePreference,
  TeamSeason,
  TeamShoe
} from "./types";
import { generateTeamPrompt } from "./utils/generatePrompt";
import { promptQualityPatchNotice } from "./data/promptPatches";

const imageTypeOptions: TeamImageType[] = [
  "产品上脚图",
  "对镜穿搭图",
  "生活场景图",
  "非产品氛围图",
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

const sceneOptions: TeamScenePreference[] = [
  "自动匹配",
  "通勤上班",
  "周末城市散步",
  "精品超市 / 日常采购",
  "旅行酒店",
  "居家衣帽间",
  "玄关出门",
  "窗边阅读",
  "材质工作台",
  "拍摄花絮",
  "周末轻采购",
  "健身房内",
  "去运动的路上"
];

const initialParams: TeamPromptParams = {
  imageType: "产品上脚图",
  shoe: "Cloud Dancer 云舞者",
  customShoe: "",
  season: "春",
  scenePreference: "自动匹配",
  garmentTypePreference: "自动匹配",
  stillLifeStyle: "与主视觉统一",
  extraRequirement: ""
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

  const handleGenerate = () => {
    setGeneratedPrompt(generateTeamPrompt(params).prompt);
    setCopyStatus("");
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
                  onChange={(event) =>
                    setParams((current) =>
                      updateField(current, "imageType", event.target.value as TeamImageType)
                    )
                  }
                >
                  {imageTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-aura-charcoal">鞋款</span>
                <select
                  className={inputClass}
                  value={params.shoe}
                  onChange={(event) =>
                    setParams((current) => updateField(current, "shoe", event.target.value as TeamShoe))
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
                      setParams((current) => updateField(current, "customShoe", event.target.value))
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
                    setParams((current) => updateField(current, "season", event.target.value as TeamSeason))
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
                    setParams((current) =>
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
                      setParams((current) =>
                        updateField(current, "scenePreference", event.target.value as TeamScenePreference)
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
                    日常使用建议保持自动匹配，只有明确要咖啡店、酒店、健身房、材质工作台等场景时再打开。
                  </span>
                </label>
              </details>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-aura-charcoal">补充要求</span>
                <textarea
                  className={`${inputClass} min-h-28`}
                  value={params.extraRequirement}
                  onChange={(event) =>
                    setParams((current) => updateField(current, "extraRequirement", event.target.value))
                  }
                  placeholder="例如：Use a soft cream cardigan and cropped straight-leg denim."
                />
                <span className="block text-xs leading-5 text-aura-muted">
                  建议用英文填写补充要求，以便最终提示词保持英文。如果填写中文，系统会原样保留，不会自动删除。
                </span>
              </label>

              <button
                type="button"
                onClick={handleGenerate}
                className="w-full rounded-[18px] bg-aura-charcoal px-5 py-3 text-sm font-medium text-aura-porcelain shadow-sm transition hover:bg-aura-muted"
              >
                生成提示词
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

            <div className="aura-scrollbar min-h-[430px] rounded-[22px] border border-aura-beige bg-white/75 p-5 text-sm leading-7 text-aura-charcoal shadow-inner lg:max-h-[610px] lg:overflow-y-auto">
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
