import { useEffect, useRef, useState, type ChangeEvent } from "react";
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
import type { ProductMode } from "./modules/product/types";
import type { GarmentProductCategory, GarmentProductSpec } from "./modules/product/garment/garmentProductTypes";
import type { BootClosureType, BootHeelType, BootShaftStructure, BootShoeSpec, BootSubtype, BootToeShape, PumpBackType, PumpHeelType, PumpShoeSpec, PumpStrapType, PumpToeShape, ShoeCategory, ShoeReferenceRole } from "./modules/product/shoe/shoeProductTypes";
import { GarmentReferenceUploader, hasValidGarmentReferences, type GarmentReference } from "./components/GarmentReferenceUploader";
import { generateTeamPrompt } from "./utils/generatePrompt";
import {
  formatSoftSeedingImagePrompts,
  generateSoftSeedingContent,
  getShoeDisplayName,
  getSoftSeedingInventory,
  softSeedingTopicOptions,
  type SoftSeedingImageCount,
  type SoftSeedingTopic
} from "./utils/generateSoftSeedingContent";
import { promptQualityPatchNotice } from "./data/promptPatches";
import { getCompatibleSceneOptions, isSceneCompatibleWithImageType } from "./data/teamSceneOptions";
import { getCompatibleGarmentScenes, isGarmentSceneCompatible } from "./modules/product/garment/garmentSceneCompatibility";
import { TEAM_MODEL_OPTIONS } from "./data/teamModelProfiles";
import { TEAM_MODEL_CONTINUITY_OPTIONS } from "./data/modelContinuityProfiles";
import { APP_NAME } from "./constants/app";

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
const garmentImageLabels: Record<TeamImageType, string> = { "产品上脚图": "模特穿着图", "对镜穿搭图": "对镜试穿图", "生活场景图": "生活街拍图", "非产品氛围图": "品牌氛围图", "拍摄花絮 / 材质图": "服装细节 / 拍摄花絮", "产品静物图": "服装平铺 / 静物图" };
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
const imageToolButtonClass =
  "rounded-[16px] bg-white/80 px-4 py-2 text-xs font-medium text-aura-charcoal ring-1 ring-aura-beige/80 transition hover:bg-aura-cream disabled:cursor-not-allowed disabled:opacity-45";

type ReferenceImage = {
  id: string;
  name: string;
  size: number;
  url: string;
  role: ShoeReferenceRole;
};
type ShoeDraft = Pick<TeamPromptParams, "shoe" | "customShoe">;
type SinglePromptResult = { mode: ProductMode; sourceFingerprint: string; prompt: string };

