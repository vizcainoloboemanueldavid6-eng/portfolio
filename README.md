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
  solución, funciones, tecnologías, capturas y botones "Live demo" / "Source code". Los cinco
  proyectos enlazan ya a su versión publicada y a su repositorio; en las dos extensiones de Chrome
  el botón dice "Install (v1.0.0)" / "Instalar (v1.0.0)" porque lleva a la versión descargable en
  GitHub, no a una demo. Si un enlace todavía no existe (`#`), el botón aparece desactivado con la
  etiqueta "Coming soon".
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

Lighthouse, perfil móvil, sobre la versión de producción servida con compresión (mediana de cinco
pasadas por página, `LH_PASSES=5 npm run audit`; las tres últimas filas con `LH_URLS`):

| Página                              | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
| ----------------------------------- | ----------- | ------------- | ---------------- | --- |
| Inicio (`/`)                        | 100         | 100           | 100              | 100 |
| Inicio (`/es/`)                     | 100         | 100           | 100              | 100 |
| Caso de estudio (EN, Bella Cucina)  | 99          | 100           | 100              | 100 |
| Caso de estudio (ES, StockFlow)     | 100         | 100           | 100              | 100 |
| Caso de estudio (EN, TabZen)        | 100         | 100           | 100              | 100 |
| Caso de estudio (ES, QuickNotes)    | 99          | 100           | 100              | 100 |
| Caso de estudio (EN, StockFlow)     | 100         | 100           | 100              | 100 |

LCP ≈ 1,7–2,0 s, TBT 0–36 ms y CLS 0 en móvil simulado (Lighthouse 13.5 en Google Chrome 153,
mediana de todas las pasadas, sin descartar ninguna). Todos los casos de estudio medidos tienen
capturas reales. En otra máquina los números pueden variar unos puntos: el rendimiento depende de
lo ocupada que esté la CPU mientras se mide. Sin opciones, `npm run audit` mide el inicio en los dos
idiomas, el primer proyecto de la cuadrícula (en inglés) y el último (en español).

---

## Empezar

Necesitas **Node.js 22.19 o superior**: los scripts `placeholders` y `checks` importan archivos
`.ts` directamente (Node lo hace sin opciones desde la 22.18) y Lighthouse 13 pide la 22.19.

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
| `npm run checks`       | Más de 600 comprobaciones automáticas del sitio construido, en un navegador real |
| `npm run audit`        | Lighthouse móvil sobre 4 páginas; falla si algo baja de 95                      |
| `npm run shots`        | Capturas de pantalla a 375 y 1440 px en `docs/`                                 |
| `npm run verify`       | `check` → `build` → `checks` → `audit`, en ese orden                            |

`audit` hace de 3 a 5 pasadas por página según lo que coincidan; `LH_PASSES=5` fija cinco y
`LH_URLS=/projects/tabzen/,/es/projects/quicknotes/` mide otras páginas (en PowerShell:
`$env:LH_PASSES=5; npm run audit`).

`checks`, `audit` y `shots` necesitan antes `npm run build`. `checks` y `shots` usan el Chromium de
Playwright 1.57 (`npx playwright install chromium` la primera vez en un equipo nuevo); `audit`
usa Google Chrome instalado en el equipo (`LH_CHANNEL=chromium` para usar el de Playwright).

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
| `available`                    | `true` muestra la etiqueta "Available for new projects" y el punto verde del avatar        |
| `responseHours`, `supportDays` | Horas en que respondes y días de soporte gratuito (se usan en las preguntas frecuentes)     |
| `links.fiverr`, `links.github` | Tu perfil de Fiverr y tu perfil de GitHub                                                    |
| `services.*.fromPrice`         | Precio "desde" de cada servicio, en dólares                                                  |
| `services.*.deliveryDays`      | Plazo mínimo de entrega de cada servicio                                                     |
| `services.*.gigUrl`            | Enlace a cada gig de Fiverr (sitios web, extensiones, apps web)                              |
| `techStack`                    | Iconos de la sección de tecnologías: el *slug* de cada una en <https://simpleicons.org>      |
| `knowsAbout.en` / `.es`        | Temas que dominas, en cada idioma (solo para los datos estructurados)                       |

