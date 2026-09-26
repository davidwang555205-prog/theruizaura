import { lifestyleSoftSeedingScenePool } from "../../data/lifestyleSoftSeedingScenePool";
import type {
  SceneResolverLocationWorld,
  SceneResolverRule,
  SceneResolverSceneEntry,
} from "./types";

export const CURRENT_NARRATIVE_SCENE_LIBRARY: SceneResolverSceneEntry[] = lifestyleSoftSeedingScenePool.map((scene) => ({
  id: scene.id,
  sceneName: scene.scenePreference,
  family: scene.family,
  contentCategory: scene.contentCategory,
  supportedSeasons: [...scene.supportedSeasons],
  source: "lifestyle_soft_seeding_scene_pool",
}));

export const CURRENT_LOCATION_WORLDS: SceneResolverLocationWorld[] = [
  {
    id: "HOME_ARRIVAL",
    label: "回家进门 / 住宅到手",
    sceneIds: ["lifestyle-returning-home"],
  },
  {
    id: "LEAVING_HOME",
    label: "玄关出门 / 建筑出口 / 门外延续",
    sceneIds: ["lifestyle-entryway-departure", "lifestyle-residential-building-exit"],
  },
  {
    id: "BOOKSTORE_VISIT",
    label: "书店到访",
    sceneIds: ["lifestyle-bookstore", "lifestyle-bookstore-interior"],
  },
  {
    id: "CAFE_VISIT",
    label: "咖啡馆到访",
    sceneIds: ["lifestyle-cafe-interior"],
  },
  {
    id: "OFFICE_ENTRANCE_WAIT",
    label: "写字楼门口等待",
    sceneIds: ["lifestyle-office-entrance"],
  },
  {
    id: "RETURNING_WITH_PURCHASES",
    label: "采购归来 / 玄关",
    sceneIds: ["lifestyle-premium-grocery", "lifestyle-home-errand-entry"],
  },
  {
    id: "WEEKEND_PRIVATE_TIME",
    label: "周末独处 / 私人时间",
    sceneIds: ["lifestyle-window-reading", "lifestyle-window-reading-corner", "lifestyle-dressing-corner"],
  },
  {
    id: "SCHOOL_PICKUP_TRANSITION",
    label: "接送后步行过渡",
    sceneIds: ["lifestyle-community-path", "lifestyle-city-corner", "lifestyle-park-walk"],
  },
  {
    id: "NEIGHBORHOOD_WALK",
    label: "社区散步路线",
    sceneIds: ["lifestyle-community-path", "lifestyle-park-walk", "lifestyle-city-corner"],
  },
  {
    id: "AFTER_LUNCH_STREET",
    label: "午餐后的城市街道",
    sceneIds: ["lifestyle-city-corner", "lifestyle-weekend-city-walk", "lifestyle-cafe-exterior"],
  },
  {
    id: "URBAN_WANDERING",
    label: "城市街区闲逛",
    sceneIds: ["lifestyle-city-corner", "lifestyle-business-corner", "lifestyle-weekend-city-walk"],
  },
  {
    id: "EVENING_HOME_RETURN",
    label: "傍晚归家",
    sceneIds: ["lifestyle-city-corner", "lifestyle-residential-building-exit", "lifestyle-returning-home"],
  },
  {
    id: "SHORT_LOCAL_TRIP",
    label: "短途本地移动",
    sceneIds: ["lifestyle-community-path", "lifestyle-parking-to-office", "lifestyle-office-entrance"],
  },
];

