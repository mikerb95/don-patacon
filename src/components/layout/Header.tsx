import React, { useEffect, useState } from 'react';
import MenuIcon from '../../assets/icons/menu.svg?raw';
import XIcon from '../../assets/icons/x.svg?raw';
import classNames from 'classnames';
import Btn from '../Btn';
import Logo from '../Logo';

const NAV = [
    { label: 'Carta', href: '/carta' },
    { label: 'Pedidos', href: '/pedidos' },
    { label: 'Nosotros', href: '/nosotros' },
    { label: 'Contacto', href: '/contacto' },
];

/** La acción principal del sitio es llegar al local. */
const LLEGAR = '/#como-llegar';

const Header: React.FC = () => {
    const [abierto, setAbierto] = useState(false);

    useEffect(() => {
        if (!abierto) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setAbierto(false);
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [abierto]);

    const cerrar = () => setAbierto(false);

    return (
        <header className="relative z-50">
            <div className="container">
                <nav className="flex items-center justify-between gap-4 py-4 lg:py-5" aria-label="Principal">
                    <a href="/" aria-label="Don Patacón, inicio" className="rounded-xl">
                        <Logo />
                    </a>

                    <ul className="flex items-center gap-7 font-bold text-lg max-md:hidden">
                        {NAV.map((item) => (
                            <li key={item.href}>
                                <a
                                    href={item.href}
                                    className="underline-offset-[6px] decoration-sol decoration-[3px] hover:underline focus-visible:underline"
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>

                    <div className="flex items-center gap-3">
                        <Btn to={LLEGAR} theme="accent" size="sm" className="max-[380px]:hidden">
                            Cómo llegar
                        </Btn>
                        <button
                            type="button"
                            className="grid place-items-center w-11 h-11 rounded-xl border-3 border-monte bg-papel shadow-dura-sm md:hidden"
                            aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
                            aria-expanded={abierto}
                            aria-controls="menu-movil"
                            onClick={() => setAbierto((v) => !v)}
                        >
                            <span
                                dangerouslySetInnerHTML={{ __html: abierto ? XIcon : MenuIcon }}
                                className="w-6 h-6"
                                aria-hidden="true"
                            />
                        </button>
                    </div>
                </nav>
            </div>

            {/* Menú del celular: lámina amarilla con los enlaces grandes. */}
            <div
                id="menu-movil"
                className={classNames(
                    'fixed inset-x-0 top-[76px] bottom-0 bg-sol border-t-3 border-monte md:hidden',
                    { hidden: !abierto },
                )}
            >
                <ul className="container grid gap-2 pt-8">
                    {[{ label: 'Inicio', href: '/' }, ...NAV, { label: 'Cómo llegar', href: LLEGAR }].map((item) => (
                        <li key={item.href}>
                            <a href={item.href} onClick={cerrar} className="block py-2 font-display text-4xl">
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </header>
    );
};

export default Header;
