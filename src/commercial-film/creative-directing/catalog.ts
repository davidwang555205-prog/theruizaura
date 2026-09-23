import type { CommercialDirectorConceptId } from "../director-concept/types";
import type { CommercialIntentId } from "../types";
import type {
  CommercialV14StructureType,
  CommercialV14VisualPriority,
} from "./types";

export const V14_TITLE_BY_INTENT_AND_CONCEPT: Partial<
  Record<`${CommercialIntentId}:${CommercialDirectorConceptId}`, string>
> = {
  "URBAN_MOTION:STATIC_CAMERA_FILM": "THE CITY MOVES AROUND HER",
  "DAILY_STYLING:STATIC_CAMERA_FILM": "THE DAY OPENS QUIETLY",
  "PRODUCT_CRAFT:STATIC_CAMERA_FILM": "DETAIL IN USE",
  "NEW_ARRIVAL:STATIC_CAMERA_FILM": "A FAMILIAR PLACE, AGAIN",
};

export const V14_TITLE_BY_CONCEPT: Record<CommercialDirectorConceptId, string> = {
  STATIC_CAMERA_FILM: "THE FRAME WAITS",
  PARTIAL_OBSCURATION: "SEEN IN PARTS",
  EDGE_OF_FRAME: "AT THE EDGE",
  THRESHOLD_CHAIN: "AFTER THE DOOR",
  REFLECTION_WORLD: "BEFORE THE DIRECT VIEW",
  LIGHT_REVEAL: "LIGHT ARRIVES FIRST",
  WORLD_MOVES_SUBJECT_SETTLES: "THE CITY MOVES. SHE DOESN'T.",
  REPEATED_GESTURE: "AGAIN, DIFFERENTLY",
};

export const V14_PROPOSITION_INTENT_CORE: Record<CommercialIntentId, string> = {
  URBAN_MOTION:
    "The city keeps its pace, but the film only finds the product when her body changes tempo inside that movement",
  DAILY_STYLING:
    "The look is finished in private, but it only becomes believable once the first street step subjects it to real movement",
  QUIET_LUXURY:
    "Nothing in the room asks for attention, yet the product becomes readable when the body's ordinary weight changes the material",
  PRODUCT_CRAFT:
    "The product is not introduced as an object; it becomes legible only after a real task changes how the body uses it",
  NEW_ARRIVAL:
    "A familiar destination stays ordinary, but the product becomes part of it only when the arrival changes from approach into settled use",
};

export const V14_PROPOSITION_CONCEPT_TURN: Record<CommercialDirectorConceptId, string> = {
  STATIC_CAMERA_FILM:
    "and the camera refuses to chase, so the change must enter a composition that is already waiting",
  PARTIAL_OBSCURATION:
    "and the camera withholds part of the body until the moment itself opens the view",
  EDGE_OF_FRAME:
    "and the composition keeps her at the edge so the product is discovered rather than presented",
  THRESHOLD_CHAIN:
    "and a real crossing has to change what the viewer can see before the worn relationship reads",
  REFLECTION_WORLD:
    "and the indirect image has to resolve into a physical one before the product is understood",
  LIGHT_REVEAL:
    "and light has to reach the material before the camera chooses it",
  WORLD_MOVES_SUBJECT_SETTLES:
    "and the moving world has to become the contrast that makes her stillness visible",
  REPEATED_GESTURE:
    "and the returning gesture has to land differently before recognition becomes possible",
};

export const V14_TENSION_BY_INTENT: Record<CommercialIntentId, {
  from: string;
  to: string;
  line: string;
}> = {
  URBAN_MOTION: {
    from: "moving at street pace",
    to: "still at the curb",
    line: "The route remains alive while the body changes tempo at one real street point.",
  },
  DAILY_STYLING: {
    from: "private, unfinished look",
    to: "public, lived-in look",
    line: "The styling moves from an interior decision into the first real step outside.",
  },
  QUIET_LUXURY: {
    from: "unnoticed room",
    to: "material detail visible through use",
    line: "The room stays quiet while ordinary weight makes the material relationship undeniable.",
  },
  PRODUCT_CRAFT: {
    from: "task before product is seen",
    to: "foot-ground relationship readable in use",
    line: "Preparation turns into a physical task that exposes one real product relationship.",
  },
  NEW_ARRIVAL: {
    from: "destination ahead",
    to: "place inhabited",
    line: "The arrival moves from approach into a settled spatial state.",
  },
};

