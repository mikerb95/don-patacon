import React from 'react';
import { siteConfig } from '../../config/site';

const Footer: React.FC = () => {
    const social = [
        { label: 'Instagram', href: siteConfig.social.instagram },
        { label: 'Facebook', href: siteConfig.social.facebook },
        { label: 'X', href: siteConfig.social.x },
    ].filter((item) => !!item.href);

    const contact = [
        siteConfig.phone.display && {
            label: siteConfig.phone.display,
            href: `tel:${siteConfig.phone.e164}`,
        },
        siteConfig.email && {
            label: siteConfig.email,
            href: `mailto:${siteConfig.email}`,
        },
    ].filter(Boolean) as { label: string; href: string }[];

    const legal = [
        { label: 'Términos y condiciones', href: '/legal/terms' },
        { label: 'Política de privacidad', href: '/legal/privacy' },
    ];

    const nav = [
        social.length > 0 && { title: 'Síguenos', items: social },
        contact.length > 0 && { title: 'Contacto', items: contact },
        { title: 'Legal', items: legal },
    ].filter(Boolean) as { title: string; items: { label: string; href: string }[] }[];

    const addressLines = [
        siteConfig.address.line1,
        siteConfig.address.line2,
        [siteConfig.address.city, siteConfig.address.country]
            .filter(Boolean)
            .join(', '),
    ].filter(Boolean);

    return (
        <footer className="bg-appText py-10 md:py-12">
            <div className="container">
                <div className="md:grid md:grid-cols-[auto,1fr]">
                    <address className="not-italic text-sm leading-[1.3] uppercase tracking-[-0.41px] text-appGray-500 text-center mb-8 md:text-base md:leading-[1.3] md:text-left">
                        {addressLines.map((line, i) => (
                            <React.Fragment key={i}>
                                {line}
                                {i < addressLines.length - 1 && <br />}
                            </React.Fragment>
                        ))}
                        {siteConfig.hours && (
                            <>
                                <br />
                                <span className="block mt-2">{siteConfig.hours}</span>
                            </>
                        )}
                    </address>
                    <nav className="grid grid-cols-[repeat(2,auto)] justify-between gap-x-12 gap-y-8 mx-auto mb-10 max-md:max-w-[225px] md:mb-20 lg:grid-cols-[repeat(3,auto)] lg:gap-20 xl:gap-[128px]">
                        {nav.map((col, index) => (
                            <div key={index} className="footer--nav-col">
                                <div className="text-sm leading-none text-white mb-3.5 md:text-lg md:leading-none">
                                    {col.title}
                                </div>
                                <ul className="grid grid-cols-1 gap-3">
                                    {col.items.map((item, itemIndex) => (
                                        <li
                                            key={itemIndex}
                                            className="relative leading-none text-[#9c9090] max-w-max"
                                        >
                                            <a
                                                href={item.href}
                                                target={
                                                    item.href.startsWith('http')
                                                        ? '_blank'
                                                        : '_self'
                                                }
                                                rel={
                                                    item.href.startsWith('http')
                                                        ? 'noopener noreferrer'
                                                        : undefined
                                                }
                                                className="hover:underline focus-visible:underline"
                                            >
                                                {item.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </div>
                <div className="flex flex-col items-center text-center md:flex-row md:justify-between">
                    <div className="text-xs leading-none text-appGray-500 md:text-base md:leading-none md:text-appBody">
                        &copy; {new Date().getFullYear()} {siteConfig.name}. Todos
                        los derechos reservados.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
