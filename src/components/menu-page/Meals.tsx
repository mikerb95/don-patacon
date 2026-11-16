import React, { useEffect, useMemo, useState } from 'react';
import HojasDecor from '../HojasDecor';
import classNames from 'classnames';
import CrocanteImg from '../CrocanteImg';
import Prose from '../Prose';
import { formatPrice } from '../../utils/format';
import type { Category, Dish } from '../../lib/schema';

interface Props {
    title: string;
    categories: Category[];
    dishes: Dish[];
}

const MenuMeals: React.FC<Props> = ({ title, categories, dishes }) => {
    const [activeId, setActiveId] = useState(categories[0]?.id ?? '');

    // El home enlaza a /carta?s=<categoría>: abrir esa categoría si existe.
    useEffect(() => {
        const s = new URLSearchParams(window.location.search).get('s');
        if (s && categories.some((c) => c.id === s)) setActiveId(s);
    }, [categories]);

    const active = categories.find((c) => c.id === activeId);
    const filtered = useMemo(
        () => dishes.filter((d) => d.categoryId === activeId),
        [activeId, dishes],
    );

    return (
        <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28">
            <HojasDecor />
            <div className="container relative">
                <div className="grid justify-items-center gap-6 text-center mb-12 lg:mb-16">
                    <h1 className="font-display text-[clamp(2.6rem,1.8rem+3vw,4.2rem)] leading-none [text-shadow:.05em_.05em_0_#F5B41F]">
                        {title}
                    </h1>
                    <div className="flex flex-wrap justify-center gap-3" role="group" aria-label="Categorías">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                aria-pressed={category.id === activeId}
                                className={classNames(
                                    'min-h-[44px] px-5 rounded-[14px] border-3 border-monte font-extrabold text-lg shadow-dura-sm transition-colors',
                                    category.id === activeId ? 'bg-sol' : 'bg-transparent hover:bg-papel',
                                )}
                                onClick={() => setActiveId(category.id)}
                            >
                                {category.title}
                            </button>
                        ))}
                    </div>
                    <Prose text={active?.description ?? ''} className="text-xl font-bold max-w-[46ch]" />
                </div>

                {filtered.length > 0 ? (
                    <ul className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((item) => (
                            <li key={item.id} className="grid content-start gap-3">
                                {item.image && (
                                    <CrocanteImg
                                        src={item.image}
                                        alt={item.title}
                                        semilla={item.id}
                                        className="aspect-[4/3]"
                                        imgClassName={classNames({ grayscale: !item.available })}
                                    />
                                )}
                                <h2 className="font-display text-[1.9rem] leading-[1.05]">{item.title}</h2>
                                <Prose text={item.description} className="text-lg leading-snug" />
                                {item.plantainChoice && item.available && (
                                    <p className="meals--plantain font-bold text-hoja">Verde o maduro, como prefieras</p>
                                )}
                                {item.available ? (
                                    <span className="justify-self-start mt-1 font-display text-2xl bg-sol border-3 border-monte rounded-[10px] px-3 py-0.5 shadow-dura-sm -rotate-3">
                                        {formatPrice(item.price)}
                                    </span>
                                ) : (
                                    <span className="justify-self-start mt-1 font-extrabold text-lg bg-appGray-100 border-3 border-monte rounded-[10px] px-3 py-1">
                                        Agotado por hoy
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-xl font-bold my-20">Pronto publicaremos los platos de esta categoría.</p>
                )}
            </div>
        </section>
    );
};

export default MenuMeals;
