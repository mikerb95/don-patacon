import React from 'react';
import type { Business } from '../../lib/schema';
import { summarizeHours } from '../../lib/hours';
import { bordeMordido } from '../../lib/crocante';
import Logo from '../Logo';

interface Props {
    business: Business;
    /** Sin secciones publicadas no se enlaza /legal. */
    hasTerms: boolean;
}

const Footer: React.FC<Props> = ({ business, hasTerms }) => {
    const hours = summarizeHours(business.hours);
    const social = [
        { label: 'Instagram', href: business.social.instagram },
        { label: 'Facebook', href: business.social.facebook },
        { label: 'X', href: business.social.x },
    ].filter((item) => !!item.href);

    const reviews = business.reviewsUrl
        ? [{ label: 'Reseñas en Google', href: business.reviewsUrl }]
        : [];

    const contact = [
        business.phone && {
            label: business.phone,
            href: `tel:${business.phone.replace(/[^\d+]/g, '')}`,
        },
        business.email && {
            label: business.email,
            href: `mailto:${business.email}`,
        },
    ].filter(Boolean) as { label: string; href: string }[];

    const legal = [
        ...(hasTerms ? [{ label: 'Términos y condiciones', href: '/legal' }] : []),
        { label: 'Política de privacidad', href: '/privacidad' },
    ];

    const nav = [
        social.length + reviews.length > 0 && { title: 'Síguenos', items: [...social, ...reviews] },
        contact.length > 0 && { title: 'Contacto', items: contact },
        { title: 'Legal', items: legal },
    ].filter(Boolean) as { title: string; items: { label: string; href: string }[] }[];

    const addressLines = [
        business.mallLocation,
        business.address.line1,
        business.address.line2,
        [business.address.city, business.address.country]
            .filter(Boolean)
            .join(', '),
    ].filter(Boolean);

    return (
        <footer
            className="relative bg-hoja text-pulpa pt-16 pb-28 md:pb-14"
            style={{ clipPath: bordeMordido(11) }}
        >
            <div className="container">
                <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:gap-16">
                    <div className="grid gap-4 justify-items-center text-center md:justify-items-start md:text-left">
                        <a href="/" aria-label="Don Patacón, inicio" className="rounded-xl">
                            <Logo claro size="md" />
                        </a>
                        <p className="font-display text-2xl text-sol">Más crujiente y sabrosón</p>
                        <address className="not-italic font-semibold leading-snug">
                            {addressLines.map((line, i) => (
                                <React.Fragment key={i}>
                                    {line}
                                    {i < addressLines.length - 1 && <br />}
                                </React.Fragment>
                            ))}
                            {hours.length > 0 && (
                                <span className="block mt-2">
                                    {hours.map((line) => (
                                        <span key={line} className="block">{line}</span>
                                    ))}
                                </span>
                            )}
                        </address>
                    </div>
                    <nav className="grid grid-cols-2 gap-x-12 gap-y-8 justify-self-center md:justify-self-end lg:grid-cols-[repeat(3,auto)]" aria-label="Pie de página">
                        {nav.map((col, index) => (
                            <div key={index} className="footer--nav-col">
                                <p className="font-extrabold text-sol mb-2">{col.title}</p>
                                <ul className="grid gap-1.5">
                                    {col.items.map((item, itemIndex) => (
                                        <li key={itemIndex}>
                                            <a
                                                href={item.href}
                                                target={item.href.startsWith('http') ? '_blank' : undefined}
                                                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                                className="font-semibold underline-offset-4 decoration-sol decoration-2 hover:underline focus-visible:underline"
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
                <div className="flex flex-col items-center gap-3 mt-12 pt-6 border-t-2 border-pulpa/25 text-sm font-semibold md:flex-row md:justify-between">
                    <div className="footer--origin flex items-center gap-2 md:order-last">
                        <svg aria-hidden="true" viewBox="0 0 6 4" className="w-[18px] h-3 rounded-[2px] overflow-hidden">
                            <rect width="6" height="2" fill="#FCD116" />
                            <rect y="2" width="6" height="1" fill="#003893" />
                            <rect y="3" width="6" height="1" fill="#CE1126" />
                        </svg>
                        Producto 100% colombiano
                    </div>
                    <div>
                        &copy; {new Date().getFullYear()} {business.name}. Todos los derechos reservados.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
