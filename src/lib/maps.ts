/** Embed de Google Maps sin API key: apunta al centro comercial, no al local. */
export const MALL_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(
    'Centro Comercial Plaza Central, Bogotá',
)}&output=embed`;

/** Enlace para abrir Google Maps: el del panel o, si falta, una búsqueda del centro comercial. */
export function mapsLink(business: { mapsUrl: string; address: { line1: string; city: string } }): string {
    if (business.mapsUrl) return business.mapsUrl;
    const lugar = [business.address.line1 || 'Centro Comercial Plaza Central', business.address.city || 'Bogotá'].join(', ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lugar)}`;
}
