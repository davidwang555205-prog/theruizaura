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
  variantOffset?: number;
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

type ReaderBodyKit = {
  openers: string[];
  observations: string[];
  sceneNotes: string[];
  personalAngles: string[];
  closings: string[];
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
  const kit = getExpandedCopyKit(topic);
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
  const kit = getExpandedCopyKit(topic);
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
  ].map(softenTitle);

  const body = buildReaderFacingBody(topic, variantIndex);

  return {
    titles,
    body,
    tags: kit.tags,
    note: kit.note
  };
}

function mergeCopyLines(base: string[], extra?: string[]) {
  return [...base, ...(extra ?? [])];
}

function getExpandedCopyKit(topic: SoftSeedingTopic): TopicCopyKit {
  const base = topicCopyKits[topic];
  const extra = topicCopyKitEnhancements[topic] ?? {};

  return {
    ...base,
    titleLeads: mergeCopyLines(base.titleLeads, extra.titleLeads),
    titleSeconds: mergeCopyLines(base.titleSeconds, extra.titleSeconds),
    titleThirds: mergeCopyLines(base.titleThirds, extra.titleThirds),
    openings: mergeCopyLines(base.openings, extra.openings),
    observations: mergeCopyLines(base.observations, extra.observations),
    scenes: mergeCopyLines(base.scenes, extra.scenes),
    xiaohongshuAngles: mergeCopyLines(base.xiaohongshuAngles, extra.xiaohongshuAngles),
    closings: mergeCopyLines(base.closings, extra.closings)
  };
}

function buildReaderFacingBody(topic: SoftSeedingTopic, variantIndex: number) {
  const kit = readerBodyKits[topic];
  const opener = pick(kit.openers, variantIndex);
  const observation = pick(kit.observations, Math.floor(variantIndex / kit.openers.length));
  const sceneNote = pick(
    kit.sceneNotes,
    Math.floor(variantIndex / (kit.openers.length * kit.observations.length))
  );
  const personalAngle = pick(
    kit.personalAngles,
    Math.floor(variantIndex / (kit.openers.length * kit.observations.length * kit.sceneNotes.length))
  );
  const closing = pick(
    kit.closings,
    Math.floor(
      variantIndex /
        (kit.openers.length * kit.observations.length * kit.sceneNotes.length * kit.personalAngles.length)
    )
  );
  const variants = [
    [opener, observation, sceneNote, personalAngle, closing],
    [opener, `${sceneNote}\n${observation}`, personalAngle, closing],
    [opener, observation, `${personalAngle}\n${sceneNote}`, closing],
    [opener, `${observation}\n${personalAngle}`, sceneNote, closing],
    [opener, sceneNote, observation, closing]
  ];

  return reduceRepeatedBodyIdeas(variants[variantIndex % variants.length].map(softenBodyText).join("\n\n"));
}

function softenTitle(title: string) {
  return title
    .replace(/转化/g, "上新")
    .replace(/内容逻辑/g, "内容思路")
    .replace(/品牌审美观点/g, "品牌审美")
    .replace(/购买判断/g, "下单前判断")
    .trim();
}

function softenBodyText(text: string) {
  return text
    .replace(/内容价值/g, "参考意义")
    .replace(/购买理由/g, "判断理由")
    .replace(/转化内容/g, "上新内容")
    .replace(/转化/g, "上新")
    .replace(/硬广/g, "广告感")
    .replace(/用户/g, "大家")
    .replace(/品牌审美观点/g, "品牌审美")
    .replace(/内容线索/g, "画面线索")
    .replace(/这类内容的重点不是喊卖点，而是让人觉得：这双鞋我也会穿。/g, "我希望看完之后只是很自然地觉得：这双鞋我也会穿。")
    .replace(/THERUIZ AURA 的软种草，应该温和但有记忆点。/g, "这种记忆点最好轻一点，像日常里慢慢留下来的。")
    .replace(/材质内容的目标，是建立信任，而不是制造距离。/g, "材质讲得越清楚，距离感反而越少。")
    .replace(/穿搭解决方案的价值，是让大家少纠结一点。/g, "对我来说，它最好能让早上少纠结一点。")
    .replace(/品牌审美最终要让大家相信：这不是随便一双鞋。/g, "看久一点，会知道它不是随便一双日常鞋。")
    .replace(/好的上新内容，是让大家更快判断这双鞋适不适合自己。/g, "好的上新笔记，是让人更快判断它适不适合自己。")
    .replace(
      /当前鞋款默认使用猪皮内里；如果画面拍到内里，就要保持真实，不要把材质写得很花。/g,
      "如果画面拍到内里，材质表达要保持真实，不要写得很花。"
    )
    .trim();
}

function reduceRepeatedBodyIdeas(body: string) {
  if (body.includes("猪皮内里") && body.includes("如果画面拍到内里，材质表达要保持真实，不要写得很花。")) {
    return body
      .replace(/\n\n如果画面拍到内里，材质表达要保持真实，不要写得很花。/g, "")
      .replace(/如果画面拍到内里，材质表达要保持真实，不要写得很花。\n\n/g, "");
  }

  return body;
}

