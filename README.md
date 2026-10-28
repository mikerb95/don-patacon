# DON PATACÓN

Sitio web de DON PATACÓN, cocina colombiana en el Centro Comercial Plaza
Central (Bogotá). Los clientes comen en las mesas comunes de la plazoleta: no
hay reservas ni eventos. Se vende para recoger, con pedido por WhatsApp, y a
domicilio solo a través de apps (Rappi, DiDi Food).

## Stack

- [Astro 5](https://astro.build) con islas de React 19
- Tailwind CSS 3
- [BCMS](https://thebcms.com) como CMS headless (contenido, carta, precios e
  información del comercio)
- Despliegue en Vercel

## Páginas

| Ruta | Contenido |
| --- | --- |
| `/` | Home: hero, especiales del día, testimonios, mapa |
| `/menu` | Carta con precios en COP (filtro por tipo con `?s=`) |
| `/seasonal-menu` | Carta de temporada |
| `/pedidos` | Formulario que arma el pedido y lo abre en WhatsApp |
| `/contact` | Ubicación dentro de Plaza Central y mapa |
| `/about-us` | Nosotros |
| `/legal` | Términos (contenido desde BCMS) |
| `/privacidad` | Política de tratamiento de datos (Ley 1581 de 2012) |

`/reservation` redirige a `/pedidos` y `/events` a `/`.

## Puesta en marcha

Requiere Node.js 22 o superior y las claves API de BCMS.

```bash
npm install
cp .env.example .env.local   # completar BCMS_API_KEY y PUBLIC_BCMS_API_KEY
npm run dev
```

`dev`, `build` y `preview` ejecutan antes `bcms pull types`, que genera los
tipos en `bcms/` (carpeta ignorada por git). Sin claves válidas fallan con
`401: Not logged in`.

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | `astro check` y build de producción en `dist/` |
| `npm run preview` | Sirve el build localmente |

## Configuración

- **[BCMS-SETUP.md](./BCMS-SETUP.md):** claves API, template `business-info`
  (dirección, teléfono, WhatsApp, horario, razón social y NIT) y dónde se usa
  cada dato.
- **[.env.example](./.env.example):** variables de entorno. Los datos del
  negocio aquí son solo el respaldo si la entry `business-info` no existe en
  BCMS; los valores faltantes se muestran como `TODO_...` para que se noten.

## Estructura

```
src/
  config/       site.ts (fallbacks por env) y business.ts (lee business-info de BCMS)
  components/   componentes React por página y RestaurantJsonLd.astro (Schema.org)
  layouts/      Layout.astro: metadatos, fuentes, header y footer
  pages/        rutas de Astro
  utils/        formato de precios en COP
```

Las fuentes (Inter y Gloock) se autoalojan con `@fontsource`.

## Pendientes

Ver [pendientes.md](./pendientes.md).
