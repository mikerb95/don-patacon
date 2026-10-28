const copFormatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
});

/** Precio en pesos colombianos: 32000 → "$ 32.000". */
export function formatPrice(price: number | string): string {
    const value = typeof price === 'number' ? price : Number(price);
    return Number.isFinite(value) ? copFormatter.format(value) : String(price);
}
