import React, { useMemo, useState } from 'react';
import type { Category, Day, Dish, Menu } from '../../lib/schema';
import { DAYS } from '../../lib/schema';
import { Button, Field, ImageField, moveItem, previews, Sheet, Toggle, uniqueId } from './ui';

const DAY_LABELS: Record<Day, string> = {
    MON: 'Lun', TUE: 'Mar', WED: 'Mié', THU: 'Jue', FRI: 'Vie', SAT: 'Sáb', SUN: 'Dom',
};

const money = new Intl.NumberFormat('es-CO');

interface Props {
    menu: Menu;
    onChange: (menu: Menu) => void;
    onError: (message: string) => void;
}

/** Precio editable en la fila: se escribe "32000" y se lee "32.000". */
const PriceInput: React.FC<{ value: number; label: string; onChange: (v: number) => void }> = ({ value, label, onChange }) => (
    <label className="flex items-baseline gap-0.5 font-Gloock text-xl">
        <span aria-hidden="true">$</span>
        <span className="sr-only">{label}</span>
        <input
            inputMode="numeric"
            value={value ? money.format(value) : ''}
            placeholder="0"
            onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
                onChange(digits ? Number(digits) : 0);
            }}
            className="w-[5.5ch] min-h-11 bg-transparent text-right rounded-lg focus:bg-white placeholder:text-[#8E3B2A]"
        />
    </label>
);

