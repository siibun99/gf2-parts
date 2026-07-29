#!/usr/bin/env python3
"""Create deployment-ready WebP copies of the GF2 doll PNG assets."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image


DEFAULT_SIZE = 768
DEFAULT_QUALITY = 84


def optimize_image(source: Path, destination: Path, size: int, quality: int) -> dict:
    if destination.exists() and destination.stat().st_size > 0:
        try:
            with Image.open(destination) as existing:
                existing.load()
                if existing.size == (size, size):
                    with Image.open(source) as original:
                        original_size = original.size
                    source_bytes = source.stat().st_size
                    output_bytes = destination.stat().st_size
                    has_alpha = (
                        existing.mode == "RGBA"
                        and existing.getextrema()[3][0] < 255
                    )
                    return {
                        "source": source.name,
                        "output": destination.name,
                        "original_dimensions": list(original_size),
                        "output_dimensions": list(existing.size),
                        "source_bytes": source_bytes,
                        "output_bytes": output_bytes,
                        "saved_percent": round(
                            (1 - output_bytes / source_bytes) * 100, 2
                        ),
                        "has_alpha": has_alpha,
                    }
        except (OSError, SyntaxError):
            pass

    with Image.open(source) as image:
        image.load()
        original_size = image.size
        rgba = image.convert("RGBA")
        rgba.thumbnail((size, size), Image.Resampling.LANCZOS, reducing_gap=3.0)

        canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        offset = ((size - rgba.width) // 2, (size - rgba.height) // 2)
        canvas.alpha_composite(rgba, offset)

        destination.parent.mkdir(parents=True, exist_ok=True)
        temporary = destination.with_suffix(".tmp.webp")
        canvas.save(
            temporary,
            format="WEBP",
            quality=quality,
            method=6,
            exact=True,
            exif=b"",
            xmp=b"",
        )
        temporary.replace(destination)

    with Image.open(destination) as result:
        result.load()
        has_alpha = result.mode == "RGBA" and result.getextrema()[3][0] < 255
        output_size = result.size

    source_bytes = source.stat().st_size
    output_bytes = destination.stat().st_size
    return {
        "source": source.name,
        "output": destination.name,
        "original_dimensions": list(original_size),
        "output_dimensions": list(output_size),
        "source_bytes": source_bytes,
        "output_bytes": output_bytes,
        "saved_percent": round((1 - output_bytes / source_bytes) * 100, 2),
        "has_alpha": has_alpha,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("source_dir", type=Path)
    parser.add_argument("output_dir", type=Path)
    parser.add_argument("--size", type=int, default=DEFAULT_SIZE)
    parser.add_argument("--quality", type=int, default=DEFAULT_QUALITY)
    parser.add_argument("--pattern", default="*.png")
    args = parser.parse_args()

    sources = sorted(args.source_dir.glob(args.pattern))
    if not sources:
        raise SystemExit(f"No files matched {args.pattern!r} in {args.source_dir}")

    results = [
        optimize_image(
            source,
            args.output_dir / f"{source.stem}.webp",
            args.size,
            args.quality,
        )
        for source in sources
    ]

    source_total = sum(item["source_bytes"] for item in results)
    output_total = sum(item["output_bytes"] for item in results)
    manifest = {
        "settings": {
            "size": args.size,
            "quality": args.quality,
            "format": "WebP",
            "preserve_alpha": True,
        },
        "count": len(results),
        "source_total_bytes": source_total,
        "output_total_bytes": output_total,
        "saved_percent": round((1 - output_total / source_total) * 100, 2),
        "files": results,
    }
    args.output_dir.mkdir(parents=True, exist_ok=True)
    (args.output_dir / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"Converted: {len(results)}")
    print(f"Source MiB: {source_total / 1024 / 1024:.2f}")
    print(f"Output MiB: {output_total / 1024 / 1024:.2f}")
    print(f"Saved: {manifest['saved_percent']:.2f}%")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
