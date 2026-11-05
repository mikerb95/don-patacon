import type { APIRoute } from 'astro';
import { getStore } from '../../../lib/admin/config';
import { adminRoute, json } from '../../../lib/admin/guard';
import { DOC_FILES, docPath } from '../../../lib/admin/store';
import { docSchemas } from '../../../lib/schema';

export const prerender = false;

export const GET: APIRoute = adminRoute(async () => {
    const store = getStore();
    return json({ entries: await store.history() });
});

/** Restaura el contenido de una versión anterior con un commit nuevo: nada se pierde. */
export const POST: APIRoute = adminRoute(async ({ request }) => {
    const body = await request.json().catch(() => null);
    const sha = body?.sha;
    if (typeof sha !== 'string' || !/^[0-9a-f]{40}$/.test(sha)) {
        return json({ error: 'Versión inválida.' }, 400);
    }
    const store = getStore();
    const raw = await store.readDocs(sha);
    for (const name of DOC_FILES) {
        const parsed = docSchemas[name].safeParse(JSON.parse(raw[name]));
        if (!parsed.success) {
            return json({ error: 'Esa versión no es compatible con el panel actual.' }, 422);
        }
    }
    const commit = await store.write(
        DOC_FILES.map((name) => ({ path: docPath(name), content: Buffer.from(raw[name]) })),
        `contenido: restaura la versión ${sha.slice(0, 7)}`,
    );
    return json({ commit });
});
