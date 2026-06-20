import type { ActionSafetyLevel, SceneBlock } from "../types";

export const BASIC_SCENE_BLOCKS: SceneBlock[] = [
  {
    id: "01",
    label: "通勤上班 Workday commute",
    shortLabel: "通勤上班",
    englishLabel: "Workday commute",
    category: "basic",
    compactPrompt: "A refined commute scene near an office entrance, elevator lobby, clean parking-to-office walkway, or calm business district. She moves naturally with a tote or coffee, polished but relaxed. The sneakers should feel comfortable, clean, and appropriate for a full day.",
    prompt: `Create a refined workday commute scene for THERUIZ AURA sneakers. Show the woman wearing the sneakers on her way to work, in a calm urban setting such as an office entrance, elevator lobby, quiet business district, clean parking-to-office walkway, or outside a modern office building. The body movement may include walking slowly toward an office entrance, holding a structured tote bag, adjusting trouser cuffs, waiting near an elevator lobby, or holding a coffee cup while entering the building. Expression suggestion: calm, focused, relaxed, slightly thoughtful, not smiling at the camera, natural professional ease. The image should feel professional but relaxed, polished but not stiff.`
  },
  {
    id: "02",
    label: "接娃亲子 Refined mom daily life",
    shortLabel: "接娃亲子",
    englishLabel: "Refined mom daily life",
    category: "basic",
    compactPrompt: "A quiet refined modern-mother daily scene near a kindergarten entrance, park path, bookstore, family cafe, or car-side pickup moment. Keep child cues subtle and tasteful. The sneakers should feel practical, warm, polished, and naturally useful for family movement.",
    prompt: `Create a quiet, refined daily scene for a modern mother wearing THERUIZ AURA sneakers. The setting may be near a kindergarten entrance, a park path, a bookstore, a family-friendly café, or beside a car before picking up a child. Keep the child's presence subtle and tasteful, such as a small backpack, a child's hand, a soft blurred figure, a scooter, or a minimal family-life cue. The body movement may include gently holding a child's hand, softly bending down to pick up a small backpack, standing calmly beside a car, or walking slowly on a park path. Expression suggestion: warm, gentle, lightly smiling, attentive to the child or environment, natural and emotionally present.`
  },
  {
    id: "03",
    label: "周末咖啡 Weekend café and city walk",
    shortLabel: "周末咖啡",
    englishLabel: "Weekend café and city walk",
    category: "basic",
    compactPrompt: "A relaxed weekend city-life scene near a quiet cafe, light stone wall, boutique storefront, clean sidewalk, or bakery. She moves gently with coffee or sits calmly outdoors. Keep the mood soft, tasteful, warm, and not influencer-like.",
    prompt: `Create a relaxed weekend city-life scene featuring THERUIZ AURA sneakers. Show the woman near a quiet café, light stone wall, boutique storefront, clean city sidewalk, or outdoor café seat. The body movement may include holding coffee while walking slowly, sitting at an outdoor café chair, gently placing a tote bag beside the chair, standing near a pale wall, or walking out of a bakery with a small paper bag. Expression suggestion: soft, relaxed, subtly smiling, naturally enjoying the moment, not influencer-like.`
  },
  {
    id: "04",
    label: "居家衣帽间 Morning wardrobe moment",
    shortLabel: "居家衣帽间",
    englishLabel: "Morning wardrobe moment",
    category: "basic",
    compactPrompt: "A quiet wardrobe or home morning moment before leaving. Use a bedroom, wardrobe corner, sofa edge, mirror area, or bed-side setting. Focus on outfit relationship, trouser hem, and sneakers on foot, with calm natural light and private daily ease.",
    prompt: `Create a calm morning wardrobe scene with THERUIZ AURA sneakers. Show the woman in a getting-ready room, wardrobe corner, sofa edge, mirror area, or beside a bed as she gets ready for the day. The movement may include sitting on the edge of a bed while putting on the sneakers, slipping one foot into the shoe, tying shoelaces, adjusting trouser cuffs, reaching for a white shirt, checking the outfit in a mirror, or picking up a tote bag. Expression suggestion: quiet, personally focused, natural and relaxed, like a calm moment before leaving home.`
  },
  {
    id: "05",
    label: "穿搭关系 Wardrobe styling relationship",
    shortLabel: "穿搭关系",
    englishLabel: "Wardrobe styling relationship",
    category: "basic",
    compactPrompt: "A refined wardrobe-styling scene where the sneakers belong to a complete outfit system. Include white shirt, light denim, cream knitwear, beige tote, linen trousers, soft neutrals, or a light trench. Keep it calm, curated, tactile, and not a product-only catalog shot.",
    prompt: `Create an elevated wardrobe-styling scene where the sneakers are part of a tasteful outfit system rather than an isolated product. Include white shirt, light blue denim, cream knit, beige tote, linen trousers, soft neutral clothing, or a light trench coat. The body movement may include a woman's hand gently placing a white shirt beside the sneakers, arranging light denim and cream knitwear, touching the shoe surface, holding a hanger, or laying out the tote bag beside the outfit. Expression suggestion: thoughtful, calm, lightly focused, as if curating an outfit naturally.`
  },
  {
    id: "06",
    label: "上脚生活 On-foot lifestyle scene",
    shortLabel: "上脚生活",
    englishLabel: "On-foot lifestyle scene",
    category: "basic",
    compactPrompt: "A natural on-foot lifestyle image focused on leg-and-sneaker relationship, ankles, trouser cuff, seated posture, or a small standing/walking moment. The sneakers should be clearly visible but not exaggerated. Keep the image elegant, daily, relaxed, and believable.",
    prompt: `Create a natural on-foot lifestyle image showing the sneakers worn in a relaxed, elegant daily moment. Focus on the leg-and-sneaker relationship, feet, ankles, trouser cuff, or seated posture rather than a full fashion portrait. The body movement may include sitting on a sofa edge while adjusting trouser cuffs, softly tying shoelaces, standing naturally with one foot slightly forward, walking gently with a small natural step, or rising from a sofa. Expression suggestion: relaxed, soft, natural, slightly focused on the shoes or movement, never stiff or blank.`
  },
  {
    id: "07",
    label: "材质叙事 Material storytelling still life",
    shortLabel: "材质叙事",
    englishLabel: "Material storytelling still life",
    category: "basic",
    compactPrompt: "A tactile material still life around the sneakers, using suede swatches, leather samples, mesh, shoelaces, care brush, dust bag, product card, or color cards. Keep the material feeling real, warm, quiet, and editorial, without turning it into a generic product table.",
    prompt: `Create a tactile, editorial still-life scene that highlights the material story of the sneakers. Include suede swatches, leather samples, mesh fabric samples, shoelaces, care brush, neutral dust bag, product card, small color card, or subtle development objects. The body movement may include a hand gently touching the suede surface, arranging leather samples, holding a color card, holding a care brush, lightly lifting the shoe tongue, or adjusting the shoelaces. Expression suggestion: if the face appears, keep it subtle, calm, and naturally focused on the materials.`
  },
  {
    id: "08",
    label: "旅行酒店 Travel and hotel packing",
    shortLabel: "旅行酒店",
    englishLabel: "Travel and hotel packing",
    category: "basic",
    compactPrompt: "A refined travel or hotel packing scene in a calm warm-neutral room, near a suitcase, travel tote, bed edge, folded clothing, or soft window light. The sneakers should communicate all-day comfort and composed mobility without tourist energy or staged luggage advertising.",
    prompt: `Create a refined travel lifestyle scene for THERUIZ AURA sneakers. Place the sneakers in a calm hotel room, beside an open suitcase, near a travel tote, on a soft bed with folded clothing, or by a hotel room window. The body movement may include unpacking a suitcase, placing the sneakers beside folded clothes, sitting on the hotel bed while putting on the shoes, picking up a travel tote, or standing near the window before leaving. Expression suggestion: soft, relaxed, lightly content, natural and unforced, like a calm travel moment.`
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
  "静态站立，一脚微微向前",
  "整理裤脚",
  "系鞋带",
  "半穿鞋",
  MIRROR_SELFIE_ACTIONS.full,
  MIRROR_SELFIE_ACTIONS.threeQuarter,
  MIRROR_SELFIE_ACTIONS.seated,
  "拿包准备出门",
  "玄关站立准备出门",
  "推门出门",
  "坐在沙发边",
  "坐在床边，双脚自然落地",
  "靠墙自然站立",
  "慢走一步",
  "下车动作",
  "从后座拿包",
  "牵小朋友手",
  "弯腰拿儿童书包",
  "蹲下拿儿童书包",
  "拿咖啡慢走",
  "坐在咖啡店外",
  "翻书 / 看书",
  "整理衣架 / 拿衣服",
  "镜前检查穿搭",
  "打开行李箱",
  "站在电梯口等待",
  "轻微转身",
  "坐在床边穿鞋",
  "大幅弯腰",
  "扶墙穿鞋",
  "大步走路",
  "跑动",
  "交叉腿坐姿",
  "复杂坐姿",
  "脚尖踮起",
  "鞋子被手直接拉扯",
  "脚正在穿入鞋口的瞬间",
  "拎纸袋 / 花束 / 面包袋"
];

export const AUTO_ACTION_BY_SCENE: Record<string, string[]> = {
  "01": ["慢走一步", "靠墙自然站立", "拿包准备出门", "整理裤脚"],
  "02": ["牵小朋友手", "弯腰拿儿童书包"],
  "03": ["拿咖啡慢走", "坐在咖啡店外"],
  "04": ["静态站立，一脚微微向前", "坐在床边，双脚自然落地", "镜前检查穿搭"],
  "05": ["静态站立，一脚微微向前", "整理衣架 / 拿衣服", "触摸鞋面"],
  "06": ["静态站立，一脚微微向前", "慢走一步", "坐在沙发边", "整理裤脚"],
  "07": ["手触摸材质", "整理皮料", "拿色卡"],
  "08": ["坐在床边，双脚自然落地", "打开行李箱"]
};

export const ACTION_SAFETY_LEVEL_LABELS: Record<ActionSafetyLevel, string> = {
  A: "A级安全动作 / preferred low-risk on-foot pose",
  B: "B级谨慎动作 / usable with stronger protection",
  C: "C级高风险动作 / not recommended unless intentionally selected"
};

export const ACTION_SAFETY_LEVELS: Record<string, ActionSafetyLevel> = {
  "自动匹配": "A",
  "静态站立，一脚微微向前": "A",
  "靠墙自然站立": "A",
  "慢走一步": "A",
  "坐在沙发边": "A",
  "坐在床边，双脚自然落地": "A",
  [MIRROR_SELFIE_ACTIONS.full]: "A",
  [MIRROR_SELFIE_ACTIONS.threeQuarter]: "A",
  "玄关站立准备出门": "A",
  "拿咖啡慢走": "A",
  "坐在咖啡店外": "A",
  "翻书 / 看书": "A",
  "整理衣架 / 拿衣服": "A",
  "镜前检查穿搭": "A",
  "触摸鞋面": "A",
  "手触摸材质": "A",
  "整理皮料": "A",
  "拿色卡": "A",
  "拎纸袋 / 花束 / 面包袋": "A",
  "整理裤脚": "B",
  "拿包准备出门": "B",
  "推门出门": "B",
  "下车动作": "B",
  "从后座拿包": "B",
  "牵小朋友手": "B",
  [MIRROR_SELFIE_ACTIONS.seated]: "B",
  "打开行李箱": "B",
  "站在电梯口等待": "B",
  "轻微转身": "B",
  "系鞋带": "C",
  "半穿鞋": "C",
  "坐在床边穿鞋": "C",
  "弯腰拿儿童书包": "C",
  "蹲下拿儿童书包": "C",
  "大幅弯腰": "C",
  "扶墙穿鞋": "C",
  "大步走路": "C",
  "跑动": "C",
  "交叉腿坐姿": "C",
  "复杂坐姿": "C",
  "脚尖踮起": "C",
  "鞋子被手直接拉扯": "C",
  "脚正在穿入鞋口的瞬间": "C"
};

export const ACTION_REPLACEMENT_SUGGESTIONS: Record<string, string> = {
  "系鞋带": "坐在床边，手靠近鞋带但不真正拉扯",
  "半穿鞋": "坐在床边，鞋已穿好，手整理裤脚",
  "坐在床边穿鞋": "坐在床边，双脚自然落地，手整理裤脚",
  "弯腰拿儿童书包": "站立拿起小书包，鞋保持稳定",
  "蹲下拿儿童书包": "站立拿起小书包，鞋保持稳定",
  "下车动作": "站在车边，一脚自然向前",
  "大步走路": "慢走一步，小步幅",
  "交叉腿坐姿": "双脚自然落地，轻微前后错位",
  "复杂坐姿": "双脚自然落地，轻微前后错位",
  "脚正在穿入鞋口的瞬间": "鞋已穿好，手整理裤脚",
  "鞋子被手直接拉扯": "手靠近鞋面但不拉扯鞋子结构"
};

export const ACTION_COMPACT_PROMPTS: Record<string, string> = {
  "自动匹配": "Use the safest natural action for the selected scene, prioritizing stable shoe shape, calm body movement, and clear footwear readability.",
  "静态站立，一脚微微向前": "She stands naturally with one foot slightly forward, keeping both shoes stable, readable, and in correct proportion.",
  "整理裤脚": "She lightly adjusts the trouser cuff near the ankle, keeping the shoe fully readable and structurally clean.",
  "系鞋带": "She gently touches or adjusts the laces, but the hands and laces must remain clean, realistic, and free of clipping.",
  "半穿鞋": "Show a simplified half-wearing idea only if needed, with the foot aligned naturally and the shoe structure preserved without clipping.",
  [MIRROR_SELFIE_ACTIONS.full]: "A face-hidden full-body mirror outfit record with both sneakers completely visible, calm posture, and no influencer selfie energy.",
  [MIRROR_SELFIE_ACTIONS.threeQuarter]: "A face-hidden 3/4 mirror outfit record with the outfit and sneakers clearly visible, at least one shoe fully shown, and the second readable.",
  [MIRROR_SELFIE_ACTIONS.seated]: "A face-hidden seated mirror outfit record that emphasizes trouser hem, ankle area, sneaker collar, shoe shape, and on-foot relationship.",
  "拿包准备出门": "She naturally holds or picks up a tote before leaving, with stable feet and clearly visible sneakers.",
  "玄关站立准备出门": "She stands calmly in an entryway before leaving, with stable foot placement and the sneakers clearly shown.",
  "推门出门": "She opens or passes through a door with a small controlled movement, keeping shoe-ground contact stable and the footwear readable.",
  "坐在沙发边": "She sits on the sofa edge with both feet naturally on the floor, showing trouser hem, ankle area, and sneakers clearly.",
  "坐在床边，双脚自然落地": "She sits on the bed edge with both feet naturally on the floor, keeping shoes stable, readable, and correctly worn.",
  "靠墙自然站立": "She leans or stands lightly near a wall with a relaxed posture and clear shoe visibility.",
  "慢走一步": "A small natural walking step with stable shoe-ground contact, no motion blur, no stretched foot, and no distorted shoe.",
  "下车动作": "Simplify the car-side movement so one foot is stable on the ground and the sneaker shape remains clean.",
  "从后座拿包": "She reaches gently for a bag near the car while keeping foot placement stable and sneakers readable.",
  "牵小朋友手": "She gently holds a child's hand while standing or walking slowly, keeping the shoes stable and visible.",
  "弯腰拿儿童书包": "If bending is shown, keep it shallow and stable; avoid crouching geometry that hides or distorts the shoes.",
  "蹲下拿儿童书包": "Simplify into a safer standing or slight-bend pickup so the shoes remain stable and structurally clean.",
  "拿咖啡慢走": "She walks slowly with coffee, relaxed and tasteful, with small steps and clear sneaker-ground contact.",
  "坐在咖啡店外": "She sits calmly outside a cafe with natural foot placement, readable trouser hems, and visible sneakers.",
  "翻书 / 看书": "She reads or turns a page quietly, keeping the body relaxed and the sneakers naturally present if visible.",
  "整理衣架 / 拿衣服": "She handles a hanger or clothing piece in a wardrobe moment, keeping the outfit-and-shoe relationship calm and clear.",
  "镜前检查穿搭": "She checks the outfit near a mirror, focusing on styling relationship and readable sneakers rather than face or phone.",
  "打开行李箱": "She opens or arranges a suitcase in a calm travel moment, keeping shoes visible and avoiding luggage clutter.",
  "站在电梯口等待": "She waits quietly near an elevator with relaxed posture, stable feet, and clear shoe visibility.",
  "轻微转身": "She makes only a small gentle turn, preserving natural body proportion and clean sneaker shape.",
  "坐在床边穿鞋": "Use a safer seated shoe-ready moment with the shoe already worn or nearly stable, avoiding foot-entry clipping.",
  "大幅弯腰": "Simplify the bend into a calmer slight forward movement so the shoes are not hidden, compressed, or distorted.",
  "扶墙穿鞋": "Simplify into a stable standing or seated shoe-adjusting moment with no foot pushing through the shoe.",
  "大步走路": "Reduce to a small slow walking step with no motion blur, no stretched legs, and no deformed sneaker.",
  "跑动": "Replace running energy with a slow lifestyle step; THERUIZ AURA should feel calm, not sporty.",
  "交叉腿坐姿": "Use a safer seated posture with both feet on the floor or slightly staggered, avoiding twisted knees and hidden shoes.",
  "复杂坐姿": "Simplify into a relaxed seated pose with balanced body geometry and both sneakers readable.",
  "脚尖踮起": "Avoid exaggerated toe lift; keep the foot naturally grounded so the outsole and toe box remain accurate.",
  "鞋子被手直接拉扯": "Hands may hover near the shoe, but should not pull, deform, or hide the sneaker structure.",
  "脚正在穿入鞋口的瞬间": "Avoid the transitional foot-entry moment; show the shoe already correctly worn with clean collar and tongue."
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
