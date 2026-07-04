import type {
  TeamGarmentTypePreference,
  TeamImageType,
  TeamPromptParams,
  TeamScenePreference,
  TeamSeason,
  TeamShoe
} from "../types";
import { generateTeamPrompt } from "./generatePrompt";

export type SoftSeedingTopic =
  | "生活场景软种草"
  | "产品开发幕后"
  | "秋冬配色实验室"
  | "穿搭解决方案"
  | "材质工艺认知"
  | "品牌审美观点"
  | "上新活动转化";
export type SoftSeedingMode = "今日自动" | "手动主题";
export type SoftSeedingDailySlot = 1 | 2;

export type SoftSeedingImagePlan = {
  name: string;
  purpose: string;
  description: string;
  params: TeamPromptParams;
  prompt: string;
};

export type SoftSeedingContent = {
  topic: SoftSeedingTopic;
  dateKey: string;
  dailySlot: SoftSeedingDailySlot;
  variantIndex: number;
  variantCount: number;
  variantLabel: string;
  titles: string[];
  body: string;
  images: SoftSeedingImagePlan[];
  tags: string[];
  note: string;
};

type SoftSeedingInput = {
  baseParams: TeamPromptParams;
  imageCount?: 3 | 5;
  mode?: SoftSeedingMode;
  topic?: SoftSeedingTopic;
  dailySlot?: SoftSeedingDailySlot;
  date?: Date;
};

type SoftSeedingImageDraft = {
  name: string;
  purpose: string;
  description: string;
  imageType: TeamImageType;
  scenePreference: TeamScenePreference;
  garmentTypePreference: TeamGarmentTypePreference;
  season?: TeamSeason;
  extraRequirement: string;
};

type TopicCopyKit = {
  titleLeads: string[];
  titleSeconds: string[];
  titleThirds: string[];
  openings: string[];
  observations: string[];
  scenes: string[];
  xiaohongshuAngles: string[];
  closings: string[];
  tags: string[];
  note: string;
};

type TopicCopyDraft = {
  titles: string[];
  body: string;
  tags: string[];
  note: string;
};

export const softSeedingTopicOptions: SoftSeedingTopic[] = [
  "生活场景软种草",
  "产品开发幕后",
  "秋冬配色实验室",
  "穿搭解决方案",
  "材质工艺认知",
  "品牌审美观点",
  "上新活动转化"
];
export const softSeedingModeOptions: SoftSeedingMode[] = ["今日自动", "手动主题"];
export const softSeedingDailySlotOptions: SoftSeedingDailySlot[] = [1, 2];

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAILY_POST_COUNT = 2;

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function getLocalDateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function getDayNumber(date = new Date()) {
  const localMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return Math.floor(localMidnight / MS_PER_DAY);
}

function resolveDailySlot(slot?: SoftSeedingDailySlot): SoftSeedingDailySlot {
  return slot === 2 ? 2 : 1;
}

function getTopicVariantCount(topic: SoftSeedingTopic) {
  const kit = topicCopyKits[topic];
  return (
    kit.openings.length *
    kit.observations.length *
    kit.scenes.length *
    kit.xiaohongshuAngles.length *
    kit.closings.length
  );
}

export function getSoftSeedingInventory() {
  const perTopic = softSeedingTopicOptions.map((topic) => ({
    topic,
    count: getTopicVariantCount(topic)
  }));
  const total = perTopic.reduce((sum, item) => sum + item.count, 0);

  return {
    perTopic,
    total,
    dailyPostCount: DAILY_POST_COUNT,
    daysWithoutRepeatAtTwoPosts: Math.floor(total / DAILY_POST_COUNT)
  };
}

export function getDailySoftSeedingSelection(date = new Date(), dailySlot: SoftSeedingDailySlot = 1) {
  const safeSlot = resolveDailySlot(dailySlot);
  const globalPostIndex = getDayNumber(date) * DAILY_POST_COUNT + (safeSlot - 1);
  const topic = softSeedingTopicOptions[globalPostIndex % softSeedingTopicOptions.length];
  const variantCount = getTopicVariantCount(topic);
  const variantIndex = Math.floor(globalPostIndex / softSeedingTopicOptions.length) % variantCount;

  return {
    dateKey: getLocalDateKey(date),
    dailySlot: safeSlot,
    topic,
    variantIndex,
    variantCount,
    variantLabel: `第 ${variantIndex + 1} / ${variantCount} 版`
  };
}

function pick<T>(items: T[], index: number) {
  return items[index % items.length];
}

function buildCopyFromKit(topic: SoftSeedingTopic, variantIndex: number): TopicCopyDraft {
  const kit = topicCopyKits[topic];
  const openingIndex = variantIndex % kit.openings.length;
  const observationIndex = Math.floor(variantIndex / kit.openings.length) % kit.observations.length;
  const sceneIndex = Math.floor(variantIndex / (kit.openings.length * kit.observations.length)) % kit.scenes.length;
  const angleIndex =
    Math.floor(variantIndex / (kit.openings.length * kit.observations.length * kit.scenes.length)) %
    kit.xiaohongshuAngles.length;
  const closingIndex =
    Math.floor(
      variantIndex /
        (kit.openings.length *
          kit.observations.length *
          kit.scenes.length *
          kit.xiaohongshuAngles.length)
    ) % kit.closings.length;

  const titles = [
    pick(kit.titleLeads, openingIndex + sceneIndex),
    pick(kit.titleSeconds, observationIndex + closingIndex),
    pick(kit.titleThirds, variantIndex + openingIndex + observationIndex)
  ];

  return {
    titles,
    body: [
      pick(kit.openings, openingIndex),
      pick(kit.observations, observationIndex),
      pick(kit.scenes, sceneIndex),
      pick(kit.xiaohongshuAngles, angleIndex),
      pick(kit.closings, closingIndex)
    ].join("\n\n"),
    tags: kit.tags,
    note: kit.note
  };
}

