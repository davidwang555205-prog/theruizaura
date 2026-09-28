import { lifestyleSoftSeedingScenePool } from "../../data/lifestyleSoftSeedingScenePool";
import type {
  SceneResolverLocationWorld,
  SceneResolverRule,
  SceneResolverSceneEntry,
} from "./types";

export type LocationWorldTruth = {
  category: string;
  allowedEnvironmentContent: string[];
  ambientActivity: string[];
  routeGeometry: "existing_scene_geometry" | "private_room" | "threshold_continuity";
  publicSpace: boolean;
  protagonistReadyGuard?: string;
  routeGeometryLine?: string;
  forbiddenDominantEnvironmentSignals?: string[];
};

// The referenced footwear is role-bound to the protagonist. It never becomes a
// storefront, shelf, poster, prop, or another person's identical product.
export const PRODUCT_WORLD_EXCLUSIONS = [
  "referenced footwear merchandise",
  "shoe displays",
  "shoe shelves",
  "footwear posters or packaging",
  "duplicated protagonist footwear",
  "another person's identical footwear",
];

const PUBLIC_ROUTE_CONTENT = [
  "ordinary paving and street furniture",
  "existing building and shopfront lines",
  "vegetation, benches, and route geometry already present",
];

const HOME_CONTENT = [
  "domestic furniture and ordinary home objects",
  "existing doors, walls, light, and surfaces",
  "location-consistent residential objects",
];

const LOCATION_WORLD_TRUTH: Record<string, LocationWorldTruth> = {
  HOME_ARRIVAL: {
    category: "returning-home threshold",
    allowedEnvironmentContent: HOME_CONTENT,
    ambientActivity: ["ordinary domestic light and room tone stay continuous"],
    routeGeometry: "threshold_continuity",
    publicSpace: false,
  },
  LEAVING_HOME: {
    category: "home departure and building exit",
    allowedEnvironmentContent: ["entryway furniture and objects", "residential door and exterior surfaces", "ordinary building-exit surroundings"],
    ambientActivity: ["no unfamiliar people enter the private entry area"],
    routeGeometry: "threshold_continuity",
    publicSpace: false,
  },
  BOOKSTORE_VISIT: {
    category: "bookstore",
    allowedEnvironmentContent: [
      "books, magazines, and printed reading material",
      "stationery and book-related displays",
      "shelves, reading tables, and ordinary bookstore signage",
    ],
    ambientActivity: [
      "staff shelving books",
      "one customer browsing deeper inside",
      "a page turning or a person crossing behind shelving",
    ],
    routeGeometry: "existing_scene_geometry",
    publicSpace: true,
    routeGeometryLine: "Existing shelving and display geometry shapes the approach; the protagonist is not locked to a center showcase position.",
    protagonistReadyGuard: "The window and shelf displays contain reading material, never footwear. The character stops to look at the bookstore display, not at a shoe display.",
    forbiddenDominantEnvironmentSignals: ["dominant cafe counter and coffee-service identity"],
  },
  CAFE_VISIT: {
    category: "cafe",
    allowedEnvironmentContent: [
      "coffee service and food",
      "cafe furniture, counters, and ordinary operation",
      "location-consistent cafe objects and light",
    ],
    ambientActivity: [
      "barista is naturally working behind the counter",
      "a few unrelated customers occupy the seating area or pass through the depth of the room",
      "one existing customer shifting a chair",
      "a person crossing deeper background",
      "cups being placed and ordinary cafe circulation",
    ],
    routeGeometry: "existing_scene_geometry",
    publicSpace: true,
    routeGeometryLine: "Existing counter, table, and chair geometry shapes the approach; furniture and independent activity may partially interrupt the route. The protagonist is not locked to a cleared center aisle.",
    protagonistReadyGuard: "Existing tables, chairs, and independent activity may partially interrupt the sightline or approach. The open seat needs enough evidence to be recognized, not a cleared hero runway.",
    forbiddenDominantEnvironmentSignals: ["dominant bookstore shelving", "bookstore window or display identity", "reading-store signage"],
  },
  OFFICE_ENTRANCE_WAIT: {
    category: "office-entrance wait",
    allowedEnvironmentContent: ["office entrance and facade", "ordinary street surfaces and furniture", "location-consistent building signage"],
    ambientActivity: ["a distant pedestrian", "ordinary public movement at the edge of the space"],
    routeGeometry: "existing_scene_geometry",
    publicSpace: true,
  },
  RETURNING_WITH_PURCHASES: {
    category: "returning-home route",
    allowedEnvironmentContent: HOME_CONTENT,
    ambientActivity: ["ordinary room tone and existing light stay continuous"],
    routeGeometry: "threshold_continuity",
    publicSpace: false,
  },
  WEEKEND_PRIVATE_TIME: {
    category: "private reading room",
    allowedEnvironmentContent: HOME_CONTENT,
    ambientActivity: ["the private room stays private with no added people"],
    routeGeometry: "private_room",
    publicSpace: false,
  },
  SCHOOL_PICKUP_TRANSITION: {
    category: "neighborhood homeward route",
    allowedEnvironmentContent: PUBLIC_ROUTE_CONTENT,
    ambientActivity: ["a distant pedestrian", "a person crossing another route in the background"],
    routeGeometry: "existing_scene_geometry",
    publicSpace: true,
  },
  NEIGHBORHOOD_WALK: {
    category: "neighborhood walking route",
    allowedEnvironmentContent: PUBLIC_ROUTE_CONTENT,
    ambientActivity: ["a distant pedestrian", "ordinary public movement on another path", "leaves or low ambient public motion where the location allows"],
    routeGeometry: "existing_scene_geometry",
    publicSpace: true,
  },
  AFTER_LUNCH_STREET: {
    category: "city street",
    allowedEnvironmentContent: PUBLIC_ROUTE_CONTENT,
    ambientActivity: ["a distant pedestrian", "ordinary background traffic or public movement where the location allows"],
    routeGeometry: "existing_scene_geometry",
    publicSpace: true,
  },
  URBAN_WANDERING: {
    category: "urban block route",
    allowedEnvironmentContent: PUBLIC_ROUTE_CONTENT,
    ambientActivity: ["a distant pedestrian", "a person crossing another route in the background", "ordinary independent city movement"],
    routeGeometry: "existing_scene_geometry",
    publicSpace: true,
  },
  EVENING_HOME_RETURN: {
    category: "evening residential route",
    allowedEnvironmentContent: [...PUBLIC_ROUTE_CONTENT, ...HOME_CONTENT],
    ambientActivity: ["a distant pedestrian on the early route", "ordinary residential light and room tone at the threshold"],
    routeGeometry: "threshold_continuity",
    publicSpace: false,
  },
  SHORT_LOCAL_TRIP: {
    category: "short local route",
    allowedEnvironmentContent: PUBLIC_ROUTE_CONTENT,
    ambientActivity: ["a distant pedestrian", "ordinary public movement on another path"],
    routeGeometry: "existing_scene_geometry",
    publicSpace: true,
  },
};

