import type { APIRoute } from 'astro';
import { adminRoute, json } from '../../../lib/admin/guard';
import { validateDocs } from '../../../lib/admin/validate';

export const prerender = false;

export const POST: APIRoute = adminRoute(async ({ request }) => {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.docs !== 'object') return json({ error: 'Petición inválida.' }, 400);
    return json({ issues: validateDocs(body.docs).issues });
});
