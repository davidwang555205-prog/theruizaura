import { NARRATIVE_TOPIC_CATALOG } from "./catalog";
import type { NarrativeTopicConfig, NarrativeTopicId } from "./types";

function normalizeTopic(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function resolveNarrativeTopic(input: string): NarrativeTopicConfig | null {
  const normalized = normalizeTopic(input);
  if (!normalized) return null;
  return NARRATIVE_TOPIC_CATALOG.find((topic) =>
    normalizeTopic(topic.id) === normalized
    || normalizeTopic(topic.label) === normalized
    || topic.aliases.some((alias) => normalizeTopic(alias) === normalized)
  ) ?? null;
}

export function narrativeTopicId(input: string): NarrativeTopicId | null {
  return resolveNarrativeTopic(input)?.id ?? null;
}

export function topicMatches(input: string, target: string): boolean {
  const topic = resolveNarrativeTopic(input);
  if (!topic) return false;
  const targetTopic = resolveNarrativeTopic(target);
  const normalizedTarget = normalizeTopic(target);
  return topic.id === normalizedTarget
    || normalizeTopic(topic.label) === normalizedTarget
    || Boolean(targetTopic && targetTopic.id === topic.id);
}

export function defaultSceneLabelsForTopic(input: string) {
  return resolveNarrativeTopic(input)?.defaultSceneLabels ?? [];
}
