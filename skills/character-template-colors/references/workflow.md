# Character Template Color Workflow

This skill automates a repeated production task: take a character icon and tint the white Papelcool templates with that character's palette.

## Source assumptions

- Character icons live under `Elementos/Texturas/.../<Character>/<Character>-icon.svg`
- Those icon SVGs embed a PNG image
- The templates to tint live in `Elementos/templates/`
- `template-border-logo.svg` is excluded from tinting

## What the script does

1. Finds the icon SVG for the character.
2. Extracts the embedded PNG from the icon.
3. Samples dominant visible colors from the icon image.
4. Derives stable palette roles:
   - `primary`
   - `secondary`
   - `accent`
   - `light`
   - `dark`
   - `shadow`
5. Applies those roles to template white fills using the bundled map.
6. Writes:
   - tinted SVG templates
   - `palette.json`
   - `manifest.json`
   - `palette-preview.svg`
7. From the UI, it can also export one JSON file for the current character:
   - the user chooses the destination from the native save dialog
   - the file stores only that character
   - it includes the current hex color of each body part
   - it also includes the derived nose color when `Head 2` is being used

## Template behavior

- Tinting only replaces pure white fills such as `fill:#fff` and `fill:#ffffff`.
- Stroke-only guides and dashed black details remain untouched.
- Empty or transparent templates such as `template-textures-layer.svg` are passed through unchanged.
- `Nose-default.svg` follows a fixed dependency rule:
  - if the active face setup uses `template-head-2.svg`, the nose color must be derived from `Head 2`
  - the nose should render at 25% darker than the applied `Head 2` tint
  - this should be handled automatically rather than picked separately

## Output location

Default output:

- `output/character-templates/<character-slug>/`

## Exported JSON format

The exported file is intended for another AI to inspect later.

Store:

- `character`
- `short_name`
- `saved_at`
- `colors_hex` with one entry per body part
- `templates` with template source + label + applied hex color
- `dependent_assets` for derived assets such as the nose from `Head 2`

## Review checklist

- Verify `template-border-logo.svg` stayed unchanged.
- Verify the palette roles look plausible for the character.
- Verify the generated templates exist for all expected source files.
- If a user only wants part of the set, rerun with `--templates`.

## Typical command

```bash
python3 skills/character-template-colors/scripts/generate_character_templates.py Rumi
```

## Selected output example

```bash
python3 skills/character-template-colors/scripts/generate_character_templates.py Zoey \
  --templates template-head-1.svg,template-head-2.svg,template-torso.svg
```
