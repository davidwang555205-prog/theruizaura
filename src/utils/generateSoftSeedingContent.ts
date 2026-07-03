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

export type SoftSeedingImagePlan = {
  name: string;
  purpose: string;
  description: string;
  params: TeamPromptParams;
  prompt: string;
};

export type SoftSeedingContent = {
  topic: SoftSeedingTopic;
  titles: string[];
  body: string;
  images: SoftSeedingImagePlan[];
  tags: string[];
  note: string;
};

type SoftSeedingInput = {
  topic: SoftSeedingTopic;
  baseParams: TeamPromptParams;
  imageCount?: 3 | 5;
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

type TopicDraft = {
  titles: string[];
  body: string;
  imageDrafts: SoftSeedingImageDraft[];
  tags: string[];
  note: string;
};

export const softSeedingTopicOptions: SoftSeedingTopic[] = ["通勤", "接娃", "周末", "旅行", "秋冬", "女性日常"];

const topicDrafts: Record<SoftSeedingTopic, TopicDraft> = {
  通勤: {
    titles: ["上班路上，鞋子不要太有负担", "早上出门，我越来越会选这种鞋", "通勤穿搭，舒服一点没什么不好"],
    body: `早上出门的时候，其实没有那么多时间慢慢搭配。

衬衫要不要换，裤脚会不会压鞋，今天会不会走很多路。

这些小事加在一起，人还没到公司，心里已经有点烦了。

所以我现在越来越喜欢那种不用反复想的鞋。

配西裤不突兀，配牛仔裤也自然。早上出门，晚上回来，一整天都不用特别惦记脚。

它不是那种第一眼很用力的设计。

但穿久了会发现，日常真正需要的，反而是这种安静、干净、不会添乱的东西。

好看的鞋很多。

愿意每天穿的，才会留在鞋柜里。`,
    imageDrafts: [
      {
        name: "图1｜封面｜入户镜前",
        purpose: "作为小红书封面，先建立真实顾客感和通勤状态。",
        description: "早晨玄关镜前，白衬衫或燕麦针织配浅色直筒裤，鞋子完整露出。",
        imageType: "对镜穿搭图",
        scenePreference: "入户镜前",
        garmentTypePreference: "裤装",
        extraRequirement:
          "Use a weekday morning entryway mirror selfie. Style a clean white shirt or oatmeal knit with warm beige straight-leg trousers, canvas tote, keys nearby, calm office commute mood, phone partly covering the face."
      },
      {
        name: "图2｜通勤路上｜写字楼门口",
        purpose: "把鞋放进真实工作日，不像广告摆拍。",
        description: "写字楼门口自然走路，不看镜头，像同事随手拍。",
        imageType: "生活场景图",
        scenePreference: "写字楼门口",
        garmentTypePreference: "裤装",
        extraRequirement:
          "Show a natural after-arrival commute moment outside a modern office entrance, walking with a tote and coffee, not looking at camera, shoes readable in the lower third."
      },
      {
        name: "图3｜转场｜地铁 / 商场通道",
        purpose: "体现一天里真实走动的路，不只适合坐办公室。",
        description: "低饱和通道光线，托特包、咖啡杯作为日常道具。",
        imageType: "生活场景图",
        scenePreference: "地铁 / 商场通道",
        garmentTypePreference: "裤装",
        extraRequirement:
          "Use a calm indoor transit corridor with warm neutral reflections, simple tote and takeaway coffee, candid walking posture, clear full shoe visibility, no crowded commute chaos."
      },
      {
        name: "图4｜午休｜咖啡馆内",
        purpose: "补一张坐姿细节图，给用户看鞋型和材质。",
        description: "靠窗坐下，双脚自然交叠，突出鞋型和皮革质感。",
        imageType: "生活场景图",
        scenePreference: "咖啡馆内",
        garmentTypePreference: "裤装",
        extraRequirement:
          "Seat the woman by a cafe window during a quiet lunch break, legs naturally crossed, shoe shape and material texture clearly readable, one magazine and coffee on the table."
      },
      {
        name: "图5｜下班｜回家进门",
        purpose: "用生活收尾，强化从早到晚都能穿。",
        description: "傍晚回家进门，手里拿花或轻便晚餐，生活感强一点。",
        imageType: "生活场景图",
        scenePreference: "回家进门",
        garmentTypePreference: "裤装",
        extraRequirement:
          "Use an early evening homecoming moment, placing tote and small flowers near the entryway, relaxed tired-but-calm expression, shoes still fully visible after a workday."
      }
    ],
    tags: ["#THERUIZAURA", "#德训鞋", "#通勤穿搭", "#上班穿什么", "#舒适穿搭", "#轻熟风", "#一鞋多搭", "#QuietWarmLuxury"],
    note: "这篇用“通勤少一点负担”做切口，重点不是夸鞋，而是让用户想到自己每天早上出门的真实状态。"
  },
  接娃: {
    titles: ["下班去接娃，鞋子真的不能添乱", "从办公室到校门口，我会穿得轻松一点", "一双鞋，撑住一天的后半场"],
    body: `一天里真正累的部分，很多时候不是上班。

是下班以后。

电脑合上，包拿起来，才发现今天还没结束。

要去接孩子，要顺路买点东西，可能还要陪他在楼下多玩十分钟。

这时候鞋子好不好穿，突然就变得很具体。

站久一点会不会累，走快一点会不会磨，配今天这身衣服会不会太随便。

我喜欢德训鞋的原因，也是在这些很普通的时刻里慢慢确定的。

它不会把你打扮得很隆重。

但会让你从办公室走到校门口，还是干净、体面、没有那么狼狈。

有些舒服，不是软塌塌。

是让人能从容地把一天过完。`,
    imageDrafts: [
      {
        name: "图1｜封面｜下班出发",
        purpose: "接住从工作到家庭的身份切换。",
        description: "写字楼门口下班状态，人物拿托特包，鞋子在画面下方清晰露出。",
        imageType: "生活场景图",
        scenePreference: "写字楼门口",
        garmentTypePreference: "裤装",
        extraRequirement:
          "Show a mature city woman leaving work in late afternoon, holding a tote or laptop bag, slightly tired but composed, refined office-to-family transition, shoes fully visible."
      },
      {
        name: "图2｜等待｜社区步道",
        purpose: "项目里先用社区步道替代校门口，画面更干净。",
        description: "社区门口或步道等待，看手机或整理包，不刻意摆拍。",
        imageType: "生活场景图",
        scenePreference: "社区步道",
        garmentTypePreference: "裤装",
        extraRequirement:
          "Use a quiet residential community walkway in early evening, standing naturally while checking phone or adjusting tote, subtle family-life context without staged parent-child portrait."
      },
      {
        name: "图3｜回家路上｜公园慢走",
        purpose: "表达接完孩子后的真实走动，不要亲子写真感。",
        description: "孩子只出现局部背影或手部，重点保留成熟城市女性状态。",
        imageType: "生活场景图",
        scenePreference: "公园慢走",
        garmentTypePreference: "裤装",
        extraRequirement:
          "Show a calm after-school walk near a small park, optional child only as partial hand or back view, the woman remains the focus, shoes readable and grounded."
      },
      {
        name: "图4｜路上细节｜社区步道",
        purpose: "补一张自然走路抓拍，增强真实性。",
        description: "傍晚树影、浅色路面，自然走路抓拍。",
        imageType: "生活场景图",
        scenePreference: "社区步道",
        garmentTypePreference: "裤装",
        extraRequirement:
          "Create a candid low-key walking shot with soft tree shadows, warm stone pavement, tote bag movement, full sneaker visibility, no obvious posing."
      },
      {
        name: "图5｜收尾｜回家进门",
        purpose: "让一天结束，强调鞋子没有成为负担。",
        description: "放下托特包、钥匙和外套，一天结束的松弛感。",
        imageType: "生活场景图",
        scenePreference: "回家进门",
        garmentTypePreference: "裤装",
        extraRequirement:
          "Use a home entryway moment after pickup, tote bag and keys placed down, relaxed end-of-day body language, shoes clear and still naturally worn."
      }
    ],
    tags: ["#THERUIZAURA", "#德训鞋穿搭", "#接娃穿搭", "#下班后日常", "#妈妈也要舒服好看", "#舒适穿搭", "#城市女性", "#QuietWarmLuxury"],
    note: "这篇抓的是30–45岁女性的身份切换：从工作到家庭，鞋子要体面，也要能走。"
  },
  周末: {
    titles: ["周末最舒服的状态，是不用太用力", "出门买束花，也想穿得舒服一点", "有些鞋，适合很多个普通周末"],
    body: `现在的周末，我反而不太喜欢安排得太满。

睡醒晚一点，出门买杯咖啡，顺路看看花，或者去附近超市慢慢逛一圈。

没有什么特别的目的。

但这种普通的半天，其实很能看出一双鞋是不是适合自己。

太正式，会显得紧绷。

太运动，又少了一点日常的体面。

我喜欢那种刚刚好的状态。

能走路，能搭衣服，也不会让整个人看起来太刻意。

很多东西都是这样。

真正常用的，不一定最特别。

但它会在你每次出门前，很自然地被拿起来。`,
    imageDrafts: [
      {
        name: "图1｜封面｜玄关出门",
        purpose: "周末第一张要轻松，但还是有质感。",
        description: "周末玄关出门，浅色针织或白衬衫配直筒裤，手拿钥匙。",
        imageType: "对镜穿搭图",
        scenePreference: "玄关出门",
        garmentTypePreference: "裤装",
        extraRequirement:
          "Use a relaxed weekend entryway mirror outfit, ivory knit or white shirt, warm beige straight trousers, keys and canvas tote, face partly hidden by phone, calm not influencer-like."
      },
      {
        name: "图2｜咖啡｜咖啡店门口",
        purpose: "生活方式图，适合小红书滑动第二张。",
        description: "人物拿外带咖啡自然走过，鞋子完整可见。",
        imageType: "生活场景图",
        scenePreference: "咖啡店门口",
        garmentTypePreference: "裤装",
        extraRequirement:
          "Show a quiet neighborhood cafe exterior, woman walking naturally with takeaway coffee and tote, no tourist landmark, shoes sharp and readable."
      },
      {
        name: "图3｜买花｜花店 / 买花",
        purpose: "增加柔和生活感，不像单纯拍鞋。",
        description: "低头挑花，鞋子自然进入画面，不要摆成广告。",
        imageType: "生活场景图",
        scenePreference: "花店 / 买花",
        garmentTypePreference: "裤装",
        extraRequirement:
          "Show the woman quietly selecting white or pale pink flowers, looking at flowers not camera, restrained flower shop, sneakers visible without becoming a hard product shot."
      },
      {
        name: "图4｜采购｜社区市集 / 精品买菜",
        purpose: "让鞋进入真实日常，不只是咖啡花店。",
        description: "推购物车或拿购物袋，低机位突出鞋型与真实生活感。",
        imageType: "生活场景图",
        scenePreference: "社区市集 / 精品买菜",
        garmentTypePreference: "裤装",
        extraRequirement:
          "Use a refined neighborhood grocery or small market, woman holding a simple paper bag or pushing a cart, low-key real errand mood, clear shoe shape."
      },
      {
        name: "图5｜休息｜窗边阅读角",
        purpose: "收尾做安静场景，补品牌的 Quiet Warm Luxury。",
        description: "坐下翻书，双脚自然交叠，整体安静温暖。",
        imageType: "生活场景图",
        scenePreference: "窗边阅读角",
        garmentTypePreference: "裤装",
        extraRequirement:
          "Seat the woman near a soft window reading corner, book in hand, legs relaxed, sneakers readable, linen curtain and warm-neutral light, quiet private weekend mood."
      }
    ],
    tags: ["#THERUIZAURA", "#德训鞋", "#周末穿搭", "#城市漫步", "#花店日常", "#舒适穿搭", "#轻熟穿搭", "#QuietWarmLuxury"],
    note: "这篇适合朋友圈/小红书低压种草，把产品放进周末生活，而不是直接卖产品。"
  },
  旅行: {
    titles: ["一双鞋值不值得留，旅行一次就知道", "旅行回来，我会重新整理鞋柜", "真正舒服的鞋，不是试穿五分钟决定的"],
    body: `每次旅行回来，我都会对鞋柜有一点新的判断。

有些鞋出发前觉得很好看，走了两天以后，就只想回酒店赶紧换下来。

也有一些鞋，刚开始没有特别期待。

但机场、酒店、街道、商场、公园，一路穿下来，反而成了整趟行程里穿得最多的一双。

旅行很公平。

它会把一双鞋的优点和问题都放大。

好不好走，磨不磨脚，能不能配不同衣服，回到酒店的时候还想不想继续穿。

这些都骗不了人。

所以现在买鞋，我不太追求第一眼多惊艳。

我更在意它能不能陪我走完很多普通但真实的路。

毕竟旅行会结束。

生活还会继续。`,
    imageDrafts: [
      {
        name: "图1｜封面｜酒店房间",
        purpose: "旅行内容的主图，直接进入出发前状态。",
        description: "酒店房间落地镜，行李箱半开，人物穿白衬衫和燕麦色裤装。",
        imageType: "对镜穿搭图",
        scenePreference: "酒店房间",
        garmentTypePreference: "裤装",
        extraRequirement:
          "Use a calm boutique hotel room mirror selfie, half-open suitcase, canvas tote, travel hat, ivory shirt and oatmeal trousers, shoes fully visible, not influencer travel pose."
      },
      {
        name: "图2｜出发｜周末轻旅行出发",
        purpose: "项目里用轻旅行出发替代机场候机，保证类型合法。",
        description: "行李箱在旁边，双鞋清晰可见，像出发前真实记录。",
        imageType: "生活场景图",
        scenePreference: "周末轻旅行出发",
        garmentTypePreference: "裤装",
        extraRequirement:
          "Show a quiet travel departure moment with carry-on suitcase and tote, seated or standing naturally, both sneakers clearly visible, no airport branding or tourist check-in mood."
      },
      {
        name: "图3｜漫步｜城市街角 / 安静街区",
        purpose: "证明旅行不是只拍酒店，也能走很多路。",
        description: "树荫、浅色石板路，人物自然走路。",
        imageType: "生活场景图",
        scenePreference: "城市街角 / 安静街区",
        garmentTypePreference: "裤装",
        extraRequirement:
          "Use a quiet city walk during travel, light stone pavement, soft greenery, natural walking posture, no landmark, full sneaker visibility."
      },
      {
        name: "图4｜门厅｜酒店门口 / 门厅",
        purpose: "补一张体面、干净的旅行转场图。",
        description: "准备出发，托特包、轻外套、鞋子完整露出。",
        imageType: "生活场景图",
        scenePreference: "酒店门口 / 门厅",
        garmentTypePreference: "裤装",
        extraRequirement:
          "Show a quiet hotel lobby or doorway transition, woman adjusting tote or light trench, refined but understated, shoes readable from toe to heel."
      },
      {
        name: "图5｜回家｜暑假外出后回家",
        purpose: "文案收尾，表达旅行结束生活继续。",
        description: "行李箱放下，弯腰整理鞋带，表达旅行结束。",
        imageType: "生活场景图",
        scenePreference: "暑假外出后回家",
        garmentTypePreference: "裤装",
        extraRequirement:
          "Use a home entryway after travel, suitcase on the floor, woman loosely adjusting laces or placing tote down, tired but comfortable, shoes still clear."
      }
    ],
    tags: ["#THERUIZAURA", "#德训鞋穿搭", "#旅行穿搭", "#机场穿搭", "#旅行好物", "#城市漫步", "#舒服比惊艳更重要", "#QuietWarmLuxury"],
    note: "旅行是检验鞋子的强场景。文案里不要写“暴走神器”，用真实体验替代卖点堆砌。"
  },
  秋冬: {
    titles: ["秋冬穿搭，鞋子颜色别太冷", "最近更喜欢温一点的鞋子", "秋冬的一双德训鞋，要干净，也要有温度"],
    body: `天气一冷，衣柜里的颜色会慢慢变深。

黑色外套、深灰裤子、咖色针织，穿起来很安全，但有时候也会显得人有点沉。

所以秋冬选鞋，我反而不太想选太冷的颜色。

一点奶油白，一点燕麦色，一点暖灰。

干净，但不刺眼。

轻一点，但不单薄。

它不会抢掉大衣和毛衣的存在感，只是在整身深色里面，把状态稍微提亮一点。

秋冬的好看，不一定要很复杂。

有时候就是一双颜色温和、鞋型干净、走路舒服的鞋。

让厚衣服不显笨。

也让人看起来没那么疲惫。`,
    imageDrafts: [
      {
        name: "图1｜封面｜入户镜前",
        purpose: "秋冬封面要突出温度感和提亮作用。",
        description: "燕麦针织、深灰直筒裤、浅色德训鞋。",
        imageType: "对镜穿搭图",
        scenePreference: "入户镜前",
        garmentTypePreference: "裤装",
        season: "秋",
        extraRequirement:
          "Use a warm autumn-winter entryway mirror outfit, oatmeal knit, warm grey straight trousers, soft beige coat nearby, shoes brightening the outfit without looking flashy."
      },
      {
        name: "图2｜通勤｜商务区转角",
        purpose: "用大衣/外套场景证明秋冬也不笨重。",
        description: "咖色大衣通勤，鞋子提亮整身。",
        imageType: "生活场景图",
        scenePreference: "商务区转角",
        garmentTypePreference: "裤装",
        season: "秋",
        extraRequirement:
          "Show a muted autumn business-district corner with a camel or warm grey coat, trousers, tote, natural walking, sneakers making the outfit lighter."
      },
      {
        name: "图3｜生活｜书店 / 杂志店门口",
        purpose: "增加秋冬文化感，适合收藏。",
        description: "围巾、托特包、暖色墙面，氛围安静。",
        imageType: "生活场景图",
        scenePreference: "书店 / 杂志店门口",
        garmentTypePreference: "裤装",
        season: "秋",
        extraRequirement:
          "Use a quiet bookstore or magazine shop exterior, warm wall, scarf and tote, mature relaxed expression, sneakers fully visible, no tourist street mood."
      },
      {
        name: "图4｜材质｜材质工作台",
        purpose: "补一张材质图，给秋冬配色和皮料背书。",
        description: "麂皮、牛皮、鞋带、色卡放在暖石材上。",
        imageType: "拍摄花絮 / 材质图",
        scenePreference: "材质工作台",
        garmentTypePreference: "自动匹配",
        season: "秋",
        extraRequirement:
          "Create a tactile material table with suede samples, leather swatches, shoelaces, warm beige and soft grey color cards, product notes, no full model, quiet development mood."
      },
      {
        name: "图5｜回家｜回家进门",
        purpose: "用回家场景把秋冬内容落回日常。",
        description: "脱下大衣，鞋子仍完整可见，有秋冬生活感。",
        imageType: "生活场景图",
        scenePreference: "回家进门",
        garmentTypePreference: "裤装",
        season: "秋",
        extraRequirement:
          "Use a calm autumn homecoming scene, coat being placed down, warm neutral hallway, visible sneakers, tactile shadows, restrained cozy mood."
      }
    ],
    tags: ["#THERUIZAURA", "#德训鞋", "#秋冬穿搭", "#咖色穿搭", "#燕麦色穿搭", "#轻熟风", "#舒适穿搭", "#QuietWarmLuxury"],
    note: "秋冬内容要多讲“温度感”和“提亮”，少讲潮流。客户买的是衣柜里的安全感。"
  },
  女性日常: {
    titles: ["普通一天，也值得穿得舒服一点", "不赶潮流以后，我更会买鞋了", "让生活轻一点，从一双鞋开始"],
    body: `有时候觉得，成年人的一天，真的被很多小事填满了。

出门、开会、买东西、回消息、接电话、回家。

每一件都不算大事。

但连在一起，就很消耗人。

所以我现在买东西，会更在意它是不是能让我轻松一点。

一双鞋也是。

不用特别抢眼，不用太有风格负担，也不用只适合某一种场合。

它只要能让我走路舒服，搭衣服省心，出门的时候少一点犹豫。

这就已经很好了。

可能到了一定阶段，我们要的不是更多选择。

而是更确定的选择。

每天都会穿的东西，才最能安放生活。`,
    imageDrafts: [
      {
        name: "图1｜封面｜入户镜前",
        purpose: "最接近日常用户自拍，可作为长期内容主图。",
        description: "真实入户镜前，人物准备出门，手机半遮脸，鞋子完整露出。",
        imageType: "对镜穿搭图",
        scenePreference: "入户镜前",
        garmentTypePreference: "裤装",
        extraRequirement:
          "Use a real customer-like entryway mirror selfie, calm morning preparation, phone half covering the face, clean shirt and soft trousers, shoes fully visible."
      },
      {
        name: "图2｜工作台｜工作台 / 桌边整理",
        purpose: "让内容不只在外面拍，也有真实生活秩序。",
        description: "笔记本、咖啡、托特包，人物坐姿自然，鞋子在下方出现。",
        imageType: "生活场景图",
        scenePreference: "工作台 / 桌边整理",
        garmentTypePreference: "裤装",
        extraRequirement:
          "Show a quiet desk-side reset moment with notebook, coffee, tote bag, seated natural posture, sneakers visible under the table, mature daily order."
      },
      {
        name: "图3｜外带｜楼下便利店 / 咖啡外带",
        purpose: "做真实的楼下生活，不要太精致。",
        description: "日常感强，像朋友随手记录。",
        imageType: "生活场景图",
        scenePreference: "楼下便利店 / 咖啡外带",
        garmentTypePreference: "裤装",
        extraRequirement:
          "Use a downstairs takeaway coffee or convenience-store errand, candid friend-taken angle, mature relaxed woman, shoes clearly visible, no influencer check-in feel."
      },
      {
        name: "图4｜慢走｜社区步道",
        purpose: "补一张自然走动图，强调舒服和日常。",
        description: "自然慢走，低饱和背景，鞋子清楚。",
        imageType: "生活场景图",
        scenePreference: "社区步道",
        garmentTypePreference: "裤装",
        extraRequirement:
          "Create a soft neutral residential walkway slow-walk shot, calm posture, subtle greenery, full sneaker visibility, quiet ordinary day mood."
      },
      {
        name: "图5｜静物｜材质工作台",
        purpose: "最后补品牌质感，不让整组全是人物。",
        description: "鞋子、白衬衫、钥匙、色卡和皮料，表达日常秩序。",
        imageType: "产品静物图",
        scenePreference: "材质工作台",
        garmentTypePreference: "自动匹配",
        extraRequirement:
          "Create a refined product still life with the selected sneakers, white shirt fabric, keys, subtle color cards, leather swatches, warm stone surface, quiet daily order."
      }
    ],
    tags: ["#THERUIZAURA", "#德训鞋穿搭", "#女性日常", "#真实穿搭", "#质感生活", "#舒适穿搭", "#一鞋多搭", "#QuietWarmLuxury"],
    note: "这篇是品牌长期内容的底层表达：少一点选择焦虑，多一点确定感。"
  }
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
  const draft = topicDrafts[input.topic];
  const imageCount = input.imageCount ?? 5;

  return {
    topic: input.topic,
    titles: draft.titles,
    body: draft.body,
    images: draft.imageDrafts.slice(0, imageCount).map((imageDraft, index) => buildImagePlan(input.baseParams, imageDraft, index)),
    tags: draft.tags,
    note: draft.note
  };
}

export function getShoeDisplayName(shoe: TeamShoe, customShoe: string) {
  if (shoe !== "自定义") return shoe;
  return customShoe.trim() || "自定义鞋款";
}

export function formatSoftSeedingContent(content: SoftSeedingContent) {
  return [
    `# THERUIZ AURA 软种草｜${content.topic}`,
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
