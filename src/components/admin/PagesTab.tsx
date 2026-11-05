import React from 'react';
import type { Pages } from '../../lib/schema';
import { Button, Field, ImageField, moveItem } from './ui';

interface Props {
    pages: Pages;
    onChange: (pages: Pages) => void;
    onError: (message: string) => void;
}

const Disclosure: React.FC<{ title: string; open?: boolean; children: React.ReactNode }> = ({ title, open, children }) => (
    <details open={open} className="group py-2">
        <summary className="flex items-center justify-between min-h-12 cursor-pointer font-Gloock text-2xl leading-tight list-none [&::-webkit-details-marker]:hidden">
            {title}
            <span aria-hidden="true" className="text-3xl leading-none font-sans font-light transition-transform group-open:rotate-45">+</span>
        </summary>
        <div className="grid gap-5 pt-3 pb-6">{children}</div>
    </details>
);

function ListEditor<T>({ items, label, addLabel, empty, onChange, blank, render }: {
    items: T[];
    label: (item: T, index: number) => string;
    addLabel: string;
    empty: string;
    onChange: (items: T[]) => void;
    blank: T;
    render: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode;
}) {
    return (
        <div className="grid gap-4">
            {items.length === 0 && <p className="text-appGray-300">{empty}</p>}
            {items.map((item, i) => (
                <div key={i} className="grid gap-4 rounded-2xl bg-[#ECE9DB] p-4">
                    <p className="font-medium">{label(item, i)}</p>
                    {render(item, (patch) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it))))}
                    <div className="flex flex-wrap gap-2">
                        {i > 0 && <Button onClick={() => onChange(moveItem(items, i, -1))}>Subir</Button>}
                        {i < items.length - 1 && <Button onClick={() => onChange(moveItem(items, i, 1))}>Bajar</Button>}
                        <Button kind="danger" onClick={() => onChange(items.filter((_, j) => j !== i))}>Quitar</Button>
                    </div>
                </div>
            ))}
            <Button className="justify-self-start" onClick={() => onChange([...items, blank])}>{addLabel}</Button>
        </div>
    );
}

