import type { TeamImageType, TeamPoseType, TeamScenePreference } from "../types";

export type PersonActionCategory = "general" | "seated" | "mirror" | "studio";
export type PersonActionOrientation = "front" | "threeQuarter" | "side" | "rearThreeQuarter";
export type PersonActionFootwork = "parallel" | "split" | "stepStart" | "midStep" | "stepFinish" | "seatedGrounded";
export type PersonActionMovementPhase = "still" | "preparing" | "moving" | "settling" | "task";
export type PersonActionHandTask =
  | "emptyRelaxed"
  | "sleeve"
  | "lapel"
  | "hem"
  | "pocketEdge"
  | "environmentCue"
  | "phone"
  | "seatSupport";
export type PersonActionFraming = "fullFigure" | "threeQuarterFigure" | "waistToFloor" | "onFootDetail";

export type PersonActionDefinition = {
  id: string;
  category: PersonActionCategory;
  directive: string;
  poseType: TeamPoseType;
  diversityFamily: string;
  bodyOrientation: PersonActionOrientation;
  footwork: PersonActionFootwork;
  movementPhase: PersonActionMovementPhase;
  handTask: PersonActionHandTask;
  framing: PersonActionFraming;
  compatibleImageTypes: TeamImageType[];
  compatibleScenes?: TeamScenePreference[];
  requiresSeat?: boolean;
  studioShotIndex?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  handheldPolicy: "none" | "phoneOnly";
  shoeVisibilityRisk: "low" | "medium";
  anatomyRisk: "low" | "medium";
  weight: number;
};

type ActionFactorySpec = {
  family: string;
  category: PersonActionCategory;
  count: number;
  poseType: TeamPoseType;
  orientations: PersonActionOrientation[];
  footwork: PersonActionFootwork[];
  phases: PersonActionMovementPhase[];
  handTasks: PersonActionHandTask[];
  framings: PersonActionFraming[];
  actionCores: string[];
  compatibleImageTypes: TeamImageType[];
  requiresSeat?: boolean;
};

const PEOPLE_IMAGE_TYPES: TeamImageType[] = ["产品上脚图", "生活场景图"];
const MIRROR_IMAGE_TYPES: TeamImageType[] = ["对镜穿搭图"];
const SEATED_SCENES: TeamScenePreference[] = [
  "咖啡馆内",
  "朋友午餐",
  "窗边阅读",
  "窗边阅读角",
  "居家衣帽间",
  "衣帽间 / 更衣角",
  "酒店房间",
  "旅行酒店"
];

const orientationText: Record<PersonActionOrientation, string> = {
  front: "front-oriented body line",
  threeQuarter: "clear three-quarter body line",
  side: "near-profile body line",
  rearThreeQuarter: "restrained rear three-quarter body line"
};

const footworkText: Record<PersonActionFootwork, string> = {
  parallel: "both feet planted in a calm parallel stance",
  split: "feet in a relaxed split stance with visible weight distribution",
  stepStart: "the leading foot just beginning a compact step",
  midStep: "one compact mid-step with stable toe direction",
  stepFinish: "the forward foot finishing contact while the rear heel settles",
  seatedGrounded: "both feet grounded with knees naturally separated"
};

const handTaskText: Record<PersonActionHandTask, string> = {
  emptyRelaxed: "both empty hands settling asymmetrically near the body",
  sleeve: "one hand briefly adjusting a sleeve while the other stays relaxed",
  lapel: "one hand lightly settling a lapel or outer-layer edge",
  hem: "one hand checking a garment hem without covering the sneakers",
  pocketEdge: "one hand briefly touching the pocket edge without entering a pocket pose",
  environmentCue: "one hand making a small scene-responsive gesture without holding a prop",
  phone: "the phone held naturally as the only handheld object while the free hand stays purposeful",
  seatSupport: "one hand resting lightly near the thigh or seat edge while the other remains relaxed"
};