const topicCopyKits: Record<SoftSeedingTopic, TopicCopyKit> = {
  生活场景软种草: {
    titleLeads: [
      "真实的一天，鞋子要自然出现",
      "不是摆拍，是可以代入的日常",
      "这双鞋适合走进普通生活"
    ],
    titleSeconds: [
      "从出门到回家，状态要轻松一点",
      "小红书内容也可以不那么用力",
      "舒服、干净、体面，比抢眼更重要"
    ],
    titleThirds: [
      "THERUIZ AURA 的日常软种草",
      "一双鞋接住很多真实场景",
      "把产品放回她的一天里"
    ],
    openings: [
      "很多时候，真正让人想买一双鞋的，不是它被单独拍得多漂亮。",
      "日常穿搭里，鞋子最好不要抢走所有注意力。",
      "我更相信那些看起来可以马上穿出门的画面。",
      "好的软种草，应该先让人看见自己的一天。"
    ],
    observations: [
      "它要能出现在入户镜前、写字楼门口、咖啡店外，也能出现在周末慢走的路上。",
      "干净的鞋型、温和的颜色和真实的比例，会比夸张造型更有代入感。",
      "一双日常鞋的价值，是早上不用纠结，走到下午也不狼狈。",
      "画面越像真实朋友随手记录，产品反而越容易被相信。"
    ],
    scenes: [
      "她可以在出门前看一眼镜子，也可以在咖啡店门口停一下，鞋子始终自然、清楚、不过度表演。",
      "画面应该有低饱和城市日常感，有一点生活痕迹，但不杂乱。",
      "鞋子不是孤立的商品，而是白衬衫、牛仔、托特包和一天节奏里的连接点。",
      "人物状态要松弛、干净、成熟，像真实顾客而不是硬广模特。"
    ],
    xiaohongshuAngles: [
      "小红书语气要像真实穿搭笔记：先说一个生活痛点，再给出这双鞋为什么省心，不要像广告口播。",
      "内容要有可收藏价值：让用户知道这双鞋适合哪一天、哪套衣服、哪种出门节奏。",
      "表达重点放在代入感：她看完应该觉得这不是品牌在卖鞋，而是有人把日常穿法拍给她参考。",
      "少用夸张形容，多用具体细节：出门前、走路、坐下、回家后，鞋子都自然成立。"
    ],
    closings: [
      "这类内容的重点不是喊卖点，而是让人觉得：这双鞋我也会穿。",
      "THERUIZ AURA 的软种草，应该温和但有记忆点。",
      "把鞋放进生活里，才会有真正的购买理由。",
      "真实、舒服、体面，本身就是很强的内容价值。"
    ],
    tags: ["#THERUIZAURA", "#小红书穿搭", "#真实穿搭", "#德训鞋穿搭", "#一鞋多搭", "#轻熟日常", "#QuietWarmLuxury"],
    note: "生活场景软种草强调真实日常、穿着代入和低压力种草，不做夸张博主感。"
  },
  产品开发幕后: {
    titleLeads: [
      "一双鞋在上脚之前，还有很多细节",
      "产品开发幕后，不只是一张工作台",
      "把鞋子做安静，也需要很多判断"
    ],
    titleSeconds: [
      "从皮料、鞋带到色卡，都是品牌审美的一部分",
      "好看的日常鞋，背后是克制的取舍",
      "开发过程要真实，但不能变成工厂感"
    ],
    titleThirds: [
      "THERUIZ AURA 的幕后质感",
      "温感静奢不是堆出来的",
      "把开发过程拍得克制一点"
    ],
    openings: [
      "产品开发的内容，不一定要把所有过程都拍得很满。",
      "对 THERUIZ AURA 来说，幕后感更像一种安静的判断力。",
      "一双鞋最终看起来舒服，背后通常有很多不显眼的细节。",
      "我们更希望幕后画面是克制的、真实的，而不是刻意制造忙碌。"
    ],
    observations: [
      "皮料样、鞋带、色卡、护理刷、纸样和拍摄清单，都可以成为内容线索。",
      "开发幕后要有手作和真实触感，但避免凌乱、廉价或过度技术化。",
      "重点不是展示流程多复杂，而是让用户感受到品牌对颜色、材质和比例的在意。",
      "越是小品牌，越要把真实过程拍得有秩序、有审美。"
    ],
    scenes: [
      "材质工作台可以有轻微使用痕迹，但画面需要干净、低饱和、有留白。",
      "棚内拍摄可以看到灯架边缘、造型桌和鞋子局部，但不要变成杂乱花絮。",
      "产品静物需要让鞋型和材质被看清，同时保持 THERUIZ AURA 的温暖克制。",
      "工作台画面适合讲色彩、皮料、鞋带和开发笔记，不适合硬讲销量。"
    ],
    xiaohongshuAngles: [
      "小红书幕后内容要像一条有用的过程记录：讲清一个选择，而不是堆满流程。",
      "文案可以带一点主观判断，但要落在皮料、鞋带、色卡、样鞋调整这些看得见的细节上。",
      "不要把幕后写成品牌自夸，要让用户感到这双鞋的质感来自反复取舍。",
      "适合用“为什么这样选”的结构，让过程变成信任感，而不是冰冷说明。"
    ],
    closings: [
      "这些幕后内容的价值，是让用户知道一双日常鞋并不是随便做出来的。",
      "真实不等于粗糙，克制也不等于没有内容。",
      "把细节拍清楚，比把故事讲满更重要。",
      "幕后感要服务品牌信任，而不是制造复杂感。"
    ],
    tags: ["#THERUIZAURA", "#产品开发", "#材质故事", "#小品牌日常", "#鞋履设计", "#拍摄花絮", "#QuietWarmLuxury"],
    note: "产品开发幕后强调材料、色卡、拍摄准备和真实开发痕迹，但避免廉价工厂感。"
  },
  秋冬配色实验室: {
    titleLeads: [
      "秋冬鞋色，最好有一点温度",
      "咖色、燕麦色、暖米色，真的很适合秋冬",
      "秋冬配色实验室：把鞋子做得不冷"
    ],
    titleSeconds: [
      "不是越深越高级，而是比例和温度要对",
      "低饱和色彩，才更容易进入成熟衣柜",
      "一双鞋可以让厚衣服轻一点"
    ],
    titleThirds: [
      "THERUIZ AURA 的秋冬颜色逻辑",
      "把咖啡色调做得干净一点",
      "温感静奢的季节色卡"
    ],
    openings: [
      "秋冬穿搭很容易变沉，所以鞋子的颜色不能只追求安全。",
      "咖色、燕麦色、暖米色这些颜色，看起来安静，但很考验比例。",
      "如果鞋子太冷，秋冬衣服会显得硬；如果太深，又容易把人压住。",
      "秋冬配色不是把颜色做暗，而是让它更温和、更耐看。"
    ],
    observations: [
      "咖啡棕皮料、燕麦麂皮、暖米色色卡和低饱和灰调，可以一起建立季节氛围。",
      "这些颜色要服务真实穿搭：针织、大衣、牛仔、暖灰裤装和日常托特。",
      "秋冬鞋子的重点，是让厚衣服有呼吸感，而不是再增加重量。",
      "色卡内容可以很有审美，但仍要回到用户每天能穿的衣柜。"
    ],
    scenes: [
      "材质工作台适合呈现色卡、皮料和开发笔记，像一个克制的秋冬实验室。",
      "棚内静物适合看清鞋型、材质过渡和色彩关系。",
      "衣帽间和安静街角可以把色彩放回真实穿搭里。",
      "画面要温暖、低饱和、有触感，不要变成浓重复古或咖啡色堆叠。"
    ],
    xiaohongshuAngles: [
      "小红书配色内容要有“可参考”的判断：为什么这个颜色适合秋冬，为什么不会显沉。",
      "用衣柜语言解释色彩，不要只说高级；要说它如何搭大衣、针织、牛仔和暖灰裤装。",
      "可以像配色笔记一样写，但语气要轻，避免变成设计课或色彩理论。",
      "让用户看完能保存一条秋冬配色思路，而不是只记住一个色名。"
    ],
    closings: [
      "秋冬高级感，很多时候来自颜色分寸。",
      "一双温和的鞋，可以让整身秋冬穿搭轻一点。",
      "色彩实验最终要服务真实生活，而不是只服务画面。",
      "THERUIZ AURA 的秋冬色，应该安静但有温度。"
    ],
    tags: ["#THERUIZAURA", "#秋冬配色", "#咖色穿搭", "#燕麦色", "#材质色卡", "#低饱和穿搭", "#QuietWarmLuxury"],
    note: "秋冬配色实验室围绕咖啡棕、燕麦、暖米色和产品开发色卡做内容。"
  },
  穿搭解决方案: {
    titleLeads: [
      "不知道穿什么时，先把鞋选对",
      "一双鞋解决很多出门场景",
      "穿搭解决方案，不需要太复杂"
    ],
    titleSeconds: [
      "通勤、周末、旅行，都要能自然切换",
      "真正百搭，是降低早上的选择成本",
      "舒服和体面可以在同一套里出现"
    ],
    titleThirds: [
      "THERUIZ AURA 的一鞋多搭逻辑",
      "把日常穿搭变简单一点",
      "给成熟都市女性的省心搭配"
    ],
    openings: [
      "很多人的穿搭问题，不是衣服太少，而是早上不知道怎么把它们接起来。",
      "一双鞋如果足够稳定，就能减少很多搭配判断。",
      "穿搭解决方案不应该像公式，而应该像真实生活里的省心选择。",
      "鞋子最好能同时接住上班、周末和临时出门。"
    ],
    observations: [
      "白衬衫、针织、直筒裤、半裙、连衣裙和轻外套，都需要一双不抢风格的鞋。",
      "THERUIZ AURA 的重点不是把人打扮得很用力，而是让整个人看起来干净、体面、舒服。",
      "真正的百搭要看场景：办公室、咖啡馆、酒店房间和城市街角都能成立。",
      "如果鞋子让裤脚、裙摆和比例都变得清楚，整套搭配就更容易被参考。"
    ],
    scenes: [
      "入户镜前适合做完整穿搭记录，通勤路上适合证明它能走。",
      "咖啡馆内和酒店房间可以呈现轻松状态，不需要强行摆拍。",
      "衣帽间画面适合讲一鞋多搭，但不要像服装搭配教程。",
      "每张图都要让鞋子和穿着关系清楚，而不是只拍上半身氛围。"
    ],
    xiaohongshuAngles: [
      "穿搭解决方案要有明确问题：今天要上班、见人、走路、旅行，鞋子怎样帮她少纠结。",
      "文案要像真实搭配建议，不要像公式；给出一套能直接照着穿的参考。",
      "适合强调一鞋多搭，但每次只解决一个具体场景，不要一次讲太多。",
      "用“如果你也有这个场景”的语气，让内容更像笔记而不是导购页。"
    ],
    closings: [
      "穿搭解决方案的价值，是让用户少纠结一点。",
      "百搭不是没有风格，而是让很多场景都变自然。",
      "一双鞋如果能让人轻松出门，就已经很有内容价值。",
      "这类内容适合讲实用，但语气要保持温和。"
    ],
    tags: ["#THERUIZAURA", "#穿搭解决方案", "#一鞋多搭", "#通勤穿搭", "#小红书穿搭", "#轻熟穿搭", "#QuietWarmLuxury"],
    note: "穿搭解决方案围绕一鞋多搭、省心出门和场景切换做内容。"
  },
  材质工艺认知: {
    titleLeads: [
      "一双鞋的质感，先看这些细节",
      "材质工艺认知，不要讲得太硬",
      "好穿和好看，都藏在细节里"
    ],
    titleSeconds: [
      "鞋型、皮料、鞋带和走线，比口号更可信",
      "把工艺拍清楚，但不要变成说明书",
      "用户看得懂的细节，才有价值"
    ],
    titleThirds: [
      "THERUIZ AURA 的材质细节",
      "从触感理解一双日常鞋",
      "克制地讲清楚产品质感"
    ],
    openings: [
      "材质内容最怕讲得太专业，最后用户反而没有感觉。",
      "一双鞋的质感，可以从很小的地方看出来。",
      "工艺认知不一定要用很多术语，关键是让细节被看见。",
      "比起堆卖点，我更想把鞋型、皮料和做工拍清楚。"
    ],
    observations: [
      "鞋头弧度、鞋底厚度、鞋带粗细、走线位置和材质过渡，都影响上脚后的真实观感。",
      "当前鞋款默认使用猪皮内里；皮料和结构应该严格跟随所选产品参考，不默认编造其他内里材质。",
      "材质图要有真实触感，可以看到纹理、边缘和手部整理动作，但不能显得脏乱。",
      "用户不需要被教育太多，只需要看懂为什么这双鞋更日常、更耐穿、更舒服。"
    ],
    scenes: [
      "材质工作台适合展示皮料样、鞋带、色卡、护理刷和产品笔记。",
      "棚内静物适合看清鞋型、缝线和材质转换，不需要复杂道具。",
      "拍摄花絮可以出现手部整理鞋带或检查细节，但不要像工厂质检。",
      "非产品氛围图可以弱化产品，用材料和纸品建立品牌触感。"
    ],
    xiaohongshuAngles: [
      "材质工艺内容要像“用户能看懂的小知识”，不要使用过度专业或夸张承诺。",
      "每条笔记最好只讲一个细节：鞋头、鞋底、鞋带、走线、内里或材质过渡。",
      "表达要把细节和穿着感连接起来，让用户知道这个工艺为什么影响日常体验。",
      "保持客观克制，不要把材质写成玄学；看得见、摸得到、穿得到才有说服力。"
    ],
    closings: [
      "材质内容的目标，是建立信任，而不是制造距离。",
      "把真实细节讲清楚，用户自然会理解质感。",
      "好工艺不需要很大声，但需要被准确看见。",
      "THERUIZ AURA 的细节表达，要专业但不冰冷。"
    ],
    tags: ["#THERUIZAURA", "#材质工艺", "#鞋履细节", "#德训鞋", "#产品认知", "#材质故事", "#QuietWarmLuxury"],
    note: "材质工艺认知强调可理解的产品细节；当前鞋款默认使用猪皮内里，不默认编造其他内里材质。"
  },
  品牌审美观点: {
    titleLeads: [
      "我们喜欢的高级感，是安静的",
      "品牌审美，不该只停在好看",
      "THERUIZ AURA 想做的是温感静奢"
    ],
    titleSeconds: [
      "干净但不冷，女性但不甜腻",
      "低饱和、真实生活和克制的体面",
      "不是网红感，而是日常里的审美判断"
    ],
    titleThirds: [
      "Quiet Warm Luxury 的内容表达",
      "把鞋子放进她的生活世界",
      "成熟都市女性的审美选择"
    ],
    openings: [
      "品牌审美观点不是一句口号，而是每张图都要守住的气质。",
      "THERUIZ AURA 不想把日常鞋拍成冷冰冰的商品。",
      "我们喜欢干净的画面，但不喜欢冷感和距离感。",
      "真正耐看的品牌内容，应该让人感到温和、克制、真实。"
    ],
    observations: [
      "奶油白、米灰、浅石色、自然光和低饱和，是为了让画面有呼吸感。",
      "人物可以出现，但不需要强表演；产品可以出现，但不需要硬推销。",
      "品牌审美要像她的一天、她的衣柜、她的桌面、她的城市，而不只是我们的工作台。",
      "越是观点内容，越要避免空泛高级词，最好落在真实生活和选择逻辑里。"
    ],
    scenes: [
      "窗边阅读角、美术馆、书店门口和衣帽间都适合表达审美观点。",
      "材质工作台可以作为其中一类，但不能让品牌内容全部变成内部过程。",
      "城市街角和安静街区能让观点落地到真实生活。",
      "产品露出应该更弱、更自然，像生活审美的一部分。"
    ],
    xiaohongshuAngles: [
      "品牌审美观点要像一条温和的价值判断：为什么我们选择克制、低饱和和真实生活。",
      "少说宏大口号，多说她的一天、她的衣柜、她的桌面和她的城市。",
      "观点内容可以弱化产品，但不能离开 THERUIZ AURA 的温感静奢和成熟都市女性语境。",
      "语气要有审美立场，但不要高高在上；像朋友分享一个长期坚持的选择。"
    ],
    closings: [
      "品牌审美最终要让用户相信：这不是随便一双鞋。",
      "高级感不需要很用力，稳定的审美反而更重要。",
      "内容越安静，越要有清楚的品牌判断。",
      "THERUIZ AURA 的观点，是让日常变得更体面，而不是更复杂。"
    ],
    tags: ["#THERUIZAURA", "#品牌审美", "#温感静奢", "#QuietWarmLuxury", "#低饱和美学", "#真实生活", "#轻熟审美"],
    note: "品牌审美观点强调 Quiet Warm Luxury、生活世界和弱产品露出，避免硬广。"
  },
  上新活动转化: {
    titleLeads: [
      "上新内容，也可以不那么硬",
      "新鞋上线前，先把穿着场景讲清楚",
      "活动转化不是大喊折扣"
    ],
    titleSeconds: [
      "让用户看见鞋型、颜色和真实穿法",
      "产品要清楚，但语气仍然克制",
      "从静物到上脚，建立购买判断"
    ],
    titleThirds: [
      "THERUIZ AURA 的上新内容逻辑",
      "适合小红书的温和转化",
      "把新品拍得清楚，也拍得真实"
    ],
    openings: [
      "上新活动内容不一定要把情绪拉得很满。",
      "用户真正需要的，是看清鞋型、颜色、上脚比例和能不能搭进自己的生活。",
      "转化内容可以更直接一点，但仍然要保持 THERUIZ AURA 的克制。",
      "如果一组图能同时讲清产品和场景，购买理由会自然很多。"
    ],
    observations: [
      "棚内静物负责把鞋拍清楚，镜前穿搭负责给搭配参考，生活场景负责证明它能日常穿。",
      "活动内容要避免过度促销语，更适合用上新节奏、试穿感和真实使用场景建立行动感。",
      "鞋子必须是清楚的，但画面不能像传统电商详情页那么僵。",
      "从材质细节、完整上脚到城市生活，用户需要连续的判断依据。"
    ],
    scenes: [
      "棚内上新拍摄适合作为第一张，干净、克制、产品可读。",
      "入户镜前和写字楼门口适合补充上脚与穿搭比例。",
      "城市街角可以呈现真实外出状态，拍摄花絮则增加品牌可信度。",
      "所有图都要低饱和、真实比例、鞋型准确，避免夸张广告感。"
    ],
    xiaohongshuAngles: [
      "上新转化内容要有清楚行动感，但不能硬卖；重点是让用户快速判断适不适合自己。",
      "文案适合用“这次上新主要看什么”的结构：鞋型、颜色、上脚比例、可搭场景。",
      "不要堆促销词，更多给试穿依据和购买前判断，降低用户决策成本。",
      "活动感要轻：可以提醒上新节奏，但仍然保持 THERUIZ AURA 的安静和克制。"
    ],
    closings: [
      "好的上新内容，是让用户更快判断这双鞋适不适合自己。",
      "转化可以明确，但不要破坏品牌气质。",
      "把产品拍清楚，把穿法讲自然，就已经足够有说服力。",
      "THERUIZ AURA 的上新，应该是安静但有效的。"
    ],
    tags: ["#THERUIZAURA", "#上新", "#新品试穿", "#德训鞋", "#小红书种草", "#一鞋多搭", "#QuietWarmLuxury"],
    note: "上新活动转化围绕产品可读、上脚参考和温和行动感，不做硬卖货。"
  }
};

