import type { TeamScenePreference } from "../types";

export const NON_PRODUCT_ATMOSPHERE_SCENE_LINES: Partial<
  Record<Exclude<TeamScenePreference, "自动匹配">, string>
> = {
  通勤上班:
    "Create one commute-related atmosphere detail: an orderly entry table, office-bound tote and keys, coat on a chair, or a quiet office-transition corner. Keep it object- and space-led, with no posed commuter portrait.",
  周末城市散步:
    "Create one quiet weekend city detail: real pavement and tree shadow, a restrained cafe or bookstore facade, or a tote and receipt resting after a walk. Keep the city depth believable and do not show a posed street-style figure.",
  咖啡店门口:
    "Create one calm cafe-front atmosphere with believable pavement, restrained signage, soft window reflection, and one takeaway cup or paper bag placed naturally. Avoid check-in styling and do not make a person the subject.",
  咖啡馆内:
    "Create one real cafe-interior atmosphere with soft window light, a naturally used table, ceramic cup, shifted chair, restrained counter depth, and quiet background rhythm. Keep text unreadable, props sparse, and people secondary or absent; do not substitute an exterior storefront.",
  朋友午餐:
    "Create one quiet friends-lunch atmosphere through two simple place settings, naturally shifted chairs, soft daytime light, and subtle traces of conversation. Keep food restrained, companions secondary or implied, and avoid party, formal evening social mood, banquet, or staged table-content styling.",
  美术馆:
    "Create one contemporary art-museum atmosphere with correctly spaced artwork, warm-white or soft-stone walls, controlled wall light, a bench or passage edge, and quiet visitor traces. Keep labels unreadable and avoid luxury-event, retail-showroom, or empty CGI-gallery mood.",
  "书店 / 杂志店门口":
    "Create one bookstore or magazine-shop atmosphere with muted facade texture, a canvas tote, receipt, book edge, or magazine placed naturally. Keep text unreadable and the scene thoughtful rather than staged.",
  "花店 / 买花":
    "Create one flower-shop atmosphere with restrained paper-wrapped flowers, real storefront texture, and a quiet return-home trace. Keep flowers modest and avoid romantic or influencer styling.",
  "精品超市 / 日常采购":
    "Create one refined daily-errand atmosphere with a grocery paper bag, produce, receipt, or tote on a believable store-to-home surface. Keep it warm, orderly, and grounded in real daily life.",
  "社区市集 / 精品买菜":
    "Create one neighborhood-market atmosphere with restrained produce, a canvas tote, paper bag, or receipt and believable local texture. Avoid tourist-market clutter and staged food styling.",
  "城市街角 / 安静街区":
    "Create one quiet contemporary Chinese city-corner atmosphere with believable pavement, curb lines, mild surface wear, soft greenery, and natural street depth. Keep it lived-in rather than render-clean.",
  雨天街角:
    "Create one rainy city-corner atmosphere with slightly wet pavement, soft reflected daylight, an umbrella or raincoat trace, and believable curb texture. Keep it calm and real, not cinematic or dramatic.",
  周末轻采购:
    "Create one after-errand atmosphere with flowers, bakery paper, produce, coffee beans, a receipt, or a folded tote placed naturally at home. Show real-life order without flatlay styling.",
  旅行酒店:
    "Create one calm hotel-travel atmosphere with a tidy suitcase corner, folded clothing, key card, travel notebook, or tote near soft hotel daylight. Keep it orderly and personal, not a luxury-hotel advertisement.",
  酒店房间:
    "Create one believable hotel-room detail with a bed or chair edge, neatly opened suitcase, folded clothing, curtain light, and one travel object. Avoid bathroom counters, luggage clutter, and brochure styling.",
  "酒店门口 / 门厅":
    "Create one quiet hotel-threshold atmosphere with restrained stone or wood texture, subtle luggage or key-card detail, and believable arrival light. Keep the entrance secondary and avoid luxury check-in imagery.",
  居家衣帽间:
    "Create one calm wardrobe atmosphere with a white shirt, soft knit, denim, hanger, mirror edge, or tote arranged like a real getting-ready routine. Keep it personal and lightly lived-in, not a fashion showroom.",
  "衣帽间 / 更衣角":
    "Create one dressing-corner atmosphere with soft garment folds, a hanger, cardigan, chair edge, mirror edge, or folded daily outfit. Keep the space practical, warm, and naturally used.",
  玄关出门:
    "Create one before-leaving entryway atmosphere with keys, tote, coat, doorway light, and a clean but lived-in threshold. Express easy departure without showing a posed person.",
  回家进门:
    "Create one return-home entryway atmosphere with keys on a tray, a tote set down naturally, folded cardigan, paper bag, or soft corridor light. Keep it warm and orderly rather than decorated.",
  窗边阅读:
    "Create one quiet window-side reading atmosphere with a book or magazine, cup, linen curtain, chair or sofa edge, and soft daylight. Keep the moment private, warm, and free of posed people.",
  窗边阅读角:
    "Create one quiet personal reading-corner detail with a book, glasses, cup, linen curtain, and believable window light on a chair or side table. Avoid decorative showroom symmetry.",
  "工作台 / 桌边整理":
    "Create one refined personal worktable atmosphere with a notebook, used pen, glasses, paper, coffee, or laptop edge placed with believable daily order. Keep it her working life, not a product-development catalog.",
  材质工作台:
    "Create one tactile material-table atmosphere with leather or suede swatches, shoelaces, color cards, care brush, notes, and natural hand-work traces. Keep the arrangement restrained, real, and secondary to material authenticity.",
  拍摄花絮:
    "Create one quiet behind-the-scenes atmosphere with a styling table, camera-monitor edge, light-stand edge, shot list, wardrobe piece, or hands adjusting details. Keep it like a real working moment, not a technical equipment display.",
  棚内上新拍摄:
    "Create one restrained new-launch studio atmosphere with warm-white seamless paper, a reflector edge, styling rail, shot list, folded wardrobe piece, or quiet light-stand detail. Keep it like a real working studio between takes, without turning a person or full product into the sole subject.",
  暑假游乐园:
    "Create one unmistakable but restrained summer amusement-park atmosphere: a shaded park walkway or quiet rest corner with a folded park map, simple paper wristband, sun hat, canvas tote, or distant out-of-focus ride detail. Keep it like a real family summer outing, not a sporty excursion or theme-park advertisement, and do not replace it with a generic street or home scene.",
  海边度假:
    "Create a South of France or southern Italy Mediterranean seaside atmosphere using a pale limestone promenade, warm off-white coastal lane, restrained hotel-terrace threshold, or quiet sea-facing corner. Add only one subtle cue such as linen texture, sunglasses, a book, or a woven bag. Keep the location lived-in and regionally believable rather than tropical, postcard-like, or generic.",
  草原野餐:
    "Create one unmistakable grassland-picnic atmosphere: an open-field edge with a restrained picnic blanket, woven basket, fruit box, paperback book, or light cardigan under natural daylight. Keep the field context clear and real, not a sporty outing, generic park path, or camping advertisement.",
  酒店度假:
    "Create one quiet hotel-holiday atmosphere with a terrace threshold, calm room corner, travel tote, folded light clothing, sunglasses, or a neatly placed suitcase. Keep it like a real holiday routine, not luxury-resort promotion.",
  亲子自驾出行:
    "Create one family road-trip atmosphere through a tidy car-side or passenger-seat detail with a tote, compact child travel pouch, snack box, folded paper map, light jacket, or travel pouch. Keep the travel context clear, mature, and uncluttered, without a sporty or car-advertising mood.",
  暑假外出后回家:
    "Create one summer return-home atmosphere at an entryway or apartment threshold with a tote set down, keys, sun hat, light cardigan, flower paper, grocery bag, or a folded shirt. Keep it warm, lived-in, orderly, and clearly after a day out rather than workout-related.",
  公园慢走:
    "Create one quiet urban-park atmosphere with a real walking path, restrained greenery, bench or railing detail, soft ground shadow, and one subtle daily object such as a folded tote, paperback book, or light cardigan. Keep it recognizably a relaxed park, not a workout scene, bookstore, or generic street.",
  社区步道:
    "Create one neighborhood-walk atmosphere with a believable community path, soft greenery, curb or paving texture, and subtle everyday residential depth. Keep it practical and real, without a posed walker.",
  周末轻旅行出发:
    "Create one weekend-departure atmosphere at a building threshold, tidy luggage corner, car-side loading detail, or travel-start table with a tote, light jacket, sunglasses, or paper bag. Keep it light and anticipatory, not a hotel advertisement."
};

export function getNonProductAtmosphereSceneLine(
  scene: Exclude<TeamScenePreference, "自动匹配">
) {
  return NON_PRODUCT_ATMOSPHERE_SCENE_LINES[scene] ?? "";
}