const MenuTab: React.FC<Props> = ({ menu, onChange, onError }) => {
    const [activeId, setActiveId] = useState(menu.categories[0]?.id ?? '');
    const [query, setQuery] = useState('');
    const [editingDish, setEditingDish] = useState<string | null>(null);
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const q = query.trim().toLowerCase();
    const visible = useMemo(
        () => menu.dishes.filter((d) => (q ? d.title.toLowerCase().includes(q) : d.categoryId === activeId)),
        [menu.dishes, activeId, q],
    );

    const patchDish = (id: string, patch: Partial<Dish>) =>
        onChange({ ...menu, dishes: menu.dishes.map((d) => (d.id === id ? { ...d, ...patch } : d)) });
    const patchCategory = (id: string, patch: Partial<Category>) =>
        onChange({ ...menu, categories: menu.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) });

    const addDish = () => {
        const id = uniqueId('plato-nuevo', menu.dishes.map((d) => d.id));
        onChange({
            ...menu,
            dishes: [...menu.dishes, {
                id, title: '', description: '', price: 0, image: '', categoryId: activeId, available: true, specialDays: [],
            }],
        });
        setQuery('');
        setConfirmDelete(false);
        setEditingDish(id);
    };

    const addCategory = () => {
        const id = uniqueId('categoria-nueva', menu.categories.map((c) => c.id));
        onChange({ ...menu, categories: [...menu.categories, { id, title: '', description: '', image: '' }] });
        setActiveId(id);
        setConfirmDelete(false);
        setEditingCategory(id);
    };

    const dish = menu.dishes.find((d) => d.id === editingDish);
    const category = menu.categories.find((c) => c.id === editingCategory);
    const dishCount = (id: string) => menu.dishes.filter((d) => d.categoryId === id).length;

    const moveDish = (id: string, delta: number) => {
        const siblings = menu.dishes.filter((d) => d.categoryId === activeId || d.id === id);
        const index = siblings.findIndex((d) => d.id === id);
        const neighbor = siblings[index + delta];
        if (!neighbor) return;
        const from = menu.dishes.findIndex((d) => d.id === id);
        const to = menu.dishes.findIndex((d) => d.id === neighbor.id);
        onChange({ ...menu, dishes: moveItem(menu.dishes, from, to - from) });
    };

    return (
        <section aria-label="Carta">
            <div className="flex items-end justify-between gap-3 mb-4">
                <h1 className="font-Gloock text-4xl leading-none">Carta</h1>
                <Button kind="primary" onClick={addDish} disabled={menu.categories.length === 0}>Agregar plato</Button>
            </div>

            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar un plato" aria-label="Buscar un plato"
                className="w-full min-h-12 px-3.5 rounded-xl bg-white border border-[#CFCCBF] text-base mb-3" />

            {!q && (
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 mb-2">
                    {menu.categories.map((c) => (
                        <button key={c.id} type="button" aria-pressed={c.id === activeId} onClick={() => setActiveId(c.id)}
                            className={`shrink-0 min-h-11 px-4 rounded-full font-medium transition-colors ${c.id === activeId ? 'bg-appText text-white' : 'bg-[#E5E2D4]'}`}>
                            {c.title || 'Sin nombre'} <span className="opacity-70 font-normal">{dishCount(c.id)}</span>
                        </button>
                    ))}
                    <button type="button" onClick={addCategory} className="shrink-0 min-h-11 px-4 rounded-full font-medium border border-dashed border-appGray-300">
                        Nueva categoría
                    </button>
                </div>
            )}

            {!q && menu.categories.some((c) => c.id === activeId) && (
                <button type="button" onClick={() => { setConfirmDelete(false); setEditingCategory(activeId); }}
                    className="min-h-11 text-[#6B5533] font-medium underline underline-offset-4 mb-2">
                    Editar esta categoría
                </button>
            )}

            {visible.length === 0 ? (
                <div className="py-12 text-center">
                    <p className="font-Gloock text-2xl mb-2">{q ? 'Ningún plato con ese nombre' : 'Aún no hay platos aquí'}</p>
                    {!q && <p className="text-appGray-300 mb-5">Agrega el primero con su nombre y su precio. La foto es opcional.</p>}
                    {!q && menu.categories.length > 0 && <Button kind="primary" onClick={addDish}>Agregar plato</Button>}
                </div>
            ) : (
                <ul className="divide-y divide-[#DAD7C8]">
                    {visible.map((d) => (
                        <li key={d.id} className={`flex items-center gap-2 py-3 ${d.available ? '' : 'opacity-60'}`}>
                            <button type="button" onClick={() => { setConfirmDelete(false); setEditingDish(d.id); }} className="flex flex-1 min-w-0 items-center gap-2.5 text-left rounded-lg min-h-11">
                                <span className="w-11 h-11 shrink-0 rounded-lg overflow-hidden bg-[#E5E2D4]">
                                    {d.image && <img src={previews.get(d.image) ?? d.image} alt="" className="w-full h-full object-cover" />}
                                </span>
                                <span className="min-w-0">
                                    <span className="block font-medium leading-snug line-clamp-2">{d.title || 'Plato sin nombre'}</span>
                                    <span className="block text-sm leading-snug text-appGray-300 truncate">
                                        {!d.available ? 'Agotado' : d.specialDays.length > 0 ? `Especial: ${d.specialDays.map((x) => DAY_LABELS[x]).join(', ')}` : 'Editar'}
                                    </span>
                                </span>
                            </button>
                            <PriceInput value={d.price} label={`Precio de ${d.title}`} onChange={(price) => patchDish(d.id, { price })} />
                            <Toggle checked={d.available} label={`${d.title} disponible`} onChange={(available) => patchDish(d.id, { available })} />
                        </li>
                    ))}
                </ul>
            )}

            {dish && (
                <Sheet title={dish.title || 'Plato nuevo'} onClose={() => setEditingDish(null)}>
                    <Field label="Nombre" value={dish.title} maxLength={100} onChange={(title) => patchDish(dish.id, { title })} />
                    <Field label="Precio en pesos" inputMode="numeric" value={dish.price ? String(dish.price) : ''}
                        onChange={(v) => patchDish(dish.id, { price: Number(v.replace(/\D/g, '').slice(0, 8)) })} />
                    <Field label="Descripción" multiline value={dish.description} maxLength={600} onChange={(description) => patchDish(dish.id, { description })} />
                    <ImageField label="Foto" value={dish.image} onChange={(image) => patchDish(dish.id, { image })} onError={onError} />
                    <div className="grid gap-1.5">
                        <label htmlFor="dish-category" className="font-medium">Categoría</label>
                        <select id="dish-category" value={dish.categoryId} onChange={(e) => patchDish(dish.id, { categoryId: e.target.value })}
                            className="min-h-12 px-3 rounded-xl bg-white border border-[#CFCCBF] text-base">
                            {menu.categories.map((c) => <option key={c.id} value={c.id}>{c.title || 'Sin nombre'}</option>)}
                        </select>
                    </div>
                    <Toggle checked={dish.available} label="Disponible hoy" showLabel onChange={(available) => patchDish(dish.id, { available })} />
                    <fieldset className="grid gap-2">
                        <legend className="font-medium mb-2">Especial del día</legend>
                        <div className="flex flex-wrap gap-2">
                            {DAYS.map((day) => {
                                const on = dish.specialDays.includes(day);
                                return (
                                    <button key={day} type="button" aria-pressed={on}
                                        onClick={() => patchDish(dish.id, {
                                            specialDays: on ? dish.specialDays.filter((x) => x !== day) : DAYS.filter((x) => x === day || dish.specialDays.includes(x)),
                                        })}
                                        className={`w-12 h-11 rounded-xl font-medium ${on ? 'bg-appText text-white' : 'bg-[#E5E2D4]'}`}>
                                        {DAY_LABELS[day]}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-sm text-appGray-300">Aparece en el inicio del sitio los días marcados.</p>
                    </fieldset>
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={() => moveDish(dish.id, -1)}>Subir en la carta</Button>
                        <Button onClick={() => moveDish(dish.id, 1)}>Bajar en la carta</Button>
                    </div>
                    <Button kind="danger" onClick={() => {
                        if (!confirmDelete) return setConfirmDelete(true);
                        onChange({ ...menu, dishes: menu.dishes.filter((d) => d.id !== dish.id) });
                        setEditingDish(null);
                    }}>
                        {confirmDelete ? 'Toca otra vez para eliminar' : 'Eliminar plato'}
                    </Button>
                </Sheet>
            )}

            {category && (
                <Sheet title={category.title || 'Categoría nueva'} onClose={() => setEditingCategory(null)}>
                    <Field label="Nombre" value={category.title} maxLength={60} onChange={(title) => patchCategory(category.id, { title })} />
                    <Field label="Descripción" multiline value={category.description} maxLength={400} onChange={(description) => patchCategory(category.id, { description })} />
                    <ImageField label="Foto de la categoría" value={category.image} onChange={(image) => patchCategory(category.id, { image })} onError={onError} />
                    <div className="flex flex-wrap gap-2">
                        {(['Mover a la izquierda', 'Mover a la derecha'] as const).map((label, i) => (
                            <Button key={label} onClick={() => onChange({
                                ...menu,
                                categories: moveItem(menu.categories, menu.categories.findIndex((c) => c.id === category.id), i === 0 ? -1 : 1),
                            })}>{label}</Button>
                        ))}
                    </div>
                    {dishCount(category.id) > 0 ? (
                        <p className="text-sm text-appGray-300">Para eliminar esta categoría, primero mueve o elimina sus {dishCount(category.id)} platos.</p>
                    ) : (
                        <Button kind="danger" onClick={() => {
                            if (!confirmDelete) return setConfirmDelete(true);
                            const rest = menu.categories.filter((c) => c.id !== category.id);
                            onChange({ ...menu, categories: rest });
                            setActiveId(rest[0]?.id ?? '');
                            setEditingCategory(null);
                        }}>
                            {confirmDelete ? 'Toca otra vez para eliminar' : 'Eliminar categoría'}
                        </Button>
                    )}
                </Sheet>
            )}
        </section>
    );
};

export default MenuTab;
