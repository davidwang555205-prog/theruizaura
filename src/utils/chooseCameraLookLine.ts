import type { TeamImageType } from "../types";
import { cameraLookProfiles, type CameraLookName } from "../data/cameraLookProfiles";
import type { ChinaCityProfile } from "../data/chinaUrbanStreetProfiles";
import type { StandardSceneKey } from "../data/outfitDiversityRules";

function getUserCameraPreference(extra: string): CameraLookName | null {
  if (/Leica|徕卡/i.test(extra)) return "Leica";
  if (/Hasselblad|哈苏/i.test(extra)) return "Hasselblad";
  if (/Fujifilm|富士/i.test(extra)) return "Fujifilm";
  return null;
}

function chooseByCity(city: ChinaCityProfile | null): CameraLookName | null {
  if (city === "Shanghai" || city === "Shenzhen" || city === "GenericChineseCity") return "Leica";
  if (city === "Hangzhou" || city === "Chengdu") return "Fujifilm";
  if (city === "Beijing") return "Leica";
  return null;
}

export function chooseCameraLookLine(input: {
  imageType: TeamImageType;
  sceneKey: StandardSceneKey;
  city: ChinaCityProfile | null;
  userExtraRequirement: string;
}) {
  const userCamera = getUserCameraPreference(input.userExtraRequirement);
  let camera: CameraLookName | null = userCamera;

  if (!camera) {
    if (input.imageType === "产品静物图" || input.sceneKey === "stillLife") camera = "Hasselblad";
    else if (input.sceneKey === "hotelTravel" || input.sceneKey === "galleryExhibition") camera = "Hasselblad";
    else if (input.imageType === "对镜穿搭图" || input.sceneKey === "premiumErrands" || input.sceneKey === "flowerShop" || input.sceneKey === "bakeryDessert") {
      camera = "Fujifilm";
    } else if (input.sceneKey === "gymInterior") {
      camera = input.userExtraRequirement.includes("空间") ? "Hasselblad" : "Leica";
    } else {
      camera = chooseByCity(input.city) ?? "Leica";
    }
  }

  return {
    camera,
    cameraLookLine: cameraLookProfiles[camera]
  };
}
