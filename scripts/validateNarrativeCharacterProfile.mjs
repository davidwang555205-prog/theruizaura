import { build } from "esbuild";
import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-character-profile-validation-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const hash = (value) => createHash("sha256").update(value).digest("hex");

const BACKWARD_COMPATIBILITY_HASHES = {
  imagePrompt: "49ef0cde2ee07106579c7bddd5eca30d67ef484197e299316338dbf65183296d",
  lifestyleJson: "5871f2cfd79734cc0e18d27ec9795b19ef71b16ebd9786d790186142ac6fbfe3",
  seedanceVideoScript: "f6417d81b7ec1d02ff9ca5d2bb9b160e50d3cad4f3261dfe2b3b5594d86f0e0f",
  unifiedThemeVideoScript: "a58c32a00f58061aa2c45463401228cc0f7518704d5f26ed7b45fb417061afbb",
};

const baseParams = {
  imageType: "生活场景图",
  modelChoice: "30–45岁客户画像模特",
  modelContinuity: "新人物",
  shoe: "自定义",
  customShoe: "",
  season: "秋",
  scenePreference: "通勤上班",
  garmentTypePreference: "自动匹配",
  studioLaunchAnglePreference: "自动匹配",
  studioLaunchPreset: "auto",
  studioWardrobePreference: "auto",
  stillLifeStyle: "与主视觉统一",
  extraRequirement: "Keep the visual tone calm while all movement remains real-time.",
  generationNonce: 0,
  selectedProductTruth: { referenceEvidenceBound: true, structuredFactsExtracted: false, productTruthMode: "reference_bound" },
  referencePlan: { referencePlanReady: true, order: ["internal-a", "internal-b"] },
};

function assertApproved(result, label) {
  assert(result.status === "CHARACTER_PROFILE_APPROVED", `${label} expected CHARACTER_PROFILE_APPROVED, received ${result.status}`);
}

