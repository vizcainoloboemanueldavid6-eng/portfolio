---
title: StockFlow
tagline: Aplicación web de gestión de inventario
summary: App web full-stack de inventario para pequeños negocios, con productos, movimientos de stock, proveedores e informes, acceso por roles y una cuenta demo.
type: web-app
stack: [Next.js, TypeScript, Prisma, PostgreSQL, Auth.js, Tailwind CSS, shadcn/ui, TanStack Table, Recharts, Zod, Playwright]
liveUrl: '#' # TODO: añade la URL de la demo en vivo cuando esté desplegada
repoUrl: '#' # TODO: añade la URL del repositorio público cuando exista
cover: /projects/stockflow/cover.svg
coverAlt: Portada de StockFlow con el nombre del proyecto sobre fondo azul
order: 5
featured: false
problem: >-
  Muchas tiendas pequeñas llevan su stock en una hoja de cálculo de la que nadie se fía del todo:
  las cantidades se editan a mano, no queda registro de quién cambió qué y la primera señal de que un
  artículo se acaba es un estante vacío. Los sistemas comerciales suelen ser demasiado simples para
  confiar en ellos o demasiado caros para un equipo de tres personas.
solution: >-
  Una aplicación con Next.js App Router, Server Actions, Prisma y PostgreSQL. La cantidad de un
  producto solo cambia mediante un movimiento de stock registrado dentro de una transacción, y nunca
  puede quedar por debajo de cero. Auth.js gestiona el inicio de sesión con contraseñas cifradas con
  bcrypt, y cada acción del servidor comprueba el rol del usuario en el servidor, no solo en la
  interfaz. Una cuenta demo permite probar toda la aplicación sin registrarse.
features:
  - Panel con tarjetas de indicadores, gráfica de entradas frente a salidas de los últimos 30 días, los cinco productos más vendidos y alertas de stock bajo
  - Tabla de productos con búsqueda, filtros, orden y paginación en el servidor; alta y edición en un diálogo, archivado e historial de movimientos de cada producto
  - Entradas, salidas y ajustes de stock con buscador de productos, y un historial de movimientos filtrable por fecha, tipo y usuario
  - Roles Admin, Staff y Demo aplicados por el middleware y por cada acción del servidor, con registro de auditoría de los cambios
  - Exportación a CSV de productos y movimientos e informe de valoración del stock por categoría
  - Paleta de comandos (Ctrl+K), barra lateral plegable, modo oscuro, avisos y estados de carga en todas las pantallas
---

**Datos de ejemplo realistas.** El script de siembra crea usuarios admin, staff y demo, seis
categorías, cinco proveedores, sesenta productos genéricos de electrónica y cuatrocientos movimientos
repartidos en noventa días, para que las gráficas tengan algo que contar desde el primer inicio de
sesión. Los datos de la demo se reinician con un solo comando.

**Seguridad en el servidor.** El middleware protege todas las rutas privadas, Zod valida cada
entrada en el servidor con los mismos esquemas que usan los formularios, el inicio de sesión tiene
límite de intentos y los secretos viven en variables de entorno con un `.env.example` completo.

**Probada de principio a fin.** Vitest cubre las reglas de negocio, incluidas la que impide que el
stock quede en negativo y la que prohíbe al rol Staff borrar nada. Playwright recorre los flujos
principales en un navegador real con cada rol, incluido un usuario Staff al que la aplicación no le
ofrece ninguna forma de archivar ni borrar un producto.
