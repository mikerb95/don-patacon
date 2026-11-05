import { randomBytes } from 'node:crypto';
import type { APIRoute } from 'astro';
import { getStore } from '../../../lib/admin/config';
import { adminRoute, json } from '../../../lib/admin/guard';

export const prerender = false;

const MAX_BYTES = 3 * 1024 * 1024;

/** Se mira el contenido real del archivo, no su nombre ni el tipo que declara. */
function sniffImage(b: Buffer): 'webp' | 'jpg' | 'png' | null {
    if (b.length > 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') return 'webp';
    if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
    if (b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
    return null;
}

export const POST: APIRoute = adminRoute(async ({ request }) => {
    const form = await request.formData().catch(() => null);
    const file = form?.get('file');
    if (!(file instanceof File)) return json({ error: 'No llegó ninguna imagen.' }, 400);
    if (file.size > MAX_BYTES) return json({ error: 'La imagen pesa más de 3 MB.' }, 413);
    const content = Buffer.from(await file.arrayBuffer());
    const ext = sniffImage(content);
    if (!ext) return json({ error: 'Usa una imagen JPG, PNG o WebP.' }, 415);
    const name = `${Date.now().toString(36)}-${randomBytes(6).toString('hex')}.${ext}`;
    await getStore().write(
        [{ path: `public/media/${name}`, content }],
        `contenido: agrega imagen ${name}`,
    );
    return json({ path: `/media/${name}` });
});
