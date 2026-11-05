import React from 'react';
import type { Business, Day } from '../../lib/schema';
import { Button, Field, FieldError, useIssues } from './ui';

const DAY_NAMES: Record<Day, string> = {
    MON: 'Lunes', TUE: 'Martes', WED: 'Miércoles', THU: 'Jueves', FRI: 'Viernes', SAT: 'Sábado', SUN: 'Domingo',
};

export function missingBusiness(b: Business): string[] {
    const missing: string[] = [];
    if (!b.whatsapp) missing.push('WhatsApp (sin él no se pueden enviar pedidos)');
    if (!b.hours.some((d) => d.open)) missing.push('Horario');
    if (!b.mallLocation) missing.push('Local y piso en Plaza Central');
    if (!b.phone) missing.push('Teléfono');
    if (!b.email) missing.push('Correo');
    if (!b.legalName || !b.nit) missing.push('Razón social y NIT (los pide la política de datos)');
    return missing;
}

const Group: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="grid gap-5 pt-7 first:pt-0">
        <h2 className="font-Gloock text-2xl leading-tight">{title}</h2>
        {children}
    </section>
);

const BusinessTab: React.FC<{ business: Business; onChange: (b: Business) => void }> = ({ business: b, onChange }) => {
    const { clear } = useIssues();
    const set = (patch: Partial<Business>) => onChange({ ...b, ...patch });
    const missing = missingBusiness(b);
    const setDay = (index: number, patch: Partial<Business['hours'][number]>) => {
        clear(`business.hours.${index}`);
        set({ hours: b.hours.map((d, i) => (i === index ? { ...d, ...patch } : d)) });
    };
    const firstOpen = b.hours.find((d) => d.open);

    return (
        <div>
            <h1 className="font-Gloock text-4xl leading-none mb-5">Negocio</h1>
            {missing.length > 0 && (
                <div className="rounded-2xl bg-[#EADFC9] p-4 mb-7">
                    <p className="font-medium mb-2">Falta completar para que el sitio quede listo:</p>
                    <ul className="list-disc pl-5 grid gap-1">
                        {missing.map((m) => <li key={m}>{m}</li>)}
                    </ul>
                </div>
            )}
            <div className="grid gap-2 divide-y divide-[#DAD7C8] [&>section]:pb-7">
                <Group title="Horario">
                    <ul className="grid gap-1">
                        {b.hours.map((d, i) => (
                            <li key={d.day} className="grid gap-1.5">
                                <div className="flex items-center justify-between gap-3 min-h-11">
                                    <span className="font-medium">{DAY_NAMES[d.day]}</span>
                                    {d.open ? (
                                        <button type="button" aria-label={`Marcar ${DAY_NAMES[d.day]} como cerrado`} onClick={() => setDay(i, { open: '', close: '' })}
                                            className="min-h-11 text-appGray-300 underline underline-offset-4">
                                            Marcar cerrado
                                        </button>
                                    ) : (
                                        <button type="button" aria-label={`Abrir ${DAY_NAMES[d.day]}`} onClick={() => setDay(i, { open: firstOpen?.open ?? '12:00', close: firstOpen?.close ?? '20:00' })}
                                            className="min-h-11 text-appGray-300 underline underline-offset-4">
                                            Cerrado. Tocar para abrir
                                        </button>
                                    )}
                                </div>
                                {d.open && (
                                    <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2">
                                        <input type="time" data-field={`business.hours.${i}`} aria-label={`${DAY_NAMES[d.day]}: abre`} value={d.open} onChange={(e) => setDay(i, { open: e.target.value })}
                                            className="min-h-11 min-w-0 w-full px-2.5 rounded-xl bg-white border border-[#CFCCBF] text-base" />
                                        <span aria-hidden="true">a</span>
                                        <input type="time" aria-label={`${DAY_NAMES[d.day]}: cierra`} value={d.close} onChange={(e) => setDay(i, { close: e.target.value })}
                                            className="min-h-11 min-w-0 w-full px-2.5 rounded-xl bg-white border border-[#CFCCBF] text-base" />
                                    </div>
                                )}
                                <FieldError name={`business.hours.${i}`} />
                            </li>
                        ))}
                    </ul>
                    {firstOpen && (
                        <Button className="justify-self-start" onClick={() => set({ hours: b.hours.map((d) => ({ ...d, open: firstOpen.open, close: firstOpen.close })) })}>
                            Usar {firstOpen.open} a {firstOpen.close} todos los días
                        </Button>
                    )}
                </Group>
                <Group title="Contacto">
                    <Field name="business.whatsapp" label="WhatsApp para pedidos" type="tel" value={b.whatsapp} placeholder="300 123 4567" hint="Si es de Colombia, basta con los 10 dígitos." onChange={(whatsapp) => set({ whatsapp })} />
                    <Field name="business.phone" label="Teléfono" type="tel" value={b.phone} placeholder="+57 300 123 4567" onChange={(phone) => set({ phone })} />
                    <Field name="business.email" label="Correo" type="email" value={b.email} onChange={(email) => set({ email })} />
                </Group>
                <Group title="Ubicación">
                    <Field name="business.mallLocation" label="Local y piso" value={b.mallLocation} placeholder="Local 3-12, plazoleta de comidas, piso 3" onChange={(mallLocation) => set({ mallLocation })} />
                    <Field name="business.address.line1" label="Dirección" value={b.address.line1} onChange={(line1) => set({ address: { ...b.address, line1 } })} />
                    <Field name="business.address.line2" label="Dirección, segunda línea" value={b.address.line2} onChange={(line2) => set({ address: { ...b.address, line2 } })} />
                    <Field name="business.address.city" label="Ciudad" value={b.address.city} onChange={(city) => set({ address: { ...b.address, city } })} />
                    <Field name="business.mapsUrl" label="Enlace de Google Maps" type="url" value={b.mapsUrl} onChange={(mapsUrl) => set({ mapsUrl })} />
                </Group>
                <Group title="Domicilios">
                    <Field name="business.delivery.rappi" label="Enlace de Rappi" type="url" value={b.delivery.rappi} hint="Vacío: no se muestra el botón." onChange={(rappi) => set({ delivery: { ...b.delivery, rappi } })} />
                    <Field name="business.delivery.didi" label="Enlace de DiDi Food" type="url" value={b.delivery.didi} onChange={(didi) => set({ delivery: { ...b.delivery, didi } })} />
                </Group>
                <Group title="Redes sociales">
                    <Field name="business.social.instagram" label="Instagram" type="url" value={b.social.instagram} onChange={(instagram) => set({ social: { ...b.social, instagram } })} />
                    <Field name="business.social.facebook" label="Facebook" type="url" value={b.social.facebook} onChange={(facebook) => set({ social: { ...b.social, facebook } })} />
                    <Field name="business.social.x" label="X" type="url" value={b.social.x} onChange={(x) => set({ social: { ...b.social, x } })} />
                </Group>
                <Group title="Datos legales">
                    <Field name="business.name" label="Nombre del negocio" value={b.name} onChange={(name) => set({ name })} />
                    <Field name="business.legalName" label="Razón social" value={b.legalName} onChange={(legalName) => set({ legalName })} />
                    <Field name="business.nit" label="NIT" value={b.nit} onChange={(nit) => set({ nit })} />
                </Group>
            </div>
        </div>
    );
};

export default BusinessTab;
