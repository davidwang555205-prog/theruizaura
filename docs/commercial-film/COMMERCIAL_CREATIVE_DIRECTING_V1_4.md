# COMMERCIAL FILM V1.4 CREATIVE DIRECTING LAYER

## Stage

```text
COMMERCIAL FILM V1.4
CREATIVE DIRECTING LAYER
```

V1.4 builds above the frozen V1.3 execution baseline.

It does not rewrite:

- V1.3 canonical baseline
- existing Director Concepts
- existing Cinematic Devices
- existing Actions
- Narrative
- V1.3 validation fixtures
- Final Script Presentation source-event integrity

## Architecture

```text
Commercial Intent
→ Creative Proposition
→ existing Director Concept
→ Creative Treatment
→ Signature Event Plan
→ Device Arc
→ Structure Selection
→ Shot Visual Priority
→ existing V1.3 Execution Engine
→ V1.4 Seedance Translation Extension
→ V1.4 Presentation
```

The V1.3 execution engine remains a separate, callable path.

## Creative Proposition

Every treatment has one sentence that defines the film's point of view.

The proposition is not a Director Concept enum, mood adjective list, product claim, or slogan.

## Signature Event

Each V1.4 treatment defines at least one concrete signature event. The event is observable on screen and remains identifiable without the product name.

The event carries:

- cause
- event
- visual result
- next-beat trigger
- product connection

The event sequence contains five beats represented by the selected structure.

## Device Arc

Each beat defines:

```ts
deviceState
deviceCarrier
deviceIntensity
deviceFunction
```

The carrier must develop. The same physical carrier may not repeat for more than two consecutive beats unless the treatment deliberately establishes a repetition device.

## Structure Selection

The existing classic role structure remains available:

```text
WORLD → WEAR → DETAIL → HERO → RELEASE
```

It is not mandatory.

Additional structure families:

- Obscure → Reveal → Interrupt → Resolve → Disappear
- Move → Move → Hold → Single Action → Release
- Observe → Approach → Contact → Resolve → Afterimage
- Repeat → Repeat With Change → Break Pattern → Hero → Release
- Arrive → Discover → Interact → Settle → Remain

The structure is selected before shot execution and must preserve product connection, readability where required, a complete ending, Intent, and realistic execution.

## Product Reveal Logic

Product readability is caused by an event or visible state change:

- obstruction clears
- body motion stops
- light reaches the material
- surface changes
- boundary opens
- camera remains while the subject moves

The V1.4 layer does not invent product facts.

## Shot Visual Priority

Every shot has:

```ts
primaryVisualPriority
secondaryVisualPriority
suppressedVisualPriority
```

The raw priorities are not exposed in the customer-facing script.

## Seedance Translation Extension

The frozen V1.3 compiler is not modified.

V1.4 adds a concise extension that contains:

- creative proposition
- film tension
- signature event
- product reveal cause
- ending image
- device arc
- shot visual priorities

The extension is stored separately from `canonicalCompiledText`.

## Presentation Integration

The V1.4 Director Script adds:

- title
- Creative Proposition
- Film Tension
- Signature Event
- Device Arc
- selected Structure

The existing V1.3 Director Script and Seedance execution source remain available independently.

## Validation

```bash
npm run validate:commercial-creative-directing
npm run validate:commercial-creative-treatment
npm run validate:commercial-device-arc
npm run validate:commercial-structure-selection
npm run validate:commercial-shot-visual-priority
npm run validate:commercial-creative-treatment-diversity
npm run validate:commercial-v1.4
```

V1.4 regression output:

```text
artifacts/commercial-film/v1.4/creative-directing-regression.json
artifacts/commercial-film/v1.4/QUALITY_REPORT.md
```

## V1.4 Status

```text
V1.4 SCRIPT STATUS:
PASS

V1.4 VISUAL STATUS:
NOT VERIFIED

V1.4 PRODUCTION STATUS:
NOT FROZEN
```

Real Seedance visual acceptance has not happened for V1.4.

## V1.4.1 Creative Quality Hardening

V1.4.1 does not add capabilities or structure families. It hardens the existing V1.4 objects:

- `CreativeTreatmentSemanticFingerprint`
- fully instantiated Signature Event
- `beforeState` / `afterState`
- `eventRevealLink`
- literal `endingImage` with separate `endingMeaning`
- carrier/event semantic alignment

The 12-case matrix is audited pairwise for:

- semantic treatment clones
- proposition semantic clones
- Signature Event reuse
- Device Arc reuse
- placeholder events
- unresolved event objects
- missing event state change
- disconnected product reveal
- abstract endings
- proposition scaffold reuse

Commands:

```bash
npm run validate:commercial-creative-quality
npm run validate:commercial-treatment-semantic-diversity
```

The hardened report is written to:

```text
artifacts/commercial-film/v1.4/QUALITY_REPORT_V1_4_1.md
```

The status after code hardening remains:

```text
V1.4.1 SCRIPT STATUS:
PASS

V1.4.1 CREATIVE QUALITY:
PENDING HUMAN REVIEW

V1.4.1 VISUAL STATUS:
NOT VERIFIED

V1.4.1 PRODUCTION STATUS:
NOT FROZEN
```

## V1.4.2 Signature Moment First

V1.4.2 changes the internal generation order without adding a new capability layer:

```text
Commercial Intent
→ Director Concept
→ Signature Moment
→ Creative Proposition derived from the moment
→ pre-moment events
→ Signature Moment
→ post-moment events
→ Device Arc built around the moment
→ Structure selection
→ Product reveal logic
→ Shot visual priority
→ Ending image
→ existing V1.4 / V1.3 execution
→ Final Script Presentation
```

The Signature Moment contains:

```text
momentDescription
beforeMoment
visualInterruption
afterMoment
productRole
worldRole
deviceRole
memoryReason
```

The same 12 case inputs are regenerated. The report is:

```text
artifacts/commercial-film/v1.4/QUALITY_REPORT_V1_4_2.md
```

Commands:

```bash
npm run validate:commercial-signature-moment
npm run validate:commercial-signature-moment-first
```

V1.4.2 remains:

```text
SCRIPT STATUS:
PASS

HUMAN CREATIVE QUALITY:
PENDING REVIEW

VISUAL STATUS:
NOT VERIFIED

PRODUCTION STATUS:
NOT FROZEN
```

## V1.4.3 Creative Synthesis

V1.4.3 adds one internal synthesis pass. It does not add metadata, concepts, devices, or structure families.

The pass compresses the generated draft into a smaller, physically coherent treatment:

- short Creative Proposition
- one main Signature Moment mechanism
- direct pre/post event language
- physical cause for movement and light
- coherent world carriers
- concise product role
- literal, product-safe ending

Validation:

```bash
npm run validate:commercial-creative-synthesis
npm run validate:commercial-physical-reality
npm run validate:commercial-world-coherence
```

Quality report:

```text
artifacts/commercial-film/v1.4/QUALITY_REPORT_V1_4_3.md
```

V1.4.3 status:

```text
SCRIPT STATUS:
PASS

HUMAN CREATIVE QUALITY:
PENDING REVIEW

VISUAL STATUS:
NOT VERIFIED

PRODUCTION STATUS:
NOT FROZEN
```

## V1.4.4 Final Filmability Polish

V1.4.4 is a final polish pass over the existing V1.4.3 synthesis. It adds no new layer or schema.

It checks:

- physical cause and effect
- object agency
- spatial relationships across interior and exterior worlds
- carrier world ownership
- proposition / Signature Moment lock
- one dominant mechanism
- literal, product-safe ending

Commands:

```bash
npm run validate:commercial-filmability
npm run validate:commercial-physical-reality
npm run validate:commercial-world-coherence
```

Quality report:

```text
artifacts/commercial-film/v1.4/QUALITY_REPORT_V1_4_4.md
```

V1.4.4 status:

```text
SCRIPT STATUS:
PASS

CREATIVE QUALITY:
PENDING HUMAN REVIEW

VISUAL STATUS:
NOT VERIFIED

PRODUCTION STATUS:
NOT FROZEN
```
