import type {
  TeamGarmentTypePreference,
  TeamImageType,
  TeamPromptParams,
  TeamScenePreference,
  TeamSeason,
  TeamShoe
} from "../types";
import type { GarmentSeriesContext } from "../modules/product/garment/garmentProductTypes";
import {
  lifestyleSoftSeedingScenePool,
  type LifestyleSoftHandheldPolicy,
  type LifestyleSoftSceneFamily
} from "../data/lifestyleSoftSeedingScenePool";
import { generateTeamPrompt } from "./generatePrompt";

type SoftSeedingCopyTopic =
  | "生活场景软种草"
  | "产品开发幕后"
  | "秋冬配色实验室"
  | "穿搭解决方案"
  | "材质工艺认知"
  | "品牌审美观点"
  | "上新活动转化";
export type SoftSeedingTopic = SoftSeedingCopyTopic | "棚内上新拍摄";
export type SoftSeedingImageCount = 3 | 5 | 8;
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
  imageCount?: SoftSeedingImageCount;
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
  id?: string;
  tags?: string[];
  composition?: string;
  weight?: number;
  family?: LifestyleSoftSceneFamily;
  supportedSeasons?: TeamSeason[];
  handheldPolicy?: LifestyleSoftHandheldPolicy;
  studioLaunchShotIndex?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
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
  smallDetails: string[];
  personalAngles: string[];
  closings: string[];
};

type ReaderTitleKit = string[];

export const softSeedingTopicOptions: SoftSeedingTopic[] = [
  "生活场景软种草",
  "产品开发幕后",
  "秋冬配色实验室",
  "穿搭解决方案",
  "材质工艺认知",
  "品牌审美观点",
  "上新活动转化",
  "棚内上新拍摄"
];
export const softSeedingDailySlotOptions: SoftSeedingDailySlot[] = [1, 2];

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAILY_POST_COUNT = 2;
const SOFT_SEEDING_VARIANTS_PER_TOPIC = 200;
const SOFT_SEEDING_VARIANT_COUNT_BY_TOPIC: Partial<Record<SoftSeedingTopic, number>> = {
  生活场景软种草: 1000
};

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
  return SOFT_SEEDING_VARIANT_COUNT_BY_TOPIC[topic] ?? SOFT_SEEDING_VARIANTS_PER_TOPIC;
}

