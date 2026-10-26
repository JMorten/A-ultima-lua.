#!/usr/bin/env python3
"""Gera cópias WebP/AVIF dos assets sem alterar os originais.

Uso:
    python tools/optimize-images.py
    python tools/optimize-images.py --max-width 1024 --webp-quality 82

Saída:
    assets-optimized/webp/...  (mesmos caminhos relativos, extensão .webp)
    assets-optimized/avif/...
    assets-optimized/report.csv

O jogo continua usando os PNG/JPG originais até uma migração aprovada.
"""
from __future__ import annotations

import argparse
import csv
import io
import sys
from pathlib import Path

from PIL import Image, ImageOps

SUPPORTED = {".png", ".jpg", ".jpeg"}
IMAGE_EXTS = SUPPORTED | {".webp", ".avif"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default="assets", help="pasta de origem")
    parser.add_argument("--out", default="assets-optimized", help="pasta de saída")
    parser.add_argument("--max-width", type=int, default=1024)
    parser.add_argument("--webp-quality", type=int, default=82)
    parser.add_argument("--avif-quality", type=int, default=55)
    parser.add_argument("--no-avif", action="store_true")
    return parser.parse_args()


def prepare(image: Image.Image) -> Image.Image:
    image = ImageOps.exif_transpose(image)
    if image.mode in {"RGBA", "LA"} or (image.mode == "P" and "transparency" in image.info):
        return image.convert("RGBA")
    return image.convert("RGB")


def resize(image: Image.Image, max_width: int) -> Image.Image:
    if image.width <= max_width:
        return image
    height = max(1, round(image.height * (max_width / image.width)))
    return image.resize((max_width, height), Image.Resampling.LANCZOS)


def encode(image: Image.Image, fmt: str, quality: int) -> bytes:
    buffer = io.BytesIO()
    if fmt == "WEBP":
        image.save(buffer, "WEBP", quality=quality, method=6, optimize=True)
    elif fmt == "AVIF":
        image.save(buffer, "AVIF", quality=quality, speed=6)
    else:
        raise ValueError(fmt)
    return buffer.getvalue()


def main() -> int:
    args = parse_args()
    root = Path(args.root)
    out = Path(args.out)
    if not root.is_dir():
        print(f"Pasta não encontrada: {root}", file=sys.stderr)
        return 2

    files = sorted(p for p in root.rglob("*") if p.suffix.lower() in SUPPORTED)
    if not files:
        print("Nenhuma imagem encontrada.", file=sys.stderr)
        return 1

    rows: list[dict[str, object]] = []
    total_original = 0
    total_webp = 0
    total_avif = 0

    for index, path in enumerate(files, 1):
        rel = path.relative_to(root)
        with Image.open(path) as source:
            image = resize(prepare(source), args.max_width)
            original_size = path.stat().st_size
            webp = encode(image, "WEBP", args.webp_quality)
            avif = b"" if args.no_avif else encode(image, "AVIF", args.avif_quality)

        webp_path = out / "webp" / rel.with_suffix(".webp")
        webp_path.parent.mkdir(parents=True, exist_ok=True)
        webp_path.write_bytes(webp)

        avif_size = 0
        if avif:
            avif_path = out / "avif" / rel.with_suffix(".avif")
            avif_path.parent.mkdir(parents=True, exist_ok=True)
            avif_path.write_bytes(avif)
            avif_size = len(avif)

        total_original += original_size
        total_webp += len(webp)
        total_avif += avif_size
        rows.append(
            {
                "file": str(rel).replace("\\", "/"),
                "original_kb": round(original_size / 1024, 1),
                "width": image.width,
                "height": image.height,
                "webp_kb": round(len(webp) / 1024, 1),
                "avif_kb": round(avif_size / 1024, 1) if avif_size else "",
                "webp_saving_pct": round(100 * (1 - len(webp) / original_size), 1),
                "avif_saving_pct": round(100 * (1 - avif_size / original_size), 1) if avif_size else "",
            }
        )
        print(
            f"[{index:>2}/{len(files)}] {rel}  "
            f"{original_size / 1024:.0f} KB -> webp {len(webp) / 1024:.0f} KB"
            + (f" / avif {avif_size / 1024:.0f} KB" if avif_size else "")
        )

    report = out / "report.csv"
    report.parent.mkdir(parents=True, exist_ok=True)
    with report.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)

    print("\nResumo")
    print(f"  original : {total_original / 1024 / 1024:.2f} MB")
    print(f"  webp     : {total_webp / 1024 / 1024:.2f} MB ({100 * (1 - total_webp / total_original):.1f}% menor)")
    if total_avif:
        print(f"  avif     : {total_avif / 1024 / 1024:.2f} MB ({100 * (1 - total_avif / total_original):.1f}% menor)")
    print(f"  relatório: {report}")
    print("\nNada foi alterado em assets/. A migração precisa de aprovação.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
