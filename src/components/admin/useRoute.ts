import { useCallback, useEffect, useState } from 'react';
import { buildRoute, parseRoute, type Route } from './route';

/** Enlaza la pantalla con el historial del navegador: "atrás" y recargar funcionan. */
export function useRoute() {
    const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));

    useEffect(() => {
        const sync = () => setRoute(parseRoute(window.location.hash));
        window.addEventListener('popstate', sync);
        window.addEventListener('hashchange', sync);
        return () => {
            window.removeEventListener('popstate', sync);
            window.removeEventListener('hashchange', sync);
        };
    }, []);

    const navigate = useCallback((next: Route, options?: { replace?: boolean }) => {
        const url = buildRoute(next);
        if (options?.replace) window.history.replaceState({ inApp: window.history.state?.inApp ?? false }, '', url);
        else window.history.pushState({ inApp: true }, '', url);
        setRoute(next);
    }, []);

    /** Vuelve atrás si la capa se abrió desde el panel; si llegó por enlace directo, va a `fallback`. */
    const goBack = useCallback((fallback: Route) => {
        if (window.history.state?.inApp) window.history.back();
        else navigate(fallback, { replace: true });
    }, [navigate]);

    return { route, navigate, goBack };
}