const topicImageDrafts: Record<SoftSeedingTopic, SoftSeedingImageDraft[]> = {
  生活场景软种草: [
    { name: "图1｜封面｜入户镜前", purpose: "建立真实顾客感和完整穿搭代入。", description: "入户镜前自然记录，鞋子完整清楚。", imageType: "对镜穿搭图", scenePreference: "入户镜前", garmentTypePreference: "裤装", extraRequirement: "Use a real entryway mirror outfit record before leaving home. Keep the face softly hidden by the phone, the styling clean and wearable, and both sneakers clearly readable." },
    { name: "图2｜工作日｜写字楼门口", purpose: "把产品放进成熟都市女性的工作日。", description: "写字楼门口自然走路，像朋友随手拍。", imageType: "生活场景图", scenePreference: "写字楼门口", garmentTypePreference: "裤装", extraRequirement: "Show a refined office entrance moment with a quiet daily city rhythm, natural walking posture, a simple tote or coffee, and clear sneaker visibility without campaign posing." },
    { name: "图3｜周末｜咖啡店门口", purpose: "增加小红书生活方式代入。", description: "咖啡店门口轻松停留，低饱和真实街景。", imageType: "生活场景图", scenePreference: "咖啡店门口", garmentTypePreference: "裤装", extraRequirement: "Use a restrained cafe exterior in a real city street, natural daylight, low-saturation styling, and a candid customer-like moment with readable shoes." },
    { name: "图4｜生活｜书店门口", purpose: "让内容更安静，有审美选择感。", description: "书店或杂志店门口，轻松不营业。", imageType: "生活场景图", scenePreference: "书店 / 杂志店门口", garmentTypePreference: "裤装", extraRequirement: "Place her near a quiet bookstore or magazine shop exterior, carrying a book or tote, calm side gaze or soft casual eye contact, with the sneakers naturally part of the daily styling." },
    { name: "图5｜旅行｜酒店房间", purpose: "补充短途旅行与出门前场景。", description: "酒店房间镜前或床边，秩序感强。", imageType: "对镜穿搭图", scenePreference: "酒店房间", garmentTypePreference: "裤装", extraRequirement: "Use a calm hotel room mirror outfit record with a tidy suitcase corner and warm neutral light. Keep the mood organized, quiet, and refined, not tourist-like or influencer-like." }
  ],
  产品开发幕后: [
    { name: "图1｜材质｜工作台", purpose: "呈现真实开发触感。", description: "皮料、鞋带、色卡和产品笔记克制摆放。", imageType: "拍摄花絮 / 材质图", scenePreference: "材质工作台", garmentTypePreference: "自动匹配", extraRequirement: "Create a tactile material development table with leather swatches, suede samples, shoelaces, neutral color cards, care brush, and product notes on warm stone or linen. Keep it real, restrained, and organized." },
    { name: "图2｜现场｜拍摄花絮", purpose: "让品牌过程可信但不杂乱。", description: "灯架边缘、造型桌、手部整理细节。", imageType: "拍摄花絮 / 材质图", scenePreference: "拍摄花絮", garmentTypePreference: "自动匹配", extraRequirement: "Show a quiet behind-the-scenes styling moment with a light stand edge, camera monitor, paper shot list, wardrobe pieces, and hands arranging product details. Avoid chaotic studio clutter." },
    { name: "图3｜上新｜棚内静物", purpose: "把产品结构拍清楚。", description: "棚内克制静物，产品为主。", imageType: "产品静物图", scenePreference: "棚内上新拍摄", garmentTypePreference: "自动匹配", extraRequirement: "Use a clean studio launch still life with minimal props, soft neutral shadow, sharp material texture, visible stitching, laces, panel transitions, and accurate shoe structure." },
    { name: "图4｜整理｜桌边", purpose: "增加小品牌真实工作秩序。", description: "工作台边整理色卡与纸样，不做硬广。", imageType: "非产品氛围图", scenePreference: "工作台 / 桌边整理", garmentTypePreference: "自动匹配", extraRequirement: "Create a refined desk-side organizing scene with product notes, color cards, fabric pieces, and a neutral cup. The mood should feel like quiet brand work, not a direct product advertisement." },
    { name: "图5｜细节｜鞋带与皮料", purpose: "补充可复制的材质认知图。", description: "鞋带、皮料边缘、护理刷和局部鞋身。", imageType: "拍摄花絮 / 材质图", scenePreference: "材质工作台", garmentTypePreference: "自动匹配", extraRequirement: "Focus on shoelaces, leather edge, suede texture, care brush, and a subtle partial sneaker detail. Keep the scene tactile, premium, and believable." }
  ],
  秋冬配色实验室: [
    { name: "图1｜色卡｜材质工作台", purpose: "建立秋冬配色实验室的主视觉。", description: "咖啡棕、燕麦、暖米色色卡与皮料样。", imageType: "拍摄花絮 / 材质图", scenePreference: "材质工作台", garmentTypePreference: "自动匹配", season: "秋", extraRequirement: "Use coffee brown leather swatches, oatmeal suede samples, warm beige color cards, muted autumn palette, Pantone-like color chips, product development notes, and calm negative space." },
    { name: "图2｜产品｜棚内上新", purpose: "把秋冬色彩落到鞋型和材质。", description: "棚内静物，低饱和暖调。", imageType: "产品静物图", scenePreference: "棚内上新拍摄", garmentTypePreference: "自动匹配", season: "秋", extraRequirement: "Create a clean studio still life emphasizing muted autumn color relationship, warm neutral surface, accurate sneaker silhouette, and tactile leather or suede texture." },
    { name: "图3｜衣柜｜更衣角", purpose: "把色卡放回成熟衣柜。", description: "衣帽间里有针织、大衣、暖色衣物线索。", imageType: "非产品氛围图", scenePreference: "衣帽间 / 更衣角", garmentTypePreference: "自动匹配", season: "秋", extraRequirement: "Show a quiet wardrobe corner with oatmeal knitwear, warm beige outerwear, muted color cards, and clean fabric layers. Product presence should be subtle, not a direct sales shot." },
    { name: "图4｜街角｜秋冬生活", purpose: "验证秋冬配色能穿出去。", description: "安静街区，暖灰或咖色层次。", imageType: "生活场景图", scenePreference: "城市街角 / 安静街区", garmentTypePreference: "裤装", season: "秋", extraRequirement: "Use a quiet autumn city corner with warm grey, oatmeal, and coffee-tone styling. Keep the outfit layered but not heavy, with the sneakers clearly grounding the look." },
    { name: "图5｜桌边｜配色笔记", purpose: "作为图文尾图，讲配色逻辑。", description: "色卡、笔记、皮料样，像真实开发记录。", imageType: "拍摄花絮 / 材质图", scenePreference: "工作台 / 桌边整理", garmentTypePreference: "自动匹配", season: "秋", extraRequirement: "Create a refined color-study desk with muted autumn chips, handwritten development notes, leather and suede samples, and warm daylight. Avoid decorative moodboard clutter." }
  ],
  穿搭解决方案: [
    { name: "图1｜封面｜入户镜前", purpose: "直接给用户完整穿搭参考。", description: "入户镜前完整比例，鞋子清楚。", imageType: "对镜穿搭图", scenePreference: "入户镜前", garmentTypePreference: "裤装", extraRequirement: "Create a clean entryway mirror outfit solution. The full figure and sneakers should be readable, styling easy to reference, with a mature understated daily look." },
    { name: "图2｜衣柜｜居家衣帽间", purpose: "讲一鞋多搭的选择过程。", description: "衣柜边准备出门，衣物层次清楚。", imageType: "对镜穿搭图", scenePreference: "居家衣帽间", garmentTypePreference: "裙装", extraRequirement: "Use a quiet wardrobe mirror moment showing a refined skirt-based styling option with clear sneaker relationship, soft neutral layers, and no influencer selfie energy." },
    { name: "图3｜通勤｜上脚图", purpose: "证明搭配可以真实走路。", description: "通勤上脚，小步幅自然行走。", imageType: "产品上脚图", scenePreference: "通勤上班", garmentTypePreference: "裤装", extraRequirement: "Generate a refined on-foot commute solution with safe small walking step, clean trouser break, realistic shoe scale, and strong product readability." },
    { name: "图4｜午间｜咖啡馆内", purpose: "展示轻松半商务场景。", description: "咖啡馆内坐姿或站姿，衣着有参考价值。", imageType: "生活场景图", scenePreference: "咖啡馆内", garmentTypePreference: "裤装", extraRequirement: "Use a quiet cafe interior lunch moment, polished but relaxed styling, natural hand placement, and sneakers clearly visible without making the scene look staged." },
    { name: "图5｜旅行｜酒店房间", purpose: "补充出差/短途旅行穿搭方案。", description: "酒店房间镜前记录，行李整齐。", imageType: "对镜穿搭图", scenePreference: "酒店房间", garmentTypePreference: "连衣裙", extraRequirement: "Create a hotel-room mirror styling solution with a refined one-piece dress, subtle travel context, tidy suitcase corner, and sneakers clearly supporting the outfit." }
  ],
  材质工艺认知: [
    { name: "图1｜结构｜材质工作台", purpose: "讲鞋型与材质细节。", description: "鞋头、鞋带、走线、皮料样同框。", imageType: "拍摄花絮 / 材质图", scenePreference: "材质工作台", garmentTypePreference: "自动匹配", extraRequirement: "Show a precise material table with toe shape reference, shoelaces, stitching samples, leather or suede swatches, and product notes. Use pigskin lining if lining is visible or relevant; do not invent a different lining." },
    { name: "图2｜静物｜棚内细节", purpose: "让工艺细节更清楚。", description: "棚内干净特写，材质和缝线锐利。", imageType: "产品静物图", scenePreference: "棚内上新拍摄", garmentTypePreference: "自动匹配", extraRequirement: "Use a clean studio material detail still life focusing on stitching, laces, tongue, panel transitions, outsole edge, and real material texture. Keep the product structurally accurate." },
    { name: "图3｜幕后｜拍摄花絮", purpose: "用手部整理表达真实工艺感。", description: "手部整理鞋带或检查鞋身。", imageType: "拍摄花絮 / 材质图", scenePreference: "拍摄花絮", garmentTypePreference: "自动匹配", extraRequirement: "Show refined hands gently arranging laces or checking stitching near the product. Keep hand structure natural and avoid messy studio clutter or factory inspection mood." },
    { name: "图4｜认知｜桌边整理", purpose: "做非产品氛围辅助图。", description: "材质卡、纸品、笔记和护理工具。", imageType: "非产品氛围图", scenePreference: "工作台 / 桌边整理", garmentTypePreference: "自动匹配", extraRequirement: "Create a non-product craft cognition atmosphere with material cards, care brush, thread, paper notes, and warm daylight. The shoe can be absent or only a subtle partial detail." },
    { name: "图5｜产品｜材质局部", purpose: "补一张可用于详情页的局部图。", description: "鞋身局部、鞋带、材质过渡清楚。", imageType: "产品静物图", scenePreference: "材质工作台", garmentTypePreference: "自动匹配", extraRequirement: "Create a refined product material close detail showing accurate panel structure, lace thickness, stitching, material transition, and clean outsole line without glossy fake texture." }
  ],
  品牌审美观点: [
    { name: "图1｜观点｜窗边阅读角", purpose: "弱产品露出，建立生活审美。", description: "窗边阅读、杯子、布料和留白。", imageType: "非产品氛围图", scenePreference: "窗边阅读角", garmentTypePreference: "自动匹配", extraRequirement: "Create a quiet window-side reading atmosphere with a book, cup, linen curtain, soft daylight, and calm negative space. Product exposure should be weak or absent." },
    { name: "图2｜空间｜美术馆", purpose: "表达审美选择而非卖货。", description: "美术馆或展览空间，人物安静。", imageType: "生活场景图", scenePreference: "美术馆", garmentTypePreference: "裤装", extraRequirement: "Use a restrained gallery or museum moment with refined urban styling, natural posture, and subtle product presence. The mood should be cultured, quiet, and not performative." },
    { name: "图3｜衣柜｜更衣角", purpose: "让品牌观点回到她的衣柜。", description: "衣帽间里的克制搭配和镜前记录。", imageType: "对镜穿搭图", scenePreference: "衣帽间 / 更衣角", garmentTypePreference: "裤装", extraRequirement: "Create a quiet wardrobe mirror record showing mature clean styling, soft layers, and understated personal taste. Keep the shoes visible but not aggressively sold." },
    { name: "图4｜城市｜书店门口", purpose: "把审美放进她的城市。", description: "书店或杂志店门口，日常而有审美。", imageType: "生活场景图", scenePreference: "书店 / 杂志店门口", garmentTypePreference: "裙装", extraRequirement: "Use a quiet bookstore or magazine shop exterior with mature refined styling, soft city daylight, and product presence as part of the full look rather than a hard product focus." },
    { name: "图5｜触感｜材质工作台", purpose: "用材质建立品牌触感。", description: "纸品、色卡、皮料和局部产品。", imageType: "产品静物图", scenePreference: "材质工作台", garmentTypePreference: "自动匹配", extraRequirement: "Create a restrained tactile still life with paper goods, color cards, leather swatches, and subtle sneaker detail. Keep it warm, minimal, and brand-consistent." }
  ],
  上新活动转化: [
    { name: "图1｜主图｜棚内上新", purpose: "第一张负责产品可读和上新质感。", description: "棚内干净静物，鞋型准确。", imageType: "产品静物图", scenePreference: "棚内上新拍摄", garmentTypePreference: "自动匹配", extraRequirement: "Create a clean launch still life with the sneaker as the absolute subject, minimal restrained props, premium tailoring-adjacent styling cues, accurate shoe shape, and soft studio light." },
    { name: "图2｜上脚｜入户镜前", purpose: "让用户看到真实上脚和穿搭比例。", description: "镜前完整穿搭记录，鞋子完整露出。", imageType: "对镜穿搭图", scenePreference: "入户镜前", garmentTypePreference: "裤装", extraRequirement: "Use an entryway mirror try-on record for a new launch, face softly hidden, outfit clean and easy to reference, at least one sneaker fully visible and the second clearly readable." },
    { name: "图3｜通勤｜写字楼门口", purpose: "证明新品可以进入工作日。", description: "写字楼门口自然走路，产品清楚。", imageType: "产品上脚图", scenePreference: "写字楼门口", garmentTypePreference: "裤装", extraRequirement: "Generate a refined on-foot launch image outside an office entrance, small natural step, realistic shoe scale, clean trouser break, and strong product readability." },
    { name: "图4｜生活｜安静街区", purpose: "补充非硬广生活场景。", description: "城市街角轻松停留，低饱和真实街景。", imageType: "生活场景图", scenePreference: "城市街角 / 安静街区", garmentTypePreference: "裙装", extraRequirement: "Use a quiet real city corner as a lifestyle launch support image, mature refined styling, subtle movement, and clear shoe visibility without sales-poster energy." },
    { name: "图5｜幕后｜拍摄花絮", purpose: "上新收尾，增加可信过程。", description: "拍摄现场局部，整理鞋带或造型桌。", imageType: "拍摄花絮 / 材质图", scenePreference: "拍摄花絮", garmentTypePreference: "自动匹配", extraRequirement: "Show a calm launch shooting behind-the-scenes detail with styling table, shot list, hands arranging laces or product angle, minimal equipment cues, and quiet premium order." }
  ]
};

