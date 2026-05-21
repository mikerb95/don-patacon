/**
 * Configuración central del sitio.
 *
 * Estos datos deben moverse a BCMS (ver BCMS-SETUP.md). Mientras tanto se leen
 * de variables de entorno con fallback a valores TODO_ visibles.
 *
 * En Vercel: definir como Environment Variables (Project Settings → Environment).
 * Local: copiar .env.example a .env.local y completar.
 */

const env = import.meta.env;

export const siteConfig = {
    name: 'DON PATACÓN',
    description:
        'DON PATACÓN — cocina con sabor y carácter. Reservas, eventos y carta de temporada.',
    locales: ['es', 'en'] as const,
    defaultLocale: 'es' as const,

    address: {
        line1: env.PUBLIC_ADDRESS_LINE1 || 'TODO_DIRECCION_LINEA_1',
        line2: env.PUBLIC_ADDRESS_LINE2 || '',
        city: env.PUBLIC_ADDRESS_CITY || 'TODO_CIUDAD',
        country: env.PUBLIC_ADDRESS_COUNTRY || '',
    },

    phone: {
        display: env.PUBLIC_PHONE_DISPLAY || 'TODO_TELEFONO',
        e164: env.PUBLIC_PHONE_E164 || 'TODO_TELEFONO_E164',
    },

    email: env.PUBLIC_EMAIL || 'TODO_EMAIL',

    whatsapp: {
        /** Número sin '+', sin espacios. Ej: 573001234567 */
        number: env.PUBLIC_WHATSAPP_NUMBER || 'TODO_WHATSAPP',
    },

    hours: env.PUBLIC_HOURS || 'TODO_HORARIO',

    social: {
        instagram: env.PUBLIC_INSTAGRAM_URL || '',
        facebook: env.PUBLIC_FACEBOOK_URL || '',
        x: env.PUBLIC_X_URL || '',
    },

    maps: {
        /** URL a Google Maps con la ubicación del local. */
        url: env.PUBLIC_MAPS_URL || 'https://www.google.com/maps',
    },
} as const;

export type Locale = (typeof siteConfig.locales)[number];
