// Global Immersive Narrative rule, one source for every Topic.
//
// Emotion never creates a new action. An internal state (quiet, settled,
// unhurried, relaxed, after work, pause, slows, stays) may change how the
// existing action is performed, but it may never introduce a new visible or
// audible action.
//
// This sentence is the only wording the compiler emits. The banned patterns
// below are never copied into a model-facing script: they exist so that a
// future upstream patch, topic, or primitive that reintroduces an emotional
// release action fails validation instead of silently reaching the video model.
export const EMOTION_NEVER_ACTS_RULE =
  "Emotion never creates a new action. Quiet, settled, unhurried, relaxed, after work, pause, slows, and stays remain ordinary body states: they do not become a performed gesture, an added visible response, an audible reaction, or an emotional pause. Default emotion execution is neutral, internally occupied, and unperformed.";

export type ForbiddenEmotionalReleasePattern = {
  id: string;
  pattern: RegExp;
};

// The banned default emotional release wording, exactly as the Immersive
// Narrative brief lists it.
export const FORBIDDEN_EMOTIONAL_RELEASE_PATTERNS: ForbiddenEmotionalReleasePattern[] = [
  { id: "sigh", pattern: /\bsigh(?:s|ed|ing)?\b/i },
  { id: "soft_sigh", pattern: /\bsoft\s+sigh(?:s|ed|ing)?\b/i },
  { id: "deep_breath", pattern: /\bdeep\s+breath\b/i },
  { id: "visible_exhale", pattern: /\bvisible\s+exhale\b/i },
  { id: "audible_exhale", pattern: /\baudible\s+exhale\b/i },
  { id: "breathes_out", pattern: /\bbreath(?:e|es|ing)?\s+out\b/i },
  { id: "lets_out_a_breath", pattern: /\blets?\s+out\s+a\s+breath\b/i },
  { id: "relieved_breath", pattern: /\brelieved\s+breath\b/i },
  { id: "emotional_exhale", pattern: /\bemotional\s+exhale\b/i },
  { id: "shoulders_drop_with_relief", pattern: /\bshoulders?\s+drop\w*\s+with\s+relief\b/i },
  { id: "eyes_close_in_relief", pattern: /\beyes?\s+clos\w+\s+in\s+relief\b/i },
  { id: "self_conscious_smile", pattern: /\bself-conscious\s+smile\b/i },
  { id: "emotional_head_tilt", pattern: /\bemotional\s+head\s+tilt\b/i },
  { id: "performed_emotional_pause", pattern: /\bperformed\s+emotional\s+pause\b/i },
  { id: "breath_as_emotional_action", pattern: /\b(?:breath|breathe|breathing)\b[^.\n]{0,40}\b(?:emotional|performed|audible|visible|relief)\b/i },
];

// A sound cue may never make breathing itself audible as an emotional release.
// Ordinary breathing stays part of the natural performance; it is never written
// as a cue that the video model has to perform.
export const FORBIDDEN_SOUND_CUE_PATTERNS: ForbiddenEmotionalReleasePattern[] = [
  { id: "breath_cue", pattern: /\bbreath(?:e|es|ing)?\b/i },
  { id: "sigh_cue", pattern: /\bsigh(?:s|ed|ing)?\b/i },
  { id: "exhale_cue", pattern: /\bexhal(?:e|es|ed|ing|ation)\b/i },
  { id: "relief_cue", pattern: /\brelie(?:f|ved)\b/i },
];

function matchingIds(patterns: ForbiddenEmotionalReleasePattern[], text: string) {
  return patterns.filter((entry) => entry.pattern.test(text)).map((entry) => entry.id);
}

export function findForbiddenEmotionalReleaseWording(text: string) {
  return matchingIds(FORBIDDEN_EMOTIONAL_RELEASE_PATTERNS, text);
}

export function findForbiddenSoundCueWording(cue: string) {
  return matchingIds(FORBIDDEN_SOUND_CUE_PATTERNS, cue);
}
