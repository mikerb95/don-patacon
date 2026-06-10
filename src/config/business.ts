/**
 * Información del comercio (dirección, teléfono, horario, redes, etc.).
 *
 * Fuente primaria: BCMS, template `business-info` con una única entry de slug
 * `business-info` (ver BCMS-SETUP.md para crearla).
 * Fallback: variables de entorno vía `siteConfig` (src/config/site.ts), de modo
 * que el sitio sigue funcionando mientras la entry no exista en BCMS.
 *
 * Se consulta en build (frontmatter de Astro) y se cachea en memoria para no
 * repetir la petición por cada página.
 */

import { bcmsPrivate } from '../bcms-private';
import { siteConfig } from './site';

export interface BusinessInfo {
    name: string;
    address: {
        line1: string;
        line2: string;
        city: string;
        country: string;
    };
    phone: {
        display: string;
        e164: string;
    };
    email: string;
    whatsapp: {
        number: string;
    };
    hours: string;
    social: {
        instagram: string;
        facebook: string;
        x: string;
    };
    maps: {
        url: string;
    };
}

const fallback: BusinessInfo = {
    name: siteConfig.name,
    address: { ...siteConfig.address },
    phone: { ...siteConfig.phone },
    email: siteConfig.email,
    whatsapp: { ...siteConfig.whatsapp },
    hours: siteConfig.hours,
    social: { ...siteConfig.social },
    maps: { ...siteConfig.maps },
};

function str(meta: Record<string, unknown>, key: string): string | undefined {
    const value = meta[key];
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed || undefined;
}

let cached: Promise<BusinessInfo> | null = null;

async function load(): Promise<BusinessInfo> {
    let entry: unknown;
    try {
        entry = await bcmsPrivate.entry.getBySlug(
            'business-info',
            'business-info',
        );
    } catch (error) {
        console.warn(
            '[business-info] No se pudo leer la entry de BCMS, usando variables de entorno (ver BCMS-SETUP.md):',
            error instanceof Error ? error.message : error,
        );
        return fallback;
    }
    if (!entry || typeof entry !== 'object') return fallback;

    const metaByLng = (entry as { meta?: Record<string, unknown> }).meta;
    const meta = (metaByLng?.en ?? Object.values(metaByLng ?? {})[0]) as
        | Record<string, unknown>
        | undefined;
    if (!meta) return fallback;

    return {
        name: str(meta, 'title') || fallback.name,
        address: {
            line1: str(meta, 'address_line1') || fallback.address.line1,
            line2: str(meta, 'address_line2') ?? fallback.address.line2,
            city: str(meta, 'address_city') || fallback.address.city,
            country: str(meta, 'address_country') ?? fallback.address.country,
        },
        phone: {
            display: str(meta, 'phone_display') || fallback.phone.display,
            e164: str(meta, 'phone_e164') || fallback.phone.e164,
        },
        email: str(meta, 'email') || fallback.email,
        whatsapp: {
            number: str(meta, 'whatsapp_number') || fallback.whatsapp.number,
        },
        hours: str(meta, 'hours') || fallback.hours,
        social: {
            instagram: str(meta, 'instagram_url') ?? fallback.social.instagram,
            facebook: str(meta, 'facebook_url') ?? fallback.social.facebook,
            x: str(meta, 'x_url') ?? fallback.social.x,
        },
        maps: {
            url: str(meta, 'maps_url') || fallback.maps.url,
        },
    };
}

export function getBusinessInfo(): Promise<BusinessInfo> {
    if (!cached) {
        cached = load();
    }
    return cached;
}