const topicImageGuides: Record<SoftSeedingTopic, string> = {
  生活场景软种草:
    "Xiaohongshu content cue: make the image feel like a useful real-life outfit note, candid, saveable, and easy to imagine wearing; avoid hard-sell framing, staged influencer energy, or commercial poster mood.",
  产品开发幕后:
    "Xiaohongshu content cue: show a believable small-brand development process with tactile decisions, useful detail, quiet order, and real working traces; avoid factory feeling, corporate brochure mood, or decorative fake process.",
  秋冬配色实验室:
    "Xiaohongshu content cue: make the image work as a saveable autumn-winter color reference with coffee brown, oatmeal, warm beige, muted grey, color chips, swatches, and wardrobe logic; avoid heavy retro styling or random moodboard clutter.",
  穿搭解决方案:
    "Xiaohongshu content cue: make the image answer a practical styling question with clear outfit proportions, clear sneaker relationship, and an easy-to-copy daily look; avoid formulaic fashion tutorial feeling or over-styled posing.",
  材质工艺认知:
    "Xiaohongshu content cue: make the image support user-friendly material education through one clear detail at a time, such as toe shape, outsole, stitching, laces, lining, leather texture, or panel transition; avoid technical catalog mood or exaggerated claims.",
  品牌审美观点:
    "Xiaohongshu content cue: make the image express THERUIZ AURA's aesthetic point of view through her day, wardrobe, desk, city, and quiet choices; product exposure should be subtle, atmospheric, and never hard-selling.",
  上新活动转化:
    "Xiaohongshu content cue: keep launch content soft but action-oriented, with readable product shape, color, on-foot proportion, and styling reason; avoid loud promotion, discount-poster feeling, or forced urgency."
};

