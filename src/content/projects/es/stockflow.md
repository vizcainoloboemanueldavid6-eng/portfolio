---
title: StockFlow
tagline: Aplicación web de gestión de inventario
summary: App web full-stack de inventario para pequeños negocios, con productos, movimientos de stock, proveedores e informes, roles comprobados en el servidor y una demo pública a un clic.
type: web-app
stack: [Next.js, TypeScript, Prisma, PostgreSQL, SQLite, Auth.js, Tailwind CSS, shadcn/ui, TanStack Table, Recharts, Zod, Vitest, Playwright]
liveUrl: https://stockflow-seven-sage.vercel.app # TODO: la demo publicada de este proyecto (ya desplegada) — cámbiala si cambia la dirección
repoUrl: https://github.com/vizcainoloboemanueldavid6-eng/stockflow # TODO: el repositorio de este proyecto — en la misma cuenta de GitHub que profile.links.github
cover: /projects/stockflow/cover.webp
coverAlt: El panel de StockFlow con tema oscuro, con las tarjetas de valor del inventario, productos, stock bajo y movimientos, una gráfica de entradas frente a salidas de 30 días y los cinco más vendidos
order: 5
featured: false
problem: >-
  Muchas tiendas pequeñas llevan su stock en una hoja de cálculo de la que nadie se fía del todo:
  las cantidades se editan a mano, no queda registro de quién cambió qué y la primera señal de que un
  artículo se acaba es un estante vacío. Los sistemas comerciales suelen ser demasiado simples para
  confiar en ellos o demasiado caros para un equipo de tres personas.
solution: >-
  Una aplicación con Next.js App Router, Server Actions y Prisma. La cantidad de un producto solo
  cambia mediante un movimiento de stock registrado, dentro de una transacción y con una única
  actualización condicional, así que nunca puede quedar por debajo de cero, ni siquiera cuando llegan
  dos ventas en el mismo instante. Cada acción comprueba el rol del usuario en el servidor, releído de
  la base de datos, en lugar de fiarse de la interfaz. Funciona con PostgreSQL, o sin ningún servicio
  de base de datos en un modo demo con SQLite, que es como funciona la demo pública: sus datos se
  reinician solos y un botón «Try the demo» en la página de inicio de sesión la abre con un clic.
features:
  - Panel con tarjetas de valor del inventario, stock bajo y movimientos de hoy, gráfica de entradas frente a salidas de 30 días, los cinco más vendidos y alertas de stock bajo con reposición en un clic
  - Tabla de productos con búsqueda, filtros, orden y paginación en el servidor guardados en la URL; alta y edición en un diálogo, archivado y restauración, y una ficha con el historial de movimientos de cada producto
  - Entradas, salidas y ajustes de stock con buscador de productos y vista previa del stock resultante, y un historial filtrable por fecha, tipo y usuario
  - Roles Admin, Staff y Demo comprobados por cada acción del servidor, con una entrada en el registro de auditoría escrita en la misma transacción que cada cambio
  - Exportación a CSV de productos y movimientos e informe de valoración del stock por categoría
  - Paleta de comandos (Ctrl+K), barra lateral plegable, temas claro y oscuro, avisos, esqueletos de carga y pantallas que funcionan hasta en un móvil de 390 px
screenshots:
  - src: /projects/stockflow/products.webp
    alt: La tabla de productos de StockFlow con tema claro, con búsqueda, filtros de categoría, proveedor y stock, etiquetas de estado, precios y paginación
    caption: Búsqueda, filtros, orden y paginación se resuelven en el servidor y quedan en la URL.
  - src: /projects/stockflow/movements.webp
    alt: El historial de movimientos con tema oscuro, con entradas, salidas y ajustes, su fecha, producto, cambio, motivo y usuario
    caption: El stock solo cambia mediante un movimiento, y cada movimiento queda registrado.
  - src: /projects/stockflow/alerts.webp
    alt: La tabla de alertas de stock bajo con tema claro, con los productos agotados o en su nivel de reposición, su proveedor y un botón Restock en cada fila
    caption: Las alertas de stock bajo empiezan por lo más vacío, cada una con reposición en un clic.
  - src: /projects/stockflow/mobile.webp
    alt: El panel de StockFlow en la pantalla de un móvil con tema claro, con las tarjetas de indicadores y la gráfica de stock
    caption: Las tablas ocultan columnas según el ancho, así que ninguna pantalla se desplaza de lado en un móvil.
---

**Un stock que no puede quedar en negativo.** Una salida es una sola sentencia, «resta n unidades
donde queden al menos n», así que decide la base de datos sobre la fila que bloquea. Dos ventas
simultáneas de las últimas unidades no pueden salir bien las dos: la segunda recibe «no hay stock
suficiente». Un test de integración fuerza ese cruce sobre PostgreSQL real, donde además una
restricción `CHECK (quantity >= 0)` respalda la regla.

**Seguridad en el servidor.** El middleware protege todas las rutas privadas, y cada acción del
servidor vuelve a comprobar el rol, así que llamar a una acción directamente, sin pasar por la
interfaz, se rechaza igual. Zod valida cada entrada en el servidor con los mismos esquemas que usan
los formularios, las contraseñas se cifran con bcrypt y el inicio de sesión tiene límite de intentos.
Mientras la demo pública está activa, las cuentas de demostración compartidas no se pueden borrar ni
cambiar de contraseña, para que ningún visitante deje fuera a los demás.

**Probada en tres niveles.** Vitest cubre las reglas de negocio, la matriz de permisos y cada acción
restringida llamada con una sesión Staff o Demo. Los tests de integración se ejecutan contra una base
de datos real. Playwright recorre cada página con cada rol en los dos temas, y reenvía la petición
exacta que manda el navegador de un administrador para borrar un producto con una sesión Staff, que
el servidor tiene que rechazar. La tienda de ejemplo es generada: 60 productos con nombres genéricos,
5 proveedores y 400 movimientos en 90 días, sin marcas reales.
