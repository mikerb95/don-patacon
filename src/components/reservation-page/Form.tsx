import React, { useState } from 'react';
import FormText from './Text';
import classNames from 'classnames';
import Btn from '../Btn';
import ArchWithStar from '../ArchWithStar';

interface Props {
    title: string;
    businessName: string;
    /** Número de WhatsApp sin '+', sin espacios. Ej: 573001234567 */
    whatsappNumber: string;
}

interface ReservationForm {
    name: string;
    date: string;
    time: string;
    guestsCount: string;
    email: string;
    phone: string;
    notes: string;
    acceptTerms: boolean;
}

type FieldErrors = Partial<Record<keyof ReservationForm, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\d\s.-]{6,}$/;

const todayISO = () => new Date().toISOString().slice(0, 10);

const ReservationForm: React.FC<Props> = ({ title }) => {
    const [form, setForm] = useState<ReservationForm>({
        name: '',
        guestsCount: '',
        email: '',
        phone: '',
        notes: '',
        acceptTerms: false,
        time: '',
        date: '',
    });

    const [errors, setErrors] = useState<FieldErrors>({});

    const update = <K extends keyof ReservationForm>(
        name: K,
        value: ReservationForm[K],
    ): void => {
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const validate = (): FieldErrors => {
        const e: FieldErrors = {};
        if (!form.name.trim()) e.name = 'Ingresa tu nombre.';
        if (!form.date) e.date = 'Elige una fecha.';
        else if (form.date < todayISO()) e.date = 'La fecha no puede ser pasada.';
        if (!form.time) e.time = 'Elige una hora.';
        if (!form.guestsCount) e.guestsCount = 'Indica cuántas personas.';
        if (!form.email && !form.phone) {
            e.email = 'Déjanos email o teléfono.';
            e.phone = 'Déjanos email o teléfono.';
        } else {
            if (form.email && !EMAIL_RE.test(form.email))
                e.email = 'Email inválido.';
            if (form.phone && !PHONE_RE.test(form.phone))
                e.phone = 'Teléfono inválido.';
        }
        if (!form.acceptTerms) e.acceptTerms = 'Debes aceptar los términos.';
        return e;
    };

    const buildWhatsAppUrl = (): string => {
        const lines = [
            `Hola, quiero hacer una reserva en ${siteConfig.name}.`,
            '',
            `Nombre: ${form.name}`,
            `Fecha: ${form.date}`,
            `Hora: ${form.time}`,
            `Personas: ${form.guestsCount}`,
        ];
        if (form.email) lines.push(`Email: ${form.email}`);
        if (form.phone) lines.push(`Teléfono: ${form.phone}`);
        if (form.notes.trim()) {
            lines.push('', 'Notas:', form.notes.trim());
        }
        const text = encodeURIComponent(lines.join('\n'));
        return `https://wa.me/${siteConfig.whatsapp.number}?text=${text}`;
    };

    const handleSubmit = () => {
        const found = validate();
        setErrors(found);
        if (Object.keys(found).length > 0) return;
        window.open(buildWhatsAppUrl(), '_blank', 'noopener,noreferrer');
    };

    return (
        <section className="pt-[108px] pb-10 overflow-hidden md:pb-20 lg:pt-[218px] lg:pb-[120px]">
            <div className="container max-w-[1198px]">
                <ArchWithStar />
                <div className="relative px-4 max-w-[400px] mx-auto lg:max-w-[808px] xl:px-0">
                    <h1 className="text-xl leading-none font-Gloock uppercase text-center mb-10 lg:text-5xl lg:leading-none lg:mb-14">
                        {title}
                    </h1>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit();
                        }}
                        noValidate
                        className="grid grid-cols-2 gap-x-[14px] gap-y-[22px] lg:gap-x-4 lg:gap-y-[30px]"
                    >
                        <FormText
                            value={form.name}
                            label="Nombre"
                            placeholder="Tu nombre completo"
                            error={!!errors.name}
                            errorMessage={errors.name}
                            required
                            className="col-span-2"
                            onChange={(v) => update('name', v)}
                        />
                        <FormText
                            value={form.date}
                            label="Fecha"
                            placeholder="DD/MM/AAAA"
                            type="date"
                            min={todayISO()}
                            error={!!errors.date}
                            errorMessage={errors.date}
                            required
                            onChange={(v) => update('date', v)}
                        />
                        <FormText
                            value={form.time}
                            label="Hora"
                            placeholder="HH:MM"
                            type="time"
                            error={!!errors.time}
                            errorMessage={errors.time}
                            required
                            onChange={(v) => update('time', v)}
                        />
                        <FormText
                            value={form.guestsCount}
                            label="Número de personas"
                            placeholder="¿Cuántos comensales?"
                            type="number"
                            min="1"
                            max="20"
                            error={!!errors.guestsCount}
                            errorMessage={errors.guestsCount}
                            required
                            onChange={(v) => update('guestsCount', v)}
                        />
                        <FormText
                            value={form.email}
                            label="Email"
                            placeholder="tucorreo@ejemplo.com"
                            type="email"
                            error={!!errors.email}
                            errorMessage={errors.email}
                            onChange={(v) => update('email', v)}
                        />
                        <FormText
                            value={form.phone}
                            label="Teléfono"
                            placeholder="+57 300 000 0000"
                            type="tel"
                            error={!!errors.phone}
                            errorMessage={errors.phone}
                            className="col-span-2"
                            onChange={(v) => update('phone', v)}
                        />
                        <FormText
                            value={form.notes}
                            label="Notas (opcional)"
                            placeholder="¿Alergias, ocasión especial, alguna petición?"
                            type="textarea"
                            error={!!errors.notes}
                            errorMessage={errors.notes}
                            className="col-span-2"
                            onChange={(v) => update('notes', v)}
                        />
                        <label className="flex items-start col-span-2 cursor-pointer">
                            <input
                                checked={form.acceptTerms}
                                type="checkbox"
                                className="sr-only peer"
                                onChange={(e) =>
                                    update('acceptTerms', e.target.checked)
                                }
                            />
                            <div
                                className={classNames(
                                    'flex justify-center items-center flex-shrink-0 w-4 h-4 rounded-[3px] border mt-0.5 mr-2 transition-colors duration-300 peer-focus-visible:ring-2 peer-focus-visible:ring-appAccent peer-focus-visible:ring-offset-2 lg:mr-[14px]',
                                    {
                                        'border-appAccent bg-appAccent':
                                            form.acceptTerms,
                                        'border-red-500':
                                            !form.acceptTerms && errors.acceptTerms,
                                        'border-[#A8A7A0]':
                                            !form.acceptTerms && !errors.acceptTerms,
                                    },
                                )}
                                aria-hidden="true"
                            >
                                {form.acceptTerms && (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="w-3 h-3 text-white"
                                    >
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                )}
                            </div>
                            <div className="text-xs leading-[1.2] tracking-[-0.41px] text-[#665E5E] lg:text-base lg:leading-[1.2]">
                                Al enviar este formulario confirmas que has leído
                                y aceptas cómo {siteConfig.name} trata tus datos
                                personales para gestionar la reserva, según
                                nuestra{' '}
                                <a
                                    href="/legal"
                                    className="underline"
                                >
                                    política de privacidad
                                </a>
                                .
                            </div>
                        </label>
                        {errors.acceptTerms && (
                            <div
                                role="alert"
                                className="col-span-2 text-xs text-red-600 -mt-2 lg:text-sm"
                            >
                                {errors.acceptTerms}
                            </div>
                        )}
                        <Btn
                            theme="accent"
                            size="lg"
                            className="justify-center w-full col-span-2"
                            onClick={handleSubmit}
                        >
                            <span>Enviar por WhatsApp</span>
                        </Btn>
                        <p className="col-span-2 text-xs text-center text-appGray-400 -mt-2">
                            Se abrirá WhatsApp con tu solicitud lista para enviar.
                        </p>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ReservationForm;
