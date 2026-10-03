import type { TeamScenePreference } from "../../types";
import type { ImageEventDefinition, ImageEventFamily } from "./types";

const LOCOMOTION = ["walking", "transition", "turning", "scene-interaction", "on-foot"];
const STATIONARY = ["standing", "environment-response"];
const GARMENT = ["garment-task"];
const SEATED = ["seated"];

const ENTRYWAY_SCENES: TeamScenePreference[] = [
  "玄关出门",
  "回家进门",
  "归家玄关",
  "暑假外出后回家"
];

const PUBLIC_ENTRANCE_SCENES: TeamScenePreference[] = [
  "写字楼门口",
  "咖啡店门口",
  "书店 / 杂志店门口",
  "瑜伽 / 普拉提工作室门口"
];

const URBAN_PATH_SCENES: TeamScenePreference[] = [
  "通勤上班",
  "商务区转角",
  "停车后步行去办公室",
  "住宅楼外",
  "周末城市散步",
  "城市街角 / 安静街区",
  "公园慢走",
  "社区步道",
  "去运动的路上",
  "周末轻旅行出发"
];

const PASSAGE_SCENES: TeamScenePreference[] = [
  "地铁 / 商场通道",
  "停车场到电梯口"
];

const CAFE_SCENES: TeamScenePreference[] = [
  "咖啡馆内",
  "朋友午餐"
];

const BOOK_SCENES: TeamScenePreference[] = [
  "书店 / 杂志店内",
  "窗边阅读",
  "窗边阅读角"
];

const MARKET_SCENES: TeamScenePreference[] = [
  "精品超市 / 日常采购",
  "社区市集 / 精品买菜",
  "周末轻采购",
  "楼下便利店 / 咖啡外带"
];

const FLOWER_SCENES: TeamScenePreference[] = ["花店 / 买花"];
const GALLERY_SCENES: TeamScenePreference[] = ["美术馆"];

const CLOSET_SCENES: TeamScenePreference[] = [
  "入户镜前",
  "居家衣帽间",
  "衣帽间 / 更衣角"
];

const GYM_SCENES: TeamScenePreference[] = ["健身房内"];

const LEISURE_SCENES: TeamScenePreference[] = [
  "暑假游乐园",
  "海边度假",
  "草原野餐",
  "亲子自驾出行"
];

function defineEvent(input: {
  id: string;
  eventFamily: ImageEventFamily;
  compatibleScenes: TeamScenePreference[];
  compatibleActionFamilies: string[];
  trigger: string;
  physicalResponse: string;
  visibleChange: string;
  visualEvidence: string;
}): ImageEventDefinition {
  return input;
}

