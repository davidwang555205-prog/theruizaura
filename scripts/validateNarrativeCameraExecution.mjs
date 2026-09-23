import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Phase 7 validator. It runs the real Camera Execution planner over all 13
// canonical topics through the shared pipeline and asserts the deterministic
// camera contract: role mapping, single lens family, no product motivation, no
// action rewrite, and honest unsupported Moments.
const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-camera-execution-validation-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const ROLE_MOVEMENT = {
  OBSERVER: "locked_off",
  FOLLOWER: "restrained_follow",
  WAITING_CAMERA: "locked_off",
  AFTER_ACTION: "hold_position",
  PARTIAL_OBSERVATION: "locked_off",
};

try {
  await writeFile(
    entryPath,
    `export * from ${JSON.stringify(resolve(projectRoot, "src/immersive-narrative/index.ts"))};\n`
  );
  await build({ entryPoints: [entryPath], bundle: true, format: "esm", platform: "node", outfile: bundlePath, logLevel: "silent" });
  const {
    NARRATIVE_TOPIC_CATALOG,
    runImmersiveNarrativePipeline,
  } = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);

  const QC_GATES = [
    "physical_action_preserved",
    "camera_role_preserved",
    "no_product_driven_action",
    "no_product_only_camera_motivation",
    "no_impossible_follow",
    "no_body_camera_collision",
    "no_perspective_abuse",
    "no_random_lens_jump",
    "no_unmotivated_reframe",
    "moment_continuity",
    "natural_ending",
  ];

  const perTopic = [];
  let totalMoments = 0;
  let executableMoments = 0;
  let unsupportedMoments = 0;
  let unsupportedWithExecution = 0;
  let productDriven = 0;
  let actionRewrites = 0;
  let sideSwitches = 0;
  let lensFamilyChanges = 0;
  let resetToFront = 0;
  let roleMappingFailures = 0;
  let productAccessForbiddenMoments = 0;
  let qcFailures = 0;
  let approvedTopics = 0;

  for (const topic of NARRATIVE_TOPIC_CATALOG) {
    const outcome = runImmersiveNarrativePipeline({
      topic: topic.label,
      characterSelection: { ageProfileId: "age_28_32", appearanceGroupId: "asian" },
      season: "秋",
      lifestyleFeeling: "安静 / 克制",
      availableSceneLibrary: topic.defaultSceneLabels.map((label, index) => ({ id: `camera-${topic.id}-${index + 1}`, label })),
    });
    assert(outcome.status === "GENERATED", `${topic.label} pipeline was blocked: ${outcome.status === "BLOCKED" ? outcome.reason : ""} ${outcome.status === "BLOCKED" ? outcome.diagnostics.join(" | ") : ""}`);

    const plan = outcome.cameraExecution.plan;
    const report = outcome.physicalAction.report;
    assert(outcome.cameraExecution.alignmentIssues.length === 0, `${topic.label} Camera Execution has Moment index alignment issues: ${outcome.cameraExecution.alignmentIssues.join(" | ")}`);
    assert(plan.moments.length === 5, `${topic.label} Camera Execution must cover 5 Moments, received ${plan.moments.length}`);
    assert(
      JSON.stringify(plan.moments.map((moment) => moment.momentIndex)) === JSON.stringify([0, 1, 2, 3, 4]),
      `${topic.label} Camera Execution canonical Moment index changed`
    );
    if (plan.status === "CAMERA_EXECUTION_APPROVED") approvedTopics += 1;
    else qcFailures += 1;

    const failedGates = QC_GATES.filter((gateId) => plan.qc[gateId].status !== "PASS");
    if (failedGates.length > 0) qcFailures += 1;
    assert(failedGates.length === 0, `${topic.label} Camera QC gate(s) failed: ${failedGates.join(", ")}`);

    assert(plan.coverage.lensFamilyCount === 1, `${topic.label} uses ${plan.coverage.lensFamilyCount} lens families`);
    lensFamilyChanges += plan.coverage.lensFamilyChanges;
    sideSwitches += plan.coverage.sideSwitches;
    resetToFront += plan.coverage.resetToFrontCount;
    productDriven += plan.coverage.productDrivenCameraMoments;
    actionRewrites += plan.coverage.actionRewrites;

    const previousEnd = -1;
    let lastEnd = previousEnd;
    for (const moment of plan.moments) {
      totalMoments += 1;
      const actionMoment = report.moments.find((entry) => entry.momentIndex === moment.momentIndex);
      assert(actionMoment, `${topic.label} Moment ${moment.momentIndex} lost its Physical Action record`);
      assert(
        moment.cameraRole === outcome.cameraNarrative.moments.find((entry) => entry.momentIndex === moment.momentIndex)?.role,
        `${topic.label} Moment ${moment.momentIndex} changed its Camera Narrative Role`
      );
      assert(
        moment.productReframeAllowed === false && moment.productMayMotivateCamera === false,
        `${topic.label} Moment ${moment.momentIndex} let Product Presence motivate the camera`
      );

      if (actionMoment.status === "MATCHED") {
        executableMoments += 1;
        assert(moment.status === "EXECUTABLE", `${topic.label} Moment ${moment.momentIndex} has a matched action but no camera execution`);
        assert(moment.physicalActionId === actionMoment.selectedActionId, `${topic.label} Moment ${moment.momentIndex} camera plan rewrote the selected Action`);
        assert(
          moment.physicalActionMovementState === actionMoment.selectedMovementState,
          `${topic.label} Moment ${moment.momentIndex} camera plan changed the movement state`
        );
        assert(
          ROLE_MOVEMENT[moment.cameraRole] === moment.cameraMovement,
          `${topic.label} Moment ${moment.momentIndex} maps ${moment.cameraRole} to ${moment.cameraMovement}`
        );
        assert(moment.cameraPosition === "off_travel_axis_established_side", `${topic.label} Moment ${moment.momentIndex} moved the camera onto the travel path`);
        assert(moment.timing && moment.timing.endSecond > moment.timing.startSecond, `${topic.label} Moment ${moment.momentIndex} has no valid timing window`);
        assert(moment.timing.startSecond >= lastEnd, `${topic.label} Moment ${moment.momentIndex} timing overlaps the previous Moment`);
        lastEnd = moment.timing.endSecond;
        assert(moment.lensFamily === plan.continuityProfile.lensFamily, `${topic.label} Moment ${moment.momentIndex} switched lens family`);
        assert(typeof moment.productVisibilityGuard === "string" && moment.productVisibilityGuard.length > 0, `${topic.label} Moment ${moment.momentIndex} lost the product visibility guard`);
      } else {
        unsupportedMoments += 1;
        assert(moment.status === "CORRECT_UNSUPPORTED", `${topic.label} unresolved Moment ${moment.momentIndex} was not marked CORRECT_UNSUPPORTED`);
        assert(moment.physicalActionId === null, `${topic.label} unsupported Moment ${moment.momentIndex} invented an action id`);
        assert(
          moment.shotScale === null && moment.cameraMovement === null && moment.timing === null && moment.lensFamily === null,
          `${topic.label} unsupported Moment ${moment.momentIndex} fabricated a camera execution`
        );
        assert(Boolean(moment.unsupportedReason), `${topic.label} unsupported Moment ${moment.momentIndex} has no unsupported reason`);
        if (moment.shotScale !== null || moment.cameraMovement !== null) unsupportedWithExecution += 1;
      }

      if (moment.productPresence === "ABSENT" || moment.productPresence === "INCIDENTAL") {
        productAccessForbiddenMoments += 1;
      }

      if (ROLE_MOVEMENT[moment.cameraRole] === undefined) roleMappingFailures += 1;
    }

    const lastMoment = plan.moments[plan.moments.length - 1];
    assert(lastMoment, `${topic.label} has no final Moment`);
    assert(
      lastMoment.status === "CORRECT_UNSUPPORTED"
      || lastMoment.cameraMovement === "hold_position"
      || lastMoment.cameraMovement === "locked_off"
      || lastMoment.cameraMovement === "restrained_follow",
      `${topic.label} does not end on a held or action-terminated camera state`
    );
    assert(plan.restrictions.length >= 10, `${topic.label} lost the AURA camera restrictions`);

    perTopic.push({
      topic: topic.label,
      status: plan.status,
      executable: plan.moments.filter((moment) => moment.status === "EXECUTABLE").length,
      correctUnsupported: plan.moments.filter((moment) => moment.status === "CORRECT_UNSUPPORTED").length,
      lensFamily: plan.continuityProfile.lensFamily,
      perspectiveRisk: plan.continuityProfile.perspectiveRisk,
      cameraRoles: plan.moments.map((moment) => moment.cameraRole),
      qcPassed: failedGates.length === 0,
    });
  }

  assert(approvedTopics === NARRATIVE_TOPIC_CATALOG.length, `${approvedTopics} of ${NARRATIVE_TOPIC_CATALOG.length} topics reached CAMERA_EXECUTION_APPROVED`);
  assert(qcFailures === 0, `${qcFailures} camera QC failure(s) remain`);
  assert(unsupportedWithExecution === 0, `${unsupportedWithExecution} unsupported Moment(s) fabricated camera execution`);
  assert(productDriven === 0, `${productDriven} product-driven camera Moment(s) remain`);
  assert(actionRewrites === 0, `${actionRewrites} action rewrite(s) were attempted by the camera layer`);
  assert(sideSwitches === 0, `${sideSwitches} camera-side switch(es) remain`);
  assert(lensFamilyChanges === 0, `${lensFamilyChanges} lens-family change(s) remain`);
  assert(resetToFront === 0, `${resetToFront} reset-to-front frame(s) remain`);
  assert(roleMappingFailures === 0, `${roleMappingFailures} camera role(s) have no execution mapping`);

  console.log("CAMERA EXECUTION VALIDATION PASS:", JSON.stringify({
    stage: "CAMERA_EXECUTION_V1",
    topics: NARRATIVE_TOPIC_CATALOG.length,
    approvedTopics,
    totalMoments,
    executableMoments,
    correctUnsupportedMoments: unsupportedMoments,
    unsupportedWithExecution,
    qcGates: QC_GATES.length,
    qcFailures,
    lensFamilyChanges,
    sideSwitches,
    resetToFrontCount: resetToFront,
    productDrivenCameraMoments: productDriven,
    actionRewrites,
    productAccessForbiddenMoments,
    roleMapping: ROLE_MOVEMENT,
    reusedRules: [
      "src/utils/cameraPerspectiveProfiles.ts",
      "src/data/cameraLookProfiles.ts",
      "src/video-script/compileSeedanceVideoScript.ts camera constraint families",
    ],
    perTopic,
  }, null, 2));
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
