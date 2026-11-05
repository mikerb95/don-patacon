import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { openingHoursSpecification, openStatus, summarizeHours } from '../src/lib/hours.ts';
import { businessSchema, menuSchema, pagesSchema } from '../src/lib/schema.ts';

const load = (name: string) => JSON.parse(readFileSync(`content/${name}.json`, 'utf8'));

test('el contenido inicial cumple los esquemas', () => {
    businessSchema.parse(load('business'));
    menuSchema.parse(load('menu'));
    pagesSchema.parse(load('pages'));
});

test('esquema: bloquea enlaces peligrosos, rutas de imagen y categorías inexistentes', () => {
    const business = load('business');
    assert.equal(businessSchema.safeParse({ ...business, social: { ...business.social, x: 'javascript:alert(1)' } }).success, false);
    const dish = { id: 'a', title: 'A', description: '', price: 1000, image: '', categoryId: 'no-existe', available: true, specialDays: [] };
    assert.equal(menuSchema.safeParse({ categories: [], dishes: [dish] }).success, false);
    const category = { id: 'c', title: 'C', description: '', image: '../../etc/passwd' };
    assert.equal(menuSchema.safeParse({ categories: [category], dishes: [] }).success, false);
});

test('esquema: normaliza el WhatsApp colombiano', () => {
    const parsed = businessSchema.parse({ ...load('business'), whatsapp: '300 123 4567' });
    assert.equal(parsed.whatsapp, '573001234567');
});

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;
const hours = DAYS.map((day) =>
    day === 'SUN' ? { day, open: '', close: '' } : { day, open: '12:00', close: '20:00' },
);
// 2026-11-05 es jueves. Bogotá es UTC-5.
const at = (iso: string) => new Date(iso);

test('horario: abierto, por abrir y cerrado en hora de Bogotá', () => {
    assert.deepEqual(openStatus(hours, at('2026-11-05T20:00:00Z')), { open: true, label: 'Abierto hasta las 20:00' });
    assert.deepEqual(openStatus(hours, at('2026-11-05T15:00:00Z')), { open: false, label: 'Abrimos hoy a las 12:00' });
    assert.deepEqual(openStatus(hours, at('2026-11-06T02:00:00Z')), { open: false, label: 'Abrimos mañana a las 12:00' });
    // Sábado de noche: el domingo cierra, abre el lunes.
    assert.deepEqual(openStatus(hours, at('2026-11-08T02:00:00Z')), { open: false, label: 'Abrimos el lun a las 12:00' });
});

test('horario: resumen y datos para Google; sin datos no muestra nada', () => {
    assert.deepEqual(summarizeHours(hours), ['Lun a Sáb 12:00 a 20:00', 'Dom cerrado']);
    assert.equal(openingHoursSpecification(hours).length, 6);
    const empty = DAYS.map((day) => ({ day, open: '', close: '' }));
    assert.deepEqual(summarizeHours(empty), []);
    assert.equal(openStatus(empty), null);
});
