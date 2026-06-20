import type { TemplateItem } from "../types";
import { MIRROR_SELFIE_ACTIONS } from "./sceneBlocks";

export const BUILT_IN_TEMPLATES: TemplateItem[] = [
  {
    id: "tpl-01-delphinium-blue-three",
    name: "飞燕草蓝 3图系列",
    category: "product",
    purpose: "轻熟通勤和周末穿搭",
    recommendedPlatform: "image2.0 / GPT Image / Midjourney",
    productParams: {
      shoe: "Delphinium Blue 飞燕草蓝",
      material: "麂皮",
      season: "Summer",
      colorDescription:
        "低饱和飞燕草蓝，清新、安静、夏日空气感，不少女，不网红，适合轻熟通勤和周末穿搭。",
      generationMode: "three",
      scenes: ["01", "03", "06"],
      action: "自动匹配",
      ageRange: "30-45",
      people: "model",
      logo: "small"
    }
  },
  {
    id: "tpl-02-sand-dollar-classic",
    name: "沙钱白经典3图",
    category: "product",
    purpose: "经典浅色基础款内容",
    recommendedPlatform: "image2.0 / GPT Image / Midjourney",
    productParams: {
      shoe: "Sand Dollar 沙钱白",
      material: "混合材质",
      season: "Spring",
      colorDescription:
        "温柔沙钱白，比纯白更成熟，更适合日常高级穿搭，是衣柜里的经典浅色基础款。",
      generationMode: "three",
      scenes: ["01", "05", "06"],
      action: "自动匹配",
      ageRange: "30-45",
      people: "model",
      logo: "small"
    }
  },
  {
    id: "tpl-03-silver-romance-xhs",
    name: "银色浪漫小红书",
    category: "product",
    purpose: "小红书视觉亮点内容",
    recommendedPlatform: "GPT Image / Midjourney",
    productParams: {
      shoe: "Silver Romance 银色浪漫",
      material: "自定义",
      customMaterial: "金属感皮革",
      season: "Autumn",
      colorDescription:
        "月光银，低调发光，有一点点视觉亮点，但不夸张、不赛博、不夜店。",
      generationMode: "three",
      scenes: ["03", "06", "05"],
      action: "自动匹配",
      ageRange: "30-45",
      people: "model",
      logo: "none"
    }
  },
  {
    id: "tpl-04-aire-summer-mesh",
    name: "Aire 网布春夏",
    category: "product",
    purpose: "春夏轻盈舒适内容",
    recommendedPlatform: "image2.0 / GPT Image",
    productParams: {
      shoe: "Aire 微风",
      material: "网布",
      season: "Summer",
      colorDescription:
        "轻透、呼吸感、春夏松弛感，不运动、不跑步感，是日常轻盈舒适的夏季鞋。",
      generationMode: "three",
      scenes: ["01", "06", "08"],
      action: "自动匹配",
      ageRange: "30-45",
      people: "model",
      logo: "small"
    }
  },
  {
    id: "tpl-05-cappuccino-autumn",
    name: "卡布奇诺秋冬氛围",
    category: "product",
    purpose: "秋冬温感氛围内容",
    recommendedPlatform: "image2.0 / GPT Image / Midjourney",
    productParams: {
      shoe: "Cappuccino 卡布奇诺",
      material: "麂皮",
      season: "Autumn",
      colorDescription:
        "卡布奇诺棕，温柔咖啡色调，秋冬氛围感，复古但干净，不厚重。",
      generationMode: "three",
      scenes: ["03", "04", "06"],
      action: "自动匹配",
      ageRange: "30-45",
      people: "model",
      logo: "small"
    }
  },
  {
    id: "tpl-06-material-table",
    name: "材质开发台面",
    category: "atmosphere",
    purpose: "材质故事 / 主理人内容",
    recommendedPlatform: "小红书 / 详情页辅助图",
    atmosphereParams: {
      imageType: "材质与触感",
      usage: "材质故事",
      shoeAllowance: "可出现鞋子局部，但不能成为主角",
      peopleAllowance: "只出现手部 / 背影 / 局部",
      extraDescription: "强调皮料、麂皮、鞋带、护理刷、色卡、工作台面的真实开发感。"
    }
  },
  {
    id: "tpl-07-bts",
    name: "拍摄花絮",
    category: "atmosphere",
    purpose: "拍摄花絮 / 小红书配图",
    recommendedPlatform: "小红书",
    atmosphereParams: {
      imageType: "拍摄花絮",
      usage: "拍摄花絮",
      shoeAllowance: "可出现鞋子局部，但不能成为主角",
      peopleAllowance: "只出现手部 / 背影 / 局部",
      extraDescription:
        "真实拍摄现场，灯架边缘、监视器、造型台、工作人员整理鞋带或裤脚，轻微凌乱但高级。"
    }
  },
  {
    id: "tpl-08-founder-note",
    name: "主理人碎碎念配图",
    category: "atmosphere",
    purpose: "主理人内容",
    recommendedPlatform: "小红书",
    atmosphereParams: {
      imageType: "窗边阅读",
      usage: "主理人内容",
      shoeAllowance: "不出现鞋子",
      peopleAllowance: "只出现手部 / 背影 / 局部",
      extraDescription: "画面安静、有留白、有生活温度，适合配主理人文字，不要卖货感。"
    }
  },
  {
    id: "tpl-09-paper-detail",
    name: "包装纸品细节",
    category: "atmosphere",
    purpose: "品牌氛围 / 详情页辅助图",
    recommendedPlatform: "详情页辅助图",
    atmosphereParams: {
      imageType: "纸品品牌细节",
      usage: "详情页辅助图",
      shoeAllowance: "可出现样品 / 材料，但不做完整产品图",
      peopleAllowance: "不出现人物",
      extraDescription: "护理卡、品牌卡、包装纸、鞋盒局部、小Logo、纸张肌理，克制高级。"
    }
  },
  {
    id: "tpl-10-workday-single",
    name: "通勤上班单图",
    category: "product",
    purpose: "通勤舒适单图",
    recommendedPlatform: "image2.0 / GPT Image",
    productParams: {
      shoe: "自定义",
      material: "自定义",
      season: "Spring",
      colorDescription: "根据鞋款自动带入，强调通勤、舒适、干净、高级、走一天也不累。",
      generationMode: "single",
      scenes: ["01"],
      action: "慢走一步",
      ageRange: "30-45",
      people: "model",
      logo: "small"
    }
  },
  {
    id: "tpl-11-core-mature-daily",
    name: "30–45 核心成熟女性日常3图",
    category: "product",
    purpose: "成熟客户日常内容 / 小红书 / 详情页辅助",
    recommendedPlatform: "小红书 / 详情页辅助",
    productParams: {
      generationMode: "three",
      ageRange: "30-45",
      scenes: ["09", "11", "16"],
      action: "自动匹配",
      people: "model",
      logo: "small"
    }
  },
  {
    id: "tpl-12-mature-business",
    name: "30–45 质感女性轻商务3图",
    category: "product",
    purpose: "成熟女性通勤 / 商务休闲 / 高客单内容",
    recommendedPlatform: "image2.0 / GPT Image",
    productParams: {
      generationMode: "three",
      ageRange: "30-45",
      scenes: ["01", "13", "15"],
      action: "自动匹配",
      people: "model",
      logo: "small"
    }
  },
  {
    id: "tpl-13-family-mobility",
    name: "30–45 家庭移动日常3图",
    category: "product",
    purpose: "真实生活内容 / 小红书种草 / 主理人内容",
    recommendedPlatform: "小红书 / 主理人内容",
    productParams: {
      generationMode: "three",
      ageRange: "30-45",
      scenes: ["10", "12", "16"],
      action: "自动匹配",
      people: "model",
      logo: "none"
    }
  },
  {
    id: "tpl-14-full-mirror-ootd",
    name: "模板14：对镜穿搭不露脸（鞋子完整露出）",
    category: "product",
    purpose: "小红书OOTD / 穿搭记录 / 上脚展示 / 社交媒体配图",
    recommendedPlatform: "小红书 / 详情页辅助图",
    productParams: {
      generationMode: "single",
      ageRange: "30-45",
      scenes: ["04"],
      action: MIRROR_SELFIE_ACTIONS.full,
      people: "model",
      logo: "none",
      colorDescription:
        "重点展示整体穿搭关系、全身比例、裤脚和鞋子完整上脚效果，脸不作为重点，手机可自然遮脸。"
    }
  },
  {
    id: "tpl-15-hotel-full-mirror",
    name: "模板15：酒店镜前穿搭记录",
    category: "product",
    purpose: "旅行穿搭 / 生活方式内容 / 社交媒体配图",
    recommendedPlatform: "小红书 / 旅行穿搭内容",
    productParams: {
      generationMode: "single",
      ageRange: "30-45",
      scenes: ["08"],
      action: MIRROR_SELFIE_ACTIONS.full,
      people: "model",
      logo: "none",
      colorDescription:
        "强调移动中的体面、秩序感和轻松穿搭状态，鞋子必须完整露出。自动启用酒店镜拍去廉价感补丁，控制空间、光线、背景秩序和整体气质。"
    }
  },
  {
    id: "tpl-16-three-quarter-mirror",
    name: "模板16：3/4身对镜穿搭记录",
    category: "product",
    purpose: "小红书OOTD / 日常穿搭记录 / 上脚种草 / 社交媒体配图",
    recommendedPlatform: "小红书 / 社交媒体配图",
    productParams: {
      generationMode: "single",
      ageRange: "30-45",
      scenes: ["04"],
      action: MIRROR_SELFIE_ACTIONS.threeQuarter,
      people: "model",
      logo: "none",
      colorDescription:
        "更自然的对镜穿搭记录，不露脸，重点展示整体搭配、裤脚和鞋子上脚效果，鞋子必须清楚可见。"
    }
  },
  {
    id: "tpl-17-weekend-three-quarter-mirror",
    name: "模板17：周末出门前3/4镜拍",
    category: "product",
    purpose: "周末穿搭 / 小红书生活方式 / 轻熟日常内容",
    recommendedPlatform: "小红书 / 主理人日常",
    productParams: {
      generationMode: "single",
      ageRange: "30-45",
      scenes: ["16"],
      action: MIRROR_SELFIE_ACTIONS.threeQuarter,
      people: "model",
      logo: "none",
      colorDescription:
        "像一个真实女性出门前记录今日穿搭，画面自然，有审美，但不网红。"
    }
  },
  {
    id: "tpl-18-seated-mirror",
    name: "模板18：坐姿对镜穿搭记录",
    category: "product",
    purpose: "小红书OOTD / 日常穿搭记录 / 上脚种草",
    recommendedPlatform: "小红书 / 上脚种草",
    productParams: {
      generationMode: "single",
      ageRange: "30-45",
      scenes: ["04"],
      action: MIRROR_SELFIE_ACTIONS.seated,
      people: "model",
      logo: "none",
      colorDescription:
        "自然坐姿镜拍，重点看裤脚和鞋子关系，脸不作为重点。"
    }
  },
  {
    id: "tpl-19-hotel-seated-mirror",
    name: "模板19：酒店床边坐姿镜拍",
    category: "product",
    purpose: "旅行穿搭 / 酒店生活方式 / 小红书配图",
    recommendedPlatform: "小红书 / 旅行生活方式",
    productParams: {
      generationMode: "single",
      ageRange: "30-45",
      scenes: ["08"],
      action: MIRROR_SELFIE_ACTIONS.seated,
      people: "model",
      logo: "none",
      colorDescription:
        "像真实女性出门前在酒店整理穿搭并顺手记录。自动启用酒店镜拍去廉价感补丁，控制空间、光线、背景秩序和整体气质。"
    }
  },
  {
    id: "tpl-atmo-a-entryway",
    name: "氛围模板A：早晨出门氛围",
    category: "atmosphere",
    purpose: "品牌氛围 / 详情页辅助图",
    recommendedPlatform: "小红书 / 详情页辅助",
    atmosphereParams: {
      imageType: "玄关出门时刻",
      usage: "详情页辅助图",
      shoeAllowance: "可出现鞋子局部，但不能成为主角",
      peopleAllowance: "只出现手部 / 背影 / 局部",
      extraDescription: "强调出门前秩序感、轻松、体面、干净。"
    }
  },
  {
    id: "tpl-atmo-b-reading",
    name: "氛围模板B：安静生活片段",
    category: "atmosphere",
    purpose: "主理人内容 / 品牌氛围",
    recommendedPlatform: "小红书",
    atmosphereParams: {
      imageType: "窗边阅读",
      usage: "主理人内容",
      shoeAllowance: "不出现鞋子",
      peopleAllowance: "只出现手部 / 背影 / 局部",
      extraDescription: "强调松弛、留白、温感静奢、生活里安静的美感。"
    }
  },
  {
    id: "tpl-atmo-c-real-life",
    name: "氛围模板C：真实轻熟日常",
    category: "atmosphere",
    purpose: "小红书配图 / 主理人内容 / 品牌氛围",
    recommendedPlatform: "小红书",
    atmosphereParams: {
      imageType: "花和面包回家路上",
      usage: "小红书配图",
      shoeAllowance: "可出现鞋子局部，但不能成为主角",
      peopleAllowance: "只出现手部 / 背影 / 局部",
      extraDescription: "强调真实日常、轻熟审美、舒服但不随便。"
    }
  }
];
