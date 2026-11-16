import React, { type PropsWithChildren } from 'react';
import classnames from 'classnames';

interface ButtonLinkProps {
    to?: string;
    /** fill y accent: amarillo patacón; outline: solo contorno. */
    theme?: 'fill' | 'outline' | 'accent';
    /** Se conserva por compatibilidad: el botón ya no lleva flecha. */
    hideArrow?: boolean;
    size?: 'sm' | 'regular' | 'lg';
    className?: string;
    onClick?: () => void;
    type?: 'button' | 'submit';
    /** Abre en otra pestaña (enlaces externos). */
    external?: boolean;
}

/**
 * Botón tipo calcomanía: borde grueso verde monte y sombra dura que se
 * hunde al presionar. La clase `className` va en el envoltorio para que
 * quien lo usa controle el ancho y la posición.
 */
const Btn: React.FC<PropsWithChildren<ButtonLinkProps>> = ({
    to,
    theme = 'outline',
    size = 'regular',
    children,
    className,
    onClick,
    type = 'button',
    external,
}) => {
    const classes = classnames(
        'btn inline-flex items-center justify-center gap-2 whitespace-nowrap font-extrabold leading-none text-monte',
        'border-3 border-monte rounded-[14px] shadow-dura transition-[transform,box-shadow] duration-150',
        'hover:-translate-y-0.5 hover:shadow-dura-lg active:translate-y-1 active:shadow-none',
        'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-monte',
        'motion-reduce:transition-none',
        {
            'bg-sol': theme === 'fill' || theme === 'accent',
            'bg-transparent': theme === 'outline',
            'min-h-[40px] px-3.5 text-base': size === 'sm',
            'min-h-[48px] px-5 text-lg': size === 'regular',
            'min-h-[56px] px-7 text-xl': size === 'lg',
        },
    );

    return (
        <div className={className}>
            {to ? (
                <a
                    href={to}
                    className={classes}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                >
                    {children}
                </a>
            ) : (
                <button type={type} className={classnames(classes, 'w-full')} onClick={onClick}>
                    {children}
                </button>
            )}
        </div>
    );
};

export default Btn;
