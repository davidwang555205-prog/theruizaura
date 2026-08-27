import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const compiler = read("src/video-script/compiler.ts");
const contracts = read("src/video-script/contracts.ts");
const filmSpecs = read("src/video-script/filmSpecs.ts");
const imageCompiler = read("src/prompt-engine/compilePrompt.ts");
const imageRuntime = read("src/prompt-engine/runtime.ts");

for (const forbidden of ["VideoProvider", "SeedanceAdapter", "GenerationVideo", "Polling", "Retry Runtime", "OSS", "ModelChannel"]) {
  assert(!compiler.includes(forbidden), `video compiler must not contain production runtime concept: ${forbidden}`);
  assert(!contracts.includes(forbidden), `video contracts must not contain production runtime concept: ${forbidden}`);
}

assert(!compiler.includes("../generation/"), "video compiler must not depend on GenerationService");
assert(!imageCompiler.includes("video-script"), "existing Image2 compiler must remain isolated from video-script V1");
assert(!imageRuntime.includes("video-script"), "existing image prompt runtime must remain isolated from video-script V1");
assert(filmSpecs.includes("duration: 10") && filmSpecs.includes("10A") && filmSpecs.includes("10B") && filmSpecs.includes("10C"), "10s FilmSpec must define its own three-beat structure");
assert(filmSpecs.includes("duration: 15") && filmSpecs.includes("15A") && filmSpecs.includes("15B") && filmSpecs.includes("15C") && filmSpecs.includes("15D"), "15s FilmSpec must define its own four-beat structure");
assert(filmSpecs.includes("Do not compress a longer four-shot structure"), "10s FilmSpec must explicitly reject proportional compression");
assert(compiler.includes('target: "seedance-2.5-manual-copy"'), "compiler metadata must remain manual-copy only");
assert(compiler.includes("apiExecution: false"), "compiler must not enable API execution");
assert(compiler.includes("providerRuntime: false"), "compiler must not enable provider runtime");

console.log("Video Script V1 isolation validation passed.");
