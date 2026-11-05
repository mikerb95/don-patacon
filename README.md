# DON PATACÓN

Sitio web de DON PATACÓN, cocina colombiana en el Centro Comercial Plaza
Central (Bogotá). Los clientes comen en las mesas comunes de la plazoleta: no
hay reservas ni eventos. Se vende para recoger, con pedido por WhatsApp, y a
domicilio solo a través de apps (Rappi, DiDi Food).

Todo el contenido vive en este repositorio y se edita desde un panel propio en
`/admin`. No depende de ningún CMS externo.

## Stack

- [Astro 7](https://astro.build) con islas de React 19
- Tailwind CSS 3
- Contenido en `content/*.json`, imágenes en `public/media/`
- Despliegue en Vercel: el sitio público es estático; solo `/admin` y
  `/api/admin` corren en servidor

## Páginas

| Ruta | Contenido |
| --- | --- |
| `/` | Inicio: presentación, carta, el lugar, especiales del día, testimonios |
| `/menu` | Carta con precios en COP (filtro por categoría con `?s=`) |
| `/pedidos` | Formulario que arma el pedido y lo abre en WhatsApp |
| `/contact` | Ubicación dentro de Plaza Central y mapa |
| `/about-us` | Nosotros |
| `/legal` | Términos (se enlaza solo si tiene secciones) |
| `/privacidad` | Política de tratamiento de datos (Ley 1581 de 2012) |
| `/admin` | Panel privado |

`/reservation` redirige a `/pedidos`, `/events` a `/` y `/seasonal-menu` a `/menu`.

Las secciones del inicio sin contenido no se muestran.

## Puesta en marcha

Requiere Node.js 22.18 o superior.

```bash
npm install
npm run admin:setup   # crea tu contraseña y tu segundo factor en .env.local
npm run dev           # sitio en :4321, panel en :4321/admin
```

En desarrollo, sin `GITHUB_TOKEN`, el panel guarda directamente en los archivos
locales.

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | `astro check` y build de producción |
| `npm test` | Pruebas de seguridad, almacenamiento, esquemas y horario |
| `npm run admin:setup` | Crea o cambia las credenciales del panel |

## Cómo funciona el panel

1. Los cambios se acumulan como borrador en el navegador. La barra inferior
   permite deshacer, descartar o publicar.
2. Al publicar, el servidor valida con `src/lib/schema.ts` y hace un commit de
   contenido en GitHub (`contenido: ...`).
3. Ese commit dispara el deploy en Vercel. El panel avisa cuando ya está en línea.
4. Antes de publicar, "Vista previa" muestra el borrador con las mismas vistas
   del sitio (`src/views/`), sin guardar nada.
5. El historial permite volver a cualquier versión anterior con un commit nuevo.

Las fotos se reducen en el navegador (WebP, máximo 1600 px) y se guardan con un
commit propio al subirlas.

Si dos sesiones editan a la vez, la segunda recibe un aviso en lugar de
sobrescribir a la primera.

## Configurar producción

En Vercel, Settings > Environment Variables:

| Variable | Valor |
| --- | --- |
| `ADMIN_PASSWORD_HASH`, `ADMIN_TOTP_SECRET`, `ADMIN_SESSION_SECRET` | Los genera `npm run admin:setup` |
| `GITHUB_TOKEN` | Fine-grained token solo de este repo, con `Contents: Read and write` |
| `GITHUB_REPO` | `mikerb95/don-patacon` |
| `GITHUB_BRANCH` | `main` (opcional) |

Además:

- El proyecto de Vercel debe estar conectado al repo, para que cada commit
  genere un deploy.
- Hay que activar "Automatically expose System Environment Variables", para que
  el panel lea `VERCEL_GIT_COMMIT_SHA` y sepa cuándo terminó el deploy.
- Conviene crear una regla de Vercel Firewall que limite `POST /admin/login`
  (por ejemplo, 10 por minuto por IP). El límite del código vive en la memoria
  de cada instancia y no basta por sí solo.

## Seguridad del panel

- Contraseña con scrypt y segundo factor TOTP; un código no sirve dos veces.
- Sesión firmada de 12 horas en cookie `HttpOnly`, `Secure` y `SameSite=Strict`.
  Cambiar `ADMIN_SESSION_SECRET` cierra todas las sesiones.
- Cada ruta exige sesión por sí misma y rechaza peticiones de otro origen.
- Todo lo que se guarda pasa por el esquema: solo enlaces http(s) y rutas de
  imagen de `/media/`. Las subidas se validan por contenido real (JPG, PNG o
  WebP; nunca SVG).
- CSP, `noindex`, `no-store` y `X-Frame-Options: DENY` en todo el panel.

## Estructura

```
content/            carta, datos del negocio y textos (JSON)
public/media/       imágenes
scripts/            admin-setup.ts
tests/              pruebas (node --test)
src/
  components/       secciones del sitio, y admin/ para el panel
  layouts/          Layout.astro (sitio), AdminLayout.astro (panel)
  lib/              schema, content, hours, maps
  lib/admin/        crypto, store (GitHub y local), config, guard
  middleware.ts     encabezados de seguridad del panel
  pages/            rutas, incluidas admin/ y api/admin/
```

Lo que falta está en [pendientes.md](./pendientes.md).
