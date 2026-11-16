import React, { useState } from 'react';
import FormText from './Text';
import classNames from 'classnames';
import Btn from '../Btn';
import HojasDecor from '../HojasDecor';

interface Props {
    businessName: string;
    /** Número de WhatsApp sin '+', sin espacios. Ej: 573001234567 */
    whatsappNumber: string;
    /** Ubicación dentro del centro comercial; vacío = no se muestra. */
    mallLocation: string;
    /** Apps de domicilios; las URLs vacías no se muestran. */
    delivery: { rappi: string; didi: string };
    /** Hay platos que se piden en verde o maduro: se muestra el selector. */
    plantainChoice: boolean;
}

type Plantain = '' | 'verde' | 'maduro';

const PLANTAIN_OPTIONS: { value: Exclude<Plantain, ''>; label: string; hint: string }[] = [
    { value: 'verde', label: 'Verde', hint: 'Crocante' },
    { value: 'maduro', label: 'Maduro', hint: 'Dulce' },
];

interface OrderForm {
    name: string;
    phone: string;
    order: string;
    pickupTime: string;
    plantain: Plantain;
    notes: string;
    acceptTerms: boolean;
}

type FieldErrors = Partial<Record<keyof OrderForm, string>>;

const PHONE_RE = /^[+()\d\s.-]{6,}$/;

