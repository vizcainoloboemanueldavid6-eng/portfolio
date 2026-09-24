---
title: TabZen
tagline: Extensión de Chrome para gestionar pestañas
summary: Extensión de Chrome Manifest V3 que pone orden en el caos de pestañas con búsqueda difusa, sesiones guardadas, agrupado por dominio y suspensión de pestañas inactivas.
type: chrome-extension
stack: [React, TypeScript, Vite, Tailwind CSS, Chrome Extensions API, Vitest]
liveUrl: '#' # TODO: añade la URL de la Chrome Web Store cuando la extensión esté publicada
repoUrl: '#' # TODO: añade la URL del repositorio público cuando exista
cover: /projects/tabzen/cover.svg
coverAlt: Portada de TabZen con el nombre del proyecto sobre fondo índigo
order: 3
featured: false
problem: >-
  Cuarenta pestañas abiertas significan un navegador lento, contexto perdido y miedo a cerrar algo
  por si hace falta después. La mayoría de gestores de pestañas piden una cuenta, sincronizan tu
  historial con sus propios servidores o piden permiso para leer todas las webs que visitas: mucha
  confianza solo para ordenar una ventana.
solution: >-
  Una extensión Manifest V3 hecha con React, Vite y TypeScript que lo guarda todo en el
  dispositivo: cero peticiones de red, cero analítica y solo cinco permisos, ninguno de acceso a
  webs. El popup está pensado para el teclado, con búsqueda con foco automático, flechas para moverse
  y Enter para saltar a la pestaña, mientras un service worker en segundo plano se encarga de
  suspender pestañas inactivas, del menú contextual y de los atajos.
features:
  - Búsqueda difusa entre las pestañas abiertas por título y URL, resaltando coincidencias; flechas para moverse y Enter para cambiar de pestaña
  - Guarda una ventana como sesión con nombre y, si quieres, ciérrala; restáurala en una ventana nueva, renómbrala, expórtala a JSON o bórrala con cinco segundos para deshacer
  - Agrupa por dominio con chrome.tabGroups, con un color y una etiqueta para cada dominio
  - Suspende automáticamente las pestañas inactivas tras un tiempo configurable, respetando las fijadas, las que reproducen audio y la lista blanca
  - Entradas en el menú contextual, atajos de teclado (Ctrl+Shift+K abre el popup, Ctrl+Shift+S guarda la sesión) y un contador de pestañas en el icono
  - Página de opciones con tema claro, oscuro o del sistema, lista blanca de dominios e importación y exportación validada de todas las sesiones en JSON
---

**Permisos justificados uno a uno.** TabZen pide `tabs`, `tabGroups`, `storage`, `alarms` y
`contextMenus`, y nada más: ni `<all_urls>` ni permisos de host. Cada uno se explica en la política
de privacidad que acompaña a la extensión.

**Lógica que se puede probar.** Agrupar, buscar y serializar sesiones son funciones puras,
separadas de las llamadas a `chrome.*`, así que están cubiertas por tests unitarios con Vitest,
incluidas las reglas que impiden suspender pestañas fijadas, con audio o de sitios en la lista
blanca.

**Lista para la Chrome Web Store.** La interfaz está en inglés con `_locales` preparado para
español, y el proyecto incluye los textos de la ficha de la tienda, capturas de 1280×800, una imagen
promocional y un script `npm run zip` que empaqueta la versión.
