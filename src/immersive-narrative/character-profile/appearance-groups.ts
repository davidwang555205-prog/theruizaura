import type { AppearanceGroup } from "./types";

export const APPEARANCE_GROUPS: AppearanceGroup[] = [
  {
    id: "asian",
    label: "亚裔",
    visualGuidance: [
      "natural Asian facial variation",
      "realistic skin tone range",
      "realistic dark-to-medium hair range by default",
      "natural facial asymmetry",
      "adult proportions appropriate to the selected age profile",
    ],
    prohibitedInferences: [
      "specific nationality",
      "cultural styling",
      "automatic East Asian decorative motifs",
      "automatic black-straight-long hair",
      "automatic pale skin",
      "automatic sweetness",
    ],
    status: "ACTIVE",
  },
  {
    id: "european",
    label: "欧裔",
    visualGuidance: [
      "broad European facial variation",
      "realistic fair-to-olive skin range",
      "varied natural hair colors and textures",
      "natural facial asymmetry",
      "adult proportions appropriate to the selected age profile",
    ],
    prohibitedInferences: [
      "automatic French, Nordic, or Italian styling",
      "default blonde hair",
      "default pale skin",
      "default fashion-model face",
      "default luxury lifestyle",
    ],
    status: "ACTIVE",
  },
  {
    id: "latin_american",
    label: "拉丁美裔",
    visualGuidance: [
      "broad Latin American facial variation",
      "realistic light-to-deep skin tone range",
      "varied dark-to-medium hair colors and natural textures",
      "natural facial asymmetry",
      "adult proportions appropriate to the selected age profile",
    ],
    prohibitedInferences: [
      "sensual stereotype",
      "exaggerated curves",
      "passionate personality inference",
      "default heavy makeup",
      "default cultural costume",
      "specific nationality",
    ],
    status: "ACTIVE",
  },
];
