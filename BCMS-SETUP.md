# Configuración de BCMS

Todo el contenido del sitio se gestiona desde el dashboard de BCMS
([app.thebcms.com](https://app.thebcms.com)): platos, precios, menús de
temporada, eventos, textos de páginas y también la **información del comercio**
(dirección, teléfono, horario, redes, WhatsApp, mapa).

Este documento cubre dos cosas:

1. Las claves API que el sitio necesita para compilar (sin ellas **el build
   falla** con `401: Not logged in`).
2. Cómo crear el template `business-info` para gestionar la información del
   comercio desde BCMS en lugar de variables de entorno.

---

## 1. Claves API (obligatorio)

### Obtenerlas

1. Entra a [app.thebcms.com](https://app.thebcms.com) con la cuenta dueña del
   proyecto.
2. Abre el proyecto (instance) del sitio → **Settings → API Keys**.
3. Crea (o copia) dos keys:
   - Una **privada** (acceso de lectura a todos los templates) → `BCMS_API_KEY`.
   - Una **pública de solo lectura** (se expone al navegador para servir
     imágenes) → `PUBLIC_BCMS_API_KEY`.
4. El valor que usa el sitio tiene el formato:

   ```
   <keyId>.<secret>.<instanceId>
   ```

### Configurarlas en Vercel

```sh
vercel env add BCMS_API_KEY production
vercel env add PUBLIC_BCMS_API_KEY production
```

Repite para `preview` y `development` (o márcalas para todos los entornos desde
el dashboard: Project Settings → Environment Variables). Después, redeploy.

### Configurarlas en local

```sh
cp .env.example .env.local
# completa BCMS_API_KEY y PUBLIC_BCMS_API_KEY
npm run dev
```

`npm run dev` y `npm run build` ejecutan `bcms pull types` primero; ese comando
lee `BCMS_API_KEY` del entorno. Si ves `{ status: 401, message: 'Not logged in.' }`,
la clave falta o es inválida.

---

## 2. Template `business-info` (información del comercio)

El código (`src/config/business.ts`) busca una entry con slug `business-info`
del template `business-info`. Si no existe, usa como fallback las variables de
entorno `PUBLIC_*` (ver `.env.example`), así que el sitio no se rompe mientras
tanto — pero lo recomendado es gestionarlo desde BCMS.

### Crear el template

En el dashboard de BCMS → **Templates → Add new template**:

- **Label**: `Business Info` (el name/slug generado debe ser `business-info`).
- Tipo: single entry (solo se usará una entry).

Agrega estas propiedades, todas de tipo **String** y opcionales (el campo
`title` que BCMS crea automáticamente se usa como nombre del comercio):

| Propiedad (name) | Contenido | Ejemplo |
| --- | --- | --- |
| `address_line1` | Dirección, línea 1 | `Calle 12 # 34-56` |
| `address_line2` | Dirección, línea 2 (opcional) | `Local 3` |
| `address_city` | Ciudad | `Bogotá` |
| `address_country` | País (opcional) | `Colombia` |
| `phone_display` | Teléfono como se muestra | `+57 300 123 4567` |
| `phone_e164` | Teléfono en formato E.164 (para `tel:`) | `+573001234567` |
| `email` | Email de contacto | `contacto@donpatacon.com` |
| `whatsapp_number` | WhatsApp sin `+` ni espacios | `573001234567` |
| `hours` | Horario | `Mar–Dom 12:00–22:00` |
| `instagram_url` | URL de Instagram (vacío = no se muestra) | `https://instagram.com/donpatacon` |
| `facebook_url` | URL de Facebook (vacío = no se muestra) | |
| `x_url` | URL de X (vacío = no se muestra) | |
| `maps_url` | URL de Google Maps del local | `https://maps.google.com/...` |

> Importante: los nombres de propiedad deben quedar exactamente en snake_case
> como aparecen arriba; son los que lee `src/config/business.ts`.

### Crear la entry

1. **Entries → Business Info → Add new entry**.
2. **Title**: `DON PATACÓN` (se usa como nombre del comercio en footer,
   formulario de reservas y mensajes de WhatsApp).
3. **Slug**: `business-info` (debe ser exactamente este).
4. Completa los campos y publica.
5. Asegúrate de que la API key privada tenga acceso de lectura a este template
   (Settings → API Keys → permisos del template).

Como el sitio es estático, los cambios se reflejan en el **siguiente build**:
haz redeploy en Vercel (o configura un webhook de BCMS → Deploy Hook de Vercel
si quieres que se redepliegue automático al publicar).

### Dónde se usa cada dato

| Dato | Dónde aparece |
| --- | --- |
| Nombre (title) | Footer (copyright), formulario de reservas, mensaje de WhatsApp |
| Dirección, horario | Footer |
| Teléfono, email | Footer (columna Contacto) |
| Redes sociales | Footer (columna Síguenos; las URLs vacías se ocultan) |
| WhatsApp | Botón de enviar reserva (`wa.me`) |
| `maps_url` | "Abrir mapa" en home (hero) y página de contacto |

---

## 3. Resto del contenido (referencia)

Estos templates ya existen y se gestionan igual, desde el dashboard:

- `food-item` — platos: nombre, precio, descripción, imagen.
- `meal-type` — categorías del menú.
- `season` — menús de temporada.
- Páginas: `home-page`, `menu-page`, `seasonal-menu-page`, `events-page`,
  `about-page`, `contact-page`, `reservation-page`, `legal-page`.

Los tipos TypeScript de estos templates se generan con `bcms pull types`
(carpeta `bcms/`, generada en cada build).