**Tu foto.** Guarda una imagen cuadrada de unos 400×400 px (mejor en WebP) como
`public/avatar.webp` y pon `photo: '/avatar.webp'`.

**Los enlaces de ejemplo** apuntan a la portada de Fiverr y de GitHub (no a ningún usuario real).
Mientras sigan así, el sitio no los publica en los datos estructurados. Pon tus URLs completas,
por ejemplo `https://www.fiverr.com/tu_usuario` y `https://github.com/tu-usuario`.

**Los enlaces de los proyectos no están en `profile.ts`**, sino en cada Markdown del proyecto
(`liveUrl` y `repoUrl`, sección 3). Los cinco apuntan ya a lo publicado y a sus repositorios en tu
cuenta real de GitHub (`vizcainoloboemanueldavid6-eng`): Bella Cucina, FitCoach Pro y StockFlow a
sus webs en Vercel, y TabZen y QuickNotes a su versión 1.0.0 en GitHub (el zip que se instala en
Chrome). Cuando las extensiones estén en la Chrome Web Store, cambia su `liveUrl` por la ficha de
la tienda y su `liveLabel` por algo como "Add to Chrome" / "Añadir a Chrome", en los dos idiomas. Cuando pongas tu
perfil de GitHub en `links.github`, usa **esa misma cuenta**: `npm run checks` falla si un
`repoUrl` de GitHub pertenece a otra cuenta distinta de la de tu perfil. Mientras el perfil siga
siendo el de ejemplo, la sección de contacto muestra `@mateobuilds` y los botones "Source code"
llevan a tu cuenta real: por eso no publiques el sitio sin cambiar antes el perfil.

**Los textos** (titulares, servicios, pasos del proceso, preguntas frecuentes…) están en
`src/i18n/ui.ts`, en inglés y en español. Las marcas como `{responseHours}` o `{name}` se
rellenan solas con los valores de `profile.ts`: no las borres.

Al hacer `npm run build`, el favicon y las imágenes para redes sociales se regeneran con tu nombre
e iniciales; no hay que editar ninguna imagen.

---

## 2. Reemplazar las portadas por capturas reales

Las portadas viven en `public/projects/<proyecto>/`. Los cinco proyectos tienen ya capturas
reales, sacadas de las capturas que cada proyecto guarda en su propio repositorio (las de la Chrome
Web Store en las extensiones y las de `docs/` en StockFlow). Los originales, recortados a 16:10,
están en `media/projects/`. TabZen, QuickNotes y StockFlow conservan además su portada provisional
(`cover.svg`) como reserva: si algún día quitas sus capturas, basta con volver a poner
`cover: /projects/<proyecto>/cover.svg`.

Para cambiar una portada, o poner la de un proyecto nuevo (en el ejemplo, `mi-proyecto`):

**Forma recomendada (con optimización automática):**

1. Haz una captura de la página o de la extensión, idealmente de **1440×900 px** (proporción 16:10).
   En Chrome: DevTools → icono de dispositivo → tamaño 1440×900 → menú ⋮ → *Capture screenshot*.
2. Guárdala como `media/projects/<proyecto>/cover.png` (o `.jpg`). Por ejemplo
   `media/projects/mi-proyecto/cover.png`. Si ya existía, sustitúyela.
3. Ejecuta:

   ```bash
   npm run images
   ```

   Se crean versiones AVIF y WebP en tres tamaños dentro de `public/projects/mi-proyecto/`, y el sitio
   elige la adecuada para cada pantalla.
