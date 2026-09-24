---
title: FitCoach Pro
tagline: Web de empresa de 5 páginas con blog
summary: Web de cinco páginas para un entrenador personal, con planes de precios, un blog en Markdown, una página «sobre mí» que genera confianza y un formulario de contacto validado.
type: website
stack: [Next.js, TypeScript, Tailwind CSS, React, MDX, sharp]
liveUrl: https://fitcoach-pro-mu.vercel.app # TODO: la web publicada de este proyecto (ya desplegada) — cámbiala si cambia la dirección
repoUrl: https://github.com/vizcainoloboemanueldavid6-eng/fitcoach-pro # TODO: el repositorio de este proyecto — en la misma cuenta de GitHub que profile.links.github
cover: /projects/fitcoach-pro/cover.webp
coverAlt: Página de inicio de FitCoach Pro en una pantalla de escritorio, con el titular «Get stronger» en blanco y verde lima sobre fondo oscuro
order: 2
featured: true
problem: >-
  Un entrenador independiente que vende programas online y presenciales necesita más que una
  landing page: precios fáciles de comparar, una historia que genere confianza, artículos que
  atraigan tráfico desde buscadores y una forma sencilla de contactar. Y tiene que poder mantenerlo
  él mismo, sin llamar a un desarrollador cada vez que cambia un precio o tiene un artículo nuevo.
solution: >-
  Un sitio Next.js exportado como estático, con cinco páginas: Inicio, Programas, Sobre mí, Blog y
  Contacto. Los artículos son archivos MDX que el entrenador puede escribir en cualquier editor. Los
  precios viven en un solo archivo de datos, y los precios anuales, la tabla comparativa y los datos
  estructurados se calculan a partir de él, así que nunca se contradicen. El sitio es oscuro por
  defecto, con un tema claro que se aplica antes del primer pintado para que nunca parpadee.
features:
  - Tarjetas de precios con un selector mensual/anual accesible (el anual se calcula con un 20 % de descuento) y una tabla comparativa agrupada
  - Blog escrito en MDX con filtro por etiquetas, tiempo de lectura, índice automático que sigue el scroll y artículos relacionados
  - Comparador antes/después construido sobre un input range nativo, así que funciona con teclado y lector de pantalla
  - Formulario de contacto con estados de carga, éxito y error, listo para enviar a Formspree en cuanto se configure
  - Temas claro y oscuro, recordados entre visitas y aplicados antes del primer pintado
  - JSON-LD de Person, LocalBusiness, BlogPosting, FAQPage y migas de pan, además de sitemap, robots.txt y feed RSS
screenshots:
  - src: /projects/fitcoach-pro/programs.webp
    alt: Tres tarjetas de precios, Starter, Transform y Elite 1-on-1, con un selector mensual y anual encima
    caption: Planes de precios con selector mensual/anual; los precios anuales se calculan, nunca se escriben dos veces.
  - src: /projects/fitcoach-pro/blog.webp
    alt: El listado del blog con botones de filtro por etiqueta y tarjetas de artículos con foto
    caption: El blog es una carpeta de archivos MDX, con filtro por etiquetas y tiempo de lectura.
  - src: /projects/fitcoach-pro/article.webp
    alt: Una página de artículo con título, autor, tiempo de lectura y una foto grande
    caption: Cada artículo tiene índice, entradas relacionadas y su propia tarjeta Open Graph.
  - src: /projects/fitcoach-pro/mobile.webp
    alt: La página de inicio de FitCoach Pro en la pantalla de un teléfono
    caption: Todas las páginas están diseñadas primero para el móvil.
---

FitCoach Pro es un negocio ficticio, creado como pieza de portafolio. El entrenador, los
testimonios de ejemplo y las publicaciones de la franja «As featured in» son inventados, y el sitio
los señala como tales.

**Cero peticiones a terceros.** Las fuentes se alojan en el propio sitio al compilar, y no hay
analítica, ni cookies, ni banner de cookies. Cada fotografía se sirve en tres a cinco anchos WebP con
dimensiones explícitas, así que nada se mueve mientras carga la página.

**Comprobado, no supuesto.** Un script con navegador sin interfaz verifica el comportamiento del
sitio exportado (la aritmética de los precios, el tema sin parpadeo, ninguna página más ancha que la
pantalla de un móvil) y otro audita cada página con Lighthouse en modo móvil. Accesibilidad, buenas
prácticas y SEO obtienen 100 en todas las páginas.
