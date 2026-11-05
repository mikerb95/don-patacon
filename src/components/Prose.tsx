import React from 'react';

interface Props {
    text: string;
    className?: string;
}

/** Texto plano del panel: cada línea en blanco separa un párrafo. No interpreta HTML. */
const Prose: React.FC<Props> = ({ text, className }) => {
    const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    if (paragraphs.length === 0) return null;
    return (
        <div className={className}>
            {paragraphs.map((p, i) => (
                <p key={i} className="whitespace-pre-line [&:not(:last-child)]:mb-[1em]">
                    {p}
                </p>
            ))}
        </div>
    );
};

export default Prose;
