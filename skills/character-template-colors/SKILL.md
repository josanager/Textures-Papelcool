---
name: character-template-colors
description: Extract a character palette from the character icon SVG and automatically tint the white Papelcool templates for that character. Use when the task is to colorize templates from a character name or icon, generate palette files, tint all templates or a selected subset, and always keep template-border-logo.svg untouched.
---

# Character Template Colors

Use this skill when a user wants to generate colored templates from a character icon.

The workflow in this repo is already automated. Given a character name, the bundled script can:

- locate the character icon automatically
- extract the embedded PNG palette from the icon SVG
- derive reusable palette roles
- tint the white template fills
- leave `template-border-logo.svg` unchanged
- tint all templates or only a selected subset
- write palette metadata and generated SVGs to `output/`
- export a per-character JSON with the exact hex colors used in each body part

## Default workflow

1. Read [references/workflow.md](references/workflow.md).
2. Run the generator script with the character name.
3. Review the generated `palette.json` and tinted SVG files.
4. If the user wants a narrower output, rerun with `--templates`.

## Main command

```bash
python3 skills/character-template-colors/scripts/generate_character_templates.py Rumi
```

## Selected templates only

```bash
python3 skills/character-template-colors/scripts/generate_character_templates.py Rumi \
  --templates template-head-2.svg,template-torso.svg
```

## Important rules

- Never tint `Elementos/templates/template-border-logo.svg`.
- Only replace pure white template fills.
- Do not alter black dashed guides, strokes, or non-white details.
- Prefer the bundled template map before inventing ad hoc per-file logic.
- Write generated files to `output/character-templates/<character>/` unless the user asks otherwise.
- `Elementos/Texturas/Basic-Textures/nose/Nose-default.svg` is a dependent asset, not an independent color target:
  - when it is used with `template-head-2.svg`, tint it to a color that is 25% darker than the applied `Head 2` color
  - keep this rule automatic so the nose stays visually tied to the face template
- When exporting colors from the UI, generate one `.json` file for the current character only.
- The save flow must open the native file-save dialog so the user chooses the destination manually.
- The exported JSON must include hex colors for each body part plus the derived nose color when `Head 2` is active.
- Keep a short identifier in the JSON so another AI can identify the character quickly.

## Files used by this skill

- Script: [scripts/generate_character_templates.py](scripts/generate_character_templates.py)
- Mapping: [assets/template-color-map.json](assets/template-color-map.json)
- Workflow reference: [references/workflow.md](references/workflow.md)