export const V14_DEVICE_CARRIER_POOLS: Record<CommercialDirectorConceptId, string[]> = {
  STATIC_CAMERA_FILM: [
    "architecture edge",
    "delivery cyclist",
    "light falloff",
    "foreground pedestrian",
    "closing umbrella",
  ],
  PARTIAL_OBSCURATION: [
    "door frame",
    "foreground passerby",
    "glass surface",
    "furniture edge",
    "shadow band",
  ],
  EDGE_OF_FRAME: [
    "architecture edge",
    "foreground shoulder",
    "revolving door",
    "delivery cart",
    "door opening",
  ],
  THRESHOLD_CHAIN: [
    "door frame",
    "curb edge",
    "glass line",
    "shadow threshold",
    "architectural opening",
  ],
  REFLECTION_WORLD: [
    "window glass",
    "polished surface",
    "reflected pedestrian",
    "dark window",
    "direct surface",
  ],
  LIGHT_REVEAL: [
    "light falloff",
    "shadow edge",
    "window light",
    "reflected light",
    "stable direct light",
  ],
  WORLD_MOVES_SUBJECT_SETTLES: [
    "passing bus",
    "pedestrian flow",
    "moving reflection",
    "delivery cyclist",
    "background traffic",
  ],
  REPEATED_GESTURE: [
    "coat cuff",
    "garment hem",
    "sleeve edge",
    "cuff line",
    "coat edge",
  ],
};

export const V14_MOMENT_CARRIER_POOLS: Record<CommercialDirectorConceptId, string[]> = {
  STATIC_CAMERA_FILM: [
    "delivery cyclist",
    "passing pedestrian",
    "closing umbrella",
    "passing bus",
    "moving reflection",
  ],
  PARTIAL_OBSCURATION: [
    "curtain edge",
    "closing door",
    "foreground cyclist",
    "foreground shoulder",
    "passing pedestrian",
  ],
  EDGE_OF_FRAME: [
    "passing cyclist",
    "revolving door",
    "delivery cart",
    "foreground shoulder",
    "door opening",
  ],
  THRESHOLD_CHAIN: [
    "revolving door",
    "door frame",
    "open doorway",
    "curb edge",
    "glass panel",
  ],
  REFLECTION_WORLD: [
    "window glass",
    "storefront glass",
    "dark window",
    "polished surface",
    "glass panel",
  ],
  LIGHT_REVEAL: [
    "passing vehicle",
    "window",
    "moving curtain",
    "reflective storefront",
    "passing shadow",
  ],
  WORLD_MOVES_SUBJECT_SETTLES: [
    "passing bus",
    "pedestrian flow",
    "moving reflection",
    "passing cyclist",
    "background traffic",
  ],
  REPEATED_GESTURE: [
    "coat cuff",
    "garment hem",
    "sleeve edge",
    "cuff line",
    "coat edge",
  ],
};

export type V14CarrierCategory =
  | "transit"
  | "architectural"
  | "reflective"
  | "light"
  | "body";

export const V14_CARRIER_CATEGORY: Record<string, V14CarrierCategory> = {
  "architecture edge": "architectural",
  "delivery cyclist": "transit",
  "light falloff": "light",
  "foreground pedestrian": "transit",
  "closing umbrella": "transit",
  "door frame": "architectural",
  "foreground passerby": "transit",
  "glass surface": "reflective",
  "furniture edge": "architectural",
  "shadow band": "light",
  "foreground shoulder": "body",
  "door opening": "architectural",
  "revolving door": "architectural",
  "delivery cart": "transit",
  "curb edge": "architectural",
  "glass line": "reflective",
  "shadow threshold": "light",
  "architectural opening": "architectural",
  "window glass": "reflective",
  "polished surface": "reflective",
  "reflected pedestrian": "reflective",
  "dark window": "reflective",
  "direct surface": "reflective",
  "shadow edge": "light",
  "window light": "light",
  "reflected light": "light",
  "stable direct light": "light",
  "background traffic": "transit",
  "passing bus": "transit",
  "pedestrian flow": "transit",
  "architectural depth": "architectural",
  "moving reflection": "reflective",
  "repeated frame edge": "architectural",
  "garment movement": "body",
  "foot contact": "body",
  "door hinge": "architectural",
  "hand-to-cuff gesture": "body",
  "garment hem": "body",
  "sleeve edge": "body",
  "cuff line": "body",
  "coat edge": "body",
  "background change": "transit",
  "curb line": "architectural",
  "street crossing mark": "architectural",
  "coat cuff": "body",
  "window sill": "architectural",
  "chair edge": "architectural",
  "workbench edge": "architectural",
  "cafe doorway": "architectural",
  "passing cyclist": "transit",
  "window reflection": "reflective",
  "arriving bicycle": "transit",
  "passing pedestrian": "transit",
  "foreground cyclist": "transit",
  "curtain edge": "architectural",
  "open doorway": "architectural",
  "glass panel": "reflective",
  "storefront glass": "reflective",
  "passing vehicle window": "light",
  "moving curtain": "light",
  "closing door": "architectural",
  "passing shadow": "light",
  "passing vehicle": "transit",
  "reflective storefront": "reflective",
};

export const V14_INTENT_EXTRA_CARRIERS: Record<CommercialIntentId, [string, string]> = {
  URBAN_MOTION: ["curb line", "street crossing mark"],
  DAILY_STYLING: ["door hinge", "coat cuff"],
  QUIET_LUXURY: ["window sill", "chair edge"],
  PRODUCT_CRAFT: ["workbench edge", "garment hem"],
  NEW_ARRIVAL: ["revolving door", "cafe doorway"],
};

