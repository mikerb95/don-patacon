import type { APIContext, APIRoute } from 'astro';
import { authConfig, COOKIE_NAME, StoreNotConfigured } from './config';
import { verifySession } from './crypto';
import { ConflictError, GitHubError } from './store';

export function isAuthenticated(context: Pick<APIContext, 'cookies'>): boolean {
    const cfg = authConfig();
    if (!cfg) return false;
    return verifySession(context.cookies.get(COOKIE_NAME)?.value, cfg.sessionSecret);
}

export const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });

/** Rechaza peticiones que cambian datos y vienen de otro sitio (CSRF). */
export function isSameOrigin(request: Request): boolean {
    const origin = request.headers.get('origin');
    if (!origin) return false;
    const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
    try {
        return new URL(origin).host === host;
    } catch {
        return false;
    }
}

/** Envuelve una ruta del API: exige sesión y mismo origen, y traduce los errores. */
export function adminRoute(handler: APIRoute): APIRoute {
    return async (context) => {
        if (!isAuthenticated(context)) {
            return json({ error: 'Tu sesión terminó. Vuelve a entrar.' }, 401);
        }
        if (context.request.method !== 'GET' && !isSameOrigin(context.request)) {
            return json({ error: 'Origen no permitido.' }, 403);
        }
        try {
            return await handler(context);
        } catch (err) {
            if (err instanceof ConflictError) {
                return json(
                    { error: 'El contenido cambió en otra sesión. Recarga para ver la última versión.', conflict: true },
                    409,
                );
            }
            if (err instanceof StoreNotConfigured) {
                return json({ error: 'Falta configurar GITHUB_TOKEN y GITHUB_REPO en el servidor.' }, 503);
            }
            if (err instanceof GitHubError) {
                console.error('[admin]', err.message);
                return json({ error: 'GitHub no aceptó el cambio. Revisa el token e inténtalo de nuevo.' }, 502);
            }
            console.error('[admin]', err);
            return json({ error: 'No se pudo completar la operación.' }, 500);
        }
    };
}