const framingText: Record<PersonActionFraming, string> = {
  fullFigure: "full-figure framing",
  threeQuarterFigure: "three-quarter-figure framing",
  waistToFloor: "waist-to-floor framing",
  onFootDetail: "lower-body or on-foot framing"
};

const microBodyCues = [
  "Let the shoulder line settle a fraction before the feet",
  "Keep the pelvis stable while the ribcage responds softly",
  "Let the rear heel carry the final trace of weight transfer",
  "Keep one elbow slightly farther from the torso than the other",
  "Let the leading knee stay soft instead of locking straight",
  "Use a small diagonal relationship between shoulders and hips",
  "Let the hands finish their movement at different moments",
  "Keep the head response secondary to the torso action"
];

const spatialCues = [
  "Place the body just before the nearest scene plane",
  "Use a modest lateral offset from the frame center",
  "Let foreground depth separate the stance from the background",
  "Keep a practical amount of walking space ahead of the body",
  "Use the scene's strongest vertical line as a quiet counterpoint"
];

function dimension<T>(items: T[], index: number, stride: number) {
  return items[Math.floor(index / stride) % items.length] ?? items[0];
}

function buildActionFamily(spec: ActionFactorySpec): PersonActionDefinition[] {
  return Array.from({ length: spec.count }, (_, index) => {
    const bodyOrientation = dimension(spec.orientations, index, 1);
    const footwork = dimension(spec.footwork, index, spec.orientations.length);
    const handTask = dimension(spec.handTasks, index, 3);
    const movementPhase = dimension(spec.phases, index, 5);
    const framing = dimension(spec.framings, index, 7);
    const actionCore = dimension(spec.actionCores, index, 2);
    const microBodyCue = microBodyCues[index % microBodyCues.length];
    const spatialCue = spatialCues[Math.floor(index / microBodyCues.length) % spatialCues.length];
    const directive = [
      `Person action lock: ${actionCore}`,
      `Use a ${orientationText[bodyOrientation]} with ${footworkText[footwork]}.`,
      `${handTaskText[handTask]}.`,
      `${microBodyCue}. ${spatialCue}.`,
      `Compose it as ${framingText[framing]}; keep the movement anatomically safe, the action visually distinct, and the sneakers readable.`
    ].join(" ");

    return {
      id: `${spec.family}-${String(index + 1).padStart(3, "0")}`,
      category: spec.category,
      directive,
      poseType: spec.poseType,
      diversityFamily: spec.family,
      bodyOrientation,
      footwork,
      movementPhase,
      handTask,
      framing,
      compatibleImageTypes: spec.compatibleImageTypes,
      compatibleScenes: spec.requiresSeat ? SEATED_SCENES : undefined,
      requiresSeat: spec.requiresSeat,
      handheldPolicy: spec.category === "mirror" ? "phoneOnly" : "none",
      shoeVisibilityRisk: framing === "fullFigure" || framing === "waistToFloor" ? "low" : "medium",
      anatomyRisk: spec.poseType === "seated" || spec.poseType === "walking" ? "medium" : "low",
      weight: 1
    } satisfies PersonActionDefinition;
  });
}

