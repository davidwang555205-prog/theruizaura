# Current UI Inventory

- Repository: `/Users/davidw/Documents/theruizonline-ui-redesign`
- Entry: `src/main.tsx` → `src/App.tsx`
- Routing: no router dependency; page switching is local state in `App.tsx`.
- Prompt Builder: the existing form in `App.tsx` owns `TeamPromptParams`, auto-update state, advanced scene fields, copy, reference upload, placeholder generation and download feedback.
- Xiaohongshu: `generateSoftSeedingContent.ts` supplies titles, body, tags and image plans; the existing cards expose copy and full-prompt disclosure.
- Styling: Tailwind utilities plus `src/index.css`; this phase adds platform tokens and shell primitives in CSS.
- API: no external image API is connected. Existing image generation is an explicit local preview/placeholder flow.
- Validation commands: `npm run typecheck`, `npm run build`, `npm run validate:engine`, `npm run validate:prompts`, `npm run validate:studio`, `npm run validate:outfits`.

The original single-page behavior is preserved inside the new shell. Navigation is a local, explicit selector until real routes are introduced.
