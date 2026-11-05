/**
 * Encabezados de seguridad del panel. La autenticación NO está aquí: cada ruta
 * la exige por sí misma (`adminRoute`, `isAuthenticated`), para que un truco con
 * la URL no pueda saltársela.
 */
import { defineMiddleware } from 'astro:middleware';

const CSP = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "connect-src 'self'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
].join('; ');

export const onRequest = defineMiddleware(async (context, next) => {
    let path = context.url.pathname.toLowerCase();
    try {
        path = decodeURIComponent(path);
    } catch {
        // URL mal formada: se trata tal cual.
    }
    const response = await next();
    if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
        response.headers.set('Cache-Control', 'no-store');
        response.headers.set('X-Robots-Tag', 'noindex, nofollow');
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('Referrer-Policy', 'same-origin');
        response.headers.set('Content-Security-Policy', CSP);
    }
    return response;
});