const generalFamilySpecs: ActionFactorySpec[] = [
  {
    family: "standing",
    category: "general",
    count: 40,
    poseType: "standing",
    orientations: ["front", "threeQuarter", "side"],
    footwork: ["parallel", "split"],
    phases: ["still", "settling"],
    handTasks: ["emptyRelaxed", "pocketEdge"],
    framings: ["fullFigure", "threeQuarterFigure", "waistToFloor"],
    actionCores: [
      "hold a quiet standing pause after arriving in the scene",
      "settle into an unperformed everyday stance",
      "pause with a visible but restrained shift of body weight",
      "stand as if listening briefly before continuing the day",
      "use a calm in-between stance rather than a finished fashion pose"
    ],
    compatibleImageTypes: PEOPLE_IMAGE_TYPES
  },
  {
    family: "walking",
    category: "general",
    count: 40,
    poseType: "walking",
    orientations: ["front", "threeQuarter", "side"],
    footwork: ["stepStart", "midStep", "stepFinish"],
    phases: ["preparing", "moving", "settling"],
    handTasks: ["emptyRelaxed", "environmentCue"],
    framings: ["fullFigure", "threeQuarterFigure", "waistToFloor"],
    actionCores: [
      "take one short everyday step through the selected setting",
      "move at an unhurried pace with a compact stride",
      "cross a small part of the frame without performing for the camera",
      "walk toward the next practical point in the scene",
      "let the camera catch one stable phase of a natural step"
    ],
    compatibleImageTypes: PEOPLE_IMAGE_TYPES
  },
  {
    family: "transition",
    category: "general",
    count: 32,
    poseType: "walking",
    orientations: ["front", "threeQuarter", "side", "rearThreeQuarter"],
    footwork: ["stepStart", "stepFinish", "split"],
    phases: ["preparing", "settling"],
    handTasks: ["emptyRelaxed", "environmentCue"],
    framings: ["fullFigure", "threeQuarterFigure"],
    actionCores: [
      "pause distinctly between two steps before changing direction",
      "finish a small step and prepare to stop",
      "shift from standing into the first moment of movement",
      "slow down as if noticing one nearby scene detail"
    ],
    compatibleImageTypes: PEOPLE_IMAGE_TYPES
  },
  {
    family: "turning",
    category: "general",
    count: 30,
    poseType: "standing",
    orientations: ["threeQuarter", "side", "rearThreeQuarter"],
    footwork: ["parallel", "split", "stepFinish"],
    phases: ["moving", "settling"],
    handTasks: ["emptyRelaxed", "environmentCue"],
    framings: ["fullFigure", "threeQuarterFigure", "waistToFloor"],
    actionCores: [
      "make a small body turn toward the selected environment",
      "complete a restrained half-turn with the shoulders leading",
      "turn back incidentally as if responding to something nearby",
      "rotate from a side line into a relaxed three-quarter orientation"
    ],
    compatibleImageTypes: PEOPLE_IMAGE_TYPES
  },
  {
    family: "garment-task",
    category: "general",
    count: 32,
    poseType: "standing",
    orientations: ["front", "threeQuarter", "side"],
    footwork: ["parallel", "split"],
    phases: ["task", "settling"],
    handTasks: ["sleeve", "lapel", "hem", "pocketEdge"],
    framings: ["fullFigure", "threeQuarterFigure", "waistToFloor"],
    actionCores: [
      "make one purposeful adjustment to the clothing",
      "finish a small before-leaving garment check",
      "correct one naturally shifted clothing edge",
      "settle one layer after movement without styling for the camera"
    ],
    compatibleImageTypes: PEOPLE_IMAGE_TYPES
  },
  {
    family: "scene-interaction",
    category: "general",
    count: 26,
    poseType: "standing",
    orientations: ["front", "threeQuarter", "side"],
    footwork: ["parallel", "split", "stepStart"],
    phases: ["task", "preparing"],
    handTasks: ["environmentCue", "emptyRelaxed"],
    framings: ["fullFigure", "threeQuarterFigure"],
    actionCores: [
      "respond to a doorway, counter, window, artwork, or path that belongs to the selected scene",
      "orient the body toward one practical destination in the environment",
      "briefly acknowledge one real spatial cue without touching or holding a prop",
      "prepare to continue through the selected location with a scene-specific purpose"
    ],
    compatibleImageTypes: PEOPLE_IMAGE_TYPES
  },
  {
    family: "environment-response",
    category: "general",
    count: 24,
    poseType: "standing",
    orientations: ["front", "threeQuarter", "side", "rearThreeQuarter"],
    footwork: ["parallel", "split", "stepFinish"],
    phases: ["still", "settling"],
    handTasks: ["emptyRelaxed", "environmentCue"],
    framings: ["fullFigure", "threeQuarterFigure"],
    actionCores: [
      "react subtly to changing light, a reflection, breeze, or nearby movement",
      "let the posture respond to the spatial depth rather than the camera",
      "pause under a natural light transition with a small shoulder response",
      "shift attention across the scene while keeping the body action visible"
    ],
    compatibleImageTypes: PEOPLE_IMAGE_TYPES
  },
  {
    family: "on-foot",
    category: "general",
    count: 10,
    poseType: "standing",
    orientations: ["front", "threeQuarter", "side"],
    footwork: ["parallel", "split", "stepStart", "stepFinish"],
    phases: ["still", "preparing", "settling"],
    handTasks: ["emptyRelaxed", "hem"],
    framings: ["waistToFloor", "onFootDetail"],
    actionCores: [
      "use a lower-body action focused on a clearly different foot placement",
      "make the ankle, garment hem, and sneaker relationship the visible action",
      "show one controlled change of stance at ground level"
    ],
    compatibleImageTypes: PEOPLE_IMAGE_TYPES
  }
];

