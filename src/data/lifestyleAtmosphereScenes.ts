import type { AtmosphereScene } from "../types";

export const ATMOSPHERE_SCENES: AtmosphereScene[] = [
  {
    id: "brand-light-space",
    label: "光影与空间",
    category: "brand",
    prompt: `Create a non-product atmospheric image for THERUIZ AURA. No shoes, no model as the main subject. Show a quiet cream-white interior corner with soft natural daylight, linen curtains, warm beige walls, subtle shadows, light stone or wood texture, and calm negative space. Refined, warm, quiet, breathable, realistic, not empty, not cold, not generic stock photography.`
  },
  {
    id: "brand-material-touch",
    label: "材质与触感",
    category: "brand",
    prompt: `Create a tactile material mood image for THERUIZ AURA. The image should not be a direct product shot. Show refined material samples such as suede swatches, soft leather pieces, shoelaces, thread, a care brush, neutral fabric, and a minimal brand card on a warm light stone or linen surface. Premium, intimate, real, tactile, and restrained.`
  },
  {
    id: "brand-bts",
    label: "拍摄花絮",
    category: "brand",
    prompt: `Create a behind-the-scenes photography mood image for THERUIZ AURA. Show a refined, quiet photoshoot moment rather than a polished final product image. Include subtle elements such as a light stand edge, a photographer's hand adjusting styling, a neutral styling table, soft fabric, wardrobe pieces, a camera monitor, or a paper shot list. Avoid chaotic studio clutter, cheap commercial shooting atmosphere, flashy equipment focus, or over-staged BTS.`
  },
  {
    id: "brand-everyday-objects",
    label: "生活物件",
    category: "brand",
    prompt: `Create a refined everyday object mood image for THERUIZ AURA. No shoes as the main subject. Show a small selection of tasteful daily objects belonging to a modern woman: a neutral tote bag, coffee cup, book, keys, white shirt fabric, light denim, hand cream, or a simple paper bag. Not cluttered, not influencer flat lay, not decorative lifestyle stock.`
  },
  {
    id: "brand-wardrobe-prep",
    label: "衣柜准备",
    category: "brand",
    prompt: `Create a wardrobe preparation mood image for THERUIZ AURA. No shoes as the main subject. Show a refined morning wardrobe moment: a white shirt on a hanger, light blue denim, cream knitwear, beige trench coat, neutral tote bag, soft fabric folds, or a wardrobe mirror edge. Refined, calm, practical, warm, and not overly styled.`
  },
  {
    id: "brand-city-path",
    label: "城市路径",
    category: "brand",
    prompt: `Create a quiet urban atmosphere image for THERUIZ AURA. No product as the main subject. Show a refined city path such as a light stone sidewalk, calm office entrance, café exterior, hotel doorway, soft parking-to-elevator walkway, or pale wall with natural shadows. Avoid tourist street photography, noisy urban clutter, strong colors, or influencer check-in feeling.`
  },
  {
    id: "brand-paper-detail",
    label: "纸品品牌细节",
    category: "brand",
    prompt: `Create a refined brand paper goods mood image for THERUIZ AURA. Show minimal packaging and paper details such as a care card, product card, tissue paper, shoebox corner, hangtag, envelope, handwritten note, or subtle THERUIZ AURA logo detail. Minimal, tactile, restrained, elegant, and warm.`
  },
  {
    id: "brand-founder-hands",
    label: "主理人 / 团队手部",
    category: "brand",
    prompt: `Create a founder or team working-detail mood image for THERUIZ AURA. No face is required. Show refined hands interacting with product development materials: holding leather swatches, writing notes, comparing color cards, checking stitching, arranging shoelaces, or reviewing a shot list. Avoid factory feeling, messy office clutter, or fake luxury staging.`
  },
  {
    id: "customer-entryway",
    label: "玄关出门时刻",
    category: "customer",
    customerExpectation: "早上出门不用纠结",
    prompt: `Create a refined non-product atmospheric image for THERUIZ AURA showing a calm entryway departure moment. The setting may include a cream-white or warm beige entryway, a softly lit doorway, a neutral tote bag, keys, a light trench coat, or subtle daily objects near the door. The image should express the feeling of leaving home in an easy, orderly, and tasteful way. Use soft natural light, quiet negative space, low saturation, and warm restraint. Avoid clutter, heavy styling, or generic lifestyle stock photography.`
  },
  {
    id: "customer-reading",
    label: "窗边阅读",
    category: "customer",
    customerExpectation: "我有自己的安静时间",
    prompt: `Create a warm window-side reading atmosphere image for THERUIZ AURA. Show a soft interior corner with a chair or sofa edge, a book or magazine, a mug, linen curtains, and gentle daylight. The image should feel quiet, reflective, and intimate, expressing a refined woman's private moment of calm. Avoid staged influencer reading scenes, excessive props, or cold empty interiors.`
  },
  {
    id: "customer-hotel-arrival",
    label: "酒店抵达后",
    category: "customer",
    customerExpectation: "出差和旅行也能保持秩序感",
    prompt: `Create a refined hotel arrival atmosphere image for THERUIZ AURA. Show a warm neutral hotel room or hotel transition moment with an open suitcase, folded clothing, a tote bag, a bed edge, or soft daylight through a window. The image should feel organized, calm, and quietly luxurious, like a woman who travels without losing her sense of order and taste. Avoid tourist energy, dramatic travel imagery, or generic hotel brochure styling.`
  },
  {
    id: "customer-flowers-bakery",
    label: "花和面包回家路上",
    category: "customer",
    customerExpectation: "日常里有一点温柔的小奖励",
    prompt: `Create a warm everyday return-home atmosphere image for THERUIZ AURA. Show a small bouquet, a bakery paper bag, light urban textures, a doorway, a chair, or a kitchen entry surface. The image should feel like a gentle reward within daily life — relaxed, tasteful, and human. Avoid romantic cliché, oversized decorative flowers, bright color overload, or influencer check-in feeling.`
  },
  {
    id: "customer-worktable",
    label: "轻整理工作台",
    category: "customer",
    customerExpectation: "工作很多，但我依然有审美",
    prompt: `Create a refined desk or worktable reset atmosphere image for THERUIZ AURA. Show a tasteful everyday work corner with a notebook, glasses, coffee, paper documents, neutral stationery, and soft natural light. The image should feel organized, calm, capable, and aesthetically restrained, expressing a woman whose work life still carries quiet taste. Avoid tech-office coldness, productivity cliché, or busy corporate desk clutter.`
  },
  {
    id: "customer-weekend-errands",
    label: "周末轻采购",
    category: "customer",
    customerExpectation: "真实生活也可以很高级",
    prompt: `Create a refined everyday errand atmosphere image for THERUIZ AURA. Show a premium but believable daily-life scene with a grocery paper bag, flowers, produce, coffee beans, or a simple kitchen or table surface. The mood should feel like real life made beautiful through order, restraint, and good taste. Avoid supermarket clutter, cheap lifestyle stock feeling, or over-styled domestic perfection.`
  }
];
