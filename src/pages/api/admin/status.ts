import type { APIRoute } from 'astro';
import { deployedCommit, getStore } from '../../../lib/admin/config';
import { adminRoute, json } from '../../../lib/admin/guard';

export const prerender = false;

/** ¿Ya está en línea el commit indicado? */
export const GET: APIRoute = adminRoute(async ({ url }) => {
    const commit = url.searchParams.get('commit') ?? '';
    if (!/^[0-9a-f]{40}$/.test(commit)) return json({ error: 'Versión inválida.' }, 400);
    const head = deployedCommit();
    if (!head) return json({ live: false, unknown: true });
    return json({ live: await getStore().includes(commit, head) });
});
