import type {
  TeamGarmentTypePreference,
  TeamImageType,
  TeamPromptParams,
  TeamScenePreference,
  TeamSeason,
  TeamShoe
} from "../types";
import { generateTeamPrompt } from "./generatePrompt";

export type SoftSeedingTopic = "通勤" | "接娃" | "周末" | "旅行" | "秋冬" | "女性日常";
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

export const softSeedingTopicOptions: SoftSeedingTopic[] = ["通勤", "接娃", "周末", "旅行", "秋冬", "女性日常"];
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
  return kit.openings.length * kit.observations.length * kit.scenes.length * kit.closings.length;
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
  const closingIndex =
    Math.floor(variantIndex / (kit.openings.length * kit.observations.length * kit.scenes.length)) % kit.closings.length;

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
      pick(kit.closings, closingIndex)
    ].join("\n\n"),
    tags: kit.tags,
    note: kit.note
  };
}

const topicCopyKits: Record<SoftSeedingTopic, TopicCopyKit> = {
  通勤: {
    titleLeads: [
      "上班路上，鞋子不要太有负担",
      "通勤鞋，我现在只想选省心的",
      "每天都要穿的鞋，别太折腾人",
      "早上出门，我越来越会选这种鞋",
      "穿得体面，也可以不用那么累",
      "成年人通勤，真的不想被鞋子消耗",
      "舒服不是偷懒，是把状态留给一天",
      "通勤穿搭，舒服一点没什么不好"
    ],
    titleSeconds: [
      "从早八到晚八，一双鞋要撑住很多事",
      "真正好穿的鞋，是你不会一直想起它",
      "上班穿什么，先从脚不累开始",
      "越忙的早晨，越需要一双不用想的鞋",
      "通勤不一定要高跟鞋才算体面",
      "干净、舒服、省心，就已经很好",
      "普通工作日，也需要一点从容",
      "鞋子不添乱，一天会顺很多"
    ],
    titleThirds: [
      "这双德训鞋，是我工作日最常拿的一双",
      "鞋柜里真正留下来的，通常都很安静",
      "一双能从办公室穿到下班后的鞋",
      "不抢衣服，但能让整个人更轻松",
      "通勤穿搭的重点，是不要先把自己累到",
      "越日常的东西，越值得认真选",
      "舒服和体面，其实可以同时存在",
      "每天都能穿，才是真的百搭"
    ],
    openings: [
      `早上出门的时候，其实没有那么多时间慢慢搭配。\n\n衬衫要不要换，裤脚会不会压鞋，今天会不会走很多路。\n\n这些小事加在一起，人还没到公司，心里已经有点烦了。`,
      `以前买鞋，很容易被第一眼吸引。\n\n颜色特别，设计特别，拍照也好看。\n\n但真正到了工作日早上，最后拿起来的，往往不是那些最特别的鞋。`,
      `我现在越来越觉得，通勤穿搭不用太证明什么。\n\n不需要每一天都很亮眼，也不需要为了显得精致，让自己从早上就开始紧绷。`,
      `工作日最真实的场景，不是在镜子前。\n\n是从家门口到电梯，从写字楼门口到工位，再到下班以后顺路去买点东西。`,
      `有些鞋在店里试的时候很漂亮。\n\n但一到真正的上班日，就会发现它只适合站着看，不太适合一直走。`,
      `通勤久了以后，买鞋的标准会变得很实际。\n\n不是只看第一眼，而是看它能不能陪自己过完一整天。`,
      `早高峰已经够消耗人了。\n\n所以我不太想让鞋子再变成另一个需要忍耐的部分。`,
      `衣柜里的通勤单品，其实不需要太多。\n\n真正每天会被拿出来的，往往是那些不会出错、也不会添乱的东西。`
    ],
    observations: [
      `所以我现在越来越喜欢那种不用反复想的鞋。\n\n配西裤不突兀，配牛仔裤也自然。早上出门，晚上回来，一整天都不用特别惦记脚。`,
      `它不需要我重新想一套衣服，也不会让我担心今天要走很多路。\n\n开会、见客户、下楼买咖啡、下班顺路去超市，这些场景都能自然接住。`,
      `一双鞋如果真的适合日常，它应该是安静的。\n\n早上出门不纠结，走到办公室不狼狈，下午站久一点，也不会一直提醒你脚很累。`,
      `我喜欢德训鞋的地方，是它不会把通勤穿得太运动，也不会像正式鞋那样有距离感。\n\n它在中间，刚刚好。`,
      `对我来说，通勤鞋最重要的不是存在感。\n\n而是当你一天走了很多路，它依然没有把注意力从工作和生活里抢走。`,
      `真正百搭的鞋，不是能搭所有衣服那么简单。\n\n而是你临时有安排，临时要走路，也不用因为它改变原本的节奏。`,
      `鞋型干净一点，颜色温和一点，穿着稳定一点。\n\n这些听起来都很普通，但放到每天的通勤里，就很有用。`,
      `很多时候，体面不是穿得多正式。\n\n而是忙了一天之后，状态还在，脚步也还轻。`
    ],
    scenes: [
      `它不是那种第一眼很用力的设计。\n\n但穿久了会发现，日常真正需要的，反而是这种安静、干净、不会添乱的东西。`,
      `电梯里、办公室里、咖啡店门口、下班回家的路上，它都不会显得突兀。\n\n这种“不用想”，对忙碌的工作日很重要。`,
      `搭白衬衫的时候，它让整个人轻一点。\n\n搭针织和西裤的时候，它又不会太随便。`,
      `有时候只是从写字楼走到停车场，或者中午出去吃个饭。\n\n距离不远，但鞋子好不好穿，很快就知道。`,
      `如果当天还要见人，我不想穿得太休闲。\n\n如果晚上还要办事，我也不想被鞋子拖住。`,
      `这就是我喜欢它的原因：没有特别强的风格压力。\n\n但放进很多套衣服里，都能让人看起来干净、自然。`,
      `上班已经有很多事情需要处理。\n\n穿搭这件事，能少一点判断，就少一点消耗。`,
      `它更像衣柜里的连接色。\n\n把衬衫、裤装、外套和一天里的不同场景，都温和地接在一起。`
    ],
    closings: [
      `好看的鞋很多。\n\n愿意每天穿的，才会留在鞋柜里。`,
      `所以我更在意一种安静的好穿。\n\n不抢衣服的注意力，也不让脚成为一天里的负担。`,
      `鞋子可以干净、秀气、有质感。\n\n但最好不要成为负担。`,
      `穿搭可以简单。\n\n人也可以轻松一点。`,
      `越是普通工作日，越能看出一双鞋是不是真的适合自己。`,
      `我现在买鞋，不只看它能不能拍照。\n\n更看它能不能陪我过完很多个普通的星期一。`,
      `舒服不是松懈。\n\n是把状态留给更重要的事情。`,
      `一双好穿的通勤鞋，最大的价值就是：你可以不用总想着它。`
    ],
    tags: ["#THERUIZAURA", "#德训鞋", "#通勤穿搭", "#上班穿什么", "#舒适穿搭", "#轻熟风", "#一鞋多搭", "#QuietWarmLuxury"],
    note: "通勤主题围绕省心、体面、走路负担和工作日真实状态做组合。"
  },
  接娃: {
    titleLeads: ["下班去接娃，鞋子真的不能添乱", "接娃路上，才知道鞋子舒不舒服", "从办公室到校门口，我会穿得轻松一点", "一天的后半场，需要一双懂生活的鞋", "妈妈也可以穿得舒服又体面", "不是去远方才需要好走的鞋", "下班后的路，才最考验一双鞋", "一双鞋，撑住一天的后半场"],
    titleSeconds: ["不是松懈，是留一点从容给自己", "从工作到家庭，穿搭也要能切换", "鞋子不懂日常，真的会让人更累", "接孩子这件小事，其实很考验鞋", "舒服和体面，不该只能选一个", "忙完工作以后，还要走很多路", "妈妈的日常，也值得穿得好一点", "下班之后，才是一天真正的后半场"],
    titleThirds: ["这双德训鞋，适合从办公室走到校门口", "不隆重，但能让人少一点狼狈", "站久一点、走快一点，也不用一直惦记脚", "日常里的好穿，比照片里的惊艳更重要", "一双鞋能接住很多身份切换", "舒服不是软塌塌，是可以从容地过完一天", "上班能穿，接娃也能穿", "给忙碌的一天留一点轻松"],
    openings: [
      `一天里真正累的部分，很多时候不是上班。\n\n是下班以后。\n\n电脑合上，包拿起来，才发现今天还没结束。`,
      `很多人以为，只有旅行才需要一双好走的鞋。\n\n其实不是。\n\n更真实的考验，往往在下班以后。`,
      `有了孩子以后，很多出门都不是完整属于自己的。\n\n早上要快，下午要赶，晚上还要处理很多临时的小事。`,
      `接娃这件事，看起来只是顺路。\n\n但从办公室走出来的那一刻开始，一天的第二轮忙碌才刚刚开始。`,
      `以前我会把上班鞋和休闲鞋分得很清楚。\n\n后来发现，真正的日常根本没有分得那么开。`,
      `下班后的路，有时候比上班更需要一双舒服的鞋。\n\n因为那时候人已经有点累了，脚也更诚实。`,
      `妈妈的日常，经常不是一个场景。\n\n上午是工作，下午是家庭，晚上又回到各种琐碎。`,
      `我不太想因为要接孩子，就把自己穿得很随便。\n\n但也不想为了体面，让自己从脚开始紧绷。`
    ],
    observations: [
      `要去接孩子，要顺路买点东西，可能还要陪他在楼下多玩十分钟。\n\n这时候鞋子好不好穿，突然就变得很具体。`,
      `从办公室出来，赶去接孩子，路上还要回几条消息，顺便买点东西。\n\n没有什么特别大的事情，但每一步都很具体。`,
      `舒服和体面，其实不是对立的。\n\n一双鞋如果鞋型干净，颜色温和，走路也不累，就能解决很多日常里的小尴尬。`,
      `站久一点会不会累，走快一点会不会磨，配今天这身衣服会不会太随便。\n\n这些都不是大卖点，但都是每天真的会遇到的问题。`,
      `我喜欢德训鞋的原因，是它不会把你打扮得很隆重。\n\n但也不会让你在校门口、社区门口显得太随便。`,
      `它最好能接住工作日的前半场，也能接住家庭日常的后半场。\n\n这才是很多女性真正需要的一双鞋。`,
      `有些鞋好看，但只适合坐着。\n\n而接娃路上，更多时候需要的是能走、能站、也能自然搭衣服。`,
      `如果一双鞋能让你从公司走到社区，还是干净、体面、没有那么狼狈，它就已经很有价值了。`
    ],
    scenes: [
      `我喜欢德训鞋的原因，也是在这些很普通的时刻里慢慢确定的。\n\n它不会把你打扮得很隆重。`,
      `配今天的衬衫和西裤不会奇怪。\n\n晚上换成针织外套，也还是自然。`,
      `上班能穿。\n\n接娃能穿。\n\n周末带孩子去公园，也不会显得太正式。`,
      `从写字楼门口到社区步道，中间可能只是半小时。\n\n但人的状态，已经从工作切换到了生活。`,
      `这时候我不需要一双很抢眼的鞋。\n\n我需要它可靠一点、温和一点、别再制造新的负担。`,
      `有时候孩子还想在楼下多玩一会儿。\n\n如果鞋子不好穿，那十分钟都会变得很漫长。`,
      `我希望它看起来像认真出门过。\n\n但穿起来又不会像在完成某种仪式。`,
      `这种鞋最好的地方，是它能让你在很多身份之间切换得自然一点。`
    ],
    closings: [
      `但会让你从办公室走到校门口，还是干净、体面、没有那么狼狈。`,
      `它不负责让你惊艳别人。\n\n它负责让你少一点狼狈。`,
      `有些舒服，不是软塌塌。\n\n是让人能从容地把一天过完。`,
      `安静一点。\n\n但真的有用。`,
      `妈妈也不是只能把舒服排在最后。\n\n有些日常，值得对自己好一点。`,
      `我现在更喜欢这种不需要解释太多的单品。\n\n穿上就能出门，走起来也安心。`,
      `一双鞋不能解决所有忙碌。\n\n但它至少可以不增加新的疲惫。`,
      `下班后的生活不一定轻松。\n\n所以脚下这一步，能轻一点就轻一点。`
    ],
    tags: ["#THERUIZAURA", "#德训鞋穿搭", "#接娃穿搭", "#下班后日常", "#妈妈也要舒服好看", "#舒适穿搭", "#城市女性", "#QuietWarmLuxury"],
    note: "接娃主题围绕身份切换、下班后真实路程和妈妈日常体面感做组合。"
  },
  周末: {
    titleLeads: ["周末最舒服的状态，是不用太用力", "周末出门，我更喜欢这种轻一点的穿法", "不用精心打扮，也能干净好看", "普通周末，也需要一双舒服的鞋", "周末不想穿得太满", "一双鞋，把普通半天走得舒服一点", "好穿的鞋，会让人更愿意出门", "有些鞋，适合很多个普通周末"],
    titleSeconds: ["出门买束花，也想穿得舒服一点", "不用特别安排，也能好好过一天", "周末的路很零碎，鞋子要更省心", "不正式，也不随便的刚刚好", "城市里的半天，需要一双好走的鞋", "舒服地把自己带出门", "周末穿搭，轻松比用力更耐看", "真正常穿的鞋，通常都不夸张"],
    titleThirds: ["买咖啡、逛超市、看花，都能穿", "不抢镜，但让人看起来很干净", "这种普通日子，最能看出一双鞋好不好穿", "它不是为了拍照，是为了真的出门", "越轻松的周末，越需要一双不添乱的鞋", "衣服简单一点，脚步也轻一点", "一双德训鞋，陪你过很多个周末", "不用太精致，但也不想随便"],
    openings: [
      `现在的周末，我反而不太喜欢安排得太满。\n\n睡醒晚一点，出门买杯咖啡，顺路看看花，或者去附近超市慢慢逛一圈。`,
      `周末最好的状态，不一定是去了哪里。\n\n有时候就是下楼买杯咖啡，去超市补点东西，再慢慢走回家。`,
      `我以前以为，周末穿搭要有一点特别。\n\n后来发现，真正舒服的周末，反而是少一点用力。`,
      `周末出门，最怕穿得太满。\n\n明明只是去喝咖啡、买花、逛一小会儿，却把自己弄得很紧绷。`,
      `很多普通周末，其实没有明确目的。\n\n只是想出门走走，换一点空气，也让自己从工作日里抽离出来。`,
      `越是轻松的日子，我越不想被衣服和鞋子限制。\n\n好看可以有，但不要让人有负担。`,
      `周末的路通常很散。\n\n一会儿咖啡店，一会儿花店，一会儿又去了超市。`,
      `有时候让人愿意出门的，不是什么大计划。\n\n而是一身舒服、不需要反复确认的穿搭。`
    ],
    observations: [
      `没有什么特别的目的。\n\n但这种普通的半天，其实很能看出一双鞋是不是适合自己。`,
      `这种时候，我不想穿得太正式。\n\n也不想像刚运动完一样。`,
      `衣服简单一点。\n\n包轻一点。\n\n鞋子也别太抢。`,
      `一双鞋如果太正式，周末会显得紧。\n\n如果太运动，又少了一点日常的体面。`,
      `我喜欢那种能把人带出门的鞋。\n\n不用想太多，穿上就可以走。`,
      `很多小路加起来，也会走不少。\n\n所以周末鞋不能只看照片好不好看。`,
      `真正舒服的周末，不是完全不打扮。\n\n而是穿得干净、自然，又不需要一直端着。`,
      `一双温和的德训鞋，刚好能放在正式和运动之间。\n\n不刻意，也不邋遢。`
    ],
    scenes: [
      `太正式，会显得紧绷。\n\n太运动，又少了一点日常的体面。`,
      `它让整个人看起来轻一点。\n\n不抢衣服，也不拖累脚步。`,
      `因为周末的路很零碎。\n\n买花、逛书店、吃个简单午饭，再顺路去趟超市。`,
      `配白衬衫是清爽的。\n\n配针织衫是温和的。\n\n配牛仔裤又很自然。`,
      `花店门口、咖啡店窗边、社区小路上，它都能自然出现。\n\n不像专门为了拍照才穿。`,
      `如果一双鞋能让你走到下午还不想急着回家，它就很适合周末。`,
      `周末穿搭不需要很完整的造型感。\n\n有时候干净、舒服、有一点质感，就够了。`,
      `我更喜欢那种在生活里慢慢变常穿的鞋。\n\n不是特别抢眼，但每次出门都很顺。`
    ],
    closings: [
      `很多东西都是这样。\n\n真正常用的，不一定最特别。`,
      `很多时候，周末真正需要的不是造型感。\n\n是舒服地把自己带出门。`,
      `不会因为鞋子，提前想回家。\n\n这就是我现在很在意的日常价值。`,
      `但它会在你每次出门前，很自然地被拿起来。`,
      `普通周末也值得好好穿。\n\n只是不用那么用力。`,
      `一双舒服的鞋，会让那些小小的出门计划更容易发生。`,
      `周末的松弛，不是随便。\n\n是知道什么东西真的适合自己。`,
      `好穿的鞋不一定改变一天。\n\n但它会让这半天轻松很多。`
    ],
    tags: ["#THERUIZAURA", "#德训鞋", "#周末穿搭", "#城市漫步", "#花店日常", "#舒适穿搭", "#轻熟穿搭", "#QuietWarmLuxury"],
    note: "周末主题围绕咖啡、花店、超市、书店和城市漫步做低压种草组合。"
  },
  旅行: {
    titleLeads: ["一双鞋值不值得留，旅行一次就知道", "旅行最怕的，是鞋子选错", "出门几天，才知道哪双鞋真的靠谱", "短途旅行，我只想带一双好搭的鞋", "行李箱里最该认真选的，是鞋", "走很多路的日子，鞋子要安静可靠", "真正适合旅行的鞋，回来以后还会继续穿", "旅行回来，我会重新整理鞋柜"],
    titleSeconds: ["真正舒服的鞋，不是试穿五分钟决定的", "旅行不是拍照，更多时候是在走路", "一双能从酒店穿到街角的鞋", "少带一点，也要带对一双鞋", "能走、能搭、能回到日常，才是真的实用", "旅行会放大一双鞋的所有问题", "好看的鞋很多，好走的鞋更难得", "一趟旅行，会告诉你鞋柜里该留下什么"],
    titleThirds: ["它不是旅行装备感，是日常里的可靠", "机场、酒店、街道，都能自然出现", "走完一天还愿意继续穿，才算真的舒服", "短途旅行里，一双鞋要负责很多场景", "不追求第一眼惊艳，更在意一路走下来", "鞋子选对了，旅行会轻很多", "行李箱可以减法，鞋子不能将就", "从旅行回到生活，还是会继续穿它"],
    openings: [
      `每次旅行回来，我都会对鞋柜有一点新的判断。\n\n有些鞋出发前觉得很好看，走了两天以后，就只想回酒店赶紧换下来。`,
      `旅行的时候，衣服可以少带几件。\n\n但鞋子真的不能选错。`,
      `短途旅行最麻烦的地方，是行李不能带太多。\n\n衣服可以做减法。\n\n鞋子更要慎重。`,
      `一双鞋适不适合自己，旅行很快就会给答案。\n\n不是试穿几分钟，而是从早上出门走到晚上回酒店。`,
      `我以前旅行会带好几双鞋。\n\n后来发现，真正穿得最多的，通常还是那双最不需要思考的。`,
      `旅行里的路，常常不是计划好的。\n\n多走一条街，临时进一家店，或者在酒店附近慢慢逛。`,
      `很多鞋在出发前看起来都合适。\n\n但走过机场、酒店、街道和商场以后，差别就很明显了。`,
      `现在收拾行李，我会先想鞋。\n\n因为一双鞋选错，后面的衣服搭得再好也会被影响。`
    ],
    observations: [
      `也有一些鞋，刚开始没有特别期待。\n\n但机场、酒店、街道、商场、公园，一路穿下来，反而成了整趟行程里穿得最多的一双。`,
      `因为它不只是拍照的时候出现。\n\n它会陪你从酒店走到街边，从商场走到公园，从早上走到晚上。`,
      `因为一双不合适的鞋，会影响整趟行程的心情。\n\n早上出门很期待，下午就开始找地方坐下休息。`,
      `好不好看，只是第一层。\n\n更重要的是，走久了会不会累，会不会磨，会不会让不同衣服都还能搭得过去。`,
      `我喜欢那种没有很强旅行装备感的鞋。\n\n它更像日常里最熟悉的一双，只是被带去了另一个城市。`,
      `旅行最怕鞋子只适合拍照。\n\n真正一天走下来，脚会很诚实。`,
      `能搭裤装，也能搭裙装。\n\n白天走路不累，晚上去吃饭也不会太随便。`,
      `一双可靠的鞋，会让行李轻一点，也让行程松一点。`
    ],
    scenes: [
      `旅行很公平。\n\n它会把一双鞋的优点和问题都放大。`,
      `我喜欢那种不用太担心的鞋。\n\n不是很强烈的旅行装备感。\n\n也不是只能拍照的漂亮鞋。`,
      `所以我现在会选更日常一点的鞋。\n\n颜色不要太跳。\n\n鞋型干净。`,
      `酒店门口、街角咖啡店、行李箱旁边，它都能自然出现。\n\n不需要特意为旅行换一种自己。`,
      `旅行里最舒服的状态，是走了很多路，但人还没有被鞋子拖累。`,
      `一双鞋如果能让你少带一双备用鞋，它本身就已经很有价值了。`,
      `从出发到回家，它最好都能接住不同衣服和不同场景。`,
      `它不一定是照片里最抢眼的那双。\n\n但可能是你回家以后最庆幸带上的那双。`
    ],
    closings: [
      `所以现在买鞋，我不太追求第一眼多惊艳。\n\n我更在意它能不能陪我走完很多普通但真实的路。`,
      `它更像是日常里那双最熟悉的鞋，被你带去了别的城市。\n\n走了一圈回来，还是愿意继续穿。`,
      `旅行里的舒服，不是奢侈。\n\n是让你把注意力放回风景和身边的人。`,
      `毕竟旅行会结束。\n\n生活还会继续。`,
      `真正适合旅行的鞋，不是只属于旅行。\n\n它回到日常里，也依然好穿。`,
      `行李箱可以少一点。\n\n但脚下这一双，真的要选对。`,
      `有些鞋走过一次旅行，就知道能不能长期留下。`,
      `旅行会结束，但一双好穿的鞋，会继续回到每天的生活里。`
    ],
    tags: ["#THERUIZAURA", "#德训鞋穿搭", "#旅行穿搭", "#机场穿搭", "#旅行好物", "#城市漫步", "#舒服比惊艳更重要", "#QuietWarmLuxury"],
    note: "旅行主题围绕少带、好走、行李箱和旅行后继续穿做组合。"
  },
  秋冬: {
    titleLeads: ["秋冬穿搭，鞋子颜色别太冷", "秋冬不一定要穿得很重", "厚衣服下面，需要一双轻一点的鞋", "咖色燕麦色，真的很适合秋冬德训鞋", "一双暖色德训鞋，能救很多深色外套", "秋冬鞋子，舒服和颜色都很重要", "秋冬穿搭想松一点，可以从鞋开始", "最近更喜欢温一点的鞋子"],
    titleSeconds: ["秋冬的一双德训鞋，要干净，也要有温度", "大衣下面，鞋子别太沉", "深色衣服多了以后，鞋子要会提亮", "秋冬不是越厚越有质感", "奶油白、燕麦、暖灰，真的很耐看", "一双温和的鞋，让秋冬不那么钝", "咖色系穿搭，需要一点轻感", "厚衣服不显笨，鞋子很关键"],
    titleThirds: ["颜色不抢，但整个人会轻一点", "秋冬鞋柜里，需要这种安全感", "不冷、不硬、不突兀，才适合每天穿", "把深色大衣穿得没那么压人", "一双鞋，让秋冬层次更自然", "温一点的颜色，更适合成熟衣柜", "秋冬百搭，不是只有黑白灰", "干净，也要有一点温度"],
    openings: [
      `天气一冷，衣柜里的颜色会慢慢变深。\n\n黑色外套、深灰裤子、咖色针织，穿起来很安全，但有时候也会显得人有点沉。`,
      `秋冬穿搭很容易变得沉。\n\n外套厚了，颜色深了，整个人也会显得没那么轻。`,
      `秋冬最常见的穿搭，其实都差不多。\n\n针织、大衣、直筒裤、围巾。`,
      `一到秋冬，我会更在意鞋子的颜色。\n\n因为衣服厚起来以后，鞋子如果太重，整个人都会被往下压。`,
      `秋冬不是一定要穿得很深。\n\n尤其鞋子，它可以成为整身穿搭里最轻的一块。`,
      `厚衣服本身已经很有重量。\n\n所以脚下那一双，我反而想让它温和一点、干净一点。`,
      `很多秋冬衣服都很好搭。\n\n但真正穿上身以后，会发现差别常常在鞋子。`,
      `咖色、燕麦色、灰色这些颜色，本身很适合秋冬。\n\n但如果鞋子没选好，整身还是容易显得闷。`
    ],
    observations: [
      `所以秋冬选鞋，我反而不太想选太冷的颜色。\n\n一点奶油白，一点燕麦色，一点暖灰。`,
      `所以我会特别在意鞋子的颜色。\n\n太白会突兀。\n\n太深又容易压住整身。`,
      `衣服没问题，但如果鞋子颜色太重，整身就容易显得钝。\n\n我喜欢在鞋子上留一点轻感。`,
      `刚刚好的奶油色、燕麦色、暖灰色，反而更耐看。\n\n它不会抢大衣的存在感。`,
      `秋冬鞋最怕两种感觉。\n\n一种是太冷，一种是太笨。`,
      `一双颜色温和的德训鞋，会把大衣、针织和裤装接得更顺。`,
      `我不太追求秋冬鞋子很抢眼。\n\n更希望它在厚衣服下面，让整个人看起来轻一点。`,
      `颜色对了以后，很多基础款衣服都会变得更有层次。`
    ],
    scenes: [
      `干净，但不刺眼。\n\n轻一点，但不单薄。`,
      `它会让整体多一点呼吸感。\n\n尤其是咖色、灰色、米色这些秋冬常穿的衣服，搭起来很顺。`,
      `不是特别亮的白。\n\n而是温一点、柔一点的浅色。`,
      `它不会抢掉大衣和毛衣的存在感，只是在整身深色里面，把状态稍微提亮一点。`,
      `配咖色大衣的时候，它让整身不那么重。\n\n配灰色裤装的时候，又能保持干净。`,
      `秋冬走路的场景很多。\n\n上班、买咖啡、进商场、回家，鞋子都要自然。`,
      `如果鞋型太厚，秋冬衣服会更显沉。\n\n所以我还是更喜欢纤细一点、干净一点的德训鞋。`,
      `秋冬的高级感，不一定来自复杂设计。\n\n很多时候，是颜色和材质的分寸。`
    ],
    closings: [
      `秋冬的好看，不一定要很复杂。\n\n有时候就是一双颜色温和、鞋型干净、走路舒服的鞋。`,
      `一双鞋不需要很强的季节感。\n\n但它要让秋冬的衣服，显得没那么笨重。`,
      `秋冬不是一定要穿得很用力。\n\n很多时候，一双颜色对的鞋，就能让日常搭配舒服很多。`,
      `让厚衣服不显笨。\n\n也让人看起来没那么疲惫。`,
      `秋冬鞋柜里，真的需要这种不抢、但很耐看的颜色。`,
      `温一点的鞋色，会让整个人的状态也柔和一点。`,
      `衣服越厚，越需要脚下这点轻感。`,
      `秋冬的安全感，有时候就是一双每天都能搭的鞋。`
    ],
    tags: ["#THERUIZAURA", "#德训鞋", "#秋冬穿搭", "#咖色穿搭", "#燕麦色穿搭", "#轻熟风", "#舒适穿搭", "#QuietWarmLuxury"],
    note: "秋冬主题围绕温度感、提亮、咖色燕麦色和厚衣服轻感做组合。"
  },
  女性日常: {
    titleLeads: ["普通一天，也值得穿得舒服一点", "买鞋这件事，我现在越来越慢", "不是每一双鞋都要很特别", "生活已经够忙了，鞋子就别太复杂", "每天都会穿的鞋，才最值得认真选", "让生活轻一点，从一双鞋开始", "不赶潮流以后，我更会买鞋了", "真正常穿的鞋，通常都很安静"],
    titleSeconds: ["让生活轻一点，从一双鞋开始", "少一点选择，反而更轻松", "每天都会穿的东西，才最能安放生活", "真正省心的鞋，是不用反复搭配", "一双鞋，让普通日子轻一点", "不抢眼，但很常穿", "成年人买鞋，越来越看重确定感", "日常已经够忙，脚下要简单一点"],
    titleThirds: ["不是第一眼惊艳，是后来总会穿", "鞋柜里留下来的，都是确定感", "舒服和好看，不该互相妥协", "很多普通场景，都需要一双可靠的鞋", "上班、买菜、喝咖啡，都能自然出现", "越日常，越考验一双鞋", "好鞋不一定大声，但会一直被选择", "每天都能穿，才是真正的价值"],
    openings: [
      `有时候觉得，成年人的一天，真的被很多小事填满了。\n\n出门、开会、买东西、回消息、接电话、回家。`,
      `我现在买东西变慢了。\n\n不太容易因为第一眼喜欢就立刻下单。\n\n尤其是鞋。`,
      `生活里已经有太多事情需要判断了。\n\n今天穿什么，孩子几点下课，工作怎么安排，晚上吃什么。`,
      `以前买鞋会很在意特别。\n\n后来发现，特别的鞋不一定每天会穿。`,
      `到了一定阶段，衣柜里的东西会慢慢变少。\n\n留下来的，通常不是最夸张的，而是最确定的。`,
      `我越来越喜欢那些不需要解释太多的单品。\n\n安静、好搭、舒服，放进生活里很自然。`,
      `每天都要穿的东西，其实最能影响状态。\n\n鞋子就是这样。`,
      `有些消费是为了新鲜感。\n\n也有些消费，是为了让生活少一点麻烦。`
    ],
    observations: [
      `每一件都不算大事。\n\n但连在一起，就很消耗人。`,
      `因为鞋和衣服不一样。\n\n它不是只要好看就够了。`,
      `所以在一些小事上，我反而希望简单一点。\n\n鞋子就是其中一件。`,
      `一双鞋如果只适合某一种场合，就会慢慢被放回鞋柜。\n\n真正留下来的，是那些能自然进入很多日子的。`,
      `我不太想每天为了鞋重新搭配。\n\n也不想走到一半才发现它不适合今天。`,
      `鞋型干净，颜色温和，走路舒服。\n\n这些标准听起来普通，但每天都会用到。`,
      `我喜欢的是一种不打扰的好穿。\n\n它不会抢走注意力，也不会降低整个人的体面感。`,
      `越常穿的东西，越不能只靠第一眼。\n\n它要经得起很多普通场景。`
    ],
    scenes: [
      `所以我现在买东西，会更在意它是不是能让我轻松一点。\n\n一双鞋也是。`,
      `它要陪你走路，要适应很多场合，也要经得起反复穿。`,
      `一双好穿的德训鞋，最好的地方不是它多抢眼。\n\n而是它能自然地进入很多个普通日子。`,
      `上班、买菜、喝咖啡、见朋友、接孩子。\n\n它都不突兀。`,
      `不需要很强的风格标签。\n\n但放进白衬衫、针织、牛仔裤和直筒裤里，都很顺。`,
      `有些鞋的价值，不是在某一张照片里。\n\n而是在你很多次出门前，都会下意识拿起它。`,
      `如果一双鞋能减少你的搭配犹豫，也能减少走路负担，它就已经很有用。`,
      `它可以陪你去很普通的地方。\n\n但普通地方，才是生活的大部分。`
    ],
    closings: [
      `可能到了一定阶段，我们要的不是更多选择。\n\n而是更确定的选择。`,
      `有些东西的好，是慢慢出现的。\n\n不是第一眼惊艳，而是后来每次出门，都会自然地选择它。`,
      `这种省心，穿久了会越来越明显。`,
      `每天都会穿的东西，才最能安放生活。`,
      `生活已经够复杂了。\n\n脚下这一双，简单可靠就很好。`,
      `不赶潮流以后，反而更知道什么适合自己。`,
      `一双鞋不需要很大声。\n\n但它要真的能陪你过日子。`,
      `越普通的一天，越值得让自己舒服一点。`
    ],
    tags: ["#THERUIZAURA", "#德训鞋穿搭", "#女性日常", "#真实穿搭", "#质感生活", "#舒适穿搭", "#一鞋多搭", "#QuietWarmLuxury"],
    note: "女性日常主题围绕减少判断成本、确定感、长期主义和真实日常做组合。"
  }
};

