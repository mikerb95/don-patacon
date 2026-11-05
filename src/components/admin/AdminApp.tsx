import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Docs } from '../../lib/schema';
import { ApiError, checkLive, loadContent, publish, type Revs } from './api';
import BusinessTab, { missingBusiness } from './BusinessTab';
import HistoryTab from './HistoryTab';
import MenuTab from './MenuTab';
import PagesTab from './PagesTab';
import { Button } from './ui';

type Tab = 'menu' | 'business' | 'pages' | 'history';
const TABS: { id: Tab; label: string }[] = [
    { id: 'menu', label: 'Carta' },
    { id: 'business', label: 'Negocio' },
    { id: 'pages', label: 'Páginas' },
    { id: 'history', label: 'Historial' },
];

const DRAFT_KEY = 'dp_admin_draft';
const POLL_MS = 15_000;
const POLL_LIMIT_MS = 6 * 60_000;

type Publishing =
    | { state: 'idle' }
    | { state: 'saving' }
    | { state: 'deploying'; commit: string; since: number }
    | { state: 'live' }
    | { state: 'saved-local' }
    | { state: 'slow' };

const sameDoc = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

const AdminApp: React.FC = () => {
    const [base, setBase] = useState<Docs | null>(null);
    const [draft, setDraft] = useState<Docs | null>(null);
    const [revs, setRevs] = useState<Revs | null>(null);
    const [hasHistory, setHasHistory] = useState(false);
    const [tab, setTab] = useState<Tab>('menu');
    const [error, setError] = useState('');
    const [loadError, setLoadError] = useState('');
    const [conflict, setConflict] = useState(false);
    const [publishing, setPublishing] = useState<Publishing>({ state: 'idle' });
    const undoStack = useRef<{ docs: Docs; at: number }[]>([]);
    const [undoCount, setUndoCount] = useState(0);

    const load = useCallback(async () => {
        setLoadError('');
        try {
            const data = await loadContent();
            let initial = data.docs;
            try {
                const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null');
                if (saved && sameDoc(saved.revs, data.revs)) initial = saved.docs;
            } catch {
                // Sin borrador guardado: se usa lo publicado.
            }
            setBase(data.docs);
            setDraft(initial);
            setRevs(data.revs);
            setHasHistory(data.hasHistory);
            setConflict(false);
            undoStack.current = [];
            setUndoCount(0);
        } catch (err) {
            setLoadError(err instanceof ApiError ? err.message : 'No se pudo cargar el contenido.');
        }
    }, []);

    useEffect(() => { void load(); }, [load]);

    const changed = useMemo(() => {
        if (!base || !draft) return [] as (keyof Docs)[];
        return (Object.keys(base) as (keyof Docs)[]).filter((k) => !sameDoc(base[k], draft[k]));
    }, [base, draft]);
    const dirty = changed.length > 0;

    useEffect(() => {
        if (!dirty) {
            try { localStorage.removeItem(DRAFT_KEY); } catch { /* sin almacenamiento */ }
            return;
        }
        try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ revs, docs: draft })); } catch { /* sin almacenamiento */ }
        const warn = (e: BeforeUnloadEvent) => e.preventDefault();
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [dirty, draft, revs]);

    // Seguimiento del deploy: se pregunta cada 15 s si la versión ya está en línea.
    useEffect(() => {
        if (publishing.state !== 'deploying') return;
        const { commit, since } = publishing;
        const timer = window.setInterval(async () => {
            if (Date.now() - since > POLL_LIMIT_MS) {
                setPublishing({ state: 'slow' });
                return;
            }
            try {
                const { live } = await checkLive(commit);
                if (live) setPublishing({ state: 'live' });
            } catch {
                // Durante el deploy puede fallar una consulta: se reintenta.
            }
        }, POLL_MS);
        return () => window.clearInterval(timer);
    }, [publishing]);

    useEffect(() => {
        if (publishing.state !== 'live' && publishing.state !== 'saved-local') return;
        const timer = window.setTimeout(() => setPublishing({ state: 'idle' }), 6000);
        return () => window.clearTimeout(timer);
    }, [publishing]);

    const update = (patch: Partial<Docs>) => {
        if (!draft) return;
        const now = Date.now();
        const last = undoStack.current[undoStack.current.length - 1];
        // Los cambios seguidos (escribir un texto) cuentan como uno solo al deshacer.
        if (!last || now - last.at > 1000) undoStack.current.push({ docs: draft, at: now });
        else last.at = now;
        setUndoCount(undoStack.current.length);
        setDraft({ ...draft, ...patch });
        setError('');
    };

    const undo = () => {
        const last = undoStack.current.pop();
        if (last) setDraft(last.docs);
        setUndoCount(undoStack.current.length);
    };

    const discard = () => {
        setDraft(base);
        undoStack.current = [];
        setUndoCount(0);
        setError('');
    };

    const startFollowing = (commit: string | null) => {
        setPublishing(commit ? { state: 'deploying', commit, since: Date.now() } : { state: 'saved-local' });
    };

    const doPublish = async () => {
        if (!draft || !revs || !base) return;
        setPublishing({ state: 'saving' });
        setError('');
        try {
            const docs = Object.fromEntries(changed.map((k) => [k, draft[k]])) as Partial<Docs>;
            const res = await publish(docs, revs);
            const next = { ...draft, ...res.docs } as Docs;
            setBase(next);
            setDraft(next);
            setRevs({ ...revs, ...res.revs });
            undoStack.current = [];
            setUndoCount(0);
            startFollowing(res.commit);
        } catch (err) {
            setPublishing({ state: 'idle' });
            if (err instanceof ApiError && err.status === 409) setConflict(true);
            setError(err instanceof ApiError ? err.message : 'No se pudo publicar.');
        }
    };

    if (loadError) {
        return (
            <main className="min-h-dvh grid place-content-center gap-4 p-6 text-center">
                <p className="font-Gloock text-2xl">{loadError}</p>
                <Button kind="primary" className="justify-self-center" onClick={load}>Volver a intentar</Button>
            </main>
        );
    }
    if (!draft) {
        return <main className="min-h-dvh grid place-content-center font-Gloock text-2xl">Cargando la carta…</main>;
    }

    const missing = missingBusiness(draft.business).length;

    return (
        <div className="min-h-dvh pb-44 md:pb-28">
            <header className="sticky top-0 z-20 bg-appBody/95 backdrop-blur border-b border-[#DAD7C8]">
                <div className="max-w-3xl mx-auto px-4 flex items-center justify-between gap-3 h-14">
                    <a href="/" target="_blank" rel="noopener" className="font-Gloock text-xl leading-none">Don Patacón</a>
                    <nav aria-label="Secciones del panel" className="hidden md:flex gap-1">
                        {TABS.map((t) => (
                            <button key={t.id} type="button" aria-current={tab === t.id ? 'page' : undefined} onClick={() => setTab(t.id)}
                                className={`relative min-h-11 px-3.5 rounded-xl font-medium ${tab === t.id ? 'bg-[#E5E2D4]' : ''}`}>
                                {t.label}
                                {t.id === 'business' && missing > 0 && <span className="absolute top-2 right-1.5 w-2 h-2 rounded-full bg-[#A2452E]" aria-label={`Faltan ${missing} datos`} />}
                            </button>
                        ))}
                    </nav>
                    <form method="post" action="/api/admin/logout">
                        <button className="min-h-11 px-2 text-appGray-300 font-medium">Salir</button>
                    </form>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 pt-6">
                {tab === 'menu' && <MenuTab menu={draft.menu} onChange={(menu) => update({ menu })} onError={setError} />}
                {tab === 'business' && <BusinessTab business={draft.business} onChange={(business) => update({ business })} />}
                {tab === 'pages' && <PagesTab pages={draft.pages} onChange={(pages) => update({ pages })} onError={setError} />}
                {tab === 'history' && (
                    <HistoryTab enabled={hasHistory} hasDraft={dirty} onError={setError}
                        onRestored={(commit) => { startFollowing(commit); void load(); setTab('menu'); }} />
                )}
            </main>

            <div className="fixed inset-x-0 bottom-0 z-30 pointer-events-none" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
                <div className="max-w-3xl mx-auto px-3 pb-2 grid gap-2">
                    {error && (
                        <div role="alert" className="pointer-events-auto rounded-2xl bg-[#7E2F20] text-white p-3.5 flex items-center justify-between gap-3">
                            <span className="leading-snug">{error}</span>
                            {conflict
                                ? <Button onClick={() => { try { localStorage.removeItem(DRAFT_KEY); } catch { /* sin almacenamiento */ } void load(); setError(''); }}>Recargar</Button>
                                : <Button onClick={() => setError('')}>Cerrar</Button>}
                        </div>
                    )}
                    {dirty ? (
                        <div className="pointer-events-auto rounded-2xl bg-appText text-white p-3 flex flex-wrap items-center justify-between gap-2">
                            <p className="font-medium pl-1">Cambios sin publicar</p>
                            <div className="flex gap-1.5 ml-auto">
                                <button type="button" onClick={undo} disabled={undoCount === 0} className="min-h-11 px-3 rounded-xl font-medium disabled:opacity-40">Deshacer</button>
                                <button type="button" onClick={discard} className="min-h-11 px-3 rounded-xl font-medium">Descartar</button>
                                <button type="button" onClick={doPublish} disabled={publishing.state === 'saving'} className="min-h-11 px-4 rounded-xl font-semibold bg-appBody text-appText disabled:opacity-60">
                                    {publishing.state === 'saving' ? 'Publicando…' : 'Publicar'}
                                </button>
                            </div>
                        </div>
                    ) : publishing.state !== 'idle' && publishing.state !== 'saving' ? (
                        <div role="status" className="pointer-events-auto rounded-2xl bg-appText text-white px-4 py-3 flex items-center gap-2.5">
                            {publishing.state === 'deploying' && <span aria-hidden="true" className="w-2.5 h-2.5 shrink-0 rounded-full bg-[#D9B777] animate-pulse" />}
                            {(publishing.state === 'live' || publishing.state === 'saved-local') && <span aria-hidden="true" className="w-2.5 h-2.5 shrink-0 rounded-full bg-[#8FB26F]" />}
                            <span className="leading-snug">
                                {publishing.state === 'deploying' && 'Publicando en el sitio. Suele tardar 1 o 2 minutos.'}
                                {publishing.state === 'live' && 'Publicado. Ya se ve en el sitio.'}
                                {publishing.state === 'saved-local' && 'Guardado en los archivos locales.'}
                                {publishing.state === 'slow' && 'Tu cambio quedó guardado, pero el sitio aún no lo muestra. Revisa el deploy en Vercel.'}
                            </span>
                        </div>
                    ) : null}
                    <nav aria-label="Secciones del panel" className="pointer-events-auto md:hidden grid grid-cols-4 rounded-2xl bg-white shadow-[0_2px_16px_rgba(39,36,36,0.14)]">
                        {TABS.map((t) => (
                            <button key={t.id} type="button" aria-current={tab === t.id ? 'page' : undefined} onClick={() => setTab(t.id)}
                                className={`relative min-h-14 rounded-2xl font-medium text-sm ${tab === t.id ? 'bg-[#E5E2D4]' : ''}`}>
                                {t.label}
                                {t.id === 'business' && missing > 0 && <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#A2452E]" aria-label={`Faltan ${missing} datos`} />}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default AdminApp;
