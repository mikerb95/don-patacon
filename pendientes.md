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
      build (en local no hay claves de BCMS, así que nada se ha visto aún):
      - carta (`?s=`, precios en COP) y especiales del día,
      - fuentes nuevas: Inter variable en lugar de Helvetica, y Gloock
        autoalojada con `@fontsource`. Inter es algo más ancha: revisar que
        no se rompa ningún título o botón,
      - sliders del home con Swiper 12 (especiales y testimonios),
      - página `/pedidos` y su enlace a `/privacidad`,
      - página `/privacidad` (nueva),
      - contacto con el mapa embebido de Google Maps,
      - footer y redirecciones (`/reservation` → `/pedidos`, `/events` → `/`).

## 2. Datos que faltan del negocio

Se cargan en la entry `business-info` de BCMS (ver `BCMS-SETUP.md`) o en las
variables `PUBLIC_*`.

- [ ] `mall_location`: número de local y piso en Plaza Central
      (ej. "Local 3-12, plazoleta de comidas, piso 3").
- [ ] `rappi_url` / `didi_url`: enlaces a las apps de domicilios, si existen.
- [ ] Revisar que no quede ningún valor `TODO_` (dirección, teléfono, email,
      WhatsApp, horario, razón social y NIT).
- [ ] **Razón social y NIT** (`legal_name` y `nit` en `business-info`, o
      `PUBLIC_LEGAL_NAME` / `PUBLIC_NIT`): los usa `/privacidad` como
      responsable del tratamiento.
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
- [ ] Borrar el campo `map_image` de `contact-page`: contacto ya usa un mapa
      embebido de Google Maps.

## 4. SEO local

- [ ] **Dominio final.** Con él: `site` en `astro.config.mjs`, sitemap
      (`@astrojs/sitemap`), `robots.txt`, canónicas, `og:image` absoluta y
      `url` / `image` en el JSON-LD.
- [ ] **Perfil de Google Business** del local, con la ubicación dentro de
      Plaza Central, y enlace desde el sitio a las reseñas. Con él, apuntar el
      mapa de contacto al local (hoy apunta al centro comercial).
- [ ] Cambiar los testimonios cargados a mano en BCMS por la calificación y las
      reseñas reales de Google.

## 5. Técnico

- [ ] **CSP.** Hoy no está activo (Astro 5 ignoraba `security.csp`). Activarlo
      con un build de prueba (requiere las claves de BCMS): puede bloquear los
      estilos inline de Swiper, y hay que permitir `https://www.google.com` en
      `frame-src` por el mapa de contacto. Google Fonts ya no aplica.
- [ ] **Migración de Astro.** `npm audit fix` ya aplicado (de 39 a 12
      vulnerabilidades) y Swiper subido a 12.2 (quita la crítica de Swiper).
      Las 12 restantes (`astro`, `esbuild`, `sharp`, `zod`, `uuid`) solo se
      resuelven con la versión mayor de Astro (hoy 7.x). Planearla con build.

## 6. Contenido y decisiones

- [ ] **Carta de temporada.** Usa primavera, verano, otoño e invierno, que no
      aplican en Bogotá. Convertirla en "Menú del día" / "Almuerzo ejecutivo" o
      eliminarla. Hoy tampoco está en el menú principal (solo se llega desde el
      home), igual que "Nosotros".
- [ ] **Política de tratamiento de datos.** Ya existe `/privacidad` (enlazada
      desde el footer y el formulario de pedidos). Falta: completar razón
      social y NIT, y que el dueño (idealmente con asesoría legal) valide el
      texto.
- [ ] **Contacto:** agregar parqueadero y cómo llegar (TransMilenio); faltan
      los datos.

## 7. Opcional

- [ ] Analítica (Vercel Analytics o GA4) para medir cuánta gente llega a
      `/pedidos` y envía el WhatsApp. Si usa cookies, hace falta aviso de
      cookies.
- [ ] Newsletter o captura de contactos para promociones.
