import React from 'react';
import ArchWithStar from '../ArchWithStar';
import MediaImage from '../MediaImage';
import Prose from '../Prose';
import Btn from '../Btn';

interface Props {
    titleTop: string;
    titleBottom: string;
    subtitle: string;
    description: string;
    cover: string;
}

const AboutHero: React.FC<Props> = ({
    titleTop,
    titleBottom,
    subtitle,
    description,
    cover,
}) => {
    return (
        <section className="pt-[108px] pb-10 overflow-hidden md:pb-14 lg:pt-[218px]">
            <div className="container max-w-[1198px]">
                <ArchWithStar />
                <div className="relative px-4 max-w-[400px] mx-auto lg:max-w-[962px] xl:px-0">
                    <h1 className="relative z-10 flex flex-col gap-1.5 text-xl leading-none font-Gloock mb-2 lg:gap-3 lg:text-[56px] lg:leading-none lg:mb-3">
                        <span>{titleTop}</span>
                        {titleBottom && <span className="text-right">{titleBottom}</span>}
                    </h1>
                    <Prose
                        text={subtitle}
                        className="relative z-10 text-[10px] leading-[1.2] uppercase max-w-max ml-auto mb-10 lg:text-base lg:leading-[1.2] lg:mb-[120px]"
                    />
                </div>
                <MediaImage
                    src={cover}
                    className="w-full object-cover aspect-[1.635] mb-4 lg:aspect-[2.67] lg:mb-10"
                />
                <Prose
                    text={description}
                    className="text-sm leading-[1.3] tracking-[-0.41px] uppercase text-appGray-700 mb-6 lg:text-[32px] lg:leading-[1.3] lg:mb-14"
                />
                <Btn to="/menu" className="uppercase max-w-max mx-auto">
                    <span>Ver la carta</span>
                </Btn>
            </div>
        </section>
    );
};

export default AboutHero;
