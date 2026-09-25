---
title: TabZen
tagline: Extensión de Chrome para gestionar pestañas
summary: Gestor de pestañas para Chrome (Manifest V3) pensado para el teclado. Encuentra cualquier pestaña al instante, guarda ventanas como sesiones, agrupa por sitio y suspende las inactivas.
type: chrome-extension
stack: [React, TypeScript, Vite, Tailwind CSS, Chrome Extensions API, Vitest, Playwright]
liveUrl: https://github.com/vizcainoloboemanueldavid6-eng/tabzen/releases/tag/v1.0.0 # TODO: la versión 1.0.0 (zip instalable) — cámbiala por la ficha de la Chrome Web Store cuando esté publicada
liveLabel: Instalar (v1.0.0)
repoUrl: https://github.com/vizcainoloboemanueldavid6-eng/tabzen # TODO: el repositorio de este proyecto — en la misma cuenta de GitHub que profile.links.github
cover: /projects/tabzen/cover.webp
coverAlt: El popup de TabZen buscando «plan» entre las pestañas abiertas, con las letras que coinciden resaltadas en dos resultados, junto al titular «Find any tab in a keystroke»
order: 3
featured: false
problem: >-
  Cuarenta pestañas abiertas significan un navegador lento, contexto perdido y miedo a cerrar algo
  por si hace falta después. Ordenarlas no debería exigir una cuenta, un servidor de sincronización
  ni permiso para leer todas las webs que visitas: mucha confianza solo para ordenar una ventana.
solution: >-
  Una extensión Manifest V3 hecha con React, Vite y TypeScript que lo guarda todo en el
  dispositivo: sin cuenta, sin analítica y sin peticiones de red por defecto, con solo cinco
  permisos y sin acceso al contenido de ninguna página. El popup está pensado para el teclado: la
  búsqueda tiene el foco al abrir, las flechas mueven la selección, Enter salta a la pestaña y cada
  acción se alcanza con Tab. Un service worker en segundo plano suspende las pestañas inactivas con
  reglas que nunca tocan las que todavía necesitas.
features:
  - Búsqueda difusa por título y dirección entre las pestañas de todas las ventanas, con las letras que coinciden resaltadas; flechas para moverse y Enter para ir a la pestaña y a su ventana
  - Guarda una ventana como sesión con nombre y, si quieres, cierra sus pestañas; restáurala en una ventana nueva, renómbrala, expórtala a JSON o bórrala con cinco segundos para deshacer
  - Agrupa por dominio con chrome.tabGroups, con el mismo color siempre para cada sitio, y agrupado automático opcional de las pestañas nuevas
  - Suspende las pestañas inactivas tras un tiempo configurable (30 minutos por defecto), nunca la activa, las fijadas, las que reproducen audio ni los sitios de la lista de excepciones
  - Entradas en el menú contextual, atajos de teclado (Ctrl+Shift+K abre el popup, Ctrl+Shift+S guarda la ventana) y un contador de pestañas en el icono
  - Página de ajustes con tema claro, oscuro o del sistema, la lista de excepciones y copia de seguridad e importación validada de todas las sesiones en JSON; la interfaz está en inglés y en español
screenshots:
  - src: /projects/tabzen/sessions.webp
    alt: El popup de TabZen con tema oscuro mostrando sesiones guardadas, cada una con los botones Restore, Rename, Export y Delete y su lista de pestañas
    caption: Las sesiones se restauran en una ventana nueva, y una borrada se recupera con «Undo».
  - src: /projects/tabzen/options.webp
    alt: La página de ajustes de TabZen con el interruptor de suspensión automática, el tiempo de inactividad en minutos y la lista de sitios que nunca se suspenden
    caption: Reglas de suspensión y lista de excepciones, guardadas solo en el dispositivo.
---

**Cinco permisos, justificados uno a uno.** TabZen pide `tabs`, `tabGroups`, `storage`, `alarms` y
`contextMenus`, y nada más: ni `<all_urls>` ni permisos de host. Su política de privacidad explica
cada uno, y un test unitario falla si el manifiesto pide alguno más. Los iconos de las webs son lo
único que podría usar la red, así que están desactivados hasta que el usuario los activa.

**Reglas de suspensión fiables.** Chrome detiene un service worker inactivo a los 30 segundos, así
que la última vez que se usó cada pestaña se guarda en el almacenamiento de sesión y sobrevive a esos
reinicios. La decisión de qué pestañas pueden dormir es una función pura con un test para cada regla
(fijadas, con audio, activa, lista de excepciones con subdominios, edad desconocida, límites del
umbral), y un test en el navegador deja que Chrome descarte pestañas inactivas de verdad mientras las
fijadas, las que suenan y las de la lista siguen vivas.

**Probada como se usa.** Vitest cubre la lógica (búsqueda, agrupado, sesiones, validación de
importaciones), y Playwright maneja el popup real de la barra con eventos de teclado y ratón
(búsqueda, Enter, guardar, agrupar) y recorre cada página con Tab comprobando que el foco se ve en
cada parada. La versión 1.0.0 está publicada en GitHub como un zip listo para cargar en Chrome, y el
repositorio incluye el texto y las capturas preparados para la ficha de la Chrome Web Store.
