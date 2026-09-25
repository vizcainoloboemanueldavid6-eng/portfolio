---
title: QuickNotes
tagline: Extensión de notas y subrayado web
summary: Subraya texto y pega notas adhesivas en cualquier web, ancladas al propio texto para que vuelvan a su sitio en tu próxima visita, con un panel lateral para buscarlo y exportarlo todo.
type: chrome-extension
stack: [Preact, TypeScript, Vite, Tailwind CSS, Chrome Extensions API, Shadow DOM, Vitest, Playwright]
liveUrl: https://github.com/vizcainoloboemanueldavid6-eng/quicknotes/releases/tag/v1.0.0 # TODO: la versión 1.0.0 (zip instalable) — cámbiala por la ficha de la Chrome Web Store cuando esté publicada
liveLabel: Instalar (v1.0.0)
repoUrl: https://github.com/vizcainoloboemanueldavid6-eng/quicknotes # TODO: el repositorio de este proyecto — en la misma cuenta de GitHub que profile.links.github
cover: /projects/quicknotes/cover.webp
coverAlt: Un artículo de ejemplo con frases subrayadas en amarillo, verde y azul, la barra de colores de QuickNotes sobre una selección y una nota adhesiva amarilla con una lista en el margen
order: 4
featured: false
problem: >-
  La investigación está repartida en decenas de páginas, y las notas sobre ella acaban en otra app
  sin ningún enlace al párrafo que importaba. Los marcadores recuerdan la dirección, pero no lo que
  subrayaste ni por qué, y un subrayado que cae sobre las palabras equivocadas cuando la página cambia
  es peor que ninguno.
solution: >-
  Una extensión Manifest V3 que dibuja su barra y sus notas dentro de un Shadow DOM cerrado, así los
  estilos de la web no pueden romperlas y sus scripts no pueden leerlas. Cada subrayado se guarda con
  el texto citado, las palabras de alrededor y una ruta XPath de respaldo, de modo que vuelve a su
  sitio al recargar aunque la página haya cambiado, y lo que no puede colocar lo lista como huérfano
  en lugar de dibujarlo donde no toca. Por defecto no tiene acceso a ninguna web hasta que la usas en
  ella; restaurar las notas automáticamente en todas las webs es un permiso opcional que puedes
  retirar.
features:
  - Barra al seleccionar texto con cuatro colores de subrayado y «Add note», también en el menú contextual; un clic en un subrayado permite cambiarle el color, añadirle una nota o borrarlo
  - Notas adhesivas que se arrastran, cambian de tamaño y se minimizan, en cuatro colores de papel, con negrita, cursiva y listas (Ctrl+B y Ctrl+I)
  - Los subrayados vuelven al recargar aunque el texto de alrededor haya cambiado; las frases repetidas se distinguen por su contexto y las perdidas se listan como huérfanas
  - Panel lateral con las notas de la página actual (un clic lleva hasta ellas) y una vista «All notes» con búsqueda de texto completo sin distinguir acentos y filtros por color y sitio
  - Exporta una página o todo a Markdown o JSON; la importación de JSON se valida entera y se fusiona sin borrar nada
  - Pausa por sitio, atajo Alt+N para una nota nueva, temas claro y oscuro e interfaz en inglés y en español; sin peticiones de red y sin analítica
screenshots:
  - src: /projects/quicknotes/side-panel.webp
    alt: El artículo de ejemplo junto al panel lateral de QuickNotes, que lista por colores los seis subrayados de la página y sus notas
    caption: El panel lateral lista todo lo de la página; un clic lleva hasta ello y lo hace parpadear.
  - src: /projects/quicknotes/all-notes.webp
    alt: El popup de QuickNotes con los contadores de la página y el botón New note, sobre la vista All notes del panel lateral buscando «reading»
    caption: «All notes» busca en todas las páginas a la vez, con filtros por color y por sitio.
---

**Permisos que siguen al usuario.** QuickNotes pide `storage`, `activeTab`, `scripting`,
`contextMenus` y `sidePanel`, así que al instalarla Chrome no avisa de que pueda «leer y cambiar todos
tus datos». Su script solo se ejecuta en la pestaña en la que actúas: el botón de la barra, el menú
contextual o Alt+N. La opción de restaurar las notas automáticamente en todas las webs pide el acceso
en tiempo de ejecución, registra el script y devuelve el permiso al desactivarla; si el permiso se
retira desde Chrome, la opción se apaga sola.

**Aislamiento en ambos sentidos.** Todo lo que dibuja QuickNotes vive en una única raíz Shadow DOM
cerrada: el CSS de la página no puede cambiarle el estilo, el suyo no se escapa y los scripts de la
página no pueden llegar a una nota, ni siquiera una etiqueta de analítica del sitio. El proyecto
incluye un artículo de demostración con CSS hostil a propósito (reglas `!important` universales,
barras ocultas, capas con el z-index máximo) para demostrarlo.

**Probada donde se podrían perder notas.** Vitest cubre la serialización y la resolución de los
anclajes (texto cambiado, citas repetidas, espacios, la ruta XPath de respaldo, huérfanos), la
normalización de URLs, el saneado de HTML, la exportación y la importación. Playwright carga la
extensión compilada y comprueba los flujos reales: subrayar, notas que vuelven al mismo sitio tras
recargar, el CSS hostil, el panel lateral, pausar un sitio y retirar el acceso, sin ningún error en
ningún contexto de la extensión.
