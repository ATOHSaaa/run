#!/usr/bin/env python3
"""白背景を透過し、渡された3枚をそのまま PNG で書き出す。"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = Path('/Users/atohs/.cursor/projects/Users-atohs-run/assets')
OUT_DIR = ROOT / 'public/images/gears-icons'

WHITE_THRESH = 248

SOURCES = [
    ('apparel', ASSETS / 'ChatGPT_Image_2026_5_18__14_58_00-32ae70b4-04cd-41b1-8f9e-61568b09287d.png'),
    ('gadgets', ASSETS / 'ChatGPT_Image_2026_5_18__14_58_04-d5739649-17e1-40d5-9416-47c4f2b612ef.png'),
    ('footwear', ASSETS / 'ChatGPT_Image_2026_5_18__14_58_07-8a2e41d5-6160-41ef-b169-5ff37a0e3352.png'),
]


def remove_white(img: Image.Image) -> Image.Image:
    rgba = img.convert('RGBA')
    px = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r >= WHITE_THRESH and g >= WHITE_THRESH and b >= WHITE_THRESH:
                px[x, y] = (r, g, b, 0)
            else:
                px[x, y] = (r, g, b, 255)
    return rgba


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest: list[str] = []

    for name, path in SOURCES:
        out_name = f'{name}.png'
        img = remove_white(Image.open(path))
        img.save(OUT_DIR / out_name, optimize=True)
        manifest.append(out_name)
        print(f'wrote {out_name} {img.size}')

    for stale in OUT_DIR.glob('*-[0-9].png'):
        stale.unlink()
        print(f'removed {stale.name}')

    print('manifest:', manifest)


if __name__ == '__main__':
    main()