const seatedSpec: ActionFactorySpec = {
  family: "seated",
  category: "seated",
  count: 28,
  poseType: "seated",
  orientations: ["front", "threeQuarter", "side"],
  footwork: ["seatedGrounded"],
  phases: ["still", "task", "preparing"],
  handTasks: ["seatSupport", "emptyRelaxed", "hem"],
  framings: ["fullFigure", "threeQuarterFigure", "waistToFloor"],
  actionCores: [
    "sit near the front of a scene-compatible seat with grounded feet",
    "pause in a relaxed seated moment before standing",
    "shift lightly on the seat while keeping both shoes unobstructed",
    "settle into a quiet seated task with natural knee spacing"
  ],
  compatibleImageTypes: PEOPLE_IMAGE_TYPES,
  requiresSeat: true
};

const mirrorSubfamilies = [
  "mirror-front",
  "mirror-three-quarter",
  "mirror-side",
  "mirror-step-in",
  "mirror-garment-task",
  "mirror-lower-phone",
  "mirror-hem-check",
  "mirror-relaxed-finish"
];
const mirrorActions: PersonActionDefinition[] = Array.from({ length: 24 }, (_, index) => {
  const subfamilyIndex = index % mirrorSubfamilies.length;
  const variant = Math.floor(index / mirrorSubfamilies.length);
  const orientations: PersonActionOrientation[] = ["front", "threeQuarter", "side", "threeQuarter", "front", "front", "threeQuarter", "side"];
  const footworks: PersonActionFootwork[] = ["parallel", "split", "split", "stepFinish", "parallel", "split", "split", "parallel"];
  const handTasks: PersonActionHandTask[] = ["phone", "phone", "phone", "phone", "sleeve", "phone", "hem", "phone"];
  const cores = [
    "make a straight front mirror check",
    "turn into a clear three-quarter mirror check",
    "inspect the silhouette from a near-side mirror line",
    "arrive in front of the mirror with one foot just settling",
    "adjust one cuff or outer-layer edge with the free hand",
    "lower the phone slightly to inspect the complete look",
    "look down while checking the garment hem with the free hand",
    "finish the mirror check and let the shoulders and free arm relax"
  ];
  const endings = [
    "Keep the phone at face level and the free hand quiet.",
    "Keep the phone slightly off-center and preserve realistic leg length.",
    "Use a candid in-between moment rather than a finished selfie pose."
  ];
  return {
    id: `${mirrorSubfamilies[subfamilyIndex]}-${variant + 1}`,
    category: "mirror",
    directive: `Person action lock: ${cores[subfamilyIndex]}. ${endings[variant]} Keep the phone as the only handheld object, maintain grounded feet, and make this mirror action visibly different from the other cards.`,
    poseType: "mirror",
    diversityFamily: mirrorSubfamilies[subfamilyIndex],
    bodyOrientation: orientations[subfamilyIndex],
    footwork: footworks[subfamilyIndex],
    movementPhase: subfamilyIndex === 3 ? "settling" : subfamilyIndex >= 4 && subfamilyIndex <= 6 ? "task" : "still",
    handTask: handTasks[subfamilyIndex],
    framing: variant === 0 ? "fullFigure" : variant === 1 ? "threeQuarterFigure" : "waistToFloor",
    compatibleImageTypes: MIRROR_IMAGE_TYPES,
    handheldPolicy: "phoneOnly",
    shoeVisibilityRisk: "low",
    anatomyRisk: "low",
    weight: 1
  };
});

