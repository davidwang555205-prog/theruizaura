import type { PromptRule } from "../contracts";
import { PromptPriority } from "../contracts";

export const SCENE_PROFILES: Record<string, { label: string; rules: PromptRule[] }> = {
  commute: {
    label: "通勤上班",
    rules: [
      { id: "scene-commute-office", section: "scene", text: "Use a real weekday commute setting near an office entrance, business district corner, or clean parking-to-office walkway. Keep the mood professional but relaxed.", priority: PromptPriority.P4_SCENE_AND_ACTION, source: "scene-profile", appliesWhen: {}, tags: ["scene"] },
    ],
  },
  cafeInterior: {
    label: "咖啡馆内",
    rules: [
      { id: "scene-cafe-interior", section: "scene", text: "Set the image inside a quiet refined cafe with soft daylight, restrained interior details, and a calm daily rhythm. Keep any cup on the table, not held, and avoid influencer cafe styling.", priority: PromptPriority.P4_SCENE_AND_ACTION, source: "scene-profile", appliesWhen: {}, tags: ["scene"] },
    ],
  },
  cafeExterior: {
    label: "咖啡店门口",
    rules: [
      { id: "scene-cafe-exterior", section: "scene", text: "Use a refined cafe-front setting with restrained storefront details, outdoor pavement, soft daylight, and a calm weekend city mood.", priority: PromptPriority.P4_SCENE_AND_ACTION, source: "scene-profile", appliesWhen: {}, tags: ["scene"] },
    ],
  },
  weekendCityWalk: {
    label: "周末城市散步",
    rules: [
      { id: "scene-weekend-walk", section: "scene", text: "Use a quiet city walk setting such as a calm street, light stone wall, boutique storefront, or clean sidewalk. The image should feel relaxed, tasteful, and mature.", priority: PromptPriority.P4_SCENE_AND_ACTION, source: "scene-profile", appliesWhen: {}, tags: ["scene"] },
    ],
  },
  premiumErrands: {
    label: "精品超市 / 日常采购",
    rules: [
      { id: "scene-premium-errands", section: "scene", text: "Use a clean neighborhood-market or premium-grocery setting with paper bags, natural city texture, and a calm daily-living rhythm. Avoid crowded tourist-market styling.", priority: PromptPriority.P4_SCENE_AND_ACTION, source: "scene-profile", appliesWhen: {}, tags: ["scene"] },
    ],
  },
  entrywayDeparture: {
    label: "玄关出门",
    rules: [
      { id: "scene-entryway", section: "scene", text: "Set an entryway departure moment between an indoor hallway and building entrance, with soft threshold light and realistic floor contact.", priority: PromptPriority.P4_SCENE_AND_ACTION, source: "scene-profile", appliesWhen: {}, tags: ["scene"] },
    ],
  },
  galleryExhibition: {
    label: "美术馆",
    rules: [
      { id: "scene-gallery", section: "scene", text: "Use a believable contemporary art museum or gallery interior with correctly spaced artwork, warm-white or soft-stone walls, and quiet visitors kept secondary.", priority: PromptPriority.P4_SCENE_AND_ACTION, source: "scene-profile", appliesWhen: {}, tags: ["scene"] },
    ],
  },
  bookstoreMagazine: {
    label: "书店 / 杂志店门口",
    rules: [
      { id: "scene-bookstore", section: "scene", text: "Use a calm bookstore or magazine-reading street corner with books, magazine texture, soft window light, and restrained cultural detail.", priority: PromptPriority.P4_SCENE_AND_ACTION, source: "scene-profile", appliesWhen: {}, tags: ["scene"] },
    ],
  },
  flowerShop: {
    label: "花店 / 买花",
    rules: [
      { id: "scene-flower-shop", section: "scene", text: "Use a real understated flower-shop exterior with flowers as restrained storefront background detail. Keep hands relaxed and sneakers clear.", priority: PromptPriority.P4_SCENE_AND_ACTION, source: "scene-profile", appliesWhen: {}, tags: ["scene"] },
    ],
  },
  lightSocial: {
    label: "朋友午餐",
    rules: [
      { id: "scene-light-social", section: "scene", text: "Use a calm daytime social meal setting with restrained food cues, natural human presence, and the outfit and sneakers as the visual focus. Avoid staged restaurant advertising.", priority: PromptPriority.P4_SCENE_AND_ACTION, source: "scene-profile", appliesWhen: {}, tags: ["scene"] },
    ],
  },
  mirrorCloset: {
    label: "居家衣帽间",
    rules: [
      { id: "scene-mirror-closet", section: "scene", text: "Use a full-length mirror near a wardrobe corner with natural daylight, clean floor contact, and practical getting-ready details.", priority: PromptPriority.P4_SCENE_AND_ACTION, source: "scene-profile", appliesWhen: {}, tags: ["scene"] },
    ],
  },
  gymInterior: {
    label: "健身房内",
    rules: [
      { id: "scene-gym", section: "scene", text: "Use a clean premium gym or boutique fitness space with muted equipment, warm grey flooring, controlled lighting, and no crowded sports-brand atmosphere.", priority: PromptPriority.P4_SCENE_AND_ACTION, source: "scene-profile", appliesWhen: {}, tags: ["scene"] },
    ],
  },
  studioLaunch: {
    label: "棚内上新拍摄",
    rules: [
      { id: "scene-studio-launch", section: "scene", text: "Use a physically believable professional studio with a seamless backdrop meeting the floor naturally, consistent light direction, accurate material colors, and generous clean negative space.", priority: PromptPriority.P1_PRODUCT_HARD_LOCK, source: "scene-profile", appliesWhen: {}, required: true, tags: ["scene", "studio-lock"] },
    ],
  },
};
