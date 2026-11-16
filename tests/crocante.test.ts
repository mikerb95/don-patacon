import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bordeMordido, contorno, poligonoCrocante, rutaCrocante, semillaDe } from '../src/lib/crocante.ts';

test('crocante: la misma semilla da la misma forma', () => {
    assert.equal(rutaCrocante(7), rutaCrocante(7));
    assert.notEqual(rutaCrocante(7), rutaCrocante(8));
    assert.equal(semillaDe('don-patacon'), semillaDe('don-patacon'));
});

test('crocante: el contorno no se sale de la caja', () => {
    for (let s = 0; s < 50; s++) {
        for (const [x, y] of contorno(s, 72, 0.055)) {
            const r = Math.hypot(x, y);
            assert.ok(r > 0.8 && r < 1.12, `radio ${r} con semilla ${s}`);
        }
    }
    // Con radio 0.45 el polígono queda dentro de 0..100 %.
    const valores = poligonoCrocante(3).match(/[\d.]+%/g)!.map(parseFloat);
    assert.ok(valores.every((v) => v >= 0 && v <= 100));
});

test('crocante: en unidades de caja usa 4 decimales (sin escalones)', () => {
    const primero = rutaCrocante(1).slice(1).split('L')[0];
    assert.match(primero, /^\d\.\d{4} \d\.\d{4}$/);
    assert.match(rutaCrocante(1, { cx: 300, cy: 300, rx: 150, ry: 100 }).slice(1).split('L')[0], /^\d+\.\d \d+\.\d$/);
});

test('crocante: el borde mordido cierra por abajo', () => {
    const p = bordeMordido(7);
    assert.ok(p.startsWith('polygon(0% '));
    assert.ok(p.endsWith('100% 100%,0 100%)'));
});
