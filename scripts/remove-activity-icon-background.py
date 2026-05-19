#!/usr/bin/env python3
"""線画アイコンの外側・穴埋め白背景を透過にする。"""
from __future__ import annotations

import os
import sys
from collections import deque

import numpy as np
from PIL import Image
from scipy.ndimage import binary_dilation, distance_transform_edt

_REMBG_SESSION = None


def ink_mask(rgb: np.ndarray, ink_max: int = 120, gray_max: int = 200, gray_sat: int = 40) -> np.ndarray:
    max_c = rgb.max(axis=2)
    min_c = rgb.min(axis=2)
    sat = max_c - min_c
    return (max_c < ink_max) | ((max_c < gray_max) & (sat < gray_sat))


def _get_rembg_session():
    global _REMBG_SESSION
    if _REMBG_SESSION is not None:
        return _REMBG_SESSION
    cache = os.environ.get('U2NET_HOME') or os.path.join(
        os.path.dirname(os.path.dirname(__file__)), '.cache', 'u2net'
    )
    os.environ['U2NET_HOME'] = cache
    from rembg import new_session

    _REMBG_SESSION = new_session('u2net')
    return _REMBG_SESSION


def _remove_via_rembg(arr: np.ndarray, *, alpha_cutoff: int = 200) -> np.ndarray:
    from rembg import remove

    src = Image.fromarray(arr, 'RGBA')
    white_bg = Image.new('RGBA', src.size, (255, 255, 255, 255))
    white_bg.paste(src, mask=src)
    matte = remove(white_bg, session=_get_rembg_session())
    alpha = matte.split()[3].point(lambda a: 255 if a >= alpha_cutoff else 0)
    out = arr.copy()
    out[..., 3] = np.array(alpha, dtype=np.uint8)
    return out


def _flood_exterior(passable: np.ndarray, alpha: np.ndarray, *, alpha_thr: int = 16) -> np.ndarray:
    h, w = passable.shape
    exterior = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()
    for y in range(h):
        for x in range(w):
            if alpha[y, x] < alpha_thr:
                exterior[y, x] = True
                q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and passable[ny, nx] and not exterior[ny, nx]:
                exterior[ny, nx] = True
                q.append((ny, nx))
    return exterior


def _interior_white_components(
    arr: np.ndarray,
    rgb: np.ndarray,
    passable: np.ndarray,
    exterior: np.ndarray,
    *,
    white_thr: int,
) -> list[list[tuple[int, int]]]:
    white = rgb.min(axis=2) >= white_thr
    interior = white & passable & ~exterior & (arr[..., 3] > 8)
    h, w = interior.shape
    visited = np.zeros((h, w), dtype=bool)
    components: list[list[tuple[int, int]]] = []

    for y in range(h):
        for x in range(w):
            if not interior[y, x] or visited[y, x]:
                continue
            q: deque[tuple[int, int]] = deque([(y, x)])
            comp: list[tuple[int, int]] = []
            while q:
                cy, cx = q.popleft()
                if visited[cy, cx] or not interior[cy, cx]:
                    continue
                visited[cy, cx] = True
                comp.append((cy, cx))
                for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                    q.append((ny, nx))
            components.append(comp)

    components.sort(key=len, reverse=True)
    return components


def _punch_interior_holes(
    arr: np.ndarray,
    rgb: np.ndarray,
    *,
    white_thr: int = 245,
    largest_min: int = 8_000,
    largest_max: int = 28_000,
    small_max: int = 10_000,
) -> None:
    """線の内側の背景白（足の間・脇など）を除去。大きな白塗り（シャツ・台座）は残す。"""
    passable = ~ink_mask(rgb)
    exterior = _flood_exterior(passable, arr[..., 3])
    components = _interior_white_components(arr, rgb, passable, exterior, white_thr=white_thr)

    if components and largest_min < len(components[0]) < largest_max:
        for cy, cx in components[0]:
            arr[cy, cx, 3] = 0

    for comp in components[1:]:
        if len(comp) < small_max:
            for cy, cx in comp:
                arr[cy, cx, 3] = 0


def _strip_distant_exterior_white(
    arr: np.ndarray,
    rgb: np.ndarray,
    *,
    white_thr: int = 245,
    min_dist: int = 8,
) -> None:
    """rembg 後に残る白い板（線から離れた外側の白）を除去。"""
    ink = ink_mask(rgb)
    dist = distance_transform_edt(~ink)
    passable = ~ink
    exterior = _flood_exterior(passable, arr[..., 3])
    white = rgb.min(axis=2) >= white_thr
    remove = exterior & white & (arr[..., 3] > 8) & (dist > min_dist)
    arr[remove, 3] = 0


def _defringe_semitransparent(
    arr: np.ndarray,
    rgb: np.ndarray,
    *,
    light_thr: int = 235,
    max_sat: int = 35,
) -> None:
    alpha = arr[..., 3]
    neutral = (rgb.min(axis=2) >= light_thr) & ((rgb.max(axis=2) - rgb.min(axis=2)) <= max_sat)
    fringe = neutral & (alpha > 0) & (alpha < 255)
    arr[fringe, 3] = 0


def _postprocess_after_flood(arr: np.ndarray, *, white_thr: int = 245) -> None:
    rgb = arr[..., :3].astype(np.int16)
    passable = ~ink_mask(rgb)
    exterior = _flood_exterior(passable, arr[..., 3])
    white = rgb.min(axis=2) >= white_thr
    arr[exterior & white & (arr[..., 3] > 8), 3] = 0
    _punch_interior_holes(arr, rgb, white_thr=white_thr)
    _defringe_semitransparent(arr, rgb)


def remove_background(
    path: str,
    *,
    use_rembg: bool = True,
    alpha_cutoff: int = 200,
    dist_min: int = 8,
    white_thr: int = 245,
) -> None:
    im = Image.open(path).convert('RGBA')
    arr = np.array(im)

    rembg_ok = False
    if use_rembg:
        try:
            arr = _remove_via_rembg(arr, alpha_cutoff=alpha_cutoff)
            rembg_ok = (arr[..., 3] == 0).sum() > 1000
        except Exception as exc:  # noqa: BLE001
            print(f'  rembg skipped ({exc}); using flood fill', file=sys.stderr)

    if rembg_ok:
        rgb = arr[..., :3].astype(np.int16)
        _punch_interior_holes(arr, rgb, white_thr=white_thr)
        _strip_distant_exterior_white(arr, rgb, white_thr=white_thr, min_dist=dist_min)
        _defringe_semitransparent(arr, rgb)
    else:
        _postprocess_after_flood(arr, white_thr=white_thr)

    Image.fromarray(arr, 'RGBA').save(path, 'PNG', optimize=True)


def main(argv: list[str]) -> int:
    if not argv:
        print('usage: remove-activity-icon-background.py <image>...', file=sys.stderr)
        return 1
    for p in argv:
        cutoff = 215 if 'strength' in p else 200
        remove_background(p, alpha_cutoff=cutoff)
        print(p)
    return 0


if __name__ == '__main__':
    raise SystemExit(main(sys.argv[1:]))
