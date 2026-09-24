---
title: QuickNotes
tagline: Extensión de notas y subrayado web
summary: Subraya texto y pega notas adhesivas en cualquier web. Todo se guarda por página y reaparece al volver, con un panel lateral para buscarlo y exportarlo.
type: chrome-extension
stack: [Preact, TypeScript, Vite, Tailwind CSS, Chrome Extensions API, Shadow DOM, Vitest]
liveUrl: '#' # TODO: añade la URL de la Chrome Web Store cuando la extensión esté publicada
repoUrl: '#' # TODO: añade la URL del repositorio público cuando exista
cover: /projects/quicknotes/cover.svg
coverAlt: Portada de QuickNotes con el nombre del proyecto sobre fondo amarillo cálido
order: 4
featured: false
problem: >-
  La investigación está repartida en decenas de páginas, y las notas sobre ella acaban en otra app
  sin ningún enlace al párrafo que importaba. Los marcadores recuerdan la dirección, pero no lo que
  subrayaste ni por qué, y un subrayado que desaparece al recargar es peor que ninguno.
solution: >-
  Una extensión Manifest V3 que inyecta una pequeña interfaz en la página dentro de un Shadow DOM,
  así los estilos de la web no la rompen y ella no rompe la web. Los subrayados se anclan con el
  texto citado, las palabras de alrededor y una ruta XPath de respaldo, de modo que vuelven a su sitio
  al recargar aunque la página haya cambiado. Las notas se guardan en chrome.storage.local y nada sale
  nunca del navegador.
features:
  - Barra flotante al seleccionar texto con cuatro colores de subrayado y un botón «Add note», también disponible desde el menú contextual
  - Anclaje robusto que restaura los subrayados al recargar y lista como «orphaned» los que no puede colocar, en lugar de perderlos en silencio
  - Notas adhesivas que se arrastran, cambian de tamaño y se minimizan, con negrita, cursiva y listas (Ctrl+B y Ctrl+I)
  - Panel lateral con las notas de la página actual (un clic lleva hasta ellas) y una vista «All notes» con búsqueda de texto completo y filtros por color y dominio
  - Exporta una página o todo a Markdown o JSON, e importa JSON
  - Interruptor para pausar la extensión en un sitio, atajo Alt+N para una nota nueva y un content script que se inyecta solo cuando hace falta
---

**Permisos mínimos.** QuickNotes usa `storage`, `activeTab`, `scripting`, `contextMenus` y
`sidePanel`. El content script se inyecta solo cuando usas la extensión en una página, o en todas si
lo activas en las opciones, mediante permisos de host opcionales pedidos en tiempo de ejecución.

**Aislamiento en ambos sentidos.** La barra y las notas se dibujan con Preact dentro de una raíz
Shadow DOM, y el proyecto incluye un artículo de demostración para probarlo: los estilos agresivos de
la página no entran y los de la extensión no salen.

**Probado donde es frágil.** La normalización de URLs, el almacenamiento y la serialización de los
anclajes están cubiertos por tests unitarios con Vitest, porque ahí es donde un fallo haría perder
en silencio las notas de alguien.
