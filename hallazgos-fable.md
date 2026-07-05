# Auditoría de integridad del sistema — Hallazgos

- **Fecha:** 2026-07-05
- **Proyecto:** don-patacon (Astro 5 + BCMS + React, desplegado en Vercel)
- **Rama auditada:** `main` (sincronizada con `origin/main`, working tree limpio)
- **Herramientas usadas:** `git fsck`, `npm audit`, `tsc`, inspección de historial de git y búsqueda de secretos

---

## Resumen ejecutivo

El proyecto está en buen estado general: el repositorio git es íntegro, no hay secretos filtrados en el código ni en el historial, y la configuración separa correctamente credenciales privadas y públicas. Los hallazgos principales están en las dependencias: **29 vulnerabilidades conocidas (1 crítica, 10 altas, 15 moderadas, 3 bajas)**, la mayoría corregibles con `npm audit fix`.

---

## ✅ Verificaciones que pasaron

### Integridad de git
- `git fsck --full` sin errores ni objetos corruptos.
- Working tree limpio, sin cambios pendientes.
- `main` local sincronizada con `origin/main` (0 commits sin subir).

### Secretos y credenciales
- No hay API keys reales en el código fuente ni en ningún commit del historial.
- `.env.example` solo contiene placeholders y datos públicos de negocio.
- Los clientes BCMS (`src/bcms-private.ts`, `src/bcms-public.ts`) leen las claves desde variables de entorno (`import.meta.env`), sin valores hardcodeados.
- `.env.local` solo contiene un `VERCEL_OIDC_TOKEN` efímero (expira en horas) y está correctamente ignorado por git (`.env*.local`).

### Configuración
- CSP habilitado en `astro.config.mjs` (`security: { csp: true }`).
- Separación correcta de claves: `BCMS_API_KEY` (privada, build/servidor) vs `PUBLIC_BCMS_API_KEY` (pública, solo lectura, expuesta al navegador).
- Carpetas generadas (`.astro`, `dist`, `bcms`) correctamente ignoradas desde el commit `9002b4d`.

---

## ⚠️ Hallazgos

### 1. Dependencias vulnerables — 29 vulnerabilidades (severidad: ALTA)

Resultado de `npm audit --omit=dev`: **1 crítica, 10 altas, 15 moderadas, 3 bajas.**

| Paquete | Severidad | Tipo | Notas |
|---|---|---|---|
| `swiper` | **Crítica** | Dependencia directa | Prioridad máxima |
| `astro` | Alta | Dependencia directa | Varias XSS (define:vars, slot names, spread props), SSRF vía Host header, replay de server islands |
| `axios` | Alta | Transitiva | SSRF, prototype pollution, leak de credenciales |
| `vite` | Alta | Transitiva | Lectura arbitraria de archivos vía dev server WebSocket |
| `ws` | Alta | Transitiva | Divulgación de memoria no inicializada, DoS |
| `lodash`, `devalue`, `defu`, `fast-uri`, `form-data`, `picomatch` | Alta | Transitivas | Prototype pollution y otros |

**Remediación:**
- La mayoría se corrige con `npm audit fix` (sin breaking changes).
- Las de Astro requieren `npm audit fix --force`, que instala Astro 7 (**breaking change**) — planear como tarea aparte con pruebas.

### 2. `.gitignore` no cubre `.env` plano (severidad: MEDIA — preventivo)

El `.gitignore` cubre `.env*.local` pero **no** `.env`. Si algún día se crea un `.env` plano con las claves BCMS reales, git lo rastrearía y podría filtrarse al remoto.

**Remediación:** añadir `.env` al `.gitignore` como red de seguridad.

### 3. Typecheck falla en el entorno local (severidad: MEDIA)

`npx tsc --noEmit` reporta errores por dos causas distintas:

- **Esperado sin credenciales:** la carpeta generada `bcms/` no existe localmente (se crea con `bcms pull types`, que requiere `BCMS_API_KEY`). Sin las claves, el entorno local no puede hacer `build` ni `dev` (falla con "401: Not logged in", ver `BCMS-SETUP.md`).
- **Errores propios del código:** dos parámetros `e` con tipo `any` implícito:
  - `src/components/menu-page/Meals.tsx:35`
  - `src/components/seasonal-menu-page/Seasons.tsx:37`

**Remediación:** tipar explícitamente esos dos parámetros; configurar las claves BCMS locales para poder validar builds.

### 4. Menores (severidad: BAJA)

