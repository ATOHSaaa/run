#!/usr/bin/env python3
"""runner-accent.png から走りループ用の横長スプライトシートを生成する。"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'public/images/runner-accent.png'
OUT = ROOT / 'public/images/gears-icons/runner-sprite.png'
FRAME_COUNT = 4

# 各フレームの (dx, dy) — 軽い上下・前進で走っているように見せる
OFFSETS = [(0, 0), (5, -7), (10, -3), (15, -8)]


def main() -> None:
    im = Image.open(SRC).convert('RGBA')
    w, h = im.size
    sheet = Image.new('RGBA', (w * FRAME_COUNT, h), (0, 0, 0, 0))

    for i, (dx, dy) in enumerate(OFFSETS):
        frame = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        frame.paste(im, (dx, dy), im)
        sheet.paste(frame, (i * w, 0), frame)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(OUT, optimize=True)
    print(f'wrote {OUT} ({sheet.size[0]}x{sheet.size[1]}, {FRAME_COUNT} frames)')


if __name__ == '__main__':
    main()
