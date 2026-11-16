import React from 'react';
import HojasDecor from '../HojasDecor';
import CrocanteImg from '../CrocanteImg';
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
        <section className="relative pt-16 pb-16 lg:pt-24 lg:pb-20">
            <HojasDecor />
            <div className="container relative grid gap-10 max-w-[1100px]">
                <div className="grid justify-items-center gap-3 text-center">
                    <h1 className="font-display text-[clamp(2.6rem,1.8rem+3vw,4.2rem)] leading-[.95] text-balance [text-shadow:.05em_.05em_0_#F5B41F]">
                        {titleTop}
                        {titleBottom && <><br />{titleBottom}</>}
                    </h1>
                    {subtitle && <Prose text={subtitle} className="text-xl font-bold text-hoja" />}
                </div>
                {cover && <CrocanteImg src={cover} alt="" semilla="nosotros" className="aspect-[16/9] w-full" loading="eager" />}
                <Prose text={description} className="text-2xl leading-snug max-w-[40ch] mx-auto text-center" />
                <Btn to="/carta" theme="accent" size="lg" className="justify-self-center">
                    Ver la carta
                </Btn>
            </div>
        </section>
    );
};

export default AboutHero;
