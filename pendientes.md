# Pendientes

Lo que falta para dejar el sitio de DON PATACÓN completo. Contexto: local propio
en el Centro Comercial Plaza Central (Bogotá), los clientes comen en las mesas
comunes de la plazoleta. No hay reservas, eventos ni domicilios propios: se
vende para recoger (pedido por WhatsApp) y a domicilio solo por apps.

## 1. Urgente (bloquea la salida a producción)

- [ ] **Iniciar sesión en Vercel** (`vercel login`) y volver a vincular el
      proyecto si lo pide (`vercel link`). El CLI responde "Not authorized" y
      `don-patacon.vercel.app` da 404.
- [ ] **Crear las credenciales del panel:** `npm run admin:setup`.
- [ ] **Crear el token de GitHub** (fine-grained, solo este repo,
      `Contents: Read and write`).
- [ ] **Cargar las variables en Vercel** y activar las variables de sistema
      (ver "Configurar producción" en `README.md`).
- [ ] **Regla de Vercel Firewall** para limitar `POST /admin/login`.
- [ ] **Probar en producción:** publicar un cambio, ver el aviso de "Publicado",
      subir una foto y restaurar una versión. Hasta ahora, el guardado en GitHub
      solo se probó contra un GitHub simulado.
- [ ] **Revocar la API key privada de BCMS** que estuvo expuesta en `/contact` y
      cerrar esa cuenta si no se usa.

## 2. Contenido que debe cargar el negocio (desde `/admin`)

El panel muestra en "Negocio" lo que falta.

- [ ] **Carta real:** categorías, platos, precios y fotos. Hoy solo hay tres
      categorías de ejemplo y ningún plato.
- [ ] **Foto principal.** La actual es un salmón de la plantilla de origen, no un
      plato de Don Patacón.
- [ ] **Horario por día**, WhatsApp, teléfono y correo.
- [ ] Número de local y piso en Plaza Central.
- [ ] Enlaces de Rappi y DiDi Food, si existen.
- [ ] **Razón social y NIT**: los usa `/privacidad` como responsable del
      tratamiento.
- [ ] Revisar los textos iniciales de Inicio, Nosotros y Contacto, y confirmar
      "cocina colombiana".
- [ ] Contacto: parqueadero y cómo llegar (TransMilenio).
- [ ] Testimonios reales y fotos del lugar. Sin ellos, esas secciones no aparecen.
- [ ] Que el dueño (idealmente con asesoría legal) valide `/privacidad` y los
      términos.

## 3. SEO local

- [ ] **Dominio final.** Con él: `site` en `astro.config.mjs`, sitemap
      (`@astrojs/sitemap`), `robots.txt`, canónicas, `og:image` absoluta y
      `url` / `image` en el JSON-LD.
- [ ] **Perfil de Google Business** del local, con la ubicación dentro de
      Plaza Central, y enlace desde el sitio a las reseñas. Con él, apuntar el
      mapa de contacto al local (hoy apunta al centro comercial).

## 4. Técnico

- [ ] **Logo definitivo.** El de la plantilla se reemplazó por el nombre en
      Gloock, el favicon es provisional y la imagen para compartir usa el
      mismo nombre.
- [ ] **CSP del sitio público.** Probarlo con un build: puede bloquear los
      estilos inline de Swiper, y hay que permitir `https://www.google.com` en
      `frame-src` por los mapas. El panel ya tiene el suyo.
- [ ] **Dependencias.** Astro ya está en 7.x. `npm audit` aún marca 6 avisos
      (3 altos, 3 moderados) que vienen de `@astrojs/vercel` 11.0.18, la última
      versión: `path-to-regexp`, `glob` y `minimatch`. No aparecen en la función
      de producción. Revisar cuando salga una versión nueva del adapter.
- [ ] Limpieza de fotos sin usar en `public/media/`: el panel no borra las
      imágenes reemplazadas.

## 5. Opcional

- [ ] Analítica (Vercel Analytics o GA4) para medir cuánta gente llega a
      `/pedidos` y envía el WhatsApp. Si usa cookies, hace falta aviso de
      cookies.
- [ ] Newsletter o captura de contactos para promociones.
