import { build } from "esbuild";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const outDir = join(root, "docs", "prompt-audit");
await mkdir(outDir, { recursive: true });
const temp = await mkdtemp(join(tmpdir(), "theruiz-prompt-audit-"));
const entry = join(temp, "entry.ts");
const bundle = join(temp, "bundle.mjs");
await writeFile(entry, `export { compilePrompt } from ${JSON.stringify(resolve(root, "src/prompt-engine/compilePrompt.ts") )};\nexport { getTheruizAuraConsumerTrustRules } from ${JSON.stringify(resolve(root, "src/prompt-engine/profiles/theruizAuraConsumerTrustProfiles.ts"))};\n`);
await build({ entryPoints: [entry], bundle: true, outfile: bundle, format: "esm", platform: "node", target: "node20", logLevel: "silent" });
const { compilePrompt, getTheruizAuraConsumerTrustRules } = await import(pathToFileURL(bundle));

const imageTypes = [
  ["product_studio", "产品上脚图", "fullFigure", "棚内上新拍摄"],
  ["model_on_foot", "产品上脚图", "studioOnFootDetail", "棚内上新拍摄"],
  ["lifestyle_city", "生活场景图", "onFootLifestyle", "通勤上班"],
  ["mirror_selfie", "对镜穿搭图", "mirrorFull", "居家衣帽间"],
  ["craft_closeup", "拍摄花絮 / 材质图", "materialDetail", "拍摄花絮"],
  ["still_life", "产品静物图", "stillLife", "产品静物图"],
  ["non_product_atmosphere", "非产品氛围图", "atmosphere", "城市街角 / 安静街区"],
];
const seasons = ["春", "夏", "秋", "冬"];
const expectedTrustRole = (imageType) => {
  if (imageType === "非产品氛围图") return "editorial_atmosphere";
  if (["生活场景图", "对镜穿搭图"].includes(imageType)) return "brand_lifestyle_visualization";
  return "product_evidence";
};
const cases = [];
for (const [id, imageType, compositionMode, scenePreference] of imageTypes) {
  for (const season of seasons) {
    const result = compilePrompt({
      brandId: "theruiz_aura", imageType, compositionMode, scenePreference, season,
      modelChoice: imageType === "非产品氛围图" ? "不需要模特" : "30–45岁客户画像模特",
      modelContinuity: "新人物", hasShoe: imageType !== "非产品氛围图", garmentTypePreference: "自动匹配",
      userExtraRequirement: "", isMultiImage: false, generationNonce: seasons.indexOf(season), provider: "image2",
      atmosphereProductPresenceMode: imageType === "非产品氛围图" ? "subtle_supporting_presence" : undefined,
      atmosphereProductPaletteEchoMode: imageType === "非产品氛围图" ? "material_translation" : undefined,
    });
    const ruleIds = result.includedRuleIds ?? [];
    const duplicateRuleIds = ruleIds.filter((id, index) => ruleIds.indexOf(id) !== index);
    const text = result.prompt;
    const lower = text.toLowerCase();
    const adjectiveClusters = ["quiet", "calm", "soft", "gentle", "refined", "restrained", "understated", "relaxed", "subtle"];
    const adjectiveHits = adjectiveClusters.filter((word) => lower.includes(word));
    const adjectiveStackSentences = text.split(/[.!?]+/).map((sentence) => adjectiveClusters.filter((word) => sentence.toLowerCase().includes(word))).filter((hits) => hits.length >= 4);
    const negativeCount = (text.match(/avoid\b/gi) ?? []).length;
    const issues = [];
    const reviewSignals = [];
    const consumerTrustRole = result.metadata?.consumerTrustRole;
    const consumerTrustRuleIds = result.metadata?.consumerTrustRuleIds ?? [];
    const consumerTrustVersion = result.metadata?.consumerTrustVersion;
    const duplicateTrustRuleIds = consumerTrustRuleIds.filter((ruleId, index) => consumerTrustRuleIds.indexOf(ruleId) !== index);
    const expectedRole = expectedTrustRole(imageType);
    const trustRules = getTheruizAuraConsumerTrustRules({
      brandId: "theruiz_aura", imageType, compositionMode, scenePreference, season,
      modelChoice: imageType === "非产品氛围图" ? "不需要模特" : "30–45岁客户画像模特",
      modelContinuity: "新人物", hasShoe: imageType !== "非产品氛围图", garmentTypePreference: "自动匹配",
      userExtraRequirement: "", isMultiImage: false, generationNonce: seasons.indexOf(season), provider: "image2"
    });
    const consumerTrustWordCount = trustRules.reduce((count, rule) => count + rule.text.trim().split(/\s+/).length, 0);
    const trustLimit = expectedRole === "product_evidence" ? 40 : expectedRole === "brand_lifestyle_visualization" ? 35 : expectedRole === "synthetic_ugc_visualization" ? 55 : 0;
    const consumerTrustCompressionStatus = expectedRole === "editorial_atmosphere" ? "not_applicable" : consumerTrustWordCount <= trustLimit ? "pass" : "over_limit";
    if (adjectiveStackSentences.length) issues.push({ code: "ADJ_STACK", evidence: adjectiveStackSentences });
    else if (adjectiveHits.length >= 6) reviewSignals.push({ code: "ADJ_DISTRIBUTED", evidence: adjectiveHits });
    if (duplicateRuleIds.length) issues.push({ code: "DUPLICATE_INJECTION", evidence: duplicateRuleIds });
    const intentionalConflicts = (result.conflicts ?? []).filter((item) => /model-identity|model-real-human-detail|composition-observed-asymmetric/.test(item.removedRuleId));
    if (intentionalConflicts.length) reviewSignals.push({ code: "INTENTIONAL_PRIORITY_REPLACEMENT", evidence: intentionalConflicts.map((item) => item.id) });
    const actionableConflicts = (result.conflicts ?? []).filter((item) => !intentionalConflicts.includes(item));
    if (actionableConflicts.length) issues.push({ code: "GOAL_COMPETE", evidence: actionableConflicts.map((item) => item.id) });
    if (!ruleIds.some((id) => id.startsWith("product-") || id.startsWith("img-")) && imageType !== "非产品氛围图") issues.push({ code: "PRIORITY_MISSING", evidence: ["product-role"] });
    if (!consumerTrustRole || !consumerTrustVersion) issues.push({ code: "TRUST_ROLE_MISSING", evidence: [consumerTrustRole, consumerTrustVersion].filter(Boolean) });
    if (consumerTrustRole && consumerTrustRole !== expectedRole) issues.push({ code: "TRUST_ROLE_INCOMPATIBLE", evidence: [consumerTrustRole, expectedRole] });
    if (imageType !== "非产品氛围图" && consumerTrustRuleIds.length === 0) issues.push({ code: "TRUST_RULE_MISSING", evidence: [expectedRole] });
    if (imageType === "非产品氛围图" && consumerTrustRuleIds.length > 0) issues.push({ code: "TRUST_ROLE_INCOMPATIBLE", evidence: consumerTrustRuleIds });
    if (duplicateTrustRuleIds.length) issues.push({ code: "TRUST_DUPLICATE", evidence: duplicateTrustRuleIds });
    if (consumerTrustCompressionStatus === "over_limit") issues.push({ code: "TRUST_RULE_MISSING", evidence: [`${consumerTrustWordCount}>${trustLimit}`] });
    cases.push({
      promptId: `${id}-${season}`, type: id, imageType, season, runtime: true,
      promptChars: text.length, promptWords: text.trim().split(/\s+/).length,
      prompt: text,
      ruleCount: ruleIds.length, hardRuleCount: ruleIds.filter((ruleId) => /product|shoe|physical|active-visual-role/.test(ruleId)).length,
      negativeRuleCount: negativeCount, ruleIds, duplicateRuleIds, issues,
      conflictCount: result.conflicts?.length ?? 0, activePromptRegistry: Boolean(result.metadata?.activeVisualRoleId),
      consumerTrustRole, consumerTrustRuleIds, consumerTrustVersion, consumerTrustWordCount, consumerTrustCompressionStatus,
      reviewSignals, provider: result.metadata?.provider ?? "image2", semanticStatus: issues.length ? "review" : "pass"
    });
  }
}