- `node_modules` instalado en junio; tras aplicar `npm audit fix`, reinstalar dependencias.
- Vercel CLI desactualizado: 53.2.0 → 54.20.1 (`npm i -g vercel@latest`).

---

## Acciones recomendadas (por prioridad)

1. Ejecutar `npm audit fix` (sin `--force`) y reinstalar — corrige la mayoría de las 29 vulnerabilidades, incluida la crítica de `swiper` si tiene fix compatible.
2. Añadir `.env` al `.gitignore`.
3. Tipar los parámetros `e` en `Meals.tsx` y `Seasons.tsx`.
4. Planear la migración a Astro 7 (resuelve las vulnerabilidades altas de `astro`, breaking change).
5. Actualizar Vercel CLI.

---

# Análisis de brechas — web completa de restaurante

- **Fecha:** 2026-07-05
- **Alcance:** revisión funcional del sitio contra lo que espera cubrir una web completa de restaurante, según el modelo de negocio.

## Lo que ya está cubierto

Home completa (hero, ambiente, especiales, temporadas, testimonios, mapa), carta, carta de temporada, eventos, nosotros, contacto, reserva vía WhatsApp, legal y 404. Los datos del negocio vienen de BCMS con fallback a variables de entorno, y hay buenas bases técnicas (CSP, accesibilidad básica, skip-link).

## Brechas principales

### 1. La reserva no deja rastro en el negocio (prioridad ALTA)

El formulario (`src/components/reservation-page/Form.tsx`) solo arma un deep-link de `wa.me` y lo abre en otra pestaña. Si el cliente no tiene WhatsApp, no envía el mensaje, o cierra la pestaña, la reserva se pierde y el restaurante nunca se entera. Tampoco hay noción de disponibilidad ni de horario de apertura al elegir fecha/hora.

**Remediación:** endpoint (Vercel Function) que guarde la solicitud y/o envíe un email al restaurante, con confirmación al cliente. WhatsApp puede quedar como opción, no como único camino.

### 2. SEO local — el canal #1 de un restaurante (prioridad ALTA)

Hoy no existe:

- **JSON-LD de Schema.org** (`Restaurant` / `LocalBusiness` con dirección, horario, teléfono, `Menu`) — es lo que alimenta el panel de Google y el local pack de Maps.
- **Sitemap ni robots.txt** (falta `site` en `astro.config.mjs` y `@astrojs/sitemap`).
- **Meta por página:** `Layout.astro` tiene descripción y OG fijos para todo el sitio; menú, eventos y reservas comparten la misma descripción. Además `og:image` usa ruta relativa (`/thumbnail.jpg`), que las redes sociales no resuelven — necesita URL absoluta.
- **Canónicas.**

### 3. El horario es un string plano (prioridad MEDIA)

`hours` es una sola línea de texto. Para mostrar "abierto ahora", para el `openingHoursSpecification` de Schema.org y para validar la hora de reserva, hace falta estructura por día en BCMS.

### 4. Pedidos / delivery (prioridad ALTA según modelo de negocio)

No hay ningún camino para pedir comida: ni enlaces a plataformas (Rappi, etc.), ni pedido por WhatsApp, ni carta con precios descargable (PDF). Relacionado: no hay precios, alérgenos ni etiquetas dietéticas en la carta.

### 5. Sin analítica ni medición de conversión (prioridad MEDIA)

No hay Vercel Analytics ni GA4, así que no se puede saber cuánta gente llega a reservas y abandona. Si se añade analítica con cookies, haría falta banner/política de cookies (la página legal ya existe como contenedor).

### 6. Contacto pasivo (prioridad MEDIA)

La página de contacto muestra datos pero no tiene formulario propio (consultas de eventos privados, catering, grupos grandes). Los eventos tampoco tienen página de detalle ni forma de apuntarse.

### 7. i18n declarado pero no implementado (prioridad MEDIA)

`siteConfig` declara `locales: ['es','en']`, todo el contenido se lee de `meta.en` y la UI está en español hardcodeado. Hay que decidir: o el sitio es solo español (y simplificar), o montar rutas i18n de verdad.

## Menores pero valiosos

- Enlace directo a reseñas de Google (los testimonios hoy son solo del CMS, sin prueba social verificable).
- Newsletter / captura de emails para promociones y eventos.
- Página o sección de "menú del día" si el modelo lo contempla.

## Prioridad sugerida

1. Respaldo del flujo de reservas con un endpoint + email.
2. SEO local completo (JSON-LD, sitemap, meta por página, OG absoluto).
3. Precios/pedidos en la carta.
