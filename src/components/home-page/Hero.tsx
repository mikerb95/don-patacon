import React from 'react';
import StarIcon from '../../assets/icons/star.svg?raw';
import HomeDivider from './Divider';
import Btn from '../Btn';
import Prose from '../Prose';
import HomeMap from './Map';
import OpenStatus from './OpenStatus';
import type { Business } from '../../lib/schema';
import { summarizeHours } from '../../lib/hours';

interface Props {
    title: string;
    image: string;
    hours: Business['hours'];
    address: string;
    description: string;
    mapsUrl: string;
    mapEmbedUrl: string;
}

const HomeHero: React.FC<Props> = ({
    title,
    image,
    hours,
    address,
    description,
    mapsUrl,
    mapEmbedUrl,
}) => {
    const summary = summarizeHours(hours);

    return (
        <section className="pt-10 md:pt-20 lg:pt-[200px]">
            <div className="container">
                <div className="relative mb-[14px] lg:mb-12">
                    <svg
                        viewBox="0 0 1376 986"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        role="presentation"
                        className="w-full"
                    >
                        <defs>
                            <clipPath id="homeHeroArch">
                                <path d="M0 238.786C403.766 -78.5849 972.234 -78.5849 1376 238.786V986H0V238.786Z" />
                            </clipPath>
                        </defs>
                        <rect width="1376" height="986" fill="#272424" clipPath="url(#homeHeroArch)" />
                        {image && (
                            <image
                                href={image}
                                width="1376"
                                height="986"
                                preserveAspectRatio="xMidYMid slice"
                                clipPath="url(#homeHeroArch)"
                            />
                        )}
                    </svg>
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-between xl:top-10 xl:w-full">
                        <div className="flex flex-col items-end max-xl:hidden">
                            <div className="text-lg leading-none mb-1.5">
                                {address}
                            </div>
                            <HomeMap embedUrl={mapEmbedUrl} mapsUrl={mapsUrl} />
                        </div>
                        <div className="h-px flex-1 bg-[#D9D9D9] mx-4 max-xl:hidden" />
                        <div className="bg-white px-4 py-[14px] rounded-[128px] max-w-max lg:px-20 lg:py-14">
                            <div className="flex items-center">
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: StarIcon,
                                    }}
                                    className="w-2 h-2 lg:w-12 lg:h-12"
                                />
                                <h1 className="text-xl leading-none whitespace-nowrap font-Gloock mx-2.5 lg:text-[80px] lg:leading-none lg:mx-12 2xl:text-[112px] 2xl:leading-none">
                                    {title}
                                </h1>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: StarIcon,
                                    }}
                                    className="w-2 h-2 lg:w-12 lg:h-12"
                                />
                            </div>
                        </div>
                        <div className="h-px flex-1 bg-[#D9D9D9] mx-4 max-xl:hidden" />
                        <OpenStatus hours={hours} summary={summary} className="text-sm leading-none text-[#8F8E88] text-right max-xl:hidden lg:text-left" />
                    </div>
                </div>
                <div className="flex items-start justify-between mb-6 xl:hidden">
                    <div>
                        <div className="text-sm leading-none mb-1.5 lg:text-lg lg:leading-none">
                            {address}
                        </div>
                        <HomeMap embedUrl={mapEmbedUrl} mapsUrl={mapsUrl} />
                    </div>
                    <OpenStatus hours={hours} summary={summary} className="text-sm leading-none text-[#8F8E88] text-right lg:text-left" />
                </div>
                <Prose
                    text={description}
                    className="text-sm leading-[1.3] tracking-[-0.41px] uppercase text-appGray-700 mb-6 lg:text-[40px] lg:leading-none lg:mb-14"
                />
                <Btn to="/about-us" className="uppercase max-w-max mx-auto">
                    <span>
                        Conócenos
                    </span>
                </Btn>
                <HomeDivider />
            </div>
        </section>
    );
};

export default HomeHero;
