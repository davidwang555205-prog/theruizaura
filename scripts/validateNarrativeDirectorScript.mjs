import { build } from "esbuild";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Director Script V1.2: the immersive narrative presentation layer must be a
// director script on its own vocabulary, and must stay distinct from the
// commercial-film director script.
const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-director-script-validation-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const request = (topic) => ({
  topic: topic.label,
  characterSelection: { ageProfileId: "age_28_32", appearanceGroupId: "asian" },
  season: "秋",
  lifestyleFeeling: "安静 / 克制",
  availableSceneLibrary: topic.defaultSceneLabels.map((label, index) => ({ id: `director-${topic.id}-${index}`, label })),
});

const INTERNAL_MARKERS = ["CORRECT_UNSUPPORTED", "REAL_CAPABILITY_GAP", "SMALL_OBJECT_RETRIEVAL", "CONTAINER_OBJECT_SEARCH", "Capability Matrix", "Eligibility", "[NARRATIVE CORE]", "APPROVED FOR SCENE RESOLUTION"];
const REQUIRED_MARKERS = ["CREATIVE IDEA", "DIRECTOR CONCEPT", "CINEMATIC DEVICE", "CHARACTER", "FILM STRUCTURE", "TAKE 1 —", "GLOBAL VISUAL LOOK", "GLOBAL SOUND", "GLOBAL PRODUCT PROTECTION", "GLOBAL NEGATIVES", "ENDING", "SEEDANCE EXECUTION"];
const COMMERCIAL_ONLY = ["SHOT 1 — WORLD", "SHOT 2 — WEAR", "SHOT 3 — DETAIL", "SHOT 4 — HERO", "SHOT 5 — RELEASE", "Commercial film"];

async function directoryHash(directory) {
  const hash = createHash("sha256");
  const walk = async (current) => {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) await walk(path);
      else hash.update(`${entry.name}:${await readFile(path)}`);
    }
  };
  await walk(directory);
  return hash.digest("hex");
}

