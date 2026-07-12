# Single Prompt render second pass

## Root cause and fix

The first audit showed the upper handler generated a prompt, but the UI had only an undifferentiated prompt string. The second pass makes the visible source explicit: `singlePromptResult` contains `mode`, `sourceFingerprint`, and `prompt`. The upper button writes this result directly after generating one prompt; the lower content path may synchronize and write the same result, but is not required. The right panel renders `singlePromptResult.prompt` independently of Xiaohongshu content.

Product changes and mode switches clear the result. Copy is disabled when no current result exists and reads the same visible result state.

## Manual acceptance required

Automated typecheck/build/release checks do not prove a browser click path. The required manual sequence is: valid garment → upper button → visible prompt; dress → shirt → upper button → visible shirt prompt; shoe mode → upper button → visible shoe prompt; refresh → upper button only → visible prompt. Phase 6 remains `BLOCKED` until these browser checks pass.