export const CURRENT_SCENE_RESOLUTION_RULES: SceneResolverRule[] = [
  {
    id: "return-home-to-home-arrival",
    topics: ["after_work_home"],
    locationWorldId: "HOME_ARRIVAL",
    sceneAssignments: {
      establish_state: "lifestyle-returning-home",
      approach_trigger: "lifestyle-returning-home",
      micro_event: "lifestyle-returning-home",
      response: "lifestyle-returning-home",
      after_state: "lifestyle-returning-home",
    },
    forbiddenMomentTokens: [
      "bookstore",
      "书店",
      "cafe",
      "咖啡",
      "grassland",
      "草原",
      "airport",
      "机场",
      "hotel",
      "酒店",
      "market",
      "超市",
    ],
    failureReason: "The current Lifestyle Scene Library can support the complete return-home threshold as one continuous HOME_ARRIVAL world.",
  },
  {
    id: "departure-to-home-departure",
    topics: ["errand_outing"],
    locationWorldId: "LEAVING_HOME",
    sceneAssignments: {
      establish_state: "lifestyle-entryway-departure",
      approach_trigger: "lifestyle-entryway-departure",
      micro_event: "lifestyle-residential-building-exit",
      response: "lifestyle-residential-building-exit",
      after_state: "lifestyle-residential-building-exit",
    },
    forbiddenMomentTokens: [
      "bookstore",
      "书店",
      "cafe",
      "咖啡",
      "grassland",
      "草原",
      "kitchen",
      "厨房",
      "market",
      "超市",
    ],
    failureReason: "The current Lifestyle Scene Library supports the indoor entryway, residential building exit, and immediate outdoor continuation as one LEAVING_HOME world.",
  },
  {
    id: "bookstore-to-bookstore-visit",
    topics: ["bookstore_browse"],
    locationWorldId: "BOOKSTORE_VISIT",
    sceneAssignments: {
      establish_state: "lifestyle-bookstore",
      approach_trigger: "lifestyle-bookstore",
      micro_event: "lifestyle-bookstore",
      response: "lifestyle-bookstore",
      after_state: "lifestyle-bookstore-interior",
    },
    forbiddenMomentTokens: [
      "home",
      "公寓",
      "cafe",
      "咖啡",
      "grassland",
      "草原",
      "market",
      "超市",
      "kitchen",
      "厨房",
    ],
    failureReason: "The current Lifestyle Scene Library supports the bookstore entrance and connected interior browsing space as one BOOKSTORE_VISIT world.",
  },
  {
    id: "cafe-to-cafe-visit",
    topics: ["afternoon_cafe"],
    locationWorldId: "CAFE_VISIT",
    sceneAssignments: {
      establish_state: "lifestyle-cafe-interior",
      approach_trigger: "lifestyle-cafe-interior",
      micro_event: "lifestyle-cafe-interior",
      response: "lifestyle-cafe-interior",
      after_state: "lifestyle-cafe-interior",
    },
    forbiddenMomentTokens: [
      "home",
      "公寓",
      "bookstore",
      "书店",
      "grassland",
      "草原",
      "kitchen",
      "厨房",
      "office",
      "写字楼",
    ],
    failureReason: "The current Lifestyle Scene Library can support cafe entry, counter behavior, and the final interior pause through one continuous CAFE_VISIT scene.",
  },
  {
    id: "waiting-to-office-entrance",
    topics: ["waiting_for_friend"],
    locationWorldId: "OFFICE_ENTRANCE_WAIT",
    sceneAssignments: {
      establish_state: "lifestyle-office-entrance",
      approach_trigger: "lifestyle-office-entrance",
      micro_event: "lifestyle-office-entrance",
      response: "lifestyle-office-entrance",
      after_state: "lifestyle-office-entrance",
    },
    forbiddenMomentTokens: [
      "home",
      "公寓",
      "bookstore",
      "书店",
      "cafe",
      "咖啡",
      "grassland",
      "草原",
      "kitchen",
      "厨房",
      "market",
      "超市",
    ],
    failureReason: "The current Lifestyle Scene Library can support an early-arrival waiting pause through the office-entrance scene without inventing a new location.",
  },
  {
    id: "errand-to-grocery",
    topics: ["returning_with_purchases"],
    locationWorldId: "HOME_ARRIVAL",
    sceneAssignments: {
      establish_state: "lifestyle-returning-home",
      approach_trigger: "lifestyle-returning-home",
      micro_event: "lifestyle-returning-home",
      response: "lifestyle-returning-home",
      after_state: "lifestyle-returning-home",
    },
    forbiddenMomentTokens: [
      "bookstore",
      "书店",
      "cafe",
      "咖啡",
      "grassland",
      "草原",
      "office",
      "写字楼",
      "kitchen",
      "厨房",
    ],
    failureReason: "The current Lifestyle Scene Library supports grocery approach and the connected errand-return entryway as one RETURNING_WITH_PURCHASES world.",
  },
  {
    id: "weekend-alone-to-private-time",
    topics: ["weekend_alone"],
    locationWorldId: "WEEKEND_PRIVATE_TIME",
    sceneAssignments: {
      establish_state: "lifestyle-window-reading",
      approach_trigger: "lifestyle-window-reading",
      micro_event: "lifestyle-window-reading",
      response: "lifestyle-window-reading",
      after_state: "lifestyle-window-reading",
    },
    forbiddenMomentTokens: ["office", "work", "airport", "hotel", "market", "grassland", "party"],
    failureReason: "A quiet home reading space supports the complete private-time narrative without adding a new scene.",
  },
  {
    id: "school-pickup-transition",
    topics: ["after_school_pickup"],
    locationWorldId: "SCHOOL_PICKUP_TRANSITION",
    sceneAssignments: {
      establish_state: "lifestyle-community-path",
      approach_trigger: "lifestyle-city-corner",
      micro_event: "lifestyle-city-corner",
      response: "lifestyle-community-path",
      after_state: "lifestyle-community-path",
    },
    forbiddenMomentTokens: ["airport", "hotel", "office", "work", "market", "classroom", "hospital"],
    failureReason: "The neighborhood path and quiet corner support the adult homeward transition without requiring the child to become a scene subject.",
  },
  {
    id: "weekend-walk-to-neighborhood",
    topics: ["weekend_walk"],
    locationWorldId: "NEIGHBORHOOD_WALK",
    sceneAssignments: {
      establish_state: "lifestyle-community-path",
      approach_trigger: "lifestyle-park-walk",
      micro_event: "lifestyle-park-walk",
      response: "lifestyle-community-path",
      after_state: "lifestyle-park-walk",
    },
    forbiddenMomentTokens: ["airport", "hotel", "office", "work", "market", "grassland", "mountain"],
    failureReason: "Existing community and park paths provide one continuous quiet walking world.",
  },
  {
    id: "after-lunch-to-street",
    topics: ["after_lunch"],
    locationWorldId: "AFTER_LUNCH_STREET",
    sceneAssignments: {
      establish_state: "lifestyle-city-corner",
      approach_trigger: "lifestyle-weekend-city-walk",
      micro_event: "lifestyle-weekend-city-walk",
      response: "lifestyle-city-corner",
      after_state: "lifestyle-weekend-city-walk",
    },
    forbiddenMomentTokens: ["home", "apartment", "office", "work", "airport", "hotel", "bookstore", "market"],
    failureReason: "The street and city-walk scenes support the post-lunch interval without introducing a restaurant interior.",
  },
  {
    id: "city-wandering-to-urban-blocks",
    topics: ["city_wandering"],
    locationWorldId: "URBAN_WANDERING",
    sceneAssignments: {
      establish_state: "lifestyle-city-corner",
      approach_trigger: "lifestyle-business-corner",
      micro_event: "lifestyle-business-corner",
      response: "lifestyle-city-corner",
      after_state: "lifestyle-weekend-city-walk",
    },
    forbiddenMomentTokens: ["home", "apartment", "airport", "hotel", "market", "tourist", "landmark"],
    failureReason: "Existing city-corner, business-corner, and city-walk scenes support task-free urban movement.",
  },
  {
    id: "evening-return-home-to-home-arrival",
    topics: ["evening_return_home"],
    locationWorldId: "EVENING_HOME_RETURN",
    sceneAssignments: {
      establish_state: "lifestyle-city-corner",
      approach_trigger: "lifestyle-residential-building-exit",
      micro_event: "lifestyle-residential-building-exit",
      response: "lifestyle-returning-home",
      after_state: "lifestyle-returning-home",
    },
    forbiddenMomentTokens: ["office", "work", "workday", "overtime", "airport", "hotel", "market"],
    failureReason: "The evening street, residential exit, and return-home threshold support a non-work return without adding a scene.",
  },
  {
    id: "short-local-trip",
    topics: ["short_local_trip"],
    locationWorldId: "SHORT_LOCAL_TRIP",
    sceneAssignments: {
      establish_state: "lifestyle-community-path",
      approach_trigger: "lifestyle-community-path",
      micro_event: "lifestyle-community-path",
      response: "lifestyle-parking-to-office",
      after_state: "lifestyle-office-entrance",
    },
    forbiddenMomentTokens: ["airport", "train station", "flight", "hotel", "suitcase", "vacation", "tourist", "long-distance", "luggage"],
    failureReason: "The community path, the last walking stretch, and the office entrance form one contiguous arrival slice for the short local move.",
  },
];

