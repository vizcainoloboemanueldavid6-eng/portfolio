# Publicar el portafolio: GitHub + Vercel

Guía paso a paso para subir este proyecto a GitHub y publicarlo en Vercel, con la variable
`SITE_URL` y un dominio propio. Todo se hace una sola vez; después, cada `git push` publica solo.

> Los comandos están escritos para **PowerShell** en Windows. En Git Bash funcionan igual (solo
> cambia la línea del `PATH`, ver abajo).

---

## 0. Antes de empezar

1. **Cambia los datos de ejemplo.** El sitio trae el perfil de ejemplo "Mateo Rivas". Pon tus
   datos reales en `src/config/profile.ts` (nombre, correo, enlaces de Fiverr y GitHub, precios) y
   borra los comentarios `// TODO` que ya hayas resuelto. Ver la sección 1 del `README.md`.
2. **Comprueba que todo pasa:**

   ```powershell
   cd "C:\Users\vizca\Videos\Captures\CODIGO PYTHON\portfolio"
   npm run verify
   ```

   (`astro check` → `build` → comprobaciones en el navegador → Lighthouse.)
3. **Guarda tus cambios en Git:**

   ```powershell
   git add -A
   git commit -m "chore: set my real profile data"
   git status        # debe decir: nothing to commit, working tree clean
   ```

**En este equipo** Node.js y Git son portables y no están en el `PATH`. Si PowerShell dice que no
reconoce `git`, `npm` o `node`, ejecuta primero (vale para esa ventana):

```powershell
$env:Path = "C:\Users\vizca\tools\node-v24.21.0-win-x64;C:\Users\vizca\tools\PortableGit\cmd;" + $env:Path
```

En Git Bash:

```bash
export PATH="/c/Users/vizca/tools/node-v24.21.0-win-x64:/c/Users/vizca/tools/PortableGit/cmd:$PATH"
```

---

## 1. Subir el código a GitHub

1. Entra en <https://github.com/new> y crea un repositorio:
   - **Repository name:** `portfolio`
   - **Public** o **Private** (Vercel funciona con los dos).
   - **Sin** README, **sin** `.gitignore` y **sin** licencia: el repositorio tiene que estar
     vacío, porque el proyecto ya trae todo eso.
2. En la terminal, dentro de la carpeta del proyecto (cambia `TU-USUARIO` por tu usuario de
   GitHub; si es la misma cuenta del repositorio de Bella Cucina, es
   `vizcainoloboemanueldavid6-eng`):

   ```powershell
   cd "C:\Users\vizca\Videos\Captures\CODIGO PYTHON\portfolio"
   git branch --show-current          # debe decir: main
   git remote add origin https://github.com/TU-USUARIO/portfolio.git
   git push -u origin main
   ```

   La primera vez Git abre el navegador para que inicies sesión en GitHub (Git Credential
   Manager). Acepta y el `push` continúa solo.
3. Recarga la página del repositorio en GitHub: deben aparecer las carpetas `src/`, `public/`,
   `docs/`, etc.

**Cambios posteriores:**

```powershell
git add -A
git commit -m "feat: describe el cambio"
git push
```

**Si algo sale mal:**

- `error: remote origin already exists` → corrige la dirección con
  `git remote set-url origin https://github.com/TU-USUARIO/portfolio.git`.
- `rejected ... fetch first` → el repositorio de GitHub no estaba vacío (se creó con README). Lo
  más limpio es borrarlo en GitHub (*Settings → Danger Zone → Delete this repository*), crearlo
  otra vez vacío y repetir el `git push -u origin main`.

---

## 2. Publicar en Vercel desde el panel (recomendado)

Así Vercel queda conectado a GitHub y **cada `git push` a `main` publica automáticamente**.

1. Entra en <https://vercel.com/new> e inicia sesión con **Continue with GitHub**.
2. En *Import Git Repository*, si no aparece `portfolio`, pulsa *Adjust GitHub App Permissions*
   y dale acceso a ese repositorio.
