import type { SceneBlock } from "../types";

export const MATURE_SCENE_BLOCKS: SceneBlock[] = [
  {
    id: "09",
    label: "家长会 / 学校活动 Parent meeting and school event",
    shortLabel: "家长会 / 学校活动",
    englishLabel: "Parent meeting and school event",
    category: "mature",
    prompt: `Create a refined daily scene for a mature urban woman wearing THERUIZ AURA sneakers while attending a parent meeting, school event, or school-related appointment. The setting may include a calm school entrance, meeting room corridor, clean campus walkway, or a quiet waiting area. The woman should look tasteful, composed, and approachable, not overly formal and not careless. Style her with refined everyday clothing such as a white shirt, soft knitwear, tailored trousers, light trench coat, or neutral tote bag. The sneakers should feel comfortable, polished, and appropriate for a woman balancing family responsibilities and personal style. Avoid school advertisement feeling, overly young mom styling, or stiff corporate posing.`
  },
  {
    id: "10",
    label: "兴趣班接送 After-school activity pickup",
    shortLabel: "兴趣班接送",
    englishLabel: "After-school activity pickup",
    category: "mature",
    prompt: `Create a realistic refined scene of a 30-55 year old urban woman picking up a child from an after-school activity such as piano, art class, dance class, tutoring, or sports training. Keep the child's presence subtle, such as a small school bag, instrument case, art folder, or blurred child figure. The woman should look calm, practical, and elegant, wearing comfortable refined clothing with THERUIZ AURA sneakers. The scene should express easy movement, real daily rhythm, and tasteful family life. Avoid mother-baby advertisement style, exaggerated warmth, or cluttered children's environment.`
  },
  {
    id: "11",
    label: "精品超市 / 日常采购 Premium grocery and errands",
    shortLabel: "精品超市 / 日常采购",
    englishLabel: "Premium grocery and errands",
    category: "mature",
    prompt: `Create a refined everyday errands scene for a 30-55 year old urban woman wearing THERUIZ AURA sneakers. The setting may be a premium grocery store, organic market, bakery corner, or calm daily shopping environment. She may carry a paper bag, fresh produce, flowers, or a neutral tote. The mood should feel realistic, warm, and tasteful. The sneakers should communicate comfort for daily errands while maintaining quiet elegance. Avoid supermarket clutter, cheap lifestyle stock-photo feeling, loud colors, or overly staged shopping poses.`
  },
  {
    id: "12",
    label: "开车接送 / 停车场移动 Car-side daily mobility",
    shortLabel: "开车接送 / 停车场移动",
    englishLabel: "Car-side daily mobility",
    category: "mature",
    prompt: `Create a refined car-side daily mobility scene for THERUIZ AURA sneakers. Show a mature urban woman stepping out of a car, standing beside a car door, taking a tote from the back seat, or walking from parking to elevator. The car should remain a subtle daily context, not a luxury status symbol. The sneakers should feel comfortable and polished for city movement. Avoid showing off expensive cars, harsh underground parking light, or masculine car-advertising mood.`
  },
  {
    id: "13",
    label: "轻商务午餐 Business casual lunch",
    shortLabel: "轻商务午餐",
    englishLabel: "Business casual lunch",
    category: "mature",
    prompt: `Create a refined business-casual lunch scene for a mature urban woman wearing THERUIZ AURA sneakers. The setting may be a quiet restaurant, hotel café, private dining corner, or calm city lunch space. She may be seated, walking between tables, holding a small bag, or waiting near a table. The styling should feel polished but relaxed: white shirt, tailored trousers, soft knitwear, light coat, or elegant neutral bag. The sneakers should appear suitable for a woman who wants comfort without losing sophistication in semi-business social situations. Avoid nightlife, luxury-logo display, overly formal suit styling, or influencer restaurant posing.`
  },
  {
    id: "14",
    label: "美容护理 / 沙龙 Beauty salon and self-care",
    shortLabel: "美容护理 / 沙龙",
    englishLabel: "Beauty salon and self-care",
    category: "mature",
    prompt: `Create a quiet self-care lifestyle scene for THERUIZ AURA sneakers. The setting may be a beauty salon, skincare studio, hair salon, nail salon, or spa reception with warm neutral interiors. The woman should look relaxed, natural, and refined, not overly glamorous. The sneakers should feel like part of a comfortable but tasteful everyday outfit. Include subtle cues such as a neutral handbag, soft coat, magazine, appointment card, or warm waiting area. Avoid flashy salon styling, heavy makeup, celebrity beauty advertising, or artificial luxury.`
  },
  {
    id: "15",
    label: "出差会议 / 酒店通勤 Business travel and hotel commute",
    shortLabel: "出差会议 / 酒店通勤",
    englishLabel: "Business travel and hotel commute",
    category: "mature",
    prompt: `Create a refined business travel scene for THERUIZ AURA sneakers. The setting may include a hotel lobby, hotel room doorway, suitcase beside the bed, airport hotel corridor, or business trip breakfast area. The woman should look polished, practical, and calm, wearing travel-ready refined clothing. The sneakers should communicate all-day walking comfort and versatile styling for business travel. Avoid tourist travel, airport chaos, luxury bragging, or staged luggage advertisement.`
  },
  {
    id: "16",
    label: "周末城市散步 Weekend city walk for mature women",
    shortLabel: "周末城市散步",
    englishLabel: "Weekend city walk for mature women",
    category: "mature",
    prompt: `Create a calm weekend city walk scene for a mature urban woman wearing THERUIZ AURA sneakers. The setting may be a quiet street, riverside path, gallery district, café exterior, bookstore street, or light stone city wall. She should look relaxed, tasteful, and confident without strong posing. The sneakers should feel like her natural choice for walking comfortably through the city. Avoid young streetwear energy, tourist photography, exaggerated fashion walk, or noisy city backgrounds.`
  }
];

export const MATURE_AUTO_ACTION_BY_SCENE: Record<string, string[]> = {
  "09": ["靠墙自然站立", "慢走一步", "拿包准备出门"],
  "10": ["牵小朋友手", "从后座拿包", "弯腰拿儿童书包"],
  "11": ["静态站立，一脚微微向前", "拎纸袋 / 花束 / 面包袋"],
  "12": ["静态站立，一脚微微向前", "从后座拿包", "下车动作"],
  "13": ["靠墙自然站立", "拿包准备出门"],
  "14": ["坐在沙发边", "拿包准备出门"],
  "15": ["慢走一步", "打开行李箱", "拿包准备出门"],
  "16": ["慢走一步", "拿咖啡慢走"]
};
