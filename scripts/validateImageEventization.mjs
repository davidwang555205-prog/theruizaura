import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-image-eventization-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");

const baseInput = {
  brandId: "theruiz_aura",
  provider: "image2",
  topicId: "lifestyle_soft_seeding",
  imageType: "生活场景图",
  compositionMode: "onFootLifestyle",
  scenePreference: "周末城市散步",
  season: "秋",
  modelChoice: "30–45岁客户画像模特",
  modelContinuity: "新人物",
  hasShoe: false,
  garmentTypePreference: "自动匹配",
  userExtraRequirement: "",
  isMultiImage: true,
  seriesImageIndex: 0,
  seriesImageCount: 5,
  generationNonce: 0,
  cardRole: "walking",
  actionLock: "Person action lock: take one short everyday step through the selected setting."
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function count(text, pattern) {
  return text.match(pattern)?.length ?? 0;
}

try {
  await writeFile(
    entryPath,
    [
      `export { IMAGE_EVENT_CATALOG, SUPPORTED_IMAGE_EVENT_SCENES, SUPPORTED_IMAGE_EVENT_ACTION_FAMILIES } from ${JSON.stringify(resolve(projectRoot, "src/prompt-engine/eventization/eventCatalog.ts"))};`,
      `export { resolveImageEventState } from ${JSON.stringify(resolve(projectRoot, "src/prompt-engine/eventization/resolveImageEventState.ts"))};`,
      `export { collectPromptRules } from ${JSON.stringify(resolve(projectRoot, "src/prompt-engine/collectPromptRules.ts"))};`,
      `export { generateSoftSeedingContent } from ${JSON.stringify(resolve(projectRoot, "src/utils/generateSoftSeedingContent.ts"))};`
    ].join("\n")
  );

  await build({
    entryPoints: [entryPath],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile: bundlePath,
    logLevel: "silent"
  });

  const api = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);
  const {
    IMAGE_EVENT_CATALOG,
    SUPPORTED_IMAGE_EVENT_SCENES,
    SUPPORTED_IMAGE_EVENT_ACTION_FAMILIES,
    resolveImageEventState,
    collectPromptRules,
    generateSoftSeedingContent
  } = api;

  assert(IMAGE_EVENT_CATALOG.length >= 20, "V1 Event Catalog is unexpectedly small.");
  assert(
    new Set(IMAGE_EVENT_CATALOG.map((event) => event.id)).size === IMAGE_EVENT_CATALOG.length,
    "Event IDs must be unique."
  );

  const hiddenCausePattern = /\b(?:thinks?|remembers?|realizes?|decides?|imagines?|notification|message arrives|feels? like)\b/i;
  const addedHandheldPattern = /\b(?:phone|coffee cup|handbag|umbrella)\b/i;

  for (const event of IMAGE_EVENT_CATALOG) {
    assert(event.id && event.eventFamily, "Every event needs an ID and family.");
    assert(event.compatibleScenes.length > 0, `${event.id} has no compatible scene.`);
    assert(event.compatibleActionFamilies.length > 0, `${event.id} has no compatible action family.`);
    assert(event.trigger.trim(), `${event.id} has no visible trigger.`);
    assert(event.physicalResponse.trim(), `${event.id} has no physical response.`);
    assert(event.visibleChange.trim(), `${event.id} has no visible change.`);
    assert(event.visualEvidence.trim(), `${event.id} has no visual evidence.`);

    const semanticText = [
      event.trigger,
      event.physicalResponse,
      event.visibleChange,
      event.visualEvidence
    ].join(" ");
    assert(!hiddenCausePattern.test(semanticText), `${event.id} contains an invisible/psychological cause.`);
    assert(!addedHandheldPattern.test(semanticText), `${event.id} invents a handheld prop.`);

    for (const scenePreference of event.compatibleScenes) {
      for (const cardRole of event.compatibleActionFamilies) {
        const resolved = resolveImageEventState({
          ...baseInput,
          scenePreference,
          cardRole,
          generationNonce: 17
        });
        assert(resolved, `${event.id} coverage failed for ${scenePreference} / ${cardRole}.`);
        assert(resolved.promptLine.includes("Visible trigger:"), `${event.id} lost trigger authority.`);
        assert(resolved.promptLine.includes("Physical response:"), `${event.id} lost physical-response authority.`);
        assert(resolved.promptLine.includes("Visible state change:"), `${event.id} lost visible-change authority.`);
      }
    }
  }

  const deterministicInput = {
    ...baseInput,
    scenePreference: "周末城市散步",
    cardRole: "walking",
    generationNonce: 19
  };
  const first = resolveImageEventState(deterministicInput);
  const second = resolveImageEventState(deterministicInput);
  assert(first?.id === second?.id, "Identical input must resolve the same event.");

  const rotated = Array.from({ length: 32 }, (_, generationNonce) =>
    resolveImageEventState({ ...deterministicInput, generationNonce })?.id
  ).filter(Boolean);
  assert(new Set(rotated).size >= 2, "generationNonce should rotate compatible event variants when the catalog offers them.");

  for (const invalid of [
    { ...baseInput, topicId: "styling_solution" },
    { ...baseInput, imageType: "对镜穿搭图" },
    { ...baseInput, imageType: "产品静物图" },
    { ...baseInput, compositionMode: "fullFigure" },
    { ...baseInput, scenePreference: "棚内上新拍摄" },
    { ...baseInput, actionLock: "" },
    { ...baseInput, cardRole: undefined }
  ]) {
    assert(resolveImageEventState(invalid) === null, "Out-of-scope input entered Image Eventization V1.");
  }

  const integratedRules = collectPromptRules(baseInput);
  const integratedActionRules = integratedRules.filter((rule) => rule.id === "card-action-lock");
  assert(integratedActionRules.length === 1, "card-action-lock must remain the single primary Action Authority.");
  assert(
    count(integratedActionRules[0].text, /Event State Lock:/g) === 1,
    "Eligible lifestyle card must contain exactly one Event State Lock."
  );
  assert(
    count(integratedActionRules[0].text, /Action Lock:/g) === 1,
    "Eligible lifestyle card must contain exactly one Action Lock marker."
  );

  const mirrorRules = collectPromptRules({
    ...baseInput,
    imageType: "对镜穿搭图",
    compositionMode: "mirrorFull"
  });
  const mirrorAction = mirrorRules.find((rule) => rule.id === "card-action-lock");
  assert(mirrorAction && !mirrorAction.text.includes("Event State Lock:"), "Mirror prompt must not receive Event State Lock.");

  const baseParams = {
    imageType: "生活场景图",
    modelChoice: "30–45岁客户画像模特",
    modelContinuity: "新人物",
    shoe: "Cloud Dancer 云舞者",
    customShoe: "",
    season: "秋",
    scenePreference: "自动匹配",
    garmentTypePreference: "自动匹配",
    studioLaunchAnglePreference: "自动匹配",
    studioLaunchPreset: "auto",
    studioWardrobePreference: "auto",
    stillLifeStyle: "与主视觉统一",
    extraRequirement: "",
    generationNonce: 7
  };

  let runtimeChecked = 0;
  for (const variantOffset of [0, 1, 7]) {
    const content = generateSoftSeedingContent({
      baseParams,
      topic: "生活场景软种草",
      imageCount: 5,
      variantOffset,
      date: new Date("2026-10-03T12:00:00+08:00")
    });

    for (const image of content.images) {
      const eligibleType = image.params.imageType === "生活场景图" || image.params.imageType === "产品上脚图";
      const supportedScene = SUPPORTED_IMAGE_EVENT_SCENES.includes(image.params.scenePreference);
      const supportedAction = SUPPORTED_IMAGE_EVENT_ACTION_FAMILIES.includes(image.params.seriesActionFamily);
      if (!eligibleType || !supportedScene || !supportedAction) continue;
      runtimeChecked += 1;
      assert(
        count(image.prompt, /Event State Lock:/g) === 1,
        `Runtime prompt missing single Event State Lock: ${image.params.scenePreference} / ${image.params.seriesActionFamily}`
      );
    }
  }
  assert(runtimeChecked > 0, "Runtime validation did not encounter any supported eventized lifestyle card.");

  console.log(
    `PASS validate:image-eventization — ${IMAGE_EVENT_CATALOG.length} events, ${SUPPORTED_IMAGE_EVENT_SCENES.length} scenes, ${SUPPORTED_IMAGE_EVENT_ACTION_FAMILIES.length} action families, ${runtimeChecked} runtime cards checked.`
  );
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
