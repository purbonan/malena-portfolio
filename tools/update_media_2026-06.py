#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
update_media_2026-06.py

Conversion puntual de material nuevo/modificado del portfolio de Malena
(junio 2026). Reutiliza los presets del pipeline original:

  Imagenes -> WebP  (poster 2000px q78, thumb 800px q80, galeria NN.webp 2000px q78)
  Videos   -> MP4 H.264 crf26 + WebM VP9 crf32, trailer 50s, max 1280px lado largo

Mejoras frente al script original:
  - Orden NATURAL de archivos ("Imagen 2" antes que "Imagen 10").
  - ImageOps.exif_transpose para respetar la orientacion de fotos de movil.
  - Galeria completa (todas las imagenes entran en 01..NN, ademas de poster/thumb).
"""
from pathlib import Path
from PIL import Image, ImageOps
import pillow_heif
import re
import subprocess
import sys

pillow_heif.register_heif_opener()

SRC_ROOT = Path(r"B:\PORFOLIO MALENA")
WEB_ROOT = Path(r"B:\PORFOLIO MALENA\malena-portfolio-web")
PROJ_ROOT = WEB_ROOT / "assets" / "img" / "projects"
TRAILERS = WEB_ROOT / "assets" / "video" / "trailers"

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".heic", ".heif"}
BG = (14, 11, 10)  # fondo calido tema Hopper Nocturno


def natkey(p: Path):
    return [int(t) if t.isdigit() else t.lower()
            for t in re.split(r"(\d+)", p.name)]


def load_image(path: Path) -> Image.Image:
    img = Image.open(path)
    img = ImageOps.exif_transpose(img)  # respeta orientacion EXIF
    if img.mode == "RGBA":
        bg = Image.new("RGB", img.size, BG)
        bg.paste(img, mask=img.split()[3])
        img = bg
    elif img.mode != "RGB":
        img = img.convert("RGB")
    return img


def resize_max(img: Image.Image, max_side: int) -> Image.Image:
    w, h = img.size
    longest = max(w, h)
    if longest <= max_side:
        return img
    scale = max_side / longest
    return img.resize((round(w * scale), round(h * scale)), Image.LANCZOS)


def save_webp(img: Image.Image, out: Path, quality: int) -> int:
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, "WEBP", quality=quality, method=6)
    return out.stat().st_size


def convert_gallery(src_dir: Path, dest_dir: Path):
    files = sorted(
        [p for p in src_dir.iterdir() if p.suffix.lower() in IMAGE_EXTS],
        key=natkey,
    )
    if not files:
        print(f"  [WARN] sin imagenes en {src_dir}")
        return
    dest_dir.mkdir(parents=True, exist_ok=True)
    for old in dest_dir.glob("*.webp"):
        old.unlink()

    print(f"\n=> {dest_dir.relative_to(PROJ_ROOT)}  ({len(files)} imagenes)")
    total = 0
    first = load_image(files[0])
    total += save_webp(resize_max(first, 2000), dest_dir / "poster.webp", 78)
    total += save_webp(resize_max(first, 800), dest_dir / "thumb.webp", 80)
    print(f"   poster.webp + thumb.webp <- {files[0].name}")
    for i, fp in enumerate(files, start=1):
        img = resize_max(load_image(fp), 2000)
        size = save_webp(img, dest_dir / f"{i:02d}.webp", 78)
        total += size
        print(f"   {i:02d}.webp <- {fp.name} ({size // 1024} KB)")
    print(f"   total: {total // 1024} KB")


def convert_portrait(src: Path, dest: Path, max_side=1600, quality=82):
    print(f"\n=> retrato {dest.relative_to(WEB_ROOT)} <- {src.name}")
    img = resize_max(load_image(src), max_side)
    size = save_webp(img, dest, quality)
    print(f"   {size // 1024} KB")


def ff(args):
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", *args],
                   check=True)


def encode_video(src: Path, slug: str, duration=50, ss=0):
    out_mp4 = TRAILERS / f"{slug}.mp4"
    out_webm = TRAILERS / f"{slug}.webm"
    TRAILERS.mkdir(parents=True, exist_ok=True)
    scale = "scale='min(1280,iw)':'-2'"
    print(f"\n=> video {slug} <- {src.name}")
    ff(["-ss", str(ss), "-i", str(src), "-t", str(duration), "-vf", scale,
        "-c:v", "libx264", "-preset", "slow", "-crf", "26",
        "-c:a", "aac", "-b:a", "96k", "-ac", "2",
        "-movflags", "+faststart", "-pix_fmt", "yuv420p", str(out_mp4)])
    print(f"   mp4:  {out_mp4.stat().st_size // 1024} KB")
    ff(["-ss", str(ss), "-i", str(src), "-t", str(duration), "-vf", scale,
        "-c:v", "libvpx-vp9", "-crf", "32", "-b:v", "0",
        "-c:a", "libopus", "-b:a", "96k", str(out_webm)])
    print(f"   webm: {out_webm.stat().st_size // 1024} KB")


GALLERIES = [
    (SRC_ROOT / "Videoclip" / "El Charro - Lemus", PROJ_ROOT / "videoclips" / "el-charro"),
    (SRC_ROOT / "CORTOS" / "Empleado 747K",        PROJ_ROOT / "cortos" / "empleado-747k"),
    (SRC_ROOT / "CORTOS" / "Arcoíris de dinero",   PROJ_ROOT / "cortos" / "arcoiris-de-dinero"),
    (SRC_ROOT / "CORTOS" / "Cita a ciegas",        PROJ_ROOT / "cortos" / "cita-a-ciegas"),
    (SRC_ROOT / "Bodegones" / "Mafia",             PROJ_ROOT / "bodegones" / "narcos"),
]

VIDEOS = [
    (SRC_ROOT / "CORTOS" / "Cita a ciegas" / "CAC . FINAL H.264.mp4", "cita-a-ciegas"),
    (SRC_ROOT / "Videoclip" / "El Charro - Lemus" / "VIDEOCLIP 1080p.mp4", "el-charro"),
    (SRC_ROOT / "Bodegones" / "Mafia" / "BODEGON MAFIA PI2 V2.MOV", "narcos"),
    (SRC_ROOT / "CONSTRUCCIÓN" / "Ascensor" / "Video final.MOV", "ascensor"),
]


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "all"

    if mode in ("all", "images"):
        for src, dest in GALLERIES:
            if not src.exists():
                print(f"  [ERROR] fuente no existe: {src}")
                continue
            convert_gallery(src, dest)
        convert_portrait(
            SRC_ROOT / "Imagen de perfil" / "WhatsApp Image 2026-06-15 at 19.21.54.jpeg",
            WEB_ROOT / "assets" / "img" / "about" / "malena.webp",
        )

    if mode in ("all", "videos"):
        for src, slug in VIDEOS:
            if not src.exists():
                print(f"  [ERROR] fuente video no existe: {src}")
                continue
            encode_video(src, slug)

    print("\nListo.")


if __name__ == "__main__":
    main()