export function locationWorldTruthOf(locationWorldId: string | null, sceneIds: string[] = []) {
  const explicit = locationWorldId ? LOCATION_WORLD_TRUTH[locationWorldId] : undefined;
  const truth = explicit ?? LOCATION_WORLD_TRUTH[locationWorldId ?? ""] ?? null;
  if (truth) {
    return {
      ...truth,
      allowedEnvironmentContent: [...truth.allowedEnvironmentContent],
      ambientActivity: [...truth.ambientActivity],
      excludedEnvironmentContent: [...PRODUCT_WORLD_EXCLUSIONS],
    };
  }
  const sceneText = sceneIds.join(" ").toLowerCase();
  if (/bookstore/.test(sceneText)) return locationWorldTruthOf("BOOKSTORE_VISIT", sceneIds);
  if (/cafe|coffee-shop/.test(sceneText)) return locationWorldTruthOf("CAFE_VISIT", sceneIds);
  if (/returning-home|window-reading|dressing-corner|home-errand-entry/.test(sceneText)) {
    return {
      category: "private home environment",
      allowedEnvironmentContent: [...HOME_CONTENT],
      ambientActivity: ["the private room stays private with no added people"],
      routeGeometry: "private_room" as const,
      publicSpace: false,
      excludedEnvironmentContent: [...PRODUCT_WORLD_EXCLUSIONS],
    };
  }
  return {
    category: "public environment",
    allowedEnvironmentContent: [...PUBLIC_ROUTE_CONTENT],
    ambientActivity: ["a few independent background visitors or pedestrians occupied with ordinary activity"],
    routeGeometry: "existing_scene_geometry" as const,
    publicSpace: true,
    excludedEnvironmentContent: [...PRODUCT_WORLD_EXCLUSIONS],
  };
}

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
  const truth = locationWorldTruthOf(locationWorldId, sceneIds);
  const routeLike = /route|street|entrance|block|walking/i.test(truth.category);
  const occupancy = truth.publicSpace
    ? `${routeLike ? "This is an actively used public route, not an empty set." : `This is an actively operating ${truth.category}, not an empty set.`} ${truth.ambientActivity.join("; ")}${routeLike ? ". A few pedestrians move independently at the frame edge or in the depth of the environment, occupied with ordinary travel and never gathered around the main character" : ""}. All background activity is incidental, low-intensity, independent, and never becomes a narrative event.`
    : `This is a private home environment. Keep the room private and do not add unfamiliar people. ${truth.ambientActivity.join("; ")}.`;
  const lines = [
    occupancy,
    `Location content: ${truth.allowedEnvironmentContent.join(", ")}. The location keeps its own real-world merchandise and objects. ${truth.excludedEnvironmentContent.join(", ")} must not appear anywhere in the environment.`,
  ];
  if (truth.forbiddenDominantEnvironmentSignals?.length) {
    lines.push(`Do not give this location the dominant identity of another category: ${truth.forbiddenDominantEnvironmentSignals.join(", ")}. Realistic possibility does not automatically become the selected location identity.`);
  }
  if (truth.routeGeometryLine) {
    lines.push(truth.routeGeometryLine);
  } else if (truth.publicSpace && truth.routeGeometry === "existing_scene_geometry") {
    lines.push("The existing scene geometry sets the route: sidewalk edges, building and shopfront lines, tree lines, benches, and path junctions create a naturally off-axis course. The protagonist is not locked to an optical center or a symmetric vanishing line.");
  }
  if (truth.protagonistReadyGuard) {
    lines.push(truth.protagonistReadyGuard);
  }
  return lines.join(" ");
}
