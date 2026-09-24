# Portafolio de desarrollador freelance

Sitio portafolio bilingüe (inglés en `/`, español en `/es/`) para un desarrollador que vende en
Fiverr: presentación, servicios con precios, los cinco proyectos con su caso de estudio, proceso de
trabajo, tecnologías, preguntas frecuentes y contacto. Es el enlace que va en el perfil de Fiverr
y en las propuestas.

Hecho con **Astro 7**, **TypeScript** (modo estricto) y **Tailwind CSS 4**. Es un sitio estático:
`npm run build` genera una carpeta `dist/` que se puede alojar gratis en Vercel, Netlify o
cualquier hosting de archivos.

> **Importante:** el sitio viene relleno con un **perfil de ejemplo, "Mateo Rivas"**
> (`mateobuilds`, `hello@example.com`). Antes de publicarlo cambia esos datos por los tuyos: están
> todos en un solo archivo, `src/config/profile.ts` (sección 1).

| Escritorio (1440 px)                     | Móvil (375 px)                         |
| ---------------------------------------- | -------------------------------------- |
| ![Inicio en escritorio](docs/home-1440.jpg) | ![Inicio en móvil](docs/home-375.jpg) |

Más capturas en [`docs/`](docs/): inicio en español, un caso de estudio en cada idioma y la
página 404, a 375 y 1440 px.

---

## Qué incluye

