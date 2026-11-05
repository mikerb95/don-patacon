import React, { useEffect, useId, useRef, useState } from 'react';
import { uploadImage, ApiError } from './api';

const INPUT =
    'w-full min-h-12 px-3.5 py-2.5 rounded-xl bg-white border border-[#CFCCBF] text-base text-appText placeholder:text-appGray-400 focus:border-appText';

interface FieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    hint?: string;
    multiline?: boolean;
    rows?: number;
    type?: string;
    inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
    placeholder?: string;
    maxLength?: number;
}

export const Field: React.FC<FieldProps> = ({
    label, value, onChange, hint, multiline, rows = 3, type = 'text', inputMode, placeholder, maxLength,
}) => {
    const id = useId();
    return (
        <div className="grid gap-1.5">
            <label htmlFor={id} className="font-medium leading-snug">{label}</label>
            {multiline ? (
                <textarea id={id} rows={rows} className={INPUT} value={value} placeholder={placeholder} maxLength={maxLength}
                    onChange={(e) => onChange(e.target.value)} />
            ) : (
                <input id={id} type={type} inputMode={inputMode} className={INPUT} value={value} placeholder={placeholder} maxLength={maxLength}
                    onChange={(e) => onChange(e.target.value)} />
            )}
            {hint && <p className="text-sm leading-snug text-appGray-300">{hint}</p>}
        </div>
    );
};

export const Toggle: React.FC<{
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    showLabel?: boolean;
}> = ({ checked, onChange, label, showLabel }) => (
    <label className="inline-flex items-center gap-3 min-h-11 cursor-pointer select-none">
        <input type="checkbox" role="switch" className="sr-only peer" checked={checked} aria-label={showLabel ? undefined : label}
            onChange={(e) => onChange(e.target.checked)} />
        <span aria-hidden="true"
            className="relative w-12 h-7 rounded-full bg-[#C9B8B0] transition-colors peer-checked:bg-[#5F7A4C] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-appText after:absolute after:top-0.5 after:left-0.5 after:w-6 after:h-6 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
        {showLabel && <span className="font-medium">{label}</span>}
    </label>
);

type BtnKind = 'primary' | 'quiet' | 'danger';
const BTN: Record<BtnKind, string> = {
    primary: 'bg-appText text-white',
    quiet: 'bg-[#E5E2D4] text-appText',
    danger: 'bg-[#F0DDD6] text-[#7E2F20]',
};

export const Button: React.FC<
    React.ButtonHTMLAttributes<HTMLButtonElement> & { kind?: BtnKind }
> = ({ kind = 'quiet', className = '', ...props }) => (
    <button type="button" {...props}
        className={`min-h-11 px-4 rounded-xl font-medium disabled:opacity-50 ${BTN[kind]} ${className}`} />
);

/** Panel inferior en el celular y diálogo centrado en pantallas grandes. */
export const Sheet: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({
    title, onClose, children,
}) => {
    const ref = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        const dialog = ref.current;
        dialog?.showModal();
        return () => dialog?.close();
    }, []);
    return (
        <dialog ref={ref} onCancel={(e) => { e.preventDefault(); onClose(); }}
            onClick={(e) => { if (e.target === ref.current) onClose(); }}
            className="m-0 mt-auto w-full max-w-none max-h-[92dvh] rounded-t-3xl bg-appBody text-appText p-0 backdrop:bg-[#272424]/60 md:m-auto md:max-w-xl md:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-appBody px-5 pt-5 pb-3">
                <h2 className="font-Gloock text-2xl leading-tight">{title}</h2>
                <Button onClick={onClose}>Listo</Button>
            </div>
            <div className="grid gap-5 px-5 pb-8">{children}</div>
        </dialog>
    );
};

export const previews = new Map<string, string>();

export const ImageField: React.FC<{
    label: string;
    value: string;
    onChange: (path: string) => void;
    onError: (message: string) => void;
}> = ({ label, value, onChange, onError }) => {
    const [busy, setBusy] = useState(false);
    const [broken, setBroken] = useState(false);
    const src = previews.get(value) ?? value;
    useEffect(() => setBroken(false), [value]);

    const onFile = async (file?: File) => {
        if (!file) return;
        setBusy(true);
        try {
            const { path, preview } = await uploadImage(file);
            previews.set(path, preview);
            onChange(path);
        } catch (err) {
            onError(err instanceof ApiError ? err.message : 'No se pudo subir la imagen.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="grid gap-2">
            <span className="font-medium">{label}</span>
            <div className="flex items-center gap-3">
                <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-[#E5E2D4] grid place-items-center text-xs text-center text-appGray-300">
                    {value && !broken ? (
                        <img src={src} alt="" className="w-full h-full object-cover" onError={() => setBroken(true)} />
                    ) : value ? 'Se verá al publicar' : 'Sin foto'}
                </div>
                <div className="flex flex-wrap gap-2">
                    <label className={`inline-flex items-center min-h-11 px-4 rounded-xl font-medium bg-[#E5E2D4] cursor-pointer focus-within:outline focus-within:outline-2 ${busy ? 'opacity-50' : ''}`}>
                        {busy ? 'Subiendo foto…' : value ? 'Cambiar foto' : 'Subir foto'}
                        <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={busy}
                            onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ''; }} />
                    </label>
                    {value && <Button onClick={() => onChange('')}>Quitar</Button>}
                </div>
            </div>
        </div>
    );
};

export const slugify = (text: string) =>
    text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'item';

export function uniqueId(base: string, taken: string[]): string {
    const slug = slugify(base);
    if (!taken.includes(slug)) return slug;
    let n = 2;
    while (taken.includes(`${slug}-${n}`)) n++;
    return `${slug}-${n}`;
}

export function moveItem<T>(list: T[], index: number, delta: number): T[] {
    const target = index + delta;
    if (target < 0 || target >= list.length) return list;
    const copy = [...list];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    return copy;
}
