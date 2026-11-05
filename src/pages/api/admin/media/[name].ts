import type { APIRoute } from 'astro';
import { getStore } from '../../../../lib/admin/config';
import { adminRoute, json } from '../../../../lib/admin/guard';

export const prerender = false;

const TYPES: Record<string, string> = { webp: 'image/webp', jpg: 'image/jpeg', png: 'image/png' };

/** Sirve imágenes a la vista previa, aunque aún no estén en el sitio publicado. */
export const GET: APIRoute = adminRoute(async ({ params }) => {
    const match = /^[a-z0-9-]+\.(webp|jpg|png)$/.exec(params.name ?? '');
    if (!match) return json({ error: 'Imagen inválida.' }, 400);
    try {
        const file = await getStore().readBinary(`public/media/${match[0]}`);
        return new Response(new Uint8Array(file), { headers: { 'Content-Type': TYPES[match[1]] } });
    } catch {
        return json({ error: 'Imagen no encontrada.' }, 404);
    }
});