const PagesTab: React.FC<Props> = ({ pages, onChange, onError }) => {
    const home = pages.home;
    const setHome = (patch: Partial<Pages['home']>) => onChange({ ...pages, home: { ...home, ...patch } });
    const about = pages.about;
    const setAbout = (patch: Partial<Pages['about']>) => onChange({ ...pages, about: { ...about, ...patch } });
    const contact = pages.contact;
    const setContact = (patch: Partial<Pages['contact']>) => onChange({ ...pages, contact: { ...contact, ...patch } });

    return (
        <div>
            <h1 className="font-Gloock text-4xl leading-none mb-3">Páginas</h1>
            <p className="text-appGray-300 mb-4">Las secciones vacías no aparecen en el sitio. Deja una línea en blanco para separar párrafos.</p>
            <div className="divide-y divide-[#DAD7C8]">
                <Disclosure title="Inicio" open>
                    <Field label="Título principal" value={home.heroTitle} maxLength={60} onChange={(heroTitle) => setHome({ heroTitle })} />
                    <ImageField label="Foto principal" value={home.heroImage} onChange={(heroImage) => setHome({ heroImage })} onError={onError} />
                    {home.heroImage === '/media/home-cover.jpg' && (
                        <p className="rounded-2xl bg-[#EADFC9] p-4 leading-snug">Esta foto es de ejemplo y no muestra un plato de Don Patacón. Cámbiala por una tuya antes de abrir el sitio al público.</p>
                    )}
                    <Field label="Presentación" multiline value={home.heroDescription} maxLength={500} onChange={(heroDescription) => setHome({ heroDescription })} />
                    <Field label="Título de la carta" value={home.menuTitle} onChange={(menuTitle) => setHome({ menuTitle })} />
                    <Field label="Texto de la carta" multiline value={home.menuDescription} onChange={(menuDescription) => setHome({ menuDescription })} />
                    <Field label="Título de los especiales" value={home.specialsTitle} onChange={(specialsTitle) => setHome({ specialsTitle })} />
                    <Field label="Texto de los especiales" multiline value={home.specialsDescription} onChange={(specialsDescription) => setHome({ specialsDescription })} />
                </Disclosure>
                <Disclosure title="El lugar (fotos del inicio)">
                    <Field label="Título" value={home.ambienceTitle} onChange={(ambienceTitle) => setHome({ ambienceTitle })} />
                    <Field label="Texto" multiline value={home.ambienceDescription} onChange={(ambienceDescription) => setHome({ ambienceDescription })} />
                    <ListEditor items={home.ambienceItems} addLabel="Agregar foto" empty="Sin fotos, esta sección no aparece." blank={{ text: '', image: '' }}
                        label={(_, i) => `Foto ${i + 1}`} onChange={(ambienceItems) => setHome({ ambienceItems })}
                        render={(item, update) => (<>
                            <ImageField label="Foto" value={item.image} onChange={(image) => update({ image })} onError={onError} />
                            <Field label="Texto sobre la foto" value={item.text} onChange={(text) => update({ text })} />
                        </>)} />
                </Disclosure>
                <Disclosure title="Testimonios">
                    <p className="text-appGray-300">Usa solo opiniones reales de clientes, con su permiso.</p>
                    <Field label="Título" value={home.testimonialsTitle} onChange={(testimonialsTitle) => setHome({ testimonialsTitle })} />
                    <Field label="Texto" multiline value={home.testimonialsDescription} onChange={(testimonialsDescription) => setHome({ testimonialsDescription })} />
                    <ListEditor items={home.testimonials} addLabel="Agregar testimonio" empty="Sin testimonios, esta sección no aparece." blank={{ quote: '', author: '', avatar: '' }}
                        label={(item, i) => item.author || `Testimonio ${i + 1}`} onChange={(testimonials) => setHome({ testimonials })}
                        render={(item, update) => (<>
                            <Field label="Opinión" multiline value={item.quote} onChange={(quote) => update({ quote })} />
                            <Field label="Nombre" value={item.author} onChange={(author) => update({ author })} />
                            <ImageField label="Foto" value={item.avatar} onChange={(avatar) => update({ avatar })} onError={onError} />
                        </>)} />
                </Disclosure>
                <Disclosure title="Nosotros">
                    <Field label="Título, primera línea" value={about.titleTop} onChange={(titleTop) => setAbout({ titleTop })} />
                    <Field label="Título, segunda línea" value={about.titleBottom} onChange={(titleBottom) => setAbout({ titleBottom })} />
                    <Field label="Subtítulo" value={about.subtitle} onChange={(subtitle) => setAbout({ subtitle })} />
                    <ImageField label="Foto principal" value={about.cover} onChange={(cover) => setAbout({ cover })} onError={onError} />
                    <Field label="Historia" multiline rows={5} value={about.description} onChange={(description) => setAbout({ description })} />
                    <ListEditor items={about.blocks} addLabel="Agregar bloque" empty="Puedes contar más con bloques de texto y foto." blank={{ text: '', image: '' }}
                        label={(_, i) => `Bloque ${i + 1}`} onChange={(blocks) => setAbout({ blocks })}
                        render={(item, update) => (<>
                            <Field label="Texto" multiline value={item.text} onChange={(text) => update({ text })} />
                            <ImageField label="Foto" value={item.image} onChange={(image) => update({ image })} onError={onError} />
                        </>)} />
                </Disclosure>
                <Disclosure title="Contacto">
                    <Field label="Título" value={contact.title} onChange={(title) => setContact({ title })} />
                    <Field label="Texto" multiline value={contact.description} onChange={(description) => setContact({ description })} />
                    <Field label="Cómo llegar" multiline rows={4} value={contact.howToArrive} hint="Parqueadero, TransMilenio, entrada más cercana." onChange={(howToArrive) => setContact({ howToArrive })} />
                </Disclosure>
                <Disclosure title="Términos y condiciones">
                    <ListEditor items={pages.legal.sections} addLabel="Agregar sección" empty="Sin secciones, el sitio no enlaza esta página." blank={{ title: '', body: '' }}
                        label={(item, i) => item.title || `Sección ${i + 1}`} onChange={(sections) => onChange({ ...pages, legal: { sections } })}
                        render={(item, update) => (<>
                            <Field label="Título" value={item.title} onChange={(title) => update({ title })} />
                            <Field label="Texto" multiline rows={6} value={item.body} onChange={(body) => update({ body })} />
                        </>)} />
                </Disclosure>
            </div>
        </div>
    );
};

export default PagesTab;