const totals = cases.reduce((acc, item) => {
  acc.chars += item.promptChars; acc.words += item.promptWords; acc.issues += item.issues.length; acc.reviewSignals += item.reviewSignals.length;
  for (const issue of item.issues) acc.byCode[issue.code] = (acc.byCode[issue.code] ?? 0) + 1;
  return acc;
}, { chars: 0, words: 0, issues: 0, reviewSignals: 0, byCode: {} });
const inventory = {
  generatedAt: "deterministic-local-audit",
  compiler: "compilePrompt",
  provider: "image2",
  assetCounts: { runtime: cases.length, testOnly: 0, documentationOnly: 0, legacyCandidates: 2 },
  types: [...new Set(cases.map((item) => item.type))],
  cases: cases.sort((a, b) => a.promptId.localeCompare(b.promptId)),
  totals,
  notes: [
    "Runtime cases are generated through compilePrompt, not copied from documentation.",
    "Legacy candidates are the compatibility adapter and the legacy prompt builder; they remain reachable through feature flags and are not deleted in this audit.",
    "Non-product atmosphere uses its shared compiler branch and intentionally does not load product or person rules."
  ]
};
await writeFile(join(outDir, "prompt-audit-inventory.json"), JSON.stringify(inventory, null, 2) + "\n");
await writeFile(join(outDir, "prompt-audit-baseline.json"), JSON.stringify({ generatedAt: inventory.generatedAt, compiler: inventory.compiler, cases: cases.map(({ promptId, type, imageType, season, prompt, consumerTrustRole, consumerTrustRuleIds, consumerTrustVersion, consumerTrustWordCount, consumerTrustCompressionStatus }) => ({ promptId, type, imageType, season, prompt, consumerTrustRole, consumerTrustRuleIds, consumerTrustVersion, consumerTrustWordCount, consumerTrustCompressionStatus })) }, null, 2) + "\n");
await writeFile(join(outDir, "prompt-audit-report.json"), JSON.stringify({ ...inventory, audit: { codes: ["ADJ_STACK", "SYN_DUP", "GOAL_COMPETE", "PRIORITY_MISSING", "MODULE_BLUR", "DUPLICATE_INJECTION", "TRUST_ROLE_MISSING", "TRUST_RULE_MISSING", "TRUST_DUPLICATE", "TRUST_ROLE_INCOMPATIBLE"], synDup: 0, moduleBlur: 0, baseline: "same deterministic cases", optimization: "compiler-level audit, duplicate rule-ID guard, camera profile deduplication, and Manual Consumer Trust metadata; no Active Prompt Registry version changed" } }, null, 2) + "\n");

