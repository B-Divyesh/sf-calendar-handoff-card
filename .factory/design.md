# Calendar Handoff Card — visual thesis

## Direction: the event changes hands

The product uses a **risograph tactile collage**: a useful paper handoff assembled from overlapping calendar scraps, punched registration marks, torn edges, and imperfect ink. It fits the job because the output is not another calendar system; it is the dependable note that survives the trip between systems. Chrome stays quiet around the actual handoff card, which should feel ready to copy, pin, or pass across a kitchen table.

This is deliberately a single light treatment. Warm paper is essential to the print-collage metaphor; dark mode would turn the artifact into a glowing screen and weaken the concept. Every page explicitly paints the paper background.

## Palette

All colors are encoded as CSS tokens and checked on the colors where they appear.

| Token | Value | Role |
| --- | --- | --- |
| Paper | `#F3E9D2` | page background, uncoated stock |
| Card | `#FFF9EA` | primary sheet and form fields |
| Ink | `#201B18` | body and headline text |
| Muted ink | `#62564C` | secondary copy (7:1 on paper) |
| Cobalt | `#2146A3` | primary action, link, focus |
| Cobalt dark | `#17337A` | hover/pressed action |
| Persimmon | `#C9482D` | registration marks and highlights |
| Sunflower | `#E4B83C` | collage layer, warning surface only |
| Pine | `#1E694F` | success and secondary stamp |
| Danger | `#A62E2E` | error text and outline |

No gradients. Overprint effects come from flat semi-opaque color fields, halftone dots, and slight physical offsets.

## Type pairing

- **Display:** Georgia, `Times New Roman`, serif. Its sturdy editorial shapes make the main card feel composed rather than app-generated.
- **Working text:** system UI (`Inter`-like native stack), kept at 16px or larger. It is fast, familiar, and needs no downloaded font.
- Dates and timezone readouts use tabular numerals. The scale is 16 / 18 / 22 / 30 / 46px, with line heights between 1.15 and 1.6.

## Spacing and shape

- Base rhythm: 4px, with primary steps at 8, 12, 16, 24, 32, 48, and 72px.
- Working measure: 68 characters. The form and preview become two purposeful columns above 900px and one ordered flow below it.
- Corners are only lightly softened (2–10px). Sheets use offset ink borders and hard shadows rather than generic floating cards.
- Every control is at least 44px high. Focus is a 3px cobalt ring with a paper offset.

## Interaction grammar

The source form is a stack of paper strips; the output is a separate composed sheet. Importing an ICS replaces form values only after a valid event is found and reports exactly what changed. Editing updates the preview immediately. Export controls live with the artifact they produce. Optional private details use explicit checkboxes and never enter QR/image output unless checked.

Primary sequence: **add details → check local times → share a format**. The empty preview still shows the next action. Status messages use a live region and stamped labels (Ready, Offline, Copied) so state never depends on color.

## Motion policy

Only state changes move. Imported fields settle by 6px over 180ms; the generated card fades and lifts by 8px over 220ms; buttons depress by 1px. Nothing loops. Under `prefers-reduced-motion: reduce`, transforms and smooth scrolling are removed and updates are instantaneous; hierarchy remains through layering, scale, and print offsets.

## Asset plan and provenance

### Hero collage

- Use case: `illustration-story`; wide landing-page illustration.
- Subject/world: two distinct blank calendar scraps crossing between a phone-like blue frame and a warm household notice board, connected by a small paper bridge; clock, location pin, and link glyphs rendered as simple cut-paper shapes.
- Materials: torn recycled paper, two-pass risograph ink, visible halftone grain, imperfect registration, deckled edges.
- Light/lens: flat editorial scan, top-down, minimal shallow paper shadows.
- Palette words: warm oatmeal paper, dense cobalt, persimmon red, mustard, pine accent, carbon ink.
- Composition: landscape, visual weight right of center with calm paper space on the left; no interface screenshot.
- Negative list: no people, hands, brands, logos, legible words, watermark, glossy 3D, gradients, photorealistic devices, malformed clocks.

Final prompt:

> Use case: illustration-story. Asset type: responsive website hero illustration. Primary request: a tactile editorial risograph collage about passing one calendar event safely between incompatible systems. Scene: two distinct blank calendar scraps cross from a simple cobalt phone-like paper frame to a warm household notice board over a small folded-paper bridge; include only simple cut-paper clock, location-pin, timezone globe, and chain-link glyphs. Style: top-down scanned paper collage, torn recycled fibers, two-pass risograph ink, halftone grain and deliberately imperfect registration. Composition: wide landscape; visual weight on the right two-thirds with calm warm-paper breathing room on the left; clear silhouettes. Palette: oatmeal, dense cobalt blue, persimmon red, mustard yellow, pine green, carbon black. Lighting: flat editorial scan with subtle physical paper shadows. Constraints: no people or hands, no brand marks, no logos, no legible text, no watermark, no glossy 3D, no gradients, no photorealistic devices, no misleading UI.

- Generator: Azure OpenAI factory image deployment via `/opt/fleet/lib/gen-image.sh`.
- Generation date: 2026-08-28.
- License/provenance: original generated asset commissioned for this product; prompt recorded above. Generated imagery is disclosed in the footer.

Authored interface icons are simple inline SVG strokes and CSS paper shapes created in-repository; no third-party icon or asset pack is used.
