# Garment product refresh hotfix

## Root cause

The garment fields were held in the local `garment` draft while the visible generated prompt was stored independently as a string. There was no source-product fingerprint attached to the generated output, so changing category, name, color, fabric, details, or reference roles left the previous Prompt visible until a new generation completed. The generation callback itself was not memoized; the missing guard was stale-output invalidation and the lack of a product snapshot identity.

## Fix

`App.tsx` now creates a normalized garment product fingerprint from all supported garment fields and stable reference `{id, role}` pairs. A change to the fingerprint marks the form pending, clears copy status, and clears the visible garment output when it was generated from a different fingerprint. Mode changes clear the visible output as well. Generate and sync paths record the current fingerprint after reading the current garment state.

No timestamp, forced whitespace, page reload, mutable state, or random React key was added. The existing `productContext` construction remains the source for generation, and shoe references continue using their existing state.

## Regression status

- TypeScript check: pass
- Production build: pass; existing bundle-size warning only
- Release verification: pass
- Manual browser reproduction: not executed in this non-dev run; use the browser checklist to verify dress → shirt and same-category field changes.

Remaining limitation: the browser UI must be exercised to validate clipboard and visual stale-state messaging end to end. The fingerprint itself covers category, name, color, fabric, silhouette, neckline, shoulder, sleeve, waist, length, hem, closure, pattern, drape, transparency, key details, and reference roles.
