import type { TemplateItem } from "../types";

const STORAGE_KEY = "theruiz-aura-custom-templates";

const isTemplateArray = (value: unknown): value is TemplateItem[] => Array.isArray(value);

export function getCustomTemplates(): TemplateItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return isTemplateArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomTemplate(template: TemplateItem): TemplateItem[] {
  const templates = getCustomTemplates();
  const next = [template, ...templates.filter((item) => item.id !== template.id)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function deleteCustomTemplate(id: string): TemplateItem[] {
  const next = getCustomTemplates().filter((template) => template.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
