import type { FailureDiagnosisItem } from "../types";

export const FAILURE_DIAGNOSES: FailureDiagnosisItem[] = [
  {
    id: "shoe-shape-changed",
    label: "鞋型变了",
    cause: "鞋型保护不足，动作复杂，镜头不安全，或提示词过长导致模型抓不住鞋型优先级。",
    direction: "切换到 Standard 或 Full Debug，强化 sneaker shape lock，使用 A级安全动作，避免镜面扭曲和高风险动作。",
    recommendedActions: ["静态站立，一脚微微向前", "靠墙自然站立", "慢走一步"],
    recommendedScenes: ["上脚生活", "居家衣帽间", "通勤上班"],
    recommendedDetailLevel: "standard",
    modulesToAdd: ["Sneaker shape lock", "No sneaker reconstruction", "Shoe-safe camera angle"],
    modulesToReduce: ["复杂动作", "过长负面词堆叠", "夸张镜头描述"]
  },
  {
    id: "shoe-clipping",
    label: "鞋子穿模",
    cause: "上脚结构冲突过大，裤脚、脚踝、鞋口、地面接触关系不清。",
    direction: "强化 foot-shoe fit，加入 trouser-shoe separation，避免高风险动作，改为静态站立、小步走或床边坐姿。",
    recommendedActions: ["静态站立，一脚微微向前", "慢走一步", "坐在床边，双脚自然落地"],
    recommendedScenes: ["上脚生活", "居家衣帽间", "旅行酒店"],
    recommendedDetailLevel: "standard",
    modulesToAdd: ["Foot-shoe fit", "Trouser-shoe separation", "On-foot proportion"],
    modulesToReduce: ["半穿鞋", "大幅弯腰", "脚正在穿入鞋口的瞬间"]
  },
  {
    id: "shoelace-clipping",
    label: "鞋带穿模",
    cause: "手与鞋带互动过复杂，模型容易把手指、鞋带、鞋舌和鞋面融合。",
    direction: "避免真实系鞋带，改为手靠近鞋带但不拉扯，加入 shoelace compact/standard，优先坐姿静态整理。",
    recommendedActions: ["坐在床边，双脚自然落地", "整理裤脚", "坐在沙发边"],
    recommendedScenes: ["居家衣帽间", "上脚生活", "穿搭关系"],
    recommendedDetailLevel: "standard",
    modulesToAdd: ["Shoelace compact", "Foot-shoe fit", "High-risk on-foot pose protection"],
    modulesToReduce: ["真实拉扯鞋带", "复杂手部互动", "半穿鞋瞬间"]
  },
  {
    id: "cropped-shoes",
    label: "鞋子被裁掉",
    cause: "构图不稳定，镜拍或场景取景过紧，鞋子没有被设为必须完整可读。",
    direction: "改用完整全身镜拍，明确 full shoe visibility，减少近景构图。",
    recommendedActions: ["对镜手机自拍（不露脸，鞋子完整露出）", "静态站立，一脚微微向前", "靠墙自然站立"],
    recommendedScenes: ["居家衣帽间", "上脚生活", "旅行酒店"],
    recommendedDetailLevel: "standard",
    modulesToAdd: ["Full shoe visibility", "Outfit-and-shoe emphasis", "Shoe-safe camera angle"],
    modulesToReduce: ["极近景", "上半身镜拍", "遮挡鞋子的家具或包袋"]
  },
  {
    id: "body-proportion",
    label: "人物比例不对",
    cause: "广角感太强、构图不稳、人物比例修复不足，或镜面角度拉长身体。",
    direction: "强化 model body，限制 35–50mm 视角，避免低角度、镜面拉腿和夸张时尚姿态。",
    recommendedActions: ["静态站立，一脚微微向前", "3/4身对镜自拍（不露脸，鞋子清楚露出）", "坐在沙发边"],
    recommendedScenes: ["居家衣帽间", "上脚生活", "周末城市散步"],
    recommendedDetailLevel: "standard",
    modulesToAdd: ["Model body compact", "Human proportion", "Camera control"],
    modulesToReduce: ["低角度", "广角镜头", "强时尚大片姿势"]
  },
  {
    id: "fake-model",
    label: "模特不像真人",
    cause: "表情和姿态太假，皮肤太塑料，画面更像 AI 假人或商业硬广。",
    direction: "加入 lifelike expression，降低商业摆拍，改成自然场景和动作。",
    recommendedActions: ["慢走一步", "拿咖啡慢走", "翻书 / 看书"],
    recommendedScenes: ["周末咖啡", "通勤上班", "周末城市散步"],
    recommendedDetailLevel: "standard",
    modulesToAdd: ["Lifelike expression", "Mature customer lifestyle", "Customer feeling core"],
    modulesToReduce: ["直视镜头硬摆拍", "过度精修皮肤", "网红表演感"]
  },
  {
    id: "cheap-mood",
    label: "氛围廉价",
    cause: "背景杂乱、光线太硬、颜色太黄，品牌语义不集中。",
    direction: "强化 Quiet Warm Luxury，使用 Compact 或 Standard，减少道具和背景复杂度。",
    recommendedActions: ["静态站立，一脚微微向前", "靠墙自然站立", "拿包准备出门"],
    recommendedScenes: ["通勤上班", "周末咖啡", "居家衣帽间"],
    recommendedDetailLevel: "compact",
    modulesToAdd: ["Brand compact", "Core negative compact", "Seasonal outfit compact"],
    modulesToReduce: ["过多道具", "强商业灯光", "复杂背景"]
  },
  {
    id: "too-ecommerce",
    label: "太像电商图",
    cause: "鞋子被孤立展示，生活场景和客户情绪不足，画面过于陈列化。",
    direction: "增加生活场景，减少纯产品陈列，增加客户感受核心，改用真实动作或轻生活方式场景。",
    recommendedActions: ["慢走一步", "拿包准备出门", "拿咖啡慢走"],
    recommendedScenes: ["通勤上班", "周末咖啡", "精品超市 / 日常采购"],
    recommendedDetailLevel: "compact",
    modulesToAdd: ["Customer feeling compact", "Scene compact", "Action compact"],
    modulesToReduce: ["纯白棚拍", "孤立产品陈列", "目录式构图"]
  },
  {
    id: "too-influencer",
    label: "太网红",
    cause: "自拍表演感、妆容和姿态过强，画面偏社交媒体营业而非真实日常。",
    direction: "减少自拍表演感，避免过度妆容和夸张姿态，强化 understated, refined, real daily life。",
    recommendedActions: ["靠墙自然站立", "慢走一步", "3/4身对镜自拍（不露脸，鞋子清楚露出）"],
    recommendedScenes: ["居家衣帽间", "周末城市散步", "通勤上班"],
    recommendedDetailLevel: "compact",
    modulesToAdd: ["Mirror selfie compact", "Lifelike expression compact", "Core negative compact"],
    modulesToReduce: ["夸张腰线姿势", "美妆自拍", "强博主营业感"]
  },
  {
    id: "outfit-off-brand",
    label: "穿搭不符合品牌",
    cause: "季节、场景、鞋款调性没有对齐，服装过潮、过甜、过运动或高饱和。",
    direction: "检查季节和鞋款匹配，使用品牌穿搭矩阵，减少高饱和和强潮流服装。",
    recommendedActions: ["镜前检查穿搭", "整理衣架 / 拿衣服", "静态站立，一脚微微向前"],
    recommendedScenes: ["穿搭关系", "居家衣帽间", "通勤上班"],
    recommendedDetailLevel: "standard",
    modulesToAdd: ["Seasonal outfit styling", "Brand-matched outfit direction", "Shoe style tuning"],
    modulesToReduce: ["运动套装", "高饱和潮流色", "甜美少女感"]
  },
  {
    id: "unreal-scene",
    label: "场景不真实",
    cause: "道具和布景过度，生活逻辑不足，空间像临时拼贴而非真实日常。",
    direction: "换成真实日常场景，减少道具，避免过度布景。",
    recommendedActions: ["拿包准备出门", "慢走一步", "坐在沙发边"],
    recommendedScenes: ["通勤上班", "居家衣帽间", "精品超市 / 日常采购"],
    recommendedDetailLevel: "compact",
    modulesToAdd: ["Scene compact", "Customer feeling compact", "Core negative compact"],
    modulesToReduce: ["过度布景", "随机 Pinterest 道具", "不符合生活逻辑的空间"]
  },
  {
    id: "cheap-hotel-mirror",
    label: "酒店镜拍廉价",
    cause: "镜拍默认到卫生间台面、黄光、杂乱行李或廉价酒店装饰。",
    direction: "启用 hotel mirror compact/standard，避免卫生间台面，选择衣柜镜、玄关镜、床边镜，控制背景秩序。",
    recommendedActions: ["对镜手机自拍（不露脸，鞋子完整露出）", "坐姿对镜自拍（不露脸，鞋子重点清晰）"],
    recommendedScenes: ["旅行酒店"],
    recommendedDetailLevel: "standard",
    modulesToAdd: ["Hotel mirror compact", "Hotel background order", "Hotel lighting refinement"],
    modulesToReduce: ["卫生间镜拍", "强黄光", "乱行李和杂物"]
  },
  {
    id: "too-cluttered",
    label: "图太杂",
    cause: "场景描述、道具、负面词和动作要求过多，画面重点分散。",
    direction: "切换 Compact，减少场景描述和 props，保留单一重点。",
    recommendedActions: ["静态站立，一脚微微向前", "靠墙自然站立", "慢走一步"],
    recommendedScenes: ["上脚生活", "通勤上班", "城市路径"],
    recommendedDetailLevel: "compact",
    modulesToAdd: ["Brand compact", "Scene compact", "Core negative compact"],
    modulesToReduce: ["过多 props", "多重空间要求", "长篇调试模块"]
  },
  {
    id: "weak-shoe-presence",
    label: "鞋子存在感太弱",
    cause: "鞋在画面里太小、被裤脚或道具遮挡，构图没有强调上脚关系。",
    direction: "提高鞋在画面中的可读性，调整构图，使用 shoe emphasis 或 full shoe visibility。",
    recommendedActions: ["对镜手机自拍（不露脸，鞋子完整露出）", "整理裤脚", "坐在沙发边"],
    recommendedScenes: ["上脚生活", "居家衣帽间", "穿搭关系"],
    recommendedDetailLevel: "standard",
    modulesToAdd: ["Outfit-and-shoe emphasis", "Full shoe visibility", "Trouser-shoe separation"],
    modulesToReduce: ["远景人物", "长裤完全盖鞋", "道具遮挡鞋"]
  },
  {
    id: "not-theruiz-aura",
    label: "整体不像 THERUIZ AURA",
    cause: "品牌总控、客户感受、场景、穿搭或人物气质有一项跑偏，导致画面不像温感静奢。",
    direction: "强化品牌总控和客户感受核心，减少无关修饰词，保持奶油白、米灰、石色、自然光、低饱和，并检查场景、穿搭、人物是否跑偏。",
    recommendedActions: ["静态站立，一脚微微向前", "拿包准备出门", "慢走一步"],
    recommendedScenes: ["通勤上班", "居家衣帽间", "周末城市散步"],
    recommendedDetailLevel: "compact",
    modulesToAdd: ["Brand compact", "Customer feeling compact", "Seasonal outfit compact"],
    modulesToReduce: ["科技感", "夜店感", "运动广告感", "过度社媒感"]
  }
];

export function formatFailureDiagnosis(items: FailureDiagnosisItem[]) {
  if (!items.length) return "";

  return items
    .map(
      (item) => `${item.label}
原因判断：${item.cause}
推荐修正方向：${item.direction}
推荐切换动作：${item.recommendedActions.join(" / ")}
推荐切换场景：${item.recommendedScenes.join(" / ")}
推荐提示词详细程度：${item.recommendedDetailLevel}
推荐增加模块：${item.modulesToAdd.join(" / ")}
推荐减少模块：${item.modulesToReduce.join(" / ")}`
    )
    .join("\n\n");
}
