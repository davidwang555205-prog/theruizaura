import type { Season } from "../types";

export const SEASON_LABELS: Record<Season, string> = {
  Spring: "春 Spring",
  Summer: "夏 Summer",
  Autumn: "秋 Autumn",
  Winter: "冬 Winter"
};

export const SEASONAL_OUTFIT_LIBRARY: Record<Season, string> = {
  Spring: `Spring styling direction:
Use a refined spring outfit with soft low-saturation layers such as a white shirt, cream knitwear, light blue denim, oatmeal trousers, a light trench coat, or a soft beige tote. The styling should feel airy, clean, gentle, and relaxed, with understated femininity and quiet daily elegance.`,
  Summer: `Summer styling direction:
Use a breathable summer outfit with airy low-saturation pieces such as a white short-sleeve shirt, linen trousers, cream cotton tops, soft beige pants, pale denim, or a light neutral tote bag. The styling should feel light, breathable, refined, and quietly feminine, without sporty energy or vacation-girl styling.`,
  Autumn: `Autumn styling direction:
Use a soft autumn outfit with warm, tactile, low-saturation layers such as oatmeal knitwear, cappuccino tones, light wool outerwear, soft denim, warm beige trousers, or a refined brown tote. The styling should feel calm, seasonal, feminine, and quietly vintage without looking heavy or costume-like.`,
  Winter: `Winter styling direction:
Use a refined winter outfit with warm clean layers such as oatmeal knitwear, a cream or warm grey coat, soft wool trousers, structured denim, or a muted brown tote bag. The styling should feel warm, composed, elegant, and practical, with quiet winter sophistication rather than bulky or harsh winter fashion.`
};

export const BRAND_MATCHED_OUTFIT_DIRECTION = `Brand-matched outfit direction:
The outfit should align with THERUIZ AURA's "Quiet Warm Luxury" styling system. Use low-saturation, refined, practical, softly feminine clothing with quiet layering, clean proportions, and believable daily elegance. Avoid trendy influencer dressing, sporty styling, girlish sweetness, loud color contrast, or over-styled fashion energy.`;

export const SHOE_STYLE_NOTES: Record<string, string> = {
  "Cloud Dancer 云舞者":
    "clean white foundation, effortless daily classic, the most versatile pair in a refined wardrobe. Prefer white shirts, cream knitwear, beige trousers, pale denim, and light trench coats.",
  "Sand Dollar 沙钱白":
    "warm off-white, softer and more mature than pure white, timeless everyday foundation. Prefer off-white, oatmeal, light grey-beige, and pale khaki.",
  "Delphinium Blue 飞燕草蓝":
    "pale low-saturation blue, airy, fresh, quiet summer accent, clean and softly distinctive. Prefer white shirts, pale blue denim, oatmeal knitwear, cream-white trousers, and spring-summer airiness.",
  "Silver Romance 银色浪漫":
    "soft moonlit metallic accent, quietly luminous, refined urban difference without flashiness. Prefer light grey, cream-white, gentle beige, and refined urban softness; avoid futuristic styling.",
  "Aire 微风":
    "light, breathable, airy spring-summer ease, refined mesh texture, not sporty. Prefer linen, thin shirts, lightweight fabrics, and spring-summer daily ease; never make it sporty.",
  "Cappuccino 卡布奇诺":
    "warm suede coffee tone, soft autumn-winter mood, vintage but clean, calm and tactile. Prefer knitwear, coffee tones, oatmeal, gentle autumn-winter colors, and warm layering.",
  "Lemon 柠檬":
    "light butter-yellow accent, fresh but not childish, warm and optimistic within a neutral scene. Prefer white, cream, pale denim, and light beige; fresh but not juvenile.",
  "Maple Grove 枫林":
    "warm muted maple tone, refined seasonal warmth, not heavy, not masculine. Prefer warm knitwear, pale brown trousers, beige-coffee layering, and soft autumn tactility.",
  "Oreo 奥利奥":
    "clean black-and-white contrast, graphic but restrained, daily classic with stronger recognition. Prefer black, white, grey, and beige basics, but keep the look soft rather than cold or hard.",
  "Panda 熊猫":
    "soft black-and-white balance, friendly contrast, clean daily character without looking childish. Prefer black, white, grey, beige, soft denim, and light urban basics."
};