export const V14_WORLD_MOVES_INTENT_CARRIERS: Record<CommercialIntentId, [string, string]> = {
  URBAN_MOTION: ["passing bus", "background traffic"],
  DAILY_STYLING: ["passing cyclist", "moving reflection"],
  QUIET_LUXURY: ["window reflection", "pedestrian flow"],
  PRODUCT_CRAFT: ["moving reflection", "pedestrian flow"],
  NEW_ARRIVAL: ["arriving bicycle", "passing pedestrian"],
};

export const V14_WORLD_MOVES_CARRIERS_BY_INTENT: Record<CommercialIntentId, string[]> = {
  URBAN_MOTION: ["passing bus", "pedestrian flow", "background traffic", "delivery cyclist", "moving reflection"],
  DAILY_STYLING: ["passing cyclist", "moving reflection", "pedestrian flow", "revolving door", "background traffic"],
  QUIET_LUXURY: ["window reflection", "pedestrian flow", "passing bus", "chair edge", "background traffic"],
  PRODUCT_CRAFT: ["moving reflection", "workbench edge", "pedestrian flow", "passing bus", "garment hem"],
  NEW_ARRIVAL: ["arriving bicycle", "revolving door", "passing pedestrian", "moving reflection", "cafe doorway"],
};

export const V14_INTENT_EVENT_TWEAKS: Record<CommercialIntentId, {
  action: string;
  cause: string;
  before: string;
  after: string;
  consequence: string;
  reveal: string;
}> = {
  URBAN_MOTION: {
    action: "while the street continues moving behind her",
    cause: "The city has already established its pace.",
    before: "Traffic is still crossing the deeper frame.",
    after: "The street rhythm continues around her.",
    consequence: "The route can continue without resetting.",
    reveal: "The city remains in motion as the worn line becomes readable.",
  },
  DAILY_STYLING: {
    action: "as the private look meets the first public step",
    cause: "The preparation has already produced a finished look.",
    before: "The outfit is still held inside the private room.",
    after: "The look is now being tested in real street movement.",
    consequence: "The next beat can carry the finished look into public space.",
    reveal: "The worn relationship reads when private preparation becomes public movement.",
  },
  QUIET_LUXURY: {
    action: "while the room stays quiet around the change",
    cause: "The room has established a restrained, private tone.",
    before: "The material is held at a quiet distance.",
    after: "The body's ordinary weight makes the material relationship visible.",
    consequence: "The next beat can stay intimate without explaining the product.",
    reveal: "The worn line becomes readable when the room's restraint changes through use.",
  },
  PRODUCT_CRAFT: {
    action: "as the preparation task resolves into a real working action",
    cause: "A practical task has already put the body into a working state.",
    before: "The product relationship is still implied by the task.",
    after: "The foot and garment relationship is readable in the completed action.",
    consequence: "The next beat can hold the confirmed relationship inside the body.",
    reveal: "The product reads because the working action exposes the relationship.",
  },
  NEW_ARRIVAL: {
    action: "as the destination changes from approach into a place",
    cause: "The approach has already established the destination direction.",
    before: "The destination is still ahead of her in the frame.",
    after: "The destination surrounds her as a settled spatial state.",
    consequence: "The next beat can remain in the place instead of restarting the journey.",
    reveal: "The worn relationship reads when the destination stops being a target.",
  },
};

export const V14_CONCEPT_SIGNATURE_MODIFIERS: Record<CommercialDirectorConceptId, {
  action: string;
  cause: string;
  visual: string;
}> = {
  STATIC_CAMERA_FILM: {
    action: "without the frame changing position",
    cause: "The composition has been waiting before the movement began.",
    visual: "The fixed composition becomes readable only after the moving condition clears.",
  },
  PARTIAL_OBSCURATION: {
    action: "while a real foreground layer keeps part of the body out of view",
    cause: "The partial view has already withheld part of the body.",
    visual: "The obstruction leaves just enough information for the worn relationship to resolve.",
  },
  EDGE_OF_FRAME: {
    action: "while the subject stays at the visual edge of the frame",
    cause: "The subject is deliberately held away from the center.",
    visual: "The edge relationship turns the visual change into discovery rather than presentation.",
  },
  THRESHOLD_CHAIN: {
    action: "at the moment a real boundary changes the spatial condition",
    cause: "A physical threshold is already dividing the space.",
    visual: "The crossing changes access and makes the new spatial state readable.",
  },
  REFLECTION_WORLD: {
    action: "before the direct view replaces the indirect one",
    cause: "The image has already been layered through a real surface.",
    visual: "The indirect view resolves into a physical worn relationship.",
  },
  LIGHT_REVEAL: {
    action: "as the light condition itself changes",
    cause: "The material is already being held by shadow or falloff.",
    visual: "Light and body position meet before the material becomes readable.",
  },
  WORLD_MOVES_SUBJECT_SETTLES: {
    action: "while the environment keeps moving behind her",
    cause: "The world has already established a different tempo.",
    visual: "The stable body becomes the readable point inside the continuing world.",
  },
  REPEATED_GESTURE: {
    action: "as the gesture returns with one visible variation",
    cause: "The same physical relationship has already occurred once.",
    visual: "The variation turns repetition into recognition.",
  },
};