3. Pulsa **Import** junto a `portfolio`.
4. En *Configure Project* **no cambies nada**; Vercel detecta Astro solo:

   | Ajuste           | Valor                        |
   | ---------------- | ---------------------------- |
   | Framework Preset | Astro                        |
   | Root Directory   | `./`                         |
   | Build Command    | `npm run build`              |
   | Output Directory | `dist`                       |
   | Install Command  | `npm install`                |

   *Environment Variables*: puedes dejarlo vacío (ver la sección 4 para cuándo añadir
   `SITE_URL`).
5. Pulsa **Deploy**. En uno o dos minutos tendrás la dirección `https://portfolio-xxxx.vercel.app`.

La versión de Node.js no hay que tocarla: `package.json` pide `>=22.12.0` y Vercel usa la más
reciente disponible (Vercel puede mostrar un aviso informativo por ese `>=`; no es un error).

Desde ese momento:

- `git push` a `main` → despliegue de **producción**.
- `git push` a otra rama → despliegue de **vista previa** con su propia URL (no toca producción).

---

## 3. Publicar en Vercel desde la terminal (CLI)

Útil si prefieres no conectar GitHub, o para publicar una prueba rápida.

```powershell
npm i -g vercel
vercel login
cd "C:\Users\vizca\Videos\Captures\CODIGO PYTHON\portfolio"
vercel link
vercel            # despliegue de vista previa (URL de prueba)
vercel --prod     # despliegue de producción
```

Respuestas a las preguntas de `vercel link` (el texto exacto puede variar un poco según la versión
de la CLI):

| Pregunta                                   | Respuesta                                             |
| ------------------------------------------ | ----------------------------------------------------- |
| Set up "…\portfolio"?                      | `Y`                                                   |
| Which scope should contain your project?   | tu cuenta                                             |
| Link to existing project?                  | `N` la primera vez (`Y` si ya lo creaste en el panel) |
| What's your project's name?                | `portfolio`                                           |
| In which directory is your code located?   | `./`                                                  |
| Want to modify these settings?             | `N`                                                   |

`vercel link` crea una carpeta `.vercel/` (ya está en `.gitignore`). El archivo `.vercelignore`
del proyecto evita subir `dist/`, las capturas de `docs/`, los informes de Lighthouse y, sobre
todo, cualquier `.env` local: un `.env` copiado de `.env.example` tiene la dirección de ejemplo y
se impondría sobre tu dominio real.

---

## 4. `SITE_URL`: la dirección pública del sitio

Con esta dirección se construyen las URL canónicas, los enlaces `hreflang` entre idiomas,
Open Graph (la vista previa al compartir el enlace), el `sitemap`, `robots.txt` y los datos
estructurados. `astro.config.mjs` la elige en este orden:

1. `SITE_URL`, si la defines.
2. En Vercel, `VERCEL_PROJECT_PRODUCTION_URL`: el dominio de producción del proyecto que Vercel
   pasa a cada build. Es el dominio propio **más corto** que tengas, o `portfolio-xxxx.vercel.app`
   si no tienes ninguno.
3. En Netlify, la URL principal del sitio.
4. Si no hay nada de lo anterior, `https://mateobuilds.example.com`, una dirección falsa a
   propósito.

**En Vercel normalmente no hace falta definirla.** Defínela solo si:

- quieres que la dirección oficial sea `https://www.tudominio.com` (el paso 2 elegiría
  `tudominio.com`, que es más corto), o
- publicas en otro hosting que no sea Vercel ni Netlify.

**Desde el panel:** proyecto → *Settings → Environment Variables* →

- Key: `SITE_URL`
- Value: `https://tudominio.com` (con `https://`, sin barra final)
- Environments: **Production** (marca también *Preview* si quieres que las vistas previas usen la
  misma dirección)
- *Save*.

Las variables solo se aplican a los despliegues nuevos: ve a *Deployments*, abre el menú **⋯** del
último despliegue de producción y pulsa **Redeploy**.

**Desde la terminal:**

```powershell
vercel env add SITE_URL production     # pega https://tudominio.com cuando lo pida
vercel --prod                          # vuelve a publicar para aplicarla
vercel env ls                          # comprueba que está
```

