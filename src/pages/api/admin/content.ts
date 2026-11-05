import type { APIRoute } from 'astro';
import { getStore } from '../../../lib/admin/config';
import { adminRoute, json } from '../../../lib/admin/guard';
import { docPath, revOf, serializeDoc, type DocFile, type WriteFile } from '../../../lib/admin/store';
import { DOC_NAMES, docSchemas } from '../../../lib/schema';

export const prerender = false;

export const GET: APIRoute = adminRoute(async () => {
    const store = getStore();
    const raw = await store.readDocs();
    const docs = Object.fromEntries(DOC_NAMES.map((n) => [n, JSON.parse(raw[n])]));
    const revs = Object.fromEntries(DOC_NAMES.map((n) => [n, revOf(raw[n])]));
    return json({ docs, revs, hasHistory: store.hasHistory });
});

const SUMMARY: Record<DocFile, string> = {
    business: 'datos del negocio',
    menu: 'carta',
    pages: 'textos de páginas',
};

export const PUT: APIRoute = adminRoute(async ({ request }) => {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.docs !== 'object' || typeof body.revs !== 'object') {
        return json({ error: 'Petición inválida.' }, 400);
    }
    const names = DOC_NAMES.filter((n) => body.docs[n] !== undefined);
    if (names.length === 0) return json({ error: 'No hay cambios para publicar.' }, 400);

    const files: WriteFile[] = [];
    const expected: Partial<Record<DocFile, string>> = {};
    const revs: Partial<Record<DocFile, string>> = {};
    const saved: Partial<Record<DocFile, unknown>> = {};
    for (const name of names) {
        const parsed = docSchemas[name].safeParse(body.docs[name]);
        if (!parsed.success) {
            return json({ error: parsed.error.issues[0]?.message ?? 'Hay un dato inválido.', doc: name }, 422);
        }
        if (typeof body.revs[name] !== 'string') return json({ error: 'Falta la versión.' }, 400);
        const text = serializeDoc(parsed.data);
        files.push({ path: docPath(name), content: Buffer.from(text) });
        expected[name] = body.revs[name];
        revs[name] = revOf(text);
        saved[name] = parsed.data;
    }

    const message = `contenido: actualiza ${names.map((n) => SUMMARY[n]).join(', ')}`;
    const commit = await getStore().write(files, message, expected);
    return json({ commit, revs, docs: saved });
});
