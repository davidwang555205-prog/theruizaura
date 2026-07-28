import { getActivePromptRegistryEntry, type ThemePromptRole } from "./activePromptRegistry";

export type UserContentTopicId =
  | "lifestyle_soft_seeding"
  | "product_development_behind_scenes"
  | "autumn_winter_color_lab"
  | "styling_solution"
  | "material_craft_education"
  | "brand_aesthetic_viewpoint"
  | "launch_conversion"
  | "studio_launch_shoot";

export type TopicExecutionMode = "image_routing_required";
export type TopicRoute = {
  topicId: UserContentTopicId;
  userFacingLabel: string;
  userSelectable: true;
  executionMode: TopicExecutionMode;
  requiredVisualRoleIds: ThemePromptRole[];
  optionalVisualRoleIds: ThemePromptRole[];
  anchorRefs: string[];
  provider: "image2";
  preservesOriginalTopicId: true;
  activePromptResolution: "via_active_prompt_registry";
  status: "active";
};

export const topicRoutingRegistryVersion = "topic-routing-registry-v1";
export const topicRoutingRegistry: TopicRoute[] = [
  { topicId: "lifestyle_soft_seeding", userFacingLabel: "生活场景软种草", userSelectable: true, executionMode: "image_routing_required", requiredVisualRoleIds: ["A1", "A2"], optionalVisualRoleIds: ["A3", "C2"], anchorRefs: ["A1", "A2", "A3", "A4"], provider: "image2", preservesOriginalTopicId: true, activePromptResolution: "via_active_prompt_registry", status: "active" },
  { topicId: "product_development_behind_scenes", userFacingLabel: "产品开发幕后", userSelectable: true, executionMode: "image_routing_required", requiredVisualRoleIds: ["C4", "C5"], optionalVisualRoleIds: ["C3"], anchorRefs: ["C3", "C4", "C5"], provider: "image2", preservesOriginalTopicId: true, activePromptResolution: "via_active_prompt_registry", status: "active" },
  { topicId: "autumn_winter_color_lab", userFacingLabel: "秋冬配色实验室", userSelectable: true, executionMode: "image_routing_required", requiredVisualRoleIds: ["C3", "C5"], optionalVisualRoleIds: ["C1", "C4"], anchorRefs: ["C1", "C3", "C4", "C5"], provider: "image2", preservesOriginalTopicId: true, activePromptResolution: "via_active_prompt_registry", status: "active" },
  { topicId: "styling_solution", userFacingLabel: "穿搭解决方案", userSelectable: true, executionMode: "image_routing_required", requiredVisualRoleIds: ["A1", "A2", "B3", "B4"], optionalVisualRoleIds: ["C2"], anchorRefs: ["A1", "A2", "B3", "B4", "C2"], provider: "image2", preservesOriginalTopicId: true, activePromptResolution: "via_active_prompt_registry", status: "active" },
  { topicId: "material_craft_education", userFacingLabel: "材质工艺认知", userSelectable: true, executionMode: "image_routing_required", requiredVisualRoleIds: ["C4", "C5"], optionalVisualRoleIds: ["C1", "C3"], anchorRefs: ["C1", "C3", "C4", "C5"], provider: "image2", preservesOriginalTopicId: true, activePromptResolution: "via_active_prompt_registry", status: "active" },
  { topicId: "brand_aesthetic_viewpoint", userFacingLabel: "品牌审美观点", userSelectable: true, executionMode: "image_routing_required", requiredVisualRoleIds: ["A2", "A3", "B3"], optionalVisualRoleIds: ["C1"], anchorRefs: ["A2", "A3", "B3", "C1"], provider: "image2", preservesOriginalTopicId: true, activePromptResolution: "via_active_prompt_registry", status: "active" },
  { topicId: "launch_conversion", userFacingLabel: "上新活动转化", userSelectable: true, executionMode: "image_routing_required", requiredVisualRoleIds: ["B3", "C1", "C3"], optionalVisualRoleIds: ["B4", "C2", "C4", "C5"], anchorRefs: ["B3", "C1", "C3", "B4", "C2", "C4", "C5"], provider: "image2", preservesOriginalTopicId: true, activePromptResolution: "via_active_prompt_registry", status: "active" },
  { topicId: "studio_launch_shoot", userFacingLabel: "棚内上新拍摄", userSelectable: true, executionMode: "image_routing_required", requiredVisualRoleIds: ["B3", "B4", "C1"], optionalVisualRoleIds: ["C2", "C3", "C4", "C5"], anchorRefs: ["B3", "B4", "C1", "C2", "C3", "C4", "C5"], provider: "image2", preservesOriginalTopicId: true, activePromptResolution: "via_active_prompt_registry", status: "active" }
];

const topicByLabel = new Map(topicRoutingRegistry.map((route) => [route.userFacingLabel, route]));
export function resolveTopicRoute(label: string): TopicRoute {
  const route = topicByLabel.get(label);
  if (!route) throw new Error(`Unregistered user content topic: ${label}.`);
  return route;
}

export function resolveTopicRoleBundle(label: string, imageCount: number): { route: TopicRoute; roleIds: ThemePromptRole[]; promptVersions: string[] } {
  const route = resolveTopicRoute(label);
  const roleIds = [...route.requiredVisualRoleIds, ...route.optionalVisualRoleIds].slice(0, Math.max(route.requiredVisualRoleIds.length, imageCount));
  if (roleIds.length === 0 || roleIds.length < route.requiredVisualRoleIds.length) throw new Error(`Incomplete visual role bundle for ${label}.`);
  const promptVersions = roleIds.map((roleId) => getActivePromptRegistryEntry(roleId).activeVersionId);
  return { route, roleIds, promptVersions };
}

export function validateTopicRoutingRegistry(): void {
  if (topicRoutingRegistry.length !== 8) throw new Error("Topic Routing Registry must contain 8 user topics.");
  const labels = new Set<string>();
  const ids = new Set<string>();
  for (const route of topicRoutingRegistry) {
    if (ids.has(route.topicId) || labels.has(route.userFacingLabel)) throw new Error("Topic IDs and labels must be unique.");
    ids.add(route.topicId); labels.add(route.userFacingLabel);
    if (route.provider !== "image2" || route.activePromptResolution !== "via_active_prompt_registry" || !route.preservesOriginalTopicId) throw new Error(`Invalid route metadata for ${route.topicId}.`);
    const roles = [...route.requiredVisualRoleIds, ...route.optionalVisualRoleIds];
    if (roles.some((role) => ["A4", "B1", "B2"].includes(role) || !getActivePromptRegistryEntry(role))) throw new Error(`Invalid runtime role in ${route.topicId}.`);
    if (!route.requiredVisualRoleIds.length) throw new Error(`Missing required visual role for ${route.topicId}.`);
  }
}

validateTopicRoutingRegistry();