try {
  await writeFile(
    entryPath,
    `export * from ${JSON.stringify(resolve(projectRoot, "src/immersive-narrative/index.ts"))};\n` +
    `export { lifestyleSoftSeedingScenePool } from ${JSON.stringify(resolve(projectRoot, "src/data/lifestyleSoftSeedingScenePool.ts"))};\n` +
    `export { compileSeedanceVideoScript } from ${JSON.stringify(resolve(projectRoot, "src/video-script/compileSeedanceVideoScript.ts"))};\n` +
    `export { compileSoftSeedingThemeVideoScript } from ${JSON.stringify(resolve(projectRoot, "src/video-script/compileSeedanceThemeVideoScript.ts"))};\n` +
    `export { generateSoftSeedingContent } from ${JSON.stringify(resolve(projectRoot, "src/utils/generateSoftSeedingContent.ts"))};\n` +
    `export { generatePromptRuntime } from ${JSON.stringify(resolve(projectRoot, "src/prompt-engine/runtime.ts"))};\n`
  );
  await build({ entryPoints: [entryPath], bundle: true, format: "esm", platform: "node", outfile: bundlePath, logLevel: "silent" });
  const {
    AGE_PROFILES,
    APPEARANCE_GROUPS,
    DEFAULT_CHARACTER_SELECTION,
    NARRATIVE_TOPIC_CATALOG,
    buildCameraNarrativeInput,
    buildProductPresenceInput,
    buildSceneResolverInput,
    buildSoundWorldInput,
    compileSeedanceVideoScript,
    compileSoftSeedingThemeVideoScript,
    generatePromptRuntime,
    generateSoftSeedingContent,
    lifestyleSoftSeedingScenePool,
    migrateLegacyCharacterProfile,
    planCameraNarrative,
    planImmersiveNarrative,
    planProductPresence,
    planSoundWorld,
    resolveCharacterProfile,
    resolveNarrativeScenes,
  } = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);

  assert(AGE_PROFILES.length === 6, `Expected 6 age profiles, received ${AGE_PROFILES.length}`);
  assert(APPEARANCE_GROUPS.length === 3, `Expected 3 appearance groups, received ${APPEARANCE_GROUPS.length}`);
  assert(new Set(AGE_PROFILES.map((profile) => profile.id)).size === 6, "Age profile ids must be unique");
  assert(new Set(AGE_PROFILES.map((profile) => profile.label)).size === 6, "Age profile labels must be unique");
  assert(new Set(APPEARANCE_GROUPS.map((group) => group.id)).size === 3, "Appearance group ids must be unique");
  assert(new Set(APPEARANCE_GROUPS.map((group) => group.label)).size === 3, "Appearance group labels must be unique");
  assert(DEFAULT_CHARACTER_SELECTION.ageProfileId === "age_28_32" && DEFAULT_CHARACTER_SELECTION.appearanceGroupId === "asian", "Default character selection changed");

  let combinationCount = 0;
  for (const age of AGE_PROFILES) {
    for (const appearance of APPEARANCE_GROUPS) {
      const resolved = resolveCharacterProfile({ ageProfileId: age.id, appearanceGroupId: appearance.id });
      assertApproved(resolved, `${age.id}+${appearance.id}`);
      combinationCount += 1;
    }
  }
  assert(combinationCount === 18, `Expected 18 character combinations, received ${combinationCount}`);

  const migrated = migrateLegacyCharacterProfile("32岁左右成熟女性");
  assert(migrated?.ageProfileId === "age_28_32" && migrated.appearanceGroupId === "asian", "Legacy 32-year-old profile did not migrate");
  assertApproved(resolveCharacterProfile(migrated), "Legacy migrated selection");
  const legacyPlan = planImmersiveNarrative({
    topic: "下班回家",
    characterProfile: "32岁左右成熟女性",
    season: "秋",
    lifestyleFeeling: "安静 / 克制",
    duration: 15,
    availableSceneLibrary: [{ id: "scene-home", label: "回家进门" }],
  });
  assert(legacyPlan.status === "APPROVED_FOR_SCENE_RESOLUTION", "Legacy character profile did not remain backward compatible");

  const invalidAge = resolveCharacterProfile({ ageProfileId: "age_60_70", appearanceGroupId: "asian" });
  assert(invalidAge.status === "CHARACTER_PROFILE_FAILED", "Invalid age profile must fail closed");
  const invalidAppearance = resolveCharacterProfile({ ageProfileId: "age_28_32", appearanceGroupId: "unknown" });
  assert(invalidAppearance.status === "CHARACTER_PROFILE_FAILED", "Invalid appearance group must fail closed");

  let unsupportedProfile = null;
  try {
    planImmersiveNarrative({
      topic: "下班回家",
      characterProfile: "40岁自由文本人物",
      season: "秋",
      lifestyleFeeling: "安静 / 克制",
      duration: 15,
      availableSceneLibrary: [{ id: "scene-home", label: "回家进门" }],
    });
  } catch (error) {
    unsupportedProfile = error;
  }
  assert(unsupportedProfile?.code === "UNSUPPORTED_CHARACTER_PROFILE", "Unknown free-text profile must fail closed");

  const latinBase = APPEARANCE_GROUPS.find((group) => group.id === "latin_american");
  const passionate = resolveCharacterProfile(
    { ageProfileId: "age_28_32", appearanceGroupId: "latin_american" },
    { appearanceGroups: [{ ...latinBase, visualGuidance: ["passionate personality"] }] }
  );
  assert(passionate.status === "CHARACTER_PROFILE_FAILED" && passionate.qc.no_demographic_stereotype.status === "FAIL", "Passionate stereotype must fail");

  const ageBase = AGE_PROFILES.find((profile) => profile.id === "age_48_55");
  const slower = resolveCharacterProfile(
    { ageProfileId: "age_48_55", appearanceGroupId: "european" },
    { ageProfiles: [{ ...ageBase, lifeStageTone: "slower movement and health limitation" }] }
  );
  assert(slower.status === "CHARACTER_PROFILE_FAILED" && slower.qc.no_unsupported_inference.status === "FAIL", "Age-based movement limitation must fail");

  const asianBase = APPEARANCE_GROUPS.find((group) => group.id === "asian");
  const nationality = resolveCharacterProfile(
    { ageProfileId: "age_28_32", appearanceGroupId: "asian" },
    { appearanceGroups: [{ ...asianBase, visualGuidance: ["specific nationality and cultural styling"] }] }
  );
  assert(nationality.status === "CHARACTER_PROFILE_FAILED" && nationality.qc.no_demographic_stereotype.status === "FAIL", "Nationality/cultural styling inference must fail");

  const representativeSelections = [
    { ageProfileId: "age_23_27", appearanceGroupId: "asian" },
    { ageProfileId: "age_33_37", appearanceGroupId: "european" },
    { ageProfileId: "age_38_42", appearanceGroupId: "latin_american" },
    { ageProfileId: "age_43_47", appearanceGroupId: "asian" },
    { ageProfileId: "age_48_55", appearanceGroupId: "european" },
  ];
  const pipelineResults = [];
  for (const selection of representativeSelections) {
    const character = resolveCharacterProfile(selection);
    assertApproved(character, `${selection.ageProfileId}+${selection.appearanceGroupId}`);
    const topic = NARRATIVE_TOPIC_CATALOG[0];
    const plan = planImmersiveNarrative({
      topic: topic.label,
      characterSelection: selection,
      season: "秋",
      lifestyleFeeling: "安静 / 克制",
      duration: 15,
      availableSceneLibrary: topic.defaultSceneLabels.map((label, index) => ({ id: `character-scene-${index + 1}`, label })),
    });
    const scene = resolveNarrativeScenes(buildSceneResolverInput(plan, topic.label));
    const product = planProductPresence(buildProductPresenceInput(plan, scene, topic.label));
    const sound = planSoundWorld(buildSoundWorldInput(plan, scene, product, topic.label));
    const camera = planCameraNarrative(buildCameraNarrativeInput(plan, scene, product, sound));
    assert(plan.status === "APPROVED_FOR_SCENE_RESOLUTION", `${selection.ageProfileId}+${selection.appearanceGroupId} Narrative failed`);
    assert(scene.status === "SCENE_RESOLUTION_APPROVED", `${selection.ageProfileId}+${selection.appearanceGroupId} Scene failed`);
    assert(product.status === "PRODUCT_PRESENCE_APPROVED", `${selection.ageProfileId}+${selection.appearanceGroupId} Product failed`);
    assert(sound.status === "SOUND_WORLD_APPROVED", `${selection.ageProfileId}+${selection.appearanceGroupId} Sound failed`);
    assert(camera.status === "CAMERA_NARRATIVE_APPROVED", `${selection.ageProfileId}+${selection.appearanceGroupId} Camera failed`);
    pipelineResults.push({
      character: character.status,
      narrative: plan.status,
      scene: scene.status,
      product: product.status,
      sound: sound.status,
      camera: camera.status,
    });
  }

  let structuralCombinations = 0;
  for (const topic of NARRATIVE_TOPIC_CATALOG) {
    for (const age of AGE_PROFILES) {
      for (const appearance of APPEARANCE_GROUPS) {
        const plan = planImmersiveNarrative({
          topic: topic.label,
          characterSelection: { ageProfileId: age.id, appearanceGroupId: appearance.id },
          season: "秋",
          lifestyleFeeling: "安静 / 克制",
          duration: 15,
          availableSceneLibrary: topic.defaultSceneLabels.map((label, index) => ({ id: `structure-${topic.id}-${index + 1}`, label })),
        });
        assert(plan.status === "APPROVED_FOR_SCENE_RESOLUTION", `${topic.label}+${age.id}+${appearance.id} is not structurally valid`);
        structuralCombinations += 1;
      }
    }
  }
  assert(structuralCombinations === 234, `Expected 234 topic-character combinations, received ${structuralCombinations}`);

  const appearanceLabels = APPEARANCE_GROUPS.map((group) => group.label);
  let appearanceInvariantGroups = 0;
  for (const topic of NARRATIVE_TOPIC_CATALOG) {
    for (const age of AGE_PROFILES) {
      const appearanceOutputs = [];
      for (const appearance of APPEARANCE_GROUPS) {
        const plan = planImmersiveNarrative({
          topic: topic.label,
          characterSelection: { ageProfileId: age.id, appearanceGroupId: appearance.id },
          season: "秋",
          lifestyleFeeling: "安静 / 克制",
          duration: 15,
          availableSceneLibrary: topic.defaultSceneLabels.map((label, index) => ({ id: `invariant-${index + 1}`, label })),
        });
        const scene = resolveNarrativeScenes(buildSceneResolverInput(plan, topic.label));
        const product = planProductPresence(buildProductPresenceInput(plan, scene, topic.label));
        const sound = planSoundWorld(buildSoundWorldInput(plan, scene, product, topic.label));
        const camera = planCameraNarrative(buildCameraNarrativeInput(plan, scene, product, sound));
        const downstream = JSON.stringify({ scene, product, sound, camera });
        for (const label of appearanceLabels) {
          assert(
            !downstream.includes(label),
            `${topic.label}+${age.id}+${appearance.id} leaked the appearance group label into Scene / Product / Sound / Camera`
          );
        }
        assert(
          !downstream.includes("appearanceGroupId"),
          `${topic.label}+${age.id}+${appearance.id} leaked appearanceGroupId into Scene / Product / Sound / Camera`
        );
        appearanceOutputs.push(JSON.stringify({
          world: scene.locationWorld?.id,
          sceneIds: scene.resolvedMoments.map((moment) => moment.sceneId),
          product: product.curve.map((moment) => moment.presence),
          sound: sound.moments.map((moment) => moment.dominantSound),
          camera: camera.moments.map((moment) => moment.role),
          full: downstream,
        }));
      }
      assert(
        new Set(appearanceOutputs).size === 1,
        `${topic.label}+${age.id} Scene / Product / Sound / Camera changed because of the appearance group`
      );
      appearanceInvariantGroups += 1;
    }
  }
  assert(appearanceInvariantGroups === 78, `Expected 78 topic-age appearance invariance groups, received ${appearanceInvariantGroups}`);
  assert(lifestyleSoftSeedingScenePool.length === 39, `Scene Library changed from 39 to ${lifestyleSoftSeedingScenePool.length}`);

  const imagePrompt = generatePromptRuntime(baseParams);
  const lifestyleContent = generateSoftSeedingContent({
    baseParams,
    imageCount: 5,
    topic: "生活场景软种草",
    contentCategory: "natural_life",
    captureStyle: "standard",
    variantOffset: 7,
  });
  const seedanceVideoScript = compileSeedanceVideoScript({ params: baseParams, duration: 15 });
  const unifiedThemeVideoScript = compileSoftSeedingThemeVideoScript({
    images: lifestyleContent.images,
    topic: lifestyleContent.topic,
    duration: 15,
  });
  const actualHashes = {
    imagePrompt: hash(imagePrompt.prompt),
    lifestyleJson: hash(JSON.stringify(lifestyleContent)),
    seedanceVideoScript: hash(seedanceVideoScript.script),
    unifiedThemeVideoScript: hash(unifiedThemeVideoScript.script),
  };
  for (const [key, actual] of Object.entries(actualHashes)) {
    assert(actual === BACKWARD_COMPATIBILITY_HASHES[key], `Backward compatibility hash changed for ${key}`);
  }

  console.log("Character Profile Catalog V1 validation passed:", JSON.stringify({
    ageProfiles: AGE_PROFILES.map((profile) => ({ id: profile.id, label: profile.label, ageMin: profile.ageMin, ageMax: profile.ageMax })),
    appearanceGroups: APPEARANCE_GROUPS.map((group) => ({ id: group.id, label: group.label })),
    combinations: combinationCount,
    structuralCombinations,
    defaultSelection: DEFAULT_CHARACTER_SELECTION,
    pipelineResults,
    appearanceInvariance: {
      topicAgeGroups: appearanceInvariantGroups,
      appearancesPerGroup: APPEARANCE_GROUPS.length,
      downstreamModules: ["scene", "product_presence", "sound_world", "camera_role"],
    },
    backwardCompatibility: "PASS",
  }, null, 2));
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