try {
  await writeFile(
    entryPath,
    `export * from ${JSON.stringify(resolve(projectRoot, "src/immersive-narrative/index.ts"))};\n` +
    `export { COMMERCIAL_DIRECTOR_CONCEPT_CATALOG } from ${JSON.stringify(resolve(projectRoot, "src/commercial-film/director-concept/catalog.ts"))};\n`
  );
  await build({ entryPoints: [entryPath], bundle: true, format: "esm", platform: "node", outfile: bundlePath, logLevel: "silent" });
  const {
    NARRATIVE_TOPIC_CATALOG,
    runImmersiveNarrativePipeline,
    buildImmersiveFinalScriptPresentation,
    validateImmersiveFinalScriptPresentation,
    getTopicVariantCount,
    COMMERCIAL_DIRECTOR_CONCEPT_CATALOG,
  } = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);

  const commercialConceptLabels = Object.values(COMMERCIAL_DIRECTOR_CONCEPT_CATALOG)
    .flatMap((entry) => [entry.label, entry.id].filter(Boolean));
  const perTopic = [];
  let generated = 0;
  let internalHits = 0;
  let commercialHits = 0;
  let executionMismatches = 0;
  let determinismFailures = 0;
  let takeMismatches = 0;
  let timelineFailures = 0;

  for (const topic of NARRATIVE_TOPIC_CATALOG) {
    const outcome = runImmersiveNarrativePipeline({
      topic: topic.label,
      characterSelection: { ageProfileId: "age_28_32", appearanceGroupId: "asian" },
      season: "秋",
      lifestyleFeeling: "安静 / 克制",
      availableSceneLibrary: topic.defaultSceneLabels.map((label, index) => ({ id: `director-${topic.id}-${index}`, label })),
    });
    assert(outcome.status === "GENERATED", `${topic.label} pipeline blocked`);
    const presentation = outcome.presentation;
    const text = presentation.presentationScript;
    assert(outcome.presentationValidation.status === "DIRECTOR_SCRIPT_VALIDATED", `${topic.label} director script failed: ${outcome.presentationValidation.failureReasons.join(" | ")}`);
    generated += 1;

    for (const marker of REQUIRED_MARKERS) {
      assert(text.includes(marker), `${topic.label} director script is missing ${marker}`);
    }
    const appearanceLabel = outcome.character.appearanceGroup?.label ?? "";
    assert(
      appearanceLabel.length > 0 && text.includes(appearanceLabel),
      `${topic.label} director script does not state the selected appearance (${appearanceLabel})`
    );
    internalHits += INTERNAL_MARKERS.filter((marker) => text.includes(marker)).length;
    commercialHits += [...COMMERCIAL_ONLY, ...commercialConceptLabels].filter((marker) => text.includes(marker)).length;
    assert(!/\bSHOT [1-5]\b/.test(text), `${topic.label} director script uses a shot list`);

    const moments = presentation.directorScript.takes.flatMap((take) => take.moments);
    const contiguous = moments.length === 5
      && moments[0].timeRange.startSecond === 0
      && moments[4].timeRange.endSecond === 15
      && moments.every((moment, index) => index === 0 || moment.timeRange.startSecond === moments[index - 1].timeRange.endSecond);
    if (!contiguous) timelineFailures += 1;
    const motivated = outcome.modelFacingScript.diagnostics.cameraTransitions.filter((transition, index) => index > 0 && transition.changed).length;
    if (presentation.directorScript.takes.length !== motivated + 1) takeMismatches += 1;
    if (presentation.executionScriptText !== outcome.modelFacingScript.compiledText) executionMismatches += 1;

    const rebuilt = buildImmersiveFinalScriptPresentation({
      topicLabel: topic.label,
      character: outcome.character,
      plan: outcome.plan,
      sceneResolution: outcome.sceneResolution,
      cameraExecution: outcome.cameraExecution.plan,
      modelFacingScript: outcome.modelFacingScript,
    });
    if (rebuilt.presentationScript !== text) determinismFailures += 1;

    perTopic.push({
      topic: topic.label,
      title: presentation.directorScript.title,
      concept: presentation.directorScript.directorConcept.split(".")[0],
      takes: presentation.directorScript.takes.length,
      takeRoles: presentation.directorScript.takes.map((take) => take.takeRole),
      directorCharacters: text.length,
      executionCharacters: presentation.executionScriptText.length,
    });
  }

  assert(generated === 13, `${generated} of 13 director scripts generated`);
  assert(internalHits === 0, `${internalHits} internal markers leaked into director scripts`);
  assert(commercialHits === 0, `${commercialHits} commercial-film markers leaked into director scripts`);
  assert(executionMismatches === 0, `${executionMismatches} execution prompts were rewritten by the presentation layer`);
  assert(determinismFailures === 0, `${determinismFailures} non-deterministic director scripts`);
  assert(takeMismatches === 0, `${takeMismatches} take structures disagree with motivated camera changes`);
  assert(timelineFailures === 0, `${timelineFailures} director timelines are not continuous`);

  // Variant matrix: every authored variant must pass the same gates, stay
  // deterministic per seed, and actually differ from variant 0.
  const variantMatrix = [];
  let variantFailures = 0;
  let variantDuplicates = 0;
  for (const topic of NARRATIVE_TOPIC_CATALOG) {
    const variantCount = getTopicVariantCount(topic.label);
    const texts = [];
    for (let seed = 0; seed < variantCount; seed += 1) {
      const outcome = runImmersiveNarrativePipeline({
        ...request(topic),
        variantSeed: seed,
      });
      const rerun = runImmersiveNarrativePipeline({ ...request(topic), variantSeed: seed });
      const ok = outcome.status === "GENERATED"
        && rerun.status === "GENERATED"
        && outcome.presentationValidation.status === "DIRECTOR_SCRIPT_VALIDATED"
        && outcome.modelFacingScript.status === "EXECUTABLE"
        && outcome.plan.variantSeed === seed
        && rerun.presentation.presentationScript === outcome.presentation.presentationScript;
      if (!ok) variantFailures += 1;
      texts.push(outcome.status === "GENERATED" ? outcome.presentation.presentationScript : "");
    }
    if (new Set(texts).size !== variantCount) variantDuplicates += 1;
    variantMatrix.push({ topic: topic.label, variantCount, distinct: new Set(texts).size });
  }
  assert(variantFailures === 0, `${variantFailures} variant(s) failed the shared gates`);
  assert(variantDuplicates === 0, `${variantDuplicates} topic(s) have duplicate variant text`);

  const presentationSource = await readFile(resolve(projectRoot, "src/immersive-narrative/presentation/buildDirectorScript.ts"), "utf8");
  assert(
    !/from\s+["'][^"']*commercial-film/.test(presentationSource),
    "the presentation layer imports commercial-film code"
  );

  const commercialSourceHash = await directoryHash(resolve(projectRoot, "src/commercial-film"));

  console.log("IMMERSIVE DIRECTOR SCRIPT VALIDATION PASS:", JSON.stringify({
    stage: "DIRECTOR_SCRIPT_V1_2",
    topics: NARRATIVE_TOPIC_CATALOG.length,
    directorScripts: generated,
    internalMarkers: internalHits,
    commercialMarkerCollisions: commercialHits,
    executionPromptMismatches: executionMismatches,
    determinismFailures,
    takeStructureMismatches: takeMismatches,
    timelineFailures,
    variantMatrix,
    commercialFilmImports: 0,
    commercialSourceHash,
    perTopic,
  }, null, 2));
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
