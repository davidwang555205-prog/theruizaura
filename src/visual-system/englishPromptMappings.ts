export type EnglishPromptField = "topic" | "scene" | "imageType";

const mappings: Record<EnglishPromptField, Record<string, string>> = {
  topic: {
    "生活场景软种草": "lifestyle soft seeding", "产品开发幕后": "product development behind the scenes", "秋冬配色实验室": "autumn and winter color lab", "穿搭解决方案": "styling solution", "材质工艺认知": "material and craft education", "品牌审美观点": "brand aesthetic viewpoint", "上新活动转化": "launch conversion", "棚内上新拍摄": "studio launch shoot"
  },
  imageType: {
    "生活场景图": "lifestyle scene", "产品上脚图": "on-foot product image", "产品静物图": "product still life", "对镜穿搭图": "mirror styling image", "拍摄花絮 / 材质图": "behind-the-scenes material image", "非产品氛围图": "non-product atmosphere image"
  },
  scene: {
    "入户镜前": "entryway mirror",
    "玄关出门": "entryway departure",
    "通勤上班": "weekday commute to work",
    "写字楼门口": "office building entrance",
    "地铁 / 商场通道": "metro or mall passage",
    "咖啡店门口": "cafe entrance",
    "咖啡馆内": "inside a cafe",
    "酒店咖啡厅内": "hotel cafe interior",
    "朋友午餐": "lunch with a friend",
    "书店 / 杂志店门口": "bookstore or magazine shop entrance",
    "花店 / 买花": "flower shop visit",
    "城市街角 / 安静街区": "quiet city corner or neighborhood",
    "酒店房间": "hotel room",
    "旅行酒店": "travel hotel",
    "酒店门口 / 门厅": "hotel entrance or lobby",
    "材质工作台": "material workbench",
    "拍摄花絮": "behind-the-scenes shoot",
    "棚内上新拍摄": "studio launch shoot",
    "工作台 / 桌边整理": "workbench or desk organization",
    "轻整理工作台": "light workbench organization",
    "衣帽间 / 更衣角": "wardrobe or dressing corner",
    "居家衣帽间": "home wardrobe",
    "美术馆": "art museum",
    "窗边阅读": "window-side reading",
    "窗边阅读角": "window-side reading corner",
    "楼下便利店 / 咖啡外带": "downstairs convenience store or takeaway coffee spot",
    "瑜伽 / 普拉提工作室门口": "yoga or pilates studio entrance",
    "停车后步行去办公室": "walk from parking to the office",
    "停车场到电梯口": "parking area to elevator lobby",
    "公园慢走": "slow walk in a park",
    "周末城市散步": "weekend city walk",
    "周末轻旅行出发": "weekend trip departure",
    "周末轻采购": "light weekend shopping",
    "商务区转角": "business-district corner",
    "回家进门": "returning home through the entryway",
    "社区市集 / 精品买菜": "community market or premium grocery visit",
    "社区步道": "community walking path",
    "精品超市 / 日常采购": "premium grocery or daily shopping",
    "雨天街角": "quiet street corner after light rain",
    "暑假游乐园": "summer amusement park walkway",
    "海边度假": "quiet inhabited seaside promenade",
    "草原野餐": "restrained near-city grass picnic",
    "亲子自驾出行": "short local family drive arrival",
    "暑假外出后回家": "returning home after an ordinary summer outing",
    "去运动的路上": "on the way to a light exercise session",
    "健身房内": "gym entrance or transition zone",
    "产品静物图": "product still life"
  }
};

export function mapEnglishPromptField(field: EnglishPromptField, value: string): string {
  const mapped = mappings[field][value];
  if (!mapped) throw new Error(`ENGLISH_PROMPT_MAPPING_MISSING:${field}:${value}`);
  return mapped;
}

export function assertEnglishPrompt(value: string): string {
  if (/[㐀-䶿一-鿿豈-﫿]/.test(value)) throw new Error("ENGLISH_PROMPT_MAPPING_MISSING:prompt_contains_unmapped_chinese");
  return value;
}
