import React, { useEffect, useState } from 'react';
import { ApiError, loadHistory, restoreVersion, type HistoryEntry } from './api';
import { Button } from './ui';

const when = new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bogota',
});

interface Props {
    enabled: boolean;
    hasDraft: boolean;
    onRestored: (commit: string | null) => void;
    onError: (message: string) => void;
}

const HistoryTab: React.FC<Props> = ({ enabled, hasDraft, onRestored, onError }) => {
    const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
    const [confirm, setConfirm] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!enabled) return;
        loadHistory()
            .then((r) => setEntries(r.entries))
            .catch((err) => {
                setEntries([]);
                onError(err instanceof ApiError ? err.message : 'No se pudo cargar el historial.');
            });
    }, [enabled]);

    const restore = async (sha: string) => {
        if (confirm !== sha) return setConfirm(sha);
        setBusy(true);
        try {
            const { commit } = await restoreVersion(sha);
            onRestored(commit);
        } catch (err) {
            onError(err instanceof ApiError ? err.message : 'No se pudo restaurar esa versión.');
        } finally {
            setBusy(false);
            setConfirm(null);
        }
    };

    return (
        <div>
            <h1 className="font-Gloock text-4xl leading-none mb-3">Historial</h1>
            <p className="text-appGray-300 mb-5">Cada publicación queda guardada. Si algo salió mal, vuelve a una versión anterior.</p>
            {!enabled && <p className="rounded-2xl bg-[#ECE9DB] p-4">El historial solo está disponible en el sitio publicado.</p>}
            {enabled && hasDraft && <p className="rounded-2xl bg-[#EADFC9] p-4 mb-4">Publica o descarta tus cambios antes de restaurar una versión.</p>}
            {enabled && entries === null && <p>Cargando el historial…</p>}
            {entries?.length === 0 && <p>Aún no hay publicaciones.</p>}
            <ul className="divide-y divide-[#DAD7C8]">
                {entries?.map((e, i) => (
                    <li key={e.sha} className="flex items-center justify-between gap-3 py-3">
                        <div className="min-w-0">
                            <p className="font-medium leading-snug">{e.message.replace(/^contenido: /, '').replace(/^./, (c) => c.toUpperCase())}</p>
                            <p className="text-sm text-appGray-300">{when.format(new Date(e.date))}</p>
                        </div>
                        {i === 0 ? <span className="text-sm text-appGray-300 shrink-0">Versión actual</span> : (
                            <Button disabled={busy || hasDraft} className="shrink-0" onClick={() => restore(e.sha)}>
                                {confirm === e.sha ? 'Confirmar' : 'Restaurar'}
                            </Button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default HistoryTab;