// Positive visual occupancy is resolved from the existing location world and
// its assigned scene ids. It is prompt language only; it does not add people to
// private scenes or create a new scene/planning layer.
export function resolvedWorldPresenceDescription(locationWorldId: string | null, sceneIds: string[]) {
  const sceneText = sceneIds.join(" ").toLowerCase();
  if (locationWorldId === "CAFE_VISIT" || /cafe|coffee-shop/.test(sceneText)) {
    return "This is an actively operating cafe, not an empty set. A barista is naturally working behind the counter, while a few unrelated customers occupy the seating area or pass naturally through the depth of the room. They remain incidental environmental presence, stay occupied with their own ordinary activity, and do not look toward or interact with the main character.";
  }
  if (locationWorldId === "BOOKSTORE_VISIT" || /bookstore/.test(sceneText)) {
    return "This is an actively operating bookstore, not an empty set. A staff member works in the store while a few unrelated browsers look through shelves or pass naturally through the depth of the space. They remain incidental environmental presence, occupied with ordinary independent activity, and do not look toward or interact with the main character.";
  }
  if (["AFTER_LUNCH_STREET", "URBAN_WANDERING", "NEIGHBORHOOD_WALK", "SCHOOL_PICKUP_TRANSITION"].includes(locationWorldId ?? "") || /city-corner|weekend-city-walk|park-walk|community-path|street|sidewalk/.test(sceneText)) {
    return "This is an actively used public route, not an empty set. A few pedestrians move independently at the frame edge or in the depth of the environment, occupied with ordinary travel and never gathered around the main character.";
  }
  if (/restaurant/.test(sceneText)) {
    return "This is an actively operating restaurant, not an empty set. Staff work naturally in the space while a few diners occupy tables or pass through the depth of the room; they remain incidental and do not engage with the main character.";
  }
  if (/retail|shop|store|mall|grocery|flower|hotel-lobby|station|waiting/.test(sceneText)) {
    return "This is an actively operating public environment, not an empty set. Location-appropriate staff and a few visitors remain naturally present and occupied with ordinary independent activity in the background.";
  }
  if (["HOME_ARRIVAL", "WEEKEND_PRIVATE_TIME"].includes(locationWorldId ?? "") || /returning-home|window-reading|dressing-corner|home-errand-entry/.test(sceneText)) {
    return "This is a private home environment. Keep the room private and do not add unfamiliar people.";
  }
  return null;
}
