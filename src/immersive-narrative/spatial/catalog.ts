import type { SpatialAnchorId } from "./types";

type AnchorDefinition = {
  id: SpatialAnchorId;
  label: string;
  patterns: RegExp[];
  adjacent: SpatialAnchorId[];
};

// Deterministic spatial truth. Adjacency means "a person can move between these
// positions inside the same 15-second slice without a teleport".
export const SPATIAL_ANCHORS: AnchorDefinition[] = [
  {
    id: "ELEVATOR_EXIT",
    label: "elevator exit",
    patterns: [/电梯口|电梯/, /\belevator\b/i],
    adjacent: ["APARTMENT_HALLWAY", "RESIDENTIAL_EXIT", "STREET"],
  },
  {
    id: "APARTMENT_HALLWAY",
    label: "apartment hallway",
    patterns: [/公寓走廊|走廊|楼道/, /\bhallway\b|\bcorridor\b/i],
    adjacent: ["ELEVATOR_EXIT", "APARTMENT_THRESHOLD", "ENTRYWAY"],
  },
  {
    id: "APARTMENT_THRESHOLD",
    label: "apartment threshold",
    patterns: [/公寓门口|家门口|回家进门|门前/, /\bapartment door\b|\bthreshold\b/i],
    adjacent: ["APARTMENT_HALLWAY", "ENTRYWAY", "RESIDENTIAL_EXIT"],
  },
  {
    id: "ENTRYWAY",
    label: "entryway",
    patterns: [/归家玄关|玄关/, /\bentryway\b/i],
    adjacent: ["APARTMENT_THRESHOLD", "APARTMENT_HALLWAY", "HOME_INTERIOR"],
  },
  {
    id: "HOME_INTERIOR",
    label: "home interior",
    patterns: [/公寓内|家里|家中|屋内|客厅|厨房/, /\bhome interior\b|\binside the home\b|\bapartment interior\b/i],
    adjacent: ["ENTRYWAY", "CLOAKROOM", "TABLE"],
  },
  {
    id: "CLOAKROOM",
    label: "cloakroom corner",
    patterns: [/衣帽间|更衣角/, /\bcloakroom\b|\bdressing corner\b/i],
    adjacent: ["HOME_INTERIOR", "TABLE", "WINDOW_SIDE"],
  },
  {
    id: "TABLE",
    label: "nearby table",
    patterns: [/\btable\b/i, /桌/],
    adjacent: ["HOME_INTERIOR", "CLOAKROOM", "WINDOW_SIDE"],
  },
  {
    id: "WINDOW_SIDE",
    label: "window side",
    patterns: [/窗前|窗边/, /\bwindow[- ]side\b|\bby the window\b/i],
    adjacent: ["CLOAKROOM", "TABLE", "HOME_INTERIOR"],
  },
  {
    id: "RESIDENTIAL_EXIT",
    label: "residential building exit",
    patterns: [/住宅楼外|楼外|建筑出口/, /\bresidential building exit\b|\bbuilding exit\b/i],
    adjacent: ["ELEVATOR_EXIT", "STREET", "COMMUNITY_PATH"],
  },
  {
    id: "STREET",
    label: "street",
    patterns: [/街区|街角|街道|人行道|路边/, /\bstreet\b|\bsidewalk\b|\bpavement\b/i],
    adjacent: ["RESIDENTIAL_EXIT", "COMMUNITY_PATH", "SHOP_FRONT", "SHOP_WINDOW", "CAFE_INTERIOR", "OFFICE_ENTRANCE", "DESTINATION_APPROACH"],
  },
  {
    id: "COMMUNITY_PATH",
    label: "community path",
    patterns: [/社区步道|社区路|公园慢走/, /\bcommunity path\b|\bpark path\b/i],
    adjacent: ["STREET", "RESIDENTIAL_EXIT", "DESTINATION_APPROACH", "OFFICE_ENTRANCE"],
  },
  {
    id: "SHOP_WINDOW",
    label: "shop window",
    patterns: [/橱窗|window display/i, /\bshop window\b/i],
    adjacent: ["SHOP_FRONT", "STREET"],
  },
  {
    id: "SHOP_FRONT",
    label: "shop front",
    patterns: [/书店门口|书店 \/ 杂志店门口|店门口/, /\bstorefront\b|\bshop front\b/i],
    adjacent: ["STREET", "SHOP_WINDOW", "SHOP_INTERIOR"],
  },
  {
    id: "SHOP_INTERIOR",
    label: "shop interior",
    patterns: [/书店 \/ 杂志店内|书店内|店内|店内门廊|精品超市|超市|日常采购/, /\bbookstore interior\b|\binside the shop\b|\bsupermarket\b|\bgrocery store\b/i],
    adjacent: ["SHOP_FRONT"],
  },
  {
    id: "CAFE_INTERIOR",
    label: "cafe interior",
    patterns: [/咖啡馆内|咖啡馆/, /\bcafe interior\b|\bcafé\b|\bcafe\b/i],
    adjacent: ["STREET", "CAFE_COUNTER"],
  },
  {
    id: "CAFE_COUNTER",
    label: "cafe counter",
    patterns: [/柜台|吧台/, /\bcounter\b/i],
    adjacent: ["CAFE_INTERIOR"],
  },
  {
    id: "OFFICE_ENTRANCE",
    label: "office entrance",
    patterns: [/写字楼门口|写字楼/, /\boffice entrance\b|\boffice building\b/i],
    adjacent: ["STREET", "COMMUNITY_PATH", "DESTINATION_ANCHOR"],
  },
  {
    id: "DESTINATION_APPROACH",
    label: "destination approach",
    patterns: [/目的地附近|附近目的地/, /\bnearby destination\b|\bdestination approach\b/i],
    adjacent: ["STREET", "COMMUNITY_PATH", "DESTINATION_ANCHOR"],
  },
  {
    id: "DESTINATION_ANCHOR",
    label: "destination",
    patterns: [/目的地|到达点/, /\barrived at the destination\b|\bthe destination entrance\b/i],
    adjacent: ["DESTINATION_APPROACH", "OFFICE_ENTRANCE"],
  },
];

const ANCHOR_BY_ID = new Map(SPATIAL_ANCHORS.map((anchor) => [anchor.id, anchor]));

export function anchorDefinition(id: SpatialAnchorId) {
  return ANCHOR_BY_ID.get(id) ?? null;
}

export function anchorLabel(id: SpatialAnchorId) {
  return ANCHOR_BY_ID.get(id)?.label ?? "current position";
}
