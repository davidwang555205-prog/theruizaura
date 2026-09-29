import type { CommercialFinalExecutionPlan } from "../final-execution/types";
import type {
  CommercialFinalDirectorScript,
  CommercialFinalRenderValidation,
  CommercialFinalRenderValidationCheck,
  CommercialFinalSeedancePrompt,
} from "./types";
import {
  hasGeneratedBrandOrEndCard,
  hasLegacySecondRevealAuthority,
  internalWhitelistLeak,
} from "./shared";

function check(
  id: CommercialFinalRenderValidationCheck["id"],
  passed: boolean,
  passReason: string,
  failReason: string
): CommercialFinalRenderValidationCheck {
  return {
    id,
    status: passed ? "PASS" : "FAIL",
    reason: passed ? passReason : failReason,
  };
}

function sameStrings(left: string[], right: string[]) {
  return left.join("|") === right.join("|");
}

export function validateCommercialFinalRender(input: {
  plan: CommercialFinalExecutionPlan;
  directorScript: CommercialFinalDirectorScript;
  seedancePrompt: CommercialFinalSeedancePrompt;
}): CommercialFinalRenderValidation {
  const { plan, directorScript, seedancePrompt } = input;
  const resourceIds = new Set(plan.physicalResources.map((resource) => resource.id));
  const resolvedBindings = plan.device.resourceBindings.every((binding) => (
    binding.resolved && binding.resourceId !== null && resourceIds.has(binding.resourceId)
  ));
  const signatureResourceExists = Boolean(plan.signature.resourceId && resourceIds.has(plan.signature.resourceId));
  const checks: CommercialFinalRenderValidationCheck[] = [
    check(
      "final_plan_valid",
      plan.status === "VALID",
      "The renderer input Final Execution Plan is VALID.",
      "A BLOCKED Final Execution Plan cannot produce production renderers."
    ),
    check(
      "same_take_count",
      directorScript.takeCount === seedancePrompt.takeCount
        && directorScript.beatCount === seedancePrompt.beatCount
        && directorScript.takeCount === plan.takeStructure.takes.length
        && directorScript.beatCount === plan.beats.length,
      "Director Script and Seedance Prompt use the same Take and Beat count.",
      "Director Script and Seedance Prompt disagree on Take or Beat count."
    ),
    check(
      "same_reveal_beat",
      directorScript.revealBeatIndex === seedancePrompt.revealBeatIndex
        && directorScript.revealBeatIndex === plan.productVisibility.revealContract.revealBeatIndex,
      "Director Script and Seedance Prompt use the same Reveal Contract.",
      "Director Script and Seedance Prompt disagree on the Reveal beat."
    ),
    check(
      "same_visibility_timeline",
      sameStrings(directorScript.visibilityTimeline, seedancePrompt.visibilityTimeline)
        && sameStrings(
          directorScript.visibilityTimeline,
          plan.productVisibility.timeline.map((beat) => beat.normalizedState)
        ),
      "Director Script and Seedance Prompt use the same normalized visibility timeline.",
      "Director Script and Seedance Prompt disagree on normalized Product Visibility."
    ),
    check(
      "same_physical_resources",
      sameStrings(directorScript.resourceIds.slice().sort(), seedancePrompt.resourceIds.slice().sort()),
      "Director Script and Seedance Prompt use the same physical resources.",
      "Director Script and Seedance Prompt disagree on physical resources."
    ),
    check(
      "same_signature_contract",
      directorScript.signatureEventId === seedancePrompt.signatureEventId
        && directorScript.signatureEventId === plan.signature.eventId,
      "Director Script and Seedance Prompt use the same Signature Contract.",
      "Director Script and Seedance Prompt disagree on the Signature Contract."
    ),
    check(
      "same_camera_authority",
      directorScript.cameraSignature === seedancePrompt.cameraSignature
        && plan.camera.compatibilityStatus === "COMPATIBLE",
      "Director Script and Seedance Prompt use the same compatible Camera Authority.",
      "Director Script and Seedance Prompt disagree on Camera Authority or the Camera Plan is incompatible."
    ),
    check(
      "same_final_character_state",
      JSON.stringify(directorScript.finalCharacterState) === JSON.stringify(seedancePrompt.finalCharacterState),
      "Director Script and Seedance Prompt use the same final character state.",
      "Director Script and Seedance Prompt disagree on final character state."
    ),
    check(
      "same_ending",
      directorScript.endingImage === seedancePrompt.endingImage
        && directorScript.endingImage === plan.ending.finalImage,
      "Director Script and Seedance Prompt use the same final Ending.",
      "Director Script and Seedance Prompt disagree on the final Ending."
    ),
    check(
      "no_undeclared_executable_resource",
      resolvedBindings && signatureResourceExists,
      "Every executable Device and Signature resource is declared in the Final Plan.",
      "The renderers contain an undeclared executable physical resource."
    ),
    check(
      "no_legacy_reveal_authority",
      !hasLegacySecondRevealAuthority(directorScript.text)
        && !hasLegacySecondRevealAuthority(seedancePrompt.text),
      "No legacy second Reveal authority is present in either renderer.",
      "A legacy second Reveal authority leaked into a renderer."
    ),
    check(
      "no_post_compiler_authority",
      !/\[V1\.4 CREATIVE DIRECTING\]|appendCommercialV14TranslationExtension|resolveFinalStateWording/.test(
        `${directorScript.text}\n${seedancePrompt.text}`
      ),
      "No post-compiler string authority is present in the production renderers.",
      "A post-compiler authority path leaked into production rendering."
    ),
    check(
      "no_generated_logo_or_end_card",
      !hasGeneratedBrandOrEndCard(directorScript.text)
        && !hasGeneratedBrandOrEndCard(seedancePrompt.text),
      "Neither renderer requests a generated logo, brand mark, or end card.",
      "A renderer requests generated branding or an end card."
    ),
    check(
      "film_line_post_production_only",
      directorScript.filmLine === plan.ending.filmLine.value
        && seedancePrompt.filmLine === plan.ending.filmLine.value
        && plan.ending.filmLine.postProductionOnly
        && plan.ending.filmLine.endingImagePreserved,
      "The Film Line remains a post-production overlay and does not change the ending image.",
      "The Film Line is not restricted to post-production overlay behavior."
    ),
    check(
      "no_internal_whitelist_leakage",
      !internalWhitelistLeak(directorScript.text)
        && !internalWhitelistLeak(seedancePrompt.text),
      "No internal enum, validator, state-machine, or version token leaked into production output.",
      "Internal enum, validator, state-machine, or version token leaked into production output."
    ),
  ];
  const diagnostics = checks
    .filter((entry) => entry.status === "FAIL")
    .map((entry) => `${entry.id}: ${entry.reason}`);
  return {
    schemaVersion: "commercial-film/final-renderers-v1",
    rendererVersion: "1.0.0",
    status: diagnostics.length === 0 ? "VALID" : "BLOCKED",
    checks,
    diagnostics,
  };
}
