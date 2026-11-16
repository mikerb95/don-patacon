import React from 'react';
import MediaImage from '../MediaImage';
import Prose from '../Prose';
import HomeDivider from './Divider';

interface Props {
    index: number;
    title: string;
    description: string;
    steps: { text: string; image: string }[];
}

/**
 * "Cómo lo hacemos": el proceso artesanal del patacón en pasos numerados.
 * Estilos mínimos sobre los tokens actuales; el rediseño los reemplaza.
 */
const HomeProcess: React.FC<Props> = ({ index, title, description, steps }) => {
    return (
        <section className="process">
            <div className="container">
                <div className="flex flex-col items-center text-center">
                    <div className="text-xs leading-none mb-2.5 lg:text-base lg:leading-none lg:mb-[14px]">
                        [ {index} ]
                    </div>
                    <h2 className="text-lg leading-none font-display mb-4 lg:text-5xl lg:leading-none lg:mb-6">
                        {title}
                    </h2>
                    <Prose
                        text={description}
                        className="text-sm leading-[1.3] tracking-[-0.41px] text-appGray-700 max-w-[745px] mx-auto mb-8 lg:text-base lg:leading-[1.3] lg:mb-14"
                    />
                </div>
                <ol className="process--steps grid gap-8 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] lg:gap-6">
                    {steps.map((step, i) => (
                        <li key={i} className="process--step flex flex-col gap-4">
                            {step.image && (
                                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-appText">
                                    <MediaImage
                                        src={step.image}
                                        alt=""
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="flex items-start gap-3">
                                <span
                                    aria-hidden="true"
                                    className="process--number flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-appAccent text-appBody text-sm font-medium"
                                >
                                    {i + 1}
                                </span>
                                <Prose
                                    text={step.text}
                                    className="text-sm leading-[1.4] text-appGray-700 lg:text-base"
                                />
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
            <HomeDivider />
        </section>
    );
};

export default HomeProcess;
