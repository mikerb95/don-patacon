// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
//
// Gloock se carga con el <link> de Google Fonts en src/layouts/Layout.astro.
// CSP pendiente: en Astro 5 va en `experimental.csp` (en Astro 6, `security.csp`).
// Activarlo solo con un build de prueba: puede bloquear Google Fonts y los
// estilos inline de Swiper.
export default defineConfig({
    integrations: [tailwind(), react()],
    redirects: {
        // El local usa las mesas comunes de la plazoleta: no hay reservas ni eventos.
        '/reservation': '/pedidos',
        '/events': '/',
    },
});