**En local** (para probar un build con tu dominio), copia `.env.example` a `.env` y cambia la
línea `SITE_URL=`. El archivo `.env` no se sube a GitHub ni a Vercel.

---

## 5. Conectar un dominio propio

Primero compra el dominio en cualquier registrador (o en Vercel: *Domains → Buy*).

**Desde el panel:**

1. Proyecto → *Settings → Domains* → **Add Domain** → escribe `tudominio.com` → *Add*.
2. Vercel propone añadir también `www.tudominio.com` y redirigir uno al otro. Acepta la opción
   recomendada.
3. Vercel muestra los registros DNS que faltan. Créalos en el panel DNS de tu registrador **con
   los valores exactos que te muestra Vercel**. Normalmente son:

   | Tipo    | Nombre | Valor                                            |
   | ------- | ------ | ------------------------------------------------ |
   | `A`     | `@`    | `76.76.21.21`                                    |
   | `CNAME` | `www`  | el valor `…vercel-dns…com` que indique Vercel    |

   (Otra opción: cambiar los *nameservers* del dominio a los de Vercel, `ns1.vercel-dns.com` y
   `ns2.vercel-dns.com`, y Vercel gestiona todo el DNS.)
4. Espera a que los dos dominios aparezcan como **Valid Configuration** (de minutos a unas horas).
   El certificado HTTPS se crea solo.
5. **Vuelve a desplegar** (*Deployments → ⋯ → Redeploy*) para que el sitio use el dominio nuevo en
   sus URL. Si elegiste `www` como dirección principal, define antes `SITE_URL=https://www.tudominio.com`
   (sección 4).

**Desde la terminal** (dentro de la carpeta ya enlazada con `vercel link`):

```powershell
vercel domains add tudominio.com
vercel domains add www.tudominio.com
vercel domains inspect tudominio.com    # muestra los registros DNS que faltan y su estado
vercel --prod                           # publica de nuevo cuando el dominio esté válido
```

Cuando todo funcione, **cambia el enlace de tu perfil de Fiverr** y de tus propuestas por el
dominio nuevo.

---

## 6. Comprobar el sitio publicado

Cambia `tudominio.com` por tu dirección (o la `.vercel.app`):

```powershell
curl.exe -s https://tudominio.com/robots.txt
# → Sitemap: https://tudominio.com/sitemap-index.xml

curl.exe -s https://tudominio.com/sitemap-index.xml
# → <loc>https://tudominio.com/sitemap-0.xml</loc>

curl.exe -sI https://tudominio.com/projects/tabzen
# → HTTP/2 308 ... location: /projects/tabzen/   (redirección a la URL con barra final)

curl.exe -sI https://tudominio.com/no-existe/
# → HTTP/2 404   (la página 404 del sitio)
```

En el navegador:

- `https://tudominio.com/` y `https://tudominio.com/es/` cargan, y el selector de idioma cambia
  de uno a otro.
- *Ver código fuente* de la portada: la línea `<link rel="canonical" href="https://tudominio.com/">`
  y las `hreflang` usan tu dominio.
- `https://tudominio.com/og/en.png` y `https://tudominio.com/favicon.ico` se ven con tus iniciales.
- <https://pagespeed.web.dev/> con tu dirección, en *Móvil*: debería dar 95 o más en las cuatro
  categorías (en local mide 100).

**Si ves `mateobuilds.example.com`** en `robots.txt` o en el `canonical`: el build no recibió tu
dirección. Define `SITE_URL` (sección 4) y vuelve a desplegar.

---

## Resumen rápido

```powershell
# Una sola vez
cd "C:\Users\vizca\Videos\Captures\CODIGO PYTHON\portfolio"
git remote add origin https://github.com/TU-USUARIO/portfolio.git
git push -u origin main
# → https://vercel.com/new → Import "portfolio" → Deploy
# → Settings → Domains → Add "tudominio.com" → crear los DNS → Redeploy

# Cada cambio
git add -A
git commit -m "feat: ..."
git push
```

Para publicar en **Netlify** en lugar de Vercel, ver la sección 4 del `README.md`.
