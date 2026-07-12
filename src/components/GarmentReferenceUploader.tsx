import { useEffect, useRef, useState } from "react";

export type GarmentReferenceRole = "front" | "back" | "side" | "fabric" | "detail";
export type GarmentReference = { id: string; name: string; size: number; url: string; role: GarmentReferenceRole };

const roleLabels: Record<GarmentReferenceRole, string> = { front: "正面完整图", back: "背面完整图", side: "侧面 / 45°图", fabric: "面料 / 垂坠", detail: "关键细节" };

export function GarmentReferenceUploader({ value, onChange }: { value: GarmentReference[]; onChange: (next: GarmentReference[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previous = useRef<GarmentReference[]>(value);
  useEffect(() => { previous.current = value; }, [value]);
  useEffect(() => () => previous.current.forEach((item) => URL.revokeObjectURL(item.url)), []);
  const addFiles = (files: File[]) => {
    const selected = files.filter((file) => /image\/(png|jpeg|webp)/.test(file.type)).slice(0, Math.max(0, 5 - value.length));
    onChange([...value, ...selected.map((file, index) => ({ id: `${file.name}-${file.lastModified}-${index}`, name: file.name, size: file.size, url: URL.createObjectURL(file), role: value.length === 0 && index === 0 ? "front" as const : "detail" as const }))]);
  };
  const remove = (id: string) => { const item = value.find((entry) => entry.id === id); if (item) URL.revokeObjectURL(item.url); onChange(value.filter((entry) => entry.id !== id)); };
  return <div className="space-y-3 rounded-[20px] bg-aura-cream p-4 ring-1 ring-aura-beige/70">
    <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-medium">服装参考图（4–5张）</p><p className="mt-1 text-xs leading-5 text-aura-muted">仅在当前浏览器本地预览，不会上传或写入 Prompt。刷新页面后需要重新选择，正面完整图为必需。</p></div><span className="text-xs text-aura-muted">{value.length}/5</span></div>
    <button type="button" className="rounded-[14px] bg-white px-3 py-2 text-xs ring-1 ring-aura-beige" onClick={() => inputRef.current?.click()}>选择参考图</button>
    <input ref={inputRef} className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(event) => { addFiles(Array.from(event.target.files ?? [])); event.target.value = ""; }} />
    {value.length < 4 && <p className="text-xs text-aura-muted">还需要 {4 - value.length} 张参考图后才允许生成正式服装 Prompt。</p>}
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{value.map((item) => <div key={item.id} className="overflow-hidden rounded-[14px] bg-white ring-1 ring-aura-beige"><img src={item.url} alt={item.name} className="aspect-square w-full object-cover" /><div className="space-y-2 p-2"><select className="w-full rounded-lg border border-aura-beige bg-white p-1 text-xs" value={item.role} onChange={(event) => { const role = event.target.value as GarmentReferenceRole; onChange(value.map((entry) => entry.id === item.id ? { ...entry, role } : role === "front" && entry.role === "front" ? { ...entry, role: "detail" } : entry)); }}>{Object.entries(roleLabels).map(([role, label]) => <option key={role} value={role}>{label}</option>)}</select><p className="truncate text-[11px] text-aura-muted">{item.name}</p><button type="button" className="text-xs underline" onClick={() => remove(item.id)}>删除</button></div></div>)}</div>
  </div>;
}

export function validateGarmentReferences(value: GarmentReference[]) {
  const frontCount = value.filter((item) => item.role === "front").length;
  return { valid: value.length >= 4 && value.length <= 5 && frontCount === 1, totalCount: value.length, frontCount };
}
export function hasValidGarmentReferences(value: GarmentReference[]) { return validateGarmentReferences(value).valid; }
