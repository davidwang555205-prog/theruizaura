# Black Mirror Hotfix — Shoe Lifestyle Series Diversity

## Root cause

`generateSoftSeedingContent` previously stored the first card's generated `sharedOutfitLine` and passed it to every later `生活场景软种草` shoe card. Its shared lifestyle continuity line also required the same exact outfit across the set, while the multi-image handheld rule normally forced empty hands. The scene draft and generation nonce changed, but the resulting Model, Styling, and Action instructions had no explicit per-card shot purpose, so a model could remain in the same frozen pose/expression while only the background changed.

## Shared locks

Shoe lifestyle series now keep the shoe identity, same person/face, hairstyle, makeup, body proportions, season, quiet-luxury direction, and warm-neutral palette. They do not lock an exact pose, gaze, expression, crop, hand placement, or full outfit sentence.

## Per-card variation

`ShoeLifestyleShotPlan` supplies structured Action, Gaze, Expression, Framing, body orientation, prop, and supporting-styling rules. Those fields are placed into the final prompt's Model, Scene, and Action sections rather than being left only as background variation.

Three-card series always follow:

1. departure / ready-to-go hero
2. commute movement
3. candid pause / product-reading moment

Five-card series adds destination arrival/browsing and a natural-context closer product proof. The family selection still rotates compatible real scenes, but it now preserves those commercial shot roles.

## Styling policy

Soft-seeding uses coherent-palette variation: same model, season, shoe, and quiet-luxury wardrobe family; scene-appropriate light layers, accessory treatment, and top/lower combinations may change. `穿搭解决方案` and `棚内上新拍摄` retain their existing exact full-outfit lock.

## Validator

`validateShoeLifestyleSeriesDiversity` is a pure runtime validator exposed on `SoftSeedingContent.shoeSeriesDiversityValidation`. For lifestyle 3/5-card shoe sets it detects repeated shot IDs, insufficient action, gaze, expression, framing, or styling variety. It does not rewrite user requirements or alter garment plans.

## Regression scope

- Shoe lifestyle 3 and 5: fixed.
- Shoe studio 8: unchanged.
- Garment series context and garment shot plans: unchanged.
- Copy and export formatting: unchanged.

## Manual comparison

The local 3-card Cloud Dancer sample was verified after the change:

| Card | Scene | Action | Gaze / expression | Framing | Styling |
| --- | --- | --- | --- | --- | --- |
| 1 | home-entry return/departure moment | standing pause | nearby departure point; calm neutral | full/environmental 3/4 | ivory shirt and warm-grey trousers |
| 2 | business-district commute | short stable walking step | toward destination; focused neutral | wider movement frame | cardigan/tote commuter variation |
| 3 | flower-shop pause | seated or browsing pause | nearby scene; softer observant expression | medium/lower 3/4 proof | warm-stone blouse, olive trousers, cream jacket |

All three retain Cloud Dancer and the same model identity, while action, scene, framing, gaze/expression, and supporting styling are explicit per-card differences.
