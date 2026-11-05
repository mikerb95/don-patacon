import type { APIRoute } from 'astro';
import { COOKIE_NAME } from '../../../lib/admin/config';
import { isSameOrigin } from '../../../lib/admin/guard';

export const prerender = false;

export const POST: APIRoute = ({ cookies, redirect, request }) => {
    if (!isSameOrigin(request)) return new Response('Origen no permitido', { status: 403 });
    cookies.delete(COOKIE_NAME, { path: '/' });
    return redirect('/admin/login', 303);
};