export const V14_SIGNATURE_EVENT_SPECS: Record<V14CarrierCategory, {
  whoOrWhat: string;
  action: string;
  cause: string;
  beforeState: string;
  afterState: string;
  visualResult: string;
  nextBeatTrigger: string;
  nextBeatConsequence: string;
}> = {
  transit: {
    whoOrWhat: "A cyclist and a pedestrian",
    action: "cross the foreground close to the lens",
    cause: "A real flow of street traffic enters the foreground before the planned action.",
    beforeState: "Her full body and the worn footwear are visible against the background.",
    afterState: "The cyclist and pedestrian clear the lens, leaving her complete worn line readable again.",
    visualResult: "Her lower body disappears for one beat and returns with a clearer worn relationship.",
    nextBeatTrigger: "The moving figures leave the foreground.",
    nextBeatConsequence: "The next beat can read the complete body and foot-to-ground relationship without interruption.",
  },
  architectural: {
    whoOrWhat: "The real architectural edge",
    action: "cuts across the frame at the point where she reaches it",
    cause: "A physical boundary enters the composition before her action completes.",
    beforeState: "The frame offers an open view of her body and the spatial relationship.",
    afterState: "The boundary closes part of the view, then releases it as she crosses.",
    visualResult: "The spatial access changes from open to partial and back to readable.",
    nextBeatTrigger: "The boundary clears or opens.",
    nextBeatConsequence: "The next beat receives a changed spatial state and a clearer worn relationship.",
  },
  reflective: {
    whoOrWhat: "Her real reflection",
    action: "appears in the visible surface before she enters the direct frame",
    cause: "A reflective surface catches her body before the direct view does.",
    beforeState: "Only the physical room and indirect image are visible.",
    afterState: "The reflected view resolves into the direct physical view.",
    visualResult: "An indirect image becomes a direct worn-product read.",
    nextBeatTrigger: "The reflection resolves into the physical body.",
    nextBeatConsequence: "The next beat can trust the direct view and turn it into product context.",
  },
  light: {
    whoOrWhat: "A moving band of light",
    action: "crosses her body at the exact point where she changes position",
    cause: "The light condition changes before the body settles.",
    beforeState: "The material is held in shadow and the worn line is only partly readable.",
    afterState: "The light reaches the material and the worn line becomes readable without magnification.",
    visualResult: "A changing light condition reveals the material surface.",
    nextBeatTrigger: "The light band reaches its stable position.",
    nextBeatConsequence: "The next beat can hold the material read before the light changes again.",
  },
  body: {
    whoOrWhat: "Her leading foot and the garment edge",
    action: "make contact with the new surface while the body weight shifts",
    cause: "A real change of surface makes the body resolve the step differently.",
    beforeState: "The foot is still moving through the old spatial condition.",
    afterState: "The foot lands, the garment settles, and the worn relationship becomes readable.",
    visualResult: "Ground contact changes how the lower body and product relationship are seen.",
    nextBeatTrigger: "The weight settles completely onto the leading foot.",
    nextBeatConsequence: "The next beat can hold the grounded relationship inside the complete body line.",
  },
};

