import type { ShoeCategory, ShoeReferenceRole } from "./shoeProductTypes";

export type ShoeReferenceRoleInput = { role: ShoeReferenceRole | string };

export function normalizeShoeReferenceRole(role: ShoeReferenceRole | string): ShoeReferenceRole {
  if (role === "completeSide" || role === "sideFull") return "fullSide";
  return role as ShoeReferenceRole;
}

export function validateShoeReferenceRoles(category: ShoeCategory, references: ShoeReferenceRoleInput[], minCount: number, requiredRoles: ShoeReferenceRole[]) {
  if (category === "germanTrainer") return { ok: true as const, missingRoles: [] as ShoeReferenceRole[], primaryCount: 0, count: references.length };
  const roles = references.map((reference) => normalizeShoeReferenceRole(reference.role));
  const primaryCount = roles.filter((role) => role === "primary").length;
  const missingRoles = requiredRoles.filter((role) => !roles.includes(role));
  if (references.length < minCount) return { ok: false as const, reason: `当前品类至少需要 ${minCount} 张参考图。`, missingRoles, primaryCount, count: references.length };
  if (primaryCount !== 1) return { ok: false as const, reason: primaryCount === 0 ? "请指定 1 张主参考图。" : "主参考图只能指定 1 张，请重新分配角色。", missingRoles, primaryCount, count: references.length };
  if (missingRoles.length) return { ok: false as const, reason: `缺少参考角色：${missingRoles.join("、")}。`, missingRoles, primaryCount, count: references.length };
  return { ok: true as const, missingRoles, primaryCount, count: references.length };
}
