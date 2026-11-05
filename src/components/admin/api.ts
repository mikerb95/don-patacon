import type { DocName, Docs } from '../../lib/schema';

export type Revs = Record<DocName, string>;

async function request<T>(url: string, init?: RequestInit): Promise<T> {
    let res: Response;
    try {
        res = await fetch(url, init);
    } catch {
        throw new ApiError('No hay conexión. Revisa tu internet e inténtalo de nuevo.', 0);
    }
    if (res.status === 401) {
        window.location.href = '/admin/login';
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(data.error ?? 'No se pudo completar la operación.', res.status);
    return data as T;
}

export class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

export const loadContent = () =>
    request<{ docs: Docs; revs: Revs; hasHistory: boolean }>('/api/admin/content');

export const publish = (docs: Partial<Docs>, revs: Revs) =>
    request<{ commit: string | null; revs: Partial<Revs>; docs: Partial<Docs> }>('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docs, revs }),
    });

export const checkLive = (commit: string) =>
    request<{ live: boolean; unknown?: boolean }>(`/api/admin/status?commit=${commit}`);

export interface HistoryEntry {
    sha: string;
    message: string;
    date: string;
}

export const loadHistory = () => request<{ entries: HistoryEntry[] }>('/api/admin/history');

export const restoreVersion = (sha: string) =>
    request<{ commit: string | null }>('/api/admin/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sha }),
    });

/** Reduce la foto en el navegador: las funciones de Vercel aceptan máximo 4,5 MB. */
export async function compressImage(file: File, maxSide = 1600): Promise<Blob> {
    const bitmap = await createImageBitmap(file).catch(() => {
        throw new ApiError('No se pudo leer esa imagen. Usa una foto JPG, PNG o WebP.', 415);
    });
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/webp', 0.82),
    );
    if (!blob) throw new ApiError('No se pudo procesar esa imagen.', 415);
    return blob;
}

export async function uploadImage(file: File): Promise<{ path: string; preview: string }> {
    const blob = await compressImage(file);
    const form = new FormData();
    form.append('file', blob, 'foto.webp');
    const { path } = await request<{ path: string }>('/api/admin/upload', { method: 'POST', body: form });
    return { path, preview: URL.createObjectURL(blob) };
}