const OrderForm: React.FC<Props> = ({
    businessName,
    whatsappNumber,
    mallLocation,
    delivery,
    plantainChoice,
}) => {
    const [form, setForm] = useState<OrderForm>({
        name: '',
        phone: '',
        order: '',
        pickupTime: '',
        plantain: '',
        notes: '',
        acceptTerms: false,
    });

    const [errors, setErrors] = useState<FieldErrors>({});

    const deliveryApps = [
        { label: 'Pedir en Rappi', href: delivery.rappi },
        { label: 'Pedir en DiDi Food', href: delivery.didi },
    ].filter((app) => !!app.href);

    const update = <K extends keyof OrderForm>(
        name: K,
        value: OrderForm[K],
    ): void => {
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const validate = (): FieldErrors => {
        const e: FieldErrors = {};
        if (!form.name.trim()) e.name = 'Ingresa tu nombre.';
        if (!form.phone) e.phone = 'Déjanos un teléfono de contacto.';
        else if (!PHONE_RE.test(form.phone)) e.phone = 'Teléfono inválido.';
        if (!form.order.trim()) e.order = 'Cuéntanos qué quieres pedir.';
        if (!form.acceptTerms) e.acceptTerms = 'Debes aceptar el tratamiento de datos.';
        return e;
    };

    const buildWhatsAppUrl = (): string => {
        const lines = [
            `Hola, quiero hacer un pedido para recoger en ${businessName}.`,
            '',
            `Nombre: ${form.name}`,
            `Teléfono: ${form.phone}`,
            `Recojo: ${form.pickupTime || 'lo antes posible'}`,
            '',
            'Pedido:',
            form.order.trim(),
        ];
        if (plantainChoice && form.plantain) {
            lines.push('', `Patacón: ${form.plantain}`);
        }
        if (form.notes.trim()) {
            lines.push('', 'Notas:', form.notes.trim());
        }
        const text = encodeURIComponent(lines.join('\n'));
        return `https://wa.me/${whatsappNumber}?text=${text}`;
    };

    const handleSubmit = () => {
        if (!whatsappNumber) return;
        const found = validate();
        setErrors(found);
        if (Object.keys(found).length > 0) return;
        window.open(buildWhatsAppUrl(), '_blank', 'noopener,noreferrer');
    };

    return (
        <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28">
            <div className="container max-w-[1198px]">
                <HojasDecor />
                <div className="relative px-4 max-w-[400px] mx-auto lg:max-w-[808px] xl:px-0">
                    <h1 className="font-display text-[clamp(2.6rem,1.8rem+3vw,4.2rem)] leading-none text-center text-balance [text-shadow:.05em_.05em_0_#F5B41F] mb-6 lg:mb-10">
                        Haz tu pedido
                    </h1>
                    <p className="text-lg leading-snug text-center text-appGray-700 mb-8  lg:mb-12">
                        Pide por WhatsApp y recógelo listo en nuestro local
                        {mallLocation ? ` (${mallLocation})` : ''} del Centro
                        Comercial Plaza Central.
                    </p>
                    {deliveryApps.length > 0 && (
                        <div className="flex flex-col items-center gap-4 mb-10 lg:mb-14">
                            <div className="font-bold text-hoja">
                                ¿Prefieres domicilio?
                            </div>
                            <div className="flex flex-wrap justify-center gap-3">
                                {deliveryApps.map((app) => (
                                    <Btn
                                        key={app.href}
                                        to={app.href}
                                        className=""
                                    >
                                        <span>{app.label}</span>
                                    </Btn>
                                ))}
                            </div>
                        </div>
                    )}
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
                            placeholder="Tu nombre"
                            error={!!errors.name}
                            errorMessage={errors.name}
                            required
                            className="col-span-2"
                            onChange={(v) => update('name', v)}
                        />
                        <FormText
                            value={form.phone}
                            label="Teléfono"
                            placeholder="+57 300 000 0000"
                            type="tel"
                            error={!!errors.phone}
                            errorMessage={errors.phone}
                            required
                            onChange={(v) => update('phone', v)}
                        />
                        <FormText
                            value={form.pickupTime}
                            label="Hora de recogida (opcional)"
                            placeholder="HH:MM"
                            type="time"
                            error={!!errors.pickupTime}
                            errorMessage={errors.pickupTime}
                            onChange={(v) => update('pickupTime', v)}
                        />
                        <FormText
                            value={form.order}
                            label="Tu pedido"
                            placeholder="Platos y cantidades, tal como aparecen en la carta"
                            type="textarea"
                            error={!!errors.order}
                            errorMessage={errors.order}
                            required
                            className="col-span-2"
                            onChange={(v) => update('order', v)}
                        />
                        {plantainChoice && (
                            <fieldset className="order--plantain col-span-2">
                                <legend className="text-xs leading-none tracking-[-0.41px] text-appGray-700 mb-3 lg:text-sm lg:leading-none">
                                    ¿Tu patacón verde o maduro? (opcional)
                                </legend>
                                <div className="grid grid-cols-2 gap-3">
                                    {PLANTAIN_OPTIONS.map((option) => {
                                        const checked = form.plantain === option.value;
                                        return (
                                            <label key={option.value} className="cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="plantain"
                                                    value={option.value}
                                                    checked={checked}
                                                    className="sr-only peer"
                                                    onChange={() => update('plantain', option.value)}
                                                    onClick={() => checked && update('plantain', '')}
                                                />
                                                <span
                                                    className={classNames(
                                                        'flex flex-col items-center justify-center gap-1 min-h-14 px-4 py-3 rounded-[14px] border-3 font-bold transition-colors duration-300 peer-focus-visible:ring-2 peer-focus-visible:ring-appAccent peer-focus-visible:ring-offset-2',
                                                        checked
                                                            ? 'border-monte bg-sol shadow-dura-sm'
                                                            : 'border-monte bg-papel',
                                                    )}
                                                >
                                                    <span className="text-sm leading-none font-medium lg:text-base lg:leading-none">
                                                        {option.label}
                                                    </span>
                                                    <span className="text-xs leading-none opacity-80">
                                                        {option.hint}
                                                    </span>
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                                <p className="text-xs leading-snug text-appGray-400 mt-2">
                                    Si pides varios y los quieres distintos, indícalo en tu pedido.
                                </p>
                            </fieldset>
                        )}
                        <FormText
                            value={form.notes}
                            label="Notas (opcional)"
                            placeholder="¿Alergias o alguna petición?"
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
                                        'border-monte':
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
                                Al enviar este formulario autorizas a{' '}
                                {businessName} a usar tus datos para gestionar
                                tu pedido, según nuestra{' '}
                                <a
                                    href="/privacidad"
                                    className="underline"
                                >
                                    política de tratamiento de datos
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
                        {whatsappNumber ? (
                            <Btn
                                theme="accent"
                                size="lg"
                                className="justify-center w-full col-span-2"
                                onClick={handleSubmit}
                            >
                                <span>Enviar pedido por WhatsApp</span>
                            </Btn>
                        ) : (
                            <p role="status" className="col-span-2 text-sm text-center text-appGray-700">
                                Los pedidos por WhatsApp estarán disponibles muy pronto.
                            </p>
                        )}
                        <p className="col-span-2 text-xs text-center text-appGray-400 -mt-2">
                            Se abrirá WhatsApp con tu pedido listo para enviar.
                            Te confirmamos el total y el tiempo de preparación.
                        </p>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default OrderForm;