function resolveBaseSeason(baseSeason: TeamSeason, overrideSeason?: TeamSeason) {
  return overrideSeason ?? baseSeason;
}

function resolveBaseShoe(baseParams: TeamPromptParams): Pick<TeamPromptParams, "shoe" | "customShoe"> {
  return {
    shoe: baseParams.shoe,
    customShoe: baseParams.shoe === "自定义" ? baseParams.customShoe : ""
  };
}

function shouldInheritBaseGarmentType(imageType: TeamImageType) {
  return imageType === "产品上脚图" || imageType === "对镜穿搭图" || imageType === "生活场景图";
}

function resolveSoftSeedingGarmentType(baseParams: TeamPromptParams, draft: SoftSeedingImageDraft) {
  if (baseParams.garmentTypePreference !== "自动匹配" && shouldInheritBaseGarmentType(draft.imageType)) {
    return baseParams.garmentTypePreference;
  }

  return draft.garmentTypePreference;
}

const garmentTypeReplacementText: Record<Exclude<TeamGarmentTypePreference, "自动匹配">, string> = {
  裤装: "refined trousers or denim",
  裙装: "a refined skirt",
  短裤: "refined tailored shorts",
  连衣裙: "a refined one-piece dress",
  轻运动: "refined light activewear"
};

