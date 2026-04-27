#!/usr/bin/env python3

from __future__ import annotations

import argparse
import base64
import colorsys
import json
import re
import shutil
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable
from xml.etree import ElementTree as ET

from PIL import Image


SCRIPT_DIR = Path(__file__).resolve().parent
SKILL_DIR = SCRIPT_DIR.parent
REPO_ROOT = SKILL_DIR.parent.parent
DEFAULT_TEMPLATES_DIR = REPO_ROOT / "Elementos" / "templates"
DEFAULT_TEXTURES_DIR = REPO_ROOT / "Elementos" / "Texturas"
DEFAULT_OUTPUT_ROOT = REPO_ROOT / "output" / "character-templates"
DEFAULT_MAP_PATH = SKILL_DIR / "assets" / "template-color-map.json"
EXCLUDED_TEMPLATE = "template-border-logo.svg"

WHITE_FILL_PATTERN = re.compile(
    r'(style="[^"]*?\bfill\s*:\s*)(#fff(?:fff)?)([^"]*?")|(fill=")(#fff(?:fff)?)(\")',
    flags=re.IGNORECASE,
)


@dataclass
class Swatch:
    hex: str
    count: int
    saturation: float
    brightness: float


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate colored Papelcool templates from a character icon."
    )
    parser.add_argument("character", help="Character name, for example Rumi or Zoey.")
    parser.add_argument(
        "--templates",
        help="Comma-separated template filenames. Defaults to all templates.",
    )
    parser.add_argument(
        "--templates-dir",
        type=Path,
        default=DEFAULT_TEMPLATES_DIR,
        help="Source templates directory.",
    )
    parser.add_argument(
        "--textures-dir",
        type=Path,
        default=DEFAULT_TEXTURES_DIR,
        help="Root textures directory used to find the icon.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        help="Explicit output directory. Defaults to output/character-templates/<character>/",
    )
    parser.add_argument(
        "--map",
        dest="map_path",
        type=Path,
        default=DEFAULT_MAP_PATH,
        help="Template-to-role mapping JSON file.",
    )
    parser.add_argument(
        "--palette-size",
        type=int,
        default=8,
        help="Maximum number of extracted base swatches before role selection.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    character_slug = slugify(args.character)
    output_dir = args.output_dir or (DEFAULT_OUTPUT_ROOT / character_slug)
    selected_templates = parse_template_selection(args.templates)
    template_map = json.loads(args.map_path.read_text())

    icon_path = find_character_icon(args.character, args.textures_dir)
    png_bytes = extract_embedded_png(icon_path)
    icon_image = Image.open(BytesReader(png_bytes)).convert("RGBA")

    swatches = extract_swatches(icon_image, palette_size=args.palette_size)
    roles = build_palette_roles(swatches)

    output_dir.mkdir(parents=True, exist_ok=True)
    write_palette_preview(output_dir / "palette-preview.svg", roles, swatches, args.character)

    manifest: dict[str, object] = {
        "character": args.character,
        "character_slug": character_slug,
        "icon": str(icon_path.relative_to(REPO_ROOT)),
        "templates": [],
        "palette_roles": roles,
        "swatches": [swatch.__dict__ for swatch in swatches],
    }

    for template_path in sorted(args.templates_dir.glob("*.svg")):
        if selected_templates and template_path.name not in selected_templates:
            continue

        destination = output_dir / template_path.name
        if template_path.name == EXCLUDED_TEMPLATE:
            shutil.copyfile(template_path, destination)
            manifest["templates"].append(
                {
                    "template": template_path.name,
                    "output": str(destination.relative_to(REPO_ROOT)),
                    "tinted": False,
                    "reason": "excluded",
                }
            )
            continue

        source_text = template_path.read_text()
        role_order = template_map.get(template_path.name, ["primary"])
        tinted_text, replacements = tint_svg_text(source_text, roles, role_order)
        destination.write_text(tinted_text)

        manifest["templates"].append(
            {
                "template": template_path.name,
                "output": str(destination.relative_to(REPO_ROOT)),
                "tinted": bool(replacements),
                "fills_replaced": replacements,
                "role_order": role_order,
            }
        )

    (output_dir / "palette.json").write_text(
        json.dumps(
            {
                "character": args.character,
                "icon": str(icon_path.relative_to(REPO_ROOT)),
                "roles": roles,
                "swatches": [swatch.__dict__ for swatch in swatches],
            },
            indent=2,
        )
    )
    (output_dir / "manifest.json").write_text(json.dumps(manifest, indent=2))

    print(f"Generated templates for {args.character} in {output_dir}")


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def parse_template_selection(value: str | None) -> set[str]:
    if not value:
        return set()
    return {item.strip() for item in value.split(",") if item.strip()}


def find_character_icon(character: str, textures_dir: Path) -> Path:
    normalized = slugify(character)
    for icon_path in sorted(textures_dir.rglob("*-icon.svg")):
        stem_normalized = slugify(icon_path.stem.replace("-icon", ""))
        parent_normalized = slugify(icon_path.parent.name)
        if normalized in {stem_normalized, parent_normalized}:
            return icon_path
    raise FileNotFoundError(f"Could not find icon SVG for character '{character}'.")


def extract_embedded_png(svg_path: Path) -> bytes:
    text = svg_path.read_text()
    match = re.search(r"data:image/png;base64,([A-Za-z0-9+/=\n\r]+)", text)
    if not match:
        raise ValueError(f"No embedded PNG found in {svg_path}")
    return base64.b64decode(match.group(1))


def extract_swatches(image: Image.Image, palette_size: int = 8) -> list[Swatch]:
    working = image.copy()
    working.thumbnail((256, 256))
    pixels = [rgba[:3] for rgba in working.getdata() if rgba[3] >= 32]
    if not pixels:
        raise ValueError("No visible pixels found in icon.")

    sample = Image.new("RGB", (len(pixels), 1))
    sample.putdata(pixels)
    quantized = sample.quantize(colors=max(palette_size * 3, 12), method=Image.Quantize.MEDIANCUT)
    palette = quantized.getpalette()[: 256 * 3]
    counts = quantized.getcolors()
    if not counts:
        raise ValueError("Palette extraction failed.")

    swatches: list[Swatch] = []
    for count, palette_index in sorted(counts, reverse=True):
        rgb = tuple(palette[palette_index * 3 : palette_index * 3 + 3])
        if is_too_transient(rgb):
            continue
        if any(color_distance(rgb, hex_to_rgb(existing.hex)) < 18 for existing in swatches):
            continue
        saturation, brightness = saturation_brightness(rgb)
        swatches.append(
            Swatch(
                hex=rgb_to_hex(rgb),
                count=count,
                saturation=round(saturation, 4),
                brightness=round(brightness, 4),
            )
        )
        if len(swatches) >= palette_size:
            break

    if not swatches:
        raise ValueError("No usable swatches found after filtering.")
    return swatches


def is_too_transient(rgb: tuple[int, int, int]) -> bool:
    return max(rgb) >= 252 and min(rgb) >= 252


def saturation_brightness(rgb: tuple[int, int, int]) -> tuple[float, float]:
    r, g, b = [channel / 255 for channel in rgb]
    _, saturation, brightness = colorsys.rgb_to_hsv(r, g, b)
    return saturation, brightness


def build_palette_roles(swatches: list[Swatch]) -> dict[str, str]:
    colored = [sw for sw in swatches if sw.saturation >= 0.18]
    neutrals = [sw for sw in swatches if sw.saturation < 0.18]

    primary = pick_distinct(colored or swatches, [])
    secondary = pick_distinct(colored or swatches, [primary.hex])
    accent = pick_distinct(sorted(colored or swatches, key=lambda sw: (sw.brightness, sw.saturation, sw.count), reverse=True), [primary.hex, secondary.hex])
    dark_source = pick_distinct(sorted(swatches, key=lambda sw: (sw.brightness, -sw.saturation, -sw.count)), [primary.hex, secondary.hex])
    light_source = pick_distinct(
        sorted(
            [sw for sw in swatches if sw.brightness < 0.98],
            key=lambda sw: (sw.brightness, sw.count),
            reverse=True,
        ),
        [primary.hex, secondary.hex, accent.hex],
    )
    neutral_source = pick_distinct(neutrals or swatches, [primary.hex, secondary.hex, accent.hex])

    roles = {
        "primary": primary.hex,
        "secondary": secondary.hex,
        "accent": accent.hex,
        "dark": dark_source.hex,
        "light": light_source.hex if light_source else lighten(primary.hex, 0.42),
        "shadow": darken(dark_source.hex, 0.18),
        "neutral": neutral_source.hex if neutral_source else lighten(primary.hex, 0.55),
    }
    return roles


def pick_distinct(swatches: Iterable[Swatch], used_hexes: list[str]) -> Swatch:
    used_rgbs = [hex_to_rgb(value) for value in used_hexes]
    candidates = list(swatches)
    if not candidates:
      raise ValueError("No swatches available for role assignment.")
    for swatch in candidates:
        if all(color_distance(hex_to_rgb(swatch.hex), used_rgb) >= 32 for used_rgb in used_rgbs):
            return swatch
    return candidates[0]


def tint_svg_text(svg_text: str, roles: dict[str, str], role_order: list[str]) -> tuple[str, int]:
    role_cycle = role_order or ["primary"]
    replacement_index = 0

    def repl(match: re.Match[str]) -> str:
        nonlocal replacement_index
        color_key = role_cycle[min(replacement_index, len(role_cycle) - 1)]
        color_value = roles.get(color_key, roles["primary"])
        replacement_index += 1

        if match.group(1):
            return f"{match.group(1)}{color_value}{match.group(3)}"
        return f'{match.group(4)}{color_value}{match.group(6)}'

    tinted = WHITE_FILL_PATTERN.sub(repl, svg_text)
    return tinted, replacement_index


def write_palette_preview(path: Path, roles: dict[str, str], swatches: list[Swatch], character: str) -> None:
    role_names = ["primary", "secondary", "accent", "light", "dark", "shadow", "neutral"]
    width = 980
    swatch_width = 120
    role_blocks = []
    for index, role in enumerate(role_names):
        x = 32 + index * 134
        role_blocks.append(
            f'<rect x="{x}" y="96" width="{swatch_width}" height="96" rx="12" fill="{roles[role]}"/>'
            f'<text x="{x}" y="222" fill="#222" font-size="18" font-family="Helvetica, Arial, sans-serif">{role}</text>'
            f'<text x="{x}" y="246" fill="#555" font-size="16" font-family="Helvetica, Arial, sans-serif">{roles[role]}</text>'
        )

    source_blocks = []
    for index, swatch in enumerate(swatches):
        x = 32 + (index % 6) * 150
        y = 310 + (index // 6) * 92
        source_blocks.append(
            f'<rect x="{x}" y="{y}" width="110" height="54" rx="10" fill="{swatch.hex}"/>'
            f'<text x="{x}" y="{y + 74}" fill="#555" font-size="14" font-family="Helvetica, Arial, sans-serif">{swatch.hex}</text>'
        )

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="520" viewBox="0 0 {width} 520">
  <rect width="{width}" height="520" fill="#f5f0e7"/>
  <text x="32" y="48" fill="#111" font-size="28" font-family="Helvetica, Arial, sans-serif">{character} template palette</text>
  <text x="32" y="76" fill="#666" font-size="18" font-family="Helvetica, Arial, sans-serif">Derived automatically from the embedded icon image</text>
  {''.join(role_blocks)}
  <text x="32" y="286" fill="#111" font-size="22" font-family="Helvetica, Arial, sans-serif">Extracted swatches</text>
  {''.join(source_blocks)}
</svg>
"""
    path.write_text(svg)


def rgb_to_hex(rgb: tuple[int, int, int]) -> str:
    return "#{:02x}{:02x}{:02x}".format(*rgb)


def hex_to_rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return int(value[0:2], 16), int(value[2:4], 16), int(value[4:6], 16)


def color_distance(a: tuple[int, int, int], b: tuple[int, int, int]) -> float:
    return sum((component_a - component_b) ** 2 for component_a, component_b in zip(a, b)) ** 0.5


def lighten(color: str, amount: float) -> str:
    r, g, b = [channel / 255 for channel in hex_to_rgb(color)]
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    l = min(1.0, l + amount * (1 - l))
    nr, ng, nb = colorsys.hls_to_rgb(h, l, s)
    return rgb_to_hex((round(nr * 255), round(ng * 255), round(nb * 255)))


def darken(color: str, amount: float) -> str:
    r, g, b = [channel / 255 for channel in hex_to_rgb(color)]
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    l = max(0.0, l * (1 - amount))
    nr, ng, nb = colorsys.hls_to_rgb(h, l, s)
    return rgb_to_hex((round(nr * 255), round(ng * 255), round(nb * 255)))


class BytesReader:
    def __init__(self, data: bytes) -> None:
        self._data = data
        self._offset = 0

    def read(self, size: int = -1) -> bytes:
        if size < 0:
            size = len(self._data) - self._offset
        chunk = self._data[self._offset : self._offset + size]
        self._offset += size
        return chunk

    def seek(self, offset: int, whence: int = 0) -> int:
        if whence == 0:
            self._offset = offset
        elif whence == 1:
            self._offset += offset
        elif whence == 2:
            self._offset = len(self._data) + offset
        return self._offset

    def tell(self) -> int:
        return self._offset


if __name__ == "__main__":
    main()
