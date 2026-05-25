import type { SceneBlock } from "../types";

export const BASIC_SCENE_BLOCKS: SceneBlock[] = [
  {
    id: "01",
    label: "通勤上班 Workday commute",
    shortLabel: "通勤上班",
    englishLabel: "Workday commute",
    category: "basic",
    prompt: `Create a refined workday commute scene for THERUIZ AURA sneakers. Show the woman wearing the sneakers on her way to work, in a calm urban setting such as an office entrance, elevator lobby, quiet business district, clean parking-to-office walkway, or outside a modern office building. The body movement may include walking slowly toward an office entrance, holding a structured tote bag, adjusting trouser cuffs, waiting near an elevator lobby, or holding a coffee cup while entering the building. Expression suggestion: calm, focused, relaxed, slightly thoughtful, not smiling at the camera, natural professional ease. The image should feel professional but relaxed, polished but not stiff.`
  },
  {
    id: "02",
    label: "接娃亲子 Refined mom daily life",
    shortLabel: "接娃亲子",
    englishLabel: "Refined mom daily life",
    category: "basic",
    prompt: `Create a quiet, refined daily scene for a modern mother wearing THERUIZ AURA sneakers. The setting may be near a kindergarten entrance, a park path, a bookstore, a family-friendly café, or beside a car before picking up a child. Keep the child's presence subtle and tasteful, such as a small backpack, a child's hand, a soft blurred figure, a scooter, a water bottle, or a minimal family-life cue. The body movement may include gently holding a child's hand, softly bending down to pick up a small backpack, standing calmly beside a car, or walking slowly on a park path. Expression suggestion: warm, gentle, lightly smiling, attentive to the child or environment, natural and emotionally present.`
  },
  {
    id: "03",
    label: "周末咖啡 Weekend café and city walk",
    shortLabel: "周末咖啡",
    englishLabel: "Weekend café and city walk",
    category: "basic",
    prompt: `Create a relaxed weekend city-life scene featuring THERUIZ AURA sneakers. Show the woman near a quiet café, light stone wall, boutique storefront, clean city sidewalk, or outdoor café seat. The body movement may include holding coffee while walking slowly, sitting at an outdoor café chair, gently placing a tote bag beside the chair, standing near a pale wall, or walking out of a bakery with a small paper bag. Expression suggestion: soft, relaxed, subtly smiling, naturally enjoying the moment, not influencer-like.`
  },
  {
    id: "04",
    label: "居家衣帽间 Morning wardrobe moment",
    shortLabel: "居家衣帽间",
    englishLabel: "Morning wardrobe moment",
    category: "basic",
    prompt: `Create a calm morning wardrobe scene with THERUIZ AURA sneakers. Show the woman in a bedroom, wardrobe corner, sofa edge, mirror area, or beside a bed as she gets ready for the day. The body movement may include sitting on the edge of a bed while putting on the sneakers, slipping one foot into the shoe, tying shoelaces, adjusting trouser cuffs, reaching for a white shirt, checking the outfit in a mirror, or picking up a tote bag. Expression suggestion: quiet, intimate, softly focused, natural and relaxed, like a private moment before leaving home.`
  },
  {
    id: "05",
    label: "穿搭关系 Wardrobe styling relationship",
    shortLabel: "穿搭关系",
    englishLabel: "Wardrobe styling relationship",
    category: "basic",
    prompt: `Create an elevated wardrobe-styling scene where the sneakers are part of a tasteful outfit system rather than an isolated product. Include white shirt, light blue denim, cream knit, beige tote, linen trousers, soft neutral clothing, or a light trench coat. The body movement may include a woman's hand gently placing a white shirt beside the sneakers, arranging light denim and cream knitwear, touching the shoe surface, holding a hanger, or laying out the tote bag beside the outfit. Expression suggestion: thoughtful, calm, lightly focused, as if curating an outfit naturally.`
  },
  {
    id: "06",
    label: "上脚生活 On-foot lifestyle scene",
    shortLabel: "上脚生活",
    englishLabel: "On-foot lifestyle scene",
    category: "basic",
    prompt: `Create a natural on-foot lifestyle image showing the sneakers worn in a relaxed, elegant daily moment. Focus on the lower body, feet, ankles, trouser cuff, or seated posture rather than a full fashion portrait. The body movement may include sitting on a sofa edge while adjusting trouser cuffs, softly tying shoelaces, standing naturally with one foot slightly forward, walking gently with a small natural step, or rising from a sofa. Expression suggestion: relaxed, soft, natural, slightly focused on the shoes or movement, never stiff or blank.`
  },
  {
    id: "07",
    label: "材质叙事 Material storytelling still life",
    shortLabel: "材质叙事",
    englishLabel: "Material storytelling still life",
    category: "basic",
    prompt: `Create a tactile, editorial still-life scene that highlights the material story of the sneakers. Include suede swatches, leather samples, mesh fabric samples, shoelaces, care brush, neutral dust bag, product card, small color card, or subtle development objects. The body movement may include a hand gently touching the suede surface, arranging leather samples, holding a color card, holding a care brush, lightly opening the shoe tongue, or adjusting the shoelaces. Expression suggestion: if the face appears, keep it subtle, calm, and naturally focused on the materials.`
  },
  {
    id: "08",
    label: "旅行酒店 Travel and hotel packing",
    shortLabel: "旅行酒店",
    englishLabel: "Travel and hotel packing",
    category: "basic",
    prompt: `Create a refined travel lifestyle scene for THERUIZ AURA sneakers. Place the sneakers in a calm hotel room, beside an open suitcase, near a travel tote, on a soft bed with folded clothing, or by a hotel room window. The body movement may include opening a suitcase, placing the sneakers beside folded clothes, sitting on the hotel bed while putting on the shoes, picking up a travel tote, or standing near the window before leaving. Expression suggestion: soft, relaxed, lightly content, natural and unforced, like a calm travel moment.`
  }
];

