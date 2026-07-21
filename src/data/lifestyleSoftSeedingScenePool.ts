import type {
  TeamGarmentTypePreference,
  TeamImageType,
  TeamScenePreference,
  TeamSeason
} from "../types";

export type LifestyleSoftSceneFamily =
  | "departure"
  | "commute"
  | "social"
  | "culture"
  | "community"
  | "travel";
export type LifestyleSoftHandheldPolicy = "none" | "phoneOnly";

export type LifestyleSoftSceneEntry = {
  id: string;
  name: string;
  purpose: string;
  description: string;
  imageType: TeamImageType;
  scenePreference: TeamScenePreference;
  garmentTypePreference: TeamGarmentTypePreference;
  extraRequirement: string;
  family: LifestyleSoftSceneFamily;
  supportedSeasons: TeamSeason[];
  handheldPolicy: LifestyleSoftHandheldPolicy;
  weight: number;
};

const ALL_SEASONS: TeamSeason[] = ["春", "夏", "秋", "冬"];

export const lifestyleSoftSeedingScenePool: LifestyleSoftSceneEntry[] = [
  {
    id: "lifestyle-entryway-mirror",
    name: "图｜出门前｜入户镜前",
    purpose: "用真实镜前记录建立完整穿搭和顾客代入。",
    description: "入户镜前自然确认穿搭，手机柔和遮脸，鞋子完整清楚。",
    imageType: "对镜穿搭图",
    scenePreference: "入户镜前",
    garmentTypePreference: "裤装",
    extraRequirement: "Create a real entryway mirror outfit record before leaving home. Use the phone only for the mirror record, keep the styling wearable, and keep both sneakers clearly readable.",
    family: "departure",
    supportedSeasons: ALL_SEASONS,
    handheldPolicy: "phoneOnly",
    weight: 5
  },
  {
    id: "lifestyle-entryway-departure",
    name: "图｜出门前｜玄关",
    purpose: "呈现普通一天开始前的真实穿着状态。",
    description: "玄关门边自然停留，空手整理袖口或外层，鞋子完整。",
    imageType: "生活场景图",
    scenePreference: "玄关出门",
    garmentTypePreference: "裤装",
    extraRequirement: "Use a believable home entryway departure moment with soft doorway light, relaxed empty hands, a small clothing adjustment, and complete readable sneakers.",
    family: "departure",
    supportedSeasons: ALL_SEASONS,
    handheldPolicy: "none",
    weight: 4
  },
  {
    id: "lifestyle-returning-home",
    name: "图｜日常结束｜回家进门",
    purpose: "补充穿了一天之后仍然自然体面的状态。",
    description: "回家进门的短暂停留，空手、松弛、脚下清楚。",
    imageType: "生活场景图",
    scenePreference: "回家进门",
    garmentTypePreference: "裤装",
    extraRequirement: "Show a calm return-home threshold moment after an ordinary day, with relaxed empty hands, natural clothing folds, grounded feet, and clearly visible sneakers.",
    family: "departure",
    supportedSeasons: ALL_SEASONS,
    handheldPolicy: "none",
    weight: 3
  },
  {
    id: "lifestyle-commute-general",
    name: "图｜工作日｜通勤路上",
    purpose: "证明鞋子能进入普通工作日。",
    description: "真实通勤路线上的短步行或停留，人物像朋友随手拍。",
    imageType: "生活场景图",
    scenePreference: "通勤上班",
    garmentTypePreference: "裤装",
    extraRequirement: "Show a real weekday commute with a short natural step or quiet pause, relaxed empty hands, believable city depth, and complete readable sneakers without campaign energy.",
    family: "commute",
    supportedSeasons: ALL_SEASONS,
    handheldPolicy: "none",
    weight: 5
  },
  {
    id: "lifestyle-business-corner",
    name: "图｜工作日｜商务区转角",
    purpose: "让通勤穿搭进入真实城市空间。",
    description: "商务区安静转角，小步幅或自然站立。",
    imageType: "生活场景图",
    scenePreference: "商务区转角",
    garmentTypePreference: "裤装",
    extraRequirement: "Use a quiet business-district corner with a small natural step, relaxed empty hands, realistic pavement, and a friend-taken daily-photo feeling rather than corporate advertising.",
    family: "commute",
    supportedSeasons: ALL_SEASONS,
    handheldPolicy: "none",
    weight: 4
  },
  {
    id: "lifestyle-office-entrance",
    name: "图｜工作日｜写字楼门口",
    purpose: "把产品放进成熟都市女性的工作日。",
    description: "写字楼门口自然走路或等人，低压力、鞋子清楚。",
    imageType: "生活场景图",
    scenePreference: "写字楼门口",
    garmentTypePreference: "裤装",
    extraRequirement: "Show a refined office-entrance moment with quiet daily rhythm, natural walking posture or a short waiting pause, relaxed empty hands, and clear sneakers without campaign posing.",
    family: "commute",
    supportedSeasons: ALL_SEASONS,
    handheldPolicy: "none",
    weight: 6
  },
  {
    id: "lifestyle-parking-to-office",
    name: "图｜工作日｜停车后步行",
    purpose: "呈现从停车到办公室的真实短距离移动。",
    description: "停车区到办公室的干净步行路线，动作简单。",
    imageType: "生活场景图",
    scenePreference: "停车后步行去办公室",
    garmentTypePreference: "裤装",
    extraRequirement: "Use a believable parking-to-office walking transition with a short safe step, relaxed empty hands, clean ground contact, and no car-showcase mood.",
    family: "commute",
    supportedSeasons: ALL_SEASONS,
    handheldPolicy: "none",
    weight: 3
  },
  {
    id: "lifestyle-metro-passage",
    name: "图｜工作日｜地铁商场通道",
    purpose: "补充真实城市通道中的移动感。",
    description: "地铁或商场连接通道，背景克制，脚步稳定。",
    imageType: "生活场景图",
    scenePreference: "地铁 / 商场通道",
    garmentTypePreference: "裤装",
    extraRequirement: "Use a clean but lived-in metro or mall passage with a compact walking step, relaxed empty hands, realistic indoor depth, and no shopping-mall campaign styling.",
    family: "commute",
    supportedSeasons: ALL_SEASONS,
    handheldPolicy: "none",
    weight: 3
  },
  {
    id: "lifestyle-parking-elevator",
    name: "图｜工作日｜停车场到电梯口",
    purpose: "增加室内通勤过渡的真实使用证明。",
    description: "停车场到电梯口的短暂停留或等待，地面接触清楚。",
    imageType: "生活场景图",
    scenePreference: "停车场到电梯口",
    garmentTypePreference: "裤装",
    extraRequirement: "Show a calm parking-area to elevator-lobby transition with believable indoor light, relaxed empty hands, stable posture, and clear shoe-floor contact.",
    family: "commute",
    supportedSeasons: ALL_SEASONS,
    handheldPolicy: "none",
    weight: 2
  },
  {
    id: "lifestyle-weekend-city-walk",
    name: "图｜周末｜城市散步",
    purpose: "呈现不刻意营业的周末穿着状态。",
    description: "安静城市步行路线，步子短，背景有真实生活痕迹。",
    imageType: "生活场景图",
    scenePreference: "周末城市散步",
    garmentTypePreference: "裤装",
    extraRequirement: "Use a quiet weekend city walk with a short natural stride, relaxed empty hands, real sidewalk texture, and a candid customer-photo feeling.",
    family: "culture",
    supportedSeasons: ALL_SEASONS,
    handheldPolicy: "none",
    weight: 5
  },
  {
    id: "lifestyle-takeaway-stop",
    name: "图｜日常｜楼下咖啡外带",
    purpose: "加入短暂、普通、容易代入的楼下停留。",
    description: "便利店或咖啡外带点附近，杯子放在台面，不拿在手中。",
    imageType: "生活场景图",
    scenePreference: "楼下便利店 / 咖啡外带",
    garmentTypePreference: "裤装",
    extraRequirement: "Use a believable downstairs convenience-store or coffee-pickup pause. Keep any cup placed on a nearby counter rather than held, keep hands relaxed, and keep the sneakers readable.",
    family: "social",
    supportedSeasons: ALL_SEASONS,
    handheldPolicy: "none",
    weight: 4
  },
  {
    id: "lifestyle-cafe-exterior",
    name: "图｜周末｜咖啡店门口",
    purpose: "增加小红书生活方式代入。",
    description: "咖啡店门口轻松停留，低饱和真实街景。",
    imageType: "生活场景图",
    scenePreference: "咖啡店门口",
    garmentTypePreference: "裤装",
    extraRequirement: "Use a restrained real cafe exterior with natural daylight and a candid customer-like pause. Place any cup on a table or ledge, keep hands relaxed, and keep the shoes readable.",
    family: "social",
    supportedSeasons: ALL_SEASONS,
    handheldPolicy: "none",
    weight: 6
  },
  {
    id: "lifestyle-cafe-interior",
    name: "图｜周末｜咖啡馆内",
    purpose: "补充坐下后仍然自然、鞋子仍然可读的状态。",
    description: "咖啡馆窗边或椅侧自然坐姿，杯子留在桌面。",
    imageType: "生活场景图",
    scenePreference: "咖啡馆内",
    garmentTypePreference: "裤装",
    extraRequirement: "Use a quiet cafe-interior seated or standing pause with any cup kept on the table, relaxed empty hands, natural posture, and at least one complete sneaker visible.",
    family: "social",
    supportedSeasons: ALL_SEASONS,
    handheldPolicy: "none",
    weight: 5
  },
  {
    id: "lifestyle-friend-lunch",
    name: "图｜周末｜朋友午餐",
    purpose: "呈现轻松社交场景里的真实穿着。",
    description: "白天朋友午餐，轻微转向同伴，手部自然。",
    imageType: "生活场景图",
    scenePreference: "朋友午餐",
    garmentTypePreference: "裤装",
    extraRequirement: "Show a relaxed daytime lunch moment with a subtle turn toward a friend, hands naturally empty or resting, sparse tableware, and unobstructed sneakers.",
    family: "social",
    supportedSeasons: ALL_SEASONS,
    handheldPolicy: "none",
    weight: 3
  },
  {
    id: "lifestyle-gallery",
    name: "图｜周末｜美术馆",
    purpose: "增加安静文化空间中的审美选择感。",
    description: "美术馆慢走或停留，不触碰作品，不拿道具。",
    imageType: "生活场景图",
    scenePreference: "美术馆",
    garmentTypePreference: "裤装",
    extraRequirement: "Use a restrained gallery walking or standing moment with natural attention toward the artwork or nearby space, relaxed empty hands, readable sneakers, and no event posing or touching artwork.",
    family: "culture",
    supportedSeasons: ALL_SEASONS,
    handheldPolicy: "none",
    weight: 4
  },
  {
    id: "lifestyle-bookstore",
    name: "图｜周末｜书店门口",
    purpose: "让内容更安静，有真实审美选择感。",
    description: "书店或杂志店门口轻松停留，书放在身边而非手中。",
    imageType: "生活场景图",
    scenePreference: "书店 / 杂志店门口",
    garmentTypePreference: "裤装",
    extraRequirement: "Use a quiet bookstore or magazine-shop exterior with a book or magazine placed nearby rather than held, relaxed hands, a calm side gaze, and naturally readable sneakers.",
    family: "culture",
    supportedSeasons: ALL_SEASONS,
    handheldPolicy: "none",
    weight: 5
  },
  {
    id: "lifestyle-flower-shop",
    name: "图｜周末｜花店",
    purpose: "加入真实周末采购和柔和城市色彩。",
    description: "花店门口安静停留，花束作为店面背景，不手持。",
    imageType: "生活场景图",
    scenePreference: "花店 / 买花",
    garmentTypePreference: "裤装",
    extraRequirement: "Use a real understated flower-shop exterior with flowers remaining as restrained storefront or nearby background detail, relaxed empty hands, mature styling, and clear sneakers.",
    family: "culture",
    supportedSeasons: ["春", "夏", "秋"],
    handheldPolicy: "none",
    weight: 4
  },
  {
    id: "lifestyle-city-corner",
    name: "图｜周末｜安静街角",
    purpose: "补充非硬广的普通城市停留。",
    description: "安静街区自然站立或短步行，真实路面和树影。",
    imageType: "生活场景图",
    scenePreference: "城市街角 / 安静街区",
    garmentTypePreference: "裤装",
    extraRequirement: "Use a quiet real city corner with a natural standing pause or short walk, relaxed empty hands, real pavement and soft street depth, without campaign styling.",
    family: "culture",
    supportedSeasons: ALL_SEASONS,
    handheldPolicy: "none",
    weight: 6
  },
  {
    id: "lifestyle-premium-grocery",
    name: "图｜社区｜精品超市",
    purpose: "证明鞋子能进入普通采购和社区日常。",
    description: "超市入口或社区商店边缘，购物物品放在旁边。",
    imageType: "生活场景图",
    scenePreference: "精品超市 / 日常采购",
    garmentTypePreference: "裤装",
    extraRequirement: "Use a believable premium grocery or neighborhood-shop entrance. Place any paper bag beside the body or in the background rather than in hand, keep hands relaxed, and keep the sneakers unobstructed.",
    family: "community",
    supportedSeasons: ALL_SEASONS,
    handheldPolicy: "none",
    weight: 4
  },
  {
    id: "lifestyle-community-market",
    name: "图｜社区｜市集买菜",
    purpose: "增加成熟顾客真实生活节奏。",
    description: "社区市集或小型生鲜店入口，物品克制放置。",
    imageType: "生活场景图",
    scenePreference: "社区市集 / 精品买菜",
    garmentTypePreference: "裤装",
    extraRequirement: "Use a clean community market or small produce-shop edge with restrained produce cues placed nearby, relaxed empty hands, believable pavement, and clear sneakers.",
    family: "community",
    supportedSeasons: ["春", "夏", "秋"],
    handheldPolicy: "none",
    weight: 3
  },
  {
    id: "lifestyle-light-shopping",
    name: "图｜社区｜周末轻采购",
    purpose: "加入不夸张的周末小型采购路线。",
    description: "社区商业入口或店外短暂停留，购物袋不手持。",
    imageType: "生活场景图",
    scenePreference: "周末轻采购",
    garmentTypePreference: "裤装",
    extraRequirement: "Show a light weekend purchase near a quiet neighborhood shop. Keep any shopping bag placed nearby rather than held, use relaxed empty hands, and preserve clear shoe visibility.",
    family: "community",
    supportedSeasons: ALL_SEASONS,
    handheldPolicy: "none",
    weight: 4
  },
  {
    id: "lifestyle-park-walk",
    name: "图｜社区｜公园慢走",
    purpose: "呈现普通步行中的舒适和真实比例。",
    description: "城市公园干净步道，小步幅慢走，不做户外广告。",
    imageType: "生活场景图",
    scenePreference: "公园慢走",
    garmentTypePreference: "裤装",
    extraRequirement: "Use a clean urban-park path with a short natural walking step, relaxed empty hands, restrained greenery, and no hiking or sports-advertising mood.",
    family: "community",
    supportedSeasons: ["春", "夏", "秋"],
    handheldPolicy: "none",
    weight: 5
  },
  {
    id: "lifestyle-community-path",
    name: "图｜社区｜步道",
    purpose: "补充低压力、可反复穿着的社区路线。",
    description: "社区步道短走或停留，背景有轻微生活痕迹。",
    imageType: "生活场景图",
    scenePreference: "社区步道",
    garmentTypePreference: "裤装",
    extraRequirement: "Use a real neighborhood walking path with a compact step or soft standing pause, relaxed empty hands, subtle greenery, and believable daily-life texture.",
    family: "community",
    supportedSeasons: ["春", "夏", "秋"],
    handheldPolicy: "none",
    weight: 5
  },
  {
    id: "lifestyle-travel-hotel",
    name: "图｜轻旅行｜酒店日常",
    purpose: "呈现短途旅行中一双鞋的省心程度。",
    description: "安静酒店空间准备出门，行李只做背景。",
    imageType: "生活场景图",
    scenePreference: "旅行酒店",
    garmentTypePreference: "裤装",
    extraRequirement: "Use a calm hotel travel moment before leaving, with luggage kept as a small background cue, relaxed empty hands, warm neutral light, and clearly readable sneakers.",
    family: "travel",
    supportedSeasons: ALL_SEASONS,
    handheldPolicy: "none",
    weight: 4
  },
  {
    id: "lifestyle-hotel-cafe-interior",
    name: "图｜轻旅行｜酒店咖啡厅",
    purpose: "补充旅行中真实、克制的日间休息与短距离移动。",
    description: "酒店大堂相邻的安静咖啡厅内，走向座位、桌边停留或起身离开，鞋子保持清楚。",
    imageType: "生活场景图",
    scenePreference: "酒店咖啡厅内",
    garmentTypePreference: "裤装",
    extraRequirement: "Use a quiet hotel cafe beside the lobby in daytime, with a natural walk toward a seat, brief table-side pause, or rising-to-leave moment. Keep tables, chairs, table linens, background guests, and one sparsely placed coffee cup clear of the sneakers. Avoid street-cafe substitution, buffet or banquet settings, afternoon-tea advertising, crowded food displays, and luxury-hotel promotional styling.",
    family: "travel",
    supportedSeasons: ALL_SEASONS,
    handheldPolicy: "none",
    weight: 3
  },
  {
    id: "lifestyle-hotel-room-mirror",
    name: "图｜轻旅行｜酒店房间镜前",
    purpose: "通过旅行镜前图判断鞋子能否减少行李负担。",
    description: "酒店房间镜前记录，行李角落克制，手机遮脸。",
    imageType: "对镜穿搭图",
    scenePreference: "酒店房间",
    garmentTypePreference: "裤装",
    extraRequirement: "Use a calm hotel-room mirror outfit record with a tidy suitcase corner and warm neutral light. Use the phone as the only handheld object and keep both sneakers readable.",
    family: "travel",
    supportedSeasons: ALL_SEASONS,
    handheldPolicy: "phoneOnly",
    weight: 5
  },
  {
    id: "lifestyle-hotel-entrance",
    name: "图｜轻旅行｜酒店门厅",
    purpose: "让旅行场景保持真实出门感而非打卡感。",
    description: "酒店门口或门厅自然停留，行李不进入手中。",
    imageType: "生活场景图",
    scenePreference: "酒店门口 / 门厅",
    garmentTypePreference: "裤装",
    extraRequirement: "Use a restrained hotel entrance or lobby-threshold pause with any luggage kept nearby rather than held, relaxed empty hands, and no influencer check-in mood.",
    family: "travel",
    supportedSeasons: ALL_SEASONS,
    handheldPolicy: "none",
    weight: 3
  },
  {
    id: "lifestyle-weekend-trip-start",
    name: "图｜轻旅行｜周末出发",
    purpose: "呈现短途出发时鞋子和日常衣物的关系。",
    description: "住宅或酒店门口出发前停留，旅行包只作背景。",
    imageType: "生活场景图",
    scenePreference: "周末轻旅行出发",
    garmentTypePreference: "裤装",
    extraRequirement: "Use a quiet weekend-trip departure near a building or hotel threshold, with any travel bag placed nearby rather than held, relaxed empty hands, and clear sneakers.",
    family: "travel",
    supportedSeasons: ALL_SEASONS,
    handheldPolicy: "none",
    weight: 4
  }
];
