export type NarrativeTopicId =
  | "after_work_home"
  | "weekend_alone"
  | "errand_outing"
  | "waiting_for_friend"
  | "afternoon_cafe"
  | "bookstore_browse"
  | "returning_with_purchases"
  | "after_school_pickup"
  | "weekend_walk"
  | "after_lunch"
  | "city_wandering"
  | "evening_return_home"
  | "short_local_trip";

export type NarrativeTopicConfig = {
  id: NarrativeTopicId;
  label: string;
  aliases: string[];
  narrativeDefinition: string;
  defaultCharacterStates: string[];
  allowedMicroEventFamilies: string[];
  preferredLocationWorlds: string[];
  forbiddenPatterns: string[];
  lifestyleTone: string[];
  defaultSceneLabels: string[];
  status: "ACTIVE";
};