const readerBodyKits: Record<SoftSeedingTopic, ReaderBodyKit> = {
  生活场景软种草: {
    openers: [
      "我现在越来越喜欢那种不太用力的上脚图。",
      "真正会让我停下来看的，通常不是很满的商品照。",
      "一双日常鞋好不好穿，其实放进普通一天里最容易看出来。",
      "如果一张图能让我想到明天怎么穿，它就已经有用。"
    ],
    observations: [
      "它不需要把整个人变得很特别，只要让白衬衫、牛仔、针织和托特包之间更顺一点。",
      "我会先看鞋子在走路、停下、坐下时还清不清楚，比例顺不顺。",
      "很多舒服感不是靠文字说出来的，而是看她出门时有没有那种松弛的秩序感。",
      "鞋子安静一点没关系，但不能弱到看不出它怎么接住整套穿着。"
    ],
    sceneNotes: [
      "咖啡店门口、写字楼外面、书店门口这种普通地方，反而比大场景更有代入感。",
      "有一点街道痕迹、有一点生活节奏，照片会比过度干净的背景更可信。",
      "她可能只是等咖啡、顺路买花，或者从门口走出来，鞋子在这些瞬间出现得最自然。",
      "一杯咖啡、一本书、一个包就够了，道具太多会把日常感冲淡。"
    ],
    personalAngles: [
      "我会把它当成衣柜里的连接项，而不是某一套造型的亮点。",
      "看完如果能想到自己的三件衣服，这篇就比单纯好看更有参考意义。",
      "轻熟日常最怕用力过度，干净、舒服、体面其实已经很难得。",
      "它最好像一个早上不用纠结的答案，不需要每次出门都重新搭。"
    ],
    closings: [
      "这种种草轻一点就好，让看到的人自己判断它能不能进自己的生活。",
      "能被自然穿出门，比一句卖点更有说服力。",
      "如果一双鞋能让早晨少纠结一点，就值得被认真记录。",
      "我希望它留下的是一种干净的日常感，而不是广告感。"
    ]
  },
  产品开发幕后: {
    openers: [
      "幕后内容我不想写成一份工作记录。",
      "有些取舍放在桌面上看，反而比解释很多更清楚。",
      "一双鞋最后看起来干净，通常是因为前面删掉了很多不必要的东西。",
      "我更喜欢能看见判断过程的幕后，而不是把桌面摆成展览。"
    ],
    observations: [
      "鞋带粗细、色卡深浅、皮料触感这些小地方，最后都会影响它是不是耐看。",
      "开发台面不用很满，几块皮料、一双样鞋、几张色卡就能看出性格。",
      "真实工作痕迹可以保留一点，但每个物件都要有理由。",
      "越是克制的产品，越能从比例、颜色和材质里看出取舍。"
    ],
    sceneNotes: [
      "我更愿意看到有秩序的工作台，而不是堆满材料的热闹感。",
      "手部整理鞋带或比对色卡的瞬间，会比整齐铺开的材料更像真实开发。",
      "棚拍边缘、造型桌和样鞋局部留一点就够了，主角仍然是这些细节本身。",
      "如果桌面太像展览，反而少了小品牌真实做产品的感觉。"
    ],
    personalAngles: [
      "这些内容不是为了显得专业，而是让人知道它为什么会长成现在这样。",
      "我会更相信能看见取舍的产品，而不是只靠氛围包装出来的产品。",
      "少一个颜色、少一个装饰，有时反而更接近日常耐看。",
      "细节讲轻一点，看到的人反而更容易相信。"
    ],
    closings: [
      "幕后感最好是安静的，有真实，也有秩序。",
      "有些细节不用大声说，但值得被看见。",
      "把过程拍得克制一点，产品反而更有质感。",
      "这种信任慢慢建立就好，不需要写得很满。"
    ]
  },
  秋冬配色实验室: {
    openers: [
      "秋冬我会先看鞋色有没有温度。",
      "咖色、燕麦色、暖米色这些颜色，看起来安静，但很考验分寸。",
      "秋冬鞋色不是越深越稳，有时太重反而会把整个人压住。",
      "我会把颜色放回衣柜里看，而不是只看单独静物。"
    ],
    observations: [
      "针织、牛仔、大衣和暖灰色裤装放在一起时，鞋子要能接住它们之间的过渡。",
      "咖色如果太红会显老，燕麦色如果太黄会显脏，灰度和温度都要刚好。",
      "一双秋冬鞋如果能让厚衣服轻一点，它的实穿价值会很高。",
      "低饱和不是没有颜色，而是让颜色更容易进入成熟衣柜。"
    ],
    sceneNotes: [
      "色卡旁边放一点针织、牛仔和浅色外套，会比单独摆材料更有真实参照。",
      "咖啡棕皮料、燕麦麂皮和暖米色色卡放在一起时，留白比堆满更重要。",
      "衣帽间和安静街角能看出这个颜色是不是真的能进入日常。",
      "我不想把秋冬拍得太浓，轻一点的暖意会更像 THERUIZ AURA。"
    ],
    personalAngles: [
      "我最在意的是：它能不能配我已经有的针织和外套。",
      "如果整身已经有重量，鞋子就要留一点呼吸感。",
      "这些颜色不是为了做氛围，而是为了减少秋冬穿搭里的生硬。",
      "看久了还顺眼的颜色，往往比第一眼很特别的颜色更耐穿。"
    ],
    closings: [
      "秋冬配色的好看，很多时候在分寸里。",
      "能放进衣柜的颜色，才是真的耐看。",
      "温感静奢不是暖色堆叠，而是刚刚好的灰度。",
      "这种记忆点不用大声推，颜色自己会慢慢留下来。"
    ]
  },
  穿搭解决方案: {
    openers: [
      "我现在做穿搭参考，会先想这套能不能真的出门。",
      "不想费脑的时候，鞋子先选稳定的。",
      "一鞋多搭如果只是换几套衣服，其实参考意义不大。",
      "早上最浪费时间的，往往是鞋子和衣服之间不顺。"
    ],
    observations: [
      "裤装要看裤脚和鞋子的关系，裙装要看鞋子会不会显笨，连衣裙要看整体比例。",
      "白衬衫、牛仔、针织和轻外套都能接住，鞋子才算真正省心。",
      "如果一双鞋只能搭一种风格，它就不算真的好用。",
      "比例顺了，整套穿着会自然很多，也不会显得刻意。"
    ],
    sceneNotes: [
      "入户镜前能看完整搭配，写字楼门口能看通勤，咖啡馆里能看松弛感。",
      "朋友午餐、酒店房间和城市街角这些地方，能让穿搭从图片回到真实生活。",
      "每张图最好只解决一个问题：鞋子怎么露、裙摆怎么落、裤脚怎么停。",
      "如果一套穿着只能站着好看，出门参考价值就会少很多。"
    ],
    personalAngles: [
      "我会把它当成衣柜里的连接项，而不是某一套穿搭的装饰。",
      "如果看完能想到三套自己的衣服，这篇就比单纯好看更有用。",
      "省心，是成熟日常里很重要的审美。",
      "好搭不是没有特点，而是不会打断整个人的状态。"
    ],
    closings: [
      "穿搭内容最后还是要回到：明天能不能用。",
      "一双鞋能稳定住比例，就已经解决了很多问题。",
      "这类笔记适合收藏，不需要写得很用力。",
      "对我来说，它最好能让早上少纠结一点。"
    ]
  },
  材质工艺认知: {
    openers: [
      "材质这件事，写得太专业反而不好看懂。",
      "我看鞋子质感，会先看它有没有被拍得太假。",
      "一双鞋上脚显不显笨，很多时候不是颜色决定的。",
      "比起说它高级，我更想看鞋头、鞋带和鞋底线条准不准。"
    ],
    observations: [
      "鞋头弧度、鞋底厚度、鞋带粗细和走线位置，都会影响上脚后的真实观感。",
      "材质不用讲得太玄，摸得到的纹理、看得清的边缘和自然的光泽已经能说明很多。",
      "如果鞋带路线、鞋舌位置或材质过渡不自然，画面会立刻有 AI 感。",
      "当前鞋款统一按猪皮内里处理；如果拍到内里，材质表达要真实，不要写得很花。"
    ],
    sceneNotes: [
      "近一点看鞋头、鞋带和走线，很多质感其实都藏在这些小地方。",
      "材质桌面可以有手部整理动作，但不要把细节拍成冰冷的说明书。",
      "棚内静物留少一点道具，鞋型、缝线和材质转换会更清楚。",
      "自然光下的纹理和轻微阴影，比过亮的塑料感更可信。"
    ],
    personalAngles: [
      "我会先看鞋头、鞋底线条和鞋带位置，这些地方最容易露怯。",
      "材质讲得越清楚，距离感反而越少。",
      "如果细节能让鞋子更好搭、更耐看，就值得单独拿出来讲。",
      "工艺内容最好让人知道怎么判断，而不是只觉得品牌很会说。"
    ],
    closings: [
      "材质笔记写轻一点，反而更可信。",
      "真正的质感，经得起近看。",
      "细节拍准，比形容词更有用。",
      "把鞋子拍真实，本身就是一种品牌能力。"
    ]
  },
  品牌审美观点: {
    openers: [
      "比起风格口号，我更在意它能不能落进生活里。",
      "高级感如果只剩冷，就很难让人真的想穿。",
      "我不太喜欢那种一眼很贵、但完全不像生活的画面。",
      "品牌感不是把 Logo 放大，而是每个选择都稳定。"
    ],
    observations: [
      "奶油白和米灰只是底色，真正重要的是人物状态、生活秩序和画面的温度。",
      "她的衣柜、桌面、书、城市街角，比单独摆出来的产品更能说明审美。",
      "产品露出弱一点时，反而更能看出品牌是不是有自己的世界。",
      "舒服但不随便，女性化但不甜，这个分寸比强风格更难。"
    ],
    sceneNotes: [
      "窗边阅读、美术馆、书店门口和衣帽间，都能让审美看起来更像真实发生的生活。",
      "我希望画面里有她的一天，而不是只有品牌自己的工作台。",
      "城市街角要有真实生活痕迹，不要像空的样板街。",
      "桌面和衣柜留在画面里时，要像她的生活，不只是品牌流程。"
    ],
    personalAngles: [
      "如果一个东西能进入衣柜、桌面和城市路线，它就比纯静物更有说服力。",
      "安静不是空，克制也不是少内容，而是每个东西都刚好。",
      "真正的品牌审美，是看多几张图之后仍然觉得统一。",
      "我想看的不是品牌告诉我它很高级，而是它有没有一套稳定的生活判断。"
    ],
    closings: [
      "审美内容不要写满，留一点空间更像 THERUIZ AURA。",
      "干净、真实、温和，比强烈风格更耐看。",
      "如果画面能让人想到自己的生活，它就不是空泛的高级。",
      "我理解的温感静奢，是能被日常使用的。"
    ]
  },
  上新活动转化: {
    openers: [
      "上新这件事，不一定要写得很急。",
      "上新内容如果一上来就催人下单，我会有点想划走。",
      "我更想先看清楚：鞋型准不准，颜色好不好搭，上脚比例顺不顺。",
      "新品图可以直接一点，但语气不需要写得很满。"
    ],
    observations: [
      "如果只有静物，看不到比例；如果只有氛围，又看不清产品。",
      "第一张可以把鞋拍清楚，后面一定要回到真实上脚和真实生活。",
      "活动信息越克制，产品本身越要拍准确。",
      "一组图里有静物、上脚、生活场景和一点幕后，判断会完整很多。"
    ],
    sceneNotes: [
      "棚拍看清鞋型和材质，入户镜前看穿搭比例，写字楼门口看它能不能进入工作日。",
      "城市街角和咖啡店门口能让新品从“上新”回到真实穿着。",
      "拍摄花絮补一点品牌可信度就够了，不要抢走新品本身。",
      "每张图最好回答一个问题，不要重复同一种角度。"
    ],
    personalAngles: [
      "我会按顺序看：先看鞋型，再看颜色，再看上脚，再看能不能配我的衣服。",
      "比起催促下单，我更想知道它适不适合自己的衣柜。",
      "好的上新笔记，是让人更快判断它适不适合自己。",
      "一张真实走路的图，往往比很多精修静物更有用。"
    ],
    closings: [
      "产品拍准，穿法拍自然，就已经很够。",
      "不用把话说满，看到的人会自己判断。",
      "温和一点的上新，反而更符合 THERUIZ AURA。",
      "上新笔记的重点，是让人少一点不确定。"
    ]
  }
};

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
      "一组不太用力的上脚图",
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
      "如果今天只是去上班、买咖啡、顺路见朋友，我会希望鞋子安静一点，但不要把整个人穿得很随便。",
      "这类鞋最打动我的地方，不是第一眼多特别，而是很多普通早晨都能直接套进衣服里。",
      "我会把它当成衣柜里的连接项：衬衫、牛仔、针织、托特包，都能被它接得更自然。",
      "对我来说，真正有用的种草，是看完之后能立刻想到自己明天可以怎么穿。"
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
      "桌面上能看懂的细节",
      "质感从取舍里出来",
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
      "有些选择看起来很小，比如鞋带粗细、色卡深浅、皮料触感，但最后都会影响它是不是耐看。",
      "我更想把这些细节摊开给你看：不是证明我们做了多少事，而是让你知道它为什么会长成现在这样。",
      "开发台面不需要很满，几块皮料、几张色卡、一双样鞋，就能看出一双鞋的性格。",
      "如果一个细节反复调整，通常是因为它会影响日常穿着里的那一点舒服和体面。"
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
      "秋冬鞋色的一点真实判断",
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
      "秋冬我最怕鞋子颜色太冷，配大衣和针织会有一点生硬，所以更偏向暖一点、灰一点的浅色。",
      "咖啡棕、燕麦、暖米色不是为了做氛围感，而是真的比较容易放进秋冬衣柜。",
      "如果整身衣服已经有重量，鞋子就需要留一点轻感，让比例不要沉到脚下。",
      "这组颜色更适合配针织、牛仔、大衣和暖灰裤装，不抢，但会让整套看起来顺。"
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
      "一鞋多搭，不要拍成公式",
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
      "我会先想今天要去哪里：上班、喝咖啡、见朋友还是短途出门，再决定这双鞋放在哪套衣服里。",
      "如果一双鞋能同时搭裤装、裙装和连衣裙，它对我来说就不是百搭口号，而是真的省时间。",
      "早上最怕的是衣服都没错，但鞋子一上脚整套比例不顺；所以鞋型干净很重要。",
      "这类内容最好不是教科书，而是给你一个明天能直接照着试的穿法。"
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
      "近看也要成立的鞋子细节",
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
      "我会先看鞋头、鞋底线条和鞋带位置，这些地方决定它上脚后会不会显笨。",
      "材质不用讲得太玄，摸得到的纹理、看得清的走线、自然的光泽，已经能说明很多。",
      "当前鞋款默认使用猪皮内里；如果画面拍到内里，就要保持真实，不要把材质写得很花。",
      "一个细节如果能让鞋子更好搭、更耐看、更不容易显廉价，就值得单独拿出来讲。"
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
      "干净但不冷的画面习惯",
      "她的一天比口号更有说服力",
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
      "我理解的高级感，不是把画面拍得很冷，而是让人觉得这个东西真的能放进生活里。",
      "THERUIZ AURA 的画面不需要很大声，安静一点、温一点，反而更接近我们想象里的日常体面。",
      "她的衣柜、桌面、书、城市街角，比单独摆出来的产品更能说明品牌审美。",
      "我们想要的是一种不用解释太多的干净感：舒服，但不是随便；女性化，但不甜。"
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
      "新品图应该先帮人判断",
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
      "比起一上来催促下单，先把上新节奏、试穿感和真实使用场景讲清楚，会更容易让人判断。",
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
      "如果是上新，我最想先看清三件事：鞋型准不准、颜色好不好搭、上脚比例顺不顺。",
      "比起催促下单，我更愿意把它放进真实穿法里，让你判断它是不是适合自己的衣柜。",
      "一组上新图最好有静物、上脚、生活场景和一点幕后，这样用户不用只靠想象做决定。",
      "活动信息可以轻一点，产品信息要清楚一点；这样才不会破坏 THERUIZ AURA 的气质。"
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

