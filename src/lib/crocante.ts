/**
 * Borde crocante: la forma de un patacón aplastado, recurso común de la marca
 * (fotos, sello del logo, escena de la portada). Se calcula en el servidor con
 * una semilla para que cada forma sea irregular pero idéntica en cada visita.
 * Sin DOM: lo usan los componentes y las pruebas.
 */

/** Generador pseudoaleatorio (mulberry32) con semilla. */
export function rng(semilla: number): () => number {
    let s = semilla | 0;
    return () => {
        s = (s + 0x6d2b79f5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Puntos del contorno en un círculo unitario: óvalo deformado en baja
 * frecuencia (la forma aplastada) y un serrucho fino irregular (el borde frito).
 * El radio queda entre 1 - serrucho - 0.11 y 1.11.
 */
export function contorno(semilla: number, puntos: number, serrucho: number): [number, number][] {
    const r = rng(semilla);
    const f = [r() * Math.PI * 2, r() * Math.PI * 2, r() * Math.PI * 2];
    const pts: [number, number][] = [];
    for (let i = 0; i < puntos; i++) {
        const a = (i / puntos) * Math.PI * 2;
        const base =
            1 + 0.05 * Math.sin(2 * a + f[0]) + 0.035 * Math.sin(3 * a + f[1]) + 0.02 * Math.sin(5 * a + f[2]);
        const m = base - serrucho * (i % 2 ? r() : 0.3 * r());
        pts.push([Math.cos(a) * m, Math.sin(a) * m]);
    }
    return pts;
}

/** Ruta SVG cerrada centrada en (cx, cy) con radios rx, ry. */
export function rutaCrocante(
    semilla: number,
    { cx = 0.5, cy = 0.5, rx = 0.45, ry = 0.45, puntos = 72, serrucho = 0.055 } = {},
): string {
    // En unidades de caja (0 a 1) hacen falta 4 decimales; con un solo
    // decimal el borde sale escalonado.
    const d = rx < 2 ? 4 : 1;
    const pts = contorno(semilla, puntos, serrucho);
    return 'M' + pts.map(([x, y]) => `${(cx + x * rx).toFixed(d)} ${(cy + y * ry).toFixed(d)}`).join('L') + 'Z';
}

/** Semilla estable a partir de un texto (p. ej. el id de un plato). */
export function semillaDe(texto: string): number {
    let h = 2166136261;
    for (let i = 0; i < texto.length; i++) h = Math.imul(h ^ texto.charCodeAt(i), 16777619);
    return h >>> 0;
}

/** Polígono CSS para un borde superior mordido (franjas oscuras). */
export function bordeMordido(semilla: number, paso = 2): string {
    const r = rng(semilla);
    const pts: string[] = [];
    for (let x = 0; x <= 100; x += paso) pts.push(`${x}% ${(0.6 + r() * 1.8).toFixed(2)}%`);
    return `polygon(${pts.join(',')},100% 100%,0 100%)`;
}
