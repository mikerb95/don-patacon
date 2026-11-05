import React, { useEffect, useRef, useState } from 'react';
import type { Docs } from '../../lib/schema';
import { PREVIEW_PAGES, type PreviewPage } from './route';

interface Props {
    page: PreviewPage;
    category?: string;
    docs: Docs;
    dirty: boolean;
    publishing: boolean;
    onPage: (page: PreviewPage) => void;
    onClose: () => void;
    onPublish: () => void;
}

const FRAME = 'dp-preview';

/** El marco nuevo primero carga about:blank: esa carga no cuenta como lista. */
const isBlank = (frame: HTMLIFrameElement) => {
    try {
        return frame.contentWindow?.location.href === 'about:blank';
    } catch {
        return false;
    }
};

/** Muestra el borrador tal como quedará en el sitio. Nada de esto es público todavía. */
const Preview: React.FC<Props> = ({ page, category, docs, dirty, publishing, onPage, onClose, onPublish }) => {
    const form = useRef<HTMLFormElement>(null);
    const close = useRef<HTMLButtonElement>(null);
    const [loading, setLoading] = useState(true);
    const [wide, setWide] = useState(false);
    const query = page === 'carta' && category ? `?s=${encodeURIComponent(category)}` : '';

    useEffect(() => {
        setLoading(true);
        form.current?.submit();
    }, [page, query]);

    useEffect(() => {
        close.current?.focus();
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    return (
        <div role="dialog" aria-modal="true" aria-label="Vista previa" className="fixed inset-0 z-50 flex flex-col bg-appText">
            <div className="text-white px-3 pt-3 pb-2 grid grid-cols-1 gap-2.5 min-w-0" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
                <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 pl-1">
                        <h2 className="font-Gloock text-xl leading-tight">Vista previa</h2>
                        <p className="text-sm leading-snug text-[#CFCCBF]">{dirty ? 'Aún no está publicada' : 'Sin cambios pendientes'}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                        <button ref={close} type="button" onClick={onClose} className="min-h-11 px-3 rounded-xl font-medium">Volver a editar</button>
                        {dirty && (
                            <button type="button" onClick={onPublish} disabled={publishing} className="min-h-11 px-4 rounded-xl font-semibold bg-appBody text-appText disabled:opacity-60">
                                {publishing ? 'Publicando…' : 'Publicar'}
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="flex flex-1 min-w-0 gap-1.5 overflow-x-auto pb-1">
                        {PREVIEW_PAGES.map((p) => (
                            <button key={p.id} type="button" aria-pressed={p.id === page} onClick={() => onPage(p.id)}
                                className={`shrink-0 min-h-11 px-3.5 rounded-full font-medium ${p.id === page ? 'bg-appBody text-appText' : 'bg-white/10'}`}>
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <button type="button" aria-pressed={wide} onClick={() => setWide((v) => !v)} className="hidden md:block shrink-0 min-h-11 px-3.5 rounded-full font-medium bg-white/10">
                        {wide ? 'Ver como celular' : 'Ver como computador'}
                    </button>
                </div>
            </div>
            <div className="relative flex-1 min-h-0 flex justify-center bg-[#3A3636] md:p-3">
                {loading && <p role="status" className="absolute top-8 text-white">Preparando la vista previa…</p>}
                {/* Un marco nuevo por página: así cambiar de página no agrega entradas al
                    historial, y "atrás" cierra la vista previa en lugar de retroceder dentro. */}
                <iframe
                    key={`${page}${query}`}
                    name={FRAME}
                    title={`Vista previa de ${PREVIEW_PAGES.find((p) => p.id === page)?.label}`}
                    sandbox="allow-scripts allow-same-origin allow-forms"
                    onLoad={(e) => { if (!isBlank(e.currentTarget)) setLoading(false); }}
                    className={`h-full w-full bg-appBody border-0 ${wide ? '' : 'md:max-w-[390px] md:rounded-2xl'} ${loading ? 'opacity-0' : ''}`}
                />
            </div>
            <form ref={form} method="post" action={`/admin/preview/${page}${query}`} target={FRAME} hidden>
                <input type="hidden" name="docs" value={JSON.stringify(docs)} />
            </form>
        </div>
    );
};

export default Preview;