const studioSubfamilies = [
  "studio-full-front",
  "studio-full-three-quarter",
  "studio-full-side",
  "studio-rear-turn",
  "studio-lower-front",
  "studio-lower-three-quarter",
  "studio-on-foot-side",
  "studio-on-foot-step-finish"
];
const studioActions: PersonActionDefinition[] = Array.from({ length: 14 }, (_, index) => {
  const studioShotIndex = (index % studioSubfamilies.length) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  const variant = Math.floor(index / studioSubfamilies.length);
  const orientation: PersonActionOrientation[] = ["front", "threeQuarter", "side", "rearThreeQuarter", "front", "threeQuarter", "side", "threeQuarter"];
  const footwork: PersonActionFootwork[] = ["parallel", "split", "split", "stepFinish", "parallel", "split", "split", "stepFinish"];
  const cores = [
    "hold the full-front reference stance",
    "use a full-body three-quarter weight shift",
    "show the full side-oriented stance",
    "complete a restrained rear three-quarter turn",
    "hold a lower-body front stance with both feet readable",
    "use a lower-body three-quarter stance with one foot offset",
    "hold a tight on-foot side stance focused on the shoe profile",
    "finish one tiny controlled step in a tight on-foot frame"
  ];
  return {
    id: `${studioSubfamilies[studioShotIndex]}-${variant + 1}`,
    category: "studio",
    directive: `Person action lock: ${cores[studioShotIndex]}. ${variant === 0 ? "Keep both empty hands relaxed and the pose neutral." : "Use a slightly softer weight transfer and a more incidental finish than the first studio version."} Preserve the exact studio continuity and do not repeat another shot's body orientation or foot placement.`,
    poseType: studioShotIndex === 7 ? "walking" : "standing",
    diversityFamily: studioSubfamilies[studioShotIndex],
    bodyOrientation: orientation[studioShotIndex],
    footwork: footwork[studioShotIndex],
    movementPhase: studioShotIndex === 3 || studioShotIndex === 7 ? "settling" : "still",
    handTask: "emptyRelaxed",
    framing: studioShotIndex <= 3 ? "fullFigure" : studioShotIndex <= 5 ? "waistToFloor" : "onFootDetail",
    compatibleImageTypes: ["产品上脚图"],
    studioShotIndex,
    handheldPolicy: "none",
    shoeVisibilityRisk: "low",
    anatomyRisk: studioShotIndex === 7 ? "medium" : "low",
    weight: 1
  };
});

export const personActionLibrary: PersonActionDefinition[] = [
  ...generalFamilySpecs.flatMap(buildActionFamily),
  ...buildActionFamily(seatedSpec),
  ...mirrorActions,
  ...studioActions
];

export const PERSON_ACTION_LIBRARY_EXPECTED_COUNT = 300;

if (personActionLibrary.length !== PERSON_ACTION_LIBRARY_EXPECTED_COUNT) {
  throw new Error(`Person action library must contain exactly ${PERSON_ACTION_LIBRARY_EXPECTED_COUNT} actions; received ${personActionLibrary.length}.`);
}
