import type { NarrativeDuration, NarrativeMomentPurpose, NarrativeSeason } from "./types";

export type NarrativeSceneRole =
  | "approach"
  | "transition"
  | "threshold"
  | "interior"
  | "exterior"
  | "waiting"
  | "counter";

export type NarrativeSceneRef = {
  id: string;
  label: string;
};

export type NarrativePronoun = {
  subject: "She" | "He" | "They";
  subjectLower: "she" | "he" | "they";
  possessive: "Her" | "His" | "Their";
  possessiveLower: "her" | "his" | "their";
  isPlural: boolean;
};

export type NarrativeTemplateContext = {
  topic: string;
  characterProfile: string;
  season: NarrativeSeason;
  lifestyleFeeling: string;
  duration: NarrativeDuration;
  pronoun: NarrativePronoun;
  scenes: Record<NarrativeSceneRole, NarrativeSceneRef>;
  toneClause: string;
  seasonClause: string;
};

export type NarrativeMomentDraft = {
  purpose: NarrativeMomentPurpose;
  sceneRole: NarrativeSceneRole;
  whatHappens: string;
  causalLink: string | null;
};

export type NarrativeArchetype = {
  id: string;
  topicId: string;
  label: string;
  matchPatterns: RegExp[];
  storyIntent: string;
  initialCharacterState: (context: NarrativeTemplateContext) => string;
  microEvent: (context: NarrativeTemplateContext) => string;
  emotionalArc: string[];
  moments: (context: NarrativeTemplateContext) => NarrativeMomentDraft[];
};

function verb(pronoun: NarrativePronoun, singular: string, plural: string) {
  return pronoun.isPlural ? plural : singular;
}

function scene(context: NarrativeTemplateContext, role: NarrativeSceneRole) {
  return context.scenes[role].label;
}