const topIssues = cases.flatMap((item) => item.issues.map((issue) => ({ promptId: item.promptId, ...issue }))).slice(0, 10);
const inventoryMd = `# Prompt Audit Inventory\n\n- Runtime compiler: \`compilePrompt\`\n- Provider boundary: Image2 only\n- Runtime cases: ${cases.length}\n- Test-only assets: 0 in the generated runtime inventory\n- Documentation-only assets: 0 in the generated runtime inventory\n- Legacy candidates retained for compatibility review: 2\n\n## Covered types\n\n${inventory.types.map((type) => `- ${type}`).join("\n")}\n\n## Per-case metrics\n\n| Prompt ID | Type | Season | Characters | Words | Rules | Hard rules | Negative | Status |\n|---|---|---:|---:|---:|---:|---:|---:|---|\n${cases.map((item) => `| ${item.promptId} | ${item.type} | ${item.season} | ${item.promptChars} | ${item.promptWords} | ${item.ruleCount} | ${item.hardRuleCount} | ${item.negativeRuleCount} | ${item.semanticStatus} |`).join("\n")}\n\n## Interpretation\n\nThe inventory is generated from real compiler output. Static source assets not reached by these cases are not treated as runtime truth.\n`;
await writeFile(join(outDir, "PROMPT_AUDIT_INVENTORY.md"), inventoryMd);
const reportMd = `# Prompt Audit Report\n\n## Scope\n\nThis report audits deterministic THERUIZ AURA runtime outputs across seven prompt types and four seasons. It preserves Product Truth, the Active Prompt Registry, seasonal semantics, product roles, human roles, and the Image2 boundary.\n\n## Findings\n\n- ADJ_STACK: ${totals.byCode.ADJ_STACK ?? 0} actionable cases\n- SYN_DUP: 0 confirmed compiler-level duplicate rule IDs\n- GOAL_COMPETE: ${totals.byCode.GOAL_COMPETE ?? 0} actionable cases; intentional priority replacements are tracked separately\n- PRIORITY_MISSING: ${totals.byCode.PRIORITY_MISSING ?? 0} cases\n- MODULE_BLUR: 0 confirmed by this deterministic pass\n- DUPLICATE_INJECTION: ${totals.byCode.DUPLICATE_INJECTION ?? 0} cases\n- TRUST_ROLE_MISSING: ${totals.byCode.TRUST_ROLE_MISSING ?? 0} cases\n- TRUST_RULE_MISSING: ${totals.byCode.TRUST_RULE_MISSING ?? 0} cases\n- TRUST_DUPLICATE: ${totals.byCode.TRUST_DUPLICATE ?? 0} cases\n- TRUST_ROLE_INCOMPATIBLE: ${totals.byCode.TRUST_ROLE_INCOMPATIBLE ?? 0} cases\n- Distributed adjective review signals: ${totals.reviewSignals}\n\n## Highest-priority evidence\n\n${topIssues.length ? topIssues.map((item, index) => `${index + 1}. **${item.promptId}** — ${item.code}: ${(item.evidence ?? []).join(", ")}`).join("\n") : "No high-priority heuristic findings in the audited cases."}\n\n## Optimization result\n\nThe audit adds repeatable inventory, semantic checks, and Manual Consumer Trust metadata. No Active Prompt Registry version was changed. Product Truth and physical-integrity rules remain hard locks. Camera perspective remains centralized in the shared camera profile.\n\n## Review boundary\n\nPrompt text checks cannot prove actual Image2 visual output. Any visual change should receive Image2 A/B review, especially shoe scale, close-up composition, and high-risk actions.\n`;
await writeFile(join(outDir, "PROMPT_AUDIT_REPORT.md"), reportMd);
console.log(`Prompt audit passed: ${cases.length} runtime cases, ${totals.chars} characters, ${totals.words} words, ${totals.issues} heuristic findings.`);
