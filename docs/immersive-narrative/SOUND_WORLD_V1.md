# Immersive Narrative Sound World V1

## Status

Implemented as an isolated layer after Product Presence approval.

```text
Narrative
        ↓
Scene Resolver
        ↓
Product Presence
        ↓
Sound World
```

The module does not generate audio, music, dialogue, Provider requests, camera behavior, action compilation, or Seedance output.

## Sound Categories

- `ENVIRONMENT`: continuing room tone, street ambience, or other real spatial sound.
- `HUMAN`: fabric, body settling, restrained breathing, bag strap against clothing, and ordinary human movement.
- `OBJECT`: only sound caused by an object already present and physically handled in the Moment.
- `FOOTWEAR`: natural outsole or heel contact when the existing action includes ground contact.
- `SILENCE`: low-information room tone or a quiet continuation, not absolute digital silence.

Global policy:

```text
musicPolicy: NONE
dialoguePolicy: NONE
soundStyle: NATURALISTIC
```

## Physical Rules

- Sound is derived from What Happens, the resolved Scene, and the Location World.
- No cue may introduce a phone call, doorbell, dog bark, thunder, rain event, arriving car, or conversation directed at the character.
- Footwear sound is allowed only when the existing action already includes believable ground contact.
- `READABLE` product presence does not force footwear sound.
- No ASMR, product sound hit, transition whoosh, cinematic impact, emotional score, or repeated footwear emphasis.

## Topic Baselines

```text
下班回家   FOOTWEAR / ENVIRONMENT / OBJECT / OBJECT / SILENCE
出门       HUMAN / OBJECT / FOOTWEAR / ENVIRONMENT / ENVIRONMENT
周末书店   ENVIRONMENT / FOOTWEAR / ENVIRONMENT / OBJECT / ENVIRONMENT
等人       ENVIRONMENT / HUMAN / FOOTWEAR / ENVIRONMENT / SILENCE
咖啡馆     ENVIRONMENT / OBJECT / ENVIRONMENT / HUMAN / ENVIRONMENT
采购归来   FOOTWEAR / OBJECT / OBJECT / HUMAN / SILENCE
```

Baselines do not override physical reality. In the current bookstore Narrative, Moment 4 has a visual look toward the window but no real handled object, so its dominant sound resolves to `ENVIRONMENT` rather than forcing an `OBJECT` cue.

## Silence

- `NONE`: ordinary sound density.
- `LIGHT`: one sparse cue or a primarily environmental moment.
- `PRONOUNCED`: used for a life-led ending, with room tone or a faint exterior continuation.

The final Moment never defaults to a footstep crescendo, music ending, or product hit.

## Topic Expansion Baselines

The catalog expansion adds these dominant-sound baselines:

```text
周末独处   ENVIRONMENT / HUMAN / OBJECT / ENVIRONMENT / SILENCE
接孩子后   ENVIRONMENT / FOOTWEAR / ENVIRONMENT / HUMAN / ENVIRONMENT
周末散步   ENVIRONMENT / FOOTWEAR / ENVIRONMENT / FOOTWEAR / SILENCE
午餐之后   ENVIRONMENT / OBJECT / FOOTWEAR / ENVIRONMENT / ENVIRONMENT
城市闲逛   ENVIRONMENT / FOOTWEAR / ENVIRONMENT / HUMAN / ENVIRONMENT
傍晚回家   ENVIRONMENT / FOOTWEAR / OBJECT / HUMAN / SILENCE
短途出行   OBJECT / FOOTWEAR / ENVIRONMENT / OBJECT / ENVIRONMENT
```

All 13 catalog topics pass Sound World with physical adjustments where the actual Moment does not support a baseline cue.

## QC

- `Narrative Preserved`
- `Scene Physically Consistent`
- `No Invented Event`
- `No Overdesign`

Any unapproved upstream status, invalid dominant sound, invented event, material contradiction, narrative mutation, or overdesigned cue set produces:

```text
SOUND_WORLD_FAILED
```

## UI

The existing `ImmersiveNarrativeWorkspace` shows:

- Narrative → Scene Resolver → Product Presence → Sound World
- Dominant Sound per Moment
- Main environment, human, object, and footwear cues
- Silence level
- Four Sound World QC gates
- Failure reasons

No waveform, playback, manual sound editor, or audio generation control was added.

## Validation

```bash
npm run validate:narrative-sound-world
```

Coverage includes all 13 catalog Topics through the topic-pipeline validator, a valid pronounced-silence ending, `READABLE` product presence with no footwear sound, invented-event failure, material mismatch failure, overdesign failure, narrative mutation failure, unapproved upstream statuses, moment-count failure, and existing Prompt / JSON / Seedance hash regression.

## Current State

`SOUND WORLD V1 COMPLETE`

Camera Narrative Role V1 consumes the approved Sound World output; Physical Action Compiler, Seedance Compiler, Audio Generation, Music Generation, and Provider E2E remain unbuilt.
