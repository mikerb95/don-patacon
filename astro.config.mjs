// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

// https://astro.build/config
//
// El sitio público es estático; solo /admin y /api/admin corren en servidor
// (declaran `prerender = false`).
// Las fuentes (Inter y Gloock) se autoalojan con @fontsource, ver src/layouts/Layout.astro.
// CSP del sitio público pendiente: va en `security.csp`. Activarlo
// con un build de prueba: puede bloquear los estilos inline de Swiper.
export default defineConfig({
    output: 'static',
    adapter: vercel(),
    integrations: [react()],
    security: { checkOrigin: true },
    redirects: {
        // El local usa las mesas comunes de la plazoleta: no hay reservas ni eventos.
        '/reservation': '/pedidos',
        '/events': '/',
        '/seasonal-menu': '/menu',
    },
});