- **Inicio de una sola página**: hero con foto (o iniciales generadas si no hay foto), 3 servicios
  con precio "desde $X" y botón a cada gig, cuadrícula de proyectos con filtro por tipo, proceso en
  4 pasos, tecnologías con iconos, experiencia (solo tus proyectos, marcados como "proyecto
  personal"), 6 preguntas frecuentes y contacto.
- **Una página por proyecto** (`/projects/<slug>/` y `/es/projects/<slug>/`): portada, problema,
  solución, funciones, tecnologías, capturas y botones "Live demo" / "Source code". Si un enlace
  todavía no existe (`#`), el botón aparece desactivado con la etiqueta "Coming soon".
- **Selector de idioma** que lleva a la misma página en el otro idioma.
- **Diseño oscuro** con fondo animado suave, tarjetas que se elevan y muestran las tecnologías al
  pasar el ratón, y transiciones entre páginas. Todo el movimiento se desactiva si el visitante
  tiene activado "reducir movimiento".
- **SEO completo**: título, descripción, URL canónica, Open Graph y Twitter en cada página;
  imágenes para redes sociales generadas automáticamente (una por idioma y por proyecto); datos
  estructurados `Person`; `sitemap`, `robots.txt`, `hreflang` entre idiomas y favicon con tus
  iniciales.
- **Sin formulario de contacto a propósito**: las normas de Fiverr piden no sacar pedidos ni pagos
  de la plataforma, así que el botón principal siempre lleva a Fiverr. El correo y GitHub quedan
  como contacto secundario.
- Sin cookies, sin analítica y sin peticiones a terceros (las fuentes van incluidas en el sitio).

### Resultados medidos

Lighthouse, perfil móvil, sobre la versión de producción servida con compresión (mediana de
varias pasadas por página, `npm run audit`):

| Página                        | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
| ----------------------------- | ----------- | ------------- | ---------------- | --- |
| Inicio (`/`)                  | 100         | 100           | 100              | 100 |
| Inicio (`/es/`)               | 100         | 100           | 100              | 100 |
| Caso de estudio (EN)          | 100         | 100           | 100              | 100 |
| Caso de estudio (ES)          | 100         | 100           | 100              | 100 |

LCP ≈ 1,7–1,9 s, TBT 0 ms y CLS 0 en móvil simulado (Lighthouse 13.5 en Google Chrome, mediana de
todas las pasadas, sin descartar ninguna). En otra máquina los números pueden variar
unos puntos: el rendimiento depende de lo ocupada que esté la CPU mientras se mide.

---

## Empezar

Necesitas **Node.js 22.12 o superior**.

```bash
npm install
npm run dev
```

Abre <http://localhost:4330>. Los cambios se ven al guardar.

| Comando                | Qué hace                                                                        |
| ---------------------- | ------------------------------------------------------------------------------- |
| `npm run dev`          | Servidor de desarrollo en el puerto 4330                                        |
| `npm run build`        | Genera el sitio final en `dist/`                                                |
| `npm run preview`      | Sirve `dist/` en <http://localhost:4332> (como lo serviría el hosting)          |
| `npm run check`        | Comprobación de tipos de Astro/TypeScript                                       |
| `npm run images`       | Optimiza las capturas de `media/projects/` hacia `public/projects/`             |
| `npm run placeholders` | Genera portadas provisionales en SVG                                            |
| `npm run checks`       | Más de 300 comprobaciones automáticas del sitio construido, en un navegador real |
| `npm run audit`        | Lighthouse móvil sobre 4 páginas; falla si algo baja de 95                      |
| `npm run shots`        | Capturas de pantalla a 375 y 1440 px en `docs/`                                 |
| `npm run verify`       | `check` → `build` → `checks` → `audit`, en ese orden                            |

`checks`, `audit` y `shots` necesitan antes `npm run build` y el navegador de Playwright
(`npx playwright install chromium` la primera vez).

---

## 1. Cambiar tus datos personales (`src/config/profile.ts`)

**Todos** tus datos salen de este archivo: el hero, los precios, los enlaces, el pie de página,
los datos estructurados, el favicon y las imágenes para redes sociales. Cada campo lleva el
comentario `// TODO: replace with your real data`; cámbialos todos y borra el comentario.

| Campo                          | Qué es                                                                                       |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| `name`, `firstName`            | Tu nombre completo y el que aparece en "Hi, I'm …"                                           |
| `username`                     | Tu usuario (se muestra como `@usuario`)                                                      |
| `jobTitle.en` / `jobTitle.es`  | Tu titular profesional en cada idioma                                                        |
| `email`                        | Correo de contacto                                                                           |
| `photo`                        | Ruta de tu foto dentro de `public/`, p. ej. `'/avatar.webp'`. Vacío = círculo con iniciales  |
| `initials`                     | Dos letras para el favicon, el logo y el avatar provisional                                  |
| `available`                    | `true` muestra la etiqueta "Available for new projects"                                     |
| `responseHours`, `supportDays` | Horas en que respondes y días de soporte gratuito (se usan en las preguntas frecuentes)     |
| `links.fiverr`, `links.github` | Tu perfil de Fiverr y tu perfil de GitHub                                                    |
| `services.*.fromPrice`         | Precio "desde" de cada servicio, en dólares                                                  |
| `services.*.deliveryDays`      | Plazo mínimo de entrega de cada servicio                                                     |
| `services.*.gigUrl`            | Enlace a cada gig de Fiverr (sitios web, extensiones, apps web)                              |
| `techStack`                    | Iconos de la sección de tecnologías: el *slug* de cada una en <https://simpleicons.org>      |
| `knowsAbout`                   | Temas que dominas (solo para los datos estructurados)                                       |

**Tu foto.** Guarda una imagen cuadrada de unos 400×400 px (mejor en WebP) como
`public/avatar.webp` y pon `photo: '/avatar.webp'`.

**Los enlaces de ejemplo** apuntan a la portada de Fiverr y de GitHub (no a ningún usuario real).
Mientras sigan así, el sitio no los publica en los datos estructurados. Pon tus URLs completas,
por ejemplo `https://www.fiverr.com/tu_usuario` y `https://github.com/tu-usuario`.

**Los textos** (titulares, servicios, pasos del proceso, preguntas frecuentes…) están en
`src/i18n/ui.ts`, en inglés y en español. Las marcas como `{responseHours}` o `{name}` se
rellenan solas con los valores de `profile.ts`: no las borres.

Al hacer `npm run build`, el favicon y las imágenes para redes sociales se regeneran con tu nombre
e iniciales; no hay que editar ninguna imagen.

---

## 2. Reemplazar las portadas por capturas reales

Las portadas viven en `public/projects/<proyecto>/`. Bella Cucina y FitCoach Pro ya tienen
capturas reales; TabZen, QuickNotes y StockFlow tienen una portada provisional (`cover.svg`) hasta
que pongas las suyas.

**Forma recomendada (con optimización automática):**

1. Haz una captura de la página o de la extensión, idealmente de **1440×900 px** (proporción 16:10).
   En Chrome: DevTools → icono de dispositivo → tamaño 1440×900 → menú ⋮ → *Capture screenshot*.
2. Guárdala como `media/projects/<proyecto>/cover.png` (o `.jpg`). Por ejemplo
   `media/projects/tabzen/cover.png`.
3. Ejecuta:

   ```bash
   npm run images
   ```

   Se crean versiones AVIF y WebP en tres tamaños dentro de `public/projects/tabzen/`, y el sitio
   elige la adecuada para cada pantalla.
4. En **los dos** archivos del proyecto (`src/content/projects/en/tabzen.md` y
   `src/content/projects/es/tabzen.md`) cambia la portada y su descripción:

   ```yaml
   cover: /projects/tabzen/cover.webp
   coverAlt: The TabZen popup listing open tabs, with the search box at the top
   ```

5. Borra el `cover.svg` que ya no se usa.

**Capturas adicionales** (la galería de la página del proyecto): guarda más imágenes en la misma
carpeta de `media/` (por ejemplo `popup.png`, `options.png`), ejecuta `npm run images` y añádelas
en los dos idiomas:

```yaml
screenshots:
  - src: /projects/tabzen/popup.webp
    alt: The popup with the search box and the list of open tabs
    caption: Keyboard-first search across every open tab.
```

Si un proyecto no tiene `screenshots`, la sección de capturas simplemente no aparece.

**Forma rápida:** copia un `.webp` o `.png` ya preparado en `public/projects/<proyecto>/` y
ponlo en `cover:`. Funciona igual, solo que sin las versiones optimizadas por tamaño.

---

## 3. Añadir un proyecto nuevo

Cada proyecto son **dos archivos Markdown**, uno por idioma, con el mismo nombre (que será su URL):

```
src/content/projects/en/mi-proyecto.md   →  /projects/mi-proyecto/
src/content/projects/es/mi-proyecto.md   →  /es/projects/mi-proyecto/
```

Copia uno existente y cambia los campos:

```yaml
---
title: My Project
tagline: Booking web app                    # etiqueta corta bajo el título
summary: One or two sentences for the card and the meta description (40–200 characters).
type: web-app                               # website | chrome-extension | web-app
stack: [Next.js, TypeScript, Tailwind CSS]  # los iconos se añaden solos si existen
liveUrl: '#' # TODO: add the live URL       # URL completa https://…, o '#' = "Coming soon"
repoUrl: '#' # TODO: add the repository URL
cover: /projects/mi-proyecto/cover.svg
coverAlt: What the cover image shows
order: 6                                    # posición en la cuadrícula
featured: false                             # true = tarjeta grande (media fila en escritorio)
problem: >-
  The problem the project solves.
solution: >-
  How you solved it.
features:                                   # mínimo 3
  - First feature
  - Second feature
  - Third feature
screenshots: []                             # opcional (ver sección 2)
---

Optional Markdown: appears as "Behind the build" on the project page.
```

- Para una portada provisional mientras no tengas captura:

  ```bash
  npm run placeholders -- mi-proyecto "My Project" "Booking web app" "#0EA5E9"
  ```

- `type`, `order`, `cover`, `liveUrl` y `repoUrl` deben ser **iguales en los dos idiomas**. Si
  falta la traducción o no coinciden, `npm run build` se detiene y te dice qué corregir. Lo mismo
  si falta un campo obligatorio o está mal escrito.
- La tarjeta, el filtro, la página del proyecto, su imagen para redes sociales, la sección de
  experiencia y el sitemap se actualizan solos.

---

## 4. Publicar en Vercel o Netlify

El sitio es estático, y el repositorio ya incluye la configuración de los dos servicios
(`vercel.json` y `netlify.toml`: comando de build, caché larga para los archivos de `/_astro/` y,
en Vercel, redirección a las URLs con barra final).

Primero súbelo a GitHub (crea antes un repositorio **vacío**, sin README, en
<https://github.com/new>):

```bash
git remote add origin https://github.com/TU-USUARIO/portfolio.git
git push -u origin main
```

### Vercel

**Desde la web:** <https://vercel.com/new> → importa el repositorio → Vercel detecta Astro
(comando `npm run build`, carpeta `dist`) → *Deploy*. Cada `git push` vuelve a publicar.

**Desde la terminal:**

```bash
npm i -g vercel
vercel login
vercel --prod
```

En Vercel **no hace falta configurar `SITE_URL`**: el build usa automáticamente el dominio de
producción del proyecto (`VERCEL_PROJECT_PRODUCTION_URL`), también cuando añadas un dominio propio.

### Netlify

**Desde la web:** <https://app.netlify.com> → *Add new site* → *Import an existing project* →
elige el repositorio. Comando de build `npm run build`, carpeta de publicación `dist`.

**Desde la terminal:**

```bash
npm i -g netlify-cli
netlify login
netlify init        # build: npm run build · publish: dist
netlify deploy --prod
```

Netlify también pasa su URL al build, pero es mejor fijarla: *Site configuration → Environment
variables →* `SITE_URL` = `https://tu-sitio.netlify.app` (o tu dominio).

### `SITE_URL`: la dirección pública del sitio

Con ella se construyen las URL canónicas, `hreflang`, Open Graph, el sitemap, `robots.txt` y los
datos estructurados. Si no se define (y no estás en Vercel ni Netlify), se usa
`https://mateobuilds.example.com`, una dirección falsa a propósito. Para definirla en local copia
`.env.example` a `.env`:

```bash
SITE_URL=https://tudominio.com
```

---

## 5. Conectar un dominio propio

**En Vercel:** proyecto → *Settings → Domains* → escribe `tudominio.com` → *Add*. Vercel te
muestra los registros DNS que debes crear en tu proveedor de dominio (normalmente un registro `A`
para `tudominio.com` y un `CNAME` para `www`). Cuando el dominio aparezca como válido, vuelve a
desplegar (*Deployments → Redeploy*) para que las URLs del sitio usen el dominio nuevo.

**En Netlify:** *Domain management → Add a domain* → sigue las instrucciones de DNS (o usa
Netlify DNS). Después cambia la variable `SITE_URL` a `https://tudominio.com` y vuelve a
desplegar.

**Comprueba** después de publicar que `https://tudominio.com/robots.txt` y
`https://tudominio.com/sitemap-index.xml` muestran tu dominio. Si ves `mateobuilds.example.com`,
falta configurar `SITE_URL`.

---

## Estructura

```
src/
  config/profile.ts          tus datos (todo lo personal está aquí)
  i18n/ui.ts                 todos los textos, en inglés y español
  i18n/utils.ts              rutas por idioma y formato
  content/projects/en|es/    un Markdown por proyecto e idioma
  content.config.ts          esquema (Zod) que valida esos Markdown
  components/                cabecera, pie, selector de idioma, tarjetas…
  components/home/           las secciones del inicio
  layouts/BaseLayout.astro   <head>, SEO, fuentes y transiciones
  lib/                       proyectos, imágenes, iconos, datos estructurados,
                             imágenes generadas (Open Graph y favicon)
  pages/                     /, /es/, /projects/[slug], /es/projects/[slug], 404,
                             og/*.png, favicon, robots.txt, manifest
  styles/global.css          colores, tipografía y componentes base
media/projects/              capturas originales (entrada de `npm run images`)
public/projects/             portadas y capturas optimizadas que sirve el sitio
scripts/                     imágenes, portadas provisionales, capturas,
                             comprobaciones y Lighthouse
docs/                        capturas del sitio a 375 y 1440 px
```

Las decisiones técnicas y el porqué de cada una están en [DECISIONS.md](DECISIONS.md) (en inglés).

---

## Créditos

- Tipografías **Space Grotesk** e **Inter** (SIL Open Font License), incluidas con Fontsource.
- Iconos de tecnologías de **Simple Icons** (CC0). Las marcas pertenecen a sus dueños y se usan
  solo para indicar con qué tecnologías se trabaja.
- Las capturas de Bella Cucina y FitCoach Pro son de esos mismos proyectos del portafolio.
