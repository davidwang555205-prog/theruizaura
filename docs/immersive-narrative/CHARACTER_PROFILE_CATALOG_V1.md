# Immersive Narrative Character Profile Catalog V1

## Status

Implemented as a two-axis character catalog:

```text
Age Profile Catalog
+
Appearance Group Catalog
↓
Character Selection
↓
Narrative
↓
Scene Resolver
↓
Product Presence
↓
Sound World
↓
Camera Narrative Role
```

## Age Profiles

```text
ID          Label
age_23_27   23–27｜年轻都市
age_28_32   28–32｜都市轻熟
age_33_37   33–37｜成熟都市
age_38_42   38–42｜松弛知性
age_43_47   43–47｜成熟生活
age_48_55   48–55｜从容成熟
```

Each profile supplies life-stage tone, visual maturity, styling attitude, social energy, body-language guidance, and performance guardrails. Age never infers profession, income, marriage, children, health, physical ability, personality, or social class.

## Appearance Groups

```text
ID                Label
asian             亚裔
european          欧裔
latin_american    拉丁美裔
```

Appearance groups affect only broad visible facial, skin, and natural hair variation. They never affect personality, lifestyle, social class, income, profession, family structure, behavior, movement, intelligence, taste, or cultural habits.

## Combination Model

The catalog exposes:

```text
6 Age Profiles × 3 Appearance Groups = 18 Character Profiles
```

The profiles are resolved dynamically. There are no duplicate `age_x_appearance.ts` files.

Legacy compatibility:

```text
32岁左右成熟女性
→ age_28_32 + asian
```

Only that legacy value is migrated. Unknown free-text profiles fail closed.

## Topic Independence

Every age profile and appearance group can be combined with every one of the 13 Narrative Topics.

```text
13 Topics × 6 Ages × 3 Appearance Groups
= 234 structurally valid combinations
```

Appearance changes do not change Scene Resolution, Product Presence, Sound World, or Camera Narrative Role for the same Topic and Moment.

## QC

- `Valid Age Profile`
- `Valid Appearance Group`
- `No Demographic Stereotype`
- `No Unsupported Inference`

Invalid ids, age outside the catalog, free-text bypass, stereotype movement/personality inference, or cultural nationality inference produce:

```text
CHARACTER_PROFILE_FAILED
```

## UI

The formal Character Profile text input has been replaced with:

```text
年龄阶段 dropdown
人物外观 dropdown
```

Default:

```text
28–32｜都市轻熟
亚裔
```

The debug workspace also shows the resolved character status and four Character Profile QC gates. No face preview, model card, photo upload, body metrics, hairstyle, or makeup controls were added.

## Validation

```bash
npm run validate:narrative-character-profile
npm run validate:narrative-topic-pipeline
```

Validation covers catalog counts, unique ids and labels, all 18 combinations, invalid ids, legacy migration, unsupported free text, stereotype guard failures, all 234 Topic × Character combinations, representative six-stage pipelines, appearance invariance, and existing Prompt / JSON / Seedance regression hashes.

## Current State

`CHARACTER PROFILE CATALOG V1 COMPLETE`

Physical Action Compiler, Camera Execution, Seedance Compiler, and Provider E2E remain unbuilt.
