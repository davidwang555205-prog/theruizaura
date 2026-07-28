# THERUIZ AURA Phase 3-E2｜User Topic to Visual Role Routing

Status: `IMPLEMENTED_AND_VERIFIED`

Release readiness: `RESTORED`

Provider: `Image2 only`

This phase adds the missing explicit routing layer. User topics do not contain Prompt text and do not choose `new`, `old` or `repaired_new` directly. They resolve to a Visual Role Bundle, and each role resolves through the existing sole Active Prompt Registry.

## Topic routes

| User topic | Execution mode | Required roles | Optional roles | Active Prompt resolution |
|---|---|---|---|---|
| 生活场景软种草 | image_routing_required | A1, A2 | A3, C2 | A1 new, A2 old, A3 new, C2 new |
| 产品开发幕后 | image_routing_required | C4, C5 | C3 | C4 new, C5 repaired_new, C3 new |
| 秋冬配色实验室 | image_routing_required | C3, C5 | C1, C4 | C3 new, C5 repaired_new, C1 old, C4 new |
| 穿搭解决方案 | image_routing_required | A1, A2, B3, B4 | C2 | A1 new, A2 old, B3 new, B4 new, C2 new |
| 材质工艺认知 | image_routing_required | C4, C5 | C1, C3 | C4 new, C5 repaired_new, C1 old, C3 new |
| 品牌审美观点 | image_routing_required | A2, A3, B3 | C1 | A2 old, A3 new, B3 new, C1 old |
| 上新活动转化 | image_routing_required | B3, C1, C3 | B4, C2, C4, C5 | B3 new, C1 old, C3 new, B4 new, C2 new, C4 new, C5 repaired_new |
| 棚内上新拍摄 | image_routing_required | B3, B4, C1 | C2, C3, C4, C5 | B3 new, B4 new, C1 old, C2 new, C3 new, C4 new, C5 repaired_new |

`棚内上新拍摄` retains its own topic ID and provenance. The previous copy-layer mapping to `上新活动转化` is not used as visual routing.

## Runtime and provenance

`src/utils/generateSoftSeedingContent.ts` now resolves each selected topic through `topicRoutingRegistry.ts`. Every generated image plan records:

- `originalUserTopicId`;
- `userFacingTopicLabel`;
- `resolvedVisualRoleId`;
- `activePromptSource = active_prompt_registry`;
- the resolved active Prompt version ID;
- `provider = image2`;
- `routingRegistryVersion`.

The route layer does not hard-code Prompt text or Prompt version choices. It fails closed for unknown topics, empty bundles, unknown roles, missing required roles, non-Image2 providers and forbidden runtime roles.

## Role boundary

A4, B1 and B2 remain approved visual anchors only. They are not required or optional runtime roles in this registry. The 8 user topics do not require independent A4/B1/B2 generation, so `RUNTIME_ROLE_CALIBRATION_REQUIRED` is not triggered.

No user-selectable topic silently falls back to another topic, and no role uses a `new by default` rule. The Active Prompt Registry remains the only source of Prompt version selection.

## Coverage result

- `USER_TOPIC_ROUTING = 8 / 8`
- `IMAGE_ROUTING_COVERAGE = COMPLETE`
- `ACTIVE_ROLE_REFERENCES_VALID = YES`
- `UNREGISTERED_RUNTIME_ROLES = 0`
- `ORIGINAL_TOPIC_PROVENANCE_PRESERVED = YES`
- `USER_THEME_REGISTRY_COVERAGE = COMPLETE`
- Phase 3-F: `NOT_STARTED`
- Push / PR / merge / deployment: not performed in this phase