const topicCopyKitEnhancements = {
  生活场景软种草: {
    titleLeads: [
      "今天这套，胜在不用想太多",
      "一双能陪你走完一天的鞋",
      "这种日常图，我反而更愿意看",
      "不是特别会穿，也能穿得干净"
    ],
    titleSeconds: [
      "从入户镜到咖啡店，都要自然",
      "好穿不是口号，是一天结束还体面",
      "别把鞋拍得太努力，生活感更重要",
      "她不是在营业，只是准备出门"
    ],
    titleThirds: [
      "出门前五分钟的真实参考",
      "低调但有用的一鞋多场景",
      "适合轻熟日常的上脚记录",
      "把鞋放进真实的一天"
    ],
    openings: [
      "我现在看鞋，会先想它能不能陪我走完一个普通工作日。",
      "有些鞋不是第一眼最特别，但会在很多早晨变得很省心。",
      "这类内容如果拍得太像广告，我反而会跳过。",
      "真正有代入感的图，通常不是姿势多漂亮，而是状态够自然。",
      "一双日常鞋最难的地方，是既不抢戏，也不能让整套穿搭塌掉。"
    ],
    observations: [
      "入户镜前、写字楼门口、咖啡店外，这些地方比大场景更能看出鞋子是不是好穿。",
      "鞋子露得清楚，但不要像商品硬插进画面里，这个分寸很重要。",
      "我会看裤脚、鞋口和脚背的关系，比例顺了，整个人才显得干净。",
      "如果一双鞋能同时接住通勤和周末，它在衣柜里的使用率会高很多。",
      "画面里有一点真实街道痕迹，反而比过度干净的背景更可信。"
    ],
    scenes: [
      "可以是一张入户镜前的记录，也可以是咖啡店门口停下来的几秒钟。",
      "她不需要一直看镜头，偶尔自然看过来、低头整理衣服、走过街角都可以。",
      "如果鞋子出现在普通街道、书店门口或酒店房间里，种草感会比纯摆拍更轻。",
      "画面最好像朋友帮忙拍的一张，但审美和比例仍然是被控制过的。",
      "生活场景里不要塞太多道具，一杯咖啡、一本书、一个托特包就够了。"
    ],
    xiaohongshuAngles: [
      "我会更相信这种图：看得出鞋子，也看得出她真的要去过一天。",
      "如果明天早上能直接照着穿，这篇内容就有用了。",
      "日常鞋不需要把人变成另一个人，它只要让原本的衣服更顺一点。",
      "我喜欢鞋子安静地出现，而不是所有画面都在提醒我它是主角。",
      "越像真实出门前的记录，越容易让人判断自己适不适合。"
    ],
    closings: [
      "这类种草最好轻一点，留给看到的人自己判断。",
      "能被穿进真实生活里，比一句卖点更有说服力。",
      "好看的日常感，不需要太用力。",
      "如果看完能想到自己衣柜里的衣服，这篇就成立了。",
      "一双鞋能让早晨少纠结一点，就已经很值得被记录。"
    ]
  },
  产品开发幕后: {
    titleLeads: [
      "样鞋台面上，最容易看出取舍",
      "这几个细节，比大段介绍更有用",
      "幕后不用拍满，真实一点就够",
      "一双鞋变耐看，往往靠这些小地方"
    ],
    titleSeconds: [
      "鞋带粗细、色卡深浅，都不是随便选的",
      "开发感要真实，但不要像工厂汇报",
      "有秩序的工作台，比堆满道具更高级",
      "把过程拍轻一点，质感会更清楚"
    ],
    titleThirds: [
      "开发台面的一点真实痕迹",
      "从样鞋细节看品牌判断",
      "不吵的幕后内容怎么拍",
      "小品牌也要有清楚的取舍"
    ],
    openings: [
      "我更喜欢那种能看见判断过程的幕后，而不是把桌面摆成展览。",
      "开发内容不一定要很热闹，几块皮料和一张色卡已经能说明很多。",
      "鞋子最后看起来干净，通常是因为前面删掉了很多不必要的东西。",
      "幕后图最怕两种：太乱，或者太像假装忙碌。",
      "如果一个细节改了很多次，它大概率会影响真实上脚的感觉。"
    ],
    observations: [
      "色卡不是装饰，它决定鞋子放进衣柜时会不会突兀。",
      "鞋带、鞋舌和走线这些位置，看起来小，但会影响鞋型的干净程度。",
      "工作台可以有使用痕迹，但每个物件都要有理由。",
      "开发幕后不要只拍材料，也要让人感受到品牌怎么做减法。",
      "越是克制的产品，越需要把比例和材质控制准。"
    ],
    scenes: [
      "一张材料桌可以只保留皮料、鞋带、色卡和少量产品笔记。",
      "拍摄花絮可以出现手部整理动作，但不要把设备拍成主角。",
      "棚内静物适合让鞋型说话，工作台图适合让材质说话。",
      "纸张、护理刷、样鞋局部都可以出现，但画面要留白。",
      "如果有手部动作，最好像真的在整理，而不是摆给镜头看。"
    ],
    xiaohongshuAngles: [
      "我想让看到的人知道：这双鞋不是靠氛围包装出来的。",
      "有时候少一个颜色、少一个装饰，反而更接近日常耐看。",
      "这些幕后图不是为了显得专业，而是把选择过程摊开一点。",
      "如果材质和比例够清楚，文字就不需要写得很满。",
      "开发内容最好让人觉得可信，而不是被教育。"
    ],
    closings: [
      "幕后内容的重点，是把真实和秩序留住。",
      "有些细节不用大声说，但值得被看见。",
      "这类图适合慢慢建立信任。",
      "把过程拍得克制一点，产品反而更有质感。",
      "少一点表演，多一点真实桌面。"
    ]
  },
  秋冬配色实验室: {
    titleLeads: [
      "秋冬鞋色，我会先看温度",
      "咖色不能太重，燕麦色不能太黄",
      "这组秋冬色，适合放进真实衣柜",
      "比起显贵，我更在意耐看"
    ],
    titleSeconds: [
      "低饱和不是没颜色，是更好搭",
      "配大衣和牛仔时，鞋色很关键",
      "颜色一重，整个人就容易被压住",
      "暖一点，但不要变复古厚重"
    ],
    titleThirds: [
      "秋冬色卡的一点取舍",
      "咖啡棕和燕麦色怎么拍得干净",
      "成熟衣柜里的低饱和鞋色",
      "温一点的秋冬鞋色记录"
    ],
    openings: [
      "秋冬我很怕鞋子颜色太冷，尤其配针织和大衣时会有点硬。",
      "咖色好不好看，关键不是深，而是灰度和温度。",
      "有些秋冬色第一眼很安静，但越看越容易搭。",
      "如果一双鞋让整身衣服变沉，就算颜色安全也不一定好穿。",
      "我会把鞋色放到真实衣柜里看，而不是只看单独静物。"
    ],
    observations: [
      "燕麦、暖米、咖啡棕和暖灰放在一起时，饱和度不能打架。",
      "秋冬鞋色最好能接住牛仔、羊毛、针织和浅色外套。",
      "材质样和色卡可以拍得很美，但最后还是要回到上脚效果。",
      "暖色不等于厚重，留一点浅色和空气感会更像 THERUIZ AURA。",
      "一双秋冬鞋如果能让深色衣服轻一点，它的实穿价值就很高。"
    ],
    scenes: [
      "材质工作台适合放咖啡棕皮料、燕麦麂皮和暖米色卡。",
      "衣帽间可以出现针织、牛仔和浅色外套，让色彩更有真实参照。",
      "棚内静物要把鞋色拍准确，不要让灯光把颜色烤黄。",
      "城市街角适合验证秋冬色是不是能进入真实日常。",
      "画面不要堆满咖色，一点暖灰和奶油白会更耐看。"
    ],
    xiaohongshuAngles: [
      "我会看这双鞋能不能配我已经有的针织和牛仔，而不是只看它单独漂不漂亮。",
      "秋冬最怕整套穿搭都很重，所以鞋子要有一点轻感。",
      "咖啡色如果太红会显老，太黑又会沉，灰一点反而更高级。",
      "燕麦色好看的地方，是它能让浅色衣服和深色外套之间有过渡。",
      "这组内容可以像一个小色卡笔记，不需要写成流行趋势。"
    ],
    closings: [
      "秋冬配色的好看，很多时候在分寸里。",
      "颜色越安静，越要拍准确。",
      "能放进衣柜的颜色，才是真的耐看。",
      "这类内容适合慢慢种草，不适合大声推销。",
      "温感静奢不是暖色堆叠，而是刚刚好的灰度。"
    ]
  },
  穿搭解决方案: {
    titleLeads: [
      "明天上班，可以照着这套来",
      "不想费脑时，鞋子先选稳定的",
      "一双鞋能不能百搭，看这些场景",
      "穿搭不需要复杂，比例顺就够了"
    ],
    titleSeconds: [
      "裤装、裙装、连衣裙都要接得住",
      "早上少纠结，比多一个亮点更重要",
      "鞋子不抢戏，但要撑住整套",
      "适合真实通勤，不是拍照限定"
    ],
    titleThirds: [
      "给轻熟日常的省心搭配",
      "一鞋多搭的真实版本",
      "衣柜里更常用的那种鞋",
      "从入户镜到写字楼门口"
    ],
    openings: [
      "我现在做穿搭参考，会先想这套能不能真的出门。",
      "百搭不是每套都惊艳，而是很多场景都不出错。",
      "早上最浪费时间的，往往是鞋子和裤脚不顺。",
      "如果一双鞋只能配一种风格，它就不算真正省心。",
      "我更想看普通衣柜里能复用的搭配，而不是一次性造型。"
    ],
    observations: [
      "裤装要看裤脚和鞋口，裙装要看鞋子会不会显笨，连衣裙要看整体比例。",
      "白衬衫、牛仔、针织和轻外套都能接住，鞋子才算稳定。",
      "适合通勤的鞋，不应该只在办公室门口成立，周末也要能穿。",
      "穿搭解决方案最好给人一个明确参考，而不是只讲风格词。",
      "鞋子如果让全身比例变清楚，整套衣服会更容易被照着穿。"
    ],
    scenes: [
      "入户镜前适合看完整比例，写字楼门口适合看真实通勤状态。",
      "咖啡馆内、朋友午餐和酒店房间，可以让穿搭看起来更生活化。",
      "如果是裙装或短裤，鞋子一定要完整露出，不然参考价值会变低。",
      "每张图最好只解决一个穿搭问题，不要把所有信息塞在一起。",
      "场景可以换，但穿着逻辑要一直清楚。"
    ],
    xiaohongshuAngles: [
      "我会把它当成衣柜里的连接项，而不是某一套穿搭的装饰。",
      "如果看完能想到三套自己的衣服，这篇就比单纯好看更有用。",
      "一鞋多搭最重要的是比例稳定，不是硬凑很多风格。",
      "我不太相信过度摆拍的搭配，更想看走路、坐下、照镜子时是否自然。",
      "这类内容可以直接帮人少试几次衣服。"
    ],
    closings: [
      "穿搭内容最后还是要回到：明天能不能用。",
      "省心，是成熟日常里很重要的审美。",
      "好搭不是没有特点，而是不会打断整个人的状态。",
      "一双鞋能稳定住比例，就已经解决了很多问题。",
      "这类笔记适合收藏，不需要写得很用力。"
    ]
  },
  材质工艺认知: {
    titleLeads: [
      "别只看颜色，鞋型细节更重要",
      "这几个地方，决定鞋子显不显笨",
      "材质要拍得看得懂，才有用",
      "鞋带、鞋舌、鞋底线条都要看"
    ],
    titleSeconds: [
      "专业词少一点，细节拍清楚一点",
      "好质感不是滤镜，是结构准确",
      "上脚好不好看，很多在鞋头和比例",
      "工艺内容也可以写得轻一点"
    ],
    titleThirds: [
      "一双日常鞋的细节观察",
      "从鞋型看真实质感",
      "材质图怎么拍得不生硬",
      "看懂这些，再判断值不值得"
    ],
    openings: [
      "我看鞋子质感，会先看它有没有被拍得太假。",
      "材质内容如果只有专业名词，反而离真实穿着很远。",
      "一双鞋上脚显不显笨，很多时候不是颜色决定的。",
      "比起说它高级，我更想看鞋头、鞋带和鞋底线条准不准。",
      "质感最好能被看见，而不是靠文字解释。"
    ],
    observations: [
      "鞋头弧度太尖或太圆，都会改变整双鞋的气质。",
      "鞋带厚度、鞋舌位置和走线如果乱，画面会立刻有 AI 感。",
      "材质过渡要自然，皮面、麂皮或网布不能像塑料。",
      "如果拍到内里，当前鞋款统一按猪皮内里处理，不要写成别的材质。",
      "材质图可以近一点，但不能近到看不出鞋型。"
    ],
    scenes: [
      "材质工作台适合用手部整理动作带出真实触感。",
      "棚内静物要减少道具，让鞋型、缝线和材质转换更清楚。",
      "拍摄花絮可以出现鞋带和皮料局部，但不要变成杂乱工作照。",
      "非产品氛围图可以弱化鞋子，用材质和纸张建立触感。",
      "画面越克制，越要保证纹理和比例准确。"
    ],
    xiaohongshuAngles: [
      "如果鞋子结构被拍变形，再好看的氛围也没有意义。",
      "我会先看鞋头、鞋底厚度和鞋带路线，这些地方最容易露怯。",
      "材质不是越亮越贵，真实的哑光和轻微纹理更耐看。",
      "工艺内容最好让人看完知道怎么判断，而不是只觉得品牌很会说。",
      "这些细节讲清楚，看到的人自然会理解为什么它更适合日常穿。"
    ],
    closings: [
      "材质笔记写轻一点，反而更可信。",
      "真正的质感，经得起近看。",
      "细节拍准，比形容词更有用。",
      "这类内容适合慢慢建立判断感。",
      "把鞋子拍真实，本身就是一种品牌能力。"
    ]
  },
  品牌审美观点: {
    titleLeads: [
      "高级感不是把画面拍冷",
      "日常要好看，也要真的能用",
      "我更喜欢这种不吵的品牌感",
      "温感静奢，不是把东西摆贵"
    ],
    titleSeconds: [
      "奶油白、石色、自然光，只是基础",
      "舒服但不随便，才是难的部分",
      "少一点表演，多一点真实生活",
      "她的衣柜和城市，比口号更重要"
    ],
    titleThirds: [
      "THERUIZ AURA 的审美取向",
      "干净但不冷的日常画面",
      "成熟女性会相信的生活感",
      "把品牌放进真实生活世界"
    ],
    openings: [
      "我不太喜欢那种一眼很贵、但完全不像生活的画面。",
      "高级感如果只剩冷，就很难让人真的想穿。",
      "THERUIZ AURA 的画面应该安静，但不能没有温度。",
      "品牌感不是把 Logo 放大，而是每个选择都稳定。",
      "我更愿意相信那些看起来能发生在普通一天里的图。"
    ],
    observations: [
      "奶油白和米灰只是底色，真正重要的是人物状态和生活秩序。",
      "她可以在窗边看书，也可以在城市街角停一下，画面不需要解释太多。",
      "产品露出弱一点时，反而更能看出品牌是不是有自己的世界。",
      "审美观点不要写得太抽象，落到衣柜、桌面、书店、美术馆会更真实。",
      "如果画面只有工作台和材料，品牌世界会显得太内部。"
    ],
    scenes: [
      "窗边阅读、美术馆、书店门口和衣帽间都能表达她的审美选择。",
      "城市街角要有真实生活痕迹，不要像空的样板街。",
      "桌面和衣柜可以出现，但要像她的生活，不只是品牌的流程。",
      "非产品氛围图更适合拍她的一天，而不是一直拍我们的工作台。",
      "产品可以出现，但最好像生活里自然存在的一部分。"
    ],
    xiaohongshuAngles: [
      "我想看的不是品牌告诉我它很高级，而是它有没有一套稳定的生活判断。",
      "如果一张图让我觉得这个东西能进入衣柜、桌面和城市路线，它就比纯静物更有说服力。",
      "高级感要能落地：早上出门、周末散步、旅行整理、回家后的桌面。",
      "安静不是空，克制也不是少内容，而是每个东西都刚好。",
      "真正的品牌审美，是看多几张图之后仍然觉得统一。"
    ],
    closings: [
      "审美内容不要写满，留一点空间更像 THERUIZ AURA。",
      "干净、真实、温和，比强烈风格更耐看。",
      "品牌感最后会体现在很多小选择里。",
      "如果画面能让人想到自己的生活，它就不是空泛的高级。",
      "温感静奢应该是能被日常使用的。"
    ]
  },
  上新活动转化: {
    titleLeads: [
      "上新先别急着看折扣",
      "这双鞋上线前，我会先看这几件事",
      "新品图要清楚，但别太硬",
      "一组上新图，最好能帮人做判断"
    ],
    titleSeconds: [
      "鞋型、颜色、上脚比例，一个都不能糊",
      "先看能不能进衣柜，再看要不要下单",
      "静物负责看清楚，上脚负责让人相信",
      "活动可以轻一点，产品信息要准一点"
    ],
    titleThirds: [
      "THERUIZ AURA 的上新记录",
      "新品试穿前，我会看这些",
      "温和但有效的上新内容",
      "从棚拍到上脚的判断顺序"
    ],
    openings: [
      "上新内容如果一上来就催人下单，我会有点想划走。",
      "我更想先看清楚：鞋型准不准，颜色好不好搭，上脚比例顺不顺。",
      "新品图可以直接一点，但不需要把语气写得很满。",
      "一双鞋值不值得试，通常几张图就能看出大概。",
      "上新最重要的不是热闹，而是让人快速判断适不适合自己。"
    ],
    observations: [
      "第一张可以是干净棚拍，第二张就要回到真实上脚，不然判断会断掉。",
      "鞋子必须清楚，但人物和场景也要真实，不能像详情页模板。",
      "如果只有静物，看不到比例；如果只有氛围，又看不清产品。",
      "上新内容最好把材质、上脚、搭配和生活场景串起来。",
      "活动信息越克制，产品本身越要拍准确。"
    ],
    scenes: [
      "棚内上新负责把鞋型和材质拍准，入户镜前负责看穿搭比例。",
      "写字楼门口和城市街角适合证明它能进入真实工作日。",
      "拍摄花絮可以补一点品牌可信度，但不能抢走新品本身。",
      "如果是五张图，最好从静物、上脚、生活场景、细节、氛围依次展开。",
      "每张图都要有自己的任务，不要重复同一种角度。"
    ],
    xiaohongshuAngles: [
      "我会按顺序看：先看鞋型，再看颜色，再看上脚，再看能不能配我的衣服。",
      "如果上新图能把这些问题讲清楚，就不需要很重的促销语气。",
      "一组图里有一张真实走路的，往往比很多精修静物更有用。",
      "新品内容要让人做判断，而不是只制造期待。",
      "温和一点的上新，反而更符合 THERUIZ AURA。"
    ],
    closings: [
      "上新笔记的重点，是让人少一点不确定。",
      "产品拍准，穿法拍自然，就已经很够。",
      "不用把话说满，看到的人会自己判断。",
      "这类内容可以明确，但不要吵。",
      "好的上新图，应该让人想去试，而不是被催着买。"
    ]
  }
} satisfies Partial<Record<SoftSeedingTopic, Partial<TopicCopyKit>>>;

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
    "Use concrete Xiaohongshu-style lifestyle cues: a real outfit record, candid daily rhythm, clear shoe visibility, wearable styling, subtle personal-object context, and a scene that feels easy to save as an outfit reference.",
  产品开发幕后:
    "Use concrete behind-the-scenes cues: hands arranging material cards, selected swatches, laces, sample notes, tidy working surface, visible product decisions, and restrained small-brand process realism.",
  秋冬配色实验室:
    "Use concrete color-lab cues: coffee brown leather, oatmeal suede, warm beige cards, muted grey chips, autumn wardrobe layers, soft material contrast, and a saveable palette-board feeling without clutter.",
  穿搭解决方案:
    "Use concrete styling-solution cues: before-leaving outfit check, clear clothing category, readable layering, trouser/skirt/dress relationship with sneakers, and one practical daily scenario.",
  材质工艺认知:
    "Use concrete material-learning cues: one precise detail at a time, such as toe shape, outsole edge, stitching route, lace thickness, pigskin lining when relevant, leather texture, panel transition, and clean product readability.",
  品牌审美观点:
    "Use concrete aesthetic-point cues: her wardrobe, desk, book, gallery, quiet city corner, low-saturation personal objects, subtle product presence, and warm negative space.",
  上新活动转化:
    "Use concrete soft-launch cues: clean product readability, one on-foot styling proof, one material proof, one lifestyle proof, clear color and shape, and a calm reason to consider the new arrival."
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