const garmentTypeControlLines: Record<Exclude<TeamGarmentTypePreference, "自动匹配">, string> = {
  裤装:
    "Manual clothing type from the interface: use refined trousers or denim as the primary clothing category, with clear sneaker visibility.",
  裙装:
    "Manual clothing type from the interface: use a refined skirt as the primary clothing category, with mature proportions and clear sneaker visibility.",
  短裤:
    "Manual clothing type from the interface: use refined tailored shorts or Bermuda shorts as the primary clothing category, with mature proportions and clear sneaker visibility.",
  连衣裙:
    "Manual clothing type from the interface: use a refined one-piece dress as the primary clothing category, with mature proportions and clear sneaker visibility.",
  轻运动:
    "Manual clothing type from the interface: use refined light activewear as the primary clothing category, with calm premium movement styling and clear sneaker visibility."
};

function sanitizeSoftSeedingExtraRequirementForGarment(
  extraRequirement: string,
  garmentTypePreference: TeamGarmentTypePreference
) {
  if (garmentTypePreference === "自动匹配" || garmentTypePreference === "裤装") return extraRequirement;

  const replacement = garmentTypeReplacementText[garmentTypePreference];

  return extraRequirement
    .replace(
      /\b(?:warm beige|oatmeal|warm grey|cream|ivory|light|dark|charcoal|taupe|soft|straight-leg|straight|wide-leg|tailored|relaxed|wool|linen|cotton|structured|pale|stone|beige)\s+(?:straight-leg\s+)?(?:trousers|pants|denim|jeans)\b/gi,
      replacement
    )
    .replace(/\b(?:straight-leg\s+)?(?:trousers|pants|denim|jeans)\b/gi, replacement)
    .replace(/\s{2,}/g, " ")
    .trim();
}

