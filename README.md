# Portfolio · Malena Salgado Martín

Sitio web personal de **Malena Salgado Martín** — Comunicadora Audiovisual y Dirección Artística (Madrid).

URL pública: `https://[usuario].github.io/malena-portfolio/`

---

## Tecnología

Sitio estático puro: **HTML + CSS + JavaScript modules**, sin Node, sin build step.

- **Animaciones**: GSAP + ScrollTrigger (CDN), IntersectionObserver nativo.
- **Tipografía**: Google Fonts (Fraunces, Inter, JetBrains Mono).
- **Datos**: JSON en `assets/data/` (fuente única de verdad).
- **Hosting**: GitHub Pages desde la rama `main`.

Diseño: paleta "Hopper Nocturno" (cruce TFG ↔ Almodóvar ↔ cine negro).

---

## Estructura del repo

```
malena-portfolio/
├── index.html               # Single-page con secciones ancladas
├── 404.html
├── favicon.svg
├── assets/
│   ├── data/                # ⭐ Editar aquí para añadir contenido
│   │   ├── projects.json    # TODOS los proyectos
│   │   ├── about.json       # Bio, skills, formación, idiomas
│   │   └── site.json        # Contacto, TFG, meta del sitio
│   ├── img/                 # Imágenes optimizadas (WebP)
│   ├── video/               # Trailers cortos (MP4 + WebM)
│   └── docs/                # CV en PDF
├── css/
└── js/
```

---

## Cómo añadir un proyecto nuevo

1. **Crear la carpeta de imágenes** dentro de la categoría correspondiente:
   `assets/img/projects/{categoria}/{nuevo-proyecto}/`

2. **Meter las imágenes optimizadas** (formato `.webp`, máx 250 KB cada una):
   - `poster.webp` — imagen principal
   - `thumb.webp` — miniatura
   - `01.webp`, `02.webp`, ... — galería opcional

3. **Si tiene trailer**, meterlo en `assets/video/trailers/{nuevo-proyecto}.mp4` y `.webm`.

4. **Editar `assets/data/projects.json`**: duplicar un bloque existente y rellenar:
   ```json
   {
     "id": "nuevo-proyecto",
     "category": "cortos",
     "title": "Título del proyecto",
     "year": 2026,
     "order": 7,
     "role": "Dirección de Arte",
     "format": "Cortometraje",
     "synopsis": "Descripción breve.",
     "collaborators": [{ "name": "Nombre", "role": "Dirección" }],
     "poster": "assets/img/projects/cortos/nuevo-proyecto/poster.webp",
     "thumb": "assets/img/projects/cortos/nuevo-proyecto/thumb.webp",
     "gallery": [
       "assets/img/projects/cortos/nuevo-proyecto/01.webp"
     ],
     "trailer": null
   }
   ```

5. **Subir los cambios a GitHub**:
   ```bash
   git add .
   git commit -m "add: nuevo proyecto X"
   git push
   ```
   En 30-60 segundos estará live.

---

## Optimización de assets (Fase 0 — antes de usar el sitio)

### Imágenes

Las imágenes originales pesan demasiado para web. Hay que convertirlas:

**Para HEIC** (las fotos de iPhone de Construcción):
- Vista Previa de macOS → Exportar como JPG.
- O https://heictojpg.com (online, gratis, lotes de 50).
- O `magick mogrify -format jpg *.heic` (ImageMagick).

**Para WebP optimizado**:
- https://squoosh.app (web, gratis, sin registro).
- Configuración recomendada: WebP, calidad 75, máx 2000 px lado largo.
- Resultado: ~150-250 KB por imagen (frente a los 4-7 MB originales).

**Generar la miniatura `thumb.webp`** (600 × 400 aprox, ≤80 KB) para cada proyecto.

### Vídeos (trailers)

Cada vídeo original pesa entre 100 y 513 MB — imposible para GitHub Pages. Hay que crear **trailers cortos** (30-60 s) optimizados:

```bash
# 1. Recortar fragmento (ajusta -ss y -t)
ffmpeg -ss 00:00:15 -i input.mov -t 45 -c copy raw_trailer.mov

# 2. Exportar MP4 H.264 (~8 MB)
ffmpeg -i raw_trailer.mov \
  -vf "scale='min(1280,iw)':'-2'" \
  -c:v libx264 -preset slow -crf 26 \
  -c:a aac -b:a 96k -ac 2 \
  -movflags +faststart -pix_fmt yuv420p \
  output.mp4

# 3. Exportar WebM VP9 (mejor compresión, fallback moderno)
ffmpeg -i raw_trailer.mov \
  -vf "scale='min(1280,iw)':'-2'" \
  -c:v libvpx-vp9 -crf 32 -b:v 0 \
  -c:a libopus -b:a 96k \
  output.webm
```

Para el **vídeo del hero** (10-15 s, ~3-5 MB), usar `-crf 28`.

### TFG (28 MB)

No subirlo al repo. Subirlo a Google Drive público y poner los enlaces en `assets/data/site.json`:

```json
"tfg": {
  "viewerUrl": "https://drive.google.com/file/d/{ID}/view",
  "downloadUrl": "https://drive.google.com/uc?export=download&id={ID}"
}
```

---

## Desarrollo local

Como el sitio carga JSON con `fetch()`, **no funciona abriendo `index.html` directamente**. Hay que servirlo con un servidor HTTP local:

```bash
# Opción 1: Python
python -m http.server 8000

# Opción 2: Node (npx, sin instalar nada)
npx serve

# Opción 3: extensión "Live Server" en VS Code
```

Luego abrir `http://localhost:8000`.

---

## Despliegue a GitHub Pages

**Una sola vez** (configuración inicial):

1. Crear repo público en GitHub: https://github.com/new
   - Nombre: `malena-portfolio`
   - Visibilidad: Public
   - NO inicializar con README.

2. En local:
   ```bash
   git init
   git branch -M main
   git remote add origin https://github.com/{usuario}/malena-portfolio.git
   git add .
   git commit -m "feat: initial portfolio"
   git push -u origin main
   ```

3. En GitHub → Settings → Pages:
   - Source: **Deploy from a branch**
   - Branch: **main** / **(root)**
   - Save.

4. URL: `https://{usuario}.github.io/malena-portfolio/` (1-2 minutos para que esté live).

5. Marcar "Enforce HTTPS".

**Updates posteriores**: simplemente `git push`. ~30-60 s y estará live.

---

## Personalización

- **Cambiar paleta de colores**: editar `css/tokens.css` (variables `--color-*`).
- **Cambiar tipografía**: editar el `<link>` de Google Fonts en `index.html` y la variable `--font-display` / `--font-body` en `css/tokens.css`.
- **Modificar bio, skills, formación**: editar `assets/data/about.json`.
- **Cambiar contacto, redes, TFG**: editar `assets/data/site.json`.

---

## Licencia

Contenido (textos, imágenes, vídeos, TFG): © Malena Salgado Martín. Todos los derechos reservados.

Código: libre para reutilizar como referencia.
