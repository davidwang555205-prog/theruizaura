import type { LightingSpaceType } from "../data/sceneLightingSpaceProfiles";
import {
  backgroundDensityLines,
  getDefaultBackgroundDensity,
  getVisualScenarioDetailPool,
  type BackgroundDensity
} from "../data/visualScenarioProfiles";
import type { StandardSceneKey } from "../data/outfitDiversityRules";
import type { TeamImageType, TeamScenePreference } from "../types";

export type VisualScenario = {
  backgroundDensity: BackgroundDensity;
  backgroundDensityLine: string;
  livedInDetailLine: string;
  coherenceLine: string;
  scenarioLine: string;
};

function getCoherenceLine(imageType: TeamImageType) {
  if (imageType === "产品静物图" || imageType === "拍摄花絮 / 材质图") {
    return "Capture one coherent real-camera product or material moment: product scale, surface, light, shadows, material texture, object contact, and background must align naturally, with no floating product or staged AI set.";
  }
  if (imageType === "非产品氛围图") {
    return "Capture one coherent real-camera atmosphere moment: location, light, objects, surfaces, shadows, and background must align naturally, with no random decorative filler or staged AI set.";
  }

  return "Capture one coherent real-camera moment: location, light, action, gaze, hands, clothing, and background must align naturally, with no pasted subject or staged AI set.";
}

function hashText(value: string) {
  return Array.from(value).reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 2166136261);
}

function resolveDensity(sceneKey: StandardSceneKey, scenePreference: string, nonce: number): BackgroundDensity {
  const base = getDefaultBackgroundDensity(sceneKey, scenePreference);
  if (base !== "normalDaily") return base;
  const streetLike = ![
    "studioLaunch",
    "stillLife",
    "materialTable",
    "mirrorCloset",
    "entrywayDeparture",
    "hotelTravel",
    "gymInterior",
    "atmosphere"
  ].includes(sceneKey);

  if (!streetLike) return base;
  return nonce % 4 === 3 ? "lightActivity" : nonce % 5 === 2 ? "quietDaily" : "normalDaily";
}

export function buildVisualScenario(input: {
  imageType: TeamImageType;
  scenePreference: Exclude<TeamScenePreference, "自动匹配">;
  sceneKey: StandardSceneKey;
  lightingSpaceType: LightingSpaceType;
  cityProfile?: string | null;
  timeOfDay?: string;
  generationNonce?: number;
}): VisualScenario {
  const nonce = Math.max(0, input.generationNonce ?? 0);
  const details = getVisualScenarioDetailPool(input.sceneKey, input.scenePreference);
  const detailIndex = (hashText(`${input.sceneKey}:${input.imageType}:${input.cityProfile ?? ""}`) + nonce) % details.length;
  const backgroundDensity = resolveDensity(input.sceneKey, input.scenePreference, nonce);
  const backgroundDensityLine = backgroundDensityLines[backgroundDensity];
  const livedInDetailLine = details[detailIndex];
  const coherenceLine = getCoherenceLine(input.imageType);

  return {
    backgroundDensity,
    backgroundDensityLine,
    livedInDetailLine,
    coherenceLine,
    scenarioLine: [coherenceLine, backgroundDensityLine, livedInDetailLine].join(" ")
  };
}