function updateField<K extends keyof TeamPromptParams>(params: TeamPromptParams, key: K, value: TeamPromptParams[K]) {
  return { ...params, [key]: value };
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function createGarmentProductFingerprint(garment: GarmentProductSpec, references: GarmentReference[]) {
  return JSON.stringify({
    category: garment.category,
    name: garment.name.trim(),
    color: garment.color?.trim() ?? "",
    fabric: garment.fabric?.trim() ?? "",
    silhouette: garment.silhouette?.trim() ?? "",
    neckline: garment.neckline?.trim() ?? "",
    shoulderStructure: garment.shoulderStructure?.trim() ?? "",
    sleeveType: garment.sleeveType?.trim() ?? "",
    sleeveLength: garment.sleeveLength?.trim() ?? "",
    waistline: garment.waistline?.trim() ?? "",
    garmentLength: garment.garmentLength?.trim() ?? "",
    hemLength: garment.hemLength?.trim() ?? "",
    closure: garment.closure?.trim() ?? "",
    pattern: garment.pattern?.trim() ?? "",
    drape: garment.drape?.trim() ?? "",
    transparency: garment.transparency?.trim() ?? "",
    keyDetails: [...(garment.keyDetails ?? [])].map((detail) => detail.trim()),
    references: references.map(({ id, role }) => ({ id, role })).sort((a, b) => a.id.localeCompare(b.id))
  });
}

function App() {
  const [params, setParams] = useState<TeamPromptParams>(initialParams);
  const [productMode, setProductMode] = useState<ProductMode>("shoe");
  const [shoeDraft, setShoeDraft] = useState<ShoeDraft>({ shoe: initialParams.shoe, customShoe: initialParams.customShoe });
  const [shoeCategory, setShoeCategory] = useState<ShoeCategory>("germanTrainer");
  const [pumpSpec, setPumpSpec] = useState<PumpShoeSpec>({ category: "pump", productName: "", color: "", upperMaterial: "", toeShape: "almond", heelType: "kitten", heelHeight: "按参考图保持", backType: "closedBack", strapType: "none", keyDetails: [] });
  const [bootSpec, setBootSpec] = useState<BootShoeSpec>({ category: "boot", productName: "", subtype: "ankleBoot", toeShape: "almond", color: "", upperMaterial: "", shaftHeight: "按参考图保持", shaftStructure: "structured", closureType: "zipper", heelType: "lowBlock", heelHeight: "按参考图保持", keyDetails: [] });
  const [garmentReferences, setGarmentReferences] = useState<GarmentReference[]>([]);
  const [garment, setGarment] = useState<GarmentProductSpec>({ category: "dress", name: "", color: "", fabric: "", silhouette: "" });
  const [generatedProductFingerprint, setGeneratedProductFingerprint] = useState("");
  const lastGarmentFingerprint = useRef(createGarmentProductFingerprint(garment, []));
  const [singlePromptResult, setSinglePromptResult] = useState<SinglePromptResult | null>({ mode: "shoe", sourceFingerprint: "", prompt: initialGeneratedPrompt });
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

  useEffect(() => {
    referenceImagesRef.current = referenceImages;
  }, [referenceImages]);

  useEffect(() => {
    const nextFingerprint = createGarmentProductFingerprint(garment, garmentReferences);
    if (lastGarmentFingerprint.current !== nextFingerprint) {
      lastGarmentFingerprint.current = nextFingerprint;
      setHasPendingChanges(true);
      setCopyStatus("");
      setSoftCopyStatus("");
      if (productMode === "garment" && generatedProductFingerprint && generatedProductFingerprint !== nextFingerprint) {
        setSinglePromptResult(null);
        setGeneratedProductFingerprint("");
      }
    }
  }, [garment, garmentReferences, productMode, generatedProductFingerprint]);

  useEffect(() => {
    if (productMode !== "shoe" || shoeCategory !== "pump") return;
    setHasPendingChanges(true);
    setSinglePromptResult(null);
    setCopyStatus("");
  }, [pumpSpec, shoeCategory, productMode]);

  useEffect(() => {
    if (productMode !== "shoe" || shoeCategory !== "boot") return;
    setHasPendingChanges(true);
    setSinglePromptResult(null);
    setCopyStatus("");
  }, [bootSpec, shoeCategory, productMode]);

  useEffect(() => {
    return () => {
      referenceImagesRef.current.forEach((image) => URL.revokeObjectURL(image.url));
    };
  }, []);

  const sceneOptions = productMode === "garment"
    ? ["自动匹配", ...getCompatibleGarmentScenes({ category: garment.category, season: params.season, imageType: params.imageType })]
    : getCompatibleSceneOptions(params.imageType);
  const showsModelChoice = peopleImageTypes.includes(params.imageType);
  const paramsForProduct = (value: TeamPromptParams): TeamPromptParams => productMode === "garment"
    ? { ...value, productContext: { mode: "garment", garment }, garmentReferenceRoles: garmentReferences.map((reference) => reference.role) }
    : { ...value, productContext: { mode: "shoe", shoe: shoeDraft.shoe, customShoe: shoeDraft.customShoe, category: shoeCategory, pumpSpec: shoeCategory === "pump" ? pumpSpec : undefined, bootSpec: shoeCategory === "boot" ? bootSpec : undefined } };

  const updateParams = (updater: (current: TeamPromptParams) => TeamPromptParams) => {
    setParams((current) => updater(current));
    setHasPendingChanges(true);
    setCopyStatus("");
    setSoftCopyStatus("");
  };

  const handleGenerate = () => {
    if (productMode === "garment" && !hasValidGarmentReferences(garmentReferences)) { setImageGenerationStatus("服装模式需要至少4张参考图，并且必须包含正面完整图。"); return; }
    if (productMode === "shoe" && shoeCategory === "pump") {
      const missingPumpFields = [pumpSpec.productName, pumpSpec.color, pumpSpec.upperMaterial, pumpSpec.heelHeight, (pumpSpec.keyDetails ?? []).join("")].some((value) => !value?.trim());
      if (missingPumpFields) { setImageGenerationStatus("高跟单鞋需要填写鞋款名称、主颜色、鞋面材质、鞋跟高度和关键细节。"); return; }
      if (referenceImages.length < 4) { setImageGenerationStatus("高跟单鞋需要至少 4 张参考图，并且必须包含完整侧面参考图。"); return; }
      if (referenceImages.filter((image) => image.role === "primary").length !== 1 || !referenceImages.some((image) => image.role === "side")) { setImageGenerationStatus("高跟单鞋参考图必须标记 1 张主图和至少 1 张完整侧面图。"); return; }
    }
    if (productMode === "shoe" && shoeCategory === "boot") {
      const missingBootFields = [bootSpec.productName, bootSpec.color, bootSpec.upperMaterial, bootSpec.shaftHeight, bootSpec.heelHeight, (bootSpec.keyDetails ?? []).join("")].some((value) => !value?.trim());
      if (missingBootFields) { setImageGenerationStatus("靴子需要填写靴款名称、主颜色、材质外观、靴筒高度、鞋跟高度和关键细节。"); return; }
      if (referenceImages.length < 4 || referenceImages.filter((image) => image.role === "primary").length !== 1 || !referenceImages.some((image) => image.role === "fullSide")) { setImageGenerationStatus("靴子需要至少 4 张参考图，并标记 1 张主图和 1 张完整侧面图。"); return; }
    }
    const nextParams = paramsForProduct({ ...params, generationNonce: params.generationNonce + 1 });
    setParams(nextParams);
    const prompt = generateTeamPrompt(nextParams).prompt;
    const sourceFingerprint = productMode === "garment" ? createGarmentProductFingerprint(garment, garmentReferences) : "";
    setSinglePromptResult({ mode: productMode, sourceFingerprint, prompt });
    setGeneratedProductFingerprint(sourceFingerprint);
    setCopyStatus("");
    setHasPendingChanges(false);
  };

  const syncPromptParams = () => {
    if (!hasPendingChanges) return params;
    const syncedParams = paramsForProduct({ ...params, generationNonce: params.generationNonce + 1 });
    setParams(syncedParams);
    const prompt = generateTeamPrompt(syncedParams).prompt;
    const sourceFingerprint = productMode === "garment" ? createGarmentProductFingerprint(garment, garmentReferences) : "";
    setSinglePromptResult({ mode: productMode, sourceFingerprint, prompt });
    setGeneratedProductFingerprint(sourceFingerprint);
    setHasPendingChanges(false);
    return syncedParams;
  };

  const handleCopy = async () => {
    if (!singlePromptResult?.prompt) return;
    await navigator.clipboard.writeText(singlePromptResult.prompt);
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

  const handleReferenceImagesUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const maxReferenceCount = productMode === "shoe" && (shoeCategory === "pump" || shoeCategory === "boot") ? 6 : 9;
    const availableSlots = Math.max(0, maxReferenceCount - referenceImages.length);
    const selectedFiles = files.slice(0, availableSlots);
    const skippedCount = files.length - selectedFiles.length;

    const roleOrder: ShoeReferenceRole[] = shoeCategory === "boot" ? ["primary", "fullSide", "front", "rear", "shaftDetail", "closureDetail"] : ["primary", "side", "front", "rear", "detail", "material"];
    const nextImages = selectedFiles.map((file, index) => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
      role: roleOrder[Math.min(roleOrder.length - 1, referenceImages.length + index)]
    }));

    setReferenceImages((current) => [...current, ...nextImages]);
    setImageGenerationStatus(
      skippedCount > 0
        ? `已添加 ${nextImages.length} 张参考图，当前品类最多保留 ${maxReferenceCount} 张。`
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

    if (productMode === "shoe" && (shoeCategory === "pump" || shoeCategory === "boot") && referenceImages.length < 4) {
      setImageGenerationStatus(shoeCategory === "boot" ? "靴子需要至少 4 张参考图，且应包含完整侧面参考图。" : "高跟单鞋需要至少 4 张参考图，且应包含完整侧面参考图。");
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
                {productMode === "shoe" && (shoeCategory === "pump" || shoeCategory === "boot") && <select className="w-full rounded-lg border border-aura-beige bg-white px-2 py-1 text-xs" value={image.role} onChange={(event) => { const role = event.target.value as ShoeReferenceRole; setReferenceImages((current) => current.map((item) => item.id === image.id ? { ...item, role } : item)); setHasPendingChanges(true); }}><option value="primary">主图</option><option value={shoeCategory === "boot" ? "fullSide" : "side"}>完整侧面</option><option value="front">正面</option><option value="rear">后面</option><option value="top">俯视</option><option value="outsole">外底</option><option value={shoeCategory === "boot" ? "shaftDetail" : "detail"}>{shoeCategory === "boot" ? "靴筒细节" : "后跟 / 细节"}</option><option value={shoeCategory === "boot" ? "closureDetail" : "material"}>{shoeCategory === "boot" ? "闭合细节" : "材质"}</option><option value="material">材质</option></select>}
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

  return (
    <main className="min-h-screen bg-aura-cream px-5 py-8 text-aura-charcoal sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="max-w-3xl space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-aura-muted">Standard accurate team mode</p>
          <h1 className="text-3xl font-semibold tracking-tight text-aura-charcoal sm:text-4xl">
            {APP_NAME} Prompt Builder
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
                <span className="text-sm font-medium text-aura-charcoal">产品模式</span>
                <select className={inputClass} value={productMode} onChange={(event) => { const next = event.target.value as ProductMode; setProductMode(next); setParams((current) => ({ ...current, shoe: shoeDraft.shoe, customShoe: shoeDraft.customShoe })); setSinglePromptResult(null); setGeneratedProductFingerprint(""); setHasPendingChanges(true); }}>
                  <option value="shoe">鞋履模式</option><option value="garment">服装模式</option>
                </select>
              </label>
              {productMode === "garment" && <>
                <GarmentReferenceUploader value={garmentReferences} onChange={(next) => { setGarmentReferences(next); setHasPendingChanges(true); }} />
                <label className="block space-y-2"><span className="text-sm font-medium">服装品类</span><select className={inputClass} value={garment.category} onChange={(event) => { const category = event.target.value as GarmentProductCategory; setGarment((current) => ({ ...current, category })); if (params.scenePreference !== "自动匹配" && !isGarmentSceneCompatible({ category, season: params.season, imageType: params.imageType, scene: params.scenePreference })) updateParams((current) => ({ ...current, scenePreference: "自动匹配" })); }}>{[["dress","连衣裙"],["top","上衣"],["shirt","衬衫"],["knitwear","针织衫"],["tshirt","T恤"],["trousers","裤装"],["skirt","半裙"],["coat","大衣"],["jacket","夹克／外套"],["suit","西装"],["set","套装"],["activewear","轻运动服"],["bridal","婚纱"],["eveningGown","礼服"],["other","其他"]].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <div className="grid gap-3 sm:grid-cols-2"><input className={inputClass} placeholder="服装名称（可选）" value={garment.name} onChange={(event) => setGarment((current) => ({ ...current, name: event.target.value }))} /><input className={inputClass} placeholder="主颜色（可选）" value={garment.color} onChange={(event) => setGarment((current) => ({ ...current, color: event.target.value }))} /><input className={inputClass} placeholder="面料（可选）" value={garment.fabric} onChange={(event) => setGarment((current) => ({ ...current, fabric: event.target.value }))} /><input className={inputClass} placeholder="版型（可选）" value={garment.silhouette} onChange={(event) => setGarment((current) => ({ ...current, silhouette: event.target.value }))} /></div>
              </>}
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
                      scenePreference: productMode === "garment"
                        ? (current.scenePreference === "自动匹配" || isGarmentSceneCompatible({ category: garment.category, season: current.season, imageType, scene: current.scenePreference }) ? current.scenePreference : "自动匹配")
                        : isSceneCompatibleWithImageType(imageType, current.scenePreference)
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
                      {productMode === "garment" ? garmentImageLabels[option] : option}
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

              {productMode === "shoe" && <label className="block space-y-2">
                <span className="text-sm font-medium text-aura-charcoal">鞋履品类</span>
                <select
                  className={inputClass}
                  value={shoeCategory}
                  onChange={(event) => { const category = event.target.value as ShoeCategory; setShoeCategory(category); setSinglePromptResult(null); setGeneratedProductFingerprint(""); updateParams((current) => ({ ...current, productContext: { mode: "shoe", shoe: shoeDraft.shoe, customShoe: shoeDraft.customShoe, category, pumpSpec: category === "pump" ? pumpSpec : undefined, bootSpec: category === "boot" ? bootSpec : undefined } })); }}
                >
                  <option value="germanTrainer">德训鞋 / 低帮运动休闲鞋</option>
                  <option value="pump">高跟单鞋</option>
                  <option value="boot">靴子（短靴 / 中筒靴 / 长靴）</option>
                  <option value="loafer" disabled>乐福鞋（规划中）</option>
                  <option value="balletFlat" disabled>芭蕾鞋 / 平底鞋（规划中）</option>
                  <option value="sandal" disabled>凉鞋（规划中）</option>
                  <option value="mule" disabled>穆勒鞋（规划中）</option>
                  <option value="other" disabled>其他鞋型（规划中）</option>
                </select>
                <span className="block text-xs leading-5 text-aura-muted">当前已支持德训鞋、高跟单鞋与靴子；其他鞋型保持规划状态，不会回退到已支持品类。</span>
              </label>}

              {productMode === "shoe" && shoeCategory === "pump" && <div className="space-y-3 rounded-[20px] bg-aura-cream/70 p-4 ring-1 ring-aura-beige/70">
                <div>
                  <p className="text-sm font-medium text-aura-charcoal">高跟单鞋规格</p>
                  <p className="mt-1 text-xs leading-5 text-aura-muted">未知结构请填写“按参考图保持”，不自动补写品牌、鞋跟高度或材质成分。</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className={inputClass} placeholder="鞋款名称（必填）" value={pumpSpec.productName} onChange={(event) => setPumpSpec((current) => ({ ...current, productName: event.target.value }))} />
                  <input className={inputClass} placeholder="品牌（可选）" value={pumpSpec.brandName ?? ""} onChange={(event) => setPumpSpec((current) => ({ ...current, brandName: event.target.value }))} />
                  <input className={inputClass} placeholder="主颜色（必填）" value={pumpSpec.color ?? ""} onChange={(event) => setPumpSpec((current) => ({ ...current, color: event.target.value }))} />
                  <input className={inputClass} placeholder="鞋面材质 / 材质外观（必填）" value={pumpSpec.upperMaterial ?? ""} onChange={(event) => setPumpSpec((current) => ({ ...current, upperMaterial: event.target.value }))} />
                  <select className={inputClass} value={pumpSpec.toeShape} onChange={(event) => setPumpSpec((current) => ({ ...current, toeShape: event.target.value as PumpToeShape }))}><option value="pointed">尖头</option><option value="almond">杏仁头</option><option value="round">圆头</option><option value="square">方头</option><option value="other">按参考图保持</option></select>
                  <select className={inputClass} value={pumpSpec.heelType} onChange={(event) => setPumpSpec((current) => ({ ...current, heelType: event.target.value as PumpHeelType }))}><option value="stiletto">细跟</option><option value="kitten">猫跟</option><option value="block">粗跟</option><option value="cone">锥形跟</option><option value="sculptural">造型跟</option><option value="other">按参考图保持</option></select>
                  <input className={inputClass} placeholder="鞋跟高度（必填）" value={pumpSpec.heelHeight} onChange={(event) => setPumpSpec((current) => ({ ...current, heelHeight: event.target.value }))} />
                  <select className={inputClass} value={pumpSpec.backType} onChange={(event) => setPumpSpec((current) => ({ ...current, backType: event.target.value as PumpBackType }))}><option value="closedBack">包跟</option><option value="slingback">后空 / Slingback</option></select>
                  <select className={inputClass} value={pumpSpec.strapType} onChange={(event) => setPumpSpec((current) => ({ ...current, strapType: event.target.value as PumpStrapType }))}><option value="none">无绑带</option><option value="ankleStrap">踝带</option><option value="instepStrap">鞋面带</option><option value="maryJane">玛丽珍带</option><option value="other">按参考图保持</option></select>
                  <input className={inputClass} placeholder="鞋跟厚度 / 位置 / 角度（可选）" value={[pumpSpec.heelThickness, pumpSpec.heelPlacement, pumpSpec.heelAngle].filter(Boolean).join(" / ")} onChange={(event) => setPumpSpec((current) => ({ ...current, heelThickness: event.target.value, heelPlacement: event.target.value, heelAngle: event.target.value }))} />
                  <input className={inputClass} placeholder="鞋口 / 鞋面 / 侧帮细节（可选）" value={[pumpSpec.vampShape, pumpSpec.toplineShape, pumpSpec.sideCut].filter(Boolean).join(" / ")} onChange={(event) => setPumpSpec((current) => ({ ...current, vampShape: event.target.value, toplineShape: event.target.value, sideCut: event.target.value }))} />
                  <input className={inputClass} placeholder="关键细节（必填）" value={(pumpSpec.keyDetails ?? []).join("、")} onChange={(event) => setPumpSpec((current) => ({ ...current, keyDetails: event.target.value.split(/[、,，]/).map((item) => item.trim()).filter(Boolean) }))} />
                </div>
                <p className="text-xs leading-5 text-aura-muted">高跟单鞋至少上传 4 张参考图，建议按主图、完整侧面、正面、后跟 / 细节顺序上传；完整侧面用于确认鞋跟高度、位置、足弓曲线和侧帮结构。</p>
              </div>}

              {productMode === "shoe" && shoeCategory === "boot" && <div className="space-y-3 rounded-[20px] bg-aura-cream/70 p-4 ring-1 ring-aura-beige/70">
                <div><p className="text-sm font-medium text-aura-charcoal">靴子规格</p><p className="mt-1 text-xs leading-5 text-aura-muted">未知高度、筒围或材质时填写“按参考图保持”，不自动补写防水、保暖或防滑功能。</p></div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className={inputClass} placeholder="靴款名称（必填）" value={bootSpec.productName} onChange={(event) => setBootSpec((current) => ({ ...current, productName: event.target.value }))} />
                  <input className={inputClass} placeholder="主颜色（必填）" value={bootSpec.color ?? ""} onChange={(event) => setBootSpec((current) => ({ ...current, color: event.target.value }))} />
                  <input className={inputClass} placeholder="材质外观（必填）" value={bootSpec.upperMaterial ?? ""} onChange={(event) => setBootSpec((current) => ({ ...current, upperMaterial: event.target.value }))} />
                  <select className={inputClass} value={bootSpec.subtype} onChange={(event) => setBootSpec((current) => ({ ...current, subtype: event.target.value as BootSubtype }))}><option value="ankleBoot">短靴</option><option value="midCalfBoot">中筒靴</option><option value="kneeHighBoot">及膝靴</option><option value="overTheKneeBoot">过膝靴</option><option value="chelseaBoot">切尔西靴</option><option value="sockBoot">袜靴</option><option value="ridingBoot">骑士靴</option><option value="westernBoot">西部靴</option><option value="other">其他</option></select>
                  <select className={inputClass} value={bootSpec.toeShape} onChange={(event) => setBootSpec((current) => ({ ...current, toeShape: event.target.value as BootToeShape }))}><option value="pointed">尖头</option><option value="almond">杏仁头</option><option value="round">圆头</option><option value="square">方头</option><option value="other">按参考图保持</option></select>
                  <input className={inputClass} placeholder="靴筒高度（必填）" value={bootSpec.shaftHeight} onChange={(event) => setBootSpec((current) => ({ ...current, shaftHeight: event.target.value }))} />
                  <input className={inputClass} placeholder="筒围 / 筒口 / 前后筒高（可选）" value={[bootSpec.shaftCircumference, bootSpec.shaftOpeningShape, bootSpec.shaftFrontBackHeightRelation].filter(Boolean).join(" / ")} onChange={(event) => setBootSpec((current) => ({ ...current, shaftCircumference: event.target.value, shaftOpeningShape: event.target.value, shaftFrontBackHeightRelation: event.target.value }))} />
                  <input className={inputClass} placeholder="踝部松量 / 小腿贴合 / 膝盖关系（可选）" value={[bootSpec.ankleEase, bootSpec.calfFit, bootSpec.kneeRelation].filter(Boolean).join(" / ")} onChange={(event) => setBootSpec((current) => ({ ...current, ankleEase: event.target.value, calfFit: event.target.value, kneeRelation: event.target.value }))} />
                  <select className={inputClass} value={bootSpec.shaftStructure} onChange={(event) => setBootSpec((current) => ({ ...current, shaftStructure: event.target.value as BootShaftStructure }))}><option value="structured">结构挺括</option><option value="semiStructured">半挺括</option><option value="soft">柔软</option><option value="sockLike">袜筒感</option><option value="other">按参考图保持</option></select>
                  <select className={inputClass} value={bootSpec.closureType} onChange={(event) => setBootSpec((current) => ({ ...current, closureType: event.target.value as BootClosureType }))}><option value="zipper">拉链</option><option value="pullOn">套入式</option><option value="elasticGore">松紧侧片</option><option value="laceUp">系带</option><option value="buckle">搭扣</option><option value="mixed">混合</option><option value="other">按参考图保持</option></select>
                  <select className={inputClass} value={bootSpec.heelType} onChange={(event) => setBootSpec((current) => ({ ...current, heelType: event.target.value as BootHeelType }))}><option value="flat">平跟</option><option value="lowBlock">低粗跟</option><option value="block">粗跟</option><option value="stiletto">细跟</option><option value="wedge">坡跟</option><option value="western">西部跟</option><option value="platform">厚底</option><option value="other">按参考图保持</option></select>
                  <input className={inputClass} placeholder="鞋跟高度（必填）" value={bootSpec.heelHeight} onChange={(event) => setBootSpec((current) => ({ ...current, heelHeight: event.target.value }))} />
                  <input className={inputClass} placeholder="外底 / 前掌台 / 鞋底纹路（可选）" value={[bootSpec.outsoleThickness, bootSpec.platformHeight, bootSpec.treadProfile].filter(Boolean).join(" / ")} onChange={(event) => setBootSpec((current) => ({ ...current, outsoleThickness: event.target.value, platformHeight: event.target.value, treadProfile: event.target.value }))} />
                  <input className={inputClass} placeholder="关键细节（必填）" value={(bootSpec.keyDetails ?? []).join("、")} onChange={(event) => setBootSpec((current) => ({ ...current, keyDetails: event.target.value.split(/[、,，]/).map((item) => item.trim()).filter(Boolean) }))} />
                </div>
                <p className="text-xs leading-5 text-aura-muted">靴子至少上传 4 张参考图，必须包含一张展示完整鞋头、鞋跟和整条靴筒的完整侧面图；长靴侧面图必须包含完整筒口。</p>
              </div>}

              {productMode === "shoe" && <label className="block space-y-2">
                <span className="text-sm font-medium text-aura-charcoal">鞋款</span>
                <select
                  className={inputClass}
                  value={params.shoe}
                  onChange={(event) => { const shoe = event.target.value as TeamShoe; setShoeDraft((current) => ({ ...current, shoe })); updateParams((current) => updateField(current, "shoe", shoe)); }}
                >
                  {shoeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>}

              {productMode === "shoe" && params.shoe === "自定义" && (
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-aura-charcoal">自定义鞋款名称</span>
                  <input
                    className={inputClass}
                    value={params.customShoe}
                    onChange={(event) => { const customShoe = event.target.value; setShoeDraft((current) => ({ ...current, customShoe })); updateParams((current) => updateField(current, "customShoe", customShoe)); }}
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
                  onChange={(event) => { const season = event.target.value as TeamSeason; updateParams((current) => ({ ...current, season, scenePreference: productMode === "garment" && current.scenePreference !== "自动匹配" && !isGarmentSceneCompatible({ category: garment.category, season, imageType: current.imageType, scene: current.scenePreference }) ? "自动匹配" : current.scenePreference })); }}
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
              <button type="button" onClick={handleCopy} disabled={!singlePromptResult?.prompt} className={clayButtonClass}>
                一键复制
              </button>
            </div>

            {productMode === "garment" ? <div className="mb-5 rounded-[22px] bg-aura-cream p-5 text-sm leading-6 text-aura-muted ring-1 ring-aura-beige/70">服装参考图仅在当前浏览器本地预览。网站不会发送图片，也不会直接生成或下载图片；请复制 Prompt 后，将同一组参考图手动上传至 Image 2.0。</div> : imageGenerationPanel}

            <div className="aura-scrollbar min-h-[430px] whitespace-pre-wrap rounded-[22px] border border-aura-beige bg-white/75 p-5 text-sm leading-7 text-aura-charcoal shadow-inner lg:max-h-[610px] lg:overflow-y-auto">
              {singlePromptResult?.prompt ?? "请先点击“生成单张 Prompt”。"}
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
                    {softTopic === "棚内上新拍摄" && <option value={8}>8 张</option>}
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
