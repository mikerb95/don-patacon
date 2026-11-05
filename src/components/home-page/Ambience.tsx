import React from 'react';
import MediaImage from '../MediaImage';
import Prose from '../Prose';
import HomeDivider from './Divider';

interface Props {
    index: number;
    title: string;
    description: string;
    items: { text: string; image: string }[];
}

const HomeAmbience: React.FC<Props> = ({ index, title, description, items }) => {
    return (
        <section>
            <div className="container">
                <div className="flex flex-col items-center">
                    <div className="text-xs leading-none mb-2.5 lg:text-base lg:leading-none lg:mb-[14px]">
                        [ {index} ]
                    </div>
                    <h2 className="text-lg leading-none uppercase font-Gloock mb-4 lg:text-5xl lg:leading-none lg:mb-6">
                        {title}
                    </h2>
                    <Prose
                        text={description}
                        className="text-sm leading-[1.3] tracking-[-0.41px] text-appGray-700 uppercase max-w-[745px] mx-auto mb-8 lg:text-base lg:leading-[1.3] lg:mb-[88px]"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4 auto-rows-fr lg:gap-6">
                    {items.map((item, i) => (
                        <div
                            key={i}
                            className="homeAmbience--gridItem w-full h-full relative bg-appText lg:min-h-[360px]"
                        >
                            {item.text && (
                                <div className="flex absolute z-10 top-5 left-5 bg-appBody rounded-[32px] px-[14px] py-2.5 max-w-[calc(100%-28px)] lg:top-8 lg:left-8 lg:px-6 lg:py-4">
                                    <div className="text-xs leading-none uppercase truncate lg:text-base lg:leading-none">
                                        {item.text}
                                    </div>
                                </div>
                            )}
                            <MediaImage
                                src={item.image}
                                alt={item.text}
                                className="absolute top-0 left-0 w-full h-full object-cover"
                            />
                            <div className="absolute top-0 left-0 w-full h-full bg-black/30" />
                        </div>
                    ))}
                </div>
            </div>
            <HomeDivider />
        </section>
    );
};

export default HomeAmbience;