4. En **los dos** archivos del proyecto (`src/content/projects/en/mi-proyecto.md` y
   `src/content/projects/es/mi-proyecto.md`) cambia la portada y su descripción (`coverAlt` en el
   idioma de cada archivo):

   ```yaml
   cover: /projects/mi-proyecto/cover.webp
   coverAlt: The booking page on a desktop screen, with the calendar open
   ```

5. El `cover.svg` puedes borrarlo o dejarlo como reserva (el sitio solo usa el que nombra
   `cover:`).

**Capturas adicionales** (la galería de la página del proyecto): guarda más imágenes en la misma
carpeta de `media/` (por ejemplo `calendar.png`, `mobile.png`), ejecuta `npm run images` y añádelas
en los dos idiomas:

```yaml
screenshots:
  - src: /projects/mi-proyecto/calendar.webp
    alt: The calendar view with three bookings on Tuesday
    caption: Bookings are shown by week, and a click opens one.
```

Si un proyecto no tiene `screenshots`, la sección de capturas simplemente no aparece.

**Forma rápida:** copia un `.webp` o `.png` ya preparado en `public/projects/<proyecto>/` y
ponlo en `cover:`. Funciona igual, solo que sin las versiones optimizadas por tamaño. También
puedes sobrescribir directamente un `cover.webp` que ya existía: el sitio detecta que el archivo
cambió y lo sirve tal cual en vez de las versiones optimizadas antiguas. (Ojo: si después ejecutas
`npm run images`, ese `cover.webp` se vuelve a generar desde `media/`; para conservarlo, guarda
también la captura en `media/projects/<proyecto>/cover.png`.)

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
liveLabel: Install (v1.0.0)                 # opcional: texto del botón en vez de "Live demo"
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
  npm run placeholders -- mi-proyecto "My Project" "#0EA5E9"
  ```

  La portada provisional lleva solo el nombre del proyecto sobre su color, así sirve igual para
  las páginas en inglés y en español.

- `type`, `order`, `cover`, `liveUrl` y `repoUrl` deben ser **iguales en los dos idiomas**. Si
  falta la traducción o no coinciden, `npm run build` se detiene y te dice qué corregir. Lo mismo
  si falta un campo obligatorio o está mal escrito.
- `liveLabel` es opcional y se traduce (`Install (v1.0.0)` / `Instalar (v1.0.0)`), pero si lo
  pones en un idioma tienes que ponerlo también en el otro. Úsalo cuando "Live demo" no describa
  lo que abre el botón, como una extensión que se descarga. En una extensión publicada el estado
  dice "Released" / "Publicada" en lugar de "Live" / "Publicado".
- La tarjeta, el filtro, la página del proyecto, su imagen para redes sociales, la sección de
  experiencia y el sitemap se actualizan solos.

---

## 4. Publicar en Vercel o Netlify

> **Guía completa paso a paso (GitHub + Vercel por el panel y por la terminal, `SITE_URL`,
> dominio propio y cómo comprobar el sitio publicado): [`docs/DEPLOY.es.md`](docs/DEPLOY.es.md).**
> Aquí va el resumen.

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
docs/                        capturas del sitio a 375 y 1440 px y guía de despliegue
                             (DEPLOY.es.md)
```

Las decisiones técnicas y el porqué de cada una están en [DECISIONS.md](DECISIONS.md) (en inglés).

---

## Créditos

- Tipografías **Space Grotesk** e **Inter** (SIL Open Font License), incluidas con Fontsource.
- Iconos de tecnologías de **Simple Icons** (CC0). Las marcas pertenecen a sus dueños y se usan
  solo para indicar con qué tecnologías se trabaja.
- Las capturas de los cinco proyectos salen de esos mismos proyectos del portafolio. Sus datos son
  de ejemplo: Bella Cucina y FitCoach Pro son negocios ficticios, el artículo de QuickNotes es de
  una publicación inventada y la tienda de StockFlow está generada, con nombres de producto
  genéricos y sin marcas reales.