function getCopyTopic(topic: SoftSeedingTopic): SoftSeedingCopyTopic {
  return topic === "棚内上新拍摄" ? "上新活动转化" : topic;
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

function normalizeSoftVariantIndex(variantIndex: number, variantCount = SOFT_SEEDING_VARIANTS_PER_TOPIC) {
  return ((variantIndex % variantCount) + variantCount) % variantCount;
}

function pickVariant<T>(items: T[], variantIndex: number, salt: number, variantCount = SOFT_SEEDING_VARIANTS_PER_TOPIC) {
  const normalized = normalizeSoftVariantIndex(variantIndex, variantCount);
  const mixedIndex = normalized * salt + Math.floor(normalized / (salt + 1));
  return pick(items, mixedIndex);
}

function buildCopyFromKit(topic: SoftSeedingTopic, variantIndex: number, selectedImageDrafts: SoftSeedingImageDraft[]): TopicCopyDraft {
  const copyTopic = getCopyTopic(topic);
  return {
    titles: buildReaderFacingTitles(copyTopic, variantIndex),
    body: humanizeSoftSeedingBody(buildReaderFacingBody(copyTopic, variantIndex, selectedImageDrafts)),
    tags: topicCopyKits[copyTopic].tags,
    note: storyDrivenNotes[copyTopic]
  };
}

type StoryDrivenContext = {
  firstScene: string;
  secondScene: string;
  thirdScene: string;
  sceneList: string;
};

type StoryDrivenTemplate = {
  titles: [string, string, string];
  body: (context: StoryDrivenContext) => string;
};

function getReaderSceneName(draft: SoftSeedingImageDraft | undefined) {
  if (!draft) return "日常场景";
  const cardLabel = draft.name.split("｜").pop()?.trim();
  const cardLabelOverrides: Record<string, string> = {
    上脚比例: "通勤上脚",
    搭配静物: "搭配静物",
    棚内细节: "棚内细节",
    材质局部: "材质局部",
    棚内静物: "棚内静物",
    棚内上新: "棚内上新",
    配色笔记: "配色笔记"
  };
  if (cardLabel && cardLabelOverrides[cardLabel]) return cardLabelOverrides[cardLabel];
  if (cardLabel && !cardLabel.startsWith("图")) return cardLabel;

  const sceneNames: Partial<Record<TeamScenePreference, string>> = {
    入户镜前: "入户镜前",
    写字楼门口: "写字楼门口",
    咖啡店门口: "咖啡店门口",
    咖啡馆内: "咖啡馆内",
    朋友午餐: "朋友午餐",
    "书店 / 杂志店门口": "书店门口",
    "花店 / 买花": "花店门口",
    "城市街角 / 安静街区": "安静街区",
    酒店房间: "酒店房间",
    材质工作台: "材质工作台",
    拍摄花絮: "拍摄现场",
    棚内上新拍摄: "棚内上新",
    "工作台 / 桌边整理": "桌边整理",
    "衣帽间 / 更衣角": "更衣角",
    美术馆: "美术馆",
    产品静物图: "产品静物图"
  } as Partial<Record<TeamScenePreference | TeamImageType, string>>;

  return sceneNames[draft.scenePreference] ?? draft.scenePreference;
}

function getStoryContext(selectedImageDrafts: SoftSeedingImageDraft[]): StoryDrivenContext {
  const sceneNames = selectedImageDrafts.map(getReaderSceneName);
  return {
    firstScene: sceneNames[0] ?? "日常场景",
    secondScene: sceneNames[1] ?? sceneNames[0] ?? "日常场景",
    thirdScene: sceneNames[2] ?? sceneNames[1] ?? sceneNames[0] ?? "日常场景",
    sceneList: sceneNames.slice(0, 3).join("、")
  };
}

const storyDrivenNotes: Record<SoftSeedingCopyTopic, string> = {
  生活场景软种草: "像真实客户随手记录的一天，正文和配图都围绕同一个穿着感受展开。",
  产品开发幕后: "用少量真实过程讲清楚取舍，不写成品牌说明书。",
  秋冬配色实验室: "把色卡、材质和衣柜放在同一条线里，避免空泛讲配色。",
  穿搭解决方案: "用真实外出、停留和上脚场景解决一个穿搭问题，不默认对镜自拍。",
  材质工艺认知: "用一个可见细节讲材料和结构，不堆参数。",
  品牌审美观点: "从她的生活秩序和审美选择切入，弱化直接销售。",
  上新活动转化: "先让人看清新品，再给到真实穿着判断，不用催促式语气。"
};

const storyDrivenCopyTemplates: Record<SoftSeedingCopyTopic, StoryDrivenTemplate[]> = {
  生活场景软种草: [
    {
      titles: ["今天这双鞋，赢在不费劲", "普通一天也能穿得干净", "这类上脚图我会认真看"],
      body: ({ firstScene, secondScene }) =>
        formatBodyParagraphs([
          `今天这组更像真实出门记录，不是为了把鞋拍得很满。${firstScene}那一刻最直观，衣服没有重新设计过，鞋子也没有突然跳出来。`,
          `到${secondScene}时，脚下比例还是顺的。鞋底不显厚，鞋头和鞋带也能看清，整个人没有被拍得很用力。`,
          "我会被这种图种草，是因为它让我想到自己早上随手穿衣服的状态。不需要很会搭，只要干净、舒服、走出去不狼狈，就够了。"
        ])
    },
    {
      titles: ["不是精修大片，但很像真实穿着", "这双鞋放进日常里更顺", "买家秀里这种图最有参考感"],
      body: ({ firstScene, thirdScene }) =>
        formatBodyParagraphs([
          `比起只看静物，我更想看它在${firstScene}的状态。照片有一点真实光影和衣服褶皱，反而能判断它是不是日常会穿的鞋。`,
          `${thirdScene}这张会更像补充判断：鞋子没有抢掉整套衣服，也不是看不见。它只是把常穿的衣服接顺了。`,
          "这种鞋不用把话说满。能和普通衣服自然放在一起，脚下不乱，整个人看起来体面，就已经很有说服力。"
        ])
    },
    {
      titles: ["一双鞋能不能常穿，看这种照片", "出门前不用想太多的那种鞋", "鞋子安静一点，整套反而顺了"],
      body: ({ firstScene, secondScene }) =>
        formatBodyParagraphs([
          `在${firstScene}，我会先看比例：鞋子有没有把脚拍大，衣服下缘和鞋子之间是不是干净。`,
          `到${secondScene}，我会看状态：走路、停下、坐一会儿的时候，鞋型是不是还轻，整个人是不是还松弛。`,
          "如果这两点都顺，它就不是只适合拍照的鞋。它更像衣柜里会被反复拿出来的那一双。"
        ])
    }
  ],
  产品开发幕后: [
    {
      titles: ["样鞋桌上这些小地方，挺关键", "不是讲故事，是看取舍", "一双鞋变耐看，靠这些细节"],
      body: ({ firstScene, secondScene }) =>
        formatBodyParagraphs([
          `${firstScene}这组我想少讲一点漂亮话，多放一些真实取舍。鞋带粗细、皮料边缘、色卡放在一起看，才知道这双鞋最后为什么会是现在的样子。`,
          `${secondScene}不是为了制造忙碌感。桌面干净一点，手部动作慢一点，反而能看清楚哪些地方真的被反复确认过。`,
          "小品牌的幕后不需要拍得很热闹。把材质、结构和颜色讲清楚，比堆很多情绪更能让人放心。"
        ])
    },
    {
      titles: ["开发过程里，我更想看真实细节", "这些不是装饰，是产品判断", "工作台上能看出一双鞋的性格"],
      body: ({ firstScene, thirdScene }) =>
        formatBodyParagraphs([
          `我会把${firstScene}拍得克制一点。几块皮料、几张色卡、一条鞋带，就能讲清楚很多事。`,
          `到${thirdScene}时，产品结构会更清楚。不是为了卖弄工艺，而是让人知道鞋型、走线和材质关系都没有被随便处理。`,
          "这种过程记录最好安静，但不能空。看到真实开发痕迹，才会觉得这不是临时拼出来的一双鞋。"
        ])
    },
    {
      titles: ["今天只看开发里的几个小判断", "鞋带和色卡真的不是随便选", "幕后越克制，越能看清产品"],
      body: ({ sceneList }) =>
        formatBodyParagraphs([
          `这次想把${sceneList}连在一起看：先看材料，再看产品，再看现场里人的手怎么整理细节。`,
          "我不太想把幕后拍成热闹花絮。真正有用的是那些很小的判断，比如颜色是不是太甜、鞋底是不是太重、鞋带会不会破坏整双鞋的安静感。",
          "这些东西说出来不复杂，但会决定一双鞋是不是耐看。"
        ])
    }
  ],
  秋冬配色实验室: [
    {
      titles: ["秋冬鞋色别选太重", "咖色要灰一点才耐看", "这组颜色更像衣柜里会留下的"],
      body: ({ firstScene, secondScene }) =>
        formatBodyParagraphs([
          `在${firstScene}放在一起看，会发现秋冬颜色不能只追求暖。咖色、燕麦、暖米色都要留一点灰度，才不会显得厚和旧。`,
          `到了${secondScene}，颜色会回到真实鞋型里。单看色卡很容易觉得都好看，上到鞋面和鞋底关系里，轻重感才会出来。`,
          "我更喜欢这种不抢的秋冬色。它不会让整套衣服变暗，配针织、牛仔、大衣都还有空气感。"
        ])
    },
    {
      titles: ["燕麦色放进衣柜里看更准", "秋冬配色要有温度，也要轻", "不是越咖越高级"],
      body: ({ firstScene, thirdScene }) =>
        formatBodyParagraphs([
          `这次不是做一张漂亮色卡图，而是想看颜色放进${firstScene}和${thirdScene}以后还顺不顺。`,
          "秋冬最容易一不小心变重，所以鞋子颜色要有温度，但不能压住脚下。咖色要柔，米色要干净，灰色也要带一点暖。",
          "如果一双鞋能接住厚一点的衣服，又不把整个人变沉，它才真的适合秋冬。"
        ])
    },
    {
      titles: ["低饱和秋冬，重点是轻一点", "这组配色不是第一眼抢的", "鞋色和衣柜要放在一起看"],
      body: ({ sceneList }) =>
        formatBodyParagraphs([
          `我会把${sceneList}放在同一组里看，因为配色不是单独存在的。它要跟衣柜里的针织、外套、牛仔一起成立。`,
          "太亮会跳，太深会重，太甜又不适合 THERUIZ AURA。真正耐看的秋冬色，是看上去温和，但不会显旧。",
          "这种颜色不是为了制造惊艳，而是让早上出门少一点纠结。"
        ])
    }
  ],
  穿搭解决方案: [
    {
      titles: ["这双鞋怎么接住一天里的不同场景", "真实场景里更能看清搭配", "裤装和裙装都要看真实状态"],
      body: ({ firstScene, secondScene, thirdScene }) =>
        formatBodyParagraphs([
          `这次把搭配放到真实外出状态里看。从${firstScene}、${secondScene}到${thirdScene}，重点不是摆出一套标准答案，而是看鞋子能不能接住不同状态。`,
          "穿搭解决方案不是告诉你必须怎么穿，而是帮你少踩雷：鞋底不能显笨，衣服下缘不能压住鞋，整个人要干净但不紧绷。",
          "如果一双鞋能从上班、午餐到周末停留都接得住，它就更像一双真的能买回去穿的鞋。"
        ])
    },
    {
      titles: ["早上少纠结的一鞋多搭", "一双鞋能不能百搭，要放进路上看", "这种搭配参考比自拍更实用"],
      body: ({ firstScene, secondScene }) =>
        formatBodyParagraphs([
          `在${firstScene}先看清楚鞋和衣服的比例，到了${secondScene}再看它能不能自然走进一天。`,
          "我会避免把穿搭拍得太像教程。真实一点的场景更能看出它适不适合普通衣柜：白衬衫、牛仔、轻外套、裙装，都不能被鞋子打断。",
          "好搭不是每一套都惊艳，而是大多数早上都不出错。"
        ])
    },
    {
      titles: ["一双鞋解决的不是造型，是省心", "通勤到周末都能接住，才叫好搭", "穿搭参考要能真的出门"],
      body: ({ sceneList }) =>
        formatBodyParagraphs([
          `我会用${sceneList}来判断一双鞋的搭配能力。不同场景里的光线、步子和衣服状态都不一样，只有都顺，才算真的好搭。`,
          "这类内容不需要摆出很多姿势。鞋子完整可见，衣服结构清楚，人看起来像真的要出门，就已经很有参考价值。",
          "对我来说，它解决的是早上少想五分钟，而不是多买一套衣服。"
        ])
    }
  ],
  材质工艺认知: [
    {
      titles: ["材质要靠近看，但不能拍假", "鞋型准不准，细节会说话", "这几个地方我会认真看"],
      body: ({ firstScene, secondScene }) =>
        formatBodyParagraphs([
          `在${firstScene}，我会先看材质，不是看它有多亮，而是看皮面、走线和鞋带有没有真实触感。`,
          `${secondScene}再把鞋型放清楚。鞋头、鞋舌、鞋底线条都要稳，不然材质拍得再漂亮也没用。`,
          "工艺内容最好只讲一个重点。讲得少一点，细节反而更容易被看见。"
        ])
    },
    {
      titles: ["别把材质拍成塑料感", "一双鞋的干净感藏在边缘里", "鞋带、走线、皮料都要真实"],
      body: ({ sceneList }) =>
        formatBodyParagraphs([
          `这组会从${sceneList}慢慢看过去。不是为了把参数讲满，而是让人知道这双鞋的材料和结构是经得起近看的。`,
          "我会特别在意鞋带有没有乱、走线有没有浮、皮面是不是过度发亮。真实材质不需要很夸张，摸得到的感觉更重要。",
          "看到这些细节稳，才会相信上脚图里的干净感不是靠修出来的。"
        ])
    },
    {
      titles: ["材质认知，不要写成参数表", "细节拍清楚，比形容词有用", "这双鞋要看近处的秩序感"],
      body: ({ firstScene, thirdScene }) =>
        formatBodyParagraphs([
          `${firstScene}适合把皮料、鞋带和色卡放在一起，${thirdScene}适合看产品本身的完整结构。`,
          "我不想把材质写成很硬的说明。真正有用的是让人看见：哪里柔，哪里利落，哪里需要保持克制。",
          "这种细节内容安静一点就好，越像真实桌面，越容易建立信任。"
        ])
    }
  ],
  品牌审美观点: [
    {
      titles: ["高级感不是把生活拍空", "THERUIZ AURA 想留住的是这种秩序", "她的一天，比产品说明更重要"],
      body: ({ firstScene, secondScene }) =>
        formatBodyParagraphs([
          `${firstScene}和${secondScene}放在一起，会更接近 THERUIZ AURA 想要的生活感：不是展示很多东西，而是每样东西都刚好。`,
          "我理解的温感静奢，不是冷冰冰的极简，也不是很用力的贵气。它更像一个人把衣柜、桌面、出门路线都整理得舒服。",
          "鞋子可以出现，也可以不出现。重点是让人感觉这是一种真实审美选择，不是品牌硬塞进来的画面。"
        ])
    },
    {
      titles: ["她的衣柜、桌面和城市", "不是卖货图，也不是空氛围", "品牌审美要落到生活里"],
      body: ({ sceneList }) =>
        formatBodyParagraphs([
          `我会用${sceneList}去讲品牌审美，因为这些地方比一句“高级”更具体。`,
          "一件衣服怎么挂，一本书放在哪里，窗边光线是不是太冷，都会影响整体气质。好的品牌感应该从这些小地方慢慢出来。",
          "如果画面看完只剩产品，那就太直了；如果完全没有生活秩序，又会太空。中间那个分寸，才是 THERUIZ AURA。"
        ])
    },
    {
      titles: ["安静一点，但不要没有人味", "品牌观点可以很轻", "生活里的审美，比口号更耐看"],
      body: ({ firstScene, thirdScene }) =>
        formatBodyParagraphs([
          `从${firstScene}到${thirdScene}，这组内容会更像她真实生活里的审美片段，而不是单纯的产品展示。`,
          "我希望它有一点人的痕迹：杯子、书、衣服褶皱、走过的街角。不是凌乱，而是让人相信这个空间真的被使用过。",
          "这种内容不急着说服谁。它只需要让人看完觉得，原来舒服和体面可以同时存在。"
        ])
    }
  ],
  上新活动转化: [
    {
      titles: ["上新不用喊得很大声", "先看清鞋，再判断适不适合", "这组图适合慢慢看新品"],
      body: ({ firstScene, secondScene, thirdScene }) =>
        formatBodyParagraphs([
          `这组会从${firstScene}、${secondScene}到${thirdScene}慢慢展开：既要看清新品，也要看到它放进真实穿着之后的状态。`,
          "我会希望上新内容直接一点，但不要急。鞋型、颜色、材质和穿着状态都清楚了，用户自然会判断适不适合自己。",
          "这种上新不靠很重的促销语气。它更像把一双鞋认真放到你面前，让你慢慢看。"
        ])
    },
    {
      titles: ["新品图最重要的是可判断", "上新内容别只制造期待", "清楚、真实、安静地上新"],
      body: ({ sceneList }) =>
        formatBodyParagraphs([
          `这次上新我会把${sceneList}串起来。先有产品可读性，再有穿着证明，最后补一点材质或生活氛围。`,
          "如果只拍得很漂亮，但看不清鞋型和上脚比例，用户还是会犹豫。清楚本身就是一种转化力。",
          "THERUIZ AURA 的上新可以温和，但不能模糊。该看清的地方看清，该留白的地方留白。"
        ])
    },
    {
      titles: ["新品要让人少一点不确定", "一组图讲清楚鞋型、颜色和穿着", "不催促，也能让人想试"],
      body: ({ firstScene, secondScene }) =>
        formatBodyParagraphs([
          `${firstScene}给第一眼的产品判断，${secondScene}给真实穿着判断。这两件事讲清楚，比堆很多卖点更有用。`,
          "我会看鞋底厚不厚、鞋头圆不圆、颜色会不会难搭，也会看它放进日常衣服里是不是自然。",
          "如果这些都稳，上新内容就不用很吵。看的人会自己知道要不要继续了解。"
        ])
    }
  ]
};

type StylingSolutionSceneTemplate = {
  titles: [string, string, string];
  body: (context: StylingSolutionSceneContext) => string;
};

type StylingSolutionSceneContext = StoryDrivenContext & {
  hasLowerBody: boolean;
  hasTrouserBreak: boolean;
  hasSeated: boolean;
  hasStillLife: boolean;
  hasMirror: boolean;
  hasWalking: boolean;
};

function hasDraftTag(selectedImageDrafts: SoftSeedingImageDraft[], tag: string) {
  return selectedImageDrafts.some((draft) => draft.tags?.includes(tag));
}

function hasDraftComposition(selectedImageDrafts: SoftSeedingImageDraft[], composition: string) {
  return selectedImageDrafts.some((draft) => draft.composition === composition);
}

function getStylingSolutionSceneContext(selectedImageDrafts: SoftSeedingImageDraft[]): StylingSolutionSceneContext {
  return {
    ...getStoryContext(selectedImageDrafts),
    hasLowerBody: hasDraftComposition(selectedImageDrafts, "lowerBody") || hasDraftTag(selectedImageDrafts, "lowerBody"),
    hasTrouserBreak: hasDraftTag(selectedImageDrafts, "trouserBreak"),
    hasSeated: hasDraftComposition(selectedImageDrafts, "seated") || hasDraftTag(selectedImageDrafts, "seated"),
    hasStillLife: hasDraftComposition(selectedImageDrafts, "stillLife") || hasDraftTag(selectedImageDrafts, "stillLife"),
    hasMirror: hasDraftComposition(selectedImageDrafts, "mirror") || hasDraftTag(selectedImageDrafts, "mirror"),
    hasWalking: hasDraftComposition(selectedImageDrafts, "walking") || hasDraftTag(selectedImageDrafts, "walking")
  };
}

const stylingSolutionSceneTemplates: StylingSolutionSceneTemplate[] = [
  {
    titles: ["早上先低头看一眼鞋", "裤脚和鞋子顺了，出门会省心", "这张不是自拍，但很有用"],
    body: ({ hasMirror }) =>
      formatBodyParagraphs([
        "早上换好裤子以后，我没有急着照镜子。",
        "先低头看了一眼脚下。裤脚刚好落在鞋面附近，没有把鞋舌压住，鞋头也没有被衬得很笨。",
        "这种小地方，站远了看全身反而不一定看得出来。尤其是直筒裤、牛仔裤这类常穿的裤子，裤脚和鞋子的关系一不顺，整套都会显得拖。",
        hasMirror ? "完整穿搭参考可以留到后面看，但第一眼我会先确认脚下这块是不是干净。" : "所以我现在做穿搭参考，会更想保留这种低头看的照片。",
        "不露脸，也不完整，但很有用。它能直接告诉你：这双鞋明天早上能不能接住衣柜里的那条裤子。"
      ])
  },
  {
    titles: ["通勤鞋先看脚下那一块", "门口停一下，就知道顺不顺", "普通裤子配它会不会拖"],
    body: ({ hasWalking }) =>
      formatBodyParagraphs([
        "今天出门前其实没怎么想搭配。",
        "白衬衫、直筒裤，包里塞了电脑。站在门口的时候，顺手低头看了一眼。",
        "裤脚刚好落在鞋面附近，没有把鞋头压住，鞋带也还是清楚的。",
        hasWalking
          ? "后来走到写字楼门口，小步往前的时候也没有显得笨，鞋底边缘和地面接触得很自然。"
          : "这种地方平时不太会注意，但真的决定一套衣服顺不顺。",
        "尤其是通勤鞋，如果鞋底太厚，或者鞋头显笨，走到写字楼门口就会觉得整个人往下坠一点。脚下这块如果干净，哪怕上半身穿得很普通，也不会乱。"
      ])
  },
  {
    titles: ["真正决定比例的，常常是裤脚", "全身照之前，我会先看这里", "鞋头有没有被压住很关键"],
    body: ({ hasTrouserBreak }) =>
      formatBodyParagraphs([
        "以前我看鞋子，会先看完整穿搭。",
        "后来发现，真正决定一套衣服顺不顺的，很多时候是脚下那一小块。",
        "裤脚落得太低，鞋头会被压住；鞋底如果太厚，整个人就容易往下沉。尤其是早上赶时间的时候，根本没有那么多精力重新搭一遍。",
        hasTrouserBreak
          ? "所以裤脚压鞋这张我会留着看。它不用漂亮，只要能看清裤脚停在哪里、鞋舌有没有被盖住。"
          : "所以这种局部比例照片反而很有参考感。",
        "能看清鞋头、鞋带、鞋底边缘，也能看清裤脚停在哪里。它不负责好看得很完整，只负责告诉你，这双鞋和日常裤装能不能接上。"
      ])
  },
  {
    titles: ["坐下来以后，鞋子会不会显笨", "咖啡馆里这张更接近日常", "坐姿也顺，才是真的好搭"],
    body: ({ hasSeated }) =>
      formatBodyParagraphs([
        "坐下来以后，鞋子好不好搭会更明显。",
        "站着的时候裤脚是顺的，不代表坐下以后也顺。有些鞋一坐下就显得很大，鞋头和鞋带全挤在一起，看起来会有点累赘。",
        hasSeated
          ? "在咖啡馆靠窗的位置坐下，包放在椅子边，低头刚好能看到鞋头那一块。比例还是轻的，没有被裤脚压得很闷。"
          : "所以我会留一张坐姿图。",
        "鞋头要清楚，鞋带要自然，裤脚不要乱堆在鞋面上。它不一定是最漂亮的一张，但对买鞋很有用。",
        "日常鞋最后看的不是某一个角度多惊艳，而是走路、坐下、出门、停下来，都能不能保持干净。"
      ])
  },
  {
    titles: ["一鞋多搭，不一定要拍很多套", "把鞋和衣服放近一点看", "省心的鞋，要先看衣柜能不能接住"],
    body: ({ hasStillLife }) =>
      formatBodyParagraphs([
        "一鞋多搭这件事，不一定要拍很多套完整穿搭。",
        hasStillLife
          ? "有时候把鞋子、折好的裤子和白衬衫放在同一块浅色台面上看，反而更直接。颜色能不能接上，材质会不会打架，一眼就知道。"
          : "有时候把鞋子和裤子放近一点看，反而更直接。",
        "裤子的颜色、裤脚的长度、鞋面的干净程度，这些小地方会决定它是不是能进衣柜。如果每次都要为了它重新想一身衣服，那它其实就不够省心。",
        "我更喜欢这种低头视角。没有完整脸，也没有很强的姿势，但能看出真实比例。",
        "对日常鞋来说，这比一张很会摆的照片更有说服力。"
      ])
  },
  {
    titles: ["出门前那几秒最真实", "鞋裤关系不顺，早上会很明显", "门边光线里看一眼就够"],
    body: () =>
      formatBodyParagraphs([
        "早上站在门口那几秒，其实很能看出一双鞋合不合适。",
        "包已经拎起来了，门边的光落在地面上，裤脚落下来刚好碰到鞋面。这个时候不会再为了拍照重新整理衣服，所以看到的状态反而真实。",
        "鞋头不能被裤脚压没，鞋带也不能乱成一团。鞋底边缘如果太厚，整个人会马上显得笨一点。",
        "我会更相信这种出门前的照片。",
        "它没有很完整，但它能告诉你：这双鞋是不是真的能跟着你过一个普通工作日。"
      ])
  },
  {
    titles: ["周末坐下，也要看鞋头", "咖啡馆里更能看出日常感", "站着顺，不代表坐下也顺"],
    body: () =>
      formatBodyParagraphs([
        "周末穿鞋，和上班那种判断又不太一样。",
        "坐下来以后，裤脚会自然堆一点，鞋头、鞋带、鞋面还清不清楚，这时候就特别明显。",
        "在咖啡馆靠窗的位置坐下，低头刚好能看到鞋头那一块。比例还是轻的，没有被裤脚压得很闷。",
        "我觉得这种状态挺重要。",
        "因为很多鞋站着看没问题，一坐下就显得很重。日常会反复穿的鞋，最后不是看某个角度多惊艳，而是走路、坐下、出门、停下来，都能不能维持一种干净的感觉。"
      ])
  },
  {
    titles: ["旅行里，鞋子要少一点存在感", "酒店出门前最能判断一双鞋", "行李箱旁边看鞋，反而真实"],
    body: () =>
      formatBodyParagraphs([
        "旅行里对鞋子的要求会更直接一点。",
        "在酒店换好衣服准备出门的时候，行李箱还摊在门边，裤脚落下来刚好碰到鞋面。那一下其实最能判断一双鞋适不适合带出来。",
        "它不能太抢，也不能太累，最好是你不用再专门为它重新想一套衣服。",
        "照片里它不是最先跳出来的，但真的走出去以后，会发现整天都没怎么想起它。",
        "对一双日常鞋来说，这反而是很高的评价。"
      ])
  }
];

function buildStylingSolutionSceneCopy(variantIndex: number, selectedImageDrafts: SoftSeedingImageDraft[]): TopicCopyDraft {
  const normalized = normalizeSoftVariantIndex(variantIndex, getTopicVariantCount("穿搭解决方案"));
  const template = stylingSolutionSceneTemplates[normalized % stylingSolutionSceneTemplates.length];
  const context = getStylingSolutionSceneContext(selectedImageDrafts);

  return {
    titles: template.titles.map(softenTitle),
    body: humanizeSoftSeedingBody(template.body(context)),
    tags: topicCopyKits["穿搭解决方案"].tags,
    note: storyDrivenNotes["穿搭解决方案"]
  };
}

function buildStoryDrivenCopy(topic: SoftSeedingTopic, variantIndex: number, selectedImageDrafts: SoftSeedingImageDraft[]) {
  const copyTopic = getCopyTopic(topic);
  if (copyTopic === "穿搭解决方案") {
    return buildStylingSolutionSceneCopy(variantIndex, selectedImageDrafts);
  }

  const templates = storyDrivenCopyTemplates[copyTopic];
  const normalized = normalizeSoftVariantIndex(variantIndex, getTopicVariantCount(topic));
  const template = templates[normalized % templates.length];
  const context = getStoryContext(selectedImageDrafts);

  return {
    titles: template.titles.map(softenTitle),
    body: humanizeSoftSeedingBody(template.body(context)),
    tags: topicCopyKits[copyTopic].tags,
    note: storyDrivenNotes[copyTopic]
  };
}

function buildReaderFacingTitles(topic: SoftSeedingCopyTopic, variantIndex: number) {
  const titles = readerTitleKits[topic];
  const normalized = normalizeSoftVariantIndex(variantIndex, getTopicVariantCount(topic));
  const permutationCount = titles.length * (titles.length - 1) * Math.max(1, titles.length - 2);
  const rank = (normalized * 37 + 11) % permutationCount;
  const firstIndex = rank % titles.length;
  const secondPool = titles.filter((_, index) => index !== firstIndex);
  const secondOrdinal = Math.floor(rank / titles.length) % secondPool.length;
  const secondTitle = secondPool[secondOrdinal];
  const thirdPool = secondPool.filter((title) => title !== secondTitle);
  const thirdOrdinal = Math.floor(rank / (titles.length * secondPool.length)) % thirdPool.length;

  return [titles[firstIndex], secondTitle, thirdPool[thirdOrdinal]].map(softenTitle);
}

function mergeCopyLines(base: string[], extra?: string[]) {
  return [...base, ...(extra ?? [])];
}

function getExpandedCopyKit(topic: SoftSeedingCopyTopic): TopicCopyKit {
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

function joinBodyLines(...lines: string[]) {
  return lines.filter(Boolean).join("\n");
}

function formatBodyParagraphs(lines: string[]) {
  const seen = new Set<string>();
  return lines
    .map(normalizeBodyParagraph)
    .filter(Boolean)
    .filter((line) => {
      if (seen.has(line)) return false;
      seen.add(line);
      return true;
    })
    .join("\n\n");
}

function normalizeBodyParagraph(line: string) {
  return line
    .replace(/\s+/g, " ")
    .replace(/([。！？；：])\s+(?=[\u4e00-\u9fff])/g, "$1")
    .replace(/。{2,}/g, "。")
    .trim();
}

function buildReaderFacingBody(topic: SoftSeedingCopyTopic, variantIndex: number, selectedImageDrafts: SoftSeedingImageDraft[]) {
  const kit = readerBodyKits[topic];
  const variantCount = getTopicVariantCount(topic);
  const normalized = normalizeSoftVariantIndex(variantIndex, variantCount);

  if (topic === "生活场景软种草") {
    return buildLifestyleBuyerShowBody(kit, normalized, selectedImageDrafts);
  }

  const opener = pickVariant(kit.openers, normalized, 3, variantCount);
  const observation = pickVariant(kit.observations, normalized, 5, variantCount);
  const sceneNote = pickVariant(kit.sceneNotes, normalized, 7, variantCount);
  const smallDetail = pickVariant(kit.smallDetails, normalized, 11, variantCount);
  const personalAngle = pickVariant(kit.personalAngles, normalized, 13, variantCount);
  const closing = pickVariant(kit.closings, normalized, 17, variantCount);
  const variants = [
    [opener, joinBodyLines(smallDetail, observation), sceneNote, joinBodyLines(personalAngle, closing)],
    [joinBodyLines(opener, smallDetail), joinBodyLines(sceneNote, observation), closing],
    [opener, observation, joinBodyLines(smallDetail, personalAngle), sceneNote, closing],
    [joinBodyLines(opener, observation), joinBodyLines(smallDetail, closing)],
    [opener, joinBodyLines(sceneNote, smallDetail), joinBodyLines(personalAngle, closing)],
    [joinBodyLines(opener, smallDetail), joinBodyLines(personalAngle, sceneNote), closing],
    [opener, sceneNote, joinBodyLines(smallDetail, observation), closing]
  ];

  return reduceRepeatedBodyIdeas(variants[variantIndex % variants.length].map(softenBodyText).join("\n\n"));
}

function buildLifestyleBuyerShowBody(
  kit: ReaderBodyKit,
  normalizedVariantIndex: number,
  selectedImageDrafts: SoftSeedingImageDraft[]
) {
  const primaryDraft = getPrimaryLifestyleDraft(selectedImageDrafts, normalizedVariantIndex);
  const primaryScene = primaryDraft?.scenePreference ?? "入户镜前";
  const fallbackStart = pickVariant(kit.openers, normalizedVariantIndex, 3, getTopicVariantCount("生活场景软种草"));

  return reduceRepeatedBodyIdeas(buildLifestyleNaturalNote(primaryScene, normalizedVariantIndex, fallbackStart));
}

function getPrimaryLifestyleDraft(selectedImageDrafts: SoftSeedingImageDraft[], normalizedVariantIndex: number) {
  if (!selectedImageDrafts.length) return undefined;
  return selectedImageDrafts[normalizedVariantIndex % selectedImageDrafts.length];
}

type LifestyleNaturalNoteKit = {
  starts: string[];
  sceneMoments: string[];
  shoeFeelings: string[];
  realDetails: string[];
  closings: string[];
};

const defaultLifestyleNaturalNoteKit: LifestyleNaturalNoteKit = {
  starts: [
    "今天就是普通出门，没有特意想穿得很完整。",
    "这张更像朋友随手拍的，不是提前准备好的图。",
    "我看日常鞋，还是更相信这种不太用力的照片。",
    "早上拿衣服的时候没想太多，只想穿得干净一点。",
    "这种鞋我不会只看静物，还是要放到真实一天里看。",
    "比起很会摆的图，我更想看它在普通场景里顺不顺。"
  ],
  sceneMoments: [
    "走出去以后发现脚下没有突兀，整套衣服也没有被鞋子打断。",
    "停下来拍一张，鞋头、鞋带和衣服下缘都还看得清楚。",
    "照片里有一点真实光影和衣服褶皱，反而更像我会穿出去的状态。",
    "没有很强的造型感，但人看起来是干净、舒服、能出门的。",
    "走路和停住的时候都不显笨，这点对日常鞋挺重要。",
    "它没有抢掉整套衣服，但脚下存在感是够的。"
  ],
  shoeFeelings: [
    "鞋底看着不厚，脚也没有被拍得很大。",
    "鞋型在真实路面上还是轻的，不会把比例往下压。",
    "它和牛仔、衬衫、针织这类常穿单品都能接上。",
    "脚下线条比较安静，不需要靠很夸张的搭配撑起来。",
    "鞋子不是第一眼很抓人的那种，但越放进日常越顺。",
    "这种干净的鞋型，反而更容易被我反复拿出来。"
  ],
  realDetails: [
    "画面不用修得太满，地面阴影和布料纹理留一点会更真实。",
    "包和咖啡只是被带到一点，像真的出门时顺手放在身边。",
    "手和站姿都很放松，像朋友按下快门前的那一秒。",
    "镜头没有贴得太近，整个人和鞋子的关系反而看得清。",
    "街边或室内背景带着一点生活痕迹，可信感会更强。",
    "衣服有一点自然垂坠感，鞋子看起来也更像真的穿在脚上。"
  ],
  closings: [
    "这种不费劲的干净感，会让我愿意把它留下来。",
    "不用把优点讲得很满，放进日常里就能看出来。",
    "对我来说，它更像能陪我走完一天的鞋。",
    "看完不会觉得被推着买，但会默默记住它。",
    "一双日常鞋能做到舒服、顺眼、比例不乱，就已经很加分。",
    "它最好的地方，是没有强行证明自己很好看。"
  ]
};

const lifestyleNaturalNoteKits: Partial<Record<TeamScenePreference, LifestyleNaturalNoteKit>> = {
  入户镜前: {
    starts: [
      "今天出门前只在镜子前看了一眼，没有特意搭很久。",
      "早上赶时间，拿了最常穿的衣服和这双鞋试了一下。",
      "镜前这类图我会认真看，因为比例骗不了人。",
      "出门前随手拍了一张，脸被手机挡住也没关系。",
      "这套没有什么复杂搭配，就是想看鞋子能不能接住日常衣服。",
      "我喜欢看这种镜前图，真实一点比精修图更有参考感。"
    ],
    sceneMoments: [
      "镜子里能看清鞋子和衣服下缘的关系，脚下没有突然跳出来。",
      "手机挡住脸之后，注意力反而回到穿着本身和鞋子比例上。",
      "站直和稍微放松一点都能看顺，出门前会安心很多。",
      "鞋子没有把整套衣服打断，普通上衣和裤装也能接得住。",
      "这种入户镜前的状态很真实，像准备出门前最后确认一下。",
      "不用摆得很满，鞋子完整露出来，整套顺就够了。"
    ],
    shoeFeelings: [
      "鞋底没有显得厚，脚下比例也没有被镜子拉大。",
      "鞋头和鞋带都清楚，和裤装或裙装下缘之间是干净的。",
      "它不是很抢眼，但能让出门前那一身看起来更完整。",
      "脚下很安静，不会让镜前图变成只看鞋的广告感。",
      "这种鞋放在入户镜里更像真实会穿出门的样子。",
      "鞋型保持得很轻，整个人看起来也没有被压住。"
    ],
    realDetails: [
      "镜子、地面和衣服褶皱不用太完美，真实一点反而耐看。",
      "包只是顺手放在旁边，没有抢掉鞋子和穿着关系。",
      "肩膀和手放松一点，画面会更像真实出门前的记录。",
      "裤脚或裙摆和鞋子之间留得清楚，脚下看起来更干净。",
      "镜头没有贴得太近，完整比例比局部精致更重要。",
      "光线柔的时候，比很亮的试衣间效果更舒服。"
    ],
    closings: [
      "我会存这种图，因为它真的能帮我判断要不要穿出门。",
      "这种不需要重新想搭配的鞋，才是早上最省心的。",
      "看起来不费劲，但整个人是干净的，这点很重要。",
      "它不是让人惊艳的鞋，是让出门变简单的鞋。",
      "如果镜前随手拍都顺，我会更相信它。",
      "这种安静的好搭感，比很会摆拍更打动我。"
    ]
  },
  写字楼门口: {
    starts: [
      "工作日穿鞋，我最怕走到公司门口就显得随便。",
      "这张是在写字楼门口停了一下，状态比我想象中自然。",
      "通勤鞋对我来说不用很亮眼，但一定不能拖累整个人。",
      "早上出门到公司楼下，才最能看出一双鞋是不是真的日常。",
      "我会更相信这种上班路上的照片，不是只站在棚里拍。",
      "工作日想穿得轻松一点，但也不能像随便出门。"
    ],
    sceneMoments: [
      "走到门口的时候鞋子还是干净的，衣服也没有被脚下带乱。",
      "楼下自然光和真实路面会把鞋底厚度看得很清楚。",
      "小步走的时候鞋型没有变笨，整个人看起来还是利落的。",
      "停在门口等人的那一秒，比刻意摆拍更像真实通勤。",
      "写字楼门口没有太多道具，干净的站姿就能看出状态。",
      "鞋子在工作日场景里不抢，也不显得太休闲。"
    ],
    shoeFeelings: [
      "鞋底线条比较薄，配通勤衣服不会显得重。",
      "脚下比例没有被拍大，走路时也能保持清楚轮廓。",
      "它和白衬衫、直筒裤、轻外套放在一起都很顺。",
      "鞋头不尖也不笨，通勤穿会更安心。",
      "这种干净鞋型能把通勤穿着放松一点，但不变随便。",
      "从早上穿到工作日中段，脚下还是体面的。"
    ],
    realDetails: [
      "路面阴影、玻璃反光和一点街道纵深保留着，会更像真实上班路。",
      "手里有咖啡或文件袋时，状态更像真实上班路。",
      "背景不靠奢华感，真实的楼下入口反而更可信。",
      "步子不大，鞋子和地面的接触看起来更自然。",
      "衣服有一点自然褶皱没关系，太平整反而像广告图。",
      "她不是一直盯着镜头，更像刚停下来被朋友拍到。"
    ],
    closings: [
      "这种能从早上接到下班的鞋，对我来说比第一眼惊艳更实用。",
      "工作日能穿得舒服但不随便，就已经很够了。",
      "我会把它归到那种不需要想太多、但不会出错的鞋。",
      "通勤场景里能成立，日常参考价值就很高。",
      "它不是为了抢镜，是为了让整个人看起来更顺。",
      "这种干净又不端着的状态，才像我会真的穿出门。"
    ]
  },
  咖啡店门口: {
    starts: [
      "周末去买咖啡，最适合看一双鞋是不是真的好搭。",
      "今天没怎么想穿搭，就是常穿的上衣、牛仔和一双干净的鞋。",
      "咖啡店门口这类照片，我反而会看得很认真。",
      "等咖啡那几分钟随手拍了一张，比特意摆拍更自然。",
      "周末出门不想穿得太用力，但也不想看起来没收拾。",
      "这种街边停留的场景，很容易看出鞋子会不会显脚大。"
    ],
    sceneMoments: [
      "坐下或站着等的时候，鞋头和鞋带都还能看清。",
      "咖啡杯和桌椅只是轻轻带到，画面没有变成道具照。",
      "人放松一点，鞋子和牛仔的关系反而更清楚。",
      "街边光线有一点阴影，整套看起来更像真实周末。",
      "鞋子没有抢掉咖啡店门口那种轻松感，脚下也不乱。",
      "停在那里聊天或等人时，脚下比例还是顺的。"
    ],
    shoeFeelings: [
      "鞋底没有显得厚，脚也没有被拍得很大。",
      "它和牛仔、衬衫这种基础单品放在一起很自然。",
      "鞋型安静，但不会在画面里消失。",
      "坐下时还能看清鞋子轮廓，这点挺加分。",
      "这种鞋不需要把周末穿得很精致，简单一点就能成立。",
      "脚下轻一点，整套周末穿着会更舒服。"
    ],
    realDetails: [
      "椅子、桌脚和地面都带着真实街边质感，不像棚搭出来的背景。",
      "衣服有一点坐下后的褶皱，会比完全平整更像日常。",
      "包放在旁边时没有挡住鞋子，脚下还是清楚的。",
      "光线和阴影都比较柔，整张图没有强卖感。",
      "手自然搭着杯子或椅背，像聊天中被随手拍到。",
      "背景里有一点真实街道感，会比空背景更有代入。"
    ],
    closings: [
      "这种周末随手照能看顺，我会觉得它是真的好搭。",
      "它没有让人很用力地注意鞋，但脚下就是干净的。",
      "对我来说，能接住周末普通衣服就很有用。",
      "这种不夸张的松弛感，比刻意拍得高级更容易种草。",
      "如果坐下和走路都顺，我会更愿意把它放进日常鞋柜。",
      "周末鞋不用太会表现，舒服、干净、比例顺就够了。"
    ]
  },
  "书店 / 杂志店门口": {
    starts: [
      "去书店的时候，我不太想穿得很用力。",
      "书店门口这种安静场景，很适合看鞋子会不会抢戏。",
      "今天只是顺路进去翻杂志，穿得越简单越舒服。",
      "这张不是为了打卡拍的，反而更像真实出门状态。",
      "我喜欢这种有点安静的街边照片，能看出整套的气质。",
      "书店门口的图不用很满，鞋子和衣服顺就好。"
    ],
    sceneMoments: [
      "拿着书站一下，鞋子没有把画面的安静感打断。",
      "门口的光和墙面都很轻，整个人看起来也不紧绷。",
      "鞋子在书店门口不抢，但能把整套衣服接住。",
      "停下来翻书或等朋友的时候，脚下还是清楚的。",
      "这种慢一点的场景里，鞋子不能太强，也不能太没存在感。",
      "没有刻意摆姿势，反而更像她真的会这样出门。"
    ],
    shoeFeelings: [
      "鞋型很干净，和书、包、浅色衣服放在一起是顺的。",
      "脚下没有变重，整套安静感还能保住。",
      "鞋底线条比较轻，不会把书店场景拍成运动感。",
      "它和裙装或裤装都能接上，不会突然跳出来。",
      "鞋子存在感刚好，能看见，但不吵。",
      "这种不抢的鞋，反而适合长时间放在衣柜里。"
    ],
    realDetails: [
      "书和杂志只被带到一点，没有堆成布景。",
      "背景店面看起来真实，没有很假的大字招牌。",
      "衣服和头发有一点自然状态，会比完美摆拍更舒服。",
      "书袋或裙摆没有挡住鞋子，一只鞋的轮廓也能看清。",
      "画面留白多，像真实逛书店时慢下来的一刻。",
      "手上只是拿着一本书，状态很轻。"
    ],
    closings: [
      "这种安静日常里还能成立，说明它不是只能通勤穿。",
      "它没有破坏整个人的干净感，这点让我很有好感。",
      "不是很抓眼，但越看越像会反复穿的鞋。",
      "这种鞋放在普通周末里，反而更容易被记住。",
      "书店门口都能看顺，日常感就很稳。",
      "它不需要制造亮点，能把一身衣服接顺就很好。"
    ]
  },
  酒店房间: {
    starts: [
      "短途出门时，我会特别在意鞋子能不能少带一双。",
      "酒店房间镜前这类图很实用，能看出鞋子到底好不好搭。",
      "出差或旅行时，鞋子最好别让穿衣服变复杂。",
      "整理好行李准备出门时，最能看出一双鞋是不是省心。",
      "我不太喜欢很游客感的旅行穿搭，干净舒服就够了。",
      "酒店里随手拍一张，比单独说百搭更有说服力。"
    ],
    sceneMoments: [
      "镜子里能看清鞋子和行李里那几件衣服是不是接得上。",
      "房间光线比较干净，鞋型和整个人比例会更容易判断。",
      "坐在床边或站在镜前，鞋子都没有被行李和衣服挡住。",
      "这个场景不豪华也没关系，整齐、安静、能出门就好。",
      "行李角落只露出一点，重点还是她准备出门的状态。",
      "短途旅行的衣服有限，鞋子能不能多搭几套会很明显。"
    ],
    shoeFeelings: [
      "它能接住基础衣服，出门不用再为鞋子重新想一套。",
      "鞋底看起来轻，旅行场景里不会显得笨重。",
      "鞋子完整露出来，才看得出它是不是真的适合带出门。",
      "它不是很强的旅行单品，更像能自然跟着走几天的鞋。",
      "脚下比例顺，镜前整理行李那一刻就会安心很多。",
      "这种低调鞋型，在酒店房间里看也不会像临时凑的。"
    ],
    realDetails: [
      "行李打开一点点，状态还是整齐的。",
      "床边、衣架和窗光保持干净，画面会更有秩序感。",
      "脸被手机挡住也不影响判断，鞋子和衣服比例是清楚的。",
      "酒店没有被拍成浮夸打卡照，安静一点更像真实出门前。",
      "衣服放得比较整齐，鞋子会更像整个行程里的稳定项。",
      "背景带一点生活痕迹，但没有乱到分散注意力。"
    ],
    closings: [
      "这种能陪我从白天走到晚上的鞋，旅行时会更想带。",
      "它不是为了拍旅行大片，是为了让出门少一点纠结。",
      "如果酒店镜前都看顺，我会觉得它真的能省行李。",
      "这种稳定的好搭感，对短途出门很重要。",
      "一双鞋能接住几套衣服，比单独好看更有用。",
      "它最像那种被默默放进行李箱的日常鞋。"
    ]
  }
};

const lifestyleNaturalSceneFallbacks: Partial<Record<TeamScenePreference, keyof typeof lifestyleNaturalNoteKits>> = {
  通勤上班: "写字楼门口",
  商务区转角: "写字楼门口",
  停车后步行去办公室: "写字楼门口",
  "楼下便利店 / 咖啡外带": "咖啡店门口",
  "衣帽间 / 更衣角": "入户镜前",
  居家衣帽间: "入户镜前",
};

const lifestyleNaturalTinyNotes = [
  "我会喜欢这种有一点真实痕迹的照片。",
  "这种图不用很满，留一点呼吸感更舒服。",
  "看到这种状态，会更容易想到自己早上直接穿它出门。",
  "它不是一眼很热闹的鞋，胜在耐看。",
  "对日常鞋来说，脚下不乱已经很重要。",
  "这类上脚图会让我愿意继续看下一张。",
  "整套没有很用力的完成感，反而更像真实一天。",
  "这种鞋适合和常穿衣服慢慢磨合。",
  "它的存在感很轻，但不是没存在感。",
  "我会把它归到省心但不敷衍的那一类。"
];

function pickLifestyleLine(lines: string[], normalizedVariantIndex: number, salt: number) {
  return lines[Math.floor(normalizedVariantIndex / salt) % lines.length];
}

function getLifestyleNaturalNoteKit(scenePreference: TeamScenePreference) {
  const directKit = lifestyleNaturalNoteKits[scenePreference];
  if (directKit) return directKit;

  const fallbackScene = lifestyleNaturalSceneFallbacks[scenePreference];
  return fallbackScene ? lifestyleNaturalNoteKits[fallbackScene] ?? defaultLifestyleNaturalNoteKit : defaultLifestyleNaturalNoteKit;
}

function buildLifestyleNaturalNote(
  scenePreference: TeamScenePreference,
  normalizedVariantIndex: number,
  fallbackStart: string
) {
  const kit = getLifestyleNaturalNoteKit(scenePreference);
  const start = pickLifestyleLine(kit.starts, normalizedVariantIndex, 1) || fallbackStart;
  const moment = pickLifestyleLine(kit.sceneMoments, normalizedVariantIndex, 7);
  const shoeFeeling = pickLifestyleLine(kit.shoeFeelings, normalizedVariantIndex, 11);
  const realDetail = pickLifestyleLine(kit.realDetails, normalizedVariantIndex, 13);
  const closing = pickLifestyleLine(kit.closings, normalizedVariantIndex, 17);
  const tinyNote = pickLifestyleLine(lifestyleNaturalTinyNotes, normalizedVariantIndex, 19);
  const templateIndex = normalizedVariantIndex % 10;
  const templates = [
    [start, `${moment}${shoeFeeling}`, `${realDetail}${closing}`, tinyNote],
    [`${start}${moment}`, `${shoeFeeling}${realDetail}`, `${closing}${tinyNote}`],
    [start, moment, `${shoeFeeling}${closing}`, tinyNote],
    [`${start}${shoeFeeling}`, realDetail, `${closing}${tinyNote}`],
    [start, `${moment}${realDetail}`, `${shoeFeeling}${closing}`, tinyNote],
    [`${start}${realDetail}`, shoeFeeling, `${closing}${tinyNote}`],
    [moment, `${shoeFeeling}${realDetail}`, closing, tinyNote],
    [start, `${moment}${shoeFeeling}${realDetail}`, `${closing}${tinyNote}`],
    [`${start}${moment}`, shoeFeeling, `${realDetail}${closing}`, tinyNote],
    [start, `${moment}${shoeFeeling}`, `${closing}${tinyNote}`]
  ];

  return formatBodyParagraphs(templates[templateIndex].map(softenBodyText));
}

const titleHumanizerReplacements: Array<[RegExp, string]> = [
  [/今天这双鞋，赢在不费劲/g, "今天出门没多想"],
  [/不是很抓马，但真的好穿/g, "不抓眼，但挺顺脚"],
  [/这种日常上脚图我会存/g, "这种日常上脚图我会多看一眼"],
  [/普通一天也能穿得干净/g, "普通工作日也能穿得顺"],
  [/这双鞋放进日常里更好看/g, "放进日常里反而更好看"],
  [/不用特别会搭，也能体面出门/g, "不用很会搭，也能体面出门"],
  [/走了一下午，鞋型还挺干净/g, "走了一下午，鞋型还是干净的"],
  [/这类上脚图我会认真看/g, "这种上脚图我会多停一下"],
  [/不是精修大片，但很像真实穿着/g, "不像大片，反而有参考"],
  [/买家秀里这种图最有参考感/g, "买家秀我更想看这种"],
  [/一双鞋能不能常穿，看这种照片/g, "会不会常穿，看这种照片"],
  [/不是讲故事，是看取舍/g, "少讲一点故事，多看细节"],
  [/这些不是装饰，是产品判断/g, "这些小东西都算产品判断"],
  [/鞋带和色卡真的不是随便选/g, "鞋带和色卡都要慢慢选"],
  [/这不是摆拍工作台/g, "工作台别摆得太满"],
  [/工作台上能看出一双鞋的性格/g, "工作台上能看出很多取舍"],
  [/不是越咖越高级/g, "咖色别做得太重"],
  [/低饱和不是没颜色/g, "低饱和也可以有颜色"],
  [/裤装裙装都要看上脚比例/g, "裤装裙装都要看脚下比例"],
  [/这套不是惊艳，但很省心/g, "这套不惊艳，但省心"],
  [/比例顺，比多一个亮点更重要/g, "比例顺，比亮点更耐看"],
  [/一双鞋解决的不是造型，是省心/g, "好搭这件事，最后是省心"],
  [/高级感不是把生活拍空/g, "高级感别拍成空房间"],
  [/她的衣柜比口号更有说服力/g, "她的衣柜比口号更可信"],
  [/不是卖货图，也不是空氛围/g, "生活感要留一点"],
  [/这张不是自拍，但很有用/g, "这张图很有用"],
  [/不是穿搭教程，是明天能用/g, "明天能照着穿"],
  [/不是摆拍，是可以代入的日常/g, "像可以代入的日常"],
  [/不是网红感，而是日常里的审美判断/g, "日常里的审美判断"],
  [/不是特别会穿，也能穿得干净/g, "不费力，也能穿得干净"],
  [/产品开发幕后，不只是一张工作台/g, "产品开发幕后，看工作台之外"],
  [/质感不是靠滤镜撑出来的/g, "质感别靠滤镜撑"],
  [/这不是一张工作台能讲完的审美/g, "审美别只留在工作台"],
  [/静物看鞋型，上脚看比例/g, "先看鞋型，再看上脚"],
  [/这组上新图要帮人做判断/g, "这组上新图要让人看明白"],
  [/上新先别急着催人买/g, "上新先让人看清楚"],
  [/不是越深越高级，而是比例和温度要对/g, "颜色深浅，关键看比例和温度"],
  [/上新不用喊得很大声/g, "上新可以安静一点"],
  [/内容逻辑/g, "内容思路"],
  [/品牌审美观点/g, "品牌审美"],
  [/购买判断/g, "下单前判断"],
  [/转化/g, "上新"]
];

const bodyHumanizerReplacements: Array<[RegExp, string]> = [
  [/不是为了把鞋拍得很满/g, "不需要把鞋拍得很满"],
  [/不是为了制造忙碌感/g, "不用拍出很忙的样子"],
  [/不是为了卖弄工艺，而是让人知道/g, "少讲工艺词，直接让人看到"],
  [/不是做一张漂亮色卡图，而是想看/g, "不只看一张漂亮色卡图，还是要看"],
  [/不是看它有多亮，而是看/g, "我不太看亮不亮，更看"],
  [/不是单独存在的/g, "不能单独看"],
  [/不是告诉你必须怎么穿，而是帮你少踩雷/g, "它要帮你少踩雷，不是规定你必须怎么穿"],
  [/重点不是摆出一套标准答案，而是看鞋子能不能接住不同状态/g, "我更想看鞋子能不能接住不同状态"],
  [/不是为了抢镜，是为了让/g, "不用抢镜，只要让"],
  [/不是展示很多东西，而是每样东西都刚好/g, "东西不用多，每样放得刚好就行"],
  [/不是冷冰冰的极简，也不是很用力的贵气/g, "它不该冷，也不该端着"],
  [/不是品牌硬塞进来的画面/g, "不该像品牌硬塞进来的画面"],
  [/不是凌乱，而是让人相信/g, "不需要凌乱，只要让人相信"],
  [/不是为了把参数讲满，而是让人知道/g, "不用把参数讲满，能让人看见"],
  [/不是为了拍旅行大片，是为了让/g, "不用拍成旅行大片，只要让"],
  [/不是为了显得专业，而是/g, "不用显得专业，"],
  [/不是为了做氛围，而是为了/g, "不是只做氛围，也要"],
  [/不是一眼很热闹的鞋/g, "不是第一眼很热闹的鞋"],
  [/好搭不是每一套都惊艳，而是/g, "好搭不需要每一套都惊艳，关键是"],
  [/不是某一个角度多惊艳，而是/g, "不看某一个角度多惊艳，更看"],
  [/买家秀不是越精致越好，而是越能看出/g, "买家秀不用特别精致，能看出"],
  [/周末鞋不用太会表现，舒服、干净、比例顺就够了。/g, "周末穿鞋，我更在意它自然不自然。舒服、干净，比例别乱，就够了。"],
  [/整套没有很用力的完成感，反而更像真实一天。/g, "整套没有刻意凹完整造型，反而更像真实出门的一天。"],
  [/这类上脚图会让我愿意继续看下一张。/g, "这种上脚图，我会愿意继续往下翻。"],
  [/如果桌面太像展览，反而少了小品牌真实做产品的感觉。/g, "桌面太像展览，会少一点小品牌做产品的真实感。"],
  [/把过程拍得克制一点，产品反而更有质感。/g, "过程少一点表演，产品细节会更清楚。"],
  [/衣帽间和安静街角能看出这个颜色是不是真的能进入日常。/g, "放到衣帽间和安静街角里看，更容易判断这个颜色日常不日常。"],
  [/如果整身已经有重量，鞋子就要留一点呼吸感。/g, "如果整身已经偏重，鞋子这里就要轻一点。"],
  [/这种记忆点不用大声推，颜色自己会慢慢留下来。/g, "这种颜色不用大声推，看久了会自己留下印象。"],
  [/朋友午餐、酒店房间和城市街角这些地方，能让穿搭从图片回到真实生活。/g, "朋友午餐、酒店房间、城市街角这些地方，会让穿搭更像真的要穿出去。"],
  [/这类穿搭最后还是要回到：明天能不能用。/g, "说到底，明天能不能照着穿才重要。"],
  [/工艺笔记最好让人知道怎么判断，而不是只觉得品牌很会说。/g, "细节笔记最好教人看哪里，不要只让人觉得品牌很会说。"],
  [/细节笔记最好让人知道怎么判断，而不是只觉得品牌很会说。/g, "细节这里要讲得具体一点，不要只让人觉得品牌很会说。"],
  [/质感，经得起近看。/g, "近看也站得住，质感才算稳。"],
  [/我看鞋子质感，会先看它有没有被拍得太假。/g, "我会先看它有没有被拍得太假，再判断质感。"],
  [/很多质感其实都藏在这些小地方。/g, "很多细节其实都藏在这些小地方。"],
  [/材质讲得越清楚，距离感反而越少。/g, "材质讲清楚一点，距离感会少很多。"],
  [/品牌审美，是看多几张图之后仍然觉得统一。/g, "品牌审美要看多几张图，还是不是同一个气质。"],
  [/新品图可以直接一点，但语气不需要写得很满。/g, "新品图可以直接一点，话不用说得太满。"],
  [/活动信息可以放轻一点，画面先把颜色和上脚讲清楚。/g, "活动信息轻一点，先把颜色和上脚讲清楚。"],
  [/活动信息越克制，产品本身越要拍准确。/g, "活动信息越轻，产品越要拍准确。"],
  [/镜前图看比例，走路图看鞋子会不会自然，材质图看细节。/g, "镜前图可以看比例，走路图能看鞋子自然不自然，材质图负责看细节。"],
  [/每张图最好回答一个问题，不要重复同一种角度。/g, "每张图回答一个问题就够了，别一直重复同一种角度。"],
  [/比起催促下单，我更想知道它适不适合自己的衣柜。/g, "比起催我下单，我更想先知道它能不能放进自己的衣柜。"],
  [/上新笔记的重点，是让人少一点不确定。/g, "上新笔记最好先把不确定的地方讲清楚。"],
  [/上新笔记最好先把不确定的地方讲清楚。/g, "我希望它先把不确定的地方讲清楚。"],
  [/上新笔记如果一上来就催人下单/g, "如果一上来就催人下单"],
  [/温和一点的上新，反而更符合 THERUIZ AURA。/g, "上新可以温和一点，这样更像 THERUIZ AURA。"],
  [/一双秋冬鞋如果能让厚衣服轻一点，它的实穿价值会很高。/g, "厚衣服已经有重量了，鞋子能让整套轻一点，就很实穿。"],
  [/低饱和不是没有颜色，而是让颜色更容易进入成熟衣柜。/g, "低饱和不是没颜色，是更容易放进成熟衣柜。"],
  [/温感静奢不是暖色堆叠，而是刚刚好的灰度。/g, "温感静奢更像刚刚好的灰度，暖一点，但不堆满。"],
  [/品牌感不是把 Logo 放大，而是每个选择都稳定。/g, "品牌感不靠放大 Logo，靠每个选择都稳定。"],
  [/我想看的不是品牌告诉我它很高级，而是它有没有一套稳定的生活判断。/g, "我想看的不是一句高级感，是它有没有一套稳定的生活判断。"],
  [/安静不是空，克制也不是少内容，而是每个东西都刚好。/g, "安静要有内容，克制也要有细节，每个东西刚好就够。"],
  [/如果这两点都顺，它就不是只适合拍照的鞋。/g, "这两点都顺，它就不只适合拍照。"],
  [/这种鞋不用把话说满。/g, "这种鞋不用说太满。"],
  [/这种过程记录最好安静，但不能空。/g, "过程记录可以安静，但不能空。"],
  [/这种内容不急着说服谁。/g, "这种内容不用急着说服谁。"],
  [/这种上新不靠很重的促销语气。/g, "上新不用靠很重的促销语气。"],
  [/它能直接告诉你：/g, "它能说明："],
  [/这类内容不需要/g, "这种内容不用"],
  [/这类画面/g, "这种画面"],
  [/这种画面要/g, "这种画面需要"],
  [/我会被这种图种草，是因为/g, "我会多看一眼这种图，是因为"],
  [/我会希望/g, "我希望"],
  [/我会特别在意/g, "我比较在意"],
  [/我更喜欢/g, "我会更偏向"],
  [/品牌感应该/g, "品牌感会"],
  [/最重要的是/g, "先看"],
  [/真正有用的是/g, "有用的是"],
  [/真正重要的是/g, "更重要的是"],
  [/真正耐看的/g, "耐看的"],
  [/真正省心/g, "够省心"],
  [/真正会/g, "会"],
  [/真正的/g, ""],
  [/真正/g, ""],
  [/可抄的地方/g, "参考感"],
  [/参考价值/g, "参考感"],
  [/说服力/g, "可信感"],
  [/消费决策/g, "下单前的判断"],
  [/商品表达/g, "商品画面"],
  [/商业表达/g, "商业感"],
  [/很强的/g, "太重的"],
  [/非常/g, "很"]
];

function applyTextReplacements(text: string, replacements: Array<[RegExp, string]>) {
  return replacements.reduce((current, [pattern, replacement]) => current.replace(pattern, replacement), text);
}

function softenTitle(title: string) {
  return applyTextReplacements(title, titleHumanizerReplacements).replace(/\s+/g, " ").trim();
}

function softenBodyText(text: string) {
  return text
    .replace(/内容价值/g, "参考意义")
    .replace(/参考意义/g, "参考感")
    .replace(/购买理由/g, "判断理由")
    .replace(/转化内容/g, "上新笔记")
    .replace(/上新内容/g, "上新笔记")
    .replace(/穿搭内容/g, "这类穿搭")
    .replace(/审美内容/g, "这类笔记")
    .replace(/工艺内容/g, "细节笔记")
    .replace(/材质内容/g, "材质笔记")
    .replace(/幕后内容/g, "幕后这部分")
    .replace(/品牌可信度/g, "可信一点")
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
    .replace(/真正会让我停下来看的，通常不是很满的商品照。/g, "我会停下来看一眼的图，通常不是很满的商品照。")
    .replace(/真正会让我停下来看的/g, "我会停下来看一眼的图")
    .replace(/真正的/g, "")
    .replace(/判断会/g, "心里会")
    .replace(
      /当前鞋款默认使用猪皮内里；如果画面拍到内里，就要保持真实，不要把材质写得很花。/g,
      "如果画面拍到内里，材质表达要保持真实，不要写得很花。"
    )
    .trim();
}

function humanizeSoftSeedingBody(text: string) {
  const softened = softenBodyText(text);
  const paragraphs = softened
    .split(/\n{2,}/)
    .map((paragraph) => applyTextReplacements(paragraph, bodyHumanizerReplacements))
    .map(normalizeBodyParagraph)
    .filter(Boolean);

  return reduceRepeatedBodyIdeas(softenParagraphFlow(compactOverShortParagraphs(paragraphs)).join("\n\n"));
}

function softenParagraphFlow(paragraphs: string[]) {
  return paragraphs.map((paragraph) => {
    const sentenceCount = (paragraph.match(/。/g) ?? []).length;
    if (sentenceCount < 2) return paragraph;

    return paragraph
      .replace(/。坐下时还能/g, "。坐下来的时候再看一眼，还能")
      .replace(/。包放在旁边时/g, "。包放在旁边的时候")
      .replace(/。手里有咖啡或文件袋时/g, "。手里有咖啡或文件袋的时候")
      .replace(/。桌面干净一点/g, "。再看桌面，干净一点")
      .replace(/。开发台面不用很满/g, "。开发台面也不用很满")
      .replace(/。过程少一点表演/g, "。到了过程这部分，少一点表演")
      .replace(/。我会把牛仔/g, "。放回衣柜里看，我会把牛仔")
      .replace(/。厚衣服已经有重量了/g, "。毕竟厚衣服已经有重量了")
      .replace(/。放到衣帽间和安静街角里看/g, "。再放到衣帽间和安静街角里看")
      .replace(/。如果整身已经偏重/g, "。如果整身已经偏重")
      .replace(/。朋友午餐、酒店房间、城市街角这些地方/g, "。换到朋友午餐、酒店房间、城市街角这些地方")
      .replace(/。比例顺了/g, "。比例顺了以后")
      .replace(/。鞋带如果太假/g, "。但鞋带如果太假")
      .replace(/。细节这里要讲得具体一点/g, "。所以细节这里要讲得具体一点")
      .replace(/。近一点看鞋头/g, "。再近一点看鞋头")
      .replace(/。她的衣柜、桌面、书、城市街角/g, "。再看她的衣柜、桌面、书、城市街角")
      .replace(/。她的城市、衣柜和桌面一起出现/g, "。这些东西一起出现时")
      .replace(/。如果画面能让人想到自己的生活/g, "。如果画面能让人想到自己的生活")
      .replace(/。拍摄花絮点到为止/g, "。拍摄花絮这里点到为止")
      .replace(/。活动信息轻一点/g, "。活动信息轻一点")
      .replace(/。比起催我下单/g, "。比起催我下单")
      .replace(/。我希望它先把不确定的地方讲清楚/g, "。说到底，我希望它先把不确定的地方讲清楚");
  });
}

function compactOverShortParagraphs(paragraphs: string[]) {
  const compacted = paragraphs.reduce<string[]>((output, paragraph) => {
    const previous = output[output.length - 1];
    if (previous && paragraph.length <= 18 && previous.length <= 80) {
      output[output.length - 1] = `${previous}${paragraph}`;
      return output;
    }
    output.push(paragraph);
    return output;
  }, []);

  if (compacted.length > 1 && compacted[0].length <= 28 && compacted[1].length <= 44) {
    const [first, second, ...rest] = compacted;
    return [`${first}${second}`, ...rest];
  }

  return compacted;
}

function reduceRepeatedBodyIdeas(body: string) {
  if (body.includes("猪皮内里") && body.includes("如果画面拍到内里，材质表达要保持真实，不要写得很花。")) {
    return body
      .replace(/\n\n如果画面拍到内里，材质表达要保持真实，不要写得很花。/g, "")
      .replace(/如果画面拍到内里，材质表达要保持真实，不要写得很花。\n\n/g, "");
  }

  return body;
}

const readerTitleKits: Record<SoftSeedingCopyTopic, ReaderTitleKit> = {
  生活场景软种草: [
    "今天这双鞋，赢在不费劲",
    "不是很抓马，但真的好穿",
    "出门前随手拍的一套",
    "这种日常上脚图我会存",
    "鞋子安静一点，整套反而顺了",
    "普通一天也能穿得干净",
    "这双鞋放进日常里更好看",
    "不用特别会搭，也能体面出门",
    "咖啡店门口这套有点顺",
    "鞋子不抢戏，但很加分",
    "走了一下午，鞋型还挺干净",
    "买家秀里这种图最有参考感",
    "上班穿到晚上也没乱掉",
    "不是精修大片，但很像真实穿着",
    "这双鞋比我想象中好搭",
    "周末出门随便一套也能接住",
    "镜前看不明显，走出去反而顺",
    "买花那天穿它刚好",
    "咖啡店坐下也能看清鞋子",
    "普通牛仔配它就够了",
    "这类真实反馈我会认真看",
    "不显脚大这一点很重要",
    "出差带这一双就够省心",
    "走路那张比静物更种草"
  ],
  产品开发幕后: [
    "桌面上这几个细节挺关键",
    "样鞋阶段最容易看出取舍",
    "这不是摆拍工作台",
    "鞋带和色卡真的不是随便选",
    "一双鞋变耐看，靠这些小地方",
    "幕后不用很满，真实一点就够",
    "今天只看几个小细节",
    "比起讲故事，我更想看取舍",
    "工作台上有一点真实痕迹",
    "少一点装饰，反而更像它"
  ],
  秋冬配色实验室: [
    "秋冬鞋色别选太重",
    "咖色要灰一点才耐看",
    "燕麦色放进衣柜里看更准",
    "这组颜色不是第一眼抢的那种",
    "厚衣服下面，鞋子要轻一点",
    "秋冬配色我更看温度",
    "咖啡棕别拍得太浓",
    "低饱和不是没颜色",
    "这几个秋冬色可以慢慢看",
    "鞋色顺了，整套就没那么沉"
  ],
  穿搭解决方案: [
    "明天不知道穿什么，可以从鞋开始",
    "这套不是惊艳，但很省心",
    "一鞋多搭别拍成公式",
    "早上少纠结的一点办法",
    "裤装裙装都要看上脚比例",
    "鞋子稳了，整套就顺了",
    "通勤和周末都能接住才算好搭",
    "这双鞋更像衣柜里的连接项",
    "不是穿搭教程，是明天能用",
    "比例顺，比多一个亮点更重要"
  ],
  材质工艺认知: [
    "别只看颜色，先看鞋头",
    "鞋带位置一乱就很明显",
    "质感不是靠滤镜撑出来的",
    "近看也要成立，才是真的细节",
    "这几个地方决定鞋子显不显笨",
    "材质图别拍成说明书",
    "我会先看鞋底线条",
    "鞋型准，比形容词有用",
    "好不好穿，有些细节会先露出来",
    "材质要真实，不要太亮"
  ],
  品牌审美观点: [
    "高级感别拍冷了",
    "我更相信能放进生活里的画面",
    "安静不是空，克制也不是没内容",
    "她的衣柜比口号更有说服力",
    "日常能用，才是真的好看",
    "别把品牌感拍成距离感",
    "温感静奢应该是能穿出门的",
    "好看的画面不一定要很满",
    "这不是一张工作台能讲完的审美",
    "干净但要有人的温度"
  ],
  上新活动转化: [
    "上新先别急着催人买",
    "我会先看鞋型和上脚比例",
    "新品图清楚一点就够了",
    "这组上新图要帮人做判断",
    "先看能不能进衣柜",
    "静物看鞋型，上脚看比例",
    "活动信息轻一点，产品拍准一点",
    "这双鞋值不值得试，先看这些",
    "上新别太吵，东西要清楚",
    "看完能判断，比写满更重要"
  ]
};

const readerBodyKits: Record<SoftSeedingCopyTopic, ReaderBodyKit> = {
  生活场景软种草: {
    openers: [
      "这种买家秀我会多看两眼，因为不像刻意拍出来的。",
      "我更相信真实穿了一天之后的反馈。",
      "如果只是精修静物，我其实很难判断它适不适合我。",
      "这类上脚图最有用的地方，是能看出它在日常里顺不顺。",
      "买鞋之前，我会先看它和普通衣服放在一起的样子。",
      "比起很会拍的大片，我更想看一张真实出门照。",
      "这种反馈不用写得很夸张，照片里状态自然就够了。",
      "我会认真看那种下班后、咖啡店门口、路边随手拍的上脚图。"
    ],
    observations: [
      "白衬衫、牛仔、针织和托特包这些很普通的衣服，反而最能看出鞋子好不好搭。",
      "走路、停下、坐下时鞋子还清楚，比例才算真的顺。",
      "如果走了一下午，裤脚和鞋子还是干净的，这种反馈比夸它好看更有用。",
      "鞋子安静一点没关系，但不能弱到看不出它怎么接住整套穿着。",
      "买家秀最重要的是别把脚拍得很大，也别把鞋子裁掉。",
      "看起来舒服但不随便，这点对日常鞋来说很重要。",
      "如果只是站着好看，参考价值会少很多；走路和坐下的状态也要顺。",
      "鞋头不显笨、鞋底不显厚，整个人比例才不会被压住。"
    ],
    sceneNotes: [
      "咖啡店门口、写字楼外面、书店门口这种普通地方，反而比大场景更有代入感。",
      "有一点街道痕迹、有一点生活节奏，照片会比过度干净的背景更可信。",
      "她可能只是等咖啡、顺路买花，或者从门口走出来，鞋子在这些瞬间出现得最自然。",
      "一杯咖啡、一本书、一个包就够了，道具太多会把日常感冲淡。",
      "下班后在写字楼门口停一下，这种图比刻意摆拍更像真实反馈。",
      "周末去买花、逛书店、顺路喝咖啡，鞋子能自然出现就很好。",
      "旅行酒店镜前那种图也有用，因为能看出一双鞋能不能省行李。",
      "如果是在社区步道或安静街角，背景有一点生活痕迹会更像买家秀。"
    ],
    smallDetails: [
      "袖口卷起来一点、包放在椅子旁边，这种小地方会让图更像真的出门。",
      "鞋子不用占满画面，能在脚下清楚露出来就够了。",
      "路边有一点树影、杯子放在桌角，照片会松很多。",
      "我会留意她站住那一秒的状态，而不是刻意摆出来的姿势。",
      "衣服下缘和鞋子之间留一点干净空隙，整套会轻很多。",
      "如果坐下时还能看清鞋头和鞋带，这张图就很有参考感。",
      "托特包、纸袋、花束都可以很轻，别把画面堆满。",
      "鞋子最好至少有一只完整露出来，不然买家秀的参考价值会掉很多。",
      "真实反馈里可以有一点阴影和路面纹理，不需要干净得像棚拍。",
      "手自然拿杯子或扶包就好，不需要摆很用力的姿势。"
    ],
    personalAngles: [
      "我会把它当成衣柜里的连接项，而不是某一套造型的亮点。",
      "看完如果能想到自己的三件衣服，这篇就比单纯好看更有可抄的地方。",
      "轻熟日常最怕用力过度，干净、舒服、体面其实已经很难得。",
      "它最好像一个早上不用纠结的答案，不需要每次出门都重新搭。",
      "如果能从上班穿到晚饭，还不显得狼狈，我会觉得很加分。",
      "对我来说，买家秀不是越精致越好，而是越能看出真实使用状态越好。",
      "一双鞋能不能长期穿，很多时候看这种普通照片就能大概判断。",
      "我会更相信那种没有强滤镜、没有大姿势、但鞋子和衣服都看得清的图。"
    ],
    closings: [
      "这种种草轻一点就好，让看到的人自己判断它能不能进自己的生活。",
      "能被自然穿出门，比单独说好穿更有用。",
      "如果一双鞋能让早晨少纠结一点，就值得被认真记录。",
      "我希望它留下的是一种干净的日常感，而不是广告感。",
      "买家秀不用太完美，真实、清楚、比例顺就够了。",
      "这种图如果能让我少试几套衣服，就已经很有用。",
      "看完不会立刻被推着买，但会慢慢记住它。",
      "对日常鞋来说，这种不费劲的好穿感反而最重要。"
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
      "棚拍边缘、造型桌和样鞋局部留一点就够了，别让设备和背景抢走细节。",
      "如果桌面太像展览，反而少了小品牌真实做产品的感觉。"
    ],
    smallDetails: [
      "色卡边角有一点翻起、皮料不是完全压平，这种真实感比摆满道具更好。",
      "一根鞋带、一小块皮料和半张手写纸，其实已经够讲清楚很多东西。",
      "如果手在整理样鞋，动作要像真的顺手做事，不要像摆给镜头看。",
      "桌面干净一点，但别干净到像新开的样板间。"
    ],
    personalAngles: [
      "这些内容不是为了显得专业，而是让人知道它为什么会长成现在这样。",
      "看得见取舍，我会更放心一点，不像单纯靠氛围包装出来的东西。",
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
    smallDetails: [
      "一块燕麦色针织压在色卡旁边，比单独说秋冬感更直观。",
      "咖色如果旁边没有奶油白过渡，很容易看起来重。",
      "我会把牛仔、浅灰外套和鞋色放在一起看，顺不顺一眼就知道。",
      "秋冬图里留一点浅色边缘，整套会透气很多。"
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
    smallDetails: [
      "我会看坐下时裙摆和鞋子还顺不顺，也会看走路时鞋子会不会显大。",
      "包不用太抢，衣服的线条和鞋子的比例清楚就够了。",
      "镜前那张最好能看到全身，街边那张最好能看到真实步子。",
      "如果裤脚刚好停在鞋面上方，整套会干净很多。"
    ],
    personalAngles: [
      "我会把它当成衣柜里的连接项，而不是某一套穿搭的装饰。",
      "如果看完能想到三套自己的衣服，这篇就比单纯好看更有用。",
      "省心，是成熟日常里很重要的审美。",
      "好搭不是没有特点，是穿上之后不会打断整个人的状态。"
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
    smallDetails: [
      "鞋带如果太假，整张图会立刻变得不真实。",
      "皮面有一点自然纹理，比完全磨平的高光更耐看。",
      "鞋头弧度、鞋底边线和走线位置最好都能看清楚。",
      "我不太相信那种亮到像塑料的材质图。"
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
    smallDetails: [
      "一本翻开的书、一件搭在椅背上的外套，会比刻意摆满高级道具更自然。",
      "窗边的光不用太完美，有一点阴影反而更像真实下午。",
      "如果只有材料和工作台，品牌世界会太像内部记录。",
      "她的城市、衣柜和桌面一起出现，审美才不会悬在空中。"
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
      "拍摄花絮点到为止，别抢走新品本身。",
      "每张图最好回答一个问题，不要重复同一种角度。"
    ],
    smallDetails: [
      "第一张把鞋型拍准，后面就别一直重复同一个角度了。",
      "镜前图看比例，走路图看鞋子会不会自然，材质图看细节。",
      "活动信息可以放轻一点，画面先把颜色和上脚讲清楚。",
      "如果图里每一张都很用力，反而会不像 THERUIZ AURA。"
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

const topicCopyKits: Record<SoftSeedingCopyTopic, TopicCopyKit> = {
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
  生活场景软种草: lifestyleSoftSeedingScenePool,
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
    {
      id: "styling-full-figure-reference",
      name: "图｜完整穿搭｜全身参考",
      purpose: "先建立同一套穿搭方案的完整人物、比例、环境和鞋子参考。",
      description: "真实城市日常里的全身人物照片，鞋子完整清楚，后续图片都延续这套穿搭。",
      imageType: "生活场景图",
      scenePreference: "写字楼门口",
      garmentTypePreference: "裤装",
      tags: ["proof", "fullFigure", "sameOutfit", "stylingSolution"],
      composition: "fullFigure",
      weight: 6,
      extraRequirement:
        "Create a full-figure real daily styling reference photo in the selected scene. Show the same refined customer from head-to-toe or near head-to-toe, with the complete clothing combination and both sneakers clearly readable. The pose should be natural and usable as the first reference image for this styling-solution set, not a campaign pose, not a stiff lookbook image, and not an influencer full-figure shot."
    },
    {
      id: "styling-shoe-trouser-downward",
      name: "图｜鞋裤关系｜低头视角",
      purpose: "解决早上出门前裤脚和鞋子是否接顺的问题。",
      description: "玄关或门口低头视角，局部构图，重点看裤脚、鞋头、鞋带和鞋底边缘。",
      imageType: "产品上脚图",
      scenePreference: "入户镜前",
      garmentTypePreference: "裤装",
      tags: ["proof", "lowerBody", "trouser", "stylingSolution"],
      composition: "lowerBody",
      weight: 5,
      extraRequirement:
        "Create a downward-looking outfit detail photo before leaving home, focused on the shoe-and-trouser relationship. Use a warm grey stone or light wood entryway floor, one foot slightly forward, natural trouser hem resting near the sneaker without covering the shoe structure. Keep toe box, laces, tongue, panel lines, and outsole edge clearly readable. No mirror selfie, no phone in mirror, no face needed, not a full-body mirror shot. Practical outfit reference, not influencer posing."
    },
    {
      id: "styling-lower-body-proportion",
      name: "图｜比例判断｜下半身",
      purpose: "从腰部或膝盖以下判断裤装 / 裙装和鞋子的比例。",
      description: "只看局部比例，不强调脸和完整人像，重点是鞋子是否显笨、鞋底是否显厚。",
      imageType: "产品上脚图",
      scenePreference: "写字楼门口",
      garmentTypePreference: "裤装",
      tags: ["proof", "lowerBody", "proportion"],
      composition: "lowerBody",
      weight: 4,
      extraRequirement:
        "Create a cropped outfit reference from waist or knee down, focused on clean proportion between garment hem and sneakers. Keep the sneakers fully readable, avoid exaggerated legs, avoid full-body fashion pose, and make the image feel like a practical styling check."
    },
    {
      id: "styling-commute-small-step",
      name: "图｜通勤｜小步走",
      purpose: "判断真实走路时鞋型、裤脚和地面接触是否自然。",
      description: "写字楼门口或通勤路上，小步幅自然走路，鞋子完整清楚。",
      imageType: "产品上脚图",
      scenePreference: "写字楼门口",
      garmentTypePreference: "裤装",
      tags: ["proof", "walking", "commute"],
      composition: "walking",
      weight: 4,
      extraRequirement:
        "Generate a refined on-foot commute styling solution with a safe small walking step, clean trouser break, realistic shoe scale, natural floor contact, and strong product readability. Avoid campaign walking pose or runway energy."
    },
    {
      id: "styling-seated-toe-lace",
      name: "图｜坐下｜鞋头鞋带",
      purpose: "看坐下时鞋头、鞋带、裤脚是否仍然清楚。",
      description: "咖啡馆或办公室坐下时的脚部状态，鞋头、鞋带、裤脚关系可读。",
      imageType: "生活场景图",
      scenePreference: "咖啡馆内",
      garmentTypePreference: "裤装",
      tags: ["proof", "seated", "detail"],
      composition: "seated",
      weight: 3,
      extraRequirement:
        "Use a quiet seated outfit detail in a cafe or office corner, focused on toe box, laces, trouser hem, and sneaker readability while sitting. Keep posture natural, no exaggerated leg pose, no hard-selling product insert."
    },
    {
      id: "styling-entryway-floor",
      name: "图｜出门前｜门口地面",
      purpose: "呈现真实出门前的鞋裤判断，不对镜，不露脸。",
      description: "门边光线、地面、包或外套的一角，重点是出门前鞋子和裤脚是否顺。",
      imageType: "产品上脚图",
      scenePreference: "入户镜前",
      garmentTypePreference: "裤装",
      tags: ["proof", "entryway", "lowerBody"],
      composition: "lowerBody",
      weight: 4,
      extraRequirement:
        "Create a real before-leaving-home entryway floor shot, cropped to shoes, trouser hem, door-side light, and a small daily object such as a tote edge or folded coat edge. No mirror selfie, no phone in mirror, no face needed. Keep both sneakers readable and the trouser hem from hiding the shoe structure."
    },
    {
      id: "styling-trouser-break-detail",
      name: "图｜裤脚｜压鞋判断",
      purpose: "专门解决裤脚是否压住鞋型的问题。",
      description: "裤脚自然落在鞋面附近，重点判断裤脚有没有压住鞋头、鞋舌和鞋带。",
      imageType: "产品上脚图",
      scenePreference: "写字楼门口",
      garmentTypePreference: "裤装",
      tags: ["proof", "lowerBody", "trouserBreak", "detail"],
      composition: "lowerBody",
      weight: 5,
      extraRequirement:
        "Create a practical trouser-break and sneaker detail photo. The trouser hem should rest naturally near the sneaker but must not cover the toe box, tongue, laces, or panel structure. Show realistic floor contact, accurate sneaker scale, and a useful styling-solution angle rather than a lifestyle pose."
    },
    {
      id: "styling-skirt-sneaker-balance",
      name: "图｜裙装｜鞋子平衡",
      purpose: "判断裙装搭配时鞋子会不会显笨。",
      description: "中裙或半裙下摆与德训鞋的关系，重点看鞋型是否轻、比例是否顺。",
      imageType: "产品上脚图",
      scenePreference: "朋友午餐",
      garmentTypePreference: "裙装",
      tags: ["proof", "lowerBody", "skirt"],
      composition: "lowerBody",
      weight: 3,
      extraRequirement:
        "Show a refined skirt-and-sneaker cropped styling reference, focused on skirt hem, ankle proportion, and clean sneaker readability. Avoid cute-girl styling, exaggerated legs, or influencer pose. Keep the look mature, quiet, and useful."
    },
    {
      id: "styling-dress-sneaker-hem",
      name: "图｜连衣裙｜下摆和鞋",
      purpose: "判断连衣裙下摆和德训鞋是否接得顺。",
      description: "连衣裙下摆、腿部自然比例、鞋子完整清楚。",
      imageType: "产品上脚图",
      scenePreference: "酒店房间",
      garmentTypePreference: "连衣裙",
      tags: ["proof", "lowerBody", "dress"],
      composition: "lowerBody",
      weight: 3,
      extraRequirement:
        "Create a refined one-piece dress and sneaker cropped outfit reference, focused on dress hem, natural leg proportion, and full sneaker readability. Keep it practical and wearable, not a fashion editorial pose."
    },
    {
      id: "styling-commute-still-life",
      name: "图｜搭配静物｜通勤衣物",
      purpose: "把白衬衫、裤子、包和鞋子放在一起看，形成穿搭方案感。",
      description: "克制静物，鞋款、衣物材质和色彩关系清楚，不做杂乱 moodboard。",
      imageType: "产品静物图",
      scenePreference: "棚内上新拍摄",
      garmentTypePreference: "自动匹配",
      tags: ["proof", "stillLife", "styling"],
      composition: "stillLife",
      weight: 2,
      extraRequirement:
        "Create a restrained styling still life with the sneaker, folded refined trousers or denim, white shirt, tote edge, and muted color relationship. Keep it practical, clean, and useful as an outfit solution, not a decorative moodboard."
    },
    {
      id: "styling-mirror-reference",
      name: "图｜完整穿搭｜对镜参考",
      purpose: "提供完整穿搭参考，但它只是候选图，不是必选图。",
      description: "完整穿搭记录，鞋子完整露出，但不要每组都出现。",
      imageType: "对镜穿搭图",
      scenePreference: "入户镜前",
      garmentTypePreference: "裤装",
      tags: ["proof", "mirror", "hero"],
      composition: "mirror",
      weight: 1,
      extraRequirement:
        "Use a clean entryway mirror outfit reference only as a supporting styling card. Face may be softly hidden by the phone, but keep the sneakers fully readable. Do not make this feel like the default first image of every set."
    }
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
  ],
  棚内上新拍摄: [
    { id: "studio-launch-full-front", name: "图1｜棚拍人物｜全身正面", purpose: "建立整组人物、穿搭、鞋款和棚景基准。", description: "同一人物全身正面，完整穿搭和双脚鞋款清楚。", imageType: "产品上脚图", scenePreference: "棚内上新拍摄", garmentTypePreference: "自动匹配", studioLaunchShotIndex: 0, extraRequirement: "Create the first person-only studio launch reference. Show the same model head-to-toe in a relaxed front stance. Keep the face alive and attentive, the complete outfit readable, both sneakers visible, both hands empty, and the studio free of lifestyle props." },
    { id: "studio-launch-full-three-quarter", name: "图2｜棚拍人物｜全身前侧", purpose: "补充全身三分之四角度，保留完整人物与穿搭。", description: "同一人物全身前侧，轻微重心变化，双鞋仍清楚。", imageType: "产品上脚图", scenePreference: "棚内上新拍摄", garmentTypePreference: "自动匹配", studioLaunchShotIndex: 1, extraRequirement: "Continue the exact same person, outfit, sneakers, and studio in a full-body 3/4 front pose. Use a subtle weight shift and a responsive natural expression. Keep both hands empty and avoid campaign drama." },
    { id: "studio-launch-full-side", name: "图3｜棚拍人物｜全身侧面", purpose: "从侧面看人物比例、鞋侧结构与鞋底线。", description: "同一人物全身侧面，脚步稳定，鞋侧结构可读。", imageType: "产品上脚图", scenePreference: "棚内上新拍摄", garmentTypePreference: "自动匹配", studioLaunchShotIndex: 2, extraRequirement: "Continue the exact same person, outfit, sneakers, and studio in a clean full-body side-oriented stance. Keep natural posture, empty hands, accurate foot placement, and a subtly engaged face rather than a blank model stare." },
    { id: "studio-launch-full-turn-back", name: "图4｜棚拍人物｜回身角度", purpose: "增加克制的回身变化，不改变人物和穿搭。", description: "同一人物后侧三分之四轻回身，至少一只鞋完整清楚。", imageType: "产品上脚图", scenePreference: "棚内上新拍摄", garmentTypePreference: "自动匹配", studioLaunchShotIndex: 3, extraRequirement: "Continue the exact same person, outfit, sneakers, and studio in a restrained rear 3/4 body turn. Keep the movement compact, both hands empty, facial response natural if visible, feet grounded, and the sneaker shape unobstructed." },
    { id: "studio-launch-lower-front", name: "图5｜棚拍人物｜下半身正面", purpose: "检查衣摆、腿部和鞋子的正面比例。", description: "同一人物腰部或大腿以上裁切至地面，双鞋正面可读。", imageType: "产品上脚图", scenePreference: "棚内上新拍摄", garmentTypePreference: "自动匹配", studioLaunchShotIndex: 4, extraRequirement: "Continue the exact same outfit and person reference in a waist-or-upper-thigh-to-floor front crop. Keep both hands outside the frame or naturally empty, preserve the same studio, and show garment hem, toe box, laces, outsole, and ground contact clearly." },
    { id: "studio-launch-lower-three-quarter", name: "图6｜棚拍人物｜下半身前侧", purpose: "检查衣摆、脚踝和鞋侧结构关系。", description: "同一人物下半身前侧，一脚微前但不放大鞋子。", imageType: "产品上脚图", scenePreference: "棚内上新拍摄", garmentTypePreference: "自动匹配", studioLaunchShotIndex: 5, extraRequirement: "Continue the exact same outfit, sneakers, person, and studio in a waist-to-floor 3/4 front-side crop. Use only a small foot offset, keep realistic scale and clean floor contact, and do not add any handheld object or prop." },
    { id: "studio-launch-on-foot-front", name: "图7｜棚拍人物｜上脚正面特写", purpose: "清楚呈现鞋头、鞋带和双脚正面结构。", description: "同一人物中小腿以下正面特写，双鞋不变形、不裁切。", imageType: "产品上脚图", scenePreference: "棚内上新拍摄", garmentTypePreference: "自动匹配", studioLaunchShotIndex: 6, extraRequirement: "Continue the exact same person, outfit, sneakers, and studio in a controlled on-foot front detail. Keep accurate left-right structure, toe shape, laces, ankle alignment, and floor contact. No hands, no props, no wide-angle enlargement." },
    { id: "studio-launch-on-foot-three-quarter", name: "图8｜棚拍人物｜上脚前侧特写", purpose: "补充鞋头曲线、侧片与鞋底线的前侧信息。", description: "同一人物中小腿以下前侧特写，鞋型和接地自然。", imageType: "产品上脚图", scenePreference: "棚内上新拍摄", garmentTypePreference: "自动匹配", studioLaunchShotIndex: 7, extraRequirement: "Continue the exact same person, outfit, sneakers, and studio in a controlled on-foot 3/4 front-side detail. Show toe curve, side panels, lace area, slim outsole line, and natural ground contact without cropping, distortion, hands, or props." }
  ]
};

const topicImageOrders: Record<SoftSeedingTopic, number[][]> = {
  生活场景软种草: [
    [1, 0, 2, 3, 4],
    [0, 2, 1, 4, 3],
    [2, 3, 0, 1, 4],
    [4, 0, 1, 2, 3],
    [3, 2, 1, 0, 4]
  ],
  产品开发幕后: [
    [0, 2, 1, 4, 3],
    [1, 0, 4, 2, 3],
    [2, 0, 1, 3, 4],
    [4, 0, 2, 1, 3],
    [3, 0, 1, 4, 2]
  ],
  秋冬配色实验室: [
    [0, 2, 3, 1, 4],
    [3, 0, 1, 2, 4],
    [2, 0, 4, 1, 3],
    [1, 0, 3, 2, 4],
    [4, 0, 2, 3, 1]
  ],
  穿搭解决方案: [
    [0, 1, 2, 4, 3],
    [1, 0, 3, 2, 4],
    [2, 0, 1, 3, 4],
    [4, 0, 1, 2, 3],
    [3, 0, 2, 1, 4]
  ],
  材质工艺认知: [
    [0, 1, 2, 4, 3],
    [1, 0, 4, 2, 3],
    [4, 0, 1, 3, 2],
    [2, 0, 4, 1, 3],
    [3, 0, 1, 4, 2]
  ],
  品牌审美观点: [
    [0, 2, 1, 3, 4],
    [1, 0, 3, 2, 4],
    [3, 0, 2, 1, 4],
    [2, 0, 1, 4, 3],
    [4, 0, 2, 3, 1]
  ],
  上新活动转化: [
    [0, 1, 2, 3, 4],
    [1, 0, 3, 2, 4],
    [2, 0, 1, 4, 3],
    [3, 0, 2, 1, 4],
    [4, 0, 1, 2, 3]
  ],
  棚内上新拍摄: [
    [0, 1, 2, 3, 4, 5, 6, 7]
  ]
};

function findDraftById(drafts: SoftSeedingImageDraft[], id: string) {
  return drafts.find((draft) => draft.id === id);
}

function pickDraftById(drafts: SoftSeedingImageDraft[], ids: string[], index: number) {
  for (let offset = 0; offset < ids.length; offset += 1) {
    const draft = findDraftById(drafts, ids[(index + offset) % ids.length]);
    if (draft) return draft;
  }

  return drafts[0];
}

function pushUniqueDraft(target: SoftSeedingImageDraft[], draft: SoftSeedingImageDraft | undefined) {
  if (!draft) return;
  const key = draft.id ?? draft.name;
  if (target.some((item) => (item.id ?? item.name) === key)) return;
  target.push(draft);
}

function orderStylingSolutionDrafts(selected: SoftSeedingImageDraft[], variantIndex: number) {
  const normalized = normalizeSoftVariantIndex(variantIndex, getTopicVariantCount("穿搭解决方案"));
  const orderPatterns =
    selected.length === 3
      ? [
          [0, 1, 2],
          [1, 0, 2],
          [0, 2, 1],
          [2, 0, 1],
          [1, 2, 0]
        ]
      : [
          [0, 1, 2, 3, 4],
          [1, 0, 2, 4, 3],
          [2, 0, 1, 3, 4],
          [0, 2, 3, 1, 4],
          [3, 0, 1, 2, 4],
          [1, 3, 0, 4, 2],
          [0, 4, 1, 2, 3]
        ];
  const pattern = orderPatterns[normalized % orderPatterns.length];
  const ordered = pattern.map((index) => selected[index]).filter(Boolean);

  const fullFigureIndex = ordered.findIndex((draft) => draft.composition === "fullFigure");
  if (fullFigureIndex > 0) {
    const [fullFigure] = ordered.splice(fullFigureIndex, 1);
    ordered.unshift(fullFigure);
  }

  if (ordered[0]?.composition === "mirror") {
    const nonMirrorIndex = ordered.findIndex((draft) => draft.composition !== "mirror");
    if (nonMirrorIndex > 0) {
      const first = ordered[0];
      ordered[0] = ordered[nonMirrorIndex];
      ordered[nonMirrorIndex] = first;
    }
  }

  return ordered;
}

function selectStylingSolutionImageDrafts(variantIndex: number, imageCount: SoftSeedingImageCount) {
  const drafts = topicImageDrafts["穿搭解决方案"];
  const normalized = normalizeSoftVariantIndex(variantIndex, getTopicVariantCount("穿搭解决方案"));
  const selected: SoftSeedingImageDraft[] = [];
  const fullFigureIds = ["styling-full-figure-reference"];
  const lowerBodyIds = [
    "styling-shoe-trouser-downward",
    "styling-lower-body-proportion",
    "styling-trouser-break-detail"
  ];
  const movementIds = ["styling-commute-small-step", "styling-entryway-floor"];
  const thirdCardIds = [
    "styling-seated-toe-lace",
    "styling-commute-still-life",
    "styling-seated-toe-lace",
    "styling-commute-still-life",
    "styling-mirror-reference"
  ];

  pushUniqueDraft(selected, pickDraftById(drafts, fullFigureIds, normalized));
  pushUniqueDraft(selected, pickDraftById(drafts, lowerBodyIds, normalized + Math.floor(normalized / 3)));
  pushUniqueDraft(selected, pickDraftById(drafts, movementIds, normalized * 3 + 1));

  if (imageCount === 5) {
    const requiredDetailIds = [
      "styling-seated-toe-lace",
      "styling-commute-still-life"
    ];
    const extraIds = [
      "styling-shoe-trouser-downward",
      "styling-lower-body-proportion",
      "styling-trouser-break-detail",
      "styling-commute-small-step",
      "styling-entryway-floor",
      "styling-seated-toe-lace",
      "styling-commute-still-life",
      "styling-mirror-reference"
    ];

    pushUniqueDraft(selected, pickDraftById(drafts, requiredDetailIds, normalized * 7 + 2));

    for (let offset = 0; selected.length < 5 && offset < extraIds.length * 2; offset += 1) {
      const candidate = pickDraftById(drafts, extraIds, normalized * 11 + offset);
      const hasMirror = selected.some((draft) => draft.composition === "mirror");
      if (candidate?.composition === "mirror" && (hasMirror || normalized % 4 !== 0)) continue;
      pushUniqueDraft(selected, candidate);
    }
  } else {
    pushUniqueDraft(selected, pickDraftById(drafts, thirdCardIds, normalized * 5 + Math.floor(normalized / 2)));
  }

  return orderStylingSolutionDrafts(selected.slice(0, imageCount), variantIndex);
}

const lifestyleThreeImageFamilyPatterns: LifestyleSoftSceneFamily[][] = [
  ["departure", "commute", "social"],
  ["commute", "culture", "community"],
  ["departure", "social", "travel"],
  ["commute", "community", "travel"],
  ["departure", "culture", "social"],
  ["social", "culture", "community"]
];

const lifestyleFiveImageFamilyPatterns: LifestyleSoftSceneFamily[][] = [
  ["departure", "commute", "social", "culture", "community"],
  ["commute", "departure", "culture", "community", "travel"],
  ["social", "commute", "departure", "culture", "travel"],
  ["departure", "social", "culture", "travel", "community"],
  ["commute", "social", "community", "departure", "travel"],
  ["culture", "commute", "social", "community", "travel"]
];

function pickRotatingLifestyleDraft(
  candidates: SoftSeedingImageDraft[],
  familyOccurrenceIndex: number,
  familyIndex: number
) {
  const stableCandidates = [...candidates].sort((a, b) => (a.id ?? a.name).localeCompare(b.id ?? b.name));
  if (!stableCandidates.length) return undefined;
  const index = Math.abs(familyOccurrenceIndex + familyIndex) % stableCandidates.length;
  return stableCandidates[index];
}

function countPriorLifestyleFamilyOccurrences(
  patterns: LifestyleSoftSceneFamily[][],
  normalizedVariantIndex: number,
  family: LifestyleSoftSceneFamily
) {
  let count = 0;
  for (let index = 0; index < normalizedVariantIndex; index += 1) {
    if (patterns[index % patterns.length].includes(family)) count += 1;
  }
  return count;
}

function selectLifestyleSoftSeedingImageDrafts(
  variantIndex: number,
  imageCount: SoftSeedingImageCount,
  season: TeamSeason
) {
  const patterns = imageCount === 3 ? lifestyleThreeImageFamilyPatterns : lifestyleFiveImageFamilyPatterns;
  const normalized = normalizeSoftVariantIndex(variantIndex, getTopicVariantCount("生活场景软种草"));
  const familyPattern = patterns[normalized % patterns.length];
  const selected: SoftSeedingImageDraft[] = [];

  familyPattern.forEach((family, familyIndex) => {
    const alreadyHasMirror = selected.some((draft) => draft.imageType === "对镜穿搭图");
    let candidates = topicImageDrafts["生活场景软种草"].filter(
      (draft) => draft.family === family && (!draft.supportedSeasons || draft.supportedSeasons.includes(season))
    );

    if (alreadyHasMirror) {
      candidates = candidates.filter((draft) => draft.imageType !== "对镜穿搭图");
    }

    const familyOccurrenceIndex = countPriorLifestyleFamilyOccurrences(patterns, normalized, family);
    const selectedDraft = pickRotatingLifestyleDraft(candidates, familyOccurrenceIndex, familyIndex);
    if (selectedDraft && !selected.some((draft) => draft.id === selectedDraft.id)) {
      selected.push(selectedDraft);
    }
  });

  return selected.slice(0, imageCount);
}

function selectSoftSeedingImageDrafts(
  topic: SoftSeedingTopic,
  variantIndex: number,
  imageCount: SoftSeedingImageCount,
  season: TeamSeason
) {
  if (topic === "生活场景软种草") {
    return selectLifestyleSoftSeedingImageDrafts(variantIndex, imageCount, season);
  }

  if (topic === "穿搭解决方案") {
    return selectStylingSolutionImageDrafts(variantIndex, imageCount);
  }

  const drafts = topicImageDrafts[topic];
  const orders = topicImageOrders[topic];
  const order = orders[normalizeSoftVariantIndex(variantIndex, getTopicVariantCount(topic)) % orders.length];

  return order.map((index) => drafts[index]).filter(Boolean).slice(0, imageCount);
}

const topicImageGuides: Record<SoftSeedingTopic, string> = {
  生活场景软种草:
    "Use concrete Xiaohongshu buyer-show feedback cues: real customer try-on feeling, candid daily rhythm, clear sneaker visibility, wearable styling, subtle personal-object context, and a scene that feels like a believable user outfit note rather than brand advertising.",
  产品开发幕后:
    "Use concrete behind-the-scenes cues: hands arranging material cards, selected swatches, laces, sample notes, tidy working surface, visible product decisions, and restrained small-brand process realism.",
  秋冬配色实验室:
    "Use concrete color-lab cues: coffee brown leather, oatmeal suede, warm beige cards, muted grey chips, autumn wardrobe layers, soft material contrast, and a saveable palette-board feeling without clutter.",
  穿搭解决方案:
    "Use concrete styling-solution cues: before-leaving outfit check, downward-looking shoe-and-trouser relationship, cropped waist-or-knee-down outfit reference, readable sneaker scale, trouser/skirt/dress hem relationship, and one practical daily scenario. Do not default to mirror selfie.",
  材质工艺认知:
    "Use concrete material-learning cues: one precise detail at a time, such as toe shape, outsole edge, stitching route, lace thickness, pigskin lining when relevant, leather texture, panel transition, and clean product readability.",
  品牌审美观点:
    "Use concrete aesthetic-point cues: her wardrobe, desk, book, gallery, quiet city corner, low-saturation personal objects, subtle product presence, and warm negative space.",
  上新活动转化:
    "Use concrete soft-launch cues: clean product readability, one on-foot styling proof, one material proof, one lifestyle proof, clear color and shape, and a calm reason to consider the new arrival.",
  棚内上新拍摄:
    "Person-only studio launch rule: every card must show the same real person wearing the same complete outfit and the same THERUIZ AURA sneakers inside one unchanged professional launch studio. No still life, mirror, street, home, cafe, hotel, atmosphere, behind-the-scenes, product-only frame, or lifestyle location."
};

const topicVariantVisualCues: Record<SoftSeedingTopic, string[]> = {
  生活场景软种草: [
    "Visual content angle: make it feel like a real customer buyer-show outfit note from an ordinary day, with one small daily object and clear sneaker readability.",
    "Visual content angle: focus on an after-work or cafe-side pause, relaxed posture, natural city rhythm, and no advertising performance.",
    "Visual content angle: show the sneaker as part of her real commute, coffee stop, bookstore visit, flower errand, or weekend route, not as a staged product insert.",
    "Visual content angle: keep the scene simple, with believable street texture, soft fabric movement, and an outfit that feels easy for a customer to copy.",
    "Visual content angle: use a friend-taken buyer-show photo feeling while keeping THERUIZ AURA proportions, shoe visibility, and low-saturation styling controlled.",
    "Visual content angle: show a real try-on feedback moment where the shoes remain readable while walking, standing, or sitting naturally.",
    "Visual content angle: emphasize that the shoes still look clean and proportionate after a normal day, without perfect campaign styling.",
    "Visual content angle: make the image feel like a saved Xiaohongshu customer review photo, not a brand campaign, not a showroom pose.",
    "Visual content angle: keep at least one sneaker fully visible in a casual real-life composition, with believable trousers, skirt, or dress relationship.",
    "Visual content angle: show a practical buyer-show scene where the outfit answers how the shoes work with normal clothes."
  ],
  产品开发幕后: [
    "Visual content angle: show a quiet product-development decision, such as comparing laces, leather pieces, color cards, or a sample note.",
    "Visual content angle: keep the working surface real but ordered, with only a few meaningful materials and no decorative clutter.",
    "Visual content angle: make the behind-the-scenes moment feel small-brand, tactile, and trustworthy, not like a factory report.",
    "Visual content angle: let hands, swatches, and sample details imply the process without turning the image into a technical manual.",
    "Visual content angle: keep the product or material detail close enough to understand the decision, with warm daylight and calm negative space."
  ],
  秋冬配色实验室: [
    "Visual content angle: connect muted autumn-winter colors with real wardrobe pieces, not only isolated color cards.",
    "Visual content angle: use oatmeal, warm beige, coffee brown, warm grey, and denim references with enough cream-white breathing space.",
    "Visual content angle: make the palette look wearable in a mature closet, with the sneaker color accurate and not over-warmed.",
    "Visual content angle: show one clear color relationship, such as knitwear with denim, coat fabric with suede, or color chips with leather.",
    "Visual content angle: keep the seasonal mood soft, tactile, and light rather than heavy retro or overly brown."
  ],
  穿搭解决方案: [
    "Visual content angle: use a downward-looking outfit detail that clearly shows shoe-and-trouser relationship, natural trouser hem near the sneaker, one foot slightly forward, and real floor contact.",
    "Visual content angle: create a cropped waist-or-knee-down outfit reference with toe box, laces, tongue, outsole edge, and garment hem clearly readable. No face needed.",
    "Visual content angle: use a morning entryway floor shot with warm grey stone floor or light wood floor, door-side light, tote edge, folded coat edge, and no mirror selfie.",
    "Visual content angle: show a practical trouser-break check where the trouser hem must not cover the sneaker structure, toe box, tongue, laces, or panel lines.",
    "Visual content angle: use a cafe seated shoe detail with trouser hem, toe box, laces, and sneaker scale readable while sitting naturally.",
    "Visual content angle: use a safe small walking step near an office entrance, with realistic shoe scale, clean floor contact, and no campaign walking pose.",
    "Visual content angle: use a restrained outfit still life only when useful: sneaker, folded refined trousers or denim, white shirt, tote edge, and muted color relationship.",
    "Visual content angle: if a mirror card appears, keep it supporting rather than default; no phone blocking the styling, no face-centered posed record, and never fixed as the first image.",
    "Visual content angle: make this a useful outfit reference, not influencer posing, not a fashion tutorial, not a full-body campaign shot.",
    "Visual content angle: for hotel-room leaving moments, include suitcase edge, clean sneaker proportion, and calm travel order without mirror-selfie framing."
  ],
  材质工艺认知: [
    "Visual content angle: teach through one visible detail, such as toe curve, outsole edge, lace route, stitching, or material transition.",
    "Visual content angle: keep the texture honest, with matte surface, natural grain, precise panel structure, and no glossy fake material.",
    "Visual content angle: use a close but not distorted material view, so the sneaker shape stays readable.",
    "Visual content angle: if lining is relevant or visible, use pigskin lining for current THERUIZ AURA styles and do not invent lambskin lining.",
    "Visual content angle: make the craft detail easy to understand without turning the image into a sterile product specification."
  ],
  品牌审美观点: [
    "Visual content angle: show her lifestyle world, such as wardrobe, desk, book, gallery, street corner, or window light, with weak product pressure.",
    "Visual content angle: make the brand feeling come from life order, light, fabric, and restraint, not from large logos or product pushing.",
    "Visual content angle: keep the product subtle if present, like something already living inside her routine.",
    "Visual content angle: avoid an internal brand-process mood unless the selected scene is a material table; the image should feel like her life.",
    "Visual content angle: use calm negative space and real human warmth, so quiet luxury does not become cold emptiness."
  ],
  上新活动转化: [
    "Visual content angle: answer one launch question at a time: shoe shape, color, on-foot proportion, material detail, or daily usability.",
    "Visual content angle: keep the launch image clear and useful without urgent sales energy or loud campaign styling.",
    "Visual content angle: make product readability strong, then connect it to a real on-foot or lifestyle proof.",
    "Visual content angle: use clean sequencing logic across the image set: still life, on-foot, outfit, material, and quiet lifestyle support.",
    "Visual content angle: keep the new-arrival mood calm, accurate, and easy to judge rather than promotional."
  ],
  棚内上新拍摄: [
    "Visual content angle: build one coherent person-only studio launch series with a full-body front reference first, then controlled full-body, waist-to-floor, and on-foot angle changes.",
    "Visual content angle: keep the exact same model identity, hairstyle, makeup, outfit, sneakers, seamless background, floor, light direction, fill ratio, white balance, and color grade across all eight cards.",
    "Visual content angle: every image must remain a real person wearing the product in the selected launch studio; never replace a card with still life, mirror, street, lifestyle, atmosphere, or behind-the-scenes content.",
    "Visual content angle: vary only camera framing, body orientation, compact pose, gaze, and subtle expression while both hands stay empty and no prop enters the frame."
  ]
};

const lifestyleBuyerFeedbackAlignmentCues = [
  "Copy-image alignment: respect this image card's selected scene and image type while matching the body copy's real customer buyer-show feeling.",
  "Copy-image alignment: the image should support the same buyer question as the copy: whether the sneakers look clean, comfortable, easy to style, and wearable in ordinary life.",
  "Copy-image alignment: keep the visual low-pressure and useful, with readable shoe proportion, natural posture, and no hard-selling mood.",
  "Copy-image alignment: make this card feel like one part of the same customer try-on note, not a separate brand campaign.",
  "Copy-image alignment: keep the scene, styling, and shoe visibility consistent with this card's purpose and the copy's daily-wear feedback point.",
  "Copy-image alignment: emphasize readable on-foot proof, normal clothing, visible trouser, skirt, or dress relationship, and believable walking, standing, or sitting posture.",
  "Copy-image alignment: the visual should support buyer-show feedback about daily usability, not just show a pretty lifestyle background.",
  "Copy-image alignment: use only ordinary tasteful objects that fit this image card, such as coffee, book, tote, flowers, paper bag, street shadow, office entrance, or quiet hotel mirror.",
  "Copy-image alignment: keep this image and the body copy centered on one buyer feedback point, not multiple unrelated selling points.",
  "Copy-image alignment: make the image feel saveable as a real user try-on reference for Xiaohongshu while staying loyal to this card's scene."
];

function getSoftSeedingVariantVisualCue(topic: SoftSeedingTopic, variantIndex: number) {
  return pickVariant(topicVariantVisualCues[topic], variantIndex, 23, getTopicVariantCount(topic));
}

function getSoftSeedingCopyVisualAlignmentCue(topic: SoftSeedingTopic, variantIndex: number) {
  if (topic !== "生活场景软种草") return "";

  return pickVariant(lifestyleBuyerFeedbackAlignmentCues, variantIndex, 29, getTopicVariantCount(topic));
}

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

const stylingSolutionSetContinuityLine =
  "Styling-solution set continuity: treat this image as part of one single styling plan. Keep the exact same clothing combination across all cards: same top, same bottom garment category, same outer layer if present, same bag if present, same accessories if present, same color palette, same garment hem length, same wearing proportions, and the same THERUIZ AURA sneaker. Only the scene angle, camera distance, pose, and detail focus may change.";

const stylingSolutionFaceContinuityLine =
  "If more than one card shows the face, keep the exact same person across the set: same face, same age impression, same hairstyle, same hair color, same makeup or grooming, same facial structure, same body silhouette, and the same quiet daily temperament. Generate the full-figure reference first and use it as the person and styling reference for the following image cards.";

const lifestyleSoftSeedingSetContinuityLine =
  "Lifestyle buyer-show set continuity: treat all cards as one coherent buyer-show series in the same real contemporary Chinese city or its restrained short-trip context. Keep the exact same person, outfit, shoe, hairstyle, makeup, color palette, and overall styling across the set. Only the location moment, pose, framing, gaze, and camera distance may change.";

const lifestyleEmptyHandsContinuityLine =
  "Multi-image handheld continuity: keep both hands naturally empty in this card. Scene objects may remain placed in the environment, but do not put coffee, books, flowers, shopping bags, luggage, umbrellas, bottles, or other props in either hand.";

const lifestyleMirrorPhoneContinuityLine =
  "Mirror-card handheld rule: use the same simple no-logo phone as the only handheld object, with a natural grip and no second prop in either hand.";

function getStudioLaunchSetContinuityLine(imageCount: SoftSeedingImageCount) {
  return `${imageCount}-shot person-only studio continuity: treat all cards as one continuous launch shoot. Keep the exact same real person, facial identity, age impression, hairstyle, hair color, makeup, body silhouette, complete outfit, garment layers, colors, materials, hem lengths, wearable accessories, and THERUIZ AURA sneakers. Keep the exact same seamless backdrop, floor material, light direction, key-light softness, fill ratio, contact-shadow character, white balance, exposure, and color grade. Only the specified shot framing, body orientation, compact pose, gaze, and subtle expression may change. Both hands must stay empty. Never generate a still life, product-only frame, mirror image, street, home, cafe, hotel, atmosphere image, behind-the-scenes image, prop-led image, or any non-studio location.`;
}

const stylingSolutionExpressionBeats = [
  "If the face is visible, capture a brief friendly in-between response with focused catchlights, relaxed eyelids, and a faint asymmetric smile, not a posed portrait expression.",
  "If the face is visible, let the eyes focus naturally on the next movement or nearby point, with relaxed lips and no vacant fashion-model stare.",
  "If the face is visible, use a purposeful downward glance toward the garment or sneakers, with facial muscles responding naturally to the small task.",
  "If the face is visible, show a subtle reaction to one real scene detail, with a tiny brow response and an unforced mouth shape.",
  "If the face is visible, capture a fleeting relaxed look after the action, such as a soft exhale or incidental half-turn, different from the other cards."
];

function getStylingSolutionContinuityLines(topic: SoftSeedingTopic, draft: SoftSeedingImageDraft) {
  if (topic !== "穿搭解决方案") return "";

  return [
    stylingSolutionSetContinuityLine,
    shouldInheritBaseGarmentType(draft.imageType) ? stylingSolutionFaceContinuityLine : ""
  ]
    .filter(Boolean)
    .join(" ");
}

function getLifestyleSoftSeedingContinuityLines(
  topic: SoftSeedingTopic,
  draft: SoftSeedingImageDraft,
  imageCount: SoftSeedingImageCount
) {
  if (topic !== "生活场景软种草") return "";

  const handheldLine = draft.handheldPolicy === "phoneOnly"
    ? lifestyleMirrorPhoneContinuityLine
    : imageCount > 1
      ? lifestyleEmptyHandsContinuityLine
      : "";

  return [lifestyleSoftSeedingSetContinuityLine, handheldLine].filter(Boolean).join(" ");
}

function getSoftSeedingExtraRequirement(
  baseParams: TeamPromptParams,
  draft: SoftSeedingImageDraft,
  garmentTypePreference: TeamGarmentTypePreference,
  topic: SoftSeedingTopic,
  variantIndex: number,
  imageCount: SoftSeedingImageCount
) {
  const themeGuide = topicImageGuides[topic];
  const variantVisualCue = getSoftSeedingVariantVisualCue(topic, variantIndex);
  const copyVisualAlignmentCue = getSoftSeedingCopyVisualAlignmentCue(topic, variantIndex);
  const stylingSolutionContinuityLine = getStylingSolutionContinuityLines(topic, draft);
  const studioShotControlLine =
    topic === "棚内上新拍摄" && typeof draft.studioLaunchShotIndex === "number"
      ? `Studio launch series shot ${draft.studioLaunchShotIndex + 1} of ${imageCount}: follow this card's specified person framing exactly.`
      : "";
  const studioContinuityLine =
    topic === "棚内上新拍摄" ? getStudioLaunchSetContinuityLine(imageCount) : "";

  if (baseParams.garmentTypePreference === "自动匹配" || !shouldInheritBaseGarmentType(draft.imageType)) {
    return [draft.extraRequirement, studioShotControlLine, themeGuide, variantVisualCue, copyVisualAlignmentCue, stylingSolutionContinuityLine, studioContinuityLine]
      .filter(Boolean)
      .join(" ");
  }

  const manualControlLine =
    garmentTypePreference === "自动匹配" ? "" : garmentTypeControlLines[garmentTypePreference];
  const combinedRequirement = [
    draft.extraRequirement,
    studioShotControlLine,
    manualControlLine,
    themeGuide,
    variantVisualCue,
    copyVisualAlignmentCue,
    stylingSolutionContinuityLine,
    studioContinuityLine
  ]
    .filter(Boolean)
    .join(" ");

  return sanitizeSoftSeedingExtraRequirementForGarment(combinedRequirement, garmentTypePreference);
}

function createGarmentSeriesContext(baseParams: TeamPromptParams, topic: SoftSeedingTopic): GarmentSeriesContext | undefined {
  const context = baseParams.productContext;
  if (!context || context.mode !== "garment") return undefined;
  const garment = context.garment;
  const details = [garment.category, garment.name, garment.color, garment.fabric, garment.silhouette, garment.neckline, garment.sleeveType, garment.sleeveLength, garment.waistline, garment.garmentLength ?? garment.hemLength, garment.closure, garment.pattern, garment.drape, garment.transparency, garment.keyDetails?.join(", ")].filter(Boolean).join("; ");
  return {
    productLockLine: `Garment series product lock: use the exact same uploaded ${details || "garment"} in every image. Preserve category, color, material, silhouette, proportions, construction, length, recognizable details, and natural fit; do not redesign, recolor, replace, shorten, lengthen, or invent unseen construction.`,
    modelLockLine: `Garment series model lock: use the exact same model, face, age impression, hair, hairstyle, makeup, body proportions, and general presence across the entire ${topic} image series. Only gaze, expression intensity, pose, action, and crop may vary.`,
    stylingLockLine: topic === "穿搭解决方案"
      ? "Garment series styling policy: the uploaded garment remains exactly unchanged in every image; only supporting styling may vary, and supporting items must never replace, cover, recolor, or compete with the primary garment."
      : "Garment series styling lock: keep the exact same supporting styling, layers, accessories, color palette, and wearing proportions across every image; only scene, pose, framing, and action may vary.",
    visualLockLine: "Garment series visual-direction lock: keep one coherent refined real-camera look, warm-neutral low-saturation color family, natural material response, quiet premium realism, and consistent model treatment across all images; allow only scene-appropriate light variation.",
    lockSupportingStyling: topic !== "穿搭解决方案"
  };
}

function buildImagePlan(
  baseParams: TeamPromptParams,
  draft: SoftSeedingImageDraft,
  index: number,
  topic: SoftSeedingTopic,
  variantIndex: number,
  imageCount: SoftSeedingImageCount,
  lockedOutfitLine = "",
  garmentSeriesContext?: GarmentSeriesContext
): SoftSeedingImagePlan {
  const shoeFields = resolveBaseShoe(baseParams);
  const garmentTypePreference = resolveSoftSeedingGarmentType(baseParams, draft);
  const lifestyleContinuityLine = getLifestyleSoftSeedingContinuityLines(topic, draft, imageCount);
  const params: TeamPromptParams = {
    ...baseParams,
    ...shoeFields,
    garmentSeriesContext,
    imageType: draft.imageType,
    scenePreference: draft.scenePreference,
    garmentTypePreference,
    season: resolveBaseSeason(baseParams.season, draft.season),
    modelChoice: baseParams.modelChoice,
    modelContinuity: index === 0 ? "新人物" : "延续上一组人物",
    studioLaunchAnglePreference: "自动匹配",
    stillLifeStyle: "与主视觉统一",
    extraRequirement: [
      getSoftSeedingExtraRequirement(baseParams, draft, garmentTypePreference, topic, variantIndex, imageCount),
      lifestyleContinuityLine,
      topic === "穿搭解决方案" ? stylingSolutionExpressionBeats[index % stylingSolutionExpressionBeats.length] : ""
    ].filter(Boolean).join(" "),
    generationNonce: baseParams.generationNonce + variantIndex + index + 1,
    seriesImageCount: imageCount,
    seriesImageIndex: index,
    studioLaunchShotIndex: draft.studioLaunchShotIndex,
    studioSetNonce:
      topic === "棚内上新拍摄" ? baseParams.generationNonce + variantIndex + 1 : undefined,
    lockedOutfitLine: shouldInheritBaseGarmentType(draft.imageType) ? lockedOutfitLine : "",
    forceGeneratedOutfitSelection:
      topic === "穿搭解决方案" || topic === "生活场景软种草" || topic === "棚内上新拍摄",
    forceNoHandheldObject:
      topic === "棚内上新拍摄" ||
      (topic === "生活场景软种草" && imageCount > 1 && draft.handheldPolicy !== "phoneOnly")
  };

  const output = generateTeamPrompt(params);

  return {
    name: draft.name,
    purpose: draft.purpose,
    description: draft.description,
    params,
    prompt: output.prompt
  };
}

function buildSoftSeedingImagePlans(
  baseParams: TeamPromptParams,
  drafts: SoftSeedingImageDraft[],
  topic: SoftSeedingTopic,
  variantIndex: number,
  imageCount: SoftSeedingImageCount
) {
  let sharedOutfitLine = "";
  const garmentSeriesContext = createGarmentSeriesContext(baseParams, topic);

  return drafts.map((draft, index) => {
    const plan = buildImagePlan(baseParams, draft, index, topic, variantIndex, imageCount, sharedOutfitLine, garmentSeriesContext);
    if (
      (topic === "穿搭解决方案" || topic === "生活场景软种草" || topic === "棚内上新拍摄") &&
      !sharedOutfitLine &&
      shouldInheritBaseGarmentType(draft.imageType)
    ) {
      sharedOutfitLine = generateTeamPrompt(plan.params).selectedOutfitLine;
    }
    return plan;
  });
}

function normalizeSoftSeedingImageCount(
  topic: SoftSeedingTopic,
  requestedCount: SoftSeedingImageCount
): SoftSeedingImageCount {
  if (topic === "棚内上新拍摄") return requestedCount;
  return requestedCount === 8 ? 5 : requestedCount;
}

export function generateSoftSeedingContent(input: SoftSeedingInput): SoftSeedingContent {
  const date = input.date ?? new Date();
  const dateKey = getLocalDateKey(date);
  const topic = input.topic ?? softSeedingTopicOptions[0];
  const variantCount = getTopicVariantCount(topic);
  const topicIndex = Math.max(0, softSeedingTopicOptions.indexOf(topic));
  const basePostIndex = getDayNumber(date) * softSeedingTopicOptions.length + topicIndex;
  const variantOffset = Math.max(0, Math.floor(input.variantOffset ?? 0));
  const variantIndex = (basePostIndex + variantOffset) % variantCount;
  const requestedImageCount = input.imageCount ?? (topic === "棚内上新拍摄" ? 8 : 5);
  const imageCount = normalizeSoftSeedingImageCount(topic, requestedImageCount);
  const selectedImageDrafts = selectSoftSeedingImageDrafts(topic, variantIndex, imageCount, input.baseParams.season);
  const copy = buildCopyFromKit(topic, variantIndex, selectedImageDrafts);

  return {
    topic,
    dateKey,
    dailySlot: 1,
    variantIndex,
    variantCount,
    variantLabel: `第 ${variantIndex + 1} / ${variantCount} 版`,
    titles: copy.titles,
    body: copy.body,
    images: buildSoftSeedingImagePlans(input.baseParams, selectedImageDrafts, topic, variantIndex, imageCount),
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
    `# THERUIZ AURA 小红书内容｜${content.dateKey}｜${content.topic}｜${content.variantLabel}`,
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