function getSoftSeedingExtraRequirement(
  baseParams: TeamPromptParams,
  draft: SoftSeedingImageDraft,
  garmentTypePreference: TeamGarmentTypePreference,
  topic: SoftSeedingTopic
) {
  const themeGuide = topicImageGuides[topic];

  if (baseParams.garmentTypePreference === "自动匹配" || !shouldInheritBaseGarmentType(draft.imageType)) {
    return [draft.extraRequirement, themeGuide].filter(Boolean).join(" ");
  }

  const sanitizedRequirement = sanitizeSoftSeedingExtraRequirementForGarment(
    draft.extraRequirement,
    garmentTypePreference
  );
  const manualControlLine =
    garmentTypePreference === "自动匹配" ? "" : garmentTypeControlLines[garmentTypePreference];

  return [sanitizedRequirement, manualControlLine, themeGuide].filter(Boolean).join(" ");
}

function buildImagePlan(
  baseParams: TeamPromptParams,
  draft: SoftSeedingImageDraft,
  index: number,
  topic: SoftSeedingTopic
): SoftSeedingImagePlan {
  const shoeFields = resolveBaseShoe(baseParams);
  const garmentTypePreference = resolveSoftSeedingGarmentType(baseParams, draft);
  const params: TeamPromptParams = {
    ...baseParams,
    ...shoeFields,
    imageType: draft.imageType,
    scenePreference: draft.scenePreference,
    garmentTypePreference,
    season: resolveBaseSeason(baseParams.season, draft.season),
    modelChoice: "30–45岁客户画像模特",
    modelContinuity: index === 0 ? "新人物" : "延续上一组人物",
    studioLaunchAnglePreference: "自动匹配",
    stillLifeStyle: "与主视觉统一",
    extraRequirement: getSoftSeedingExtraRequirement(baseParams, draft, garmentTypePreference, topic),
    generationNonce: baseParams.generationNonce + index + 1
  };

  return {
    name: draft.name,
    purpose: draft.purpose,
    description: draft.description,
    params,
    prompt: generateTeamPrompt(params).prompt
  };
}