export const IMAGE_EVENT_CATALOG: ImageEventDefinition[] = [
  defineEvent({
    id: "entryway-threshold-crossing",
    eventFamily: "THRESHOLD_CROSSING",
    compatibleScenes: ENTRYWAY_SCENES,
    compatibleActionFamilies: LOCOMOTION,
    trigger: "an already-open doorway creates a visible boundary between two floor zones",
    physicalResponse: "the existing movement carries the body across that threshold",
    visibleChange: "the lead foot is on the next surface while the rear foot is still finishing contact behind",
    visualEvidence: "the doorway edge, both floor zones, separated foot positions, and unfinished weight transfer"
  }),
  defineEvent({
    id: "public-entrance-threshold-crossing",
    eventFamily: "THRESHOLD_CROSSING",
    compatibleScenes: PUBLIC_ENTRANCE_SCENES,
    compatibleActionFamilies: LOCOMOTION,
    trigger: "the entrance edge visibly interrupts the walking line at the doorway",
    physicalResponse: "the existing step redirects through the opening instead of continuing parallel to the facade",
    visibleChange: "one foot has entered the doorway zone while the other still belongs to the exterior walking line",
    visualEvidence: "the entrance edge, changed travel direction, split foot positions, and two adjacent ground zones"
  }),
  defineEvent({
    id: "threshold-arrival-pause",
    eventFamily: "ARRIVAL_SETTLE",
    compatibleScenes: [...ENTRYWAY_SCENES, ...PUBLIC_ENTRANCE_SCENES],
    compatibleActionFamilies: STATIONARY,
    trigger: "a doorway or entrance edge marks the exact point where movement has just ended",
    physicalResponse: "the body is still settling after reaching that boundary",
    visibleChange: "the stance has stopped but the hips, shoulders, and rear heel still show residual weight transfer",
    visualEvidence: "the entrance boundary, asymmetrical stance, grounded lead foot, and residual settling"
  }),
  defineEvent({
    id: "threshold-garment-recovery",
    eventFamily: "GARMENT_RECOVERY",
    compatibleScenes: [...ENTRYWAY_SCENES, ...PUBLIC_ENTRANCE_SCENES],
    compatibleActionFamilies: GARMENT,
    trigger: "recent movement through the entrance has left one outer-layer edge visibly displaced",
    physicalResponse: "the existing garment-adjustment action is finishing that displacement",
    visibleChange: "the fabric is returning toward its natural hang while the body remains slightly unsettled",
    visualEvidence: "the entrance behind the subject, the displaced garment edge, the correcting hand, and grounded feet"
  }),
  defineEvent({
    id: "urban-curb-transition",
    eventFamily: "SURFACE_TRANSITION",
    compatibleScenes: URBAN_PATH_SCENES,
    compatibleActionFamilies: LOCOMOTION,
    trigger: "a shallow curb or level change creates two visibly different ground heights",
    physicalResponse: "the existing movement adapts to the change in ground level",
    visibleChange: "one foot is already on the lower plane while the other remains on the higher plane",
    visualEvidence: "both surface heights, separated foot levels, soft knees, and active weight transfer"
  }),
  defineEvent({
    id: "urban-route-edge-adjustment",
    eventFamily: "ROUTE_ADJUSTMENT",
    compatibleScenes: URBAN_PATH_SCENES,
    compatibleActionFamilies: LOCOMOTION,
    trigger: "a visible building corner or path edge changes the usable walking line",
    physicalResponse: "the existing movement bends around that spatial edge",
    visibleChange: "the feet and torso are no longer aligned to the previous direction and are mid-redirection",
    visualEvidence: "the corner or path edge, changed foot direction, torso rotation, and unfinished step"
  }),
  defineEvent({
    id: "urban-light-boundary-pause",
    eventFamily: "ENVIRONMENT_RESPONSE",
    compatibleScenes: URBAN_PATH_SCENES,
    compatibleActionFamilies: STATIONARY,
    trigger: "a clear daylight-to-shadow boundary cuts across the standing area",
    physicalResponse: "the existing pause settles at that visible light boundary",
    visibleChange: "one side of the body and footwear remains in brighter light while the other side falls into softer shade",
    visualEvidence: "the light boundary on the ground, asymmetric illumination, grounded feet, and relaxed weight shift"
  }),
  defineEvent({
    id: "urban-breeze-garment-recovery",
    eventFamily: "GARMENT_RECOVERY",
    compatibleScenes: URBAN_PATH_SCENES,
    compatibleActionFamilies: GARMENT,
    trigger: "a light breeze has visibly lifted or shifted one garment edge",
    physicalResponse: "the existing garment task is settling that moved edge without stopping for the camera",
    visibleChange: "the fabric is still returning toward a natural hang while the stance remains active",
    visualEvidence: "the displaced fabric edge, correcting hand, slight body asymmetry, and readable grounded sneakers"
  }),
  defineEvent({
    id: "passage-route-marker-change",
    eventFamily: "ROUTE_ADJUSTMENT",
    compatibleScenes: PASSAGE_SCENES,
    compatibleActionFamilies: LOCOMOTION,
    trigger: "a visible corridor junction, elevator approach, or floor-direction line changes the travel path",
    physicalResponse: "the existing movement redirects toward the next practical route",
    visibleChange: "the lead foot points into the new path while the rear foot still carries the previous direction",
    visualEvidence: "the route boundary, opposing foot directions, torso follow-through, and floor contact"
  }),
  defineEvent({
    id: "passage-arrival-settle",
    eventFamily: "ARRIVAL_SETTLE",
    compatibleScenes: PASSAGE_SCENES,
    compatibleActionFamilies: STATIONARY,
    trigger: "the end of the corridor or elevator zone creates a visible stopping point",
    physicalResponse: "the existing pause occurs just after arriving there",
    visibleChange: "both feet are grounded but the body has not fully centered its weight",
    visualEvidence: "the stopping boundary, offset stance, softly released knee, and residual body rotation"
  }),
  defineEvent({
    id: "passage-garment-settle",
    eventFamily: "GARMENT_RECOVERY",
    compatibleScenes: PASSAGE_SCENES,
    compatibleActionFamilies: GARMENT,
    trigger: "recent walking has left a sleeve, lapel, or hem visibly out of its resting position",
    physicalResponse: "the existing garment action restores that shifted edge",
    visibleChange: "the fabric is midway between displaced and naturally hanging",
    visualEvidence: "the shifted garment edge, correcting hand, corridor depth, and stable shoe contact"
  }),
  defineEvent({
    id: "cafe-seat-settling",
    eventFamily: "SEAT_SETTLING",
    compatibleScenes: CAFE_SCENES,
    compatibleActionFamilies: SEATED,
    trigger: "the chair and table establish a visible seating destination",
    physicalResponse: "the body is still settling into the seat rather than holding a finished seated pose",
    visibleChange: "the torso remains slightly forward while both feet are re-grounding beneath the seated position",
    visualEvidence: "the chair, table edge, natural knee spacing, grounded feet, and unfinished settling"
  }),
  defineEvent({
    id: "cafe-position-adjustment",
    eventFamily: "ROUTE_ADJUSTMENT",
    compatibleScenes: CAFE_SCENES,
    compatibleActionFamilies: LOCOMOTION,
    trigger: "the visible chair-and-table spacing narrows the approach path",
    physicalResponse: "the existing movement adjusts around the seating edge",
    visibleChange: "the lead foot changes direction while the torso is still following the turn",
    visualEvidence: "the chair or table edge, redirected foot placement, torso follow-through, and unobstructed sneakers"
  }),
  defineEvent({
    id: "cafe-window-light-pause",
    eventFamily: "ENVIRONMENT_RESPONSE",
    compatibleScenes: CAFE_SCENES,
    compatibleActionFamilies: STATIONARY,
    trigger: "a visible window-light boundary falls across the floor beside the seating area",
    physicalResponse: "the existing pause settles partly inside that light",
    visibleChange: "the body and footwear carry a readable transition from soft ambient light into brighter window light",
    visualEvidence: "the light boundary, floor texture, asymmetrical illumination, and grounded stance"
  }),
  defineEvent({
    id: "cafe-garment-recovery",
    eventFamily: "GARMENT_RECOVERY",
    compatibleScenes: CAFE_SCENES,
    compatibleActionFamilies: GARMENT,
    trigger: "arrival or seating movement has left one garment edge visibly folded or shifted",
    physicalResponse: "the existing garment task is finishing that small displacement",
    visibleChange: "the fabric is still returning toward its resting line while the body remains naturally off-center",
    visualEvidence: "the shifted fabric edge, correcting hand, seat or table relationship, and clear shoe position"
  }),
  defineEvent({
    id: "book-viewing-reposition",
    eventFamily: "VIEWING_REPOSITION",
    compatibleScenes: BOOK_SCENES,
    compatibleActionFamilies: LOCOMOTION,
    trigger: "a visible shelf edge or reading-window position changes the useful viewing angle",
    physicalResponse: "the existing movement shifts the body to a better viewing position",
    visibleChange: "the feet are mid-reposition while the torso has already begun to face the new viewing line",
    visualEvidence: "the shelf or window edge, changed body angle, offset foot placement, and unfinished turn"
  }),
  defineEvent({
    id: "book-window-light-pause",
    eventFamily: "ENVIRONMENT_RESPONSE",
    compatibleScenes: BOOK_SCENES,
    compatibleActionFamilies: STATIONARY,
    trigger: "a window-light patch creates a visible boundary across the reading area",
    physicalResponse: "the existing pause settles at that brighter edge",
    visibleChange: "the stance stays grounded while the upper body subtly reorients toward the lit area",
    visualEvidence: "the window-light patch, body reorientation, grounded feet, and surrounding reading context"
  }),
  defineEvent({
    id: "book-seat-settling",
    eventFamily: "SEAT_SETTLING",
    compatibleScenes: ["窗边阅读", "窗边阅读角"],
    compatibleActionFamilies: SEATED,
    trigger: "the reading seat creates a visible destination at the window edge",
    physicalResponse: "the body is still settling into the seat",
    visibleChange: "one side of the torso remains slightly forward while both feet find stable ground",
    visualEvidence: "the seat edge, window zone, natural knee spacing, grounded feet, and incomplete settling"
  }),
  defineEvent({
    id: "book-garment-recovery",
    eventFamily: "GARMENT_RECOVERY",
    compatibleScenes: BOOK_SCENES,
    compatibleActionFamilies: GARMENT,
    trigger: "repositioning near the shelf or seat has left one garment edge visibly displaced",
    physicalResponse: "the existing garment task is returning that edge toward its resting line",
    visibleChange: "the fabric remains slightly in motion while the body stays oriented to the reading area",
    visualEvidence: "the shelf or window context, shifted fabric edge, correcting hand, and stable feet"
  }),
  defineEvent({
    id: "gallery-viewing-reposition",
    eventFamily: "VIEWING_REPOSITION",
    compatibleScenes: GALLERY_SCENES,
    compatibleActionFamilies: LOCOMOTION,
    trigger: "the spacing between the viewer and a visible artwork wall creates a new viewing line",
    physicalResponse: "the existing movement shifts laterally or turns to establish that line",
    visibleChange: "the feet are mid-reposition while the shoulders have already begun to face the artwork",
    visualEvidence: "the artwork wall, changed viewing angle, offset feet, and incomplete torso turn"
  }),
  defineEvent({
    id: "gallery-light-pause",
    eventFamily: "ENVIRONMENT_RESPONSE",
    compatibleScenes: GALLERY_SCENES,
    compatibleActionFamilies: STATIONARY,
    trigger: "a visible pool of gallery light separates the viewing zone from the surrounding floor",
    physicalResponse: "the existing pause settles at the edge of that lit area",
    visibleChange: "the body remains grounded but its orientation and illumination are no longer symmetrical",
    visualEvidence: "the lit floor zone, artwork spacing, asymmetric body angle, and readable footwear"
  }),
  defineEvent({
    id: "gallery-garment-recovery",
    eventFamily: "GARMENT_RECOVERY",
    compatibleScenes: GALLERY_SCENES,
    compatibleActionFamilies: GARMENT,
    trigger: "the recent viewing reposition has left a sleeve, lapel, or hem visibly shifted",
    physicalResponse: "the existing garment task is finishing that adjustment",
    visibleChange: "the fabric is still moving back toward a clean resting line",
    visualEvidence: "the artwork context, shifted garment edge, correcting hand, and quiet grounded stance"
  }),
  defineEvent({
    id: "market-route-adjustment",
    eventFamily: "ROUTE_ADJUSTMENT",
    compatibleScenes: MARKET_SCENES,
    compatibleActionFamilies: LOCOMOTION,
    trigger: "a visible aisle edge or display boundary narrows the practical walking line",
    physicalResponse: "the existing movement bends around that boundary",
    visibleChange: "the lead foot has redirected while the rear foot still points along the previous path",
    visualEvidence: "the aisle or display edge, changed foot direction, torso follow-through, and clear footwear"
  }),
  defineEvent({
    id: "market-arrival-pause",
    eventFamily: "ARRIVAL_SETTLE",
    compatibleScenes: MARKET_SCENES,
    compatibleActionFamilies: STATIONARY,
    trigger: "a visible shelf or display edge creates a natural stopping point",
    physicalResponse: "the existing pause happens immediately after reaching that point",
    visibleChange: "the stance is grounded but the body still carries a slight forward or lateral settling motion",
    visualEvidence: "the stopping edge, offset stance, soft knee, and residual weight transfer"
  }),
  defineEvent({
    id: "market-garment-recovery",
    eventFamily: "GARMENT_RECOVERY",
    compatibleScenes: MARKET_SCENES,
    compatibleActionFamilies: GARMENT,
    trigger: "walking through the aisle has left one garment edge visibly shifted",
    physicalResponse: "the existing garment task settles that edge while the body stays in place",
    visibleChange: "the fabric is midway back to its resting line rather than perfectly arranged",
    visualEvidence: "the aisle context, shifted fabric edge, correcting hand, and grounded sneakers"
  }),
  defineEvent({
    id: "flower-viewing-reposition",
    eventFamily: "VIEWING_REPOSITION",
    compatibleScenes: FLOWER_SCENES,
    compatibleActionFamilies: LOCOMOTION,
    trigger: "the visible flower display runs laterally across the storefront and changes the useful viewing position",
    physicalResponse: "the existing movement shifts along the display instead of continuing straight ahead",
    visibleChange: "the feet and torso are mid-reposition relative to the display line",
    visualEvidence: "the storefront display edge, lateral foot change, torso rotation, and unobstructed sneakers"
  }),
  defineEvent({
    id: "flower-light-pause",
    eventFamily: "ENVIRONMENT_RESPONSE",
    compatibleScenes: FLOWER_SCENES,
    compatibleActionFamilies: STATIONARY,
    trigger: "storefront daylight creates a visible bright-to-shade boundary beside the display",
    physicalResponse: "the existing pause settles at that boundary",
    visibleChange: "the stance stays grounded while the body and footwear carry different light across the two sides",
    visualEvidence: "the storefront edge, light boundary, asymmetric illumination, and relaxed weight shift"
  }),
  defineEvent({
    id: "flower-garment-recovery",
    eventFamily: "GARMENT_RECOVERY",
    compatibleScenes: FLOWER_SCENES,
    compatibleActionFamilies: GARMENT,
    trigger: "the stop beside the storefront has left one garment edge visibly displaced from movement",
    physicalResponse: "the existing garment task is settling that edge",
    visibleChange: "the fabric remains slightly lifted or folded while returning to a natural hang",
    visualEvidence: "the storefront context, shifted garment edge, correcting hand, and stable shoe contact"
  }),
  defineEvent({
    id: "closet-position-adjustment",
    eventFamily: "VIEWING_REPOSITION",
    compatibleScenes: CLOSET_SCENES,
    compatibleActionFamilies: LOCOMOTION,
    trigger: "the visible mirror or wardrobe edge establishes a new standing line",
    physicalResponse: "the existing movement repositions the body relative to that edge",
    visibleChange: "the feet are still adjusting while the torso has already begun to settle into the new line",
    visualEvidence: "the mirror or wardrobe edge, changed foot placement, torso alignment, and unfinished settling"
  }),
  defineEvent({
    id: "closet-light-pause",
    eventFamily: "ENVIRONMENT_RESPONSE",
    compatibleScenes: CLOSET_SCENES,
    compatibleActionFamilies: STATIONARY,
    trigger: "a visible window or doorway light patch divides the dressing area",
    physicalResponse: "the existing pause settles partly inside that light",
    visibleChange: "the body remains grounded with a clear light transition across clothing and footwear",
    visualEvidence: "the light patch, dressing-space boundary, asymmetrical illumination, and natural stance"
  }),
  defineEvent({
    id: "closet-garment-recovery",
    eventFamily: "GARMENT_RECOVERY",
    compatibleScenes: CLOSET_SCENES,
    compatibleActionFamilies: GARMENT,
    trigger: "getting-ready movement has left one sleeve, lapel, or hem visibly out of its resting line",
    physicalResponse: "the existing garment task corrects that exact displacement",
    visibleChange: "the fabric is visibly between shifted and settled rather than perfectly arranged",
    visualEvidence: "the dressing-space context, displaced edge, correcting hand, and grounded feet"
  }),
  defineEvent({
    id: "closet-seat-settling",
    eventFamily: "SEAT_SETTLING",
    compatibleScenes: ["居家衣帽间", "衣帽间 / 更衣角"],
    compatibleActionFamilies: SEATED,
    trigger: "a visible bench or seat creates a practical getting-ready position",
    physicalResponse: "the body is still settling onto that seat",
    visibleChange: "the torso remains slightly forward while both feet re-ground beneath the seated posture",
    visualEvidence: "the seat edge, wardrobe context, natural knee spacing, grounded feet, and incomplete settling"
  }),
  defineEvent({
    id: "gym-route-adjustment",
    eventFamily: "ROUTE_ADJUSTMENT",
    compatibleScenes: GYM_SCENES,
    compatibleActionFamilies: LOCOMOTION,
    trigger: "a visible equipment lane or floor boundary changes the practical path through the room",
    physicalResponse: "the existing movement redirects along that open lane",
    visibleChange: "the lead foot points into the new route while the torso is still following",
    visualEvidence: "the floor boundary, changed foot direction, torso follow-through, and stable shoe shape"
  }),
  defineEvent({
    id: "gym-light-pause",
    eventFamily: "ENVIRONMENT_RESPONSE",
    compatibleScenes: GYM_SCENES,
    compatibleActionFamilies: STATIONARY,
    trigger: "a visible window-light or ceiling-light zone separates part of the gym floor",
    physicalResponse: "the existing pause settles at the edge of that light zone",
    visibleChange: "the stance stays grounded while one side of the body is more strongly lit",
    visualEvidence: "the light boundary, muted equipment depth, asymmetric illumination, and relaxed stance"
  }),
  defineEvent({
    id: "gym-garment-recovery",
    eventFamily: "GARMENT_RECOVERY",
    compatibleScenes: GYM_SCENES,
    compatibleActionFamilies: GARMENT,
    trigger: "light movement has left a sleeve or hem visibly shifted",
    physicalResponse: "the existing garment task restores that edge without turning into a fitness pose",
    visibleChange: "the fabric remains slightly in motion while the feet stay naturally grounded",
    visualEvidence: "the shifted fabric edge, correcting hand, gym floor, and readable sneakers"
  }),
  defineEvent({
    id: "leisure-surface-transition",
    eventFamily: "SURFACE_TRANSITION",
    compatibleScenes: LEISURE_SCENES,
    compatibleActionFamilies: LOCOMOTION,
    trigger: "a visible change in path, paving, deck, or ground texture interrupts the travel surface",
    physicalResponse: "the existing movement adapts to that surface change",
    visibleChange: "the lead foot has entered the new texture while the rear foot remains on the previous surface",
    visualEvidence: "both ground textures, separated foot positions, soft knees, and active weight transfer"
  }),
  defineEvent({
    id: "leisure-environment-pause",
    eventFamily: "ENVIRONMENT_RESPONSE",
    compatibleScenes: LEISURE_SCENES,
    compatibleActionFamilies: STATIONARY,
    trigger: "a visible light, shade, or open-space boundary changes the immediate environment",
    physicalResponse: "the existing pause settles at that boundary rather than posing for the camera",
    visibleChange: "the stance stays grounded while body orientation or illumination becomes visibly asymmetric",
    visualEvidence: "the environmental boundary, asymmetrical stance or light, and natural ground contact"
  }),
  defineEvent({
    id: "leisure-garment-recovery",
    eventFamily: "GARMENT_RECOVERY",
    compatibleScenes: LEISURE_SCENES,
    compatibleActionFamilies: GARMENT,
    trigger: "recent outdoor movement has visibly shifted one garment edge",
    physicalResponse: "the existing garment task is settling that displacement",
    visibleChange: "the fabric remains slightly lifted or folded while returning toward its resting line",
    visualEvidence: "the shifted garment edge, correcting hand, open-space context, and grounded footwear"
  })
];

export const SUPPORTED_IMAGE_EVENT_SCENES = Array.from(
  new Set(IMAGE_EVENT_CATALOG.flatMap((event) => event.compatibleScenes))
);

export const SUPPORTED_IMAGE_EVENT_ACTION_FAMILIES = Array.from(
  new Set(IMAGE_EVENT_CATALOG.flatMap((event) => event.compatibleActionFamilies))
);
