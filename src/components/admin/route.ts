/** Pantalla actual del panel, guardada en la URL: "#carta/entradas/plato/arepa?vista=inicio". */
export type Tab = 'carta' | 'negocio' | 'paginas' | 'historial';
export const TAB_IDS: Tab[] = ['carta', 'negocio', 'paginas', 'historial'];

export const PREVIEW_PAGES = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'carta', label: 'Carta' },
    { id: 'pedidos', label: 'Pedidos' },
    { id: 'contacto', label: 'Contacto' },
    { id: 'nosotros', label: 'Nosotros' },
    { id: 'legal', label: 'Legal' },
    { id: 'privacidad', label: 'Privacidad' },
] as const;
export type PreviewPage = (typeof PREVIEW_PAGES)[number]['id'];

export interface SheetRoute {
    type: 'plato' | 'categoria';
    id: string;
}

export interface Route {
    tab: Tab;
    category?: string;
    sheet?: SheetRoute;
    preview?: PreviewPage;
}

export function parseRoute(hash: string): Route {
    const [path, query = ''] = hash.replace(/^#/, '').split('?');
    const [tabPart, category, sheetType, sheetId] = path.split('/').map((p) => {
        try {
            return decodeURIComponent(p);
        } catch {
            return '';
        }
    });
    const tab = TAB_IDS.includes(tabPart as Tab) ? (tabPart as Tab) : 'carta';
    const route: Route = { tab };
    if (tabPart === 'carta' && category) {
        route.category = category;
        if ((sheetType === 'plato' || sheetType === 'categoria') && sheetId) {
            route.sheet = { type: sheetType, id: sheetId };
        }
    }
    const preview = new URLSearchParams(query).get('vista');
    if (PREVIEW_PAGES.some((p) => p.id === preview)) route.preview = preview as PreviewPage;
    return route;
}

export function buildRoute(route: Route): string {
    const parts: string[] = [route.tab];
    if (route.tab === 'carta' && route.category) {
        parts.push(encodeURIComponent(route.category));
        if (route.sheet) parts.push(route.sheet.type, encodeURIComponent(route.sheet.id));
    }
    return `#${parts.join('/')}${route.preview ? `?vista=${route.preview}` : ''}`;
}

/** Convierte la ruta de un error ("menu.dishes.3.title") en la pantalla donde se corrige. */
export function routeForIssue(
    path: string,
    menu: { categories: { id: string }[]; dishes: { id: string; categoryId: string }[] },
): Route {
    const [doc, section, index] = path.split('.');
    if (doc === 'business') return { tab: 'negocio' };
    if (doc === 'pages') return { tab: 'paginas' };
    const i = Number(index);
    if (section === 'dishes' && menu.dishes[i]) {
        const dish = menu.dishes[i];
        const known = menu.categories.some((c) => c.id === dish.categoryId);
        return {
            tab: 'carta',
            category: known ? dish.categoryId : menu.categories[0]?.id,
            sheet: { type: 'plato', id: dish.id },
        };
    }
    if (section === 'categories' && menu.categories[i]) {
        const { id } = menu.categories[i];
        return { tab: 'carta', category: id, sheet: { type: 'categoria', id } };
    }
    return { tab: 'carta' };
}
