import React from 'react';

interface Props {
    src: string;
    alt?: string;
    className?: string;
}

/** Imagen subida desde el panel; sin ruta no pinta nada. */
const MediaImage: React.FC<Props> = ({ src, alt = '', className }) =>
    src ? <img src={src} alt={alt} loading="lazy" decoding="async" className={className} /> : null;

export default MediaImage;
