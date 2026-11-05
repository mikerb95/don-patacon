import React, { useEffect, useMemo, useState } from 'react';
import ArchWithStar from '../ArchWithStar';
import classNames from 'classnames';
import MediaImage from '../MediaImage';
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

    // El home enlaza a /menu?s=<categoría>: abrir esa categoría si existe.
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
        <section className="pt-[108px] pb-10 overflow-hidden md:pb-20 lg:pt-[218px] lg:pb-[120px]">
            <div className="container max-w-[1198px]">
                <ArchWithStar />
                <div className="relative px-4 max-w-[400px] mx-auto lg:max-w-[745px] xl:px-0">
                    <h1 className="text-xl leading-none font-Gloock uppercase text-center mb-8 lg:text-5xl lg:leading-none">
                        {title}
                    </h1>
                    <div className="mb-10 lg:mb-20">
                        <div className="grid grid-cols-2 gap-x-3 gap-y-4 mb-8 md:flex md:items-center md:justify-center lg:gap-4 lg:mb-10">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    aria-pressed={category.id === activeId}
                                    className={classNames(
                                        'flex justify-center w-full px-[18px] py-3 border rounded-[32px] transition-colors duration-300 lg:max-w-max',
                                        {
                                            'border-appAccent bg-appAccent text-appBody':
                                                category.id === activeId,
                                            'border-appText': category.id !== activeId,
                                        },
                                    )}
                                    onClick={() => setActiveId(category.id)}
                                >
                                    <span className="text-xs leading-none tracking-[-0.41px] lg:text-base lg:leading-none">
                                        {category.title}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <Prose
                            text={active?.description ?? ''}
                            className="text-sm leading-[1.3] tracking-[-0.41px] uppercase text-appGray-700 lg:text-base lg:leading-[1.3]"
                        />
                    </div>
                </div>
            </div>
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1">
                    {filtered.map((item) => (
                        <div
                            key={item.id}
                            className="relative px-6 py-[42px] bg-appText md:py-20 lg:py-[130px]"
                        >
                            <div className="relative z-10 flex flex-col items-center justify-center text-center h-full">
                                <h3 className="text-sm leading-none uppercase text-white font-Gloock max-w-[480px] mb-[14px] lg:text-[32px] lg:leading-none lg:mb-[18px]">
                                    {item.title}
                                </h3>
                                <Prose
                                    text={item.description}
                                    className="text-sm leading-[1.3] tracking-[-0.41px] uppercase text-appGray-100 max-w-[480px] mb-4 lg:text-base lg:leading-[1.3] lg:mb-6"
                                />
                                <div
                                    className={classNames(
                                        'px-6 py-[13px] flex max-w-max rounded-[32px] text-sm leading-none text-white tracking-[-0.41px] lg:px-[18px] lg:py-3 lg:text-sm lg:leading-none',
                                        item.available ? 'bg-[#6C7661]' : 'bg-[#8E3B2A]',
                                    )}
                                >
                                    {item.available ? formatPrice(item.price) : 'Agotado por hoy'}
                                </div>
                            </div>
                            <MediaImage
                                src={item.image}
                                alt={item.title}
                                className={classNames(
                                    'absolute top-0 left-0 w-full h-full object-cover',
                                    { grayscale: !item.available },
                                )}
                            />
                            <div className="absolute top-0 left-0 w-full h-full bg-black/50" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-sm leading-none tracking-[-0.41px] text-center text-appGray-700 my-20">
                    Pronto publicaremos los platos de esta categoría
                </div>
            )}
        </section>
    );
};

export default MenuMeals;