export const V14_SIGNATURE_EVENT_MECHANISMS: Record<CommercialDirectorConceptId, {
  whoLabel: string;
  action: string;
  cause: string;
  beforeState: string;
  afterState: string;
  visualResult: string;
  nextBeatTrigger: string;
  nextBeatConsequence: string;
  revealCause: string;
}> = {
  STATIC_CAMERA_FILM: {
    whoLabel: "The {carrier}",
    action: "moves through the waiting composition before she enters it",
    cause: "A real element is already moving inside the fixed frame.",
    beforeState: "The composition is empty enough to show her complete body and worn outline.",
    afterState: "The moving element clears and the complete worn line settles into the fixed frame.",
    visualResult: "A fixed composition becomes readable only after the moving element has passed.",
    nextBeatTrigger: "The moving element leaves the composition.",
    nextBeatConsequence: "The next beat inherits a stable frame and a complete worn read.",
    revealCause: "The frame stays fixed, and the moving element clears the full worn line into view.",
  },
  PARTIAL_OBSCURATION: {
    whoLabel: "The {carrier}",
    action: "crosses close to the lens and hides her lower body for one beat",
    cause: "A foreground layer crosses before the worn relationship can be fully read.",
    beforeState: "The body and footwear are visible as separate parts of the frame.",
    afterState: "The foreground layer clears and restores the complete lower-body relationship.",
    visualResult: "The lower body disappears briefly and returns with a clearer worn relationship.",
    nextBeatTrigger: "The foreground layer clears the lens.",
    nextBeatConsequence: "The next beat can read the full foot and garment relationship without the obstruction.",
    revealCause: "The foreground obstruction clears and restores the complete worn relationship.",
  },
  EDGE_OF_FRAME: {
    whoLabel: "The {carrier}",
    action: "takes the center of the composition and leaves her body at the frame edge",
    cause: "A moving element claims the center while she remains near the visual edge.",
    beforeState: "The product and body are spread across the center of the composition.",
    afterState: "The center is occupied by the moving element, while the worn line resolves at the edge.",
    visualResult: "The composition changes from centered visibility to an edge-based product discovery.",
    nextBeatTrigger: "The moving element settles or leaves the center.",
    nextBeatConsequence: "The next beat can hold the off-center worn relationship without re-centering it.",
    revealCause: "The edge composition becomes stable and the worn line resolves without being centered.",
  },
  THRESHOLD_CHAIN: {
    whoLabel: "The {carrier}",
    action: "defines the crossing boundary as she reaches it",
    cause: "A physical boundary changes the spatial access before she crosses.",
    beforeState: "The destination and body are visible from one side of the boundary.",
    afterState: "The boundary releases her into the new space and the worn relationship becomes readable.",
    visualResult: "Spatial access changes from closed or partial to a readable new state.",
    nextBeatTrigger: "The crossing completes.",
    nextBeatConsequence: "The next beat remains inside the new spatial state instead of opening another route.",
    revealCause: "The crossed boundary changes the space and makes the worn relationship readable.",
  },
  REFLECTION_WORLD: {
    whoLabel: "Her reflection in the {carrier}",
    action: "appears before she enters the direct frame",
    cause: "A real reflective surface carries her image before the direct view does.",
    beforeState: "Only the layered surface and an indirect version of the body are visible.",
    afterState: "The reflection resolves into a direct physical view of the worn relationship.",
    visualResult: "An indirect image becomes a direct worn-product read.",
    nextBeatTrigger: "The reflected image resolves into the direct body.",
    nextBeatConsequence: "The next beat can hold the direct read without another reflective layer.",
    revealCause: "The reflection resolves into a direct physical view and the worn relationship becomes readable.",
  },
  LIGHT_REVEAL: {
    whoLabel: "The light through the {carrier}",
    action: "crosses her body at the exact point where she changes position",
    cause: "A real change in light condition reaches the material before the body settles.",
    beforeState: "The material is held in shadow and the worn line is only partly readable.",
    afterState: "The light reaches the material and the worn line becomes readable without magnification.",
    visualResult: "The changing light reveals the material surface and the body relationship.",
    nextBeatTrigger: "The light reaches its stable position.",
    nextBeatConsequence: "The next beat can hold the material read before the light changes again.",
    revealCause: "The changing light reaches the material and exposes the worn relationship.",
  },
  WORLD_MOVES_SUBJECT_SETTLES: {
    whoLabel: "The {carrier}",
    action: "continues moving behind her as she slows and settles",
    cause: "The surrounding world keeps a different tempo while the body changes pace.",
    beforeState: "The body is moving with the surrounding environment.",
    afterState: "The body becomes still while the world continues moving behind it.",
    visualResult: "The contrast between movement and stillness makes the worn line readable.",
    nextBeatTrigger: "The body settles completely inside the moving world.",
    nextBeatConsequence: "The next beat can hold the still worn relationship against the continuing environment.",
    revealCause: "The moving world contrasts with the settled body and makes the worn line readable.",
  },
  REPEATED_GESTURE: {
    whoLabel: "The {carrier}",
    action: "returns in the same physical relationship with one visible variation",
    cause: "The same gesture or spatial relationship has already occurred once.",
    beforeState: "The first gesture has established the body and frame relationship.",
    afterState: "The repeated gesture lands differently and makes the worn relationship recognizable.",
    visualResult: "A repeated physical relationship resolves into recognition.",
    nextBeatTrigger: "The variation completes the returning gesture.",
    nextBeatConsequence: "The next beat holds the recognition without adding another action.",
    revealCause: "The returning gesture lands differently and makes the worn relationship readable.",
  },
};

export const V14_MOMENT_INTERRUPTIONS: Record<V14CarrierCategory, string> = {
  transit: "A moving street element occupies the foreground and removes part of the body from view.",
  architectural: "A real boundary closes across the frame and changes the available space.",
  reflective: "A real surface holds an indirect image before the direct body appears.",
  light: "A moving light or shadow condition crosses the body and changes the visible surface.",
  body: "A physical contact or garment change alters the lower-body silhouette.",
};

export const V14_MOMENT_MEMORY_REASONS: Record<CommercialDirectorConceptId, string> = {
  STATIC_CAMERA_FILM: "The frame stays fixed while the moving world clears around her.",
  PARTIAL_OBSCURATION: "The image withholds part of the body, then returns it with a changed meaning.",
  EDGE_OF_FRAME: "The center is taken away from her and the worn line is discovered at the edge.",
  THRESHOLD_CHAIN: "A real boundary changes the space at the instant she crosses it.",
  REFLECTION_WORLD: "An indirect image becomes physical, making the product read through transformation.",
  LIGHT_REVEAL: "Light changes the material for one readable beat, then gives the image back to the room.",
  WORLD_MOVES_SUBJECT_SETTLES: "Movement and stillness separate in the same frame, making the body readable.",
  REPEATED_GESTURE: "A repeated gesture returns with a changed environment and becomes recognition.",
};

