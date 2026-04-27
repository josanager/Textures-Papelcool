---
name: papelcool-design
description: Preserve and extend the existing Papelcool Texture Board visual system. Use when adding or modifying UI, controls, artboards, labels, workspace layout, export interactions, or any visual styling in this project so the result stays consistent with the current design language.
---

# Papelcool Design

Use this skill whenever work affects the visual presentation of the Papelcool Texture Board.

This project already has a clear interface language. Do not redesign it casually. Extend it with the same visual rules, spacing rhythm, component behavior, and tone that already exist in the current UI.

## Default approach

1. Read [references/design-system.md](references/design-system.md) before changing UI.
2. Preserve the current composition first:
   - dark shell around the app
   - warm neutral artboards
   - compact utility toolbar
   - small uppercase/technical labeling
   - restrained accent usage
   - split workspace: controls on the left, production boards on the right
3. Add new controls as quiet utilities, not as hero elements.
4. Keep artboards visually dominant over chrome.
5. Reuse existing tokens and proportions before introducing new values.

## Non-negotiable rules

- Keep the app frame dark and the work surface warm/light.
- Keep the toolbar compact, horizontal, and understated.
- Keep the main desktop layout split in two:
  - left column for controls, icon sampling, and color actions
  - right column for the two production boards stacked vertically
- Keep labels small, precise, and editorial rather than marketing-like.
- Keep the board cards simple: label above, artboard below.
- Preserve the current spacing density. Do not make the interface feel bloated.
- Preserve the current button philosophy:
  - secondary actions are muted
  - primary export/download actions use the accent color
- Treat icon sampling as a real work surface:
  - show the icon inside a square 1:1 artboard, not as a tiny preview widget
- Do not introduce decorative gradients, glassmorphism, oversized shadows, rounded pill-heavy controls, or playful motion.
- Do not replace the current typographic tone with trendy product-marketing UI.

## When adding UI

- Prefer extending `.toolbar__controls`, `.board`, `.board__label`, and `.artboard` patterns.
- For control-heavy additions, prefer a left-side studio panel with internal sections instead of floating widgets around the boards.
- Match existing border radii and visual weight.
- Keep new controls aligned to the current 11px to 13px type scale.
- If a new feature needs status messaging, keep it concise and operational.
- If a panel or section is added, it should feel like studio tooling, not a dashboard.

## When changing layout

- Maintain the desktop split layout unless the task explicitly requires otherwise.
- Keep the two production artboards stacked in a single right-side column.
- Keep the icon/art sampling area on the left in its own square board.
- Preserve the existing responsive collapse to one column on narrower widths.
- Respect the artboard aspect ratio and treat it as production-critical.

## When changing colors

- Prefer existing CSS variables.
- Introduce a new variable only if the current tokens cannot express the need cleanly.
- Any new color must fit the current palette described in the reference file.

## When in doubt

- Make the smallest visual change that solves the problem.
- Bias toward calm, technical, production-tool aesthetics.
- If a proposed change feels louder than the artboards, it is probably wrong.
