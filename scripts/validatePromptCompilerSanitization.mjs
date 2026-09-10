import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const temp = await mkdtemp(resolve(tmpdir(), "theruiz-prompt-compiler-"));
const bundle = resolve(temp, "compiler.mjs");
await build({
  entryPoints: [resolve(root, "src/visual-system/routedPromptCompiler.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: bundle,
  logLevel: "silent"
});

const { compileRoutedImage2UserPrompt } = await import(`${pathToFileURL(bundle).href}?v=${Date.now()}`);
const fail = (message) => { throw new Error(`validate:prompt-compiler: ${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };

const basePrompt = [
  "THERUIZ AURA Image Prompt.",
  "Active visual role: relaxed daily-life framing with natural body weight and a readable sneaker inside an ordinary lived-in scene.",
  "Scene: quiet cafe entrance in early autumn.",
  "Product Truth: use only the uploaded sneaker references; preserve shape, color, material, logo, sole, and proportions.",
  "Reference Plan: use the confirmed uploaded footwear references in their assigned order."
].join(" ");

const prompt = compileRoutedImage2UserPrompt({
  basePrompt,
  topicRoute: { topicId: "lifestyle_soft_seeding", userFacingLabel: "生活场景软种草", provider: "image2" },
  visualRoleId: "A1",
  activePromptEntry: { role: "A1", provider: "image2", activeVersionId: "image2-cmp-01-new-v1" },
  currentTaskContext: { imageType: "生活场景图", scenePreference: "咖啡馆门口", imageIndex: 1, imageCount: 5 }
});

assert(prompt === basePrompt, "compiler changed the canonical provider prompt");
for (const marker of [
  "Active Prompt Registry:",
  "Image2 provider boundary:",
  "Topic responsibility:",
  "Current task context:",
  "Product Truth protection:"
]) {
  assert(!prompt.includes(marker), `provider prompt leaked ${marker}`);
}
assert((prompt.match(/Active visual role:/g) ?? []).length === 1, "visual role was duplicated or removed");
assert(prompt.includes("Product Truth:"), "Product Truth was removed from the provider prompt");
assert(prompt.includes("Reference Plan:"), "Reference Plan was removed from the provider prompt");

console.log("PASS validate:prompt-compiler (single-source provider prompt, no internal metadata leakage)");
await rm(temp, { recursive: true, force: true });
