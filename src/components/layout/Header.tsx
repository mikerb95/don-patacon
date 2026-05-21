import React, { useEffect, useState } from 'react';
import MenuIcon from '../../assets/icons/menu.svg?raw';
import XIcon from '../../assets/icons/x.svg?raw';
import Logo from '../../assets/icons/logo.svg?raw';
import classNames from 'classnames';
import Btn from '../Btn';

const Header: React.FC = () => {
    const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);

    const nav = [
        { label: 'Inicio', href: '/' },
        { label: 'Carta', href: '/menu' },
        { label: 'Eventos', href: '/events' },
        { label: 'Reservas', href: '/reservation' },
    ];

    useEffect(() => {
        if (!showMobileMenu) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowMobileMenu(false);
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [showMobileMenu]);

    const closeMenu = () => setShowMobileMenu(false);

    return (
        <header className="relative z-50">
            <div className="relative z-10 container">
                <nav className="relative flex items-center justify-between pt-6 lg:pt-8">
                    <a
                        href="/"
                        className="flex md:flex-1"
                        aria-label="Página principal"
                    >
                        <div
                            dangerouslySetInnerHTML={{ __html: Logo }}
                            className={classNames('w-[60px] md:w-[101px]', {
                                'max-md:invert': showMobileMenu,
                            })}
                            aria-hidden="true"
                        />
                    </a>
                    <ul
                        className={classNames(
                            'flex flex-col gap-4 max-md:absolute max-md:left-0 max-md:-bottom-9 max-md:translate-y-full max-md:w-full max-md:px-4 md:flex-row md:flex-1 md:justify-center lg:gap-8',
                            {
                                'max-md:hidden': !showMobileMenu,
                            },
                        )}
                    >
                        {nav.map((item, index) => (
                            <li key={index}>
                                <a
                                    href={item.href}
                                    onClick={closeMenu}
                                    className="text-lg leading-none tracking-[-0.41px] uppercase md:text-sm"
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                        <li>
                            <a
                                href="/contact"
                                onClick={closeMenu}
                                className="text-lg leading-none tracking-[-0.41px] uppercase md:hidden"
                            >
                                Contacto
                            </a>
                        </li>
                    </ul>
                    <div className="flex justify-end max-md:hidden md:flex-1">
                        <Btn to="/contact" className="uppercase">
                            <span>Contacto</span>
                        </Btn>
                    </div>
                    <button
                        type="button"
                        className="flex md:hidden"
                        aria-label={
                            showMobileMenu ? 'Cerrar menú' : 'Abrir menú'
                        }
                        aria-expanded={showMobileMenu}
                        onClick={() => setShowMobileMenu((prev) => !prev)}
                    >
                        {showMobileMenu ? (
                            <div
                                dangerouslySetInnerHTML={{ __html: XIcon }}
                                className="w-6 h-6"
                                aria-hidden="true"
                            />
                        ) : (
                            <div
                                dangerouslySetInnerHTML={{ __html: MenuIcon }}
                                className="w-6 h-6"
                                aria-hidden="true"
                            />
                        )}
                    </button>
                </nav>
            </div>
            {showMobileMenu && (
                <button
                    type="button"
                    aria-label="Cerrar menú"
                    onClick={closeMenu}
                    className="fixed top-0 left-0 w-screen h-screen bg-appAccent md:hidden -z-0"
                />
            )}
        </header>
    );
};

export default Header;
