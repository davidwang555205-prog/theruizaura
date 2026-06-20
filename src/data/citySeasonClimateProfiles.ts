import type { ChinaCityProfile } from "./chinaUrbanStreetProfiles";

export type LayerWeight = "lightLayer" | "mediumLayer" | "warmLayer" | "coldLayer";

export type CitySeasonClimateProfile = {
  cities: ChinaCityProfile[];
  climateMood: string;
  autumnLayerWeight: LayerWeight | "mediumLayer or warmLayer" | "lightLayer";
  winterLayerWeight: LayerWeight | "mediumLayer or warmLayer" | "lightLayer or mediumLayer";
  preferredMaterials: string[];
  forbidden: string[];
};

export const citySeasonClimateProfiles = {
  coldDryWinter: {
    cities: ["Beijing"],
    climateMood: "cold dry northern city winter",
    autumnLayerWeight: "mediumLayer or warmLayer",
    winterLayerWeight: "coldLayer",
    preferredMaterials: [
      "wool coat",
      "cashmere-like knit",
      "warm knit",
      "soft scarf",
      "tailored trousers",
      "dark denim",
      "straight wool trousers",
      "structured outerwear"
    ],
    forbidden: [
      "visible ankle",
      "thin summer top",
      "sleeveless top alone",
      "light linen look",
      "sandals mood",
      "overly warm southern styling"
    ]
  },
  coolHumidWinter: {
    cities: ["Shanghai", "Hangzhou"],
    climateMood: "cool humid city winter",
    autumnLayerWeight: "mediumLayer",
    winterLayerWeight: "warmLayer",
    preferredMaterials: [
      "light wool coat",
      "trench coat",
      "soft cardigan",
      "fine-knit top",
      "wool-blend jacket",
      "straight trousers",
      "dark denim",
      "midi skirt with thin socks",
      "layered shirt and knit"
    ],
    forbidden: ["oversized puffer", "heavy snow outfit", "northern winter heaviness", "exposed summer styling"]
  },
  mildUrbanWinter: {
    cities: ["Chengdu"],
    climateMood: "mild relaxed urban winter",
    autumnLayerWeight: "mediumLayer",
    winterLayerWeight: "mediumLayer or warmLayer",
    preferredMaterials: [
      "soft knit cardigan",
      "light wool jacket",
      "relaxed coat",
      "dark denim",
      "warm beige trousers",
      "layered shirt",
      "light scarf",
      "textured knit"
    ],
    forbidden: ["heavy snow coat", "overly formal winter coat", "too northern styling", "tourist hotpot-street clutter"]
  },
  warmLightWinter: {
    cities: ["Shenzhen"],
    climateMood: "warm light southern winter",
    autumnLayerWeight: "lightLayer",
    winterLayerWeight: "lightLayer or mediumLayer",
    preferredMaterials: [
      "light jacket",
      "clean knit tee",
      "thin cardigan",
      "cotton jacket",
      "straight trousers",
      "denim",
      "light active layer",
      "clean long-sleeve top"
    ],
    forbidden: ["heavy wool coat", "scarf-heavy outfit", "thick winter boots mood", "puffer jacket", "northern winter styling"]
  },
  balancedChineseWinter: {
    cities: ["GenericChineseCity"],
    climateMood: "balanced Chinese city winter",
    autumnLayerWeight: "mediumLayer",
    winterLayerWeight: "warmLayer",
    preferredMaterials: [
      "light wool jacket",
      "fine-knit top",
      "straight trousers",
      "dark denim",
      "trench coat",
      "soft cardigan",
      "wool-blend layer"
    ],
    forbidden: ["extreme winter outfit", "under-layered summer styling", "too region-specific outfit"]
  }
} satisfies Record<string, CitySeasonClimateProfile>;

export function getCitySeasonClimateProfile(city: ChinaCityProfile | null | undefined) {
  const normalizedCity = city ?? "GenericChineseCity";
  const profiles: CitySeasonClimateProfile[] = Object.values(citySeasonClimateProfiles);
  return (
    profiles.find((profile) => profile.cities.includes(normalizedCity)) ??
    citySeasonClimateProfiles.balancedChineseWinter
  );
}