const garmentTypeSpecificTerms: Record<Exclude<TeamGarmentTypePreference, "自动匹配">, {
  hem: string;
  category: string;
  relationship: string;
}> = {
  裤装: {
    hem: "clean trouser break",
    category: "refined trousers or denim",
    relationship: "trouser-and-sneaker relationship"
  },
  裙装: {
    hem: "clean skirt hem",
    category: "a refined skirt",
    relationship: "skirt-and-sneaker relationship"
  },
  短裤: {
    hem: "clean tailored-shorts hem",
    category: "refined tailored shorts",
    relationship: "shorts-and-sneaker relationship"
  },
  连衣裙: {
    hem: "clean dress hem",
    category: "a refined one-piece dress",
    relationship: "dress-and-sneaker relationship"
  },
  轻运动: {
    hem: "clean activewear hem",
    category: "refined light activewear",
    relationship: "activewear-and-sneaker relationship"
  }
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
  const specificTerms = garmentTypeSpecificTerms[garmentTypePreference];
  let sanitized = extraRequirement
    .replace(/\btrouser(?:s)?[- ](?:and[- ])?sneaker relationship\b/gi, specificTerms.relationship)
    .replace(/\btrouser\/skirt\/dress relationship\b/gi, specificTerms.relationship)
    .replace(/\btrouser break\b/gi, specificTerms.hem)
    .replace(/\bclean trouser break\b/gi, specificTerms.hem)
    .replace(/\bskirt-based styling option\b/gi, `${specificTerms.category} styling option`)
    .replace(/\bdress-based styling option\b/gi, `${specificTerms.category} styling option`)
    .replace(/\bshorts-based styling option\b/gi, `${specificTerms.category} styling option`)
    .replace(
      /\b(?:warm beige|oatmeal|warm grey|cream|ivory|light|dark|charcoal|taupe|soft|straight-leg|straight|wide-leg|tailored|relaxed|wool|linen|cotton|structured|pale|stone|beige)\s+(?:straight-leg\s+)?(?:trousers|pants|denim|jeans)\b/gi,
      replacement
    )
    .replace(/\b(?:straight-leg\s+)?(?:trousers|pants|denim|jeans)\b/gi, replacement);

  if (garmentTypePreference !== "短裤") {
    sanitized = sanitized.replace(/\b(?:refined\s+)?(?:Bermuda shorts|tailored shorts)\b/gi, replacement);
  }

  if (garmentTypePreference !== "裙装") {
    sanitized = sanitized.replace(/\b(?:a\s+)?refined skirt\b/gi, replacement).replace(/\bskirt\b/gi, replacement);
  }

  if (garmentTypePreference !== "连衣裙") {
    sanitized = sanitized
      .replace(/\b(?:a\s+)?refined one-piece dress\b/gi, replacement)
      .replace(/\bone-piece dress\b/gi, replacement)
      .replace(/\bdress\b/gi, replacement);
  }

  return sanitized.replace(/\s{2,}/g, " ").trim();
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

  const manualControlLine =
    garmentTypePreference === "自动匹配" ? "" : garmentTypeControlLines[garmentTypePreference];
  const combinedRequirement = [draft.extraRequirement, manualControlLine, themeGuide].filter(Boolean).join(" ");

  return sanitizeSoftSeedingExtraRequirementForGarment(combinedRequirement, garmentTypePreference);
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
  const variantOffset = Math.max(0, Math.floor(input.variantOffset ?? 0));
  const baseVariantIndex = mode === "今日自动" ? dailySelection.variantIndex : manualPostIndex % variantCount;
  const variantIndex = (baseVariantIndex + variantOffset) % variantCount;
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
