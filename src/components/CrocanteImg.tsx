import React from 'react';
import classNames from 'classnames';
import { poligonoCrocante, semillaDe } from '../lib/crocante';

interface Props {
    src: string;
    alt?: string;
    /** Texto para la semilla (id del plato, nombre del archivo...). */
    semilla?: string;
    className?: string;
    imgClassName?: string;
    loading?: 'lazy' | 'eager';
}

/**
 * Foto recortada con el borde crocante del patacón. El recorte va en el HTML
 * (polígono en porcentajes), así que se ve igual sin JavaScript.
 */
const CrocanteImg: React.FC<Props> = ({ src, alt = '', semilla, className, imgClassName, loading = 'lazy' }) => {
    if (!src) return null;
    return (
        <div
            className={classNames('crocante relative overflow-hidden', className)}
            style={{ clipPath: poligonoCrocante(semillaDe(semilla ?? src)) }}
        >
            <img
                src={src}
                alt={alt}
                loading={loading}
                decoding="async"
                className={classNames('absolute inset-0 w-full h-full object-cover', imgClassName)}
            />
        </div>
    );
};

export default CrocanteImg;