export const V14_MOMENT_VARIANTS: Record<V14CarrierCategory, string[]> = {
  transit: [
    "The movement clears on the second beat, not immediately.",
    "A gap opens in the moving foreground before the reveal.",
    "The crossing body leaves a clean edge where the worn line can read.",
    "The foreground clears only after the body has already changed position.",
    "A moving layer passes twice before the frame becomes readable.",
  ],
  architectural: [
    "The boundary changes after a held beat.",
    "The opening resolves only after the body reaches it.",
    "The frame holds the threshold for one extra second.",
    "The boundary opens, then hesitates before releasing the view.",
    "A second architectural line crosses after the first one clears.",
  ],
  reflective: [
    "The indirect image lasts one beat longer than expected.",
    "The reflected view resolves only after the body turns.",
    "The surface keeps a trace of the image after the direct view.",
    "The reflection splits the body before joining it again.",
    "A second reflected edge crosses before the direct image settles.",
  ],
  light: [
    "The light reaches the material after a brief shadow.",
    "The bright edge arrives for one beat and does not stay.",
    "The light moves across the surface before the body resolves.",
    "The light returns once after the first pass has disappeared.",
    "A shadow crosses the material before the final light arrives.",
  ],
  body: [
    "The contact lands after the first step, not before it.",
    "The garment settles one beat after the foot.",
    "The body resolves through the surface contact.",
    "The weight shifts once before the contact becomes readable.",
    "The garment moves after the foot has already settled.",
  ],
};

export const V14_ENDING_IMAGES: Record<CommercialIntentId, string[]> = {
  URBAN_MOTION: [
    "She exits frame right while the camera stays on the empty curb, a cyclist crossing, and traffic continuing behind the crossing.",
    "The camera holds on the empty street sign and wet pavement after she leaves the frame left, with two pedestrians crossing the far edge.",
    "A bus moves behind the empty crossing point while the camera remains fixed and the pavement stays visible after she is gone.",
  ],
  DAILY_STYLING: [
    "The apartment door closes on her back while the camera stays on the empty hallway floor and the street visible through the glass.",
    "She steps out of frame right; the open door, moving coat sleeve, and street beyond remain in the final composition.",
    "The camera holds on the threshold after her shadow leaves, with a neighbor crossing the far side of the frame.",
  ],
  QUIET_LUXURY: [
    "She leaves frame left while the camera remains on the window light, chair edge, and empty floor where she stood.",
    "Her body exits the central frame; the chair, fabric edge, and a patch of window light remain fixed.",
    "The camera holds on the empty window seat while the light moves across the surface and the room stays still.",
  ],
  PRODUCT_CRAFT: [
    "She exits frame right while the camera holds on the dressing bench, a fallen hem, and the empty floor.",
    "The camera stays on the preparation surface after she leaves, with both feet out of frame and the room holding the final light.",
    "The action completes as she moves out of frame; the bench, wardrobe edge, and floor remain in the final composition.",
  ],
  NEW_ARRIVAL: [
    "She stays inside the frame while a passerby crosses the deeper plane and the cafe door swings behind her.",
    "The camera holds on the arrival space after she moves to the back of the composition, with a bicycle passing behind.",
    "The destination remains visible around her while another pedestrian crosses the far edge and the light stays on the wall.",
  ],
};

export const V14_ENDING_MEANINGS: Record<CommercialIntentId, string> = {
  URBAN_MOTION: "The route continues after the body changes tempo.",
  DAILY_STYLING: "The private styling has entered the public day.",
  QUIET_LUXURY: "The material read remains after the private moment resolves.",
  PRODUCT_CRAFT: "The observed product relationship returns to the complete working scene.",
  NEW_ARRIVAL: "The destination has become a place rather than a target.",
};

