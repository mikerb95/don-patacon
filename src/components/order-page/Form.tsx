import React, { useState } from 'react';
import FormText from './Text';
import classNames from 'classnames';
import Btn from '../Btn';
import ArchWithStar from '../ArchWithStar';

interface Props {
    businessName: string;
    /** Número de WhatsApp sin '+', sin espacios. Ej: 573001234567 */
    whatsappNumber: string;
    /** Ubicación dentro del centro comercial; vacío = no se muestra. */
    mallLocation: string;
    /** Apps de domicilios; las URLs vacías no se muestran. */
    delivery: { rappi: string; didi: string };
}

interface OrderForm {
    name: string;
    phone: string;
    order: string;
    pickupTime: string;
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
}) => {
    const [form, setForm] = useState<OrderForm>({
        name: '',
        phone: '',
        order: '',
        pickupTime: '',
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
        if (form.notes.trim()) {
            lines.push('', 'Notas:', form.notes.trim());
        }
        const text = encodeURIComponent(lines.join('\n'));
        return `https://wa.me/${whatsappNumber}?text=${text}`;
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
                    <h1 className="text-xl leading-none font-Gloock uppercase text-center mb-6 lg:text-5xl lg:leading-none lg:mb-10">
                        Haz tu pedido
                    </h1>
                    <p className="text-sm leading-[1.3] tracking-[-0.41px] uppercase text-center text-appGray-700 mb-8 lg:text-base lg:leading-[1.3] lg:mb-12">
                        Pide por WhatsApp y recógelo listo en nuestro local
                        {mallLocation ? ` (${mallLocation})` : ''} del Centro
                        Comercial Plaza Central.
                    </p>
                    {deliveryApps.length > 0 && (
                        <div className="flex flex-col items-center gap-4 mb-10 lg:mb-14">
                            <div className="text-xs leading-none tracking-[-0.41px] uppercase text-appGray-400 lg:text-sm lg:leading-none">
                                ¿Prefieres domicilio?
                            </div>
                            <div className="flex flex-wrap justify-center gap-3">
                                {deliveryApps.map((app) => (
                                    <Btn
                                        key={app.href}
                                        to={app.href}
                                        className="uppercase"
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
                                Al enviar este formulario autorizas a{' '}
                                {businessName} a usar tus datos para gestionar
                                tu pedido, según nuestra{' '}
                                <a
                                    href="/legal"
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
                        <Btn
                            theme="accent"
                            size="lg"
                            className="justify-center w-full col-span-2"
                            onClick={handleSubmit}
                        >
                            <span>Enviar pedido por WhatsApp</span>
                        </Btn>
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
