import React from 'react';
import classNames from 'classnames';
import { rutaCrocante } from '../lib/crocante';

// Sello: patacón con borde crocante y Don Patacón asomado por detrás.
const DISCO = rutaCrocante(21, { cx: 50, cy: 58, rx: 44, ry: 36, puntos: 44, serrucho: 0.08 });

interface SelloProps {
    className?: string;
    /** Contorno claro para fondos oscuros. */
    claro?: boolean;
}

export const Sello: React.FC<SelloProps> = ({ className, claro }) => (
    <span className={classNames('relative block aspect-square', className)} aria-hidden="true">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible">
            <path d={DISCO} fill="#F5B41F" stroke={claro ? '#FFF3C4' : '#0E3B1F'} strokeWidth="5" strokeLinejoin="round" />
        </svg>
        <img src="/mascota.svg" alt="" className="absolute w-[56%] left-[22%] -top-[18%]" width="56" height="79" />
    </span>
);

interface LogoProps {
    className?: string;
    claro?: boolean;
    /** Tamaño de la palabra "Patacón"; el sello escala con ella. */
    size?: 'sm' | 'md' | 'lg';
}

/** Logo horizontal: sello + "Don Patacón". */
const Logo: React.FC<LogoProps> = ({ className, claro, size = 'sm' }) => (
    <span className={classNames('inline-flex items-center gap-2.5', className)}>
        <Sello
            claro={claro}
            className={classNames({ 'w-11': size === 'sm', 'w-16': size === 'md', 'w-24': size === 'lg' })}
        />
        <span className="grid leading-[.85]">
            <span
                className={classNames('font-extrabold', claro ? 'text-biche' : 'text-hoja', {
                    'text-sm': size === 'sm',
                    'text-lg': size === 'md',
                    'text-2xl': size === 'lg',
                })}
            >
                Don
            </span>
            <span
                className={classNames('font-display whitespace-nowrap', claro ? 'text-sol' : 'text-monte', {
                    'text-[1.45rem]': size === 'sm',
                    'text-[2.2rem]': size === 'md',
                    'text-[3.2rem]': size === 'lg',
                })}
                style={{ textShadow: `.06em .06em 0 ${claro ? '#2E8B2E' : '#F5B41F'}` }}
            >
                Patacón
            </span>
        </span>
    </span>
);

export default Logo;
