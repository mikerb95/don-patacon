import React from 'react';

/** Hoja de plátano ilustrada, en el mismo trazo que la mascota. */
const Hoja: React.FC<{ className?: string; color: string }> = ({ className, color }) => (
    <svg viewBox="0 0 100 240" className={className} aria-hidden="true">
        <path d="M50 4 C 92 52, 98 150, 52 236 C 6 150, 10 52, 50 4 Z" fill={color} stroke="#0E3B1F" strokeWidth="5" strokeLinejoin="round" />
        <g fill="none" stroke="#0E3B1F" strokeWidth="3.5" strokeLinecap="round">
            <path d="M50 14 C 52 90, 52 160, 52 228" />
            <path d="M51 60 C 64 52, 74 50, 82 52" /><path d="M51 96 C 66 86, 78 84, 88 88" />
            <path d="M51 134 C 66 124, 78 124, 88 128" /><path d="M52 172 C 64 164, 74 164, 80 168" />
            <path d="M51 70 C 38 62, 28 60, 18 64" /><path d="M51 108 C 36 98, 24 98, 14 104" />
            <path d="M52 146 C 38 138, 26 138, 16 144" /><path d="M52 184 C 42 178, 32 178, 24 182" />
        </g>
    </svg>
);

/**
 * Decoración del encabezado de las páginas internas: dos hojas en las esquinas
 * superiores, como si el título asomara entre la selva. Reemplaza el arco con
 * estrella de la plantilla anterior.
 */
const HojasDecor: React.FC = () => (
    <div className="absolute inset-x-0 top-0 h-[420px] overflow-hidden pointer-events-none -z-0" aria-hidden="true">
        <Hoja color="#2E8B2E" className="absolute -left-10 -top-16 w-24 rotate-[-30deg] lg:w-36 lg:left-[4%]" />
        <Hoja color="#A8D13B" className="absolute -right-8 top-6 w-20 rotate-[38deg] lg:w-28 lg:right-[5%]" />
    </div>
);

export default HojasDecor;