export const V14_PRODUCT_REVEAL_CAUSES: Record<CommercialDirectorConceptId, string[]> = {
  STATIC_CAMERA_FILM: [
    "The movement enters the waiting composition and makes the worn line readable.",
    "The background clears and allows the complete worn shape to settle into view.",
    "The frame holds long enough for the product to become part of the observed action.",
  ],
  PARTIAL_OBSCURATION: [
    "The foreground obstruction clears as the body settles.",
    "The closing layer opens just far enough for the worn relationship to read.",
    "The partial view resolves when the passing element leaves the frame.",
  ],
  EDGE_OF_FRAME: [
    "The body resolves at the edge and brings the product into a readable relationship.",
    "The edge composition holds the worn line without centering it.",
    "The frame finds the product only after the subject's placement becomes stable.",
  ],
  THRESHOLD_CHAIN: [
    "The threshold crossing completes and makes the product part of the new space.",
    "The boundary closes behind her as the worn relationship becomes clear.",
    "The new spatial state reveals the product through the act of entering it.",
  ],
  REFLECTION_WORLD: [
    "The indirect view resolves into a direct physical read.",
    "The reflected image clears into the real worn relationship.",
    "The surface stops dividing the frame and the product becomes physically present.",
  ],
  LIGHT_REVEAL: [
    "The light reaches the material and makes the worn relationship readable.",
    "The shadow edge moves away as the body settles.",
    "The changing light exposes the product without magnifying it.",
  ],
  WORLD_MOVES_SUBJECT_SETTLES: [
    "The body settles while the world keeps moving, allowing the product to read.",
    "The still body becomes the stable point inside the continuing environment.",
    "The environmental movement stays alive as the worn line resolves.",
  ],
  REPEATED_GESTURE: [
    "The returning gesture completes and makes the product role clear.",
    "The variation in the repeated action resolves into recognition.",
    "The second gesture gives the worn relationship a new readable context.",
  ],
};

export const V14_STRUCTURE_DEFINITIONS: Record<CommercialV14StructureType, {
  label: string;
  classicFiveRole: boolean;
  beats: Array<{
    structureRole: string;
    sourceShotRole: "WORLD" | "WEAR" | "DETAIL" | "HERO" | "RELEASE";
    function: string;
    productVisibilityGoal: string;
  }>;
}> = {
  CLASSIC_FIVE_ROLE: {
    label: "World / Wear / Detail / Hero / Release",
    classicFiveRole: true,
    beats: [
      { structureRole: "WORLD", sourceShotRole: "WORLD", function: "Establish the world before the product.", productVisibilityGoal: "Product secondary or absent." },
      { structureRole: "WEAR", sourceShotRole: "WEAR", function: "Make the worn relationship readable through action.", productVisibilityGoal: "Product readable within movement." },
      { structureRole: "DETAIL", sourceShotRole: "DETAIL", function: "Confirm one real product relationship.", productVisibilityGoal: "Product detail motivated by action." },
      { structureRole: "HERO", sourceShotRole: "HERO", function: "Resolve the film's idea through the worn product.", productVisibilityGoal: "Product clear at human scale." },
      { structureRole: "RELEASE", sourceShotRole: "RELEASE", function: "Return the film to the world.", productVisibilityGoal: "Product remains part of the afterimage." },
    ],
  },
  OBSCURE_REVEAL_INTERRUPT_RESOLVE_DISAPPEAR: {
    label: "Obscure / Reveal / Interrupt / Resolve / Disappear",
    classicFiveRole: false,
    beats: [
      { structureRole: "OBSCURE", sourceShotRole: "WORLD", function: "Begin with a partial or withheld view.", productVisibilityGoal: "Product absent or implied." },
      { structureRole: "REVEAL", sourceShotRole: "WEAR", function: "Let the obstruction clear into a readable action.", productVisibilityGoal: "Product becomes partially readable." },
      { structureRole: "INTERRUPT", sourceShotRole: "DETAIL", function: "Allow a real event to interrupt and redirect attention.", productVisibilityGoal: "One detail becomes clear through the interruption." },
      { structureRole: "RESOLVE", sourceShotRole: "HERO", function: "Complete the visual idea through the worn relationship.", productVisibilityGoal: "Product clear at natural scale." },
      { structureRole: "DISAPPEAR", sourceShotRole: "RELEASE", function: "Let the subject or image recede into the world.", productVisibilityGoal: "Product remains part of the afterimage." },
    ],
  },
  MOVE_MOVE_HOLD_SINGLE_ACTION_RELEASE: {
    label: "Move / Move / Hold / Single Action / Release",
    classicFiveRole: false,
    beats: [
      { structureRole: "MOVE", sourceShotRole: "WORLD", function: "Start inside real movement.", productVisibilityGoal: "Product secondary within motion." },
      { structureRole: "MOVE WITH CHANGE", sourceShotRole: "WEAR", function: "Change the spatial condition without breaking movement.", productVisibilityGoal: "Product readable through motion." },
      { structureRole: "HOLD", sourceShotRole: "DETAIL", function: "Let the world hold still around one grounded relationship.", productVisibilityGoal: "One grounded detail becomes readable." },
      { structureRole: "SINGLE ACTION", sourceShotRole: "HERO", function: "Complete one decisive action that resolves the idea.", productVisibilityGoal: "Product clear through the action." },
      { structureRole: "RELEASE", sourceShotRole: "RELEASE", function: "Leave the world continuing after the action.", productVisibilityGoal: "Product remains part of the lived afterimage." },
    ],
  },
  OBSERVE_APPROACH_CONTACT_RESOLVE_AFTERIMAGE: {
    label: "Observe / Approach / Contact / Resolve / Afterimage",
    classicFiveRole: false,
    beats: [
      { structureRole: "OBSERVE", sourceShotRole: "WORLD", function: "Observe the person inside a real context.", productVisibilityGoal: "Product secondary or absent." },
      { structureRole: "APPROACH", sourceShotRole: "WEAR", function: "Move toward a meaningful point of contact.", productVisibilityGoal: "Product becomes partially readable." },
      { structureRole: "CONTACT", sourceShotRole: "DETAIL", function: "Make the physical contact or surface relationship readable.", productVisibilityGoal: "Product detail motivated by contact." },
      { structureRole: "RESOLVE", sourceShotRole: "HERO", function: "Resolve the approach into a complete state.", productVisibilityGoal: "Product clear in context." },
      { structureRole: "AFTERIMAGE", sourceShotRole: "RELEASE", function: "Hold the world after the subject moves on.", productVisibilityGoal: "Product remains as part of the memory." },
    ],
  },
  REPEAT_REPEAT_CHANGE_BREAK_HERO_RELEASE: {
    label: "Repeat / Repeat With Change / Break Pattern / Hero / Release",
    classicFiveRole: false,
    beats: [
      { structureRole: "REPEAT", sourceShotRole: "WORLD", function: "Establish one recurring visual or physical principle.", productVisibilityGoal: "Product secondary within the pattern." },
      { structureRole: "REPEAT WITH CHANGE", sourceShotRole: "WEAR", function: "Repeat the principle with a visible variation.", productVisibilityGoal: "Product becomes readable through the variation." },
      { structureRole: "BREAK PATTERN", sourceShotRole: "DETAIL", function: "Interrupt the pattern with a real event.", productVisibilityGoal: "One product relationship becomes clear." },
      { structureRole: "HERO", sourceShotRole: "HERO", function: "Let the recurrence resolve into recognition.", productVisibilityGoal: "Product clear through the completed variation." },
      { structureRole: "RELEASE", sourceShotRole: "RELEASE", function: "Return to stillness or departure without a new idea.", productVisibilityGoal: "Product remains part of the final image." },
    ],
  },
  ARRIVE_DISCOVER_INTERACT_SETTLE_REMAIN: {
    label: "Arrive / Discover / Interact / Settle / Remain",
    classicFiveRole: false,
    beats: [
      { structureRole: "ARRIVE", sourceShotRole: "WORLD", function: "Enter the destination or situation.", productVisibilityGoal: "Product secondary in arrival." },
      { structureRole: "DISCOVER", sourceShotRole: "WEAR", function: "Let the new context reveal a product relationship.", productVisibilityGoal: "Product becomes readable." },
      { structureRole: "INTERACT", sourceShotRole: "DETAIL", function: "Use a natural point of contact to confirm the detail.", productVisibilityGoal: "Product detail in use." },
      { structureRole: "SETTLE", sourceShotRole: "HERO", function: "Let the body and product become part of the place.", productVisibilityGoal: "Product clear at human scale." },
      { structureRole: "REMAIN", sourceShotRole: "RELEASE", function: "Stay with the world after the action.", productVisibilityGoal: "Product remains part of the environment." },
    ],
  },
};

