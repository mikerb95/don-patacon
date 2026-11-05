import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { rewriteMediaForPreview, validateDocs } from '../src/lib/admin/validate.ts';
import { buildRoute, parseRoute, routeForIssue } from '../src/components/admin/route.ts';

const load = (name: string) => JSON.parse(readFileSync(`content/${name}.json`, 'utf8'));

test('ruta: ida y vuelta entre la URL y la pantalla', () => {
    const routes = [
        { tab: 'negocio' },
        { tab: 'carta', category: 'entradas' },
        { tab: 'carta', category: 'entradas', sheet: { type: 'plato', id: 'arepa-2' } },
        { tab: 'carta', category: 'entradas', preview: 'inicio' },
    ] as const;
    for (const route of routes) assert.deepEqual(parseRoute(buildRoute(route)), route);
});

test('ruta: lo desconocido cae en una pantalla segura', () => {
    assert.deepEqual(parseRoute(''), { tab: 'carta' });
    assert.deepEqual(parseRoute('#nada/x'), { tab: 'carta' });
    assert.deepEqual(parseRoute('#negocio?vista=otra'), { tab: 'negocio' });
    assert.deepEqual(parseRoute('#carta/%E0%A4%A'), { tab: 'carta' });
});

test('errores: indican el campo exacto, en español', () => {
    const business = load('business');
    const { issues } = validateDocs({
        business: { ...business, email: 'noescorreo', social: { ...business.social, x: 'javascript:alert(1)' } },
        menu: {
            categories: [{ id: 'c', title: 'C', description: '', image: '' }],
            dishes: [{ id: 'a', title: '', description: '', price: 1000, image: '', categoryId: 'c', available: true, specialDays: [] }],
        },
    });
    assert.deepEqual(issues.map((i) => i.path).sort(), ['business.email', 'business.social.x', 'menu.dishes.0.title']);
    assert.ok(issues.every((i) => !/invalid|too|expected/i.test(i.message)), JSON.stringify(issues));
});

test('errores: cada uno lleva a la pantalla donde se corrige', () => {
    const menu = {
        categories: [{ id: 'c' }],
        dishes: [{ id: 'a', categoryId: 'c' }, { id: 'b', categoryId: 'no-existe' }],
    };
    assert.deepEqual(routeForIssue('business.social.x', menu), { tab: 'negocio' });
    assert.deepEqual(routeForIssue('pages.home.heroTitle', menu), { tab: 'paginas' });
    assert.deepEqual(routeForIssue('menu.dishes.0.title', menu), { tab: 'carta', category: 'c', sheet: { type: 'plato', id: 'a' } });
    assert.deepEqual(routeForIssue('menu.dishes.1.categoryId', menu), { tab: 'carta', category: 'c', sheet: { type: 'plato', id: 'b' } });
    assert.deepEqual(routeForIssue('menu.categories.0.title', menu), { tab: 'carta', category: 'c', sheet: { type: 'categoria', id: 'c' } });
});

test('vista previa: las imágenes se piden al panel y el resto no cambia', () => {
    const out = rewriteMediaForPreview({ a: '/media/x.webp', b: ['/media/y.jpg', 'texto /media/'], c: 5, d: '' });
    assert.deepEqual(out, { a: '/api/admin/media/x.webp', b: ['/api/admin/media/y.jpg', 'texto /media/'], c: 5, d: '' });
});