export const NARRATIVE_ARCHETYPES: NarrativeArchetype[] = [
  {
    id: "ordinary_return_home",
    topicId: "after_work_home",
    label: "下班回家",
    matchPatterns: [/下班.*回家/i, /归家/i, /回家(?:路上|途中)?/i, /return(?:ing)? home/i, /arriv(?:e|ing) home/i],
    storyIntent: "Capture the short transition from public composure to private relaxation when the character arrives home after an ordinary workday.",
    initialCharacterState: (context) => {
      const { pronoun } = context;
      return `${pronoun.subject} ${verb(pronoun, "has", "have")} finished the working day and is moving through the last part of the route home. ${pronoun.possessive} pace is steady, ${pronoun.possessiveLower} attention stays mostly on the route, and the public part of the day is already beginning to fall away. ${context.toneClause} ${context.seasonClause}`;
    },
    microEvent: (context) => `At the ${scene(context, "threshold")}, the key has slipped deeper inside the bag than expected.`,
    emotionalArc: ["composed", "briefly interrupted", "private", "released"],
    moments: (context) => [
      {
        purpose: "establish_state",
        sceneRole: "approach",
        whatHappens: `${context.pronoun.subject} leaves the ${scene(context, "approach")} and begins walking through the ${scene(context, "transition")} toward the ${scene(context, "threshold")}.`,
        causalLink: null,
      },
      {
        purpose: "approach_trigger",
        sceneRole: "threshold",
        whatHappens: `As ${context.pronoun.subjectLower} reaches the ${scene(context, "threshold")}, one hand begins searching inside the bag for the key.`,
        causalLink: "The hand searches only because the character has reached the closed threshold and the key is not already available.",
      },
      {
        purpose: "micro_event",
        sceneRole: "threshold",
        whatHappens: `${context.pronoun.subject} reaches the door but does not immediately find it, so ${context.pronoun.subjectLower} stops and looks inside the bag for another second.`,
        causalLink: "The stop happens only because the first search does not produce the key.",
      },
      {
        purpose: "response",
        sceneRole: "threshold",
        whatHappens: `${context.pronoun.subject} finds the key, unlocks the door, and ${context.pronoun.possessiveLower} posture becomes slightly less held.`,
        causalLink: "The unlock and slight release follow only after the key is found.",
      },
      {
        purpose: "after_state",
        sceneRole: "interior",
        whatHappens: `${context.pronoun.subject} steps into the ${scene(context, "interior")} without turning back. The ${scene(context, "transition")} returns to stillness.`,
        causalLink: "Entering follows only after the door is open and the key search is complete.",
      },
    ],
  },
  {
    id: "ordinary_departure",
    topicId: "errand_outing",
    label: "出门办事",
    matchPatterns: [/出门/i, /离家/i, /上班出门/i, /通勤/i, /leav(?:e|ing) home/i, /departure/i, /commut(?:e|ing)/i],
    storyIntent: "Capture the small adjustment between a controlled indoor departure and the first moments outside.",
    initialCharacterState: (context) => {
      const { pronoun } = context;
      return `${pronoun.subject} ${verb(pronoun, "has", "have")} finished preparing to leave and is moving with the calm efficiency of a familiar routine. ${pronoun.possessive} movements stay compact, ${pronoun.possessiveLower} attention is forward, and nothing in the movement is rushed. ${context.toneClause} ${context.seasonClause}`;
    },
    microEvent: (context) => `After stepping outside, the temperature is cooler than expected, so ${context.pronoun.subjectLower} briefly adjusts ${context.pronoun.possessiveLower} sleeve before continuing.`,
    emotionalArc: ["prepared", "exposed", "adjusted", "moving"],
    moments: (context) => [
      {
        purpose: "establish_state",
        sceneRole: "interior",
        whatHappens: `${context.pronoun.subject} moves through the ${scene(context, "interior")} with one bag already in hand and reaches the ${scene(context, "threshold")}.`,
        causalLink: null,
      },
      {
        purpose: "approach_trigger",
        sceneRole: "threshold",
        whatHappens: `${context.pronoun.subject} opens the door and steps through without pausing to rearrange anything.`,
        causalLink: "Stepping through follows directly from the completed indoor preparation.",
      },
      {
        purpose: "micro_event",
        sceneRole: "exterior",
        whatHappens: `Outside in the ${scene(context, "exterior")}, the air feels cooler than expected and ${context.pronoun.subjectLower} slows for one step.`,
        causalLink: "The pause happens only because the outdoor temperature differs from the indoor expectation.",
      },
      {
        purpose: "response",
        sceneRole: "exterior",
        whatHappens: `${context.pronoun.subject} adjusts ${context.pronoun.possessiveLower} sleeve once, settles the bag, and continues at the same measured pace.`,
        causalLink: "The sleeve adjustment is a direct physical response to the cooler air.",
      },
      {
        purpose: "after_state",
        sceneRole: "exterior",
        whatHappens: `${context.pronoun.subject} continues along the ${scene(context, "exterior")}; the adjustment is complete and no further pause is introduced.`,
        causalLink: "The continued movement follows only after the clothing and bag have settled.",
      },
    ],
  },
  {
    id: "bookstore_passing_notice",
    topicId: "bookstore_browse",
    label: "逛书店",
    matchPatterns: [/书店/i, /杂志店/i, /bookstore/i, /bookshop/i, /magazine shop/i],
    storyIntent: "Capture the brief shift from walking past a familiar shop to noticing something specific in the bookstore window.",
    initialCharacterState: (context) => {
      const { pronoun } = context;
      return `${pronoun.subject} is walking along the route with an even, unhurried pace. ${pronoun.possessive} attention is forward, there is no pause in the movement yet, and the bookstore is simply part of the usual street. ${context.toneClause} ${context.seasonClause}`;
    },
    microEvent: (context) => `${context.pronoun.subject} is about to walk past the bookstore when something in the window catches ${context.pronoun.possessiveLower} attention and ${context.pronoun.possessiveLower} pace slows.`,
    emotionalArc: ["focused", "distracted", "quietly interested", "continuing"],
    moments: (context) => [
      {
        purpose: "establish_state",
        sceneRole: "approach",
        whatHappens: `${context.pronoun.subject} walks along the ${scene(context, "approach")} at a steady pace, approaching the bookstore without changing direction.`,
        causalLink: null,
      },
      {
        purpose: "approach_trigger",
        sceneRole: "threshold",
        whatHappens: `As ${context.pronoun.subjectLower} nears the ${scene(context, "threshold")}, ${context.pronoun.possessiveLower} gaze moves toward the window display.`,
        causalLink: "The gaze moves only because the window display enters the route at close range.",
      },
      {
        purpose: "micro_event",
        sceneRole: "threshold",
        whatHappens: `${context.pronoun.subject} slows just before the ${scene(context, "threshold")} and stops outside instead of continuing past.`,
        causalLink: "The stop follows only from the specific object catching attention in the window.",
      },
      {
        purpose: "response",
        sceneRole: "threshold",
        whatHappens: `${context.pronoun.subject} steps slightly closer, looks for another second, then settles back into a normal standing position.`,
        causalLink: "The closer look is a direct response to the object that caused the stop.",
      },
      {
        purpose: "after_state",
        sceneRole: "interior",
        whatHappens: `${context.pronoun.subject} continues into the ${scene(context, "interior")} at the same quiet pace; the moment of notice is over.`,
        causalLink: "Entering follows only after the pause at the window has resolved.",
      },
    ],
  },
  {
    id: "ordinary_waiting",
    topicId: "waiting_for_friend",
    label: "等朋友",
    matchPatterns: [/等人/i, /等待/i, /等车/i, /候车/i, /waiting/i, /wait(?:ing)? for/i],
    storyIntent: "Capture the small shift from arriving early to settling into the decision to wait.",
    initialCharacterState: (context) => {
      const { pronoun } = context;
      return `${pronoun.subject} arrives with a little time to spare. ${pronoun.possessive} pace is measured, ${pronoun.possessiveLower} attention moves briefly between the entrance and the surrounding space, and there is no urgency in the movement. ${context.toneClause} ${context.seasonClause}`;
    },
    microEvent: (context) => `${context.pronoun.subject} arrives slightly early and chooses to remain outside instead of immediately going inside.`,
    emotionalArc: ["waiting", "occupied", "settled"],
    moments: (context) => [
      {
        purpose: "establish_state",
        sceneRole: "waiting",
        whatHappens: `${context.pronoun.subject} reaches the ${scene(context, "waiting")} and checks the route ahead once before slowing down.`,
        causalLink: null,
      },
      {
        purpose: "approach_trigger",
        sceneRole: "threshold",
        whatHappens: `${context.pronoun.subject} reaches the ${scene(context, "threshold")} and looks toward the entrance without stepping through it.`,
        causalLink: "The pause at the entrance follows from arriving before there is any reason to enter.",
      },
      {
        purpose: "micro_event",
        sceneRole: "waiting",
        whatHappens: `${context.pronoun.subject} shifts ${context.pronoun.possessiveLower} weight and remains beside the ${scene(context, "waiting")}.`,
        causalLink: "Remaining outside is the direct choice made after seeing the entrance.",
      },
      {
        purpose: "response",
        sceneRole: "waiting",
        whatHappens: `${context.pronoun.subject} adjusts the bag strap once, settles ${context.pronoun.possessiveLower} stance, and lets ${context.pronoun.possessiveLower} attention rest on the surrounding movement.`,
        causalLink: "The small adjustment follows only after deciding to wait.",
      },
      {
        purpose: "after_state",
        sceneRole: "waiting",
        whatHappens: `${context.pronoun.subject} remains quietly beside the ${scene(context, "waiting")}; no new action beyond the wait is introduced.`,
        causalLink: "The quiet settling follows only after the wait has been accepted.",
      },
    ],
  },
  {
    id: "cafe_arrival",
    topicId: "afternoon_cafe",
    label: "午后咖啡",
    matchPatterns: [/咖啡馆/i, /咖啡店/i, /买咖啡/i, /cafe/i, /coffee shop/i],
    storyIntent: "Capture the small pause between entering a cafe and settling into the next part of the day.",
    initialCharacterState: (context) => {
      const { pronoun } = context;
      return `${pronoun.subject} steps in from the street at a steady pace. ${pronoun.possessive} attention moves from the doorway toward the counter, and the outside pace is still present in the first few steps. ${context.toneClause} ${context.seasonClause}`;
    },
    microEvent: (context) => `At the ${scene(context, "counter")}, ${context.pronoun.subjectLower} checks the usual pocket for the card and finds it after one extra pat.`,
    emotionalArc: ["moving", "briefly searching", "settled", "continuing"],
    moments: (context) => [
      {
        purpose: "establish_state",
        sceneRole: "interior",
        whatHappens: `${context.pronoun.subject} enters the ${scene(context, "interior")} and walks toward the ${scene(context, "counter")} without stopping at the doorway.`,
        causalLink: null,
      },
      {
        purpose: "approach_trigger",
        sceneRole: "counter",
        whatHappens: `${context.pronoun.subject} reaches the ${scene(context, "counter")} and begins reaching for the usual pocket.`,
        causalLink: "The hand moves toward the pocket because the counter has been reached.",
      },
      {
        purpose: "micro_event",
        sceneRole: "counter",
        whatHappens: `${context.pronoun.subject} does not find the card on the first touch, so ${context.pronoun.subjectLower} pauses and checks the pocket once more.`,
        causalLink: "The extra check follows only from the first touch not finding the card.",
      },
      {
        purpose: "response",
        sceneRole: "counter",
        whatHappens: `${context.pronoun.subject} finds the card, closes the pocket, and completes the small hand movement at a normal pace.`,
        causalLink: "The settled hand movement follows only after the card is found.",
      },
      {
        purpose: "after_state",
        sceneRole: "interior",
        whatHappens: `${context.pronoun.subject} steps aside from the ${scene(context, "counter")} and continues into the ${scene(context, "interior")}; the search is over.`,
        causalLink: "Stepping aside follows only after the card and pocket are settled.",
      },
    ],
  },
  {
    id: "ordinary_errand_return",
    topicId: "returning_with_purchases",
    label: "采购归来",
    matchPatterns: [/买菜/i, /采购/i, /超市/i, /便利店/i, /market/i, /grocery/i, /errand/i],
    storyIntent: "Capture the small handling adjustment at the end of an ordinary errand.",
    initialCharacterState: (context) => {
      const { pronoun } = context;
      return `${pronoun.subject} is returning with one bag in hand. ${pronoun.possessive} grip is secure, ${pronoun.possessiveLower} pace is steady, and the route is already familiar. ${context.toneClause} ${context.seasonClause}`;
    },
    microEvent: (context) => `At the ${scene(context, "threshold")}, one bag handle slips and ${context.pronoun.subjectLower} shifts the bag to the other hand before continuing.`,
    emotionalArc: ["moving", "burdened", "adjusted", "continuing"],
    moments: (context) => [
      {
        purpose: "establish_state",
        sceneRole: "exterior",
        whatHappens: `${context.pronoun.subject} steps out of the elevator into the ${scene(context, "exterior")} with one shopping bag in hand and starts toward ${context.pronoun.possessiveLower} door.`,
        causalLink: null,
      },
      {
        purpose: "approach_trigger",
        sceneRole: "transition",
        whatHappens: `A few steps down the ${scene(context, "transition")}, the bag handle shifts against ${context.pronoun.possessiveLower} grip.`,
        causalLink: "The handle shifts only because the bag has been carried through the short walk from the elevator.",
      },
      {
        purpose: "micro_event",
        sceneRole: "threshold",
        whatHappens: `${context.pronoun.subject} stops once in the ${scene(context, "threshold")} and moves the bag from one hand to the other.`,
        causalLink: "The hand change follows only from the slipping handle.",
      },
      {
        purpose: "response",
        sceneRole: "threshold",
        whatHappens: `With the grip settled, ${context.pronoun.subjectLower} reaches for the door and turns the key.`,
        causalLink: "Reaching for the door follows only after the new grip is secure.",
      },
      {
        purpose: "after_state",
        sceneRole: "interior",
        whatHappens: `${context.pronoun.subject} steps into the ${scene(context, "interior")} with the bag held steadily; the adjustment is complete.`,
        causalLink: "Entering follows only after the bag has been secured and the door opened.",
      },
    ],
  },
  {
    id: "weekend_private_time",
    topicId: "weekend_alone",
    label: "周末独处",
    matchPatterns: [/周末.*独处/i, /一个人.*周末/i, /weekend alone/i],
    storyIntent: "Capture a short stretch of self-directed weekend time in which the character chooses to remain at home a little longer.",
    initialCharacterState: (context) => {
      const { pronoun } = context;
      return `${pronoun.subject} has no fixed plan for the next part of the day. ${pronoun.possessive} pace is unhurried, ${pronoun.possessiveLower} attention stays close to the room, and the space around ${pronoun.subjectLower} is already settled. ${context.toneClause} ${context.seasonClause}`;
    },
    microEvent: (context) => `While tidying one small object by the window, ${context.pronoun.subjectLower} pauses and chooses to remain in the room for a few more minutes.`,
    emotionalArc: ["unhurried", "noticing", "settling", "continuing"],
    moments: (context) => [
      {
        purpose: "establish_state",
        sceneRole: "interior",
        whatHappens: `${context.pronoun.subject} moves through the ${scene(context, "interior")} at an easy pace and approaches the window-side area.`,
        causalLink: null,
      },
      {
        purpose: "approach_trigger",
        sceneRole: "interior",
        whatHappens: `${context.pronoun.subject} reaches the near table and notices one small object resting slightly out of place.`,
        causalLink: "The object enters the action only because the character has reached the nearby surface.",
      },
      {
        purpose: "micro_event",
        sceneRole: "interior",
        whatHappens: `${context.pronoun.subject} reaches for the object, places it down, and pauses instead of moving on immediately.`,
        causalLink: "The pause follows only from the small tidying task that has just been completed.",
      },
      {
        purpose: "response",
        sceneRole: "interior",
        whatHappens: `${context.pronoun.subject} settles ${context.pronoun.possessiveLower} stance and lets ${context.pronoun.possessiveLower} attention return to the room.`,
        causalLink: "The settled stance follows only after the decision not to leave yet.",
      },
      {
        purpose: "after_state",
        sceneRole: "interior",
        whatHappens: `${context.pronoun.subject} remains quietly by the window; the room continues around ${context.pronoun.subjectLower} without adding a new task.`,
        causalLink: "The quiet continuation follows only after the character chooses to remain.",
      },
    ],
  },
  {
    id: "school_pickup_transition",
    topicId: "after_school_pickup",
    label: "接孩子后",
    matchPatterns: [/接孩子/i, /接娃/i, /放学后/i, /school pickup/i],
    storyIntent: "Capture the small transition from the school vicinity into an ordinary homeward walk after pickup.",
    initialCharacterState: (context) => {
      const { pronoun } = context;
      return `${pronoun.subject} has just left the school area and is moving at an unhurried pace. ${pronoun.possessive} attention stays on the route ahead, and the next part of the day is still open. ${context.toneClause} ${context.seasonClause}`;
    },
    microEvent: (context) => `At the ${scene(context, "waiting")}, ${context.pronoun.subjectLower} slows to let a small group pass before continuing toward the residential route.`,
    emotionalArc: ["attentive", "waiting", "adjusting", "continuing"],
    moments: (context) => [
      {
        purpose: "establish_state",
        sceneRole: "exterior",
        whatHappens: `${context.pronoun.subject} walks along the ${scene(context, "exterior")} with a steady pace and keeps the homeward direction in view.`,
        causalLink: null,
      },
      {
        purpose: "approach_trigger",
        sceneRole: "waiting",
        whatHappens: `${context.pronoun.subject} reaches the ${scene(context, "waiting")} and slows as a small group crosses ahead.`,
        causalLink: "The slower step follows only because the path ahead is briefly occupied.",
      },
      {
        purpose: "micro_event",
        sceneRole: "exterior",
        whatHappens: `${context.pronoun.subject} waits for the passage to clear, adjusts the bag in ${context.pronoun.possessiveLower} hand, and begins moving again.`,
        causalLink: "The adjustment follows only from waiting for the crossing to become clear.",
      },
      {
        purpose: "response",
        sceneRole: "exterior",
        whatHappens: `${context.pronoun.subject} continues at the same measured pace and lets ${context.pronoun.possessiveLower} attention return to the route.`,
        causalLink: "The resumed movement follows only after the path is clear.",
      },
      {
        purpose: "after_state",
        sceneRole: "exterior",
        whatHappens: `${context.pronoun.subject} settles into a steady walk along the ${scene(context, "exterior")}; the brief wait and the adjustment are behind ${context.pronoun.possessiveLower}.`,
        causalLink: "The homeward continuation follows only after the crossing has resolved.",
      },
    ],
  },
  {
    id: "quiet_neighborhood_walk",
    topicId: "weekend_walk",
    label: "周末散步",
    matchPatterns: [/周末.*散步/i, /散步/i, /neighborhood walk/i, /weekend walk/i],
    storyIntent: "Capture a short neighborhood walk with no destination, observed at an easy pace.",
    initialCharacterState: (context) => {
      const { pronoun } = context;
      return `${pronoun.subject} is walking without a destination. ${pronoun.possessive} pace is light, ${pronoun.possessiveLower} attention stays on the path and nearby details, and nothing in the route requires a decision. ${context.toneClause} ${context.seasonClause}`;
    },
    microEvent: (context) => `At the edge of the ${scene(context, "exterior")}, a slight change in the pavement makes ${context.pronoun.subjectLower} shorten one step before continuing.`,
    emotionalArc: ["easy", "noticing", "adjusting", "continuing"],
    moments: (context) => [
      {
        purpose: "establish_state",
        sceneRole: "exterior",
        whatHappens: `${context.pronoun.subject} walks along the ${scene(context, "exterior")} at an even pace with no destination in mind.`,
        causalLink: null,
      },
      {
        purpose: "approach_trigger",
        sceneRole: "exterior",
        whatHappens: `As ${context.pronoun.subjectLower} approaches the edge of the path, ${context.pronoun.possessiveLower} attention moves to the surface ahead.`,
        causalLink: "The attention shift follows only because the path surface changes at that point.",
      },
      {
        purpose: "micro_event",
        sceneRole: "exterior",
        whatHappens: `${context.pronoun.subject} shortens one step to clear the uneven surface and then restores ${context.pronoun.possessiveLower} normal pace.`,
        causalLink: "The shorter step is a direct response to the surface change.",
      },
      {
        purpose: "response",
        sceneRole: "exterior",
        whatHappens: `${context.pronoun.subject} settles back into the same easy rhythm and continues past the change.`,
        causalLink: "The resumed rhythm follows only after the step has cleared the surface.",
      },
      {
        purpose: "after_state",
        sceneRole: "exterior",
        whatHappens: `${context.pronoun.subject} settles into an easy rhythm along the ${scene(context, "exterior")}; the small adjustment is behind ${context.pronoun.possessiveLower}.`,
        causalLink: "The continuation follows only after the path returns to an even rhythm.",
      },
    ],
  },
  {
    id: "after_lunch_interval",
    topicId: "after_lunch",
    label: "午餐之后",
    matchPatterns: [/午餐之后/i, /饭后/i, /after lunch/i],
    storyIntent: "Capture the short empty interval after lunch when the character steps outside and chooses how to continue her day.",
    initialCharacterState: (context) => {
      const { pronoun } = context;
      return `${pronoun.subject} has just finished lunch and is leaving the restaurant area at a measured pace. ${pronoun.possessive} attention is on the street, and ${context.pronoun.subjectLower} is not rushing into the next task. ${context.toneClause} ${context.seasonClause}`;
    },
    microEvent: (context) => `Outside the restaurant area, ${context.pronoun.subjectLower} pauses briefly to check the direction of the ${scene(context, "exterior")} before continuing.`,
    emotionalArc: ["settled", "unfocused", "deciding", "continuing"],
    moments: (context) => [
      {
        purpose: "establish_state",
        sceneRole: "threshold",
        whatHappens: `${context.pronoun.subject} steps out from the ${scene(context, "threshold")} and pauses at the first stretch of pavement.`,
        causalLink: null,
      },
      {
        purpose: "approach_trigger",
        sceneRole: "exterior",
        whatHappens: `${context.pronoun.subject} walks a few steps along the ${scene(context, "exterior")} while checking the direction ahead.`,
        causalLink: "The direction check follows only because the next route is not yet decided.",
      },
      {
        purpose: "micro_event",
        sceneRole: "exterior",
        whatHappens: `${context.pronoun.subject} slows for a moment, turns slightly toward the clearer route, and decides to continue walking.`,
        causalLink: "The route choice follows only after the short pause and direction check.",
      },
      {
        purpose: "response",
        sceneRole: "exterior",
        whatHappens: `${context.pronoun.subject} adjusts ${context.pronoun.possessiveLower} outer layer once and begins moving at an easy pace.`,
        causalLink: "The clothing adjustment follows only after the direction has been chosen.",
      },
      {
        purpose: "after_state",
        sceneRole: "exterior",
        whatHappens: `${context.pronoun.subject} settles into an unhurried pace along the ${scene(context, "exterior")}; the adjustment is complete and the interval after lunch is settled.`,
        causalLink: "The continued walk follows only after the brief pause and route decision.",
      },
    ],
  },
  {
    id: "urban_wandering",
    topicId: "city_wandering",
    label: "城市闲逛",
    matchPatterns: [/城市闲逛/i, /闲逛/i, /city wandering/i, /city walk/i],
    storyIntent: "Capture a short stretch of moving through city blocks without a task, noticing only what the route naturally presents.",
    initialCharacterState: (context) => {
      const { pronoun } = context;
      return `${pronoun.subject} is moving through the city without a task. ${pronoun.possessive} pace is easy, ${pronoun.possessiveLower} attention stays open to the block ahead, and the route can change without urgency. ${context.toneClause} ${context.seasonClause}`;
    },
    microEvent: (context) => `At a storefront corner, a reflection catches ${context.pronoun.subjectLower}'s attention and ${context.pronoun.subjectLower} slows for one step before continuing.`,
    emotionalArc: ["open", "noticing", "interested", "continuing"],
    moments: (context) => [
      {
        purpose: "establish_state",
        sceneRole: "exterior",
        whatHappens: `${context.pronoun.subject} walks along the ${scene(context, "exterior")} at an easy pace and keeps the next block in view.`,
        causalLink: null,
      },
      {
        purpose: "approach_trigger",
        sceneRole: "exterior",
        whatHappens: `As ${context.pronoun.subjectLower} nears the storefront edge, ${context.pronoun.possessiveLower} gaze shifts toward the glass.`,
        causalLink: "The gaze shift follows only because the storefront edge enters the route.",
      },
      {
        purpose: "micro_event",
        sceneRole: "exterior",
        whatHappens: `${context.pronoun.subject} slows for one step as a reflection catches ${context.pronoun.possessiveLower} attention, then continues without stopping.`,
        causalLink: "The slower step follows only from the reflection the route naturally presents.",
      },
      {
        purpose: "response",
        sceneRole: "exterior",
        whatHappens: `${context.pronoun.subject} returns ${context.pronoun.possessiveLower} gaze to the route and keeps moving at the same measured pace.`,
        causalLink: "The resumed gaze follows only after the brief visual notice.",
      },
      {
        purpose: "after_state",
        sceneRole: "exterior",
        whatHappens: `${context.pronoun.subject} continues around the next block; the small notice is over.`,
        causalLink: "The continued movement follows only after the visual pause resolves.",
      },
    ],
  },
  {
    id: "evening_home_return",
    topicId: "evening_return_home",
    label: "傍晚回家",
    matchPatterns: [/傍晚.*回家/i, /晚上.*回家/i, /evening return/i],
    storyIntent: "Capture the gradual return from ordinary evening street life to a private home state.",
    initialCharacterState: (context) => {
      const { pronoun } = context;
      return `${pronoun.subject} has been out in the evening and is moving toward home. ${pronoun.possessive} pace is steady, ${pronoun.possessiveLower} attention stays on the familiar route, and nothing in the movement is rushed. ${context.toneClause} ${context.seasonClause}`;
    },
    microEvent: (context) => `At the ${scene(context, "threshold")}, ${context.pronoun.subjectLower} pauses to move a small item from one pocket to another before unlocking the door.`,
    emotionalArc: ["steady", "pausing", "settling", "private"],
    moments: (context) => [
      {
        purpose: "establish_state",
        sceneRole: "exterior",
        whatHappens: `${context.pronoun.subject} walks along the ${scene(context, "exterior")} at a steady evening pace and keeps the residential direction in view.`,
        causalLink: null,
      },
      {
        purpose: "approach_trigger",
        sceneRole: "threshold",
        whatHappens: `As ${context.pronoun.subjectLower} reaches the ${scene(context, "threshold")}, ${context.pronoun.subjectLower} slows and begins reaching for the key.`,
        causalLink: "The search begins only because the entrance has been reached.",
      },
      {
        purpose: "micro_event",
        sceneRole: "threshold",
        whatHappens: `${context.pronoun.subject} pauses to move a small item between pockets, then finds the key and unlocks the door.`,
        causalLink: "The pocket adjustment and unlock follow only from the small item needing to be settled first.",
      },
      {
        purpose: "response",
        sceneRole: "threshold",
        whatHappens: `${context.pronoun.subject} opens the door and lets ${context.pronoun.possessiveLower} posture settle slightly before stepping through.`,
        causalLink: "The settled posture follows only after the door is unlocked.",
      },
      {
        purpose: "after_state",
        sceneRole: "interior",
        whatHappens: `${context.pronoun.subject} steps into the ${scene(context, "interior")} and remains quietly inside; the evening route is complete.`,
        causalLink: "Entering follows only after the door is open and the small adjustment is done.",
      },
    ],
  },
  {
    id: "short_local_move",
    topicId: "short_local_trip",
    label: "短途出行",
    matchPatterns: [/短途出行/i, /短途移动/i, /short local trip/i, /local trip/i],
    storyIntent: "Capture the brief transition from leaving one familiar building to arriving at a nearby city destination.",
    initialCharacterState: (context) => {
      const { pronoun } = context;
      return `${pronoun.subject} has finished a small local preparation and is moving through the first part of a short trip. ${pronoun.possessive} pace is steady, ${pronoun.possessiveLower} attention is on the route, and the movement remains ordinary. ${context.toneClause} ${context.seasonClause}`;
    },
    microEvent: (context) => `At the pickup area, ${context.pronoun.subjectLower} checks that one small item is secure before continuing toward the nearby destination.`,
    emotionalArc: ["prepared", "checking", "moving", "arriving"],
    moments: (context) => [
      {
        purpose: "establish_state",
        sceneRole: "exterior",
        whatHappens: `${context.pronoun.subject} walks along the ${scene(context, "exterior")} with one small item in hand, the ${scene(context, "threshold")} already in view.`,
        causalLink: null,
      },
      {
        purpose: "approach_trigger",
        sceneRole: "exterior",
        whatHappens: `As ${context.pronoun.subjectLower} walks along the ${scene(context, "exterior")}, ${context.pronoun.subjectLower} checks the small item once and begins adjusting its position.`,
        causalLink: "The check begins only because the small item has shifted during the first steps of the short route.",
      },
      {
        purpose: "micro_event",
        sceneRole: "exterior",
        whatHappens: `${context.pronoun.subject} pauses on the ${scene(context, "exterior")} and settles it securely before moving on.`,
        causalLink: "The pause follows only from the item check that already began.",
      },
      {
        purpose: "response",
        sceneRole: "exterior",
        whatHappens: `With the item secure, ${context.pronoun.subjectLower} resumes the final few steps toward the ${scene(context, "threshold")}.`,
        causalLink: "The final steps follow only after the small item is secure.",
      },
      {
        purpose: "after_state",
        sceneRole: "threshold",
        whatHappens: `${context.pronoun.subject} reaches the ${scene(context, "threshold")} and stops there; the short move is complete.`,
        causalLink: "Arriving follows only after the final steps have been walked.",
      },
    ],
  },
];
