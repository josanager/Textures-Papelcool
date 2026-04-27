# Papelcool Texture Board Design System

This document captures the current visual language implemented in the project. Use it as the baseline for all future UI and styling decisions.

## Intent

The interface is a production workspace for arranging printable texture layouts. It should feel like a focused studio tool:

- calm
- technical
- compact
- legible
- visually restrained

The UI should support the artboards, not compete with them.

## Product character

The current UI reads as a hybrid of:

- print-production workspace
- design utility
- internal studio tool

It is not:

- a playful consumer app
- a marketing landing page
- a glossy SaaS dashboard
- a skeuomorphic editor

## Core visual structure

The layout is built from three visual zones:

1. Outer shell
   - very dark background
   - low-contrast chrome
   - creates focus around the boards

2. Toolbar
   - compact top strip
   - operational controls only
   - thin separators and muted labels

3. Workspace and boards
   - the artboards are the visual center of gravity
   - labels are lightweight metadata above each board
   - spacing is generous enough for clarity, but not luxurious

## Canonical desktop layout

The canonical desktop composition is now a two-part split:

1. Left studio column
   - persistent control area
   - character field
   - icon sampling board
   - current color control
   - template action buttons

2. Right production column
   - two A4 artboards stacked vertically
   - no side-by-side board layout on desktop

### Layout rules

- The left column is for tooling.
- The right column is for production output.
- The left column may feel dense, but it must remain tidy and sectioned.
- The right column must stay visually calmer than the left.
- The icon preview should be presented as a square work surface, not as a thumbnail widget.
- The production boards should remain larger and more visually important than the icon board.

## Design tokens in use

Current CSS variables:

- `--bg: #0e0e0e`
- `--border: #1e1e1e`
- `--text: #e0e0e0`
- `--text-dim: #666`
- `--workspace-bg: #f3efe6`
- `--accent: #a87429`

### Token interpretation

`--bg`
- nearly-black shell
- used to make the printable surfaces pop

`--border`
- subtle structural line
- should stay quiet

`--text`
- used sparingly for primary readability on dark UI

`--text-dim`
- preferred for metadata and supporting labels
- the UI leans on dim text more than bright text

`--workspace-bg`
- warm paper-like neutral
- should remain soft and natural, never clinical white

`--accent`
- reserved for primary utility emphasis
- feels craft-oriented and earthy rather than digital-neon

## Color philosophy

The palette succeeds because it separates responsibilities clearly:

- shell colors are dark and restrained
- work surfaces are bright and warm
- accent is sparse and intentional

### Rules for future colors

- New dark UI colors must stay close to charcoal, graphite, or muted black.
- New light surface colors must remain paper-like, cream, bone, or warm neutral.
- New accents should stay earthy and controlled. Good directions:
  - ochre
  - bronze
  - muted amber
  - burnt sand
- Avoid electric blues, saturated purples, neon greens, or glossy startup-style highlights unless the feature absolutely requires state signaling.

## Typography

Current stack:

- `-apple-system`
- `"SF Pro Display"`
- `"Helvetica Neue"`
- `sans-serif`

The typography is intentionally system-led and neutral.

### Type behavior

- Toolbar title:
  - 13px
  - semibold
  - uppercase
  - increased letter spacing
  - low visual weight through dim color

- Utility labels:
  - 11px to 12px
  - muted
  - compact

- Board labels:
  - title around 13px semibold
  - subtitle around 11px dim

### Typographic rules

- Keep text small and efficient.
- Use uppercase selectively for utility framing, not for everything.
- Favor semibold over bold.
- Avoid oversized headings.
- Avoid expressive or branded font substitutions unless the whole product direction changes intentionally.

## Spacing system

The interface uses a compact but breathable rhythm.

Observed key values:

- toolbar vertical padding: `12px`
- toolbar horizontal padding: `28px`
- control gap: `12px`
- divider offset: `4px`
- board gap internally: `14px`
- desktop workspace gap: `40px`
- desktop workspace padding: `40px`
- responsive workspace gap: `32px` then `24px`
- responsive workspace padding: `28px` then `16px`

### Spacing rules

- Keep controls tightly grouped.
- Give boards more breathing room than controls.
- Preserve the sense that chrome is efficient and content is spacious.
- If adding a new cluster of controls, use existing gap values first: `8px`, `12px`, `14px`, `24px`, `32px`, `40px`.

## Borders, radius, and shadow

### Radius

Current radius language is restrained:

- buttons: `6px`
- artboards: `6px`

Rule:
- Keep corners softly rounded, never pill-like.

### Borders

- thin 1px borders
- low contrast
- mostly structural

Rule:
- Borders should define zones, not call attention to themselves.

### Shadows

Current artboard shadow:

- subtle contact shadow near the surface
- deeper soft shadow below for lift

Interpretation:
- the artboard should feel like a physical working sheet sitting inside a dark studio

Rule:
- Use shadows mainly for the artboard or other important surfaces.
- Avoid dramatic blur-heavy shadows on controls.

## Component patterns

## Toolbar

Structure:

- left: project title
- right: compact utility controls

Behavior:

- horizontal alignment
- minimal height
- one divider separating utility groups

Rules:

- Keep toolbar actions operational and immediate.
- Avoid adding explanatory text blocks inside the toolbar.
- Prefer concise labels.
- New toolbar controls should visually match the reset button and color field before inventing a new component type.

## Color field

Characteristics:

- inline label plus circular color input
- lightweight and compact
- subtle hover behavior

Rules:

- Keep it tool-like, not decorative.
- Maintain the circular swatch shape for color picking if similar controls are added.

## Secondary button

Current example: reset

Characteristics:

- transparent background
- muted text
- muted border
- gentle hover fill

Use for:

- reversible
- non-destructive
- utility actions

Button rules:

- Keep secondary buttons quiet and narrow.
- Secondary buttons should not dominate a section.
- Use them for support actions such as `Cargar`, `Reset`, `Gotero`, or local clearing actions.

## Primary utility button

Current example: download PDF

Characteristics:

- transparent by default
- accent border and text
- filled accent on hover
- same geometry as other controls

Use for:

- export
- commit-style actions
- actions that conclude a workflow

Rules:

- Keep primary emphasis subtle. This project does not use loud filled CTA buttons by default.
- Primary utility buttons should appear once per action group, not repeated excessively.
- When a section has one decisive action, give that button the accent treatment and keep the surrounding controls muted.

## Studio panel

Characteristics:

- dark control surface inside the darker shell
- vertically sectioned
- compact labels
- grouped actions
- should feel like precise tooling, not admin UI

Rules:

- Use thin separators between sections instead of card-in-card clutter.
- Keep section titles small and operational.
- Prefer one strong action and one muted companion action per section.
- Do not overfill the panel with helper text.
- Keep the panel aligned to the top of the workspace.

## Icon sampling board

Characteristics:

- square 1:1 board
- same family as the production boards
- warm surface
- used for visual sampling accuracy

Rules:

- Treat it as a real mesa de trabajo.
- It should share the board language: label above, surface below.
- It may be smaller than the production boards, but not visually toy-like.
- The icon should have breathing room inside the square surface.

## Board block

Structure:

- metadata label
- artboard

Characteristics:

- vertical stack
- lightweight descriptive text
- artboard is the main visual object

Rules:

- Do not wrap boards in heavy card containers.
- The artboard itself is the card.
- Keep metadata above, not overlaid on the artboard.

## Artboard

Characteristics:

- fixed production aspect ratio `3508 / 2481`
- warm paper background
- clipped content
- isolated stacking context
- soft depth via shadow

Rules:

- Preserve aspect ratio exactly.
- Preserve `overflow: hidden`.
- Preserve `isolation: isolate` when layering is important.
- Treat the artboard as a production surface, not a generic content panel.

## Layer rendering

The visual logic of the board is exact and production-driven.

Characteristics:

- absolute positioning
- `transform-origin: top left`
- `object-fit: contain`
- coordinate-based placement
- rotation and horizontal mirroring supported

Rules:

- Do not replace precision positioning with generic layout primitives.
- Changes that affect transforms, object fitting, coordinate systems, or artboard sizing are design-critical and export-critical.

## Responsive behavior

Current responsive logic:

- desktop: two-column board layout
- below `1100px`: single column
- below `720px`: tighter outer padding

### Responsive rules

- Keep the mobile treatment simple.
- On smaller screens, reduce padding and keep the hierarchy intact.
- Do not collapse the toolbar into an overdesigned mobile nav unless there is a real need.
- The board must remain readable before chrome becomes comfortable.

## Motion and interaction

Current interaction style is restrained:

- hover transitions around `0.15s` to `0.2s`
- color and border transitions only
- no animated layout or exaggerated effects

Rules:

- If motion is added, it should be micro-feedback only.
- Avoid bounce, elastic movement, scale pops, blur reveals, or decorative entrance animations.

## Content tone

The wording in the interface is functional and direct.

Current examples:

- `Fondo`
- `Reset`
- `Descargar PDF`
- `Mesa A4 Horizontal 01`

Rules:

- Use short operational labels.
- Prefer studio or production language over consumer language.
- Avoid playful microcopy.
- Avoid long helper descriptions unless necessary.

## Visual anti-patterns

Do not introduce any of the following unless there is an explicit redesign request:

- glassmorphism
- frosted panels
- purple-on-dark product branding
- oversized rounded pills
- gradient-heavy buttons
- dashboards with many cards and widgets
- center-aligned hero layouts
- highly saturated accent color systems
- decorative icon clutter
- thick borders
- bright white backgrounds for the full app shell

## Extension guidance

When adding a new feature, follow this order:

1. Can it fit into the current toolbar language?
2. Can it be expressed with an existing button style?
3. Can it live as metadata above or beside the board instead of inside the board?
4. Can an existing token or spacing value solve it without introducing a new one?

If yes, reuse. If not, extend gently.

## Example decisions

### Adding another export action

Preferred:

- same shape as the current download button
- grouped with export controls
- accent only if it is a primary output action

Avoid:

- large filled CTA
- icon-first glossy export bar

### Adding a board option toggle

Preferred:

- compact control in toolbar or inside the left studio panel
- muted border and text unless it changes final output critically

Avoid:

- floating overlay controls on top of the artboard

### Adding a new information area

Preferred:

- concise metadata block
- dark-shell presentation with dim labels

Avoid:

- separate dashboard-style summary cards unless the product scope changes

## Implementation checklist

Before finalizing any UI change, verify:

- The artboards still dominate the page visually.
- The toolbar still feels compact.
- Accent color usage is still sparse.
- Text is still mostly in the 11px to 13px utility range.
- Corners still use restrained rounding.
- New spacing values do not dilute the current density.
- The result still feels like a production tool for print assembly.
