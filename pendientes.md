# Pendientes

Lo que falta para dejar el sitio de DON PATACÓN completo. Contexto: local propio
en el Centro Comercial Plaza Central (Bogotá), los clientes comen en las mesas
comunes de la plazoleta. No hay reservas, eventos ni domicilios propios: se
vende para recoger (pedido por WhatsApp) y a domicilio solo por apps.

## 1. Urgente (bloquea el deploy)

- [ ] **Rotar la API key privada de BCMS.** La página `/contact` la exponía en
      el HTML (ya corregido en el código). En BCMS: Settings → API Keys, borrar
      la privada actual y crear una nueva.
- [ ] **Iniciar sesión en Vercel** (`vercel login`) y volver a vincular el
      proyecto si lo pide (`vercel link`). El CLI responde "Not authorized" y
      `don-patacon.vercel.app` da 404.
- [ ] **Cargar las claves en Vercel** (production, preview y development):
      `BCMS_API_KEY` (la nueva) y `PUBLIC_BCMS_API_KEY` (solo lectura).
- [ ] **Deploy de preview y revisión en pantalla** de todo lo cambiado sin
      build: carta (`?s=`, precios en COP), especiales del día, títulos en
      Gloock, página `/pedidos`, contacto, footer y redirecciones
      (`/reservation` → `/pedidos`, `/events` → `/`).

## 2. Datos que faltan del negocio

Se cargan en la entry `business-info` de BCMS (ver `BCMS-SETUP.md`) o en las
variables `PUBLIC_*`.

- [ ] `mall_location`: número de local y piso en Plaza Central
      (ej. "Local 3-12, plazoleta de comidas, piso 3").
- [ ] `rappi_url` / `didi_url`: enlaces a las apps de domicilios, si existen.
- [ ] Revisar que no quede ningún valor `TODO_` (dirección, teléfono, email,
      WhatsApp, horario).
- [ ] Confirmar "cocina colombiana" en las descripciones y en el JSON-LD
      (`servesCuisine`).
- [ ] **Horario real por día.** Se necesita para:
      - mostrar "Abierto ahora",
      - `openingHoursSpecification` en el JSON-LD (Google),
      - dejar una sola fuente de horario: hoy hay dos (`hero_open_time` del
        home y `hours` de `business-info`). Lo mismo pasa con la dirección
        (`hero_address` vs. `business-info`).

## 3. Limpieza en BCMS

- [ ] Borrar los templates `reservation-page` y `events-page`.
- [ ] Borrar los campos `events_*` de `home-page`.

## 4. SEO local

- [ ] **Dominio final.** Con él: `site` en `astro.config.mjs`, sitemap
      (`@astrojs/sitemap`), `robots.txt`, canónicas, `og:image` absoluta y
      `url` / `image` en el JSON-LD.
- [ ] **Perfil de Google Business** del local, con la ubicación dentro de
      Plaza Central, y enlace desde el sitio a las reseñas.
- [ ] Cambiar los testimonios cargados a mano en BCMS por la calificación y las
      reseñas reales de Google.

## 5. Técnico

- [ ] **CSP.** Hoy no está activo (Astro 5 ignoraba `security.csp`). Activarlo
      con un build de prueba: puede bloquear Google Fonts y los estilos inline
      de Swiper.
- [ ] **Dependencias vulnerables.** `npm audit fix` (sin `--force`) y luego
      planear la migración a Astro 6, que resuelve las vulnerabilidades de
      `astro` y trae CSP y fuentes estables. Probar con build.
- [ ] **Fuentes Helvetica.** 26 `@font-face` (940 KB, incluida una cirílica) y
      de licencia comercial. Reemplazar por 2 o 3 pesos de una fuente libre.
- [ ] **`locales: ['es', 'en']`** en `src/config/site.ts`: el inglés no existe.
      Quitarlo (o implementar i18n de verdad).
- [ ] **`hallazgos-fable.md` está desactualizado**: dice que el CSP está
      habilitado y no lo está, y varias de sus brechas ya se resolvieron.
      Corregirlo o borrarlo en favor de este archivo.
- [ ] README: sigue siendo el del starter de BCMS.

## 6. Contenido y decisiones

- [ ] **Carta de temporada.** Usa primavera, verano, otoño e invierno, que no
      aplican en Bogotá. Convertirla en "Menú del día" / "Almuerzo ejecutivo" o
      eliminarla. Hoy tampoco está en el menú principal (solo se llega desde el
      home), igual que "Nosotros".
- [ ] **Política de tratamiento de datos (Ley 1581 de 2012).** El formulario de
      pedidos pide nombre y teléfono. Hace falta una política real y separada;
      hoy "Términos" y "Política de privacidad" del footer apuntan los dos a
      `/legal`.
- [ ] **Mapa.** Cambiar la imagen estática por un mapa embebido de Google Maps,
      y agregar parqueadero y cómo llegar (TransMilenio) en contacto.

## 7. Opcional

- [ ] Analítica (Vercel Analytics o GA4) para medir cuánta gente llega a
      `/pedidos` y envía el WhatsApp. Si usa cookies, hace falta aviso de
      cookies.
- [ ] Newsletter o captura de contactos para promociones.