const topicImageDrafts: Record<SoftSeedingTopic, SoftSeedingImageDraft[]> = {
  通勤: [
    { name: "图1｜封面｜入户镜前", purpose: "作为小红书封面，先建立真实顾客感和通勤状态。", description: "早晨玄关镜前，白衬衫或燕麦针织配浅色直筒裤，鞋子完整露出。", imageType: "对镜穿搭图", scenePreference: "入户镜前", garmentTypePreference: "裤装", extraRequirement: "Use a weekday morning entryway mirror selfie. Style a clean white shirt or oatmeal knit with warm beige straight-leg trousers, canvas tote, keys nearby, calm office commute mood, phone partly covering the face." },
    { name: "图2｜通勤路上｜写字楼门口", purpose: "把鞋放进真实工作日，不像广告摆拍。", description: "写字楼门口自然走路，不看镜头，像同事随手拍。", imageType: "生活场景图", scenePreference: "写字楼门口", garmentTypePreference: "裤装", extraRequirement: "Show a natural after-arrival commute moment outside a modern office entrance, walking with a tote and coffee, not looking at camera, shoes readable in the lower third." },
    { name: "图3｜转场｜地铁 / 商场通道", purpose: "体现一天里真实走动的路，不只适合坐办公室。", description: "低饱和通道光线，托特包、咖啡杯作为日常道具。", imageType: "生活场景图", scenePreference: "地铁 / 商场通道", garmentTypePreference: "裤装", extraRequirement: "Use a calm indoor transit corridor with warm neutral reflections, simple tote and takeaway coffee, candid walking posture, clear full shoe visibility, no crowded commute chaos." },
    { name: "图4｜午休｜咖啡馆内", purpose: "补一张坐姿细节图，给用户看鞋型和材质。", description: "靠窗坐下，双脚自然交叠，突出鞋型和皮革质感。", imageType: "生活场景图", scenePreference: "咖啡馆内", garmentTypePreference: "裤装", extraRequirement: "Seat the woman by a cafe window during a quiet lunch break, legs naturally crossed, shoe shape and material texture clearly readable, one magazine and coffee on the table." },
    { name: "图5｜下班｜回家进门", purpose: "用生活收尾，强化从早到晚都能穿。", description: "傍晚回家进门，手里拿花或轻便晚餐，生活感强一点。", imageType: "生活场景图", scenePreference: "回家进门", garmentTypePreference: "裤装", extraRequirement: "Use an early evening homecoming moment, placing tote and small flowers near the entryway, relaxed tired-but-calm expression, shoes still fully visible after a workday." }
  ],
  接娃: [
    { name: "图1｜封面｜下班出发", purpose: "接住从工作到家庭的身份切换。", description: "写字楼门口下班状态，人物拿托特包，鞋子在画面下方清晰露出。", imageType: "生活场景图", scenePreference: "写字楼门口", garmentTypePreference: "裤装", extraRequirement: "Show a mature city woman leaving work in late afternoon, holding a tote or laptop bag, slightly tired but composed, refined office-to-family transition, shoes fully visible." },
    { name: "图2｜等待｜社区步道", purpose: "项目里先用社区步道替代校门口，画面更干净。", description: "社区门口或步道等待，看手机或整理包，不刻意摆拍。", imageType: "生活场景图", scenePreference: "社区步道", garmentTypePreference: "裤装", extraRequirement: "Use a quiet residential community walkway in early evening, standing naturally while checking phone or adjusting tote, subtle family-life context without staged parent-child portrait." },
    { name: "图3｜回家路上｜公园慢走", purpose: "表达接完孩子后的真实走动，不要亲子写真感。", description: "孩子只出现局部背影或手部，重点保留成熟城市女性状态。", imageType: "生活场景图", scenePreference: "公园慢走", garmentTypePreference: "裤装", extraRequirement: "Show a calm after-school walk near a small park, optional child only as partial hand or back view, the woman remains the focus, shoes readable and grounded." },
    { name: "图4｜路上细节｜社区步道", purpose: "补一张自然走路抓拍，增强真实性。", description: "傍晚树影、浅色路面，自然走路抓拍。", imageType: "生活场景图", scenePreference: "社区步道", garmentTypePreference: "裤装", extraRequirement: "Create a candid low-key walking shot with soft tree shadows, warm stone pavement, tote bag movement, full sneaker visibility, no obvious posing." },
    { name: "图5｜收尾｜回家进门", purpose: "让一天结束，强调鞋子没有成为负担。", description: "放下托特包、钥匙和外套，一天结束的松弛感。", imageType: "生活场景图", scenePreference: "回家进门", garmentTypePreference: "裤装", extraRequirement: "Use a home entryway moment after pickup, tote bag and keys placed down, relaxed end-of-day body language, shoes clear and still naturally worn." }
  ],
  周末: [
    { name: "图1｜封面｜玄关出门", purpose: "周末第一张要轻松，但还是有质感。", description: "周末玄关出门，浅色针织或白衬衫配直筒裤，手拿钥匙。", imageType: "对镜穿搭图", scenePreference: "玄关出门", garmentTypePreference: "裤装", extraRequirement: "Use a relaxed weekend entryway mirror outfit, ivory knit or white shirt, warm beige straight trousers, keys and canvas tote, face partly hidden by phone, calm not influencer-like." },
    { name: "图2｜咖啡｜咖啡店门口", purpose: "生活方式图，适合小红书滑动第二张。", description: "人物拿外带咖啡自然走过，鞋子完整可见。", imageType: "生活场景图", scenePreference: "咖啡店门口", garmentTypePreference: "裤装", extraRequirement: "Show a quiet neighborhood cafe exterior, woman walking naturally with takeaway coffee and tote, no tourist landmark, shoes sharp and readable." },
    { name: "图3｜买花｜花店 / 买花", purpose: "增加柔和生活感，不像单纯拍鞋。", description: "低头挑花，鞋子自然进入画面，不要摆成广告。", imageType: "生活场景图", scenePreference: "花店 / 买花", garmentTypePreference: "裤装", extraRequirement: "Show the woman quietly selecting white or pale pink flowers, looking at flowers not camera, restrained flower shop, sneakers visible without becoming a hard product shot." },
    { name: "图4｜采购｜社区市集 / 精品买菜", purpose: "让鞋进入真实日常，不只是咖啡花店。", description: "推购物车或拿购物袋，低机位突出鞋型与真实生活感。", imageType: "生活场景图", scenePreference: "社区市集 / 精品买菜", garmentTypePreference: "裤装", extraRequirement: "Use a refined neighborhood grocery or small market, woman holding a simple paper bag or pushing a cart, low-key real errand mood, clear shoe shape." },
    { name: "图5｜休息｜窗边阅读角", purpose: "收尾做安静场景，补品牌的 Quiet Warm Luxury。", description: "坐下翻书，双脚自然交叠，整体安静温暖。", imageType: "生活场景图", scenePreference: "窗边阅读角", garmentTypePreference: "裤装", extraRequirement: "Seat the woman near a soft window reading corner, book in hand, legs relaxed, sneakers readable, linen curtain and warm-neutral light, quiet private weekend mood." }
  ],
  旅行: [
    { name: "图1｜封面｜酒店房间", purpose: "旅行内容的主图，直接进入出发前状态。", description: "酒店房间落地镜，行李箱半开，人物穿白衬衫和燕麦色裤装。", imageType: "对镜穿搭图", scenePreference: "酒店房间", garmentTypePreference: "裤装", extraRequirement: "Use a calm boutique hotel room mirror selfie, half-open suitcase, canvas tote, travel hat, ivory shirt and oatmeal trousers, shoes fully visible, not influencer travel pose." },
    { name: "图2｜出发｜周末轻旅行出发", purpose: "项目里用轻旅行出发替代机场候机，保证类型合法。", description: "行李箱在旁边，双鞋清晰可见，像出发前真实记录。", imageType: "生活场景图", scenePreference: "周末轻旅行出发", garmentTypePreference: "裤装", extraRequirement: "Show a quiet travel departure moment with carry-on suitcase and tote, seated or standing naturally, both sneakers clearly visible, no airport branding or tourist check-in mood." },
    { name: "图3｜漫步｜城市街角 / 安静街区", purpose: "证明旅行不是只拍酒店，也能走很多路。", description: "树荫、浅色石板路，人物自然走路。", imageType: "生活场景图", scenePreference: "城市街角 / 安静街区", garmentTypePreference: "裤装", extraRequirement: "Use a quiet city walk during travel, light stone pavement, soft greenery, natural walking posture, no landmark, full sneaker visibility." },
    { name: "图4｜门厅｜酒店门口 / 门厅", purpose: "补一张体面、干净的旅行转场图。", description: "准备出发，托特包、轻外套、鞋子完整露出。", imageType: "生活场景图", scenePreference: "酒店门口 / 门厅", garmentTypePreference: "裤装", extraRequirement: "Show a quiet hotel lobby or doorway transition, woman adjusting tote or light trench, refined but understated, shoes readable from toe to heel." },
    { name: "图5｜回家｜暑假外出后回家", purpose: "文案收尾，表达旅行结束生活继续。", description: "行李箱放下，弯腰整理鞋带，表达旅行结束。", imageType: "生活场景图", scenePreference: "暑假外出后回家", garmentTypePreference: "裤装", extraRequirement: "Use a home entryway after travel, suitcase on the floor, woman loosely adjusting laces or placing tote down, tired but comfortable, shoes still clear." }
  ],
  秋冬: [
    { name: "图1｜封面｜入户镜前", purpose: "秋冬封面要突出温度感和提亮作用。", description: "燕麦针织、深灰直筒裤、浅色德训鞋。", imageType: "对镜穿搭图", scenePreference: "入户镜前", garmentTypePreference: "裤装", season: "秋", extraRequirement: "Use a warm autumn-winter entryway mirror outfit, oatmeal knit, warm grey straight trousers, soft beige coat nearby, shoes brightening the outfit without looking flashy." },
    { name: "图2｜通勤｜商务区转角", purpose: "用大衣/外套场景证明秋冬也不笨重。", description: "咖色大衣通勤，鞋子提亮整身。", imageType: "生活场景图", scenePreference: "商务区转角", garmentTypePreference: "裤装", season: "秋", extraRequirement: "Show a muted autumn business-district corner with a camel or warm grey coat, trousers, tote, natural walking, sneakers making the outfit lighter." },
    { name: "图3｜生活｜书店 / 杂志店门口", purpose: "增加秋冬文化感，适合收藏。", description: "围巾、托特包、暖色墙面，氛围安静。", imageType: "生活场景图", scenePreference: "书店 / 杂志店门口", garmentTypePreference: "裤装", season: "秋", extraRequirement: "Use a quiet bookstore or magazine shop exterior, warm wall, scarf and tote, mature relaxed expression, sneakers fully visible, no tourist street mood." },
    { name: "图4｜材质｜材质工作台", purpose: "补一张材质图，给秋冬配色和皮料背书。", description: "麂皮、牛皮、鞋带、色卡放在暖石材上。", imageType: "拍摄花絮 / 材质图", scenePreference: "材质工作台", garmentTypePreference: "自动匹配", season: "秋", extraRequirement: "Create a tactile material table with suede samples, leather swatches, shoelaces, warm beige and soft grey color cards, product notes, no full model, quiet development mood." },
    { name: "图5｜回家｜回家进门", purpose: "用回家场景把秋冬内容落回日常。", description: "脱下大衣，鞋子仍完整可见，有秋冬生活感。", imageType: "生活场景图", scenePreference: "回家进门", garmentTypePreference: "裤装", season: "秋", extraRequirement: "Use a calm autumn homecoming scene, coat being placed down, warm neutral hallway, visible sneakers, tactile shadows, restrained cozy mood." }
  ],
  女性日常: [
    { name: "图1｜封面｜入户镜前", purpose: "最接近日常用户自拍，可作为长期内容主图。", description: "真实入户镜前，人物准备出门，手机半遮脸，鞋子完整露出。", imageType: "对镜穿搭图", scenePreference: "入户镜前", garmentTypePreference: "裤装", extraRequirement: "Use a real customer-like entryway mirror selfie, calm morning preparation, phone half covering the face, clean shirt and soft trousers, shoes fully visible." },
    { name: "图2｜工作台｜工作台 / 桌边整理", purpose: "让内容不只在外面拍，也有真实生活秩序。", description: "笔记本、咖啡、托特包，人物坐姿自然，鞋子在下方出现。", imageType: "生活场景图", scenePreference: "工作台 / 桌边整理", garmentTypePreference: "裤装", extraRequirement: "Show a quiet desk-side reset moment with notebook, coffee, tote bag, seated natural posture, sneakers visible under the table, mature daily order." },
    { name: "图3｜外带｜楼下便利店 / 咖啡外带", purpose: "做真实的楼下生活，不要太精致。", description: "日常感强，像朋友随手记录。", imageType: "生活场景图", scenePreference: "楼下便利店 / 咖啡外带", garmentTypePreference: "裤装", extraRequirement: "Use a downstairs takeaway coffee or convenience-store errand, candid friend-taken angle, mature relaxed woman, shoes clearly visible, no influencer check-in feel." },
    { name: "图4｜慢走｜社区步道", purpose: "补一张自然走动图，强调舒服和日常。", description: "自然慢走，低饱和背景，鞋子清楚。", imageType: "生活场景图", scenePreference: "社区步道", garmentTypePreference: "裤装", extraRequirement: "Create a soft neutral residential walkway slow-walk shot, calm posture, subtle greenery, full sneaker visibility, quiet ordinary day mood." },
    { name: "图5｜静物｜材质工作台", purpose: "最后补品牌质感，不让整组全是人物。", description: "鞋子、白衬衫、钥匙、色卡和皮料，表达日常秩序。", imageType: "产品静物图", scenePreference: "材质工作台", garmentTypePreference: "自动匹配", extraRequirement: "Create a refined product still life with the selected sneakers, white shirt fabric, keys, subtle color cards, leather swatches, warm stone surface, quiet daily order." }
  ]
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

function buildImagePlan(baseParams: TeamPromptParams, draft: SoftSeedingImageDraft, index: number): SoftSeedingImagePlan {
  const shoeFields = resolveBaseShoe(baseParams);
  const params: TeamPromptParams = {
    ...baseParams,
    ...shoeFields,
    imageType: draft.imageType,
    scenePreference: draft.scenePreference,
    garmentTypePreference: draft.garmentTypePreference,
    season: resolveBaseSeason(baseParams.season, draft.season),
    modelChoice: "30–45岁客户画像模特",
    modelContinuity: index === 0 ? "新人物" : "延续上一组人物",
    studioLaunchAnglePreference: "自动匹配",
    stillLifeStyle: "与主视觉统一",
    extraRequirement: draft.extraRequirement,
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
    images: topicImageDrafts[topic].slice(0, imageCount).map((imageDraft, index) => buildImagePlan(input.baseParams, imageDraft, index)),
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
    `# THERUIZ AURA 软种草｜${content.dateKey}｜第 ${content.dailySlot} 篇｜${content.topic}｜${content.variantLabel}`,
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
