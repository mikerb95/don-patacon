import defaultTheme from 'tailwindcss/defaultTheme.js';

/**
 * Identidad "selva ilustrada": solo verdes y amarillos (sin vinotinto).
 * Los nombres app* se conservan para no romper componentes y el panel,
 * pero apuntan a la paleta nueva.
 */
const monte = '#0E3B1F'; // verde selva oscuro: texto, contornos, fondos oscuros
const hoja = '#2E8B2E'; // verde hoja: hojas, pie, acentos
const biche = '#A8D13B'; // plátano verde: mascota, resaltes
const sol = '#F5B41F'; // amarillo patacón: acciones, precios
const tostado = '#C9711A'; // borde frito: detalles mínimos, nunca texto
const pulpa = '#FFF3C4'; // pulpa del plátano: fondo de página

/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            colors: {
                monte,
                hoja,
                biche,
                sol,
                tostado,
                pulpa,
                papel: '#FFFDF2', // blanco cálido para globos y tarjetas
                appAccent: sol,
                appBody: pulpa,
                appText: monte,
                appGray: {
                    100: '#E9EDCB',
                    200: '#4F6447',
                    300: '#3F5539',
                    400: '#5F7457',
                    500: '#6E8164',
                    600: '#4F6447',
                    700: '#28452A',
                },
            },
            container: {
                center: true,
                padding: {
                    DEFAULT: '1.25rem',
                    lg: '2rem',
                },
                screens: {
                    sm: '640px',
                    md: '768px',
                    lg: '1024px',
                    xl: '1280px',
                    '2xl': '1320px',
                },
            },
            fontFamily: {
                sans: ['"Baloo 2"', ...defaultTheme.fontFamily.sans],
                // El panel sigue con Inter: es una herramienta, no la vitrina.
                admin: ['"Inter Variable"', ...defaultTheme.fontFamily.sans],
                display: ['Chango', '"Baloo 2"', ...defaultTheme.fontFamily.sans],
            },
            boxShadow: {
                // Sombra dura, sin desenfoque: aspecto de calcomanía.
                dura: `0 5px 0 ${monte}`,
                'dura-sm': `0 3px 0 ${monte}`,
                'dura-lg': `0 7px 0 ${monte}`,
            },
            borderWidth: {
                3: '3px',
            },
        },
    },
    plugins: [],
};