export const MIRROR_SELFIE_ACTIONS = {
  full: "对镜手机自拍（不露脸，鞋子完整露出）",
  threeQuarter: "3/4身对镜自拍（不露脸，鞋子清楚露出）",
  seated: "坐姿对镜自拍（不露脸，鞋子重点清晰）"
} as const;

export const MIRROR_SELFIE_ACTION_ENGLISH: Record<string, string> = {
  [MIRROR_SELFIE_ACTIONS.full]:
    "Mirror selfie outfit shot (face hidden, full shoes visible)",
  [MIRROR_SELFIE_ACTIONS.threeQuarter]:
    "Three-quarter mirror selfie outfit shot (face hidden, shoes clearly visible)",
  [MIRROR_SELFIE_ACTIONS.seated]:
    "Seated mirror selfie outfit shot (face hidden, shoes clearly emphasized)"
};

export const ACTION_OPTIONS = [
  "自动匹配",
  "整理裤脚",
  "系鞋带",
  "半穿鞋",
  MIRROR_SELFIE_ACTIONS.full,
  MIRROR_SELFIE_ACTIONS.threeQuarter,
  MIRROR_SELFIE_ACTIONS.seated,
  "拿包准备出门",
  "推门出门",
  "坐在沙发边",
  "靠墙自然站立",
  "慢走一步",
  "下车动作",
  "从后座拿包",
  "牵小朋友手",
  "弯腰拿儿童书包",
  "拿咖啡慢走",
  "坐在咖啡店外",
  "翻书 / 看书",
  "整理衣架 / 拿衣服",
  "镜前检查穿搭",
  "打开行李箱",
  "坐在床边穿鞋",
  "拎纸袋 / 花束 / 面包袋"
];

export const AUTO_ACTION_BY_SCENE: Record<string, string[]> = {
  "01": ["慢走一步", "拿包准备出门", "整理裤脚"],
  "02": ["牵小朋友手", "弯腰拿儿童书包"],
  "03": ["拿咖啡慢走", "坐在咖啡店外"],
  "04": ["坐在床边穿鞋", "系鞋带", "镜前检查穿搭"],
  "05": ["整理衣架 / 拿衣服", "触摸鞋面"],
  "06": ["整理裤脚", "慢走一步", "坐在沙发边"],
  "07": ["手触摸材质", "整理皮料", "拿色卡"],
  "08": ["打开行李箱", "坐在床边穿鞋"]
};

export const DEFAULT_THREE_SCENES = ["01", "05", "06"];

export const THREE_SCENE_PRIORITY_BY_AGE: Record<string, string[]> = {
  "30-45": ["09", "11", "16", "01", "06"],
  "40-55": ["13", "15", "16", "11", "01"]
};

export const QUICK_THREE_SCENE_SETS = [
  {
    name: "成熟日常推荐三图",
    scenes: ["09", "11", "16"]
  },
  {
    name: "轻商务成熟女性三图",
    scenes: ["01", "13", "15"]
  },
  {
    name: "家庭移动日常三图",
    scenes: ["10", "12", "16"]
  }
];