export function generateSoftSeedingContent(input: SoftSeedingInput): SoftSeedingContent {
  const mode = input.mode ?? "今日自动";
  const dailySlot = resolveDailySlot(input.dailySlot);
  const dailySelection = getDailySoftSeedingSelection(input.date, dailySlot);
  const topic = mode === "今日自动" ? dailySelection.topic : input.topic ?? dailySelection.topic;
  const variantCount = getTopicVariantCount(topic);
  const manualPostIndex = getDayNumber(input.date) * DAILY_POST_COUNT + (dailySlot - 1);
  const variantIndex = mode === "今日自动" ? dailySelection.variantIndex : manualPostIndex % variantCount;
  const copy = buildCopyFromKit(topic, variantIndex);
  const imageCount = input.imageCount ?? 5;

  return {
    topic,
    dateKey: dailySelection.dateKey,
    dailySlot,
    variantIndex,
    variantCount,
    variantLabel: `第 ${variantIndex + 1} / ${variantCount} 版`,
    titles: copy.titles,
    body: copy.body,
    images: topicImageDrafts[topic]
      .slice(0, imageCount)
      .map((imageDraft, index) => buildImagePlan(input.baseParams, imageDraft, index, topic)),
    tags: copy.tags,
    note: copy.note
  };
}

export function getShoeDisplayName(shoe: TeamShoe, customShoe: string) {
  if (shoe !== "自定义") return shoe;
  return customShoe.trim() || "自定义鞋款";
}

export function formatSoftSeedingContent(content: SoftSeedingContent) {
  return [
    `# THERUIZ AURA 小红书内容｜${content.dateKey}｜第 ${content.dailySlot} 篇｜${content.topic}｜${content.variantLabel}`,
    "",
    "## 标题",
    ...content.titles.map((title, index) => `${index + 1}. ${title}`),
    "",
    "## 正文",
    content.body,
    "",
    "## 配图与 Image 2.0 提示词",
    ...content.images.flatMap((image, index) => [
      `### ${index + 1}. ${image.name}`,
      `配图建议：${image.description}`,
      `用途：${image.purpose}`,
      `参数：${image.params.imageType} / ${image.params.scenePreference} / ${image.params.season} / ${image.params.garmentTypePreference} / ${getShoeDisplayName(image.params.shoe, image.params.customShoe)}`,
      "",
      image.prompt,
      ""
    ]),
    "## 标签",
    content.tags.join(" "),
    "",
    "## 内容逻辑",
    content.note
  ].join("\n");
}

export function formatSoftSeedingImagePrompts(content: SoftSeedingContent) {
  return content.images
    .map((image, index) => [`Image ${index + 1}:`, image.prompt.trim()].join("\n"))
    .join("\n\n");
}
