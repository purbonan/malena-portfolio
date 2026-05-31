#!/usr/bin/env bash
# compress_videos.sh
#
# Pipeline reproducible de compresion de video para el portfolio de Malena.
# Para cada video fuente, genera un trailer de ~50s en MP4 H.264 y WebM VP9,
# escalado a max 1280px lado largo, listo para GitHub Pages.
#
# Requiere ffmpeg 8+ (instalado en Fase A via winget).
# El hero-loop se genera a partir de un fragmento de Naumaquia.
#
# Uso:
#   cd malena-portfolio-web
#   bash tools/compress_videos.sh

set -e

# Resolver ruta absoluta de ffmpeg. Si ya esta en PATH, usar el del shell.
if command -v ffmpeg >/dev/null 2>&1; then
  FFMPEG="ffmpeg"
else
  FFMPEG="/c/Users/Urbón/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin/ffmpeg.exe"
fi

echo "FFmpeg: $FFMPEG"
"$FFMPEG" -version | head -1

# Raices
SRC_ROOT="B:/PORFOLIO MALENA"
OUT_TRAILERS="assets/video/trailers"
OUT_HERO="assets/video"

mkdir -p "$OUT_TRAILERS"
mkdir -p "$OUT_HERO"

# Preset MP4 (compatibilidad universal)
encode_mp4() {
  local input="$1"
  local output="$2"
  local duration="${3:-50}"
  local ss="${4:-0}"
  "$FFMPEG" -y -hide_banner -loglevel error \
    -ss "$ss" -i "$input" -t "$duration" \
    -vf "scale='min(1280,iw)':'-2'" \
    -c:v libx264 -preset slow -crf 26 \
    -c:a aac -b:a 96k -ac 2 \
    -movflags +faststart -pix_fmt yuv420p \
    "$output"
}

# Preset WebM (mejor compresion, fallback moderno)
encode_webm() {
  local input="$1"
  local output="$2"
  local duration="${3:-50}"
  local ss="${4:-0}"
  "$FFMPEG" -y -hide_banner -loglevel error \
    -ss "$ss" -i "$input" -t "$duration" \
    -vf "scale='min(1280,iw)':'-2'" \
    -c:v libvpx-vp9 -crf 32 -b:v 0 \
    -c:a libopus -b:a 96k \
    "$output"
}

# Hero-loop (sin audio, 12s, calidad algo menor para peso minimo)
encode_hero_mp4() {
  local input="$1"
  local output="$2"
  "$FFMPEG" -y -hide_banner -loglevel error \
    -ss 00:00:05 -i "$input" -t 12 \
    -vf "scale='min(1600,iw)':'-2'" \
    -c:v libx264 -preset slow -crf 28 \
    -an \
    -movflags +faststart -pix_fmt yuv420p \
    "$output"
}

encode_hero_webm() {
  local input="$1"
  local output="$2"
  "$FFMPEG" -y -hide_banner -loglevel error \
    -ss 00:00:05 -i "$input" -t 12 \
    -vf "scale='min(1600,iw)':'-2'" \
    -c:v libvpx-vp9 -crf 34 -b:v 0 \
    -an \
    "$output"
}

# Trailer por proyecto: args = slug "path relativo al SRC_ROOT"
run_trailer() {
  local slug="$1"
  local relpath="$2"
  local input="$SRC_ROOT/$relpath"
  if [ ! -f "$input" ]; then
    echo "[SKIP] $slug: fuente no encontrada: $input"
    return
  fi
  echo
  echo "=> $slug"
  echo "   fuente: $(basename "$input")"
  local size_in=$(du -m "$input" | cut -f1)
  echo "   tamano fuente: ${size_in} MB"

  local out_mp4="$OUT_TRAILERS/${slug}.mp4"
  local out_webm="$OUT_TRAILERS/${slug}.webm"

  echo "   -> MP4 ..."
  encode_mp4 "$input" "$out_mp4" 50
  echo "   -> WebM ..."
  encode_webm "$input" "$out_webm" 50

  local size_mp4=$(du -k "$out_mp4" | cut -f1)
  local size_webm=$(du -k "$out_webm" | cut -f1)
  echo "   MP4:  ${size_mp4} KB"
  echo "   WebM: ${size_webm} KB"
}

# ========== TRAILERS ==========

run_trailer "quiero-hacerlo-bien" \
  "CORTOS/Quiero hacerlo bien/YTDown.com_YouTube_QUIERO-HACERLO-BIEN-Cortometraje-2024_Media_fdEJefiJeVA_001_1080p.mp4"

run_trailer "naumaquia" \
  "CORTOS/NAUMAQUIA/YTDown.com_YouTube_Naumaquia-Naumachia_Media_ysUPYI0C1wk_001_1080p.mp4"

run_trailer "la-verdad" \
  "CORTOS/La verdad/ec67d5a3-3119-449e-aee3-871b2ff35033.MP4"

run_trailer "cita-a-ciegas" \
  "CORTOS/Cita a ciegas/CITA A CIEGASS TERMINADO MONTAJE0.MP4"

run_trailer "farolas" \
  "Videoclip/YTDown.com_YouTube_Farolas-Tessa-Tide-LIVE-VERSION_Media_IDR6PfdrJno_001_1080p.mp4"

run_trailer "fashion-film" \
  "FashionFilm y publi/FashionFilm/5742f4b5-eec2-42bd-b7d9-0f3f1a879bf5.MP4"

run_trailer "leyes" \
  "Bodegones/Leyes/GRUPO 4-Bodegon Justicia-Leire Arregui.MP4"

run_trailer "narcos" \
  "Bodegones/Narcos/BODEGON MAFIA PI2 V2.MOV"

run_trailer "periodismo" \
  "Bodegones/Periodismo/Bodegón Periodismo Pablo Gabaldón 2.MP4"

run_trailer "psiquiatrico" \
  "Bodegones/Psiquiátrico/Fragmentada FINAL.MP4"

run_trailer "ascensor" \
  "CONSTRUCCIÓN/Ascensor/IMG_2721 2.MOV"

run_trailer "mix" \
  "CONSTRUCCIÓN/Mix/1773864671672708 2.MP4"

run_trailer "teleferico" \
  "CONSTRUCCIÓN/Teleférico/6bc9bada-4d33-4c9d-a34a-aed85bffb6b6 2.MP4"

# ========== HERO LOOP ==========

echo
echo "=> hero-loop (12s, Naumaquia, sin audio)"
HERO_SRC="$SRC_ROOT/CORTOS/NAUMAQUIA/YTDown.com_YouTube_Naumaquia-Naumachia_Media_ysUPYI0C1wk_001_1080p.mp4"
if [ -f "$HERO_SRC" ]; then
  encode_hero_mp4  "$HERO_SRC" "$OUT_HERO/hero-loop.mp4"
  encode_hero_webm "$HERO_SRC" "$OUT_HERO/hero-loop.webm"
  size_h_mp4=$(du -k "$OUT_HERO/hero-loop.mp4" | cut -f1)
  size_h_webm=$(du -k "$OUT_HERO/hero-loop.webm" | cut -f1)
  echo "   MP4:  ${size_h_mp4} KB"
  echo "   WebM: ${size_h_webm} KB"
else
  echo "[SKIP] fuente hero no encontrada: $HERO_SRC"
fi

echo
echo "Compresion completada."
echo
du -sh "$OUT_TRAILERS" "$OUT_HERO"/hero-loop.* 2>/dev/null || true
