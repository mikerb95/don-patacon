import React, { useEffect, useState } from 'react';
import type { Business } from '../../lib/schema';
import { openStatus } from '../../lib/hours';

interface Props {
    hours: Business['hours'];
    summary: string[];
    className?: string;
}

/** El HTML se genera al compilar: el estado actual se calcula en el navegador. */
const OpenStatus: React.FC<Props> = ({ hours, summary, className }) => {
    const [status, setStatus] = useState<ReturnType<typeof openStatus>>(null);

    useEffect(() => {
        const update = () => setStatus(openStatus(hours));
        update();
        const timer = window.setInterval(update, 60_000);
        return () => window.clearInterval(timer);
    }, [hours]);

    if (summary.length === 0) return null;
    return (
        <div className={className}>
            {status && (
                <div className="text-base leading-tight text-[#1e293b] mb-1.5 md:text-lg md:leading-tight">
                    <span
                        aria-hidden="true"
                        className={`inline-block align-middle w-2 h-2 mr-1.5 rounded-full ${status.open ? 'bg-[#6F8A58]' : 'bg-appGray-400'}`}
                    />
                    {status.label}
                </div>
            )}
            {summary.map((line) => (
                <div key={line} className="mt-1">{line}</div>
            ))}
        </div>
    );
};

export default OpenStatus;
