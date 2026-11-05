import MediaImage from '../MediaImage';
import Prose from '../Prose';
import HomeDivider from './Divider';
import type { Category } from '../../lib/schema';

interface Props {
    index: number;
    title: string;
    description: string;
    categories: Category[];
}

const HomeMenu: React.FC<Props> = ({ index, title, description, categories }) => {
    return (
        <section>
            <div className="container">
                <div className="flex flex-col items-center mb-8 lg:mb-[88px]">
                    <div className="text-xs leading-none mb-2.5 lg:text-base lg:leading-none lg:mb-[14px]">
                        [ {index} ]
                    </div>
                    <h2 className="text-lg leading-none uppercase font-Gloock mb-4 lg:text-5xl lg:leading-none lg:mb-6">
                        {title}
                    </h2>
                    <Prose
                        text={description}
                        className="text-sm leading-[1.3] tracking-[-0.41px] text-appGray-700 uppercase max-w-[745px] mx-auto lg:text-base lg:leading-[1.3]"
                    />
                </div>
            </div>
            {categories.map((category) => (
                <a
                    key={category.id}
                    href={`/menu?s=${category.id}`}
                    className="flex relative bg-appText"
                >
                    <div className="container">
                        <div className="relative z-10 flex flex-col items-center text-center py-12 max-w-[765px] mx-auto lg:py-[150px]">
                            <h3 className="text-sm leading-none font-Gloock text-white uppercase mb-3 lg:text-[32px] lg:leading-none lg:mb-[18px]">
                                {category.title}
                            </h3>
                            <Prose
                                text={category.description}
                                className="text-xs leading-[1.3] tracking-[-0.41px] uppercase text-appGray-100 lg:text-lg lg:leading-[1.3]"
                            />
                        </div>
                        <MediaImage
                            src={category.image}
                            className="absolute top-0 left-0 w-full h-full object-cover"
                        />
                        <div className="absolute top-0 left-0 w-full h-full bg-black/50" />
                    </div>
                </a>
            ))}
            <HomeDivider />
        </section>
    );
};

export default HomeMenu;