export const V14_STRUCTURE_BY_CONCEPT: Record<CommercialDirectorConceptId, CommercialV14StructureType> = {
  STATIC_CAMERA_FILM: "CLASSIC_FIVE_ROLE",
  PARTIAL_OBSCURATION: "OBSCURE_REVEAL_INTERRUPT_RESOLVE_DISAPPEAR",
  EDGE_OF_FRAME: "OBSERVE_APPROACH_CONTACT_RESOLVE_AFTERIMAGE",
  THRESHOLD_CHAIN: "ARRIVE_DISCOVER_INTERACT_SETTLE_REMAIN",
  REFLECTION_WORLD: "OBSCURE_REVEAL_INTERRUPT_RESOLVE_DISAPPEAR",
  LIGHT_REVEAL: "REPEAT_REPEAT_CHANGE_BREAK_HERO_RELEASE",
  WORLD_MOVES_SUBJECT_SETTLES: "MOVE_MOVE_HOLD_SINGLE_ACTION_RELEASE",
  REPEATED_GESTURE: "REPEAT_REPEAT_CHANGE_BREAK_HERO_RELEASE",
};

export const V14_VISUAL_PRIORITY_BY_ROLE: Record<
  "WORLD" | "WEAR" | "DETAIL" | "HERO" | "RELEASE",
  CommercialV14VisualPriority
> = {
  WORLD: {
    primary: "person and world relationship",
    secondary: "route movement and foreground life",
    suppressed: "footwear detail and close-up",
  },
  WEAR: {
    primary: "worn product inside natural movement",
    secondary: "body mechanics and garment relationship",
    suppressed: "paused product presentation",
  },
  DETAIL: {
    primary: "one real product relationship in use",
    secondary: "body mechanics and ground contact",
    suppressed: "isolated product beauty shot and pose",
  },
  HERO: {
    primary: "complete worn line at human scale",
    secondary: "environment and spatial context",
    suppressed: "packshot and product-only frame",
  },
  RELEASE: {
    primary: "world after the subject",
    secondary: "subject exit and environmental continuation",
    suppressed: "final product close-up and new beat",
  },
};
