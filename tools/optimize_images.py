#!/usr/bin/env python3
"""
optimize_images.py

Pipeline reproducible de optimizacion de imagenes para el portfolio de Malena.
Convierte PNG/JPG/HEIC de B:\\PORFOLIO MALENA\\{carpetas fuente} a WebP
optimizado en B:\\PORFOLIO MALENA\\malena-portfolio-web\\assets\\img\\projects\\.

Para cada proyecto, con los archivos ordenados alfabeticamente:
  - Primera imagen -> poster.webp (max 2000 px lado largo, quality 78)
  - Misma imagen   -> thumb.webp  (max 800 px lado largo,  quality 80)
  - Resto          -> 01.webp, 02.webp, ..., NN.webp

HEIC requiere pillow-heif (ya instalado).
"""
from pathlib import Path
from PIL import Image
import pillow_heif
import sys

pillow_heif.register_heif_opener()

# Raiz del material fuente
SOURCE_ROOT = Path(r"B:\PORFOLIO MALENA")

# Raiz del destino web
DEST_ROOT = Path(r"B:\PORFOLIO MALENA\malena-portfolio-web\assets\img\projects")

# Mapping: slug -> (category, carpeta fuente relativa a SOURCE_ROOT)
PROJECTS = {
    "delete":              ("cortos",       "CORTOS/DELETE"),
    "milvus-milvus":       ("cortos",       "CORTOS/Milvus Milvus"),
    "quiero-hacerlo-bien": ("cortos",       "CORTOS/Quiero hacerlo bien"),
    "naumaquia":           ("cortos",       "CORTOS/NAUMAQUIA"),
    "la-verdad":           ("cortos",       "CORTOS/La verdad"),
    "cita-a-ciegas":       ("cortos",       "CORTOS/Cita a ciegas"),
    "farolas":             ("videoclips",   "Videoclip"),
    "turnt":               ("fashion",      "FashionFilm y publi/Turnt"),
    "alexs":               ("fashion",      "FashionFilm y publi/ALEXS"),
    "fashion-film":        ("fashion",      "FashionFilm y publi/FashionFilm"),
    "leyes":               ("bodegones",    "Bodegones/Leyes"),
    "narcos":              ("bodegones",    "Bodegones/Narcos"),
    "periodismo":          ("bodegones",    "Bodegones/Periodismo"),
    "psiquiatrico":        ("bodegones",    "Bodegones/Psiquiatrico"),
    "ascensor":            ("construccion", "CONSTRUCCION/Ascensor"),
    "bar-chino":           ("construccion", "CONSTRUCCION/Bar chino"),
    "callejon":            ("construccion", "CONSTRUCCION/Callejon"),
    "mix":                 ("construccion", "CONSTRUCCION/Mix"),
    "teleferico":          ("construccion", "CONSTRUCCION/Teleferico"),
}

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".heic"}


def load_image(path: Path) -> Image.Image:
    img = Image.open(path)
    if img.mode == "RGBA":
        # Aplanar RGBA sobre fondo negro calido (tema Hopper Nocturno)
        bg = Image.new("RGB", img.size, (14, 11, 10))
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
    new_size = (int(w * scale), int(h * scale))
    return img.resize(new_size, Image.LANCZOS)


def save_webp(img: Image.Image, out: Path, quality: int) -> int:
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, "WEBP", quality=quality, method=6)
    return out.stat().st_size


def find_project_folder(rel: str) -> Path | None:
    """Resuelve una ruta relativa tolerando variaciones de acentos y mayusculas."""
    parts = rel.replace("\\", "/").split("/")
    current = SOURCE_ROOT
    for part in parts:
        if not current.exists():
            return None
        match = None
        lower = part.lower()
        lower_nodia = (lower.replace("o", "o").replace("a", "a"))
        # Primero: match exacto
        for entry in current.iterdir():
            if entry.name == part:
                match = entry
                break
        # Fallback: match case-insensitive con unicode simplificado
        if match is None:
            import unicodedata
            def norm(s: str) -> str:
                nfd = unicodedata.normalize("NFD", s)
                return "".join(c for c in nfd if unicodedata.category(c) != "Mn").lower()
            target = norm(part)
            for entry in current.iterdir():
                if norm(entry.name) == target:
                    match = entry
                    break
        if match is None:
            return None
        current = match
    return current


def process_project(slug: str, category: str, rel: str):
    src = find_project_folder(rel)
    if src is None or not src.exists():
        print(f"  [ERROR] Fuente no encontrada: {rel}")
        return

    files = sorted(
        [p for p in src.iterdir() if p.suffix.lower() in IMAGE_EXTS],
        key=lambda p: p.name.lower(),
    )

    if not files:
        print(f"  [WARN]  Sin imagenes en {src}")
        return

    dest = DEST_ROOT / category / slug
    dest.mkdir(parents=True, exist_ok=True)
    # Limpieza previa para idempotencia
    for old in dest.glob("*.webp"):
        old.unlink()

    print(f"\n=> {slug} ({category}) - {len(files)} imagenes fuente")

    total_bytes = 0

    try:
        first = load_image(files[0])
    except Exception as e:
        print(f"  [ERROR] {files[0].name}: {e}")
        return

    poster = resize_max(first, 2000)
    size = save_webp(poster, dest / "poster.webp", 78)
    total_bytes += size
    print(f"  poster.webp <- {files[0].name} ({size // 1024} KB)")

    thumb = resize_max(first, 800)
    size = save_webp(thumb, dest / "thumb.webp", 80)
    total_bytes += size
    print(f"  thumb.webp  <- {files[0].name} ({size // 1024} KB)")

    for i, fp in enumerate(files[1:], start=1):
        try:
            img = load_image(fp)
        except Exception as e:
            print(f"  [ERROR] {fp.name}: {e}")
            continue
        img = resize_max(img, 2000)
        size = save_webp(img, dest / f"{i:02d}.webp", 78)
        total_bytes += size
        print(f"  {i:02d}.webp       <- {fp.name} ({size // 1024} KB)")

    print(f"  Total: {total_bytes // 1024} KB")


def main():
    if not SOURCE_ROOT.exists():
        print(f"SOURCE_ROOT no existe: {SOURCE_ROOT}", file=sys.stderr)
        sys.exit(1)

    DEST_ROOT.mkdir(parents=True, exist_ok=True)

    for slug, (category, rel) in PROJECTS.items():
        process_project(slug, category, rel)

    print("\nOptimizacion completada.")


if __name__ == "__main__":
    main()
