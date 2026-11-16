import React from 'react';
import CrocanteImg from '../CrocanteImg';
import Prose from '../Prose';

interface Props {
    data: { text: string; image: string }[];
}

const AboutTextImage: React.FC<Props> = ({ data }) => {
    return (
        <section className="relative mb-14 md:py-20 md:mb-20 lg:py-[104px] lg:mb-[120px]">
            <div className="container max-w-[1198px]">
                <div className="grid grid-cols-1 gap-8 md:gap-20 lg:gap-[112px]">
                    {data &&
                        data.map((col, index) => (
                            <div
                                key={index}
                                className="md:flex md:items-center md:even:flex-row-reverse md:gap-20 lg:gap-[112px]"
                            >
                                {col.image && (
                                    <div className="max-md:mb-4 md:flex-1">
                                        <CrocanteImg src={col.image} semilla={`bloque-${index}`} className="w-full aspect-[4/3]" />
                                    </div>
                                )}
                                <Prose
                                    text={col.text}
                                    className="text-xl leading-snug md:flex-1 lg:text-2xl"
                                />
                            </div>
                        ))}
                </div>
            </div>
        </section>
    );
};

export default AboutTextImage;
