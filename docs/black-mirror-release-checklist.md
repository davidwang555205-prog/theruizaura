# Black Mirror Release Checklist

- [ ] Confirm branch and clean/intentional working tree.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run build`; record emitted JS/CSS chunks and warnings.
- [ ] Run `npm run verify:release`.
- [ ] Run `git diff --check`.
- [ ] Verify garment single/3/5/8 and reference validation.
- [ ] Verify each active shoe category at single/3/5/8.
- [ ] Verify complete-side and primary reference requirements.
- [ ] Verify category switching stales old output and copy uses the current result.
- [ ] Verify planned categories remain blocked without fallback.
- [ ] Perform browser acceptance on the actual local URL and record console errors.
- [ ] Record known limitations and release status: `BLOCKED`, `READY_WITH_KNOWN_LIMITATIONS`, or `READY`.
- [ ] Commit and push only after explicit approval.
