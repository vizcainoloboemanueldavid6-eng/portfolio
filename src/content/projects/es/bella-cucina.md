---
title: Bella Cucina
tagline: Landing page para restaurante
summary: Web de una sola página para un restaurante italiano, con carta por pestañas, galería de fotos y un formulario que envía la reserva directamente a WhatsApp.
type: website
stack: [Next.js, TypeScript, Tailwind CSS, React, sharp, OpenStreetMap]
liveUrl: https://bella-cucina-steel.vercel.app
repoUrl: https://github.com/vizcainoloboemanueldavid6-eng/bella-cucina
cover: /projects/bella-cucina/cover.webp
coverAlt: Página de inicio de Bella Cucina en una pantalla de escritorio, con el titular sobre el comedor del restaurante en penumbra
order: 1
featured: true
problem: >-
  Un restaurante pequeño necesita un solo lugar donde los clientes puedan leer la carta, ver el
  local y reservar mesa desde el móvil, sin instalar una app, sin crear una cuenta y sin que el
  restaurante pague una cuota mensual a una plataforma de reservas. Los atajos habituales hacen lo
  contrario: una carta en PDF ilegible en el teléfono, fotos que pesan varios megas con datos móviles
  y formularios que dejan fuera a quien navega con teclado o lector de pantalla.
solution: >-
  Una web estática de una sola página hecha con Next.js y exportada como archivos planos, así que
  el alojamiento no cuesta nada y carga rápido en el móvil. Todo lo que el dueño querría cambiar, del
  teléfono y el horario a la carta completa y las fotos, está en un archivo de configuración y dos
  archivos de datos. Las reservas no necesitan servidor: el formulario valida los datos, redacta la
  reserva y abre WhatsApp con ella, para que el restaurante la confirme en la app que ya usa.
features:
  - Carta por pestañas (antipasti, pasta, pizza, dolci, bebidas) con el patrón de pestañas WAI-ARIA, navegación con flechas y distintivos vegetariano y sin gluten
  - Galería tipo mosaico con un visor propio que atrapa el foco, se cierra con Escape, admite flechas y devuelve el foco a su sitio
  - Formulario de reserva que valida fecha, hora y comensales y abre WhatsApp con la reserva ya redactada
  - Tabla de horarios, mapa de OpenStreetMap sin clave de API y botón flotante de WhatsApp
  - Fotos WebP adaptables con variantes srcset generadas, para que un móvil descargue una portada de 64 KB en lugar del archivo de 190 KB de escritorio
  - JSON-LD de restaurante, tarjeta Open Graph, sitemap y robots.txt; animaciones que respetan prefers-reduced-motion y contenido legible sin JavaScript
screenshots:
  - src: /projects/bella-cucina/menu.webp
    alt: La sección de la carta con la pestaña Antipasti abierta, con platos, precios y distintivos dietéticos
    caption: La carta es una interfaz de pestañas real, usable solo con el teclado.
  - src: /projects/bella-cucina/gallery.webp
    alt: Galería en mosaico con fotos de pasta, pizza y del comedor sobre fondo oscuro
    caption: Galería en mosaico con columnas CSS; cada foto se abre en un visor accesible.
  - src: /projects/bella-cucina/booking.webp
    alt: El formulario de reserva con campos de nombre, teléfono, fecha, hora, comensales y notas
    caption: El formulario redacta la reserva y la envía a WhatsApp.
  - src: /projects/bella-cucina/mobile.webp
    alt: La portada de Bella Cucina en la pantalla de un teléfono
    caption: Diseñada primero para el móvil, donde la mayoría busca un restaurante.
---

Bella Cucina es un restaurante ficticio, creado como pieza de portafolio. La carta, las reseñas y
la dirección son inventadas, y la propia web lo indica en su pie de página.

**Pensada para entregarse.** No hay CMS, ni base de datos, ni servidor que mantener:
`npm run build` genera una carpeta de archivos estáticos que se puede alojar gratis en cualquier
sitio. El dueño edita un único archivo de configuración con los datos del negocio, y los datos
estructurados, el sitemap y todos los componentes salen de él.

**Accesible desde el diseño.** Semántica real en todo el sitio, foco visible siempre, un menú móvil
y un visor que atrapan el foco y se cierran con Escape, y animaciones de scroll que muestran el
estado final cuando el visitante prefiere reducir el movimiento.

**Medida.** Lighthouse móvil, mediana de cinco pasadas sobre la versión de producción:
accesibilidad 100, buenas prácticas 100, SEO 100 y rendimiento 93.
