import type { TeamImageType, TeamSeason } from "../types";
import { cameraLookProfiles, type CameraLookName } from "../data/cameraLookProfiles";
import type { ChinaCityProfile } from "../data/chinaUrbanStreetProfiles";
import type { StandardSceneKey } from "../data/outfitDiversityRules";
import type { LightingSpaceType } from "../data/sceneLightingSpaceProfiles";

function getUserCameraPreference(extra: string): CameraLookName | null {
  if (/Leica|徕卡/i.test(extra)) return "Leica";
  if (/Hasselblad|哈苏/i.test(extra)) return "Hasselblad";
  if (/Fujifilm|富士/i.test(extra)) return "Fujifilm";
  if (/Sony|索尼/i.test(extra)) return "Sony";
  return null;
}

function wantsModernClarity(extra: string) {
  return /更清晰|现代清晰|清楚一点|clean modern|modern clarity|crisp|clear detail|autofocus|commercial clarity/i.test(extra);
}

function chooseByCity(cityProfile: ChinaCityProfile | null): CameraLookName | null {
  if (cityProfile === "Shenzhen") return "Sony";
  if (cityProfile === "Shanghai" || cityProfile === "GenericChineseCity") return "Leica";
  if (cityProfile === "Hangzhou" || cityProfile === "Chengdu") return "Fujifilm";
  if (cityProfile === "Beijing") return "Leica";
  return null;
}

function isModernSonyScene(input: { sceneKey: StandardSceneKey; cityProfile: ChinaCityProfile | null; userExtraRequirement: string }) {
  return (
    input.sceneKey === "gymCommute" ||
    input.sceneKey === "gymInterior" ||
    input.sceneKey === "premiumErrands" ||
    (input.sceneKey === "boutiqueStreet" && input.cityProfile === "Shenzhen") ||
    (/现代街区|商业综合体|玻璃门店|高级健身房|modern street|commercial complex|glass storefront/i.test(input.userExtraRequirement) &&
      input.cityProfile === "Shenzhen")
  );
}

function chooseIndoorCommercialCamera(input: {
  sceneKey: StandardSceneKey;
  cityProfile: ChinaCityProfile | null;
  userExtraRequirement: string;
}) {
  if (input.sceneKey === "premiumErrands") return "Sony";
  if (input.sceneKey === "gymInterior" || input.sceneKey === "gymCommute") return "Sony";
  if (input.sceneKey === "boutiqueStreet") return "Sony";
  if (input.sceneKey === "galleryExhibition") return "Hasselblad";
  if (input.sceneKey === "bookstoreMagazine" || input.sceneKey === "cafeExterior" || input.sceneKey === "bakeryDessert") {
    return wantsModernClarity(input.userExtraRequirement) ? "Leica" : "Fujifilm";
  }
  return input.cityProfile === "Shenzhen" || wantsModernClarity(input.userExtraRequirement) ? "Sony" : "Fujifilm";
}

function chooseBySeasonAndScene(input: {
  sceneKey: StandardSceneKey;
  season?: TeamSeason;
  imageType: TeamImageType;
  cityProfile: ChinaCityProfile | null;
  userExtraRequirement: string;
}) {
  const materialOrStillLife =
    input.imageType === "产品静物图" ||
    input.sceneKey === "stillLife" ||
    input.sceneKey === "materialTable" ||
    /材质|微距|细节|material|macro|texture/i.test(input.userExtraRequirement);

  if (materialOrStillLife) {
    return wantsModernClarity(input.userExtraRequirement) ? "Sony" : "Hasselblad";
  }
  if ((input.season === "秋" || input.season === "冬") && /针织|外套|材质|texture|coat|knit/i.test(input.userExtraRequirement)) {
    return "Hasselblad";
  }
  if (input.sceneKey === "mirrorCloset" || input.imageType === "对镜穿搭图") return "Fujifilm";
  if (input.sceneKey === "weekendCityWalk" || input.sceneKey === "cafeExterior" || input.sceneKey === "boutiqueStreet") return "Leica";
  if (isModernSonyScene(input)) return "Sony";
  return chooseByCity(input.cityProfile) ?? "Leica";
}

function chooseByLightingSpace(input: {
  imageType: TeamImageType;
  sceneKey: StandardSceneKey;
  season?: TeamSeason;
  cityProfile: ChinaCityProfile | null;
  lightingSpaceType?: LightingSpaceType;
  userExtraRequirement: string;
}) {
  if (input.lightingSpaceType === "stillLifeStudioNatural") {
    return wantsModernClarity(input.userExtraRequirement) ? "Sony" : "Hasselblad";
  }
  if (input.lightingSpaceType === "studioLaunchLight") {
    return wantsModernClarity(input.userExtraRequirement) ? "Sony" : "Hasselblad";
  }
  if (input.lightingSpaceType === "indoorGymLight") return "Sony";
  if (input.lightingSpaceType === "indoorNaturalLight") {
    return wantsModernClarity(input.userExtraRequirement) ? "Sony" : "Fujifilm";
  }
  if (input.lightingSpaceType === "indoorCommercialLight") return chooseIndoorCommercialCamera(input);
  if (input.lightingSpaceType === "semiIndoorThreshold") {
    return isModernSonyScene(input) || wantsModernClarity(input.userExtraRequirement) ? "Sony" : "Leica";
  }
  if (input.lightingSpaceType === "outdoorStreet") {
    if (isModernSonyScene(input)) return "Sony";
    if (input.sceneKey === "weekendCityWalk" || input.sceneKey === "cafeExterior" || input.sceneKey === "boutiqueStreet") return "Leica";
    return chooseByCity(input.cityProfile) ?? "Leica";
  }

  return chooseBySeasonAndScene(input);
}

export function chooseCameraLookLine(input: {
  imageType: TeamImageType;
  sceneKey: StandardSceneKey;
  season?: TeamSeason;
  city?: ChinaCityProfile | null;
  cityProfile?: ChinaCityProfile | null;
  lightingSpaceType?: LightingSpaceType;
  userExtraRequirement: string;
}) {
  const cityProfile = input.cityProfile ?? input.city ?? null;
  const userCamera = getUserCameraPreference(input.userExtraRequirement);
  const camera = userCamera ?? chooseByLightingSpace({ ...input, cityProfile });
  const profile = cameraLookProfiles[camera];

  return {
    camera,
    cameraLookProfile: camera,
    cameraLookLine: profile.cameraLookLine,
    cameraNegativeLine: profile.cameraNegativeLine
  };
}
